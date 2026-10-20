import { useEffect, useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'
const formatTime = value => new Date(value).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
// What the child got: the written answer (when one was made for this question) with its sources,
// otherwise the encyclopedia result's title.
function Result({ row }) {
  const head = row.found || row.answer ? <span className="text-emerald-700">✓ {row.result_title || 'תשובה כתובה'}</span> : <span className="font-bold text-red-700">לא נמצאה תשובה</span>
  if (!row.answer) return head
  return <details>
    <summary className="cursor-pointer">{head} <span className="text-xs font-bold text-violet-700 underline">הצגת התשובה</span></summary>
    <div className="mt-2 rounded-xl bg-violet-50 p-3 text-slate-800">
      {!row.confident && <p className="mb-1 text-xs font-bold text-amber-700">הבוט סימן שהוא לא בטוח בתשובה</p>}
      <p className="whitespace-pre-wrap leading-relaxed">{row.answer}</p>
      {row.sources?.length > 0 && <p className="mt-2 text-xs">מקורות: {row.sources.map((src, i) => <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-violet-700 underline">{src.title || src.url}</a>)}</p>}
    </div>
  </details>
}
export default function BugaPediaQuestions({ from, to, tick = 0 }) {
  const [rows, setRows] = useState([]), [error, setError] = useState('')
  useEffect(() => { let active = true; ownerSupabase.rpc('bugapedia_owner_queries', { p_from: from.toISOString(), p_to: to.toISOString(), p_limit: 500 }).then(({ data, error: rpcError }) => { if (!active) return; if (rpcError) { setError('הנתונים יופיעו לאחר הפעלת עדכון מסד הנתונים.'); return } setRows(Array.isArray(data) ? data : []); setError('') }); return () => { active = false } }, [from, to, tick])
  return <section className="mb-6 rounded-3xl border-2 border-violet-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-bold text-violet-700">בוגה־פדיה</p><h2 className="text-2xl font-black">מה אנשים שאלו?</h2></div><span className="rounded-full bg-violet-100 px-3 py-1 font-black">{rows.length} שאלות</span></div>
    <p className="mt-2 text-sm text-slate-600">נשמר נוסח השאלה ותוצאת החיפוש בלבד — בלי שם, מייל או כתובת IP.</p>
    {error && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold">{error}</p>}
    {!error && (rows.length ? <div className="mt-4 max-h-[440px] overflow-auto"><table className="w-full text-right text-sm"><thead className="sticky top-0 bg-white"><tr className="border-b-2"><th className="p-2">זמן</th><th className="p-2">השאלה</th><th className="p-2">תוצאה</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-b align-top"><td className="whitespace-nowrap p-2 text-slate-500">{formatTime(row.created_at)}</td><td className="p-2"><b>{row.question}</b>{row.subject && <span className="mt-1 block text-xs text-slate-500">נושא: {row.subject}</span>}</td><td className="p-2"><Result row={row} /></td></tr>)}</tbody></table></div> : <p className="mt-4 rounded-xl bg-slate-50 p-4">עדיין אין שאלות בטווח הזמן שנבחר.</p>)}
  </section>
}
