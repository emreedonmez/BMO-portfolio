import {Matrix4} from 'three';

// Project the LCD's logical pixels through the same camera as the WebGL model.
// A settled, front-facing display uses a 2D transform: Safari can then scroll
// its contents without moving a nested preserve-3d compositing layer.
export function displayTransform(camera,screen,width,height){
 const scale=screen.width/640;
 const model=new Matrix4().set(scale,0,0,screen.x-screen.width/2,0,-scale,0,screen.y+screen.height/2,0,0,1,screen.z,0,0,0,1);
 const clip=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(model),e=clip.elements;
 const w=e[15],g=e[3]/w,h=e[7]/w;
 const a=width/2*(e[0]+e[3])/w,b=height/2*(e[3]-e[1])/w;
 const c=width/2*(e[4]+e[7])/w,d=height/2*(e[7]-e[5])/w;
 const x=width/2*(e[12]+e[15])/w,y=height/2*(e[15]-e[13])/w;
 const visible=camera.position.z>screen.z&&[w,w+e[3]*640,w+e[7]*452,w+e[3]*640+e[7]*452].every(v=>v>camera.near);
 const pixelScale=Math.hypot(a,b);
 if(Math.abs(g)<1e-10&&Math.abs(h)<1e-10)return {visible,pixelScale,transform:`matrix(${a},${b},${c},${d},${x},${y})`};
 return {visible,pixelScale,transform:`matrix3d(${a},${b},0,${g},${c},${d},0,${h},0,0,1,0,${x},${y},0,1)`};
}
