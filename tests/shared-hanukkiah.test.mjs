import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { FIRST_NIGHT_DATE, NIGHT_START_HOUR, nightAt, hanukkahPhase, nightDate, nightDateLabel, nightName, shabbatNote, candleSlots, candlesLabel, validateCandle, validateTitle, shareText, waLink } from '../src/utils/sharedHanukkiah.js'
import { HANUKKAH } from '../src/data/hanukkah.js'
import { SITE_TAG } from '../src/utils/groupTools.js'

// Israel is UTC+2 in December.
const il = (date, hhmm) => Date.parse(`${date}T${hhmm}:00+02:00`)

test('night 1 is the evening of Friday 4.12.2026, from the site Hanukkah data', () => {
  assert.equal(FIRST_NIGHT_DATE, '2026-12-04')
  assert.equal(HANUKKAH.firstCandle.slice(0, 10), FIRST_NIGHT_DATE)
  assert.equal(nightDate(1), '2026-12-04')
  assert.equal(nightDate(8), '2026-12-11')
})

test('a night runs from 14:00 Israel time to 14:00 the next day', () => {
  assert.equal(NIGHT_START_HOUR, 14)
  assert.equal(nightAt(il('2026-12-04', '13:59')), 0)
  assert.equal(nightAt(il('2026-12-04', '14:00')), 1)
  assert.equal(nightAt(il('2026-12-04', '15:54')), 1) // Friday candles in Jerusalem
  assert.equal(nightAt(il('2026-12-05', '01:30')), 1)
  assert.equal(nightAt(il('2026-12-05', '13:59')), 1)
  assert.equal(nightAt(il('2026-12-05', '17:30')), 2) // after Shabbat
  assert.equal(nightAt(il('2026-12-11', '20:00')), 8)
  assert.equal(nightAt(il('2026-12-12', '13:59')), 8)
  assert.equal(nightAt(il('2026-12-12', '14:00')), 9)
  // Works from a UTC clock too: 22:30 UTC on 4.12 is 00:30 on 5.12 in Israel — still night 1.
  assert.equal(nightAt(Date.parse('2026-12-04T22:30:00Z')), 1)
})

test('phases: before (with a day count), during, after', () => {
  assert.deepEqual(hanukkahPhase(il('2026-11-15', '10:00')), { phase: 'before', night: null, days: 19 })
  assert.equal(hanukkahPhase(il('2026-12-03', '20:00')).days, 1)
  assert.equal(hanukkahPhase(il('2026-12-04', '09:00')).days, 0)
  assert.deepEqual(hanukkahPhase(il('2026-12-07', '19:00')), { phase: 'during', night: 4, days: 0 })
  assert.equal(hanukkahPhase(il('2026-12-12', '15:00')).phase, 'after')
})

test('Friday and Saturday nights get a respectful note, weekdays none', () => {
  assert.match(shabbatNote(1), /לפני הדלקת נרות השבת/)
  assert.match(shabbatNote(2), /אחרי צאת השבת/)
  assert.match(shabbatNote(8), /ערב שבת/)
  for (const n of [3, 4, 5, 6, 7]) assert.equal(shabbatNote(n), '')
  assert.equal(shabbatNote(0), '')
  assert.equal(nightDateLabel(1), 'יום שישי 4.12')
  assert.equal(nightDateLabel(2), 'מוצאי שבת 5.12')
  assert.equal(nightName(3), 'הנר השלישי')
  assert.equal(nightName(9), '')
})

test('slots = tonight\'s night number; extra people become +N', () => {
  assert.deepEqual(candleSlots(1, 0), { slots: 1, lit: 0, extra: 0 })
  assert.deepEqual(candleSlots(3, 2), { slots: 3, lit: 2, extra: 0 })
  assert.deepEqual(candleSlots(3, 7), { slots: 3, lit: 3, extra: 4 })
  assert.deepEqual(candleSlots(8, 8), { slots: 8, lit: 8, extra: 0 })
  assert.deepEqual(candleSlots(12, 1), { slots: 8, lit: 1, extra: 0 })
  assert.equal(candlesLabel(1), 'נר אחד')
  assert.equal(candlesLabel(5), '5 נרות')
})

test('candle text: first name required, short, no links / phones / bad words', () => {
  assert.equal(validateCandle({ name: '  ', wish: '' }).ok, false)
  const ok = validateCandle({ name: '  נועה  ', wish: 'חג שמח לכולם' })
  assert.deepEqual([ok.ok, ok.name, ok.wish], [true, 'נועה', 'חג שמח לכולם'])
  assert.equal(validateCandle({ name: 'א'.repeat(40) }).name.length, 20)
  assert.equal(validateCandle({ name: 'נועה', wish: 'א'.repeat(200) }).wish.length, 80)
  assert.equal(validateCandle({ name: 'נועה', wish: 'www.example.com' }).ok, false)
  assert.equal(validateCandle({ name: 'נועה', wish: 'תתקשרו 050-1234567' }).ok, false)
  assert.equal(validateCandle({ name: 'נועה', wish: 'fuck' }).ok, false)
  assert.equal(validateTitle('').ok, false)
  assert.equal(validateTitle('החנוכייה של כיתה ג׳2').ok, true)
})

test('WhatsApp text: title, the ?wa link and the site tag last, for every phase', () => {
  const link = 'https://ugabuga.co.il/hanukkiah/abcd2345'
  for (const time of [il('2026-11-20', '12:00'), il('2026-12-03', '12:00'), il('2026-12-06', '19:00'), il('2026-12-20', '12:00')]) {
    const lines = shareText({ title: 'החנוכייה של משפחת כהן', link, time, lit: 3 }).split('\n')
    assert.equal(lines[0], '🕎 החנוכייה של משפחת כהן')
    assert.equal(lines.at(-2), `${link}?wa`)
    assert.equal(lines.at(-1), SITE_TAG)
    assert.equal(SITE_TAG, 'נוצר בחינם בעוגה בוגה 🎂')
  }
  assert.match(shareText({ title: 'x', link, time: il('2026-12-06', '19:00'), lit: 3 }), /הנר השלישי/)
  assert.match(shareText({ title: 'x', link, time: il('2026-12-06', '19:00'), lit: 3 }), /3 נרות/)
  assert.equal(waLink(link), `${link}?wa`)
})

test('migration: safe to run again, closed tables, only RPCs granted, same night rule', () => {
  const sql = readFileSync(new URL('../supabase/migrations/202611150001_shared_hanukkiah.sql', import.meta.url), 'utf8')
  for (const t of ['hk_groups', 'hk_candles']) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${t}`))
    assert.match(sql, new RegExp(`alter table public\\.${t} enable row level security`))
    assert.match(sql, new RegExp(`revoke all on public\\.${t} from anon, authenticated`))
    assert.match(sql, new RegExp(`drop trigger if exists gt_filter on public\\.${t}`))
  }
  assert.doesNotMatch(sql, /create (function|table|index|trigger) (?!if not exists)(?!gt_filter)/i)
  assert.doesNotMatch(sql, /create function/i)
  assert.doesNotMatch(sql, /create table (?!if not exists)/i)
  assert.doesNotMatch(sql, /create index (?!if not exists)/i)
  assert.doesNotMatch(sql, /\bdrop table\b|\btruncate\b/i)
  // Every function the client calls is granted to anon; helpers are revoked.
  const db = readFileSync(new URL('../src/utils/hanukkiahDb.js', import.meta.url), 'utf8')
  const called = [...db.matchAll(/call\('([a-z0-9_]+)'/g)].map(m => m[1])
  assert.equal(called.length, 8)
  for (const fn of called) assert.match(sql, new RegExp(`grant execute on function public\\.${fn}\\([^)]*\\) to anon, authenticated;`), `${fn} not granted`)
  for (const fn of ['hk_night', 'hk_kind', 'hk_find', 'hk_candle_json', 'hk_group_json', 'hk_view']) {
    assert.match(sql, new RegExp(`revoke execute on function public\\.${fn}\\([^)]*\\) from public, anon, authenticated;`))
    assert.ok(!called.includes(fn))
  }
  // Every security definer function pins its search_path.
  for (const m of sql.matchAll(/create or replace function[\s\S]*?\$\$|create or replace function[\s\S]*?\$f\$/g)) {
    if (/security definer/.test(m[0])) assert.match(m[0], /set search_path/)
  }
  // Same night rule as the client: 14 hours back, from the first night's date.
  assert.ok(sql.includes(`interval '${NIGHT_START_HOUR} hours'`))
  assert.ok(sql.includes(`date '${FIRST_NIGHT_DATE}'`))
  // Error codes the server raises are all known to the client.
  for (const code of ['not_tonight', 'already_lit', 'hk_full', 'not_yours', 'not_owner']) {
    assert.ok(sql.includes(`'${code}'`))
    assert.ok(db.includes(code))
  }
  // Owner takedown and the owner report know about /hanukkiah/<code>.
  assert.match(sql, /\|hanukkiah\)\//)
  assert.match(sql, /'kind', 'hanukkiah'/)
  // The owner report keeps every kind from the previous version.
  const prev = readFileSync(new URL('../supabase/migrations/202610240004_rsvp_english.sql', import.meta.url), 'utf8')
  for (const k of [...prev.matchAll(/'kind', '([a-z]+)'/g)].map(m => m[1])) assert.ok(sql.includes(`'kind', '${k}'`), k)
})
