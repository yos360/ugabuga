import { emotionById } from '../../../data/speech/social'

// Eight simple, neutral faces drawn in a 100×100 box: a round face (no skin tone, no gender, no hair),
// with eyebrows, eyes and mouth doing the work, plus one small extra where it helps (a tear, blush,
// a sweat drop, a scribble, a sparkle). Works in colour and in black-and-white.

const INK = '#1f2937'
const line = { fill: 'none', stroke: INK, strokeWidth: 3.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
const dot = (cx, cy, r = 4.2) => <circle cx={cx} cy={cy} r={r} fill={INK} />
const bigEye = (cx, cy) => <g><circle cx={cx} cy={cy} r={7} fill="#fff" stroke={INK} strokeWidth={2.6} /><circle cx={cx} cy={cy + 0.5} r={3.2} fill={INK} /></g>
const P = ({ d, w = 3.4, fill = 'none' }) => <path d={d} {...line} strokeWidth={w} fill={fill} />

const PARTS = {
  happy: () => <g>
    {dot(36, 43)}{dot(64, 43)}
    <P d="M28 33 Q36 28 44 32" w={2.8} /><P d="M56 32 Q64 28 72 33" w={2.8} />
    <P d="M30 59 Q50 80 70 59 Q50 66 30 59Z" fill="#7f1d1d" w={3} />
  </g>,
  sad: (c) => <g>
    {dot(36, 45)}{dot(64, 45)}
    <P d="M27 37 L42 31" w={3} /><P d="M58 31 L73 37" w={3} />
    <P d="M35 72 Q50 60 65 72" />
    <path d="M65 52 Q60.5 60 65 63 Q69.5 60 65 52Z" fill={c ? '#60a5fa' : '#fff'} stroke={c ? '#1d4ed8' : INK} strokeWidth={1.6} />
  </g>,
  angry: () => <g>
    {dot(37, 46)}{dot(63, 46)}
    <P d="M27 33 L44 40" w={4} /><P d="M56 40 L73 33" w={4} />
    <P d="M36 70 Q50 63 64 70" w={3.6} />
  </g>,
  scared: (c) => <g>
    {bigEye(36, 45)}{bigEye(64, 45)}
    <P d="M27 31 Q34 25 42 28" w={2.8} /><P d="M58 28 Q66 25 73 31" w={2.8} />
    <P d="M37 70 Q42 65 46 69 Q50 73 54 69 Q58 65 63 70" w={3} />
    <path d="M80 26 Q75 35 80 38 Q85 35 80 26Z" fill={c ? '#bae6fd' : '#fff'} stroke={c ? '#0369a1' : INK} strokeWidth={1.6} />
  </g>,
  surprised: () => <g>
    {bigEye(36, 46)}{bigEye(64, 46)}
    <P d="M27 30 Q35 21 43 29" w={2.8} /><P d="M57 29 Q65 21 73 30" w={2.8} />
    <ellipse cx={50} cy={70} rx={6.5} ry={8.5} fill="#7f1d1d" stroke={INK} strokeWidth={2.6} />
  </g>,
  embarrassed: (c) => <g>
    <P d="M30 47 Q35 51 41 47" w={3} /><P d="M59 47 Q65 51 70 47" w={3} />
    <P d="M28 37 L42 34" w={2.6} /><P d="M58 34 L72 37" w={2.6} />
    <ellipse cx={27} cy={59} rx={7} ry={4.2} fill={c ? '#fda4af' : '#e5e7eb'} />
    <ellipse cx={73} cy={59} rx={7} ry={4.2} fill={c ? '#fda4af' : '#e5e7eb'} />
    {!c && <g stroke={INK} strokeWidth={1} strokeLinecap="round"><path d="M23 61 L26 57 M27 61 L30 57 M69 61 L72 57 M73 61 L76 57" /></g>}
    <P d="M41 68 Q45 65 50 68 Q55 71 59 68" w={3} />
  </g>,
  frustrated: () => <g>
    <P d="M30 46 L42 44" w={3.4} /><P d="M58 44 L70 46" w={3.4} />
    <P d="M28 36 L43 39" w={3.6} /><P d="M57 39 L72 36" w={3.6} />
    <P d="M48 33 L49 38 M52 33 L51 38" w={1.8} />
    <rect x={35} y={61} width={30} height={11} rx={3.5} fill="#fff" stroke={INK} strokeWidth={2.8} />
    <path d="M35 66.5 H65 M42.5 61 V72 M50 61 V72 M57.5 61 V72" stroke={INK} strokeWidth={1.5} />
    <P d="M70 6 Q75 1 80 6 Q85 11 90 6" w={2.2} /><P d="M10 6 Q15 1 20 6 Q25 11 30 6" w={2.2} />
  </g>,
  proud: (c) => <g>
    <P d="M29 45 Q36 38 43 45" w={3.2} /><P d="M57 45 Q64 38 71 45" w={3.2} />
    <P d="M28 32 Q36 27 44 31" w={2.8} /><P d="M56 31 Q64 27 72 32" w={2.8} />
    <P d="M30 58 Q50 76 70 58" w={3.6} />
    <path d="M86 14 L88.5 21 L95.5 23.5 L88.5 26 L86 33 L83.5 26 L76.5 23.5 L83.5 21Z" fill={c ? '#facc15' : '#fff'} stroke={c ? '#a16207' : INK} strokeWidth={1.6} strokeLinejoin="round" />
  </g>,
}

// The face inside an SVG, in its own 100×100 coordinates, placed at (x, y) and scaled to `size`.
export function FaceG({ id, x = 0, y = 0, size = 100, color = true }) {
  const e = emotionById[id]
  return <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${(size / 100).toFixed(4)})`}>
    <circle cx={50} cy={52} r={40} fill={color ? e.color[1] : '#fff'} stroke={INK} strokeWidth={3.2} />
    {PARTS[id](color)}
  </g>
}

// A standalone face for the screen.
export function Face({ id, size = 96, color = true, label, className = '' }) {
  const e = emotionById[id]
  return <svg viewBox="0 0 100 100" width={size} height={size} role={label === false ? undefined : 'img'} aria-hidden={label === false ? true : undefined}
    aria-label={label === false ? undefined : (label || `פנים: ${e.m}`)} className={`inline-block ${className}`}>
    <FaceG id={id} color={color} />
  </svg>
}
