// "מרתון משחקים": 8 short stages in a row, every one from a different game, against the
// clock. Each stage gives a game a small goal through the same `daily` prop the daily
// challenge uses ({ seed, level?, target?, finish }).
export const MARATHON_STAGES = [
  { slug: 'memory', goal: 'מוצאים 6 זוגות', cfg: () => ({ level: 1 }) },
  { slug: 'sudoku', goal: 'פותרים סודוקו 4×4', cfg: () => ({ level: 'kids' }) },
  { slug: 'snake', goal: 'אוכלים 6 תפוחים', cfg: () => ({ target: 6 }) },
  { slug: 'merge-2048', goal: 'מגיעים למשבצת 64', cfg: () => ({ target: 64 }) },
  { slug: 'minesweeper', goal: 'מנקים שדה מוקשים קטן', cfg: () => ({ level: 'easy' }) },
  { slug: 'ball-sort', goal: 'ממיינים את הכדורים', cfg: r => ({ level: 2 + Math.floor(r() * 3) }) },
  { slug: 'traffic-jam', goal: 'משחררים את משאית הגלידה', cfg: r => ({ level: 3 + Math.floor(r() * 6) }) },
  { slug: 'arrow-escape', goal: 'מפנים את לוח החיצים', cfg: r => ({ level: 1 + Math.floor(r() * 4) }) },
  { slug: 'flying-cubes', goal: 'מפרקים את הקובייה', cfg: r => ({ level: 1 + Math.floor(r() * 3) }) },
  { slug: 'block-puzzle', goal: 'צוברים 40 נקודות', cfg: () => ({ target: 40 }) },
  { slug: 'falling-blocks', goal: 'מנקים 3 שורות', cfg: () => ({ target: 3 }) },
  { slug: 'whack-a-mole', goal: 'פוגעים ב־12 חפרפרות', cfg: () => ({ target: 12 }) },
  { slug: 'sliding-puzzle', goal: 'מסדרים פאזל 3×3', cfg: () => ({ level: 3 }) },
  { slug: 'word-guess', goal: 'מנחשים מילה אחת', cfg: () => ({}) },
]
export const MARATHON_LENGTH = 8
export const SKIP_PENALTY = 30 // seconds

export function planMarathon(rand = Math.random) {
  const pool = MARATHON_STAGES.slice()
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]] }
  return pool.slice(0, MARATHON_LENGTH).map(s => ({ slug: s.slug, goal: s.goal, ...s.cfg(rand) }))
}

export const marathonStars = sec => (sec <= 6 * 60 ? 3 : sec <= 10 * 60 ? 2 : 1)
export const clock = sec => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
