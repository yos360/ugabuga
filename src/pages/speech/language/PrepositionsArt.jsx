// Drawings for /speech/language/prepositions: a cat and a box / table / chair / tree / house in
// small scenes (viewBox 0 0 200 150), and the room used by the "put the …" game and the
// cut-and-paste sheets (viewBox 0 0 400 220). Drawn by hand as simple shapes; every drawing takes
// a palette, so the same art serves the screen (colour) and the printer (outline only).

const INK = '#1f2937'
const EMOJI = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'

export const COLOR = {
  cat: '#fdba74', catEar: '#fda4af', box: '#e8c18d', boxTop: '#f1d3a8', boxSide: '#cf9f62', boxIn: '#9a6b37',
  wood: '#c98d5a', chair: '#7dd3fc', leaf: '#86efac', trunk: '#b7794a', house: '#fecaca', roof: '#f87171',
  floor: '#f1f5f9', grass: '#dcfce7', wall: '#fff', shelf: '#e2b98a', book1: '#93c5fd', book2: '#fca5a5', book3: '#fde68a',
}
export const PRINT = {
  cat: '#e5e7eb', catEar: '#fff', box: '#fff', boxTop: '#fff', boxSide: '#f3f4f6', boxIn: '#9ca3af',
  wood: '#fff', chair: '#fff', leaf: '#fff', trunk: '#fff', house: '#fff', roof: '#fff',
  floor: '#fff', grass: '#fff', wall: '#fff', shelf: '#fff', book1: '#fff', book2: '#fff', book3: '#fff',
}

const S = { stroke: INK, strokeWidth: 1.6, strokeLinejoin: 'round' }

// A sitting cat, bottom centre at (x, y), about 46 units tall at s = 1.
export function Cat({ x, y, s = 1, c }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M9 -5 C22 -4 25 -15 19 -25" fill="none" stroke={INK} strokeWidth="5.6" strokeLinecap="round" />
    <path d="M9 -5 C22 -4 25 -15 19 -25" fill="none" stroke={c.cat} strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="0" cy="-13" rx="12" ry="13" fill={c.cat} {...S} />
    <ellipse cx="-5" cy="-1.8" rx="3.6" ry="2.2" fill={c.cat} {...S} strokeWidth="1.2" />
    <ellipse cx="5" cy="-1.8" rx="3.6" ry="2.2" fill={c.cat} {...S} strokeWidth="1.2" />
    <polygon points="-9.5,-35 -8,-46.5 -1,-40" fill={c.cat} {...S} />
    <polygon points="9.5,-35 8,-46.5 1,-40" fill={c.cat} {...S} />
    <polygon points="-7.6,-37.5 -7.2,-43 -3.6,-40" fill={c.catEar} />
    <polygon points="7.6,-37.5 7.2,-43 3.6,-40" fill={c.catEar} />
    <circle cx="0" cy="-31" r="10" fill={c.cat} {...S} />
    <circle cx="-3.7" cy="-32.4" r="1.45" fill={INK} />
    <circle cx="3.7" cy="-32.4" r="1.45" fill={INK} />
    <polygon points="-1.4,-29 1.4,-29 0,-27.4" fill="#f472b6" stroke={INK} strokeWidth=".5" />
    <path d="M0 -27.4 q-1.4 2 -3 1 M0 -27.4 q1.4 2 3 1" fill="none" stroke={INK} strokeWidth=".8" strokeLinecap="round" />
    <path d="M-4.5 -28.6 L-12 -30 M-4.5 -27.6 L-12 -26.4 M4.5 -28.6 L12 -30 M4.5 -27.6 L12 -26.4" stroke={INK} strokeWidth=".55" strokeLinecap="round" />
  </g>
}

// An open or closed cardboard box, front-face bottom centre at (x, y). Split in two so a cat or a
// toy can sit inside: draw BoxBack, then what is inside, then BoxFront.
export function BoxBack({ x, y, open, c }) {
  if (!open) return null
  return <g>
    <polygon points={`${x - 27},${y - 34} ${x - 19},${y - 42} ${x + 35},${y - 42} ${x + 27},${y - 34}`} fill={c.boxIn} {...S} />
    <polygon points={`${x - 19},${y - 42} ${x + 35},${y - 42} ${x + 38},${y - 56} ${x - 16},${y - 56}`} fill={c.box} {...S} />
  </g>
}
export function BoxFront({ x, y, open, c }) {
  return <g>
    <rect x={x - 27} y={y - 34} width="54" height="34" fill={c.box} {...S} />
    <polygon points={`${x + 27},${y - 34} ${x + 35},${y - 42} ${x + 35},${y - 8} ${x + 27},${y}`} fill={c.boxSide} {...S} />
    {open
      ? <polygon points={`${x - 27},${y - 34} ${x - 19},${y - 42} ${x - 31},${y - 52} ${x - 39},${y - 44}`} fill={c.box} {...S} />
      : <g>
        <polygon points={`${x - 27},${y - 34} ${x - 19},${y - 42} ${x + 35},${y - 42} ${x + 27},${y - 34}`} fill={c.boxTop} {...S} />
        <line x1={x - 23} y1={y - 38} x2={x + 31} y2={y - 38} stroke={INK} strokeWidth=".7" />
      </g>}
    <path d={`M${x - 8} ${y - 20} h16`} stroke={INK} strokeWidth=".7" opacity=".55" />
  </g>
}
const Box = p => <><BoxBack {...p} /><BoxFront {...p} /></>

// A table: top at y - 48, w wide.
export function Table({ x, y, w = 96, c }) {
  return <g>
    <rect x={x - w / 2 + 4} y={y - 42} width="6" height="42" fill={c.wood} {...S} />
    <rect x={x + w / 2 - 10} y={y - 42} width="6" height="42" fill={c.wood} {...S} />
    <rect x={x - w / 2} y={y - 48} width={w} height="6" rx="1.5" fill={c.wood} {...S} />
  </g>
}

// A chair facing the viewer's left: seat top at y - 42, back on the right.
export function Chair({ x, y, c }) {
  return <g>
    <rect x={x - 20} y={y - 37} width="4" height="37" fill={c.chair} {...S} />
    <rect x={x + 16} y={y - 37} width="4" height="37" fill={c.chair} {...S} />
    <rect x={x + 14} y={y - 86} width="8" height="46" rx="2" fill={c.chair} {...S} />
    <rect x={x - 22} y={y - 42} width="46" height="5" rx="1.5" fill={c.chair} {...S} />
  </g>
}

function Tree({ x, y, c }) {
  return <g>
    <rect x={x - 6} y={y - 66} width="12" height="66" fill={c.trunk} {...S} />
    <polygon points={`${x + 4},${y - 49} ${x + 54},${y - 60} ${x + 54},${y - 54} ${x + 4},${y - 41}`} fill={c.trunk} {...S} />
    <circle cx={x - 22} cy={y - 72} r="18" fill={c.leaf} {...S} />
    <circle cx={x + 22} cy={y - 74} r="18" fill={c.leaf} {...S} />
    <circle cx={x} cy={y - 86} r="27" fill={c.leaf} {...S} />
  </g>
}

function House({ x, y, c }) {
  return <g>
    <rect x={x - 24} y={y - 36} width="48" height="36" fill={c.house} {...S} />
    <polygon points={`${x - 31},${y - 36} ${x},${y - 62} ${x + 31},${y - 36}`} fill={c.roof} {...S} />
    <rect x={x - 15} y={y - 21} width="12" height="21" fill="#fff" {...S} />
    <rect x={x + 5} y={y - 29} width="11" height="10" fill="#fff" {...S} />
  </g>
}

function Ground({ G, c, outdoor, w = 200, h = 150 }) {
  return <g>
    <rect x="0" y={G} width={w} height={h - G} fill={outdoor ? c.grass : c.floor} />
    <line x1="0" y1={G} x2={w} y2={G} stroke={INK} strokeWidth="1" />
  </g>
}

const G = 122
const BX = 92

// Each scene: what to draw, in order (back to front).
const SCENE_ART = {
  'in-box': c => <><BoxBack x={BX} y={G} open c={c} /><Cat x={BX} y={G - 14} s={0.82} c={c} /><BoxFront x={BX} y={G} open c={c} /></>,
  'on-box': c => <><Box x={BX} y={G} c={c} /><Cat x={BX + 4} y={G - 38} s={0.9} c={c} /></>,
  'next-box': c => <><Box x={BX} y={G} c={c} /><Cat x={BX + 60} y={G} s={0.9} c={c} /></>,
  'out-box': c => <><Box x={BX - 20} y={G} open c={c} /><Cat x={BX + 62} y={G} s={0.9} c={c} /></>,
  'above-box': c => <>
    <Box x={BX} y={G} c={c} />
    <ellipse cx={BX + 4} cy={G - 38} rx="11" ry="2.2" fill={INK} opacity=".18" />
    <path d={`M${BX - 18} ${G - 50} q-6 -8 0 -16 M${BX + 26} ${G - 50} q6 -8 0 -16`} fill="none" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
    <Cat x={BX + 4} y={G - 66} s={0.9} c={c} />
  </>,
  'front-box': c => <><Box x={BX} y={G} c={c} /><Cat x={BX - 4} y={G + 22} s={1} c={c} /></>,
  'behind-box': c => <><Cat x={BX + 4} y={G - 12} s={0.85} c={c} /><Box x={BX} y={G} c={c} /></>,
  'right-box': c => <><Box x={BX} y={G} c={c} /><Cat x={BX + 60} y={G} s={0.9} c={c} /></>,
  'left-box': c => <><Box x={BX} y={G} c={c} /><Cat x={BX - 58} y={G} s={0.9} c={c} /></>,
  'on-table': c => <><Table x={100} y={G} c={c} /><Cat x={100} y={G - 48} s={0.9} c={c} /></>,
  'under-table': c => <><Table x={100} y={G} c={c} /><Cat x={100} y={G} s={0.8} c={c} /></>,
  'next-table': c => <><Table x={88} y={G} c={c} /><Cat x={166} y={G} s={0.9} c={c} /></>,
  'on-chair': c => <><Chair x={92} y={G} c={c} /><Cat x={88} y={G - 42} s={0.82} c={c} /></>,
  'under-chair': c => <><Chair x={92} y={G} c={c} /><Cat x={90} y={G} s={0.7} c={c} /></>,
  'next-chair': c => <><Chair x={80} y={G} c={c} /><Cat x={146} y={G} s={0.9} c={c} /></>,
  'up-tree': c => <><Tree x={70} y={G} c={c} /><Cat x={110} y={G - 56} s={0.62} c={c} /></>,
  'down-tree': c => <><Tree x={70} y={G} c={c} /><Cat x={142} y={G} s={0.82} c={c} /></>,
  'near-house': c => <><House x={42} y={G} c={c} /><Cat x={90} y={G} s={0.85} c={c} /></>,
  'far-house': c => <><House x={42} y={G} c={c} /><Cat x={176} y={G} s={0.85} c={c} /></>,
  'between-ct': c => <><Chair x={40} y={G} c={c} /><Table x={152} y={G} w={80} c={c} /><Cat x={86} y={G} s={0.8} c={c} /></>,
  'on-ct': c => <><Chair x={40} y={G} c={c} /><Table x={152} y={G} w={80} c={c} /><Cat x={36} y={G - 42} s={0.82} c={c} /></>,
  'under-ct': c => <><Chair x={40} y={G} c={c} /><Table x={152} y={G} w={80} c={c} /><Cat x={152} y={G} s={0.8} c={c} /></>,
}
const OUTDOOR = new Set(['up-tree', 'down-tree', 'near-house', 'far-house'])

// The scene's content in 0 0 200 150 — place inside an <svg viewBox="0 0 200 150">.
export function SceneArt({ id, c = COLOR }) {
  return <g>
    <rect x="0" y="0" width="200" height="150" fill="#fff" />
    <Ground G={G} c={c} outdoor={OUTDOOR.has(id)} />
    {SCENE_ART[id](c)}
  </g>
}
export const hasArt = id => Boolean(SCENE_ART[id])

// ── The room ─────────────────────────────────────────────────────────────────────────────
const RG = 196
// Where a thing placed in each zone stands (bottom centre), its size, and the tap area.
export const ROOM_ZONES = {
  shelfTop: { x: 37, y: 104, size: 24, hit: [14, 68, 46, 38] },
  shelfBottom: { x: 37, y: 194, size: 24, hit: [14, 153, 46, 42] },
  onChair: { x: 113, y: 154, size: 26, hit: [92, 104, 40, 50] },
  underChair: { x: 116, y: 195, size: 20, hit: [98, 160, 32, 36] },
  gapChairTable: { x: 162, y: 195, size: 26, hit: [142, 120, 42, 76] },
  onTable: { x: 232, y: 148, size: 26, hit: [190, 96, 84, 52] },
  underTable: { x: 232, y: 195, size: 26, hit: [200, 156, 64, 40] },
  gapTableBox: { x: 292, y: 195, size: 24, hit: [276, 130, 32, 66] },
  inBox: { x: 334, y: RG - 20, size: 26, hit: [309, 130, 60, 66] },
  rightOfBox: { x: 386, y: 195, size: 24, hit: [372, 130, 28, 66] },
}

function Thing({ zone, e, ghost }) {
  const z = ROOM_ZONES[zone]
  return <text x={z.x} y={z.y - z.size * 0.5} fontSize={z.size} textAnchor="middle" dominantBaseline="central" fontFamily={EMOJI} opacity={ghost ? 0.5 : 1}>{e}</text>
}

// placed: [{ zone, e }]
export function RoomArt({ c = COLOR, placed = [] }) {
  const inBox = placed.filter(p => p.zone === 'inBox'), rest = placed.filter(p => p.zone !== 'inBox')
  return <g>
    <rect x="0" y="0" width="400" height="220" fill={c.wall} />
    <rect x="160" y="22" width="56" height="44" rx="2" fill={c === COLOR ? '#e0f2fe' : '#fff'} {...S} />
    <path d="M188 22 V66 M160 44 H216" stroke={INK} strokeWidth="1.2" />
    <Ground G={RG} c={c} w={400} h={220} />
    {/* bookcase: a top shelf, books in the middle, a bottom shelf */}
    <rect x="12" y="66" width="50" height="130" fill={c.shelf} {...S} />
    <rect x="16" y="70" width="42" height="34" fill="#fff" {...S} strokeWidth="1" />
    <rect x="16" y="110" width="42" height="39" fill="#fff" {...S} strokeWidth="1" />
    <rect x="16" y="155" width="42" height="39" fill="#fff" {...S} strokeWidth="1" />
    {[[19, c.book1, 31], [26, c.book2, 27], [33, c.book3, 33], [40, c.book1, 29], [47, c.book2, 25]].map(([x, f, h]) =>
      <rect key={x} x={x} y={149 - h} width="6" height={h} fill={f} {...S} strokeWidth=".9" />)}
    <Chair x={118} y={RG} c={c} />
    <Table x={232} y={RG} w={84} c={c} />
    <BoxBack x={336} y={RG} open c={c} />
    {inBox.map((p, i) => <Thing key={`in${i}`} {...p} />)}
    <BoxFront x={336} y={RG} open c={c} />
    {rest.map((p, i) => <Thing key={i} {...p} />)}
  </g>
}
