// Drag only the empty surroundings or shell, keeping every LCD/control action intact.
const dragSurface=document.querySelector('main');
const wrap=document.querySelector('.console-wrap');
let drag=null,returnFrame=0,tiltX=0,tiltY=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function applyTilt(x,y){
  tiltX=x;tiltY=y;
  wrap.style.setProperty('--tilt-x',`${x}deg`);
  wrap.style.setProperty('--tilt-y',`${y}deg`);
  // Both renderers consume this exact matrix instead of separate Euler rotations.
  const matrix=new DOMMatrix().rotateAxisAngle(1,0,0,x).rotateAxisAngle(0,1,0,y);
  wrap.style.setProperty('--console-pose',matrix.toString());
  window.dispatchEvent(new CustomEvent('console-tilt',{detail:{x,y,matrix:Array.from(matrix.toFloat64Array())}}));
}
function settle(){
  cancelAnimationFrame(returnFrame);
  if(reducedMotion.matches){applyTilt(0,0);return}
  let last=performance.now();
  function step(now){
    const decay=Math.exp(-Math.min(now-last,50)/85);last=now;
    applyTilt(tiltX*decay,tiltY*decay);
    if(Math.abs(tiltX)+Math.abs(tiltY)>.025)returnFrame=requestAnimationFrame(step);
    else applyTilt(0,0);
  }
  returnFrame=requestAnimationFrame(step);
}
dragSurface.addEventListener('pointerdown',event=>{
  if(drag||!event.isPrimary||event.button!==0||event.target.closest('button,a,.bezel,.controls,.lower-controls'))return;
  cancelAnimationFrame(returnFrame);
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:tiltX,startY:tiltY};
  dragSurface.setPointerCapture(event.pointerId);
  document.body.classList.add('dragging');
});
dragSurface.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const limit=reducedMotion.matches?3:9;
  const clamp=value=>Math.max(-limit,Math.min(limit,value));
  applyTilt(clamp(drag.startX-(event.clientY-drag.y)*.07),clamp(drag.startY+(event.clientX-drag.x)*.07));
});
function release(event){
  if(!drag||(event?.pointerId!==undefined&&event.pointerId!==drag.id))return;
  const id=drag.id;drag=null;
  if(dragSurface.hasPointerCapture(id))dragSurface.releasePointerCapture(id);
  document.body.classList.remove('dragging');settle();
}
for(const event of ['pointerup','pointercancel','lostpointercapture'])dragSurface.addEventListener(event,release);
window.addEventListener('blur',()=>release());
window.addEventListener('resize',()=>release());
