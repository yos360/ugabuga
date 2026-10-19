import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../../pages/NotFound'
import { SUBJECTS, SUBJECT_BY_KEY, placeQuiz } from './subjects'
import '../learn.css'
import './subjects.css'

// Each subject's lessons are a separate chunk, loaded only on that subject's pages.
const LOADERS = {
  tanakh: () => import('./data/tanakh.js'),
  lashon: () => import('./data/lashon.js'),
  civics: () => import('./data/civics.js'),
  science: () => import('./data/science.js'),
}
function useTopics(key) {
  const [topics, setTopics] = useState(null)
  useEffect(() => {
    let live = true
    LOADERS[key]?.().then(m => { if (live) setTopics(m.TOPICS) })
    return () => { live = false }
  }, [key])
  return topics
}

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
    {!topics ? <Loading /> : <>
      <p className="sj-count">{topics.length} שיעורים · בכל שיעור: הסבר, חידון עם תשובות, דף עבודה להדפסה ושאלות לשיחה</p>
      <ul className="sj-grid">{topics.map(t => <li key={t.slug}><Link to={`/learn/${s.key}/${t.slug}`} className="sj-card card-lift">
        <span className="sj-ico" aria-hidden="true">{t.emoji}</span>
        <span><b>{t.title}</b><small>{t.intro.length > 90 ? `${t.intro.slice(0, t.intro.lastIndexOf(' ', 88))}…` : t.intro}</small></span>
      </Link></li>)}</ul>
    </>}
    <h2 className="mt-10 mb-3 text-2xl font-black">עוד מקצועות</h2>
    <OtherSubjects not={s.key} />
    <div className="mt-12"><SeoBody paragraphs={s.paras} faq={s.faq} related={[LEARN_CRUMB, { label: 'הבנת הנקרא', href: '/learn/reading' }, { label: 'הכנה למבחן מחוננים', href: '/learn/gifted-test' }]} /></div>
  </Page>
}

function OtherSubjects({ not }) {
  return <div className="grid gap-3 sm:grid-cols-3">{SUBJECTS.filter(x => x.key !== not).map(x => <Link key={x.key} to={`/learn/${x.key}`} className="ln-box card-lift text-right"><b className="text-lg">{x.emoji} {x.title}</b><br /><small>{x.desc}</small></Link>)}</div>
}

export function SubjectTopic({ subjectKey }) {
  const { slug } = useParams()
  const s = SUBJECT_BY_KEY[subjectKey]
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
    {printing && <PrintPreview title={`${s.short}: ${t.title} — דף עבודה`} onClose={() => setPrinting(false)}><Worksheet s={s} t={t} quiz={quiz} /></PrintPreview>}
    <section className="ln-box mt-6" aria-labelledby="think-h"><h2 id="think-h" className="text-2xl font-black mb-2">💬 שאלות לשיחה</h2><ol className="sj-think">{t.think.map((q, i) => <li key={i}>{q}</li>)}</ol></section>
    <h2 className="mt-10 mb-3 text-2xl font-black">עוד שיעורים ב{s.short}</h2>
    <div className="grid gap-3 sm:grid-cols-2">{[...related, ...(related.includes(next) ? [] : [next])].map(x => <Link key={x.slug} to={`/learn/${s.key}/${x.slug}`} className="ln-box card-lift text-right"><b className="text-lg">{x.emoji} {x.title}</b></Link>)}</div>
    <p className="mt-4 text-center"><Link to={`/learn/${s.key}`} className="font-bold underline">לכל {topics.length} השיעורים ב{s.short} ←</Link></p>
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

