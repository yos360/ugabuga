import { useEffect, useRef } from 'react'

export default function CardRestartDialog({ onCancel, onConfirm, en = false }) {
  const ref = useRef(null)
  useEffect(() => { ref.current.showModal() }, [])
  return <dialog ref={ref} className="card-restart" aria-labelledby="card-restart-title"
    onKeyDown={e => { if (e.key === 'Escape') e.stopPropagation() }}
    onCancel={e => { e.preventDefault(); onCancel() }}>
    <h3 id="card-restart-title">{en ? 'Start a new game?' : 'להתחיל משחק חדש?'}</h3>
    <p>{en ? 'This will replace your saved game.' : 'המשחק השמור הנוכחי יוחלף.'}</p>
    <div><button type="button" className="arc-btn" autoFocus onClick={onCancel}>{en ? 'Keep playing' : 'המשך המשחק'}</button>
      <button type="button" className="arc-btn arc-btn-main" onClick={onConfirm}>{en ? 'New game' : 'משחק חדש'}</button></div>
  </dialog>
}
