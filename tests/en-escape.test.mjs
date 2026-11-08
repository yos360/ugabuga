import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ESCAPE_ROOMS as HE_A } from '../src/data/escapeRooms.js'
import { MORE_ESCAPE_ROOMS } from '../src/data/escapeRoomsMore.js'
import { MEGA_ESCAPE_ROOMS } from '../src/data/escapeRoomsMega.js'
import { YOUNG_ESCAPE_ROOMS } from '../src/data/escapeNew/young.js'
import { HOLIDAY_ESCAPE_ROOMS } from '../src/data/escapeNew/holidays.js'
import { CLASSROOM_ESCAPE_ROOMS } from '../src/data/escapeNew/classroom.js'
import { TEEN_ESCAPE_ROOMS } from '../src/data/escapeNew/teens.js'
import { ESCAPE_COLLECTIONS } from '../src/data/escapeCollections.js'
import { ROOMS_A } from '../src/en/escape/rooms-a.js'
import { ROOMS_B } from '../src/en/escape/rooms-b.js'
import { ROOMS_C } from '../src/en/escape/rooms-c.js'
import { ESCAPE_PAGES, ESCAPE_ROOM_META, ESCAPE_TOPIC_META, ESCAPE_BASE } from '../src/en/escape/catalog.js'
import { EN_ESCAPE_COLLECTIONS } from '../src/en/escape/collections.js'
import { buildEnglishAdventure, EN_ESCAPE_LEVELS, isCorrect, normalizeAnswer } from '../src/en/escape/adventure.js'

const HE_ROOMS = [...HE_A, ...MORE_ESCAPE_ROOMS, ...MEGA_ESCAPE_ROOMS, ...YOUNG_ESCAPE_ROOMS, ...HOLIDAY_ESCAPE_ROOMS, ...CLASSROOM_ESCAPE_ROOMS, ...TEEN_ESCAPE_ROOMS]
const EN_ROOMS = [...ROOMS_A, ...ROOMS_B, ...ROOMS_C]
const HEBREW = /[֐-׿]/

test('every Hebrew room and topic page has an English page, and nothing extra', () => {
  assert.deepEqual(EN_ROOMS.map(r => r.id), HE_ROOMS.map(r => r.id))
  assert.deepEqual(ESCAPE_ROOM_META.map(m => m[0]), HE_ROOMS.map(r => r.id))
  assert.deepEqual(ESCAPE_TOPIC_META.map(m => m[0]).sort(), Object.keys(ESCAPE_COLLECTIONS).sort())
  assert.deepEqual(Object.keys(EN_ESCAPE_COLLECTIONS).sort(), Object.keys(ESCAPE_COLLECTIONS).sort())
  const counterparts = new Set(ESCAPE_PAGES.map(p => p.counterpart))
  assert.ok(counterparts.has('/tools/escape-rooms'))
  for (const r of HE_ROOMS) assert.ok(counterparts.has('/tools/escape-rooms/' + r.id), r.id)
  for (const slug of Object.keys(ESCAPE_COLLECTIONS)) assert.ok(counterparts.has('/tools/escape-rooms/topic/' + slug), slug)
  assert.equal(ESCAPE_PAGES.length, 1 + HE_ROOMS.length + Object.keys(ESCAPE_COLLECTIONS).length)
})

test('catalog: unique paths, titles and counterparts; English paths mirror the Hebrew ones', () => {
  for (const key of ['path', 'title', 'counterpart', 'description']) assert.equal(new Set(ESCAPE_PAGES.map(p => p[key])).size, ESCAPE_PAGES.length, key)
  for (const p of ESCAPE_PAGES) {
    assert.equal(p.path, '/en' + p.counterpart)
    assert.ok(p.path.startsWith(ESCAPE_BASE))
    assert.ok(p.title.length <= 70, `title too long (${p.title.length}): ${p.title}`)
    assert.ok(p.description.length >= 110 && p.description.length <= 165, `description length ${p.description.length}: ${p.path}`)
    assert.ok(p.emoji, p.path)
    assert.ok(!HEBREW.test(p.title + p.description), p.path)
  }
  assert.equal(new Set(EN_ROOMS.map(r => r.title)).size, EN_ROOMS.length, 'room display titles unique')
})

test('rooms are complete English rooms', () => {
  for (const r of EN_ROOMS) {
    for (const key of ['title', 'emoji', 'audience', 'difficulty', 'duration', 'intro', 'finalMessage', 'hook', 'skills']) assert.ok(r[key], `${r.id} ${key}`)
    assert.ok(r.materials.length >= 3 && r.printableKit.length >= 2, r.id)
    assert.ok(r.steps.length >= 3, r.id)
    const he = HE_ROOMS.find(h => h.id === r.id)
    assert.equal(r.steps.length, he.steps.length, `${r.id} keeps the Hebrew number of stations`)
    assert.deepEqual(r.tags, he.tags, `${r.id} tags`)
    const prose = [r.title, r.audience, r.intro, r.story, r.finalMessage, r.hook, r.skills, ...r.materials, ...r.printableKit, ...r.steps.flatMap(s => [s.title, s.story, s.question, s.answer, ...(s.accept || []), ...s.hints])].filter(Boolean).join(' ')
    assert.ok(!HEBREW.test(prose), `${r.id} has Hebrew outside a clue board: ${prose.match(/.{0,30}[֐-׿].{0,30}/)?.[0]}`)
    for (const s of r.steps) {
      assert.ok(s.title && s.question && s.answer, `${r.id}: ${s.title}`)
      assert.ok(s.hints?.length >= 1, `${r.id}: ${s.title} hints`)
      assert.ok(isCorrect(s, s.answer), `${r.id}: ${s.title} accepts its own answer`)
      for (const a of s.accept || []) assert.ok(isCorrect(s, a), `${r.id}: accept ${a}`)
    }
  }
})

const shift = (text, by) => [...text].map(c => String.fromCharCode((c.charCodeAt(0) - 65 - by + 26) % 26 + 65)).join('')
const atbash = text => [...text].map(c => String.fromCharCode(90 - (c.charCodeAt(0) - 65))).join('')
function decode(cipher) {
  if (cipher.type === 'shift') return shift(cipher.text, cipher.shift)
  if (cipher.type === 'atbash') return atbash(cipher.text)
  if (cipher.type === 'a1z26') return cipher.text.split('-').map(n => String.fromCharCode(64 + Number(n))).join('')
  if (cipher.type === 'key') return cipher.text.map(sym => cipher.key[sym]).join('')
  throw new Error('unknown cipher ' + cipher.type)
}
function mastermindSolutions(clues) {
  const out = []
  for (let n = 0; n < 1000; n++) {
    const code = String(n).padStart(3, '0')
    const ok = clues.every(([guess, inPlace, elsewhere]) => {
      const right = [...guess].filter((d, i) => code[i] === d).length
      const anywhere = [...guess].filter(d => code.includes(d)).length
      return right === inPlace && anywhere - right === elsewhere
    })
    if (ok && new Set(code).size === 3) out.push(code)
  }
  return out
}

test('every checkable answer follows from its clues', () => {
  let checked = 0
  for (const r of EN_ROOMS) {
    const answers = r.steps.map(s => s.answer)
    r.steps.forEach((s, i) => {
      const where = `${r.id} stage ${i + 1} (${s.title})`
      if (s.verify) {
        let v = s.verify(answers)
        if (Array.isArray(v)) { assert.equal(v.length, 1, `${where}: exactly one solution, got ${JSON.stringify(v)}`); v = v[0] }
        assert.equal(normalizeAnswer(String(v)), normalizeAnswer(s.answer), where)
        checked++
      }
      if (s.cipher) { assert.equal(normalizeAnswer(decode(s.cipher)), normalizeAnswer(s.answer), where); checked++ }
      if (s.mastermind) { assert.deepEqual(mastermindSolutions(s.mastermind), [s.answer], where); checked++ }
    })
    // The last station is the code that opens the room: it must always be checkable.
    const last = r.steps.at(-1)
    if (/^\d+$/.test(last.answer)) assert.ok(last.verify, `${r.id}: the final code is checked`)
  }
  assert.ok(checked >= 135, `only ${checked} checks`)
})

test('combined codes and letter counts that were rebuilt for English', () => {
  const byId = Object.fromEntries(EN_ROOMS.map(r => [r.id, r]))
  const ans = (id, i) => byId[id].steps[i].answer
  assert.equal(ans('detective-case', 2), String('clock'.length * 3))
  assert.equal(ans('music-studio', 2), String(120 + 'violin'.length))
  assert.equal(ans('movie-premiere', 2), String(24 + 'director'.length))
  assert.equal(ans('adult-party-mystery', 2), String(5 + 'beat'.length))
  assert.equal(ans('superhero-hq', 3), '15' + 'hello'.length)
  assert.equal(ans('israel-map-quest', 4), `${'JERUSALEM'.length}${'KINNERET'.length}`)
  assert.equal(ans('library-mystery', 3), shift('XJOEPX', 1).toLowerCase())
  assert.equal(ans('haunted-house-comedy', 2), atbash('GFMZ').toLowerCase())
})

test('the three levels: right number of stages, every stage solvable with hints', () => {
  const hard = buildEnglishAdventure(EN_ROOMS.find(r => r.id === 'cyber-hacker'), 'hard', 0)
  const cells = hard.steps.find(s => /three cells/i.test(s.title))
  assert.ok(cells)
  assert.deepEqual([1, 2, 3].filter(k => [k === 1, k !== 2, k !== 1].filter(Boolean).length === 1).map(String), [cells.answer])
  for (const r of EN_ROOMS) {
    for (const level of EN_ESCAPE_LEVELS) {
      for (const seed of [0, 1, 2, 3, 4]) {
        const built = buildEnglishAdventure(r, level.id, seed)
        assert.ok(built.steps.length <= level.count && built.steps.length >= level.count - 1, `${r.id} ${level.id}: ${built.steps.length} stages`)
        assert.equal(built.steps.filter(s => !s.extra).length, r.steps.length, `${r.id} keeps every story stage`)
        assert.equal(built.steps.at(-1).answer, r.steps.at(-1).answer, `${r.id}: the room's own code closes the adventure`)
        assert.equal(new Set(built.steps.map(s => s.title)).size, built.steps.length, `${r.id} ${level.id} unique stage titles`)
        for (const s of built.steps) {
          assert.ok(s.hints.length >= 1 && s.question && s.answer !== '', `${r.id} ${level.id} ${s.title}`)
          assert.ok(isCorrect(s, s.answer))
          assert.ok(!HEBREW.test(s.title + s.question + (s.story || '')), `${r.id} ${s.title}`)
          if (level.id !== 'easy') assert.ok(!new RegExp(`^${s.answer}$`, 'i').test(s.hints[0]), 'first hint never gives the answer')
        }
      }
    }
  }
})

test('answer matching is forgiving about case, articles and number words', () => {
  const step = { answer: '24', accept: [] }
  assert.ok(isCorrect(step, 'twenty-four'))
  assert.ok(isCorrect(step, ' 24 '))
  assert.ok(isCorrect({ answer: 'fridge' }, 'The Fridge!'))
  assert.ok(isCorrect({ answer: '4' }, 'four'))
  assert.ok(!isCorrect({ answer: '4' }, '5'))
})

test('topic pages: every guide link points at a room in that topic', () => {
  for (const [slug, c] of Object.entries(EN_ESCAPE_COLLECTIONS)) {
    const rooms = EN_ROOMS.filter(c.filter)
    const heRooms = HE_ROOMS.filter(ESCAPE_COLLECTIONS[slug].filter)
    assert.deepEqual(rooms.map(r => r.id), heRooms.map(r => r.id), slug)
    assert.ok(rooms.length >= 3, slug)
    for (const [id] of c.choose) assert.ok(rooms.some(r => r.id === id), `${slug} -> ${id}`)
    assert.ok(c.tips.length >= 3 && c.faq.length >= 2 && c.intro, slug)
  }
})
