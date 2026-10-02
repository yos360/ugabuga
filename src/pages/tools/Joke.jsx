import { useState } from 'react'
import { JOKE_PAGES } from '../../data/content/jokes'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

// The full collection from the jokes pages (~120 clean jokes) instead of a short list of translated puns
// that don't work in Hebrew.
const JOKES = JOKE_PAGES.flatMap(page => page.jokes.map(x => ({ q: x.setup, a: x.punchline })))

export default function Joke() {
  const [current, setCurrent] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const next = () => {
    setCurrent(prev => { let n; do { n = JOKES[Math.floor(Math.random()*JOKES.length)] } while (n === prev && JOKES.length > 1); return n })
    setRevealed(false)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="בדיחות לילדים — בדיחה מצחיקה בכל לחיצה" description="בדיחות לילדים בעברית: שאלה מצחיקה, רגע לנחש — ואז חושפים את התשובה. בדיחה חדשה בכל לחיצה, קצרה ונקייה. לפתיחת שיעור, לנסיעה ולארוחה משפחתית. חינם." path="/tools/joke" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'בדיחה' }]} />
      <h1 className="text-4xl text-center mb-6">😂 בדיחה של בוגה</h1>

      {current ? (
        <div className="wobbly border-[3px] border-[var(--border)] bg-[var(--postit)] p-8 text-center sketch-shadow-rich mb-6">
          <p className="text-xl font-bold mb-4">{current.q}</p>
          {revealed ? (
            <p className="text-2xl font-bold text-[var(--accent)] buga-slide-down">{current.a}</p>
          ) : (
            <button onClick={() => setRevealed(true)} className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-white px-4 py-2 font-bold cursor-pointer">גלו את התשובה 🤣</button>
          )}
        </div>
      ) : (
        <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">לחצו כדי לקבל בדיחה</p>
      )}

      <button onClick={next} className="wobbly-md sketch-press w-full min-h-[56px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold cursor-pointer">
        😂 {current ? 'עוד בדיחה!' : 'תנו לי בדיחה'}
      </button>

      <div className="rounded-3xl border-2 border-dashed border-[var(--border)] bg-white p-5 text-center mt-8">
        <p className="font-display text-xl font-bold mb-2">רוצים עוד בדיחות?</p>
        <Link to="/jokes/topics" className="inline-block rounded-xl border-2 border-slate-800 bg-[var(--postit)] px-5 py-2 font-bold">😂 בדיחות לילדים לפי נושא ←</Link>
      </div>
    </div>
  )
}
