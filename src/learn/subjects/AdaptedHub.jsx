import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { SUBJECTS, GRADE_LETTERS, gradeSlug, loadTopics, topicsForGrade } from './subjects'
import '../learn.css'
import './adapted.css'

// /learn/adapted-tests: every subject exam in its adapted mode (read-aloud, large type, three answers).
const MIN_GRADE_TOPICS = 4 // same as SubjectPages.jsx
// grade lists duplicated from adaptedMath.js / adaptedReading.js so the hub does not pull in the math topic data
const ADAPTED_MATH_GRADES = [1, 2, 3, 4, 5, 6]
const ADAPTED_READING_GRADES = [2, 3, 4, 5, 6]

const FAQ = [
  { q: 'מה זה מבחן מותאם?', a: 'מבחן שבו כל שאלה וכל תשובה מוקראות בקול, האותיות גדולות, יש שאלה אחת על המסך, שלוש תשובות במקום ארבע, אין שעון, ואחרי טעות יש עוד ניסיון. המבחן קצר יותר: 10 שאלות.' },
  { q: 'למי זה מתאים?', a: 'לילדים עם לקות למידה, דיסלקציה, קשב וריכוז או קושי בקריאה, ולכל ילד שנעזר בהקראה ובהתאמות במבחנים בבית הספר. אפשר לתרגל לבד בבית, בלי שמבוגר יקריא.' },
  { q: 'ההקראה עובדת בכל מכשיר?', a: 'ההקראה משתמשת בקול העברי של המכשיר. בטלפונים ובדפדפן כרום יש קול כזה כמעט תמיד. אם אין, המבחן עובד גם בלי הקראה, באותיות גדולות.' },
  { q: 'אפשר להדפיס?', a: 'כן. בכל מבחן מותאם יש כפתור "להדפסה באותיות גדולות", עם שלוש תשובות לכל שאלה ודף תשובות נפרד.' },
]

export default function AdaptedHub() {
  const [open, setOpen] = useState(null), [grades, setGrades] = useState({})
  const choose = async s => {
    setOpen(o => (o === s.key ? null : s.key))
    if (grades[s.key]) return
    const topics = await loadTopics(s.key)
    setGrades(g => ({ ...g, [s.key]: s.gradeList.filter(n => topicsForGrade(topics, n).length >= MIN_GRADE_TOPICS) }))
  }
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מבחנים מותאמים עם הקראה — לילדים עם קשיי למידה, לכל הכיתות" description="מבחנים מותאמים בחינם: הקראה של כל שאלה ותשובה, אותיות גדולות, שלוש תשובות, בלי שעון ועם ניסיון נוסף. חשבון, הבנת הנקרא וכל המקצועות, לתרגול לבד בבית." path="/learn/adapted-tests" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, { label: 'מבחנים מותאמים' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🎧 </span>מבחנים מותאמים עם הקראה</h1>
    <p className="text-center text-xl mb-6">לילדים שקשה להם לקרוא או להתרכז: עושים מבחן לבד, עם הקראה והקלות.</p>
    <ul className="ad-list ad-card mb-8" style={{ maxWidth: 560 }}>
      <li>🔊 כל שאלה וכל תשובה מוקראות בקול</li>
      <li>1️⃣ שאלה אחת על המסך, באותיות גדולות</li>
      <li>3️⃣ שלוש תשובות במקום ארבע</li>
      <li>⏳ בלי שעון · 💪 עוד ניסיון אחרי טעות</li>
      <li>📝 10 שאלות · 🖨️ אפשר גם להדפיס</li>
    </ul>
    <h2 className="text-2xl font-black mb-3 text-center">חשבון והבנת הנקרא</h2>
    <ul className="sj-grid mb-8">
      <li>
        <div className="sj-card"><span><b>🧮 חשבון</b><small>כיתות א׳–ו׳ · התרגילים מוקראים במילים</small></span></div>
        <div className="mt-2 flex flex-wrap gap-2">{ADAPTED_MATH_GRADES.map(n => <Link key={n} to={`/learn/adapted-tests/math/${gradeSlug(n)}`} className="ln-chip">כיתה {GRADE_LETTERS[n]}</Link>)}</div>
      </li>
      <li>
        <div className="sj-card"><span><b>📖 הבנת הנקרא</b><small>כיתות ב׳–ו׳ · קטע קצר עם הקראה ושאלות</small></span></div>
        <div className="mt-2 flex flex-wrap gap-2">{ADAPTED_READING_GRADES.map(n => <Link key={n} to={`/learn/adapted-tests/reading/${gradeSlug(n)}`} className="ln-chip">כיתה {GRADE_LETTERS[n]}</Link>)}</div>
      </li>
    </ul>
    <h2 className="text-2xl font-black mb-3 text-center">שאר המקצועות: בוחרים מקצוע, ואז כיתה</h2>
    <ul className="sj-grid">{SUBJECTS.map(s => <li key={s.key}>
      <button type="button" className="sj-card card-lift w-full text-right" aria-expanded={open === s.key} onClick={() => choose(s)}>
        <span><b>{s.emoji} {s.title}</b><small>לכיתות {s.grades}</small></span>
      </button>
      {open === s.key && <div className="mt-2 flex flex-wrap gap-2">
        {!grades[s.key] ? <span role="status">טוען…</span>
          : grades[s.key].length ? grades[s.key].map(n => <Link key={n} to={`/learn/${s.key}/${gradeSlug(n)}/exam?mode=adapted`} className="ln-chip">כיתה {GRADE_LETTERS[n]}</Link>)
            : <span>אין עדיין מבחן במקצוע הזה</span>}
      </div>}
    </li>)}</ul>
    <div className="mt-12"><SeoBody paragraphs={[
      'המבחנים המותאמים נבנים מאותן שאלות של המבחנים לדוגמה באתר (בחשבון: מתרגילי החשבון של הכיתה, שמוקראים במילים, ובהבנת הנקרא: מקטע קריאה קצר ושאלות עליו), עם ההתאמות שילדים רבים מקבלים בבית הספר: הקראה, הגדלת אותיות, פחות מסיחים ובלי לחץ של זמן.',
      'כך ילד עם קושי בקריאה יכול לתרגל לבד, בקצב שלו, ולהגיע למבחן בכיתה בביטחון. אחרי כל שאלה מופיע הסבר קצר, ובסוף יש קישור לשיעורים של הכיתה.',
    ]} faq={FAQ} related={[{ label: 'לומדים', href: '/learn' }]} /></div>
  </div>
}
