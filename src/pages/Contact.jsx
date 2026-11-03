import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'

// Contact page: every way to reach the site, with what each one is best for.
const EMAIL = 'hellohugabuga@gmail.com'
const WHATSAPP = 'https://wa.me/972507772930'

const TOPICS = [
  ['✏️', 'מצאתם טעות?', 'כתבו לנו את כתובת הדף ומה צריך לתקן. בדרך כלל מתקנים באותו יום.'],
  ['💡', 'רעיון לדף או למשחק', 'חסר לכם דף עבודה, נושא או משחק? ספרו לנו מה, ולאיזה גיל או כיתה.'],
  ['🎪', 'ספקים לימי הולדת', 'רוצים כרטיס ספק באתר? אפשר להצטרף לבד, או לכתוב לנו ונעזור.'],
  ['📣', 'פרסום ושיתופי פעולה', 'פרטים על פרסום מסומן ומותאם באתר נמצאים בעמוד הפרסום.'],
]

export default function Contact() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': 'צור קשר — עוגה בוגה',
    'url': 'https://ugabuga.co.il/contact',
    'inLanguage': 'he',
    'mainEntity': { '@type': 'Organization', '@id': 'https://ugabuga.co.il/#organization', 'name': 'עוגה בוגה', 'url': 'https://ugabuga.co.il', 'email': EMAIL, 'contactPoint': { '@type': 'ContactPoint', 'contactType': 'customer support', 'email': EMAIL, 'availableLanguage': ['he', 'en'] } },
  }
  return <div className="mx-auto max-w-4xl px-4 py-8">
    <SEO title="צור קשר — עוגה בוגה" description="איך פונים לעוגה בוגה: מייל ווואטסאפ לתיקון טעויות, רעיונות לדפים ולמשחקים, הצטרפות ספקים ופרסום. עונים בדרך כלל באותו יום." path="/contact" structuredData={schema} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'צור קשר' }]} />
    <h1 className="mt-4 text-4xl font-black sm:text-5xl">צור קשר</h1>
    <p className="mt-3 text-lg leading-relaxed">עוגה בוגה הוא אתר ישראלי עצמאי. מאחורי כל הודעה יש אדם שקורא אותה, ובדרך כלל עונים באותו יום.</p>

    <section className="mt-8 grid gap-4 sm:grid-cols-2">
      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-3xl bg-[#25D366] p-6 text-white">
        <span className="text-4xl" aria-hidden="true">💬</span><span><b className="block text-xl">וואטסאפ</b><span className="opacity-90">הדרך המהירה ביותר</span></span>
      </a>
      <a href={`mailto:${EMAIL}`} className="flex items-center gap-4 rounded-3xl border-2 border-slate-200 bg-white p-6">
        <span className="text-4xl" aria-hidden="true">📧</span><span className="min-w-0"><b className="block text-xl">מייל</b><span className="block truncate text-slate-600" dir="ltr">{EMAIL}</span></span>
      </a>
    </section>

    <section className="mt-10">
      <h2 className="text-3xl font-black">על מה אפשר לכתוב לנו?</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{TOPICS.map(([emoji, title, desc]) =>
        <div key={title} className="rounded-3xl bg-white p-5 shadow-sm"><h3 className="text-xl font-black"><span aria-hidden="true">{emoji}</span> {title}</h3><p className="mt-2 leading-relaxed text-slate-700">{desc}</p></div>)}</div>
    </section>

    <section className="mt-10 rounded-3xl bg-[#fff8e1] p-6 leading-relaxed">
      <h2 className="text-2xl font-black">ילדים כותבים לנו?</h2>
      <p className="mt-2">אנחנו שמחים לשמוע מכם, אבל בבקשה לבקש מהורה או ממורה לשלוח את ההודעה. אל תשלחו לנו שם מלא, כתובת, טלפון או תמונה.</p>
    </section>

    <p className="mt-10 text-slate-700">עוד באתר: <Link to="/about" className="font-bold underline">אודות</Link> · <Link to="/editorial-policy" className="font-bold underline">איך אנחנו כותבים ובודקים</Link> · <Link to="/advertise" className="font-bold underline">פרסום באתר</Link> · <Link to="/privacy" className="font-bold underline">פרטיות</Link></p>
  </div>
}
