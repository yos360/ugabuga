// The seven species drawn in code, in a 100×100 box. `line` = black outlines on
// white for colouring pages; otherwise coloured for cards and the matching game.

const K = '#111'

export default function SpeciesIcon({ id, line = false, size = 80, title }) {
  const c = (color) => line ? 'white' : color
  const sw = line ? 3 : 2.5
  const common = { stroke: K, strokeWidth: sw, strokeLinejoin: 'round', strokeLinecap: 'round' }
  let body
  if (id === 'wheat' || id === 'barley') {
    const awn = id === 'barley'
    const grains = [0, 1, 2, 3, 4]
    body = <g>
      <path d="M50 96 C 50 70 50 45 50 22" fill="none" {...common} stroke={line ? K : '#8a6d1f'} strokeWidth={4} />
      <path d="M50 70 C 38 64 30 66 24 72 C 34 74 42 72 50 70 Z" fill={c('#9bbf4c')} {...common} />
      {grains.map(i => <g key={i}>
        <ellipse cx="42" cy={30 + i * 9} rx="6" ry="9" transform={`rotate(-30 42 ${30 + i * 9})`} fill={c(awn ? '#e8cf7a' : '#e0b23c')} {...common} />
        <ellipse cx="58" cy={30 + i * 9} rx="6" ry="9" transform={`rotate(30 58 ${30 + i * 9})`} fill={c(awn ? '#e8cf7a' : '#e0b23c')} {...common} />
        {awn && <><path d={`M38 ${24 + i * 9} L20 ${4 + i * 9}`} {...common} strokeWidth={1.6} /><path d={`M62 ${24 + i * 9} L80 ${4 + i * 9}`} {...common} strokeWidth={1.6} /></>}
      </g>)}
      <ellipse cx="50" cy="20" rx="6" ry="10" fill={c(awn ? '#e8cf7a' : '#e0b23c')} {...common} />
      {awn && <path d="M50 10 L50 -6" {...common} strokeWidth={1.6} />}
    </g>
  } else if (id === 'grape') {
    const pts = [[36, 34], [50, 34], [64, 34], [43, 47], [57, 47], [36, 60], [50, 60], [64, 60], [43, 73], [57, 73], [50, 86]]
    body = <g>
      <path d="M50 26 C 52 16 58 10 66 8" fill="none" {...common} stroke={line ? K : '#6b4f2a'} strokeWidth={3.5} />
      <path d="M52 22 C 60 6 84 8 86 22 C 78 30 62 30 52 22 Z" fill={c('#6fae45')} {...common} />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="8.5" fill={c('#7b3fa0')} {...common} />)}
    </g>
  } else if (id === 'fig') {
    body = <g>
      <path d="M50 14 L50 24" {...common} stroke={line ? K : '#6b4f2a'} strokeWidth={4} />
      <path d="M50 22 C 40 22 34 40 26 58 C 16 82 34 94 50 94 C 66 94 84 82 74 58 C 66 40 60 22 50 22 Z" fill={c('#7a3e6b')} {...common} />
      <path d="M40 62 C 44 56 48 56 50 52 M58 70 C 56 64 60 60 62 58" fill="none" {...common} strokeWidth={2} />
      <path d="M52 16 C 62 2 84 6 88 18 C 76 26 62 24 52 16 Z" fill={c('#6fae45')} {...common} />
    </g>
  } else if (id === 'pomegranate') {
    body = <g>
      <path d="M40 22 L42 10 L47 18 L50 6 L53 18 L58 10 L60 22 Z" fill={c('#b3203a')} {...common} />
      <circle cx="50" cy="58" r="36" fill={c('#d62d4a')} {...common} />
      {!line && <ellipse cx="38" cy="46" rx="8" ry="12" fill="#ffffff55" transform="rotate(30 38 46)" />}
      {line && [[40, 56], [52, 62], [60, 50], [46, 72], [58, 74]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="white" {...common} strokeWidth={2} />)}
    </g>
  } else if (id === 'olive') {
    body = <g>
      <path d="M10 70 C 36 58 62 44 92 24" fill="none" {...common} stroke={line ? K : '#6b4f2a'} strokeWidth={3.5} />
      {[[24, 60, -20], [44, 50, 20], [64, 38, -25], [80, 30, 20]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y - 12} rx="5" ry="14" transform={`rotate(${r + 60} ${x} ${y - 12})`} fill={c('#7ea04a')} {...common} />)}
      {[[34, 74], [54, 64], [72, 54]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="9" ry="12" fill={c(i === 1 ? '#3a3f2a' : '#5b7a2c')} {...common} />)}
    </g>
  } else if (id === 'date') {
    body = <g>
      <path d="M50 8 C 50 20 50 30 50 40" fill="none" {...common} stroke={line ? K : '#b07a2c'} strokeWidth={3.5} />
      {[[-26, 30], [-14, 26], [0, 22], [14, 26], [26, 30]].map(([dx, dy], i) => <path key={'s' + i} d={`M50 36 L${50 + dx} ${36 + dy}`} {...common} stroke={line ? K : '#b07a2c'} strokeWidth={2} />)}
      {[[24, 66], [36, 72], [50, 76], [64, 72], [76, 66], [30, 84], [44, 90], [58, 90], [70, 84]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="6.5" ry="11" fill={c('#9a4f1f')} {...common} />)}
    </g>
  }
  return <svg viewBox="-4 -8 108 108" width={size} height={size} role="img" aria-label={title || id} style={{ overflow: 'visible' }}>{body}</svg>
}
