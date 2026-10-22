import { useState } from 'react'
import { ownerSupabase } from '../../utils/ownerAuth'

// Owner-only: paste a reported link (wall, RSVP, list, draw, quiz, live game, homework, shared page)
// and remove everything behind it (owner_takedown in supabase/migrations/202610220002_owner_takedown.sql).
export default function OwnerTakedown() {
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const remove = async e => {
    e.preventDefault()
    if (!link.trim() || !window.confirm('למחוק לצמיתות את כל התוכן שמאחורי הקישור הזה?')) return
    setBusy(true); setMsg('')
    const { data, error } = await ownerSupabase.rpc('owner_takedown', { p_link: link.trim() })
    setBusy(false)
    if (error) setMsg(/bad_link/.test(error.message) ? 'זה לא נראה כמו קישור לתוכן של גולשים (/w/, /r/, /l/, /g/, /q/, /play/, /hw/, /t/).' : /not_owner/.test(error.message) ? 'רק בעל האתר יכול להסיר תוכן.' : 'ההסרה לא הצליחה. נסו שוב.')
    else { setMsg(data === 'removed' ? '✓ התוכן הוסר.' : 'לא נמצא תוכן בקישור הזה (אולי כבר נמחק או פג תוקפו).'); if (data === 'removed') setLink('') }
  }
  return <form onSubmit={remove} className="space-y-2">
    <p className="text-sm text-slate-600">דיווחים על תוכן מגיעים בצ׳אט עם הקישור. מדביקים כאן את הקישור — והקיר, ההזמנה, הרשימה, המבחן או המשחק נמחקים.</p>
    <div className="flex flex-wrap gap-2"><input value={link} onChange={e => setLink(e.target.value)} dir="ltr" placeholder="https://ugabuga.co.il/w/…" aria-label="קישור לתוכן" className="min-w-0 flex-1 rounded-xl border-2 border-slate-300 px-3 py-2" />
      <button type="submit" disabled={busy || !link.trim()} className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white disabled:opacity-50">{busy ? 'מוחקים…' : '🗑️ הסרה'}</button></div>
    {msg && <p role="status" className="font-bold">{msg}</p>}
  </form>
}
