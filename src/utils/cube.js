// A 3×3 Rubik's cube modelled sticker by sticker in 3D: every sticker has a
// position (x, y, z ∈ {-1, 0, 1}) and an outward normal. A face turn rotates the
// stickers of one layer 90° about that face's axis — so every move is exact by
// construction, and the guide's algorithms are checked against this model in
// tests (tests/cube-algorithms.test.mjs).
//
// Orientation used across the guide: yellow on top (U), white on the bottom (D),
// green in front (F), orange on the right (R), red on the left (L), blue at the back (B).

export const FACES = {
  U: [0, 1, 0], D: [0, -1, 0], F: [0, 0, 1], B: [0, 0, -1], R: [1, 0, 0], L: [-1, 0, 0],
}
export const COLORS = { U: '#FFD500', D: '#FFFFFF', F: '#009E60', B: '#0051BA', R: '#FF5800', L: '#C41E3A' }

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
// Clockwise quarter turn seen from outside along axis n: v' = n(n·v) − n×v
const rot = (v, n) => { const d = dot(n, v), c = cross(n, v); return [n[0] * d - c[0], n[1] * d - c[1], n[2] * d - c[2]] }
const key = (p, n) => p.join(',') + '|' + n.join(',')

export function solved() {
  const s = []
  for (const [face, n] of Object.entries(FACES)) {
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
      const p = n.map(c => c !== 0 ? c : null)
      const free = p.map((c, i) => c === null ? i : -1).filter(i => i >= 0)
      p[free[0]] = a; p[free[1]] = b
      s.push({ pos: p, n: [...n], home: key(p, n), color: face })
    }
  }
  return s
}

// Whole-cube rotations x/y/z turn all layers like R/U/F.
const AXIS = { x: 'R', y: 'U', z: 'F' }

function quarter(state, face) {
  const whole = AXIS[face]
  const n = FACES[whole || face]
  return state.map(st => {
    if (!whole && dot(st.pos, n) !== 1) return st
    return { ...st, pos: rot(st.pos, n), n: rot(st.n, n) }
  })
}

export function parse(alg) {
  return alg.trim().split(/\s+/).filter(Boolean).map(t => {
    const m = t.match(/^([UDFBRLxyz])(2|'|’)?$/)
    if (!m) throw new Error('bad move ' + t)
    return { face: m[1], turns: m[2] === '2' ? 2 : m[2] ? 3 : 1, text: t.replace('’', "'") }
  })
}

export function apply(state, alg) {
  const moves = typeof alg === 'string' ? parse(alg) : alg
  let s = state
  for (const m of moves) for (let i = 0; i < m.turns; i++) s = quarter(s, m.face)
  return s
}

export function invert(alg) {
  return parse(alg).reverse().map(m => m.face + (m.turns === 1 ? "'" : m.turns === 3 ? '' : '2')).join(' ')
}

// Colour of the sticker currently at (face, position) — for drawing.
export function colorAt(state, face, pos) {
  const k = key(pos, FACES[face])
  const st = state.find(s => key(s.pos, s.n) === k)
  return st ? st.color : null
}

export const isSolved = state => state.every(s => key(s.pos, s.n) === s.home)
// True when every sticker whose home piece satisfies `where(pos)` is back home.
export const intact = (state, where) => state.every(s => !where(s.home.split('|')[0].split(',').map(Number)) || key(s.pos, s.n) === s.home)
export const bottomLayer = p => p[1] === -1
export const firstTwoLayers = p => p[1] <= 0

const MOVES = ['U', 'D', 'F', 'B', 'R', 'L']
export function scramble(len = 20) {
  const out = []
  let last = ''
  while (out.length < len) {
    const f = MOVES[Math.floor(Math.random() * 6)]
    if (f === last) continue
    last = f
    out.push(f + ['', "'", '2'][Math.floor(Math.random() * 3)])
  }
  return out.join(' ')
}
