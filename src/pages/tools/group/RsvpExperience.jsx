import { useState } from 'react'
import { RSVP_THEMES, rsvpTheme, eventCalendar } from '../../../utils/rsvpExperience'
import { formatDate, peopleLabel } from '../../../utils/groupTools'
import { RSVP_LANGS, langInfo, t, formatDateIn } from '../../../utils/rsvpI18n'
import { btn, card } from './GroupUi'
import './rsvp-experience.css'
import SiteInvite from '../../../components/ui/SiteInvite'

export function ThemePicker({ value, onChange }) {
  return <fieldset className="rsvp-theme-picker"><legend>העיצוב של ההזמנה</legend><div>{RSVP_THEMES.map(t => <button type="button" key={t.id} aria-pressed={value === t.id} onClick={() => onChange(t.id)} style={{ '--invite-bg': t.bg, '--invite-accent': t.accent }}><span aria-hidden="true">{t.emoji}</span>{t.label}</button>)}</div></fieldset>
}
export function InvitationCard({ ev, preview = false, lang = 'he' }) {
  const theme = rsvpTheme(ev.theme), Heading = preview ? 'h3' : 'h1'
  const date = iso => lang === 'he' ? formatDate(iso) : formatDateIn(lang, iso)
  return <header className="rsvp-invitation" style={{ '--invite-bg': theme.bg, '--invite-accent': theme.accent, '--invite-ink': theme.ink }}>
    <p className="rsvp-invitation-eyebrow">{preview ? 'כך האורחים יראו את ההזמנה' : t(lang, 'invited')}</p>
    <span className="rsvp-invitation-emoji" aria-hidden="true">{theme.emoji}</span>
    <Heading>{ev.title?.replace(/___/g, '…') || 'האירוע שלנו'}</Heading>
    {(ev.date || ev.time) && <p className="rsvp-invitation-date">{ev.date && date(ev.date)}{ev.date && ev.time && ' · '}<bdi dir="ltr">{ev.time}</bdi></p>}
    {ev.place && <p className="rsvp-invitation-place">📍 {ev.place}</p>}
    {ev.note && <p className="rsvp-invitation-note">{ev.note}</p>}
    {ev.deadline && <p className="rsvp-invitation-deadline">{t(lang, 'answerUntil', { d: date(ev.deadline) })}</p>}
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
export function EventActions({ ev, download, lang = 'he' }) {
  const parking = ev.extras?.parking
  return <>
    <div className="rsvp-event-actions">
      {ev.place && <a className={btn} href={`https://waze.com/ul?q=${encodeURIComponent(ev.place)}&navigate=yes`} target="_blank" rel="noopener noreferrer">🚗 {t(lang, 'waze')}</a>}
      {ev.place && <a className={btn} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.place)}`} target="_blank" rel="noopener noreferrer">📍 {t(lang, 'maps')}</a>}
      {ev.date && <button type="button" className={btn} onClick={() => { const ics = eventCalendar(ev); if (ics) download('event.ics', ics, 'text/calendar;charset=utf-8') }}>🗓️ {t(lang, 'calendar')}</button>}
    </div>
    {parking && <p className="rsvp-parking"><b>🅿️ {t(lang, 'parking')}:</b> {parking}</p>}
  </>
}
// The fee and payment link (when the organizer set them) and the guest's own table.
function GuestExtras({ ev, lang }) {
  const x = ev.extras || {}
  if (!x.price && !ev.my_table) return null
  return <div className="rsvp-guest-extras">
    {ev.my_table && <p className="text-xl font-black">🪑 {t(lang, 'table', { n: ev.my_table })}</p>}
    {x.price > 0 && <p className="font-bold">💳 {t(lang, 'fee', { p: x.price })}{x.pay_link && <> · <a href={x.pay_link} target="_blank" rel="noopener noreferrer nofollow" className="underline">{t(lang, 'pay')}</a></>}</p>}
  </div>
}
export function LangSwitch({ lang, onChange }) {
  return <nav className="rsvp-lang" aria-label="Language">{RSVP_LANGS.map(l => <button key={l.id} type="button" lang={l.id} aria-pressed={lang === l.id} onClick={() => onChange(l.id)}>{l.label}</button>)}</nav>
}
export function RsvpGuestExperience({ ev, onAnswer, show, AnswerForm, download, statuses }) {
  const [editing, setEditing] = useState(!ev.mine)
  // The organizer's language for guests; each guest can switch it here.
  const [lang, setLang] = useState(() => langInfo(ev.extras?.lang).id)
  const mine = ev.mine
  return <div className="rsvp-v2 mx-auto max-w-xl space-y-5" dir={langInfo(lang).dir} lang={lang}>
    <LangSwitch lang={lang} onChange={setLang} />
    <InvitationCard ev={ev} lang={lang} /><EventActions ev={ev} download={download} lang={lang} /><GuestExtras ev={ev} lang={lang} />
    <section className={card}>
      {editing || !mine ? <><h2 className="text-2xl font-bold mb-2">{t(lang, 'glad')}</h2><p className="mb-5 text-slate-600">{t(lang, 'details')}</p><AnswerForm ev={ev} mine={mine} show={show} lang={lang} onSaved={r => { onAnswer(r); setEditing(false); show(t(lang, 'saved')) }} /></>
        : <div className="text-center" role="status"><span className="text-4xl" aria-hidden="true">{statuses[mine.status].emoji}</span><h2 className="text-2xl font-bold mt-3">{t(lang, mine.status === 'yes' ? 'thanksYes' : mine.status === 'maybe' ? 'thanksMaybe' : 'thanksNo')}</h2><p className="mt-2">{mine.name} · {t(lang, mine.status)}</p>{mine.status !== 'no' && <p>{lang === 'he' ? peopleLabel(mine.kids, mine.adults) : t(lang, 'people', { n: Number(mine.kids) + Number(mine.adults) })}</p>}<button className={`${btn} mt-5`} onClick={() => setEditing(true)}>✏️ {t(lang, 'change')}</button></div>}
    </section>
    <SiteInvite context={ev.kind === 'kids' ? 'party' : 'event'} />
  </div>
}
