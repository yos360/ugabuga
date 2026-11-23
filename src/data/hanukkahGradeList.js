// Hanukkah landing pages by grade (/holidays/hanukkah/grade/<slug>): the light list the Hanukkah hub
// needs for its chooser. The page content lives in hanukkahGrades.js.
export const HANUKKAH_GRADE_BASE = '/holidays/hanukkah/grade'

export const HANUKKAH_GRADE_LIST = [
  { slug: 'kindergarten', booklet: '/booklets/hanukkah', label: 'גן', forLabel: 'לגן', emoji: '🧸', ages: 'גילאי 4–6' },
  { slug: 'grade-1', booklet: '/booklets/hanukkah-grade-1', label: 'כיתה א׳', forLabel: 'לכיתה א׳', emoji: '✏️', ages: 'גילאי 6–7' },
  { slug: 'grade-2', booklet: '/booklets/hanukkah-grade-2', label: 'כיתה ב׳', forLabel: 'לכיתה ב׳', emoji: '🍩', ages: 'גילאי 7–8' },
  { slug: 'grade-3', booklet: '/booklets/hanukkah-grade-3', label: 'כיתה ג׳', forLabel: 'לכיתה ג׳', emoji: '🎲', ages: 'גילאי 8–9' },
  { slug: 'grade-4', booklet: '/booklets/hanukkah-grade-4', label: 'כיתה ד׳', forLabel: 'לכיתה ד׳', emoji: '🕯️', ages: 'גילאי 9–10' },
  { slug: 'grade-5', booklet: '/booklets/hanukkah-grade5', label: 'כיתה ה׳', forLabel: 'לכיתה ה׳', emoji: '🔎', ages: 'גילאי 10–11' },
  { slug: 'grade-6', booklet: '/booklets/hanukkah-grade-6', label: 'כיתה ו׳', forLabel: 'לכיתה ו׳', emoji: '📜', ages: 'גילאי 11–12' },
  { slug: 'middle-school', booklet: '/booklets/hanukkah-middle-school', label: 'חטיבת ביניים', forLabel: 'לחטיבת ביניים', emoji: '🏛️', ages: 'כיתות ז׳–ט׳' },
]

// Booklets in three levels (added 23.11.2026): ⭐ basic, ⭐⭐ the regular grade booklet above, ⭐⭐⭐ challenge.
// Keyed by grade slug so each grade page can link the levels that fit it.
export const HANUKKAH_LEVEL_BOOKLETS = {
  kindergarten: [['🍼', 'גן צעיר (גילאי 3–4)', '/booklets/hanukkah-pre-k']],
  'grade-1': [['⭐', 'רמה בסיסית א׳–ב׳', '/booklets/hanukkah-easy-1-2'], ['⭐⭐⭐', 'רמת אתגר א׳–ב׳', '/booklets/hanukkah-challenge-1-2']],
  'grade-2': [['⭐', 'רמה בסיסית א׳–ב׳', '/booklets/hanukkah-easy-1-2'], ['⭐⭐⭐', 'רמת אתגר א׳–ב׳', '/booklets/hanukkah-challenge-1-2']],
  'grade-3': [['⭐', 'רמה בסיסית ג׳–ד׳', '/booklets/hanukkah-easy-3-4'], ['⭐⭐⭐', 'רמת אתגר ג׳–ד׳', '/booklets/hanukkah-challenge-3-4']],
  'grade-4': [['⭐', 'רמה בסיסית ג׳–ד׳', '/booklets/hanukkah-easy-3-4'], ['⭐⭐⭐', 'רמת אתגר ג׳–ד׳', '/booklets/hanukkah-challenge-3-4']],
  'grade-5': [['⭐⭐⭐', 'רמת אתגר ה׳–ו׳', '/booklets/hanukkah-challenge-5-6']],
  'grade-6': [['⭐⭐⭐', 'רמת אתגר ה׳–ו׳', '/booklets/hanukkah-challenge-5-6']],
  'middle-school': [['🎓', 'חוברת לכיתה ט׳', '/booklets/hanukkah-grade-9']],
}
export const HANUKKAH_LEVEL_LIST = [...new Map(Object.values(HANUKKAH_LEVEL_BOOKLETS).flat().map(l => [l[2], l])).values()]

export const hanukkahGradePath = slug => `${HANUKKAH_GRADE_BASE}/${slug}`
export const HANUKKAH_GRADE_PATHS = HANUKKAH_GRADE_LIST.map(g => hanukkahGradePath(g.slug))
