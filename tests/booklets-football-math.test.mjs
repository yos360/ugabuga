import test from 'node:test'
import assert from 'node:assert/strict'
import * as D from '../src/booklets/footballMathGrade5Data.js'

test('football math: the league table is consistent and points are computed', () => {
  const sum = i => D.LEAGUE.reduce((s, r) => s + r[i], 0)
  assert.equal(sum(1), sum(3), 'wins equal losses')
  assert.equal(sum(2) % 2, 0, 'draws pair up')
  assert.equal(sum(4), sum(5), 'goals scored equal goals conceded')
  assert.equal(new Set(D.LEAGUE.map(D.games)).size, 1, 'every team played the same number of games')
  assert.deepEqual(D.LEAGUE.map(D.points), [18, 15, 11, 5])
  assert.deepEqual(D.LEAGUE_QS.map(D.fmt), ['9 משחקים', 'הכחולים', '3 נקודות', '45 שערים', '6 נקודות'])
})

test('football math: every answer is a whole or short decimal, positive, and the question ends with ?', () => {
  for (const name of ['FIELD', 'STADIUM', 'FRACTIONS', 'DECIMALS', 'TIME', 'AVERAGE', 'CHALLENGE']) {
    assert.equal(D[name].length, 4, name)
    for (const it of D[name]) {
      assert.ok(it.q.endsWith('?') && it.t.length >= 1, it.q)
      if (typeof it.a === 'number') {
        assert.ok(it.a > 0 && Number.isInteger(Math.round(it.a * 100)), `${it.q} ${it.a}`)
        if (name !== 'DECIMALS') assert.ok(Number.isInteger(it.a), `${it.q} ${it.a}`)
      } else assert.match(it.a, /^(\d{1,2}:\d{2}|\d{4})$/)
    }
  }
})

test('football math: spot-check the answer key', () => {
  assert.deepEqual(D.FIELD.map(D.fmt), ['320 מטר', '6,000 מ״ר', '640 מ״ר', '15,000 שקלים'])
  assert.deepEqual(D.TIME.map(D.fmt), ['21:30', '21:34', '270 דקות', '2038'])
  assert.deepEqual(D.DECIMALS.map(D.fmt), ['10.4 ק״מ', '4.3 ק״ג', '135.40 שקלים', '0.64 מטר'])
  assert.deepEqual(D.CHALLENGE.map(D.fmt), ['108 חולצות', '20 שקלים', '4 משחקים', '3 סיבובים'])
  assert.deepEqual(D.STADIUM.map(D.fmt), ['6,000 מושבים', '45 אוהדים', '2,760 שקלים', '280 שקלים'])
})
