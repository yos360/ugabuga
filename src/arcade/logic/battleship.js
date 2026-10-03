// "Submarines" / Battleship (public-domain pencil-and-paper game) against the computer.
// 10×10 sea, five ships that never touch each other (not even at the corners). A hit
// earns another shot. When a ship sinks, the water around it is revealed for free.
export const N = 10
export const FLEET = [
  { name: 'נושאת מטוסים', len: 5 },
  { name: 'משחתת', len: 4 },
  { name: 'צוללת', len: 3 },
  { name: 'סירת טילים', len: 3 },
  { name: 'סירת סיור', len: 2 },
]

const around = i => {
  const x = i % N, y = Math.floor(i / N), out = []
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy
    if ((dx || dy) && nx >= 0 && ny >= 0 && nx < N && ny < N) out.push(ny * N + nx)
  }
  return out
}

export function randomFleet(rand = Math.random) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const blocked = new Set(), ships = []
    let ok = true
    for (const s of FLEET) {
      let placed = false
      for (let t = 0; t < 300 && !placed; t++) {
        const h = rand() < 0.5
        const x = Math.floor(rand() * (h ? N - s.len + 1 : N)), y = Math.floor(rand() * (h ? N : N - s.len + 1))
        const cells = Array.from({ length: s.len }, (_, k) => (y + (h ? 0 : k)) * N + x + (h ? k : 0))
        if (cells.some(c => blocked.has(c))) continue
        cells.forEach(c => { blocked.add(c); around(c).forEach(a => blocked.add(a)) })
        ships.push({ ...s, cells })
        placed = true
      }
      if (!placed) { ok = false; break }
    }
    if (ok) return ships
  }
  throw new Error('battleship: could not place fleet')
}

// sea: { ships, shots: { [cell]: 'hit' | 'miss' } }
export const newSea = ships => ({ ships, shots: {} })
export const shipAt = (sea, i) => sea.ships.findIndex(s => s.cells.includes(i))
export const isSunk = (sea, k) => sea.ships[k].cells.every(c => sea.shots[c] === 'hit')
export const allSunk = sea => sea.ships.every((_, k) => isSunk(sea, k))

// Returns { sea, result: 'miss' | 'hit' | 'sunk' | null (already shot) , ship }
export function fire(sea, i) {
  if (sea.shots[i]) return { sea, result: null }
  const k = shipAt(sea, i)
  const shots = { ...sea.shots, [i]: k >= 0 ? 'hit' : 'miss' }
  let next = { ...sea, shots }
  if (k < 0) return { sea: next, result: 'miss' }
  if (!isSunk(next, k)) return { sea: next, result: 'hit', ship: k }
  // sunk: reveal the water around it
  const extra = {}
  for (const c of next.ships[k].cells) for (const a of around(c)) if (!shots[a]) extra[a] = 'miss'
  next = { ...next, shots: { ...shots, ...extra } }
  return { sea: next, result: 'sunk', ship: k }
}

// Computer's next shot. smart=false → random; smart=true → hunt in a checkerboard,
// then finish off a wounded ship along its line.
export function aiShot(sea, smart = true, rand = Math.random) {
  const free = []
  for (let i = 0; i < N * N; i++) if (!sea.shots[i]) free.push(i)
  if (!free.length) return -1
  if (smart) {
    const wounded = Object.keys(sea.shots).map(Number).filter(i => sea.shots[i] === 'hit' && !isSunk(sea, shipAt(sea, i)))
    if (wounded.length) {
      const cand = new Set()
      const ys = wounded.map(i => Math.floor(i / N))
      const line = wounded.length > 1 ? (ys.every(y => y === ys[0]) ? 'h' : 'v') : null
      for (const i of wounded) {
        const x = i % N, y = Math.floor(i / N)
        const opts = []
        if (line !== 'v') opts.push([x - 1, y], [x + 1, y])
        if (line !== 'h') opts.push([x, y - 1], [x, y + 1])
        for (const [nx, ny] of opts) if (nx >= 0 && ny >= 0 && nx < N && ny < N && !sea.shots[ny * N + nx]) cand.add(ny * N + nx)
      }
      const list = [...cand]
      if (list.length) return list[Math.floor(rand() * list.length)]
    }
    const parity = free.filter(i => ((i % N) + Math.floor(i / N)) % 2 === 0)
    const pool = parity.length ? parity : free
    return pool[Math.floor(rand() * pool.length)]
  }
  return free[Math.floor(rand() * free.length)]
}

