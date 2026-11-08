import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { LEARN_CRUMB } from './LearnPages'
import { MT_PAGES, range, shuffled } from './multiplicationTable'
import './learn.css'
import './multiplication-table.css'
import { speak } from '../utils/speak'

// "Table detective": three ways of reading the multiplication table instead of reciting it.
//  light — a square lights up with its row and column; the child writes the exercise behind it.
//  hunt  — an exercise is shown; the child taps its square in a table with the answers hidden.
//  twins — a number is shown; the child finds every square in the table that holds it.
export const DETECTIVE_PATH = '/learn/multiplication-table/game'
const ROUND = 10
const MODES = [
  { id: 'light', icon: '🔦', name: 'פנס הבלש', line: 'משבצת נדלקת — כותבים איזה תרגיל מסתתר בה' },
  { id: 'hunt', icon: '🎯', name: 'צייד המשבצות', line: 'מופיע תרגיל — נוגעים במשבצת של התשובה' },
  { id: 'twins', icon: '👯', name: 'המספר התאום', line: 'מופיע מספר — מוצאים את כל המשבצות שלו' },
]
const HUES = [0, 28, 48, 95, 140, 172, 200, 228, 262, 295, 325, 12]
const rowBg = r => `hsl(${HUES[(r - 1) % HUES.length]} 85% 95%)`
const key = (r, c) => `${r}x${c}`
const SOUND_KEY = 'buga-mt-sound'

// Products that sit in at least two squares of a size×size table, e.g. 12 = 2×6, 6×2, 3×4, 4×3.
export function twinProducts(size) {
  const count = new Map()
  for (const r of range(1, size)) for (const c of range(1, size)) count.set(r * c, (count.get(r * c) || 0) + 1)
  return [...count].filter(([p, n]) => n >= 2 && p > 2).map(([p]) => p)
}
export const cellsOf = (p, size) => range(1, size).flatMap(r => range(1, size).filter(c => r * c === p).map(c => [r, c]))

export function makeRound(mode, size) {
  if (mode === 'twins') return shuffled(twinProducts(size), Math.random).slice(0, ROUND).map(p => ({ p, cells: cellsOf(p, size) }))
  const seen = new Set(), out = []
  const lo = size > 5 ? 2 : 1
  while (out.length < ROUND) {
    const r = lo + Math.floor(Math.random() * (size - lo + 1)), c = lo + Math.floor(Math.random() * (size - lo + 1))
    const k = Math.min(r, c) + 'x' + Math.max(r, c)
    if (seen.has(k) && seen.size < 30) continue
    seen.add(k); out.push({ r, c, p: r * c })
  }
  return out
}
export const starsFor = score => score >= 9 ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0

function useSound() {
  const [on, setOn] = useState(true)
  useEffect(() => { try { setOn(localStorage.getItem(SOUND_KEY) !== '0') } catch { /* storage blocked */ } }, [])
  const toggle = () => setOn(v => { try { localStorage.setItem(SOUND_KEY, v ? '0' : '1') } catch { /* storage blocked */ } return !v })
  const say = text => { if (on) speak(text, 'he-IL') }
  return { on, toggle, say }
}

function Board({ size, hideHeads, lit, cross, shown, ok, bad, onTap }) {
  const heads = range(1, size)
  const isCross = (r, c) => cross && (cross[0] === r || cross[1] === c)
  return <div className="mt-wrap">
    <table className={`mt-table is-blank${size > 10 ? ' is-12' : ''}`}>
      <thead><tr><th>×</th>{heads.map(c => <th key={c} className={cross?.[1] === c ? 'cross' : ''}>{hideHeads ? '?' : c}</th>)}</tr></thead>
      <tbody>{heads.map(r => <tr key={r}>
        <th className={cross?.[0] === r ? 'cross' : ''}>{hideHeads ? '?' : r}</th>
        {heads.map(c => {
          const k = key(r, c), isLit = lit && lit[0] === r && lit[1] === c
          const visible = isLit || shown?.has(k)
          const cls = [isLit ? 'hit' : ok?.has(k) ? 'md-ok' : bad?.has(k) ? 'md-bad' : isCross(r, c) ? 'cross' : '', visible ? '' : 'hidden-cell'].join(' ').trim()
          return <td key={c} className={cls} style={{ '--mt-bg': rowBg(r) }}>
            <button type="button" tabIndex={onTap ? 0 : -1} aria-label={onTap ? `שורה ${r}, עמודה ${c}` : undefined} onClick={onTap ? () => onTap(r, c) : undefined}>{visible ? r * c : ''}</button>
          </td>
        })}
      </tr>)}</tbody>
    </table>
  </div>
}

function Setup({ mode, setMode, size, setSize, hideHeads, setHideHeads, onStart, best }) {
  return <div className="ln-box">
    <p className="text-xl font-black text-center mb-3">🔍 בוחרים משימה לבלש</p>
    <div className="md-modes">
      {MODES.map(m => <button key={m.id} type="button" className={`md-mode${mode === m.id ? ' on' : ''}`} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
        <span className="text-3xl" aria-hidden="true">{m.icon}</span>
        <b>{m.name}</b><span className="text-sm">{m.line}</span>
        {best[m.id] > 0 && <span className="text-sm" aria-label={`שיא: ${best[m.id]} כוכבים`}>{'⭐'.repeat(best[m.id])}</span>}
      </button>)}
    </div>
    <div className="flex flex-wrap justify-center gap-2 my-4">
      <button type="button" className="ln-chip" aria-pressed={size === 5} onClick={() => setSize(5)}>🐣 קטן: עד 5×5</button>
      <button type="button" className="ln-chip" aria-pressed={size === 10} onClick={() => setSize(10)}>🦉 רגיל: עד 10×10</button>
      <button type="button" className="ln-chip" aria-pressed={hideHeads} onClick={() => setHideHeads(v => !v)}>🕶️ בלי מספרים בצדדים</button>
    </div>
    {hideHeads && <p className="text-center text-sm mb-3">אתגר לבלשים ותיקים: המספרים בשורה ובעמודה מוסתרים, וצריך לספור משבצות כדי לדעת איפה נמצאים.</p>}
    <div className="text-center"><button type="button" className="ln-btn go" onClick={onStart}>יוצאים לחקירה! {ROUND} משימות ←</button></div>
  </div>
}

export default function MultiplicationDetective() {
  const [mode, setMode] = useState('light')
  const [size, setSize] = useState(10)
  const [hideHeads, setHideHeads] = useState(false)
  const [game, setGame] = useState(null)
  const [best, setBest] = useState({})
  const sound = useSound()
  const timer = useRef(null)
  const inputA = useRef(null)
  useEffect(() => { try { setBest(JSON.parse(localStorage.getItem('buga-mt-detective') || '{}')) } catch { /* storage blocked */ } }, [])
  useEffect(() => () => clearTimeout(timer.current), [])

  const start = () => {
    clearTimeout(timer.current)
    setGame({ mode, size, hideHeads, qs: makeRound(mode, size), i: 0, score: 0, streak: 0, top: 0, fb: null, a: '', b: '', ok: new Set(), bad: new Set(), slips: 0 })
  }
  const q = game && game.qs[game.i]
  const finished = game && game.i >= game.qs.length

  useEffect(() => { if (game?.mode === 'light' && !game.fb && !finished) inputA.current?.focus() }, [game?.i, game?.fb, game?.mode, finished])
  // Keep the best stars per task on this device only.
  useEffect(() => {
    if (!finished) return
    const stars = starsFor(game.score)
    setBest(b => {
      if ((b[game.mode] || 0) >= stars) return b
      const nb = { ...b, [game.mode]: stars }
      try { localStorage.setItem('buga-mt-detective', JSON.stringify(nb)) } catch { /* storage blocked */ }
      return nb
    })
  }, [finished]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close the current item: score it, show feedback, and move on (by itself after a right answer).
  const settle = (good, msg, extra = {}) => {
    setGame(g => {
      const streak = good ? g.streak + 1 : 0
      return { ...g, ...extra, fb: { good, msg }, score: g.score + (good ? 1 : 0), streak, top: Math.max(g.top, streak) }
    })
    if (good) timer.current = setTimeout(next, 1300)
  }
  const next = () => {
    clearTimeout(timer.current)
    setGame(g => {
      return { ...g, i: g.i + 1, fb: null, a: '', b: '', ok: new Set(), bad: new Set(), slips: 0 }
    })
  }

  const checkLight = e => {
    e.preventDefault()
    if (game.fb) return
    const a = +game.a, b = +game.b
    if (!a || !b) return
    const { r, c, p } = q
    const exact = (a === r && b === c) || (a === c && b === r)
    if (exact) { sound.say(`${r} כפול ${c} שווה ${p}`); settle(true, `נכון! ${r} × ${c} = ${p}`) }
    else if (a * b === p) { sound.say(`${r} כפול ${c} שווה ${p}`); settle(true, `גם ${a} × ${b} שווה ${p} — אבל המשבצת הזאת היא ${r} × ${c}. עין של בלש!`) }
    else settle(false, `${a} × ${b} = ${a * b}. המשבצת המוארת היא בשורה ${r} ובעמודה ${c}: ${r} × ${c} = ${p}`)
  }

  const tapHunt = (r, c) => {
    if (game.fb) return
    const k = key(r, c)
    if (r * c === q.p && ((r === q.r && c === q.c) || (r === q.c && c === q.r))) {
      sound.say(`${q.r} כפול ${q.c} שווה ${q.p}`)
      settle(true, `מצאת! ${q.r} × ${q.c} = ${q.p}`, { ok: new Set([k]) })
    } else {
      settle(false, `במשבצת הזאת: ${r} × ${c} = ${r * c}. המשבצת של ${q.r} × ${q.c} נמצאת בשורה ${q.r} ובעמודה ${q.c}.`, { bad: new Set([k]), ok: new Set([key(q.r, q.c)]) })
    }
  }

  const tapTwin = (r, c) => {
    if (game.fb) return
    const k = key(r, c)
    if (game.ok.has(k) || game.bad.has(k)) return
    if (r * c === q.p) {
      const ok = new Set(game.ok).add(k)
      if (ok.size === q.cells.length) {
        sound.say(`כל המשבצות של ${q.p}`)
        const clean = game.slips === 0
        settle(clean, clean ? `כל ${q.cells.length} המשבצות של ${q.p}! ${pairsText(q)}` : `מצאת את כולן, אבל עם ${game.slips} טעויות בדרך. ${pairsText(q)}`, { ok })
      } else setGame(g => ({ ...g, ok }))
    } else {
      const bad = new Set(game.bad).add(k)
      if (game.slips + 1 >= 3) settle(false, `שלוש טעויות — הנה כל המשבצות של ${q.p}: ${pairsText(q)}`, { bad, ok: new Set(q.cells.map(([a, b]) => key(a, b))), slips: game.slips + 1 })
      else setGame(g => ({ ...g, bad, slips: g.slips + 1 }))
    }
  }

  const meta = { title: 'משחק לוח הכפל: בלש המשבצות — מוצאים את התרגיל בטבלה', description: 'משחק לוח הכפל אונליין: משבצת נדלקת בטבלה וכותבים את התרגיל שלה, צדים את המשבצת של תרגיל, ומוצאים את כל המשבצות של אותו מספר. עד 5×5 או 10×10, בחינם.', path: DETECTIVE_PATH }

  return <div className="mx-auto max-w-4xl px-4 py-6 buga-fade-in" dir="rtl">
    <SEO title={meta.title} description={meta.description} path={meta.path} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, LEARN_CRUMB, { label: MT_PAGES.main.crumb, href: MT_PAGES.main.path }, { label: 'בלש המשבצות' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-1"><span aria-hidden="true">🔍 </span>בלש לוח הכפל</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">קוראים את הטבלה כמו בלשים: איזה תרגיל מסתתר במשבצת, ואיפה מסתתרת התשובה?</p>

    {!game && <Setup {...{ mode, setMode, size, setSize, hideHeads, setHideHeads, best }} onStart={start} />}

    {game && !finished && <>
      <div className="mt-bar flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="font-black">משימה {game.i + 1} מתוך {game.qs.length}</span>
        <span className="font-bold">✅ {game.score}{game.streak >= 3 && <> · 🔥 רצף {game.streak}</>}</span>
        <span className="flex gap-2">
          <button type="button" className="ln-chip" aria-pressed={sound.on} onClick={sound.toggle}>{sound.on ? '🔊' : '🔇'}<span className="sr-only">{sound.on ? 'הקראה פועלת' : 'הקראה כבויה'}</span></button>
          <button type="button" className="ln-chip" onClick={() => { clearTimeout(timer.current); setGame(null) }}>↩️ משימה אחרת</button>
        </span>
      </div>

      <div className="ln-box text-center mb-3" aria-live="polite">
        {game.mode === 'light' && <form onSubmit={checkLight}>
          <p className="font-bold mb-2">🔦 איזה תרגיל מסתתר במשבצת המוארת?</p>
          <div className="md-eq">
            <input ref={inputA} inputMode="numeric" maxLength={2} aria-label="המספר הראשון" value={game.a} disabled={!!game.fb} onChange={e => setGame(g => ({ ...g, a: e.target.value.replace(/\D/g, '') }))} />
            <span>×</span>
            <input inputMode="numeric" maxLength={2} aria-label="המספר השני" value={game.b} disabled={!!game.fb} onChange={e => setGame(g => ({ ...g, b: e.target.value.replace(/\D/g, '') }))} />
            <span>=</span><b>{q.p}</b>
          </div>
          {!game.fb && <button type="submit" className="ln-btn go mt-3">בדיקה ✔️</button>}
        </form>}
        {game.mode === 'hunt' && <p className="md-eq" dir="ltr"><span>{q.r} × {q.c} = ?</span></p>}
        {game.mode === 'hunt' && !game.fb && <p className="font-bold mt-1">🎯 נוגעים במשבצת של התשובה</p>}
        {game.mode === 'twins' && <>
          <p className="md-eq"><b>{q.p}</b></p>
          <p className="font-bold mt-1">👯 איפה מסתתר {q.p}? יש לו {q.cells.length} משבצות בטבלה · נמצאו {game.ok.size}{game.slips > 0 && <> · ❌ {game.slips} מתוך 3</>}</p>
        </>}
        {game.fb && <div className={`md-fb ${game.fb.good ? 'good' : 'bad'}`}>
          <p>{game.fb.good ? '🎉 ' : '🤔 '}{game.fb.msg}</p>
          <button type="button" className="ln-btn alt mt-2" onClick={next}>{game.i + 1 >= game.qs.length ? 'לתוצאות ←' : 'הבא ←'}</button>
        </div>}
      </div>

      <Board size={game.size} hideHeads={game.hideHeads}
        lit={game.mode === 'light' ? [q.r, q.c] : null}
        cross={game.mode === 'light' || (game.fb && game.mode === 'hunt') ? [q.r, q.c] : null}
        shown={new Set([...game.ok, ...game.bad])} ok={game.ok} bad={game.bad}
        onTap={game.mode === 'hunt' ? tapHunt : game.mode === 'twins' ? tapTwin : null} />
    </>}

    {finished && <div className="ln-box text-center">
      <p className="md-stars" aria-label={`${starsFor(game.score)} כוכבים`}>{'⭐'.repeat(starsFor(game.score)) || '🔍'}</p>
      <p className="text-2xl font-black">{game.score} מתוך {game.qs.length}</p>
      <p className="mb-3">{game.score === game.qs.length ? 'בלש אלוף! אף משבצת לא ברחה ממך.' : game.score >= 7 ? 'חקירה מצוינת! עוד סיבוב ותגיעו לשלמות.' : 'כל בלש מתחיל ככה. עוד סיבוב והטבלה תיראה מוכרת יותר.'}{game.top >= 3 && ` הרצף הכי ארוך: ${game.top}.`}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="ln-btn go" onClick={start}>🔁 עוד סיבוב</button>
        <button type="button" className="ln-btn alt" onClick={() => setGame(null)}>🔍 משימה אחרת</button>
      </div>
    </div>}

    <section className="mt-section">
      <h2>איך משחקים בבלש לוח הכפל?</h2>
      <div className="mt-tips">
        {MODES.map(m => <div key={m.id} className="mt-tip"><h3>{m.icon} {m.name}</h3><p>{HOW[m.id]}</p></div>)}
      </div>
      <div className="ln-box text-center mt-6">
        <p className="mb-3">רוצים קודם להציץ בטבלה המלאה, או לתרגל מול השעון?</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to={MT_PAGES.main.path} className="ln-btn alt inline-flex items-center">✖️ ללוח הכפל הצבעוני ←</Link>
          <Link to="/learn/times-tables" className="ln-btn go inline-flex items-center">⏱️ לאתגר הדקה ←</Link>
          <Link to="/learn/multiplication-game" className="ln-btn alt inline-flex items-center">🗺️ למסלול השלבים ←</Link>
        </div>
      </div>
    </section>

    <section className="mt-section">
      <h2>למה לקרוא את הטבלה ולא רק לשנן?</h2>
      <SeoBody paragraphs={[
        'ילדים רבים יודעים לדקלם "שלוש כפול שמונה עשרים וארבע", אבל מתבלבלים כשהם פוגשים את 24 בתוך הטבלה ולא יודעים מאיזה תרגיל הוא הגיע. במשחק הזה עובדים בכיוון ההפוך: רואים משבצת, מזהים את השורה ואת העמודה שלה, וכותבים את התרגיל. זו בדיוק המיומנות שצריך בחילוק — לדעת ש-24 הוא 3 פעמים 8.',
        'המשימה "המספר התאום" מלמדת שאותו מספר יכול להופיע בכמה מקומות: 12 נמצא ב-2×6, ב-3×4 ובהפוכים שלהם. ככה מגלים בעצמם את חוק החילוף ואת הפירוק לגורמים, בלי הסבר ארוך. ובמצב "בלי מספרים בצדדים" סופרים שורות ועמודות, וזה מחזק את התמצאות בטבלה.',
        'כל סיבוב הוא עשר משימות ונמשך כמה דקות, אז אפשר לשחק בתחילת שיעור, בהפסקה או בבית. אין הרשמה ואין איסוף פרטים — רק הכוכבים הכי טובים בכל משימה נשמרים במכשיר עצמו.',
      ]} faq={FAQ} related={[
        { label: MT_PAGES.main.h1, href: MT_PAGES.main.path },
        { label: 'אתגר הדקה בלוח הכפל', href: '/learn/times-tables' },
        { label: 'משחק לוח הכפל — מסלול השלבים', href: '/learn/multiplication-game' },
        { label: 'כרטיסיות לוח הכפל', href: '/learn/flashcards' },
        { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' },
      ]} />
    </section>
  </div>
}

const pairsText = q => q.cells.filter(([r, c]) => r <= c).map(([r, c]) => `${r}×${c}`).join(', ') + (q.cells.some(([r, c]) => r !== c) ? ' וגם ההפוכים' : '')

const HOW = {
  light: 'משבצת אחת בטבלה נדלקת בצהוב, והשורה והעמודה שלה נצבעות. רואים איזה מספר כתוב בה, עוקבים אחרי הקווים עד המספרים בצדדים, וכותבים את התרגיל: ? × ? = המספר.',
  hunt: 'למעלה מופיע תרגיל, למשל 7 × 6, והתשובות בטבלה מוסתרות. מוצאים את השורה של 7 ואת העמודה של 6 ונוגעים במשבצת שבה הן נפגשות. אפשר גם בשורה של 6 ובעמודה של 7 — זה אותו תרגיל.',
  twins: 'מופיע מספר, למשל 12, ונוגעים בכל המשבצות בטבלה שבהן הוא מסתתר. כתוב כמה משבצות יש לו, ומותר לטעות עד שלוש פעמים. סיבוב בלי טעויות בכלל שווה נקודה.',
}

const FAQ = [
  { q: 'מה עושים במשחק בלש לוח הכפל?', a: 'יש שלוש משימות. בפנס הבלש משבצת נדלקת וכותבים את התרגיל שלה. בצייד המשבצות מופיע תרגיל ונוגעים במשבצת של התשובה. במספר התאום מוצאים את כל המשבצות שבהן מופיע אותו מספר. כל סיבוב הוא 10 משימות, ובסוף מקבלים עד שלושה כוכבים.' },
  { q: 'לאיזה גיל מתאים המשחק?', a: 'לכיתות ב׳ עד ד׳, שבהן לומדים את לוח הכפל. לילדים שרק מתחילים יש טבלה קטנה עד 5×5, ולמי שכבר מכיר את הטבלה יש מצב "בלי מספרים בצדדים" שבו צריך לספור שורות ועמודות.' },
  { q: 'אם כתבתי 4 × 6 במשבצת של 3 × 8, זה נחשב?', a: 'כן. שני התרגילים שווים 24, אז התשובה נכונה מבחינת חשבון, והמשחק נותן עליה נקודה. הוא רק מראה שהמשבצת המוארת עצמה היא 3 × 8, כדי לתרגל קריאה של הטבלה.' },
  { q: 'צריך להירשם או להוריד משהו?', a: 'לא. המשחק עובד בחינם בדפדפן, בטלפון, בטאבלט ובמחשב. לא נאספים פרטים, ורק השיא בכל משימה נשמר במכשיר.' },
]
