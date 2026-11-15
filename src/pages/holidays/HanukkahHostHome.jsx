import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'

// /holidays/hanukkah/host-home: a "בית מארח" (a parent hosting the class at home) for Hanukkah,
// grades 1-3: a 90-minute plan, 6 crafts from household materials, a shopping list scaled by the
// number of kids, and a printable one-page plan for the host.
const PLAN = [
  ['0–10 דק׳', 'מגיעים', 'שולחן עם דפי צביעה לחנוכה וטושים, כדי שמי שמגיע ראשון לא יחכה בלי כלום.'],
  ['10–20 דק׳', 'פותחים יחד', 'יושבים במעגל, כל ילד אומר מה הוא הכי אוהב בחנוכה, ואז חידון חנוכה קצר בעל פה.'],
  ['20–55 דק׳', 'יצירה', 'שתי יצירות, אחת אחרי השנייה. מכינים מראש מגש חומרים לכל ילד, עם השם שלו.'],
  ['55–70 דק׳', 'משחק סביבון', 'כל ילד מסובב את הסביבון שהכין. נ׳ — כלום, ג׳ — לוקחים הכול, ה׳ — חצי, פ׳ — שמים אחד. משחקים על סוכריות או על קלפים.'],
  ['70–85 דק׳', 'סופגניות', 'קישוט סופגניות פשוטות או אוכל של חנוכה. כאן גם מצלמים תמונה קבוצתית.'],
  ['85–90 דק׳', 'נפרדים', 'כל ילד אורז את היצירות שלו בשקית עם השם, וההורים מגיעים לאסוף.'],
]

const CRAFTS = [
  {
    emoji: '🕎', title: 'חנוכייה ממקלות ארטיק ופקקים', time: '20 דק׳', per: 'לכל ילד: 2 מקלות ארטיק, 9 פקקי בקבוקים, נייר צבעוני צהוב וכתום',
    steps: ['מדביקים שני מקלות ארטיק זה ליד זה על קרטון — זה הבסיס.', 'מדביקים עליו 9 פקקים בשורה, ואת הפקק האמצעי (השמש) מגביהים על פקק נוסף.', 'גוזרים 9 להבות מנייר ומדביקים אחת בכל פקק.', 'מקשטים בטושים ובמדבקות.'],
    tip: 'זו חנוכייה לקישוט בלבד, בלי נרות אמיתיים. דבק חם — רק המבוגר מפעיל.',
  },
  {
    emoji: '🌀', title: 'סביבון מקרטון ועיפרון', time: '15 דק׳', per: 'לכל ילד: ריבוע קרטון קשיח של 8×8 ס״מ ועיפרון קצר מחודד',
    steps: ['מותחים שני אלכסונים על הריבוע ומוצאים את המרכז.', 'כותבים את האותיות נ ג ה פ, אחת בכל משולש, וצובעים.', 'המבוגר מנקב חור במרכז, ומשחילים את העיפרון כך שהחוד בולט כ־2 ס״מ מלמטה.', 'מסובבים על שולחן — ובודקים על איזו אות הוא נופל.'],
    tip: 'אם הסביבון מתנדנד, מזיזים את הקרטון למעלה או למטה על העיפרון עד שהוא מסתובב יציב.',
  },
  {
    emoji: '🫙', title: 'פך שמן מגליל נייר', time: '15 דק׳', per: 'לכל ילד: גליל נייר טואלט, דף צבעוני, חוט ניקוי מקטרות או פס נייר',
    steps: ['עוטפים את הגליל בדף צבעוני ומדביקים.', 'סוגרים את הצד התחתון בעיגול קרטון.', 'מדביקים ידית מחוט ניקוי מקטרות או מפס נייר מקופל.', 'מקשטים ומכניסים בפנים מטבעות שוקולד או סוכריות.'],
    tip: 'הפך הוא גם השקית שבה הילד לוקח הביתה את ההפתעה מהבית המארח.',
  },
  {
    emoji: '🏮', title: 'פנס חנוכה מצנצנת', time: '20 דק׳', per: 'לכל ילד: צנצנת קטנה נקייה, ריבועי נייר משי צבעוני, דבק פלסטי מדולל במים, נר לד',
    steps: ['מורחים מכחול של דבק מדולל על חלק קטן מהצנצנת.', 'מדביקים ריבועי נייר משי זה על זה, עד שכל הצנצנת מכוסה.', 'מורחים עוד שכבה דקה של דבק מעל, ומשאירים לייבוש.', 'מכניסים נר לד דולק ומכבים את האור בחדר.'],
    tip: 'רק נר לד, לא נר אמיתי. אם אין זמן לייבוש, הילדים לוקחים את הפנס הביתה בשקית פתוחה.',
  },
  {
    emoji: '✂️', title: 'חנוכייה להדפסה וגזירה', time: '15 דק׳', per: 'לכל ילד: דף מודפס, מספריים, דבק',
    steps: ['מדפיסים מראש את דף החנוכייה לגזירה מהאתר.', 'הילדים צובעים את החנוכייה ואת 9 הנרות.', 'גוזרים ומדביקים על דף צבעוני.', 'בבית מדביקים נר אחד בכל ערב של החג.'],
    tip: 'היצירה הכי שקטה — טובה למי שמסיים מהר או לסוף המפגש.', link: '/holidays/hanukkah/cut-out-hanukkiah',
  },
  {
    emoji: '🍩', title: 'קישוט סופגניות', time: '15 דק׳', per: 'לכל ילד: סופגנייה פשוטה, כפית ממרח, סוכריות צבעוניות או קוקוס, צלחת חד־פעמית',
    steps: ['שמים כל סופגנייה על צלחת עם שם הילד.', 'מורחים מעט ממרח למעלה.', 'מפזרים סוכריות, קוקוס או אבקת סוכר.', 'אוכלים, או אורזים הביתה.'],
    tip: 'שואלים בקבוצת ההורים מראש על אלרגיות, ומכינים חלופה למי שצריך.',
  },
]

// Quantities per child; "per" is how many children one unit serves.
const SHOP = [
  { item: 'מקלות ארטיק', each: 2 },
  { item: 'פקקי בקבוקים (אוספים מראש)', each: 10 },
  { item: 'גלילי נייר טואלט', each: 1 },
  { item: 'ריבועי קרטון קשיח 8×8', each: 1 },
  { item: 'עפרונות קצרים', each: 1 },
  { item: 'צנצנות קטנות', each: 1 },
  { item: 'נרות לד', each: 1 },
  { item: 'סופגניות (ועוד 2 ליתר ביטחון)', each: 1, extra: 2 },
  { item: 'דבק סטיק', per: 3 },
  { item: 'מספריים', per: 2 },
  { item: 'שקיות עם שם לקחת הביתה', each: 1 },
]

const FAQ = [
  { q: 'מה זה בית מארח בחנוכה?', a: 'הורה אחד מהכיתה מזמין קבוצה של ילדים לביתו לפעילות של שעה וחצי בערך: יצירה, משחק ואוכל של חנוכה. כך הילדים נפגשים מחוץ לבית הספר, וכל הורה מארח פעם אחת בשנה.' },
  { q: 'אילו יצירות מתאימות לכיתה ב׳ בבית מארח?', a: 'יצירות שלוקחות 15–20 דקות ומשתמשות בחומרים שיש בבית: חנוכייה ממקלות ארטיק ופקקים, סביבון מקרטון ועיפרון, פך שמן מגליל נייר ופנס מצנצנת עם נר לד. כדאי לבחור שתיים, לא יותר.' },
  { q: 'כמה זמן נמשך מפגש של בית מארח?', a: 'בכיתות א׳–ג׳ שעה וחצי מספיקה. יותר מזה הילדים מתעייפים, וההורים צריכים לחזור לאסוף בשעה ברורה.' },
  { q: 'איך שומרים על בטיחות?', a: 'לא מדליקים נרות אמיתיים ולא מטגנים כשהילדים בבית. דבק חם ומספריים חדים נשארים אצל המבוגר. ושואלים מראש על אלרגיות לפני שמגישים אוכל.' },
]

function Sevivon() {
  return <svg viewBox="0 0 120 140" width="110" height="128" aria-hidden="true">
    <rect x="54" y="4" width="12" height="26" rx="4" fill="#b7791f" />
    <path d="M20 30 H100 V80 L60 132 L20 80 Z" fill="#63b3ed" stroke="#2b6cb0" strokeWidth="4" strokeLinejoin="round" />
    <text x="60" y="72" textAnchor="middle" fontSize="38" fontWeight="800" fill="#fff" fontFamily="Heebo, Arial">נ</text>
    <circle cx="96" cy="20" r="6" fill="#f6e05e" /><circle cx="18" cy="16" r="4" fill="#fc8181" />
  </svg>
}

function Plan({ kids }) {
  return <div style={{ fontFamily: 'Heebo, Arial, sans-serif', color: '#1a202c', fontSize: 15, lineHeight: 1.5 }}>
    <h2 style={{ fontSize: 24, margin: '0 0 6px' }}>🕎 בית מארח לחנוכה — הדף של ההורה המארח</h2>
    <p style={{ margin: '0 0 8px' }}>מספר ילדים: {kids} · משך: שעה וחצי</p>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>{PLAN.map(([t, what, how]) => <tr key={t}>
      <td style={{ border: '1px solid #cbd5e0', padding: 5, whiteSpace: 'nowrap', fontWeight: 700 }}>{t}</td>
      <td style={{ border: '1px solid #cbd5e0', padding: 5, fontWeight: 700 }}>{what}</td>
      <td style={{ border: '1px solid #cbd5e0', padding: 5 }}>{how}</td>
    </tr>)}</tbody></table>
    <h3 style={{ fontSize: 18, margin: '12px 0 4px' }}>🛒 רשימת קניות</h3>
    <ul style={{ columns: 2, margin: 0, paddingInlineStart: 18 }}>{SHOP.map(s => <li key={s.item}>☐ {qty(s, kids)} {s.item}</li>)}</ul>
    <h3 style={{ fontSize: 18, margin: '12px 0 4px' }}>✅ לפני שהילדים מגיעים</h3>
    <ul style={{ margin: 0, paddingInlineStart: 18 }}>
      <li>☐ שאלתי בקבוצה על אלרגיות</li><li>☐ הכנתי מגש חומרים ושקית עם שם לכל ילד</li>
      <li>☐ הדפסתי דפי צביעה וחנוכייה לגזירה</li><li>☐ כיסיתי את השולחן בניילון</li><li>☐ שלחתי להורים שעת איסוף</li>
    </ul>
  </div>
}

function qty(s, kids) { return s.per ? Math.ceil(kids / s.per) : kids * s.each + (s.extra || 0) }

export default function HanukkahHostHome() {
  const [kids, setKids] = useState(8), [print, setPrint] = useState(false)
  const n = Math.min(30, Math.max(1, Number(kids) || 1))
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="בית מארח לחנוכה — יצירות ופעילות לכיתות א׳–ג׳" description="מה עושים בבית מארח בחנוכה: לו״ז לשעה וחצי, 6 יצירות לחנוכה מחומרים שיש בבית (חנוכייה, סביבון, פך שמן ופנס), משחק סביבון, רשימת קניות לפי מספר הילדים ודף להדפסה. בחינם." path="/holidays/hanukkah/host-home" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חנוכה', href: '/holidays/hanukkah' }, { label: 'בית מארח לחנוכה' }]} />
    <header className="mb-6 text-center">
      <Sevivon />
      <h1 className="mt-2 text-4xl sm:text-5xl">בית מארח לחנוכה</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">מארחים את הכיתה? הנה כל המפגש מוכן: לו״ז לשעה וחצי, שש יצירות לחנוכה מחומרים שיש בבית, משחק סביבון ורשימת קניות לפי מספר הילדים. מתאים לכיתות א׳–ג׳.</p>
    </header>

    <h2 className="mb-3 text-2xl font-black">⏱️ הלו״ז: שעה וחצי</h2>
    <div className="space-y-2">{PLAN.map(([t, what, how]) => <div key={t} className="flex gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-3 sketch-shadow">
      <div className="min-w-[88px] font-black text-amber-700">{t}</div>
      <div><div className="text-lg font-bold">{what}</div><p className="text-lg">{how}</p></div>
    </div>)}</div>

    <h2 className="mb-3 mt-8 text-2xl font-black">✂️ שש יצירות לחנוכה — בוחרים שתיים</h2>
    <div className="grid gap-4 sm:grid-cols-2">{CRAFTS.map(c => <section key={c.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 sketch-shadow">
      <h3 className="text-xl font-bold">{c.emoji} {c.title} <span className="text-base font-normal text-[var(--muted-foreground)]">· {c.time}</span></h3>
      <p className="mt-1 rounded-lg bg-slate-50 p-2 text-base">{c.per}</p>
      <ol className="mt-2 list-decimal space-y-1 ps-6 text-lg">{c.steps.map(s => <li key={s}>{s}</li>)}</ol>
      <p className="mt-2 text-base">💡 {c.tip}</p>
      {c.link && <Link className="mt-1 inline-block font-bold underline" to={c.link}>לדף החנוכייה לגזירה ←</Link>}
    </section>)}</div>

    <section className="mt-8 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-4 sketch-shadow">
      <h2 className="mb-3 text-2xl font-black">🛒 רשימת קניות לפי מספר הילדים</h2>
      <label className="font-bold">כמה ילדים מגיעים?
        <input type="number" min="1" max="30" value={kids} onChange={e => setKids(e.target.value)} className="ms-2 min-h-[44px] w-24 rounded-xl border-2 border-slate-300 bg-white px-3 text-lg" />
      </label>
      <ul className="mt-3 grid gap-1 text-lg sm:grid-cols-2">{SHOP.map(s => <li key={s.item}>☐ <b>{qty(s, n)}</b> {s.item}</li>)}</ul>
      <p className="mt-2 text-base">הכמויות מכסות את כל שש היצירות. אם בחרתם רק שתיים, קונים רק מה שצריך להן.</p>
      <div className="mt-4 text-center"><button type="button" onClick={() => setPrint(true)} className="min-h-[48px] rounded-xl bg-amber-600 px-6 text-lg font-bold text-white">🖨️ הדפסת הלו״ז והרשימה</button></div>
    </section>

    <h2 className="mb-3 mt-8 text-2xl font-black">🧡 טיפים להורה המארח</h2>
    <ul className="space-y-2 text-lg">
      <li>⭐ מכינים לכל ילד מגש עם כל החומרים והשם שלו. כך אין ריבים, וכל אחד מתחיל מיד.</li>
      <li>⭐ אין צורך שכל היצירות ייצאו מושלמות. מה שחשוב לילדים הוא שהן שלהם ושהם לוקחים אותן הביתה.</li>
      <li>⭐ בלי נרות אמיתיים ובלי שמן חם כשהילדים בבית. את הסופגניות קונים מוכנות.</li>
      <li>⭐ שולחים בסוף לקבוצת ההורים תמונה אחת של כל הילדים עם היצירות.</li>
    </ul>

    {print && <PrintPreview title="בית מארח לחנוכה" onClose={() => setPrint(false)}><article className="buga-flow" dir="rtl" style={{ padding: '10mm' }}><Plan kids={n} /></article></PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לחנוכה: <Link className="font-bold underline" to="/holidays/hanukkah/coloring">דפי צביעה</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/quiz">חידון חנוכה</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/sevivon">סביבון וירטואלי</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/escape-room">חדר בריחה לחנוכה</Link> · <Link className="font-bold underline" to="/crafts">יצירה מחומרים שיש בבית</Link></p>
    <div className="mt-10"><SeoBody paragraphs={['בית מארח הוא מפגש קטן של ילדי הכיתה בבית של אחד ההורים. בחנוכה זה הזמן המושלם: יש יצירות שמכינים בקלות מחומרים שיש בבית, משחק סביבון שכולם מכירים, וסופגניות. בדף הזה ריכזנו את כל מה שצריך כדי לארח בלי לחץ: לו״ז לשעה וחצי, שש יצירות עם רשימת חומרים והוראות, ורשימת קניות שמתעדכנת לפי מספר הילדים.', 'היצירות מתאימות לכיתות א׳–ג׳, וכל אחת לוקחת 15–20 דקות. כדאי לבחור שתיים, להכין את החומרים מראש בצלחת לכל ילד, ולהשאיר את הדבק החם והמספריים החדים אצל המבוגר. ואת הלו״ז ואת הרשימה אפשר להדפיס בדף אחד ולתלות על המקרר.']} faq={FAQ} related={[{ label: 'חנוכה לילדים', href: '/holidays/hanukkah' }, { label: 'חוברת חנוכה לכיתה ב׳', href: '/booklets/hanukkah-grade-2' }]} /></div>
  </div>
}
