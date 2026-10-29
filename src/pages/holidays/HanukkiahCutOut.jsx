import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import { Page, FONT } from '../../components/holidays/printKit'

// /holidays/hanukkah/cut-out-hanukkiah: a two-page printable — an A4 hanukkiah base with 8 numbered
// holders and a raised shamash, and an A4 sheet of 9 candles (flame attached) to cut out and glue on,
// one per night. Both pages use the same 600 × 820 viewBox, so the candles fit the dashed slots exactly.
// Two versions: coloured, and an outline version to colour in.
const PATH = '/holidays/hanukkah/cut-out-hanukkiah'

// Holder n (1–8) from right to left; the shamash stands raised in the middle.
const HOLDERS = [545, 490, 435, 380, 220, 165, 110, 55]
const SHAMASH_X = 300, CUP_Y = 400, SHAMASH_Y = 345
const BODY = 130
const CANDLE_COLORS = ['#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#fb923c', '#22d3ee', '#f87171']
const SHAMASH_COLOR = '#93c5fd'
const GOLD = '#f6c453'

// One piece: candle body with the flame joined on top (no thin neck, so it is easy to cut).
const candlePath = (x, yb) => {
  const yt = yb - BODY
  return `M${x - 20} ${yb} V${yt} H${x - 10} C${x - 22} ${yt - 20} ${x - 6} ${yt - 34} ${x} ${yt - 52} C${x + 6} ${yt - 34} ${x + 22} ${yt - 20} ${x + 10} ${yt} H${x + 20} V${yb} Z`
}
const T = ({ x, y, size = 16, weight = 700, fill = '#111', children }) => <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={weight} fill={fill} direction="rtl">{children}</text>

function Candle({ x, yb, label, fill, color }) {
  const yt = yb - BODY
  return <g>
    <rect x={x - 20} y={yt} width="40" height={BODY} fill={color ? fill : 'white'} />
    <path d={`M${x - 10} ${yt} C${x - 22} ${yt - 20} ${x - 6} ${yt - 34} ${x} ${yt - 52} C${x + 6} ${yt - 34} ${x + 22} ${yt - 20} ${x + 10} ${yt} Z`} fill={color ? '#fb923c' : 'white'} />
    <path d={`M${x} ${yt - 30} C${x + 9} ${yt - 16} ${x + 6} ${yt - 4} ${x} ${yt - 3} C${x - 6} ${yt - 4} ${x - 9} ${yt - 16} ${x} ${yt - 30} Z`} fill={color ? '#fde68a' : 'white'} stroke="#111" strokeWidth="1.5" />
    <path d={`M${x - 20} ${yt} H${x + 20} M${x - 20} ${yt + 28} L${x + 20} ${yt + 16} M${x - 20} ${yb - 16} L${x + 20} ${yb - 28}`} stroke="#111" strokeWidth="2" fill="none" />
    <circle cx={x} cy={yt + 68} r="15" fill="white" stroke="#111" strokeWidth="2" />
    <T x={x} y={yt + 75} size={label === 'ש' ? 17 : 20} weight={900}>{label}</T>
    <path d={candlePath(x, yb)} fill="none" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
  </g>
}

function Slot({ x, yb, label, color }) {
  return <g>
    <path d={candlePath(x, yb)} fill="none" stroke={color ? '#94a3b8' : '#999'} strokeWidth="2" strokeDasharray="6 5" />
    <T x={x} y={yb - 45} size={30} weight={900} fill={color ? '#cbd5e1' : '#ccc'}>{label}</T>
  </g>
}

const Cup = ({ x, yb, fill }) => <path d={`M${x - 26} ${yb} H${x + 26} L${x + 18} ${yb + 22} H${x - 18} Z`} fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
const Arch = ({ d, fill }) => <g><path d={d} fill="none" stroke="#111" strokeWidth="14" strokeLinecap="round" /><path d={d} fill="none" stroke={fill} strokeWidth="8" strokeLinecap="round" /></g>

function BasePage({ color }) {
  const fill = color ? GOLD : 'white'
  return <Page title="חנוכייה לגזירה — הבסיס" sub={color ? 'מדביקים כל ערב נר אחד על המקום המקווקו עם אותו מספר' : 'צובעים את החנוכייה, ומדביקים כל ערב נר אחד על המקום המקווקו'}>
    {HOLDERS.map((x, i) => <Slot key={x} x={x} yb={CUP_Y} label={i + 1} color={color} />)}
    <Slot x={SHAMASH_X} yb={SHAMASH_Y} label="ש" color={color} />
    {/* arches and stem first, so the bar and cups sit on top */}
    <Arch d="M60 444 Q60 572 290 572" fill={fill} />
    <Arch d="M540 444 Q540 572 310 572" fill={fill} />
    <Arch d="M170 444 Q170 518 290 518" fill={fill} />
    <Arch d="M430 444 Q430 518 310 518" fill={fill} />
    <rect x="284" y="440" width="32" height="210" rx="6" fill={fill} stroke="#111" strokeWidth="3" />
    {[600, 622].map(y => <circle key={y} cx="300" cy={y} r="6" fill={color ? '#b45309' : 'white'} stroke="#111" strokeWidth="2" />)}
    <path d="M180 696 H420 L388 646 H212 Z" fill={fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
    <T x={300} y={680} size={20} weight={900}>חנוכה שמח</T>
    <rect x="288" y={SHAMASH_Y + 20} width="24" height={440 - SHAMASH_Y - 20} fill={fill} stroke="#111" strokeWidth="3" />
    <rect x="25" y="422" width="550" height="22" rx="8" fill={fill} stroke="#111" strokeWidth="3" />
    {HOLDERS.map((x, i) => <g key={x}><Cup x={x} yb={CUP_Y} fill={fill} /><T x={x} y={439} size={15} weight={900}>{i + 1}</T></g>)}
    <Cup x={SHAMASH_X} yb={SHAMASH_Y} fill={fill} />
    <T x={300} y={154} size={15} weight={800}>שמש</T>
    <T x={300} y={740} size={16} weight={400}>נר 1 עומד בצד ימין. בכל ערב מוסיפים נר אחד חדש — משמאל לנרות של אתמול.</T>
    <T x={300} y={766} size={16} weight={400}>בחנוכייה אמיתית מדליקים בעזרת השמש, ומתחילים מהנר החדש.</T>
  </Page>
}

function CandlesPage({ color }) {
  const row1 = [500, 400, 300, 200, 100], row2 = [500, 400, 300]
  return <Page title="חנוכייה לגזירה — 9 נרות" sub={color ? 'גוזרים כל נר לאורך הקו השחור — הלהבה נשארת מחוברת' : 'צובעים את הנרות, ואז גוזרים כל נר לאורך הקו השחור'}>
    {row1.map((x, i) => <Candle key={x} x={x} yb={360} label={i + 1} fill={CANDLE_COLORS[i]} color={color} />)}
    {row2.map((x, i) => <Candle key={'b' + x} x={x} yb={610} label={i + 6} fill={CANDLE_COLORS[i + 5]} color={color} />)}
    <Candle x={150} yb={610} label="ש" fill={SHAMASH_COLOR} color={color} />
    <T x={150} y={636} size={15} weight={800}>השמש</T>
    <text x="40" y="200" fontSize="24" textAnchor="middle">✂️</text>
    <T x={300} y={690} size={16} weight={400}>ערב ראשון: מדביקים את השמש ואת נר 1.</T>
    <T x={300} y={716} size={16} weight={400}>בכל ערב אחר מדביקים עוד נר — נר 2 בערב השני, וכך עד נר 8.</T>
    <T x={300} y={748} size={14} weight={400}>חנוכיית נייר היא לקישוט בלבד — לא מניחים לידה נרות אמיתיים.</T>
  </Page>
}

const PAGES = [
  { id: 'base', name: 'דף 1: החנוכייה', C: BasePage },
  { id: 'candles', name: 'דף 2: 9 נרות לגזירה', C: CandlesPage },
]

const FAQ = [
  { q: 'איך משתמשים בחנוכייה לגזירה?', a: 'מדפיסים שני דפים: דף החנוכייה ודף הנרות. גוזרים את תשעת הנרות ושומרים אותם במעטפה. בערב הראשון מדביקים את השמש ואת נר 1, ובכל ערב מדביקים עוד נר על המקום המקווקו עם אותו מספר — עד שבערב השמיני החנוכייה מלאה.' },
  { q: 'באיזה סדר מדביקים את הנרות?', a: 'כמו בחנוכייה אמיתית: הנר הראשון עומד בצד ימין, ובכל ערב מוסיפים נר חדש משמאל לנרות של אתמול. לכן המספרים על החנוכייה רצים מימין לשמאל. כשמדליקים נרות אמיתיים, מדליקים בעזרת השמש ומתחילים מהנר החדש — השמאלי ביותר.' },
  { q: 'לאיזה גיל זה מתאים, ועל איזה נייר כדאי להדפיס?', a: 'לגן ולכיתות א׳–ב׳. הנרות רחבים ובלי חלקים דקים, כך שקל לגזור אותם במספריים של ילדים. נייר רגיל מספיק, ונייר עבה יותר מחזיק טוב יותר על המקרר או על הקיר. יש גרסה צבעונית וגרסה בקווים בלבד לצביעה.' },
]

export default function HanukkiahCutOut() {
  const [color, setColor] = useState(true), [print, setPrint] = useState(null)
  const chip = on => `min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-slate-800 bg-blue-200' : 'border-[var(--border)] bg-white'}`
  return <HanukkahShell crumb="חנוכייה לגזירה">
    <SEO title="חנוכייה להדפסה וגזירה — 9 נרות להדבקה, נר בכל ערב" description="חנוכייה להדפסה ולגזירה לילדים: דף A4 עם חנוכייה ושמונה מקומות ממוספרים ושמש, ודף עם 9 נרות לגזירה. מדביקים כל ערב נר אחד ולומדים את סדר הנרות. גרסה צבעונית וגרסה לצביעה, בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🕎 חנוכייה להדפסה וגזירה</h1>
    <p className="mx-auto mb-5 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">דף אחד עם חנוכייה, ודף עם 9 נרות לגזירה. בכל ערב של חנוכה הילדים מדביקים נר אחד — וכך רואים איך החנוכייה מתמלאת.</p>
    <div className="mb-5 flex flex-wrap justify-center gap-2" role="group" aria-label="גרסה">
      <button type="button" aria-pressed={color} onClick={() => setColor(true)} className={chip(color)}>🎨 צבעונית</button>
      <button type="button" aria-pressed={!color} onClick={() => setColor(false)} className={chip(!color)}>🖍️ לצביעה (קווים בלבד)</button>
    </div>
    <div className="mb-4 flex flex-wrap justify-center gap-2">
      <button data-print-main type="button" onClick={() => setPrint({ color, pages: PAGES })} className="min-h-[52px] rounded-2xl bg-blue-700 px-6 text-xl font-bold text-white">🖨️ הדפסת 2 הדפים</button>
      <button type="button" onClick={() => setPrint({ both: true, pages: PAGES })} className="min-h-[52px] rounded-2xl border-2 border-slate-800 bg-white px-5 text-lg font-bold">שתי הגרסאות (4 דפים)</button>
    </div>
    <div className="mx-auto mb-10 grid max-w-3xl gap-4 sm:grid-cols-2">
      {PAGES.map(p => <button key={p.id} type="button" onClick={() => setPrint({ color, pages: [p] })} aria-label={`הדפסה: ${p.name}`}
        className="mx-auto w-full max-w-sm rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
        <div className="aspect-[600/820]"><p.C color={color} /></div>
        <p className="mt-1 font-bold">{p.name}</p>
      </button>)}
    </div>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-blue-50 p-5">
      <h2 className="mb-3 text-2xl font-bold">✂️ איך מכינים</h2>
      <ol className="list-decimal space-y-2 pr-6 text-lg">
        <li>מדפיסים את שני הדפים. בגרסה לצביעה — צובעים קודם את החנוכייה ואת הנרות.</li>
        <li>גוזרים את 9 הנרות לאורך הקו השחור. הלהבה מחוברת לנר, אז גוזרים כל נר בחתיכה אחת.</li>
        <li>תולים את דף החנוכייה על המקרר או על הקיר, ושומרים את הנרות במעטפה לידו.</li>
        <li>בכל ערב מדביקים נר אחד על המקום המקווקו עם אותו מספר. בערב הראשון מדביקים גם את השמש.</li>
      </ol>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5">
      <h2 className="mb-3 text-2xl font-bold">🕯️ באיזה סדר?</h2>
      <ul className="list-disc space-y-2 pr-6 text-lg">
        <li>הנר הראשון עומד בצד ימין. בכל ערב מוסיפים נר חדש — משמאל לנרות של אתמול. לכן המספרים על החנוכייה רצים מימין לשמאל.</li>
        <li>בחנוכייה אמיתית מדליקים את הנרות בעזרת השמש, ומתחילים מהנר החדש — השמאלי ביותר.</li>
      </ul>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">חנוכיית הנייר היא לקישוט בלבד — לא מניחים לידה נרות דולקים.</p>
    </section>

    {print && <PrintPreview title="חנוכייה לגזירה" onClose={() => setPrint(null)}>
      {(print.both ? [true, false] : [print.color]).flatMap(c => print.pages.map(p => <article className="buga-a4" key={p.id + c}><div className="print-art"><p.C color={c} /></div></article>))}
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לחנוכה: <Link className="font-bold underline" to="/holidays/hanukkah/crafts">יצירה לגזירה</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/coloring">דפי צביעה</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/candle-times">זמני הדלקת נרות</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'חנוכייה להדפסה וגזירה היא פעילות לכל שמונת ימי החג: מדפיסים דף אחד עם חנוכייה גדולה ודף אחד עם תשעה נרות, וכל ערב הילדים גוזרים ומדביקים נר אחד. על החנוכייה יש מקום מקווקו ממוספר לכל נר, כך שגם ילדי גן יודעים בדיוק איפה להדביק.',
      'תוך כדי משחק הילדים לומדים את סדר הנרות: הנר הראשון בצד ימין, ובכל ערב נוסף נר משמאל. יש גרסה צבעונית שמוכנה להדבקה, וגרסה בקווים בלבד למי שרוצה לצבוע את החנוכייה ואת הנרות לבד.',
    ]} faq={FAQ} related={[{ label: 'חנוכה לילדים', href: '/holidays/hanukkah' }, { label: 'יצירה לגזירה לחנוכה', href: '/holidays/hanukkah/crafts' }, { label: 'דפי צביעה לחנוכה', href: '/holidays/hanukkah/coloring' }]} /></div>
  </HanukkahShell>
}
