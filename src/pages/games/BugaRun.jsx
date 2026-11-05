import { useCallback, useEffect, useRef, useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { shareOnWhatsApp, shareLink } from '../../utils/share'
import { act, newGame, score, step } from './run/runGame'
import { createSound } from './run/runSound'

// "בוגה בורח": a 3D running game, drawn from code. The best score stays on this device, nothing is sent anywhere.
const PATH = '/buga-run'
const BEST_KEY = 'buga-run-best'
const MUTE_KEY = 'buga-run-mute'
const STEP = 1 / 120
const SWIPE_PX = 26
const CAUSES = {
  wall: 'בוגה נתקע בקיר', low: 'בוגה מעד על גזע', high: 'בוגה נתקע בשער', pit: 'בוגה נפל לבור', corner: 'בוגה לא פנה בזמן',
}
const KEYS = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'jump', ArrowDown: 'slide', ' ': 'jump', a: 'left', d: 'right', w: 'jump', s: 'slide',
}
const FAQ = [
  { q: 'איך משחקים בבוגה בורח?', a: 'בטלפון מחליקים באצבע: ימינה ושמאלה כדי לעבור נתיב ולפנות, למעלה כדי לקפוץ ולמטה כדי להחליק. במחשב משחקים בחיצים או במקש הרווח.' },
  { q: 'צריך להוריד משהו או להירשם?', a: 'לא. המשחק חינמי, עובד בדפדפן בטלפון ובמחשב, בלי הורדה ובלי הרשמה. השיא נשמר רק במכשיר שלכם.' },
  { q: 'מה זה מצב לוח הכפל?', a: 'במסלול מופיעים שערים עם שלוש תשובות. רצים דרך התשובה הנכונה ומקבלים בונוס. התשובות הן ללוח הכפל עד 9 כפול 9.' },
]
const BODY = ['בוגה בורח הוא משחק ריצה חינמי בתלת־ממד של עוגה בוגה. בוגה והתוכי רצים לבד, ואתם מחליטים מתי לקפוץ, להחליק, לעבור נתיב ולפנות. העולם מתחלף בדרך מהג׳ונגל למדבר ולעיר בלילה, והקצב עולה ככל שמתקדמים. מכה ראשונה מקרבת את עוגיית הענק, ומכה שנייה מיד אחריה מסיימת את הריצה.']
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode */ } }
const hasWebGL = () => { try { return !!document.createElement('canvas').getContext('webgl2') } catch { return false } }

function Play({ mode, muted, setMuted, onOver, onExit }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const soundRef = useRef(null)
  const [hud, setHud] = useState({ score: 0, coins: 0, shield: false, magnet: false, stumble: false, gate: null })
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(true)
  const pausedRef = useRef(false)
  const onOverRef = useRef(onOver)
  useEffect(() => { onOverRef.current = onOver }, [onOver])
  useEffect(() => { soundRef.current?.setMuted(muted) }, [muted])

  useEffect(() => {
    let raf = 0, stopped = false, scene = null, last = 0, extra = 0, hudAt = 0
    const s = newGame({ seed: Math.floor(Math.random() * 2 ** 31), mode })
    stateRef.current = s
    const sound = createSound()
    soundRef.current = sound
    sound.setMuted(read(MUTE_KEY, false))
    sound.start()
    const onResize = () => scene?.resize()
    const frame = now => {
      if (stopped) return
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000 || 0)
      last = now
      if (!pausedRef.current && !s.over) {
        extra += dt
        while (extra >= STEP) { step(s, STEP); extra -= STEP }
      }
      for (const e of s.events) sound.play(e === 'pad' ? 'jump' : e)
      scene.render(s, pausedRef.current ? 0 : dt)
      s.events.length = 0
      if (now - hudAt > 120 || s.over) {
        hudAt = now
        setHud({ score: score(s), coins: s.coins, shield: s.shield, magnet: s.magnet > 0, stumble: s.stumble > 0, gate: s.gate?.text || null })
      }
      if (s.over) { stopped = true; sound.stop(); setTimeout(() => onOverRef.current({ score: score(s), coins: s.coins, metres: Math.floor(s.run), right: s.right, wrong: s.wrong, cause: s.cause }), 1700) ; scene.render(s, 0) }
    }
    import('./run/runScene').then(({ createScene }) => {
      if (stopped) return
      scene = createScene(canvasRef.current)
      scene.reset(s)
      scene.resize()
      window.addEventListener('resize', onResize)
      setLoading(false)
      last = performance.now()
      raf = requestAnimationFrame(frame)
    })
    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      scene?.dispose()
      sound.dispose()
    }
  }, [mode])

  const togglePause = useCallback(v => {
    const next = v ?? !pausedRef.current
    pausedRef.current = next
    setPaused(next)
  }, [])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' || e.key === 'p') { togglePause(); return }
      const cmd = KEYS[e.key]
      if (!cmd) return
      e.preventDefault()
      if (!pausedRef.current && stateRef.current) act(stateRef.current, cmd)
    }
    const onHide = () => { if (document.hidden) togglePause(true) }
    window.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onHide)
    const body = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('visibilitychange', onHide); document.body.style.overflow = body }
  }, [togglePause])

  // A swipe counts as soon as the finger has moved far enough, without waiting for it to lift.
  const swipe = useRef(null)
  const down = e => { swipe.current = { x: e.clientX, y: e.clientY } }
  const move = e => {
    const from = swipe.current
    if (!from || pausedRef.current || !stateRef.current) return
    const dx = e.clientX - from.x, dy = e.clientY - from.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX) return
    swipe.current = null
    act(stateRef.current, Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'jump' : 'slide'))
  }

  return <div className="fixed inset-0 z-[200] select-none overflow-hidden bg-sky-200" style={{ touchAction: 'none' }} onPointerDown={down} onPointerMove={move} onPointerUp={() => { swipe.current = null }} onPointerCancel={() => { swipe.current = null }}>
    <canvas ref={canvasRef} className="block h-full w-full" aria-label="המשחק בוגה בורח" />
    {loading && <div className="absolute inset-0 grid place-items-center bg-sky-100 text-2xl font-bold" role="status">בוגה מתחמם…</div>}
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3" dir="rtl" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
      <div className="flex flex-col gap-1.5">
        <div className="rounded-2xl border-2 border-[#14162d] bg-white/90 px-3 py-1 text-xl font-black tabular-nums" aria-label="ניקוד">{hud.score.toLocaleString('en-US')}</div>
        <div className="w-fit rounded-2xl border-2 border-[#14162d] bg-[#fff4bb] px-3 py-0.5 font-bold tabular-nums">🪙 {hud.coins}</div>
        <div className="flex gap-1 text-xl">{hud.shield && <span title="מגן">🛡️</span>}{hud.magnet && <span title="מגנט">🧲</span>}</div>
      </div>
      <div className="pointer-events-auto flex gap-1.5">
        <button type="button" onClick={() => setMuted(!muted)} className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#14162d] bg-white/90 text-xl" aria-label={muted ? 'להפעיל צליל' : 'להשתיק'}>{muted ? '🔇' : '🔊'}</button>
        <button type="button" onClick={() => togglePause()} className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#14162d] bg-white/90 text-xl" aria-label="השהיה">⏸️</button>
      </div>
    </div>
    {hud.stumble && <div className="pointer-events-none absolute inset-x-0 top-24 text-center"><span className="rounded-full border-2 border-[#14162d] bg-rose-600 px-4 py-1 font-black text-white">🍪 העוגייה ממש מאחוריך!</span></div>}
    {hud.gate && <div className="pointer-events-none absolute inset-x-0 top-1/4 text-center" dir="ltr"><span className="rounded-2xl border-[3px] border-[#14162d] bg-white px-5 py-1 text-4xl font-black">{hud.gate} = ?</span></div>}
    {paused && <div className="absolute inset-0 grid place-items-center bg-[#14162d]/60 p-4" dir="rtl" onPointerDown={e => e.stopPropagation()}>
      <div className="w-full max-w-xs rounded-3xl border-[3px] border-[#14162d] bg-white p-5 text-center">
        <h2 className="m-0 text-2xl font-black">עצרנו רגע</h2>
        <button type="button" autoFocus onClick={() => togglePause(false)} className="mt-3 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-lg font-black text-white">▶️ ממשיכים</button>
        <button type="button" onClick={onExit} className="mt-2 w-full rounded-2xl border-2 border-[#14162d] px-4 py-2 font-bold">יציאה מהמשחק</button>
      </div>
    </div>}
  </div>
}

export default function BugaRun() {
  const [phase, setPhase] = useState('menu')
  const [mode, setMode] = useState('run')
  const [round, setRound] = useState(0)
  const [result, setResult] = useState(null)
  const [best, setBest] = useState(() => read(BEST_KEY, 0))
  const [muted, setMutedState] = useState(() => read(MUTE_KEY, false))
  const [webgl] = useState(hasWebGL)
  const setMuted = v => { setMutedState(v); write(MUTE_KEY, v) }
  const start = m => { setMode(m); setRound(r => r + 1); setPhase('play') }
  const over = useCallback(r => {
    setBest(b => {
      const record = r.score > b
      setResult({ ...r, record })
      if (record) write(BEST_KEY, r.score)
      return record ? r.score : b
    })
    setPhase('over')
  }, [])
  const shareText = result ? `רצתי ${result.metres.toLocaleString('en-US')} מטר בבוגה בורח ועשיתי ${result.score.toLocaleString('en-US')} נקודות 🏃🍪 תנסו לנצח אותי:` : ''

  return <div className="mx-auto max-w-3xl px-4 pb-16" dir="rtl">
    <SEO title="בוגה בורח — משחק ריצה בתלת־ממד בחינם, בלי הורדה" description="משחק ריצה בתלת־ממד בדפדפן: בורחים מעוגיית הענק, קופצים, מחליקים ופונים בזמן. חינם, בלי הורדה ובלי הרשמה, בטלפון ובמחשב. כולל מצב לוח הכפל." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: 'בוגה בורח' }]} />
    {phase === 'play' && <Play key={round} mode={mode} muted={muted} setMuted={setMuted} onOver={over} onExit={() => setPhase('menu')} />}

    <section className="mt-3 overflow-hidden rounded-3xl border-[3px] border-[#14162d] bg-gradient-to-bl from-violet-100 via-pink-50 to-yellow-100 p-5 text-center">
      <img src="/images/home-mascot-play.webp" alt="בוגה, הדמות הצהובה עם התוכי" width="220" height="220" className="mx-auto h-44 w-44 object-contain" />
      <h1 className="m-0 text-4xl font-black">בוגה בורח 🏃🍪</h1>
      {phase === 'over' && result ? <div className="mt-2">
        <p className="m-0 text-lg font-bold">{CAUSES[result.cause] || 'הריצה נגמרה'}</p>
        {result.record && <p className="m-0 text-xl font-black text-rose-600">🏆 שיא חדש!</p>}
        <p className="m-0 text-4xl font-black tabular-nums">{result.score.toLocaleString('en-US')}</p>
        <p className="m-0 text-[var(--muted-foreground)]">{result.metres.toLocaleString('en-US')} מטר · 🪙 {result.coins}{result.right + result.wrong > 0 ? ` · ✅ ${result.right} מתוך ${result.right + result.wrong}` : ''} · השיא שלך {best.toLocaleString('en-US')}</p>
      </div> : <p className="mx-auto mt-1 max-w-md text-lg">עוגיית הענק מתגלגלת אחריכם! קופצים, מחליקים, פונים בזמן ואוספים מטבעות. כמה רחוק תגיעו?</p>}
      {webgl ? <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => start(phase === 'over' ? mode : 'run')} className="rounded-2xl border-[3px] border-[#14162d] bg-emerald-600 px-4 py-3 text-xl font-black text-white">{phase === 'over' ? '🔁 רצים שוב' : '▶️ להתחיל לרוץ'}</button>
        <button type="button" onClick={() => start(phase === 'over' && mode === 'times' ? 'run' : 'times')} className="rounded-2xl border-[3px] border-[#14162d] bg-[#fff4bb] px-4 py-3 text-xl font-black">{phase === 'over' && mode === 'times' ? '🏃 בלי תרגילים' : '✖️ עם לוח הכפל'}</button>
      </div> : <p className="mt-3 font-bold text-rose-700" role="alert">הדפדפן הזה לא תומך בתלת־ממד. נסו בכרום או בספארי מעודכן.</p>}
      {phase === 'over' && result && <button type="button" onClick={() => shareOnWhatsApp(`${shareText}\n${shareLink(PATH)}`)} className="mt-2 w-full rounded-2xl bg-[#25D366] px-4 py-2 font-bold text-white">💬 לאתגר חברים בוואטסאפ</button>}
      {phase === 'menu' && best > 0 && <p className="mb-0 mt-2 font-bold">השיא שלך: {best.toLocaleString('en-US')}</p>}
    </section>

    <section className="mt-5 grid gap-2 sm:grid-cols-2" aria-label="איך משחקים">
      {[['⬅️➡️', 'מחליקים הצידה', 'עוברים נתיב, ובפינה פונים לכיוון החץ'], ['⬆️', 'מחליקים למעלה', 'קופצים מעל גזעים ובורות'], ['⬇️', 'מחליקים למטה', 'מתכופפים מתחת לשערים'], ['⌨️', 'במחשב', 'חיצים או מקש רווח, ו־P להשהיה']].map(([e, t, d]) => <div key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-3"><strong>{e} {t}</strong><div className="text-[var(--muted-foreground)]">{d}</div></div>)}
    </section>

    <SeoBody paragraphs={BODY} faq={FAQ} related={[{ label: 'כל המשחקים', href: '/games' }, { label: 'שאלות מכשילות', href: '/trick-questions' }, { label: 'חידון טריוויה', href: '/trivia' }]} />
  </div>
}
