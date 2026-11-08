import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { faqSchema } from '../../components/ui/SeoBody'
import { EnglishNotFound } from '../EnglishLayout'
import { EN_TRIVIA, EN_RIDDLES, EN_JOKES, FUN_HUBS } from './catalog.js'

// English trivia, riddles and jokes: a hub and one page per topic for each.
const KINDS = {
  trivia: { list: EN_TRIVIA, label: 'Trivia', more: 'More trivia quizzes', count: x => `${x.questions.length} questions` },
  riddles: { list: EN_RIDDLES, label: 'Riddles', more: 'More riddles', count: x => `${x.riddles.length} riddles` },
  jokes: { list: EN_JOKES, label: 'Jokes', more: 'More jokes', count: x => `${x.jokes.length} jokes` },
}
const wrap = { maxWidth: 900, margin: '0 auto', padding: '16px' }
const card = { display: 'block', background: '#fff', borderRadius: 18, padding: '14px 16px', boxShadow: '0 2px 10px rgba(0,0,0,.08)', color: '#1f2937', textDecoration: 'none' }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }
const btn = { border: 0, borderRadius: 14, padding: '10px 16px', fontWeight: 800, fontSize: 16, cursor: 'pointer', background: '#ffd23f', color: '#1f2937' }

function Crumbs({ kind, title }) {
  const h = FUN_HUBS[kind]
  return <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, ...(title ? [{ label: KINDS[kind].label, href: h.path }, { label: title }] : [{ label: KINDS[kind].label }])]} />
}

function TopicGrid({ kind, skip }) {
  const k = KINDS[kind]
  return (
    <div style={grid}>
      {k.list.filter(x => x.slug !== skip).map(x => (
        <Link key={x.slug} to={`/en/${kind}/${x.slug}`} style={card}>
          <span style={{ fontSize: 34 }} aria-hidden="true">{x.emoji}</span>
          <strong style={{ display: 'block', fontSize: 17, margin: '4px 0' }}>{x.title}</strong>
          <small style={{ color: '#6b7280' }}>{k.count(x)}</small>
        </Link>
      ))}
    </div>
  )
}

export function EnglishFunHub({ kind = 'trivia' }) {
  const h = FUN_HUBS[kind], k = KINDS[kind]
  const schema = { '@context': 'https://schema.org', '@type': 'ItemList', name: h.title, itemListElement: k.list.map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://ugabuga.co.il/en/${kind}/${x.slug}`, name: x.title })) }
  const others = Object.entries(FUN_HUBS).filter(([key]) => key !== kind)
  return (
    <div dir="ltr" style={wrap}>
      <SEO lang="en" title={h.title} description={h.description} path={h.path} counterpartPath={h.counterpart} structuredData={schema} />
      <Crumbs kind={kind} />
      <header style={{ textAlign: 'center', margin: '10px 0 22px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 8px' }}>{h.emoji} {h.title}</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, margin: 0 }}>{h.intro}</p>
      </header>
      <TopicGrid kind={kind} />
      <p style={{ textAlign: 'center', marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        {others.map(([key, o]) => <Link key={key} to={o.path} className="underline font-bold">{o.emoji} {KINDS[key].label} for kids</Link>)}
        <Link to="/en/online-games" className="underline font-bold">🕹️ Online games</Link>
      </p>
    </div>
  )
}

function Quiz({ quiz }) {
  const [at, setAt] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const qs = quiz.questions
  if (at >= qs.length) {
    return (
      <div style={{ ...card, textAlign: 'center' }} aria-live="polite">
        <p style={{ fontSize: 26, fontWeight: 900, margin: '6px 0' }}>{score === qs.length ? '🏆' : score >= qs.length / 2 ? '🎉' : '💪'} You scored {score} out of {qs.length}</p>
        <p>{score === qs.length ? 'A perfect score!' : score >= qs.length / 2 ? 'Great job! Want to beat your score?' : 'Every quiz makes you smarter. Try again!'}</p>
        <button type="button" style={btn} onClick={() => { setAt(0); setPicked(null); setScore(0) }}>🔄 Play again</button>
      </div>
    )
  }
  const q = qs[at]
  const choose = i => { if (picked != null) return; setPicked(i); if (i === q.answer) setScore(s => s + 1) }
  return (
    <div style={card}>
      <p style={{ color: '#6b7280', margin: 0 }}>Question {at + 1} of {qs.length} · Score {score}</p>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 14px' }}>{q.q}</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {q.options.map((o, i) => {
          const bg = picked == null ? '#f3f4f6' : i === q.answer ? '#bbf7d0' : i === picked ? '#fecaca' : '#f3f4f6'
          return <button key={o} type="button" onClick={() => choose(i)} disabled={picked != null} style={{ ...btn, background: bg, textAlign: 'left', fontWeight: 700 }}>{o}{picked != null && i === q.answer ? ' ✓' : ''}</button>
        })}
      </div>
      {picked != null && (
        <div aria-live="polite" style={{ marginTop: 14 }}>
          <p style={{ fontWeight: 800, margin: '0 0 4px' }}>{picked === q.answer ? '✅ Correct!' : `❌ The answer is: ${q.options[q.answer]}`}</p>
          <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>{q.explain}</p>
          <button type="button" style={btn} onClick={() => { setAt(a => a + 1); setPicked(null) }}>{at + 1 < qs.length ? 'Next question ▶' : 'See my score 🏁'}</button>
        </div>
      )}
    </div>
  )
}

function Reveal({ q, a, hint, label = 'Show the answer' }) {
  const [open, setOpen] = useState(0)
  return (
    <li style={{ ...card, listStyle: 'none' }}>
      <p style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', lineHeight: 1.5 }}>{q}</p>
      {open >= 1 && hint && <p style={{ margin: '0 0 8px', color: '#92400e' }}>💡 {hint}</p>}
      {open >= 2 && <p style={{ margin: '0 0 8px', fontWeight: 800, color: '#166534', whiteSpace: 'pre-line' }}>{a}</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {hint && open < 1 && <button type="button" style={{ ...btn, background: '#fde68a' }} onClick={() => setOpen(1)}>💡 Hint</button>}
        {open < 2 && <button type="button" style={btn} onClick={() => setOpen(2)}>{label}</button>}
      </div>
    </li>
  )
}

export function EnglishFunPage({ kind = 'trivia', params }) {
  const k = KINDS[kind]
  const x = k.list.find(p => p.slug === params?.slug)
  if (!x) return <EnglishNotFound />
  const path = `/en/${kind}/${x.slug}`
  const faq = kind === 'trivia' ? x.questions.slice(0, 5).map(q => ({ q: q.q, a: `${q.options[q.answer]}. ${q.explain}` }))
    : kind === 'riddles' ? x.riddles.slice(0, 5).map(r => ({ q: r.q, a: r.a }))
      : x.jokes.slice(0, 5).map(j => ({ q: j.setup, a: j.punchline }))
  return (
    <div dir="ltr" style={wrap}>
      <SEO lang="en" title={x.title} description={x.description} path={path} counterpartPath={x.counterpart} structuredData={faqSchema(faq)} />
      <Crumbs kind={kind} title={x.title} />
      <header style={{ textAlign: 'center', margin: '10px 0 22px' }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, margin: '0 0 8px' }}>{x.emoji} {x.title}</h1>
        {x.audience && <p style={{ margin: '0 0 6px', color: '#6b7280', fontWeight: 700 }}>{x.audience} · {k.count(x)}</p>}
        <p style={{ fontSize: 18, lineHeight: 1.6, margin: 0 }}>{x.intro}</p>
      </header>
      {kind === 'trivia' && (
        <>
          <Quiz key={x.slug} quiz={x} />
          <details style={{ ...card, marginTop: 18 }}>
            <summary style={{ fontWeight: 800, cursor: 'pointer' }}>📋 All questions with answers (for teachers and parents)</summary>
            <ol style={{ paddingLeft: 22, lineHeight: 1.7 }}>
              {x.questions.map(q => <li key={q.q} style={{ marginTop: 8 }}><strong>{q.q}</strong><br />Answer: {q.options[q.answer]}. {q.explain}</li>)}
            </ol>
          </details>
        </>
      )}
      {kind === 'riddles' && <ol style={{ display: 'grid', gap: 12, padding: 0 }}>{x.riddles.map(r => <Reveal key={r.q} q={r.q} a={r.a} hint={r.hint} />)}</ol>}
      {kind === 'jokes' && <ol style={{ display: 'grid', gap: 12, padding: 0 }}>{x.jokes.map(j => <Reveal key={j.setup} q={j.setup} a={j.punchline} label="😂 Punchline" />)}</ol>}
      <h2 style={{ fontSize: 24, fontWeight: 900, textAlign: 'center', margin: '32px 0 14px' }}>{k.more}</h2>
      <TopicGrid kind={kind} skip={x.slug} />
      <p style={{ textAlign: 'center', marginTop: 20 }}><Link to={FUN_HUBS[kind].path} className="underline font-bold">All {k.label.toLowerCase()} →</Link></p>
    </div>
  )
}
