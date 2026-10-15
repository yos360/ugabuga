import { useEffect, useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'
import { csvCell, mailApi, MAIL_LABELS } from '../../utils/mailPreferences'
import '../mail/mail.css'
async function ownerMail(action, payload) {
 const { data } = await ownerSupabase.auth.getSession()
 if (!data.session) throw new Error('נדרשת התחברות מחדש.')
 return mailApi(action, payload, data.session.access_token)
}
export default function MailSubscribers() {
 const [counts, setCounts] = useState(null), [rows, setRows] = useState([]), [filter, setFilter] = useState('marketing')
 const [open, setOpen] = useState(false), [offset, setOffset] = useState(0), [tick, setTick] = useState(0), [error, setError] = useState(''), [busy, setBusy] = useState(false)
 useEffect(() => { let live = true; ownerMail('counts').then(d => { if (live) { setCounts(d); setError('') } }).catch(e => { if (live) setError(e.message) }); return () => { live = false } }, [tick])
 useEffect(() => { if (!open) return; let live = true; setRows([]); ownerMail('list', { filter, offset }).then(d => { if (live) setRows(d) }).catch(e => { if (live) setError(e.message) }); return () => { live = false } }, [open, filter, offset, tick])
 async function exportCsv() {
  setBusy(true); setError('')
  try {
   let all = [], page
   do { page = await ownerMail('list', { filter, offset: all.length }); all.push(...page) } while (page.length === 200 && all.length < 100000)
   // Mailing exports always exclude unconfirmed/unsubscribed records, including the "all" view.
   all = all.filter(r => r.confirmed_at && (filter === 'all' ? r.shabbat || r.weekly || r.marketing : r[filter]))
   const table = [['מייל','שבת','תוכן שבועי','פרסומות','עיר','דקות לפני שבת','אושר בתאריך'], ...all.map(r => [r.email,r.shabbat,r.weekly,r.marketing,r.city,r.minutes,r.confirmed_at])]
   const url = URL.createObjectURL(new Blob(['\ufeff' + table.map(row => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }))
   const a = document.createElement('a'); a.href = url; a.download = `ugabuga-${filter}-subscribers.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (e) { setError(e.message) } finally { setBusy(false) }
 }
 return <section className="mail-admin" dir="rtl"><h2 className="text-2xl mb-3">נרשמים למייל</h2><p className="text-sm mb-3">מאושרים ופעילים כעת, מכל הזמנים. אדם שבחר כמה סוגים נספר בכל אחד מהם.</p>
 <div className="mail-counts">{Object.entries(MAIL_LABELS).map(([key,label]) => <div key={key}>{label}<strong>{counts ? Number(counts[key]).toLocaleString('he-IL') : '—'}</strong></div>)}</div>
 <div className="mail-admin-controls"><button className="mail-button" onClick={() => setTick(t => t + 1)}>רענון</button><button className="mail-button" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'סגירת הרשימה' : 'רשימת תפוצה פרטית'}</button></div>
 <p role="status">{error}</p>
 {open && <><div className="mail-admin-controls"><label>הצגת רשימה <select value={filter} onChange={e => { setFilter(e.target.value); setOffset(0) }}><option value="all">כל הרשומות, כולל ממתינים ומוסרים</option>{Object.entries(MAIL_LABELS).map(([k,l]) => <option key={k} value={k}>{l} — מאושרים פעילים בלבד</option>)}</select></label><button className="mail-button" onClick={exportCsv} disabled={busy}>{busy ? 'מכינים קובץ…' : 'ייצוא מאושרים פעילים ל־CSV'}</button></div>
 <p className="text-sm">לפרסום השתמשו רק בסינון ״הצעות ופרסומות״. ייצוא הוא צילום מצב; לפני כל משלוח יש לעדכן הסרות.</p>
 <div className="overflow-x-auto"><table><thead><tr><th>מייל</th><th>הרשמות</th><th>סטטוס</th><th>הצטרפות</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td dir="ltr">{r.email}</td><td>{Object.entries(MAIL_LABELS).filter(([k]) => r[k]).map(([,v]) => v).join(' · ') || '—'}</td><td>{!r.confirmed_at ? 'ממתין לאישור' : r.shabbat || r.weekly || r.marketing ? 'מאושר ופעיל' : 'הוסר'}</td><td>{new Date(r.created_at).toLocaleDateString('he-IL')}</td></tr>)}</tbody></table></div>
 <div className="mail-admin-controls"><button disabled={!offset} onClick={() => setOffset(n => Math.max(0, n - 200))}>הקודמים</button><span>{offset + 1}–{offset + rows.length}</span><button disabled={rows.length < 200} onClick={() => setOffset(n => n + 200)}>הבאים</button></div></>}
 </section>
}
