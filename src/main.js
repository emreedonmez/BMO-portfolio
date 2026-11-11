import './style.css';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createBMO} from './scene.js';
import {createRoom} from './room.js';
import {roomAnchor} from './bmo-layout.js';
import {createPortfolio} from './portfolio.js';
import {interpolatePose,portfolioPose} from './navigation.js';
import {ROOM} from './room-geometry.js';
import {displayTransform} from './display.js';

const $=s=>document.querySelector(s),screen=$('#portfolio');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,scene,camera,orbitCamera,bmo,room,controls,frame=0,resizeFrame=0,transition=null,focused=false,dragging=false;
let sound=false,audio,dirty=true,pressed=null,pressUntil=0,blink=false;
const look=new T.Vector3(),offset=new T.Vector2();
let roomPose,closePose,exploredPose;
const coarsePointer=matchMedia('(pointer: coarse)');
const viewport={width:1,height:1};
function measureViewport(){const rect=$('#world').getBoundingClientRect();return {width:Math.max(1,rect.width),height:Math.max(1,rect.height)}}

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
 const {width,height}=viewport,anchor=roomAnchor(width,height),style=getComputedStyle(document.documentElement);
 const insets=Object.fromEntries(['top','right','bottom','left'].map(side=>[side,parseFloat(style.getPropertyValue(`--safe-${side}`))||0]));
 roomPose={position:new T.Vector3(-5.5,6.5,23),look:new T.Vector3(0,1.62,.28),offset:new T.Vector2(width/2-anchor.x,height/2-anchor.y)};
 closePose=portfolioPose(width,height,coarsePointer.matches,insets);
 document.documentElement.style.setProperty('--entry-x',`${anchor.x}px`);
 const entryLimit=(coarsePointer.matches||width<=700)&&height/width>1?height-Math.max(16,insets.bottom)-90:height-55;
 document.documentElement.style.setProperty('--entry-y',`${Math.min(entryLimit,anchor.y+height*.135)}px`);
}
function applyPose(){
 const {width,height}=viewport;
 camera.lookAt(look);camera.setViewOffset(width,height,offset.x,offset.y,width,height);camera.updateMatrixWorld();
}
function paint(){
 applyPose();renderer.render(scene,camera);
 const display=displayTransform(camera,bmo.layout.screen,viewport.width,viewport.height);
 screen.style.transform=display.transform;screen.style.setProperty('--lcd-scale',String(display.pixelScale));screen.classList.toggle('display-facing-away',!display.visible);dirty=false;
}
function visibility(){
 document.body.classList.toggle('focused',focused);
 $('#room-return').hidden=!focused;$('.control-guide').hidden=!focused;$('.accessible-controls').hidden=!focused;
 $('#welcome').hidden=focused;screen.setAttribute('aria-hidden',String(!focused));
 $('#room-reset').hidden=focused;$('#room-hint').hidden=focused;
 if(bmo)bmo.face.visible=!focused;
}
function currentPose(){return {position:camera.position.clone(),look:look.clone(),offset:offset.clone()}}
function applyDestination(to){camera.position.copy(to.position);look.copy(to.look);offset.copy(to.offset)}
function stopOrbit(){
 if(!controls)return;const position=orbitCamera.position.clone(),target=controls.target.clone(),damping=controls.enableDamping;
 controls.enableDamping=false;controls.update();orbitCamera.position.copy(position);controls.target.copy(target);controls.update();controls.enableDamping=damping;
}
function finishTransition(focus=true){
 const destination=transition?.to;
 transition=null;document.body.classList.remove('transitioning');screen.inert=false;
 if(controls){controls.enabled=!focused;if(!focused){if(destination)orbitCamera.position.copy(destination.position);controls.target.copy(look);controls.update();camera.position.copy(orbitCamera.position)}}
 if(focus){if(focused)screen.focus({preventScroll:true});else $('#enter').focus({preventScroll:true})}
}
function setView(value,instant=false){
 if(!renderer){focused=true;visibility();return}
 if(focused===value&&!instant)return;
 if(!focused){stopOrbit();exploredPose={position:orbitCamera.position.clone(),look:controls.target.clone(),offset:offset.clone()}}
 controls.enabled=false;focused=value;visibility();cue(value?'enter':'back');if(value)portfolio.menu();
 const to=value?closePose:{...exploredPose,offset:roomPose.offset.clone()};
 const duration=reduce.matches||instant?0:1250;
 if(duration){
  transition={start:performance.now(),duration,from:currentPose(),to};
  document.body.classList.add('transitioning');screen.inert=true;
 }else{applyDestination(to);if(!value)orbitCamera.position.copy(to.position);finishTransition()}
 dirty=true;paint();
}
$('#enter').onclick=()=>setView(true);$('#room-return').onclick=()=>setView(false);$('#sound').onclick=toggleSound;
$('#room-reset').onclick=()=>{if(!renderer||focused||transition)return;stopOrbit();applyDestination(roomPose);orbitCamera.position.copy(roomPose.position);controls.target.copy(look);controls.update();dirty=true;paint()};
$('.skip').onclick=e=>{e.preventDefault();setView(true,true)};
document.querySelectorAll('[data-control]').forEach(b=>b.onclick=()=>portfolio.action(b.dataset.control));
document.addEventListener('keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey||['INPUT','TEXTAREA'].includes(e.target.tagName))return;
 const key={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'confirm',Escape:'back',Backspace:'back',Home:'home'}[e.key];if(!key)return;
 if(!focused){
  if(transition||!renderer)return;
  if(key==='home'){e.preventDefault();$('#room-reset').click()}
  else if(['up','down','left','right'].includes(key)){
   e.preventDefault();stopOrbit();const orbit=new T.Spherical().setFromVector3(orbitCamera.position.clone().sub(controls.target));
   if(key==='left'||key==='right')orbit.theta+=(key==='left'?1:-1)*Math.PI/12;
   else orbit.phi=T.MathUtils.clamp(orbit.phi+(key==='up'?-1:1)*Math.PI/36,controls.minPolarAngle,controls.maxPolarAngle);
   orbitCamera.position.setFromSpherical(orbit).add(controls.target);orbitCamera.position.copy(room.constrainCamera(orbitCamera.position,camera.position,controls.target));controls.update();look.copy(controls.target);camera.position.copy(orbitCamera.position);dirty=true;
  }else if(e.key==='Enter'&&(e.target===document.body||e.target===renderer.domElement)){e.preventDefault();setView(true)}return;
 }
 if(key==='home')return;
 if(e.key==='Enter'&&e.target.closest('button,a'))return;
 e.preventDefault();if(transition&&key!=='back')return;portfolio.action(key);
});
function fallback(error){
 console.warn('3D character unavailable:',error);cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);controls?.dispose();renderer?.domElement.remove();renderer=null;
 screen.style.removeProperty('transform');screen.style.removeProperty('--lcd-scale');screen.classList.remove('display-facing-away');screen.inert=false;document.body.classList.remove('transitioning');
 $('#fallback').hidden=false;$('#fallback-content').append(screen);document.body.classList.add('fallback-mode','ready');focused=true;visibility();
 $('#room-return').hidden=true;$('#room-reset').hidden=true;$('#room-hint').hidden=true;$('.control-guide').hidden=true;$('.accessible-controls').hidden=true;$('#loading').hidden=true;
}

try{
 await document.fonts.ready;
 scene=new T.Scene();scene.background=new T.Color('#48354f');
 Object.assign(viewport,measureViewport());
 camera=new T.PerspectiveCamera(42,viewport.width/viewport.height,.2,160);
 renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,coarsePointer.matches?1.5:2));renderer.setSize(viewport.width,viewport.height,false);renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NoToneMapping;
 $('#world').append(renderer.domElement);
 $('#world').append(screen);
 room=createRoom(scene);bmo=createBMO(scene);
 const contact=bmo.group.getObjectByName('floor-contact-shadow');contact.position.y=ROOM.floor+.012;contact.renderOrder=10;contact.material.polygonOffset=true;contact.material.polygonOffsetFactor=-1;contact.material.polygonOffsetUnits=-1;
 views();applyDestination(roomPose);
 // Only the actual camera path can meet a solid; occlusion never changes the viewing angle.
 orbitCamera=camera.clone();controls=new OrbitControls(orbitCamera,renderer.domElement);controls.target.copy(look);controls.enablePan=false;controls.enableDamping=!reduce.matches;controls.dampingFactor=.12;controls.rotateSpeed=.45;
 controls.minDistance=4.6;controls.maxDistance=ROOM.maxOrbit;controls.minPolarAngle=T.MathUtils.degToRad(25);controls.maxPolarAngle=T.MathUtils.degToRad(86);
 controls.mouseButtons={LEFT:T.MOUSE.ROTATE,MIDDLE:T.MOUSE.DOLLY,RIGHT:null};controls.touches={ONE:T.TOUCH.ROTATE,TWO:T.TOUCH.DOLLY_ROTATE};controls.update();
 controls.addEventListener('change',()=>{dirty=true});controls.addEventListener('start',()=>{dragging=true;renderer.domElement.style.cursor='grabbing'});controls.addEventListener('end',()=>{dragging=false;renderer.domElement.style.cursor='grab'});
 reduce.addEventListener('change',()=>{if(!focused&&!transition)stopOrbit();controls.enableDamping=!reduce.matches;dirty=true});
 renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','3D room. Drag to rotate, scroll or pinch to zoom. Arrow keys rotate; Home restores the original view; Enter meets BMO.');renderer.domElement.setAttribute('aria-describedby','room-hint');
 exploredPose=currentPose();visibility();paint();

 const raycaster=new T.Raycaster(),pointer=new T.Vector2(),pointers=new Set();let pointerDown=null;
 function hit(e){const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObject(bmo.group,true).find(h=>h.object.isMesh&&!h.object.userData.outline&&!h.object.userData.shadow)}
 renderer.domElement.addEventListener('pointerdown',e=>{pointers.add(e.pointerId);if(pointers.size>1)pointerDown=null;else if(e.button===0)pointerDown={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false}});
 renderer.domElement.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);pointerDown=null});
 addEventListener('blur',()=>{pointerDown=null;pointers.clear();dragging=false});
 renderer.domElement.addEventListener('pointerup',e=>{
  pointers.delete(e.pointerId);const start=pointerDown;pointerDown=null;if(!start||start.id!==e.pointerId||start.moved||Math.hypot(e.clientX-start.x,e.clientY-start.y)>8||transition)return;
  const h=hit(e);if(!h)return;
  if(!focused){setView(true);return}
  let obj=h.object;while(obj&&!obj.userData.action)obj=obj.parent;
  let action=obj?.userData.action;if(!action||action==='enter')return;
  if(action==='dpad'){const p=obj.worldToLocal(h.point.clone());action=Math.abs(p.x)>Math.abs(p.y)?p.x>0?'right':'left':p.y>0?'up':'down'}
  portfolio.action(action);if(pressed)bmo.setPressed(pressed,false);pressed=obj;bmo.setPressed(pressed,true);pressUntil=performance.now()+125;dirty=true;
 });
 renderer.domElement.addEventListener('pointermove',e=>{if(pointerDown&&Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)>8)pointerDown.moved=true;renderer.domElement.style.cursor=dragging?'grabbing':hit(e)?'pointer':focused?'default':'grab'});
 renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback(new Error('WebGL context lost'))});
 function resize(){
  resizeFrame=0;if(!renderer)return;
  const measured=measureViewport(),changed=Math.abs(measured.width-viewport.width)>.01||Math.abs(measured.height-viewport.height)>.01;
  renderer.setPixelRatio(Math.min(devicePixelRatio,coarsePointer.matches?1.5:2));
  if(changed){
   Object.assign(viewport,measured);camera.aspect=viewport.width/viewport.height;views();renderer.setSize(viewport.width,viewport.height,false);
   if(transition){
    const now=performance.now(),remaining=Math.max(0,transition.duration-(now-transition.start));
    const to=focused?closePose:{...exploredPose,offset:roomPose.offset.clone()};
    transition={start:now,duration:Math.max(1,remaining),from:currentPose(),to};
   }else if(focused)applyDestination(closePose);else offset.copy(roomPose.offset);
  }
  dirty=true;paint();
 }
 const scheduleResize=()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(resize)};
 addEventListener('resize',scheduleResize);visualViewport?.addEventListener('resize',scheduleResize);
 coarsePointer.addEventListener('change',()=>{views();if(focused&&!transition)applyDestination(closePose);scheduleResize()});
 new ResizeObserver(scheduleResize).observe($('#world'));
 let previousFrame=performance.now();
 function tick(now){
  const elapsed=Math.max(1,Math.min(100,now-previousFrame));previousFrame=now;
  frame=requestAnimationFrame(tick);if(document.hidden)return;
  if(transition){const t=Math.min(1,(now-transition.start)/transition.duration);
   applyDestination(interpolatePose(transition.from,transition.to,t));
   dirty=true;if(t===1)finishTransition();
  }
  if(!focused&&!transition){controls.dampingFactor=1-Math.pow(.88,elapsed/(1000/60));const changed=controls.update();if(changed||dirty){look.copy(controls.target);const safe=room.constrainCamera(orbitCamera.position,camera.position,look);if(safe.distanceToSquared(orbitCamera.position)>1e-8){orbitCamera.position.copy(safe);stopOrbit()}if(safe.distanceToSquared(camera.position)>1e-8){camera.position.copy(safe);dirty=true}}}
  if(pressed&&performance.now()>=pressUntil){bmo.setPressed(pressed,false);pressed=null;dirty=true}
  const shouldBlink=!focused&&!reduce.matches&&(now%5800)>5630;
  if(shouldBlink!==blink){blink=shouldBlink;bmo.blink(blink);dirty=true}
  if(dirty)paint();
 }
 frame=requestAnimationFrame(tick);document.body.classList.add('ready');$('#loading').hidden=true;

 const project=point=>{const p=point.clone().project(camera),rect=$('#world').getBoundingClientRect();return {x:rect.left+(p.x+1)*viewport.width/2,y:rect.top+(1-p.y)*viewport.height/2}};
 function projectedBounds(){const bounds={left:Infinity,top:Infinity,right:-Infinity,bottom:-Infinity};bmo.group.updateMatrixWorld(true);
  bmo.group.traverse(m=>{if(!m.isMesh||m.userData.shadow||m.userData.outline)return;m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;
   for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=project(new T.Vector3(x,y,z).applyMatrix4(m.matrixWorld));bounds.left=Math.min(bounds.left,p.x);bounds.right=Math.max(bounds.right,p.x);bounds.top=Math.min(bounds.top,p.y);bounds.bottom=Math.max(bounds.bottom,p.y)}
  });return {...bounds,width:bounds.right-bounds.left,height:bounds.bottom-bounds.top};
 }
 // Read-only measurements used to verify the actual rendered model and touch targets.
 window.portfolioDiagnostics=()=>({webgl:!renderer.getContext().isContextLost(),view:focused?'portfolio':'room',transitioning:!!transition,viewport:{...viewport},mode:portfolio.mode,selected:portfolio.selected,meshes:renderer.info.render.calls,triangles:renderer.info.render.triangles,
  orbit:{enabled:controls.enabled,azimuth:controls.getAzimuthalAngle(),polar:controls.getPolarAngle(),distance:camera.position.distanceTo(look),requestedDistance:orbitCamera.position.distanceTo(controls.target),position:camera.position.toArray(),target:look.toArray(),near:camera.near,far:camera.far,maxDistance:controls.maxDistance,dragging,dpr:renderer.getPixelRatio()},
  screenCorners:[[-1,-1],[-1,1],[1,-1],[1,1]].map(([x,y])=>project(new T.Vector3(bmo.layout.screen.x+x*bmo.screenWidth/2,bmo.layout.screen.y+y*bmo.screenHeight/2,bmo.layout.screen.z))),
  bmoCenter:project(new T.Vector3(0,1.8,.57)),bmoBounds:projectedBounds(),modelAudit:bmo.audit(),roomAudit:room.audit(),roomCoverage:[[-.99,-.99],[-.99,.99],[.99,-.99],[.99,.99]].map(([x,y])=>{const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(x,y),camera);return ray.intersectObject(room.group,true).some(h=>h.object.isMesh&&!h.object.userData.outline)}),roomLandmarks:Object.fromEntries(Object.entries(room.landmarks).map(([key,obj])=>[key,project(obj.getWorldPosition(new T.Vector3()))])),
  buttons:bmo.controls.map(m=>({id:m.name,action:m.userData.action,...project(m.getWorldPosition(new T.Vector3()))})),
  dpadTargets:Object.fromEntries([['up',0,.20],['down',0,-.20],['left',-.20,0],['right',.20,0]].map(([key,x,y])=>[key,project(new T.Vector3(x,y,.013).applyMatrix4(bmo.controls[0].matrixWorld))]))
 });
}catch(error){fallback(error)}
