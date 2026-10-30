import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'

// /gifts/hanukkah-kids: Hanukkah gift ideas from the parents' committee to the kids that are not
// another lamp or money box, plus printable gift tags (8 per A4) generated from a pasted class list.
const IDEAS = [
  { emoji: '🔦', title: 'פנס קטן ו"משימת אור"', text: 'פנס ראש או פנס כיס, ואיתו כרטיס עם משימה: לקרוא סיפור מתחת לשמיכה, או לצאת עם ההורים לחפש כוכבים. מתנה של אור שלא נגמרת אחרי שמונה ימים.' },
  { emoji: '🎲', title: 'סביבון לבן לקישוט', text: 'סביבון עץ או קרטון בלי ציורים, עם טושים. כל ילד מעצב סביבון משלו, ואחר כך כל הגן משחק יחד בנ-ג-ה-פ.' },
  { emoji: '🍩', title: 'ערכת "שפים קטנים"', text: 'מטרפה קטנה או כף עץ, כרטיס מתכון פשוט ללביבות, וכובע שף מנייר. הילד מבשל בבית עם ההורים, וזה הופך לזיכרון משפחתי.' },
  { emoji: '📚', title: 'ספר ילדים', text: 'ספר אחד לכל ילד, או ספר אחד לגן עם הקדשה מכל הילדים. ספר הוא מתנה שנשארת, וקל להתאים אותו לגיל.' },
  { emoji: '🧩', title: 'פאזל או משחק קלפים קטן', text: 'פאזל של 24–48 חלקים לגן, ומשחק קלפים פשוט לכיתות א–ב. משחקים יחד בחג, בלי מסך.' },
  { emoji: '🫧', title: 'ערכת יצירה קטנה', text: 'פלסטלינה, מדבקות זוהרות בחושך או חרוזים לשרשרת. בחנוכה יש הרבה ערבים בבית, ויצירה ממלאת אותם.' },
  { emoji: '✨', title: 'שמונה לילות, שמונה משימות', text: 'מעטפה עם שמונה פתקים, פתק לכל נר: לצייר את החנוכייה, לספר בדיחה בארוחת ערב, להכין ברכה לסבא וסבתא. עולה כמעט כלום, והילדים מחכים לפתק של כל ערב.' },
  { emoji: '🌱', title: 'עציץ קטן לגדל בחורף', text: 'כוס עם אדמה וזרעים של עדשים או חיטה, ופתק "שומרים על האור הקטן שגדל". מתאים במיוחד לגן.' },
]
const FAQ = [
  { q: 'מה נותנים לילדי הגן בחנוכה חוץ מעששית וקופה?', a: 'משהו שעושים איתו משהו: פנס עם משימת אור, סביבון לקישוט, ערכת לביבות קטנה, ספר, פאזל, או מעטפה של שמונה משימות לשמונה הלילות. מה שמשחקים בו בחג זוכרים יותר ממה שעומד על המדף.' },
  { q: 'כמה כסף מוציא ועד ההורים על מתנה לחנוכה?', a: 'זה תלוי בגבייה של הוועד. כדאי לקבוע מראש סכום לכל ילד בתקציב השנתי, ולבחור מתנה שאפשר לקנות לכל הילדים באותו מחיר. גם ערכה זולה נראית מושקעת עם תווית שם לכל ילד.' },
  { q: 'עדיף מתנה זהה לכל הילדים?', a: 'כן. מתנה זהה חוסכת השוואות ועלבונות. אם רוצים גיוון, אפשר לתת אותה מתנה בכמה צבעים ולתת לילדים לבחור.' },
  { q: 'איך מדפיסים תוויות שם למתנות?', a: 'מדביקים את רשימת השמות של הילדים, שם אחד בכל שורה, ולוחצים "הדפסה". בכל דף A4 יש שמונה תוויות. גוזרים ומדביקים או קושרים לכל מתנה.' },
]

function Dreidel({ size = 60 }) {
  return <svg viewBox="0 0 60 70" width={size} height={size * 70 / 60} aria-hidden="true">
    <rect x="27" y="2" width="6" height="14" rx="2" fill="#b7791f" />
    <path d="M12 16 H48 V42 L30 66 L12 42 Z" fill="#63b3ed" stroke="#2b6cb0" strokeWidth="2.5" strokeLinejoin="round" />
    <text x="30" y="38" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff" fontFamily="Heebo, Arial, sans-serif">נ</text>
  </svg>
}

function Tag({ name, from }) {
  return <div style={{ border: '2.5px dashed #d69e2e', borderRadius: 14, padding: '4mm', height: '62mm', boxSizing: 'border-box', breakInside: 'avoid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textAlign: 'center', fontFamily: 'Heebo, Arial, sans-serif', color: '#1a202c' }}>
    <Dreidel size={46} />
    <div style={{ fontSize: 18, fontWeight: 700 }}>חג חנוכה שמח</div>
    <div style={{ fontSize: 26, fontWeight: 800 }}>{name}</div>
    <div style={{ fontSize: 15 }}>באהבה, {from}</div>
  </div>
}

export default function HanukkahKidsGift() {
  const [names, setNames] = useState(''), [from, setFrom] = useState('ועד ההורים'), [print, setPrint] = useState(false)
  const list = names.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 60)
  const tags = list.length ? list : ['שם הילד/ה']
  const field = 'mt-1 w-full min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-3 text-lg'
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מתנות חנוכה לילדים מהוועד — רעיונות שהם לא עוד עששית" description="מה ועד ההורים נותן לילדי הגן והכיתה בחנוכה: רעיונות למתנה שעושים איתה משהו — פנס, סביבון לקישוט, ערכת לביבות, שמונה משימות לשמונה לילות — ותוויות שם להדפסה לכל הילדים. בחינם." path="/gifts/hanukkah-kids" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ועד הורים', href: '/vaad' }, { label: 'מתנות חנוכה לילדים' }]} />
    <header className="mb-6 text-center">
      <h1 className="text-4xl sm:text-5xl">🎁 מתנות חנוכה לילדים מהוועד</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">רעיונות למתנה לילדי הגן והכיתה שהם לא עוד עששית או קופה: מתנות שמשחקים, יוצרים ומבשלים איתן בחג. ובסוף: תוויות שם להדפסה לכל הילדים.</p>
    </header>

    <h2 className="mb-3 text-2xl font-black">💡 רעיונות שעושים איתם משהו</h2>
    <div className="grid gap-3 sm:grid-cols-2">{IDEAS.map(i => <div key={i.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 sketch-shadow">
      <h3 className="text-xl font-bold">{i.emoji} {i.title}</h3>
      <p className="mt-1 text-lg">{i.text}</p>
    </div>)}</div>
    <p className="mt-4 rounded-xl bg-amber-50 p-3 text-lg">⭐ הטיפ: מתנה קטנה שמזמינה פעילות בחג (לבשל, לשחק, לצאת עם פנס) נזכרת יותר ממתנה גדולה שעומדת על המדף. ותווית עם השם של הילד הופכת כל מתנה לאישית.</p>

    <section className="mt-8 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-4 sketch-shadow">
      <h2 className="mb-3 text-2xl font-black">🏷️ תוויות שם למתנות להדפסה</h2>
      <label className="block font-bold">שמות הילדים — שם אחד בכל שורה<textarea className={field + ' min-h-[140px] py-2'} value={names} onChange={e => setNames(e.target.value)} placeholder={'נועה\nאיתי\nמאיה'} /></label>
      <label className="mt-3 block font-bold">ממי<input className={field} value={from} maxLength={40} onChange={e => setFrom(e.target.value)} /></label>
      <div className="mt-4 grid max-w-md grid-cols-2 gap-2 rounded-2xl bg-white p-3">{tags.slice(0, 2).map((n, i) => <Tag key={i} name={n} from={from} />)}</div>
      <div className="mt-4 text-center"><button type="button" onClick={() => setPrint(true)} className="min-h-[48px] rounded-xl bg-amber-600 px-6 text-lg font-bold text-white">🖨️ הדפסה ({tags.length} תוויות, 8 בדף)</button></div>
    </section>

    {print && <PrintPreview title="תוויות שם למתנות חנוכה" onClose={() => setPrint(false)}><article className="buga-flow" dir="rtl" style={{ padding: '8mm', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6mm' }}>
      {tags.map((n, i) => <Tag key={i} name={n} from={from} />)}
    </article></PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לוועד: <Link className="font-bold underline" to="/gifts/hanukkah-staff">מתנה לצוות לחנוכה</Link> · <Link className="font-bold underline" to="/vaad/budget">תקציב ועד הורים לשנה</Link> · <Link className="font-bold underline" to="/holidays/hanukkah">חנוכה לילדים</Link></p>
    <div className="mt-10"><SeoBody paragraphs={['מתנה לחנוכה מהוועד לילדי הגן או הכיתה היא מסורת כמעט בכל מקום, והשאלה חוזרת כל שנה: מה נותנים שלא נתנו כבר? עששיות וקופות הן הבחירה הנפוצה, והרבה ילדים כבר מקבלים כמה כאלה מכל מסגרת.', 'בדף הזה ריכזנו רעיונות למתנות שהילדים עושים איתן משהו בחג: פנס ומשימת אור, סביבון לקישוט, ערכת לביבות, ספר, פאזל, עציץ קטן, ומעטפה של שמונה משימות לשמונה הלילות. יש גם תוויות שם להדפסה: מדביקים את רשימת הילדים ומקבלים שמונה תוויות בכל דף.']} faq={FAQ} related={[{ label: 'ועד הורים — כל הכלים', href: '/vaad' }, { label: 'דפי צביעה לחנוכה', href: '/holidays/hanukkah/coloring' }]} /></div>
  </div>
}
