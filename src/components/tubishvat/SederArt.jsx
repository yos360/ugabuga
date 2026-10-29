// Drawings for the Tu BiShvat seder page (/holidays/tu-bishvat/seder), all in code:
// cups, fruit-group icons, an almond blossom, a vine divider, the A4 cover with a border,
// and the printable almond-branch craft template.
import { FONT } from '../holidays/printKit'
import SpeciesIcon from './SpeciesIcon'
import { CUPS, TABLE_LIST, SEDER_SPECIES } from '../../data/tubishvatSeder'

const K = '#111'
const GREEN = '#3f7d20', LEAF = '#7cb342', BARK = '#7a4a24', PINK = '#f9a8c4'

// A wine glass with liquid of the given colour, drawn in a 40 × 60 box.
export function Cup({ fill, size = 48, title }) {
  return <svg viewBox="0 0 40 60" width={size * 0.67} height={size} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
    <path d="M9.5 13 H30.5 C30 23 27 29 20 29.6 C13 29 10 23 9.5 13 Z" fill={fill} />
    <path d="M8 5 H32 C32 21 28 30 20 30.8 C12 30 8 21 8 5 Z" fill="none" stroke={K} strokeWidth="2" strokeLinejoin="round" />
    <path d="M20 31 V50 M11 54 Q20 48 29 54 Z" fill="white" stroke={K} strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 9 Q13 16 15 20" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".8" />
  </svg>
}

// One five-petal almond blossom centred at (x, y).
export function Blossom({ x, y, r = 10, line = false }) {
  return <g>
    {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx={x} cy={y - r * 0.62} rx={r * 0.48} ry={r * 0.62} transform={`rotate(${a} ${x} ${y})`} fill={line ? 'white' : '#fff5f8'} stroke={line ? K : '#d9739a'} strokeWidth={line ? 2 : 1.2} />)}
    <circle cx={x} cy={y} r={r * 0.28} fill={line ? 'white' : '#e0457b'} stroke={line ? K : 'none'} strokeWidth="1.5" />
  </g>
}

const Leaf = ({ x, y, rot = 0, s = 1, fill = LEAF }) => <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
  <path d="M0 0 C6 -8 16 -8 22 0 C16 8 6 8 0 0 Z" fill={fill} stroke={GREEN} strokeWidth="1.2" />
  <path d="M1 0 H19" stroke={GREEN} strokeWidth="0.9" />
</g>

// Fruit-group icons in a 100 × 100 box: peel (orange), pit (half apricot), whole (grapes).
export function GroupIcon({ id, size = 56 }) {
  let body
  if (id === 'peel') body = <g>
    <circle cx="50" cy="55" r="34" fill="#fb923c" stroke={K} strokeWidth="3" />
    <circle cx="50" cy="55" r="24" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
    {[0, 60, 120, 180, 240, 300].map(a => <path key={a} d="M50 55 V33" transform={`rotate(${a} 50 55)`} stroke="#ea580c" strokeWidth="2" />)}
    <Leaf x={50} y={20} rot={-35} s={1.3} />
  </g>
  else if (id === 'pit') body = <g>
    <path d="M50 18 C80 18 88 45 84 62 C80 82 64 90 50 90 C36 90 20 82 16 62 C12 45 20 18 50 18 Z" fill="#fdba74" stroke={K} strokeWidth="3" />
    <ellipse cx="50" cy="56" rx="13" ry="18" fill="#92400e" stroke={K} strokeWidth="2.5" />
    <path d="M50 42 V70" stroke="#5b2a06" strokeWidth="1.5" />
  </g>
  else body = <g>
    <path d="M50 8 Q52 16 50 22" stroke={BARK} strokeWidth="4" fill="none" strokeLinecap="round" />
    <Leaf x={52} y={14} rot={-20} s={1.4} />
    {[[38, 30], [62, 30], [50, 36], [30, 46], [70, 46], [50, 50], [40, 62], [60, 62], [50, 76]].map(([cx, cy], i) =>
      <circle key={i} cx={cx} cy={cy} r="11" fill="#7c3aed" stroke={K} strokeWidth="2.5" />)}
  </g>
  return <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">{body}</svg>
}

// A thin vine with leaves and a blossom in the middle, full width.
export function VineDivider() {
  return <svg viewBox="0 0 600 28" width="100%" height="22" aria-hidden="true" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', margin: '6px 0' }}>
    <path d="M20 14 Q150 4 280 14 M320 14 Q450 24 580 14" stroke={GREEN} strokeWidth="2" fill="none" />
    {[70, 150, 230].map((x, i) => <Leaf key={x} x={x} y={i % 2 ? 12 : 10} rot={i % 2 ? 25 : -25} s={0.9} />)}
    {[370, 450, 530].map((x, i) => <Leaf key={x} x={x} y={i % 2 ? 16 : 18} rot={i % 2 ? 155 : 205} s={0.9} />)}
    <Blossom x={300} y={14} r={11} />
  </svg>
}

// The leafy frame used on both A4 sheets.
function Frame() {
  const top = Array.from({ length: 11 }, (_, i) => 75 + i * 45)
  const side = Array.from({ length: 15 }, (_, i) => 90 + i * 45)
  return <g>
    <rect x="14" y="14" width="572" height="792" rx="26" fill="none" stroke={GREEN} strokeWidth="4" />
    <rect x="26" y="26" width="548" height="768" rx="18" fill="none" stroke={LEAF} strokeWidth="1.5" strokeDasharray="7 5" />
    {top.map((x, i) => <g key={x}><Leaf x={x} y={20} rot={i % 2 ? 10 : -10} s={0.75} /><Leaf x={x} y={800} rot={i % 2 ? -10 : 10} s={0.75} /></g>)}
    {side.map((y, i) => <g key={y}><Leaf x={20} y={y} rot={i % 2 ? 80 : 100} s={0.75} /><Leaf x={580} y={y} rot={i % 2 ? 260 : 280} s={0.75} /></g>)}
    {[[30, 30], [570, 30], [30, 790], [570, 790]].map(([x, y]) => <g key={x + '-' + y}><Blossom x={x} y={y} r={14} /><Blossom x={x + (x < 300 ? 22 : -22)} y={y + (y < 400 ? 14 : -14)} r={9} /></g>)}
  </g>
}

const T = ({ x, y, size = 16, weight = 700, fill = K, children }) => <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={weight} fill={fill} direction="rtl">{children}</text>

// A fruit tree for the cover.
function Tree({ x, y }) {
  return <g transform={`translate(${x} ${y})`}>
    <path d="M-14 120 C-10 80 -12 50 -6 20 H6 C12 50 10 80 14 120 Z" fill={BARK} stroke={K} strokeWidth="2.5" />
    <path d="M-2 40 Q-30 20 -46 2 M2 50 Q30 30 44 10" stroke={BARK} strokeWidth="7" fill="none" strokeLinecap="round" />
    {[[-60, -10, 46], [0, -40, 56], [60, -10, 46], [-30, 20, 40], [34, 22, 40]].map(([cx, cy, r], i) =>
      <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? '#8bc34a' : '#689f38'} stroke={GREEN} strokeWidth="2.5" />)}
    {[[-62, -20, '#dc2626'], [-10, -60, '#f97316'], [44, -40, '#dc2626'], [70, 4, '#f59e0b'], [-40, 30, '#f97316'], [18, -10, '#dc2626'], [40, 36, '#7c3aed'], [-80, 10, '#7c3aed']].map(([cx, cy, f], i) =>
      <circle key={i} cx={cx} cy={cy} r="9" fill={f} stroke={K} strokeWidth="1.8" />)}
    {[[-20, -30], [30, -64], [-70, -40], [80, -24]].map(([bx, by]) => <Blossom key={bx} x={bx} y={by} r={8} />)}
    <path d="M-90 122 Q0 108 90 122" stroke="#a16207" strokeWidth="4" fill="none" strokeLinecap="round" />
  </g>
}

// A4 cover (600 × 820): border, title, tree, the four cups, the seven species and a table checklist.
export function SederCover({ version }) {
  const cls = version === 'class'
  return <svg viewBox="0 0 600 820" role="img" aria-label="סדר ט״ו בשבט — דף פתיחה" style={{ width: '100%', height: '100%', background: 'white' }}>
    <Frame />
    <T x={300} y={86} size={48} weight={900} fill={GREEN}>סדר ט״ו בשבט</T>
    <T x={300} y={120} size={20} weight={700}>{cls ? 'לכיתה ולגן — עם תפקידים' : 'למשפחה — סדר קצר לשולחן'}</T>
    <Tree x={300} y={262} />
    <T x={300} y={428} size={19} weight={800}>ארבע כוסות — מלבן לאדום</T>
    {CUPS.map((c, i) => {
      const cx = 480 - i * 120
      return <g key={c.n}>
        <g transform={`translate(${cx - 20} 440)`}>
          <path d="M9.5 13 H30.5 C30 23 27 29 20 29.6 C13 29 10 23 9.5 13 Z" fill={c.fill} />
          <path d="M8 5 H32 C32 21 28 30 20 30.8 C12 30 8 21 8 5 Z" fill="none" stroke={K} strokeWidth="2" />
          <path d="M20 31 V50 M11 54 Q20 48 29 54 Z" fill="white" stroke={K} strokeWidth="2" strokeLinejoin="round" />
        </g>
        <T x={cx} y={510} size={14} weight={800}>{`כוס ${c.n}`}</T>
        {c.name.split(/ (?=עם )/).map((part, k) => <T key={part} x={cx} y={526 + k * 14} size={12.5} weight={500}>{part}</T>)}
      </g>
    })}
    <T x={300} y={566} size={19} weight={800}>שבעת המינים</T>
    {SEDER_SPECIES.map((s, i) => {
      const cx = 525 - i * 75
      return <g key={s.id}>
        <g transform={`translate(${cx - 24} 574)`}><SpeciesIcon id={s.id} size={48} /></g>
        <T x={cx} y={638} size={14} weight={800}>{s.name}</T>
      </g>
    })}
    <rect x="70" y="652" width="460" height="132" rx="14" fill="#f7fbef" stroke={LEAF} strokeWidth="1.5" />
    <T x={300} y={674} size={16} weight={800}>מה שמים על השולחן</T>
    {TABLE_LIST.map((t, i) => <text key={t} x="510" y={696 + i * 15} textAnchor="start" fontFamily={FONT} fontSize="12.5" fill={K} direction="rtl">{'☐ ' + t}</text>)}
  </svg>
}

// Printable craft template: an almond branch to colour, and 12 blossoms to colour, cut and glue.
export function AlmondTemplate() {
  const flowers = Array.from({ length: 12 }, (_, i) => [90 + (i % 4) * 140, 560 + Math.floor(i / 4) * 80])
  return <svg viewBox="0 0 600 820" role="img" aria-label="שקדייה פורחת — ענף ופרחים לגזירה" style={{ width: '100%', height: '100%', background: 'white' }}>
    <Frame />
    <T x={300} y={74} size={30} weight={900}>שקדייה פורחת</T>
    <T x={300} y={102} size={16} weight={600}>צובעים את הענף, גוזרים את הפרחים ומדביקים אותם על הענפים</T>
    <g fill="white" stroke={K} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M300 500 C296 440 304 400 300 340 C298 300 290 260 300 200 L312 202 C304 260 314 300 314 340 C318 400 312 440 318 500 Z" />
      <path d="M302 360 C260 330 220 320 170 300 L166 312 C214 330 254 344 300 376 Z" />
      <path d="M312 300 C350 270 390 260 440 240 L444 252 C396 272 356 286 314 316 Z" />
      <path d="M300 240 C270 210 240 190 210 160 L218 152 C248 182 278 202 308 228 Z" />
      <path d="M312 420 C360 400 410 400 460 380 L464 392 C414 412 364 414 314 436 Z" />
      <path d="M302 440 C260 430 220 440 150 420 L148 432 C220 452 262 444 300 456 Z" />
    </g>
    {[[150, 300], [450, 236], [200, 150], [470, 380], [140, 422], [260, 330], [380, 270]].map(([x, y]) => <Blossom key={x + '-' + y} x={x} y={y} r={14} line />)}
    <path d="M60 520 H540" stroke="#999" strokeWidth="1.5" strokeDasharray="8 6" />
    <text x="56" y="526" fontSize="18" textAnchor="middle">✂️</text>
    {flowers.map(([x, y]) => <g key={x + '-' + y}>
      <circle cx={x} cy={y} r="34" fill="none" stroke="#bbb" strokeWidth="1.5" strokeDasharray="5 4" />
      <Blossom x={x} y={y} r={28} line />
    </g>)}
  </svg>
}
