import test from 'node:test'
import assert from 'node:assert/strict'
import * as E from '../src/sudoku/engine.js'
import { BANK } from '../src/sudoku/bank.js'
import { puzzleFor, dailyPuzzle, ALL_LEVELS, ADULT_LEVELS, israelDate, dailySeed } from '../src/sudoku/puzzles.js'

const validSolution = (grid, n) => grid.every(v => v >= 1 && v <= n) && E.conflicts(grid, n).size === 0

test('sudoku engine: solver counts 0, 1 and many solutions', () => {
  const empty = Array(81).fill(0)
  assert.equal(E.countSolutions(empty, 9, 2).count, 2, 'empty grid has many')
  const dup = empty.slice(); dup[0] = 5; dup[1] = 5
  const r = E.countSolutions(dup, 9, 2)
  assert.equal(r.count, 0); assert.equal(r.invalid, true)
  // a classic published puzzle with one solution
  const p = E.fromString('53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79')
  const one = E.countSolutions(p, 9, 2)
  assert.equal(one.count, 1)
  assert.ok(validSolution(one.solution, 9))
  // a contradiction that is not a duplicate: cell (0,8) has no candidate left
  const stuck = E.fromString('12345678.........9' + '.'.repeat(63))
  assert.equal(E.countSolutions(stuck, 9, 2).count, 0)
})

test('sudoku engine: the logical solver never places a wrong digit', () => {
  for (let s = 1; s <= 25; s++) {
    const g = E.generate(['medium', 'hard', 'very-hard'][s % 3], E.rng(s))
    const res = E.logicSolve(g.puzzle, 9)
    res.grid.forEach((v, i) => { if (v) assert.equal(v, g.solution[i]) })
  }
})

test('sudoku engine: the bank — 80 puzzles per level, each unique and graded as labelled', () => {
  for (const level of ADULT_LEVELS) {
    assert.equal(BANK[level].length, 80)
    assert.equal(new Set(BANK[level]).size, 80, `${level} has no duplicates`)
    for (const s of BANK[level]) {
      assert.equal(s.length, 81)
      const grid = E.fromString(s)
      assert.equal(E.countSolutions(grid, 9, 2).count, 1, `${level} puzzle has exactly one solution`)
      assert.equal(E.grade(grid).level, level, `${level} puzzle grades as ${level}`)
    }
  }
})

test('sudoku engine: difficulty grows with the level', () => {
  const avgGivens = level => BANK[level].reduce((s, p) => s + E.fromString(p).filter(Boolean).length, 0) / BANK[level].length
  assert.ok(avgGivens('easy') >= E.EASY_MIN_GIVENS)
  assert.ok(avgGivens('easy') > avgGivens('medium'))
  for (const s of BANK.easy.slice(0, 10)) assert.equal(E.logicSolve(E.fromString(s), 9).tier, 1, 'easy = singles only')
  for (const s of BANK['very-hard'].slice(0, 10)) assert.equal(E.logicSolve(E.fromString(s), 9).solved, false, 'very hard needs trial and error')
})

test('sudoku puzzles: every level + seed gives a valid puzzle with exactly one solution', () => {
  for (const level of ALL_LEVELS) {
    for (let seed = 1; seed <= 12; seed++) {
      const p = puzzleFor(level, seed * 7919)
      const N = p.n * p.n
      assert.equal(p.puzzle.length, N); assert.equal(p.solution.length, N)
      assert.ok(validSolution(p.solution, p.n), `${level} solution valid`)
      p.puzzle.forEach((v, i) => { if (v) assert.equal(v, p.solution[i]) })
      const r = E.countSolutions(p.puzzle, p.n, 2)
      assert.equal(r.count, 1, `${level}#${seed} unique`)
      assert.deepEqual(r.solution, p.solution)
      if (p.n === 9) assert.equal(E.grade(p.puzzle).level, level, 'transformation keeps the grade')
    }
  }
})

test('sudoku puzzles: deterministic by seed (prints and shared links are reproducible)', () => {
  for (const level of ALL_LEVELS) {
    assert.deepEqual(puzzleFor(level, 4242), puzzleFor(level, 4242))
    assert.notDeepEqual(puzzleFor(level, 4242).puzzle, puzzleFor(level, 4243).puzzle)
  }
  assert.deepEqual(dailyPuzzle('medium', '2026-10-11'), dailyPuzzle('medium', '2026-10-11'))
  assert.notDeepEqual(dailyPuzzle('medium', '2026-10-11').puzzle, dailyPuzzle('medium', '2026-10-12').puzzle)
  assert.equal(dailySeed('2026-10-11'), 20261011)
  assert.match(israelDate(new Date('2026-10-11T22:30:00Z')), /^2026-10-12$/, 'Israel is ahead of UTC')
})

test('sudoku puzzles: kids boards are small, singles-only and have enough clues', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const k4 = puzzleFor('kids4', seed), k6 = puzzleFor('kids6', seed)
    assert.equal(k4.n, 4); assert.equal(k6.n, 6)
    assert.ok(k4.puzzle.filter(Boolean).length >= 6)
    assert.ok(k6.puzzle.filter(Boolean).length >= 14)
    assert.equal(E.logicSolve(k4.puzzle, 4).tier, 1)
    assert.equal(E.logicSolve(k6.puzzle, 6).tier, 1)
  }
})

test('sudoku puzzles: generating a page of 6 hard puzzles is fast', () => {
  const t = Date.now()
  for (let i = 0; i < 60; i++) puzzleFor(['hard', 'very-hard'][i % 2], 100 + i)
  assert.ok(Date.now() - t < 1500, `took ${Date.now() - t}ms`)
})
