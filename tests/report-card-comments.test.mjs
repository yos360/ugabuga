import test from 'node:test'
import assert from 'node:assert/strict'
import { COMMENT_GROUPS, ALL_COMMENTS, findComment, sentence, composeComment } from '../src/data/reportCardComments.js'

test('70 sentences in 9 groups, ids unique and prefixed by their group', () => {
  assert.equal(COMMENT_GROUPS.length, 9)
  assert.equal(ALL_COMMENTS.length, 70)
  assert.equal(new Set(ALL_COMMENTS.map(c => c.id)).size, ALL_COMMENTS.length)
  for (const c of ALL_COMMENTS) assert.ok(c.id.startsWith(c.group + '-'), c.id)
})

test('every sentence has a boy and a girl form, and only openers use the name', () => {
  for (const c of ALL_COMMENTS) {
    assert.ok(c.m && c.f, c.id)
    if (c.group !== 'open') assert.ok(!c.m.includes('{name}') && !c.f.includes('{name}'), c.id)
    for (const g of ['m', 'f']) for (const t of ['m', 'f']) {
      const s = sentence(c, g, '', t)
      assert.ok(!/[{}]/.test(s), `${c.id} ${g}/${t}: ${s}`)
      assert.ok(s.length <= 120, c.id)
    }
  }
})

test('teacher gender switches only the teacher words', () => {
  const c = findComment('close-2')
  assert.equal(sentence(c, 'f', '', 'f'), 'המשיכי כך! אני בטוחה שעוד תפתיעי את כולנו.')
  assert.equal(sentence(c, 'm', '', 'm'), 'המשך כך! אני בטוח שעוד תפתיע את כולנו.')
})

test('openers with and without a name; composed text puts the opener on its own line', () => {
  assert.equal(sentence(findComment('open-1'), 'f', 'נועה'), 'נועה היקרה,')
  assert.equal(sentence(findComment('open-1'), 'm', ''), 'תלמיד יקר,')
  assert.equal(sentence(findComment('open-2'), 'f', ''), 'לתלמידה שלי,')
  assert.equal(composeComment(['open-1', 'social-6', 'close-3'], 'm', 'דן'), 'דן היקר,\nיש לך חוש הומור שמשמח את כולנו. אני גאה בך ומאמינה בך.')
  assert.equal(composeComment(['nope'], 'm'), '')
})
