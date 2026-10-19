import { checkedIndex, range, same } from './core.js'
import { waterCatalog, riverCatalog, frogCatalog, waterActions, riverActions, frogActions, applyLegal, solveWater, solveRiver, solveFrogs, waterWon, riverWon, frogWon } from './movement.js'
import { matchCatalog, matchMove, matchWon, solveMatches } from './matchsticks.js'
import { lightsCatalog, lightMove, lightsWon, solveLights } from './lights.js'
import { makeWires, makeCode, makeScales, makeMagic, makeLiars, makeLaser, solveWires, solveCode, solveScales, solveMagic, solveLiars, solveLaser, laserMove, traceLaser } from './deduction.js'
import { israelDayNumber } from '../../../utils/israelDate.js'

export const WORLDS = [
  ['matches', 'גפרורים', '🔥'], ['water', 'מים', '💧'], ['river', 'חציית הנהר', '🚣'],
  ['code', 'פצח קוד', '🔐'], ['scales', 'מאזניים', '⚖️'], ['magic', 'ריבועי קסם', '🔢'],
  ['frogs', 'צפרדעים', '🐸'], ['laser', 'לייזרים', '🪞'], ['liars', 'מי משקר', '🕵️'], ['one', 'רק מהלך אחד', '☝️'],
]
export const COUNTS = { matches: 200, water: 100, river: 100, wires: 150, lights: 220, one: 200, iq: 500 }
const answerSolvers = { wires: solveWires, code: solveCode, scales: solveScales, magic: solveMagic, liars: solveLiars }
export function solve(p, state = p.initial) {
  if (answerSolvers[p.kind]) return answerSolvers[p.kind](p).map(answer => ({ answer }))
  return ({ matches: solveMatches, water: solveWater, river: solveRiver, lights: solveLights, frogs: solveFrogs, laser: solveLaser })[p.kind](p, state)
}
export function won(p, state) {
  if (answerSolvers[p.kind]) return answerSolvers[p.kind](p).some(answer => same(answer, state))
  return ({ matches: matchWon, water: waterWon, river: riverWon, lights: lightsWon, frogs: frogWon, laser: (data, s) => traceLaser(data, s).hit })[p.kind](p, state)
}
export function move(p, state, action) {
  if (answerSolvers[p.kind]) return Object.hasOwn(action, 'answer') ? action.answer : null
  if (p.kind === 'water') return applyLegal(p, state, action, waterActions)
  if (p.kind === 'river') return applyLegal(p, state, action, riverActions)
  if (p.kind === 'frogs') return applyLegal(p, state, action, frogActions)
  return ({ matches: matchMove, lights: lightMove, laser: laserMove })[p.kind](p, state, action)
}
export function validate(p) {
  if (!p.solution?.length || won(p, p.initial)) return false
  if (answerSolvers[p.kind] && answerSolvers[p.kind](p).length !== 1) return false
  let state = p.initial
  for (const action of p.solution) { state = move(p, state, action); if (state === null) return false }
  return won(p, state) && (!p.oneMove || p.solution.length === 1)
}
const cache = new Map()
function unique(factory, count) {
  const all = [], seen = new Set()
  for (let seed = 0; all.length < count; seed++) {
    if (seed > 10000) throw new Error('Catalog diversity limit exceeded')
    const p = factory(seed), id = JSON.stringify(p)
    if (!seen.has(id)) { seen.add(id); all.push(p) }
  }
  return all
}
export function catalog(kind) {
  if (cache.has(kind)) return cache.get(kind)
  let all
  if (kind === 'matches') all = matchCatalog()
  else if (kind === 'water') all = waterCatalog()
  else if (kind === 'river') all = riverCatalog()
  else if (kind === 'lights') all = lightsCatalog()
  else if (kind === 'frogs') all = frogCatalog()
  else if (kind === 'one') {
    all = []; const seen = new Set()
    const sources = ['matches', 'water', 'lights', 'laser'].map(k => catalog(k))
    // Each puzzle starts exactly one legal action before a verified goal.
    for (let i = 0; all.length < 200 && i < 220; i++) for (const source of sources) {
      if (i >= source.length || all.length >= 200) continue
      const p = source[i]; let initial = p.initial
      for (const action of p.solution.slice(0, -1)) initial = move(p, initial, action)
      const { id: _id, level: _level, ...rules } = p
      const next = { ...rules, initial, solution: p.solution.slice(-1), oneMove: true }
      const signature = JSON.stringify(next)
      if (!seen.has(signature)) { seen.add(signature); all.push(next) }
    }
  } else if (kind === 'iq') {
    all = WORLDS.flatMap(([world]) => {
      // Order by actual search length and rule complexity; the boss is the last
      // (and therefore hardest or tied-hardest) challenge in each ten-level block.
      const complexity = p => p.solution.length * 10 + (p.n || 0) * 3 + (p.size || 0) + (p.clues?.length || 0) + (p.conflicts?.length || 0) + (p.sum || 0) / 100
      const source = [...catalog(world)].sort((a, b) => complexity(a) - complexity(b))
      return range(50).map(i => ({ ...source[Math.floor(i * (source.length - 1) / 49)], world, boss: (i + 1) % 10 === 0 }))
    })
  } else {
    const factory = { wires: makeWires, code: makeCode, scales: makeScales, magic: makeMagic, liars: makeLiars, laser: makeLaser }[kind]
    if (!factory) throw new Error('Unknown puzzle kind')
    all = unique(factory, kind === 'wires' ? 150 : 50)
  }
  all = all.map((p, index) => ({ ...p, id: `${kind}-v1-${index}`, level: index + 1 }))
  cache.set(kind, all)
  return all
}
export function puzzle(kind, index) { const all = catalog(kind); return all[checkedIndex(index, all.length)] }
export function dailyIQ(time = Date.now()) {
  const day = israelDayNumber(time)
  return { day, index: ((day * 7919 + 101) % 500 + 500) % 500 }
}
// Ten different worlds, deterministic per run; age selects a difficulty band in each world.
export function examIndices(seed, age = '9-11') {
  const band = { '6-8': [0, 15], '9-11': [10, 30], '12+': [20, 45], adult: [25, 50] }[age] || [0, 50]
  return range(10).map(world => world * 50 + band[0] + ((Math.imul(seed + world, 7919) >>> 0) % (band[1] - band[0])))
}
