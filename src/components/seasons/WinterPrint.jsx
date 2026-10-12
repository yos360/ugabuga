import { Page, At, S, TraceWordsPage, GreetingPage, CountPage, MatchPage, BigPage, FONT } from '../holidays/printKit'
import { Umbrella } from '../sigd/SigdPrint'

// Winter & rain — line drawings in a 100×100 box (use with <At>).
const L = { ...S, strokeWidth: 3 }
export const Drop = () => <path d="M50 6 C 66 30 80 46 80 64 C 80 82 66 94 50 94 C 34 94 20 82 20 64 C 20 46 34 30 50 6 Z" {...L} />
export const Cloud = () => <path d="M22 70 C 6 70 4 48 20 44 C 18 26 40 18 50 30 C 58 14 84 18 84 40 C 98 42 98 70 80 70 Z" {...L} />
const RainCloud = () => <g><g transform="translate(0 -10)"><Cloud /></g>
  {[[30, 76], [50, 86], [70, 76], [40, 96], [62, 96]].map(([x, y], i) => <path key={i} d={`M${x} ${y} l-4 8`} stroke="#111" strokeWidth={3} strokeLinecap="round" />)}</g>
export const Boot = () => <g>
  <path d="M30 8 H62 V60 C 62 64 66 66 70 66 H84 C 92 66 96 72 96 80 V90 H30 Z" {...L} />
  <path d="M30 22 H62" stroke="#111" strokeWidth={2.5} /><path d="M30 90 H96" stroke="#111" strokeWidth={5} />
</g>
export const Rainbow = () => <g>
  {[44, 36, 28, 20].map((r, i) => <path key={i} d={`M${50 - r} 74 A ${r} ${r} 0 0 1 ${50 + r} 74`} fill="none" stroke="#111" strokeWidth={3} />)}
  <g transform="translate(-6 50) scale(.35)"><Cloud /></g><g transform="translate(70 50) scale(.35)"><Cloud /></g>
</g>
export const Snowman = () => <g>
  <circle cx="50" cy="68" r="26" {...L} /><circle cx="50" cy="30" r="17" {...L} />
  <circle cx="44" cy="27" r="2.4" fill="#111" /><circle cx="56" cy="27" r="2.4" fill="#111" />
  <path d="M50 32 L62 35 L50 37 Z" {...L} strokeWidth={2} />
  <path d="M33 4 H67 L62 16 H38 Z" {...L} />
  {[58, 70, 82].map(y => <circle key={y} cx="50" cy={y} r="2.6" fill="#111" />)}
  <path d="M26 58 L8 46 M74 58 L92 46" stroke="#111" strokeWidth={3} strokeLinecap="round" />
</g>
const draw = C => (x, y, size) => <At x={x} y={y} size={size}><C /></At>

// ---------- colouring ----------
const UmbrellaRain = () => <BigPage title="מטרייה בגשם">
  <At x={300} y={470} size={460}><Umbrella /></At>
  {[[90, 160], [180, 210], [420, 180], [510, 230], [120, 330], [480, 360], [80, 520], [520, 560]].map(([x, y], i) => <At key={i} x={x} y={y} size={46}><Drop /></At>)}
  <path d="M60 740 C 160 720 440 720 540 740 C 440 770 160 770 60 740 Z" {...S} strokeWidth={3} />
</BigPage>
const CloudPage = () => <BigPage title="ענן גשום"><At x={300} y={430} size={520}><RainCloud /></At></BigPage>
const BootsPage = () => <BigPage title="מגפיים בשלולית">
  <At x={220} y={430} size={300}><Boot /></At><At x={400} y={450} size={280}><Boot /></At>
  <path d="M70 640 C 170 600 430 600 530 640 C 430 690 170 690 70 640 Z" {...S} strokeWidth={3} />
</BigPage>
const RainbowPage = () => <BigPage title="קשת בענן"><At x={300} y={460} size={540}><Rainbow /></At></BigPage>
const SnowmanPage = () => <BigPage title="איש שלג">
  <At x={300} y={460} size={520}><Snowman /></At>
  {[[90, 180], [510, 200], [130, 640], [480, 660], [300, 150]].map(([x, y], i) => <text key={i} x={x} y={y} fontSize="40" textAnchor="middle">❄</text>)}
</BigPage>
const Greeting = () => <GreetingPage lines={['משיב הרוח', 'ומוריד הגשם']}>
  <At x={150} y={680} size={150}><RainCloud /></At><At x={300} y={680} size={150}><Umbrella /></At><At x={450} y={680} size={150}><Boot /></At>
</GreetingPage>

// ---------- worksheets ----------
const CountDrops = () => <CountPage title="כמה טיפות?" sub="ספרו את הטיפות בכל קופסה וכתבו את המספר" render={draw(Drop)} size={40} />
const MatchWinter = () => <MatchPage title="מה זה?" items={[Umbrella, Cloud, Boot, Rainbow, Snowman].map(C => ({ render: draw(C) }))} words={['קשת', 'מגף', 'איש שלג', 'מטרייה', 'ענן']} />
const TraceWinter = () => <TraceWordsPage title="מילים של חורף" words={['חורף', 'גשם', 'מטרייה', 'ענן', 'מגפיים', 'קשת']} />
function WinterClothes() {
  const cells = [['מעיל', '🧥'], ['משקפי שמש', '🕶️'], ['מגפיים', '🥾'], ['בגד ים', '🩱'], ['צעיף', '🧣'], ['כפכפים', '🩴']]
  return <Page title="מה לובשים בחורף?" sub="הקיפו מה לובשים בחורף, וסמנו X על בגדים של קיץ">
    {cells.map(([w, e], i) => {
      const col = i % 2, row = Math.floor(i / 2), bx = col ? 40 : 320, by = 140 + row * 215
      return <g key={w}>
        <rect x={bx} y={by} width="240" height="190" rx="18" fill="white" stroke="#111" strokeWidth="2.5" />
        <text x={bx + 120} y={by + 100} textAnchor="middle" fontSize="70">{e}</text>
        <text x={bx + 120} y={by + 162} textAnchor="middle" fontFamily={FONT} fontSize="26" fontWeight="800" direction="rtl">{w}</text>
      </g>
    })}
  </Page>
}

export const WINTER_ART = [
  { id: 'umbrella-rain', name: 'מטרייה בגשם', C: UmbrellaRain },
  { id: 'rain-cloud', name: 'ענן גשום', C: CloudPage },
  { id: 'boots', name: 'מגפיים בשלולית', C: BootsPage },
  { id: 'rainbow', name: 'קשת בענן', C: RainbowPage },
  { id: 'snowman', name: 'איש שלג', C: SnowmanPage },
  { id: 'mashiv-haruach', name: 'משיב הרוח ומוריד הגשם', C: Greeting },
]
export const WINTER_SHEETS = [
  { id: 'count-drops', name: 'כמה טיפות?', age: 'גן', C: CountDrops },
  { id: 'clothes', name: 'מה לובשים בחורף?', age: 'גן', C: WinterClothes },
  { id: 'match', name: 'מה זה? — התאמה', age: 'גן–א׳', C: MatchWinter },
  { id: 'trace', name: 'מילים של חורף', age: 'גן–א׳', C: TraceWinter },
]
