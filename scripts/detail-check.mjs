import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const result={views:[],errors:[]};
try{
 const page=await browser.newPage({viewport:{width:1440,height:810},reducedMotion:'reduce'});
 page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.errors.push(m.text())});
 await page.goto('http://127.0.0.1:5173');await page.waitForFunction(()=>window.portfolioDiagnostics);const d=await page.evaluate(()=>portfolioDiagnostics()),audit=d.roomAudit;
 assert.equal(audit.cavities.length,23);assert.equal(audit.shadows.length,16);audit.shadows.forEach(s=>{assert.equal(s.depthWrite,false);assert.equal(s.renderOrder,10);assert.ok(Math.abs(s.y-(s.name.startsWith('table-')?.037:-.043))<1e-6,s.name)});
 assert.ok(audit.dimensions.width<=70&&audit.dimensions.height<=28&&audit.dimensions.front-audit.dimensions.back<=74);
 assert.ok(d.orbit.far/d.orbit.near<=800);assert.ok(d.orbit.maxDistance<30);
 assert.ok(!audit.parts.some(p=>/plank-seams|rug-weave|floor-paint|sunset-light-on-floor|clock-hour-marks/.test(p.name)),'Thin, competing surface layers must be replaced by painted surface maps');
 assert.ok(!audit.parts.some(p=>p.type==='LineSegmentsGeometry'),'Surface marks must not use floating line meshes');
 const hashes=[];for(let i=0;i<3;i++){const png=await page.screenshot();hashes.push(createHash('sha256').update(png).digest('hex'));await page.waitForTimeout(120)}assert.ok(hashes.every(h=>h===hashes[0]),'Resting surfaces must remain pixel-stable');result.restingFrameHashes=hashes;
 const samples=[];for(let i=0;i<24;i++){await page.keyboard.press('ArrowLeft');await page.evaluate(()=>new Promise(requestAnimationFrame));const pose=await page.evaluate(()=>portfolioDiagnostics().orbit);samples.push(pose);assert.ok(Math.abs(pose.position[1]-d.orbit.position[1])<1e-6,'An occluding object must not lift the camera');}
 result.horizontalHeightRange=Math.max(...samples.map(s=>s.position[1]))-Math.min(...samples.map(s=>s.position[1]));
 const review=await browser.newPage({viewport:{width:900,height:800}});review.on('pageerror',e=>result.errors.push(e.message));review.on('console',m=>{if(m.type()==='error')result.errors.push(m.text())});
 const cases=[['rug','irregular-woven-rug',-14,60],['table','foreground-table',-14,25],['clock-front','blue-clock',-14,10],['clock-side','blue-clock',35,8],['hole-front','right-frame-trunk-knot-rim-0',-14,8],['hole-side','right-frame-trunk-knot-rim-1',35,8],['hole-back','left-back-trunk-knot-rim-1',-50,10],['records','gramophone-corner',-14,18],['frame-0','record-frame-0',-14,6],['frame-1','record-frame-1',35,8],['headphones','headphones-assembly',-14,10],['radio','radio-assembly',-14,8],['book','olive-book-cover',-14,55],['chair','purple-couch',-14,18],['shelf','wall-shelf',-14,8],['rear','rear-storage-bench',165,15]];
 for(const [name,part,yaw,pitch]of cases){
  await review.goto(`http://127.0.0.1:5173/scripts/fixtures/room-review.html?part=${part}&yaw=${yaw}&pitch=${pitch}&isolate=1`);await review.waitForSelector('body[data-ready]',{state:'attached'});
  assert.ok(await review.evaluate(()=>roomReview.parts.every(p=>p.finite)));await review.screenshot({path:`artifacts/detail-${name}.png`});result.views.push(name);console.log('Inspected detail '+name);
 }
 assert.deepEqual(result.errors,[]);result.shadows=audit.shadows;result.cavities=audit.cavities.length;await writeFile('artifacts/detail-audit.json',JSON.stringify(result,null,2));console.log('Passed: stable pixels, no automatic vertical movement, 23 real cavities, 16 anchored shadows and 16 detail views.');
}finally{await browser.close()}
