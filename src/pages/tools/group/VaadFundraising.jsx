import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'

// /vaad/fundraising: sale-day ideas for raising money toward a graduation party or class trip,
// plus a small calculator: goal, price and cost per item -> how many items to sell.
const IDEAS = [
  { emoji: '☕', title: 'בית קפה באסיפת הורים', when: 'ימי הורים, טקסים ומופעים', effort: 'קל', text: 'שולחן אחד ליד הכניסה: קפה, תה ועוגות ביתיות שהורים אפו. ההורים ממילא מחכים בתור, וזה אחד הדוכנים שהכי נמכרים.' },
  { emoji: '🍩', title: 'דוכן חנוכה', when: 'חנוכה', effort: 'בינוני', text: 'סופגניות או לביבות בהזמנה מראש, בשקית עם מדבקה של השכבה. ההורים מטגנים, והילדים אורזים ומוכרים.' },
  { emoji: '🎭', title: 'משלוחי מנות שהשכבה מכינה', when: 'פורים', effort: 'בינוני', text: 'במקום שכל כיתה תקנה משלוחי מנות בחנות, השכבה המסיימת מכינה ומוכרת אותם לכיתות האחרות ולהורים.' },
  { emoji: '🌱', title: 'עציצים ותבלינים שהילדים שתלו', when: 'ט״ו בשבט ואביב', effort: 'בינוני', text: 'שותלים כמה שבועות לפני בכוסות או בקופסאות שימורים צבועות, ומוכרים עם כרטיס קטן: איך משקים ומתי.' },
  { emoji: '🍞', title: 'חלות ועוגות לשבת ולחג', when: 'לפני שבת או חג', effort: 'בינוני', text: 'טופס הזמנות בקבוצת ההורים עד יום רביעי, איסוף ביום שישי בבוקר. אופים רק מה שהוזמן, ולא נשאר עודף.' },
  { emoji: '📚', title: 'יריד יד שנייה', when: 'כל השנה', effort: 'קל', text: 'כל ילד מביא ספרים, משחקים וצעצועים שכבר לא משחקים בהם. כמעט אין עלות, וגם מפנים מקום בבית.' },
  { emoji: '🎨', title: 'יצירות של הילדים', when: 'לפני ראש השנה ופסח', effort: 'בינוני', text: 'כרטיסי ברכה, סימניות או מגנטים עם ציורים של הילדים. הורים וסבים קונים בשמחה, והעלות נמוכה.' },
  { emoji: '🗓️', title: 'לוח שנה או ספר מתכונים כיתתי', when: 'תחילת השנה האזרחית', effort: 'גבוה', text: 'כל ילד מצייר עמוד או מביא מתכון משפחתי. מדפיסים, ומוכרים למשפחות כמזכרת. דורש הזמנות מראש כדי לדעת כמה להדפיס.' },
  { emoji: '👕', title: 'חולצת מחזור', when: 'לפני סוף השנה', effort: 'גבוה', text: 'הילדים מעצבים יחד את החולצה, ומוסיפים כמה שקלים לכל חולצה לטובת המסיבה. אוספים הזמנות ומידות לפני שמזמינים.' },
  { emoji: '🎬', title: 'ערב סרט בחצר בית הספר', when: 'אביב וסוף השנה', effort: 'גבוה', text: 'מקרן, סדין גדול וכריות. כרטיס כניסה סמלי, ודוכן פופקורן ושתייה. מתאים גם לאחים קטנים.' },
]
const TIPS = [
  'מתאמים קודם עם הנהלת בית הספר: איפה מותר למכור, ובאילו תאריכים.',
  'מחירים עגולים (5, 10, 20 ₪) מקצרים את התור. אפשר לתלות קוד לביט או לפייבוקס ליד הקופה.',
  'הזמנה מראש עדיפה על מלאי: יודעים כמה להכין, ולא נשאר אוכל שלא נמכר.',
  'על כל מאפה ביתי כותבים מה יש בו (אגוזים, בוטנים, חלב), בשביל ילדים עם אלרגיות.',
  'הילדים יכולים לחשב בעצמם מחיר, עלות ורווח. זה שיעור חשבון אמיתי, והם גם מרגישים שזו המסיבה שלהם.',
]
const FAQ = [
  { q: 'מה הכי משתלם למכור בימי מכירה בבית ספר?', a: 'מה שעולה מעט להכין ונמכר מהר: קפה ועוגות באסיפות הורים, מאפים לשבת בהזמנה מראש, יריד יד שנייה ויצירות של הילדים. דוכנים שדורשים הרבה מלאי, כמו חולצות או לוח שנה, משתלמים רק עם הזמנות מראש.' },
  { q: 'כמה צריך למכור כדי להגיע ליעד?', a: 'מחלקים את היעד ברווח מכל פריט (המחיר פחות העלות). המחשבון בדף עושה את זה לבד, ומראה גם כמה פריטים זה לכל ילד בשכבה.' },
  { q: 'מתי כדאי להתחיל לגייס כסף למסיבת סיום?', a: 'כבר בחנוכה. ככה אפשר לפזר כמה ימי מכירה קטנים לאורך השנה, בחנוכה, בפורים ובאביב, ולא להעמיס הכול על החודש האחרון.' },
]
const nis = n => `${Math.round(n).toLocaleString('he-IL')} ₪`

export default function VaadFundraising() {
  const [goal, setGoal] = useState(3000), [price, setPrice] = useState(10), [cost, setCost] = useState(4), [kids, setKids] = useState(60)
  const profit = (Number(price) || 0) - (Number(cost) || 0)
  const units = profit > 0 ? Math.ceil((Number(goal) || 0) / profit) : 0
  const perKid = kids > 0 && units ? Math.ceil(units / kids) : 0
  const num = 'w-full min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-2 text-lg font-bold'
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="רעיונות לימי מכירה וגיוס כסף למסיבת סיום — לוועד ולשכבה" description="10 רעיונות לימי מכירה בבית הספר ובגן לטובת מסיבת סיום או טיול: מה מוכרים, מתי ומה ההשקעה. עם מחשבון: כמה צריך למכור כדי להגיע ליעד." path="/vaad/fundraising" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ועד הורים', href: '/vaad' }, { label: 'ימי מכירה וגיוס כסף' }]} />
    <header className="mb-6 text-center">
      <h1 className="text-4xl sm:text-5xl">🛍️ רעיונות לימי מכירה וגיוס כסף</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">למסיבת סיום, לטיול שנתי או למתנה לבית הספר: מה מוכרים, מתי, וכמה עבודה זה דורש. ובסוף, מחשבון שאומר כמה צריך למכור.</p>
    </header>

    <h2 className="mb-3 text-2xl font-black">💡 10 רעיונות שעובדים</h2>
    <div className="grid gap-3 sm:grid-cols-2">{IDEAS.map(i => <div key={i.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
      <h3 className="text-xl font-black">{i.emoji} {i.title}</h3>
      <p className="mt-1 text-sm font-bold text-[var(--muted-foreground)]">📅 {i.when} · 💪 השקעה: {i.effort}</p>
      <p className="mt-2 text-lg">{i.text}</p>
    </div>)}</div>

    <h2 className="mb-3 mt-8 text-2xl font-black">🧮 כמה צריך למכור?</h2>
    <section className="grid grid-cols-2 gap-3 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-4 sketch-shadow sm:grid-cols-4">
      <label className="font-bold">🎯 יעד (₪)<input type="number" min="0" inputMode="numeric" className={num} value={goal} onChange={e => setGoal(e.target.value)} /></label>
      <label className="font-bold">🏷️ מחיר לפריט<input type="number" min="0" inputMode="numeric" className={num} value={price} onChange={e => setPrice(e.target.value)} /></label>
      <label className="font-bold">🧾 עלות לפריט<input type="number" min="0" inputMode="numeric" className={num} value={cost} onChange={e => setCost(e.target.value)} /></label>
      <label className="font-bold">👧 ילדים בשכבה<input type="number" min="0" inputMode="numeric" className={num} value={kids} onChange={e => setKids(e.target.value)} /></label>
    </section>
    <p className="mt-3 rounded-2xl border-2 border-slate-800 bg-white p-4 text-center text-xl" role="status">
      {profit > 0
        ? <>רווח של <b>{nis(profit)}</b> מכל פריט. כדי להגיע ל־{nis(goal)} צריך למכור <b>{units.toLocaleString('he-IL')} פריטים</b>{perKid ? <>, בערך <b>{perKid}</b> לכל ילד</> : null}.</>
        : <>⚠️ המחיר צריך להיות גבוה מהעלות, אחרת אין רווח.</>}
    </p>

    <h2 className="mb-3 mt-8 text-2xl font-black">✅ טיפים לפני יום המכירה</h2>
    <ul className="list-disc space-y-2 pr-6 text-lg">{TIPS.map(t => <li key={t}>{t}</li>)}</ul>

    <p className="mt-8 text-center text-lg">עוד לוועד: <Link className="font-bold underline" to="/vaad/budget">תקציב ועד לשנה</Link> · <Link className="font-bold underline" to="/tools/bring-list">רשימת מי מביא מה</Link> · <Link className="font-bold underline" to="/vaad">כל הכלים לוועד הורים</Link></p>
    <div className="mt-10"><SeoBody paragraphs={['ימי מכירה הם הדרך הנפוצה לממן מסיבת סיום או טיול בלי לבקש מההורים עוד כסף. הסוד הוא לבחור דוכנים שעולים מעט להכין ונמכרים מהר, ולפזר אותם לאורך השנה: בית קפה באסיפת הורים, דוכן בחנוכה, משלוחי מנות בפורים ויריד יד שנייה באביב.', 'לפני כל יום מכירה כדאי לחשב כמה פריטים צריך למכור כדי להגיע ליעד, ולאסוף הזמנות מראש. כך לא נשאר מלאי, והילדים לומדים בדרך גם קצת חשבון ויזמות.']} faq={FAQ} related={[{ label: 'ועד הורים — כל הכלים', href: '/vaad' }, { label: 'תקציב ועד הורים לשנה', href: '/vaad/budget' }]} /></div>
  </div>
}
