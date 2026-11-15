import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { THEMES, LENGTHS, BANDS, MATH_RULE, buildRoutine, daySeed, seededRand, suggestedTheme } from '../../classroom/warmUp'

// "חימום לפני השיעור" — a 2–5 minute movement break for the projector. The teacher picks a theme
// and a length, presses start, and the screen leads the class move by move with a big timer.
const FAQ = [
  { q: 'מה זה חימום לפני השיעור?', a: 'הפסקת תנועה קצרה של 2–5 דקות בתחילת שיעור או באמצעו. התלמידים קמים ליד השולחן ועושים יחד תרגילים פשוטים שמופיעים על המקרן עם טיימר. אחרי כמה דקות של תנועה קל יותר להתרכז, ובסוף חימומי התנועה יש נשימה מרגיעה כדי לחזור ללמידה.' },
  { q: 'צריך מקום פנוי בכיתה?', a: 'לא. כל התרגילים נעשים בעמידה ליד הכיסא: ריצה במקום, מתיחות, קפיצות קטנות ותנועות ידיים. אין ריצה בכיתה, אין עבודה בזוגות ואין ציוד.' },
  { q: 'מה זה "החימום של היום"?', a: 'כל יום האתר בוחר סדרה קבועה לכל נושא, שווה לכל המורים. כך אפשר לעשות אותה בכמה כיתות, ולשלוח להורים או לצוות את אותו חימום. בכפתור "סדרה חדשה" מקבלים סדרה אחרת.' },
  { q: 'איך עובד "חשבון בתנועה"?', a: 'על המסך מופיע תרגיל. התלמידים פותרים בראש ועונים בגוף: תשובה זוגית — קופצים, תשובה אי־זוגית — נוגעים בכתפיים. באמצע הזמן התשובה מופיעה על המסך. בוחרים רמה: א׳–ב׳, ג׳–ד׳ או ה׳–ח׳.' },
  { q: 'אפשר להשתמש בזה גם בגן או בשיעור ספורט?', a: 'כן. בגן מתאים במיוחד "חימום חנוכה" ו"נרגעים אחרי הפסקה", ובשיעור חינוך גופני אפשר להשתמש בחימום הספורטיבי כפתיחה. החימום עובד גם בטלפון, בחינם ובלי הרשמה.' },
]

const pill = on => `min-h-[44px] rounded-full border-2 px-4 text-lg font-bold ${on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-400 bg-white text-slate-900'}`

function beep(ctxRef, freq = 880) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    const ctx = ctxRef.current || (ctxRef.current = new AC())
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.frequency.value = freq
    g.gain.setValueAtTime(0.15, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    o.connect(g).connect(ctx.destination)
    o.start(); o.stop(ctx.currentTime + 0.35)
  } catch { /* no sound is fine */ }
}

export default function WarmUp() {
  const [params] = useSearchParams()
  // ?theme=purim (from a holiday zone) opens on that theme; otherwise the season's suggestion.
  const [theme, setTheme] = useState(() => THEMES.some(t => t.id === params.get('theme')) ? params.get('theme') : suggestedTheme())
  const [minutes, setMinutes] = useState(3), [band, setBand] = useState('mid')
  const [seed, setSeed] = useState(() => daySeed()), [isToday, setIsToday] = useState(true)
  const [step, setStep] = useState(-1) // -1 = not started; steps.length = finished
  const [left, setLeft] = useState(0), [running, setRunning] = useState(false)
  const [sound, setSound] = useState(true), [full, setFull] = useState(false)
  const stage = useRef(null), audio = useRef(null)

  const salt = THEMES.findIndex(t => t.id === theme) * 97 + minutes * 7 + BANDS.findIndex(b => b.id === band)
  const steps = useMemo(() => buildRoutine({ theme, minutes, band }, seededRand(seed + salt)), [theme, minutes, band, seed, salt])
  const current = step >= 0 && step < steps.length ? steps[step] : null
  const finished = step >= steps.length

  useEffect(() => {
    if (!running || !current) return undefined
    const id = setInterval(() => setLeft(s => s - 1), 1000)
    return () => clearInterval(id)
  }, [running, current])

  useEffect(() => {
    if (!running || left > 0 || !current) return
    if (sound) beep(audio, step + 1 >= steps.length ? 660 : 880)
    const next = step + 1
    setStep(next)
    if (next < steps.length) setLeft(steps[next].seconds)
    else setRunning(false)
  }, [left, running, current, sound, step, steps])

  useEffect(() => {
    const onFs = () => setFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const reset = () => { setStep(-1); setRunning(false); setLeft(0) }
  const choose = fn => { fn(); reset() }
  const start = () => { if (sound) beep(audio, 660); setStep(0); setLeft(steps[0].seconds); setRunning(true) }
  const go = d => { const n = Math.min(Math.max(step + d, 0), steps.length - 1); setStep(n); setLeft(steps[n].seconds) }
  const fresh = () => choose(() => { setSeed(Math.floor(Math.random() * 1e9)); setIsToday(false) })
  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else stage.current?.requestFullscreen?.().catch(() => {})
  }

  const total = current ? current.seconds : 1
  const pct = current ? Math.max(0, Math.min(1, left / total)) : 0
  const showAnswer = current?.kind === 'math' && left <= Math.floor(total / 2)
  const themeInfo = THEMES.find(t => t.id === theme)

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="חימום לפני השיעור — הפסקת תנועה לכיתה על המקרן" description="חימום ספורטיבי של 2–5 דקות לפני השיעור, על המקרן עם טיימר: תרגילים ליד השולחן, חימום חנוכה, חשבון בתנועה, Simon says באנגלית ונשימות להרגעה. למורים ולגננות, חינם ובלי הרשמה." path="/classroom/warm-up" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'חימום לפני השיעור' }]} />
    <h1 className="mb-1 text-center text-4xl font-black sm:text-5xl"><span aria-hidden="true">🏃 </span>חימום לפני השיעור</h1>
    <p className="mb-5 text-center text-lg text-[var(--muted-foreground)]">3 דקות של תנועה ליד השולחן, על המקרן עם טיימר — והכיתה מוכנה ללמוד.</p>

    <section aria-label="הגדרות החימום" className="mb-5 space-y-3 rounded-3xl border-2 border-[var(--border)] bg-white p-4">
      <div role="group" aria-label="נושא" className="flex flex-wrap items-center gap-2"><b className="ml-1 text-lg">נושא:</b>
        {THEMES.map(t => <button key={t.id} type="button" aria-pressed={theme === t.id} onClick={() => choose(() => setTheme(t.id))} className={pill(theme === t.id)}><span aria-hidden="true">{t.emoji} </span>{t.label}</button>)}
      </div>
      <div role="group" aria-label="אורך" className="flex flex-wrap items-center gap-2"><b className="ml-1 text-lg">כמה זמן:</b>
        {LENGTHS.map(l => <button key={l.minutes} type="button" aria-pressed={minutes === l.minutes} onClick={() => choose(() => setMinutes(l.minutes))} className={pill(minutes === l.minutes)}>{l.minutes} דקות</button>)}
      </div>
      {theme === 'math' && <div role="group" aria-label="רמה" className="flex flex-wrap items-center gap-2"><b className="ml-1 text-lg">כיתה:</b>
        {BANDS.map(b => <button key={b.id} type="button" aria-pressed={band === b.id} onClick={() => choose(() => setBand(b.id))} className={pill(band === b.id)}>{b.label}</button>)}
      </div>}
      <p className="text-base text-slate-700">{isToday ? <>📅 זה <b>החימום של היום</b> — אותה סדרה לכל המורים היום.</> : '🎲 סדרה חדשה שנבחרה עכשיו.'} <button type="button" onClick={fresh} className="mr-1 font-bold underline">סדרה חדשה</button></p>
    </section>

    <section ref={stage} aria-label="מסך החימום" className={`rounded-3xl bg-sky-50 p-4 text-center sm:p-6 ${full ? 'flex h-screen flex-col justify-center overflow-auto' : ''}`}>
      {step < 0 && <div>
        <p className="text-6xl" aria-hidden="true">{themeInfo.emoji}</p>
        <h2 className="mt-2 text-3xl font-black sm:text-5xl">{themeInfo.label}</h2>
        <p className="mt-2 text-xl">{steps.length} תרגילים · {minutes} דקות · כל תרגיל {steps[0]?.seconds} שניות</p>
        {theme === 'math' && <p className="mt-2 text-xl font-bold">{MATH_RULE}</p>}
        <ol className="mx-auto mt-4 max-w-md list-decimal space-y-1 pr-6 text-right text-lg">
          {steps.map((s, i) => <li key={i} dir={s.ltr ? 'ltr' : undefined} className={s.ltr ? 'text-left' : ''}>{s.kind === 'math' ? s.title : `${s.emoji} ${s.title}`}</li>)}
        </ol>
        <button type="button" onClick={start} className="mt-5 min-h-[64px] rounded-full bg-green-600 px-10 text-3xl font-black text-white">▶ מתחילים!</button>
      </div>}

      {current && <div>
        <p className="text-lg font-bold text-slate-600">תרגיל {step + 1} מתוך {steps.length}</p>
        <p className="my-2 text-8xl sm:text-9xl" aria-hidden="true">{current.emoji}</p>
        <h2 dir={current.ltr ? 'ltr' : undefined} className="text-4xl font-black sm:text-6xl">{current.title}</h2>
        <p className="mx-auto mt-3 max-w-3xl text-2xl sm:text-3xl">{current.text}</p>
        {current.kind === 'math' && <p aria-live="polite" className="mt-3 min-h-[3rem] text-4xl font-black text-green-700 sm:text-5xl">{showAnswer ? `${current.answer} — ${current.even ? 'זוגי: קופצים! 🦘' : 'אי־זוגי: כתפיים! 🙆'}` : ''}</p>}
        <div className="mx-auto mt-5 max-w-xl">
          <div className="h-5 overflow-hidden rounded-full bg-white ring-2 ring-slate-300" aria-hidden="true"><div className="h-full rounded-full bg-sky-500 transition-[width] duration-1000 ease-linear" style={{ width: `${pct * 100}%` }} /></div>
          <p className="mt-2 text-5xl font-black tabular-nums" aria-label={`נשארו ${left} שניות`}>{Math.max(left, 0)}</p>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => go(-1)} disabled={step === 0} className="min-h-[52px] rounded-full border-2 border-slate-800 bg-white px-5 text-xl font-bold disabled:opacity-40">→ הקודם</button>
          <button type="button" onClick={() => setRunning(r => !r)} className="min-h-[52px] rounded-full bg-slate-900 px-6 text-xl font-black text-white">{running ? '⏸ עצירה' : '▶ המשך'}</button>
          <button type="button" onClick={() => go(1)} disabled={step >= steps.length - 1} className="min-h-[52px] rounded-full border-2 border-slate-800 bg-white px-5 text-xl font-bold disabled:opacity-40">הבא ←</button>
        </div>
      </div>}

      {finished && <div>
        <p className="text-7xl" aria-hidden="true">🎉</p>
        <h2 className="mt-2 text-4xl font-black sm:text-5xl">כל הכבוד! מתחילים את השיעור</h2>
        <p className="mt-2 text-xl">שבים במקום, לוקחים נשימה אחת עמוקה — ומתחילים.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={start} className="min-h-[52px] rounded-full bg-green-600 px-6 text-xl font-black text-white">🔁 שוב</button>
          <button type="button" onClick={fresh} className="min-h-[52px] rounded-full border-2 border-slate-800 bg-white px-6 text-xl font-bold">🎲 סדרה חדשה</button>
        </div>
      </div>}

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={toggleFull} className="min-h-[44px] rounded-full border-2 border-slate-800 bg-white px-4 font-bold">{full ? '↙️ יציאה ממסך מלא' : '⛶ מסך מלא למקרן'}</button>
        <button type="button" aria-pressed={sound} onClick={() => setSound(s => !s)} className="min-h-[44px] rounded-full border-2 border-slate-400 bg-white px-4 font-bold">{sound ? '🔔 צליל במעבר' : '🔕 בלי צליל'}</button>
        {step >= 0 && <button type="button" onClick={reset} className="min-h-[44px] rounded-full border-2 border-slate-400 bg-white px-4 font-bold">חזרה להתחלה</button>}
      </div>
    </section>

    <div className="mt-6 rounded-2xl bg-white p-4 text-lg">
      <h2 className="mb-2 text-2xl font-black">איך משתמשים בכיתה</h2>
      <ol className="list-decimal space-y-1 pr-6">
        <li>פותחים את העמוד על המקרן או על הלוח החכם ולוחצים "מסך מלא".</li>
        <li>בוחרים נושא ואורך. התלמידים קמים ועומדים ליד הכיסא.</li>
        <li>לוחצים "מתחילים!". כל תרגיל מוצג עם טיימר, וצליל קצר מסמן מעבר לתרגיל הבא.</li>
        <li>בסוף חימום התנועה יש נשימה מרגיעה — וחוזרים לשבת, מוכנים לשיעור.</li>
      </ol>
    </div>
    <p className="mt-6 text-center text-lg">עוד לכיתה: <Link className="font-bold underline" to="/classroom/math-tic-tac-toe">איקס־עיגול חשבוני</Link> · <Link className="font-bold underline" to="/tools/scoreboard">לוח ניקוד לקבוצות</Link> · <Link className="font-bold underline" to="/holidays/hanukkah">חנוכה בכיתה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'חימום לפני השיעור הוא הפסקת תנועה קצרה שהמורה מקרין/ה על הלוח: כמה תרגילים פשוטים ליד השולחן, כל אחד עם טיימר גדול, ובסוף נשימה מרגיעה. מחקרים על "הפסקות תנועה" בבית הספר מראים שכמה דקות של פעילות גופנית עוזרות לתלמידים להתרכז ולהתנהג טוב יותר בשיעור שאחריהן — במיוחד בשיעור ראשון בבוקר, אחרי הפסקה או בשעה השישית.',
      'יש חמישה נושאים: חימום ספורטיבי (ריצה במקום, קפיצות כוכב, פלמינגו, ברך למרפק), חימום חנוכה (סביבון, הנר הגבוה, סופגנייה תופחת, המכבים ומשחק נ־ג־ה־פ), חשבון בתנועה שבו עונים על תרגיל בקפיצה או בנגיעה בכתפיים, Simon says באנגלית עם הוראות כמו Touch your nose, ונרגעים אחרי הפסקה עם נשימת בלון ומתיחת חתול.',
      'כל יום יש "חימום של היום" — סדרה קבועה שווה לכל המורים — ואפשר לבקש סדרה חדשה בלחיצה. כל התרגילים בטוחים לעמידה ליד הכיסא, בלי ציוד ובלי לזוז בכיתה. העמוד עובד במחשב, בטאבלט ובטלפון, בחינם ובלי הרשמה.',
    ]} faq={FAQ} related={[{ label: 'משחקים לכיתה', href: '/games/classroom' }, { label: 'משחקים לכיתה בלי הכנה', href: '/guides/classroom-games-no-prep' }, { label: 'איקס־עיגול חשבוני לכיתה', href: '/classroom/math-tic-tac-toe' }, { label: 'חנוכה לילדים', href: '/holidays/hanukkah' }, { label: 'למורה — לפי כיתה', href: '/classroom/by-grade' }, { label: 'מתחם לכיתה', href: '/classroom' }]} /></div>
  </div>
}
