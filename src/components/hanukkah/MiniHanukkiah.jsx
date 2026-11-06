// A small hanukkiah: eight candles and a raised shamash; `lit` candles get flames (from the right).
export default function MiniHanukkiah({ x, y, w = 160, lit = 8, color }) {
  const step = w / 9, gold = color ? '#f6c453' : 'white'
  return <g>
    {Array.from({ length: 9 }, (_, i) => {
      const cx = x + w / 2 - step * 4 + step * i, shamash = i === 4
      const top = shamash ? y - 22 : y - 12, idx = i < 4 ? 8 - i : 9 - i // 1 = rightmost
      const on = shamash || idx <= lit
      return <g key={i}>
        <rect x={cx - 3} y={top - 14} width="6" height="14" fill={color ? '#93c5fd' : 'white'} stroke="#111" strokeWidth="1.5" />
        {on && <path d={`M${cx} ${top - 26} C${cx + 5} ${top - 19} ${cx + 4} ${top - 15} ${cx} ${top - 14} C${cx - 4} ${top - 15} ${cx - 5} ${top - 19} ${cx} ${top - 26} Z`} fill={color ? '#fb923c' : 'white'} stroke="#111" strokeWidth="1.2" />}
        {shamash && <rect x={cx - 3} y={top} width="6" height={y - top} fill={gold} stroke="#111" strokeWidth="1.5" />}
      </g>
    })}
    <rect x={x} y={y} width={w} height="8" rx="3" fill={gold} stroke="#111" strokeWidth="2" />
    <rect x={x + w / 2 - 4} y={y + 8} width="8" height="26" fill={gold} stroke="#111" strokeWidth="2" />
    <path d={`M${x + w / 2 - 28} ${y + 42} H${x + w / 2 + 28} L${x + w / 2 + 18} ${y + 32} H${x + w / 2 - 18} Z`} fill={gold} stroke="#111" strokeWidth="2" strokeLinejoin="round" />
  </g>
}
