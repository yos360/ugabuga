// /courses (all courses), /courses/:course (course home) and /courses/:course/:lesson (one lesson).
// A lesson is short reading, a "try it yourself" list and a 4-question quiz; passing the quiz marks it done.
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import NotFound from '../pages/NotFound'
import { COURSES, COURSES_BASE, LOAD, courseMeta } from './catalog'
import './courses.css'

const STORE = 'ugabuga-courses'
const loadDone = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}').done || {} } catch { return {} } }
const saveDone = done => { try { localStorage.setItem(STORE, JSON.stringify({ done })) } catch { /* private mode */ } }
function useDone() {
  const [done, setDone] = useState({})
  useEffect(() => { setDone(loadDone()) }, [])
  const mark = id => setDone(d => { const n = { ...d, [id]: 1 }; saveDone(n); return n })
  return [done, mark]
}

function useCourse(slug) {
  const [course, setCourse] = useState(null)
  useEffect(() => {
    let live = true
    setCourse(null)
    LOAD[slug]?.().then(m => { if (live) setCourse(m.default) })
    return () => { live = false }
  }, [slug])
  return course
}

const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const hrefOf = c => c.href || `${COURSES_BASE}/${c.slug}`
// The practice tool is a page of ours, or an outside editor (Scratch) opened in a new tab.
const Tool = ({ t }) => t.external ? <a href={t.href} target="_blank" rel="noopener noreferrer">✏️ {t.label} ↗</a> : <Link to={t.href}>✏️ {t.label}</Link>
const crumbs = (...rest) => [{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, ...rest]

function Body({ items }) {
  return items.map(([title, body]) => <section key={title} className="cr-sec">
    <h2>{title}</h2>
    {Array.isArray(body) ? body.map(p => <p key={p}>{p}</p>)
      : body.steps ? <ol className="cr-steps">{body.steps.map(s => <li key={s}>{s}</li>)}</ol>
        : body.code ? <><pre className="cr-code" dir="ltr"><code>{body.code}</code></pre>{body.note && <p>{body.note}</p>}</>
        : body.keys ? <table className="cr-keys"><tbody>{body.keys.map(([k, w]) => <tr key={k}><th><kbd dir="ltr">{k}</kbd></th><td>{w}</td></tr>)}</tbody></table>
          : <p className="cr-tip">💡 {body.tip}</p>}
  </section>)
}

function Quiz({ quiz, onPass }) {
  const [picked, setPicked] = useState({})
  const right = quiz.filter((q, i) => picked[i] === q[2]).length
  useEffect(() => { if (right === quiz.length) onPass() }, [right, quiz.length, onPass])
  return <div className="cr-quiz">
    {quiz.map(([q, opts, ok, why], i) => <fieldset key={q}>
      <legend>{i + 1}. {q}</legend>
      <div className="cr-opts">{opts.map((o, j) => {
        const state = picked[i] === j ? (j === ok ? ' ok' : ' no') : ''
        return <button key={o} type="button" className={'cr-opt' + state} aria-pressed={picked[i] === j} onClick={() => setPicked(p => ({ ...p, [i]: j }))}>{o}</button>
      })}</div>
      {picked[i] != null && <p className={picked[i] === ok ? 'cr-why ok' : 'cr-why'} role="status">{picked[i] === ok ? '✅ נכון! ' + why : '❌ לא בדיוק. נסו תשובה אחרת.'}</p>}
    </fieldset>)}
    <p className="cr-score" aria-live="polite">{right} מתוך {quiz.length} נכונות</p>
  </div>
}

function LessonList({ course, done, current }) {
  return <ol className="cr-lessons">
    {course.lessons.map((l, i) => {
      const id = `${course.slug}/${l.slug}`
      return <li key={l.slug}><Link to={`${COURSES_BASE}/${course.slug}/${l.slug}`} className={done[id] ? 'done' : ''} aria-current={l.slug === current ? 'page' : undefined}>
        <b>{done[id] ? '✅' : l.emoji} {i + 1}. {l.title}</b><span>{l.short}</span>
      </Link></li>
    })}
  </ol>
}

// ── /courses ───────────────────────────────
const HUB_FAQ = [
  { q: 'הקורסים באמת בחינם?', a: 'כן. כל הקורסים בעוגה בוגה חינמיים, בלי הרשמה ובלי כרטיס אשראי.' },
  { q: 'צריך להירשם כדי לשמור התקדמות?', a: 'לא. ההתקדמות נשמרת בדפדפן שבו למדתם, ושיעור שעברתם מסומן ב־✅.' },
  { q: 'למי מתאימים הקורסים?', a: 'לילדים מכיתה ד׳ ומעלה, להורים ולמבוגרים שמתחילים מאפס. כל קורס כתוב בעברית פשוטה, עם שיעורים קצרים של 5 עד 10 דקות.' },
]
export function CoursesHub() {
  return <Page>
    <SEO title="קורסים חינם בעברית — וורד, אקסל, הקלדה ועוד" description="קורסים חינמיים בעברית לילדים, הורים ומבוגרים: וורד למתחילים, אקסל עם גיליון חי, הקלדה עיוורת ועוד. שיעורים קצרים, תרגול וחידון, בלי הרשמה." path={COURSES_BASE} structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={crumbs({ label: 'קורסים' })} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🎓 </span>קורסים חינם</h1>
    <p className="text-center text-lg mb-6">שיעורים קצרים בעברית, עם תרגול וחידון. בלי הרשמה ובלי תשלום.</p>
    <div className="cr-grid">{COURSES.map(c => <Link key={c.slug} to={hrefOf(c)} className="cr-card">
      <span aria-hidden="true" className="cr-ic">{c.emoji}</span><b>{c.title}</b><span>{c.short}</span><small>{c.who}</small>
    </Link>)}</div>
    <div className="mt-12"><SeoBody paragraphs={['כל קורס בנוי משיעורים קצרים: הסבר פשוט, תרגול שעושים במחשב, וחידון קצר שבודק שהבנתם. אפשר ללמוד לפי הסדר, או לקפוץ ישר לשיעור שצריך.']} faq={HUB_FAQ} related={[{ label: 'בינה מלאכותית', href: '/learn/ai' }, { label: 'תכנות לילדים', href: '/learn/coding' }, { label: 'מחשבים', href: '/learn/computers' }]} /></div>
  </Page>
}

// ── /courses/:course ───────────────────────────────
export function CourseHome() {
  const { course: slug } = useParams()
  const course = useCourse(slug)
  const [done] = useDone()
  if (!courseMeta(slug)) return <NotFound />
  if (!course) return <Page><p className="text-center py-20">טוענים את הקורס…</p></Page>
  const first = course.lessons.find(l => !done[`${slug}/${l.slug}`]) || course.lessons[0]
  const count = course.lessons.filter(l => done[`${slug}/${l.slug}`]).length
  return <Page>
    <SEO title={course.seoTitle} description={course.description} path={`${COURSES_BASE}/${slug}`} structuredData={faqSchema(course.faq)} />
    <Breadcrumbs items={crumbs({ label: 'קורסים', href: COURSES_BASE }, { label: course.title })} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{course.emoji} </span>{course.title}</h1>
    <p className="text-center text-lg mb-5">{course.intro}</p>
    <div className="cr-start">
      <Link className="cr-btn" to={`${COURSES_BASE}/${slug}/${first.slug}`}>{count ? 'להמשיך' : 'להתחיל'}: {first.title} ←</Link>
      {count > 0 && <span>סיימתם {count} מתוך {course.lessons.length} שיעורים</span>}
    </div>
    <h2 className="text-2xl font-bold mt-8 mb-3">כל השיעורים</h2>
    <LessonList course={course} done={done} />
    {course.practiceTool && <p className="mt-4"><Tool t={course.practiceTool} /></p>}
    <div className="mt-12"><SeoBody paragraphs={course.about} faq={course.faq} related={course.related} /></div>
  </Page>
}

// ── /courses/:course/:lesson ───────────────────────────────
export function CourseLesson() {
  const { course: slug, lesson: ls } = useParams()
  const course = useCourse(slug)
  const [done, mark] = useDone()
  if (!courseMeta(slug)) return <NotFound />
  if (!course) return <Page><p className="text-center py-20">טוענים את השיעור…</p></Page>
  const i = course.lessons.findIndex(l => l.slug === ls)
  if (i < 0) return <NotFound />
  const lesson = course.lessons[i], prev = course.lessons[i - 1], next = course.lessons[i + 1]
  const id = `${slug}/${lesson.slug}`
  const base = `${COURSES_BASE}/${slug}`
  return <Page>
    <SEO title={`${lesson.title} — שיעור ${i + 1} ב${course.title}`} description={`${lesson.seo}. שיעור קצר בעברית עם תרגול וחידון, בחינם.`} path={`${base}/${lesson.slug}`} />
    <Breadcrumbs items={crumbs({ label: 'קורסים', href: COURSES_BASE }, { label: course.title, href: base }, { label: lesson.title })} />
    <p className="cr-kicker">{course.title} · שיעור {i + 1} מתוך {course.lessons.length}</p>
    <h1 className="text-3xl sm:text-4xl mb-4"><span aria-hidden="true">{lesson.emoji} </span>{lesson.title}</h1>
    <Body items={lesson.body} />
    <section className="cr-sec cr-practice">
      <h2>✏️ תרגול: עכשיו אתם</h2>
      <ol className="cr-steps">{lesson.practice.map(s => <li key={s}>{s}</li>)}</ol>
      {course.practiceTool && <p><Tool t={course.practiceTool} /></p>}
    </section>
    <section className="cr-sec">
      <h2>🧠 חידון קצר</h2>
      <Quiz key={id} quiz={lesson.quiz} onPass={() => { if (!done[id]) mark(id) }} />
      {done[id] && <div className="cr-done" role="status"><b>🎉 עברתם את השיעור!</b>
        {next ? <Link className="cr-btn" to={`${base}/${next.slug}`}>לשיעור {i + 2}: {next.title} ←</Link> : <b>🏆 סיימתם את כל הקורס!</b>}
      </div>}
    </section>
    <nav className="flex flex-wrap justify-between gap-2 mt-6" aria-label="שיעורים">
      {prev ? <Link to={`${base}/${prev.slug}`}>→ שיעור {i}: {prev.title}</Link> : <Link to={base}>→ לעמוד הקורס</Link>}
      {next && <Link to={`${base}/${next.slug}`}>שיעור {i + 2}: {next.title} ←</Link>}
    </nav>
    <h2 className="text-2xl font-bold mt-10 mb-3">כל השיעורים</h2>
    <LessonList course={course} done={done} current={lesson.slug} />
    <div className="mt-12"><SeoBody paragraphs={[`${lesson.seo}. ${lesson.short}.`]} related={[{ label: `${course.title}: כל השיעורים`, href: base }, ...(next ? [{ label: next.title, href: `${base}/${next.slug}` }] : []), { label: 'כל הקורסים', href: COURSES_BASE }]} /></div>
  </Page>
}
