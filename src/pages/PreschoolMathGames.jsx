import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import PrintPreview from '../components/ui/PrintPreview'

// Hands-on math games for ages 3–4 (a kindergarten teacher's request): counting, digit
// recognition, comparing and early "conservation of quantity" play. Each game lists the
// materials, how to play and what it practises; the print gives digit + dot cards 1–10.
const SKILLS = { count: 'ספירה', digit: 'זיהוי ספרות', same: 'שימור כמות', compare: 'יותר ופחות' }
const GAMES = [
  { e: '🐸', n: 'כמה קפיצות?', s: ['digit', 'count'], m: 'כרטיסי ספרות 1–5 (בהדפסה למטה)', h: 'מרימים כרטיס, הילדים אומרים את הספרה וקופצים כמו צפרדעים בדיוק כמה פעמים. סופרים יחד בקול על כל קפיצה.', t: 'אפשר להחליף קפיצות במחיאות כף, בטפיחות על הברכיים או בצעדי פיל.' },
  { e: '🥚', n: 'בית לכל פקק', s: ['digit', 'count'], m: 'תבנית ביצים או 5 כוסות, מדבקות עם ספרות, פקקים', h: 'על כל גומה מדביקים ספרה. הילד שם בכל גומה בדיוק כמה פקקים שהספרה אומרת, ואז סופרים יחד ובודקים.', t: 'מתחילים ב־1–3 ומוסיפים 4 ו־5 רק כשזה כבר קל.' },
  { e: '🔘', n: 'אותה כמות, שורה אחרת', s: ['same', 'compare'], m: '8 כפתורים או פקקים בשני צבעים', h: 'מסדרים שתי שורות של 4 זו מול זו, ושואלים: "יש אותו דבר?" אחר כך מרווחים שורה אחת שתהיה ארוכה יותר ושואלים שוב. סופרים יחד ומגלים שעדיין יש 4 בכל שורה.', t: 'בגיל 3–4 רוב הילדים יגידו שבשורה הארוכה יש יותר — זה טבעי. לא מתקנים, סופרים יחד.' },
  { e: '🟡', n: 'נחש הבצק', s: ['same'], m: 'שני כדורי בצק משחק באותו גודל', h: 'מראים שהכדורים שווים. מגלגלים כדור אחד לנחש ארוך ושואלים: "איפה יש יותר בצק?" ואז מגלגלים את הנחש בחזרה לכדור ומשווים.', t: 'השאלה "איך אפשר לבדוק?" חשובה יותר מהתשובה.' },
  { e: '🥤', n: 'מים בכוסות', s: ['same', 'compare'], m: 'כוס צרה וגבוהה, כוס רחבה ונמוכה, שתי כוסות זהות, מים', h: 'ממלאים שתי כוסות זהות באותה כמות מים. שופכים אחת לכוס הגבוהה ושואלים איפה יותר. מחזירים לכוס המקורית ובודקים יחד.', t: 'עדיף בחצר או ליד הכיור, עם מגבת קרובה.' },
  { e: '🎣', n: 'דייג ספרות', s: ['digit', 'count'], m: 'דגים מנייר עם ספרות, אטב על כל דג, מקל עם חוט ומגנט', h: 'כל ילד "דג" דג, אומר את הספרה שעליו ומניח לידו את אותו מספר אבנים או קוביות.', t: 'לילדים צעירים — דגים עם נקודות במקום ספרות.' },
  { e: '👀', n: 'מבט של רגע', s: ['count', 'digit'], m: 'כרטיסי נקודות 1–5 (בהדפסה)', h: 'מראים כרטיס נקודות לשתי שניות ומסתירים. "כמה ראיתם?" אחר כך מראים שוב וסופרים. כך הילדים לומדים לזהות כמות קטנה במבט, בלי לספור.', t: 'כדאי להתחיל בכרטיסים של 1, 2 ו־3.' },
  { e: '🍎', n: 'השוק של הגן', s: ['count'], m: 'פירות מפלסטיק או תמונות, סלסלות', h: 'ילד אחד מוכר וילד אחד קונה: "תן לי 3 תפוחים, בבקשה." המוכר סופר ומכניס לסל, והקונה סופר שוב לבדוק.', t: 'משחק מעולה לאחד־לאחד: נוגעים בכל פרי פעם אחת בלבד.' },
  { e: '🏖️', n: 'ספרה בחול', s: ['digit'], m: 'מגש עם חול, מלח או סולת, כרטיסי ספרות', h: 'מניחים כרטיס ליד המגש. הילד מעביר את האצבע על הספרה בכרטיס ואז מצייר אותה במגש. מנערים ומתחילים מחדש.', t: 'זה הכנה לכתיבה — לא מצפים שהספרה תצא מושלמת.' },
  { e: '⚖️', n: 'איפה יותר?', s: ['compare', 'count'], m: 'שתי ערימות של חפצים קטנים', h: 'מניחים שתי ערימות ושואלים איפה יותר ואיפה פחות. בודקים בעזרת זוגות: לוקחים אחד מכל ערימה, ומה שנשאר בלי זוג — שם היה יותר.', t: 'מילים לחזור עליהן: יותר, פחות, שווה, אותו דבר.' },
  { e: '🎲', n: 'מרוץ קובייה', s: ['count'], m: 'קובייה גדולה (אפשר רק עם 1–3 נקודות), מסלול מסומן על הרצפה', h: 'זורקים קובייה, סופרים את הנקודות וצועדים מספר צעדים במסלול. מי שמגיע לסוף — מוחא כפיים לכולם.', t: 'לגיל 3 מכסים בקובייה את 4, 5 ו־6 ומשאירים רק 1–3.' },
  { e: '🧩', n: 'זיכרון ספרה וכמות', s: ['digit', 'count'], m: 'כרטיסי ספרות וכרטיסי נקודות מההדפסה', h: 'הופכים את הכרטיסים. כל ילד בתורו הופך שניים ומחפש זוג: ספרה וכרטיס נקודות עם אותה כמות.', t: 'מתחילים עם 3 זוגות בלבד, גלויים, ורק אחר כך הפוכים.' },
]

// Dot layouts on a 3×3 grid (0..8), like a die; 6–10 use two grids.
const DOTS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8] }
function Dots({ n, size = 90, color = '#e11d48' }) {
  const grids = n <= 5 ? [n] : [5, n - 5]
  return <span style={{ display: 'inline-flex', gap: 6 }} aria-label={`${n} נקודות`} role="img">{grids.map((g, k) => <svg key={k} width={size} height={size} viewBox="0 0 90 90">
    <rect x="2" y="2" width="86" height="86" rx="12" fill="#fff" stroke="#334155" strokeWidth="3" />
    {DOTS[g].map(i => <circle key={i} cx={18 + (i % 3) * 27} cy={18 + Math.floor(i / 3) * 27} r="10" fill={color} />)}
  </svg>)}</span>
}

const FAQ = [
  { q: 'מה זה שימור כמות?', a: 'ההבנה שכמות לא משתנה כשרק מזיזים או מסדרים אחרת: 4 כפתורים הם 4 גם כשהשורה ארוכה יותר. רוב הילדים מבינים את זה בסביבות גיל 6–7, ולכן בגיל 3–4 המשחקים האלה הם התנסות והיכרות, לא מבחן.' },
  { q: 'עד כמה ילד בן 3–4 צריך לספור?', a: 'זה שונה מילד לילד. רבים בגיל 3 סופרים בעל־פה עד 5 או 10, אבל סופרים חפצים נכון רק עד 3–5. בגיל 4 רובם כבר סופרים חפצים עד 5 ומעלה ומתחילים לזהות חלק מהספרות.' },
  { q: 'איך מדפיסים את הכרטיסים?', a: 'בכפתור ההדפסה יוצאים שני דפים: כרטיסי ספרות 1–10 וכרטיסי נקודות 1–10. גוזרים לפי הקווים, ואפשר לנלן כדי שיחזיקו כל השנה.' },
  { q: 'כמה זמן משחקים?', a: 'בגיל 3–4 עדיף משחק קצר של 5–10 דקות, בקבוצה קטנה. עדיף לחזור על אותו משחק כמה ימים ברצף מאשר להחליף כל יום.' },
]

function Cards({ dots }) {
  return <div className="buga-a4" dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', padding: '10mm' }}>
    <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>{dots ? 'כרטיסי נקודות 1–10' : 'כרטיסי ספרות 1–10'} · גוזרים לפי הקו</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0 }}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <div key={n} style={{ border: '2px dashed #94a3b8', height: '48mm', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        {dots ? <Dots n={n} size={n > 5 ? 70 : 90} /> : <><span style={{ fontSize: 92, fontWeight: 900, lineHeight: 1, color: '#1e293b' }}>{n}</span><span style={{ fontSize: 16, color: '#64748b' }}>{'●'.repeat(n)}</span></>}
      </div>)}
    </div>
  </div>
}

export default function PreschoolMathGames() {
  const [skill, setSkill] = useState('all'), [print, setPrint] = useState(false)
  const [n, setN] = useState(3), [pick, setPick] = useState(null), [stars, setStars] = useState(0)
  const shown = GAMES.filter(g => skill === 'all' || g.s.includes(skill))
  const next = () => { let k; do { k = 1 + Math.floor(Math.random() * 5) } while (k === n); setN(k); setPick(null) }
  const choose = d => { if (pick === n) return; setPick(d); if (d === n) setStars(s => s + 1) }
  return <div className="mx-auto max-w-4xl px-4 py-6" dir="rtl">
    <SEO title="משחקי חשבון לגן לגיל 3–4 — ספירה, זיהוי ספרות ושימור כמות" description="12 משחקים והפעלות דידקטיות בחשבון לגיל 3–4: ספירה, זיהוי ספרות, יותר ופחות ושימור כמות. לכל משחק חומרים והוראות, ועוד כרטיסי ספרות ונקודות 1–10 להדפסה." path="/classroom/preschool-math-games" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לגננת ולמורה', href: '/classroom' }, { label: 'משחקי חשבון לגיל 3–4' }]} />
    <h1 className="mb-1 text-center text-4xl font-black sm:text-5xl">🔢 משחקי חשבון לגן — גיל 3–4</h1>
    <p className="mb-4 text-center text-lg text-[var(--muted-foreground)]">12 הפעלות עם חומרים פשוטים · ספירה, זיהוי ספרות, יותר ופחות ושימור כמות · כרטיסים להדפסה</p>
    <div className="mb-5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-lg">
      <b>טיפ לפני שמתחילים:</b> בגיל 3–4 הכי חשוב לספור חפצים אמיתיים, לגעת בכל חפץ פעם אחת, ולסיים במספר האחרון ("אחת, שתיים, שלוש — יש שלוש!"). שימור כמות רוב הילדים מבינים רק בסביבות גיל 6–7, ולכן משחקי שימור כאן הם התנסות — שואלים "איך נבדוק?" ולא מתקנים.
    </div>
    <div className="mb-4 flex flex-wrap justify-center gap-2" role="group" aria-label="סינון לפי מיומנות">
      {[['all', 'הכול'], ...Object.entries(SKILLS)].map(([k, l]) => <button key={k} type="button" aria-pressed={skill === k} onClick={() => setSkill(k)} className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${skill === k ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-800 bg-white'}`}>{l}</button>)}
      <button type="button" onClick={() => setPrint(true)} className="min-h-[44px] rounded-full bg-amber-600 px-5 font-bold text-white">🖨️ כרטיסי ספרות ונקודות</button>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">{shown.map(g => <article key={g.n} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 sketch-shadow">
      <h2 className="mb-1 text-2xl font-black"><span aria-hidden="true">{g.e} </span>{g.n}</h2>
      <p className="mb-2 flex flex-wrap gap-1">{g.s.map(s => <span key={s} className="rounded-full bg-sky-100 px-2 text-sm font-bold">{SKILLS[s]}</span>)}</p>
      <p className="mb-1"><b>צריך:</b> {g.m}</p>
      <p className="mb-1"><b>איך משחקים:</b> {g.h}</p>
      <p className="text-[var(--muted-foreground)]">💡 {g.t}</p>
    </article>)}</div>

    <section className="mt-8 rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5 text-center sketch-shadow" aria-labelledby="try">
      <h2 id="try" className="mb-2 text-3xl font-black">משחק קטן על המסך: כמה נקודות?</h2>
      <p className="mb-3 text-lg">סופרים את הנקודות ולוחצים על הספרה המתאימה. {stars > 0 && <span aria-live="polite">⭐ {stars}</span>}</p>
      <div className="mb-3"><Dots n={n} size={130} /></div>
      <div className="flex flex-wrap justify-center gap-2">{[1, 2, 3, 4, 5].map(d => <button key={d} type="button" onClick={() => choose(d)} className={`min-h-[64px] min-w-[64px] rounded-2xl border-2 text-3xl font-black ${pick === d ? (d === n ? 'border-green-600 bg-green-200' : 'border-red-500 bg-red-100') : 'border-slate-800 bg-white'}`}>{d}</button>)}</div>
      {pick !== null && <p className="mt-3 text-2xl font-bold" aria-live="polite">{pick === n ? '✅ נכון! ' : '💡 נספור שוב יחד, נקודה אחרי נקודה.'}{pick === n && <button type="button" onClick={next} className="underline">עוד אחד ←</button>}</p>}
    </section>

    {print && <PrintPreview title="כרטיסי ספרות ונקודות 1–10" onClose={() => setPrint(false)}><Cards /><Cards dots /></PrintPreview>}
    <p className="mt-8 text-center text-lg">עוד לגיל הזה: <Link className="font-bold underline" to="/booklets/age-3">חוברת עבודה לגיל 3</Link> · <Link className="font-bold underline" to="/booklets/first-math-age-4">חוברת חשבון ראשונה לגיל 4–5</Link> · <Link className="font-bold underline" to="/toddlers/age-3">פעילויות לגיל 3</Link></p>
    <div className="mt-10"><SeoBody paragraphs={['אוסף של 12 משחקי חשבון לגן לגיל 3–4, שאפשר להעביר בקבוצה קטנה או במפגש: ספירה עם תנועה, התאמת ספרה לכמות, זיהוי כמות במבט, השוואה של יותר ופחות, ומשחקי שימור כמות עם כפתורים, בצק ומים. לכל משחק כתוב מה צריך, איך משחקים, וטיפ קטן מהשטח.', 'בגיל הזה ילדים לומדים חשבון דרך הידיים והגוף. ספירה נכונה של חפצים — לגעת בכל חפץ פעם אחת ולדעת שהמספר האחרון הוא הכמות — היא הבסיס לכל מה שיבוא אחר כך. הכרטיסים להדפסה (ספרות ונקודות 1–10) משמשים לרוב המשחקים, ואפשר לשחק בהם גם משחק זיכרון.']} faq={FAQ} related={[{ label: 'דפי עבודה לגן חובה', href: '/printables/kindergarten-worksheets' }, { label: 'נושאים לגן לפי חודשים', href: '/classroom/kindergarten-year-plan' }]} /></div>
  </div>
}
