import { ExerciseSheet } from '../math/MathSheet'
import { exercises } from '../../utils/mathSheets'

// Printable A4 worksheets for the "הכנה לכיתה א׳" modules. Everything here is a pure function of its
// props (PrintPreview renders each page twice — dialog + print copy), and no SVG uses ids.

const W = 600, H = 820
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

// Hebrew uses the single-line dashed tracing font (one line per stroke, no
// overlapping outlines); anything else falls back to a dashed outline.
export function TraceText({ value, repeats: want = 1, stroke = '#94a3b8', height = 150 }) {
  const base = want === 1 ? 104 : 58
  const heb = /[֐-׿]/.test(value)
  // Long words get fewer copies per row instead of overlapping each other.
  const copyW = [...value].length * 0.62 * base * (heb ? 1.2 : 1)
  const repeats = want === 1 ? 1 : Math.max(1, Math.min(want, Math.floor(900 / (copyW + 60))))
  const positions = repeats === 1 ? [500] : Array.from({ length: repeats }, (_, i) => 900 - i * (800 / (repeats - 1)))
  const room = repeats === 1 ? 900 : 800 / (repeats - 1) * 0.9
  const fs = heb ? Math.min(base * 1.2, room / Math.max([...value].length * 0.62, 1)) : base
  // Writing lines: the letters sit on the baseline and reach exactly the top line.
  const y = height * 0.8, top = y - (heb ? 0.6 : 0.72) * fs
  return <svg viewBox={`0 0 1000 ${height}`} className="block h-full w-full" role="img" aria-label={`תרגול כתיבה: ${value}`}>
    <path d={`M10 ${top} H990`} stroke="#bfdbfe" strokeWidth="2" strokeDasharray="10 8" />
    <path d={`M10 ${y} H990`} stroke="#93c5fd" strokeWidth="2.5" />
    {positions.map((x, i) => heb
      ? <text key={i} x={x} y={y} textAnchor="middle" direction="rtl" fontFamily="BugaTracer" fontSize={fs} fill={stroke} stroke={stroke} strokeWidth={fs * 0.014}>{value}</text>
      : <text key={i} x={x} y={y} textAnchor="middle" direction="rtl" unicodeBidi="plaintext" fontFamily="Arial, sans-serif" fontSize={fs} fontWeight="700" fill="none" stroke={stroke} strokeWidth="2.2" strokeDasharray="4 5" strokeLinecap="round">{value}</text>)}
  </svg>
}

function Header({ title, instruction }) {
  return <g fontFamily={FONT} textAnchor="middle" fill={INK}>
    <text x={W / 2} y="38" fontSize="24" fontWeight="700" direction="rtl">{title}</text>
    <text x={W / 2} y="66" fontSize="15" direction="rtl">שם: ____________    תאריך: ____________</text>
    <text x={W / 2} y="96" fontSize="17" fontWeight="700" direction="rtl">{instruction}</text>
  </g>
}
const Sheet = ({ label, children }) => <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} style={{ width: '100%', height: '100%', background: 'white' }}>{children}</svg>
const Page = ({ children }) => <article className="buga-a4"><div className="print-art">{children}</div></article>

// ── Maths: 20 exercises up to 10, answer on the line ──
function MathPage({ seed }) {
  const items = exercises({ range: 10, op: 'mix', type: 'regular', count: 20, seed })
  return <Page><ExerciseSheet items={items} title="חשבון עד 10 — הכנה לכיתה א׳" type="regular" /></Page>
}

// ── Clock: 3 clocks to read, 3 to draw ──
function ClockFace({ cx, cy, r, time }) {
  const [h, m] = time ? time.split(':').map(Number) : [0, 0]
  const hand = (deg, len) => { const a = (deg - 90) * Math.PI / 180; return `M${cx} ${cy} L${cx + Math.cos(a) * len} ${cy + Math.sin(a) * len}` }
  return <g>
    <circle cx={cx} cy={cy} r={r} fill="white" stroke={INK} strokeWidth="3" />
    {Array.from({ length: 60 }, (_, i) => { const a = i * 6 * Math.PI / 180, big = i % 5 === 0, r1 = r - (big ? 9 : 5); return <path key={i} d={`M${cx + Math.sin(a) * r1} ${cy - Math.cos(a) * r1} L${cx + Math.sin(a) * (r - 2)} ${cy - Math.cos(a) * (r - 2)}`} stroke={big ? INK : '#999'} strokeWidth={big ? 2 : 1} /> })}
    {Array.from({ length: 12 }, (_, i) => { const n = i + 1, a = n * 30 * Math.PI / 180; return <text key={n} x={cx + Math.sin(a) * (r - 22)} y={cy - Math.cos(a) * (r - 22) + 6} fontSize="17" fontWeight="700" fontFamily={FONT} textAnchor="middle" fill={INK}>{n}</text> })}
    {time && <><path d={hand((h % 12) * 30 + m * 0.5, r * 0.48)} stroke={INK} strokeWidth="6" strokeLinecap="round" /><path d={hand(m * 6, r * 0.74)} stroke={INK} strokeWidth="3.5" strokeLinecap="round" /></>}
    <circle cx={cx} cy={cy} r="5" fill={INK} />
  </g>
}
function ClockPage() {
  const read = ['3:00', '8:30', '11:00'], draw = ['6:00', '2:30', '9:00'], xs = [490, 300, 110]
  return <Page><Sheet label="דף עבודה: שעון">
    <Header title="השעון שלי — הכנה לכיתה א׳" instruction="המחוג הקצר מראה את השעה, המחוג הארוך את הדקות" />
    <g fontFamily={FONT} fill={INK}>
      <text x={W / 2} y="138" fontSize="19" fontWeight="700" textAnchor="middle" direction="rtl">1. מה השעה? כתבו על הקו</text>
      {read.map((t, i) => <g key={t}><ClockFace cx={xs[i]} cy={250} r={88} time={t} /><text x={xs[i]} y="375" fontSize="18" textAnchor="middle" direction="rtl">השעה: ______</text></g>)}
      <text x={W / 2} y="440" fontSize="19" fontWeight="700" textAnchor="middle" direction="rtl">2. ציירו את המחוגים לפי השעה</text>
      {draw.map((t, i) => <g key={t}><rect x={xs[i] - 42} y="458" width="84" height="36" rx="8" fill="#f1f5f9" stroke={INK} /><text x={xs[i]} y="484" fontSize="22" fontWeight="700" textAnchor="middle" direction="ltr">{t}</text><ClockFace cx={xs[i]} cy={605} r={88} /></g>)}
      <text x={W / 2} y="745" fontSize="17" textAnchor="middle" direction="rtl">באיזו שעה אני קם/ה בבוקר? ______   באיזו שעה אני הולך/ת לישון? ______</text>
    </g>
  </Sheet></Page>
}

// ── Months: 12 months, the season to fill in ──
function MonthsPage({ months }) {
  const top = 168, rowH = 44, cols = { n: 575, month: 520, season: 360, days: 215, draw: 95 }
  return <Page><Sheet label="דף עבודה: חודשים ועונות">
    <Header title="חודשי השנה העברית" instruction="כתבו בכל שורה באיזו עונה החודש, וציירו משהו שקשור אליו" />
    <g fontFamily={FONT} fill={INK} direction="rtl">
      <text x={W / 2} y="128" fontSize="16" textAnchor="middle">העונות: סתיו 🍂 · חורף 🌧️ · אביב 🌸 · קיץ ☀️</text>
      <rect x="20" y={top - 28} width="560" height={rowH * 12 + 28} fill="none" stroke={INK} strokeWidth="1.5" rx="6" />
      <path d={`M20 ${top} H580`} stroke={INK} strokeWidth="1.5" />
      {[['n', '#'], ['month', 'חודש'], ['season', 'באיזו עונה?'], ['days', 'כמה ימים'], ['draw', 'ציור']].map(([k, label]) => <text key={k} x={cols[k]} y={top - 9} fontSize="15" fontWeight="700" textAnchor="middle">{label}</text>)}
      {[555, 455, 280, 150].map(x => <path key={x} d={`M${x} ${top - 28} V${top + rowH * 12}`} stroke="#999" />)}
      {months.map(([name, emoji, , days], i) => { const y = top + i * rowH; return <g key={name}>
        {i > 0 && <path d={`M20 ${y} H580`} stroke="#ccc" />}
        <text x={cols.n} y={y + 28} fontSize="15" textAnchor="middle">{i + 1}</text>
        <text x={cols.month + 28} y={y + 29} fontSize="20" fontWeight="700" textAnchor="start">{emoji} {name}</text>
        <path d={`M${cols.season - 60} ${y + 32} H${cols.season + 60}`} stroke="#aaa" strokeDasharray="4 4" />
        <text x={cols.days} y={y + 28} fontSize={String(days).length > 2 ? 14 : 17} textAnchor="middle">{days}</text>
      </g> })}
      <text x={W / 2} y={top + rowH * 12 + 30} fontSize="13" textAnchor="middle" fill="#444">* בחשוון ובכסלו יש 29 או 30 ימים — זה משתנה משנה לשנה.</text>
      <text x={W / 2} y={top + rowH * 12 + 64} fontSize="17" textAnchor="middle">יום ההולדת שלי בחודש ____________, בעונת ____________</text>
    </g>
  </Sheet></Page>
}

// ── Letters / writing: trace the word down a whole page ──
function LettersPage({ value }) {
  const row = (child, key) => <div key={key} style={{ minHeight: 0, height: '100%' }}>{child}</div>
  return <article className="buga-a4" style={{ alignItems: 'stretch' }}>
    <h2>✏️ כותבים: {value}</h2>
    <p style={{ textAlign: 'center', margin: '0 0 4px', fontSize: 15 }}>שם: ______________ &nbsp;&nbsp; תאריך: ______________</p>
    <p style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 14 }}>עוברים בעיפרון על הקו המקווקו, ואז כותבים לבד בשורות הריקות</p>
    <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateRows: '1.5fr 1.5fr repeat(5, 1fr) repeat(3, 1fr)', gap: 2 }}>
      {row(<TraceText value={value} stroke="#8a96a8" />, 'a')}
      {row(<TraceText value={value} stroke="#b6c0ce" />, 'b')}
      {[0, 1, 2, 3, 4].map(i => row(<TraceText value={value} repeats={i < 2 ? 3 : 4} stroke="#b6c0ce" height={80} />, 'r' + i))}
      {[0, 1, 2].map(i => row(<TraceText value="" height={80} />, 'e' + i))}
    </div>
  </article>
}

// ── Reading / English: match each word to its picture, then write ──
const ORDER = [3, 0, 6, 1, 7, 4, 2, 5]
function MatchPage({ title, instruction, pairs, ltr = false }) {
  const rows = pairs.slice(0, 8), y0 = 160, step = 58
  const write = rows.slice(0, 4), xs = [510, 370, 230, 90]
  return <Page><Sheet label={title}>
    <Header title={title} instruction={instruction} />
    <g fontFamily={FONT} fill={INK}>
      {rows.map(([word], i) => <g key={'w' + word}>
        <text x="110" y={y0 + i * step + 11} fontSize="30" fontWeight="700" textAnchor="middle" direction={ltr ? 'ltr' : 'rtl'}>{word}</text>
        <circle cx="195" cy={y0 + i * step} r="7" fill={INK} />
      </g>)}
      {ORDER.slice(0, rows.length).map((j, i) => <g key={'p' + i}>
        <circle cx="405" cy={y0 + i * step} r="7" fill={INK} />
        <text x="490" y={y0 + i * step + 15} fontSize="42" textAnchor="middle">{rows[j][1]}</text>
      </g>)}
      <path d="M30 642 H570" stroke="#ccc" strokeDasharray="6 6" />
      <text x={W / 2} y="675" fontSize="18" fontWeight="700" textAnchor="middle" direction="rtl">{ltr ? 'כתבו את המילה באנגלית מתחת לתמונה' : 'כתבו את המילה מתחת לתמונה'}</text>
      {write.map(([word, pic], i) => <g key={'x' + word}>
        <text x={xs[i]} y="735" fontSize="46" textAnchor="middle">{pic}</text>
        <path d={`M${xs[i] - 55} 778 H${xs[i] + 55}`} stroke={INK} strokeWidth="1.5" />
      </g>)}
    </g>
  </Sheet></Page>
}

export const SHEET_TITLES = { letters: 'דף כתיבה', reading: 'דף קריאה — מתאימים מילה לתמונה', english: 'דף אנגלית — מתאימים מילה לתמונה', math: 'דף חשבון עד 10', clock: 'דף שעון', months: 'דף חודשים ועונות' }

export default function FirstGradeSheet({ module, seed, word, words, englishWords, months }) {
  if (module === 'math') return <MathPage seed={seed} />
  if (module === 'clock') return <ClockPage />
  if (module === 'months') return <MonthsPage months={months} />
  if (module === 'reading') return <MatchPage title="קריאה ראשונה" instruction="מתחו קו מכל מילה לתמונה המתאימה" pairs={words} />
  if (module === 'english') return <MatchPage title="English — מילים ראשונות" instruction="מתחו קו מכל מילה באנגלית לתמונה המתאימה" pairs={englishWords.map(([en, , pic]) => [en, pic])} ltr />
  return <LettersPage value={word} />
}
