import { Page, At, S, S3, TraceWordsPage, GreetingPage, CountPage, MatchPage, BigPage, FONT } from '../holidays/printKit'

// Rosh Hashana line drawings, each in a 100×100 box (use with <At>).
const L = { ...S, strokeWidth: 3 }

export const Apple = () => <g>
  <path d="M56 16 C 64 4 80 6 84 10 C 78 20 64 22 56 16 Z" {...L} />
  <path d="M50 28 C 40 18 12 20 12 50 C 12 78 32 96 50 88 C 68 96 88 78 88 50 C 88 20 60 18 50 28 Z" {...L} />
  <path d="M50 28 C 50 20 52 12 56 6" fill="none" {...L} strokeWidth={4} />
  <path d="M24 46 C 24 38 28 34 34 32" fill="none" {...L} />
</g>

export const HoneyJar = () => <g>
  <path d="M24 36 H76 C 84 36 88 44 88 54 V84 C 88 92 82 96 74 96 H26 C 18 96 12 92 12 84 V54 C 12 44 16 36 24 36 Z" {...L} />
  <rect x="18" y="22" width="64" height="16" rx="5" {...L} />
  <path d="M28 38 C 28 50 38 50 38 42 C 40 54 50 54 50 42 C 52 48 60 50 62 40 C 64 50 72 50 72 38" fill="none" {...L} />
  <rect x="28" y="60" width="44" height="26" rx="6" {...L} />
  <text x="50" y="80" textAnchor="middle" fontFamily={FONT} fontSize="15" fontWeight="800" fill="#111" direction="rtl">דבש</text>
</g>

export const Pomegranate = () => <g>
  <path d="M38 26 L34 8 L43 16 L50 4 L57 16 L66 8 L62 26 Z" {...L} />
  <circle cx="50" cy="58" r="36" {...L} />
  <path d="M24 56 C 24 44 30 36 38 32" fill="none" {...L} />
  {[[52, 60], [62, 70], [44, 72], [60, 52]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="3" ry="4" {...L} strokeWidth={2} />)}
</g>

export const Shofar = () => <g>
  <path d="M10 74 C 22 76 46 70 60 54 C 70 42 74 30 74 18 L 96 24 C 92 40 84 60 70 74 C 54 90 26 92 10 80 Q 5 77 10 74 Z" {...L} />
  <ellipse cx="85" cy="21" rx="11.5" ry="5" transform="rotate(15 85 21)" {...L} />
  <path d="M55 60 C 60 64 66 68 72 70 M40 70 C 44 76 48 80 52 84" fill="none" {...L} strokeWidth={2.5} />
</g>

export const Bee = () => <g>
  <ellipse cx="40" cy="30" rx="14" ry="20" transform="rotate(-20 40 30)" {...L} />
  <ellipse cx="60" cy="28" rx="12" ry="18" transform="rotate(20 60 28)" {...L} />
  <path d="M26 56 L10 60 L26 64" {...L} />
  <ellipse cx="50" cy="60" rx="26" ry="18" {...L} />
  <path d="M42 43 C 38 52 38 68 42 77 M56 43 C 52 52 52 68 56 77" fill="none" stroke="#111" strokeWidth="6" strokeLinecap="round" />
  <circle cx="80" cy="56" r="12" {...L} />
  <circle cx="84" cy="53" r="2.5" fill="#111" />
  <path d="M80 44 C 80 36 84 32 88 30 M86 46 C 90 40 94 38 98 38" fill="none" {...L} strokeWidth={2.5} />
</g>

export const Hive = () => <g>
  <rect x="8" y="86" width="84" height="10" rx="4" {...L} />
  <path d="M20 88 C 14 60 24 20 50 16 C 76 20 86 60 80 88 Z" {...L} />
  <path d="M34 26 Q50 31 66 26 M24 43 Q50 50 76 43 M19 60 Q50 68 81 60 M19 75 Q50 82 81 75" fill="none" {...L} strokeWidth={2.5} />
  <path d="M40 88 C 40 74 60 74 60 88 Z" {...L} fill="#111" />
</g>

const draw = (C) => (x, y, size) => <At x={x} y={y} size={size}><C /></At>
const star = (x, y, r = 14) => `M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z`
const lines = (ys, x1 = 90, x2 = 510) => ys.map(y => <path key={y} d={`M${x1} ${y} H${x2}`} stroke="#999" strokeWidth="2" />)
const txt = (x, y, s, size = 24) => <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight="700" fill="#111" direction="rtl">{s}</text>

// ---------- colouring ----------
const AppleHoneyPage = () => <BigPage title="תפוח בדבש">
  <At x={220} y={470} size={340}><Apple /></At>
  <At x={440} y={560} size={230}><HoneyJar /></At>
  <At x={450} y={250} size={140}><Bee /></At>
  <path d="M60 690 H540" {...S3} />
</BigPage>
const PomegranatePage = () => <BigPage title="רימון">
  <At x={300} y={420} size={480}><Pomegranate /></At>
  <At x={120} y={720} size={120}><Pomegranate /></At><At x={480} y={720} size={120}><Pomegranate /></At>
</BigPage>
const ShofarPage = () => <BigPage title="שופר">
  <At x={300} y={440} size={500}><Shofar /></At>
  {[[110, 190], [500, 700], [120, 690]].map(([x, y], i) => <path key={i} d={star(x, y)} {...S3} />)}
</BigPage>
const HivePage = () => <BigPage title="כוורת ודבורים">
  <At x={280} y={470} size={420}><Hive /></At>
  <At x={480} y={220} size={150}><Bee /></At>
  <At x={110} y={260} size={120}><Bee /></At>
  {[[110, 720], [490, 700]].map(([x, y], i) => <g key={i}>
    <path d={`M${x} ${y + 20} V${y + 80}`} {...S3} />
    {[0, 72, 144, 216, 288].map(a => { const r = Math.PI * a / 180; return <circle key={a} cx={x + Math.cos(r) * 18} cy={y + Math.sin(r) * 18} r="13" {...S3} /> })}
    <circle cx={x} cy={y} r="10" {...S3} />
  </g>)}
</BigPage>
function CardPage() {
  return <Page title="כרטיס ברכה לשנה טובה" sub="צבעו, כתבו ברכה ותנו למישהו שאתם אוהבים">
    <rect x="50" y="130" width="500" height="660" rx="24" {...S3} />
    <rect x="66" y="146" width="468" height="628" rx="16" fill="none" stroke="#111" strokeWidth="2" strokeDasharray="8 6" />
    <text x="300" y="265" textAnchor="middle" fontFamily={FONT} fontSize="84" fontWeight="900" fill="white" stroke="#111" strokeWidth="5" direction="rtl">שנה טובה!</text>
    <At x={130} y={335} size={90}><Apple /></At><At x={470} y={335} size={90}><Pomegranate /></At>
    <At x={300} y={335} size={80}><Bee /></At>
    {txt(300, 430, 'ל: ________________', 26)}
    {txt(300, 480, 'אני מאחל/ת לך:', 26)}
    {lines([540, 600, 660])}
    {txt(300, 740, 'מאת: ________________', 26)}
  </Page>
}
const Greeting = () => <GreetingPage lines={['שנה טובה', 'ומתוקה!']}>
  <At x={130} y={650} size={150}><Apple /></At><At x={300} y={660} size={150}><HoneyJar /></At><At x={470} y={650} size={150}><Pomegranate /></At>
</GreetingPage>

// ---------- worksheets ----------
const CountApples = () => <CountPage title="כמה תפוחים?" sub="ספרו את התפוחים בכל קופסה וכתבו את המספר" render={draw(Apple)} size={42} />
const MatchRH = () => <MatchPage title="מה זה?" items={[Apple, Pomegranate, Shofar, HoneyJar, Bee].map(C => ({ render: draw(C) }))} words={['שופר', 'דבורה', 'תפוח', 'רימון', 'דבש']} />
const TraceRH = () => <TraceWordsPage title="מילים של ראש השנה" words={['שנה טובה', 'שופר', 'תפוח', 'דבש', 'רימון', 'תשרי']} />
function MyWish() {
  return <Page title="המשאלה שלי לשנה החדשה" sub="כתבו או ציירו בתוך התפוח משאלה לשנה החדשה">
    <At x={300} y={400} size={460}><Apple /></At>
    {lines([400, 460, 520], 175, 425)}
    {lines([580], 215, 385)}
    {txt(300, 700, 'בשנה החדשה אני רוצה ללמוד: _______________', 22)}
    {txt(300, 760, 'ולכל המשפחה אני מאחל/ת: _______________', 22)}
  </Page>
}

export const ROSHHASHANA_ART = [
  { id: 'apple-honey', name: 'תפוח בדבש', C: AppleHoneyPage },
  { id: 'pomegranate', name: 'רימון', C: PomegranatePage },
  { id: 'shofar', name: 'שופר', C: ShofarPage },
  { id: 'hive', name: 'כוורת ודבורים', C: HivePage },
  { id: 'card', name: 'כרטיס ברכה לצביעה', C: CardPage },
  { id: 'greeting', name: 'שנה טובה ומתוקה', C: Greeting },
]
export const ROSHHASHANA_SHEETS = [
  { id: 'count', name: 'כמה תפוחים?', age: 'גן', C: CountApples },
  { id: 'match', name: 'מה זה? — התאמה', age: 'גן–א׳', C: MatchRH },
  { id: 'trace', name: 'מילים של ראש השנה', age: 'גן–א׳', C: TraceRH },
  { id: 'wish', name: 'המשאלה שלי לשנה החדשה', age: 'א׳–ג׳', C: MyWish },
]
