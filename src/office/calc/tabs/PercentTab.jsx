// Quick percent calculations; the full percent calculator has its own page.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { percentOf, whatPercent, percentChange, readNum, fmt } from '../mathTools'

const ROWS = [
  { id: 'of', title: 'כמה זה X% מתוך Y?', labels: ['X (אחוז)', 'Y'], init: ['15', '80'], calc: percentOf, show: (x, y, r) => `${fmt(x)}% × ${fmt(y)} = ${fmt(r)}`, unit: '' },
  { id: 'what', title: 'X הוא כמה אחוזים מ־Y?', labels: ['X', 'Y'], init: ['18', '24'], calc: whatPercent, show: (x, y, r) => `${fmt(x)} ÷ ${fmt(y)} × 100 = ${fmt(r)}%`, unit: '%', err: 'Y לא יכול להיות 0' },
  { id: 'chg', title: 'בכמה אחוזים השתנה? מ־A ל־B', labels: ['A (לפני)', 'B (אחרי)'], init: ['80', '100'], calc: percentChange, show: (x, y, r) => `(${fmt(y)} − ${fmt(x)}) ÷ ${fmt(Math.abs(x))} × 100 = ${fmt(r)}%`, unit: '%', err: 'אי אפשר לחשב שינוי מ־0' },
]

function Row({ c, t }) {
  const [v, setV] = useState(c.init)
  const n = v.map(x => readNum(x))
  const ok = n.every(x => x !== null)
  const r = ok ? c.calc(n[0], n[1]) : null
  return <section className="sc-card">
    <h2 className="sc-h2">{t(c.title)}</h2>
    <div className="sc-coefs">{c.labels.map((lab, i) => <label key={lab} className="sc-coef"><span>{t(lab)}</span>
      <input className="sc-input" dir="ltr" inputMode="decimal" value={v[i]} onChange={e => setV(o => o.map((x, j) => (j === i ? e.target.value : x)))} /></label>)}</div>
    <div className="sc-out" aria-live="polite">
      {!ok ? <p>{t('הזינו מספרים.')}</p> : r === null ? <p className="sc-err">⚠ {t(c.err)}</p> : <>
        <p className="sc-answer"><bdi dir="ltr">{fmt(r)}{c.unit}</bdi>{c.id === 'chg' && <span className="sc-sub"> {t(r > 0 ? '— עלייה' : r < 0 ? '— ירידה' : '— בלי שינוי')}</span>}</p>
        <p className="sc-sub" dir="ltr">{c.show(n[0], n[1], r)}</p>
      </>}
    </div>
  </section>
}

const same = s => s
export default function PercentTab({ t = same, percentHref = '/tools/percent-calculator', percentLabel }) {
  return <div className="sc-panel sc-grid2">
    {ROWS.map(c => <Row key={c.id} c={c} t={t} />)}
    <section className="sc-card">{t === same ? <><h2 className="sc-h2">צריכים עוד?</h2><p>הנחות, מחיר לפני הנחה ומע״מ נמצאים ב<Link to={percentHref} className="underline font-bold">מחשבון האחוזים המלא</Link>. במחשבון הראשי אפשר גם לכתוב 200+10% ולקבל 220.</p></> : <><h2 className="sc-h2">{t('צריכים עוד?')}</h2><p>{t('במחשבון הראשי אפשר גם לכתוב 200+10% ולקבל 220.')}{percentLabel}</p></>}</section>
  </div>
}
