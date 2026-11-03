import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { EnglishNotFound } from '../EnglishLayout'
import { READING_STORIES, WORD_RE, wordCount } from '../../data/englishReading'
import { speak, speakAndWait, stopSpeaking } from '../../utils/speak'
import { READING_BANDS, READING_STORY_META, kindNoun, storyMetaBySlug } from './readingMeta'
import { ABC_ROOT } from './abcMeta'
import './reading.css'

const LETTERS = ['a', 'b', 'c', 'd']

function Paragraph({ text, active }) {
  const parts = text.split(new RegExp(`(${WORD_RE.source})`, 'g'))
  return <p className={`enr-p ${active ? 'is-reading' : ''}`}>{parts.map((x, i) => (i % 2 && /^[A-Za-z]/.test(x)
    ? <button key={i} type="button" className="enr-w" data-word={x}>{x}</button>
    : <Fragment key={i}>{x}</Fragment>))}</p>
}

function Quiz({ questions }) {
  const [picks, setPicks] = useState([])
  const answered = picks.filter(p => p !== undefined).length
  const score = questions.filter((q, i) => picks[i] === q.answer).length
  return <div>
    {questions.map((q, i) => {
      const p = picks[i], done = p !== undefined
      return <div key={i} className="enr-q">
        <p>{i + 1}. {q.q}</p>
        <div role="group" aria-label={`Answers to question ${i + 1}`} className="enr-opts">{q.options.map((o, j) => <button key={j} type="button" disabled={done} aria-pressed={p === j}
          onClick={() => setPicks(x => { const y = [...x]; y[i] = j; return y })}
          className={`enr-opt ${done && j === q.answer ? 'is-right' : ''} ${done && p === j && j !== q.answer ? 'is-wrong' : ''}`}><b>{LETTERS[j]}.</b> {o}</button>)}</div>
        {done && <p className="enr-fb" role="status">{p === q.answer ? '✔ Correct!' : `✘ Not quite. The right answer is ${LETTERS[q.answer]}. ${q.options[q.answer]}`}</p>}
      </div>
    })}
    {answered === questions.length && <div className="enr-box sun enr-center" role="status">
      <p className="enr-score">{score} out of {questions.length} {score === questions.length ? '🌟' : score >= questions.length * 0.7 ? '👏' : '💪'}</p>
      <p>{score === questions.length ? 'Perfect! Try the next text.' : 'Read the text once more, tap any word you did not understand, and try again.'}</p>
      <button type="button" className="enr-btn" onClick={() => setPicks([])}>🔁 Try again</button>
    </div>}
  </div>
}

function PrintSheet({ s, m, band }) {
  return <>
    <article className="buga-flow enr-print" dir="ltr" lang="en">
      <h2>{m.title}</h2>
      <div className="meta"><span>Name: __________________</span><span>Class: ______</span><span>Date: ____________</span></div>
      {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      <h3>Questions</h3>
      <ol className="qs">{s.questions.map((q, i) => <li key={i}><p>{q.q}</p><ul>{q.options.map((o, j) => <li key={j}><b>{LETTERS[j]}.</b> {o}</li>)}</ul></li>)}</ol>
      <p className="src">Ugabuga · Reading practice, {band.label} · ugabuga.co.il{m.path}</p>
    </article>
    <article className="buga-flow enr-print" dir="ltr" lang="en">
      <h2>Answer key: {m.title}</h2>
      <ol className="qs">{s.questions.map((q, i) => <li key={i}><b>{LETTERS[q.answer]}. {q.options[q.answer]}</b></li>)}</ol>
    </article>
  </>
}

export default function ReadingStory({ params }) {
  const m = storyMetaBySlug(params?.slug), s = m && READING_STORIES.find(x => x.slug === m.slug)
  return s ? <StoryPage key={m.slug} s={s} m={m} /> : <EnglishNotFound />
}

function StoryPage({ s, m }) {
  const band = READING_BANDS.find(b => b.id === m.band), words = wordCount(s)
  const [reading, setReading] = useState(-1)
  const [printing, setPrinting] = useState(false)
  const [said, setSaid] = useState('')
  const stopRef = useRef(false)
  useEffect(() => () => { stopRef.current = true; stopSpeaking() }, [])

  const onWord = e => {
    const el = e.target.closest('[data-word]')
    if (!el) return
    setSaid(el.dataset.word)
    void speak(el.dataset.word, 'en-US', { user: true })
  }
  const readAll = async () => {
    if (reading >= 0) { stopRef.current = true; stopSpeaking(); setReading(-1); return }
    stopRef.current = false
    for (let i = 0; i < s.paragraphs.length; i++) {
      if (stopRef.current) break
      setReading(i)
      const ok = await speakAndWait(s.paragraphs[i], 'en-US', { rate: 0.85 })
      if (!ok) break
    }
    setReading(-1)
  }

  const idx = READING_STORY_META.indexOf(m)
  const prev = READING_STORY_META[idx - 1], next = READING_STORY_META[idx + 1]
  const same = READING_STORY_META.filter(x => x.band === m.band && x !== m)
  const noun = kindNoun(m.kind)
  const faq = [
    { q: `What is "${m.title}" about?`, a: m.summary },
    { q: 'How do I hear a word?', a: 'Tap or click any word in the text and your device will say it. The listen button reads the whole text aloud, slowly.' },
    { q: 'Who is this text for?', a: `It is ${band.label.toLowerCase()} (${band.ages}): ${words} words and ${s.questions.length} comprehension questions with instant feedback.` },
  ]
  const resource = { '@context': 'https://schema.org', '@type': 'LearningResource', name: m.title, description: m.summary, inLanguage: 'en', educationalLevel: `${band.label}, ${band.ages}`, learningResourceType: 'Reading passage with comprehension questions', isAccessibleForFree: true }

  return <div className="enr-page">
    <SEO lang="en" path={m.path} type="article" counterpartPath={`/learn/english-reading/${m.slug}`}
      title={`${m.title} - ${noun} to read`} description={`${m.summary} ${words} words: tap any word to hear it, listen to the text, answer ${s.questions.length} questions and print it.`}
      structuredData={[resource, faqSchema(faq)]} />
    <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, { label: 'Reading', href: '/en/reading' }, { label: m.title }]} />
    <p className="enr-meta">{band.label} · {band.ages} · {m.genre} · {words} words</p>
    <h1><span aria-hidden="true">{m.emoji} </span>{m.title}</h1>
    <p className="enr-lead">{m.summary}</p>
    <div className="enr-tools">
      <button type="button" className="enr-chip" aria-pressed={reading >= 0} onClick={readAll}>{reading >= 0 ? '⏹ Stop listening' : '🔊 Listen to the whole text'}</button>
      <button type="button" className="enr-chip" onClick={() => setPrinting(true)}>🖨️ Print</button>
      <a href="#questions" className="enr-chip">❓ Questions</a>
    </div>
    <p className="enr-meta">👆 Tap any word to hear it</p>
    <div className="enr-box enr-text" lang="en" onClick={onWord}>
      {s.paragraphs.map((p, i) => <Paragraph key={i} text={p} active={reading === i} />)}
    </div>
    <p className="enr-meta" role="status" aria-live="polite">{said ? `🔊 ${said}` : ''}</p>

    <h2 id="questions" className="mt-8">❓ Check what you read</h2>
    <Quiz key={s.slug} questions={s.questions} />

    {printing && <PrintPreview lang="en" title={`${m.title} - reading practice`} onClose={() => setPrinting(false)}><PrintSheet s={s} m={m} band={band} /></PrintPreview>}

    {same.length > 0 && <>
      <h2 className="mt-10">More texts at {band.label}</h2>
      <ul className="enr-grid">{same.map(x => <li key={x.slug}><Link to={x.path} className="enr-card"><span className="ico" aria-hidden="true">{x.emoji}</span><span><b>{x.title}</b><small>{x.genre}</small></span></Link></li>)}</ul>
    </>}
    <nav className="enr-nav" aria-label="Previous and next text">
      {prev ? <Link to={prev.path} className="enr-chip">← {prev.title}</Link> : <span />}
      {next ? <Link to={next.path} className="enr-chip">{next.title} →</Link> : <span />}
    </nav>
    <p className="enr-center"><Link to="/en/reading" className="enr-chip">All {READING_STORY_META.length} reading texts</Link></p>
    <div className="mt-12"><SeoBody lang="en" faq={faq} related={[{ label: 'Reading practice', href: '/en/reading' }, { label: 'Learn the ABC', href: ABC_ROOT }, { label: 'First words with pictures', href: '/en/words' }]} /></div>
  </div>
}
