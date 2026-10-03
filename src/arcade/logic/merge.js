// "Double it!" — slide the board; equal numbers that bump into each other merge
// into their double. Classic doubling puzzle (public mechanic), original look.
export const SIZE = 4

let nextId = 1
export const tile = value => ({ id: nextId++, value })

export function empty() { return Array.from({ length: SIZE }, () => Array(SIZE).fill(null)) }

export function spawn(grid, rand = Math.random) {
  const cells = []
  grid.forEach((row, y) => row.forEach((c, x) => { if (!c) cells.push([x, y]) }))
  if (!cells.length) return grid
  const [x, y] = cells[Math.floor(rand() * cells.length)]
  const next = grid.map(r => r.slice())
  next[y][x] = { ...tile(rand() < 0.9 ? 2 : 4), isNew: true }
  return next
}

export function fresh(rand = Math.random) { return spawn(spawn(empty(), rand), rand) }

// Slides one line toward index 0. Returns { line, gained, moved }.
function slideLine(line) {
  const vals = line.filter(Boolean).map(t => ({ ...t, isNew: false, merged: false }))
  const out = []
  let gained = 0
  for (let i = 0; i < vals.length; i++) {
    if (i + 1 < vals.length && vals[i].value === vals[i + 1].value) {
      const v = vals[i].value * 2
      out.push({ ...tile(v), merged: true })
      gained += v
      i++
    } else out.push(vals[i])
  }
  while (out.length < SIZE) out.push(null)
  const moved = out.some((t, i) => (t?.id ?? null) !== (line[i]?.id ?? null))
  return { line: out, gained, moved }
}

// dir: 'left' | 'right' | 'up' | 'down' (physical screen directions)
export function slide(grid, dir) {
  const next = empty()
  let gained = 0, moved = false
  for (let k = 0; k < SIZE; k++) {
    const idx = Array.from({ length: SIZE }, (_, i) => i)
    const coords = idx.map(i => {
      if (dir === 'left') return [i, k]
      if (dir === 'right') return [SIZE - 1 - i, k]
      if (dir === 'up') return [k, i]
      return [k, SIZE - 1 - i]
    })
    const res = slideLine(coords.map(([x, y]) => grid[y][x]))
    coords.forEach(([x, y], i) => { next[y][x] = res.line[i] })
    gained += res.gained
    moved ||= res.moved
  }
  return { grid: next, gained, moved }
}

export function canPlay(grid) {
  return ['left', 'right', 'up', 'down'].some(d => slide(grid, d).moved)
}
export const best = grid => Math.max(0, ...grid.flat().filter(Boolean).map(t => t.value))
