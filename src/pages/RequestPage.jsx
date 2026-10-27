import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import { submitPageRequest } from '../utils/pageRequests'
import DoneRequests, { WhatsAppAsk } from '../components/ui/DoneRequests'
import { landingTags } from '../utils/qrVariants'
import { recordExperiment } from '../utils/experiments'

// /request — "מבקשים דף": visitors tell the owner which page, booklet or game is missing.
// Reached from the banner, empty search results and the QR on printed pages (?from=<printed page>).
const ROLES = ['הורה', 'גננת', 'מורה', 'קלינאית / מטפלת']
const AUDIENCES = ['גן', 'כיתה א׳–ב׳', 'כיתה ג׳–ד׳', 'כיתה ה׳–ו׳', 'חטיבת ביניים', 'חינוך מיוחד', 'מבוגרים', 'אחר']
const EXAMPLES = ['חוברת חשבון לכיתה ב׳ עם חיבור עד 100', 'דפי צביעה של כלבי ים לגן', 'תפזורת לחנוכה באנגלית', 'דף עבודה על החלל לכיתה ד׳']
const FAQ = [
  { q: 'כמה זה עולה?', a: 'כלום. הדפים שמכינים לפי בקשה עולים לאתר בחינם, לכל מי שצריך אותם.' },
  { q: 'תוך כמה זמן הדף יהיה מוכן?', a: 'כל שבוע אנחנו בוחרים את הבקשות שהכי מבוקשות ומכינים אותן. אי אפשר להבטיח שכל בקשה תיענה, אבל כל בקשה נקראת.' },
  { q: 'מה עושים עם המייל שלי?', a: 'המייל הוא רשות, ומשמש רק כדי לכתוב לכם שהדף מוכן. הוא לא מתפרסם, לא נמסר לאף אחד ולא נשלח אליו שום דבר אחר.' },
]
const field = 'mt-1 block w-full rounded-2xl border-2 border-[var(--border)] bg-white p-3 font-normal'

export default function RequestPage() {
  const [params] = useSearchParams()
  const from = params.get('from') || '', source = landingTags().source === 'qr' ? 'qr' : ['search', 'print', 'site'].includes(params.get('src')) ? params.get('src') : 'site'
  const [request, setRequest] = useState(() => (params.get('q') ? `${params.get('q')}` : ''))
  const [audience, setAudience] = useState(''), [role, setRole] = useState(''), [email, setEmail] = useState('')
  const [state, setState] = useState('idle')
  useEffect(() => { if (state === 'sent') document.getElementById('request-done')?.focus() }, [state])
  const send = async e => {
    e.preventDefault()
    if (request.trim().length < 3) { setState('short'); return }
    setState('sending')
    const ok = await submitPageRequest({ request, audience: [role, audience].filter(Boolean).join(' · '), email, fromPath: from, source })
    if (ok) recordExperiment('request')
    setState(ok ? 'sent' : 'error')
  }
  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <SEO title="מבקשים דף — מכינים דפי עבודה וחוברות לפי בקשה, בחינם" description="חסר לכם דף עבודה, חוברת, דף צביעה או משחק? ספרו לנו מה צריך ולאיזה גיל — ובכל שבוע אנחנו מכינים את הבקשות הכי מבוקשות, בחינם." path="/request" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מבקשים דף' }]} />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">📝 </span>מבקשים דף — ואנחנו מכינים</h1>
    <p className="mx-auto mt-3 max-w-2xl text-center text-lg">חסר לכם דף עבודה, חוברת, דף צביעה או משחק? ספרו לנו מה צריך ולאיזה גיל. כל שבוע אנחנו מכינים את מה שהכי מבקשים — בחינם, לכולם.</p>
    {from && source === 'qr' && <p className="mx-auto mt-3 max-w-2xl rounded-2xl bg-[var(--postit)] p-3 text-center">👋 הגעתם מדף מודפס של עוגה בוגה. <Link to={from} className="font-bold underline">לדף שהודפס</Link></p>}
    {state === 'sent'
      ? <section id="request-done" tabIndex={-1} className="mt-8 rounded-3xl border-2 border-emerald-400 bg-emerald-50 p-6 text-center outline-none" aria-live="polite">
        <p className="text-5xl" aria-hidden="true">🎉</p>
        <h2 className="mt-2 text-2xl font-black">תודה! הבקשה התקבלה</h2>
        <p className="mt-2">{email ? 'נכתוב לכם למייל כשהדף יהיה מוכן.' : 'כשהדף יהיה מוכן הוא יופיע באתר.'} בינתיים אפשר להציץ בדפים שכבר יש:</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2"><Link to="/printables" className="rounded-2xl bg-violet-700 px-5 py-3 font-bold text-white">כל הדפים להדפסה</Link><Link to="/booklets" className="rounded-2xl border-2 border-violet-300 bg-white px-5 py-3 font-bold">חוברות עבודה</Link><button type="button" onClick={() => { setRequest(''); setState('idle') }} className="rounded-2xl border-2 border-slate-300 bg-white px-5 py-3 font-bold">בקשה נוספת</button></div>
      </section>
      : <form onSubmit={send} className="mt-8 space-y-5 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5 sm:p-7" noValidate>
        <label className="block font-bold">מה להכין לכם?
          <textarea value={request} onChange={e => { setRequest(e.target.value); if (state === 'short') setState('idle') }} maxLength={400} rows={4} required className={field} placeholder={`למשל: ${EXAMPLES[0]}`} aria-describedby="request-examples" />
        </label>
        <p id="request-examples" className="-mt-3 text-sm text-[var(--muted-foreground)]">רעיונות: {EXAMPLES.slice(1).join(' · ')}</p>
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
        <p className="text-xs text-[var(--muted-foreground)]">המייל משמש רק כדי לעדכן שהדף מוכן — לא מתפרסם ולא נמסר לאף אחד. אל תכתבו בבקשה שמות של ילדים או מספרי טלפון. <Link to="/privacy" className="underline">מדיניות הפרטיות</Link></p>
        {state === 'error' && <p className="font-bold text-red-700" role="alert">משהו השתבש בשליחה. נסו שוב בעוד רגע.</p>}
        <button type="submit" disabled={state === 'sending'} className="min-h-[52px] w-full rounded-2xl bg-violet-700 px-6 text-lg font-black text-white disabled:opacity-60">{state === 'sending' ? 'שולחים…' : 'שליחת הבקשה'}</button>
        <div className="text-center"><WhatsAppAsk /></div>
      </form>}
    <DoneRequests className="mt-10" />
    <div className="mt-10"><SeoBody paragraphs={['עוגה בוגה נבנה מבקשות של הורים, גננות ומורות. אם חיפשתם דף מסוים ולא מצאתם — דף עבודה בנושא שלומדים עכשיו בכיתה, חוברת לחג, דף צביעה של דמות שהילד אוהב או משחק לקבוצה — כתבו לנו כאן.', 'הבקשות מגיעות ישירות אלינו. כל שבוע אנחנו עוברים עליהן, ומה שהכי מבקשים נכנס לאתר כדף חדש, בחינם ולכולם.']} faq={FAQ} related={[{ label: 'כל הדפים להדפסה', href: '/printables' }, { label: 'חוברות עבודה להדפסה', href: '/booklets' }, { label: 'דפי צביעה', href: '/printables/coloring' }]} /></div>
  </div>
}
