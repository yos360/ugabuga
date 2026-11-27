import { Link } from 'react-router-dom'

// Birthday and greeting pages: the people here are planning a celebration, so offer the free
// RSVP tool (Layout decides where it shows: see RSVP_OFFER in Layout.jsx).
function track(path) {
  try { if (typeof window.gtag === 'function') window.gtag('event', 'rsvp_offer_click', { page_path: path }) } catch { /* ignore */ }
}

export default function RsvpOffer({ pathname }) {
  // Straight to the matching RSVP type when there is one.
  const type = [[/bat-mitzv/, 'bat-mitzvah'], [/bar-mitzv/, 'bar-mitzvah'], [/wedding/, 'wedding'], [/henna/, 'henna'], [/\/brit(\/|$)/, 'brit'], [/adult/, 'adult-birthday']]
    .find(([re]) => re.test(pathname))?.[1]
  const to = type ? `/rsvp/${type}` : '/rsvp'
  return <aside className="no-print no-present mx-auto my-8 max-w-3xl px-4" dir="rtl" aria-labelledby="rsvp-offer-h">
    <div className="wobbly flex flex-col gap-4 border-2 border-[var(--border)] bg-[var(--postit)] p-5 shadow-[4px_4px_0_var(--border)] sm:flex-row sm:items-center sm:p-6">
      <span className="text-5xl" aria-hidden="true">💌</span>
      <div className="min-w-0 flex-1">
        <h2 id="rsvp-offer-h" className="font-display text-2xl font-bold">עושים אירוע? אישורי הגעה בחינם</h2>
        <p className="mt-1 text-lg">שולחים קישור אחד בוואטסאפ, האורחים עונים בלחיצה, ואתם רואים מי מגיע וכמה, בלי לרדוף אחרי אף אחד.</p>
        <p className="mt-1 text-sm text-slate-700">בלי הרשמה ובלי תשלום. מוכן תוך דקה.</p>
      </div>
      <Link to={to} onClick={() => track(pathname)} className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-2xl bg-[var(--ink)] px-5 text-lg font-bold text-white">ליצור אישור הגעה ←</Link>
    </div>
  </aside>
}
