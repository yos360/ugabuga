// "ברוכים השבים" (owner's request, 2026-11-23): a visitor who comes back on another day gets a short
// greeting, once per day. Reads only the visit-day counter liveActivity already keeps on this device.
export const WELCOME_KEY = 'buga-welcome-day'

// Returns true when the greeting is due now. visitDays = the saved {day, n} counter (may be null),
// lastShown = the day string the greeting was last shown on.
export function welcomeBackDue(visitDays, lastShown, now = Date.now()) {
  const today = new Date(now).toDateString()
  if (lastShown === today) return false
  const n = Number(visitDays?.n)
  if (!visitDays?.day || !(n >= 1)) return false
  // Counter still holds an earlier day: today is a new visit day. Or it was already bumped today to 2+.
  return visitDays.day !== today || n >= 2
}
