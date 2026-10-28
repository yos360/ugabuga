import { useState } from 'react'
import { Link } from 'react-router-dom'
import { submitPageRequest } from '../../utils/pageRequests'
import { recordExperiment } from '../../utils/experiments'

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
  if (state === 'sent') return <div className="hp-exp hp-exp-request" role="status"><span className="hp-exp-ic" aria-hidden="true">🎉</span><span className="hp-exp-copy"><b>תודה! הבקשה הגיעה אלינו</b><small>כל שבוע אנחנו מכינים את מה שהכי מבקשים. רוצים שנעדכן אתכם במייל? <Link to="/request" className="underline">לטופס המלא</Link></small></span></div>
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
