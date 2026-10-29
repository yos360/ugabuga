import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import { Sheet, T } from '../components/printables/PrintableShell'
import { LEARN_CRUMB } from './LearnPages'
import {
  PATH_URL, STAGES, PER_STAGE, MAX_STARS, PATH_FAQ, stageQuestions, sheetQuestions, starsFor, unlockedCount,
  totalStars, cleanProgress, recordStars, hintFor,
} from './timesPath'
import './learn.css'
import './times-path.css'

const KEY = 'buga-tt-path'
const loadProgress = () => { try { return cleanProgress(JSON.parse(localStorage.getItem(KEY) || '{}')) } catch { return {} } }
const saveProgress = p => { try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* storage blocked */ } }
const newSeed = () => Math.floor(Math.random() * 2 ** 31) + 1
const Stars = ({ n, size = '' }) => <span className={`ttp-stars ${size}`} aria-hidden="true">{[0, 1, 2].map(i => <span key={i} className={i < n ? 'on' : ''}>★</span>)}</span>
const PRAISE = ['כל הכבוד! 🎉', 'מעולה! ⭐', 'נכון! 👏', 'יופי! 💪', 'בול! 🎯']
const RESULT = ['עוד קצת תרגול ונצליח — נסו שוב 💪', 'עברתם את השלב! 🙂', 'כמעט מושלם! 😃', 'מושלם — 10 מתוך 10! 🏆']

// ── printable practice sheet (A4) ───────────────────────────────
const A4 = ({ children }) => <article className="buga-a4"><div className="print-art">{children}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>
const L = props => <T {...props} direction="ltr" />
const starPoints = (cx, cy, r) => Array.from({ length: 10 }, (_, i) => {
  const ang = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r
  return `${(cx + rr * Math.cos(ang)).toFixed(2)},${(cy + rr * Math.sin(ang)).toFixed(2)}`
}).join(' ')

export function PathSheet({ stage, items, answers }) {
  const title = `מסלול לוח הכפל · ${stage.title}`
  return <Sheet label={answers ? `תשובות — ${title}` : title}>
    <T x={100} y={15} size={8.5} weight={900}>{answers ? `תשובות — ${stage.title}` : title}</T>
    {!answers && <T x={100} y={24} size={4.5}>{`שם: ______________   תאריך: __________   הצלחתי: ___ מתוך ${items.length}`}</T>}
    {items.map((f, i) => {
      const col = Math.floor(i / 10), row = i % 10, x = 160 - col * 64, y = 40 + row * 16.5
      return <g key={i}>
        <L x={x + 27} y={y} size={3.8} fill="#888" anchor="start">{`${i + 1}.`}</L>
        <L x={x} y={y} size={7}>{`${f.a} × ${f.b} = `}<tspan fill={answers ? '#1f7a1c' : '#111'} fontWeight={answers ? 800 : 400}>{answers ? f.v : '____'}</tspan></L>
      </g>
    })}
    {!answers && <>
      <rect x={14} y={205} width={172} height={20} rx={4} fill="#fff8db" stroke="#c9a400" strokeWidth=".4" />
      <T x={182} y={217.5} size={5} weight={800} anchor="start">כמה כוכבים הרווחתי?</T>
      <T x={98} y={217.5} size={3.8} fill="#555" anchor="start">30 נכונות — 3 · 24 ומעלה — 2 · 18 ומעלה — 1</T>
      {[0, 1, 2].map(i => <polygon key={i} points={starPoints(122 - i * 9, 215, 4)} fill="#fff" stroke="#c9a400" strokeWidth=".6" />)}
      <T x={100} y={236} size={5} weight={800}>המסלול שלי — צובעים עיגול על כל שלב שעברתי</T>
      {STAGES.map((s, i) => {
        const cx = 187 - i * 13.4, on = s.id === stage.id
        return <g key={s.id}>
          {i > 0 && <line x1={cx + 4.6} y1={246} x2={cx + 8.8} y2={246} stroke="#999" strokeWidth=".5" strokeDasharray="1 1" />}
          <circle cx={cx} cy={246} r={4.6} fill={on ? '#ffe9a8' : '#fff'} stroke="#555" strokeWidth=".45" />
          {s.review ? <polygon points={starPoints(cx, 246.3, 2.6)} fill="none" stroke="#555" strokeWidth=".4" /> : <L x={cx} y={247.6} size={3.6} weight={800}>{s.label}</L>}
        </g>
      })}
      <T x={100} y={258} size={3.8} fill="#555">עיגול עם כוכב — שלב חזרה. ממשיכים לשחק במסלול באתר עוגה בוגה.</T>
    </>}
  </Sheet>
}

function PrintOut({ job, onClose, onRefresh }) {
  if (!job) return null
  const pages = (items, k = '') => [<A4 key={`q${k}`}><PathSheet stage={job.stage} items={items} /></A4>, <A4 key={`a${k}`}><PathSheet stage={job.stage} items={items} answers /></A4>]
  return <PrintPreview title={`דף תרגול לוח הכפל — ${job.stage.title}`} onClose={onClose} onRefresh={onRefresh}
    variant={i => pages(sheetQuestions(job.stage.tables, newSeed()), i)}>{pages(job.items)}</PrintPreview>
}

// ── the path ───────────────────────────────
const ROW = 96
const XS = [50, 77, 50, 23]
function PathMap({ progress, open, onPick }) {
  const h = STAGES.length * ROW
  const pts = STAGES.map((s, i) => [XS[i % XS.length], i * ROW + 40])
  return <div className="ttp-map" style={{ height: h }}>
    <svg className="ttp-line" viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke="#c9b37a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <polyline points={pts.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="6 8" vectorEffect="non-scaling-stroke" />
    </svg>
    <ol className="ttp-nodes">{STAGES.map((s, i) => {
      const stars = progress[s.id] || 0, locked = i >= open, next = i === open - 1 && !stars
      const [x, y] = pts[i]
      return <li key={s.id} style={{ left: `${x}%`, top: y }}>
        <button type="button" className={`ttp-node ${s.review ? 'is-review' : ''} ${locked ? 'is-locked' : ''} ${stars ? 'is-done' : ''} ${next ? 'is-next' : ''}`}
          disabled={locked} onClick={() => onPick(s)}
          aria-label={`שלב ${i + 1}: ${s.title}${locked ? ' — נעול' : stars ? ` — ${stars} כוכבים` : ''}`}>
          <span className="ttp-node-label">{locked ? '🔒' : s.label}</span>
        </button>
        <span className="ttp-node-cap" aria-hidden="true"><b>{s.title}</b><Stars n={stars} /></span>
      </li>
    })}</ol>
  </div>
}

// ── one stage ───────────────────────────────
function Game({ stage, onDone, onExit }) {
  const [st, setSt] = useState(() => ({ queue: stageQuestions(stage, newSeed()), pos: 0, typed: '', phase: 'ask', firstRight: 0, missed: [] }))
  const ref = useRef(st)
  const put = s => { ref.current = s; setSt(s) } // handlers read the latest state even before React re-renders
  const nextBtn = useRef(null)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const q = st.queue[st.pos]
  const originals = st.queue.filter(x => !x.retry).length
  const answered = st.queue.slice(0, st.pos + (st.phase === 'ask' ? 0 : 1)).filter(x => !x.retry).length

  const advance = useCallback(() => {
    const s = ref.current
    if (s.pos + 1 >= s.queue.length) { onDone(starsFor(s.firstRight, PER_STAGE), s.firstRight, s.missed); return }
    put({ ...s, pos: s.pos + 1, typed: '', phase: 'ask' })
  }, [onDone])

  const submit = useCallback(() => {
    const s = ref.current
    if (s.phase !== 'ask' || !s.typed) return
    const cur = s.queue[s.pos]
    if (Number(s.typed) === cur.v) {
      put({ ...s, phase: 'right', firstRight: s.firstRight + (cur.retry ? 0 : 1) })
      timer.current = setTimeout(advance, 750)
    } else {
      const queue = cur.retry ? s.queue : [...s.queue, { ...cur, retry: true }]
      put({ ...s, queue, phase: 'wrong', missed: cur.retry ? s.missed : [...s.missed, cur] })
    }
  }, [advance])

  const press = useCallback(k => {
    const s = ref.current
    if (s.phase === 'wrong' && k === 'enter') { advance(); return }
    if (s.phase !== 'ask') return
    if (k === 'enter') submit()
    else if (k === 'del') put({ ...s, typed: s.typed.slice(0, -1) })
    else if (s.typed.length < 3) put({ ...s, typed: s.typed + k })
  }, [advance, submit])

  useEffect(() => {
    const onKey = e => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable], [data-native]')) return
      if (/^[0-9]$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('del')
      else if (e.key === 'Enter') { e.preventDefault(); press('enter') }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [press])
  useEffect(() => { if (st.phase === 'wrong') nextBtn.current?.focus({ preventScroll: true }) }, [st.phase])

  const hint = st.phase === 'wrong' ? hintFor(q.a, q.b) : null
  return <section className="ln-box ttp-game" aria-labelledby="ttp-stage-h">
    <div className="ttp-game-top">
      <h2 id="ttp-stage-h" className="text-xl font-black m-0">{stage.review ? stage.label : '✖️'} {stage.title}</h2>
      <span className="font-bold">{q.retry ? '🔁 עוד הזדמנות' : `תרגיל ${Math.min(answered + (st.phase === 'ask' ? 1 : 0), originals)} מתוך ${originals}`}</span>
    </div>
    <div className="ln-bar my-2"><i style={{ width: `${(answered / originals) * 100}%` }} /></div>
    <div className={`ln-ex ${st.phase === 'right' ? 'flash-ok' : st.phase === 'wrong' ? 'flash-no' : ''}`}>
      {q.a} × {q.b} = <span className="ans">{st.phase === 'wrong' ? q.v : st.typed || ' '}</span>
    </div>
    <div className="ttp-feedback" role="status" aria-live="polite">
      {st.phase === 'right' && <p className="ttp-ok">{PRAISE[(q.a * 7 + q.b) % PRAISE.length]}</p>}
      {st.phase === 'wrong' && <div className="ttp-no">
        <p className="font-black">לא בדיוק. התשובה הנכונה: <bdi dir="ltr">{`${q.a} × ${q.b} = ${q.v}`}</bdi></p>
        <p>{hint.text} <bdi dir="ltr" className="ttp-eq">{hint.eq}</bdi></p>
        {!q.retry && <p className="text-sm">התרגיל הזה יחזור עוד פעם בסוף השלב.</p>}
        <button ref={nextBtn} type="button" className="ln-btn go mt-2" onClick={advance}>הבא ←</button>
      </div>}
    </div>
    {st.phase !== 'wrong' && <>
      <div className="ln-pad">{['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(k => <button key={k} type="button" onClick={() => press(k)}>{k}</button>)}
        <button type="button" onClick={() => press('del')} aria-label="מחיקה">⌫</button>
        <button type="button" onClick={() => press('0')}>0</button>
        <button type="button" className="ttp-check" onClick={() => press('enter')} disabled={!st.typed || st.phase !== 'ask'} aria-label="בדיקה">✓</button>
      </div>
    </>}
    <p className="mt-3 text-center"><button type="button" className="underline" data-native onClick={onExit}>חזרה למסלול</button></p>
  </section>
}

function Result({ stage, res, nextStage, onAgain, onNext, onMap, onPrint }) {
  return <section className="ln-box text-center ttp-result" aria-live="polite">
    <p className="text-lg font-bold m-0">{stage.title}</p>
    <Stars n={res.stars} size="is-big" />
    <h2 className="text-3xl font-black my-1">{`${res.right} מתוך ${PER_STAGE} בניסיון הראשון`}</h2>
    <p className="text-xl font-bold">{RESULT[res.stars]}</p>
    {res.missed.length > 0 && <><p className="font-bold mt-3">כדאי לחזור על:</p>
      <div className="ln-res">{res.missed.map(f => <span key={`${f.a}x${f.b}`} className="no" dir="ltr">{`${f.a} × ${f.b} = ${f.v}`}</span>)}</div></>}
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {res.stars > 0 && nextStage && <button type="button" className="ln-btn go" onClick={onNext}>{`לשלב הבא: ${nextStage.title} ←`}</button>}
      <button type="button" className={`ln-btn ${res.stars > 0 && nextStage ? 'alt' : 'go'}`} onClick={onAgain}>🔁 לשחק שוב</button>
      <button type="button" className="ln-btn alt" onClick={onPrint}>🖨️ דף תרגול לשלב</button>
      <button type="button" className="ln-btn alt" onClick={onMap}>🗺️ למסלול</button>
    </div>
  </section>
}

// ── page ───────────────────────────────
const RELATED = [
  { label: 'לוח הכפל', href: '/learn/multiplication-table' },
  { label: 'אתגר הדקה — תרגול לוח הכפל נגד השעון', href: '/learn/times-tables' },
  { label: 'לוח הכפל של 7', href: '/learn/multiplication-table/of/7' },
  { label: 'סרגל כפולות להדפסה', href: '/printables/multiplication-strips' },
  { label: 'צביעה לפי לוח הכפל', href: '/printables/color-by-answer/multiplication' },
  { label: 'תרגילי חשבון לכיתה ג׳', href: '/math/grade-3' },
]

export function TimesTablePath() {
  const [progress, setProgress] = useState({})
  const [all, setAll] = useState(false)
  const [play, setPlay] = useState(null) // { stage, key }
  const [res, setRes] = useState(null)
  const [job, setJob] = useState(null)
  const top = useRef(null)
  useEffect(() => { setProgress(loadProgress()) }, []) // after hydration: the prerendered page shows a fresh path
  const open = all ? STAGES.length : unlockedCount(progress)
  const stars = totalStars(progress)
  const scrollUp = () => requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  const start = stage => { setRes(null); setPlay({ stage, key: Date.now() }); scrollUp() }
  const done = useCallback((s, right, missed) => {
    const stage = play.stage
    setRes({ stage, stars: s, right, missed })
    setPlay(null)
    const n = recordStars(progress, stage.id, s)
    if (n !== progress) { setProgress(n); saveProgress(n) }
  }, [play, progress])
  const printFor = stage => setJob({ stage, items: sheetQuestions(stage.tables, newSeed()) })
  const nextOf = stage => STAGES[stage.index + 1] || null
  const current = STAGES[unlockedCount(progress) - 1]

  return <div className="mx-auto max-w-3xl px-4 py-6 buga-fade-in" dir="rtl">
    <SEO title="משחק לוח הכפל — מסלול שלבים אונליין עם כוכבים" description="משחק לוח הכפל לילדים: מתקדמים במסלול שלבים מהלוח של 1 עד הלוח של 10, מקבלים משוב מיידי על כל תשובה וכוכבים, ומדפיסים דף תרגול לוח הכפל עם תשובות." path={PATH_URL} structuredData={faqSchema(PATH_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, { label: 'לוח הכפל', href: '/learn/multiplication-table' }, { label: 'משחק לוח הכפל' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-1"><span aria-hidden="true">🗺️ </span>משחק לוח הכפל — מסלול השלבים</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">מתקדמים שלב אחרי שלב מהלוח של 1 ועד הלוח של 10, אוספים כוכבים ופותחים את השלב הבא</p>

    <div ref={top} className="ttp-bar">
      <span className="ttp-total" aria-label={`${stars} כוכבים מתוך ${MAX_STARS}`}>⭐ {stars} / {MAX_STARS}</span>
      <div className="flex flex-wrap gap-2 justify-center">
        <button type="button" className="ln-chip" onClick={() => printFor(play?.stage || res?.stage || current)}>🖨️ דף תרגול + תשובות</button>
        {!play && <button type="button" className="ln-chip" aria-pressed={all} onClick={() => setAll(a => !a)}>{all ? '🔓 כל השלבים פתוחים' : '🔒 פתיחת כל השלבים'}</button>}
      </div>
    </div>

    {play && <Game key={play.key} stage={play.stage} onDone={done} onExit={() => setPlay(null)} />}
    {!play && res && <Result stage={res.stage} res={res} nextStage={nextOf(res.stage)} onAgain={() => start(res.stage)} onNext={() => start(nextOf(res.stage))} onMap={() => setRes(null)} onPrint={() => printFor(res.stage)} />}
    {!play && !res && <>
      <p className="text-center font-bold mb-2">{stars ? `ממשיכים מאיפה שעצרתם: ${current.title}` : 'מתחילים מהשלב הראשון — לחצו על העיגול המהבהב'}</p>
      <PathMap progress={progress} open={open} onPick={start} />
    </>}
    <PrintOut job={job} onClose={() => setJob(null)} onRefresh={() => setJob(j => ({ ...j, items: sheetQuestions(j.stage.tables, newSeed()) }))} />

    <section className="mt-10">
      <h2 className="text-2xl font-black mb-2">איך משחקים?</h2>
      <ul className="space-y-2 list-disc pr-6 leading-relaxed">
        <li>בכל שלב יש {PER_STAGE} תרגילים. מקלידים את התשובה במקלדת שעל המסך (או במקלדת של המחשב) ולוחצים ✓.</li>
        <li>תשובה נכונה — עוברים מיד לתרגיל הבא. טעות — רואים את התשובה הנכונה ודרך קצרה לחשב אותה, והתרגיל חוזר עוד פעם בסוף השלב.</li>
        <li>בסוף השלב מקבלים כוכבים לפי התשובות הנכונות בניסיון הראשון: 10 — שלושה כוכבים, 8–9 — שניים, 6–7 — אחד. כוכב אחד מספיק כדי לפתוח את השלב הבא.</li>
        <li>אחרי כל קבוצת לוחות מחכה שלב חזרה שמערבב אותם, ובסוף — האתגר הגדול עם כל הלוחות.</li>
      </ul>
    </section>

    <section className="mt-8">
      <h2 className="text-2xl font-black mb-2">סדר השלבים במסלול</h2>
      <ol className="ttp-order">{STAGES.map((s, i) => <li key={s.id}><b>{i + 1}.</b> {s.title}</li>)}</ol>
      <p className="mt-3 leading-relaxed">המסלול מתחיל בלוחות הקלים ומסתיים בקשים. כשמגיעים ללוח של 7, רוב התרגילים שלו כבר מוכרים מהלוחות הקודמים — 7×3 הוא בדיוק 3×7 — ונשארים רק 7×7, 7×8, 7×9 ועוד מעטים.</p>
    </section>

    <section className="mt-8">
      <h2 className="text-2xl font-black mb-2">דף תרגול לוח הכפל להדפסה</h2>
      <p className="leading-relaxed mb-3">לכל שלב יש דף A4 עם 30 תרגילים מהלוחות של אותו שלב, עמוד תשובות נפרד, משבצת לכוכבים ומסלול קטן לצביעה. בוחרים שלב ומדפיסים:</p>
      <div className="flex flex-wrap justify-center gap-2">{STAGES.map(s => <button key={s.id} type="button" className="ln-chip" onClick={() => printFor(s)} aria-label={`הדפסת דף תרגול — ${s.title}`}>{s.review ? `${s.label} ` : ''}{s.title}</button>)}</div>
    </section>

    <div className="mt-10"><SeoBody paragraphs={[
      'משחק לוח הכפל בנוי כמו מסלול: כל עצירה היא לוח אחד, וכדי להתקדם צריך להצליח בשלב שלפניו. כך הילד יודע בדיוק איפה הוא עומד, רואה את הכוכבים מצטברים, ולא נבהל מכל מאה התרגילים בבת אחת. המשוב המיידי אחרי כל תשובה מונע שינון של טעות, ותרגיל שהתבלבלו בו חוזר שוב באותו שלב.',
      'אפשר לשחק כמה דקות ביום ולהמשיך מאיפה שעצרתם — הכוכבים נשמרים במכשיר. מי שרוצה לתרגל גם על הנייר מדפיס דף תרגול לוח הכפל לשלב שבו הוא נמצא, עם דף תשובות להורים או למורה. ואחרי שכל המסלול מלא בכוכבים, אפשר לבדוק את המהירות באתגר הדקה של לוח הכפל.',
    ]} faq={PATH_FAQ} related={RELATED} /></div>
    <p className="text-center mt-6"><Link to="/learn/multiplication-table" className="ln-btn alt inline-flex items-center">📋 ללוח הכפל המלא ←</Link></p>
  </div>
}

export default TimesTablePath
