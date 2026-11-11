// Isolated browser engines only; this does not attach to personal browser sessions.
import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('artifacts',{recursive:true});
const base=process.env.BMO_BASE_URL||'http://127.0.0.1:5173';
const engines=process.env.BMO_ENGINE?[process.env.BMO_ENGINE]:['chromium','webkit'];
const report={base,devices:[],errors:[],limitation:'Browser-engine touch/viewport emulation. No physical iPhone attached.'};
const settle=page=>page.waitForFunction(()=>{if(!window.portfolioDiagnostics)return false;const d=portfolioDiagnostics(),r=document.querySelector('#world').getBoundingClientRect();return !d.transitioning&&Math.abs(d.viewport.width-r.width)<.01&&Math.abs(d.viewport.height-r.height)<.01});
async function layout(page,label){
 const result=await page.evaluate(()=>{
  const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
  const lcd=document.querySelector('#portfolio'),corners=portfolioDiagnostics().screenCorners,b=rect(lcd),article=lcd.querySelector('article'),footer=lcd.querySelector('.screen-bottom'),status=lcd.querySelector('.os-status');
  const alignment=Math.max(Math.abs(b.left-Math.min(...corners.map(p=>p.x))),Math.abs(b.right-Math.max(...corners.map(p=>p.x))),Math.abs(b.top-Math.min(...corners.map(p=>p.y))),Math.abs(b.bottom-Math.max(...corners.map(p=>p.y))));
  const ancestors=[];for(let el=lcd;el;el=el.parentElement)ancestors.push({id:el.id||el.tagName,left:el.scrollLeft,top:el.scrollTop});
  const canvas=document.querySelector('#world>canvas').getBoundingClientRect();
  return {lcd:b,alignment,ancestors,article:article&&rect(article),footer:footer&&rect(footer),status:rect(status),menu:[...lcd.querySelectorAll('.screen-menu button')].map(rect),confirm:[...lcd.querySelectorAll('.confirm-page>*')].map(rect),buttons:[...lcd.querySelectorAll('.screen-bottom button,.confirm-actions button')].map(rect),controls:rect(document.querySelector('.accessible-controls')),utilities:rect(document.querySelector('.utilities')),width:canvas.width,height:canvas.height,transform:lcd.style.transform,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,contentOverflow:article&&article.scrollWidth>article.clientWidth+1};
 });
 assert.ok(result.alignment<.75,`${label}: LCD shifted ${result.alignment}px`);
 assert.ok(result.transform.startsWith('matrix('),`${label}: settled screen must be 2D`);
 assert.ok(!result.overflow&&!result.contentOverflow,`${label}: horizontal overflow`);
 result.ancestors.forEach(el=>assert.ok(el.left===0&&el.top===0,`${label}: ${el.id} unexpectedly scrolled`));
 const b=result.lcd;assert.ok(b.left>=0&&b.right<=result.width+.5&&b.top>=0&&b.bottom<=result.height+.5,label+' LCD bounds');
 for(const group of [result.controls,result.utilities])assert.ok(group.right<=b.left+.5||group.left>=b.right-.5||group.bottom<=b.top+.5||group.top>=b.bottom-.5,label+' controls cover LCD');
 result.menu.forEach(m=>{assert.ok(m.width>=44&&m.height>=44,`${label}: menu target ${m.width}×${m.height}`);assert.ok(m.bottom<=result.footer.top+.5&&m.top>=result.status.bottom-.5,label+' menu overlap')});
 result.buttons.forEach(b=>assert.ok(b.width>=44-.1&&b.height>=44-.1,`${label}: small screen control ${b.width}×${b.height}`));
 result.confirm.forEach(b=>assert.ok(b.top>=result.status.bottom-.5&&b.bottom<=result.footer.top+.5,label+' confirmation overlap'));
 if(result.article){assert.ok(result.article.top>=result.status.bottom-.5,label+' article under status');assert.ok(result.article.bottom<=result.footer.top+.5,label+' article under footer')}
 return result;
}
for(const engine of engines){
 const browser=await (engine==='webkit'?webkit.launch({headless:true}):chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']}));
 try{
  const sizes=engine==='webkit'?[[320,568],[390,844],[428,926],[926,428],[768,1024]]:[[280,653],[320,568],[360,800],[390,844],[428,926],[430,932],[568,320],[844,390],[926,428],[768,1024],[1024,768]];
  for(const [width,height]of sizes){
   const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,deviceScaleFactor:3,reducedMotion:'reduce'}),page=await context.newPage();
   page.on('pageerror',e=>report.errors.push(`${engine} ${width}×${height}: ${e.message}`));
   await page.goto(base);await settle(page);assert.ok(await page.evaluate(()=>portfolioDiagnostics().roomCoverage.every(Boolean)));
   const roomUI=await page.evaluate(()=>{const b=document.querySelector('#enter').getBoundingClientRect(),h=document.querySelector('#room-hint').getBoundingClientRect();return {entryBottom:b.bottom,hintTop:h.top,entryLeft:b.left,entryRight:b.right,width:innerWidth}});
   assert.ok(roomUI.entryBottom<=roomUI.hintTop||height<550,`${width}×${height}: room entry and hint overlap`);
   await page.getByRole('button',{name:'Meet BMO'}).tap();await settle(page);
   const menu=await layout(page,`${engine} ${width}×${height} menu`);
   for(const name of ['My About','Projects','My Resume','Contact']){
    await page.getByRole('button',{name,exact:true}).tap();
    await layout(page,`${engine} ${width}×${height} ${name}`);
    const article=page.locator('.screen-content');assert.equal(await article.evaluate(el=>el.scrollTop),0);
    await page.getByRole('button',{name:'Down',exact:true}).tap();
    if(await article.evaluate(el=>el.scrollHeight>el.clientHeight))assert.ok(await article.evaluate(el=>el.scrollTop)>0,name+' scroll');
    await layout(page,`${engine} ${width}×${height} scrolled`);
    // Focused links must scroll the article alone, never a projected screen ancestor.
    await article.focus();for(let i=0;i<3;i++)await page.keyboard.press('Tab');
    await layout(page,`${engine} ${width}×${height} focus`);
    await page.getByRole('button',{name:'Back',exact:true}).tap();
   }
   for(const name of ['My LinkedIn','My GitHub']){await page.getByRole('button',{name,exact:true}).tap();await layout(page,`${engine} confirmation`);await page.getByRole('button',{name:'NO',exact:true}).tap()}
   if(width===428){
    await page.screenshot({path:`artifacts/mobile-${engine}-iphone13-menu.png`});
    await page.getByRole('button',{name:'My About',exact:true}).tap();
    await page.screenshot({path:`artifacts/mobile-${engine}-iphone13-about.png`});
    for(const size of [{width:926,height:428},{width:428,height:746},{width:428,height:926}]){await page.setViewportSize(size);await settle(page);await layout(page,`${engine} orientation/browser-bar ${size.width}×${size.height}`);assert.ok(await page.getByRole('article',{name:'My About'}).isVisible())}
    await page.getByRole('button',{name:'Back',exact:true}).tap();
    // Safe-area values emulate the space occupied by a notch and the home indicator.
    await page.addStyleTag({content:':root{--safe-top:47px;--safe-bottom:34px}'});
    await page.setViewportSize({width:428,height:925});await settle(page);await layout(page,`${engine} safe-area`);
    const bounds=await page.locator('#portfolio').boundingBox();assert.ok(bounds.y>=103&&bounds.y+bounds.height<=835);
   }
   report.devices.push({engine,width,height,alignment:menu.alignment,minMenuHeight:Math.min(...menu.menu.map(m=>m.height))});
   console.log(`Passed ${engine} ${width}×${height}`);await context.close();
  }
  // If WebGL is unavailable, all real content and links still fit a native-width view.
  const p=await browser.newPage({viewport:{width:320,height:568},hasTouch:true,isMobile:true});
  await p.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return /webgl/.test(kind)?null:get.call(this,kind,...args)}});
  await p.goto(base);await p.waitForSelector('body.fallback-mode',{state:'attached'});await p.getByRole('button',{name:'My About',exact:true}).tap();
  assert.ok(await p.getByRole('article',{name:'My About'}).isVisible());assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.ok(await p.locator('.screen-content').evaluate(el=>el.scrollWidth<=el.clientWidth+1));await p.close();
 }finally{await browser.close()}
}
assert.deepEqual(report.errors,[]);await writeFile('artifacts/mobile-audit.json',JSON.stringify(report,null,2));
console.log(`Passed ${report.devices.length} mobile layouts, every section, focus, scrolling, rotation, safe areas and WebGL fallback.`);
