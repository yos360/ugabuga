// The 15 puzzle (and its 3×3 / 5×5 cousins): slide tiles into the empty spot until
// they are in order. Shuffling is done with real moves, so every board is solvable.
export const solved = n => [...Array.from({ length: n * n - 1 }, (_, i) => i + 1), 0]
export const isSolved = b => b.every((v, i) => v === (i === b.length - 1 ? 0 : i + 1))

// Tap any tile in the empty spot's row or column: it and the tiles between slide over.
export function slide(b, n, idx) {
  const e = b.indexOf(0)
  const er = Math.floor(e / n), ec = e % n, r = Math.floor(idx / n), c = idx % n
  if (idx === e || (r !== er && c !== ec)) return null
  const out = b.slice()
  const step = r === er ? (c < ec ? -1 : 1) : (r < er ? -n : n)
  let cur = e
  while (cur !== idx) { out[cur] = out[cur + step]; cur += step }
  out[idx] = 0
  return out
}

export function shuffle(n, rand = Math.random, moves = n * n * 25) {
  let b = solved(n), last = -1
  for (let k = 0; k < moves; k++) {
    const e = b.indexOf(0), r = Math.floor(e / n), c = e % n
    const opts = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
      .filter(([y, x]) => y >= 0 && x >= 0 && y < n && x < n).map(([y, x]) => y * n + x).filter(i => i !== last)
    const pick = opts[Math.floor(rand() * opts.length)]
    last = e
    b = slide(b, n, pick)
  }
  return isSolved(b) ? shuffle(n, rand, moves) : b
}

// How many tiles are already home (for a little progress meter).
export const inPlace = b => b.filter((v, i) => v && v === i + 1).length
