// Two-player online games (/online-games/four-in-a-row, /online-games/tic-tac-toe):
// win detection and the computer players, checked on the pure logic modules.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as c4 from '../src/arcade/logic/fourInARow.js'
import * as ttt from '../src/arcade/logic/ticTacToe.js'
import { rng } from '../src/arcade/logic/rng.js'
import { ARCADE } from '../src/arcade/registry.js'

// --- four in a row ---------------------------------------------------------------------
// Board from 6 strings (top row first): '.' empty, 'x' player 1, 'o' player 2.
const board4 = rows => rows.join('').split('').map(ch => (ch === 'x' ? 1 : ch === 'o' ? 2 : 0))
const at = (r, c) => r * c4.COLS + c

test('four in a row: 69 lines, discs fall to the lowest free cell', () => {
  assert.equal(c4.LINES.length, 69)
  let b = c4.emptyBoard()
  b = c4.drop(b, 3, 1).board
  b = c4.drop(b, 3, 2).board
  assert.equal(b[at(5, 3)], 1)
  assert.equal(b[at(4, 3)], 2)
  for (let k = 0; k < 4; k++) b = c4.drop(b, 3, 1 + (k % 2)).board
  assert.equal(c4.drop(b, 3, 1), null, 'a full column takes no more discs')
  assert.deepEqual(c4.validCols(b), [0, 1, 2, 4, 5, 6])
  assert.equal(c4.turnOf(c4.emptyBoard()), 1)
})

test('four in a row: detects a row, a column and both diagonals', () => {
  const row = c4.result(board4(['.......', '.......', '.......', '.......', 'ooo....', '.xxxx..']))
  assert.equal(row.winner, 1)
  assert.deepEqual(row.line, [at(5, 1), at(5, 2), at(5, 3), at(5, 4)])

  const col = c4.result(board4(['.......', '.......', '......o', '......o', 'x.....o', 'xx....o']))
  assert.equal(col.winner, 2)
  assert.deepEqual(col.line, [at(2, 6), at(3, 6), at(4, 6), at(5, 6)])

  // "\" diagonal going down-right
  const d1 = c4.result(board4(['.......', '.......', 'x......', 'ox.....', 'oox....', 'ooox...']))
  assert.equal(d1.winner, 1)
  assert.deepEqual(d1.line, [at(2, 0), at(3, 1), at(4, 2), at(5, 3)])

  // "/" diagonal going up-right
  const d2 = c4.result(board4(['.......', '.......', '......o', '.....ox', '....oxx', '...oxxx']))
  assert.equal(d2.winner, 2)
  assert.deepEqual(d2.line, [at(2, 6), at(3, 5), at(4, 4), at(5, 3)])

  assert.equal(c4.result(board4(['.......', '.......', '.......', '.......', '.......', 'xxx.ooo'])), null, 'three is not four')
  assert.equal(c4.result(c4.emptyBoard()), null)
})

test('four in a row: a full board without four is a draw', () => {
  // columns alternate in blocks of two so nothing lines up
  const full = board4(['xxooxxo', 'ooxxoox', 'xxooxxo', 'ooxxoox', 'xxooxxo', 'ooxxoox'])
  assert.ok(full.every(Boolean))
  assert.deepEqual(c4.result(full), { draw: true })
})

const winIn1 = board4(['.......', '.......', '.......', '.......', 'oo.....', 'xxx.o..'])
const lossIn1 = board4(['.......', '.......', '.......', '......o', 'x.....o', 'x.x...o'])

test('four in a row: the hard computer takes a win in one', () => {
  assert.equal(c4.hardMove(winIn1, 1), 3)
  assert.equal(c4.hardMove(winIn1, 1, { minDepth: 5, timeMs: 0 }), 3)
  // vertical win for player 2 (and player 1 has nothing to block)
  const v = board4(['.......', '.......', '.......', '.o.....', '.o....x', 'xo...xx'])
  assert.equal(c4.hardMove(v, 2), 1)
})

test('four in a row: the hard computer blocks a loss in one', () => {
  // player 1 (to move as the computer) must block player 2's column 6
  assert.equal(c4.hardMove(lossIn1, 1), 6)
  // a diagonal threat: player 1 threatens (2,3) on the "/" diagonal; player 2 must block it
  const diag = board4(['.......', '.......', '.......', '..xx...', 'oxoo...', 'xoox..x'])
  assert.equal(c4.winningCol(diag.slice(), 1), 3)
  assert.equal(c4.hardMove(diag, 2), 3)
})

test('four in a row: easy computer also takes wins and blocks losses', () => {
  for (let s = 1; s <= 20; s++) {
    assert.equal(c4.easyMove(winIn1, 1, rng(s)), 3)
    assert.equal(c4.easyMove(lossIn1, 1, rng(s)), 6)
  }
})

test('four in a row: hard computer answers fast and beats the easy one', () => {
  let worst = 0, wins = 0
  for (let g = 0; g < 6; g++) {
    const rand = rng(100 + g)
    let b = c4.emptyBoard(), p = 1
    const hard = g % 2 ? 1 : 2
    while (!c4.result(b)) {
      const t = Date.now()
      const c = p === hard ? c4.hardMove(b, p, { timeMs: 40 }) : c4.easyMove(b, p, rand)
      if (p === hard) worst = Math.max(worst, Date.now() - t)
      b = c4.drop(b, c, p).board
      p = 3 - p
    }
    if (c4.result(b).winner === hard) wins++
  }
  assert.equal(wins, 6)
  assert.ok(worst < 1000, `slowest move ${worst}ms`)
})

// --- tic-tac-toe -----------------------------------------------------------------------
const board3 = s => s.split('').map(ch => (ch === 'x' ? 1 : ch === 'o' ? 2 : 0))

test('tic-tac-toe: detects rows, columns, both diagonals and a draw', () => {
  assert.deepEqual(ttt.result(board3('xxxoo....')), { winner: 1, line: [0, 1, 2] })
  assert.deepEqual(ttt.result(board3('xx.ooo.x.')), { winner: 2, line: [3, 4, 5] })
  assert.deepEqual(ttt.result(board3('oo....xxx')), { winner: 1, line: [6, 7, 8] })
  assert.deepEqual(ttt.result(board3('oxxo.xo..')), { winner: 2, line: [0, 3, 6] })
  assert.deepEqual(ttt.result(board3('.x.ox.ox.')), { winner: 1, line: [1, 4, 7] })
  assert.deepEqual(ttt.result(board3('x.ox.o..o')), { winner: 2, line: [2, 5, 8] })
  assert.deepEqual(ttt.result(board3('xo.ox...x')), { winner: 1, line: [0, 4, 8] })
  assert.deepEqual(ttt.result(board3('x.o.oxoxo')), { winner: 2, line: [2, 4, 6] })
  assert.deepEqual(ttt.result(board3('xoxxoxoxo')), { draw: true })
  assert.equal(ttt.result(board3('xo.......')), null)
  assert.equal(ttt.turnOf(board3('xo.......')), 1)
  assert.equal(ttt.place(board3('x........'), 0, 2), null, 'an occupied cell cannot be taken')
})

// Plays every possible human move sequence against every optimal reply of the computer.
function explore(b, ai, stats) {
  const r = ttt.result(b)
  if (r) {
    if (r.winner && r.winner !== ai) stats.lost++
    else if (r.winner === ai) stats.won++
    else stats.draws++
    return
  }
  const p = ttt.turnOf(b)
  const moves = p === ai ? ttt.bestMoves(b, p) : ttt.freeCells(b)
  assert.ok(moves.length > 0)
  for (const i of moves) explore(ttt.place(b, i, p), ai, stats)
}

test('tic-tac-toe: the unbeatable computer never loses — as X and as O, against every possible game', () => {
  for (const ai of [1, 2]) {
    const stats = { won: 0, lost: 0, draws: 0 }
    explore(ttt.emptyBoard(), ai, stats)
    assert.equal(stats.lost, 0, `computer as ${ai === 1 ? 'X' : 'O'} lost a game`)
    assert.ok(stats.won > 0 && stats.draws > 0, 'it wins when the human errs and draws otherwise')
  }
  // perfect against perfect is always a draw
  let b = ttt.emptyBoard()
  while (!ttt.result(b)) b = ttt.place(b, ttt.hardMove(b, ttt.turnOf(b), rng(7)), ttt.turnOf(b))
  assert.deepEqual(ttt.result(b), { draw: true })
})

test('tic-tac-toe: easy computer always takes a win it sees', () => {
  for (let s = 1; s <= 20; s++) assert.equal(ttt.easyMove(board3('oo.xx....'), 2, rng(s)), 2)
})

test('two-player games: registry texts are complete', () => {
  for (const slug of ['four-in-a-row', 'tic-tac-toe']) {
    const g = ARCADE.find(x => x.slug === slug)
    assert.ok(g, slug)
    for (const k of ['name', 'emoji', 'color', 'tagline', 'seoTitle', 'description', 'ages']) assert.ok(g[k], `${slug}.${k}`)
    assert.ok(g.how.length >= 4 && g.skills.length >= 3 && g.tips.length >= 3)
    assert.ok(g.faq.length >= 3 && g.faq.every(f => f.q && f.a))
  }
})
