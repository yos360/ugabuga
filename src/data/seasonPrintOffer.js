// Hanukkah 2026 in the "already printing? maybe also…" card (components/print/PrintSuggestions.jsx).
// Owner's request, 18.11.2026: whoever prints anything on the site is offered Hanukkah too, until the
// holiday ends. Kids'/coloring pages get the Hanukkah coloring pages; school material (booklets, math,
// reading, worksheets, classroom) gets the Hanukkah booklets by grade. Pages that are already about
// Hanukkah get nothing extra — their own recommendations are Hanukkah anyway.
export const SEASON_OFFER_ENDS = new Date('2026-12-13T00:00:00+02:00')

const COLORING = { id: 'season-hanukkah-coloring', path: '/holidays/hanukkah/coloring', emoji: '🕎', title: 'דפי צביעה לחנוכה', desc: 'חנוכיות, סביבונים וסופגניות להדפסה', season: true }
const BOOKLETS = { id: 'season-hanukkah-grade', path: '/holidays/hanukkah/grade', emoji: '🕎', title: 'חוברת חנוכה לכיתה שלכם', desc: 'מהגן ועד חטיבת הביניים, עם דף תשובות', season: true }
const SCHOOL = /^\/(booklets|math|learn|classroom|reading|english|unseen|grammar|lashon|worksheets|teachers?|planner|dictation)(\/|$)/

export function seasonPrintOffer(path = '/', now = new Date()) {
  if (now >= SEASON_OFFER_ENDS) return null
  if (/hanukkah|hanukkiah|sevivon|dreidel|sufganiy/.test(path)) return null
  return SCHOOL.test(path) ? BOOKLETS : COLORING
}
