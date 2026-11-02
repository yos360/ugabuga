// /excel (course hub, opens straight into the next lesson) and /excel/:slug (one lesson)
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import NotFound from '../pages/NotFound'
import Sheet from './Sheet'
import { LESSONS, lessonBySlug } from './excelLessons'
import { startState, applySolution, checkTask } from './excelEngine'
import './excel.css'

const STORE = 'ugabuga-excel'
const loadDone = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}').done || {} } catch { return {} } }
const saveDone = done => { try { localStorage.setItem(STORE, JSON.stringify({ done })) } catch { /* private mode */ } }
const lessonDone = (done, l) => l.tasks.every((_, i) => done[`${l.slug}:${i}`])

const HUB = { label: 'קורס אקסל', href: '/excel' }
const crumbs = last => [{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, ...(last ? [HUB, { label: last }] : [{ label: HUB.label }])]
const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>

// Formulas inside Hebrew text render reversed (B2*C2=) — show each one as an LTR code chip.
const FX_IN_TEXT = /‎?(=(?:"[^"]*"|[^\s"])+)/g
const Fx = ({ text }) => String(text).split(FX_IN_TEXT).map((part, i) => i % 2 ? <code key={i} dir="ltr" className="xl-code">{part}</code> : part)

// The sheet size/widths a task uses: its own, or the nearest earlier task's.
const sheetOf = (lesson, i) => lesson.tasks.slice(0, i + 1).reverse().find(t => t.sheet).sheet
// The state a task starts from when it has no sheet of its own: the solved previous task.
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="xl-tabs" role="tablist" aria-label="משימות">
          {lesson.tasks.map((t, i) => (
            <button key={i} type="button" role="tab" className={'xl-tab' + (done[`${lesson.slug}:${i}`] ? ' done' : '')} aria-current={i === ti} aria-selected={i === ti} onClick={() => open(i)}>
              {done[`${lesson.slug}:${i}`] ? '✓ ' : ''}{i + 1}. {t.title}
            </button>
          ))}
        </div>
      </div>
      <ol className="xl-steps">{task.steps.map((s, i) => <li key={i}><Fx text={s} /></li>)}</ol>
      <Sheet key={key} sheet={sheetOf(lesson, ti)} initial={initial} onChange={setLive} />
      <ul className="xl-checks" aria-live="polite">
        {checks.map((c, i) => <li key={i} className={c.ok ? 'ok' : ''}><span aria-hidden="true">{c.ok ? '✅' : '⬜'}</span>{c.label}</li>)}
      </ul>
      {ok ? (
        <div className="xl-done" role="status">
          <b>🎉 מעולה! <Fx text={task.tip} /></b>
          {ti < lesson.tasks.length - 1
            ? <button type="button" className="xl-btn go" onClick={() => open(ti + 1, lesson.tasks[ti + 1].sheet ? null : live)}>למשימה הבאה ←</button>
            : next ? <Link className="xl-btn go no-underline" to={`/excel/${next.slug}`}>לשיעור {idx + 2}: {next.title} ←</Link>
              : <b>🏆 סיימתם את כל הקורס!</b>}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="xl-btn alt" onClick={() => setShowTip(true)}>💡 רמז</button>
          <button type="button" className="xl-btn alt" onClick={() => open(ti, lesson.tasks[ti].sheet ? null : start)}>🔄 מהתחלה</button>
          <button type="button" className="xl-btn alt" onClick={solve}>👀 הראו לי</button>
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
        <Link key={l.slug} to={`/excel/${l.slug}`} className={lessonDone(done, l) ? 'done' : ''} aria-current={l.slug === current ? 'page' : undefined}>
          <b>{lessonDone(done, l) ? '✅' : l.emoji} {i + 1}. {l.title}</b><br />
          <span className="text-sm text-[var(--muted-foreground)]">{l.short}</span>
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
  { q: 'צריך אקסל מותקן במחשב?', a: 'לא. כל התרגול נעשה בגיליון שבתוך הדף, והאתר בודק כל משימה מיד. אחרי כל שיעור כדאי לנסות את אותו הדבר גם באקסל או ב-Google Sheets: הנוסחאות זהות.' },
  { q: 'למי מתאים הקורס?', a: 'למתחילים מאפס: הורים, מורים, מחפשי עבודה ותלמידים מכיתה ה׳ ומעלה. אין הקדמות: כל שיעור הוא גיליון עם משימה מהחיים, כמו רשימת קניות, ציונים או תקציב.' },
  { q: 'אילו נוסחאות לומדים?', a: 'חיבור, חיסור, כפל וחילוק, SUM, AVERAGE, MIN, MAX, COUNT, COUNTBLANK, IF ו-COUNTIF, הפניה מוחלטת עם $, מילוי אוטומטי בגרירה, מיון, עיצוב ש״ח וגרפים.' },
  { q: 'המקלדת שלי בעברית. זה משנה?', a: 'את הנתונים מקלידים בעברית, אבל נוסחאות כותבים באנגלית: =SUM ולא =דוצ. מחליפים שפה ב-Alt+Shift. הגיליון באתר מזהה נוסחה שנכתבה בעברית ומזכיר להחליף.' },
  { q: 'ההתקדמות נשמרת?', a: 'כן, בדפדפן שבו תרגלתם. משימה שהושלמה מסומנת ב-✓, ושיעור שהושלם כולו מסומן ב-✅.' },
]

// ── /excel ───────────────────────────────
export function ExcelCourse() {
  const [done, setDone] = useDone()
  // picked once on load, so finishing a lesson here doesn't swap it away under the user
  const [firstOpen, setFirstOpen] = useState(LESSONS[0])
  useEffect(() => { const d = loadDone(); setFirstOpen(LESSONS.find(l => !lessonDone(d, l)) || LESSONS[0]) }, [])
  const n = LESSONS.indexOf(firstOpen)
  return <Page>
    <SEO title="קורס אקסל חינם למתחילים — תרגול בגיליון חי בתוך הדף" description="קורס אקסל חינם בעברית, ישר לתרגול: 10 שיעורים עם גיליון חי שבודק כל משימה. נוסחאות, SUM, AVERAGE, IF, גרירה, $, מיון, עיצוב ש״ח וגרפים. בלי להתקין אקסל." path="/excel" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={crumbs()} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">📗 </span>קורס אקסל חינם</h1>
    <p className="text-center text-lg mb-5">10 שיעורים, אפס הרצאות: עושים את המשימה בגיליון, והאתר בודק מיד.</p>
    <h2 className="text-2xl font-bold mb-2">שיעור {n + 1}: {firstOpen.title}</h2>
    <LessonPlayer key={firstOpen.slug} lesson={firstOpen} done={done} setDone={setDone} />
    <h2 className="text-2xl font-bold mt-10 mb-3">כל השיעורים</h2>
    <LessonList done={done} />
    <div className="mt-12"><SeoBody
      paragraphs={[
        'הקורס בנוי מהקל לקשה: מקלידים בתאים, מעצבים טבלה, כותבים נוסחה ראשונה, ואז SUM ו-AVERAGE, גרירה ומילוי עם $, MAX, MIN ו-COUNT, IF ו-COUNTIF, מיון, גרפים, ובסוף פרויקט של תקציב משפחתי. כל שיעור לוקח בין 5 ל-10 דקות.',
        'הגיליון באתר עובד כמו אקסל בעברית: עמודה A מימין, Enter יורד שורה, Tab עובר עמודה, F2 עורך תא, Ctrl+B מדגיש, Ctrl+D ממלא למטה ו-Ctrl+Z מבטל. בזמן הקלדת נוסחה אפשר ללחוץ על תא או לגרור על טווח, והכתובת נכנסת לנוסחה לבד.',
      ]}
      faq={FAQ}
      related={[{ label: 'הקלדה עיוורת', href: '/typing' }, { label: 'בינה מלאכותית', href: '/learn/ai' }, { label: 'מבחן מהירות הקלדה', href: '/typing/test' }]}
    /></div>
  </Page>
}

// ── /excel/:slug ───────────────────────────────
export function ExcelLesson() {
  const { slug } = useParams()
  const lesson = lessonBySlug(slug)
  const [done, setDone] = useDone()
  if (!lesson) return <NotFound />
  const i = LESSONS.indexOf(lesson)
  const prev = LESSONS[i - 1], next = LESSONS[i + 1]
  return <Page>
    <SEO title={`${lesson.title} — שיעור ${i + 1} בקורס אקסל חינם`} description={`${lesson.seo}. תרגול מעשי בגיליון חי בתוך הדף, עם בדיקה מיידית. בחינם ובלי להתקין אקסל.`} path={`/excel/${lesson.slug}`} />
    <Breadcrumbs items={crumbs(lesson.title)} />
    <h1 className="text-3xl sm:text-4xl mb-3"><span aria-hidden="true">{lesson.emoji} </span>שיעור {i + 1}: {lesson.title}</h1>
    <LessonPlayer key={lesson.slug} lesson={lesson} done={done} setDone={setDone} />
    <div className="flex flex-wrap justify-between gap-2 mt-4">
      {prev ? <Link to={`/excel/${prev.slug}`}>→ שיעור {i}: {prev.title}</Link> : <span />}
      {next && <Link to={`/excel/${next.slug}`}>שיעור {i + 2}: {next.title} ←</Link>}
    </div>
    <h2 className="text-2xl font-bold mt-10 mb-3">כל השיעורים</h2>
    <LessonList done={done} current={lesson.slug} />
    <div className="mt-12"><SeoBody
      paragraphs={[`${lesson.seo}. ${lesson.tasks.map(t => t.tip).join(' ')}`]}
      related={[{ label: 'קורס אקסל: כל השיעורים', href: '/excel' }, ...(next ? [{ label: next.title, href: `/excel/${next.slug}` }] : [])]}
    /></div>
  </Page>
}
