import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import QuickAnswer from '../../components/ui/QuickAnswer'
import SpeechNote from './SpeechNote'
import { Guide, Li } from './languageShared'
import { LANGUAGE_HUB, LANGUAGE_PAGES } from '../../data/speech/language'
import SponsorBanner from '../../components/ui/SponsorBanner'

// /speech/language — hub of the language section: categories, wh-questions, directions and
// sequencing, plus short guidance on language (as opposed to speech-sound) practice.

const MORE = [
  ['🔄', 'הפכים ומילים נרדפות', '/words/opposites'],
  ['👶', 'התפתחות שפה לפי גיל', '/speech/parents/language-milestones'],
  ['🧩', 'לוח תקשורת וכרטיסיות רגשות', '/printables/sensory-communication-cards'],
  ['🎵', 'חרוזים והברות להדפסה', '/printables/rhymes-syllables'],
  ['📚', 'סיפורים לילדים', '/stories'],
  ['✏️', 'דפי עבודה לגן חובה', '/printables/kindergarten-worksheets'],
]

const faq = [
  { q: 'מה ההבדל בין שפה לדיבור?', a: 'דיבור (היגוי) הוא האופן שבו אומרים את הצלילים — למשל ר׳ או ס׳. שפה היא מה שמבינים ומה שאומרים: אוצר מילים, הבנת שאלות והוראות, בניית משפטים וסיפור. ילד יכול לבטא יפה ועדיין להתקשות בשפה, וגם להפך. בעמודים כאן מתרגלים שפה.' },
  { q: 'לאיזה גיל מתאימים העמודים?', a: 'בעיקר לגן (בערך 3–6) ולכיתה א׳, וגם לילדים גדולים יותר בחינוך המיוחד. בכל עמוד יש רמות — מתחילים ממה שקל לילד/ה ומתקדמים בהדרגה.' },
  { q: 'החומרים מחליפים טיפול של קלינאית תקשורת?', a: 'לא. הם נועדו לתרגול ולהעשרה. אם יש דאגה לגבי ההבנה, אוצר המילים או הדיבור של הילד/ה — כדאי לפנות לקלינאי/ת תקשורת להערכה, וגם לבדוק שמיעה.' },
  { q: 'איך מתרגלים שפה בבית?', a: 'בעיקר בשיחה: מספרים יחד מה רואים, שואלים מעט ומקשיבים הרבה, ומרחיבים את מה שהילד/ה אומר/ת. המשחקים והדפים כאן נותנים נושא ומבנה — כמה דקות ביום מספיקות.' },
  { q: 'זה חינם?', a: 'כן — כל העמודים, המשחקים והדפים להדפסה חינמיים, בלי הרשמה.' },
]

export default function LanguageHub() {
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO path={LANGUAGE_HUB}
      title="תרגול שפה לגן: קטגוריות, שאלות, הוראות ורצף"
      description="חומרי שפה לקלינאיות תקשורת, לגננות ולהורים: קטגוריות ו„מה לא שייך”, שאלות מי מה איפה למה, הבנת הוראות וסיפורים ברצף — משחקים ודפים להדפסה, חינם."
      structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'שפה' }]} />
    <h1 className="mb-2 text-center text-4xl font-black sm:text-5xl"><span aria-hidden="true">💬 </span>תרגול שפה לגן ולכיתה א׳</h1>
    <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">אוצר מילים, הבנת שאלות והוראות, ורצף וסיפור — במשחק ובדפים להדפסה</p>
    <QuickAnswer q="אילו תרגילי שפה מתאימים לגן?"
      a="התחומים שכדאי לתרגל: קטגוריות ושיום (מיון, „מה לא שייך”), הבנת שאלות (מי, מה, איפה, מתי, למה), הבנת הוראות בכמה שלבים, רצף וסיפור בתמונות, דקדוק, מילות יחס, תיאור חפצים ושפה חברתית. לכל תחום יש כאן עמוד עם משחק על המסך, הדרכה למבוגר ודפים להדפסה."
      rows={[['תחומים', LANGUAGE_PAGES.map(p => p.title).join(' · ')], ['למי', 'קלינאיות תקשורת, גננות, הורים, חינוך מיוחד'], ['מחיר', 'חינם, בלי הרשמה']]}
      updated="2026-10-24" />
    <SpeechNote />

    <section aria-labelledby="lang-pages" className="mt-8">
      <h2 id="lang-pages" className="mb-4 text-center text-3xl font-black">העמודים</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {LANGUAGE_PAGES.map(p => <Link key={p.id} to={p.path} className="group rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-[0_6px_0_rgba(20,30,60,.10)] transition hover:-translate-y-1 hover:border-slate-500">
          <div className="text-4xl" aria-hidden="true">{p.emoji}</div>
          <h3 className="mt-3 text-xl font-black text-[var(--ink)]">{p.title}</h3>
          <p className="mt-1 leading-7 text-[var(--muted-foreground)]">{p.desc}</p>
        </Link>)}
      </div>
    </section>

    <div className="mx-auto mt-10 max-w-3xl space-y-5">
      <Guide title="איך מתרגלים שפה — עקרונות קצרים">
        <ul className="space-y-1.5">
          <Li><b>משחק ושיחה, לא מבחן.</b> מספרים יחד, שואלים מעט, מקשיבים הרבה.</Li>
          <Li><b>מחכים לתשובה</b> — כמה שניות של שקט נותנות זמן לחשוב.</Li>
          <Li><b>מרחיבים:</b> חוזרים על מה שהילד/ה אמר/ה ומוסיפים מילה או שתיים.</Li>
          <Li><b>מוחשי קודם:</b> חפצים אמיתיים ופעולות אמיתיות, ואחר כך תמונות ודפים.</Li>
          <Li><b>מתקדמים לפי הילד/ה:</b> מתחילים ממה שמצליח בקלות, ומעלים בהדרגה.</Li>
        </ul>
      </Guide>
    </div>

    <section aria-labelledby="lang-more" className="mt-10 rounded-3xl bg-[var(--postit)] p-5">
      <h2 id="lang-more" className="mb-4 text-center text-2xl font-black">עוד באתר שמתאים לתרגול שפה</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {MORE.map(([e, t, href]) => <Link key={href} to={href} className="flex min-h-[52px] items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 font-bold hover:border-slate-500"><span className="text-2xl" aria-hidden="true">{e}</span>{t}</Link>)}
      </div>
    </section>

    <SponsorBanner />

    <div className="mx-auto mt-12 max-w-3xl">
      <SeoBody paragraphs={[
        'שפה היא הרבה יותר מהגייה: זו היכולת להבין מה אומרים לנו, למצוא את המילה הנכונה, לענות על שאלה, לבצע הוראה ולספר סיפור לפי הסדר. אלה המיומנויות שילדים צריכים בגן ובכיתה א׳ — בשיחה, במפגש ובלמידה.',
        'כאן ריכזנו חומרי שפה בעברית, מסודרים לפי תחום: קטגוריות ושיום, שאלות מי מה איפה, הבנת הוראות ורצף וסיפור. בכל עמוד יש משחק לשחק ביחד על המסך, הסבר קצר למבוגר, ודפים להדפסה שאפשר לקחת לגן, לקליניקה או הביתה.',
      ]} faq={faq} related={[
        { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
        ...LANGUAGE_PAGES.map(p => ({ label: p.title, href: p.path })),
        { label: 'זוגות מינימליים', href: '/speech/minimal-pairs' },
      ]} />
    </div>
  </div>
}
