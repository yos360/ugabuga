// Equation solver: linear, quadratic (discriminant, exact roots, vertex), 2×2 system.
import { useState } from 'react'
import { solveLinear, solveQuadratic, solve2x2, readNum, fmt } from '../mathTools'

const KINDS = [
  { id: 'quad', label: 'ריבועית', eq: 'ax² + bx + c = 0' },
  { id: 'lin', label: 'ממעלה ראשונה', eq: 'ax + b = c' },
  { id: 'sys', label: 'מערכת 2×2', eq: 'ax + by = c' },
]

function Coef({ name, value, onChange, t }) {
  const bad = value.trim() !== '' && readNum(value) === null
  return <label className="sc-coef" dir="ltr">
    <span>{name} =</span>
    <input className={`sc-input${bad ? ' sc-input-bad' : ''}`} inputMode="decimal" value={value} onChange={e => onChange(e.target.value)} aria-label={t(`מקדם ${name}`)} aria-invalid={bad} />
  </label>
}

const Steps = ({ steps, t }) => steps?.length ? <ol className="sc-steplist">{steps.map((s, i) => <li key={i} dir="auto">{t(s)}</li>)}</ol> : null
const term = (v, x, first) => {
  if (v === 0) return ''
  const sg = v < 0 ? (first ? '−' : ' − ') : first ? '' : ' + '
  const a = Math.abs(v)
  return `${sg}${a === 1 && x ? '' : fmt(a)}${x}`
}

const same = s => s
export default function SolverTab({ openGraph, t = same }) {
  const [kind, setKind] = useState('quad')
  const [q, setQ] = useState({ a: '1', b: '-5', c: '6' })
  const [l, setL] = useState({ a: '2', b: '3', c: '11' })
  const [s, setS] = useState({ a1: '1', b1: '1', c1: '10', a2: '1', b2: '-1', c2: '2' })
  const num = (o, k) => readNum(o[k], 0)
  const field = (o, set) => k => <Coef key={k} name={k} value={o[k]} onChange={v => set(p => ({ ...p, [k]: v }))} t={t} />

  let body = null
  if (kind === 'quad') {
    const [a, b, c] = ['a', 'b', 'c'].map(k => num(q, k))
    const ok = [a, b, c].every(v => v !== null)
    const r = ok ? solveQuadratic(a, b, c) : null
    const eqText = ok ? `${term(a, 'x²', true) || '0'}${term(b, 'x', !a)}${term(c, '', !a && !b)} = 0` : ''
    body = <>
      <div className="sc-coefs">{['a', 'b', 'c'].map(field(q, setQ))}</div>
      <div className="sc-out" aria-live="polite">
        {!r ? <p>{t('הזינו מספרים (אפשר גם 1/2 או √2).')}</p> : <>
          <p className="sc-eqline" dir="ltr">{eqText}</p>
          {r.linear && <p>{t('כש־a = 0 זו משוואה ממעלה ראשונה.')}</p>}
          {r.kind === 'two' && <p className="sc-answer" dir="ltr">x₁ = {r.exact[0]} &nbsp;·&nbsp; x₂ = {r.exact[1]}</p>}
          {r.kind === 'two' && r.exact.some((e, i) => e !== fmt(r.roots[i])) && <p className="sc-sub" dir="ltr">x₁ ≈ {fmt(r.roots[0])} · x₂ ≈ {fmt(r.roots[1])}</p>}
          {r.kind === 'one' && <p className="sc-answer" dir="ltr">x = {r.exact[0]}</p>}
          {r.kind === 'none' && <p className="sc-answer">{t('אין פתרון ממשי')}</p>}
          {r.kind === 'all' && <p className="sc-answer">{t('כל x הוא פתרון')}</p>}
          {r.D !== undefined && <p className="sc-sub">{t('דיסקרימיננטה:')} <b dir="ltr">Δ = {fmt(r.D)}</b> — {t(r.D > 0 ? 'שני פתרונות' : r.D === 0 ? 'פתרון אחד' : 'אין פתרון')}</p>}
          {r.vertex && <p className="sc-sub">{t('קודקוד הפרבולה:')} <b dir="ltr">({fmt(r.vertex[0])}, {fmt(r.vertex[1])})</b> · {t(a > 0 ? 'פרבולה „מחייכת” (מינימום)' : 'פרבולה „עצובה” (מקסימום)')}</p>}
          <Steps steps={r.steps} t={t} />
          {a !== 0 && openGraph && <button type="button" className="sc-pill" onClick={() => openGraph(`${q.a || 0}x²+(${q.b || 0})x+(${q.c || 0})`)}>{t('📈 לראות את הפרבולה בגרף')}</button>}
        </>}
      </div>
    </>
  } else if (kind === 'lin') {
    const [a, b, c] = ['a', 'b', 'c'].map(k => num(l, k))
    const ok = [a, b, c].every(v => v !== null)
    const r = ok ? solveLinear(a, b, c) : null
    body = <>
      <div className="sc-coefs">{['a', 'b', 'c'].map(field(l, setL))}</div>
      <div className="sc-out" aria-live="polite">
        {!r ? <p>{t('הזינו מספרים.')}</p> : <>
          <p className="sc-eqline" dir="ltr">{term(a, 'x', true) || '0'}{term(b, '', !a)} = {fmt(c)}</p>
          {r.kind === 'one' && <p className="sc-answer" dir="ltr">x = {r.exact[0]}</p>}
          {r.kind === 'none' && <p className="sc-answer">{t('אין פתרון')}</p>}
          {r.kind === 'all' && <p className="sc-answer">{t('כל x הוא פתרון')}</p>}
          <Steps steps={r.steps} t={t} />
        </>}
      </div>
    </>
  } else {
    const ks = ['a1', 'b1', 'c1', 'a2', 'b2', 'c2']
    const v = ks.map(k => num(s, k))
    const ok = v.every(x => x !== null)
    const r = ok ? solve2x2(...v) : null
    body = <>
      <div className="sc-sys" dir="ltr">
        <div className="sc-coefs">{['a1', 'b1', 'c1'].map(field(s, setS))}</div>
        <div className="sc-coefs">{['a2', 'b2', 'c2'].map(field(s, setS))}</div>
      </div>
      <div className="sc-out" aria-live="polite">
        {!r ? <p>{t('הזינו מספרים.')}</p> : <>
          <p className="sc-eqline" dir="ltr">{term(v[0], 'x', true) || '0'}{term(v[1], 'y', !v[0])} = {fmt(v[2])}<br />{term(v[3], 'x', true) || '0'}{term(v[4], 'y', !v[3])} = {fmt(v[5])}</p>
          {r.kind === 'one' && <p className="sc-answer" dir="ltr">x = {r.exact[0]} &nbsp;·&nbsp; y = {r.exact[1]}</p>}
          {r.kind === 'none' && <p className="sc-answer">{t('אין פתרון — הישרים מקבילים')}</p>}
          {r.kind === 'all' && <p className="sc-answer">{t('אינסוף פתרונות — זו אותה משוואה')}</p>}
          <Steps steps={r.steps} t={t} />
        </>}
      </div>
    </>
  }

  return <div className="sc-panel">
    <section className="sc-card">
      <h2 className="sc-h2">{t('פתרון משוואות')}</h2>
      <div className="sc-seg" role="radiogroup" aria-label={t('סוג המשוואה')}>
        {KINDS.map(k => <button key={k.id} type="button" role="radio" aria-checked={kind === k.id} className="sc-segbtn" onClick={() => setKind(k.id)}><b>{t(k.label)}</b><span dir="ltr">{k.eq}</span></button>)}
      </div>
      {body}
    </section>
  </div>
}
