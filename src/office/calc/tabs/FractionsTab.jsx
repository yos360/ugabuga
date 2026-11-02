// Fractions & mixed numbers: a op b with steps, plus decimal → fraction.
import { useState } from 'react'
import { mixedToRat, fractionOp, ratText, ratValue, toRat, readNum, fmt } from '../mathTools'

function Frac({ r, big }) {
  const sg = r.n < 0 ? '−' : ''
  const n = Math.abs(r.n)
  if (r.d === 1) return <span className={big ? 'sc-bigfrac' : ''} dir="ltr">{sg}{n}</span>
  const w = Math.floor(n / r.d)
  return <span className={`mv ${big ? 'sc-bigfrac' : ''}`} dir="ltr">{sg}{w > 0 ? w : ''}<span className="mv-frac"><span className="mv-fnum">{w > 0 ? n % r.d : n}</span><span className="mv-fden">{r.d}</span></span></span>
}

function MixedInput({ value, onChange, label }) {
  const set = k => e => onChange({ ...value, [k]: e.target.value.replace(/[^\d-]/g, '') })
  return <fieldset className="sc-mixed" dir="ltr">
    <legend className="sc-label" dir="rtl">{label}</legend>
    <input className="sc-input sc-whole" inputMode="numeric" aria-label={`${label} — שלם`} placeholder="שלם" value={value.w} onChange={set('w')} />
    <span className="sc-stack">
      <input className="sc-input" inputMode="numeric" aria-label={`${label} — מונה`} placeholder="מונה" value={value.n} onChange={set('n')} />
      <span className="sc-bar" />
      <input className="sc-input" inputMode="numeric" aria-label={`${label} — מכנה`} placeholder="מכנה" value={value.d} onChange={set('d')} />
    </span>
  </fieldset>
}

export default function FractionsTab() {
  const [a, setA] = useState({ w: '1', n: '1', d: '2' })
  const [b, setB] = useState({ w: '', n: '3', d: '4' })
  const [op, setOp] = useState('+')
  const [dec, setDec] = useState('0.375')
  const ra = mixedToRat(a.w, a.n, a.d); const rb = mixedToRat(b.w, b.n, b.d)
  const res = ra && rb ? fractionOp(ra, rb, op) : null
  const dv = readNum(dec)
  const dr = dv === null ? null : toRat(dv, 1000000)

  return <div className="sc-panel">
    <section className="sc-card">
      <h2 className="sc-h2">חישוב עם שברים ומספרים מעורבים</h2>
      <div className="sc-frac-row" dir="ltr">
        <MixedInput value={a} onChange={setA} label="שבר ראשון" />
        <div className="sc-ops" role="radiogroup" aria-label="פעולה">{['+', '−', '×', '÷'].map(o => <button key={o} type="button" role="radio" aria-checked={op === o} className="sc-opbtn" onClick={() => setOp(o)}>{o}</button>)}</div>
        <MixedInput value={b} onChange={setB} label="שבר שני" />
      </div>
      <div className="sc-out" aria-live="polite">
        {!ra || !rb ? <p>הזינו מספרים שלמים בכל שדה. מכנה לא יכול להיות 0.</p>
          : res.error ? <p className="sc-err">⚠ {res.error}</p>
            : <>
              <p className="sc-answer" dir="ltr"><Frac r={ra} /> {op} <Frac r={rb} /> = <Frac r={res.result} big /></p>
              <p className="sc-sub">שבר: <b dir="ltr">{ratText(res.result)}</b>{Math.abs(res.result.n) > res.result.d && res.result.d > 1 && <> · מעורב: <b dir="ltr">{ratText(res.result, true)}</b></>} · עשרוני: <b dir="ltr">{fmt(ratValue(res.result))}</b></p>
              <ol className="sc-steplist">{res.steps.map((s, i) => <li key={i} dir="auto">{s}</li>)}</ol>
            </>}
      </div>
    </section>

    <section className="sc-card">
      <h2 className="sc-h2">ממספר עשרוני לשבר</h2>
      <label className="sc-label" htmlFor="sc-dec">מספר עשרוני (אפשר גם תרגיל, כמו 5/8)</label>
      <input id="sc-dec" className="sc-input sc-wide" dir="ltr" inputMode="decimal" value={dec} onChange={e => setDec(e.target.value)} />
      <div className="sc-out" aria-live="polite">
        {dv === null ? <p>הזינו מספר.</p> : dr ? <p className="sc-answer" dir="ltr">{fmt(dv)} = <Frac r={dr} big />{Math.abs(dr.n) > dr.d && dr.d > 1 ? <span className="sc-sub"> ({ratText(dr)})</span> : null}</p> : <p>למספר הזה אין שבר פשוט עם מכנה עד מיליון (אולי זה מספר אי־רציונלי כמו √2).</p>}
      </div>
    </section>
  </div>
}
