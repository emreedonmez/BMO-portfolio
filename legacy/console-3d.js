import * as THREE from './vendor/three.module.min.js';
const canvas=document.querySelector('#console-3d');
const front=document.querySelector('.console');
try {
  await document.fonts.ready;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(600,864,false);
  renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-300,300,432,-432,1,1800);camera.position.z=1100;
  const body=new THREE.Group();body.matrixAutoUpdate=false;scene.add(body);
  function syncPose(cssMatrix){
    // CSS is Y-down; Three.js is Y-up. Z points toward the viewer in BOTH.
    // Conjugate by the basis change S=diag(1,-1,1,1): Mthree = S Mcss S.
    const basis=[1,-1,1,1];
    body.matrix.fromArray(cssMatrix.map((value,index)=>value*basis[index%4]*basis[Math.floor(index/4)]));
    body.matrixWorldNeedsUpdate=true;
  }
  // Soft studio panels provide controlled reflections on the moulded plastics.
  const studio=document.createElement('canvas');studio.width=512;studio.height=256;
  const context=studio.getContext('2d');context.fillStyle='#6b7079';context.fillRect(0,0,512,256);
  const softbox=context.createRadialGradient(130,72,8,130,72,110);
  softbox.addColorStop(0,'#ffffff');softbox.addColorStop(.5,'#dedfd9');softbox.addColorStop(1,'#6b7079');
  context.fillStyle=softbox;context.fillRect(0,0,300,230);
  context.fillStyle='#e3e6e9';context.fillRect(360,40,45,110);
  const environment=new THREE.CanvasTexture(studio);environment.mapping=THREE.EquirectangularReflectionMapping;environment.colorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer);const studioMap=pmrem.fromEquirectangular(environment);
  scene.environment=studioMap.texture;environment.dispose();pmrem.dispose();
  // Fine moulded ABS texture, generated locally and fixed across renders.
  const noise=new Uint8Array(128*128*4);let seed=17;
  for(let i=0;i<noise.length;i+=4){seed=(1664525*seed+1013904223)>>>0;const n=100+(seed%55);noise[i]=noise[i+1]=noise[i+2]=n;noise[i+3]=255}
  const grain=new THREE.DataTexture(noise,128,128);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;
  grain.repeat.set(.035,.035);grain.magFilter=THREE.LinearFilter;grain.needsUpdate=true;
  const plastic=new THREE.MeshStandardMaterial({color:0xd5d0c2,roughness:.68,metalness:0,bumpMap:grain,bumpScale:.16,envMapIntensity:.3});
  const rearPlastic=new THREE.MeshStandardMaterial({color:0xb7b3a8,roughness:.74,bumpMap:grain,bumpScale:.13});
  const seamMaterial=new THREE.MeshStandardMaterial({color:0x6a695f,roughness:.9});
  const graphite=new THREE.MeshStandardMaterial({color:0x34383a,roughness:.56,metalness:.02});
  const rubber=new THREE.MeshStandardMaterial({color:0x272d2d,roughness:.62});
  const burgundy=new THREE.MeshPhysicalMaterial({color:0x8c2849,roughness:.34,clearcoat:.3,clearcoatRoughness:.38,envMapIntensity:.8});
  const wellMaterial=new THREE.MeshStandardMaterial({color:0xb9b5a7,roughness:.85});
  // Model and interactive typography use identical front-plane coordinates.
  function rounded(w,h,radii){
    const [tl,tr,br,bl]=Array.isArray(radii)?radii:[radii,radii,radii,radii];
    const s=new THREE.Shape(),l=-w/2,r=w/2,t=h/2,b=-h/2;
    s.moveTo(l+tl,t);s.lineTo(r-tr,t);s.quadraticCurveTo(r,t,r,t-tr);
    s.lineTo(r,b+br);s.quadraticCurveTo(r,b,r-br,b);s.lineTo(l+bl,b);
    s.quadraticCurveTo(l,b,l,b+bl);s.lineTo(l,t-tl);s.quadraticCurveTo(l,t,l+tl,t);return s;
  }
  function extrude(shape,depth,bevel,material,x=210,y=342,z=0){
    const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:5,curveSegments:24,steps:1});
    geometry.translate(0,0,-depth-bevel);
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x-210,342-y,z);
    mesh.castShadow=true;mesh.receiveShadow=false;body.add(mesh);return mesh;
  }
  const outer=[20,20,76,20];
  extrude(rounded(406,670,outer.map(r=>r-7)),16,7,rearPlastic,210,342,-26);
  extrude(rounded(417,681,outer.map(r=>r-1.5)),1.5,.6,seamMaterial,210,342,-23.5);
  extrude(rounded(400,664,outer.map(r=>r-10)),13,10,plastic);
  // Measure once in the undeformed front plane, even if a drag started during font loading.
  front.classList.add('model-measuring');front.style.setProperty('transform','none','important');
  const reference=front.getBoundingClientRect(),scale=reference.width/420;
  function bounds(selector){
    const element=typeof selector==='string'?document.querySelector(selector):selector;
    const r=element.getBoundingClientRect();
    return {x:(r.left-reference.left+r.width/2)/scale,y:(r.top-reference.top+r.height/2)/scale,w:element.offsetWidth,h:element.offsetHeight};
  }
  const bezel=bounds('.bezel'),lcd=bounds('.screen');
  const frame=rounded(bezel.w-4,bezel.h-4,[9,9,37,9]);
  const opening=rounded(lcd.w+4,lcd.h+4,1).getPoints(8).map(p=>new THREE.Vector2(p.x+lcd.x-bezel.x,p.y+bezel.y-lcd.y));
  frame.holes.push(new THREE.Path(opening.reverse()));
  extrude(frame,4,2,graphite,bezel.x,bezel.y,5);
  // A raised cross over a recessed circular seat.
  const pad=bounds('.dpad');
  const disc=new THREE.Shape();disc.absarc(0,0,62,0,Math.PI*2,false);
  extrude(disc,.8,1.5,wellMaterial,pad.x,pad.y,.4);
  const cross=new THREE.Shape();
  const points=[[-17,54],[17,54],[17,17],[54,17],[54,-17],[17,-17],[17,-54],[-17,-54],[-17,-17],[-54,-17],[-54,17],[-17,17]];
  cross.moveTo(...points[0]);points.slice(1).forEach(p=>cross.lineTo(...p));cross.closePath();
  const crossMesh=extrude(cross,6,2.5,rubber,pad.x,pad.y,9);
  const dimple=new THREE.Mesh(new THREE.CircleGeometry(11,48),new THREE.MeshStandardMaterial({color:0x242929,roughness:.8}));
  dimple.position.set(pad.x-210,342-pad.y,9.15);body.add(dimple);
  const buttons=new Map();
  for(const button of document.querySelectorAll('.round')){
    const p=bounds(button),well=new THREE.Shape();well.absarc(0,0,30,0,Math.PI*2,false);
    extrude(well,.5,1.4,wellMaterial,p.x,p.y,.5);
    const profile=[[0,0],[23,0],[25,1],[26,3],[26,6],[25,8],[22,9],[16,9.7],[0,10]].map(([r,z])=>new THREE.Vector2(r,z));
    const geometry=new THREE.LatheGeometry(profile,64);geometry.rotateX(Math.PI/2);
    const mesh=new THREE.Mesh(geometry,burgundy);mesh.position.set(p.x-210,342-p.y,1);mesh.castShadow=true;mesh.receiveShadow=false;body.add(mesh);buttons.set(button,{mesh,z:1,faceZ:11});
  }
  const switches=new Map();
  for(const button of document.querySelectorAll('.lower-controls button')){
    const p=bounds(button),material=new THREE.MeshStandardMaterial({color:0x7d8178,roughness:.55});
    const mesh=extrude(rounded(p.w-3,p.h-3,6),2,1.5,material,p.x,p.y,4);
    mesh.rotation.z=24*Math.PI/180;buttons.set(button,{mesh,z:4,faceZ:4});switches.set(button,material);
  }
  for(const vent of document.querySelectorAll('.speaker i')){
    const p=bounds(vent);
    const lip=extrude(rounded(7,50,3),.4,.7,rearPlastic,p.x,p.y,.5);lip.rotation.z=25*Math.PI/180;
    const slit=extrude(rounded(3.8,46,1.9),.1,.35,seamMaterial,p.x-.5,p.y-.7,.8);slit.rotation.z=25*Math.PI/180;
  }
  front.style.removeProperty('transform');front.classList.remove('model-measuring');
  // Broad studio lighting with real cast shadows on a receiving surface.
  scene.add(new THREE.HemisphereLight(0xfffcf5,0x565861,.85));
  const key=new THREE.DirectionalLight(0xfff6e5,2.35);key.position.set(-310,420,620);
  key.castShadow=true;key.shadow.mapSize.set(1024,1024);
  Object.assign(key.shadow.camera,{left:-450,right:450,top:540,bottom:-540,near:1,far:1600});
  key.shadow.normalBias=.65;key.shadow.bias=-.00015;key.shadow.radius=16;key.shadow.blurSamples=20;scene.add(key);
  const fill=new THREE.DirectionalLight(0xd5e3ff,.38);fill.position.set(360,90,500);scene.add(fill);
  const shadowPlane=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),new THREE.ShadowMaterial({opacity:.21}));
  // Keep the original shadow projection, but place its depth behind the model.
  // Only the receiver's depth changes: shell geometry, lighting, reflections,
  // camera, shared pose and the single render pass remain untouched.
  shadowPlane.material.depthWrite=false;
  shadowPlane.material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',
      '#include <project_vertex>\n gl_Position.z = gl_Position.w * 0.999;');
  };
  shadowPlane.material.customProgramCacheKey=()=> 'backdrop-shadow-depth-v1';
  shadowPlane.position.z=-58;shadowPlane.receiveShadow=true;scene.add(shadowPlane);
  const render=()=>renderer.render(scene,camera);
  function syncButtons(){
    for(const [button,{mesh,z,faceZ}] of buttons){
      const travel=button.matches(':active')||button.classList.contains('pressed')?2:0;
      mesh.position.z=z-travel;
      button.style.setProperty('--face-depth',`${faceZ-travel}px`);
    }
    const padTravel=document.querySelector('.dpad button:active,.dpad button.pressed')?1.5:0;
    crossMesh.position.z=9-padTravel;dimple.position.z=9.15-padTravel;
    document.querySelector('.dpad').style.setProperty('--face-depth',`${9-padTravel}px`);
    for(const [button,material] of switches)material.color.set(button.getAttribute('aria-pressed')==='true'?0x8c3f5a:0x7d8178);
    render();
  }
  syncPose(Array.from(new DOMMatrix(getComputedStyle(front).transform).toFloat64Array()));
  render();document.documentElement.classList.add('webgl-ready','model-controls');syncButtons();
  window.addEventListener('console-tilt',({detail:{matrix}})=>{syncPose(matrix);render()});
  const observer=new MutationObserver(syncButtons);
  for(const button of document.querySelectorAll('.controls button,.lower-controls button'))observer.observe(button,{attributes:true,attributeFilter:['class','aria-pressed']});
  front.addEventListener('pointerdown',()=>requestAnimationFrame(syncButtons));
  window.addEventListener('pointerup',()=>requestAnimationFrame(syncButtons));
  window.addEventListener('pointercancel',()=>requestAnimationFrame(syncButtons));
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();document.documentElement.classList.remove('webgl-ready','model-controls')});
  canvas.addEventListener('webglcontextrestored',()=>{render();document.documentElement.classList.add('webgl-ready','model-controls')});
} catch(error) {
  front.style.removeProperty('transform');front.classList.remove('model-measuring');
  canvas.hidden=true;document.documentElement.classList.remove('webgl-ready','model-controls');
  console.warn('3D renderer unavailable; using the CSS console.',error);
}
