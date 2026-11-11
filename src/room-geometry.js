import * as T from 'three';

export const ROOM={width:70,back:-40,front:34,height:28,floor:-.055,rugTop:.025,maxOrbit:27.5};

function halfPlane(poly,a,b,inside){
 const side=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]),out=[];
 for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],dp=side(p),dq=side(q),ip=inside?dp>=-1e-10:dp<=1e-10,iq=inside?dq>=-1e-10:dq<=1e-10;
  if(ip)out.push(p);
  if(ip!==iq){const t=dp/(dp-dq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t])}
 }
 return out;
}
export function subtractConvex(poly,hole){
 const outside=[];let remaining=poly;
 for(let i=0;i<hole.length&&remaining.length;i++){
  const a=hole[i],b=hole[(i+1)%hole.length],piece=halfPlane(remaining,a,b,false);
  if(piece.length>=3)outside.push(piece);
  remaining=halfPlane(remaining,a,b,true);
 }
 return outside;
}

export function hollowTrunk(radius,height,lean,seed,skipMiddle=false){
 const holes=[.27,.60,.84].filter((_,i)=>!skipMiddle||i!==1).map((t,i)=>({a:1.48+(i%2)*.48,t,aw:.235,th:radius*.48/height}));
 const center=t=>new T.Vector3(Math.sin(t*5+seed)*radius*.07+lean*t,t*height,Math.sin(t*4+seed*.3)*radius*.07);
 const rad=t=>radius*(1-.12*t+.04*Math.sin(t*8+seed));
 const surface=(a,t,depth=0)=>{const c=center(t),r=rad(t)*(1+.035*Math.sin(a*5+seed));return c.add(new T.Vector3(Math.cos(a)*(r+depth),0,Math.sin(a)*(r*.76+depth)))};
 const normal=(a,t)=>surface(a,t+.0001).sub(surface(a,t-.0001)).cross(surface(a+.0001,t).sub(surface(a-.0001,t))).normalize();
 const cutters=holes.map(h=>Array.from({length:40},(_,i)=>{const a=i/40*Math.PI*2;return [h.a+Math.cos(a)*h.aw,h.t+Math.sin(a)*h.th]}));
 const positions=[],normals=[],uv=[],indices=[];let count=0;
 function triangle(points){
  const area=(points[1][0]-points[0][0])*(points[2][1]-points[0][1])-(points[1][1]-points[0][1])*(points[2][0]-points[0][0]);if(Math.abs(area)<1e-12)return;
  for(const [a,t]of points){positions.push(...surface(a,t).toArray());normals.push(...normal(a,t).toArray());uv.push(a/(2*Math.PI),t)}
  indices.push(count,count+2,count+1);count+=3;
 }
 const sides=64,rings=64;
 for(let j=0;j<rings;j++)for(let i=0;i<sides;i++){
  const a=i/sides*Math.PI*2,b=(i+1)/sides*Math.PI*2,t=j/rings,s=(j+1)/rings;
  for(const tri of [[[a,t],[b,t],[b,s]],[[a,t],[b,s],[a,s]]]){
   let pieces=[tri];
   for(let k=0;k<holes.length;k++){
    const h=holes[k];if(b<h.a-h.aw||a>h.a+h.aw||s<h.t-h.th||t>h.t+h.th)continue;
    pieces=pieces.flatMap(poly=>subtractConvex(poly,cutters[k]));
   }
   for(const p of pieces)for(let k=1;k<p.length-1;k++)triangle([p[0],p[k],p[k+1]]);
  }
 }
 const body=new T.BufferGeometry();body.setAttribute('position',new T.Float32BufferAttribute(positions,3));body.setAttribute('normal',new T.Float32BufferAttribute(normals,3));body.setAttribute('uv',new T.Float32BufferAttribute(uv,2));body.setIndex(indices);
 function ring(h,levels){
  const p=[],idx=[],segments=80;
  for(const [extent,depth]of levels)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;p.push(...surface(h.a+Math.cos(a)*h.aw*extent,h.t+Math.sin(a)*h.th*extent,depth*radius).toArray())}
  for(let j=0;j<levels.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();return g;
 }
 const cavities=holes.map(h=>({rim:ring(h,[[1.16,.018],[1.03,.07],[.87,-.05]]),bowl:ring(h,[[.87,-.05],[.5,-.32],[0,-.44]]),center:surface(h.a,h.t),normal:normal(h.a,h.t),radius}));
 return {body,cavities,surface,height,radius};
}
