import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintableCard from '../../components/ui/PrintableCard'

export const categories = [
  { slug: 'roots-project', emoji: '🌳', title: 'עבודת שורשים', count: 'חדש', desc: 'עץ משפחה, שאלות ראיון ודפי כתיבה להדפסה', special: true },
  { slug: 'birthday-newspaper', emoji: '📰', title: 'עיתון יום הולדת', count: 'חדש', desc: 'עיתון אישי עם כותרות, עובדות, ברכות וחידון', special: true },
  { slug: 'birthday-checklist', emoji: '✅', title: 'צ׳ק־ליסט יום הולדת', count: 'חדש', desc: 'רשימות מוכנות לבית, פארק או כיתה — עם משימות אישיות', special: true },
  { slug: 'coloring', emoji: '🎨', title: 'דפי צביעה', count: 'מבחר', desc: 'דפי צביעה לפי נושא, עם פתיחה בתצוגה מקדימה והדפסה' },
  { slug: 'birthday-signs', emoji: '🎂', title: 'שלטי יום הולדת', count: 8, desc: 'שלטים גדולים להדפסה — פה העוגה, פה המתנות, ברוכים הבאים' },
  { slug: 'hebrew-letters', emoji: '✏️', title: 'אותיות עברית למעבר בעיפרון', count: 22, desc: 'א–ת בקווים מקווקווים, עם שורות תרגול וצביעה' },
  { slug: 'abc-letters', emoji: '🔤', title: 'אותיות באנגלית למעבר בעיפרון', count: 26, desc: 'A–Z, אות גדולה וקטנה על שורות כתיבה באנגלית' },
  { slug: 'numbers', emoji: '🔢', title: 'מספרים ותרגילים למעבר בעיפרון', count: 11, desc: '0–10 בקווים מקווקווים, ספירה וצביעה — ותרגילי חשבון' },
  { slug: 'mazes', emoji: '🌀', title: 'מבוכים', count: 3, desc: '3 רמות — קל, בינוני, קשה. עם סיפור ופתרון' },
  { slug: 'certificates', emoji: '🏆', title: 'תעודות', count: 6, desc: 'גיבור מסיבה, הצטיינות, משתתף, אלוף משחקים ועוד' },
  { slug: 'symmetry', emoji: '🪞', title: 'ציור סימטרי', count: 6, desc: 'השלימו את החצי — פרפר, פנים, בית, עץ, פרח, טיל' },
  { slug: 'name-tags', emoji: '🏷️', title: 'תגי שם', count: 1, desc: '8 תגים בדף — לגזירה ושימוש במסיבה' },
  { slug: 'thank-you', emoji: '💌', title: 'כרטיסי תודה', count: 1, desc: '4 כרטיסים בדף — לקיפול ושליחה' },
  { slug: 'photo-props', emoji: '📸', title: 'אביזרי צילום', count: 60, desc: '5 חבילות גדולות: יום הולדת, מצחיקים, חד-קרן, חלל וכיתה' },
  { slug: 'board-game', emoji: '🎲', title: 'סולמות ונחשים', count: 1, desc: 'לוח משחק מלא להדפסה בסגנון UGABUGA' },
  { slug: 'sudoku', emoji: '🧩', title: 'סודוקו', count: 2, desc: 'סודוקו לילדים — 4×4 ו-6×6 עם פתרונות' },
  { slug: 'dot-to-dot', emoji: '🔢', title: 'חברו את הנקודות', count: 'חדש', desc: 'מגלים ציור לפי מספרים, בשלוש רמות גיל', generated: true },
  { slug: 'mandalas', emoji: '🌈', title: 'מנדלות ויצירה', count: 70, desc: '7 סגנונות, 10 דפים בכל סגנון — כולל מנדלות לילדים ולגדולים', generated: true },
  { slug: 'find-differences', emoji: '🔎', title: 'מצאו את ההבדלים', count: 'חדש', desc: 'דפי חיפוש והבדלים לפי נושא וגיל', generated: true },
  { slug: 'color-by-number', emoji: '🎨', title: 'צבעו לפי מספר', count: 'חדש', desc: 'מספרים, צבעים וציור — בדף אחד', generated: true },
  { slug: 'word-tracing', emoji: '✏️', title: 'מילים מקווקוות', count: 'חדש', desc: 'תרגול כתיבה בעברית לפי נושא', generated: true },
  { slug: 'match-word', emoji: '🖼️', title: 'התאמת תמונה למילה', count: 'חדש', desc: 'מחברים מילים לאיורים', generated: true },
  { slug: 'complete-pattern', emoji: '🧩', title: 'המשך את הרצף', count: 'חדש', desc: 'דפוסים ורצפים לגיל הרך ולבית ספר', generated: true },
  { slug: 'count-and-write', emoji: '🔢', title: 'ספרו וכתבו', count: 'חדש', desc: 'סופרים פריטים וכותבים מספרים', generated: true },
  { slug: 'silhouette-match', emoji: '👤', title: 'התאמת צלליות', count: 'חדש', desc: 'מזהים ציור לפי הצללית שלו', generated: true },
  { slug: 'cut-and-order', emoji: '✂️', title: 'גזרו וסדרו', count: 'חדש', desc: 'כרטיסי רצף לגזירה ולסידור', generated: true },
  { slug: 'hidden-object', emoji: '🕵️', title: 'מצאו חפץ מסתתר', count: 'חדש', desc: 'חיפוש חפצים בתוך תמונה עמוסה', generated: true },
  { slug: 'mixed-activities', emoji: '🌟', title: 'דף פעילות משולב', count: 'חדש', desc: 'כמה משימות קצרות בדף אחד', generated: true },
  { slug: 'missing-picture', emoji: '🖍️', title: 'מה חסר בתמונה?', count: 'חדש', desc: 'משלימים ציור לפי רצף ורמזים', generated: true },
]

export default function PrintablesIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title="דפים להדפסה" description="דפי צביעה, אותיות, מבוכים, תעודות, שלטים ועוד — הכל חינם להדפסה בסגנון UGABUGA מצויר ביד." path="/printables" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-3">🖨️ דפי פעילות להדפסה בחינם</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">בוחרים פעילות, גיל ונושא — ומדפיסים מיד. הכל חינם וללא הרשמה.</p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => <PrintableCard key={cat.slug} cat={cat} index={i} />)}
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
      <div className="mt-8 rounded-3xl border-2 border-[var(--border)] bg-emerald-50 p-6 text-center sketch-shadow">
        <h2 className="font-display text-2xl font-bold">🧺 מי מביא מה? — רשימה שיתופית למסיבה</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">פותחים רשימה, משתפים בוואטסאפ וכל אחד בוחר מה להביא.</p>
        <a href="/tools/bring-list" className="mt-4 inline-block rounded-xl border-2 border-slate-800 bg-white px-6 py-3 font-bold">פתחו רשימה חדשה ←</a>
      </div>
    </div>
  )
}
