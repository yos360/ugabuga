import { Link } from 'react-router-dom'

// "חגים בכיתה" on the classroom hub: every holiday area with its classroom-ready parts.
const HOLIDAYS = [
  {
    emoji: '🕎', name: 'חנוכה', when: 'דצמבר', to: '/holidays/hanukkah',
    parts: [['🎲 סביבון על המקרן', '/holidays/hanukkah/sevivon'], ['❓ חידון ב־3 רמות', '/holidays/hanukkah/quiz'], ['🖍️ 6 דפי צביעה', '/holidays/hanukkah/coloring'], ['✏️ דפי עבודה לגן ולא׳', '/holidays/hanukkah/worksheets'], ['🎉 מסיבת חנוכה', '/ideas/hanukkah-party']],
  },
  { emoji: '🌳', name: 'ט״ו בשבט', when: 'ינואר', soon: true },
  { emoji: '🎭', name: 'פורים', when: 'מרץ', soon: true },
]

export default function ClassroomHolidays() {
  return (
    <section aria-labelledby="class-holidays" className="mt-10">
      <h2 id="class-holidays" className="mb-4 text-center text-3xl font-black">🎉 חגים בכיתה ובגן</h2>
      <div className="grid gap-5 lg:grid-cols-3">
        {HOLIDAYS.map(h => h.soon
          ? <div key={h.name} className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-6 text-center opacity-70">
            <div className="text-5xl">{h.emoji}</div>
            <h3 className="mt-2 text-2xl font-black">{h.name}</h3>
            <p className="text-[var(--muted-foreground)]">{h.when} · בקרוב</p>
          </div>
          : <div key={h.name} className="rounded-3xl border-2 border-slate-800 bg-blue-50 p-6 shadow-[0_6px_0_rgba(20,30,60,.12)] lg:col-span-1">
            <Link to={h.to} className="flex items-center gap-3"><span className="text-5xl">{h.emoji}</span><span><span className="block text-2xl font-black">{h.name}</span><span className="text-[var(--muted-foreground)]">{h.when}</span></span></Link>
            <ul className="mt-3 space-y-1.5">{h.parts.map(([label, to]) => <li key={to}><Link to={to} className="block rounded-xl bg-white px-3 py-2 font-bold hover:bg-yellow-100">{label}</Link></li>)}</ul>
            <Link to={h.to} className="mt-3 inline-block font-black underline decoration-dashed">לכל אזור {h.name} ←</Link>
          </div>)}
      </div>
      <p className="mt-3 text-center"><Link to="/holidays" className="font-bold underline">כל החגים ←</Link></p>
    </section>
  )
}
