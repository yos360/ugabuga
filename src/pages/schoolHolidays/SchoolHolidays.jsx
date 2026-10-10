import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import { shareOnWhatsApp, shareLink } from '../../utils/share'
import { SCHOOL_YEAR, HOLIDAYS, HUB_COPY, VERIFIED } from '../../data/schoolHolidays'
import { LEVELS, rangeFor, breaksFor, nextBreak, countdown, buildIcs, formatLong, formatRange, formatShort, weekday, dayCount } from '../../data/schoolHolidaysLib'
import '../../learn/learn.css'
import './school-holidays.css'

const HUB = { label: `לוח חופשות ${SCHOOL_YEAR.years}`, href: '/school-holidays' }
const LEVEL_KEY = 'ugabuga-school-level' // per-viewer convenience: the last level picked

const Chip = ({ on, onClick, children }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick}>{children}</button>

// Israel's date as YYYY-MM-DD. Computed after mount so the prerendered snapshot never freezes "today".
function useToday() {
  const [today, setToday] = useState(null)
  useEffect(() => { setToday(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date())) }, [])
  return today
}
function useLevel() {
  const [level, setLevel] = useState('yesodi')
  useEffect(() => { try { const v = localStorage.getItem(LEVEL_KEY); if (LEVELS.some(l => l.id === v)) setLevel(v) } catch { /* storage blocked */ } }, [])
  const set = v => { setLevel(v); try { localStorage.setItem(LEVEL_KEY, v) } catch { /* storage blocked */ } }
  return [level, set]
}

function LevelPicker({ level, setLevel }) {
  return <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="שלב חינוך">
    {LEVELS.map(l => <Chip key={l.id} on={level === l.id} onClick={() => setLevel(l.id)}>{l.emoji} {l.short}</Chip>)}
  </div>
}

function Countdown({ b, level, today }) {
  if (!today || !b) return <p className="sh-count-text">&nbsp;</p>
  const c = countdown(b, level, today)
  if (!c) return null
  if (c.state === 'during') return <p className="sh-count-text">🎉 {b.name} עכשיו! {c.days === 0 ? 'היום הוא היום האחרון של החופשה.' : `נשארו עוד ${c.days} ימים עד שחוזרים ללימודים.`}</p>
  if (c.state === 'after') return null
  return <p className="sh-count-text">{c.days === 0 ? `${b.emoji} ${b.name} מתחילה היום!` : c.days === 1 ? `${b.emoji} ${b.name} מתחילה מחר!` : <>עוד <b className="sh-big">{c.days}</b> ימים עד {b.name} {b.emoji}</>}</p>
}

function downloadIcs(level) {
  const blob = new Blob([buildIcs(HOLIDAYS, level, SCHOOL_YEAR.label)], { type: 'text/calendar;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = `school-holidays-${SCHOOL_YEAR.years}-${level}.ics`
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

function shareText(level) {
  const lv = LEVELS.find(l => l.id === level)
  const lines = HOLIDAYS.filter(b => rangeFor(b, level)).map(b => { const r = rangeFor(b, level); return `${b.emoji} ${b.name}: ${formatRange(r.from, r.to)}` })
  return `📅 לוח חופשות ${SCHOOL_YEAR.label} (${SCHOOL_YEAR.years}) — ${lv.short}\n${lines.join('\n')}\n\nהלוח המלא, ספירה לאחור והדפסה:\n${shareLink('/school-holidays', 'school_holidays')}`
}

function Table({ level, today }) {
  return <div className="sh-table-wrap"><table className="sh-table">
    <thead><tr><th scope="col">מה</th><th scope="col">מתי</th><th scope="col">ימים</th></tr></thead>
    <tbody>{HOLIDAYS.filter(b => rangeFor(b, level)).map(b => {
      const r = rangeFor(b, level)
      const past = today && r.to < today
      const single = r.from === r.to
      return <tr key={b.slug} className={past ? 'is-past' : ''}>
        <th scope="row">{b.page ? <Link to={`/school-holidays/${b.slug}`}>{b.emoji} {b.name}</Link> : <span>{b.emoji} {b.name}</span>}{b.hebrew && <small>{b.hebrew}</small>}{b.tableNote && <small className="sh-flag">{b.tableNote}</small>}</th>
        <td>{single ? <>יום {weekday(r.from)} {formatShort(r.from, true)}</> : <>{weekday(r.from)} {formatShort(r.from)} עד {weekday(r.to)} {formatShort(r.to, true)}</>}{r.back && <small>חוזרים ללימודים: {weekday(r.back)} {formatShort(r.back)}</small>}</td>
        <td>{b.kind === 'break' ? dayCount(r.from, r.to) : '—'}</td>
      </tr>
    })}</tbody>
  </table></div>
}

function PrintSheet({ level }) {
  const lv = LEVELS.find(l => l.id === level)
  return <article className="buga-flow sh-print" dir="rtl">
    <h2>לוח חופשות {SCHOOL_YEAR.label} · {SCHOOL_YEAR.years}</h2>
    <p className="sh-print-sub">{lv.label} · לפי משרד החינוך</p>
    <table><thead><tr><th>מה</th><th>מתאריך</th><th>עד תאריך</th></tr></thead>
      <tbody>{HOLIDAYS.filter(b => rangeFor(b, level)).map(b => { const r = rangeFor(b, level); return <tr key={b.slug}><td>{b.emoji} {b.name}</td><td>{weekday(r.from)} {formatShort(r.from, true)}</td><td>{r.from === r.to ? '' : `${weekday(r.to)} ${formatShort(r.to, true)}`}</td></tr> })}</tbody>
    </table>
    <p className="sh-print-note">ייתכנו שינויים — מומלץ לוודא מול לוח החופשות במוסד החינוכי. ugabuga.co.il/school-holidays</p>
  </article>
}

function Tools({ level }) {
  const [printing, setPrinting] = useState(false)
  return <>
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <button type="button" className="ln-btn" onClick={() => setPrinting(true)}>🖨️ גרסה להדפסה</button>
      <button type="button" className="ln-btn alt" onClick={() => shareOnWhatsApp(shareText(level))}>💬 שליחה בוואטסאפ</button>
      <button type="button" className="ln-btn alt" onClick={() => downloadIcs(level)}>📆 הוספה ליומן</button>
    </div>
    {printing && <PrintPreview title={`לוח חופשות ${SCHOOL_YEAR.years}`} onClose={() => setPrinting(false)}><PrintSheet level={level} /></PrintPreview>}
  </>
}

const Verified = () => <p className="sh-verified">✅ {VERIFIED}</p>

// ── /school-holidays ───────────────────────────────
export function SchoolHolidaysHub() {
  const today = useToday()
  const [level, setLevel] = useLevel()
  const next = today ? nextBreak(HOLIDAYS, level, today) : null
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={HUB_COPY.seoTitle} description={HUB_COPY.description} path="/school-holidays" structuredData={faqSchema(HUB_COPY.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: HUB.label }]} />
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl"><span aria-hidden="true">📅 </span>{HUB_COPY.h1}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{HUB_COPY.intro}</p>
    </header>
    <section className="ln-box sh-hero mt-6 text-center" aria-label="ספירה לאחור">
      <LevelPicker level={level} setLevel={setLevel} />
      <Countdown b={next} level={level} today={today} />
      {next && <p className="m-0"><Link to={next.page ? `/school-holidays/${next.slug}` : '/school-holidays'} className="font-bold underline">{next.name}: {formatRange(rangeFor(next, level).from, rangeFor(next, level).to)}</Link></p>}
    </section>
    <h2 className="mt-8 mb-3 text-2xl font-black text-center">כל החופשות — {LEVELS.find(l => l.id === level).label}</h2>
    <Table level={level} today={today} />
    <Tools level={level} />
    <Verified />
    <section className="mt-10">
      <h2 className="text-2xl font-black mb-3">מה עושים בחופש?</h2>
      <div className="grid gap-3 sm:grid-cols-2">{HOLIDAYS.filter(b => b.page).map(b => <Link key={b.slug} to={`/school-holidays/${b.slug}`} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4 block"><span className="text-2xl" aria-hidden="true">{b.emoji}</span> <b className="text-lg">{b.pageTitle}</b><p className="m-0 text-[var(--muted-foreground)]">{b.teaser}</p></Link>)}</div>
    </section>
    <div className="mt-10"><SeoBody paragraphs={HUB_COPY.about} faq={HUB_COPY.faq} related={HUB_COPY.related} /></div>
  </div>
}

// ── /school-holidays/:slug ───────────────────────────────
export function SchoolHolidayPage() {
  const { slug } = useParams()
  const b = HOLIDAYS.find(x => x.slug === slug && x.page)
  const today = useToday()
  const [level, setLevel] = useLevel()
  if (!b) return <NotFound />
  const lv = rangeFor(b, level) ? level : LEVELS.find(l => rangeFor(b, l.id)).id
  const r = rangeFor(b, lv)
  const others = breaksFor(HOLIDAYS, 'yesodi').filter(x => x.page && x.slug !== b.slug)
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={b.seoTitle} description={b.description} path={`/school-holidays/${b.slug}`} structuredData={faqSchema(b.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, HUB, { label: b.name }]} />
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl"><span aria-hidden="true">{b.emoji} </span>{b.pageTitle}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{b.intro}</p>
    </header>
    <section className="ln-box sh-hero mt-6 text-center">
      <LevelPicker level={lv} setLevel={setLevel} />
      <p className="sh-dates"><b>{formatLong(r.from)}</b>{r.from !== r.to && <> עד <b>{formatLong(r.to)}</b></>}</p>
      {r.back && <p className="m-0">חוזרים ללימודים: {formatLong(r.back)}</p>}
      <Countdown b={b} level={lv} today={today} />
    </section>
    <h2 className="mt-8 mb-3 text-2xl font-black text-center">{b.name} בכל שלבי החינוך</h2>
    <div className="sh-table-wrap"><table className="sh-table">
      <thead><tr><th scope="col">שלב</th><th scope="col">החופשה</th><th scope="col">ימים</th></tr></thead>
      <tbody>{LEVELS.map(l => { const x = rangeFor(b, l.id); return <tr key={l.id}><th scope="row">{l.emoji} {l.label}</th><td>{x ? formatRange(x.from, x.to) : 'אין חופשה'}{x?.back && <small>חוזרים: {weekday(x.back)} {formatShort(x.back)}</small>}</td><td>{x ? dayCount(x.from, x.to) : '—'}</td></tr> })}</tbody>
    </table></div>
    {b.notes?.length > 0 && <ul className="sh-notes">{b.notes.map(n => <li key={n}>{n}</li>)}</ul>}
    <Verified />
    {b.ideas?.length > 0 && <section className="mt-10">
      <h2 className="text-2xl font-black mb-3">{b.ideasTitle || 'מה עושים בחופשה?'}</h2>
      <div className="grid gap-3 sm:grid-cols-2">{b.ideas.map(i => <Link key={i.href} to={i.href} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4 block"><b className="text-lg">{i.label}</b>{i.d && <p className="m-0 text-[var(--muted-foreground)]">{i.d}</p>}</Link>)}</div>
    </section>}
    <section className="mt-10">
      <h2 className="text-2xl font-black mb-3">חופשות נוספות בשנה</h2>
      <div className="flex flex-wrap gap-2">{others.map(o => <Link key={o.slug} to={`/school-holidays/${o.slug}`} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{o.emoji} {o.name}</Link>)}<Link to="/school-holidays" className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-3 py-2 font-bold">📅 הלוח המלא ←</Link></div>
    </section>
    <div className="mt-10"><SeoBody paragraphs={b.about} faq={b.faq} related={b.related} /></div>
  </div>
}
