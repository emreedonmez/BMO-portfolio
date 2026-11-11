const screen=document.querySelector('#screen');
// Original, grid-aligned pixel glyphs. No remote icon or runtime dependencies.
const paths=['M6 1h4v1h2v5h-2v2H6V7H4V2h2zm0 2v3h4V3zM3 10h10v2h2v4h-2v-4H3v4H1v-4h2z','M1 3h5V1h5v2h4v12H1zm2 2v8h10V5zm5-2h1V2H8z','M3 0h7v2h3v14H3zm2 2v12h6V4H8V2zm1 5h4v1H6zm0 3h4v1H6z','M1 1h3v3H1zm0 5h3v9H1zm5 0h3v1h2V6h2v1h2v8h-3V9H9v6H6z','M2 1h3v2h6V1h3v4h1v6h-3v2h-2v3H6v-3H4v-2H1V5h1zm2 5v3h2V6zm6 0v3h2V6z','M3 3h10v2h2v8h-4v-2H5v2H1V5h2zm1 3v2H2v1h2v2h1V9h2V8H5V6zm6 1v2h2V7z'];
const labels=['My About','Projects','My Resume','My Linkedin','My Github','Little Arcade'];
const descriptions=['Meet the person behind the pixels.','A collection of things I have built.','My experience, skills & journey.',"Let's connect professionally.",'Explore my code & experiments.','A tiny game. A little break.'];
const icon=i=>`<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${paths[i]}"/></svg>`;
let mode='boot',selected=0,sound=true,audio,bootTimers=[],timer=null,snake,food,dir,nextDir,score,playing=false,ended=false;
// Sound defaults on; browser autoplay restrictions are respected until user activation.
const melodies={move:[[330,.025]],select:[[523,.055],[784,.08]],back:[[440,.055],[294,.07]],home:[[523,.05],[659,.05],[784,.1]],on:[[392,.06],[523,.06],[659,.06],[1047,.13]],theme:[[587,.07],[880,.12]],start:[[392,.06],[523,.06],[784,.12]],pause:[[494,.07],[370,.1]],collect:[[880,.04],[1175,.08]],over:[[392,.08],[330,.08],[196,.18]],win:[[523,.07],[659,.07],[784,.07],[1047,.2]]};
let master,audioResumePending=false;
function cue(name='move'){
 if(!sound)return;
 try{
  audio??=new(window.AudioContext||window.webkitAudioContext)();
  if(audio.state!=='running'){
   const resume=audio.resume();
   if(!audioResumePending){audioResumePending=true;resume.then(()=>{audioResumePending=false;if(audio.state==='running'&&sound)cue('on')}).catch(()=>{audioResumePending=false})}
   else resume.catch(()=>{});
   return;
  }
  if(!master){master=audio.createGain();master.gain.value=.6;master.connect(audio.destination)}
  let time=audio.currentTime;
  (melodies[name]||melodies.move).forEach(([frequency,duration],i)=>{
   const oscillator=audio.createOscillator(),gain=audio.createGain();
   oscillator.type=i%2?'triangle':'square';oscillator.frequency.setValueAtTime(frequency,time);
   gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(.035,time+.004);
   gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
   oscillator.connect(gain);gain.connect(master);oscillator.start(time);oscillator.stop(time+duration+.01);
   oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};time+=duration+.015;
  });
 }catch{}
}
function beep(f=440){cue(f===880?'collect':f===660?'select':'move')}
function fitConsole(){const scale=Math.max(.42,Math.min(1.22,(window.innerWidth-24)/420,(window.innerHeight-64)/710));document.documentElement.style.setProperty('--console-scale',scale)}
fitConsole();window.addEventListener('resize',fitConsole);
const themeButton=document.querySelector('#theme');
function setTheme(dark){document.body.classList.toggle('dark',dark);themeButton.setAttribute('aria-pressed',String(dark));themeButton.setAttribute('aria-label',dark?'Karanlık modu kapat':'Karanlık modu aç');document.querySelector('meta[name="theme-color"]').content=dark?'#15171c':'#e9e6df'}
try{setTheme(localStorage.getItem('pocket-theme')==='dark')}catch{}
themeButton.onclick=()=>{const dark=!document.body.classList.contains('dark');setTheme(dark);try{localStorage.setItem('pocket-theme',dark?'dark':'light')}catch{}cue('theme')};
const destinations={3:{name:'LinkedIn',question:'Would you like to visit my LinkedIn profile?',url:'https://www.linkedin.com/in/emreedonmez/',display:'linkedin.com/in/emreedonmez'},4:{name:'GitHub',question:'Would you like to visit my GitHub profile?',url:'https://github.com/emreedonmez',display:'github.com/emreedonmez'}};
let confirmChoice=0;
function showLinkConfirmation(){
 mode='confirm';confirmChoice=0;const target=destinations[selected];
 screen.innerHTML=status()+`<div class="detail link-confirm" lang="en">${icon(selected)}<h1>My ${target.name}</h1><p>${target.question}</p><div class="confirm-actions"><button class="screen-button selected" data-choice="0">NO</button><button class="screen-button" data-choice="1">YES</button></div><span class="destination">${target.display}<br>Opens with your confirmation.</span></div><div class="screen-footer"><span>← → CHOOSE · A CONFIRM</span><span>B BACK</span></div>`;
 screen.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{confirmChoice=+button.dataset.choice;confirmLink()});
}
function paintChoice(){screen.querySelectorAll('[data-choice]').forEach(button=>{button.classList.toggle('selected',+button.dataset.choice===confirmChoice);button.setAttribute('aria-pressed',String(+button.dataset.choice===confirmChoice))})}
function confirmLink(){if(confirmChoice===1){cue('select');window.location.assign(destinations[selected].url)}else cue('back');home()}

const status=()=>'<div class="status"><span>POCKET OS</span><span>♥ <i class="battery"></i></span></div>';
function home(){bootTimers.forEach(clearTimeout);clearInterval(timer);playing=false;mode='menu';screen.innerHTML=status()+`<div class="intro"><div><h1 id="section-description">${descriptions[selected]}</h1></div><span class="mini-face">•ᴗ•</span></div><nav class="menu" aria-label="Portfolio">${labels.map((l,i)=>`<button data-index="${i}" class="${selected===i?'selected':''}" aria-current="${selected===i?'true':'false'}">${icon(i)}<span>${l}</span><span class="arrow">${selected===i?'›':''}</span></button>`).join('')}</nav><div class="screen-footer"><span>↑↓ MOVE · A SELECT</span><span>${String(selected+1).padStart(2,'0')} / 06</span></div>`;screen.querySelectorAll('[data-index]').forEach(b=>{b.onclick=()=>{selected=+b.dataset.index;openItem()};b.onpointerenter=e=>{if(e.pointerType==='mouse')selectMenu(+b.dataset.index)};b.onfocus=()=>selectMenu(+b.dataset.index)})}
function selectMenu(index){if(mode!=='menu'||selected===index)return;selected=index;document.querySelector('#section-description').textContent=descriptions[selected];screen.querySelectorAll('[data-index]').forEach(button=>{const active=+button.dataset.index===selected;button.classList.toggle('selected',active);button.setAttribute('aria-current',String(active));button.querySelector('.arrow').textContent=active?'›':''});screen.querySelector('.screen-footer').lastElementChild.textContent=`${String(selected+1).padStart(2,'0')} / 06`}
function showAbout(){
 mode='about';
 screen.innerHTML=status()+`<article class="about-page" tabindex="0" aria-label="About Emre"><h1>Hey, I'm Emre! <span>👋</span></h1><p>I'm a passionate developer who enjoys turning creative ideas into real, interactive projects.</p><p>I work with <strong>Flutter, C, C#, and Python</strong>, exploring different areas of software development and constantly improving my skills.</p><p>I love experimenting with new technologies, solving problems, and bringing my ideas to life through code.</p><p class="about-motto"><strong>Always learning.<br>Always creating.<br>Always improving.</strong></p><p class="about-contact"><strong>Contacts:</strong><br><a href="mailto:mail@emreedonmez.com">mail@emreedonmez.com</a></p><ul class="about-skills" aria-label="Skills"><li>Flutter</li><li>C</li><li>C#</li><li>Python</li></ul></article><div class="screen-footer"><span>↑↓ SCROLL</span><button class="about-back" onclick="action('back')">B BACK</button></div>`;
}
function openItem(){beep(660);if(selected===0){showAbout();return}if(selected===5){game();return}if(destinations[selected]){showLinkConfirmation();return}mode='detail';screen.innerHTML=status()+`<div class="detail">${icon(selected)}<h1>${labels[selected]}</h1><p>Coming soon.<br>A new story goes here.</p><button class="screen-button" id="return">← BACK</button></div><div class="screen-footer"><span>B BACK · ESC HOME</span><span>UNDER CONSTRUCTION</span></div>`;document.querySelector('#return').onclick=home}
function action(key){if(key==='home'){cue('home');home();return}if(mode==='boot')return;if(key==='back'){cue('back');home();return}if(mode==='about'){const page=screen.querySelector('.about-page');if(key==='up'||key==='left')page.scrollBy(0,-60);else if(key==='down'||key==='right')page.scrollBy(0,60);return}if(mode==='confirm'){if(key==='confirm'){confirmLink();return}if(['up','down','left','right'].includes(key)){confirmChoice=1-confirmChoice;paintChoice();cue('move')}return}if(key!=='confirm')cue('move');if(mode==='menu'){if(key==='up'||key==='left')selected=(selected+5)%6;else if(key==='down'||key==='right')selected=(selected+1)%6;else if(key==='confirm'){openItem();return}home()}else if(mode==='game'){if(key==='confirm'){if(!playing){if(ended)game();startGame()}else{playing=false;clearInterval(timer);cue('pause');overlay('PAUSED','A / ENTER TO CONTINUE')}return}const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};if(dirs[key]&&!(dirs[key][0]===-dir[0]&&dirs[key][1]===-dir[1]))nextDir=dirs[key]}}
document.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>action(b.dataset.key));
document.addEventListener('keydown',e=>{const keys={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'confirm',' ':'confirm',Escape:'back',Backspace:'back',a:'confirm',b:'back'};if(!keys[e.key]||e.altKey||e.ctrlKey||e.metaKey||['sound','theme'].includes(e.target.id)||(e.target.tagName==='BUTTON'&&(e.key==='Enter'||e.key===' ')))return;e.preventDefault();action(keys[e.key]);const button=document.querySelector(`[data-key="${keys[e.key]}"]`);button?.classList.add('pressed');setTimeout(()=>button?.classList.remove('pressed'),100)});
document.querySelector('#sound').onclick=e=>{sound=!sound;if(master)master.gain.setValueAtTime(sound ? .6 : 0,audio.currentTime);e.currentTarget.setAttribute('aria-pressed',sound);e.currentTarget.setAttribute('aria-label',sound?'Mute sound':'Enable sound');e.currentTarget.style.background=sound?'#8a4660':'';cue('on')};
function overlay(title,subtitle){screen.querySelector('.game-message')?.remove();const el=document.createElement('div');el.className='game-message';el.innerHTML=`<span>${title}</span><p>${subtitle}</p><button class="screen-button">${ended?'PLAY AGAIN':playing?'PLAY':'START / RESUME'}</button>`;el.querySelector('button').onclick=()=>action('confirm');screen.append(el)}
function game(){clearInterval(timer);mode='game';snake=[[5,5],[4,5],[3,5]];dir=[1,0];nextDir=[1,0];score=0;playing=false;ended=false;food=[9,5];screen.innerHTML='<div class="game-header"><span>POCKET SNAKE</span><span id="score">00</span></div><canvas class="game-board" width="120" height="100" aria-label="Snake game board"></canvas><div class="game-touch" aria-label="Swipe to steer"></div><div class="screen-footer"><span>↑↓←→ STEER · A PAUSE</span><span>B EXIT</span></div>';draw();overlay('POCKET SNAKE','A LITTLE BREAK?<br>COLLECT PIXELS. GROW HAPPY.');let start;const touch=screen.querySelector('.game-touch');touch.onpointerdown=e=>{start=[e.clientX,e.clientY];touch.setPointerCapture(e.pointerId)};touch.onpointerup=e=>{if(!start)return;const x=e.clientX-start[0],y=e.clientY-start[1];if(Math.max(Math.abs(x),Math.abs(y))>10)action(Math.abs(x)>Math.abs(y)?x>0?'right':'left':y>0?'down':'up');start=null}}
function startGame(){cue('start');screen.querySelector('.game-message')?.remove();playing=true;clearInterval(timer);timer=setInterval(tick,165)}
function draw(){const c=screen.querySelector('canvas').getContext('2d');c.fillStyle='#b9c982';c.fillRect(0,0,120,100);c.fillStyle='#34452e';snake.forEach(([x,y])=>c.fillRect(x*10+1,y*10+1,8,8));c.fillRect(food[0]*10+3,food[1]*10+1,4,8);c.fillRect(food[0]*10+1,food[1]*10+3,8,4);document.querySelector('#score').textContent=String(score).padStart(2,'0')}
function tick(){dir=nextDir;const head=[snake[0][0]+dir[0],snake[0][1]+dir[1]],eat=head[0]===food[0]&&head[1]===food[1];if(head[0]<0||head[0]>=12||head[1]<0||head[1]>=10||(eat?snake:snake.slice(0,-1)).some(p=>p[0]===head[0]&&p[1]===head[1])){clearInterval(timer);playing=false;ended=true;cue('over');overlay('NICE RUN!',`SCORE ${score} · TRY ANOTHER ROUND?`);return}snake.unshift(head);if(eat){score++;beep(880);const free=[];for(let x=0;x<12;x++)for(let y=0;y<10;y++)if(!snake.some(p=>p[0]===x&&p[1]===y))free.push([x,y]);if(!free.length){clearInterval(timer);playing=false;ended=true;cue('win');overlay('YOU WIN!','THE WHOLE POCKET IS YOURS.');return}food=free[Math.floor(Math.random()*free.length)]}else snake.pop();draw()}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='game'&&playing){playing=false;clearInterval(timer);cue('pause');overlay('PAUSED','A / ENTER TO CONTINUE')}});
screen.innerHTML='<div class="boot"><div class="face"><i class="eye"></i><i class="eye"></i><span class="zzz">zZ</span></div><p>JUST A LITTLE NAP...</p></div>';
bootTimers.push(setTimeout(()=>{screen.innerHTML='<div class="boot"><span class="hello">hello<span style="font-size:18px">!</span></span><p>WELCOME TO MY LITTLE WORLD</p></div>'},1000));bootTimers.push(setTimeout(home,2400));

// Try the boot chime once; if autoplay is blocked, unlock on a real gesture.
let audioUnlocked=false;
function unlockAudio(event){
 if(audioUnlocked||!sound||event?.target?.closest?.('#sound'))return;
 if(audio?.state==='running'){audioUnlocked=true;return}
 cue('on');
}
document.addEventListener('pointerdown',unlockAudio,{capture:true});
document.addEventListener('keydown',unlockAudio,{capture:true});
cue('on');
