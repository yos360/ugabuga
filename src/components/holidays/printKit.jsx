// Shared building blocks for holiday A4 pages (600 × 820 SVG): the page frame,
// traced words, a big hollow greeting, counting, and picture–word matching.
// Each holiday only draws its own pictures; layout and fonts stay consistent.

export const FONT = 'Heebo, Arial, sans-serif'
export const S = { fill: 'white', stroke: '#111', strokeWidth: 5, strokeLinejoin: 'round', strokeLinecap: 'round' }
export const S3 = { ...S, strokeWidth: 3 }

export function Page({ title, sub, big = false, children }) {
  return <svg viewBox="0 0 600 820" role="img" aria-label={title || sub || 'דף להדפסה'} style={{ width: '100%', height: '100%', background: 'white' }}>
    {title && <text x="300" y="46" textAnchor="middle" fontFamily={FONT} fontSize={big ? 38 : 30} fontWeight="800" fill="#111" direction="rtl">{title}</text>}
    <text x="300" y="76" textAnchor="middle" fontFamily={FONT} fontSize="15" fill="#444" direction="rtl">שם: ____________    תאריך: ____________</text>
    {sub && <text x="300" y="108" textAnchor="middle" fontFamily={FONT} fontSize="18" fontWeight="700" fill="#111" direction="rtl">{sub}</text>}
    {children}
  </svg>
}

// Place a drawing made for a 100×100 box at (x, y) with the given size.
export const At = ({ x, y, size = 100, children }) => <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 100})`}>{children}</g>

export function TraceWordsPage({ title, words }) {
  return <Page title={title} sub="עוברים בעיפרון על המילים, ואז כותבים לבד בשורה">
    {words.slice(0, 6).map((w, i) => {
      const y = 200 + i * 102, fs = Math.min(84, 480 / Math.max([...w].length * 0.62, 1))
      return <g key={i}>
        <path d={`M40 ${y - fs * 0.6} H560`} stroke="#ccc" strokeDasharray="5 4" />
        <path d={`M40 ${y} H560`} stroke="#888" />
        <text x="300" y={y} textAnchor="middle" fontFamily="BugaTracer" fontSize={fs} fill="#555" stroke="#555" strokeWidth={fs * 0.012} direction="rtl">{w}</text>
        <path d={`M40 ${y + 42} H560`} stroke="#bbb" />
      </g>
    })}
  </Page>
}

// Big hollow letters to colour, with a row of drawings underneath.
export function GreetingPage({ lines, children }) {
  return <Page>
    {lines.map((l, i) => <text key={i} x="300" y={250 + i * 165} textAnchor="middle" fontFamily={FONT} fontSize={Math.min(140, 560 / Math.max([...l].length * 0.62, 1))} fontWeight="900" fill="white" stroke="#111" strokeWidth="6" direction="rtl">{l}</text>)}
    {children}
  </Page>
}

// Six boxes, each with n copies of a drawing (render(x, y) draws one at that centre), and a box to write the count.
export function CountPage({ title, sub, counts = [3, 5, 2, 6, 4, 7], render, size = 34 }) {
  return <Page title={title} sub={sub}>
    {counts.map((n, i) => {
      const col = i % 2, row = Math.floor(i / 2), bx = col ? 40 : 320, by = 140 + row * 215
      return <g key={i}>
        <rect x={bx} y={by} width="240" height="190" rx="18" fill="white" stroke="#111" strokeWidth="2.5" />
        {Array.from({ length: n }, (_, k) => { const cx = bx + 45 + (k % 4) * 50, cy = by + 45 + Math.floor(k / 4) * 60; return <g key={k}>{render(cx, cy, size)}</g> })}
        <rect x={bx + 170} y={by + 128} width="52" height="46" rx="8" fill="white" stroke="#111" strokeWidth="2.5" strokeDasharray="6 4" />
      </g>
    })}
  </Page>
}

// Drawings on the right, words on the left (shuffled order given by the caller) — draw a line.
export function MatchPage({ title, sub = 'מתחו קו מכל ציור למילה המתאימה', items, words }) {
  return <Page title={title} sub={sub}>
    {items.map((it, i) => <g key={i}>
      {it.render(470, 190 + i * 125, 96)}
      <circle cx="400" cy={190 + i * 125} r="7" fill="#111" />
    </g>)}
    {words.map((w, i) => <g key={w}>
      <circle cx="220" cy={190 + i * 125} r="7" fill="#111" />
      <rect x="50" y={162 + i * 125} width="160" height="56" rx="14" fill="white" stroke="#111" strokeWidth="3" />
      <text x="130" y={200 + i * 125} textAnchor="middle" fontFamily={FONT} fontSize={w.length > 6 ? 24 : 30} fontWeight="800" direction="rtl">{w}</text>
    </g>)}
  </Page>
}

// A single big drawing filling the page (for colouring).
export const BigPage = ({ title, children }) => <Page title={title} big>{children}</Page>
