import * as T from 'three';

export function portfolioPose(width,height,coarse=false){
 const aspect=width/height,short=height<550&&aspect>1.2;
 const compact=coarse||width<=700;
 const distance=short?Math.max(3.72,2.26/(2*Math.tan(T.MathUtils.degToRad(21))*aspect)+.59):Math.max(width<=700?4.5:6.6,(compact?2.26:2.55)/(2*Math.tan(T.MathUtils.degToRad(21))*aspect)+.59);
 let y=short?2.52:compact?1.65:1.85;
 if(compact&&!short){const scale=height/(2*Math.tan(T.MathUtils.degToRad(21))*(distance-.59)),half=1.49725*scale/2,center=height/2+(y-2.52)*scale;y=2.52+(T.MathUtils.clamp(center,72+half,height-68-half)-height/2)/scale}
 return {position:new T.Vector3(0,y,distance),look:new T.Vector3(0,y,0),offset:new T.Vector2()};
}

// A spherical path goes around BMO instead of cutting through the model from a rear view.
export function interpolatePose(from,to,progress){
 const t=T.MathUtils.clamp(progress,0,1),e=t*t*(3-2*t);
 const a=new T.Spherical().setFromVector3(from.position.clone().sub(from.look));
 const b=new T.Spherical().setFromVector3(to.position.clone().sub(to.look));
 const turn=Math.atan2(Math.sin(b.theta-a.theta),Math.cos(b.theta-a.theta));
 const look=from.look.clone().lerp(to.look,e);
 const orbit=new T.Spherical(T.MathUtils.lerp(a.radius,b.radius,e),T.MathUtils.lerp(a.phi,b.phi,e),a.theta+turn*e);
 return {position:new T.Vector3().setFromSpherical(orbit).add(look),look,offset:from.offset.clone().lerp(to.offset,e)};
}
