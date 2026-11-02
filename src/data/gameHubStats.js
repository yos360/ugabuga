// Facts computed from the games that a hub page (/games/<category>, /games/kita-*, /games/age/N) actually lists,
// so every hub gets its own numbers, examples and FAQ instead of sharing one template.
import { fitsNoEquipment, fitsQuiet, fitsMovement } from './gameFilters.js'

const GENERIC_TAGS = new Set(['בלי ציוד', 'ללא ציוד', 'קלאסיקה', 'קלאסי', 'פשוט', 'מהיר', 'ציוד פשוט'])
const num = v => Number(v || 0)
const minutes = g => num(g.duration_max || g.duration_min)
const heList = items => items.length < 2 ? (items[0] || '') : `${items.slice(0, -1).join(', ')} ו${items.at(-1)}`
const countWord = (n, one, many) => n === 1 ? one : `${n} ${many}`

function top(list, key, k = 3) {
  const counts = new Map()
  for (const g of list) for (const v of [].concat(key(g) || [])) if (v && !GENERIC_TAGS.has(v)) counts.set(v, (counts.get(v) || 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'he')).slice(0, k)
}

export function hubStats(list) {
  const games = list.filter(g => g && g.slug && g.name)
  if (games.length < 3) return null
  const timed = games.filter(g => minutes(g) > 0).sort((a, b) => minutes(a) - minutes(b) || a.name.localeCompare(b.name, 'he'))
  const durations = timed.map(minutes)
  const median = durations.length ? durations[Math.floor((durations.length - 1) / 2)] : 0
  const withMax = games.filter(g => num(g.max_players) > 0).sort((a, b) => num(b.max_players) - num(a.max_players) || a.name.localeCompare(b.name, 'he'))
  const open = games.filter(g => !num(g.max_players))
  const youngest = [...games].sort((a, b) => num(a.min_age) - num(b.min_age) || a.name.localeCompare(b.name, 'he'))[0]
  return {
    total: games.length,
    noGear: games.filter(fitsNoEquipment).length,
    quiet: games.filter(fitsQuiet).length,
    moving: games.filter(fitsMovement).length,
    shortest: timed[0] || null,
    longest: timed.at(-1) || null,
    median,
    biggest: open[0] || withMax[0] || null,
    biggestOpen: open.length > 0,
    youngest,
    categories: top(games, g => g.category),
    tags: top(games, g => g.tags, 4),
    locations: top(games, g => g.locations, 3),
  }
}

// Two short paragraphs that describe this hub's own collection.
export function hubStatsParagraphs(list, label) {
  const s = hubStats(list)
  if (!s) return []
  const p1 = [`ב${label} יש כרגע ${s.total} משחקים.`]
  p1.push(s.noGear === s.total ? 'אף אחד מהם לא דורש ציוד.' : s.noGear === 0 ? 'בכולם צריך ציוד כלשהו, לכן כדאי להציץ ברשימת הציוד לפני שמתחילים.' : `ב${s.noGear === 1 ? 'משחק אחד' : `־${s.noGear} מהם`} אפשר לשחק בלי שום ציוד, ובשאר הציוד הדרוש כתוב בדף של כל משחק.`)
  if (s.shortest && s.median) p1.push(`משחק טיפוסי כאן נמשך כ־${s.median} דקות. הכי קצר הוא "${s.shortest.name}" (${minutes(s.shortest)} דקות)${s.longest && s.longest !== s.shortest ? `, והכי ארוך הוא "${s.longest.name}" (${minutes(s.longest)} דקות)` : ''}.`)
  const p2 = []
  const cats = s.categories.filter(([, n]) => n > 1)
  if (cats.length) p2.push(`הסוגים הנפוצים ביותר: ${heList(cats.map(([c, n]) => `${c} (${n})`))}.`)
  p2.push(s.quiet && s.moving ? `${countWord(s.quiet, 'משחק אחד שקט', 'משחקים שקטים')} ו־${s.moving} משחקים עם תנועה — אפשר לבחור לפי האנרגיה של הילדים באותו רגע.` : s.moving ? `אין כאן משחקים שקטים במיוחד: ב־${s.moving} מהמשחקים יש תנועה, אז כדאי לפנות מקום לפני שמתחילים.` : 'אין כאן משחקי תנועה, ולכן המשחקים מתאימים גם לחדר קטן.')
  if (s.biggest) p2.push(s.biggestOpen ? `"${s.biggest.name}" מתאים לכל גודל קבוצה, ולכן הוא בחירה טובה כשמגיעים יותר ילדים מהצפוי.` : `לקבוצה הכי גדולה מתאים "${s.biggest.name}" — עד ${num(s.biggest.max_players)} משתתפים.`)
  if (s.locations.length) p2.push(`המקומות הנפוצים לשחק בהם: ${heList(s.locations.map(([l, n]) => `${l} (${n})`))}.`)
  return [p1.join(' '), p2.join(' ')]
}

// FAQ answered from this hub's list (names and numbers change per hub).
export function hubStatsFaq(list, label, { skipAge = false } = {}) {
  const s = hubStats(list)
  if (!s) return []
  const faq = []
  if (s.shortest) faq.push({ q: `מה המשחק הכי קצר ב${label}?`, a: `"${s.shortest.name}" — ${minutes(s.shortest)} דקות. ${s.shortest.short_description || ''}`.trim() })
  faq.push({ q: `כמה מהמשחקים ב${label} לא צריכים ציוד?`, a: s.noGear === s.total ? `כל ${s.total} המשחקים — אפשר להתחיל מיד.` : `${s.noGear} מתוך ${s.total}. ליד כל משחק כתוב איזה ציוד צריך, ובסינון "בלי ציוד" למעלה רואים רק את המשחקים שלא צריכים כלום.` })
  if (s.youngest && !skipAge) faq.push({ q: `מאיזה גיל מתאימים המשחקים ב${label}?`, a: `המשחק שמתאים לגיל הכי צעיר הוא "${s.youngest.name}", מגיל ${num(s.youngest.min_age)}. ליד כל משחק מופיע הגיל שלו, ובסינון למעלה אפשר לבחור גיל.` })
  return faq
}
