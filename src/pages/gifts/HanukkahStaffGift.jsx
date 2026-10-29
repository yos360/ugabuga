import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'

// /gifts/hanukkah-staff: small, personal Hanukkah gifts for kindergarten and school staff, plus a
// printable thank-you card (two per A4 page) with an editable greeting and a hanukkiah drawn in SVG.
const IDEAS = [
  { emoji: '🕯️', title: 'שמונה תודות לשמונה נרות', text: 'שמונה פתקים קטנים במעטפה אחת, ועל כל אחד תודה על דבר אחר: על החיבוק בבוקר, על הסבלנות, על השירים. אפשר לבקש מכמה ילדים לכתוב או לצייר פתק.' },
  { emoji: '🎨', title: 'חנוכייה מציורי הילדים', text: 'כל ילד מצייר להבה על פס נייר וכותב את שמו. מדביקים את כל הלהבות על חנוכייה גדולה מקרטון, והצוות מקבל חנוכייה שכל הגן האיר.' },
  { emoji: '🫙', title: 'צנצנת של אור קטן', text: 'צנצנת זכוכית עם כמה נרות קטנים ופתק: "תודה שאתן מאירות לנו את הגן כל יום". זול, יפה, ונשאר על השולחן גם אחרי החג.' },
  { emoji: '🫒', title: 'בקבוקון שמן עם תווית אישית', text: 'רמז לנס פך השמן: בקבוק קטן של שמן זית, ועל התווית "תודה על כל טיפה של סבלנות ואהבה".' },
  { emoji: '🪙', title: 'דמי חנוכה לצוות', text: 'שקית מטבעות שוקולד עם כרטיס "גם לכן מגיעים דמי חנוכה". מצחיק, מתוק, ומתאים בדיוק לצד מארז סופגניות.' },
  { emoji: '🎤', title: 'שיר מהילדים', text: 'מקליטים את הילדים שרים שיר חנוכה ושולחים לצוות. אם מכינים גם מתנה, מצרפים קוד QR או קישור בתוך הכרטיס.' },
]
const MESSAGES = [
  'תודה שאתן מאירות לנו את הגן כל יום, ולא רק בחנוכה. חג אורים שמח!',
  'כמו נר קטן שמדליק עוד נר — כך אתם מדליקים בילדים שלנו סקרנות ושמחה. חג שמח ותודה!',
  'נס גדול היה פה: צוות שנותן כל כך הרבה אהבה. תודה מכל הלב וחג חנוכה שמח!',
  'על כל חיבוק, כל שיר וכל רגע של סבלנות — תודה. שיהיה לכן חג מלא אור.',
]
const FAQ = [
  { q: 'מה נותנים לצוות הגן לחנוכה?', a: 'משהו קטן וסמלי עם נגיעה אישית: כרטיס תודה מהילדים, ציורים, צנצנת נרות או בקבוקון שמן עם תווית. הכרטיס האישי הוא מה שנשאר בזיכרון, יותר מהמחיר.' },
  { q: 'כמה כסף להוציא על מתנה לצוות בחנוכה?', a: 'בחנוכה מקובל משהו סמלי. כדאי לקבוע מראש סכום לכל איש צוות בתקציב השנתי של הוועד, ולהשאיר את הסכום הגדול לסוף השנה.' },
  { q: 'צריך לתת לכל אנשי הצוות אותו דבר?', a: 'כן, עדיף. גננת, סייעת וצוות הצהרון — כולם עובדים עם הילדים, וכדאי שכולם יקבלו את אותה מתנה ואותו כרטיס.' },
  { q: 'איך מדפיסים את הכרטיס?', a: 'כותבים למי הכרטיס וממי, בוחרים ברכה ולוחצים על "הדפסה". בכל דף A4 יש שני כרטיסים, וחותכים באמצע.' },
]

function Hanukkiah({ size = 220 }) {
  const xs = [20, 45, 70, 95, 130, 165, 190, 215, 240]
  return <svg viewBox="0 0 260 150" width={size} height={size * 150 / 260} aria-hidden="true">
    <rect x="70" y="138" width="120" height="8" rx="4" fill="#b7791f" />
    <rect x="124" y="98" width="12" height="42" fill="#d69e2e" />
    <path d="M20 70 Q20 110 130 110 Q240 110 240 70" fill="none" stroke="#d69e2e" strokeWidth="6" />
    {xs.map((x, i) => {
      const top = i === 4 ? 30 : 46, t = (x - 20) / 220, armY = 70 + 80 * t * (1 - t)
      return <g key={x}>
        <rect x={x - 5} y={top} width="10" height="26" rx="2" fill={['#63b3ed', '#f6ad55', '#68d391', '#fc8181', '#f6e05e', '#b794f4', '#4fd1c5', '#f687b3', '#90cdf4'][i]} />
        <path d={`M${x} ${top - 16} Q${x + 7} ${top - 6} ${x} ${top - 1} Q${x - 7} ${top - 6} ${x} ${top - 16}Z`} fill="#f6ad55" stroke="#dd6b20" strokeWidth="1.5" />
        <line x1={x} y1={top + 26} x2={x} y2={i === 4 ? 98 : armY} stroke="#d69e2e" strokeWidth="3" />
      </g>
    })}
  </svg>
}

function Card({ to, msg, from }) {
  return <div style={{ border: '3px dashed #d69e2e', borderRadius: 18, padding: '8mm', textAlign: 'center', height: '125mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'Heebo, Arial, sans-serif', color: '#1a202c' }}>
    <Hanukkiah size={230} />
    <div style={{ fontSize: 30, fontWeight: 800 }}>{to}</div>
    <div style={{ fontSize: 20, lineHeight: 1.5, maxWidth: '150mm' }}>{msg}</div>
    <div style={{ fontSize: 20, fontWeight: 700 }}>באהבה, {from}</div>
  </div>
}

export default function HanukkahStaffGift() {
  const [to, setTo] = useState('לצוות הגן היקר'), [from, setFrom] = useState('הילדים וההורים')
  const [pick, setPick] = useState(0), [custom, setCustom] = useState(''), [print, setPrint] = useState(false)
  const msg = custom.trim() || MESSAGES[pick]
  const field = 'mt-1 w-full min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-3 text-lg'
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מתנה לצוות לחנוכה — רעיונות סמליים וכרטיס תודה להדפסה" description="מה לתת לגננת, לסייעת ולמורה בחנוכה: רעיונות למתנה קטנה וסמלית עם נגיעה אישית, וכרטיס תודה לחנוכה להדפסה עם ברכה שבוחרים. בחינם." path="/gifts/hanukkah-staff" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ועד הורים', href: '/vaad' }, { label: 'מתנה לצוות לחנוכה' }]} />
    <header className="mb-6 text-center">
      <h1 className="text-4xl sm:text-5xl">🕎 מתנה לצוות לחנוכה</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">רעיונות למתנה קטנה וסמלית לגננת, לסייעת ולמורה, עם נגיעה אישית מהילדים. ובסוף: כרטיס תודה לחנוכה שמדפיסים בדקה.</p>
    </header>

    <h2 className="mb-3 text-2xl font-black">💡 רעיונות קטנים עם משמעות</h2>
    <div className="grid gap-3 sm:grid-cols-2">{IDEAS.map(i => <div key={i.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 sketch-shadow">
      <h3 className="text-xl font-bold">{i.emoji} {i.title}</h3>
      <p className="mt-1 text-lg">{i.text}</p>
    </div>)}</div>
    <p className="mt-4 rounded-xl bg-amber-50 p-3 text-lg">⭐ הטיפ: מה שהצוות זוכר הוא המילים, לא המחיר. גם מתנה של כמה שקלים מרגשת כשיש איתה כרטיס עם שמות הילדים או ציור.</p>

    <section className="mt-8 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-4 sketch-shadow">
      <h2 className="mb-3 text-2xl font-black">💌 כרטיס תודה לחנוכה להדפסה</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="font-bold">למי<input className={field} value={to} maxLength={40} onChange={e => setTo(e.target.value)} /></label>
        <label className="font-bold">ממי<input className={field} value={from} maxLength={40} onChange={e => setFrom(e.target.value)} /></label>
      </div>
      <fieldset className="mt-4"><legend className="font-bold">בחרו ברכה</legend>
        <div className="mt-2 space-y-2">{MESSAGES.map((m, i) => <label key={i} className="flex min-h-[44px] cursor-pointer items-start gap-2 rounded-xl bg-white p-3">
          <input type="radio" name="msg" checked={pick === i && !custom.trim()} onChange={() => { setPick(i); setCustom('') }} className="mt-1" />
          <span className="text-lg">{m}</span>
        </label>)}</div>
      </fieldset>
      <label className="mt-3 block font-bold">או כתבו ברכה משלכם<textarea className={field + ' min-h-[88px] py-2'} value={custom} maxLength={200} onChange={e => setCustom(e.target.value)} /></label>
      <div className="mt-4 overflow-hidden rounded-2xl bg-white"><Card to={to} msg={msg} from={from} /></div>
      <div className="mt-4 text-center"><button type="button" onClick={() => setPrint(true)} className="min-h-[48px] rounded-xl bg-amber-600 px-6 text-lg font-bold text-white">🖨️ הדפסה (2 כרטיסים בדף)</button></div>
    </section>

    {print && <PrintPreview title="כרטיס תודה לחנוכה" onClose={() => setPrint(false)}><article className="buga-flow" dir="rtl" style={{ padding: '8mm', display: 'flex', flexDirection: 'column', gap: '8mm' }}>
      <Card to={to} msg={msg} from={from} />
      <Card to={to} msg={msg} from={from} />
    </article></PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לוועד: <Link className="font-bold underline" to="/vaad/budget">תקציב ועד הורים לשנה</Link> · <Link className="font-bold underline" to="/holidays/hanukkah">חנוכה לילדים</Link> · <Link className="font-bold underline" to="/gifts/gananet">מתנה לגננת</Link></p>
    <div className="mt-10"><SeoBody paragraphs={['מתנה לצוות לחנוכה לא צריכה להיות גדולה. ברוב הגנים והכיתות נותנים בחנוכה משהו קטן וסמלי, ושומרים את המתנה הגדולה לסוף השנה. מה שהופך מתנה קטנה למרגשת הוא הנגיעה האישית: ציור של הילדים, פתק תודה, או שיר שהקליטו יחד.', 'בדף הזה ריכזנו רעיונות שקשורים לחג עצמו — נרות, שמן, אור ודמי חנוכה — וכרטיס תודה לחנוכה להדפסה. בוחרים ברכה או כותבים אחת משלכם, מדפיסים שני כרטיסים בדף, והילדים יכולים לחתום או לצייר עליהם.']} faq={FAQ} related={[{ label: 'ועד הורים — כל הכלים', href: '/vaad' }, { label: 'דפי צביעה לחנוכה', href: '/holidays/hanukkah/coloring' }]} /></div>
  </div>
}
