import { Page, At, S, S3, TraceWordsPage, GreetingPage, CountPage, MatchPage, BigPage, FONT } from '../holidays/printKit'

// Sukkot + Simchat Torah line drawings, each in a 100×100 box (use with <At>).
const L = { ...S, strokeWidth: 3 }
const L2 = { ...S, strokeWidth: 2 }

// Etrog: a bumpy citron with a small tip (pitam) on top and a stem with a leaf below.
export const Etrog = () => <g>
  <path d="M50 11 C 55 11 57 17 60 21 C 75 28 81 48 79 66 C 77 84 64 94 50 94 C 36 94 23 84 21 66 C 19 48 25 28 40 21 C 43 17 45 11 50 11 Z" {...L} />
  <path d="M47.5 12 L47.5 6 Q 50 3 52.5 6 L52.5 12" {...L} strokeWidth={2.5} />
  <path d="M50 94 V98" {...L} />
  <path d="M51 96 C 60 91 70 93 74 99 C 66 101 58 100 51 96 Z" {...L2} />
  {[[38, 38], [50, 30], [62, 38], [32, 54], [44, 48], [56, 50], [68, 56], [36, 70], [50, 64], [64, 72], [44, 82], [58, 84], [28, 64]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill="#111" />)}
  <path d="M30 44 C 27 52 27 60 29 68" fill="none" {...L2} />
</g>

// Lulav frond alone: a long, closed palm frond on its spine.
export const LulavFrond = () => <g>
  <path d="M48 76 L48 98 L52 98 L52 76" {...L} />
  <path d="M42 78 C 41 50 45 22 50 2 C 55 22 59 50 58 78 Z" {...L} />
  <path d="M50 8 V76 M46 26 C 45 42 45 60 46 76 M54 26 C 55 42 55 60 54 76" fill="none" {...L2} />
  <path d="M43 40 L39 32 M42 56 L38 48 M42 70 L38 62 M57 40 L61 32 M58 56 L62 48 M58 70 L62 62" fill="none" {...L2} />
</g>

// Hadas (myrtle): a branch with small oval leaves in groups of three.
export const Hadas = () => <g>
  <path d="M50 98 C 50 70 51 40 50 8" fill="none" {...L} />
  {[16, 30, 44, 58, 72, 86].map(y => <g key={y}>
    {[-55, 0, 55].map(a => <path key={a} d={`M50 ${y} Q 45 ${y - 6} 50 ${y - 13} Q 55 ${y - 6} 50 ${y} Z`} transform={`rotate(${a} 50 ${y})`} {...L2} />)}
  </g>)}
</g>

// Aravah (willow): a branch with long, narrow, pointed leaves.
const willowLeaf = (y, s) => `M50 ${y} Q ${50 + s * 16} ${y - 2} ${50 + s * 18} ${y - 22} Q ${50 + s * 6} ${y - 14} 50 ${y} Z`
export const Aravah = () => <g>
  <path d="M50 98 C 49 70 50 40 50 6" fill="none" {...L} />
  {[30, 44, 58, 72, 86].map((y, i) => <path key={y} d={willowLeaf(y, i % 2 ? 1 : -1)} {...L2} />)}
  {[22, 37, 51, 65, 79].map((y, i) => <path key={y} d={willowLeaf(y, i % 2 ? -1 : 1)} {...L2} />)}
  <path d="M50 22 Q 44 12 50 2 Q 56 12 50 22 Z" {...L2} />
</g>

// The full lulav bundle: frond in the middle, willows on one side, myrtles on the other, and the woven holder.
export const Lulav = () => <g>
  <At x={50} y={50} size={100}><LulavFrond /></At>
  <At x={33} y={60} size={62}><Aravah /></At>
  <At x={67} y={60} size={62}><Hadas /></At>
  <path d="M38 72 H62 L60 90 H40 Z" {...L} />
  <path d="M39 78 H61 M40 84 H60 M45 72 L44 90 M50 72 V90 M55 72 L56 90" fill="none" {...L2} />
</g>

export const Pomegranate = () => <g>
  <circle cx="50" cy="58" r="34" {...L} />
  <path d="M38 28 L36 12 L44 20 L50 8 L56 20 L64 12 L62 28 Z" {...L} />
  <path d="M30 50 C 32 40 38 34 46 32" fill="none" {...L2} />
</g>

export const Grapes = () => <g>
  <path d="M50 4 C 50 10 48 14 46 18" fill="none" {...L} />
  <path d="M52 12 C 62 4 78 6 84 14 C 74 20 60 20 52 12 Z" {...L2} />
  {[[36, 26], [50, 24], [64, 26], [30, 42], [44, 40], [58, 40], [72, 42], [37, 56], [51, 56], [65, 56], [44, 71], [58, 71], [51, 85]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="8" {...L2} strokeWidth={2.5} />)}
</g>

const Star = () => <path d="M50 8 L61 36 L92 38 L68 58 L76 90 L50 72 L24 90 L32 58 L8 38 L39 36 Z" {...L} />

// A paper chain on a sagging curve, with fruit and a star hanging from it.
const chainPt = (t) => { const x = (1 - t) ** 2 * 4 + 2 * (1 - t) * t * 50 + t * t * 96, y = (1 - t) ** 2 * 12 + 2 * (1 - t) * t * 44 + t * t * 12; return [x, y] }
export const Garland = () => {
  const n = 15
  return <g>
    {[[0.2, 24, 62, 28, Pomegranate], [0.5, 50, 72, 30, Grapes], [0.8, 76, 62, 26, Star]].map(([t, x, y, size, C], i) => { const [cx, cy] = chainPt(t); return <g key={i}>
      <path d={`M${cx} ${cy} L${x} ${y - size / 2 + 2}`} {...L2} fill="none" />
      <At x={x} y={y} size={size}><C /></At>
    </g> })}
    {Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n, [x, y] = chainPt(t), [x2, y2] = chainPt(t + 0.01)
      const a = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI
      return <ellipse key={i} cx={x} cy={y} rx="4" ry={i % 2 ? 1.6 : 3} transform={`rotate(${a} ${x} ${y})`} {...L2} strokeWidth={1.8} />
    })}
  </g>
}

// Sukkah: board walls, a leafy schach roof and an open entrance with a curtain; optionally decorated.
export const Sukkah = ({ decorated = true }) => <g>
  <rect x="10" y="36" width="80" height="58" {...L} />
  {[22, 34, 66, 78].map(x => <path key={x} d={`M${x} 38 V94`} {...L2} strokeWidth={1.5} />)}
  <rect x="42" y="52" width="16" height="42" {...L} />
  <path d="M42 52 C 48 60 47 72 42 80 Z" {...L2} />
  <path d="M4 40 V32 Q 9 22 14 30 Q 19 20 25 29 Q 30 20 36 29 Q 41 19 47 28 Q 52 19 58 28 Q 63 20 69 29 Q 74 20 80 29 Q 85 21 90 30 Q 95 24 96 32 V40 Z" {...L} />
  {[14, 30, 46, 62, 78].map(x => <path key={x} d={`M${x} 37 Q ${x + 5} 33 ${x + 10} 36`} fill="none" {...L2} strokeWidth={1.5} />)}
  {[[12, 26, -30], [40, 22, 15], [66, 22, -15], [90, 26, 30]].map(([x, y, a], i) => <path key={i} d={`M${x} ${y + 4} Q ${x - 4} ${y - 3} ${x} ${y - 9} Q ${x + 4} ${y - 3} ${x} ${y + 4} Z`} transform={`rotate(${a} ${x} ${y})`} {...L2} />)}
  {decorated && <g>
    {Array.from({ length: 9 }, (_, i) => { const t = (i + 0.5) / 9, x = 14 + t * 72, y = 42 + Math.sin(Math.PI * t) * 7; return <ellipse key={i} cx={x} cy={y} rx="3.4" ry={i % 2 ? 1.4 : 2.4} {...L2} strokeWidth={1.5} /> })}
    <path d="M22 40 V54 M78 40 V54 M34 44 V60" {...L2} strokeWidth={1.5} fill="none" />
    <circle cx="22" cy="58" r="4.5" {...L2} /><path d="M20 53 L21 50 L22 53 L23 50 L24 53" fill="none" {...L2} strokeWidth={1.2} />
    <At x={78} y={60} size={13}><Star /></At>
    <At x={34} y={65} size={11}><Grapes /></At>
    <rect x="62" y="66" width="18" height="12" {...L2} /><path d="M66 70 H76 M66 74 H74" {...L2} strokeWidth={1.2} />
  </g>}
</g>

// Torah scroll: two rollers with handles and the open parchment between them.
export const Torah = () => <g>
  {[27, 73].map(x => <g key={x}>
    <rect x={x - 3} y="2" width="6" height="12" rx="2" {...L2} />
    <rect x={x - 3} y="86" width="6" height="12" rx="2" {...L2} />
    <ellipse cx={x} cy="14" rx="11" ry="3" {...L2} />
    <ellipse cx={x} cy="86" rx="11" ry="3" {...L2} />
  </g>)}
  <rect x="36" y="18" width="28" height="64" {...L} />
  {[28, 36, 44, 52, 60, 68].map(y => <path key={y} d={`M41 ${y} H59`} {...L2} strokeWidth={1.5} />)}
  <rect x="16" y="14" width="22" height="72" rx="9" {...L} />
  <rect x="62" y="14" width="22" height="72" rx="9" {...L} />
</g>

// Simchat Torah flag on a stick, with a Star of David.
export const Flag = () => <g>
  <path d="M20 96 L20 10" {...L} strokeWidth={4} />
  <circle cx="20" cy="8" r="5" {...L} />
  <rect x="22" y="14" width="68" height="48" rx="3" {...L} />
  <path d="M56 20 L71 46 H41 Z M56 56 L71 30 H41 Z" {...L2} strokeWidth={2.5} />
</g>

const draw = (C) => (x, y, size) => <At x={x} y={y} size={size}><C /></At>

// ---------- colouring ----------
const SukkahPage = () => <BigPage title="סוכה עם קישוטים"><At x={300} y={450} size={560}><Sukkah /></At>
  <path d="M30 720 H570" {...S} />
</BigPage>
const EtrogPage = () => <BigPage title="אתרוג"><At x={300} y={450} size={560}><Etrog /></At></BigPage>
const LulavPage = () => <BigPage title="לולב, הדסים וערבות"><At x={300} y={460} size={630}><Lulav /></At></BigPage>
const GarlandPage = () => <BigPage title="שרשרת קישוטים לסוכה"><At x={300} y={440} size={560}><Garland /></At></BigPage>
const TorahPage = () => <BigPage title="שמחת תורה">
  <At x={220} y={450} size={440}><Torah /></At>
  <At x={470} y={470} size={280}><Flag /></At>
  <path d="M40 740 H560" {...S} />
</BigPage>
const Greeting = () => <GreetingPage lines={['חג סוכות', 'שמח!']}>
  <At x={130} y={650} size={170}><Sukkah /></At><At x={300} y={655} size={170}><Lulav /></At><At x={470} y={650} size={140}><Etrog /></At>
</GreetingPage>

// ---------- worksheets ----------
const CountEtrogim = () => <CountPage title="כמה אתרוגים?" sub="ספרו את האתרוגים בכל קופסה וכתבו את המספר" render={draw(Etrog)} size={42} />
const MatchSpecies = () => <MatchPage title="ארבעת המינים" items={[Etrog, LulavFrond, Hadas, Aravah].map((C, i) => ({ render: (x, y) => <At x={x + 12} y={y} size={i ? 118 : 104}><C /></At> }))} words={['הדס', 'ערבה', 'לולב', 'אתרוג']} />
const TraceSukkot = () => <TraceWordsPage title="מילים של סוכות" words={['סוכה', 'לולב', 'אתרוג', 'הדס', 'ערבה', 'סכך']} />
function DecorateSukkah() {
  return <Page title="קשטו את הסוכה" sub="ציירו בסוכה שרשראות, פירות וקישוטים">
    <At x={300} y={430} size={540}><Sukkah decorated={false} /></At>
    <text x="300" y="770" textAnchor="middle" fontFamily={FONT} fontSize="24" fontWeight="700" direction="rtl">בסוכה שלי יש: ______________________</text>
  </Page>
}

export const SUKKOT_ART = [
  { id: 'sukkah', name: 'סוכה עם קישוטים', C: SukkahPage },
  { id: 'etrog', name: 'אתרוג', C: EtrogPage },
  { id: 'lulav', name: 'לולב, הדסים וערבות', C: LulavPage },
  { id: 'garland', name: 'שרשרת קישוטים', C: GarlandPage },
  { id: 'torah', name: 'ספר תורה ודגל', C: TorahPage },
  { id: 'greeting', name: 'חג סוכות שמח', C: Greeting },
]
export const SUKKOT_SHEETS = [
  { id: 'count', name: 'כמה אתרוגים?', age: 'גן', C: CountEtrogim },
  { id: 'match', name: 'ארבעת המינים — התאמה', age: 'גן–א׳', C: MatchSpecies },
  { id: 'trace', name: 'מילים של סוכות', age: 'גן–א׳', C: TraceSukkot },
  { id: 'decorate', name: 'קשטו את הסוכה', age: 'גן–ב׳', C: DecorateSukkah },
]
