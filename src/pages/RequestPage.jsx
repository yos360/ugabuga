import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CHANNEL_GO } from '../data/brand'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import { submitPageRequest } from '../utils/pageRequests'
import DoneRequests, { DONE_PATH, REQUEST_ETA, WhatsAppAsk } from '../components/ui/DoneRequests'
import { landingTags } from '../utils/qrVariants'
import { recordExperiment } from '../utils/experiments'
import { mailApi, normalizeMail } from '../utils/mailPreferences'
import { searchItems } from '../data/searchIndex'

// While the visitor types, pages the site already has that match the request ("אולי זה מה שחיפשתם?").
// The static catalog is loaded only once someone starts typing.
function useMatches(text) {
  const [items, setItems] = useState(null), [hits, setHits] = useState([])
  const q = text.trim()
  useEffect(() => { if (q.length >= 4 && !items) import('../data/searchStatic').then(m => setItems(m.STATIC_ITEMS)).catch(() => {}) }, [q, items])
  useEffect(() => {
    if (!items || q.length < 4) { setHits([]); return }
    const timer = setTimeout(() => setHits(searchItems(items, q).slice(0, 3)), 350)
    return () => clearTimeout(timer)
  }, [items, q])
  return hits
}

// /request — "מבקשים דף": visitors tell the owner which page, booklet or game is missing.
// Reached from the banner, empty search results and the QR on printed pages (?from=<printed page>).
const ROLES = ['הורה', 'גננת', 'מורה', 'קלינאית / מטפלת']
const AUDIENCES = ['גן', 'כיתה א׳–ב׳', 'כיתה ג׳–ד׳', 'כיתה ה׳–ו׳', 'חטיבת ביניים', 'חינוך מיוחד', 'מבוגרים', 'אחר']
const EXAMPLES = ['חוברת חשבון לכיתה ב׳ עם חיבור עד 100', 'דפי צביעה של כלבי ים לגן', 'תפזורת לחנוכה באנגלית', 'דף עבודה על החלל לכיתה ד׳']
const FAQ = [
  { q: 'כמה זה עולה?', a: 'כלום. הדפים שמכינים לפי בקשה עולים לאתר בחינם, לכל מי שצריך אותם.' },
  { q: 'תוך כמה זמן הדף יהיה מוכן?', a: `ברגע שבקשה מגיעה המערכת מתחילה לבנות אותה — ${REQUEST_ETA}. בקשות אישיות (קובץ לאדם אחד, שיעורי בית במקום הילד) לא מוכנות.` },
  { q: 'לא השארתי מייל — איך אמצא את הדף?', a: 'כל מה שמכינים לפי בקשה מופיע במקום אחד: בדף "הכנו לפי בקשה" (ugabuga.co.il/request/done). גם אם הדף נכנס למקום שלו באתר, למשל לחוברות, הוא מופיע שם.' },
  { q: 'מה עושים עם המייל שלי?', a: 'המייל הוא רשות, ומשמש רק כדי לכתוב לכם שהדף מוכן. הוא לא מתפרסם ולא נמסר לאף אחד. את הדפים החדשים של השבוע נשלח רק אם סימנתם זאת ואישרתם במייל — ואפשר לבטל בכל רגע.' },
]
const field = 'mt-1 block w-full rounded-2xl border-2 border-[var(--border)] bg-white p-3 font-normal'

export default function RequestPage() {
  const [params] = useSearchParams()
  const from = params.get('from') || '', source = landingTags().source === 'qr' ? 'qr' : ['search', 'print', 'site'].includes(params.get('src')) ? params.get('src') : 'site'
  const [request, setRequest] = useState(() => (params.get('q') ? `${params.get('q')}` : ''))
  const [audience, setAudience] = useState(''), [role, setRole] = useState(''), [email, setEmail] = useState('')
  const [state, setState] = useState('idle'), [weekly, setWeekly] = useState(false), [weeklySent, setWeeklySent] = useState(false)
  const matches = useMatches(request)
  useEffect(() => { if (state === 'sent') document.getElementById('request-done')?.focus() }, [state])
  const send = async e => {
    e.preventDefault()
    if (request.trim().length < 3) { setState('short'); return }
    setState('sending')
    const ok = await submitPageRequest({ request, audience: [role, audience].filter(Boolean).join(' · '), email, fromPath: from, source })
    if (ok) recordExperiment('request')
    // The weekly mail only by explicit opt-in (unchecked by default), confirmed by a link the visitor gets.
    if (ok && weekly && email.trim()) setWeeklySent(await mailApi('subscribe', { preferences: normalizeMail({ email, weekly: true, city: 'jerusalem', minutes: 60 }) }).then(() => true, () => false))
    setState(ok ? 'sent' : 'error')
  }
  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <SEO title="מבקשים דף — מכינים דפי עבודה וחוברות לפי בקשה, בחינם" description="חסר לכם דף עבודה, חוברת, דף צביעה או משחק? ספרו לנו מה צריך ולאיזה גיל — ובכל שבוע אנחנו מכינים את הבקשות הכי מבוקשות, בחינם." path="/request" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מבקשים דף' }]} />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">📝 </span>מבקשים דף — ואנחנו מכינים</h1>
    <p className="mx-auto mt-3 max-w-2xl text-center text-lg">חסר לכם דף עבודה, חוברת, דף צביעה או משחק? ספרו לנו מה צריך ולאיזה גיל, והמערכת מתחילה לבנות — {REQUEST_ETA}. בחינם, לכולם.</p>
    {from && source === 'qr' && <p className="mx-auto mt-3 max-w-2xl rounded-2xl bg-[var(--postit)] p-3 text-center">👋 הגעתם מדף מודפס של עוגה בוגה. <Link to={from} className="font-bold underline">לדף שהודפס</Link></p>}
    {state === 'sent'
      ? <section id="request-done" tabIndex={-1} className="mt-8 rounded-3xl border-2 border-emerald-400 bg-emerald-50 p-6 text-center outline-none" aria-live="polite">
        <p className="text-5xl" aria-hidden="true">🎉</p>
        <h2 className="mt-2 text-2xl font-black">תודה! הבקשה התקבלה</h2>
        <p className="mt-2 font-bold">⏱️ המערכת כבר בונה את זה — {REQUEST_ETA}.</p>
        <p className="mt-2">{email ? 'כשהדף יהיה מוכן נשלח לכם מייל עם הקישור, והוא יופיע גם בדף "הכנו לפי בקשה".' : 'כשהדף יהיה מוכן הוא יופיע בדף "הכנו לפי בקשה" — שם מופיע כל מה שמכינים לפי בקשה, גם אם הוא נכנס למקום שלו באתר. שמרו את הקישור:'}</p>
        <Link to={DONE_PATH} className="mt-3 inline-flex min-h-[48px] items-center rounded-2xl bg-emerald-600 px-5 font-black text-white">🎁 לדף &quot;הכנו לפי בקשה&quot; ←</Link>
        <p className="mt-4">בינתיים אפשר להציץ בדפים שכבר יש:</p>
        {weeklySent && <p className="mt-2 font-bold">📬 שלחנו לכם גם מייל לאישור ההרשמה לדפים של השבוע — לוחצים על הקישור שבו, וזהו.</p>}
        <div className="mt-4 flex flex-wrap justify-center gap-2"><Link to="/printables" className="rounded-2xl bg-violet-700 px-5 py-3 font-bold text-white">כל הדפים להדפסה</Link><Link to="/booklets" className="rounded-2xl border-2 border-violet-300 bg-white px-5 py-3 font-bold">חוברות עבודה</Link><button type="button" onClick={() => { setRequest(''); setState('idle') }} className="rounded-2xl border-2 border-slate-300 bg-white px-5 py-3 font-bold">בקשה נוספת</button></div>
        <a href={CHANNEL_GO} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-[48px] items-center rounded-2xl bg-emerald-600 px-5 font-bold text-white hover:bg-emerald-700">📢 דף חדש כל יום — הצטרפו לערוץ הוואטסאפ</a>
      </section>
      : <form onSubmit={send} className="mt-8 space-y-5 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5 sm:p-7" noValidate>
        <label className="block font-bold">מה להכין לכם?
          <textarea value={request} onChange={e => { setRequest(e.target.value); if (state === 'short') setState('idle') }} maxLength={400} rows={4} required className={field} placeholder={`למשל: ${EXAMPLES[0]}`} aria-describedby="request-examples" />
        </label>
        <p id="request-examples" className="-mt-3 text-sm text-[var(--muted-foreground)]">רעיונות: {EXAMPLES.slice(1).join(' · ')}</p>
        {matches.length > 0 && <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3" aria-live="polite">
          <p className="font-black">💡 אולי זה מה שחיפשתם? כבר יש באתר:</p>
          <ul className="mt-2 space-y-1">{matches.map(m => <li key={m.to}><Link to={m.to} target="_blank" className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 font-bold hover:bg-emerald-100"><span aria-hidden="true">{m.emoji}</span>{m.title} <span className="text-sm font-normal text-[var(--muted-foreground)]">↗</span></Link></li>)}</ul>
          <p className="mt-2 text-sm">לא בדיוק זה? שלחו את הבקשה ונכין בדיוק מה שצריך.</p>
        </div>}
        {state === 'short' && <p className="font-bold text-red-700" role="alert">כתבו בכמה מילים מה צריך.</p>}
        <fieldset><legend className="font-bold">מי אתם? <span className="font-normal text-[var(--muted-foreground)]">(רשות — גננות ומורות: ספרו מה הנושא השבועי)</span></legend>
          <div className="mt-2 flex flex-wrap gap-2">{ROLES.map(a => <button key={a} type="button" aria-pressed={role === a} onClick={() => setRole(role === a ? '' : a)} className={`min-h-[44px] rounded-xl border-2 px-3 font-bold ${role === a ? 'border-violet-600 bg-violet-100' : 'border-slate-300 bg-white'}`}>{a}</button>)}</div>
        </fieldset>
        <fieldset><legend className="font-bold">לאיזה גיל? <span className="font-normal text-[var(--muted-foreground)]">(רשות)</span></legend>
          <div className="mt-2 flex flex-wrap gap-2">{AUDIENCES.map(a => <button key={a} type="button" aria-pressed={audience === a} onClick={() => setAudience(audience === a ? '' : a)} className={`min-h-[44px] rounded-xl border-2 px-3 font-bold ${audience === a ? 'border-violet-600 bg-violet-100' : 'border-slate-300 bg-white'}`}>{a}</button>)}</div>
        </fieldset>
        <label className="block font-bold">מייל, אם תרצו שנכתוב לכם כשהדף מוכן <span className="font-normal text-[var(--muted-foreground)]">(רשות)</span>
          <input type="email" dir="ltr" value={email} onChange={e => setEmail(e.target.value)} maxLength={120} autoComplete="email" className={field} />
        </label>
        {!email.trim() && <p className="-mt-3 text-sm">בלי מייל? אין בעיה — כל מה שמכינים לפי בקשה מופיע בדף <Link to={DONE_PATH} className="font-bold underline">״הכנו לפי בקשה״</Link>, {REQUEST_ETA}.</p>}
        {email.trim() && <label className="-mt-2 flex items-start gap-2 font-bold"><input type="checkbox" checked={weekly} onChange={e => setWeekly(e.target.checked)} className="mt-1 h-5 w-5 flex-none" />
          <span>שלחו לי גם את הדפים החדשים של השבוע <span className="font-normal text-[var(--muted-foreground)]">(מייל אחד בשבוע, אפשר לבטל בכל רגע)</span></span></label>}
        <p className="text-xs text-[var(--muted-foreground)]">המייל משמש כדי לעדכן שהדף מוכן, ואם סימנתם — גם לדפים של השבוע. הוא לא מתפרסם ולא נמסר לאף אחד. אל תכתבו בבקשה שמות של ילדים או מספרי טלפון. <Link to="/privacy" className="underline">מדיניות הפרטיות</Link></p>
        {state === 'error' && <p className="font-bold text-red-700" role="alert">משהו השתבש בשליחה. נסו שוב בעוד רגע.</p>}
        <button type="submit" disabled={state === 'sending'} className="min-h-[52px] w-full rounded-2xl bg-violet-700 px-6 text-lg font-black text-white disabled:opacity-60">{state === 'sending' ? 'שולחים…' : 'שליחת הבקשה'}</button>
        <div className="text-center"><WhatsAppAsk /></div>
      </form>}
    <DoneRequests className="mt-10" />
    <div className="mt-10"><SeoBody paragraphs={['עוגה בוגה נבנה מבקשות של הורים, גננות ומורות. אם חיפשתם דף מסוים ולא מצאתם — דף עבודה בנושא שלומדים עכשיו בכיתה, חוברת לחג, דף צביעה של דמות שהילד אוהב או משחק לקבוצה — כתבו לנו כאן.', 'הבקשות מגיעות ישירות אלינו, והמערכת מתחילה להכין אותן מיד. כל מה שמוכן נכנס לאתר כדף חדש, בחינם ולכולם, ומופיע גם בדף "הכנו לפי בקשה".']} faq={FAQ} related={[{ label: 'כל הדפים להדפסה', href: '/printables' }, { label: 'חוברות עבודה להדפסה', href: '/booklets' }, { label: 'דפי צביעה', href: '/printables/coloring' }]} /></div>
  </div>
}
