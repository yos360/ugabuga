// Seeded random numbers, so the same seed always rebuilds the same page (share links, "print again").
export function makeRng(seed) {
  let a = (seed >>> 0) || 1
  const next = () => { // mulberry32
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: list => list[Math.floor(next() * list.length)],
    shuffle: list => { const a2 = [...list]; for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]] } return a2 },
    chance: p => next() < p,
  }
}

export const newSeed = () => Math.floor(Math.random() * 1e9) + 1

export const AGES = [
  { id: '3-4', label: '3–4' }, { id: '4-5', label: '4–5' }, { id: '5-6', label: '5–6' }, { id: '6-7', label: '6–7' }, { id: '7plus', label: '7+' },
]
export const DIFFICULTIES = [{ id: 'easy', label: 'קל' }, { id: 'medium', label: 'בינוני' }, { id: 'hard', label: 'קשה' }]

// Age and difficulty fold into one level, 0 (youngest + easy) … 6 (7+ and hard).
export function levelOf(age, difficulty) {
  const a = Math.max(0, AGES.findIndex(x => x.id === age))
  const d = Math.max(0, DIFFICULTIES.findIndex(x => x.id === difficulty))
  return Math.min(6, Math.max(0, a + d))
}
