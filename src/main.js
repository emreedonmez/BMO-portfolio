import './style.css';
import * as T from 'three';
import {CSS3DRenderer,CSS3DObject} from 'three/addons/renderers/CSS3DRenderer.js';
import {createBMO,createRoom} from './scene.js';
import {createPortfolio} from './portfolio.js';

const $=s=>document.querySelector(s),screen=$('#portfolio'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
let focused=false,renderer,cssRenderer,scene,camera,bmo,transition=null,frame=0,sound=false,audio;
function cue(type){if(!sound)return;try{audio??=new AudioContext();if(audio.state==='suspended')audio.resume();const notes={move:[330],select:[523,784],back:[440,294],enter:[392,523,784],sound:[659,880]};let time=audio.currentTime;for(const hz of notes[type]||notes.move){const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=hz;g.gain.setValueAtTime(.035,time);g.gain.exponentialRampToValueAtTime(.0001,time+.09);o.connect(g);g.connect(audio.destination);o.start(time);o.stop(time+.1);time+=.1}}catch{}}
function toggleSound(){sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').setAttribute('aria-label',sound?'Mute sound':'Enable sound');$('#sound').innerHTML=`<span aria-hidden="true">♫</span> SOUND ${sound?'ON':'OFF'}`;cue('sound')}
const portfolio=createPortfolio(screen,{onRoom:()=>setView(false),onSound:toggleSound,onCue:cue});
const roomPosition=new T.Vector3(),roomTarget=new T.Vector3(),closePosition=new T.Vector3(),closeTarget=new T.Vector3(),look=new T.Vector3();
function views(){const ratio=innerWidth/innerHeight;const mobile=ratio<.8;
 roomPosition.set(mobile?6.7:7.7,mobile?6.5:6.6,mobile?12.9:12.6);roomTarget.set(mobile?0:-.3,mobile?1.3:1.9,0);
 // Keep both the LCD and physical controls inside the close-up on every aspect ratio.
 const distance=Math.max(6.6,2.65/(2*Math.tan(T.MathUtils.degToRad(42/2))*ratio)+.76);
 closePosition.set(0,2.18,distance);closeTarget.set(0,2.18,0);
}
function applyVisibility(){document.body.classList.toggle('focused',focused);$('#room-return').hidden=!focused;$('.control-guide').hidden=!focused;$('.accessible-controls').hidden=!focused;$('#welcome').setAttribute('aria-hidden',String(focused));$('#enter').tabIndex=focused?-1:0;screen.setAttribute('aria-hidden',String(!focused));if(bmo)bmo.face.visible=!focused}
function setView(value,instant=false){if(!renderer){focused=true;applyVisibility();return}if(focused===value&&!instant)return;focused=value;applyVisibility();cue(value?'enter':'back');transition={start:performance.now(),from:camera.position.clone(),fromLook:look.clone(),to:(value?closePosition:roomPosition).clone(),toLook:(value?closeTarget:roomTarget).clone(),duration:reduce.matches||instant?0:1250};if(value){portfolio.menu();screen.focus({preventScroll:true})}else $('#enter').focus({preventScroll:true})}
$('#enter').onclick=()=>setView(true);$('#room-return').onclick=()=>setView(false);$('#sound').onclick=toggleSound;
$('.skip').onclick=e=>{e.preventDefault();setView(true,true);screen.focus({preventScroll:true})};
document.querySelectorAll('[data-control]').forEach(b=>b.onclick=()=>portfolio.action(b.dataset.control));
document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||['INPUT','TEXTAREA'].includes(e.target.tagName))return;const key={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'confirm',Escape:'back',Backspace:'back'}[e.key];if(!key)return;if(!focused){if(e.key==='Enter'&&e.target===document.body){e.preventDefault();setView(true)}return}if(e.target.closest('.utilities,.accessible-controls')&&e.key==='Enter')return;if(e.key==='Enter'&&e.target.closest('a,button'))return;e.preventDefault();portfolio.action(key)});
function fallback(error){console.warn('3D room unavailable:',error);cancelAnimationFrame(frame);renderer?.domElement.remove();cssRenderer?.domElement.remove();$('#fallback').hidden=false;$('#fallback-content').append(screen);document.body.classList.add('fallback-mode','ready');focused=true;applyVisibility();$('#welcome').hidden=true;$('#room-return').hidden=true;$('.control-guide').hidden=true;$('.accessible-controls').hidden=true;}
try{
 scene=new T.Scene();scene.background=new T.Color('#e9ddc7');scene.fog=new T.Fog('#e9ddc7',19,34);
 camera=new T.PerspectiveCamera(42,innerWidth/innerHeight,.1,70);views();camera.position.copy(roomPosition);look.copy(roomTarget);camera.lookAt(look);
 renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;$('#world').append(renderer.domElement);
 cssRenderer=new CSS3DRenderer();cssRenderer.setSize(innerWidth,innerHeight);cssRenderer.domElement.className='css3d-layer';$('#world').append(cssRenderer.domElement);
 createRoom(scene);bmo=createBMO(scene);
 const lcd=new CSS3DObject(screen);lcd.position.copy(bmo.screenPosition);lcd.scale.setScalar(bmo.screenWidth/640);scene.add(lcd);
 const raycaster=new T.Raycaster(),pointer=new T.Vector2();let pointerDown=null,pressed=null,pressUntil=0;
 function hit(event){pointer.set((event.clientX/innerWidth)*2-1,-(event.clientY/innerHeight)*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObject(bmo.group,true).find(h=>h.object.material?.side!==T.BackSide)}
 renderer.domElement.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX,y:e.clientY};});
 renderer.domElement.addEventListener('pointerup',e=>{if(!pointerDown||Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)>10)return;pointerDown=null;const h=hit(e);if(!h)return;if(!focused){setView(true);return}let obj=h.object;while(obj&&!obj.userData.action)obj=obj.parent;let action=obj?.userData.action;if(!action||action==='enter')return;if(action==='dpad'){const p=bmo.group.worldToLocal(h.point.clone());const x=p.x+.74,y=p.y-1.08;action=Math.abs(x)>Math.abs(y)?x>0?'right':'left':y>0?'up':'down'}portfolio.action(action);if(pressed)pressed.position.z=.785;pressed=obj;pressed.position.z=.752;pressUntil=performance.now()+130;});
 renderer.domElement.addEventListener('pointermove',e=>{const h=hit(e);renderer.domElement.style.cursor=h?'pointer':'default'});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback(new Error('WebGL context lost'))});
 addEventListener('resize',()=>{views();camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);cssRenderer.setSize(innerWidth,innerHeight);transition=null;camera.position.copy(focused?closePosition:roomPosition);look.copy(focused?closeTarget:roomTarget)});
 function animate(now){frame=requestAnimationFrame(animate);if(document.hidden)return;if(transition){const t=transition.duration?Math.min(1,(now-transition.start)/transition.duration):1;const e=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,e);look.lerpVectors(transition.fromLook,transition.toLook,e);if(t===1)transition=null}if(pressed&&now>pressUntil){pressed.position.z=.785;pressed=null}camera.lookAt(look);renderer.render(scene,camera);cssRenderer.render(scene,camera)}
 frame=requestAnimationFrame(animate);document.body.classList.add('ready');applyVisibility();$('#loading').addEventListener('transitionend',()=>$('#loading').hidden=true,{once:true});
 // Expose only read-only diagnostics for automated rendering and interaction checks.
 window.portfolioDiagnostics=()=>({webgl:renderer.getContext().isContextLost()===false,view:focused?'portfolio':'room',mode:portfolio.mode,selected:portfolio.selected,meshes:renderer.info.render.calls,triangles:renderer.info.render.triangles,bmoCenter:(()=>{const p=new T.Vector3(0,2.4,.72).project(camera);return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2}})(),buttons:bmo.controls.map(m=>{const p=m.getWorldPosition(new T.Vector3()).project(camera);return {action:m.userData.action,x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2}})});
}catch(error){fallback(error)}
