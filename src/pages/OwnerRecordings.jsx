import { useEffect, useMemo, useRef, useState } from 'react'
import SEO from '../components/ui/SEO'
import { ownerSupabase } from '../utils/ownerAuth'
import { unpackSession } from '../utils/recordingCodec'
import { SAMPLE_RATE } from '../utils/sessionRecorder'

// Owner-only replays of anonymous visits (see src/utils/sessionRecorder.js). rrweb-player loads on first play.
const RANGES = [[1, 'היום'], [7, '7 ימים'], [30, '30 ימים']]
const decode = path => { try { return decodeURIComponent(path) } catch { return path } }
const minutes = s => {
  const secs = Math.max(10, Math.round((new Date(s.last) - new Date(s.started)) / 1000) + 10)
  return secs < 60 ? `${secs} שנ׳` : `${Math.round(secs / 60)} דק׳`
}
const when = iso => new Date(iso).toLocaleString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function OwnerRecordings() {
  const [days, setDays] = useState(7), [rows, setRows] = useState(null), [error, setError] = useState('')
  const [filter, setFilter] = useState(''), [active, setActive] = useState(null), [status, setStatus] = useState('')
  const stage = useRef(null), player = useRef(null)

  useEffect(() => {
    let live = true
    const to = new Date(Date.now() + 60000), from = new Date(Date.now() - days * 86400000)
    ownerSupabase.rpc('session_recordings_owner', { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error: e }) => {
      if (!live) return
      if (e) { setError('ההקלטות יופיעו לאחר עדכון מסד הנתונים.'); return }
      setRows(Array.isArray(data) ? data : []); setError('')
    })
    return () => { live = false }
  }, [days])

  useEffect(() => () => player.current?.$destroy(), [])

  const shown = useMemo(() => {
    const q = filter.trim()
    return (rows || []).filter(r => !q || (r.paths || []).some(p => decode(p).includes(q)))
  }, [rows, filter])

  async function play(row) {
    setActive(row.id); setStatus('טוען את ההקלטה…')
    player.current?.$destroy(); player.current = null
    try {
      const [{ data, error: e }, { default: Player }] = await Promise.all([
        ownerSupabase.rpc('session_recording_chunks_owner', { p_session: row.id }),
        import('rrweb-player'), import('rrweb-player/dist/style.css'),
      ])
      if (e) throw e
      const events = await unpackSession(data || [])
      if (events.length < 2) { setStatus('ההקלטה הזו קצרה מדי לצפייה.'); return }
      const width = Math.min(stage.current.clientWidth, 1000)
      player.current = new Player({ target: stage.current, props: {
        events, width, height: Math.round(width * 0.6), autoPlay: true, skipInactive: true, speedOption: [1, 2, 4, 8], mouseTail: false,
      } })
      setStatus('')
      stage.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {
      setStatus('לא הצלחנו לטעון את ההקלטה. נסו שוב.')
    }
  }

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="הקלטות ביקורים" description="צפייה בהקלטות אנונימיות של ביקורים באתר." noindex path="/admin/recordings" />
    <h1 className="text-3xl font-black">🎥 הקלטות ביקורים</h1>
    <p className="mt-2 text-slate-600">
      רואים בדיוק מה המבקר ראה ועשה: לחיצות, גלילה ותזוזת העכבר. מוקלט בערך ביקור 1 מכל {Math.round(1 / SAMPLE_RATE)}, עד 150 ביקורים ביום, ונמחק אחרי 30 יום.
      כל מה שהוקלד מוסתר בכוכביות, ודפים עם שמות של אחרים (בוגה לייב, מבחנים, כלים משותפים) לא מוקלטים. משחקים שמצוירים על קנבס יופיעו ריקים.
    </p>
    <p className="mt-1 text-sm text-slate-500">לבדוק במכשיר שלך: פותחים כל דף באתר עם <code dir="ltr">?rec=1</code> בסוף הכתובת.</p>

    <div className="mt-5 flex flex-wrap items-center gap-2">
      {RANGES.map(([d, label]) => <button key={d} onClick={() => { if (d !== days) { setRows(null); setDays(d) } }} aria-pressed={days === d}
        className={`min-h-11 rounded-xl border-2 px-4 font-bold ${days === d ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white'}`}>{label}</button>)}
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="סינון לפי דף, למשל solitaire או eretz-ir" dir="ltr"
        aria-label="סינון לפי דף" className="min-h-11 flex-1 rounded-xl border-2 border-slate-200 px-3" />
    </div>

    <div ref={stage} className="mt-5 empty:hidden" dir="ltr" />
    {status && <p role="status" className="mt-3 rounded-xl bg-slate-50 p-3 font-bold">{status}</p>}

    {error ? <p className="mt-5 rounded-xl bg-amber-50 p-3 font-bold">{error}</p>
      : !rows ? <p className="mt-5 text-slate-500">טוען…</p>
      : !shown.length ? <p className="mt-5 rounded-xl bg-slate-50 p-4">עוד אין הקלטות בתקופה הזו.</p>
      : <ul className="mt-5 grid gap-2">
        {shown.map(r => <li key={r.id}>
          <button onClick={() => play(r)} className={`flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border-2 p-3 text-right ${active === r.id ? 'border-violet-600 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300'}`}>
            <span className="text-2xl" aria-hidden="true">{r.width && r.width < 700 ? '📱' : '💻'}</span>
            <span className="font-bold">{when(r.started)}</span>
            <span className="text-slate-600">{minutes(r)}</span>
            <span className="min-w-0 flex-1 truncate text-sm text-slate-700" dir="ltr">{(r.paths || []).map(decode).join('  →  ')}</span>
            <span className="font-bold text-violet-700">▶ צפייה</span>
          </button>
        </li>)}
      </ul>}
  </div>
}
