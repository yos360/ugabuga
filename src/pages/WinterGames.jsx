import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import SeoBody from '../components/ui/SeoBody'

// /winter — "בוגה שוקו חם", the site's winter area: everything for the season gathered from the whole
// site — games together on the phone or TV (Buga Live, Eretz Ir), games to print, card and board games,
// living-room games, rainy-day crafts, a warm kitchen, the winter holidays, reading and winter
// birthdays. Every link is a page that already exists (checked in tests).
export const WINTER_SECTIONS = [
  { id: 'together', icon: '📺', title: 'משחקים יחד על המסך', lead: 'כל המשפחה משחקת מהטלפונים, והמסך הגדול מראה את התוצאות.', items: [
    ['/live', '🔴 בוגה לייב', 'חידון חי: אחד מארח, כולם עונים מהטלפון. מעולה לערב משפחתי.'],
    ['/tools/eretz-ir', '🌍 ארץ עיר', 'הקלאסיקה, אונליין: מגרילים אות, ממלאים, והאתר סופר נקודות.'],
    ['/tools/trivia-quiz', '❓ חידון טריוויה', 'שאלות בכל הנושאים, לפי גיל ורמה.'],
    ['/tools/escape-rooms', '🔐 חדרי בריחה', 'חידות בשרשרת לפתור יחד, מגיל 4 ועד מבוגרים.'],
    ['/tools/truth-or-buga', '😄 אמת או בוגה', 'שאלות ומשימות מצחיקות, בלי מבוכה.'],
    ['/tools/riddles', '🧩 חידות', 'חידות עם תשובה מוסתרת, לשבת סביב השולחן.'],
  ] },
  { id: 'print', icon: '🖨️', title: 'משחקים להדפסה', lead: 'מדפיסים, גוזרים — ויש משחק חדש על השולחן.', items: [
    ['/printables/board-game', '🎲 משחק לוח להדפסה', 'לוח מוכן, רק להוסיף קובייה וחיילים.'],
    ['/printables/memory-game', '🃏 משחק זיכרון', 'קלפי זיכרון לגזירה.'],
    ['/printables/dominoes', '🁫 דומינו', 'דומינו להדפסה ולגזירה.'],
    ['/printables/dice-template', '🎲 קובייה לקיפול', 'אין קובייה בבית? מקפלים אחת.'],
    ['/printables/fortune-teller', '🔮 מגדת עתידות מנייר', 'מקפלים, כותבים ומשחקים.'],
    ['/printables/mazes', '🌀 מבוכים', 'חמש רמות קושי, מגן ועד כיתה ו׳.'],
    ['/printables/sudoku', '🔢 סודוקו', 'מקל ועד קשה.'],
    ['/tools/bingo-maker', '🎯 בינגו', 'יוצרים כרטיסי בינגו ומדפיסים.'],
    ['/tools/word-search-maker', '🔤 תפזורת', 'תפזורת עם המילים שלכם.'],
    ['/treasure-hunt/winter-rainy', '🗺️ חיפוש מטמון ליום גשום', 'רמזים מוכנים לחיפוש מטמון בתוך הבית.'],
    ['/printables/winter', '⛄ דפי צביעה לחורף', 'מטריות, שלוליות ושלג.'],
  ] },
  { id: 'table', icon: '🃏', title: 'קלפים וקופסה', lead: 'חפיסה אחת או לוח אחד — וערב שלם.', items: [
    ['/card-games/yaniv', 'יניב', 'משחק הקלפים הישראלי, עם כל החוקים.'],
    ['/card-games/taki', 'טאקי', 'החוקים המלאים והגרסאות הנפוצות.'],
    ['/card-games/milchama', 'מלחמה', 'הכי פשוט, מגיל 4.'],
    ['/board-games/backgammon', 'שש בש', 'חוקים, ואפשר גם לשחק באתר.'],
    ['/board-games/checkers', 'דמקה', 'חוקים, ואפשר גם לשחק באתר.'],
    ['/dice-games', 'משחקי קוביות', 'משחקים שצריך בשבילם רק קוביות.'],
  ] },
  { id: 'sofa', icon: '🛋️', title: 'בסלון, בלי שום ציוד', lead: 'כשאין כוח לסדר כלום — רק לשבת יחד.', items: [
    ['/games/mi-ani', 'מי אני?', 'שאלות כן ולא עד שמגלים מי אתם.'],
    ['/games/pantomima', 'פנטומימה', 'מציגים בלי מילים, כולם מנחשים.'],
    ['/games/nahesh-et-hashir', 'נחשו את השיר', 'מזמזמים, והשאר מנחשים.'],
    ['/games/asur-lehagid-ken-velo', 'אסור להגיד כן ולא', 'דקה בכיסא החם.'],
    ['/games/kategoria-be5', 'קטגוריה בחמש שניות', 'שתי חיות באות כ׳ — מהר!'],
    ['/games/story-engine', 'סיפור משותף', 'כל אחד מוסיף משפט.'],
    ['/games/haolam-hahafuch', 'העולם ההפוך', 'כל פקודה עושים הפוך.'],
    ['/games/mi-asa-et-hakol', 'מי עשה את הקול?', 'עוצמים עיניים ומזהים קולות.'],
  ] },
  { id: 'crafts', icon: '🎨', title: 'יצירה ופעילות ליום גשום', lead: 'כשכבר שיחקו בהכול — מוציאים דבק ומספריים.', items: [
    ['/ideas/what-to-do-rainy-day', '🌧️ מה עושים ביום גשום', 'רעיונות לפי גיל וזמן, בלי לצאת מהבית.'],
    ['/ideas/what-to-do-at-home', '🏠 מה עושים בבית', 'רשימה ארוכה לימים שבהם כולם בבית.'],
    ['/crafts', '✂️ יצירות לילדים', 'יצירות מחומרים שיש בבית.'],
    ['/food/kitchen-science/rainbow-milk', '🌈 ניסוי חלב הקשת', 'ניסוי מדע צבעוני במטבח, בחמש דקות.'],
    ['/blog/winter-activities-at-home', '📝 פעילויות חורף בבית', 'המדריך שלנו לחורף עם ילדים.'],
  ] },
  { id: 'kitchen', icon: '🍲', title: 'מטבח חם', lead: 'מתכונים פשוטים שהילדים מכינים איתכם.', items: [
    ['/food/kids-recipes/pancakes', '🥞 פנקייק', 'ארוחת בוקר של יום חופש.'],
    ['/food/kids-recipes/popcorn', '🍿 פופקורן', 'לסרט של ערב חורף.'],
    ['/food/kids-recipes/chocolate-balls', '🍫 כדורי שוקולד', 'בלי אפייה, ילדים מכינים לבד.'],
    ['/food/kids-recipes/banana-oat-cookies', '🍪 עוגיות בננה ושיבולת שועל', 'שלושה מצרכים ותנור.'],
    ['/food/kids-recipes/baked-potato-wedges', '🥔 תפוחי אדמה בתנור', 'חם, פריך ופשוט.'],
    ['/food/kids-recipes/vegetable-muffins', '🧁 מאפינס ירקות', 'לארוחת ערב או לקופסת האוכל.'],
  ] },
  { id: 'holidays', icon: '🕎', title: 'חגי החורף', lead: 'חנוכה וט״ו בשבט — פעילויות, דפים וחוברות.', items: [
    ['/holidays/hanukkah', '🕎 חנוכה', 'כל מה שיש באתר לחנוכה.'],
    ['/holidays/hanukkah/what-to-do', '🎉 מה עושים בחנוכה', 'רעיונות לשמונה ימי החופש.'],
    ['/booklets/hanukkah', '📒 חוברת חנוכה', 'חוברת עבודה להדפסה.'],
    ['/holidays/hanukkah/sevivon', '🌀 סביבון', 'החוקים ואיך משחקים.'],
    ['/holidays/tu-bishvat', '🌳 ט״ו בשבט', 'פעילויות, דפים וחידון.'],
    ['/holidays/tu-bishvat/seder', '🍇 סדר ט״ו בשבט', 'סדר משפחתי מוכן.'],
  ] },
  { id: 'read', icon: '📖', title: 'לקרוא מתחת לשמיכה', lead: 'קטעי קריאה ודפים על החורף.', items: [
    ['/learn/reading/rainy-day-puddles', '☔ שלוליות של יום גשום', 'קטע הבנת הנקרא עם שאלות.'],
    ['/learn/reading/how-rainbows-form', '🌈 איך נוצרת קשת', 'קטע מידע עם שאלות.'],
    ['/printables/winter-fruits-vegetables', '🍊 פירות וירקות של החורף', 'דפים להדפסה.'],
    ['/learn/english-reading/hanukkah-lights', '🔤 Hanukkah Lights', 'קריאה באנגלית עם מילון.'],
  ] },
  { id: 'birthday', icon: '🎂', title: 'יום הולדת בחורף', lead: 'מסיבה בבית כשיורד גשם.', items: [
    ['/ideas/winter-birthday', '❄️ יום הולדת בחורף', 'רעיונות למסיבה בעונה הקרה.'],
    ['/guides/rainy-day-birthday', '🌧️ יום הולדת ביום גשום', 'תוכנית גיבוי כשאי אפשר לצאת לחצר.'],
  ] },
  { id: 'solo', icon: '📱', title: 'משחק לבד, כשכולם עסוקים', lead: 'משחקי חשיבה קצרים, בלי פרסומות קופצות.', items: [
    ['/online-games/today', '⭐ המשחק של היום', 'משחק חדש כל יום.'],
    ['/online-games/four-in-a-row', 'ארבע בשורה', 'נגד המחשב או נגד חבר.'],
    ['/online-games/memory', 'זיכרון', 'משחק זיכרון אונליין.'],
    ['/online-games/sudoku', 'סודוקו אונליין', 'עם רמזים.'],
  ] },
]

const FAQ = [
  { q: 'מה עושים עם ילדים בבית ביום גשום?', a: 'מחלקים את היום: משחק תנועה קצר בסלון, משחק להדפסה ליד השולחן, וערב משפחתי של בוגה לייב או ארץ עיר על הטלוויזיה. משחק אחד בכל פעם, ומחליפים לפני שמשתעממים.' },
  { q: 'איך משחקים בוגה לייב בבית?', a: 'אחד פותח את בוגה לייב ובוחר חידון, על המחשב או על הטלוויזיה. כל השאר נכנסים מהטלפון עם הקוד שמופיע על המסך ועונים. אין צורך בהרשמה.' },
  { q: 'צריך להירשם או לשלם?', a: 'לא. כל המשחקים בדף פתוחים בחינם, בלי הרשמה ובלי להתקין כלום.' },
]

export default function WinterGames() {
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="בוגה שוקו חם — אזור החורף: משחקים, יצירה ופעילות לימי גשם" description="בוגה שוקו חם, אזור החורף של עוגה בוגה: בוגה לייב וארץ עיר לכל המשפחה, משחקים להדפסה, יצירה ליום גשום, מתכונים חמים, חנוכה וט״ו בשבט. בחינם." path="/winter" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בוגה שוקו חם — אזור החורף' }]} />
    <header className="rounded-3xl bg-gradient-to-l from-amber-100 via-orange-50 to-sky-100 p-6 text-center sm:p-10">
      <p className="text-6xl" aria-hidden="true">☕🍫</p>
      <h1 className="mt-2 text-4xl font-black sm:text-5xl">בוגה שוקו חם</h1>
      <p className="mt-1 text-xl font-bold text-orange-700">אזור החורף של עוגה בוגה</p>
      <p className="mx-auto mt-3 max-w-2xl text-lg">גשם בחוץ, שוקו חם ביד, וכל החורף במקום אחד: משחקים יחד על המסך, משחקים להדפסה, יצירה ליום גשום, מטבח חם, חנוכה וט״ו בשבט.</p>
      <nav className="mt-5 flex flex-wrap justify-center gap-2" aria-label="קפיצה לחלק בדף">{WINTER_SECTIONS.map(s => <a key={s.id} href={`#${s.id}`} className="rounded-full border-2 border-orange-200 bg-white px-4 py-2 font-bold hover:bg-orange-50">{s.icon} {s.title}</a>)}</nav>
    </header>
    {WINTER_SECTIONS.map(s => <section key={s.id} id={s.id} className="mt-10 scroll-mt-24">
      <h2 className="text-3xl font-black"><span aria-hidden="true">{s.icon} </span>{s.title}</h2>
      <p className="mt-1 text-lg text-[var(--muted-foreground)]">{s.lead}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{s.items.map(([href, title, line]) => <li key={href}>
        <Link to={href} className="card-lift block h-full rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-right hover:border-orange-300">
          <b className="text-lg">{title}</b><p className="mt-1 text-sm text-[var(--muted-foreground)]">{line}</p>
        </Link></li>)}</ul>
    </section>)}
    <div className="mt-12"><SeoBody paragraphs={[
      'בוגה שוקו חם הוא אזור החורף של עוגה בוגה. החורף הוא הזמן של הבית: ימים קצרים, גשם, וחופשות שבהן כולם בבית יחד. כאן ריכזנו את כל מה שיש באתר לעונה, לפי מה שיש לכם באותו רגע: מסך וטלפונים, מדפסת, חפיסת קלפים, מטבח, או רק ספה וחשק לשחק.',
      'לערב משפחתי הכי מומלץ להתחיל בבוגה לייב או בארץ עיר: כולם משחקים יחד, גם סבא וסבתא, והאתר סופר את הנקודות. לבוקר רגוע עם ילדים קטנים מתאימים דפי הצביעה, המבוכים ומשחק הזיכרון. וכשמשתעממים מכל אלה, חיפוש מטמון ביום גשום מוציא את כולם מהכיסא.',
    ]} faq={FAQ} related={[{ label: 'רעיונות לפעילות בבית', href: '/ideas/at-home' }, { label: 'משחקים בלי ציוד', href: '/games/no-equipment' }, { label: 'משחקים שקטים', href: '/games/quiet' }, { label: 'משחקי אונליין', href: '/online-games' }]} /></div>
  </div>
}
