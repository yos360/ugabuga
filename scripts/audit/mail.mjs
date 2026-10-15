// UI/API-contract fixture; does not claim live email or database verification.
import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {offlineSiteResponse} from './offline-site.mjs'
const browser=await chromium.launch({headless:true}),context=await browser.newContext(),calls=[],errors=[]
let ready=true
await mkdir('out/mail',{recursive:true})
await context.route('**/*',async route=>{
 const req=route.request(),u=new URL(req.url())
 if(u.pathname==='/api/mail'){
  const d=req.postDataJSON();calls.push(d)
  const body=d.action==='health'?{ready}:d.action==='get'?{email:'test@example.com',shabbat:true,weekly:false,marketing:false,city:'jerusalem',minutes:120}:d.action==='confirm'?{token:'b'.repeat(64)}:{ok:true}
  return route.fulfill({contentType:'application/json',body:JSON.stringify(body)})
 }
 if(u.origin==='https://audit.local')return route.fulfill(offlineSiteResponse(req.url()))
 return route.abort()
})
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:900});await page.goto('https://audit.local/');await page.locator('.site-brand-slogan').waitFor()
 await page.screenshot({path:`out/mail/header-${width}.png`})
 const brand=await page.locator('.site-brand').boundingBox(),slogan=await page.locator('.site-brand-slogan').boundingBox()
 assert.ok(slogan.x>=brand.x && slogan.x+slogan.width<=brand.x+brand.width+1)
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`)
}
await page.setViewportSize({width:390,height:900})
await page.getByRole('button',{name:'מה אפשר לקבל במייל?'}).click()
assert.equal(await page.getByRole('checkbox').count(),2)
assert.equal(await page.getByRole('checkbox',{name:/תזכורת/}).count(),0)
await page.getByRole('textbox',{name:'כתובת המייל שלכם'}).fill('test@example.com')
await page.getByRole('checkbox',{name:'אני רוצה לקבל תוכן שבועי מעוגה בוגה'}).check()
await page.getByRole('button',{name:'שלחו לי קישור לאישור'}).click()
await page.getByText('אם ניתן לשלוח לכתובת הזו',{exact:false}).waitFor()
assert.equal(calls.find(c=>c.action==='subscribe').preferences.marketing,false)
assert.equal(calls.find(c=>c.action==='subscribe').preferences.shabbat,false)
await page.goto('https://audit.local/shabbat-times/jerusalem')
await page.locator('.mail-signup').waitFor()
assert.equal(await page.locator('.mail-signup').count(),1)
await page.getByRole('button',{name:'מה אפשר לקבל במייל?'}).click()
await page.getByRole('checkbox',{name:'תזכורת כניסת שבת לפי העיר שלי'}).check()
await page.getByLabel('מתי להזכיר לי?').selectOption('180')
await page.getByRole('textbox',{name:'כתובת המייל שלכם'}).fill('test@example.com')
await page.locator('.mail-signup').screenshot({path:'out/mail/shabbat-mobile.png'})
await page.getByRole('button',{name:'שלחו לי קישור לאישור'}).click()
await page.getByText('אם ניתן לשלוח לכתובת הזו',{exact:false}).waitFor()
assert.equal(calls.filter(c=>c.action==='subscribe').at(-1).preferences.minutes,180)
await page.goto('https://audit.local/mail-preferences#confirm='+ 'a'.repeat(64))
await page.getByRole('button',{name:'אישור הרשמה',exact:true}).click()
await page.getByRole('button',{name:'הסרה מכל המיילים'}).click()
await page.getByText('הוסרתם מכל המיילים.',{exact:false}).waitFor()
const update=calls.find(c=>c.action==='update');assert.deepEqual([update.preferences.shabbat,update.preferences.weekly,update.preferences.marketing],[false,false,false])
assert.equal(new URL(page.url()).hash,'')
assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'noindex, nofollow')
ready=false;await page.goto('https://audit.local/holidays');await page.getByRole('button',{name:'מה אפשר לקבל במייל?'}).click()
await page.getByText('ההרשמה עדיין בהכנה.',{exact:false}).waitFor()
assert.ok(await page.getByRole('button',{name:'שלחו לי קישור לאישור'}).isDisabled())
assert.deepEqual(errors,[])
await writeFile('out/mail/verified.json',JSON.stringify({scope:'browser with API fixture, not live mail/database',widths:[1440,390,320],cases:['general footer excludes Shabbat','three independent opt-ins','custom reminder','confirmation','unsubscribe','fragment removal','backend unavailable'],errors},null,2))
await browser.close();console.log('Mail UI audit passed')
