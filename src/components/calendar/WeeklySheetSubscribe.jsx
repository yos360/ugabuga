import { useState } from 'react'
import { WEEKLY_GRADES } from '../../data/weeklySheets'
import { weeklyFeedPath } from '../../utils/calendarFeeds'
import FeedButtons from './FeedButtons'

// "This week's sheet in my calendar" (owner's idea, 23.11.2026): every Sunday at 07:00 the calendar shows one page for the
// grade, a different one each week, linking back here. Feed: /calendar/weekly-<grade>.ics (written at build time).
// Clicks: invite-cta:calendar-weekly-<g1|gan>-<app>. `only` pins the grade (the kindergarten page); otherwise a picker.
const CODE = key => key === 'gan' ? 'gan' : key.replace('grade-', 'g')

export default function WeeklySheetSubscribe({ only, className = 'mt-8' }) {
  const [key, setKey] = useState(only || 'grade-1')
  return <section aria-labelledby="wss-title" className={`no-print rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5 ${className}`}>
    <h2 id="wss-title" className="text-2xl font-bold">📒 דף השבוע ביומן{only ? ' של הגן' : ''}</h2>
    <p className="mt-1 text-[var(--muted-foreground)]">בכל יום ראשון בשבע בבוקר היומן יציג דף אחד לשבוע, עם קישור ישר אליו. כל שבוע דף אחר. בלי הרשמה ובלי מייל.</p>
    {!only && <fieldset className="mt-3">
      <legend className="font-bold">לאיזו כיתה?</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {WEEKLY_GRADES.filter(g => g.key !== 'gan').map(g => <label key={g.key} className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border-2 px-4 font-bold ${key === g.key ? 'border-slate-800 bg-yellow-200' : 'border-[var(--border)] bg-white'}`}>
          <input type="radio" name="wss-grade" value={g.key} checked={key === g.key} onChange={() => setKey(g.key)} className="accent-slate-800" />
          {g.short}
        </label>)}
      </div>
    </fieldset>}
    <FeedButtons key={key} feedPath={weeklyFeedPath(key)} code={app => `calendar-weekly-${CODE(key)}-${app}`} />
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">מתאים גם למורות וגם להורים. אפשר להסיר בכל רגע מהגדרות היומן.</p>
  </section>
}
