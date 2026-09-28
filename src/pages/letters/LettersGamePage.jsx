import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import LettersGame from '../../components/letters/LettersGame'

const COPY = {
  he: {
    path: '/letters/game',
    title: 'משחק ללימוד אותיות לילדי הגן — חינם',
    desc: 'משחק ללימוד אותיות בעברית לילדי הגן ולכיתה א׳, בחינם ובלי הרשמה: מצאו את האות, באיזו אות מתחילה המילה, ואיך קוראים לאות. עובד בטלפון ובמחשב.',
    h1: '🎮 משחק אותיות לגן',
    sub: 'שלושה משחקים קצרים · 10 שאלות · כוכבים בסוף',
    crumb: 'משחק אותיות',
    body: [
      'משחק האותיות נבנה בשביל ילדים בגיל 4–7: כפתורים גדולים, שאלה אחת בכל פעם ואפשרות לשמוע את האות או את המילה. אין צורך לדעת לקרוא — בשביל זה יש את כפתור הרמקול.',
      'יש שלושה סוגי משחק: "מצאו את האות" לזיהוי צורת האות, "באיזו אות זה מתחיל?" לחיבור בין צליל לאות, ו"איך קוראים לאות?" למי שכבר מכיר את הצורות. אפשר לשחק על כל האותיות או רק על חצי מהן (א–כ או ל–ת).',
      'בין האפשרויות מופיעות בכוונה אותיות שדומות זו לזו — ד׳ ור׳, ה׳ וח׳, ב׳ וכ׳ — כי זה בדיוק המקום שבו ילדים מתבלבלים.',
    ],
    faq: [
      { q: 'לאיזה גיל מתאים משחק האותיות?', a: 'לגן חובה (5–6), להכנה לכיתה א׳ ולכיתה א׳. ילדים צעירים יותר יכולים לשחק ב"מצאו את האות" עם עזרה של מבוגר.' },
      { q: 'המשחק בחינם?', a: 'כן, לגמרי. בלי הרשמה, בלי פרסומות קופצות ובלי הורדה — פותחים בדפדפן ומשחקים.' },
      { q: 'אין קול כשלוחצים על הרמקול — מה עושים?', a: 'הקול מגיע מהמכשיר עצמו. בחלק מהמכשירים צריך להגביר את הווליום או להתקין קול בעברית בהגדרות. המשחק עובד גם בלי קול.' },
    ],
    related: [{ label: 'לימוד אותיות בעברית', href: '/letters' }, { label: 'כרטיסיות אותיות להדפסה', href: '/printables/letter-flashcards' }, { label: 'משחקים לגן', href: '/games/kindergarten' }],
  },
  en: {
    path: '/abc/game',
    title: 'חזרה על אותיות באנגלית — משחק ABC',
    desc: 'משחק חזרה על אותיות באנגלית בחינם: מצאו את האות, התאימו אות גדולה לקטנה, ובאיזו אות מתחילה המילה. לגן, לכיתה א׳ ולתחילת לימודי אנגלית בכיתה ג׳.',
    h1: '🔤 חזרה על אותיות באנגלית',
    sub: 'Find the letter · גדולה וקטנה · אות ראשונה של מילה',
    crumb: 'חזרה על אותיות באנגלית',
    body: [
      'משחק החזרה על אותיות באנגלית עוזר לילדים להכיר את כל ה־ABC: לזהות אות, להתאים בין האות הגדולה לאות הקטנה (A ו־a), ולשמוע באיזו אות מתחילה מילה באנגלית.',
      'המשחק מתאים לגן ולכיתה א׳, וגם לכיתות ג׳–ד׳ שמתחילות ללמוד אנגלית בבית הספר ורוצות לחזור על האותיות. אפשר לשחק על כל האותיות או רק על A–M או N–Z.',
    ],
    faq: [
      { q: 'איך עוזרים לילד לזכור את האותיות באנגלית?', a: 'חוזרים הרבה ובקצרה: 5–10 דקות ביום של משחק, שיר ה־ABC, וכרטיסיות בבית. הכי קשה בדרך כלל האותיות הקטנות b, d, p, q — כדאי להקדיש להן משחק נפרד.' },
      { q: 'המשחק מדבר באנגלית?', a: 'כן — כפתור הרמקול משמיע את האות או את המילה באנגלית, בתנאי שבמכשיר יש קול באנגלית (ברוב המכשירים יש).' },
    ],
    related: [{ label: 'אותיות באנגלית למעבר בעיפרון', href: '/printables/abc-letters' }, { label: 'כרטיסיות ABC להדפסה', href: '/printables/letter-flashcards' }, { label: 'משחק אותיות בעברית', href: '/letters/game' }],
  },
}

export default function LettersGamePage({ lang = 'he' }) {
  const c = COPY[lang]
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title={c.title} description={c.desc} path={c.path} structuredData={faqSchema(c.faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, lang === 'he' ? { label: 'לימוד אותיות', href: '/letters' } : { label: 'דפים להדפסה', href: '/printables' }, { label: c.crumb }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2">{c.h1}</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">{c.sub}</p>
      <LettersGame key={lang} lang={lang} />
      <div className="my-8 flex flex-wrap justify-center gap-3">
        {lang === 'he'
          ? <><Link to="/letters" className="rounded-xl border-2 border-slate-800 bg-white px-4 py-2 font-bold">📚 עמוד לכל אות</Link><Link to="/abc/game" className="rounded-xl border-2 border-slate-800 bg-white px-4 py-2 font-bold">🔤 אותו משחק באנגלית</Link></>
          : <><Link to="/printables/abc-letters" className="rounded-xl border-2 border-slate-800 bg-white px-4 py-2 font-bold">✏️ דפי כתיבה באנגלית</Link><Link to="/letters/game" className="rounded-xl border-2 border-slate-800 bg-white px-4 py-2 font-bold">🇮🇱 אותו משחק בעברית</Link></>}
        <Link to="/printables/letter-flashcards" className="rounded-xl border-2 border-slate-800 bg-white px-4 py-2 font-bold">🃏 כרטיסיות להדפסה</Link>
      </div>
      <SeoBody paragraphs={c.body} faq={c.faq} related={c.related} />
    </div>
  )
}
