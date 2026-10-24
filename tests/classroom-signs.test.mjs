// Classroom signs (/printables/classroom-signs): sign data, niqqud spelling and card layout.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const C = await import('../src/data/classroomSigns.js')
const skel = t => t.replace(/[יו]/g, '')

test('every sign has a unique id, a known group, and a pointed title that matches the plain one', () => {
  const groups = new Set(C.SIGN_GROUPS.map(g => g[0]))
  assert.equal(new Set(C.SIGNS.map(s => s.id)).size, C.SIGNS.length)
  for (const s of C.SIGNS) {
    assert.ok(groups.has(s.group), s.id)
    assert.ok(s.icon && /^#[0-9a-f]{6}$/i.test(s.color), s.id)
    // pointed text uses the defective spelling (חִנּוּךְ for חינוך), so only י and ו may differ
    assert.equal(skel(C.stripNiqqud(s.nq)), skel(s.he), s.id)
    assert.notEqual(s.nq, s.he, `${s.id} has niqqud`)
    if (s.sub) assert.equal(skel(C.stripNiqqud(s.subNq)), skel(s.sub), s.id)
  }
  assert.ok(C.DEFAULT_SIGNS.every(id => C.SIGNS.some(s => s.id === id)))
  assert.equal(C.SIGNS.filter(s => s.group === 'week').length, 6)
})

test('cards fill the sheet without overlapping, for 2 and 3 per page', () => {
  for (const n of [2, 3]) {
    const b = C.cardBoxes(n)
    assert.equal(b.length, n)
    for (let i = 0; i < n; i++) {
      assert.ok(b[i].x >= 0 && b[i].x + b[i].w <= C.SHEET_W)
      assert.ok(b[i].y >= 0 && b[i].y + b[i].h <= C.SHEET_H + 1e-9)
      if (i) assert.ok(b[i].y >= b[i - 1].y + b[i - 1].h + 4, 'gap for cutting')
      assert.ok(b[i].w / b[i].h > 1.4, 'landscape card')
    }
  }
  assert.deepEqual(C.chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]])
})

test('titles fit their box; long multi-word titles go on two lines', () => {
  for (const s of C.SIGNS) {
    for (const t of [s.he, s.nq]) {
      const { lines, fs } = C.fitTitle(t, 85, 123, !!s.sub)
      assert.ok(fs > 12, `${s.id} readable`)
      for (const l of lines) assert.ok(C.textLen(l) * fs <= 85 + 1e-9, `${s.id} fits`)
    }
  }
  assert.equal(C.fitTitle('תולדות האמנות', 85, 123).lines.length, 2)
  assert.equal(C.fitTitle('חשבון', 85, 123).lines.length, 1)
  assert.equal(C.textLen('חֶשְׁבּוֹן'), C.textLen('חשבון'), 'points take no width')
})
