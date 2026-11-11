import './style.css';
import * as T from 'three';
import {CSS3DRenderer,CSS3DObject} from 'three/addons/renderers/CSS3DRenderer.js';
import {createBMO} from './scene.js';
import {roomAnchor} from './bmo-layout.js';
import {createPortfolio} from './portfolio.js';

const $=s=>document.querySelector(s),screen=$('#portfolio'),art=$('#room-art');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,cssRenderer,scene,camera,bmo,frame=0,transition=null,focused=false;
let sound=false,audio,dirty=true,pressed=null,pressUntil=0,blink=false;
const look=new T.Vector3(),offset=new T.Vector2();
let roomPose,closePose,progress=0;

function cue(type){
 if(!sound)return;
 try{audio??=new AudioContext();if(audio.state==='suspended')audio.resume();
  let at=audio.currentTime;const notes={move:[330],select:[523,784],back:[440,294],enter:[392,523,784],sound:[659,880]};
  for(const hz of notes[type]||notes.move){const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=hz;g.gain.setValueAtTime(.035,at);g.gain.exponentialRampToValueAtTime(.0001,at+.09);o.connect(g);g.connect(audio.destination);o.start(at);o.stop(at+.1);o.onended=()=>{o.disconnect();g.disconnect()};at+=.1}
 }catch{}
}
function toggleSound(){sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').setAttribute('aria-label',sound?'Mute sound':'Enable sound');$('.sound-label').textContent=sound?' Sound on':' Sound off';cue('sound')}
const portfolio=createPortfolio(screen,{onRoom:()=>setView(false),onSound:toggleSound,onCue:cue});

function views(){
 const anchor=roomAnchor(innerWidth,innerHeight),aspect=innerWidth/innerHeight;
 const nearDistance=Math.max(6.15,2.55/(2*Math.tan(T.MathUtils.degToRad(21))*aspect)+.59);
 roomPose={position:new T.Vector3(-5.5,6.5,23),look:new T.Vector3(0,1.62,.28),offset:new T.Vector2(innerWidth/2-anchor.x,innerHeight/2-anchor.y)};
 closePose={position:new T.Vector3(0,1.85,nearDistance),look:new T.Vector3(0,1.85,0),offset:new T.Vector2()};
 art.style.transformOrigin=`${anchor.x}px ${anchor.y}px`;
 document.documentElement.style.setProperty('--entry-x',`${anchor.x}px`);
 document.documentElement.style.setProperty('--entry-y',`${Math.min(innerHeight-55,anchor.y+innerHeight*.135)}px`);
}
function applyPose(){
 camera.lookAt(look);camera.setViewOffset(innerWidth,innerHeight,offset.x,offset.y,innerWidth,innerHeight);camera.updateMatrixWorld();
 art.style.transform=`scale(${1+progress*.55})`;
}
function paint(){applyPose();renderer.render(scene,camera);cssRenderer.render(scene,camera);dirty=false}
function visibility(){
 document.body.classList.toggle('focused',focused);
 $('#room-return').hidden=!focused;$('.control-guide').hidden=!focused;$('.accessible-controls').hidden=!focused;
 $('#welcome').hidden=focused;screen.setAttribute('aria-hidden',String(!focused));
 if(bmo)bmo.face.visible=!focused;
}
function finishTransition(){
 transition=null;document.body.classList.remove('transitioning');screen.inert=false;
 if(focused)screen.focus({preventScroll:true});else $('#enter').focus({preventScroll:true});
}
function setView(value,instant=false){
 if(!renderer){focused=true;visibility();return}
 if(focused===value&&!instant)return;
 focused=value;visibility();cue(value?'enter':'back');if(value)portfolio.menu();
 const to=value?closePose:roomPose;
 const duration=reduce.matches||instant?0:1250;
 if(duration){
  transition={start:performance.now(),duration,fromPosition:camera.position.clone(),fromLook:look.clone(),fromOffset:offset.clone(),fromProgress:progress,to,toProgress:value?1:0};
  document.body.classList.add('transitioning');screen.inert=true;
 }else{camera.position.copy(to.position);look.copy(to.look);offset.copy(to.offset);progress=value?1:0;finishTransition()}
 dirty=true;paint();
}
$('#enter').onclick=()=>setView(true);$('#room-return').onclick=()=>setView(false);$('#sound').onclick=toggleSound;
$('.skip').onclick=e=>{e.preventDefault();setView(true,true)};
document.querySelectorAll('[data-control]').forEach(b=>b.onclick=()=>portfolio.action(b.dataset.control));
document.addEventListener('keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey||['INPUT','TEXTAREA'].includes(e.target.tagName))return;
 const key={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'confirm',Escape:'back',Backspace:'back'}[e.key];if(!key)return;
 if(!focused){if(e.key==='Enter'&&e.target===document.body){e.preventDefault();setView(true)}return}
 if(e.key==='Enter'&&e.target.closest('button,a'))return;
 e.preventDefault();if(transition&&key!=='back')return;portfolio.action(key);
});
function fallback(error){
 console.warn('3D character unavailable:',error);cancelAnimationFrame(frame);renderer?.domElement.remove();cssRenderer?.domElement.remove();renderer=null;
 $('#fallback').hidden=false;$('#fallback-content').append(screen);document.body.classList.add('fallback-mode','ready');focused=true;visibility();
 $('#room-return').hidden=true;$('.control-guide').hidden=true;$('.accessible-controls').hidden=true;$('#loading').hidden=true;
}

try{
 await Promise.all([art.decode(),document.fonts.ready]);
 scene=new T.Scene();
 camera=new T.PerspectiveCamera(42,innerWidth/innerHeight,.1,80);
 renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NoToneMapping;
 $('#world').append(renderer.domElement);
 cssRenderer=new CSS3DRenderer();cssRenderer.setSize(innerWidth,innerHeight);cssRenderer.domElement.className='css3d-layer';$('#world').append(cssRenderer.domElement);
 bmo=createBMO(scene);
 const lcd=new CSS3DObject(screen);lcd.position.copy(bmo.screenPosition);lcd.scale.setScalar(bmo.screenWidth/640);scene.add(lcd);
 views();camera.position.copy(roomPose.position);look.copy(roomPose.look);offset.copy(roomPose.offset);visibility();paint();

 const raycaster=new T.Raycaster(),pointer=new T.Vector2();let pointerDown=null;
 function hit(e){pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObject(bmo.group,true).find(h=>!h.object.userData.outline&&!h.object.userData.shadow)}
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.button===0)pointerDown={x:e.clientX,y:e.clientY}});
 renderer.domElement.addEventListener('pointercancel',()=>pointerDown=null);
 renderer.domElement.addEventListener('pointerup',e=>{
  const start=pointerDown;pointerDown=null;if(!start||Math.hypot(e.clientX-start.x,e.clientY-start.y)>10||transition)return;
  const h=hit(e);if(!h)return;
  if(!focused){setView(true);return}
  let obj=h.object;while(obj&&!obj.userData.action)obj=obj.parent;
  let action=obj?.userData.action;if(!action||action==='enter')return;
  if(action==='dpad'){const p=obj.worldToLocal(h.point.clone());action=Math.abs(p.x)>Math.abs(p.y)?p.x>0?'right':'left':p.y>0?'up':'down'}
  portfolio.action(action);if(pressed)bmo.setPressed(pressed,false);pressed=obj;bmo.setPressed(pressed,true);pressUntil=performance.now()+125;dirty=true;
 });
 renderer.domElement.addEventListener('pointermove',e=>{renderer.domElement.style.cursor=hit(e)?'pointer':'default'});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback(new Error('WebGL context lost'))});
 addEventListener('resize',()=>{
  if(!renderer)return;camera.aspect=innerWidth/innerHeight;views();renderer.setSize(innerWidth,innerHeight);cssRenderer.setSize(innerWidth,innerHeight);
  const to=focused?closePose:roomPose;camera.position.copy(to.position);look.copy(to.look);offset.copy(to.offset);progress=focused?1:0;finishTransition();dirty=true;paint();
 });
 function tick(now){
  frame=requestAnimationFrame(tick);if(document.hidden)return;
  if(transition){const t=Math.min(1,(now-transition.start)/transition.duration),e=t*t*(3-2*t);
   camera.position.lerpVectors(transition.fromPosition,transition.to.position,e);look.lerpVectors(transition.fromLook,transition.to.look,e);offset.lerpVectors(transition.fromOffset,transition.to.offset,e);
   progress=T.MathUtils.lerp(transition.fromProgress,transition.toProgress,e);dirty=true;if(t===1)finishTransition();
  }
  if(pressed&&now>=pressUntil){bmo.setPressed(pressed,false);pressed=null;dirty=true}
  const shouldBlink=!focused&&!reduce.matches&&(now%5800)>5630;
  if(shouldBlink!==blink){blink=shouldBlink;bmo.blink(blink);dirty=true}
  if(dirty)paint();
 }
 frame=requestAnimationFrame(tick);document.body.classList.add('ready');$('#loading').hidden=true;

 const project=point=>{const p=point.clone().project(camera);return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2}};
 function projectedBounds(){const bounds={left:Infinity,top:Infinity,right:-Infinity,bottom:-Infinity};bmo.group.updateMatrixWorld(true);
  bmo.group.traverse(m=>{if(!m.isMesh||m.userData.shadow||m.userData.outline)return;m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;
   for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=project(new T.Vector3(x,y,z).applyMatrix4(m.matrixWorld));bounds.left=Math.min(bounds.left,p.x);bounds.right=Math.max(bounds.right,p.x);bounds.top=Math.min(bounds.top,p.y);bounds.bottom=Math.max(bounds.bottom,p.y)}
  });return {...bounds,width:bounds.right-bounds.left,height:bounds.bottom-bounds.top};
 }
 // Read-only measurements used to verify the actual rendered model and touch targets.
 window.portfolioDiagnostics=()=>({webgl:!renderer.getContext().isContextLost(),view:focused?'portfolio':'room',transitioning:!!transition,mode:portfolio.mode,selected:portfolio.selected,meshes:renderer.info.render.calls,triangles:renderer.info.render.triangles,
  bmoCenter:project(new T.Vector3(0,1.8,.57)),bmoBounds:projectedBounds(),modelAudit:bmo.audit(),
  buttons:bmo.controls.map(m=>({id:m.name,action:m.userData.action,...project(m.getWorldPosition(new T.Vector3()))})),
  dpadTargets:Object.fromEntries([['up',0,.20],['down',0,-.20],['left',-.20,0],['right',.20,0]].map(([key,x,y])=>[key,project(new T.Vector3(x,y,.013).applyMatrix4(bmo.controls[0].matrixWorld))]))
 });
}catch(error){fallback(error)}
