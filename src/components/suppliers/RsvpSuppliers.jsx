import { Link } from 'react-router-dom'
import { RSVP_SPONSORS, SPONSOR_LABEL } from '../../data/sponsors'
import { logSponsorClick } from '../../utils/liveActivity'

// Supplier cards on the RSVP pages (an experiment, 24.11.2026): the guest sees them only after
// answering and the organizer at the bottom of their page, so they never get in the way of the reply.
// One real supplier and one empty "your business here" slot. Every click is counted in the owner's
// report (לחיצות על באנרים) and in Google Analytics (sponsor_click).
function track(id, url) {
  try { if (typeof window.gtag === 'function') window.gtag('event', 'sponsor_click', { sponsor_id: id, page_path: window.location.pathname, link_url: url }) } catch { /* ignore */ }
  try { logSponsorClick(id) } catch { /* ignore */ }
}

export default function RsvpSuppliers({ where }) {
  const list = RSVP_SPONSORS.filter(s => s.active)
  if (!list.length) return null
  const withSource = url => `${url}${url.includes('?') ? '&' : '?'}utm_source=ugabuga&utm_medium=rsvp&utm_campaign=rsvp-${where}`
  return <aside className="no-print mx-auto mt-6 max-w-xl" dir="rtl" aria-label="ספקים לאירוע">
    <style>{'@media print{.no-print{display:none!important}}'}</style>
    <p className="mb-2 text-center text-sm font-bold text-slate-500">{where === 'host' ? '🎉 עוד משהו לאירוע שלכם?' : '🎉 מתכננים אירוע משלכם?'}</p>
    <div className="grid gap-3 sm:grid-cols-2">
      {list.map(s => {
        const url = withSource(s.url)
        return <a key={s.id} href={url} target="_blank" rel="sponsored noopener" onClick={() => track(s.id, s.url)}
          className="flex flex-col rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-[var(--ink)] shadow-[3px_3px_0_var(--border)] transition-transform hover:-translate-y-0.5">
          <span className="mb-2 self-start rounded-full bg-[var(--postit)] px-2 py-0.5 text-xs font-bold">{SPONSOR_LABEL}</span>
          <span className="flex items-center gap-3">
            <img src={s.logo} alt="" width="56" height="56" loading="lazy" decoding="async" className="h-14 w-14 shrink-0 rounded-full border border-slate-200 object-cover" />
            <span className="min-w-0"><b className="block text-lg leading-tight">{s.name}</b><span className="block text-sm text-slate-600">{s.tagline}</span></span>
          </span>
          <span className="mt-2 text-sm leading-relaxed">{s.text}</span>
          <span className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--ink)] px-4 font-bold text-white">{s.cta}</span>
        </a>
      })}
      <Link to="/advertise" onClick={() => track('rsvp-slot', '/advertise')}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center text-slate-600 hover:border-slate-500">
        <span className="text-3xl" aria-hidden="true">📣</span>
        <b className="mt-1 text-lg text-[var(--ink)]">המקום הזה פנוי</b>
        <span className="mt-1 text-sm">ספקים לאירועים: מאות אורחים ומארגנים רואים את הדף הזה כל שבוע</span>
        <span className="mt-2 text-sm font-bold underline">לפרסם כאן ←</span>
      </Link>
    </div>
  </aside>
}
