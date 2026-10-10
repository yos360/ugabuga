// Hebrew birthday / bar & bat mitzvah calculator (/tools/hebrew-birthday).
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { analyze, parseISO, hebrewText, birthHDate, parashaOn, toISO, MITZVAH_AGE, UPCOMING_COUNT } = await import('../src/utils/hebrewBirthday.js')
const { hebrewParts, gematria } = await import('../src/utils/hebrewCalendar.js')
const { HDate } = await import('@hebcal/core')

// Well-known dates (holidays that fall on a fixed Hebrew date).
test('known Gregorian → Hebrew conversions', () => {
  const cases = [
    ['2022-01-17', 'ט״ו בשבט תשפ״ב'], // Tu BiShvat 2022
    ['2024-10-03', 'א׳ בתשרי תשפ״ה'], // Rosh Hashana 5785
    ['2024-12-26', 'כ״ה בכסלו תשפ״ה'], // first day of Hanukkah 2024
    ['2023-03-07', 'י״ד באדר תשפ״ג'], // Purim 2023
    ['2025-04-13', 'ט״ו בניסן תשפ״ה'], // Pesach 2025
    ['2026-09-12', 'א׳ בתשרי תשפ״ז'], // Rosh Hashana 5787
  ]
  for (const [iso, heb] of cases) assert.equal(analyze({ date: iso }).birth.hebrew, heb, iso)
})

test('born after sunset → next Hebrew date', () => {
  assert.equal(analyze({ date: '2022-01-16', afterSunset: true }).birth.hebrew, 'ט״ו בשבט תשפ״ב')
  assert.equal(analyze({ date: '2022-01-16' }).birth.hebrew, 'י״ד בשבט תשפ״ב')
  // across a Hebrew new year
  assert.equal(analyze({ date: '2024-10-02', afterSunset: true }).birth.hebrew, 'א׳ בתשרי תשפ״ה')
})

// Two independent implementations (hebcal vs the browser/ICU Hebrew calendar) must agree.
test('agrees with Intl he-u-ca-hebrew for every day 1990–2030 (sampled)', () => {
  if (!hebrewParts(new Date(2022, 0, 17, 12))) return // ICU without Hebrew calendar
  const norm = s => s.replace('אדר א׳', 'אדר א').replace('אדר ב׳', 'אדר ב')
  for (let d = new Date(1990, 0, 1, 12); d < new Date(2030, 11, 31); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 3, 12)) {
    const p = hebrewParts(d), hd = birthHDate(d)
    const intl = `${gematria(p.day)} ב${p.month} ${gematria(p.year)}`
    assert.equal(norm(hebrewText(hd)), norm(intl), toISO(d))
  }
})

test('input validation', () => {
  assert.equal(analyze({ date: '' }).status, 'invalid')
  assert.equal(analyze({ date: '2023-02-30' }).status, 'invalid')
  assert.equal(analyze({ date: '1850-05-05' }).status, 'range')
  assert.equal(parseISO('2024-02-29').getDate(), 29)
})

test('bar mitzvah at 13, bat mitzvah at 12, on the Hebrew birthday', () => {
  assert.deepEqual(MITZVAH_AGE, { boy: 13, girl: 12 })
  const boy = analyze({ date: '2022-01-17', gender: 'boy' }).mitzvah
  assert.equal(boy.hebrew, 'ט״ו בשבט תשצ״ה')
  assert.equal(new HDate(parseISO(boy.iso)).getFullYear(), 5795)
  const girl = analyze({ date: '2022-01-17', gender: 'girl' }).mitzvah
  assert.equal(girl.hebrew, 'ט״ו בשבט תשצ״ד')
  assert.equal(girl.iso, '2034-02-04')
})

test('Adar of a regular year → Adar II when the target year is leap', () => {
  // 14 Adar 5783 (regular); 5795 is a leap year
  const r = analyze({ date: '2023-03-07', gender: 'girl' })
  assert.ok(r.notes.includes('adarRegular'))
  assert.equal(r.mitzvah.hebrew, 'י״ד באדר ב׳ תשצ״ה')
  // and plain Adar when the target year is regular (5796)
  assert.equal(analyze({ date: '2023-03-07', gender: 'boy' }).mitzvah.hebrew, 'י״ד באדר תשצ״ו')
})

test('Adar I / Adar II of a leap year', () => {
  // 5782 is leap: 1 Adar I = 2022-02-02, 1 Adar II = 2022-03-04
  const a1 = analyze({ date: '2022-02-02', gender: 'boy' })
  assert.equal(a1.birth.hebrew, 'א׳ באדר א׳ תשפ״ב')
  assert.ok(a1.notes.includes('adar1'))
  assert.equal(a1.mitzvah.hebrew, 'א׳ באדר א׳ תשצ״ה') // 5795 leap → stays in Adar I
  assert.equal(analyze({ date: '2022-02-02', gender: 'girl' }).mitzvah.hebrew, 'א׳ באדר תשצ״ד') // 5794 regular → Adar
  const a2 = analyze({ date: '2022-03-04', gender: 'boy' })
  assert.equal(a2.birth.hebrew, 'א׳ באדר ב׳ תשפ״ב')
  assert.ok(a2.notes.includes('adar2'))
  assert.equal(a2.mitzvah.hebrew, 'א׳ באדר ב׳ תשצ״ה')
})

test('30 Kislev / 30 Cheshvan move to the 1st of the next month in short years', () => {
  // 30 Kislev 5771 = 2010-12-07; Kislev 5784 has 29 days
  const k = analyze({ date: '2010-12-07', gender: 'boy' })
  assert.equal(k.birth.hebrew, 'ל׳ בכסלו תשע״א')
  assert.ok(k.notes.includes('kislev30'))
  assert.equal(k.mitzvah.hebrew, 'א׳ בטבת תשפ״ד')
  assert.equal(k.mitzvah.moved, true)
  // 30 Cheshvan 5770 = 2009-11-17; Cheshvan 5783 has 30 days → no move
  const c = analyze({ date: '2009-11-17', gender: 'boy' })
  assert.ok(c.notes.includes('cheshvan30'))
  assert.equal(c.mitzvah.hebrew, 'ל׳ בחשוון תשפ״ג')
  assert.equal(c.mitzvah.moved, false)
})

test('next Hebrew birthdays start from today and are consecutive', () => {
  const r = analyze({ date: '2022-01-17', today: '2026-10-10' })
  assert.equal(r.upcoming.length, UPCOMING_COUNT)
  assert.equal(r.upcoming[0].hyear, 5787)
  assert.equal(r.upcoming[0].iso, '2027-01-23')
  assert.equal(r.upcoming[0].age, 5)
  r.upcoming.forEach((u, i) => { if (i) assert.equal(u.hyear, r.upcoming[i - 1].hyear + 1) })
  for (const u of r.upcoming) assert.ok(u.iso >= '2026-10-10')
  // birthday today is included
  const t = analyze({ date: '2022-01-17', today: '2027-01-23' })
  assert.equal(t.upcoming[0].iso, '2027-01-23')
  // without "today", the list starts at the first birthday
  assert.equal(analyze({ date: '2022-01-17' }).upcoming[0].age, 1)
})

test('Shabbat on/after the bar mitzvah and its parasha', () => {
  const m = analyze({ date: '2022-01-17', gender: 'girl' }).mitzvah
  assert.equal(m.shabbat.sameDay, true) // 4 Feb 2034 is a Saturday
  assert.equal(m.shabbat.parasha, 'פרשת בשלח')
  const b = analyze({ date: '2023-03-07', gender: 'girl' }).mitzvah // Sunday 25 Mar 2035
  assert.equal(b.shabbat.iso, '2035-03-31')
  assert.equal(parseISO(b.shabbat.iso).getDay(), 6)
  // Israel vs diaspora: 7 Sivan 5786 (Sat 23 May 2026) is the second day of Shavuot abroad, Naso in Israel
  const hd = new HDate(parseISO('2026-05-23'))
  assert.equal(parashaOn(hd, true).name, 'פרשת נשא')
  assert.equal(parashaOn(hd, false).name, 'שבועות')
  assert.equal(parashaOn(hd, false).chag, true)
  // Bereshit on 29 Tishrei 5787
  assert.equal(parashaOn(new HDate(parseISO('2026-10-10')), true).name, 'פרשת בראשית')
})
