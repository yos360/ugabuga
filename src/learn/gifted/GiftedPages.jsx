import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../../pages/NotFound'
import { TYPES, LEVELS, explain, describeCell } from './giftedData'
import { MatrixFigure, CellFigure } from './Figures'
import '../learn.css'
import './gifted.css'

const HUB = '/learn/gifted-test'
const HUB_CRUMB = { label: 'הכנה למבחן מחוננים', href: HUB }
const LETTERS = ['א', 'ב', 'ג', 'ד']
const TYPE_BY_KEY = Object.fromEntries(TYPES.map(t => [t.key, t]))
const shuffle = a => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[x[i], x[j]] = [x[j], x[i]] } return x }
const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const Chip = ({ on, onClick, children }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick}>{children}</button>

// ── one question: the stem and the option contents, per type ──
function Stem({ type, item, print = false }) {
  if (type === 'verbal') return <div className="gt-analogy" aria-label={`${item.pair[0]} ל${item.pair[1]} כמו ${item.ask} ל…`}>
    <span>{item.pair[0]}</span><i>:</i><span>{item.pair[1]}</span><b>כמו</b><span>{item.ask}</span><i>:</i><span className="q">?</span></div>
  if (type === 'series') return <div className="gt-series">{item.seq.map((n, i) => <span key={i}>{n}</span>)}<span className="q">?</span></div>
  if (type === 'matrices') return <MatrixFigure m={item} className={print ? 'gt-matrix is-print' : 'gt-matrix'} />
  return <p className="gt-logic">{item.q}</p>
}
const OptionBody = ({ type, opt }) => type === 'matrices' ? <CellFigure c={opt} /> : <span>{opt}</span>
const optionText = (type, opt) => type === 'matrices' ? describeCell(opt) : String(opt)
const prompt = type => type === 'verbal' ? 'איזו מילה מתאימה במקום סימן השאלה?' : type === 'series' ? 'מה המספר הבא בסדרה?' : type === 'matrices' ? 'איזו צורה משלימה את המשבצת החסרה?' : null

// ── online quiz: explanation after each answer, score at the end ──
function Quiz({ pool, count, label }) {
  const [run, setRun] = useState(null) // { qs:[{type,item}], i, picks:[] }
  const start = () => setRun({ qs: shuffle(pool).slice(0, count), i: 0, picks: [] })
  if (!run) return <div className="ln-box text-center space-y-3">
    <p className="text-lg">{label}</p>
    <button type="button" className="ln-btn go" onClick={start}>▶ מתחילים ({Math.min(count, pool.length)} שאלות)</button>
  </div>
  const done = run.i >= run.qs.length
  if (done) {
    const score = run.qs.filter((q, i) => run.picks[i] === q.item.answer).length
    return <div className="ln-box text-center space-y-4">
      <h3 className="text-3xl font-black">{score} מתוך {run.qs.length} {score === run.qs.length ? '🌟' : score >= run.qs.length * 0.7 ? '👏' : '💪'}</h3>
      <p>{score === run.qs.length ? 'מושלם! אפשר לנסות סבב נוסף עם שאלות אחרות.' : 'כל טעות היא הזדמנות להבין את החוק. אפשר לחזור על השאלות שפספסתם:'}</p>
      <ol className="gt-review">{run.qs.map((q, i) => { const ok = run.picks[i] === q.item.answer; return <li key={q.item.id}><span aria-hidden="true">{ok ? '✅' : '❌'}</span> {TYPE_BY_KEY[q.type].short} · שאלה {i + 1}{!ok && <> — התשובה הנכונה: <b>{LETTERS[q.item.answer]}</b></>}</li> })}</ol>
      <div className="flex flex-wrap justify-center gap-3"><button type="button" className="ln-btn go" onClick={start}>🔁 סבב חדש</button><button type="button" className="ln-btn alt" onClick={() => setRun(null)}>סיום</button></div>
    </div>
  }
  const { type, item } = run.qs[run.i]
  const picked = run.picks[run.i]
  const answered = picked !== undefined
  const pick = j => { if (answered) return; const picks = [...run.picks]; picks[run.i] = j; setRun({ ...run, picks }) }
  return <div className="ln-box">
    <div className="flex justify-between text-sm font-bold"><span>שאלה {run.i + 1} מתוך {run.qs.length}</span><span>{TYPE_BY_KEY[type].short} · {LEVELS[item.level]}</span></div>
    <div className="ln-bar my-3"><i style={{ width: `${(run.i / run.qs.length) * 100}%` }} /></div>
    {prompt(type) && <p className="font-bold text-center mb-2">{prompt(type)}</p>}
    <Stem type={type} item={item} />
    <div className={`gt-opts ${type === 'matrices' ? 'is-fig' : ''}`} role="group" aria-label="תשובות">
      {item.options.map((o, j) => <button key={j} type="button" aria-pressed={picked === j} disabled={answered} onClick={() => pick(j)} aria-label={`${LETTERS[j]}: ${optionText(type, o)}`}
        className={`ln-opt gt-opt ${answered && j === item.answer ? 'is-right' : ''} ${answered && picked === j && j !== item.answer ? 'is-wrong' : ''}`}><b className="gt-letter">{LETTERS[j]}</b><OptionBody type={type} opt={o} /></button>)}
    </div>
    {answered && <div className={`gt-exp ${picked === item.answer ? 'ok' : 'no'}`} role="status">
      <b>{picked === item.answer ? '✔ נכון!' : `✘ לא בדיוק — התשובה הנכונה היא ${LETTERS[item.answer]}.`}</b> {explain(type, item)}
    </div>}
    <div className="mt-4 flex flex-wrap justify-center gap-3">
      {answered && <button type="button" className="ln-btn go" onClick={() => setRun({ ...run, i: run.i + 1 })}>{run.i + 1 < run.qs.length ? 'לשאלה הבאה ◀' : 'לתוצאה ◀'}</button>}
      <button type="button" className="underline" onClick={() => setRun(null)}>יציאה</button>
    </div>
  </div>
}

// ── printable sets of 10 with an answer page ──
function PrintSheets({ t, from }) {
  const items = t.items.slice(from, from + 10)
  return <>
    <article className="buga-flow ln-print gt-print" dir="rtl">
      <h2>{t.title} — שאלות {from + 1}–{from + items.length}</h2>
      <div className="meta"><span>שם: __________________</span><span>תאריך: ____________</span><span>הצלחתי: ____ מתוך {items.length}</span></div>
      <p className="gt-print-how">{t.how} מקיפים את האות של התשובה הנכונה.</p>
      <ol className="gt-print-qs">{items.map((it, i) => <li key={it.id} value={from + i + 1} className={t.key === 'matrices' ? 'is-fig' : ''}>
        <div className="stem"><Stem type={t.key} item={it} print /></div>
        <ul className={t.key === 'matrices' ? 'figs' : 'txt'}>{it.options.map((o, j) => <li key={j}><b>{LETTERS[j]}.</b> <OptionBody type={t.key} opt={o} /></li>)}</ul>
      </li>)}</ol>
    </article>
    <article className="buga-flow ln-print gt-print" dir="rtl">
      <h2>תשובות והסברים — {t.title} {from + 1}–{from + items.length}</h2>
      <ol className="gt-print-key">{items.map((it, i) => <li key={it.id} value={from + i + 1}><b>{LETTERS[it.answer]}</b> — {explain(t.key, it)}</li>)}</ol>
    </article>
  </>
}

// ── hub ──
const HUB_FAQ = [
  { q: 'באיזו כיתה עושים מבחן מחוננים?', a: 'ברוב המקומות בישראל תהליך האיתור של משרד החינוך מתחיל בכיתה ב׳, ובחלק מהמקומות בכיתה ג׳. המועדים המדויקים משתנים, ולכן כדאי לברר מול בית הספר.' },
  { q: 'מה ההבדל בין שלב א׳ לשלב ב׳?', a: 'שלב א׳ הוא מבחן מיון ראשוני שנערך בדרך כלל בכיתה. תלמידים שמגיעים בו להישגים גבוהים מוזמנים לשלב ב׳ — מבחן נוסף ומעמיק יותר, שעל פיו נקבע מי יוזמן לתוכניות למחוננים או למצטיינים.' },
  { q: 'אפשר להתכונן למבחן מחוננים?', a: 'המבחן בודק חשיבה ולא ידע שאפשר לשנן. מה שכן עוזר הוא היכרות מוקדמת עם סוגי השאלות, כדי שהילד לא יופתע ויגיע רגוע. תרגול ממושך ולחוץ לא מומלץ — הוא בעיקר מעייף ומלחיץ.' },
  { q: 'יש מבחן מחוננים בכיתה ו׳?', a: 'האיתור המרכזי נערך בדרך כלל בכיתות הנמוכות. בחלק מהמקומות יש תוכניות ותהליכי קבלה גם לשכבות גבוהות יותר, אבל הם משתנים ממקום למקום — כדאי לשאול בבית הספר. השאלות כאן מתאימות לתרגול חשיבה גם בכיתות ד׳–ו׳, ובמיוחד השאלות ברמה "מאתגר".' },
  { q: 'השאלות כאן לקוחות מהמבחן האמיתי?', a: 'לא. כל 120 השאלות נכתבו במיוחד לאתר, בהשראת סוגי החשיבה שנבדקים במבחנים כאלה. האתר אינו קשור למשרד החינוך או לגוף שמחבר את המבחנים.' },
  { q: 'כמה זמן ביום כדאי לתרגל?', a: 'מספיק 10–15 דקות, כמה פעמים בשבוע. עדיף סבב קצר אחד של 10 שאלות עם שיחה על ההסברים, מאשר שעה של שאלות ברצף.' },
]
const TIPS = [
  ['😌', 'רגוע וקליל', 'מציגים את התרגול כמשחק חשיבה ולא כ"הכנה למבחן חשוב". ילד רגוע חושב טוב יותר.'],
  ['⏱️', 'קצר ובקביעות', '10–15 דקות, כמה פעמים בשבוע. עוצרים כשהילד מתעייף — גם באמצע.'],
  ['🗣️', '"איך ידעת?"', 'שואלים על דרך החשיבה ולא רק על התוצאה. כשהילד מסביר את החוק במילים שלו — הוא באמת הבין אותו.'],
  ['👀', 'לקרוא את כל התשובות', 'מרגילים לעבור על כל ארבע האפשרויות לפני שבוחרים. לפעמים התשובה הראשונה שנראית נכונה היא מלכודת.'],
  ['🚫', 'בלי לשנן', 'אין טעם לשנן תשובות — במבחן יהיו שאלות אחרות. המטרה היא להכיר את סוגי השאלות ולהרגיש בנוח איתן.'],
  ['💛', 'התוצאה היא לא הילד', 'מבחן הוא תמונה של יום אחד. כדאי להגיד את זה לילד לפני המבחן — ולזכור את זה גם אחריו.'],
]
export function GiftedHub() {
  const pool = useMemo(() => TYPES.flatMap(t => t.items.map(item => ({ type: t.key, item }))), [])
  return <Page>
    <SEO title="הכנה למבחן מחוננים — 120 שאלות תרגול לשלב א׳ ושלב ב׳, חינם" description="תרגול לקראת מבחן מחוננים: 120 שאלות מקוריות באנלוגיות, סדרות מספרים, מטריצות צורות וחשיבה לוגית — עם הסבר לכל תשובה, מבחן משולב אונליין ודפים להדפסה." path={HUB} structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים בבית', href: '/learn' }, { label: HUB_CRUMB.label }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🧠 </span>הכנה למבחן מחוננים</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">120 שאלות תרגול מקוריות בארבעה סוגים — עם הסבר לכל תשובה</p>
    <p className="gt-note">התרגול באתר נכתב במיוחד לעוגה בוגה. הוא <b>אינו</b> המבחן הרשמי, אינו קשור למשרד החינוך, והשאלות אינן לקוחות ממבחנים אמיתיים.</p>
    <div className="grid gap-5 sm:grid-cols-2 mt-6">{TYPES.map(t => <Link key={t.key} to={`${HUB}/${t.slug}`} className="wobbly card-lift border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow p-5 text-right">
      <div className="text-4xl mb-2" aria-hidden="true">{t.emoji}</div><h2 className="text-2xl font-bold">{t.title}</h2><p className="text-[var(--muted-foreground)]">{t.how}</p><small className="font-bold">30 שאלות · אונליין ולהדפסה</small></Link>)}</div>
    <h2 className="mt-10 mb-3 text-3xl font-black">מבחן תרגול משולב</h2>
    <Quiz pool={pool} count={12} label="12 שאלות מעורבבות מכל ארבעת הסוגים. אחרי כל תשובה מופיע הסבר, ובסוף — הציון." />
    <h2 className="mt-10 mb-3 text-3xl font-black">איך נראה תהליך האיתור?</h2>
    <div className="space-y-3 text-lg leading-relaxed">
      <p>משרד החינוך מפעיל תהליך לאיתור תלמידים מחוננים ומצטיינים. ברוב המקומות הוא נערך בכיתה ב׳, ובחלק מהמקומות בכיתה ג׳, ובנוי בדרך כלל משני שלבים:</p>
      <ul className="gt-steps">
        <li><b>שלב א׳ — מבחן מיון.</b> מבחן קבוצתי שנערך בדרך כלל בכיתה. תלמידים שמגיעים בו להישגים גבוהים מוזמנים לשלב הבא.</li>
        <li><b>שלב ב׳ — מבחן מעמיק יותר.</b> מבחן נוסף לתלמידים שהוזמנו אליו. לפי התוצאות נקבע מי יוזמן לתוכניות למחוננים או למצטיינים.</li>
      </ul>
      <p>המבחנים בודקים בעיקר דרכי חשיבה ולא חומר שנלמד בעל פה. בדרך כלל יש בהם שלושה תחומים: <b>חשיבה מילולית</b> (למשל קשרים בין מילים), <b>חשיבה כמותית</b> (מספרים, סדרות ובעיות) ו<b>חשיבה צורנית־לוגית</b> (צורות, דפוסים וחוקיות).</p>
      <p>הפרטים המדויקים — מועדים, מבנה המבחן וסוגי התוכניות — משתנים בין שנים ובין יישובים. את המידע העדכני כדאי לקבל מבית הספר וממשרד החינוך.</p>
    </div>
    <h2 className="mt-10 mb-3 text-3xl font-black">טיפים להורים</h2>
    <div className="grid gap-4 sm:grid-cols-2">{TIPS.map(([e, t, d]) => <div key={t} className="ln-box"><h3 className="text-xl font-bold"><span aria-hidden="true">{e} </span>{t}</h3><p>{d}</p></div>)}</div>
    <div className="mt-12"><SeoBody paragraphs={['כל סוג שאלות כאן כולל 30 שאלות בשלוש רמות קושי — קל, בינוני ומאתגר. אפשר לפתור אונליין, עם הסבר מיד אחרי כל תשובה, או להדפיס דפים של 10 שאלות עם דף תשובות והסברים להורה.', 'מטריצות הצורות מצוירות לפי חוקים מוגדרים (צורה, מספר, מילוי, גודל וכיוון), והתשובות בסדרות המספרים נבדקות מול החוק של כל סדרה — כך שלכל שאלה יש תשובה נכונה אחת בדיוק.']} faq={HUB_FAQ} related={[{ label: 'לומדים בבית', href: '/learn' }, { label: 'חידות לילדים', href: '/riddles/topics' }, { label: 'אתגר לוח הכפל', href: '/learn/times-tables' }]} /></div>
  </Page>
}

// ── type pages ──
const TYPE_TEXT = {
  verbal: {
    seoTitle: 'אנלוגיות מילוליות למבחן מחוננים — 30 שאלות תרגול עם הסברים',
    seoDesc: '30 שאלות אנלוגיה מילולית בעברית לתרגול לקראת מבחן מחוננים: "ציפור : קן = דבורה : ?". מבחן אונליין עם הסבר לכל תשובה ודפים להדפסה עם דף תשובות.',
    paras: ['באנלוגיה מילולית יש שני זוגות של מילים. בזוג הראשון יש קשר מסוים — הפכים, חלק ושלם, כלי ומה עושים בו, מקום ומי שגר בו — וצריך למצוא מילה שיוצרת בדיוק אותו קשר עם המילה השלישית.', 'הדרך הכי טובה לפתור: להגיד את הקשר במשפט. "ציפור גרה בקן" — ואז להציב: "דבורה גרה ב…". אם יותר מתשובה אחת נראית מתאימה, כנראה שהמשפט עדיין כללי מדי — מנסחים אותו מדויק יותר.'],
    faq: [
      { q: 'איך מסבירים לילד מה זו אנלוגיה?', a: 'אומרים: "מה הקשר בין שתי המילים הראשונות? עכשיו מחפשים חברה למילה השלישית — עם אותו קשר בדיוק". אחר כך מתרגלים בעל פה עם דוגמאות מהבית: "כפית למרק כמו מזלג ל…".' },
      { q: 'מה עושים כששתי תשובות נראות נכונות?', a: 'מנסחים את הקשר במשפט מדויק יותר, ובודקים אותו מול כל אחת מהתשובות. לרוב רק אחת מתאימה למשפט המדויק.' },
      { q: 'לאיזה גיל מתאימות השאלות?', a: 'השאלות ברמה "קל" מתאימות כבר לכיתות א׳–ב׳, והשאלות ברמה "מאתגר" — שבהן הקשר מופשט יותר — מתאימות גם לילדים גדולים יותר.' },
    ] },
  series: {
    seoTitle: 'סדרות מספרים למבחן מחוננים — 30 שאלות "מה המספר הבא" עם הסברים',
    seoDesc: '30 סדרות מספרים לתרגול לקראת מבחן מחוננים: חיבור, כפל, הפרשים גדלים וסדרות משולבות. מבחן אונליין עם הסבר לכל סדרה ודפים להדפסה עם תשובות.',
    paras: ['בסדרת מספרים יש חוק קבוע, וצריך לגלות אותו כדי לדעת מה המספר הבא. לפעמים החוק פשוט — "מוסיפים 3 בכל צעד" — ולפעמים הוא משלב שתי פעולות לסירוגין, הפרשים שגדלים, או שתי סדרות ששזורות זו בזו.', 'שיטה שעובדת כמעט תמיד: כותבים מתחת לסדרה את ההפרש בין כל שני מספרים סמוכים. אם ההפרשים לא קבועים — בודקים אם הם עצמם יוצרים סדרה, או אם המספרים מוכפלים. הסדרות כאן נקראות מימין לשמאל, כמו בעברית.'],
    faq: [
      { q: 'מאיזה צד קוראים את הסדרה?', a: 'מימין לשמאל, כמו טקסט בעברית: המספר הראשון בצד ימין, וסימן השאלה בסוף — בצד שמאל.' },
      { q: 'מה עושים כשההפרשים לא קבועים?', a: 'בודקים אם ההפרשים עצמם גדלים בקביעות (1, 2, 3…), אם המספרים מוכפלים (פי 2, פי 3), או אם יש בעצם שתי סדרות לסירוגין — אחת במקומות האי־זוגיים ואחת בזוגיים.' },
      { q: 'האם התשובות נבדקו?', a: 'כן. כל סדרה כאן מוגדרת לפי חוק, והתשובה הנכונה מחושבת מהחוק ונבדקת אוטומטית מול ארבע האפשרויות.' },
    ] },
  matrices: {
    seoTitle: 'מטריצות צורות למבחן מחוננים — 30 שאלות חשיבה צורנית עם הסברים',
    seoDesc: '30 מטריצות של 3×3 לתרגול חשיבה צורנית לקראת מבחן מחוננים: צורה, מספר, מילוי, גודל וכיוון. פותרים אונליין עם הסבר, או מדפיסים עם דף תשובות.',
    paras: ['במטריצה יש תשע משבצות בשלוש שורות ושלושה טורים, ומשבצת אחת חסרה. הצורות משתנות לפי חוקים: לפעמים הצורה עצמה מתחלפת, לפעמים מספר הצורות גדל, המילוי משתנה מריק למלא, הגודל גדל או החץ מסתובב.', 'כדאי לבדוק כל תכונה בנפרד: קודם רק הצורה, אחר כך רק המספר, אחר כך רק המילוי. כך מגלים שבמטריצה אחת יכולים לפעול שני חוקים או שלושה בבת אחת. המשבצת החסרה היא תמיד השמאלית התחתונה, והשורות נקראות מימין לשמאל.'],
    faq: [
      { q: 'איך מתחילים לפתור מטריצה?', a: 'מסתכלים על השורה העליונה ושואלים: מה משתנה ממשבצת למשבצת, ומה נשאר אותו דבר? אחר כך בודקים אם אותו חוק מתקיים גם בשורה השנייה, ורק אז משלימים את השלישית.' },
      { q: 'מה זה "כל אפשרות פעם אחת"?', a: 'בחלק מהמטריצות כל שורה וכל טור מכילים את אותן שלוש אפשרויות (למשל ריק, מפוספס ומלא), כל אחת פעם אחת — כמו בסודוקו קטן. במשבצת החסרה תבוא האפשרות שעוד לא הופיעה בשורה.' },
      { q: 'אפשר להדפיס את המטריצות?', a: 'כן. בוחרים סט של 10 מטריצות ולוחצים על "להדפסה". מקבלים דפי שאלות עם ארבע אפשרויות לכל מטריצה, ודף תשובות עם הסבר מילולי לכל אחת.' },
    ] },
  logic: {
    seoTitle: 'חשיבה לוגית ובעיות מילוליות למבחן מחוננים — 30 שאלות עם פתרונות',
    seoDesc: '30 שאלות חשיבה לוגית ובעיות מילוליות לילדים: סדר וגובה, ימים ושעות, ספירה חכמה ומסקנות. תרגול לקראת מבחן מחוננים, אונליין ולהדפסה עם פתרונות.',
    paras: ['שאלות של חשיבה לוגית בודקות אם אפשר להסיק מסקנה נכונה מכמה נתונים: מי הכי גבוה, איזה יום יהיה מחר, כמה רגליים יש בחצר, או מה בטוח נכון ומה לא. החשבון בהן פשוט — האתגר הוא לקרוא בעיון ולא ליפול במלכודת.', 'טיפ שעוזר: לצייר. שורה של ילדים, עצים עם רווחים, קופסאות בתוך קופסאות — ציור קטן בצד הדף חוסך הרבה טעויות. ובסוף בודקים את התשובה מול השאלה: האם ענינו בדיוק על מה ששאלו?'],
    faq: [
      { q: 'מה המלכודות הנפוצות בשאלות כאלה?', a: 'לענות על שאלה אחרת ממה ששאלו (למשל לחשב את הסך הכול כששאלו על יום אחד), לשכוח פריט (כמו הקופסה הגדולה עצמה), או לבלבל בין מספר העצים למספר הרווחים ביניהם.' },
      { q: 'מה עושים כשהילד נתקע?', a: 'מבקשים ממנו לצייר את השאלה או להמחיש אותה עם חפצים מהבית — כפיות, קוביות או מטבעות. ברוב המקרים הפתרון מופיע מעצמו.' },
      { q: 'יש כאן גם שאלות לכיתות גבוהות?', a: 'כן. השאלות ברמה "מאתגר" — כמו חתכים בחבל או ראשים ורגליים בחווה — מתאימות גם לכיתות ד׳–ו׳.' },
    ] },
}
function Sample({ t, item, n }) {
  return <div className="ln-q gt-sample">
    <p className="font-bold">שאלה לדוגמה {n} · {LEVELS[item.level]}</p>
    {prompt(t.key) && <p className="mb-1">{prompt(t.key)}</p>}
    <Stem type={t.key} item={item} />
    <ul className={`gt-sample-opts ${t.key === 'matrices' ? 'is-fig' : ''}`}>{item.options.map((o, j) => <li key={j}><b>{LETTERS[j]}.</b> <OptionBody type={t.key} opt={o} /></li>)}</ul>
    <details><summary>תשובה והסבר</summary><p><b>התשובה: {LETTERS[item.answer]}.</b> {explain(t.key, item)}</p></details>
  </div>
}
export function GiftedType() {
  const { type } = useParams()
  const t = TYPES.find(x => x.slug === type)
  const [count, setCount] = useState(10)
  const [printFrom, setPrintFrom] = useState(null)
  const pool = useMemo(() => t ? t.items.map(item => ({ type: t.key, item })) : [], [t])
  if (!t) return <NotFound />
  const txt = TYPE_TEXT[t.key]
  const samples = [1, 2, 3].map(l => t.items.find(i => i.level === l)).filter(Boolean)
  const levelCount = l => t.items.filter(i => i.level === l).length
  return <Page>
    <SEO title={txt.seoTitle} description={txt.seoDesc} path={`${HUB}/${t.slug}`} structuredData={faqSchema(txt.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים בבית', href: '/learn' }, HUB_CRUMB, { label: t.title }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{t.emoji} </span>{t.title}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-4">30 שאלות תרגול למבחן מחוננים · {levelCount(1)} קלות, {levelCount(2)} בינוניות, {levelCount(3)} מאתגרות</p>
    <p className="gt-note"><b>איך פותרים?</b> {t.how}</p>
    <div className="my-4 flex flex-wrap justify-center gap-2" role="group" aria-label="כמה שאלות">
      <Chip on={count === 10} onClick={() => setCount(10)}>10 שאלות אקראיות</Chip>
      <Chip on={count === 30} onClick={() => setCount(30)}>כל 30 השאלות</Chip>
    </div>
    <Quiz key={count} pool={pool} count={count} label={`${count === 30 ? 'כל 30 השאלות' : '10 שאלות אקראיות'} בסדר מעורבב. אחרי כל תשובה מופיע הסבר.`} />
    <div className="ln-box mt-6 text-center">
      <h2 className="text-2xl font-black mb-2">🖨️ להדפסה</h2>
      <p className="mb-3">שלושה דפי תרגול של 10 שאלות, כל אחד עם דף תשובות והסברים להורה.</p>
      <div className="flex flex-wrap justify-center gap-2">{[0, 10, 20].map(f => <button key={f} type="button" className="ln-btn alt" onClick={() => setPrintFrom(f)}>שאלות {f + 1}–{f + 10}</button>)}</div>
    </div>
    {printFrom !== null && <PrintPreview title={`${t.title} — שאלות ${printFrom + 1}–${printFrom + 10}`} onClose={() => setPrintFrom(null)}><PrintSheets t={t} from={printFrom} /></PrintPreview>}
    <h2 className="mt-10 mb-3 text-3xl font-black">שאלות לדוגמה</h2>
    <div className="space-y-4">{samples.map((it, i) => <Sample key={it.id} t={t} item={it} n={i + 1} />)}</div>
    <h2 className="mt-10 mb-3 text-2xl font-black">עוד סוגי שאלות</h2>
    <div className="grid gap-3 sm:grid-cols-3">{TYPES.filter(x => x.key !== t.key).map(x => <Link key={x.key} to={`${HUB}/${x.slug}`} className="ln-box card-lift text-right"><b>{x.emoji} {x.title}</b></Link>)}</div>
    <div className="mt-12"><SeoBody paragraphs={[...txt.paras, 'השאלות נכתבו במיוחד לאתר לצורך תרגול, ואינן לקוחות ממבחני האיתור של משרד החינוך. האתר אינו קשור למשרד החינוך.']} faq={txt.faq} related={[{ label: 'הכנה למבחן מחוננים — עמוד ראשי', href: HUB }, { label: 'לומדים בבית', href: '/learn' }]} /></div>
  </Page>
}
