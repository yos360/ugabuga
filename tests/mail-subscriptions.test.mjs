import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeMail, csvCell } from '../src/utils/mailPreferences.js'
import { dueShabbat, weeklyWindow, onRequest } from '../functions/api/mail.js'
import { shabbatForDate } from '../src/utils/shabbatTimes.js'
import { shabbatCity } from '../src/data/shabbatCities.js'
import { WEEKLY_MAIL, MAIL_OFFERS } from '../src/data/weeklyMail.js'
import { readFileSync } from 'node:fs'

test('mail choices require explicit booleans; no automatic marketing consent', () => {
 const p = normalizeMail({ email:' PERSON@EXAMPLE.COM ', weekly:true, marketing:'true' })
 assert.equal(p.email,'person@example.com'); assert.equal(p.marketing,false); assert.equal(p.shabbat,false)
 assert.throws(() => normalizeMail({email:'x@example.com'}))
 assert.throws(() => normalizeMail({email:'x@example.com',shabbat:true,minutes:7}))
 assert.throws(() => normalizeMail({email:'x@example.com\r\nBcc:z@example.com',weekly:true}))
})
test('reminder follows city candles across winter, summer and clock-change weeks', () => {
 for (const date of ['2026-10-16','2026-10-23','2026-10-30','2027-03-26','2027-07-02']) for (const slug of ['jerusalem','tel-aviv']) for (const minutes of [30,60,120,180]) {
  const row=shabbatForDate(shabbatCity(slug),date), p={city:slug,minutes}
  const at=new Date(row.candles.getTime()-minutes*60000)
  assert.ok(dueShabbat(p,at)); assert.equal(dueShabbat(p,new Date(at-1)),null)
  assert.equal(dueShabbat(p,row.candles),null)
  assert.equal(dueShabbat(p,new Date(row.candles.getTime()+86400000)),null)
 }
})
test('weekly email window is Thursday morning Israel time, not browser/UTC time', () => {
 assert.equal(weeklyWindow(new Date('2026-10-15T07:00:00Z')),true)
 assert.equal(weeklyWindow(new Date('2026-10-15T06:59:00Z')),false)
 assert.equal(weeklyWindow(new Date('2026-10-15T11:00:00Z')),false)
 assert.equal(weeklyWindow(new Date('2026-10-16T07:00:00Z')),false)
 assert.equal(weeklyWindow(new Date('2026-10-29T08:00:00Z')),true)
})
test('unconfigured backend does not collect data or pretend registration succeeded', async () => {
 const response = await onRequest({env:{},request:new Request('https://ugabuga.co.il/api/mail',{method:'POST',body:JSON.stringify({action:'subscribe'})})})
 assert.equal(response.status,503); assert.equal((await response.json()).ready,false)
})
test('GET including mail scanner visit never changes subscription state', async () => {
 const response=await onRequest({env:{},request:new Request('https://ugabuga.co.il/api/mail?unsubscribe=token')})
 assert.equal(response.status,405)
})
test('CSV cells cannot become spreadsheet formulas', () => {
 assert.equal(csvCell('=HYPERLINK("evil")'),'"\'=HYPERLINK(""evil"")"')
 assert.equal(csvCell('a@example.com'),'"a@example.com"')
})
test('weekly issues have at most three reviewed site links and no active advertisements', () => {
 const sitemap=readFileSync(new URL('../public/sitemap-static.xml',import.meta.url),'utf8')
 for(const items of WEEKLY_MAIL) {assert.ok(items.length<=3);for(const x of items) assert.ok(sitemap.includes(`https://ugabuga.co.il${x.path}</loc>`),x.path)}
 assert.equal(MAIL_OFFERS.length,0)
})
