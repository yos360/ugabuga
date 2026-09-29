import { Page, At, S, S3, TraceWordsPage, GreetingPage, CountPage, MatchPage, BigPage, FONT } from '../holidays/printKit'

// Lag BaOmer line drawings, each in a 100×100 box (use with <At>).
const L = { ...S, strokeWidth: 3 }

// A five-pointed star centred at (cx, cy).
const starPath = (cx, cy, r) => Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r
  return `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`
}).join(' ') + ' Z'

export const Bonfire = () => <g>
  <path d="M50 6 C 58 22 74 30 78 50 C 82 70 68 84 50 84 C 32 84 18 70 22 52 C 24 42 30 36 34 28 C 36 38 40 42 44 44 C 42 30 44 18 50 6 Z" {...L} />
  <path d="M52 40 C 60 50 66 58 64 68 C 62 76 56 80 50 80 C 44 80 38 76 38 70 C 38 60 46 54 52 40 Z" {...L} />
  <g transform="rotate(14 50 84)"><rect x="6" y="77" width="88" height="14" rx="7" {...L} /><circle cx="13" cy="84" r="4" {...L} strokeWidth={2} /></g>
  <g transform="rotate(-14 50 84)"><rect x="6" y="77" width="88" height="14" rx="7" {...L} /><circle cx="87" cy="84" r="4" {...L} strokeWidth={2} /></g>
  <circle cx="20" cy="18" r="3" {...L} strokeWidth={2} /><circle cx="82" cy="24" r="2.5" {...L} strokeWidth={2} /><circle cx="72" cy="8" r="2" {...L} strokeWidth={2} />
</g>

export const BowArrow = () => <g>
  <path d="M30 9 L30 91" fill="none" stroke="#111" strokeWidth={2} />
  <path d="M24 3 C 80 18 80 82 24 97 L 32 87 C 62 74 62 26 32 13 Z" {...L} />
  <rect x="58" y="42" width="8" height="16" rx="3" {...L} strokeWidth={2} />
  <path d="M22 50 H88" fill="none" stroke="#111" strokeWidth={4} strokeLinecap="round" />
  <path d="M86 42 L99 50 L86 58 Z" {...L} />
  <path d="M22 50 L12 40 H24 L32 50 Z M22 50 L12 60 H24 L32 50 Z" {...L} strokeWidth={2.5} />
</g>

export const Potato = () => <g>
  <path d="M14 52 C 12 34 30 24 50 26 C 70 22 90 32 88 50 C 90 68 72 78 50 76 C 28 78 14 70 14 52 Z" {...L} />
  {[[34, 44], [60, 40], [48, 60], [72, 58]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.5" fill="#111" />)}
</g>

// A potato wrapped in foil, for the embers picture.
const FoilPotato = () => <g>
  <path d="M10 54 C 8 34 28 22 50 24 C 72 20 92 32 90 52 C 92 72 72 82 50 80 C 26 82 10 72 10 54 Z" {...L} />
  <path d="M22 40 L30 46 L26 54 M60 30 L56 40 L66 44 M72 62 L64 66 L68 72 M36 66 L44 62" fill="none" stroke="#111" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
</g>

export const Marshmallow = () => <g>
  <path d="M8 96 L62 38" stroke="#111" strokeWidth={7} strokeLinecap="round" />
  <path d="M8 96 L62 38" stroke="white" strokeWidth={3} strokeLinecap="round" />
  <g transform="rotate(-43 74 26)">
    <rect x="60" y="12" width="28" height="28" rx="9" {...L} />
    <path d="M60 22 H88" fill="none" stroke="#111" strokeWidth={2} />
  </g>
</g>

export const Tent = () => <g>
  <path d="M6 88 L50 14 L94 88 Z" {...L} />
  <path d="M50 14 L50 6 M50 14 L28 88 M50 14 L72 88" fill="none" stroke="#111" strokeWidth={3} strokeLinecap="round" />
  <path d="M50 44 L36 88 H64 Z" {...L} />
  <path d="M4 88 H96" stroke="#111" strokeWidth={3} strokeLinecap="round" />
  <path d="M50 6 L62 10 L50 14" {...L} strokeWidth={2} />
</g>

export const Moon = () => <g>
  <path d="M60 8 A 42 42 0 1 0 60 92 A 50 50 0 0 1 60 8 Z" {...L} />
  <circle cx="28" cy="40" r="3.5" {...L} strokeWidth={2} /><circle cx="27" cy="62" r="3" {...L} strokeWidth={2} />
</g>

const Star = () => <path d={starPath(50, 52, 44)} {...L} />

const Bucket = () => <g>
  <path d="M22 38 C 22 8 78 8 78 38" fill="none" stroke="#111" strokeWidth={3} />
  <path d="M20 38 H80 L72 92 H28 Z" {...L} />
  <ellipse cx="50" cy="38" rx="30" ry="8" {...L} />
  <path d="M30 38 C 36 34 40 42 46 38 C 52 34 56 42 62 38 C 66 36 68 38 70 38" fill="none" stroke="#111" strokeWidth={2} />
  <path d="M30 56 H70" stroke="#111" strokeWidth={2} />
</g>

const Sand = () => <g>
  <path d="M6 88 C 16 58 36 46 50 46 C 64 46 84 58 94 88 Z" {...L} />
  {[[30, 76], [42, 64], [56, 72], [68, 80], [50, 82], [62, 60], [36, 84]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill="#111" />)}
  <path d="M66 14 L58 50" stroke="#111" strokeWidth={4} strokeLinecap="round" />
  <path d="M50 46 L66 50 L62 64 C 56 66 50 60 50 46 Z" {...L} />
</g>

const Adult = () => <g>
  <circle cx="50" cy="16" r="11" {...L} />
  <path d="M34 32 H66 L70 64 H30 Z" {...L} />
  <path d="M34 34 L20 58 M66 34 L80 58 M40 64 L38 94 M60 64 L62 94" fill="none" stroke="#111" strokeWidth={5} strokeLinecap="round" />
</g>

const Tire = () => <g>
  <circle cx="50" cy="50" r="42" {...L} />
  <circle cx="50" cy="50" r="20" {...L} />
  {Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, c = Math.cos(a), s = Math.sin(a); return <path key={i} d={`M${50 + c * 30} ${50 + s * 30} L${50 + c * 40} ${50 + s * 40}`} stroke="#111" strokeWidth={2.5} /> })}
  <circle cx="50" cy="50" r="6" {...L} strokeWidth={2} />
</g>

const Bottle = () => <g>
  <rect x="42" y="4" width="16" height="10" rx="2" {...L} />
  <path d="M44 14 H56 L56 22 C 66 28 70 34 70 44 V90 C 70 94 66 96 62 96 H38 C 34 96 30 94 30 90 V44 C 30 34 34 28 44 22 Z" {...L} />
  <rect x="30" y="52" width="40" height="20" {...L} strokeWidth={2} />
</g>

const FuelCan = () => <g>
  <path d="M22 26 H70 L80 36 V92 H22 Z" {...L} />
  <path d="M30 26 V12 H56 V26" {...L} />
  <path d="M36 26 V18 H50 V26" {...L} strokeWidth={2} />
  <path d="M70 26 L80 10 L88 14 L80 36" {...L} />
  <path d="M51 44 C 58 54 62 60 60 68 C 58 74 54 76 51 76 C 48 76 42 74 42 68 C 40 60 48 56 51 44 Z" {...L} strokeWidth={2.5} />
</g>

const draw = (C) => (x, y, size) => <At x={x} y={y} size={size}><C /></At>

// ---------- colouring ----------
const BonfirePage = () => <BigPage title="מדורה">
  <At x={300} y={440} size={520}><Bonfire /></At>
  <path d="M40 720 H560" stroke="#111" strokeWidth={4} strokeLinecap="round" />
  {[[70, 170], [530, 190], [90, 330]].map(([x, y], i) => <path key={i} d={starPath(x, y, 26)} {...S3} />)}
</BigPage>
const BowPage = () => <BigPage title="קשת וחץ"><At x={300} y={450} size={560}><BowArrow /></At></BigPage>
const coal = (x, y, w, k) => { const h = w * 0.3; return <g key={k}>
  <path d={`M${x - w / 2} ${y + h * 0.3} L${x - w / 2 + w * 0.12} ${y - h * 0.7} L${x + w * 0.06} ${y - h} L${x + w / 2} ${y - h * 0.4} L${x + w / 2 - w * 0.06} ${y + h * 0.7} L${x - w * 0.1} ${y + h} Z`} {...S3} />
  <path d={`M${x - w * 0.15} ${y - h * 0.2} L${x} ${y + h * 0.2} L${x + w * 0.15} ${y - h * 0.1}`} fill="none" stroke="#111" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
</g> }
const PotatoesPage = () => <BigPage title="תפוחי אדמה בגחלים">
  {[[100, 560, 130], [225, 548, 140], [365, 552, 140], [495, 562, 130]].map(([x, y, w], i) => coal(x, y, w, 'b' + i))}
  <At x={200} y={470} size={270}><FoilPotato /></At><At x={410} y={480} size={250}><FoilPotato /></At>
  {[[80, 640, 120], [195, 652, 130], [310, 646, 120], [425, 654, 130], [530, 640, 110], [135, 722, 130], [260, 728, 130], [385, 726, 130], [500, 716, 120]].map(([x, y, w], i) => coal(x, y, w, 'f' + i))}
  {[[180, 290], [230, 270], [400, 310], [450, 290]].map(([x, y], i) => <path key={i} d={`M${x} ${y + 40} C ${x - 14} ${y + 20} ${x + 14} ${y + 10} ${x} ${y - 10}`} fill="none" stroke="#111" strokeWidth={4} strokeLinecap="round" />)}
</BigPage>
const MarshmallowPage = () => <BigPage title="מרשמלו על מקל">
  <At x={330} y={380} size={440}><Marshmallow /></At>
  <At x={150} y={640} size={220}><Bonfire /></At>
</BigPage>
const TentPage = () => <BigPage title="לילה באוהל">
  <At x={300} y={560} size={400}><Tent /></At>
  <At x={470} y={210} size={170}><Moon /></At>
  {[[110, 190, 34], [240, 160, 24], [340, 260, 28], [90, 360, 22], [530, 400, 22], [200, 300, 20]].map(([x, y, r], i) => <path key={i} d={starPath(x, y, r)} {...S3} />)}
</BigPage>
const Greeting = () => <GreetingPage lines={['ל״ג בעומר', 'שמח!']}>
  <At x={130} y={650} size={150}><BowArrow /></At><At x={300} y={650} size={170}><Bonfire /></At><At x={470} y={650} size={150}><Tent /></At>
</GreetingPage>

// ---------- worksheets ----------
const CountPotatoes = () => <CountPage title="כמה תפוחי אדמה?" sub="ספרו את תפוחי האדמה בכל קופסה וכתבו את המספר" render={draw(Potato)} size={44} />
const MatchLag = () => <MatchPage title="מה זה?" items={[Bonfire, BowArrow, Potato, Tent, Moon].map(C => ({ render: draw(C) }))} words={['אוהל', 'קשת וחץ', 'ירח', 'מדורה', 'תפוח אדמה']} />
const TraceLag = () => <TraceWordsPage title="מילים של ל״ג בעומר" words={['מדורה', 'קשת', 'חץ', 'עומר', 'גחלים', 'שמיים']} />

// Six pictures in boxes: circle what keeps us safe, cross out what is dangerous.
function SafetySheet() {
  const cells = [[Bucket, 'דלי מים'], [Tire, 'צמיג'], [Adult, 'מבוגר'], [FuelCan, 'דלק'], [Sand, 'חול'], [Bottle, 'בקבוק פלסטיק']]
  return <Page title="בטיחות במדורה" sub="הקיפו מה ששומר עלינו ליד המדורה, וסמנו X על מה שמסוכן">
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

export const LAGBAOMER_ART = [
  { id: 'bonfire', name: 'מדורה', C: BonfirePage },
  { id: 'bow', name: 'קשת וחץ', C: BowPage },
  { id: 'potatoes', name: 'תפוחי אדמה בגחלים', C: PotatoesPage },
  { id: 'marshmallow', name: 'מרשמלו על מקל', C: MarshmallowPage },
  { id: 'tent', name: 'לילה באוהל', C: TentPage },
  { id: 'greeting', name: 'ל״ג בעומר שמח', C: Greeting },
]
export const LAGBAOMER_SHEETS = [
  { id: 'count', name: 'כמה תפוחי אדמה?', age: 'גן', C: CountPotatoes },
  { id: 'match', name: 'מה זה? — התאמה', age: 'גן–א׳', C: MatchLag },
  { id: 'trace', name: 'מילים של ל״ג בעומר', age: 'גן–א׳', C: TraceLag },
  { id: 'safety', name: 'בטיחות במדורה', age: 'גן–ב׳', C: SafetySheet },
]
