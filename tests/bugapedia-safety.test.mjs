import test from 'node:test'
import assert from 'node:assert/strict'
import { checkBugaPediaQuery, filterSafeResults, isSafeBugaPediaResult, isSelfHarmQuery, redactBugaPediaQuery } from '../src/utils/bugapediaSafety.js'
import { calculateBugaPedia, searchBugaPedia } from '../src/utils/bugapediaSearch.js'
import { findBugaPediaKnowledge } from '../src/data/bugapediaKnowledge.js'

test('BugaPedia blocks unsafe queries in Hebrew (with prefixes) and English', () => {
  for (const query of ['סקס', 'מה זה פורנו?', 'ובסקס', 'תמונות עירום', 'איך משיגים סמים', 'קזינו אונליין', 'free porn', 'what is cocaine', 'עריפת ראש']) {
    assert.equal(checkBugaPediaQuery(query), 'blocked', query)
  }
  for (const query of ['למה השמיים כחולים?', 'מה זה מזון מזין?', 'דב קוטב', 'Essex', 'רצח רבין', 'מלחמת העולם השנייה', 'הזין את המספר', 'כלי נשק בימי הביניים']) {
    assert.equal(checkBugaPediaQuery(query), null, query)
  }
})

test('BugaPedia detects self-harm and suicide questions', () => {
  for (const query of ['התאבדות', 'איך להתאבד', 'אני רוצה לפגוע בעצמי', 'אני לא רוצה לחיות', 'בא לי למות', 'I want to kill myself']) {
    assert.ok(isSelfHarmQuery(query), query)
    assert.equal(checkBugaPediaQuery(query), 'selfharm', query)
  }
  assert.ok(!isSelfHarmQuery('איך חיים דובי קוטב?'))
})

test('BugaPedia refuses blocked and self-harm queries without searching', async () => {
  await assert.rejects(searchBugaPedia('סרטי פורנו'), { message: 'blocked' })
  await assert.rejects(searchBugaPedia('איך להתאבד'), { message: 'selfharm' })
})

test('safety filter drops unsafe results and keeps safe ones', () => {
  const results = [
    { id: 1, title: 'פורנוגרפיה', extract: 'ערך' },
    { id: 2, title: 'כלב', extract: 'הכלב הוא בעל חיים.' },
    { id: 3, title: 'סרט', extract: 'סרט עם תוכן porn בוטה' },
    { id: 4, title: 'Casino', extract: 'A gambling house.' },
  ]
  assert.deepEqual(filterSafeResults(results, 'כלב').map(item => item.id), [2])
  assert.ok(isSafeBugaPediaResult({ title: 'רצח רבין', extract: 'ראש הממשלה יצחק רבין נרצח ב-1995.' }, 'רצח רבין'))
  assert.ok(!isSafeBugaPediaResult({ title: 'רוצח סדרתי', extract: '' }, 'סדרה'))
})

test('BugaPedia computes only when the whole question is an expression', () => {
  assert.equal(calculateBugaPedia('מלחמת העולם השנייה 1939-1945'), null)
  assert.equal(calculateBugaPedia('14/5/1948'), null)
  assert.equal(calculateBugaPedia('1939-1945'), null)
  assert.equal(calculateBugaPedia('מה קרה ב-1948?'), null)
  assert.equal(calculateBugaPedia('12*3').result, 36)
  assert.equal(calculateBugaPedia('כמה זה 7+5?').result, 12)
  assert.equal(calculateBugaPedia('כמה זה 2+3*4').result, 14)
  assert.equal(calculateBugaPedia('8 כפול 7').result, 56)
  assert.equal(calculateBugaPedia('20 אחוז מתוך 50').result, 10)
  assert.equal(calculateBugaPedia('5/0'), null)
})

test('BugaPedia strips thousands commas instead of treating them as decimals', () => {
  assert.equal(calculateBugaPedia('1,000 + 5').result, 1005)
  assert.equal(calculateBugaPedia('כמה זה 1,250,000 / 1,000?').result, 1250)
  assert.equal(calculateBugaPedia('2,5 + 1'), null)
})

test('analytics redaction removes emails, phones and ID-like numbers', () => {
  assert.equal(redactBugaPediaQuery('המייל שלי kid@example.com'), 'המייל שלי [הוסר]')
  assert.equal(redactBugaPediaQuery('הטלפון 050-1234567'), 'הטלפון [הוסר]')
  assert.equal(redactBugaPediaQuery('ת"ז 123456789'), 'ת"ז [הוסר]')
  assert.equal(redactBugaPediaQuery('מלחמת העולם 1939-1945'), 'מלחמת העולם 1939-1945')
})

test('verified knowledge matches whole words, not substrings', () => {
  assert.ok(findBugaPediaKnowledge('למה שודדי ים שמים רטיה?'))
  assert.ok(findBugaPediaKnowledge('because'))
  assert.equal(findBugaPediaKnowledge('becauses of the rain'), null)
  assert.equal(findBugaPediaKnowledge('שודדי ימים ורטייהלה'), null)
})

test('BugaPedia reports a network error when every source fails', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => { throw new TypeError('offline') }
  try { await assert.rejects(searchBugaPedia('דובי קוטב'), { message: 'network' }) }
  finally { globalThis.fetch = original }
})

test('every subject example question has a checked answer', async () => {
  const { CLASSROOM_SUBJECTS } = await import('../src/data/classroomSubjects.js')
  for (const subject of CLASSROOM_SUBJECTS) for (const question of subject.examples) {
    const answer = findBugaPediaKnowledge(question)
    assert.ok(answer?.verified, `no checked answer for "${question}"`)
  }
  assert.match(findBugaPediaKnowledge('מהי היבשת הגדולה בעולם?').title, /אסיה/)
  assert.match(findBugaPediaKnowledge('מהו שם תואר').title, /שם תואר/)
  assert.equal(findBugaPediaKnowledge('מהו קצב הלב?'), null)
})
