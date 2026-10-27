import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NO_SPONSOR } from '../../data/sponsors'
import { pickBanner } from '../../data/printMessages'
import { OWNER_WHATSAPP_LINK } from './DoneRequests'

// "Ask us for a page" — a small card below the content on Hebrew pages (same exclusions as the sponsor
// card: kids zone, live games, English site…). The wording rotates per page view; closing it hides it
// for 30 days on this browser. Hidden in print.
const HIDE_KEY = 'buga-request-hidden'
const hidden = () => { try { return Number(localStorage.getItem(HIDE_KEY) || 0) > Date.now() } catch { return false } }
const skip = path => path === '/request' || path.startsWith('/admin') || NO_SPONSOR.some(p => path === p || path.startsWith(`${p}/`))

export function RequestCard({ from, source = 'site', message, query, className = '' }) {
  const m = message || pickBanner()
  return <div className={`request-card no-print mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-3xl border-2 border-dashed border-violet-300 bg-violet-50 px-5 py-4 text-slate-800 ${className}`} dir="rtl">
    <span className="text-3xl" aria-hidden="true">📝</span>
    <div className="min-w-[12rem] flex-1"><b className="block text-lg">{m.title}</b><span className="text-sm">{m.line}</span></div>
    <Link to={`/request?from=${encodeURIComponent(from || '/')}&src=${source}${query ? `&q=${encodeURIComponent(query.slice(0, 120))}` : ''}`} className="inline-flex min-h-[44px] items-center rounded-2xl bg-violet-700 px-5 font-bold text-white hover:bg-violet-800">לבקשת דף ←</Link>
    <a href={OWNER_WHATSAPP_LINK('היי עוגה בוגה 👋 אשמח שתכינו לי דף: ')} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-emerald-700 underline">או בוואטסאפ</a>
  </div>
}

export default function RequestBanner() {
  const { pathname } = useLocation()
  const [message] = useState(() => pickBanner())
  const [closed, setClosed] = useState(hidden)
  if (closed || skip(pathname)) return null
  const close = () => { try { localStorage.setItem(HIDE_KEY, String(Date.now() + 30 * 864e5)) } catch { /* ignore */ } setClosed(true) }
  return <div className="relative my-6">
    <RequestCard from={pathname} message={message} />
    <button type="button" onClick={close} aria-label="סגירת ההצעה לבקש דף" className="no-print absolute -top-3 left-[max(1rem,calc(50%-24rem))] grid h-9 w-9 place-items-center rounded-full border-2 border-violet-300 bg-white text-lg">×</button>
  </div>
}
