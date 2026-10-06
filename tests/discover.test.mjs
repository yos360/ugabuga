// /discover content sanity
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { IL_PLACES, IL_OUTLINE, COUNTRIES, NOT_CAPITALS, PLANETS } = await import('../src/discover/discoverData.js')
const { SPACE_QUIZ, BODY_QUIZ } = await import('../src/discover/quizzes.js')

// ray casting: every place sits inside the schematic outline
const inside = (lat, lon) => { let c = false; for (let i = 0, j = IL_OUTLINE.length - 1; i < IL_OUTLINE.length; j = i++) { const [yi, xi] = IL_OUTLINE[i], [yj, xj] = IL_OUTLINE[j]; if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c } return c }
test('every city and place is inside the map outline', () => { for (const [id, , lat, lon] of IL_PLACES) assert.ok(inside(lat, lon), id) })
test('north/south sanity: Eilat south of Beer Sheva south of Jerusalem south of Haifa', () => {
  const lat = id => IL_PLACES.find(p => p[0] === id)[2]
  assert.ok(lat('eilat') < lat('beer-sheva') && lat('beer-sheva') < lat('jerusalem') && lat('jerusalem') < lat('haifa') && lat('haifa') < lat('kiryat-shmona'))
})
test('countries are unique, capitals never listed as non-capitals', () => {
  assert.equal(new Set(COUNTRIES.map(c => c[0])).size, COUNTRIES.length)
  for (const c of COUNTRIES) assert.ok(!NOT_CAPITALS.includes(c[2]), c[2])
})
test('planets in order with NASA diameters', () => {
  assert.deepEqual(PLANETS.map(p => p.id), ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'])
  assert.equal(Math.max(...PLANETS.map(p => p.d)), PLANETS[4].d)
  assert.equal(Math.min(...PLANETS.map(p => p.d)), PLANETS[0].d)
})
test('quiz answers are not repeated among the wrong options', () => {
  for (const [q, a, wrong] of [...SPACE_QUIZ, ...BODY_QUIZ]) { assert.equal(wrong.length, 3, q); assert.ok(!wrong.includes(a), q) }
})
