import { useEffect, useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'

// owner_site_signals: what people reach, miss, search for, click next, and whether it helped. Aggregates only —
// the tables behind it hold no visitor id (see docs/analytics.md).
const pct = (n, of) => of > 0 ? `${Math.min(100, Math.round(n / of * 100))}%` : '—'
const JS_KIND = { type: 'TypeError', ref: 'ReferenceError', syntax: 'SyntaxError', range: 'RangeError', chunk: 'טעינת קובץ נכשלה', other: 'אחר' }

function Block({ title, note, empty, rows, children }) {
  return <section className="mb-6">
    <h3 className="mb-1 text-base font-black">{title}</h3>
    {note && <p className="mb-2 text-xs text-slate-500">{note}</p>}
    {rows?.length ? <div className="overflow-x-auto"><table className="w-full text-right text-sm">{children}</table></div> : <p className="rounded-xl bg-slate-50 p-3 text-sm">{empty}</p>}
  </section>
}

export default function SiteSignals({ from, to, tick = 0, pageName }) {
  const [data, setData] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    let live = true
    ownerSupabase.rpc('owner_site_signals', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data: d, error: e }) => {
      if (!live) return
      if (e || !d) { setError('הנתונים יופיעו לאחר עדכון מסד הנתונים.'); return }
      setData(d); setError('')
    })
    return () => { live = false }
  }, [from, to, tick])
  const name = path => pageName ? pageName({ path, category: 'page' }) : path || '/'
  const Path = ({ path }) => <>{name(path)} <span className="text-xs text-slate-500" dir="ltr">{path || '/'}</span></>
  if (error) return <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold">{error}</p>
  if (!data) return <p className="text-sm text-slate-500">טוען…</p>
  const search = data.search || {}, searches = (search.r0 || 0) + (search.r1_5 || 0) + (search.r6p || 0)
  return <div>
    <p className="mb-4 text-sm text-slate-600">הכול אנונימי: בלי מזהה מבקר, בלי טקסט חופשי. הגלישה שלכם מהדפדפן הזה לא נספרת.</p>

    <Block title="📜 עד כמה גוללים — לפי עמוד" rows={data.scroll} empty="עוד אין נתוני גלילה בתקופה הזו."
      note="נספרים רק עמודים ארוכים (יותר ממסך וחצי) שאדם ראה. 50% / 90% = כמה מהם גללו עד חצי העמוד ועד סופו (כולל המדריך והשאלות הנפוצות בתחתית).">
      <thead><tr className="border-b-2"><th className="p-2">עמוד</th><th className="p-2">צפיות</th><th className="p-2">עד 50%</th><th className="p-2">עד 90%</th></tr></thead>
      <tbody>{(data.scroll || []).map(r => <tr key={r.path} className="border-b">
        <td className="p-2"><Path path={r.path} /></td><td className="p-2 font-bold">{r.views}</td>
        <td className="p-2">{pct(r.r50, r.views)} <span className="text-xs text-slate-500">({r.r50})</span></td>
        <td className="p-2">{pct(r.r90, r.views)} <span className="text-xs text-slate-500">({r.r90})</span></td>
      </tr>)}</tbody>
    </Block>

    <Block title="🧭 צעדים הבאים — מאיפה לאן לוחצים" rows={data.nav} empty="עוד אין לחיצות על קישורים בתוכן העמודים."
      note="קישורים פנימיים בתוך תוכן העמוד (לא התפריט, לא כפתור החזרה).">
      <thead><tr className="border-b-2"><th className="p-2">מעמוד</th><th className="p-2">אל</th><th className="p-2">לחיצות</th></tr></thead>
      <tbody>{(data.nav || []).map((r, i) => <tr key={i} className="border-b"><td className="p-2"><Path path={r.path} /></td><td className="p-2"><Path path={r.target} /></td><td className="p-2 font-bold">{r.n}</td></tr>)}</tbody>
    </Block>

    <Block title="👍👎 האם זה עזר? — לפי עמוד" rows={data.helpful} empty="עוד לא הצביעו בתקופה הזו."
      note="הצבעה אחת בלחיצה, בלי טקסט. עמוד עם הרבה 👎 הוא מועמד לשיפור.">
      <thead><tr className="border-b-2"><th className="p-2">עמוד</th><th className="p-2">👍</th><th className="p-2">👎</th><th className="p-2">% עזר</th></tr></thead>
      <tbody>{(data.helpful || []).map(r => <tr key={r.path} className="border-b"><td className="p-2"><Path path={r.path} /></td><td className="p-2">{r.yes}</td><td className="p-2">{r.no}</td><td className="p-2 font-bold">{pct(r.yes, r.yes + r.no)}</td></tr>)}</tbody>
    </Block>

    <section className="mb-6">
      <h3 className="mb-1 text-base font-black">🔎 חיפוש באתר</h3>
      <p className="mb-2 text-sm">{searches ? <>סה״כ חיפושים: <b>{searches}</b> · בלי תוצאות: <b>{search.r0 || 0}</b> ({pct(search.r0 || 0, searches)}) · 1–5 תוצאות: <b>{search.r1_5 || 0}</b> · 6 ומעלה: <b>{search.r6p || 0}</b></> : 'עוד אין חיפושים בתקופה הזו.'}</p>
    </section>
    <Block title="🕳️ מחפשים ולא מוצאים" rows={data.search_misses} empty="עוד אין חיפושים ללא תוצאות."
      note="רק חיפושים בלי תוצאות, של 1–3 מילים באותיות בלבד, שעברו סינון — בלי שום קשר למבקר. מועמדים לדפים חדשים.">
      <thead><tr className="border-b-2"><th className="p-2">מה חיפשו</th><th className="p-2">פעמים</th></tr></thead>
      <tbody>{(data.search_misses || []).map(r => <tr key={r.term} className="border-b"><td className="p-2 font-bold">{r.term}</td><td className="p-2">{r.n}</td></tr>)}</tbody>
    </Block>

    <Block title="🚧 עמודים שלא נמצאו (404)" rows={data.notfound} empty="אין 404 בתקופה הזו 🎉"
      note="הכתובת שביקשו. כתובת עם תווים מוזרים מופיעה כ־/_invalid.">
      <thead><tr className="border-b-2"><th className="p-2">כתובת</th><th className="p-2">פעמים</th></tr></thead>
      <tbody>{(data.notfound || []).map(r => <tr key={r.path} className="border-b"><td className="p-2" dir="ltr">{r.path}</td><td className="p-2 font-bold">{r.n}</td></tr>)}</tbody>
    </Block>

    <Block title="🐞 שגיאות JavaScript" rows={data.jserror} empty="אין שגיאות בתקופה הזו 🎉"
      note="ספירה לפי עמוד וסוג שגיאה בלבד — בלי טקסט השגיאה. סוג „טעינת קובץ נכשלה” בדרך כלל אומר שגרסה ישנה נשארה פתוחה אחרי עדכון באתר.">
      <thead><tr className="border-b-2"><th className="p-2">עמוד</th><th className="p-2">סוג</th><th className="p-2">פעמים</th></tr></thead>
      <tbody>{(data.jserror || []).map((r, i) => <tr key={i} className="border-b"><td className="p-2"><Path path={r.path} /></td><td className="p-2">{JS_KIND[r.value] || r.value}</td><td className="p-2 font-bold">{r.n}</td></tr>)}</tbody>
    </Block>
  </div>
}
