import test from 'node:test';
import assert from 'node:assert/strict';
import {BMO_LAYOUT as L,roomAnchor} from '../src/bmo-layout.js';
test('every button fits within the face and has clearance from all other buttons',()=>{
 const bodyLeft=-L.body.width/2,bodyRight=L.body.width/2,bodyBottom=L.body.centerY-L.body.height/2;
 for(const c of L.controls){
  assert.ok(c.x-c.width/2>bodyLeft+.1,c.id);assert.ok(c.x+c.width/2<bodyRight-.1,c.id);
  assert.ok(c.y-c.height/2>bodyBottom+.1,c.id);assert.ok(c.y+c.height/2<L.screen.y-L.screen.height/2-.1,c.id);
 }
 for(let i=0;i<L.controls.length;i++)for(let j=i+1;j<L.controls.length;j++){
  const a=L.controls[i],b=L.controls[j];assert.ok(Math.abs(a.x-b.x)>(a.width+b.width)/2+.04||Math.abs(a.y-b.y)>(a.height+b.height)/2+.04,`${a.id} overlaps ${b.id}`);
 }
});
test('buttons are shallow and remain above the shell during a press',()=>{
 const surface=L.body.depth/2;
 assert.ok(L.controlZ+L.controlDepth/2-surface<.03);
 assert.ok(L.controlZ-L.pressTravel+L.controlDepth/2>surface);
 assert.ok(Math.abs(L.screen.width/L.screen.height-640/452)<1e-8);
});
test('BMO stays on the visible center floor in narrow and wide compositions',()=>{
 for(const [w,h]of [[320,700],[390,844],[1024,768],[1440,810],[2560,1080]]){const a=roomAnchor(w,h);assert.ok(a.x>=w*.4&&a.x<=w*.6);assert.ok(a.y>=h*.68&&a.y<=h*.77)}
});
