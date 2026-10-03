import { Link } from 'react-router-dom'
import { dailyFor } from '../../arcade/daily'
import './PlayNow.css'

// Home: an entry for kids who want to play on the screen now, and for a parent at home with them.
// Emoji only — no images, so it costs nothing on the home page's first paint.
const PLAY = [
  ['✏️', 'משחק אותיות', '/letters/game', '#fff1d6'],
  ['⭕', 'איקס עיגול ומשחקי לוח', '/board-games', '#e3f4ff'],
  ['🕎', 'סביבון', '/holidays/hanukkah/sevivon', '#eaf8ec'],
  ['🧩', 'חידות', '/tools/riddles', '#f3eaff'],
  ['🎯', 'טריוויה', '/tools/trivia-quiz', '#ffe9ec'],
  ['🌍', 'אנגלית', '/english', '#e6f7f4'],
]
const HOME = [
  ['🖨️', 'דפי עבודה', '/printables'],
  ['🎉', 'חגים', '/holidays'],
  ['🚗', 'שאלות לנסיעה', '/questions/road-trip'],
  ['🖍️', 'דפי צביעה', '/printables/coloring'],
]

export default function PlayNow() {
  const daily = dailyFor() // the app renders fresh in the browser (no hydration), so this is always today
  return <section className="play-now" aria-labelledby="play-now-title">
    <h2 id="play-now-title">🧸 לשחק עכשיו על המסך</h2>
    <Link to="/online-games/today" className="play-now-daily">
      <span className="play-now-daily-star" aria-hidden="true">🌟</span>
      <span><b>אתגר היום{daily ? `: ${daily.emoji} ${daily.name}` : ''}</b><small>אותו אתגר לכולם, מתחלף כל יום — שחקו ושתפו</small></span>
      <span className="play-now-daily-go" aria-hidden="true">▶</span>
    </Link>
    <div className="play-now-grid">
      {PLAY.map(([emoji, label, to, bg]) => <Link key={to} to={to} className="play-now-card" style={{ '--pn-bg': bg }}>
        <span className="play-now-emoji" aria-hidden="true">{emoji}</span><span className="play-now-label">{label}</span>
      </Link>)}
    </div>
    <div className="play-now-home">
      <h3>🏠 בבית עם הילדים</h3>
      <nav aria-label="בבית עם הילדים">{HOME.map(([emoji, label, to]) => <Link key={to} to={to}><span aria-hidden="true">{emoji}</span> {label}</Link>)}</nav>
    </div>
  </section>
}
