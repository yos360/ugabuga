import { SAFE_OR_NOT } from '../../data/roadSafetyWeek'

// Road-safety line art and worksheets, drawn in code (thick outlines, white fills) —
// each one an A4 page, 600 × 820 with a title on top.
const FONT = 'Heebo, Arial, sans-serif'
const S = { fill: 'white', stroke: '#111', strokeWidth: 5, strokeLinejoin: 'round', strokeLinecap: 'round' }
const T = { fontFamily: FONT, fill: '#111', direction: 'rtl', textAnchor: 'middle' }

const Page = ({ title, sub = 'שם: ________________', children }) => <svg viewBox="0 0 600 820" role="img" aria-label={title} style={{ width: '100%', height: '100%', background: 'white' }}>
  <text x="300" y="56" {...T} fontSize="38" fontWeight="800">{title}</text>
  <text x="300" y="90" {...T} fontSize="16" fill="#333">{sub}</text>
  {children}
</svg>

// A limb or bar that can be coloured: black outline, white inside.
const Limb = ({ d, w = 24 }) => <g fill="none" strokeLinecap="round" strokeLinejoin="round"><path d={d} stroke="#111" strokeWidth={w} /><path d={d} stroke="white" strokeWidth={w - 9} /></g>

// A child standing with feet at (0,0); helmet optional.
export function Kid({ x, y, s = 1, helmet = false, hand = 'none' }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {hand !== 'left' && <Limb d="M24 -104 L44 -62" w={20} />}
    {hand !== 'right' && <Limb d="M-24 -104 L-44 -62" w={20} />}
    <Limb d="M-13 -50 V-6" w={22} /><Limb d="M13 -50 V-6" w={22} />
    <ellipse cx="-16" cy="-4" rx="15" ry="8" {...S} strokeWidth={4} /><ellipse cx="16" cy="-4" rx="15" ry="8" {...S} strokeWidth={4} />
    <path d="M-30 -112 Q-30 -122 -20 -122 H20 Q30 -122 30 -112 L34 -50 H-34 Z" {...S} strokeWidth={4.5} />
    <circle cx="0" cy="-152" r="32" {...S} strokeWidth={4.5} />
    {helmet
      ? <path d="M-36 -156 Q-36 -196 0 -198 Q36 -196 36 -156 Z M-14 -192 L-10 -176 M0 -196 V-178 M14 -192 L10 -176" {...S} strokeWidth={4} />
      : <path d="M-31 -160 Q-26 -190 0 -186 Q26 -190 31 -160 Q14 -172 0 -168 Q-14 -172 -31 -160 Z" {...S} strokeWidth={4} />}
    <circle cx="-11" cy="-150" r="3.5" fill="#111" /><circle cx="11" cy="-150" r="3.5" fill="#111" />
    <path d="M-10 -136 Q0 -128 10 -136" fill="none" stroke="#111" strokeWidth="3.5" strokeLinecap="round" />
  </g>
}

function VehicleLight({ x, y, s = 1 }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-22" y="360" width="44" height="300" rx="8" {...S} />
    <rect x="-75" y="0" width="150" height="370" rx="34" {...S} />
    {[70, 185, 300].map(cy => <g key={cy}><path d={`M-58 ${cy - 30} Q0 ${cy - 78} 58 ${cy - 30}`} fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" /><circle cx="0" cy={cy} r="46" {...S} /></g>)}
  </g>
}

function PedLight({ x, y, s = 1 }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-14" y="250" width="28" height="200" rx="6" {...S} />
    <rect x="-60" y="0" width="120" height="250" rx="22" {...S} />
    <circle cx="0" cy="65" r="46" {...S} /><circle cx="0" cy="185" r="46" {...S} />
    {/* standing figure (top) and walking figure (bottom) */}
    <circle cx="0" cy="38" r="8" {...S} strokeWidth={3.5} /><path d="M-10 50 H10 V78 H4 V98 H-4 V78 H-10 Z" {...S} strokeWidth={3.5} />
    <circle cx="4" cy="156" r="8" {...S} strokeWidth={3.5} /><path d="M0 168 L-6 194 L-18 214 M-4 192 L10 214 M2 170 L-16 186 M2 170 L18 184" fill="none" stroke="#111" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </g>
}

// A friendly car (side view, facing right) with face lights.
export function Car({ x, y, s = 1, kids = false }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M10 120 Q0 120 0 100 V70 Q0 56 18 54 L70 50 L110 8 Q118 0 132 0 H230 Q246 0 256 10 L300 52 L350 60 Q372 64 372 86 V100 Q372 120 352 120 Z" {...S} />
    <path d="M86 50 L120 16 Q124 12 132 12 H176 V50 Z" {...S} strokeWidth={4} />
    <path d="M190 12 H228 Q238 12 244 18 L282 50 H190 Z" {...S} strokeWidth={4} />
    {kids && <g><circle cx="150" cy="38" r="15" {...S} strokeWidth={3.5} /><circle cx="226" cy="36" r="17" {...S} strokeWidth={3.5} /><path d="M140 26 L162 54 M214 22 L240 54" stroke="#111" strokeWidth="5" strokeLinecap="round" /></g>}
    <path d="M182 60 V112" stroke="#111" strokeWidth="4" />
    <rect x="196" y="72" width="22" height="7" rx="3" {...S} strokeWidth={3} />
    <circle cx="346" cy="80" r="12" {...S} strokeWidth={4} /><circle cx="349" cy="80" r="4" fill="#111" />
    <path d="M330 104 Q346 112 362 102" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
    {[80, 290].map(cx => <g key={cx}><circle cx={cx} cy="120" r="36" {...S} /><circle cx={cx} cy="120" r="14" {...S} strokeWidth={4} /></g>)}
  </g>
}

const Sun = ({ x, y }) => <g><circle cx={x} cy={y} r="34" {...S} />{Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return <path key={i} d={`M${x + Math.cos(a) * 46} ${y + Math.sin(a) * 46} L${x + Math.cos(a) * 62} ${y + Math.sin(a) * 62}`} stroke="#111" strokeWidth="5" strokeLinecap="round" /> })}</g>
const Tree = ({ x, y }) => <g><rect x={x - 12} y={y - 70} width="24" height="70" {...S} strokeWidth={4} /><path d={`M${x} ${y - 190} q50 0 50 50 q22 30 -4 60 q-20 20 -46 10 q-26 10 -46 -10 q-26 -30 -4 -60 q0 -50 50 -50 Z`} {...S} strokeWidth={4} /></g>

function ColorLight() {
  return <Page title="רמזור">
    <VehicleLight x={210} y={130} />
    <PedLight x={440} y={330} />
    <text x="300" y="790" {...T} fontSize="20" fontWeight="700">למעלה אדום · באמצע צהוב · למטה ירוק</text>
  </Page>
}

function ColorCrossing() {
  return <Page title="חוצים יחד במעבר החצייה">
    <Sun x={90} y={170} /><Tree x={500} y={400} />
    <path d="M0 410 H600 M0 740 H600" stroke="#111" strokeWidth="5" />
    {[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x="150" y={430 + i * 52} width="300" height="30" rx="4" {...S} strokeWidth={4} />)}
    <Kid x={250} y={700} hand="left" />
    <g transform="translate(350 700) scale(1.45)"><Kid x={0} y={0} hand="right" /></g>
    <Limb d="M286 650 Q300 640 310 618" w={18} />
    <text x="300" y="790" {...T} fontSize="20" fontWeight="700">עד גיל 9 חוצים עם מבוגר — יד ביד</text>
  </Page>
}

function ColorBelt() {
  return <Page title="חוגרים חגורה — בכל נסיעה">
    <Sun x={500} y={170} />
    <Car x={40} y={360} s={1.4} kids />
    <path d="M0 560 H600" stroke="#111" strokeWidth="5" />
    {[30, 170, 310, 450].map(x => <rect key={x} x={x} y="600" width="90" height="14" rx="4" {...S} strokeWidth={3} />)}
    <text x="300" y="700" {...T} fontSize="22" fontWeight="700">כל מי שבמכונית חגור — גם מאחור</text>
    <text x="300" y="740" {...T} fontSize="18">ציירו גם את עצמכם בחלון, חגורים</text>
  </Page>
}

function ColorBike() {
  const wheel = cx => <g><circle cx={cx} cy="640" r="92" {...S} /><circle cx={cx} cy="640" r="70" fill="none" stroke="#111" strokeWidth="3" />{[0, 1, 2, 3].map(i => { const a = i * Math.PI / 4; return <path key={i} d={`M${cx - Math.cos(a) * 70} ${640 - Math.sin(a) * 70} L${cx + Math.cos(a) * 70} ${640 + Math.sin(a) * 70}`} stroke="#111" strokeWidth="3" /> })}<circle cx={cx} cy="640" r="12" {...S} strokeWidth={4} /></g>
  return <Page title="רוכבים עם קסדה">
    <Sun x={95} y={170} />
    {wheel(150)}{wheel(450)}
    <Limb d="M150 640 L290 640 L250 480 Z" w={22} />
    <Limb d="M290 640 L410 490 L250 480" w={22} />
    <Limb d="M410 470 L450 640" w={22} />
    <Limb d="M390 430 L410 470 M370 430 H420" w={20} />
    <ellipse cx="244" cy="470" rx="34" ry="12" {...S} strokeWidth={4} />
    <Limb d="M256 456 L300 330" w={46} />
    <Limb d="M296 350 L392 430" w={22} />
    <Limb d="M256 456 L320 540 L290 640" w={26} />
    <circle cx="320" cy="290" r="40" {...S} />
    <path d="M276 286 Q276 236 322 234 Q368 236 368 286 Z M300 244 L304 266 M322 236 V262 M344 244 L340 266" {...S} strokeWidth={4} />
    <path d="M286 296 L360 296" stroke="#111" strokeWidth="3" />
    <circle cx="336" cy="302" r="4" fill="#111" /><path d="M326 316 Q340 324 352 314" fill="none" stroke="#111" strokeWidth="3.5" strokeLinecap="round" />
    <text x="300" y="790" {...T} fontSize="20" fontWeight="700">קסדה — בכל רכיבה, גם קצרה</text>
  </Page>
}

function ColorStopCar() {
  return <Page title="המכונית עוצרת לילד">
    <path d="M0 330 H600 M0 640 H600" stroke="#111" strokeWidth="5" />
    {[0, 1, 2, 3, 4].map(i => <rect key={i} x="380" y={350 + i * 56} width="150" height="32" rx="4" {...S} strokeWidth={4} />)}
    <Car x={-10} y={440} s={0.95} />
    <Kid x={455} y={600} s={0.95} />
    <path d="M240 400 Q240 360 290 360 H360 Q400 360 400 396 Q400 430 360 430 H320 L300 452 L298 430 Q240 430 240 400 Z" {...S} strokeWidth={4} />
    <text x="320" y="405" {...T} fontSize="24" fontWeight="800">עוצרים!</text>
    <text x="300" y="720" {...T} fontSize="20" fontWeight="700">במעבר חצייה הנהג עוצר — והילד בודק שהמכונית באמת עצרה</text>
  </Page>
}

function Certificate() {
  return <Page title="תעודת הולך רגל זהיר" sub="שבוע זהירות בדרכים 2026">
    <rect x="30" y="110" width="540" height="680" rx="26" fill="none" stroke="#111" strokeWidth="5" />
    <rect x="46" y="126" width="508" height="648" rx="18" fill="none" stroke="#111" strokeWidth="2" strokeDasharray="10 7" />
    <VehicleLight x={300} y={150} s={0.42} />
    <text x="300" y="470" {...T} fontSize="24">מוענקת בזאת ל</text>
    <path d="M140 530 H460" stroke="#111" strokeWidth="3" />
    <text x="300" y="590" {...T} fontSize="20">שיודע/ת לחצות במעבר חצייה, מחכה לאור ירוק,</text>
    <text x="300" y="620" {...T} fontSize="20">חוגר/ת חגורה בכל נסיעה וחובש/ת קסדה ברכיבה</text>
    {[[160, 'כיתה'], [440, 'חתימה']].map(([x, l]) => <g key={l}><path d={`M${x - 80} 710 H${x + 80}`} stroke="#111" strokeWidth="3" /><text x={x} y="738" {...T} fontSize="17">{l}</text></g>)}
  </Page>
}

// Worksheets
function SheetLightMeaning() {
  return <Page title="מה אומר הרמזור?" sub="שם: ____________    כיתה: ______">
    <text x="300" y="130" {...T} fontSize="19" fontWeight="700">צבעו כל עיגול בצבע הנכון והשלימו את המשפט</text>
    {['אדום', 'צהוב', 'ירוק'].map((c, i) => <g key={c}>
      <circle cx="500" cy={230 + i * 170} r="60" {...S} />
      <text x="400" y={222 + i * 170} {...T} textAnchor="end" fontSize="24">כשדולק אור {c},</text>
      <text x="400" y={262 + i * 170} {...T} textAnchor="end" fontSize="24">המכוניות ____________</text>
    </g>)}
    <text x="300" y="740" {...T} fontSize="20">ברמזור להולכי רגל: האיש ה_______ אומר "חוצים",</text>
    <text x="300" y="776" {...T} fontSize="20">והאיש ה_______ אומר "מחכים על המדרכה".</text>
  </Page>
}

function SheetSafe() {
  const rows = SAFE_OR_NOT.slice(0, 10)
  return <Page title="בטוח או מסוכן?" sub="שם: ____________    כיתה: ______">
    <text x="300" y="128" {...T} fontSize="19" fontWeight="700">סמנו ✓ ליד מה שבטוח ו־✗ ליד מה שמסוכן</text>
    {rows.map(([t], i) => <g key={t}>
      <rect x="40" y={156 + i * 62} width="46" height="46" rx="10" {...S} strokeWidth={3.5} />
      <text x="550" y={188 + i * 62} {...T} textAnchor="start" fontSize="21">{i + 1}. {t}</text>
    </g>)}
  </Page>
}

function SheetSigns() {
  const shapes = [
    [<path key="t" d="M0 -46 L48 38 H-48 Z" {...S} />, 'אזהרה — יש סכנה לפניך'],
    [<path key="o" d="M-19 -46 H19 L46 -19 V19 L19 46 H-19 L-46 19 V-19 Z" {...S} />, 'עצור! — עצירה מלאה'],
    [<g key="c"><circle r="46" {...S} /><circle r="30" fill="none" stroke="#111" strokeWidth="3" /></g>, 'איסור או הגבלה'],
    [<circle key="b" r="46" {...S} strokeDasharray="10 6" />, 'הוראת חובה — עושים מה שמצויר'],
  ]
  const order = [2, 0, 3, 1]
  return <Page title="מה הצורה אומרת?" sub="שם: ____________    כיתה: ______">
    <text x="300" y="128" {...T} fontSize="19" fontWeight="700">מתחו קו מכל תמרור למשמעות שלו, וצבעו לפי המקרא</text>
    {shapes.map(([shape], i) => <g key={i}><g transform={`translate(490 ${230 + i * 150})`}>{shape}</g><circle cx="420" cy={230 + i * 150} r="7" fill="#111" /></g>)}
    {order.map((k, i) => <g key={k}><circle cx="240" cy={230 + i * 150} r="7" fill="#111" /><rect x="30" y={200 + i * 150} width="196" height="60" rx="12" {...S} strokeWidth={3} /><text x="128" y={237 + i * 150} {...T} fontSize="15" fontWeight="700">{shapes[k][1]}</text></g>)}
    <text x="300" y="790" {...T} fontSize="15">מקרא: משולש — מסגרת אדומה · מתומן — אדום · עיגול עם מסגרת אדומה — איסור · עיגול כחול — חובה</text>
  </Page>
}

function SheetWrite() {
  return <Page title="הכלל שלי לדרך" sub="שם: ____________    כיתה: ______">
    <text x="300" y="130" {...T} fontSize="19" fontWeight="700">ציירו את עצמכם שומרים על כלל בטיחות אחד, וכתבו אותו</text>
    <rect x="40" y="160" width="520" height="400" rx="20" fill="none" stroke="#111" strokeWidth="4" />
    {[620, 680, 740].map(y => <path key={y} d={`M50 ${y} H550`} stroke="#888" strokeWidth="2" />)}
    <text x="300" y="790" {...T} fontSize="16">למשל: "אני חוצה רק במעבר חצייה" · "אני חוגר חגורה גם מאחור"</text>
  </Page>
}

export const COLORING = [
  { id: 'light', name: 'רמזור', C: ColorLight },
  { id: 'crossing', name: 'חוצים יחד', C: ColorCrossing },
  { id: 'stop-car', name: 'המכונית עוצרת', C: ColorStopCar },
  { id: 'belt', name: 'חוגרים חגורה', C: ColorBelt },
  { id: 'bike', name: 'רוכבים עם קסדה', C: ColorBike },
  { id: 'certificate', name: 'תעודת הולך רגל זהיר', C: Certificate },
]
export const WORKSHEETS = [
  { id: 'light-meaning', name: 'מה אומר הרמזור?', age: 'א׳–ב׳', C: SheetLightMeaning },
  { id: 'safe', name: 'בטוח או מסוכן?', age: 'א׳–ג׳', C: SheetSafe },
  { id: 'signs', name: 'מה הצורה אומרת?', age: 'ג׳–ו׳', C: SheetSigns },
  { id: 'my-rule', name: 'הכלל שלי לדרך', age: 'כל הכיתות', C: SheetWrite },
]
