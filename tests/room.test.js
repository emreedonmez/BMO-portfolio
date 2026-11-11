import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {roomCalibration} from '../src/room.js';
test('room object anchors share the same real floor and match the reference composition',()=>{
 const C=roomCalibration();
 for(const [u,v]of [[.552,.662],[.20,.883],[.742,.703],[.133,.536],[.90,.788]]){
  const p=C.ground(u,v);assert.ok(p.toArray().every(Number.isFinite));assert.ok(Math.abs(p.y)<1e-8);
  const q=p.project(C.camera);assert.ok(Math.abs((q.x+1)/2-u)<1e-8);assert.ok(Math.abs((1-q.y)/2-v)<1e-8);
 }
 assert.ok(C.height(.552,.662,.43)>0);assert.ok(C.width(.20,.883,.247)>0);
});
test('the production page has no image backdrop',()=>{
 const html=readFileSync('index.html','utf8'),main=readFileSync('src/main.js','utf8');
 assert.doesNotMatch(html,/treehouse-room\.png|id="room-art"/);assert.doesNotMatch(main,/art\.decode|art\.style|treehouse-room\.png/);
});
