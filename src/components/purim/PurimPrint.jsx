import { Page, At, S, S3, TraceWordsPage, GreetingPage, CountPage, MatchPage, BigPage, FONT } from '../holidays/printKit'

// Purim line drawings, each in a 100×100 box (use with <At>).
const L = { ...S, strokeWidth: 3 }

export const Mask = () => <g>
  <path d="M8 40 C 8 22 30 20 50 30 C 70 20 92 22 92 40 C 92 62 74 70 62 60 C 56 55 44 55 38 60 C 26 70 8 62 8 40 Z" {...L} />
  <ellipse cx="30" cy="42" rx="10" ry="7" {...L} />
  <ellipse cx="70" cy="42" rx="10" ry="7" {...L} />
  <path d="M92 38 C 98 26 96 12 88 6 M8 38 C 2 26 4 12 12 6" fill="none" {...L} />
  <path d="M50 72 L50 96" {...L} strokeWidth={4} />
  {[[40, 24], [60, 24], [50, 18]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#111" />)}
</g>

export const Raashan = () => <g>
  <rect x="44" y="56" width="12" height="40" rx="5" {...L} />
  <circle cx="50" cy="40" r="17" {...L} />
  {[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = Math.PI * a / 180; return <rect key={a} x={50 + Math.cos(r) * 20 - 4} y={40 + Math.sin(r) * 20 - 4} width="8" height="8" transform={`rotate(${a} ${50 + Math.cos(r) * 20} ${40 + Math.sin(r) * 20})`} {...L} strokeWidth={2} /> })}
  <circle cx="50" cy="40" r="5" {...L} />
  <path d="M60 30 L90 12 L96 24 L66 40" {...L} />
  {[[14, 30], [8, 46], [14, 62]].map(([x, y], i) => <path key={i} d={`M${x + 10} ${y} l-12 -3`} {...L} />)}
</g>

export const Hamantasch = () => <g>
  <path d="M50 10 C 56 10 94 76 90 82 C 86 88 14 88 10 82 C 6 76 44 10 50 10 Z" {...L} />
  <path d="M50 36 L68 68 H32 Z" {...L} />
  {[[46, 56], [54, 58], [50, 50], [44, 62], [56, 63]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" fill="#111" />)}
</g>

export const Crown = () => <g>
  <path d="M10 80 L14 30 L32 52 L50 20 L68 52 L86 30 L90 80 Z" {...L} />
  <rect x="10" y="78" width="80" height="12" rx="3" {...L} />
  {[14, 50, 86].map((x, i) => <circle key={i} cx={x} cy={[28, 18, 28][i]} r="5" {...L} />)}
  <circle cx="50" cy="62" r="7" {...L} /><circle cx="28" cy="66" r="4" {...L} /><circle cx="72" cy="66" r="4" {...L} />
</g>

export const Megillah = () => <g>
  <rect x="12" y="10" width="14" height="80" rx="6" {...L} />
  <rect x="74" y="10" width="14" height="80" rx="6" {...L} />
  <rect x="26" y="20" width="48" height="60" {...L} />
  {[32, 42, 52, 62, 72].map(y => <path key={y} d={`M32 ${y} H68`} {...L} strokeWidth={2} />)}
  <circle cx="19" cy="6" r="5" {...L} /><circle cx="19" cy="94" r="5" {...L} /><circle cx="81" cy="6" r="5" {...L} /><circle cx="81" cy="94" r="5" {...L} />
</g>

export const Basket = () => <g>
  <path d="M22 44 C 22 10 78 10 78 44" fill="none" {...L} strokeWidth={5} />
  <path d="M8 44 H92 L82 92 H18 Z" {...L} />
  <path d="M14 58 H86 M16 74 H84 M34 44 L32 92 M50 44 V92 M66 44 L68 92" {...L} strokeWidth={2} />
  <circle cx="34" cy="36" r="9" {...L} /><path d="M50 22 L60 42 H40 Z" {...L} /><rect x="60" y="28" width="16" height="16" rx="3" {...L} />
</g>

const draw = (C) => (x, y, size) => <At x={x} y={y} size={size}><C /></At>

// ---------- colouring ----------
const MaskPage = () => <BigPage title="מסכה"><At x={300} y={400} size={500}><Mask /></At>
  {[[90, 690], [510, 690], [300, 740], [140, 160], [470, 150]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 16} L${x + 5} ${y - 5} L${x + 16} ${y} L${x + 5} ${y + 5} L${x} ${y + 16} L${x - 5} ${y + 5} L${x - 16} ${y} L${x - 5} ${y - 5} Z`} {...S3} />)}
</BigPage>
const RaashanPage = () => <BigPage title="רעשן"><At x={300} y={440} size={520}><Raashan /></At></BigPage>
const HamantaschenPage = () => <BigPage title="אוזני המן">
  <ellipse cx="300" cy="560" rx="250" ry="70" {...S} />
  <At x={190} y={470} size={200}><Hamantasch /></At><At x={410} y={470} size={200}><Hamantasch /></At><At x={300} y={330} size={220}><Hamantasch /></At>
</BigPage>
const CrownPage = () => <BigPage title="הכתר של אסתר המלכה"><At x={300} y={420} size={480}><Crown /></At></BigPage>
const BasketPage = () => <BigPage title="משלוח מנות"><At x={300} y={440} size={500}><Basket /></At>
  <text x="300" y="760" textAnchor="middle" fontFamily={FONT} fontSize="30" fontWeight="700" direction="rtl">מאת: ____________   אל: ____________</text>
</BigPage>
const Greeting = () => <GreetingPage lines={['פורים', 'שמח!']}>
  <At x={130} y={640} size={150}><Mask /></At><At x={300} y={660} size={150}><Raashan /></At><At x={470} y={640} size={150}><Hamantasch /></At>
</GreetingPage>

// ---------- worksheets ----------
const CountHamantaschen = () => <CountPage title="כמה אוזני המן?" sub="ספרו את אוזני המן בכל קופסה וכתבו את המספר" render={draw(Hamantasch)} size={42} />
const MatchPurim = () => <MatchPage title="מה זה?" items={[Mask, Raashan, Crown, Megillah, Hamantasch].map(C => ({ render: draw(C) }))} words={['מגילה', 'אוזן המן', 'מסכה', 'כתר', 'רעשן']} />
const TracePurim = () => <TraceWordsPage title="מילים של פורים" words={['פורים', 'רעשן', 'מגילה', 'מסכה', 'אסתר', 'מרדכי']} />
function MyCostume() {
  return <Page title="התחפושת שלי" sub="ציירו על הילד או הילדה את התחפושת שלכם">
    <circle cx="300" cy="220" r="60" {...S3} />
    <path d="M230 300 H370 L390 520 H210 Z" {...S3} />
    <path d="M230 310 L160 440 M370 310 L440 440" {...S3} strokeWidth={10} fill="none" />
    <path d="M250 520 L240 700 M350 520 L360 700" {...S3} strokeWidth={12} fill="none" />
    <text x="300" y="770" textAnchor="middle" fontFamily={FONT} fontSize="24" fontWeight="700" direction="rtl">בפורים אני מתחפש/ת ל: __________________</text>
  </Page>
}

export const PURIM_ART = [
  { id: 'mask', name: 'מסכה', C: MaskPage },
  { id: 'raashan', name: 'רעשן', C: RaashanPage },
  { id: 'hamantaschen', name: 'אוזני המן', C: HamantaschenPage },
  { id: 'crown', name: 'הכתר של אסתר', C: CrownPage },
  { id: 'basket', name: 'משלוח מנות', C: BasketPage },
  { id: 'greeting', name: 'פורים שמח', C: Greeting },
]
export const PURIM_SHEETS = [
  { id: 'count', name: 'כמה אוזני המן?', age: 'גן', C: CountHamantaschen },
  { id: 'match', name: 'מה זה? — התאמה', age: 'גן–א׳', C: MatchPurim },
  { id: 'trace', name: 'מילים של פורים', age: 'גן–א׳', C: TracePurim },
  { id: 'costume', name: 'התחפושת שלי', age: 'גן–ב׳', C: MyCostume },
]
