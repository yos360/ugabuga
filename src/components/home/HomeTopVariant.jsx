import { useState } from 'react'
import { Link } from 'react-router-dom'
import { submitPageRequest } from '../../utils/pageRequests'
import { DONE_PATH, REQUEST_ETA } from '../ui/DoneRequests'
import { recordExperiment } from '../../utils/experiments'
import { rsvpType } from '../../utils/rsvpTypes'

// The non-search openings of the home-page experiment (see utils/experiments.js).
// "search" is the page as it always was, so it needs no block here.
export function LiveTop({ variant }) {
  return <Link to="/live" onClick={() => recordExperiment('click', variant)} className="hp-exp hp-exp-live">
    <span className="hp-exp-ic" aria-hidden="true">⚡</span>
    <span className="hp-exp-copy"><b>בוגה לייב — חידון חי לכיתה, למשפחה ולמסיבה</b><small>מקרינים על המסך, וכל אחד עונה מהטלפון. עד 100 משתתפים, בלי הרשמה.</small></span>
    <span className="hp-exp-cta">מתחילים חידון ←</span>
  </Link>
}

export function BringTop({ variant }) {
  return <Link to="/tools/bring-list" onClick={() => recordExperiment('click', variant)} className="hp-exp hp-exp-live">
    <span className="hp-exp-ic" aria-hidden="true">🧺</span>
    <span className="hp-exp-copy"><b>מי מביא מה? רשימה שיתופית למסיבה</b><small>יום הולדת, מסיבת כיתה או ארוחת חג: שולחים קישור אחד בוואטסאפ, וכל אחד מסמן מה הוא מביא. בלי בלגן ובלי כפילויות.</small></span>
    <span className="hp-exp-cta">יוצרים רשימה ←</span>
  </Link>
}

const RSVP_CHIPS = ['wedding', 'bar-mitzvah', 'class-party'].map(rsvpType).filter(Boolean)

export function RsvpTop({ variant }) {
  const click = () => recordExperiment('click', variant)
  return <div className="hp-exp hp-exp-live">
    <span className="hp-exp-ic" aria-hidden="true">💌</span>
    <span className="hp-exp-copy"><b>מזמינים אורחים? אישורי הגעה בחינם, בלי הרשמה</b><small>שולחים קישור אחד בוואטסאפ, וכל אורח מאשר בלחיצה. אתם רואים מי מגיע, כמה ילדים ומבוגרים, ומי עוד לא ענה.</small></span>
    <Link to="/rsvp" onClick={click} className="hp-exp-cta">יוצרים אישורי הגעה ←</Link>
    {RSVP_CHIPS.length > 0 && <span className="hp-exp-chips">{RSVP_CHIPS.map(t => <Link key={t.slug} to={`/rsvp/${t.slug}`} onClick={click} className="hp-exp-chip">{t.emoji} {t.name}</Link>)}</span>}
  </div>
}

export function RequestTop({ variant }) {
  const [text, setText] = useState(''), [state, setState] = useState('idle')
  const send = async e => {
    e.preventDefault()
    if (text.trim().length < 3) { setState('short'); return }
    recordExperiment('click', variant)
    setState('sending')
    const ok = await submitPageRequest({ request: text, fromPath: '/', source: 'home' })
    if (ok) recordExperiment('request', variant)
    setState(ok ? 'sent' : 'error')
  }
  if (state === 'sent') return <div className="hp-exp hp-exp-request" role="status"><span className="hp-exp-ic" aria-hidden="true">🎉</span><span className="hp-exp-copy"><b>תודה! הבקשה הגיעה אלינו</b><small>המערכת כבר בונה את זה — {REQUEST_ETA}. כשזה מוכן זה מופיע ב<Link to={DONE_PATH} className="font-bold underline">״הכנו לפי בקשה״</Link>. רוצים גם מייל? <Link to="/request" className="underline">לטופס המלא</Link></small></span></div>
  return <form onSubmit={send} className="hp-exp hp-exp-request">
    <span className="hp-exp-ic" aria-hidden="true">📝</span>
    <label className="hp-exp-copy"><b>מה אתם מבקשים מעוגה בוגה?</b><small>חסר לכם דף עבודה, חוברת, דף צביעה או משחק? כתבו — ואנחנו מכינים, בחינם.</small>
      <input value={text} onChange={e => { setText(e.target.value); if (state !== 'sending') setState('idle') }} onFocus={() => recordExperiment('click', variant)} maxLength={400} placeholder="למשל: דפי צביעה של כלבי ים לגן" className="hp-exp-input" />
    </label>
    <button type="submit" disabled={state === 'sending'} className="hp-exp-cta">{state === 'sending' ? 'שולחים…' : 'שליחה ←'}</button>
    {state === 'short' && <small className="hp-exp-msg" role="alert">כתבו בכמה מילים מה צריך.</small>}
    {state === 'error' && <small className="hp-exp-msg" role="alert">משהו השתבש. נסו שוב, או <Link to="/request" className="underline">בטופס המלא</Link>.</small>}
  </form>
}
