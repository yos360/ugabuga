import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { ARCADE } from '../../arcade/registry'
import { BOARD_GAMES } from '../../boardgames/registry'
import { dailyFor } from '../../arcade/daily'
import '../../arcade/arcade.css'

// /online-games — quick puzzle games that open full screen on phone and computer.
const TWO_PLAYER_BOARD = ['checkers', 'backgammon', 'chess', 'reversi', 'mancala', 'dots-and-boxes']

export default function OnlineGamesHub() {
  const daily = dailyFor()
  const { hash } = useLocation()
  // footer/board-games links point at #two-players; scroll there after the page's scroll-to-top
  useEffect(() => {
    if (hash !== '#two-players') return undefined
    const t = setTimeout(() => document.getElementById('two-players')?.scrollIntoView({ behavior: 'smooth' }), 80)
    return () => clearTimeout(t)
  }, [hash])
  const twoPlayer = ARCADE.filter(g => g.twoPlayer)
  const boardTwo = TWO_PLAYER_BOARD.map(s => BOARD_GAMES.find(g => g.slug === s)).filter(Boolean)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'משחקי אונליין לילדים – עוגה בוגה',
    itemListElement: ARCADE.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://ugabuga.co.il/online-games/${g.slug}`, name: g.name })),
  }
  return (
    <div className="arc-page" dir="rtl">
      <SEO title="משחקי אונליין לילדים בחינם – בלי הורדה ובלי הרשמה" description="משחקי חשיבה ופאזלים אונליין בחינם: אתגר יומי חדש, משחקים לשניים (ארבע בשורה, איקס עיגול), צוללות, סוליטר, ספיידר סוליטר, שולה מוקשים, סודוקו, משחק זיכרון, נחש, 2048, קוביות מעופפות בתלת־ממד ועוד. ישר מהדפדפן, על כל המסך, עם מוזיקה נעימה — במחשב ובטלפון." path="/online-games" structuredData={schema} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקי אונליין' }]} />
      <header className="arc-hero">
        <h1>🕹️ משחקי אונליין – לוחצים ומשחקים</h1>
        <p>הקלאסיקות שכולם אוהבים — צוללות, ארבע בשורה, איקס עיגול, סוליטר, שולה מוקשים, סודוקו, נחש ועוד — לצד פאזלים מקוריים. בלי הורדה, בלי הרשמה ובלי פרסומות בתוך המשחק. כל משחק נפתח על כל המסך, עם מוזיקת רקע נעימה (אפשר להשתיק ב־🎵).</p>
      </header>
      <Link to="/online-games/today" className="dl-banner" style={{ '--game-color': ARCADE.find(g => g.slug === daily.slug)?.color }}>
        <span className="dl-banner-art" aria-hidden="true">{daily.emoji}</span>
        <span><b>🌟 אתגר היום: {daily.name}</b><small>{daily.goal} · אותו אתגר לכולם, מתחלף כל יום</small></span>
        <span className="arc-play-chip">▶ לאתגר</span>
      </Link>
      <Link to="/online-games/marathon" className="dl-banner" style={{ '--game-color': '#ffd23f' }}>
        <span className="dl-banner-art" aria-hidden="true">🏃</span>
        <span><b>🏃 מרתון משחקים: 8 משחקים ברצף</b><small>כל שלב ממשחק אחר · שעון אחד · מי מסיים הכי מהר?</small></span>
        <span className="arc-play-chip">▶ למרתון</span>
      </Link>
      <div className="arc-grid">
        {ARCADE.map(g => (
          <Link key={g.slug} to={`/online-games/${g.slug}#play`} className="arc-card" style={{ '--game-color': g.color }}>
            <span className="arc-card-art" aria-hidden="true">{g.emoji}</span>
            <h2>{g.name}</h2>
            <p>{g.tagline}</p>
            <span className="arc-play-chip">▶ שחקו · גיל {g.ages}</span>
          </Link>
        ))}
      </div>
      <section className="arc-two" id="two-players" aria-labelledby="two-players-title">
        <h2 id="two-players-title">👥 משחקים לשניים</h2>
        <p>שניים על אותו טלפון או מחשב — כל אחד בתורו — או אחד נגד המחשב. מושלם להמתנה אצל הרופא, לנסיעה או לערב משחקים עם אחים וחברים.</p>
        <div className="arc-grid">
          {twoPlayer.map(g => (
            <Link key={g.slug} to={`/online-games/${g.slug}#play`} className="arc-card" style={{ '--game-color': g.color }}>
              <span className="arc-card-art" aria-hidden="true">{g.emoji}</span>
              <h3>{g.name} לשניים</h3>
              <p>{g.tagline}</p>
              <span className="arc-play-chip">▶ שחקו · גיל {g.ages}</span>
            </Link>
          ))}
        </div>
        <p className="arc-related" style={{ marginTop: 16 }}>
          <span>ועוד משחקי לוח לשניים:</span>
          {boardTwo.map(g => <Link key={g.slug} to={`/board-games/${g.slug}`}>{g.emoji} {g.name}</Link>)}
        </p>
      </section>
      <section className="arc-box" style={{ maxWidth: 860, margin: '30px auto 0' }}>
        <h2>למה משחקי חשיבה טובים לילדים?</h2>
        <p style={{ lineHeight: 1.75, fontSize: 17, margin: 0 }}>
          פאזלים קצרים מאמנים תכנון, חשיבה מרחבית וסבלנות — ומרגישים כמו משחק ולא כמו שיעורי בית. כל השלבים אצלנו פתירים, יש כפתור רמז ואפשר לבטל מהלך, כך שגם ילדים צעירים מצליחים ונהנים.
          רוצים עוד? יש לנו גם <Link to="/board-games" className="underline font-bold">משחקי לוח קלאסיים</Link>, <Link to="/games" className="underline font-bold">מאגר משחקים לקבוצה ולכיתה</Link> ו<Link to="/letters/game" className="underline font-bold">משחק אותיות לגן</Link>.
        </p>
      </section>
    </div>
  )
}
