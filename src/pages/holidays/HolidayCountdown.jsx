import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { nextHoliday, daysPhrase } from '../../data/holidayDates'
import { drawCountdownCard, loadMascot } from '../../utils/countdownImage'
import { logInviteCta } from '../../utils/liveActivity'

const PATH = '/holidays/countdown'
const dayKey = d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

export default function HolidayCountdown() {
  const [now, setNow] = useState(() => new Date())
  const [msg, setMsg] = useState('')
  const canvasRef = useRef(null)
  const [mascot, setMascot] = useState(null)
  const h = nextHoliday(now)

  // The date is computed on the visitor's device; check again each minute so a page left open rolls over at midnight.
  useEffect(() => {
    const t = setInterval(() => setNow(prev => { const n = new Date(); return dayKey(n) === dayKey(prev) ? prev : n }), 60000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => { let alive = true; loadMascot().then(img => { if (alive) setMascot(img) }); return () => { alive = false } }, [])
  const slug = h?.slug, days = h?.days
  useEffect(() => {
    if (!slug || !canvasRef.current) return
    let alive = true
    const draw = () => { if (alive && canvasRef.current) drawCountdownCard(canvasRef.current, h, mascot) }
    draw()
    document.fonts?.ready.then(draw).catch(() => {})
    return () => { alive = false }
  }, [slug, days, mascot]) // eslint-disable-line react-hooks/exhaustive-deps

  const toBlob = () => new Promise(res => canvasRef.current.toBlob(res, 'image/png'))
  const fileName = `countdown-${slug || 'holiday'}.png`
  const saveFile = blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = fileName
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
  const download = async () => {
    const blob = await toBlob()
    if (!blob) return
    logInviteCta('countdown-download', PATH)
    saveFile(blob)
    setMsg('התמונה ירדה. עכשיו אפשר להעלות אותה לסטטוס בוואטסאפ.')
  }
  const share = async () => {
    const blob = await toBlob()
    if (!blob) return
    logInviteCta('countdown-share', PATH)
    const file = new File([blob], fileName, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'ספירה לאחור לחג', text: 'ספירה לאחור לחג עם עוגה בוגה — ugabuga.co.il' }); return }
      catch (e) { if (e?.name === 'AbortError') return }
    }
    saveFile(blob)
    setMsg('השיתוף הישיר לא נתמך במכשיר הזה, אז התמונה ירדה. העלו אותה לסטטוס מהגלריה.')
  }

  const title = h ? (h.days === 0 ? (h.solemn ? `${h.name} היום` : `חג שמח! ${h.name} היום`) : `${daysPhrase(h.days)} ל${h.name}`) : 'ספירה לאחור לחג'
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="ספירה לאחור לחג — תמונה לסטטוס בוואטסאפ" description="כמה ימים נשארו לחג הקרוב? תמונה מוכנה לשיתוף בסטטוס בוואטסאפ, מתעדכנת מדי יום. בחינם." path={PATH} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, { label: 'ספירה לאחור' }]} />
      <h1 className="mb-2 text-center text-4xl sm:text-5xl">⏳ ספירה לאחור לחג</h1>
      <p className="mb-6 text-center font-hand text-lg text-[var(--muted-foreground)]">תמונה לסטטוס בוואטסאפ שמתעדכנת כל יום לבד</p>
      {h ? (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-center">
          <canvas ref={canvasRef} width={1080} height={1920} role="img" aria-label={title}
            className="aspect-[9/16] w-full max-w-[270px] rounded-2xl border-2 border-[var(--border)] sketch-shadow bg-white" />
          <div className="w-full max-w-sm text-center sm:pt-6">
            <p className="mb-4 text-3xl font-black">{h.emoji} {title}</p>
            <button type="button" onClick={share} className="mb-3 min-h-[52px] w-full rounded-2xl bg-green-600 px-6 text-xl font-bold text-white">💬 שיתוף לסטטוס</button>
            <button type="button" onClick={download} className="mb-3 min-h-[52px] w-full rounded-2xl border-2 border-[var(--border)] bg-white px-6 text-xl font-bold">⬇️ הורדת התמונה</button>
            {msg && <p role="status" className="mb-3 text-sm font-bold text-[var(--muted-foreground)]">{msg}</p>}
            <p className="text-sm text-[var(--muted-foreground)]">התמונה בגודל 1080×1920, מידה מושלמת לסטטוס. היא מחושבת לפי התאריך של היום, אז חזרו מחר לתמונה חדשה.</p>
            <p className="mt-4"><Link to={h.path} className="font-bold underline decoration-dashed">כל מה שיש ל{h.name} ←</Link></p>
            <p className="mt-2"><Link to="/holidays/year-poster" className="font-bold underline decoration-dashed">🗓️ לוח החגים של הכיתה להדפסה ←</Link></p>
          </div>
        </div>
      ) : <p className="text-center text-xl">אין כרגע חג קרוב בלוח. חזרו בקרוב!</p>}
    </div>
  )
}
