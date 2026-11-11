import * as T from 'three';

export function randomSeed(seed){return ()=>{seed=seed*16807%2147483647;return seed/2147483647}}
export function paintedTexture(width,height,paint,mask=false){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;paint(canvas.getContext('2d'),width,height);
 let texture;
 if(mask){const rgba=canvas.getContext('2d').getImageData(0,0,width,height).data,data=new Uint8Array(width*height);for(let i=0;i<data.length;i++)data[i]=rgba[i*4+3];texture=new T.DataTexture(data,width,height,T.RedFormat);texture.flipY=true;texture.generateMipmaps=true;texture.needsUpdate=true}
 else{texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace}
 texture.anisotropy=8;texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;return texture;
}
export function floorTexture(){return paintedTexture(2048,2048,(x,w,h)=>{
 const random=randomSeed(71);x.fillStyle='#b3a4d3';x.fillRect(0,0,w,h);const board=w/26;
 for(let i=0;i<26;i++){
  x.fillStyle=['#b2a2d0','#b7a8d6','#af9fcd','#b6a6d5'][i%4];x.fillRect(i*board,0,board,h);
  x.strokeStyle='#827096';x.lineWidth=1.5;x.beginPath();x.moveTo(i*board,0);for(let z=0;z<=h;z+=128)x.lineTo(i*board+Math.sin(z*.02+i)*1.1,z);x.stroke();
  for(let j=0;j<5;j++){const z=(j*413+i*143)%h;x.strokeStyle='#8e7ca5';x.lineWidth=1.1;x.beginPath();x.moveTo(i*board,z);x.lineTo((i+1)*board,z+1);x.stroke()}
  for(let j=0;j<28;j++){const px=i*board+8+random()*(board-16),py=random()*h,len=4+random()*23;x.strokeStyle=j%3?'#9684ad':'#c6b6de';x.lineWidth=.8+random()*.8;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.sin(j)*1.1,py+len*.5);x.lineTo(px+.4,py+len);x.stroke()}
 }
 const glow=x.createRadialGradient(w*.30,h*.24,0,w*.30,h*.24,w*.25);glow.addColorStop(0,'#ffcadc55');glow.addColorStop(1,'#ffcadc00');x.fillStyle=glow;x.fillRect(0,0,w,h);
})}
export function rugTexture(){return paintedTexture(1024,768,(x,w,h)=>{
 const random=randomSeed(53);x.fillStyle='#805262';x.fillRect(0,0,w,h);
 x.strokeStyle='#5f3d52';x.lineWidth=13;x.beginPath();x.ellipse(w/2,h/2,w*.46,h*.44,0,0,Math.PI*2);x.stroke();
 x.strokeStyle='#a57583';x.lineWidth=3;x.beginPath();x.ellipse(w/2,h/2,w*.445,h*.42,0,0,Math.PI*2);x.stroke();
 for(let i=0;i<500;i++){const px=random()*w,py=random()*h;x.strokeStyle=i%3?'#694556':'#966676';x.lineWidth=1.1;x.beginPath();x.moveTo(px,py);x.lineTo(px+5,py+2);x.lineTo(px+9,py+1);x.stroke()}
})}
export function timberTexture(seed=89){return paintedTexture(1024,512,(x,w,h)=>{
 const random=randomSeed(seed);x.fillStyle='#513b56';x.fillRect(0,0,w,h);const plank=h/8;
 for(let i=0;i<8;i++){
  x.fillStyle=i%2?'#553e5b':'#4e3854';x.fillRect(0,i*plank,w,plank);
  x.strokeStyle='#35283e';x.lineWidth=3;x.beginPath();x.moveTo(0,i*plank+1);x.lineTo(w,i*plank+1);x.stroke();
  for(let j=0;j<25;j++){const px=random()*w,py=i*plank+10+random()*(plank-20);x.strokeStyle=j%4?'#3c2d45':'#755770';x.lineWidth=1+random();x.beginPath();x.moveTo(px,py);x.lineTo(px+10+random()*45,py+Math.sin(j)*1.5);x.stroke()}
 }
})}
export function barkMarks(seed){return paintedTexture(1024,2048,(x,w,h)=>{
 const random=randomSeed(seed);x.clearRect(0,0,w,h);x.strokeStyle='#3c2d46';
 for(let i=0;i<150;i++){const px=random()*w,py=random()*h,len=10+random()*100;x.lineWidth=1+random()*2;x.beginPath();x.moveTo(px,py);x.bezierCurveTo(px+6,py+len*.3,px-5,py+len*.7,px+2,py+len);x.stroke()}
},true)}
export function clockTexture(){return paintedTexture(512,512,(x,w,h)=>{
 x.fillStyle='#baacd9';x.fillRect(0,0,w,h);x.save();x.translate(w/2,h/2);
 x.strokeStyle='#514674';x.lineCap='round';
 for(let i=0;i<60;i++){const a=i/60*Math.PI*2,r=i%5?201:190;x.lineWidth=i%5?2:5;x.beginPath();x.moveTo(Math.sin(a)*r,-Math.cos(a)*r);x.lineTo(Math.sin(a)*211,-Math.cos(a)*211);x.stroke()}
 x.strokeStyle='#4d365c';x.lineWidth=10;x.beginPath();x.moveTo(-76,-36);x.lineTo(0,0);x.lineTo(87,-133);x.stroke();x.fillStyle='#74538b';x.beginPath();x.arc(0,0,12,0,Math.PI*2);x.fill();x.restore();
})}
