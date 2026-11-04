import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import { SummarySheet, WorksheetSheet, AnswerSheet, TestSheets } from '../../components/hanukkah/HanukkahLearnSheets'
import NotFound from '../NotFound'
import { HANUKKAH_LEARN, HANUKKAH_TEST, LEARN_BY_SLUG, LEARN_EXTRA, LEARN_BASE } from '../../data/hanukkahLearn'

const PRINT_BTN = 'inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-700'

// /holidays/hanukkah/learn (all summaries) and /holidays/hanukkah/learn/:topic (one summary):
// the short version, sections, timeline, key words and review questions — printable as is.
const link = slug => LEARN_BY_SLUG[slug]
  ? { label: LEARN_BY_SLUG[slug].title, href: `${LEARN_BASE}/${slug}`, emoji: LEARN_BY_SLUG[slug].emoji }
  : { label: LEARN_EXTRA[slug].title, href: LEARN_EXTRA[slug].href, emoji: LEARN_EXTRA[slug].emoji }

function Test() {
  const [open, setOpen] = useState(false)
  const faq = [
    { q: 'לאיזה גיל מתאים המבחן?', a: 'לכיתות ג׳ עד ו׳. יש בו 15 שאלות אמריקאיות, שאלה על סדר האירועים ושלוש שאלות פתוחות, וביחד 100 נקודות.' },
    { q: 'יש מחוון?', a: 'כן. הדף האחרון בהדפסה הוא המחוון: התשובות לשאלות האמריקאיות, הסדר הנכון של האירועים ותשובות אפשריות לשאלות הפתוחות.' },
    { q: 'איך מתכוננים למבחן?', a: 'קוראים את הסיכומים "סיפור חנוכה בקצרה", "המכבים", "מתתיהו הכהן" ו"יהודה המכבי", ועונים על שאלות החזרה שבסוף כל סיכום.' },
  ]
  return <HanukkahShell crumb="מבחן על חנוכה">
    <SEO title="מבחן על חנוכה לכיתות ג׳–ו׳ — עם מחוון, להדפסה" description={`מבחן על סיפור חנוכה לכיתות ג׳–ו׳: ${HANUKKAH_TEST.mc.length} שאלות אמריקאיות, סידור אירועים לפי הסדר ו־${HANUKKAH_TEST.open.length} שאלות פתוחות, 100 נקודות, עם מחוון מלא. להדפסה בחינם.`} path={`${LEARN_BASE}/test`} structuredData={faqSchema(faq)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">📝 מבחן על חנוכה</h1>
    <p className="mx-auto mb-5 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מבחן מוכן על סיפור חנוכה לכיתות ג׳–ו׳: {HANUKKAH_TEST.mc.length} שאלות אמריקאיות, סידור אירועים ו־{HANUKKAH_TEST.open.length} שאלות פתוחות. שלושה דפים, והאחרון הוא המחוון.</p>
    <p className="text-center"><button type="button" onClick={() => setOpen(true)} className={PRINT_BTN}>🖨️ להדפסת המבחן עם המחוון</button></p>
    <section className="mx-auto mt-8 max-w-3xl">
      <h2 className="text-2xl font-bold">מה יש במבחן</h2>
      <ol className="mt-3 list-decimal space-y-1 pr-6 text-lg">{HANUKKAH_TEST.mc.map(([q]) => <li key={q}>{q}</li>)}</ol>
      <p className="mt-3 text-lg">ועוד: סידור {HANUKKAH_TEST.order.length} אירועים לפי הסדר, ו־{HANUKKAH_TEST.open.length} שאלות פתוחות.</p>
    </section>
    <div className="mt-10"><SeoBody paragraphs={['המבחן בודק את ההבנה של סיפור חנוכה: הרקע ההיסטורי, הגזירות, המרד, הקרבות, חנוכת המקדש והמנהגים. השאלות הפתוחות מבקשות מהתלמידים להסביר במילים שלהם, ולא רק לזכור עובדות.']} faq={faq} related={[{ label: 'סיכומים על חנוכה', href: LEARN_BASE }, { label: 'חידון חנוכה', href: '/holidays/hanukkah/quiz' }, { label: 'דפי עבודה לחנוכה', href: '/holidays/hanukkah/worksheets' }]} /></div>
    {open && <PrintPreview title="מבחן על חנוכה" onClose={() => setOpen(false)}><TestSheets /></PrintPreview>}
  </HanukkahShell>
}

function Hub() {
  const [booklet, setBooklet] = useState(false)
  const faq = [
    { q: 'למי מתאימים הסיכומים?', a: 'לתלמידי כיתות ג׳ עד ח׳, להורים ולמורות. בראש כל סיכום יש פסקה קצרה שמתאימה גם לילדים צעירים, ואחריה הרחבה, ציר זמן, מילים חשובות ושאלות לחזרה.' },
    { q: 'אפשר להדפיס סיכום?', a: 'כן. בכל סיכום יש כפתור הדפסה, והעמוד מודפס כדף נקי לתיק או למחברת.' },
    { q: 'על מה מבוססים הסיכומים?', a: 'על ספרי המקבים, על כתבי יוסף בן מתתיהו ועל התלמוד הבבלי. כשמדובר במסורת או באגדה ולא בעובדה היסטורית, כתוב זאת בסיכום.' },
  ]
  return <HanukkahShell crumb="סיכומים על חנוכה">
    <SEO title="סיכומים על חנוכה לתלמידים — המכבים, מתתיהו, יהודה המכבי ועוד" description={`${HANUKKAH_LEARN.length} סיכומים קצרים על חנוכה לילדים ולתלמידים: סיפור החג, המכבים, מתתיהו הכהן, יהודה המכבי, אנטיוכוס, הקרבות, נס פך השמן, הסביבון, הסופגניות ועוד — עם ציר זמן ושאלות לחזרה, גם להדפסה.`} path={LEARN_BASE} structuredData={faqSchema(faq)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">📖 סיכומים על חנוכה</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">כל מה שצריך לדעת על חנוכה, בסיכומים קצרים לתלמידים, להורים ולמורות: האנשים, המקומות, הקרבות והמנהגים. בכל סיכום יש ציר זמן, מילים חשובות, שאלות לחזרה ודף עבודה להדפסה.</p>
    <div className="mb-8 flex flex-wrap justify-center gap-3">
      <button type="button" onClick={() => setBooklet(true)} className={PRINT_BTN}>📚 כל הסיכומים בחוברת אחת להדפסה</button>
      <Link to={`${LEARN_BASE}/test`} className="btn-secondary min-h-[48px]">📝 מבחן על חנוכה עם מחוון</Link>
    </div>
    {booklet && <PrintPreview title="חוברת סיכומים על חנוכה" onClose={() => setBooklet(false)} copies={false}>{HANUKKAH_LEARN.map(t => <SummarySheet key={t.slug} t={t} />)}</PrintPreview>}
    <ul className="grid gap-3 sm:grid-cols-2">
      {HANUKKAH_LEARN.map(t => <li key={t.slug}>
        <Link to={`${LEARN_BASE}/${t.slug}`} className="flex h-full gap-3 rounded-3xl border-2 border-[var(--border)] bg-white p-4 transition-transform hover:-translate-y-0.5">
          <span className="text-4xl" aria-hidden="true">{t.emoji}</span>
          <span><span className="block text-xl font-bold">{t.title}</span><span className="text-[var(--muted-foreground)]">{t.short.split('. ')[0]}.</span></span>
        </Link>
      </li>)}
    </ul>
    <div className="mt-10"><SeoBody paragraphs={[
      'חנוכה הוא חג עם סיפור היסטורי עשיר: ממלכה יוונית, גזירות, משפחה של כוהנים ממודיעין שיצאה למרד, קרבות בהרים, חנוכת בית המקדש ונס פך השמן. הסיכומים כאן מסדרים את הסיפור לפי נושאים, כך שקל להכין עבודה, ללמוד למבחן או לספר לילדים בערב ליד הנרות.',
      'רוצים לתרגל אחרי הקריאה? בחידון חנוכה יש שאלות בשלוש רמות, ובדפי העבודה יש תרגול לגן ולכיתות הנמוכות.',
    ]} faq={faq} related={[{ label: 'חידון חנוכה', href: '/holidays/hanukkah/quiz' }, { label: 'דפי עבודה לחנוכה', href: '/holidays/hanukkah/worksheets' }, { label: 'שירי חנוכה', href: '/holidays/hanukkah/songs' }, { label: 'זמני הדלקת נרות', href: '/holidays/hanukkah/candle-times' }]} /></div>
  </HanukkahShell>
}

function Topic({ t }) {
  const [print, setPrint] = useState(null)
  const faq = t.quiz.map(([q, a]) => ({ q, a }))
  const i = HANUKKAH_LEARN.indexOf(t), next = HANUKKAH_LEARN[(i + 1) % HANUKKAH_LEARN.length]
  return <HanukkahShell crumb={t.title}>
    <SEO title={t.seo} description={t.desc} path={`${LEARN_BASE}/${t.slug}`} type="article" structuredData={faqSchema(faq)} />
    <article className="mx-auto max-w-3xl">
      <p className="mb-2 text-center"><Link to={LEARN_BASE} className="font-bold text-violet-700 underline">📖 כל הסיכומים על חנוכה</Link></p>
      <h1 className="mb-4 text-center text-4xl sm:text-5xl">{t.emoji} {t.title}</h1>
      <section className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-5" aria-labelledby="short">
        <h2 id="short" className="text-xl font-bold">בקצרה</h2>
        <p className="mt-2 text-lg leading-relaxed">{t.short}</p>
      </section>
      {t.sections.map(([title, body]) => <section key={title} className="mt-7">
        <h2 className="text-2xl font-bold">{title}</h2>
        {Array.isArray(body)
          ? body.map(p => <p key={p} className="mt-2 text-lg leading-relaxed">{p}</p>)
          : <ul className="mt-2 space-y-2">{body.list.map(x => <li key={x} className="flex gap-2 text-lg leading-relaxed"><span aria-hidden="true">⭐</span><span>{x}</span></li>)}</ul>}
      </section>)}
      {t.timeline && <section className="mt-8" aria-labelledby="timeline">
        <h2 id="timeline" className="text-2xl font-bold">🗓️ ציר זמן</h2>
        <ol className="mt-3 border-r-4 border-blue-200 pr-4">
          {t.timeline.map(([when, what]) => <li key={when + what} className="mb-3"><span className="font-bold text-blue-800">{when}</span> — {what}</li>)}
        </ol>
      </section>}
      <section className="mt-8" aria-labelledby="words">
        <h2 id="words" className="text-2xl font-bold">🔤 מילים חשובות</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {t.words.map(([w, m]) => <div key={w} className="rounded-2xl border-2 border-[var(--border)] bg-white p-3"><dt className="font-bold">{w}</dt><dd className="text-[var(--muted-foreground)]">{m}</dd></div>)}
        </dl>
      </section>
      <section className="mt-8" aria-labelledby="quiz">
        <h2 id="quiz" className="text-2xl font-bold">❓ שאלות לחזרה</h2>
        <p className="mt-1 text-[var(--muted-foreground)]">חושבים על התשובה, ואז לוחצים כדי לבדוק.</p>
        <div className="mt-3 space-y-2">
          {t.quiz.map(([q, a], n) => <details key={q} className="rounded-2xl border-2 border-[var(--border)] bg-white p-3">
            <summary className="cursor-pointer font-bold">{n + 1}. {q}</summary>
            <p className="mt-2">{a}</p>
          </details>)}
        </div>
      </section>
      <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
        <button type="button" onClick={() => setPrint('worksheet')} className={PRINT_BTN}>✏️ דף עבודה להדפסה (עם תשובות)</button>
        <button type="button" onClick={() => setPrint('summary')} className="btn-secondary">🖨️ הדפסת הסיכום</button>
        <Link to={`${LEARN_BASE}/${next.slug}`} className="btn-secondary">הסיכום הבא: {next.emoji} {next.title} ←</Link>
      </div>
      <section className="mt-10 print:hidden" aria-labelledby="more">
        <h2 id="more" className="text-2xl font-bold">עוד סיכומים שקשורים</h2>
        <div className="mt-3 flex flex-wrap gap-2">{t.related.map(s => { const l = link(s); return <Link key={s} to={l.href} className="btn-secondary">{l.emoji} {l.label}</Link> })}</div>
      </section>
      {print && <PrintPreview title={print === 'summary' ? `סיכום: ${t.title}` : `דף עבודה: ${t.title}`} onClose={() => setPrint(null)}>
        {print === 'summary' ? <SummarySheet t={t} /> : <><WorksheetSheet t={t} /><AnswerSheet t={t} /></>}
      </PrintPreview>}
      <p className="mt-8 text-sm text-[var(--muted-foreground)]">הסיכום מבוסס על ספרי המקבים, על כתבי יוסף בן מתתיהו ועל התלמוד הבבלי. <Link to="/editorial-policy" className="underline">איך אנחנו בודקים</Link></p>
    </article>
  </HanukkahShell>
}

export default function HanukkahLearn() {
  const { topic } = useParams()
  if (!topic) return <Hub />
  if (topic === 'test') return <Test />
  const t = LEARN_BY_SLUG[topic]
  return t ? <Topic t={t} /> : <NotFound />
}
