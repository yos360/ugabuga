// Game filters shared by /games (GamesIndex), the category pages (/games/<slug>, CategoryPage)
// and the category definitions in gameCategories.js — so a filter button and its category page
// always list exactly the same games.
const has = (list, value) => Array.isArray(list) && list.includes(value)

export const fitsBirthday = g => has(g.contexts, 'יום הולדת')
export const fitsClassroom = g => has(g.contexts, 'כיתה')
export const fitsFamily = g => has(g.contexts, 'משפחה')
export const fitsAfterSchool = g => has(g.contexts, 'צהרון') || has(g.contexts, 'כיתה')
export const fitsNoEquipment = g => !g.equipment_needed
export const fitsQuiet = g => g.noise_level === 'low'
export const fitsMovement = g => g.energy_level === 'high' || g.energy_level === 'medium'
export const fitsIcebreaker = g => has(g.goals, 'שובר קרח') || has(g.goals, 'להכיר')
export const fitsTrivia = g => (g.category || '').includes('ידע') || (g.category || '').includes('טריוויה')

export const fitsAge = (g, age) => Number(g.min_age || 0) <= age && (!g.max_age || Number(g.max_age) >= age)
export const fitsDuration = (g, max) => Number(g.duration_min || g.duration_max || 0) > 0 && Number(g.duration_min || g.duration_max) <= max

// The one row of filter buttons on /games. `id` is the ?context= value (kept from older links).
export const GAME_FILTERS = [
  { id: 'יום הולדת', label: '🎂 יום הולדת', title: 'משחקים ליום הולדת', test: fitsBirthday },
  { id: 'כיתה', label: '🏫 כיתה', title: 'משחקים לכיתה', test: fitsClassroom },
  { id: 'משפחה', label: '🏠 משפחה', title: 'משחקים למשפחה', test: fitsFamily },
  { id: 'צהרון', label: '🧃 צהרון', title: 'משחקים לצהרון', test: fitsAfterSchool },
  { id: 'בלי ציוד', label: '🙌 בלי ציוד', title: 'משחקים בלי ציוד', test: fitsNoEquipment },
  { id: 'שקטים', label: '🤫 שקטים', title: 'משחקים שקטים', test: fitsQuiet },
  { id: 'תנועה', label: '🏃 תנועה', title: 'משחקי תנועה', test: fitsMovement },
  { id: 'שוברי קרח', label: '👋 שוברי קרח', title: 'משחקי היכרות ושוברי קרח', test: fitsIcebreaker },
  { id: 'טריוויה', label: '🎯 טריוויה וידע', title: 'משחקי טריוויה וידע', test: fitsTrivia },
]
export const gameFilter = id => GAME_FILTERS.find(f => f.id === id)

// "10–20 דק׳", or "10 דק׳" when both ends are the same. The range is wrapped in LRI…PDI so RTL text
// can't flip it to "20–10".
export function durationLabel(g) {
  const min = Number(g.duration_min || 0), max = Number(g.duration_max || 0)
  if (min && max && max !== min) return `⁦${min}–${max}⁩ דק׳`
  return `${min || max} דק׳`
}

// "נמצאו N משחקים" with correct Hebrew for 0 / 1 / many, and "N מתוך M" while a filter is on.
export function gamesCountText(shown, total, filtered = false) {
  if (!shown) return 'לא נמצאו משחקים — נסו להסיר סינון'
  if (filtered && shown !== total) return shown === 1 ? `נמצא משחק אחד מתוך ${total}` : `נמצאו ${shown} מתוך ${total} משחקים`
  return shown === 1 ? 'נמצא משחק אחד' : `נמצאו ${shown} משחקים`
}
