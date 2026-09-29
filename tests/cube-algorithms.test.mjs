// Proves every claim the Rubik's-cube guide (/rubiks-cube) makes about its algorithms,
// on the sticker-level model in src/utils/cube.js. Run: node tests/cube-algorithms.test.mjs
import { solved, apply, invert, isSolved, intact, bottomLayer, firstTwoLayers, scramble, colorAt } from '../src/utils/cube.js'

let fails = 0
const ok = (cond, msg) => { if (!cond) { fails++; console.log('FAIL', msg) } else console.log('ok  ', msg) }
const S = solved()

// 0. The model itself
ok(S.length === 54 && isSolved(S), 'solved cube has 54 stickers')
for (const m of ['U', 'D', 'F', 'B', 'R', 'L']) ok(isSolved(apply(S, `${m} ${m} ${m} ${m}`)) && !isSolved(apply(S, m)), `${m}^4 = identity, ${m} ≠ identity`)
ok(isSolved(apply(S, "R U R' U' ".repeat(6))), "(R U R' U')×6 = identity")
for (let i = 0; i < 50; i++) { const sc = scramble(25); ok(isSolved(apply(apply(S, sc), invert(sc))), 'scramble + inverse = solved #' + i) }
// R turns the front face up (orientation sanity check): after R the F-colour sits on U at the right column
ok(colorAt(apply(S, 'R'), 'U', [1, 1, 1]) === 'F', 'R moves front stickers to the top')

// Step 2 – white corners: with the corner above its slot (UFR), repeating R U R' U' solves it
// in ≤5 repetitions and never disturbs the rest of the white layer.
const others = p => bottomLayer(p) && !(p[0] === 1 && p[2] === 1)
for (let k = 1; k <= 5; k++) {
  const start = apply(S, "U R U' R' ".repeat(k))
  ok(intact(start, others), `corner case ${k}: rest of the white layer untouched`)
  const done = apply(start, "R U R' U' ".repeat(k))
  ok(intact(done, bottomLayer), `corner case ${k}: solved after ${k}× R U R' U'`)
}
for (let k = 1; k <= 5; k++) ok(intact(apply(S, "R U R' U' ".repeat(k)), others), `R U R' U' ×${k} never touches the other white pieces`)

// Step 3 – middle-layer edges
const RIGHT = "U R U' R' U' F' U F", LEFT = "U' L' U L U F U' F'"
for (const [name, alg] of [['right', RIGHT], ['left', LEFT]]) {
  ok(intact(apply(S, alg), bottomLayer), `${name} insert keeps the white layer`)
  const start = apply(S, invert(alg))
  ok(isSolved(apply(start, alg)), `${name} insert solves its demo case`)
}
// The demo case really is "edge in the top layer, other middle edges and white layer done"
const midOthers = side => p => p[1] <= 0 && !(p[1] === 0 && p[2] === 1 && p[0] === side)
ok(intact(apply(S, invert(RIGHT)), midOthers(1)), 'right-insert case: only the front-right edge is out')
ok(intact(apply(S, invert(LEFT)), midOthers(-1)), 'left-insert case: only the front-left edge is out')

// Steps 4–7 on random last-layer states: follow the guide literally and it always ends solved.
const FRU = "F R U R' U' F'", SUNE_U = "R U R' U R U2 R' U", CORN = "U R U' L' U R' U' L", TWIST = "R' D' R D"
ok(intact(apply(S, FRU), firstTwoLayers), "F R U R' U' F' keeps the first two layers")
ok(intact(apply(S, SUNE_U), firstTwoLayers), "R U R' U R U2 R' U keeps the first two layers")
ok(intact(apply(S, CORN), firstTwoLayers), "U R U' L' U R' U' L keeps the first two layers")

const CENTER = { U: [0, 1, 0], D: [0, -1, 0], F: [0, 0, 1], B: [0, 0, -1], R: [1, 0, 0], L: [-1, 0, 0] }
const center = (s, f) => colorAt(s, f, CENTER[f]) // after a whole-cube turn the centres tell the colours
const top = s => center(s, 'U')
const EDGES = [['B', [0, 1, -1]], ['R', [1, 1, 0]], ['F', [0, 1, 1]], ['L', [-1, 1, 0]]]
const edgesUp = s => EDGES.map(([, p]) => colorAt(s, 'U', p) === top(s)) // back, right, front, left
const edgeOk = s => EDGES.map(([f, p]) => colorAt(s, f, p) === center(s, f))
const cornerIn = (s, p) => {
  const faces = [p[0] === 1 ? 'R' : 'L', 'U', p[2] === 1 ? 'F' : 'B']
  const want = faces.map(f => center(s, f)).sort().join(), got = faces.map(f => colorAt(s, f, p)).sort().join()
  return want === got
}
const TOP_CORNERS = [[1, 1, 1], [-1, 1, 1], [-1, 1, -1], [1, 1, -1]]
const count = a => a.filter(Boolean).length

function llState() { // random state with the first two layers solved
  const gens = [FRU, SUNE_U, CORN, 'U', "U'", "R U R' U R U2 R'", "F U R U' R' F'", 'y']
  let s = S
  for (let i = 0; i < 30; i++) s = apply(s, gens[Math.floor(Math.random() * gens.length)])
  if (Math.random() < 0.7) s = apply(s, `${TWIST} ${TWIST} U ${TWIST} ${TWIST} ${TWIST} ${TWIST} U'`)
  return s
}

// The guide's steps 4–7, exactly as written on the page.
function followGuide(s) {
  const doAlg = a => { s = apply(s, a) }
  // Step 4: dot → alg · L: hold it at back-left → alg · line: hold it horizontal → alg. Repeat.
  for (let g = 0; g < 4 && count(edgesUp(s)) < 4; g++) {
    if (count(edgesUp(s)) === 2) {
      for (let t = 0; t < 4; t++) { const e = edgesUp(s); if ((e[0] && e[3]) || (e[1] && e[3])) break; doAlg('U') }
    }
    doAlg(FRU)
  }
  if (count(edgesUp(s)) !== 4) throw new Error('yellow cross failed')
  // Step 5: turn the top until at least two edges match. Two neighbours → hold them back+right.
  // Two opposite → do the alg once and start again.
  for (let g = 0; g < 4; g++) {
    let best = 0, bestN = -1
    for (let t = 0; t < 4; t++) { const n = count(edgeOk(apply(s, 'U '.repeat(t) || 'U U U U'))); if (n > bestN) { bestN = n; best = t } }
    if (best) doAlg('U '.repeat(best))
    if (count(edgeOk(s)) === 4) break
    const e = edgeOk(s)
    if (!((e[0] && e[2]) || (e[1] && e[3]))) { for (let t = 0; t < 4 && !(edgeOk(s)[0] && edgeOk(s)[1]); t++) doAlg('y') }
    doAlg(SUNE_U)
  }
  if (count(edgeOk(s)) !== 4) throw new Error('edges failed')
  // Step 6: find a corner in its place, hold it front-right, alg; repeat. None in place → alg from anywhere.
  for (let g = 0; g < 4 && !TOP_CORNERS.every(p => cornerIn(s, p)); g++) {
    for (let t = 0; t < 4 && !cornerIn(s, [1, 1, 1]); t++) doAlg('y')
    doAlg(CORN)
  }
  if (!TOP_CORNERS.every(p => cornerIn(s, p))) throw new Error('corner placement failed')
  // Step 7: yellow on top, R' D' R D until the front-right corner shows yellow on top; then U; ×4.
  for (let c = 0; c < 4; c++) {
    for (let t = 0; colorAt(s, 'U', [1, 1, 1]) !== top(s); t++) { if (t > 6) throw new Error('twist loop'); doAlg(TWIST) }
    doAlg('U')
  }
  for (let t = 0; t < 4 && !isSolved(s); t++) doAlg('U')
  return { s }
}


// Step 2 text: "1, 3 or 5 times" — the corner sits in the top layer above its slot in exactly those cases
const cornerAt = (s, p) => { // which home corner sits at position p
  const st = s.find(x => x.pos.join() === p.join()); return st && st.home.split('|')[0]
}
for (const k of [1, 3, 5]) ok(cornerAt(apply(S, "U R U' R' ".repeat(k)), [1, 1, 1]) === '1,-1,1', `corner needing ${k}× sits above its slot (top-front-right)`)
// Step 2 fallback: a wrong/flipped corner at bottom-front-right comes up after one R U R' U'
for (const setup of ["R U R' U' R U R' U'", "R U R' U' R U R' U' R U R' U' R U R' U'"]) {
  const s1 = apply(S, setup) // DFR corner twisted in place (white layer otherwise intact)
  ok(cornerAt(s1, [1, -1, 1]) === '1,-1,1' && !intact(s1, bottomLayer), 'setup: white corner twisted in its slot')
  ok(cornerAt(apply(s1, "R U R' U'"), [1, 1, 1]) === '1,-1,1', 'one R U R\' U\' brings the twisted corner to the top')
}
// Step 3 fallback: an edge stuck in the front-right slot comes up after the right insert
{
  const s1 = apply(S, RIGHT + ' ' + RIGHT) // FR slot now holds a wrong / flipped edge
  const edgeAt = (s, p) => { const st = s.find(x => x.pos.join() === p.join()); return st && st.home.split('|')[0] }
  const stuck = edgeAt(s1, [1, 0, 1])
  const after = apply(s1, RIGHT)
  const where = after.find(x => x.home.split('|')[0] === stuck).pos
  ok(where[1] === 1, 'the right insert lifts the edge that was in the front-right slot to the top layer')
}
// Step 7 text: a corner needs 2 or 4 repetitions; 6 always returns everything
ok(isSolved(apply(S, `${TWIST} `.repeat(6))), "(R' D' R D)×6 = identity")
{
  const s2 = apply(S, `${TWIST} `.repeat(2)), s4 = apply(S, `${TWIST} `.repeat(4))
  ok(colorAt(s2, 'U', [1, 1, 1]) !== 'U' && colorAt(s4, 'U', [1, 1, 1]) !== 'U', 'after 2 or 4 repetitions the corner is twisted (the two possible cases)')
}

const solvedUpToY = s => [0, 1, 2, 3].some(k => isSolved(apply(s, 'y '.repeat(k) || 'y y y y')))
let solvedCount = 0, N = 400
for (let i = 0; i < N; i++) {
  try { if (solvedUpToY(followGuide(llState()).s)) solvedCount++; else console.log('not solved') } catch (e) { console.log('error', e.message) }
}
ok(solvedCount === N, `steps 4–7 followed literally solve ${solvedCount}/${N} random last-layer states`)
console.log(fails ? `\n${fails} FAILED` : '\nall claims verified')
process.exit(fails ? 1 : 0)
