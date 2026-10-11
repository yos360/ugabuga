// Bar/bat mitzvah hub (/bar-mitzvah/*): date planner, checklist dates, speech and quiz builders.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const B = await import('../src/utils/barMitzvah.js')
const { PARASHOT, CHECKLIST, QUIZ_BANK, MEANINGS } = await import('../src/data/barMitzvah.js')
const { parseISO } = await import('../src/utils/hebrewBirthday.js')
const { parshiot, HDate } = await import('@hebcal/core')

test('mitzvah date: boy 13 / girl 12 on the Hebrew birthday', () => {
  // born 15 Shevat 5782 (17 Jan 2022)
  const boy = B.mitzvahPlan({ date: '2022-01-17', gender: 'boy' })
  assert.equal(boy.mitzvah.hebrew, 'ט״ו בשבט תשצ״ה')
  const girl = B.mitzvahPlan({ date: '2022-01-17', gender: 'girl' })
  assert.equal(girl.mitzvah.hebrew, 'ט״ו בשבט תשצ״ד')
  assert.equal(girl.mitzvah.iso, '2034-02-04')
  assert.equal(girl.tefillin, null)
  assert.ok(boy.tefillin)
})

test('after sunset moves the birth (and the mitzvah) one Hebrew day', () => {
  const before = B.mitzvahPlan({ date: '2022-01-16', gender: 'boy' })
  const after = B.mitzvahPlan({ date: '2022-01-16', afterSunset: true, gender: 'boy' })
  assert.equal(before.mitzvah.hebrew, 'י״ד בשבט תשצ״ה')
  assert.equal(after.mitzvah.hebrew, 'ט״ו בשבט תשצ״ה')
})

test('Adar edge cases', () => {
  // Adar of a regular year (14 Adar 5783) → Adar II when the mitzvah year is leap (5795, girl), Adar otherwise (5796, boy)
  assert.equal(B.mitzvahPlan({ date: '2023-03-07', gender: 'girl' }).mitzvah.hebrew, 'י״ד באדר ב׳ תשצ״ה')
  assert.equal(B.mitzvahPlan({ date: '2023-03-07', gender: 'boy' }).mitzvah.hebrew, 'י״ד באדר תשצ״ו')
  // Adar I of a leap year (1 Adar I 5782): leap target stays Adar I, regular target → Adar
  assert.equal(B.mitzvahPlan({ date: '2022-02-02', gender: 'boy' }).mitzvah.hebrew, 'א׳ באדר א׳ תשצ״ה')
  assert.equal(B.mitzvahPlan({ date: '2022-02-02', gender: 'girl' }).mitzvah.hebrew, 'א׳ באדר תשצ״ד')
  // Adar II of a leap year (3 Adar II 5774 = 5 Mar 2014) → 5787 is leap → Adar II
  const a2 = B.mitzvahPlan({ date: '2014-03-05', gender: 'boy' })
  assert.equal(a2.mitzvah.hebrew, 'ג׳ באדר ב׳ תשפ״ז')
  assert.equal(a2.mitzvah.iso, '2027-03-12')
  assert.ok(a2.notes.includes('adar2'))
  // 30 Adar I 5782 (3 Mar 2022): boy in leap 5795 keeps 30 Adar I; girl in regular 5794 → 1 Nisan
  const d30 = B.mitzvahPlan({ date: '2022-03-03', gender: 'girl' })
  assert.ok(d30.notes.includes('adar1day30'))
  assert.equal(d30.mitzvah.hebrew, 'א׳ בניסן תשצ״ד')
  assert.equal(d30.mitzvah.moved, true)
  assert.equal(B.mitzvahPlan({ date: '2022-03-03', gender: 'boy' }).mitzvah.hebrew, 'ל׳ באדר א׳ תשצ״ה')
})

test('Shabbat options start on/after the date, are a week apart, and carry the parasha', () => {
  const p = B.mitzvahPlan({ date: '2014-03-05', gender: 'boy' }) // Friday 12 Mar 2027
  assert.deepEqual(p.shabbatot.map(s => s.iso), ['2027-03-13', '2027-03-20', '2027-03-27', '2027-04-03'])
  assert.deepEqual(p.shabbatot.map(s => s.parasha), ['פרשת פקודי', 'פרשת ויקרא', 'פרשת צו', 'פרשת שמיני'])
  for (const s of p.shabbatot) assert.equal(parseISO(s.iso).getDay(), 6)
  // a date that is itself a Shabbat is the first option (4 Feb 2034, Beshalach)
  const g = B.mitzvahPlan({ date: '2022-01-17', gender: 'girl' })
  assert.equal(g.shabbatot[0].iso, '2034-02-04')
  assert.equal(g.shabbatot[0].parasha, 'פרשת בשלח')
  assert.deepEqual(g.shabbatot[0].keys, ['Beshalach'])
})

test('festival Shabbat and Israel/diaspora differences', () => {
  // Shabbat Chol HaMoed Pesach 2027 → no regular parasha, no speech keys
  const s = B.shabbatotFrom('2027-04-20', 2)
  assert.equal(s[0].iso, '2027-04-24')
  assert.equal(s[0].chag, true)
  assert.deepEqual(s[0].keys, [])
  // 23 May 2026: Naso in Israel, 2nd day of Shavuot abroad
  const d = B.shabbatotFrom('2026-05-23', 1)[0]
  assert.equal(d.parasha, 'פרשת נשא')
  assert.equal(d.differs, true)
  assert.equal(d.diaspora, 'שבועות')
})

test('Mondays/Thursdays and tefillin dates', () => {
  const w = B.torahWeekdays('2027-03-12', 4)
  assert.deepEqual(w.map(x => x.iso), ['2027-03-15', '2027-03-18', '2027-03-22', '2027-03-25'])
  assert.ok(w.every(x => [1, 4].includes(parseISO(x.iso).getDay())))
  assert.match(w[2].special, /תענית אסתר/)
  const t = B.tefillinDates('2027-03-12')
  assert.equal(t.month.iso, '2027-02-10')
  assert.equal(t.twoMonths.iso, '2027-01-12')
  assert.equal(B.daysUntil('2027-03-12', '2026-10-11'), 152)
  assert.equal(B.mitzvahPlan({ date: '2014-03-05', today: '2026-10-11' }).daysLeft, 152)
})

test('invalid input is passed through', () => {
  assert.equal(B.mitzvahPlan({ date: '' }).status, 'invalid')
  assert.equal(B.mitzvahPlan({ date: '1800-01-01' }).status, 'range')
  assert.deepEqual(B.shabbatotFrom('nope'), [])
})

test('every Torah portion has a speech theme, keyed by hebcal names', () => {
  assert.equal(PARASHOT.length, parshiot.length)
  for (const key of parshiot) {
    const p = B.parashaByKey(key)
    assert.ok(p, key)
    assert.ok(p.title.startsWith('פרשת '), key)
    assert.ok(p.about.length > 20 && p.idea.length > 20, key)
  }
  // a whole year of Shabbatot resolves to known portions
  for (const s of B.shabbatotFrom('2026-10-10', 52)) for (const k of s.keys) assert.ok(B.parashaByKey(k), k)
})

test('checklist: unique ids, ordered stages, dates counted back from the event', () => {
  const ids = CHECKLIST.flatMap(s => s.items.map(i => `${s.id}.${i.id}`))
  assert.equal(new Set(ids).size, ids.length)
  const r = B.checklistWithDates('2027-06-12', '2026-10-11')
  assert.equal(r[0].due, '2026-06-12') // 12 months
  assert.equal(r[0].late, true)
  assert.equal(r.find(s => s.id === 'm6').due, '2026-12-12')
  assert.equal(r.find(s => s.id === 'w2').due, '2027-05-29')
  assert.equal(r.at(-1).due, '2027-06-12')
  for (let i = 1; i < r.length; i++) assert.ok(r[i].due >= r[i - 1].due)
  assert.equal(B.checklistWithDates('')[0].due, null)
})

test('speech: gendered, personal, skips empty answers', () => {
  const boy = B.buildSpeech({ name: 'נועם', gender: 'boy', parasha: 'Noach', meanings: ['independence'], hobbies: 'לשחק כדורגל', parents: 'אמא ואבא', wish: 'שאמשיך לצחוק' })
  const text = boy.map(s => s.text).join(' ')
  assert.deepEqual(boy.map(s => s.id), ['opening', 'parasha', 'me', 'meaning', 'thanks', 'closing'])
  assert.match(text, /פרשת נח/)
  assert.match(text, /עצמאי יותר/)
  assert.match(text, /אני הכי אוהב לשחק כדורגל\./)
  assert.match(text, /אני מאחל לעצמי שאמשיך לצחוק\./)
  assert.doesNotMatch(text, /\/|undefined|null/)
  const girl = B.buildSpeech({ name: 'מאיה', gender: 'girl', meanings: ['independence', 'chapter'], hobbies: 'לרקוד' })
  const gt = girl.map(s => s.text).join(' ')
  assert.match(gt, /בת המצווה/)
  assert.match(gt, /עצמאית יותר ולהתחיל פרק חדש/)
  assert.match(gt, /אני הכי אוהבת לרקוד/)
  assert.doesNotMatch(gt, /בר המצווה|מתרגש |אוהב /)
  // minimal answers → just an opening and a closing
  assert.deepEqual(B.buildSpeech({ gender: 'girl', style: 'party' }).map(s => s.id), ['opening', 'closing'])
  // the second wording differs
  assert.notEqual(B.buildSpeech({ gender: 'boy' }, 1)[0].text, B.buildSpeech({ gender: 'boy' }, 0)[0].text)
  assert.ok(MEANINGS.every(m => !m.m.includes('/') && !m.f.includes('/')))
  assert.equal(B.heList(['א', 'ב', 'ג']), 'א, ב וג')
  assert.equal(B.readingMinutes('מילה '.repeat(330)), 3)
})

test('quiz: distractors never repeat the answer, correct index is valid', () => {
  const d = B.pickDistractors(['פיצה', 'סושי', 'פסטה', 'שניצל'], 'פיצה', 2, 3)
  assert.equal(d.length, 2)
  assert.ok(!d.includes('פיצה'))
  assert.notEqual(d[0], d[1])
  assert.deepEqual(B.pickDistractors(['א', 'ב', 'ג'], 'א', 2, 5), B.pickDistractors(['א', 'ב', 'ג'], 'א', 2, 5))
  assert.deepEqual(B.numberDistractors('2'), ['3', '1'])
  assert.deepEqual(B.numberDistractors('0'), ['1', '2'])

  const items = [
    { id: 'food', q: 'מה המאכל האהוב על {name}?', correct: 'סושי', wrong: ['פיצה', 'סושי', 'פסטה'] },
    { id: 'dream', q: 'מה {name} רוצה להיות כש{יגדל|תגדל}?', correct: 'טייסת', wrong: ['רופאה'] },
    { id: 'skip', q: 'ריקה', correct: '', wrong: ['x'] },
    { id: 'nowrong', q: 'בלי שגויות', correct: 'כן', wrong: ['כן', ''] },
  ]
  const qs = B.buildCelebrantQuiz({ name: 'מאיה', gender: 'girl', items })
  assert.equal(qs.length, 2)
  assert.equal(qs[0].q, 'מה המאכל האהוב על מאיה?')
  assert.equal(qs[1].q, 'מה מאיה רוצה להיות כשתגדל?')
  for (const q of qs) {
    assert.ok(q.correct >= 0 && q.correct < q.options.length)
    assert.ok(q.options.length >= 2 && q.options.length <= 4)
    assert.equal(new Set(q.options).size, q.options.length)
  }
  assert.equal(qs[0].options[qs[0].correct], 'סושי')
  assert.equal(qs[0].options.length, 3) // duplicate of the answer dropped
})

test('quiz bank: every template fills cleanly for both genders', () => {
  for (const b of QUIZ_BANK) {
    for (const boy of [true, false]) {
      const q = B.fillName(b.q, 'נועה', boy)
      assert.doesNotMatch(q, /[{}|]/, b.id)
      for (const p of b.pool) assert.doesNotMatch(B.fillName(p, '', boy), /[{}|/]/, `${b.id}: ${p}`)
    }
    if (!b.number) assert.ok(b.pool.length >= 5, b.id)
  }
  assert.equal(new Set(QUIZ_BANK.map(b => b.id)).size, QUIZ_BANK.length)
})

test('hebcal agrees on the leap years used above', () => {
  assert.equal(HDate.isLeapYear(5795), true)
  assert.equal(HDate.isLeapYear(5794), false)
  assert.equal(HDate.isLeapYear(5787), true)
})
