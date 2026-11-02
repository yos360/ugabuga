import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { DoneCard, REQUEST_ETA, useDoneRequests, WhatsAppAsk } from '../components/ui/DoneRequests'
import { groupByTopic } from '../data/requestTopics'

// /request/done — everything made from visitors' requests, in one place. Visitors who asked without an
// email find their page here; a page that also went into its subject section is listed here as well.
export default function RequestDone() {
  const rows = useDoneRequests(300)
  const [q, setQ] = useState('')
  const shown = useMemo(() => {
    const t = q.trim()
    return (rows || []).filter(r => !t || `${r.title} ${r.audience || ''}`.includes(t))
  }, [rows, q])
  const groups = useMemo(() => groupByTopic(shown), [shown])
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="הכנו לפי בקשה — כל הדפים והחוברות שהכנו לפי בקשות" description="כל דפי העבודה, החוברות ודפי הצביעה שהכנו לפי בקשות של הורים, גננות ומורות — במקום אחד, בחינם." path="/request/done" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מבקשים דף', href: '/request' }, { label: 'הכנו לפי בקשה' }]} />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">🎁 </span>הכנו לפי בקשה</h1>
    <p className="mx-auto mt-3 max-w-2xl text-center text-lg">כל מה שהכנו לפי בקשה מופיע כאן, מחולק לפי נושאים — בכל נושא החדש ביותר למעלה.</p>
    <div className="mx-auto mt-5 max-w-2xl rounded-2xl bg-[var(--postit)] p-4">
      <p className="font-black">⏱️ ביקשתם? המערכת כבר בונה את זה</p>
      <p className="mt-1">ברגע שבקשה מגיעה מתחילים להכין אותה — {REQUEST_ETA}. כשהדף מוכן הוא מופיע כאן, ומי שהשאיר מייל מקבל גם מייל עם הקישור.</p>
      <p className="mt-1 text-sm">דף שנכנס גם למקום שלו באתר (למשל לחוברות או לדפי החשבון) — מופיע גם כאן. בקשות אישיות (קובץ לאדם אחד, שיעורי בית במקום הילד) לא מוכנות.</p>
    </div>
    {rows && rows.length > 6 && <input value={q} onChange={e => setQ(e.target.value)} placeholder="חיפוש, למשל: חיבור, צביעה, כיתה ב׳" aria-label="חיפוש בדפים שהכנו לפי בקשה"
      className="mt-6 block min-h-11 w-full rounded-2xl border-2 border-[var(--border)] bg-white p-3" />}
    {!rows ? <p className="mt-6 text-center text-[var(--muted-foreground)]">טוען…</p>
      : !shown.length ? <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-center">{q ? 'לא מצאנו. נסו מילה אחרת.' : 'עוד אין כאן דפים — הבקשות הראשונות בדרך.'}</p>
      : <>
        {groups.length > 1 && <nav aria-label="נושאים" className="mt-6 flex flex-wrap justify-center gap-2">
          {groups.map(g => <a key={g.key} href={`#topic-${g.key}`} className="inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-violet-200 bg-white px-4 font-bold hover:bg-violet-50">
            <span aria-hidden="true">{g.emoji}</span> {g.label} <small className="text-slate-500">({g.items.length})</small>
          </a>)}
        </nav>}
        {groups.map(g => <section key={g.key} id={`topic-${g.key}`} className="mt-8 scroll-mt-20">
          <h2 className="text-2xl font-black"><span aria-hidden="true">{g.emoji} </span>{g.label}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{g.items.map(r => <li key={`${r.path}-${r.done_at}`}><DoneCard r={r} /></li>)}</ul>
        </section>)}
      </>}
    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
      <Link to="/request" className="inline-flex min-h-[48px] items-center rounded-2xl bg-violet-700 px-5 font-black text-white">📝 חסר לכם משהו? בקשו ←</Link>
      <WhatsAppAsk />
    </div>
  </div>
}
