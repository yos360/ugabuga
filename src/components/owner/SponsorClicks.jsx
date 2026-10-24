import { useEffect, useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'
import { SPONSORS } from '../../data/sponsors'

// Clicks on sponsored banners (owner_sponsor_clicks), for the report's selected period.
// A click = someone pressed the banner's link (it opens the advertiser's site in a new tab).
// The owner's own browser is never counted.
const sponsorName = id => SPONSORS.find(s => s.id === id)?.name || id

export default function SponsorClicks({ from, to, tick = 0, pageName }) {
  const [rows, setRows] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    let live = true
    ownerSupabase.rpc('owner_sponsor_clicks', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error: e }) => {
      if (!live) return
      if (e) { setError('הנתונים יופיעו לאחר עדכון מסד הנתונים.'); return }
      setRows(Array.isArray(data) ? data : []); setError('')
    })
    return () => { live = false }
  }, [from, to, tick])
  const name = path => pageName ? pageName({ path, category: 'page' }) : path || '/'
  return <div>
    <p className="mb-3 text-sm text-slate-600"><b>לחיצה</b> = מישהו לחץ על הקישור בבאנר (נפתח אתר המפרסם בלשונית חדשה). הלחיצות שלכם מהדפדפן הזה לא נספרות. אותו מספר נשלח גם ל־Google Analytics כאירוע <code dir="ltr">sponsor_click</code>.</p>
    {error ? <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold">{error}</p>
      : !rows ? <p className="text-sm text-slate-500">טוען…</p>
      : <>
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          {SPONSORS.filter(s => s.active || rows.some(r => r.sponsor === s.id)).map(s => {
            const r = rows.find(x => x.sponsor === s.id)
            return <div key={s.id} className="rounded-2xl bg-amber-50 p-4">
              <b className="block text-3xl">{r?.clicks || 0}</b>
              <span className="text-sm text-slate-700">לחיצות על הבאנר של {s.name}{r ? ` · ${r.visitors} מבקרים` : ''}</span>
            </div>
          })}
        </div>
        {rows.length ? rows.map(r => <div key={r.sponsor} className="mb-4">
          <h3 className="mb-2 text-base font-black">{sponsorName(r.sponsor)} — מאיזה עמוד לחצו</h3>
          <table className="w-full text-right text-sm"><tbody>{(r.pages || []).map(p => <tr key={p.path} className="border-b">
            <td className="p-2">{name(p.path)} <span className="text-xs text-slate-500" dir="ltr">{p.path || '/'}</span></td>
            <td className="p-2 font-bold">{p.n}</td>
          </tr>)}</tbody></table>
        </div>) : <p className="rounded-xl bg-slate-50 p-4 text-sm">עוד אין לחיצות על באנרים בתקופה הזו.</p>}
      </>}
  </div>
}
