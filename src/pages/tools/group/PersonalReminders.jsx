import { useState } from 'react'
import { card, input, btn, btnWa } from './GroupUi'
import { parsePhoneBook, phoneFor, personalReminder, waLink, loadPhoneText, savePhoneText } from '../../../utils/personalReminders'

// One WhatsApp message per guest who hasn't replied, with their own name. What paid RSVP services
// sell; here the organizer taps "send" on each one, and the phone numbers never leave this device.
export default function PersonalReminders({ ev, missing, link }) {
  const [text, setText] = useState(() => loadPhoneText(ev.code))
  const [sent, setSent] = useState({})
  const book = parsePhoneBook(text)
  const withPhone = missing.map(name => ({ name, phone: phoneFor(book, name) })).filter(g => g.phone)
  const next = withPhone.find(g => !sent[g.name])
  const send = g => { window.open(waLink(g.phone, personalReminder(g.name, ev, link)), '_blank', 'noopener,noreferrer'); setSent(s => ({ ...s, [g.name]: true })) }
  return <section className={card} aria-labelledby="personal-reminders">
    <h2 id="personal-reminders" className="text-xl font-bold">📲 תזכורת אישית לכל אורח</h2>
    <p className="mt-1 text-sm text-slate-600">הודעה נפרדת בוואטסאפ עם השם של כל מי שעוד לא ענה. בלי תשלום — המספרים נשמרים רק במכשיר הזה ולא נשלחים אלינו.</p>
    <details className="mt-3" open={!text}>
      <summary className="cursor-pointer font-bold">טלפונים של המוזמנים</summary>
      <textarea className={`${input} mt-2 min-h-[110px]`} value={text} dir="auto" placeholder={'נועה כהן 050-1234567\nיואב לוי 052-7654321'}
        onChange={e => { setText(e.target.value); savePhoneText(ev.code, e.target.value) }} />
      <p className="mt-1 text-xs text-slate-500">שם וטלפון בכל שורה, כמו ברשימת המוזמנים. אפשר להדביק מאקסל.</p>
    </details>
    {missing.length > 0 && <p className="mt-3 text-sm">{withPhone.length} מתוך {missing.length} שלא ענו עם טלפון{withPhone.length < missing.length && ' — לשאר אפשר לשלוח את התזכורת הכללית'}.</p>}
    {next && <button onClick={() => send(next)} className={`${btnWa} mt-3 w-full`}>💬 שליחה ל{next.name} ({Object.keys(sent).length + 1}/{withPhone.length})</button>}
    {withPhone.length > 0 && !next && <p className="mt-3 font-bold text-emerald-700">נפתחה הודעה לכל אחד 🎉</p>}
    {withPhone.length > 1 && <ul className="mt-3 max-h-56 space-y-1 overflow-auto">
      {withPhone.map(g => <li key={g.name} className="flex items-center justify-between gap-2">
        <span className={sent[g.name] ? 'text-slate-400 line-through' : ''}>{g.name}</span>
        <button onClick={() => send(g)} className={`${btn} min-h-[36px] px-3 text-sm`}>{sent[g.name] ? 'שוב' : 'שליחה'}</button>
      </li>)}
    </ul>}
  </section>
}
