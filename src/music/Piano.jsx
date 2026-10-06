import { useEffect, useRef, useState } from 'react'
import { playPiano, noteName } from './audio'
import './music.css'

// Interactive piano keyboard: mouse, touch (several fingers at once) and the computer keyboard.
// `marks` colours keys: { [midi]: 'next' | 'play' | 'right' | 'wrong' | 'chord' }.

export const SOLFEGE = ['דו', 'דו#', 'רה', 'רה#', 'מי', 'פה', 'פה#', 'סול', 'סול#', 'לה', 'לה#', 'סי']
export const LETTER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const isBlack = n => [1, 3, 6, 8, 10].includes(((n % 12) + 12) % 12)
export const label = (n, mode) => mode === 'letters' ? LETTER[n % 12] : mode === 'solfege' ? SOLFEGE[n % 12] : ''

// Physical keys (layout-independent, so it works with a Hebrew keyboard too): two rows like a piano.
const KEYMAP = ['KeyA', 'KeyW', 'KeyS', 'KeyE', 'KeyD', 'KeyF', 'KeyT', 'KeyG', 'KeyY', 'KeyH', 'KeyU', 'KeyJ', 'KeyK', 'KeyO', 'KeyL', 'KeyP', 'Semicolon', 'Quote']

export default function Piano({ from = 48, to = 72, marks = {}, labels = 'solfege', onPress, keyboard = true, showKeys = false }) {
  const [down, setDown] = useState(() => new Set())
  const pointers = useRef(new Map())
  const press = n => { playPiano(n); onPress?.(n); setDown(d => new Set(d).add(n)) }
  const release = n => setDown(d => { const x = new Set(d); x.delete(n); return x })

  // Computer keyboard: A = the first C shown (or C4 if it's in range).
  const base = from <= 60 && to >= 72 ? 60 : from + ((12 - (from % 12)) % 12)
  useEffect(() => {
    if (!keyboard) return
    const held = new Set()
    const kd = e => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return
      const i = KEYMAP.indexOf(e.code); if (i < 0) return
      const n = base + i; if (n > to) return
      e.preventDefault(); held.add(e.code); press(n)
    }
    const ku = e => { const i = KEYMAP.indexOf(e.code); if (i >= 0) { held.delete(e.code); release(base + i) } }
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku)
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku) }
  })

  const whites = []
  for (let n = from; n <= to; n++) if (!isBlack(n)) whites.push(n)
  const wPct = 100 / whites.length
  const keyAt = n => {
    const wi = whites.filter(w => w < n).length
    return isBlack(n) ? { left: `${wi * wPct - wPct * 0.31}%`, width: `${wPct * 0.62}%` } : { left: `${wi * wPct}%`, width: `${wPct}%` }
  }
  const handlers = n => ({
    onPointerDown: e => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); pointers.current.set(e.pointerId, n); press(n) },
    onPointerUp: e => { pointers.current.delete(e.pointerId); release(n) },
    onPointerCancel: e => { pointers.current.delete(e.pointerId); release(n) },
    onPointerLeave: () => release(n),
  })
  const keys = []
  for (let n = from; n <= to; n++) {
    const k = KEYMAP[n - base]
    keys.push(<button key={n} type="button" aria-label={`${SOLFEGE[n % 12]} (${noteName(n)})`}
      className={`pk ${isBlack(n) ? 'pk-black' : 'pk-white'} ${down.has(n) ? 'is-down' : ''} ${marks[n] ? 'is-' + marks[n] : ''}`}
      style={keyAt(n)} {...handlers(n)}>
      <span className="pk-label">{label(n, labels)}</span>
      {showKeys && k && <span className="pk-hint" dir="ltr">{k.replace('Key', '').replace('Semicolon', ';').replace('Quote', "'")}</span>}
    </button>)
  }
  // Whites first, blacks on top.
  keys.sort((a, b) => isBlack(+a.key) - isBlack(+b.key))
  return <div className="piano" dir="ltr" role="group" aria-label="פסנתר">{keys}</div>
}
