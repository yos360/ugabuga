import { answerOf, SOCIAL_CARDS, WORD_PROBLEMS } from '../../data/firstGradeProblemSolving'

// Simple line-art pictures and printable sheets for /classroom/first-grade/problem-solving.
// Every shape is drawn around (0,0) inside roughly a 50×50 box.
const FONT = 'Heebo, Arial, sans-serif'
const LINE = { stroke: '#111', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' }
const DEFAULT_FILL = { apple: '#ef4444', ball: '#3b82f6', star: '#facc15', fish: '#fb923c', flower: '#ec4899', balloon: '#a855f7' }
const starPoints = (r1, r2) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}` }).join(' ')

export function Shape({ kind, fill, x = 0, y = 0, s = 1, rot = 0 }) {
  const f = fill || DEFAULT_FILL[kind] || 'white'
  let body
  if (kind === 'apple') body = <><path d="M0 -12 C-16 -22 -27 -6 -22 8 C-18 20 -6 24 0 18 C6 24 18 20 22 8 C27 -6 16 -22 0 -12Z" fill={f} {...LINE} /><path d="M0 -12 Q1 -20 5 -25" fill="none" {...LINE} /><path d="M3 -19 Q12 -27 17 -19 Q9 -14 3 -19Z" fill="#22c55e" {...LINE} strokeWidth={2} /></>
  else if (kind === 'ball') body = <><circle r="20" fill={f} {...LINE} /><path d="M-20 0 Q0 -10 20 0 M0 -20 Q-9 0 0 20" fill="none" {...LINE} strokeWidth={2.4} /></>
  else if (kind === 'star') body = <polygon points={starPoints(23, 10)} fill={f} {...LINE} />
  else if (kind === 'fish') body = <><path d="M12 0 L25 -11 L25 11 Z" fill={f} {...LINE} /><ellipse cx="-3" cy="0" rx="18" ry="12" fill={f} {...LINE} /><circle cx="-11" cy="-3" r="2.6" fill="#111" /></>
  else if (kind === 'flower') body = <>{[0, 1, 2, 3, 4].map(i => { const a = i * 2 * Math.PI / 5 - Math.PI / 2; return <circle key={i} cx={(Math.cos(a) * 12).toFixed(1)} cy={(Math.sin(a) * 12).toFixed(1)} r="9" fill={f} {...LINE} /> })}<circle r="7" fill="#fde047" {...LINE} /></>
  else if (kind === 'balloon') body = <><path d="M0 14 Q-4 20 2 26" fill="none" {...LINE} strokeWidth={2} /><path d="M-3 16 L3 16 L0 12 Z" fill={f} {...LINE} strokeWidth={2} /><ellipse cx="0" cy="-4" rx="15" ry="18" fill={f} {...LINE} /></>
  else if (kind === 'circle') body = <circle r="21" fill={f} {...LINE} />
  else if (kind === 'triangle') body = <polygon points="0,-23 22,16 -22,16" fill={f} {...LINE} />
  else body = <rect x="-19" y="-19" width="38" height="38" fill={f} {...LINE} />
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>{body}</g>
}

// One picture problem: group a, then "+" and group b, laid out right to left. Up to 8 cells fit
// one row; longer problems put group a on the first row and "+ group b" on the second.
export function ProblemPicture({ p, className = '' }) {
  const step = 54, cells = p.a + p.b + (p.b ? 1 : 0), split = cells > 8
  const rows = split ? 2 : 1, width = (split ? Math.max(p.a, p.b + 1) : cells) * step
  const pos = (row, col) => ({ x: width - step / 2 - col * step, y: 30 + row * 60 })
  const items = []
  for (let i = 0; i < p.a; i++) items.push(<Shape key={`a${i}`} kind={p.shape} {...pos(0, i)} />)
  if (p.b) {
    const start = split ? 0 : p.a, row = split ? 1 : 0, plus = pos(row, start)
    items.push(<text key="plus" x={plus.x} y={plus.y + 12} textAnchor="middle" fontFamily={FONT} fontSize="38" fontWeight="800" fill="#111">+</text>)
    for (let i = 0; i < p.b; i++) items.push(<Shape key={`b${i}`} kind={p.shape} fill={p.fillB} {...pos(row, start + 1 + i)} />)
  }
  return <svg viewBox={`0 0 ${width} ${rows * 60}`} className={className} role="img" aria-label={p.b ? `${p.a} ועוד ${p.b}` : `${p.a} ציורים לספירה`} style={{ maxWidth: Math.min(width * 0.62, 330), width: '100%', height: 'auto' }}>{items}</svg>
}

// What goes inside a sorting bin label or a sorting item, centred at (0,0).
export function SortIcon({ item }) {
  if (item.emoji) return <text y="14" textAnchor="middle" fontSize="40">{item.emoji}</text>
  return <Shape kind={item.shape} fill={item.fill} s={item.scale || 1} rot={item.rot || 0} />
}

// A4 sorting sheet: items on top, three boxes at the bottom; the child draws a line from each item to its box.
export function SortSheet({ sort }) {
  const T = { fontFamily: FONT, fill: '#111', direction: 'rtl', textAnchor: 'middle' }
  return <svg viewBox="0 0 600 820" role="img" aria-label={sort.title} style={{ width: '100%', height: '100%', background: 'white' }}>
    <text x="300" y="56" {...T} fontSize="36" fontWeight="800">{sort.title}</text>
    <text x="300" y="90" {...T} fontSize="17" fill="#333">שם: ______________ · מתחו קו מכל ציור לקופסה המתאימה</text>
    {sort.note && <text x="300" y="116" {...T} fontSize="14" fill="#555">{sort.note}</text>}
    {sort.items.map((item, i) => <g key={item.id} transform={`translate(${470 - (i % 3) * 170} ${190 + Math.floor(i / 3) * 120}) scale(1.5)`}><SortIcon item={item} /></g>)}
    {sort.bins.map((bin, i) => {
      const x = 400 - i * 200
      return <g key={bin.id} transform={`translate(${x} 0)`}>
        <rect x="18" y="580" width="164" height="190" rx="18" fill="white" stroke="#111" strokeWidth="4" />
        {bin.fill ? <rect x="55" y="610" width="90" height="70" rx="14" fill={bin.fill} stroke="#111" strokeWidth="3" /> : <g transform="translate(100 646) scale(1.4)"><SortIcon item={bin} /></g>}
        <text x="100" y="735" {...T} fontSize={bin.label.length > 7 ? 22 : 30} fontWeight="800">{bin.label}</text>
      </g>
    })}
  </svg>
}

const flowStyle = { fontFamily: FONT, padding: '10mm' }

// Cut-out social problem cards: 2 per row, dashed edges.
export function SocialCardsSheet() {
  return <article className="buga-flow" dir="rtl" style={flowStyle}>
    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>כרטיסי פתרון בעיות — מה אפשר לעשות?</h2>
    <p style={{ fontSize: 14, marginBottom: 10 }}>גוזרים לאורך הקו המקווקו. קוראים את המצב, שואלים את הילד מה הוא היה עושה — ורק אחר כך מסתכלים ברעיונות.</p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {SOCIAL_CARDS.map(c => <div key={c.id} style={{ border: '2px dashed #555', borderRadius: 14, padding: 12, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div style={{ fontSize: 34, lineHeight: 1 }}>{c.emoji}</div>
        <p style={{ fontSize: 17, fontWeight: 800, margin: '6px 0' }}>{c.title}</p>
        <ul style={{ fontSize: 14, lineHeight: 1.5, paddingRight: 18, listStyle: 'disc' }}>{c.ideas.map(t => <li key={t}>{t}</li>)}</ul>
        <p style={{ fontSize: 14, marginTop: 6 }}><b>שאלה לשיחה:</b> {c.ask}</p>
      </div>)}
    </div>
  </article>
}

// Word problems with pictures and an answer box, plus an answers page for the parent.
export function WordProblemsSheet({ answers = false }) {
  return <article className="buga-flow" dir="rtl" style={flowStyle}>
    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{answers ? 'תשובות להורים — שאלות סיפור בציורים' : 'שאלות סיפור בציורים — סופרים עד 10'}</h2>
    {answers
      ? <ol style={{ fontSize: 18, lineHeight: 1.8, paddingRight: 22, listStyle: 'decimal' }}>{WORD_PROBLEMS.map(p => <li key={p.id}>{p.b ? `${p.a} + ${p.b} = ${answerOf(p)}` : answerOf(p)}</li>)}</ol>
      : <>
        <p style={{ fontSize: 15, marginBottom: 10 }}>שם: ______________ · קוראים יחד, סופרים את הציורים וכותבים את התשובה בריבוע.</p>
        {WORD_PROBLEMS.map((p, i) => <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #ccc', padding: '8px 0', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{i + 1}. {p.text}</p>
            <ProblemPicture p={p} />
          </div>
          <div aria-label="ריבוע לתשובה" style={{ width: 62, height: 62, border: '3px solid #111', borderRadius: 10, flex: 'none' }} />
        </div>)}
      </>}
  </article>
}
