import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DAILY_RIDDLES, dailyRiddlePath } from '../../data/dailyRiddles'
import { Board } from '../../pages/content/DailyRiddles'

// The newest daily riddle on the home page (owner's request, 2026-11-10): its short video, or the riddle
// itself when it has no video yet, never the answer — the answer shows only when the visitor asks for it.
// The YouTube player loads only on tap (privacy-enhanced domain, no cookies before that).
export default function DailyRiddleBox() {
  const r = DAILY_RIDDLES[0]
  const [play, setPlay] = useState(false)
  const [open, setOpen] = useState(false)
  if (!r) return null
  return (
    <section className="hp-sec" aria-labelledby="hp-riddle-h">
      <div className="hp-row-head"><h2 id="hp-riddle-h" className="hp-h2">🧠 החידה היומית #{r.n}</h2><Link to="/riddles/daily">לכל החידות ←</Link></div>
      <div className="rounded-2xl border-2 border-slate-800 bg-white p-4 text-slate-900">
        <h3 className="text-center text-xl font-bold">{r.title}</h3>
        {r.youtube
          ? <div className="relative mx-auto mt-3 aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-xl bg-black">
              {play
                ? <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${r.youtube}?autoplay=1&playsinline=1&rel=0`} title={`החידה היומית #${r.n}: ${r.title}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                : <button type="button" onClick={() => setPlay(true)} className="absolute inset-0 h-full w-full" aria-label={`ניגון הסרטון של החידה היומית #${r.n}`}>
                    <img src={`https://i.ytimg.com/vi/${r.youtube}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-3xl text-white shadow-lg" aria-hidden="true">▶</span>
                  </button>}
            </div>
          : <div className="mt-3"><Board r={r} /></div>}
        <p className="mt-3 text-center text-lg font-bold">⏱️ יש לכם 10 שניות! {r.ask}</p>
        <div className="mt-3 text-center">
          {open
            ? <div className="rounded-xl border-2 border-green-700 bg-green-50 p-4 text-right"><p className="text-2xl font-bold text-green-800">✅ {r.answer}</p><p className="mt-2 text-lg leading-relaxed">{r.why}</p></div>
            : <button type="button" onClick={() => setOpen(true)} className="min-h-[48px] rounded-full border-2 border-slate-800 bg-[var(--postit,#fff3a8)] px-6 text-lg font-bold">👀 חשיפת התשובה</button>}
        </div>
        <p className="mt-3 text-center"><Link to={dailyRiddlePath(r)} className="font-bold underline">לדף החידה</Link> · 🗓️ חידה חדשה כל יום ב־14:00</p>
      </div>
    </section>
  )
}
