// A small deterministic crossword builder for the English booklets (grades 4–6). Words cross only at
// shared letters, never touch side by side, and the most compact placement wins. Same words → same grid.
// Tries every word as the first one and keeps the grid that places the most words in the least space.
export function buildCrossword(list) {
  let best = null
  for (let first = 0; first < list.length; first++) {
    const cw = buildFrom(list, first)
    const score = cw.missing.length * 100000 + cw.rows * cw.cols + Math.max(0, cw.rows - cw.cols) * 8
    if (!best || score < best.score) best = { ...cw, score }
  }
  return best
}

function buildFrom(list, first) {
  const words = list.map(w => w.toUpperCase())
  const rest = words.map((_, i) => i).filter(i => i !== first).sort((a, b) => words[b].length - words[a].length || a - b)
  const order = [first, ...rest]
  const cells = new Map(), placed = []
  const key = (r, c) => `${r},${c}`
  const get = (r, c) => cells.get(key(r, c))
  const step = dir => dir === 'down' ? [1, 0] : [0, 1]

  // Number of crossings, or -1 when the word can't go there.
  function fits(w, r, c, dir) {
    const [dr, dc] = step(dir)
    if (get(r - dr, c - dc) || get(r + dr * w.length, c + dc * w.length)) return -1
    let cross = 0
    for (let k = 0; k < w.length; k++) {
      const rr = r + dr * k, cc = c + dc * k, cell = get(rr, cc)
      if (cell) {
        if (cell.ch !== w[k] || cell.dirs.includes(dir)) return -1
        cross++
      } else if (get(rr + dc, cc + dr) || get(rr - dc, cc - dr)) return -1
    }
    return cross
  }
  function place(i, r, c, dir) {
    const w = words[i], [dr, dc] = step(dir)
    for (let k = 0; k < w.length; k++) {
      const cell = get(r + dr * k, c + dc * k)
      if (cell) cell.dirs.push(dir)
      else cells.set(key(r + dr * k, c + dc * k), { ch: w[k], dirs: [dir] })
    }
    placed.push({ i, w, r, c, dir })
  }
  const area = (w, r, c, dir) => {
    const [dr, dc] = step(dir)
    const rs = [...placed.flatMap(p => [p.r, p.r + (p.dir === 'down' ? p.w.length - 1 : 0)]), r, r + dr * (w.length - 1)]
    const cs = [...placed.flatMap(p => [p.c, p.c + (p.dir === 'across' ? p.w.length - 1 : 0)]), c, c + dc * (w.length - 1)]
    const h = Math.max(...rs) - Math.min(...rs) + 1, wd = Math.max(...cs) - Math.min(...cs) + 1
    // Prefer a page-shaped grid: wider than tall is fine, very tall is not.
    return h * wd + Math.max(0, h - wd) * 6
  }

  place(order[0], 0, 0, 'across')
  let pending = order.slice(1)
  for (let pass = 0; pass < 3 && pending.length; pass++) {
    const left = []
    for (const i of pending) {
      const w = words[i]
      let best = null
      for (const p of placed) for (let a = 0; a < p.w.length; a++) for (let b = 0; b < w.length; b++) {
        if (p.w[a] !== w[b]) continue
        const dir = p.dir === 'across' ? 'down' : 'across'
        const pr = p.dir === 'across' ? p.r : p.r + a, pc = p.dir === 'across' ? p.c + a : p.c
        const r = dir === 'down' ? pr - b : pr, c = dir === 'down' ? pc : pc - b
        const cross = fits(w, r, c, dir)
        if (cross < 1) continue
        const score = cross * 1000 - area(w, r, c, dir)
        if (!best || score > best.score) best = { r, c, dir, score }
      }
      if (best) place(i, best.r, best.c, best.dir)
      else left.push(i)
    }
    pending = left
  }

  const minR = Math.min(...[...cells.keys()].map(k => +k.split(',')[0]))
  const minC = Math.min(...[...cells.keys()].map(k => +k.split(',')[1]))
  const grid = [...cells].map(([k, v]) => { const [r, c] = k.split(',').map(Number); return { r: r - minR, c: c - minC, ch: v.ch } })
  const rows = Math.max(...grid.map(g => g.r)) + 1, cols = Math.max(...grid.map(g => g.c)) + 1
  // Clue numbers: reading order of the first letters.
  const starts = [...new Set(placed.map(p => key(p.r - minR, p.c - minC)))]
    .map(k => k.split(',').map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const numberAt = new Map(starts.map(([r, c], i) => [key(r, c), i + 1]))
  const entries = placed.map(p => ({ index: p.i, word: p.w, dir: p.dir, r: p.r - minR, c: p.c - minC, num: numberAt.get(key(p.r - minR, p.c - minC)) }))
    .sort((a, b) => a.num - b.num)
  return { grid, rows, cols, entries, numberAt, missing: pending.map(i => list[i]) }
}

export const crosswordAnswers = words => buildCrossword(words.map(w => w.word)).entries.map(e => `${e.num}${e.dir === 'across' ? '→' : '↓'} ${e.word}`)
