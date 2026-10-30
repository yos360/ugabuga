import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import NotFound from '../../pages/NotFound'
import { CURRICULUM_DOMAINS, CURRICULUM_STAGES, ENGLISH_GRADES, englishGrade, stageOf } from '../../data/englishCurriculum'
import { GRAMMAR_BANDS, grammarHref, topicsInBand } from '../../data/englishGrammar'
import { UNSEEN_LEVELS } from '../../data/unseen/levels'
import { levelHref, testsOf } from '../../data/unseen/library'
import { bookletBySlug, bookletHref } from '../../booklets/registry'
import { DICTATION_EN } from '../dictationEnglish'
import '../learn.css'
import '../subjects/subjects.css'

// /learn/english — English by grade, arranged by the Ministry of Education curriculum stages;
// /learn/english/grade-N — one grade: what the curriculum expects, then every piece of the site's
// material for it (grammar, unseen tests, booklet, reading with a dictionary, dictation, words and games).
const HUB = '/learn/english'
const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const crumbs = last => [{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, ...(last ? [{ label: 'אנגלית לפי כיתה', href: HUB }, { label: last }] : [{ label: 'אנגלית לפי כיתה' }])]
const box = 'rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5'

const HUB_FAQ = [
  { q: 'מאיזו כיתה לומדים אנגלית בישראל?', a: 'לפי תוכנית הלימודים הלימוד הסדיר מתחיל בכיתה ג׳, ובהרבה בתי ספר מתחילים כבר בכיתות א׳–ב׳ בעל פה. בסוף כיתה ו׳ מגיעים לרמת יסוד (Foundation), בסוף ט׳ לרמת ביניים (Intermediate) ובתיכון לרמת שליטה (Proficiency) ולבגרות.' },
  { q: 'מה יש כאן לכל כיתה?', a: 'לכל כיתה יש עמוד עם מה שלומדים בה לפי התוכנית, נושאי הדקדוק עם הסבר וחידון, אנסינים לתרגול ולמבחן, חוברת עבודה להדפסה, קטעי קריאה עם מילון לכל מילה, ובכיתות ג׳–ו׳ גם רשימות הכתבה.' },
  { q: 'הכול בחינם?', a: 'כן. כל החומרים בחינם ובלי הרשמה, להדפסה או לתרגול באתר.' },
  { q: 'זו התוכנית הרשמית של משרד החינוך?', a: 'העמודים מסודרים לפי השלבים והתחומים של תוכנית הלימודים באנגלית, אבל החומרים עצמם נכתבו כאן. כל מורה בונה את הסדר שלו, ולכן כדאי לבדוק מול המחברת והמורה.' },
]

export function EnglishGradesHub() {
  return <Page>
    <SEO title="אנגלית לפי כיתה — לפי תוכנית משרד החינוך, מכיתה א׳ ועד הבגרות" description="אנגלית לכל כיתה מא׳ ועד י״ב לפי שלבי תוכנית הלימודים: מה לומדים, דקדוק עם חידונים, אנסינים ומבחנים, חוברת להדפסה וקטעי קריאה עם מילון — בחינם." path={HUB} structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={crumbs()} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🇬🇧 </span>אנגלית לפי כיתה</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">לפי תוכנית הלימודים של משרד החינוך · מכיתה א׳ ועד הבגרות</p>
    {CURRICULUM_STAGES.map(s => <section key={s.id} className="mb-6 rounded-3xl border-2 border-[var(--border)] p-5" style={{ background: s.color }} aria-labelledby={`st-${s.id}`}>
      <h2 id={`st-${s.id}`} className="text-2xl font-black">{s.label} <bdi dir="ltr" className="text-lg font-bold opacity-70">{s.en}</bdi></h2>
      <p className="mt-1">{s.about}</p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">{ENGLISH_GRADES.filter(x => x.stage === s.id).map(x => <li key={x.n}>
        <Link to={`${HUB}/${x.slug}`} className="block h-full rounded-2xl border-2 border-white/70 bg-white p-4 card-lift">
          <b className="text-xl">אנגלית ל{x.name}</b><p className="mt-1 text-[var(--muted-foreground)]">{x.focus}</p>
        </Link></li>)}</ul>
    </section>)}
    <section className={`${box} mt-8`} aria-labelledby="domains-h">
      <h2 id="domains-h" className="text-2xl font-black">ארבעת התחומים שלומדים בכל כיתה</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">{CURRICULUM_DOMAINS.map(([e, t, d]) => <li key={t}><b>{e} {t}</b> — {d}</li>)}</ul>
    </section>
    <div className="mt-6 flex flex-wrap justify-center gap-2">
      <Link to="/learn/english-grammar" className="ln-chip">📘 דקדוק באנגלית</Link>
      <Link to="/unseen/english" className="ln-chip">📝 אנסין באנגלית</Link>
      <Link to="/learn/english-reading" className="ln-chip">📖 קריאה עם מילון</Link>
      <Link to="/booklets" className="ln-chip">📚 חוברות להדפסה</Link>
      <Link to="/english" className="ln-chip">🎮 מילים ומשחקים</Link>
    </div>
    <div className="mt-10"><SeoBody paragraphs={['תוכנית הלימודים באנגלית בישראל מחולקת לשלבים: התחלה מוקדמת בכיתות א׳–ב׳, רמת יסוד עד סוף כיתה ו׳, רמת ביניים עד סוף ט׳ ורמת שליטה בתיכון, שבסופה הבגרות. בכל שלב עובדים על ארבעה תחומים: אינטראקציה חברתית, גישה למידע, הצגה, וספרות, תרבות ושפה.', 'בכל עמוד כיתה ריכזנו את מה שצריך כדי להתכונן למבחן: הסבר של נושאי הדקדוק, אנסינים עם הסבר לכל תשובה, חוברת להדפסה עם דף תשובות, וקטעי קריאה שבהם אפשר ללחוץ על כל מילה ולראות את הפירוש בעברית.']} faq={HUB_FAQ} related={[{ label: 'דקדוק באנגלית לפי כיתה', href: '/learn/english-grammar' }, { label: 'אנסין באנגלית', href: '/unseen/english' }, { label: 'אנגלית לילדים — מילים ומשחקים', href: '/english' }]} /></div>
  </Page>
}

function GradeView({ grade }) {
  const stage = stageOf(grade)
  const band = GRAMMAR_BANDS.find(b => b.id === grade.grammar)
  const topics = band ? topicsInBand(band.id) : []
  const level = UNSEEN_LEVELS.find(l => l.lang === 'en' && l.path === grade.unseen)
  const tests = level ? testsOf('en', level.id) : []
  const booklet = grade.booklet && bookletBySlug(grade.booklet)
  const dictation = grade.dictation ? DICTATION_EN.filter(d => d.grade === grade.dictation) : []
  const prev = ENGLISH_GRADES.find(x => x.n === grade.n - 1), next = ENGLISH_GRADES.find(x => x.n === grade.n + 1)
  const faq = [
    { q: `מה לומדים באנגלית ב${grade.name}?`, a: `${grade.focus} ${grade.goals.join('; ')}.` },
    { q: `איך מתכוננים למבחן באנגלית ב${grade.name}?`, a: `${topics.length ? 'עוברים על נושאי הדקדוק — קוראים את ההסבר ועושים את החידון. ' : ''}${tests.length ? 'פותרים אנסין במצב תרגול ואחר כך במצב מבחן עם טיימר. ' : ''}${booklet ? 'מדפיסים את החוברת ופותרים בלי עזרה, ובודקים מול דף התשובות.' : ''}` },
    { q: 'זה לפי תוכנית משרד החינוך?', a: `העמוד מסודר לפי שלב "${stage.label}" (${stage.en}) בתוכנית הלימודים באנגלית. החומרים נכתבו כאן, וכדאי לבדוק את סדר הנושאים מול המורה.` },
  ]
  return <Page>
    <SEO title={`אנגלית ל${grade.name} — חומר למבחן, דקדוק, אנסין וחוברת`} description={`אנגלית ל${grade.name} לפי תוכנית הלימודים: ${grade.focus} דקדוק עם חידונים, ${tests.length ? `${tests.length} אנסינים, ` : ''}חוברת להדפסה וקריאה עם מילון — בחינם.`} path={`${HUB}/${grade.slug}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={crumbs(grade.name)} />
    <header className="rounded-[32px] border-2 border-[var(--border)] p-6 text-center sm:p-8" style={{ background: stage.color }}>
      <p className="font-bold">{stage.label} · <bdi dir="ltr">{stage.en}</bdi></p>
      <h1 className="mt-1 text-4xl sm:text-5xl">אנגלית ל{grade.name}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg">{grade.focus}</p>
    </header>

    <section className={`${box} mt-6`} aria-labelledby="goals-h">
      <h2 id="goals-h" className="text-2xl font-black">🎯 מה לומדים השנה</h2>
      <ul className="mt-2 list-disc space-y-1 pr-6">{grade.goals.map(x => <li key={x}>{x}</li>)}</ul>
      <p className="mt-3"><b>נושאי אוצר מילים:</b> {grade.vocab.join(' · ')}</p>
    </section>

    {booklet && <section className={`${box} mt-6`} aria-labelledby="booklet-h">
      <h2 id="booklet-h" className="text-2xl font-black">📒 החוברת של {grade.name}</h2>
      <Link to={bookletHref(booklet)} className="mt-3 flex items-center gap-4 rounded-2xl bg-violet-50 p-4 card-lift">
        <span className="text-5xl" aria-hidden="true">{booklet.emoji}</span>
        <span><b className="text-xl">{booklet.title}</b><br /><span className="text-[var(--muted-foreground)]">{booklet.pages.length} עמודים · להדפסה או PDF · עם דף תשובות</span></span>
      </Link>
    </section>}

    {topics.length > 0 && <section className={`${box} mt-6`} aria-labelledby="grammar-h">
      <h2 id="grammar-h" className="text-2xl font-black">📘 דקדוק — {band.label}</h2>
      <p className="text-[var(--muted-foreground)]">הסבר בעברית, טעויות נפוצות, חידון ודף עבודה לכל נושא.</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">{topics.map(t => <li key={t.slug}><Link to={grammarHref(t)} className="block rounded-xl border-2 border-[var(--border)] bg-white p-3 font-bold card-lift">{t.emoji} {t.title} <bdi dir="ltr" className="font-normal text-[var(--muted-foreground)]">{t.en}</bdi></Link></li>)}</ul>
    </section>}

    {level && <section className={`${box} mt-6`} aria-labelledby="unseen-h">
      <h2 id="unseen-h" className="text-2xl font-black">📝 אנסין ומבחנים — {level.name}</h2>
      <p className="text-[var(--muted-foreground)]">{level.about} כל אנסין במצב תרגול עם הסבר, או במצב מבחן עם טיימר של {level.minutes} דקות.</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">{tests.slice(0, 8).map(t => <li key={t.slug}><Link to={`/unseen/english/${t.slug}`} className="block rounded-xl border-2 border-[var(--border)] bg-white p-3 card-lift"><bdi dir="ltr" className="font-bold">{t.title}</bdi></Link></li>)}</ul>
      <Link to={levelHref(level)} className="mt-3 inline-block font-bold underline">לכל {tests.length} האנסינים של {level.name} ←</Link>
      {grade.n >= 10 && <p className="mt-2">מודולים נוספים: {UNSEEN_LEVELS.filter(l => l.lang === 'en' && l.id.startsWith('mod-') && l.path !== grade.unseen).map(l => <Link key={l.id} to={levelHref(l)} className="ln-chip ml-1">{l.name}</Link>)}</p>}
    </section>}

    <section className={`${box} mt-6`} aria-labelledby="more-h">
      <h2 id="more-h" className="text-2xl font-black">✨ עוד לתרגול</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {grade.n >= 3 && <Link to="/learn/english-reading" className="ln-chip">📖 קטעי קריאה עם מילון לכל מילה</Link>}
        {dictation.length > 0 && <Link to="/learn/dictation/english" className="ln-chip">✍️ הכתבה — {dictation.length} רשימות ל{grade.name}</Link>}
        {grade.n <= 6 && <Link to="/english" className="ln-chip">🎮 מילים ומשחקים</Link>}
        {grade.n <= 4 && <Link to="/abc" className="ln-chip">🔤 אותיות A–Z</Link>}
        {grade.n <= 6 && <Link to="/learn/flashcards" className="ln-chip">🃏 כרטיסיות</Link>}
        <Link to="/dictionary" className="ln-chip">📘 מילון אנגלית–עברית</Link>
        {grade.n >= 7 && <Link to="/typing/english" className="ln-chip">⌨️ הקלדה באנגלית</Link>}
      </div>
    </section>

    <nav className="mt-8 flex justify-between gap-2" aria-label="כיתות">
      {prev ? <Link to={`${HUB}/${prev.slug}`} className="ln-chip">→ {prev.name}</Link> : <span />}
      <Link to={HUB} className="ln-chip">כל הכיתות</Link>
      {next ? <Link to={`${HUB}/${next.slug}`} className="ln-chip">{next.name} ←</Link> : <span />}
    </nav>
    <div className="mt-10"><SeoBody paragraphs={[`${grade.name} נמצאת בשלב "${stage.label}" של תוכנית הלימודים באנגלית. ${stage.about}`]} faq={faq} related={[{ label: 'אנגלית לפי כיתה', href: HUB }, { label: 'דקדוק באנגלית', href: '/learn/english-grammar' }, { label: 'אנסין באנגלית', href: '/unseen/english' }]} /></div>
  </Page>
}

export function EnglishGradePage() {
  const { grade } = useParams(), g = englishGrade(grade)
  return g ? <GradeView key={g.slug} grade={g} /> : <NotFound />
}
