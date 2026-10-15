import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import PrintCount from '../../components/ui/PrintCount'
import PrintableShell, { Choice } from '../../components/printables/PrintableShell'
import { ShabbatActivitySheets, shabbatPrintablePages } from '../../components/printables/ShabbatActivitySheets'
import { SHABBAT_ACTIVITIES, SHABBAT_PREPARATION, SHABBAT_CUSTOM, QUIZ_AGES, activityBySlug, activityPrintPlan, weeklyActivity } from '../../data/shabbatActivities'
import { israelToday } from '../../utils/parashaCalendar'
import NotFound from '../NotFound'

const HUB = {label:'פעילויות לשבת',href:'/shabbat-activities'}
const HUB_FAQ = [
  {q:'מה מכינים לפני שבת?',a:'מדפיסים, גוזרים ומסדרים את כל הקלפים והאסימונים. אם רוצים לחזק או להדביק עושים גם זאת מראש; בזמן המשחק אין משימת כתיבה או יצירה.'},
  {q:'מה יש בחבילת השבת?',a:'חמישה דפי A4: חידון פרשת השבוע, 22 אותיות, 12 קטגוריות, שש חידות ושישה קלפי מי אני. בשבת חג ללא פרשה רגילה יש חידון משפחתי חלופי המסומן בהתאם.'},
  {q:'האם הפעילויות מתאימות לכל מנהג?',a:SHABBAT_CUSTOM+'. הדף מציע רעיונות לפעילות ואינו פוסק הלכה.'},
]
function useCurrentWeek() {
  const [today,setToday]=useState(israelToday)
  useEffect(()=>{const update=()=>setToday(israelToday()),timer=setInterval(update,30000);window.addEventListener('focus',update);window.addEventListener('pageshow',update);return()=>{clearInterval(timer);window.removeEventListener('focus',update);window.removeEventListener('pageshow',update)}},[])
  return today
}
export function ShabbatPreparationNote() {
  return <aside className="rounded-2xl border-2 border-[var(--border)] bg-[var(--postit)] p-4 my-5" aria-label="מכינים לפני שבת"><p className="font-bold">{SHABBAT_PREPARATION}</p><p className="mt-2">{SHABBAT_CUSTOM}</p></aside>
}
export function ShabbatActivitiesHub() {
  const today=useCurrentWeek(),weekly=weeklyActivity(today),pages=activityPrintPlan('pack',today)
  const [printing,setPrinting]=useState(false)
  return <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
    <SEO title="פעילויות לשבת — חבילת משחקים וקלפים להדפסה מראש" description="חבילת שבת של חמישה דפי משחק: חידון פרשת השבוע, ארץ עיר בעל־פה, חידות ומי אני. ועוד זיכרון, 20 שאלות וסיפורים — מכינים הכול לפני שבת." path={HUB.href} structuredData={faqSchema(HUB_FAQ)}/>
    <Breadcrumbs items={[{label:'ראשי',href:'/'},{label:'שבתות וחגים',href:'/holidays'},{label:HUB.label}]}/>
    <header className="text-center"><div className="text-5xl" aria-hidden="true">🕯️</div><h1 className="text-4xl sm:text-5xl font-black my-4">פעילויות לשבת — מכינים מראש, משחקים יחד</h1><p className="text-lg">קלפים לשולחן המשפחתי, לזיכרון, לצחוק ולשיחה.</p></header>
    <ShabbatPreparationNote/>
    <section className="rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5 sm:p-8 text-center">
      <h2 className="text-2xl font-bold">חבילת שבת מוכנה — 5 דפי A4</h2>
      <p className="my-3" aria-live="polite">{weekly?.reading.holiday?'קריאת החג':'פרשת השבוע'}: <b>{weekly?.reading.name}</b> · {weekly?.reading.date} · לפי לוח ישראל</p>
      {weekly?.reading.holiday&&<p>בשבת זו מוצגת קריאת חג. אם אין פרשה רגילה, החבילה כוללת חידון משפחתי מסומן במקום שאלות פרשה.</p>}
      <p className="mb-4">חידון שבועי + אותיות + קטגוריות + חידות + מי אני</p>
      <div className="mb-4"><PrintCount path="/shabbat-activities/pack" fallback /></div>
      <button type="button" data-print-main onClick={()=>setPrinting(true)} className="rounded-xl bg-purple-700 text-white px-6 py-4 font-bold text-xl">🖨️ חבילת שבת — הדפסה או PDF</button>
      <p className="mt-3"><Link to="/shabbat-activities/pack" className="underline font-bold">לראות את כל חמשת הדפים לפני ההדפסה ←</Link></p>
    </section>
    {printing&&<PrintPreview downloadPath="/shabbat-activities/pack" title={`חבילת שבת — ${weekly?.reading.name}`} onClose={()=>setPrinting(false)}><ShabbatActivitySheets pages={pages}/></PrintPreview>}
    <h2 className="text-2xl font-bold my-6">בוחרים פעילות ומכינים את הקלפים</h2>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{SHABBAT_ACTIVITIES.map(a=><Link key={a.slug} to={a.path} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-5 card-lift"><span className="text-3xl" aria-hidden="true">{a.emoji}</span><h3 className="text-xl font-bold my-2">{a.title}</h3><p>{a.description}</p><p className="text-sm mt-3">גיל {a.age} · {a.players} משתתפים · {a.minutes} דקות</p></Link>)}</div>
    <div className="mt-10"><SeoBody paragraphs={['מכינים את חבילת השבת ביום שישי ושמים את הקלפים בקופסה. בזמן הארוחה בוחרים חידה, ובהמשך אפשר לשחק ארץ עיר או מי אני. אין צורך להפעיל מסך, לכתוב תשובות או לגזור דבר במהלך השבת.', 'לכל פעילות יש הוראות נפרדות, גיל ומספר משתתפים. אפשר לבחור פעילות קצרה אחת או להדפיס את החבילה המוכנה; מונה העותקים משכפל את כל החמישה יחד, למשל לשתי משפחות.']} faq={HUB_FAQ} related={[{label:'פרשת השבוע לילדים',href:'/parasha'},{label:'זמני שבת',href:'/shabbat-times'},{label:'משחקים לשבת בלי ציוד',href:'/games/shabbat'},{label:'מתכונים לשבת',href:'/recipes/shabbat'}]}/></div>
  </div>
}
function Activity({ activity, pack=false }) {
  const today=useCurrentWeek(),[age,setAge]=useState('family'),weekly=weeklyActivity(today)
  const plan=activityPrintPlan(pack?'pack':activity.slug,today,age)
  const title=pack?'חבילת שבת — חמישה דפי משחק להדפסה':activity.title
  return <PrintableShell path={pack?'/shabbat-activities/pack':activity.path} seoTitle={pack?'חבילת שבת להדפסה — חמש פעילויות מוכנות לשולחן':`${title} — קלפים להדפסה מראש`} description={pack?'חמישה דפי A4 בהדפסה אחת: פרשת השבוע בישראל, קלפי ארץ עיר, חידות ומי אני. גוזרים לפני שבת, בוחרים עותקים ומשחקים בעל־פה.':activity.description} emoji={pack?'🕯️':activity.emoji} h1={title} sub={pack?'כל מה שצריך לחבילת משחקים קטנה, מוכנה לפני שבת':`גיל ${activity.age} · ${activity.players} משתתפים · ${activity.minutes} דקות`} crumbs={[HUB]} pages={shabbatPrintablePages(plan)} previewAll printTitle={pack?`חבילת שבת — ${weekly?.reading.name}`:title} printLabel={pack?'חבילת שבת — הדפסה או PDF':'הדפסת הקלפים או PDF'}
    controls={<><ShabbatPreparationNote/>{(pack||activity.slug==='table-quiz')&&<p className="text-center font-bold" aria-live="polite">השבת בארץ ישראל: {weekly?.reading.name} · {weekly?.reading.date}{weekly?.reading.holiday?' · קריאת חג':''}</p>}{!pack&&activity.slug==='table-quiz'&&<Choice label="גיל לחידון" value={age} onChange={setAge} options={QUIZ_AGES}/>}
      <section><h2 className="text-xl font-bold">{pack?'איך מכינים את החבילה':'איך משחקים'}</h2><ol className="list-decimal ps-6 space-y-2 mt-3">{(pack?['בוחרים מספר עותקים בתצוגת ההדפסה; כל עותק מכיל חמישה דפים.','מדפיסים וגוזרים לפני שבת לפי הקווים המקווקווים. מחלקים לקבוצות: חידון, אותיות, קטגוריות, חידות וזהויות.','לחידון: מנחה מקריא ומכסה את התשובה ההפוכה. למי אני: רק המנחה רואה את השם והמנחש שואל כן ולא.','לארץ עיר: שולפים אות וקטגוריה ועונים בתורות בקול. אם סופרים נקודות משתמשים באסימונים מוכנים, בלי כתיבה.']:activity.rules).map((r,n)=><li key={n}>{r}</li>)}</ol></section></>}
    extra={!pack&&activity.slug==='eretz-ir'?<Link className="underline" to="/tools/eretz-ir">לימי חול: ארץ עיר אונליין ←</Link>:<Link className="underline" to="/shabbat-activities">לכל הפעילויות ←</Link>}
    paragraphs={pack?['החבילה מאגדת חמש פעילויות על חמישה דפים: דף החידון השבועי, דף אותיות, דף קטגוריות, דף חידות ודף זהויות. ההדפסה נעשית בעבודה אחת והעותקים חוזרים כסטים מלאים.', 'השאלות השבועיות נלקחות ממאגר פרשת השבוע של האתר לפי לוח ישראל. התאריך ושם הפרשה מודפסים בראש הדף כדי שתוכלו לזהות את החבילה גם אם הכנתם אותה כמה ימים קודם.']:activity.paragraphs}
    faq={pack?HUB_FAQ:activity.faq} related={[HUB,{label:'פרשת השבוע',href:'/parasha'},{label:'זמני שבת',href:'/shabbat-times'},{label:'כל החידות',href:'/tools/riddles'}]}/>
}
export function ShabbatActivityPage() {
  const {slug}=useParams(),activity=activityBySlug(slug)
  return activity?<Activity key={slug} activity={activity}/>:<NotFound/>
}
export function ShabbatPackPage() { return <Activity pack activity={{slug:'pack'}}/> }
