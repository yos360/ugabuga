import { useState, useCallback, useRef } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const dotLayouts = {
  1: [[50,50]], 2: [[25,25],[75,75]], 3: [[25,25],[50,50],[75,75]],
  4: [[25,25],[25,75],[75,25],[75,75]], 5: [[25,25],[25,75],[50,50],[75,25],[75,75]],
  6: [[25,25],[25,50],[25,75],[75,25],[75,50],[75,75]],
}

function Face({ n, transform }) {
  return (
    <div className="absolute inset-0 bg-[var(--card)] border-[3px] border-[var(--border)]" style={{ transform, backfaceVisibility: 'hidden' }}>
      {dotLayouts[n].map(([x,y], i) => (
        <div key={i} className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-[var(--ink)]" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }} />
      ))}
    </div>
  )
}

function Die3D({ value, rolling, mouseX, mouseY }) {
  const targetRot = { 1:{x:0,y:0}, 2:{x:0,y:90}, 3:{x:90,y:0}, 4:{x:-90,y:0}, 5:{x:0,y:-90}, 6:{x:0,y:180} }[value]
  const hoverX = rolling ? 0 : mouseY * 15
  const hoverY = rolling ? 0 : mouseX * 15
  const rot = rolling
    ? { x: 720 + targetRot.x, y: 720 + targetRot.y }
    : { x: targetRot.x + hoverX, y: targetRot.y + hoverY }

  return (
    <div style={{ perspective: '400px' }} className="w-20 h-20 md:w-24 md:h-24">
      <div className="relative w-full h-full transition-transform ease-out"
        style={{ transformStyle: 'preserve-3d', transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`, transitionDuration: rolling ? '700ms' : '150ms' }}>
        <Face n={1} transform="translateZ(40px)" />
        <Face n={6} transform="rotateY(180deg) translateZ(40px)" />
        <Face n={2} transform="rotateY(90deg) translateZ(40px)" />
        <Face n={5} transform="rotateY(-90deg) translateZ(40px)" />
        <Face n={3} transform="rotateX(90deg) translateZ(40px)" />
        <Face n={4} transform="rotateX(-90deg) translateZ(40px)" />
      </div>
    </div>
  )
}

export default function DiceTool() {
  const [count, setCount] = useState(1)
  const [values, setValues] = useState([6])
  const [rolling, setRolling] = useState(false)
  const [history, setHistory] = useState([])
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const roll = useCallback(() => {
    setRolling(true)
    setTimeout(() => {
      const newVals = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1)
      setValues(newVals)
      setHistory(h => [{ vals: newVals, total: newVals.reduce((a,b) => a+b, 0) }, ...h].slice(0, 10))
      setRolling(false)
    }, 700)
  }, [count])

  const onMouseMove = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMouse({ x: ((e.clientX - rect.left) / rect.width - 0.5) * 2, y: ((e.clientY - rect.top) / rect.height - 0.5) * 2 })
  }, [])

  const total = values.reduce((a,b) => a+b, 0)

  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="קוביה וירטואלית — הטלת 1 עד 3 קוביות אונליין" description="זורקים קוביה אונליין בלחיצה: קוביה תלת־ממדית מונפשת, 1, 2 או 3 קוביות עם סכום אוטומטי והיסטוריית הטלות. מושלם כשהקוביה של משחק הקופסה אבדה. חינם." path="/tools/dice" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'קוביה' }]} />
      <h1 className="text-4xl text-center mb-6">🎲 קוביה וירטואלית 3D</h1>

      <div className="flex justify-center gap-2 mb-6">
        {[1,2,3].map(n => (
          <button key={n} onClick={() => { setCount(n); setValues(Array(n).fill(6)) }}
            className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${count === n ? 'bg-[var(--postit)]' : 'bg-[var(--card)]'}`}>
            {n} {n === 1 ? 'קוביה' : 'קוביות'}
          </button>
        ))}
      </div>

      <div ref={containerRef} onMouseMove={onMouseMove} className="flex justify-center gap-6 mb-6 py-8">
        {values.map((v, i) => <Die3D key={i} value={v} rolling={rolling} mouseX={mouse.x} mouseY={mouse.y} />)}
      </div>

      {count > 1 && <p className="text-center font-display text-3xl font-bold mb-4">סה"כ: {total}</p>}

      <div className="text-center mb-8">
        <button onClick={roll} disabled={rolling}
          className="wobbly-md sketch-press min-h-[56px] border-[3px] border-[var(--border)] bg-[var(--accent)] px-10 py-3 font-display text-xl font-bold text-[var(--accent-foreground)] cursor-pointer disabled:opacity-50">
          {rolling ? '🎲 מגלגל...' : '🎲 הטילו!'}
        </button>
      </div>
      <p className="text-center font-hand text-sm text-[var(--muted-foreground)] mb-6">💡 הזיזו את העכבר מעל הקוביה — היא תסתובב!</p>

      {history.length > 0 && (
        <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="font-display text-lg font-bold mb-2">היסטוריה</h3>
          {history.map((h, i) => <p key={i} className="font-hand text-base">{h.vals.join(' + ')} = {h.total}</p>)}
        </div>
      )}
    </div>
  )
}

