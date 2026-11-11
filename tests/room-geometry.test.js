import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {ROOM,subtractConvex,hollowTrunk} from '../src/room-geometry.js';
const area=p=>Math.abs(p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[1]-b[0]*a[1]},0)/2);
test('cutting a hole removes only its interior, without overlapping leftover faces',()=>{
 const result=subtractConvex([[-2,-2],[2,-2],[2,2],[-2,2]],[[-1,-1],[1,-1],[1,1],[-1,1]]);
 assert.ok(Math.abs(result.reduce((sum,p)=>sum+area(p),0)-12)<1e-8);
 assert.ok(result.every(p=>p.every(v=>v.every(Number.isFinite))));
});
test('tree cavities are genuine openings with recessed interiors',()=>{
 const tree=hollowTrunk(3,28.4,.3,97),material=new T.MeshBasicMaterial({side:T.DoubleSide}),body=new T.Mesh(tree.body,material);
 assert.equal(tree.cavities.length,3);body.updateMatrixWorld();
 for(const cavity of tree.cavities){
  const ray=new T.Raycaster(cavity.center.clone().addScaledVector(cavity.normal,.4),cavity.normal.clone().negate(),0,12),skin=ray.intersectObject(body)[0],bowl=new T.Mesh(cavity.bowl,material);bowl.updateMatrixWorld();const inset=ray.intersectObject(bowl)[0];
  assert.ok(skin&&skin.distance>2,'The front bark must not span across the opening');
  assert.ok(inset&&inset.distance>.7&&inset.distance<2.5,'The interior must sit physically behind the bark');
  assert.ok([...cavity.rim.attributes.position.array,...cavity.bowl.attributes.position.array].every(Number.isFinite));
 }
 assert.ok(ROOM.width<80&&ROOM.front-ROOM.back<80&&ROOM.height<32);
});
