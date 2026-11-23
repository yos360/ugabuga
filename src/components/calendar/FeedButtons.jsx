import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FEED_HOST } from '../../utils/calendarFeeds'
import { logInviteCta } from '../../utils/liveActivity'

// Subscribe buttons for one static .ics feed: Google Calendar (cid=webcal://...), webcal for iPhone / Outlook, copy link.
// Nothing is collected: the calendar app fetches a public file. Clicks are counted as invite-cta:<code(app)>
// on the page they came from (or on `logPath`, e.g. the city page the visitor picked).
export const btnClass = 'inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 border-slate-800 bg-white px-4 font-bold transition-transform hover:-translate-y-0.5'

export default function FeedButtons({ feedPath, code, logPath, className = 'mt-4' }) {
  const [copied, setCopied] = useState(false)
  const { pathname } = useLocation()
  const webcal = `webcal://${FEED_HOST}${feedPath}`
  const https = `https://${FEED_HOST}${feedPath}`
  const google = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`
  const log = app => logInviteCta(code(app), logPath || pathname)
  const copy = async () => {
    log('copy')
    try { await navigator.clipboard.writeText(https); setCopied(true) } catch { window.prompt('העתיקו את הקישור:', https) }
  }
  return <div className={`flex flex-wrap gap-2 ${className}`}>
    <a href={google} target="_blank" rel="noopener" onClick={() => log('google')} className={btnClass}><span aria-hidden="true">🗓️</span> הוספה ליומן גוגל</a>
    <a href={webcal} onClick={() => log('apple')} className={btnClass}><span aria-hidden="true">🍏</span> אייפון / אאוטלוק</a>
    <button type="button" onClick={copy} className={btnClass}><span aria-hidden="true">🔗</span> {copied ? 'הקישור הועתק!' : 'העתקת קישור ליומן'}</button>
  </div>
}
