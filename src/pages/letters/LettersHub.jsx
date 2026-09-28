import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { HEBREW } from '../../data/letterLearning'

const faq = [
  { q: 'באיזה סדר כדאי ללמד אותיות בעברית?', a: 'אין חובה ללמד לפי סדר הא״ב. הרבה גננות ומורות מתחילות מאותיות שבשם של הילד ובמילים שהוא אוהב, ואז מוסיפות אות־שתיים בשבוע. מה שחשוב הוא לחזור הרבה ובקצרה.' },
  { q: 'מתי ילדים לומדים את כל האותיות?', a: 'רוב הילדים מכירים חלק מהאותיות כבר בגן חובה, ולומדים את כולן — כולל הצליל והכתיבה — במהלך כיתה א׳. הכנה משחקית בקיץ שלפני כיתה א׳ עוזרת מאוד.' },
  { q: 'מה זה כתב דפוס?', a: 'כתב דפוס הוא צורת האותיות המודפסת — כמו בספרים. בכיתה א׳ לומדים קודם לקרוא ולכתוב בדפוס, ורק אחר כך עוברים לכתב יד. כל דפי התרגול כאן בכתב דפוס.' },
  { q: 'איך מתרגלים כתיבת אותיות בבית?', a: 'מתחילים באצבע על השולחן או בחול, עוברים לעיפרון על קווים מקווקווים, ורק בסוף כותבים לבד על השורה. בכל עמוד אות יש דף תרגול להדפסה והדגמה של סדר הכתיבה.' },
]

export default function LettersHub() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="לימוד אותיות בעברית — משחקים, דפי עבודה וכרטיסיות" description="לימוד אותיות בעברית לגן ולכיתה א׳ בחינם: עמוד לכל אות עם איך כותבים אותה בכתב דפוס, מילים ומשחק, משחק אותיות לגן, כרטיסיות ודפי תרגול כתיבה להדפסה." path="/letters" structuredData={faqSchema(faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לימוד אותיות' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-3">🔤 לימוד אותיות בעברית</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">בחרו אות — ותמצאו איך כותבים אותה, מילים, משחק ודף תרגול להדפסה</p>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11 mb-10">
        {HEBREW.map((x, i) => <Link key={x.slug} to={`/letters/${x.slug}`} aria-label={`לימוד האות ${x.l}`}
          className={`wobbly-sm flex aspect-square flex-col items-center justify-center border-2 border-slate-800 bg-white sketch-shadow-sm transition-transform hover:-translate-y-1 ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
          <span className="text-5xl font-bold leading-none font-display">{x.l}</span>
          <span className="text-xl" aria-hidden="true">{x.words[0][1]}</span>
        </Link>)}
      </div>

      <div className="grid gap-5 md:grid-cols-3 mb-12">
        <Link to="/letters/game" className="wobbly border-2 border-[var(--border)] bg-yellow-100 p-5 sketch-shadow hover:-translate-y-1 transition-transform">
          <p className="text-4xl mb-1">🎮</p><h2 className="text-2xl font-bold">משחק אותיות לגן</h2>
          <p className="text-[var(--muted-foreground)]">מצאו את האות, באיזו אות זה מתחיל, ואיך קוראים לאות — חינם, בלי הרשמה.</p>
        </Link>
        <Link to="/printables/letter-flashcards" className="wobbly border-2 border-[var(--border)] bg-pink-100 p-5 sketch-shadow hover:-translate-y-1 transition-transform">
          <p className="text-4xl mb-1">🃏</p><h2 className="text-2xl font-bold">כרטיסיות אותיות להדפסה</h2>
          <p className="text-[var(--muted-foreground)]">א׳–ת׳ עם תמונה ומילה, 8 בדף, בצבע או לצביעה.</p>
        </Link>
        <Link to="/printables/hebrew-letters" className="wobbly border-2 border-[var(--border)] bg-cyan-100 p-5 sketch-shadow hover:-translate-y-1 transition-transform">
          <p className="text-4xl mb-1">✏️</p><h2 className="text-2xl font-bold">תרגול כתיבת אותיות</h2>
          <p className="text-[var(--muted-foreground)]">אותיות דפוס בקווים מקווקווים למעבר בעיפרון — דף לכל אות.</p>
        </Link>
      </div>

      <div className="rounded-3xl border-2 border-dashed border-[var(--border)] bg-white p-5 text-center mb-10">
        <p className="font-display text-xl font-bold mb-2">לומדים גם אנגלית?</p>
        <Link to="/abc/game" className="inline-block rounded-xl border-2 border-slate-800 bg-cyan-100 px-5 py-2 font-bold">🔤 משחק חזרה על אותיות באנגלית ←</Link>
      </div>

      <SeoBody
        paragraphs={[
          'לימוד אותיות בעברית מצליח הכי טוב כשהוא קצר, משחקי וחוזר על עצמו. במקום לשבת שעה מול דף עבודה, עדיף 10 דקות ביום: משחק זיהוי קצר, כמה מילים שמתחילות באות, ודף כתיבה אחד.',
          'לכל אחת מ־22 האותיות יש כאן עמוד משלה: איך כותבים אותה בכתב דפוס צעד אחר צעד, מילים עם תמונות, טיפ להבדיל בינה לבין אותיות דומות (ד׳ ור׳, ה׳ וח׳, ב׳ וכ׳), משחק קצר ודף תרגול להדפסה.',
          'העמודים מתאימים לגן חובה, להכנה לכיתה א׳ ולכיתה א׳ עצמה — להורים, לגננות ולמורות. הכול בחינם ובלי הרשמה.',
        ]}
        faq={faq}
        related={[{ label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }, { label: 'דפי עבודה בחשבון לכיתה א׳', href: '/printables/math-worksheets' }, { label: 'כרטיסיות אותיות להדפסה', href: '/printables/letter-flashcards' }]}
      />
    </div>
  )
}
