import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CALENDAR_HOST, calendarPath } from '../../utils/holidayCalendar'
import { logInviteCta } from '../../utils/liveActivity'

// "Remind me before the next holidays" (owner's idea, 23.11.2026): one tap subscribes the visitor's
// own calendar to a feed of reminders a week or a month before every holiday, each linking back here.
// Nothing is collected — the calendar app fetches a public file. Clicks are counted as
// invite-cta:calendar-<lead>-<app> on the page they came from.
const LEADS = [['week', 'שבוע לפני'], ['month', 'חודש לפני']]

export default function HolidayCalendarReminder({ className = 'mb-10' }) {
  const [lead, setLead] = useState('week')
  const [copied, setCopied] = useState(false)
  const { pathname } = useLocation()
  const webcal = `webcal://${CALENDAR_HOST}${calendarPath(lead)}`
  const https = `https://${CALENDAR_HOST}${calendarPath(lead)}`
  const google = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`
  const log = app => logInviteCta(`calendar-${lead}-${app}`, pathname)
  const copy = async () => {
    log('copy')
    try { await navigator.clipboard.writeText(https); setCopied(true) } catch { window.prompt('העתיקו את הקישור:', https) }
  }
  const btn = 'inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 border-slate-800 px-4 font-bold transition-transform hover:-translate-y-0.5'

  return <section aria-labelledby="hcr-title" className={`no-print rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5 ${className}`}>
    <h2 id="hcr-title" className="text-2xl font-bold">📅 תזכורת ביומן לחגים הבאים</h2>
    <p className="mt-1 text-[var(--muted-foreground)]">ט״ו בשבט, פורים, פסח ושאר החגים: היומן שלכם יזכיר לכם מראש, עם קישור ישר לדפים להדפסה. בלי הרשמה ובלי מייל.</p>
    <fieldset className="mt-3">
      <legend className="font-bold">מתי להזכיר?</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {LEADS.map(([id, label]) => <label key={id} className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border-2 px-4 font-bold ${lead === id ? 'border-slate-800 bg-yellow-200' : 'border-[var(--border)] bg-white'}`}>
          <input type="radio" name="hcr-lead" value={id} checked={lead === id} onChange={() => { setLead(id); setCopied(false) }} className="accent-slate-800" />
          {label}
        </label>)}
      </div>
    </fieldset>
    <div className="mt-4 flex flex-wrap gap-2">
      <a href={google} target="_blank" rel="noopener" onClick={() => log('google')} className={`${btn} bg-white`}><span aria-hidden="true">🗓️</span> הוספה ליומן גוגל</a>
      <a href={webcal} onClick={() => log('apple')} className={`${btn} bg-white`}><span aria-hidden="true">🍏</span> אייפון / אאוטלוק</a>
      <button type="button" onClick={copy} className={`${btn} bg-white`}><span aria-hidden="true">🔗</span> {copied ? 'הקישור הועתק!' : 'העתקת קישור ליומן'}</button>
    </div>
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">אפשר להסיר בכל רגע מהגדרות היומן. התזכורות מתעדכנות לבד כל שנה.</p>
  </section>
}
