// Basic unit conversions: one value → every unit of the category.
import { useState } from 'react'
import { UNITS, convertUnit, radAsPi, toDMS, readNum, fmt } from '../mathTools'

const same = s => s
export default function UnitsTab({ t = same }) {
  const [cat, setCat] = useState('angle')
  const [from, setFrom] = useState('deg')
  const [val, setVal] = useState('30')
  const units = UNITS[cat].units
  const v = readNum(val)
  const pick = c => { setCat(c); setFrom({ angle: 'deg', length: 'm', mass: 'kg', time: 'h', area: 'm2', temp: 'c' }[c]) }

  return <div className="sc-panel">
    <section className="sc-card">
      <h2 className="sc-h2">{t('המרת יחידות')}</h2>
      <div className="sc-seg sc-seg-wrap" role="radiogroup" aria-label={t('סוג היחידות')}>
        {Object.entries(UNITS).map(([id, u]) => <button key={id} type="button" role="radio" aria-checked={cat === id} className="sc-segbtn" onClick={() => pick(id)}><b>{t(u.label)}</b></button>)}
      </div>
      <div className="sc-coefs">
        <label className="sc-coef"><span>{t('ערך')}</span><input className="sc-input" dir="ltr" inputMode="decimal" value={val} onChange={e => setVal(e.target.value)} /></label>
        <label className="sc-coef"><span>{t('ביחידות')}</span><select className="sc-input" value={from} onChange={e => setFrom(e.target.value)}>{Object.entries(units).map(([id, [l]]) => <option key={id} value={id}>{t(l)}</option>)}</select></label>
      </div>
      <div className="sc-out" aria-live="polite">
        {v === null ? <p>{t('הזינו מספר (אפשר גם π/6).')}</p> : <ul className="sc-conv">
          {Object.entries(units).filter(([id]) => id !== from).map(([id, [l]]) => {
            const r = convertUnit(cat, v, from, id)
            const pi = cat === 'angle' && id === 'rad' ? radAsPi(r) : null
            return <li key={id}><span>{t(l)}</span><b dir="ltr">{pi && pi !== fmt(r) ? `${pi} ≈ ${fmt(r)}` : fmt(r)}</b>{cat === 'angle' && id === 'deg' && !Number.isInteger(r) ? <small dir="ltr"> ({toDMS(r)})</small> : null}</li>
          })}
          {cat === 'angle' && from === 'deg' && !Number.isInteger(v) && <li><span>{t('מעלות־דקות־שניות')}</span><b dir="ltr">{toDMS(v)}</b></li>}
        </ul>}
      </div>
      {cat === 'angle' && <p className="sc-sub">{t('כדי להמיר ממעלות לרדיאנים כופלים ב־π/180. כך 180° = π, 90° = π/2 ו־30° = π/6.')}</p>}
    </section>
  </div>
}
