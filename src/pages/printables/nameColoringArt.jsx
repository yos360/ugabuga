// Line-art for the name colouring sheets: 8 themes × 7 motifs, all drawn here as simple bold
// outlines with a white fill (so overlapping shapes stay clean and everything prints in black and
// white). Each motif is drawn in a box of about −15…15 around (0, 0) and placed with a transform.

const L = { fill: '#fff', stroke: '#111', strokeWidth: 1.15, strokeLinejoin: 'round', strokeLinecap: 'round' }
const N = { fill: 'none', stroke: '#111', strokeWidth: 1, strokeLinejoin: 'round', strokeLinecap: 'round' }
const DOT = { fill: '#111', stroke: 'none' }

export const starPath = (cx, cy, r, inner = 0.45, n = 5) => Array.from({ length: n * 2 }, (_, i) => {
  const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * inner : r
  return `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`
}).join(' ') + ' Z'
const polygon = (cx, cy, r, n, rot = -Math.PI / 2) => Array.from({ length: n }, (_, i) => {
  const a = rot + i * 2 * Math.PI / n
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
})
const poly = pts => 'M' + pts.map(p => p.map(v => v.toFixed(2)).join(' ')).join(' L') + ' Z'
const heartPath = (cx, cy, s) => `M${cx} ${cy + s * 0.8} C ${cx - s * 1.3} ${cy - s * 0.1} ${cx - s * 0.7} ${cy - s} ${cx} ${cy - s * 0.35} C ${cx + s * 0.7} ${cy - s} ${cx + s * 1.3} ${cy - s * 0.1} ${cx} ${cy + s * 0.8} Z`

const Star = () => <path d={starPath(0, 0, 10)} {...L} />
const Sparkle = () => <path d={starPath(0, 0, 8, 0.3, 4)} {...L} />

// ── art & crafts ──
const Palette = () => <g>
  <path d="M-13 1 C-13 -9 -4 -13 4 -12 C12 -11 15 -4 13 1 C11.5 4.5 7 3 5.5 6 C4 9.5 0 12 -5 11 C-10 10 -13 6 -13 1 Z" {...L} />
  <circle cx="5.5" cy="-1.5" r="2.4" {...L} />
  {[[-8, -1], [-4, -7.5], [3, -8], [-6.5, 5.5]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.5" {...L} />)}
</g>
const Brush = () => <g transform="rotate(-38)">
  <rect x="-2" y="-1" width="4" height="16" rx="2" {...L} />
  <rect x="-2.8" y="-6" width="5.6" height="5" rx="0.8" {...L} />
  <path d="M-2.8 -6 C-3.2 -10 -1.2 -13 0 -16 C1.2 -13 3.2 -10 2.8 -6 Z" {...L} />
  <path d="M-2.8 -3.5 H2.8" {...N} />
</g>
const Pencil = () => <g transform="rotate(32)">
  <rect x="-3.2" y="-8" width="6.4" height="17" {...L} />
  <path d="M-1.07 -8 V9 M1.07 -8 V9" {...N} strokeWidth="0.6" />
  <rect x="-3.2" y="9" width="6.4" height="4.5" rx="1.4" {...L} />
  <path d="M-3.2 -8 L0 -15 L3.2 -8 Z" {...L} />
  <path d="M-1.1 -12.6 L0 -15 L1.1 -12.6 Z" {...DOT} />
</g>
const Crayon = () => <g transform="rotate(-18)">
  <rect x="-3.6" y="-7" width="7.2" height="20" rx="1.2" {...L} />
  <path d="M-3.6 -7 L-2.2 -12 C-1 -14 1 -14 2.2 -12 L3.6 -7 Z" {...L} />
  <path d="M-3.6 -3 H3.6 M-3.6 9 H3.6" {...N} />
  <path d="M-2 3 C-1 1 1 5 2 3" {...N} strokeWidth="0.7" />
</g>
const Scissors = () => <g>
  <path d="M-2.6 4 L3.6 -14 C4.6 -13.5 5 -12.4 4.6 -11.4 L0.4 3.2 Z" {...L} />
  <path d="M2.6 4 L-3.6 -14 C-4.6 -13.5 -5 -12.4 -4.6 -11.4 L-0.4 3.2 Z" {...L} />
  <circle cx="-5" cy="8" r="4" {...L} /><circle cx="-5" cy="8" r="1.8" {...L} />
  <circle cx="5" cy="8" r="4" {...L} /><circle cx="5" cy="8" r="1.8" {...L} />
  <circle cx="0" cy="-2" r="1" {...DOT} />
</g>
const PaintJar = () => <g>
  <path d="M-8 -5 H8 V9 C8 11 6.5 12 5 12 H-5 C-6.5 12 -8 11 -8 9 Z" {...L} />
  <rect x="-9" y="-9" width="18" height="4.5" rx="1.5" {...L} />
  <rect x="-5" y="0" width="10" height="7" rx="1.5" {...L} />
  <path d="M-4 -9 C-4 -13 -1 -13 -1 -10 M3 -9 C3 -12 5 -12 5 -10" {...N} />
</g>

// ── sports ──
const Football = () => {
  const inner = polygon(0, 0, 4.4, 5)
  // Five outer patches in line with the centre patch's corners, cut off by the ball's edge.
  const patches = Array.from({ length: 5 }, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return polygon(Math.cos(a) * 12, Math.sin(a) * 12, 4.2, 5, a + Math.PI) })
  return <g>
    <defs><clipPath id="nc-ball"><circle r="12" /></clipPath></defs>
    <circle r="12" {...L} />
    <g clipPath="url(#nc-ball)">{patches.map((p, i) => <path key={i} d={poly(p)} {...L} strokeWidth="1" />)}</g>
    {inner.map((p, i) => <path key={i} d={`M${p[0].toFixed(2)} ${p[1].toFixed(2)} L${(p[0] * 1.77).toFixed(2)} ${(p[1] * 1.77).toFixed(2)}`} {...N} />)}
    <path d={poly(inner)} {...L} />
    <circle r="12" {...N} strokeWidth="1.15" />
  </g>
}
const Basketball = () => <g>
  <circle r="11.5" {...L} />
  <path d="M0 -11.5 V11.5 M-11.5 0 H11.5 M-8 -8.3 C-3 -4 -3 4 -8 8.3 M8 -8.3 C3 -4 3 4 8 8.3" {...N} />
</g>
const Trophy = () => <g>
  <path d="M-8 -6.5 C-14 -7 -14 2 -6.5 2.5 M8 -6.5 C14 -7 14 2 6.5 2.5" {...N} strokeWidth="1.3" />
  <path d="M-8.5 -11 H8.5 V-4 C8.5 3 4.5 6 0 6 C-4.5 6 -8.5 3 -8.5 -4 Z" {...L} />
  <rect x="-1.7" y="6" width="3.4" height="4" {...L} />
  <rect x="-6.5" y="10" width="13" height="3.6" rx="1" {...L} />
  <path d={starPath(0, -3, 3.4)} {...L} strokeWidth="0.8" />
</g>
const Medal = () => <g>
  <path d="M-7.5 -14 H-3 L1.5 -3 H-3 Z" {...L} />
  <path d="M7.5 -14 H3 L-1.5 -3 H3 Z" {...L} />
  <circle cy="4" r="7.5" {...L} />
  <circle cy="4" r="5.2" {...N} strokeWidth="0.6" />
  <path d={starPath(0, 4, 3.4)} {...L} strokeWidth="0.8" />
</g>
const Sneaker = () => <g>
  <path d="M-13 4 C-13 -2 -11 -5 -8 -5 L-5 -9 H1.5 L3 -3.5 C8 -2.8 13 -0.5 13 3.5 V7 H-13 Z" {...L} />
  <path d="M-13 3.5 H13 M-13 7 V3.5" {...N} />
  <path d="M-4 -6 L-1 -4 M-3 -3.5 L0 -1.5 M-2 -1 L1 1" {...N} strokeWidth="0.8" />
  <path d="M-10 5.3 H-7 M-4 5.3 H-1 M2 5.3 H5 M8 5.3 H11" {...N} strokeWidth="0.6" />
</g>
const Goal = () => <g>
  <path d="M-14 9 V-8 H14 V9" {...N} strokeWidth="1.8" />
  <path d="M-9 -8 V9 M-4 -8 V9 M1 -8 V9 M6 -8 V9 M10.5 -8 V9 M-14 -3.5 H14 M-14 1 H14 M-14 5.5 H14" {...N} strokeWidth="0.45" />
  <circle cx="0" cy="9" r="4.5" {...L} />
  <path d={poly(polygon(0, 9, 1.7, 5))} {...DOT} />
</g>

// ── space ──
const Rocket = () => <g transform="rotate(30)">
  <path d="M-5.5 5 L-10.5 13 L-5.5 11 Z M5.5 5 L10.5 13 L5.5 11 Z" {...L} />
  <path d="M0 -16 C7 -8 7 6 5.5 11.5 H-5.5 C-7 6 -7 -8 0 -16 Z" {...L} />
  <circle cx="0" cy="-3" r="3.2" {...L} />
  <path d="M-3.5 11.5 L-2 16 L0 13.5 L2 16 L3.5 11.5" {...L} />
  <path d="M-4.3 -9.5 H4.3" {...N} />
</g>
const Planet = () => <g>
  <path d="M-15 3 C-16 6 -6 5.5 2 2.5 C9 0 16 -4.5 15 -7" {...N} strokeWidth="1.15" />
  <circle r="9" {...L} />
  <path d="M-9 2.4 C-6 4 4 1.5 9 -2.6" {...N} />
  <path d="M-15 3 C-16.5 0 -11 -1.8 -8.6 -2.6 M15 -7 C15.8 -4.5 11.5 -3 8.8 2" {...N} strokeWidth="1.15" />
  <circle cx="-3" cy="-4" r="1.8" {...L} strokeWidth="0.7" /><circle cx="3" cy="4.5" r="1.2" {...L} strokeWidth="0.7" />
</g>
const Moon = () => <g transform="rotate(-20)">
  <path d="M4 -12 A12 12 0 1 0 4 12 A15 15 0 0 1 4 -12 Z" {...L} />
  <circle cx="-5" cy="-3" r="1.5" {...L} strokeWidth="0.7" /><circle cx="-4" cy="5" r="2" {...L} strokeWidth="0.7" />
</g>
const Ufo = () => <g>
  <path d="M-6.5 -2 C-6.5 -11 6.5 -11 6.5 -2 Z" {...L} />
  <ellipse cy="1" rx="14" ry="4.8" {...L} />
  {[-8, 0, 8].map(x => <circle key={x} cx={x} cy="1.3" r="1.3" {...L} strokeWidth="0.7" />)}
  <path d="M-5 6 L-8 12 M0 6 V12.5 M5 6 L8 12" {...N} strokeWidth="0.8" strokeDasharray="1.5 1.5" />
</g>
const Comet = () => <g>
  <path d="M-14 12 L-1 2 M-12 5 L-2 0 M-7 13 L1 4" {...N} />
  <path d={starPath(4, -4, 9)} {...L} />
</g>
const Astronaut = () => <g>
  <rect x="-8" y="2" width="16" height="12" rx="4" {...L} />
  <circle cy="-4" r="9" {...L} />
  <rect x="-6" y="-8.5" width="12" height="8" rx="4" {...L} />
  <path d="M-3.5 -6.5 C-2 -7.5 0 -7.5 1 -7" {...N} strokeWidth="0.7" />
  <rect x="-3.5" y="6" width="7" height="4" rx="1" {...L} strokeWidth="0.8" />
</g>

// ── animals ──
const Cat = () => <g>
  <path d="M-8.5 -2 L-8 -13 L-2 -7.5 Z M8.5 -2 L8 -13 L2 -7.5 Z" {...L} />
  <ellipse cy="1" rx="10" ry="9" {...L} />
  <circle cx="-3.6" cy="-0.5" r="1.3" {...DOT} /><circle cx="3.6" cy="-0.5" r="1.3" {...DOT} />
  <path d="M-1.2 2.6 H1.2 L0 4 Z" {...DOT} />
  <path d="M-2.4 5.6 C-1.2 6.8 0 6 0 4 C0 6 1.2 6.8 2.4 5.6 M-4 3 L-12 1.5 M-4 4.5 L-12 6 M4 3 L12 1.5 M4 4.5 L12 6" {...N} strokeWidth="0.7" />
</g>
const Dog = () => <g>
  <ellipse cy="0" rx="8.5" ry="9.5" {...L} />
  <ellipse cx="-9" cy="-1" rx="3.6" ry="7.5" transform="rotate(18 -9 -1)" {...L} />
  <ellipse cx="9" cy="-1" rx="3.6" ry="7.5" transform="rotate(-18 9 -1)" {...L} />
  <circle cx="-3.3" cy="-2.5" r="1.3" {...DOT} /><circle cx="3.3" cy="-2.5" r="1.3" {...DOT} />
  <ellipse cy="2.5" rx="2.2" ry="1.5" {...DOT} />
  <path d="M0 4 V5.5 M-3 5.6 C-1.5 7.4 1.5 7.4 3 5.6" {...N} strokeWidth="0.8" />
  <path d="M-1.4 6.6 C-1.4 9.6 1.4 9.6 1.4 6.6" {...L} strokeWidth="0.7" />
</g>
const Bird = () => <g>
  <path d="M-9 1 L-15 -2 L-14 4 Z" {...L} />
  <ellipse cx="-1" cy="2" rx="10" ry="7.5" {...L} />
  <circle cx="7" cy="-5" r="5.5" {...L} />
  <path d="M12 -6 L16 -4.3 L12 -3 Z" {...L} />
  <circle cx="8.3" cy="-6" r="1" {...DOT} />
  <path d="M-6 0 C-3 6 3 6 4 1 C1 3 -3 2 -6 0 Z" {...L} strokeWidth="0.8" />
  <path d="M-2 9.5 V13 M-3.5 13 H-0.5 M2 9.4 V13 M0.5 13 H3.5" {...N} strokeWidth="0.8" />
</g>
const Turtle = () => <g>
  <circle cx="13" cy="2" r="3.6" {...L} />
  <path d="M-9.5 3 V7.5 C-9.5 9 -6 9 -6 7.5 V3 M5 3 V7.5 C5 9 8.5 9 8.5 7.5 V3" {...L} />
  <path d="M-14 4 L-16 6" {...N} />
  <path d="M-13 4.5 C-13 -9 11 -9 11 4.5 Z" {...L} />
  <path d={poly(polygon(-1, -1.5, 3.6, 6, 0))} {...N} strokeWidth="0.8" />
  <path d="M2.6 -1.5 L8 0 M-4.6 -1.5 L-10 0 M-2.8 -4.6 L-5 -8 M0.8 -4.6 L3 -8 M-2.8 1.6 L-3.5 4.5 M0.8 1.6 L1.5 4.5" {...N} strokeWidth="0.8" />
  <circle cx="14" cy="1" r="0.8" {...DOT} />
</g>
const Snail = () => <g>
  <path d="M-14 8 H9 C12 8 13 6 12.5 3 L11 -4 M12.5 3 L15 -3" {...L} />
  <path d="M11 -4 L9 -10 M15 -3 L16 -9" {...N} />
  <circle cx="9" cy="-10" r="1.2" {...DOT} /><circle cx="16" cy="-9" r="1.2" {...DOT} />
  <circle cx="-2" cy="-1" r="9" {...L} />
  <path d="M-2 -1 C-2 -3 1 -3 1 -1 C1 2 -4 2.5 -4.6 -1 C-5 -5 1 -6 3.6 -2.5 C6 1 3.5 6 -1.5 6" {...N} />
</g>
const Bunny = () => <g>
  <ellipse cx="-3.5" cy="-8" rx="2.8" ry="7.5" transform="rotate(-12 -3.5 -8)" {...L} />
  <ellipse cx="3.5" cy="-8" rx="2.8" ry="7.5" transform="rotate(12 3.5 -8)" {...L} />
  <path d="M-3.6 -12 V-5 M3.6 -12 V-5" {...N} strokeWidth="0.7" transform="" />
  <circle cy="4" r="8" {...L} />
  <circle cx="-3" cy="2.5" r="1.2" {...DOT} /><circle cx="3" cy="2.5" r="1.2" {...DOT} />
  <path d="M-1 5 H1 L0 6.2 Z" {...DOT} />
  <path d="M0 6.2 V7.5 M-2 8.2 C-1 9 0 8.5 0 7.5 C0 8.5 1 9 2 8.2" {...N} strokeWidth="0.7" />
</g>
const Owl = () => <g>
  <path d="M-9 -6 L-10 -14 L-4 -10 M9 -6 L10 -14 L4 -10" {...L} />
  <ellipse cy="1" rx="10" ry="12.5" {...L} />
  <circle cx="-4.3" cy="-4" r="4" {...L} /><circle cx="4.3" cy="-4" r="4" {...L} />
  <circle cx="-4.3" cy="-4" r="1.5" {...DOT} /><circle cx="4.3" cy="-4" r="1.5" {...DOT} />
  <path d="M-1.5 -0.5 L0 2.5 L1.5 -0.5 Z" {...L} strokeWidth="0.8" />
  <path d="M-10 1 C-7 5 -7 9 -9 11 M10 1 C7 5 7 9 9 11 M-3 6 L-1.5 7.5 L0 6 L1.5 7.5 L3 6 M-3 9.5 L-1.5 11 L0 9.5 L1.5 11 L3 9.5" {...N} strokeWidth="0.8" />
</g>

// ── flowers & butterflies ──
const Flower = () => <g>
  {Array.from({ length: 6 }, (_, i) => { const a = i * Math.PI / 3, x = Math.cos(a) * 7, y = Math.sin(a) * 7; return <ellipse key={i} cx={x} cy={y} rx="5" ry="3.4" transform={`rotate(${i * 60} ${x} ${y})`} {...L} /> })}
  <circle r="4" {...L} />
  <circle cx="-1.2" cy="-1" r="0.6" {...DOT} /><circle cx="1.3" cy="0.4" r="0.6" {...DOT} /><circle cx="-0.3" cy="1.6" r="0.6" {...DOT} />
</g>
const Butterfly = () => <g>
  <ellipse cx="-6.5" cy="-4.5" rx="6.5" ry="5.5" transform="rotate(-25 -6.5 -4.5)" {...L} />
  <ellipse cx="6.5" cy="-4.5" rx="6.5" ry="5.5" transform="rotate(25 6.5 -4.5)" {...L} />
  <ellipse cx="-5" cy="5" rx="4.5" ry="4" transform="rotate(25 -5 5)" {...L} />
  <ellipse cx="5" cy="5" rx="4.5" ry="4" transform="rotate(-25 5 5)" {...L} />
  <circle cx="-7" cy="-5" r="2" {...L} strokeWidth="0.7" /><circle cx="7" cy="-5" r="2" {...L} strokeWidth="0.7" />
  <ellipse cy="0" rx="1.8" ry="9" {...L} />
  <path d="M-0.8 -8.5 C-2 -12 -4 -13 -5 -13 M0.8 -8.5 C2 -12 4 -13 5 -13" {...N} strokeWidth="0.8" />
  <circle cx="-5" cy="-13" r="0.9" {...DOT} /><circle cx="5" cy="-13" r="0.9" {...DOT} />
</g>
const Tulip = () => <g>
  <path d="M0 2 V15" {...N} strokeWidth="1.3" />
  <path d="M0 13 C-6 12 -9 7 -8 3 C-4 4 -1 8 0 13 Z" {...L} />
  <path d="M-6.5 -11 L-3 -6.5 L0 -12 L3 -6.5 L6.5 -11 C8 -3 5 2.5 0 2.5 C-5 2.5 -8 -3 -6.5 -11 Z" {...L} />
</g>
const Daisy = () => <g>
  {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx="0" cy="-7.5" rx="2.3" ry="5" transform={`rotate(${i * 36})`} {...L} />)}
  <circle r="3.6" {...L} />
</g>
const Ladybug = () => <g>
  <path d="M-4.5 -8 L-7 -12 M4.5 -8 L7 -12 M-9 1 L-13 0 M9 1 L13 0 M-8 6 L-12 8 M8 6 L12 8" {...N} />
  <circle cy="-7" r="4.5" {...L} />
  <circle cy="2" r="9.5" {...L} />
  <path d="M0 -7.5 V11.5" {...N} />
  {[[-4.5, -1], [4.5, -1], [-5, 5.5], [5, 5.5], [-2, 2.5], [2, 2.5]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i > 3 ? 1.1 : 1.9} {...L} strokeWidth="0.8" />)}
</g>
const Bee = () => <g>
  <ellipse cx="-3" cy="-8" rx="4" ry="5.5" transform="rotate(-25 -3 -8)" {...L} />
  <ellipse cx="3" cy="-8" rx="4" ry="5.5" transform="rotate(25 3 -8)" {...L} />
  <path d="M-11 0 L-14.5 0.5 L-11 1.5 Z" {...L} />
  <ellipse cy="1" rx="11" ry="7" {...L} />
  <path d="M-4 -5.5 C-5.5 -2 -5.5 4 -4 7.6 M1 -5.9 C-0.5 -2 -0.5 4 1 7.9" {...N} strokeWidth="1.6" />
  <circle cx="7" cy="-0.5" r="1.2" {...DOT} />
  <path d="M6.5 3.5 C7.5 4.5 8.5 4.5 9.5 3.3 M9 -6 L11 -10 M7 -6 L7.5 -10.5" {...N} strokeWidth="0.8" />
</g>
const Sun = () => <g>
  {Array.from({ length: 8 }, (_, i) => <path key={i} d="M-2.2 -7.6 L0 -14 L2.2 -7.6 Z" transform={`rotate(${i * 45})`} {...L} />)}
  <circle r="8" {...L} />
  <circle cx="-2.8" cy="-1.5" r="1" {...DOT} /><circle cx="2.8" cy="-1.5" r="1" {...DOT} />
  <path d="M-3 2.5 C-1.5 4.5 1.5 4.5 3 2.5" {...N} />
</g>

// ── vehicles ──
const Car = () => <g>
  <path d="M-14 5 V0 C-14 -2.5 -12.5 -3.5 -10.5 -3.5 L-6.5 -9.5 H5.5 L9.5 -3.5 H12 C13.5 -3.5 14 -2 14 0 V5 Z" {...L} />
  <path d="M-5 -3.5 L-3.4 -7.6 H-0.5 V-3.5 Z M1.5 -3.5 V-7.6 H4.6 L7 -3.5 Z" {...L} strokeWidth="0.8" />
  <path d="M-1 0 H1.5" {...N} />
  <circle cx="-8" cy="5" r="3.8" {...L} /><circle cx="-8" cy="5" r="1.3" {...L} />
  <circle cx="8" cy="5" r="3.8" {...L} /><circle cx="8" cy="5" r="1.3" {...L} />
</g>
const Bus = () => <g>
  <rect x="-14" y="-10" width="28" height="16" rx="3" {...L} />
  {[-11.5, -5.5, 0.5].map(x => <rect key={x} x={x} y="-7.5" width="4.6" height="5" rx="0.8" {...L} strokeWidth="0.8" />)}
  <rect x="7" y="-7.5" width="4.6" height="11" rx="0.8" {...L} strokeWidth="0.8" />
  <path d="M-14 0 H6" {...N} strokeWidth="0.8" />
  <circle cx="-8" cy="6" r="3.4" {...L} /><circle cx="-8" cy="6" r="1.1" {...L} />
  <circle cx="8" cy="6" r="3.4" {...L} /><circle cx="8" cy="6" r="1.1" {...L} />
</g>
const Plane = () => <g transform="rotate(-12)">
  <path d="M-1 -1 L-6 -10 H-2.5 L5 -1 Z" {...L} />
  <path d="M-12.5 -1.5 L-15.5 -8.5 H-12.5 L-8.5 -1.5 Z" {...L} />
  <path d="M-15 0 C-15 -3 -10 -3.5 -6 -3.5 H10 C13 -3.5 15.5 -2 15.5 0 C15.5 2 13 3.5 10 3.5 H-6 C-10 3.5 -15 3 -15 0 Z" {...L} />
  <path d="M-1 1 L-6 11 H-2.5 L5 1 Z" {...L} />
  {[-4, 0, 4, 8].map(x => <circle key={x} cx={x} cy="-0.8" r="0.9" {...L} strokeWidth="0.6" />)}
</g>
const Train = () => <g>
  <circle cx="-9" cy="-14" r="1.6" {...L} strokeWidth="0.7" /><circle cx="-6" cy="-15.5" r="2.2" {...L} strokeWidth="0.7" />
  <rect x="-10.5" y="-11" width="4" height="7" {...L} />
  <rect x="-13" y="-4.5" width="15" height="10" rx="2" {...L} />
  <rect x="2" y="-11" width="11" height="16.5" rx="1" {...L} />
  <rect x="4.5" y="-8.5" width="6" height="5" rx="0.8" {...L} strokeWidth="0.8" />
  <path d="M1 -12.5 H14" {...N} strokeWidth="1.4" />
  <circle cx="-8" cy="7" r="3" {...L} /><circle cx="-1" cy="7" r="3" {...L} /><circle cx="8" cy="6.5" r="3.5" {...L} />
  <path d="M-13 5.5 L-15.5 9 H-12" {...N} />
</g>
const Bicycle = () => <g>
  <circle cx="-8" cy="4" r="6.5" {...L} /><circle cx="-8" cy="4" r="0.9" {...DOT} />
  <circle cx="8" cy="4" r="6.5" {...L} /><circle cx="8" cy="4" r="0.9" {...DOT} />
  <path d="M-8 4 L-2.5 -4.5 H6 L8 4 M-2.5 -4.5 L0.5 4 L6 -4.5 M0.5 4 H-8 M-3.5 -7 L-2.5 -4.5 M6 -4.5 L5 -8.5 H8" {...N} strokeWidth="1.1" />
  <path d="M-6 -7.5 H-1.5" {...N} strokeWidth="1.8" />
</g>
const HotAirBalloon = () => <g>
  <path d="M-3.2 6 L-4.5 10.5 M3.2 6 L4.5 10.5" {...N} strokeWidth="0.8" />
  <path d="M0 -15 C10 -15 12.5 -5 7 1.5 L3.2 6 H-3.2 L-7 1.5 C-12.5 -5 -10 -15 0 -15 Z" {...L} />
  <path d="M0 -15 C-4 -11 -4 1 -2 6 M0 -15 C4 -11 4 1 2 6 M-10.6 -6 H10.6" {...N} strokeWidth="0.8" />
  <rect x="-4.5" y="10.5" width="9" height="5" rx="1" {...L} />
</g>

// ── sea ──
const Fish = () => <g>
  <path d="M9 0 L15.5 -6.5 V6.5 Z" {...L} />
  <path d="M-12 0 C-7 -9 6 -9 10 0 C6 9 -7 9 -12 0 Z" {...L} />
  <path d="M-1 -6.5 C1 -10 5 -10 6 -5.5" {...L} strokeWidth="0.9" />
  <circle cx="-7" cy="-1.5" r="1.4" {...DOT} />
  <path d="M-3.5 -4 C-1.5 -1.5 -1.5 1.5 -3.5 4 M0 -1.5 C1.5 -0.5 1.5 0.5 0 1.5 M3.5 -3 C5 -1.5 5 1.5 3.5 3" {...N} strokeWidth="0.8" />
</g>
const Whale = () => <g>
  <path d="M-4 -9 C-5 -12 -3 -14 -1.5 -12 C-1 -14 1 -14 0.5 -11.5 M-2 -9 V-12" {...N} strokeWidth="0.9" />
  <path d="M-14 1 C-14 -9 4 -9.5 8 -2 C9.5 0.5 11 -3 15 -6 C15 -1 14 3 11.5 4.5 C7 9.5 -14 10.5 -14 1 Z" {...L} />
  <circle cx="-8.5" cy="-1.5" r="1.2" {...DOT} />
  <path d="M-12.5 3 C-8 5.5 -2 5.5 2 3.5 M-3 5.5 C-2 8 1 8.5 2.5 7.5" {...N} strokeWidth="0.8" />
</g>
const Shell = () => <g>
  <path d="M-3.5 9 L-5 13 H5 L3.5 9 Z" {...L} />
  <path d="M0 10 L-12 -1 C-11 -11 11 -11 12 -1 Z" {...L} />
  <path d="M0 10 L-8 -8 M0 10 L-3 -10 M0 10 L3 -10 M0 10 L8 -8 M0 10 L-11.5 -4 M0 10 L11.5 -4" {...N} strokeWidth="0.8" />
</g>
const Starfish = () => <g>
  <path d={starPath(0, 0, 13, 0.48)} {...L} strokeWidth="1.3" />
  {[[0, -6], [5.5, -2], [3.5, 4.8], [-3.5, 4.8], [-5.5, -2]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="0.9" {...DOT} />)}
</g>
const Octopus = () => <g>
  {[-8, -3, 2, 7].map((x, i) => <path key={x} d={`M${x} 0 C${x - 1} 5 ${x + 3} 8 ${x + (i % 2 ? 3 : -2)} 13`} {...N} strokeWidth="2.6" />)}
  {[-8, -3, 2, 7].map((x, i) => <path key={x} d={`M${x} 0 C${x - 1} 5 ${x + 3} 8 ${x + (i % 2 ? 3 : -2)} 13`} fill="none" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />)}
  <path d="M-10 2 C-12 -14 12 -14 10 2 Z" {...L} />
  <circle cx="-3.5" cy="-4" r="1.4" {...DOT} /><circle cx="3.5" cy="-4" r="1.4" {...DOT} />
  <path d="M-2.5 -0.5 C-1 1 1 1 2.5 -0.5" {...N} strokeWidth="0.8" />
</g>
const Sailboat = () => <g>
  <path d="M0 -14 V5" {...N} strokeWidth="1.2" />
  <path d="M1.5 -12 L11 2.5 H1.5 Z" {...L} />
  <path d="M-1.5 -9 L-9 2.5 H-1.5 Z" {...L} />
  <path d="M0 -14 L4.5 -12.5 L0 -11" {...L} strokeWidth="0.8" />
  <path d="M-13 5 H13 L9 11 H-9 Z" {...L} />
  <path d="M-15 14 C-12 12 -9 16 -6 14 C-3 12 0 16 3 14 C6 12 9 16 12 14" {...N} strokeWidth="0.9" />
</g>
const Crab = () => <g>
  <path d="M-8 3 L-13 6 M-8 6 L-12 10 M8 3 L13 6 M8 6 L12 10" {...N} />
  <path d="M-7 -1 L-10 -6 M7 -1 L10 -6" {...N} />
  <path d="M-10 -6 C-15 -7 -15 -13 -11 -14 L-9.5 -10.5 L-7.5 -13 C-6 -10 -7 -6.5 -10 -6 Z" {...L} />
  <path d="M10 -6 C15 -7 15 -13 11 -14 L9.5 -10.5 L7.5 -13 C6 -10 7 -6.5 10 -6 Z" {...L} />
  <ellipse cy="3" rx="9.5" ry="6.5" {...L} />
  <path d="M-2.5 -3 V-7 M2.5 -3 V-7" {...N} />
  <circle cx="-2.5" cy="-7.5" r="1.4" {...L} strokeWidth="0.8" /><circle cx="2.5" cy="-7.5" r="1.4" {...L} strokeWidth="0.8" />
  <path d="M-2.5 4.5 C-1 6 1 6 2.5 4.5" {...N} strokeWidth="0.8" />
</g>

// ── party ──
const Balloon = () => <g>
  <path d="M0 9.5 C-3.5 12 3.5 14 0 17" {...N} strokeWidth="0.8" />
  <ellipse cy="-2" rx="8.5" ry="10.5" {...L} />
  <path d="M-1.6 8.4 L0 10 L1.6 8.4 Z" {...L} strokeWidth="0.8" />
  <path d="M-4.5 -7 C-4 -9 -2.5 -10 -1 -10.5" {...N} strokeWidth="0.8" />
</g>
const Gift = () => <g>
  <path d="M0 -8 C-3 -14 -9 -13 -7 -9 C-6 -7.5 -3 -8 0 -8 C3 -8 6 -7.5 7 -9 C9 -13 3 -14 0 -8 Z" {...L} />
  <rect x="-11" y="-8" width="22" height="5.5" rx="1" {...L} />
  <rect x="-9.5" y="-2.5" width="19" height="14" rx="1" {...L} />
  <path d="M-2 -8 V11.5 M2 -8 V11.5" {...N} />
</g>
const PartyHat = () => <g>
  <path d="M0 -13 L-9 11 C-4 13.5 4 13.5 9 11 Z" {...L} />
  <path d="M-3.6 -3.5 L3.6 -3.5 M-6.3 4 L6.3 4" {...N} strokeWidth="0.8" />
  <circle cy="-13.5" r="2.6" {...L} />
  <circle cx="-2" cy="1" r="0.9" {...DOT} /><circle cx="2.3" cy="7.5" r="0.9" {...DOT} /><circle cx="1" cy="-7" r="0.8" {...DOT} />
</g>
const Cupcake = () => <g>
  <path d="M-8 1 L-6 13 H6 L8 1 Z" {...L} />
  <path d="M-4 1 L-3 13 M0 1 V13 M4 1 L3 13" {...N} strokeWidth="0.7" />
  <path d="M-10 1.5 C-12 -3 -8 -6 -6 -5 C-6 -10 0 -12 2 -8 C5 -10 10 -6 8 -3 C11 -2 11 1.5 9 1.5 Z" {...L} />
  <circle cy="-10.5" r="2.2" {...L} />
</g>
const Heart = () => <path d={heartPath(0, 0, 10)} {...L} />
const Confetti = () => <g>
  <path d="M-12 -8 L-8 -11 M6 -12 L10 -9 M-3 6 L1 9 M8 4 L12 2 M-11 7 L-8 10" {...N} strokeWidth="1.3" />
  <path d={starPath(-1, -3, 4.5)} {...L} strokeWidth="0.9" />
  <circle cx="9" cy="-3" r="1.8" {...L} strokeWidth="0.8" /><circle cx="-8" cy="1" r="1.5" {...L} strokeWidth="0.8" />
</g>

export const THEMES = {
  art: { label: 'אמנות ויצירה', emoji: '🎨', motifs: [Palette, Brush, Pencil, Crayon, Scissors, PaintJar, Star] },
  sports: { label: 'כדורגל וספורט', emoji: '⚽', motifs: [Football, Trophy, Basketball, Medal, Sneaker, Goal, Star] },
  space: { label: 'חלל', emoji: '🚀', motifs: [Rocket, Planet, Moon, Ufo, Comet, Astronaut, Star] },
  animals: { label: 'חיות', emoji: '🐱', motifs: [Cat, Dog, Bird, Turtle, Snail, Bunny, Owl] },
  flowers: { label: 'פרחים ופרפרים', emoji: '🦋', motifs: [Butterfly, Flower, Tulip, Ladybug, Daisy, Bee, Sun] },
  vehicles: { label: 'כלי תחבורה', emoji: '🚌', motifs: [Car, Bus, Plane, Train, Bicycle, HotAirBalloon, Sparkle] },
  sea: { label: 'ים', emoji: '🐠', motifs: [Fish, Whale, Shell, Starfish, Octopus, Sailboat, Crab] },
  party: { label: 'יום הולדת וחגיגה', emoji: '🎈', motifs: [Balloon, Gift, PartyHat, Cupcake, Heart, Confetti, Star] },
}

// Motif slots: [x, y, scale, rotate]. 'full' = top band around the cloud (activities below);
// 'page' = the whole sheet (colouring only).
export const SPOTS = {
  full: [[22, 24, 1, -8], [178, 24, 1, 8], [24, 104, 1.05, 0], [176, 104, 1.05, 0], [15, 64, 0.55, 0], [185, 64, 0.55, 0], [100, 115, 0.58, 0], [62, 113, 0.5, 0], [138, 113, 0.5, 0]],
  page: [[30, 34, 1.3, -8], [170, 34, 1.3, 8], [100, 26, 0.75, 0], [32, 222, 1.35, 0], [168, 222, 1.35, 0], [100, 238, 1.1, 0], [62, 196, 0.7, 0], [138, 196, 0.7, 0], [64, 252, 0.6, 0], [136, 252, 0.6, 0], [62, 58, 0.55, 0], [138, 58, 0.55, 0]],
}

export function Motifs({ theme, layout }) {
  const list = THEMES[theme]?.motifs || THEMES.art.motifs
  return <g>{SPOTS[layout].map(([x, y, s, r], i) => {
    const M = list[i % list.length]
    return <g key={i} transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`}><M /></g>
  })}</g>
}

// A cloud: arcs bulging outward between points on an ellipse.
export function cloudPath(cx, cy, rx, ry, bumps = 14) {
  const pts = Array.from({ length: bumps }, (_, i) => {
    const a = i * 2 * Math.PI / bumps + 0.11
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]
  })
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`
  for (let i = 0; i < bumps; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % bumps]
    const r = Math.hypot(x2 - x1, y2 - y1) * 0.6
    d += ` A${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
  }
  return d + ' Z'
}
