import { useEffect, useRef, useState } from 'react'
import { N, emptyBoard, canPlace, place, fitsAnywhere, dealPieces, shapeSize } from '../logic/blocks'
import { rng } from '../logic/rng'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

const PAD = 5, GAP = 3

export default function BlockParty({ onReport, onShare, daily }) {
  const [progress, saveProgress] = useProgress('block-puzzle', { best: 0 })
  const [board, setBoard] = useState(emptyBoard)
  // the daily challenge deals the same shapes to everyone
  const [rand, setRand] = useState(() => (daily ? rng(daily.seed) : Math.random))
  const [pieces, setPieces] = useState(() => dealPieces(rand))
  const [score, setScore] = useState(0)
  const [sel, setSel] = useState(null)
  const [drag, setDrag] = useState(null)
  const [clearing, setClearing] = useState(null)
  const [over, setOver] = useState(false)
  const [boxRef, box] = useBox()
  const boardRef = useRef(null)
  const dragRef = useRef(null)
  const clearSeq = useRef(0)

  const size = Math.max(240, Math.min(box.w - 16, (box.h - 16) / 1.36, 540))
  const cell = (size - PAD * 2 - 6 - GAP * (N - 1)) / N
  const mini = Math.min(cell * 0.52, 26)

  // Where would the dragged piece land? (top-left board cell, from the floating piece position)
  const ghostFor = (piece, x, y, lift) => {
    const r = boardRef.current?.getBoundingClientRect()
    if (!r) return null
    const [w, h] = shapeSize(piece.cells)
    const left = x - (w * (cell + GAP)) / 2, topY = y - lift - (h * (cell + GAP)) / 2
    const gx = Math.round((left - r.left - 3 - PAD) / (cell + GAP))
    const gy = Math.round((topY - r.top - 3 - PAD) / (cell + GAP))
    return { gx, gy, ok: canPlace(board, piece.cells, gx, gy), left, top: topY }
  }

  const commit = (i, gx, gy) => {
    const piece = pieces[i]
    if (!piece || !canPlace(board, piece.cells, gx, gy)) return false
    const res = place(board, piece, gx, gy)
    let nextPieces = pieces.map((p, k) => (k === i ? null : p))
    if (nextPieces.every(p => !p)) nextPieces = dealPieces(rand, res.board)
    setBoard(res.board)
    setPieces(nextPieces)
    setScore(s => s + res.gained)
    setSel(null)
    if (res.lines) {
      const keys = new Set()
      res.cleared.rows.forEach(y => { for (let x = 0; x < N; x++) keys.add(`${x},${y}`) })
      res.cleared.cols.forEach(x => { for (let y = 0; y < N; y++) keys.add(`${x},${y}`) })
      clearSeq.current += 1
      setClearing({ keys, k: clearSeq.current })
      setTimeout(() => setClearing(null), 380)
    }
    if (!nextPieces.some(p => p && fitsAnywhere(res.board, p.cells))) setTimeout(() => setOver(true), 450)
    return true
  }

  const onSlotDown = (e, i) => {
    if (!pieces[i] || over) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const lift = e.pointerType === 'touch' ? cell * 1.8 : 0
    dragRef.current = { i, sx: e.clientX, sy: e.clientY, lift, moved: false }
  }
  const onSlotMove = e => {
    const d = dragRef.current
    if (!d) return
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return
    d.moved = true
    setSel(null)
    setDrag({ i: d.i, ...ghostFor(pieces[d.i], e.clientX, e.clientY, d.lift) })
  }
  const onSlotUp = e => {
    const d = dragRef.current
    dragRef.current = null
    if (!d) return
    if (!d.moved) { setSel(s => (s === d.i ? null : d.i)); return }
    const g = ghostFor(pieces[d.i], e.clientX, e.clientY, d.lift)
    if (g?.ok) commit(d.i, g.gx, g.gy)
    setDrag(null)
  }
  const onCell = (x, y) => {
    if (sel === null || !pieces[sel]) return
    const [w, h] = shapeSize(pieces[sel].cells)
    const clamp = (v, size) => Math.max(0, Math.min(N - size, v))
    if (!commit(sel, clamp(x - Math.floor((w - 1) / 2), w), clamp(y - Math.floor((h - 1) / 2), h))) commit(sel, clamp(x, w), clamp(y, h))
  }

  useEffect(() => { if (over && daily) daily.finish({ text: `🟨 מסיבת בלוקים: צברתי ${score} נקודות`, score: -score, won: true }) }, [over, daily, score])
  useEffect(() => { if (score > progress.best) saveProgress({ best: score }) }, [score, progress.best, saveProgress])
  useEffect(() => { if (score) onReport?.({ text: `🟨 צברתי ${score} נקודות במסיבת בלוקים!` }) }, [score, onReport])

  const restart = () => { const r = daily ? rng(daily.seed) : Math.random; setRand(() => r); setBoard(emptyBoard()); setPieces(dealPieces(r)); setScore(0); setSel(null); setOver(false) }
  const ghostCells = new Map()
  if (drag?.ok) for (const [x, y] of pieces[drag.i].cells) ghostCells.set(`${drag.gx + x},${drag.gy + y}`, pieces[drag.i].color)

  return (
    <div className="arc-game">
      <Hud stats={[['ניקוד', score], ['שיא', Math.max(progress.best, score)]]}>
        <ToolButton onClick={restart} label="משחק חדש">🔄</ToolButton>
      </Hud>
      <div className="arc-field" ref={boxRef} style={{ flexDirection: 'column', gap: 12 }}>
        <div className="bp-board" ref={boardRef} style={{ width: size, gap: GAP, padding: PAD, direction: 'ltr' }} aria-label="לוח 8 על 8" role="grid">
          {board.flatMap((row, y) => row.map((c, x) => {
            const k = `${x},${y}`
            const g = ghostCells.get(k)
            const cls = `bp-cell${c ? ' is-full' : ''}${g ? ' is-ghost' : ''}${clearing?.keys.has(k) ? ' is-clear' : ''}`
            return <div key={clearing?.keys.has(k) ? `${k}-${clearing.k}` : k} className={cls} style={c || g ? { background: c || g } : undefined} onClick={() => onCell(x, y)} role="gridcell" />
          }))}
        </div>
        <div className="bp-tray" style={{ height: mini * 5 + 16 }}>
          {pieces.map((p, i) => {
            if (!p) return <div key={`e${i}`} className="bp-slot" style={{ width: mini * 5, height: mini * 5 }} />
            const [w, h] = shapeSize(p.cells)
            const fits = fitsAnywhere(board, p.cells)
            const hidden = drag?.i === i
            return (
              <button type="button" key={p.id} className={`bp-slot${sel === i ? ' is-sel' : ''}`} aria-label={`צורה ${i + 1}${fits ? '' : ' (לא נכנסת)'}`}
                style={{ width: mini * 5, height: mini * 5, opacity: hidden ? 0.2 : fits ? 1 : 0.35 }}
                onPointerDown={e => onSlotDown(e, i)} onPointerMove={onSlotMove} onPointerUp={onSlotUp} onPointerCancel={() => { dragRef.current = null; setDrag(null) }}>
                <span className="bp-piece" style={{ gridTemplateColumns: `repeat(${w}, ${mini}px)`, gridTemplateRows: `repeat(${h}, ${mini}px)`, direction: 'ltr' }}>
                  {p.cells.map(([x, y]) => <span key={`${x},${y}`} className="bp-mini" style={{ gridColumn: x + 1, gridRow: y + 1, background: p.color }} />)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      {drag && pieces[drag.i] && (() => {
        const [w, h] = shapeSize(pieces[drag.i].cells)
        return (
          <div className="bp-drag" style={{ left: drag.left, top: drag.top, gridTemplateColumns: `repeat(${w}, ${cell}px)`, gridTemplateRows: `repeat(${h}, ${cell}px)`, direction: 'ltr' }}>
            {pieces[drag.i].cells.map(([x, y]) => <span key={`${x},${y}`} className="bp-cell is-full" style={{ gridColumn: x + 1, gridRow: y + 1, background: pieces[drag.i].color }} />)}
          </div>
        )
      })()}
      {over && !daily && <EndCard title="🎊 אין יותר מקום!" text={`צברתם ${score} נקודות${score >= progress.best && score > 0 ? ' — שיא חדש! 🎉' : ''}`}
        primary="🔄 משחק חדש" onPrimary={restart}
        secondary="📱 שתפו את הניקוד" onSecondary={() => onShare?.(`🟨 צברתי ${score} נקודות במסיבת בלוקים! מי עובר אותי?`)} />}
    </div>
  )
}
