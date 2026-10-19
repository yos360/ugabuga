// Daily game persistence and sharing; the schedule is also used by the edge renderer.
import { shareLink } from '../utils/share.js'
export { NOT_DAILY, DAILY_GAMES, dailyFor, msToNext } from './dailySchedule.js'

const KEY = 'buga-daily-v1'
export function readResults() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}
export function saveResult(day, result) {
  const all = readResults()
  const prev = all[day]
  if (!(prev?.won && !result.won)) all[day] = { ...result, at: Date.now() }
  try { localStorage.setItem(KEY, JSON.stringify(all)) } catch { /* private mode */ }
  return all
}
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
