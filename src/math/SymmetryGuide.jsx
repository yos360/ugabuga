import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import {
  SHAPES, DESIGNS, LEVELS, FAQ, MISTAKES, TEACH_STEPS, MORE_LINKS,
  findAxes, rotationOrder, axisSegment, axesLabel, fullGrid, isGiven, mirrorOf, checkMirror, designsFor,
} from '../data/symmetryMath'
import '../learn/learn.css'
import './math.css'

// /math/symmetry — line and rotational symmetry for grades 3–5: explanation, an on-screen
// "complete the picture" game on a grid, an "how many axes?" quiz, and a printable worksheet set
// with an answer page. Axes are computed from each shape's corners (see data/symmetryMath.js).
const PATH = '/math/symmetry'
const INFO = SHAPES.map(s => s.circle ? { ...s, axisAngles: [0, 45, 90, 135], c: [50, 50] } : (() => {
  const a = findAxes(s.pts)
  return { ...s, axisAngles: a.angles, c: a.center, rotN: rotationOrder(s.pts) }
})())
const PRINT_SHAPES = ['square', 'rectangle', 'equilateral', 'isosceles', 'scalene', 'rhombus', 'parallelogram', 'kite', 'trapezoid', 'pentagon', 'hexagon', 'plus']
const QUIZ_OPTIONS = [0, 1, 2, 3, 4, 5, 6, Infinity]
const FILL = '#2563eb', AXIS = '#dc2626'

function ShapeSvg({ s, showAxes, px = 120, fill = '#fde68a', label }) {
  return <svg viewBox="-6 -6 112 112" style={{ width: px, height: px }} role="img" aria-label={label || s.name}>
    {s.circle ? <circle cx="50" cy="50" r="42" fill={fill} stroke="#1f2937" strokeWidth="2.5" />
      : <polygon points={s.pts.map(p => p.join(',')).join(' ')} fill={fill} stroke="#1f2937" strokeWidth="2.5" strokeLinejoin="round" />}
    {showAxes && s.axisAngles.map(a => { const [x1, y1, x2, y2] = axisSegment(s.c, a, 56); return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={AXIS} strokeWidth="2" strokeDasharray="6 4" /> })}
    {showAxes && s.circle && <text x="50" y="104" textAnchor="middle" fontSize="11" fill={AXIS}>…ועוד אינסוף</text>}
  </svg>
}

// A design on a grid as SVG (for print): `mode` is 'half' (only the given half), or 'full'.
function GridSvg({ design, axis, mode, px }) {
  const n = design.size, g = fullGrid(design, axis), cell = 10, W = n * cell
  return <svg viewBox={`-1 -1 ${W + 2} ${W + 2}`} style={{ width: px, height: px }} role="img" aria-label={`${design.name} על רשת ${n}×${n}`}>
    {g.flatMap((row, r) => row.map((on, c) => {
      const shown = on && (mode === 'full' || isGiven(r, c, n, axis))
      return <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={shown ? (isGiven(r, c, n, axis) ? FILL : '#93c5fd') : '#fff'} stroke="#9ca3af" strokeWidth="0.4" />
    }))}
    {axis === 'v' ? <line x1={W / 2} y1="-1" x2={W / 2} y2={W + 1} stroke={AXIS} strokeWidth="1.4" /> : <line x1="-1" y1={W / 2} x2={W + 1} y2={W / 2} stroke={AXIS} strokeWidth="1.4" />}
  </svg>
}

function MirrorGame() {
  const [levelId, setLevelId] = useState('easy')
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(() => new Set())
  const [result, setResult] = useState(null)
  const [solved, setSolved] = useState(0)
  const level = LEVELS.find(l => l.id === levelId), list = designsFor(level), design = list[idx % list.length]
  const n = level.size, axis = level.axis, g = fullGrid(design, axis)
  const reset = () => { setPicked(new Set()); setResult(null) }
  const toggle = key => { setPicked(p => { const q = new Set(p); if (q.has(key)) q.delete(key); else q.add(key); return q }); setResult(null) }
  const check = () => { const r = checkMirror(design, axis, picked); setResult(r); if (r.ok) setSolved(v => v + 1) }
  const next = () => { setIdx(i => i + 1); reset() }
  const bad = new Set(result && !result.ok ? result.wrong : [])
  const miss = new Set(result && !result.ok && result.showMissing ? result.missing : [])
  const cellPx = n === 6 ? 'min(13vw, 52px)' : 'min(10vw, 44px)'
  return <div>
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="רמת קושי">
      {LEVELS.map(l => <button key={l.id} type="button" onClick={() => { setLevelId(l.id); setIdx(0); reset() }} aria-pressed={l.id === levelId}
        className={`rounded-xl border-2 px-3 py-2 font-bold ${l.id === levelId ? 'border-blue-700 bg-blue-700 text-white' : 'border-[var(--border)] bg-white'}`}>{l.label} <small className="font-normal">({l.note})</small></button>)}
    </div>
    <p className="mt-3 leading-relaxed">{axis === 'v' ? 'החצי הימני כבר צבוע. לחצו על משבצות בצד השמאלי כדי לצבוע אותן, כך שהציור יהיה סימטרי לפי הקו האדום.' : 'החצי העליון כבר צבוע. צבעו משבצות בחצי התחתון, כך שהציור יהיה סימטרי לפי הקו האדום.'} <b>מה מצויר כאן?</b></p>
    <div dir="ltr" className="mx-auto mt-3 grid w-fit gap-0 rounded-lg border-2 border-gray-700 bg-white" style={{ gridTemplateColumns: `repeat(${n}, ${cellPx})` }}>
      {g.flatMap((row, r) => row.map((on, c) => {
        const key = `${r},${c}`, given = isGiven(r, c, n, axis), isOn = given ? on : picked.has(key)
        const edge = axis === 'v' ? (c === n / 2 - 1 ? { borderRight: `4px solid ${AXIS}` } : c === n / 2 ? { borderLeft: `4px solid ${AXIS}` } : null)
          : (r === n / 2 - 1 ? { borderBottom: `4px solid ${AXIS}` } : r === n / 2 ? { borderTop: `4px solid ${AXIS}` } : null)
        const [mr, mc] = mirrorOf(r, c, n, axis)
        return <button key={key} type="button" disabled={given} onClick={() => toggle(key)}
          aria-label={given ? `משבצת נתונה ${on ? 'צבועה' : 'ריקה'}` : `שורה ${r + 1} עמודה ${c + 1}: ${isOn ? 'צבועה' : 'ריקה'}`}
          title={given ? '' : `המשבצת התואמת: שורה ${mr + 1}, עמודה ${mc + 1}`}
          style={{ aspectRatio: '1', background: isOn ? FILL : given ? '#f3f4f6' : '#fff', border: '1px solid #cbd5e1', ...edge, outline: bad.has(key) ? `3px solid ${AXIS}` : miss.has(key) ? '3px dashed #f59e0b' : 'none', outlineOffset: -3 }}
          className={given ? 'cursor-default' : 'cursor-pointer hover:brightness-95'} />
      }))}
    </div>
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <button type="button" onClick={check} className="ln-btn go">✔️ בדיקה</button>
      <button type="button" onClick={reset} className="ln-btn alt">🧽 ניקוי</button>
      <button type="button" onClick={next} className="ln-btn alt">➡️ ציור אחר</button>
    </div>
    <div aria-live="polite" className="mt-3 text-center text-lg">
      {result?.ok && <p className="rounded-xl bg-green-50 p-3 font-bold text-green-800">🎉 מושלם! זה {design.name}, והוא סימטרי לגמרי. {solved > 1 && `השלמתם כבר ${solved} ציורים.`}</p>}
      {result && !result.ok && <div className="rounded-xl bg-amber-50 p-3">
        <p className="font-bold">עוד לא. {result.wrong.length > 0 && `משבצות צבועות שלא צריכות להיות: ${result.wrong.length} (מסומנות באדום). `}{result.missing.length > 0 && `משבצות חסרות: ${result.missing.length}.`}</p>
        <p className="mt-1 text-base">טיפ: לכל משבצת צבועה, ספרו כמה משבצות יש ממנה עד הקו האדום, וספרו את אותו מספר בצד השני.</p>
        {result.missing.length > 0 && !result.showMissing && <button type="button" className="mt-2 underline" onClick={() => setResult({ ...result, showMissing: true })}>הראו לי איפה חסר</button>}
      </div>}
    </div>
  </div>
}

function AxesQuiz() {
  const order = INFO.map((_, i) => i)
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  const s = INFO[order[i % order.length]], answered = pick !== null, right = answered && pick === s.axes
  const choose = v => { if (answered) return; setPick(v); if (v === s.axes) setScore(x => x + 1) }
  return <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
    <div className="mx-auto rounded-2xl border-2 border-[var(--border)] bg-white p-2"><ShapeSvg s={s} showAxes={answered} px={170} /></div>
    <div>
      <p className="text-sm text-[var(--muted-foreground)]">צורה {(i % order.length) + 1} מתוך {order.length} · ניקוד: {score}</p>
      <p className="mt-1 text-xl font-black">כמה צירי סימטריה יש ל{s.name}?</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="תשובות">
        {QUIZ_OPTIONS.map(v => <button key={v} type="button" onClick={() => choose(v)} disabled={answered}
          className={`min-w-[52px] rounded-xl border-2 px-3 py-2 text-lg font-black ${answered && v === s.axes ? 'border-green-700 bg-green-600 text-white' : answered && v === pick ? 'border-red-700 bg-red-600 text-white' : 'border-[var(--border)] bg-white'}`}>{v === Infinity ? '∞' : v}</button>)}
      </div>
      <div aria-live="polite" className="mt-3">
        {answered && <p className={`rounded-xl p-3 ${right ? 'bg-green-50' : 'bg-amber-50'}`}><b>{right ? '✔️ נכון!' : `התשובה: ${axesLabel(s.axes)}.`}</b> {s.why} {s.axes > 0 && 'הצירים מסומנים בקו אדום מקווקו.'}</p>}
        {answered && <button type="button" onClick={() => { setI(x => x + 1); setPick(null) }} className="ln-btn go mt-3">לצורה הבאה ←</button>}
      </div>
    </div>
  </div>
}

function PrintSheets({ set }) {
  const v8 = DESIGNS.filter(d => d.size === 8), v6 = DESIGNS.filter(d => d.size === 6)
  const items = [
    { d: v6[set % v6.length], axis: 'v' },
    { d: v8[set % v8.length], axis: 'v' },
    { d: v8[(set + 3) % v8.length], axis: 'v' },
    { d: v8[(set + 5) % v8.length], axis: 'h' },
  ]
  const shapes = PRINT_SHAPES.map(id => INFO.find(s => s.id === id))
  const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6mm', width: '100%', marginTop: 6 }
  return <>
    <article className="buga-a4" style={page}>
      <h2>🪞 השלימו את הציור לפי ציר הסימטריה</h2>
      <p style={{ fontSize: 13, margin: '0 0 4px', textAlign: 'center' }}>שם: ____________ · צבעו משבצות בצד הריק, כך שהציור יהיה בבואה של החצי הצבוע. הקו האדום הוא ציר הסימטריה.</p>
      <div style={grid2}>{items.map((it, k) => <div key={k} style={{ textAlign: 'center' }}>
        <GridSvg design={it.d} axis={it.axis} mode="half" px="78mm" />
        <div style={{ fontSize: 13, marginTop: 2 }}>{k + 1}. מה יצא? ___________</div>
      </div>)}</div>
      <footer>ugabuga.co.il/math/symmetry · סימטריה לכיתות ג׳–ה׳</footer>
    </article>
    <article className="buga-a4" style={page}>
      <h2>📐 כמה צירי סימטריה יש לכל צורה?</h2>
      <p style={{ fontSize: 13, margin: '0 0 4px', textAlign: 'center' }}>שרטטו בסרגל את כל צירי הסימטריה של כל צורה, וכתבו כמה צירים מצאתם. רמז: יש צורות בלי אף ציר.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3mm', width: '100%' }}>
        {shapes.map((s, k) => <div key={s.id} style={{ textAlign: 'center', border: '1px solid #ddd', borderRadius: 8, padding: '2mm' }}>
          <ShapeSvg s={s} px="40mm" fill="#fff" />
          <div style={{ fontSize: 12.5 }}>{k + 1}. {s.name}</div>
          <div style={{ fontSize: 12.5 }}>מספר הצירים: ____</div>
        </div>)}
      </div>
      <footer>ugabuga.co.il/math/symmetry · סימטריה לכיתות ג׳–ה׳</footer>
    </article>
    <article className="buga-a4" style={page}>
      <h2>✅ תשובות</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3mm', width: '100%' }}>
        {items.map((it, k) => <div key={k} style={{ textAlign: 'center' }}><GridSvg design={it.d} axis={it.axis} mode="full" px="38mm" /><div style={{ fontSize: 12 }}>{k + 1}. {it.d.name}</div></div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2mm', width: '100%', marginTop: 8 }}>
        {shapes.map((s, k) => <div key={s.id} style={{ textAlign: 'center' }}>
          <ShapeSvg s={s} showAxes px="30mm" fill="#fff" />
          <div style={{ fontSize: 11.5 }}>{k + 1}. {s.name}: <b>{axesLabel(s.axes)}</b></div>
        </div>)}
      </div>
      <footer>ugabuga.co.il/math/symmetry · דף תשובות</footer>
    </article>
  </>
}

export default function SymmetryGuide() {
  const [print, setPrint] = useState(false)
  const [set, setSet] = useState(0)
  const rotRows = INFO.filter(s => !s.circle)
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="סימטריה לכיתות ג׳–ה׳ — צירי סימטריה, דף עבודה ומשחק השלמה"
      description="סימטריה בחשבון: מה זה ציר סימטריה, כמה צירים יש לריבוע, למלבן ולמשולש, וסימטריה סיבובית. משחק השלמה על משבצות, חידון צירים ודפי עבודה להדפסה עם תשובות — חינם."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מתמטיקה', href: '/math' }, { label: 'סימטריה' }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">🪞</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">סימטריה לכיתות ג׳–ה׳: צירי סימטריה, משחק ודפי עבודה</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">הסבר קצר וברור, משחק השלמה על משבצות, חידון "כמה צירים?" ודפי עבודה להדפסה עם דף תשובות. מתאים לשיעור בכיתה ולתרגול בבית.</p>
    </header>
    <div className="mt-5 flex flex-wrap justify-center gap-2">
      <a href="#game" className="ln-btn go">🎮 משחק השלמה</a>
      <a href="#quiz" className="ln-btn alt">❓ חידון צירים</a>
      <button type="button" onClick={() => setPrint(true)} className="ln-btn alt">🖨️ דפי עבודה להדפסה</button>
    </div>

    <section className="ln-box mt-8" aria-labelledby="what-h">
      <h2 id="what-h" className="text-2xl font-black">מה זה סימטריה?</h2>
      <p className="mt-2 leading-relaxed"><b>צורה סימטרית</b> היא צורה שאפשר לחלק בקו אחד לשני חלקים שהם בבואה זה של זה, כמו במראה. הקו הזה נקרא <b>ציר סימטריה</b>. אם גוזרים את הצורה ומקפלים אותה לאורך הציר, שני החלקים מתלכדים בדיוק.</p>
      <p className="mt-2 leading-relaxed">כל נקודה בצד אחד של הציר נמצאת באותו מרחק מהציר כמו הנקודה התואמת לה בצד השני. לצורה יכולים להיות ציר אחד, כמה צירים, אינסוף צירים (עיגול) או אף ציר.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {['isosceles', 'rectangle', 'square', 'scalene'].map(id => { const s = INFO.find(x => x.id === id); return <figure key={id} className="text-center">
          <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-1"><ShapeSvg s={s} showAxes px={110} /></div>
          <figcaption className="mt-1 text-sm font-bold">{s.name}: {s.axes === 0 ? 'אין צירים' : s.axes === 1 ? 'ציר אחד' : `${s.axes} צירים`}</figcaption>
        </figure> })}
      </div>
    </section>

    <section id="game" className="mt-10 scroll-mt-24" aria-labelledby="game-h">
      <h2 id="game-h" className="text-3xl font-black">🎮 משחק: השלימו את הציור הסימטרי</h2>
      <p className="mb-4 mt-2 leading-relaxed">חצי מהציור כבר על הרשת. צבעו את החצי השני כך שיהיה בבואה מדויקת לפי הקו האדום, ולחצו "בדיקה". ברמה המאתגרת הציר אופקי, ומשלימים למטה.</p>
      <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><MirrorGame /></div>
    </section>

    <section id="quiz" className="ln-box mt-10 scroll-mt-24" aria-labelledby="quiz-h">
      <h2 id="quiz-h" className="mb-3 text-2xl font-black">❓ חידון: כמה צירי סימטריה?</h2>
      <AxesQuiz />
    </section>

    <section className="mt-10" aria-labelledby="table-h">
      <h2 id="table-h" className="text-3xl font-black">📋 טבלת צירים וסימטריה סיבובית</h2>
      <p className="mt-2 leading-relaxed"><b>סימטריה סיבובית</b> (להעשרה): צורה שחוזרת לעצמה כשמסובבים אותה סביב המרכז בפחות מסיבוב שלם. <b>סדר הסיבוב</b> הוא מספר הפעמים שהצורה "נראית אותו דבר" בסיבוב שלם אחד. ריבוע, למשל, חוזר לעצמו כל רבע סיבוב, ולכן סדר הסיבוב שלו הוא 4.</p>
      <div className="mt-4 overflow-x-auto rounded-2xl border-2 border-[var(--border)] bg-white">
        <table className="w-full text-right">
          <thead><tr className="border-b-2 border-[var(--border)] bg-[var(--card)]"><th className="p-2">צורה</th><th className="p-2">צירי סימטריה</th><th className="p-2">סדר סיבוב</th></tr></thead>
          <tbody>{rotRows.map(s => <tr key={s.id} className="border-b border-gray-200">
            <td className="p-2"><span className="inline-flex items-center gap-2"><ShapeSvg s={s} px={36} />{s.name}</span></td>
            <td className="p-2 font-black">{s.axes}</td>
            <td className="p-2">{s.rotN > 1 ? <b>{s.rotN}</b> : 'אין סימטריה סיבובית'}</td>
          </tr>)}
            <tr><td className="p-2"><span className="inline-flex items-center gap-2"><ShapeSvg s={INFO.find(x => x.circle)} px={36} />עיגול</span></td><td className="p-2 font-black">אינסוף</td><td className="p-2"><b>כל סיבוב</b></td></tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">שימו לב למקבילית: אין לה אף ציר סימטריה, אבל יש לה סימטריה סיבובית מסדר 2. ובמצולע משוכלל, מספר הצירים וסדר הסיבוב שווים שניהם למספר הצלעות.</p>
    </section>

    <section className="mt-10" aria-labelledby="teach-h">
      <h2 id="teach-h" className="text-3xl font-black">💡 איך מלמדים סימטריה</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {TEACH_STEPS.map(t => <li key={t.title} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><b className="text-lg"><span aria-hidden="true">{t.emoji} </span>{t.title}</b><p className="mt-1 leading-relaxed">{t.text}</p></li>)}
      </ul>
      <h3 className="mt-6 text-2xl font-black">⚠️ הטעויות הנפוצות</h3>
      <ul className="mt-3 grid gap-3">
        {MISTAKES.map(m => <li key={m.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4"><b>{m.title}.</b> {m.text}</li>)}
      </ul>
    </section>

    <section className="ln-box mt-10" aria-labelledby="print-h">
      <h2 id="print-h" className="text-2xl font-black">🖨️ דפי עבודה בסימטריה להדפסה</h2>
      <p className="mt-2 leading-relaxed">שלושה דפים: השלמת 4 ציורים על משבצות (ציר אנכי וציר אופקי), 12 צורות לשרטוט צירי הסימטריה, ודף תשובות למורה ולהורה. "סט אחר" מחליף את הציורים להשלמה.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPrint(true)} className="ln-btn go">🖨️ לתצוגה ולהדפסה</button>
        <button type="button" onClick={() => setSet(x => x + 1)} className="ln-btn alt">🔄 סט אחר (סט {set % 7 + 1})</button>
      </div>
    </section>

    <section className="ln-box mt-8" aria-labelledby="more-h">
      <h2 id="more-h" className="text-2xl font-black">📚 עוד באתר</h2>
      <p className="mt-2">לקטנים (גן עד כיתה ב׳) יש <Link to="/printables/symmetry" className="font-bold underline">ציורים סימטריים להשלמה</Link> — פרפר, בית, עץ ועוד, בלי משבצות.</p>
      <div className="mt-3 flex flex-wrap gap-2">{MORE_LINKS.map(l => <Link key={l.href} to={l.href} className="ln-chip">{l.label}</Link>)}</div>
    </section>

    {print && <PrintPreview title="סימטריה — דפי עבודה" onClose={() => setPrint(false)}><PrintSheets set={set} /></PrintPreview>}

    <div className="mt-10"><SeoBody paragraphs={[
      'סימטריה היא אחד הנושאים הנעימים בגאומטריה של בית הספר היסודי: היא מתחילה בקיפול דף וגזירה, ומגיעה עד שאלות כמו "למה לאלכסון של מלבן אין סימטריה?". בתוכנית הלימודים של 2006 היא פרק קצר בכיתה ד׳, אבל ילדים פוגשים אותה כבר בכיתות הנמוכות, והיא חוזרת כשלומדים על משולשים, מרובעים ומצולעים.',
      'בדף הזה יש שלושה סוגי תרגול. במשחק ההשלמה הילד צובע את החצי החסר של ציור על רשת משבצות ומקבל משוב מיידי, עם סימון של המשבצות השגויות. בחידון הוא מחליט כמה צירי סימטריה יש לכל צורה, ואחרי כל תשובה רואה את הצירים מסומנים. ודפי העבודה להדפסה כוללים את שני סוגי התרגילים, עם דף תשובות.',
      'מספר הצירים של כל צורה בדף לא הוקלד ביד: הוא מחושב מהקודקודים של הצורה עצמה, כך שהציור, הטבלה והתשובות תמיד מתאימים זה לזה.',
    ]} faq={FAQ} related={[{ label: 'ציור סימטרי להשלמה', href: '/printables/symmetry' }, { label: 'שברים לכיתות ד׳–ה׳', href: '/math/fractions' }, { label: 'מתמטיקה לפי כיתה', href: '/math' }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }]} /></div>
  </div>
}
