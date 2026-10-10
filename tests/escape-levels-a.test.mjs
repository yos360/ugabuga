import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildEscapeAdventure, isYoungRoom } from '../src/data/escapeAdventure.js'
import { ESCAPE_ROOMS } from '../src/data/escapeRooms.js'
import { MORE_ESCAPE_ROOMS } from '../src/data/escapeRoomsMore.js'
import { MEGA_ESCAPE_ROOMS } from '../src/data/escapeRoomsMega.js'
import { YOUNG_ESCAPE_ROOMS } from '../src/data/escapeNew/young.js'

const ROOMS = [...ESCAPE_ROOMS, ...MORE_ESCAPE_ROOMS, ...MEGA_ESCAPE_ROOMS, ...YOUNG_ESCAPE_ROOMS]
const LEVELS = ['easy', 'medium', 'hard']
const q = step => step.question || step.prompt || ''

// The room's own story steps after level variants are applied (generated locks are dropped).
function storySteps(room, level) {
  const built = buildEscapeAdventure(room, level, 0)
  const n = room.steps.length
  return [...built.steps.slice(0, n - 1), built.steps.at(-1)]
}

test('every story step has medium and hard variants', () => {
  assert.equal(ROOMS.length, 21)
  for (const room of ROOMS) {
    room.steps.forEach((step, i) => {
      assert.ok(step.levels?.medium, `${room.id} step ${i} medium`)
      assert.ok(step.levels?.hard, `${room.id} step ${i} hard`)
    })
  }
})

test('switching level changes the first question and every story question', () => {
  for (const room of ROOMS) {
    const firsts = LEVELS.map(level => q(buildEscapeAdventure(room, level, 0).steps[0]))
    assert.equal(new Set(firsts).size, 3, `${room.id} first question: ${firsts.join(' | ')}`)
    const byLevel = LEVELS.map(level => storySteps(room, level))
    room.steps.forEach((_, i) => {
      const qs = byLevel.map(steps => q(steps[i]))
      assert.equal(new Set(qs).size, 3, `${room.id} step ${i}: ${qs.join(' | ')}`)
    })
  }
})

test('built adventures have answers, hints and no undefined text', () => {
  for (const room of ROOMS) {
    for (const level of LEVELS) {
      const built = buildEscapeAdventure(room, level, 0)
      assert.ok(!JSON.stringify(built).includes('undefined'), `${room.id} ${level}`)
      for (const step of built.steps) {
        assert.ok(String(step.answer).trim(), `${room.id} ${level} ${step.title} answer`)
        assert.ok(q(step).trim(), `${room.id} ${level} ${step.title} question`)
        assert.ok(step.hints.length >= 1, `${room.id} ${level} ${step.title} hints`)
      }
      // Hand-written variant hints must not reveal the answer in the first hint.
      if (level !== 'easy') {
        storySteps(room, level).forEach((step, i) => {
          const answer = String(step.answer)
          const re = new RegExp(`(^|[^\\d\\u05D0-\\u05EA])${answer}([^\\d\\u05D0-\\u05EA]|$)`)
          assert.ok(!re.test(step.hints[0]), `${room.id} ${level} step ${i} first hint reveals ${answer}`)
        })
      }
    }
  }
})

test('young rooms keep variants free of multiplication signs', () => {
  for (const room of ROOMS.filter(isYoungRoom)) {
    for (const level of ['medium', 'hard']) {
      const text = JSON.stringify(room.steps.map(step => step.levels[level]))
      assert.ok(!/[×*]|כפול/.test(text), `${room.id} ${level}`)
    }
  }
})

// Numeric answers recomputed from the puzzle data.
const letters = word => [...word].length
const EXPECTED = {
  'lost-cake': { medium: [null, 3 + 6, null], hard: [null, 5 + 7, null] },
  'school-lab': { medium: [24 * 2, null, 48 - 13], hard: [30 + 12, null, (42 - 11) * 2] },
  'detective-case': { medium: [null, null, letters('מפה') * 3 + 2], hard: [null, null, (letters('מחר') + 3) * 3] },
  'football-locker-room': { medium: [17 + 4, 1 + 4 + 4 + 2 - 1, 21 + 10], hard: [12 + 5, 11 + 10 + 1, 17 * 2 + 22] },
  'gaming-server': {
    medium: [120 - 45 + 2 * 15 - 8, [9, 14, 18, 21, 26].find(x => x % 2 === 0 && x % 3 === 0), 97 + 18],
    hard: [(150 - 150 / 3 - 27) * 2, [16, 18, 24, 30, 36].find(x => x % 4 === 0 && x % 6 === 0 && x < 30), 146 - 24],
  },
  'space-station': { medium: [null, 8 - 3, 5 * letters('חמה')], hard: [null, 8 * 3 - 2, 22 + letters('שבתאי')] },
  'music-studio': { medium: [90 * 2.5, null, 225 + letters('חליל')], hard: [80 * 2.5 + 160 * 0.5, null, 280 - 88 + letters('פסנתר')] },
  'movie-premiere': { medium: [null, 6 * 8 - 3, 45 + letters('תסריטאי')], hard: [null, 7 * 9 + 9, 72 + 3 * letters('עורך')] },
  'science-lab-safe': { medium: [null, 25 + 12 - 9, 28 + letters('קרח')], hard: [null, -6 + 19 - 8, 5 * 10 + letters('גז')] },
  'adult-party-mystery': { medium: [4 + 2, null, 6 * letters('לחן')], hard: [24 - 24 / 3, null, 16 + 2 * letters('פזמון')] },
  'math-vault': {
    medium: [(23 + 18 + 15) % 10, 14 / 2 - 2, 7, '6' + '5' + '7' + (6 - 5 + 7)],
    hard: [Math.floor((4 * 15 + 27) / 10), 24 / 4 / 2, 7, '8' + '3' + '7' + ((8 + 3 + 7) % 10)],
  },
  'library-mystery': { medium: [null, 3 + 1 + 4, null, null], hard: [null, 5 + 5 - 1, null, null] },
  'travel-map': { medium: [null, 5 - 2, null, null], hard: [null, (6 - 2) + (4 - 1), null, null] },
  'team-challenge': { medium: [(30 - 6) / 6, null, null, 4 * 5], hard: [(45 - 45 / 3) / 5, null, null, 6 * 6 + letters('איתי')] },
  'pirate-treasure': { medium: [4 + 3, null, null, '7' + 2], hard: [5 + 3 + 1, null, null, '9' + 3] },
  'dinosaur-egg': { medium: [5 + 4, null, null, '9' + (1 + 4 + 1 + 2)], hard: [6 + 5 + 2, null, null, '13' + (4 + 4)] },
  'magic-toy-shop': { medium: [12 - 3, null, null, '9' + (4 + 3)], hard: [15 - 4 + 1, null, null, '12' + (2 + 2 + 2 + 2)] },
  'candy-factory': { medium: [6 + 6, null, null, null], hard: [7 + 5 + 3, null, null, null] },
  'jungle-safari': { medium: [20 - 6 - 3, null, 3 * 4, '11' + '12'], hard: [30 - 4 * 5 + 3, null, 4 * 4 + 4, '13' + '20'] },
  'superhero-hq': { medium: [null, 8 + 7 + 9, null, '24' + letters('חברות')], hard: [null, 4 * 6 + 9, null, '33' + letters('גיבורים')] },
  'rainbow-unicorn': { medium: [7 - 4 + 1, null, null, '4' + (4 * 1 + 2 * 2)], hard: [14 - 6 + 1, null, null, '9' + (2 + 1 + 3 * 2)] },
}

test('numeric variant answers match a recomputation', () => {
  for (const room of ROOMS) {
    const expected = EXPECTED[room.id]
    assert.ok(expected, `missing expectations for ${room.id}`)
    for (const level of ['medium', 'hard']) {
      room.steps.forEach((step, i) => {
        const want = expected[level][i]
        if (want === null || want === undefined) return
        assert.equal(String(step.levels[level].answer), String(want), `${room.id} ${level} step ${i}`)
      })
    }
  }
})

test('candy counting variants match the candies drawn on the belt', () => {
  const room = YOUNG_ESCAPE_ROOMS.find(r => r.id === 'candy-factory')
  for (const level of ['medium', 'hard']) {
    const v = room.steps[3].levels[level]
    assert.equal(String(v.visual.split('🍬').length - 1), v.answer)
  }
})

test('library cipher variants decode to the final word', () => {
  const ab = 'אבגדהוזחטיכלמנסעפצקרשת'
  const finals = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
  const shift = (word, k) => [...word].map(ch => ab[ab.indexOf(finals[ch] || ch) + k]).join('')
  const room = MEGA_ESCAPE_ROOMS.find(r => r.id === 'library-mystery')
  const last = room.steps[3].levels
  assert.ok(last.medium.prompt.includes(shift('חלון', 2)))
  assert.ok(last.hard.prompt.includes([...shift('חלון', 3)].reverse().join('')))
})

test('team-challenge logic puzzles have exactly one solution', () => {
  const solve = (people, says) => people.filter(key => says.filter(s => s(key)).length === 1)
  // medium: Dana "not me", Yoav "Noa has it", Noa "not me"
  assert.deepEqual(solve(['דנה', 'יואב', 'נועה'], [k => k !== 'דנה', k => k === 'נועה', k => k !== 'נועה']), ['דנה'])
  // hard: Dana "me", Yoav "not Itai", Noa "Itai", Itai "Noa lies"
  assert.deepEqual(solve(['דנה', 'יואב', 'נועה', 'איתי'], [k => k === 'דנה', k => k !== 'איתי', k => k === 'איתי', k => k !== 'איתי']), ['איתי'])
})
