// Run with AUDIT_BASE/CHROME_PATH: node scripts/audit/misc.mjs
// Marathon transitions use the application's existing debug fixture; individual game results are separate.
import {chromium} from 'playwright'
import {writeFileSync,appendFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const base=process.env.AUDIT_BASE||'http://127.0.0.1:5199',results=[]
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined})
const page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(6000)
await page.route('**/*',r=>r.request().url().startsWith(base)&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
const check=async(name,fn)=>{try{await fn();results.push({name,status:'pass'})}catch(e){results.push({name,status:'fail',error:e.message})}writeFileSync('out/audit/misc.json',JSON.stringify(results,null,2));console.log(results.at(-1))}
await check('classroom quiz: local sample, preview, answers and copies',async()=>{await page.goto(base+'/classroom/quiz');await page.getByRole('button',{name:/מלאו מבחן לדוגמה/}).click();await page.getByRole('button',{name:/רק להדפסה/}).click();await page.locator('dialog[open]').waitFor();const n=await page.locator('dialog .buga-a4,dialog .buga-flow').count();assert.ok(n>=2);await page.locator('[data-print-count]').selectOption('2');assert.equal(await page.locator('dialog .buga-a4,dialog .buga-flow').count(),2*n);appendFileSync('out/audit/print.jsonl',JSON.stringify({path:'/classroom/quiz',opened:true,sheetCount:n,copies:{before:n,after:2*n},note:'configured with built-in sample; validated independently'})+'\n')})
await check('daily challenge: start',async()=>{await page.goto(base+'/online-games/today');await page.locator('.arc-play-btn').click();await page.locator('.arc-body .arc-game').waitFor()})
await check('marathon: eight stage transitions and final card (existing test fixture)',async()=>{await page.addInitScript(()=>localStorage.setItem('buga-debug','1'));await page.goto(base+'/online-games/marathon');await page.getByRole('button',{name:'▶ מתחילים מרתון',exact:true}).click();for(let i=0;i<8;i++){await page.getByRole('button',{name:'▶ יאללה!',exact:true}).click();await page.waitForFunction(()=>typeof window.__marathonFinish==='function');await page.evaluate(()=>window.__marathonFinish(true));if(i<7)await page.getByRole('button',{name:'▶ לשלב הבא',exact:true}).click()}await page.getByText('🏁 סיימתם את המרתון!',{exact:true}).waitFor();assert.equal(await page.locator('.mr-list li').count(),8)})
await browser.close()
