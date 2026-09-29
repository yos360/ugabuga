// Hanukkah line-art for colouring — drawn in code (thick outlines, white fills),
// each one an A4 page: 600 × 820 with a title on top.

const S = { fill: 'white', stroke: '#111', strokeWidth: 5, strokeLinejoin: 'round', strokeLinecap: 'round' }

const Page = ({ title, children }) => <svg viewBox="0 0 600 820" role="img" aria-label={title} style={{ width: '100%', height: '100%', background: 'white' }}>
  <text x="300" y="56" textAnchor="middle" fontFamily="Heebo, Arial, sans-serif" fontSize="40" fontWeight="800" fill="#111" direction="rtl">{title}</text>
  <text x="300" y="92" textAnchor="middle" fontFamily="Heebo, Arial, sans-serif" fontSize="15" fill="#444" direction="rtl">שם: ________________</text>
  {children}
</svg>

const Flame = ({ x, y, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M0 -44 C 18 -22 18 -4 0 0 C -18 -4 -18 -22 0 -44 Z" {...S} strokeWidth={4} />
  <path d="M0 -24 C 7 -14 7 -6 0 -4 C -7 -6 -7 -14 0 -24 Z" {...S} strokeWidth={3} />
</g>

function Hanukkiah() {
  const xs = [80, 135, 190, 245, 355, 410, 465, 520]
  return <Page title="חנוכייה">
    {/* base */}
    <path d="M200 760 H400 L370 710 H230 Z" {...S} />
    <rect x="280" y="560" width="40" height="150" rx="10" {...S} />
    {/* arms: arcs from the stem to each candle holder */}
    {xs.map(x => <path key={x} d={`M300 600 Q ${x} 600 ${x} 524`} fill="none" stroke="#111" strokeWidth={16} strokeLinecap="round" />)}
    {xs.map(x => <path key={'w' + x} d={`M300 600 Q ${x} 600 ${x} 524`} fill="none" stroke="white" strokeWidth={7} strokeLinecap="round" />)}
    {/* cups and candles */}
    {xs.map(x => <g key={'c' + x}>
      <path d={`M${x - 22} 500 H${x + 22} L${x + 16} 524 H${x - 16} Z`} {...S} />
      <rect x={x - 11} y="400" width="22" height="100" rx="3" {...S} />
      <path d={`M${x} 400 V388`} {...S} strokeWidth={3} />
      <Flame x={x} y={386} s={0.8} />
    </g>)}
    {/* shamash, taller in the middle */}
    <rect x="283" y="320" width="34" height="240" rx="8" {...S} />
    <path d="M272 300 H328 L320 330 H280 Z" {...S} />
    <rect x="289" y="200" width="22" height="100" rx="3" {...S} />
    <path d="M300 200 V188" {...S} strokeWidth={3} />
    <Flame x={300} y={186} s={0.9} />
    {/* stars around */}
    {[[70, 180], [520, 170], [110, 280], [490, 290]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 22} L${x + 6} ${y - 7} L${x + 22} ${y - 7} L${x + 9} ${y + 3} L${x + 14} ${y + 19} L${x} ${y + 9} L${x - 14} ${y + 19} L${x - 9} ${y + 3} L${x - 22} ${y - 7} L${x - 6} ${y - 7} Z`} {...S} strokeWidth={4} />)}
  </Page>
}

function Sevivon() {
  return <Page title="סביבון">
    <g transform="translate(160 150) scale(1.4)">
      <rect x="90" y="8" width="20" height="52" rx="8" {...S} />
      <path d="M40 62 L100 44 L170 62 L110 82 Z" {...S} />
      <path d="M40 62 L110 82 L110 186 L40 160 Z" {...S} />
      <path d="M110 82 L170 62 L170 150 L110 186 Z" {...S} />
      <path d="M40 160 L110 186 L100 244 Z" {...S} />
      <path d="M110 186 L170 150 L100 244 Z" {...S} />
      <text x="76" y="140" textAnchor="middle" fontSize="66" fontWeight="800" fontFamily="Heebo, Arial, sans-serif" fill="white" stroke="#111" strokeWidth="4" transform="skewY(16) translate(0 -22)">נ</text>
      <text x="140" y="120" textAnchor="middle" fontSize="44" fontWeight="800" fontFamily="Heebo, Arial, sans-serif" fill="white" stroke="#111" strokeWidth="3.5" transform="skewY(-18) translate(0 50)">ג</text>
    </g>
    {/* motion swirls */}
    <path d="M90 560 C 150 600 450 600 510 560" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" strokeDasharray="14 12" />
    <path d="M130 610 C 200 640 400 640 470 610" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" strokeDasharray="14 12" />
    <g fontFamily="Heebo, Arial, sans-serif" fontWeight="800" fontSize="70" fill="white" stroke="#111" strokeWidth="4" textAnchor="middle" direction="rtl">
      <text x="480" y="740">נ</text><text x="370" y="740">ג</text><text x="260" y="740">ה</text><text x="150" y="740">פ</text>
    </g>
  </Page>
}

function Sufganiyot() {
  const donut = (x, y, r) => <g key={x + ',' + y}>
    <circle cx={x} cy={y} r={r} {...S} />
    <path d={`M${x - r * 0.85} ${y - r * 0.2} C ${x - r * 0.5} ${y - r * 0.55} ${x - r * 0.2} ${y - r * 0.2} ${x} ${y - r * 0.45} C ${x + r * 0.25} ${y - r * 0.7} ${x + r * 0.55} ${y - r * 0.3} ${x + r * 0.85} ${y - r * 0.35}`} fill="none" {...S} strokeWidth={4} />
    <path d={`M${x - 14} ${y - r * 0.92} C ${x - 18} ${y - r - 18} ${x + 18} ${y - r - 18} ${x + 14} ${y - r * 0.92}`} {...S} strokeWidth={4} />
    {[[-0.4, 0.2], [0.1, 0.35], [0.45, 0.1], [-0.15, -0.05], [0.35, -0.55], [-0.5, -0.45]].map(([a, b], i) => <circle key={i} cx={x + a * r} cy={y + b * r} r="3.5" fill="#111" />)}
  </g>
  return <Page title="סופגניות">
    <ellipse cx="300" cy="620" rx="250" ry="70" {...S} />
    <ellipse cx="300" cy="610" rx="200" ry="45" {...S} />
    {donut(190, 520, 90)}{donut(410, 520, 90)}{donut(300, 400, 95)}
  </Page>
}

function PachShemen() {
  return <Page title="פך השמן">
    <path d="M230 250 H370 V300 C 470 340 480 520 440 620 C 420 690 380 720 300 720 C 220 720 180 690 160 620 C 120 520 130 340 230 300 Z" {...S} />
    <rect x="220" y="215" width="160" height="40" rx="14" {...S} />
    <path d="M380 330 C 480 300 510 420 440 470" fill="none" {...S} strokeWidth={14} />
    <path d="M380 330 C 480 300 510 420 440 470" fill="none" stroke="white" strokeWidth={5} strokeLinecap="round" />
    {/* decorations */}
    <path d="M170 450 C 230 420 370 420 430 450" fill="none" {...S} />
    <path d="M165 520 C 230 550 370 550 435 520" fill="none" {...S} />
    {[200, 250, 300, 350, 400].map(x => <circle key={x} cx={x} cy={485} r="12" {...S} strokeWidth={4} />)}
    {/* oil drop and light rays */}
    <path d="M300 110 C 330 150 330 180 300 190 C 270 180 270 150 300 110 Z" {...S} />
    {[[-110, 150, -150, 140], [110, 150, 150, 140], [-90, 200, -130, 210], [90, 200, 130, 210]].map(([a, b, c, d], i) => <path key={i} d={`M${300 + a} ${b} L${300 + c} ${d}`} {...S} />)}
  </Page>
}

function Candles() {
  const hs = [120, 150, 180, 210, 210, 180, 150, 120]
  return <Page title="שמונה נרות">
    {hs.map((h, i) => { const x = 95 + i * 58; return <g key={i}>
      <rect x={x - 18} y={640 - h * 2} width="36" height={h * 2} rx="6" {...S} />
      {[1, 2].map(k => <path key={k} d={`M${x - 18} ${640 - h * 2 + k * h * 0.6} l36 -14`} fill="none" {...S} strokeWidth={3} />)}
      <path d={`M${x} ${640 - h * 2} v-12`} {...S} strokeWidth={3} />
      <Flame x={x} y={640 - h * 2 - 12} s={0.85} />
    </g> })}
    <path d="M50 640 H550 V690 H50 Z" {...S} />
    <text x="300" y="770" textAnchor="middle" fontFamily="Heebo, Arial, sans-serif" fontSize="56" fontWeight="800" fill="white" stroke="#111" strokeWidth="3.5" direction="rtl">חג אורים שמח</text>
  </Page>
}

function Greeting() {
  return <Page title="חנוכה שמח!">
    <text x="300" y="330" textAnchor="middle" fontFamily="Heebo, Arial, sans-serif" fontSize="150" fontWeight="900" fill="white" stroke="#111" strokeWidth="6" direction="rtl">חנוכה</text>
    <text x="300" y="490" textAnchor="middle" fontFamily="Heebo, Arial, sans-serif" fontSize="150" fontWeight="900" fill="white" stroke="#111" strokeWidth="6" direction="rtl">שמח</text>
    {[[90, 600], [200, 640], [300, 610], [400, 640], [510, 600]].map(([x, y], i) => <g key={i}>
      <rect x={x - 14} y={y} width="28" height="120" rx="4" {...S} />
      <path d={`M${x} ${y} v-10`} {...S} strokeWidth={3} />
      <Flame x={x} y={y - 10} s={0.75} />
    </g>)}
    {[[70, 160], [530, 170], [300, 150]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="22" {...S} />)}
  </Page>
}

export const HANUKKAH_ART = [
  { id: 'hanukkiah', name: 'חנוכייה', C: Hanukkiah },
  { id: 'sevivon', name: 'סביבון', C: Sevivon },
  { id: 'sufganiyot', name: 'סופגניות', C: Sufganiyot },
  { id: 'pach', name: 'פך השמן', C: PachShemen },
  { id: 'candles', name: 'שמונה נרות', C: Candles },
  { id: 'greeting', name: 'חנוכה שמח', C: Greeting },
]
