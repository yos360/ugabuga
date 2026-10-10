import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Piece, { PIECE_NAMES } from './Pieces'

// Interactive board: tap a piece then a square, or drag it. Shows legal moves, last move,
// check and an optional hint, and asks which piece to promote to.
// `movable`: which colour the viewer may move ('w' | 'b' | 'both' | null).
const FILES = 'abcdefgh'
const COLOR_NAME = { w: 'לבן', b: 'שחור' }

export default function ChessBoard({ fen, orientation = 'w', movable = 'both', onMove, lastMove, hint, highlight = [], small = false, label = 'לוח שחמט' }) {
  const game = useMemo(() => new Chess(fen), [fen])
  const turn = game.turn()
  const canMove = movable === 'both' || movable === turn
  const legal = useMemo(() => (canMove ? game.moves({ verbose: true }) : []), [game, canMove])
  const [sel, setSel] = useState(null)
  const [drag, setDrag] = useState(null) // { from, x, y } while a piece follows the pointer
  const [promo, setPromo] = useState(null) // { from, to } waiting for a piece choice
  const boardRef = useRef(null)
  const press = useRef(null)
  useEffect(() => { setSel(null); setPromo(null); setDrag(null) }, [fen])

  const targetsFrom = from => new Set(legal.filter(m => m.from === from).map(m => m.to))
  const targets = sel ? targetsFrom(sel) : new Set()
  const captureTargets = new Set(sel ? legal.filter(m => m.from === sel && m.captured).map(m => m.to) : [])
  const checkSq = game.inCheck() ? game.board().flat().find(p => p && p.type === 'k' && p.color === turn)?.square : null

  const squareAt = (x, y) => {
    const r = boardRef.current?.getBoundingClientRect()
    if (!r) return null
    const col = Math.floor(((x - r.left) / r.width) * 8), row = Math.floor(((y - r.top) / r.height) * 8)
    if (col < 0 || col > 7 || row < 0 || row > 7) return null
    return orientation === 'w' ? FILES[col] + (8 - row) : FILES[7 - col] + (row + 1)
  }
  const mine = sq => { const p = game.get(sq); return p && p.color === turn && legal.some(m => m.from === sq) }

  const tryMove = (from, to) => {
    const options = legal.filter(m => m.from === from && m.to === to)
    if (!options.length) return false
    if (options.some(m => m.promotion)) { setPromo({ from, to }); return true }
    setSel(null)
    onMove?.({ from, to })
    return true
  }

  const tap = sq => {
    if (promo) return
    if (sel && targets.has(sq)) { tryMove(sel, sq); return }
    if (mine(sq)) setSel(sq === sel ? null : sq)
    else setSel(null)
  }

  const onPointerDown = e => {
    if (promo || e.button > 0) return
    const sq = squareAt(e.clientX, e.clientY)
    if (!sq) return
    if (mine(sq)) {
      press.current = { from: sq, x0: e.clientX, y0: e.clientY, moved: false, wasSel: sel === sq }
      setSel(sq)
      try { boardRef.current.setPointerCapture(e.pointerId) } catch { /* not supported */ }
    } else {
      press.current = null
      tap(sq)
    }
  }
  const onPointerMove = e => {
    const p = press.current
    if (!p) return
    if (!p.moved && Math.hypot(e.clientX - p.x0, e.clientY - p.y0) < 6) return
    p.moved = true
    const r = boardRef.current.getBoundingClientRect()
    setDrag({ from: p.from, x: e.clientX - r.left, y: e.clientY - r.top, size: r.width / 8 })
  }
  const onPointerUp = e => {
    const p = press.current
    press.current = null
    setDrag(null)
    if (!p) return
    const to = squareAt(e.clientX, e.clientY)
    if (p.moved) { if (to && to !== p.from) tryMove(p.from, to); return }
    if (p.wasSel) setSel(null) // second tap on a selected piece lets go of it
  }

  const squares = []
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
    const sq = orientation === 'w' ? FILES[col] + (8 - row) : FILES[7 - col] + (row + 1)
    const p = game.get(sq)
    const dark = (FILES.indexOf(sq[0]) + Number(sq[1])) % 2 === 1 // a1 is dark
    const cls = ['cz-sq', dark ? 'is-dark' : 'is-light',
      lastMove && (lastMove.from === sq || lastMove.to === sq) ? 'is-last' : '',
      sel === sq ? 'is-sel' : '', checkSq === sq ? 'is-check' : '',
      hint && (hint.from === sq || hint.to === sq) ? 'is-hint' : '',
      highlight.includes(sq) ? 'is-mark' : ''].filter(Boolean).join(' ')
    squares.push(
      <button key={sq} type="button" className={cls} tabIndex={canMove ? 0 : -1}
        onClick={e => { if (e.detail === 0) tap(sq) }}
        aria-label={`${sq}${p ? ` – ${PIECE_NAMES[p.type]} ${COLOR_NAME[p.color]}` : ''}${targets.has(sq) ? ' – אפשר לזוז לכאן' : ''}`}>
        {p && <span className={`cz-piece${drag?.from === sq ? ' is-lifted' : ''}${mine(sq) ? ' is-mine' : ''}`}><Piece type={p.type} color={p.color} /></span>}
        {targets.has(sq) && <span className={captureTargets.has(sq) ? 'cz-ring' : 'cz-dot'} aria-hidden="true" />}
        {!small && col === 0 && <small className="cz-rank" aria-hidden="true">{sq[1]}</small>}
        {!small && row === 7 && <small className="cz-file" aria-hidden="true">{sq[0]}</small>}
      </button>
    )
  }
  const dragPiece = drag && game.get(drag.from)

  return (
    <div className={`cz-board-wrap${small ? ' is-small' : ''}`}>
      <div ref={boardRef} className="cz-board" dir="ltr" role="group" aria-label={label}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => { press.current = null; setDrag(null) }}>
        {squares}
        {dragPiece && <span className="cz-ghost" style={{ width: drag.size, height: drag.size, transform: `translate(${drag.x - drag.size / 2}px, ${drag.y - drag.size / 2}px)` }} aria-hidden="true"><Piece type={dragPiece.type} color={dragPiece.color} /></span>}
        {promo && (
          <div className="cz-promo" dir="rtl" role="dialog" aria-label="לאיזה כלי להפוך את הרגלי?">
            <p>לאיזה כלי הרגלי יהפוך?</p>
            <div>
              {['q', 'r', 'b', 'n'].map(t => (
                <button key={t} type="button" onClick={() => { const m = { ...promo, promotion: t }; setPromo(null); setSel(null); onMove?.(m) }} aria-label={PIECE_NAMES[t]}>
                  <Piece type={t} color={turn} /><span>{PIECE_NAMES[t]}</span>
                </button>
              ))}
            </div>
            <button type="button" className="cz-promo-cancel" onClick={() => setPromo(null)}>ביטול</button>
          </div>
        )}
      </div>
    </div>
  )
}
