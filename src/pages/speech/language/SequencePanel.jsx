// Draws one picture of a sequence (see src/data/speech/sequences.js) in a 100×80 box: emoji layers and a
// few simple shapes. Used on screen and in the printable cards. `gray` turns everything black-and-white.

const EMOJI = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
const INK = '#374151'
const BLOCK = ['#ef4444', '#3b82f6', '#facc15', '#22c55e', '#fb923c', '#a855f7']

function Shape({ k, x, y, s = 1, n = 3 }) {
  switch (k) {
    case 'blocks': return <g>{Array.from({ length: n }, (_, i) => <rect key={i} x={x - 6 + (i % 2 ? 1.5 : 0)} y={y - (i + 1) * 12} width={12} height={12} rx={1.5} fill={BLOCK[i % BLOCK.length]} stroke={INK} strokeWidth=".8" />)}</g>
    case 'fallen': return <g>{[[-22, 6, 20], [-8, 2, -12], [6, 7, 35], [18, 0, -25], [-14, -8, 50], [28, 6, 10]].map(([dx, dy, r], i) => <rect key={i} x={x + dx - 6} y={y + dy - 6} width={12} height={12} rx={1.5} fill={BLOCK[i]} stroke={INK} strokeWidth=".8" transform={`rotate(${r} ${x + dx} ${y + dy})`} />)}</g>
    case 'tube': return <g transform={`rotate(-25 ${x} ${y})`}>
      <path d={`M${x - 16} ${y - 7} L${x + 10} ${y - 5} L${x + 10} ${y + 5} L${x - 16} ${y + 7} Z`} fill="#fff" stroke={INK} strokeWidth="1" />
      <rect x={x + 10} y={y - 3} width={6} height={6} fill="#3b82f6" stroke={INK} strokeWidth="1" />
      <path d={`M${x - 10} ${y - 2} L${x + 4} ${y - 1.5}`} stroke="#ef4444" strokeWidth="2.2" />
    </g>
    case 'drops': return <g transform={`translate(${x} ${y}) scale(${s})`}>{[[-10, -6], [0, 4], [10, -4], [-4, 14], [8, 16]].map(([dx, dy], i) => <path key={i} d={`M${dx} ${dy - 6} Q${dx + 4} ${dy} ${dx} ${dy + 3} Q${dx - 4} ${dy} ${dx} ${dy - 6} Z`} fill="#60a5fa" stroke="#1d4ed8" strokeWidth=".6" />)}</g>
    case 'jug': return <g>
      <path d={`M${x - 12} ${y - 18} L${x + 12} ${y - 18} L${x + 14} ${y + 16} L${x - 14} ${y + 16} Z`} fill="#fef9c3" stroke={INK} strokeWidth="1.2" />
      <path d={`M${x - 12} ${y - 8} L${x + 13} ${y - 8}`} stroke="#eab308" strokeWidth="1" />
      <path d={`M${x + 12} ${y - 12} q10 2 8 12 q-1 6 -7 6`} fill="none" stroke={INK} strokeWidth="1.4" />
      <path d={`M${x - 12} ${y - 18} l-5 -3`} stroke={INK} strokeWidth="1.4" />
    </g>
    case 'off': return <g>
      <rect x={x + 26} y={y - 9} width={12} height={18} rx={2} fill="#e5e7eb" stroke={INK} strokeWidth="1" />
      <rect x={x + 29.5} y={y} width={5} height={6} rx={1} fill="#6b7280" />
    </g>
    case 'cup': return <g>
      <path d={`M${x - 11} ${y - 16} L${x + 11} ${y - 16} L${x + 8} ${y + 16} L${x - 8} ${y + 16} Z`} fill="#fff" stroke={INK} strokeWidth="1.2" />
      <path d={`M${x - 10} ${y - 6} L${x + 10} ${y - 6} L${x + 8} ${y + 16} L${x - 8} ${y + 16} Z`} fill="#bfdbfe" />
    </g>
    case 'puddle': return <ellipse cx={x} cy={y} rx={34} ry={8} fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1" />
    case 'towel': return <g>
      <line x1={x - 22} y1={y - 26} x2={x + 22} y2={y - 26} stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <rect x={x - 16} y={y - 26} width={32} height={46} rx={2} fill="#fbcfe8" stroke={INK} strokeWidth="1" />
      <path d={`M${x - 16} ${y + 10} H${x + 16} M${x - 16} ${y + 14} H${x + 16}`} stroke="#db2777" strokeWidth="1.2" />
    </g>
    case 'sand': return <path d={`M0 ${y} Q25 ${y - 3} 50 ${y} T100 ${y} V80 H0 Z`} fill="#fde68a" stroke="#d97706" strokeWidth=".6" />
    case 'tower': return <g>
      <path d={`M${x - 13} ${y} L${x - 10} ${y - 26} L${x + 10} ${y - 26} L${x + 13} ${y} Z`} fill="#fcd34d" stroke="#b45309" strokeWidth="1" />
      <path d={`M${x - 11} ${y - 9} H${x + 11} M${x - 10} ${y - 18} H${x + 10}`} stroke="#b45309" strokeWidth=".7" />
    </g>
    case 'bowl': return <g>
      <path d={`M${x - 24} ${y - 8} Q${x - 22} ${y + 16} ${x} ${y + 16} Q${x + 22} ${y + 16} ${x + 24} ${y - 8} Z`} fill="#bae6fd" stroke={INK} strokeWidth="1.2" />
      <ellipse cx={x} cy={y - 8} rx={24} ry={4} fill="#e0f2fe" stroke={INK} strokeWidth="1" />
    </g>
    case 'hole': return <g>
      <path d={`M0 ${y} H${x - 18} Q${x} ${y + 12} ${x + 18} ${y} H100 V80 H0 Z`} fill="#a16207" stroke="#713f12" strokeWidth=".8" />
      <path d={`M${x - 26} ${y} q-4 -6 4 -6 q2 -4 8 0 Z M${x + 22} ${y} q2 -6 8 -4 q6 0 4 4 Z`} fill="#a16207" stroke="#713f12" strokeWidth=".6" />
    </g>
    case 'mound': return <path d={`M0 ${y} H${x - 20} Q${x} ${y - 8} ${x + 20} ${y} H100 V80 H0 Z`} fill="#a16207" stroke="#713f12" strokeWidth=".8" />
    case 'seed': return <ellipse cx={x} cy={y} rx={3.4} ry={2.2} fill="#78350f" stroke="#451a03" strokeWidth=".5" />
    case 'can': return <g transform={`rotate(20 ${x} ${y})`}>
      <rect x={x - 12} y={y - 9} width={22} height={18} rx={3} fill="#4ade80" stroke={INK} strokeWidth="1" />
      <path d={`M${x + 10} ${y + 2} L${x + 24} ${y - 8}`} stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d={`M${x - 12} ${y - 4} q-8 0 -8 6 q0 6 8 6`} fill="none" stroke={INK} strokeWidth="1.4" />
    </g>
    case 'oven': return <g>
      <rect x={x - 28} y={y - 26} width={56} height={52} rx={3} fill="#e5e7eb" stroke={INK} strokeWidth="1.2" />
      <rect x={x - 22} y={y - 12} width={44} height={32} rx={2} fill="#fed7aa" stroke={INK} strokeWidth="1" />
      <rect x={x - 12} y={y + 4} width={24} height={10} rx={2} fill="#d97706" stroke={INK} strokeWidth=".8" />
      {[-16, -6, 4, 14].map(dx => <circle key={dx} cx={x + dx} cy={y - 19} r={2.2} fill="#9ca3af" stroke={INK} strokeWidth=".5" />)}
    </g>
    case 'cake': return <g>
      <rect x={x - 24} y={y - 14} width={48} height={24} rx={3} fill="#fde68a" stroke={INK} strokeWidth="1.2" />
      <path d={`M${x - 24} ${y - 14} q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 12 0`} fill="#fff" stroke={INK} strokeWidth="1" />
      <ellipse cx={x} cy={y + 12} rx={30} ry={3} fill="#e5e7eb" stroke={INK} strokeWidth=".8" />
    </g>
    default: return null
  }
}

export function PanelArt({ step, gray = false, print = false, filterId = 'seq-gray' }) {
  const bg = print ? '#fff' : step.dark ? '#1e293b' : '#fffdf5'
  return <g filter={gray ? `url(#${filterId})` : undefined}>
    <rect x="0" y="0" width="100" height="80" fill={step.dark && !print ? bg : step.dark ? '#e5e7eb' : bg} />
    {step.art.map((l, i) => Array.isArray(l)
      ? <text key={i} x={l[1]} y={l[2]} fontSize={l[3]} textAnchor="middle" dominantBaseline="central" fontFamily={EMOJI}
        transform={l[4] ? `rotate(${l[4]} ${l[1]} ${l[2]})` : undefined}>{l[0]}</text>
      : <Shape key={i} {...l} />)}
  </g>
}

export const GrayFilter = ({ id = 'seq-gray' }) => <defs><filter id={id}><feColorMatrix type="saturate" values="0" /></filter></defs>

// A stand-alone panel for the screen.
export default function Panel({ step, label }) {
  return <svg viewBox="0 0 100 80" className="block h-auto w-full" role="img" aria-label={label}>
    <PanelArt step={step} />
  </svg>
}
