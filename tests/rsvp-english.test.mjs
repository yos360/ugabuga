// English RSVP (/en/rsvp, /en/rsvp/<type>, guest links /en/r/<code>): every text the shared tool
// shows exists in English, the event types mirror the Hebrew ones, and the English pages are
// registered, paired with their Hebrew pages and counted in the owner report.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { RSVP_UI, money, guessCurrency, enList, PAY_LINK, CURRENCIES } = await import('../src/utils/rsvpUi.js')
const { RSVP_PAGE_COPY } = await import('../src/utils/rsvpPageCopy.js')
const { RSVP_TYPES } = await import('../src/utils/rsvpTypes.js')
const { RSVP_TYPES_EN } = await import('../src/utils/rsvpTypesEn.js')
const { RSVP_STRINGS } = await import('../src/utils/rsvpI18n.js')
const { eventTimes, eventCalendar, responseCsv } = await import('../src/utils/rsvpExperience.js')
const { ENGLISH_PAGES, ENGLISH_SECTIONS } = await import('../src/en/englishRoutes.js')
const { hebrewCounterpart, englishCounterpart } = await import('../src/en/englishLinks.js')

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const rsvpSrc = read('src/pages/tools/group/Rsvp.jsx')
const experienceSrc = read('src/pages/tools/group/RsvpExperience.jsx')
const HEBREW = /[֐-׿]/
const SAMPLE = { title: 'Ava’s 7th birthday', date: '2026-11-14', time: '4:00–6:00 pm', place: 'Central Park', deadline: '2026-11-10', code: 'abc234' }
const sampleArgs = [3, 5, 2, 8]
// Every string a value can produce (functions are called with sample arguments).
function strings(v) {
  if (v == null) return []
  if (typeof v === 'string') return [v]
  if (Array.isArray(v)) return v.flatMap(strings)
  if (typeof v === 'function') {
    const out = []
    for (const args of [sampleArgs, ['Noah'], [SAMPLE, 'https://x.test/en/r/abc234'], [SAMPLE, ['Noah', 'Ava'], 'L'], [SAMPLE, [], 'L'], [true, { people: 4, yes: 2, kids: 1, adults: 3, maybe: 1, no: 0 }], [false, { people: 4, yes: 2, kids: 1, adults: 3, maybe: 1, no: 0 }, 2], ['2026-11-14'], [RSVP_TYPES_EN[0]], ['abc234']]) {
      try { out.push(...strings(v(...args))) } catch { /* not this signature */ }
    }
    return out
  }
  if (typeof v === 'object') return Object.values(v).flatMap(strings)
  return []
}
// Same shape: same keys at every level (null marks "not on this site").
function sameShape(a, b, path = '') {
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a)) return
  assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort(), `keys of ${path || 'root'}`)
  for (const k of Object.keys(a)) sameShape(a[k], b[k], `${path}.${k}`)
}

test('organizer and page text: Hebrew and English have the same keys, and English has no Hebrew', () => {
  sameShape(RSVP_UI.he, RSVP_UI.en)
  sameShape(RSVP_PAGE_COPY.he, RSVP_PAGE_COPY.en)
  const en = [...strings(RSVP_UI.en), ...strings(RSVP_PAGE_COPY.en), ...strings(RSVP_UI.en.error)]
  assert.ok(en.length > 150)
  for (const s of en) assert.doesNotMatch(s, HEBREW, s)
  for (const s of strings(RSVP_UI.en.error)) assert.ok(s.length > 10)
  assert.equal(RSVP_UI.en.base, '/en')
  assert.equal(RSVP_UI.he.base, '')
})

test('every text key the RSVP components use exists in both languages', () => {
  const used = new Set()
  for (const src of [rsvpSrc, experienceSrc]) for (const m of src.matchAll(/\bS\.(\w+)/g)) used.add(m[1])
  assert.ok(used.size > 80, `found ${used.size} keys`)
  for (const key of used) {
    assert.ok(key in RSVP_UI.en, `RSVP_UI.en.${key}`)
    assert.ok(key in RSVP_UI.he, `RSVP_UI.he.${key}`)
  }
  for (const m of rsvpSrc.matchAll(/\bP\.(\w+)/g)) {
    assert.ok(RSVP_PAGE_COPY.en[m[1]] !== undefined, `RSVP_PAGE_COPY.en.${m[1]}`)
    assert.ok(RSVP_PAGE_COPY.he[m[1]] !== undefined, `RSVP_PAGE_COPY.he.${m[1]}`)
  }
  // Guest-form keys: t(lang, 'key') and L('key') — every one has an English text.
  const guest = new Set(['yes', 'maybe', 'no'])
  for (const src of [rsvpSrc, experienceSrc]) for (const m of src.matchAll(/\b(?:t\(lang,|L\()([^)]*)\)/g)) for (const k of m[1].matchAll(/'(\w+)'/g)) guest.add(k[1])
  assert.ok(guest.size > 25)
  for (const key of guest) assert.ok(RSVP_STRINGS[key]?.en, `guest string ${key}`)
  // Nested lookups.
  for (const k of ['kids', 'general']) assert.ok(RSVP_UI.en.kinds[k])
  for (const k of ['yes', 'maybe', 'no']) assert.ok(RSVP_UI.en.status[k] && RSVP_UI.en.guestDone[k])
  for (const k of ['all', 'yes', 'maybe', 'no', 'allergies']) assert.ok(RSVP_UI.en.filters[k])
  for (const k of ['party', 'garden', 'sky', 'elegant']) assert.ok(RSVP_UI.en.themes[k])
  assert.equal(RSVP_UI.en.csvHeaders.length, RSVP_UI.he.csvHeaders.length)
})

test('Hebrew output is unchanged by the shared strings', () => {
  const he = RSVP_UI.he
  assert.equal(he.people(2, 1), '2 ילדים + מבוגר אחד')
  assert.equal(money('he', 1500), '1,500 ₪')
  assert.equal(he.paidMain(2, 3, money('he', 100)), '💳 שילמו 2 מתוך 3 · נאסף 100 ₪')
  assert.equal(he.paidPer(money('he', 50)), '(לפי 50 ₪ לכל תשובה)')
  assert.match(he.inviteText({ title: 'מסיבה', date: '2026-11-14', time: '17:00' }, 'L'), /יום שבת 14\.11/)
  assert.ok(responseCsv([], {}).includes('מי אוסף'))
})

test('English texts: invitation, reminder, people, money', () => {
  const en = RSVP_UI.en
  const invite = en.inviteText(SAMPLE, 'https://ugabuga.co.il/en/r/abc234')
  assert.match(invite, /Saturday 14 November at 4:00–6:00 pm/)
  assert.match(invite, /Please RSVP by Tuesday 10 November/)
  assert.ok(invite.endsWith('https://ugabuga.co.il/en/r/abc234\nMade free with UgaBuga 🎂'))
  assert.ok(en.reminderText(SAMPLE, [], 'L').endsWith('L\nMade free with UgaBuga 🎂'))
  assert.match(en.reminderText(SAMPLE, ['Noah', 'Ava', 'Liam'], 'L'), /Noah, Ava and Liam/)
  assert.match(en.reminderText({ title: 'x' }, [], 'L'), /now’s the time/)
  assert.equal(en.people(1, 2), '1 child + 2 adults')
  assert.equal(en.people(0, 1), '1 adult')
  assert.equal(enList(['A']), 'A')
  assert.equal(money('en', 50, 'USD'), '$50')
  assert.equal(money('en', 12.5, 'GBP'), '£12.50')
  assert.equal(money('en', 40), '₪40')
  assert.equal(guessCurrency('en-GB'), 'GBP')
  assert.equal(guessCurrency('en-US'), 'USD')
  assert.equal(guessCurrency('he-IL'), 'ILS')
  assert.equal(guessCurrency('de-DE'), 'EUR')
  assert.ok(CURRENCIES.includes('ILS'))
  assert.ok(responseCsv([{ name: 'Ava', status: 'yes', kids: 1, adults: 0 }], { yes: { label: 'Coming' } }, en.csvHeaders).includes('"Name","Reply"'))
  assert.ok(PAY_LINK.test('https://paypal.me/someone') && PAY_LINK.test('https://account.venmo.com/u/x') && PAY_LINK.test('https://revolut.me/x') && !PAY_LINK.test('https://example.com/x') && !PAY_LINK.test('https://venmo.com.evil.io/x'))
})

test('calendar: 12-hour times, and floating local time on the English site', () => {
  assert.deepEqual(eventTimes('17:00–19:00'), [['17', '00'], ['19', '00']])
  assert.deepEqual(eventTimes('4:00–6:00 pm'), [['16', '00'], ['18', '00']])
  assert.deepEqual(eventTimes('11:00–1:00 pm'), [['11', '00'], ['13', '00']])
  assert.deepEqual(eventTimes('7 P.M.'), [['19', '00']])
  assert.deepEqual(eventTimes('בשעה 5'), [])
  const ics = eventCalendar({ code: 'x', title: 'Party', date: '2026-11-14', time: '4:00–6:00 pm' }, new Date('2026-10-01T00:00:00Z'), { tz: null })
  assert.ok(ics.includes('DTSTART:20261114T160000') && ics.includes('DTEND:20261114T180000') && !ics.includes('TZID'))
  assert.ok(eventCalendar({ code: 'x', date: '2026-11-14', time: '17:00' }).includes('DTSTART;TZID=Asia/Jerusalem:20261114T170000'))
})

test('English event types mirror the Hebrew ones and are registered, paired and in the sitemap', () => {
  const sitemap = read('public/sitemap-static.xml')
  assert.deepEqual(RSVP_TYPES_EN.map(t => t.slug), RSVP_TYPES.map(t => t.slug))
  const titles = new Set()
  for (const [i, x] of RSVP_TYPES_EN.entries()) {
    const he = RSVP_TYPES[i]
    assert.equal(x.kind, he.kind, x.slug); assert.equal(x.theme, he.theme, x.slug); assert.equal(Boolean(x.vaad), Boolean(he.vaad), x.slug)
    assert.ok(x.title.includes('___'), x.slug)
    assert.ok(x.intro.length > 100 && x.tips.length === 3 && x.faq.length === 3, x.slug)
    assert.ok(x.desc.length <= 160 && x.desc.length > 80, `${x.slug} description: ${x.desc.length}`)
    assert.ok(x.seo && !titles.has(x.seo), x.slug); titles.add(x.seo)
    for (const s of strings(x)) assert.doesNotMatch(s, HEBREW, `${x.slug}: ${s}`)
    const path = `/en/rsvp/${x.slug}`
    assert.ok(sitemap.includes(`https://ugabuga.co.il${path}</loc>`), path)
    assert.ok(ENGLISH_PAGES.some(p => p.path === path && p.counterpart === `/rsvp/${x.slug}` && p.title === x.seo), path)
    assert.equal(hebrewCounterpart(path), `/rsvp/${x.slug}`)
    assert.equal(englishCounterpart(`/rsvp/${x.slug}`), path)
  }
  assert.ok(sitemap.includes('https://ugabuga.co.il/en/rsvp</loc>'))
  assert.equal(hebrewCounterpart('/en/rsvp'), '/rsvp')
  assert.ok(ENGLISH_SECTIONS.some(s => s.path === '/en/rsvp'))
  // Guest links are private: never listed, prerendered or paired.
  assert.doesNotMatch(sitemap, /\/en\/r\//)
  assert.ok(!ENGLISH_PAGES.some(p => p.path.startsWith('/en/r/')))
})

test('routes: English RSVP pages come before the /en/* catch-all, and the English cards link only to English pages', () => {
  const app = read('src/App.jsx')
  const catchAll = app.indexOf('path="/en/*"')
  for (const path of ['/en/rsvp', '/en/rsvp/:type', '/en/r/:code']) {
    const at = app.indexOf(`path="${path}"`)
    assert.ok(at > 0 && at < catchAll, path)
  }
  const invite = read('src/components/ui/SiteInvite.jsx')
  const en = invite.slice(invite.indexOf('const HOOKS_EN'), invite.indexOf('export default function SiteInvite'))
  const links = [...en.matchAll(/\['(\/[^']*)'/g)].map(m => m[1])
  assert.ok(links.length >= 8)
  for (const to of links) {
    assert.ok(to.startsWith('/en'), to)
    assert.ok(app.includes(`path="${to}"`), `route for ${to}`)
  }
  const hooks = en.slice(0, en.indexOf('const CONTEXTS_EN'))
  assert.deepEqual([...hooks.matchAll(/\['(\/[^']*)'/g)].map(m => m[1]), ['/en/games/memory', '/en/birthday'])
})

test('owner report counts English guest links like Hebrew ones', () => {
  const sql = read('supabase/migrations/202610240004_rsvp_english.sql')
  for (const fn of ['rsvp_clean_extras', 'owner_rsvp_funnel', 'owner_created_things']) assert.match(sql, new RegExp(`create or replace function public\\.${fn}\\(`))
  assert.ok(sql.includes("path like '/en/r/%'") && sql.includes("'/en/r/' || e.code"))
  assert.ok(sql.includes("'/en/birthday'") && sql.includes("'/en/games/memory'"))
  assert.doesNotMatch(sql, /create table|alter table|drop /i)
  assert.doesNotMatch(sql.replace(/^--.*$/gm, ''), /host_token/)
  assert.match(sql, /'yos300@gmail\.com'/)
  const report = read('src/pages/OwnerActivityReport.jsx')
  const re = new RegExp(/const rsvpCode = path => \/(.*)\/i\.exec/.exec(report)[1], 'i')
  assert.equal(re.exec('/en/r/abc234')?.[1], 'abc234')
  assert.equal(re.exec('/r/abc234')?.[1], 'abc234')
  assert.equal(re.exec('/en/rsvp'), null)
  // English pages log opens the same way the Hebrew layout does (paths only).
  const layout = read('src/en/EnglishLayout.jsx')
  assert.match(layout, /logEvent\('open',pathname\)/)
  assert.match(layout, /__PRERENDER__/)
})
