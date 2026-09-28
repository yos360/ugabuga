// An A4 sheet of 8 letter cards (2 × 4) with dashed cut lines.
// card = { l, sub, emoji, word, dir } — sub is the small second letter (English
// lowercase or a Hebrew final form), word is shown under the picture.

const W = 600, H = 820, COLS = 2, ROWS = 4, M = 22
const CW = (W - M * 2) / COLS, CH = (H - 70 - M) / ROWS
const PASTELS = ['#FFE3EC', '#E3F2FF', '#E6F9E6', '#FFF4CC', '#F0E6FF', '#FFE9D6', '#DFF7F5', '#FCE4F4']

export const PER_SHEET = COLS * ROWS

export default function FlashcardSheet({ cards, title, style = 'full', color = true }) {
  return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} style={{ width: '100%', height: '100%', background: 'white' }}>
    <text x={W / 2} y="34" textAnchor="middle" fontFamily="Heebo, Arial, sans-serif" fontSize="20" fontWeight="700" fill="#111" direction="rtl">{title}</text>
    <text x={W / 2} y="56" textAnchor="middle" fontFamily="Heebo, Arial, sans-serif" fontSize="12" fill="#555" direction="rtl">גוזרים לאורך הקווים המקווקווים ✂️</text>
    {cards.map((c, i) => {
      const col = i % COLS, row = Math.floor(i / COLS)
      // RTL reading order: the first card sits top-right.
      const x = M + (COLS - 1 - col) * CW, y = 70 + row * CH
      const cx = x + CW / 2, heb = c.dir !== 'ltr'
      const big = style === 'letter' ? 130 : 92
      return <g key={i}>
        <rect x={x + 6} y={y + 6} width={CW - 12} height={CH - 12} rx="16" fill={color ? PASTELS[i % PASTELS.length] : 'white'} stroke="#111" strokeWidth="2" />
        <rect x={x} y={y} width={CW} height={CH} fill="none" stroke="#999" strokeWidth="1" strokeDasharray="6 5" />
        {style === 'letter'
          ? <text x={cx} y={y + CH / 2 + 44} textAnchor="middle" fontFamily="Heebo, Arial, sans-serif" fontWeight="800" fontSize={big} fill={color ? '#1e1b4b' : 'white'} stroke="#111" strokeWidth={color ? 0 : 4} paintOrder="stroke" direction={heb ? 'rtl' : 'ltr'}>{c.l}{c.sub ? <tspan fontSize={big * 0.62} dx={heb ? 14 : 10}>{heb ? ' ' + c.sub : c.sub}</tspan> : null}</text>
          : <>
            <text x={heb ? x + CW - 28 : x + 28} y={y + 92} textAnchor="start" fontFamily="Heebo, Arial, sans-serif" fontWeight="800" fontSize={big} fill={color ? '#1e1b4b' : 'white'} stroke="#111" strokeWidth={color ? 0 : 4} paintOrder="stroke" direction={heb ? 'rtl' : 'ltr'}>{c.l}{!heb && c.sub ? <tspan fontSize={big * 0.6} dx="4">{c.sub}</tspan> : null}</text>
            {heb && c.sub && <text x={x + CW - 28} y={y + 122} textAnchor="start" fontFamily="Heebo, Arial, sans-serif" fontSize="15" fill="#333" direction="rtl">סופית: <tspan fontWeight="800" fontSize="22">{c.sub}</tspan></text>}
            <text x={heb ? x + 70 : x + CW - 70} y={y + 98} textAnchor="middle" fontSize="70" style={color ? undefined : { filter: 'grayscale(1)' }}>{c.emoji}</text>
            <text x={cx} y={y + CH - 26} textAnchor="middle" fontFamily="Heebo, Arial, sans-serif" fontWeight="700" fontSize="26" fill="#111" direction={heb ? 'rtl' : 'ltr'}>{c.word}</text>
          </>}
      </g>
    })}
  </svg>
}
