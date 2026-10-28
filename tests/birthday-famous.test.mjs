import test from 'node:test'
import assert from 'node:assert/strict'
import { BLOCK, DEAD, SAFE, extraPeople, parseBorn, stripWiki } from '../src/utils/birthdayFamous.js'

const PAGE = `== אירועים ==
* [[1492]] – משהו קרה
==נולדו ==
* [[1955]] – [[ביל גייטס]], איש עסקים ונדבן אמריקאי
* [[1942]] – [[בוב רוס]], צייר ומנחה טלוויזיה אמריקאי (1942–1995)
* [[1990]] – [[דנה כהן (שפית)|דנה כהן]], שפית ישראלית
* [[1980]] – [[יוסי לוי]], זמר אשר זכה בפרס
* [[1970]] – [[משה ישראלי]], זמר ושר האוצר לשעבר
* [[1960]] – [[אבי רבן]], רב וזמר
* [[1985]] – [[גל מערבי]], כדורגלן מהמערב
== נפטרו ==
* [[2000]] – [[פלוני אלמוני]], זמר`

test('reads only the births section, with display names', () => {
  const born = parseBorn(PAGE)
  assert.equal(born.length, 7)
  assert.deepEqual(born[2], { year: 1990, title: 'דנה כהן (שפית)', display: 'דנה כהן', rest: ', שפית ישראלית' })
  assert.ok(!born.some(p => p.title === 'פלוני אלמוני'), 'deaths are not births')
})

test('kid-safe filter: Hebrew word edges, no false blocks from אשר/מערב', () => {
  const ok = d => SAFE.test(stripWiki(d)) && !BLOCK.test(stripWiki(d))
  assert.ok(ok('שפית ישראלית'), 'a chef is allowed (\\b never fired next to Hebrew letters)')
  assert.ok(ok('זמר אשר זכה בפרס'), '"אשר" is not "שר"')
  assert.ok(ok('כדורגלן מהמערב'), '"מערב" is not "רב"')
  assert.ok(!ok('זמר ושר האוצר לשעבר'), 'a minister is blocked even with a ו prefix')
  assert.ok(!ok('רב וזמר'), 'a rabbi is blocked')
  assert.ok(!ok('איש עסקים ונדבן'), 'no allowed profession → not shown')
})

test('nobody who died gets an age', () => {
  for (const s of ['(נפטר ב-1995)', 'צייר (1942–1995)', 'זמר (1930 - [[2001]])', 'שחקן †2010', 'משורר ז"ל', 'זמרת (מתה ב-2003)'])
    assert.ok(DEAD.test(s), s)
  assert.ok(!DEAD.test('שחקן וזמר ישראלי'))
  const extras = extraPeople(parseBorn(PAGE), [{ name: 'ביל גייטס' }], 10)
  assert.equal(extras.find(p => p.name === 'בוב רוס').alive, false)
  const dana = extras.find(p => p.title === 'דנה כהן (שפית)')
  assert.equal(dana.name, 'דנה כהן', 'the card shows the plain name; the page title is kept for the photo lookup')
  assert.equal(dana.alive, true)
  assert.ok(!extras.some(p => p.name === 'ביל גייטס'), 'curated people are not repeated')
})
