import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { rpcInit, rpcUrl } from '../../utils/qrVariants'

// "הכנו לפי בקשה" — pages made from visitors' requests (title + link chosen by the owner; never the
// request text or email). Seeing requests come true is what makes the next visitor ask. Renders
// nothing until the first request is marked done.
export const OWNER_WHATSAPP_LINK = text => `https://wa.me/972507772930?text=${encodeURIComponent(text)}`

export function WhatsAppAsk({ className = '' }) {
  return <a href={OWNER_WHATSAPP_LINK('היי עוגה בוגה 👋 אשמח שתכינו לי דף: ')} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-[#25D366] px-4 font-bold text-white ${className}`}>💬 מעדיפים וואטסאפ? כתבו לנו</a>
}

export default function DoneRequests({ limit = 6, className = '' }) {
  const [rows, setRows] = useState([])
  useEffect(() => {
    let live = true
    fetch(rpcUrl('page_requests_done_public'), rpcInit({ p_limit: limit })).then(r => (r.ok ? r.json() : [])).then(d => { if (live && Array.isArray(d)) setRows(d) }).catch(() => {})
    return () => { live = false }
  }, [limit])
  if (!rows.length) return null
  return <section className={`no-print ${className}`} aria-label="הכנו לפי בקשה" dir="rtl">
    <h2 className="text-2xl font-black">🎁 הכנו לפי בקשה</h2>
    <p className="mt-1 text-[var(--muted-foreground)]">ביקשתם — הכנו. כל הדפים בחינם, לכולם. <Link to="/request" className="font-bold underline">גם לכם חסר משהו?</Link></p>
    <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rows.map(r => <li key={`${r.path}-${r.done_at}`}>
      <Link to={r.path} className="flex h-full flex-col rounded-2xl border-2 border-violet-200 bg-white p-4 hover:-translate-y-0.5 transition-transform">
        <b>{r.title}</b>
        <small className="mt-1 text-slate-500">{r.audience ? `לפי בקשה · ${r.audience} · ` : 'לפי בקשה · '}{new Date(r.done_at).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })}</small>
      </Link></li>)}</ul>
  </section>
}
