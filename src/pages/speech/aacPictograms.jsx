// Simple pictograms drawn for /speech/aac, for words that have no clear emoji (open, close, put,
// give, you, mine, here/there, now/later…). Each is a <g> inside a 100×100 box. Our own drawings —
// no PCS/Boardmaker/ARASAAC symbols.

const K = '#1f2937'
const SKIN = '#fcd9b6'
const line = { stroke: K, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }

function Person({ x, y, s = 1, dress, armUp, noArms, fill = '#60a5fa' }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {dress
      ? <path d="M0 -20 L-13 12 L13 12 Z" fill={fill} stroke={K} strokeWidth="3" strokeLinejoin="round" />
      : <path d="M0 -20 L0 8" {...line} />}
    <path d={dress ? 'M-6 12 L-8 28 M6 12 L8 28' : 'M0 8 L-9 28 M0 8 L9 28'} {...line} />
    {!noArms && <path d={armUp ? 'M-13 -6 L0 -14 L12 -26' : 'M-13 -4 L0 -14 L13 -4'} {...line} />}
    <circle cx="0" cy="-30" r="9" fill={SKIN} stroke={K} strokeWidth="3" />
    {dress && <path d="M-9 -33 Q-14 -20 -10 -14 M9 -33 Q14 -20 10 -14" stroke="#7c2d12" strokeWidth="3" fill="none" strokeLinecap="round" />}
  </g>
}

function Arrow({ x1, y1, x2, y2, color = '#2563eb', dash }) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 9
  const p = (da) => `${x2 - h * Math.cos(a + da)} ${y2 - h * Math.sin(a + da)}`
  return <g stroke={color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
    <path d={`M${x1} ${y1} L${x2} ${y2}`} strokeDasharray={dash} />
    <path d={`M${p(0.55)} L${x2} ${y2} L${p(-0.55)}`} />
  </g>
}

const Die = ({ x, y, s = 18 }) => <g>
  <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx="3" fill="#fff" stroke={K} strokeWidth="3" />
  {[[-0.25, -0.25], [0.25, 0.25], [0, 0]].map(([dx, dy], i) => <circle key={i} cx={x + dx * s} cy={y + dy * s} r={s * 0.08} fill={K} />)}
</g>

const Box = ({ lid }) => <g>
  <rect x="22" y="54" width="56" height="34" rx="2" fill="#fcd34d" stroke={K} strokeWidth="3.5" />
  {lid === 'open' && <path d="M22 54 L36 24 L42 27 L28 56" fill="#fde68a" stroke={K} strokeWidth="3.5" strokeLinejoin="round" />}
  {lid === 'closed' && <rect x="18" y="46" width="64" height="9" rx="2" fill="#fde68a" stroke={K} strokeWidth="3.5" />}
</g>

const Timeline = () => <g>
  <path d="M8 64 L92 64" {...line} />
  {[22, 78].map(x => <path key={x} d={`M${x} 58 L${x} 70`} {...line} strokeWidth="3" />)}
</g>

export const PICTOGRAMS = {
  youM: <g><Person x={34} y={56} s={1.15} /><Arrow x1={92} y1={44} x2={56} y2={44} /></g>,
  youF: <g><Person x={34} y={56} s={1.15} dress fill="#f472b6" /><Arrow x1={92} y1={44} x2={56} y2={44} /></g>,
  mine: <g>
    <Person x={50} y={56} s={1.15} noArms />
    <circle cx="50" cy="54" r="11" fill="#fb923c" stroke={K} strokeWidth="3" />
    <path d="M36 36 Q30 52 42 60 M64 36 Q70 52 58 60" {...line} />
  </g>,
  open: <g><Box lid="open" /><Arrow x1={64} y1={44} x2={64} y2={12} color="#15803d" /></g>,
  close: <g><Box lid="closed" /><Arrow x1={50} y1={6} x2={50} y2={36} color="#15803d" /></g>,
  put: <g>
    <path d="M22 52 L22 88 L78 88 L78 52" fill="#fcd34d" stroke={K} strokeWidth="3.5" strokeLinejoin="round" />
    <circle cx="50" cy="16" r="10" fill="#fb923c" stroke={K} strokeWidth="3" />
    <Arrow x1={50} y1={32} x2={50} y2={70} color="#15803d" dash="6 5" />
  </g>,
  give: <g>
    <Person x={80} y={58} s={0.95} />
    <circle cx="50" cy="38" r="9" fill="#fb923c" stroke={K} strokeWidth="3" />
    <Arrow x1={64} y1={52} x2={30} y2={52} color="#15803d" />
    <path d="M8 62 Q20 80 34 62" stroke={K} strokeWidth="5" strokeLinecap="round" fill={SKIN} />
  </g>,
  big: <g>
    <circle cx="50" cy="50" r="25" fill="#93c5fd" stroke={K} strokeWidth="3.5" />
    <Arrow x1={30} y1={30} x2={12} y2={12} /><Arrow x1={70} y1={30} x2={88} y2={12} />
    <Arrow x1={30} y1={70} x2={12} y2={88} /><Arrow x1={70} y1={70} x2={88} y2={88} />
  </g>,
  small: <g>
    <circle cx="50" cy="50" r="9" fill="#93c5fd" stroke={K} strokeWidth="3" />
    <Arrow x1={10} y1={10} x2={34} y2={34} /><Arrow x1={90} y1={10} x2={66} y2={34} />
    <Arrow x1={10} y1={90} x2={34} y2={66} /><Arrow x1={90} y1={90} x2={66} y2={66} />
  </g>,
  bubbles: <g fill="#e0f2fe" stroke="#0369a1" strokeWidth="3">
    <circle cx="60" cy="36" r="20" /><circle cx="28" cy="28" r="11" /><circle cx="78" cy="74" r="11" /><circle cx="40" cy="68" r="15" />
    <path d="M52 26 Q58 21 65 23 M34 62 Q38 58 43 59" fill="none" strokeWidth="2.5" strokeLinecap="round" />
  </g>,
  circle: <g>
    <ellipse cx="50" cy="56" rx="30" ry="18" fill="#fde68a" stroke={K} strokeWidth="3" />
    {[[50, 22], [80, 34], [86, 62], [50, 88], [14, 62], [20, 34]].map(([x, y], i) =>
      <circle key={i} cx={x} cy={y} r="8" fill={['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6'][i]} stroke={K} strokeWidth="2.5" />)}
  </g>,
  towel: <g>
    <path d="M10 16 L90 16" {...line} strokeWidth="5" />
    <rect x="26" y="16" width="48" height="70" rx="3" fill="#93c5fd" stroke={K} strokeWidth="3.5" />
    <path d="M26 68 L74 68 M26 75 L74 75" stroke="#1d4ed8" strokeWidth="3" />
  </g>,
  myTurn: <g><Person x={42} y={60} s={1.15} armUp /><Die x={66} y={22} s={20} /></g>,
  yourTurn: <g><Die x={22} y={36} s={20} /><Arrow x1={36} y1={36} x2={60} y2={36} /><Person x={76} y={60} s={1.05} /></g>,
  there: <g>
    <Person x={84} y={58} s={0.9} />
    <Arrow x1={68} y1={50} x2={30} y2={50} />
    <path d="M14 24 L14 84" {...line} />
    <path d="M14 24 L34 32 L14 40 Z" fill="#ef4444" stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
  </g>,
  now: <g>
    <Timeline />
    <circle cx="50" cy="64" r="10" fill="#475569" stroke={K} strokeWidth="3" />
    <path d="M40 26 L60 26 L50 42 Z" fill="#ef4444" stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
  </g>,
  later: <g>
    <Timeline />
    <circle cx="68" cy="64" r="6" fill="#fff" stroke={K} strokeWidth="3" />
    <circle cx="30" cy="64" r="10" fill="#475569" stroke={K} strokeWidth="3" />
    <path d="M66 52 Q50 18 34 46" stroke="#2563eb" strokeWidth="4.5" fill="none" strokeLinecap="round" />
    <path d="M28 38 L34 48 L42 40" stroke="#2563eb" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>,
}
