// Natural ("textbook") rendering of a calculator expression: stacked fractions, raised powers,
// √ with a bar, a blinking cursor and click-to-place. Tolerant of half-typed input.
import { tokenize, FUNC_LABEL } from './calcEngine'

const CONST = { pi: 'π', e: 'e', ans: 'Ans', mem: 'M' }
const ROOTS = { sqrt: '', cbrt: '3' }

function buildTree(toks, len) {
  let i = 0
  function seq(stops) {
    const items = []
    while (i < toks.length) {
      const t = toks[i]
      if ((t.k === ')' || t.k === ';') && stops) return { items, end: t.s }
      i++
      if (t.k === '(' || (t.k === 'func' && t.open)) {
        const parts = []; let close = null
        for (;;) {
          parts.push(seq(true))
          const nt = toks[i]
          if (!nt) break
          i++
          if (nt.k === ')') { close = nt; break }
        }
        items.push({ type: 'group', open: t, parts, close })
      } else items.push({ type: 'tok', tok: t })
    }
    return { items, end: len }
  }
  return seq(false)
}
const startOf = it => (it.type === 'tok' ? it.tok.s : it.open.s)
const partStart = (g, k) => (k === 0 ? g.open.e : g.parts[k - 1].end + 1)

export default function MathView({ src, cursor = null, err = null, onPlace, className = '', empty = null }) {
  const toks = tokenize(src, { strict: false, vars: true })
  const tree = buildTree(toks, src.length)
  let placed = false
  let key = 0
  const k = () => key++
  const caret = () => { placed = true; return <span key={k()} className="mv-caret" aria-hidden="true" /> }
  const bad = (s, e) => err && s < err.e && e > err.s
  const click = pos => onPlace ? e => { e.stopPropagation(); onPlace(pos) } : undefined

  function renderSeq(sq, start) {
    const out = []
    if (!sq.items.length) {
      const here = cursor === start && !placed
      out.push(<span key={k()} className="mv-box" onClick={click(start)}>{here ? caret() : null}</span>)
      return out
    }
    for (let j = 0; j < sq.items.length; j++) {
      const it = sq.items[j]
      if (cursor !== null && !placed && cursor <= startOf(it) && cursor >= start) out.push(caret())
      if (it.type === 'tok' && it.tok.k === 'op' && it.tok.v === '^') {
        const next = sq.items[j + 1]
        if (cursor === it.tok.e && !placed && next) out.push(caret())
        let sup
        if (!next) sup = <span className="mv-box" />
        else if (next.type === 'group' && next.open.k === '(') sup = renderSeq(next.parts[0], next.open.e)
        else sup = renderItem(next)
        if (next?.type === 'group' && next.open.k === '(' && !next.close && cursor === src.length && !placed) sup = [sup, caret()]
        out.push(<sup key={k()} className={`mv-sup${bad(it.tok.s, it.tok.e) ? ' mv-bad' : ''}`} onClick={click(it.tok.e)}>{sup}</sup>)
        j++
        continue
      }
      out.push(renderItem(it))
    }
    if (cursor === sq.end && !placed && cursor !== null) out.push(caret())
    return out
  }

  function renderItem(it) {
    if (it.type === 'tok') {
      const t = it.tok
      const cls = bad(t.s, t.e) ? ' mv-bad' : ''
      if (t.k === 'num') {
        return <span key={k()} className={`mv-num${cls}`}>{[...t.v].map((c, n) => <span key={n} onClick={click(t.s + n + 1)}>{cursor === t.s + n && n > 0 && !placed ? caret() : null}{c}</span>)}</span>
      }
      let text = t.v
      let c = 'mv-tok'
      if (t.k === 'op') {
        if (t.v === '²' || t.v === '³' || t.v === '⁻¹') return <sup key={k()} className={`mv-sup${cls}`} onClick={click(t.e)}>{t.v === '²' ? '2' : t.v === '³' ? '3' : '−1'}</sup>
        if ('+−×÷'.includes(t.v)) c = 'mv-op'
        if (t.v === 'P' || t.v === 'C') c = 'mv-it'
      } else if (t.k === 'const') { text = CONST[t.v]; c = t.v === 'ans' || t.v === 'mem' ? 'mv-var' : 'mv-it' }
      else if (t.k === 'var') c = 'mv-it'
      else if (t.k === 'func') { text = FUNC_LABEL[t.v]; c = 'mv-fn' }
      else if (t.k === ')') c = 'mv-paren'
      return <span key={k()} className={`${c}${cls}`} onClick={click(t.e)}>{text}</span>
    }
    const g = it
    const f = g.open.k === 'func' ? g.open.v : null
    const cls = bad(g.open.s, g.open.e) || (g.close && bad(g.close.s, g.close.e)) ? ' mv-bad' : ''
    const part = n => (g.parts[n] ? renderSeq(g.parts[n], partStart(g, n)) : <span className="mv-box" />)
    const closeClick = click(g.close ? g.close.e : src.length)
    if (f === 'frac') {
      return <span key={k()} className={`mv-frac${cls}`}><span className="mv-fnum">{part(0)}</span><span className="mv-fden" onClick={closeClick}>{part(1)}</span></span>
    }
    if (f === 'sqrt' || f === 'cbrt' || f === 'root') {
      const idx = f === 'root' ? part(0) : ROOTS[f]
      return <span key={k()} className={`mv-root${cls}`}>
        {idx ? <sup className="mv-ridx">{idx}</sup> : null}
        <span className="mv-rsign" onClick={click(g.open.e)}>√</span>
        <span className="mv-rbody" onClick={closeClick}>{part(f === 'root' ? 1 : 0)}</span>
      </span>
    }
    if (f === 'abs') return <span key={k()} className={`mv-abs${cls}`}><span onClick={click(g.open.e)}>|</span>{part(0)}<span onClick={closeClick}>|</span></span>
    return <span key={k()} className={`mv-grp${cls}`}>
      {f ? <span className="mv-fn" onClick={click(g.open.e)}>{FUNC_LABEL[f]}</span> : null}
      <span className="mv-paren" onClick={click(g.open.e)}>(</span>
      {g.parts.map((p, n) => <span key={n}>{n ? <span className="mv-paren">;</span> : null}{renderSeq(p, partStart(g, n))}</span>)}
      <span className={g.close ? 'mv-paren' : 'mv-paren mv-ghost'} onClick={closeClick}>)</span>
    </span>
  }

  const body = src ? renderSeq(tree, 0) : [cursor !== null ? caret() : null, empty]
  return <span className={`mv ${className}`} dir="ltr">{body}</span>
}

/** sign·num·√rad·π / den, drawn as a real fraction. */
export function ExactView({ x }) {
  const top = <>{x.num === 1 && (x.rad > 1 || x.pi) ? '' : x.num}{x.rad > 1 ? <span className="mv-root"><span className="mv-rsign">√</span><span className="mv-rbody">{x.rad}</span></span> : null}{x.pi ? <span className="mv-it">π</span> : null}</>
  return <span className="mv" dir="ltr">{x.sign < 0 && x.num !== 0 ? '−' : ''}{x.den > 1 ? <span className="mv-frac"><span className="mv-fnum">{top}</span><span className="mv-fden">{x.den}</span></span> : top}</span>
}

/** a b/c drawn as a whole number beside a small fraction. */
export function MixedView({ x }) {
  const w = Math.floor(x.num / x.den)
  return <span className="mv" dir="ltr">{x.sign < 0 ? '−' : ''}{w}<span className="mv-frac"><span className="mv-fnum">{x.num % x.den}</span><span className="mv-fden">{x.den}</span></span></span>
}
