import { useState } from 'react'
import { RSVP_THEMES, rsvpTheme, eventCalendar } from '../../../utils/rsvpExperience'
import { formatDate, peopleLabel } from '../../../utils/groupTools'
import { btn, card } from './GroupUi'
import './rsvp-experience.css'

export function ThemePicker({ value, onChange }) {
  return <fieldset className="rsvp-theme-picker"><legend>העיצוב של ההזמנה</legend><div>{RSVP_THEMES.map(t => <button type="button" key={t.id} aria-pressed={value === t.id} onClick={() => onChange(t.id)} style={{ '--invite-bg': t.bg, '--invite-accent': t.accent }}><span aria-hidden="true">{t.emoji}</span>{t.label}</button>)}</div></fieldset>
}
export function InvitationCard({ ev, preview = false }) {
  const theme = rsvpTheme(ev.theme), Heading = preview ? 'h3' : 'h1'
  return <header className="rsvp-invitation" style={{ '--invite-bg': theme.bg, '--invite-accent': theme.accent, '--invite-ink': theme.ink }}>
    <p className="rsvp-invitation-eyebrow">{preview ? 'כך האורחים יראו את ההזמנה' : 'אתם מוזמנים!'}</p>
    <span className="rsvp-invitation-emoji" aria-hidden="true">{theme.emoji}</span>
    <Heading>{ev.title?.replace(/___/g, '…') || 'האירוע שלנו'}</Heading>
    {(ev.date || ev.time) && <p className="rsvp-invitation-date">{ev.date && formatDate(ev.date)}{ev.date && ev.time && ' · '}<bdi dir="ltr">{ev.time}</bdi></p>}
    {ev.place && <p className="rsvp-invitation-place">📍 {ev.place}</p>}
    {ev.note && <p className="rsvp-invitation-note">{ev.note}</p>}
    {ev.deadline && <p className="rsvp-invitation-deadline">נשמח לאישור עד {formatDate(ev.deadline)}</p>}
    {preview && <div className="rsvp-preview-answer" aria-hidden="true"><span>🎉 מגיעים</span><span>🤔 אולי</span><span>לא מגיעים</span></div>}
  </header>
}
export function RsvpCreateExperience({ form, onChange, children, mine }) {
  return <div className="rsvp-v2 rsvp-create-grid">
    <section className={card}><h2 className="text-2xl font-bold mb-4">בואו נכין את ההזמנה שלכם</h2><ThemePicker value={form.theme} onChange={theme => onChange({ ...form, theme })} />{children}</section>
    <aside className="rsvp-create-aside"><InvitationCard ev={form} preview /><div className="rsvp-info-box"><h2>מהרגע ששולחים — הכול מסודר</h2><ul><li>✓ אורחים עונים בלי הרשמה</li><li>✓ סיכום ילדים ומבוגרים שמגיעים</li><li>✓ חיפוש, סינון, אלרגיות ותזכורות</li><li>✓ הורדה לאקסל והדפסת הרשימה</li></ul><p>בחינם. קישור ניהול אישי למארגנים.</p></div>
      {mine.length > 0 && <div className="rsvp-info-box"><h2>האירועים שלי</h2><ul>{mine.map(e => <li key={e.code}><a href={`/r/${e.code}`} className="underline">{e.title || e.code}</a></li>)}</ul></div>}
    </aside>
  </div>
}
export function EventActions({ ev, download }) {
  return <div className="rsvp-event-actions">
    {ev.place && <a className={btn} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.place)}`} target="_blank" rel="noopener noreferrer">📍 ניווט למקום</a>}
    {ev.date && <button type="button" className={btn} onClick={() => { const ics = eventCalendar(ev); if (ics) download('event.ics', ics, 'text/calendar;charset=utf-8') }}>🗓️ הוספה ליומן</button>}
  </div>
}
export function RsvpGuestExperience({ ev, onAnswer, show, AnswerForm, download, statuses }) {
  const [editing, setEditing] = useState(!ev.mine)
  const mine = ev.mine
  return <div className="rsvp-v2 mx-auto max-w-xl space-y-5">
    <InvitationCard ev={ev} /><EventActions ev={ev} download={download} />
    <section className={card}>
      {editing || !mine ? <><h2 className="text-2xl font-bold mb-2">נשמח לראות אתכם!</h2><p className="mb-5 text-slate-600">כמה פרטים קטנים, כדי שנוכל להתכונן.</p><AnswerForm ev={ev} mine={mine} show={show} onSaved={r => { onAnswer(r); setEditing(false); show('✓ התשובה נשמרה. תודה!') }} /></>
        : <div className="text-center" role="status"><span className="text-4xl" aria-hidden="true">{statuses[mine.status].emoji}</span><h2 className="text-2xl font-bold mt-3">{mine.status === 'yes' ? 'איזה כיף, נתראה באירוע!' : mine.status === 'maybe' ? 'רשמנו שאולי תגיעו' : 'התשובה נשמרה, תודה שעדכנתם'}</h2><p className="mt-2">{mine.name} · {statuses[mine.status].label}</p>{mine.status !== 'no' && <p>{peopleLabel(mine.kids, mine.adults)}</p>}<button className={`${btn} mt-5`} onClick={() => setEditing(true)}>✏️ שינוי התשובה</button><p className="text-sm text-slate-500 mt-3">אפשר לחזור לקישור הזה מאותו מכשיר ולעדכן.</p></div>}
    </section>
    <p className="text-center text-sm">גם לכם יש אירוע בקרוב? <a href="/rsvp" className="font-bold underline">יוצרים הזמנה ואישורי הגעה בחינם</a></p>
    <p className="text-center text-sm"><a href="/" className="font-bold underline">🎂 עוד משחקים ופעילויות למשפחה בעוגה בוגה</a></p>
  </div>
}
