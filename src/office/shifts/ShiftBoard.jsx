// The free-play grid: days × shifts with name chips.
// Drag (mouse: just drag; touch: hold ~¼ s then drag) or tap-then-tap to move/swap; tap a name below, then spots, to assign.
import { useEffect, useMemo, useRef, useState } from 'react'
import { DAY_SHORT, fmtDate, fmtHM, shiftTimes, slotKey, dateRange, weekday, moveChip, assignPerson, clearChip, toggleLock } from './shiftLogic'

const HUES = [48, 200, 140, 330, 20, 265, 95, 175, 0, 230, 300, 120]
const chipColor = idx => `hsl(${HUES[idx % HUES.length]} 85% ${idx >= HUES.length ? 82 : 88}%)`

export default function ShiftBoard({ plan, people, slots, cells, conflicts, tot, focus, onCells }) {
  const [sel, setSel] = useState(null) // { key, i } chip/spot, or { pid } from the names list
  const [ghost, setGhost] = useState(null) // { x, y, label }
  const [over, setOver] = useState(null)
  const drag = useRef(null)
  const suppress = useRef(false)
  const boxRef = useRef(null)
  const scrollV = useRef(0)
  const live = useRef({})
  useEffect(() => { live.current = { cells, onCells } })

  const idx = useMemo(() => Object.fromEntries(people.map((p, i) => [p.id, i])), [people])
  const nameOf = id => people[idx[id]]?.name || ''
  const times = useMemo(() => shiftTimes(plan.shifts), [plan.shifts])
  const keys = useMemo(() => new Set(slots.map(s => s.key)), [slots])
  const dates = useMemo(() => dateRange(plan.start, plan.end).filter(d => plan.shifts.some(s => keys.has(slotKey(d, s.id)))), [plan, keys])
  const counts = useMemo(() => tot.map(t => t.count), [tot])
  const hi = Math.max(0, ...counts), lo = Math.min(...counts)

  // window listeners for the drag; read everything through refs
  useEffect(() => {
    let raf = 0
    const tick = () => { if (scrollV.current) window.scrollBy(0, scrollV.current); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    const targetAt = (x, y) => {
      const el = document.elementFromPoint(x, y)?.closest?.('[data-key]')
      return el && boxRef.current?.contains(el) ? { key: el.dataset.key, i: +el.dataset.i } : null
    }
    const end = () => {
      const d = drag.current
      if (d?.timer) clearTimeout(d.timer)
      drag.current = null; scrollV.current = 0
      setGhost(null); setOver(null)
    }
    const activate = (d, x, y) => {
      d.active = true; d.timer = null
      try { navigator.vibrate?.(12) } catch { /* not supported */ }
      setGhost({ x, y, label: d.label }); setSel(null)
    }
    const onMove = e => {
      const d = drag.current
      if (!d || e.pointerId !== d.id) return
      const dist = Math.hypot(e.clientX - d.x0, e.clientY - d.y0)
      if (!d.active) {
        if (d.touch) { if (dist > 10) end(); return } // a scroll, not a drag
        if (dist > 5) activate(d, e.clientX, e.clientY)
        else return
      }
      setGhost(g => g && { ...g, x: e.clientX, y: e.clientY })
      const t = targetAt(e.clientX, e.clientY)
      setOver(t ? `${t.key}#${t.i}` : null)
      const edge = 70, h = window.innerHeight
      scrollV.current = e.clientY < edge ? -Math.ceil((edge - e.clientY) / 6) : e.clientY > h - edge ? Math.ceil((e.clientY - (h - edge)) / 6) : 0
    }
    const onUp = e => {
      const d = drag.current
      if (!d || e.pointerId !== d.id) return
      if (d.active) {
        const t = targetAt(e.clientX, e.clientY)
        const { cells: c, onCells: set } = live.current
        if (t) set(d.src.pid ? assignPerson(c, t, d.src.pid) : moveChip(c, d.src, t))
        suppress.current = true
        setTimeout(() => { suppress.current = false }, 50)
      }
      end()
    }
    const onCancel = e => { if (drag.current && e.pointerId === drag.current.id) end() }
    const onTouchMove = e => { if (drag.current?.active) e.preventDefault() }
    const box = boxRef.current
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    box?.addEventListener('touchmove', onTouchMove, { passive: false })
    const onKey = e => { if (e.key === 'Escape') { setSel(null); end() } }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('keydown', onKey)
      box?.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const press = (e, src, label) => {
    if (e.button > 0) return
    const d = { src, label, x0: e.clientX, y0: e.clientY, id: e.pointerId, active: false, touch: e.pointerType !== 'mouse' }
    if (d.touch) d.timer = setTimeout(() => { if (drag.current === d) { d.active = true; d.timer = null; try { navigator.vibrate?.(12) } catch { /* no vibrate */ } setGhost({ x: d.x0, y: d.y0, label }); setSel(null) } }, 260)
    drag.current = d
  }

  const tap = at => {
    if (suppress.current) return
    const c = cells[at.key]?.[at.i]
    if (!c) return
    if (sel?.pid) { onCells(assignPerson(cells, at, sel.pid)); return }
    if (sel?.key) {
      if (sel.key === at.key && sel.i === at.i) setSel(null)
      else { onCells(moveChip(cells, sel, at)); setSel(null) }
      return
    }
    if (c.p) setSel(at)
  }
  const tapName = pid => {
    if (suppress.current) return
    if (sel?.key && cells[sel.key]?.[sel.i]) { onCells(assignPerson(cells, sel, pid)); setSel(null); return }
    setSel(s => s?.pid === pid ? null : { pid })
  }

  const selChip = sel?.key ? cells[sel.key]?.[sel.i] : null
  const dimOther = focus || sel?.pid

  return (
    <div ref={boxRef} className="sp-board">
      <p className="sp-hint">{sel?.pid
        ? <>משבצים את <b>{nameOf(sel.pid)}</b>: הקישו על משבצות. הקשה על השם שוב מסיימת.</>
        : selChip ? <>נבחר <b>{nameOf(selChip.p)}</b>: הקישו על משבצת אחרת כדי להעביר או להחליף.</>
          : <>גוררים שם למקום אחר, או מקישים עליו ואז על היעד. על שם אחר = החלפה.</>}</p>
      <div className="sp-scroll">
        <table className="sp-grid">
          <thead>
            <tr>
              <th className="sp-dayh">יום</th>
              {plan.shifts.map((s, si) => <th key={s.id}>{s.name}{times[si].explicit && <small>{fmtHM(times[si].start)}–{fmtHM(times[si].start + times[si].hours)}</small>}</th>)}
            </tr>
          </thead>
          <tbody>
            {dates.map(d => {
              const dow = weekday(d)
              return (
                <tr key={d} className={(dow >= 5 ? 'wk ' : '') + (dow === 0 ? 'sun' : '')}>
                  <th className="sp-day"><b>{DAY_SHORT[dow]}</b> {fmtDate(d)}</th>
                  {plan.shifts.map(s => {
                    const key = slotKey(d, s.id)
                    if (!keys.has(key)) return <td key={s.id} className="sp-off" aria-label="אין משמרת">—</td>
                    return (
                      <td key={s.id}>
                        <div className="sp-cell">
                          {(cells[key] || []).map((c, i) => {
                            const id = `${key}#${i}`
                            const bad = conflicts[id]
                            const isSel = sel?.key === key && sel.i === i
                            const cls = 'sp-chip' + (c.p ? '' : ' empty') + (bad ? ' bad' : '') + (c.l ? ' locked' : '') + (isSel ? ' sel' : '') + (over === id ? ' over' : '') + (dimOther && c.p && c.p !== dimOther ? ' dim' : '') + (dimOther && c.p === dimOther ? ' me' : '')
                            return (
                              <button key={i} type="button" className={cls} data-key={key} data-i={i}
                                style={c.p ? { background: bad ? undefined : chipColor(idx[c.p]) } : undefined}
                                title={bad ? bad.join('\n') : undefined}
                                aria-label={c.p ? `${nameOf(c.p)}${c.l ? ', נעול' : ''}${bad ? ': ' + bad.join(', ') : ''}` : 'מקום ריק'}
                                aria-pressed={isSel}
                                onPointerDown={c.p ? e => press(e, { key, i }, nameOf(c.p)) : undefined}
                                onClick={() => tap({ key, i })}
                                onContextMenu={e => e.preventDefault()}>
                                {c.l && <span aria-hidden="true">🔒</span>}{c.p ? nameOf(c.p) : '+'}{bad && <span aria-hidden="true" className="sp-bang">!</span>}
                              </button>
                            )
                          })}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <h3 className="sp-h3">כמה כל אחד? <span>{hi - lo <= 1 ? '✓ מאוזן' : `פער של ${hi - lo}`}</span></h3>
      <p className="sp-hint">הקישו על שם ואז על משבצות כדי לשבץ אותו, או גררו אותו לטבלה.</p>
      <div className="sp-names">
        {tot.map(t => (
          <button key={t.id} type="button" className={'sp-name' + (sel?.pid === t.id ? ' sel' : '') + (t.count === hi && hi - lo > 1 ? ' hi' : '') + (t.count === lo && hi - lo > 1 ? ' lo' : '')}
            data-name={t.id} aria-pressed={sel?.pid === t.id}
            onPointerDown={e => press(e, { pid: t.id }, t.name)}
            onClick={() => tapName(t.id)} onContextMenu={e => e.preventDefault()}>
            <i style={{ background: chipColor(idx[t.id]) }} aria-hidden="true" />{t.name}<b>{t.count}</b>
          </button>
        ))}
      </div>

      {selChip && (
        <div className="sp-actions" role="toolbar" aria-label="פעולות על השם שנבחר">
          <b>{nameOf(selChip.p)}</b>
          <button type="button" className="xl-btn alt" onClick={() => { onCells(toggleLock(cells, sel)); setSel(null) }}>{selChip.l ? '🔓 שחרור' : '🔒 נעילה'}</button>
          <button type="button" className="xl-btn alt" onClick={() => { onCells(clearChip(cells, sel)); setSel(null) }}>✖ הוצאה</button>
          <button type="button" className="xl-btn alt" onClick={() => setSel(null)}>ביטול</button>
        </div>
      )}
      {sel?.pid && (
        <div className="sp-actions" role="status">
          <span>משבצים את <b>{nameOf(sel.pid)}</b></span>
          <button type="button" className="xl-btn alt" onClick={() => setSel(null)}>סיום</button>
        </div>
      )}
      {ghost && <div className="sp-ghost" style={{ left: ghost.x, top: ghost.y }} aria-hidden="true">{ghost.label}</div>}
    </div>
  )
}
