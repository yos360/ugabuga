import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { BOARD_GAMES } from '../../boardgames/registry'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'

const FAQ = [
  { q: 'אפשר לשחק נגד חבר?', a: 'כן. ברוב המשחקים בוחרים "שני שחקנים" ומשחקים לסירוגין על אותו מסך — בטלפון, בטאבלט או במחשב. אפשר גם לשחק נגד המחשב ברמות קושי שונות.' },
  { q: 'איך לומדים את החוקים?', a: 'לכל משחק יש שיעורים קצרים שמלמדים צעד אחר צעד, עם לוח שמראה בדיוק מה עושים, וגם דף חוקים בעברית להדפסה.' },
  { q: 'צריך להירשם או לשלם?', a: 'לא. כל המשחקים חינמיים ועובדים ישר בדפדפן, בלי הרשמה ובלי הורדה.' },
]
import '../../boardgames/boardgames.css'

// /board-games — classic public-domain board games to play, learn and print.
export default function BoardGamesHub() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 bg-page" dir="rtl">
      <SEO structuredData={faqSchema(FAQ)} title="משחקי לוח קלאסיים אונליין לילדים – לשחק וללמוד בחינם" description="דמקה ועוד משחקי לוח קלאסיים: לשחק נגד המחשב או נגד חבר, ללמוד בשיעורים קצרים צעד אחר צעד ולהדפיס את החוקים בעברית. בחינם, בלי הרשמה." path="/board-games" />
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
      <p className="mt-8 text-center text-lg">
        👥 משחקים לשניים על כל המסך של הטלפון: <Link to="/online-games/four-in-a-row" className="underline font-bold">ארבע בשורה לשניים</Link> · <Link to="/online-games/tic-tac-toe" className="underline font-bold">איקס עיגול לשניים</Link> · <Link to="/online-games#two-players" className="underline font-bold">כל המשחקים לשניים</Link>
      </p>
      <p className="mt-4 text-center text-lg">
        משחקים על לוח אמיתי ואין קובייה? 🎲 <Link to="/tools/dice" className="underline font-bold">קובייה וירטואלית</Link> · <Link to="/tools/dice/backgammon" className="underline font-bold">קוביות לשש בש</Link> · <Link to="/dice-games" className="underline font-bold">משחקי קוביות</Link>
      </p>
      <div className="mt-12"><SeoBody paragraphs={['משחקי לוח קלאסיים מלמדים לחשוב קדימה, לתכנן ולהפסיד בכבוד — והם עוברים מדור לדור. כאן אפשר לשחק דמקה, שש בש, שחמט, ארבע בשורה, איקס עיגול, ריברסי, מנקלה, קווים ומשבצות, נים וסולמות ונחשים, ישר בדפדפן.', 'כל משחק אפשר לשחק נגד המחשב, ברמה שמתאימה לילדים שרק מתחילים ועד שחקנים מנוסים, או נגד חבר על אותו מסך. מי שעוד לא מכיר את החוקים מתחיל בשיעורים הקצרים, שמראים כל מהלך על הלוח.', 'רוצים לשחק על לוח אמיתי? בכל משחק יש דף חוקים בעברית להדפסה, ואם אין קובייה בבית — יש לנו קובייה וירטואלית לשש בש ולסולמות ונחשים.']} faq={FAQ} related={[{ label: 'משחקים אונליין לילדים', href: '/online-games' }, { label: 'קובייה וירטואלית', href: '/tools/dice' }, { label: 'חידות שחמט', href: '/chess' }]} /></div>
    </div>
  )
}
