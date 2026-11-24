import { useEffect, useState } from 'react'
import { pollForDate, percentages } from '../../data/dailyPolls'
import { isLocalHost } from '../../utils/liveActivity'

// "מה אתם אומרים?" — the home page's daily poll (owner's request, 24.11.2026: something that gets
// visitors to take part). One tap, then everyone's answers as bars. The vote is stored with a random id
// made for this poll only (kept in this browser so the same browser votes once) — nothing personal.
// A local build never writes to the live database: it shows the tap locally only.
const DB = import.meta.env?.VITE_PARTY_DB_URL || 'https://efhgyispuwxcplvzipcy.supabase.co'
const KEY = import.meta.env?.VITE_PARTY_DB_KEY || 'sb_publishable_xX1CVQ0baMf_k3EDXAUs0A_-O0Kaql7'
const STORE = 'buga-polls'
const readStore = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {} } catch { return {} } }
const call = (fn, body) => fetch(`${DB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.ok ? r.json() : null).catch(() => null)
const toCounts = (data, n) => Array.from({ length: n }, (_, i) => Number(data?.[i] || 0))

export default function DailyPoll() {
  const [poll] = useState(() => pollForDate())
  const [mine, setMine] = useState(() => readStore()[poll.id]?.choice ?? null)
  const [counts, setCounts] = useState(null)
  const local = typeof location !== 'undefined' && isLocalHost(location.hostname)

  useEffect(() => {
    if (mine === null || local) return
    let live = true
    call('poll_results', { p_poll: poll.id }).then(d => { if (live && d) setCounts(toCounts(d, poll.options.length)) })
    return () => { live = false }
  }, [mine, poll, local])

  const vote = i => {
    if (mine !== null) return
    const id = crypto.randomUUID()
    try { const all = readStore(); all[poll.id] = { choice: i }; localStorage.setItem(STORE, JSON.stringify(Object.fromEntries(Object.entries(all).slice(-60)))) } catch { /* private mode */ }
    setMine(i)
    if (local) { setCounts(poll.options.map((_, k) => (k === i ? 1 : 0))); return }
    call('poll_vote', { p_poll: poll.id, p_choice: i, p_visitor: id }).then(d => { if (d) setCounts(toCounts(d, poll.options.length)) })
    try { window.gtag?.('event', 'poll_vote', { poll_id: poll.id, choice: i }) } catch { /* ignore */ }
  }

  const total = counts ? counts.reduce((a, b) => a + b, 0) : 0
  const pct = counts ? percentages(counts, poll.options.length) : []
  const share = `https://wa.me/?text=${encodeURIComponent(`${poll.q} 🤔\nעניתי בעוגה בוגה — מה אתם אומרים?\nhttps://ugabuga.co.il/?utm_source=whatsapp&utm_medium=share&utm_campaign=daily-poll`)}`

  return <section className="hp-sec" aria-labelledby="hp-poll-h">
    <div className="hp-row-head"><h2 id="hp-poll-h" className="hp-h2">🗳️ מה אתם אומרים?</h2></div>
    <div className="rounded-2xl border-2 border-slate-800 bg-white p-4 text-slate-900">
      <p className="text-center text-xl font-bold">{poll.q}</p>
      <div className="mx-auto mt-3 grid max-w-md gap-2" role="group" aria-label={poll.q}>
        {poll.options.map((o, i) => mine === null
          ? <button key={i} type="button" onClick={() => vote(i)} className="min-h-[52px] rounded-xl border-2 border-slate-300 bg-slate-50 px-4 text-right text-lg font-bold hover:border-violet-500 hover:bg-violet-50">{o}</button>
          : <div key={i} className={`relative overflow-hidden rounded-xl border-2 px-4 py-3 text-lg ${i === mine ? 'border-violet-600 font-bold' : 'border-slate-200'}`}>
              <span className="absolute inset-y-0 right-0 bg-violet-100 transition-all duration-700" style={{ width: `${counts ? pct[i] : 0}%` }} aria-hidden="true" />
              <span className="relative flex justify-between gap-2"><span>{o}{i === mine ? ' ✓' : ''}</span><b>{counts ? `${pct[i]}%` : '…'}</b></span>
            </div>)}
      </div>
      <div aria-live="polite" className="mt-3 text-center">
        {mine === null
          ? <p className="text-sm text-slate-600">לוחצים על תשובה ורואים מה ענו כולם. בלי הרשמה ובלי פרטים.</p>
          : <>
            <p className="text-sm text-slate-600">{counts ? (total > 1 ? `ענו עד עכשיו ${total} אנשים` : 'אתם הראשונים לענות היום!') : 'סופרים…'} · שאלה חדשה מחר</p>
            <a href={share} target="_blank" rel="noopener" className="mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#25d366] px-5 font-bold text-white">💬 לשאול גם את החברים</a>
          </>}
      </div>
    </div>
  </section>
}
