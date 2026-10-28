import { HDate } from '@hebcal/core'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { GAN_YEAR } from '../../data/kindergartenYear'
import { CHANNEL_GO } from '../../data/brand'

// Two entrances by audience: /gan for kindergarten teachers (this month in the gan first, then by area) and
// /classroom/by-grade for teachers (one card per grade). Only links to existing pages — tests/audience-hubs.test.mjs.

export const GAN_SECTIONS = [
  { emoji: '🔤', title: 'אותיות, צלילים ושפה', links: [['איפה שומעים את הצליל?', '/printables/sound-position'], ['כרטיסיות אותיות', '/printables/letter-flashcards'], ['פאזל מילה', '/printables/word-puzzles'], ['משחק אותיות לגן', '/letters/game'], ['דף שם לצביעה', '/printables/name-coloring'], ['אותיות למעבר בעיפרון', '/printables/hebrew-letters']] },
  { emoji: '🔢', title: 'מספרים וחשבון ראשון', links: [['מספרים למעבר בעיפרון', '/printables/numbers'], ['סרגל מספרים', '/printables/number-strip'], ['צביעה לפי מספרים', '/printables/color-by-number'], ['חוברת עבודה לגן חובה', '/booklets/kindergarten']] },
  { emoji: '😊', title: 'רגשות, חברה ותקשורת', links: [['כרטיסיות רגשות', '/printables/emotion-cards'], ['כרטיסי ויסות וסדר יום', '/printables/sensory-communication-cards'], ['שפה חברתית', '/speech/language/social'], ['קלינאות תקשורת — חומרים', '/speech']] },
  { emoji: '🎨', title: 'יצירה וצביעה', links: [['דפי צביעה', '/printables/coloring'], ['צביעה לפי אות', '/printables/color-by-letter'], ['מבוכים', '/printables/mazes'], ['אוריגמי לילדים', '/origami']] },
  { emoji: '🎮', title: 'משחקים', links: [['משחקים לגן', '/games/kindergarten'], ['איפה הצליל — אונליין', '/online-games/sound-position'], ['משחק זיכרון אותיות', '/online-games/memory-letters'], ['גלגל מזל', '/wheel']] },
  { emoji: '🗂️', title: 'ארגון הגן', links: [['השנה בגן — נושאים לפי חודשים', '/classroom/kindergarten-year-plan'], ['מדבקות שם', '/printables/name-labels'], ['טפסים ותכנון לגננת', '/printables/teacher-templates'], ['יומן גן אישי', '/printables/kindergarten-memory-book'], ['מסיבת סיום גן', '/ideas/kindergarten-graduation']] },
  { emoji: '🎒', title: 'מוכנים לכיתה א׳', links: [['הכנה לכיתה א׳', '/classroom/first-grade'], ['חוברת עבודה לגן חובה', '/booklets/kindergarten'], ['קוראים רק מה שלמדנו', '/letters/reading-practice']] },
]

const GRADE_NAMES = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳']
const GAMES = ['kita-a', 'kita-b', 'kita-g', 'kita-d', 'kita-h', 'kita-v']
const GIFTED = { 2: '/learn/gifted-test/grade-2', 3: '/learn/gifted-test/grade-3', 6: '/learn/gifted-test/grade-6' }
export const GRADE_CARDS = GRADE_NAMES.map((name, i) => {
  const n = i + 1
  return { n, name, links: [
    [`חשבון לכיתה ${name}`, `/math/grade-${n}`],
    [`הבנת הנקרא לכיתה ${name}`, `/learn/reading/grade-${n}`],
    ...(n === 1 ? [['קוראים רק מה שלמדנו', '/letters/reading-practice'], ['איפה שומעים את הצליל?', '/printables/sound-position']] : []),
    ...(n <= 4 ? [['הכתבה', '/learn/dictation']] : []),
    ...(n >= 3 ? [['אנגלית לפי כיתה', '/learn/english/by-grade']] : []),
    ...(n === 3 ? [['חוברת אנגלית לכיתה ג׳', '/booklets/english-grade-3']] : []),
    ...(GIFTED[n] ? [['הכנה למבחן מחוננים', GIFTED[n]]] : []),
    ...(GAMES[i] ? [[`משחקים לכיתה ${name}`, `/games/${GAMES[i]}`]] : []),
  ] }
})
export const TEACHER_TOOLS = [['בוגה לייב — חידון חי לכיתה', '/live'], ['מבחן אמריקאי אונליין', '/classroom/quiz'], ['שיעורי בית אינטראקטיביים', '/teachers'], ['מחולל תשבצים', '/tools/crossword-maker'], ['מחולל תפזורת', '/tools/word-search'], ['מחולל בינגו', '/tools/bingo-maker'], ['רשימת הכיתה שלי', '/classroom/roster'], ['דפי עבודה בחשבון', '/printables/math-worksheets'], ['לוח חופשות', '/school-holidays'], ['חוברות עבודה', '/booklets']]

const monthNow = () => { const m = new HDate().getMonthName(); return m.startsWith('Adar') ? 'Adar' : m }
const card = 'rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5'
const LinkList = ({ links }) => <ul className="mt-3 grid gap-1">{links.map(([label, to]) => <li key={to + label}><Link to={to} className="flex min-h-[44px] items-center rounded-xl px-2 font-bold hover:bg-[var(--muted)]/40">{label} <span aria-hidden="true" className="mr-auto text-slate-400">←</span></Link></li>)}</ul>

function Channel() {
  return <div className="mt-8 flex flex-wrap items-center justify-center gap-3 rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-5 text-center">
    <p className="text-lg font-bold">📢 דף חדש כל יום, ישר לוואטסאפ</p>
    <a href={CHANNEL_GO} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center rounded-2xl bg-emerald-600 px-5 font-bold text-white hover:bg-emerald-700">הצטרפו לערוץ</a>
    <Link to="/request" className="inline-flex min-h-[48px] items-center rounded-2xl border-2 border-violet-300 bg-white px-5 font-bold">חסר לכם דף? בקשו ונכין</Link>
  </div>
}

const GAN_FAQ = [
  { q: 'מה יש כאן לגננות?', a: 'כל מה שהאתר מציע לגן, מסודר לפי תחומים: אותיות וצלילים, מספרים, רגשות ותקשורת, יצירה, משחקים, ארגון הגן והכנה לכיתה א׳ — ובראש העמוד הנושאים של החודש העברי הנוכחי עם דפים מוכנים.' },
  { q: 'הכול בחינם?', a: 'כן. בלי הרשמה ובלי תשלום. מדפיסים, משחקים, ואפשר לבקש דף שחסר ואנחנו מכינים.' },
]
export function GanHub() {
  const now = monthNow(), i = Math.max(0, GAN_YEAR.findIndex(m => m.month === now)), m = GAN_YEAR[i], next = GAN_YEAR[(i + 1) % GAN_YEAR.length]
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="לגננת — דפי עבודה, משחקים ונושאים לגן לפי חודשים (חינם)" description="כל מה שצריך לגן במקום אחד: נושאי החודש בגן עם דפים מוכנים, אותיות וצלילים, מספרים, כרטיסיות רגשות, דפי צביעה, משחקים לגן, ארגון הגן והכנה לכיתה א׳. בחינם ובלי הרשמה." path="/gan" structuredData={faqSchema(GAN_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לגננת' }]} />
    <h1 className="text-center text-4xl font-black sm:text-5xl"><span aria-hidden="true">🧸 </span>לגננת — כל מה שצריך לגן</h1>
    <p className="mx-auto mt-2 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">נושאי החודש, דפים להדפסה ומשחקים — מסודרים לפי מה שעושים בגן. בחינם, בלי הרשמה.</p>
    <section aria-labelledby="gan-month" className="mt-8 rounded-3xl border-2 border-violet-400 bg-violet-50 p-5 shadow-[0_6px_0_#c4b5fd]">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="gan-month" className="text-2xl font-black"><span aria-hidden="true">{m.emoji}</span> החודש בגן: {m.name}</h2>
        <Link to="/classroom/kindergarten-year-plan" className="font-bold underline">כל השנה בגן ←</Link></div>
      <p className="mt-2"><b>נושאים:</b> {m.themes.join(' · ')}</p>
      <p className="mt-1"><b>רעיון לפעילות:</b> {m.idea}</p>
      <div className="mt-3 flex flex-wrap gap-2">{m.links.map(([label, to]) => <Link key={to} to={to} className="inline-flex min-h-[44px] items-center rounded-2xl border-2 border-violet-300 bg-white px-4 font-bold">{label}</Link>)}</div>
      <p className="mt-3 text-sm text-slate-600">ובחודש הבא, {next.name}: {next.themes.join(' · ')}</p>
    </section>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{GAN_SECTIONS.map(s => <section key={s.title} className={card}><h2 className="text-xl font-black"><span aria-hidden="true">{s.emoji}</span> {s.title}</h2><LinkList links={s.links} /></section>)}</div>
    <Channel />
    <div className="mt-10"><SeoBody paragraphs={[
      'העמוד הזה מרכז את כל מה שעוגה בוגה מציעה לגננות ולצוותי גן. בראש העמוד מופיעים הנושאים של החודש העברי הנוכחי — חגים, עונות ונושאים קבועים של שנת הגן — עם רעיון לפעילות ודפים מוכנים, והוא מתחלף לבד בכל ראש חודש.',
      'מתחת לזה הכול מסודר לפי תחומים: אותיות וצלילים למודעות פונולוגית, מספרים וחשבון ראשון, רגשות ותקשורת, יצירה, משחקים וארגון הגן. כל הדפים מוכנים להדפסה ב־A4, ורבים מהם מתחלפים בכל לחיצה, כך שאפשר להדפיס סט חדש לכל קבוצה.',
    ]} faq={GAN_FAQ} related={[{ label: 'למורה — לפי כיתה', href: '/classroom/by-grade' }, { label: 'מתחם לכיתה', href: '/classroom' }, { label: 'חגים ומועדים', href: '/holidays' }]} /></div>
  </div>
}

const TEACHER_FAQ = [
  { q: 'מה יש בעמוד למורה?', a: 'כרטיס לכל כיתה מא׳ עד ח׳ עם החומרים שמתאימים לה — חשבון לפי נושאים, הבנת הנקרא, הכתבה, אנגלית, הכנה למבחן מחוננים ומשחקים — ומתחת כלים לכל כיתה: חידון חי, מבחן אונליין, שיעורי בית ומחוללי דפים.' },
  { q: 'אפשר לשלוח לתלמידים לתרגול בבית?', a: 'כן. בשיעורי הבית האינטראקטיביים בונים משימות, שולחים קישור לכיתה ורואים מי סיים. רוב הדפים עובדים גם אונליין וגם להדפסה.' },
]
export function TeacherByGrade() {
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="למורה — דפי עבודה ותרגול לפי כיתה, א׳ עד ח׳ (חינם)" description="חומרים למורות ולמורים לפי כיתה: חשבון לפי נושאים, הבנת הנקרא, הכתבה, אנגלית, הכנה למבחן מחוננים ומשחקים לכיתה — ועוד כלים לכל כיתה: חידון חי, מבחן אונליין ושיעורי בית. בחינם." path="/classroom/by-grade" structuredData={faqSchema(TEACHER_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'למורה — לפי כיתה' }]} />
    <h1 className="text-center text-4xl font-black sm:text-5xl"><span aria-hidden="true">🧑‍🏫 </span>למורה — לפי כיתה</h1>
    <p className="mx-auto mt-2 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">בוחרים כיתה ומקבלים את כל מה שמתאים לה. בחינם, בלי הרשמה.</p>
    <nav aria-label="קפיצה לכיתה" className="mt-6 flex flex-wrap justify-center gap-2">{GRADE_CARDS.map(g => <a key={g.n} href={`#grade-${g.n}`} className="inline-flex min-h-[44px] min-w-[52px] items-center justify-center rounded-2xl border-2 border-[var(--border)] bg-white px-3 text-lg font-black">{g.name}</a>)}</nav>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{GRADE_CARDS.map(g => <section key={g.n} id={`grade-${g.n}`} className={card}><h2 className="text-2xl font-black">כיתה {g.name}</h2><LinkList links={g.links} /></section>)}</div>
    <section className={`${card} mt-6`}><h2 className="text-2xl font-black"><span aria-hidden="true">🧰</span> כלים לכל כיתה</h2>
      <ul className="mt-3 grid gap-1 sm:grid-cols-2">{TEACHER_TOOLS.map(([label, to]) => <li key={to}><Link to={to} className="flex min-h-[44px] items-center rounded-xl px-2 font-bold hover:bg-[var(--muted)]/40">{label} <span aria-hidden="true" className="mr-auto text-slate-400">←</span></Link></li>)}</ul></section>
    <Channel />
    <div className="mt-10"><SeoBody paragraphs={[
      'מורה מחפשת חומר לכיתה מסוימת, לא לנושא כללי. לכן בעמוד הזה כל כיתה מקבלת כרטיס משלה: חשבון לפי נושאי הכיתה עם הסבר, תרגול בשלוש רמות ומבחן, קטעי הבנת הנקרא מקוריים עם שאלות, הכתבה, אנגלית ומשחקים שמתאימים לגיל.',
      'מתחת לכרטיסים יש כלים שעובדים בכל כיתה: בוגה לייב — חידון חי שהתלמידים עונים עליו מהטלפון, מבחן אמריקאי שנבדק לבד, שיעורי בית אינטראקטיביים, ומחוללי תשבצים, תפזורות ובינגו.',
    ]} faq={TEACHER_FAQ} related={[{ label: 'לגננת', href: '/gan' }, { label: 'מתחם לכיתה', href: '/classroom' }, { label: 'מתמטיקה לפי כיתה', href: '/math' }]} /></div>
  </div>
}
