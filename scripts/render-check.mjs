// Local software QA uses an isolated headless profile; it never attaches to a user's browser.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('body.ready',{state:'attached'});await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'artifacts/room-desktop.png'});
assert.equal(await page.title(),"Emre's Portfolio");assert.equal((await page.evaluate(()=>window.portfolioDiagnostics())).webgl,true);
await page.getByRole('button',{name:'Say hello to BMO'}).click();await page.waitForTimeout(1500);await page.screenshot({path:'artifacts/portfolio-desktop.png'});assert.equal((await page.evaluate(()=>window.portfolioDiagnostics())).view,'portfolio');
await page.getByRole('button',{name:'My About'}).click();await page.screenshot({path:'artifacts/about-desktop.png'});assert.ok(await page.getByRole('article',{name:'My About'}).textContent());
await page.keyboard.press('ArrowDown');assert.ok(await page.locator('.screen-content').evaluate(el=>el.scrollTop)>0);
await page.keyboard.press('Escape');await page.getByRole('button',{name:'My LinkedIn'}).click();assert.ok(await page.getByText('Would you like to visit my LinkedIn profile?').isVisible());await page.getByRole('button',{name:'NO',exact:true}).click();
await page.getByRole('button',{name:'My Resume'}).click();assert.equal(await page.getByRole('link',{name:'Open my resume'}).getAttribute('href'),'/ozgecmis.pdf');assert.ok((await page.request.get('http://127.0.0.1:5173/ozgecmis.pdf')).ok());await page.keyboard.press('Escape');
await page.getByRole('button',{name:'THE ROOM'}).click();await page.waitForTimeout(1500);
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/room-mobile.png'});await page.getByRole('button',{name:'Say hello to BMO'}).click();await page.waitForTimeout(1500);await page.screenshot({path:'artifacts/portfolio-mobile.png'});
await page.getByRole('button',{name:'My About'}).click();await page.screenshot({path:'artifacts/about-mobile.png'});
await writeFile('artifacts/qa.json',JSON.stringify({errors,diagnostics:await page.evaluate(()=>window.portfolioDiagnostics())},null,2));assert.deepEqual(errors,[]);
console.log('Local render and navigation checks passed.');
}finally{await browser.close()}

