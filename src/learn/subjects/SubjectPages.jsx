import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../../pages/NotFound'
import { SUBJECTS, SUBJECT_BY_KEY, GRADE_LETTERS, examQuestions, gradeRange, gradeSlug, loadConcepts, loadTopics, placeQuiz, topicsForGrade } from './subjects'
import '../learn.css'
import './subjects.css'

// Each subject's lessons (and glossary) are separate chunks, loaded only on that subject's pages.
function useLoaded(load, key) {
  const [data, setData] = useState(null)
  useEffect(() => {
    let live = true
    setData(null)
    load(key).then(d => { if (live) setData(d) })
    return () => { live = false }
  }, [load, key])
  return data
}
const useTopics = key => useLoaded(loadTopics, key)
const useConcepts = key => useLoaded(loadConcepts, key)

const LETTERS = ['א', 'ב', 'ג', 'ד']
const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const LEARN_CRUMB = { label: 'לומדים', href: '/learn' }
const crumb = s => ({ label: s.title, href: `/learn/${s.key}` })
const Loading = () => <p className="text-center py-16 text-lg" role="status">טוען…</p>

export function SubjectHub({ subjectKey }) {
  const s = SUBJECT_BY_KEY[subjectKey]
  const topics = useTopics(subjectKey)
  return <Page>
    <SEO title={s.seoTitle} description={s.seoDesc} path={`/learn/${s.key}`} structuredData={faqSchema(s.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, { label: s.title }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{s.emoji} </span>{s.title}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">{s.desc} · לכיתות {s.grades}</p>
    {s.tools && <section className="mb-8">
      <h2 className="mb-3 text-2xl font-black">🧪 מתנסים בעצמכם</h2>
      <div className="grid gap-3 sm:grid-cols-3">{s.tools.map(t => <Link key={t.to} to={t.to} className="ln-box card-lift text-right"><b className="text-lg">{t.emoji} {t.label}</b><br /><small>{t.desc}</small></Link>)}</div>
    </section>}
    {!topics ? <Loading /> : <>
      <p className="sj-count">{topics.length} שיעורים · בכל שיעור: הסבר, חידון עם תשובות, דף עבודה להדפסה ושאלות לשיחה</p>
      <ul className="sj-grid">{topics.map(t => <li key={t.slug}><Link to={`/learn/${s.key}/${t.slug}`} className="sj-card card-lift">
        <span className="sj-ico" aria-hidden="true">{t.emoji}</span>
        <span><b>{t.title}</b><small>{t.intro.length > 90 ? `${t.intro.slice(0, t.intro.lastIndexOf(' ', 88))}…` : t.intro}</small></span>
      </Link></li>)}</ul>
      <h2 className="mt-10 mb-3 text-2xl font-black">📚 לפי כיתה: חוברות ומבחנים לדוגמה</h2>
      <GradeChips s={s} topics={topics} />
    </>}
    <ConceptsLink s={s} />
    <h2 className="mt-10 mb-3 text-2xl font-black">עוד מקצועות</h2>
    <OtherSubjects not={s.key} />
    <div className="mt-12"><SeoBody paragraphs={s.paras} faq={s.faq} related={[LEARN_CRUMB, { label: 'הבנת הנקרא', href: '/learn/reading' }, { label: 'הכנה למבחן מחוננים', href: '/learn/gifted-test' }]} /></div>
  </Page>
}

function OtherSubjects({ not }) {
  return <div className="grid gap-3 sm:grid-cols-3">{SUBJECTS.filter(x => x.key !== not).map(x => <Link key={x.key} to={`/learn/${x.key}`} className="ln-box card-lift text-right"><b className="text-lg">{x.emoji} {x.title}</b><br /><small>{x.desc}</small></Link>)}</div>
}

// Grades that have enough lessons for a grade page (booklet and sample exam).
const MIN_GRADE_TOPICS = 4
const liveGrades = (s, topics) => s.gradeList.filter(g => topicsForGrade(topics, g).length >= MIN_GRADE_TOPICS)
function GradeChips({ s, topics, current }) {
  return <nav className="flex flex-wrap gap-2" aria-label={`${s.short} לפי כיתה`}>{liveGrades(s, topics).map(g => <Link key={g} to={`/learn/${s.key}/${gradeSlug(g)}`} className="ln-chip" aria-current={g === current ? 'page' : undefined}>כיתה {GRADE_LETTERS[g]}</Link>)}</nav>
}
function ConceptsLink({ s }) {
  const concepts = useConcepts(s.key)
  if (!concepts?.length) return null
  return <p className="mt-6 text-center"><Link to={`/learn/${s.key}/concepts`} className="ln-btn alt inline-block">📘 מילון מושגים ב{s.short} ({concepts.length})</Link></p>
}

// /learn/<subject>/<slug>: a lesson, or a grade page when the slug is grade-<n>.
export function SubjectTopic({ subjectKey }) {
  const { slug } = useParams()
  const g = /^grade-(\d{1,2})$/.exec(slug)
  return g ? <GradePage key={slug} subjectKey={subjectKey} grade={Number(g[1])} /> : <TopicPage key={slug} subjectKey={subjectKey} slug={slug} />
}

function TopicPage({ subjectKey, slug }) {
  const s = SUBJECT_BY_KEY[subjectKey]
  const concepts = useConcepts(subjectKey)
  const topics = useTopics(subjectKey)
  const [printing, setPrinting] = useState(false)
  const t = topics?.find(x => x.slug === slug)
  const quiz = useMemo(() => t ? placeQuiz(t.slug, t.quiz) : [], [t])
  if (!topics) return <Page><Loading /></Page>
  if (!t) return <NotFound />
  const related = t.related.map(r => topics.find(x => x.slug === r)).filter(Boolean)
  const idx = topics.indexOf(t), next = topics[(idx + 1) % topics.length]
  const path = `/learn/${s.key}/${t.slug}`
  const article = { '@context': 'https://schema.org', '@type': 'LearningResource', name: t.title, description: t.seoDesc, inLanguage: 'he', educationalLevel: `כיתות ${t.grades}`, learningResourceType: 'שיעור, חידון ודף עבודה', isAccessibleForFree: true, about: s.title }
  return <Page>
    <SEO title={t.seoTitle} description={t.seoDesc} path={path} type="article" structuredData={[article, faqSchema(t.faq)]} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, crumb(s), { label: t.title }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{t.emoji} </span>{t.title}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">{s.short} · לכיתות {t.grades}</p>
    <p className="sj-intro">{t.intro}</p>
    <nav className="sj-jump" aria-label="בשיעור הזה">
      {t.sections.map((x, i) => <a key={i} href={`#s${i + 1}`} className="ln-chip">{x.h}</a>)}
      <a href="#quiz" className="ln-chip">✅ חידון</a>
    </nav>
    <article className="sj-article">{t.sections.map((x, i) => <section key={i} id={`s${i + 1}`}>
      <h2>{x.h}</h2>{x.p.map((p, j) => <p key={j}>{p}</p>)}
    </section>)}</article>
    <aside className="sj-facts" aria-labelledby="facts-h"><h2 id="facts-h">📌 חשוב לזכור</h2><ul>{t.facts.map((f, i) => <li key={i}>{f}</li>)}</ul></aside>
    <h2 id="quiz" className="mt-10 mb-3 text-3xl font-black">✅ חידון: {t.title}</h2>
    <Quiz key={t.slug} quiz={quiz} />
    <div className="ln-box mt-6 text-center">
      <h2 className="text-2xl font-black mb-2">🖨️ דף עבודה להדפסה</h2>
      <p className="mb-3">8 שאלות, שאלות לחשיבה ודף תשובות עם הסברים.</p>
      <button type="button" className="ln-btn alt" onClick={() => setPrinting(true)}>להדפסה</button>
    </div>
    {t.more?.map(m => <Link key={m.to} to={m.to} className="ln-box card-lift mt-4 block text-center"><b className="text-xl">{m.emoji} {m.title} ←</b><span className="mt-1 block">{m.desc}</span></Link>)}
    {printing && <PrintPreview title={`${s.short}: ${t.title} — דף עבודה`} onClose={() => setPrinting(false)}><Worksheet s={s} t={t} quiz={quiz} /></PrintPreview>}
    {concepts?.some(c => c.lesson === t.slug) && <section className="mt-6" aria-labelledby="concepts-h"><h2 id="concepts-h" className="text-2xl font-black mb-2">📘 מושגים מהשיעור</h2>
      <div className="flex flex-wrap gap-2">{concepts.filter(c => c.lesson === t.slug).map(c => <Link key={c.slug} to={`/learn/${s.key}/concepts/${c.slug}`} className="ln-chip">{c.term}</Link>)}</div></section>}
    <section className="ln-box mt-6" aria-labelledby="think-h"><h2 id="think-h" className="text-2xl font-black mb-2">💬 שאלות לשיחה</h2><ol className="sj-think">{t.think.map((q, i) => <li key={i}>{q}</li>)}</ol></section>
    <h2 className="mt-10 mb-3 text-2xl font-black">עוד שיעורים ב{s.short}</h2>
    <div className="grid gap-3 sm:grid-cols-2">{[...related, ...(related.includes(next) ? [] : [next])].map(x => <Link key={x.slug} to={`/learn/${s.key}/${x.slug}`} className="ln-box card-lift text-right"><b className="text-lg">{x.emoji} {x.title}</b></Link>)}</div>
    <p className="mt-4 text-center"><Link to={`/learn/${s.key}`} className="font-bold underline">לכל {topics.length} השיעורים ב{s.short} ←</Link></p>
    {gradeRange(t.grades).some(g => liveGrades(s, topics).includes(g)) && <><h2 className="mt-8 mb-3 text-xl font-black">חוברת ומבחן לדוגמה לכיתה</h2>
      <nav className="flex flex-wrap gap-2" aria-label="השיעור לפי כיתה">{gradeRange(t.grades).filter(g => liveGrades(s, topics).includes(g)).map(g => <Link key={g} to={`/learn/${s.key}/${gradeSlug(g)}`} className="ln-chip">{s.short} לכיתה {GRADE_LETTERS[g]}</Link>)}</nav></>}
    <div className="mt-12"><SeoBody faq={t.faq} related={[crumb(s), LEARN_CRUMB]} /></div>
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
        <p className="font-bold">{i + 1}. {q.q}</p>
        <div role="group" aria-label={`תשובות לשאלה ${i + 1}`}>{q.options.map((o, j) => <button key={j} type="button" disabled={done} aria-pressed={p === j}
          onClick={() => setPicks(x => { const y = [...x]; y[i] = j; return y })}
          className={`ln-opt ${done && j === q.answer ? 'is-right' : ''} ${done && p === j && j !== q.answer ? 'is-wrong' : ''}`}><b>{LETTERS[j]}.</b> {o}</button>)}</div>
        {done && <p className={`sj-exp ${p === q.answer ? 'ok' : 'no'}`} role="status"><b>{p === q.answer ? '✔ נכון!' : `✘ התשובה הנכונה: ${LETTERS[q.answer]}.`}</b> {q.exp}</p>}
      </div>
    })}
    {answered === quiz.length && <div className="ln-box text-center" role="status">
      <p className="text-3xl font-black">{score} מתוך {quiz.length} {score === quiz.length ? '🌟' : score >= quiz.length * 0.7 ? '👏' : '💪'}</p>
      <button type="button" className="ln-btn go mt-3" onClick={() => setPicks([])}>🔁 לנסות שוב</button>
    </div>}
  </div>
}

function Worksheet({ s, t, quiz }) {
  return <>
    <article className="buga-flow ln-print sj-print" dir="rtl">
      <h2>{t.title}</h2>
      <div className="meta"><span>שם: __________________</span><span>כיתה: ______</span><span>תאריך: ____________</span></div>
      <p className="sj-print-intro">{t.intro}</p>
      <ol className="sj-print-qs">{quiz.map((q, i) => <li key={i}><p>{q.q}</p><ul>{q.options.map((o, j) => <li key={j}><b>{LETTERS[j]}.</b> {o}</li>)}</ul></li>)}</ol>
      <h3>שאלות לחשיבה</h3>
      <ol className="sj-print-think">{t.think.map((q, i) => <li key={i}><p>{q}</p><div className="line" /><div className="line" /></li>)}</ol>
      <p className="sj-print-src">עוגה בוגה · {s.title} · ugabuga.co.il/learn/{s.key}/{t.slug}</p>
    </article>
    <article className="buga-flow ln-print sj-print" dir="rtl">
      <h2>תשובות והסברים — {t.title}</h2>
      <ol className="sj-print-key">{quiz.map((q, i) => <li key={i}><b>{LETTERS[q.answer]}</b> ({q.options[q.answer]}) — {q.exp}</li>)}</ol>
    </article>
  </>
}


// ── /learn/<subject>/grade-<n>: the grade's lessons, a printable booklet and the sample exam ──
const gradeName = (s, g) => `${s.short} לכיתה ${GRADE_LETTERS[g]}`
function GradePage({ subjectKey, grade }) {
  const s = SUBJECT_BY_KEY[subjectKey]
  const topics = useTopics(subjectKey)
  const [printing, setPrinting] = useState(false)
  if (!topics) return <Page><Loading /></Page>
  const list = topicsForGrade(topics, grade)
  if (!s.gradeList.includes(grade) || list.length < MIN_GRADE_TOPICS) return <NotFound />
  const L = GRADE_LETTERS[grade], name = gradeName(s, grade), path = `/learn/${s.key}/${gradeSlug(grade)}`
  const faq = [
    { q: `מה לומדים ב${s.short} בכיתה ${L}?`, a: `בעמוד הזה מרוכזים ${list.length} שיעורים שמתאימים לכיתה ${L}, ביניהם ${list.slice(0, 3).map(t => t.title).join(', ')}. הנושאים המדויקים משתנים בין בתי ספר — כדאי לבדוק מה לומדים בכיתה עכשיו ולהתחיל משם.` },
    { q: 'מה יש בחוברת להדפסה?', a: `החוברת כוללת עמוד שער ועמוד לכל שיעור — פתיח, "חשוב לזכור" ו־8 שאלות — ובסופה דף תשובות. ${list.length} שיעורים, מוכנים להדפסה או לשמירה כ־PDF.` },
    { q: 'איך עובד המבחן לדוגמה?', a: 'המבחן כולל 20 שאלות אמריקאיות מכל השיעורים של הכיתה. אפשר לפתור אונליין ולקבל ציון והסברים, ללחוץ על "מבחן חדש" לשאלות אחרות, או להדפיס עם דף תשובות.' },
  ]
  return <Page>
    <SEO title={`${name} — שיעורים, חוברת להדפסה ומבחן לדוגמה`} description={`${list.length} שיעורי ${s.short} לכיתה ${L}: הסבר, חידון ודף עבודה לכל נושא, חוברת אחת להדפסה עם תשובות, ומבחן סוף שנה לדוגמה — בחינם.`} path={path} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, crumb(s), { label: `כיתה ${L}` }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{s.emoji} </span>{name}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">{list.length} שיעורים · חוברת להדפסה · מבחן לדוגמה</p>
    <div className="grid gap-3 sm:grid-cols-2">
      <button type="button" className="ln-box card-lift text-right" onClick={() => setPrinting(true)}><b className="text-xl">🖨️ חוברת {name}</b><br /><small>{list.length} שיעורים בקובץ אחד, עם דף תשובות</small></button>
      <Link to={`${path}/exam`} className="ln-box card-lift text-right"><b className="text-xl">📝 מבחן לדוגמה לכיתה {L}</b><br /><small>20 שאלות, ציון והסברים — אונליין ולהדפסה</small></Link>
    </div>
    {printing && <PrintPreview title={`חוברת ${name}`} onClose={() => setPrinting(false)}><Booklet s={s} grade={grade} list={list} /></PrintPreview>}
    <h2 className="mt-10 mb-3 text-2xl font-black">השיעורים לכיתה {L}</h2>
    <ul className="sj-grid">{list.map(t => <li key={t.slug}><Link to={`/learn/${s.key}/${t.slug}`} className="sj-card card-lift">
      <span className="sj-ico" aria-hidden="true">{t.emoji}</span><span><b>{t.title}</b><small>{t.intro.length > 90 ? `${t.intro.slice(0, t.intro.lastIndexOf(' ', 88))}…` : t.intro}</small></span>
    </Link></li>)}</ul>
    <h2 className="mt-10 mb-3 text-2xl font-black">כיתות אחרות</h2>
    <GradeChips s={s} topics={topics} current={grade} />
    <div className="mt-12"><SeoBody paragraphs={[`כאן מרוכזים שיעורי ${s.short} שמתאימים לכיתה ${L}. כל שיעור עומד בפני עצמו: הסבר בשפה פשוטה, "חשוב לזכור", חידון של 8 שאלות עם הסבר לכל תשובה, ודף עבודה להדפסה.`, 'החוברת מאגדת את כל השיעורים לקובץ אחד שנוח להדפיס לכיתה או לשמור כ־PDF, והמבחן לדוגמה עוזר לחזור על החומר לפני מבחן או בסוף השנה.', ...s.paras.slice(0, 1)]} faq={faq} related={[crumb(s), LEARN_CRUMB]} /></div>
  </Page>
}

function Booklet({ s, grade, list }) {
  const name = gradeName(s, grade)
  return <>
    <article className="buga-flow ln-print sj-print sj-cover" dir="rtl">
      <p className="sj-cover-emoji" aria-hidden="true">{s.emoji}</p>
      <h2>חוברת {name}</h2>
      <div className="meta"><span>שם: __________________</span><span>כיתה: ______</span></div>
      <ol className="sj-print-toc">{list.map(t => <li key={t.slug}>{t.title}</li>)}</ol>
      <p className="sj-print-src">עוגה בוגה · ugabuga.co.il/learn/{s.key}/{gradeSlug(grade)}</p>
    </article>
    {list.map((t, n) => { const quiz = placeQuiz(t.slug, t.quiz); return <article key={t.slug} className="buga-flow ln-print sj-print" dir="rtl">
      <h2>{n + 1}. {t.title}</h2>
      <p className="sj-print-intro">{t.intro}</p>
      <ul className="sj-print-facts">{t.facts.map((f, i) => <li key={i}>{f}</li>)}</ul>
      <ol className="sj-print-qs">{quiz.map((q, i) => <li key={i}><p>{q.q}</p><ul>{q.options.map((o, j) => <li key={j}><b>{LETTERS[j]}.</b> {o}</li>)}</ul></li>)}</ol>
    </article> })}
    <article className="buga-flow ln-print sj-print" dir="rtl">
      <h2>תשובות — חוברת {name}</h2>
      <ol className="sj-print-key">{list.map(t => <li key={t.slug}><b>{t.title}:</b> {placeQuiz(t.slug, t.quiz).map((q, i) => `${i + 1}-${LETTERS[q.answer]}`).join(' · ')}</li>)}</ol>
    </article>
  </>
}

// ── /learn/<subject>/grade-<n>/exam ──
export function SubjectExam({ subjectKey }) {
  const { slug } = useParams()
  const g = /^grade-(\d{1,2})$/.exec(slug || '')
  return g ? <ExamPage key={slug} subjectKey={subjectKey} grade={Number(g[1])} /> : <NotFound />
}
function ExamPage({ subjectKey, grade }) {
  const s = SUBJECT_BY_KEY[subjectKey]
  const topics = useTopics(subjectKey)
  const [seed, setSeed] = useState(0), [picks, setPicks] = useState({}), [done, setDone] = useState(false), [printing, setPrinting] = useState(false)
  const list = useMemo(() => topics ? topicsForGrade(topics, grade) : [], [topics, grade])
  const qs = useMemo(() => examQuestions(list, 20, seed), [list, seed])
  if (!topics) return <Page><Loading /></Page>
  if (!s.gradeList.includes(grade) || list.length < MIN_GRADE_TOPICS) return <NotFound />
  const L = GRADE_LETTERS[grade], name = gradeName(s, grade), path = `/learn/${s.key}/${gradeSlug(grade)}`
  const score = qs.filter(q => picks[q.id] === q.answer).length
  const answered = qs.filter(q => picks[q.id] !== undefined).length
  const fresh = () => { setSeed(Math.floor(Math.random() * 1e9) + 1); setPicks({}); setDone(false); window.scrollTo(0, 0) }
  const faq = [
    { q: `ממה בנוי המבחן ב${s.short} לכיתה ${L}?`, a: `מ־20 שאלות אמריקאיות שנבחרות מתוך ${list.length} השיעורים של כיתה ${L}, משאלה אחת או שתיים מכל נושא. בכל לחיצה על "מבחן חדש" מתקבלות שאלות אחרות.` },
    { q: 'זה המבחן האמיתי של בית הספר?', a: 'לא. זה מבחן לדוגמה לתרגול, שנבנה מהשיעורים באתר. המבחנים בבית הספר נכתבים בידי המורים ויכולים לכלול נושאים אחרים.' },
    { q: 'אפשר להדפיס?', a: 'כן. הכפתור "להדפסה" מפיק את המבחן עם מקום לשם, ודף תשובות נפרד עם הסבר לכל שאלה.' },
  ]
  return <Page>
    <SEO title={`מבחן ${name} — מבחן סוף שנה לדוגמה עם תשובות`} description={`מבחן לדוגמה ב${s.short} לכיתה ${L}: 20 שאלות מכל נושאי השנה, עם ציון והסבר לכל תשובה. פותרים אונליין או מדפיסים עם דף תשובות — בחינם.`} path={`${path}/exam`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, crumb(s), { label: `כיתה ${L}`, href: path }, { label: 'מבחן לדוגמה' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">📝 </span>מבחן {name}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">מבחן סוף שנה לדוגמה · 20 שאלות · {list.length} נושאים</p>
    <div className="mb-6 flex flex-wrap justify-center gap-2">
      <button type="button" className="ln-btn alt" onClick={() => setPrinting(true)}>🖨️ להדפסה</button>
      <button type="button" className="ln-btn alt" onClick={fresh}>🎲 מבחן חדש</button>
    </div>
    {printing && <PrintPreview title={`מבחן ${name}`} onClose={() => setPrinting(false)}><ExamSheet name={name} qs={qs} /></PrintPreview>}
    <ol className="space-y-4">{qs.map((q, i) => {
      const p = picks[q.id]
      return <li key={q.id} className="ln-q">
        <p className="font-bold">{i + 1}. {q.q} <small className="font-normal text-[var(--muted-foreground)]">({q.topic.title})</small></p>
        <div role="group" aria-label={`תשובות לשאלה ${i + 1}`}>{q.options.map((o, j) => <button key={j} type="button" disabled={done} aria-pressed={p === j}
          onClick={() => setPicks(x => ({ ...x, [q.id]: j }))}
          className={`ln-opt ${done && j === q.answer ? 'is-right' : ''} ${done && p === j && j !== q.answer ? 'is-wrong' : ''}`}><b>{LETTERS[j]}.</b> {o}</button>)}</div>
        {done && <p className={`sj-exp ${p === q.answer ? 'ok' : 'no'}`}><b>{p === q.answer ? '✔ נכון.' : `✘ התשובה: ${LETTERS[q.answer]}.`}</b> {q.exp} <Link to={`/learn/${s.key}/${q.topic.slug}`} className="underline">לשיעור ←</Link></p>}
      </li>
    })}</ol>
    {!done ? <div className="ln-box mt-6 text-center"><p className="mb-3">ענית על {answered} מתוך {qs.length} שאלות</p><button type="button" className="ln-btn go" onClick={() => { setDone(true); window.scrollTo(0, 0) }}>סיום ובדיקה ✓</button></div>
      : <div className="ln-box mt-6 text-center" role="status"><p className="text-3xl font-black">הציון: {Math.round((score / qs.length) * 100)} ({score} מתוך {qs.length})</p><p className="mt-1">ליד כל שאלה מופיע הסבר וקישור לשיעור.</p><button type="button" className="ln-btn go mt-3" onClick={fresh}>🎲 מבחן חדש</button></div>}
    <p className="mt-6 text-center"><Link to={path} className="font-bold underline">לשיעורים ולחוברת של כיתה {L} ←</Link></p>
    <div className="mt-12"><SeoBody paragraphs={[`מבחן לדוגמה ב${s.short} לכיתה ${L}, לחזרה לפני מבחן או בסוף השנה. השאלות נבחרות מכל נושאי הכיתה, ואחרי הבדיקה מופיע הסבר לכל שאלה עם קישור לשיעור המלא.`]} faq={faq} related={[{ label: name, href: path }, crumb(s)]} /></div>
  </Page>
}
function ExamSheet({ name, qs }) {
  return <>
    <article className="buga-flow ln-print sj-print" dir="rtl">
      <h2>מבחן {name}</h2>
      <div className="meta"><span>שם: __________________</span><span>תאריך: ____________</span><span>ציון: ____ / {qs.length}</span></div>
      <ol className="sj-print-qs">{qs.map(q => <li key={q.id}><p>{q.q}</p><ul>{q.options.map((o, j) => <li key={j}><b>{LETTERS[j]}.</b> {o}</li>)}</ul></li>)}</ol>
    </article>
    <article className="buga-flow ln-print sj-print" dir="rtl">
      <h2>תשובות — מבחן {name}</h2>
      <ol className="sj-print-key">{qs.map(q => <li key={q.id}><b>{LETTERS[q.answer]}</b> ({q.options[q.answer]}) — {q.exp}</li>)}</ol>
    </article>
  </>
}

// ── /learn/<subject>/concepts and /learn/<subject>/concepts/<term> ──
export function ConceptIndex({ subjectKey }) {
  const s = SUBJECT_BY_KEY[subjectKey]
  const concepts = useConcepts(subjectKey)
  if (!concepts) return <Page><Loading /></Page>
  if (!concepts.length) return <NotFound />
  const sorted = [...concepts].sort((a, b) => a.term.localeCompare(b.term, 'he'))
  return <Page>
    <SEO title={`מילון מושגים ב${s.short} — ${concepts.length} מושגים בהסבר פשוט`} description={`${concepts.length} מושגים ב${s.short} בשפה פשוטה: מה זה, דוגמאות, איך זוכרים ושאלות קצרות — עם קישור לשיעור המלא.`} path={`/learn/${s.key}/concepts`} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, crumb(s), { label: 'מילון מושגים' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">📘 </span>מילון מושגים ב{s.short}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">{concepts.length} מושגים · הגדרה, דוגמאות ושיעור מלא לכל מושג</p>
    <ul className="sj-grid">{sorted.map(c => <li key={c.slug}><Link to={`/learn/${s.key}/concepts/${c.slug}`} className="sj-card card-lift"><span><b>{c.term}</b><small>{c.short}</small></span></Link></li>)}</ul>
    <div className="mt-12"><SeoBody paragraphs={[`במילון הזה מוסברים המושגים החשובים ב${s.short}, כל אחד בעמוד משלו: הגדרה קצרה, הסבר, דוגמאות, טיפ לזכירה ושאלות קצרות לבדיקה. מכל מושג יש קישור לשיעור המלא שבו הוא נלמד.`]} related={[crumb(s), LEARN_CRUMB]} /></div>
  </Page>
}
export function ConceptPage({ subjectKey }) {
  const { term } = useParams()
  const s = SUBJECT_BY_KEY[subjectKey]
  const concepts = useConcepts(subjectKey), topics = useTopics(subjectKey)
  const c = concepts?.find(x => x.slug === term)
  const quiz = useMemo(() => c ? placeQuiz(`c-${c.slug}`, c.quiz) : [], [c])
  if (!concepts || !topics) return <Page><Loading /></Page>
  if (!c) return <NotFound />
  const lesson = topics.find(t => t.slug === c.lesson)
  const related = c.related.map(r => concepts.find(x => x.slug === r)).filter(Boolean)
  const faq = [{ q: `מה זה ${c.term}?`, a: c.short }]
  const term_ = { '@context': 'https://schema.org', '@type': 'DefinedTerm', name: c.term, description: c.short, inDefinedTermSet: `מילון מושגים ב${s.short} — עוגה בוגה`, inLanguage: 'he' }
  return <Page>
    <SEO title={c.seoTitle} description={c.seoDesc} path={`/learn/${s.key}/concepts/${c.slug}`} type="article" structuredData={[term_, faqSchema(faq)]} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, crumb(s), { label: 'מילון מושגים', href: `/learn/${s.key}/concepts` }, { label: c.term }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-4">{c.title || `מה זה ${c.term}?`}</h1>
    <p className="sj-intro">{c.short}</p>
    <article className="sj-article">{c.body.map((p, i) => <p key={i}>{p}</p>)}</article>
    <aside className="sj-facts" aria-labelledby="ex-h"><h2 id="ex-h">🔎 דוגמאות</h2><ul>{c.examples.map((e, i) => <li key={i}>{e}</li>)}</ul></aside>
    {c.remember && <p className="ln-box mt-4"><b>💡 איך זוכרים?</b> {c.remember}</p>}
    <h2 className="mt-8 mb-3 text-2xl font-black">✅ בודקים את עצמנו</h2>
    <Quiz key={c.slug} quiz={quiz} />
    {lesson && <Link to={`/learn/${s.key}/${lesson.slug}`} className="ln-box card-lift mt-6 block text-right"><b className="text-xl">{lesson.emoji} לשיעור המלא: {lesson.title}</b><br /><small>הסבר מלא, חידון של 8 שאלות ודף עבודה להדפסה</small></Link>}
    {related.length > 0 && <><h2 className="mt-8 mb-3 text-xl font-black">מושגים קשורים</h2><div className="flex flex-wrap gap-2">{related.map(r => <Link key={r.slug} to={`/learn/${s.key}/concepts/${r.slug}`} className="ln-chip">{r.term}</Link>)}</div></>}
    <p className="mt-6 text-center"><Link to={`/learn/${s.key}/concepts`} className="font-bold underline">לכל {concepts.length} המושגים ב{s.short} ←</Link></p>
  </Page>
}
