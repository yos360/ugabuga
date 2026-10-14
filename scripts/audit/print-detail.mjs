// Run with AUDIT_BASE/CHROME_PATH: node scripts/audit/print-detail.mjs
// Targeted review of the logic-puzzle print overflow flagged by the full audit.
import {chromium} from 'playwright'
import {writeFileSync} from 'node:fs'
const base=process.env.AUDIT_BASE||'http://127.0.0.1:5199'
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined}),page=await browser.newPage({viewport:{width:390,height:844}})
await page.route('**/*',r=>r.request().url().startsWith(base)&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
await page.goto(base+'/logic-puzzles/print');await page.getByRole('button',{name:/הדפסת כל/}).click();await page.locator('dialog .buga-qr').first().waitFor()
const sheets=page.locator('dialog .buga-a4');await sheets.first().screenshot({path:'out/audit/logic-print.png'})
const geometry=await sheets.evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{client:e.clientHeight,scroll:e.scrollHeight,rect:{width:r.width,height:r.height},outside:[...e.querySelectorAll('*')].filter(x=>!x.closest('svg')).map(x=>({tag:x.tagName,class:x.className,text:x.textContent.slice(0,80),bottom:x.getBoundingClientRect().bottom-r.bottom})).filter(x=>x.bottom>1)}}))
writeFileSync('out/audit/logic-print-geometry.json',JSON.stringify(geometry,null,2));console.log(geometry)
const d=page.waitForEvent('download',{timeout:120000});await page.locator('[data-save-pdf]').click();await(await d).saveAs('out/audit/logic-puzzles.pdf');await browser.close()
