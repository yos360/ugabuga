import { lazy, Suspense, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
const ShabbatCitySelect = lazy(() => import('./ShabbatCitySelect'))
import { mailApi, normalizeMail, REMINDER_OPTIONS } from '../../utils/mailPreferences'

export default function MailSignup({ city, expanded = false, allowShabbat = false }) {
  const id = useId(), [open, setOpen] = useState(expanded), [ready, setReady] = useState(null)
  const [form, setForm] = useState({ email: '', city: city?.slug || 'jerusalem', minutes: 60, shabbat: false, weekly: false, marketing: false })
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [sent, setSent] = useState(false)
  useEffect(() => { if (!open) return; let live = true; mailApi('health').then(d => { if (live) setReady(d.ready) }).catch(() => { if (live) setReady(false) }); return () => { live = false } }, [open])
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMessage('')
    try { await mailApi('subscribe', { preferences: normalizeMail(form) }); setSent(true); setMessage('אם ניתן לשלוח לכתובת הזו, יגיע אליכם מייל עם קישור לאישור. בדקו גם בתיקיית הספאם. ההרשמה תופעל רק לאחר האישור.') } catch (e) { setMessage(e.message) } finally { setBusy(false) }
  }
  return <section className="mail-signup no-print" aria-labelledby={`${id}-title`}>
    <div className="mail-signup-intro"><div><h2 id={`${id}-title`}>{allowShabbat ? 'תזכורת לשבת, בזמן שמתאים לכם' : 'קצת השראה, פעם בשבוע'}</h2><p>{allowShabbat ? 'בוחרים עיר ומתי לקבל תזכורת במייל לפני כניסת שבת.' : 'עד שלושה רעיונות למשחק, יצירה וזמן ביחד.'}</p></div><button type="button" className="mail-button" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'סגירה' : 'מה אפשר לקבל במייל?'}</button></div>
    {open && <form onSubmit={submit} className="mail-form">
      <p>אתם בוחרים מה לקבל. בלי חשבון, בלי סיסמה, ואפשר לבטל בכל רגע.</p>
      <label>כתובת המייל שלכם<input type="email" autoComplete="email" required maxLength={254} dir="ltr" value={form.email} onChange={e => set('email', e.target.value)} /></label>
      <fieldset><legend>מה תרצו לקבל? בחרו רק מה שמתאים לכם</legend>
        {allowShabbat && <label className="mail-check"><input type="checkbox" checked={form.shabbat} onChange={e => set('shabbat', e.target.checked)} />תזכורת כניסת שבת לפי העיר שלי</label>}
        {form.shabbat && <div className="mail-options"><label>עיר<Suspense fallback={<select disabled value={form.city}><option value={form.city}>טוענים ערים…</option></select>}><ShabbatCitySelect value={form.city} onChange={e => set('city', e.target.value)} /></Suspense></label><label>מתי להזכיר לי?<select value={form.minutes} onChange={e => set('minutes', Number(e.target.value))}>{REMINDER_OPTIONS.map(([n, text]) => <option key={n} value={n}>{text}</option>)}</select></label></div>}
        <label className="mail-check"><input type="checkbox" checked={form.weekly} onChange={e => set('weekly', e.target.checked)} />אני רוצה לקבל תוכן שבועי מעוגה בוגה</label>
        <label className="mail-check"><input type="checkbox" checked={form.marketing} onChange={e => set('marketing', e.target.checked)} />אני מסכים/ה לקבל גם הצעות ופרסומות מעוגה בוגה במייל</label>
      </fieldset>
      <p className="mail-fine">עד מייל תוכן או הצעות אחד בשבוע.{allowShabbat ? ' תזכורת שבת בנפרד רק למי שבחר. זמני המסירה עשויים להתעכב.' : ''} ההרשמה מיועדת להורים ולמבוגרים.</p>
      <p className="mail-fine">מסירת הפרטים היא לבחירתכם. עוגה בוגה ישמור את המייל, ההעדפות ותיעוד ההסכמה לצורך הדיוור שבחרתם, באמצעות שירותי אחסון ומשלוח מייל. ללא הפרטים לא נוכל לשלוח תזכורות. לעיון, תיקון או מחיקה: <a href="mailto:hellohugabuga@gmail.com">hellohugabuga@gmail.com</a>. <Link to="/privacy">מדיניות פרטיות</Link>.</p>
      {ready === false && <p role="status">ההרשמה עדיין בהכנה. אפשר לעיין באפשרויות, אך כרגע לא נשמרים פרטים ולא נשלחים מיילים.</p>}
      <button className="mail-button" disabled={!ready || busy || sent}>{busy ? 'שולחים…' : sent ? 'בדקו את תיבת המייל' : 'שלחו לי קישור לאישור'}</button>
      <p role="status">{message}</p>
    </form>}
  </section>
}
