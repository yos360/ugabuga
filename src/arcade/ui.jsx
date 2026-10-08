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

// A row of mutually exclusive choices (game mode, computer level) — big touch targets, aria-pressed.
export function Segmented({ label, options, value, onChange }) {
  return (
    <div className="arc-seg" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" className={v === value ? 'is-on' : ''} aria-pressed={v === value} onClick={() => onChange(v)}>{text}</button>
      ))}
    </div>
  )
}

// Level map: every level as a button, grouped into worlds, with the stars earned so far.
// Levels up to `unlocked` can be played; the rest stay locked until reached.
export function LevelMap({ count, perWorld, worlds, unlocked, stars = {}, current, onPick, onClose }) {
  const groups = Array.from({ length: Math.ceil(count / perWorld) }, (_, g) => g)
  return (
    <div className="arc-end" role="dialog" aria-label="מפת שלבים" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="arc-end-card arc-map">
        <div className="arc-map-head"><h3>🗺️ מפת שלבים</h3><button type="button" className="arc-btn" onClick={onClose}>סגירה ✕</button></div>
        <div className="arc-map-scroll">
          {groups.map(g => {
            const w = worlds[g % worlds.length], first = g * perWorld + 1
            return <section key={g} className="arc-map-world">
              <h4><span aria-hidden="true">{w.emoji} </span>{w.name} <small>שלבים {first}–{first + perWorld - 1}</small></h4>
              <div className="arc-map-grid">
                {Array.from({ length: perWorld }, (_, i) => {
                  const n = first + i, open = n <= unlocked, st = stars[n] || 0
                  return <button key={n} type="button" disabled={!open} onClick={() => onPick(n)}
                    className={`arc-map-level ${n === current ? 'is-current' : ''} ${st ? 'is-done' : ''}`}
                    aria-label={open ? `שלב ${n}${st ? `, ${st} כוכבים` : ''}` : `שלב ${n} נעול`}>
                    <b>{open ? n : '🔒'}</b>{open && <span className="arc-map-stars" aria-hidden="true">{'★'.repeat(st)}{'☆'.repeat(3 - st)}</span>}
                  </button>
                })}
              </div>
            </section>
          })}
        </div>
      </div>
    </div>
  )
}
