import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {LineSegments2} from 'three/addons/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/addons/lines/LineSegmentsGeometry.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';

const UP=new T.Vector3(0,1,0),INK='#2c2033';
const inkMaterial=new T.MeshBasicMaterial({color:INK,side:T.BackSide,toneMapped:false});
const materialCache=new Map();
function cel(color,dark,light){
 const key=[color,dark,light].join();if(materialCache.has(key))return materialCache.get(key);
 const base=new T.Color(color),shadow=dark?new T.Color(dark):base.clone().multiplyScalar(.65),highlight=light?new T.Color(light):base.clone().lerp(new T.Color('#e4bdd8'),.15);
 const m=new T.ShaderMaterial({uniforms:{base:{value:base},shadow:{value:shadow},highlight:{value:highlight}},
  vertexShader:`varying vec3 n;varying vec3 light;varying vec3 local;
   void main(){n=normalize(normalMatrix*normal);light=normalize(mat3(viewMatrix)*vec3(-.48,.72,.55));local=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform vec3 base;uniform vec3 shadow;uniform vec3 highlight;varying vec3 n;varying vec3 light;varying vec3 local;
   void main(){float d=dot(normalize(n),normalize(light));vec3 c=d<-.05?shadow:(d>.72?highlight:base);float paper=fract(sin(dot(floor(local*23.),vec3(12.9898,78.233,37.719)))*43758.5453);c*=.988+paper*.024;gl_FragColor=vec4(c,1.);
   #include <colorspace_fragment>
   }`,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1,toneMapped:false});
 materialCache.set(key,m);return m;
}
function hull(g,width){const geo=g.clone(),p=geo.attributes.position,n=geo.attributes.normal;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)+n.getX(i)*width,p.getY(i)+n.getY(i)*width,p.getZ(i)+n.getZ(i)*width);return geo}
function add(parent,name,g,material,pos=[0,0,0],stroke=.025){const m=new T.Mesh(g,typeof material==='string'?cel(material):material);m.name=name;m.position.set(...pos);m.userData.roomPart=true;parent.add(m);if(stroke){const o=new T.Mesh(hull(g,stroke),inkMaterial);o.userData.outline=true;m.add(o)}return m}
function box(parent,name,w,h,d,color,pos,r=.12,stroke=.025){return add(parent,name,new RoundedBoxGeometry(w,h,d,4,Math.min(r,w/2,h/2,d/2)),color,pos,stroke)}
function sphere(parent,name,r,color,pos,scale=[1,1,1],stroke=.025){const m=add(parent,name,new T.SphereGeometry(r,24,18),color,pos,stroke);m.scale.set(...scale);return m}
function pipe(parent,name,points,r,color,stroke=.025){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return add(parent,name,new T.TubeGeometry(path,Math.max(12,points.length*8),r,10,false),color,[0,0,0],stroke)}
function cylinder(parent,name,r,h,color,pos,stroke=.025){return add(parent,name,new T.CylinderGeometry(r,r,h,40),color,pos,stroke)}
function contour(parent,name,paths,color=INK,width=1.1){const a=[];for(const path of paths)for(let i=1;i<path.length;i++)a.push(...path[i-1],...path[i]);if(!a.length)return;const geo=new LineSegmentsGeometry();geo.setPositions(a);const m=new LineSegments2(geo,new LineMaterial({color,linewidth:width,depthWrite:false}));m.name=name;m.computeLineDistances();m.userData.ink=true;parent.add(m);return m}
function smoothShape(points){const s=new T.Shape();const last=points.at(-1),first=points[0];s.moveTo((last[0]+first[0])/2,(last[1]+first[1])/2);for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length];s.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2)}return s}
function extrude(shape,depth,bevel=.05){const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:24,steps:1});g.translate(0,0,-depth/2);return g}
function rng(seed){return ()=>{seed=(seed*16807)%2147483647;return seed/2147483647}}
function shadow(parent,name,x,z,rx,rz,opacity=.2){const m=add(parent,name,new T.CircleGeometry(1,64),new T.MeshBasicMaterial({color:'#382b48',transparent:true,opacity,depthWrite:false,toneMapped:false}),[x,.022,z],0);m.rotation.x=-Math.PI/2;m.scale.set(rx,rz,1);m.userData.shadow=true;return m}

// Place independent solid objects against the drawing's composition, in a shared 3D floor.
export function roomCalibration(){
 const camera=new T.PerspectiveCamera(42,735/414,.1,1200);camera.position.set(-5.5,6.5,23);camera.lookAt(0,1.62,.28);camera.setViewOffset(735,414,735/2-735*.535,414/2-414*.745,735,414);camera.updateMatrixWorld();
 const ray=new T.Raycaster(),floor=new T.Plane(UP,0);
 const cast=(u,v,plane)=>{ray.setFromCamera(new T.Vector2(u*2-1,1-v*2),camera);return ray.ray.intersectPlane(plane,new T.Vector3())};
 const ground=(u,v)=>cast(u,v,floor);
 const normal=new T.Vector3(camera.position.x,0,camera.position.z).normalize(),right=new T.Vector3(normal.z,0,-normal.x),yaw=Math.atan2(normal.x,normal.z);
 const point=(u,v,origin)=>cast(u,v,new T.Plane().setFromNormalAndCoplanarPoint(normal,origin));
 const height=(u,v,h)=>point(u,v-h,ground(u,v)).y;
 const width=(u,v,w)=>point(u+w/2,v,ground(u,v)).distanceTo(point(u-w/2,v,ground(u,v)));
 return {camera,ground,point,normal,right,yaw,height,width};
}

function makeTrunk(parent,name,base,radius,height,lean,seed){
 const random=rng(seed),rings=32,sides=32,positions=[],indices=[];
 const centers=[];const center=t=>new T.Vector3(Math.sin(t*5+seed)*radius*.1+lean*t, t*height,Math.sin(t*4+seed*.3)*radius*.1);
 const rad=t=>radius*(1-.16*t+.06*Math.sin(t*8+seed));
 for(let j=0;j<=rings;j++){const t=j/rings,c=center(t);centers.push(c);for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2,r=rad(t)*(1+.05*Math.sin(a*5+seed));positions.push(c.x+Math.cos(a)*r,c.y,c.z+Math.sin(a)*r*.76)}}
 for(let j=0;j<rings;j++)for(let i=0;i<sides;i++){const a=j*(sides+1)+i,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1)}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
 const group=new T.Group();group.name=name;group.position.copy(base);parent.add(group);add(group,name+'-trunk',geo,cel('#6c5577','#3c3049','#92738f'),[0,0,0],radius*.018);
 const paths=[];
 for(let i=0;i<105;i++){
  const a=random()*Math.PI*2,t0=random()*.97,len=.025+random()*.12,p=[];
  for(let k=0;k<=5;k++){const t=Math.min(1,t0+len*k/5),c=center(t),angle=a+.017*Math.sin(k*1.6+i),r=rad(t)*(1+.05*Math.sin(angle*5+seed))+.012;p.push([c.x+Math.cos(angle)*r,c.y,c.z+Math.sin(angle)*r*.76])}paths.push(p);
 }
 contour(group,name+'-bark-grain',paths,'#3c2d46',1.0);
 // Knots are rings on the cylindrical bark, with inset dark centers.
 for(const [j,t]of [.25,.62,.84].entries()){
  const a=1.5+(j%2)*.55,c=center(t),r=rad(t),pos=[c.x+Math.cos(a)*r,c.y,c.z+Math.sin(a)*r*.76];
  const knot=new T.Group();knot.position.set(...pos);knot.rotation.y=Math.PI/2-a;group.add(knot);
  const rim=add(knot,name+'-knot-rim-'+j,new T.TorusGeometry(radius*.24,radius*.045,8,30),cel('#a5899f','#5c4569','#b596ab'),[0,0,.02],.025);rim.scale.y=2.1;
  const hole=add(knot,name+'-knot-hole-'+j,new T.CircleGeometry(radius*.19,32),new T.MeshBasicMaterial({color:'#32273e',toneMapped:false}),[0,0,.024],0);hole.scale.y=2.4;
 }
 return group;
}

function createFloor(parent,C){
 const floor=new T.Group();floor.name='floor';parent.add(floor);
 const base=add(floor,'continuous-floor',new T.PlaneGeometry(1000,1000),cel('#b0a2d1','#82749d','#c0b0db'),[0,-.055,-100],0);base.rotation.x=-Math.PI/2;
 const boards=new T.Group();boards.rotation.y=.18;floor.add(boards);const random=rng(71),seams=[],scratches=[];
 for(let i=-62;i<=62;i++){
  const x=i*2.7;
  const pts=[];for(let j=0;j<=28;j++){const z=-400+j*17;pts.push([x+Math.sin(j*1.7+i)*.07,.002,z])}seams.push(pts);
  for(let j=0;j<15;j++){
   const z=-35+j*27+((i*17)%23);if(z<58)seams.push([[x+.03,.004,z],[x+2.67,.004,z+.18]]);
  }
  for(let j=0;j<45;j++){const z=-190+random()*245,y=.007,xx=x+.25+random()*2.1,len=.3+random()*2.1;scratches.push([[xx,y,z],[xx+.04,y,z+len*.4],[xx-.015,y,z+len]])}
 }
 contour(boards,'distant-plank-seams',seams.map(p=>p.filter(v=>v[2]<-55)),'#a396bf',.65);
 contour(boards,'plank-seams',seams.map(p=>p.filter(v=>v[2]>=-55)),'#625076',1.3);contour(boards,'wood-scratches',scratches.filter(p=>p[0][2]>-65),'#716183',1.0);
 // Individual pale brush-like floor patches are solid polygons on the floor.
 for(let i=0;i<65;i++){const x=(random()-.5)*115,z=-90+random()*125,m=add(boards,'floor-paint-'+i,new T.PlaneGeometry(.35+random()*1.4,.6+random()*5),new T.MeshBasicMaterial({color:i%3?'#c4b5dd':'#9486b6',transparent:true,opacity:.25,toneMapped:false,depthWrite:false}),[x,.008,z],0);m.rotation.x=-Math.PI/2}
 const rugUV=[[-.3,.67],[.10,.626],[.20,.64],[.285,.74],[.34,.82],[.42,.88],[.46,1.17],[-.3,1.17]];
 const border=[];for(let i=0;i<rugUV.length;i++){const a=rugUV[i],b=rugUV[(i+1)%rugUV.length];for(let k=0;k<8;k++){const t=k/8,p=C.ground(T.MathUtils.lerp(a[0],b[0],t)+Math.sin(i*12+k)*.002,T.MathUtils.lerp(a[1],b[1],t));border.push([p.x,-p.z])}}
 const rugShape=smoothShape(border);
 const rug=add(floor,'irregular-woven-rug',extrude(rugShape,.018,0),cel('#754c5a','#4c3347','#956575'),[0,.016,0],.02);rug.rotation.x=-Math.PI/2;
 const weave=[];
 for(let i=0;i<78;i++){const u=-.1+random()*.48,v=.7+random()*.4;if(u>.1+(v-.68)*.65)continue;const p=C.ground(u,v),len=.15+random()*.36;weave.push([[p.x,.038,p.z],[p.x+len,.038,p.z+.1],[p.x+len*.3,.038,p.z+.25]])}
 contour(floor,'rug-weave',weave,'#422d40',1.05);
 const patchUV=[[.235,.583],[.48,.554],[.61,.64],[.35,.717]],patch=patchUV.map(([u,v])=>C.ground(u,v));
 const shape=new T.Shape();shape.moveTo(patch[0].x,-patch[0].z);patch.slice(1).forEach(p=>shape.lineTo(p.x,-p.z));shape.closePath();
 const light=add(floor,'sunset-light-on-floor',new T.ShapeGeometry(shape),new T.MeshBasicMaterial({color:'#f6bac4',transparent:true,opacity:.42,depthWrite:false,toneMapped:false}),[0,.047,0],0);light.rotation.x=-Math.PI/2;
 return floor;
}

function createWall(parent,C){
 const wall=new T.Group();wall.name='back-wall';const origin=C.ground(.5,.505);wall.position.copy(origin);wall.rotation.y=C.yaw;parent.add(wall);
 const plane=new T.Plane().setFromNormalAndCoplanarPoint(C.normal,origin),ray=new T.Raycaster();
 function onWall(u,v){ray.setFromCamera(new T.Vector2(u*2-1,1-v*2),C.camera);const p=ray.ray.intersectPlane(plane,new T.Vector3()).sub(origin);return new T.Vector2(p.dot(C.right),p.y)}
 const center=onWall(.25,.277),left=onWall(.202,.277),right=onWall(.298,.277),top=onWall(.25,.174),bottom=onWall(.25,.375);
 const ww=right.x-left.x,wh=top.y-bottom.y,wx=center.x,wy=(top.y+bottom.y)/2;
 const random=rng(89),grain=[];const plank=18;
 for(let y=0;y<360;y+=plank){
  const y0=y+.16,y1=y+plank-.16;
  const spans=y1>wy-wh/2&&y0<wy+wh/2?[[-430,wx-ww/2],[wx+ww/2,430]]:[[-430,430]];
  for(const [x0,x1]of spans){if(x1<=x0)continue;box(wall,'wall-board-'+y+'-'+x0,x1-x0,y1-y0,1.3,cel(y%36?'#493449':'#4c374f','#302334','#5d465d'),[(x0+x1)/2,(y0+y1)/2,-.7],.25,.07);
   for(let i=0;i<40;i++){const x=x0+random()*(x1-x0),yy=y0+.6+random()*(y1-y0-1.2),len=1+random()*10;grain.push([[x,yy,.005],[Math.min(x1,x+len*.4),yy+.12,.008],[Math.min(x1,x+len),yy+.02,.005]])}
  }
 }
 contour(wall,'wall-woodgrain',grain,'#271f30',1.05);
 // Fill above/below the opening only; the window has no wall or picture behind it.
 for(const [y0,y1]of [[Math.floor((wy-wh/2)/plank)*plank,wy-wh/2],[wy+wh/2,Math.ceil((wy+wh/2)/plank)*plank]])if(y1>y0)box(wall,'window-wall-infill-'+y0,ww,y1-y0,1.3,'#493449',[wx,(y0+y1)/2,-.7],.06,.02);
 const frame=cel('#6c454a','#322939','#916366'),th=.95;
 for(const x of [wx-ww/2-.45,wx+ww/2+.45])box(wall,'window-upright-'+x,th,wh+2,2.4,frame,[x,wy,.4],.12,.13);
 for(const y of [wy-wh/2-.4,wy+wh/2+.4])box(wall,'window-crossbar-'+y,ww+1.7,1.0,2.6,frame,[wx,y,.45],.1,.13);
 box(wall,'window-sill',ww+3.1,.75,4.4,'#57404c',[wx,wy-wh/2-1.0,1.3],.12,.13);
 const sky=new T.ShaderMaterial({uniforms:{lower:{value:new T.Color('#ffd48c')},upper:{value:new T.Color('#eb7f99')}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 lower;uniform vec3 upper;varying vec2 v;void main(){gl_FragColor=vec4(mix(lower,upper,v.y),1.);\n#include <colorspace_fragment>\n}',toneMapped:false});
 add(wall,'outside-sunset-sky',new T.PlaneGeometry(ww+12,wh+12),sky,[wx,wy,-8],0);
 add(wall,'sun',new T.CircleGeometry(ww*.23,64),new T.MeshBasicMaterial({color:'#ffddb0',toneMapped:false}),[wx+ww*.18,wy-wh*.2,-7.7],0);
 for(const [j,x,y,s]of [[0,-.2,.20,.9],[1,.15,-.19,.6],[2,-.10,-.36,.7]]){
  const cloud=new T.Group();cloud.position.set(wx+x*ww,wy+y*wh,-6);wall.add(cloud);
  for(let i=0;i<4;i++)sphere(cloud,'sunset-cloud-'+j+'-'+i,ww*.035*s,'#ffe4cc',[(i-1.5)*ww*.036*s,Math.sin(i*2)*wh*.014*s,0],[1.6,.6,.22],0);
 }
 return {group:wall,origin,onWall};
}

function createCouch(parent,C){
 const g=new T.Group();g.name='purple-couch';g.position.copy(C.ground(.552,.662));g.rotation.y=C.yaw+.06;
 const width=C.width(.552,.662,.247),height=C.height(.552,.662,.43);g.scale.set(width/9,height/10,width/9);parent.add(g);
 shadow(g,'couch-shadow',0,0,5.2,2.9,.25);
 for(const x of [-3.5,3.5])for(const z of [-1.45,1.5])pipe(g,'couch-leg',[[x,1.5,z],[x*.99,.7,z+.08],[x*1.04,.06,z+.22]],.10,'#4b3245',.035);
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
 const edge=shape.getPoints(80).map(p=>[p.x,.155,-p.y]);contour(topGroup,'table-edge',[edge],'#38243a',1.65);
 for(const [i,x,z]of [[0,-radius*.7,-radius*.35],[1,radius*.66,-radius*.35],[2,-radius*.68,radius*.42],[3,radius*.64,radius*.46]])pipe(g,'bent-table-leg-'+i,[[x,3.0-z*.17,z],[x*.98,1.2,z+.06],[x*1.05,.05,z+.13]],.095,'#714452',.035);
 shadow(g,'table-contact-shadow',.5,.25,radius*.92,radius*.72,.32);
 const scratches=[[[radius*.5,.166,radius*.08],[radius*.65,.166,radius*.12]],[[radius*.51,.166,radius*.19],[radius*.63,.166,radius*.22]],[[-radius*.66,.166,radius*.0],[-radius*.52,.166,radius*.04]]];contour(topGroup,'table-wear',scratches,'#643247',1.2);
 const book=new T.Group();book.position.set(-.35,.39,.05);book.rotation.y=-.24;book.scale.setScalar(.76);topGroup.add(book);
 box(book,'book-pages',2.75,.28,1.85,'#bca885',[0,0,0],.08,.025);
 box(book,'olive-book-bottom',2.95,.10,2.05,'#77713d',[0,-.17,0],.10,.028);box(book,'olive-book-cover',3.0,.12,2.08,cel('#999357','#615a38','#b5a96a'),[0,.18,0],.1,.032);
 contour(book,'book-cover-lines',[[[-1.25,.252,-.72],[-1.25,.252,.73],[1.20,.252,.73]],[[.12,.253,-.4],[.50,.253,-.38]]],'#645b37',1.05);
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
 for(const x of [-2.6,2.6])for(const z of [-1.9,1.9])pipe(g,'side-table-bowed-leg',[[x,3,z],[x*1.14,1.1,z*1.12],[x*.75,.1,z*.8]],.11,'#744554',.03);
 const lower=add(g,'table-lower-ring',new T.TorusGeometry(3.15,.09,8,52),cel('#684052'),[0,1.08,0],.018);lower.rotation.x=Math.PI/2;lower.scale.y=.72;
 shadow(g,'gramophone-shadow',.2,.2,4.2,3.1,.25);
 const record=new T.Group();record.position.set(.8,4.10,-1.0);record.rotation.y=.14;g.add(record);
 box(record,'record-player-base',4.5,1.60,3.0,'#aa6a67',[0,0,0],.18,.045);
 const disc=add(record,'green-record',new T.CylinderGeometry(1.15,1.15,.055,48),cel('#3c675b','#2c413e','#699278'),[-.22,.84,.12],.014);
 for(const r of [.45,.78,1.02]){const ring=add(record,'vinyl-groove',new T.TorusGeometry(r,.012,6,60),new T.MeshBasicMaterial({color:'#83a07b'}),[-.22,.873,.12],0);ring.rotation.x=Math.PI/2}
 cylinder(record,'record-label',.26,.06,cel('#d9a66d'),[-.22,.875,.12],.012);
 pipe(record,'tone-arm',[[1.75,.88,-.9],[1.65,.92,.5],[.75,.94,.75]],.06,'#bc9c77',.012);
 const lid=new T.Group();lid.position.set(0,.76,-1.35);lid.rotation.x=-.43;record.add(lid);
 box(lid,'open-turntable-lid',4.5,4.5,.24,'#b4786b',[0,2.2,0],.18,.04);
 const decoration=add(lid,'lid-green-inlay',new T.CircleGeometry(1.23,48),cel('#52705f'),[0,2.2,.14],.02);decoration.scale.y=.85;
 add(lid,'lid-center-medallion',new T.CircleGeometry(.28,30),cel('#d59b77'),[0,2.2,.16],.018);
 pipe(record,'crank',[[2.2,.0,0],[3.2,.0,0],[3.2,.45,0]],.08,'#937667',.02);sphere(record,'red-crank-handle',.20,'#b24c5b',[3.2,.50,0],[1.5,.9,.9],.02);
 const hornPoints=[[2.1,4.2,-1.5],[2.3,7.1,-1.6],[2.25,11.5,-1.5],[1.5,14.1,-1.3],[-1.0,15.4,-1.15],[-3.6,16.0,-.7]];
 const curve=new T.CatmullRomCurve3(hornPoints.map(p=>new T.Vector3(...p))),radius=t=>.42+.10*t+1.82*Math.pow(Math.max(0,(t-.58)/.42),2.2);
 const hornGeo=variableTube(curve,radius);add(g,'curved-gramophone-horn',hornGeo,cel('#88558e','#49314f','#a171a7'),[0,0,0],.03);
 const inner=new T.Mesh(hornGeo.clone(),new T.MeshBasicMaterial({color:'#4a2855',side:T.BackSide,toneMapped:false}));inner.name='horn-inner-bell';g.add(inner);
 const end=curve.getPoint(1),tangent=curve.getTangent(1),rim=add(g,'horn-bell-rim',new T.TorusGeometry(radius(1),.095,12,64),cel('#ba79bc','#593c6b','#cf91cf'),end.toArray(),.026);rim.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),tangent);
 const innerRim=add(g,'horn-inner-lip',new T.TorusGeometry(radius(1)-.18,.04,8,64),cel('#4b2c59'),end.clone().addScaledVector(tangent,-.07).toArray(),.012);innerRim.quaternion.copy(rim.quaternion);
 for(let i=0;i<10;i++){const t=.12+i*.067,center=curve.getPoint(t),n=curve.computeFrenetFrames(72,false).normals[Math.floor(t*72)];sphere(g,'horn-rivet',.052,'#4a3052',center.clone().addScaledVector(n,radius(t)+.03).toArray(),[1,1,1],0)}
 for(const [i,x,z,w,h]of [[0,-2.0,1.45,2.15,2.75],[1,.0,1.70,1.55,1.85]]){
  const picture=new T.Group();picture.position.set(x,3.27+h/2,z);picture.rotation.x=-.16;picture.rotation.z=i?-.11:.13;g.add(picture);
  box(picture,'record-sleeve-frame-'+i,w+.13,h+.13,.13,i?'#a6555c':'#c7b2dc',[0,0,0],.035,.025);
  add(picture,'record-sleeve-art-'+i,new T.PlaneGeometry(w,h),drawAlbum(i),[0,0,.08],0);
 }
 const radio=new T.Group();radio.position.set(2.0,3.85,1.62);radio.rotation.y=-.1;g.add(radio);
 box(radio,'portable-radio',3.0,1.45,.95,cel('#718b72','#40584e','#9aab84'),[0,0,0],.18,.035);
 for(const x of [-.92,.92]){const s=add(radio,'radio-speaker',new T.CircleGeometry(.40,30),cel('#3b5550'),[x,0,.49],.012);for(let i=-2;i<=2;i++)box(radio,'speaker-slat',.50,.04,.01,'#88a28b',[x,i*.105,.505],.006,0)}
 box(radio,'radio-tuning-window',.53,.65,.025,'#b0aa80',[0,.1,.50],.035,.015);box(radio,'radio-frequency',.05,.5,.015,'#554b54',[.1,.1,.523],.005,0);
 pipe(radio,'radio-handle',[[-1.1,.55,-.12],[-1.0,1.95,-.12],[.8,1.95,-.12],[1.1,.55,-.12]],.10,'#819478',.027);
 const headphones=new T.Group();headphones.position.set(1.2,5.6,.0);g.add(headphones);
 pipe(headphones,'headphone-band',[[-.75,-.1,0],[-.75,1.1,0],[0,1.65,0],[.75,1.05,0],[.75,-.1,0]],.12,'#4c6183',.035);
 for(const side of [-1,1]){const e=cylinder(headphones,'headphone-earcup',.38,.26,'#4e668b',[side*.78,0,0],.025);e.rotation.z=Math.PI/2}
 return g;
}

function createClock(parent,C,wall){
 const origin=C.point(.38,.191,C.ground(.38,.539)),g=new T.Group();g.name='blue-clock';g.position.copy(origin);g.position.addScaledVector(C.normal,3.8);g.rotation.y=C.yaw;parent.add(g);
 const r=C.width(.38,.539,.047)/2;
 parent.updateMatrixWorld(true);const clockRay=new T.Raycaster();clockRay.setFromCamera(new T.Vector2(.38*2-1,1-.191*2),C.camera);const trunk=parent.getObjectByName('middle-back-trunk-trunk');const barkHit=clockRay.intersectObject(trunk,false)[0];if(barkHit)g.position.copy(barkHit.point).addScaledVector(clockRay.ray.direction,-r*.23);
 const edgeA=g.position.clone().addScaledVector(C.right,-r).project(C.camera),edgeB=g.position.clone().addScaledVector(C.right,r).project(C.camera);g.scale.setScalar(.047*2/(edgeB.x-edgeA.x));
 const disk=add(g,'blue-clock-case',new T.CylinderGeometry(r,r,r*.24,64),cel('#5e68c5','#343361','#8992df'),[0,0,0],r*.025);disk.rotation.x=Math.PI/2;
 const front=add(g,'clock-dial',new T.CircleGeometry(r*.79,64),new T.MeshBasicMaterial({color:'#b7a6d5'}),[0,0,r*.13],0);
 const ticks=[];for(let i=0;i<12;i++){const a=i/12*Math.PI*2;ticks.push([[Math.sin(a)*r*.63,Math.cos(a)*r*.63,r*.14],[Math.sin(a)*r*.73,Math.cos(a)*r*.73,r*.14]])}contour(g,'clock-hour-marks',ticks,'#514674',1.3);
 pipe(g,'clock-minute-hand',[[0,0,r*.15],[r*.35,r*.48,r*.15]],r*.025,'#4d365c',0);pipe(g,'clock-hour-hand',[[0,0,r*.15],[-r*.3,r*.13,r*.15]],r*.035,'#4d365c',0);
 sphere(g,'clock-center',r*.06,'#74538b',[0,0,r*.17],[1,1,.4],0);
 const hook=add(g,'clock-hanger',new T.TorusGeometry(r*.13,r*.03,8,24),cel('#ab91b8'),[0,r*1.2,-r*.05],0);
 return g;
}

export function createRoom(scene){
 const root=new T.Group();root.name='fully-modelled-treehouse';scene.add(root);const C=roomCalibration();
 createFloor(root,C);const wall=createWall(root,C);
 const trunks=[];
 for(const [name,u,v,w,h,lean,seed]of [
  ['left-frame-trunk',-.008,.652,.105,1.05,-2,17],
  ['left-back-trunk',.133,.536,.069,.74,3,29],
  ['middle-back-trunk',.38,.54,.068,.82,-3,43],
  ['curved-couch-trunk',.485,.633,.090,.85,-3,61],
  ['right-back-trunk',.708,.647,.095,.88,3,79],
  ['right-frame-trunk',.90,.788,.160,1.1,4,97]
 ]){const base=C.ground(u,v),radius=C.width(u,v,w)/2,height=C.height(u,v,h);trunks.push(makeTrunk(root,name,base,radius,height,lean,seed))}
 createCouch(root,C);createLowTable(root,C);createGramophone(root,C);createClock(root,C,wall);
 // A small wall shelf and sculpted skull above the chair.
 const shelfCenter=C.point(.58,.045,C.ground(.58,.59)),shelf=new T.Group();shelf.position.copy(shelfCenter);shelf.rotation.y=C.yaw;root.add(shelf);
 box(shelf,'high-wall-shelf',12,.55,3.1,'#684555',[0,0,0],.15,.07);
 sphere(shelf,'shelf-skull',1.2,'#c6b6c5',[.4,1.45,.3],[1.2,1,1],.035);
 for(const x of [-.12,.89]){const eye=add(shelf,'skull-eye',new T.CircleGeometry(.33,28),new T.MeshBasicMaterial({color:'#3a2a48'}),[x,1.55,1.37],0);eye.scale.y=1.22}
 for(let i=0;i<4;i++)box(shelf,'skull-tooth',.27,.40,.31,'#c7b5c2',[-.05+i*.29,.55,1.09],.06,.012);
 root.updateMatrixWorld(true);
 function audit(){const parts=[];root.traverse(m=>{if(!m.isMesh||m.userData.outline||!m.geometry)return;m.geometry.computeBoundingBox();const b=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);parts.push({name:m.name,type:m.geometry.type,vertices:m.geometry.attributes.position.count,finite:[...b.min.toArray(),...b.max.toArray()].every(Number.isFinite),size:b.getSize(new T.Vector3()).toArray()})});return {parts,full3D:true,roomImage:false}}
 return {group:root,audit,landmarks:{couch:root.getObjectByName('purple-couch'),table:root.getObjectByName('foreground-table'),gramophone:root.getObjectByName('gramophone-corner'),clock:root.getObjectByName('blue-clock')}};
}
