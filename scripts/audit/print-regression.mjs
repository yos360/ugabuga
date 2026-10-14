// Run against the print fix build: AUDIT_BASE=http://127.0.0.1:5207 CHROME_PATH=... node scripts/audit/print-regression.mjs
// Every difficulty at phone/desktop: content must stay above the QR strip on every sheet.
import {chromium} from 'playwright'
import {writeFileSync} from 'node:fs'
const base=process.env.AUDIT_BASE||'http://127.0.0.1:5199',results=[]
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined}),page=await browser.newPage()
await page.route('**/*',r=>r.request().url().startsWith(base)&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
for(const width of [390,1280])for(let level=0;level<4;level++){
 await page.setViewportSize({width,height:900});await page.goto(base+'/logic-puzzles/print');await page.locator('nav[aria-label="רמת קושי"] button').nth(level).click();await page.getByRole('button',{name:/הדפסת כל/}).click();await page.locator('dialog .buga-qr').first().waitFor()
 const sheets=await page.locator('dialog .buga-a4').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect(),qr=e.querySelector('.buga-qr').getBoundingClientRect();const bad=[...e.querySelectorAll('.lp-sheet p,.lp-sheet table,.lp-sheet h3,.lp-sheet ol')].filter(x=>x.getBoundingClientRect().bottom>qr.top-1).map(x=>({tag:x.tagName,class:x.className,text:x.textContent.slice(0,80),bottom:x.getBoundingClientRect().bottom-r.top,qrTop:qr.top-r.top}));return{bad,scroll:e.scrollHeight,client:e.clientHeight}}))
 const r={width,level,sheets:sheets.length,bad:sheets.flatMap(s=>s.bad),pass:sheets.every(s=>!s.bad.length&&s.scroll<=s.client+2)};results.push(r);console.log(r);writeFileSync('out/audit/print-regression.json',JSON.stringify(results,null,2))
 if(width===390&&level===1){await page.locator('dialog .buga-a4').nth(4).screenshot({path:'out/audit/logic-print-fixed.png'});const download=page.waitForEvent('download',{timeout:120000});await page.locator('[data-save-pdf]').click();await(await download).saveAs('out/audit/logic-puzzles-fixed.pdf')}
}
await browser.close()
