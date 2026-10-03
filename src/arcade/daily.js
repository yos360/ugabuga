// "אתגר היום" — one online game a day, the same puzzle for everyone (a seed made from the
// Israeli date), so results can be compared and shared. Changes at midnight Israel time.
import { israelDayNumber } from '../utils/israelDate.js'
import { shareLink } from '../utils/share.js'

// Rotation order (one per day, then it repeats). `extra(day)` = per-game settings.
export const DAILY_GAMES = [
  { slug: 'sudoku', name: 'סודוקו', emoji: '🔢', goal: 'פותרים את הסודוקו היומי — הכי מהר שאפשר', extra: () => ({ level: 'medium' }) },
  { slug: 'battleship', name: 'צוללות', emoji: '⚓', goal: 'מטביעים את הצי של המחשב בכמה שפחות יריות', extra: () => ({}) },
  { slug: 'ball-sort', name: 'מיון כדורים', emoji: '🧪', goal: 'ממיינים את הכדורים של היום בכמה שפחות מהלכים', extra: day => ({ level: 8 + (day % 25) }) },
  { slug: 'memory', name: 'משחק הזיכרון', emoji: '🧠', goal: 'מוצאים את כל 12 הזוגות בכמה שפחות תורות', extra: () => ({ level: 4 }) },
  { slug: 'minesweeper', name: 'שולה מוקשים', emoji: '💣', goal: 'מנקים את שדה המוקשים של היום', extra: () => ({ level: 'medium' }) },
  { slug: 'merge-2048', name: 'מכפילים עד 2048', emoji: '🔢', goal: 'צוברים כמה שיותר נקודות על הלוח של היום', extra: () => ({}) },
  { slug: 'traffic-jam', name: 'פקק תנועה', emoji: '🚚', goal: 'משחררים את משאית הגלידה בכמה שפחות מהלכים', extra: day => ({ level: 15 + (day % 45) }) },
  { slug: 'flying-cubes', name: 'קוביות מעופפות', emoji: '🧊', goal: 'מפרקים את הקובייה של היום בלי לאבד לבבות', extra: day => ({ level: 4 + (day % 12) }) },
  { slug: 'solitaire', name: 'סוליטר', emoji: '🃏', goal: 'מנצחים בחלוקת הקלפים של היום — היא בטוח פתירה!', extra: () => ({}) },
  { slug: 'snake', name: 'נחש', emoji: '🐍', goal: 'אוכלים כמה שיותר תפוחים — אותם תפוחים לכולם', extra: () => ({}) },
  { slug: 'spider-solitaire', name: 'סוליטר עכביש', emoji: '🕷️', goal: 'מפרקים את כל 8 הרצפים בכמה שפחות מהלכים', extra: () => ({}) },
  { slug: 'block-puzzle', name: 'מסיבת בלוקים', emoji: '🟨', goal: 'צוברים כמה שיותר נקודות עם הצורות של היום', extra: () => ({}) },
  { slug: 'word-guess', name: 'נחשו את המילה', emoji: '🎈', goal: 'מנחשים את המילה של היום לפני שהבלונים מתפוצצים', extra: () => ({}) },
  { slug: 'falling-blocks', name: 'בלוקים נופלים', emoji: '🧱', goal: 'צוברים כמה שיותר נקודות — אותן צורות לכולם', extra: () => ({}) },
  { slug: 'sliding-puzzle', name: 'פאזל הזזה', emoji: '🧩', goal: 'מסדרים את פאזל ה־15 של היום הכי מהר שאפשר', extra: () => ({ level: 4 }) },
  { slug: 'whack-a-mole', name: 'הכה בחפרפרת', emoji: '🔨', goal: 'צוברים כמה שיותר נקודות ב־45 שניות', extra: () => ({}) },
]

const dateFmt = new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', weekday: 'long', day: 'numeric', month: 'long' })

export function dailyFor(time = Date.now()) {
  const day = israelDayNumber(time)
  const entry = DAILY_GAMES[((day % DAILY_GAMES.length) + DAILY_GAMES.length) % DAILY_GAMES.length]
  return { day, slug: entry.slug, name: entry.name, emoji: entry.emoji, goal: entry.goal, seed: day * 7919 + 101, label: dateFmt.format(new Date(time)), ...entry.extra(day) }
}

// Milliseconds until the next Israeli midnight (when the challenge changes).
export function msToNext(time = Date.now()) {
  const today = israelDayNumber(time)
  let lo = time, hi = time + 26 * 3600e3
  while (hi - lo > 1000) { const mid = (lo + hi) / 2; if (israelDayNumber(mid) > today) hi = mid; else lo = mid }
  return hi - time
}

const KEY = 'buga-daily-v1'
export function readResults() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}
export function saveResult(day, result) {
  const all = readResults()
  const prev = all[day]
  // keep a win over a loss; otherwise the newest
  if (!(prev?.won && !result.won)) all[day] = { ...result, at: Date.now() }
  try { localStorage.setItem(KEY, JSON.stringify(all)) } catch { /* private mode */ }
  return all
}
// Days in a row with a played challenge, counting back from today (or yesterday).
export function streak(results, today) {
  let d = results[today] ? today : today - 1, n = 0
  while (results[d]) { n++; d-- }
  return n
}

export function dailyShareText(daily, done) {
  const fire = done?.streak > 1 ? `\n🔥 ${done.streak} ימים ברצף` : ''
  const line = done ? `\n${done.text}${fire}` : `\n${daily.goal}`
  return `🌟 אתגר היום של עוגה בוגה — ${daily.label}${line}\nאותו אתגר לכולם, מתחלף כל יום. מי עושה יותר טוב? 👇\n${shareLink('/online-games/today', 'daily')}`
}
