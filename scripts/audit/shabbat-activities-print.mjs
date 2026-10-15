import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { SHABBAT_ACTIVITY_PATHS } from '../../src/data/shabbatActivities.js'
import { offlineSiteResponse } from './offline-site.mjs'

const out='out/shabbat-activities';mkdirSync(out,{recursive:true})
const browser=await chromium.launch({headless:true}),context=await browser.newContext({acceptDownloads:true,timezoneId:'Asia/Jerusalem'})
await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.fulfill(offlineSiteResponse(r.request().url())):r.abort())
await context.addInitScript(()=>{const original=URL.createObjectURL.bind(URL);URL.createObjectURL=b=>{if(b.type==='application/pdf')window.__qaPdf=b.arrayBuffer().then(x=>Array.from(new Uint8Array(x)));return original(b)}})
const page=await context.newPage(),errors=[],findings=[];page.on('pageerror',e=>errors.push(e.message))
for(const url of SHABBAT_ACTIVITY_PATHS){
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:5199'+url);await page.locator('h1').waitFor()
  if(url.endsWith('/table-quiz')){
   for(const age of ['גיל 4–6','גיל 7–9','גיל 10–12','כל המשפחה']){await page.getByRole('button',{name:age,exact:true}).click();if(await page.getByRole('button',{name:age,exact:true}).getAttribute('aria-pressed')!=='true')throw Error('Age control')}
  }
  await page.locator('[data-print-main]').click();await page.locator('.buga-preview-pages .buga-qr').first().waitFor()
  const sheets=await page.locator('.buga-preview-pages>.buga-a4').count()
  const geometry=await page.locator('.buga-preview-pages .print-art>svg').evaluateAll(svgs=>svgs.map(svg=>({outside:[...svg.querySelectorAll('text')].filter(t=>{const b=t.getBBox();return b.x<0||b.x+b.width>200||b.y<0||b.y+b.height>272}).map(t=>t.textContent)})))
  await page.locator('[data-print-count]').selectOption('2');const doubles=await page.locator('.buga-preview-pages>.buga-a4').count();await page.locator('[data-print-count]').selectOption('1')
  if(url.endsWith('/pack')&&width===1280){
   const download=page.waitForEvent('download');await page.locator('[data-save-pdf]').click();await download
   const bytes=Buffer.from(await page.evaluate(()=>window.__qaPdf));if(bytes.subarray(0,5).toString()!=='%PDF-')throw Error('Invalid PDF')
   writeFileSync(`${out}/shabbat-pack.pdf`,bytes)
   const pageCount=(bytes.toString('latin1').match(/\/Type \/Page\b/g)||[]).length
   if(pageCount!==5)throw Error(`PDF pages: ${pageCount}`)
   await page.screenshot({path:`${out}/pack-print-desktop.png`})
  }
  if(url.endsWith('/pack')&&width===390)await page.screenshot({path:`${out}/pack-print-mobile.png`})
  if(url.endsWith('/memory')&&width===1280)await page.locator('.buga-preview-pages>.buga-a4').screenshot({path:`${out}/memory-sheet.png`})
  if(url.endsWith('/whats-missing')&&width===1280)await page.locator('.buga-preview-pages>.buga-a4').first().screenshot({path:`${out}/missing-sheet.png`})
  findings.push({url,width,sheets,doubles,geometry});await page.getByRole('button',{name:'סגירת תצוגת ההדפסה'}).click()
 }
}
await page.goto('http://127.0.0.1:5199/shabbat-activities');await page.locator('h1').waitFor();await page.screenshot({path:`${out}/hub-mobile.png`,fullPage:true})
for(const url of ['/shabbat-times','/shabbat-times/jerusalem','/parasha']){await page.goto('http://127.0.0.1:5199'+url);await page.locator('h1').waitFor();if(!await page.locator('a[href="/shabbat-activities/pack"]').count())throw Error('Missing crosslink: '+url)}
await browser.close();writeFileSync(`${out}/print-check.json`,JSON.stringify({findings,errors},null,2))
const failed=findings.filter(f=>f.doubles!==f.sheets*2||f.geometry.some(g=>g.outside.length)||((f.url.endsWith('/pack')||f.url==='/shabbat-activities')&&f.sheets!==5))
console.log(JSON.stringify({checked:findings.length,pdfPages:5,errors,failed},null,2));if(failed.length||errors.length)process.exitCode=1
