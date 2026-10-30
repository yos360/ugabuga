import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import NotFound from '../../pages/NotFound'
import { CURRICULUM_DOMAINS, CURRICULUM_STAGES, ENGLISH_GRADES, englishGrade, stageOf } from '../../data/englishCurriculum'
import { GRAMMAR_BANDS, grammarHref, topicsInBand } from '../../data/englishGrammar'
import { readingHref, storiesInBand } from '../../data/englishReading'
import { ENGLISH_TOPICS } from '../../data/englishWords'
import { UNSEEN_LEVELS } from '../../data/unseen/levels'
import { levelHref, testsOf } from '../../data/unseen/library'
import { bookletBySlug, bookletHref } from '../../booklets/registry'
import { DICTATION_EN } from '../dictationEnglish'
import '../learn.css'

// /learn/english and /learn/english/grade-N — one dashboard (like IXL): pick a grade at the top and
// everything for it is on one screen, in columns: the booklet and the year's goals, grammar, unseen
// tests, reading with a dictionary, dictation and words & games. Arranged by the curriculum stages.
const HUB = '/learn/english'
const LAST_KEY = 'ugabuga:english-grade'
const READING_BAND = { 3: 'g3-4', 4: 'g3-4', 5: 'g5-6', 6: 'g5-6', 7: 'g7-8', 8: 'g7-8', 9: 'g9', 10: 'g10-12', 11: 'g10-12', 12: 'g10-12' }

const HUB_FAQ = [
  { q: 'מאיזו כיתה לומדים אנגלית בישראל?', a: 'לפי תוכנית הלימודים הלימוד הסדיר מתחיל בכיתה ג׳, ובהרבה בתי ספר מתחילים כבר בכיתות א׳–ב׳ בעל פה. בסוף כיתה ו׳ מגיעים לרמת יסוד (Foundation), בסוף ט׳ לרמת ביניים (Intermediate) ובתיכון לרמת שליטה (Proficiency) ולבגרות.' },
  { q: 'מה יש כאן לכל כיתה?', a: 'בוחרים כיתה למעלה, ורואים הכול במסך אחד: החוברת של הכיתה, נושאי הדקדוק עם הסבר וחידון, אנסינים לתרגול ולמבחן, קטעי קריאה עם מילון לכל מילה, רשימות הכתבה ומשחקי מילים.' },
  { q: 'הכול בחינם?', a: 'כן. כל החומרים בחינם ובלי הרשמה, להדפסה או לתרגול באתר.' },
  { q: 'זו התוכנית הרשמית של משרד החינוך?', a: 'העמודים מסודרים לפי השלבים והתחומים של תוכנית הלימודים באנגלית, אבל החומרים עצמם נכתבו כאן. כל מורה בונה את הסדר שלו, ולכן כדאי לבדוק מול המחברת והמורה.' },
]

// One column of the dashboard: a title and a compact list of links.
function Column({ icon, title, more, items, empty, children }) {
  return <section className="flex flex-col rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-4" aria-label={title}>
    <h2 className="text-xl font-black"><span aria-hidden="true">{icon} </span>{title}</h2>
    {children}
    {items?.length > 0 && <ul className="mt-2 flex-1 space-y-1">{items.map(x => <li key={x.to}>
      <Link to={x.to} className="flex items-baseline gap-2 rounded-lg px-2 py-1 hover:bg-[var(--postit)]">
        {x.emoji && <span aria-hidden="true">{x.emoji}</span>}
        <span className="font-bold">{x.label}</span>{x.sub && <bdi dir="ltr" className="text-sm text-[var(--muted-foreground)]">{x.sub}</bdi>}
      </Link></li>)}</ul>}
    {!items?.length && empty && <p className="mt-2 text-[var(--muted-foreground)]">{empty}</p>}
    {more && <Link to={more.to} className="mt-3 font-bold underline">{more.label} ←</Link>}
  </section>
}

function Dashboard({ grade }) {
  const stage = stageOf(grade)
  const band = GRAMMAR_BANDS.find(b => b.id === grade.grammar)
  const level = UNSEEN_LEVELS.find(l => l.lang === 'en' && l.path === grade.unseen)
  const tests = level ? testsOf('en', level.id) : []
  const stories = READING_BAND[grade.n] ? storiesInBand(READING_BAND[grade.n]) : []
  const booklet = grade.booklet && bookletBySlug(grade.booklet)
  const dictation = grade.dictation ? DICTATION_EN.filter(d => d.grade === grade.dictation) : []
  const young = grade.n <= 4
  return <>
    <nav className="mt-4 flex flex-wrap justify-center gap-2" aria-label="בחירת כיתה">
      {ENGLISH_GRADES.map(x => <Link key={x.n} to={`${HUB}/${x.slug}`} aria-current={x.n === grade.n ? 'page' : undefined}
        className={`min-h-[44px] min-w-[52px] rounded-2xl border-2 px-3 py-2 text-center text-lg font-black ${x.n === grade.n ? 'border-violet-600 bg-violet-600 text-white' : 'border-[var(--border)] bg-white hover:border-violet-300'}`}>
        {x.name.replace('כיתה ', '')}</Link>)}
    </nav>
    <div className="mt-4 rounded-3xl border-2 border-[var(--border)] p-4 text-center" style={{ background: stage.color }}>
      <p className="text-2xl font-black">אנגלית ל{grade.name} <span className="text-base font-bold opacity-75">· {stage.label} · <bdi dir="ltr">{stage.en}</bdi></span></p>
      <p className="mt-1">{grade.focus}</p>
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Column icon="🎯" title="מה לומדים השנה">
        <ul className="mt-2 list-disc space-y-1 pr-5">{grade.goals.map(x => <li key={x}>{x}</li>)}</ul>
        <p className="mt-2 text-sm"><b>מילים:</b> {grade.vocab.join(' · ')}</p>
        {booklet && <Link to={bookletHref(booklet)} className="mt-3 flex items-center gap-3 rounded-2xl bg-violet-50 p-3 hover:bg-violet-100">
          <span className="text-4xl" aria-hidden="true">{booklet.emoji}</span>
          <span><b>החוברת של {grade.name}</b><br /><span className="text-sm text-[var(--muted-foreground)]">{booklet.pages.length} עמודים · הדפסה או PDF · עם תשובות</span></span>
        </Link>}
      </Column>
      {band && <Column icon="📘" title="דקדוק" more={{ to: '/learn/english-grammar', label: 'כל נושאי הדקדוק' }}
        items={topicsInBand(band.id).map(t => ({ to: grammarHref(t), emoji: t.emoji, label: t.title, sub: t.en }))} />}
      {level && <Column icon="📝" title={`אנסין ומבחנים — ${tests.length}`} more={{ to: levelHref(level), label: `לכל האנסינים של ${level.name}` }}
        items={tests.slice(0, 10).map(t => ({ to: `/unseen/english/${t.slug}`, label: t.title }))}>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">תרגול עם הסבר לכל תשובה, או מבחן עם טיימר של {level.minutes} דקות.</p>
      </Column>}
      {stories.length > 0 && <Column icon="📖" title="קריאה עם מילון לכל מילה" more={{ to: '/learn/english-reading', label: 'כל קטעי הקריאה' }}
        items={stories.map(s => ({ to: readingHref(s), emoji: s.emoji, label: s.title }))}>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">לוחצים על מילה — רואים פירוש ושומעים אותה.</p>
      </Column>}
      {young && <Column icon="🎮" title="מילים ומשחקים" more={{ to: '/english', label: 'כל נושאי המילים' }}
        items={ENGLISH_TOPICS.slice(0, 12).map(t => ({ to: `/english/${t.slug}`, emoji: t.emoji, label: t.title }))} />}
      <Column icon="✨" title="עוד לתרגול" items={[
        ...(dictation.length ? [{ to: '/learn/dictation/english', emoji: '✍️', label: `הכתבה — ${dictation.length} רשימות` }] : []),
        ...(grade.n <= 4 ? [{ to: '/abc', emoji: '🔤', label: 'אותיות A–Z' }, { to: '/printables/abc-letters', emoji: '✏️', label: 'אותיות לכתיבה' }] : []),
        ...(grade.n <= 6 ? [{ to: '/learn/flashcards', emoji: '🃏', label: 'כרטיסיות' }, { to: '/online-games/memory-english', emoji: '🧠', label: 'משחק זיכרון באנגלית' }] : []),
        ...(!young ? [{ to: '/english', emoji: '🎮', label: 'מילים ומשחקים' }] : []),
        { to: '/dictionary', emoji: '📗', label: 'מילון אנגלית–עברית' },
        ...(grade.n >= 5 ? [{ to: '/typing/english', emoji: '⌨️', label: 'הקלדה באנגלית' }] : []),
      ]} />
    </div>
  </>
}

export function EnglishGradesHub() {
  // The hub opens on the grade the visitor looked at last (default: ג׳, the first school year of English).
  const [n, setN] = useState(3)
  useEffect(() => { try { const v = Number(localStorage.getItem(LAST_KEY)); if (v >= 1 && v <= 12) setN(v) } catch { /* storage blocked */ } }, [])
  const grade = ENGLISH_GRADES.find(x => x.n === n)
  return <div className="mx-auto max-w-6xl px-4 py-6" dir="rtl">
    <SEO title="אנגלית לפי כיתה — לפי תוכנית משרד החינוך, מכיתה א׳ ועד הבגרות" description="אנגלית לכל כיתה מא׳ ועד י״ב במסך אחד: דקדוק עם חידונים, אנסינים ומבחנים, חוברת להדפסה, קריאה עם מילון והכתבה — לפי תוכנית הלימודים, בחינם." path={HUB} structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, { label: 'אנגלית לפי כיתה' }]} />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">🇬🇧 </span>אנגלית לפי כיתה</h1>
    <p className="text-center text-lg text-[var(--muted-foreground)]">בוחרים כיתה — והכול מול העיניים · לפי תוכנית הלימודים של משרד החינוך</p>
    <Dashboard grade={grade} />
    <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="שלבי התוכנית">
      {CURRICULUM_STAGES.map(s => <div key={s.id} className="rounded-2xl p-3 text-sm" style={{ background: s.color }}><b>{s.label} (<bdi dir="ltr">{s.en}</bdi>)</b> — {s.about}</div>)}
    </section>
    <div className="mt-8"><SeoBody paragraphs={['תוכנית הלימודים באנגלית בישראל מחולקת לשלבים: התחלה מוקדמת בכיתות א׳–ב׳, רמת יסוד עד סוף כיתה ו׳, רמת ביניים עד סוף ט׳ ורמת שליטה בתיכון, שבסופה הבגרות. בכל שלב עובדים על ארבעה תחומים: ' + CURRICULUM_DOMAINS.map(d => d[1]).join(', ') + '.']} faq={HUB_FAQ} related={[{ label: 'דקדוק באנגלית לפי כיתה', href: '/learn/english-grammar' }, { label: 'אנסין באנגלית', href: '/unseen/english' }, { label: 'אנגלית לילדים — מילים ומשחקים', href: '/english' }]} /></div>
  </div>
}

function GradeView({ grade }) {
  const stage = stageOf(grade)
  useEffect(() => { try { localStorage.setItem(LAST_KEY, String(grade.n)) } catch { /* storage blocked */ } }, [grade.n])
  const faq = [
    { q: `מה לומדים באנגלית ב${grade.name}?`, a: `${grade.focus} ${grade.goals.join('; ')}.` },
    { q: `איך מתכוננים למבחן באנגלית ב${grade.name}?`, a: 'עוברים על נושאי הדקדוק — קוראים את ההסבר ועושים את החידון — פותרים אנסין במצב תרגול ואחר כך במצב מבחן, ומדפיסים את החוברת ובודקים מול דף התשובות.' },
    { q: 'זה לפי תוכנית משרד החינוך?', a: `העמוד מסודר לפי שלב "${stage.label}" (${stage.en}) בתוכנית הלימודים באנגלית. החומרים נכתבו כאן, וכדאי לבדוק את סדר הנושאים מול המורה.` },
  ]
  return <div className="mx-auto max-w-6xl px-4 py-6" dir="rtl">
    <SEO title={`אנגלית ל${grade.name} — חומר למבחן, דקדוק, אנסין וחוברת`} description={`אנגלית ל${grade.name} לפי תוכנית הלימודים, הכול במסך אחד: ${grade.focus} דקדוק עם חידונים, אנסינים, חוברת להדפסה וקריאה עם מילון — בחינם.`} path={`${HUB}/${grade.slug}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, { label: 'אנגלית לפי כיתה', href: HUB }, { label: grade.name }]} />
    <h1 className="sr-only">אנגלית ל{grade.name}</h1>
    <Dashboard grade={grade} />
    <div className="mt-8"><SeoBody paragraphs={[`${grade.name} נמצאת בשלב "${stage.label}" של תוכנית הלימודים באנגלית. ${stage.about}`]} faq={faq} related={[{ label: 'אנגלית לפי כיתה', href: HUB }, { label: 'דקדוק באנגלית', href: '/learn/english-grammar' }, { label: 'אנסין באנגלית', href: '/unseen/english' }]} /></div>
  </div>
}

export function EnglishGradePage() {
  const { grade } = useParams(), g = englishGrade(grade)
  return g ? <GradeView key={g.slug} grade={g} /> : <NotFound />
}
