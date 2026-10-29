import { Link } from 'react-router-dom'

// Extra sections of the Hanukkah hub: what to tell kids by age, where to start (kindergarten / class / home)
// and a plan of one activity per night. Links only to pages that already exist.
const AGES = [
  ['גיל 3–5', 'מספרים בקצרה: פעם היה מקום שנקרא בית המקדש, וצבא גדול רצה שאנשים יפסיקו להיות יהודים. קבוצה קטנה של אמיצים, המכבים, ניצחה — וכשהם חזרו הם הדליקו מנורה. אפשר לספור נרות, לשיר ולהסתכל על הלהבה.'],
  ['גיל 6–8', 'מוסיפים את הנס: מצאו פך קטן עם שמן לכמות של יום אחד, והוא דלק שמונה ימים. שואלים "איך הרגשתם כשמצאו את הפך?" ובוחרים מילה שכל ילד מקשר לחג: אור, אומץ, שמן, ניצחון.'],
  ['גיל 9–12', 'אפשר להבדיל בין שני סיפורים: המאבק של המכבים בשלטון שאסר על מנהגי היהדות, והמסורת על פך השמן שמופיעה בתלמוד. שואלים מה זה אומר להיאבק על הזכות לחיות כמו שבוחרים, ומה אפשר ללמוד מזה היום.'],
]
const WHERE = [
  ['🧸 חנוכה בגן', 'מתחילים בדפי צביעה, בשירים ובתבניות הגזירה — ובסיום מסיבה קטנה עם סביבונים.',
    [['/holidays/hanukkah/coloring', 'דפי צביעה'], ['/holidays/hanukkah/songs', 'שירי חנוכה'], ['/holidays/hanukkah/crafts', 'יצירה לגזירה'], ['/guides/hanukkah-activities-kindergarten', 'פעילויות חנוכה בגן'], ['/booklets/hanukkah', 'חוברת חנוכה להדפסה']]],
  ['🎒 חנוכה בכיתה', 'חידון בקבוצות על המקרן, דפי עבודה ותפזורת לשיעור, ופעילות חקר קצרה על סיפור החג.',
    [['/holidays/hanukkah/quiz', 'חידון חנוכה'], ['/holidays/hanukkah/worksheets', 'דפי עבודה'], ['/holidays/hanukkah/word-search', 'תפזורת חנוכה'], ['/trivia/hanukkah', 'טריוויה חנוכה'], ['/school-holidays/hanukkah', 'חופשת חנוכה']]],
  ['🏠 חנוכה בבית', 'ערב של הדלקה, שירים ומשחק משפחתי: סביבון, חדר בריחה, חידות וציד בבית.',
    [['/holidays/hanukkah/candle-times', 'זמני הדלקה'], ['/holidays/hanukkah/sevivon', 'סביבון וירטואלי'], ['/tools/escape-rooms/hanukkah-oil-jar', 'חדר בריחה: פך השמן'], ['/riddles/hanukkah', 'חידות חנוכה'], ['/treasure-hunt/hanukkah', 'ציד המטמון'], ['/holidays/hanukkah/what-to-do', 'מה עושים בחנוכה']]],
]
// Night 1 and night 8 fall on Fridays and night 2 on Saturday night in 5787, so they get the quiet, no-screen ideas.
const NIGHTS = [
  ['יום שישי 4.12', 'מדליקים לפני נרות שבת. ערב שקט: ברכות ושירה.', '/holidays/blessings/hanukkah', 'ברכות ההדלקה'],
  ['מוצאי שבת 5.12', 'אחרי צאת השבת מדליקים ופותחים בסיבוב סביבון.', '/holidays/hanukkah/sevivon', 'סביבון וירטואלי'],
  ['יום ראשון 6.12', 'דף צביעה ליד השולחן, לפני או אחרי ההדלקה.', '/holidays/hanukkah/coloring', 'דפי צביעה'],
  ['יום שני 7.12', 'חידון משפחתי: שתי קבוצות ונקודה על כל תשובה.', '/holidays/hanukkah/quiz', 'חידון חנוכה'],
  ['יום שלישי 8.12', 'מכינים סביבון מנייר וחנוכייה לגזירה.', '/holidays/hanukkah/crafts', 'יצירה לגזירה'],
  ['יום רביעי 9.12', 'משחק קבוצתי: מצילים את פך השמן.', '/tools/escape-rooms/hanukkah-oil-jar', 'חדר בריחה'],
  ['יום חמישי 10.12', 'תפזורת וחידות, או ציד מטמון בין החדרים.', '/holidays/hanukkah/word-search', 'תפזורת חנוכה'],
  ['יום שישי 11.12', 'הנר השמיני: מדליקים לפני שבת ושרים "מעוז צור".', '/holidays/hanukkah/songs', 'שירי חנוכה'],
]

export default function HanukkahPlan() {
  return <>
    <section className="mb-10" aria-labelledby="hk-kids">
      <h2 id="hk-kids" className="text-2xl font-bold">מה מספרים לילדים — לפי גיל</h2>
      <p className="mt-2">חנוכה הוא חג של אור, אומץ ונס. סיפור אחד לא מתאים לכולם, ולכן הנה שלוש דרכים לספר אותו.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">{AGES.map(([age, text]) => <div key={age} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4"><b className="block text-lg">{age}</b><p className="mt-1 text-sm leading-relaxed">{text}</p></div>)}</div>
    </section>

    <section className="mb-10" aria-labelledby="hk-where">
      <h2 id="hk-where" className="text-2xl font-bold">איפה חוגגים? מתחילים מכאן</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">{WHERE.map(([title, text, links]) => <div key={title} className="rounded-2xl border-2 border-[var(--border)] bg-blue-50 p-4">
        <h3 className="text-xl font-bold">{title}</h3><p className="mt-1 text-sm">{text}</p>
        <ul className="mt-2 space-y-1 text-sm">{links.map(([to, label]) => <li key={to}><Link to={to} className="font-bold underline">{label}</Link></li>)}</ul>
      </div>)}</div>
    </section>

    <section className="mb-10" aria-labelledby="hk-nights">
      <h2 id="hk-nights" className="text-2xl font-bold">🕯️ שמונה לילות, שמונה פעילויות</h2>
      <p className="mt-2">בחנוכה תשפ״ז הלילה הראשון והשמיני חלים ביום שישי, והלילה השני במוצאי שבת. לכן בלילות האלה הצענו פעילות שקטה או משחק שמתחיל רק אחרי צאת השבת.</p>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2">{NIGHTS.map(([when, what, to, label], i) => <li key={when} className="flex gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--postit)] p-3">
        <span className="text-3xl font-black" aria-hidden="true">{i + 1}</span>
        <span><b>נר {i + 1} · {when}</b><span className="block text-sm">{what}</span><Link to={to} className="text-sm font-bold underline">{label} ←</Link></span>
      </li>)}</ol>
    </section>
  </>
}
