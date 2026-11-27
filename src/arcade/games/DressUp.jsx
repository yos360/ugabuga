import { useRef, useState } from 'react'
import { SLOTS, OCCASIONS, FURS, FUR_NAMES, ITEMS, DEFAULT_OUTFIT, itemsFor, itemById, randomOutfit, Scene, Character } from '../data/dressUpItems.jsx'
import { sfx } from '../sfx'
import { useProgress } from '../hooks'
import { ToolButton } from '../ui'
import './dress-up.css'

// Dress-up: an original fluffy character, clothes for every season and occasion. Tap to
// wear, 🎲 for a random outfit, 🖨️ to print the character. No score, no pressure.

const validOutfit = o => Object.fromEntries(SLOTS.map(s => [s.id, o && o[s.id] && itemById(o[s.id])?.slot === s.id ? o[s.id] : null]))

function Thumb({ item, view }) {
  return <svg viewBox={view} className="du-thumb" aria-hidden="true" focusable="false">{item.art}</svg>
}

export default function DressUp({ onShare, lang = 'he' }) {
  const en = lang === 'en'
  const [saved, save] = useProgress('dress-up', { outfit: DEFAULT_OUTFIT, fur: 0, occasion: 'all' })
  const outfit = validOutfit(saved.outfit)
  const fur = FURS[saved.fur] ? saved.fur : 0
  const occasion = OCCASIONS.some(o => o.id === saved.occasion) ? saved.occasion : 'all'
  const [slot, setSlot] = useState('top')
  const [note, setNote] = useState('')
  const svgRef = useRef(null)
  const noteTimer = useRef(0)
  const say = text => { setNote(text); clearTimeout(noteTimer.current); noteTimer.current = setTimeout(() => setNote(''), 2600) }

  const wear = (s, id) => { save({ outfit: { ...outfit, [s]: outfit[s] === id ? null : id } }); sfx(id && outfit[s] !== id ? 'pick' : 'flip') }
  const chooseOccasion = id => { save({ occasion: id }); sfx('pick') }
  const random = () => { save({ outfit: randomOutfit(occasion) }); sfx('match') }
  const reset = () => { save({ outfit: DEFAULT_OUTFIT }); sfx('flip') }

  const print = () => {
    const svg = svgRef.current
    if (!svg) return
    const w = window.open('', '_blank')
    if (!w) { say('אפשרו חלונות קופצים כדי להדפיס'); return }
    const markup = new XMLSerializer().serializeToString(svg)
    w.document.write(`<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>הדמות שלי</title><style>
      @page{size:A4;margin:12mm}
      body{margin:0;font-family:Heebo,Arial,sans-serif;text-align:center;color:#1d2233}
      h1{font-size:30px;margin:6px 0 2px}
      p{margin:4px 0;font-size:16px}
      svg{width:100%;max-width:150mm;height:auto;max-height:215mm;border:3px solid #1d2233;border-radius:18px;margin:8px auto;display:block}
      .name{font-size:20px;margin:14px 0 6px}
      small{color:#555}
    </style></head><body><h1>הדמות שלי</h1><p class="name">השם שלי: ______________________</p>${markup}<p><small>עוגה בוגה · ugabuga.co.il — אפשר לגזור ולתלות</small></p>
    <script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>`)
    w.document.close()
  }

  const items = itemsFor(slot, occasion)
  const slotInfo = SLOTS.find(s => s.id === slot)
  const count = ITEMS.length
  return (
    <div className="arc-game du-game">
      <div className="du-bar">
        <div className="du-occ" role="group" aria-label={en ? 'Season or occasion' : 'עונה או אירוע'}>
          {OCCASIONS.map(o => (
            <button key={o.id} type="button" className={`du-chip${occasion === o.id ? ' on' : ''}`} aria-pressed={occasion === o.id} onClick={() => chooseOccasion(o.id)}>{o.emoji} {o.label}</button>
          ))}
        </div>
        <div className="arc-tools">
          <ToolButton onClick={random} label={en ? 'Random outfit' : 'תלבושת אקראית'}>🎲</ToolButton>
          <ToolButton onClick={reset} label={en ? 'Start over' : 'מתחילים מחדש'}>🔄</ToolButton>
          <ToolButton onClick={print} label={en ? 'Print my character' : 'הדפסת הדמות שלי'}>🖨️</ToolButton>
          {onShare && <ToolButton onClick={() => onShare('🧥 ' + (en ? 'I dressed my own character! Try it:' : 'הלבשתי דמות משלי! נסו גם:'))} label={en ? 'Share' : 'שיתוף'}>📱</ToolButton>}
        </div>
      </div>
      <div className="du-main">
        <div className="du-stage">
          <svg ref={svgRef} viewBox="0 0 200 290" className="du-char" role="img" xmlns="http://www.w3.org/2000/svg"
            aria-label={`${en ? 'Your character wearing' : 'הדמות שלך לובשת'}: ${SLOTS.map(s => itemById(outfit[s.id])?.name).filter(Boolean).join(', ') || (en ? 'nothing yet' : 'עדיין כלום')}`}>
            <Scene occasion={occasion} />
            <Character fur={FURS[fur]} outfit={outfit} />
          </svg>
          <div className="du-furs" role="group" aria-label={en ? 'Fur colour' : 'צבע הפרווה'}>
            {FURS.map((c, i) => <button key={c} type="button" className={`du-fur${i === fur ? ' on' : ''}`} style={{ background: c }} aria-label={FUR_NAMES[i]} aria-pressed={i === fur} onClick={() => { save({ fur: i }); sfx('pick') }} />)}
          </div>
          <p className="du-note" role="status" aria-live="polite">{note}</p>
        </div>
        <div className="du-panel">
          <div className="du-tabs" role="tablist" aria-label={en ? 'Kind of clothing' : 'סוג הלבוש'}>
            {SLOTS.map(s => (
              <button key={s.id} type="button" role="tab" aria-selected={slot === s.id} className={`du-tab${slot === s.id ? ' on' : ''}`} onClick={() => setSlot(s.id)}>
                <span aria-hidden="true">{s.emoji}</span><b>{s.label}</b>
              </button>
            ))}
          </div>
          <div className="du-items" role="tabpanel" aria-label={slotInfo.label}>
            <button type="button" className={`du-item du-none${!outfit[slot] ? ' on' : ''}`} aria-pressed={!outfit[slot]} onClick={() => wear(slot, null)}><span aria-hidden="true">✖️</span><i>בלי</i></button>
            {items.map(it => (
              <button key={it.id} type="button" className={`du-item${outfit[slot] === it.id ? ' on' : ''}`} aria-pressed={outfit[slot] === it.id} onClick={() => wear(slot, it.id)}>
                <Thumb item={it} view={slotInfo.view} /><i>{it.name}</i>
              </button>
            ))}
          </div>
          <p className="du-count">{count} פריטי לבוש · {items.length} מתאימים ל{OCCASIONS.find(o => o.id === occasion).label === 'הכל' ? 'כל האירועים' : OCCASIONS.find(o => o.id === occasion).label}</p>
        </div>
      </div>
    </div>
  )
}
