// Run after/during crawl: AUDIT_BASE=http://127.0.0.1:5199 CHROME_PATH=/path/to/chrome node scripts/audit/print.mjs
// Resume-safe. Opens one preview per page with a visible print button; checks copies and geometry.
// This does not assert visual correctness; suspicious pages are reviewed separately.
import{chromium}from'playwright'
import{readFileSync,existsSync,appendFileSync,mkdirSync}from'node:fs'
import { offlineSiteResponse } from './offline-site.mjs'
const base=process.env.AUDIT_BASE||'http://127.0.0.1:5199',out=process.env.AUDIT_PRINT_OUTPUT||'out/audit/print.jsonl'
mkdirSync('out/audit',{recursive:true})
const rows=readFileSync(process.env.AUDIT_PAGES||'out/audit/pages.jsonl','utf8').trim().split('\n').map(JSON.parse).filter(r=>r.viewport==='phone'&&r.printButtons?.length)
const done=new Set(existsSync(out)?readFileSync(out,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).filter(r=>!process.env.AUDIT_RETRY||r.opened||r.nativePrint).map(r=>r.path):[])
const jobs=rows.filter((r,i)=>i>=Number(process.env.AUDIT_SKIP_ROWS||0)&&i<Number(process.env.AUDIT_MAX_ROWS||Infinity)&&(!process.env.AUDIT_PART||i%3===Number(process.env.AUDIT_PART)-1)&&!done.has(r.path))
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined})
const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Asia/Jerusalem'})
await context.route('**/*',r=>r.request().url().startsWith(base)&&['GET','HEAD'].includes(r.request().method())?(process.env.AUDIT_OFFLINE_DIR?r.fulfill(offlineSiteResponse(r.request().url(),process.env.AUDIT_OFFLINE_DIR)):r.continue()):r.abort())
await context.addInitScript(()=>{window.print=()=>{window.__auditNativePrint=true}})
const page=await context.newPage();page.setDefaultTimeout(4000)
let n=0
for(const row of jobs){const result={path:row.path};try{
 await page.goto(base+row.path,{waitUntil:'domcontentloaded'})
 await page.locator('h1').first().waitFor()
 if(row.path==='/secret-friend')await page.locator('main textarea').first().fill('אור\nגל\nטל\nים')
 if(row.path==='/tools/qr-code')await page.getByAltText('תצוגה מקדימה של קוד QR').waitFor()
 await page.evaluate(()=>document.querySelectorAll('button').forEach(e=>{if(e.hasAttribute('data-print-main')||/הדפ[סי]|להדפיס|print|PDF/i.test([e.textContent,e.getAttribute('aria-label'),e.title].join(' ')))e.setAttribute('data-audit-print','true')}))
 const buttons=page.locator('button[data-audit-print]')
 let open=false
 for(let i=0;i<Math.min(await buttons.count(),20);i++){
  const b=buttons.nth(i);if(!await b.isVisible()||!await b.isEnabled())continue
  await b.click();await page.waitForTimeout(180)
  if(await page.locator('.mt-printmenu .ln-btn').first().isVisible().catch(()=>false)){await page.locator('.mt-printmenu .ln-btn').first().click();await page.waitForTimeout(180)}
  if(await page.locator('dialog[open] .buga-preview-pages').count()){open=true;break}
  if(await page.evaluate(()=>window.__auditNativePrint)){result.nativePrint=true;break}
 }
 result.opened=open
 if(open){
  await page.locator('dialog .buga-qr').first().waitFor({timeout:2500}).catch(()=>{})
  result.geometry=await page.locator('dialog .buga-preview-pages').evaluate(root=>[...root.querySelectorAll(':scope > .buga-a4,:scope > .buga-flow')].map(s=>{
   const r=s.getBoundingClientRect(),fixed=s.classList.contains('buga-a4');const outside=[]
   for(const e of s.querySelectorAll('p,h1,h2,h3,img,svg,table,li,input')){if(e.closest('svg')&&e.tagName.toLowerCase()!=='svg')continue;const q=e.getBoundingClientRect();if(q.width&&q.height&&(q.left<r.left-2||q.right>r.right+2||q.top<r.top-2||(fixed&&q.bottom>r.bottom+2)))outside.push({tag:e.tagName,text:e.textContent?.slice(0,70),src:e.getAttribute('src')})}
   return{fixed,width:r.width,height:r.height,ratio:r.width/r.height,outside,overflowX:s.scrollWidth>s.clientWidth+2,overflowY:fixed&&s.scrollHeight>s.clientHeight+2}
  }))
  result.sheetCount=result.geometry.length
  const select=page.locator('dialog [data-print-count]')
  if(await select.count()){
   await select.selectOption('2');await page.waitForTimeout(100)
   result.copies={before:result.sheetCount,after:await page.locator('dialog .buga-preview-pages > .buga-a4,dialog .buga-preview-pages > .buga-flow').count()}
  }else result.copies='not offered'
 }
}catch(e){result.error=e.message}
 appendFileSync(out,JSON.stringify(result)+'\n');if(++n%25===0)console.log(`${n}/${jobs.length}: ${row.path}`)
}
await browser.close();console.log(`Checked ${n} new print previews`)
