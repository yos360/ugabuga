import { useState } from 'react'
import { moveId, orderSections } from '../../utils/sectionOrder'

// Owner report: collapsible sections the owner can reorder (drag the header, or ▲▼ on a phone).
// Collapsed, a section shows its 3 latest items. Order and open state are kept in localStorage.
const ORDER_KEY = 'buga-owner-section-order', OPEN_KEY = 'buga-owner-section-open'
const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const save = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* private mode */ } }

export default function ReportSections({ sections }) {
  const [saved, setSaved] = useState(() => load(ORDER_KEY, []))
  const [open, setOpen] = useState(() => load(OPEN_KEY, {}))
  const [dragId, setDragId] = useState(null), [overId, setOverId] = useState(null)
  const list = orderSections(sections, saved)
  const ids = list.map(s => s.id)
  const move = (id, to) => { const next = moveId(ids, id, to); setSaved(next); save(ORDER_KEY, next) }
  const toggle = id => { const next = { ...open, [id]: !open[id] }; setOpen(next); save(OPEN_KEY, next) }
  const btn = 'flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-xs font-black text-slate-600 disabled:opacity-30'

  return <div className="space-y-3">
    <p className="text-sm text-slate-500">אפשר לגרור אזור כדי לשנות את הסדר (או החצים ▲▼), וללחוץ על הכותרת כדי לפתוח או לסגור. הסידור נשמר בדפדפן הזה.</p>
    {list.map((s, i) => {
      const isOpen = !!open[s.id], preview = (s.preview || []).slice(0, 3)
      return <section key={s.id}
        onDragOver={e => { if (dragId) { e.preventDefault(); setOverId(s.id) } }}
        onDrop={e => { e.preventDefault(); if (dragId) move(dragId, i); setDragId(null); setOverId(null) }}
        className={`rounded-2xl border-2 bg-white transition ${overId === s.id && dragId !== s.id ? 'border-violet-500 shadow-lg' : 'border-slate-200'} ${dragId === s.id ? 'opacity-50' : ''}`}>
        <div draggable onDragStart={e => { setDragId(s.id); e.dataTransfer.effectAllowed = 'move' }} onDragEnd={() => { setDragId(null); setOverId(null) }}
          className="flex items-center gap-2 p-3">
          <span className="cursor-grab select-none px-1 text-xl text-slate-400" title="גררו כדי להזיז" aria-hidden="true">⠿</span>
          <button onClick={() => toggle(s.id)} aria-expanded={isOpen} className="flex min-h-9 flex-1 items-center gap-2 text-right">
            <span role="heading" aria-level={2} className="text-xl font-black">{s.title}</span>
            {s.badge != null && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-sm font-bold text-slate-600">{s.badge}</span>}
            <span className="ms-auto text-slate-500">{isOpen ? '▲ סגירה' : '▼ פתיחה'}</span>
          </button>
          <button className={btn} onClick={() => move(s.id, i - 1)} disabled={i === 0} aria-label="להזיז למעלה">▲</button>
          <button className={btn} onClick={() => move(s.id, i + 1)} disabled={i === list.length - 1} aria-label="להזיז למטה">▼</button>
        </div>
        {isOpen ? <div className="border-t-2 border-slate-100 p-4">{s.render()}</div>
          : <button onClick={() => toggle(s.id)} className="block w-full border-t-2 border-slate-100 px-4 py-2 text-right text-sm">
            {preview.length ? <ul className="space-y-1">{preview.map((p, k) => <li key={k} className="flex flex-wrap items-center gap-x-2 text-slate-700">{p}</li>)}</ul>
              : <span className="text-slate-500">{s.empty || 'אין עדיין נתונים בתקופה הזו.'}</span>}
          </button>}
      </section>
    })}
  </div>
}
