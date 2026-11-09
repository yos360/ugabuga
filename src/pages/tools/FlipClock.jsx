import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import './flip-clock.css'

// Full-screen flip clock (screensaver style): split-flap cards that fall on every change, an optional
// synthesized "clack" (Web Audio, nothing downloaded), Gregorian + Hebrew date, themes, 12/24h,
// keeps the screen awake (Wake Lock) while full screen. Settings stay in this browser only.

const STORE = 'buga-flip-clock'
const THEMES = [
  { id: 'classic', label: 'שחור קלאסי', vars: { '--bg': '#0d0d0d', '--card': '#2c2c2c', '--card2': '#1f1f1f', '--ink': '#f4f4f4', '--sub': '#b5b5b5' } },
  { id: 'white', label: 'לבן', light: true, vars: { '--bg': '#eceae4', '--card': '#ffffff', '--card2': '#f2f1ec', '--ink': '#1d1d1d', '--sub': '#555' } },
  { id: 'night', label: 'כחול לילה', vars: { '--bg': '#07122b', '--card': '#14264d', '--card2': '#0f1d3d', '--ink': '#7fdcff', '--sub': '#8aa7d6' } },
  { id: 'retro', label: 'רטרו כתום', vars: { '--bg': '#2a1608', '--card': '#3b2210', '--card2': '#301b0b', '--ink': '#ffb347', '--sub': '#d9a066' } },
  { id: 'pink', label: 'ורוד', light: true, vars: { '--bg': '#ffe4ef', '--card': '#ff6fa5', '--card2': '#f2588f', '--ink': '#ffffff', '--sub': '#a3365f' } },
]
const DEFAULTS = { theme: 'classic', seconds: true, h12: false, date: true, sound: false }
const load = () => { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORE)) } } catch { return DEFAULTS } }
const save = v => { try { localStorage.setItem(STORE, JSON.stringify(v)) } catch { /* private mode */ } }

// One split-flap card: the top half falls to reveal the new digit, then the bottom half rises.
function Card({ d }) {
  const [state, setState] = useState({ prev: d, cur: d, n: 0 })
  if (d !== state.cur) setState(s => ({ prev: s.cur, cur: d, n: s.n + 1 }))
  const { prev, cur, n } = state
  return <span className="fc-card" aria-hidden="true">
    <span className="fc-half fc-top"><span>{cur}</span></span>
    <span className="fc-half fc-bottom"><span>{n ? prev : cur}</span></span>
    {n > 0 && <span key={'t' + n} className="fc-half fc-top fc-fall"><span>{prev}</span></span>}
    {n > 0 && <span key={'b' + n} className="fc-half fc-bottom fc-rise"><span>{cur}</span></span>}
  </span>
}
const Pair = ({ v }) => <span className="fc-group"><Card d={v[0]} /><Card d={v[1]} /></span>
const Colon = () => <span className="fc-colon" aria-hidden="true"><i /><i /></span>

// A short mechanical "clack": filtered noise burst + a low thump. Built on the fly, no audio file.
function useClack() {
  const ctx = useRef(null)
  const unlock = useCallback(() => {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext
    if (!AC) return
    if (!ctx.current) ctx.current = new AC()
    if (ctx.current.state === 'suspended') ctx.current.resume()
  }, [])
  const play = useCallback(() => {
    const c = ctx.current
    if (!c || c.state !== 'running') return
    const t = c.currentTime, len = Math.floor(c.sampleRate * 0.045)
    const buf = c.createBuffer(1, len, c.sampleRate), ch = buf.getChannelData(0)
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4)
    const src = c.createBufferSource(); src.buffer = buf
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.9
    const g = c.createGain(); g.gain.value = 0.55
    src.connect(bp).connect(g).connect(c.destination); src.start(t)
    const o = c.createOscillator(), og = c.createGain()
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.04)
    og.gain.setValueAtTime(0.25, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
    o.connect(og).connect(c.destination); o.start(t); o.stop(t + 0.06)
  }, [])
  return { unlock, play }
}

const pad = n => String(n).padStart(2, '0')
const gregFmt = new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
// Hebrew numerals: 29 → כ״ט, 5787 → תשפ״ז (thousands dropped, 15/16 written ט״ו / ט״ז)
export function gematriya(num) {
  let n = num % 1000, s = ''
  const H = ['', 'ק', 'ר', 'ש', 'ת'], T = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'], O = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט']
  while (n >= 400) { s += 'ת'; n -= 400 }
  if (n >= 100) { s += H[Math.floor(n / 100)]; n %= 100 }
  if (n === 15) s += 'טו'
  else if (n === 16) s += 'טז'
  else { s += T[Math.floor(n / 10)] + O[n % 10] }
  return s.length > 1 ? s.slice(0, -1) + '״' + s.slice(-1) : s + '׳'
}
let hebFmt = null
try { hebFmt = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { /* old browser */ }
const hebDate = d => hebFmt.formatToParts(d).map(p => (p.type === 'day' || p.type === 'year') && /^\d+$/.test(p.value) ? gematriya(+p.value) : p.value).join('')

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let id
    const tick = () => { const d = new Date(); setNow(d); id = setTimeout(tick, 1000 - d.getMilliseconds() + 5) }
    id = setTimeout(tick, 1000 - new Date().getMilliseconds() + 5)
    return () => clearTimeout(id)
  }, [])
  return now
}

const faq = [
  { q: 'איך מפעילים את השעון על כל המסך?', a: 'לוחצים על "מסך מלא". השעון ממלא את כל המסך, הכפתורים נעלמים אחרי כמה שניות בלי תנועה, ויוצאים בלחיצה על Esc או על הכפתור "יציאה" שמופיע כשמזיזים את העכבר או נוגעים במסך.' },
  { q: 'יש צליל של ספרות מתהפכות?', a: 'כן. כפתור הצליל מפעיל "קליק" קצר בכל פעם שספרה מתהפכת, כמו בשעון מתהפך אמיתי. ברירת המחדל היא בלי צליל, ואפשר להפעיל או לכבות בכל רגע.' },
  { q: 'המסך לא ייכבה באמצע?', a: 'במצב מסך מלא השעון מבקש מהדפדפן להשאיר את המסך דולק, בדפדפנים שתומכים בזה (כרום, אדג׳ וספארי החדש). כדאי לחבר את המחשב או הטאבלט לחשמל.' },
  { q: 'אפשר להשתמש בזה כשומר מסך בכיתה או במשרד?', a: 'כן. פותחים את העמוד על המחשב שמחובר למקרן או לטלוויזיה, בוחרים צבע ולוחצים מסך מלא. אפשר להסתיר את השניות ואת התאריך לשעון נקי יותר.' },
  { q: 'השעון עובד בלי אינטרנט?', a: 'אחרי שהעמוד נטען השעון עובד מהשעה של המכשיר שלכם, גם אם החיבור נופל. שום פרט לא נשלח אלינו.' },
]

export default function FlipClock() {
  const [opt, setOpt] = useState(load)
  const set = p => setOpt(o => { const n = { ...o, ...p }; save(n); return n })
  const [full, setFull] = useState(false)
  const [idle, setIdle] = useState(false)
  const stage = useRef(null)
  const now = useNow()
  const { unlock, play } = useClack()
  const theme = THEMES.find(t => t.id === opt.theme) || THEMES[0]

  let h = now.getHours()
  const ampm = h < 12 ? 'AM' : 'PM'
  if (opt.h12) h = h % 12 || 12
  const hh = pad(h), mm = pad(now.getMinutes()), ss = pad(now.getSeconds())
  const shown = opt.seconds ? hh + mm + ss : hh + mm

  // a clack whenever a visible digit changes
  const last = useRef(shown)
  useEffect(() => {
    if (last.current !== shown && opt.sound) play()
    last.current = shown
  }, [shown, opt.sound, play])

  // full screen: real Fullscreen API when there is one, a fixed overlay otherwise (iPhone)
  const enter = () => {
    setFull(true)
    const el = stage.current
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {})
    else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen()
  }
  const exit = useCallback(() => {
    setFull(false)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }, [])
  useEffect(() => {
    const onFs = () => { if (!document.fullscreenElement && !document.webkitFullscreenElement) setFull(false) }
    const onKey = e => { if (e.key === 'Escape') exit() }
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('fullscreenchange', onFs); document.removeEventListener('webkitfullscreenchange', onFs); document.removeEventListener('keydown', onKey) }
  }, [exit])

  // keep the screen awake while full screen
  useEffect(() => {
    if (!full || !navigator.wakeLock) return
    let lock = null, alive = true
    const get = () => navigator.wakeLock.request('screen').then(l => { if (alive) lock = l; else l.release() }).catch(() => {})
    get()
    const onVis = () => { if (document.visibilityState === 'visible') get() }
    document.addEventListener('visibilitychange', onVis)
    return () => { alive = false; lock?.release().catch(() => {}); document.removeEventListener('visibilitychange', onVis) }
  }, [full])

  // hide the buttons and the cursor after 3 s without movement
  useEffect(() => {
    if (!full) { setIdle(false); return }
    let id
    const wake = () => { setIdle(false); clearTimeout(id); id = setTimeout(() => setIdle(true), 3000) }
    wake()
    window.addEventListener('pointermove', wake); window.addEventListener('pointerdown', wake)
    return () => { clearTimeout(id); window.removeEventListener('pointermove', wake); window.removeEventListener('pointerdown', wake) }
  }, [full])

  const toggleSound = () => { if (!opt.sound) unlock(); set({ sound: !opt.sound }) }
  const n = (opt.seconds ? 6 * 0.77 + 2 * 0.3 : 4 * 0.77 + 0.3) + (opt.h12 ? 0.6 : 0) + 0.3
  const label = `השעה ${hh}:${mm}${opt.seconds ? ':' + ss : ''}`
  const pill = on => `min-h-[44px] rounded-full border-2 px-4 py-1.5 font-bold ${on ? 'border-[var(--border)] bg-amber-200' : 'border-slate-300 bg-white'}`

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SEO title="שעון מסך מלא עם שניות — שעון דיגיטלי מתהפך אונליין" description="שעון אונליין על כל המסך עם שניות: ספרות מתהפכות גדולות, צליל קליק שאפשר להפעיל ולכבות, תאריך לועזי ועברי, 5 צבעים, 12 או 24 שעות. שומר מסך למחשב, לכיתה ולטלוויזיה. בחינם, בלי התקנה." path="/tools/flip-clock" structuredData={[faqSchema(faq), { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'שעון מסך מלא עם שניות', url: 'https://ugabuga.co.il/tools/flip-clock', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', inLanguage: 'he', offers: { '@type': 'Offer', price: '0', priceCurrency: 'ILS' } }]} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'שעון מסך מלא' }]} />
      <h1 className="text-center text-3xl font-black sm:text-4xl">🕰️ שעון מסך מלא — ספרות מתהפכות עם שניות</h1>
      <p className="mx-auto max-w-2xl text-center text-lg text-[var(--muted-foreground)]">שעון ספרות מתהפכות כמו של פעם, בגדול על כל המסך. לוחצים "מסך מלא", ואם רוצים — מפעילים את הקליק של הספרות.</p>

      <div ref={stage} role="timer" aria-label={label} style={{ ...theme.vars, '--fc-n': n }}
        className={`fc-stage mt-6 ${full ? 'fc-full' : ''} ${full && idle ? 'fc-idle' : ''} ${theme.light ? 'fc-light' : ''}`}>
        <div className="fc-row">
          <Pair v={hh} /><Colon /><Pair v={mm} />
          {opt.seconds && <><Colon /><Pair v={ss} /></>}
          {opt.h12 && <span className="fc-ampm">{ampm}</span>}
        </div>
        {opt.date && <div className="fc-date">{gregFmt.format(now)}{hebFmt && <small>{hebDate(now)}</small>}</div>}
        {full && <div className="fc-bar">
          <button type="button" onClick={toggleSound}>{opt.sound ? '🔊 צליל פועל' : '🔇 בלי צליל'}</button>
          <button type="button" onClick={exit}>✕ יציאה</button>
        </div>}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={enter} className="min-h-[52px] rounded-xl bg-red-500 px-6 py-3 text-lg font-bold text-white">⛶ מסך מלא</button>
        <button type="button" onClick={toggleSound} aria-pressed={opt.sound} className={pill(opt.sound)}>{opt.sound ? '🔊 צליל פועל' : '🔇 בלי צליל'}</button>
        <button type="button" onClick={() => set({ seconds: !opt.seconds })} aria-pressed={opt.seconds} className={pill(opt.seconds)}>⏱️ שניות</button>
        <button type="button" onClick={() => set({ date: !opt.date })} aria-pressed={opt.date} className={pill(opt.date)}>📅 תאריך</button>
        <button type="button" onClick={() => set({ h12: !opt.h12 })} aria-pressed={opt.h12} className={pill(opt.h12)}>{opt.h12 ? '12 שעות' : '24 שעות'}</button>
      </div>
      <div role="group" aria-label="צבע השעון" className="mt-3 flex flex-wrap justify-center gap-2">
        {THEMES.map(t => <button key={t.id} type="button" aria-pressed={opt.theme === t.id} onClick={() => set({ theme: t.id })} className={pill(opt.theme === t.id)}>
          <span className="ml-1 inline-block h-4 w-4 rounded align-middle" style={{ background: t.vars['--card'], border: `3px solid ${t.vars['--ink']}` }} />{t.label}
        </button>)}
      </div>

      <div className="mt-12">
        <SeoBody paragraphs={[
          'שעון ספרות מתהפכות (Flip Clock) הוא השעון של פעם, עם כרטיסים שנופלים בכל דקה. כאן הוא עובד בדפדפן: לוחצים "מסך מלא" והשעה ממלאת את כל המסך, בגודל שרואים מקצה החדר. זה שומר מסך נעים למחשב, שעון גדול לכיתה או לחדר ישיבות, ושעון לטלוויזיה או לטאבלט ליד המיטה.',
          'אפשר להוסיף צליל קליק קצר בכל פעם שספרה מתהפכת, כמו בשעון מכני, ולכבות אותו בלחיצה. בוחרים אחד מחמישה צבעים, מציגים או מסתירים את השניות ואת התאריך, ועוברים בין 24 שעות ל־12 שעות. התאריך מופיע גם בלועזית וגם בעברית.',
          'במסך מלא הכפתורים והעכבר נעלמים אחרי שלוש שניות, והשעון מבקש מהמכשיר לא לכבות את המסך. ההגדרות נשמרות רק בדפדפן שלכם, והשעה נלקחת מהשעון של המכשיר.',
        ]} faq={faq} related={[{ label: 'טיימר וספירה לאחור', href: '/tools/timer' }, { label: 'שעון עולמי', href: '/tools/world-clock' }]} />
        <p className="mt-4 text-center"><Link to="/tools" className="font-bold underline">לכל הכלים החינמיים ←</Link></p>
      </div>
    </div>
  )
}
