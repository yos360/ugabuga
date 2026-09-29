import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

// One home for every holiday area, so seasonal pages live together instead of
// scattering across the site. Holidays without their own area yet link to what exists.
const HOLIDAYS = [
  { to: '/holidays/hanukkah', emoji: '🕎', name: 'חנוכה', when: 'דצמבר 2026', desc: 'סביבון וירטואלי, חידון, דפי צביעה ודפי עבודה, ורעיונות לחופשה', ready: true },
  { to: '/holidays/tu-bishvat', emoji: '🌳', name: 'ט״ו בשבט', when: 'ינואר 2027', desc: 'שבעת המינים ומשחק זיכרון, חידון, דפי צביעה ודפי עבודה, ופעילויות לגן', ready: true, bg: 'bg-green-100' },
  { emoji: '🎭', name: 'פורים', when: 'מרץ 2027', desc: 'בקרוב: רעיונות לתחפושות, משלוח מנות ודפי צביעה', ready: false },
]

export default function HolidaysHub() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="חגים עם ילדים — משחקים, דפי צביעה ופעילויות לכל חג" description="פעילויות לחגים עם ילדים: חנוכה, ט״ו בשבט, פורים ועוד — משחקים על המסך, דפי צביעה ודפי עבודה להדפסה ורעיונות לחופשות. בחינם." path="/holidays" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2">🎉 חגים עם ילדים</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">משחקים, דפים להדפסה ורעיונות — לפי חג</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {HOLIDAYS.map(h => {
          const inner = <>
            <span className="text-5xl mb-1" aria-hidden="true">{h.emoji}</span>
            <h2 className="text-2xl font-bold">{h.name}</h2>
            <p className="text-sm font-bold text-[var(--muted-foreground)]">{h.when}</p>
            <p className="flex-1 mt-1">{h.desc}</p>
            {h.ready && <span className="mt-2 font-bold underline decoration-dashed">כניסה ←</span>}
          </>
          return h.ready
            ? <Link key={h.name} to={h.to} className={`wobbly flex flex-col border-2 border-[var(--border)] ${h.bg || 'bg-blue-100'} p-5 sketch-shadow transition-transform hover:-translate-y-1`}>{inner}</Link>
            : <div key={h.name} className="wobbly flex flex-col border-2 border-dashed border-[var(--border)] bg-white p-5 opacity-70">{inner}</div>
        })}
      </div>
    </div>
  )
}
