import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import MiniHanukkiah from '../../components/hanukkah/MiniHanukkiah'
import { Choice } from '../../components/printables/PrintableShell'
import { ESCAPE_STORY, ESCAPE_TRACKS, trackById, codeOf, isRight, codeMatches, lockCards, WRONG_MESSAGES } from '../../data/hanukkahEscape'

// /holidays/hanukkah/escape-room: a Hanukkah escape room for the class (projector mode with
// teacher controls) or on paper (station cards, a code sheet per group and a fold-over paper lock),
// for kindergarten and for grades 2–4. Every station gives one digit of the lock code.
const PATH = '/holidays/hanukkah/escape-room'
const INK = '#1e3a8a'

// ── Drawings (all original SVG) ─────────────────────────────────────────────
function Donut({ x, y, r = 22 }) {
  return <g>
    <circle cx={x} cy={y} r={r} fill="#f4b45f" stroke="#111" strokeWidth="2.5" />
    <circle cx={x} cy={y - 2} r={r * 0.62} fill="#fde7f3" stroke="#111" strokeWidth="1.5" />
    <circle cx={x} cy={y - 2} r={r * 0.2} fill="#e11d48" stroke="#111" strokeWidth="1.2" />
    {[[-0.35, -0.35], [0.38, -0.2], [-0.2, 0.32], [0.3, 0.3]].map(([dx, dy], i) => <rect key={i} x={x + dx * r - 2} y={y + dy * r - 1} width="4" height="2" rx="1" fill={['#2563eb', '#16a34a', '#f59e0b', '#7c3aed'][i]} />)}
  </g>
}
function SmallDreidel({ x, y, s = 1, letter, tilt = 0, faded }) {
  return <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`} opacity={faded ? 0.45 : 1}>
    <rect x="-4" y="-38" width="8" height="14" rx="3" fill="#fbbf24" stroke="#111" strokeWidth="2" />
    <path d="M-18 -24 H18 V6 L0 24 L-18 6 Z" fill="#60a5fa" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
    {letter && <text x="0" y="-1" textAnchor="middle" fontSize="20" fontWeight="800" fill="#111" fontFamily="Heebo, Arial, sans-serif">{letter}</text>}
  </g>
}
function Candle({ x, y, lit = true, h = 34, color = '#93c5fd' }) {
  return <g>
    <rect x={x - 5} y={y - h} width="10" height={h} fill={color} stroke="#111" strokeWidth="2" />
    {lit && <path d={`M${x} ${y - h - 16} C${x + 6} ${y - h - 8} ${x + 5} ${y - h - 3} ${x} ${y - h - 2} C${x - 5} ${y - h - 3} ${x - 6} ${y - h - 8} ${x} ${y - h - 16} Z`} fill="#fb923c" stroke="#111" strokeWidth="1.5" />}
  </g>
}
function Jar({ x, y, s = 1 }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-14 -40 H14 V-32 C26 -26 30 -14 30 0 C30 18 18 26 0 26 C-18 26 -30 18 -30 0 C-30 -14 -26 -26 -14 -32 Z" fill="#fcd34d" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="-17" y="-46" width="34" height="8" rx="3" fill="#b45309" stroke="#111" strokeWidth="2" />
    <path d="M-14 4 C-6 -4 6 -4 14 4" fill="none" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
  </g>
}

// One visual per station, in a 320 × 170 box.
function StationArt({ visual, label }) {
  const v = visual
  let art = null
  if (v.kind === 'hanukkiah') art = <g transform="translate(40 100) scale(1.5)"><MiniHanukkiah x={0} y={0} w={160} lit={v.lit} color /></g>
  if (v.kind === 'plates') {
    art = v.groups.map((n, gi) => {
      const cx = gi === 0 ? 225 : 95
      return <g key={gi}>
        <ellipse cx={cx} cy="105" rx="78" ry="40" fill="#f8fafc" stroke="#111" strokeWidth="3" />
        <ellipse cx={cx} cy="105" rx="58" ry="27" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        {Array.from({ length: n }, (_, i) => <Donut key={i} x={cx + (i - (n - 1) / 2) * 38} y={98 - (i % 2) * 6} r={19} />)}
      </g>
    })
  }
  if (v.kind === 'dreidels') {
    const stay = v.total - v.fallen
    art = <g>
      <rect x="20" y="70" width="280" height="12" rx="4" fill="#d6a46b" stroke="#111" strokeWidth="2.5" />
      <rect x="40" y="82" width="10" height="70" fill="#d6a46b" stroke="#111" strokeWidth="2" />
      <rect x="270" y="82" width="10" height="70" fill="#d6a46b" stroke="#111" strokeWidth="2" />
      {Array.from({ length: stay }, (_, i) => <SmallDreidel key={i} x={70 + i * 60} y={44} s={0.9} />)}
      {Array.from({ length: v.fallen }, (_, i) => <SmallDreidel key={'f' + i} x={115 + i * 85} y={150} s={0.8} tilt={i ? 100 : -80} />)}
      <path d="M10 162 H310" stroke="#111" strokeWidth="2" />
    </g>
  }
  if (v.kind === 'candleNights') {
    art = Array.from({ length: v.nights }, (_, n) => {
      const cx = 265 - n * 105
      return <g key={n}>
        <text x={cx} y="22" textAnchor="middle" fontSize="15" fontWeight="700" fill={INK} fontFamily="Heebo, Arial, sans-serif">{`ערב ${['ראשון', 'שני', 'שלישי'][n]}`}</text>
        <rect x={cx - 44} y="130" width="88" height="10" rx="3" fill="#f6c453" stroke="#111" strokeWidth="2" />
        {Array.from({ length: n + 1 }, (_, i) => <Candle key={i} x={cx + 30 - i * 18} y={130} />)}
        <Candle x={cx - 34} y={130} h={52} color="#f6c453" />
      </g>
    })
  }
  if (v.kind === 'dreidelLetters') {
    const vals = { נ: 50, ג: 3, ה: 5, פ: 80 }
    art = <g>
      {v.letters.map((l, i) => {
        const x = 270 - i * 75, on = v.picked.includes(l)
        return <g key={l}>
          <SmallDreidel x={x} y={70} s={1.3} letter={l} />
          <text x={x} y="130" textAnchor="middle" fontSize="18" fontWeight="800" fill="#111" fontFamily="Heebo, Arial, sans-serif" direction="rtl">{`${l} = ${vals[l]}`}</text>
          {on && <rect x={x - 30} y="112" width="60" height="26" rx="8" fill="none" stroke="#e11d48" strokeWidth="3" />}
        </g>
      })}
      <text x="160" y="162" textAnchor="middle" fontSize="13" fill="#444" fontFamily="Heebo, Arial, sans-serif">מסומנות האותיות שיצאו</text>
    </g>
  }
  if (v.kind === 'tray') {
    art = <g>
      <rect x="55" y="12" width="210" height="150" rx="14" fill="#e2e8f0" stroke="#111" strokeWidth="3" />
      {Array.from({ length: v.rows * v.cols }, (_, i) => <Donut key={i} x={90 + (i % v.cols) * 47} y={45 + Math.floor(i / v.cols) * 45} r={18} />)}
    </g>
  }
  if (v.kind === 'oilDays') {
    art = <g>
      <Jar x={160} y={70} s={1.1} />
      {Array.from({ length: v.days }, (_, i) => <g key={i}>
        <Candle x={300 - i * 40} y={160} h={22} color={i === 0 ? '#86efac' : '#fde68a'} />
      </g>)}
      <text x="300" y="112" textAnchor="middle" fontSize="12" fill="#166534" fontWeight="700" fontFamily="Heebo, Arial, sans-serif">יום 1</text>
    </g>
  }
  return <svg viewBox="0 0 320 170" role="img" aria-label={label} style={{ width: '100%', height: '100%' }}>{art}</svg>
}

// The lock with one box per station, digits left to right like every number.
function LockBoxes({ track, digits = [], big }) {
  const size = big ? 'h-20 w-16 text-5xl' : 'h-12 w-10 text-2xl'
  return <div dir="ltr" className="flex flex-wrap items-end justify-center gap-2">
    {track.stations.map((s, i) => <div key={s.id} className="flex flex-col items-center">
      <span className={big ? 'text-3xl' : 'text-xl'} aria-hidden="true">{s.icon}</span>
      <span className={`flex ${size} items-center justify-center rounded-xl border-4 border-yellow-400 bg-white font-black text-slate-900`}>{digits[i] ?? ''}</span>
      <span className="text-xs font-bold opacity-80">{i + 1}</span>
    </div>)}
  </div>
}

// ── Projector mode ──────────────────────────────────────────────────────────
function Projector({ track, onClose }) {
  const n = track.stations.length
  const [step, setStep] = useState(-1) // -1 intro, 0..n-1 stations, n lock, n+1 done
  const [found, setFound] = useState([])
  const [hints, setHints] = useState(0)
  const [value, setValue] = useState('')
  const [state, setState] = useState(null)
  const [secs, setSecs] = useState(0)
  const box = useRef(null)
  useEffect(() => {
    const t = setInterval(() => setSecs(s => (step > n ? s : s + 1)), 1000)
    return () => clearInterval(t)
  }, [step, n])
  useEffect(() => {
    const el = box.current
    try { el?.requestFullscreen?.()?.catch?.(() => {}) } catch { /* fullscreen is optional */ }
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      try { if (document.fullscreenElement) document.exitFullscreen() } catch { /* ignore */ }
    }
  }, [onClose])
  const go = to => { setStep(to); setHints(0); setValue(''); setState(null) }
  const s = track.stations[step]
  const reveal = () => { setFound(f => { const c = [...f]; c[step] = s.answer; return c }); setState('right') }
  const check = e => {
    e.preventDefault()
    if (step === n) { setState(codeMatches(track, value) ? 'right' : 'wrong'); if (codeMatches(track, value)) go(n + 1); return }
    if (isRight(s, value)) reveal(); else setState('wrong')
  }
  const mm = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
  const btn = 'min-h-[56px] rounded-2xl px-6 text-xl font-bold'
  return <div ref={box} role="dialog" aria-modal="true" aria-label="חדר בריחה לחנוכה — מצב מקרן" className="fixed inset-0 z-[1000] overflow-auto bg-slate-900 text-white" dir="rtl">
    <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-4 p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xl font-bold">🕎 חדר בריחה לחנוכה · {track.label}</span>
        <span className="rounded-xl bg-white/10 px-3 py-1 font-mono text-2xl" aria-label="זמן שעבר">⏱️ {mm}</span>
        <button type="button" onClick={onClose} className="min-h-[44px] rounded-xl bg-white/15 px-4 font-bold">✕ יציאה</button>
      </div>
      {step >= 0 && step <= n && <LockBoxes track={track} digits={found} big />}

      {step === -1 && <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="w-full max-w-xl rounded-3xl bg-white p-4"><StationArt visual={{ kind: 'oilDays', days: 8 }} label="פך שמן ושמונה נרות" /></div>
        <h2 className="text-4xl font-black sm:text-5xl">פך השמן נעלם!</h2>
        <p className="max-w-3xl text-2xl leading-relaxed sm:text-3xl">{ESCAPE_STORY.intro}</p>
        <p className="text-xl opacity-80">{n} תחנות · כל תחנה נותנת ספרה אחת של הקוד</p>
        <button type="button" onClick={() => go(0)} className={`${btn} bg-yellow-400 text-slate-900`}>מתחילים! ←</button>
      </div>}

      {s && <div className="flex flex-1 flex-col gap-4">
        <h2 className="text-center text-4xl font-black">{s.icon} תחנה {step + 1}: {s.title}</h2>
        <div className="mx-auto h-56 w-full max-w-2xl rounded-3xl bg-white p-3 sm:h-72"><StationArt visual={s.visual} label={s.title} /></div>
        <p className="text-center text-2xl leading-relaxed sm:text-3xl">{s.story}</p>
        <p className="text-center text-3xl font-black text-yellow-300 sm:text-4xl">{s.question}</p>
        {hints > 0 && <ul className="mx-auto max-w-3xl space-y-1 text-center text-xl text-sky-200">{s.hints.slice(0, hints).map(h => <li key={h}>💡 {h}</li>)}</ul>}
        {found[step] === undefined ? <form onSubmit={check} className="flex flex-wrap items-center justify-center gap-3">
          <input value={value} onChange={e => { setValue(e.target.value); setState(null) }} inputMode="numeric" aria-label="התשובה של הכיתה" className="h-16 w-36 rounded-2xl border-4 border-yellow-400 bg-white text-center text-4xl font-black text-slate-900" />
          <button type="submit" className={`${btn} bg-green-500 text-slate-900`}>בדיקה</button>
          {hints < s.hints.length && <button type="button" onClick={() => setHints(h => h + 1)} className={`${btn} bg-sky-500 text-slate-900`}>💡 רמז</button>}
          <button type="button" onClick={reveal} className={`${btn} bg-white/15`}>הצגת התשובה</button>
        </form> : <div className="text-center">
          <p className="text-3xl font-black text-green-300">✅ נכון! הספרה {s.answer} נכנסת למנעול.</p>
          <p className="mt-1 text-xl opacity-90">{s.solution}</p>
          <button type="button" onClick={() => go(step + 1)} className={`${btn} mt-4 bg-yellow-400 text-slate-900`}>{step + 1 < n ? 'לתחנה הבאה ←' : 'אל המנעול ←'}</button>
        </div>}
        <p aria-live="polite" className="min-h-[2rem] text-center text-2xl font-bold text-red-300">{state === 'wrong' && 'עוד לא… נסו שוב או בקשו רמז.'}</p>
      </div>}

      {step === n && <form onSubmit={check} className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <h2 className="text-4xl font-black">🔒 המנעול</h2>
        <p className="max-w-3xl text-2xl">כתבו את הספרות לפי סדר התחנות, משמאל לימין — כמו שכותבים מספר.</p>
        <input value={value} onChange={e => { setValue(e.target.value); setState(null) }} inputMode="numeric" dir="ltr" aria-label="הקוד של המנעול" className="h-20 w-72 rounded-2xl border-4 border-yellow-400 bg-white text-center text-5xl font-black tracking-[0.3em] text-slate-900" />
        <button type="submit" className={`${btn} bg-green-500 text-slate-900`}>פותחים את התיבה 🔓</button>
        <p aria-live="polite" className="min-h-[2rem] text-2xl font-bold text-red-300">{state === 'wrong' && 'התיבה עדיין נעולה. בדקו את סדר הספרות.'}</p>
      </form>}

      {step > n && <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="text-8xl" aria-hidden="true">🎉🕎🎉</div>
        <h2 className="text-5xl font-black text-yellow-300">התיבה נפתחה!</h2>
        <p className="max-w-3xl text-2xl leading-relaxed sm:text-3xl">{ESCAPE_STORY.finale}</p>
        <p className="text-2xl">הקוד: <bdi dir="ltr" className="font-black">{codeOf(track)}</bdi> · הזמן שלכם: <b>{mm}</b></p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => { setFound([]); setSecs(0); go(-1) }} className={`${btn} bg-white/15`}>משחקים שוב</button>
          <button type="button" onClick={onClose} className={`${btn} bg-yellow-400 text-slate-900`}>סיום</button>
        </div>
      </div>}

      {step >= 0 && step <= n && <div className="flex justify-between">
        <button type="button" onClick={() => go(step - 1)} className="min-h-[44px] rounded-xl bg-white/10 px-4 font-bold">→ הקודם</button>
        {step < n && found[step] === undefined && <button type="button" onClick={() => go(step + 1)} className="min-h-[44px] rounded-xl bg-white/10 px-4 font-bold">דילוג ←</button>}
      </div>}
    </div>
  </div>
}

// ── Print kit ───────────────────────────────────────────────────────────────
const cardStyle = { fontFamily: 'Heebo, Arial, sans-serif', alignItems: 'stretch', textAlign: 'center' }
function PrintKit({ track }) {
  const code = codeOf(track), cards = lockCards(track)
  return <>
    <article className="buga-flow" style={{ fontFamily: 'Heebo, Arial, sans-serif' }}>
      <h2 style={{ fontSize: 24, margin: '0 0 4px' }}>🕎 חדר בריחה לחנוכה — דף למורה ולמנחה</h2>
      <p style={{ margin: '0 0 8px', fontSize: 14 }}>{track.label} · {track.ages} · {track.duration} · {track.stations.length} תחנות</p>
      <p style={{ margin: '0 0 8px', fontSize: 14 }}><b>מקריאים בפתיחה:</b> {ESCAPE_STORY.intro}</p>
      <h3 style={{ fontSize: 16, margin: '8px 0 2px' }}>הכנה (10 דקות)</h3>
      <ol style={{ margin: '0 0 6px', paddingRight: 20, fontSize: 13.5, listStyle: 'decimal' }}>
        <li>מדפיסים את כרטיסי התחנות ותולים או מחביאים אותם בכיתה, כל אחד במקום אחר.</li>
        <li>מדפיסים דף מנעול לכל קבוצה (שני דפים בעמוד). בכל ריבוע כותבים את הספרה של התחנה.</li>
        <li>מנעול מנייר: גוזרים את 6 כרטיסי הקוד, מקפלים בכל כרטיס את הכנף על ההודעה ומדביקים בסלוטייפ. בכרטיס הנכון (הקוד <bdi dir="ltr"><b>{code}</b></bdi>) כותבים איפה מחכה הפרס.</li>
        <li>הכלל: כל קבוצה פותחת רק כרטיס אחד! קבוצה שפתחה כרטיס לא נכון מחכה דקה, בודקת שוב ומנסה עוד פעם. אפשר גם להשתמש בקופסה עם מנעול קוד אמיתי.</li>
        <li>פרס בתיבה: מטבעות שוקולד, סביבונים או מדבקות — ופך שמן מצויר שחוזר לחנוכייה.</li>
      </ol>
      <h3 style={{ fontSize: 16, margin: '8px 0 4px' }}>תשובות (למורה בלבד) · הקוד: <bdi dir="ltr">{code}</bdi></h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead><tr style={{ borderBottom: '2px solid #111' }}><th style={{ textAlign: 'right', padding: 4 }}>תחנה</th><th style={{ textAlign: 'right', padding: 4 }}>ספרה</th><th style={{ textAlign: 'right', padding: 4 }}>פתרון ורמז</th></tr></thead>
        <tbody>{track.stations.map((s, i) => <tr key={s.id} style={{ borderBottom: '1px solid #ccc' }}>
          <td style={{ padding: 4, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{i + 1}. {s.icon} {s.title}</td>
          <td style={{ padding: 4, fontWeight: 800, fontSize: 16, verticalAlign: 'top' }}>{s.answer}</td>
          <td style={{ padding: 4, verticalAlign: 'top' }}>{s.solution} <span style={{ color: '#555' }}>רמז: {s.hints[0]}</span></td>
        </tr>)}</tbody>
      </table>
      <p style={{ marginTop: 8, fontSize: 13.5 }}><b>בסיום מקריאים:</b> {ESCAPE_STORY.finale}</p>
    </article>

    {track.stations.map((s, i) => <article key={s.id} className="buga-a4" style={cardStyle}>
      <h2 style={{ fontSize: 30, color: INK }}>{s.icon} תחנה {i + 1}: {s.title}</h2>
      <div style={{ height: '34%', margin: '6px 0' }}><StationArt visual={s.visual} label={s.title} /></div>
      <p style={{ fontSize: 21, lineHeight: 1.55, margin: '8px 0' }}>{s.story}</p>
      <p style={{ fontSize: 24, fontWeight: 800, margin: '8px 0' }}>{s.question}</p>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 20, fontWeight: 700 }}>
        <span>הספרה של התחנה:</span><span style={{ width: 70, height: 80, border: '4px solid #111', borderRadius: 12, display: 'inline-block' }} />
      </div>
      <p style={{ fontSize: 15, marginTop: 10 }}>כתבו את הספרה בריבוע {i + 1} בדף המנעול {s.icon}</p>
      <footer>עוגה בוגה · ugabuga.co.il</footer>
    </article>)}

    <article className="buga-a4" style={cardStyle}>
      {[0, 1].map(k => <section key={k} style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: k ? 'none' : '2px dashed #999', padding: '6px 0' }}>
        <h2 style={{ fontSize: 26 }}>🔒 דף המנעול — {track.label}</h2>
        <p style={{ fontSize: 16, margin: '0 0 10px' }}>שם הקבוצה: ____________________</p>
        <div dir="ltr" style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          {track.stations.map((s, i) => <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 30 }}>{s.icon}</span>
            <span style={{ width: 62, height: 74, border: '4px solid #111', borderRadius: 12, display: 'inline-block' }} />
            <span style={{ fontSize: 15, fontWeight: 700 }}>{i + 1}</span>
          </div>)}
        </div>
        <p style={{ fontSize: 15, marginTop: 10 }}>בכל ריבוע כותבים את הספרה מהתחנה עם אותו ציור. הקוד נקרא משמאל לימין, כמו מספר.</p>
      </section>)}
    </article>

    <article className="buga-a4" style={{ ...cardStyle, justifyContent: 'flex-start' }}>
      <h2 style={{ fontSize: 22 }}>🔐 המנעול מנייר — {track.label}</h2>
      <p style={{ fontSize: 12.5, margin: '0 0 6px' }}>גוזרים כל כרטיס בקו החיצוני, מקפלים את הכנף (בצד שמאל) על ההודעה לאורך הקו המקווקו ומדביקים. פותחים רק את הכרטיס עם הקוד שמצאתם!</p>
      {cards.map((c, i) => <div key={c.code} style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '14.2%', border: '2px solid #111', borderRadius: 8, marginTop: i ? 6 : 0, overflow: 'hidden' }}>
        <div style={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fef3c7', borderLeft: '2px solid #111' }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>קוד</span>
          <bdi dir="ltr" style={{ fontSize: 30, fontWeight: 900, letterSpacing: 4 }}>{c.code}</bdi>
        </div>
        <div style={{ width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', fontSize: 14, lineHeight: 1.35, borderLeft: '2px dashed #555' }}>
          {c.right ? <span><b>🎉 התיבה נפתחה!</b> פך השמן והפרס מחכים לכם ב: ________________</span> : <span>{WRONG_MESSAGES[i % WRONG_MESSAGES.length]}</span>}
        </div>
        <div style={{ width: '30%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#777' }}>✂️ כנף: מקפלים על ההודעה ←</div>
      </div>)}
      <footer>עוגה בוגה · ugabuga.co.il</footer>
    </article>
  </>
}

// ── Page ────────────────────────────────────────────────────────────────────
const FAQ = [
  { q: 'לאיזה גיל מתאים חדר הבריחה לחנוכה?', a: 'יש שתי רמות: גן חובה (גיל ⁦5–6⁩) עם ספירה וחשבון קטן בעזרת ציורים, וכיתות ב׳–ד׳ עם חיבור בכמה שלבים, כפל כחיבור חוזר וגימטריה של אותיות הסביבון. לכיתות ה׳ ומעלה מתאים יותר "פך השמן האבוד" ברמה הקשה.' },
  { q: 'איך מפעילים את החדר על המקרן?', a: 'בוחרים רמה ולוחצים "מצב מקרן". המסך עובר למסך מלא עם טקסט גדול: מקריאים את הסיפור, הכיתה פותרת תחנה אחרי תחנה, ואתם מקלידים את התשובה, נותנים רמז או מציגים את הפתרון. כל ספרה נכנסת למנעול שבראש המסך, ובסוף מקלידים את הקוד.' },
  { q: 'מה זה מנעול מנייר?', a: 'שישה כרטיסים להדפסה, ועל כל אחד קוד אחר. מאחורי כנף מקופלת יש הודעה, ורק בכרטיס של הקוד הנכון כתוב איפה הפרס. כל קבוצה רשאית לפתוח כרטיס אחד בלבד, ולכן היא חייבת לפתור קודם את כל התחנות. לא צריך לקנות מנעול.' },
  { q: 'כמה זמן לוקח החדר?', a: 'בגן ⁦15–20⁩ דקות, ובכיתות ב׳–ד׳ ⁦20–30⁩ דקות. עוד כחמש דקות להכנה בכיתה: לתלות את כרטיסי התחנות ולחלק דף מנעול לכל קבוצה.' },
  { q: 'אפשר לשחק בבית עם הילדים?', a: 'כן. מדפיסים את התחנות ומחביאים אותן בבית — ליד החנוכייה, במטבח ליד הסופגניות, ליד הסביבונים. הילדים מוצאים תחנה, פותרים וכותבים את הספרה בדף המנעול. אפשר גם לשחק על המסך של המחשב או של הטלוויזיה.' },
  { q: 'צריך להירשם?', a: 'לא. הכול בחינם ובלי הרשמה, ולא שומרים שום פרט על הילדים.' },
]

export default function HanukkahEscapeRoom() {
  const [trackId, setTrackId] = useState('school')
  const [projector, setProjector] = useState(false)
  const [print, setPrint] = useState(false)
  const track = trackById(trackId)
  const close = useCallback(() => setProjector(false), [])
  return <HanukkahShell crumb="חדר בריחה לחנוכה">
    <SEO title="חדר בריחה לחנוכה לכיתה ולגן — על המקרן או להדפסה" description="חדר בריחה לחנוכה מוכן: מצב מקרן לכל הכיתה, גרסה להדפסה עם מנעול קוד מנייר, ושתי רמות — גן חובה וכיתות ב׳–ד׳. נרות, סופגניות, סביבון ונס פך השמן. בחינם, בלי הרשמה." path={PATH} structuredData={faqSchema(FAQ)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🔐 חדר בריחה לחנוכה לכיתה ולגן</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">פך השמן נעלם, והסביבון השובב נעל אותו בתיבה! כל תחנה מסתירה ספרה אחת של הקוד. משחקים על המקרן עם כל הכיתה, או מדפיסים תחנות ומנעול מנייר — בלי לקנות כלום.</p>

    <div className="mx-auto mb-6 max-w-3xl wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-4 sketch-shadow-sm">
      <Choice label="בחירת רמה" value={trackId} onChange={setTrackId} options={ESCAPE_TRACKS.map(t => [t.id, `${t.label} (${t.ages})`])} />
      <p className="mt-3 text-center"><b>{track.label}:</b> {track.stations.length} תחנות · {track.duration} · {track.skills}</p>
    </div>

    <div className="mb-8 flex flex-wrap justify-center gap-3">
      <button type="button" onClick={() => setProjector(true)} className="min-h-[52px] rounded-2xl bg-slate-900 px-6 text-xl font-bold text-white">🖥️ מצב מקרן לכל הכיתה</button>
      <button data-print-main type="button" onClick={() => setPrint(true)} className="min-h-[52px] rounded-2xl bg-blue-700 px-6 text-xl font-bold text-white">🖨️ הדפסה: תחנות + מנעול מנייר</button>
    </div>

    <h2 className="mb-3 text-2xl font-bold">🗺️ התחנות — {track.label}</h2>
    <ol className="mb-4 grid list-none gap-4 p-0 sm:grid-cols-2">
      {track.stations.map((s, i) => <li key={s.id} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 sketch-shadow-sm">
        <h3 className="mb-2 text-xl font-bold">{s.icon} תחנה {i + 1}: {s.title}</h3>
        <div className="mb-2 h-36"><StationArt visual={s.visual} label={s.title} /></div>
        <p className="leading-relaxed">{s.story}</p>
        <p className="mt-1 font-bold">{s.question}</p>
      </li>)}
    </ol>
    <div className="mb-10 rounded-2xl border-2 border-[var(--border)] bg-slate-900 p-4 text-white">
      <p className="mb-2 text-center font-bold">כך נראה המנעול: ספרה מכל תחנה, לפי הסדר</p>
      <LockBoxes track={track} />
      <details className="mt-3 text-center"><summary className="cursor-pointer font-bold text-yellow-300">למורה: הקוד והתשובות</summary><p className="mt-2">הקוד: <bdi dir="ltr" className="font-black">{codeOf(track)}</bdi> · {track.stations.map((s, i) => `${i + 1}: ${s.solution}`).join(' · ')}</p></details>
    </div>

    <section className="mb-8 grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border-2 border-[var(--border)] bg-blue-50 p-5">
        <h2 className="mb-2 text-2xl font-bold">👩‍🏫 למורה ולגננת: על המקרן</h2>
        <ol className="list-decimal space-y-1 pr-5 leading-relaxed">
          <li>מחלקים את הכיתה ל־⁦3–5⁩ קבוצות, ונותנים לכל קבוצה דף מנעול (מודפס, או פשוט דף ריק עם ריבועים).</li>
          <li>פותחים את מצב המקרן ומקריאים את סיפור הפתיחה.</li>
          <li>בכל תחנה הקבוצות פותרות בשקט וכותבות את הספרה. אחר כך קבוצה אחת אומרת את התשובה ואתם מקלידים.</li>
          <li>נתקעו? כפתור "רמז" מוסיף רמז אחד בכל פעם. הראשון אף פעם לא מגלה את התשובה.</li>
          <li>בסוף כל הקבוצות מראות את הקוד, ומקלידים אותו במנעול. הטיימר שבפינה מראה כמה זמן לקח.</li>
        </ol>
      </div>
      <div className="rounded-3xl border-2 border-[var(--border)] bg-yellow-50 p-5">
        <h2 className="mb-2 text-2xl font-bold">🖨️ להדפסה: בכיתה, בגן ובבית</h2>
        <ol className="list-decimal space-y-1 pr-5 leading-relaxed">
          <li>מדפיסים: דף למנחה עם התשובות, כרטיס A4 לכל תחנה, דף מנעול לקבוצות וכרטיסי המנעול מנייר.</li>
          <li>מחביאים את התחנות: ליד החנוכייה, ליד מגש הסופגניות, ליד הסביבונים.</li>
          <li>מכינים את המנעול: מקפלים את הכנף של כל כרטיס על ההודעה, ובכרטיס הנכון כותבים איפה הפרס.</li>
          <li>הקבוצה שאספה את כל הספרות בוחרת כרטיס אחד בלבד ופותחת. טעו? מחכים דקה ובודקים שוב.</li>
          <li>בבית: הורה אחד הוא "שומר התיבה", והילדים יכולים לשחק יחד כקבוצה אחת.</li>
        </ol>
      </div>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5">
      <h2 className="mb-2 text-2xl font-bold">🎯 רוצים עוד?</h2>
      <p className="leading-relaxed">לילדים בני ⁦7–12⁩ יש גם את <Link className="font-bold underline" to="/tools/escape-rooms/hanukkah-oil-jar">פך השמן האבוד</Link> — חדר בריחה ארוך יותר לחנוכה, עם שלוש רמות קושי, משחק על המסך וקיט הפעלה להדפסה. ולפני שמתחילים, אפשר לחמם את הראש עם <Link className="font-bold underline" to="/holidays/hanukkah/quiz">חידון חנוכה</Link> או עם <Link className="font-bold underline" to="/holidays/hanukkah/math">חשבון של חנוכה</Link>.</p>
    </section>

    {projector && <Projector track={track} onClose={close} />}
    {print && <PrintPreview title={`חדר בריחה לחנוכה — ${track.label}`} onClose={() => setPrint(false)}>
      <PrintKit track={track} />
    </PrintPreview>}

    <div className="mt-10"><SeoBody paragraphs={[
      'חדר בריחה לחנוכה הופך את סיפור החג לפעילות שכולם משתתפים בה: סופרים נרות בחנוכייה, מחשבים כמה סופגניות נשארו במגש, מחברים את ערכי האותיות שעל הסביבון ונזכרים כמה ימים דלק השמן בנס. כל תחנה מסתירה ספרה אחת, וכל הספרות יחד פותחות את התיבה שבה מחכה פך השמן.',
      'יש שתי רמות. בגן חובה ארבע תחנות עם ציור גדול בכל אחת, והתשובות הן ספירה וחשבון קטן עד 8. בכיתות ב׳–ד׳ חמש תחנות עם חיבור בכמה שלבים, כפל כחיבור חוזר וגימטריה. אפשר לשחק עם כל הכיתה על המקרן, עם טקסט גדול, רמזים בהדרגה וטיימר, או להדפיס את התחנות ולהחביא אותן בכיתה, בגן או בבית.',
      'המנעול מנייר פותר את הבעיה שאין לכם מנעול קוד: שישה כרטיסים עם קודים שונים, ורק מאחורי הכנף של הכרטיס הנכון כתוב איפה הפרס. כל קבוצה פותחת כרטיס אחד בלבד, ולכן אי אפשר לנחש — צריך לפתור את כל התחנות.',
    ]} faq={FAQ} related={[{ label: 'חדרי בריחה לילדים', href: '/tools/escape-rooms' }, { label: 'פך השמן האבוד', href: '/tools/escape-rooms/hanukkah-oil-jar' }, { label: 'חשבון של חנוכה', href: '/holidays/hanukkah/math' }, { label: 'כתב סתרים וצפנים', href: '/tools/secret-codes' }, { label: 'חנוכה לילדים', href: '/holidays/hanukkah' }]} /></div>
  </HanukkahShell>
}
