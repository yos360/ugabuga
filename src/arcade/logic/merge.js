// "Double it!" — slide the board; equal numbers that bump into each other merge
// into their double. Classic doubling puzzle (public mechanic), original look.
//
// The board is a list of tiles { id, value, x, y }. A tile keeps its id while it
// slides, so the screen can animate it. When two tiles merge, both slide to the
// meeting cell and disappear ("ghosts"), and a brand-new tile with the doubled value
// appears there (new id → it pops in).
export const SIZE = 4

let nextId = 1
const tile = (value, x, y, extra) => ({ id: nextId++, value, x, y, ...extra })

export function spawn(tiles, rand = Math.random) {
  const used = new Set(tiles.map(t => `${t.x},${t.y}`))
  const free = []
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if (!used.has(`${x},${y}`)) free.push([x, y])
  if (!free.length) return tiles
  const [x, y] = free[Math.floor(rand() * free.length)]
  return [...tiles, tile(rand() < 0.9 ? 2 : 4, x, y, { isNew: true })]
}

export function fresh(rand = Math.random) { return spawn(spawn([], rand), rand) }

// Cell coordinates of line k, ordered from the edge the tiles slide toward.
function lineCells(dir, k) {
  return Array.from({ length: SIZE }, (_, i) => {
    if (dir === 'left') return [i, k]
    if (dir === 'right') return [SIZE - 1 - i, k]
    if (dir === 'up') return [k, i]
    return [k, SIZE - 1 - i] // down
  })
}

// dir: 'left' | 'right' | 'up' | 'down' (physical screen directions).
// Returns { tiles, ghosts, gained, moved }.
export function move(tiles, dir) {
  const at = new Map(tiles.map(t => [`${t.x},${t.y}`, t]))
  const out = [], ghosts = []
  let gained = 0, moved = false
  for (let k = 0; k < SIZE; k++) {
    const cells = lineCells(dir, k)
    const line = cells.map(([x, y]) => at.get(`${x},${y}`)).filter(Boolean)
    let pos = 0
    let last = null // last placed tile in this line, if it may still merge
    for (const t of line) {
      if (last && last.value === t.value) {
        // t and last meet in last's cell and become one doubled tile
        const { x, y } = last
        ghosts.push({ ...last, isNew: false, merged: false }, { ...t, x, y, isNew: false, merged: false })
        out[out.indexOf(last)] = tile(t.value * 2, x, y, { merged: true })
        gained += t.value * 2
        moved = true
        last = null
        continue
      }
      const [x, y] = cells[pos++]
      if (x !== t.x || y !== t.y) moved = true
      last = { ...t, x, y, isNew: false, merged: false }
      out.push(last)
    }
  }
  return { tiles: out, ghosts, gained, moved }
}

export function canPlay(tiles) {
  if (tiles.length < SIZE * SIZE) return true
  const at = new Map(tiles.map(t => [`${t.x},${t.y}`, t.value]))
  for (const t of tiles) {
    if (at.get(`${t.x + 1},${t.y}`) === t.value || at.get(`${t.x},${t.y + 1}`) === t.value) return true
  }
  return false
}

export const best = tiles => Math.max(0, ...tiles.map(t => t.value))
