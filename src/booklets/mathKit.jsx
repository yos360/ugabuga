import { A4, Head, SvgPage } from './kit'

// Shared pieces for the arithmetic booklets: two columns of numbered exercises, a row of frame cells,
// and a plain list of word problems. Pure functions of their props (the preview renders them twice).
export const FONT = 'Heebo, Arial, sans-serif'
export const INK = '#111'
export const symbol = (x, y) => x > y ? '>' : x < y ? '<' : '='

// items: [{ text, ans }]; the first column sits on the right.
export function Problems({ n, title, instruction, items, size = 28 }) {
  const rows = Math.ceil(items.length / 2), rowH = Math.min(100, 640 / rows)
  return <SvgPage label={title}>
    <Head n={n} title={title} instruction={instruction} />
    {items.map((it, i) => {
      const col = i % 2, y = 150 + Math.floor(i / 2) * rowH + rowH / 2, cx = col ? 150 : 440
      return <g key={i} fontFamily={FONT}>
        <text x={cx + 130} y={y + 4} fontSize="14" fill="#666" textAnchor="middle">{i + 1}.</text>
        <text x={cx} y={y + 10} fontSize={size} fontWeight="700" textAnchor="middle" direction="ltr" style={{ whiteSpace: 'pre' }}>{it.text}</text>
        <path d={`M${col ? 20 : 310} ${y + rowH / 2} H${col ? 290 : 580}`} stroke="#eee" />
      </g>
    })}
  </SvgPage>
}

// `total` square cells in rows of `perRow`, the first `filled` hold a dot. Top-left corner (x, y).
export function Cells({ x, y, total, filled, perRow = 5, cell = 30, color = '#fde68a' }) {
  return <g>{Array.from({ length: total }, (_, i) => {
    const cx = x + (i % perRow) * cell, cy = y + Math.floor(i / perRow) * cell
    return <g key={i}>
      <rect x={cx} y={cy} width={cell} height={cell} fill="white" stroke={INK} strokeWidth="2" />
      {i < filled && <circle cx={cx + cell / 2} cy={cy + cell / 2} r={cell * 0.33} fill={color} stroke={INK} strokeWidth="1.5" />}
    </g>
  })}</g>
}

// Numbered story problems with room for the exercise and the answer. items: [{ q }]
export function StoryPage({ n, title, instruction, items }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>📖 {title}</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>שם: ______________ · עמוד {n} בחוברת · {instruction}</p>
    <ol style={{ fontSize: '15pt', lineHeight: 1.7, padding: '0 10mm 0 4mm', margin: '4mm 0 0' }}>
      {items.map(p => <li key={p.q} style={{ marginBottom: '11mm' }}>{p.q}<br />תרגיל: ______________ &nbsp; תשובה: ______________</li>)}
    </ol>
  </A4>
}
