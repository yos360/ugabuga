import SpeciesIcon from './SpeciesIcon'
import { SEVEN_SPECIES } from '../../data/tubishvat'

// Tu BiShvat colouring pages and worksheets — A4 SVG (600 × 820).
const FONT = 'Heebo, Arial, sans-serif'
const S = { fill: 'white', stroke: '#111', strokeWidth: 5, strokeLinejoin: 'round', strokeLinecap: 'round' }

const Page = ({ title, sub, children }) => <svg viewBox="0 0 600 820" role="img" aria-label={title} style={{ width: '100%', height: '100%', background: 'white' }}>
  <text x="300" y="46" textAnchor="middle" fontFamily={FONT} fontSize="34" fontWeight="800" fill="#111" direction="rtl">{title}</text>
  <text x="300" y="76" textAnchor="middle" fontFamily={FONT} fontSize="15" fill="#444" direction="rtl">שם: ____________    תאריך: ____________</text>
  {sub && <text x="300" y="108" textAnchor="middle" fontFamily={FONT} fontSize="18" fontWeight="700" fill="#111" direction="rtl">{sub}</text>}
  {children}
</svg>

const Icon = ({ id, x, y, size }) => <g transform={`translate(${x - size / 2} ${y - size / 2})`}><SpeciesIcon id={id} line size={size} /></g>

// ---------- colouring ----------
function Tree() {
  const fruit = [[220, 260], [300, 220], [380, 270], [250, 340], [350, 350], [300, 300], [190, 330], [410, 330]]
  return <Page title="העץ שלי">
    <path d="M270 740 C 272 640 276 560 262 470 L 338 470 C 324 560 328 640 330 740 Z" {...S} />
    <path d="M300 520 C 250 470 220 460 190 430 M300 500 C 350 460 380 450 410 420" fill="none" {...S} strokeWidth={14} />
    <path d="M300 520 C 250 470 220 460 190 430 M300 500 C 350 460 380 450 410 420" fill="none" stroke="white" strokeWidth={6} strokeLinecap="round" />
    <path d="M140 330 C 100 250 170 170 230 190 C 250 130 350 130 370 190 C 430 170 500 250 460 330 C 500 400 430 460 370 430 C 340 470 260 470 230 430 C 170 460 100 400 140 330 Z" {...S} />
    {fruit.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="17" {...S} strokeWidth={4} />)}
    <path d="M60 740 H540" {...S} />
    {[110, 170, 430, 490].map((x, i) => <path key={i} d={`M${x} 740 c -6 -22 6 -30 0 -48 M${x} 718 c 10 -8 18 -6 22 -14 M${x} 710 c -10 -8 -18 -6 -22 -14`} fill="none" {...S} strokeWidth={3.5} />)}
    <circle cx="520" cy="130" r="36" {...S} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = Math.PI * a / 180; return <path key={a} d={`M${520 + Math.cos(r) * 48} ${130 + Math.sin(r) * 48} L${520 + Math.cos(r) * 64} ${130 + Math.sin(r) * 64}`} {...S} strokeWidth={4} /> })}
  </Page>
}

function Almond() {
  const flower = (x, y, s = 1) => <g key={x + ',' + y} transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="0" cy="-20" rx="14" ry="20" transform={`rotate(${a})`} {...S} strokeWidth={3.5} />)}
    <circle r="8" {...S} strokeWidth={3} />
    {[0, 60, 120, 180, 240, 300].map(a => <circle key={a} cx={Math.cos(a) * 13} cy={Math.sin(a) * 13} r="2.5" fill="#111" />)}
  </g>
  return <Page title="השקדייה פורחת">
    <path d="M80 760 C 160 620 240 520 330 440 C 400 380 470 300 520 180" fill="none" {...S} strokeWidth={20} />
    <path d="M80 760 C 160 620 240 520 330 440 C 400 380 470 300 520 180" fill="none" stroke="white" strokeWidth={10} strokeLinecap="round" />
    <path d="M250 520 C 200 480 170 420 150 360 M400 360 C 360 300 350 240 360 170" fill="none" {...S} strokeWidth={12} />
    <path d="M250 520 C 200 480 170 420 150 360 M400 360 C 360 300 350 240 360 170" fill="none" stroke="white" strokeWidth={5} strokeLinecap="round" />
    {[[150, 340, 1.2], [360, 160, 1.1], [520, 170, 1.2], [300, 470, 1], [440, 300, 1], [210, 430, 0.9], [120, 700, 0.9], [470, 240, 0.8]].map(([x, y, s]) => flower(x, y, s))}
  </Page>
}

function Species() {
  return <Page title="שבעת המינים" sub="צבעו את שבעת המינים של ארץ ישראל">
    {SEVEN_SPECIES.map((sp, i) => {
      const col = i % 2, row = Math.floor(i / 2), last = i === 6
      const x = last ? 300 : col ? 170 : 430, y = 205 + row * 168
      return <g key={sp.id}>
        <circle cx={x} cy={y} r="58" {...S} strokeWidth={3} strokeDasharray="10 7" />
        <Icon id={sp.id} x={x} y={y - 4} size={82} />
        <text x={x} y={y + 90} textAnchor="middle" fontFamily={FONT} fontSize="26" fontWeight="800" direction="rtl">{sp.name}</text>
      </g>
    })}
  </Page>
}

const BigSpecies = ({ id, title }) => <Page title={title}><Icon id={id} x={300} y={430} size={460} /></Page>
const Pomegranate = () => <BigSpecies id="pomegranate" title="רימון" />
const Grapes = () => <BigSpecies id="grape" title="אשכול ענבים" />

function Greeting() {
  const sapling = (x, s) => <g key={x} transform={`translate(${x} 700) scale(${s})`}>
    <path d="M-40 0 H40 L30 60 H-30 Z" {...S} />
    <path d="M0 0 C 0 -40 0 -60 0 -80" fill="none" {...S} />
    <path d="M0 -50 C -30 -60 -40 -90 -30 -100 C -10 -90 0 -70 0 -50 Z M0 -70 C 30 -80 40 -110 30 -120 C 10 -110 0 -90 0 -70 Z" {...S} />
  </g>
  return <Page title="">
    <text x="300" y="250" textAnchor="middle" fontFamily={FONT} fontSize="130" fontWeight="900" fill="white" stroke="#111" strokeWidth="6" direction="rtl">ט״ו בשבט</text>
    <text x="300" y="420" textAnchor="middle" fontFamily={FONT} fontSize="130" fontWeight="900" fill="white" stroke="#111" strokeWidth="6" direction="rtl">שמח!</text>
    {[[120, 0.9], [300, 1.2], [480, 0.9]].map(([x, s]) => sapling(x, s))}
  </Page>
}

// ---------- worksheets ----------
function CountFruit() {
  const counts = [3, 5, 2, 6, 4, 7]
  return <Page title="כמה פירות על העץ?" sub="ספרו את הפירות על כל עץ וכתבו את המספר">
    {counts.map((n, i) => {
      const col = i % 2, row = Math.floor(i / 2), cx = col ? 160 : 440, cy = 250 + row * 200
      const spots = [[-40, -30], [0, -50], [40, -30], [-50, 5], [-10, -10], [30, 5], [55, -5]]
      return <g key={i}>
        <path d={`M${cx - 12} ${cy + 90} V${cy + 40} H${cx + 12} V${cy + 90} Z`} fill="white" stroke="#111" strokeWidth="3" />
        <ellipse cx={cx} cy={cy - 10} rx="85" ry="62" fill="white" stroke="#111" strokeWidth="3" />
        {spots.slice(0, n).map(([dx, dy], k) => <circle key={k} cx={cx + dx} cy={cy + dy} r="11" fill="white" stroke="#111" strokeWidth="2.5" />)}
        <rect x={cx + 100} y={cy + 30} width="50" height="46" rx="8" fill="white" stroke="#111" strokeWidth="2.5" strokeDasharray="6 4" />
      </g>
    })}
  </Page>
}

function MatchSpecies() {
  const order = ['olive', 'wheat', 'pomegranate', 'date', 'grape']
  const names = ['גפן', 'תמר', 'זית', 'רימון', 'חיטה']
  return <Page title="מי אני?" sub="מתחו קו מכל ציור לשם שלו">
    {order.map((id, i) => <g key={id}>
      <Icon id={id} x={470} y={190 + i * 125} size={100} />
      <circle cx="400" cy={190 + i * 125} r="7" fill="#111" />
    </g>)}
    {names.map((n, i) => <g key={n}>
      <circle cx="220" cy={190 + i * 125} r="7" fill="#111" />
      <rect x="60" y={162 + i * 125} width="140" height="56" rx="14" fill="white" stroke="#111" strokeWidth="3" />
      <text x="130" y={200 + i * 125} textAnchor="middle" fontFamily={FONT} fontSize="30" fontWeight="800" direction="rtl">{n}</text>
    </g>)}
  </Page>
}

function TraceWords() {
  const words = ['עץ', 'שתיל', 'רימון', 'זית', 'תמר', 'שקדייה']
  return <Page title="מילים של ט״ו בשבט" sub="עוברים בעיפרון על המילים, ואז כותבים לבד">
    {words.map((w, i) => {
      const y = 200 + i * 102, fs = Math.min(84, 480 / Math.max(w.length * 0.62, 1))
      return <g key={i}>
        <path d={`M40 ${y - fs * 0.6} H560`} stroke="#ccc" strokeDasharray="5 4" />
        <path d={`M40 ${y} H560`} stroke="#888" />
        <text x="300" y={y} textAnchor="middle" fontFamily="BugaTracer" fontSize={fs} fill="#555" stroke="#555" strokeWidth={fs * 0.012} direction="rtl">{w}</text>
        <path d={`M40 ${y + 42} H560`} stroke="#bbb" />
      </g>
    })}
  </Page>
}

function TreeNeeds() {
  const items = [['☀️', 'שמש'], ['🍬', 'סוכריות'], ['💧', 'מים'], ['📺', 'טלוויזיה'], ['🟫', 'אדמה'], ['🧸', 'דובי'], ['🌬️', 'אוויר'], ['👟', 'נעליים']]
  return <Page title="מה צריך עץ כדי לגדול?" sub="הקיפו רק את מה שהעץ צריך">
    {items.map(([e, n], i) => {
      const col = i % 2, row = Math.floor(i / 2), x = col ? 170 : 430, y = 200 + row * 150
      return <g key={n}>
        <rect x={x - 90} y={y - 60} width="180" height="130" rx="20" fill="white" stroke="#111" strokeWidth="2.5" />
        <text x={x} y={y + 20} textAnchor="middle" fontSize="64">{e}</text>
        <text x={x} y={y + 58} textAnchor="middle" fontFamily={FONT} fontSize="22" fontWeight="700" direction="rtl">{n}</text>
      </g>
    })}
  </Page>
}

export const TUBISHVAT_ART = [
  { id: 'tree', name: 'העץ שלי', C: Tree },
  { id: 'almond', name: 'השקדייה פורחת', C: Almond },
  { id: 'species', name: 'שבעת המינים', C: Species },
  { id: 'pomegranate', name: 'רימון', C: Pomegranate },
  { id: 'grapes', name: 'אשכול ענבים', C: Grapes },
  { id: 'greeting', name: 'ט״ו בשבט שמח', C: Greeting },
]
export const TUBISHVAT_SHEETS = [
  { id: 'count', name: 'כמה פירות על העץ?', age: 'גן', C: CountFruit },
  { id: 'match', name: 'מי אני? — שבעת המינים', age: 'גן–א׳', C: MatchSpecies },
  { id: 'trace', name: 'מילים של ט״ו בשבט', age: 'גן–א׳', C: TraceWords },
  { id: 'needs', name: 'מה צריך עץ?', age: 'גן', C: TreeNeeds },
]
