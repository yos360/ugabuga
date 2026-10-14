// Requires temporary pdf-lib as in pdf.mjs. Run with AUDIT_BASE/CHROME_PATH: node scripts/audit/native-print.mjs
// Exercises legacy window.print pages, then captures Chromium's A4 print output.
import {chromium} from 'playwright'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {createRequire} from 'node:module'
import {resolve} from 'node:path'
const {PDFDocument}=createRequire(import.meta.url)(resolve('out/audit/deps/node_modules/pdf-lib'))
const rows=[...new Map(readFileSync('out/audit/print.jsonl','utf8').trim().split('\n').map(JSON.parse).map(r=>[r.path,r])).values()].filter(r=>r.nativePrint)
const base=process.env.AUDIT_BASE||'http://127.0.0.1:5199',results=[]
mkdirSync('out/audit/native-pdf',{recursive:true})
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined})
const page=await browser.newPage({viewport:{width:1280,height:900}});page.setDefaultTimeout(5000)
await page.route('**/*',r=>r.request().url().startsWith(base)&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
await page.addInitScript(()=>{window.print=()=>{window.__printed=true;window.dispatchEvent(new Event('beforeprint'))}})
for(const row of rows){const r={path:row.path};try{await page.emulateMedia({media:'screen'});await page.goto(base+row.path);await page.locator('h1').first().waitFor();await page.locator('main').first().getByRole('button',{name:/הדפ[סי]|print|PDF/i}).first().click();await page.waitForFunction(()=>window.__printed,{},{timeout:3000});r.called=await page.evaluate(()=>!!window.__printed);await page.emulateMedia({media:'print'});const bytes=await page.pdf({format:'A4',printBackground:true,path:`out/audit/native-pdf/${results.length+1}.pdf`});const pdf=await PDFDocument.load(bytes);r.pages=pdf.getPageCount();r.pass=r.called&&r.pages>0}catch(e){r.pass=false;r.error=e.message}results.push(r);writeFileSync('out/audit/native-print.json',JSON.stringify(results,null,2));console.log(r)}
await browser.close()
