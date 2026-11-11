import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const ink=new T.MeshBasicMaterial({color:'#243d36',side:T.BackSide});
const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.85,metalness:0,...extra});
const teal=mat('#70b7a2'),darkTeal=mat('#4a8e7c'),black=mat('#173b35'),yellow=mat('#f2cf54'),red=mat('#e6536a'),blue=mat('#54b9d1'),green=mat('#a6d953');
function mesh(parent,geometry,material,position=[0,0,0],outline=0){
 const m=new T.Mesh(geometry,material);m.position.set(...position);m.castShadow=true;m.receiveShadow=true;parent.add(m);
 if(outline){const o=new T.Mesh(geometry,ink);o.scale.setScalar(1+outline);o.castShadow=false;m.add(o)}return m;
}
function box(parent,w,h,d,color,position,r=.04,outline=0){return mesh(parent,new RoundedBoxGeometry(w,h,d,3,r),typeof color==='string'?mat(color):color,position,outline)}
function tube(parent,points,r,material,outline=true){const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const m=mesh(parent,new T.TubeGeometry(c,32,r,9,false),material);if(outline){const edge=new T.Mesh(new T.TubeGeometry(c,32,r*1.12,9,false),ink);parent.add(edge)}return m}
function cylinder(parent,r,h,material,pos,segments=40){return mesh(parent,new T.CylinderGeometry(r,r,h,segments),material,pos)}
function texture(width,height,draw){const c=document.createElement('canvas');c.width=width;c.height=height;draw(c.getContext('2d'),width,height);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t}
function faceTexture(){return texture(640,452,(c,w,h)=>{c.fillStyle='#d9f5bf';c.fillRect(0,0,w,h);c.fillStyle='#203e2e';for(const x of [190,450]){c.beginPath();c.ellipse(x,165,14,24,0,0,Math.PI*2);c.fill();c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(x-24,183);c.quadraticCurveTo(x,170,x+24,183);c.strokeStyle='#203e2e';c.stroke()}c.beginPath();c.moveTo(258,240);c.bezierCurveTo(258,214,280,240,320,250);c.bezierCurveTo(354,240,381,217,382,242);c.bezierCurveTo(377,318,274,321,258,240);c.fill();c.fillStyle='#75b96b';c.beginPath();c.ellipse(320,292,34,15,0,Math.PI,Math.PI*2);c.fill()})}
export function createBMO(scene){
 const bmo=new T.Group();scene.add(bmo);
 const body=box(bmo,2.8,3.5,1.42,teal,[0,2.1,0],.15,.009);body.receiveShadow=false;body.userData.action='enter';
 const back=box(bmo,2.76,3.44,.12,darkTeal,[0,2.1,-.69],.10);back.receiveShadow=false;
 box(bmo,2.41,1.81,.045,black,[0,2.78,.716],.12);
 const face=mesh(bmo,new T.PlaneGeometry(2.28,1.61),new T.MeshBasicMaterial({map:faceTexture()}),[0,2.78,.747]);face.userData.action='enter';
 // Rounded display surround covers the square plane corners, like a moulded CRT bezel.
 const surround=new T.Shape();surround.moveTo(-1.2,-.9);surround.lineTo(1.2,-.9);surround.lineTo(1.2,.9);surround.lineTo(-1.2,.9);surround.closePath();
 const hole=new T.Path();const l=-1.14,r=1.14,t=.805,b=-.805,rad=.12;
 hole.moveTo(l+rad,b);hole.lineTo(r-rad,b);hole.quadraticCurveTo(r,b,r,b+rad);hole.lineTo(r,t-rad);hole.quadraticCurveTo(r,t,r-rad,t);hole.lineTo(l+rad,t);hole.quadraticCurveTo(l,t,l,t-rad);hole.lineTo(l,b+rad);hole.quadraticCurveTo(l,b,l+rad,b);surround.holes.push(hole);
 mesh(bmo,new T.ShapeGeometry(surround),teal,[0,2.78,.751]);
 box(bmo,1.63,.15,.04,black,[-.37,1.66,.735],.012);
 const controls=[];
 function control(geometry,material,x,y,action,rotation=0){const button=mesh(bmo,geometry,material,[x,y,.785],.035);button.rotation.z=rotation;button.userData.action=action;controls.push(button);return button}
 const shape=new T.Shape();const p=[[-.12,.34],[.12,.34],[.12,.12],[.34,.12],[.34,-.12],[.12,-.12],[.12,-.34],[-.12,-.34],[-.12,-.12],[-.34,-.12],[-.34,.12],[-.12,.12]];
 shape.moveTo(...p[0]);p.slice(1).forEach(v=>shape.lineTo(...v));shape.closePath();
 const cross=control(new T.ExtrudeGeometry(shape,{depth:.075,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2,steps:1}),yellow,-.74,1.08,'dpad');
 const triangle=new T.Shape();triangle.moveTo(-.19,-.14);triangle.lineTo(.19,-.14);triangle.lineTo(0,.22);triangle.closePath();
 control(new T.ExtrudeGeometry(triangle,{depth:.08,bevelEnabled:true,bevelSize:.012,bevelThickness:.01,bevelSegments:2,steps:1}),blue,.29,1.17,'room');
 function disk(r,material,x,y,action){const g=new T.CylinderGeometry(r,r,.105,40);g.rotateX(Math.PI/2);return control(g,material,x,y,action)}
 disk(.255,red,.48,.62,'confirm');disk(.155,green,1.03,1.11,'back');disk(.067,mat('#2535a1'),1.03,1.67,'sound');
 box(bmo,.32,.065,.045,mat('#222a9b'),[-.93,.55,.75],.029);box(bmo,.32,.065,.045,mat('#222a9b'),[-.44,.55,.75],.029);
 // Side name and the nine speaker perforations visible on the character reference.
 const label=texture(256,640,c=>{c.fillStyle='#163637';c.font='900 170px Arial';c.textAlign='center';['B','M','O'].forEach((s,i)=>c.fillText(s,128,240+i*170))});
 const name=mesh(bmo,new T.PlaneGeometry(.87,2.18),new T.MeshBasicMaterial({map:label,transparent:true}),[-1.409,1.96,-.02]);name.rotation.y=-Math.PI/2;const rightName=name.clone();rightName.position.x=1.409;rightName.rotation.y=Math.PI/2;bmo.add(rightName);
 for(let row=0;row<3;row++)for(let col=0;col<3;col++){const g=new T.CircleGeometry(.031,14);const m=mesh(bmo,g,black,[-1.415,3.57-row*.19,-.3+col*.22]);m.rotation.y=-Math.PI/2}
 for(let i=0;i<5;i++)box(bmo,.43,.055,.025,black,[0,2.9-i*.17,-.763],.015);
 for(const side of [-1,1]){
  tube(bmo,[[side*1.35,1.65,.03],[side*1.65,1.2,.2],[side*1.68,.55,.58],[side*1.48,.4,.91]],.085,teal);
  const hand=mesh(bmo,new T.SphereGeometry(.12,14,10),teal,[side*1.48,.4,.91],.08);hand.scale.set(1, .65,1.35);
  for(let i=0;i<3;i++)tube(bmo,[[side*1.48+(i-1)*.055,.4,.95],[side*1.48+(i-1)*.055,.38,1.08]],.024,teal,false);
  tube(bmo,[[side*.72,.39,.17],[side*.74,.23,.65],[side*.76,.17,1.38],[side*.77,.2,1.74]],.085,teal);
  const foot=mesh(bmo,new T.SphereGeometry(.15,18,14),teal,[side*.77,.3,1.79],.07);foot.scale.set(.65,1.65,.7);
 }
 bmo.traverse(o=>{if(o.isMesh&&o.material!==ink)o.receiveShadow=false});
 return {group:bmo,face,controls,cross,screenPosition:new T.Vector3(0,2.78,.761),screenWidth:2.28,screenHeight:1.61};
}

export function createRoom(scene){
 const room=new T.Group();scene.add(room);
 const woodColors=['#aa7952','#b18159','#b9895f','#ac7c55','#be926a'];
 const floorMaterial=mat('#b78760');
 const woodGrain=texture(512,512,(c,w,h)=>{c.fillStyle='#c39b73';c.fillRect(0,0,w,h);let seed=24;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}for(let i=0;i<90;i++){c.strokeStyle=`rgba(74,46,23,${.05+rnd()*.09})`;c.lineWidth=.5+rnd()*1.3;c.beginPath();const y=rnd()*h;c.moveTo(0,y);c.bezierCurveTo(w*.3,y-5,w*.6,y+8,w,y);c.stroke()}});
 floorMaterial.map=woodGrain;
 box(room,10.5,.18,8.6,'#674e3a',[0,-.17,0],.08);
 for(let i=0;i<15;i++){const m=floorMaterial.clone();m.color.set(woodColors[i%5]);box(room,10.35,.08,.55,m,[0,-.04,-3.98+i*.565],.015);for(let j=0;j<3;j++){const x=-3.9+j*3.5+(i%2)*1.5;if(x<5)box(room,.016,.008,.52,'#765439',[x,.004,-3.98+i*.565],.001)}}
 // Two walls leave the room open to the viewer, like a miniature set.
 for(let i=0;i<12;i++){box(room,10.45,.46,.16,woodColors[(i+1)%5],[0,.24+i*.47,-4.12],.025);box(room,.16,.46,8.3,woodColors[i%5],[-5.17,.24+i*.47,-.02],.025)}
 box(room,10.5,.21,.27,'#644832',[0,.12,-3.98],.03);box(room,.27,.21,8.4,'#644832',[-5.05,.12,0],.03);
 for(const x of [-4.95,.4,5.04])box(room,.24,5.7,.32,'#775238',[x,2.8,-3.91],.045);
 box(room,10.55,.32,.35,'#634a35',[0,5.59,-3.99],.06);box(room,.35,.32,8.4,'#634a35',[-5,5.59,0],.06);
 // Round window with its own painted landscape and timber mullions.
 const landscape=texture(512,512,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#9fd4c7');g.addColorStop(1,'#f7e7ad');c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='#fdf2c8';c.beginPath();c.arc(345,140,48,0,Math.PI*2);c.fill();c.fillStyle='#89b59b';c.beginPath();c.moveTo(0,340);c.quadraticCurveTo(150,140,310,330);c.quadraticCurveTo(430,210,512,310);c.lineTo(512,512);c.lineTo(0,512);c.fill();c.fillStyle='#568b72';c.beginPath();c.moveTo(0,410);c.quadraticCurveTo(200,250,512,400);c.lineTo(512,512);c.lineTo(0,512);c.fill();c.fillStyle='#fff7e2';for(const [x,y]of [[100,110],[160,100],[410,225]]){c.beginPath();c.ellipse(x,y,55,15,0,0,Math.PI*2);c.fill()}});
 mesh(room,new T.CircleGeometry(1.13,64),new T.MeshBasicMaterial({map:landscape}),[-2.8,3.55,-4.01]);
 const ring=mesh(room,new T.TorusGeometry(1.2,.11,12,64),mat('#644a34'),[-2.8,3.55,-3.95]);
 mesh(room,new T.TorusGeometry(1.08,.035,8,64),mat('#e0b47a'),[-2.8,3.55,-3.91]);
 box(room,2.17,.065,.10,'#79583b',[-2.8,3.55,-3.84],.015);box(room,.065,2.16,.1,'#79583b',[-2.8,3.55,-3.84],.015);
 box(room,2.8,.12,.55,'#6c5038',[-2.8,2.28,-3.72],.04);
 // Oval rug: actual woven rings, not a flat light blob.
 const rugTex=texture(768,768,(c,w,h)=>{c.fillStyle='#c98d65';c.fillRect(0,0,w,h);for(let r=380;r>10;r-=5){c.beginPath();c.arc(384,384,r,0,Math.PI*2);c.strokeStyle=r>337?'#e5c995':r>310?'#9b604c':r>290?'#ddbd8a':r>250?'#8f9b75':'#c58a65';c.lineWidth=4;c.stroke()}for(let i=0;i<10000;i++){const x=(i*173)%768,y=(i*397)%768;c.fillStyle=i%2?'#e7c49b23':'#694c3220';c.fillRect(x,y,1,2)}});
 const rug=mesh(room,new T.CylinderGeometry(2.9,2.9,.035,96),mat('#ffffff',{map:rugTex}),[.1,.035,.5]);rug.scale.set(1,1,.81);
 // Couch in the back-left, with seams, wooden feet and an ochre pillow.
 const couch=new T.Group();couch.position.set(-3.2,0,-1.35);couch.rotation.y=.23;room.add(couch);
 for(const x of [-.9,.9])for(const z of [-.4,.4])cylinder(couch,.065,.34,mat('#664831'),[x,.19,z]);
 box(couch,2.3,.5,1.17,'#a8644c',[0,.5,0],.13,.01);box(couch,2.3,1.3,.35,'#af7359',[0,1.12,-.49],.16,.01);
 for(const x of [-1.07,1.07])box(couch,.32,.75,1.2,'#bd8264',[x,.83,.03],.14,.01);
 for(const x of [-.5,.5])box(couch,.92,.22,.9,'#c99572',[x,.79,.05],.09,.01);
 const pillow=box(couch,.63,.63,.2,'#e6bb62',[-.57,1.24,-.23],.12,.013);pillow.rotation.z=.2;
 // Bookshelf, little collection of books and objects.
 const shelf=new T.Group();shelf.position.set(3.05,0,-3.53);room.add(shelf);
 for(const x of [-1.05,1.05])box(shelf,.13,3.2,.62,'#6a4e35',[x,1.64,0],.02);
 for(const y of [.13,1.13,2.13,3.23])box(shelf,2.28,.13,.7,'#805b3b',[0,y,0],.02);
 const bookColors=['#66897b','#dbbb73','#bd6d51','#638f9b','#d7c3a0','#9b8754'];
 for(let level=0;level<3;level++)for(let i=0;i<7;i++){const h=.45+((i*7+level*3)%5)*.055;const b=box(shelf,.16,h,.39,bookColors[(i+level)%6],[-.85+i*.23,.22+level+ h/2,.01],.008);b.rotation.z=(i===5?.12:0);box(b,.12,.02,.004,'#e4d4a6',[0,h*.25,.199],.001)}
 box(shelf,.7,.35,.48,'#a7b1a0',[.48,2.4,.03],.035);box(shelf,.35,.07,.2,'#d2be85',[.45,2.61,.02],.01);
 // Lamp, table, mug and scattered game cartridges.
 const table=new T.Group();table.position.set(-3.3,0,1.35);room.add(table);
 cylinder(table,.63,.12,mat('#986e49'),[0,.92,0],48);for(const [x,z]of [[-.35,-.25],[.35,-.25],[0,.38]]){const leg=cylinder(table,.055,.86,mat('#694b33'),[x,.45,z]);leg.rotation.z=x*.18}
 box(table,.55,.08,.4,'#568a83',[-.05,1.04,0],.015);box(table,.48,.05,.37,'#d7bc84',[-.07,1.1,.02],.008);
 cylinder(table,.115,.2,mat('#e3c89a'),[.28,1.1,.2]);const handle=mesh(table,new T.TorusGeometry(.085,.023,6,20),mat('#e3c89a'),[.4,1.13,.2]);handle.rotation.y=Math.PI/2;
 const lamp=new T.Group();lamp.position.set(4,0,-1.8);room.add(lamp);cylinder(lamp,.33,.08,mat('#4d5b4b'),[0,.06,0]);cylinder(lamp,.035,2.6,mat('#655b40'),[0,1.33,0]);mesh(lamp,new T.ConeGeometry(.53,.56,40,1,true),mat('#f3d49a',{side:T.DoubleSide}),[0,2.68,0]);const bulb=mesh(lamp,new T.SphereGeometry(.08),new T.MeshBasicMaterial({color:'#fff2c7'}),[0,2.55,0]);
 const glow=new T.PointLight('#ffd49a',5,5,2);glow.position.set(4,2.5,-1.8);scene.add(glow);
 // Potted plant with individually bent leaves.
 const plant=new T.Group();plant.position.set(3.6,0,1.3);room.add(plant);mesh(plant,new T.CylinderGeometry(.33,.23,.5,28),mat('#b97c5a'),[0,.29,0]);cylinder(plant,.29,.025,mat('#554c32'),[0,.55,0]);
 for(let i=0;i<8;i++){const a=i*2.4,leaf=mesh(plant,new T.SphereGeometry(1,16,12),mat(i%2?'#618a58':'#7c9b60'),[Math.cos(a)*.23,.85+(i%3)*.11,Math.sin(a)*.23]);leaf.scale.set(.12,.48,.045);leaf.rotation.z=Math.cos(a)*.65;leaf.rotation.x=Math.sin(a)*.65}
 const cart=box(room,.6,.10,.43,'#647c73',[2.05,.14,1.8],.02,.015);cart.rotation.y=-.3;box(cart,.35,.005,.25,'#d3be80',[0,.055,0],.005);
 const cart2=box(room,.6,.1,.43,'#9e7563',[2.15,.22,1.85],.02,.015);cart2.rotation.y=.13;
 // A framed print of distant hills above the shelf.
 box(room,1.42,.95,.1,'#5f4d36',[2.9,4.44,-3.99],.035);const art=mesh(room,new T.PlaneGeometry(1.25,.77),new T.MeshBasicMaterial({map:landscape}),[2.9,4.44,-3.93]);
 const sun=new T.DirectionalLight('#fff1cf',3.3);sun.position.set(-3,7,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:24});sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;sun.shadow.radius=4;scene.add(sun);
 scene.add(new T.HemisphereLight('#eaf2d5','#8d7157',2.3));const fill=new T.DirectionalLight('#bedbd6',1.2);fill.position.set(5,4,4);scene.add(fill);
 return room;
}
