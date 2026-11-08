import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { EnglishNotFound } from '../EnglishLayout'
import { UNSEEN_AUDIO } from '../../data/unseen/audio.js'
import { audioUrl } from '../../utils/audioUrl.js'
import { UNSEEN_VIDEOS } from '../../data/unseen/videos.js'
import { RC_ROOT, RC_LEVELS, RC_SKILLS, rcLevel, rcLevelHref, rcHref } from './levels.js'
import { RC_META } from './meta.js'
import '../../learn/learn.css'
import '../../pages/unseen/unseen.css'
import '../reading/reading.css'
import './comprehension.css'

// The English site's reading comprehension section: the same original passages as the Hebrew site's
// English "unseen" tests (src/data/unseen), with the Hebrew explanations, glossary and labels replaced
// by the English overlays in ./i18n.
const testFiles = import.meta.glob('../../data/unseen/tests-en-*.js')
const overlayFiles = import.meta.glob('./i18n/tests-en-*.js')
async function loadTest(meta) {
  const [src, en] = await Promise.all([testFiles[`../../data/unseen/${meta.file}`]?.(), overlayFiles[`./i18n/${meta.file}`]?.()])
  const t = src?.TESTS.find(x => x.slug === meta.slug), o = en?.EN[meta.slug]
  if (!t || !o) return null
  return {
    ...t, genre: o.genre, summary: o.summary, glossary: o.glossary || [],
    writing: t.writing && { ...t.writing, ...(o.writing || {}) },
    texts: t.texts.map((x, i) => ({ ...x, ...(o.texts?.[i] || {}) })),
    questions: t.questions.map((q, i) => ({ ...q, ...(o.questions?.[i] || {}) })),
  }
}

const HOME = { label: 'Home', href: '/en' }
const HUB = { label: 'Reading comprehension', href: RC_ROOT }
const testsOf = level => RC_META.filter(t => t.level === level)

// ── progress (this device only) ──
const KEY = 'buga-rc-en'
const readProgress = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
function saveResult(slug, score, total, bySkill) {
  try {
    const p = readProgress(), skills = p.skills || {}
    for (const [s, [r, t]] of Object.entries(bySkill)) { const cur = skills[s] || [0, 0]; skills[s] = [cur[0] + r, cur[1] + t] }
    localStorage.setItem(KEY, JSON.stringify({ ...p, skills, done: { ...(p.done || {}), [slug]: [score, total] } }))
  } catch { /* private mode */ }
}
function useProgress() {
  const [p, setP] = useState({})
  useEffect(() => { setP(readProgress()) }, [])
  return p
}

function SkillSummary() {
  const p = useProgress()
  const rows = Object.entries(p.skills || {}).filter(([s, [, t]]) => RC_SKILLS[s] && t > 0)
  if (!rows.length) return null
  return <section className="ln-box mb-8" aria-label="My progress">
    <h2 className="mb-2 text-2xl font-black">📊 My progress</h2>
    <p className="mb-3 text-sm text-[var(--muted-foreground)]">{Object.keys(p.done || {}).length} passages finished on this device. How you did on each question type:</p>
    <ul className="us-skills">{rows.sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]).map(([s, [r, t]]) => { const pct = Math.round((r / t) * 100)
      return <li key={s}><span>{RC_SKILLS[s]}</span><span className="us-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></span><b>{pct}%</b></li> })}</ul>
  </section>
}

function TestCard({ t }) {
  const p = useProgress(), done = p.done?.[t.slug]
  return <Link to={rcHref(t)} className="ln-box card-lift us-card">
    <span className="us-card-meta">{t.genre} · {t.words} words · {t.questions} questions</span>
    <b className="us-card-title">{t.title}</b>
    <span className="us-card-sum">{t.summary}</span>
    {done && <span className="us-done">✓ {done[0]}/{done[1]}</span>}
  </Link>
}
function LevelCards() {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{RC_LEVELS.map(L => <Link key={L.id} to={rcLevelHref(L)} className="ln-box card-lift us-level">
    <b>{L.name} <small>({L.cefr})</small></b><span>{L.words[0]}–{L.words[1]} words · {testsOf(L.id).length} passages</span></Link>)}</div>
}
function RandomTest() {
  const [pick, setPick] = useState(null)
  useEffect(() => { const done = readProgress().done || {}, fresh = RC_META.filter(t => !done[t.slug]); const list = fresh.length ? fresh : RC_META; setPick(list[Math.floor(Math.random() * list.length)] || null) }, [])
  if (!pick) return null
  return <p className="mb-6 text-center"><Link to={rcHref(pick)} className="ln-btn go inline-block">🎲 Start a random passage</Link></p>
}

const HUB_FAQ = [
  { q: 'What is a reading comprehension passage?', a: 'A short text you have not read before, followed by questions that check how well you understood it: finding details, working out what the writer means, the meaning of a word from its context and the purpose of a paragraph. In Israel this kind of test is called an "unseen".' },
  { q: 'Are these official exam papers?', a: 'No. Every text and question was written for this site, in the length, vocabulary and question types of each level. Past official papers are worth practicing too.' },
  { q: 'Which level should I start with?', a: 'Start with your grade, or with the Bagrut module you are preparing for. If the text feels too long or hard, go down one level; if every answer was easy, go up one.' },
  { q: 'What is the difference between practice mode and exam mode?', a: 'In practice mode you see straight away whether each answer is right, with an explanation and the sentence in the text that proves it. In exam mode there is a timer, answers are checked only at the end, and you get a score.' },
  { q: 'Can I print the passages?', a: 'Yes. Every passage has a print button, with or without an answer key, so it can be done on paper or handed out in class.' },
  { q: 'Is it free?', a: 'Yes, all the passages are free, with no sign-up.' },
]
const TIPS = [
  ['Read the questions first', 'A quick look at the questions tells you what to look for while you read.'],
  ['Read the whole text once', 'Keep going even when you meet a new word. The rest of the sentence often explains it.'],
  ['Find the proof', 'Every right answer is supported by a sentence in the text. If you cannot find one, it is probably not the answer.'],
  ['Watch out for distractors', 'Wrong options often reuse words from the text but say something different. Check the meaning, not just the words.'],
  ['Copy exactly', 'When a question says "Copy the words", copy only the words that answer it, without adding or changing anything.'],
  ['Manage your time', 'Do not get stuck on one question. Mark it, move on and come back at the end.'],
]

// ── /en/reading-comprehension ──
function Hub() {
  return <div className="enr-page rc-page">
    <SEO lang="en" path={RC_ROOT} counterpartPath="/unseen/english" title="Free reading comprehension passages with questions and answers"
      description={`${RC_META.length} original reading comprehension passages from Grade 3 to Bagrut Module G: multiple-choice and open questions, an explanation for every answer, read-aloud, an exam timer and printable worksheets. Free.`}
      structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs lang="en" items={[HOME, { label: HUB.label }]} />
    <h1><span aria-hidden="true">📝 </span>Reading comprehension passages</h1>
    <p className="enr-lead">{RC_META.length} original texts with questions and answers, from Grade 3 to Bagrut Module G. Every answer is explained and shown in the text.</p>
    <RandomTest />
    <SkillSummary />
    <h2 className="mb-3 mt-6 text-3xl font-black">Choose a level</h2>
    <LevelCards />
    {RC_LEVELS.map(L => <section key={L.id} className="mt-8">
      <h2 className="mb-1 text-2xl font-black"><Link to={rcLevelHref(L)} className="underline">{L.name} <small>({L.cefr})</small></Link></h2>
      <p className="mb-3 text-[var(--muted-foreground)]">{L.about}</p>
      <div className="grid gap-3 sm:grid-cols-2">{testsOf(L.id).slice(0, 4).map(t => <TestCard key={t.slug} t={t} />)}</div>
      {testsOf(L.id).length > 4 && <p className="mt-2"><Link to={rcLevelHref(L)} className="font-bold underline">All {testsOf(L.id).length} {L.name} passages →</Link></p>}
    </section>)}
    <h2 className="mb-3 mt-10 text-3xl font-black">How it works</h2>
    <div className="space-y-4 text-lg leading-relaxed">
      <p>Each passage comes with the kinds of questions found in school tests and exams: Circle the correct answer, Complete the sentence, Copy the words that show, Give TWO reasons, What does the word refer to, and What is the purpose of the paragraph.</p>
      <p>In practice mode every answer is checked at once, with a short explanation and a "show me in the text" button that highlights the sentence with the answer. In exam mode a timer runs and the score comes at the end. Tap any word to hear it, and words in the glossary show a simple definition.</p>
      <p>Many passages can also be heard read aloud by a narrator, and some have a video on YouTube. The site remembers which passages you finished on this device and how you did on each type of question, so you know what to work on.</p>
    </div>
    <h2 className="mb-3 mt-10 text-3xl font-black">6 tips for reading comprehension</h2>
    <ol className="us-tips">{TIPS.map(([h, t]) => <li key={h}><b>{h}.</b> {t}</li>)}</ol>
    <h2 className="mb-3 mt-10 text-3xl font-black">The levels at a glance</h2>
    <div className="overflow-x-auto"><table className="us-table"><thead><tr><th>Level</th><th>Text length</th><th>Questions</th><th>Suggested time</th></tr></thead>
      <tbody>{RC_LEVELS.map(L => <tr key={L.id}><td><Link to={rcLevelHref(L)} className="underline">{L.name} ({L.cefr})</Link></td><td>{L.words[0]}–{L.words[1]} words{L.texts ? ` (${L.texts} texts)` : ''}</td><td>{L.questions[0]}–{L.questions[1]}</td><td>{L.minutes} min</td></tr>)}</tbody></table></div>
    <div className="mt-10"><SeoBody lang="en" faq={HUB_FAQ} related={[{ href: '/en/reading', label: 'Reading practice for kids' }, { href: '/en/worksheets', label: 'Printable worksheets' }, { href: '/en/words', label: 'First English words' }]} /></div>
  </div>
}

// ── /en/reading-comprehension/<level> ──
function LevelPage({ L }) {
  const list = testsOf(L.id)
  const faq = [
    { q: `How long is a ${L.name} passage?`, a: `${L.words[0]}–${L.words[1]} words${L.texts ? ` across ${L.texts} texts` : ''}, with ${L.questions[0]}–${L.questions[1]} questions. The suggested time in exam mode is ${L.minutes} minutes.` },
    { q: `What is the ${L.name} level like?`, a: L.about },
  ]
  return <div className="enr-page rc-page">
    <SEO lang="en" path={rcLevelHref(L)} counterpartPath={`/unseen/english/${L.path}`} title={`${L.name} reading comprehension passages with questions and answers`}
      description={`${list.length} free ${L.name} reading comprehension passages (${L.cefr}). ${L.about} Answers explained, exam timer and printable worksheets.`} structuredData={faqSchema(faq)} />
    <Breadcrumbs lang="en" items={[HOME, HUB, { label: L.name }]} />
    <h1><span aria-hidden="true">📝 </span>{L.name} reading comprehension</h1>
    <p className="enr-lead">{L.about}</p>
    <div className="us-facts"><span>📏 {L.words[0]}–{L.words[1]} words</span><span>❓ {L.questions[0]}–{L.questions[1]} questions</span><span>⏱️ about {L.minutes} minutes</span><span>🎯 {L.cefr}</span>{L.texts && <span>📚 {L.texts} texts</span>}</div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">{list.map(t => <TestCard key={t.slug} t={t} />)}</div>
    <h2 className="mb-3 mt-10 text-2xl font-black">Other levels</h2>
    <LevelCards />
    <div className="mt-8"><SeoBody lang="en" faq={faq} related={[{ href: RC_ROOT, label: 'All reading comprehension passages' }, { href: '/en/reading', label: 'Reading practice for kids' }]} /></div>
  </div>
}

// ── one passage ──
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
function Para({ text, mark, gloss }) {
  const parts = mark && text.includes(mark) ? (i => [[text.slice(0, i)], [mark, true], [text.slice(i + mark.length)]])(text.indexOf(mark)) : [[text]]
  const glossSet = new Set(gloss.map(([w]) => w.toLowerCase()))
  const words = s => s.split(/([A-Za-z]+(?:['’][A-Za-z]+)?)/).map((x, i) => i % 2
    ? glossSet.has(x.toLowerCase()) ? <button key={i} type="button" className="us-gl" data-word={x}>{x}</button> : <span key={i} className="us-w" data-word={x}>{x}</span>
    : x)
  return parts.map(([s, isMark], i) => isMark ? <mark key={i} className="us-mark" id="us-mark">{words(s)}</mark> : <Fragment key={i}>{words(s)}</Fragment>)
}
function TableText({ table }) {
  return <div className="overflow-x-auto"><table className="us-table"><caption>{table.caption}</caption><thead><tr>{table.head.map(h => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>
}
const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const rightOf = (q, pick) => (q.type === 'mc' ? pick === q.answer : pick === true)
// A word's sentence, for a future "meaning in this sentence"; kept with the glossary lookup below.
export const sentenceWith = (para, word) => (para.match(/[^.!?]+[.!?]*/g) || [para]).find(s => new RegExp(`\\b${esc(word)}\\b`, 'i').test(s))?.trim() || ''

function Passage({ t, L }) {
  const [mode, setMode] = useState('practice')
  const [picks, setPicks] = useState({})
  const [revealed, setRevealed] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [mark, setMark] = useState(null)
  const [gloss, setGloss] = useState(null)
  const [minutes, setMinutes] = useState(L.minutes)
  const [left, setLeft] = useState(L.minutes * 60)
  const [printing, setPrinting] = useState(false)
  const [withAnswers, setWithAnswers] = useState(true)
  const [essay, setEssay] = useState('')
  const saved = useRef(false)
  const exam = mode === 'exam'
  const qs = t.questions, glossary = t.glossary
  const showResult = i => (exam ? submitted : picks[i] !== undefined)
  useEffect(() => {
    if (!exam || submitted || !minutes) return
    const id = setInterval(() => setLeft(s => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [exam, submitted, minutes])
  useEffect(() => {
    if (!gloss) return
    const opened = Date.now(), y = window.scrollY
    const close = () => { if (Date.now() - opened > 400 && Math.abs(window.scrollY - y) > 40) setGloss(null) }
    window.addEventListener('scroll', close, { passive: true })
    return () => window.removeEventListener('scroll', close)
  }, [gloss])
  const answered = qs.filter((q, i) => picks[i] !== undefined).length
  const right = qs.filter((q, i) => rightOf(q, picks[i])).length
  const finished = exam ? submitted : answered === qs.length
  useEffect(() => {
    if (!finished || saved.current) return
    saved.current = true
    const by = {}
    qs.forEach((q, i) => { const b = (by[q.skill] ||= [0, 0]); b[1]++; if (rightOf(q, picks[i])) b[0]++ })
    saveResult(t.slug, right, qs.length, by)
  }, [finished]) // eslint-disable-line react-hooks/exhaustive-deps
  const reset = (m, mins = minutes) => { setMode(m); setPicks({}); setRevealed({}); setSubmitted(false); setMark(null); setMinutes(mins); setLeft(mins * 60); saved.current = false }
  const TIME_CHOICES = [...new Set([10, 15, 20, 30, 45, 60, 75, 90, L.minutes])].sort((a, b) => a - b)
  const show = ev => { setMark(ev); requestAnimationFrame(() => document.getElementById('us-mark')?.scrollIntoView({ behavior: 'smooth', block: 'center' })) }
  // Tapping a word says it; a glossary word also shows its definition.
  const onWord = e => {
    const el = e.target.closest('[data-word]')
    if (!el) { setGloss(null); return }
    const word = el.dataset.word, r = el.getBoundingClientRect()
    const g = glossary.find(([w]) => w.toLowerCase() === word.toLowerCase())
    setGloss({ w: word, x: r.left + r.width / 2, y: r.bottom, def: g?.[1] || '' })
    void import('../../utils/wordMeaning').then(m => m.pronounce(word, 'en'))
  }
  const essayWords = essay.trim() ? essay.trim().split(/\s+/).length : 0

  return <>
    <div className="us-modes" role="group" aria-label="Mode">
      <button type="button" className="ln-chip" aria-pressed={!exam} onClick={() => reset('practice')}>✏️ Practice: instant feedback</button>
      <button type="button" className="ln-chip" aria-pressed={exam} onClick={() => reset('exam')}>⏱️ Exam</button>
      <button type="button" className="ln-chip" onClick={() => setPrinting(true)}>🖨️ Print</button>
    </div>
    {exam && !submitted && <div className="mb-2 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Exam time">
      <span className="font-bold">How long?</span>
      {TIME_CHOICES.map(n => <button key={n} type="button" className="ln-chip !min-h-[36px]" aria-pressed={minutes === n} onClick={() => reset('exam', n)}>{n} min{n === L.minutes ? ' (suggested)' : ''}</button>)}
      <button type="button" className="ln-chip !min-h-[36px]" aria-pressed={minutes === 0} onClick={() => reset('exam', 0)}>No limit</button>
    </div>}
    {exam && !submitted && minutes > 0 && <p className={`us-timer ${left === 0 ? 'is-over' : ''}`} role="timer" aria-live="off">⏱️ {fmt(left)}{left === 0 ? ' - time is up, you can finish and submit' : ''}</p>}
    <p className="mb-2 text-center text-sm text-[var(--muted-foreground)]">Tap any word to hear it · dotted words have a definition in the glossary</p>

    <div className="us-passage" onClick={onWord}>
      {t.texts.map((x, ti) => <section key={ti} className="ln-box us-text" lang="en">
        {t.texts.length > 1 && <p className="us-text-label">Text {ti + 1}</p>}
        {!exam && UNSEEN_AUDIO[t.slug]?.[ti] && <p className="us-listen no-print"><span>🎧 Listen</span><audio controls preload="none" src={audioUrl(`/audio/unseen/${UNSEEN_AUDIO[t.slug][ti]}.mp3`)} aria-label={`Listen to ${t.title}`} /></p>}
        {!exam && UNSEEN_VIDEOS[t.slug]?.[ti] && <p className="us-listen no-print"><a href={`https://www.youtube.com/watch?v=${UNSEEN_VIDEOS[t.slug][ti]}`} target="_blank" rel="noopener noreferrer" className="font-bold underline">▶️ Watch the narrated video on YouTube</a></p>}
        {x.title && <h2 className="us-text-title">{x.title}</h2>}
        {(x.paragraphs || []).map((p, pi) => <p key={pi} className="us-p"><span className="us-pn" aria-label={`Paragraph ${pi + 1}`}>{pi + 1}</span><Para text={p} mark={mark} gloss={glossary} /></p>)}
        {x.table && <TableText table={x.table} />}
      </section>)}
      {gloss && <span className="us-pop" role="status" style={{ left: Math.min(Math.max(gloss.x, 120), window.innerWidth - 120), top: gloss.y + 6 }}>
        <button type="button" className="us-pop-say" onClick={e => { e.stopPropagation(); void import('../../utils/wordMeaning').then(m => m.pronounce(gloss.w, 'en')) }} aria-label={`Say ${gloss.w}`}>🔊</button>
        <b>{gloss.w}</b>{gloss.def ? <> = {gloss.def}</> : null}</span>}
    </div>

    {glossary.length > 0 && <details className="ln-box mt-4"><summary className="cursor-pointer font-bold">📘 Glossary</summary>
      <ul className="us-glossary">{glossary.map(([w, h]) => <li key={w}><b>{w}</b> - {h}</li>)}</ul></details>}

    <h2 className="mb-3 mt-8 text-2xl font-black">Questions</h2>
    <ol className="space-y-3">{qs.map((q, i) => {
      const done = showResult(i), ok = rightOf(q, picks[i])
      return <li key={i} className="ln-q us-q">
        <p className="us-q-head"><span className="us-skill">{RC_SKILLS[q.skill]}{t.texts.length > 1 && q.text != null ? ` · Text ${q.text + 1}` : ''}</span></p>
        <b className="block">{i + 1}. {q.q}</b>
        {q.type === 'mc'
          ? <div>{q.options.map((o, j) => <button key={j} type="button" aria-pressed={picks[i] === j} disabled={done}
              onClick={() => setPicks(p => ({ ...p, [i]: j }))}
              className={`ln-opt us-ltr ${done && j === q.answer ? 'is-right' : ''} ${done && picks[i] === j && j !== q.answer ? 'is-wrong' : ''}`}>{'abcd'[j]}. {o}</button>)}</div>
          : <><textarea className="ln-ta mt-2" aria-label={`Answer to question ${i + 1}`} placeholder="Write your answer here" disabled={exam && submitted} />
            {(!exam || submitted) && (revealed[i]
              ? <div className="us-model"><p><b>Sample answer:</b> {q.answer}</p>
                  {picks[i] === undefined && <p className="mt-2 flex flex-wrap gap-2"><span>Did you get it right?</span><button type="button" className="ln-chip" onClick={() => setPicks(p => ({ ...p, [i]: true }))}>✓ Yes</button><button type="button" className="ln-chip" onClick={() => setPicks(p => ({ ...p, [i]: false }))}>✗ No</button></p>}</div>
              : <button type="button" className="ln-chip mt-2" onClick={() => setRevealed(r => ({ ...r, [i]: true }))}>💡 Sample answer</button>)}</>}
        {done && (q.type === 'mc' || picks[i] !== undefined) && <div className={`us-explain ${ok ? 'is-ok' : 'is-bad'}`}>
          <p><b>{ok ? '✓ Correct!' : '✗ Not quite.'}</b> {q.explain}</p>
          {q.evidence && <button type="button" className="ln-chip mt-2" onClick={() => show(q.evidence)}>📍 Show me in the text</button>}
        </div>}
      </li>
    })}</ol>

    {t.writing && <section className="ln-box mt-6"><h2 className="mb-2 text-xl font-black">✍️ Writing task</h2>
      <p>{t.writing.prompt}</p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t.writing.words[0]}–{t.writing.words[1]} words</p>
      <textarea className="ln-ta mt-2 min-h-[180px]" value={essay} onChange={e => setEssay(e.target.value)} aria-label="Writing task" />
      <p className={`text-sm ${essayWords >= t.writing.words[0] && essayWords <= t.writing.words[1] ? 'text-green-700' : 'text-[var(--muted-foreground)]'}`}>{essayWords} words</p></section>}

    <div className="mt-6 text-center">
      {exam && !submitted && <button type="button" className="ln-btn go" onClick={() => { setSubmitted(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>✓ Finish and submit</button>}
      {finished && <Results t={t} L={L} picks={picks} right={right} />}
      {exam && submitted && qs.some(q => q.type === 'open') && <p className="text-sm text-[var(--muted-foreground)]">For the open questions, open the sample answer and mark whether you got it right; the score updates.</p>}
      {!exam && !finished && <p className="text-sm text-[var(--muted-foreground)]">Answer every question to get a score ({answered}/{qs.length})</p>}
      {(finished || submitted) && <button type="button" className="ln-btn alt mt-3" onClick={() => reset(mode)}>🔁 Try again</button>}
    </div>

    {printing && <PrintPreview lang="en" title={t.title} onClose={() => setPrinting(false)}>
      <div className="no-print mb-3 text-center"><button type="button" className="ln-chip" aria-pressed={withAnswers} onClick={() => setWithAnswers(!withAnswers)}>✅ With answer key</button></div>
      <article className="buga-flow us-print" dir="ltr" lang="en">
        <h2>{t.title}</h2>
        <p className="meta">Name: ________________ · Date: __________ · Reading comprehension · {L.name}</p>
        {t.texts.map((x, ti) => <section key={ti}>{t.texts.length > 1 && <h3>Text {ti + 1}{x.title ? `: ${x.title}` : ''}</h3>}{t.texts.length === 1 && x.title && <h3>{x.title}</h3>}
          {(x.paragraphs || []).map((p, pi) => <p key={pi}><b>({pi + 1})</b> {p}</p>)}{x.table && <TableText table={x.table} />}</section>)}
        {glossary.length > 0 && <p className="gloss"><b>Glossary:</b> {glossary.map(([w, h]) => `${w} – ${h}`).join(' · ')}</p>}
        <h3>Questions</h3>
        <ol>{qs.map((q, i) => <li key={i}><b>{q.q}</b>{q.type === 'mc' ? <ol type="a">{q.options.map(o => <li key={o}>{o}</li>)}</ol> : <><div className="write" /><div className="write" /></>}</li>)}</ol>
        {t.writing && <><h3>Writing task</h3><p>{t.writing.prompt} ({t.writing.words[0]}–{t.writing.words[1]} words)</p></>}
      </article>
      {withAnswers && <article className="buga-flow us-print" dir="ltr" lang="en"><h2>Answer key: {t.title}</h2>
        <ol>{qs.map((q, i) => <li key={i}><b>{q.type === 'mc' ? `${'abcd'[q.answer]}. ${q.options[q.answer]}` : q.answer}</b><br />{q.explain}</li>)}</ol></article>}
    </PrintPreview>}
  </>
}

function Results({ t, L, picks, right }) {
  const qs = t.questions, pct = Math.round((right / qs.length) * 100)
  const by = {}
  qs.forEach((q, i) => { const b = (by[q.skill] ||= [0, 0]); b[1]++; if (rightOf(q, picks[i])) b[0]++ })
  const weak = Object.entries(by).filter(([, [r, n]]) => r < n).map(([s]) => RC_SKILLS[s])
  const li = RC_LEVELS.findIndex(l => l.id === L.id)
  const next = pct >= 85 && RC_LEVELS[li + 1] ? RC_LEVELS[li + 1] : pct < 50 && li > 0 ? RC_LEVELS[li - 1] : null
  const more = testsOf(L.id).filter(x => x.slug !== t.slug && !readProgress().done?.[x.slug])
  const msg = pct === 100 ? 'Perfect! 🌟' : pct >= 85 ? 'Excellent! 🎉' : pct >= 70 ? 'Very good 👏' : pct >= 50 ? 'On the right track 💪' : 'Keep practicing, that is what this is for 🌱'
  return <section className="us-results" role="status">
    <div className="us-ring" style={{ '--p': pct }}><b>{pct}%</b><span>{right}/{qs.length}</span></div>
    <p className="text-2xl font-black">{msg}</p>
    <ul className="us-res-skills">{Object.entries(by).map(([s, [r, n]]) => <li key={s} className={r === n ? 'ok' : 'bad'}>{r === n ? '✓' : '•'} {RC_SKILLS[s]} <b>{r}/{n}</b></li>)}</ul>
    {weak.length > 0 && <p className="text-sm">Worth another look: {weak.join(', ')}. Use "Show me in the text" on the questions you missed.</p>}
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      {more[0] && <Link to={rcHref(more[0])} className="ln-btn go">Next passage →</Link>}
      {next && <Link to={rcLevelHref(next)} className="ln-btn alt">{pct >= 85 ? `Level up: ${next.name}` : `Try an easier level: ${next.name}`}</Link>}
    </div>
  </section>
}

function PassagePage({ meta }) {
  const [t, setT] = useState(null)
  useEffect(() => { let on = true; setT(null); loadTest(meta).then(x => { if (on) setT(x) }); return () => { on = false } }, [meta])
  const L = rcLevel(meta.level)
  const others = useMemo(() => testsOf(meta.level).filter(x => x.slug !== meta.slug), [meta])
  const resource = { '@context': 'https://schema.org', '@type': 'LearningResource', name: meta.title, description: meta.summary, inLanguage: 'en', educationalLevel: `${L.name} (${L.cefr})`, learningResourceType: 'Reading comprehension passage with questions', isAccessibleForFree: true }
  return <div className="enr-page rc-page">
    <SEO lang="en" type="article" path={rcHref(meta)} counterpartPath={`/unseen/english/${meta.slug}`} title={`${meta.title} - ${L.name} reading comprehension with answers`}
      description={`${meta.summary} ${meta.words} words, ${meta.questions} questions with an explanation for every answer, an exam mode with a timer and a printable worksheet.`} structuredData={resource} />
    <Breadcrumbs lang="en" items={[HOME, HUB, { label: L.name, href: rcLevelHref(L) }, { label: meta.title }]} />
    <p className="enr-meta">{L.name} ({L.cefr}) · {meta.genre} · {meta.words} words</p>
    <h1>{meta.title}</h1>
    <p className="enr-lead">{meta.summary}</p>
    {t ? <Passage key={meta.slug} t={t} L={L} /> : <p className="ln-box text-center" role="status">Loading the passage…</p>}
    {others.length > 0 && <><h2 className="mb-3 mt-10 text-2xl font-black">More {L.name} passages</h2><div className="grid gap-3 sm:grid-cols-2">{others.map(x => <TestCard key={x.slug} t={x} />)}</div></>}
    <p className="mt-6"><Link to={rcLevelHref(L)} className="font-bold underline">← All {L.name} passages</Link> · <Link to={RC_ROOT} className="underline">All reading comprehension</Link></p>
  </div>
}

// /en/reading-comprehension and /en/reading-comprehension/:x (x = a level path or a passage slug)
export default function Comprehension({ params }) {
  const x = params?.x
  if (!x) return <Hub />
  const L = RC_LEVELS.find(l => l.path === x)
  if (L) return <LevelPage L={L} />
  const meta = RC_META.find(t => t.slug === x)
  return meta ? <PassagePage key={meta.slug} meta={meta} /> : <EnglishNotFound />
}
