import { Link } from 'react-router-dom'
import { loadClassRoster } from '../../utils/classRoster'

export default function UseClassRoster({ onUse, className = '' }) {
  const count = typeof window === 'undefined' ? 0 : loadClassRoster().names.length
  const useRoster = () => {
    const roster = loadClassRoster()
    if (roster.names.length) onUse(roster.names, roster)
  }
  return <div className={`no-print flex flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50 p-3 ${className}`}>
    <span className="font-bold">👩‍🏫 רשימת הכיתה שלי</span>
    {count > 0
      ? <button type="button" onClick={useRoster} className="rounded-xl border-2 border-slate-800 bg-white px-3 py-2 font-bold">טען {count} שמות</button>
      : <Link to="/classroom/roster" className="rounded-xl border-2 border-slate-800 bg-white px-3 py-2 font-bold">צור רשימת כיתה</Link>}
    <Link to="/classroom/roster" className="text-sm font-bold underline">עריכה</Link>
  </div>
}
