// Pages of the photo studio: the album designer (/tools/album, per event) and the collage maker
// (/tools/collage, per kind). SEO text and FAQ per page; the editor itself is src/studio/Studio.jsx.
import { Link, useParams, useSearchParams, Navigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Studio from '../../studio/Studio'

const app = (name, url) => ({ '@context': 'https://schema.org', '@type': 'WebApplication', name, url: `https://ugabuga.co.il${url}`, applicationCategory: 'DesignApplication', operatingSystem: 'Any', inLanguage: 'he', offers: { '@type': 'Offer', price: '0', priceCurrency: 'ILS' } })
const howTo = (name, steps) => ({ '@context': 'https://schema.org', '@type': 'HowTo', name, step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })) })

// ---------- album ----------
const ALBUM = {
  '': { title: 'עיצוב אלבום דיגיטלי חינם — לבד, אונליין, PDF להדפסה', h1: 'עיצוב אלבום תמונות לבד — חינם, ישר להדפסה', event: 'wedding', label: 'אלבום תמונות',
    intro: 'מעלים את התמונות, בוחרים אירוע וסגנון, והאלבום מסתדר לבד לפי תאריך הצילום. מזיזים, מגדילים, חותכים ומסובבים כל תמונה, ומורידים PDF או JPG לכל כפולה — מוכן לכל מעבדת אלבומים.' },
  wedding: { title: 'עיצוב אלבום חתונה לבד — חינם, אונליין, להדפסה', h1: 'עיצוב אלבום חתונה לבד', event: 'wedding', label: 'אלבום חתונה',
    intro: 'אלבום חתונה בכמה דקות: מעלים את התמונות מהצלם או מהטלפון, בוחרים אחד משישה סגנונות — לבן-זהב, עלי זית, פיין-ארט עם פספרטו, טרקוטה, לילה וזהב או יומן מצויר — ומורידים קובץ להדפסה בגודל 30×30 או כל גודל אחר.' },
  'bar-mitzvah': { title: 'עיצוב אלבום בר מצווה לבד — חינם, PDF להדפסה', h1: 'עיצוב אלבום בר מצווה', event: 'bar-mitzvah', label: 'אלבום בר מצווה',
    intro: 'אלבום בר מצווה מהטקס, מהעלייה לתורה ומהמסיבה: מעלים תמונות, בוחרים סגנון — טלית כחול-לבן, ירושלים של זהב, ספורט, מגזין שחור-לבן, מסורת או מסע שורשים — ומורידים קובץ להדפסה.' },
  'bat-mitzvah': { title: 'עיצוב אלבום בת מצווה לבד — חינם, PDF להדפסה', h1: 'עיצוב אלבום בת מצווה', event: 'bat-mitzvah', label: 'אלבום בת מצווה',
    intro: 'אלבום בת מצווה שמח וצבעוני: ורוד-שחור-כסף, בוהו פרחוני, פסטל חלומי, כתום מודרני, רוז-גולד או סקרפבוק חברות. מעלים תמונות, הכול מסתדר לבד, ומורידים להדפסה.' },
  birthday: { title: 'עיצוב אלבום יום הולדת לבד — חינם, להדפסה', h1: 'עיצוב אלבום יום הולדת', event: 'birthday', label: 'אלבום יום הולדת',
    intro: 'אלבום ליום הולדת, לשנה הראשונה של התינוק או מתנה לסבא וסבתא: קשת בענן, ג׳ונגל, חלל, פסטל לתינוקות, קונפטי או קוביות צבעוניות. התמונות מסתדרות לפי תאריך הצילום.' },
}
const albumFaq = [
  { q: 'זה באמת בחינם?', a: 'כן. בלי הרשמה, בלי סימן מים ובלי הגבלה על מספר הכפולות. הקובץ להדפסה יוצא ברזולוציה מלאה.' },
  { q: 'לאן עולות התמונות?', a: 'לשום מקום. התמונות נטענות רק בדפדפן שלכם ונשמרות במכשיר כדי שתוכלו להמשיך מחר. אנחנו לא רואים אותן ולא שומרים אותן.' },
  { q: 'איזה קובץ שולחים למעבדת האלבומים?', a: 'רוב המעבדות בארץ מבקשות JPG לכל כפולה ב־300 DPI, ממוספרים 001, 002 וכן הלאה — זה בדיוק מה שיוצא בכפתור ה־ZIP. יש גם PDF אחד עם כל הכפולות. בדקו מול המעבדה את גודל האלבום ואם צריך שוליים לחיתוך (בליד) של 1 או 3 מ״מ.' },
  { q: 'מה הנקודה האדומה על תמונה?', a: 'שהתמונה קטנה מדי לגודל שבו היא מודפסת ועלולה לצאת מטושטשת. מקטינים אותה באלבום או מחליפים בתמונה מקורית מהצלם.' },
  { q: 'איך מסדרים את התמונות לפי הסדר?', a: 'התמונות מסתדרות לבד לפי תאריך הצילום, מהמוקדמת למאוחרת. תמונות ישנות שנסרקו שומרות את תאריך הסריקה, אז אפשר לבחור "לפי סדר ההעלאה" ולהעלות אותן בסדר שרוצים.' },
  { q: 'אפשר לעבוד מהטלפון?', a: 'כן. גוררים באצבע, מגדילים ומסובבים בשתי אצבעות. לאלבום גדול נוח יותר במחשב, ובאייפון הקובץ יוצא ברזולוציה מעט נמוכה יותר בגלל מגבלה של הדפדפן.' },
]
export function AlbumPage() {
  const { event = '' } = useParams()
  const v = ALBUM[event]
  if (!v) return <Navigate to="/tools/album" replace />
  const path = `/tools/album${event ? '/' + event : ''}`
  return <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
    <SEO title={v.title} description={`${v.intro.slice(0, 140)}…`} path={path} structuredData={[faqSchema(albumFaq), app(v.label, path), howTo(`איך מעצבים ${v.label}`, ['מעלים את התמונות', 'בוחרים אירוע וסגנון', 'מזיזים, מגדילים, חותכים ומסובבים', 'מורידים PDF או JPG לכל כפולה ושולחים למעבדה'])]} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, ...(event ? [{ label: 'עיצוב אלבום', href: '/tools/album' }] : []), { label: v.label }]} />
    <h1 className="text-center text-3xl font-black sm:text-4xl">📖 {v.h1}</h1>
    <p className="mx-auto max-w-3xl text-center text-lg text-[var(--muted-foreground)]">{v.intro}</p>
    <nav className="my-4 flex flex-wrap justify-center gap-2" aria-label="אלבום לפי אירוע">
      {Object.entries(ALBUM).filter(([k]) => k).map(([k, x]) => <Link key={k} to={`/tools/album/${k}`} className={`rounded-full border-2 px-4 py-1.5 font-bold ${k === event ? 'border-[var(--border)] bg-amber-200' : 'border-slate-300 bg-white'}`}>{x.label}</Link>)}
    </nav>
    <Studio key={event || 'all'} product="album" event={v.event} />
    {(event === 'bar-mitzvah' || event === 'bat-mitzvah') && <MitzvahExtras />}
    <div className="mt-12">
      <SeoBody paragraphs={[
        'עיצוב אלבום תמונות לבד חוסך את העיצוב אצל הצלם או המעבדה ונותן לכם שליטה מלאה: אילו תמונות נכנסות, כמה בכל עמוד ואיפה. כאן הכול עובד בדפדפן, בלי הרשמה ובלי תוכנה. מעלים את כל התמונות בבת אחת, והאלבום מסתדר לבד: לפי תאריך הצילום, בשורות שמכבדות את הצורה של כל תמונה, ותמונות כמעט כפולות או מטושטשות לא תופסות מקום.',
        'כל תמונה אפשר להזיז, להגדיל, לסובב ימינה ושמאלה או בזווית קטנה, ולחתוך בתוך המסגרת. המגנט מיישר תמונה לגובה של תמונה אחרת ולאמצע העמוד, וסרגל אחד מגדיל או מקטין את כל התמונות בעמוד ביחד. יש שחור-לבן, ספיה, גוון חם או קר, הכהיית שוליים (וינייט), מסגרות, פינות מעוגלות, הסרת רקע מתמונות של אנשים, טקסטים בגופנים עבריים ואימוג׳י.',
        'הגדלים הם הגדלים של מעבדות האלבומים בארץ: 30×30 (כפולה 30×60), 30.5×30.5, 25×25, 22×22, 30×40 לרוחב ועוד. כל כפולה יוצאת ב־300 DPI עם שוליים לחיתוך לפי בחירה, כ־PDF אחד או כ־JPG ממוספרים בקובץ ZIP. קו מקווקו מסמן את השוליים הבטוחים ואת הקיפול באמצע — כדאי לא לשים שם פנים.',
      ]} faq={albumFaq} related={[{ label: 'קולאז׳ בצורת לב, מספר ושם', href: '/tools/collage' }, { label: 'מתכנן החתונה', href: '/wedding' }, { label: 'בר ובת מצווה', href: '/bar-mitzvah' }, { label: 'עריכת תמונות', href: '/tools/image' }]} />
    </div>
  </div>
}
function MitzvahExtras() {
  return <section className="mt-8 rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5 text-center">
    <h2 className="m-0 text-2xl font-black">🎬 גם מצגת לאירוע?</h2>
    <p className="mx-auto mt-2 max-w-2xl">אותן תמונות יכולות להפוך למצגת מרגשת עם מוזיקה להקרנה באירוע. ובינתיים: הזמנה, נאום ורשימת הכנות לבר ולבת המצווה אצלנו.</p>
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      <Link to="/bar-mitzvah" className="rounded-xl bg-white px-4 py-2 font-bold">📜 הכול לבר ובת מצווה</Link>
      <Link to="/tools/collage/number" className="rounded-xl bg-white px-4 py-2 font-bold">🔢 קולאז׳ 13 מתמונות</Link>
    </div>
  </section>
}

// ---------- collage ----------
const COLLAGE = {
  '': { kind: 'grid', title: 'קולאז׳ תמונות בצורת לב, מספר ושם — חינם אונליין', h1: 'קולאז׳ תמונות — לב, מספר, שם ותמונה בתוך טקסט', label: 'קולאז׳ תמונות',
    intro: 'מעלים תמונות ובוחרים צורה: רשת, לב, מספר (כמו 40 ליום הולדת) שבנוי מכל התמונות, שם מתמונות, או תמונה אחת בתוך האותיות על רקע שקוף. מוסיפים טקסט ואימוג׳י ומורידים בחינם.' },
  heart: { kind: 'heart', title: 'קולאז׳ בצורת לב מתמונות — חינם, להדפסה', h1: 'קולאז׳ בצורת לב', label: 'קולאז׳ לב',
    intro: 'לב שבנוי מעשרות תמונות — לאהבה, ליום נישואין, ליום האם או לפרידה מהגן. מעלים תמונות, הלב מתמלא לבד, ומורידים בגודל A4, פוסטר או ריבוע לרשתות.' },
  number: { kind: 'number', title: 'קולאז׳ תמונות בצורת מספר — 40, 50, 18, 13 — חינם', h1: 'קולאז׳ בצורת מספר', label: 'קולאז׳ מספר',
    intro: 'המספר 40, 50, 18 או 13 בנוי מכל התמונות — לפי סדר, מהתינוק ועד היום. מתנה מושלמת ליום הולדת עגול, לבר ובת מצווה ולשנה הראשונה. כותבים מספר, מעלים תמונות ומורידים פוסטר להדפסה.' },
  name: { kind: 'name', title: 'קולאז׳ שם מתמונות — אותיות בעברית מתמונות, חינם', h1: 'קולאז׳ שם מתמונות', label: 'קולאז׳ שם',
    intro: 'השם של הילד, של הזוג או של הכיתה — באותיות שבנויות מתמונות. עובד בעברית ובאנגלית, עד 12 תווים, ויוצא כפוסטר לחדר או כמתנה.' },
  'photo-in-text': { kind: 'photo-text', title: 'תמונה בתוך טקסט — PNG שקוף, חינם בעברית', h1: 'תמונה בתוך טקסט', label: 'תמונה בתוך טקסט',
    intro: 'כותבים מילה או שם, והתמונה נכנסת לתוך האותיות — וכל השאר שקוף. מורידים PNG שקוף לסטורי, להזמנה, לחולצה או לעוגה.' },
}
const collageFaq = [
  { q: 'איך עושים קולאז׳ בצורת מספר?', a: 'בוחרים "מספר מתמונות", כותבים את המספר (למשל 40) ומעלים תמונות. המספר מתחלק לריבועים, וכל ריבוע מקבל תמונה לפי תאריך הצילום. אפשר לשנות כמה ריבועים יש, את הרווח ביניהם ואת הפינות.' },
  { q: 'כמה תמונות צריך?', a: 'כמה שרוצים. אם יש פחות תמונות מריבועים, התמונות חוזרות על עצמן. ל־40 שנה יפה במיוחד 40 תמונות, אחת מכל שנה.' },
  { q: 'אפשר להוריד עם רקע שקוף?', a: 'כן. ב"תמונה בתוך טקסט" הרקע שקוף מראש, ובכל קולאז׳ אחר מסמנים "רקע שקוף" ומורידים PNG.' },
  { q: 'התמונות עולות לאינטרנט?', a: 'לא. הכול קורה בדפדפן שלכם, והקולאז׳ נשמר רק במכשיר.' },
  { q: 'באיזה גודל אפשר להדפיס?', a: 'A4, A3, פוסטר 50×70 לאורך או לרוחב, ריבוע לרשתות או סטורי. הקובץ יוצא ב־300 DPI לגדלים להדפסה.' },
]
export function CollagePage() {
  const { kind = '' } = useParams()
  const [q] = useSearchParams()
  const v = COLLAGE[kind]
  if (!v) return <Navigate to="/tools/collage" replace />
  const path = `/tools/collage${kind ? '/' + kind : ''}`
  const n = (q.get('n') || '').replace(/[^\d]/g, '').slice(0, 3)
  return <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
    <SEO title={v.title} description={v.intro.slice(0, 155)} path={path} structuredData={[faqSchema(collageFaq), app(v.label, path), howTo(`איך עושים ${v.label}`, ['מעלים תמונות', 'בוחרים צורה וכותבים מספר או שם', 'מוסיפים טקסט ואימוג׳י', 'מורידים JPG או PNG שקוף'])]} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, ...(kind ? [{ label: 'קולאז׳', href: '/tools/collage' }] : []), { label: v.label }]} />
    <h1 className="text-center text-3xl font-black sm:text-4xl">🧩 {v.h1}</h1>
    <p className="mx-auto max-w-3xl text-center text-lg text-[var(--muted-foreground)]">{v.intro}</p>
    <nav className="my-4 flex flex-wrap justify-center gap-2" aria-label="סוגי קולאז׳">
      {Object.entries(COLLAGE).filter(([k]) => k).map(([k, x]) => <Link key={k} to={`/tools/collage/${k}`} className={`rounded-full border-2 px-4 py-1.5 font-bold ${k === kind ? 'border-[var(--border)] bg-amber-200' : 'border-slate-300 bg-white'}`}>{x.label}</Link>)}
      <Link to="/tools/image/collage" className="rounded-full border-2 border-slate-300 bg-white px-4 py-1.5 font-bold">קולאז׳ רשת מהיר</Link>
    </nav>
    <Studio key={kind + n} product="collage" collage={v.kind} text={n || undefined} storageKey={`collage-${v.kind}`} />
    <div className="mt-12">
      <SeoBody paragraphs={[
        'קולאז׳ תמונות הוא הדרך הכי פשוטה לשים הרבה רגעים בתמונה אחת. כאן יש חמש צורות: רשת שמסתדרת לבד לפי הצורה של כל תמונה, לב, מספר, שם, ותמונה בתוך טקסט. בצורות הלב, המספר והשם הצורה מתחלקת לריבועים, וכל ריבוע מקבל תמונה לפי הסדר — לפי תאריך הצילום או לפי סדר ההעלאה.',
        'קולאז׳ בצורת מספר הוא מתנה אהובה ליום הולדת עגול — 30, 40, 50 או 60 — ולבר ובת מצווה (13 ו־12). שמים תמונה אחת מכל שנה, והמספר מספר את כל הסיפור. קולאז׳ שם מתאים לחדר של ילד, לפרידה מהגננת או לזוג טרי.',
        'אפשר להוסיף כותרת וטקסטים בגופנים עבריים, אימוג׳י וקישוטים, לסובב ולהגדיל כל דבר, ולבחור צבעים. ההורדה בחינם, בלי סימן מים: JPG באיכות הדפסה או PNG עם רקע שקוף.',
      ]} faq={collageFaq} related={[{ label: 'עיצוב אלבום תמונות', href: '/tools/album' }, { label: 'קולאז׳ רשת מהיר', href: '/tools/image/collage' }, { label: 'מחשבון גיל ויום הולדת', href: '/tools' }]} />
    </div>
  </div>
}
