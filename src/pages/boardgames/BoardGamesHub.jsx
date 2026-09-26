import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { BOARD_GAMES } from '../../boardgames/registry'
import '../../boardgames/boardgames.css'

// /board-games — classic public-domain board games to play, learn and print.
export default function BoardGamesHub() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 bg-page" dir="rtl">
      <SEO title="משחקי לוח קלאסיים אונליין לילדים – לשחק וללמוד בחינם" description="דמקה ועוד משחקי לוח קלאסיים: לשחק נגד המחשב או נגד חבר, ללמוד בשיעורים קצרים צעד אחר צעד ולהדפיס את החוקים בעברית. בחינם, בלי הרשמה." path="/board-games" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקי לוח קלאסיים' }]} />
      <header className="bg-head">
        <h1>♟️ משחקי לוח קלאסיים – לשחק וללמוד</h1>
        <p>משחקים שכולם מכירים, בלי הרשמה ובלי פרסומות בתוך המשחק: משחקים נגד המחשב או נגד חבר על אותו מסך, לומדים את החוקים בשיעורים קצרים, ומדפיסים את החוקים.</p>
      </header>
      <div className="bg-hub">
        {BOARD_GAMES.map(g => (
          <Link key={g.slug} to={`/board-games/${g.slug}`} className="bg-card">
            <span className="bg-card-emoji" aria-hidden="true">{g.emoji}</span>
            <h2>{g.name}</h2>
            <p>{g.tagline}</p>
            <small>👥 {g.players} · 🎂 {g.ages}</small>
          </Link>
        ))}
      </div>
    </div>
  )
}
