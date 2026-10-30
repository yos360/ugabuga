import { useEffect, useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'

// Owner report: how many teachers use the timetable planner (migrations 20261030180000, 20261030160000) —
// registered, active this week, with a timetable — and the waiting list of teachers of other subjects.
export default function PlannerTeachers({ tick = 0 }) {
  const [stats, setStats] = useState(null), [waiting, setWaiting] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    let live = true
    Promise.all([ownerSupabase.rpc('planner_teachers_owner'), ownerSupabase.rpc('planner_waitlist_owner')]).then(([a, b]) => {
      if (!live) return
      if (a.error) { setError('הנתונים יופיעו לאחר הפעלת עדכון מסד הנתונים.'); return }
      setStats(a.data); setWaiting(Array.isArray(b.data) ? b.data : [])
    })
    return () => { live = false }
  }, [tick])
  const box = 'rounded-2xl bg-violet-50 p-3 text-center'
  return <section className="mt-6 rounded-3xl border-2 border-violet-200 bg-white p-4" dir="rtl" aria-label="מערכת השעות למורים">
    <h2 className="text-xl font-black">🗓️ מערכת השעות למורים (בטא)</h2>
    {error ? <p className="mt-2 text-sm">{error}</p> : !stats ? <p className="mt-2 text-sm">טוען…</p> : <>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className={box}><b className="text-2xl">{stats.teachers}</b><br />מורים רשומים</div>
        <div className={box}><b className="text-2xl">{stats.active_week}</b><br />פעילים השבוע</div>
        <div className={box}><b className="text-2xl">{stats.with_timetable}</b><br />עם מערכת בענן</div>
        <div className={box}><b className="text-2xl">{waiting?.length ?? 0}</b><br />מחכים למקצוע שלהם</div>
      </div>
      {waiting?.length > 0 && <details className="mt-3 text-sm"><summary className="cursor-pointer font-bold">מה מלמדים מי שמחכים</summary>
        <ul className="mt-1 list-disc pr-5">{waiting.filter(w => w.teaches).slice(0, 50).map(w => <li key={w.email}>{w.teaches}</li>)}</ul></details>}
    </>}
  </section>
}
