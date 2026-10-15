import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { offlineSiteResponse } from './offline-site.mjs'

// All records in this test are local fixtures. No invitations, analytics or answers reach production.
const out = 'out/rsvp-downloads'
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ headless: true })
const errors = [], checks = []
let available = true
const owner = '00000000-0000-4000-8000-000000000001'
const base = { kind:'kids',title:'יום ההולדת של נועה',date:'2026-11-20',time:'17:00–19:00',place:'פארק השכונה',deadline:'2026-11-18',note:'נפגשים לחגיגה!',invitees:['יואב','נועה','אורי'],yes_count:1 }
const responses = [{id:'one',name:'יואב',status:'yes',kids:2,adults:1,allergies:'בוטנים',pickup:'אמא',note:''}, {id:'two',name:'נועה',status:'maybe',kids:1,adults:1,allergies:'',pickup:'',note:''}]
const events = { legacy:{...base,code:'legacy'}, modern:{...base,code:'modern',ui_version:2,theme:'garden'} }
const answers = new Map(), calls = []
const context = await browser.newContext({ acceptDownloads:true,timezoneId:'Asia/Jerusalem' })
await context.addInitScript(() => {
  const original = URL.createObjectURL.bind(URL)
  URL.createObjectURL = blob => { window.__downloadBlob = blob.text(); return original(blob) }
})
await context.route('**/*', async route => {
  const url = new URL(route.request().url())
  if (url.hostname === '127.0.0.1') return route.fulfill(offlineSiteResponse(url.href))
  if (!url.pathname.includes('/rest/v1/rpc/')) return route.abort()
  const fn = url.pathname.split('/').at(-1), args = route.request().postDataJSON() || {}
  calls.push({fn,args})
  const reply = data => route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)})
  if (fn === 'public_download_counts') return reply({total:125,pages:{'/food/kids-recipes/pancakes':125}})
  if (fn === 'rsvp_experience_version') return available ? reply(2) : route.fulfill({status:404,contentType:'application/json',body:JSON.stringify({code:'PGRST202',message:'Could not find the function'})})
  if (fn === 'rsvp_create_v2' || fn === 'rsvp_create') {
    const ev = {...args.p,code:'created',...(fn.endsWith('v2') ? {ui_version:2} : {})}; events.created = ev; return reply(ev)
  }
  const ev = events[args.p_code]
  if (fn.startsWith('rsvp_host')) return reply({...ev,responses})
  if (fn.startsWith('rsvp_get')) return reply({...ev,mine:answers.get(args.p_code) || null})
  if (fn === 'rsvp_answer') { const saved = {...args.p,id:'answer'}; answers.set(args.p_code,saved); return reply(saved) }
  if (fn.startsWith('rsvp_update')) { Object.assign(ev,args.p); return reply(ev) }
  return reply(null)
})
const page = await context.newPage()
page.on('pageerror', e => errors.push(e.message))
const goto = async (path, width=1280) => { await page.setViewportSize({width,height:900}); await page.goto('http://127.0.0.1:5199'+path); await page.locator('h1').first().waitFor() }
const fits = async label => { assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, label); checks.push(label) }

await goto('/rsvp')
await page.getByRole('button',{name:'חגיגה בטבע'}).click()
await page.getByLabel('שם האירוע',{exact:true}).fill('יום ההולדת של נועה')
await page.getByLabel('מקום',{exact:true}).fill('פארק השכונה')
assert.ok(await page.locator('.rsvp-invitation').textContent().then(t=>t.includes('יום ההולדת של נועה')))
await page.screenshot({path:`${out}/create-desktop.png`,fullPage:true})
await fits('create desktop fits')
await page.setViewportSize({width:390,height:844}); await fits('create mobile fits')
await page.screenshot({path:`${out}/create-mobile.png`,fullPage:true})
await page.getByRole('button',{name:'✅ יצירת קישור לאישור הגעה'}).click()
await page.getByText('אנשים מגיעים',{exact:true}).waitFor()
assert.equal(events.created.theme,'garden'); assert.equal(events.created.ui_version,2)
checks.push('new event persists theme and selects v2 host')

await goto('/r/modern?guest=1',390)
await page.getByRole('heading',{name:'נשמח לראות אתכם!'}).waitFor()
await fits('new guest mobile fits')
await page.getByLabel('שם הילד/ה',{exact:true}).fill('אורי')
await page.getByRole('button',{name:'מגיעים',exact:true}).click()
await page.getByRole('button',{name:'שליחת אישור',exact:true}).click()
await page.getByRole('heading',{name:'איזה כיף, נתראה באירוע!'}).waitFor()
await page.reload();await page.getByRole('button',{name:'✏️ שינוי התשובה'}).click()
await page.getByRole('button',{name:'לא מגיעים',exact:true}).click()
await page.getByRole('button',{name:'עדכון התשובה',exact:true}).click()
await page.getByRole('heading',{name:'התשובה נשמרה, תודה שעדכנתם'}).waitFor()
checks.push('guest submits, reloads and changes answer')
assert.ok((await page.getByRole('link',{name:'📍 ניווט למקום'}).getAttribute('href')).startsWith('https://www.google.com/maps/'))
await page.getByRole('button',{name:'🗓️ הוספה ליומן'}).click()
await page.waitForFunction(()=>window.__downloadBlob)
assert.ok((await page.evaluate(()=>window.__downloadBlob)).includes('DTSTART;TZID=Asia/Jerusalem:20261120T170000'))
await page.screenshot({path:`${out}/guest-mobile.png`,fullPage:true})
checks.push('guest navigation and calendar')

await goto(`/r/modern#k=${owner}`)
await page.getByText('אנשים מגיעים',{exact:true}).waitFor()
assert.equal(await page.locator('.rsvp-invitation').count(),1)
await page.getByRole('button',{name:'אלרגיות ורגישויות',exact:true}).click()
await page.getByLabel('חיפוש לפי שם',{exact:true}).fill('יואב')
assert.ok((await page.getByText('מוצגות 1 מתוך 2 תשובות.',{exact:false}).textContent()).includes('מוצגות 1'))
await page.getByRole('button',{name:'⬇️ אקסל',exact:true}).click()
const csv = await page.evaluate(()=>window.__downloadBlob)
assert.ok(csv.includes('יואב')); assert.ok(!csv.includes('נועה'))
await page.getByRole('button',{name:'🖨️ הדפסה',exact:true}).click()
await page.locator('dialog[open]').waitFor()
assert.equal(await page.locator('.buga-preview-pages tbody tr').count(),1)
await page.getByRole('button',{name:'סגירת תצוגת ההדפסה'}).click()
await page.getByRole('button',{name:'✏️ עריכת פרטים',exact:true}).click()
await page.getByRole('button',{name:'כחול וחלומות'}).click()
await page.getByRole('button',{name:'שמירה',exact:true}).click()
await page.getByRole('button',{name:'✏️ עריכת פרטים',exact:true}).waitFor()
assert.equal(events.modern.theme,'sky')
await page.reload();await page.getByText('אנשים מגיעים',{exact:true}).waitFor()
await page.screenshot({path:`${out}/host-desktop.png`,fullPage:true})
await page.setViewportSize({width:390,height:844});await fits('new host mobile fits')
checks.push('host filters, filtered CSV/print, edits theme and reloads')

for (const host of [false,true]) {
  await goto(`/r/legacy${host ? '#k='+owner : '?guest=1'}`,390)
  await page.getByText(host ? 'סיכום' : 'אישור הגעה',{exact:true}).count() // event load is async
  await page.getByRole('heading',{name:base.title,exact:true}).waitFor()
  assert.equal(await page.locator('.rsvp-invitation').count(),0)
  assert.equal(await page.getByLabel('חיפוש לפי שם',{exact:true}).count(),0)
  await fits(`legacy ${host?'host':'guest'} unchanged layout fits`)
}
available = false
await goto('/rsvp')
await page.getByRole('heading',{name:'פרטי האירוע',exact:true}).waitFor()
assert.equal(await page.locator('.rsvp-theme-picker').count(),0)
checks.push('missing migration keeps legacy creation available')

await goto('/food/pancakes')
await page.locator('[data-download-count]').filter({hasText:'הורד כ־PDF 125 פעמים'}).waitFor()
assert.ok(await page.locator('[data-download-count]').filter({hasText:'מוכן להדפסה בחינם'}).count() >= 1)
await page.setViewportSize({width:390,height:844});await fits('recipe badges mobile fit')
await goto('/')
await page.locator('[data-download-count]').filter({hasText:'125 הורדות PDF מהאתר'}).waitFor()
checks.push('real totals and per-page threshold/fallback display')
assert.equal(calls.filter(c=>c.fn === 'record_pdf_download').length,0,'views, CSV, calendar and preview must not increment PDF counter')
assert.deepEqual(errors,[])
await browser.close()
writeFileSync(`${out}/report.json`,JSON.stringify({checks,errors,rpcCalls:calls.length},null,2))
console.log(JSON.stringify({checks,errors},null,2))
