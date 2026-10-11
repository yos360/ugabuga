// /typing: keyboard layout completeness, WPM/accuracy math, lessons only use learned keys
import { test } from 'node:test'
import assert from 'node:assert/strict'
const D = await import('../src/typing/typingData.js')
const E = await import('../src/typing/typingEngine.js')
const { LAYOUTS, HEBREW_LETTERS, FINGERS, FINGER_OF, LESSONS_HE, LESSONS_EN, HE_WORDS, EN_WORDS, PASSAGES_HE } = D

test('every Hebrew letter has a key and a finger on the Israeli layout', () => {
  assert.equal(HEBREW_LETTERS.length, 27)
  for (const ch of HEBREW_LETTERS) {
    const key = D.keyFor(LAYOUTS.he, ch)
    assert.ok(key, `no key for ${ch}`)
    assert.ok(FINGERS[key.finger], `no finger for ${ch}`)
    assert.equal(key.shift, false, `${ch} should not need Shift`)
  }
})

test('SI-1452 positions: home row and a few anchors', () => {
  const home = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'].map(c => LAYOUTS.he.byCode[c].base).join('')
  assert.equal(home, 'שדגכעיחלךף')
  assert.equal(LAYOUTS.he.byCode.KeyE.base, 'ק')
  assert.equal(LAYOUTS.he.byCode.KeyT.base, 'א')
  assert.equal(LAYOUTS.he.byCode.Comma.base, 'ת')
  assert.equal(LAYOUTS.he.byCode.Slash.base, '.')
  assert.equal(LAYOUTS.he.byCode.Quote.base, ',')
  assert.equal(D.keyFor(LAYOUTS.he, 'כ').finger, 'LI')
  assert.equal(D.keyFor(LAYOUTS.he, 'ח').finger, 'RI')
  assert.equal(D.keyFor(LAYOUTS.he, 'ש').finger, 'LP')
  assert.equal(D.keyFor(LAYOUTS.he, ' ').finger, 'TH')
})

test('every key on both layouts has a finger; shifted chars use the other hand', () => {
  for (const layout of Object.values(LAYOUTS)) {
    for (const code of Object.keys(layout.byCode)) assert.ok(FINGER_OF[code], code)
    for (const ch of Object.keys(layout.byChar)) {
      const k = D.keyFor(layout, ch)
      if (k.shift) assert.notEqual(FINGERS[k.finger].hand, k.shiftCode === 'ShiftLeft' ? 'L' : 'R', ch)
    }
  }
  for (const c of 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,?!') assert.ok(D.keyFor(LAYOUTS.en, c), c)
})

test('typed character resolves from Hebrew OS layout and from English physical keys', () => {
  const he = LAYOUTS.he
  assert.equal(E.resolveTyped({ key: 'ש', code: 'KeyA' }, he), 'ש')
  assert.equal(E.resolveTyped({ key: 'a', code: 'KeyA' }, he), 'ש')
  assert.equal(E.resolveTyped({ key: ',', code: 'Comma' }, he), 'ת') // English OS, the ת key
  assert.equal(E.resolveTyped({ key: ',', code: 'Quote' }, he), ',') // Hebrew OS, comma key
  assert.equal(E.resolveTyped({ key: "'", code: 'Quote' }, he), ',') // English OS, comma key
  assert.equal(E.resolveTyped({ key: '?', code: 'Slash', shiftKey: true }, he), '?')
  assert.equal(E.resolveTyped({ key: ' ', code: 'Space' }, he), ' ')
  assert.equal(E.resolveTyped({ key: '7', code: 'Digit7' }, he), '7')
  assert.equal(E.resolveTyped({ key: 'ס', code: '' }, he), 'ס') // phone keyboard: no code
  const en = LAYOUTS.en
  assert.equal(E.resolveTyped({ key: 'ש', code: 'KeyA' }, en), 'a')
  assert.equal(E.resolveTyped({ key: 'A', code: 'KeyA', shiftKey: true }, en), 'A')
  assert.equal(E.resolveTyped({ key: 'ת', code: 'Comma' }, en), ',')
  assert.equal(E.resolveTyped({ key: 'Shift', code: 'ShiftLeft', shiftKey: true }, en), null)
})

test('WPM and accuracy math', () => {
  assert.equal(E.wpm(250, 60000), 50)
  assert.equal(E.wpm(100, 30000), 40)
  assert.equal(E.wpm(0, 60000), 0)
  assert.equal(E.wpm(50, 0), 0)
  assert.equal(E.accuracy(95, 100), 95)
  assert.equal(E.accuracy(0, 0), 100)
  assert.equal(E.accuracy(2, 3), 67)
  assert.equal(E.starsFor(20, 98, 15), 3)
  assert.equal(E.starsFor(10, 98, 15), 2)
  assert.equal(E.starsFor(30, 80, 15), 1)
})

function checkTrack(lessons, words, layout) {
  for (let i = 0; i < lessons.length; i++) {
    const allowed = E.allowedChars(lessons, i)
    const lesson = lessons[i]
    // fixed material may only use introduced keys
    for (const line of [...(lesson.lines || []), ...(lesson.words ? [lesson.words] : [])])
      for (const c of line) assert.ok(allowed.has(c), `${lesson.id}: "${c}" not introduced yet in "${line}"`)
    for (let s = 1; s <= 40; s++) {
      const text = E.lessonText(lessons, i, words, layout, E.mulberry32(s * 7919 + i))
      assert.ok(text.length >= 15, `${lesson.id} text too short: ${text}`)
      for (const c of text) assert.ok(allowed.has(c), `${lesson.id}: "${c}" not introduced yet in "${text}"`)
      assert.ok(!/ {2}|^ | $/.test(text), `${lesson.id}: spacing "${text}"`)
      for (const k of lesson.keys.filter(k => layout.letterRe.test(k))) if (lesson.kind === 'keys') assert.ok(text.includes(k), `${lesson.id} never drills ${k}`)
      if (layout.id === 'he') for (const w of text.split(/[ .,?!]+/)) assert.doesNotMatch(w.slice(0, -1), /[ךםןףץ]/, `${lesson.id}: final letter mid-word "${w}"`)
    }
  }
  // by the end, every letter of the alphabet was introduced exactly once
  const introduced = lessons.flatMap(l => l.keys).filter(k => /^[a-zא-ת]$/.test(k))
  assert.equal(new Set(introduced).size, introduced.length)
}
test('Hebrew lessons only use keys introduced so far', () => {
  checkTrack(LESSONS_HE, HE_WORDS, LAYOUTS.he)
  const letters = new Set(LESSONS_HE.flatMap(l => l.keys))
  for (const ch of HEBREW_LETTERS) assert.ok(letters.has(ch), `lesson never teaches ${ch}`)
})
test('English lessons only use keys introduced so far', () => {
  checkTrack(LESSONS_EN, EN_WORDS, LAYOUTS.en)
  const letters = new Set(LESSONS_EN.flatMap(l => l.keys))
  for (const ch of 'abcdefghijklmnopqrstuvwxyz') assert.ok(letters.has(ch), `lesson never teaches ${ch}`)
})

test('home-row lessons have real words to practise', () => {
  const idx = LESSONS_HE.findIndex(l => l.id === 'he-6')
  const allowed = E.allowedChars(LESSONS_HE, idx)
  assert.ok(HE_WORDS.filter(w => [...w].every(c => allowed.has(c))).length >= 25)
})

test('word bank: Hebrew letters only, final letters only at the end', () => {
  for (const w of HE_WORDS) {
    assert.match(w, /^[א-ת]+$/, w)
    assert.doesNotMatch(w.slice(0, -1), /[ךםןףץ]/, w)
    assert.doesNotMatch(w.slice(-1), /[כמנפצ]/, w)
  }
})

test('speed-test passages: 20+, original, typeable on the Hebrew layout', () => {
  assert.ok(PASSAGES_HE.length >= 20)
  assert.equal(new Set(PASSAGES_HE).size, PASSAGES_HE.length)
  for (const p of PASSAGES_HE) {
    assert.ok(p.length >= 120, p.slice(0, 20))
    assert.ok(E.typeable(p, LAYOUTS.he), p.slice(0, 30) + ' has an untypeable char: ' + [...p].filter(c => !(c in LAYOUTS.he.byChar)).join(''))
    for (const w of p.split(/[\s.,?!]+/).filter(Boolean)) if (/^[א-ת]+$/.test(w)) assert.doesNotMatch(w.slice(0, -1), /[ךםןףץ]/, w)
  }
})
