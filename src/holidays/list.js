import { HOLIDAY_CONFIGS } from './index'

// A holiday can list more than one date (info + info.also, e.g. this year's Sukkot
// and next year's). The site always shows the first one that hasn't ended yet.
export function currentInfo(h, now = new Date()) {
  const all = [h.info, ...(h.info.also || [])].sort((a, b) => new Date(a.start) - new Date(b.start))
  return all.find(o => new Date(o.end) > now) || all[all.length - 1]
}

// All holiday areas ordered by the next date they happen, for the holidays hub,
// the classroom section and the home-page banner.
export const isOver = (h, now = new Date()) => new Date(currentInfo(h, now).end) <= now

export const HOLIDAYS_BY_DATE = Object.values(HOLIDAY_CONFIGS).sort((a, b) => new Date(currentInfo(a).start) - new Date(currentInfo(b).start))

export const summaryOf = h => h.summary || h.pages.slice(1).map(p => p.label).join(' · ')

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
export const whenOf = h => { const d = new Date(currentInfo(h).start); return `${MONTHS[d.getMonth()]} ${d.getFullYear()}` }

// The banner shows a holiday from ~10 weeks before it starts until it ends.
const LEAD_DAYS = 70
export function upcomingHoliday(now = new Date()) {
  return HOLIDAYS_BY_DATE.find(h => { const o = currentInfo(h, now); return now < new Date(o.end) && now >= new Date(new Date(o.start).getTime() - LEAD_DAYS * 86400000) })
}
