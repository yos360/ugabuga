import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ALL_EXPANDED_RECIPES } from '../../src/data/recipesExpanded.js'
import { offlineSiteResponse } from './offline-site.mjs'
const out='out/recipes';mkdirSync(out,{recursive:true})
const browser=await chromium.launch({headless:true,downloadsPath:resolve(out)})
const context=await browser.newContext({acceptDownloads:true,timezoneId:'Asia/Jerusalem'})
await context.addInitScript(() => {
 const original=URL.createObjectURL.bind(URL)
 URL.createObjectURL=blob=>{if(blob.type==='application/pdf')window.__qaPdf=blob.arrayBuffer().then(b=>Array.from(new Uint8Array(b)));return original(blob)}
})
await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.fulfill(offlineSiteResponse(route.request().url())):route.abort())
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message))
const findings=[]
const pdfSlugs=new Set(['pancakes','chocolate-cupcakes','vanilla-cupcakes-parve','classic-challah','ganache'])
for(const recipe of ALL_EXPANDED_RECIPES){
 await page.setViewportSize({width:1280,height:900});await page.goto('http://127.0.0.1:5199'+recipe.path)
 await page.locator('h1').first().waitFor();await page.locator('button').filter({hasText:'הדפסת המתכון'}).click()
 await page.locator('.buga-preview-pages .buga-qr').waitFor()
 const overflow=()=>page.locator('.buga-preview-pages .recipe-print-card').evaluateAll(cards=>cards.map(c=>({scroll:c.scrollHeight,height:c.clientHeight,over:c.scrollHeight>c.clientHeight+2})))
 const full=await overflow()
 await page.locator('[data-print-count]').selectOption('2')
 const copies=await page.locator('.buga-preview-pages>.buga-a4').count()
 await page.locator('[data-print-count]').selectOption('1')
 if(pdfSlugs.has(recipe.slug)){
  const download=page.waitForEvent('download');await page.locator('[data-save-pdf]').click();const event=await download
  const bytes=Buffer.from(await page.evaluate(()=>window.__qaPdf));if(bytes.subarray(0,5).toString()!=='%PDF-')throw Error('Invalid PDF')
  writeFileSync(`${out}/${recipe.slug}.pdf`,bytes)
  console.log(`${recipe.slug}: PDF generated, download requested (${event.suggestedFilename()}); captured exact blob bytes for restricted runner`)
 }
 if(recipe.slug==='chocolate-cupcakes')await page.screenshot({path:`${out}/recipe-print-desktop.png`})
 await page.getByRole('button',{name:'סגירת תצוגת ההדפסה'}).click()
 await page.getByLabel('גודל כרטיס להדפסה').selectOption('half')
 await page.setViewportSize({width:390,height:844})
 await page.locator('button').filter({hasText:'הדפסת המתכון'}).click();await page.locator('.buga-preview-pages .buga-qr').waitFor()
 const half=await overflow()
 if(recipe.slug==='chocolate-cupcakes')await page.screenshot({path:`${out}/recipe-print-mobile.png`})
 await page.emulateMedia({media:'print'})
 const printed=await page.locator('#buga-print-output .recipe-print-card').evaluateAll(cards=>cards.map(c=>({scroll:c.scrollHeight,height:c.clientHeight,over:c.scrollHeight>c.clientHeight+2})))
 await page.emulateMedia({media:'screen'})
 findings.push({slug:recipe.slug,full,half,printed,copies})
 await page.getByRole('button',{name:'סגירת תצוגת ההדפסה'}).click()
}
await page.goto('http://127.0.0.1:5199/recipes/shabbat');await page.locator('h1').first().waitFor();await page.screenshot({path:`${out}/hub-mobile.png`,fullPage:true})
await browser.close();writeFileSync(`${out}/print-check.json`,JSON.stringify({findings,errors},null,2))
const failed=findings.filter(f=>f.copies!==2||[...f.full,...f.half,...f.printed].some(c=>c.over))
console.log(JSON.stringify({checked:findings.length,pdfDownloads:5,errors,failed},null,2));if(failed.length||errors.length)process.exitCode=1
