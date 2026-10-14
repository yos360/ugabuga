// Setup: npm install --prefix out/audit/deps --no-save --package-lock=false pdf-lib
// Run after print.mjs with AUDIT_BASE and CHROME_PATH: node scripts/audit/pdf.mjs
// Downloads real UI-generated PDFs from 40 distinct, stratified printable pages.
import { chromium } from 'playwright'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
const { PDFDocument } = createRequire(import.meta.url)(resolve('out/audit/deps/node_modules/pdf-lib'))
const base=process.env.AUDIT_BASE||'http://127.0.0.1:5199'
const latest=new Map(readFileSync('out/audit/print.jsonl','utf8').trim().split('\n').map(JSON.parse).map(r=>[r.path,r]))
const groups=new Map()
for(const r of latest.values())if(r.opened&&r.geometry?.every(g=>g.fixed)){const key=r.path.split('/').slice(0,3).join('/');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r)}
const selected=[]
while(selected.length<40&&[...groups.values()].some(g=>g.length))for(const g of groups.values())if(g.length&&selected.length<40)selected.push(g.shift())
mkdirSync('out/audit/pdf',{recursive:true})
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined})
const context=await browser.newContext({viewport:{width:390,height:844}})
await context.route('**/*',r=>r.request().url().startsWith(base)&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
const page=await context.newPage();page.setDefaultTimeout(6000)
const results=[]
for(const row of selected){const result={path:row.path};try{
 await page.goto(base+row.path);await page.locator('h1').first().waitFor()
 const buttons=page.locator('button').filter({hasText:/הדפ[סי]|להדפיס|print|PDF/i})
 for(let i=0;i<Math.min(await buttons.count(),20);i++){if(!await buttons.nth(i).isVisible()||!await buttons.nth(i).isEnabled())continue;await buttons.nth(i).click();await page.waitForTimeout(180);if(await page.locator('dialog[open]').count())break}
 const copies=page.locator('dialog [data-print-count]');if(await copies.count())await copies.selectOption('1')
 result.expected=await page.locator('dialog .buga-preview-pages > .buga-a4').count()
 const download=page.waitForEvent('download',{timeout:90000});await page.locator('[data-save-pdf]').click();const file=await download
 result.file=`out/audit/pdf/${String(results.length+1).padStart(2,'0')}.pdf`;await file.saveAs(result.file)
 const doc=await PDFDocument.load(readFileSync(result.file));result.pages=doc.getPageCount();result.sizes=doc.getPages().map(p=>p.getSize());result.pass=result.pages===result.expected&&result.pages>0
 }catch(e){result.error=e.message;result.pass=false}
 results.push(result);writeFileSync('out/audit/pdf.json',JSON.stringify(results,null,2));console.log(`${results.length}/40 ${result.pass?'PASS':'FAIL'} ${row.path}`)
}
await browser.close()
