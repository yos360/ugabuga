import { FONT } from '../../components/holidays/printKit'
import { LETTERS, SHAPE_KEY, SHAPE_WORDS, SHEETS, keyTable, messageRows } from '../../data/secretCodes'

// The A4 sheets of /tools/secret-codes: one per age group, a cut-out cipher wheel and an answer page.
// Every sheet is computed from secretCodes.js, so the answer page always matches the puzzles.
const T = ({ x, y, size = 16, weight = 700, fill = '#111', children, ...rest }) => <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={weight} fill={fill} direction="rtl" {...rest}>{children}</text>

const LINE = { fill: 'white', stroke: '#111', strokeWidth: 2.5, strokeLinejoin: 'round' }

function Shape({ type, x, y, r = 18 }) {
  if (type === 'circle') return <circle cx={x} cy={y} r={r} {...LINE} />
  if (type === 'square') return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} {...LINE} />
  if (type === 'triangle') return <path d={`M${x} ${y - r} L${x + r} ${y + r * 0.8} L${x - r} ${y + r * 0.8} Z`} {...LINE} />
  if (type === 'star') {
    const points = Array.from({ length: 10 }, (_, i) => {
      const a = (Math.PI / 5) * i - Math.PI / 2, d = i % 2 ? r * 0.45 : r * 1.1
      return `${(x + Math.cos(a) * d).toFixed(1)} ${(y + Math.sin(a) * d).toFixed(1)}`
    })
    return <path d={`M${points.join(' L')} Z`} {...LINE} />
  }
  if (type === 'heart') return <path d={`M${x} ${y + r} C${x - r * 1.6} ${y - r * 0.2} ${x - r * 0.7} ${y - r * 1.2} ${x} ${y - r * 0.4} C${x + r * 0.7} ${y - r * 1.2} ${x + r * 1.6} ${y - r * 0.2} ${x} ${y + r} Z`} {...LINE} />
  if (type === 'moon') return <path d={`M${x + r * 0.5} ${y - r} A${r} ${r} 0 1 0 ${x + r * 0.5} ${y + r} A${r * 0.8} ${r * 0.8} 0 1 1 ${x + r * 0.5} ${y - r} Z`} {...LINE} />
  if (type === 'drop') return <path d={`M${x} ${y - r * 1.1} C${x + r * 0.5} ${y - r * 0.3} ${x + r * 0.9} ${y} ${x + r * 0.9} ${y + r * 0.3} A${r * 0.9} ${r * 0.9} 0 1 1 ${x - r * 0.9} ${y + r * 0.3} C${x - r * 0.9} ${y} ${x - r * 0.5} ${y - r * 0.3} ${x} ${y - r * 1.1} Z`} {...LINE} />
  return <g>
    {Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i
      return <circle key={i} cx={x + Math.cos(a) * r * 0.62} cy={y + Math.sin(a) * r * 0.62} r={r * 0.42} {...LINE} />
    })}
    <circle cx={x} cy={y} r={r * 0.32} {...LINE} />
  </g>
}

const shapeOf = letter => SHAPE_KEY.find(k => k.letter === letter).shape

function KindergartenSheet() {
  const cell = 66
  return <svg viewBox="0 0 600 820" role="img" aria-label="דף צופן הצורות לגן" style={{ width: '100%', height: '100%', background: 'white' }}>
    <T x={300} y={42} size={28} weight={800}>צופן הצורות</T>
    <T x={300} y={70} size={16} weight={400}>כל צורה היא אות. כותבים את האות בריבוע מתחת, ומציירים מה יצא!</T>
    <rect x="26" y="86" width="548" height="92" rx="14" fill="none" stroke="#111" strokeWidth="2" />
    {SHAPE_KEY.map((k, i) => {
      const x = 540 - i * 68
      return <g key={k.letter}><Shape type={k.shape} x={x} y={116} /><T x={x} y={166} size={24} weight={800}>{k.letter}</T></g>
    })}
    {SHAPE_WORDS.map((word, row) => {
      const y = 196 + row * 96
      return <g key={word}>
        {[...word].map((c, i) => {
          const x = 540 - i * cell
          return <g key={i}><Shape type={shapeOf(c)} x={x} y={y + 24} /><rect x={x - 24} y={y + 48} width="48" height="36" rx="6" fill="white" stroke="#111" strokeWidth="2" /></g>
        })}
        <rect x="36" y={y + 4} width="170" height="80" rx="10" fill="white" stroke="#111" strokeWidth="1.5" strokeDasharray="6 5" />
      </g>
    })}
  </svg>
}

function MessageSheet({ sheet }) {
  const perRow = 15, cell = 33.7, rowH = 58, step = 546 / 22
  const table = keyTable(sheet.cipher, sheet.key)
  const blocks = sheet.messages.map(message => ({ message, rows: messageRows(message, sheet.cipher, sheet.key, perRow) }))
  const blockTop = n => blocks.slice(0, n).reduce((top, b) => top + b.rows.length * rowH + 12, 158)
  const y = blockTop(blocks.length)
  return <svg viewBox="0 0 600 820" role="img" aria-label={sheet.title} style={{ width: '100%', height: '100%', background: 'white' }}>
    <T x={300} y={40} size={26} weight={800}>{sheet.title}</T>
    <T x={300} y={66} size={15} weight={400}>{sheet.rule}</T>
    <rect x="26" y="82" width="548" height="60" rx="10" fill="none" stroke="#111" strokeWidth="2" />
    <path d="M26 112 H574" stroke="#111" strokeWidth="1" />
    {table.map((k, i) => {
      const x = 561 - i * step
      return <g key={k.letter}>
        <T x={x} y={103} size={15}>{sheet.cipher === 'number' ? k.letter : k.code}</T>
        <T x={x} y={133} size={sheet.cipher === 'number' ? 13 : 15} weight={sheet.cipher === 'number' ? 700 : 400}>{sheet.cipher === 'number' ? k.code : k.letter}</T>
      </g>
    })}
    {blocks.map(({ message, rows }, n) => {
      const top = blockTop(n)
      return <g key={message}>
        <circle cx="558" cy={top + 16} r="13" fill="white" stroke="#111" strokeWidth="2" />
        <T x={558} y={top + 21} size={15} weight={800}>{n + 1}</T>
        {rows.map((row, r) => row.map((code, i) => {
          if (!code) return null
          const x = 522 - i * cell, cy = top + r * rowH
          return <g key={`${r}-${i}`}>
            <T x={x} y={cy + 22} size={sheet.cipher === 'number' ? 16 : 20}>{code}</T>
            <path d={`M${x - 13} ${cy + 48} H${x + 13}`} stroke="#111" strokeWidth="1.8" />
          </g>
        }))}
      </g>
    })}
    {sheet.own && <g>
      <T x={300} y={y + 36} size={18}>{sheet.own}</T>
      {[92, 152, 212].map(dy => <path key={dy} d={`M50 ${y + dy} H550`} stroke="#111" strokeWidth="1.8" />)}
    </g>}
    {sheet.mirror && <g>
      <T x={300} y={y + 24} size={16}>בונוס: מחזיקים מראה ליד השורה הזו וכותבים מה יצא</T>
      <g transform="translate(600 0) scale(-1 1)"><T x={300} y={y + 62} size={26} weight={800}>{sheet.mirror}</T></g>
      <path d={`M120 ${y + 100} H480`} stroke="#111" strokeWidth="1.8" />
    </g>}
    {sheet.tanakh && <g>
      <T x={300} y={y + 24} size={16}>אתגר מהתנ״ך: בספר ירמיהו כתוב "{sheet.tanakh.code}". איזו עיר מסתתרת שם?</T>
      <path d={`M210 ${y + 62} H390`} stroke="#111" strokeWidth="1.8" />
    </g>}
  </svg>
}

// A ring of the 22 letters; the small disc sits on the big one and turns on a pin at the centre.
function Disc({ cx, cy, r, ring, label }) {
  const step = 360 / LETTERS.length
  return <g>
    <circle cx={cx} cy={cy} r={r} fill="white" stroke="#111" strokeWidth="2.5" strokeDasharray="8 5" />
    <circle cx={cx} cy={cy} r={ring - 22} fill="none" stroke="#111" strokeWidth="1.5" />
    {[...LETTERS].map((c, i) => <g key={c} transform={`rotate(${(i * step).toFixed(2)} ${cx} ${cy})`}>
      <path d={`M${cx} ${cy - ring + 22} V${cy - r}`} stroke="#111" strokeWidth="1" transform={`rotate(${(step / 2).toFixed(2)} ${cx} ${cy})`} />
      <T x={cx} y={cy - ring + 7} size={22} weight={800}>{c}</T>
    </g>)}
    <circle cx={cx} cy={cy} r="4" fill="#111" />
    <T x={cx} y={cy + 32} size={14} weight={700}>{label}</T>
  </g>
}

function WheelSheet() {
  return <svg viewBox="0 0 600 820" role="img" aria-label="גלגל צפנים לגזירה" style={{ width: '100%', height: '100%', background: 'white' }}>
    <T x={300} y={28} size={24} weight={800}>גלגל צפנים לגזירה</T>
    <Disc cx={300} cy={232} r={190} ring={172} label="הגלגל הגדול" />
    <T x={300} y={442} size={14} weight={400}>גוזרים את שני העיגולים, מניחים את הקטן על הגדול, ומבוגר מנקב חור במרכז ומחבר בסיכה מתפצלת.</T>
    <T x={300} y={464} size={14} weight={400}>מסובבים כך ש־א של הגלגל הקטן תעמוד מתחת לאות שבחרתם: זה המפתח. מצפינים מהקטן לגדול.</T>
    <Disc cx={300} cy={640} r={148} ring={128} label="הגלגל הקטן" />
  </svg>
}

function AnswersSheet() {
  return <svg viewBox="0 0 600 820" role="img" aria-label="פתרונות לדפי הצפנים" style={{ width: '100%', height: '100%', background: 'white' }}>
    <T x={300} y={42} size={26} weight={800}>פתרונות למורה ולהורה</T>
    <T x={560} y={92} size={18} weight={800} textAnchor="start">גן — צופן הצורות</T>
    <T x={560} y={120} size={16} weight={400} textAnchor="start">{SHAPE_WORDS.join(' · ')}</T>
    {SHEETS.map((sheet, s) => {
      const top = 164 + s * 190
      return <g key={sheet.id}>
        <T x={560} y={top} size={18} weight={800} textAnchor="start">{sheet.name.replace(/^דף \d: /, '')}</T>
        {sheet.messages.map((m, i) => <T key={m} x={560} y={top + 28 + i * 26} size={16} weight={400} textAnchor="start">{i + 1}. {m}</T>)}
        {sheet.mirror && <T x={560} y={top + 28 + sheet.messages.length * 26} size={16} weight={400} textAnchor="start">בונוס: {sheet.mirror}</T>}
        {sheet.tanakh && <T x={560} y={top + 28 + sheet.messages.length * 26} size={16} weight={400} textAnchor="start">אתגר: {sheet.tanakh.answer}</T>}
      </g>
    })}
  </svg>
}

export const SECRET_SHEETS = [
  { id: 'grades-k', name: 'דף 1: גן — צופן הצורות', C: KindergartenSheet },
  ...SHEETS.map(sheet => ({ id: sheet.id, name: sheet.name, C: () => <MessageSheet sheet={sheet} /> })),
  { id: 'wheel', name: 'דף 5: גלגל צפנים לגזירה', C: WheelSheet },
  { id: 'answers', name: 'דף 6: פתרונות', C: AnswersSheet },
]
