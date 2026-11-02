// /tools/keyboard-fix: SI-1452 key maps, smart edges, auto-detection and forced conversion
import { test } from 'node:test'
import assert from 'node:assert/strict'
const K = await import('../src/office/keys/keyboardLogic.js')
const fix = (t, m) => K.fixText(t, m).text

test('maps are inverse and cover the Hebrew alphabet', () => {
  const heLetters = 'אבגדהוזחטיכךלמםנןסעפףצץקרשת'
  for (const c of heLetters) assert.ok(K.HE_TO_EN[c], c)
  for (const [en, he] of Object.entries(K.EN_TO_HE)) assert.equal(K.HE_TO_EN[he], en)
  assert.equal(K.mapChars('akuo', 'toHe'), 'שלום')
  assert.equal(K.mapChars('AKUO', 'toHe'), 'שלום')
  assert.equal(K.mapChars('יקךךם', 'toEn'), 'hello')
})

test('English layout → Hebrew (auto)', () => {
  const cases = [
    ['akuo', 'שלום'],
    ['NX,HR T, VKJHMV', 'מסתיר את הלחיצה'],
    ['nv akunl', 'מה שלומך'],
    [',usv rcv', 'תודה רבה'],
    ['huo vuks, anj', 'יום הולדת שמח'],
    ['tbh tuvc kknus', 'אני אוהב ללמוד'],
    ['nv eurv', 'מה קורה'],
    ['tni', 'אמן'],
    ['nx,hr', 'מסתיר'],
    ['ckh', 'בלי'],
    ['vhuo', 'היום'],
  ]
  for (const [inp, want] of cases) assert.equal(fix(inp), want, inp)
})

test('English layout → Hebrew: punctuation at the edges', () => {
  assert.equal(fix("akuo' nv akunl/"), 'שלום, מה שלומך.')
  assert.equal(fix('akuo, nv akunl?'), 'שלום, מה שלומך?')
  assert.equal(fix('nv, '), 'מה, ')
  assert.equal(fix('tr.'), 'ארץ')
  assert.equal(fix('akuo...'), 'שלום...')
  assert.equal(fix('(akuo)'), '(שלום)')
})

test('Hebrew layout → English (auto)', () => {
  const cases = [
    ['יקךךם', 'hello'],
    ['ןמ', 'in'],
    ['איק', 'the'],
    ["יקךךם 'םרךג", 'hello world'],
    ['אישמל טםו', 'thank you'],
    ['יקךךםץ', 'hello.'],
    ["'ישא ןד טםור משצק", 'what is your name'],
    ['ן ךםהק טםו', 'I love you'],
    ['עםםג צםרמןמע', 'good morning'],
  ]
  for (const [inp, want] of cases) assert.equal(fix(inp), want, inp)
})

test('correct text stays as it is', () => {
  const ok = [
    'The quick brown fox jumps over the lazy dog',
    'אני אוהב ללמוד מתמטיקה',
    'שלום, מה שלומך?',
    'I love ישראל',
    'Hello שלום',
    'אתמול הלכנו לים עם סבא וסבתא.',
    'see you tomorrow at school',
    'גם אני',
    'to be or not to be',
    'https://ugabuga.co.il',
    'mail me: a@b.com',
    'USA and UK',
    '123 456',
    '',
  ]
  for (const t of ok) assert.equal(fix(t), t, t)
})

test('mixed text: only the wrong words change', () => {
  assert.equal(fix('שלום akuo'), 'שלום שלום')
  assert.equal(fix('hello יקךךם'), 'hello hello')
  assert.equal(fix('אני רוצה ,usv rcv'), 'אני רוצה תודה רבה')
  const r = K.fixText('שלום akuo')
  assert.equal(r.changed, 1)
  assert.equal(r.direction, 'toHe')
  assert.deepEqual(r.segments, [{ text: 'שלום ', changed: false }, { text: 'שלום', changed: true }])
})

test('forced conversion converts every word of that script', () => {
  assert.equal(fix('to go', 'toHe'), 'אם עם')
  assert.equal(fix('גם אם', 'toEn'), 'do to')
  assert.equal(fix('שלום akuo', 'toEn'), 'akuo akuo')
  assert.equal(K.mainScript('akuo שלום שלום'), 'toEn')
  assert.equal(K.mainScript('abc'), 'toHe')
  assert.equal(K.mainScript('123'), null)
})

test('whitespace and new lines are preserved', () => {
  assert.equal(fix('akuo\n\nnv akunl  '), 'שלום\n\nמה שלומך  ')
  assert.equal(fix('\takuo'), '\tשלום')
})

test('scores separate real words from layout gibberish', () => {
  assert.ok(K.scoreHebrew('שלום') > K.scoreHebrew('יקךךם') + 3)
  assert.ok(K.scoreEnglish('hello') > K.scoreEnglish('akuo') + 2)
})
