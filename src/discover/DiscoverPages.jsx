import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import { Sheet, T } from '../components/printables/PrintableShell'
import Flag, { FLAG_CODES } from './Flags'
import { IL_PLACES, IL_OUTLINE, IL_KINNERET, IL_DEADSEA, COUNTRIES, NOT_CAPITALS, CAPITAL_NOTES, PLANETS, SPACE_FACTS, ORGANS, BODY_FACTS } from './discoverData'
import { SPACE_QUIZ, BODY_QUIZ } from './quizzes'
import '../learn/learn.css'

export const DISCOVER_CRUMB = { label: 'עולם ומדע', href: '/discover' }
const rnd = n => Math.floor(Math.random() * n)
const shuffle = a => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = rnd(i + 1);[x[i], x[j]] = [x[j], x[i]] } return x }
const Chip = ({ on, onClick, children, ...rest }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick} {...rest}>{children}</button>
const Page = ({ children, wide }) => <div className={`mx-auto ${wide ? 'max-w-5xl' : 'max-w-4xl'} px-4 py-8 buga-fade-in`} dir="rtl">{children}</div>
function Head({ emoji, h1, sub, crumb }) {
  return <>
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, ...(crumb ? [DISCOVER_CRUMB, { label: crumb }] : [{ label: DISCOVER_CRUMB.label }])]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{emoji} </span>{h1}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">{sub}</p>
  </>
}
const A4 = ({ children }) => <article className="buga-a4"><div className="print-art">{children}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>

// Multiple-choice quiz: items = [{ prompt(node), answer, options, note }]
function Quiz({ make, title = 'חידון' }) {
  const [items, setItems] = useState(null)
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  const start = () => { setItems(make()); setI(0); setPick(null); setScore(0) }
  if (!items) return <div className="text-center"><button type="button" className="ln-btn go" onClick={start}>▶ {title}</button></div>
  if (i >= items.length) return <div className="ln-box text-center space-y-3"><h3 className="text-3xl font-black">{score} מתוך {items.length} {score === items.length ? '🌟' : score >= items.length * 0.7 ? '👏' : ''}</h3><button type="button" className="ln-btn go" onClick={start}>🔁 חידון חדש</button></div>
  const q = items[i]
  const choose = o => { if (pick != null) return; setPick(o); if (o === q.answer) setScore(s => s + 1) }
  return <div className="ln-box space-y-3">
    <div className="flex justify-between font-bold"><span>שאלה {i + 1} מתוך {items.length}</span><span>✅ {score}</span></div>
    <div className="text-center text-2xl font-black">{q.prompt}</div>
    <div className="grid gap-2 sm:grid-cols-2">{q.options.map(o => <button key={o} type="button" onClick={() => choose(o)} className={`ln-opt !text-center !text-lg font-bold ${pick != null && o === q.answer ? 'is-right' : ''} ${pick === o && o !== q.answer ? 'is-wrong' : ''}`}>{o}</button>)}</div>
    {pick != null && <div className="text-center space-y-2">{q.note && <p className="m-0">💡 {q.note}</p>}<button type="button" className="ln-btn" onClick={() => { setI(i + 1); setPick(null) }}>{i + 1 < items.length ? 'הבאה ◀' : 'לתוצאה'}</button></div>}
  </div>
}
const fromBank = (bank, n = 10) => () => shuffle(bank).slice(0, n).map(([q, a, wrong, note]) => ({ prompt: q, answer: a, options: shuffle([a, ...wrong]), note }))

// ── /discover ───────────────────────────────
export const DISCOVER_SECTIONS = [
  ['/discover/israel-map', '🗺️', 'מפת ישראל — איפה העיר?', 'לומדים ערים ומקומות בארץ, ומשחקים "איפה זה?"'],
  ['/discover/capitals', '🌍', 'בירות ודגלים', `${COUNTRIES.length} מדינות, ${FLAG_CODES.length} דגלים מצוירים וחידונים`],
  ['/discover/solar-system', '🪐', 'מערכת השמש', 'שמונה כוכבי לכת, עובדות וחידון'],
  ['/discover/human-body', '🫀', 'גוף האדם', 'לוחצים על איבר ולומדים מה הוא עושה'],
]
export function DiscoverHub() {
  return <Page>
    <SEO title="עולם ומדע לילדים — מפת ישראל, בירות ודגלים, מערכת השמש וגוף האדם" description="לומדים ומשחקים: מפת ישראל עם חידון ערים, בירות ודגלים של העולם, מערכת השמש וגוף האדם — עם עובדות בדוקות, חידונים ודפים להדפסה. חינם ובעברית." path="/discover" />
    <Head emoji="🔭" h1="עולם ומדע" sub="מפות, כוכבים וגוף האדם — לומדים, משחקים ומדפיסים" />
    <div className="grid gap-5 sm:grid-cols-2">{DISCOVER_SECTIONS.map(([to, e, t, d]) => <Link key={to} to={to} className="wobbly card-lift border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow p-5 text-right"><div className="text-4xl mb-2" aria-hidden="true">{e}</div><h2 className="text-2xl font-bold">{t}</h2><p className="text-[var(--muted-foreground)]">{d}</p></Link>)}</div>
    <div className="mt-12"><SeoBody paragraphs={['ילדים שואלים שאלות גדולות: איפה נמצאת אילת? מה הבירה של צרפת? למה מאדים אדום? כמה עצמות יש לנו? כאן יש ארבעה אזורים קטנים שעונים על השאלות האלה — עם משחק, חידון ודף להדפסה בכל אחד.', 'העובדות נכתבו בפשטות אבל בדיוק: נתוני כוכבי הלכת לפי דף הנתונים של נאס״א, ועובדות על גוף האדם לפי מקורות מקובלים באנטומיה. השתדלנו להימנע ממספרים שמשתנים כל הזמן, כמו מספר הירחים של שבתאי.']} related={[{ label: 'לומדים בבית', href: '/learn' }, { label: 'חידון טריוויה', href: '/tools/trivia-quiz' }]} /></div>
  </Page>
}

// ── Israel map ───────────────────────────────
const KX = Math.cos((31.5 * Math.PI) / 180)
const px = ([lat, lon]) => [((lon - 34.12) * KX * 100).toFixed(1), ((33.5 - lat) * 100).toFixed(1)]
const poly = pts => pts.map(p => px(p).join(',')).join(' ')
const MAP_W = (35.98 - 34.12) * KX * 100, MAP_H = (33.5 - 29.42) * 100
function IsraelMap({ marks = {}, onPick, labels, numbers, size = 1 }) {
  return <g>
    <polygon points={poly(IL_OUTLINE)} fill="#f3ead2" stroke="#7a6a45" strokeWidth={1.2 * size} strokeLinejoin="round" />
    <polygon points={poly(IL_KINNERET)} fill="#8ec5ec" stroke="#4a8fc0" strokeWidth=".6" />
    <polygon points={poly(IL_DEADSEA)} fill="#8ec5ec" stroke="#4a8fc0" strokeWidth=".6" />
    <text x="6" y="190" fontSize={9 * size} fill="#4a8fc0" fontWeight="700" direction="rtl" textAnchor="start" transform="rotate(-70 6 190)">הים התיכון</text>
    {IL_PLACES.map(([id, name, lat, lon, kind], i) => {
      const [x, y] = px([lat, lon]).map(Number)
      const m = marks[id]
      const fill = m === 'right' ? '#2e9e2b' : m === 'wrong' ? '#d33' : m === 'hint' ? '#ffd23f' : kind === 'place' ? '#7548b3' : '#1d2233'
      return <g key={id} onClick={onPick ? () => onPick(id) : undefined} style={onPick ? { cursor: 'pointer' } : undefined}>
        {onPick && <circle cx={x} cy={y} r="9" fill="transparent" />}
        {kind === 'place' ? <rect x={x - 3.2 * size} y={y - 3.2 * size} width={6.4 * size} height={6.4 * size} transform={`rotate(45 ${x} ${y})`} fill={fill} stroke="#fff" strokeWidth=".8" /> : <circle cx={x} cy={y} r={3.4 * size} fill={fill} stroke="#fff" strokeWidth=".8" />}
        {labels && <text x={x - 5} y={y + 2.5} fontSize={6.2 * size} fontWeight="700" textAnchor="end" direction="rtl" paintOrder="stroke" stroke="#fff" strokeWidth="2.2" fill="#1d2233">{name}</text>}
        {numbers && <text x={x + 5} y={y + 2.5} fontSize={6.5 * size} fontWeight="800" textAnchor="start" fill="#c0392b" paintOrder="stroke" stroke="#fff" strokeWidth="2">{numbers[id]}</text>}
      </g>
    })}
  </g>
}
export function IsraelMapPage() {
  const [mode, setMode] = useState('learn')
  const [shown, setShown] = useState(null)
  const [labels, setLabels] = useState(false)
  const [game, setGame] = useState(null) // {order, i, score, marks}
  const [printing, setPrinting] = useState(null)
  const byId = Object.fromEntries(IL_PLACES.map(p => [p[0], p]))
  const start = () => setGame({ order: shuffle(IL_PLACES.map(p => p[0])).slice(0, 10), i: 0, score: 0, marks: {}, wait: false })
  const pickQuiz = id => {
    if (!game || game.wait || game.i >= game.order.length) return
    const target = game.order[game.i], ok = id === target
    const marks = ok ? { [id]: 'right' } : { [id]: 'wrong', [target]: 'hint' }
    setGame({ ...game, marks, wait: true, score: game.score + (ok ? 1 : 0), last: ok })
    setTimeout(() => setGame(g => ({ ...g, i: g.i + 1, marks: {}, wait: false })), ok ? 700 : 1600)
  }
  const target = game && game.i < game.order.length ? byId[game.order[game.i]] : null
  const printSet = useMemo(() => shuffle(IL_PLACES.filter(p => p[4] === 'city')).slice(0, 14), [printing]) // eslint-disable-line react-hooks/exhaustive-deps
  const numbers = Object.fromEntries(printSet.map((p, i) => [p[0], i + 1]))
  const sc = 250 / MAP_H
  const mapSheet = (answers) => <Sheet label="מפת ישראל">
    <T x={100} y={12} size={8} weight={900}>{answers ? 'מפת ישראל — תשובות' : 'מפת ישראל: מה המספר של כל עיר?'}</T>
    <g transform={`translate(8 18) scale(${sc})`}><IsraelMap labels={answers === 'all'} numbers={answers === 'all' ? null : numbers} size={1.25} /></g>
    {answers !== 'all' && <g>{printSet.map((p, i) => <g key={p[0]}><T x={192} y={34 + i * 15} size={6} anchor="start">{answers ? `${i + 1}. ${p[1]}` : '___  '}{answers ? '' : p[1]}</T></g>)}
      {!answers && <T x={192} y={34 + printSet.length * 15 + 6} size={4.5} anchor="start" fill="#555">כותבים ליד כל עיר את המספר שלה במפה</T>}</g>}
  </Sheet>
  return <Page>
    <SEO title="מפת ישראל לילדים — חידון ערים: איפה נמצאת העיר?" description="מפת ישראל אינטראקטיבית לילדים: לוחצים על נקודה ולומדים איפה ירושלים, חיפה, אילת, טבריה ועוד 26 ערים ומקומות. משחק 'איפה זה?' ודף עבודה להדפסה עם מפה." path="/discover/israel-map" />
    <Head emoji="🗺️" h1="מפת ישראל — איפה העיר?" sub="לוחצים על נקודה ולומדים — ואז בודקים: איפה נמצאת העיר?" crumb="מפת ישראל" />
    <div className="flex flex-wrap justify-center gap-2 mb-4"><Chip on={mode === 'learn'} onClick={() => { setMode('learn'); setGame(null) }}>📍 לומדים</Chip><Chip on={mode === 'quiz'} onClick={() => { setMode('quiz'); start() }}>🎯 משחק: איפה זה?</Chip>
      {mode === 'learn' && <Chip on={labels} onClick={() => setLabels(!labels)}>🏷️ להראות את כל השמות</Chip>}</div>
    <div className="grid items-start gap-4 md:grid-cols-[1fr_minmax(0,320px)]">
      <div className="ln-box">
        {mode === 'learn' && <p className="text-center text-xl font-bold min-h-[2em]">{shown ? `${shown[4] === 'place' ? '◆' : '●'} ${shown[1]}` : 'לוחצים על נקודה במפה'}</p>}
        {mode === 'quiz' && target && <p className="text-center text-xl font-bold min-h-[2em]">איפה נמצא/ת: <span className="text-2xl text-[#7548b3]">{target[1]}</span>?</p>}
        {mode === 'quiz' && game && !target && <div className="text-center space-y-2"><p className="text-2xl font-black">{game.score} מתוך {game.order.length}</p><button type="button" className="ln-btn go" onClick={start}>🔁 שוב</button></div>}
        <svg viewBox={`-4 -4 ${MAP_W + 8} ${MAP_H + 8}`} className="mx-auto block w-full max-h-[78vh]" role="img" aria-label="מפה סכמטית של ישראל">
          <IsraelMap labels={mode === 'learn' && labels} onPick={mode === 'learn' ? id => setShown(byId[id]) : pickQuiz} marks={mode === 'quiz' ? game?.marks : shown ? { [shown[0]]: 'hint' } : {}} />
        </svg>
        <p className="text-center text-xs text-[var(--muted-foreground)] m-0">מפה סכמטית ● עיר ◆ מקום בטבע</p>
      </div>
      <div className="space-y-3">
        <div className="ln-box"><h2 className="text-xl font-black">🖨️ להדפסה</h2><div className="mt-2 flex flex-col gap-2"><button type="button" className="ln-btn alt" onClick={() => setPrinting('work')}>דף עבודה: מספרים במפה</button><button type="button" className="ln-btn alt" onClick={() => setPrinting('all')}>מפה עם כל השמות</button></div></div>
        {mode === 'learn' && <div className="ln-box"><h2 className="text-xl font-black">כל המקומות</h2><div className="mt-2 flex flex-wrap gap-1">{IL_PLACES.map(p => <button key={p[0]} type="button" className="ln-chip !min-h-[36px] !py-1 !px-3 text-sm" aria-pressed={shown?.[0] === p[0]} onClick={() => setShown(p)}>{p[1]}</button>)}</div></div>}
      </div>
    </div>
    {printing && <PrintPreview title="מפת ישראל" onClose={() => setPrinting(null)} onRefresh={printing === 'work' ? () => setPrinting(p => (p === 'work' ? 'work ' : 'work')) : undefined}>
      {printing.startsWith('work') ? [<A4 key="w">{mapSheet(false)}</A4>, <A4 key="a">{mapSheet(true)}</A4>] : <A4>{mapSheet('all')}</A4>}
    </PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['ישראל קטנה, אבל יש בה הרבה מה ללמוד: ערים על חוף הים ובהרים, אגם של מים מתוקים — הכנרת, והמקום הנמוך ביבשה בעולם — ים המלח. המפה כאן מראה 25 ערים ו-5 מקומות מיוחדים בטבע, במיקום לפי קואורדינטות אמיתיות.', 'במצב "לומדים" לוחצים על נקודה ורואים את שמה. במשחק "איפה זה?" מופיע שם של עיר, וצריך ללחוץ על הנקודה הנכונה. טעיתם? הנקודה הנכונה תידלק בצהוב.', 'המפה סכמטית ומיועדת ללמידה: היא מראה את קו החוף, הכנרת וים המלח ואת המיקום היחסי של הערים, ולא מסמנת גבולות מדיניים.']} faq={[{ q: 'איך מלמדים ילדים את מפת ישראל?', a: 'מתחילים מ"עוגנים": ירושלים, תל אביב, חיפה, באר שבע ואילת, ומהמים — הים התיכון, הכנרת וים המלח. אחר כך מוסיפים את הערים שהילד מכיר — איפה גרים סבא וסבתא, לאן נסענו בחופש.' }]} related={[{ label: 'בירות ודגלים', href: '/discover/capitals' }, { label: 'קטע קריאה: ים המלח', href: '/learn/reading/dead-sea' }, { label: 'קטע קריאה: הכנרת', href: '/learn/reading/kinneret' }]} /></div>
  </Page>
}

// ── capitals & flags ───────────────────────────────
const flagged = COUNTRIES.filter(c => FLAG_CODES.includes(c[0]))
function makeFlagQuiz() { return shuffle(flagged).slice(0, 10).map(c => ({ prompt: <Flag code={c[0]} className="mx-auto block h-28 w-auto max-w-full" label="איזה דגל זה?" />, answer: c[1], options: shuffle([c[1], ...shuffle(flagged.filter(x => x !== c)).slice(0, 3).map(x => x[1])]) })) }
function makeCapitalQuiz() {
  return shuffle(COUNTRIES).slice(0, 10).map(c => {
    const wrong = shuffle([...COUNTRIES.filter(x => x !== c && x[3] === c[3]).map(x => x[2]), ...NOT_CAPITALS]).slice(0, 3)
    return { prompt: <>מה הבירה של {c[1]}?</>, answer: c[2], options: shuffle([c[2], ...wrong]), note: CAPITAL_NOTES[c[0]] }
  })
}
export function CapitalsPage() {
  const [cont, setCont] = useState('הכול')
  const [mode, setMode] = useState('flags')
  const [printing, setPrinting] = useState(null)
  const conts = ['הכול', ...new Set(COUNTRIES.map(c => c[3]))]
  const list = COUNTRIES.filter(c => cont === 'הכול' || c[3] === cont)
  const sheet = (set, answers) => <Sheet label="דגלים">
    <T x={100} y={12} size={8} weight={900}>{answers ? 'דגלים — תשובות' : 'של מי הדגל?'}</T>
    {set.map((c, i) => { const col = i % 3, row = Math.floor(i / 3), x = 136 - col * 62, y = 22 + row * 50
      return <g key={c[0]}><svg x={x} y={y} width="56" height="30" viewBox="0 0 56 30" preserveAspectRatio="xMidYMid meet"><Flag code={c[0]} /></svg>
        <T x={x + 28} y={y + 40} size={answers ? 6 : 5}>{answers ? `${c[1]} · ${c[2]}` : '___________'}</T></g> })}
  </Sheet>
  const printSet = useMemo(() => shuffle(flagged).slice(0, 15), [printing]) // eslint-disable-line react-hooks/exhaustive-deps
  return <Page wide>
    <SEO title="בירות ודגלים — חידון בירות העולם ודגלי מדינות לילדים" description={`חידון בירות ודגלים: ${COUNTRIES.length} מדינות ובירות, ${FLAG_CODES.length} דגלים בצבעים הרשמיים. משחק "של מי הדגל?", חידון "מה הבירה?", טבלה לפי יבשות ודף דגלים להדפסה.`} path="/discover/capitals" structuredData={faqSchema([{ q: 'מה הבירה של אוסטרליה?', a: 'קנברה. הרבה חושבים שזו סידני, שהיא העיר הגדולה במדינה — אבל הבירה היא קנברה.' }, { q: 'מה הבירה של טורקיה?', a: 'אנקרה. איסטנבול היא העיר הגדולה והמפורסמת, אבל הבירה היא אנקרה.' }])} />
    <Head emoji="🌍" h1="בירות ודגלים" sub="מזהים דגלים, זוכרים בירות — ומגלים כמה הפתעות בדרך" crumb="בירות ודגלים" />
    <div className="mb-4 flex flex-wrap justify-center gap-2"><Chip on={mode === 'flags'} onClick={() => setMode('flags')}>🏳️ של מי הדגל?</Chip><Chip on={mode === 'capitals'} onClick={() => setMode('capitals')}>🏛️ מה הבירה?</Chip></div>
    <div className="mx-auto max-w-2xl"><Quiz key={mode} make={mode === 'flags' ? makeFlagQuiz : makeCapitalQuiz} title={mode === 'flags' ? 'מתחילים חידון דגלים' : 'מתחילים חידון בירות'} /></div>
    <div className="mt-4 flex flex-wrap justify-center gap-2"><button type="button" className="ln-btn alt" onClick={() => setPrinting('flags')}>🖨️ דף "של מי הדגל?"</button></div>
    <h2 className="mt-10 mb-3 text-2xl font-black text-center">מדינות, בירות ודגלים</h2>
    <div className="mb-3 flex flex-wrap justify-center gap-2">{conts.map(c => <Chip key={c} on={cont === c} onClick={() => setCont(c)}>{c}</Chip>)}</div>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{list.map(c => <div key={c[0]} className="ln-q flex items-center gap-3">{FLAG_CODES.includes(c[0]) ? <Flag code={c[0]} className="h-9 w-auto max-w-[64px] shrink-0" label={`הדגל של ${c[1]}`} /> : <span className="inline-block h-9 w-[54px] shrink-0 rounded border border-dashed border-gray-300" aria-hidden="true" />}<div><b>{c[1]}</b><div className="text-sm">הבירה: <b>{c[2]}</b></div>{CAPITAL_NOTES[c[0]] && <div className="text-xs text-[var(--muted-foreground)]">{CAPITAL_NOTES[c[0]]}</div>}</div></div>)}</div>
    {printing && <PrintPreview title="של מי הדגל?" onClose={() => setPrinting(null)} onRefresh={() => setPrinting(p => (p === 'flags' ? 'flags ' : 'flags'))}><A4>{sheet(printSet, false)}</A4><A4>{sheet(printSet, true)}</A4></PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['בירות ודגלים הם דרך כיפית להכיר את העולם: כל דגל מספר משהו על המדינה, וכל בירה היא נקודת התחלה לשיחה — איפה זה, איזו שפה מדברים שם, מה אוכלים.', 'הדגלים כאן מצוירים בצבעים ובפרופורציות הרשמיות. דגלים עם סמלים מורכבים מאוד (כמו של ספרד, קנדה או ברזיל) לא נכללו במשחק הדגלים כדי לא להציג אותם באופן לא מדויק — אבל הבירות שלהן כן נמצאות בחידון.', 'בחידון הבירות יש גם מלכודות מוכרות: סידני, ניו יורק ואיסטנבול הן ערים ענקיות — אבל לא בירות.']} related={[{ label: 'מפת ישראל', href: '/discover/israel-map' }, { label: 'כרטיסיות לימוד משלכם', href: '/learn/flashcards' }]} /></div>
  </Page>
}

// ── solar system ───────────────────────────────
const SR = PLANETS.map(p => Math.min(9, 1.6 + Math.sqrt(p.d / 142984) * 8.5))
const SW = SR.map((r, i) => (PLANETS[i].id === 'saturn' ? r * 1.9 : r))
const SX = SW.reduce((a, w, i) => [...a, i ? a[i - 1] - SW[i - 1] - w - 4 : 162 - w], [])
const pr = d => 4 + Math.sqrt(d / 142984) * 26 // display radius (not to scale for small planets)
export function SolarSystem() {
  const [sel, setSel] = useState(PLANETS[2])
  const [printing, setPrinting] = useState(false)
  const sheet = labels => <Sheet label="מערכת השמש">
    <T x={100} y={14} size={8} weight={900}>{labels ? 'מערכת השמש' : 'מערכת השמש — כתבו את שמות כוכבי הלכת'}</T>
    <circle cx={214} cy={140} r={44} fill="#ffd23f" stroke="#e0a800" /><T x={186} y={142} size={6} weight={800}>השמש</T>
    {PLANETS.map((p, i) => { const y = 140, r = SR[i], x = SX[i]
      return <g key={p.id}>{p.id === 'saturn' && <ellipse cx={x} cy={y} rx={r * 1.9} ry={r * 0.5} fill="none" stroke="#b69b5f" strokeWidth=".8" />}<circle cx={x} cy={y} r={r} fill={labels ? p.color : '#fff'} stroke="#555" strokeWidth=".5" />
        <T x={x} y={i % 2 ? y + 22 : y - 16} size={4.4} weight={700}>{labels ? p.name : `${i + 1}. ______`}</T></g> })}
    <T x={100} y={200} size={4.5} fill="#555">{labels ? 'הגדלים של כוכבי הלכת מוקטנים ביחס לשמש, והמרחקים לא בקנה מידה.' : 'רמז: הקרוב ביותר לשמש הוא כוכב חמה, והרחוק ביותר — נפטון.'}</T>
  </Sheet>
  return <Page wide>
    <SEO title="מערכת השמש לילדים — כוכבי הלכת, עובדות וחידון" description="מערכת השמש לילדים: שמונה כוכבי הלכת לפי הסדר — כוכב חמה, נוגה, כדור הארץ, מאדים, צדק, שבתאי, אורנוס ונפטון. לוחצים על כוכב לכת ומגלים עובדות, חידון ודף עבודה להדפסה." path="/discover/solar-system" />
    <Head emoji="🪐" h1="מערכת השמש" sub="לוחצים על כוכב לכת — ומגלים עליו דברים מפתיעים" crumb="מערכת השמש" />
    <div className="ln-box overflow-x-auto" style={{ background: '#0f1430' }}>
      <svg viewBox="0 0 640 120" className="block min-w-[560px] w-full" role="img" aria-label="כוכבי הלכת לפי הסדר מהשמש">
        <circle cx="660" cy="60" r="70" fill="#ffd23f" />
        {PLANETS.map((p, i) => { const x = 560 - i * 72, r = pr(p.d); return <g key={p.id} onClick={() => setSel(p)} style={{ cursor: 'pointer' }}>
          <circle cx={x} cy="55" r="34" fill="transparent" />
          {p.id === 'saturn' && <ellipse cx={x} cy="55" rx={r * 1.9} ry={r * 0.45} fill="none" stroke="#d8c08a" strokeWidth="3" />}
          <circle cx={x} cy="55" r={r} fill={p.color} stroke={sel.id === p.id ? '#fff' : 'none'} strokeWidth="2.5" />
          <text x={x} y="108" fontSize="11" fill={sel.id === p.id ? '#ffd23f' : '#cfd3e0'} textAnchor="middle" fontWeight="700" direction="rtl">{p.name}</text></g> })}
      </svg>
    </div>
    <div className="ln-box mt-4"><h2 className="text-3xl font-black"><span className="inline-block h-6 w-6 rounded-full align-middle" style={{ background: sel.color }} aria-hidden="true" /> {sel.name}</h2>
      <p className="font-bold text-[var(--muted-foreground)]">מקום {PLANETS.indexOf(sel) + 1} מהשמש · {sel.kind} · קוטר: {sel.d.toLocaleString('he-IL')} ק״מ · שנה אחת: {sel.year}</p>
      <ul className="text-lg leading-relaxed list-disc pr-5">{sel.facts.map(f => <li key={f}>{f}</li>)}</ul></div>
    <div className="ln-box mt-4"><h2 className="text-xl font-black">🌞 ועוד כמה עובדות</h2><ul className="list-disc pr-5">{SPACE_FACTS.map(f => <li key={f}>{f}</li>)}</ul></div>
    <h2 className="mt-8 mb-3 text-2xl font-black text-center">חידון חלל</h2>
    <div className="mx-auto max-w-2xl"><Quiz make={fromBank(SPACE_QUIZ)} title="מתחילים חידון חלל" /></div>
    <div className="mt-4 text-center"><button type="button" className="ln-btn alt" onClick={() => setPrinting(true)}>🖨️ דף עבודה: סדר כוכבי הלכת</button></div>
    {printing && <PrintPreview title="מערכת השמש" onClose={() => setPrinting(false)}><A4>{sheet(false)}</A4><A4>{sheet(true)}</A4></PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['במערכת השמש שמונה כוכבי לכת. ארבעת הקרובים לשמש — כוכב חמה, נוגה, כדור הארץ ומאדים — הם כוכבי לכת סלעיים. ארבעת הרחוקים — צדק, שבתאי, אורנוס ונפטון — הם ענקים עשויים בעיקר גזים וקרח.', 'הגדלים בתמונה מראים את ההבדלים בין כוכבי הלכת, אבל לא בקנה מידה מדויק: אם צדק היה בגודל של כדורגל, כדור הארץ היה בערך בגודל של אפונה. הנתונים (קוטר ואורך השנה) לקוחים מדף הנתונים של נאס״א.']} faq={[{ q: 'מה סדר כוכבי הלכת מהשמש?', a: 'כוכב חמה, נוגה, כדור הארץ, מאדים, צדק, שבתאי, אורנוס ונפטון.' }, { q: 'האם פלוטו הוא כוכב לכת?', a: 'מאז 2006 פלוטו מוגדר ככוכב לכת ננסי, ולכן במערכת השמש יש שמונה כוכבי לכת.' }]} related={[{ label: 'גוף האדם', href: '/discover/human-body' }, { label: 'ניסויים במטבח', href: '/food/kitchen-science' }]} /></div>
  </Page>
}

// ── human body ───────────────────────────────
function Body({ active, onPick, labels }) {
  const on = id => ({ onClick: onPick ? () => onPick(id) : undefined, style: onPick ? { cursor: 'pointer' } : undefined, stroke: active === id ? '#1d2233' : 'rgba(0,0,0,.25)', strokeWidth: active === id ? 2.2 : 0.8 })
  const L = labels ? [['brain', 'המוח', 100, 34, 'r', 30], ['lungs', 'הריאות', 82, 108, 'l', 92], ['heart', 'הלב', 108, 124, 'r', 116], ['liver', 'הכבד', 80, 148, 'l', 140], ['stomach', 'הקיבה', 118, 152, 'r', 152], ['kidneys', 'הכליות', 74, 176, 'l', 178], ['intestines', 'המעיים', 112, 190, 'r', 196], ['bones', 'השלד (עצם הירך)', 82, 260, 'l', 262], ['skin', 'העור', 128, 300, 'r', 300]] : []
  return <g>
    <g {...on('skin')} fill="#fde3c8">
      <circle cx="100" cy="38" r="28" /><rect x="90" y="62" width="20" height="18" /><rect x="60" y="76" width="80" height="134" rx="26" />
      <rect x="36" y="84" width="20" height="122" rx="10" transform="rotate(8 46 84)" /><rect x="144" y="84" width="20" height="122" rx="10" transform="rotate(-8 154 84)" />
      <rect x="66" y="196" width="30" height="156" rx="13" /><rect x="104" y="196" width="30" height="156" rx="13" />
    </g>
    <ellipse cx="100" cy="32" rx="21" ry="15" fill="#f4a6b8" {...on('brain')} />
    <path d="M100 26 q-6 -6 -12 0 M100 30 q8 -7 14 1 M88 36 q6 4 12 0" stroke="#c97a8f" strokeWidth=".8" fill="none" pointerEvents="none" />
    <g {...on('lungs')} fill="#f6b1a6"><ellipse cx="82" cy="110" rx="15" ry="26" /><ellipse cx="119" cy="110" rx="12" ry="23" /></g>
    <path d="M108 116 c-6 -8 -16 -2 -10 8 l10 10 l10 -10 c6 -10 -4 -16 -10 -8 z" fill="#d62839" {...on('heart')} />
    <path d="M62 140 q20 -10 46 0 q-6 18 -40 16 q-8 -6 -6 -16 z" fill="#9c4a2f" {...on('liver')} />
    <path d="M112 142 q16 -6 20 8 q2 14 -16 16 q-8 0 -8 -8 q8 -2 6 -10 z" fill="#e88a5c" {...on('stomach')} />
    <g {...on('kidneys')} fill="#8e3b46"><ellipse cx="72" cy="176" rx="6" ry="10" /><ellipse cx="128" cy="176" rx="6" ry="10" /></g>
    <g {...on('intestines')}><rect x="80" y="166" width="40" height="38" rx="12" fill="#f2b880" /><path d="M86 174 h28 q4 6 0 8 h-28 q-4 6 0 8 h28 q4 6 0 8 h-28" stroke="#d99256" strokeWidth="1.6" fill="none" pointerEvents="none" /></g>
    <g {...on('bones')} fill="#f7f3ea"><rect x="77" y="214" width="8" height="64" rx="4" /><rect x="115" y="214" width="8" height="64" rx="4" /><rect x="78" y="284" width="6" height="58" rx="3" /><rect x="116" y="284" width="6" height="58" rx="3" /></g>
    {L.map(([id, name, x, y, side, ly]) => { const lx = side === 'l' ? 12 : 188; return <g key={id}><line x1={x} y1={y} x2={lx} y2={ly} stroke="#555" strokeWidth=".6" /><circle cx={x} cy={y} r="1.4" fill="#333" />
      <text x={side === 'l' ? lx - 3 : lx + 3} y={ly + 3} fontSize="10" fontWeight="700" textAnchor={side === 'l' ? 'start' : 'end'} direction="rtl" fill="#111">{labels === 'blank' ? '__________' : name}</text></g> })}
  </g>
}
export function HumanBody() {
  const [sel, setSel] = useState(ORGANS[1])
  const [printing, setPrinting] = useState(false)
  const sheet = blank => <Sheet label="גוף האדם"><T x={100} y={14} size={8} weight={900}>{blank ? 'גוף האדם — כתבו את שמות האיברים' : 'גוף האדם'}</T>
    <svg x="0" y="20" width="200" height="236" viewBox="-75 0 350 360" preserveAspectRatio="xMidYMid meet"><Body labels={blank ? 'blank' : true} /></svg>
    {blank && <T x={100} y={262} size={4.6} fill="#555">מילים לעזרה: מוח · לב · ריאות · כבד · קיבה · כליות · מעיים · שלד · עור</T>}</Sheet>
  return <Page wide>
    <SEO title="גוף האדם לילדים — איברים, עובדות וחידון" description="גוף האדם לילדים: לוחצים על איבר — מוח, לב, ריאות, קיבה, כבד, כליות, מעיים, שלד ועור — ולומדים מה הוא עושה. עובדות בדוקות, חידון ודף עבודה להדפסה." path="/discover/human-body" />
    <Head emoji="🫀" h1="גוף האדם" sub="לוחצים על איבר בגוף — ולומדים מה הוא עושה בשבילנו" crumb="גוף האדם" />
    <div className="grid items-start gap-4 md:grid-cols-2">
      <div className="ln-box"><svg viewBox="20 0 160 360" className="mx-auto block max-h-[70vh] w-full" role="img" aria-label="איור של גוף האדם עם איברים"><Body active={sel.id} onPick={id => setSel(ORGANS.find(o => o.id === id))} /></svg>
        <div className="mt-2 flex flex-wrap justify-center gap-1">{ORGANS.map(o => <button key={o.id} type="button" className="ln-chip !min-h-[36px] !py-1 !px-3 text-sm" aria-pressed={sel.id === o.id} onClick={() => setSel(o)}>{o.name}</button>)}</div></div>
      <div className="space-y-4"><div className="ln-box"><h2 className="text-3xl font-black">{sel.name}</h2><ul className="text-lg leading-relaxed list-disc pr-5">{sel.facts.map(f => <li key={f}>{f}</li>)}</ul></div>
        <div className="ln-box"><h2 className="text-xl font-black">💡 עוד עובדות</h2><ul className="list-disc pr-5">{BODY_FACTS.map(f => <li key={f}>{f}</li>)}</ul></div>
        <button type="button" className="ln-btn alt w-full" onClick={() => setPrinting(true)}>🖨️ דף עבודה: איברי הגוף</button></div>
    </div>
    <h2 className="mt-8 mb-3 text-2xl font-black text-center">חידון גוף האדם</h2>
    <div className="mx-auto max-w-2xl"><Quiz make={fromBank(BODY_QUIZ)} title="מתחילים חידון" /></div>
    {printing && <PrintPreview title="גוף האדם" onClose={() => setPrinting(false)}><A4>{sheet(true)}</A4><A4>{sheet(false)}</A4></PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['הגוף שלנו עובד כל הזמן, גם כשאנחנו ישנים: הלב מזרים דם, הריאות נושמות, הכליות מסננות והמוח מנהל את הכול. באיור לוחצים על איבר ורואים מה הוא עושה, איפה הוא נמצא ועובדה מפתיעה עליו.', 'האיור סכמטי — האיברים מצוירים בפשטות כדי שיהיה קל לזהות אותם. שימו לב שבאיור אנחנו מסתכלים על הגוף מלפנים, ולכן הכבד, שנמצא בצד ימין של הגוף, מופיע בצד שמאל של התמונה.', 'העובדות כאן נבדקו מול מקורות מקובלים, ונכתבו בשפה פשוטה לילדים. אין בדף הזה מידע רפואי — בכל שאלה על בריאות פונים לרופא.']} faq={[{ q: 'כמה עצמות יש בגוף האדם?', a: 'לאדם מבוגר יש 206 עצמות. תינוקות נולדים עם יותר חלקים — כ-300 עצמות וסחוסים — וחלקם מתאחים כשהם גדלים.' }, { q: 'מהו האיבר הגדול ביותר בגוף?', a: 'העור. מבין האיברים הפנימיים, הגדול ביותר הוא הכבד.' }]} related={[{ label: 'מערכת השמש', href: '/discover/solar-system' }, { label: 'לוח צחצוח שיניים', href: '/printables/toothbrushing-chart' }]} /></div>
  </Page>
}
