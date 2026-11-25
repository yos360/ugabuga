// Hanukkah 2026 in the "already printing? maybe also…" card (components/print/PrintSuggestions.jsx).
// Owner's request, 18.11.2026: whoever prints anything on the site is offered Hanukkah too, until the
// holiday ends. Kids'/coloring pages get the Hanukkah coloring pages; school material (booklets, math,
// reading, worksheets, classroom) gets the Hanukkah booklets by grade. Pages that are already about
// Hanukkah get nothing extra — their own recommendations are Hanukkah anyway.
export const SEASON_OFFER_ENDS = new Date('2026-12-13T00:00:00+02:00')

const COLORING = { id: 'season-hanukkah-coloring', path: '/holidays/hanukkah/coloring', emoji: '🕎', title: 'דפי צביעה לחנוכה', desc: 'חנוכיות, סביבונים וסופגניות להדפסה', season: true }
// NOTE: `/holidays/hanukkah/grade` alone is a 404 (only `/grade/<slug>` exists; 8 hits/week on 25.11.2026), so the
// card links to the grade page that matches the page being printed, or to the Hanukkah hub (which has the chooser).
const BOOKLETS = { id: 'season-hanukkah-grade', path: '/holidays/hanukkah', emoji: '🕎', title: 'חוברת חנוכה לכיתה שלכם', desc: 'מהגן ועד חטיבת הביניים, עם דף תשובות', season: true }
const SCHOOL = /^\/(booklets|math|learn|classroom|reading|english|unseen|grammar|lashon|worksheets|teachers?|planner|dictation)(\/|$)/

export function hanukkahGradeFor(path = '') {
  const m = /(?:grade|class|kita)-?([1-9])(?!\d)/i.exec(path)
  if (!m) return null
  const n = Number(m[1])
  return n <= 6 ? `/holidays/hanukkah/grade/grade-${n}` : '/holidays/hanukkah/grade/middle-school'
}

export function seasonPrintOffer(path = '/', now = new Date()) {
  if (now >= SEASON_OFFER_ENDS) return null
  if (/hanukkah|hanukkiah|sevivon|dreidel|sufganiy/.test(path)) return null
  if (!SCHOOL.test(path)) return COLORING
  const grade = hanukkahGradeFor(path)
  return grade ? { ...BOOKLETS, path: grade, title: 'חוברת חנוכה לכיתה הזו', desc: 'בעיות, קריאה ותפזורת ברמה של הכיתה, עם דף תשובות' } : BOOKLETS
}
