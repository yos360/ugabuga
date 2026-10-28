import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import { WHATSAPP_CHANNEL } from '../data/brand'
import { noteQrScan } from '../utils/qrVariants'

// /whatsapp — the WhatsApp channel's landing page. From the site's own buttons (?go=1) it forwards to the
// channel after a moment (long enough for the page view to be counted); from a printed QR it explains
// what the channel is first, with one big button.
const GAINS = [
  ['🖨️', 'דף חדש כל יום', 'דף עבודה, דף צביעה או משחק — מוכן להדפסה, בחינם.'],
  ['🎉', 'לפני כל חג', 'החוברות והדפים של החג מגיעים אליכם כמה ימים לפני.'],
  ['🔒', 'פרטי לגמרי', 'בערוץ וואטסאפ אף אחד לא רואה את המספר שלכם — לא אנחנו ולא שאר העוקבים.'],
  ['🔕', 'בלי הצפה', 'הודעה אחת ביום לכל היותר. לא אוהבים? יוצאים בלחיצה.'],
]

export default function WhatsAppChannel() {
  const [params] = useSearchParams()
  const go = params.get('go') === '1'
  const [leaving, setLeaving] = useState(go)
  useEffect(() => { noteQrScan() }, [])
  useEffect(() => {
    if (!go || window.__PRERENDER__) return
    const t = setTimeout(() => window.location.assign(WHATSAPP_CHANNEL), 1500)
    return () => clearTimeout(t)
  }, [go])
  return <div className="mx-auto max-w-2xl px-4 py-10 text-center" dir="rtl">
    <SEO title="ערוץ הוואטסאפ של עוגה בוגה — דף חדש כל יום" description="הצטרפו לערוץ הוואטסאפ של עוגה בוגה: דף עבודה, דף צביעה או משחק חדש כל יום, ודפים לחגים לפני כולם. בחינם, ואף אחד לא רואה את המספר שלכם." path="/whatsapp" />
    <p className="text-7xl" aria-hidden="true">📲</p>
    <h1 className="mt-3 text-4xl font-black">דף חדש כל יום — ישר לוואטסאפ</h1>
    {leaving
      ? <p className="mt-4 text-lg" role="status">פותחים את הערוץ בוואטסאפ… אם לא נפתח, לחצו על הכפתור.</p>
      : <p className="mt-4 text-lg">ערוץ הוואטסאפ של עוגה בוגה — להורים, לגננות ולמורות.</p>}
    <a href={WHATSAPP_CHANNEL} onClick={() => setLeaving(false)} className="mt-6 inline-flex min-h-[56px] items-center rounded-2xl bg-[#25d366] px-8 text-xl font-black text-white shadow-md hover:bg-[#1ebe5b]">הצטרפו לערוץ בחינם</a>
    <p className="mt-2 text-sm text-slate-600">בוואטסאפ לוחצים על <b>„עקוב”</b> (Follow) — וזהו.</p>
    <ul className="mt-8 grid gap-3 text-right sm:grid-cols-2">{GAINS.map(([icon, title, line]) => <li key={title} className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
      <b className="text-lg"><span aria-hidden="true">{icon} </span>{title}</b><p className="mt-1 text-sm">{line}</p>
    </li>)}</ul>
    <p className="mt-8"><Link to="/" className="font-bold underline">או המשיכו לאתר ←</Link></p>
  </div>
}
