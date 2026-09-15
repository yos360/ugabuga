import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const categories = [
  { slug: 'coloring', emoji: '🎨', title: 'דפי צביעה', count: 8, desc: 'דפי צביעה ליום הולדת — עוגה, דינוזאור, חלל ועוד' },
  { slug: 'birthday-signs', emoji: '🎂', title: 'שלטי יום הולדת', count: 8, desc: 'שלטים גדולים להדפסה — פה העוגה, פה המתנות, ברוכים הבאים' },
  { slug: 'hebrew-letters', emoji: '✏️', title: 'אותיות עברית בנקודות', count: 22, desc: 'א-ת בנקודות לחיבור — עם איורים ושורות תרגול' },
  { slug: 'abc-letters', emoji: '🔤', title: 'ABC אנגלית בנקודות', count: 26, desc: 'A-Z בנקודות — אותיות גדולות וקטנות עם איורים' },
  { slug: 'numbers', emoji: '🔢', title: 'מספרים בנקודות', count: 11, desc: '0-10 בנקודות גדולות עם ספירה ואיורים' },
  { slug: 'mazes', emoji: '🌀', title: 'מבוכים', count: 3, desc: '3 רמות — קל, בינוני, קשה. עם סיפור ופתרון' },
  { slug: 'certificates', emoji: '🏆', title: 'תעודות', count: 6, desc: 'גיבור מסיבה, הצטיינות, משתתף, אלוף משחקים ועוד' },
  { slug: 'symmetry', emoji: '🪞', title: 'ציור סימטרי', count: 6, desc: 'השלימו את החצי — פרפר, פנים, בית, עץ, פרח, טיל' },
  { slug: 'name-tags', emoji: '🏷️', title: 'תגי שם', count: 1, desc: '8 תגים בדף — לגזירה ושימוש במסיבה' },
  { slug: 'thank-you', emoji: '💌', title: 'כרטיסי תודה', count: 1, desc: '4 כרטיסים בדף — לקיפול ושליחה' },
  { slug: 'photo-props', emoji: '📸', title: 'אביזרי צילום', count: 1, desc: 'כתר, שפם, משקפיים — לגזירה והדבקה על מקלות' },
  { slug: 'board-game', emoji: '🎲', title: 'סולמות ונחשים', count: 1, desc: 'לוח משחק מלא להדפסה בסגנון UGABUGA' },
  { slug: 'sudoku', emoji: '🧩', title: 'סודוקו', count: 2, desc: 'סודוקו לילדים — 4×4 ו-6×6 עם פתרונות' },
]

export default function PrintablesIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title="דפים להדפסה" description="דפי צביעה, אותיות, מבוכים, תעודות, שלטים ועוד — הכל חינם להדפסה בסגנון UGABUGA מצויר ביד." path="/printables" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-3">🖨️ דפים להדפסה</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">הכל חינם, בלי הרשמה, בסגנון UGABUGA מצויר ביד</p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => (
          <Link key={cat.slug} to={'/printables/' + cat.slug}
            className={`wobbly group relative flex flex-col border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow transition-all duration-150 hover:-translate-y-1 hover:rotate-1 ${i % 2 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{cat.emoji}</span>
              <div>
                <h3 className="font-display text-xl font-bold">{cat.title}</h3>
                <span className="wobbly-sm inline-flex items-center border border-[var(--border)] bg-[var(--postit)] px-2 py-0.5 text-xs font-bold">{cat.count} דפים</span>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] flex-1">{cat.desc}</p>
            <span className="mt-3 font-display text-base font-bold text-[var(--pen)] underline decoration-dashed">צפייה והדפסה ←</span>
          </Link>
        ))}
      </div>

      <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-6 mt-10 text-center">
        <h2 className="font-display text-2xl font-bold mb-3">✏️ רוצים ליצור בעצמכם?</h2>
        <p className="font-hand text-lg mb-4">כמה מהדפים אפשר למלא עם התוכן שלכם — שמות, מילים, פריטים אישיים</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="/tools/bingo-maker" className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">🎯 בינגו מותאם אישית</a>
          <a href="/tools/word-search-maker" className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">🔍 תפזורת מותאמת אישית</a>
          <a href="/tools/scavenger-hunt-maker" className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">🔎 ציד אוצרות מותאם אישית</a>
        </div>
      </div>
    </div>
  )
}
