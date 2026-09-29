import { Page, At, S, S3, TraceWordsPage, GreetingPage, CountPage, MatchPage, BigPage, FONT } from '../holidays/printKit'

// Yom HaAtzmaut line drawings. Small ones live in a 100×100 box (use with <At>);
// the flag and the emblem take a stroke width so they stay clean at any size.
const L = { ...S, strokeWidth: 3 }
const f2 = n => Math.round(n * 100) / 100

// ---------- Magen David: two interlaced triangle bands ----------
const triPts = (cx, cy, R, up) => [0, 1, 2].map(k => { const a = ((up ? -90 : 90) + k * 120) * Math.PI / 180; return [f2(cx + R * Math.cos(a)), f2(cy + R * Math.sin(a))] })
const triD = pts => 'M' + pts.map(p => p.join(' ')).join(' L') + ' Z'
// R = centre-to-tip, w = band width (the inner triangle's circumradius is R − 2w).
export const MagenDavid = ({ cx = 50, cy = 50, R = 42, w = 7, sw = 3 }) => <g>
  {[true, false].map(up => <path key={String(up)} d={triD(triPts(cx, cy, R, up)) + ' ' + triD(triPts(cx, cy, R - 2 * w, up))} fillRule="evenodd" {...S} strokeWidth={sw} />)}
</g>

// ---------- flag: official proportions 220 × 160, stripes 25 wide 15 from the edge, star 66 tall with 5.5 bands ----------
export function FlagShape({ x, y, W, sw = 3 }) {
  const u = W / 220, H = 160 * u
  return <g>
    <rect x={x} y={y} width={W} height={H} {...S} strokeWidth={sw} />
    <rect x={x} y={y + 15 * u} width={W} height={25 * u} {...S} strokeWidth={sw} />
    <rect x={x} y={y + H - 40 * u} width={W} height={25 * u} {...S} strokeWidth={sw} />
    <MagenDavid cx={x + W / 2} cy={y + H / 2} R={33 * u} w={5.5 * u} sw={sw * 0.55} />
  </g>
}

// Flag on a pole, for the small pictures.
export const Flag = () => <g>
  <rect x="6" y="6" width="6" height="92" rx="3" {...L} />
  <circle cx="9" cy="6" r="4.5" {...L} />
  <FlagShape x={12} y={12} W={84} sw={2.5} />
</g>

// ---------- menorah (seven branches) ----------
export function Menorah({ sw = 3 }) {
  const st = { ...S, strokeWidth: sw }, cy = 34, w = 3.5
  return <g>
    <rect x="46" y="28" width="8" height="58" {...st} />
    {[36, 24, 12].map(r => <path key={r} d={`M${50 - r - w} ${cy} A${r + w} ${r + w} 0 0 0 ${50 + r + w} ${cy} H${50 + r - w} A${r - w} ${r - w} 0 0 1 ${50 - r + w} ${cy} Z`} {...st} />)}
    {[-36, -24, -12, 0, 12, 24, 36].map(d => <rect key={d} x={50 + d - 5} y="24" width="10" height="8" rx="1.5" {...st} />)}
    <path d="M40 86 H60 L66 93 H34 Z" {...st} />
    <rect x="28" y="93" width="44" height="6" rx="2" {...st} />
  </g>
}

// ---------- olive branch along a quadratic curve ----------
function OliveBranch({ p0, c, p2, sw, leaf = 5.5 }) {
  const pt = t => [(1 - t) ** 2 * p0[0] + 2 * t * (1 - t) * c[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * t * (1 - t) * c[1] + t * t * p2[1]]
  const tan = t => [2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p2[0] - c[0]), 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p2[1] - c[1])]
  const leaves = []
  for (let i = 0; i < 9; i++) {
    const t = 0.14 + i * 0.1, [x, y] = pt(t), [dx, dy] = tan(t), a = Math.atan2(dy, dx) * 180 / Math.PI, side = i % 2 ? 1 : -1
    const n = [-dy, dx], len = Math.hypot(n[0], n[1]), ox = n[0] / len * leaf * 0.8 * side, oy = n[1] / len * leaf * 0.8 * side
    leaves.push(<ellipse key={i} cx={f2(x + ox)} cy={f2(y + oy)} rx={leaf} ry={leaf * 0.42} transform={`rotate(${f2(a + side * 35)} ${f2(x + ox)} ${f2(y + oy)})`} {...S} strokeWidth={sw} />)
  }
  const [ex, ey] = pt(1)
  return <g>
    <path d={`M${p0[0]} ${p0[1]} Q${c[0]} ${c[1]} ${p2[0]} ${p2[1]}`} fill="none" stroke="#111" strokeWidth={sw * 1.3} strokeLinecap="round" />
    {leaves}
    <ellipse cx={ex} cy={ey - leaf * 0.6} rx={leaf * 0.42} ry={leaf} {...S} strokeWidth={sw} />
  </g>
}

// ---------- the state emblem: menorah, two olive branches and "ישראל" on a shield ----------
export function Emblem({ sw = 2 }) {
  const branch = { p0: [39, 72], c: [13, 62], p2: [21, 16], sw: sw * 0.8 }
  return <g>
    <path d="M10 6 H90 V60 C90 82 70 92 50 97 C30 92 10 82 10 60 Z" {...S} strokeWidth={sw * 1.3} />
    <g transform="translate(26 6) scale(0.48)"><Menorah sw={sw * 1.6} /></g>
    <OliveBranch {...branch} />
    <g transform="translate(100 0) scale(-1 1)"><OliveBranch {...branch} /></g>
    <text x="50" y="87" textAnchor="middle" fontFamily={FONT} fontSize="11.5" fontWeight="900" fill="white" stroke="#111" strokeWidth={sw * 0.35} direction="rtl">ישראל</text>
  </g>
}

export const Balloon = () => <g>
  <path d="M50 98 C 40 90 60 82 50 74" fill="none" {...L} />
  <path d="M45 74 H55 L50 67 Z" {...L} />
  <ellipse cx="50" cy="36" rx="25" ry="31" {...L} />
  <path d="M34 22 C 38 14 44 11 48 11" fill="none" {...L} strokeWidth={2} />
</g>

export const Firework = () => <g>
  {Array.from({ length: 12 }, (_, k) => { const a = k * 30 * Math.PI / 180; return <g key={k}>
    <path d={`M${f2(50 + Math.cos(a) * 13)} ${f2(50 + Math.sin(a) * 13)} L${f2(50 + Math.cos(a) * 36)} ${f2(50 + Math.sin(a) * 36)}`} {...L} />
    <circle cx={f2(50 + Math.cos(a) * 43)} cy={f2(50 + Math.sin(a) * 43)} r="4.5" {...L} />
  </g> })}
  <circle cx="50" cy="50" r="7" {...L} />
</g>

const Star = () => <MagenDavid />
const MenorahIcon = () => <Menorah />

const draw = (C) => (x, y, size) => <At x={x} y={y} size={size}><C /></At>

// ---------- colouring ----------
const FlagPage = () => <BigPage title="דגל ישראל">
  <rect x="36" y="150" width="18" height="630" rx="9" {...S} />
  <circle cx="45" cy="146" r="16" {...S} />
  <FlagShape x={54} y={170} W={506} sw={5} />
  <path d="M10 790 H100" {...S} strokeWidth={6} />
</BigPage>

const EmblemPage = () => <BigPage title="סמל המדינה">
  <At x={300} y={450} size={600}><Emblem sw={1.1} /></At>
</BigPage>

function Burst({ x, y, r, n = 12 }) {
  return <g>
    {Array.from({ length: n }, (_, k) => { const a = (k * 360 / n + 8) * Math.PI / 180; return <g key={k}>
      <path d={`M${f2(x + Math.cos(a) * r * 0.25)} ${f2(y + Math.sin(a) * r * 0.25)} L${f2(x + Math.cos(a) * r * 0.8)} ${f2(y + Math.sin(a) * r * 0.8)}`} {...S3} strokeWidth={4} />
      <circle cx={f2(x + Math.cos(a) * r)} cy={f2(y + Math.sin(a) * r)} r={r * 0.09} {...S3} />
    </g> })}
    <circle cx={x} cy={y} r={r * 0.14} {...S3} />
  </g>
}
const Skyline = () => {
  const b = [[20, 640, 80], [100, 590, 70], [170, 660, 60], [230, 560, 90], [320, 620, 70], [390, 580, 80], [470, 650, 50], [520, 600, 60]]
  return <g>
    {b.map(([x, y, w], i) => <g key={i}>
      <rect x={x} y={y} width={w} height={780 - y} {...S3} />
      {Array.from({ length: Math.floor((760 - y) / 45) }, (_, r) => [0, 1].map(c => <rect key={r + '-' + c} x={x + 12 + c * (w / 2 - 4)} y={y + 16 + r * 45} width={w / 2 - 20} height="22" rx="3" {...S3} strokeWidth={2.5} />))}
    </g>)}
    <path d="M10 780 H590" {...S} />
  </g>
}
const FireworksPage = () => <BigPage title="זיקוקים בשמיים">
  <Burst x={170} y={250} r={110} />
  <Burst x={430} y={230} r={125} n={14} />
  <Burst x={300} y={430} r={85} n={10} />
  <Burst x={95} y={450} r={55} n={8} />
  <Burst x={505} y={455} r={60} n={8} />
  <Skyline />
</BigPage>

const BalloonsPage = () => {
  const flags = [0.1, 0.24, 0.38, 0.52, 0.66, 0.8, 0.94]
  const q = t => [(1 - t) ** 2 * 20 + 2 * t * (1 - t) * 300 + t * t * 580, (1 - t) ** 2 * 125 + 2 * t * (1 - t) * 215 + t * t * 125]
  const balloons = [[300, 290, 0], [170, 340, -8], [430, 340, 8], [235, 470, -4], [365, 470, 4]]
  return <BigPage title="בלונים כחול־לבן">
    <path d="M20 125 Q300 215 580 125" fill="none" stroke="#111" strokeWidth="4" />
    {flags.map((t, i) => { const [x, y] = q(t); return <FlagShape key={i} x={x - 31} y={y} W={62} sw={2.5} /> })}
    {balloons.map(([x, y], i) => <path key={'s' + i} d={`M${x} ${y + 88} Q${(x + 300) / 2 + (i % 2 ? 12 : -12)} ${(y + 740) / 2} 300 735`} fill="none" stroke="#111" strokeWidth="3.5" />)}
    {balloons.map(([x, y, rot], i) => <g key={i} transform={`rotate(${rot} ${x} ${y})`}>
      <path d={`M${x - 10} ${y + 90} H${x + 10} L${x} ${y + 76} Z`} {...S3} />
      <ellipse cx={x} cy={y} rx="66" ry="80" {...S} />
      <path d={`M${x - 38} ${y - 38} C ${x - 30} ${y - 58} ${x - 18} ${y - 64} ${x - 8} ${y - 66}`} fill="none" {...S3} />
      {i === 0 && <MagenDavid cx={x} cy={y + 4} R={34} w={7} sw={3} />}
    </g>)}
    <path d="M300 735 L272 760 L282 735 L272 710 Z M300 735 L328 760 L318 735 L328 710 Z" {...S3} />
  </BigPage>
}

const PicnicPage = () => <BigPage title="פיקניק ביום העצמאות">
  {/* sun and a cloud */}
  <circle cx="510" cy="160" r="42" {...S} />
  {Array.from({ length: 10 }, (_, k) => { const a = k * 36 * Math.PI / 180; return <path key={k} d={`M${f2(510 + Math.cos(a) * 56)} ${f2(160 + Math.sin(a) * 56)} L${f2(510 + Math.cos(a) * 76)} ${f2(160 + Math.sin(a) * 76)}`} {...S} /> })}
  <path d="M270 210 C 260 170 310 150 330 175 C 345 140 405 145 405 185 C 440 180 450 225 415 230 H285 C 255 232 250 210 270 210 Z" {...S3} strokeWidth={4} />
  {/* tree */}
  <rect x="95" y="330" width="34" height="170" rx="6" {...S} />
  <path d="M112 360 C 40 370 20 300 60 270 C 40 220 100 190 130 215 C 160 180 220 210 205 260 C 245 290 220 360 160 350 Z" {...S} />
  {/* blanket with a checked pattern */}
  <path d="M150 520 H450 L560 770 H40 Z" {...S} />
  {[0.25, 0.5, 0.75].map((t, i) => <path key={'v' + i} d={`M${150 + 300 * t} 520 L${40 + 520 * t} 770`} {...S3} />)}
  {[0.3, 0.62].map((t, i) => <path key={'h' + i} d={`M${150 - 110 * t} ${520 + 250 * t} H${450 + 110 * t}`} {...S3} />)}
  {/* basket with a small flag */}
  <rect x="372" y="380" width="6" height="120" rx="3" {...S3} />
  <FlagShape x={378} y={384} W={88} sw={2.5} />
  <path d="M260 470 C 260 400 360 400 360 470" fill="none" {...S} strokeWidth={8} />
  <path d="M240 470 H380 L365 560 H255 Z" {...S} />
  <path d="M248 500 H372 M252 530 H368 M290 470 L288 560 M330 470 L332 560" {...S3} />
  {/* watermelon slice */}
  <path d="M110 660 A70 70 0 0 0 250 660 Z" {...S} />
  <path d="M124 660 A56 56 0 0 0 236 660" fill="none" {...S3} />
  {[[150, 675], [180, 690], [210, 675], [180, 668]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="4" ry="7" fill="#111" />)}
  {/* ball */}
  <circle cx="455" cy="660" r="48" {...S} />
  <path d="M407 660 C 430 640 480 640 503 660 M455 612 C 440 640 440 680 455 708" fill="none" {...S3} />
</BigPage>

const Greeting = () => <GreetingPage lines={['יום עצמאות', 'שמח!']}>
  <At x={130} y={660} size={150}><Flag /></At><At x={300} y={660} size={150}><Firework /></At><At x={470} y={660} size={150}><Balloon /></At>
</GreetingPage>

// ---------- worksheets ----------
const CountBalloons = () => <CountPage title="כמה בלונים?" sub="ספרו את הבלונים בכל קופסה וכתבו את המספר" counts={[4, 2, 6, 3, 7, 5]} render={draw(Balloon)} size={56} />
const MatchAtzmaut = () => <MatchPage title="מה זה?" items={[Flag, MenorahIcon, Balloon, Firework, Star].map(C => ({ render: draw(C) }))} words={['זיקוק', 'מגן דוד', 'דגל', 'מנורה', 'בלון']} />
const TraceAtzmaut = () => <TraceWordsPage title="מילים של יום העצמאות" words={['ישראל', 'דגל', 'עצמאות', 'מדינה', 'ירושלים', 'התקווה']} />
function ColorTheFlag() {
  const steps = ['א. צבעו בכחול את שני הפסים.', 'ב. צבעו בכחול את מגן הדוד.', 'ג. את הרקע השאירו לבן.']
  return <Page title="צובעים את הדגל" sub="קראו את ההוראות וצבעו את הדגל">
    <FlagShape x={110} y={140} W={380} sw={4} />
    {steps.map((s, i) => <text key={i} x="300" y={470 + i * 44} textAnchor="middle" fontFamily={FONT} fontSize="26" fontWeight="700" direction="rtl">{s}</text>)}
    <rect x="60" y="610" width="480" height="150" rx="18" fill="white" stroke="#111" strokeWidth="2.5" strokeDasharray="8 6" />
    <text x="300" y="640" textAnchor="middle" fontFamily={FONT} fontSize="18" fontWeight="700" fill="#444" direction="rtl">ציירו כאן מה אתם הכי אוהבים בישראל</text>
    <text x="300" y="795" textAnchor="middle" fontFamily={FONT} fontSize="22" fontWeight="700" direction="rtl">אני אוהב/ת בישראל את: ____________________</text>
  </Page>
}

export const ATZMAUT_ART = [
  { id: 'flag', name: 'דגל ישראל', C: FlagPage },
  { id: 'emblem', name: 'סמל המדינה', C: EmblemPage },
  { id: 'fireworks', name: 'זיקוקים', C: FireworksPage },
  { id: 'balloons', name: 'בלונים כחול־לבן', C: BalloonsPage },
  { id: 'picnic', name: 'פיקניק', C: PicnicPage },
  { id: 'greeting', name: 'יום עצמאות שמח', C: Greeting },
]
export const ATZMAUT_SHEETS = [
  { id: 'count', name: 'כמה בלונים?', age: 'גן', C: CountBalloons },
  { id: 'match', name: 'מה זה? — התאמה', age: 'גן–א׳', C: MatchAtzmaut },
  { id: 'trace', name: 'מילים של יום העצמאות', age: 'גן–א׳', C: TraceAtzmaut },
  { id: 'color-flag', name: 'צובעים את הדגל', age: 'גן–ב׳', C: ColorTheFlag },
]
