// Per-city facts for /shabbat-times/:city, all computed from the city's coordinates and custom:
// this week compared with Jerusalem / Tel Aviv, the coming year's earliest and latest times,
// how far north/east the place is, and its nearest neighbours. Pure (no React) so tests can run it.
import { SHABBAT_PLACES, shabbatCity } from '../data/shabbatCities.js'
import { addDays, dailyTimes, formatTime, shabbatForDate } from './shabbatTimes.js'

const MINUTE = 60000
const rad = d => d * Math.PI / 180
export const distanceKm = (a, b) => {
  const h = Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(rad(b.longitude - a.longitude) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}
// Where `to` lies as seen from `from`, as a Hebrew adjective ("צפונית-מזרחית").
const DIRECTIONS = ['צפונית', 'צפונית-מזרחית', 'מזרחית', 'דרומית-מזרחית', 'דרומית', 'דרומית-מערבית', 'מערבית', 'צפונית-מערבית']
export function direction(from, to) {
  const y = Math.sin(rad(to.longitude - from.longitude)) * Math.cos(rad(to.latitude))
  const x = Math.cos(rad(from.latitude)) * Math.sin(rad(to.latitude)) - Math.sin(rad(from.latitude)) * Math.cos(rad(to.latitude)) * Math.cos(rad(to.longitude - from.longitude))
  const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
  return DIRECTIONS[Math.round(bearing / 45) % 8]
}
const clockMinutes = date => formatTime(date).split(':').reduce((h, m) => h * 60 + Number(m), 0)
const dateLabel = iso => iso.split('-').reverse().join('.')
export const minutesText = n => n === 1 ? 'דקה אחת' : n === 2 ? 'שתי דקות' : `${n} דקות`
const hoursText = h => h === 1 ? 'שעה' : h === 2 ? 'שעתיים' : `${h} שעות`
export const durationText = mins => {
  const h = Math.floor(mins / 60), m = mins % 60
  const mt = minutesText(m)
  return !h ? mt : m ? `${hoursText(h)} ${/^\d/.test(mt) ? 'ו־' : 'ו'}${mt}` : hoursText(h)
}
// "3 דקות מוקדם יותר" / "באותה דקה"
const diffText = n => n === 0 ? 'באותה דקה' : `${minutesText(Math.abs(n))} ${n < 0 ? 'מוקדם יותר' : 'מאוחר יותר'}`
// "3 דקות מוקדם יותר מאשר בירושלים" / "באותה דקה כמו בירושלים"
const vs = (n, place) => n === 0 ? `באותה דקה כמו ב${place}` : `${diffText(n)} מאשר ב${place}`

export function cityFacts(city, today) {
  const week = shabbatForDate(city, today)
  if (!week) return null
  const refSlugs = city.slug === 'jerusalem' ? ['tel-aviv', 'haifa'] : city.slug === 'tel-aviv' ? ['jerusalem', 'haifa'] : ['jerusalem', 'tel-aviv']
  const compare = refSlugs.map(shabbatCity).map(ref => {
    const r = shabbatForDate(ref, today)
    return {
      ref, km: Math.round(distanceKm(ref, city)), dir: direction(ref, city),
      candles: clockMinutes(week.candles) - clockMinutes(r.candles), end: clockMinutes(week.end) - clockMinutes(r.end),
      sunset: Math.round((week.sunset - r.sunset) / MINUTE), refTimes: r,
    }
  })
  // The coming 52 Shabbatot: earliest/latest candle lighting and nightfall, longest/shortest Shabbat,
  // and how this place's Friday sunset drifts against the first reference city through the year.
  const base = compare[0].ref
  const year = Array.from({ length: 52 }, (_, i) => {
    const friday = addDays(week.friday, i * 7), saturday = addDays(friday, 1)
    const a = dailyTimes(city, friday), b = dailyTimes(city, saturday), r = dailyTimes(base, friday)
    return { friday, saturday, candles: a.candles, end: b.nightfall, length: Math.round((b.nightfall - a.candles) / MINUTE), sunsetGap: Math.round((a.sunset - r.sunset) / MINUTE) }
  })
  const pick = (key, cmp) => year.reduce((best, s) => cmp(key(s), key(best)) ? s : best)
  const earliest = pick(s => clockMinutes(s.candles), (a, b) => a < b), latest = pick(s => clockMinutes(s.candles), (a, b) => a > b)
  const earliestEnd = pick(s => clockMinutes(s.end), (a, b) => a < b), latestEnd = pick(s => clockMinutes(s.end), (a, b) => a > b)
  const shortest = pick(s => s.length, (a, b) => a < b), longest = pick(s => s.length, (a, b) => a > b)
  const gapMin = pick(s => s.sunsetGap, (a, b) => a < b), gapMax = pick(s => s.sunsetGap, (a, b) => a > b)
  const byLat = [...SHABBAT_PLACES].sort((a, b) => b.latitude - a.latitude), byLon = [...SHABBAT_PLACES].sort((a, b) => b.longitude - a.longitude)
  const neighbours = SHABBAT_PLACES.filter(c => c.slug !== city.slug).map(c => [distanceKm(city, c), c]).sort((a, b) => a[0] - b[0]).slice(0, 6).map(([d, c]) => {
    const t = shabbatForDate(c, today)
    return { city: c, km: Math.round(d), dir: direction(city, c), candles: clockMinutes(t.candles) - clockMinutes(week.candles), end: clockMinutes(t.end) - clockMinutes(week.end), offset: c.offset }
  })
  return {
    city, week, compare, base, year, earliest, latest, earliestEnd, latestEnd, shortest, longest, gapMin, gapMax, neighbours,
    weekLength: Math.round((week.end - week.candles) / MINUTE),
    northRank: byLat.indexOf(city) + 1, eastRank: byLon.indexOf(city) + 1, total: SHABBAT_PLACES.length,
  }
}

const OFFSET_TEXT = {
  40: 'בירושלים נהוג להדליק נרות 40 דקות לפני השקיעה, מנהג ותיק של העיר. לכן הדלקת הנרות בה מוקדמת בהרבה מהערים האחרות, גם כשהשקיעה עצמה כמעט זהה.',
  30: city => `ב${city.name} מקובל להדליק 30 דקות לפני השקיעה. זה יותר מ־20 הדקות המקובלות ברוב הערים, ולכן הדלקת הנרות כאן מוקדמת בכעשר דקות מעיר שכנה שמשתמשת ב־20 דקות.`,
  22: city => `ב${city.name} מקובל להדליק 22 דקות לפני השקיעה. זה קרוב ל־20 הדקות המקובלות ברוב הערים, ולכן ההבדל מערים שכנות קטן ונובע בעיקר מהשקיעה.`,
  20: city => `ב${city.name} מוצגת הדלקה 20 דקות לפני השקיעה, המנהג הרווח ברוב הארץ. מי שנוהג אחרת יכול לבחור בעמוד הראשי מספר דקות אחר (18, 22, 30 או 40).`,
}
const regionWord = (city, base) => {
  const north = city.latitude - base.latitude, east = city.longitude - base.longitude
  const parts = []
  if (Math.abs(north) > 0.15) parts.push(north > 0 ? 'צפונית' : 'דרומית')
  if (Math.abs(east) > 0.1) parts.push(east > 0 ? 'מזרחית' : 'מערבית')
  return parts
}
const sunsetVs = (n, place) => n === 0 ? `כמעט באותו רגע כמו ב${place}` : vs(n, place)

// Visible paragraphs: each one built from this city's own numbers.
export function cityParagraphs(f) {
  const { city, week, compare, base } = f
  const [a, b] = compare
  const rank = f.northRank === 1 ? `המקום הצפוני ביותר מבין ${f.total} הערים והמועצות שבאתר` : f.northRank === f.total ? `המקום הדרומי ביותר מבין ${f.total} הערים והמועצות שבאתר`
    : f.northRank <= f.total / 2 ? `במקום ה־${f.northRank} מצפון מבין ${f.total} הערים והמועצות שבאתר` : `במקום ה־${f.total - f.northRank + 1} מדרום מבין ${f.total} הערים והמועצות שבאתר`
  const gapTo = base.name
  const drift = regionWord(city, base)
  const why = drift.length
    ? `${city.name} נמצאת ${drift.join(' ו')} ל${gapTo}. ככל שמקום מזרחי יותר, השמש שוקעת בו מוקדם יותר; וככל שהוא צפוני יותר, ימי הקיץ בו ארוכים יותר וימי החורף קצרים יותר — ולכן הפער משתנה עם העונות.`
    : `${city.name} קרובה ל${gapTo} גם בקו הרוחב וגם בקו האורך, ולכן הפער בשקיעה קטן כל השנה.`
  const gapRange = f.gapMin.sunsetGap === f.gapMax.sunsetGap
    ? `כמעט בכל שבתות השנה השקיעה ב${city.name} ${sunsetVs(f.gapMin.sunsetGap, gapTo)}.`
    : `במהלך השנה הקרובה הפער בשקיעה בין ${city.name} ל${gapTo} משתנה: ביום שישי ${dateLabel(f.gapMin.friday)} השמש שוקעת כאן ${sunsetVs(f.gapMin.sunsetGap, gapTo)}, וביום שישי ${dateLabel(f.gapMax.friday)} ${sunsetVs(f.gapMax.sunsetGap, gapTo)}.`
  const spread = f.longest.length - f.shortest.length
  return [
    `${city.name} נמצאת כ־${a.km} ק״מ ${a.dir} ל${a.ref.name} וכ־${b.km} ק״מ ${b.dir} ל${b.ref.name}, בקו רוחב ${city.latitude.toFixed(2)}° — ${rank}. השבת הקרובה (${dateLabel(week.saturday)}, ${week.reading.name}) נכנסת בה ביום שישי בשעה ${formatTime(week.candles)} ויוצאת במוצאי שבת בשעה ${formatTime(week.end)}, כך שהיא נמשכת ${durationText(f.weekLength)}.`,
    (typeof OFFSET_TEXT[city.offset] === 'function' ? OFFSET_TEXT[city.offset](city) : OFFSET_TEXT[city.offset]) || `ב${city.name} מוצגת הדלקה ${city.offset} דקות לפני השקיעה.`,
    `השוואה לשבת הזו: ב${a.ref.name} מדליקים בשעה ${formatTime(a.refTimes.candles)}, ולכן ב${city.name} ההדלקה ${vs(a.candles, a.ref.name)} וצאת השבת ${vs(a.end, a.ref.name)}. ב${b.ref.name} מדליקים בשעה ${formatTime(b.refTimes.candles)} — ההדלקה כאן ${vs(b.candles, b.ref.name)}. השקיעה עצמה, בלי מנהג ההדלקה, מגיעה כאן ${sunsetVs(a.sunset, a.ref.name)}.`,
    `${gapRange} ${why}`,
    `בשנה הקרובה הדלקת הנרות המוקדמת ביותר ב${city.name} היא בשעה ${formatTime(f.earliest.candles)} (שישי ${dateLabel(f.earliest.friday)}), והמאוחרת ביותר בשעה ${formatTime(f.latest.candles)} (שישי ${dateLabel(f.latest.friday)}). צאת השבת נעה בין ${formatTime(f.earliestEnd.end)} ל־${formatTime(f.latestEnd.end)}. השבת הקצרה ביותר (${dateLabel(f.shortest.saturday)}) נמשכת ${durationText(f.shortest.length)} והארוכה ביותר (${dateLabel(f.longest.saturday)}) ${durationText(f.longest.length)} — הבדל של ${durationText(spread)} בלבד, כי השקיעה וצאת השבת זזות כמעט יחד במהלך השנה.`,
  ]
}

export function cityFaq(f) {
  const { city, week, compare } = f
  const [a] = compare
  const near = f.neighbours[0]
  return [
    { q: `מתי כניסת השבת ב${city.name} השבוע?`, a: `ב${city.name}, בשבת ${dateLabel(week.saturday)} (${week.reading.name}): הדלקת נרות ביום שישי ${dateLabel(week.friday)} בשעה ${formatTime(week.candles)}, ${city.offset} דקות לפני השקיעה. צאת השבת בשעה ${formatTime(week.end)}, לפי 8.5 מעלות.` },
    { q: `מה ההבדל בין זמני השבת ב${city.name} ל${a.ref.name}?`, a: `השבוע הדלקת הנרות ב${city.name} ${vs(a.candles, a.ref.name)}, וצאת השבת ${vs(a.end, a.ref.name)}. ${city.name} נמצאת כ־${a.km} ק״מ ${a.dir} ל${a.ref.name}; ההבדל נובע מהשקיעה במקום${a.ref.offset !== city.offset ? ` וממנהג ההדלקה (${city.offset} דקות כאן, ${a.ref.offset} ב${a.ref.name})` : ''}.` },
    { q: `מתי מדליקים נרות שבת הכי מוקדם והכי מאוחר ב${city.name}?`, a: `בשנה הקרובה מדליקים ב${city.name} הכי מוקדם בשעה ${formatTime(f.earliest.candles)} ביום שישי ${dateLabel(f.earliest.friday)}, והכי מאוחר בשעה ${formatTime(f.latest.candles)} ביום שישי ${dateLabel(f.latest.friday)}.` },
    { q: `כמה זמן נמשכת השבת ב${city.name}?`, a: `מהדלקת הנרות עד צאת השבת ב${city.name}: השבוע ${durationText(f.weekLength)}. בשנה הקרובה השבת הקצרה ביותר נמשכת ${durationText(f.shortest.length)} (${dateLabel(f.shortest.saturday)}) והארוכה ביותר ${durationText(f.longest.length)} (${dateLabel(f.longest.saturday)}).` },
    ...(near ? [{ q: `מה העיר הקרובה ל${city.name} שיש לה לוח זמני שבת?`, a: `${near.city.name}, כ־${near.km} ק״מ ${near.dir} ל${city.name}. השבוע הדלקת הנרות שם ${vs(near.candles, city.name)}.` }] : []),
    { q: 'איך מחשבים כאן את צאת השבת?', a: 'כשהשמש נמצאת 8.5 מעלות מתחת לאופק. הזמן מעוגל כלפי מעלה לדקה שלמה. זה אינו זמן רבנו תם, ויש קהילות הנוהגות אחרת.' },
  ]
}

export function cityDescription(f) {
  const { city, compare } = f
  // Evergreen on purpose: the prerendered HTML must not carry a specific date or time that goes stale after that Shabbat.
  return `זמני כניסת ויציאת שבת ב${city.name} השבוע: הדלקת נרות, צאת שבת ופרשת השבוע. השוואה ל${compare[0].ref.name}, הזמנים המוקדמים והמאוחרים בשנה ולוח להדפסה.`
}
