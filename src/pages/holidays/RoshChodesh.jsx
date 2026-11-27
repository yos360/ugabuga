import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import NotFound from '../NotFound'
import { MONTH_BY_SLUG, YEAR_ORDER, BLESSING_LINE, COMMON_CUSTOMS } from '../../data/roshChodesh'
import { nextRoshChodesh } from '../../utils/roshChodesh'

// /holidays/rosh-chodesh (hub of the 12 months) and /holidays/rosh-chodesh/:month (one Hebrew month:
// what is special, customs, a greeting, and an activity for kids and kindergarten). The next date is
// computed in the browser from the Hebrew calendar.
const BASE = '/holidays/rosh-chodesh'
const CARD = ['bg-yellow-100', 'bg-pink-100', 'bg-blue-100', 'bg-green-100', 'bg-orange-100', 'bg-purple-100']
const fmtDate = new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

function NextDate({ names, label }) {
  const [res, setRes] = useState(undefined)
  useEffect(() => { setRes(nextRoshChodesh(names)) }, [names])
  if (!res) return null
  const days = res.days
  return <p className="mb-6 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-4 text-lg">
    🌙 {label}: <b>{days.length === 2 ? `${fmtDate.format(days[0])} ו${fmtDate.format(days[1])}` : fmtDate.format(days[0])}</b>
  </p>
}

function Block({ title, items }) {
  return <section className="mb-8">
    <h2 className="mb-3 text-3xl font-bold">{title}</h2>
    <ul className="space-y-2 pr-5 text-lg leading-relaxed [list-style:disc]">{items.map(t => <li key={t}>{t}</li>)}</ul>
  </section>
}

function Hub() {
  const faq = [
    { q: 'מה זה ראש חודש?', a: 'היום הראשון של כל חודש עברי — כשהירח מתחיל מחזור חדש. הוא חג קטן: בתפילה מוסיפים "יעלה ויבוא", אומרים חצי הלל וקוראים בתורה.' },
    { q: 'למה ראש חודש הוא לפעמים יומיים?', a: 'כשהחודש שלפניו בן 30 ימים, היום ה־30 שלו הוא ראש חודש ראשון, וא׳ בחודש החדש הוא ראש חודש שני.' },
    { q: 'כמה חודשים יש בשנה העברית?', a: '12 חודשים, ובשנה מעוברת 13 — מוסיפים אדר א׳. ראש חודש תשרי הוא ראש השנה.' },
  ]
  return <>
    <SEO title="ראש חודש לפי חודש עברי — מה מיוחד, מנהגים, ברכה ופעילות לילדים" description="דף לכל חודש עברי: ראש חודש אלול, אב, אייר, ניסן, אדר, כסלו ועוד. מה מיוחד בחודש, מנהגים, ברכה קצרה ופעילות לילדים ולגן." path={BASE} structuredData={faqSchema(faq)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🌙 ראש חודש לפי חודש</h1>
    <p className="mb-8 text-center font-hand text-lg text-[var(--muted-foreground)]">12 החודשים העבריים: מנהגים, ברכות ופעילות לילדים</p>
    <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {YEAR_ORDER.map((slug, i) => {
        const m = MONTH_BY_SLUG[slug]
        return <Link key={slug} to={`${BASE}/${slug}`} className={`wobbly flex flex-col border-2 border-[var(--border)] ${CARD[i % CARD.length]} p-5 sketch-shadow transition-transform hover:-translate-y-1`}>
          <span className="mb-1 text-4xl" aria-hidden="true">{m.emoji}</span>
          <h2 className="text-2xl font-bold">ראש חודש {m.name}</h2>
          <p className="flex-1 text-[var(--muted-foreground)]">{m.short}</p>
          <span className="mt-2 font-bold underline decoration-dashed">לדף החודש ←</span>
        </Link>
      })}
    </div>
    <Block title="מה משותף לכל ראשי החודשים" items={COMMON_CUSTOMS} />
    <SeoBody paragraphs={['ראש חודש הוא החג הקטן של הלוח העברי: הלוח מבוסס על מחזור הירח, וכשהירח "מתחדש", מתחיל חודש חדש. בדפי החודשים תמצאו עובדות על כל חודש, מנהגים נפוצים, ברכה קצרה לשליחה ופעילות פשוטה לגן ולבית. המנהגים משתנים בין קהילות, ולכן כתוב "נוהגים" ו"יש נוהגים".']} faq={faq} related={[{ label: 'כל החגים', href: '/holidays' }, { label: 'ברכות לראש חודש', href: '/holidays/blessings/rosh-chodesh' }, { label: 'המרת תאריכים לעברי', href: '/tools/hebrew-birthday' }]} />
  </>
}

function MonthPage({ m }) {
  const i = YEAR_ORDER.indexOf(m.slug), next = MONTH_BY_SLUG[YEAR_ORDER[(i + 1) % 12]], prev = MONTH_BY_SLUG[YEAR_ORDER[(i + 11) % 12]]
  const isTishrei = m.slug === 'tishrei'
  const faq = [
    ...m.faq,
    { q: `מה מיוחד בחודש ${m.name}?`, a: m.short + '. ' + m.special[0] },
  ]
  return <>
    <SEO title={`ראש חודש ${m.name} — מנהגים, ברכה ופעילות לילדים ולגן`} description={`ראש חודש ${m.name}: ${m.short}. מה מיוחד בחודש, מנהגים, ברכה קצרה, ופעילות לילדים ולגן. אורך החודש: ${m.days}.`} path={`${BASE}/${m.slug}`} structuredData={faqSchema(faq)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">{m.emoji} ראש חודש {m.name}</h1>
    <p className="mb-6 text-center font-hand text-lg text-[var(--muted-foreground)]">{m.short}</p>
    <NextDate names={m.names} label={`ראש חודש ${m.name} הקרוב`} />
    <p className="mb-8 text-lg leading-relaxed">{m.intro}</p>
    <div className="mb-8 grid gap-3 sm:grid-cols-3">
      {[['אורך החודש', m.days], ['ראש חודש', m.rc], ['מזל', m.mazal]].map(([k, v]) => <div key={k} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">{k}</p><p className="text-xl font-bold">{v}</p>
      </div>)}
    </div>
    <Block title={`מה מיוחד בחודש ${m.name}`} items={m.special} />
    <Block title="מנהגים" items={m.customs} />
    {!isTishrei && <Block title="מה אומרים ועושים בכל ראש חודש" items={COMMON_CUSTOMS} />}
    <section className="mb-8">
      <h2 className="mb-3 text-3xl font-bold">ברכה לחודש</h2>
      <p className="mb-3 rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-xl leading-loose" lang="he">{BLESSING_LINE}</p>
      <p className="text-lg">ברכה קצרה לשליחה: <b>{m.greeting}</b></p>
    </section>
    <section className="mb-8">
      <h2 className="mb-3 text-3xl font-bold">פעילות לילדים</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="wobbly-sm border-2 border-[var(--border)] bg-white p-4"><h3 className="mb-1 text-xl font-bold">🧒 {m.kidTitle}</h3><p className="text-[var(--muted-foreground)]">{m.kidIdea}</p><p className="mt-1 text-sm">מתאים לכיתות א׳–ו׳ ולבית.</p></div>
        <div className="wobbly-sm border-2 border-[var(--border)] bg-white p-4"><h3 className="mb-1 text-xl font-bold">🎨 {m.kinderTitle}</h3><p className="text-[var(--muted-foreground)]">{m.kinderIdea}</p><p className="mt-1 text-sm">מתאים לגן.</p></div>
      </div>
    </section>
    <p className="mb-6 flex flex-wrap gap-3">
      {m.links.map(l => <Link key={l.to} to={l.to} className="rounded-full border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">{l.label} ←</Link>)}
    </p>
    <nav aria-label="החודשים הסמוכים" className="mb-8 flex items-center justify-between gap-3">
      <Link to={`${BASE}/${prev.slug}`} className="rounded-full border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">→ {prev.name}</Link>
      <Link to={BASE} className="font-bold underline">כל החודשים</Link>
      <Link to={`${BASE}/${next.slug}`} className="rounded-full border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">{next.name} ←</Link>
    </nav>
    <SeoBody paragraphs={[`דף זה מרכז עובדות על חודש ${m.name} ומנהגים נפוצים. מנהגים משתנים בין קהילות, וכדאי לשאול את הרב או את הגננת על המנהג שלכם.`]} faq={faq} related={[{ label: 'ברכות לראש חודש', href: '/holidays/blessings/rosh-chodesh' }, { label: 'כל החגים', href: '/holidays' }]} />
  </>
}

export default function RoshChodesh() {
  const { month } = useParams()
  const m = month ? MONTH_BY_SLUG[month] : null
  if (month && !m) return <NotFound />
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, ...(m ? [{ label: 'ראש חודש', href: BASE }, { label: m.name }] : [{ label: 'ראש חודש' }])]} />
      {m ? <MonthPage key={m.slug} m={m} /> : <Hub />}
    </div>
  )
}

