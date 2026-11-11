import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {interpolatePose,portfolioPose} from '../src/navigation.js';

const pose=(theta,radius=24)=>({position:new T.Vector3().setFromSpherical(new T.Spherical(radius,1.2,theta)),look:new T.Vector3(),offset:new T.Vector2(20,-40)});
test('camera travel follows the shortest arc and never cuts through BMO',()=>{
 const from=pose(T.MathUtils.degToRad(170)),to=pose(T.MathUtils.degToRad(-170),6.6);
 const mid=interpolatePose(from,to,.5),s=new T.Spherical().setFromVector3(mid.position);
 assert.ok(Math.abs(Math.abs(s.theta)-Math.PI)<1e-8);
 assert.ok(Math.abs(s.radius-15.3)<1e-8);
 for(const progress of [0,.1,.25,.5,.75,.9,1])assert.ok(interpolatePose(from,to,progress).position.length()>=6.6-1e-8);
 assert.ok(interpolatePose(from,to,0).position.distanceTo(from.position)<1e-8);
 assert.ok(interpolatePose(from,to,1).position.distanceTo(to.position)<1e-8);
});
test('camera targets and view offsets stay continuous during approach',()=>{
 const from=pose(0),to=portfolioPose(1440,810);from.look.set(0,1.62,.28);from.position.add(from.look);
 assert.ok(interpolatePose(from,to,0).look.equals(from.look));
 assert.ok(interpolatePose(from,to,1).look.equals(to.look));
 assert.ok(interpolatePose(from,to,.5).offset.equals(new T.Vector2(10,-20)));
});
test('compact portrait and short landscape use a readable screen close-up',()=>{
 for(const [w,h]of [[320,568],[360,800],[390,844],[568,320],[844,390],[768,1024]]){
  const p=portfolioPose(w,h,true),scale=h/(2*Math.tan(T.MathUtils.degToRad(21))*(p.position.z-.59))*2.12/640;
  assert.ok(scale*100>=44,`${w}x${h} menu targets must be at least 44px high`);
  assert.ok(scale*640<=w+1,`${w}x${h} LCD must fit within the viewport`);
 }
 assert.equal(portfolioPose(844,390,true).look.y,2.52);
 assert.equal(portfolioPose(1440,810).look.y,1.85);
});

test('the LCD fits between safe areas and mobile controls in either orientation',()=>{
 for(const [w,h,insets]of [[428,926,{top:47,bottom:34}],[428,746,{top:47,bottom:34}],[926,428,{left:47,right:47,bottom:21}],[568,320,{}]]){
  const pose=portfolioPose(w,h,true,insets),camera=new T.PerspectiveCamera(42,w/h,.2,160);
  camera.position.copy(pose.position);camera.lookAt(pose.look);camera.setViewOffset(w,h,pose.offset.x,pose.offset.y,w,h);camera.updateMatrixWorld();
  const short=h<550&&w/h>1.2,edge=s=>Math.max(12,insets[s]||0),points=[];
  for(const x of [-1,1])for(const y of [-1,1]){const p=new T.Vector3(x*1.06,2.52+y*1.49725/2,.59).project(camera);points.push({x:(p.x+1)*w/2,y:(1-p.y)*h/2})}
  for(const p of points){assert.ok(p.x>=edge('left')+(short?66:0)-1e-6);assert.ok(p.x<=w-edge('right')-(short?106:0)+1e-6);assert.ok(p.y>=edge('top')+(short?0:56)-1e-6);assert.ok(p.y<=h-edge('bottom')-(short?0:56)+1e-6)}
 }
});
