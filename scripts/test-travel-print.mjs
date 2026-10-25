import assert from 'node:assert/strict'
import { preview } from 'vite'
import { chromium } from 'playwright'
const server=await preview({preview:{host:'127.0.0.1',port:4173,strictPort:true}})
const browser=await chromium.launch({headless:true,executablePath:process.env.TRAVEL_CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']})
try{
 const ctx=await browser.newContext({acceptDownloads:true}),page=await ctx.newPage()
 await ctx.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4173'?route.continue():route.abort())
 for(const width of [390,1280]){
 await page.setViewportSize({width,height:900})
 for(const type of ['kit','bingo','passport','journal','surprise-bags']){
 await page.goto('http://127.0.0.1:4173/travel/'+type,{waitUntil:'domcontentloaded'})
 await page.locator('.travel h1').waitFor()
 if(type==='kit')await page.getByRole('button',{name:'יצירת ערכה',exact:true}).click()
 await page.locator('.travel-preview .travel-paper').first().waitFor()
 await page.waitForTimeout(500)
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),type+' overflow '+width)
 const count=await page.locator('.travel-preview .travel-paper').count()
 console.log(width,type,'sheets',count)
 if(width===1280){await page.emulateMedia({media:'print'});await page.pdf({path:'/tmp/buga-travel-'+type+'.pdf',format:'A4',printBackground:true,preferCSSPageSize:true});await page.emulateMedia({media:'screen'})}
 }
 }
 await page.goto('http://127.0.0.1:4173/travel/kit',{waitUntil:'domcontentloaded'})
 await page.getByRole('button',{name:'יצירת ערכה',exact:true}).click()
 const dl=page.waitForEvent('download',{timeout:120000})
 await page.getByRole('button',{name:'הורדת PDF',exact:true}).click()
 await(await dl).saveAs('/tmp/buga-travel-kit-export.pdf')
 await page.goto('http://127.0.0.1:4173/travel/offline',{waitUntil:'domcontentloaded'})
 await page.getByRole('link',{name:'פתיחת הערכה בלי אינטרנט'}).waitFor()
 await page.getByRole('button',{name:'שמרו לטיסה',exact:true}).click()
 await page.getByText('✓ שמור לשימוש בלי אינטרנט',{exact:true}).waitFor({timeout:120000})
 await ctx.setOffline(true);await page.reload()
 const local=page.waitForEvent('download');await page.getByRole('link',{name:'פתיחת הערכה בלי אינטרנט'}).click();await(await local).saveAs('/tmp/buga-travel-kit-offline.pdf')
 console.log('Actual kit PDF downloaded and reopened from local storage offline')
 await ctx.close()
}finally{await browser.close();server.httpServer.closeAllConnections();await new Promise(r=>server.httpServer.close(r))}
