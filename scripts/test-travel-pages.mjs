import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {preview} from 'vite'
import {chromium} from 'playwright'
const paths=[...readFileSync('src/App.jsx','utf8').matchAll(/path="(\/travel[^"*:]*?)"/g)].map(m=>m[1])
assert.equal(paths.length,19)
const server=await preview({preview:{host:'127.0.0.1',port:4173,strictPort:true}})
const browser=await chromium.launch({headless:true,executablePath:process.env.TRAVEL_CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']})
try{
 const ctx=await browser.newContext(),page=await ctx.newPage(),origin='http://127.0.0.1:4173',errors=[]
 await ctx.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort())
 page.on('pageerror',e=>errors.push(e.message))
 for(const width of [390,1280]){await page.setViewportSize({width,height:900});for(const path of paths){
  await page.goto(origin+path,{waitUntil:'domcontentloaded'});await page.locator('.travel h1').first().waitFor()
  await page.waitForFunction(p=>document.querySelector('link[rel=canonical]')?.href==='https://ugabuga.co.il'+p,path)
  assert.equal(await page.locator('.quick-answer').count(),1,path+' quick answer')
  assert.ok(await page.evaluate(()=>[...document.querySelectorAll('script[type="application/ld+json"]')].some(s=>{try{return JSON.stringify(JSON.parse(s.textContent)).includes('FAQPage')}catch{return false}})),path+' FAQ schema')
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' overflow '+width)
  await page.evaluate(()=>document.documentElement.dataset.theme='dark');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' dark overflow');await page.evaluate(()=>delete document.documentElement.dataset.theme)
  assert.equal(await page.evaluate(()=>navigator.serviceWorker.getRegistrations().then(r=>r.length)),0,path+' unrequested SW')
  if(path==='/travel'){await page.screenshot({path:`/tmp/buga-travel-home-${width}.png`,fullPage:true})}
 }
 console.log(width,'all',paths.length,'travel pages: SEO, FAQ, light/dark, no horizontal overflow, no implicit SW')
 }
 assert.deepEqual(errors,[])
 await ctx.close()
}finally{await browser.close();server.httpServer.closeAllConnections();server.httpServer.close()}
process.exit(0)
