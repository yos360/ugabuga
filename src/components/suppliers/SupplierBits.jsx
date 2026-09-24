import { Link } from 'react-router-dom'
import { suppliersDb, waLink, telLink } from '../../utils/suppliersDb'
import { categoryLabel } from '../../data/supplierOptions'
import Badge from '../ui/Badge'

const ICONS = {
  instagram: <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM17.5 5.8a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />,
  facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8Z" />,
  tiktok: <path d="M16 3c.3 2.2 1.8 3.8 4 4v3.2a7.6 7.6 0 0 1-4-1.2V15a6 6 0 1 1-6-6h.5v3.3H10a2.7 2.7 0 1 0 2.7 2.7V3H16Z" />,
  youtube: <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />,
  website: <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2c-.9 0-2.2 1.9-2.7 5h5.4C14.2 5.9 12.9 4 12 4Zm-4.7 5c.2-1.8.7-3.4 1.4-4.5A8 8 0 0 0 4.3 9h3Zm-3 2a8 8 0 0 0 0 2h3a20 20 0 0 1 0-2h-3Zm5 0a18 18 0 0 0 0 2h5.4a18 18 0 0 0 0-2H9.3Zm7.4 0a20 20 0 0 1 0 2h3a8 8 0 0 0 0-2h-3Zm2.9-2a8 8 0 0 0-4.3-4.5c.7 1.1 1.2 2.7 1.4 4.5h2.9Zm-10.3 6H4.3a8 8 0 0 0 4.4 4.5c-.7-1.1-1.2-2.7-1.4-4.5Zm2 0c.5 3.1 1.8 5 2.7 5s2.2-1.9 2.7-5H9.3Zm7.4 0c-.2 1.8-.7 3.4-1.4 4.5a8 8 0 0 0 4.3-4.5h-2.9Z" />,
}
const NAMES = { instagram: 'אינסטגרם', facebook: 'פייסבוק', tiktok: 'טיקטוק', youtube: 'יוטיוב', website: 'אתר' }
export const SOCIALS = ['instagram', 'facebook', 'tiktok', 'youtube', 'website']

export function Icon({ name, className = 'h-4 w-4' }) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">{ICONS[name]}</svg>
}

export function SocialLinks({ s, className = '', size = 'h-9 w-9', live = true }) {
  const links = SOCIALS.filter(k => s[k])
  if (!links.length) return null
  return <div className={`flex flex-wrap gap-2 ${className}`}>
    {links.map(k => <a key={k} href={s[k]} target="_blank" rel="noopener nofollow" aria-label={`${NAMES[k]} של ${s.name}`}
      onClick={() => live && suppliersDb.track(s.id, k === 'website' ? 'website' : 'social')}
      className={`grid ${size} place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-800 hover:text-slate-900`}>
      <Icon name={k} />
    </a>)}
  </div>
}

export function Logo({ s, size = 'h-16 w-16', className = '' }) {
  return s.logo_url
    ? <img src={s.logo_url} alt={`לוגו ${s.name}`} loading="lazy" className={`${size} shrink-0 rounded-full border-2 border-white bg-white object-cover shadow ${className}`} />
    : <span aria-hidden="true" className={`${size} grid shrink-0 place-items-center rounded-full border-2 border-white bg-[var(--postit)] text-2xl font-black text-[var(--ink)] shadow ${className}`}>{[...(s.name || '?')][0]}</span>
}

// WhatsApp + call, both measured. `live` is false in editor previews.
export function ContactButtons({ s, live = true, big = false, className = '' }) {
  const wa = waLink(s.whatsapp), tel = telLink(s.phone)
  const h = big ? 'min-h-[52px] px-5 text-lg' : 'min-h-[44px] px-4'
  return <div className={`flex flex-wrap gap-2 ${className}`}>
    {wa && <a href={wa} target="_blank" rel="noopener" onClick={() => live && suppliersDb.track(s.id, 'whatsapp')}
      className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#25D366] font-bold text-white ${h}`}>💬 וואטסאפ</a>}
    {tel && <a href={tel} onClick={() => live && suppliersDb.track(s.id, 'phone')}
      className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--ink)] font-bold text-white ${h}`}>📞 חיוג</a>}
  </div>
}

// The directory card — same look as the game cards (wobbly, tilted, badges, dashed footer).
const ROTATIONS = ['-rotate-1', 'rotate-1', 'rotate-0', 'rotate-2', '-rotate-2']
export function SupplierCard({ s, live = true, index = 0 }) {
  const wa = waLink(s.whatsapp), tel = telLink(s.phone)
  const open = (e, url, kind) => { e.preventDefault(); e.stopPropagation(); if (live) suppliersDb.track(s.id, kind); window.open(url, kind === 'phone' ? '_self' : '_blank', 'noopener') }
  const cls = `wobbly group relative flex h-full flex-col border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow transition-all duration-150 hover:-translate-y-1 hover:rotate-1 hover:shadow-[6px_10px_0_var(--border)] active:scale-[0.98] ${ROTATIONS[index % ROTATIONS.length]}`
  const body = <>
    <div className="absolute left-3 top-3 flex gap-1" dir="ltr">
      {wa && <button type="button" onClick={e => open(e, wa, 'whatsapp')} aria-label={`וואטסאפ ל${s.name}`} className="rounded-full bg-white/90 px-2 py-1 text-base shadow-sm hover:scale-110">🟢</button>}
      {tel && <button type="button" onClick={e => open(e, tel, 'phone')} aria-label={`חיוג ל${s.name}`} className="rounded-full bg-white/90 px-2 py-1 text-base shadow-sm hover:scale-110">📞</button>}
    </div>
    <div className="flex items-center gap-3 pl-20">
      <Logo s={s} size="h-14 w-14" className="border-[var(--border)] shadow-none" />
      <div className="min-w-0">
        <h3 className="truncate text-2xl leading-tight">{s.name}</h3>
        {s.plan === 'page' && <span className="text-xs font-bold text-violet-700">⭐ פרימיום בוגה</span>}
      </div>
    </div>
    {(s.tagline || s.about) && <p className="mt-2 line-clamp-2 text-base text-[var(--foreground)]/85">{s.tagline || s.about}</p>}
    <div className="mt-3 flex flex-wrap gap-1 sm:gap-2">
      {s.category && <Badge color="yellow">{categoryLabel(s.category)}</Badge>}
      {s.area && <Badge>📍 {s.area}</Badge>}
      {(s.tags || []).slice(0, 3).map(t => <Badge key={t} color="blue">{t}</Badge>)}
    </div>
    <div className="mt-auto flex items-center justify-between border-t-2 border-dashed border-[var(--border)] pt-3">
      <span className="font-display text-lg font-bold underline decoration-dashed">לפרטים ←</span>
      {wa && <span className="text-sm font-bold text-[#1a9f4b]">💬 פנייה בוואטסאפ</span>}
    </div>
  </>
  return live
    ? <Link to={`/suppliers/${s.slug}`} onClick={() => suppliersDb.track(s.id, 'card')} className={cls}>{body}</Link>
    : <div className={cls}>{body}</div>
}
