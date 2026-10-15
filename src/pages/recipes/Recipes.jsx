import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintCount from '../../components/ui/PrintCount'
import PrintableShell, { Sheet, T } from '../../components/printables/PrintableShell'
import { Cake } from '../cakes/Cakes'
import NotFound from '../NotFound'
import { CLASSIC_PANCAKES, NEW_KIDS_RECIPES, SHABBAT_RECIPES } from '../../data/recipesExpanded'
import { getCake, cakePath } from '../../data/cakes'

const shabbatFaq = [
  { q: 'מה אפשר להכין עם ילדים ביום שישי?', a: 'אפשר למדוד מצרכים, ללוש חלה, לגלגל עוגיות ולערבב עוגה. מבוגר בלבד מטפל בתנור, בסכינים ובנוזלים חמים.' },
  { q: 'אילו מתכונים כאן פרווה?', a: 'לכל מתכון סימון נפרד. החלות, עוגת התפוזים, עוגת התפוחים והקוגל שבאוסף הם פרווה לפי המצרכים המפורטים; בודקים תמיד תוויות.' },
  { q: 'איך מדפיסים כרטיס קטן?', a: 'פותחים מתכון, בוחרים חצי A4 ופותחים תצוגת הדפסה. כל גיליון מכיל שני כרטיסים; מספר העותקים משכפל גיליונות שלמים.' },
]
function RecipeLinks({ recipes }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{recipes.map(c => <Link key={c.slug} to={cakePath(c)} className="fam-card card-lift"><span className="text-3xl" aria-hidden="true">{c.emoji}</span><h3 className="text-xl font-bold">{c.title}</h3><p>{c.summary}</p><PrintCount path={cakePath(c)} fallback /></Link>)}</div>
}
export function ShabbatRecipes() {
  return <main className="max-w-6xl mx-auto p-4 sm:p-8" dir="rtl">
    <SEO title="מתכונים לשבת — חלות, עוגות שישי וכרטיסי מתכון להדפסה" description="מכינים לשבת עם הילדים: חלות, עוגות שישי, עוגיות וקוגל. כמויות מדויקות, סימון פרווה וחלבי וכרטיסי מתכון בגודל A4 או חצי A4." path="/recipes/shabbat" structuredData={faqSchema(shabbatFaq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אוכל לילדים', href: '/food' }, { label: 'מתכונים לשבת' }]} />
    <h1 className="text-4xl font-black text-center">מתכונים לשבת — מכינים יחד, מדפיסים למטבח</h1>
    <p className="my-5 text-lg">בוחרים מתכון ומחלקים תפקידים: ילדים מודדים ומערבבים, ומבוגרים אחראים לחום ולחיתוך. כל הכרטיסים כוללים מצרכים לסימון ושלבים ממוספרים.</p>
    <h2 className="text-2xl font-bold my-5">חלות וקליעה</h2><RecipeLinks recipes={SHABBAT_RECIPES.filter(c => c.category === 'challah')} />
    <Link className="inline-block underline font-bold my-4" to="/recipes/shabbat/braiding">מדריך קליעת חלה מ־3, 4 או 6 רצועות להדפסה ←</Link>
    <h2 className="text-2xl font-bold my-5">עוגות ועוגיות לשישי</h2><RecipeLinks recipes={[...SHABBAT_RECIPES.filter(c => !c.category && !/kugel|crackers/.test(c.slug)), getCake('parve-marble-cake'), getCake('vegan-chocolate-cake')]} />
    <h2 className="text-2xl font-bold my-5">מלוחים וקוגל</h2><RecipeLinks recipes={SHABBAT_RECIPES.filter(c => /kugel|crackers/.test(c.slug))} />
    <SeoBody paragraphs={['זמן ההכנה כולל גם מנוחה, התפחה או קירור כשנדרשים. ביום שישי מתחילים מהחלות ומהמאפים שצריכים להתקרר, ורק אחר כך עוברים לקישוט ולאריזה.', 'עוגת שיש פרווה ועוגת שוקולד פרווה כבר נמצאות באוסף העוגות שלנו. הקישורים כאן מובילים לאותם מתכונים, עם אפשרות לשינוי כמות ולהדפסה.']} faq={shabbatFaq} related={[{ label: 'זמני שבת', href: '/shabbat-times' }, { label: 'פנקייקים', href: '/food/pancakes' }, { label: 'עוגות יום הולדת', href: '/cakes' }]} />
  </main>
}
export function ShabbatRecipe() {
  const { slug } = useParams()
  const recipe = SHABBAT_RECIPES.find(c => c.slug === slug)
  return recipe ? <Cake key={slug} c={recipe} /> : <NotFound />
}
const pancakeFaq = [
  { q: 'איזה פנקייק הכי אוורירי?', a: 'האמריקאי הקלאסי כולל כף אבקת אפייה ושומן. מערבבים מעט ומניחים חמש דקות; גרסת הבננה עדינה ופחות תפוחה.' },
  { q: 'מה לבחור לארוחה פרווה?', a: 'פנקייק פרווה עם משקה צמחי או מים ושמן, או פנקייק בננה וביצים. בודקים תוויות ואלרגנים של התוספות.' },
  { q: 'הילדים יכולים להפוך פנקייקים?', a: 'המחבת חמה: מבוגר בלבד יוצק, הופך ומוציא. הילדים יכולים למדוד, למעוך בננה ולערבב הרחק מהכיריים.' },
]
export function PancakesHub() {
  return <main className="max-w-5xl mx-auto p-4 sm:p-8" dir="rtl">
    <SEO title="מתכון לפנקייק — אמריקאי, פרווה, בננה ושיבולת שועל" description="ארבעה מתכוני פנקייק מדויקים: אמריקאי אוורירי, פרווה, בננה משני מרכיבים ושיבולת שועל. טיפים למחבת, כרטיסי הדפסה וחלוקת תפקידים לילדים." path="/food/pancakes" structuredData={faqSchema(pancakeFaq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מתכונים לילדים', href: '/food/kids-recipes' }, { label: 'פנקייקים' }]} />
    <h1 className="text-4xl font-black text-center mb-6">מתכון לפנקייק — בוחרים את הגרסה שלכם</h1>
    <RecipeLinks recipes={[CLASSIC_PANCAKES, ...NEW_KIDS_RECIPES.filter(c => c.category === 'pancakes')]} />
    <SeoBody paragraphs={['לארוחת בוקר קלאסית בוחרים פנקייק אמריקאי; לארוחה ללא חלב משתמשים בגרסת הפרווה. פנקייק בננה מכיל שתי ביצים ובננה, ופנקייק שיבולת שועל זקוק לחמש דקות מנוחה כדי להסמיך.', 'בכל הגרסאות מבוגר אחראי למחבת. מתחילים ביחידה אחת כדי לכוון את החום: אם החוץ נשרף והמרכז נוזלי, מנמיכים. אין צורך ללחוץ על הפנקייק במרית.']} faq={pancakeFaq} related={[{ label: 'קאפקייקס שוקולד', href: '/cakes/chocolate-cupcakes' }, { label: 'קאפקייקס וניל פרווה', href: '/cakes/vanilla-cupcakes-parve' }, { label: 'עוגות יום הולדת', href: '/cakes' }]} />
  </main>
}

const BRAIDS = [
  { n: 3, title: 'קליעת חלה מ־3 רצועות', lines: ['מחלקים בצק לשלוש רצועות שוות ומצמידים בקצה העליון.', 'מעבירים את הרצועה הימנית מעל האמצעית.', 'מעבירים את הרצועה השמאלית מעל האמצעית החדשה.', 'חוזרים: ימין למרכז, שמאל למרכז.', 'מהדקים קצוות ומקפלים מתחת לחלה. מתפיחים שוב.'], moves: [[3,2],[1,2]] },
  { n: 4, title: 'קליעת חלה מ־4 רצועות', lines: ['מחלקים לארבע רצועות ומצמידים למעלה.', 'ממספרים מחדש משמאל לימין: 1, 2, 3, 4.', 'הרצועה הימנית עוברת מעל 3, מתחת ל־2 ומעל 1.', 'ממספרים שוב משמאל לימין וחוזרים עם הימנית החדשה.', 'מהדקים את שני הקצוות ומקפלים פנימה. מתפיחים שוב.'], moves: [[4,1]] },
  { n: 6, title: 'קליעת חלה מ־6 רצועות', lines: ['מצמידים שש רצועות שוות בקצה העליון.', 'לוקחים את הרצועה הימנית ומעבירים שמאלה:', 'מעל שתי רצועות, מתחת לאחת, ואז מעל שתי הנותרות.', 'לוקחים את הימנית החדשה וחוזרים על אותו הסדר.', 'ממשיכים עד הקצה, מהדקים ומקפלים מתחת לחלה.', 'מתפיחים ואופים לפי מתכון החלה.'], moves: [[6,1],[1,3],[1,6],[6,4]] },
]
export function BraidingGuide() {
  const pages = BRAIDS.map(b => ({ key: b.n, svg: <Sheet label={b.title}>
    <T x={100} y={18} size={9} weight={800}>{b.title}</T>
    {Array.from({ length: b.n }, (_, i) => <g key={i}><path d={`M100 32 Q${35+i*25} 55 ${30+i*(140/(b.n-1))} 90`} fill="none" stroke="#b77b42" strokeWidth="9" strokeLinecap="round" /><T x={30+i*(140/(b.n-1))} y={104} size={7} weight={700}>{i+1}</T></g>)}
    {b.lines.map((line,i) => <T key={i} x={100} y={125+i*15} size={4.7}>{i+1}. {line}</T>)}
    <T x={100} y={250} size={4.4}>ממספרים לפי המיקום הנוכחי, לא לפי הרצועה המקורית.</T>
    <T x={100} y={260} size={4.4}>משתמשים במתכון חלה מלא לזמני ההתפחה והאפייה.</T>
  </Sheet> }))
  return <PrintableShell path="/recipes/shabbat/braiding" seoTitle="קליעת חלה — 3, 4 ו־6 רצועות, מדריך להדפסה" description="שלושה דפי קליעת חלה להדפסה: 3, 4 ו־6 רצועות. שלבים ממוספרים, איור מיקום הרצועות וטיפים לבצק נוח לקליעה עם ילדים." emoji="🍞" h1="קליעת חלה מ־3, 4 או 6 רצועות" sub="שלושה דפים — מתחילים בשלוש רצועות ומתקדמים" crumbs={[{label:'מתכונים לשבת',href:'/recipes/shabbat'}]} pages={pages} printTitle="מדריכי קליעת חלה" previewAll paragraphs={['קליעה מתחילה ברצועות שוות באורך ובעובי. אם הבצק חוזר ומתכווץ, מכסים ונותנים לו לנוח חמש דקות לפני שממשיכים לגלגל.', 'בכל העברה מתייחסים למיקום החדש של הרצועות. מתאמנים תחילה עם שלושה חבלים נקיים או רצועות בצק, ומשאירים את הקליעה רפויה מעט כדי שיהיה לבצק מקום לתפוח.']} faq={[{q:'באיזה בצק משתמשים?',a:'בבצק החלה הקלאסי, המתוק או החצי־מלא המקושר כאן, אחרי ההתפחה הראשונה.'},{q:'מתי אופים?',a:'אחרי הקליעה מתפיחים שוב לפי המתכון. מדריך הקליעה אינו מחליף את הוראות האפייה.'},{q:'איך עובדים עם ילדים?',a:'מתחילים בשלוש רצועות; המבוגר מדגים העברה אחת והילד חוזר עליה. התנור נשאר באחריות מבוגר.'}]} related={[{label:'חלה קלאסית',href:'/recipes/shabbat/classic-challah'},{label:'חלה מתוקה',href:'/recipes/shabbat/sweet-challah'}]} />
}
