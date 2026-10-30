// School year תשפ"ז (2026–2027) for the timetable planner: first and last day and the days without school
// (Ministry of Education holiday calendar, as published on karamel.co.il/לוח_חופשות_משרד_החינוך.asp and
// mako; checked 2026-10-30). Teachers can add days of their own (a trip, a school event) in the planner.
// Dates are civil, Israel time, inclusive. Friday is a school day in some schools; the timetable decides.
export const SCHOOL_YEAR = {
  id: '5787', name: 'תשפ״ז',
  start: '2026-09-01',
  end: { elementary: '2027-06-30', secondary: '2027-06-20' },
  breaks: [
    ['2026-09-11', '2026-09-13', 'ראש השנה'],
    ['2026-09-20', '2026-10-03', 'יום כיפור וחופשת סוכות'],
    ['2026-12-06', '2026-12-12', 'חופשת חנוכה'],
    ['2027-03-23', '2027-03-24', 'פורים'],
    // The published sources disagree on the day school resumes after Pesach (28 or 29 April) — the
    // longer break is kept; a teacher whose school returns earlier can mark it in the planner.
    ['2027-04-13', '2027-04-29', 'חופשת פסח'],
    ['2027-05-12', '2027-05-12', 'יום העצמאות'],
    ['2027-06-10', '2027-06-11', 'שבועות'],
  ],
}

const pad = n => String(n).padStart(2, '0')
export const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const dateOf = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (iso, n) => { const d = dateOf(iso); d.setDate(d.getDate() + n); return isoOf(d) }
// The Sunday that starts the week of a date.
export const weekStart = iso => addDays(iso, -dateOf(iso).getDay())

// Why there is no school on a date, or null. `extra` = the teacher's own days off ([iso, label] pairs).
export function noSchool(iso, { level = 'elementary', extra = [] } = {}) {
  if (iso < SCHOOL_YEAR.start) return 'לפני פתיחת השנה'
  if (iso > SCHOOL_YEAR.end[level]) return 'אחרי סוף השנה'
  if (dateOf(iso).getDay() === 6) return 'שבת'
  const hit = SCHOOL_YEAR.breaks.find(([a, b]) => iso >= a && iso <= b)
  if (hit) return hit[2]
  const own = extra.find(([d]) => d === iso)
  return own ? own[1] || 'אין לימודים' : null
}
