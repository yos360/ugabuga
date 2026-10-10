// Online chess (/chess, /chess/puzzles): the computer player and the puzzle collection,
// checked with chess.js.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Chess } from 'chess.js'
import { chooseMove, engineSupported, LEVELS } from '../src/chess/engine.js'
import { matingMoves, forcesMateIn2, mateIn2Keys, bestDefence } from '../src/chess/puzzleLogic.js'
import { PUZZLES, PUZZLE_LEVELS } from '../src/chess/puzzles.js'

const isLegal = (fen, m) => {
  const g = new Chess(fen)
  try { g.move(m); return true } catch { return false }
}

test('chess engine: the chess.js internals it relies on are available', () => {
  assert.equal(engineSupported(), true)
  assert.deepEqual(LEVELS.map(l => l.id), ['easy', 'medium', 'hard'])
})

test('chess engine: every level returns a legal move, through random games', () => {
  let seed = 7
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let game = 0; game < 3; game++) {
    const g = new Chess()
    for (let ply = 0; ply < 30 && !g.isGameOver(); ply++) {
      const fen = g.fen()
      for (const level of ['easy', 'medium']) {
        const m = chooseMove(fen, level, { rand })
        assert.ok(m && isLegal(fen, m), `${level} move ${JSON.stringify(m)} is legal in ${fen}`)
      }
      if (ply % 10 === 3) {
        const m = chooseMove(fen, 'hard', { timeMs: 150 })
        assert.ok(m && isLegal(fen, m), `hard move ${JSON.stringify(m)} is legal in ${fen}`)
      }
      const moves = g.moves()
      g.move(moves[Math.floor(rand() * moves.length)])
    }
  }
})

test('chess engine: no move in a finished game, the only move when there is one', () => {
  assert.equal(chooseMove('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', 'hard'), null) // stalemate
  assert.equal(chooseMove('R6k/8/6K1/8/8/8/8/8 b - - 0 1', 'hard'), null) // checkmated
  assert.deepEqual(chooseMove('7k/8/6K1/8/8/8/8/1R6 b - - 0 1', 'hard'), { from: 'h8', to: 'g8' })
})

test('chess engine: medium and hard always find a mate in one', () => {
  const mateIn1 = PUZZLES.filter(p => p.solution.length === 1)
  for (const p of mateIn1) {
    for (const level of ['medium', 'hard']) {
      const m = chooseMove(p.fen, level, { rand: () => 0.5 })
      const g = new Chess(p.fen)
      g.move(m)
      assert.ok(g.isCheckmate(), `${level} mates in puzzle ${p.id} (played ${JSON.stringify(m)})`)
    }
  }
})

test('chess engine: hard does not hang its queen', () => {
  // the black queen on d4 is attacked by the pawn on c3; any sensible move saves it
  const fen = 'rnb1kbnr/pppp1ppp/8/4p3/3qP3/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 3'
  const m = chooseMove(fen, 'hard', { timeMs: 600 })
  const after = new Chess(fen)
  after.move(m)
  const lost = after.moves({ verbose: true }).some(x => x.captured === 'q')
  assert.equal(lost, false, `queen safe after ${JSON.stringify(m)}`)
})

test('chess puzzles: at least 30, unique ids, valid levels and positions', () => {
  assert.ok(PUZZLES.length >= 30)
  assert.equal(new Set(PUZZLES.map(p => p.id)).size, PUZZLES.length)
  const levels = new Set(PUZZLE_LEVELS.map(l => l.id))
  for (const p of PUZZLES) {
    assert.ok(levels.has(p.level), `puzzle ${p.id} level`)
    const g = new Chess(p.fen)
    assert.equal(g.isGameOver(), false, `puzzle ${p.id} is not already over`)
    assert.ok(p.title && p.hint && p.explain, `puzzle ${p.id} texts`)
  }
  for (const l of PUZZLE_LEVELS) assert.ok(PUZZLES.filter(p => p.level === l.id).length >= 8, `level ${l.id} has enough puzzles`)
})

test('chess puzzles: every mate-in-1 has exactly one mating move — the solution', () => {
  const m1 = PUZZLES.filter(p => p.solution.length === 1)
  assert.ok(m1.length >= 20)
  for (const p of m1) assert.deepEqual(matingMoves(p.fen), p.solution, `puzzle ${p.id}`)
})

test('chess puzzles: every mate-in-2 key forces mate, and the listed line mates', () => {
  const m2 = PUZZLES.filter(p => p.solution.length === 3)
  assert.ok(m2.length >= 8)
  for (const p of m2) {
    assert.deepEqual(matingMoves(p.fen), [], `puzzle ${p.id} has no mate in one`)
    assert.ok(forcesMateIn2(p.fen, p.solution[0]), `puzzle ${p.id}: ${p.solution[0]} forces mate`)
    assert.ok(mateIn2Keys(p.fen).includes(p.solution[0]))
    const g = new Chess(p.fen)
    g.move(p.solution[0])
    const d = bestDefence(g.fen(), p.solution[1])
    assert.equal(d.san, p.solution[1], `puzzle ${p.id}: listed defence is legal`)
    g.move(d.san)
    g.move(p.solution[2])
    assert.ok(g.isCheckmate(), `puzzle ${p.id}: ${p.solution.join(' ')} ends in mate`)
  }
})

test('chess: the level buttons on /chess match the engine levels', async () => {
  const { LEVELS: shown } = await import('../src/chess/levels.js')
  assert.deepEqual(shown.map(l => l.id), LEVELS.map(l => l.id))
})
