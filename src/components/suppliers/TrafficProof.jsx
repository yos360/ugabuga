import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { suppliersDb } from '../../utils/suppliersDb'

// Real traffic numbers for suppliers deciding whether to join: who is on the site now (the live
// presence count RecentActivity already keeps), visitors today and visits in the last 30 days.
// Hidden from the public until the numbers are worth showing; the owner always sees it.
export const SHOW_FROM_VISITS_30D = 1000
const fmt = n => Number(n || 0).toLocaleString('he-IL')
const isOwner = () => { try { return !!localStorage.getItem('ugabuga-owner-auth') } catch { return false } }

export default function TrafficProof({ forSuppliers = true }) {
  const [t, setT] = useState(null)
  const [live, setLive] = useState(null)
  const [owner, setOwner] = useState(false)
  useEffect(() => {
    if (window.__PRERENDER__) return
    setOwner(isOwner())
    suppliersDb.traffic().then(setT).catch(() => {})
    const onLive = e => setLive(e.detail?.count ?? null)
    setLive(window.__bugaLiveCount ?? null)
    window.addEventListener('buga:live-count', onLive)
    return () => window.removeEventListener('buga:live-count', onLive)
  }, [])
  if (!t) return null
  const hiddenFromPublic = (t.visits_30d || 0) < SHOW_FROM_VISITS_30D
  if (hiddenFromPublic && !owner) return null
  const stats = [
    live >= 2 && ['🟢', fmt(live), 'מבקרים באתר ממש עכשיו'],
    ['👨‍👩‍👧', fmt(t.today_visitors), 'מבקרים היום'],
    ['📈', fmt(t.visits_30d), 'כניסות ב-30 הימים האחרונים'],
    ['📄', fmt(t.pageviews_30d), 'דפים שנצפו ב-30 הימים האחרונים'],
    t.supplier_views_30d > 0 && ['🎪', fmt(t.supplier_views_30d), 'צפיות בדפי הספקים ב-30 הימים האחרונים'],
  ].filter(Boolean)
  return <section className="mb-6 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-4 text-center" aria-label="תנועה באתר">
    <h2 className="mb-3 text-xl font-bold">📊 תנועה אמיתית בעוגה בוגה</h2>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(([e, n, label]) => <div key={label} className="rounded-2xl bg-white p-3"><div className="text-3xl font-black" dir="ltr">{e} {n}</div><div className="text-sm font-bold text-[var(--muted-foreground)]">{label}</div></div>)}
    </div>
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">נספר אוטומטית מהביקורים באתר כולו, בלי פרטים מזהים. מתעדכן כל 10 דקות.{forSuppliers && <> ספקים? <Link to="/suppliers/me" className="font-bold underline">הצטרפו ללוח</Link></>}</p>
    {hiddenFromPublic && <p className="mt-2 rounded-xl bg-white p-2 text-sm font-bold text-amber-700">🔒 רואים את זה רק אתם (בעלי האתר). התיבה תופיע לכולם כשיהיו לפחות {fmt(SHOW_FROM_VISITS_30D)} כניסות בחודש.</p>}
  </section>
}
