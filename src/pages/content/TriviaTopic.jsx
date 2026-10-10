import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import NotFound from '../NotFound'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { TRIVIA_TOPICS, TRIVIA_GROUPS } from '../../data/content/trivia'
import { TRIVIA_EXTRAS } from '../../data/content/triviaExtras'
import { shuffle } from '../../utils/shuffle'
import { nearby } from '../../utils/nearby'

// A fresh quiz on every visit: 12 random questions out of the topic's whole pool, in a new
// order, with the answers shuffled too — so playing again (or coming back tomorrow) never
// feels like the same quiz. The SEO schema and the printable answer sheet keep the full,
// stable pool.
const QUIZ_SIZE = 12
const deal = t => shuffle(t.questions).slice(0, QUIZ_SIZE).map(q => {
  const order = shuffle(q.options.map((_, i) => i))
  return { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) }
})

export function TriviaTopicsHub() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="טריוויה לפי נושא — חידונים עם תשובות לילדים ולמשפחה" description={`${TRIVIA_TOPICS.length} חידוני טריוויה עם תשובות והסברים: חיות, חלל, ישראל, חגים, ספורט, מוזיקה ועוד — לשחק באתר, בכיתה או בארוחה משפחתית.`} path="/trivia/topics" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'טריוויה', href: '/trivia/topics' }, { label: 'לפי נושא' }]} />
      <h1 className="text-4xl md:text-5xl text-center font-hand font-bold mb-2">🧠 טריוויה לפי נושא</h1>
      <p className="text-center text-lg text-[var(--muted-foreground)] mb-8">כל חידון: 12 שאלות עם תשובה והסבר קצר — ובכל כניסה השאלות מתערבבות מחדש.</p>
      <p className="text-center mb-8 -mt-4"><Link to="/trivia/with-answers" className="font-bold underline">📋 שאלות טריוויה עם תשובות — רשימה מלאה להדפסה ←</Link></p>
      {TRIVIA_GROUPS.map(g => (
        <section key={g.title} className="mb-10">
          <h2 className="text-2xl font-bold mb-4">{g.title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {g.items.map(t => (
              <Link key={t.slug} to={'/trivia/' + t.slug} className="block">
                <WobblyCard hover padding="p-4" className="h-full"><div className="text-3xl">{t.emoji}</div><h3 className="font-hand font-bold text-xl">{t.title}</h3><p className="text-sm text-[var(--muted-foreground)]">{t.audience}</p></WobblyCard>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default function TriviaTopic() {
  const { slug } = useParams()
  const t = TRIVIA_TOPICS.find(x => x.slug === slug)
  const [picked, setPicked] = useState({})
  const [dealt, setDealt] = useState(() => (t ? { slug, questions: deal(t) } : null))
  if (!t) return <NotFound />
  // Moving to another topic keeps the component mounted — deal that topic's own questions.
  if (!dealt || dealt.slug !== slug) { setDealt({ slug, questions: deal(t) }); setPicked({}); return null }
  const questions = dealt.questions
  const replay = () => { setPicked({}); setDealt({ slug, questions: deal(t) }) }
  const answered = Object.keys(picked).length
  const score = Object.entries(picked).filter(([i, v]) => questions[i].answer === v).length
  const schema = {
    '@context': 'https://schema.org', '@type': 'Quiz', name: t.title, about: t.title, educationalLevel: t.audience,
    hasPart: t.questions.map(q => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.options[q.answer] } })),
  }
  const others = nearby(TRIVIA_TOPICS, x => x.slug === slug, 8)
  const ex = TRIVIA_EXTRAS[slug]
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={t.title + ' — 12 שאלות עם תשובות'} description={t.description} path={'/trivia/' + slug} structuredData={ex?.faq ? [schema, faqSchema(ex.faq)] : schema} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'טריוויה לפי נושא', href: '/trivia/topics' }, { label: t.title }]} />
      <header className="text-center mb-6">
        <div className="text-6xl mb-2">{t.emoji}</div>
        <h1 className="text-4xl md:text-5xl font-hand font-bold mb-2">{t.title}</h1>
        <p className="text-lg">{t.intro}</p>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">מתאים ל: {t.audience} · לחצו על תשובה כדי לבדוק</p>
      </header>
      {ex?.lead && <p className="mb-6 text-lg leading-relaxed text-[var(--foreground)]/85">{ex.lead}</p>}
      <ol className="space-y-4">
        {questions.map((q, i) => {
          const p = picked[i]
          return (
            <li key={i}>
              <WobblyCard hover={false} padding="p-5">
                <h2 className="text-xl font-bold mb-3">{i + 1}. {q.q}</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {q.options.map((o, j) => {
                    const state = p === undefined ? '' : j === q.answer ? 'bg-green-100 border-green-600' : j === p ? 'bg-red-100 border-red-500' : 'opacity-60'
                    return <button key={j} aria-disabled={p !== undefined} aria-pressed={p === j} onClick={() => { if (p === undefined) setPicked(s => ({ ...s, [i]: j })) }} className={`text-right wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold ${state}`}>{o}</button>
                  })}
                </div>
                {p !== undefined && <p className="mt-3" role="status">{p === q.answer ? '✅ נכון! ' : '❌ לא הפעם. '}{q.explain}</p>}
              </WobblyCard>
            </li>
          )
        })}
      </ol>
      {answered > 0 && <p className="text-center text-2xl font-bold my-6" aria-live="polite">עניתם על {answered} מתוך {questions.length} · {score} נכונות{answered === questions.length ? (score >= questions.length * 0.8 ? ' 🏆 מדהים!' : score >= questions.length * 0.55 ? ' 👏 יפה מאוד!' : ' 💪 נסו שוב!') : ''}</p>}
      {answered === questions.length && <div className="text-center mb-6"><button onClick={replay} className="btn-secondary">🔄 עוד סיבוב — שאלות חדשות</button></div>}
      <details className="mt-8 wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4">
        <summary className="font-bold cursor-pointer">📋 דף תשובות למנחה</summary>
        <ol className="list-decimal pr-6 mt-3 space-y-1">{t.questions.map((q, i) => <li key={i}>{q.q} <b>— {q.options[q.answer]}</b></li>)}</ol>
      </details>
      {ex?.host && <section className="mt-10"><h2 className="text-2xl font-bold mb-3">{ex.host.title}</h2>
        <div className="grid gap-3 sm:grid-cols-2">{ex.host.items.map(it => <div key={it.t} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4"><h3 className="text-lg font-bold mb-1">{it.t}</h3><p className="text-[var(--foreground)]/80">{it.d}</p></div>)}</div>
      </section>}
      {ex?.facts && <section className="mt-10 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5"><h2 className="text-2xl font-bold mb-3">{ex.facts.title}</h2>
        <ul className="list-disc pr-5 space-y-2">{ex.facts.items.map(f => <li key={f}>{f}</li>)}</ul>
      </section>}
      {ex && <div className="mt-10"><SeoBody faq={ex.faq} related={ex.related} /></div>}
      <section className="mt-10">
        <h2 className="text-2xl font-hand font-bold mb-3">עוד חידונים</h2>
        <div className="flex flex-wrap gap-2">{others.map(o => <Link key={o.slug} to={'/trivia/' + o.slug} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{o.emoji} {o.title}</Link>)}<Link to="/trivia/topics" className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-3 py-2 font-bold">כל הנושאים ←</Link></div>
      </section>
    </div>
  )
}
