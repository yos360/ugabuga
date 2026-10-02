import { Link } from 'react-router-dom'
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
  return <section className="play-now" aria-labelledby="play-now-title">
    <h2 id="play-now-title">🧸 לשחק עכשיו על המסך</h2>
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
