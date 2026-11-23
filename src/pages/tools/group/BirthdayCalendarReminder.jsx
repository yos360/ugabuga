import { birthdayGoogleUrl, birthdayIcs } from '../../../utils/holidayCalendar'
import { logInviteCta } from '../../../utils/liveActivity'

// Host-only card: next year's birthday reminder in the host's own calendar. No data leaves the device.
export default function BirthdayCalendarReminder({ date }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return null
  const log = app => logInviteCta(`calendar-bday-${app}`, '/rsvp')
  const ics = () => {
    log('apple')
    const url = URL.createObjectURL(new Blob([birthdayIcs(date)], { type: 'text/calendar' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'birthday-reminder.ics' })
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000)
  }
  const b = 'inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 border-slate-800 bg-white px-4 font-bold transition-transform hover:-translate-y-0.5'
  return <section aria-labelledby="bcr-title" className="no-print rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5">
    <h2 id="bcr-title" className="text-xl font-bold">🎂 תזכורת ליום ההולדת הבא</h2>
    <p className="mt-1 text-sm text-slate-700">היומן יזכיר לכם חודש לפני יום ההולדת בשנה הבאה, כדי להכין הזמנה בזמן. בלי הרשמה.</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <a href={birthdayGoogleUrl(date)} target="_blank" rel="noopener" onClick={() => log('google')} className={b}><span aria-hidden="true">🗓️</span> יומן גוגל</a>
      <button type="button" onClick={ics} className={b}><span aria-hidden="true">🍏</span> אייפון / אאוטלוק</button>
    </div>
  </section>
}
