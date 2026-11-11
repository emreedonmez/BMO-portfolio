import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.emulateMedia({reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('body.ready',{state:'attached'});
let d=await page.evaluate(()=>window.portfolioDiagnostics());await page.mouse.click(d.bmoCenter.x,d.bmoCenter.y);await page.waitForTimeout(1500);
d=await page.evaluate(()=>window.portfolioDiagnostics());assert.equal(d.view,'portfolio');
// The cross is raycast at its lower lobe, not through the HTML navigation.
let pad=d.buttons.find(b=>b.action==='dpad');await page.mouse.move(pad.x,pad.y+36);const before=(await page.evaluate(()=>window.portfolioDiagnostics())).selected;await page.mouse.click(pad.x,pad.y+36);d=await page.evaluate(()=>window.portfolioDiagnostics());assert.equal(d.selected,(before+1)%6);
while(d.selected!==1){await page.keyboard.press('ArrowDown');d=await page.evaluate(()=>window.portfolioDiagnostics())}
let red=d.buttons.find(b=>b.action==='confirm');await page.mouse.click(red.x,red.y);d=await page.evaluate(()=>window.portfolioDiagnostics());assert.equal(d.mode,'detail');assert.ok(await page.getByRole('heading',{name:'İpucum',exact:true}).isVisible());
let back=d.buttons.find(b=>b.action==='back');await page.mouse.click(back.x,back.y);assert.equal((await page.evaluate(()=>window.portfolioDiagnostics())).mode,'menu');
let room=d.buttons.find(b=>b.action==='room');await page.mouse.click(room.x,room.y);assert.equal((await page.evaluate(()=>window.portfolioDiagnostics())).view,'room');
await page.setViewportSize({width:320,height:700});await page.getByRole('button',{name:'Say hello to BMO'}).click();await page.waitForTimeout(1500);assert.equal(await page.locator('html').evaluate(e=>e.scrollWidth<=innerWidth),true);
console.log('Model raycasting, camera return, reduced motion and narrow viewport checks passed.');
}finally{await browser.close()}
const fallbackBrowser=await chromium.launch({executablePath:'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true,args:['--disable-webgl','--no-sandbox']});
try{const page=await fallbackBrowser.newPage();await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('.fallback-mode',{state:'attached'});await page.getByRole('button',{name:'My About'}).click();assert.ok(await page.getByRole('article',{name:'My About'}).isVisible());console.log('WebGL unavailable: readable fallback passed.')}finally{await fallbackBrowser.close()}
