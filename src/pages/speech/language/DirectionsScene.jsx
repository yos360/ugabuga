// The yard scene for /speech/language/directions: drawn once, used by the listening game (tap to
// colour, circle or put a star) and by the printable colouring-by-instructions sheets (outline only).
// viewBox 0 0 360 300. Every item has art (filled with its colour when marked), a tap area and a ring.

const INK = '#1f2937'

function Bird({ fill, x = 0, y = 0 }) {
  return <g transform={`translate(${x} ${y})`}>
    <path d="M86 50 L74 43 L77 57 Z" fill={fill} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    <ellipse cx="100" cy="52" rx="16" ry="10" fill={fill} stroke={INK} strokeWidth="2" />
    <circle cx="114" cy="43" r="7.5" fill={fill} stroke={INK} strokeWidth="2" />
    <path d="M121 41 L130 44 L121 47 Z" fill="#fbbf24" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="116" cy="42" r="1.4" fill={INK} />
    <path d="M92 50 Q100 38 108 50" fill="none" stroke={INK} strokeWidth="2" />
  </g>
}

function Duck({ cx, cy, w, h, fill }) {
  return <g>
    <path d={`M${cx + w * 0.8} ${cy - h * 0.2} L${cx + w * 1.25} ${cy - h * 0.8} L${cx + w * 1.05} ${cy + h * 0.2} Z`} fill={fill} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    <ellipse cx={cx} cy={cy} rx={w} ry={h} fill={fill} stroke={INK} strokeWidth="1.8" />
    <circle cx={cx - w * 0.8} cy={cy - h * 1.1} r={h * 0.85} fill={fill} stroke={INK} strokeWidth="1.8" />
    <path d={`M${cx - w * 0.8 - h * 0.8} ${cy - h * 1.25} L${cx - w * 0.8 - h * 1.7} ${cy - h * 0.95} L${cx - w * 0.8 - h * 0.75} ${cy - h * 0.75} Z`} fill="#fb923c" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
    <circle cx={cx - w * 0.9} cy={cy - h * 1.3} r={Math.max(1, h * 0.16)} fill={INK} />
    <path d={`M${cx - w * 0.3} ${cy - h * 0.1} Q${cx + w * 0.2} ${cy - h * 0.7} ${cx + w * 0.55} ${cy}`} fill="none" stroke={INK} strokeWidth="1.4" />
  </g>
}

function Flower({ cx, cy, d, r, c, stemTo, fill }) {
  const petals = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    return <circle key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} r={r} fill={fill} stroke={INK} strokeWidth="1.8" />
  })
  return <g>
    <line x1={cx} y1={cy} x2={cx} y2={stemTo} stroke={INK} strokeWidth="2" />
    <path d={`M${cx} ${(cy + stemTo) / 2 + 6} q${d * 1.2} ${-d * 0.9} ${d * 1.6} ${-d * 0.2} q${-d * 0.6} ${d * 0.9} ${-d * 1.6} ${d * 0.2}`} fill="#fff" stroke={INK} strokeWidth="1.6" />
    {petals}
    <circle cx={cx} cy={cy} r={c} fill="#fff" stroke={INK} strokeWidth="1.8" />
  </g>
}

const DUCKS = { duck1: 182, duck2: 207, duck3: 232 }

// Art per item: draw(fill) + hit [x, y, w, h] + ring [cx, cy, rx, ry].
const ART = {
  sun: {
    draw: f => <g>
      {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return <line key={i} x1={320 + Math.cos(a) * 25} y1={42 + Math.sin(a) * 25} x2={320 + Math.cos(a) * 33} y2={42 + Math.sin(a) * 33} stroke={INK} strokeWidth="2.2" strokeLinecap="round" /> })}
      <circle cx="320" cy="42" r="20" fill={f} stroke={INK} strokeWidth="2" />
    </g>,
    hit: [282, 4, 76, 76], ring: [320, 42, 41, 40],
  },
  cloud: {
    draw: f => <path d="M168 62 C150 62 150 40 170 40 C172 22 196 16 206 30 C214 20 238 26 234 42 C252 44 250 62 232 62 Z" fill={f} stroke={INK} strokeWidth="2" strokeLinejoin="round" />,
    hit: [148, 14, 106, 54], ring: [200, 42, 58, 32],
  },
  birdUp: { draw: f => <Bird fill={f} />, hit: [70, 28, 64, 38], ring: [102, 48, 36, 23] },
  birdDown: { draw: f => <Bird fill={f} x={2} y={150} />, hit: [72, 178, 64, 38], ring: [104, 198, 36, 23] },
  tree: {
    draw: f => <g>
      <rect x="44" y="122" width="14" height="70" fill="#fff" stroke={INK} strokeWidth="2" />
      <circle cx="51" cy="96" r="34" fill={f} stroke={INK} strokeWidth="2" />
    </g>,
    hit: [14, 60, 76, 134], ring: [51, 126, 46, 70],
  },
  house: {
    draw: f => <g>
      <rect x="258" y="120" width="74" height="72" fill={f} stroke={INK} strokeWidth="2" />
      <polygon points="250,122 295,84 340,122" fill={f} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="290" y="156" width="20" height="36" fill="#fff" stroke={INK} strokeWidth="2" />
      <circle cx="305" cy="175" r="1.6" fill={INK} />
      <rect x="264" y="132" width="18" height="16" fill="#fff" stroke={INK} strokeWidth="2" />
      <path d="M273 132 V148 M264 140 H282" stroke={INK} strokeWidth="1.5" />
    </g>,
    hit: [248, 80, 96, 114], ring: [295, 138, 57, 64],
  },
  table: {
    draw: f => <g>
      <rect x="148" y="173" width="7" height="41" fill={f} stroke={INK} strokeWidth="2" />
      <rect x="215" y="173" width="7" height="41" fill={f} stroke={INK} strokeWidth="2" />
      <rect x="140" y="166" width="90" height="8" fill={f} stroke={INK} strokeWidth="2" />
    </g>,
    hit: [136, 160, 98, 18], ring: [185, 190, 58, 36],
  },
  cup: {
    draw: f => <g>
      <path d="M194 149 q9 0 9 7 q0 7 -9 7" fill="none" stroke={INK} strokeWidth="2.2" />
      <rect x="176" y="144" width="18" height="22" rx="2" fill={f} stroke={INK} strokeWidth="2" />
    </g>,
    hit: [168, 136, 40, 30], ring: [188, 155, 21, 18],
  },
  cat: {
    draw: f => <g>
      <path d="M197 209 q13 -2 10 -15" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="185" cy="203" rx="13" ry="10" fill={f} stroke={INK} strokeWidth="2" />
      <polygon points="178,183 179,175 184,180" fill={f} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <polygon points="186,180 191,175 192,183" fill={f} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="185" cy="187" r="8" fill={f} stroke={INK} strokeWidth="2" />
      <circle cx="182" cy="186" r="1.2" fill={INK} /><circle cx="188" cy="186" r="1.2" fill={INK} />
      <path d="M183.5 189.5 L185 191 L186.5 189.5" fill="none" stroke={INK} strokeWidth="1" />
    </g>,
    hit: [164, 176, 46, 38], ring: [188, 196, 25, 22],
  },
  box: {
    // The small ball is drawn between the inside of the box and its front, so it sits inside.
    draw: (f, inside) => <g>
      <polygon points="252,232 262,222 316,222 306,232" fill="#e5e7eb" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      {inside}
      <polygon points="306,232 316,222 316,256 306,266" fill={f} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="252" y="232" width="54" height="34" fill={f} stroke={INK} strokeWidth="2" />
    </g>,
    hit: [250, 232, 68, 36], ring: [284, 245, 40, 28],
  },
  ballSmall: {
    draw: f => <g>
      <circle cx="279" cy="229" r="10" fill={f} stroke={INK} strokeWidth="2" />
      <path d="M270 225 Q279 231 288 225" fill="none" stroke={INK} strokeWidth="1.4" />
    </g>,
    hit: [264, 212, 30, 20], ring: [279, 227, 19, 14],
  },
  ballBig: {
    draw: f => <g>
      <circle cx="336" cy="250" r="19" fill={f} stroke={INK} strokeWidth="2" />
      <path d="M318 244 Q336 256 354 244 M326 234 Q336 250 326 266" fill="none" stroke={INK} strokeWidth="1.6" />
    </g>,
    hit: [314, 228, 44, 44], ring: [336, 250, 26, 26],
  },
  flowerBig: { draw: f => <Flower cx={36} cy={204} d={9} r={7} c={5.5} stemTo={282} fill={f} />, hit: [14, 182, 46, 102], ring: [36, 232, 27, 55] },
  flowerSmall: { draw: f => <Flower cx={80} cy={250} d={5} r={4} c={3.2} stemTo={284} fill={f} />, hit: [64, 238, 32, 48], ring: [80, 260, 16, 28] },
  duckMom: { draw: f => <Duck cx={152} cy={265} w={15} h={9} fill={f} />, hit: [126, 246, 46, 30], ring: [148, 260, 25, 18] },
  ...Object.fromEntries(Object.entries(DUCKS).map(([id, cx]) => [id, {
    draw: f => <Duck cx={cx} cy={271} w={8.5} h={5.5} fill={f} />, hit: [cx - 16, 256, 27, 24], ring: [cx - 2, 267, 14, 12],
  }])),
}

// Draw order (back to front) and tap order (front items win when tap areas overlap).
const DRAW = ['sun', 'cloud', 'birdUp', 'tree', 'house', 'birdDown', 'table', 'cup', 'cat', 'box', 'ballBig', 'flowerBig', 'flowerSmall', 'duckMom', 'duck1', 'duck2', 'duck3']
const TAP = ['tree', 'house', 'sun', 'cloud', 'table', 'box', 'birdUp', 'birdDown', 'cup', 'cat', 'ballSmall', 'ballBig', 'flowerBig', 'flowerSmall', 'duckMom', 'duck1', 'duck2', 'duck3']

function StarMark({ x, y }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 4 : 9.5
    return `${(x + Math.cos(a) * r).toFixed(1)},${(y + Math.sin(a) * r).toFixed(1)}`
  }).join(' ')
  return <polygon points={pts} fill="#fde047" stroke="#a16207" strokeWidth="1.6" strokeLinejoin="round" />
}

// marks: { [id]: { fill, ring, star } }. print: outline only, white background.
export function SceneArt({ marks = {}, print = false }) {
  const fillOf = id => marks[id]?.fill || '#fff'
  return <g>
    {print
      ? <g><line x1="0" y1="150" x2="360" y2="150" stroke="#9ca3af" strokeWidth="1.5" /></g>
      : <g><rect x="0" y="0" width="360" height="150" fill="#eaf4ff" /><rect x="0" y="150" width="360" height="150" fill="#eef7e6" /></g>}
    <ellipse cx="185" cy="267" rx="66" ry="22" fill={print ? '#fff' : '#dbeafe'} stroke={print ? '#9ca3af' : '#93c5fd'} strokeWidth="1.8" />
    <path d="M140 286 q6 -3 12 0 M200 288 q6 -3 12 0 M226 252 q6 -3 12 0" fill="none" stroke={print ? '#9ca3af' : '#60a5fa'} strokeWidth="1.3" />
    {DRAW.map(id => <g key={id}>{id === 'box' ? ART.box.draw(fillOf('box'), ART.ballSmall.draw(fillOf('ballSmall'))) : ART[id].draw(fillOf(id))}</g>)}
    {Object.entries(marks).map(([id, m]) => {
      const a = ART[id]
      return <g key={id}>
        {m.ring && <ellipse cx={a.ring[0]} cy={a.ring[1]} rx={a.ring[2]} ry={a.ring[3]} fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeDasharray="200 6" />}
        {m.star && <StarMark x={a.hit[0] + a.hit[2] - 6} y={a.hit[1] + 6} />}
      </g>
    })}
  </g>
}

export function TapLayer({ onTap, labelOf }) {
  return <g>
    {TAP.map(id => {
      const [x, y, w, h] = ART[id].hit
      return <rect key={id} x={x} y={y} width={w} height={h} fill="transparent" role="button" tabIndex={0} aria-label={labelOf(id)} style={{ cursor: 'pointer', outline: 'none' }}
        className="dir-hit" onClick={() => onTap(id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(id) } }} />
    })}
  </g>
}
