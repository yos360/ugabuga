// Every ready maze is a perfect maze whose solution runs from the entrance to the exit through open walls
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { MAZE_LEVELS, readyMaze } = await import('../src/pages/printables/mazeData.js')
const D = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }
test('30 ready mazes are solvable and distinct', () => {
  const sigs = new Set()
  for (let li = 0; li < MAZE_LEVELS.length; li++) for (let ti = 0; ti < 6; ti++) {
    const m = readyMaze(li, ti)
    const sol = m.solution
    assert.deepEqual([sol[0].c, sol[0].r], [m.start.c, m.start.r])
    assert.deepEqual([sol.at(-1).c, sol.at(-1).r], [m.goal.c, m.goal.r])
    for (let i = 1; i < sol.length; i++) {
      const a = sol[i - 1], b = sol[i]
      const d = Object.keys(D).find(k => a.c + D[k][0] === b.c && a.r + D[k][1] === b.r)
      assert.ok(d && !m.walls[a.r][a.c][d], `level ${li} maze ${ti} step ${i}`)
    }
    // perfect maze: open passages = cells - 1 (a tree), so exactly one route
    let open = 0
    for (let r = 0; r < m.rows; r++) for (let c = 0; c < m.cols; c++) { if (!m.walls[r][c].e && c < m.cols - 1) open++; if (!m.walls[r][c].s && r < m.rows - 1) open++ }
    assert.equal(open, m.rows * m.cols - 1)
    sigs.add(JSON.stringify(m.walls))
  }
  assert.equal(sigs.size, 30)
})
