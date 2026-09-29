// Hanukkah worksheets for kindergarten and first grade — A4 SVG pages.
const FONT = 'Heebo, Arial, sans-serif'
const S = { fill: 'white', stroke: '#111', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' }

const Page = ({ title, instruction, children }) => <svg viewBox="0 0 600 820" role="img" aria-label={title} style={{ width: '100%', height: '100%', background: 'white' }}>
  <text x="300" y="40" textAnchor="middle" fontFamily={FONT} fontSize="26" fontWeight="800" fill="#111" direction="rtl">{title}</text>
  <text x="300" y="68" textAnchor="middle" fontFamily={FONT} fontSize="15" fill="#111" direction="rtl">שם: ____________    תאריך: ____________</text>
  <text x="300" y="102" textAnchor="middle" fontFamily={FONT} fontSize="18" fontWeight="700" fill="#111" direction="rtl">{instruction}</text>
  {children}
</svg>

const Candle = ({ x, y, h = 46 }) => <g>
  <rect x={x - 6} y={y - h} width="12" height={h} rx="2" {...S} strokeWidth={2.5} />
  <path d={`M${x} ${y - h - 2} c 6 -6 6 -12 0 -20 c -6 8 -6 14 0 20 Z`} {...S} strokeWidth={2} />
</g>

// ספרו את הנרות: 6 hanukkiyot, each lit for a different night; a box to write the number.
export function CountCandles({ nights = [3, 5, 1, 8, 2, 6] }) {
  return <Page title="כמה נרות דולקים?" instruction="ספרו את הנרות הדולקים (בלי השמש) וכתבו את המספר במשבצת">
    {nights.map((n, i) => {
      const col = i % 2, row = Math.floor(i / 2), cx = col ? 150 : 450, base = 250 + row * 205
      return <g key={i}>
        <path d={`M${cx - 110} ${base} H${cx + 110}`} {...S} strokeWidth={5} />
        <path d={`M${cx} ${base} v26 M${cx - 30} ${base + 26} h60`} {...S} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, k) => { const x = cx - 105 + k * 30 + (k >= 4 ? 30 : 0) - 15; return k >= 8 - n ? <Candle key={k} x={x} y={base} /> : <rect key={k} x={x - 6} y={base - 8} width="12" height="8" {...S} strokeWidth={2} /> })}
        <Candle x={cx} y={base - 26} h={50} />
        <rect x={cx - 26} y={base + 42} width="52" height="44" rx="8" fill="white" stroke="#111" strokeWidth="2.5" strokeDasharray="6 4" />
      </g>
    })}
  </Page>
}

const Donut = ({ x, y, r = 16 }) => <g><circle cx={x} cy={y} r={r} {...S} strokeWidth={2.5} /><path d={`M${x - r * 0.7} ${y - r * 0.15} q ${r * 0.35} -${r * 0.4} ${r * 0.7} -${r * 0.1} q ${r * 0.35} -${r * 0.35} ${r * 0.7} 0`} fill="none" stroke="#111" strokeWidth="2" /><circle cx={x} cy={y - r} r="3" fill="#111" /></g>

// חשבון סופגניות: addition within 10 with pictures.
export function DonutMath({ items = [[2, 3], [4, 1], [3, 3], [5, 2], [1, 6], [4, 4]] }) {
  return <Page title="חשבון סופגניות" instruction="ספרו את הסופגניות וכתבו כמה יש ביחד">
    {items.map(([a, b], i) => {
      const y = 170 + i * 102, row = n => Array.from({ length: n }, (_, k) => k)
      return <g key={i}>
        {row(a).map(k => <Donut key={'a' + k} x={560 - k * 36} y={y} />)}
        <text x={560 - a * 36 - 4} y={y + 10} textAnchor="middle" fontFamily={FONT} fontSize="30" fontWeight="800">+</text>
        {row(b).map(k => <Donut key={'b' + k} x={560 - a * 36 - 40 - k * 36} y={y} />)}
        <text x={120} y={y + 12} fontFamily={FONT} fontSize="28" direction="ltr" textAnchor="middle">{`${a} + ${b} = ____`}</text>
      </g>
    })}
  </Page>
}

// עוברים על הקווים: dashed Hanukkah words in the single-line tracing font.
export function TraceWords({ words = ['חנוכה', 'סביבון', 'נר', 'שמש', 'סופגנייה', 'מכבים'] }) {
  return <Page title="מילים של חנוכה" instruction="עוברים בעיפרון על המילים, ואז כותבים לבד בשורה">
    {words.map((w, i) => {
      const y = 190 + i * 104, fs = Math.min(84, 480 / Math.max(w.length * 0.62, 1))
      return <g key={i}>
        <path d={`M40 ${y - fs * 0.6} H560`} stroke="#ccc" strokeDasharray="5 4" />
        <path d={`M40 ${y} H560`} stroke="#888" />
        <text x="300" y={y} textAnchor="middle" fontFamily="BugaTracer" fontSize={fs} fill="#555" stroke="#555" strokeWidth={fs * 0.012} direction="rtl">{w}</text>
        <path d={`M40 ${y + 42} H560`} stroke="#bbb" />
      </g>
    })}
  </Page>
}

// נ ג ה פ: connect each dreidel letter to its word.
export function DreidelMatch() {
  const L = ['נ', 'ג', 'ה', 'פ'], W = ['היה', 'פה', 'נס', 'גדול']
  return <Page title="נס גדול היה פה" instruction="מתחו קו מכל אות לסביבון למילה שמתחילה בה">
    {L.map((l, i) => <g key={l}>
      <g transform={`translate(470 ${150 + i * 150}) scale(0.5)`}>
        <path d="M40 62 L100 44 L170 62 L110 82 Z M40 62 L110 82 L110 186 L40 160 Z M110 82 L170 62 L170 150 L110 186 Z M40 160 L110 186 L100 244 Z M110 186 L170 150 L100 244 Z" {...S} strokeWidth={5} />
        <rect x="90" y="8" width="20" height="52" rx="8" {...S} strokeWidth={5} />
        <text x="76" y="140" textAnchor="middle" fontSize="66" fontWeight="800" fontFamily={FONT} fill="#111" transform="skewY(16) translate(0 -22)">{l}</text>
      </g>
      <circle cx="455" cy={225 + i * 150} r="8" fill="#111" />
    </g>)}
    {W.map((w, i) => <g key={w}>
      <circle cx="220" cy={225 + i * 150} r="8" fill="#111" />
      <rect x="60" y={195 + i * 150} width="140" height="60" rx="14" {...S} />
      <text x="130" y={236 + i * 150} textAnchor="middle" fontFamily={FONT} fontSize="32" fontWeight="800" direction="rtl">{w}</text>
    </g>)}
  </Page>
}

export const HANUKKAH_SHEETS = [
  { id: 'count', name: 'כמה נרות דולקים?', age: 'גן', C: CountCandles },
  { id: 'donuts', name: 'חשבון סופגניות', age: 'גן–א׳', C: DonutMath },
  { id: 'trace', name: 'מילים של חנוכה — מעקב', age: 'גן–א׳', C: TraceWords },
  { id: 'match', name: 'נס גדול היה פה — התאמה', age: 'גן', C: DreidelMatch },
]
