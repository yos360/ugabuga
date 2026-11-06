import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'

// /gifts/siddur-party: gift and program ideas for a class siddur party, beyond the usual kippah and
// bookmark, plus a printable dedication label for the inside cover (one per child, four per A4 page).
const GIFTS = [
  { emoji: '🧵', title: 'נרתיק בד לסידור', text: 'נרתיק פשוט עם רוכסן או לולאה, והשם של הילד רקום או מודפס עליו. הסידור נשאר נקי בתיק, והנרתיק משתמש שנים.' },
  { emoji: '🎨', title: 'תיק בד שמעצבים במסיבה', text: 'קונים תיקי בד לבנים וטושים לבד. כל ילד מעצב את התיק שלו בתחנת יצירה, כך שהמתנה היא גם הפעילות.' },
  { emoji: '✍️', title: 'הקדשה אישית מההורים', text: 'כל משפחה כותבת כמה מילים אישיות בכתב יד, ומדביקים בתוך הכריכה. בלי עלות כמעט, וזה מה שהילד יפתח ויקרא גם בעוד עשרים שנה.' },
  { emoji: '📖', title: 'ספר ברכות כיתתי', text: 'כל ילד מקבל חוברת קטנה עם ברכה מכל חבר בכיתה ומהמחנכת. מדפיסים דף אחד לכל ילד ומחברים בסיכות.' },
  { emoji: '🌅', title: 'תמונת "מודה אני" ליד המיטה', text: 'לוח קטן מעץ או קרטון קשיח עם מילות "מודה אני" ושם הילד. תולים ליד המיטה, כדי שזה יהיה הדבר הראשון שרואים בבוקר.' },
  { emoji: '🪙', title: 'קופת צדקה שמקשטים', text: 'קופה קטנה מפח או קרטון שכל ילד מקשט בעצמו, עם השם שלו. אפשר להחליט יחד למה הכיתה תתרום.' },
  { emoji: '🖼️', title: 'תמונה כיתתית במסגרת', text: 'תמונה של כל הכיתה עם הסידורים ביום המסיבה, ומסביב חתימות של הילדים. שולחים אחרי האירוע, והמתנה מגיעה עם זיכרון אמיתי.' },
  { emoji: '🫙', title: 'צנצנת תודות', text: 'צנצנת קטנה עם פתקים ריקים: בכל ערב כותבים דבר אחד שמודים עליו. חיבור פשוט לתוכן של התפילה, ומתאים גם לילדים שעוד כותבים לאט.' },
]
const PROGRAM = [
  ['10 דקות', 'קבלת פנים: ההורים מתיישבים, והילדים עולים למקום שלהם.'],
  ['10 דקות', 'שיר פתיחה ודברים קצרים של המחנכת או הרב.'],
  ['10 דקות', 'הילדים מציגים משהו שלמדו: תפילה קצרה, שיר או קטע בקבוצות.'],
  ['10 דקות', 'חלוקת הסידורים: קוראים לכל ילד בשמו, כך שלכל אחד יש רגע משלו.'],
  ['5 דקות', 'ברכת ההורים: כל הורה לוחש לילד שלו ברכה אישית.'],
  ['25 דקות', 'תחנות יצירה ועיצוב המתנה, הורה וילד יחד.'],
  ['15 דקות', 'כיבוד, תמונה כיתתית ושיר סיום.'],
]
const MESSAGES = [
  'מזל טוב לקבלת הסידור! שכל תפילה תמלא את הלב בשמחה.',
  'שיהיו לך תמיד מילים להודות ולבקש.',
  'הסידור הזה ילווה אותך שנים רבות. שתהיה לך דרך טובה ומלאת אור.',
  'אנחנו גאים בך מאוד ביום המיוחד הזה.',
]
const FAQ = [
  { q: 'מה נותנים לילדים במסיבת סידור חוץ מכיפה וסימנייה?', a: 'נרתיק בד לסידור, תיק בד שמעצבים במסיבה, הקדשה אישית מההורים, ספר ברכות כיתתי, תמונת "מודה אני" ליד המיטה, קופת צדקה או תמונה כיתתית במסגרת. מתנה שהילד מכין בעצמו נשמרת לרוב יותר ממוצר קנוי.' },
  { q: 'באיזו כיתה עושים מסיבת סידור?', a: 'זה משתנה בין בתי הספר. בדרך כלל החגיגה נערכת בכיתות הצעירות, ולכן כדאי לשאול את המחנכת מתי היא מתוכננת ולהתחיל להיערך כמה שבועות מראש.' },
  { q: 'מי מארגן את מסיבת הסידור?', a: 'בדרך כלל המחנכת אחראית על התוכן והתפילה, והוועד על המתנה, הכיבוד והקישוט. כדאי להיפגש פעם אחת מראש, לחלק משימות ולקבוע תקציב לילד.' },
  { q: 'איך מדפיסים את הקדשות הסידור?', a: 'כותבים את שמות הילדים, שם בשורה, בוחרים ברכה ולוחצים על "הדפסה". בכל דף A4 יש ארבע הקדשות, אחת לכל ילד. גוזרים ומדביקים בתוך הכריכה.' },
]

function OpenBook({ size = 150 }) {
  return <svg viewBox="0 0 200 120" width={size} height={size * 120 / 200} aria-hidden="true">
    <path d="M100 26 Q70 8 16 16 V102 Q70 94 100 112 Z" fill="#fff" stroke="#2b6cb0" strokeWidth="4" strokeLinejoin="round" />
    <path d="M100 26 Q130 8 184 16 V102 Q130 94 100 112 Z" fill="#fff" stroke="#2b6cb0" strokeWidth="4" strokeLinejoin="round" />
    {[34, 50, 66, 82].map(y => <g key={y} stroke="#90cdf4" strokeWidth="3" strokeLinecap="round">
      <line x1="30" y1={y} x2="86" y2={y + 6} />
      <line x1="114" y1={y + 6} x2="170" y2={y} />
    </g>)}
    <path d="M100 0 L104 9 L114 9 L106 15 L109 25 L100 19 L91 25 L94 15 L86 9 L96 9 Z" fill="#d69e2e" />
  </svg>
}

function Label({ name, msg, from }) {
  return <div style={{ border: '3px double #2b6cb0', borderRadius: 16, padding: '6mm', height: '122mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center', fontFamily: 'Heebo, Arial, sans-serif', color: '#1a202c' }}>
    <OpenBook />
    <div style={{ fontSize: 17 }}>הסידור של</div>
    <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2 }}>{name}</div>
    <div style={{ fontSize: 17, lineHeight: 1.5 }}>{msg}</div>
    <div style={{ fontSize: 17, fontWeight: 700 }}>{from}</div>
  </div>
}

export default function SiddurPartyGift() {
  const [names, setNames] = useState('נועה\nאיתי\nתמר\nיונתן'), [from, setFrom] = useState('באהבה, המשפחה שלך')
  const [pick, setPick] = useState(0), [custom, setCustom] = useState(''), [print, setPrint] = useState(false)
  const msg = custom.trim() || MESSAGES[pick]
  const list = names.split('\n').map(n => n.trim()).filter(Boolean).slice(0, 40)
  const kids = list.length ? list : ['']
  const pages = []
  for (let i = 0; i < kids.length; i += 4) pages.push(kids.slice(i, i + 4))
  const field = 'mt-1 w-full min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-3 text-lg'
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מסיבת סידור: מתנות לילדים חוץ מכיפה וסימנייה, סדר המסיבה והקדשה להדפסה" description="מה לתת לילדים במסיבת סידור: 8 רעיונות למתנה שהיא לא עוד כיפה וסימנייה, סדר מסיבה של כשעה וחצי, והקדשה לסידור להדפסה עם שם כל ילד. בחינם." path="/gifts/siddur-party" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ועד הורים', href: '/vaad' }, { label: 'מסיבת סידור' }]} />
    <header className="mb-6 text-center">
      <h1 className="text-4xl sm:text-5xl">📖 מסיבת סידור: רעיונות למתנה ולמסיבה</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">מתנות לילדים שהן לא עוד כיפה וסימנייה, סדר מסיבה של כשעה וחצי, והקדשה לסידור שמדפיסים עם השם של כל ילד.</p>
    </header>

    <h2 className="mb-3 text-2xl font-black">🎁 8 מתנות שהן לא כיפה וסימנייה</h2>
    <div className="grid gap-3 sm:grid-cols-2">{GIFTS.map(i => <div key={i.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 sketch-shadow">
      <h3 className="text-xl font-bold">{i.emoji} {i.title}</h3>
      <p className="mt-1 text-lg">{i.text}</p>
    </div>)}</div>
    <p className="mt-4 rounded-xl bg-amber-50 p-3 text-lg">⭐ הטיפ: מה שנשאר מהמסיבה הוא החיבור לסידור עצמו. מתנה זולה עם מילים אישיות מההורים שווה יותר ממוצר יקר עם השם של הכיתה.</p>

    <section className="mt-8 rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-4 sketch-shadow">
      <h2 className="mb-3 text-2xl font-black">⏱️ סדר מסיבה של כשעה וחצי</h2>
      <ol className="space-y-2">{PROGRAM.map(([time, text]) => <li key={text} className="flex gap-3 rounded-xl bg-white p-3 text-lg">
        <span className="min-w-[72px] font-bold">{time}</span><span>{text}</span>
      </li>)}</ol>
      <p className="mt-3 text-lg">את התפילה ואת הדברים קובעים עם המחנכת, ומשאירים לוועד את היצירה, הכיבוד והצילום.</p>
    </section>

    <section className="mt-8 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-4 sketch-shadow">
      <h2 className="mb-3 text-2xl font-black">✍️ הקדשה לסידור להדפסה</h2>
      <p className="mb-3 text-lg">כותבים שמות, מדפיסים, גוזרים ומדביקים בתוך הכריכה. בכל דף יש ארבע הקדשות.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="font-bold">שמות הילדים (שם בכל שורה)<textarea className={field + ' min-h-[132px] py-2'} value={names} onChange={e => setNames(e.target.value)} /></label>
        <label className="font-bold">חתימה<input className={field} value={from} maxLength={40} onChange={e => setFrom(e.target.value)} /></label>
      </div>
      <fieldset className="mt-4"><legend className="font-bold">בחרו ברכה</legend>
        <div className="mt-2 space-y-2">{MESSAGES.map((m, i) => <label key={m} className="flex min-h-[44px] cursor-pointer items-start gap-2 rounded-xl bg-white p-3">
          <input type="radio" name="siddur-msg" checked={pick === i && !custom.trim()} onChange={() => { setPick(i); setCustom('') }} className="mt-1" />
          <span className="text-lg">{m}</span>
        </label>)}</div>
      </fieldset>
      <label className="mt-3 block font-bold">או כתבו ברכה משלכם<textarea className={field + ' min-h-[88px] py-2'} value={custom} maxLength={160} onChange={e => setCustom(e.target.value)} /></label>
      <div className="mx-auto mt-4 max-w-sm overflow-hidden rounded-2xl bg-white"><Label name={kids[0]} msg={msg} from={from} /></div>
      <div className="mt-4 text-center"><button type="button" onClick={() => setPrint(true)} className="min-h-[48px] rounded-xl bg-amber-600 px-6 text-lg font-bold text-white">🖨️ הדפסה ({kids.length} הקדשות)</button></div>
    </section>

    {print && <PrintPreview title="הקדשה לסידור" copies={false} onClose={() => setPrint(false)}>{pages.map((page, p) => <article key={p} className="buga-flow" dir="rtl" style={{ padding: '8mm', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6mm', alignContent: 'start' }}>
      {page.map((name, i) => <Label key={i} name={name} msg={msg} from={from} />)}
    </article>)}</PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לוועד: <Link className="font-bold underline" to="/vaad">כל הכלים לוועד הורים</Link> · <Link className="font-bold underline" to="/vaad/budget">תקציב ועד הורים לשנה</Link> · <Link className="font-bold underline" to="/holidays/blessings">ברכות וקריאות לחגים</Link></p>
    <div className="mt-10"><SeoBody paragraphs={['מסיבת סידור היא רגע מיוחד בכיתות הצעירות: הילדים מקבלים סידור משלהם, וההורים מגיעים לחגוג איתם. שתי המתנות שחוזרות כמעט בכל כיתה הן כיפה וסימנייה, ולכן ועדים רבים מחפשים משהו אחר, שקשור לסידור ושיישאר אצל הילד גם אחרי המסיבה.', 'בדף הזה ריכזנו רעיונות למתנה שמתאימים גם לבנים וגם לבנות, סדר מסיבה שאפשר להתאים למחנכת ולכיתה, והקדשה להדפסה. כותבים את שמות הילדים פעם אחת, וכל ילד מקבל הקדשה עם השם שלו להדביק בתוך הסידור.']} faq={FAQ} related={[{ label: 'ועד הורים: כל הכלים', href: '/vaad' }, { label: 'ברכות וקריאות לחגים', href: '/holidays/blessings' }]} /></div>
  </div>
}
