// "Sort the balls" — pour balls between tubes until each tube holds one color.
// A ball may move onto an empty tube or onto a ball of the same color, if there's room.
// Levels are random but checked by a solver before they're shown, so every level is solvable.
import { rng, shuffle } from './rng'

export const CAP = 4

export function levelSpec(level) {
  const colors = Math.min(3 + Math.floor((level - 1) / 2), 10)
  return { colors, empty: colors >= 8 ? 2 : 2 }
}

export const top = t => t[t.length - 1]
export function canMove(tubes, from, to) {
  if (from === to) return false
  const a = tubes[from], b = tubes[to]
  if (!a.length || b.length >= CAP) return false
  return !b.length || top(b) === top(a)
}
// Moves every same-colored ball from the top that fits (like pouring).
export function move(tubes, from, to) {
  if (!canMove(tubes, from, to)) return null
  const next = tubes.map(t => t.slice())
  const color = top(next[from])
  while (next[from].length && top(next[from]) === color && next[to].length < CAP) next[to].push(next[from].pop())
  return next
}
export const isSolved = tubes => tubes.every(t => !t.length || (t.length === CAP && t.every(b => b === t[0])))

const sig = tubes => tubes.map(t => t.join('')).sort().join('|')
export function solvable(tubes, maxNodes = 60000) {
  const seen = new Set()
  const stack = [tubes]
  while (stack.length) {
    const cur = stack.pop()
    if (isSolved(cur)) return true
    const s = sig(cur)
    if (seen.has(s)) continue
    seen.add(s)
    if (seen.size > maxNodes) return false
    for (let i = 0; i < cur.length; i++) for (let j = 0; j < cur.length; j++) {
      if (!canMove(cur, i, j)) continue
      // Pointless: moving a whole uniform tube into an empty one.
      if (!cur[j].length && cur[i].every(b => b === cur[i][0])) continue
      stack.push(move(cur, i, j))
    }
  }
  return false
}

export function buildLevel(level) {
  const { colors, empty } = levelSpec(level)
  for (let attempt = 0; attempt < 40; attempt++) {
    const r = rng(level * 104729 + attempt * 31)
    const balls = shuffle(r, Array.from({ length: colors * CAP }, (_, i) => i % colors))
    const tubes = Array.from({ length: colors }, (_, i) => balls.slice(i * CAP, i * CAP + CAP))
    for (let i = 0; i < empty; i++) tubes.push([])
    // Skip boards that start (almost) solved.
    if (tubes.filter(t => t.length === CAP && t.every(b => b === t[0])).length > 0) continue
    if (solvable(tubes)) return tubes
  }
  // Fallback that is always solvable: one swap away from solved.
  const tubes = Array.from({ length: colors }, (_, i) => Array(CAP).fill(i))
  ;[tubes[0][3], tubes[1][3]] = [tubes[1][3], tubes[0][3]]
  for (let i = 0; i < empty; i++) tubes.push([])
  return tubes
}
