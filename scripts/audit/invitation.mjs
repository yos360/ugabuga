import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {offlineSiteResponse} from './offline-site.mjs'
const browser=await chromium.launch({headless:true,downloadsPath:process.cwd()+'/out/invitation'}),context=await browser.newContext({acceptDownloads:true}),errors=[]
await mkdir('out/invitation',{recursive:true})
await context.route('**/*',route=>route.request().url().startsWith('blob:')?route.continue():new URL(route.request().url()).origin==='https://audit.local'?route.fulfill(offlineSiteResponse(route.request().url())):route.abort())
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
await page.setViewportSize({width:1440,height:1000});await page.goto('https://audit.local/invitation')
await page.getByLabel('שם החוגג/ת',{exact:true}).fill('נועה')
await page.getByLabel('גיל',{exact:true}).fill('7')
await page.getByLabel('תאריך',{exact:true}).fill('יום שישי, 14 בנובמבר')
await page.getByLabel('שעה',{exact:true}).fill('17:00–19:00')
await page.getByLabel('מקום וכתובת',{exact:true}).fill('פארק החבלים, רחוב הרצל 12')
await page.getByLabel('טלפון לאישור הגעה',{exact:true}).fill('050-0000000')
await page.getByLabel('משהו נוסף לאורחים').fill('בואו עם חיוך והמון מצב רוח!')
const ready=()=>page.waitForFunction(()=>!document.querySelector('.inv-primary')?.disabled)
await ready();await page.screenshot({path:'out/invitation/desktop.png',fullPage:true})
for(const name of ['מסיבת בלונים','הרפתקה בחלל','ספארי דינוזאורים','נשף קסום','כרטיס למשחק','מסיבת גיימינג']){
 await page.locator('.inv-themes button').filter({hasText:name}).click();await ready()
 const id=await page.locator('.inv-themes button[aria-pressed=true] .inv-theme-art').getAttribute('class')
 await page.locator('.inv-canvas-wrap').screenshot({path:`out/invitation/${id.split('inv-thumb-')[1]}.png`})
 assert.equal(await page.getByLabel('שם החוגג/ת',{exact:true}).inputValue(),'נועה')
}
const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=450;c.height=800;const g=c.getContext('2d');g.fillStyle='#70bad0';g.fillRect(0,0,450,800);g.fillStyle='#ffe0bc';g.beginPath();g.arc(225,260,125,0,Math.PI*2);g.fill();g.fillStyle='#263047';g.fillRect(100,410,250,390);return c.toDataURL().split(',')[1]})
await page.locator('input[type=file]').setInputFiles({name:'portrait.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')})
await page.getByLabel('הגדלת התמונה').fill('1.5');await ready()
await page.locator('.inv-canvas-wrap').screenshot({path:'out/invitation/photo.png'})
// Inspect the actual download payload; this runner cancels native browser file writes.
await page.evaluate(()=>{HTMLAnchorElement.prototype.click=function(){if(this.download){window.__downloadName=this.download;window.__downloadBytes=fetch(this.href).then(r=>r.arrayBuffer()).then(b=>Array.from(new Uint8Array(b)))}}})
await page.locator('.inv-export-actions button').nth(1).click()
const bytes=Buffer.from(await page.evaluate(()=>window.__downloadBytes))
assert.equal(await page.evaluate(()=>window.__downloadName),'ugabuga-invitation-gaming.png')
await writeFile('out/invitation/invitation-export.png',bytes)
assert.equal(bytes.readUInt32BE(16),1080);assert.equal(bytes.readUInt32BE(20),1350)
await page.getByRole('button',{name:'סטטוס / סטורי · 9:16'}).click();await ready();assert.deepEqual(await page.locator('canvas[role=img]').evaluate(c=>[c.width,c.height]),[1080,1920])
await page.getByRole('button',{name:'הדפסה / שמירה כ־PDF',exact:true}).click();await page.locator('.inv-print-page img').first().waitFor();assert.ok((await page.locator('.inv-print-page img').first().getAttribute('src')).startsWith('data:image/png'))
await page.keyboard.press('Escape')
await page.goto('https://audit.local/invitation');await ready()
await page.locator('input[type=file]').setInputFiles({name:'bad.heic',mimeType:'image/heic',buffer:Buffer.from('invalid')});await page.getByRole('alert').filter({hasText:'HEIC'}).waitFor()
for(const width of [390,320]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('.inv-controls').screenshot({path:`out/invitation/form-${width}.png`})}
assert.deepEqual(errors,[]);await writeFile('out/invitation/verified.json',JSON.stringify({themes:6,widths:[1440,390,320],export:[1080,1350],story:[1080,1920],photoCrop:true,pdfPreview:true,errors},null,2));await browser.close();console.log('Invitation UI and export checks passed')
