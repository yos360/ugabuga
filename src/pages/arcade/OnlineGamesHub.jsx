import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { ARCADE } from '../../arcade/registry'
import '../../arcade/arcade.css'

// /online-games — quick puzzle games that open full screen on phone and computer.
export default function OnlineGamesHub() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'משחקי אונליין לילדים – עוגה בוגה',
    itemListElement: ARCADE.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://ugabuga.co.il/online-games/${g.slug}`, name: g.name })),
  }
  return (
    <div className="arc-page" dir="rtl">
      <SEO title="משחקי אונליין לילדים בחינם – בלי הורדה ובלי הרשמה" description="משחקי חשיבה ופאזלים אונליין בחינם: סוליטר, ספיידר סוליטר, שולה מוקשים, סודוקו, משחק זיכרון, נחש, 2048, קוביות מעופפות בתלת־ממד ועוד. ישר מהדפדפן, על כל המסך, עם מוזיקה נעימה — במחשב ובטלפון." path="/online-games" structuredData={schema} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקי אונליין' }]} />
      <header className="arc-hero">
        <h1>🕹️ משחקי אונליין – לוחצים ומשחקים</h1>
        <p>הקלאסיקות שכולם אוהבים — סוליטר, שולה מוקשים, סודוקו, נחש ועוד — לצד פאזלים מקוריים. בלי הורדה, בלי הרשמה ובלי פרסומות בתוך המשחק. כל משחק נפתח על כל המסך, עם מוזיקת רקע נעימה (אפשר להשתיק ב־🎵).</p>
      </header>
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
