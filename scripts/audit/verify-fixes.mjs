// Run after serving the three fix branches: CHROME_PATH=... node scripts/audit/verify-fixes.mjs
// Defaults: accessibility :5204, game layout :5205, learning :5206 (override with *_BASE).
import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import {writeFileSync} from 'node:fs'
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined})
const page=await browser.newPage({viewport:{width:390,height:844}}),results=[]
await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
const a=process.env.ACCESSIBILITY_BASE||'http://127.0.0.1:5204',g=process.env.GAMES_BASE||'http://127.0.0.1:5205',l=process.env.LEARNING_BASE||'http://127.0.0.1:5206'
await page.goto(a+'/greeting');await page.locator('h1').waitFor();for(const name of ['שם החוגג/ת *','גיל *','מי מברך? (אופציונלי)','פרט אישי (אופציונלי)'])assert.equal(await page.getByLabel(name,{exact:true}).count(),1)
await page.goto(a+'/tools/truth-or-buga');await page.locator('h1').waitFor();assert.equal(await page.locator('main').count(),1);results.push('one main landmark on truth-or-buga');await page.goto(a+'/games');await page.getByRole('searchbox',{name:'חיפוש משחקים'}).waitFor();results.push('four greeting labels and shared games search accessible')
for(const width of [320,390,1280]){await page.setViewportSize({width,height:900});await page.goto(g+'/online-games/snake');const b=page.getByRole('button',{name:'שתפו את המשחק בוואטסאפ',exact:true});await b.waitFor();assert.ok(await b.evaluate(e=>e.scrollWidth<=e.clientWidth+2));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))}results.push('game landing share fits 320/390/1280px')
for(const width of [390,1280]){await page.setViewportSize({width,height:900});for(const suffix of ['','/100','/1000',...Array.from({length:12},(_,i)=>'/of/'+(i+1))]){await page.goto(l+'/learn/multiplication-table'+suffix);await page.locator('h1').waitFor();assert.ok(!(await page.locator('main').innerText()).includes('משהו השתבש'));assert.ok(await page.title());assert.equal(await page.locator('h1').count(),1)}}results.push('all 15 multiplication pages load at phone and desktop widths')
writeFileSync('out/audit/fix-verification.json',JSON.stringify(results,null,2));console.log(results);await browser.close()
