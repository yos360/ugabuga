// Classic card faces drawn as vectors: real pip layouts, mirrored court emblems and an ornamental back.
// SVG suits avoid emoji rendering of ♥/♦ on phones and stay crisp at every card size.
const SUIT_PATHS = [
  'M50 4C62 22 92 38 92 60C92 76 76 84 62 76C58 74 55 70 54 68C55 80 60 90 70 96H30C40 90 45 80 46 68C45 70 42 74 38 76C24 84 8 76 8 60C8 38 38 22 50 4Z',
  'M50 92C38 78 6 60 6 34C6 18 18 8 31 8C40 8 47 14 50 22C53 14 60 8 69 8C82 8 94 18 94 34C94 60 62 78 50 92Z',
  'M50 2Q66 28 88 50Q66 72 50 98Q34 72 12 50Q34 28 50 2Z',
  'M50 8A20 20 0 0 1 66 40A20 20 0 1 1 56 72C57 82 62 90 70 96H30C38 90 43 82 44 72A20 20 0 1 1 34 40A20 20 0 0 1 50 8Z',
]

export function SuitIcon({ suit, size = 100, x = 0, y = 0, flip = false, className }) {
  const s = size / 100
  return <path className={className} d={SUIT_PATHS[suit]} fill="currentColor"
    transform={`translate(${x - size / 2} ${y - size / 2}) scale(${s})${flip ? ' rotate(180 50 50)' : ''}`} />
}

export function SuitGlyph({ suit, className }) {
  return <svg className={className} viewBox="0 0 100 100" aria-hidden="true"><path d={SUIT_PATHS[suit]} fill="currentColor" /></svg>
}

// Pip centres on a 3-column grid (x: 33/50/67) inside a 100×140 card; pips below the middle are turned over.
const L = 33, C = 50, R = 67
const row = p => 24 + p * 0.92
const PIPS = {
  2: [[C, 0], [C, 100]],
  3: [[C, 0], [C, 50], [C, 100]],
  4: [[L, 0], [R, 0], [L, 100], [R, 100]],
  5: [[L, 0], [R, 0], [C, 50], [L, 100], [R, 100]],
  6: [[L, 0], [R, 0], [L, 50], [R, 50], [L, 100], [R, 100]],
  7: [[L, 0], [R, 0], [C, 25], [L, 50], [R, 50], [L, 100], [R, 100]],
  8: [[L, 0], [R, 0], [C, 25], [L, 50], [R, 50], [C, 75], [L, 100], [R, 100]],
  9: [[L, 0], [R, 0], [L, 33], [R, 33], [C, 50], [L, 67], [R, 67], [L, 100], [R, 100]],
  10: [[L, 0], [R, 0], [C, 17], [L, 33], [R, 33], [L, 67], [R, 67], [C, 83], [L, 100], [R, 100]],
}

function Crown({ rank }) {
  if (rank === 13) return <path d="M37 33V21L43.5 27L50 17L56.5 27L63 21V33Z" fill="#e8c34a" stroke="#c99a1e" strokeWidth="1" strokeLinejoin="round" />
  if (rank === 12) return <g fill="#e8c34a" stroke="#c99a1e" strokeWidth="1"><path d="M38 33Q38 23 44 25Q50 15 56 25Q62 23 62 33Z" /><circle cx="50" cy="19" r="2.6" /></g>
  return <g fill="#e8c34a" stroke="#c99a1e" strokeWidth="1"><path d="M39 33V27Q50 22 61 27V33Z" /><path d="M55 25Q58 15 66 14Q62 20 58 26Z" /></g>
}

function Court({ rank, suit }) {
  const half = <g><Crown rank={rank} />
    <circle cx="50" cy="51" r="14" fill="none" stroke="#b7c0d1" strokeWidth="6.5" />
    <circle cx="50" cy="51" r="5" fill="#b7c0d1" /></g>
  return <g>
    <rect x="24" y="12" width="52" height="116" rx="3" fill="none" stroke="#d8dce5" strokeWidth="1.2" />
    {half}<g transform="rotate(180 50 70)">{half}</g>
    <SuitIcon suit={suit} size={15} x={50} y={70} />
  </g>
}

export function CardFace({ card, small }) {
  const { rank, suit } = card
  return <svg className="sol-face" viewBox="0 0 100 140" aria-hidden="true">
    {rank > 10 ? <g transform={small ? 'translate(16 24) scale(.78)' : undefined}><Court rank={rank} suit={suit} /></g>
      : rank === 1 || small ? <SuitIcon suit={suit} size={rank === 1 ? 40 : 36} x={small ? 58 : 50} y={small ? 92 : 70} />
        : PIPS[rank].map(([x, p], i) => <SuitIcon key={i} suit={suit} size={16} x={x} y={row(p)} flip={p > 50} />)}
  </svg>
}

const FLOURISH = 'M30 30Q50 14 70 30M36 30Q50 22 64 30M50 18V12M38 40Q50 34 62 40'

export function CardBack() {
  return <svg className="sol-back" viewBox="0 0 100 140" aria-hidden="true">
    <rect x="7" y="7" width="86" height="126" rx="5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <rect x="11" y="11" width="78" height="118" rx="3" fill="none" stroke="currentColor" strokeWidth=".6" opacity=".6" />
    <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
      <path d={FLOURISH} /><path d={FLOURISH} transform="rotate(180 50 70)" />
      <path d="M17 70Q24 60 22 50M17 70Q24 80 22 90M83 70Q76 60 78 50M83 70Q76 80 78 90" />
    </g>
    <circle cx="50" cy="70" r="17" fill="none" stroke="currentColor" strokeWidth="1" />
    <circle cx="50" cy="70" r="12" fill="currentColor" opacity=".85" />
    <circle cx="50" cy="70" r="5" fill="#4a5468" />
  </svg>
}
