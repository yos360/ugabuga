// Descriptive statistics of a typed list, with a small box plot and frequency table.
import { useMemo, useState } from 'react'
import { parseList, stats, fmt } from '../mathTools'

function BoxPlot({ s }) {
  if (s.max === s.min) return null
  const W = 320; const pad = 14
  const X = v => pad + (v - s.min) / (s.max - s.min) * (W - 2 * pad)
  return <svg className="sc-box" viewBox={`0 0 ${W} 60`} role="img" aria-label={`דיאגרמת קופסה: מינימום ${fmt(s.min)}, רבעון תחתון ${fmt(s.q1)}, חציון ${fmt(s.median)}, רבעון עליון ${fmt(s.q3)}, מקסימום ${fmt(s.max)}`}>
    <line x1={X(s.min)} x2={X(s.max)} y1="24" y2="24" stroke="currentColor" strokeWidth="2" />
    <rect x={X(s.q1)} y="10" width={Math.max(1, X(s.q3) - X(s.q1))} height="28" fill="#ffd23f" stroke="currentColor" strokeWidth="2" rx="3" />
    <line x1={X(s.median)} x2={X(s.median)} y1="10" y2="38" stroke="#cf2f56" strokeWidth="3" />
    {[s.min, s.max].map((v, i) => <line key={i} x1={X(v)} x2={X(v)} y1="14" y2="34" stroke="currentColor" strokeWidth="2" />)}
    {[s.min, s.q1, s.median, s.q3, s.max].map((v, i) => <text key={i} x={X(v)} y={i % 2 ? 56 : 52} fontSize="10" textAnchor="middle" fill="currentColor">{fmt(v)}</text>)}
  </svg>
}

export default function StatsTab() {
  const [text, setText] = useState('7, 8, 8, 9, 10, 6, 8, 9')
  const { nums, bad } = useMemo(() => parseList(text), [text])
  const s = useMemo(() => stats(nums), [nums])
  const cells = s ? [
    ['מספר נתונים', s.n], ['ממוצע', fmt(s.mean)], ['חציון', fmt(s.median)],
    ['שכיח', s.modes.length ? s.modes.map(fmt).join(', ') + ` (${s.modeCount} פעמים)` : 'אין — כל ערך מופיע פעם אחת'],
    ['טווח', fmt(s.range)], ['מינימום', fmt(s.min)], ['מקסימום', fmt(s.max)], ['סכום', fmt(s.sum)],
    ['סטיית תקן σ (אוכלוסייה)', fmt(s.sdP)], ['סטיית תקן s (מדגם)', s.sdS === null ? '—' : fmt(s.sdS)],
    ['שונות σ²', fmt(s.varP)], ['רבעון תחתון Q1', fmt(s.q1)], ['רבעון עליון Q3', fmt(s.q3)], ['טווח בין־רבעוני', fmt(s.iqr)],
  ] : []

  return <div className="sc-panel">
    <section className="sc-card">
      <h2 className="sc-h2">סטטיסטיקה של רשימת מספרים</h2>
      <label className="sc-label" htmlFor="sc-list">הנתונים — מפרידים בפסיק, ברווח או בשורה חדשה (עשרוני עם נקודה)</label>
      <textarea id="sc-list" className="sc-input sc-area" dir="ltr" rows={3} value={text} onChange={e => setText(e.target.value)} />
      {bad.length > 0 && <p className="sc-err">⚠ התעלמנו מ: <bdi dir="ltr">{bad.slice(0, 5).join(' ')}</bdi></p>}
      {!s ? <p className="sc-out">הזינו לפחות מספר אחד.</p> : <>
        <dl className="sc-stats">{cells.map(([k, v]) => <div key={k}><dt>{k}</dt><dd dir="ltr">{v}</dd></div>)}</dl>
        <BoxPlot s={s} />
        <p className="sc-sub">מסודר: <bdi dir="ltr">{s.sorted.map(fmt).join(', ')}</bdi></p>
        {s.freq.length <= 15 && s.freq.length < s.n && <table className="sc-freq"><caption>טבלת שכיחויות</caption><thead><tr><th>ערך</th><th>שכיחות</th><th>שכיחות יחסית</th></tr></thead>
          <tbody>{s.freq.map(([v, f]) => <tr key={v}><td dir="ltr">{fmt(v)}</td><td>{f}</td><td dir="ltr">{fmt(f / s.n * 100)}%</td></tr>)}</tbody></table>}
        <p className="sc-sub">הרבעונים מחושבים כמו שלומדים בבית הספר: החציון של החצי התחתון ושל החצי העליון (כשמספר הנתונים אי־זוגי, האמצעי לא נכלל).</p>
      </>}
    </section>
  </div>
}
