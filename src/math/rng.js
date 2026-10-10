// Small seeded random helper shared by every math-topic generator. A seed makes a worksheet
// reproducible (print + answer key) while practice mode simply uses a fresh seed each time.
export function createRng(seed = Date.now()) {
  // Mix the seed first (murmur3 finalizer) so neighbouring seeds (1, 2, 3…) give unrelated sequences.
  let s = Number(seed) >>> 0
  s = Math.imul(s ^ (s >>> 16), 0x85ebca6b) >>> 0
  s = Math.imul(s ^ (s >>> 13), 0xc2b2ae35) >>> 0
  s = (s ^ (s >>> 16)) >>> 0 || 1
  const next = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296 }
  const int = (a, b) => a + Math.floor(next() * (b - a + 1))
  const pick = arr => arr[Math.floor(next() * arr.length)]
  const shuffle = arr => { const x = [...arr]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1));[x[i], x[j]] = [x[j], x[i]] } return x }
  const bool = (p = 0.5) => next() < p
  // integer in [a,b] that is not 0 (handy for coefficients)
  const nz = (a, b) => { for (;;) { const v = int(a, b); if (v !== 0) return v } }
  return { next, int, pick, shuffle, bool, nz }
}
