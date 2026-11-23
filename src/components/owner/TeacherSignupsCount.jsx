import { useEffect, useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'

// Owner: how many teachers joined the consented list. Counts only; emails are exported from Supabase (table teacher_signups).
export default function TeacherSignupsCount() {
  const [c, setC] = useState(null)
  useEffect(() => { let live = true; ownerSupabase.rpc('teacher_signups_owner_count').then(({ data, error }) => { if (live && !error) setC(data) }); return () => { live = false } }, [])
  if (!c) return null
  return <section className="mb-6 rounded-3xl border-2 border-violet-200 bg-white p-5"><h2 className="text-xl font-black">📬 רשימת מורות וגננות (בהסכמה)</h2>
    <p className="mt-2 font-bold">{c.active} רשומים · {c.last_7_days} בשבוע האחרון · {c.unsubscribed} הסירו</p>
    <p className="text-sm text-slate-600">{Object.entries(c.by_role || {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}. לייצוא: Supabase, טבלת teacher_signups, שורות בלי unsubscribed_at.</p></section>
}
