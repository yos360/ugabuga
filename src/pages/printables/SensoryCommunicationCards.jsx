import { useState } from 'react'
import { Link } from 'react-router-dom'
import PrintableShell, { Choice, Sheet } from '../../components/printables/PrintableShell'
import QuickAnswer from '../../components/ui/QuickAnswer'
import { SETS, GRID, NEEDS, FEELINGS, SCHEDULE, PHRASES, pick } from '../../data/sensoryCards'

// Visual cards for kindergarten / special education: regulation, senses, a communication board,
// a daily schedule with a strip and a first–then board, help requests and animal walks.
// Every sheet is a 200×270 SVG; cards are cut along dashed lines; works in colour or black-and-white.

const PATH = '/printables/sensory-communication-cards'
const GX = 5, GY = 19, GW = 190, GH = 245
const FONT = 'Heebo, Arial, sans-serif'
const EMOJI = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
const plainLen = s => s.replace(/[֑-ׇ]/g, '').length

// Greedy word wrap at a character budget.
function wrap(text, max) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (plainLen(next) > max && line) { lines.push(line); line = word } else line = next
  }
  if (line) lines.push(line)
  return lines
}

// The largest font size (in sheet units) at which the text fits the box, wrapped to at most maxLines.
function fit(text, w, h, max, { bold = true, maxLines = 3 } = {}) {
  if (!text) return { size: max, lines: [] }
  const k = bold ? 0.6 : 0.52
  for (let size = max; size > 2.2; size -= 0.2) {
    const lines = wrap(text, Math.max(1, Math.floor(w / (size * k))))
    if (lines.length <= maxLines && lines.length * size * 1.3 <= h && lines.every(l => plainLen(l) * size * k <= w)) return { size, lines }
  }
  return { size: 2.2, lines: wrap(text, Math.floor(w / (2.2 * k))) }
}

function TextBlock({ x, y, w, h, text, max, bold = true, fill = '#111', maxLines }) {
  const { size, lines } = fit(text, w, h, max, { bold, maxLines })
  const top = y + (h - lines.length * size * 1.3) / 2 + size * 1.02
  return <text x={x + w / 2} textAnchor="middle" direction="rtl" fontFamily={FONT} fontWeight={bold ? 800 : 500} fontSize={size.toFixed(2)} fill={fill}>
    {lines.map((l, i) => <tspan key={i} x={x + w / 2} y={(top + i * size * 1.3).toFixed(2)}>{l}</tspan>)}
  </text>
}

// Small drawings for ideas that have no emoji (all inside a 100×100 box).
const DRAWINGS = {
  pillow: <g strokeLinejoin="round">
    <path d="M14 28 Q10 16 24 16 Q50 10 76 16 Q90 16 86 28 Q92 50 86 72 Q90 84 76 84 Q50 90 24 84 Q10 84 14 72 Q8 50 14 28Z" fill="#bfdbfe" stroke="#1e3a8a" strokeWidth="3" />
    <path d="M24 26 Q50 21 76 26 Q81 50 76 74 Q50 79 24 74 Q19 50 24 26Z" fill="none" stroke="#1e3a8a" strokeWidth="1.6" strokeDasharray="4 3" />
    <path d="M50 64 C30 50 36 36 46 40 Q50 42 50 46 Q50 42 54 40 C64 36 70 50 50 64Z" fill="#f472b6" stroke="#9d174d" strokeWidth="2" />
  </g>,
  ball: <g>
    <ellipse cx="50" cy="60" rx="33" ry="26" fill="#fb923c" stroke="#9a3412" strokeWidth="3" />
    <ellipse cx="38" cy="50" rx="9" ry="5" fill="#fed7aa" />
    <path d="M30 22 L35 31 M50 16 L50 27 M70 22 L65 31" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
  </g>,
  bubbles: <g fill="#e0f2fe" stroke="#0369a1" strokeWidth="2.6">
    <circle cx="62" cy="34" r="20" /><circle cx="30" cy="26" r="11" /><circle cx="80" cy="70" r="10" /><circle cx="46" cy="62" r="8" />
    <path d="M55 24 Q60 20 66 22" fill="none" strokeWidth="2" /><path d="M26 22 Q29 19 33 20" fill="none" strokeWidth="1.6" />
    <circle cx="22" cy="74" r="10" fill="none" strokeWidth="3" stroke="#7c3aed" /><path d="M15 81 L6 94" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
  </g>,
}

function Icon({ icon, cx, cy, size, gray }) {
  const filter = gray ? 'url(#scc-gray)' : undefined
  if (!icon) return <g>
    <circle cx={cx} cy={cy} r={size * 0.42} fill="none" stroke="#9ca3af" strokeWidth=".5" strokeDasharray="1.6 1.2" />
    <text x={cx} y={cy + size * 0.06} textAnchor="middle" fontFamily={FONT} fontSize={Math.max(2.4, size * 0.13)} fill="#9ca3af" direction="rtl">ציירו כאן</text>
  </g>
  if (icon.startsWith('svg:')) return <g filter={filter} transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 100})`}>{DRAWINGS[icon.slice(4)]}</g>
  return <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.86} fontFamily={EMOJI} filter={filter}>{icon}</text>
}

const frame = (set, o) => o.color ? { stroke: set.color[0], fill: set.color[1], ink: '#111' } : { stroke: '#111', fill: '#fff', ink: '#111' }

// Where the texts of a card go. Each text box: { x, y, w, h, max } relative to the card's corner.
const PAD = 2.2
function squareBoxes(w, h, o, item) {
  const iw = w - 2 * PAD, ih = h - 2 * PAD, m = Math.min(iw, ih)
  const hint = o.words && item.hint && w >= 60
  return {
    iw, ih, hint,
    iconSize: m * (o.words ? (hint ? 0.46 : 0.56) : 0.72),
    iconCy: PAD + (o.words ? ih * (hint ? 0.32 : 0.38) : ih / 2),
    label: { x: PAD + 2, y: PAD + ih * (hint ? 0.6 : 0.7), w: iw - 4, h: ih * (hint ? 0.17 : 0.26), max: m * 0.17, maxLines: 2 },
    hintBox: { x: PAD + 2, y: PAD + ih * 0.78, w: iw - 4, h: ih * 0.18, max: m * 0.085, maxLines: 2, bold: false },
  }
}
function wideBoxes(w, h, item) {
  const iw = w - 2 * PAD, ih = h - 2 * PAD
  const iconSize = Math.min(ih * 0.78, iw * 0.34), iconBox = iconSize + 6
  const tx = PAD + 3, tw = iw - iconBox - 5
  return {
    iw, ih, iconSize, iconBox,
    label: item.hint ? { x: tx, y: PAD + 2, w: tw, h: ih * 0.34, max: ih * 0.2, maxLines: 1 } : { x: tx, y: PAD + 2, w: tw, h: ih - 4, max: ih * 0.24, maxLines: 3 },
    hintBox: { x: tx, y: PAD + ih * 0.38, w: tw, h: ih * 0.56, max: ih * 0.12, maxLines: 4, bold: false },
  }
}
const sizeIn = (box, text) => fit(text, box.w, box.h, box.max, box).size

// One font size per sheet for the words and one for the hints, so the cards look like a set.
function sheetSizes(cells, set, o) {
  const label = [], hint = []
  for (const { item, w, h } of cells) {
    const b = set.wide ? wideBoxes(w, h, item) : squareBoxes(w, h, o, item)
    if (item.label) label.push(sizeIn(b.label, pick(item.label, o)))
    if (item.hint && (set.wide || b.hint)) hint.push(sizeIn(b.hintBox, pick(item.hint, o)))
  }
  return { label: Math.min(...label, 99), hint: Math.min(...hint, 99) }
}

const Text = ({ box, x, y, text, max, fill }) => <TextBlock x={x + box.x} y={y + box.y} w={box.w} h={box.h} text={text} max={Math.min(max || 99, box.max)} bold={box.bold !== false} fill={fill} maxLines={box.maxLines} />

// One square card: picture on top, word underneath (or a bigger picture alone).
function SquareCard({ x, y, w, h, item, set, o, sizes = {} }) {
  const f = frame(set, o), b = squareBoxes(w, h, o, item)
  return <g>
    <rect x={x + PAD} y={y + PAD} width={b.iw} height={b.ih} rx={3.2} fill={f.fill} stroke={f.stroke} strokeWidth={o.color ? 0.9 : 0.7} />
    <Icon icon={item.icon} cx={x + w / 2} cy={y + b.iconCy} size={b.iconSize} gray={!o.color} />
    {o.words && (item.label
      ? <Text box={b.label} x={x} y={y} text={pick(item.label, o)} max={sizes.label} fill={f.ink} />
      : <line x1={x + PAD + b.iw * 0.15} x2={x + PAD + b.iw * 0.85} y1={y + PAD + b.ih * 0.88} y2={y + PAD + b.ih * 0.88} stroke="#9ca3af" strokeWidth=".5" />)}
    {b.hint && <Text box={b.hintBox} x={x} y={y} text={pick(item.hint, o)} max={sizes.hint} fill="#374151" />}
  </g>
}

// One wide card: picture at the right, sentence (and instruction) at the left.
function WideCard({ x, y, w, h, item, set, o, sizes = {} }) {
  const f = frame(set, o), b = wideBoxes(w, h, item)
  return <g>
    <rect x={x + PAD} y={y + PAD} width={b.iw} height={b.ih} rx={3.2} fill={f.fill} stroke={f.stroke} strokeWidth={o.color ? 0.9 : 0.7} />
    <Icon icon={item.icon} cx={x + w - PAD - b.iconBox / 2} cy={y + h / 2} size={b.iconSize} gray={!o.color} />
    <Text box={b.label} x={x} y={y} text={pick(item.label, o)} max={sizes.label} fill={item.hint && o.color ? set.color[0] : f.ink} />
    {item.hint && <Text box={b.hintBox} x={x} y={y} text={pick(item.hint, o)} max={sizes.hint} fill={f.ink} />}
  </g>
}

// Dashed cut lines around every used cell, each edge drawn once (so dashes line up).
function CutLines({ cells }) {
  const seen = new Set(), lines = []
  const add = (x1, y1, x2, y2) => { const k = [x1, y1, x2, y2].map(v => v.toFixed(2)).join(','); if (!seen.has(k)) { seen.add(k); lines.push([x1, y1, x2, y2]) } }
  for (const c of cells) { add(c.x, c.y, c.x + c.w, c.y); add(c.x, c.y + c.h, c.x + c.w, c.y + c.h); add(c.x, c.y, c.x, c.y + c.h); add(c.x + c.w, c.y, c.x + c.w, c.y + c.h) }
  return <g stroke="#9ca3af" strokeWidth=".35" strokeDasharray="2 1.4">{lines.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}</g>
}

const Defs = () => <defs><filter id="scc-gray"><feColorMatrix type="saturate" values="0" /></filter></defs>

function Header({ title, note }) {
  return <>
    <text x={100} y={10} textAnchor="middle" direction="rtl" fontFamily={FONT} fontWeight={900} fontSize={6.6} fill="#111">{title}</text>
    <text x={100} y={15.6} textAnchor="middle" direction="rtl" fontFamily={FONT} fontSize={3.3} fill="#4b5563">{note}</text>
  </>
}

// Card sheets for a list of items: right-to-left, top to bottom.
function cardSheets(set, items, o, size, keyBase, title = set.title) {
  const [cols, rows] = GRID[set.wide ? 'wide' : 'square'][size]
  const per = cols * rows, cw = GW / cols, ch = GH / rows
  const count = Math.ceil(items.length / per)
  return Array.from({ length: count }, (_, s) => {
    const cells = items.slice(s * per, s * per + per).map((item, i) => ({ item, x: GX + GW - ((i % cols) + 1) * cw, y: GY + Math.floor(i / cols) * ch, w: cw, h: ch }))
    const Card = set.wide ? WideCard : SquareCard
    const sizes = sheetSizes(cells, set, o)
    return {
      key: `${keyBase}-${s}`,
      svg: <Sheet label={`${title} — דף ${s + 1}`}>
        <Defs />
        <Header title={count > 1 ? `${title} (${s + 1}/${count})` : title} note="✂ גוזרים לאורך הקווים המקווקווים · כדאי להדביק על קרטון או לצפות בלמינציה" />
        <CutLines cells={cells} />
        {cells.map(c => <Card key={c.item.id + c.x + c.y} {...c} set={set} o={o} sizes={sizes} />)}
      </Sheet>,
    }
  })
}

// Communication board: needs on top, feelings below, on one uncut page.
function boardSheet(set, o) {
  const needs = NEEDS.map((item, i) => ({ item, x: GX + GW - ((i % 5) + 1) * 38, y: 36 + Math.floor(i / 5) * 47, w: 38, h: 47 }))
  const feels = FEELINGS.map((item, i) => ({ item, x: GX + GW - ((i % 3) + 1) * (GW / 3), y: 148 + Math.floor(i / 3) * 49, w: GW / 3, h: 49 }))
  const needSizes = sheetSizes(needs, set, o), feelSizes = sheetSizes(feels, set, o)
  const head = (y, text) => <g>
    <rect x={GX + 2} y={y - 5.6} width={GW - 4} height={8} rx={2} fill={o.color ? set.color[1] : '#f3f4f6'} stroke={o.color ? set.color[0] : '#111'} strokeWidth=".5" />
    <text x={GX + GW - 6} y={y} textAnchor="start" direction="rtl" fontFamily={FONT} fontWeight={800} fontSize={5} fill="#111">{text}…</text>
  </g>
  return {
    key: 'board',
    svg: <Sheet label="לוח תקשורת">
      <Defs />
      <text x={100} y={12} textAnchor="middle" direction="rtl" fontFamily={FONT} fontWeight={900} fontSize={7.4} fill="#111">לוח התקשורת שלי</text>
      <text x={195} y={22} textAnchor="start" direction="rtl" fontFamily={FONT} fontSize={3.8} fill="#374151">שם: ____________________</text>
      {head(31, pick(PHRASES.iNeed, o))}
      {needs.map(c => <SquareCard key={c.item.id} {...c} set={set} o={o} sizes={needSizes} />)}
      {head(143, pick(PHRASES.iFeel, o))}
      {feels.map(c => <SquareCard key={c.item.id} {...c} set={set} o={o} sizes={feelSizes} />)}
      <text x={100} y={258} textAnchor="middle" direction="rtl" fontFamily={FONT} fontSize={3.4} fill="#4b5563">מצביעים על התמונה ואומרים את המילה בקול. כדאי לצפות את הלוח בלמינציה או להכניס לשרוול ניילון.</text>
    </Sheet>,
  }
}

// Two strips of four slots, sized for the small cards, glued one under the other.
function stripSheet(set, o) {
  const sw = 50, sh = 50, numW = 10, stripW = sw + numW + 4, top = 22
  const strips = [112 + 6, 24 + 6]
  return {
    key: 'strip',
    svg: <Sheet label="רצועת סדר יום">
      <Header title="רצועת סדר היום שלנו" note="מתאימה לכרטיסים בגודל קטן · גוזרים את שתי הרצועות ומדביקים את רצועה 2 מתחת לרצועה 1" />
      {strips.map((sx, si) => <g key={si}>
        <rect x={sx} y={top} width={stripW} height={14 + 4 * (sh + 4) + 2} rx={3} fill={o.color ? set.color[1] : '#fff'} stroke="#6b7280" strokeWidth=".45" strokeDasharray="2 1.4" />
        <text x={sx + stripW / 2} y={top + 9} textAnchor="middle" direction="rtl" fontFamily={FONT} fontWeight={800} fontSize={4.2} fill="#111">{si ? 'רצועה 2' : 'רצועה 1'}</text>
        {[0, 1, 2, 3].map(k => {
          const y = top + 14 + k * (sh + 4), n = si * 4 + k + 1
          return <g key={k}>
            <rect x={sx + 2} y={y} width={sw} height={sh} rx={2.5} fill="#fff" stroke={o.color ? set.color[0] : '#111'} strokeWidth=".5" />
            <circle cx={sx + 2 + sw + numW / 2 + 1} cy={y + sh / 2} r={4} fill={o.color ? set.color[0] : '#fff'} stroke="#111" strokeWidth=".4" />
            <text x={sx + 2 + sw + numW / 2 + 1} y={y + sh / 2 + 1.5} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={4.2} fill={o.color ? '#fff' : '#111'}>{n}</text>
          </g>
        })}
      </g>)}
      <text x={100} y={261} textAnchor="middle" direction="rtl" fontFamily={FONT} fontSize={3.4} fill="#4b5563">מצמידים את הכרטיסים בסקוטש (ולקרו) או בדבק נייר — וכך אפשר להחליף אותם בכל יום.</text>
    </Sheet>,
  }
}

// First–then board, with a "done" pocket at the bottom.
function firstThenSheet(set, o) {
  const slot = (y, text) => <g>
    <text x={100} y={y - 3} textAnchor="middle" direction="rtl" fontFamily={FONT} fontWeight={900} fontSize={6.4} fill={o.color ? set.color[0] : '#111'}>{text}</text>
    <rect x={50} y={y} width={100} height={86} rx={4} fill={o.color ? set.color[1] : '#fff'} stroke={o.color ? set.color[0] : '#111'} strokeWidth=".8" />
    <text x={100} y={y + 45} textAnchor="middle" direction="rtl" fontFamily={FONT} fontSize={3.4} fill="#9ca3af">מניחים כאן כרטיס</text>
  </g>
  return {
    key: 'first-then',
    svg: <Sheet label="לוח קודם ואחר כך">
      {slot(30, pick(PHRASES.first, o))}
      <path d="M100 121 L100 134 M94 128 L100 134 L106 128" stroke="#111" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {slot(146, pick(PHRASES.then, o))}
      <rect x={30} y={240} width={140} height={20} rx={3} fill="none" stroke="#6b7280" strokeWidth=".5" strokeDasharray="2 1.4" />
      <text x={100} y={249} textAnchor="middle" direction="rtl" fontFamily={FONT} fontWeight={800} fontSize={4.6} fill="#111">{pick(PHRASES.done, o)} ✔</text>
      <text x={100} y={255.5} textAnchor="middle" direction="rtl" fontFamily={FONT} fontSize={3} fill="#4b5563">כאן (או במעטפה שמודבקת כאן) שמים כרטיס של פעילות שהסתיימה</text>
    </Sheet>,
  }
}

const BLANK = { id: 'blank', icon: null, label: null }

function buildPages(chosen, o) {
  return SETS.filter(s => chosen.includes(s.id)).flatMap(set => {
    if (set.id === 'communication') return [boardSheet(set, o), ...cardSheets(set, set.items, o, o.size, set.id, 'כרטיסי תקשורת ורגשות')]
    if (set.id === 'schedule') {
      const items = [...SCHEDULE, { ...BLANK, id: 'blank-1' }]
      return [
        ...cardSheets(set, items, o, o.size, set.id),
        stripSheet(set, o),
        firstThenSheet(set, o),
        ...(o.size === 'small' ? [] : cardSheets(set, items, o, 'small', 'schedule-small', 'סדר יום — כרטיסים קטנים לרצועה')),
      ]
    }
    // Sentences and movement instructions are the point of these two sets — they keep their words.
    return cardSheets(set, set.items, set.wide ? { ...o, words: true } : o, o.size, set.id)
  })
}

const faq = [
  { q: 'מה יש בערכה ואיך מדפיסים?', a: 'שש ערכות: כרטיסי ויסות והרגעה, ערכת חושים, לוח תקשורת ורגשות, סדר יום בגן (עם רצועה ולוח "קודם–אחר כך"), כרטיסי עזרה ובקשה וכרטיסי הליכת חיות. מסמנים את הערכות הרצויות, בוחרים גודל, צבע או שחור־לבן, ניקוד ונוסח פנייה, ולוחצים "הדפסה או PDF".' },
  { q: 'איזה גודל כרטיס כדאי לבחור?', a: 'כרטיסים קטנים (20 בדף) מתאימים לרצועת סדר היום, לטבעת מפתחות ולשולחן של הילד. בינוניים (12 בדף) — לקיר ולפינת הוויסות. גדולים (6 בדף) — לילדים צעירים, לילדים עם קושי בראייה ולמפגש במליאה.' },
  { q: 'למה יש אפשרות לבחור "צריך/ה", "צריך" או "צריכה"?', a: 'כדי שכל ילד וילדה יקבלו כרטיסים שמדברים בשפה שלהם. "צריך/ה" מתאים לכרטיסים משותפים לכל הגן; כשמכינים ערכה אישית אפשר לבחור נוסח זכר או נקבה.' },
  { q: 'האם הכרטיסים מחליפים טיפול או אבחון?', a: 'לא. אלה כלים חינוכיים פשוטים שעוזרים לילדים לבטא צורך ולצפות את מה שיקרה. אם ילד מתקשה בוויסות, בתקשורת או בתנועה, כדאי להתייעץ עם מרפאה בעיסוק, קלינאית תקשורת או צוות החינוך המיוחד, ולהתאים את הכרטיסים יחד איתם.' },
  { q: 'אפשר להשתמש בכרטיסים גם בבית?', a: 'כן. לוח "קודם–אחר כך" ורצועת סדר יום עוזרים גם בבוקר לפני הגן או בשגרת ערב, וכרטיסי ההרגעה מתאימים לפינה שקטה בחדר. כדאי שהבית והגן ישתמשו באותן תמונות ובאותן מילים.' },
  { q: 'הכרטיסים חינמיים?', a: 'כן, בלי הרשמה ובלי תשלום. אפשר לשנות הגדרות ולהדפיס שוב כמה פעמים שרוצים.' },
]

const Guide = ({ title, children }) => <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
  <h2 className="mb-3 text-2xl font-bold">{title}</h2>
  <div className="space-y-2 leading-relaxed text-[var(--foreground)]/85">{children}</div>
</section>

const Li = ({ children }) => <li className="mr-5 list-disc">{children}</li>

export default function SensoryCommunicationCards() {
  const [chosen, setChosen] = useState(() => SETS.map(s => s.id))
  const [size, setSize] = useState('medium')
  const [words, setWords] = useState(true)
  const [nikud, setNikud] = useState(false)
  const [color, setColor] = useState(true)
  const [gender, setGender] = useState('b')
  const o = { size, words, nikud, color, gender }
  const active = chosen.length ? chosen : SETS.map(s => s.id)
  const pages = buildPages(active, o)
  const toggle = id => setChosen(list => list.includes(id) ? list.filter(x => x !== id) : [...list, id])

  return <PrintableShell path={PATH} emoji="🧩"
    h1="כרטיסיות לוויסות חושי, תקשורת וסדר יום"
    seoTitle="כרטיסיות ויסות חושי, לוח תקשורת וסדר יום בגן להדפסה"
    description="כרטיסיות ויסות חושי להדפסה, לוח תקשורת, רגשות, סדר יום בגן עם רצועה, כרטיסי בקשת עזרה והליכת חיות. לגן ולחינוך המיוחד, עם ניקוד ובשחור־לבן — חינם."
    sub="שש ערכות של כרטיסים עם תמונה ומילה — לגן, לחינוך המיוחד ולבית"
    crumbs={[{ label: 'לכיתה ולגן', href: '/classroom' }]}
    lead={<QuickAnswer q="איך מכינים כרטיסיות ויסות ותקשורת לגן?"
      a="בוחרים כאן את הערכות (ויסות והרגעה, חושים, לוח תקשורת ורגשות, סדר יום, עזרה ובקשה, הליכת חיות), את גודל הכרטיס ואת הסגנון, ומדפיסים. גוזרים לאורך הקווים המקווקווים, מצפים בלמינציה ומלמדים את הכרטיסים ברגע רגוע — לפני שצריכים אותם."
      rows={[['גילים', 'גן טרום־חובה, גן חובה, כיתות א׳–ב׳ וחינוך מיוחד'], ['אפשרויות', '3 גדלים, עם או בלי מילים, ניקוד, צבע או שחור־לבן, נוסח זכר/נקבה/משותף'], ['מחיר', 'חינם, בלי הרשמה']]}
      updated="2026-10-24" />}
    controls={<>
      <div className="text-center"><p className="mb-2 font-bold">אילו ערכות להדפיס? ({active.length} מתוך {SETS.length})</p>
        <div className="flex flex-wrap justify-center gap-2">{SETS.map(s => <button key={s.id} type="button" onClick={() => toggle(s.id)} aria-pressed={chosen.includes(s.id)}
          className={`min-h-[44px] rounded-xl border-2 px-3 py-1.5 font-bold ${chosen.includes(s.id) ? 'border-slate-800 bg-white' : 'border-slate-200 bg-slate-100 text-slate-500'}`}><span aria-hidden="true">{s.emoji} </span>{s.short}</button>)}</div>
      </div>
      <Choice label="גודל כרטיס" value={size} onChange={setSize} options={[['small', 'קטן · 20 בדף'], ['medium', 'בינוני · 12 בדף'], ['large', 'גדול · 6 בדף']]} />
      <Choice label="צבע" value={color ? 'color' : 'bw'} onChange={v => setColor(v === 'color')} options={[['color', '🎨 צבעוני'], ['bw', '⚫ שחור־לבן']]} />
      <Choice label="מילים" value={words ? 'yes' : 'no'} onChange={v => setWords(v === 'yes')} options={[['yes', 'תמונה + מילה'], ['no', 'תמונה בלבד']]} />
      <Choice label="ניקוד" value={nikud ? 'yes' : 'no'} onChange={v => setNikud(v === 'yes')} options={[['no', 'בלי ניקוד'], ['yes', 'עם ניקוד']]} />
      <Choice label="נוסח פנייה" value={gender} onChange={setGender} options={[['b', 'צריך/ה — לכולם'], ['m', 'צריך — לילד'], ['f', 'צריכה — לילדה']]} />
      {!words && <p className="text-center text-sm text-[var(--muted-foreground)]">בכרטיסי העזרה ובכרטיסי הליכת החיות המילים נשארות — הן חלק מהכרטיס.</p>}
    </>}
    pages={pages} previewAll printTitle="כרטיסיות ויסות, תקשורת וסדר יום"
    paragraphs={[
      'כרטיסיות חזותיות עוזרות לילדים להבין מה קורה סביבם ולהגיד מה הם צריכים — גם כשקשה למצוא מילים. בגן רגיל הן מוסיפות סדר ושקט, ובחינוך המיוחד הן לעיתים קרובות חלק מהשפה היומיומית של הכיתה.',
      'כל הכרטיסים כאן מקוריים: תמונה ברורה, מילה אחת או משפט קצר, ומסגרת בצבע שונה לכל ערכה כדי שיהיה קל למיין אותם. בגרסת השחור־לבן התמונות מודפסות באפור, וכך חוסכים בדיו ועדיין מקבלים כרטיס ברור.',
      'אפשר לבחור ניקוד מלא לילדים שמתחילים לקרוא, ונוסח זכר, נקבה או נוסח משותף ("צריך/ה") — כדי שכל ילד וילדה יראו את עצמם בכרטיס.',
    ]}
    faq={faq}
    related={[
      { label: 'לוחות לבית — מטלות ושגרה', href: '/printables/home-charts' },
      { label: 'מוטוריקה עדינה — דפי תרגול', href: '/printables/fine-motor' },
      { label: 'כרטיסיות אותיות', href: '/printables/letter-flashcards' },
      { label: 'דפי עבודה לגן חובה', href: '/printables/kindergarten-worksheets' },
      { label: 'משחקים לגן', href: '/games/kindergarten' },
      { label: 'פעילויות לפעוטות', href: '/toddlers' },
      { label: 'כל הכלים לכיתה ולגן', href: '/classroom' },
    ]}
  >
    <div className="mx-auto mt-12 max-w-3xl space-y-5" dir="rtl">
      <h2 className="text-center text-3xl font-bold">מדריך קצר לגננת ולצוות</h2>
      <Guide title="איך משתמשים בכרטיסי הוויסות?">
        <ul className="space-y-1.5">
          <Li>מלמדים את הכרטיסים ברגע רגוע: מראים כרטיס, מדגימים יחד ("בואו ננשום עמוק כמו שמריחים פרח ומכבים נר"), ותולים במקום קבוע ובגובה העיניים של הילדים.</Li>
          <Li>כשילד מתחיל להתרגש, מציעים שתיים־שלוש אפשרויות ולא את כל הערכה. הבחירה שלו — היא כבר חלק מההרגעה.</Li>
          <Li>קודם מתקרבים ומדברים בשקט, ורק אחר כך מציעים כרטיס. מבוגר רגוע לידו עוזר יותר מכל כרטיס.</Li>
          <Li>כרטיס ויסות הוא אף פעם לא עונש. אחרי שנרגעים, אומרים מה עזר ("ראיתי שהכרית עזרה לך") ומזמינים לחזור לפעילות.</Li>
          <Li>כל ילד נרגע אחרת: יש מי שזקוק לתנועה ויש מי שזקוק לשקט. שימו לב מה עובד לכל אחד, ואפשר להכין לו טבעת אישית עם הכרטיסים שלו.</Li>
        </ul>
      </Guide>
      <Guide title="רעיונות לפינת ויסות (פינה שקטה) בגן">
        <ul className="space-y-1.5">
          <Li>פינה קטנה ומוגדרת — אוהל, מזרן או שטיח עם כריות — רחוקה מהמעבר ומהרעש, שהצוות עדיין רואה אותה.</Li>
          <Li>תאורה רכה ומעט גירויים על הקירות. כרטיסי הוויסות ולוח הרגשות תלויים בפנים, בגובה הילד.</Li>
          <Li>סל קטן עם חפצים מוכרים: כדור לחיצה, כרית רכה, אוזניות להפחתת רעש, ספר תמונות ו"בקבוק הרגעה" (מים ונצנצים בבקבוק שהמכסה שלו מודבק היטב).</Li>
          <Li>הפינה פתוחה לכולם והולכים אליה מבחירה — היא מקום להירגע, לא מקום להעניש. מסכמים מראש כמה זמן נשארים ואיך חוזרים (אפשר עם שעון חול).</Li>
          <Li>פריטים כבדים או מיוחדים, כמו שמיכה משוקללת או נדנדה, מתאימים רק בהנחיה של מרפאה בעיסוק.</Li>
        </ul>
      </Guide>
      <Guide title="לוח תקשורת, רגשות וסדר יום">
        <ul className="space-y-1.5">
          <Li>מדברים ומצביעים יחד: כשאומרים "רוצה עוד?" — מצביעים על "עוד" בלוח. כך הילדים רואים איך משתמשים בו, בלי לדרוש מהם לענות.</Li>
          <Li>מכבדים כל בקשה שהילד מראה, גם "לא" ו"די". זה מה שמלמד אותו שהלוח באמת עובד.</Li>
          <Li>במפגש הבוקר מסדרים יחד את רצועת סדר היום ומספרים מה יקרה. כשפעילות נגמרת מורידים את הכרטיס ל"סיימנו".</Li>
          <Li>לוח "קודם–אחר כך" עוזר במעברים: "קודם רחיצת ידיים, אחר כך ארוחה". כשמשהו משתנה, מראים את כרטיס "שינוי" ומסבירים מראש.</Li>
          <Li>ילדים שמשתמשים בתקשורת תומכת וחליפית (תת״ח) עובדים בדרך כלל עם לוח אישי — כדאי לתאם את הכרטיסים עם קלינאית התקשורת ועם ההורים.</Li>
        </ul>
      </Guide>
      <Guide title="הליכת חיות — תנועה בגן ובחצר">
        <ul className="space-y-1.5">
          <Li>מפנים מקום, עובדים על משטח לא חלק, ומדגימים כל תנועה לפני שהילדים מנסים.</Li>
          <Li>מושכים כרטיס, קוראים יחד את ההוראה, ועוברים מצד לצד של החדר. אפשר לשלב עם שיר ולעצור כשהמוזיקה נעצרת.</Li>
          <Li>"מעוף פרפר" ו"צעדי פיל" איטיים ומרגיעים, ו"קפיצת צפרדע" ו"קפיצת ארנב" נותנות הרבה תנועה — אפשר לסיים תמיד בתנועה איטית.</Li>
          <Li>כל ילד עושה בדרך שלו ובקצב שלו. לילד שמתקשה בשיווי משקל אפשר להציע להחזיק בקיר או ביד של מבוגר; למה שמתאים לו במיוחד — כדאי לשאול את הפיזיותרפיסטית או המרפאה בעיסוק.</Li>
        </ul>
      </Guide>
      <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--postit)] p-4 text-center leading-relaxed">
        הכרטיסים הם כלי חינוכי ולא תחליף לאבחון או לטיפול. אם נראה שילד מתקשה בוויסות, בתקשורת או בתנועה, כדאי לשתף את ההורים ולהתייעץ עם אנשי המקצוע — מרפאה בעיסוק, קלינאית תקשורת או צוות החינוך המיוחד. עוד רעיונות לגננות ב<Link to="/classroom" className="font-bold underline">כלים לכיתה ולגן</Link>.
      </p>
    </div>
  </PrintableShell>
}
