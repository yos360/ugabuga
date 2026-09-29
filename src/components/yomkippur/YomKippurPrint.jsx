import { Page, At, S, S3, TraceWordsPage, GreetingPage, MatchPage, BigPage, FONT } from '../holidays/printKit'
import { Shofar } from '../roshhashana/RoshHashanaPrint'

// Yom Kippur line drawings, each in a 100×100 box (use with <At>). Calm, simple shapes.
const L = { ...S, strokeWidth: 3 }

export const Dove = () => <g>
  <path d="M92 50 C 96 58 95 66 90 74" fill="none" {...L} strokeWidth={2.5} />
  {[[95, 58, -35], [88, 64, 55], [93, 70, -20], [86, 76, 60]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx="2.6" ry="7" transform={`rotate(${r} ${x} ${y})`} {...L} strokeWidth={2} />)}
  <path d="M26 60 L 6 52 C 2 58 2 70 6 78 L 26 72 Z" {...L} />
  <path d="M6 60 L 22 64 M6 70 L 22 68" fill="none" {...L} strokeWidth={2} />
  <path d="M22 60 C 30 50 46 46 60 50 C 64 40 74 34 84 38 C 90 40 92 44 91 48 C 90 64 74 78 54 78 C 40 80 28 76 22 70 C 18 66 18 62 22 60 Z" {...L} />
  <path d="M30 58 C 30 40 44 24 66 20 L 62 30 L 70 30 L 64 38 L 70 40 L 62 46 C 56 56 44 62 30 58 Z" {...L} />
  <path d="M40 52 C 46 44 52 36 58 28" fill="none" {...L} strokeWidth={2} />
  <path d="M91 44 L99 47 L91 50 Z" {...L} strokeWidth={2.5} />
  <circle cx="82" cy="44" r="2.5" fill="#111" />
</g>

export const Bike = () => <g>
  <circle cx="22" cy="68" r="18" {...L} /><circle cx="78" cy="68" r="18" {...L} />
  <circle cx="22" cy="68" r="3" fill="#111" /><circle cx="78" cy="68" r="3" fill="#111" />
  <path d="M22 68 L48 68 L40 38 Z M40 38 L68 38 L48 68 M68 38 L78 68 M68 38 L65 26" fill="none" stroke="#111" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
  <path d="M58 26 H72" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" />
  <path d="M32 34 C 34 30 46 30 48 34 Z" {...L} />
  <circle cx="48" cy="68" r="5" {...L} strokeWidth={2.5} />
</g>

export const Helmet = () => <g>
  <path d="M10 66 C 10 34 32 18 54 18 C 78 18 92 36 92 60 L 92 66 Z" {...L} />
  <path d="M86 50 L98 54 L92 62" {...L} />
  <path d="M34 26 C 30 36 28 50 30 64 M54 20 V64 M72 24 C 76 36 78 50 76 64" fill="none" {...L} strokeWidth={2.5} />
  <path d="M20 66 C 22 78 30 84 40 86" fill="none" {...L} strokeWidth={2.5} />
</g>

export const Heart = () => <path d="M50 90 C 20 68 6 50 10 30 C 14 12 38 8 50 28 C 62 8 86 12 90 30 C 94 50 80 68 50 90 Z" {...L} />

export const BigFish = () => <g>
  <path d="M6 50 C 18 20 58 16 78 36 L 96 20 L 92 50 L 96 80 L 78 64 C 58 84 18 80 6 50 Z" {...L} />
  <path d="M44 34 C 52 24 60 22 66 28 C 60 32 52 34 44 34 Z" {...L} strokeWidth={2.5} />
  <path d="M42 64 C 46 76 54 80 60 72 Z" {...L} strokeWidth={2.5} />
  <circle cx="22" cy="44" r="5" {...L} /><circle cx="23" cy="44" r="2" fill="#111" />
  <path d="M8 55 C 14 60 20 60 26 57" fill="none" {...L} strokeWidth={2.5} />
  {[[50, 48], [62, 44], [62, 56], [74, 50]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 6} C ${x + 6} ${y - 3} ${x + 6} ${y + 3} ${x} ${y + 6}`} fill="none" {...L} strokeWidth={2} />)}
</g>

const draw = (C) => (x, y, size) => <At x={x} y={y} size={size}><C /></At>
const star = (x, y, r = 14) => `M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z`
const cloud = (x, y, w = 120) => { const k = w / 120; return <path d={`M${x - 50 * k} ${y + 20 * k} C ${x - 70 * k} ${y + 20 * k} ${x - 70 * k} ${y - 10 * k} ${x - 44 * k} ${y - 8 * k} C ${x - 40 * k} ${y - 30 * k} ${x - 6 * k} ${y - 34 * k} ${x + 4 * k} ${y - 14 * k} C ${x + 20 * k} ${y - 30 * k} ${x + 52 * k} ${y - 18 * k} ${x + 46 * k} ${y} C ${x + 70 * k} ${y} ${x + 70 * k} ${y + 20 * k} ${x + 50 * k} ${y + 20 * k} Z`} {...S3} /> }
const txt = (x, y, s, size = 24) => <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight="700" fill="#111" direction="rtl">{s}</text>

// ---------- colouring ----------
const DovePage = () => <BigPage title="יונה עם עלה זית">
  {cloud(130, 200, 150)}{cloud(470, 690, 170)}
  <At x={300} y={440} size={500}><Dove /></At>
</BigPage>
const BikePage = () => <BigPage title="אופניים — עם קסדה!">
  <At x={300} y={420} size={500}><Bike /></At>
  <At x={460} y={215} size={180}><Helmet /></At>
  <path d="M40 700 H560" {...S3} />
  {[70, 190, 310, 430].map(x => <rect key={x} x={x} y="728" width="90" height="16" rx="6" {...S3} />)}
</BigPage>
const ShofarStarsPage = () => <BigPage title="שופר בסוף הצום">
  <At x={300} y={460} size={480}><Shofar /></At>
  <path d="M480 150 C 440 160 430 220 470 240 C 450 250 400 230 400 190 C 400 150 450 130 480 150 Z" {...S3} />
  {[[110, 180, 18], [230, 150, 12], [90, 700, 16], [300, 740, 12], [510, 700, 18], [150, 300, 10]].map(([x, y, r], i) => <path key={i} d={star(x, y, r)} {...S3} />)}
</BigPage>
const HeartPage = () => <BigPage title="לב של סליחה">
  <At x={300} y={440} size={500}><Heart /></At>
  <text x="300" y="440" textAnchor="middle" fontFamily={FONT} fontSize="92" fontWeight="900" fill="white" stroke="#111" strokeWidth="5" direction="rtl">סליחה</text>
  {[[100, 200], [500, 200], [100, 720], [500, 720]].map(([x, y], i) => <At key={i} x={x} y={y} size={70}><Heart /></At>)}
</BigPage>
const FishPage = () => <BigPage title="יונה הנביא והדג הגדול">
  <At x={300} y={400} size={480}><BigFish /></At>
  {[[90, 230, 14], [120, 180, 9], [80, 140, 6]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} {...S3} />)}
  <path d="M30 680 C 70 650 110 710 150 680 C 190 650 230 710 270 680 C 310 650 350 710 390 680 C 430 650 470 710 510 680 C 540 660 560 680 570 690" fill="none" {...S3} strokeWidth={4} />
  <path d="M30 740 C 70 710 110 770 150 740 C 190 710 230 770 270 740 C 310 710 350 770 390 740 C 430 710 470 770 510 740 C 540 720 560 740 570 750" fill="none" {...S3} strokeWidth={4} />
</BigPage>
const Greeting = () => <GreetingPage lines={['גמר חתימה', 'טובה']}>
  <At x={130} y={650} size={150}><Dove /></At><At x={300} y={660} size={130}><Heart /></At><At x={470} y={650} size={150}><Shofar /></At>
</GreetingPage>

// ---------- worksheets ----------
const MatchYK = () => <MatchPage title="מה זה?" items={[Dove, Bike, Shofar, BigFish, Heart].map(C => ({ render: draw(C) }))} words={['שופר', 'לב', 'יונה', 'אופניים', 'דג']} />
const TraceYK = () => <TraceWordsPage title="מילים של יום כיפור" words={['סליחה', 'יונה', 'שופר', 'תשרי', 'אופניים', 'צום']} />
function SorryThanks() {
  return <Page title="סליחה ותודה" sub="ציירו מישהו שתרצו להגיד לו סליחה או תודה">
    <rect x="60" y="135" width="480" height="430" rx="20" {...S3} />
    {txt(300, 625, 'ציירתי את: ____________________', 24)}
    {txt(300, 690, 'אני רוצה להגיד לו/לה:  סליחה  /  תודה', 24)}
    {txt(300, 755, 'כי: _____________________________', 24)}
  </Page>
}
const FACES = [
  { w: 'שמח/ה', m: 'M-18 10 C -10 22 10 22 18 10' },
  { w: 'עצוב/ה', m: 'M-16 18 C -8 8 8 8 16 18' },
  { w: 'כועס/ת', m: 'M-14 16 H14', brows: 'M-26 -20 L-8 -12 M26 -20 L8 -12' },
  { w: 'מופתע/ת', o: true, brows: 'M-24 -24 C -18 -30 -10 -30 -6 -24 M6 -24 C 10 -30 18 -30 24 -24' },
  { w: 'רגוע/ה', m: 'M-12 12 C -6 18 6 18 12 12', calm: true },
  { w: 'מתבייש/ת', m: 'M-10 14 C -4 18 4 18 10 14', shy: true },
]
function Face({ x, y, f }) {
  return <g transform={`translate(${x} ${y})`}>
    <circle r="52" {...S3} />
    {f.calm
      ? <path d="M-24 -8 C -20 -2 -12 -2 -8 -8 M8 -8 C 12 -2 20 -2 24 -8" fill="none" stroke="#111" strokeWidth="3.5" strokeLinecap="round" />
      : <><circle cx="-16" cy={f.shy ? -2 : -8} r="5" fill="#111" /><circle cx="16" cy={f.shy ? -2 : -8} r="5" fill="#111" /></>}
    {f.brows && <path d={f.brows} fill="none" stroke="#111" strokeWidth="3.5" strokeLinecap="round" />}
    {f.o ? <ellipse cx="0" cy="16" rx="8" ry="11" {...S3} /> : <path d={f.m} fill="none" stroke="#111" strokeWidth="3.5" strokeLinecap="round" />}
    {f.shy && <><circle cx="-30" cy="12" r="7" fill="none" stroke="#111" strokeWidth="2" /><circle cx="30" cy="12" r="7" fill="none" stroke="#111" strokeWidth="2" /></>}
    <text y="84" textAnchor="middle" fontFamily={FONT} fontSize="24" fontWeight="800" fill="#111" direction="rtl">{f.w}</text>
  </g>
}
function Feelings() {
  return <Page title="איך אני מרגיש/ה?" sub="הקיפו את הפרצוף שמתאים לכם היום">
    {FACES.map((f, i) => <Face key={f.w} f={f} x={[470, 300, 130][i % 3]} y={i < 3 ? 210 : 420} />)}
    <rect x="50" y="545" width="500" height="245" rx="18" fill="white" stroke="#111" strokeWidth="2.5" strokeDasharray="8 6" />
    {txt(300, 600, 'היום אני מרגיש/ה: ______________', 24)}
    {txt(300, 665, 'כי: _______________________', 24)}
    {txt(300, 730, 'מה עוזר לי להרגיש טוב: __________', 24)}
  </Page>
}

export const YOMKIPPUR_ART = [
  { id: 'dove', name: 'יונה עם עלה זית', C: DovePage },
  { id: 'bike', name: 'אופניים וקסדה', C: BikePage },
  { id: 'shofar', name: 'שופר בסוף הצום', C: ShofarStarsPage },
  { id: 'heart', name: 'לב של סליחה', C: HeartPage },
  { id: 'fish', name: 'יונה הנביא והדג הגדול', C: FishPage },
  { id: 'greeting', name: 'גמר חתימה טובה', C: Greeting },
]
export const YOMKIPPUR_SHEETS = [
  { id: 'trace', name: 'מילים של יום כיפור', age: 'גן–א׳', C: TraceYK },
  { id: 'match', name: 'מה זה? — התאמה', age: 'גן–א׳', C: MatchYK },
  { id: 'sorry-thanks', name: 'סליחה ותודה — ציור', age: 'גן–ב׳', C: SorryThanks },
  { id: 'feelings', name: 'איך אני מרגיש/ה?', age: 'גן–ב׳', C: Feelings },
]
