import { Link } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import { VAAD_TYPES } from '../../../utils/rsvpTypes'

// /vaad: everything a class parents' committee needs, in one place — all free, no sign-up.
const TOOLS = [
  ['/secret-friend', '🎁', 'הגרלת חבר סודי', 'כל ילד מקבל קישור אישי ורואה רק את מי שהוגרל לו — לחנוכה, לפורים או לסוף שנה.'],
  ['/thank-you-wall', '💌', 'קיר ברכות לגננת ולמורה', 'כל הורה וילד כותבים ברכה בקישור אחד, והגננת מקבלת קיר מרגש — מתנה שלא עולה כסף.'],
  ['/tools/bring-list', '🧺', 'רשימת מי מביא מה', 'למסיבה או לטיול: כל אחד בוחר מה הוא מביא, בלי כפילויות ובלי שרשורים.'],
  ['/classroom/roster', '📋', 'רשימת הכיתה', 'שומרים פעם אחת את שמות הילדים, וממלאים אותם בכל כלי בלחיצה.'],
]
const FAQ = [
  { q: 'איך גובים כסף לוועד בלי בלגן?', a: 'יוצרים אישור הגעה למסיבה או למתנה, וב„אפשרויות נוספות” כותבים סכום וקישור לביט או לפייבוקס. ההורים רואים את הסכום והקישור, ואתם מסמנים ✓ ליד מי ששילם ורואים כמה נאסף. האתר עצמו לא גובה כסף.' },
  { q: 'איך יודעים איזה הורה עוד לא ענה?', a: 'מדביקים את רשימת הילדים ב„רשימת מוזמנים”. הדף מראה מי עוד לא ענה ומכין הודעת תזכורת מנומסת, שמדביקים בקבוצה.' },
  { q: 'כמה חברי ועד יכולים לנהל אירוע?', a: 'כולם. בוחרים קוד מארגן בן 4 ספרות ומשתפים אותו ביניכם — כל מי שיודע אותו נכנס לניהול מכל טלפון.' },
  { q: 'יש הורים שמעדיפים ערבית או רוסית — אפשר?', a: 'כן. בוחרים שפה לאורחים (עברית, ערבית, רוסית או אנגלית), וכל הורה יכול גם להחליף שפה בעצמו בראש הדף.' },
]
export default function VaadHub() {
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="ועד הורים — כל הכלים לוועד הכיתה והגן, בחינם" description="כלים חינמיים לוועד הורים: אישור הגעה למסיבת כיתה ולטיול עם מעקב תשלומים, מתנה משותפת לגננת, חבר סודי, קיר ברכות ורשימת מי מביא מה." path="/vaad" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'ועד הורים' }]} />
    <header className="mb-8 text-center">
      <h1 className="text-4xl sm:text-5xl">👨‍👩‍👧 ועד הורים — כל הכלים במקום אחד</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">מסיבות, טיולים, מתנה לגננת וגבייה — בלי שרשורים אינסופיים בקבוצת ההורים. הכול בחינם, בלי הרשמה, וכל הורה עונה בלחיצה מהוואטסאפ.</p>
    </header>
    <h2 className="mb-3 text-2xl font-black">✅ אישור הגעה ותשלום לאירועי הכיתה</h2>
    <div className="grid gap-3 sm:grid-cols-2">{VAAD_TYPES.map(t => <Link key={t.slug} to={`/rsvp/${t.slug}`} className="wobbly-sm card-lift border-2 border-[var(--border)] bg-white p-4 text-right">
      <b className="text-xl"><span aria-hidden="true">{t.emoji} </span>{t.name}</b><p className="mt-1 text-[var(--muted-foreground)]">{t.intro.split(':')[0].split('?')[0]}</p>
    </Link>)}</div>
    <p className="mt-3 rounded-xl bg-emerald-50 p-3">💳 <b>גבייה בלי בלגן:</b> בכל אחד מהם אפשר להוסיף דמי השתתפות וקישור לביט, ולסמן ✓ ליד כל מי ששילם — רואים מיד כמה נאסף.</p>
    <h2 className="mb-3 mt-10 text-2xl font-black">🧰 עוד כלים לוועד</h2>
    <div className="grid gap-3 sm:grid-cols-2">{TOOLS.map(([to, emoji, name, desc]) => <Link key={to} to={to} className="wobbly-sm card-lift border-2 border-[var(--border)] bg-white p-4 text-right"><b className="text-xl"><span aria-hidden="true">{emoji} </span>{name}</b><p className="mt-1 text-[var(--muted-foreground)]">{desc}</p></Link>)}</div>
    <div className="mt-12"><SeoBody paragraphs={['ועד הורים הוא עבודה בהתנדבות, ורוב הזמן הולך על תיאומים: מי מגיע, מי שילם, מי מביא מה ומה קונים לגננת. הכלים כאן מרכזים את כל זה בקישורים פשוטים שנשלחים לקבוצת ההורים, כך שכל הורה עונה פעם אחת והוועד רואה תמונה מסודרת.', 'כל הכלים חינמיים, בלי הרשמה ובלי אפליקציה, והנתונים נמחקים אוטומטית אחרי האירוע. אפשר לחלק את העבודה בין חברי הוועד בעזרת קוד מארגן משותף.']} faq={FAQ} related={[{ label: 'אישור הגעה לכל אירוע', href: '/rsvp' }, { label: 'כלים לכיתה ולגן', href: '/classroom' }]} /></div>
  </div>
}
