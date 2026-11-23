import { useEffect, useMemo, useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'
import { funnelRows } from '../../utils/rsvpFunnel'

// RSVP funnel (owner_rsvp_steps): last 30 days, distinct visitors per day at each step, and the
// percentage of step 1. Counts only; nothing personal is ever logged.
export default function RsvpSteps({ tick = 0 }) {
  const [counts, setCounts] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    let live = true
    const to = new Date(), from = new Date(to.getTime() - 30 * 864e5)
    ownerSupabase.rpc('owner_rsvp_steps', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error: e }) => {
      if (!live) return
      if (e) { setError('הנתונים יופיעו לאחר עדכון מסד הנתונים.'); return }
      setCounts(data && typeof data === 'object' ? data : {}); setError('')
    })
    return () => { live = false }
  }, [tick])
  const rows = useMemo(() => funnelRows(counts), [counts])
  return <div>
    <p className="mb-3 text-sm text-slate-600">30 הימים האחרונים. כל שלב נספר פעם אחת לכל מבקר ביום; האחוז הוא מתוך שלב 1. הלחיצות שלכם לא נספרות.</p>
    {error ? <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold">{error}</p>
      : !counts ? <p className="text-sm text-slate-500">טוען…</p>
      : <table className="w-full text-right text-sm">
        <thead><tr className="border-b-2"><th className="p-2">שלב</th><th className="p-2">מבקרים</th><th className="p-2">% משלב 1</th></tr></thead>
        <tbody>{rows.map((r, i) => <tr key={r.id} className="border-b"><td className="p-2">{i + 1}. {r.label}</td><td className="p-2 font-bold">{r.n}</td><td className="p-2">{r.pct === null ? '—' : `${r.pct}%`}</td></tr>)}</tbody>
      </table>}
    {counts && <p className="mt-2 text-xs text-slate-500">נוספו אורחים לפי גודל: {['1_10', '11_50', '51p'].map(b => `${b.replace('_', '–').replace('p', '+')}: ${counts[`guests_${b}`] || 0}`).join(' · ')}</p>}
  </div>
}
