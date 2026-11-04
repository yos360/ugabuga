import { useEffect } from 'react'
import useModalDialog from '../hooks/useModalDialog'
import Confetti from './Confetti'
import { sfx, buzz } from './sfx'
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

export function Stars({ n, lang = 'he' }) {
  return <p className="arc-stars" aria-label={lang === 'en' ? `${n} out of 3 stars` : `${n} כוכבים מתוך 3`}>{[1, 2, 3].map(i => <span key={i} className={i <= n ? 'on' : ''} style={{ '--i': i - 1 }}>★</span>)}</p>
}

// Win and record default to the wording every game already uses (a 🎉/🏆 title, stars, "שיא"/"best"
// in the text), so all games celebrate without passing anything; a game can still say so explicitly.
const WIN_TITLE = /^(🎉|🏆|🌟|⚡)/u
const RECORD_TEXT = /שיא (חדש|אישי)|new (best|record)|personal best/i

export function EndCard({ title, text, stars, primary, onPrimary, secondary, onSecondary, lang = 'he', win, record }) {
  const isRecord = record ?? RECORD_TEXT.test(text || '')
  const party = (win ?? (stars > 0 || WIN_TITLE.test(title))) || isRecord
  useEffect(() => {
    const timers = []
    const later = (ms, fn) => timers.push(setTimeout(fn, ms))
    if (party) { sfx('win'); buzz([25, 40, 25]) } else { sfx('lose'); buzz(60) }
    for (let i = 0; i < (stars || 0); i++) later(380 + i * 200, () => sfx('star', i))
    if (isRecord) later(380 + (stars || 0) * 200 + 150, () => sfx('record'))
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- once, when the card appears
  return (
    <div className="arc-end" role="alertdialog" aria-label={title}>
      {party && <Confetti />}
      <div className={`arc-end-card${party ? ' is-win' : ''}`}>
        {isRecord && <p className="arc-record">🏆 {lang === 'en' ? 'New record!' : 'שיא חדש!'}</p>}
        <h3>{title}</h3>
        {stars ? <Stars n={stars} lang={lang} /> : null}
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
export function LevelMap({ count, perWorld, worlds, unlocked, stars = {}, current, onPick, onClose, lang = 'he' }) {
  const en = lang === 'en'
  const mapRef = useModalDialog(onClose)
  const groups = Array.from({ length: Math.ceil(count / perWorld) }, (_, g) => g)
  return (
    <div ref={mapRef} tabIndex={-1} className="arc-end" aria-modal="true" role="dialog" aria-label={en ? 'Level map' : 'מפת שלבים'} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="arc-end-card arc-map">
        <div className="arc-map-head"><h3>🗺️ {en ? 'Level map' : 'מפת שלבים'}</h3><button type="button" className="arc-btn" onClick={onClose}>{en ? 'Close ✕' : 'סגירה ✕'}</button></div>
        <div className="arc-map-scroll">
          {groups.map(g => {
            const w = worlds[g % worlds.length], first = g * perWorld + 1
            return <section key={g} className="arc-map-world">
              <h4><span aria-hidden="true">{w.emoji} </span>{w.name} <small>{en ? 'Levels' : 'שלבים'} {first}–{first + perWorld - 1}</small></h4>
              <div className="arc-map-grid">
                {Array.from({ length: perWorld }, (_, i) => {
                  const n = first + i, open = n <= unlocked, st = stars[n] || 0
                  return <button key={n} type="button" disabled={!open} onClick={() => onPick(n)}
                    className={`arc-map-level ${n === current ? 'is-current' : ''} ${st ? 'is-done' : ''}`}
                    aria-label={en ? (open ? `Level ${n}${st ? `, ${st} stars` : ''}` : `Level ${n} locked`) : (open ? `שלב ${n}${st ? `, ${st} כוכבים` : ''}` : `שלב ${n} נעול`)}>
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
