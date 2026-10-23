import { useEffect, useState } from 'react'
import SEO from '../components/ui/SEO'
import { SHABBAT_PLACES } from '../data/shabbatCities'
import { mailApi, MAIL_LABELS, REMINDER_OPTIONS } from '../utils/mailPreferences'
import '../components/mail/mail.css'

export default function MailPreferences() {
 const [link] = useState(() => new URLSearchParams(typeof window === 'undefined' ? '' : window.location.hash.slice(1)))
 const [token, setToken] = useState(link.get('manage') || ''), [form, setForm] = useState(null)
 const [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [confirmed, setConfirmed] = useState(false)
 useEffect(() => { history.replaceState(history.state, '', window.location.pathname) }, [])
 useEffect(() => { if (!token) return; let live = true; mailApi('get', { token }).then(d => { if (live) setForm(d) }).catch(e => { if (live) setMessage(e.message) }); return () => { live = false } }, [token])
 async function confirm() { setBusy(true); try { const result = await mailApi('confirm', { token: link.get('confirm') }); setToken(result.token); setConfirmed(true); setMessage('ההרשמה אושרה! כאן אפשר לעדכן את ההעדפות בכל רגע.') } catch (e) { setMessage(e.message) } finally { setBusy(false) } }
 async function save(e, allOff = false) { e.preventDefault(); setBusy(true); try { const preferences = allOff ? { ...form, shabbat: false, weekly: false, marketing: false } : form; await mailApi('update', { token, preferences }); setForm(preferences); setMessage(allOff ? 'הוסרתם מכל המיילים. לא נשלח מיילים נוספים.' : 'ההעדפות נשמרו.'); } catch (e) { setMessage(e.message) } finally { setBusy(false) } }
 return <main className="max-w-2xl mx-auto px-4 py-8" dir="rtl"><SEO title="העדפות המייל שלי" path="/mail-preferences" noindex /><h1 className="text-3xl">המיילים שלי מעוגה בוגה</h1>
 {link.get('confirm') && !confirmed && <section className="mail-signup"><p>לחצו כדי לאשר את ההרשמה והבחירות שבמייל שקיבלתם.</p><button className="mail-button" disabled={busy} onClick={confirm}>אישור הרשמה</button></section>}
 {!token && !link.get('confirm') && <p className="mt-4">כדי לנהל את ההרשמה, פתחו את קישור שינוי ההעדפות שבתחתית המייל שקיבלתם.</p>}
 {form && <form className="mail-form" onSubmit={save}><p dir="ltr">{form.email}</p><fieldset><legend>מה תרצו לקבל?</legend>{Object.entries(MAIL_LABELS).map(([key, label]) => <label className="mail-check" key={key}><input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />{label}{key === 'marketing' ? ' — אני מסכים/ה לקבל דיוור פרסומי' : ''}</label>)}</fieldset>
 {form.shabbat && <div className="mail-options"><label>עיר<select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>{SHABBAT_PLACES.map(c => <option key={c.slug} value={c.slug}>{c.name} · {c.offset} דק׳ לפני השקיעה</option>)}</select></label><label>מתי להזכיר?<select value={form.minutes} onChange={e => setForm({ ...form, minutes: Number(e.target.value) })}>{REMINDER_OPTIONS.map(([n, text]) => <option key={n} value={n}>{text}</option>)}</select></label></div>}
 <p className="mail-fine">עד מייל תוכן או הצעות אחד בשבוע, ותזכורת שבת רק אם בחרתם. ההעדפות תקפות למיילים הבאים; מייל שכבר נשלח עשוי עדיין להגיע.</p>
 <button className="mail-button" disabled={busy}>שמירת ההעדפות</button><button type="button" className="underline min-h-[44px]" disabled={busy} onClick={e => save(e, true)}>הסרה מכל המיילים</button></form>}
 <p role="status" className="mt-4">{message}</p></main>
}
