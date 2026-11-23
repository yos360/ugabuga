import { useEffect, useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'

// Google Classroom (owner_classroom_report): how many times teachers pressed "שיתוף לקלאסרום" in the
// print dialog, and how many visitors arrived from a Classroom post — last 30 days, top pages.
export default function ClassroomShares({ tick = 0 }) {
  const [data, setData] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    let live = true
    const to = new Date(), from = new Date(to.getTime() - 30 * 864e5)
    ownerSupabase.rpc('owner_classroom_report', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data: d, error: e }) => {
      if (!live) return
      if (e) { setError('הנתונים יופיעו לאחר עדכון מסד הנתונים.'); return }
      setData(d || { shares: 0, visits: 0, top: [] }); setError('')
    })
    return () => { live = false }
  }, [tick])
  if (error) return <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold">{error}</p>
  if (!data) return <p className="text-sm text-slate-500">טוען…</p>
  return <div>
    <p className="mb-3 text-sm text-slate-600">30 הימים האחרונים. <b>שיתופים</b> = לחיצות על „שיתוף לקלאסרום” בחלון ההדפסה (גוגל לא מדווח אם המורה פרסמה בפועל). <b>כניסות</b> = מבקרים שהגיעו מקישור בקלאסרום, כל מבקר פעם אחת.</p>
    <div className="mb-4 grid gap-2 sm:grid-cols-2">
      <p className="rounded-xl bg-green-50 p-3"><b className="block text-2xl">{data.shares || 0}</b>שיתופים לקלאסרום</p>
      <p className="rounded-xl bg-sky-50 p-3"><b className="block text-2xl">{data.visits || 0}</b>כניסות מקלאסרום</p>
    </div>
    {data.top?.length > 0 && <table className="w-full text-sm"><thead><tr className="border-b text-right"><th className="p-2">דף</th><th className="p-2">שיתופים</th><th className="p-2">כניסות</th></tr></thead>
      <tbody>{data.top.map(r => <tr key={r.path} className="border-b"><td className="p-2"><b>{r.path || '/'}</b></td><td className="p-2">{r.shares}</td><td className="p-2">{r.visits}</td></tr>)}</tbody></table>}
  </div>
}
