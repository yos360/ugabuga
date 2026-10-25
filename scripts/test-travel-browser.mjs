import assert from 'node:assert/strict'
import { preview } from 'vite'
import { chromium } from 'playwright'
const server=await preview({preview:{host:'127.0.0.1',port:4173,strictPort:true}})
const browser=await chromium.launch({headless:true,...(process.env.TRAVEL_CHROMIUM_PATH?{executablePath:process.env.TRAVEL_CHROMIUM_PATH,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote','--single-process']}: {})})
try {
 const context=await browser.newContext(),page=await context.newPage()
 await context.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4173'?route.continue():route.abort())
 const origin='http://127.0.0.1:4173'
 for(const width of [390,1280]) {
  await page.setViewportSize({width,height:900})
  for(const path of ['/','/travel','/family/car-games','/travel/offline','/travel/play']){
   await page.goto(origin+path);await page.waitForTimeout(500)
   await page.locator('h1').first().waitFor()
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' overflow '+width)
   assert.equal(await page.evaluate(()=>navigator.serviceWorker.getRegistrations().then(x=>x.length)),0,'SW before opt-in')
  }
 }
 await page.screenshot({path:'/tmp/ugabuga-travel-play.png',fullPage:true})
 await page.goto(origin+'/travel/offline')
 await page.getByRole('button',{name:'שמרו לטיסה',exact:true}).click()
 await page.getByText('✓ שמור לשימוש בלי אינטרנט',{exact:true}).waitFor({timeout:120000})
 const keys=await page.evaluate(async()=>{let a=[];for(const k of await caches.keys())for(const r of await(await caches.open(k)).keys())a.push(r.url);return a})
 assert.ok(!keys.some(k=>/supabase|analytics|\/admin|\/r\/|\/t\//.test(k)))
 console.log('Saved',keys.length,'requests')
 await context.setOffline(true)
 await page.reload()
 await page.getByText('אין אינטרנט — הנה מה ששמרתם',{exact:true}).waitFor()
 await page.getByRole('link',{name:'✈️ פותחים את מסך הטיסה',exact:true}).click()
 const actions=[['זיכרון','.mm-card'],['פאזל','.sl-tile'],['צביעה','.cbn-svg'],['מבוך','svg'],['סודוקו','.sd-cell']]
 for(const [name,selector] of actions){
  await page.getByRole('button',{name:new RegExp(name),exact:false}).first().click()
  await page.waitForTimeout(1800)
  assert.ok(await page.locator('.travel-game '+selector).count(),name+' board exists')
  if(name==='זיכרון') {await page.locator('.mm-card').first().click();assert.ok(await page.locator('.mm-card.is-open').count())}
  if(name==='פאזל') await page.locator('.sl-tile').first().click()
  if(name==='צביעה') {await page.locator('.cbn-svg rect').first().click();assert.ok(await page.locator('.cbn-svg rect').first().getAttribute('fill') !== '#fff')}
  if(name==='סודוקו') assert.equal(await page.locator('.sd-board').getAttribute('aria-label'),'סודוקו 4 על 4')
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'game overflow '+name)
  console.log('Offline game',name,selector,'opened')
  await page.getByRole('button',{name:'← בחירת פעילות אחרת',exact:true}).click()
 }
 await page.getByRole('button',{name:'🔒 מנעול ילדים',exact:true}).click()
 await page.getByRole('button',{name:'🔒 לחצו והחזיקו כדי לצאת',exact:true}).waitFor()
 const unlock=page.getByRole('button',{name:'🔒 לחצו והחזיקו כדי לצאת',exact:true});await unlock.dispatchEvent('pointerdown');await page.waitForTimeout(2400)
 await page.goto(origin+'/travel/offline')
 await page.getByRole('button',{name:'מחיקת התיק',exact:true}).click()
 await page.getByText('✓ שמור לשימוש בלי אינטרנט',{exact:true}).waitFor({state:'hidden'})
 console.log('Offline save, navigation, games, lock and deletion passed')
 await context.close()
} finally {await browser.close();await new Promise(resolve=>server.httpServer.close(resolve))}
