const {chromium}=require('C:/Users/pc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const assert=require('node:assert/strict')
;(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
 const errors=[]
 try{
 for(const width of [1536,390]){
 const page=await browser.newPage({viewport:{width,height:1024}})
 page.on('pageerror',e=>errors.push(e.message))
 await page.goto('http://127.0.0.1:5173');await page.evaluate(()=>document.fonts.ready)
 assert.equal(await page.locator('.home-door').count(),6)
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 await page.screenshot({path:`qa-home-${width}.png`,fullPage:true})
 const links=await page.locator('.home-door,.home-game,.home-extras>a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')))
 for(const link of links){await page.goto('http://127.0.0.1:5173'+link);await page.locator('h1').first().waitFor();assert.ok(!/404/.test(await page.locator('h1').first().innerText()),link)}
 await page.goto('http://127.0.0.1:5173/tools/buga-town');await page.getByRole('button',{name:'מתחילים לשחק'}).click()
 assert.equal(await page.locator('.town-tile').count(),24)
 await page.getByRole('button',{name:'זורקים קוביות'}).click()
 await page.waitForFunction(()=>!document.querySelector('.town-message').textContent.includes('מתקדמים עם'))
 const buy=page.getByRole('button',{name:/קונים ב־/});if(await buy.count())await buy.click()
 await page.getByRole('button',{name:'לתור הבא'}).click()
 assert.match(await page.locator('.town-center h2').innerText(),/שחקן 2/)
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 await page.screenshot({path:`qa-town-${width}.png`,fullPage:true});await page.close()
 console.log('PASS homepage links, layout and town turn:',width)
 }
 assert.deepEqual(errors,[]);console.log('PASS no browser runtime errors')
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
