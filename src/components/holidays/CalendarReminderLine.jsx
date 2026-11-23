import { CALENDAR_HOST, calendarPath } from '../../utils/holidayCalendar'
import { logInviteCta } from '../../utils/liveActivity'

// The one-line version of HolidayCalendarReminder (week-ahead feed) for busy spots: after printing
// and the home-page Hanukkah block. Clicks count as invite-cta:calendar-week-<app>-<spot>.
export default function CalendarReminderLine({ spot, path = '/', className = '' }) {
  const webcal = `webcal://${CALENDAR_HOST}${calendarPath('week')}`
  const google = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`
  const log = app => logInviteCta(`calendar-week-${app}-${spot}`, path)
  return <p className={`calendar-line ${className}`} dir="rtl">
    <span>📅 תזכורת ביומן שבוע לפני כל חג:</span>{' '}
    <a href={google} target="_blank" rel="noopener" onClick={() => log('google')}>יומן גוגל</a>{' · '}
    <a href={webcal} onClick={() => log('apple')}>אייפון / אאוטלוק</a>
  </p>
}
