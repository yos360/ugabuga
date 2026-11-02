// Small shared controls for the image tools.
import { useState } from 'react'
import { FORMATS } from './imageLogic'
import { downloadBlob, shareBlob, canShareFiles } from './imageIO'
import { select, useImages } from './imageStore'

export function Seg({ label, options, value, onChange, small }) {
  return (
    <div className="im-field">
      {label && <span className="im-label">{label}</span>}
      <div className={'im-seg' + (small ? ' small' : '')} role="radiogroup" aria-label={label}>
        {options.map(o => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className="im-chip" onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Range({ label, value, min, max, step = 1, onChange, show }) {
  return (
    <label className="im-field">
      <span className="im-label">{label} <b dir="ltr">{show ? show(value) : value}</b></span>
      <input type="range" className="im-range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
    </label>
  )
}

export function FormatPick({ value, onChange, allow = ['jpg', 'png', 'webp'], label = 'סוג קובץ' }) {
  return <Seg label={label} small value={value} onChange={onChange} options={allow.map(f => ({ value: f, label: FORMATS[f].label }))} />
}

// Which photo a single-photo tool works on.
export function PhotoPicker() {
  const { items, selected } = useImages()
  if (items.length < 2) return null
  return (
    <div className="im-pick" role="listbox" aria-label="בחירת תמונה לעריכה">
      {items.map(it => (
        <button key={it.id} type="button" role="option" aria-selected={it.id === selected} onClick={() => select(it.id)} title={it.name}>
          <img src={it.thumb} alt="" />
        </button>
      ))}
    </div>
  )
}

// The big download button (+ share on phones). make() → Promise<{ blob, name }>
export function DownloadBar({ make, label = 'הורדה', disabled, extra }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [share] = useState(canShareFiles)
  const run = async how => {
    setBusy(true); setErr('')
    try {
      const { blob, name } = await make()
      if (how === 'share') await shareBlob(blob, name)
      else downloadBlob(blob, name)
    } catch {
      setErr('משהו השתבש. נסו תמונה קטנה יותר או רעננו את הדף.')
    } finally { setBusy(false) }
  }
  return (
    <div className="im-dl">
      <button type="button" className="im-btn big" disabled={busy || disabled} onClick={() => run('download')}>
        {busy ? '⏳ מכינים…' : `⬇️ ${label}`}
      </button>
      {share && <button type="button" className="im-btn alt" disabled={busy || disabled} onClick={() => run('share')}>📤 שיתוף / שמירה בגלריה</button>}
      {extra}
      {err && <p className="im-err" role="alert">{err}</p>}
    </div>
  )
}

export function Empty({ children }) {
  return <p className="im-empty">{children}</p>
}
