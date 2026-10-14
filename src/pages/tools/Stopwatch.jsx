import { useCallback, useEffect, useRef, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { usePresentMode } from '../../utils/presentMode'
import { addLap, elapsedTime, formatStopwatch, lapExtremes, lapsText } from '../../utils/stopwatch'

const FAQ = [
  { q: 'מה ההבדל בין סטופר לטיימר?', a: 'סטופר מודד כמה זמן עבר מאפס והלאה. טיימר סופר לאחור מזמן שקבעתם מראש.' },
  { q: 'האם שעון העצר ממשיך בלשונית אחרת?', a: 'כן. הזמן מחושב לפי הפרש זמנים ולא לפי מספר עדכוני המסך. סגירה או רענון של הדף מאפסים את המדידה.' },
  { q: 'מה מודדת הקפה?', a: 'זמן הקפה הוא הזמן מאז ההקפה הקודמת. הזמן הכולל הוא הזמן מאז ההתחלה, בלי הזמן שבו הסטופר היה עצור.' },
]
const button = 'min-h-[52px] flex-1 wobbly-sm border-2 border-[var(--border)] px-4 py-3 font-bold disabled:opacity-40'

export default function Stopwatch() {
  const clock = useRef({ accumulated: 0, startedAt: null })
  const [running, setRunning] = useState(false), [elapsed, setElapsed] = useState(0)
  const [laps, setLaps] = useState([]), [copyStatus, setCopyStatus] = useState('')
  const { on: presenting } = usePresentMode()
  const current = useCallback(() => elapsedTime(clock.current.accumulated, clock.current.startedAt, performance.now()), [])
  const toggle = useCallback(() => {
    if (clock.current.startedAt === null) { clock.current.startedAt = performance.now(); setRunning(true) }
    else { clock.current.accumulated = current(); clock.current.startedAt = null; setElapsed(clock.current.accumulated); setRunning(false) }
  }, [current])
  const lap = useCallback(() => { if (clock.current.startedAt !== null) { const total = current(); setLaps(old => addLap(old, total)); setCopyStatus('') } }, [current])
  const reset = useCallback(() => { clock.current = { accumulated: 0, startedAt: null }; setRunning(false); setElapsed(0); setLaps([]); setCopyStatus('') }, [])
  useEffect(() => {
    if (!running) return
    const tick = () => setElapsed(current())
    const id = setInterval(tick, 31)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick) }
  }, [running, current])
  useEffect(() => {
    const key = e => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input, textarea, select, button, a, [contenteditable="true"], [role="dialog"], dialog')) return
      if (e.code === 'Space') { e.preventDefault(); toggle() }
      if (e.code === 'KeyL') lap()
      if (e.code === 'KeyR') reset()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [toggle, lap, reset])
  async function copy() {
    try { await navigator.clipboard.writeText(lapsText(laps)); setCopyStatus('ההקפות הועתקו!') }
    catch { setCopyStatus('ההעתקה לא הצליחה. אפשר לסמן ולהעתיק את הטבלה.') }
  }
  const { best, worst } = lapExtremes(laps)
  return <div className={`mx-auto px-4 py-8 ${presenting ? 'max-w-6xl' : 'max-w-3xl'}`} dir="rtl">
    <SEO title="סטופר אונליין — שעון עצר עם הקפות" description="סטופר חינם עם הקפות, סימון ההקפה המהירה והאיטית, העתקת תוצאות ומצב הקרנה לכיתה. מודדים זמן בריצה, בקריאה ובמשחקים." path="/tools/stopwatch" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'סטופר' }]} />
    <h1 className="text-3xl sm:text-4xl text-center mb-6">⏱️ סטופר אונליין — שעון עצר עם הקפות</h1>
    <section className="rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 sketch-shadow text-center">
      <div role="timer" aria-label="זמן שחלף" dir="ltr" className="font-mono font-bold tabular-nums py-6" style={{ fontSize: presenting ? 'clamp(2rem, 10vw, 9rem)' : elapsed >= 3600000 ? 'clamp(1.8rem, 7vw, 5rem)' : 'clamp(2rem, 11vw, 5rem)' }}>{formatStopwatch(elapsed)}</div>
      <p className="mb-3 text-[var(--muted-foreground)]">{running ? 'המדידה פועלת' : elapsed ? 'המדידה מושהית' : 'מוכנים? מתחילים!'}</p>
      <div className="flex gap-2"><button className={`${button} bg-[var(--postit)]`} onClick={toggle}>{running ? 'עצירה' : elapsed ? 'המשך' : 'התחלה'}</button><button className={button} onClick={lap} disabled={!running}>הקפה</button><button className={button} onClick={reset}>איפוס</button></div>
      <p className="mt-4 text-sm no-present">מקלדת: רווח — התחלה/עצירה · L — הקפה · R — איפוס. כשהמיקוד על כפתור, רווח מפעיל אותו.</p>
    </section>
    {laps.length > 0 && <section className="mt-8">
      <div className="flex items-center justify-between mb-3"><h2 className="text-2xl">ההקפות שלי</h2><button onClick={copy} className="border-2 rounded-xl px-4 py-2 min-h-[44px]">העתקת הקפות</button></div>
      <p role="status">{copyStatus}</p>
      <table className="w-full text-center text-sm sm:text-base"><caption className="sr-only">זמן כל הקפה והזמן הכולל</caption><thead><tr><th scope="col">הקפה</th><th scope="col">זמן הקפה</th><th scope="col">זמן כולל</th></tr></thead><tbody>{laps.map(l => <tr key={l.number} className="border-b" style={{ background: l.duration === best ? '#dcfce7' : l.duration === worst ? '#ffedd5' : undefined, color: l.duration === best || l.duration === worst ? '#182139' : undefined }}><th scope="row" className="py-3">{l.number}{l.duration === best ? ' ★ מהירה' : l.duration === worst ? ' ● איטית' : ''}</th><td dir="ltr" className="font-mono">{formatStopwatch(l.duration)}</td><td dir="ltr" className="font-mono">{formatStopwatch(l.total)}</td></tr>)}</tbody></table>
    </section>}
    <div className="mt-10 no-present"><h2 className="text-2xl mb-3">רעיונות לכיתה ולבית</h2><SeoBody paragraphs={[
      'מודדים מרוץ קצר, מסלול מכשולים או זמן סידור הכיתה. לחצו על הקפה בכל סיבוב כדי להשוות את הזמנים, ולבסוף העתיקו את הטבלה לתיעוד ההתקדמות.',
      'אפשר למדוד כמה זמן מצליחים להחזיק צליל בנוחות, או כמה זמן לוקח לקרוא קטע קצר. בקריאה כדאי לשלב שאלות הבנה: המטרה היא גם להבין, ולא רק למהר. השוו כל ילד לעצמו.',
      'לפעילות מול כל הכיתה הפעילו את כפתור ההקרנה של האתר. הספרות גדלות, וכל הקבוצה יכולה לעקוב. אם רוצים להגביל פעילות לדקה, בחרו דווקא טיימר לספירה לאחור.',
    ]} faq={FAQ} related={[{ href: '/tools/timer', label: 'טיימר לספירה לאחור' }, { href: '/tools/countdown-timer', label: 'טיימר עם צלצול לכיתה' }]} /></div>
  </div>
}
