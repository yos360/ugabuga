import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import QuickAnswer from '../../components/ui/QuickAnswer'
import { PLANNED_SOUNDS, SOUNDS } from '../../data/speech/sounds'
import SpeechNote from './SpeechNote'
import { LANGUAGE_HUB, LANGUAGE_PAGES } from '../../data/speech/language'
import BuyingGuideLink from '../../components/ui/BuyingGuideLink'

// /speech — hub of the speech-therapy practice category: sounds (from the registry), tools,
// information for parents, and existing site pages for phonological awareness and communication.

const TOOLS = [
  ['🃏', 'מחולל כרטיסיות היגוי', 'בוחרים צליל, מיקום ורמה ומקבלים כרטיסיות, בינגו, לוטו, זיכרון וטבלת תרגול בבית — להדפסה.', '/speech/card-maker'],
  ['💬', 'לוחות תקשורת תת״ח', 'לוח מילות ליבה ולוחות נושא בעברית, לוח מדבר במסך, ולהדפסה: A4, A3, כרטיסים, קודם–אחר כך ולוח בחירה.', '/speech/aac'],
  ['📋', 'דפי עבודה לקלינאית', 'יומן תרגול בבית, מכתב להורים עם המילים של השבוע, טבלת נתונים, סיכום פגישה, תעודות ולוח מדבקות — להדפסה.', '/speech/tools/practice-sheets'],
  ['⚖️', 'זוגות מינימליים', 'זוגות מילים שנבדלות בצליל אחד (כמו כף/תף), לפי תהליכים פונולוגיים — לשמוע, לשחק ולהדפיס.', '/speech/minimal-pairs'],
]
const PARENTS = [
  ['👶', 'התפתחות שפה לפי גיל', 'מה בדרך כלל קורה בכל גיל מלידה ועד 6, ומתי כדאי להתייעץ עם קלינאי/ת תקשורת.', '/speech/parents/language-milestones'],
  ['🗓️', 'באיזה גיל רוכשים כל צליל?', 'טבלת טווחים לרכישת הצלילים בעברית — ולמה זה טווח ולא גיל מדויק.', '/speech/parents/sound-acquisition'],
  ['💬', 'גמגום אצל ילדים', 'מה נורמלי בגיל הגן, מתי לפנות לקלינאית, איך לעזור בבית ובגן — וטיפים להדפסה להורים ולגננת.', '/speech/parents/stuttering'],
]
const AWARENESS = [
  ['👂', 'צליל פותח וצליל סוגר — משחק ודפים', '/letters/sounds'],
  ['🔤', 'צליל פותח וסוגר — 12 דפים להדפסה', '/printables/opening-ending-sounds'],
  ['🎵', 'חרוזים והברות להדפסה', '/printables/rhymes-syllables'],
  ['✏️', 'דפי עבודה לגן חובה — צלילים, חרוזים והברות', '/printables/kindergarten-worksheets'],
]

const faq = [
  { q: 'למי מיועדים החומרים?', a: 'לקלינאיות וקלינאי תקשורת שמחפשים חומרי תרגול מוכנים לפגישה ולשיעורי בית, ולהורים שהקלינאית ביקשה מהם לתרגל בבית. גם גננות וצוותי חינוך מיוחד משתמשים בכרטיסיות ובמשחקים.' },
  { q: 'החומרים מחליפים טיפול?', a: 'לא. אלה חומרי תרגול והעשרה בלבד. אם יש דאגה לגבי הדיבור או השפה של ילד/ה, כדאי לפנות לקלינאי/ת תקשורת להערכה, וגם לבדוק שמיעה.' },
  { q: 'איך המילים מסודרות?', a: 'לפי הצליל ולא לפי האות: מילה נכנסת לרשימה לפי איך שהיא נשמעת. למשל "שׂמלה" נמצאת בצליל ס׳, כי השין השמאלית נשמעת ס׳. בכל צליל יש מילים בתחילת המילה, באמצע ובסוף, צירופי עיצורים, הברות, משפטים וסיפור.' },
  { q: 'יש כאן בדיקת הגייה או הקלטה?', a: 'לא. אין הקלטה של ילדים ואין "ציון הגייה" אוטומטי — בדיקה כזו אינה אמינה. אפשר לשמוע כל מילה, ולתרגל עם מונה חזרות שסופר ניסיונות בלבד.' },
  { q: 'אילו צלילים יש?', a: (() => { const left = PLANNED_SOUNDS.filter(p => !SOUNDS.some(s => s.id === p.id)).map(p => p.label); return `${SOUNDS.map(s => s.label).join(', ')}.${left.length ? ` בהמשך יתווספו ${left.join(', ')}.` : ' לכל צליל יש מילים בתחילת, באמצע ובסוף המילה, עם תמונות.'}` })() },
  { q: 'זה חינם?', a: 'כן — כל העמודים, הכרטיסיות והמשחקים חינמיים, בלי הרשמה, לבית, לגן ולקליניקה.' },
]

const Card = ([emoji, title, desc, href]) => <Link key={href} to={href} className="group rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-[0_6px_0_rgba(20,30,60,.10)] transition hover:-translate-y-1 hover:border-slate-500">
  <div className="text-4xl" aria-hidden="true">{emoji}</div>
  <h3 className="mt-3 text-xl font-black text-[var(--ink)]">{title}</h3>
  <p className="mt-1 leading-7 text-[var(--muted-foreground)]">{desc}</p>
</Link>

export default function SpeechHub() {
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="קלינאות תקשורת: חומרים לתרגול היגוי ושפה להדפסה" description="חומרים לקלינאית תקשורת ולהורים: מילים לפי צליל ומיקום עם שמע, כרטיסיות היגוי, בינגו ולוטו להדפסה, זוגות מינימליים ומידע על התפתחות שפה. חינם, בלי הרשמה." path="/speech" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת' }]} />
    <h1 className="mb-2 text-center text-4xl font-black sm:text-5xl"><span aria-hidden="true">🗣️ </span>קלינאות תקשורת: חומרים לתרגול היגוי ושפה</h1>
    <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">לקלינאיות, להורים ולגננות — לתרגל בבית, בגן ובטיפול</p>
    <QuickAnswer q="איפה מוצאים חומרים לקלינאית תקשורת בעברית?"
      a="כאן: לכל צליל יש עמוד עם מילים בתחילת המילה, באמצע ובסוף, צירופים, הברות, משפטים וסיפור — עם שמע ומצב תרגול — ודפי עבודה להדפסה: כרטיסיות עם תמונות, בינגו, לוטו, זיכרון וטבלת תרגול בבית. המחולל משלב כמה צלילים באותו דף."
      rows={[['צלילים', SOUNDS.map(s => s.label).join(', ')], ['כלים', 'מחולל כרטיסיות, זוגות מינימליים, לוחות תקשורת תת״ח, דפי מעקב ותעודות'], ['שפה', 'קטגוריות, שאלות מי/מה/איפה, הוראות, רצף וסיפור'], ['להורים', 'התפתחות שפה לפי גיל, גיל רכישת הצלילים'], ['מחיר', 'חינם, בלי הרשמה']]}
      updated="2026-10-24" />
    <SpeechNote />

    <section aria-labelledby="sp-sounds" className="mt-10">
      <h2 id="sp-sounds" className="mb-2 text-center text-3xl font-black">🔤 תרגול היגוי לפי צליל</h2>
      <p className="mb-4 text-center text-[var(--muted-foreground)]">מילים לפי מיקום עם שמע, מצב תרגול עם מונה חזרות, סיפור ודפים להדפסה</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
        {PLANNED_SOUNDS.map(p => {
          const s = SOUNDS.find(x => x.id === p.id)
          return s
            ? <Link key={p.id} to={s.path} className="flex flex-col items-center rounded-2xl border-2 border-slate-800 bg-[var(--yellow)] p-3 text-center shadow-[0_4px_0_rgba(20,30,60,.15)] transition hover:-translate-y-1" aria-label={`תרגול הצליל ${p.label}`}>
              <span className="text-4xl font-black leading-tight">{p.sound}</span><span className="mt-1 text-sm font-bold">{p.label}</span>
            </Link>
            : <div key={p.id} className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 text-center text-slate-400" aria-label={`הצליל ${p.label} — בקרוב`}>
              <span className="text-4xl font-black leading-tight">{p.sound}</span><span className="mt-1 text-xs font-bold">בקרוב</span>
            </div>
        })}
      </div>
    </section>

    <section aria-labelledby="sp-tools" className="mt-10">
      <h2 id="sp-tools" className="mb-4 text-center text-3xl font-black">🧰 כלים לקלינאית</h2>
      <div className="grid gap-4 sm:grid-cols-2">{TOOLS.map(Card)}</div>
    </section>

    <section aria-labelledby="sp-language" className="mt-10">
      <h2 id="sp-language" className="mb-2 text-center text-3xl font-black">💬 שפה</h2>
      <p className="mb-4 text-center text-[var(--muted-foreground)]">אוצר מילים, הבנת שאלות והוראות, ורצף וסיפור — <Link to={LANGUAGE_HUB} className="font-bold underline">כל עמודי השפה</Link></p>
      <div className="grid gap-4 sm:grid-cols-2">{LANGUAGE_PAGES.map(p => Card([p.emoji, p.title, p.desc, p.path]))}</div>
    </section>

    <section aria-labelledby="sp-parents" className="mt-10">
      <h2 id="sp-parents" className="mb-4 text-center text-3xl font-black">👨‍👩‍👧 להורים</h2>
      <div className="grid gap-4 sm:grid-cols-2">{PARENTS.map(Card)}</div>
    </section>

    <section aria-labelledby="sp-aware" className="mt-10 rounded-3xl bg-[var(--postit)] p-5">
      <h2 id="sp-aware" className="mb-2 text-center text-3xl font-black">🎧 מודעות פונולוגית ותקשורת</h2>
      <p className="mb-4 text-center text-[var(--muted-foreground)]">דפים קיימים באתר שמתאימים לעבודה על שמיעת צלילים, חרוזים והברות — ולוחות תקשורת</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {[...AWARENESS, ['🧩', 'לוח תקשורת, רגשות וסדר יום — כרטיסיות להדפסה', '/printables/sensory-communication-cards']].map(([e, t, href]) =>
          <Link key={href} to={href} className="flex min-h-[52px] items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 font-bold hover:border-slate-500"><span className="text-2xl" aria-hidden="true">{e}</span>{t}</Link>)}
      </div>
    </section>

    <section className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-2xl font-bold">איך משתמשים — בקצרה</h2>
      <ul className="space-y-1.5 leading-relaxed">
        <li className="mr-5 list-disc"><b>לקלינאיות:</b> בוחרים צליל, מיקום ורמה לפי מטרת הטיפול, מדפיסים משחק לפגישה, ושולחים הביתה טבלת תרגול עם המילים של השבוע.</li>
        <li className="mr-5 list-disc"><b>להורים:</b> מתרגלים מה שהקלינאית המליצה — 5–10 דקות ביום, במשחק. אומרים את המילה נכון בעצמכם ולא מבקשים "תגיד נכון".</li>
        <li className="mr-5 list-disc">מתקדמים בהדרגה: הברה ← מילה ← צירוף ← משפט ← סיפור ושיחה.</li>
        <li className="mr-5 list-disc">ר׳ מתגלגלת, ח׳ וע׳ לועיות הן מבטא לגיטימי — לא שגיאה.</li>
        <li className="mr-5 list-disc">תרגילי נשיפה ותרגילי לשון "בלי דיבור" לא הוכחו כמשפרים היגוי. מה שעוזר הוא תרגול הצליל עצמו.</li>
      </ul>
    </section>


    <BuyingGuideLink id="speech" />
    <div className="mx-auto mt-12 max-w-3xl">
      <SeoBody paragraphs={[
        'בעברית יש מעט חומרי היגוי חינמיים ומסודרים לפי צליל. כאן כל צליל מקבל עמוד משלו: רשימות מילים שנבדקו לפי ההגייה ולא רק לפי האות, תמונות, שמע לכל מילה, ודפים להדפסה שאפשר להתאים לכל ילד.',
        'החומרים נבנו כדי לחסוך זמן לקלינאיות ולתת להורים דרך פשוטה לתרגל בבית בין הפגישות — תמיד לפי ההנחיות של הקלינאית שמכירה את הילד.',
      ]} faq={faq} related={[
        { label: 'תרגול האות ר׳', href: '/speech/sounds/r' },
        { label: 'מילים עם ס׳', href: '/speech/sounds/s' },
        { label: 'מחולל כרטיסיות היגוי', href: '/speech/card-maker' },
        { label: 'פעילויות לפעוטות', href: '/toddlers' },
        { label: 'משחקים לגן', href: '/games/kindergarten' },
      ]} />
    </div>
  </div>
}
