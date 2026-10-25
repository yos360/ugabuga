// Seeded word-search grid (same grid on the server snapshot and in the browser):
// words go right-to-left in a row or top-down in a column; final letters are in the filler too.
const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשתךםןףץ'
export function seeded(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }

export function wordSearch(words, size, seed = 1, alphabet = LETTERS) {
  const rnd = seeded(seed)
  for (let tries = 0; tries < 200; tries++) {
    const grid = Array.from({ length: size }, () => Array(size).fill(null)), placed = []
    let ok = true
    for (const word of words) {
      const w = [...word]
      let done = false
      for (let a = 0; a < 80 && !done; a++) {
        const down = rnd() < 0.4, r = Math.floor(rnd() * (down ? size - w.length + 1 : size)), c = Math.floor(rnd() * (down ? size : size - w.length + 1))
        if (r < 0 || c < 0) break
        const cells = w.map((_, i) => down ? [r + i, c] : [r, c + i])
        if (cells.every(([y, x], i) => !grid[y][x] || grid[y][x] === w[i])) { cells.forEach(([y, x], i) => { grid[y][x] = w[i] }); placed.push({ word, cells }); done = true }
      }
      if (!done) { ok = false; break }
    }
    if (!ok) continue
    for (const row of grid) for (let c = 0; c < size; c++) if (!row[c]) row[c] = alphabet[Math.floor(rnd() * alphabet.length)]
    return { grid, placed }
  }
  throw new Error('word search: could not place the words')
}
