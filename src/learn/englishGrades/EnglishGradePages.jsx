import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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

// /learn/english — big subject tiles (vocabulary, verbs & grammar, reading, unseen, writing, booklet,
// games) and a row of grades: pick a grade and a tile, in either order, and you land on exactly that
// material: /learn/english/grade-N/<tile>. /learn/english/grade-N shows the tiles for one grade.
// Arranged by the curriculum stages (early start, Foundation, Intermediate, Proficiency).
const HUB = '/learn/english'
const LAST_KEY = 'ugabuga:english-grade'
const READING_BAND = { 3: 'g3-4', 4: 'g3-4', 5: 'g5-6', 6: 'g5-6', 7: 'g7-8', 8: 'g7-8', 9: 'g9', 10: 'g10-12', 11: 'g10-12', 12: 'g10-12' }
const gradeHref = g => `${HUB}/${g.slug}`

// The tiles. `count` says how much there is for a grade (0 hides the tile for that grade).
const level = g => UNSEEN_LEVELS.find(l => l.lang === 'en' && l.path === g.unseen)
const TILES = [
  { id: 'vocabulary', icon: '🔤', title: 'אוצר מילים', sub: 'מילים לפי נושאים, עם קול וכרטיסיות', color: '#fde68a', count: () => 1 },
  { id: 'grammar', icon: '📘', title: 'פעלים ודקדוק', sub: 'זמנים, פעלים וכללים — הסבר וחידון', color: '#bfdbfe', count: g => (g.grammar ? topicsInBand(g.grammar).length : 0) },
  { id: 'reading', icon: '📖', title: 'קריאה עם מילון', sub: 'לוחצים על מילה ורואים פירוש', color: '#bbf7d0', count: g => (READING_BAND[g.n] ? storiesInBand(READING_BAND[g.n]).length : 0) },
  { id: 'unseen', icon: '📝', title: 'אנסין ומבחנים', sub: 'תרגול עם הסבר, או מבחן עם טיימר', color: '#fecaca', count: g => (level(g) ? testsOf('en', level(g).id).length : 0) },
  { id: 'practice', icon: '✍️', title: 'כתיבה והכתבה', sub: 'אותיות, הכתבה, הקלדה ומילון', color: '#e9d5ff', count: () => 1 },
  { id: 'booklet', icon: '📒', title: 'החוברת של הכיתה', sub: 'להדפסה או PDF, עם תשובות', color: '#fed7aa', count: g => (g.booklet && bookletBySlug(g.booklet) ? 1 : 0) },
  { id: 'games', icon: '🎮', title: 'משחקים', sub: 'משחקי מילים, זיכרון וטריוויה', color: '#a5f3fc', count: g => (g.n <= 9 ? 1 : 0) },
]
const tileFor = id => TILES.find(t => t.id === id)
const tileHref = (g, t) => (t.id === 'booklet' ? bookletHref(bookletBySlug(g.booklet)) : `${HUB}/${g.slug}/${t.id}`)

function GradeRow({ current, cat }) {
  return <nav className="sticky top-0 z-10 -mx-2 mt-4 flex flex-wrap justify-center gap-2 bg-[var(--background)]/90 px-2 py-2 backdrop-blur" aria-label="בחירת כיתה">
    {ENGLISH_GRADES.map(x => {
      const on = x.n === current?.n, t = cat && tileFor(cat)
      const to = t && t.count(x) ? tileHref(x, t) : gradeHref(x)
      return <Link key={x.n} to={to} aria-current={on ? 'page' : undefined}
        className={`min-h-[48px] min-w-[54px] rounded-2xl border-2 px-3 py-2 text-center text-lg font-black transition ${on ? 'border-violet-600 bg-violet-600 text-white scale-110' : 'border-[var(--border)] bg-white hover:border-violet-400'}`}>
        {x.name.replace('כיתה ', '')}</Link>
    })}
  </nav>
}

// Columns that keep the tiles symmetric: rows as even as possible, a short last row centred (learn.css).
const tileCols = n => `tile-cols-${n <= 4 ? n : n <= 6 ? 3 : 4}`

function Tiles({ grade, onPick }) {
  const tiles = grade ? TILES.filter(t => t.count(grade)) : TILES
  return <div className={`tile-grid mt-5 ${tileCols(tiles.length)}`}>
    {tiles.map(t => {
      const inner = <>
        <span className="text-5xl sm:text-6xl" aria-hidden="true">{t.icon}</span>
        <b className="mt-2 text-xl sm:text-2xl">{t.title}</b>
        <span className="mt-1 text-sm opacity-80">{t.sub}</span>
        {grade && t.count(grade) > 1 && <span className="mt-2 rounded-full bg-white/80 px-3 text-sm font-bold">{t.count(grade)} ל{grade.name}</span>}
      </>
      const cls = 'flex min-h-[170px] flex-col items-center justify-center rounded-[28px] border-2 border-white/60 p-4 text-center shadow-[0_6px_0_rgba(0,0,0,.08)] transition hover:-translate-y-1 hover:shadow-[0_10px_0_rgba(0,0,0,.08)]'
      return grade
        ? <Link key={t.id} to={tileHref(grade, t)} className={cls} style={{ background: t.color }}>{inner}</Link>
        : <button key={t.id} type="button" onClick={() => onPick(t.id)} className={cls} style={{ background: t.color }}>{inner}</button>
    })}
  </div>
}

const HUB_FAQ = [
  { q: 'איך מוצאים חומר באנגלית לכיתה מסוימת?', a: 'בוחרים כיתה בשורה למעלה ולוחצים על הריבוע של מה שרוצים — אוצר מילים, פעלים ודקדוק, קריאה, אנסין, כתיבה, חוברת או משחקים. אפשר גם הפוך: קודם ריבוע ואז כיתה.' },
  { q: 'מאיזו כיתה לומדים אנגלית בישראל?', a: 'לפי תוכנית הלימודים הלימוד הסדיר מתחיל בכיתה ג׳, ובהרבה בתי ספר מתחילים כבר בכיתות א׳–ב׳ בעל פה. בסוף כיתה ו׳ מגיעים לרמת יסוד (Foundation), בסוף ט׳ לרמת ביניים (Intermediate) ובתיכון לרמת שליטה (Proficiency) ולבגרות.' },
  { q: 'הכול בחינם?', a: 'כן. כל החומרים בחינם ובלי הרשמה, להדפסה או לתרגול באתר.' },
  { q: 'זו התוכנית הרשמית של משרד החינוך?', a: 'העמודים מסודרים לפי השלבים והתחומים של תוכנית הלימודים באנגלית, אבל החומרים עצמם נכתבו כאן. כדאי לבדוק את סדר הנושאים מול המורה.' },
]
const Wrap = ({ children }) => <div className="mx-auto max-w-6xl px-4 py-6" dir="rtl">{children}</div>
const crumbs = (...rest) => [{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, ...rest]

export function EnglishGradesHub() {
  const navigate = useNavigate()
  const [pending, setPending] = useState(null)
  const [last, setLast] = useState(null)
  useEffect(() => { try { const v = Number(localStorage.getItem(LAST_KEY)); if (v >= 1 && v <= 12) setLast(ENGLISH_GRADES.find(x => x.n === v)) } catch { /* storage blocked */ } }, [])
  // A tile first: remember it and ask for the grade; a grade first: the grade's own page.
  const pick = id => { if (last && tileFor(id).count(last)) navigate(tileHref(last, tileFor(id))); else setPending(id) }
  return <Wrap>
    <SEO title="אנגלית לפי כיתה — אוצר מילים, דקדוק, קריאה, אנסין וחוברות, מכיתה א׳ ועד הבגרות" description="אנגלית לכל כיתה מא׳ ועד י״ב: בוחרים כיתה ונושא — אוצר מילים, פעלים ודקדוק, קריאה עם מילון, אנסין ומבחנים, כתיבה, חוברת ומשחקים. לפי תוכנית הלימודים, בחינם." path={HUB} structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={crumbs({ label: 'אנגלית לפי כיתה' })} />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">🇬🇧 </span>לומדים אנגלית</h1>
    <p className="text-center text-lg text-[var(--muted-foreground)]">בוחרים כיתה ונושא — ומקבלים בדיוק את מה שצריך</p>
    <GradeRow current={null} cat={pending} />
    {pending && <p className="mt-2 text-center text-xl font-black text-violet-700" role="status">👆 בחרו כיתה — ונפתח לכם את „{tileFor(pending).title}”</p>}
    {last && !pending && <p className="mt-2 text-center"><Link to={gradeHref(last)} className="font-bold underline">להמשיך מ{last.name} ←</Link></p>}
    <Tiles grade={null} onPick={pick} />
    <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="שלבי התוכנית">
      {CURRICULUM_STAGES.map(s => <div key={s.id} className="rounded-2xl p-3 text-sm" style={{ background: s.color }}><b>{s.label} (<bdi dir="ltr">{s.en}</bdi>)</b> — {s.about}</div>)}
    </section>
    <div className="mt-8"><SeoBody paragraphs={['תוכנית הלימודים באנגלית בישראל מחולקת לשלבים: התחלה מוקדמת בכיתות א׳–ב׳, רמת יסוד עד סוף כיתה ו׳, רמת ביניים עד סוף ט׳ ורמת שליטה בתיכון, שבסופה הבגרות. בכל שלב עובדים על ארבעה תחומים: ' + CURRICULUM_DOMAINS.map(d => d[1]).join(', ') + '.']} faq={HUB_FAQ} related={[{ label: 'דקדוק באנגלית לפי כיתה', href: '/learn/english-grammar' }, { label: 'אנסין באנגלית', href: '/unseen/english' }, { label: 'אנגלית לילדים — מילים ומשחקים', href: '/english' }]} /></div>
  </Wrap>
}

function GradeView({ grade }) {
  const stage = stageOf(grade)
  useEffect(() => { try { localStorage.setItem(LAST_KEY, String(grade.n)) } catch { /* storage blocked */ } }, [grade.n])
  const faq = [
    { q: `מה לומדים באנגלית ב${grade.name}?`, a: `${grade.focus} ${grade.goals.join('; ')}.` },
    { q: `איך מתכוננים למבחן באנגלית ב${grade.name}?`, a: 'לוחצים על "פעלים ודקדוק" וקוראים את ההסבר ועושים את החידון, על "אוצר מילים" ומתרגלים בכרטיסיות, ופותרים אנסין במצב תרגול ואחר כך במצב מבחן. בסוף מדפיסים את החוברת.' },
    { q: 'זה לפי תוכנית משרד החינוך?', a: `העמוד מסודר לפי שלב "${stage.label}" (${stage.en}) בתוכנית הלימודים באנגלית. החומרים נכתבו כאן, וכדאי לבדוק את סדר הנושאים מול המורה.` },
  ]
  return <Wrap>
    <SEO title={`אנגלית ל${grade.name} — אוצר מילים, דקדוק, אנסין וחוברת`} description={`אנגלית ל${grade.name} לפי תוכנית הלימודים: ${grade.focus} אוצר מילים, פעלים ודקדוק, קריאה עם מילון, אנסין ומבחנים וחוברת להדפסה — בחינם.`} path={gradeHref(grade)} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={crumbs({ label: 'אנגלית לפי כיתה', href: HUB }, { label: grade.name })} />
    <h1 className="text-center text-4xl sm:text-5xl">אנגלית ל{grade.name}</h1>
    <GradeRow current={grade} cat={null} />
    <div className="mt-3 rounded-3xl p-4 text-center" style={{ background: stage.color }}>
      <p className="font-bold">{stage.label} · <bdi dir="ltr">{stage.en}</bdi></p>
      <p>{grade.focus}</p>
    </div>
    <Tiles grade={grade} />
    <details className="mt-6 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-4">
      <summary className="cursor-pointer text-xl font-black">🎯 מה לומדים ב{grade.name} לפי התוכנית</summary>
      <ul className="mt-2 list-disc space-y-1 pr-6">{grade.goals.map(x => <li key={x}>{x}</li>)}</ul>
      <p className="mt-2"><b>נושאי מילים:</b> {grade.vocab.join(' · ')}</p>
    </details>
    <div className="mt-8"><SeoBody paragraphs={[`${grade.name} נמצאת בשלב "${stage.label}" של תוכנית הלימודים באנגלית. ${stage.about}`]} faq={faq} related={[{ label: 'אנגלית לפי כיתה', href: HUB }, { label: 'דקדוק באנגלית', href: '/learn/english-grammar' }, { label: 'אנסין באנגלית', href: '/unseen/english' }]} /></div>
  </Wrap>
}

export function EnglishGradePage() {
  const { grade } = useParams(), g = englishGrade(grade)
  return g ? <GradeView key={g.slug} grade={g} /> : <NotFound />
}

// One tile for one grade: /learn/english/grade-N/<tile>. Tabs for the other tiles and the grade row
// stay on top, so switching either keeps the other.
function Item({ to, emoji, title, sub }) {
  return <li><Link to={to} className="flex h-full items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-4 transition hover:-translate-y-0.5 hover:border-violet-300">
    {emoji && <span className="text-3xl" aria-hidden="true">{emoji}</span>}
    <span><b className="text-lg">{title}</b>{sub && <><br /><bdi dir="ltr" className="text-[var(--muted-foreground)]">{sub}</bdi></>}</span>
  </Link></li>
}

function CategoryView({ grade, tile }) {
  useEffect(() => { try { localStorage.setItem(LAST_KEY, String(grade.n)) } catch { /* storage blocked */ } }, [grade.n])
  const lv = level(grade)
  const band = GRAMMAR_BANDS.find(b => b.id === grade.grammar)
  let body
  if (tile.id === 'grammar') body = <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{topicsInBand(band.id).map(t => <Item key={t.slug} to={grammarHref(t)} emoji={t.emoji} title={t.title} sub={t.en} />)}</ul>
  else if (tile.id === 'reading') body = <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{storiesInBand(READING_BAND[grade.n]).map(s => <Item key={s.slug} to={readingHref(s)} emoji={s.emoji} title={s.title} />)}</ul>
  else if (tile.id === 'unseen') body = <>
    <p className="mb-3 text-center">{lv.about}</p>
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{testsOf('en', lv.id).map(t => <Item key={t.slug} to={`/unseen/english/${t.slug}`} emoji="📝" title={<bdi dir="ltr">{t.title}</bdi>} />)}</ul>
    <p className="mt-4 text-center"><Link to={levelHref(lv)} className="font-bold underline">לעמוד האנסין של {lv.name} — עם מצב מבחן ←</Link></p>
    {grade.n >= 10 && <p className="mt-2 text-center">מודולים נוספים: {UNSEEN_LEVELS.filter(l => l.lang === 'en' && l.id.startsWith('mod-') && l.id !== lv.id).map(l => <Link key={l.id} to={levelHref(l)} className="ln-chip mx-1">{l.name}</Link>)}</p>}
  </>
  else if (tile.id === 'practice') {
    const dictation = grade.dictation ? DICTATION_EN.filter(d => d.grade === grade.dictation) : []
    body = <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {dictation.length > 0 && <Item to="/learn/dictation/english" emoji="✍️" title={`הכתבה — ${dictation.length} רשימות ל${grade.name}`} />}
      {grade.n <= 4 && <Item to="/abc" emoji="🔤" title="אותיות A–Z — שמע, משחק ושיר" />}
      {grade.n <= 4 && <Item to="/printables/abc-letters" emoji="✏️" title="אותיות באנגלית לכתיבה" />}
      {grade.n <= 6 && <Item to="/printables/english-lines" emoji="📄" title="דף שורות לכתיבה באנגלית" />}
      {grade.n >= 3 && <Item to="/typing/english" emoji="⌨️" title="הקלדה באנגלית" />}
      {grade.n >= 7 && <Item to="/learn/english-grammar/linking-words" emoji="🔗" title="מילות קישור לכתיבה" />}
      <Item to="/dictionary" emoji="📗" title="מילון אנגלית–עברית" />
    </ul>
  } else if (tile.id === 'games') body = <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {grade.n <= 6 && ENGLISH_TOPICS.map(t => <Item key={t.slug} to={`/english/${t.slug}`} emoji={t.emoji} title={`${t.title} — משחק תמונות`} />)}
    <Item to="/online-games/memory-english" emoji="🧠" title="משחק זיכרון באנגלית" />
    <Item to="/trivia/english-beginners" emoji="🎯" title="טריוויה באנגלית" />
    <Item to="/learn/flashcards" emoji="🃏" title="כרטיסיות" />
    <Item to="/tools/escape-rooms/english-secret-agent" emoji="🔐" title="חדר בריחה באנגלית" />
  </ul>
  return <Wrap>
    <SEO title={`${tile.title} באנגלית ל${grade.name}`} description={`${tile.title} באנגלית ל${grade.name}: ${tile.sub}. לפי תוכנית הלימודים, בחינם.`} path={`${gradeHref(grade)}/${tile.id}`} />
    <Breadcrumbs items={crumbs({ label: 'אנגלית לפי כיתה', href: HUB }, { label: grade.name, href: gradeHref(grade) }, { label: tile.title })} />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">{tile.icon} </span>{tile.title} — {grade.name}</h1>
    <GradeRow current={grade} cat={tile.id} />
    <nav className="mt-3 flex flex-wrap justify-center gap-2" aria-label="נושאים">
      {TILES.filter(t => t.count(grade)).map(t => <Link key={t.id} to={tileHref(grade, t)} aria-current={t.id === tile.id ? 'page' : undefined}
        className={`min-h-[44px] rounded-full border-2 px-4 py-2 font-bold ${t.id === tile.id ? 'border-transparent' : 'border-[var(--border)] bg-white'}`} style={t.id === tile.id ? { background: t.color } : undefined}>{t.icon} {t.title}</Link>)}
    </nav>
    <div className="mt-6">{body}</div>
  </Wrap>
}

export function EnglishCategoryPage() {
  const { grade, cat } = useParams(), g = englishGrade(grade), t = tileFor(cat)
  return g && t && t.count(g) && !['vocabulary', 'booklet'].includes(t.id) ? <CategoryView key={`${g.slug}-${t.id}`} grade={g} tile={t} /> : <NotFound />
}
