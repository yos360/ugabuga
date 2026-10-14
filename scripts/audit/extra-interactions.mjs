// Setup: npm install --prefix out/audit/deps --no-save --package-lock=false jsqr
// Run with AUDIT_BASE/CHROME_PATH: node scripts/audit/extra-interactions.mjs
// Decodes browser-rendered pixels in Node; no real clipboard/share/server writes.
import {chromium} from 'playwright'
import {createRequire} from 'node:module'
import {resolve} from 'node:path'
import {writeFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const jsQR=createRequire(import.meta.url)(resolve('out/audit/deps/node_modules/jsqr'))
const base=process.env.AUDIT_BASE||'http://127.0.0.1:5199',results=[]
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined})
const context=await browser.newContext({viewport:{width:390,height:844}})
await context.route('**/*',r=>r.request().url().startsWith(base)&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
await context.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async t=>{window.__copied=t}}});Object.defineProperty(navigator,'share',{value:async d=>{window.__shared=d}});window.open=(...args)=>{window.__opened=args;return null}})
const page=await context.newPage();page.setDefaultTimeout(5000)
const go=async p=>{await page.goto(base+p);await page.locator('h1').first().waitFor()}
const check=async(name,fn)=>{try{await fn();results.push({name,status:'pass'})}catch(e){results.push({name,status:'fail',error:e.message})}writeFileSync('out/audit/extra-interactions.json',JSON.stringify(results,null,2));console.log(results.at(-1))}
await check('QR: decode link, Hebrew text and phone with jsQR in Node',async()=>{
 await go('/tools/qr-code')
 for(const[type,label,value,expected]of [['link','כתובת קישור','https://ugabuga.co.il/emoji','https://ugabuga.co.il/emoji'],['text','הטקסט שלכם','שלום עולם','שלום עולם'],['phone','מספר טלפון','+972501234567','tel:+972501234567']]){
  await page.getByLabel('סוג הקוד',{exact:true}).selectOption(type);await page.getByLabel(label,{exact:true}).fill(value)
  const img=page.getByAltText('תצוגה מקדימה של קוד QR');await img.waitFor();await page.waitForTimeout(350)
  const pixels=await img.evaluate(async i=>{await i.decode();const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(i,0,0);return{width:c.width,height:c.height,data:Array.from(ctx.getImageData(0,0,c.width,c.height).data)}})
  assert.equal(jsQR(Uint8ClampedArray.from(pixels.data),pixels.width,pixels.height)?.data,expected)
 }
 await page.getByRole('button',{name:/הדפסה|PDF/}).first().click();await page.locator('dialog[open]').waitFor()
})
for(const[path,start,count]of [['/signs/game','מתחילים לשחק',10],['/signs/theory','מתחילים — 8 שאלות',8]])await check(path+' full round with result and explanations',async()=>{await go(path);await page.getByRole('button',{name:start,exact:true}).click();for(let i=0;i<count;i++){await page.locator('.signs-answers button').first().click();await page.getByRole('button',{name:i===count-1?'לציון ולהסברים':'השאלה הבאה',exact:true}).click()}await page.getByText('סיימתם לתרגל!',{exact:true}).waitFor();assert.equal(await page.locator('.signs-review li').count(),count)})
await check('search: three queries return internal links',async()=>{for(const q of ['מבוך','בינגו','אותיות']){await go('/search');await page.getByLabel('חיפוש בכל האתר').fill(q);await page.getByRole('button',{name:'חיפוש',exact:true}).click();await page.waitForTimeout(700);assert.ok(await page.locator('main a[href^="/"]').count()>3)}})
await check('emoji situation: copy a combination',async()=>{await go('/emoji/for/birthday');await page.locator('.emoji-copy-list button').first().click();assert.ok(await page.evaluate(()=>window.__copied))})
await check('share: game invokes mocked share/open',async()=>{await go('/online-games/snake');await page.getByRole('button',{name:'שתפו את המשחק בוואטסאפ',exact:true}).click();assert.ok(await page.evaluate(()=>window.__shared||window.__opened||window.__copied))})
await check('Shabbat city monthly preview and copies',async()=>{await go('/shabbat-times/jerusalem');const b=page.getByRole('button',{name:/הדפס|PDF/});await b.first().click();await page.locator('dialog[open]').waitFor();const n=await page.locator('dialog .buga-a4').count();await page.locator('dialog [data-print-count]').selectOption('2');assert.equal(await page.locator('dialog .buga-a4').count(),2*n)})
await browser.close()
