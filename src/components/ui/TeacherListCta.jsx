import { Link } from 'react-router-dom'

// A link only (no form): invites teachers to the consented update list. Not for kids' areas.
export default function TeacherListCta({ from, className = '' }) {
  return <p className={`teacher-list-cta text-center ${className}`} dir="rtl"><Link to="/teachers/join" state={from ? { from } : undefined} className="inline-block rounded-2xl border-2 border-violet-300 bg-violet-50 px-4 py-2 font-black text-violet-800 hover:bg-violet-100">📬 רוצה לקבל חומרים חדשים לכיתה שלך?</Link></p>
}
