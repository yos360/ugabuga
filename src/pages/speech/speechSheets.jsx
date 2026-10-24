import { useState } from 'react'
import { Sheet } from '../../components/printables/PrintableShell'
import PrintPreview from '../../components/ui/PrintPreview'

// Printable sheets for speech-sound practice, shared by the sound pages and the card maker.
// Every builder takes plain items — { t: text, e?: emoji } — and returns [{ key, svg }] A4 sheets
// drawn in a 200×270 box. Cards are cut along dashed lines; everything works in black-and-white.

const FONT = 'Heebo, Arial, sans-serif'
const EMOJI = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
const plainLen = s => String(s).replace(/[֑-ׇ]/g, '').length

export const OUTPUTS = [
  ['cards', 'כרטיסיות'],
  ['bingo', 'בינגו'],
  ['lotto', 'לוטו'],
  ['memory', 'זיכרון (זוגות)'],
  ['log', 'טבלת תרגול בבית'],
]
export const CARD_COUNTS = [[6, '6 בדף'], [12, '12 בדף'], [20, '20 בדף']]
const CARD_GRID = { 6: [2, 3], 12: [3, 4], 20: [4, 5] }

// Small seeded random generator, so a set stays the same until "new boards" is pressed.
export function rng(seed) {
  let a = seed >>> 0
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
export function seededShuffle(list, rand) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

function wrap(text, max) {
  const lines = []
  let line = ''
  for (const word of String(text).split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (plainLen(next) > max && line) { lines.push(line); line = word } else line = next
  }
  if (line) lines.push(line)
  return lines
}
function fit(text, w, h, max, maxLines = 3) {
  const k = 0.58
  for (let size = max; size > 2.4; size -= 0.2) {
    const lines = wrap(text, Math.max(1, Math.floor(w / (size * k))))
    if (lines.length <= maxLines && lines.length * size * 1.28 <= h && lines.every(l => plainLen(l) * size * k <= w)) return { size, lines }
  }
  return { size: 2.4, lines: wrap(text, Math.floor(w / (2.4 * k))) }
}

export function TextBox({ x, y, w, h, text, max, weight = 800, fill = '#111', maxLines = 3 }) {
  const { size, lines } = fit(text, w, h, max, maxLines)
  const top = y + (h - lines.length * size * 1.28) / 2 + size * 1.0
  return <text textAnchor="middle" direction="rtl" fontFamily={FONT} fontWeight={weight} fontSize={size.toFixed(2)} fill={fill}>
    {lines.map((l, i) => <tspan key={i} x={(x + w / 2).toFixed(2)} y={(top + i * size * 1.28).toFixed(2)}>{l}</tspan>)}
  </text>
}

function Header({ title, note }) {
  return <>
    <text x={100} y={10.5} textAnchor="middle" direction="rtl" fontFamily={FONT} fontWeight={900} fontSize={6.4} fill="#111">{title}</text>
    {note && <text x={100} y={16} textAnchor="middle" direction="rtl" fontFamily={FONT} fontSize={3.2} fill="#4b5563">{note}</text>}
  </>
}

// Dashed cut lines around cells, each shared edge drawn once.
function CutLines({ cells }) {
  const seen = new Set(), lines = []
  const add = (x1, y1, x2, y2) => { const k = [x1, y1, x2, y2].map(v => v.toFixed(2)).join(','); if (!seen.has(k)) { seen.add(k); lines.push([x1, y1, x2, y2]) } }
  for (const c of cells) { add(c.x, c.y, c.x + c.w, c.y); add(c.x, c.y + c.h, c.x + c.w, c.y + c.h); add(c.x, c.y, c.x, c.y + c.h); add(c.x + c.w, c.y, c.x + c.w, c.y + c.h) }
  return <g stroke="#9ca3af" strokeWidth=".35" strokeDasharray="2 1.4">{lines.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}</g>
}

// One card / cell: picture on top and the text underneath, or the text alone.
export function Card({ x, y, w, h, item, pictures, pad = 2, frame = true, drawHint = true }) {
  const iw = w - 2 * pad, ih = h - 2 * pad
  const long = plainLen(item.t) > 14
  const showPic = pictures && (item.e || (drawHint && !long))
  const m = Math.min(iw, ih)
  return <g>
    {frame && <rect x={x + pad} y={y + pad} width={iw} height={ih} rx={3} fill="#fff" stroke="#111" strokeWidth=".6" />}
    {showPic && (item.e
      ? <text x={x + w / 2} y={y + pad + ih * 0.36} textAnchor="middle" dominantBaseline="central" fontSize={(Math.min(iw * 0.7, ih * (long ? 0.4 : 0.5))).toFixed(2)} fontFamily={EMOJI}>{item.e}</text>
      : <g>
        <circle cx={x + w / 2} cy={y + pad + ih * 0.36} r={m * 0.24} fill="none" stroke="#9ca3af" strokeWidth=".45" strokeDasharray="1.6 1.2" />
        <text x={x + w / 2} y={y + pad + ih * 0.36 + 1} textAnchor="middle" fontFamily={FONT} fontSize={Math.max(2.3, m * 0.07).toFixed(2)} fill="#9ca3af" direction="rtl">ציירו כאן</text>
      </g>)}
    {showPic
      ? <TextBox x={x + pad + 1.5} y={y + pad + ih * 0.66} w={iw - 3} h={ih * 0.3} text={item.t} max={m * 0.2} maxLines={long ? 3 : 2} />
      : <TextBox x={x + pad + 2} y={y + pad + 2} w={iw - 4} h={ih - 4} text={item.t} max={m * 0.24} maxLines={4} />}
  </g>
}

const gridCells = (items, cols, rows, { x0 = 5, y0 = 21, w = 190, h = 243 } = {}) => {
  const cw = w / cols, ch = h / rows
  return items.map((item, i) => ({ item, x: x0 + w - ((i % cols) + 1) * cw, y: y0 + Math.floor(i / cols) * ch, w: cw, h: ch }))
}
const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n))

export function cardSheets(items, { per = 12, pictures = true, title = 'כרטיסיות', keyBase = 'cards', note = '✂ גוזרים לאורך הקווים המקווקווים · כדאי להדביק על קרטון או לצפות בלמינציה' } = {}) {
  const [cols, rows] = CARD_GRID[per] || CARD_GRID[12]
  const pages = chunk(items, cols * rows)
  return pages.map((list, p) => {
    const cells = gridCells(list, cols, rows)
    return {
      key: `${keyBase}-${p}`,
      svg: <Sheet label={`${title} — דף ${p + 1}`}>
        <Header title={pages.length > 1 ? `${title} (${p + 1}/${pages.length})` : title} note={note} />
        <CutLines cells={cells} />
        {cells.map((c, i) => <Card key={i} {...c} pictures={pictures} />)}
      </Sheet>,
    }
  })
}

// Bingo: every board is a different random draw from the pool, plus calling cards to cut.
export function bingoSheets(items, { size = 3, boards = 6, seed = 1, pictures = true, title = 'בינגו' } = {}) {
  const need = size * size
  const rand = rng(seed)
  const pool = items.length >= need ? items : [...items, ...Array.from({ length: need - items.length }, () => ({ t: '' }))]
  const draws = Array.from({ length: boards }, () => seededShuffle(pool, rand).slice(0, need))
  const perPage = size === 3 ? 2 : 1
  const board = (cells, y, n) => {
    const cell = size === 3 ? 36 : 45, bw = cell * size, x0 = 100 - bw / 2
    const list = cells.map((item, i) => ({ item, x: x0 + bw - ((i % size) + 1) * cell, y: y + 14 + Math.floor(i / size) * cell, w: cell, h: cell }))
    return <g key={n}>
      <text x={x0 + bw} y={y + 8} textAnchor="start" direction="rtl" fontFamily={FONT} fontWeight={900} fontSize={5.4} fill="#111">{title} · לוח {n}</text>
      <text x={x0} y={y + 8} textAnchor="end" direction="rtl" fontFamily={FONT} fontSize={3.6} fill="#374151">שם: ______________</text>
      <rect x={x0} y={y + 14} width={bw} height={bw} fill="none" stroke="#111" strokeWidth=".9" />
      {list.map((c, i) => <g key={i}><rect x={c.x} y={c.y} width={c.w} height={c.h} fill="none" stroke="#111" strokeWidth=".4" /><Card {...c} pictures={pictures} frame={false} drawHint={false} pad={1.4} /></g>)}
    </g>
  }
  const boardPages = chunk(draws, perPage).map((list, p) => ({
    key: `bingo-${p}`,
    svg: <Sheet label={`${title} — לוחות`}>
      {list.map((cells, i) => board(cells, size === 3 ? 6 + i * 130 : 30, p * perPage + i + 1))}
      <text x={100} y={264} textAnchor="middle" direction="rtl" fontFamily={FONT} fontSize={3.2} fill="#4b5563">מכסים משבצת בכל פעם שהמילה נאמרת · כל לוח שונה</text>
    </Sheet>,
  }))
  return [...boardPages, ...cardSheets(items, { per: 20, pictures, title: `${title} — כרטיסי הקריאה`, keyBase: 'bingo-calls', note: '✂ גוזרים, מערבבים ושולפים כרטיס בכל תור — מי ששולף אומר את המילה בקול' })]
}

// Lotto: boards of 6 different items (2 per page) and matching cards of the same size to cut.
export function lottoSheets(items, { seed = 1, pictures = true, title = 'לוטו' } = {}) {
  const rand = rng(seed)
  const mixed = seededShuffle(items, rand)
  const count = Math.max(1, Math.min(4, Math.floor(mixed.length / 6)))
  const used = mixed.slice(0, count * 6)
  while (used.length < count * 6) used.push({ t: '' })
  const boards = chunk(used, 6)
  const cw = 58, ch = 52, bw = cw * 3, x0 = 100 - bw / 2
  const board = (list, y, n) => {
    const cells = list.map((item, i) => ({ item, x: x0 + bw - ((i % 3) + 1) * cw, y: y + 12 + Math.floor(i / 3) * ch, w: cw, h: ch }))
    return <g key={n}>
      <text x={100} y={y + 7} textAnchor="middle" direction="rtl" fontFamily={FONT} fontWeight={900} fontSize={5.2} fill="#111">{title} · לוח {n}</text>
      <rect x={x0} y={y + 12} width={bw} height={ch * 2} fill="none" stroke="#111" strokeWidth=".9" />
      {cells.map((c, i) => <g key={i}><rect x={c.x} y={c.y} width={c.w} height={c.h} fill="none" stroke="#111" strokeWidth=".4" /><Card {...c} pictures={pictures} frame={false} drawHint={false} /></g>)}
    </g>
  }
  const boardPages = chunk(boards, 2).map((list, p) => ({
    key: `lotto-${p}`,
    svg: <Sheet label={`${title} — לוחות`}>
      {list.map((b, i) => board(b, 8 + i * 128, p * 2 + i + 1))}
      <text x={100} y={264} textAnchor="middle" direction="rtl" fontFamily={FONT} fontSize={3.2} fill="#4b5563">כל משתתף מקבל לוח · שולפים כרטיס, אומרים את המילה ומניחים אותו על המשבצת המתאימה</text>
    </Sheet>,
  }))
  const cardPages = chunk(seededShuffle(used.filter(i => i.t), rand), 12).map((list, p) => {
    const cells = list.map((item, i) => ({ item, x: x0 + bw - ((i % 3) + 1) * cw, y: 22 + Math.floor(i / 3) * ch, w: cw, h: ch }))
    return {
      key: `lotto-cards-${p}`,
      svg: <Sheet label={`${title} — כרטיסים לגזירה`}>
        <Header title={`${title} — כרטיסים לגזירה`} note="✂ הכרטיסים באותו גודל כמו המשבצות בלוחות" />
        <CutLines cells={cells} />
        {cells.map((c, i) => <Card key={i} {...c} pictures={pictures} frame={false} drawHint={false} />)}
      </Sheet>,
    }
  })
  return [...boardPages, ...cardPages]
}

// Memory: each item twice (up to 12 pairs), 12 cards on a page.
export function memorySheets(items, { pictures = true, title = 'משחק זיכרון', seed = 1 } = {}) {
  const pairs = seededShuffle(items, rng(seed)).slice(0, 12)
  return cardSheets(pairs.flatMap(i => [i, i]), { per: 12, pictures, title, keyBase: 'memory', note: '✂ גוזרים, הופכים ומערבבים · מי שהופך זוג אומר את המילה בקול' })
}

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

// Home-practice log: target words, a week of days × repetitions, and a note to the parent.
export function practiceLogSheet(items, { title = 'טבלת תרגול בבית', soundLabel = '', reps = 10, pictures = true } = {}) {
  const targets = items.slice(0, 10)
  const tw = 190 / 5, th = 18
  const targetCells = targets.map((item, i) => ({ item, x: 5 + 190 - ((i % 5) + 1) * tw, y: 44 + Math.floor(i / 5) * th, w: tw, h: th }))
  const tableY = 44 + Math.ceil(Math.max(1, targets.length) / 5) * th + 6
  const rowH = 17
  const col = { day: [173, 22], what: [113, 60], reps: [43, 70], note: [5, 38] }
  return {
    key: 'log',
    svg: <Sheet label={title}>
      <Header title={soundLabel ? `${title} — ${soundLabel}` : title} />
      <text x={195} y={24} textAnchor="start" direction="rtl" fontFamily={FONT} fontSize={3.8} fill="#111">שם: _________________</text>
      <text x={110} y={24} textAnchor="start" direction="rtl" fontFamily={FONT} fontSize={3.8} fill="#111">שבוע מתאריך: ___________</text>
      <text x={195} y={31} textAnchor="start" direction="rtl" fontFamily={FONT} fontSize={3.8} fill="#111">המטרה לשבוע (ממלאת הקלינאית): ______________________________________________</text>
      <text x={195} y={40} textAnchor="start" direction="rtl" fontFamily={FONT} fontWeight={800} fontSize={4} fill="#111">המילים שלנו השבוע:</text>
      {targetCells.map((c, i) => <g key={i}>
        <rect x={c.x + 1} y={c.y + 1} width={c.w - 2} height={c.h - 2} rx={2} fill="#fff" stroke="#9ca3af" strokeWidth=".4" />
        {pictures && c.item.e && <text x={c.x + c.w - 7} y={c.y + c.h / 2} textAnchor="middle" dominantBaseline="central" fontSize={8} fontFamily={EMOJI}>{c.item.e}</text>}
        <TextBox x={c.x + 3} y={c.y + 2} w={c.w - (pictures && c.item.e ? 16 : 6)} h={c.h - 4} text={c.item.t} max={4.6} maxLines={2} />
      </g>)}
      <g>
        <rect x={5} y={tableY} width={190} height={9} fill="#f3f4f6" stroke="#111" strokeWidth=".5" />
        {[['day', 'יום'], ['what', 'מה תרגלנו'], ['reps', `חזרות — צובעים עיגול על כל חזרה`], ['note', 'הערות']].map(([k, l]) => <text key={k} x={col[k][0] + col[k][1] / 2} y={tableY + 6} textAnchor="middle" direction="rtl" fontFamily={FONT} fontWeight={800} fontSize={k === 'reps' ? 3.1 : 3.6} fill="#111">{l}</text>)}
        {DAYS.map((d, r) => {
          const y = tableY + 9 + r * rowH
          return <g key={d}>
            <rect x={5} y={y} width={190} height={rowH} fill="none" stroke="#111" strokeWidth=".4" />
            {[173, 113, 43].map(x => <line key={x} x1={x} x2={x} y1={y} y2={y + rowH} stroke="#111" strokeWidth=".3" />)}
            <text x={184} y={y + rowH / 2 + 1.4} textAnchor="middle" direction="rtl" fontFamily={FONT} fontWeight={700} fontSize={4} fill="#111">{d}</text>
            {Array.from({ length: reps }, (_, i) => <circle key={i} cx={113 - 4 - (i % 10) * 6.8} cy={y + rowH / 2} r={2.5} fill="none" stroke="#6b7280" strokeWidth=".4" />)}
          </g>
        })}
        {[173, 113, 43].map(x => <line key={x} x1={x} x2={x} y1={tableY} y2={tableY + 9} stroke="#111" strokeWidth=".3" />)}
      </g>
      <g>
        <rect x={5} y={tableY + 9 + 7 * rowH + 4} width={190} height={270 - (tableY + 9 + 7 * rowH + 4) - 8} rx={3} fill="#fffbea" stroke="#9ca3af" strokeWidth=".4" />
        <TextBox x={9} y={tableY + 9 + 7 * rowH + 6} w={182} h={270 - (tableY + 9 + 7 * rowH + 4) - 12}
          text="להורים: מספיקות 5–10 דקות ביום, במשחק ובמצב רוח טוב. אומרים את המילה ברור בעצמכם ומחכים לילד/ה — בלי לחץ ובלי 'תגיד נכון'. צובעים עיגול על כל ניסיון: סופרים מאמץ, לא ציון. מביאים את הדף לפגישה הבאה עם הקלינאית."
          max={4.4} weight={500} maxLines={5} />
      </g>
    </Sheet>,
  }
}

export function buildSheets(type, items, o = {}) {
  if (!items.length) return []
  if (type === 'bingo') return bingoSheets(items, o)
  if (type === 'lotto') return lottoSheets(items, o)
  if (type === 'memory') return memorySheets(items, o)
  if (type === 'log') return [practiceLogSheet(items, o)]
  return cardSheets(items, o)
}

// Preview of the first sheet + a print button that opens the site's print dialog with every sheet.
export function SheetsPreview({ pages, title, onRefresh }) {
  const [printing, setPrinting] = useState(false)
  if (!pages.length) return <p className="text-center text-[var(--muted-foreground)]">אין פריטים להדפסה — בחרו צליל, מיקום או רמה אחרים.</p>
  return <div className="mx-auto grid max-w-3xl items-start gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
    <div className="mx-auto w-full max-w-[420px] border-2 border-[var(--border)] bg-white p-3 sketch-shadow-sm" aria-label="תצוגה מקדימה של הדף הראשון">{pages[0].svg}</div>
    <div className="space-y-3 text-center md:text-right md:sticky md:top-24">
      <p className="text-lg font-bold">{pages.length > 1 ? `${pages.length} דפי A4 בהדפסה אחת` : 'דף A4 אחד'}</p>
      <button type="button" onClick={() => setPrinting(true)} className="min-h-[52px] w-full rounded-xl bg-red-500 px-6 py-3 text-lg font-bold text-white">🖨️ הדפסה או PDF</button>
      {onRefresh && <button type="button" onClick={onRefresh} className="min-h-[44px] w-full rounded-xl border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">🔀 לוחות חדשים (סדר אחר)</button>}
      <p className="text-sm text-[var(--muted-foreground)]">חינם, בלי הרשמה. אפשר לשנות הגדרות ולהדפיס שוב.</p>
    </div>
    {printing && <PrintPreview title={title} onClose={() => setPrinting(false)} copies={false}>
      {pages.map(p => <article className="buga-a4" key={p.key}><div className="print-art">{p.svg}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)}
    </PrintPreview>}
  </div>
}
