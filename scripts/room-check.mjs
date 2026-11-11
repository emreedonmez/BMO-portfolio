import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await mkdir('artifacts',{recursive:true});
const before=JSON.parse(await readFile('scripts/fixtures/approved-files.json','utf8'));
for(const [path,hash]of Object.entries(before))assert.equal(createHash('sha256').update((await readFile(path,'utf8')).replace(/\r\n/g,'\n')).digest('hex'),hash,`Approved file changed: ${path}`);
const browser=await chromium.launch({executablePath:'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[],requests=[];
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>window.portfolioDiagnostics?.().roomAudit.full3D);
 const initial=await page.evaluate(()=>window.portfolioDiagnostics());
 assert.ok(initial.roomAudit.parts.length>250);assert.ok(initial.roomCoverage.every(Boolean));
 for(const part of initial.roomAudit.parts){assert.ok(part.finite&&part.vertices>0,part.name)}
 for(const name of ['burgundy-tabletop','couch-back-frame','curved-gramophone-horn','blue-clock-case','right-frame-trunk-trunk','open-turntable-lid','book-pages']){
  const part=initial.roomAudit.parts.find(p=>p.name===name);assert.ok(part,name);assert.ok(part.size.every(v=>v>.01),`${name} must have real depth`);assert.notEqual(part.type,'PlaneGeometry');
 }
 assert.ok(!requests.some(u=>u.includes('treehouse-room.png')),'No room image may load');
 await page.screenshot({path:'artifacts/room-3d-desktop.png'});
 await page.mouse.move(1220,230);await page.waitForTimeout(750);
 const shifted=await page.evaluate(()=>window.portfolioDiagnostics());
 const shift=key=>Math.hypot(shifted.roomLandmarks[key].x-initial.roomLandmarks[key].x,shifted.roomLandmarks[key].y-initial.roomLandmarks[key].y);
 assert.ok(shift('couch')>.5,'Pointer movement must reveal actual room depth');
 assert.ok(Math.abs(shift('couch')-shift('table'))>.2,'Near and far objects must have different parallax');
 await page.screenshot({path:'artifacts/room-3d-parallax.png'});
 const review=await browser.newPage({viewport:{width:1440,height:810}});
 for(const [name,query]of [['left','dx=-3'],['right','dx=3'],['high','dy=2'],['wireframe','wire=1']]){
  await review.goto('http://127.0.0.1:5173/scripts/fixtures/room-review.html?'+query);await review.waitForSelector('body[data-ready]',{state:'attached'});
  assert.ok(await review.evaluate(()=>window.roomReview.parts.every(p=>p.finite)));
  await review.screenshot({path:`artifacts/room-3d-${name}.png`});
 }
 await review.close();
 const large=await browser.newPage({viewport:{width:2560,height:1440},deviceScaleFactor:1.5});
 await large.goto('http://127.0.0.1:5173/');await large.waitForFunction(()=>window.portfolioDiagnostics?.().roomAudit.full3D);await large.screenshot({path:'artifacts/room-3d-4k.png'});await large.close();
 await page.setViewportSize({width:390,height:844});await page.mouse.move(0,0);await page.screenshot({path:'artifacts/room-3d-mobile.png'});
 await page.getByRole('button',{name:'Meet BMO'}).click();await page.waitForFunction(()=>!window.portfolioDiagnostics().transitioning);await page.screenshot({path:'artifacts/room-3d-mobile-focus.png'});
 assert.deepEqual(errors,[]);
 await writeFile('artifacts/room-audit.json',JSON.stringify({parts:initial.roomAudit.parts,approvedFilesUnchanged:true,noRoomBackplate:true,parallax:{couch:shift('couch'),table:shift('table')},drawCalls:initial.meshes,triangles:initial.triangles,errors},null,2));
 console.log(`Passed: ${initial.roomAudit.parts.length} room meshes, genuine depth/parallax, alternate camera views, 4K render, approved BMO unchanged.`);
}finally{await browser.close()}
