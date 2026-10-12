import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { faqSchema } from '../../components/ui/SeoBody'
import NotFound from '../NotFound'
import { HOLIDAY_CONFIGS } from '../../holidays'
import { currentInfo } from '../../holidays/list'

// "כמה ימים עד חנוכה?" — one page per holiday / event (/days-until/:slug) and a hub (/days-until).
// The number is computed in the browser after load (the prerendered page shows the date only),
// so the snapshot never carries a stale count.
const HOLIDAY_SLUGS = ['hanukkah', 'tu-bishvat', 'purim', 'pesach', 'yom-haatzmaut', 'lag-baomer', 'shavuot', 'rosh-hashana', 'yom-kippur', 'sukkot', 'sigd']
const EXTRA = {
  'summer-vacation': { name: 'החופש הגדול', emoji: '☀️', start: '2027-07-01T08:00:00+03:00', datesText: 'החופש הגדול 2027: בגנים ובבתי הספר היסודיים — מיום חמישי, 1 ביולי 2027 (היום האחרון ללימודים: 30 ביוני)', link: '/ideas', linkLabel: 'רעיונות לחופש' },
  'new-year': { name: 'השנה החדשה (1 בינואר)', emoji: '🎆', start: '2027-01-01T00:00:00+02:00', datesText: '1 בינואר 2027 — יום שישי', link: '/time-tunnel/01-01', linkLabel: 'מה קרה ב-1 בינואר' },
}
export function untilItem(slug) {
  if (EXTRA[slug]) return { slug, ...EXTRA[slug] }
  const h = HOLIDAY_CONFIGS[slug]
  if (!h || !HOLIDAY_SLUGS.includes(slug)) return null
  const o = currentInfo(h)
  return { slug, name: h.name, emoji: h.emoji, start: o.start, datesText: o.datesText, link: h.base, linkLabel: `כל מה שצריך ל${h.name}` }
}
export const ALL_UNTIL = [...HOLIDAY_SLUGS, ...Object.keys(EXTRA)]
const dayStart = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime() }
export const daysUntil = (iso, now = Date.now()) => Math.round((dayStart(iso) - dayStart(now)) / 86400000)
const yearOf = iso => new Date(iso).getFullYear()

function useNow() {
  const [now, setNow] = useState(null)
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t) }, [])
  return now
}

export function DaysUntilPage() {
  const { slug } = useParams()
  const it = untilItem(slug)
  const now = useNow()
  if (!it) return <NotFound />
  const n = now == null ? null : daysUntil(it.start, now)
  const y = yearOf(it.start)
  const faq = [
    { q: `כמה ימים נשארו עד ${it.name}?`, a: `${it.datesText}. המספר בראש העמוד מתעדכן לבד כל יום.` },
    { q: `מתי ${it.name} ${y}?`, a: it.datesText + '.' },
  ]
  return <div className="mx-auto max-w-3xl px-4 py-8 text-center" dir="rtl">
    <SEO title={`כמה ימים עד ${it.name} ${y}? ספירה לאחור`} description={`כמה ימים נשארו עד ${it.name}? ספירה לאחור שמתעדכנת כל יום — בימים, בשבועות ובלילות (לילדים). ${it.datesText}.`} path={`/days-until/${slug}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כמה ימים עד…', href: '/days-until' }, { label: it.name }]} />
    <p className="text-7xl" aria-hidden="true">{it.emoji}</p>
    <h1 className="mt-2 text-4xl font-black sm:text-5xl">כמה ימים עד {it.name}?</h1>
    <div className="mx-auto my-6 max-w-md rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-6 sketch-shadow">
      {n == null ? <p className="text-2xl font-bold">סופרים…</p>
        : n > 1 ? <><p className="text-7xl font-black">{n}</p><p className="text-2xl font-bold">ימים</p>
          <p className="mt-2 text-lg">{n >= 7 ? `${Math.floor(n / 7)} שבועות ו־${n % 7} ימים · ` : ''}עוד {n} לילות שינה 🌙</p></>
        : n === 1 ? <p className="text-4xl font-black">מחר! 🎉</p>
        : n === 0 ? <p className="text-4xl font-black">היום! 🎉</p>
        : <p className="text-2xl font-bold">כבר עבר — הספירה לשנה הבאה תעלה בקרוב</p>}
    </div>
    <p className="text-lg">{it.datesText}</p>
    <p className="mt-4"><Link to={it.link} className="font-bold underline">{it.emoji} {it.linkLabel}</Link></p>
    <p className="mt-2 text-sm text-[var(--muted-foreground)]">רוצים את הספירה באתר של הגן או הכיתה? <Link to="/embed" className="underline">כלים להטמעה</Link></p>
    <h2 className="mt-10 mb-3 text-2xl font-bold">עוד ספירות לאחור</h2>
    <div className="flex flex-wrap justify-center gap-2">{ALL_UNTIL.filter(s => s !== slug).map(s => { const x = untilItem(s); return x && <Link key={s} to={`/days-until/${s}`} className="rounded-full border-2 border-[var(--border)] bg-white px-3 py-1 font-bold">{x.emoji} {x.name}</Link> })}</div>
  </div>
}

export default function DaysUntilHub() {
  const now = useNow()
  const items = ALL_UNTIL.map(untilItem).filter(Boolean).sort((a, b) => new Date(a.start) - new Date(b.start))
  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <SEO title="כמה ימים עד… ספירה לאחור לחגים ולחופש הגדול" description="כמה ימים נשארו עד חנוכה, פורים, פסח, החופש הגדול ועוד — ספירה לאחור שמתעדכנת כל יום, בימים ובלילות שינה לילדים." path="/days-until" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כמה ימים עד…' }]} />
    <h1 className="mb-4 text-center text-4xl font-black">⏳ כמה ימים עד…?</h1>
    <ul className="space-y-2">{items.map(it => <li key={it.slug}><Link to={`/days-until/${it.slug}`} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-3 hover:bg-[var(--postit)]">
      <span><span className="text-2xl" aria-hidden="true">{it.emoji}</span> <b className="text-lg">{it.name}</b><span className="block text-sm text-[var(--muted-foreground)]">{it.datesText}</span></span>
      <b className="shrink-0 text-xl">{now == null ? '' : daysUntil(it.start, now) > 0 ? `עוד ${daysUntil(it.start, now)} ימים` : daysUntil(it.start, now) === 0 ? 'היום!' : ''}</b>
    </Link></li>)}</ul>
  </div>
}
