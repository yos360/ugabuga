import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { WHATS_NEW, NEW_KINDS } from '../data/whatsNew'

const fmtDay = iso => new Date(iso + 'T12:00:00').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// /new — what was added to the site, newest first, grouped by day.
export default function WhatsNew() {
  const [kind, setKind] = useState('all')
  const list = WHATS_NEW.filter(x => kind === 'all' || x.kind === kind)
  const days = [...new Set(list.map(x => x.date))]
  const chip = (id, label) => <button key={id} type="button" onClick={() => setKind(id)} aria-pressed={kind === id}
    className={`min-h-10 rounded-xl border-2 px-3 py-1 font-bold ${kind === id ? 'border-[var(--ink)] bg-[var(--postit)]' : 'border-[var(--border)] bg-white'}`}>{label}</button>
  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="חדש באתר עוגה בוגה — דפי הדפסה, משחקים ותכנים חדשים" description="מה חדש בעוגה בוגה: דפי צביעה ודפי עבודה חדשים להדפסה, משחקים, תכנים לחגים ולמידה — מתעדכן בכל פעם שעולה משהו חדש." path="/new" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חדש באתר' }]} />
    <h1 className="mb-2 text-4xl font-black">✨ חדש באתר</h1>
    <p className="mb-5 text-lg text-[var(--muted-foreground)]">כל מה שעלה לאחרונה — דפי הדפסה, משחקים ותכנים לחגים. שווה לחזור לכאן פעם בשבוע.</p>
    <div className="mb-6 flex flex-wrap gap-2">{chip('all', 'הכול')}{Object.entries(NEW_KINDS).map(([id, l]) => chip(id, l))}</div>
    {days.map(d => <section key={d} className="mb-8">
      <h2 className="mb-3 text-xl font-bold text-[var(--muted-foreground)]">{fmtDay(d)}</h2>
      <div className="grid gap-3 sm:grid-cols-2">{list.filter(x => x.date === d).map(x => <Link key={x.to + x.title} to={x.to}
        className="wobbly-sm flex gap-3 border-2 border-[var(--border)] bg-white p-4 transition-transform hover:-translate-y-0.5">
        <span className="text-4xl" aria-hidden="true">{x.emoji}</span>
        <span><b className="block text-lg leading-snug">{x.title}</b><span className="block text-[var(--muted-foreground)]">{x.blurb}</span>
          <span className="mt-1 inline-block rounded-lg bg-[var(--postit)] px-2 text-sm font-bold">{NEW_KINDS[x.kind]}</span></span>
      </Link>)}</div>
    </section>)}
  </div>
}
