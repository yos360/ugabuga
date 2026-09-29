import { Page, At, S, TraceWordsPage, GreetingPage, CountPage, MatchPage, BigPage, FONT } from '../holidays/printKit'
import SpeciesIcon from '../tubishvat/SpeciesIcon'

// Shavuot line drawings, each in a 100×100 box (use with <At>).
const L = { ...S, strokeWidth: 3 }
const Sp = ({ id, x, y, size }) => <At x={x} y={y} size={size}><SpeciesIcon id={id} line size={100} /></At>

export const BikkurimBasket = () => <g>
  <path d="M20 50 C 20 6 80 6 80 50" fill="none" stroke="#111" strokeWidth={5} strokeLinecap="round" />
  <Sp id="wheat" x={22} y={30} size={40} />
  <Sp id="wheat" x={80} y={28} size={40} />
  <Sp id="grape" x={62} y={38} size={34} />
  <Sp id="pomegranate" x={38} y={40} size={32} />
  <path d="M8 50 H92 L82 94 H18 Z" {...L} />
  <path d="M13 64 H87 M16 80 H84 M32 50 L30 94 M50 50 V94 M68 50 L70 94" fill="none" stroke="#111" strokeWidth={2} />
  <rect x="5" y="46" width="90" height="9" rx="4" {...L} />
</g>

const ALEF_HE = ['א', 'ב', 'ג', 'ד', 'ה'], VAV_YUD = ['ו', 'ז', 'ח', 'ט', 'י']
export const Tablets = () => <g>
  <path d="M6 94 V34 A 21 21 0 0 1 48 34 V94 Z" {...L} />
  <path d="M52 94 V34 A 21 21 0 0 1 94 34 V94 Z" {...L} />
  {VAV_YUD.map((l, i) => <text key={l} x="27" y={38 + i * 12} textAnchor="middle" fontFamily={FONT} fontSize="10" fontWeight="800" fill="#111">{l}</text>)}
  {ALEF_HE.map((l, i) => <text key={l} x="73" y={38 + i * 12} textAnchor="middle" fontFamily={FONT} fontSize="10" fontWeight="800" fill="#111">{l}</text>)}
</g>

export const MilkCarton = () => <g>
  <rect x="38" y="4" width="24" height="10" rx="2" {...L} />
  <path d="M26 30 L38 14 H62 L74 30 Z" {...L} />
  <rect x="26" y="30" width="48" height="64" rx="3" {...L} />
  <path d="M50 40 C 56 48 58 52 58 56 C 58 61 54 64 50 64 C 46 64 42 61 42 56 C 42 52 44 48 50 40 Z" {...L} strokeWidth={2} />
  <text x="50" y="80" textAnchor="middle" fontFamily={FONT} fontSize="14" fontWeight="800" fill="#111">חלב</text>
</g>

export const Cheese = () => <g>
  <path d="M8 56 L66 26 L94 50 Z" {...L} />
  <path d="M8 56 H94 V88 H8 Z" {...L} />
  <path d="M94 50 V88" stroke="#111" strokeWidth={3} />
  {[[26, 70, 7], [52, 78, 5], [72, 66, 8], [42, 62, 3.5], [86, 78, 4]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} {...L} strokeWidth={2} />)}
  <ellipse cx="58" cy="44" rx="5" ry="3" {...L} strokeWidth={2} />
</g>

const Cheesecake = () => <g>
  <path d="M8 52 L60 30 L92 52 Z" {...L} />
  <path d="M8 52 H92 V80 H8 Z" {...L} />
  <path d="M8 80 H92 V92 H8 Z" {...L} />
  {[20, 34, 48, 62, 76].map(x => <circle key={x} cx={x} cy={86} r="1.8" fill="#111" />)}
  <path d="M58 38 C 50 24 62 16 66 26 C 72 16 82 26 72 36 C 68 40 62 42 58 38 Z" {...L} strokeWidth={2.5} />
  <path d="M64 24 L62 14 M64 24 L70 18" stroke="#111" strokeWidth={2} strokeLinecap="round" />
</g>

const Yogurt = () => <g>
  <path d="M24 34 H76 L68 92 H32 Z" {...L} />
  <ellipse cx="50" cy="34" rx="28" ry="8" {...L} />
  <path d="M34 52 H66 L64 70 H36 Z" {...L} strokeWidth={2} />
  <path d="M60 30 L84 6" stroke="#111" strokeWidth={5} strokeLinecap="round" />
  <path d="M60 30 L84 6" stroke="white" strokeWidth={1.5} strokeLinecap="round" />
</g>

const Apple = () => <g>
  <path d="M50 28 C 36 18 12 22 12 50 C 12 76 32 94 50 86 C 68 94 88 76 88 50 C 88 22 64 18 50 28 Z" {...L} />
  <path d="M50 28 C 50 20 52 14 56 8" fill="none" stroke="#111" strokeWidth={4} strokeLinecap="round" />
  <path d="M54 18 C 62 6 78 8 80 16 C 72 24 60 24 54 18 Z" {...L} strokeWidth={2.5} />
</g>

const Bread = () => <g>
  <path d="M10 60 C 8 36 26 26 50 26 C 74 26 92 36 90 60 C 90 74 84 82 70 82 H30 C 16 82 10 74 10 60 Z" {...L} />
  <path d="M30 40 L38 52 M46 36 L54 50 M62 38 L70 52" fill="none" stroke="#111" strokeWidth={3} strokeLinecap="round" />
</g>

const Carrot = () => <g>
  <path d="M50 34 C 46 20 36 10 26 8 C 32 18 38 26 46 34 M50 34 C 50 20 54 10 60 4 C 62 16 58 26 54 34 M52 34 C 60 22 72 16 82 16 C 76 26 66 32 56 36" {...L} strokeWidth={2.5} />
  <path d="M34 36 C 34 30 66 30 66 36 C 66 56 58 76 52 94 C 51 96 49 96 48 94 C 42 76 34 56 34 36 Z" {...L} />
  <path d="M40 50 L48 50 M56 62 L62 62 M44 74 L50 74" stroke="#111" strokeWidth={2.5} strokeLinecap="round" />
</g>

export const Tractor = () => <g>
  <path d="M8 66 H0" stroke="#111" strokeWidth={4} strokeLinecap="round" />
  <rect x="42" y="48" width="50" height="26" rx="4" {...L} />
  <rect x="70" y="26" width="7" height="24" rx="2" {...L} />
  <rect x="10" y="12" width="44" height="7" rx="3" {...L} />
  <path d="M14 19 H50 V60 H14 Z" {...L} />
  <rect x="20" y="25" width="24" height="20" rx="2" {...L} strokeWidth={2} />
  <circle cx="30" cy="72" r="22" {...L} />
  <circle cx="30" cy="72" r="9" {...L} />
  <circle cx="80" cy="82" r="13" {...L} />
  <circle cx="80" cy="82" r="5" {...L} />
</g>

export const Wagon = () => <g>
  <Sp id="wheat" x={16} y={26} size={52} />
  <Sp id="wheat" x={30} y={24} size={52} />
  <Sp id="pomegranate" x={54} y={34} size={34} />
  <Sp id="grape" x={80} y={30} size={38} />
  <rect x="4" y="50" width="92" height="24" rx="3" {...L} />
  <path d="M4 62 H96 M28 50 V74 M52 50 V74 M76 50 V74" stroke="#111" strokeWidth={2} />
  <circle cx="24" cy="80" r="12" {...L} /><circle cx="24" cy="80" r="4" {...L} />
  <circle cx="76" cy="80" r="12" {...L} /><circle cx="76" cy="80" r="4" {...L} />
  <path d="M96 66 H100" stroke="#111" strokeWidth={4} strokeLinecap="round" />
</g>

const draw = (C) => (x, y, size) => <At x={x} y={y} size={size}><C /></At>
const species = (id) => (x, y, size) => <Sp id={id} x={x} y={y} size={size} />

// ---------- colouring ----------
const BasketPage = () => <BigPage title="סל ביכורים"><At x={300} y={440} size={520}><BikkurimBasket /></At></BigPage>
const TabletsPage = () => <BigPage title="לוחות הברית"><At x={300} y={450} size={520}><Tablets /></At></BigPage>
const DairyPage = () => <BigPage title="מאכלי חלב">
  <At x={170} y={340} size={290}><MilkCarton /></At>
  <At x={420} y={380} size={270}><Cheesecake /></At>
  <At x={300} y={620} size={300}><Cheese /></At>
</BigPage>
const WheatPage = () => <BigPage title="שיבולי חיטה">
  {[-30, 0, 30].map(r => <g key={r} transform={`rotate(${r} 300 655)`}><At x={300} y={450} size={440}><SpeciesIcon id="wheat" line size={100} /></At></g>)}
  <rect x="250" y="600" width="100" height="30" rx="12" {...S} />
</BigPage>
const WagonPage = () => <BigPage title="עגלת ביכורים">
  <At x={160} y={550} size={280}><Wagon /></At>
  <At x={440} y={545} size={280}><Tractor /></At>
  <path d="M20 670 H580" stroke="#111" strokeWidth={4} strokeLinecap="round" />
  <circle cx="500" cy="200" r="46" {...S} />
  {Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4, c = Math.cos(a), s = Math.sin(a); return <path key={i} d={`M${500 + c * 60} ${200 + s * 60} L${500 + c * 80} ${200 + s * 80}`} stroke="#111" strokeWidth={5} strokeLinecap="round" /> })}
</BigPage>
const Greeting = () => <GreetingPage lines={['חג שבועות', 'שמח!']}>
  <At x={130} y={650} size={150}><Tablets /></At><At x={300} y={650} size={170}><BikkurimBasket /></At><At x={470} y={650} size={150}><Cheese /></At>
</GreetingPage>

// ---------- worksheets ----------
const CountPomegranates = () => <CountPage title="כמה רימונים?" sub="ספרו את הרימונים בכל קופסה וכתבו את המספר" render={species('pomegranate')} size={46} />
const MatchSpecies = () => <MatchPage title="משבעת המינים" items={['wheat', 'grape', 'fig', 'pomegranate', 'olive'].map(id => ({ render: species(id) }))} words={['זית', 'חיטה', 'רימון', 'ענבים', 'תאנה']} />
const TraceShavuot = () => <TraceWordsPage title="מילים של שבועות" words={['שבועות', 'ביכורים', 'גבינה', 'חלב', 'חיטה', 'תורה']} />

// Six pictures in boxes: circle everything made from milk.
function DairySheet() {
  const cells = [[Cheese, 'גבינה'], [Apple, 'תפוח'], [MilkCarton, 'חלב'], [Bread, 'לחם'], [Yogurt, 'יוגורט'], [Carrot, 'גזר']]
  return <Page title="מה עשוי מחלב?" sub="הקיפו בעיגול את כל מה שעשוי מחלב">
    {cells.map(([C, w], i) => {
      const col = i % 2, row = Math.floor(i / 2), bx = col ? 40 : 320, by = 140 + row * 215
      return <g key={w}>
        <rect x={bx} y={by} width="240" height="190" rx="18" fill="white" stroke="#111" strokeWidth="2.5" />
        <At x={bx + 120} y={by + 80} size={120}><C /></At>
        <text x={bx + 120} y={by + 172} textAnchor="middle" fontFamily={FONT} fontSize="24" fontWeight="800" direction="rtl">{w}</text>
      </g>
    })}
  </Page>
}

export const SHAVUOT_ART = [
  { id: 'basket', name: 'סל ביכורים', C: BasketPage },
  { id: 'tablets', name: 'לוחות הברית', C: TabletsPage },
  { id: 'dairy', name: 'מאכלי חלב', C: DairyPage },
  { id: 'wheat', name: 'שיבולי חיטה', C: WheatPage },
  { id: 'wagon', name: 'עגלת ביכורים', C: WagonPage },
  { id: 'greeting', name: 'חג שבועות שמח', C: Greeting },
]
export const SHAVUOT_SHEETS = [
  { id: 'count', name: 'כמה רימונים?', age: 'גן', C: CountPomegranates },
  { id: 'match', name: 'משבעת המינים — התאמה', age: 'גן–א׳', C: MatchSpecies },
  { id: 'trace', name: 'מילים של שבועות', age: 'גן–א׳', C: TraceShavuot },
  { id: 'dairy', name: 'מה עשוי מחלב?', age: 'גן–ב׳', C: DairySheet },
]
