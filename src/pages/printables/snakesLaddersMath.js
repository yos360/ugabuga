// Data for the printable "snakes and ladders of multiplication and division" board.
// Every ladder foot carries a multiplication fact (solve it right → climb),
// every snake head a division fact (solve it right → the snake misses you; wrong → slide down).
// Pure JS so the tests can import it.

// Same layout as the online game (src/boardgames/classic/SnakesLadders.jsx).
export const LADDERS = { 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 }
export const SNAKES = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 }

export const LEVELS = {
  easy: { label: 'קל — כפל עד 5', grade: 'ג׳', a: [2, 3, 4, 5], b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  full: { label: 'כל לוח הכפל', grade: 'ג׳–ד׳', a: [2, 3, 4, 5, 6, 7, 8, 9, 10], b: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  hard: { label: 'מאתגר — 6 עד 9', grade: 'ד׳', a: [6, 7, 8, 9], b: [3, 4, 5, 6, 7, 8, 9] },
}

// Small seeded generator (mulberry32), so a board is reproducible from its seed.
export function rng(seed) {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6D2B79F5) >>> 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const pick = (list, rand) => list[Math.floor(rand() * list.length)]

// All { a, b } pairs of a level, shuffled; the factor order on the board is random too.
function facts(level, rand) {
  const L = LEVELS[level] || LEVELS.full
  const out = []
  for (const a of L.a) for (const b of L.b) out.push(rand() < 0.5 ? { a, b } : { a: b, b: a })
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Returns { ladders: [{ sq, to, a, b, answer }], snakes: [{ sq, to, dividend, divisor, answer }] }.
// No fact repeats on one board (a × b and b × a count as the same fact).
export function makeBoard(level = 'full', seed = 1) {
  const rand = rng(seed)
  const seen = new Set()
  const key = (x, y) => `${Math.min(x, y)}x${Math.max(x, y)}`
  const pool = facts(level, rand)
  const next = () => {
    while (pool.length) {
      const f = pool.pop()
      if (!seen.has(key(f.a, f.b))) { seen.add(key(f.a, f.b)); return f }
    }
    // tiny levels could run out: fall back to any fact of the level
    const L = LEVELS[level] || LEVELS.full
    return { a: pick(L.a, rand), b: pick(L.b, rand) }
  }
  const ladders = Object.entries(LADDERS).map(([sq, to]) => {
    const { a, b } = next()
    return { sq: +sq, to, a, b, answer: a * b }
  })
  const snakes = Object.entries(SNAKES).map(([sq, to]) => {
    const { a, b } = next()
    // the divisor is never 1 (÷ 1 is too easy for a board game)
    const [divisor, answer] = a === 1 ? [b, a] : b === 1 ? [a, b] : rand() < 0.5 ? [a, b] : [b, a]
    return { sq: +sq, to, dividend: a * b, divisor, answer }
  })
  return { ladders, snakes }
}

// square n (1..100) → [col, row]: col 0 on the left, row 0 at the bottom, zig-zag rows.
export const cellOf = n => { const r = Math.floor((n - 1) / 10), k = (n - 1) % 10; return [r % 2 ? 9 - k : k, r] }
