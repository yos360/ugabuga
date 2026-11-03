// The main scientific calculator: natural display with a cursor, exact ⇄ decimal results,
// memory, ANS, a persistent history tape and a step-by-step "how did we get here".
import { useEffect, useMemo, useRef, useState } from 'react'
import MathView, { ExactView, MixedView } from './MathView'
import {
  evaluate, explain, exactForm, exactText, exactSource, isNiceExact, formatDecimal, plainNumber,
  moveCursor, deleteBefore, insertAt, tokenize,
} from './calcEngine'

const STORE = 'ugabuga-calc-v1'
const MAX_HISTORY = 100

// what each key inserts: [text, caret offset inside it]; cont = continues from Ans after "="
const K = {
  frac: { ins: ['frac(;)', 5], label: <span className="sc-fr"><span>▭</span><span>▭</span></span>, title: 'שבר — מונה ומכנה (מקש f)' },
  sqrt: { ins: ['√()', 2], label: '√▭', title: 'שורש ריבועי (מקש r)' },
  sq: { ins: ['²', 1], cont: true, label: <>x<sup>2</sup></>, title: 'בריבוע (מקש q)' },
  pow: { ins: ['^()', 2], cont: true, label: <>x<sup>▭</sup></>, title: 'חזקה (מקש ^)' },
  inv: { ins: ['⁻¹', 2], cont: true, label: <>x<sup>−1</sup></>, title: 'הופכי 1/x' },
  sin: { ins: ['sin()', 4], label: 'sin', title: 'סינוס (מקש s)' },
  cos: { ins: ['cos()', 4], label: 'cos', title: 'קוסינוס (מקש c)' },
  tan: { ins: ['tan()', 4], label: 'tan', title: 'טנגנס (מקש t)' },
  log: { ins: ['log()', 4], label: 'log', title: 'לוגריתם בבסיס 10 (מקש l)' },
  ln: { ins: ['ln()', 3], label: 'ln', title: 'לוגריתם טבעי (מקש n)' },
  asin: { ins: ['sin⁻¹()', 6], label: <>sin<sup>−1</sup></>, title: 'ארקסינוס — הזווית שהסינוס שלה…' },
  acos: { ins: ['cos⁻¹()', 6], label: <>cos<sup>−1</sup></>, title: 'ארקקוסינוס' },
  atan: { ins: ['tan⁻¹()', 6], label: <>tan<sup>−1</sup></>, title: 'ארקטנגנס' },
  tenx: { ins: ['10^()', 4], label: <>10<sup>x</sup></>, title: 'עשר בחזקת' },
  ex: { ins: ['e^()', 3], label: <>e<sup>x</sup></>, title: 'e בחזקת' },
  lp: { ins: ['(', 1], label: '(', title: 'סוגר פותח (מקש ( )' },
  rp: { ins: [')', 1], cont: true, label: ')', title: 'סוגר סוגר (מקש ) )' },
  pi: { ins: ['π', 1], label: 'π', title: 'פאי (מקש p)' },
  e: { ins: ['e', 1], label: 'e', title: 'המספר e (מקש e)' },
  fact: { ins: ['!', 1], cont: true, label: 'n!', title: 'עצרת (מקש !)' },
  cbrt: { ins: ['∛()', 2], label: '∛▭', title: 'שורש שלישי' },
  abs: { ins: ['abs()', 4], label: '|x|', title: 'ערך מוחלט (מקש |)' },
  npr: { ins: ['P', 1], cont: true, label: <><i>n</i>P<i>r</i></>, title: 'תמורות: 5P2 = 20' },
  ncr: { ins: ['C', 1], cont: true, label: <><i>n</i>C<i>r</i></>, title: 'צירופים: 5C2 = 10' },
  pct: { ins: ['%', 1], cont: true, label: '%', title: 'אחוז: 200+10% = 220 (מקש %)' },
  cube: { ins: ['³', 1], cont: true, label: <>x<sup>3</sup></>, title: 'בחזקת שלוש' },
  nroot: { ins: ['root(;)', 5], label: <><sup>n</sup>√▭</>, title: 'שורש מסדר n' },
  ans: { ins: ['Ans', 3], label: 'Ans', title: 'התוצאה הקודמת (מקש a)' },
  plus: { ins: ['+', 1], cont: true, label: '+', title: 'חיבור (+)' },
  minus: { ins: ['−', 1], cont: true, label: '−', title: 'חיסור (-)' },
  times: { ins: ['×', 1], cont: true, label: '×', title: 'כפל (* או x)' },
  divide: { ins: ['÷', 1], cont: true, label: '÷', title: 'חילוק (/)' },
  dot: { ins: ['.', 1], label: '.', title: 'נקודה עשרונית' },
}
for (const d of '0123456789') K[d] = { ins: [d, 1], label: d, title: `ספרה ${d}` }

const SCI = ['frac', 'sqrt', 'sq', 'pow', 'inv', 'sin', 'cos', 'tan', 'log', 'ln', 'asin', 'acos', 'atan', 'tenx', 'ex', 'lp', 'rp', 'pi', 'e', 'fact', 'cbrt', 'abs', 'npr', 'ncr', 'pct']
const EXTRA = ['cube', 'nroot', 'ran']
const MAIN = ['7', '8', '9', 'del', 'ac', '4', '5', '6', 'times', 'divide', '1', '2', '3', 'plus', 'minus', '0', 'dot', 'neg', 'ans', 'eq']

const KEYMAP = {
  '*': 'times', x: 'times', X: 'times', '/': 'divide', ':': 'divide', '+': 'plus', '-': 'minus', '.': 'dot', ',': 'dot',
  '(': 'lp', ')': 'rp', '^': 'pow', '!': 'fact', '%': 'pct', s: 'sin', c: 'cos', t: 'tan', l: 'log', n: 'ln',
  r: 'sqrt', p: 'pi', e: 'e', a: 'ans', f: 'frac', q: 'sq', '|': 'abs',
}

function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || 'null')
    if (s && typeof s === 'object') return s
  } catch { /* blocked storage */ }
  return null
}

function signToggle(src, cur) {
  // flip the sign of the number just before the cursor
  const toks = tokenize(src, { strict: false })
  const num = toks.filter(t => t.e <= cur && t.e >= cur - 0).pop() || toks.find(t => t.s < cur && t.e >= cur)
  if (!num || num.k !== 'num') return null
  const idx = toks.indexOf(num)
  const prev = toks[idx - 1]
  const before = toks[idx - 2]
  const unaryPos = !before || before.k === '(' || before.k === ';' || before.k === 'func' || (before.k === 'op' && !['!', '%', '²', '³', '⁻¹'].includes(before.v))
  if (prev && prev.k === 'op' && prev.v === '−') {
    if (unaryPos) return { src: src.slice(0, prev.s) + src.slice(prev.e), cur: cur - 1 }
    return { src: src.slice(0, prev.s) + '+' + src.slice(prev.e), cur }
  }
  if (prev && prev.k === 'op' && prev.v === '+' && !unaryPos) return { src: src.slice(0, prev.s) + '−' + src.slice(prev.e), cur }
  return { src: src.slice(0, num.s) + '−' + src.slice(num.s), cur: cur + 1 }
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch { /* fall back */ }
  try {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select()
    const ok = document.execCommand('copy'); ta.remove(); return ok
  } catch { return false }
}

// `t` translates a Hebrew UI string; the English page (/en/tools/calculator) passes its own, Hebrew leaves it as is.
const same = s => s
export default function Calculator({ active = true, t = same }) {
  const [src, setSrc] = useState('')
  const [cur, setCur] = useState(0)
  const [done, setDone] = useState(false) // the shown result belongs to src
  const [shown, setShown] = useState(null) // { value, src } | { error, s, e }
  const [view, setView] = useState('auto') // auto | exact | dec | mixed
  const [angle, setAngle] = useState('deg')
  const [mem, setMem] = useState(0)
  const [ans, setAns] = useState(0)
  const [history, setHistory] = useState([])
  const [steps, setSteps] = useState(null)
  const [toast, setToast] = useState('')
  const loaded = useRef(false)
  const dispRef = useRef(null)

  useEffect(() => {
    const s = loadStore()
    if (s) {
      if (Array.isArray(s.history)) setHistory(s.history.slice(0, MAX_HISTORY))
      if (Number.isFinite(s.mem)) setMem(s.mem)
      if (Number.isFinite(s.ans)) setAns(s.ans)
      if (s.angle === 'rad' || s.angle === 'deg') setAngle(s.angle)
    }
    loaded.current = true
  }, [])
  useEffect(() => {
    if (!loaded.current) return
    try { localStorage.setItem(STORE, JSON.stringify({ history, mem, ans, angle })) } catch { /* private mode */ }
  }, [history, mem, ans, angle])

  const ctx = useMemo(() => ({ angle, ans, mem }), [angle, ans, mem])
  const preview = useMemo(() => (done || !src ? null : evaluate(src, ctx)), [src, ctx, done])
  const flash = msg => { setToast(msg); setTimeout(() => setToast(''), 1600) }

  // Latest editor state, updated synchronously so fast typing never reads a stale value.
  const S = useRef({ src: '', cur: 0, done: false, shown: null })
  S.current.ctx = ctx
  const put = patch => {
    Object.assign(S.current, patch)
    if ('src' in patch) setSrc(patch.src)
    if ('cur' in patch) setCur(patch.cur)
    if ('done' in patch) setDone(patch.done)
    if ('shown' in patch) setShown(patch.shown)
  }
  const edit = (nextSrc, nextCur) => {
    put({ src: nextSrc, cur: nextCur, done: false, shown: S.current.shown?.error ? null : S.current.shown })
    setSteps(null)
  }
  const insert = key => {
    const [text, caret] = key.ins
    let { src: s, cur: c } = S.current
    if (S.current.done) { s = key.cont ? 'Ans' : ''; c = s.length }
    let t = text; let off = caret
    if (/^\d/.test(t) && t.length > 1 && /[\d.]$/.test(s.slice(0, c))) { t = '×' + t; off++ }
    const r = insertAt(s, c, t, off)
    edit(r.src, r.cur)
  }
  const equals = () => {
    const { src: s, ctx: cx } = S.current
    if (!s.trim()) return
    const r = evaluate(s, cx)
    if (r.ok) {
      const v = r.value
      put({ shown: { value: v, src: s }, done: true })
      S.current.ctx = { ...cx, ans: v }
      setAns(v); setView('auto'); setSteps(null)
      setHistory(h => [{ id: Date.now(), src: s, value: v, angle: cx.angle }, ...h.filter(x => !(x.src === s && x.value === v))].slice(0, MAX_HISTORY))
    } else if (!r.empty) {
      put({ shown: { error: r.error, s: r.s, e: r.e }, cur: Math.min(s.length, Math.max(0, r.e)), done: false })
    }
  }
  const currentValue = () => {
    const { done: d, shown: sh, src: s, ctx: cx } = S.current
    if (d && sh && !sh.error) return sh.value
    const r = evaluate(s, cx)
    return r.ok ? r.value : null
  }

  const action = id => {
    const { src: s, cur: c, done: d } = S.current
    if (id === 'eq') return equals()
    if (id === 'ac') { put({ src: '', cur: 0, done: false, shown: null }); setSteps(null); return }
    if (id === 'del') {
      if (d) { put({ done: false, shown: null, cur: s.length }); return }
      const r = deleteBefore(s, c); edit(r.src, r.cur); return
    }
    if (id === 'left' || id === 'right') { put({ done: false, cur: moveCursor(s, d ? s.length : c, id === 'left' ? -1 : 1) }); return }
    if (id === 'neg') {
      if (d || !s) { edit('−' + (d ? 'Ans' : ''), d ? 4 : 1); return }
      const r = signToggle(s, c)
      if (r) edit(r.src, r.cur); else { const x = insertAt(s, c, '−'); edit(x.src, x.cur) }
      return
    }
    if (id === 'ran') { const t = String(Math.floor(Math.random() * 1000) / 1000); insert({ ins: [t, t.length] }); return }
    if (id === 'mc') { setMem(0); flash(t('הזיכרון נוקה')); return }
    if (id === 'mr') { insert({ ins: ['M', 1] }); return }
    if (id === 'mplus' || id === 'mminus') {
      const v = currentValue()
      if (v === null) { flash(t('אין תוצאה להוסיף לזיכרון')); return }
      setMem(m => Number((id === 'mplus' ? m + v : m - v).toPrecision(15)))
      if (!d && s) equals()
      flash(t(id === 'mplus' ? 'נוסף לזיכרון (M+)' : 'הופחת מהזיכרון (M−)'))
      return
    }
    if (K[id]) insert(K[id])
  }
  const actionRef = useRef(action)
  actionRef.current = action
  const histRef = useRef(history)
  histRef.current = history

  // physical keyboard
  useEffect(() => {
    if (!active) return undefined
    const onKey = e => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      let id = null
      if (/^[0-9]$/.test(e.key)) id = e.key
      else if (e.key === 'Enter' || e.key === '=') id = 'eq'
      else if (e.key === 'Backspace') id = 'del'
      else if (e.key === 'Escape' || e.key === 'Delete') id = 'ac'
      else if (e.key === 'ArrowLeft') id = 'left'
      else if (e.key === 'ArrowRight') id = 'right'
      else if (e.key === 'ArrowUp' && histRef.current[0]) { e.preventDefault(); const h = histRef.current[0]; actionRef.current('ac'); put({ src: h.src, cur: h.src.length }); return }
      else if (KEYMAP[e.key]) id = KEYMAP[e.key]
      if (!id) return
      if (e.key === 'Enter' && tag === 'BUTTON') return // let the focused button act once
      e.preventDefault()
      actionRef.current(id)
    }
    const onPaste = e => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const text = (e.clipboardData?.getData('text') || '').replace(/[\r\n]+/g, ' ').trim()
      if (!text) return
      e.preventDefault()
      const { src: s, cur: c, done: d } = S.current
      const r = insertAt(d ? '' : s, d ? 0 : c, text.replace(/\*\*/g, '^'))
      put({ src: r.src, cur: r.cur, done: false, shown: null })
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('paste', onPaste)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('paste', onPaste) }
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps -- reads the latest state through refs

  // result presentation
  const value = shown && !shown.error ? shown.value : null
  const ex = value !== null ? exactForm(value) : null
  const nice = isNiceExact(ex)
  const canMixed = nice && ex.rad === 1 && !ex.pi && ex.num > ex.den
  const mode = view === 'auto' ? (nice && !/\./.test(shown?.src || '') ? 'exact' : 'dec') : view
  const dec = value !== null ? formatDecimal(value) : null
  const resultText = value === null ? '' : mode === 'exact' && nice ? exactText(ex) : mode === 'mixed' && canMixed ? exactText(ex, { mixed: true }) : dec.text.replace('…', '')

  const toggleSD = () => setView(mode === 'dec' ? (nice ? 'exact' : 'dec') : 'dec')
  const toggleMixed = () => setView(mode === 'mixed' ? 'exact' : 'mixed')
  const showSteps = () => setSteps(s => (s ? null : explain(shown?.src ?? src, ctx)))

  const insertValue = v => {
    const x = exactForm(v)
    insert({ ins: [isNiceExact(x) ? exactSource(x) : plainNumber(v), (isNiceExact(x) ? exactSource(x) : plainNumber(v)).length] })
  }

  const keyBtn = (id, extraCls = '') => {
    const special = {
      del: { label: '⌫', title: 'מחיקה (Backspace)', cls: 'sc-k-del' },
      ac: { label: 'AC', title: 'ניקוי הכול (Esc)', cls: 'sc-k-ac' },
      eq: { label: '=', title: 'חישוב (Enter)', cls: 'sc-k-eq' },
      neg: { label: '±', title: 'החלפת סימן למספר האחרון', cls: '' },
      ran: { label: 'Ran#', title: 'מספר אקראי בין 0 ל־1', cls: '' },
    }[id]
    const k = special || K[id]
    const cls = special ? special.cls : /^\d$/.test(id) || id === 'dot' ? 'sc-k-num' : ['plus', 'minus', 'times', 'divide'].includes(id) ? 'sc-k-op' : id === 'ans' ? 'sc-k-word' : ''
    return <button key={id} type="button" className={`sc-key ${cls} ${extraCls}`} title={t(k.title)} aria-label={typeof k.label === 'string' ? undefined : t(k.title)} onClick={() => action(id)}>{k.label}</button>
  }

  const dirAttr = t === same ? 'rtl' : 'ltr'
  const recent = history.slice(0, 3)
  const err = shown?.error ? shown : null

  return <div className="sc-wrap">
    <div className="sc-calc" data-keep-colors="">
      <div className="sc-top">
        <button type="button" className="sc-pill" onClick={() => setAngle(a => (a === 'deg' ? 'rad' : 'deg'))} title={t('מעלות או רדיאנים — בבית הספר משתמשים במעלות')} aria-label={t(`יחידת זווית: ${angle === 'deg' ? 'מעלות' : 'רדיאנים'}. לחצו להחלפה`)}>
          <b className={angle === 'deg' ? 'on' : ''}>DEG</b><b className={angle === 'rad' ? 'on' : ''}>RAD</b>
        </button>
        <span className="sc-ind">{mem !== 0 && <span title={t(`בזיכרון: ${formatDecimal(mem).text}`)}>M</span>}</span>
        <button type="button" className="sc-pill sc-nav" onClick={() => action('left')} title={t('הזזת הסמן שמאלה (←)')} aria-label={t('הזזת הסמן שמאלה')}>◀</button>
        <button type="button" className="sc-pill sc-nav" onClick={() => action('right')} title={t('הזזת הסמן ימינה (→)')} aria-label={t('הזזת הסמן ימינה')}>▶</button>
      </div>

      <div className={`sc-display${err ? ' sc-has-err' : ''}`} ref={dispRef} dir="ltr" tabIndex={0} aria-label={t('תצוגת המחשבון')} onClick={() => { if (S.current.done) put({ done: false, cur: S.current.src.length }) }}>
        <div className="sc-expr">
          <MathView src={src} cursor={done ? null : cur} err={err} onPlace={p => put({ done: false, cur: p })} empty={<span className="sc-hint">0</span>} />
        </div>
        <div className="sc-result" aria-live="polite">
          {err ? <span className="sc-err" dir={t === same ? 'rtl' : 'ltr'}>⚠ {t(err.error)}</span>
            : value !== null ? <>
              <span className="sc-eq">=</span>
              <span className="sc-main">{mode === 'exact' && nice ? <ExactView x={ex} /> : mode === 'mixed' && canMixed ? <MixedView x={ex} /> : dec.text}</span>
            </>
              : preview?.ok ? <span className="sc-preview">= {formatDecimal(preview.value).text}</span> : null}
        </div>
        {value !== null && nice && <div className="sc-alt">{mode === 'dec' ? <>= {exactText(ex)}</> : <>≈ {dec.text}</>}</div>}
      </div>

      {value !== null && <div className="sc-actions" dir={dirAttr}>
        {nice && <button type="button" className="sc-pill" onClick={toggleSD} title={t('מעבר בין תשובה מדויקת (שבר, שורש, π) לעשרונית')}>S⇔D</button>}
        {canMixed && <button type="button" className="sc-pill" onClick={toggleMixed} title={t('שבר מעורב: 7/4 = 1¾')}>a b/c</button>}
        <button type="button" className="sc-pill" onClick={async () => flash(t(await copyText(resultText) ? 'התוצאה הועתקה' : 'לא הצלחנו להעתיק'))}>{t('📋 העתקה')}</button>
        <button type="button" className="sc-pill sc-why" onClick={showSteps} aria-expanded={!!steps}>{t('🤔 איך הגענו לזה?')}</button>
      </div>}
      {err && <div className="sc-actions" dir={dirAttr}><button type="button" className="sc-pill" onClick={() => { const r = explain(src, ctx); setSteps(r) }}>{t('🤔 מה לא בסדר?')}</button></div>}

      {steps && <ol className="sc-steps" dir={dirAttr}>
        {steps.steps?.length === 0 && !steps.error && <li>{t('המספר הזה כבר מחושב — אין שלבים.')}</li>}
        {steps.steps?.map((s, i) => <li key={i}>
          <div className="sc-step-label">{s.inParens ? t('קודם הסוגריים · ') : ''}{t(s.label)}</div>
          <div className="sc-step-calc" dir="ltr">{s.before} = <b>{s.result}</b></div>
          {s.expr !== s.result && <div className="sc-step-expr" dir="ltr">← {s.expr}</div>}
        </li>)}
        {steps.error && <li className="sc-step-err">⚠ {t(steps.error)}</li>}
      </ol>}

      {(recent.length > 0 || ans !== 0) && <div className="sc-chips" aria-label={t('תוצאות קודמות')}>
        <button type="button" className="sc-chip" onClick={() => action('ans')} title={t('Ans — התוצאה האחרונה')}>Ans = {formatDecimal(ans).text}</button>
        {recent.slice(1).map(h => <button key={h.id} type="button" className="sc-chip" onClick={() => insertValue(h.value)} title={t('הכנסת התוצאה לתרגיל')}>{(() => { const x = exactForm(h.value); return isNiceExact(x) ? exactText(x) : formatDecimal(h.value).text })()}</button>)}
      </div>}

      <div className="sc-mem">
        {[['mc', 'MC', 'ניקוי הזיכרון'], ['mr', 'MR', 'הכנסת הערך שבזיכרון (M)'], ['mplus', 'M+', 'הוספת התוצאה לזיכרון'], ['mminus', 'M−', 'הפחתת התוצאה מהזיכרון']].map(([id, l, ttl]) =>
          <button key={id} type="button" className="sc-key sc-k-mem" title={t(ttl)} onClick={() => action(id)}>{l}</button>)}
      </div>
      <div className="sc-keys">
        <div className="sc-sci">{SCI.map(id => keyBtn(id))}{EXTRA.map(id => keyBtn(id, 'sc-extra'))}</div>
        <div className="sc-mainkeys">{MAIN.map(id => keyBtn(id))}</div>
      </div>
      {toast && <div className="sc-toast" role="status" dir={dirAttr}>{toast}</div>}
    </div>

    <aside className="sc-side" aria-label={t('היסטוריה')}>
      <div className="sc-side-head">
        <h2>{t('📜 היסטוריה')}</h2>
        {history.length > 0 && <button type="button" className="sc-link" onClick={() => setHistory([])}>{t('ניקוי')}</button>}
      </div>
      {history.length === 0 ? <p className="sc-empty">{t('כאן יופיעו התרגילים שחישבתם. הם נשמרים בדפדפן הזה בלבד.')}</p>
        : <ul className="sc-tape">{history.map(h => {
          const x = exactForm(h.value)
          const txt = isNiceExact(x) ? `${exactText(x)} ≈ ${formatDecimal(h.value).text}` : formatDecimal(h.value).text
          return <li key={h.id}>
            <button type="button" className="sc-tape-expr" onClick={() => edit(h.src, h.src.length)} title={t('לעריכת התרגיל')}><MathView src={h.src} /></button>
            <div className="sc-tape-row">
              <button type="button" className="sc-tape-val" onClick={() => insertValue(h.value)} title={t('הכנסת התוצאה לתרגיל')} dir="ltr">= {txt}</button>
              {h.angle === 'rad' && /sin|cos|tan/.test(h.src) && <span className="sc-tag">RAD</span>}
              <button type="button" className="sc-icon" onClick={async () => flash(t(await copyText(`${h.src} = ${txt}`) ? 'השורה הועתקה' : 'לא הצלחנו להעתיק'))} aria-label={t('העתקת השורה')} title={t('העתקה')}>📋</button>
            </div>
          </li>
        })}</ul>}
      <details className="sc-help">
        <summary>{t('⌨️ קיצורי מקלדת')}</summary>
        <p dir={dirAttr}>{t('ספרות ו־+ - * / ^ ( ) ! % · Enter לחישוב · Backspace למחיקה · Esc לניקוי · חצים להזזת הסמן · ↑ לתרגיל הקודם · s c t לסינוס, קוסינוס, טנגנס · l ל־log · n ל־ln · r לשורש · q לריבוע · f לשבר · p ל־π · a ל־Ans. אפשר גם להדביק תרגיל (Ctrl+V).')}</p>
      </details>
    </aside>
  </div>
}
