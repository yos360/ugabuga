import { HOLIDAY_CONFIGS } from './index'

// All holiday areas ordered by the next date they happen, for the holidays hub,
// the classroom section and the home-page banner.
export const HOLIDAYS_BY_DATE = Object.values(HOLIDAY_CONFIGS).sort((a, b) => new Date(a.info.start) - new Date(b.info.start))

export const summaryOf = h => h.summary || h.pages.slice(1).map(p => p.label).join(' · ')

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
export const whenOf = h => { const d = new Date(h.info.start); return `${MONTHS[d.getMonth()]} ${d.getFullYear()}` }

// The banner shows a holiday from ~10 weeks before it starts until it ends.
const LEAD_DAYS = 70
export function upcomingHoliday(now = new Date()) {
  return HOLIDAYS_BY_DATE.find(h => now < new Date(h.info.end) && now >= new Date(new Date(h.info.start).getTime() - LEAD_DAYS * 86400000))
}
