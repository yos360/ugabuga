// Escape rooms (holidays, classroom, teens): every story step has medium/hard variants, so switching the
// level changes the puzzles from the very first question. Numeric answers are recomputed here, logic
// puzzles are brute-forced for a unique solution, and final codes are rebuilt from the earlier answers.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildEscapeAdventure } from '../src/data/escapeAdventure.js'
import { HOLIDAY_ESCAPE_ROOMS } from '../src/data/escapeNew/holidays.js'
import { CLASSROOM_ESCAPE_ROOMS } from '../src/data/escapeNew/classroom.js'
import { TEEN_ESCAPE_ROOMS } from '../src/data/escapeNew/teens.js'

const ROOMS = [...HOLIDAY_ESCAPE_ROOMS, ...CLASSROOM_ESCAPE_ROOMS, ...TEEN_ESCAPE_ROOMS]
const LEVELS = ['easy', 'medium', 'hard']
const byId = Object.fromEntries(ROOMS.map(r => [r.id, r]))
// answer of step i (0-based) at a level
const ans = (id, level, i) => {
  const step = byId[id].steps[i]
  return level === 'easy' ? step.answer : (step.levels[level].answer ?? step.answer)
}
const num = (id, level, i) => Number(ans(id, level, i))

test('every story step in these rooms has distinct medium and hard variants', () => {
  assert.equal(ROOMS.length, 21)
  for (const room of ROOMS) {
    for (const [i, step] of room.steps.entries()) {
      const where = `${room.id} #${i + 1}`
      assert.ok(step.levels?.medium && step.levels?.hard, `${where}: missing variants`)
      const qs = [step.question, step.levels.medium.question, step.levels.hard.question]
      assert.equal(new Set(qs).size, 3, `${where}: questions must differ between levels`)
      for (const lv of ['medium', 'hard']) {
        const v = step.levels[lv]
        assert.ok(String(v.answer ?? step.answer).trim(), `${where} ${lv}: empty answer`)
        assert.ok(v.hint || v.hints, `${where} ${lv}: needs its own hint`)
        assert.ok(!JSON.stringify(v).includes('undefined'), `${where} ${lv}: "undefined" in text`)
      }
    }
  }
})

test('buildEscapeAdventure: the first question changes with the level, and nothing is undefined', () => {
  for (const room of ROOMS) {
    const built = LEVELS.map(level => buildEscapeAdventure(room, level, 0))
    const firstQs = built.map(b => b.steps[0].question)
    assert.equal(new Set(firstQs).size, 3, `${room.id}: first question identical across levels`)
    for (const [li, b] of built.entries()) {
      const story = room.steps.length
      // story steps: all but the last come first, the room's final step closes the adventure
      const storySteps = [...b.steps.slice(0, story - 1), b.steps.at(-1)]
      for (const [i, s] of storySteps.entries()) {
        assert.equal(String(s.answer), String(ans(room.id, LEVELS[li], i)), `${room.id} ${LEVELS[li]} #${i + 1}`)
        assert.ok(String(s.answer).trim(), `${room.id} ${LEVELS[li]}: empty answer`)
        assert.ok(Array.isArray(s.hints) && s.hints.length, `${room.id} ${LEVELS[li]}: no hints`)
      }
      for (const s of b.steps) {
        for (const k of ['title', 'story', 'question', 'answer']) {
          assert.ok(!String(s[k]).includes('undefined'), `${room.id} ${LEVELS[li]}: undefined in ${k}`)
        }
        assert.ok(!s.hints.some(h => String(h).includes('undefined')), `${room.id} ${LEVELS[li]}: undefined in hints`)
      }
    }
  }
})

test('variant hints never open with the bare answer', () => {
  for (const room of ROOMS) {
    for (const level of ['medium', 'hard']) {
      const b = buildEscapeAdventure(room, level, 0)
      for (const s of [...b.steps.slice(0, room.steps.length - 1), b.steps.at(-1)]) {
        assert.notEqual(String(s.hints[0]).trim(), String(s.answer).trim(), `${room.id} ${level}`)
      }
    }
  }
})

// ---- numeric recomputation ----
const sumTo = n => (n * (n + 1)) / 2
const gem = { א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9, י: 10, כ: 20, ך: 20, ל: 30, מ: 40, ם: 40, נ: 50, ן: 50, ס: 60, ע: 70, פ: 80, ף: 80, צ: 90, ץ: 90, ק: 100, ר: 200, ש: 300, ת: 400 }
const g = w => [...w].reduce((s, ch) => s + (gem[ch] || 0), 0)
const ceil = (a, b) => Math.ceil(a / b)
const nextBy = (seq, f) => f(seq.at(-1), seq.length, seq)
const egypt = s => [...s].reduce((t, ch) => t + ({ '🪷': 1000, '🌀': 100, '∩': 10, '|': 1 }[ch] || 0), 0)
const fromBin = s => parseInt(s, 2)

const EXPECTED = {
  'hanukkah-oil-jar': {
    medium: [6 + 1, sumTo(8) + 8, g('נגהש'), 30 - 25 + 1],
    hard: [(6 - 1) + 3 + 1, 2 * (sumTo(8) + 8), g('נגהש') - g('נגהפ'), 8 - (29 - 25 + 1)],
  },
  'purim-megillah-mixup': {
    medium: [g('אסתר'), 12 * 2 * 3, 42315, 167 * 2],
    hard: [g('מרדכי') - g('המן'), 12 * 2 * 3 + 5 * 2, 245361, (10 - 3) + (10 - 2)],
  },
  'pesach-afikoman-heist': {
    medium: [6 * 4, 9 + 3 - 5, ceil(10 * 4, 8), 2 * 3],
    hard: [3 * 2 + 4 * 4, 8 * 2 - 6, ceil(13 * 4, 8), 3 * 3 + 2],
  },
  'rosh-hashana-shofar': {
    medium: [g('שנהטובה'), (1 + 3 + 1) + (1 + 9 + 1), 1 + 9 + 5, ceil(7 * 3, 8)],
    hard: [g('תשרי') - g('שופר'), (1 + 3 + 9 + 1) + (1 + 3 + 1) + (1 + 9 + 1), 1 + 9 + 5 + 6, ceil(9 * 2 + 4, 6)],
  },
  'sukkot-sukkah-storm': {
    medium: [2 * 7, (15 / 3) * 2, 7 * 3, 'ערבה'],
    hard: [3 * 7 - 1, Math.floor(14 / 4) * 2 + 1 /* items 13–14: pomegranate, star */, 7 * 3 - 2, 'לולב'],
  },
  'tu-bishvat-seeds': {
    medium: [9 + 6 - 1, ['תאנה', 'ענבים', 'זית', 'תמר'].length, 6 * 5, 2 ** 5],
    hard: [9 + 6 + 7, ['רימון', 'צימוקים', 'תאנים', 'תמרים', 'זיתים'].length, 6 * 5 - 4, 1 + Math.ceil(Math.log2(101))],
  },
  'independence-day-flag': {
    medium: [1948 + 100, 2 * 6 + 2, g('תשפג'), 'לבן'],
    hard: [(1948 + 75) - (1948 - 12), (3 + 3 + 6) * 2, g('תשפג') - g('תשח'), 'כחול'],
  },
  'geometry-temple': {
    medium: [5 + 6 + 8, 2 * (13 + 9), 12 * 9, 180 - 35 - 85],
    hard: [2 * 6 + 3 * 3 + 8, 2 * (8 + 48 / 8) - 3, (12 - 2) * (9 - 2), (180 - 50) / 2],
  },
  'israel-map-quest': {
    medium: ['ירושלים', 800 + 430, 'צפון', 'כנרת'],
    hard: ['ירושלים', (800 + 430) / 410, 'מזרח', 'ירדן'],
  },
  'time-machine': {
    medium: [1969 - 1927, 42971, 1969 - 93 + 3],
    hard: [(1969 - 1903) - (2000 - 1969), 423951, 1969 - 214 + 14],
  },
  'ocean-submarine': {
    medium: [2 * (8 + 3), 'דולפין', 5 * 8 + 6 * 5, 'לווייתן כחול'],
    hard: [(27 / 3) * 8, ['דולפין', 'כלב ים', 'לווייתן'].length, (47 - 7 * 5) / (8 - 5), 30 / 6],
  },
  'museum-heist': {
    medium: [25 - 8 + 13 - 11 + 6, 'סדנה', 3],
    hard: [9 + 21 - 14, 'סדנה', 5],
  },
  'math-olympics': {
    medium: [9 * 12 - 15, nextBy([2, 6, 18, 54], x => x * 3), ceil(5 * 9, 6), 72],
    hard: [9 * 12 - 15 * 3, nextBy([1, 3, 7, 15, 31], x => 2 * x + 1), ceil(6 * 11 + 4, 8), 43],
  },
  'haunted-house-comedy': {
    medium: [(23 * 60 + 30 + 50) - 24 * 60, (22 - 2 * 7) / 2, 'טונה', 3],
    hard: [(23 * 60 + 15 + 80) - 24 * 60, ((24 - 2) - 2 * (8 - 1)) / 2, 'טונה', 5],
  },
  'cyber-hacker': {
    medium: [fromBin('1101011'), 'lock', 697, nextBy([3, 4, 7, 16, 43], x => 3 * x - 5)],
    hard: [fromBin('10110111'), 'code', 3816, nextBy([1, 2, 6, 15, 31, 56], (x, n) => x + n * n)],
  },
  'egypt-tomb': {
    medium: ['רעמסס', (27 - 12) / 3, 2, egypt('🪷🌀🌀🌀∩∩|||||||')],
    hard: ['פרעה', (47 - 5) / 6, 2, egypt('|∩🪷∩🌀||∩🪷🌀∩|🌀∩')],
  },
  'comedy-bank-heist': {
    medium: ['מוטי', 2681, Math.ceil(Math.log(27) / Math.log(3) - 1e-9), (135 - 18 * 5) / 5],
    hard: ['מוטי', 4268, Math.ceil(Math.log(80) / Math.log(3)), (107 - 100)],
  },
  'office-team-building': {
    medium: [5, g('שיתוף'), 'מקלדת', nextBy([2, 5, 7, 12, 19, 31], (x, n, s) => s.at(-1) + s.at(-2))],
    hard: [3, g('עבודת') + g('צוות'), 'שם', nextBy([1, 1, 2, 4, 7, 13, 24], (x, n, s) => s.at(-1) + s.at(-2) + s.at(-3))],
  },
  'lost-wedding-ring': {
    medium: ['מירי', 57, 'עוגה', (18 + 14) + 5],
    hard: ['מירי', 47, 'עוגה', (5 + 8 + 11) + 14 - 3],
  },
  'escape-the-classroom-exam': {
    medium: [nextBy([2, 5, 11, 23, 47], x => 2 * x + 1), 'ספרייה', Math.abs((3 * 30 + 30 * 0.5) - 30 * 6), 'מאיה'],
    hard: [nextBy([1, 2, 6, 24, 120], (x, n) => x * (n + 1)), 'ספרייה', Math.abs((3 * 30 + 40 * 0.5) - 40 * 6), 'מאיה'],
  },
}

test('variant answers match an independent recomputation', () => {
  for (const [id, levels] of Object.entries(EXPECTED)) {
    for (const [level, values] of Object.entries(levels)) {
      values.forEach((v, i) => assert.equal(ans(id, level, i), String(v), `${id} ${level} #${i + 1}`))
    }
  }
})

test('final codes are built from that level\'s own earlier answers', () => {
  const cat = (id, level, ...idx) => idx.map(i => ans(id, level, i)).join('')
  for (const level of LEVELS) {
    const last = id => ans(id, level, byId[id].steps.length - 1)
    assert.equal(last('hanukkah-oil-jar'), level === 'hard' ? cat('hanukkah-oil-jar', level, 3, 0) : cat('hanukkah-oil-jar', level, 0, 3))
    assert.equal(last('purim-megillah-mixup'), cat('purim-megillah-mixup', level, 0, 3))
    assert.equal(last('pesach-afikoman-heist'), cat('pesach-afikoman-heist', level, 1, 2))
    assert.equal(last('rosh-hashana-shofar'), cat('rosh-hashana-shofar', level, 1, 2))
    assert.equal(last('sukkot-sukkah-storm'), cat('sukkot-sukkah-storm', level, 0, 2))
    assert.equal(last('tu-bishvat-seeds'), cat('tu-bishvat-seeds', level, 0, 1))
    assert.equal(last('independence-day-flag'), cat('independence-day-flag', level, 1, 2))
    assert.equal(last('english-secret-agent'), [0, 1, 2, 3].map(i => ans('english-secret-agent', level, i)[0]).join(''))
    assert.equal(last('english-secret-agent'), 'code') // the final message announces "code"
    assert.equal(last('geometry-temple'), cat('geometry-temple', level, 3, 0))
    assert.equal(last('time-machine'), ans('time-machine', level, 0) + ans('time-machine', level, 2).slice(-2))
    assert.equal(last('ocean-submarine'), cat('ocean-submarine', level, 0, 2))
    assert.equal(last('museum-heist'), cat('museum-heist', level, 0, 2))
    assert.equal(num('math-olympics', level, 4), num('math-olympics', level, 0) + num('math-olympics', level, 3))
    assert.equal(last('haunted-house-comedy'), cat('haunted-house-comedy', level, 0, 1, 3))
    assert.equal(last('cyber-hacker'), (num('cyber-hacker', level, 0) + num('cyber-hacker', level, 3)).toString(2))
    assert.equal(num('egypt-tomb', level, 4), num('egypt-tomb', level, 3) - num('egypt-tomb', level, 1) * num('egypt-tomb', level, 2))
    assert.equal(num('comedy-bank-heist', level, 4), num('comedy-bank-heist', level, 1) + num('comedy-bank-heist', level, 2) * num('comedy-bank-heist', level, 3))
    assert.equal(last('office-team-building'), cat('office-team-building', level, 0, 3, 1))
    assert.equal(last('office-team-building').length, 6)
    assert.equal(num('lost-wedding-ring', level, 4), num('lost-wedding-ring', level, 1) + num('lost-wedding-ring', level, 3))
    assert.ok(num('lost-wedding-ring', level, 4) < 100)
    assert.equal(last('escape-the-classroom-exam'), cat('escape-the-classroom-exam', level, 0, 2))
  }
  // israel-map-quest: letter counts
  assert.equal(ans('israel-map-quest', 'medium', 4), `${'יםהמלח'.length}${'כנרת'.length}`)
  assert.equal(ans('israel-map-quest', 'hard', 4), `${ans('israel-map-quest', 'hard', 1)}${'ירדן'.length}${'אילת'.length}`)
  // the stories keep their culprits / places that the final messages rely on
  for (const level of LEVELS) {
    assert.equal(ans('egypt-tomb', level, 2), '2')
    assert.equal(ans('comedy-bank-heist', level, 0), 'מוטי')
    assert.equal(ans('lost-wedding-ring', level, 0), 'מירי')
    assert.equal(ans('escape-the-classroom-exam', level, 3), 'מאיה')
    assert.equal(ans('escape-the-classroom-exam', level, 1), 'ספרייה')
    assert.equal(ans('haunted-house-comedy', level, 1), '4')
    assert.equal(ans('haunted-house-comedy', level, 2), 'טונה')
    assert.equal(ans('museum-heist', level, 1), 'סדנה')
  }
})

// ---- ciphers ----
const HEB = 'אבגדהוזחטיכלמנסעפצקרשת'
const FINAL = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }
const norm = w => [...w].map(c => FINAL[c] || c).join('')
const shiftHeb = (w, k) => [...norm(w)].map(c => HEB[(HEB.indexOf(c) + k + 22) % 22]).join('')
const atbash = w => [...norm(w)].map(c => HEB[21 - HEB.indexOf(c)]).join('')
const shiftEn = (w, k) => [...w.toUpperCase()].map(c => String.fromCharCode(65 + ((c.charCodeAt(0) - 65 + k + 26) % 26))).join('')
const quoted = (text, re = /"([^"]+)"/) => text.match(re)[1]

test('ciphers decode to the stated answers', () => {
  const st = (id, level, i) => byId[id].steps[i].levels[level].story
  assert.equal(quoted(st('independence-day-flag', 'medium', 3)), shiftHeb('לבן', 2))
  assert.equal(quoted(st('independence-day-flag', 'hard', 3)), shiftHeb('כחול', 3))
  assert.equal(quoted(st('israel-map-quest', 'hard', 0)), shiftHeb('ירושלים', 1))
  assert.equal(quoted(st('haunted-house-comedy', 'medium', 2)), atbash('טונה'))
  assert.equal(quoted(st('haunted-house-comedy', 'hard', 2)), [...atbash('טונה')].reverse().join(''))
  assert.equal(quoted(st('lost-wedding-ring', 'hard', 2)), shiftHeb('עוגה', 1))
  assert.equal(quoted(st('escape-the-classroom-exam', 'medium', 1)), shiftHeb('ספרייה', 2))
  assert.equal(quoted(st('escape-the-classroom-exam', 'hard', 1)), atbash('ספרייה'))
  assert.match(st('cyber-hacker', 'medium', 1), new RegExp(shiftEn('lock', 4)))
  const k = [...ans('cyber-hacker', 'hard', 0)].reduce((s, d) => s + Number(d), 0)
  assert.match(st('cyber-hacker', 'hard', 1), new RegExp(shiftEn('code', k)))
  // scrambles use exactly the answer's letters (plus the stated extra letter)
  const sorted = s => [...norm(s)].sort().join('')
  assert.equal(sorted('לישוםיר'), sorted('ירושלים'))
  assert.equal(sorted('תרנכ'), sorted('כנרת'))
  assert.equal(sorted('בהער'), sorted('ערבה'))
  assert.equal(sorted('בלאול'), sorted('לולבא'))
  assert.equal(sorted('שגועה'), sorted('עוגהש'))
  assert.equal([...'KCUD'].sort().join(''), [...'DUCK'].sort().join(''))
  assert.equal([...'YEKNOD'].sort().join(''), [...'DONKEY'].sort().join(''))
})

// ---- logic puzzles: brute force for a unique solution ----
const perms = a => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p])))
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const mm = (code, guess) => {
  let a = 0, b = 0
  for (let i = 0; i < guess.length; i++) { if (guess[i] === code[i]) a++; else if (code.includes(guess[i])) b++ }
  return [a, b]
}
const distinctCodes = len => range(0, 10 ** len - 1).map(n => String(n).padStart(len, '0')).filter(c => new Set(c).size === len)

test('logic puzzles have exactly one solution, and it is the stated answer', () => {
  // haunted: rooms
  assert.deepEqual(range(1, 5).filter(r => [r === 2, r !== 2, r !== 3, r === 1 || r === 5].filter(Boolean).length === 1), [3])
  assert.deepEqual(range(1, 6).filter(r => [r % 2 === 1, r > 2, r === 3 || r === 6, r === 6].filter(Boolean).length === 2), [5])
  // cyber: mastermind
  const solveMM = (len, clues) => distinctCodes(len).filter(c => clues.every(([gs, a, b]) => mm(c, gs).join() === [a, b].join()))
  assert.deepEqual(solveMM(3, [['147', 1, 0], ['189', 0, 1], ['964', 0, 2], ['523', 0, 0], ['286', 0, 1]]), ['697'])
  assert.deepEqual(solveMM(4, [['5678', 0, 2], ['9012', 1, 0], ['2468', 0, 2], ['6321', 0, 3]]), ['3816'])
  // egypt: chests
  assert.deepEqual(range(1, 4).filter(t => [t !== 1, t === 3 || t === 4, t === 1, t !== 2].filter(Boolean).length === 1), [2])
  assert.deepEqual(range(1, 5).filter(t => [t !== 1, t !== 5, t > 2, t === 3 || t === 4, t === 4 || t === 5].filter(Boolean).length === 2), [2])
  // egypt: pyramids
  const top = row => (row.length === 1 ? row[0] : top(row.slice(1).map((x, i) => x + row[i])))
  assert.deepEqual(range(0, 50).filter(x => top([2, x, 3, 1]) === 27), [5])
  assert.deepEqual(range(0, 50).filter(x => top([3, x, x, 2]) === 47), [7])
  // bank: who holds the key
  const N4 = ['דובי', 'שוקי', 'מוטי', 'רוני']
  const med = perms(['key', 'torch', 'sand', 'map']).filter(([d, s, m, r]) => d !== 'key' && d !== 'map' && (s === 'sand' || s === 'map') && m !== 'map' && m !== 'torch' && s !== 'sand' && r !== 'sand' && r !== 'key')
  assert.equal(med.length, 1)
  assert.equal(N4[med[0].indexOf('key')], 'מוטי')
  const N5 = ['דובי', 'שוקי', 'מוטי', 'רוני', 'קובי']
  const hard = perms(['key', 'torch', 'sand', 'map', 'rope']).filter(a => {
    const [d, s, , r, k] = a
    const who = it => N5[a.indexOf(it)]
    return d !== 'key' && d !== 'rope' && !['שוקי', 'מוטי'].includes(who('torch')) && (r === 'map' || r === 'rope') &&
      !['key', 'map', 'rope'].includes(k) && who('sand') !== 'דובי' && s !== 'map' && !['רוני', 'מוטי'].includes(who('rope'))
  })
  assert.equal(hard.length, 1)
  assert.equal(N5[hard[0].indexOf('key')], 'מוטי')
  // bank: dial codes
  const digits4 = f => distinctCodes(4).filter(c => f([...c].map(Number)))
  const sum = d => d.reduce((x, y) => x + y, 0)
  assert.deepEqual(digits4(d => !d.includes(0) && d[0] === 2 * d[3] && d[2] === d[0] + d[1] && d[1] > d[0] && sum(d) === 17), ['2681'])
  assert.deepEqual(digits4(d => d[3] === d[0] * d[1] && d[2] === d[1] + 4 && sum(d) === 20), ['4268'])
  // bank: coins with three kinds
  const coins = []
  for (let a = 0; a <= 20; a++) for (let b = 0; a + b <= 20; b++) { const t = 20 - a - b; if (a === t && a + 5 * b + 10 * t === 107) coins.push(t) }
  assert.deepEqual(coins, [7])
  // office: floors
  const fm = perms([1, 2, 3, 4, 5]).filter(([a, b, gl, d, h]) => a === d + 1 && gl === 2 && b < gl && h !== 5)
  assert.deepEqual(fm.map(p => p[0]), [5])
  const fh = perms([1, 2, 3, 4, 5, 6]).filter(([a, b, gl, d, h, v]) => a === d + 2 && v === gl + 1 && h % 2 === 0 && b === 6 && gl > a)
  assert.deepEqual(fh.map(p => p[0]), [3])
  // wedding: who took the ring
  const W = ['דוד', 'מירי', 'לאה', 'יוסי', 'תמר']
  const liars = (says, n) => W.filter(x => says(x).filter(v => !v).length === n)
  assert.deepEqual(liars(x => [x === 'מירי' || x === 'תמר', x === 'לאה', x !== 'יוסי', x !== 'לאה', x !== 'תמר'], 1), ['מירי'])
  assert.deepEqual(liars(x => { const d = x === 'מירי' || x === 'יוסי'; return [d, x !== 'תמר', x === 'דוד' || x === 'יוסי', !d, x !== 'לאה'] }, 2), ['מירי'])
  // wedding: table numbers
  assert.deepEqual(range(10, 99).filter(n => n > 30 && n < 60 && n % 2 === 1 && Math.floor(n / 10) + (n % 10) === 12 && n % 13 !== 0), [57])
  assert.deepEqual(range(10, 99).filter(n => { const a = Math.floor(n / 10), b = n % 10; return b * 10 + a - n === 27 && a + b === 11 }), [47])
  // exam: who was in the library (the culprit must be unique, even if the full table is not)
  const P = ['lib', 'caf', 'field', 'lab', 'music']
  const S = ['נועה', 'איתי', 'שחר', 'מאיה', 'רון']
  const libOf = sols => [...new Set(sols.map(p => S[p.indexOf('lib')]))]
  assert.deepEqual(libOf(perms(P).filter(([n, i, s, m, r]) => s === 'lab' && r === 'field' && i !== 'caf' && i !== 'lib' && (n === 'field' || n === 'caf') && m !== 'caf')), ['מאיה'])
  assert.deepEqual(libOf(perms(P).filter(([n, i, s, m, r]) => (r === 'caf' || r === 'field') && (n === 'caf' || n === 'music') &&
    !['lib', 'music', 'caf'].includes(i) && !['lib', 'field', 'music'].includes(s) && !['lab', 'music'].includes(m))), ['מאיה'])
  // museum: suspects
  const hardSuspects = [
    { n: 1, glasses: true, pad: true, coat: 'כחול', out: true },
    { n: 2, glasses: false, pad: true, coat: 'ירוק' },
    { n: 3, glasses: true, pad: true, coat: 'ירוק', out: true },
    { n: 4, glasses: true, pad: false, coat: 'אפור' },
    { n: 5, glasses: true, pad: true, coat: 'צהוב' },
    { n: 6, glasses: true, pad: true, coat: 'אדום' },
  ]
  assert.deepEqual(hardSuspects.filter(s => s.glasses && s.pad && s.coat !== 'אדום' && !s.out).map(s => s.n), [5])
  // math olympics mystery numbers
  assert.deepEqual(range(51, 99).filter(n => n % 4 === 0 && n % 9 === 0), [72])
  assert.deepEqual(range(21, 49).filter(n => n % 5 === 3 && n % 6 === 1), [43])
  // pesach / time machine orderings are consistent with the given dates
  assert.equal(ans('time-machine', 'medium', 1), [[4, -3000], [2, 1450], [9, 1876], [7, 1879], [1, 1969]].sort((a, b) => a[1] - b[1]).map(x => x[0]).join(''))
  assert.equal(ans('time-machine', 'hard', 1), [[4, -3000], [3, 1769], [2, 1450], [9, 1876], [5, 1903], [1, 1969]].sort((a, b) => a[1] - b[1]).map(x => x[0]).join(''))
})
