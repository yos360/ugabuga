import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import { LEVELS, KINDS, FAQ, MISTAKES, TEACH_STEPS, MORE_LINKS, buildSet, checkAnswer, explain, toImproper, toMixed, mixedText } from '../data/mixedNumbers'
import '../learn/learn.css'
import './math.css'

// /math/mixed-numbers — mixed numbers and improper fractions for grades 4–5: explanation with pizza
// drawings, a two-way converter, on-screen practice in three levels and a printable sheet with answers.
const PATH = '/math/mixed-numbers'
const FILL = '#f59e0b', FILL_LAST = '#60a5fa'

// Fractions and mixed numbers are written left to right, with a stacked fraction like in textbooks.
function Frac({ n, d, size = '1em' }) {
  return <span className="inline-flex flex-col items-center align-middle font-black leading-none" style={{ fontSize: size, margin: '0 .1em' }}>
    <span>{n}</span><span aria-hidden="true" style={{ borderTop: '2px solid currentColor', width: '100%', margin: '2px 0' }} /><span>{d}</span>
  </span>
}
function Mixed({ w, r, d, size }) {
  return <bdi dir="ltr" className="inline-flex items-center gap-1 whitespace-nowrap" aria-label={mixedText(w, r, d)}>
    {(w > 0 || r === 0) && <span className="font-black" style={{ fontSize: size ? `calc(${size} * 1.25)` : '1.25em' }}>{w}</span>}
    {r > 0 && <Frac n={r} d={d} size={size} />}
  </bdi>
}
const Imp = ({ n, d, size }) => <bdi dir="ltr" aria-label={`${n}/${d}`}><Frac n={n} d={d} size={size} /></bdi>

// One pizza cut into d slices, `filled` of them coloured, starting at the top and going clockwise.
function Pizza({ d, filled, color = FILL, px = 64 }) {
  const R = 46, c = 50
  const pt = a => [c + R * Math.sin(a), c - R * Math.cos(a)]
  return <svg viewBox="0 0 100 100" style={{ width: px, height: px }} aria-hidden="true">
    <circle cx={c} cy={c} r={R} fill="#fff" stroke="#1f2937" strokeWidth="2.5" />
    {d === 1 ? (filled ? <circle cx={c} cy={c} r={R} fill={color} stroke="#1f2937" strokeWidth="2.5" /> : null)
      : Array.from({ length: d }, (_, i) => {
        const a0 = (2 * Math.PI * i) / d, a1 = (2 * Math.PI * (i + 1)) / d
        const [x0, y0] = pt(a0), [x1, y1] = pt(a1)
        return <path key={i} d={`M${c},${c} L${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`}
          fill={i < filled ? color : '#fff'} stroke="#1f2937" strokeWidth="2" strokeLinejoin="round" />
      })}
  </svg>
}
// w whole pizzas and one more with r of d slices. Drawn left to right, like the number.
function Pizzas({ w, r, d, px = 64, max = 6 }) {
  const shown = Math.min(w, max)
  return <div dir="ltr" className="inline-flex flex-wrap items-center justify-center gap-1" role="img" aria-label={`${w} שלמים ועוד ${r} חלקים מתוך ${d}`}>
    {Array.from({ length: shown }, (_, i) => <Pizza key={i} d={d} filled={d} px={px} />)}
    {w > max && <span className="px-1 font-black">…×{w}</span>}
    {r > 0 && <Pizza d={d} filled={r} color={FILL_LAST} px={px} />}
  </div>
}

function NumSelect({ label, value, set, from, to }) {
  return <label className="flex items-center gap-1 font-bold">{label}
    <select value={value} onChange={e => set(+e.target.value)} className="rounded-lg border-2 border-[var(--border)] bg-white px-2 py-1 text-lg">
      {Array.from({ length: to - from + 1 }, (_, i) => from + i).map(v => <option key={v} value={v}>{v}</option>)}
    </select>
  </label>
}

function Converter() {
  const [w, setW] = useState(2), [r, setR] = useState(3), [d, setD] = useState(4)
  const imp = toImproper(w, r, d), back = toMixed(imp.n, d)
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      <NumSelect label="שלמים" value={w} set={setW} from={0} to={9} />
      <NumSelect label="מונה" value={r} set={setR} from={0} to={d - 1} />
      <NumSelect label="מכנה" value={d} set={v => { setD(v); if (r > v - 1) setR(v - 1) }} from={2} to={12} />
    </div>
    <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center"><Pizzas w={w} r={r} d={d} px={w > 4 ? 52 : 70} max={9} /></div>
    <p className="text-center text-2xl" aria-live="polite"><Mixed w={w} r={r} d={d} /> <span className="mx-2">=</span> <Imp n={imp.n} d={d} /></p>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-amber-50 p-3"><b>מספר מעורב ← שבר מדומה</b>
        <p className="mt-1">{w} שלמים × {d} חלקים בכל שלם = <b>{w * d}</b> חלקים.</p>
        <p>{w * d} + {r} = <b>{imp.n}</b>, והמכנה נשאר {d}: <Imp n={imp.n} d={d} /></p>
      </div>
      <div className="rounded-xl bg-sky-50 p-3"><b>שבר מדומה ← מספר מעורב (בדיקה)</b>
        <p className="mt-1"><bdi dir="ltr">{imp.n} ÷ {d}</bdi> = <b>{back.w}</b> ושארית <b>{back.r}</b>.</p>
        <p>המנה היא השלמים והשארית היא המונה: <Mixed w={back.w} r={back.r} d={d} /></p>
      </div>
    </div>
    {imp.n < d && <p className="text-sm text-[var(--muted-foreground)]">כשאין שלמים, השבר קטן מ־1 — זה שבר רגיל ולא שבר מדומה.</p>}
  </div>
}

const inputCls = 'w-16 rounded-lg border-2 border-[var(--border)] bg-white px-1 py-1 text-center text-2xl font-black'

function Practice() {
  const [levelId, setLevelId] = useState('easy')
  const [seed, setSeed] = useState(() => Date.now())
  const qs = useMemo(() => buildSet(seed, levelId, 10), [seed, levelId])
  const [i, setI] = useState(0)
  const [input, setInput] = useState({})
  const [res, setRes] = useState(null)
  const [score, setScore] = useState(0)
  const done = i >= qs.length, q = qs[Math.min(i, qs.length - 1)]
  const restart = (lv = levelId) => { setLevelId(lv); setSeed(Date.now()); setI(0); setInput({}); setRes(null); setScore(0) }
  const check = () => { if (res) return; const ok = checkAnswer(q, input); setRes(ok ? 'ok' : 'bad'); if (ok) setScore(s => s + 1) }
  const next = () => { setI(x => x + 1); setInput({}); setRes(null) }
  const set = k => e => setInput(p => ({ ...p, [k]: e.target.value.replace(/[^0-9]/g, '').slice(0, 3) }))
  const onKey = e => { if (e.key === 'Enter') { if (res) next(); else check() } }
  return <div>
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="רמת קושי">
      {LEVELS.map(l => <button key={l.id} type="button" onClick={() => restart(l.id)} aria-pressed={l.id === levelId}
        className={`rounded-xl border-2 px-3 py-2 font-bold ${l.id === levelId ? 'border-blue-700 bg-blue-700 text-white' : 'border-[var(--border)] bg-white'}`}>{l.label} <small className="font-normal">({l.note})</small></button>)}
    </div>
    {done ? <div className="mt-5 rounded-2xl bg-green-50 p-5 text-center" aria-live="polite">
      <p className="text-3xl font-black">{score === 10 ? '🏆' : score >= 7 ? '🎉' : '💪'} {score} מתוך 10</p>
      <p className="mt-2">{score === 10 ? 'מושלם! אפשר לעלות רמה.' : score >= 7 ? 'יפה מאוד! עוד סבב אחד וזה בכיס.' : 'כדאי לחזור להסבר עם הפיצות ולנסות שוב.'}</p>
      <button type="button" onClick={() => restart()} className="ln-btn go mt-4">🔄 עוד 10 תרגילים</button>
    </div> : <div className="mt-5">
      <p className="text-sm text-[var(--muted-foreground)]">תרגיל {i + 1} מתוך 10 · נכונות: {score}</p>
      <p className="mt-1 text-xl font-black">{KINDS[q.kind]}</p>
      <div className="mt-3 flex flex-col items-center gap-3 text-3xl">
        {q.kind === 'picture' && <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-2"><Pizzas w={q.w} r={q.r} d={q.d} px={72} /></div>}
        <div dir="ltr" className="flex items-center gap-2" onKeyDown={onKey}>
          {q.kind === 'toImproper' && <><Mixed w={q.w} r={q.r} d={q.d} /><span>=</span>
            <span className="inline-flex flex-col items-center"><input aria-label="מונה" inputMode="numeric" value={input.n || ''} onChange={set('n')} className={inputCls} disabled={!!res} /><span className="my-1 block h-0.5 w-full bg-current" /><span className="font-black">{q.d}</span></span></>}
          {q.kind === 'toMixed' && <><Imp n={q.n} d={q.d} /><span>=</span></>}
          {q.kind !== 'toImproper' && <>
            <input aria-label="שלמים" inputMode="numeric" value={input.w || ''} onChange={set('w')} className={inputCls} disabled={!!res} />
            <span className="inline-flex flex-col items-center"><input aria-label="מונה (אם אין שארית — השאירו ריק)" inputMode="numeric" value={input.r || ''} onChange={set('r')} className={inputCls} disabled={!!res} /><span className="my-1 block h-0.5 w-full bg-current" /><span className="font-black">{q.d}</span></span>
          </>}
        </div>
        {q.kind !== 'toImproper' && <p className="text-sm text-[var(--muted-foreground)]">אם התשובה היא מספר שלם — השאירו את המונה ריק.</p>}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {!res ? <button type="button" onClick={check} className="ln-btn go">✔️ בדיקה</button>
          : <button type="button" onClick={next} className="ln-btn go">{i === 9 ? 'לתוצאה ←' : 'לתרגיל הבא ←'}</button>}
      </div>
      <div aria-live="polite" className="mt-3">
        {res && <div className={`rounded-xl p-3 ${res === 'ok' ? 'bg-green-50' : 'bg-amber-50'}`}>
          <p className="font-bold">{res === 'ok' ? '✔️ נכון!' : <>התשובה: {q.kind === 'toImproper' ? <Imp n={q.n} d={q.d} /> : <Mixed w={q.w} r={q.r} d={q.d} />}</>}</p>
          <p className="mt-1">{explain(q)}</p>
          {q.kind !== 'picture' && res !== 'ok' && <div className="mt-2"><Pizzas w={q.w} r={q.r} d={q.d} px={44} /></div>}
        </div>}
      </div>
    </div>}
  </div>
}

function PrintSheets({ seed, levelId }) {
  const qs = buildSet(seed, levelId, 15)
  const by = k => qs.filter(q => q.kind === k)
  const level = LEVELS.find(l => l.id === levelId)
  const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
  const box = { border: '1px solid #ddd', borderRadius: 8, padding: '2.5mm', textAlign: 'center' }
  const line = <span style={{ display: 'inline-block', width: '14mm', borderBottom: '1.5px solid #333' }}>&nbsp;</span>
  const sectionH = { fontSize: 16, margin: '10px 0 4px', width: '100%' }
  let k = 0
  return <>
    <article className="buga-a4" style={page}>
      <h2>🍕 מספר מעורב ושבר מדומה</h2>
      <p style={{ fontSize: 13, margin: '0 0 4px', textAlign: 'center' }}>שם: ____________ · רמה: {level.label.replace(/^\S+\s/, '')} · זכרו: שלמים × מכנה + מונה, והמכנה לא משתנה.</p>
      <h3 style={sectionH}>א. כתבו כשבר מדומה</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3mm', width: '100%', fontSize: 20 }}>
        {by('toImproper').map(q => <div key={q.key} style={box}><div style={{ fontSize: 12, textAlign: 'right' }}>{++k}.</div><Mixed w={q.w} r={q.r} d={q.d} /> = <bdi dir="ltr"><span className="inline-flex flex-col items-center align-middle">{line}<span>{q.d}</span></span></bdi></div>)}
      </div>
      <h3 style={sectionH}>ב. כתבו כמספר מעורב (או כמספר שלם)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3mm', width: '100%', fontSize: 20 }}>
        {by('toMixed').map(q => <div key={q.key} style={box}><div style={{ fontSize: 12, textAlign: 'right' }}>{++k}.</div><Imp n={q.n} d={q.d} /> = ______</div>)}
      </div>
      <h3 style={sectionH}>ג. איזה מספר מעורב מצויר? כתבו גם כשבר מדומה</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3mm', width: '100%', fontSize: 15 }}>
        {by('picture').map(q => <div key={q.key} style={box}><div style={{ fontSize: 12, textAlign: 'right' }}>{++k}.</div><Pizzas w={q.w} r={q.r} d={q.d} px="17mm" /><div style={{ marginTop: 4 }}>מספר מעורב: ________ · שבר מדומה: ________</div></div>)}
      </div>
      <footer>ugabuga.co.il/math/mixed-numbers · מספר מעורב ושבר מדומה לכיתות ד׳–ה׳</footer>
    </article>
    <article className="buga-a4" style={page}>
      <h2>✅ תשובות</h2>
      <ol style={{ fontSize: 16, lineHeight: 1.9, columns: 2, width: '100%', paddingInlineStart: 24 }}>
        {[...by('toImproper'), ...by('toMixed'), ...by('picture')].map(q => <li key={q.key}>
          <bdi dir="ltr">{q.kind === 'toMixed' ? `${q.n}/${q.d} = ${mixedText(q.w, q.r, q.d)}` : `${mixedText(q.w, q.r, q.d)} = ${q.n}/${q.d}`}</bdi>
          {q.kind === 'toMixed' && <small style={{ color: '#555' }}> · <bdi dir="ltr">{q.n} ÷ {q.d} = {q.w}</bdi>{q.r ? ` ושארית ${q.r}` : ''}</small>}
          {q.kind === 'toImproper' && <small style={{ color: '#555' }}> <bdi dir="ltr">({q.w}×{q.d}+{q.r})</bdi></small>}
        </li>)}
      </ol>
      <footer>ugabuga.co.il/math/mixed-numbers · דף תשובות</footer>
    </article>
  </>
}

export default function MixedNumbersGuide() {
  const [print, setPrint] = useState(false)
  const [printSeed, setPrintSeed] = useState(1)
  const [printLevel, setPrintLevel] = useState('easy')
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מספר מעורב ושבר מדומה — הסבר, תרגול ודף עבודה לכיתות ד׳–ה׳"
      description="איך הופכים מספר מעורב לשבר מדומה ושבר מדומה למספר מעורב: הסבר עם ציורי פיצות, ממיר הלוך וחזור, תרגול על המסך בשלוש רמות ודף עבודה להדפסה עם תשובות — חינם."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מתמטיקה', href: '/math' }, { label: 'שברים', href: '/math/fractions' }, { label: 'מספר מעורב ושבר מדומה' }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">🍕</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">מספר מעורב ושבר מדומה לכיתות ד׳–ה׳</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">הסבר עם פיצות, המרה הלוך וחזור צעד אחר צעד, תרגול על המסך עם בדיקה מיידית ודף עבודה להדפסה עם תשובות.</p>
    </header>
    <div className="mt-5 flex flex-wrap justify-center gap-2">
      <a href="#practice" className="ln-btn go">✏️ לתרגול</a>
      <a href="#convert" className="ln-btn alt">🔁 ממיר</a>
      <button type="button" onClick={() => setPrint(true)} className="ln-btn alt">🖨️ דף עבודה להדפסה</button>
    </div>

    <section className="ln-box mt-8" aria-labelledby="what-h">
      <h2 id="what-h" className="text-2xl font-black">מה זה מספר מעורב ומה זה שבר מדומה?</h2>
      <p className="mt-2 leading-relaxed">יש לנו שתי פיצות שלמות ועוד שלושה רבעים של פיצה. אפשר לכתוב את הכמות הזאת בשתי דרכים:</p>
      <div className="mt-3 rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center"><Pizzas w={2} r={3} d={4} px={80} /></div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-amber-50 p-3"><p className="text-center text-3xl"><Mixed w={2} r={3} d={4} /></p><p className="mt-2"><b>מספר מעורב</b>: מספר שלם ושבר יחד. קוראים "שתיים ושלושה רבעים". כך סופרים פיצות: שתיים שלמות, ועוד חלק.</p></div>
        <div className="rounded-xl bg-sky-50 p-3"><p className="text-center text-3xl"><Imp n={11} d={4} /></p><p className="mt-2"><b>שבר מדומה</b>: שבר שהמונה שלו גדול מהמכנה או שווה לו. סופרים את כל המשולשים: 4 + 4 + 3 = 11 רבעים.</p></div>
      </div>
      <p className="mt-3 leading-relaxed">שני הכתיבים הם <b>אותו מספר בדיוק</b>. מספר מעורב נוח לדמיין כמה זה, ושבר מדומה נוח לחשב איתו (בכפל ובחילוק שברים, למשל). לכן צריך לדעת לעבור ביניהם בשני הכיוונים.</p>
    </section>

    <section className="mt-10" aria-labelledby="how-h">
      <h2 id="how-h" className="text-3xl font-black">איך ממירים? שני כללים קצרים</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <h3 className="text-xl font-black">1. ממספר מעורב לשבר מדומה</h3>
          <p className="mt-2 font-bold">כופלים את השלמים במכנה, ומוסיפים את המונה. המכנה נשאר.</p>
          <p className="mt-3 text-center text-2xl"><Mixed w={3} r={2} d={5} /> = <bdi dir="ltr" className="text-xl">(3 × 5 + 2)/5</bdi> = <Imp n={17} d={5} /></p>
          <p className="mt-2 text-sm">למה? כל שלם הוא 5 חמישיות, אז 3 שלמים הם 15 חמישיות. ועוד 2 חמישיות — 17 חמישיות.</p>
        </div>
        <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <h3 className="text-xl font-black">2. משבר מדומה למספר מעורב</h3>
          <p className="mt-2 font-bold">מחלקים את המונה במכנה: המנה היא השלמים, השארית היא המונה.</p>
          <p className="mt-3 text-center text-2xl"><Imp n={17} d={5} /> ← <bdi dir="ltr" className="text-xl">17 ÷ 5 = 3 (2)</bdi> ← <Mixed w={3} r={2} d={5} /></p>
          <p className="mt-2 text-sm">ואם אין שארית, יצא מספר שלם: <bdi dir="ltr">12/4 = 3</bdi>.</p>
        </div>
      </div>
    </section>

    <section id="convert" className="ln-box mt-10 scroll-mt-24" aria-labelledby="conv-h">
      <h2 id="conv-h" className="mb-3 text-2xl font-black">🔁 ממיר: בוחרים מספר מעורב ורואים הכול</h2>
      <Converter />
    </section>

    <section id="practice" className="mt-10 scroll-mt-24" aria-labelledby="prac-h">
      <h2 id="prac-h" className="text-3xl font-black">✏️ תרגול: 10 תרגילים עם בדיקה</h2>
      <p className="mb-4 mt-2 leading-relaxed">שלושה סוגי תרגילים לסירוגין: המרה לשבר מדומה, המרה למספר מעורב, וזיהוי מספר מעורב מציור. אחרי כל תשובה מופיע הסבר.</p>
      <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><Practice /></div>
    </section>

    <section className="mt-10" aria-labelledby="teach-h">
      <h2 id="teach-h" className="text-3xl font-black">💡 איך מלמדים את זה</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {TEACH_STEPS.map(t => <li key={t.title} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><b className="text-lg"><span aria-hidden="true">{t.emoji} </span>{t.title}</b><p className="mt-1 leading-relaxed">{t.text}</p></li>)}
      </ul>
      <h3 className="mt-6 text-2xl font-black">⚠️ הטעויות הנפוצות</h3>
      <ul className="mt-3 grid gap-3">
        {MISTAKES.map(m => <li key={m.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4"><b>{m.title}.</b> {m.text}</li>)}
      </ul>
    </section>

    <section className="ln-box mt-10" aria-labelledby="print-h">
      <h2 id="print-h" className="text-2xl font-black">🖨️ דף עבודה: מספר מעורב ושבר מדומה</h2>
      <p className="mt-2 leading-relaxed">15 תרגילים בשלושה חלקים — המרה לשבר מדומה, המרה למספר מעורב, וזיהוי מציורי פיצות — ודף תשובות נפרד. בוחרים רמה, ו"סט אחר" מייצר תרגילים חדשים.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="רמת דף העבודה">
        {LEVELS.map(l => <button key={l.id} type="button" onClick={() => setPrintLevel(l.id)} aria-pressed={l.id === printLevel} className="ln-chip">{l.label}</button>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPrint(true)} className="ln-btn go">🖨️ לתצוגה ולהדפסה</button>
        <button type="button" onClick={() => setPrintSeed(x => x + 1)} className="ln-btn alt">🔄 סט אחר (סט {printSeed})</button>
      </div>
    </section>

    <section className="ln-box mt-8" aria-labelledby="more-h">
      <h2 id="more-h" className="text-2xl font-black">📚 עוד בשברים</h2>
      <div className="mt-3 flex flex-wrap gap-2">{MORE_LINKS.map(l => <Link key={l.href} to={l.href} className="ln-chip">{l.label}</Link>)}</div>
    </section>

    {print && <PrintPreview title="מספר מעורב ושבר מדומה — דף עבודה" onClose={() => setPrint(false)}><PrintSheets seed={printSeed} levelId={printLevel} /></PrintPreview>}

    <div className="mt-10"><SeoBody paragraphs={[
      'מספר מעורב ושבר מדומה הם שתי דרכים לכתוב כמות שגדולה משלם אחד. ילדים פוגשים אותם לראשונה בכיתה ד׳, כשתוצאה של חיבור שברים יוצאת גדולה מ־1, ובכיתה ה׳ ההמרה הלוך וחזור הופכת לכלי עבודה יומיומי: בחיבור ובחיסור של מספרים מעורבים, בפריטת שלם בחיסור, ובכפל שבר במספר שלם.',
      'הדף בנוי כך שהילד קודם רואה ואחר כך מחשב. ציורי הפיצות מראים למה 2 3/4 הם 11 רבעים, הממיר מציג את שני הכיוונים יחד עם הבדיקה ההפוכה, והתרגול על המסך מחליף בין שלושה סוגי שאלות כדי שהילד לא יפעיל כלל אחד באופן אוטומטי. אחרי כל תשובה מופיע הסבר, ובטעות גם ציור של התשובה הנכונה.',
      'דף העבודה להדפסה נבנה מחדש בכל לחיצה על "סט אחר", בשלוש רמות קושי, ותמיד יחד עם דף תשובות שמראה גם את החישוב. הוא מתאים לשיעורי בית, לתרגול לפני מבחן ולעבודה עצמית בכיתה.',
    ]} faq={FAQ} related={[{ label: 'שברים לכיתות ד׳–ה׳', href: '/math/fractions' }, { label: 'דפי עבודה בשברים', href: '/printables/fractions-worksheets' }, { label: 'מחשבון שברים', href: '/tools/fraction-calculator' }, { label: 'מתמטיקה לפי כיתה', href: '/math' }]} /></div>
  </div>
}
