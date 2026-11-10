import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import { FONT } from '../../components/holidays/printKit'

// /holidays/hanukkah/toddler-story: an original picture story for ages 2–3 ("דובי חוגג חנוכה").
// Nine A4 pages, one short sentence and one big drawing per page, plus a "point and ask" question
// for the adult reading aloud. Coloured version, and an outline version to colour in.
const PATH = '/holidays/hanukkah/toddler-story'

const C = (on, c) => (on ? c : 'white')
const K = { stroke: '#111', strokeWidth: 4, strokeLinejoin: 'round', strokeLinecap: 'round' }
const K3 = { ...K, strokeWidth: 3 }

// Teddy bear drawn around (0,0); about 200 wide and 260 tall.
function Bear({ x, y, s = 1, color, hug = false, sugar = false }) {
  const fur = C(color, '#c08552'), light = C(color, '#f3d9b1')
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="-30" cy="128" rx="24" ry="16" fill={fur} {...K} />
    <ellipse cx="30" cy="128" rx="24" ry="16" fill={fur} {...K} />
    <ellipse cx="0" cy="68" rx="58" ry="64" fill={fur} {...K} />
    <ellipse cx="0" cy="80" rx="34" ry="38" fill={light} {...K3} />
    {hug
      ? <><path d="M-52 40 Q-110 0 -96 -40" fill="none" {...K} strokeWidth="26" stroke="#111" /><path d="M-52 40 Q-110 0 -96 -40" fill="none" strokeWidth="18" stroke={fur} strokeLinecap="round" />
        <path d="M52 40 Q110 0 96 -40" fill="none" {...K} strokeWidth="26" stroke="#111" /><path d="M52 40 Q110 0 96 -40" fill="none" strokeWidth="18" stroke={fur} strokeLinecap="round" /></>
      : <><ellipse cx="-58" cy="62" rx="16" ry="32" transform="rotate(20 -58 62)" fill={fur} {...K} /><ellipse cx="58" cy="62" rx="16" ry="32" transform="rotate(-20 58 62)" fill={fur} {...K} /></>}
    <circle cx="-50" cy="-72" r="26" fill={fur} {...K} />
    <circle cx="50" cy="-72" r="26" fill={fur} {...K} />
    <circle cx="-50" cy="-72" r="12" fill={light} {...K3} />
    <circle cx="50" cy="-72" r="12" fill={light} {...K3} />
    <circle cx="0" cy="-30" r="62" fill={fur} {...K} />
    <ellipse cx="0" cy="-8" rx="26" ry="20" fill={light} {...K3} />
    <ellipse cx="0" cy="-17" rx="9" ry="7" fill="#111" />
    {sugar && <g fill="white" stroke="#111" strokeWidth="1.5">{[[-6, -27], [5, -29], [0, -33], [9, -24], [-9, -22]].map(([a, b]) => <circle key={a + ' ' + b} cx={a} cy={b} r="3" />)}</g>}
    <path d="M-10 2 Q0 12 10 2" fill="none" {...K3} />
    <circle cx="-22" cy="-42" r="7" fill="#111" />
    <circle cx="22" cy="-42" r="7" fill="#111" />
    <circle cx="-20" cy="-44" r="2" fill="white" />
    <circle cx="24" cy="-44" r="2" fill="white" />
    {color && <><circle cx="-38" cy="-14" r="8" fill="#f9a8a8" opacity=".7" /><circle cx="38" cy="-14" r="8" fill="#f9a8a8" opacity=".7" /></>}
  </g>
}

// A grown-up drawn with the feet at (0,0); about 300 tall.
function Grownup({ x, y, s = 1, color, shirt, hair, long = false, gray = false, glasses = false }) {
  const skin = C(color, '#f5c9a0'), h = C(color, gray ? '#cbd5e1' : hair)
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-34" y="-110" width="26" height="110" rx="10" fill={C(color, '#334155')} {...K} />
    <rect x="8" y="-110" width="26" height="110" rx="10" fill={C(color, '#334155')} {...K} />
    {long && <ellipse cx="0" cy="-232" rx="46" ry="58" fill={h} {...K} />}
    <path d="M-50 -100 L-42 -200 Q0 -214 42 -200 L50 -100 Z" fill={C(color, shirt)} {...K} />
    <path d="M-42 -196 L-66 -120" fill="none" {...K} strokeWidth="22" />
    <path d="M-42 -196 L-66 -120" fill="none" stroke={C(color, shirt)} strokeWidth="14" strokeLinecap="round" />
    <path d="M42 -196 L66 -120" fill="none" {...K} strokeWidth="22" />
    <path d="M42 -196 L66 -120" fill="none" stroke={C(color, shirt)} strokeWidth="14" strokeLinecap="round" />
    <circle cx="-66" cy="-116" r="10" fill={skin} {...K3} />
    <circle cx="66" cy="-116" r="10" fill={skin} {...K3} />
    <circle cx="0" cy="-246" r="38" fill={skin} {...K} />
    <path d="M-38 -250 Q-36 -292 0 -290 Q36 -292 38 -250 Q20 -268 0 -264 Q-20 -268 -38 -250 Z" fill={h} {...K3} />
    {gray && <circle cx="0" cy="-292" r="15" fill={h} {...K3} />}
    <circle cx="-13" cy="-248" r="4" fill="#111" />
    <circle cx="13" cy="-248" r="4" fill="#111" />
    {glasses && <g fill="none" {...K3} strokeWidth="2.5"><circle cx="-13" cy="-248" r="10" /><circle cx="13" cy="-248" r="10" /><path d="M-3 -248 H3" /></g>}
    <path d="M-12 -230 Q0 -220 12 -230" fill="none" {...K3} />
  </g>
}

// Hanukkiah drawn around (0,0), bar at y=0. `lit` candles burn (counted from the right), plus the shamash.
const HOLD = [126, 96, 66, 36, -36, -66, -96, -126]
function Flame({ x, y, color }) {
  return <g>
    <path d={`M${x} ${y - 30} C${x + 13} ${y - 14} ${x + 9} ${y} ${x} ${y} C${x - 9} ${y} ${x - 13} ${y - 14} ${x} ${y - 30} Z`} fill={C(color, '#fb923c')} {...K3} />
    <path d={`M${x} ${y - 16} C${x + 5} ${y - 8} ${x + 4} ${y - 2} ${x} ${y - 2} C${x - 4} ${y - 2} ${x - 5} ${y - 8} ${x} ${y - 16} Z`} fill={C(color, '#fde68a')} />
  </g>
}
const CANDLES = ['#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb923c', '#22d3ee', '#f87171']
function Hanukkiah({ x, y, s = 1, color, lit = 0, candles = lit }) {
  const gold = C(color, '#f6c453')
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-9" y="0" width="18" height="96" fill={gold} {...K} />
    <path d="M-60 120 H60 L44 94 H-44 Z" fill={gold} {...K} />
    <rect x="-150" y="-6" width="300" height="16" rx="7" fill={gold} {...K} />
    <rect x="-10" y="-40" width="20" height="36" fill={gold} {...K} />
    {HOLD.map((hx, i) => <g key={hx}>
      {i < candles && <rect x={hx - 8} y="-52" width="16" height="44" fill={C(color, CANDLES[i])} {...K3} />}
      {i < lit && <Flame x={hx} y={-54} color={color} />}
      <path d={`M${hx - 13} -8 H${hx + 13} L${hx + 9} 2 H${hx - 9} Z`} fill={gold} {...K3} />
    </g>)}
    {(candles > 0 || lit > 0) && <rect x="-8" y="-86" width="16" height="44" fill={C(color, '#93c5fd')} {...K3} />}
    {lit > 0 && <Flame x={0} y={-88} color={color} />}
    <path d="M-13 -44 H13 L9 -34 H-9 Z" fill={gold} {...K3} />
  </g>
}

function Sevivon({ x, y, s = 1, color, tilt = 0 }) {
  return <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <rect x="-8" y="-86" width="16" height="30" rx="5" fill={C(color, '#a78bfa')} {...K} />
    <path d="M-44 -58 H44 V10 L0 52 L-44 10 Z" fill={C(color, '#60a5fa')} {...K} />
    <text x="0" y="-6" textAnchor="middle" fontFamily={FONT} fontSize="46" fontWeight="900" fill="#111">נ</text>
  </g>
}

function Donut({ x, y, s = 1, color }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="8" rx="44" ry="30" fill={C(color, '#d6893f')} {...K} />
    <path d="M-40 0 Q-30 -20 0 -22 Q30 -20 40 0 Q20 -6 0 -6 Q-20 -6 -40 0 Z" fill="white" {...K3} />
    <circle cx="0" cy="-16" r="9" fill={C(color, '#dc2626')} {...K3} />
  </g>
}

function Plate({ x, y, color }) {
  return <g>
    <ellipse cx={x} cy={y + 30} rx="100" ry="22" fill={C(color, '#e0f2fe')} {...K} />
    <Donut x={x - 45} y={y + 6} s={.8} color={color} />
    <Donut x={x + 45} y={y + 6} s={.8} color={color} />
    <Donut x={x} y={y - 16} s={.8} color={color} />
  </g>
}

// Night window with a moon and stars; the sill is at y + h.
function Window({ x, y, w = 260, h = 220, color }) {
  return <g>
    <rect x={x} y={y} width={w} height={h} fill={C(color, '#1e3a8a')} {...K} />
    <circle cx={x + w - 50} cy={y + 50} r="24" fill={C(color, '#fef3c7')} {...K3} />
    <circle cx={x + w - 38} cy={y + 42} r="22" fill={C(color, '#1e3a8a')} stroke="none" />
    {[[40, 40], [90, 80], [60, 140], [150, 50], [120, 160]].map(([a, b]) => <path key={a + ' ' + b} d={`M${x + a} ${y + b - 9} L${x + a + 3} ${y + b - 3} L${x + a + 9} ${y + b} L${x + a + 3} ${y + b + 3} L${x + a} ${y + b + 9} L${x + a - 3} ${y + b + 3} L${x + a - 9} ${y + b} L${x + a - 3} ${y + b - 3} Z`} fill={C(color, '#fde68a')} stroke="#111" strokeWidth="1.5" />)}
    <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}`} fill="none" {...K} />
    <rect x={x - 16} y={y + h} width={w + 32} height="18" rx="6" fill={C(color, '#e7d3b5')} {...K} />
  </g>
}

const Note = ({ x, y, color }) => <g transform={`translate(${x} ${y})`}><path d="M0 0 V-40 L22 -46 V-6" fill="none" {...K3} /><ellipse cx="-6" cy="2" rx="9" ry="7" fill={C(color, '#a78bfa')} {...K3} /><ellipse cx="16" cy="-4" rx="9" ry="7" fill={C(color, '#a78bfa')} {...K3} /></g>
const Heart = ({ x, y, s = 1, color }) => <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 14 C-30 -6 -22 -30 0 -16 C22 -30 30 -6 0 14 Z" fill={C(color, '#f472b6')} {...K3} />
const Floor = ({ y = 590, color }) => <path d={`M30 ${y} H570`} fill="none" stroke={color ? '#cbd5e1' : '#999'} strokeWidth="4" strokeLinecap="round" />

const PAGES = [
  { lines: ['זה דובי.', 'היום חנוכה, ודובי שמח!'], ask: 'איפה האוזניים של דובי?', art: c => <><Floor color={c} /><Bear x={300} y={400} s={1.35} color={c} /><Sevivon x={110} y={540} s={.7} tilt={-12} color={c} /><Donut x={490} y={560} s={.9} color={c} /></> },
  { lines: ['בחוץ כבר חושך.', 'אבא שם את החנוכייה ליד החלון.'], ask: 'איפה הירח?', art: c => <><Floor color={c} /><Window x={70} y={130} color={c} /><Hanukkiah x={200} y={300} s={.62} color={c} candles={1} /><Grownup x={450} y={590} s={1.25} color={c} shirt="#3b82f6" hair="#5b3a1e" /><Bear x={200} y={470} s={.6} color={c} /></> },
  { lines: ['אמא מדליקה את השמש,', 'והשמש מדליק נר אחד. איזה אור!'], ask: 'איפה האש הקטנה?', art: c => <><Floor color={c} /><Hanukkiah x={300} y={300} s={1.25} color={c} lit={1} /><Grownup x={485} y={590} s={1} color={c} shirt="#ec4899" hair="#7c2d12" long /><Bear x={120} y={470} s={.62} color={c} /></> },
  { lines: ['בנרות לא נוגעים.', 'רק מסתכלים, ואומרים: וואו!'], ask: 'בואו נגיד יחד: וואו!', art: c => <><Floor color={c} /><Hanukkiah x={390} y={330} s={.95} color={c} lit={1} /><Bear x={150} y={420} s={1} color={c} /><text x="150" y="190" textAnchor="middle" fontFamily={FONT} fontSize="44" fontWeight="900" fill="#111">וואו!</text></> },
  { lines: ['כולם שרים שירי חנוכה,', 'ודובי מוחא כפיים: כף, כף, כף!'], ask: 'בואו נמחא כפיים כמו דובי.', art: c => <><Floor color={c} /><Grownup x={110} y={590} s={.95} color={c} shirt="#3b82f6" hair="#5b3a1e" /><Grownup x={490} y={590} s={.95} color={c} shirt="#ec4899" hair="#7c2d12" long /><Bear x={300} y={420} s={.95} color={c} hug /><Note x={210} y={190} color={c} /><Note x={380} y={160} color={c} /><text x="300" y="150" textAnchor="middle" fontFamily={FONT} fontSize="34" fontWeight="900" fill="#111">כף! כף!</text></> },
  { lines: ['סבתא מביאה סופגניות.', 'אממם, מתוק! לדובי יש סוכר על האף.'], ask: 'איפה האף שלך?', art: c => <><Floor color={c} /><Grownup x={450} y={590} s={1.15} color={c} shirt="#22c55e" gray glasses /><Plate x={450} y={360} color={c} /><Bear x={170} y={420} s={1} color={c} sugar /></> },
  { lines: ['דובי מסובב סביבון.', 'הוא מסתובב, מסתובב... ונופל!'], ask: 'בואו נסתובב כמו סביבון.', art: c => <><Floor color={c} /><Bear x={170} y={420} s={1} color={c} /><Sevivon x={420} y={520} s={1.3} tilt={18} color={c} /><path d="M330 470 Q420 420 510 470" fill="none" {...K3} strokeDasharray="10 10" /><path d="M330 560 Q420 610 510 560" fill="none" {...K3} strokeDasharray="10 10" /></> },
  { lines: ['בכל ערב מוסיפים עוד נר.', 'אחד, שניים, שלושה... עד שמונה!'], ask: 'בואו נספור באצבעות עד שמונה.', art: c => <><Floor color={c} /><Hanukkiah x={300} y={300} s={1.25} color={c} lit={8} /><Bear x={300} y={470} s={.55} color={c} /></> },
  { lines: ['דובי מחבק את אמא ואת אבא.', 'חג חנוכה שמח!'], ask: 'ומי מחבק אותך?', art: c => <><Floor color={c} /><Grownup x={160} y={590} s={1.05} color={c} shirt="#3b82f6" hair="#5b3a1e" /><Grownup x={440} y={590} s={1.05} color={c} shirt="#ec4899" hair="#7c2d12" long /><Bear x={300} y={440} s={.85} color={c} hug /><Heart x={300} y={150} s={2} color={c} /><Heart x={230} y={200} s={1} color={c} /><Heart x={370} y={200} s={1} color={c} /></> },
]

function StoryPage({ i, color }) {
  const p = PAGES[i]
  return <svg viewBox="0 0 600 820" role="img" aria-label={p.lines.join(' ')} style={{ width: '100%', height: '100%', background: 'white' }}>
    <rect x="12" y="12" width="576" height="796" rx="26" fill="none" stroke={color ? '#fbbf24' : '#bbb'} strokeWidth="5" />
    {p.art(color)}
    {p.lines.map((l, k) => <text key={k} x="300" y={662 + k * 46} textAnchor="middle" fontFamily={FONT} fontSize={k === 0 ? 34 : 30} fontWeight="800" fill="#111" direction="rtl">{l}</text>)}
    <text x="300" y="768" textAnchor="middle" fontFamily={FONT} fontSize="17" fill="#555" direction="rtl">{'שאלה לילדים: ' + p.ask}</text>
    <text x="300" y="796" textAnchor="middle" fontFamily={FONT} fontSize="14" fill="#888">{i + 2}</text>
  </svg>
}

function Cover({ color }) {
  return <svg viewBox="0 0 600 820" role="img" aria-label="דובי חוגג חנוכה — סיפור לחנוכה לפעוטות" style={{ width: '100%', height: '100%', background: 'white' }}>
    <rect x="12" y="12" width="576" height="796" rx="26" fill={color ? '#fffbeb' : 'white'} stroke={color ? '#fbbf24' : '#bbb'} strokeWidth="5" />
    <text x="300" y="120" textAnchor="middle" fontFamily={FONT} fontSize="62" fontWeight="900" fill="#111" direction="rtl">דובי חוגג חנוכה</text>
    <text x="300" y="168" textAnchor="middle" fontFamily={FONT} fontSize="22" fill="#444" direction="rtl">סיפור קטן לחנוכה, לגיל שנתיים־שלוש</text>
    <Hanukkiah x={300} y={330} s={1} color={color} lit={3} />
    <Bear x={300} y={560} s={.95} color={color} hug />
    <Sevivon x={110} y={690} s={.6} tilt={-14} color={color} />
    <Donut x={490} y={705} s={.85} color={color} />
    <text x="300" y="776" textAnchor="middle" fontFamily={FONT} fontSize="18" fill="#444" direction="rtl">הסיפור של: ____________________</text>
  </svg>
}

const ALL = [{ id: 'cover', name: 'כריכה', C: Cover }, ...PAGES.map((p, i) => ({ id: 'p' + i, name: `עמוד ${i + 2}`, C: ({ color }) => <StoryPage i={i} color={color} /> }))]

const FAQ = [
  { q: 'לאיזה גיל מתאים הסיפור?', a: 'לגיל שנתיים עד שלוש, וגם לגן טרום־טרום חובה. בכל עמוד יש משפט אחד או שניים קצרים וציור אחד גדול, בלי פרטים קטנים, כך שקל להראות אותו לקבוצת ילדים במעגל.' },
  { q: 'איך מקריאים סיפור לפעוטות?', a: 'מחזיקים את הדף כך שכל הילדים רואים, קוראים את המשפט לאט, ואז שואלים את השאלה שבתחתית העמוד: איפה הירח, איפה האף שלך, בואו נמחא כפיים. בגיל הזה הילדים לומדים בעיקר מהשאלות ומהתנועות, לא מהמילים.' },
  { q: 'אפשר להדפיס את הסיפור בשחור־לבן?', a: 'כן. יש גרסה צבעונית וגרסה בקווים בלבד. את הגרסה בקווים אפשר לתת לכל ילד לצבוע, להדק לספרון ולשלוח הביתה עם השם שלו על הכריכה.' },
  { q: 'יש בסיפור את סיפור המכבים?', a: 'לא. לגיל שנתיים־שלוש הסיפור מתמקד במה שהילד רואה ועושה בחג: חנוכייה, נרות, שירים, סופגניות וסביבון. את סיפור המכבים ונס פך השמן כדאי להשאיר לגיל הגן. יש באתר גם סיכום של סיפור חנוכה למבוגרים ולילדים גדולים.' },
]

export default function HanukkahToddlerStory() {
  const [color, setColor] = useState(true), [print, setPrint] = useState(null)
  const chip = on => `min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-slate-800 bg-amber-200' : 'border-[var(--border)] bg-white'}`
  return <HanukkahShell crumb="סיפור חנוכה לפעוטות">
    <SEO title="סיפור חנוכה לפעוטות להדפסה — דובי חוגג חנוכה (גיל 2–3)" description="סיפור חנוכה קצר לפעוטות להדפסה בחינם: דובי חוגג חנוכה. 10 עמודים עם משפט קצר וציור גדול בכל עמוד, ושאלה לילדים בתחתית. לגננות, למטפלות ולהורים, בצבע או לצביעה." path={PATH} structuredData={faqSchema(FAQ)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🧸 סיפור חנוכה לפעוטות להדפסה</h1>
    <p className="mx-auto mb-5 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">"דובי חוגג חנוכה": סיפור קצר לגיל שנתיים־שלוש. בכל עמוד משפט אחד או שניים וציור אחד גדול. בתחתית העמוד יש שאלה שאפשר לשאול את הילדים בזמן ההקראה.</p>
    <div className="mb-5 flex flex-wrap justify-center gap-2" role="group" aria-label="גרסה">
      <button type="button" aria-pressed={color} onClick={() => setColor(true)} className={chip(color)}>🎨 צבעוני</button>
      <button type="button" aria-pressed={!color} onClick={() => setColor(false)} className={chip(!color)}>🖍️ לצביעה (קווים בלבד)</button>
    </div>
    <div className="mb-6 flex flex-wrap justify-center gap-2">
      <button data-print-main type="button" onClick={() => setPrint({ color })} className="min-h-[52px] rounded-2xl bg-amber-600 px-6 text-xl font-bold text-white">🖨️ הדפסת הסיפור (10 דפים)</button>
    </div>
    <div className="mx-auto mb-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
      {ALL.map(p => <figure key={p.id} className="rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm">
        <div className="aspect-[600/820]"><p.C color={color} /></div>
        <figcaption className="mt-1 text-sm font-bold">{p.name}</figcaption>
      </figure>)}
    </div>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-5">
      <h2 className="mb-3 text-2xl font-bold">📖 איך מקריאים לגיל שנתיים־שלוש</h2>
      <ul className="list-disc space-y-2 pr-6 text-lg">
        <li>מקריאים לאט, משפט אחד בכל עמוד, ומחכים שכל הילדים יראו את הציור.</li>
        <li>אחרי כל עמוד שואלים את השאלה שבתחתית: הילדים מצביעים, מוחאים כפיים או מסתובבים כמו סביבון. התנועה היא חלק מהסיפור.</li>
        <li>בגיל הזה אוהבים לשמוע את אותו סיפור שוב ושוב. בפעם השנייה עוצרים לפני המילה האחרונה ונותנים לילדים להשלים.</li>
        <li>מדפיסים את גרסת הקווים, כל ילד צובע, מהדקים בצד — ויש ספרון לקחת הביתה.</li>
      </ul>
    </section>

    {print && <PrintPreview title="דובי חוגג חנוכה" onClose={() => setPrint(null)}>
      {ALL.map(p => <article className="buga-a4" key={p.id}><div className="print-art"><p.C color={print.color} /></div></article>)}
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לפעוטות ולגן: <Link className="font-bold underline" to="/holidays/hanukkah/coloring">דפי צביעה לחנוכה</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/songs">שירי חנוכה</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/grade/kindergarten">פעילות לחנוכה לגן</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'סיפור חנוכה לפעוטות צריך להיות קצר מאוד: משפט אחד בכל עמוד, ציור אחד גדול, ומשהו לעשות. "דובי חוגג חנוכה" הוא סיפור מקורי של עוגה בוגה בעשרה עמודים: דובי רואה את החנוכייה ליד החלון, מסתכל על הנרות בלי לגעת, שר ומוחא כפיים, אוכל סופגנייה ומסובב סביבון.',
      'הסיפור מתאים לפעוטון, למשפחתון ולגן טרום־טרום חובה, וגם להקראה בבית לפני ההדלקה. אפשר להדפיס אותו בצבע ולהראות לקבוצה במעגל, או להדפיס בקווים בלבד, לתת לכל ילד לצבוע ולהדק לספרון אישי עם השם על הכריכה.',
    ]} faq={FAQ} related={[{ label: 'חנוכה לילדים', href: '/holidays/hanukkah' }, { label: 'דפי צביעה לחנוכה', href: '/holidays/hanukkah/coloring' }, { label: 'פעילות לחנוכה לגן', href: '/holidays/hanukkah/grade/kindergarten' }]} /></div>
  </HanukkahShell>
}
