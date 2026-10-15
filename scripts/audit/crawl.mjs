// Run: AUDIT_BASE=http://127.0.0.1:5199 CHROME_PATH=/path/to/chrome node scripts/audit/crawl.mjs
// Resume-safe, read-only, four tabs; blocks external traffic (including analytics/writes).
// Output: out/audit/pages.jsonl. AUDIT_LIMIT limits a smoke run; AUDIT_FILTER selects paths.
import { chromium } from 'playwright'
import { readFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import { offlineSiteResponse } from './offline-site.mjs'
const base=process.env.AUDIT_BASE||'http://127.0.0.1:5199'
const output=process.env.AUDIT_OUTPUT||'out/audit/pages.jsonl'
mkdirSync('out/audit',{recursive:true})
const paths=[...readFileSync('public/sitemap.xml','utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname)
const stable=p=>createHash('sha256').update(p).digest('hex')
const sorted=[...new Set(paths)].sort((a,b)=>stable(a).localeCompare(stable(b)))
const sections=new Map();for(const p of sorted){const s=p.split('/').filter(Boolean)[0]||'home';if(!sections.has(s))sections.set(s,p)}
const a11y=new Set([...new Set([...sections.values(),...sorted])].slice(0,100)),textSample=new Set(sorted.slice(0,60))
const done=new Set(existsSync(output)?readFileSync(output,'utf8').trim().split('\n').filter(Boolean).map(l=>{const r=JSON.parse(l);return r.path+'|'+r.viewport}):[])
let jobs=paths.flatMap(path=>['phone','desktop'].map(viewport=>({path,viewport}))).filter(j=>!done.has(j.path+'|'+j.viewport))
if(process.env.AUDIT_FILTER)jobs=jobs.filter(j=>new RegExp(process.env.AUDIT_FILTER).test(j.path))
if(process.env.AUDIT_LIMIT)jobs=jobs.slice(0,+process.env.AUDIT_LIMIT)
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined,args:['--disable-dev-shm-usage']})
const sizes={phone:{width:390,height:844},desktop:{width:1280,height:900}}
const gzipCache=new Map()
let cursor=0,finished=0
await Promise.all(Array.from({length:Math.min(4,jobs.length)},async()=>{
 const context=await browser.newContext({timezoneId:'Asia/Jerusalem',reducedMotion:'reduce'})
 let external=new Set(),ownFailures=[],errors=[],js=new Set()
 await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==new URL(base).origin){external.add(u.hostname);return r.abort()}if(!['GET','HEAD'].includes(r.request().method()))return r.abort();return process.env.AUDIT_OFFLINE_DIR?r.fulfill(offlineSiteResponse(r.request().url(),process.env.AUDIT_OFFLINE_DIR)):r.continue()})
 const page=await context.newPage()
 page.on('pageerror',e=>errors.push(e.message))
 page.on('response',r=>{if(r.url().startsWith(base)){if(r.status()>=400)ownFailures.push({url:r.url().replace(base,''),status:r.status()});if(r.request().resourceType()==='script')js.add(new URL(r.url()).pathname)}})
 while(cursor<jobs.length){const job=jobs[cursor++];external=new Set();ownFailures=[];errors=[];js=new Set();let data={}
  try{
   await page.setViewportSize(sizes[job.viewport])
   await page.goto(base+job.path,{waitUntil:'domcontentloaded',timeout:20000})
   await page.waitForFunction(()=>document.querySelector('h1')||/הדף לא נמצא|Page not found|משהו השתבש/.test(document.body.innerText),{},{timeout:5000}).catch(()=>{})
   await page.waitForTimeout(180)
   await page.evaluate(()=>document.querySelectorAll('img[loading=lazy]').forEach(i=>{i.loading='eager'}))
   await page.waitForFunction(()=>[...document.images].every(i=>i.complete),{},{timeout:1800}).catch(()=>{})
   data=await page.evaluate(({sample,readText})=>{
    const visible=e=>!!(e.getClientRects().length)&&getComputedStyle(e).visibility!=='hidden'
    const label=e=>e.getAttribute('aria-label')||(e.getAttribute('aria-labelledby')||'').split(' ').map(id=>document.getElementById(id)?.textContent||'').join(' ').trim()||[...(e.labels||[])].map(l=>l.textContent).join(' ').trim()||e.getAttribute('title')||e.textContent.trim()||e.querySelector('img')?.alt||e.querySelector('svg title')?.textContent||''
    const identify=e=>({tag:e.tagName,id:e.id,class:e.className?.baseVal??e.className,text:e.textContent?.trim().slice(0,100),aria:e.getAttribute('aria-label')})
    const over=[]
    for(const e of document.querySelectorAll('main h1,main h2,main h3,main p,main label,main button,main a,main td,main th')){
     if(!visible(e)||e.closest('svg,[aria-hidden=true],.sr-only'))continue
     const cs=getComputedStyle(e)
     if(e.clientWidth>0&&e.scrollWidth>e.clientWidth+3&&!['auto','scroll'].includes(cs.overflowX)&&cs.textOverflow!=='ellipsis')over.push(identify(e))
    }
    const jsonLd=[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>{try{JSON.parse(s.textContent);return null}catch(e){return e.message}}).filter(Boolean)
    return {h1:[...document.querySelectorAll('h1')].map(e=>e.textContent.trim()),title:document.title,description:document.querySelector('meta[name=description]')?.content,canonical:document.querySelector('link[rel=canonical]')?.href,lang:document.documentElement.lang,dir:document.documentElement.dir,robots:document.querySelector('meta[name=robots]')?.content,
     notFound:/הדף לא נמצא|Page not found/i.test(document.querySelector('main')?.innerText||''),boundary:/משהו השתבש|Something went wrong/i.test(document.querySelector('main')?.innerText||''),scroll:document.documentElement.scrollWidth,innerWidth,overflow:over.slice(0,50),
     brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth&&i.currentSrc).map(i=>({src:i.currentSrc,alt:i.alt})),pendingImages:[...document.images].filter(i=>!i.complete).map(i=>i.src),links:[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')))],jsonLd,
     printButtons:[...document.querySelectorAll('button')].filter(e=>visible(e)&&(/הדפ[סי]|להדפיס|print|PDF/i.test(label(e))||e.hasAttribute('data-print-main'))).map(identify),
     accessibility:sample?{unnamed:[...document.querySelectorAll('a,button')].filter(e=>visible(e)&&!label(e)).map(identify),imagesNoAlt:[...document.images].filter(i=>!i.hasAttribute('alt')).map(i=>i.src),unlabelled:[...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(e=>visible(e)&&!label(e)&&!['button','submit','reset'].includes(e.type)).map(identify)}:undefined,
     textSample:readText?{headings:[...document.querySelectorAll('main h1,main h2,main h3')].map(e=>e.textContent),text:(document.querySelector('main')?.innerText||'')}:undefined}
   },{sample:job.viewport==='phone'&&a11y.has(job.path),readText:job.viewport==='phone'&&textSample.has(job.path)})
  }catch(e){data.auditError=e.message}
  let jsGzip=0;for(const path of js){try{if(!gzipCache.has(path))gzipCache.set(path,gzipSync(readFileSync('dist'+path)).length);jsGzip+=gzipCache.get(path)}catch{}}
  appendFileSync(output,JSON.stringify({...job,...data,errors:[...new Set(errors)],ownFailures,external:[...external],js:[...js],jsGzip})+'\n')
  if(++finished%50===0)console.log(`${finished}/${jobs.length}: ${job.path}`)
 }
 await context.close()
}))
await browser.close()
console.log(`Completed ${finished} page/viewports; total previously completed ${done.size}`)
