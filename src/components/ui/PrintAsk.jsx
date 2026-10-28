import { useState } from 'react'
import { recordExperiment } from '../../utils/experiments'
import { CHANNEL_GO } from '../../data/brand'

// Right after a print or PDF — the moment a visitor is most involved — one line: "what else is missing?"
// The request goes to /request's table (source 'print'); the request code loads only on send.
// Below it, a link to the WhatsApp channel ("a new page every day").
const Channel = () => <a className="buga-print-channel" href={CHANNEL_GO} target="_blank" rel="noopener noreferrer" dir="rtl">📢 אהבתם? דף חדש כל יום בוואטסאפ — <b>הצטרפו לערוץ</b></a>
export default function PrintAsk({ path }) {
  const [text, setText] = useState(''), [state, setState] = useState('idle')
  const send = async e => {
    e.preventDefault()
    if (text.trim().length < 3) { setState('short'); return }
    setState('sending')
    const ok = await import('../../utils/pageRequests').then(m => m.submitPageRequest({ request: text, fromPath: path, source: 'print' })).catch(() => false)
    if (ok) recordExperiment('request')
    setState(ok ? 'sent' : 'error')
  }
  if (state === 'sent') return <><p className="buga-print-ask" dir="rtl" role="status">🎉 תודה! קיבלנו. כל שבוע אנחנו מכינים את מה שהכי מבקשים.</p><Channel /></>
  return <><form className="buga-print-ask" dir="rtl" onSubmit={send}>
    <label><b>📝 חסר לכם דף אחר? ספרו לנו ונכין, בחינם</b>
      <input value={text} onChange={e => { setText(e.target.value); if (state !== 'sending') setState('idle') }} maxLength={400} placeholder="למשל: אותו דף בנושא חנוכה, או לכיתה ג׳" /></label>
    <button type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'שולחים…' : 'שליחה'}</button>
    {state === 'short' && <small role="alert">כתבו בכמה מילים מה צריך.</small>}
    {state === 'error' && <small role="alert">לא הצלחנו לשלוח. נסו שוב בעוד רגע.</small>}
  </form><Channel /></>
}
