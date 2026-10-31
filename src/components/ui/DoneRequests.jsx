import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { rpcInit, rpcUrl } from '../../utils/qrVariants'

// "הכנו לפי בקשה" — pages made from visitors' requests (title + link chosen by the owner; never the
// request text or email). Seeing requests come true is what makes the next visitor ask. Renders
// nothing until the first request is marked done. The full list lives at DONE_PATH.
export const OWNER_WHATSAPP_LINK = text => `https://wa.me/972507772930?text=${encodeURIComponent(text)}`
export const DONE_PATH = '/request/done'
// A request starts a build at once (docs/page-requests-automation.md); the deploy adds ~40 minutes.
export const REQUEST_ETA = 'בדרך כלל תוך כמה שעות, ובחוברות ארוכות עד יום–יומיים'

export function WhatsAppAsk({ className = '' }) {
  return <a href={OWNER_WHATSAPP_LINK('היי עוגה בוגה 👋 אשמח שתכינו לי דף: ')} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-[#25D366] px-4 font-bold text-white ${className}`}>💬 מעדיפים וואטסאפ? כתבו לנו</a>
}

export function useDoneRequests(limit) {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    let live = true
    fetch(rpcUrl('page_requests_done_public'), rpcInit({ p_limit: limit })).then(r => (r.ok ? r.json() : [])).then(d => { if (live) setRows(Array.isArray(d) ? d : []) }).catch(() => { if (live) setRows([]) })
    return () => { live = false }
  }, [limit])
  return rows
}

export const doneDate = iso => new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })

export function DoneCard({ r }) {
  return <Link to={r.path} className="flex h-full flex-col rounded-2xl border-2 border-violet-200 bg-white p-4 hover:-translate-y-0.5 transition-transform">
    <b>{r.title}</b>
    <small className="mt-1 text-slate-500">{r.audience ? `לפי בקשה · ${r.audience} · ` : 'לפי בקשה · '}{doneDate(r.done_at)}</small>
  </Link>
}

export default function DoneRequests({ limit = 6, className = '' }) {
  const rows = useDoneRequests(limit)
  if (!rows?.length) return null
  return <section className={`no-print ${className}`} aria-label="הכנו לפי בקשה" dir="rtl">
    <h2 className="text-2xl font-black">🎁 הכנו לפי בקשה</h2>
    <p className="mt-1 text-[var(--muted-foreground)]">ביקשתם — הכנו. כל הדפים בחינם, לכולם.</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <Link to="/request" style={{ color: '#fff' }} className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-violet-600 px-5 text-lg font-black text-white shadow-sm hover:bg-violet-700">📝 גם לכם חסר משהו? לחצו כאן ובקשו ←</Link>
      <Link to={DONE_PATH} className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 border-violet-300 bg-white px-5 font-bold">כל מה שהכנו לפי בקשה ←</Link>
    </div>
    <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rows.map(r => <li key={`${r.path}-${r.done_at}`}><DoneCard r={r} /></li>)}</ul>
  </section>
}
