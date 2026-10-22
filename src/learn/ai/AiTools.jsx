import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import '../learn.css'
import '../subjects/subjects.css'

// Hands-on pages of the AI subject (/learn/ai). Nothing here calls an AI service: the "robot" is a
// few lines of nearest-neighbour code in the browser, so children see exactly how it decides.
const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const AI = { label: 'אקדמיית ה־AI של בוגה', href: '/learn/ai' }
const crumbs = label => [{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, AI, { label }]
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
const MoreTools = ({ not }) => <div className="mt-10 grid gap-3 sm:grid-cols-3">{[
  { to: '/learn/ai/teach-the-robot', label: '🧠 מלמדים את הרובוט' },
  { to: '/learn/ai/prompt-lab', label: '💬 מעבדת השאלות' },
  { to: '/learn/ai/spot-the-mistake', label: '🔎 תפסו את הטעות של הבוט' },
  { to: '/learn/ai', label: '🤖 כל השיעורים באקדמיית ה־AI' },
].filter(t => t.to !== not).map(t => <Link key={t.to} to={t.to} className="ln-box card-lift text-center font-bold">{t.label}</Link>)}</div>

// ---------- 1. Teach the robot ----------
// Each animal has visible features; the robot labels a new animal like the taught animal that shares
// the most features with it (nearest neighbour). Truth per task: true / false / null (not clear-cut, left out).
const ANIMALS = [
  { e: '🐬', n: 'דולפין', f: ['סנפירים', 'זנב', 'בלי רגליים', 'עור חלק'], water: true, fly: false, mammal: true },
  { e: '🐟', n: 'דג', f: ['סנפירים', 'קשקשים', 'זנב', 'בלי רגליים'], water: true, fly: false, mammal: false },
  { e: '🦈', n: 'כריש', f: ['סנפירים', 'זנב', 'בלי רגליים', 'שיניים חדות'], water: true, fly: false, mammal: false },
  { e: '🐳', n: 'לווייתן', f: ['סנפירים', 'זנב', 'בלי רגליים', 'עור חלק'], water: true, fly: false, mammal: true },
  { e: '🐙', n: 'תמנון', f: ['זרועות', 'בלי עצמות', 'עור חלק'], water: true, fly: false, mammal: false },
  { e: '🦭', n: 'כלב ים', f: ['סנפירים', 'פרווה', 'זנב'], water: true, fly: false, mammal: true },
  { e: '🦀', n: 'סרטן', f: ['שריון', 'צבתות', '10 רגליים'], water: true, fly: false, mammal: false },
  { e: '🦅', n: 'נשר', f: ['נוצות', 'כנפיים', 'מקור', '2 רגליים'], water: false, fly: true, mammal: false },
  { e: '🦜', n: 'תוכי', f: ['נוצות', 'כנפיים', 'מקור', '2 רגליים'], water: false, fly: true, mammal: false },
  { e: '🐧', n: 'פינגווין', f: ['נוצות', 'כנפיים', 'מקור', '2 רגליים'], water: null, fly: false, mammal: false },
  { e: '🦇', n: 'עטלף', f: ['פרווה', 'כנפיים', '2 רגליים'], water: false, fly: true, mammal: true },
  { e: '🦋', n: 'פרפר', f: ['כנפיים', '6 רגליים', 'מחושים'], water: false, fly: true, mammal: false },
  { e: '🐝', n: 'דבורה', f: ['כנפיים', '6 רגליים', 'מחושים', 'עוקץ'], water: false, fly: true, mammal: false },
  { e: '🦁', n: 'אריה', f: ['פרווה', '4 רגליים', 'זנב', 'שיניים חדות'], water: false, fly: false, mammal: true },
  { e: '🐘', n: 'פיל', f: ['עור עבה', '4 רגליים', 'זנב', 'חדק'], water: false, fly: false, mammal: true },
  { e: '🐄', n: 'פרה', f: ['פרווה', '4 רגליים', 'זנב'], water: false, fly: false, mammal: true },
  { e: '🐕', n: 'כלב', f: ['פרווה', '4 רגליים', 'זנב', 'שיניים חדות'], water: false, fly: false, mammal: true },
  { e: '🐇', n: 'ארנב', f: ['פרווה', '4 רגליים', 'אוזניים ארוכות'], water: false, fly: false, mammal: true },
  { e: '🐍', n: 'נחש', f: ['קשקשים', 'בלי רגליים', 'זנב'], water: false, fly: false, mammal: false },
  { e: '🐢', n: 'צב יבשה', f: ['שריון', '4 רגליים', 'זנב'], water: false, fly: false, mammal: false },
  { e: '🐊', n: 'תנין', f: ['קשקשים', '4 רגליים', 'זנב', 'שיניים חדות'], water: null, fly: false, mammal: false },
  { e: '🐸', n: 'צפרדע', f: ['עור חלק', '4 רגליים'], water: null, fly: false, mammal: false },
  { e: '🐌', n: 'שבלול', f: ['קונכייה', 'בלי רגליים', 'מחושים'], water: false, fly: false, mammal: false },
  { e: '🐞', n: 'פרת משה רבנו', f: ['כנפיים', '6 רגליים', 'מחושים', 'שריון'], water: false, fly: true, mammal: false },
]
const TASKS = [
  { key: 'water', q: 'האם החיה חיה במים?', yes: 'חיה במים', no: 'לא חיה במים' },
  { key: 'fly', q: 'האם החיה יכולה לעוף?', yes: 'עפה', no: 'לא עפה' },
  { key: 'mammal', q: 'האם החיה היא יונק?', yes: 'יונק', no: 'לא יונק' },
]
const TRAIN = 8, TEST = 8
const shared = (a, b) => a.f.filter(x => b.f.includes(x))
// The taught example with the most features in common (ties: the earliest taught).
function predict(taught, animal) {
  let best = null, score = -1
  for (const t of taught) { const s = shared(t.a, animal).length / new Set([...t.a.f, ...animal.f]).size; if (s > score) { score = s; best = t } }
  return best
}
export function TeachTheRobot() {
  const [taskKey, setTaskKey] = useState('water')
  const task = TASKS.find(t => t.key === taskKey)
  const [round, setRound] = useState(0)
  const deck = useMemo(() => shuffle(ANIMALS.filter(a => a[taskKey] !== null)).slice(0, TRAIN + TEST), [taskKey, round])
  const [taught, setTaught] = useState([])
  useEffect(() => { setTaught([]) }, [deck])
  const teaching = taught.length < TRAIN
  const current = deck[taught.length]
  const teach = label => setTaught(t => [...t, { a: current, label }])
  const tests = deck.slice(TRAIN).map(a => { const near = predict(taught, a); return { a, near, guess: near?.label, right: near?.label === a[taskKey] } })
  const score = tests.filter(t => t.right).length
  const wrongTeaching = taught.filter(t => t.label !== t.a[taskKey]).length
  const restart = k => { if (k) setTaskKey(k); setRound(r => r + 1) }
  return <Page>
    <SEO title="מלמדים את הרובוט — משחק למידת מכונה לילדים" description="משחק שמראה לילדים איך מכונה לומדת: מלמדים רובוט לזהות חיות בעזרת דוגמאות, והוא מנחש לבד — וגם טועה כשהדוגמאות לא טובות. בלי הרשמה." path="/learn/ai/teach-the-robot" structuredData={faqSchema(TEACH_FAQ)} />
    <Breadcrumbs items={crumbs('מלמדים את הרובוט')} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2">🧠 מלמדים את הרובוט</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">אתם המורים. תנו לרובוט {TRAIN} דוגמאות — והוא ינסה לנחש לבד.</p>
    <div className="mb-5 flex flex-wrap justify-center gap-2">{TASKS.map(t => <button key={t.key} type="button" aria-pressed={t.key === taskKey} onClick={() => restart(t.key)} className={`min-h-11 rounded-xl border-2 px-4 font-bold ${t.key === taskKey ? 'border-slate-800 bg-amber-100' : 'border-slate-200 bg-white'}`}>{t.q}</button>)}</div>
    {teaching ? <section className="ln-box text-center">
      <p className="text-sm font-bold text-slate-500">דוגמה {taught.length + 1} מתוך {TRAIN}</p>
      <div className="my-3 text-7xl" aria-hidden="true">{current.e}</div>
      <h2 className="text-3xl font-black">{current.n}</h2>
      <p className="mt-2 text-slate-600">מה הרובוט רואה: {current.f.join(' · ')}</p>
      <p className="mt-4 text-xl font-bold">{task.q}</p>
      <div className="mt-3 flex justify-center gap-3">
        <button type="button" className="ln-btn" onClick={() => teach(true)}>✅ {task.yes}</button>
        <button type="button" className="ln-btn alt" onClick={() => teach(false)}>❌ {task.no}</button>
      </div>
      <p className="mt-4 text-sm text-slate-500">רוצים לראות מה קורה כשמלמדים לא נכון? נסו לענות פעם אחת בכוונה הפוך.</p>
    </section> : <section>
      <div className="ln-box mb-4 text-center">
        <p className="text-2xl font-black">הרובוט צדק ב־{score} מתוך {TEST} 🤖</p>
        <p className="mt-2">{wrongTeaching ? `שימו לב: ב־${wrongTeaching} מהדוגמאות לימדתם אותו תשובה לא נכונה — והוא למד גם את הטעות. כך זה גם בבינה מלאכותית אמיתית: נתונים לא נכונים מלמדים טעויות.` : score === TEST ? 'מושלם! הדוגמאות שנתתם היו טובות ומגוונות.' : 'הרובוט לא ראה מספיק דוגמאות דומות. בינה מלאכותית טועה כשהמקרה החדש שונה ממה שהיא למדה.'}</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">{tests.map(t => <li key={t.a.n} className={`rounded-2xl border-2 p-3 ${t.right ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
        <p className="text-lg font-bold"><span aria-hidden="true">{t.a.e}</span> {t.a.n}: הרובוט אמר <b>{t.guess ? task.yes : task.no}</b> {t.right ? '✅' : '❌'}</p>
        <p className="text-sm text-slate-700">הכי דומה ל{t.near.a.e} {t.near.a.n} שלימדתם{shared(t.near.a, t.a).length ? ` — שניהם: ${shared(t.near.a, t.a).join(', ')}` : ' — אבל אין להם כמעט שום דבר משותף'}.</p>
        {!t.right && <p className="text-sm font-bold">התשובה הנכונה: {t.a[taskKey] ? task.yes : task.no}</p>}
      </li>)}</ul>
      <div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" className="ln-btn" onClick={() => restart()}>🔁 שוב עם חיות אחרות</button></div>
    </section>}
    <div className="mt-10"><SeoBody paragraphs={['ככה בדיוק לומדת מכונה, רק בקטן: היא מקבלת הרבה דוגמאות עם תשובות, מחפשת מה משותף להן, ומנחשת את התשובה למקרה חדש לפי הדוגמאות הכי דומות. הרובוט כאן לא ״יודע״ מה זה דג או ציפור — הוא רק משווה תכונות.', 'שימו לב לשני דברים שקורים גם בבינה מלאכותית אמיתית: כשמלמדים אותה תשובות לא נכונות היא חוזרת על הטעות, וכשמגיע מקרה שונה מכל מה שראתה — למשל עטלף, יונק שעף — היא עלולה לטעות. לכן חשוב שהנתונים יהיו נכונים, רבים ומגוונים.']} faq={TEACH_FAQ} related={[{ label: 'איך מכונה לומדת מדוגמאות', href: '/learn/ai/learning-from-examples' }, { label: 'נתונים ואימון', href: '/learn/ai/data-and-training' }, AI]} /></div>
    <MoreTools not="/learn/ai/teach-the-robot" />
  </Page>
}
const TEACH_FAQ = [
  { q: 'האם זה רובוט אמיתי?', a: 'זה קוד קטן בדפדפן שמשווה תכונות ובוחר את הדוגמה הכי דומה. זו אותה רעיון שעליו בנויות שיטות למידת מכונה, רק בגודל קטן מאוד.' },
  { q: 'למה הרובוט טועה?', a: 'כי הוא יודע רק מה שלימדו אותו. אם הדוגמאות היו לא נכונות, מעטות או שונות מהמקרה החדש — הוא ינחש לא נכון.' },
  { q: 'לאיזה גיל מתאים?', a: 'לכיתות ב׳–ו׳, וגם כפתיחה לשיעור על בינה מלאכותית בחטיבת הביניים.' },
]

// ---------- 2. Prompt lab ----------
const PARTS = [
  { k: 'task', label: 'מה אני רוצה שיעשה?', ph: 'למשל: תסביר לי למה יש עונות בשנה', tip: 'פועל ברור: תסביר, תכתוב, תציע, תשווה' },
  { k: 'details', label: 'פרטים חשובים', ph: 'למשל: אני רוצה להבין את הקשר לשמש ולכדור הארץ', tip: 'מה בדיוק מעניין אתכם? מה כבר ידוע לכם?' },
  { k: 'level', label: 'למי זה מיועד?', ph: 'למשל: לילד בכיתה ד׳', tip: 'גיל או רמה — כדי שהתשובה תהיה מובנת' },
  { k: 'format', label: 'איך תיראה התשובה?', ph: 'למשל: 4 משפטים קצרים ודוגמה אחת', tip: 'אורך וצורה: רשימה, טבלה, כמה משפטים' },
  { k: 'check', label: 'בקשה לבדיקה', ph: 'למשל: ותגיד לי איפה אפשר לבדוק את זה', tip: 'מבקשים מקור או מה כדאי לבדוק — בוט יכול לטעות' },
]
// Personal details a child should never type into a chatbot.
const PRIVATE = [
  [/\b0\d{1,2}[-\s]?\d{7}\b|\b05\d[-\s]?\d{3}[-\s]?\d{4}\b/, 'מספר טלפון'],
  [/\S+@\S+\.\S+/, 'כתובת מייל'],
  [/קוראים לי|שמי הוא|השם שלי/, 'השם שלכם'],
  [/אני גר|אני גרה|הכתובת שלי|רחוב\s+\S+\s+\d/, 'כתובת מגורים'],
  [/בית הספר שלי|בית ספר\s+["״]?\S+/, 'שם בית הספר'],
  [/סיסמ/, 'סיסמה'],
]
const WEAK = [
  { bad: 'חלל', good: 'תסביר לי, לילד בכיתה ג׳, למה הירח משנה צורה במשך החודש. ב־4 משפטים קצרים, עם דוגמה מהחיים.' },
  { bad: 'תכתוב חיבור', good: 'תעזור לי לתכנן חיבור על ״חבר אמיתי״ לכיתה ה׳: תציע 3 רעיונות לפתיחה ושאלות שיעזרו לי לכתוב בעצמי.' },
  { bad: 'מה התשובה לשיעורי הבית', good: 'תסביר לי שלב אחרי שלב איך פותרים תרגיל חילוק ארוך כמו 156 חלקי 4, ותן לי תרגיל דומה לנסות לבד.' },
  { bad: 'תמציא סיפור', good: 'תכתוב סיפור קצר ומצחיק לגיל 7 על חתול שרוצה ללמוד לשחות, באורך של 8 משפטים, עם סוף טוב.' },
  { bad: 'מי ניצח', good: 'מי ניצח במשחק הכדורגל של נבחרת ישראל אתמול? ואם אין לך מידע עדכני — תגיד לי איפה אפשר לבדוק.' },
]
export function PromptLab() {
  const [v, setV] = useState({})
  const [open, setOpen] = useState(-1)
  const filled = PARTS.filter(p => (v[p.k] || '').trim().length > 2)
  const text = PARTS.map(p => (v[p.k] || '').trim()).filter(Boolean).join('. ').replace(/\.\./g, '.')
  const leaks = PRIVATE.filter(([re]) => re.test(text)).map(([, what]) => what)
  const [copied, setCopied] = useState(false)
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* ignore */ } }
  return <Page>
    <SEO title="מעבדת השאלות — איך שואלים בינה מלאכותית שאלה טובה" description="כלי לילדים לבניית שאלה טובה לצ׳טבוט: מה רוצים, פרטים, למי זה מיועד, איך תיראה התשובה ובקשה לבדיקה — עם בדיקת פרטיות ודוגמאות. בלי הרשמה." path="/learn/ai/prompt-lab" structuredData={faqSchema(PROMPT_FAQ)} />
    <Breadcrumbs items={crumbs('מעבדת השאלות')} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2">💬 מעבדת השאלות</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">שאלה טובה = תשובה טובה. בונים שאלה לבינה מלאכותית, חלק אחרי חלק.</p>
    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
      <section className="space-y-3">{PARTS.map(p => <label key={p.k} className="block">
        <span className="font-bold">{filled.includes(p) ? '✅' : '⬜'} {p.label}</span>
        <input value={v[p.k] || ''} onChange={e => setV({ ...v, [p.k]: e.target.value })} placeholder={p.ph} maxLength={200} className="mt-1 w-full rounded-xl border-2 border-slate-300 px-3 py-2" />
        <small className="text-slate-500">{p.tip}</small>
      </label>)}</section>
      <aside className="ln-box">
        <p className="font-bold">השאלה שלכם ({filled.length}/{PARTS.length}):</p>
        <p className="mt-2 min-h-24 whitespace-pre-wrap rounded-xl bg-white p-3 text-lg">{text || 'התחילו למלא משמאל…'}</p>
        <div className="mt-2 h-3 rounded-full bg-slate-200"><div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${(filled.length / PARTS.length) * 100}%` }} /></div>
        <p className="mt-2 text-sm">{filled.length >= 4 ? '🌟 שאלה מצוינת! יש בה כל מה שבוט צריך כדי לעזור.' : filled.length >= 2 ? 'כבר טוב — הוסיפו עוד פרט או שניים.' : 'שאלה של מילה אחת מקבלת תשובה כללית מדי.'}</p>
        {leaks.length > 0 && <p role="alert" className="mt-2 rounded-xl bg-rose-100 p-2 text-sm font-bold">🛑 רגע! נראה שכתבתם {leaks.join(', ')}. לא כותבים פרטים אישיים לבינה מלאכותית — מחקו אותם.</p>}
        {text && <button type="button" className="ln-btn mt-3" onClick={copy}>{copied ? '✅ הועתק' : '📋 העתקת השאלה'}</button>}
        <p className="mt-2 text-xs text-slate-500">שום דבר לא נשלח מכאן לשום מקום — זה רק תרגול.</p>
      </aside>
    </div>
    <h2 className="mt-10 mb-3 text-2xl font-black">🏋️ אתגר: שפרו את השאלה</h2>
    <ul className="space-y-3">{WEAK.map((w, i) => <li key={w.bad} className="ln-box">
      <p>שאלה חלשה: <b>״{w.bad}״</b></p>
      {open === i ? <p className="mt-2 rounded-xl bg-emerald-50 p-2">שאלה טובה יותר: {w.good}</p> : <button type="button" className="ln-btn alt mt-2" onClick={() => setOpen(i)}>חשבו איך לשפר — ואז הציצו</button>}
    </li>)}</ul>
    <div className="mt-10"><SeoBody paragraphs={['צ׳טבוט עונה טוב יותר כשהשאלה ברורה: מה רוצים שיעשה, אילו פרטים חשובים, למי מיועדת התשובה ואיך היא צריכה להיראות. ככה גם מקבלים הסבר שמתאים לגיל, ולא תשובה כללית וארוכה.', 'שני כללים חשובים לא פחות: לא כותבים פרטים אישיים — שם מלא, טלפון, כתובת, בית ספר או סיסמה — ותמיד בודקים את התשובה, כי בוט יכול לטעות גם כשהוא נשמע בטוח. ובשיעורי בית — מבקשים הסבר ודרך, לא את התשובה המוכנה.']} faq={PROMPT_FAQ} related={[{ label: 'איך כותבים שאלה טובה לבינה מלאכותית', href: '/learn/ai/good-prompts' }, { label: 'פרטיות ובינה מלאכותית', href: '/learn/ai/privacy-and-ai' }, AI]} /></div>
    <MoreTools not="/learn/ai/prompt-lab" />
  </Page>
}
const PROMPT_FAQ = [
  { q: 'מה זה פרומפט?', a: 'פרומפט הוא ההוראה או השאלה שכותבים לבינה מלאכותית. ככל שהוא ברור ומפורט יותר, התשובה מתאימה יותר למה שרציתם.' },
  { q: 'הכלי שולח את השאלה לצ׳טבוט?', a: 'לא. זה כלי תרגול בלבד: בונים שאלה, ואם רוצים — מעתיקים אותה ושואלים בעזרת מבוגר בכלי שמותר לכם להשתמש בו.' },
  { q: 'מאיזה גיל מותר להשתמש בצ׳טבוטים?', a: 'לרוב הכלים יש גיל מינימום בתנאי השימוש, ולעיתים נדרש אישור הורים. כדאי לבדוק עם הורה או מורה לפני שמשתמשים.' },
]

// ---------- 3. Spot the bot's mistake ----------
const ROUND = 6
export function SpotTheMistake() {
  const [bank, setBank] = useState(null)
  useEffect(() => { import('./mistakeBank').then(m => setBank(m)) }, [])
  const [game, setGame] = useState(0)
  const items = useMemo(() => bank ? shuffle(bank.MISTAKES).slice(0, ROUND) : [], [bank, game])
  const [i, setI] = useState(0), [pick, setPick] = useState(null), [score, setScore] = useState(0)
  useEffect(() => { setI(0); setPick(null); setScore(0) }, [items])
  const it = items[i]
  // The answer split into words; a word inside the wrong phrase is a hit.
  const words = useMemo(() => {
    if (!it) return []
    const start = it.answer.indexOf(it.wrong), end = start + it.wrong.length
    let pos = 0
    return it.answer.split(/(\s+)/).map(w => { const at = pos; pos += w.length; return { w, hit: at < end && at + w.length > start, space: /^\s+$/.test(w) } })
  }, [it])
  const choose = k => { if (pick !== null) return; setPick(k); if (words[k].hit) setScore(s => s + 1) }
  const done = bank && i >= items.length
  return <Page>
    <SEO title="תפסו את הטעות של הבוט — משחק חשיבה ביקורתית על בינה מלאכותית" description="משחק לילדים: צ׳טבוט עונה בביטחון, אבל בכל תשובה מסתתרת טעות אחת. מוצאים אותה, לומדים למה בוטים טועים ואיך בודקים מידע. בלי הרשמה." path="/learn/ai/spot-the-mistake" structuredData={faqSchema(SPOT_FAQ)} />
    <Breadcrumbs items={crumbs('תפסו את הטעות של הבוט')} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2">🔎 תפסו את הטעות של הבוט</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">הבוט נשמע בטוח בעצמו — אבל בכל תשובה יש טעות אחת. לחצו על המילה השגויה.</p>
    {!bank ? <p className="text-center" role="status">טוען…</p> : done ? <section className="ln-box text-center">
      <p className="text-3xl font-black">תפסתם {score} מתוך {items.length} טעויות 🕵️</p>
      <p className="mt-2">בדיוק ככה בודקים בינה מלאכותית: לא מאמינים לכל מה שנשמע בטוח.</p>
      <button type="button" className="ln-btn mt-4" onClick={() => setGame(g => g + 1)}>🔁 עוד סבב</button>
    </section> : <section className="ln-box">
      <p className="text-sm font-bold text-slate-500">שאלה {i + 1} מתוך {items.length} · {it.topic} · נקודות: {score}</p>
      <p className="mt-2 text-lg">🧒 <b>{it.question}</b></p>
      <p className="mt-3 rounded-2xl bg-white p-3 text-lg leading-loose">🤖 {words.map((x, k) => x.space ? x.w : <button key={k} type="button" onClick={() => choose(k)} disabled={pick !== null} className={`rounded px-0.5 ${pick === null ? 'hover:bg-amber-100' : x.hit ? 'bg-rose-200 font-bold' : k === pick ? 'bg-slate-200 line-through' : ''}`}>{x.w}</button>)}</p>
      {pick !== null && <div className="mt-3 rounded-2xl bg-emerald-50 p-3">
        <p className="font-bold">{words[pick].hit ? '✅ תפסתם!' : '❌ לא שם — הטעות מסומנת באדום.'}</p>
        <p className="mt-1">הנכון: {it.fix}</p>
        <p className="mt-1 text-sm text-slate-700">איך בודקים: {it.why}</p>
        <button type="button" className="ln-btn mt-3" onClick={() => { setI(i + 1); setPick(null) }}>{i + 1 < items.length ? 'לשאלה הבאה ←' : 'לתוצאה'}</button>
      </div>}
    </section>}
    {bank?.MISTAKE_TIPS && <><h2 className="mt-10 mb-3 text-2xl font-black">איך בודקים תשובה של בינה מלאכותית?</h2>
      <ul className="space-y-2">{bank.MISTAKE_TIPS.map(t => <li key={t} className="flex gap-2"><span aria-hidden="true">✔️</span><span>{t}</span></li>)}</ul></>}
    <div className="mt-10"><SeoBody paragraphs={['צ׳טבוטים כותבים תשובות שנשמעות בטוחות ומשכנעות, גם כשיש בהן טעות. זה קורה כי הם מנחשים אילו מילים הכי סבירות להופיע, ולא בודקים עובדות כמו אדם. לטעויות כאלה קוראים לפעמים ״הזיות״.', 'במשחק הזה מתאמנים בחשיבה ביקורתית: קוראים בעיון, שמים לב למספרים, שמות ומקומות, ושואלים ״איך אני יכול לבדוק את זה?״. זה כישור חשוב לכל מידע ברשת — לא רק לבינה מלאכותית.']} faq={SPOT_FAQ} related={[{ label: 'למה בינה מלאכותית טועה', href: '/learn/ai/ai-mistakes-hallucinations' }, { label: 'איך בודקים מידע', href: '/learn/ai/checking-information' }, AI]} /></div>
    <MoreTools not="/learn/ai/spot-the-mistake" />
  </Page>
}
const SPOT_FAQ = [
  { q: 'האם התשובות נכתבו בידי בינה מלאכותית?', a: 'לא. התשובות נכתבו במיוחד למשחק כדי להיראות כמו תשובות של בוט, ובכל אחת הוכנסה בכוונה טעות אחת. כל שאר הפרטים בתשובה נכונים.' },
  { q: 'למה בוטים טועים?', a: 'מודל שפה בונה תשובה מהמילים שהכי סביר שיבואו, לפי מה שלמד. הוא לא ״יודע״ אם משפט נכון, ולכן לפעמים ממציא פרטים או מערבב בין דברים.' },
  { q: 'לאיזה גיל מתאים?', a: 'לכיתות ג׳–ז׳. אפשר לשחק בכיתה על הלוח ולדון יחד איך בודקים כל טעות.' },
]
