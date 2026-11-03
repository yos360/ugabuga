import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import { BOOKLETS, bookletBySlug, bookletHref } from '../../booklets/registry'
import { newSeed } from '../../motor/rng'
import { parsePageRange, pageKind } from '../../utils/pageRange'
import { GRADES, gradesOf } from '../../booklets/grades'
import { CHANNEL_GO } from '../../data/brand'
import PlannerBanner from '../../components/ui/PlannerBanner'
import './booklets.css'

// /booklets — every downloadable workbook; /booklets/:slug — one workbook: what's inside, a peek at the
// first pages, and the full booklet in PrintPreview (print or save as PDF).
const CRUMB = { label: 'חוברות עבודה להדפסה', href: '/booklets' }
const button = 'inline-flex min-h-[48px] items-center justify-center rounded-2xl px-6 py-3 text-lg font-black'

function useBooklet(b) {
  const [Booklet, setBooklet] = useState(null)
  useEffect(() => { let live = true; b.load().then(m => { if (live) setBooklet(() => m.default) }); return () => { live = false } }, [b])
  return Booklet
}

function Card({ b }) {
  return <Link to={bookletHref(b)} className="booklet-card wobbly flex flex-col border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-sm transition-transform hover:-translate-y-1">
    <span className="text-4xl" aria-hidden="true">{b.emoji}</span>
    <h2 className="mt-1 text-2xl font-bold">{b.title}</h2>
    <p className="text-sm font-bold text-[var(--muted-foreground)]">{b.audience} · {b.pages.length} עמודים · PDF</p>
    <p className="mt-2 flex-1 text-[var(--muted-foreground)]">{b.pages.slice(1, 6).join(' · ')}…</p>
    <span className="mt-3 font-bold underline decoration-dashed">לחוברת ←</span>
  </Link>
}

// Filters on the hub: the school stage (from `stage`, or guessed from `audience`) and a subject group.
const STAGES = ['גן', 'יסודי', 'חטיבת ביניים', 'תיכון']
const stageOf = b => b.stage || (/גיל|גן/.test(b.audience) && !/כית/.test(b.audience) ? 'גן' : /תיכון|י׳|י״א|י״ב/.test(b.audience) ? 'תיכון' : /ז׳|ח׳|ט׳|חטיבת/.test(b.audience) ? 'חטיבת ביניים' : /גן/.test(b.audience) ? 'גן' : 'יסודי')
const SUBJECTS = [
  ['חשבון ומתמטיקה', /חשבון|מתמטיקה/], ['עברית ולשון', /עברית|לשון|קריאה|כתיב|תנועות|צליל/], ['אנגלית', /אנגלית/],
  ['ספרות', /ספרות/], ['מדע וטבע', /מדע|טבע|ביולוגיה/], ['תנ״ך', /תנ״ך|בראשית|שמות/], ['היסטוריה', /היסטוריה|מורשת/], ['מולדת וגאוגרפיה', /מולדת|גאוגרפיה/],
  ['אזרחות', /אזרחות/], ['חגים', /חגים/],
]
const subjectOf = b => (SUBJECTS.find(([, re]) => re.test(b.subject)) || ['עוד'])[0]
// A grade row under the stage, for the stages that have grades.
const STAGE_GRADES = { 'יסודי': [1, 2, 3, 4, 5, 6], 'חטיבת ביניים': [7, 8, 9] }
const Chip = ({ on, onClick, children }) => <button type="button" aria-pressed={on} onClick={onClick} className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-violet-600 bg-violet-600 text-white' : 'border-[var(--border)] bg-[var(--card)]'}`}>{children}</button>

export function BookletsHub() {
  const [stage, setStage] = useState(null), [grade, setGrade] = useState(null), [subject, setSubject] = useState(null)
  const inLevel = b => (!stage || stageOf(b) === stage) && (!grade || gradesOf(b.audience).includes(grade))
  const shown = BOOKLETS.filter(b => inLevel(b) && (!subject || subjectOf(b) === subject))
  const subjects = [...SUBJECTS.map(s => s[0]), 'עוד'].filter(s => BOOKLETS.some(b => subjectOf(b) === s && inLevel(b)))
  const grades = (STAGE_GRADES[stage] || []).filter(n => BOOKLETS.some(b => stageOf(b) === stage && gradesOf(b.audience).includes(n)))
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="חוברות עבודה להדפסה — PDF בחינם לגן ולבית הספר" description={`${BOOKLETS.length} חוברות עבודה להדפסה בחינם, מגיל 3 ועד התיכון: חשבון, עברית, אנגלית, מדעים, תנ״ך, היסטוריה וגאוגרפיה. כל חוברת להורדה כ־PDF, עם דף תשובות ותעודת סיום.`} path="/booklets" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: CRUMB.label }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">📚 </span>חוברות עבודה להדפסה</h1>
    <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">חוברות שלמות לפי כיתה ונושא, להדפסה או לשמירה כ־PDF. בכל חוברת יש שער עם שם הילד, עמודי תרגול מגוונים ותעודת סיום.</p>
    <div className="mb-3 flex flex-wrap justify-center gap-2" role="group" aria-label="גיל">
      <Chip on={!stage} onClick={() => { setStage(null); setGrade(null) }}>כל הגילאים</Chip>
      {STAGES.map(s => <Chip key={s} on={stage === s} onClick={() => { setStage(s); setGrade(null); setSubject(null) }}>{s}</Chip>)}
    </div>
    {grades.length > 1 && <div className="mb-3 flex flex-wrap justify-center gap-2" role="group" aria-label="כיתה">
      <Chip on={!grade} onClick={() => setGrade(null)}>כל הכיתות</Chip>
      {grades.map(n => <Chip key={n} on={grade === n} onClick={() => { setGrade(n); setSubject(null) }}>כיתה {GRADES[n - 1]}׳</Chip>)}
    </div>}
    <div className="mb-6 flex flex-wrap justify-center gap-2" role="group" aria-label="מקצוע">
      <Chip on={!subject} onClick={() => setSubject(null)}>כל המקצועות</Chip>
      {subjects.map(s => <Chip key={s} on={subject === s} onClick={() => setSubject(s)}>{s}</Chip>)}
    </div>
    {stage === 'תיכון' && <p className="mb-4 text-center"><Link to="/bagrut" className="inline-flex min-h-[48px] items-center rounded-2xl bg-violet-700 px-5 font-bold text-white">🎓 מבחני בגרות לתרגול, לפי מקצוע ויחידות ←</Link></p>}
    <p className="mb-3 text-center font-bold text-[var(--muted-foreground)]" aria-live="polite">{shown.length} חוברות</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map(b => <Card key={b.slug} b={b} />)}</div>
    <PlannerBanner className="mt-10" />
    <div className="mt-10"><SeoBody paragraphs={[
      'חוברת עבודה נותנת לילד משהו שדף בודד לא נותן: התחלה, אמצע וסוף. יש שער שכותבים עליו את השם, עמודים שמתקדמים בהדרגה, ותעודה בסוף שאפשר לתלות על המקרר.',
      'כל החוברות כאן בחינם ובלי הרשמה. פותחים את החוברת, רואים את כל העמודים בתצוגה מקדימה, ובוחרים אם להדפיס או לשמור כ־PDF ולשלוח לטלפון או למורה.',
    ]} related={[{ label: 'כל הדפים להדפסה', href: '/printables' }, { label: 'חוברת הכנה לכיתה א׳', href: '/classroom/first-grade' }, { label: 'דפי עבודה לגן חובה', href: '/printables/kindergarten-worksheets' }]} /></div>
  </div>
}

// /bagrut — the practice bagrut exams (bagrut-* booklets, plus the English bagrut booklet), by subject and units.
const isBagrut = b => b.slug.startsWith('bagrut-') || b.slug === 'english-bagrut'
const bagrutSubject = b => b.subject.split(' —')[0]
export function BagrutHub() {
  const exams = BOOKLETS.filter(isBagrut)
  const ORDER = ['מתמטיקה', 'אנגלית', 'לשון', 'ספרות', 'תנ״ך', 'היסטוריה', 'אזרחות', 'ביולוגיה', 'כימיה', 'פיזיקה']
  const rank = s => (ORDER.indexOf(s) + 1) || 99
  const subjects = [...new Set(exams.map(bagrutSubject))].sort((a, b) => rank(a) - rank(b))
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="מבחני בגרות לתרגול להדפסה — PDF בחינם עם דף תשובות, לפי מקצוע ויחידות" description={`${exams.length} מבחני בגרות לתרגול בחינם: מתמטיקה 3, 4 ו־5 יחידות, לשון, ספרות, תנ״ך, היסטוריה, אזרחות, אנגלית, ביולוגיה, פיזיקה וכימיה. כל מבחן להדפסה או כ־PDF, עם דף תשובות.`} path="/bagrut" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, CRUMB, { label: 'מבחני בגרות לתרגול' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">🎓 </span>מבחני בגרות לתרגול</h1>
    <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מבחנים מקוריים במבנה הדומה לבחינות הבגרות, לפי מקצוע ומספר יחידות. מדפיסים, פותרים בזמן אמת, ובודקים בדף התשובות שבסוף.</p>
    {subjects.map(s => <section key={s} className="mb-8">
      <h2 className="mb-3 text-2xl font-bold">{s}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{exams.filter(b => bagrutSubject(b) === s).sort((x, y) => (x.units || 0) - (y.units || 0)).map(b => <Card key={b.slug} b={b} />)}</div>
    </section>)}
    <div className="mt-10"><SeoBody paragraphs={[
      'כל מבחן כאן נכתב במיוחד לתרגול: השאלות מקוריות, והמבנה דומה לבחינת הבגרות במקצוע — פרקים, ניקוד לכל שאלה וסעיפים. את הבחינות הרשמיות של השנים הקודמות מפרסם משרד החינוך באתר אגף הבחינות.',
      'הדרך הטובה לתרגל: להדפיס, לשבת עם שעון ובלי טלפון, לפתור כמו בבחינה, ורק בסוף לבדוק בדף התשובות. שאלות שלא הצלחתם — חוזרים לחומר ופותרים שוב אחרי כמה ימים.',
      'במתמטיקה יש מבחן לכל רמה: 3, 4 ו־5 יחידות (ב־5 יחידות שני שאלונים). במקצועות החובה — לשון, ספרות, תנ״ך, היסטוריה ואזרחות — מבחן ברמת 2 יחידות, ובמגמות המדעיות מבחן ברמת 5 יחידות.',
    ]} faq={[
      { q: 'האם אלה מבחנים אמיתיים של משרד החינוך?', a: 'לא. אלה מבחני תרגול מקוריים במבנה דומה. את הבחינות הרשמיות מפרסם משרד החינוך.' },
      { q: 'יש דף תשובות?', a: 'כן. בכל מבחן יש דף תשובות לפני העמוד האחרון, עם התשובה הסופית לכל סעיף.' },
      { q: 'אפשר להוריד כ־PDF?', a: 'כן. פותחים את המבחן, לוחצים על "הדפסה או PDF" ובוחרים לשמור כ־PDF.' },
    ]} related={[{ label: 'כל החוברות להדפסה', href: '/booklets' }, { label: 'חוברת מתמטיקה לתיכון', href: '/booklets/math-high-school' }, { label: 'חוברת אנגלית לבגרות', href: '/booklets/english-bagrut' }]} /></div>
  </div>
}

// Booklets made from a visitor's request (registry `onRequest`): say so, and offer ways to get the next one —
// the WhatsApp channel first, the weekly mail (the footer signup) second, and asking for a page of your own.
function RequestedBox() {
  return <section className="mt-8 rounded-3xl border-2 border-violet-200 bg-violet-50 p-5 text-center no-print" aria-label="הוכן לפי בקשה">
    <p className="text-xl font-black">💛 החוברת הזאת נולדה מבקשה ששלחו לנו באתר</p>
    <p className="mt-1">ככה זה עובד אצלנו: מבקשים — ואנחנו מכינים, בחינם, לכולם. רוצים לקבל את החוברת הבאה?</p>
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <a href={CHANNEL_GO} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center rounded-2xl bg-emerald-600 px-5 font-bold text-white hover:bg-emerald-700">📢 דף חדש כל יום בערוץ הוואטסאפ</a>
      <Link to="#mail-signup" className="inline-flex min-h-[48px] items-center rounded-2xl border-2 border-violet-300 bg-white px-5 font-bold">📬 הדפים של השבוע במייל</Link>
      <Link to="/request" className="inline-flex min-h-[48px] items-center rounded-2xl border-2 border-violet-300 bg-white px-5 font-bold">📝 גם לכם חסר משהו? בקשו</Link>
    </div>
  </section>
}

// In the print dialog: the whole booklet, a student copy (no answer key) or the answer key alone, and
// optionally only some pages. Page kinds come from the registry titles, so they apply only when the
// rendered booklet has exactly that many pages.
const MODES = [['all', 'החוברת המלאה'], ['student', 'לתלמיד — בלי דף התשובות'], ['teacher', 'למורה — רק דף התשובות']]
function usePageChoice(b) {
  const [mode, setMode] = useState('all'), [range, setRange] = useState('')
  const kinds = b.pages.map(pageKind), hasKey = kinds.includes('key')
  const wanted = parsePageRange(range, b.pages.length)
  const keepPage = mode === 'all' && !wanted ? undefined : (i, per) => {
    if (wanted && !wanted.has(i + 1)) return false
    if (mode === 'all' || per !== kinds.length) return true
    return mode === 'teacher' ? kinds[i] === 'key' : kinds[i] !== 'key'
  }
  const options = <div className="buga-page-options" dir="rtl">
    {hasKey && <label>מה להדפיס? <select value={mode} onChange={e => setMode(e.target.value)} data-booklet-mode>{MODES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>}
    <label>רק עמודים: <input value={range} onChange={e => setRange(e.target.value)} placeholder={`למשל 2-5, ${b.pages.length}`} inputMode="numeric" data-booklet-pages /></label>
    {wanted === false ? <span role="alert">כתבו מספרי עמודים בין 1 ל־{b.pages.length}, למשל 2-5, 9</span> : (wanted || mode !== 'all') && <output>מדפיסים {b.pages.filter((_, i) => keepPage(i, b.pages.length)).length} מתוך {b.pages.length} העמודים.</output>}
  </div>
  return { keepPage, options, reset: () => { setMode('all'); setRange('') } }
}

function BookletView({ b }) {
  const Booklet = useBooklet(b)
  const [seed, setSeed] = useState(null)
  const choice = usePageChoice(b)
  // Same subject first, then same stage — six at most (the hub has the rest).
  const others = BOOKLETS.filter(o => o.slug !== b.slug)
    .map(o => ({ o, score: (subjectOf(o) === subjectOf(b) ? 2 : 0) + (stageOf(o) === stageOf(b) ? 1 : 0) }))
    .filter(x => x.score > 0).sort((x, y) => y.score - x.score).slice(0, 6).map(x => x.o)
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title={b.seoTitle} description={b.description} path={bookletHref(b)} structuredData={faqSchema(b.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, CRUMB, { label: b.title }]} />
    <header className="rounded-[32px] border-2 border-[var(--border)] bg-[var(--postit)] p-6 text-center sketch-shadow-sm sm:p-10">
      <div className="text-6xl" aria-hidden="true">{b.emoji}</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">{b.title}</h1>
      <p className="mt-2 font-bold">{b.audience} · {b.subject} · {b.pages.length} עמודים · להדפסה או להורדה כ־PDF</p>
      <p className="mx-auto mt-3 max-w-2xl text-lg">{b.intro}</p>
      <button type="button" onClick={() => setSeed(newSeed())} className={`${button} mt-5 bg-violet-600 text-white shadow-[0_4px_0_#5b21b6]`}>📘 לחוברת המלאה — הדפסה או PDF</button>
    </header>
    <section className="mt-8" aria-label="מה יש בחוברת">
      <h2 className="text-2xl font-bold">מה יש בחוברת?</h2>
      <ol className="mt-3 grid list-decimal gap-x-8 gap-y-1 pr-6 sm:grid-cols-2">{b.pages.map(p => <li key={p}>{p}</li>)}</ol>
    </section>
    <section className="mt-8" aria-label="הצצה לעמודים הראשונים">
      <h2 className="text-2xl font-bold">הצצה לחוברת</h2>
      <div className="booklet-peek mt-3">{Booklet ? <Booklet seed={1} /> : <p>טוענים את העמודים…</p>}</div>
      <button type="button" onClick={() => setSeed(newSeed())} className={`${button} mt-4 bg-slate-900 text-white`}>🖨️ לכל {b.pages.length} העמודים</button>
    </section>
    {b.onRequest && <RequestedBox />}
    {seed && Booklet && <PrintPreview title={`${b.title} — ${b.pages.length} עמודים`} onClose={() => { setSeed(null); choice.reset() }} keepPage={choice.keepPage} options={choice.options}><Booklet seed={seed} /></PrintPreview>}
    {others.length > 0 && <section className="mt-10"><h2 className="text-2xl font-bold">חוברות נוספות</h2><div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{others.map(o => <Card key={o.slug} b={o} />)}</div></section>}
    <div className="mt-10"><SeoBody paragraphs={b.paragraphs} faq={b.faq} related={b.related} /></div>
  </div>
}

export function BookletPage() {
  const { slug } = useParams(), b = bookletBySlug(slug)
  return b ? <BookletView key={b.slug} b={b} /> : <NotFound />
}
