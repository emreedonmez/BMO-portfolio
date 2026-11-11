import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {displayTransform} from '../src/display.js';
import {BMO_LAYOUT} from '../src/bmo-layout.js';

test('LCD pixels match the WebGL projection at every corner during camera travel',()=>{
 const s=BMO_LAYOUT.screen;
 for(const [w,h]of [[428,926],[926,428],[1440,810]])for(const [x,y,z]of [[0,1.65,7],[-4,5,14],[3,2.52,6],[0,2.52,-9]]){
  const camera=new T.PerspectiveCamera(42,w/h,.2,160);camera.position.set(x,y,z);camera.lookAt(0,2,0);camera.setViewOffset(w,h,20,-15,w,h);camera.updateMatrixWorld();
  const result=displayTransform(camera,s,w,h),values=result.transform.match(/\((.*)\)/)[1].split(',').map(Number);
  const matrix=values.length===16?values:[values[0],values[1],0,0,values[2],values[3],0,0,0,0,1,0,values[4],values[5],0,1];
  for(const [px,py]of [[0,0],[640,0],[0,452],[640,452],[320,226]]){
   const divisor=matrix[3]*px+matrix[7]*py+matrix[15];
   const dom={x:(matrix[0]*px+matrix[4]*py+matrix[12])/divisor,y:(matrix[1]*px+matrix[5]*py+matrix[13])/divisor};
   const p=new T.Vector3(s.x-s.width/2+px*s.width/640,s.y+s.height/2-py*s.width/640,s.z).project(camera);
   assert.ok(Math.abs(dom.x-(p.x+1)*w/2)<1e-7);assert.ok(Math.abs(dom.y-(1-p.y)*h/2)<1e-7);
  }
  assert.equal(result.visible,z>s.z);
 }
});

test('front-facing content settles into a flat, scrollable transform',()=>{
 const camera=new T.PerspectiveCamera(42,428/926,.2,160);camera.position.set(0,1.65,7);camera.lookAt(0,1.65,0);camera.updateMatrixWorld();
 assert.ok(displayTransform(camera,BMO_LAYOUT.screen,428,926).transform.startsWith('matrix('));
});
