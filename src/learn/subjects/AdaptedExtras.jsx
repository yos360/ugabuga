import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdaptedExam from './AdaptedExam'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import NotFound from '../../pages/NotFound'
import { GRADE_LETTERS, gradeSlug } from './subjects'
import { ADAPTED_MATH_GRADES, adaptedMathQuestions } from './adaptedMath'
import { ADAPTED_READING_GRADES, adaptedReadingQuestions } from './adaptedReading'
import '../learn.css'
import './adapted.css'

// /learn/adapted-tests/math/grade-N and /learn/adapted-tests/reading/grade-N:
// the adapted exam (read-aloud, large type, three answers, no clock) for math and for reading comprehension.

const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const HUB = { label: 'מבחנים מותאמים', href: '/learn/adapted-tests' }
const randomSeed = () => Math.floor(Math.random() * 1e9) + 1
const parseGrade = (slug, allowed) => {
  const m = /^grade-(\d{1,2})$/.exec(slug || '')
  return m && allowed.includes(Number(m[1])) ? Number(m[1]) : null
}

// A fresh seed only after mount, so the prerendered page and the first client render match.
function useSeed() {
  const [seed, setSeed] = useState(1)
  useEffect(() => { setSeed(randomSeed()) }, [])
  return [seed, () => { setSeed(randomSeed()); window.scrollTo(0, 0) }]
}

function GradeChips({ base, grades, current }) {
  return <p className="mt-6 flex flex-wrap items-center justify-center gap-2">
    <span className="font-bold">כיתות נוספות:</span>
    {grades.filter(n => n !== current).map(n => <Link key={n} to={`${base}/${gradeSlug(n)}`} className="ln-chip">כיתה {GRADE_LETTERS[n]}</Link>)}
  </p>
}

// ── /learn/adapted-tests/math/grade-N ──
export function AdaptedMathPage() {
  const { slug } = useParams()
  const grade = parseGrade(slug, ADAPTED_MATH_GRADES)
  return grade ? <MathExam key={grade} grade={grade} /> : <NotFound />
}
function MathExam({ grade }) {
  const nav = useNavigate()
  const [seed, fresh] = useSeed()
  const qs = useMemo(() => adaptedMathQuestions(grade, seed, 10), [grade, seed])
  const L = GRADE_LETTERS[grade], name = `חשבון כיתה ${L}`, path = `/learn/adapted-tests/math/${gradeSlug(grade)}`
  return <Page>
    <SEO title={`מבחן חשבון מותאם כיתה ${L} — עם הקראה והקלות`} description={`מבחן חשבון מותאם לכיתה ${L} לילדים עם קשיי למידה: כל תרגיל מוקרא בקול, אותיות גדולות, שלוש תשובות, בלי שעון ועם ניסיון נוסף. 10 שאלות, גם להדפסה.`} path={path} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, HUB, { label: `חשבון כיתה ${L}` }]} />
    <h1 className="text-3xl sm:text-4xl text-center mb-4"><span aria-hidden="true">🎧 </span>מבחן חשבון מותאם כיתה {L}</h1>
    <AdaptedExam key={seed} name={name} qs={qs} lessonHref={`/math/${gradeSlug(grade)}`} onRegular={() => nav(`/math/tests/${gradeSlug(grade)}`)} onFresh={fresh} />
    <GradeChips base="/learn/adapted-tests/math" grades={ADAPTED_MATH_GRADES} current={grade} />
    <p className="mt-4 text-center"><Link to="/learn/adapted-tests" className="font-bold underline">לכל המבחנים המותאמים ←</Link></p>
  </Page>
}

// ── /learn/adapted-tests/reading/grade-N ──
const READING_FILES = import.meta.glob('./readings/*.js')
const READING_KEYS = Object.keys(READING_FILES)

// Picks a subject's reading file by the seed (so different exams come from different subjects) and
// falls through to the next one when the subject has no passage for the grade.
async function buildReading(grade, seed) {
  const order = READING_KEYS.map((k, i) => [(Math.imul(seed, 2654435761) + i * 40503) >>> 0, k]).sort((a, b) => a[0] - b[0])
  for (const [, key] of order) {
    const res = adaptedReadingQuestions((await READING_FILES[key]()).READINGS, grade, seed)
    if (res) return res
  }
  return null
}

export function AdaptedReadingPage() {
  const { slug } = useParams()
  const grade = parseGrade(slug, ADAPTED_READING_GRADES)
  return grade ? <ReadingExam key={grade} grade={grade} /> : <NotFound />
}
function ReadingExam({ grade }) {
  const nav = useNavigate()
  const [seed, fresh] = useSeed()
  const [exam, setExam] = useState(null)
  useEffect(() => {
    let live = true
    buildReading(grade, seed).then(r => { if (live) setExam(r && { ...r, seed }) })
    return () => { live = false }
  }, [grade, seed])
  const L = GRADE_LETTERS[grade], name = `הבנת הנקרא כיתה ${L}`, path = `/learn/adapted-tests/reading/${gradeSlug(grade)}`
  return <Page>
    <SEO title={`הבנת הנקרא מותאמת כיתה ${L} — קטע עם הקראה ושאלות`} description={`מבחן הבנת הנקרא מותאם לכיתה ${L} לילדים עם דיסלקציה וקשיי קריאה: קטע קצר באותיות גדולות עם הקראה בקול, שאלות עם שלוש תשובות, בלי שעון ועם ניסיון נוסף.`} path={path} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, HUB, { label: `הבנת הנקרא כיתה ${L}` }]} />
    <h1 className="text-3xl sm:text-4xl text-center mb-4"><span aria-hidden="true">🎧 </span>הבנת הנקרא מותאמת כיתה {L}</h1>
    {exam ? <AdaptedExam key={`${exam.slug}-${exam.seed}`} name={name} qs={exam.questions} lessonHref="/courses/reading" onRegular={() => nav('/courses/reading')} onFresh={fresh} />
      : <p className="text-center py-16 text-lg" role="status">טוענים את הקטע…</p>}
    <GradeChips base="/learn/adapted-tests/reading" grades={ADAPTED_READING_GRADES} current={grade} />
    <p className="mt-4 text-center"><Link to="/learn/adapted-tests" className="font-bold underline">לכל המבחנים המותאמים ←</Link></p>
  </Page>
}
