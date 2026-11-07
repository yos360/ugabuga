// One picture of a find-the-differences pair (see arcade/logic/spotDiff.js).
// `marks`: circles to draw (found differences / answer key). `onTap(x, y)` in panel units.
export default function SpotDiffPanel({ data, which = 'base', marks = [], onTap, label, className = '' }) {
  const items = which === 'base' ? data.base : data.changed
  const tap = onTap && (e => {
    const r = e.currentTarget.getBoundingClientRect()
    onTap(((e.clientX - r.left) / r.width) * data.W, ((e.clientY - r.top) / r.height) * data.H)
  })
  return (
    <svg viewBox={`0 0 ${data.W} ${data.H}`} className={`spot-panel ${className}`} role="img" aria-label={label} onClick={tap} style={{ display: 'block', width: '100%', height: 'auto', cursor: onTap ? 'pointer' : undefined }}>
      <rect x="0.4" y="0.4" width={data.W - 0.8} height={data.H - 0.8} rx="3" fill="#fff" stroke="#1b1c29" strokeWidth="0.8" />
      {items.map((it, i) => (
        <text key={`${it.id}-${i}`} x={it.x} y={it.y} fontSize={it.s} textAnchor="middle" dominantBaseline="central" transform={it.r ? `rotate(${it.r} ${it.x} ${it.y})` : undefined}>{it.e}</text>
      ))}
      {marks.map((m, i) => <circle key={i} cx={m.x} cy={m.y} r={m.r} fill="none" stroke={m.color || '#e11d48'} strokeWidth="1.1" />)}
    </svg>
  )
}
