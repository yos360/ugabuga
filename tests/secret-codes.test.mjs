import test from 'node:test'
import assert from 'node:assert/strict'
import { CIPHERS, LETTERS, MISSIONS, SHAPE_KEY, SHAPE_WORDS, SHEETS, SHIFT_KEYS, codeOf, decode, encode, keyTable, messageRows, sameMessage } from '../src/data/secretCodes.js'

test('the alphabet has the 22 regular letters', () => {
  assert.equal(LETTERS.length, 22)
  assert.equal(new Set(LETTERS).size, 22)
})

test('known values of each cipher', () => {
  assert.equal(encode('atbash', 'בבל'), 'ששכ')
  assert.equal(decode('atbash', 'ששך'), 'בבל')
  assert.equal(encode('atbash', 'אבג'), 'תשר')
  assert.equal(encode('shift', 'אבת', 1), 'בגא')
  assert.equal(encode('shift', 'אב', 3), 'דה')
  assert.equal(encode('number', 'שלום'), '21 12 6 13')
  assert.equal(encode('number', 'אב גד'), '1 2 / 3 4')
})

test('every message survives a round trip, with its final letters', () => {
  const texts = ['שלום לכם', 'מחר בשעה שמונה ליד העץ הגדול', 'לחם גן ארץ כף ילדה']
  for (const t of texts) {
    for (const k of SHIFT_KEYS) assert.equal(decode('shift', encode('shift', t, k), k), t)
    assert.equal(decode('atbash', encode('atbash', t)), t)
    assert.equal(decode('number', encode('number', t)), t)
  }
})

test('niqqud, punctuation and foreign text do not break the ciphers', () => {
  assert.equal(encode('atbash', 'שָׁלוֹם!'), encode('atbash', 'שלום') + '!')
  assert.equal(encode('shift', 'Abc 12', 1), 'Abc 12')
  assert.equal(encode('number', 'שלום!'), '21 12 6 13')
  assert.equal(decode('number', '99'), '?')
  assert.equal(decode('number', ''), '')
})

test('the number code stays in letter order in a right-to-left paragraph', () => {
  assert.ok(!encode('number', 'שלום לכם').includes('-'))
})

test('key tables cover every letter once', () => {
  for (const cipher of ['atbash', 'shift', 'number']) {
    const table = keyTable(cipher, 2)
    assert.equal(table.length, 22)
    assert.equal(new Set(table.map(r => r.code)).size, 22, cipher)
  }
  assert.equal(codeOf('atbash', 'א'), 'ת')
})

test('answers match whatever the spacing, punctuation and final letters', () => {
  assert.ok(sameMessage('יש לי סוד', ' יש-לי סוד! '))
  assert.ok(sameMessage('שלום', 'שלומ'))
  assert.ok(!sameMessage('שלום', 'שלו'))
  assert.ok(!sameMessage('', ''))
})

test('messages wrap between words and keep every letter', () => {
  const rows = messageRows('כל המטמון קבור מתחת לעץ הזית', 'atbash', 1, 15)
  assert.ok(rows.length >= 2)
  for (const row of rows) {
    assert.ok(row.length <= 15)
    assert.notEqual(row[0], null)
    assert.notEqual(row[row.length - 1], null)
  }
  assert.equal(rows.flat().filter(Boolean).length, 'כלהמטמוןקבורמתחתלעץהזית'.length)
})

test('every mission has a unique id, a known cipher and a hint', () => {
  assert.equal(new Set(MISSIONS.map(m => m.id)).size, MISSIONS.length)
  for (const m of MISSIONS) {
    assert.ok(CIPHERS.some(c => c.id === m.cipher), m.id)
    assert.ok(m.hint, m.id)
    assert.match(m.answer, /^[א-ת ]+$/, m.id)
  }
})

test('every sheet can be solved and fits one page', () => {
  assert.equal(new Set(SHEETS.map(s => s.id)).size, SHEETS.length)
  for (const s of SHEETS) {
    const rows = s.messages.flatMap(m => messageRows(m, s.cipher, s.key))
    assert.ok(rows.length <= 9, s.id)
    for (const m of s.messages) {
      assert.match(m, /^[א-ת ]+$/, m)
      assert.equal(decode(s.cipher, encode(s.cipher, m, s.key), s.key), m)
    }
  }
  const tanakh = SHEETS.find(s => s.tanakh).tanakh
  assert.equal(decode('atbash', tanakh.code), tanakh.answer)
})

test('the kindergarten words use only letters from the shape key', () => {
  const known = SHAPE_KEY.map(k => k.letter)
  assert.equal(new Set(SHAPE_KEY.map(k => k.shape)).size, SHAPE_KEY.length)
  for (const w of SHAPE_WORDS) for (const c of w) assert.ok(known.includes(c), w)
  for (const l of known) assert.ok(SHAPE_WORDS.some(w => w.includes(l)), l)
})
