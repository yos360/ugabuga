import { Page, At, S, FONT, TraceWordsPage, GreetingPage, CountPage, MatchPage, BigPage } from '../holidays/printKit'

// Sigd — line drawings, each in a 100×100 box (use with <At>).
const L = { ...S, strokeWidth: 3 }

// The colourful umbrellas the kessim (priests) hold during the Sigd prayer.
export const Umbrella = () => <g>
  <path d="M6 46 C 8 20 30 6 50 6 C 70 6 92 20 94 46 C 88 40 80 40 74 46 C 68 40 58 40 50 46 C 42 40 32 40 26 46 C 20 40 12 40 6 46 Z" {...L} />
  <path d="M50 6 C 40 20 36 32 38 44 M50 6 C 60 20 64 32 62 44 M50 6 V46" fill="none" stroke="#111" strokeWidth={2.5} />
  {[[16, 34], [30, 26], [50, 22], [70, 26], [84, 34]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" {...L} strokeWidth={2} />)}
  <path d="M50 46 V86 C 50 94 40 94 40 86" fill="none" stroke="#111" strokeWidth={4} strokeLinecap="round" />
  <path d="M50 2 V6" stroke="#111" strokeWidth={4} strokeLinecap="round" />
  {[6, 26, 50, 74, 94].map((x, i) => <path key={i} d={`M${x} 46 V54`} stroke="#111" strokeWidth={2} />)}
</g>

// Jerusalem's old city wall with a gate.
export const Wall = () => <g>
  <path d="M4 92 V36 H14 V28 H24 V36 H34 V28 H44 V36 H56 V28 H66 V36 H76 V28 H86 V36 H96 V92 Z" {...L} />
  <path d="M38 92 V64 C 38 52 62 52 62 64 V92" {...L} />
  {[[4, 50, 34], [62, 50, 96], [4, 70, 38], [62, 70, 96]].map(([x1, y, x2], i) => <path key={i} d={`M${x1} ${y} H${x2}`} stroke="#111" strokeWidth={2} />)}
  {[18, 30, 72, 84].map((x, i) => <path key={i} d={`M${x} 36 V50 M${x - 6} 50 V70 M${x} 70 V92`} stroke="#111" strokeWidth={2} />)}
</g>

// A mountain at sunrise — the Sigd prayer is held on a high place, facing Jerusalem.
export const Mountain = () => <g>
  <circle cx="74" cy="26" r="14" {...L} />
  {Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4, c = Math.cos(a), s = Math.sin(a); return <path key={i} d={`M${74 + c * 18} ${26 + s * 18} L${74 + c * 24} ${26 + s * 24}`} stroke="#111" strokeWidth={2.5} strokeLinecap="round" /> })}
  <path d="M2 92 L36 30 L54 58 L66 44 L98 92 Z" {...L} />
  <path d="M28 44 L36 30 L44 44 L40 40 L36 46 L32 40 Z" {...L} strokeWidth={2} />
</g>

// The Orit — the Torah of Ethiopian Jews, read on Sigd.
export const Book = () => <g>
  <path d="M50 22 C 38 14 20 14 8 18 V84 C 20 80 38 80 50 88 C 62 80 80 80 92 84 V18 C 80 14 62 14 50 22 Z" {...L} />
  <path d="M50 22 V88" stroke="#111" strokeWidth={3} />
  {[34, 46, 58, 70].map((y, i) => <g key={i}><path d={`M16 ${y} H42`} stroke="#999" strokeWidth={2} /><path d={`M58 ${y} H84`} stroke="#999" strokeWidth={2} /></g>)}
</g>

// Dabo — the round festive bread eaten when the fast ends.
export const Bread = () => <g>
  <ellipse cx="50" cy="60" rx="44" ry="26" {...L} />
  <path d="M8 56 C 10 34 30 24 50 24 C 70 24 90 34 92 56" {...L} />
  {[[30, 40], [50, 34], [70, 40], [40, 50], [60, 50]].map(([x, y], i) => <path key={i} d={`M${x - 6} ${y} Q ${x} ${y - 5} ${x + 6} ${y}`} fill="none" stroke="#111" strokeWidth={2} strokeLinecap="round" />)}
</g>

const draw = C => (x, y, size) => <At x={x} y={y} size={size}><C /></At>

// ---------- colouring ----------
const UmbrellaPage = () => <BigPage title="המטריות הצבעוניות של הקסים"><At x={300} y={450} size={540}><Umbrella /></At></BigPage>
const WallPage = () => <BigPage title="ירושלים">
  <At x={300} y={500} size={520}><Wall /></At>
  <At x={470} y={190} size={120}><Mountain /></At>
</BigPage>
const MountainPage = () => <BigPage title="תפילה על ההר"><At x={300} y={450} size={540}><Mountain /></At></BigPage>
const BookPage = () => <BigPage title="ספר האורית"><At x={300} y={450} size={520}><Book /></At></BigPage>
const BreadPage = () => <BigPage title="לחם הדאבו"><At x={300} y={460} size={500}><Bread /></At></BigPage>
const Greeting = () => <GreetingPage lines={['סיגד', 'שמח!']}>
  <At x={140} y={660} size={150}><Umbrella /></At><At x={300} y={670} size={170}><Wall /></At><At x={460} y={660} size={150}><Bread /></At>
</GreetingPage>

// ---------- worksheets ----------
const CountUmbrellas = () => <CountPage title="כמה מטריות?" sub="ספרו את המטריות בכל קופסה וכתבו את המספר" render={draw(Umbrella)} size={44} />
const MatchSigd = () => <MatchPage title="מה זה?" items={[Umbrella, Wall, Book, Bread, Mountain].map(C => ({ render: draw(C) }))} words={['הר', 'ספר', 'מטרייה', 'לחם', 'חומה']} />
const TraceSigd = () => <TraceWordsPage title="מילים של סיגד" words={['סיגד', 'ירושלים', 'אורית', 'הר', 'תפילה', 'קהילה']} />

// Decorate the umbrella: an empty umbrella with pattern ideas to copy.
function DecorateUmbrella() {
  return <Page title="מקשטים מטרייה" sub="קשטו את המטרייה בצורות ובצבעים — כמו המטריות של הקסים בסיגד">
    <At x={300} y={430} size={460}><g>
      <path d="M6 46 C 8 20 30 6 50 6 C 70 6 92 20 94 46 C 88 40 80 40 74 46 C 68 40 58 40 50 46 C 42 40 32 40 26 46 C 20 40 12 40 6 46 Z" {...S} strokeWidth={2} />
      <path d="M50 46 V86 C 50 94 40 94 40 86" fill="none" stroke="#111" strokeWidth={3} strokeLinecap="round" />
    </g></At>
    {[['○', 120], ['△', 220], ['☆', 300], ['♡', 380], ['◇', 480]].map(([c, x]) => <text key={c} x={x} y={740} textAnchor="middle" fontSize="54" fill="#111">{c}</text>)}
  </Page>
}

// ---------- workbook (חוברת עבודה) ----------
const T = ({ x = 300, y, size = 30, weight = 700, children }) => <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={weight} fill="#111" direction="rtl">{children}</text>

function Cover() {
  return <Page>
    <T y={150} size={64} weight={900}>החוברת שלי</T>
    <T y={235} size={78} weight={900}>לסיגד</T>
    <At x={300} y={420} size={260}><Umbrella /></At>
    <At x={150} y={600} size={150}><Wall /></At><At x={450} y={600} size={150}><Bread /></At>
    <T y={735} size={30}>הגן או הכיתה שלי: ______________</T>
  </Page>
}

function WhatIsSigd() {
  return <Page title="מה זה סיגד?" sub="קוראים יחד, ואז צובעים את ההר">
    {['סיגד הוא חג של יהודי אתיופיה.', 'בחג עולים למקום גבוה ומתפללים.', 'הקסים מחזיקים מטריות צבעוניות.', 'כולם מתגעגעים לירושלים.', 'בסוף הצום אוכלים לחם דאבו וחוגגים.'].map((l, i) => <T key={i} y={180 + i * 54} size={32}>{l}</T>)}
    <At x={300} y={620} size={300}><Mountain /></At>
  </Page>
}

// Fine motor: trace the dotted path from the mountain to Jerusalem.
function PathToJerusalem() {
  return <Page title="הדרך לירושלים" sub="עוברים בעיפרון על הקו המנוקד, מההר ועד ירושלים">
    <At x={480} y={210} size={150}><Mountain /></At>
    <At x={130} y={660} size={170}><Wall /></At>
    <path d="M440 300 C 520 380 420 420 330 400 C 220 380 160 440 240 500 C 320 560 300 600 220 610" fill="none" stroke="#111" strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" />
    <path d="M440 300 C 520 380 420 420 330 400 C 220 380 160 440 240 500 C 320 560 300 600 220 610" fill="none" stroke="#bbb" strokeWidth={30} strokeLinecap="round" opacity="0.25" />
  </Page>
}

// Visual discrimination: one picture in each row is different.
function OddOneOut() {
  const rows = [[Umbrella, Umbrella, Bread, Umbrella], [Book, Wall, Wall, Wall], [Mountain, Mountain, Mountain, Umbrella], [Bread, Bread, Book, Bread]]
  return <Page title="מה שונה?" sub="בכל שורה יש ציור אחד שונה. הקיפו אותו בעיגול">
    {rows.map((row, r) => row.map((C, i) => <At key={`${r}-${i}`} x={90 + i * 140} y={210 + r * 160} size={110}><C /></At>))}
    {rows.map((_, r) => <path key={r} d={`M40 ${290 + r * 160} H560`} stroke="#ddd" strokeWidth={2} />)}
  </Page>
}

function DrawCelebration() {
  return <Page title="ככה אנחנו חוגגים" sub="ציירו את עצמכם, את המשפחה או את הגן חוגגים סיגד">
    <rect x="50" y="140" width="500" height="560" rx="24" fill="white" stroke="#111" strokeWidth={4} />
    <At x={110} y={200} size={80}><Umbrella /></At><At x={490} y={200} size={80}><Umbrella /></At>
    <T y={760} size={28}>מה ציירתי? ______________________</T>
  </Page>
}

function CountToFifty() {
  return <Page title="סיגד: 50 ימים אחרי יום כיפור" sub="סופרים עד 50, וצובעים כל שורה בצבע אחר">
    {Array.from({ length: 50 }, (_, i) => { const col = i % 10, row = Math.floor(i / 10); return <g key={i}>
      <rect x={550 - (col + 1) * 50} y={190 + row * 70} width="46" height="60" rx="8" fill="white" stroke="#111" strokeWidth={2.5} />
      <T x={550 - (col + 1) * 50 + 23} y={190 + row * 70 + 40} size={22}>{i + 1}</T>
    </g> })}
    <At x={300} y={640} size={150}><Umbrella /></At>
  </Page>
}

const Closing = () => <GreetingPage lines={['סיגד', 'שמח!']}>
  <T y={590} size={30}>סיימתי את החוברת!</T>
  <At x={160} y={700} size={120}><Umbrella /></At><At x={440} y={700} size={120}><Umbrella /></At>
</GreetingPage>

export const SIGD_WORKBOOK = [
  { id: 'cover', name: 'שער החוברת', C: Cover },
  { id: 'what', name: 'מה זה סיגד?', C: WhatIsSigd },
  { id: 'path', name: 'הדרך לירושלים', C: PathToJerusalem },
  { id: 'decorate', name: 'מקשטים מטרייה', C: DecorateUmbrella },
  { id: 'count', name: 'כמה מטריות?', C: CountUmbrellas },
  { id: 'odd', name: 'מה שונה?', C: OddOneOut },
  { id: 'match', name: 'מה זה? — התאמה', C: MatchSigd },
  { id: 'fifty', name: '50 ימים', age: 'א׳', C: CountToFifty },
  { id: 'trace', name: 'מילים של סיגד', C: TraceSigd },
  { id: 'jerusalem', name: 'צובעים את ירושלים', C: WallPage },
  { id: 'draw', name: 'ככה אנחנו חוגגים', C: DrawCelebration },
  { id: 'closing', name: 'סיגד שמח!', C: Closing },
]

export const SIGD_ART = [
  { id: 'umbrella', name: 'המטרייה הצבעונית', C: UmbrellaPage },
  { id: 'jerusalem', name: 'חומות ירושלים', C: WallPage },
  { id: 'mountain', name: 'תפילה על ההר', C: MountainPage },
  { id: 'orit', name: 'ספר האורית', C: BookPage },
  { id: 'dabo', name: 'לחם הדאבו', C: BreadPage },
  { id: 'greeting', name: 'סיגד שמח', C: Greeting },
]
export const SIGD_SHEETS = [
  { id: 'decorate', name: 'מקשטים מטרייה', age: 'גן–א׳', C: DecorateUmbrella },
  { id: 'count', name: 'כמה מטריות?', age: 'גן', C: CountUmbrellas },
  { id: 'match', name: 'מה זה? — התאמה', age: 'גן–א׳', C: MatchSigd },
  { id: 'trace', name: 'מילים של סיגד', age: 'גן–א׳', C: TraceSigd },
]
