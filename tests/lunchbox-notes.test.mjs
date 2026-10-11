// Lunchbox notes maker: sheet layout, text fitting, filling empty notes and draft links.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const L = await import('../src/family/lunchboxNotes.js')

test('note bank: three categories, 12 notes each, no duplicates', () => {
  for (const k of L.BANK_KEYS) {
    assert.equal(L.NOTES[k].length, 12, k)
    assert.equal(new Set(L.NOTES[k]).size, 12, k)
  }
  const mix = L.bankNotes('mix', 5)
  assert.equal(mix.length, 36)
  assert.deepEqual(L.bankNotes('mix', 5), mix, 'same seed → same order')
  assert.notDeepEqual(L.bankNotes('mix', 6), mix, 'other seed → other order')
  assert.ok(L.bankNotes('jokes', 2).every(t => L.NOTES.jokes.includes(t)))
})

test('sheet cells: grid fits the page, no overlaps, first note top-right', () => {
  for (const n of L.COUNTS) {
    const { cells, cols, rows } = L.sheetCells(n)
    assert.equal(cells.length, n)
    assert.equal(cols * rows, n)
    for (const c of cells) {
      assert.ok(c.x >= 0 && c.y >= 0 && c.x + c.w <= L.SHEET_W + 1e-9 && c.y + c.h <= L.SHEET_H + 1e-9, `${n}: cell inside page`)
    }
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const a = cells[i], b = cells[j]
      const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
      assert.ok(!overlap, `${n}: cells ${i} and ${j} overlap`)
    }
    assert.ok(cells[0].x > cells[1].x, 'RTL: second note is left of the first')
    assert.equal(cells[0].y, cells[cols - 1].y)
  }
})

test('wrapText / fitText keep text inside the note', () => {
  assert.deepEqual(L.wrapText('אחת שתיים שלוש', 9), ['אחת שתיים', 'שלוש'])
  assert.deepEqual(L.wrapText('', 9), [])
  for (const line of L.wrapText('מילהארוכהמאודמאודשלאנגמרת', 8)) assert.ok(line.length <= 8)
  const long = 'x '.repeat(35).trim()
  const fit = L.fitText(long, 50, 30, 7)
  assert.ok(fit.size < 7, 'long text shrinks')
  assert.ok(fit.lines.length * fit.size * 1.25 <= 30, 'fits the height')
  assert.equal(L.fitText('קצר', 50, 30, 7).size, 7, 'short text keeps base size')
})

test('fillNotes: typed notes keep their slot, empties filled or left blank', () => {
  const texts = ['אוהבת אותך', '', 'בהצלחה במבחן!']
  const filled = L.fillNotes(texts, { count: 6, fill: true, source: 'love', seed: 3 })
  assert.equal(filled.length, 6)
  assert.deepEqual(filled[0], { text: 'אוהבת אותך', own: true })
  assert.equal(filled[2].text, 'בהצלחה במבחן!')
  assert.ok(filled[1].text && !filled[1].own && L.NOTES.love.includes(filled[1].text))
  assert.equal(new Set(filled.map(n => n.text)).size, 6, 'no repeats')

  const blank = L.fillNotes(texts, { count: 8, fill: false })
  assert.equal(blank.length, 8)
  assert.equal(blank.filter(n => n.text).length, 2)

  const typed = L.NOTES.love[0]
  const noDup = L.fillNotes([typed], { count: 12, fill: true, source: 'love', seed: 9 })
  assert.equal(noDup.filter(n => n.text === typed).length, 1, 'a typed bank note is not repeated')

  const mixed = L.fillNotes(texts, { count: 9, fill: true, seed: 4, mixOrder: true })
  assert.equal(mixed.filter(n => n.own).length, 2, 'mixing keeps all own notes')
  assert.equal(L.fillNotes([], { count: 7 }).length, 12, 'bad count falls back to 12')
  assert.ok(L.fillNotes(['x'.repeat(200)], { count: 6 })[0].text.length <= L.MAX_NOTE)
})

test('draft encode/decode round-trips Hebrew and is sanitized', () => {
  const defaults = { name: '', sign: '', texts: [], count: 12, fill: true, source: 'mix', mixOrder: false, palette: 'rainbow', frame: 'dashed', emoji: 'mix', size: 'm', seed: 1 }
  const d = { ...defaults, name: 'נועה', texts: ['בהצלחה! 💛', ''], count: 8 }
  const code = L.encodeDraft(d)
  assert.match(code, /^[\w-]+$/, 'URL-safe')
  assert.deepEqual(L.cleanDraft(L.decodeDraft(code), defaults), d)
  assert.equal(L.decodeDraft('%%%'), null)
  const bad = L.cleanDraft({ count: 99, name: 'א'.repeat(40), fill: 'yes', texts: 'nope' }, defaults)
  assert.equal(bad.count, 12)
  assert.equal(bad.name.length, L.MAX_NAME)
  assert.equal(bad.fill, true)
  assert.deepEqual(bad.texts, [])
})
