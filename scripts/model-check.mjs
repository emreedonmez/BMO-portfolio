import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('artifacts',{recursive:true});
const launch={executablePath:'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']};
const browser=await chromium.launch(launch);
const results={parts:[],viewports:[],controls:[],errors:[]};
try{
 const page=await browser.newPage({viewport:{width:1440,height:810}});
 page.on('pageerror',e=>results.errors.push(e.message));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>window.portfolioDiagnostics?.().webgl);
 let d=await page.evaluate(()=>window.portfolioDiagnostics());
 assert.ok(d.bmoBounds.height/810<.26,'BMO must be small in the room');
 assert.ok(d.bmoBounds.height/810>.15,'BMO must remain visible and clickable');
 for(const part of d.modelAudit.components){assert.ok(part.finite&&part.vertices>0,part.name);results.parts.push(part)}
 for(const c of d.modelAudit.controls){assert.ok(c.frontVertices>0,c.id);assert.ok(c.frontPlaneDeviation<1e-7,c.id);assert.ok(c.protrusion<.03,c.id);assert.deepEqual(c.rotation,[0,0,0]);assert.ok(Math.abs(c.depth-.024)<1e-7,c.id)}
 await page.mouse.click(d.bmoCenter.x,d.bmoCenter.y);
 await page.waitForFunction(()=>window.portfolioDiagnostics().view==='portfolio'&&!window.portfolioDiagnostics().transitioning);
 assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('transitioning')),false,'reduced motion is immediate');
 for(const key of ['down','up','left','right']){
  d=await page.evaluate(()=>window.portfolioDiagnostics());const p=d.dpadTargets[key];await page.mouse.move(p.x,p.y);
  const before=(await page.evaluate(()=>window.portfolioDiagnostics())).selected;
  await page.mouse.click(p.x,p.y);d=await page.evaluate(()=>window.portfolioDiagnostics());
  assert.equal(d.selected,(before+(key==='up'||key==='left'?-1:1)+6)%6,key);results.controls.push(key);
 }
 d=await page.evaluate(()=>window.portfolioDiagnostics());
 while(d.selected!==1){await page.keyboard.press('ArrowDown');d=await page.evaluate(()=>window.portfolioDiagnostics())}
 const control=action=>d.buttons.find(b=>b.action===action);
 const red=control('confirm');await page.mouse.click(red.x,red.y);assert.equal((await page.evaluate(()=>window.portfolioDiagnostics())).mode,'detail');assert.ok(await page.getByRole('heading',{name:'İpucum',exact:true}).isVisible());results.controls.push('red-select');
 const green=control('back');await page.mouse.click(green.x,green.y);assert.equal((await page.evaluate(()=>window.portfolioDiagnostics())).mode,'menu');results.controls.push('green-back');
 const blue=control('sound');await page.mouse.click(blue.x,blue.y);assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');await page.mouse.click(blue.x,blue.y);results.controls.push('blue-sound');
 await page.waitForFunction(()=>window.portfolioDiagnostics().modelAudit.controls.every(c=>Math.abs(c.z-.580)<1e-8),{},{timeout:5000});d=await page.evaluate(()=>window.portfolioDiagnostics());
 const triangle=control('room');await page.mouse.click(triangle.x,triangle.y);assert.equal((await page.evaluate(()=>window.portfolioDiagnostics())).view,'room');results.controls.push('triangle-room');
 // Inspect every generated part in front, side, high and low views.
 const review=await browser.newPage({viewport:{width:800,height:900}});
 for(const [name,yaw,pitch]of [['front',0,0],['left',-30,8],['right',30,8],['high',-20,28],['low',20,-8],['side-left',-65,8],['side-right',65,8]]){
  await review.goto(`http://127.0.0.1:5173/scripts/fixtures/model-review.html?yaw=${yaw}&pitch=${pitch}`);await review.waitForSelector('body[data-ready]',{state:'attached'});
  assert.ok(await review.evaluate(()=>window.modelAudit.components.every(c=>c.finite)));
  await review.screenshot({path:`artifacts/model-${name}.png`});
 }
 await review.close();
 // The real 3D room fills every responsive viewport without a backplate.
 for(const [w,h]of [[320,700],[390,844],[1024,768],[1440,810],[2560,1080]]){
  await page.setViewportSize({width:w,height:h});await page.waitForFunction(({w,h})=>{const c=document.querySelector('#world>canvas'),ratio=portfolioDiagnostics().orbit.dpr;return c.width===Math.floor(w*ratio)&&c.height===Math.floor(h*ratio)},{w,h});d=await page.evaluate(()=>window.portfolioDiagnostics());
  const canvas=await page.locator('#world > canvas').evaluate(el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height}});
  assert.equal(await page.locator('#room-art').count(),0);assert.equal(canvas.x,0);assert.equal(canvas.y,0);assert.equal(canvas.width,w);assert.equal(canvas.height,h);
  assert.ok(d.roomAudit.full3D&&!d.roomAudit.roomImage);assert.ok(d.roomCoverage.every(Boolean));assert.ok(d.roomAudit.parts.length>250);
  assert.ok(d.bmoBounds.height/h<.26);assert.ok(d.bmoBounds.left>0&&d.bmoBounds.right<w);assert.ok(d.bmoBounds.top>0&&d.bmoBounds.bottom<h);
  assert.equal(await page.locator('html').evaluate(e=>e.scrollWidth<=innerWidth&&e.scrollHeight<=innerHeight),true);
  results.viewports.push({width:w,height:h,bmoHeightRatio:d.bmoBounds.height/h,roomMeshes:d.roomAudit.parts.length});
 }
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await mobile.goto('http://127.0.0.1:5173/');await mobile.waitForFunction(()=>window.portfolioDiagnostics?.().webgl);
 d=await mobile.evaluate(()=>window.portfolioDiagnostics());await mobile.touchscreen.tap(d.bmoCenter.x,d.bmoCenter.y);
 await mobile.waitForFunction(()=>window.portfolioDiagnostics().view==='portfolio'&&!window.portfolioDiagnostics().transitioning);
 await mobile.getByRole('button',{name:'My About'}).tap();await mobile.getByRole('button',{name:'Down',exact:true}).tap();assert.ok(await mobile.locator('.screen-content').evaluate(e=>e.scrollTop)>0);await mobile.close();
 assert.deepEqual(results.errors,[]);
 await writeFile('artifacts/model-audit.json',JSON.stringify(results,null,2));
 console.log(`Passed: ${results.parts.length} model components, ${results.controls.length} physical controls, 7 model angles, 5 viewport compositions and mobile touch.`);
}finally{await browser.close()}
const noGL=await chromium.launch({...launch,args:['--disable-webgl','--no-sandbox']});
try{const page=await noGL.newPage();await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('.fallback-mode',{state:'attached'});await page.getByRole('button',{name:'My About'}).click();assert.ok(await page.getByRole('article',{name:'My About'}).isVisible());console.log('Readable WebGL fallback passed.')}finally{await noGL.close()}
