// Trusted input in an isolated software-test browser; no user browser is attached.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const result={angles:[],screens:[],errors:[],hardware:'Isolated Chromium touch/viewport emulation; no physical phone attached.'};
const info=page=>page.evaluate(async()=>{await new Promise(requestAnimationFrame);const d=portfolioDiagnostics();return {view:d.view,transitioning:d.transitioning,orbit:d.orbit,coverage:d.roomCoverage,bounds:d.bmoBounds}});
async function settle(page){await page.waitForFunction(()=>window.portfolioDiagnostics&&!portfolioDiagnostics().transitioning)}
async function touch(cdp,points,type='touchMove'){await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([id,x,y])=>({id,x,y,radiusX:3,radiusY:3,force:1}))})}
async function swipe(cdp,x1,y1,x2,y2){await touch(cdp,[[1,x1,y1]],'touchStart');for(let i=1;i<=12;i++){await touch(cdp,[[1,x1+(x2-x1)*i/12,y1+(y2-y1)*i/12]]);await new Promise(r=>setTimeout(r,18))}await touch(cdp,[],'touchEnd')}
function errors(page){page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.errors.push(m.text())})}
try{
 const page=await browser.newPage({viewport:{width:1440,height:810}});errors(page);await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:5173');await settle(page);const initial=await info(page);
 const contacts=await page.evaluate(()=>portfolioDiagnostics().roomAudit.contacts);assert.equal(contacts.length,12);contacts.forEach(c=>assert.ok(Math.abs(c.gap)<1e-6,c.name));result.contacts=contacts;
 await page.screenshot({path:'artifacts/orbit-initial.png'});
 // Hover is still; holding and dragging is what rotates the scene.
 await page.mouse.move(1250,400);assert.deepEqual((await info(page)).orbit.position,initial.orbit.position);
 let prior=initial.orbit.azimuth,total=0;
 for(let i=0;i<8;i++){
  await page.mouse.move(1160,650);await page.mouse.down();await page.mouse.move(880,650,{steps:14});await page.mouse.up();
  const d=await info(page),turn=Math.atan2(Math.sin(d.orbit.azimuth-prior),Math.cos(d.orbit.azimuth-prior));total+=turn;prior=d.orbit.azimuth;
  assert.equal(d.view,'room');assert.ok(d.orbit.clear&&d.orbit.sightlineClear);assert.ok(d.coverage.every(Boolean));assert.ok(Math.abs(d.orbit.distance-initial.orbit.distance)<1e-6);result.angles.push(d.orbit);
  await page.screenshot({path:`artifacts/orbit-drag-${i+1}.png`});
 }
 assert.ok(Math.abs(total)>Math.PI*2,'Real mouse drags must cross 360 degrees without a horizontal clamp');result.dragDegrees=total*180/Math.PI;
 // Full circle returns to the chosen distance after automatic collision dolly-in.
 await page.getByRole('button',{name:'Reset room view'}).click();
 for(let i=0;i<24;i++){await page.keyboard.press('ArrowLeft');const d=await info(page);assert.ok(d.orbit.clear);assert.ok(d.coverage.every(Boolean));if(i%6===5)await page.screenshot({path:`artifacts/orbit-quarter-${(i+1)/6}.png`})}
 const circle=await info(page);assert.ok(Math.abs(circle.orbit.distance-initial.orbit.distance)<1e-6);assert.ok(Math.abs(circle.orbit.requestedDistance-initial.orbit.requestedDistance)<1e-6);
 // Approach from behind BMO and return to that explored angle, with the screen attached throughout.
 for(let i=0;i<12;i++)await page.keyboard.press('ArrowLeft');const rear=await info(page);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('button',{name:'Meet BMO'}).click();
 await page.waitForTimeout(500);assert.ok((await info(page)).orbit.clear);await settle(page);
 assert.equal((await info(page)).orbit.enabled,false);
 await page.getByRole('button',{name:'Return to the room'}).click();await settle(page);const returned=await info(page);
 assert.ok(Math.abs(returned.orbit.azimuth-rear.orbit.azimuth)<1e-5);assert.ok(returned.orbit.clear);
 // Normal damping settles, and controls still work when reduced motion changes live.
 await page.getByRole('button',{name:'Reset room view'}).click();await page.mouse.move(1100,650);await page.mouse.down();await page.mouse.move(970,590,{steps:15});await page.mouse.up();await page.waitForTimeout(1100);
 await page.waitForFunction(()=>{const angle=portfolioDiagnostics().orbit.azimuth,s=window.orbitTestStability??={angle,frames:0};s.frames=Math.abs(angle-s.angle)<1e-4?s.frames+1:0;s.angle=angle;return s.frames>=4});
 await page.keyboard.press('Home');await page.emulateMedia({reducedMotion:'reduce'});
 // Check the rendered view at both tilt limits and both zoom limits, not just the default circle.
 result.extremes=[];
 for(const [name,key,wheel]of [['high-far','ArrowUp',10000],['low-far','ArrowDown',10000],['low-near','ArrowDown',-10000]]){
  for(let i=0;i<20;i++)await page.keyboard.press(key);await page.mouse.move(1100,600);await page.mouse.wheel(0,wheel);
  for(let i=0;i<24;i++){await page.keyboard.press('ArrowLeft');const d=await info(page);assert.ok(d.orbit.clear&&d.orbit.sightlineClear,name+' camera must remain clear');assert.ok(d.coverage.every(Boolean),name+' must fill the viewport');assert.ok(Math.abs(d.orbit.distance-d.orbit.requestedDistance)<1e-6)}
  const d=await info(page);result.extremes.push({name,orbit:d.orbit});await page.screenshot({path:`artifacts/orbit-${name}.png`});
 }
 await page.keyboard.press('Home');
 for(const [w,h]of [[320,568],[360,800],[390,844],[430,932],[568,320],[844,390],[932,430],[768,1024],[1024,768],[1366,768],[1440,900],[1920,1080],[2560,1080]]){
  const context=await browser.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<=1024,deviceScaleFactor:w<600?3:1,reducedMotion:'reduce'}),p=await context.newPage();errors(p);
  await p.goto('http://127.0.0.1:5173');await settle(p);const room=await info(p);console.log(`Checking touch layout ${w}x${h}`);assert.ok(room.coverage.every(Boolean));assert.ok(room.orbit.clear);
  assert.ok(room.bounds.left>=0&&room.bounds.right<=w&&room.bounds.top>=0&&room.bounds.bottom<=h,'Initial BMO fits '+w+'x'+h);
  await p.getByRole('button',{name:'Meet BMO'}).tap();await settle(p);
  const layout=await p.evaluate(()=>{
   const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
   const menu=[...document.querySelectorAll('.screen-menu button')].map(rect),lcd=rect(document.querySelector('#portfolio')),controls=rect(document.querySelector('.accessible-controls'));
   return {menu,lcd,controls,overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight,zoom:visualViewport.scale};
  });
  assert.ok(!layout.overflow);assert.ok(layout.lcd.x>=-1&&layout.lcd.right<=w+1);assert.ok(layout.lcd.y>=0&&layout.lcd.bottom<=h-55);
  layout.menu.forEach(m=>{assert.ok(m.h>=44-1e-3&&m.w>=44,`${w}x${h} touch targets ${m.w}x${m.h}`);assert.ok(m.bottom<=layout.lcd.bottom&&m.right<=layout.lcd.right)});
  assert.ok(layout.controls.y>=0&&layout.controls.bottom<=h&&layout.controls.right<=w);assert.ok(layout.controls.right<=layout.lcd.x||layout.controls.y>=layout.lcd.bottom,'Touch controls must not cover the LCD');assert.equal(layout.zoom,1);
  await p.getByRole('button',{name:'My About'}).tap();const before=await p.locator('.screen-content').evaluate(e=>e.scrollTop);await p.getByRole('button',{name:'Down',exact:true}).tap();assert.ok(await p.locator('.screen-content').evaluate(e=>e.scrollTop)>before);
  await p.getByRole('button',{name:'Back',exact:true}).tap();await p.getByRole('button',{name:'My GitHub'}).tap();assert.ok(await p.getByText('Would you like to visit my GitHub profile?').isVisible());await p.getByRole('button',{name:'NO',exact:true}).tap();
  if([[320,568],[390,844],[844,390],[768,1024],[1920,1080]].some(([x,y])=>x===w&&y===h))await p.screenshot({path:`artifacts/orbit-screen-${w}x${h}.png`});
  result.screens.push({width:w,height:h,minMenuHeight:Math.min(...layout.menu.map(m=>m.h)),dpr:room.orbit.dpr,lcd:layout.lcd});await context.close();
 }
 // Actual touch pointer sequences: drag, pinch, cancel, then native text scrolling.
 const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:3,reducedMotion:'reduce'});errors(mobile);const cdp=await mobile.context().newCDPSession(mobile);
 await mobile.goto('http://127.0.0.1:5173');await settle(mobile);let d=await info(mobile);
 const center=await mobile.evaluate(()=>portfolioDiagnostics().bmoCenter);await swipe(cdp,center.x,center.y,center.x-100,center.y);await mobile.waitForTimeout(50);
 assert.equal((await info(mobile)).view,'room');assert.ok(Math.abs((await info(mobile)).orbit.azimuth-d.orbit.azimuth)>.3);
 const distance=(await info(mobile)).orbit.requestedDistance;await touch(cdp,[[1,150,380],[2,230,380]],'touchStart');for(let i=1;i<=10;i++)await touch(cdp,[[1,150-i*4,380],[2,230+i*4,380]]);await touch(cdp,[],'touchEnd');await mobile.waitForTimeout(50);
 assert.ok((await info(mobile)).orbit.requestedDistance<distance);assert.equal((await info(mobile)).view,'room');
 await touch(cdp,[[1,180,300]],'touchStart');await touch(cdp,[],'touchCancel');await swipe(cdp,280,350,180,350);assert.equal((await info(mobile)).view,'room');
 await mobile.getByRole('button',{name:'Reset room view'}).tap();await mobile.getByRole('button',{name:'Meet BMO'}).tap();await settle(mobile);await mobile.getByRole('button',{name:'My About'}).tap();
 const article=await mobile.locator('.screen-content').boundingBox(),angle=(await info(mobile)).orbit.azimuth;await swipe(cdp,article.x+article.width*.7,article.y+article.height-15,article.x+article.width*.7,article.y+15);await mobile.waitForTimeout(150);
 assert.ok(await mobile.locator('.screen-content').evaluate(e=>e.scrollTop)>0,'Native finger scrolling remains available inside the LCD');assert.equal((await info(mobile)).orbit.azimuth,angle);
 await mobile.setViewportSize({width:844,height:390});await settle(mobile);assert.ok(await mobile.getByRole('article',{name:'My About'}).isVisible());await mobile.screenshot({path:'artifacts/orbit-about-landscape.png'});
 await mobile.close();await page.close();assert.deepEqual(result.errors,[]);
 await writeFile('artifacts/orbit-audit.json',JSON.stringify(result,null,2));console.log(`Passed: ${Math.round(result.dragDegrees)}° real drag, 24 collision angles, ${contacts.length} grounded feet, ${result.screens.length} touch layouts, pinch/cancel/native scroll and return camera.`);
}finally{await browser.close()}
