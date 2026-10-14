// Diagnostic UI inventory: AUDIT_BASE=... CHROME_PATH=... node scripts/audit/explore.mjs
import {chromium} from 'playwright'
import {readFileSync,writeFileSync} from 'node:fs'
const base=process.env.AUDIT_BASE||'http://127.0.0.1:5199'
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined})
const context=await browser.newContext({viewport:{width:390,height:844}})
await context.route('**/*',r=>r.request().url().startsWith(base)&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
const page=await context.newPage();page.setDefaultTimeout(5000)
let logs=[];page.on('console',m=>{if(m.type()==='error')logs.push(m.text())});page.on('pageerror',e=>logs.push(e.message))
const paths=readFileSync('out/audit/pages.jsonl','utf8').trim().split('\n').map(JSON.parse).filter(r=>r.viewport==='phone'&&/^\/(tools|music)\/[^/]+$/.test(r.path)).map(r=>r.path)
const results=[]
for(const path of paths){logs=[];const r={path};try{await page.goto(base+path);await page.locator('h1').first().waitFor();if(path.startsWith('/online-games/')){await page.getByRole('button',{name:/שחקו עכשיו/}).click();await page.locator('.arc-body').waitFor();await page.waitForTimeout(300)}r.ui=await page.locator(path.startsWith('/online-games/')?'.arc-body':'main').evaluate(el=>({text:el.innerText.slice(-12000),buttons:[...el.querySelectorAll('button')].filter(e=>e.getClientRects().length).map(e=>({text:e.innerText,aria:e.getAttribute('aria-label'),class:e.className})),inputs:[...el.querySelectorAll('input,select')].map(e=>({tag:e.tagName,placeholder:e.placeholder,aria:e.getAttribute('aria-label')}))}));}catch(e){r.error=e.message}r.errors=logs;results.push(r);writeFileSync('out/audit/tools-explore.json',JSON.stringify(results,null,2));console.log(path)}
await browser.close()
