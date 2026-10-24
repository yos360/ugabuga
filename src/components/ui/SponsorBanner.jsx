import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { sponsorForPath, SPONSOR_LABEL } from '../../data/sponsors'
import { logSponsorClick } from '../../utils/liveActivity'

// A small, clearly marked sponsored card ("פרסומת") for topic pages. Place it once per page,
// below the main content (never above the H1). It picks the active sponsor whose placements
// match the current path and renders nothing when there is none, in the kids zone, or after
// the visitor closed it (hidden for 14 days). Hidden in print.
const HIDE_DAYS = 14
const hideKey = id => `buga-sponsor-hidden:${id}`

function isHidden(id) {
  try {
    const until = Number(localStorage.getItem(hideKey(id)) || 0)
    return until > Date.now()
  } catch { return false }
}
function hide(id) {
  try { localStorage.setItem(hideKey(id), String(Date.now() + HIDE_DAYS * 864e5)) } catch { /* ignore */ }
}
// Counted twice: Google Analytics (event `sponsor_click`) and the owner's own report
// (/admin/activity → "לחיצות על באנרים"). Neither ever blocks the link.
function trackClick(sponsor) {
  try { if (typeof window.gtag === 'function') window.gtag('event', 'sponsor_click', { sponsor_id: sponsor.id, page_path: window.location.pathname, link_url: sponsor.url }) } catch { /* ignore */ }
  try { logSponsorClick(sponsor.id) } catch { /* ignore */ }
}

export default function SponsorBanner({ className = '' }) {
  const { pathname } = useLocation()
  const sponsor = /^\/kids(\/|$)/.test(pathname) ? null : sponsorForPath(pathname)
  const [closedId, setClosedId] = useState(null)
  if (!sponsor || closedId === sponsor.id || isHidden(sponsor.id)) return null

  const close = () => { hide(sponsor.id); setClosedId(sponsor.id) }
  const img = sponsor.image
  return (
    <div className={`sponsor-banner no-print mx-auto my-10 w-full max-w-3xl ${className}`} dir="rtl">
      <style>{'@media print{.sponsor-banner{display:none!important}}'}</style>
      <aside aria-label={`${SPONSOR_LABEL}: ${sponsor.name}`} data-sponsor={sponsor.id}
        className="relative border-2 border-dashed border-[var(--border)] bg-[var(--card)] px-4 pb-4 pt-3 wobbly">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs">
          <span className="rounded-full border border-[var(--border)] bg-[var(--postit)] px-2 py-0.5 font-bold text-[var(--ink)]">{sponsor.label || SPONSOR_LABEL} · בשיתוף {sponsor.name}</span>
          <button type="button" onClick={close} aria-label="סגירת הפרסומת"
            className="-m-2 flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-[var(--muted-foreground)] hover:bg-[var(--postit)]">×</button>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          {img && <a href={sponsor.url} target="_blank" rel="sponsored noopener" onClick={() => trackClick(sponsor)} tabIndex={-1}
            className="shrink-0 -rotate-2 overflow-hidden rounded-xl border-2 border-[var(--border)] bg-white p-1 transition-transform hover:rotate-0">
            <img src={img.src} width={img.width} height={img.height} alt={img.alt} loading="lazy" decoding="async"
              className="block h-[88px] w-[88px] object-contain sm:h-[120px] sm:w-[120px]" />
          </a>}
          <div className="min-w-0 flex-1">
            <p className="m-0 text-lg font-bold leading-snug sm:text-xl">{sponsor.title}</p>
            <p className="m-0 mt-1 text-sm leading-relaxed text-[var(--foreground)]/80 sm:text-base">{sponsor.text}</p>
            <a href={sponsor.url} target="_blank" rel="sponsored noopener" onClick={() => trackClick(sponsor)}
              className="wobbly-sm sketch-press mt-3 inline-flex min-h-[44px] items-center border-2 border-[var(--ink)] bg-[var(--postit)] px-4 py-2 font-bold text-[var(--ink)]">
              {sponsor.cta}
            </a>
          </div>
        </div>
      </aside>
      <p className="m-0 mt-2 text-center text-sm sm:text-base">
        <Link to="/advertise" className="font-bold text-[var(--ink)] underline decoration-dashed underline-offset-4">📣 עסקים שמעוניינים לפרסם בעוגה בוגה — דברו איתנו ←</Link>
      </p>
    </div>
  )
}
