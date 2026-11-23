import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { COMMENT_GROUPS, ALL_COMMENTS, sentence, composeComment } from '../../data/reportCardComments'

// /classroom/report-card-comments: an original sentence bank for verbal evaluations in report cards.
// The teacher picks boy/girl (and her or his own gender), clicks sentences to build one evaluation, edits
// nothing on a server — the optional student name stays in the browser and is never stored or sent.
const PATH = '/classroom/report-card-comments'

const FAQ = [
  { q: 'איך כותבים הערכה מילולית טובה בתעודה?', a: 'פותחים בחוזקה אמיתית של התלמיד, כותבים דבר מוחשי אחד על הלמידה ודבר אחד על ההתנהגות או החברות, מציינים יעד אחד או שניים להמשך בניסוח מעודד, וסוגרים באיחול. עדיף משפט אחד מדויק על הילד הזה מאשר שלושה משפטים כלליים.' },
  { q: 'כמה משפטים כותבים בהערכה מילולית?', a: 'ברוב בתי הספר היסודיים מספיקים ⁦4–6⁩ משפטים: פתיחה, שניים־שלושה על הלמידה וההתנהגות, יעד אחד וסיום. כדאי לבדוק אם במערכת שבה אתם מקלידים יש הגבלת תווים. מתחת להערכה בדף מופיע מונה תווים.' },
  { q: 'איך מנסחים נקודה לשיפור בלי לפגוע?', a: 'מנסחים אותה כיעד משותף לעתיד ולא כביקורת על העבר: "במחצית הבאה נעבוד יחד על…", "אני בטוחה שאם תתרגל… תרגיש…". מתארים התנהגות ולא תכונה ("כדאי לבדוק את העבודה לפני ההגשה" ולא "אתה מרושל"), ומצרפים יעד אחד או שניים בלבד.' },
  { q: 'למה המשפטים כתובים בגוף שני?', a: 'ביסודי נהוג לכתוב את ההערכה ישירות לילד ("את תלמידה סקרנית…"), כי הוא קורא אותה עם ההורים. לכל משפט יש נוסח לתלמיד ולתלמידה, ויש גם בחירה אם המורה כותבת או כותב, כדי שהמשפטים בגוף ראשון יתאימו.' },
  { q: 'השם של התלמיד נשמר באתר?', a: 'לא. השם שמקלידים משמש רק להצגת המשפט על המסך שלכם, ולא נשמר ולא נשלח לשום מקום. אפשר גם להשאיר את השדה ריק ולהוסיף את השם אחר כך במערכת של בית הספר.' },
  { q: 'אפשר להשתמש במשפטים לתעודה של סוף שנה?', a: 'כן. רוב המשפטים מתאימים לשתי המחציות. במשפטי הסיום יש איחול למחצית השנייה ויש איחול לכיתה הבאה, ובוחרים לפי הזמן בשנה.' },
]

const TIPS = [
  ['💪', 'מתחילים בחוזקה', 'משפט ראשון על משהו שהילד באמת טוב בו. ילדים (והורים) קוראים קודם את ההתחלה.'],
  ['🔎', 'משהו אחד מוחשי', 'במקום "תלמיד טוב": "אתה שואל שאלות שמעשירות את הכיתה". מוסיפים בכתב חופשי דוגמה מהמחצית.'],
  ['🎯', 'יעד אחד או שניים', 'נקודה לשיפור מנוסחת כיעד להמשך, לא כביקורת. יותר משני יעדים מרגיש כמו רשימת תלונות.'],
  ['🧩', 'לגוון בין התלמידים', 'הורים משווים תעודות. משנים פתיחה וסיום, ומוסיפים לכל ילד משפט אישי משלכם.'],
]

function SentenceButton({ c, gender, name, teacher, on, onToggle }) {
  return <li>
    <button type="button" aria-pressed={on} onClick={() => onToggle(c.id)}
      className={`flex min-h-[48px] w-full items-start gap-2 rounded-2xl border-2 p-3 text-right text-lg leading-relaxed transition ${on ? 'border-emerald-600 bg-emerald-50' : 'border-[var(--border)] bg-white hover:bg-[var(--muted)]/30'}`}>
      <span aria-hidden="true" className="mt-0.5 shrink-0 font-bold">{on ? '✓' : '+'}</span>
      <span>{sentence(c, gender, name, teacher)}</span>
    </button>
  </li>
}

export default function ReportCardComments() {
  const [gender, setGender] = useState('m'), [teacher, setTeacher] = useState('f'), [name, setName] = useState('')
  const [picked, setPicked] = useState([]), [group, setGroup] = useState('all'), [copied, setCopied] = useState(false)
  const toggle = id => setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]))
  const text = composeComment(picked, gender, name, teacher)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard blocked */ }
  }
  const chip = on => `min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-slate-800 bg-amber-200' : 'border-[var(--border)] bg-white'}`
  const shown = COMMENT_GROUPS.filter(g => group === 'all' || g.id === group)

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="הערכה מילולית בתעודה — בנק משפטים מוכנים לתלמיד ולתלמידה" description={`בנק של ${ALL_COMMENTS.length} משפטים מקוריים להערכה מילולית בתעודה: הישגים, מאמץ, התנהגות, חברות, עצמאות, מקצועות, יעדים לשיפור ואיחול. לתלמיד ולתלמידה, בוחרים בלחיצה ומעתיקים. בחינם.`} path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'הערכה מילולית בתעודה' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">📝 הערכה מילולית בתעודה: בנק משפטים</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">{ALL_COMMENTS.length} משפטים מקוריים לתעודה של אמצע השנה ושל סוף השנה. בוחרים לתלמיד או לתלמידה, לוחצים על המשפטים המתאימים, וההערכה נבנית למטה. מעתיקים ומדביקים במערכת של בית הספר.</p>

    <div className="mb-6 grid gap-4 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-5 sm:grid-cols-3">
      <fieldset>
        <legend className="mb-2 font-bold">כותבים ל…</legend>
        <div className="flex gap-2">
          <button type="button" aria-pressed={gender === 'm'} onClick={() => setGender('m')} className={chip(gender === 'm')}>👦 תלמיד</button>
          <button type="button" aria-pressed={gender === 'f'} onClick={() => setGender('f')} className={chip(gender === 'f')}>👧 תלמידה</button>
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 font-bold">מי כותב?</legend>
        <div className="flex gap-2">
          <button type="button" aria-pressed={teacher === 'f'} onClick={() => setTeacher('f')} className={chip(teacher === 'f')}>מורה (את)</button>
          <button type="button" aria-pressed={teacher === 'm'} onClick={() => setTeacher('m')} className={chip(teacher === 'm')}>מורה (אתה)</button>
        </div>
      </fieldset>
      <label className="block font-bold">שם פרטי (לא חובה, לא נשמר)
        <input value={name} maxLength={20} onChange={e => setName(e.target.value)} placeholder="למשל: נועה" className="mt-2 min-h-[44px] w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 font-normal" />
      </label>
    </div>

    <div className="mb-6 flex flex-wrap justify-center gap-2" role="group" aria-label="סוג המשפטים">
      <button type="button" aria-pressed={group === 'all'} onClick={() => setGroup('all')} className={chip(group === 'all')}>✨ הכול</button>
      {COMMENT_GROUPS.map(g => <button key={g.id} type="button" aria-pressed={group === g.id} onClick={() => setGroup(g.id)} className={chip(group === g.id)}>{g.emoji} {g.label}</button>)}
    </div>

    <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        {shown.map(g => <section key={g.id} className="mb-8" aria-labelledby={`h-${g.id}`}>
          <h2 id={`h-${g.id}`} className="mb-3 text-2xl font-bold">{g.emoji} {g.label}</h2>
          <ul className="grid gap-2">{g.items.map(c => <SentenceButton key={c.id} {...{ c, gender, name, teacher }} on={picked.includes(c.id)} onToggle={toggle} />)}</ul>
        </section>)}
      </div>

      <aside className="rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow-sm lg:sticky lg:top-24" aria-labelledby="mine-h">
        <h2 id="mine-h" className="mb-2 text-2xl font-bold">✍️ ההערכה שלי</h2>
        {picked.length === 0
          ? <p className="text-lg text-[var(--muted-foreground)]">לחצו על משפטים מהרשימה, והם יופיעו כאן לפי הסדר שבחרתם. כדאי: פתיחה, ⁦2–3⁩ משפטים, יעד אחד וסיום.</p>
          : <>
            <p className="whitespace-pre-line rounded-xl bg-amber-50 p-3 text-lg leading-relaxed">{text}</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{picked.length} משפטים · {text.length} תווים</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={copy} className="min-h-[48px] rounded-2xl bg-emerald-600 px-5 text-lg font-bold text-white hover:bg-emerald-700">{copied ? '✓ הועתק' : '📋 העתקת ההערכה'}</button>
              <button type="button" onClick={() => setPicked([])} className="min-h-[48px] rounded-2xl border-2 border-[var(--border)] bg-white px-4 font-bold">🧹 לתלמיד הבא</button>
            </div>
            <p className="mt-3 text-sm">אחרי ההדבקה הוסיפו משפט אישי אחד משלכם: דוגמה מהמחצית שרק הילד הזה יזהה.</p>
          </>}
      </aside>
    </div>

    <section className="mb-8 mt-4 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5" aria-labelledby="tips-h">
      <h2 id="tips-h" className="mb-4 text-2xl font-bold">💡 ארבעה כללים להערכה מילולית טובה</h2>
      <ul className="grid gap-4 sm:grid-cols-2">{TIPS.map(([e, t, d]) => <li key={t} className="rounded-2xl bg-white p-4"><p className="text-xl font-bold"><span aria-hidden="true">{e}</span> {t}</p><p className="mt-1 text-lg">{d}</p></li>)}</ul>
    </section>

    <p className="mt-8 text-center text-lg">עוד למורים: <Link className="font-bold underline" to="/printables/teacher-templates">טפסים ותכנון למורה</Link> · <Link className="font-bold underline" to="/classroom/roster">רשימת הכיתה שלי</Link> · <Link className="font-bold underline" to="/classroom/by-grade">חומרים לפי כיתה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'הערכה מילולית בתעודה היא החלק שהילדים וההורים קוראים ראשון, והחלק שלוקח למורים הכי הרבה זמן: עשרים ושלושים תלמידים, וכל אחד צריך משפטים שמתאימים רק לו. בנק המשפטים מסודר לפי תחומים — הישגים ולמידה, מאמץ והשתתפות, התנהגות ואחריות, חברות, עצמאות וארגון, מקצועות, יעדים להמשך ואיחול — כדי שאפשר יהיה לבנות הערכה בכמה לחיצות ולהשקיע את הזמן במשפט האישי.',
      'כל המשפטים נכתבו במיוחד לעוגה בוגה, בגוף שני, בנוסח לתלמיד ובנוסח לתלמידה, ובניסוח חיובי ומכבד. גם הנקודות לשיפור כתובות כיעד משותף להמשך. הדף לא שומר ולא שולח שמות של תלמידים: הכול קורה בדפדפן, והטקסט עובר רק למקום שבו מדביקים אותו.',
    ]} faq={FAQ} related={[{ label: 'לכיתה — כל הכלים למורה', href: '/classroom' }, { label: 'טפסים ותכנון למורה', href: '/printables/teacher-templates' }, { label: 'מבחן אמצע שנה בחשבון', href: '/math/tests/grade-4/mid-year' }, { label: 'קיר ברכות למורה', href: '/thank-you-wall' }]} /></div>
  </div>
}
