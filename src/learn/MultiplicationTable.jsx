import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import { Sheet, T } from '../components/printables/PrintableShell'
import NotFound from '../pages/NotFound'
import { LEARN_CRUMB } from './LearnPages'
import {
  MT_PAGES, MT_NUMBERS, GRIDS, NUMBER_INFO, buildGrid, range, timesList, decompose, quizFor, roundExercises,
  numberMeta, numberFaq, numberPath, shuffled, seeded,
} from './multiplicationTable'
import './learn.css'
import './multiplication-table.css'
import { speak } from '../utils/speak'

const GAME = '/learn/times-tables'
const MAIN_CRUMB = { label: MT_PAGES.main.crumb, href: MT_PAGES.main.path }
const HUES = [0, 28, 48, 95, 140, 172, 200, 228, 262, 295, 325, 12]
const rowBg = (i, l = 92) => `hsl(${HUES[i % HUES.length]} 85% ${l}%)`
// Read a fact aloud when a square is tapped (recorded voice, else the device voice). One switch,
// remembered on this device, for everyone who wants a silent table.
const SOUND_KEY = 'buga-mt-sound'
const readSound = () => { try { return localStorage.getItem(SOUND_KEY) !== '0' } catch { return true } }
function useSound() {
  const [on, setOn] = useState(true)
  useEffect(() => { setOn(readSound()) }, []) // after hydration: the prerendered page shows "on"
  const toggle = () => setOn(v => { try { localStorage.setItem(SOUND_KEY, v ? '0' : '1') } catch { /* storage blocked */ } return !v })
  const say = (a, b) => { if (on) speak(`${a} כפול ${b} שווה ${a * b}`, 'he-IL', { user: false }) }
  return { on, toggle, say }
}
const SoundChip = ({ sound }) => <button type="button" className="ln-chip" aria-pressed={sound.on} onClick={sound.toggle}>{sound.on ? '🔊 הקראה פועלת' : '🔇 הקראה כבויה'}</button>
const rnd = () => Math.floor(Math.random() * 1e9)

const Chip = ({ on, onClick, children, ...rest }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick} {...rest}>{children}</button>
const A4 = ({ children }) => <article className="buga-a4"><div className="print-art">{children}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>
const L = props => <T {...props} direction="ltr" />

function Head({ meta, sub, crumbs }) {
  return <>
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, ...crumbs, { label: meta.crumb }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-1"><span aria-hidden="true">✖️ </span>{meta.h1}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">{sub}</p>
  </>
}

// ── printables ───────────────────────────────
export function GridSheet({ rows, cols, look = 'color', title, note }) {
  const n = cols.length + 1, s = Math.min(17, 188 / n), x0 = (200 - n * s) / 2, y0 = 34
  const digits = String(rows.at(-1) * cols.at(-1)).length
  const size = s * (digits >= 4 ? 0.29 : digits === 3 ? 0.33 : 0.38)
  const headFill = look === 'color' ? '#ffe9a8' : '#e8e8e8'
  const cells = []
  for (let r = -1; r < rows.length; r++) for (let c = -1; c < cols.length; c++) {
    const x = x0 + (c + 1) * s, y = y0 + (r + 1) * s, head = r < 0 || c < 0, corner = r < 0 && c < 0
    const v = !head && rows[r] * cols[c], sq = !head && rows[r] === cols[c]
    const fill = corner ? (look === 'color' ? '#1d2233' : '#bbb') : head ? headFill : look === 'color' ? (sq ? '#e3d7ff' : rowBg(r, 93)) : '#fff'
    cells.push(<g key={`${r}.${c}`}><rect x={x} y={y} width={s} height={s} fill={fill} stroke="#555" strokeWidth=".35" />
      {corner ? <L x={x + s / 2} y={y + s / 2 + s * 0.15} size={s * 0.45} weight={800} fill={look === 'color' ? '#fff' : '#111'}>×</L>
        : head ? <L x={x + s / 2} y={y + s / 2 + s * 0.14} size={s * 0.4} weight={900}>{r < 0 ? cols[c] : rows[r]}</L>
          : look !== 'blank' && <L x={x + s / 2} y={y + s / 2 + size * 0.36} size={size} weight={sq ? 800 : 500}>{v}</L>}</g>)
  }
  return <Sheet label={title}>
    <T x={100} y={16} size={10} weight={900}>{title}</T>
    {look === 'blank' && <T x={100} y={25} size={4.5}>שם: ______________   הזמן שלי: ______ דקות</T>}
    {cells}
    <T x={100} y={y0 + n * s + 9} size={4.5} fill="#555">{note}</T>
  </Sheet>
}

export function NumberSheet({ n }) {
  const upTo = 12, list = timesList(n, upTo), mix = shuffled(range(1, upTo), seeded(n * 31 + 7))
  const jumps = range(1, 12)
  return <Sheet label={`לוח הכפל של ${n}`}>
    <T x={100} y={16} size={11} weight={900}>{`לוח הכפל של ${n}`}</T>
    <T x={150} y={28} size={5} weight={800} fill="#7548b3">הלוח</T>
    <T x={52} y={28} size={5} weight={800} fill="#7548b3">עכשיו בלי להציץ</T>
    <rect x={106} y={32} width={88} height={upTo * 13 + 4} rx="4" fill="#fff8db" stroke="#c9a400" strokeWidth=".4" />
    {list.map((f, i) => <L key={f.b} x={150} y={42 + i * 13} size={8} weight={f.b > 10 ? 500 : 800}>{`${f.a} × ${f.b} = ${f.v}`}</L>)}
    {mix.map((b, i) => <L key={b} x={52} y={42 + i * 13} size={8}>{i % 2 ? `${b} × ${n} = ____` : `${n} × ${b} = ____`}</L>)}
    <T x={100} y={206} size={5} weight={800}>{`סופרים בקפיצות של ${n}:`}</T>
    {jumps.map((k, i) => {
      const x = 194 - (i + 1) * 15.5
      return <g key={k}><rect x={x} y={211} width={14} height={11} rx="2" fill="#fff" stroke="#555" strokeWidth=".35" />{k <= 2 && <L x={x + 7} y={218.6} size={5} weight={700}>{n * k}</L>}</g>
    })}
    <T x={100} y={238} size={5.2} weight={700}>{`טיפ: ${NUMBER_INFO[n].short}`}</T>
    <T x={100} y={250} size={4.3} fill="#555">שם: ______________   תאריך: __________</T>
  </Sheet>
}

export function AllTablesSheet() {
  const w = 60, h = 76
  return <Sheet label="לוחות הכפל 2 עד 10">
    <T x={100} y={14} size={9} weight={900}>לוחות הכפל מ-2 עד 10</T>
    {range(2, 10).map((n, i) => {
      const col = i % 3, row = Math.floor(i / 3), x = 194 - (col + 1) * w - col * 4, y = 22 + row * 80
      return <g key={n}><rect x={x} y={y} width={w} height={h} rx="4" fill={rowBg(n - 1, 95)} stroke="#555" strokeWidth=".4" />
        <T x={x + w / 2} y={y + 9} size={6} weight={900}>{`הלוח של ${n}`}</T>
        {range(1, 10).map(k => <L key={k} x={x + w / 2} y={y + 17 + (k - 1) * 6.2} size={4.9} weight={k === n ? 800 : 500}>{`${n} × ${k} = ${n * k}`}</L>)}</g>
    })}
  </Sheet>
}

export function RoundSheet({ items, answers }) {
  return <Sheet label="כפל בעשרות ובמאות">
    <T x={100} y={14} size={9} weight={900}>{answers ? 'תשובות — כפל בעשרות ובמאות' : 'כפל בעשרות ובמאות'}</T>
    {!answers && <T x={100} y={23} size={4.5}>שם: ______________   תאריך: __________   הצלחתי: ___ מתוך {items.length}</T>}
    {items.map((e, i) => {
      const col = Math.floor(i / 12), row = i % 12, x = col ? 52 : 148, y = 42 + row * 17
      return <g key={i}><L x={x - 38} y={y} size={4} fill="#888">{`${i + 1}.`}</L><L x={x} y={y} size={7.4}>{`${e.a} × ${e.b} = ${answers ? e.v : '_____'}`}</L></g>
    })}
    {!answers && <T x={100} y={252} size={4.5} fill="#555">טיפ: 30 × 4 → קודם 3 × 4 = 12, ואז מוסיפים את האפס: 120</T>}
  </Sheet>
}

function PrintMenu({ items, numbers, onPick }) {
  return <div className="mt-printmenu" role="group" aria-label="אפשרויות הדפסה">
    <p className="font-bold text-center mb-2">מה מדפיסים?</p>
    <div className="flex flex-wrap justify-center gap-2">{items.map(([k, label]) => <button key={k} type="button" className="ln-btn alt" onClick={() => onPick({ kind: k })}>{label}</button>)}</div>
    {numbers && <><p className="font-bold text-center mt-3 mb-1">לוח של מספר אחד (רשימה + תרגול):</p>
      <div className="mt-nums">{MT_NUMBERS.map(n => <button key={n} type="button" className="ln-chip" onClick={() => onPick({ kind: 'number', n })} aria-label={`הדפסת לוח הכפל של ${n}`}>{n}</button>)}</div></>}
  </div>
}

function PrintOut({ job, onClose, onRefresh }) {
  if (!job) return null
  const titles = { color: 'לוח הכפל', mono: 'לוח הכפל — שחור-לבן', blank: 'לוח הכפל ריק למילוי', twelve: 'לוח הכפל עד 12', all: 'לוחות הכפל 2–10', tens: 'לוח הכפל עד 1000', tensBlank: 'לוח הכפל עד 1000 — ריק', round: 'כפל בעשרות ובמאות' }
  const title = job.kind === 'number' ? `לוח הכפל של ${job.n}` : titles[job.kind]
  const T10 = GRIDS.ten, T12 = GRIDS.twelve, TT = GRIDS.tens
  let pages
  if (job.kind === 'number') pages = <A4><NumberSheet n={job.n} /></A4>
  else if (job.kind === 'all') pages = <A4><AllTablesSheet /></A4>
  else if (job.kind === 'round') pages = [<A4 key="q"><RoundSheet items={job.items} /></A4>, <A4 key="a"><RoundSheet items={job.items} answers /></A4>]
  else if (job.kind === 'tens' || job.kind === 'tensBlank') pages = <A4><GridSheet rows={TT.rows} cols={TT.cols} look={job.kind === 'tens' ? 'color' : 'blank'} title={job.kind === 'tens' ? 'לוח הכפל עד 1000' : 'לוח הכפל עד 1000 — ממלאים לבד'} note="טיפ: 7 × 40 → קודם 7 × 4 = 28, ואז מוסיפים 0: 280" /></A4>
  else {
    const g = job.kind === 'twelve' ? T12 : T10
    const note = job.kind === 'blank' ? 'טיפ: מתחילים מהשורות הקלות — 1, 2, 5 ו-10 — וממשיכים לקשות' : 'המשבצות הסגולות באלכסון: מספר כפול עצמו (המספרים הריבועיים)'
    pages = <A4><GridSheet rows={g.rows} cols={g.cols} look={job.kind === 'twelve' ? 'color' : job.kind} title={job.kind === 'blank' ? 'לוח הכפל — ממלאים לבד' : title} note={job.kind === 'mono' ? 'האלכסון: מספר כפול עצמו — 1, 4, 9, 16, 25, 36, 49, 64, 81, 100' : note} /></A4>
  }
  return <PrintPreview title={title} onClose={onClose} onRefresh={job.kind === 'round' ? onRefresh : undefined}>{pages}</PrintPreview>
}

// ── the interactive table ───────────────────────────────
function TableExplorer({ grid = 'ten', allowSize = false, onPrintClick, printOpen }) {
  const [size, setSize] = useState(grid)
  const [hidden, setHidden] = useState(false)
  const [revealed, setRevealed] = useState(() => new Set())
  const [focusN, setFocusN] = useState(null)
  const [squares, setSquares] = useState(false)
  const [hover, setHover] = useState(null)
  const [pinned, setPinned] = useState(null)
  const sound = useSound()
  const { rows, cols } = GRIDS[size]
  const cells = buildGrid(rows, cols)
  const wide = size === 'tens'
  const active = hover || pinned
  const key = (r, c) => `${r}x${c}`
  const shown = (r, c) => !hidden || revealed.has(key(r, c))
  const tap = (r, c) => {
    setPinned({ r, c })
    if (hidden) setRevealed(s => new Set(s).add(key(r, c)))
    sound.say(r, c)
  }
  const toggleHidden = () => { setHidden(h => !h); setRevealed(new Set()) }
  const focusRange = wide ? rows : range(1, size === 'twelve' ? 12 : 10)
  const cls = (r, c) => [
    active && active.r === r && active.c === c ? 'hit' : active && (active.r === r || active.c === c) ? 'cross' : '',
    focusN && (r === focusN || c === focusN) ? 'focus' : '',
    squares && r === c ? 'sq' : '',
    shown(r, c) ? '' : 'hidden-cell',
  ].filter(Boolean).join(' ')
  const headCls = (on, isFocus) => [on ? 'cross' : '', isFocus ? 'focus' : ''].filter(Boolean).join(' ') || undefined
  return <div className="mt-wrap">
    <div className="mt-bar">
      <p className="mt-readout" aria-live="polite">{active ? `${active.r} × ${active.c} = ${shown(active.r, active.c) ? active.r * active.c : '?'}` : <span dir="rtl" className="text-lg font-bold text-[var(--muted-foreground)]">👆 לחצו על משבצת</span>}</p>
      {onPrintClick && <button type="button" className="mt-print-btn" onClick={onPrintClick} aria-expanded={printOpen}>🖨️ הדפסה</button>}
    </div>
    <table className={`mt-table ${size === 'twelve' ? 'is-12' : ''} ${wide ? 'is-wide' : ''}`} onMouseLeave={() => setHover(null)}>
      <caption className="sr-only">{wide ? 'לוח הכפל בעשרות: המספרים 1 עד 10 כפול 10 עד 100' : `לוח הכפל עד ${rows.length}×${cols.length}`}</caption>
      <thead><tr><th scope="col" aria-label="כפול">×</th>{cols.map(c => <th key={c} scope="col" className={headCls(active?.c === c, focusN === c)}>{c}</th>)}</tr></thead>
      <tbody>{cells.map((row, i) => <tr key={rows[i]}>
        <th scope="row" className={headCls(active?.r === rows[i], focusN === rows[i])}>{rows[i]}</th>
        {row.map(({ r, c, v }) => <td key={c} className={cls(r, c) || undefined} style={{ '--mt-bg': rowBg(i) }} onMouseEnter={() => setHover({ r, c })}>
          <button type="button" onClick={() => tap(r, c)} onFocus={() => setPinned({ r, c })} aria-label={shown(r, c) ? `${r} כפול ${c} שווה ${v}` : `${r} כפול ${c} — לחצו כדי לגלות`}>{shown(r, c) ? v : ''}</button>
        </td>)}
      </tr>)}</tbody>
    </table>
    <div className="mt-controls">
      <SoundChip sound={sound} />
      <Chip on={hidden} onClick={toggleHidden}>{hidden ? '🙈 התשובות מוסתרות' : '👀 הסתרת התשובות'}</Chip>
      {hidden && <button type="button" className="ln-chip" onClick={() => setRevealed(new Set(cells.flat().map(x => key(x.r, x.c))))}>גלו הכול</button>}
      {!wide && <Chip on={squares} onClick={() => setSquares(s => !s)}>⬛ ריבועים</Chip>}
      {allowSize && <Chip on={size === 'twelve'} onClick={() => { setSize(s => (s === 'twelve' ? 'ten' : 'twelve')); setFocusN(null) }}>{size === 'twelve' ? '12×12' : 'עד 12×12'}</Chip>}
    </div>
    <div className="mt-nums" role="group" aria-label="הדגשת הלוח של מספר">
      <span className="self-center font-bold">הדגשת לוח:</span>
      {focusRange.map(n => <Chip key={n} on={focusN === n} onClick={() => setFocusN(f => (f === n ? null : n))}>{n}</Chip>)}
    </div>
    {hidden && <p className="text-center mt-2 text-[var(--muted-foreground)]">נסו לזכור את התשובה — ואז לחצו על המשבצת לבדוק.</p>}
  </div>
}

function NumberLinks({ current }) {
  return <nav className="mt-numnav" aria-label="לוח הכפל לפי מספר">
    {MT_NUMBERS.map(n => <Link key={n} to={numberPath(n)} aria-current={n === current ? 'page' : undefined} aria-label={`לוח הכפל של ${n}`}>{n}</Link>)}
  </nav>
}

function Section({ title, children }) {
  return <section className="mt-section"><h2>{title}</h2>{children}</section>
}

function GameCta() {
  return <div className="ln-box text-center mt-8">
    <p className="text-xl font-black mb-2">🎮 רוצים לבדוק את עצמכם?</p>
    <p className="mb-3">באתגר לוח הכפל פותרים כמה שיותר תרגילים בדקה ושוברים שיאים.</p>
    <Link to={GAME} className="ln-btn go inline-flex items-center">לתרגול במשחק ←</Link>
  </div>
}

function usePrint() {
  const [open, setOpen] = useState(false)
  const [job, setJob] = useState(null)
  return { open, toggle: () => setOpen(o => !o), job, pick: j => setJob(j.kind === 'round' ? { ...j, items: roundExercises(rnd()) } : j), close: () => setJob(null), refresh: () => setJob({ kind: 'round', items: roundExercises(rnd()) }) }
}

const RELATED = [
  { label: 'אתגר לוח הכפל', href: GAME },
  { label: 'כרטיסיות לוח הכפל', href: '/learn/flashcards' },
  { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' },
  { label: 'לומדים בבית', href: '/learn' },
]
const relatedExcept = (...paths) => [MT_PAGES.main, MT_PAGES[100], MT_PAGES[1000]].filter(p => !paths.includes(p.path)).map(p => ({ label: p.h1, href: p.path })).concat(RELATED)

// ── /learn/multiplication-table ───────────────────────────────
const MAIN_TIPS = [
  ['🔄 חוק החילוף חוסך כמעט חצי', '7×8 ו-8×7 הם אותו תרגיל עם אותה תשובה. בטבלה רואים את זה בעיניים: היא סימטרית סביב האלכסון. לכן מתוך 100 משבצות יש רק 55 תרגילים שונים לזכור.'],
  ['1️⃣ מתחילים מ-1, 2 ו-10', 'כפול 1 — המספר עצמו. כפול 10 — מוסיפים אפס. כפול 2 — כפליים. שלושת הלוחות האלה לבד ממלאים 51 מתוך 100 המשבצות.', 2],
  ['✋ כפול 5 — חצי מכפול 10', '5×8 הוא חצי מ-80, כלומר 40. וכל התשובות בלוח של 5 נגמרות ב-0 או ב-5.', 5],
  ['➕ כפול 4 וכפול 8 — מכפילים שוב ושוב', '4×7: כפליים של 7 זה 14, ועוד פעם כפליים — 28. ב-8 מכפילים שלוש פעמים: 8×6 → 12 → 24 → 48.', 8],
  ['🖐️ טריק האצבעות של 9', 'פורשים עשר אצבעות ומקפלים את האצבע שמספרה כמו המספר שכופלים בו, כשסופרים משמאל. מה שמשמאל לאצבע המקופלת — עשרות, ומה שמימין — אחדות. 9×4: 3 ו-6, כלומר 36.', 9],
  ['⬛ הריבועים שבאלכסון', '1, 4, 9, 16, 25, 36, 49, 64, 81, 100 — מספר כפול עצמו. כדאי לזכור אותם בנפרד, כי מהם קל לחשב שכנים: 7×8 זה 7×7 ועוד 7, כלומר 49 + 7 = 56.'],
  ['🧩 את הקשים משאירים לסוף', 'אחרי כל הטריקים נשארים כמה תרגילים עקשנים, כמו 6×7, 6×8, 7×8 ו-7×9. כתבו אותם על פתק ותרגלו רק אותם כמה דקות ביום.', 7],
]
const MAIN_FAQ = [
  { q: 'באיזו כיתה לומדים את לוח הכפל?', a: 'בבתי הספר בישראל ההיכרות עם הכפל מתחילה בדרך כלל בכיתה ב׳: לומדים מה המשמעות של כפל — חיבור חוזר של קבוצות שוות, או שורות וטורים במלבן — ומתחילים מהלוחות הקלים. בכיתה ג׳ מרחיבים, לומדים חוקים כמו חוק החילוף וחוק הפילוג, וממשיכים לתרגל עד לשליטה. הקצב משתנה מבית ספר לבית ספר, ולכן כדאי לשאול את המורה מה מצופה בכיתה.' },
  { q: 'איך הכי מהר לשנן את לוח הכפל?', a: 'מעט כל יום: חמש דקות של תרגול עדיפות על שעה פעם בשבוע. מתחילים מהלוחות הקלים (1, 2, 5 ו-10), ממשיכים ל-3, 4 ו-9, ומשאירים ל-6, 7 ו-8 זמן נוסף. כדאי להיעזר בטריקים, להסתיר את התשובות בטבלה ולנחש, ולשחק באתגר לוח הכפל.' },
  { q: 'כמה תרגילים יש בלוח הכפל?', a: 'בטבלה של 10×10 יש 100 משבצות, אבל בזכות חוק החילוף (3×8 = 8×3) יש בה רק 55 תרגילים שונים. אם מורידים גם את הלוחות של 1 ושל 10, שהם כמעט אוטומטיים, נשארים 36 תרגילים. ומעניין לדעת שבכל הטבלה מופיעים רק 42 מספרים שונים.' },
  { q: 'מה ההבדל בין לוח כפל של 10×10 ללוח של 12×12?', a: 'בישראל לומדים בדרך כלל את הטבלה של 10×10 — לוח הכפל עד 100. במדינות דוברות אנגלית, למשל בבריטניה, נהוג ללמוד עד 12×12. בטבלה שלמעלה אפשר לעבור ל-12×12 בלחיצה, והלוחות של 11 ושל 12 מחכים גם בעמודים משלהם.' },
  { q: 'איך מדפיסים את לוח הכפל?', a: 'לוחצים על "🖨️ הדפסה" ליד הטבלה ובוחרים: לוח צבעוני, לוח בשחור-לבן שחוסך דיו, לוח ריק למילוי, כל הלוחות מ-2 עד 10 בדף אחד, או הלוח של מספר אחד עם דף תרגול. אפשר להדפיס ישר או לשמור כ-PDF.' },
]
const MAIN_PRINT = [['color', '🎨 לוח צבעוני'], ['mono', '⚫ שחור-לבן'], ['blank', '✏️ לוח ריק למילוי'], ['twelve', '🔢 לוח עד 12×12'], ['all', '📋 כל הלוחות 2–10 בדף אחד']]

export function MultiplicationTable() {
  const p = usePrint()
  const meta = MT_PAGES.main
  return <div className="mx-auto max-w-4xl px-4 py-6 buga-fade-in" dir="rtl">
    <SEO title={meta.title} description={meta.description} path={meta.path} structuredData={faqSchema(MAIN_FAQ)} />
    <Head meta={meta} sub="נוגעים במשבצת ורואים את התרגיל · מסתירים תשובות · מדפיסים" crumbs={[]} />
    <TableExplorer allowSize onPrintClick={p.toggle} printOpen={p.open} />
    {p.open && <PrintMenu items={MAIN_PRINT} numbers onPick={p.pick} />}
    <PrintOut job={p.job} onClose={p.close} onRefresh={p.refresh} />

    <Section title="איך קוראים את לוח הכפל?">
      <p className="leading-relaxed">בוחרים מספר בעמודה הכהה שבצד ומספר בשורה הכהה שלמעלה. במשבצת שבה השורה והעמודה נפגשות נמצאת התשובה — המכפלה. למשל, בשורה של 7 ובעמודה של 8 כתוב 56, כי 7×8 = 56. כשנוגעים במשבצת, השורה והעמודה שלה נצבעות והתרגיל מופיע למעלה.</p>
    </Section>

    <Section title="לוח הכפל של כל מספר">
      <p className="mb-3">לכל מספר יש עמוד משלו: כל התרגילים בגדול, טריק שעוזר לזכור, בוחן קצר ודף להדפסה.</p>
      <NumberLinks />
    </Section>

    <Section title="טיפים לשינון לוח הכפל">
      <div className="mt-tips">{MAIN_TIPS.map(([h, t, n]) => <div key={h} className="mt-tip"><h3>{h}</h3><p>{t}</p>{n && <p className="mt-1"><Link className="underline font-bold" to={numberPath(n)}>{`עוד על לוח הכפל של ${n}`}</Link></p>}</div>)}</div>
      <GameCta />
    </Section>

    <Section title="למה בכלל לשנן את לוח הכפל?">
      <SeoBody paragraphs={[
        'לוח הכפל הוא טבלה שמרכזת את כל תרגילי הכפל של המספרים מ-1 עד 10. הוא הבסיס להרבה ממה שבא אחריו בחשבון: חילוק, שברים, כפל במספרים גדולים ואחוזים. כשהתרגילים יושבים בזיכרון, הילד פנוי לחשוב על הבעיה עצמה במקום לספור על האצבעות.',
        'מעבר לשינון, הטבלה מלמדת לראות דפוסים: כל שורה היא ספירה בקפיצות, הטבלה סימטרית סביב האלכסון, והאלכסון עצמו הוא המספרים הריבועיים. כשמגלים את הדפוסים, השינון כבר לא נראה כמו רשימה של 100 עובדות — יש בו היגיון.',
        'בעמוד הזה אפשר לתרגל ישר על הטבלה: מסתירים את התשובות ומגלים משבצת אחרי משבצת, מדגישים את הלוח של מספר אחד או מסמנים את הריבועים. מי שרוצה להתעמק ימצא הסבר מפורט על לוח הכפל עד 100, ומי שכבר שולט בו יכול להמשיך ללוח הכפל עד 1000 — כפל בעשרות ובמאות.',
      ]} faq={MAIN_FAQ} related={relatedExcept(meta.path)} />
    </Section>
  </div>
}

// ── /learn/multiplication-table/100 ───────────────────────────────
const ORDER_100 = [
  ['1, 10 ו-2', 'הכי קלים: המספר עצמו, מוסיפים אפס, וכפליים.'],
  ['5', 'חצי מכפול 10, והתשובות נגמרות ב-0 או ב-5.'],
  ['4 ו-3', '4 הוא כפליים של כפליים; 3 הוא כפול 2 ועוד פעם אחת.'],
  ['9', 'טריק האצבעות, וסכום הספרות שתמיד יוצא 9.'],
  ['6 ו-8', '6 הוא כפול 5 ועוד פעם אחת; 8 הוא כפליים שלוש פעמים.'],
  ['7 והריבועים', 'בשלב הזה נשארו מעט תרגילים חדשים באמת: 7×7, 7×8 ו-7×9, ואיתם הריבועים 6×6, 8×8 ו-9×9.'],
]
const FAQ_100 = [
  { q: 'מה זה לוח הכפל עד 100?', a: 'זה לוח הכפל הבסיסי: טבלה של 10 שורות ו-10 עמודות עם כל התרגילים מ-1×1 ועד 10×10. התשובה הגדולה ביותר בו היא 100, ומכאן השם. זה הלוח שלומדים בבית הספר היסודי בישראל.' },
  { q: 'מה ההבדל בין "לוח הכפל עד 100" ל"לוח המאה"?', a: 'לוח המאה הוא טבלה של המספרים מ-1 עד 100 לפי הסדר, ומשתמשים בו לספירה, לחיבור ולחיסור. לוח הכפל עד 100 הוא טבלת תרגילים: בכל משבצת יש מכפלה של מספר השורה במספר העמודה. בלוח הכפל לא כל המספרים מופיעים — 11, 13 ו-17, למשל, לא נמצאים בו בכלל.' },
  { q: 'איזה מספר מופיע הכי הרבה פעמים בלוח הכפל עד 100?', a: 'אין מנצח יחיד: תשעה מספרים מופיעים ארבע פעמים כל אחד — 6, 8, 10, 12, 18, 20, 24, 30 ו-40. למשל, 24 מופיע בתור 3×8, 8×3, 4×6 ו-6×4. בסך הכול יש בטבלה רק 42 מספרים שונים.' },
  { q: 'כמה זמן לוקח לשנן את לוח הכפל עד 100?', a: 'זה משתנה מאוד מילד לילד. מה שעובד כמעט תמיד הוא תרגול קצר וקבוע — כמה דקות ביום — לפי סדר מהקל אל הקשה, עם חזרה על התרגילים שעדיין מתבלבלים בהם. עדיף להתקדם לוח אחד בכל פעם ולא לנסות את כל הטבלה בבת אחת.' },
  { q: 'צריך ללמוד גם את 11 ו-12?', a: 'בתוכנית הבסיסית בישראל לומדים עד 10×10. הלוחות של 11 ושל 12 הם העשרה — מועילים, אבל לא חובה. הם בנויים מהלוח של 10: כפול 11 זה כפול 10 ועוד פעם אחת, וכפול 12 זה כפול 10 ועוד כפול 2.' },
]
const PRINT_100 = [['color', '🎨 לוח הכפל עד 100 בצבע'], ['mono', '⚫ שחור-לבן'], ['blank', '✏️ לוח ריק למילוי'], ['all', '📋 כל הלוחות 2–10 בדף אחד']]

export function MultiplicationTable100() {
  const p = usePrint()
  const meta = MT_PAGES[100]
  return <div className="mx-auto max-w-4xl px-4 py-6 buga-fade-in" dir="rtl">
    <SEO title={meta.title} description={meta.description} path={meta.path} structuredData={faqSchema(FAQ_100)} />
    <Head meta={meta} sub="כל התרגילים מ-1×1 ועד 10×10 — והדרך החכמה לשנן אותם" crumbs={[MAIN_CRUMB]} />
    <TableExplorer onPrintClick={p.toggle} printOpen={p.open} />
    {p.open && <PrintMenu items={PRINT_100} numbers onPick={p.pick} />}
    <PrintOut job={p.job} onClose={p.close} onRefresh={p.refresh} />

    <Section title="מה זה לוח הכפל עד 100?">
      <p className="leading-relaxed">לוח הכפל עד 100 הוא טבלה של 10 שורות ו-10 עמודות, ובה כל תרגילי הכפל של המספרים מ-1 עד 10. התשובה הגדולה ביותר היא 10×10 = 100. זה הלוח שתלמידים בישראל לומדים ומשננים בבית הספר היסודי, ושאר החשבון נשען עליו: חילוק הוא כפל הפוך, ושברים מצריכים לזהות כפולות משותפות.</p>
    </Section>

    <Section title="כמה תרגילים באמת צריך לזכור?">
      <div className="mt-stats">
        <div className="mt-stat"><b>100</b>משבצות בטבלה</div>
        <div className="mt-stat"><b>55</b>תרגילים שונים, כי 3×8 = 8×3</div>
        <div className="mt-stat"><b>36</b>בלי הלוחות של 1 ושל 10</div>
        <div className="mt-stat"><b>21</b>בלי 2 ו-5 — רק 3, 4, 6, 7, 8, 9</div>
      </div>
      <p className="mt-3 leading-relaxed">המספרים האלה מרגיעים: ברגע שמבינים את חוק החילוף ושולטים בלוחות הקלים, נשארים 21 תרגילים בלבד. גם אותם לא צריך לשנן "על ריק" — לרובם יש טריק, כמו כפליים של כפליים בלוח של 4 או האצבעות בלוח של 9.</p>
    </Section>

    <Section title="סדר לימוד מומלץ">
      <ol className="space-y-2 list-decimal pr-6">{ORDER_100.map(([h, t], i) => <li key={i}><b>{`הלוחות של ${h}`}</b> — {t}</li>)}</ol>
      <p className="mt-3">בכל שלב מתרגלים כמה ימים, ורק כשהלוח יושב טוב עוברים לבא. בטבלה שלמעלה אפשר להדגיש את הלוח שעליו עובדים ולהסתיר את התשובות.</p>
    </Section>

    <Section title="דפוסים שכדאי לגלות בטבלה">
      <ul className="space-y-2 list-disc pr-6">
        <li><b>סימטריה:</b> הצד הימני-עליון של הטבלה הוא תמונת מראה של הצד השמאלי-תחתון, כי סדר הגורמים לא משנה את התשובה.</li>
        <li><b>ריבועים באלכסון:</b> 1, 4, 9, 16, 25, 36, 49, 64, 81, 100. לחצו על "ריבועים" כדי לראות אותם.</li>
        <li><b>שורות זוגיות:</b> בשורות של 2, 4, 6, 8 ו-10 כל התשובות זוגיות.</li>
        <li><b>השורה של 9:</b> ספרת העשרות עולה ב-1 וספרת האחדות יורדת ב-1 — 09, 18, 27, 36... וסכום הספרות תמיד 9.</li>
        <li><b>אותו מספר בכמה מקומות:</b> 24 מופיע ארבע פעמים (3×8, 8×3, 4×6, 6×4), אבל 100 מופיע רק פעם אחת.</li>
      </ul>
    </Section>

    <Section title="לוח הכפל של כל מספר"><NumberLinks /></Section>
    <GameCta />
    <div className="mt-section"><SeoBody paragraphs={[
      'כדאי לזכור שלוח הכפל עד 100 הוא לא מטרה בפני עצמה אלא כלי. ילד שיודע ש-6×7 = 42 בלי לחשוב פותר מהר יותר תרגילי חילוק, מזהה כפולות ומבין שברים בקלות.',
      'לתרגול בבית אפשר להדפיס את הלוח הצבעוני ולתלות ליד שולחן העבודה, להדפיס לוח ריק ולמלא אותו מהזיכרון מול שעון עצר, או להדפיס דף לכל מספר ולתרגל לוח אחד בכל פעם. מי שמוכן להמשיך ימצא את לוח הכפל עד 1000 — כפל בעשרות ובמאות.',
    ]} faq={FAQ_100} related={relatedExcept(meta.path)} /></div>
  </div>
}

// ── /learn/multiplication-table/1000 ───────────────────────────────
const FAQ_1000 = [
  { q: 'מה זה לוח הכפל עד 1000?', a: 'אין טבלה רשמית של 1,000 משבצות. בדרך כלל הכוונה להרחבה של לוח הכפל הבסיסי לכפל בעשרות ובמאות שלמות, כך שהתשובות מגיעות עד 1000 — למשל 10×100 או 5×200. לזה מצטרפת שיטת הפירוק, שבעזרתה פותרים תרגילים כמו 23×4 בלי לשנן אותם.' },
  { q: 'באיזו כיתה לומדים כפל עד 1000?', a: 'לפי תוכנית הלימודים במתמטיקה, כפל בעשרות ובמאות שלמות וכפל של מספר דו-ספרתי או תלת-ספרתי בחד-ספרתי מופיעים בכיתה ג׳, אחרי שהלוח הבסיסי עד 100 כבר מוכר. בהמשך עוברים לכפל במאונך של מספרים גדולים יותר. הקצב משתנה מבית ספר לבית ספר, ולכן כדאי לבדוק עם המורה.' },
  { q: 'איך כופלים מספר בעשרות שלמות?', a: 'מתעלמים רגע מהאפס, כופלים את הספרות לפי לוח הכפל הרגיל, ומחזירים את האפס בסוף. 30×4: קודם 3×4 = 12, ואז 120. כשיש אפס בשני המספרים מחזירים שני אפסים: 20×30 → 2×3 = 6 → 600.' },
  { q: 'מה עושים כשהתרגיל לא עגול, למשל 47×6?', a: 'מפרקים את המספר לעשרות ואחדות וכופלים כל חלק לחוד: 40×6 = 240, ו-7×6 = 42. מחברים: 240 + 42 = 282. זה חוק הפילוג, והוא עובד בכל תרגיל — אפשר לנסות במחשבון הפירוק שבעמוד.' },
]
const PRINT_1000 = [['tens', '🎨 טבלת הכפל בעשרות'], ['tensBlank', '✏️ טבלה ריקה למילוי'], ['round', '📝 24 תרגילים + דף תשובות']]

function DecomposeCalc() {
  const [a, setA] = useState('23')
  const [b, setB] = useState('4')
  const na = Math.min(999, Math.max(0, parseInt(a, 10) || 0)), nb = Math.min(99, Math.max(0, parseInt(b, 10) || 0))
  const d = decompose(na, nb)
  const clean = (v, max) => v.replace(/\D/g, '').slice(0, String(max).length)
  return <div className="ln-box">
    <div className="mt-calc">
      <input value={a} onChange={e => setA(clean(e.target.value, 999))} inputMode="numeric" aria-label="המספר הראשון (עד 999)" />
      <span>×</span>
      <input value={b} onChange={e => setB(clean(e.target.value, 99))} inputMode="numeric" aria-label="המספר השני (עד 99)" />
    </div>
    {na > 0 && nb > 0 ? <div className="mt-steps mt-3" aria-live="polite">
      {d.parts.length > 1 && <div>{d.parts.map(x => `${x.p} × ${x.b}`).join('  +  ')}</div>}
      {d.parts.length > 1 && <div>{d.parts.map(x => x.v).join('  +  ')}</div>}
      <div className="text-2xl font-black">{`${na} × ${nb} = ${d.total}`}</div>
    </div> : <p className="text-center mt-3">כתבו שני מספרים כדי לראות את הפירוק.</p>}
  </div>
}

export function MultiplicationTable1000() {
  const p = usePrint()
  const meta = MT_PAGES[1000]
  return <div className="mx-auto max-w-4xl px-4 py-6 buga-fade-in" dir="rtl">
    <SEO title={meta.title} description={meta.description} path={meta.path} structuredData={faqSchema(FAQ_1000)} />
    <Head meta={meta} sub="כפל בעשרות ובמאות: מה שכבר יודעים עד 100 — עם עוד אפס" crumbs={[MAIN_CRUMB]} />
    <TableExplorer grid="tens" onPrintClick={p.toggle} printOpen={p.open} />
    {p.open && <PrintMenu items={PRINT_1000} onPick={p.pick} />}
    <PrintOut job={p.job} onClose={p.close} onRefresh={p.refresh} />

    <Section title="מה זה לוח הכפל עד 1000?">
      <p className="leading-relaxed">אין טבלה של אלף משבצות שצריך לשנן. "לוח הכפל עד 1000" הוא ההמשך הטבעי של לוח הכפל עד 100: לוקחים את התרגילים שכבר מכירים ומוסיפים להם אפסים. בטבלה שלמעלה השורות הן 1 עד 10 והעמודות הן העשרות השלמות 10, 20 ועד 100 — והתשובה הגדולה ביותר היא 10×100 = 1000. השוו אותה ללוח הכפל הרגיל: כל מספר בה הוא בדיוק פי 10.</p>
    </Section>

    <Section title="כפל בעשרות שלמות">
      <p className="leading-relaxed mb-2">הסוד: מתעלמים רגע מהאפס, פותרים לפי לוח הכפל הרגיל, ומחזירים את האפס בסוף.</p>
      <ul className="mt-steps space-y-1 list-none p-0">
        <li>30 × 4 → 3 × 4 = 12 → 120</li>
        <li>7 × 80 → 7 × 8 = 56 → 560</li>
        <li>20 × 40 → 2 × 4 = 8 → 800</li>
      </ul>
      <p className="mt-2">בתרגיל האחרון יש אפס בשני המספרים, ולכן מחזירים שני אפסים: 8 הופך ל-800.</p>
    </Section>

    <Section title="כפל במאות שלמות">
      <p className="mb-2">אותו רעיון עם שני אפסים: 3×100 = 300, ו-4×200 = 800 (כי 4×2 = 8).</p>
      <div className="mt-hundreds">{range(1, 10).map(k => <span key={k}>{`${k} × 100 = ${k * 100}`}</span>)}</div>
    </Section>

    <Section title="תרגילים שאינם עגולים: מפרקים">
      <p className="leading-relaxed mb-3">כשהתרגיל לא עגול, מפרקים את המספר לפי ערך הספרות וכופלים כל חלק לחוד — זה חוק הפילוג. למשל 23×4: קודם 20×4 = 80, אחר כך 3×4 = 12, ומחברים: 92. גם 13×12 עובד כך: 10×12 = 120, ועוד 3×12 = 36, ובסך הכול 156. נסו בעצמכם:</p>
      <DecomposeCalc />
    </Section>

    <Section title="לוח הכפל של כל מספר">
      <p className="mb-3">לפני שממשיכים לעשרות ולמאות, כדאי לוודא שהלוח הבסיסי יושב טוב:</p>
      <NumberLinks />
    </Section>
    <GameCta />
    <div className="mt-section"><SeoBody paragraphs={[
      'מי ששולט בלוח הכפל עד 100 כבר יודע את רוב מה שצריך לכפל עד 1000. הקפיצה הגדולה היא לא בזיכרון אלא בהבנת המבנה העשרוני: 4 עשרות כפול 6 הן 24 עשרות, כלומר 240.',
      'הכישורים האלה חשובים גם להערכה: לפני שפותרים 38×7 אפשר לעגל ל-40×7 = 280 ולדעת שהתשובה קרובה ל-280. כשהתוצאה המדויקת יוצאת 266, ברור שהיא הגיונית.',
      'להדפסה יש כאן את טבלת הכפל בעשרות בצבע, טבלה ריקה למילוי, ודף של 24 תרגילים בעשרות ובמאות עם דף תשובות. בכל לחיצה על "תרגילים אחרים" מקבלים דף חדש.',
    ]} faq={FAQ_1000} related={relatedExcept(meta.path)} /></div>
  </div>
}

// ── /learn/multiplication-table/of/:n ───────────────────────────────
function NumberQuiz({ n }) {
  const [seed, setSeed] = useState(n)
  const [ans, setAns] = useState({})
  const [checked, setChecked] = useState(false)
  const qs = quizFor(n, seed)
  const right = qs.filter((q, i) => Number(ans[i]) === q.v).length
  const again = () => { setSeed(rnd()); setAns({}); setChecked(false) }
  return <div className="ln-box">
    <div className="mt-quiz">{qs.map((q, i) => {
      const ok = checked && Number(ans[i]) === q.v
      return <label key={`${seed}-${i}`} className={`mt-q ${checked ? (ok ? 'ok' : 'no') : ''}`}>
        <span>{`${q.a} × ${q.b} =`}</span>
        <input value={ans[i] ?? ''} inputMode="numeric" maxLength={3} aria-label={`${q.a} כפול ${q.b}`} onChange={e => { setAns(s => ({ ...s, [i]: e.target.value.replace(/\D/g, '') })); setChecked(false) }} />
        {checked && !ok && <small>{q.v}</small>}
      </label>
    })}</div>
    {checked && <p className="text-center text-2xl font-black mt-3" aria-live="polite">{right === 10 ? '🌟 10 מתוך 10 — מושלם!' : `${right} מתוך 10${right >= 7 ? ' — כמעט!' : ''}`}</p>}
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      <button type="button" className="ln-btn go" onClick={() => setChecked(true)}>✓ בדיקה</button>
      <button type="button" className="ln-btn alt" onClick={again}>🔁 שאלות חדשות</button>
    </div>
  </div>
}

export function MultiplicationNumber() {
  const raw = useParams().n
  const n = Number(raw)
  const meta = MT_NUMBERS.includes(n) && String(n) === raw ? numberMeta(n) : null
  const [hidden, setHidden] = useState(false)
  const [peek, setPeek] = useState(() => new Set())
  const [print, setPrint] = useState(false)
  const sound = useSound()
  if (!meta) return <NotFound />
  const info = NUMBER_INFO[n]
  const faq = numberFaq(n)
  const list = timesList(n, 12)
  const prev = n > 1 ? n - 1 : null, next = n < 12 ? n + 1 : null
  const flip = b => setPeek(s => { const x = new Set(s); if (x.has(b)) x.delete(b); else x.add(b); return x })
  return <div className="mx-auto max-w-4xl px-4 py-6 buga-fade-in" dir="rtl">
    <SEO title={meta.title} description={meta.description} path={meta.path} structuredData={faqSchema(faq)} />
    <Head meta={meta} sub={`טיפ: ${info.short}`} crumbs={[MAIN_CRUMB]} />
    <div className="flex flex-wrap justify-center gap-2 mb-3">
      <SoundChip sound={sound} />
      <Chip on={hidden} onClick={() => { setHidden(h => !h); setPeek(new Set()) }}>{hidden ? '🙈 התשובות מוסתרות' : '👀 הסתרת התשובות'}</Chip>
      <button type="button" className="mt-print-btn" onClick={() => setPrint(true)}>🖨️ הדפסה</button>
    </div>
    <div className="mt-list">{list.map(f => {
      const show = !hidden || peek.has(f.b)
      return <button key={f.b} type="button" className={`${f.b > 10 ? 'bonus' : ''} ${show ? '' : 'is-hidden'}`.trim() || undefined} style={{ '--mt-bg': rowBg(f.b - 1, 94) }} onClick={() => { if (hidden && !peek.has(f.b)) flip(f.b); sound.say(n, f.b) }} aria-label={show ? `${n} כפול ${f.b} שווה ${f.v}` : `${n} כפול ${f.b} — לחצו כדי לגלות`}>
        {`${n} × ${f.b} = `}<span className="v">{show ? f.v : ' '}</span>
      </button>
    })}</div>
    <p className="text-center text-sm mt-2 text-[var(--muted-foreground)]">{n > 10 ? `בטבלה הבסיסית לומדים עד 10, והלוח של ${n} כולו העשרה.` : `${n}×11 ו-${n}×12 (במסגרת המקווקוות) הם בונוס — בטבלה הבסיסית לומדים עד 10.`}</p>
    {print && <PrintPreview title={meta.h1} onClose={() => setPrint(false)}><A4><NumberSheet n={n} /></A4></PrintPreview>}

    <Section title={`איך זוכרים את לוח הכפל של ${n}?`}>
      <p className="leading-relaxed mb-3">{info.intro}</p>
      <div className="mt-tips">{info.tips.map((t, i) => <div key={i} className="mt-tip"><p>{t}</p></div>)}</div>
      <p className="mt-3 leading-relaxed">{info.relation}</p>
    </Section>

    <Section title={`בוחן קצר: לוח הכפל של ${n}`}>
      <p className="mb-3">עשר שאלות מעורבבות — לפעמים {n} בא ראשון ולפעמים שני. כותבים תשובות ולוחצים "בדיקה".</p>
      <NumberQuiz key={n} n={n} />
    </Section>

    <Section title="לוחות נוספים">
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {prev && <Link className="ln-btn alt inline-flex items-center" to={numberPath(prev)}>→ לוח הכפל של {prev}</Link>}
        {next && <Link className="ln-btn alt inline-flex items-center" to={numberPath(next)}>לוח הכפל של {next} ←</Link>}
      </div>
      <NumberLinks current={n} />
      <p className="text-center mt-4"><Link className="underline font-bold" to={MT_PAGES.main.path}>ללוח הכפל המלא — כל המספרים בטבלה אחת</Link></p>
    </Section>
    <GameCta />
    <div className="mt-section"><SeoBody paragraphs={[
      `בלוח הכפל של ${n} יש ${n > 10 ? 'שנים-עשר' : 'עשרה'} תרגילים בסיסיים, והם מופיעים בטבלה המלאה פעמיים: פעם בשורה של ${n} ופעם בעמודה של ${n}. בזכות חוק החילוף ${n}×3 ו-3×${n} הם אותו תרגיל, ולכן מי שכבר יודע לוחות אחרים מכיר חלק מהלוח הזה.`,
      `כדי לתרגל בבית: מסתירים את התשובות ברשימה למעלה ומנחשים אחת אחת, עונים על הבוחן כמה פעמים עד שכל עשר התשובות נכונות, ומדפיסים את הדף של ${n} — הרשימה המלאה, תרגול בסדר מעורבב וספירה בקפיצות.`,
    ]} faq={faq} related={[{ label: 'לוח הכפל המלא', href: MT_PAGES.main.path }, { label: 'לוח הכפל עד 100', href: MT_PAGES[100].path }, ...RELATED]} /></div>
  </div>
}

export function MultiplicationTablePage({ variant = 'main' }) {
  if (variant === '100' || variant === 100) return <MultiplicationTable100 />
  if (variant === '1000' || variant === 1000) return <MultiplicationTable1000 />
  return <MultiplicationTable />
}
