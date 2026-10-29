import { Page, FONT } from '../holidays/printKit'

// Hanukkah cut-and-make templates (A4, 600 × 820): a paper sevivon, a hanukkiah to cut and glue
// candle by candle, and a garland. Solid lines = cut, dashed = fold.
const CUT = { fill: 'white', stroke: '#111', strokeWidth: 3, strokeLinejoin: 'round' }
const FOLD = { fill: 'none', stroke: '#555', strokeWidth: 2, strokeDasharray: '8 6' }
const T = ({ x, y, size = 18, weight = 700, children, ...r }) => <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={weight} fill="#111" direction="rtl" {...r}>{children}</text>
const Scissors = ({ x, y }) => <text x={x} y={y} fontSize="22" textAnchor="middle">✂️</text>

// Glue tab on a square's edge: trapezoid outward from (x1,y1)→(x2,y2), depth d.
const tab = (x1, y1, x2, y2, d = 22) => {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = dy / len * d, ny = -dx / len * d, ix = dx / len * d * 0.8, iy = dy / len * d * 0.8
  return `M${x1} ${y1} L${x1 + nx + ix} ${y1 + ny + iy} L${x2 + nx - ix} ${y2 + ny - iy} L${x2} ${y2}`
}

// Paper sevivon: a cube net. Four side faces נ ג ה פ in a column, top and bottom faces beside face 2.
function SevivonNet() {
  const s = 125, x = 238, y0 = 150
  const faces = [['נ', 'נֵס'], ['ג', 'גָּדוֹל'], ['ה', 'הָיָה'], ['פ', 'פֹּה']]
  return <Page title="סביבון מנייר" sub="גוזרים לאורך הקו, מקפלים בקווים המקווקווים ומדביקים את הלשוניות">
    {/* glue tabs */}
    <path d={tab(x, y0, x, y0 + s)} {...CUT} />
    <path d={tab(x, y0 + 2 * s, x, y0 + 3 * s)} {...CUT} />
    <path d={tab(x + s, y0 + 3 * s, x + s, y0 + 2 * s)} {...CUT} />
    <path d={tab(x + s, y0 + s, x + s, y0)} {...CUT} />
    <path d={tab(x + s, y0 + 4 * s, x, y0 + 4 * s)} {...CUT} />
    <path d={tab(x - s, y0 + 2 * s, x - s, y0 + s)} {...CUT} />
    <path d={tab(x + 2 * s, y0 + s, x + 2 * s, y0 + 2 * s)} {...CUT} />
    {/* faces */}
    {faces.map(([l, w], i) => <g key={l}>
      <rect x={x} y={y0 + i * s} width={s} height={s} {...CUT} />
      <T x={x + s / 2} y={y0 + i * s + 82} size={78} weight={900}>{l}</T>
      <T x={x + s / 2} y={y0 + i * s + 112} size={16} weight={400}>{w}</T>
    </g>)}
    <rect x={x - s} y={y0 + s} width={s} height={s} {...CUT} />
    <rect x={x + s} y={y0 + s} width={s} height={s} {...CUT} />
    <circle cx={x - s / 2} cy={y0 + 1.5 * s} r="9" {...CUT} /><T x={x - s / 2} y={y0 + 1.5 * s + 36} size={14} weight={400}>חור לעיפרון</T>
    <circle cx={x + 1.5 * s} cy={y0 + 1.5 * s} r="9" {...CUT} /><T x={x + 1.5 * s} y={y0 + 1.5 * s + 36} size={14} weight={400}>חור לעיפרון</T>
    {/* fold lines between faces */}
    {[1, 2, 3].map(i => <path key={i} d={`M${x} ${y0 + i * s} H${x + s}`} {...FOLD} />)}
    <path d={`M${x} ${y0 + s} V${y0 + 2 * s} M${x + s} ${y0 + s} V${y0 + 2 * s}`} {...FOLD} />
    <Scissors x={x - s - 20} y={y0 + s - 10} />
    <T x={300} y={758} size={16} weight={400}>בסוף משחילים עיפרון קצר דרך שני החורים — והסביבון מוכן לסיבוב!</T>
    <T x={300} y={782} size={14} weight={400}>(בחו״ל במקום פ׳ כותבים ש׳ — "נס גדול היה שָׁם")</T>
  </Page>
}

// A hanukkiah to colour, with 9 candles and flames to cut out and glue on — one per night.
function HanukkiahCutGlue() {
  const xs = [80, 135, 190, 245, 355, 410, 465, 520]
  return <Page title="חנוכייה לגזירה ולהדבקה" sub="צובעים, גוזרים את הנרות ומדביקים כל ערב נר אחד">
    <path d="M200 470 H400 L370 430 H230 Z" {...CUT} />
    <rect x="285" y="300" width="30" height="130" rx="8" {...CUT} />
    {xs.map(x => <path key={x} d={`M300 330 Q ${x} 330 ${x} 270`} fill="none" stroke="#111" strokeWidth="13" strokeLinecap="round" />)}
    {xs.map(x => <path key={'w' + x} d={`M300 330 Q ${x} 330 ${x} 270`} fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />)}
    {xs.map(x => <path key={'c' + x} d={`M${x - 20} 250 H${x + 20} L${x + 15} 272 H${x - 15} Z`} {...CUT} />)}
    <rect x="293" y="226" width="14" height="76" rx="4" {...CUT} />
    <path d="M280 205 H320 L314 228 H286 Z" {...CUT} />
    <T x={300} y={200} size={13} weight={700}>שמש</T>
    <path d="M30 500 H570" {...FOLD} /><Scissors x={22} y={508} />
    {/* 9 candles to cut */}
    {Array.from({ length: 9 }, (_, i) => {
      const cx = 52 + i * 62
      return <g key={i}>
        <rect x={cx - 18} y={560} width="36" height="150" rx="4" {...CUT} />
        <path d={`M${cx} 520 C ${cx + 16} 540 ${cx + 14} 556 ${cx} 558 C ${cx - 14} 556 ${cx - 16} 540 ${cx} 520 Z`} {...CUT} />
        <T x={cx} y={650} size={22} weight={900}>{i === 8 ? 'ש' : i + 1}</T>
      </g>
    })}
    <T x={300} y={760} size={16} weight={400}>בערב הראשון מדביקים נר 1 ואת השמש, בשני — עוד נר, וכך עד שמונה נרות.</T>
  </Page>
}

const Dreidel = ({ cx, cy, letter }) => <g>
  <path d={`M${cx - 45} ${cy - 40} H${cx + 45} V${cy + 20} L${cx} ${cy + 70} L${cx - 45} ${cy + 20} Z`} {...CUT} />
  <rect x={cx - 9} y={cy - 70} width="18" height="30" rx="4" {...CUT} />
  <circle cx={cx} cy={cy - 56} r="4" fill="#111" />
  <T x={cx} y={cy + 22} size={52} weight={900}>{letter}</T>
</g>
const Candle = ({ cx, cy }) => <g>
  <rect x={cx - 22} y={cy - 40} width="44" height="110" rx="6" {...CUT} />
  <path d={`M${cx} ${cy - 92} C ${cx + 22} ${cy - 66} ${cx + 20} ${cy - 46} ${cx} ${cy - 44} C ${cx - 20} ${cy - 46} ${cx - 22} ${cy - 66} ${cx} ${cy - 92} Z`} {...CUT} />
  <circle cx={cx} cy={cy - 28} r="4" fill="#111" />
</g>

// Garland: sevivonim and candles to colour, cut and thread on a string (holes marked).
function Garland() {
  return <Page title="שרשרת חנוכה" sub="צובעים, גוזרים, מנקבים בנקודה השחורה ומשחילים על חוט">
    {['נ', 'ג', 'ה', 'פ'].map((l, i) => <Dreidel key={l} cx={90 + i * 140} cy={250} letter={l} />)}
    {[0, 1, 2, 3, 4].map(i => <Candle key={i} cx={80 + i * 110} cy={500} />)}
    {[0, 1, 2, 3].map(i => <Dreidel key={'b' + i} cx={90 + i * 140} cy={690} letter="★" />)}
  </Page>
}

export const HANUKKAH_CRAFTS = [
  { id: 'paper-sevivon', name: 'סביבון מנייר לגזירה', age: 'גן–ב׳', C: SevivonNet },
  { id: 'hanukkiah-cut-glue', name: 'חנוכייה פשוטה להדבקה (דף אחד)', age: 'גן–א׳', C: HanukkiahCutGlue },
  { id: 'garland', name: 'שרשרת חנוכה', age: 'גן–ב׳', C: Garland },
]
