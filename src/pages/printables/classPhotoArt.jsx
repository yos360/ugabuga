// Original SVG decorations for the class-photo sheets (Hanukkah, kindergarten, school, graduation,
// army course). Every piece is drawn around (x, y) and scaled by `s`, so a theme can place it anywhere.

export function Star({ x, y, r = 3, fill = '#ffd45c', rot = 0 }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2 + (rot * Math.PI) / 180, rr = i % 2 ? r * 0.45 : r
    return `${(x + rr * Math.cos(a)).toFixed(2)},${(y + rr * Math.sin(a)).toFixed(2)}`
  })
  return <polygon points={pts.join(' ')} fill={fill} />
}

// Hanukkah menorah: 8 candles and a taller shamash in the middle. (x, y) = bottom centre of the base.
export function Menorah({ x, y, w = 36, color = '#f4c430', candle = '#ffffff' }) {
  const gap = w / 8, top = y - w * 0.5
  return (
    <g>
      {[1, 2, 3, 4].map(k => <path key={k} d={`M${x - k * gap} ${top} Q${x} ${top + k * gap * 1.15} ${x + k * gap} ${top}`} fill="none" stroke={color} strokeWidth={w * 0.035} strokeLinecap="round" />)}
      <rect x={x - w * 0.03} y={top} width={w * 0.06} height={w * 0.44} fill={color} />
      <path d={`M${x - w * 0.2} ${y} h${w * 0.4} l${-w * 0.07} ${-w * 0.07} h${-w * 0.26} z`} fill={color} />
      {Array.from({ length: 9 }, (_, i) => {
        const cx = x + (i - 4) * gap, h = i === 4 ? gap * 1.7 : gap * 1.15, ty = (i === 4 ? top - gap * 0.55 : top) - h
        return (
          <g key={i}>
            <rect x={cx - gap * 0.2} y={ty} width={gap * 0.4} height={h} rx={gap * 0.08} fill={candle} />
            <path d={`M${cx} ${ty - gap * 0.75} Q${cx + gap * 0.3} ${ty - gap * 0.25} ${cx} ${ty - gap * 0.05} Q${cx - gap * 0.3} ${ty - gap * 0.25} ${cx} ${ty - gap * 0.75}z`} fill="#ff9f1c" />
            <circle cx={cx} cy={ty - gap * 0.25} r={gap * 0.1} fill="#ffe066" />
          </g>
        )
      })}
    </g>
  )
}

export function Dreidel({ x, y, s = 1, color = '#3b82f6', letter = 'נ', rot = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-1} y={-9.5} width={2} height={4.8} rx={0.7} fill="#8a5a2b" />
      <path d="M-5 -5 h10 v6 l-5 6.5 l-5 -6.5 z" fill={color} stroke="#1d2233" strokeWidth={0.45} strokeLinejoin="round" />
      <text y={1.2} fontSize={5.4} textAnchor="middle" fill="#fff" fontWeight={800} fontFamily="Heebo, Arial, sans-serif">{letter}</text>
    </g>
  )
}

export function Sufganiya({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse rx={6.4} ry={4.4} fill="#d98a3a" />
      <ellipse cy={0.8} rx={6.4} ry={3.4} fill="#c27531" />
      <path d="M-5.6 -1.4 Q0 -6 5.6 -1.4 Q3 -0.4 1.5 -1 Q0 -0.2 -1.5 -1 Q-3 -0.4 -5.6 -1.4z" fill="#fffaf2" />
      <ellipse cy={-3} rx={1.7} ry={1.05} fill="#d62839" />
    </g>
  )
}

export function OilJug({ x, y, s = 1, color = '#c9a227' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-2 -8 h4 v2 q4 2 4 7 q0 6 -6 6 q-6 0 -6 -6 q0 -5 4 -7z" fill={color} stroke="#5c4300" strokeWidth={0.4} />
      <path d="M4 -4 q3 0 3 3 q0 2 -2 3" fill="none" stroke={color} strokeWidth={1} />
      <rect x={-2.6} y={-9} width={5.2} height={1.4} rx={0.5} fill="#5c4300" />
    </g>
  )
}

export function Balloon({ x, y, s = 1, color = '#ff6b9a' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 6 q-1.5 4 0.5 8 q1.5 3 -0.5 6" fill="none" stroke="#777" strokeWidth={0.35} />
      <ellipse rx={4.2} ry={5.2} fill={color} />
      <path d="M-1 5 h2 l-1 1.4z" fill={color} />
      <ellipse cx={-1.5} cy={-2} rx={0.9} ry={1.6} fill="#fff" opacity={0.55} />
    </g>
  )
}

export function Sun({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-0.6} y={-9} width={1.2} height={3} rx={0.6} fill="#ffb703" transform={`rotate(${i * 30})`} />)}
      <circle r={5.2} fill="#ffd23f" />
      <circle cx={-1.8} cy={-0.8} r={0.6} fill="#5a3b00" /><circle cx={1.8} cy={-0.8} r={0.6} fill="#5a3b00" />
      <path d="M-2 1.4 q2 2 4 0" fill="none" stroke="#5a3b00" strokeWidth={0.55} strokeLinecap="round" />
    </g>
  )
}

export function Heart({ x, y, s = 1, fill = '#ff6b9a' }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 3 C-4 0 -5 -2 -3 -3.6 C-1.8 -4.5 -0.5 -3.8 0 -2.8 C0.5 -3.8 1.8 -4.5 3 -3.6 C5 -2 4 0 0 3z" fill={fill} />
}

export function Pencil({ x, y, s = 1, color = '#ffb703', rot = -35 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-12} y={-2} width={18} height={4} fill={color} stroke="#3d2c00" strokeWidth={0.35} />
      <rect x={-14.5} y={-2} width={2.5} height={4} fill="#f28482" stroke="#3d2c00" strokeWidth={0.35} />
      <rect x={-12} y={-2} width={1.4} height={4} fill="#c0c0c0" />
      <path d="M6 -2 l5 2 l-5 2z" fill="#f6d7a7" stroke="#3d2c00" strokeWidth={0.35} />
      <path d="M9.6 -0.6 l1.4 0.6 l-1.4 0.6z" fill="#333" />
    </g>
  )
}

export function GradCap({ x, y, s = 1, color = '#111827', tassel = '#f5c542' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-5 0 v3.5 q5 2.6 10 0 v-3.5" fill={color} stroke={tassel} strokeWidth={0.3} />
      <path d="M0 -4.5 l11 4 l-11 4 l-11 -4z" fill={color} stroke={tassel} strokeWidth={0.4} />
      <path d="M0 -0.5 l7 2.5 v5" fill="none" stroke={tassel} strokeWidth={0.6} />
      <rect x={6.3} y={6.5} width={1.4} height={2.6} rx={0.4} fill={tassel} />
    </g>
  )
}

// A laurel branch curving up from (x, y); `flip` mirrors it for the other side.
export function Laurel({ x, y, s = 1, color = '#6b7a2a', flip = false }) {
  const leaves = Array.from({ length: 8 }, (_, i) => {
    const a = ((100 + i * 18) * Math.PI) / 180, px = 6 + Math.cos(a) * 10, py = Math.sin(a) * 10
    const deg = (a * 180) / Math.PI + 90 + (i % 2 ? 28 : -28)
    return <ellipse key={i} cx={px.toFixed(2)} cy={py.toFixed(2)} rx={1.3} ry={2.8} fill={color} transform={`rotate(${deg.toFixed(1)} ${px.toFixed(2)} ${py.toFixed(2)})`} />
  })
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M4.26 9.85 A10 10 0 0 1 -0.95 -7.19" fill="none" stroke={color} strokeWidth={0.6} />
      {leaves}
    </g>
  )
}

// Light dots used as snow/sparkle in the night themes.
const SPARKLES = [[14, 70], [186, 84], [8, 130], [192, 150], [12, 200], [188, 214], [60, 6], [140, 7], [100, 5], [30, 250], [170, 248]]
export function Sparkles({ color = '#ffd45c' }) {
  return <g>{SPARKLES.map(([x, y], i) => <Star key={i} x={x} y={y} r={i % 3 ? 1.6 : 2.4} fill={color} rot={i * 17} />)}</g>
}

const DREIDEL_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444']
const LETTERS = ['נ', 'ג', 'ה', 'פ']
const BALLOONS = ['#ff6b9a', '#ffd23f', '#5ed3c6', '#a98bff', '#6cb8ff']

// Each theme draws two corner pieces (left/right of the title) and a footer strip.
// The left corner is skipped when Buga stands there.
export const DECOR = {
  hanukkahNight: { corner: (side) => <Menorah x={side === 'r' ? 174 : 26} y={52} w={30} />, footer: () => <g>{[24, 176].map((x, i) => <Dreidel key={x} x={x} y={257} s={1.1} color={DREIDEL_COLORS[i]} letter={LETTERS[i + 1]} rot={i ? 12 : -12} />)}<Sparkles /></g> },
  sufganiyot: { corner: (side) => <g>{side === 'r' ? <><Sufganiya x={170} y={34} s={1.5} /><Sufganiya x={182} y={46} s={1.1} /><OilJug x={160} y={50} s={0.9} /></> : <><Sufganiya x={30} y={34} s={1.5} /><Sufganiya x={18} y={46} s={1.1} /><Dreidel x={42} y={48} s={0.8} color="#ef4444" letter="ג" rot={-10} /></>}</g>, footer: () => <g>{[20, 50, 150, 180].map((x, i) => i % 2 ? <Dreidel key={x} x={x} y={258} s={0.9} color={DREIDEL_COLORS[i]} letter={LETTERS[i]} /> : <Sufganiya key={x} x={x} y={258} s={1.1} />)}</g> },
  dreidels: { corner: (side) => <g>{(side === 'r' ? [[172, 30, 0], [184, 46, 2]] : [[28, 30, 1], [16, 46, 3]]).map(([x, y, k]) => <Dreidel key={k} x={x} y={y} s={1.45} color={DREIDEL_COLORS[k]} letter={LETTERS[k]} rot={k % 2 ? -14 : 14} />)}<Menorah x={side === 'r' ? 156 : 44} y={54} w={16} color="#3b82f6" candle="#dbeafe" /></g>, footer: () => <g>{[16, 34, 166, 184].map((x, i) => <Dreidel key={x} x={x} y={258} s={0.9} color={DREIDEL_COLORS[i]} letter={LETTERS[i]} rot={(i - 1.5) * 10} />)}</g> },
  balloons: { corner: (side) => <g>{(side === 'r' ? [[172, 28], [182, 38], [164, 40]] : [[28, 28], [18, 38], [36, 40]]).map(([x, y], i) => <Balloon key={i} x={x} y={y} s={1.3} color={BALLOONS[(i + (side === 'r' ? 2 : 0)) % 5]} />)}</g>, footer: () => <g><Sun x={22} y={256} s={0.9} />{[60, 80, 120, 140].map((x, i) => <Heart key={x} x={x} y={262} s={0.8} fill={BALLOONS[i]} />)}<Sun x={178} y={256} s={0.9} /></g> },
  pencils: { corner: (side) => <g>{side === 'r' ? <><Pencil x={172} y={34} color="#ffb703" /><Pencil x={176} y={42} color="#5ed3c6" rot={-55} /></> : <><Pencil x={28} y={34} color="#f28482" rot={-145} /><Star x={22} y={46} r={4} fill="#ffd23f" /></>}</g>, footer: () => <g>{[18, 32, 168, 182].map((x, i) => <Star key={x} x={x} y={258} r={3} fill={BALLOONS[i]} />)}</g> },
  caps: { corner: (side) => <g><GradCap x={side === 'r' ? 172 : 28} y={34} s={1.6} color="#0b1220" />{(side === 'r' ? [[160, 18], [188, 52]] : [[40, 18], [12, 52]]).map(([x, y], i) => <Star key={i} x={x} y={y} r={2.2} fill="#f5c542" />)}</g>, footer: () => <g><Laurel x={30} y={258} s={0.7} color="#f5c542" /><Laurel x={170} y={258} s={0.7} color="#f5c542" flip /><Sparkles color="#f5c542" /></g> },
  laurel: { corner: (side) => <g><Laurel x={side === 'r' ? 172 : 28} y={34} s={1.1} flip={side === 'l'} />{[0, 1, 2].map(i => <Star key={i} x={(side === 'r' ? 166 : 34) + (i - 1) * 6} y={50} r={2} fill="#6b7a2a" />)}</g>, footer: () => <g>{[90, 100, 110].map(x => <Star key={x} x={x} y={262} r={2} fill="#6b7a2a" />)}</g> },
  classic: { corner: (side) => <Laurel x={side === 'r' ? 172 : 28} y={34} s={0.9} color="#b08d3c" flip={side === 'l'} />, footer: () => <g>{[94, 106].map(x => <Star key={x} x={x} y={262} r={1.6} fill="#b08d3c" />)}</g> },
}
