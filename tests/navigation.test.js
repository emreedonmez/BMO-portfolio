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
