import { useEffect, useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'
import { QR_VARIANTS } from '../../data/printMessages'

// Owner report: what visitors asked us to make (/request), with a status per request, and which
// rotating QR message on printed pages was printed vs scanned.
const formatTime = value => new Date(value).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
const STATUS = { new: 'חדשה', planned: 'בתכנון', done: 'הוכן', declined: 'לא נכין' }
const SOURCE = { site: 'מהבאנר באתר', qr: 'מ־QR בדף מודפס', search: 'מחיפוש בלי תוצאות', print: 'מדף מודפס' }

function QrVariants({ from, to, tick }) {
  const [rows, setRows] = useState(null)
  useEffect(() => { let live = true; ownerSupabase.rpc('qr_variant_owner', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error }) => { if (live) setRows(error ? null : Array.isArray(data) ? data : []) }); return () => { live = false } }, [from, to, tick])
  if (!rows) return null
  const by = Object.fromEntries(rows.map(r => [r.variant, r]))
  return <div className="mt-5">
    <h3 className="text-lg font-black">איזה משפט ליד ה־QR עובד?</h3>
    <p className="text-sm text-slate-600">כל הדפסה מקבלת אחד מהמשפטים. מודפס = כמה פעמים הודפס, נסרק = כמה אנשים סרקו אותו.</p>
    <table className="mt-2 w-full text-right text-sm"><thead><tr className="border-b-2"><th className="p-2">המשפט</th><th className="p-2">לאן מוביל</th><th className="p-2">מודפס</th><th className="p-2">נסרק</th></tr></thead>
      <tbody>{QR_VARIANTS.map(v => { const r = by[v.id] || {}; return <tr key={v.id} className="border-b align-top"><td className="p-2"><b>{v.title}</b><span className="block text-xs text-slate-500">{v.line}</span></td><td className="p-2">{v.to === 'request' ? 'טופס בקשה' : 'הדף שהודפס'}</td><td className="p-2 font-bold">{r.printed || 0}</td><td className="p-2 font-bold">{r.scanned || 0}</td></tr> })}</tbody></table>
  </div>
}

export default function PageRequests({ from, to, tick = 0 }) {
  const [rows, setRows] = useState([]), [error, setError] = useState('')
  useEffect(() => { let live = true; ownerSupabase.rpc('page_requests_owner', { p_from: from.toISOString(), p_to: to.toISOString(), p_limit: 500 }).then(({ data, error: rpcError }) => { if (!live) return; if (rpcError) { setError('הנתונים יופיעו לאחר הפעלת עדכון מסד הנתונים.'); return } setRows(Array.isArray(data) ? data : []); setError('') }); return () => { live = false } }, [from, to, tick])
  const setStatus = async (id, status) => {
    const { error: rpcError } = await ownerSupabase.rpc('page_request_set_status', { p_id: id, p_status: status })
    if (!rpcError) setRows(list => list.map(r => r.id === id ? { ...r, status } : r))
  }
  const open = rows.filter(r => r.status === 'new').length
  return <section className="mb-6 rounded-3xl border-2 border-violet-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-bold text-violet-700">מבקשים דף</p><h2 className="text-2xl font-black">מה ביקשו שנכין?</h2></div><span className="rounded-full bg-violet-100 px-3 py-1 font-black">{rows.length} בקשות · {open} חדשות</span></div>
    <p className="mt-2 text-sm text-slate-600">מייל נשמר רק כשהמבקר בחר להשאיר אותו, כדי לעדכן שהדף מוכן. לא לפרסם ולא להעביר.</p>
    {error && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold">{error}</p>}
    {!error && (rows.length ? <div className="mt-4 max-h-[440px] overflow-auto"><table className="w-full text-right text-sm"><thead className="sticky top-0 bg-white"><tr className="border-b-2"><th className="p-2">זמן</th><th className="p-2">הבקשה</th><th className="p-2">סטטוס</th></tr></thead>
      <tbody>{rows.map(r => <tr key={r.id} className="border-b align-top"><td className="whitespace-nowrap p-2 text-slate-500">{formatTime(r.created_at)}</td>
        <td className="p-2"><b className="whitespace-pre-wrap">{r.request}</b>
          <span className="mt-1 block text-xs text-slate-500">{[r.audience && `גיל: ${r.audience}`, SOURCE[r.source] || r.source, r.from_path && `מהדף ${r.from_path}`].filter(Boolean).join(' · ')}</span>
          {r.email && <a href={`mailto:${r.email}`} dir="ltr" className="mt-1 block text-xs font-bold text-violet-700 underline">{r.email}</a>}</td>
        <td className="p-2"><select value={r.status} onChange={e => setStatus(r.id, e.target.value)} className="rounded-lg border-2 border-slate-200 p-1" aria-label="סטטוס הבקשה">{Object.entries(STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></td></tr>)}</tbody></table></div>
      : <p className="mt-4 rounded-xl bg-slate-50 p-4">עדיין אין בקשות בטווח הזמן שנבחר.</p>)}
    <QrVariants from={from} to={to} tick={tick} />
  </section>
}
