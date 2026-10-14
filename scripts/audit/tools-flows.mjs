// Run with AUDIT_BASE/CHROME_PATH: node scripts/audit/tools-flows.mjs
// Local UI smoke actions complement the known-answer calculator tests. No server writes.
import {chromium} from 'playwright'
import {writeFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const base=process.env.AUDIT_BASE||'http://127.0.0.1:5199',results=[]
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined})
const page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(4000)
await page.route('**/*',r=>r.request().url().startsWith(base)&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{value:async()=>{}});Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{}}});window.open=()=>null})
let errors=[];page.on('pageerror',e=>errors.push(e.message))
const check=async(path,fn)=>{errors=[];const r={path};try{await page.goto(base+path);await page.locator('h1').first().waitFor();if(path==='/tools/spin-the-bottle'){for(let i=0;i<3;i++)await page.locator('main input').nth(i).fill(['אור','גל','טל'][i])}await fn();await page.waitForTimeout(200);assert.deepEqual(errors,[]);r.status='pass'}catch(e){r.status='fail';r.error=e.message}results.push(r);writeFileSync('out/audit/tools-flows.json',JSON.stringify(results,null,2));console.log(r)}
const button=pattern=>page.locator('main').first().getByRole('button',{name:pattern}).first().click()
for(const[path,pattern]of [
 ['/tools/crossword-maker',/חידה חדשה/],['/tools/experiment-maker','גשר מנייר'],['/tools/riddles',/היגיון/],['/tools/trivia-quiz',/קלאסי/],['/tools/truth-or-buga',/אמת/],['/tools/buga-town',/מתחילים|התחילו|יוצאים/],['/tools/bingo-maker',/צרו|הכינו/],['/tools/emoji-studio',/מתחילים לשחק/],['/tools/word-search-maker',/צרו תפזורת/],['/tools/eretz-ir',/מתחילים|התחילו|התחלה/],['/tools/scavenger-hunt-maker',/צרו רשימה/],['/tools/random-picker',/סובבו את הגלגל/],['/tools/countdown-timer','30 שניות'],['/tools/dice',/הטילו/],['/tools/coin-flip',/הטילו/],['/tools/spin-the-bottle',/סובבו/],['/tools/drawing-prompt',/מה אצייר/],['/tools/joke',/תנו לי בדיחה/],['/tools/random-number',/הגרילו/],['/music/tuner',/E2/],['/music/piano','דו (C4)'],['/music/read-notes',/רמה 2/],['/music/guitar-chords',/שמיעה/],['/music/concepts','דו (C3)'],['/music/styles','סול (G3)']])await check(path,()=>button(pattern))
await check('/tools/bring-list',async()=>{const input=page.getByLabel('פריט חדש');await input.fill('מפיות');await input.press('Enter');assert.ok((await page.getByLabel('פריט',{exact:true}).evaluateAll(es=>es.map(e=>e.value))).includes('מפיות'))})
await check('/tools/team-generator',async()=>{for(const n of ['אור','גל','טל','ים']){await page.getByPlaceholder('שם...').last().fill(n);await button(/הוסיפו שם/)}await button(/חלקו/);assert.ok((await page.locator('main').first().innerText()).includes('אור'))})
await check('/tools/scoreboard',async()=>{await page.getByPlaceholder('שם שחקן/קבוצה...').fill('אור');await button(/הוסיפו/);await button(/^\+1$|^\+$/);assert.ok((await page.locator('main').first().innerText()).includes('1'))})
await check('/tools/world-clock',async()=>{const c=page.locator('main input[type=checkbox]').first();const before=await c.isChecked();await c.setChecked(!before);assert.equal(await c.isChecked(),!before)})
await check('/tools/birthday-famous',async()=>{for(const d of ['2000-01-01','2000-04-15','2000-12-25']){await page.locator('main input[type=date]').fill(d);assert.ok((await page.locator('main').first().innerText()).length>500)}})
await check('/tools/hebrew-birthday',async()=>{for(const[d,expected]of [['2024-10-03','תשרי'],['2024-04-23','ניסן'],['2022-01-17','שבט']]){await page.locator('main input[type=date]').fill(d);await page.waitForTimeout(200);assert.ok((await page.locator('main').first().innerText()).includes(expected))}})
await browser.close()
