import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { israelToday } from '../../utils/parashaCalendar'

// Top of the home page, kept to two light elements: a dated chip (Knesset elections, shown until the
// day after) next to the print chip, and a one-line BugaPedia question box.
const ELECTION_DAY = '2026-10-27'
const ELECTION_LAST = '2026-10-28'

// Rendered only after mount: the home page is prerendered, and a date-dependent chip in the snapshot
// would not match the visitor's day.
export function ElectionChip() {
  const [today, setToday] = useState('')
  useEffect(() => { setToday(israelToday()) }, [])
  if (!today || today > ELECTION_LAST) return null
  const label = today < ELECTION_DAY ? 'בחירות לכנסת ב־27.10' : today === ELECTION_DAY ? 'היום בחירות לכנסת' : 'אחרי הבחירות'
  return <Link to="/tools/class-elections" className="print-strip election-chip no-print"><span aria-hidden="true">🗳️</span><span>{label} — <b>מה זה בחירות?</b> הדמיה לכיתה</span></Link>
}

// The shared "who brings what" list for parties and class events — the owner asked for it at the top.
export function BringChip() {
  return <Link to="/tools/bring-list" className="print-strip election-chip no-print"><span aria-hidden="true">🧺</span><span><b>מי מביא מה?</b> רשימה שיתופית למסיבה — בלי בלגן</span></Link>
}

export function BugaPediaBox() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const ask = e => { e.preventDefault(); const v = q.trim(); navigate(v ? `/bugapedia?q=${encodeURIComponent(v)}` : '/bugapedia') }
  return <form className="home-bp" onSubmit={ask} role="search" aria-label="שאלה לבוגה־פדיה">
    <span className="home-bp-mark" aria-hidden="true">בּ</span>
    <input value={q} onChange={e => setQ(e.target.value)} maxLength={180} placeholder="שאלו את בוגה־פדיה כל שאלה…" aria-label="שאלה לבוגה־פדיה" />
    <button type="submit">לשאול</button>
  </form>
}
