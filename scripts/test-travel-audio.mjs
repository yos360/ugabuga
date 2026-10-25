import assert from 'node:assert/strict'
import { preview } from 'vite'
import { chromium } from 'playwright'
const server=await preview({preview:{host:'127.0.0.1',port:4173,strictPort:true}})
const browser=await chromium.launch({headless:true,executablePath:process.env.TRAVEL_CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']})
try{
 const ctx=await browser.newContext(),page=await ctx.newPage(),origin='http://127.0.0.1:4173'
 await ctx.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort())
 await ctx.addInitScript(()=>{window.__played=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__played.push(this.src);window.__travelAudio=this;return play.call(this)}})
 for(const width of [390,1280]){await page.setViewportSize({width,height:900});for(const path of ['talk-games','listen','stories']){
 await page.goto(origin+'/travel/'+path,{waitUntil:'domcontentloaded'});await page.locator('.travel h1').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path+' overflow')
 }}
 await page.goto(origin+'/travel/talk-games',{waitUntil:'domcontentloaded'})
 await page.getByLabel('במה משחקים?').selectOption('story');await page.getByRole('button',{name:'כרטיס הבא',exact:true}).click();assert.match(await page.locator('.travel-prompt').innerText(),/2 מתוך 30/)
 await page.emulateMedia({media:'print'});await page.pdf({path:'/tmp/buga-travel-talk.pdf',format:'A4',preferCSSPageSize:true});await page.emulateMedia({media:'screen'})
 await page.goto(origin+'/travel/listen',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'גילוי התשובה',exact:true}).click();assert.ok(await page.locator('.travel-prompt [role="status"]').first().innerText())
 await page.goto(origin+'/travel/stories',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'לשמור לנסיעה',exact:true}).first().click()
 await page.goto(origin+'/travel/offline',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'שמרו לטיסה',exact:true}).click();await page.getByText('✓ שמור לשימוש בלי אינטרנט',{exact:true}).waitFor({timeout:120000})
 const audio=await page.evaluate(async()=>{const r=await(await caches.open('buga-travel-state')).match('/travel-cache-state');const s=await r.json();return s.paths.filter(p=>p.endsWith('.mp3'))});assert.ok(audio.length>0)
 await ctx.setOffline(true);await page.reload();await page.getByRole('link',{name:'להאזנה ברדיו בוגה',exact:true}).click()
 await page.getByRole('button',{name:'השמעה',exact:true}).click();await page.waitForTimeout(3500)
 assert.ok(await page.evaluate(()=>window.__played.length>0&&window.__travelAudio.currentTime>0),'recorded story actually plays offline')
 assert.ok(await page.evaluate(()=>window.__played.length>=2),'continuous title to paragraph playback')
 await page.getByRole('button',{name:'השהיה',exact:true}).click();assert.ok(await page.evaluate(()=>window.__travelAudio.paused))
 await page.getByRole('button',{name:'מסך כהה',exact:true}).click();assert.ok(await page.locator('.travel-radio.night').count())
 console.log('Audio games, 30 story starts, print cards, saved recordings and offline playback passed; audio files:',audio.length)
 await ctx.close()
}finally{await browser.close();server.httpServer.closeAllConnections();await new Promise(r=>server.httpServer.close(r))}
