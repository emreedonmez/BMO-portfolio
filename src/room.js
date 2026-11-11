import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {ROOM,hollowTrunk} from './room-geometry.js';
import {floorTexture,rugTexture,timberTexture,barkMarks,clockTexture,paintedTexture} from './room-surfaces.js';

const UP=new T.Vector3(0,1,0),INK='#2c2033';
const inkMaterial=new T.MeshBasicMaterial({color:INK,side:T.BackSide,toneMapped:false});
const materialCache=new Map();
function cel(color,dark,light,marks){
 const key=[color,dark,light].join();if(!marks&&materialCache.has(key))return materialCache.get(key);
 const base=new T.Color(color),shadow=dark?new T.Color(dark):base.clone().multiplyScalar(.65),highlight=light?new T.Color(light):base.clone().lerp(new T.Color('#e4bdd8'),.15);
 const m=new T.ShaderMaterial({uniforms:{base:{value:base},shadow:{value:shadow},highlight:{value:highlight},marks:{value:marks||null},ink:{value:new T.Color('#3c2d46')}},
  vertexShader:`varying vec3 n;varying vec3 light;varying vec2 vUv;
   void main(){n=normalize(normalMatrix*normal);light=normalize(mat3(viewMatrix)*vec3(-.48,.72,.55));vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform vec3 base;uniform vec3 shadow;uniform vec3 highlight;uniform sampler2D marks;uniform vec3 ink;varying vec3 n;varying vec3 light;varying vec2 vUv;
   void main(){float d=dot(normalize(n),normalize(light)),aa=max(fwidth(d)*1.25,.001);vec3 c=mix(shadow,base,smoothstep(-.05-aa,-.05+aa,d));c=mix(c,highlight,smoothstep(.72-aa,.72+aa,d));${marks?'c=mix(c,ink,texture2D(marks,vUv).r);':''}gl_FragColor=vec4(c,1.);
   #include <colorspace_fragment>
   }`,toneMapped:false});
 if(!marks)materialCache.set(key,m);return m;
}
function hull(g,width){
 const geo=g.clone(),p=geo.attributes.position,n=geo.attributes.normal,shared=new Map(),keys=[];
 for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e5)).join(',');keys.push(key);const normal=shared.get(key)||new T.Vector3();normal.add(new T.Vector3(n.getX(i),n.getY(i),n.getZ(i)));shared.set(key,normal)}
 for(const normal of shared.values())normal.normalize();
 for(let i=0;i<p.count;i++){const normal=shared.get(keys[i]);p.setXYZ(i,p.getX(i)+normal.x*width,p.getY(i)+normal.y*width,p.getZ(i)+normal.z*width)}
 return geo;
}
function add(parent,name,g,material,pos=[0,0,0],stroke=.025){const m=new T.Mesh(g,typeof material==='string'?cel(material):material);m.name=name;m.position.set(...pos);m.userData.roomPart=true;parent.add(m);g.computeBoundingBox();const size=g.boundingBox.getSize(new T.Vector3());if(stroke&&Math.min(size.x,size.y,size.z)>.001){const o=new T.Mesh(hull(g,stroke),inkMaterial);o.userData.outline=true;m.add(o)}return m}
function box(parent,name,w,h,d,color,pos,r=.12,stroke=.025){return add(parent,name,new RoundedBoxGeometry(w,h,d,4,Math.min(r,w/2,h/2,d/2)),color,pos,stroke)}
function sphere(parent,name,r,color,pos,scale=[1,1,1],stroke=.025){const m=add(parent,name,new T.SphereGeometry(r,24,18),color,pos,stroke);m.scale.set(...scale);return m}
function pipe(parent,name,points,r,color,stroke=.025){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return add(parent,name,new T.TubeGeometry(path,Math.max(12,points.length*8),r,10,false),color,[0,0,0],stroke)}
function cylinder(parent,name,r,h,color,pos,stroke=.025){return add(parent,name,new T.CylinderGeometry(r,r,h,40),color,pos,stroke)}
function smoothShape(points){const s=new T.Shape();const last=points.at(-1),first=points[0];s.moveTo((last[0]+first[0])/2,(last[1]+first[1])/2);for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length];s.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2)}return s}
function extrude(shape,depth,bevel=.05){const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:24,steps:1});g.translate(0,0,-depth/2);return g}
function shadow(parent,name,x,z,rx,rz,opacity=.2,groundY=-.055){
 const material=new T.ShaderMaterial({uniforms:{ink:{value:new T.Color('#302039')},opacity:{value:opacity}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 ink;uniform float opacity;varying vec2 v;void main(){float a=1.-smoothstep(.40,1.,length(v*2.-1.));gl_FragColor=vec4(ink,a*opacity);\n#include <colorspace_fragment>\n}',transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,toneMapped:false});
 const localY=(groundY+.012-parent.position.y)/parent.scale.y;
 const m=add(parent,name,new T.PlaneGeometry(2,2),material,[x,localY,z],0);m.rotation.x=-Math.PI/2;m.scale.set(rx,rz,1);m.userData.shadow=true;m.renderOrder=10;return m;
}
function groundedLeg(parent,name,top,bottom,color,radius,groundY){
 const localGround=(groundY-parent.position.y)/parent.scale.y,footHeight=.11;
 const end=[bottom[0],localGround+footHeight*.75,bottom[1]],mid=[(top[0]+end[0])*.5,(top[1]+end[1])*.5,(top[2]+end[2])*.5+.06];
 const curve=new T.CatmullRomCurve3([new T.Vector3(...top),new T.Vector3(...mid),new T.Vector3(...end)]);
 add(parent,name+'-stem',variableTube(curve,t=>radius*(1.12-.20*t),24,12),color,[0,0,0],.023);
 cylinder(parent,name+'-joint',radius*1.5,.14,color,top,.018);
 const foot=add(parent,name+'-flat-foot',new T.CylinderGeometry(radius*1.12,radius*1.04,footHeight,24),color,[end[0],localGround+footHeight/2,end[2]],.016);
 foot.userData.groundContact=true;foot.userData.groundY=groundY;
 shadow(parent,name+'-contact',end[0],end[2],radius*2.8,radius*2.5,.36,groundY);
 return foot;
}

// Place independent solid objects against the drawing's composition, in a shared 3D floor.
export function roomCalibration(){
 const camera=new T.PerspectiveCamera(42,735/414,.2,160);camera.position.set(-5.5,6.5,23);camera.lookAt(0,1.62,.28);camera.setViewOffset(735,414,735/2-735*.535,414/2-414*.745,735,414);camera.updateMatrixWorld();
 const ray=new T.Raycaster(),floor=new T.Plane(UP,0);
 const cast=(u,v,plane)=>{ray.setFromCamera(new T.Vector2(u*2-1,1-v*2),camera);return ray.ray.intersectPlane(plane,new T.Vector3())};
 const ground=(u,v)=>cast(u,v,floor);
 const normal=new T.Vector3(camera.position.x,0,camera.position.z).normalize(),right=new T.Vector3(normal.z,0,-normal.x),yaw=Math.atan2(normal.x,normal.z);
 const point=(u,v,origin)=>cast(u,v,new T.Plane().setFromNormalAndCoplanarPoint(normal,origin));
 const height=(u,v,h)=>point(u,v-h,ground(u,v)).y;
 const width=(u,v,w)=>point(u+w/2,v,ground(u,v)).distanceTo(point(u-w/2,v,ground(u,v)));
 return {camera,ground,point,normal,right,yaw,height,width};
}

function makeTrunk(parent,name,base,radius,height,lean,seed,skipMiddle=false){
 const group=new T.Group();group.name=name;group.position.copy(base);group.position.y=ROOM.floor;group.rotation.y=roomCalibration().yaw;parent.add(group);
 const model=hollowTrunk(radius,height,lean,seed,skipMiddle),body=add(group,name+'-trunk',model.body,cel('#6c5577','#3c3049','#92738f',barkMarks(seed)),[0,0,0],.035);
 body.userData.cameraSolid=true;group.userData.trunk=model;
 for(const [i,hole]of model.cavities.entries()){
  add(group,name+'-knot-rim-'+i,hole.rim,cel('#a5899f','#5c4569','#b596ab'),[0,0,0],0);
  add(group,name+'-knot-bowl-'+i,hole.bowl,new T.MeshBasicMaterial({color:'#33273e',side:T.DoubleSide,toneMapped:false}),[0,0,0],0);
 }
 return group;
}

function createFloor(parent,C){
 const floor=new T.Group();floor.name='floor';floor.rotation.y=C.yaw;parent.add(floor);
 const base=add(floor,'continuous-floor',new T.PlaneGeometry(ROOM.width,ROOM.front-ROOM.back),new T.MeshBasicMaterial({map:floorTexture(),toneMapped:false}),[0,ROOM.floor,(ROOM.front+ROOM.back)/2],0);base.rotation.x=-Math.PI/2;
 const table=C.ground(.20,.883),x=table.dot(C.right),z=table.dot(C.normal);
 const shape=smoothShape(Array.from({length:32},(_,i)=>{const a=i/32*Math.PI*2;return [Math.cos(a)*8.2*(1+.015*Math.sin(i*3)),Math.sin(a)*6.2]}));
 const geometry=extrude(shape,.08,0),uv=geometry.attributes.uv,position=geometry.attributes.position;
 for(let i=0;i<uv.count;i++)uv.setXY(i,(position.getX(i)/8.5+1)/2,(position.getY(i)/6.4+1)/2);
 const rug=add(floor,'irregular-woven-rug',geometry,new T.MeshBasicMaterial({map:rugTexture(),toneMapped:false}),[x,ROOM.rugTop-.04,z],0);rug.rotation.x=-Math.PI/2;floor.userData.rug=rug;
 return floor;
}

function woodWall(parent,name,width,height,origin,yaw,window=null){
 const group=new T.Group();group.name=name;group.position.copy(origin);group.rotation.y=yaw;parent.add(group);
 const shape=new T.Shape();shape.moveTo(-width/2,ROOM.floor);shape.lineTo(width/2,ROOM.floor);shape.lineTo(width/2,height);shape.lineTo(-width/2,height);shape.closePath();
 if(window){const {x,y,w,h}=window,p=new T.Path();p.moveTo(x-w/2,y-h/2);p.lineTo(x-w/2,y+h/2);p.lineTo(x+w/2,y+h/2);p.lineTo(x+w/2,y-h/2);p.closePath();shape.holes.push(p)}
 const geometry=extrude(shape,.65,0),uv=geometry.attributes.uv,position=geometry.attributes.position;
 for(let i=0;i<uv.count;i++)uv.setXY(i,position.getX(i)/width+.5,position.getY(i)/height);
 const map=timberTexture(name.length*31);map.repeat.set(Math.max(1,width/32),1);
 map.wrapS=T.RepeatWrapping;
 add(group,name+'-solid-boards',geometry,new T.MeshBasicMaterial({map,toneMapped:false}),[0,0,-.325],0);
 for(const x of [-width/2+.3,width/2-.3])box(group,name+'-edge-beam',.45,height,.45,'#735979',[x,height/2,.23],.06,.02);
 if(window){
  const {x,y,w,h}=window;
  for(const xx of [x-w/2-.16,x+w/2+.16])box(group,name+'-window-upright',.32,h+.8,.8,'#8d5e76',[xx,y,.12],.06,.025);
  for(const yy of [y-h/2-.16,y+h/2+.16])box(group,name+'-window-crossbar',w+.95,.32,.9,'#8d5e76',[x,yy,.15],.06,.025);
  box(group,name+'-window-sill',w+1.3,.28,1.5,'#71505f',[x,y-h/2-.35,.5],.06,.025);
  const sky=new T.ShaderMaterial({uniforms:{lower:{value:new T.Color('#ffd48c')},upper:{value:new T.Color('#eb7f99')}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 lower;uniform vec3 upper;varying vec2 v;void main(){gl_FragColor=vec4(mix(lower,upper,v.y),1.);\n#include <colorspace_fragment>\n}',toneMapped:false});
  add(group,name+'-sunset-sky',new T.PlaneGeometry(w+.4,h+.4),sky,[x,y,-1.4],0);
  add(group,name+'-sun',new T.CircleGeometry(w*.22,48),new T.MeshBasicMaterial({color:'#ffddb0',toneMapped:false}),[x+w*.18,y-h*.20,-1.1],0);
  for(const [i,xx,yy]of [[0,-.2,.22],[1,.12,-.26]])for(let j=0;j<3;j++)sphere(group,name+'-sunset-cloud-'+i+'-'+j,w*.028,'#ffe4cc',[x+xx*w+(j-1)*w*.03,y+yy*h+Math.sin(j)*h*.01,-.95],[1.5,.55,.2],0);
 }
 return group;
}
function createWall(parent,C){
 const origin=C.normal.clone().multiplyScalar(ROOM.back),ray=new T.Raycaster(),plane=new T.Plane().setFromNormalAndCoplanarPoint(C.normal,origin);
 function onWall(u,v){ray.setFromCamera(new T.Vector2(u*2-1,1-v*2),C.camera);const p=ray.ray.intersectPlane(plane,new T.Vector3()).sub(origin);return new T.Vector2(p.dot(C.right),p.y)}
 const center=onWall(.25,.277),left=onWall(.202,.277),right=onWall(.298,.277),top=onWall(.25,.174),bottom=onWall(.25,.375);
 return woodWall(parent,'back-wall',ROOM.width,ROOM.height,origin,C.yaw,{x:center.x,y:center.y,w:right.x-left.x,h:top.y-bottom.y});
}

function createCouch(parent,C){
 const g=new T.Group();g.name='purple-couch';g.position.copy(C.ground(.552,.662));g.rotation.y=C.yaw+.06;
 const width=C.width(.552,.662,.247),height=C.height(.552,.662,.43);g.scale.set(width/9,height/10,width/9);parent.add(g);
 shadow(g,'couch-shadow',0,0,5.2,2.9,.13);
 for(const x of [-3.5,3.5])for(const z of [-1.45,1.5])groundedLeg(g,`couch-leg-${x}-${z}`,[x,1.5,z],[x*1.04,z+.22],'#4b3245',.145,-.055);
 const backShape=smoothShape([[-4.15,2],[-4.38,8.9],[-3.7,9.85],[-.1,9.95],[3.8,9.85],[4.25,9.1],[4.0,2]]);
 add(g,'couch-back-frame',extrude(backShape,1.0,.12),cel('#56305f','#302337','#7d447d'),[0,0,-1.65],.055);
 box(g,'couch-seat-base',8.4,1.25,4.5,'#55305f',[0,1.85,0],.4,.045);
 for(const x of [-2.02,2.02]){
  box(g,'seat-cushion',3.88,.65,3.55,cel('#bf5198','#743a78','#d46eaf'),[x,2.75,.18],.28,.035);
  const geo=new RoundedBoxGeometry(3.8,5.6,.8,6,.35),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const xx=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);if(z>0){let bulge=.24*Math.max(0,1-(xx/1.9)**2)*Math.max(0,1-(y/2.8)**2);for(const yy of [-.95,1.05])bulge-=.14*Math.exp(-((xx*.85)**2+(y-yy)**2)*5);pos.setZ(i,z+bulge)}}geo.computeVertexNormals();
  add(g,'tufted-back-cushion',geo,cel('#693872','#402546','#85457f'),[x,6.15,-1.15],.035);
  for(const y of [5.15,7.2]){const tuft=add(g,'cushion-tuft',new T.SphereGeometry(.10,12,8),cel('#8e4e89'),[x,y,-.61],.015);tuft.scale.z=.25}
 }
 for(const side of [-1,1]){
  const shape=smoothShape([[-2.3,1.3],[-2.4,4.1],[-2.0,4.65],[-1.55,4.6],[-1.2,3.6],[.1,3.5],[1.3,4.4],[1.55,7.0],[2.0,9.5],[2.5,9.2],[2.55,1.4]]);
  const geo=extrude(shape,.65,.10);geo.rotateY(Math.PI/2);add(g,'curved-armrest-'+side,geo,cel('#773d79','#422a50','#9c4b92'),[side*4.05,0,0],.045);
  pipe(g,'pink-arm-piping-'+side,[[side*4.42,1.45,2.25],[side*4.42,3.7,2.25],[side*4.42,4.45,1.96],[side*4.42,4.12,1.40],[side*4.42,3.55,.3],[side*4.42,4.6,-1.33],[side*4.42,8.8,-2.0]],.075,'#cc67a8',.017);
  sphere(g,'armrest-roll-'+side,.27,'#a9579c',[side*4.2,4.1,2.05],[1.1,1.1,1.1],.025);
  sphere(g,'armrest-button-'+side,.105,'#a65b98',[side*4.40,4.11,1.90],[.25,1,1],.017);
 }
 for(const x of [-3.3,0,3.3])pipe(g,'back-pink-piping',[[x,3.75,-.62],[x+.17,5.0,-.57],[x-.15,6.75,-.60],[x+.14,8.45,-.65],[x,8.85,-.75]],.052,'#cb63a4',.012);
 return g;
}

function createLowTable(parent,C){
 const g=new T.Group();g.name='foreground-table';g.position.copy(C.ground(.20,.883));g.rotation.y=C.yaw-.1;parent.add(g);
 const radius=C.width(.20,.883,.247)/2;
 const points=Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2;return [Math.cos(a)*radius*(1+.025*Math.sin(i*3)),Math.sin(a)*radius*.78]});
 const shape=smoothShape(points),topGroup=new T.Group();topGroup.position.y=3.05;topGroup.rotation.x=.17;g.add(topGroup);
 const top=add(topGroup,'burgundy-tabletop',extrude(shape,.27,.045),cel('#a14461','#632b46','#b45170'),[0,0,0],.04);top.rotation.x=-Math.PI/2;
 for(const [i,x,z]of [[0,-radius*.7,-radius*.35],[1,radius*.66,-radius*.35],[2,-radius*.68,radius*.42],[3,radius*.64,radius*.46]])groundedLeg(g,'table-leg-'+i,[x,3.0-z*.17,z],[x*1.05,z+.13],'#714452',.145,.025);
 shadow(g,'table-contact-shadow',0,0,radius*.94,radius*.72,.13,.025);
 const marks=paintedTexture(512,512,(x)=>{x.strokeStyle='#643247';x.lineWidth=2;for(const [a,b]of [[340,280],[355,300],[90,240]]){x.beginPath();x.moveTo(a,b);x.lineTo(a+25,b+5);x.stroke()}},true);
 const uv=top.geometry.attributes.uv,position=top.geometry.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(position.getX(i)/radius+1)/2,(position.getY(i)/(radius*.78)+1)/2);
 top.material=cel('#a14461','#632b46','#b45170',marks);
 const book=new T.Group();book.position.set(-.35,.3472,.05);book.rotation.y=-.24;book.scale.setScalar(.76);topGroup.add(book);
 box(book,'book-pages',2.75,.28,1.85,'#bca885',[0,0,0],.08,.025);
 box(book,'olive-book-bottom',2.95,.10,2.05,'#77713d',[0,-.17,0],.10,.028);
 const cover=box(book,'olive-book-cover',3.0,.12,2.08,'#999357',[0,.18,0],.1,.032),coverUV=cover.geometry.attributes.uv,coverPosition=cover.geometry.attributes.position;
 for(let i=0;i<coverUV.count;i++)coverUV.setXY(i,(coverPosition.getX(i)/1.5+1)/2,(coverPosition.getZ(i)/1.04+1)/2);
 const coverMarks=paintedTexture(512,512,(x)=>{x.strokeStyle='#645b37';x.lineWidth=1.5;x.beginPath();x.moveTo(43,79);x.lineTo(43,436);x.lineTo(461,436);x.moveTo(276,158);x.lineTo(341,162);x.stroke()},true);
 cover.material=cel('#999357','#615a38','#b5a96a',coverMarks);cover.material.uniforms.ink.value.set('#645b37');
 const cup=new T.Group();cup.position.set(-radius*.62,.18,-radius*.08);topGroup.add(cup);
 add(cup,'cup-body',new T.CylinderGeometry(.32,.27,1.15,32,1,true),cel('#9fbce0','#5f79a4','#ccdbed'),[0,.58,0],.023);
 const rim=add(cup,'cup-rim',new T.TorusGeometry(.32,.035,10,36),cel('#d4e2f0'),[0,1.16,0],.007);rim.rotation.x=Math.PI/2;
 const inside=add(cup,'cup-interior',new T.CircleGeometry(.28,32),new T.MeshBasicMaterial({color:'#435e88'}),[0,1.11,0],0);inside.rotation.x=-Math.PI/2;
 const handle=add(cup,'cup-handle',new T.TorusGeometry(.26,.065,10,30),cel('#aec9e6'),[-.35,.68,0],.014);handle.scale.y=1.35;
 return g;
}

function drawAlbum(kind){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle=kind?'#eca064':'#8a70d5';x.fillRect(0,0,512,512);
 x.strokeStyle='#fff0c7';x.lineWidth=12;x.strokeRect(18,18,476,476);x.fillStyle=kind?'#d359a1':'#ffbf36';x.beginPath();x.ellipse(265,300,155,164,0,0,Math.PI*2);x.fill();
 if(!kind){for(const px of [195,333]){x.fillStyle='#fff4ca';x.beginPath();x.ellipse(px,267,46,59,0,0,Math.PI*2);x.fill();x.fillStyle='#30253b';x.beginPath();x.ellipse(px+4,274,17,27,0,0,Math.PI*2);x.fill()}x.fillStyle='#654a29';x.beginPath();x.ellipse(266,344,55,36,0,0,Math.PI*2);x.fill()}
 else{x.fillStyle='#5b374b';x.beginPath();x.ellipse(265,300,72,107,0,0,Math.PI*2);x.fill();x.fillStyle='#ebbdad';x.beginPath();x.ellipse(265,310,49,65,0,0,Math.PI*2);x.fill()}
 x.fillStyle='#ffe4a5';for(let i=0;i<12;i++){x.beginPath();x.arc(30+(i*91)%450,35+(i*127)%160,5,0,Math.PI*2);x.fill()}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:t,toneMapped:false});
}
function variableTube(curve,radius,segments=72,sides=32){const p=[],idx=[],frames=curve.computeFrenetFrames(segments,false);
 for(let j=0;j<=segments;j++){const t=j/segments,c=curve.getPoint(t),r=radius(t);for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2,v=c.clone().addScaledVector(frames.normals[j],Math.cos(a)*r).addScaledVector(frames.binormals[j],Math.sin(a)*r);p.push(...v.toArray())}}
 for(let j=0;j<segments;j++)for(let i=0;i<sides;i++){const a=j*(sides+1)+i,b=a+sides+1;idx.push(a,b,a+1,b,b+1,a+1)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
function createGramophone(parent,C){
 const g=new T.Group();g.name='gramophone-corner';g.position.copy(C.ground(.742,.703));g.rotation.y=C.yaw-.04;parent.add(g);
 const tableRadius=4.0;
 cylinder(g,'side-table-rim',tableRadius,.28,cel('#82445a','#492c43','#a15a6e'),[0,3.05,0],.04);
 for(const x of [-2.6,2.6])for(const z of [-1.9,1.9])groundedLeg(g,`side-table-leg-${x}-${z}`,[x,3,z],[x*.75,z*.8],'#744554',.15,-.055);
 const lower=add(g,'table-lower-ring',new T.TorusGeometry(3.15,.09,8,52),cel('#684052'),[0,1.08,0],.018);lower.rotation.x=Math.PI/2;lower.scale.y=.72;
 shadow(g,'gramophone-shadow',.2,.2,4.2,3.1,.13);
 const record=new T.Group();record.position.set(.8,3.846,-1.0);record.rotation.y=.14;record.scale.setScalar(.82);g.add(record);
 box(record,'record-player-base',4.5,1.60,3.0,'#aa6a67',[0,0,0],.18,.045);
 const disc=add(record,'green-record',new T.CylinderGeometry(1.15,1.15,.055,48),cel('#3c675b','#2c413e','#699278'),[-.22,.84,.12],.014);
 for(const r of [.45,.78,1.02]){const ring=add(record,'vinyl-groove',new T.TorusGeometry(r,.012,6,60),new T.MeshBasicMaterial({color:'#83a07b'}),[-.22,.873,.12],0);ring.rotation.x=Math.PI/2}
 cylinder(record,'record-label',.26,.06,cel('#d9a66d'),[-.22,.875,.12],.012);
 pipe(record,'tone-arm',[[1.75,.88,-.9],[1.65,.92,.5],[.75,.94,.75]],.06,'#bc9c77',.012);
 const lid=new T.Group();lid.position.set(0,.76,-1.35);lid.rotation.x=-.43;record.add(lid);
 box(lid,'open-turntable-lid',4.5,4.5,.24,'#b4786b',[0,2.2,0],.18,.04);
 const decoration=add(lid,'lid-green-inlay',new T.CylinderGeometry(1.23,1.23,.04,48),cel('#52705f'),[0,2.2,.16],.008);decoration.rotation.x=Math.PI/2;decoration.scale.z=.85;
 add(lid,'lid-center-medallion',new T.CircleGeometry(.28,30),cel('#d59b77'),[0,2.2,.19],0);
 pipe(record,'crank',[[2.2,.0,0],[3.2,.0,0],[3.2,.45,0]],.08,'#937667',.02);sphere(record,'red-crank-handle',.20,'#b24c5b',[3.2,.50,0],[1.5,.9,.9],.02);
 const hornPoints=[[2.1,4.2,-1.5],[2.3,7.1,-1.6],[2.25,11.5,-1.5],[1.5,14.1,-1.3],[-1.0,15.4,-1.15],[-3.6,16.0,-.7]];
 const curve=new T.CatmullRomCurve3(hornPoints.map(p=>new T.Vector3(...p))),radius=t=>.42+.10*t+1.82*Math.pow(Math.max(0,(t-.58)/.42),2.2);
 const hornGeo=variableTube(curve,radius);add(g,'curved-gramophone-horn',hornGeo,cel('#88558e','#49314f','#a171a7'),[0,0,0],.03);
 const inner=new T.Mesh(hornGeo.clone(),new T.MeshBasicMaterial({color:'#4a2855',side:T.BackSide,toneMapped:false}));inner.name='horn-inner-bell';g.add(inner);
 const end=curve.getPoint(1),tangent=curve.getTangent(1),rim=add(g,'horn-bell-rim',new T.TorusGeometry(radius(1),.095,12,64),cel('#ba79bc','#593c6b','#cf91cf'),end.toArray(),.026);rim.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),tangent);
 const innerRim=add(g,'horn-inner-lip',new T.TorusGeometry(radius(1)-.18,.04,8,64),cel('#4b2c59'),end.clone().addScaledVector(tangent,-.07).toArray(),.012);innerRim.quaternion.copy(rim.quaternion);
 for(let i=0;i<10;i++){const t=.12+i*.067,center=curve.getPoint(t),n=curve.computeFrenetFrames(72,false).normals[Math.floor(t*72)];sphere(g,'horn-rivet',.052,'#4a3052',center.clone().addScaledVector(n,radius(t)+.03).toArray(),[1,1,1],0)}
 for(const [i,x,z,w,h]of [[0,-2.2,1.65,1.8,2.4],[1,-.55,2.35,1.3,1.55]]){
  const picture=new T.Group();picture.name='record-frame-'+i;picture.position.set(x,3.19+(h+.14)/2,z);picture.rotation.x=-.12;g.add(picture);
  box(picture,'record-sleeve-frame-'+i,w+.14,h+.14,.16,i?'#a6555c':'#c7b2dc',[0,0,0],.035,.015);
  add(picture,'record-sleeve-art-'+i,new T.PlaneGeometry(w,h),drawAlbum(i),[0,0,.105],0);
  box(picture,'frame-support-'+i,.13,h*.55,.13,'#70506b',[0,-h*.20,-h*.20],.025,.008);
  picture.updateMatrixWorld(true);picture.position.y+=3.19-new T.Box3().setFromObject(picture).min.y;picture.userData.tableContact=3.19;
 }
 const radio=new T.Group();radio.name='radio-assembly';radio.scale.setScalar(.83);radio.position.set(1.8,3.19+1.45*.83/2,1.6);radio.rotation.y=-.1;g.add(radio);
 box(radio,'portable-radio',3.0,1.45,.95,cel('#718b72','#40584e','#9aab84'),[0,0,0],.18,.035);
 for(const x of [-.92,.92]){const s=add(radio,'radio-speaker',new T.CircleGeometry(.40,30),cel('#3b5550'),[x,0,.49],.012);for(let i=-2;i<=2;i++)box(radio,'speaker-slat',.50,.04,.01,'#88a28b',[x,i*.105,.505],.006,0)}
 box(radio,'radio-tuning-window',.53,.65,.025,'#b0aa80',[0,.1,.50],.035,.015);box(radio,'radio-frequency',.05,.5,.015,'#554b54',[.1,.1,.523],.005,0);
 pipe(radio,'radio-handle',[[-1.1,.55,-.12],[-1.0,1.95,-.12],[.8,1.95,-.12],[1.1,.55,-.12]],.10,'#819478',.027);
 cylinder(g,'headphone-stand-base',.5,.12,'#77546b',[-2.7,3.25,-1.8],.015);
 pipe(g,'headphone-stand',[[-2.7,3.3,-1.8],[-2.7,6.52,-1.8],[-2.7,6.52,-1.6]],.065,'#77546b',.012);
 const headphones=new T.Group();headphones.name='headphones-assembly';headphones.position.set(-2.7,5.05,-1.6);g.add(headphones);
 pipe(headphones,'headphone-band',[[-.75,-.1,0],[-.75,1.1,0],[0,1.65,0],[.75,1.05,0],[.75,-.1,0]],.12,'#4c6183',.035);
 for(const side of [-1,1]){const e=cylinder(headphones,'headphone-earcup',.38,.26,'#4e668b',[side*.78,0,0],.025);e.rotation.z=Math.PI/2}
 return g;
}

function createClock(parent,C,trunk){
 parent.updateMatrixWorld(true);const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(.38*2-1,1-.191*2),C.camera);
 const body=trunk.getObjectByName('middle-back-trunk-trunk'),hit=ray.intersectObject(body,false)[0];
 const group=new T.Group();group.name='blue-clock';parent.add(group);
 const normal=hit?hit.face.normal.clone().transformDirection(body.matrixWorld):C.normal.clone();
 const point=hit?hit.point:new T.Vector3().copy(trunk.position).add(new T.Vector3(0,17,0));
 const distance=point.distanceTo(C.camera.position),radius=distance*Math.tan(T.MathUtils.degToRad(21))*(735/414)*.047;
 group.position.copy(point).addScaledVector(normal,radius*.14+.18);group.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),normal);
 const disk=add(group,'blue-clock-case',new T.CylinderGeometry(radius,radius,radius*.26,64),cel('#5e68c5','#343361','#8992df'),[0,0,0],.025);disk.rotation.x=Math.PI/2;
 add(group,'clock-dial',new T.CircleGeometry(radius*.81,64),new T.MeshBasicMaterial({map:clockTexture(),toneMapped:false}),[0,0,radius*.15],0);
 add(group,'clock-bezel',new T.TorusGeometry(radius*.90,radius*.08,12,64),cel('#7883d3'),[0,0,radius*.13],.009);
 add(group,'clock-hanger',new T.TorusGeometry(radius*.12,radius*.025,10,36),cel('#ab91b8'),[0,radius*1.10,-radius*.02],0);
 group.userData.mountGap=.18;return group;
}

function createSurroundings(parent,C){
 const enclosure=new T.Group();enclosure.name='360-room-enclosure';parent.add(enclosure);
 const local=(x,z)=>C.right.clone().multiplyScalar(x).addScaledVector(C.normal,z);
 woodWall(enclosure,'left-wall',ROOM.front-ROOM.back,ROOM.height,local(-ROOM.width/2,(ROOM.front+ROOM.back)/2),C.yaw+Math.PI/2);
 woodWall(enclosure,'right-wall',ROOM.front-ROOM.back,ROOM.height,local(ROOM.width/2,(ROOM.front+ROOM.back)/2),C.yaw-Math.PI/2);
 woodWall(enclosure,'rear-wall',ROOM.width,ROOM.height,local(0,ROOM.front),C.yaw+Math.PI,{x:17,y:12,w:6,h:8});
 const ceiling=box(enclosure,'timber-ceiling',ROOM.width,.5,ROOM.front-ROOM.back,cel('#49334f','#302334','#604366'),[0,ROOM.height+.25,0],.05,0);ceiling.position.add(local(0,(ROOM.front+ROOM.back)/2));ceiling.rotation.y=C.yaw;
 for(const x of [-30,30])makeTrunk(enclosure,'rear-corner-'+x,local(x,29),1.8,ROOM.height+.4,.25,111+x);
 const chest=new T.Group();chest.name='rear-storage-bench';chest.position.copy(local(16,28));chest.rotation.y=C.yaw+Math.PI;enclosure.add(chest);
 box(chest,'storage-chest',11,4.3,4.6,cel('#795264','#4e3548','#99677b'),[0,2.1,0],.35,.045);
 box(chest,'storage-curved-lid',11.2,.65,4.8,'#986578',[0,4.45,0],.25,.035);
 for(const x of [-3.6,3.6])box(chest,'chest-metal-strap',.4,4.3,4.7,'#554a63',[x,2.15,0],.05,.015);
 box(chest,'chest-latch',.7,.9,.18,'#c4a17b',[0,3.4,2.42],.08,.015);
 shadow(chest,'chest-contact-shadow',0,0,5.9,2.7,.14);
 const stack=new T.Group();stack.position.copy(local(-15,27));stack.rotation.y=C.yaw;enclosure.add(stack);
 for(let i=0;i<4;i++){const book=box(stack,'rear-book-'+i,4.8,.75,3.4,['#678e83','#b78472','#b7a166','#7d6697'][i],[i%2*.25,ROOM.floor+.375+i*.75,0],.08,.02);book.rotation.y=i%2?-.12:.12}
 return enclosure;
}

export function createRoom(scene){
 const root=new T.Group();root.name='fully-modelled-treehouse';scene.add(root);const C=roomCalibration(),local=(x,z)=>C.right.clone().multiplyScalar(x).addScaledVector(C.normal,z);
 createFloor(root,C);createWall(root,C);
 const camera=C.camera,ray=new T.Raycaster(),plane=new T.Plane().setFromNormalAndCoplanarPoint(C.normal,local(0,-37));ray.setFromCamera(new T.Vector2(.38*2-1,1-.191*2),camera);const clockRayPoint=ray.ray.intersectPlane(plane,new T.Vector3()),clockX=clockRayPoint.dot(C.right);
 const trunks=[];
 for(const [name,x,z,r,lean,seed]of [
  ['left-frame-trunk',-32.2,-24,2.2,-.25,17],['left-back-trunk',-29,-37,1.9,.2,29],
  ['middle-back-trunk',clockX,-37,1.75,.12,43],['curved-couch-trunk',-3.6,-36,2.25,-.3,61],
  ['right-back-trunk',11.8,-27,2.3,.25,79],['right-frame-trunk',13.73,-3.05,2.999,.3,97]
 ])trunks.push(makeTrunk(root,name,local(x,z),r,ROOM.height+.4,lean,seed,name==='middle-back-trunk'));
 const couch=createCouch(root,C);couch.position.addScaledVector(C.normal,-7);
 createLowTable(root,C);createGramophone(root,C);createClock(root,C,trunks[2]);createSurroundings(root,C);
 const shelf=new T.Group();shelf.name='wall-shelf';shelf.position.copy(local(3,ROOM.back+1.4));shelf.position.y=20;shelf.rotation.y=C.yaw;root.add(shelf);
 box(shelf,'high-wall-shelf',8,.4,2,'#684555',[0,0,0],.1,.035);
 const skull=sphere(shelf,'shelf-skull',.95,'#c6b6c5',[.4,1.1,0],[1.2,1,1],.025);
 const eyes=paintedTexture(1024,512,(x,w,h)=>{x.fillStyle='#33283e';for(const a of [-1,1]){x.beginPath();x.ellipse(w*(.25+a*.052),h*.51,w*.025,h*.07,0,0,Math.PI*2);x.fill()}},true);skull.material=cel('#c6b6c5',null,null,eyes);
 for(const x of [-2.8,2.8])pipe(shelf,'shelf-support',[[x,-1.5,-1.38],[x,-.22,.65],[x,-.22,-1.38]],.10,'#6d485a',.015);
 for(let i=0;i<4;i++)box(shelf,'skull-tooth',.22,.3,.24,'#c7b5c2',[.04+i*.24,.38,.65],.04,.008);
 root.updateMatrixWorld(true);
 // Collide only with a surface the camera actually travels into; objects may naturally occlude BMO.
 const solids=[];root.traverse(m=>{if(!m.isMesh||m.userData.outline||m.userData.ink||m.userData.shadow||m.material.transparent)return;m.geometry.computeBoundingBox();const size=m.geometry.boundingBox.getSize(new T.Vector3());if(Math.min(size.x,size.y,size.z)>.03)solids.push(m)});
 const movementRay=new T.Raycaster();
 function constrainCamera(position,previous,target){
  const a=previous.clone().sub(target),b=position.clone().sub(target),r0=Math.hypot(a.x,a.z),r1=Math.hypot(b.x,b.z),angle=Math.atan2(a.x,a.z),turn=Math.atan2(Math.sin(Math.atan2(b.x,b.z)-angle),Math.cos(Math.atan2(b.x,b.z)-angle));
  const steps=Math.max(1,Math.ceil((Math.abs(turn)*Math.max(r0,r1)+Math.abs(r1-r0)+Math.abs(b.y-a.y))/.55));let start=previous.clone();
  for(let i=1;i<=steps;i++){
   const t=i/steps,r=T.MathUtils.lerp(r0,r1,t),theta=angle+turn*t,end=new T.Vector3(Math.sin(theta)*r,T.MathUtils.lerp(a.y,b.y,t),Math.cos(theta)*r).add(target),delta=end.clone().sub(start),distance=delta.length();if(distance<1e-8)continue;
   movementRay.set(start,delta.normalize());movementRay.near=0;movementRay.far=distance+.22;
   const hit=movementRay.intersectObjects(solids,false)[0];if(hit)return start.addScaledVector(movementRay.ray.direction,Math.max(0,Math.min(distance,hit.distance-.22)));start=end;
  }
  return position.clone();
 }
 function audit(){const parts=[],contacts=[],shadows=[],cavities=[];root.traverse(m=>{
  if(m.userData.trunk)for(const c of m.userData.trunk.cavities)cavities.push({trunk:m.name,center:c.center.clone().applyMatrix4(m.matrixWorld).toArray(),normal:c.normal.clone().transformDirection(m.matrixWorld).toArray(),radius:c.radius});
  if(!m.isMesh||m.userData.outline||!m.geometry)return;m.geometry.computeBoundingBox();const b=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
  parts.push({name:m.name,type:m.geometry.type,vertices:m.geometry.attributes.position.count,finite:[...b.min.toArray(),...b.max.toArray()].every(Number.isFinite),size:b.getSize(new T.Vector3()).toArray()});
  if(m.userData.groundContact)contacts.push({name:m.name,bottom:b.min.y,ground:m.userData.groundY,gap:b.min.y-m.userData.groundY});
  if(m.userData.shadow)shadows.push({name:m.name,y:m.getWorldPosition(new T.Vector3()).y,depthWrite:m.material.depthWrite,renderOrder:m.renderOrder});
 });return {parts,contacts,shadows,cavities,dimensions:ROOM,full3D:true,roomImage:false,enclosed:true}}
 return {group:root,audit,constrainCamera,landmarks:{couch:root.getObjectByName('purple-couch'),table:root.getObjectByName('foreground-table'),gramophone:root.getObjectByName('gramophone-corner'),clock:root.getObjectByName('blue-clock'),rug:root.getObjectByName('irregular-woven-rug')}};
}
