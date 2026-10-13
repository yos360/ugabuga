import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { shareOnWhatsApp } from '../../utils/share'
import SudokuGame, { bestTimes, fmtTime } from '../../sudoku/SudokuGame'
import { SudokuSheets, SudokuSvg, PER_PAGE_OPTIONS } from '../../sudoku/SudokuSheets'
import { LEVEL_META, ADULT_LEVELS, ALL_LEVELS, puzzleFor, randomSeed, israelDate, dailyPuzzle, hebrewDate } from '../../sudoku/puzzles'
import { countSolutions, conflicts, grade, TECHNIQUES, geom } from '../../sudoku/engine'
import { HUB, SPOKES, HOW_TO, STRATEGY, LEVEL_PAGES, KIDS_PAGE, HUB_FAQ } from '../../sudoku/content'
import '../../sudoku/sudoku.css'

const SITE = 'https://ugabuga.co.il'
const crumbs = (label, extra = []) => [{ label: 'ראשי', href: '/' }, { label: 'סודוקו', href: HUB }, ...extra, { label }]
const appSchema = (name, description, path) => ({
  '@context': 'https://schema.org', '@type': 'WebApplication', name, description, url: SITE + path,
  inLanguage: 'he', applicationCategory: 'GameApplication', operatingSystem: 'Any', isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'ILS' },
})

// ?p=<seed> (and ?level=) in the URL: a shared link opens the same puzzle.
function useSeed(levels, defaultLevel) {
  const [params, setParams] = useSearchParams()
  const [level, setLevelState] = useState(() => (levels.includes(params.get('level')) ? params.get('level') : defaultLevel))
  const [seed, setSeedState] = useState(() => { const p = Number(params.get('p')); return p > 0 && p < 1e9 ? Math.floor(p) : randomSeed() })
  const sync = (lv, sd) => setParams(prev => {
    const next = new URLSearchParams(prev)
    next.set('p', String(sd))
    if (levels.length > 1 && lv !== defaultLevel) next.set('level', lv); else next.delete('level')
    return next
  }, { replace: true, preventScrollReset: true })
  const fresh = () => { const sd = randomSeed(); setSeedState(sd); sync(level, sd) }
  const setLevel = lv => { const sd = randomSeed(); setLevelState(lv); setSeedState(sd); sync(lv, sd) }
  return { level, seed, fresh, setLevel }
}

function Player({ level, seed, onNew, newLabel, bestKey, puzzle: given, shareText }) {
  const puzzle = useMemo(() => given || puzzleFor(level, seed), [given, level, seed])
  const [printing, setPrinting] = useState(null)
  return <>
    <SudokuGame key={`${puzzle.level}-${puzzle.seed}`} puzzle={puzzle} onNew={onNew} newLabel={newLabel} bestKey={bestKey} onPrint={p => setPrinting(p)} />
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-slate-600">
      <span>{LEVEL_META[puzzle.level].long} · לוח מס׳ {puzzle.seed}</span>
      {shareText && <button type="button" className="sdk-link" onClick={() => shareOnWhatsApp(shareText(puzzle))}>💬 שליחת הלוח לחבר</button>}
    </div>
    {printing && <PrintPreview title={`${LEVEL_META[printing.level].long} · מס׳ ${printing.seed}`} onClose={() => setPrinting(null)}>
      <SudokuSheets puzzles={[printing]} perPage={1} withSolutions title={LEVEL_META[printing.level].long} />
    </PrintPreview>}
  </>
}
const shareFor = path => p => `🔢 ${LEVEL_META[p.level].long} — אותו לוח בדיוק, בואו נראה מי פותר מהר יותר: ${SITE}${path}?p=${p.seed}${path === HUB && p.level !== 'easy' ? `&level=${p.level}` : ''}`

function LevelChips({ levels, value, onPick }) {
  return <div className="sdk-levels no-print" role="group" aria-label="רמת קושי">
    {levels.map(id => <button key={id} type="button" className="sdk-chip" aria-pressed={id === value} onClick={() => onPick(id)}>{LEVEL_META[id].name}<small aria-hidden="true">{LEVEL_META[id].stars}</small></button>)}
  </div>
}
function LevelLinks({ current }) {
  return <nav className="sdk-levels no-print" aria-label="רמות סודוקו">
    {ADULT_LEVELS.map(id => <Link key={id} to={LEVEL_META[id].path} className="sdk-chip" aria-pressed={id === current} aria-current={id === current ? 'page' : undefined}>{LEVEL_META[id].name}<small aria-hidden="true">{LEVEL_META[id].stars}</small></Link>)}
    <Link to="/sudoku/kids" className="sdk-chip" aria-pressed={current === 'kids'}>לילדים<small aria-hidden="true">🧒</small></Link>
  </nav>
}
function SpokeCards({ except, heading = 'עוד סודוקו' }) {
  return <section className="mt-10" aria-label={heading}>
    <h2 className="mb-3 text-2xl font-bold">{heading}</h2>
    <div className="sdk-cards">
      {SPOKES.filter(s => s.to !== except).map(s => <Link key={s.to} to={s.to} className="sdk-card"><b>{s.emoji} {s.label}</b><span>{s.sub}</span></Link>)}
    </div>
  </section>
}
function BestTimes() {
  const [best] = useState(() => bestTimes())
  const rows = ALL_LEVELS.filter(l => best[l])
  if (!rows.length) return null
  return <div className="sdk-box"><h2>🏆 השיאים שלכם</h2><ul>{rows.map(l => <li key={l}>{LEVEL_META[l].long}: <b>{fmtTime(best[l])}</b></li>)}</ul></div>
}
const Tips = ({ items, title = 'טיפים' }) => <div className="sdk-box"><h2>{title}</h2><ul>{items.map(t => <li key={t}>{t}</li>)}</ul></div>

// ───────────── hub: /sudoku ─────────────
export function SudokuHub() {
  const { level, seed, fresh, setLevel } = useSeed(ADULT_LEVELS, 'easy')
  const [today] = useState(() => israelDate())
  const daily = useMemo(() => dailyPuzzle('medium', today), [today])
  const title = 'סודוקו אונליין בחינם – לשחק ולהדפיס, מקל ועד קשה מאוד'
  const description = 'סודוקו אונליין בחינם בעברית: משחקים ישר בדפדפן בארבע רמות — קל, בינוני, קשה וקשה מאוד — עם טיוטה, ביטול ושעון. סודוקו יומי, סודוקו לילדים, הדפסה ופותר סודוקו.'
  return <div className="mx-auto max-w-6xl px-4 py-8" dir="rtl">
    <SEO title={title} description={description} path={HUB} structuredData={[appSchema('סודוקו אונליין', description, HUB), faqSchema(HUB_FAQ)]} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'סודוקו' }]} />
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl"><span aria-hidden="true">🔢 </span>סודוקו אונליין בחינם</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-slate-700">סודוקו הוא חידת המספרים שכולם מכירים: משלימים את הלוח כך שכל מספר מופיע פעם אחת בכל שורה, בכל עמודה ובכל ריבוע. כאן משחקים סודוקו ישר בעמוד, בטלפון או במחשב, בחינם ובלי הרשמה — בוחרים רמה ומתחילים.</p>
    </header>
    <div className="mt-5"><LevelChips levels={ADULT_LEVELS} value={level} onPick={setLevel} /></div>
    <div className="sdk-play-grid mt-5">
      <div><Player level={level} seed={seed} onNew={fresh} shareText={shareFor(HUB)} /></div>
      <aside className="grid gap-4">
        <Link to="/sudoku/daily" className="sdk-box flex items-center gap-4 no-underline" style={{ color: 'inherit' }}>
          <div style={{ width: 96, flex: 'none' }} aria-hidden="true"><SudokuSvg puzzle={daily} /></div>
          <div><b className="block text-xl">📅 הסודוקו היומי</b><span className="block text-slate-600">{hebrewDate(today)} · רמה בינונית · אותו לוח לכל המשחקים היום</span><span className="mt-1 block font-bold underline">לפתרון הסודוקו של היום ←</span></div>
        </Link>
        <div className="sdk-box">
          <h2>בוחרים רמה</h2>
          <ul>
            <li><Link to="/sudoku/easy" className="font-bold underline">סודוקו קל</Link> — למתחילים, רק צעדים פשוטים.</li>
            <li><Link to="/sudoku/medium" className="font-bold underline">סודוקו בינוני</Link> — פחות רמזים, יותר סריקה.</li>
            <li><Link to="/sudoku/hard" className="font-bold underline">סודוקו קשה</Link> — טיוטה, זוגות ונעילות.</li>
            <li><Link to="/sudoku/very-hard" className="font-bold underline">סודוקו קשה מאוד</Link> — בדיקת השערות.</li>
            <li><Link to="/sudoku/kids" className="font-bold underline">סודוקו לילדים</Link> — לוחות 4×4 ו־6×6.</li>
          </ul>
        </div>
        <BestTimes />
      </aside>
    </div>

    <SpokeCards heading="כל סוגי הסודוקו" />

    <div className="mt-10 grid gap-5 md:grid-cols-2">
      <section className="sdk-box"><h2>איך משחקים סודוקו?</h2><ol>{HOW_TO.map(t => <li key={t}>{t}</li>)}</ol>
        <p className="mt-3 leading-relaxed">בלוח שעל המסך: לוחצים על משבצת ואז על מספר. ✏️ טיוטה רושמת אפשרויות קטנות, ↩️ מבטל מהלך, ו־💡 ממלא משבצת אחת כשנתקעים. במחשב אפשר להקליד מספרים, לזוז עם החיצים, ללחוץ N לטיוטה ו־Ctrl+Z לביטול.</p>
      </section>
      <section className="sdk-box"><h2>טיפים ואסטרטגיה</h2><ul>{STRATEGY.map(s => <li key={s.t}><b>{s.t}:</b> {s.d}</li>)}</ul></section>
    </div>

    <section className="mt-8 sdk-box">
      <h2>איך נקבעת רמת הקושי?</h2>
      <p className="leading-relaxed">כל לוח באתר נבדק פעמיים. קודם מחשב מוודא שיש לו פתרון אחד בדיוק. אחר כך פותר ממוחשב שעובד כמו אדם — מתחיל בצעדים הפשוטים ועובר לטכניקות מתקדמות רק כשאין ברירה — קובע את הרמה: <b>קל</b> ו<b>בינוני</b> נפתרים רק בצעדים פשוטים (בקל יש לפחות 36 מספרים נתונים), <b>קשה</b> דורש טכניקות של טיוטה כמו זוגות, נעילות או כנף X, ו<b>קשה מאוד</b> נשאר תקוע גם אחריהן ודורש בדיקת השערות.</p>
    </section>

    <div className="mt-8"><SeoBody paragraphs={[
      'רוצים את הסודוקו על נייר? בעמוד סודוקו להדפסה בוחרים רמה ומדפיסים 1, 2, 4 או 6 לוחות בכל דף A4, עם דפי פתרונות, או שומרים כ־PDF להורדה בחינם. מורים יכולים להדפיס את אותו סט שוב — כל סט מסומן במספר.',
      'נתקעתם בסודוקו מעיתון או מחוברת? בפותר הסודוקו מקלידים את הלוח ומקבלים את הפתרון, וגם תשובה אם ללוח אין פתרון או שיש לו יותר מאחד.',
    ]} faq={HUB_FAQ} related={[
      { label: 'משחק סודוקו במסך מלא', href: '/online-games/sudoku' },
      { label: 'סודוקו להדפסה', href: '/sudoku/print' },
      { label: 'פותר סודוקו', href: '/sudoku/solver' },
      { label: 'משחקי חשיבה אונליין', href: '/online-games' },
    ]} /></div>
  </div>
}

// ───────────── spokes: /sudoku/easy|medium|hard|very-hard ─────────────
export function SudokuLevelPage({ level }) {
  const c = LEVEL_PAGES[level]
  const meta = LEVEL_META[level]
  const { seed, fresh } = useSeed([level], level)
  return <div className="mx-auto max-w-6xl px-4 py-8" dir="rtl">
    <SEO title={c.seoTitle} description={c.description} path={meta.path} structuredData={[appSchema(c.h1, c.description, meta.path), faqSchema(c.faq)]} />
    <Breadcrumbs items={crumbs(c.h1)} />
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl">{c.h1}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-slate-700">{c.intro}</p>
    </header>
    <div className="mt-5"><LevelLinks current={level} /></div>
    <div className="sdk-play-grid mt-5">
      <div><Player level={level} seed={seed} onNew={fresh} newLabel={`${c.keyword} חדש`} shareText={shareFor(meta.path)} /></div>
      <aside className="grid gap-4">
        <Tips items={c.tips} title={`טיפים ל${c.keyword}`} />
        <div className="sdk-box"><h2>🖨️ על נייר</h2><p className="leading-relaxed">כפתור ההדפסה מתחת ללוח מדפיס את הלוח הזה עם דף פתרון. רוצים כמה לוחות בדף? <Link to={`/sudoku/print?level=${level}`} className="font-bold underline">{c.keyword} להדפסה</Link> — עד 6 לוחות בדף A4.</p></div>
        <BestTimes />
      </aside>
    </div>
    <SpokeCards except={meta.path} />
    <div className="mt-10"><SeoBody faq={c.faq} related={[{ label: 'סודוקו אונליין – כל הרמות', href: HUB }, ...c.related]} /></div>
  </div>
}

// ───────────── /sudoku/kids ─────────────
export function SudokuKids() {
  const c = KIDS_PAGE
  const { level, seed, fresh, setLevel } = useSeed(['kids4', 'kids6'], 'kids4')
  return <div className="mx-auto max-w-6xl px-4 py-8" dir="rtl">
    <SEO title={c.seoTitle} description={c.description} path="/sudoku/kids" structuredData={[appSchema(c.h1, c.description, '/sudoku/kids'), faqSchema(c.faq)]} />
    <Breadcrumbs items={crumbs(c.h1)} />
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl"><span aria-hidden="true">🧒 </span>{c.h1}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-slate-700">{c.intro}</p>
    </header>
    <div className="mt-5"><LevelChips levels={['kids4', 'kids6']} value={level} onPick={setLevel} /></div>
    <div className="sdk-play-grid mt-5">
      <div><Player level={level} seed={seed} onNew={fresh} newLabel="לוח חדש" shareText={shareFor('/sudoku/kids')} /></div>
      <aside className="grid gap-4">
        <div className="sdk-box"><h2>איך משחקים?</h2><ol>
          <li>לוחצים על משבצת ריקה.</li>
          <li>לוחצים על מספר מהשורה שמתחת ללוח.</li>
          <li>בכל שורה, בכל עמודה ובכל ריבוע מודגש — כל מספר רק פעם אחת.</li>
          <li>כל הלוח מלא? ניצחתם! 🎉</li>
        </ol></div>
        <Tips items={c.tips} title="טיפים להורים" />
        <div className="sdk-box"><h2>🖨️ להדפסה</h2><p className="leading-relaxed">כפתור ההדפסה מדפיס את הלוח שעל המסך. לדף מלא בלוחות: <Link to={`/sudoku/print?level=${level}`} className="font-bold underline">סודוקו לילדים להדפסה</Link> — עד 6 לוחות בדף.</p></div>
      </aside>
    </div>
    <SpokeCards except="/sudoku/kids" />
    <div className="mt-10"><SeoBody faq={c.faq} related={[{ label: 'סודוקו אונליין – כל הרמות', href: HUB }, ...c.related]} /></div>
  </div>
}

// ───────────── /sudoku/daily ─────────────
const DAILY_FAQ = [
  { q: 'מתי מתחלף הסודוקו היומי?', a: 'בכל יום בחצות לפי שעון ישראל. כל מי שנכנס באותו יום מקבל בדיוק את אותו לוח — אפשר להתחרות עם חברים ובני משפחה מי פותר מהר יותר.' },
  { q: 'יש סודוקו יומי ברמות שונות?', a: 'כן. ברירת המחדל היא רמה בינונית, ואפשר לבחור גם קל, קשה וקשה מאוד — לכל רמה יש לוח יומי משלה.' },
  { q: 'פתרתי — מה עכשיו?', a: 'אפשר לשתף את הזמן שלכם בוואטסאפ, לנסות את הלוח היומי ברמה אחרת, או לעבור לעמודי הרמות ולפתור כמה לוחות שרוצים.' },
]
export function SudokuDaily() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [level, setLevel] = useState(() => (ADULT_LEVELS.includes(params.get('level')) ? params.get('level') : 'medium'))
  const [today, setToday] = useState(() => israelDate())
  useEffect(() => {
    const t = setInterval(() => setToday(israelDate()), 60000)
    return () => clearInterval(t)
  }, [])
  const puzzle = useMemo(() => dailyPuzzle(level, today), [level, today])
  const pick = lv => { setLevel(lv); setParams(lv === 'medium' ? {} : { level: lv }, { replace: true, preventScrollReset: true }) }
  const description = 'סודוקו יומי חדש בכל יום: אותו לוח לכל מי שמשחק היום, בארבע רמות קושי. פותרים אונליין בחינם, משווים זמנים עם חברים ומדפיסים.'
  return <div className="mx-auto max-w-6xl px-4 py-8" dir="rtl">
    <SEO title="סודוקו יומי – הלוח של היום, אותו לוח לכולם" description={description} path="/sudoku/daily" structuredData={[appSchema('סודוקו יומי', description, '/sudoku/daily'), faqSchema(DAILY_FAQ)]} />
    <Breadcrumbs items={crumbs('סודוקו יומי')} />
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl"><span aria-hidden="true">📅 </span>סודוקו יומי</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-slate-700">הסודוקו היומי של {hebrewDate(today)}: לוח אחד שכל המשחקים מקבלים היום, והוא מתחלף בחצות. פותרים, רואים כמה זמן לקח, ושולחים לחברים לבדוק אם הם מהירים יותר.</p>
    </header>
    <div className="mt-5"><LevelChips levels={ADULT_LEVELS} value={level} onPick={pick} /></div>
    <div className="sdk-play-grid mt-5">
      <div><Player puzzle={puzzle} bestKey={`daily-${level}`} newLabel={`עוד ${LEVEL_META[level].long}`} onNew={() => navigate(LEVEL_META[level].path)}
        shareText={() => `📅 הסודוקו היומי (${hebrewDate(today)}, ${LEVEL_META[level].name}) — אותו לוח לכולם. תפתרו? ${SITE}/sudoku/daily${level === 'medium' ? '' : `?level=${level}`}`} /></div>
      <aside className="grid gap-4">
        <div className="sdk-box"><h2>איך זה עובד?</h2><ul>
          <li>הלוח נקבע לפי התאריך — כולם מקבלים אותו לוח בדיוק.</li>
          <li>לכל רמה יש לוח יומי משלה. ברירת המחדל: בינוני.</li>
          <li>השעון נעצר כשמשהים או עוברים ללשונית אחרת.</li>
          <li>מחר בחצות — לוח חדש.</li>
        </ul></div>
        <Tips items={STRATEGY.slice(0, 3).map(s => `${s.t}: ${s.d}`)} title="טיפים מהירים" />
      </aside>
    </div>
    <SpokeCards except="/sudoku/daily" />
    <div className="mt-10"><SeoBody faq={DAILY_FAQ} related={[{ label: 'סודוקו אונליין – כל הרמות', href: HUB }, { label: 'אתגר המשחקים היומי', href: '/online-games/today' }, { label: 'סודוקו קשה', href: '/sudoku/hard' }]} /></div>
  </div>
}

// ───────────── /sudoku/print ─────────────
const PAGE_COUNTS = [1, 2, 3, 5, 10]
const PRINT_FAQ = [
  { q: 'אפשר להוריד את הסודוקו כ־PDF?', a: 'כן. בחלון התצוגה לפני ההדפסה יש כפתור "הורדה כ־PDF" — הקובץ נשמר במכשיר בחינם, ואפשר להדפיס אותו אחר כך או לשלוח למישהו.' },
  { q: 'איך מדפיסים שוב את אותם לוחות?', a: 'לכל סט יש מספר (מופיע ליד הכפתורים ובכתובת העמוד). אותו מספר, אותה רמה ואותה כמות תמיד ייצרו את אותם לוחות בדיוק — נוח למורים שמדפיסים לכמה כיתות.' },
  { q: 'כמה לוחות כדאי לשים בדף?', a: 'לוח אחד בדף — לילדים, למתחילים ולמי שאוהב לכתוב טיוטה. שניים או ארבעה — לשימוש רגיל. שישה — לחוברת או לנסיעה, כשהמספרים קטנים יותר.' },
  { q: 'יש גם דף פתרונות?', a: 'כן. מסמנים "להדפיס גם פתרונות", ובסוף ההדפסה יופיעו דפי פתרונות עם שישה פתרונות בדף, כל אחד עם מספר הלוח שלו.' },
]
export function SudokuPrint() {
  const [params, setParams] = useSearchParams()
  const init = (k, ok, d) => { const v = params.get(k); return ok(v) ? v : d }
  const [level, setLevel] = useState(() => init('level', v => ALL_LEVELS.includes(v), 'medium'))
  const [per, setPer] = useState(() => Number(init('per', v => PER_PAGE_OPTIONS.includes(Number(v)), '4')))
  const [pages, setPages] = useState(() => Number(init('pages', v => PAGE_COUNTS.includes(Number(v)), '1')))
  const [set, setSet] = useState(() => Number(init('set', v => Number(v) > 0 && Number(v) < 1e6, '1')))
  const [withSol, setWithSol] = useState(true)
  const [printing, setPrinting] = useState(false)
  const first = useRef(true)
  useEffect(() => {
    if (first.current && ![...params.keys()].length) { first.current = false; return }
    first.current = false
    setParams({ level, per: String(per), pages: String(pages), set: String(set) }, { replace: true, preventScrollReset: true })
  }, [level, per, pages, set]) // eslint-disable-line react-hooks/exhaustive-deps
  const puzzles = useMemo(() => Array.from({ length: per * pages }, (_, k) => puzzleFor(level, set * 1000 + k + 1)), [level, per, pages, set])
  const meta = LEVEL_META[level]
  const description = 'סודוקו להדפסה בחינם: בוחרים רמה — קל, בינוני, קשה, קשה מאוד או לילדים — ומדפיסים 1, 2, 4 או 6 לוחות בדף A4, עם דפי פתרונות. אפשר גם להוריד כ־PDF.'
  const sel = 'min-h-[48px] w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-lg font-bold'
  return <div className="mx-auto max-w-6xl px-4 py-8" dir="rtl">
    <SEO title="סודוקו להדפסה – 1 עד 6 לוחות בדף A4, עם פתרונות" description={description} path="/sudoku/print" structuredData={faqSchema(PRINT_FAQ)} />
    <Breadcrumbs items={crumbs('סודוקו להדפסה')} />
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl"><span aria-hidden="true">🖨️ </span>סודוקו להדפסה</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-slate-700">סודוקו להדפסה בכל רמה: בוחרים קושי, כמה לוחות יהיו בכל דף וכמה דפים, ומדפיסים — עם דפי פתרונות בסוף. הכול בחינם, וכל סט אפשר גם להוריד כ־PDF ולהדפיס שוב בדיוק אותו דבר.</p>
    </header>
    <section className="no-print mt-6 grid gap-4 sdk-box sm:grid-cols-2 lg:grid-cols-4" aria-label="הגדרות הדפסה">
      <label className="grid gap-1 font-bold">רמה<select className={sel} value={level} onChange={e => setLevel(e.target.value)}>{ALL_LEVELS.map(l => <option key={l} value={l}>{LEVEL_META[l].long}</option>)}</select></label>
      <div className="grid gap-1 font-bold" role="group" aria-label="לוחות בכל דף">לוחות בדף
        <div className="flex gap-2">{PER_PAGE_OPTIONS.map(v => <button key={v} type="button" aria-pressed={per === v} onClick={() => setPer(v)} className={`min-h-[48px] flex-1 rounded-xl border-2 text-lg font-bold ${per === v ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white'}`}>{v}</button>)}</div>
      </div>
      <label className="grid gap-1 font-bold">מספר דפים<select className={sel} value={pages} onChange={e => setPages(Number(e.target.value))}>{PAGE_COUNTS.map(v => <option key={v} value={v}>{v} {v === 1 ? 'דף' : 'דפים'} ({v * per} לוחות)</option>)}</select></label>
      <div className="grid gap-1 font-bold">סט מס׳ {set}
        <button type="button" onClick={() => setSet(1 + Math.floor(Math.random() * 99999))} className="min-h-[48px] rounded-xl border-2 border-cyan-600 bg-cyan-50 text-lg font-bold">✨ סט חדש</button>
      </div>
    </section>
    <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
      <button type="button" data-print-main onClick={() => setPrinting(true)} className="min-h-[52px] rounded-xl bg-red-500 px-6 py-3 text-lg font-bold text-white">🖨️ הדפסה / PDF — {puzzles.length} לוחות</button>
      <label className="flex min-h-[44px] items-center gap-2 font-bold"><input type="checkbox" checked={withSol} onChange={e => setWithSol(e.target.checked)} className="h-5 w-5" />להדפיס גם פתרונות</label>
    </div>
    <section className="no-print mt-6" aria-label="תצוגה מקדימה">
      <h2 className="mb-3 text-xl font-bold">{meta.long} — הלוחות בסט ({puzzles.length})</h2>
      <div className="sdk-thumbs">{puzzles.slice(0, 12).map(p => <figure key={p.seed}><SudokuSvg puzzle={p} title={`${meta.long} מס׳ ${p.seed}`} /><figcaption className="mt-1">מס׳ {p.seed}</figcaption></figure>)}</div>
      {puzzles.length > 12 && <p className="mt-2 text-center text-slate-600">ועוד {puzzles.length - 12} לוחות בהדפסה.</p>}
    </section>
    {printing && <PrintPreview copies={false} title={`${meta.long} להדפסה · סט ${set}`} onClose={() => setPrinting(false)}>
      <SudokuSheets puzzles={puzzles} perPage={per} withSolutions={withSol} title={meta.long} />
    </PrintPreview>}
    <SpokeCards except="/sudoku/print" />
    <div className="mt-10"><SeoBody paragraphs={[
      'מה מתאים למי? סודוקו קל ובינוני — למתחילים ולכיתות ד׳–ו׳. סודוקו קשה להדפסה — למי שכבר עובד עם טיוטה, ומתאים במיוחד לדף עם לוח אחד או שניים, כדי שיהיה מקום לרשום אפשרויות. סודוקו קשה מאוד — לאלופים. לילדים צעירים יש לוחות של 4×4 ו־6×6.',
      'כל הלוחות נוצרים במחשב ונבדקים: לכל לוח יש פתרון אחד בדיוק, והרמה נקבעת לפי הטכניקות שצריך כדי לפתור אותו. המספר הקטן ליד כל לוח עוזר למצוא את הפתרון המתאים בדפי הפתרונות.',
    ]} faq={PRINT_FAQ} related={[{ label: 'סודוקו אונליין', href: HUB }, { label: 'סודוקו לילדים להדפסה', href: '/printables/sudoku' }, { label: 'מבוכים להדפסה', href: '/printables/mazes' }, { label: 'דפים להדפסה', href: '/printables' }]} /></div>
  </div>
}

// ───────────── /sudoku/solver ─────────────
const SOLVER_FAQ = [
  { q: 'איך משתמשים בפותר הסודוקו?', a: 'מקלידים את המספרים מהלוח שלכם במשבצות (משבצת ריקה נשארת ריקה) ולוחצים "פתרון". אפשר גם להדביק את כל הלוח כשורת טקסט של 81 תווים, עם 0 או נקודה במקום משבצת ריקה.' },
  { q: 'מה קורה אם ללוח אין פתרון?', a: 'הפותר יגיד שאין פתרון. אם יש מספר שחוזר פעמיים באותה שורה, עמודה או ריבוע — הוא יסומן באדום, ובדרך כלל זו טעות הקלדה.' },
  { q: 'למה כתוב שיש יותר מפתרון אחד?', a: 'סודוקו תקין צריך פתרון אחד בלבד. אם חסרים בלוח מספרים (או שהוקלדו לא נכון), יש כמה דרכים למלא אותו. הפותר יציג אחת מהן ויסביר שהיא לא היחידה.' },
  { q: 'אפשר לקבל רק רמז ולא את כל הפתרון?', a: 'כן. "משבצת אחת" חושפת מספר אחד נכון, כך שאפשר להמשיך לבד.' },
]
const EXAMPLE = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79'
export function SudokuSolver() {
  const [n, setN] = useState(9)
  const [cells, setCells] = useState(() => Array(81).fill(0))
  const [result, setResult] = useState(null)
  const [paste, setPaste] = useState('')
  const refs = useRef([])
  const N = n * n
  const bad = useMemo(() => conflicts(cells, n), [cells, n])
  const { br, bc } = geom(n)
  const reset = size => { setN(size); setCells(Array(size * size).fill(0)); setResult(null) }
  const setCell = (i, v) => { setCells(cs => { const out = cs.slice(); out[i] = v; return out }); setResult(null) }
  const focus = i => refs.current[(i + N) % N]?.focus()
  const onKey = (e, i) => {
    const map = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: n, ArrowUp: -n }
    if (map[e.key] !== undefined) { e.preventDefault(); focus(i + map[e.key]) }
    else if (e.key === 'Backspace' && !cells[i]) { e.preventDefault(); setCell(i - 1 >= 0 ? i - 1 : i, 0); focus(i - 1) }
  }
  const onInput = (e, i) => {
    const d = Number(String(e.target.value).replace(/[^1-9]/g, '').slice(-1))
    if (d >= 1 && d <= n) { setCell(i, d); focus(i + 1) } else setCell(i, 0)
  }
  const run = mode => {
    const givens = cells.filter(Boolean).length
    if (bad.size) { setResult({ kind: 'conflict' }); return }
    const r = countSolutions(cells, n, 2)
    if (r.count === 0) { setResult({ kind: 'none' }); return }
    if (mode === 'hint') {
      const empty = cells.map((v, i) => (v ? -1 : i)).filter(i => i >= 0)
      if (!empty.length) { setResult({ kind: 'full' }); return }
      const i = empty[Math.floor(Math.random() * empty.length)]
      setCell(i, r.solution[i])
      setResult({ kind: r.count === 1 ? 'hint' : 'hint-multi', cell: i })
      return
    }
    const gr = n === 9 && r.count === 1 ? grade(cells, 9) : null
    setResult({ kind: r.count === 1 ? 'one' : 'many', solution: r.solution, grade: gr, givens, check: mode === 'check' })
  }
  const loadPaste = text => {
    const digits = String(text).replace(/\s/g, '').replace(/[0.\-_*]/g, '0').replace(/[^0-9]/g, '')
    if (digits.length !== N) { setResult({ kind: 'paste', len: digits.length }); return }
    setCells([...digits].map(Number).map(v => (v <= n ? v : 0))); setResult(null)
  }
  const solved = result && (result.kind === 'one' || result.kind === 'many') && !result.check ? result.solution : null
  const description = 'פותר סודוקו אונליין בחינם: מקלידים או מדביקים לוח 9×9 (או 4×4, 6×6) ומקבלים את הפתרון, את רמת הקושי, ותשובה ברורה אם אין פתרון או שיש יותר מאחד.'
  const techNames = result?.grade ? Object.keys(result.grade.used).map(k => TECHNIQUES[k]?.he).filter(Boolean) : []
  return <div className="mx-auto max-w-6xl px-4 py-8" dir="rtl">
    <SEO title="פותר סודוקו – מקלידים לוח ומקבלים פתרון, בחינם" description={description} path="/sudoku/solver" structuredData={[appSchema('פותר סודוקו', description, '/sudoku/solver'), faqSchema(SOLVER_FAQ)]} />
    <Breadcrumbs items={crumbs('פותר סודוקו')} />
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl"><span aria-hidden="true">🧮 </span>פותר סודוקו</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-slate-700">פותר סודוקו לכל לוח שנתקעתם בו — מעיתון, מחוברת או מאפליקציה. מקלידים את המספרים, לוחצים "פתרון", ומקבלים את הלוח המלא, הערכה של רמת הקושי ותשובה ברורה אם יש בעיה בלוח.</p>
    </header>
    <div className="sdk-play-grid mt-6">
      <div>
        <div className="sdk-levels mb-3" role="group" aria-label="גודל לוח">{[9, 6, 4].map(s => <button key={s} type="button" className="sdk-chip" aria-pressed={n === s} onClick={() => reset(s)}>{s}×{s}</button>)}</div>
        <div className="sdk-input" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }} role="grid" aria-label="הקלדת לוח סודוקו">
          {Array.from({ length: N }, (_, i) => {
            const r = Math.floor(i / n), c = i % n
            const v = cells[i] || (solved ? solved[i] : 0)
            const cls = [(c + 1) % bc === 0 && c < n - 1 && 'b-e', (r + 1) % br === 0 && r < n - 1 && 'b-s', !cells[i] && solved && 'is-solved', bad.has(i) && 'is-bad'].filter(Boolean).join(' ')
            return <input key={`${n}-${i}`} ref={el => { refs.current[i] = el }} className={cls} style={{ fontSize: `calc(100cqw / ${n} * .55)` }} value={v || ''} inputMode="numeric" autoComplete="off" maxLength={2}
              aria-label={`שורה ${r + 1} עמודה ${c + 1}`} onChange={e => onInput(e, i)} onKeyDown={e => onKey(e, i)} onFocus={e => e.target.select()} />
          })}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" className="sdk-btn sdk-btn-primary" onClick={() => run('solve')}>✅ פתרון</button>
          <button type="button" className="sdk-btn" onClick={() => run('check')}>🔍 בדיקה בלי לגלות</button>
          <button type="button" className="sdk-btn" onClick={() => run('hint')}>💡 משבצת אחת</button>
          <button type="button" className="sdk-btn" onClick={() => reset(n)}>🧹 ניקוי</button>
        </div>
        <div className="mt-4 text-center text-lg" role="status" aria-live="polite">
          {result?.kind === 'conflict' && <p className="font-bold text-red-600">יש מספר שחוזר פעמיים באותה שורה, עמודה או ריבוע (מסומן באדום). תקנו ונסו שוב.</p>}
          {result?.kind === 'none' && <p className="font-bold text-red-600">ללוח הזה אין פתרון. בדקו שהמספרים הוקלדו נכון.</p>}
          {result?.kind === 'full' && <p className="font-bold">הלוח כבר מלא.</p>}
          {result?.kind === 'paste' && <p className="font-bold text-red-600">צריך בדיוק {N} תווים — הודבקו {result.len}.</p>}
          {result?.kind === 'hint' && <p className="font-bold text-green-700">הוספנו מספר נכון אחד. המשיכו לבד!</p>}
          {result?.kind === 'hint-multi' && <p className="font-bold text-amber-700">הוספנו מספר — אבל שימו לב: ללוח הזה יש יותר מפתרון אחד.</p>}
          {result?.kind === 'one' && <div className="sdk-box text-start">
            <p className="font-bold text-green-700">{result.check ? '✔ ללוח יש פתרון אחד בדיוק — סודוקו תקין.' : '✔ נפתר! ללוח יש פתרון אחד בדיוק.'}</p>
            {result.grade && <p className="mt-1">רמת קושי משוערת: <b>{LEVEL_META[result.grade.level].name}</b> ({result.givens} מספרים נתונים){techNames.length ? ` · טכניקות שנדרשו: ${techNames.join(', ')}` : ''}{result.grade.level === 'very-hard' ? ' · נדרשת בדיקת השערות' : ''}.</p>}
          </div>}
          {result?.kind === 'many' && <div className="sdk-box text-start">
            <p className="font-bold text-amber-700">⚠ ללוח יש יותר מפתרון אחד — כנראה חסרים מספרים או שהוקלד משהו לא נכון.</p>
            {!result.check && <p className="mt-1">על הלוח מוצג פתרון אפשרי אחד, אבל הוא לא היחיד.</p>}
          </div>}
        </div>
      </div>
      <aside className="grid gap-4">
        <div className="sdk-box"><h2>הדבקת לוח כטקסט</h2>
          <p className="mb-2 text-sm text-slate-600">{N} תווים לפי הסדר, שורה אחרי שורה. 0 או נקודה = משבצת ריקה.</p>
          <textarea value={paste} onChange={e => setPaste(e.target.value)} rows={3} dir="ltr" className="w-full rounded-xl border-2 border-slate-300 p-2 font-mono text-sm" aria-label="לוח כטקסט" />
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className="sdk-btn" onClick={() => loadPaste(paste)}>טעינה ללוח</button>
            {n === 9 && <button type="button" className="sdk-btn" onClick={() => { setPaste(EXAMPLE); loadPaste(EXAMPLE) }}>לוח לדוגמה</button>}
          </div>
        </div>
        <div className="sdk-box"><h2>מה הפותר בודק?</h2><ul>
          <li>שאין מספר כפול בשורה, בעמודה או בריבוע.</li>
          <li>אם יש פתרון — ואם יש רק אחד.</li>
          <li>בלוח 9×9: באיזו רמה הוא ולפי אילו טכניקות.</li>
        </ul></div>
      </aside>
    </div>
    <SpokeCards except="/sudoku/solver" />
    <div className="mt-10"><SeoBody paragraphs={[
      'הפותר עובד בשתי שכבות. השכבה הראשונה פותרת כמו אדם: ממלאת משבצות שיש להן אפשרות אחת, ומשתמשת בזוגות, בנעילות ובכנף X כשצריך — כך נקבעת רמת הקושי. השכבה השנייה היא חיפוש ממוחשב שבודק את כל האפשרויות, ולכן הוא יודע לומר בוודאות אם יש פתרון אחד, כמה, או אף לא אחד.',
    ]} faq={SOLVER_FAQ} related={[{ label: 'סודוקו אונליין', href: HUB }, { label: 'סודוקו קשה מאוד', href: '/sudoku/very-hard' }, { label: 'סודוקו להדפסה', href: '/sudoku/print' }]} /></div>
  </div>
}
