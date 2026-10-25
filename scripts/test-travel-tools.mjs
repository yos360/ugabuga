import assert from 'node:assert/strict'
import { preview } from 'vite'
import { chromium } from 'playwright'
const server=await preview({preview:{host:'127.0.0.1',port:4173,strictPort:true}})
const browser=await chromium.launch({headless:true,executablePath:process.env.TRAVEL_CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']})
try{
 const ctx=await browser.newContext(),page=await ctx.newPage(),origin='http://127.0.0.1:4173'
 await ctx.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort())
 for(const width of [390,1280]){await page.setViewportSize({width,height:900});for(const path of ['packing-list','waiting-games','countdown','play']){
 await page.goto(origin+'/travel/'+path,{waitUntil:'domcontentloaded'});await page.locator('.travel h1').first().waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' overflow')
 if(width===1280&&['packing-list','waiting-games'].includes(path)){await page.emulateMedia({media:'print'});await page.pdf({path:'/tmp/buga-travel-'+path+'.pdf',format:'A4',preferCSSPageSize:true});await page.emulateMedia({media:'screen'})}
 }}
 await page.goto(origin+'/travel/play',{waitUntil:'domcontentloaded'});await page.locator('[data-activity]').first().waitFor();assert.equal(await page.locator('[data-activity]').count(),6)
 await page.goto(origin+'/travel/packing-list',{waitUntil:'domcontentloaded'});await page.locator('.travel-checks input').first().check();await page.reload();assert.ok(await page.locator('.travel-checks input').first().isChecked())
 await page.locator('.travel-controls select').first().selectOption('baby');assert.ok(!(await page.locator('.travel-checks input').first().isChecked()));await page.locator('.travel-controls select').first().selectOption('toddler');assert.ok(await page.locator('.travel-checks input').first().isChecked())
 await page.goto(origin+'/travel/waiting-games',{waitUntil:'domcontentloaded'});await page.getByLabel('אופי המשחק').selectOption('quiet');assert.ok(await page.locator('.travel-grid .travel-card').count()>0)
 await page.goto(origin+'/travel/countdown',{waitUntil:'domcontentloaded'});await page.clock.install();await page.getByLabel('דקות',{exact:true}).fill('20');await page.getByRole('button',{name:'התחלת נסיעה',exact:true}).click();await page.clock.fastForward(600001);const milestone=await page.locator('.travel-card [role=status]').innerText();assert.match(milestone,/חצי דרך/);assert.match(milestone,/10 דקות/)
 await page.getByRole('button',{name:'השהיית הטיימר',exact:true}).click();const paused=await page.locator('.travel-time').innerText();await page.clock.fastForward(20000);assert.equal(await page.locator('.travel-time').innerText(),paused)
 console.log('Six play tiles, packing persistence, waiting filters, timer milestones and print views passed')
 await ctx.close()
}finally{await browser.close();server.httpServer.closeAllConnections();server.httpServer.close()}

process.exit(0)
