// Hanukkah landing pages by grade (/holidays/hanukkah/grade/<slug>): the light list the Hanukkah hub
// needs for its chooser. The page content lives in hanukkahGrades.js.
export const HANUKKAH_GRADE_BASE = '/holidays/hanukkah/grade'

export const HANUKKAH_GRADE_LIST = [
  { slug: 'kindergarten', label: 'גן', forLabel: 'לגן', emoji: '🧸', ages: 'גילאי 4–6' },
  { slug: 'grade-1', label: 'כיתה א׳', forLabel: 'לכיתה א׳', emoji: '✏️', ages: 'גילאי 6–7' },
  { slug: 'grade-2', label: 'כיתה ב׳', forLabel: 'לכיתה ב׳', emoji: '🍩', ages: 'גילאי 7–8' },
  { slug: 'grade-3', label: 'כיתה ג׳', forLabel: 'לכיתה ג׳', emoji: '🎲', ages: 'גילאי 8–9' },
  { slug: 'grade-4', label: 'כיתה ד׳', forLabel: 'לכיתה ד׳', emoji: '🕯️', ages: 'גילאי 9–10' },
  { slug: 'grade-5', label: 'כיתה ה׳', forLabel: 'לכיתה ה׳', emoji: '🔎', ages: 'גילאי 10–11' },
  { slug: 'grade-6', label: 'כיתה ו׳', forLabel: 'לכיתה ו׳', emoji: '📜', ages: 'גילאי 11–12' },
  { slug: 'middle-school', label: 'חטיבת ביניים', forLabel: 'לחטיבת ביניים', emoji: '🏛️', ages: 'כיתות ז׳–ט׳' },
]

export const hanukkahGradePath = slug => `${HANUKKAH_GRADE_BASE}/${slug}`
export const HANUKKAH_GRADE_PATHS = HANUKKAH_GRADE_LIST.map(g => hanukkahGradePath(g.slug))
