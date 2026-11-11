import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {BMO_LAYOUT as L} from './bmo-layout.js';

const ink=new T.MeshBasicMaterial({color:'#292133',side:T.BackSide,toneMapped:false});
const dark=new T.MeshBasicMaterial({color:'#1c3031',toneMapped:false});
const ramps=new T.DataTexture(new Uint8Array([145,204,255]),3,1,T.RedFormat);
ramps.minFilter=ramps.magFilter=T.NearestFilter;ramps.generateMipmaps=false;ramps.needsUpdate=true;
const toon=color=>new T.MeshToonMaterial({color,gradientMap:ramps,toneMapped:false});
const skin=toon('#78b9a5');

function outline(geometry,width){
 const g=geometry.clone(),p=g.attributes.position,n=g.attributes.normal;
 for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)+n.getX(i)*width,p.getY(i)+n.getY(i)*width,p.getZ(i)+n.getZ(i)*width);
 p.needsUpdate=true;return g;
}
function add(parent,name,geometry,material,position,stroke=.009){
 const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.position.set(...position);mesh.castShadow=mesh.receiveShadow=false;parent.add(mesh);
 if(stroke){const edge=new T.Mesh(outline(geometry,stroke),ink);edge.name=name+'-ink';edge.userData.outline=true;mesh.add(edge)}return mesh;
}
function roundShape(w,h,r){
 const s=new T.Shape(),l=-w/2,b=-h/2,t=h/2,right=w/2;
 s.moveTo(l+r,b);s.lineTo(right-r,b);s.quadraticCurveTo(right,b,right,b+r);
 s.lineTo(right,t-r);s.quadraticCurveTo(right,t,right-r,t);s.lineTo(l+r,t);
 s.quadraticCurveTo(l,t,l,t-r);s.lineTo(l,b+r);s.quadraticCurveTo(l,b,l+r,b);return s;
}
function extrude(shape,depth){const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:20,steps:1});g.center();return g}
function flatShape(shape){const g=new T.ShapeGeometry(shape,24);g.computeBoundingBox();const b=g.boundingBox,p=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)-b.min.x)/(b.max.x-b.min.x),(p.getY(i)-b.min.y)/(b.max.y-b.min.y));return g;
}
function path(parent,name,points,r,material=skin){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return add(parent,name,new T.TubeGeometry(curve,40,r,12,false),material,[0,0,0],.008)}
function sphere(parent,name,r,pos,scale){const m=add(parent,name,new T.SphereGeometry(r,24,18),skin,pos,.008);if(scale)m.scale.set(...scale);return m}
function makeFace(){
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=452;
 const c=canvas.getContext('2d'),texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 function paint(blink=false){c.clearRect(0,0,640,452);c.fillStyle='#d2f2cc';c.fillRect(0,0,640,452);c.fillStyle='#20372d';c.strokeStyle='#20372d';c.lineWidth=6;c.lineCap='round';
  for(const x of [190,450]){c.beginPath();if(blink){c.moveTo(x-17,177);c.quadraticCurveTo(x,185,x+17,177);c.stroke()}else{c.ellipse(x,166,12,21,0,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(x-24,183);c.quadraticCurveTo(x,171,x+24,183);c.stroke()}}
  c.beginPath();c.moveTo(261,239);c.bezierCurveTo(259,210,281,240,319,247);c.bezierCurveTo(350,240,381,216,379,242);c.bezierCurveTo(372,307,277,314,261,239);c.fill();
  c.save();c.clip();c.fillStyle='#78ac67';c.beginPath();c.ellipse(321,293,34,17,-.04,0,Math.PI*2);c.fill();c.restore();texture.needsUpdate=true;
 }paint();return {texture,paint};
}

export function createBMO(scene){
 const group=new T.Group();group.name='BMO';scene.add(group);
 const body=add(group,'body',new RoundedBoxGeometry(L.body.width,L.body.height,L.body.depth,5,L.body.radius),skin,[0,L.body.centerY,0],.011);body.userData.action='enter';
 const face=makeFace();
 add(group,'screen-border',flatShape(roundShape(L.screen.width+.048,L.screen.height+.048,.13)),dark,[0,L.screen.y,L.screen.z-.012],0);
 const display=add(group,'face',flatShape(roundShape(L.screen.width,L.screen.height,L.screen.radius)),new T.MeshBasicMaterial({map:face.texture,toneMapped:false}),[0,L.screen.y,L.screen.z-.003],0);display.userData.action='enter';
 // The cartridge and slim blue bars sit directly on the shell.
 add(group,'cartridge-slot',flatShape(roundShape(1.43,.12,.009)),dark,[-.30,1.57,L.body.depth/2+.002],0);
 const navy=new T.MeshBasicMaterial({color:'#212b97',toneMapped:false});
 for(const [i,x]of [-.86,-.41].entries())add(group,`small-bar-${i}`,flatShape(roundShape(.26,.055,.025)),navy,[x,.35,L.body.depth/2+.004],0);
 const controls=[];
 for(const spec of L.controls){
  let shape;
  if(spec.shape==='circle'){shape=new T.Shape();shape.absarc(0,0,spec.width/2,0,Math.PI*2,false)}
  else if(spec.shape==='triangle'){shape=new T.Shape();shape.moveTo(-spec.width/2,-spec.height/2);shape.lineTo(spec.width/2,-spec.height/2);shape.lineTo(0,spec.height/2);shape.closePath()}
  else {const a=spec.width/2,b=spec.width*.16;shape=new T.Shape();const p=[[-b,a],[b,a],[b,b],[a,b],[a,-b],[b,-b],[b,-a],[-b,-a],[-b,-b],[-a,-b],[-a,b],[-b,b]];shape.moveTo(...p[0]);p.slice(1).forEach(v=>shape.lineTo(...v));shape.closePath()}
  const m=add(group,spec.id,extrude(shape,L.controlDepth),toon(spec.color),[spec.x,spec.y,L.controlZ],.008);
  m.userData={action:spec.action,mountZ:L.controlZ,spec};controls.push(m);
 }
 const labelCanvas=document.createElement('canvas');labelCanvas.width=256;labelCanvas.height=640;
 const c=labelCanvas.getContext('2d');c.fillStyle='#172e35';c.textAlign='center';c.font='900 166px Arial';['B','M','O'].forEach((v,i)=>c.fillText(v,128,240+i*163));
 const label=new T.CanvasTexture(labelCanvas);label.colorSpace=T.SRGBColorSpace;
 for(const side of [-1,1]){
  const text=add(group,`side-name-${side}`,new T.PlaneGeometry(.77,1.93),new T.MeshBasicMaterial({map:label,transparent:true,toneMapped:false}),[side*(L.body.width/2+.002),1.57,0],0);text.rotation.y=side*Math.PI/2;
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
   const hole=add(group,`speaker-${side}-${row}-${col}`,new T.CircleGeometry(.023,16),dark,[side*(L.body.width/2+.003),3.14-row*.16,-.25+col*.23],0);hole.rotation.y=side*Math.PI/2;
  }
  path(group,`arm-${side}`,[[side*1.29,1.58,0],[side*1.47,1.12,.18],[side*1.49,.43,.46],[side*1.32,.19,.76]],.062);
  sphere(group,`palm-${side}`,.085,[side*1.32,.18,.80],[1,.65,1.1]);
  for(let i=0;i<3;i++){const x=side*1.32+(i-1)*.038;path(group,`finger-${side}-${i}`,[[x,.18,.83],[x,.16,.91]],.019);sphere(group,`fingertip-${side}-${i}`,.019,[x,.16,.91])}
  path(group,`leg-${side}`,[[side*.62,.19,.12],[side*.64,.10,.61],[side*.66,.09,1.16],[side*.67,.13,1.56]],.061);
  sphere(group,`foot-${side}`,.122,[side*.67,.23,1.62],[.64,1.45,.70]);
 }
 // A painted contact shadow anchors BMO in the illustrated scene.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;const sc=shadowCanvas.getContext('2d');
 const fade=sc.createRadialGradient(128,128,35,128,128,125);fade.addColorStop(0,'#30213965');fade.addColorStop(.65,'#30213935');fade.addColorStop(1,'#30213900');sc.fillStyle=fade;sc.fillRect(0,0,256,256);
 const shadowTex=new T.CanvasTexture(shadowCanvas);shadowTex.colorSpace=T.SRGBColorSpace;
 const shadow=add(group,'floor-contact-shadow',new T.PlaneGeometry(3.35,2.45),new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,toneMapped:false}),[0,.008,.48],0);shadow.rotation.x=-Math.PI/2;shadow.userData.shadow=true;
 scene.add(new T.AmbientLight('#d3c8df',1.1));
 const key=new T.DirectionalLight('#fff2dc',1.4);key.position.set(-3,6,7);scene.add(key);
 const fill=new T.DirectionalLight('#9990bd',.25);fill.position.set(3,2,1);scene.add(fill);
 function setPressed(control,pressed){control.position.z=L.controlZ-(pressed?L.pressTravel:0)}
 function audit(){group.updateMatrixWorld(true);const components=[];
  group.traverse(m=>{if(!m.isMesh||m.userData.outline)return;m.geometry.computeBoundingBox();const bounds=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);components.push({name:m.name,type:m.geometry.type,finite:[...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite),vertices:m.geometry.attributes.position.count})});
  return {components,controls:controls.map(m=>({id:m.name,action:m.userData.action,z:m.position.z,rotation:m.rotation.toArray().slice(0,3),depth:L.controlDepth,front:L.controlZ+L.controlDepth/2,protrusion:L.controlZ+L.controlDepth/2-L.body.depth/2}))};
 }
 return {group,face:display,controls,layout:L,screenPosition:new T.Vector3(L.screen.x,L.screen.y,L.screen.z),screenWidth:L.screen.width,screenHeight:L.screen.height,setPressed,audit,blink:face.paint};
}
