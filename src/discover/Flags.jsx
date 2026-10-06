import { useId } from 'react'

// Hand-drawn flags in their real proportions (official colours). Emblems such as the sun of
// Argentina are simplified. Flags whose emblems are too detailed to draw faithfully are left out.
const H = (w, h, cols) => <>{cols.map((c, i) => <rect key={i} x="0" y={(h / cols.length) * i} width={w} height={h / cols.length + 0.02} fill={c} />)}</>
const V = (w, h, cols) => <>{cols.map((c, i) => <rect key={i} x={(w / cols.length) * i} y="0" width={w / cols.length + 0.02} height={h} fill={c} />)}</>
function star(cx, cy, r, rot = 0) {
  const pts = []
  for (let i = 0; i < 10; i++) { const a = ((rot - 90 + i * 36) * Math.PI) / 180, rr = i % 2 ? r * 0.382 : r; pts.push(`${(cx + rr * Math.cos(a)).toFixed(3)},${(cy + rr * Math.sin(a)).toFixed(3)}`) }
  return pts.join(' ')
}
const S = (cx, cy, r, fill, rot) => <polygon points={star(cx, cy, r, rot)} fill={fill} />
function nordic(w, h, bg, x, y, t, c1, inner) {
  return <><rect width={w} height={h} fill={bg} /><rect x={x} y="0" width={t} height={h} fill={c1} /><rect x="0" y={y} width={w} height={t} fill={c1} />
    {inner && <><rect x={x + inner[1]} y="0" width={t - 2 * inner[1]} height={h} fill={inner[0]} /><rect x="0" y={y + inner[1]} width={w} height={t - 2 * inner[1]} fill={inner[0]} /></>}</>
}
function UK() {
  const id = useId().replace(/:/g, '')
  return <><clipPath id={id}><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
    <rect width="60" height="30" fill="#012169" /><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id})`} stroke="#C8102E" strokeWidth="4" />
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" /><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" /></>
}
function USA() {
  const sh = 100 / 13, cw = 76, ch = sh * 7, dx = cw / 12, dy = ch / 10
  const stars = []
  for (let r = 0; r < 9; r++) for (let j = 0; j < (r % 2 ? 5 : 6); j++) stars.push(S((r % 2 ? 2 * j + 2 : 2 * j + 1) * dx, (r + 1) * dy, 3.08, '#fff'))
  return <>{Array.from({ length: 13 }, (_, i) => <rect key={i} y={i * sh} width="190" height={sh + 0.05} fill={i % 2 ? '#fff' : '#B22234'} />)}<rect width={cw} height={ch} fill="#3C3B6E" />{stars.map((s, i) => <g key={i}>{s}</g>)}</>
}
function China() {
  const small = [[10, 2], [12, 4], [12, 7], [10, 9]].map(([x, y]) => S(x, y, 1, '#FFFF00', (Math.atan2(5 - y, 5 - x) * 180) / Math.PI + 90))
  return <><rect width="30" height="20" fill="#EE1C25" />{S(5, 5, 3, '#FFFF00')}{small.map((s, i) => <g key={i}>{s}</g>)}</>
}
function India() {
  const spokes = Array.from({ length: 24 }, (_, i) => { const a = (i * 15 * Math.PI) / 180; return <line key={i} x1="15" y1="10" x2={15 + 2.6 * Math.cos(a)} y2={10 + 2.6 * Math.sin(a)} stroke="#000080" strokeWidth=".18" /> })
  return <>{H(30, 20, ['#FF9933', '#fff', '#138808'])}<circle cx="15" cy="10" r="2.85" fill="none" stroke="#000080" strokeWidth=".35" /><circle cx="15" cy="10" r=".5" fill="#000080" />{spokes}</>
}
function Argentina() {
  const rays = Array.from({ length: 16 }, (_, i) => { const a = (i * 22.5 * Math.PI) / 180; return <line key={i} x1={14 + 2 * Math.cos(a)} y1={9 + 2 * Math.sin(a)} x2={14 + (i % 2 ? 3.1 : 3.6) * Math.cos(a)} y2={9 + (i % 2 ? 3.1 : 3.6) * Math.sin(a)} stroke="#F6B40E" strokeWidth=".55" /> })
  return <>{H(28, 18, ['#74ACDF', '#fff', '#74ACDF'])}{rays}<circle cx="14" cy="9" r="2" fill="#F6B40E" stroke="#85340A" strokeWidth=".15" /></>
}
const FLAGS = {
  il: [220, 160, () => <><rect width="220" height="160" fill="#fff" /><rect y="15" width="220" height="25" fill="#0038b8" /><rect y="120" width="220" height="25" fill="#0038b8" />
    <polygon points="110,50 136,95 84,95" fill="none" stroke="#0038b8" strokeWidth="5.5" /><polygon points="110,110 84,65 136,65" fill="none" stroke="#0038b8" strokeWidth="5.5" /></>],
  fr: [30, 20, () => V(30, 20, ['#0055A4', '#fff', '#EF4135'])], it: [30, 20, () => V(30, 20, ['#009246', '#fff', '#CE2B37'])],
  ie: [6, 3, () => V(6, 3, ['#169B62', '#fff', '#FF883E'])], be: [15, 13, () => V(15, 13, ['#000', '#FDDA24', '#EF3340'])],
  de: [5, 3, () => H(5, 3, ['#000', '#DD0000', '#FFCE00'])], nl: [30, 20, () => H(30, 20, ['#AE1C28', '#fff', '#21468B'])],
  at: [30, 20, () => H(30, 20, ['#C8102E', '#fff', '#C8102E'])], pl: [8, 5, () => H(8, 5, ['#fff', '#DC143C'])],
  ru: [30, 20, () => H(30, 20, ['#fff', '#0039A6', '#D52B1E'])], ua: [30, 20, () => H(30, 20, ['#0057B7', '#FFD700'])],
  hu: [6, 3, () => H(6, 3, ['#CE2939', '#fff', '#477050'])], ro: [30, 20, () => V(30, 20, ['#002B7F', '#FCD116', '#CE1126'])],
  bg: [5, 3, () => H(5, 3, ['#fff', '#00966E', '#D62612'])], ee: [11, 7, () => H(11, 7, ['#0072CE', '#000', '#fff'])],
  lt: [5, 3, () => H(5, 3, ['#FDB913', '#006A44', '#C1272D'])],
  jp: [30, 20, () => <><rect width="30" height="20" fill="#fff" /><circle cx="15" cy="10" r="6" fill="#BC002D" /></>],
  se: [16, 10, () => nordic(16, 10, '#006AA7', 5, 4, 2, '#FECC02')], dk: [37, 28, () => nordic(37, 28, '#C8102E', 12, 12, 4, '#fff')],
  no: [22, 16, () => nordic(22, 16, '#BA0C2F', 6, 6, 4, '#fff', ['#00205B', 1])], fi: [18, 11, () => nordic(18, 11, '#fff', 5, 4, 3, '#002F6C')],
  is: [25, 18, () => nordic(25, 18, '#02529C', 7, 7, 4, '#fff', ['#DC1E35', 1])],
  ch: [32, 32, () => <><rect width="32" height="32" fill="#DA291C" /><rect x="13" y="6" width="6" height="20" fill="#fff" /><rect x="6" y="13" width="20" height="6" fill="#fff" /></>],
  gr: [27, 18, () => <>{Array.from({ length: 9 }, (_, i) => <rect key={i} y={i * 2} width="27" height="2.02" fill={i % 2 ? '#fff' : '#0D5EAF'} />)}<rect width="10" height="10" fill="#0D5EAF" /><rect x="4" width="2" height="10" fill="#fff" /><rect y="4" width="10" height="2" fill="#fff" /></>],
  cz: [30, 20, () => <>{H(30, 20, ['#fff', '#D7141A'])}<polygon points="0,0 15,10 0,20" fill="#11457E" /></>],
  gb: [60, 30, () => <UK />], us: [190, 100, () => <USA />],
  ng: [6, 3, () => V(6, 3, ['#008751', '#fff', '#008751'])],
  th: [9, 6, () => <>{[['#A51931', 0, 1], ['#F4F5F8', 1, 1], ['#2D2A4A', 2, 2], ['#F4F5F8', 4, 1], ['#A51931', 5, 1]].map(([c, y, h]) => <rect key={y} y={y} width="9" height={h + 0.02} fill={c} />)}</>],
  co: [30, 20, () => <><rect width="30" height="10" fill="#FCD116" /><rect y="10" width="30" height="5" fill="#003893" /><rect y="15" width="30" height="5" fill="#CE1126" /></>],
  tr: [30, 20, () => <><rect width="30" height="20" fill="#E30A17" /><circle cx="10.625" cy="10" r="5" fill="#fff" /><circle cx="11.875" cy="10" r="4" fill="#E30A17" />{S(14.58, 10, 2.5, '#fff', -90)}</>],
  cn: [30, 20, () => <China />], vn: [30, 20, () => <><rect width="30" height="20" fill="#DA251D" />{S(15, 10, 6, '#FFFF00')}</>],
  in: [30, 20, () => <India />],
  bd: [20, 12, () => <><rect width="20" height="12" fill="#006A4E" /><circle cx="9" cy="6" r="4" fill="#F42A41" /></>],
  ar: [28, 18, () => <Argentina />],
  cl: [30, 20, () => <>{H(30, 20, ['#fff', '#D52B1E'])}<rect width="10" height="10" fill="#0039A6" />{S(5, 5, 2, '#fff')}</>],
  jm: [24, 12, () => <><rect width="24" height="12" fill="#000" /><polygon points="0,0 24,0 12,6" fill="#009B3A" /><polygon points="0,12 24,12 12,6" fill="#009B3A" /><path d="M0,0 L24,12 M24,0 L0,12" stroke="#FED100" strokeWidth="1.6" /></>],
}
export const FLAG_CODES = Object.keys(FLAGS)
export default function Flag({ code, className = '', label }) {
  const f = FLAGS[code]
  if (!f) return null
  const [w, h, draw] = f
  return <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-label={label} style={{ border: '1px solid #c9ccd6', background: '#fff' }}>{draw()}</svg>
}
