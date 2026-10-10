import { Link } from 'react-router-dom'

// The chess pages and how they link to each other (hub: /chess).
export const CHESS_PAGES = [
  { to: '/chess', emoji: '♟️', title: 'שחמט אונליין', desc: 'משחק מלא נגד המחשב בשלוש רמות, או שני שחקנים על אותו מסך.' },
  { to: '/chess/puzzles', emoji: '🧩', title: 'חידות שחמט', desc: '36 חידות מט בצעד אחד ובשני צעדים, מקל ועד מאתגר.' },
  { to: '/chess/how-to-play', emoji: '📘', title: 'איך משחקים שחמט', desc: 'איך זז כל אחד מכלי השחמט – עם לוח קטן שאפשר לנסות עליו.' },
  { to: '/chess/printable-board', emoji: '🖨️', title: 'לוח שחמט להדפסה', desc: 'לוח, כלים לגזירה ודף עזר – מדפיסים ומשחקים בלי מסך.' },
  { to: '/board-games/chess?tab=learn', emoji: '🎓', title: 'שיעורי שחמט לילדים', desc: '10 שיעורים קצרים צעד אחר צעד, וחוקי השחמט המלאים להדפסה.' },
]

export function ChessCards({ except }) {
  return (
    <div className="cz-cards">
      {CHESS_PAGES.filter(p => p.to !== except).map(p => (
        <Link key={p.to} to={p.to} className="cz-card">
          <span className="cz-card-emoji" aria-hidden="true">{p.emoji}</span>
          <b>{p.title}</b>
          <span>{p.desc}</span>
        </Link>
      ))}
    </div>
  )
}
