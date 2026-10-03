// Shared bits for every game: the status pills + buttons row, and the end-of-level card.
export function Hud({ stats, children }) {
  return (
    <div className="arc-hud">
      <div className="arc-pills">
        {stats.map(([label, value]) => <span key={label} className="arc-pill">{label} <b>{value}</b></span>)}
      </div>
      {children && <div className="arc-tools">{children}</div>}
    </div>
  )
}

export function ToolButton({ onClick, disabled, children, label }) {
  return <button type="button" className="arc-tool" onClick={onClick} disabled={disabled} aria-label={label} title={label}>{children}</button>
}

export function Stars({ n }) {
  return <p className="arc-stars" aria-label={`${n} כוכבים מתוך 3`}>{[1, 2, 3].map(i => <span key={i} className={i <= n ? 'on' : ''}>★</span>)}</p>
}

export function EndCard({ title, text, stars, primary, onPrimary, secondary, onSecondary }) {
  return (
    <div className="arc-end" role="alertdialog" aria-label={title}>
      <div className="arc-end-card">
        <h3>{title}</h3>
        {stars ? <Stars n={stars} /> : null}
        {text && <p>{text}</p>}
        <div className="arc-end-actions">
          <button type="button" className="arc-btn arc-btn-main" onClick={onPrimary} autoFocus>{primary}</button>
          {secondary && <button type="button" className="arc-btn" onClick={onSecondary}>{secondary}</button>}
        </div>
      </div>
    </div>
  )
}
