// Checkers (דמקה) rules engine + computer player. Board: 64 cells, index r*8+c, row 0 at the top.
// Pieces: 1 dark man, 2 dark king (bottom side, moves up, moves first); -1 light man, -2 light king.
// Variants: basic = English draughts (men move/capture forward only, kings step one square);
// international = men also capture backward, flying kings, the longest capture is mandatory.

export const VARIANTS = {
  basic: { id: 'basic', label: 'דמקה רגילה (לילדים)', backCapture: false, flying: false, maxCapture: false },
  intl: { id: 'intl', label: 'דמקה בין־לאומית 8×8', backCapture: true, flying: true, maxCapture: true },
}

const DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
const on = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8
export const rc = i => [i >> 3, i & 7]
export const idx = (r, c) => r * 8 + c
export const isDark = (r, c) => (r + c) % 2 === 1
const side = p => Math.sign(p)
const crownRow = s => (s === 1 ? 0 : 7)

export function initialBoard() {
  const b = Array(64).fill(0)
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (isDark(r, c)) {
    if (r < 3) b[idx(r, c)] = -1
    else if (r > 4) b[idx(r, c)] = 1
  }
  return b
}

export function newGame(variant = 'basic') {
  return { board: initialBoard(), turn: 1, variant, quiet: 0, history: [] }
}

function captureChains(board, from, piece, v) {
  const out = []
  const s = side(piece), king = Math.abs(piece) === 2
  const dirs = king || v.backCapture ? DIRS : DIRS.filter(([dr]) => dr === -s)
  const walk = (pos, path, taken) => {
    const [r, c] = rc(pos)
    let extended = false
    for (const [dr, dc] of dirs) {
      if (king && v.flying) {
        let k = 1
        while (on(r + dr * k, c + dc * k) && board[idx(r + dr * k, c + dc * k)] === 0 || (on(r + dr * k, c + dc * k) && idx(r + dr * k, c + dc * k) === from)) k++
        const er = r + dr * k, ec = c + dc * k
        if (!on(er, ec)) continue
        const e = idx(er, ec)
        if (side(board[e]) !== -s || taken.includes(e)) continue
        let j = 1
        while (on(er + dr * j, ec + dc * j) && (board[idx(er + dr * j, ec + dc * j)] === 0 || idx(er + dr * j, ec + dc * j) === from)) {
          const land = idx(er + dr * j, ec + dc * j)
          extended = true
          walk(land, [...path, land], [...taken, e])
          j++
        }
      } else {
        const mr = r + dr, mc = c + dc, lr = r + 2 * dr, lc = c + 2 * dc
        if (!on(lr, lc)) continue
        const mid = idx(mr, mc), land = idx(lr, lc)
        if (side(board[mid]) !== -s || taken.includes(mid)) continue
        if (board[land] !== 0 && land !== from) continue
        extended = true
        // English rules: a man that reaches the crown row stops there (and is crowned).
        if (!king && !v.backCapture && lr === crownRow(s)) out.push({ path: [...path, land], captures: [...taken, mid] })
        else walk(land, [...path, land], [...taken, mid])
      }
    }
    if (!extended && taken.length) out.push({ path, captures: taken })
  }
  walk(from, [from], [])
  return out
}

function quietMoves(board, from, piece, v) {
  const out = [], s = side(piece), king = Math.abs(piece) === 2
  const [r, c] = rc(from)
  for (const [dr, dc] of king ? DIRS : DIRS.filter(([d]) => d === -s)) {
    let k = 1
    while (on(r + dr * k, c + dc * k) && board[idx(r + dr * k, c + dc * k)] === 0) {
      out.push({ path: [from, idx(r + dr * k, c + dc * k)], captures: [] })
      if (!(king && v.flying)) break
      k++
    }
  }
  return out
}

export function legalMoves(state) {
  const v = VARIANTS[state.variant], b = state.board
  let caps = [], quiet = []
  for (let i = 0; i < 64; i++) if (side(b[i]) === state.turn) {
    caps = caps.concat(captureChains(b, i, b[i], v))
    quiet = quiet.concat(quietMoves(b, i, b[i], v))
  }
  if (caps.length) {
    if (v.maxCapture) { const m = Math.max(...caps.map(x => x.captures.length)); caps = caps.filter(x => x.captures.length === m) }
    return caps
  }
  return quiet
}

export function applyMove(state, move) {
  const b = state.board.slice()
  const from = move.path[0], to = move.path[move.path.length - 1]
  let p = b[from]
  b[from] = 0
  for (const x of move.captures) b[x] = 0
  const wasMan = Math.abs(p) === 1
  if (wasMan && rc(to)[0] === crownRow(side(p))) p = 2 * side(p)
  b[to] = p
  const quiet = move.captures.length || wasMan ? 0 : state.quiet + 1
  return { ...state, board: b, turn: -state.turn, quiet, history: [...state.history, { move, prev: state.board }] }
}

export function status(state) {
  if (state.quiet >= 50) return { over: true, winner: 0, reason: '25 מהלכים של מלכים בלי אכילה – תיקו' }
  if (!legalMoves(state).length) {
    const has = state.board.some(p => side(p) === state.turn)
    return { over: true, winner: -state.turn, reason: has ? 'אין לו אף מהלך חוקי' : 'כל האבנים שלו נאכלו' }
  }
  return { over: false }
}

// ---- computer player: negamax with alpha-beta ----
function evaluate(state) {
  const v = VARIANTS[state.variant]
  let score = 0
  state.board.forEach((p, i) => {
    if (!p) return
    const [r, c] = rc(i)
    let val
    if (Math.abs(p) === 2) val = v.flying ? 330 : 240
    else val = 100 + (p > 0 ? 7 - r : r) * 4 + ((c > 1 && c < 6) ? 3 : 0) + ((p > 0 && r === 7) || (p < 0 && r === 0) ? 6 : 0)
    score += side(p) * val
  })
  return score * state.turn
}

function search(state, depth, alpha, beta) {
  const moves = legalMoves(state)
  if (!moves.length) return -100000 - depth
  if (depth === 0) return evaluate(state)
  moves.sort((a, b) => b.captures.length - a.captures.length)
  let best = -Infinity
  for (const m of moves) {
    // keep searching through forced captures so the computer doesn't blunder into obvious trades
    const d = m.captures.length && depth === 1 ? 1 : depth - 1
    const val = -search(applyMove(state, m), d, -beta, -alpha)
    if (val > best) best = val
    if (best > alpha) alpha = best
    if (alpha >= beta) break
  }
  return best
}

export const LEVELS = [
  { id: 1, label: 'קל', depth: 1, noise: 120 },
  { id: 2, label: 'בינוני', depth: 3, noise: 25 },
  { id: 3, label: 'קשה', depth: 6, noise: 0 },
]

export function computerMove(state, level = 2) {
  const L = LEVELS.find(l => l.id === level) || LEVELS[1]
  const moves = legalMoves(state)
  if (moves.length <= 1) return moves[0] || null
  let best = null, bestVal = -Infinity
  for (const m of moves) {
    const val = -search(applyMove(state, m), L.depth - 1, -Infinity, Infinity) + Math.random() * L.noise
    if (val > bestVal) { bestVal = val; best = m }
  }
  return best
}
