import * as T from 'three';

export function portfolioPose(width,height,coarse=false,insets={}){
 const aspect=width/height,short=height<550&&aspect>1.2;
 const compact=coarse||width<=700||short,tangent=Math.tan(T.MathUtils.degToRad(21));
 const y=short?2.52:compact?1.65:1.85,offset=new T.Vector2();
 let distance=Math.max(6.6,2.55/(2*tangent*aspect)+.59);
 if(compact){
  const edge=side=>Math.max(12,insets[side]||0);
  const left=edge('left')+(short?66:0),right=width-edge('right')-(short?106:0);
  const top=edge('top')+(short?0:56),bottom=height-edge('bottom')-(short?0:56);
  const scale=Math.max(.1,Math.min((right-left)/640,(bottom-top)/452));
  distance=Math.max(width>700&&!short?6.6:0,.59+height*2.12/(2*tangent*640*scale));
  const pixels=height/(2*tangent*(distance-.59)),half=1.49725*pixels/2;
  const center=height/2+(y-2.52)*pixels;
  offset.set(width/2-(left+right)/2,center-T.MathUtils.clamp(center,top+half,bottom-half));
 }
 return {position:new T.Vector3(0,y,distance),look:new T.Vector3(0,y,0),offset};
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
