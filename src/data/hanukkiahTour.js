// Neighbourhood hanukkiah walk (/holidays/hanukkah/hanukkiah-tour): the eight nights of Hanukkah 2026
// and the spotting missions for the printable scout sheet and the on-screen tracker.

// Night n is lit on the evening of the given date (Hanukkah 2026: first candle Fri 4.12, eighth Fri 11.12).
export const TOUR_NIGHTS = [
  { n: 1, date: '2026-12-04', day: 'שישי', note: 'מדליקים לפני כניסת השבת' },
  { n: 2, date: '2026-12-05', day: 'מוצאי שבת', note: 'מדליקים אחרי צאת השבת' },
  { n: 3, date: '2026-12-06', day: 'ראשון' },
  { n: 4, date: '2026-12-07', day: 'שני' },
  { n: 5, date: '2026-12-08', day: 'שלישי' },
  { n: 6, date: '2026-12-09', day: 'רביעי' },
  { n: 7, date: '2026-12-10', day: 'חמישי' },
  { n: 8, date: '2026-12-11', day: 'שישי', note: 'מדליקים לפני כניסת השבת' },
]

// Things to spot on the walk. Every mission is done by looking from the sidewalk.
export const TOUR_MISSIONS = [
  { id: 'window-high', emoji: '🏢', text: 'חנוכייה בחלון בקומה גבוהה' },
  { id: 'door', emoji: '🚪', text: 'חנוכייה ליד דלת הכניסה' },
  { id: 'oil', emoji: '🫒', text: 'חנוכייה של שמן' },
  { id: 'colors', emoji: '🌈', text: 'חנוכייה עם נרות בכמה צבעים' },
  { id: 'two', emoji: '✌️', text: 'שתי חנוכיות או יותר באותו חלון' },
  { id: 'big', emoji: '🏛️', text: 'חנוכייה גדולה ברחוב, בכיכר או בגינה' },
  { id: 'shape', emoji: '🦁', text: 'חנוכייה בצורה מיוחדת' },
  { id: 'sevivon', emoji: '🎲', text: 'סביבון או קישוט חנוכה בחלון' },
  { id: 'count', emoji: '🔢', text: 'חנוכייה שסופרים בה את הנרות — ובודקים שהמספר נכון להערב' },
]

// Candles burning in each hanukkiah on night n: n candles plus the shamash.
export const flamesOnNight = n => n + 1

export const formatNightDate = iso => {
  const [, m, d] = iso.split('-')
  return `${Number(d)}.${Number(m)}`
}
