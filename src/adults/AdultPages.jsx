import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import NotFound from '../pages/NotFound'
import { MANDALA_LEVELS, levelById, makeMandala } from './mandala'
import './adults.css'

// The adults' leisure area (/adults): everything large — big type, big buttons, big print —
// for adults, grandparents and activity leaders. Crosswords are pre-built by
// scripts/generate-crosswords.mjs; mandalas are drawn in the browser from a number.
const Page = ({ children }) => <div className="adult-ui mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const HOME = { label: 'פנאי למבוגרים', href: '/adults' }
const crumbs = (...more) => [{ label: 'ראשי', href: '/' }, HOME, ...more]
const useData = load => { const [d, setD] = useState(null); useEffect(() => { let on = true; load().then(m => { if (on) setD(m) }); return () => { on = false } }, [load]); return d }
const loadCrosswords = () => import('./crosswordsData')
const loadGrand = () => import('./grandparentsData')

// ---------- hub ----------
const CARDS = [
  { to: '/adults/crosswords', emoji: '✏️', title: 'תשחצים להדפסה', text: 'תשבצים מלאים כמו בעיתון, עם הגדרות ופתרון. אפשר גם לפתור על המסך.' },
  { to: '/adults/memory', emoji: '🧠', title: 'משחק זיכרון בקלפים גדולים', text: 'מחפשים זוגות של תמונות, בלי שעון ובלי לחץ. מ־3 זוגות ועד 8.' },
  { to: '/adults/mandalas', emoji: '🌸', title: 'מנדלות לצביעה', text: 'מנדלה חדשה בכל לחיצה — מפשוטה ועד מפורטת מאוד. מדפיסים וצובעים.' },
  { to: '/sudoku/print', emoji: '🔢', title: 'סודוקו להדפסה', text: 'מקל ועד קשה מאוד, דף מלא להדפסה עם פתרונות.' },
  { to: '/tools/word-search-maker', emoji: '🔤', title: 'תפזורת להדפסה', text: 'כותבים מילים או בוחרים נושא — ומקבלים תפזורת מוכנה.' },
  { to: '/logic-puzzles', emoji: '🧩', title: 'תשבצי היגיון', text: 'חידות היסק להדפסה, ברמות קושי שונות.' },
  { to: '/printables/coloring/mandala-adults', emoji: '🎨', title: 'צביעה למבוגרים', text: 'מנדלות מצוירות בקווים דקים — עץ החיים, לוטוס ועוד.' },
  { to: '/printables/color-by-number', emoji: '🖌️', title: 'צביעה לפי מספרים', text: 'צובעים לפי המקרא ומגלים את הציור.' },
  { to: '/brain-games', emoji: '🧠', title: 'משחקי חשיבה', text: 'גפרורים, חציית הנהר, אורות כבויים — לאתגר את הראש.' },
  { to: '/adults/grandparents', emoji: '👵', title: 'סבא וסבתא עם הנכדים', text: 'פעילויות ומשחקים לעשות יחד — בבית, בחוץ וגם מרחוק.' },
  { to: '/adults/grandparents/interview', emoji: '📖', title: 'ראיון סיפור חיים', text: 'חוברת שאלות להדפסה: הנכדים מראיינים את סבא וסבתא.' },
  { to: '/trivia/with-answers', emoji: '❓', title: 'טריוויה עם תשובות', text: 'שאלות טריוויה לערב משפחתי או למועדון.' },
  { to: '/greetings/age-80', emoji: '💌', title: 'ברכות ליום הולדת', text: 'ברכות לגיל 70, 80, 90 ולסבא ולסבתא.' },
]
const HUB_FAQ = [
  { q: 'למי מתאים האזור?', a: 'למבוגרים שאוהבים תשבצים, סודוקו וצביעה, לסבים ולסבתות שמחפשים פעילות עם הנכדים, ולמפעילים במועדונים ובמרכזי יום שצריכים דפים מוכנים להדפסה.' },
  { q: 'הכול בחינם?', a: 'כן. בלי הרשמה ובלי תשלום. כל דף נפתח בגדול ומודפס על A4.' },
  { q: 'אפשר להגדיל את הכתב?', a: 'האזור כתוב באותיות גדולות מראש, והדפים להדפסה בנויים במשבצות ובאותיות גדולות. אפשר גם להגדיל עוד עם Ctrl ו־+ במחשב, או בצביטה בטלפון.' },
]
export function AdultsHub() {
  return <Page>
    <SEO title="פנאי למבוגרים — תשבצים, מנדלות, סודוקו ופעילויות עם הנכדים" description="פנאי למבוגרים בחינם: תשחצים מלאים להדפסה כמו בעיתון, מנדלות לצביעה, סודוקו, תפזורות ופעילויות לסבא וסבתא עם הנכדים. הכול באותיות גדולות." path="/adults" structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'פנאי למבוגרים' }]} />
    <h1 className="text-center text-5xl font-black">☕ פנאי למבוגרים</h1>
    <p className="adult-lead">תשבצים, צביעה וחידות להדפסה — וגם רעיונות לזמן טוב עם הנכדים. הכול בחינם, באותיות גדולות.</p>
    <ul className="adult-cards">{CARDS.map(c => <li key={c.to}><Link to={c.to} className="adult-card"><span aria-hidden="true">{c.emoji}</span><b>{c.title}</b><small>{c.text}</small></Link></li>)}</ul>
    <div className="mt-12"><SeoBody paragraphs={['האזור הזה נבנה במיוחד למבוגרים: אותיות גדולות, כפתורים גדולים ודפים שמודפסים ברור. תמצאו כאן תשבצים מלאים בסגנון העיתון עם הגדרות בעברית, מנדלות לצביעה בכמה רמות פירוט, סודוקו ותפזורות להדפסה.', 'לסבים ולסבתות יש פינה משלהם: פעילויות ומשחקים לעשות עם הנכדים — בבית, בחוץ וגם מרחוק בשיחת וידאו — וחוברת ״סיפור חיים״ שבה הנכדים מראיינים אתכם ושומרים את הזיכרונות.']} faq={HUB_FAQ} related={[{ label: 'סודוקו להדפסה', href: '/sudoku/print' }, { label: 'דפי צביעה', href: '/printables/coloring' }, { label: 'עבודת שורשים', href: '/printables/roots-project' }]} /></div>
  </Page>
}

// ---------- crosswords ----------
const FINALS = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' }
const normLetter = c => ({ 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' })[c] || c
const isBlack = (p, y, x) => y < 0 || x < 0 || y >= p.size || x >= p.size || p.grid[y][x] === '#'
// A letter is shown in its final form when it ends the across word (next cell to the left is
// black or the edge) — or, when it isn't in an across word, ends the down word.
function shown(p, y, x) {
  const c = p.grid[y][x]
  if (!FINALS[c]) return c
  const inAcross = !isBlack(p, y, x - 1) || !isBlack(p, y, x + 1)
  const endAcross = isBlack(p, y, x + 1) && inAcross
  const endDown = isBlack(p, y + 1, x) && !inAcross
  return endAcross || endDown ? FINALS[c] : c
}
function numbers(p) {
  const out = {}; let k = 0
  for (let y = 0; y < p.size; y++) for (let x = 0; x < p.size; x++) {
    if (isBlack(p, y, x)) continue
    const a = isBlack(p, y, x - 1) && !isBlack(p, y, x + 1), d = isBlack(p, y - 1, x) && !isBlack(p, y + 1, x)
    if (a || d) out[`${y},${x}`] = ++k
  }
  return out
}
function Grid({ p, solution, values, onType, onFocus, cellRefs }) {
  const nums = useMemo(() => numbers(p), [p])
  return <div className="cw-grid" style={{ gridTemplateColumns: `repeat(${p.size}, 1fr)` }}>
    {p.grid.flatMap((row, y) => [...row].map((c, x) => c === '#' ? <div key={`${y},${x}`} className="cw-black" /> : <div key={`${y},${x}`} className="cw-cell">
      {nums[`${y},${x}`] && <span className="cw-num">{nums[`${y},${x}`]}</span>}
      {solution ? <span className="cw-letter">{shown(p, y, x)}</span>
        : onType ? <input ref={el => { if (cellRefs) cellRefs.current[`${y},${x}`] = el }} aria-label={`משבצת ${y + 1}, ${x + 1}`} maxLength={1} value={values[`${y},${x}`] || ''} onFocus={() => onFocus(y, x)} onChange={e => onType(y, x, e.target.value.slice(-1))} className={!values.__checked || values[`${y},${x}`] === undefined ? '' : normLetter(values[`${y},${x}`]) === c ? 'ok' : 'bad'} />
        : null}
    </div>))}
  </div>
}
const Clues = ({ p }) => <div className="cw-clues">
  <div><h3>מאוזן</h3><ol>{p.across.map(c => <li key={`a${c.n}`}><b>{c.n}.</b> {c.clue} <small>({c.len})</small></li>)}</ol></div>
  <div><h3>מאונך</h3><ol>{p.down.map(c => <li key={`d${c.n}`}><b>{c.n}.</b> {c.clue} <small>({c.len})</small></li>)}</ol></div>
</div>
const cwTitle = p => `תשבץ ${p.label} מס׳ ${p.id.split('-')[1]}`
export function CrosswordList() {
  const data = useData(loadCrosswords)
  const list = data?.CROSSWORDS || []
  return <Page>
    <SEO title="תשחצים להדפסה בחינם — תשבצים מלאים כמו בעיתון, עם פתרונות" description="תשחצים להדפסה בחינם: תשבצים מלאים בסגנון העיתון עם הגדרות בעברית, באותיות גדולות ועם דף פתרון. 9×9 ו־11×11, לפתרון על הדף או על המסך." path="/adults/crosswords" structuredData={faqSchema(CW_FAQ)} />
    <Breadcrumbs items={crumbs({ label: 'תשחצים להדפסה' })} />
    <h1 className="text-center text-5xl font-black">✏️ תשחצים להדפסה</h1>
    <p className="adult-lead">תשבצים מלאים כמו בעיתון — כל משבצת היא חלק ממילה. בוחרים תשבץ, מדפיסים באותיות גדולות, והפתרון בדף נפרד.</p>
    {!data ? <p role="status" className="text-center">טוען…</p> : [11, 9].map(size => <section key={size} className="mt-8">
      <h2 className="mb-3 text-3xl font-black">{size === 11 ? 'תשבצים גדולים (11×11)' : 'תשבצים רגילים (9×9)'}</h2>
      <ul className="adult-cards small">{list.filter(p => p.size === size).map(p => <li key={p.id}><Link to={`/adults/crosswords/${p.id}`} className="adult-card"><span aria-hidden="true">✏️</span><b>{cwTitle(p)}</b><small>{p.across.length + p.down.length} הגדרות</small></Link></li>)}</ul>
    </section>)}
    <div className="mt-12"><SeoBody paragraphs={['תשחץ (תשבץ חידה) הוא משחק המילים האהוב של העיתונים: לכל מילה יש הגדרה, והמילים משתלבות זו בזו לאורך ולרוחב. התשבצים כאן מלאים כמו בעיתון — כמעט כל אות היא חלק משתי מילים, כך שכל תשובה עוזרת לפתור את הבאות.', 'אפשר להדפיס כל תשבץ על דף A4 במשבצות גדולות, עם ההגדרות מתחת לרשת ודף פתרון נפרד, או לפתור על המסך ולבדוק את התשובות בלחיצה. אותיות סופיות נכתבות כרגילות — כמו ברוב התשבצים בעיתונים.']} faq={CW_FAQ} related={[HOME, { label: 'סודוקו להדפסה', href: '/sudoku/print' }, { label: 'תשבצי היגיון', href: '/logic-puzzles' }]} /></div>
  </Page>
}
const CW_FAQ = [
  { q: 'מה ההבדל בין תשחץ לתשבץ?', a: 'בשפה היומיומית משתמשים בשתי המילים לאותו משחק: רשת משבצות עם הגדרות. ״תשחץ״ הוא קיצור של ״תשבץ חידה״. התשבצים כאן הם תשבצי הגדרות רגילים, בסגנון העיתון.' },
  { q: 'איך כותבים אותיות סופיות?', a: 'כמו ברוב העיתונים — אפשר לכתוב אות רגילה או סופית, ובבדיקה על המסך שתיהן נחשבות נכונות. בדף הפתרון האות מופיעה בצורה הסופית כשהיא בסוף המילה.' },
  { q: 'יש פתרונות?', a: 'כן. בכל תשבץ יש דף פתרון נפרד להדפסה, ועל המסך אפשר לבדוק את מה שכתבתם.' },
]
export function CrosswordPage() {
  const { id } = useParams()
  const data = useData(loadCrosswords)
  const p = data?.CROSSWORDS.find(x => x.id === id)
  const [values, setValues] = useState({}), [dir, setDir] = useState('across'), [print, setPrint] = useState(false)
  const at = useRef([0, 0]), cellRefs = useRef({})
  useEffect(() => { setValues({}) }, [id])
  if (data && !p) return <NotFound />
  const move = (y, x) => {
    if (!p) return
    const [dy, dx] = dir === 'across' ? [0, 1] : [1, 0]
    const ny = y + dy, nx = x + dx
    if (!isBlack(p, ny, nx)) cellRefs.current[`${ny},${nx}`]?.focus()
  }
  const onFocus = (y, x) => {
    const [py, px] = at.current
    if (py === y && px === x) return
    // Typing direction follows the word the cell belongs to (across first).
    if (p && (isBlack(p, y, x - 1) && isBlack(p, y, x + 1))) setDir('down'); else if (p && !(isBlack(p, y - 1, x) && isBlack(p, y + 1, x)) && Math.abs(py - y) === 1 && px === x) setDir('down'); else setDir('across')
    at.current = [y, x]
  }
  const onType = (y, x, v) => { const ch = /[א-ת]/.test(v) ? v : ''; setValues(s => { const n = { ...s }; delete n.__checked; if (ch) n[`${y},${x}`] = ch; else delete n[`${y},${x}`]; return n }); if (ch) move(y, x) }
  const filled = p ? Object.keys(values).filter(k => k !== '__checked').length : 0
  const total = p ? p.grid.join('').replace(/#/g, '').length : 0
  const right = p ? Object.entries(values).filter(([k, v]) => k !== '__checked' && normLetter(v) === p.grid[k.split(',')[0]][k.split(',')[1]]).length : 0
  return <Page>
    {p && <SEO title={`${cwTitle(p)} — תשבץ להדפסה עם פתרון`} description={`${cwTitle(p)}: תשבץ ${p.size}×${p.size} מלא כמו בעיתון, עם ${p.across.length + p.down.length} הגדרות בעברית. להדפסה באותיות גדולות עם דף פתרון, או לפתרון על המסך.`} path={`/adults/crosswords/${p.id}`} />}
    <Breadcrumbs items={crumbs({ label: 'תשחצים להדפסה', href: '/adults/crosswords' }, { label: p ? cwTitle(p) : 'תשבץ' })} />
    {!p ? <p role="status" className="text-center">טוען…</p> : <>
      <h1 className="text-center text-4xl font-black">✏️ {cwTitle(p)}</h1>
      <div className="my-5 flex flex-wrap justify-center gap-3">
        <button type="button" className="adult-btn" onClick={() => setPrint(true)}>🖨️ הדפסה (עם דף פתרון)</button>
        <button type="button" className="adult-btn alt" onClick={() => setValues(v => ({ ...v, __checked: true }))}>✔️ בדיקה</button>
        <button type="button" className="adult-btn alt" onClick={() => setValues({})}>🧽 ניקוי</button>
      </div>
      <p className="text-center text-xl">{values.__checked ? `נכונות ${right} מתוך ${filled} אותיות שמילאתם${right === total ? ' — כל הכבוד, פתרתם הכול! 🎉' : ''}` : `מילאתם ${filled} מתוך ${total} משבצות · הכתיבה מתקדמת ${dir === 'across' ? 'מימין לשמאל' : 'מלמעלה למטה'}`}</p>
      <div className="cw-wrap"><Grid p={p} values={values} onType={onType} onFocus={onFocus} cellRefs={cellRefs} /></div>
      <Clues p={p} />
      <nav className="mt-8 flex flex-wrap justify-center gap-3">{(() => { const list = data.CROSSWORDS, i = list.indexOf(p); return <>{i > 0 && <Link className="adult-btn alt" to={`/adults/crosswords/${list[i - 1].id}`}>→ התשבץ הקודם</Link>}{i < list.length - 1 && <Link className="adult-btn alt" to={`/adults/crosswords/${list[i + 1].id}`}>התשבץ הבא ←</Link>}<Link className="adult-btn alt" to="/adults/crosswords">כל התשבצים</Link></> })()}</nav>
      {print && <PrintPreview title={cwTitle(p)} onClose={() => setPrint(false)}>
        <article className="buga-a4 cw-sheet"><h2>{cwTitle(p)}</h2><div className="cw-print-grid"><Grid p={p} /></div><Clues p={p} /><footer>עוגה בוגה · ugabuga.co.il · פנאי למבוגרים</footer></article>
        <article className="buga-a4 cw-sheet"><h2>פתרון — {cwTitle(p)}</h2><div className="cw-print-grid"><Grid p={p} solution /></div><footer>עוגה בוגה · ugabuga.co.il</footer></article>
      </PrintPreview>}
    </>}
  </Page>
}

// ---------- mandala generator ----------
export function MandalaSvg({ seed, level, className }) {
  const m = useMemo(() => makeMandala(seed, level), [seed, level])
  return <svg viewBox="-505 -505 1010 1010" className={className} role="img" aria-label={`מנדלה מס׳ ${seed}`} fill="none" stroke="#111" strokeWidth={m.stroke} strokeLinejoin="round" strokeLinecap="round">
    {m.shapes.map((s, i) => s.rot.map(a => <g key={`${i}-${a}`} transform={`rotate(${a})`}>{s.items.map((it, k) => it.t === 'path' ? <path key={k} d={it.d} /> : <circle key={k} cx={it.cx} cy={it.cy} r={it.r} />)}</g>))}
  </svg>
}
const newSeed = () => 1000 + Math.floor(Math.random() * 99000)
export function MandalaMaker() {
  const [params, setParams] = useSearchParams()
  const seed = Number(params.get('m')) || 4821
  const level = levelById(params.get('l') || 3).id
  const set = (m, l) => setParams({ m: String(m), l: String(l) }, { replace: true })
  const [print, setPrint] = useState(null)
  const sheet = s => <article className="buga-a4" key={s}><h2>מנדלה מס׳ {s}</h2><div className="print-art"><MandalaSvg seed={s} level={level} /></div><footer>עוגה בוגה · ugabuga.co.il · מחולל מנדלות</footer></article>
  return <Page>
    <SEO title="מחולל מנדלות לצביעה — מנדלה חדשה בכל לחיצה, להדפסה בחינם" description="מחולל מנדלות לצביעה: בכל לחיצה נוצרת מנדלה חדשה, מפשוטה עם שטחים גדולים ועד מפורטת מאוד למבוגרים. מדפיסים על A4 בחינם, אחת או חוברת שלמה." path="/adults/mandalas" structuredData={faqSchema(MANDALA_FAQ)} />
    <Breadcrumbs items={crumbs({ label: 'מחולל מנדלות' })} />
    <h1 className="text-center text-5xl font-black">🌸 מחולל מנדלות לצביעה</h1>
    <p className="adult-lead">בכל לחיצה — מנדלה חדשה שאף אחד עוד לא צבע. בוחרים רמת פירוט ומדפיסים.</p>
    <div className="my-5 flex flex-wrap justify-center gap-2">{MANDALA_LEVELS.map(l => <button key={l.id} type="button" aria-pressed={l.id === level} onClick={() => set(seed, l.id)} className={`adult-chip ${l.id === level ? 'on' : ''}`}>{l.label}</button>)}</div>
    <div className="flex flex-wrap justify-center gap-3">
      <button type="button" className="adult-btn" onClick={() => set(newSeed(), level)}>✨ מנדלה חדשה</button>
      <button type="button" className="adult-btn alt" onClick={() => setPrint([seed])}>🖨️ הדפסת המנדלה</button>
      <button type="button" className="adult-btn alt" onClick={() => setPrint(Array.from({ length: 10 }, (_, i) => i ? newSeed() : seed))}>📚 חוברת של 10 מנדלות</button>
    </div>
    <div className="mx-auto my-6 max-w-[620px] rounded-3xl border-2 border-slate-200 bg-white p-4"><MandalaSvg seed={seed} level={level} className="h-auto w-full" /></div>
    <p className="text-center text-lg">מנדלה מס׳ <b>{seed}</b> — אהבתם? שמרו את המספר, או שלחו את הקישור, והיא תחכה לכם כאן.</p>
    {print && <PrintPreview title={print.length > 1 ? 'חוברת מנדלות' : `מנדלה מס׳ ${seed}`} onClose={() => setPrint(null)}>{print.map(sheet)}</PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['מנדלה היא ציור עגול שבו דוגמאות חוזרות סביב מרכז אחד. צביעה של מנדלה מרגיעה ומרכזת: צובעים טבעת אחרי טבעת, ובוחרים צבע לכל דוגמה. המחולל כאן מצייר כל פעם מנדלה אחרת — עלי כותרת, עלים, קשתות, נקודות ומשולשים — בסימטריה מושלמת.', 'ברמה הקלה יש שטחים גדולים וקווים עבים, שמתאימים גם לילדים ולמי שמעדיף טושים עבים. ברמות המפורטות הקווים דקים והדוגמאות קטנות, לצבעי עיפרון מחודדים ולטושים דקים. כל מנדלה מודפסת על דף A4 שלם.']} faq={MANDALA_FAQ} related={[HOME, { label: 'מנדלות מצוירות למבוגרים', href: '/printables/coloring/mandala-adults' }, { label: 'כל המנדלות ודפי היצירה', href: '/printables/mandalas' }]} /></div>
  </Page>
}
const MANDALA_FAQ = [
  { q: 'כמה מנדלות יש?', a: 'כמעט אינסוף. כל מספר מייצר מנדלה אחרת, ואותו מספר תמיד מייצר את אותה מנדלה — כך אפשר לחזור למנדלה שאהבתם או לשלוח אותה לחברים.' },
  { q: 'איזו רמה לבחור?', a: '״קלה״ — לשטחים גדולים ולטושים עבים. ״מפורטת מאוד״ — למי שאוהב צביעה ארוכה ומדויקת בצבעי עיפרון.' },
  { q: 'זה עולה כסף?', a: 'לא. המחולל חינמי, בלי הרשמה, והמנדלות נוצרות במחשב או בטלפון שלכם.' },
]

// ---------- grandparents ----------
export function Grandparents() {
  const data = useData(loadGrand)
  const [where, setWhere] = useState('הכול')
  const acts = (data?.GRANDPARENT_ACTIVITIES || []).filter(a => where === 'הכול' || a.where.startsWith(where))
  return <Page>
    <SEO title="פעילויות עם סבא וסבתא — רעיונות לסבים ולנכדים, גם מרחוק" description="רעיונות לפעילות עם הנכדים: בישול, סיפורים, משחקים, טבע ויצירה — בבית, בחוץ וגם מרחוק בשיחת וידאו. עם משחקים ישנים וטובים וחוברת ראיון סיפור חיים." path="/adults/grandparents" structuredData={data ? faqSchema(data.GRANDPARENT_FAQ) : null} />
    <Breadcrumbs items={crumbs({ label: 'סבא וסבתא עם הנכדים' })} />
    <h1 className="text-center text-5xl font-black">👵👴 סבא וסבתא עם הנכדים</h1>
    <p className="adult-lead">רעיונות לזמן טוב ביחד — בבית, בחוץ, וגם כשגרים רחוק.</p>
    <p className="text-center"><Link to="/adults/grandparents/interview" className="adult-btn">📖 חוברת ״ראיון עם סבא וסבתא״ להדפסה</Link></p>
    {!data ? <p role="status" className="text-center">טוען…</p> : <>
      <div className="my-6 flex flex-wrap justify-center gap-2">{['הכול', 'בבית', 'בחוץ', 'מרחוק'].map(w => <button key={w} type="button" aria-pressed={where === w} onClick={() => setWhere(w)} className={`adult-chip ${where === w ? 'on' : ''}`}>{w === 'מרחוק' ? '📱 מרחוק' : w}</button>)}</div>
      <ul className="grid gap-4 md:grid-cols-2">{acts.map(a => <li key={a.id} className="adult-box">
        <h2 className="text-2xl font-black"><span aria-hidden="true">{a.emoji}</span> {a.title}</h2>
        <p className="text-slate-600">{a.ages} · {a.where} · {a.time}</p>
        {a.need && <p><b>מה צריך:</b> {a.need}</p>}
        <ol className="mt-2 list-decimal pr-6">{a.how.map(s => <li key={s}>{s}</li>)}</ol>
        {a.tip && <p className="mt-2 rounded-xl bg-amber-50 p-2">💡 {a.tip}</p>}
      </li>)}</ul>
      <h2 className="mt-12 mb-4 text-3xl font-black">🎲 משחקים ישנים וטובים לשחק עם הנכדים</h2>
      <ul className="grid gap-4 md:grid-cols-3">{data.GRANDPARENT_GAMES.map(g => <li key={g.id} className="adult-box"><h3 className="text-xl font-black">{g.emoji} {g.title}</h3><p className="text-slate-600">{g.ages} · {g.players}</p><ol className="mt-2 list-decimal pr-6">{g.how.map(s => <li key={s}>{s}</li>)}</ol></li>)}</ul>
      <div className="mt-12"><SeoBody paragraphs={['הזמן עם סבא וסבתא הוא מהזיכרונות הכי חזקים של הילדות. לא צריך תוכנית מסובכת: עוגה שאופים יחד, סיפור מפעם, משחק קלפים או טיול קצר בשכונה — מספיקים כדי ליצור קשר עמוק.', 'גם כשגרים רחוק אפשר להישאר קרובים: לקרוא סיפור בשיחת וידאו, לשחק ״20 שאלות״ בטלפון או לצבוע את אותו דף כל אחד בבית שלו ולהשוות. בעמוד יש רעיונות לכל מצב, לפי גיל ומקום.']} faq={data.GRANDPARENT_FAQ} related={[HOME, { label: 'עבודת שורשים', href: '/printables/roots-project' }, { label: 'ברכות לסבא וסבתא', href: '/greetings/age-80' }]} /></div>
    </>}
  </Page>
}
export function GrandparentsInterview() {
  const data = useData(loadGrand)
  const [print, setPrint] = useState(false)
  const book = data?.INTERVIEW || []
  return <Page>
    <SEO title="ראיון עם סבא וסבתא — שאלות לחוברת סיפור חיים להדפסה" description="חוברת ראיון עם סבא וסבתא להדפסה: שאלות על ילדות, בית ההורים, בית הספר, משפחה, עבודה, חגים ועצות לנכדים. מתאים לעבודת שורשים ולשמירת הזיכרונות של המשפחה." path="/adults/grandparents/interview" />
    <Breadcrumbs items={crumbs({ label: 'סבא וסבתא עם הנכדים', href: '/adults/grandparents' }, { label: 'ראיון סיפור חיים' })} />
    <h1 className="text-center text-5xl font-black">📖 ראיון עם סבא וסבתא</h1>
    <p className="adult-lead">הנכדים שואלים, סבא וסבתא מספרים — ונשארת חוברת עם הסיפור של המשפחה.</p>
    <p className="text-center"><button type="button" className="adult-btn" onClick={() => setPrint(true)} disabled={!data}>🖨️ הדפסת החוברת (עם מקום לכתוב)</button></p>
    {!data ? <p role="status" className="text-center">טוען…</p> : <div className="mt-6 space-y-5">{book.map(s => <section key={s.title} className="adult-box"><h2 className="text-2xl font-black">{s.emoji} {s.title}</h2><ol className="mt-2 list-decimal space-y-1 pr-6 text-xl">{s.questions.map(q => <li key={q}>{q}</li>)}</ol></section>)}</div>}
    {print && <PrintPreview title="ראיון עם סבא וסבתא" onClose={() => setPrint(false)}>
      <article className="buga-a4 interview-sheet"><h2>הסיפור של סבא וסבתא</h2><p className="iv-line">מראיין/ת: ____________________</p><p className="iv-line">מרואיין/ת: ____________________</p><p className="iv-line">תאריך: ____________</p><div className="iv-photo">כאן מדביקים תמונה</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>
      {book.map(s => <article className="buga-a4 interview-sheet" key={s.title}><h2>{s.emoji} {s.title}</h2>{s.questions.map(q => <div key={q} className="iv-q"><b>{q}</b><span /><span /></div>)}<footer>עוגה בוגה · ugabuga.co.il</footer></article>)}
    </PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['ראיון עם סבא וסבתא הוא דרך נפלאה לשמור על הסיפור של המשפחה — ולגלות דברים שאף פעם לא שאלתם. החוברת מחולקת לנושאים, מהילדות ועד העצות לנכדים, ואפשר לבחור את השאלות שמתאימות לכם.', 'טיפ: הקליטו את השיחה בטלפון (באישור המרואיינים), הוסיפו תמונות ישנות ליד התשובות, ושלחו עותק לכל המשפחה. החוברת מתאימה גם לעבודת שורשים בבית הספר.']} faq={[{ q: 'לאיזה גיל מתאים לראיין?', a: 'ילדים מגיל 7 בערך יכולים לשאול חלק מהשאלות, ומכיתה ד׳ אפשר לנהל ראיון שלם ולכתוב את התשובות.' }, { q: 'זה מתאים לעבודת שורשים?', a: 'כן. השאלות מכסות את הנושאים שנשאלים בעבודת שורשים, ויש גם עמוד עבודת שורשים מלא באתר.' }]} related={[{ label: 'עבודת שורשים להדפסה', href: '/printables/roots-project' }, { label: 'פעילויות עם סבא וסבתא', href: '/adults/grandparents' }, HOME]} /></div>
  </Page>
}
