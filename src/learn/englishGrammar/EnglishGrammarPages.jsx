import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../../pages/NotFound'
import { GRAMMAR_BANDS, GRAMMAR_PATH, GRAMMAR_TOPICS, bandOf, grammarBySlug, grammarHref, topicsInBand } from '../../data/englishGrammar'
import '../learn.css'
import '../subjects/subjects.css'
import './grammar.css'

// /learn/english-grammar — grammar lessons by grade band; /learn/english-grammar/:slug — one lesson:
// explanation with tables, common mistakes of Hebrew speakers, a quiz with instant feedback and a
// printable worksheet (fill-ins + multiple choice) with an answer key.
const LETTERS = ['א', 'ב', 'ג', 'ד']
const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const LEARN_CRUMB = { label: 'לומדים', href: '/learn' }
const HUB_CRUMB = { label: 'דקדוק באנגלית', href: GRAMMAR_PATH }
const En = ({ children }) => <bdi dir="ltr" className="eg-en">{children}</bdi>

const HUB_FAQ = [
  { q: 'מה לומדים בדקדוק אנגלית בכל כיתה?', a: 'בכיתות ג׳–ד׳ לומדים a/an, רבים, am/is/are, have got, can ומילות יחס. בה׳–ו׳ — הווה פשוט ומתמשך, עבר פשוט, שאלות והשוואות. בז׳–ט׳ — Present Perfect, עתיד, מודאלים, סביל ותנאי. בתיכון — דיבור עקיף, משפטי זיקה ומילות קישור לבגרות. הסדר משתנה מבית ספר לבית ספר.' },
  { q: 'איך מתכוננים למבחן בדקדוק אנגלית?', a: 'קוראים את ההסבר והטבלה, עוברים על הטעויות הנפוצות, עושים את החידון באתר (הוא מסביר כל תשובה), ואז מדפיסים את דף העבודה ופותרים בלי עזרה. בסוף בודקים מול דף התשובות.' },
  { q: 'השיעורים בחינם?', a: 'כן. כל השיעורים, החידונים ודפי העבודה בחינם ובלי הרשמה.' },
  { q: 'זו תוכנית הלימודים הרשמית?', a: 'לא. השיעורים מבוססים על הנושאים הנפוצים בתוכנית האנגלית בישראל, אבל כל מורה בונה את הסדר שלו — כדאי לבדוק מול המחברת והמורה.' },
]

export function GrammarHub() {
  const list = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'דקדוק באנגלית לפי כיתה', itemListElement: GRAMMAR_TOPICS.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: `${t.title} (${t.en})`, url: `https://ugabuga.co.il${grammarHref(t)}` })) }
  return <Page>
    <SEO title="דקדוק באנגלית לפי כיתה — הסברים, חידונים ודפי עבודה" description={`דקדוק אנגלית מכיתה ג׳ ועד הבגרות: ${GRAMMAR_TOPICS.length} שיעורים עם הסבר בעברית, טבלאות, טעויות נפוצות, חידון עם תשובות ודף עבודה להדפסה.`} path={GRAMMAR_PATH} structuredData={[list, faqSchema(HUB_FAQ)]} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, { label: HUB_CRUMB.label }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">📘 </span>דקדוק באנגלית לפי כיתה</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">{GRAMMAR_TOPICS.length} שיעורים · מכיתה ג׳ ועד הבגרות</p>
    <p className="sj-intro">כל מה שצריך כדי להבין את הדקדוק ולהצליח במבחן: הסבר קצר בעברית, טבלאות ודוגמאות באנגלית, הטעויות שהכי הרבה ילדים בישראל עושים, חידון שמסביר כל תשובה, ודף עבודה להדפסה עם דף תשובות.</p>
    <nav className="sj-jump" aria-label="לפי כיתה">{GRAMMAR_BANDS.map(b => <a key={b.id} href={`#${b.id}`} className="ln-chip">{b.emoji} {b.label}</a>)}</nav>
    {GRAMMAR_BANDS.map(b => <section key={b.id} id={b.id} aria-labelledby={`${b.id}-h`}>
      <div className="eg-band-head"><h2 id={`${b.id}-h`}><span aria-hidden="true">{b.emoji} </span>{b.label}</h2><span className="text-[var(--muted-foreground)]">{b.desc}</span></div>
      <ul className="sj-grid">{topicsInBand(b.id).map(t => <li key={t.slug}><Link to={grammarHref(t)} className="sj-card card-lift">
        <span className="sj-ico" aria-hidden="true">{t.emoji}</span>
        <span><b>{t.title}</b><span className="eg-card-en" dir="ltr">{t.en}</span><small>{t.quiz.length} שאלות בחידון · דף עבודה להדפסה</small></span>
      </Link></li>)}</ul>
    </section>)}
    <h2 className="mt-10 mb-3 text-2xl font-black">עוד אנגלית באתר</h2>
    <div className="grid gap-3 sm:grid-cols-2">
      <Link to="/unseen/english" className="ln-box card-lift text-right"><b className="text-lg">📝 אנסין באנגלית</b><br /><small>קטעי קריאה עם שאלות לכיתות ה׳–י״ב</small></Link>
      <Link to="/learn/english/by-grade" className="ln-box card-lift text-right"><b className="text-lg">🔤 אנגלית לפי כיתה</b><br /><small>מה לומדים בכל כיתה ומילים לתרגול</small></Link>
      <Link to="/english" className="ln-box card-lift text-right"><b className="text-lg">🇬🇧 מילים באנגלית לפי נושא</b><br /><small>אוצר מילים עם תמונה, הגייה ומשחק</small></Link>
      <Link to="/learn/dictation/english" className="ln-box card-lift text-right"><b className="text-lg">✍️ הכתבה באנגלית</b><br /><small>שומעים מילה וכותבים</small></Link>
    </div>
    <div className="mt-12"><SeoBody paragraphs={[
      'הדקדוק באנגלית שונה מאוד מהעברית: יש זמנים שאין לנו (כמו Present Perfect), פועל to be שבעברית "נעלם" בהווה, וסדר מילים קבוע בשאלות. לכן כל שיעור כאן מתחיל במה שחשוב לדובר עברית לדעת — ובטעויות שהכי נפוץ לעשות.',
      'איך משתמשים: בוחרים כיתה ונושא, קוראים את ההסבר (5 דקות), עושים את החידון באתר ומקבלים הסבר על כל תשובה, ובסוף מדפיסים את דף העבודה — תרגיל השלמה ושאלות אמריקאיות, עם דף תשובות להורים או לבדיקה עצמית.',
      'לתלמידי תיכון ולבגרות: הנושאים של כיתות ז׳–ט׳ הם הבסיס לבגרות, ובשיעורים של י׳–י״ב יש דיבור עקיף, משפטי זיקה, ing מול to, ומילות קישור שעוזרות לכתוב חיבור טוב יותר.',
    ]} faq={HUB_FAQ} related={[LEARN_CRUMB, { label: 'אנסין באנגלית', href: '/unseen/english' }, { label: 'אנגלית לפי כיתה', href: '/learn/english/by-grade' }]} /></div>
  </Page>
}

export function GrammarTopic() {
  const { slug } = useParams(), t = grammarBySlug(slug)
  return t ? <TopicPage key={t.slug} t={t} /> : <NotFound />
}

function Block({ b, id }) {
  return <section id={id}>
    <h2>{b.h}</h2>
    {b.p?.map((p, i) => <p key={i}>{p}</p>)}
    {b.table && <div className="eg-table-wrap"><table className="eg-table">
      <thead><tr>{b.table.head.map((h, i) => <th key={i} scope="col" dir="auto">{h}</th>)}</tr></thead>
      <tbody>{b.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} dir="auto">{c}</td>)}</tr>)}</tbody>
    </table></div>}
    {b.ex && <ul className="eg-ex">{b.ex.map(([en, he], i) => <li key={i}><span className="en" dir="ltr">{en}</span><span className="he">{he}</span></li>)}</ul>}
  </section>
}

function TopicPage({ t }) {
  const [printing, setPrinting] = useState(false)
  const band = bandOf(t), path = grammarHref(t)
  const inBand = topicsInBand(t.band), idx = GRAMMAR_TOPICS.indexOf(t)
  const prev = GRAMMAR_TOPICS[idx - 1], next = GRAMMAR_TOPICS[idx + 1]
  const lesson = { '@context': 'https://schema.org', '@type': 'LearningResource', name: `${t.title} (${t.en})`, description: t.seoDesc, inLanguage: ['he', 'en'], educationalLevel: band.label, learningResourceType: 'הסבר, חידון ודף עבודה', isAccessibleForFree: true, about: 'English grammar' }
  return <Page>
    <SEO title={t.seoTitle} description={t.seoDesc} path={path} type="article" structuredData={[lesson, faqSchema(t.faq)]} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, HUB_CRUMB, { label: t.title }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{t.emoji} </span>{t.title}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4"><En>{t.en}</En> · דקדוק אנגלית ל{band.label}</p>
    <p className="eg-rule"><b>בקיצור: </b>{t.rule}</p>
    <p className="sj-intro">{t.intro}</p>
    <nav className="sj-jump" aria-label="בשיעור הזה">
      {t.blocks.map((b, i) => <a key={i} href={`#s${i + 1}`} className="ln-chip">{b.h}</a>)}
      <a href="#mistakes" className="ln-chip">⚠️ טעויות נפוצות</a>
      <a href="#quiz" className="ln-chip">✅ חידון</a>
      <a href="#worksheet" className="ln-chip">🖨️ דף עבודה</a>
    </nav>
    <article className="sj-article">{t.blocks.map((b, i) => <Block key={i} b={b} id={`s${i + 1}`} />)}</article>
    <section id="mistakes" className="mt-8" aria-labelledby="mistakes-h">
      <h2 id="mistakes-h" className="text-3xl font-black">⚠️ טעויות נפוצות</h2>
      <div className="eg-mistakes">{t.mistakes.map(([bad, good, why], i) => <div key={i} className="eg-mistake">
        <p>✘ <bdi dir="ltr" className="bad">{bad}</bdi></p>
        <p>✔ <bdi dir="ltr" className="good">{good}</bdi></p>
        <p className="text-[var(--muted-foreground)]">{why}</p>
      </div>)}</div>
    </section>
    <h2 id="quiz" className="mt-10 mb-3 text-3xl font-black">✅ חידון: {t.title}</h2>
    <p className="mb-3">{t.quiz.length} שאלות. בוחרים תשובה ומקבלים מיד הסבר.</p>
    <Quiz key={t.slug} quiz={t.quiz} />
    <div id="worksheet" className="ln-box mt-8 text-center">
      <h2 className="text-2xl font-black mb-2">🖨️ דף עבודה להדפסה</h2>
      <p className="mb-3">תזכורת של החוק, {t.drill.length} משפטי השלמה, {t.quiz.length} שאלות אמריקאיות ודף תשובות עם הסברים.</p>
      <button type="button" className="ln-btn alt" onClick={() => setPrinting(true)}>להדפסה או PDF</button>
    </div>
    {printing && <PrintPreview title={`דקדוק אנגלית: ${t.title} — דף עבודה`} onClose={() => setPrinting(false)}><Worksheet t={t} band={band} /></PrintPreview>}
    <h2 className="mt-10 mb-3 text-2xl font-black">עוד נושאים ל{band.label}</h2>
    <div className="grid gap-3 sm:grid-cols-2">{inBand.filter(x => x !== t).map(x => <Link key={x.slug} to={grammarHref(x)} className="ln-box card-lift text-right"><b className="text-lg">{x.emoji} {x.title}</b> <span className="eg-card-en" dir="ltr">{x.en}</span></Link>)}</div>
    <nav className="mt-6 flex flex-wrap justify-between gap-3" aria-label="השיעור הקודם והבא">
      {prev ? <Link to={grammarHref(prev)} className="ln-chip">→ {prev.title}</Link> : <span />}
      {next ? <Link to={grammarHref(next)} className="ln-chip">{next.title} ←</Link> : <span />}
    </nav>
    <p className="mt-4 text-center"><Link to={GRAMMAR_PATH} className="font-bold underline">לכל {GRAMMAR_TOPICS.length} שיעורי הדקדוק באנגלית ←</Link></p>
    <div className="mt-12"><SeoBody faq={t.faq} related={[HUB_CRUMB, { label: 'אנסין באנגלית', href: '/unseen/english' }, { label: 'מילים באנגלית', href: '/english' }]} /></div>
  </Page>
}

function Quiz({ quiz }) {
  const [picks, setPicks] = useState([])
  const answered = picks.filter(p => p !== undefined).length
  const score = quiz.filter((q, i) => picks[i] === q.answer).length
  return <div className="space-y-4">
    {quiz.map((q, i) => {
      const p = picks[i], done = p !== undefined
      return <div key={i} className="ln-q">
        <p className="font-bold">{i + 1}. {q.p || 'בחרו את התשובה הנכונה:'}</p>
        {q.s && <span className="eg-s" dir="ltr">{q.s}</span>}
        <div role="group" aria-label={`תשובות לשאלה ${i + 1}`}>{q.options.map((o, j) => <button key={j} type="button" disabled={done} aria-pressed={p === j}
          onClick={() => setPicks(x => { const y = [...x]; y[i] = j; return y })}
          className={`ln-opt ${done && j === q.answer ? 'is-right' : ''} ${done && p === j && j !== q.answer ? 'is-wrong' : ''}`}><b>{LETTERS[j]}.</b> <bdi>{o}</bdi></button>)}</div>
        {done && <p className={`sj-exp ${p === q.answer ? 'ok' : 'no'}`} role="status"><b>{p === q.answer ? '✔ נכון!' : <>✘ התשובה הנכונה: {LETTERS[q.answer]}. <bdi>{q.options[q.answer]}</bdi></>}</b> {q.exp}</p>}
      </div>
    })}
    {answered === quiz.length && <div className="ln-box text-center" role="status">
      <p className="text-3xl font-black">{score} מתוך {quiz.length} {score === quiz.length ? '🌟' : score >= quiz.length * 0.7 ? '👏' : '💪'}</p>
      <p className="mt-1">{score === quiz.length ? 'מושלם! אפשר לעבור לנושא הבא.' : 'כדאי לקרוא שוב את ההסבר והטעויות הנפוצות, ולנסות שוב.'}</p>
      <button type="button" className="ln-btn go mt-3" onClick={() => setPicks([])}>🔁 לנסות שוב</button>
    </div>}
  </div>
}

function Worksheet({ t, band }) {
  return <>
    <article className="buga-flow ln-print sj-print eg-print" dir="rtl">
      <h2>{t.title} — <bdi dir="ltr">{t.en}</bdi></h2>
      <div className="meta"><span>שם: __________________</span><span>כיתה: ______</span><span>תאריך: ____________</span></div>
      <p className="eg-rule"><b>החוק בקיצור: </b>{t.rule}</p>
      <h3>חלק א׳ — השלימו</h3>
      <ol className="eg-print-drill">{t.drill.map(([s], i) => <li key={i}><bdi dir="ltr">{s}</bdi></li>)}</ol>
      <h3>חלק ב׳ — הקיפו את התשובה הנכונה</h3>
      <ol className="sj-print-qs">{t.quiz.map((q, i) => <li key={i}>
        {q.p && <p>{q.p}</p>}
        {q.s && <span className="eg-s" dir="ltr">{q.s}</span>}
        <ul>{q.options.map((o, j) => <li key={j}><b>{LETTERS[j]}.</b> <bdi>{o}</bdi></li>)}</ul>
      </li>)}</ol>
      <p className="sj-print-src">עוגה בוגה · דקדוק אנגלית ל{band.label} · ugabuga.co.il{grammarHref(t)}</p>
    </article>
    <article className="buga-flow ln-print sj-print eg-print" dir="rtl">
      <h2>תשובות — {t.title}</h2>
      <h3>חלק א׳</h3>
      <ol className="eg-print-key cols">{t.drill.map(([, a], i) => <li key={i}><bdi dir="ltr">{a}</bdi></li>)}</ol>
      <h3>חלק ב׳</h3>
      <ol className="eg-print-key">{t.quiz.map((q, i) => <li key={i}><b>{LETTERS[q.answer]}</b> (<bdi>{q.options[q.answer]}</bdi>) — {q.exp}</li>)}</ol>
    </article>
  </>
}
