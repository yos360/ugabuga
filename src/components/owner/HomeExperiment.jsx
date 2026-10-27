import { useEffect, useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'
import { HOME_EXPERIMENT, HOME_VARIANTS } from '../../utils/experiments'

// Owner report: the home-page experiment. Counts are per browser tab that opened the home page.
const LABEL = { search: '🔎 חיפוש בהתחלה (כמו תמיד)', live: '⚡ בוגה לייב בהתחלה', request: '📝 "מה אתם מבקשים?" בהתחלה' }
const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '—')

export default function HomeExperiment({ from, to, tick = 0 }) {
  const [rows, setRows] = useState(null), [error, setError] = useState('')
  useEffect(() => { let live = true; ownerSupabase.rpc('experiment_owner', { p_experiment: HOME_EXPERIMENT, p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error: rpcError }) => { if (!live) return; if (rpcError) { setError('הנתונים יופיעו לאחר הפעלת עדכון מסד הנתונים.'); return } setRows(Array.isArray(data) ? data : []); setError('') }); return () => { live = false } }, [from, to, tick])
  const by = Object.fromEntries((rows || []).map(r => [r.variant, r]))
  return <section className="mb-6 rounded-3xl border-2 border-amber-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-bold text-amber-700">ניסוי בעמוד הבית</p>
    <h2 className="text-2xl font-black">מה עובד בראש עמוד הבית?</h2>
    <p className="mt-2 text-sm text-slate-600">כל מבקר מקבל באקראי גרסה אחת ונשאר איתה. נספר פעם אחת לכל ביקור בעמוד הבית: לחיצה על החלק העליון, הדפסה או הורדת PDF באותו ביקור, ובקשת דף. הדפדפן שלך לא נספר — לתצוגה של גרסה: <code dir="ltr">/?exp=live</code> או <code dir="ltr">/?exp=request</code>.</p>
    {error && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold">{error}</p>}
    {rows && <table className="mt-4 w-full text-right text-sm"><thead><tr className="border-b-2"><th className="p-2">גרסה</th><th className="p-2">ביקורים</th><th className="p-2">לחצו למעלה</th><th className="p-2">הדפיסו</th><th className="p-2">ביקשו דף</th></tr></thead>
      <tbody>{HOME_VARIANTS.map(v => { const r = by[v] || {}; return <tr key={v} className="border-b"><td className="p-2 font-bold">{LABEL[v]}</td><td className="p-2">{r.shown || 0}</td>
        <td className="p-2">{r.click || 0} <span className="text-slate-500">({pct(r.click, r.shown)})</span></td>
        <td className="p-2">{r.print || 0} <span className="text-slate-500">({pct(r.print, r.shown)})</span></td>
        <td className="p-2">{r.request || 0} <span className="text-slate-500">({pct(r.request, r.shown)})</span></td></tr> })}</tbody></table>}
    <p className="mt-2 text-xs text-slate-500">כדי לדעת מה באמת עדיף צריך כמה מאות ביקורים בכל גרסה. הפרשים קטנים בתחילת הדרך הם בדרך כלל מקריים.</p>
  </section>
}
