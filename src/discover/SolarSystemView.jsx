import { useEffect, useMemo, useRef, useState } from 'react'
import { PLANETS, PLANET_PHYSICS } from './discoverData'
import './solar.css'

// Display radius in the row (not to scale for the small planets, or they'd be invisible).
const pr = d => 7 + Math.sqrt(d / 142984) * 30
const ORBIT_SECONDS = 6 // Mercury's year on screen; the others follow the real ratios (slowed for the giants)

// The interactive part of /discover/solar-system: a planet row (big, glowing, obviously clickable),
// an orbit view where the planets really go around the sun, the planet card, and two fun calculators.
export default function SolarSystemView({ sel, setSel }) {
  const [view, setView] = useState('row')
  const [touched, setTouched] = useState(false) // the "👆 לחצו" hint disappears after the first pick
  const i = PLANETS.indexOf(sel)
  const pick = p => { setSel(p); setTouched(true) }
  const step = d => pick(PLANETS[(i + d + PLANETS.length) % PLANETS.length])
  const cardRef = useRef(null)
  useEffect(() => {
    const onKey = e => { if (e.target.closest?.('input, textarea')) return; if (e.key === 'ArrowLeft') step(1); else if (e.key === 'ArrowRight') step(-1) }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  })

  return <>
    <div className="ss-tabs" role="tablist" aria-label="תצוגה">
      <button type="button" role="tab" aria-selected={view === 'row'} onClick={() => setView('row')}>🪐 כוכבי הלכת בשורה</button>
      <button type="button" role="tab" aria-selected={view === 'orbit'} onClick={() => setView('orbit')}>🌀 מסתובבים סביב השמש</button>
    </div>
    <div className="ss-space">
      <div className="ss-stars" aria-hidden="true" />
      {!touched && <p className="ss-hint" aria-hidden="true"><span>👆</span> לחצו על כוכב לכת!</p>}
      {view === 'row' ? <Row sel={sel} pick={pick} /> : <Orbits sel={sel} pick={pick} />}
    </div>

    <section ref={cardRef} className="ss-card" style={{ '--pc': sel.color }} aria-live="polite">
      <button type="button" className="ss-nav" onClick={() => step(-1)} aria-label="כוכב הלכת הקודם">→</button>
      <div className="ss-card-body">
        <div className="ss-big" aria-hidden="true"><Planet p={sel} r={46} />{sel.id === 'saturn' && <span className="ss-big-ring" />}</div>
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl sm:text-4xl font-black">{sel.name}</h2>
          <div className="ss-chips">
            <span>📍 מקום {i + 1} מהשמש</span><span>🧱 {sel.kind}</span><span>↔️ {sel.d.toLocaleString('he-IL')} ק״מ</span><span>🗓️ שנה: {sel.year}</span><span>🏋️ כוח משיכה ×{PLANET_PHYSICS[sel.id].g}</span>
          </div>
          <ul className="ss-facts">{sel.facts.map(f => <li key={f}>{f}</li>)}</ul>
        </div>
      </div>
      <button type="button" className="ss-nav" onClick={() => step(1)} aria-label="כוכב הלכת הבא">←</button>
    </section>

    <Calculators />
  </>
}

function Planet({ p, r }) {
  return <svg viewBox={`${-r - 2} ${-r - 2} ${2 * r + 4} ${2 * r + 4}`} width={2 * r + 4} height={2 * r + 4} className="ss-planet-svg">
    <defs><radialGradient id={`g-${p.id}-${r}`} cx="35%" cy="32%" r="75%"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".35" stopColor={p.color} /><stop offset="1" stopColor="#000" stopOpacity=".55" /></radialGradient></defs>
    <circle r={r} fill={p.color} /><circle r={r} fill={`url(#g-${p.id}-${r})`} />
    {p.id === 'jupiter' && <><path d={`M${-r} ${-r * 0.25} Q0 ${-r * 0.4} ${r} ${-r * 0.25}`} stroke="#a8693c" strokeWidth={r * 0.12} fill="none" opacity=".55" /><path d={`M${-r} ${r * 0.2} Q0 ${r * 0.05} ${r} ${r * 0.2}`} stroke="#b97a48" strokeWidth={r * 0.1} fill="none" opacity=".5" /><ellipse cx={r * 0.3} cy={r * 0.35} rx={r * 0.18} ry={r * 0.1} fill="#b5442b" opacity=".85" /></>}
    {p.id === 'earth' && <><path d={`M${-r * 0.5} ${-r * 0.3} q${r * 0.3} ${-r * 0.3} ${r * 0.6} 0 q-${r * 0.1} ${r * 0.4} -${r * 0.5} ${r * 0.3} z`} fill="#3aa35b" /><path d={`M${r * 0.1} ${r * 0.2} q${r * 0.4} 0 ${r * 0.5} ${r * 0.3} q-${r * 0.3} ${r * 0.2} -${r * 0.5} 0 z`} fill="#3aa35b" /></>}
    {p.id === 'mars' && <circle cx={-r * 0.2} cy={-r * 0.75} r={r * 0.22} fill="#fff" opacity=".7" />}
  </svg>
}

function Row({ sel, pick }) {
  const xs = useMemo(() => { let x = 150; return PLANETS.map(p => { const r = pr(p.d) * (p.id === 'saturn' ? 1.8 : 1); x += Math.max(r, 34) + 22; const at = x; x += Math.max(r, 34); return at }) }, [])
  const W = xs.at(-1) + 60
  return <div className="ss-row-scroll"><svg viewBox={`0 0 ${W} 170`} className="ss-row" style={{ minWidth: 640 }} role="group" aria-label="כוכבי הלכת לפי הסדר מהשמש. לחצו על כוכב לכת כדי לקרוא עליו">
    <defs><radialGradient id="sun"><stop offset="0" stopColor="#fff7c2" /><stop offset=".5" stopColor="#ffd23f" /><stop offset="1" stopColor="#ff9f1c" /></radialGradient></defs>
    {/* RTL page: the sun is on the right and the planets go outward to the left */}
    <circle cx={W - 20} cy="80" r="115" fill="#ffd23f" opacity=".15" className="ss-sun-glow" /><circle cx={W - 20} cy="80" r="92" fill="url(#sun)" />
    <g>
      {PLANETS.map((p, k) => { const x = W - xs[k], r = pr(p.d), on = sel.id === p.id
        return <g key={p.id} className={`ss-p${on ? ' is-on' : ''}`} style={{ '--d': `${k * 0.25}s` }} role="button" tabIndex={0} aria-label={p.name} aria-pressed={on}
          onClick={() => pick(p)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(p) } }}>
          <circle cx={x} cy="80" r={Math.max(r + 12, 30)} fill="transparent" />
          {on && <circle cx={x} cy="80" r={r + 8} className="ss-ring-sel" />}
          {p.id === 'saturn' && <ellipse cx={x} cy="80" rx={r * 1.85} ry={r * 0.42} fill="none" stroke="#d8c08a" strokeWidth="3.5" transform={`rotate(-12 ${x} 80)`} />}
          <g transform={`translate(${x} 80)`}><g className="ss-bob"><circle r={r} fill={p.color} /><circle r={r} fill="url(#shade)" /></g></g>
          <text x={x} y="150" fontSize="15" textAnchor="middle" fontWeight="800" className="ss-label" direction="rtl">{p.name}</text>
        </g> })}
    </g>
    <defs><radialGradient id="shade" cx="35%" cy="32%" r="75%"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset=".4" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".5" /></radialGradient></defs>
  </svg></div>
}

function Orbits({ sel, pick }) {
  const [t, setT] = useState(0)
  const [play, setPlay] = useState(true)
  useEffect(() => {
    if (!play || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    let raf, last = performance.now()
    const tick = now => { setT(v => v + (now - last) / 1000); last = now; raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [play])
  const earthYears = t / (ORBIT_SECONDS * 365.25 / 88)
  return <div className="ss-orbit-wrap">
    <svg viewBox="-260 -260 520 520" className="ss-orbit" role="group" aria-label="כוכבי הלכת מסתובבים סביב השמש">
      <circle r="26" fill="url(#sun2)" className="ss-sun-glow" />
      <defs><radialGradient id="sun2"><stop offset="0" stopColor="#fff7c2" /><stop offset=".55" stopColor="#ffd23f" /><stop offset="1" stopColor="#ff9f1c" /></radialGradient></defs>
      {PLANETS.map((p, k) => { const R = 44 + k * 27, period = ORBIT_SECONDS * PLANET_PHYSICS[p.id].days / 88, a = k * 2.4 - (t / period) * Math.PI * 2 * (k > 3 ? 4 : 1) // spread out at the start, not in a line
        const x = R * Math.cos(a), y = R * Math.sin(a), r = Math.min(13, 4 + pr(p.d) / 4), on = sel.id === p.id
        return <g key={p.id}><circle r={R} fill="none" stroke={on ? '#ffd23f' : '#ffffff22'} strokeWidth={on ? 1.6 : 1} strokeDasharray={on ? '' : '3 5'} />
          <g className={`ss-p${on ? ' is-on' : ''}`} role="button" tabIndex={0} aria-label={p.name} onClick={() => pick(p)} onKeyDown={e => { if (e.key === 'Enter') pick(p) }}>
            <circle cx={x} cy={y} r={r + 10} fill="transparent" />
            {p.id === 'saturn' && <ellipse cx={x} cy={y} rx={r * 1.9} ry={r * 0.5} fill="none" stroke="#d8c08a" strokeWidth="2" />}
            <circle cx={x} cy={y} r={r} fill={p.color} stroke={on ? '#fff' : 'none'} strokeWidth="2" />
            {on && <text x={x} y={y - r - 6} fontSize="13" fill="#ffd23f" textAnchor="middle" fontWeight="800">{p.name}</text>}
          </g></g> })}
    </svg>
    <div className="ss-orbit-bar"><button type="button" onClick={() => setPlay(!play)}>{play ? '⏸️ עצירה' : '▶️ המשך'}</button><span>🌍 עברו בערך <b>{Math.floor(earthYears)}</b> שנים על כדור הארץ</span></div>
    <p className="ss-orbit-note">הקרובים לשמש מקיפים אותה הכי מהר. כדי שיהיה אפשר לראות משהו, ארבעת הענקים מסתובבים כאן מהר פי 4 מהאמת — ובאמת נפטון צריך 165 שנים לסיבוב אחד!</p>
  </div>
}

function Calculators() {
  const [kg, setKg] = useState('30')
  const [age, setAge] = useState('8')
  const w = Number(kg), y = Number(age)
  return <div className="mt-4 grid gap-4 md:grid-cols-2">
    <section className="ss-calc"><h3>🏋️ כמה הייתי שוקל/ת על...</h3>
      <label className="mt-2 flex items-center gap-2 font-bold">המשקל שלי בכדור הארץ: <input type="number" inputMode="decimal" min="1" max="200" value={kg} onChange={e => setKg(e.target.value)} className="ss-in" /> ק״ג</label>
      <ul className="ss-list">{PLANETS.map(p => <li key={p.id}><span className="ss-dot" style={{ background: p.color }} />{p.name}<b>{w > 0 ? `${Math.round(w * PLANET_PHYSICS[p.id].g * 10) / 10} ק״ג` : '—'}</b></li>)}</ul>
      <p className="text-sm text-[var(--muted-foreground)]">על צדק הייתם מרגישים כבדים פי יותר משניים! (בענקי הגזים אין קרקע לעמוד עליה — זה המשקל בגובה העננים.)</p></section>
    <section className="ss-calc"><h3>🎂 בן/בת כמה הייתי על...</h3>
      <label className="mt-2 flex items-center gap-2 font-bold">הגיל שלי: <input type="number" inputMode="numeric" min="1" max="120" value={age} onChange={e => setAge(e.target.value)} className="ss-in" /> שנים</label>
      <ul className="ss-list">{PLANETS.map(p => { const v = y * 365.25 / PLANET_PHYSICS[p.id].days; return <li key={p.id}><span className="ss-dot" style={{ background: p.color }} />{p.name}<b>{y > 0 ? (v >= 10 ? Math.round(v) : Math.round(v * 10) / 10) : '—'}</b></li> })}</ul>
      <p className="text-sm text-[var(--muted-foreground)]">"שנה" היא סיבוב אחד סביב השמש. על כוכב חמה כבר הייתם חוגגים המון ימי הולדת — ועל נפטון עוד לא חגגתם אפילו אחד!</p></section>
  </div>
}
