// /en/excel (course home, opens straight into the next lesson) and /en/excel/:lesson (one lesson).
// Same live sheet and checks as the Hebrew course; only the text, the $ format and the left-to-right layout differ.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { EnglishNotFound } from '../EnglishLayout'
import Sheet from '../../excel/Sheet'
import { startState, applySolution, checkTask } from '../../excel/excelEngine'
import { LESSONS_EN as LESSONS, lessonBySlugEn } from './lessonsEn.js'
import { EXCEL_HOME, lessonTitleEn, lessonDescriptionEn } from './catalog.js'
import '../../excel/excel.css'
import '../english.css'
import './excel-en.css'

// Same storage key as the Hebrew course: a lesson finished in one language counts in the other.
const STORE = 'ugabuga-excel'
const loadDone = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}').done || {} } catch { return {} } }
const saveDone = done => { try { localStorage.setItem(STORE, JSON.stringify({ done })) } catch { /* private mode */ } }
const lessonDone = (done, l) => l.tasks.every((_, i) => done[`${l.slug}:${i}`])

// Formulas inside a sentence show as code chips.
const FX_IN_TEXT = /(=(?:"[^"]*"|[^\s"])+)/g
const Fx = ({ text }) => String(text).split(FX_IN_TEXT).map((part, i) => i % 2 ? <code key={i} className="xl-code">{part}</code> : part)

const sheetOf = (lesson, i) => lesson.tasks.slice(0, i + 1).reverse().find(t => t.sheet).sheet
function solvedChain(lesson, i) {
  let s = null
  for (let k = 0; k <= i; k++) {
    const t = lesson.tasks[k]
    s = t.sheet ? startState(t.sheet) : s
    if (k < i) s = applySolution(s, t.solution)
  }
  return s
}

function LessonPlayer({ lesson, done, setDone }) {
  const [ti, setTi] = useState(0)
  const [start, setStart] = useState(() => solvedChain(lesson, 0))
  const [initial, setInitial] = useState(start)
  const [live, setLive] = useState(start)
  const [key, setKey] = useState(0)
  const [showTip, setShowTip] = useState(false)
  const task = lesson.tasks[ti]
  const idx = LESSONS.indexOf(lesson)
  const next = LESSONS[idx + 1]

  const open = useCallback((i, from) => {
    const s = lesson.tasks[i].sheet ? startState(lesson.tasks[i].sheet) : (from || solvedChain(lesson, i))
    setTi(i); setStart(s); setInitial(s); setLive(s); setKey(k => k + 1); setShowTip(false)
  }, [lesson])
  useEffect(() => { open(0) }, [open])

  const checks = useMemo(() => checkTask(task, live, start), [task, live, start])
  const ok = checks.every(c => c.ok)
  useEffect(() => {
    const id = `${lesson.slug}:${ti}`
    if (ok && !done[id]) { const d = { ...done, [id]: 1 }; saveDone(d); setDone(d) }
  }, [ok, lesson.slug, ti, done, setDone])

  const solve = () => { const s = applySolution(start, task.solution); setInitial(s); setLive(s); setKey(k => k + 1) }

  return (
    <div className="xl-box space-y-3">
      <div className="xl-tabs" role="tablist" aria-label="Tasks">
        {lesson.tasks.map((t, i) => (
          <button key={i} type="button" role="tab" className={'xl-tab' + (done[`${lesson.slug}:${i}`] ? ' done' : '')} aria-current={i === ti} aria-selected={i === ti} onClick={() => open(i)}>
            {done[`${lesson.slug}:${i}`] ? '✓ ' : ''}{i + 1}. {t.title}
          </button>
        ))}
      </div>
      <ol className="xl-steps">{task.steps.map((s, i) => <li key={i}><Fx text={s} /></li>)}</ol>
      <Sheet key={key} lang="en" sheet={sheetOf(lesson, ti)} initial={initial} onChange={setLive} />
      <ul className="xl-checks" aria-live="polite">
        {checks.map((c, i) => <li key={i} className={c.ok ? 'ok' : ''}><span aria-hidden="true">{c.ok ? '✅' : '⬜'}</span>{c.label}</li>)}
      </ul>
      {ok ? (
        <div className="xl-done" role="status">
          <b>🎉 Great job! <Fx text={task.tip} /></b>
          {ti < lesson.tasks.length - 1
            ? <button type="button" className="xl-btn go" onClick={() => open(ti + 1, lesson.tasks[ti + 1].sheet ? null : live)}>Next task →</button>
            : next ? <Link className="xl-btn go" to={`/en/excel/${next.slug}`}>Lesson {idx + 2}: {next.title} →</Link>
              : <b>🏆 You finished the whole course!</b>}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="xl-btn alt" onClick={() => setShowTip(true)}>💡 Hint</button>
          <button type="button" className="xl-btn alt" onClick={() => open(ti, lesson.tasks[ti].sheet ? null : start)}>🔄 Start over</button>
          <button type="button" className="xl-btn alt" onClick={solve}>👀 Show me</button>
        </div>
      )}
      {showTip && !ok && <p className="xl-tip">💡 <Fx text={task.tip} /></p>}
    </div>
  )
}

function LessonList({ done, current }) {
  return (
    <div className="xl-lessons">
      {LESSONS.map((l, i) => (
        <Link key={l.slug} to={`/en/excel/${l.slug}`} className={lessonDone(done, l) ? 'done' : ''} aria-current={l.slug === current ? 'page' : undefined}>
          <b>{lessonDone(done, l) ? '✅' : l.emoji} {i + 1}. {l.title}</b><br />
          <span className="xl-short">{l.short}</span>
        </Link>
      ))}
    </div>
  )
}

function useDone() {
  const [done, setDone] = useState({})
  useEffect(() => { setDone(loadDone()) }, [])
  return [done, setDone]
}

const FAQ = [
  { q: 'Do I need Excel installed on my computer?', a: 'No. All the practice happens in the sheet inside the page, and the site checks every task right away. After each lesson, try the same thing in Excel or Google Sheets. The formulas are the same.' },
  { q: 'Who is the course for?', a: 'Complete beginners: parents, teachers, job seekers and students from about age 10. There is no background reading. Each lesson is a sheet with a real-life task, like a shopping list, test scores or a budget.' },
  { q: 'Which formulas will I learn?', a: 'Adding, subtracting, multiplying and dividing, SUM, AVERAGE, MIN, MAX, COUNT, COUNTBLANK, IF and COUNTIF, absolute references with $, AutoFill by dragging, sorting, dollar formatting and charts.' },
  { q: 'Do the formulas here work in real Excel?', a: 'Yes. They use the same English function names and commas that Excel uses in the US, so you can copy them straight into Excel or Google Sheets. In some countries Excel uses semicolons instead of commas, and the sheet here accepts both.' },
  { q: 'Is my progress saved?', a: 'Yes, in the browser where you practiced. A finished task gets a ✓, and a finished lesson gets a ✅.' },
]

const Crumbs = ({ last }) => (
  <nav className="en-breadcrumb" aria-label="Breadcrumb">
    <Link to="/en">Home</Link> / {last ? <><Link to="/en/excel">Excel course</Link> / {last}</> : 'Excel course'}
  </nav>
)

function Home() {
  const [done, setDone] = useDone()
  // picked once on load, so finishing a lesson here does not swap it away under the learner
  const [firstOpen, setFirstOpen] = useState(LESSONS[0])
  useEffect(() => { const d = loadDone(); setFirstOpen(LESSONS.find(l => !lessonDone(d, l)) || LESSONS[0]) }, [])
  const n = LESSONS.indexOf(firstOpen)
  return <div className="en-page xl-en">
    <SEO lang="en" title={EXCEL_HOME.title} description={EXCEL_HOME.description} path={EXCEL_HOME.path} counterpartPath={EXCEL_HOME.counterpart} structuredData={faqSchema(FAQ)} />
    <Crumbs />
    <h1 className="xl-title"><span aria-hidden="true">📗 </span>Free Excel course</h1>
    <p className="en-lead xl-lead">10 lessons, no lectures. Do the task in the sheet and the site checks it right away.</p>
    <h2>Lesson {n + 1}: {firstOpen.title}</h2>
    <LessonPlayer key={firstOpen.slug} lesson={firstOpen} done={done} setDone={setDone} />
    <h2>All lessons</h2>
    <LessonList done={done} />
    <SeoBody lang="en"
      paragraphs={[
        'The course goes from easy to hard: type in cells, format a table, write your first formula, then SUM and AVERAGE, dragging and filling with $, MAX, MIN and COUNT, IF and COUNTIF, sorting, charts, and finally a family budget project. Each lesson takes 5 to 10 minutes.',
        'The sheet works like Excel in English: column A is on the left, Enter moves down a row, Tab moves to the next column, F2 edits a cell, Ctrl+B makes text bold, Ctrl+D fills down and Ctrl+Z undoes. While you type a formula you can click a cell or drag across a range, and the address is typed into the formula for you.',
      ]}
      faq={FAQ}
      related={[{ label: 'Lesson 1: Typing in cells', href: '/en/excel/basics' }]}
    />
  </div>
}

function Lesson({ lesson }) {
  const [done, setDone] = useDone()
  const i = LESSONS.indexOf(lesson)
  const prev = LESSONS[i - 1], next = LESSONS[i + 1]
  return <div className="en-page xl-en">
    <SEO lang="en" title={lessonTitleEn(lesson, i)} description={lessonDescriptionEn(lesson)} path={`/en/excel/${lesson.slug}`} counterpartPath={`/excel/${lesson.slug}`} />
    <Crumbs last={lesson.title} />
    <h1 className="xl-title"><span aria-hidden="true">{lesson.emoji} </span>Lesson {i + 1}: {lesson.title}</h1>
    <LessonPlayer key={lesson.slug} lesson={lesson} done={done} setDone={setDone} />
    <div className="flex flex-wrap justify-between gap-2 mt-4">
      {prev ? <Link to={`/en/excel/${prev.slug}`}>← Lesson {i}: {prev.title}</Link> : <span />}
      {next && <Link to={`/en/excel/${next.slug}`}>Lesson {i + 2}: {next.title} →</Link>}
    </div>
    <h2>All lessons</h2>
    <LessonList done={done} current={lesson.slug} />
    <SeoBody lang="en"
      paragraphs={[`${lesson.seo}. ${lesson.tasks.map(t => t.tip).join(' ')}`]}
      related={[{ label: 'Excel course: all lessons', href: '/en/excel' }, ...(next ? [{ label: next.title, href: `/en/excel/${next.slug}` }] : [])]}
    />
  </div>
}

export default function ExcelCourseEn({ params = {} }) {
  if (!params.lesson) return <Home />
  const lesson = lessonBySlugEn(params.lesson)
  return lesson ? <Lesson lesson={lesson} /> : <EnglishNotFound />
}
