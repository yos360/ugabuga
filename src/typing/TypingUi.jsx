// Shared UI for the typing pages: key capture, typing state, keyboard, hands, text, stats.
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { FINGERS, keyFor } from './typingData'
import { resolveTyped, wpm, accuracy } from './typingEngine'

export const storeGet = (k, fallback) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback } catch { return fallback } }
export const storeSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode */ } }

export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false)
  useEffect(() => {
    try { setCoarse(window.matchMedia('(hover: none) and (pointer: coarse)').matches) } catch { /* old browser */ }
  }, [])
  return coarse
}

// Listens to the physical keyboard on the whole page (no need to click a box first) and
// to a hidden input for phone/tablet on-screen keyboards. `onChar` gets one character.
export function useKeyCapture(onChar, active, layout) {
  const cb = useRef(onChar)
  useEffect(() => { cb.current = onChar })
  useEffect(() => {
    if (!active) return
    const h = e => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return
      const t = e.target
      if (t instanceof Element && t.closest('input, textarea, select, [contenteditable="true"]') && !t.hasAttribute('data-typing-capture')) return
      if (e.key === 'Unidentified' || e.key === 'Process') return
      const ch = resolveTyped(e, layout)
      if (ch == null) return
      e.preventDefault()
      cb.current(ch, e.code)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [active, layout])
  const onInput = useCallback(e => {
    const v = e.currentTarget.value
    e.currentTarget.value = ''
    for (const ch of v) cb.current(ch, '')
  }, [])
  return onInput
}

export function CaptureInput({ onInput, inputRef }) {
  return <input ref={inputRef} data-typing-capture="1" className="ty-capture" aria-label="הקלדה" autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} onInput={onInput} />
}

// Typing state for one text. Wrong key = the cursor stays and the letter is marked.
function reducer(s, a) {
  if (a.type === 'reset') return { pos: 0, keys: 0, wrong: 0, errs: [], start: null, end: null, bad: 0, text: a.text }
  if (a.type === 'stop') return s.end ? s : { ...s, end: a.now }
  if (s.end || s.pos >= s.text.length) return s
  const start = s.start ?? a.now
  if (a.ch === s.text[s.pos]) {
    const pos = s.pos + 1
    return { ...s, start, pos, keys: s.keys + 1, end: pos >= s.text.length ? a.now : null }
  }
  return { ...s, start, keys: s.keys + 1, wrong: s.wrong + 1, errs: s.errs.includes(s.pos) ? s.errs : [...s.errs, s.pos], bad: s.bad + 1 }
}
export function useTyper(text) {
  const [s, dispatch] = useReducer(reducer, text, t => reducer(null, { type: 'reset', text: t }))
  useEffect(() => { dispatch({ type: 'reset', text }) }, [text])
  const [now, tick] = useState(0)
  const type = useCallback(ch => { const now = performance.now(); tick(now); dispatch({ type: 'char', ch, now }) }, [])
  const stop = useCallback(() => dispatch({ type: 'stop', now: performance.now() }), [])
  const running = s.start != null && !s.end
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => tick(performance.now()), 500)
    return () => clearInterval(id)
  }, [running])
  const elapsed = s.start == null ? 0 : (s.end ?? Math.max(now, s.start)) - s.start
  return {
    ...s, type, stop, running, elapsed,
    done: s.text.length > 0 && s.pos >= s.text.length,
    next: s.text[s.pos],
    wpm: elapsed > 1500 ? wpm(s.pos, elapsed) : 0,
    acc: accuracy(s.keys - s.wrong, s.keys),
  }
}

export function TypingText({ t, dir, scroll = false }) {
  const box = useRef(null)
  const cur = useRef(null)
  useLayoutEffect(() => {
    if (!scroll || !box.current || !cur.current) return
    const lh = cur.current.offsetHeight || 40
    box.current.scrollTop = Math.max(0, cur.current.offsetTop - lh * 0.9)
  }, [t.pos, scroll])
  const errs = new Set(t.errs)
  const words = []
  let i = 0
  for (const part of t.text.split(/( )/)) {
    if (!part) continue
    const start = i
    i += part.length
    words.push([start, part])
  }
  const cls = idx => idx < t.pos ? (errs.has(idx) ? 'c done was-err' : 'c done') : idx === t.pos ? (t.bad && errs.has(idx) ? 'c cur bad' : 'c cur') : 'c todo'
  return (
    <div ref={box} className={'ty-text' + (scroll ? ' is-scroll' : '')} dir={dir} aria-label="הטקסט להקלדה">
      {words.map(([start, part]) => part === ' '
        ? <span key={start} ref={start === t.pos ? cur : null} className={cls(start) + ' sp'}>{' '}</span>
        : <span key={start} className="w">{[...part].map((ch, j) => {
          const idx = start + j
          return <span key={`${idx}-${idx === t.pos ? t.bad : 0}`} ref={idx === t.pos ? cur : null} className={cls(idx)}>{ch}</span>
        })}</span>)}
    </div>
  )
}

export function Stats({ t, extra }) {
  const progress = t.text.length ? Math.round((t.pos / t.text.length) * 100) : 0
  return (
    <div className="ty-stats" aria-live="off">
      <div><b>{t.wpm}</b><span>מילים לדקה</span></div>
      <div><b>{t.acc}%</b><span>דיוק</span></div>
      <div><b>{t.wrong}</b><span>טעויות</span></div>
      <div><b>{extra ?? progress + '%'}</b><span>{extra != null ? 'זמן' : 'התקדמות'}</span></div>
    </div>
  )
}

// ── on-screen keyboard ───────────────────────────────
const MOD = {
  Backspace: ['⌫', 2], Tab: ['Tab', 1.5], Backslash: ['\\', 1.5], CapsLock: ['Caps', 1.75], Enter: ['Enter', 2.25],
  ShiftLeft: ['Shift', 2.25], ShiftRight: ['Shift', 2.75], Space: ['רווח', 6.5],
}
const tint = c => `color-mix(in srgb, ${c} 45%, white)`
export function Keyboard({ layout, next, wrongCode, showLatin = true }) {
  const k = next != null ? keyFor(layout, next) : null
  const rows = [
    [...layout.rows[0], 'Backspace'],
    ['Tab', ...layout.rows[1], 'Backslash'],
    ['CapsLock', ...layout.rows[2], 'Enter'],
    ['ShiftLeft', ...layout.rows[3], 'ShiftRight'],
    ['Space'],
  ]
  const bump = ['KeyF', 'KeyJ']
  return (
    <div style={{ containerType: 'inline-size' }}>
      <div className="ty-kb" style={{ '--u': 'min(calc(100cqi / 16.6), 44px)' }} aria-hidden="true">
        {rows.map((row, r) => (
          <div key={r} className="ty-row">
            {row.map(code => {
              const key = layout.byCode[code]
              const mod = MOD[code]
              const finger = FINGERS[key?.finger] || (code === 'Space' ? FINGERS.TH : code.startsWith('Shift') ? FINGERS[code === 'ShiftLeft' ? 'LP' : 'RP'] : null)
              const isNext = k && (k.code === code || k.shiftCode === code)
              const style = { width: `calc(var(--u) * ${mod ? mod[1] : 1})`, background: finger && (key || code === 'Space' || code.startsWith('Shift')) ? (isNext ? finger.color : tint(finger.color)) : undefined }
              const cls = 'ty-key' + (mod ? ' is-mod' : '') + (bump.includes(code) ? ' is-bump' : '') + (isNext ? ' is-next' : '') + (wrongCode === code ? ' is-wrong' : '')
              return <div key={code} className={cls} style={style}>
                {mod ? mod[0] : key.base}
                {showLatin && key && layout.id === 'he' && /^[A-Z]$/.test(key.latin) && <small>{key.latin}</small>}
              </div>
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── hands ───────────────────────────────
const FINGER_GEOM = [[24, 46], [56, 58], [88, 64], [120, 58]] // x, height (pinky → index)
function Hand({ side, on }) {
  const ids = side === 'L' ? ['LP', 'LR', 'LM', 'LI'] : ['RP', 'RR', 'RM', 'RI']
  const op = id => (on.length && !on.includes(id) ? 0.38 : 1)
  return (
    <g transform={side === 'R' ? 'translate(360,0) scale(-1,1)' : undefined}>
      {FINGER_GEOM.map(([x, h], i) => (
        <rect key={ids[i]} x={x} y={76 - h} width="27" height={h + 24} rx="13" fill={FINGERS[ids[i]].color} opacity={op(ids[i])} stroke="#14162d" strokeWidth={on.includes(ids[i]) ? 4 : 2} />
      ))}
      <rect x="140" y="92" width="25" height="50" rx="12.5" transform="rotate(-42 152 117)" fill={FINGERS.TH.color} opacity={op('TH')} stroke="#14162d" strokeWidth={on.includes('TH') ? 4 : 2} />
      <rect x="18" y="72" width="132" height="70" rx="26" fill="#fde3cf" stroke="#14162d" strokeWidth="2" />
    </g>
  )
}
export function Hands({ layout, next }) {
  const k = next != null ? keyFor(layout, next) : null
  const active = k?.finger
  const shiftFinger = k?.shift ? (k.shiftCode === 'ShiftLeft' ? 'LP' : 'RP') : null
  const on = [active, shiftFinger].filter(Boolean)
  return (
    <div>
      <svg className="ty-hands" viewBox="0 0 360 150" role="img" aria-label={active ? 'האצבע להקשה: ' + FINGERS[active].name : 'ידיים על המקלדת'}>
        <Hand side="L" on={on} />
        <Hand side="R" on={on} />
      </svg>
      <p className="ty-next">{k ? <>אצבע: <b>{FINGERS[active].name}</b>{k.shift ? <> + Shift ב{FINGERS[shiftFinger].name}</> : null}</> : ' '}</p>
    </div>
  )
}

export function FingerLegend() {
  return <div className="ty-legend" aria-hidden="true">{['LP', 'LR', 'LM', 'LI', 'RI', 'RM', 'RR', 'RP'].map(f => <span key={f}><i style={{ background: FINGERS[f].color }} />{FINGERS[f].name}</span>)}</div>
}

export function PhoneNotice({ onFocus }) {
  return (
    <div className="ty-notice mb-4">
      <b>💻 הקלדה עיוורת לומדים על מקלדת של מחשב.</b> בטלפון אין מקשים שאפשר למשש, ולכן מומלץ לפתוח את הדף במחשב או לחבר מקלדת לטאבלט. אפשר בכל זאת לקרוא את ההסבר ולנסות עם המקלדת שעל המסך.
      {onFocus && <div className="mt-2"><button type="button" className="ty-chip" onClick={onFocus}>📱 לנסות עם מקלדת הטלפון</button></div>}
    </div>
  )
}

export function Stars({ n }) {
  return <div className="ty-stars" aria-label={`${n} כוכבים מתוך 3`}>{'⭐'.repeat(n)}<span style={{ opacity: 0.25 }}>{'⭐'.repeat(3 - n)}</span></div>
}
