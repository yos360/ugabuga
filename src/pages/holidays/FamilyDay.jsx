import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'
import { wrapLines } from '../../data/hanukkahLighting'
import {
  FAMILY_DAY_PATH as PATH, FAMILY_DAY_DATE, FAMILY_SHAPES, LOSS_GUIDE, SAY_AVOID, ACTIVITIES, GRADE_FILTERS,
  POEM, FAMILY_IS, GIFT_IDEAS, FAMILY_DAY_FAQ as FAQ,
} from '../../data/familyDay'

// /holidays/family-day: Israeli Family Day (30 Shevat) in kindergarten and class. Inclusive of every
// family shape, with concrete guidance for teachers, six activities, an original poem and four A4
// printables: a flexible family tree, an interview sheet, a recipe card and a "family is…" card.

const INK = '#1f2937', GREEN = '#2f855a', SOFT = '#fff7e6', LINE = '#9ca3af'

// A row of writing lines: n lines from y, spaced gap, between x1 and x2.
const Lines = ({ x1, x2, y, n = 1, gap = 9 }) => Array.from({ length: n }, (_, i) =>
  <path key={i} d={`M${x1} ${y + i * gap} H${x2}`} stroke={LINE} strokeWidth="0.35" />)

const SLOTS = [[100, 52], [57, 72], [143, 72], [30, 102], [170, 102], [74, 118], [126, 118], [100, 92]]

// Sheet 1: a tree with eight empty leaves. No labels like "mum" or "dad": the child chooses who is on it.
function TreeSheet({ name }) {
  return <Sheet label="העץ שלי">
    <T x="100" y="16" size="12" weight="800" fill={INK}>העץ שלי</T>
    <T x="190" y="27" size="4.6" anchor="start">{`שם: ${name || '________________'}`}</T>
    {wrapLines("כל עלה הוא מישהו שאני אוהב או מי שדואג לי: אדם, חיה, חבר או שכן. אפשר להוסיף עלים, ואפשר להשאיר ריקים.", 78).map((l, i) => <T key={i} x="100" y={34 + i * 5} size="4" fill="#555">{l}</T>)}
    <g stroke="#7b5a3a" strokeWidth="2" fill="none" strokeLinecap="round">
      {SLOTS.map(([x, y]) => <path key={x + '-' + y} d={`M100 152 C100 138 ${x} ${y + 30} ${x} ${y + 9}`} />)}
    </g>
    <path d="M94 196 C96 178 97 164 97 150 H103 C103 164 104 178 106 196 Z" fill="#7b5a3a" />
    {SLOTS.map(([x, y]) => <g key={x + '-' + y}>
      <rect x={x - 21} y={y - 10} width="42" height="19" rx="9.5" fill="#fff" stroke={GREEN} strokeWidth="0.9" />
      <T x={x} y={y + 1.6} size="3.6" fill="#b0b7c3">שם או ציור</T>
    </g>)}
    <path d="M10 196 Q100 186 190 196" stroke="#7b5a3a" strokeWidth="1" fill="none" />
    <path d="M94 196 Q70 206 50 204 M106 196 Q130 206 150 204 M100 196 V210" stroke="#7b5a3a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    <T x="100" y="223" size="6.4" weight="800" fill={GREEN}>השורשים: מה אנחנו אוהבים לעשות ביחד</T>
    <Lines x1={25} x2={175} y={236} n={3} gap={9} />
    <T x="100" y="266" size="4" fill="#777">עוגה בוגה · יום המשפחה</T>
  </Sheet>
}

const INTERVIEW_Q = [
  'מה היה המשחק הכי אהוב עליך בילדות?',
  'איפה גרת בילדות? איך נראו הבית או הרחוב?',
  'מה היה האוכל שהכי אהבת בילדות?',
  'מי לימד אותך משהו חשוב, ומה למדת?',
  'מה כיף לך לעשות היום?',
  'איזו עצה אפשר לקבל ממך?',
]

function InterviewSheet() {
  return <Sheet label="דף ראיון עם מישהו מהמשפחה">
    <T x="100" y="16" size="11" weight="800" fill={INK}>ראיון עם מישהו שאני אוהב</T>
    <T x="190" y="29" size="5" anchor="start">שם המרואיין: ____________________</T>
    <T x="190" y="38" size="5" anchor="start">מי הוא או היא בשבילי: ____________________</T>
    <T x="190" y="47" size="5" anchor="start">תאריך: ______________</T>
    {INTERVIEW_Q.map((q, i) => <g key={q}>
      <circle cx="187" cy={64 + i * 31} r="4" fill={GREEN} />
      <T x="187" y={65.6 + i * 31} size="4.6" weight="800" fill="#fff">{i + 1}</T>
      <T x="180" y={65.6 + i * 31} size="5.4" weight="700" anchor="start">{q}</T>
      <Lines x1={14} x2={186} y={74 + i * 31} n={2} gap={9} />
    </g>)}
    <T x="190" y="253" size="5" weight="700" anchor="start">הדבר שהכי הפתיע אותי:</T>
    <Lines x1={14} x2={186} y={262} n={1} />
  </Sheet>
}

// One recipe card, 190 × 127, at (0, y).
function RecipeCard({ y }) {
  return <g transform={`translate(5 ${y})`}>
    <rect x="0" y="0" width="190" height="127" rx="6" fill={SOFT} stroke="#b7791f" strokeWidth="0.8" />
    <rect x="3" y="3" width="184" height="121" rx="4" fill="none" stroke="#b7791f" strokeWidth="0.3" strokeDasharray="2 1.4" />
    <T x="95" y="15" size="9" weight="800" fill="#7b341e">כרטיס מתכון משפחתי</T>
    <T x="180" y="26" size="5" anchor="start">שם המנה: ______________________</T>
    <T x="95" y="26" size="5" anchor="start">מי מכין אצלנו: ________________</T>
    <T x="180" y="37" size="5.2" weight="800" anchor="start" fill="#7b341e">מצרכים</T>
    <Lines x1={100} x2={180} y={46} n={6} gap={8} />
    <T x="90" y="37" size="5.2" weight="800" anchor="start" fill="#7b341e">איך מכינים</T>
    <Lines x1={10} x2={90} y={46} n={6} gap={8} />
    <T x="180" y="105" size="5" anchor="start">מה מיוחד במנה הזאת אצלנו:</T>
    <Lines x1={10} x2={180} y={116} n={1} />
  </g>
}

const RecipeSheet = () => <Sheet label="כרטיס מתכון משפחתי, שני כרטיסים בדף">
  <RecipeCard y={5} />
  <RecipeCard y={138} />
  <path d="M2 135 H198" stroke="#888" strokeWidth="0.3" strokeDasharray="2.5 2" />
</Sheet>

function Heart({ x, y, s = 1, fill = '#e11d48' }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 6 C-14 -6 -6 -16 0 -8 C6 -16 14 -6 0 6 Z" fill={fill} />
}

function IsCard({ y, text, to, from }) {
  const lines = wrapLines(text, 30)
  const size = lines.length > 2 ? 6.4 : 7.6
  return <g transform={`translate(5 ${y})`}>
    <rect x="0" y="0" width="190" height="127" rx="6" fill="#fff5f7" stroke="#e11d48" strokeWidth="0.8" />
    <rect x="3" y="3" width="184" height="121" rx="4" fill="none" stroke="#e11d48" strokeWidth="0.3" strokeDasharray="2 1.4" />
    <Heart x={95} y={19} s={1.1} /><Heart x={72} y={22} s={0.6} fill="#fb7185" /><Heart x={118} y={22} s={0.6} fill="#fb7185" />
    <T x="95" y="48" size="15" weight="800" fill="#9f1239">משפחה זה…</T>
    {lines.map((l, i) => <T key={i} x="95" y={66 + i * 11} size={size * 1.5} weight="700" fill={INK}>{l}</T>)}
    <T x="180" y="108" size="5" anchor="start">{`בשביל: ${to || '____________________'}`}</T>
    <T x="180" y="118" size="5" anchor="start">{`מאת: ${from || '____________________'}`}</T>
  </g>
}

const IsSheet = ({ text, to, from }) => <Sheet label="שני כרטיסי משפחה זה לגזירה">
  <IsCard y={5} {...{ text, to, from }} />
  <IsCard y={138} {...{ text, to, from }} />
  <path d="M2 135 H198" stroke="#888" strokeWidth="0.3" strokeDasharray="2.5 2" />
</Sheet>

const SHEET_LIST = [
  { id: 'tree', label: '🌳 העץ שלי', print: 'העץ שלי, דף 1' },
  { id: 'interview', label: '🎤 ראיון', print: 'דף ראיון משפחתי' },
  { id: 'recipe', label: '🍲 כרטיס מתכון', print: 'כרטיס מתכון משפחתי' },
  { id: 'is', label: '💌 משפחה זה…', print: 'כרטיס משפחה זה' },
]

function Tag({ children }) {
  return <span className="rounded-full bg-amber-100 px-3 py-0.5 text-sm font-bold">{children}</span>
}

function ActivityCard({ a, i }) {
  const labels = { gan: 'גן', ab: 'א׳–ב׳', cd: 'ג׳–ד׳' }
  return <li className="rounded-3xl border-2 border-[var(--border)] bg-white p-4 sm:p-5">
    <h3 className="mb-2 text-xl font-black sm:text-2xl"><span aria-hidden="true">{a.emoji} </span>{i + 1}. {a.title}</h3>
    <p className="mb-3 flex flex-wrap gap-2"><Tag>⏱️ {a.time}</Tag>{a.grades.map(g => <Tag key={g}>{labels[g]}</Tag>)}</p>
    <p className="mb-2 text-base"><b>מה צריך:</b> {a.materials}</p>
    <ol className="list-decimal space-y-1.5 pr-6 text-lg leading-relaxed">{a.steps.map(s => <li key={s}>{s}</li>)}</ol>
    <p className="mt-3 rounded-xl bg-[var(--postit)] p-3 text-base"><b>🤍 שימו לב:</b> {a.care}</p>
  </li>
}

export default function FamilyDay() {
  const [grade, setGrade] = useState('all'), [sheet, setSheet] = useState('tree'), [name, setName] = useState('')
  const [pick, setPick] = useState(0), [own, setOwn] = useState(''), [to, setTo] = useState(''), [from, setFrom] = useState('')
  const [print, setPrint] = useState(null) // null | 'one' | 'all'
  const text = own.trim() || FAMILY_IS[pick]
  const nodes = { tree: <TreeSheet name={name.trim()} />, interview: <InterviewSheet />, recipe: <RecipeSheet />, is: <IsSheet text={text} to={to.trim()} from={from.trim()} /> }
  const shown = ACTIVITIES.filter(a => grade === 'all' || a.grades.includes(grade))
  const chip = on => `min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-slate-800 bg-amber-200' : 'border-[var(--border)] bg-white'}`
  const toPrint = print === 'all' ? SHEET_LIST : SHEET_LIST.filter(s => s.id === sheet)
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="יום המשפחה בגן ובכיתה — פעילויות, עץ משפחה גמיש ודפים להדפסה" description="יום המשפחה (ל׳ בשבט) לכל סוגי המשפחות: הנחיות למורה, 6 פעילויות לגן ולכיתות א׳–ד׳, עץ משפחה שמתאים לכל משפחה, ראיון, כרטיס מתכון וכרטיס ״משפחה זה…״ להדפסה. בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, { label: 'יום המשפחה' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">👨‍👩‍👧 יום המשפחה בגן ובכיתה</h1>
    <p className="mx-auto mb-4 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">פעילויות, דפים להדפסה ושיר שמתאימים לכל ילד, בכל צורה של משפחה.</p>
    <p className="mx-auto mb-8 max-w-xl rounded-2xl border-2 border-[var(--border)] bg-amber-50 p-3 text-center text-lg"><b>📅 יום המשפחה השנה:</b> {FAMILY_DAY_DATE.hebrew}, {FAMILY_DAY_DATE.gregorian}</p>

    <section className="mb-10" aria-labelledby="shapes-h">
      <h2 id="shapes-h" className="mb-2 text-2xl font-bold sm:text-3xl">🏠 לפני הכול: מי המשפחה של הילדים שלכם?</h2>
      <p className="mb-4 text-lg leading-relaxed">בכל כיתה יש הרבה צורות של משפחה. הכלל הפשוט: מנסחים משימות פתוחות ("מי שחשוב לי") ולא סגורות ("אמא ואבא"), ונותנים לילד לבחור מה לשתף. כך כל ילד יכול להשתתף, בלי שמישהו יצטרך להסביר למה הבית שלו שונה.</p>
      <ul className="mb-6 grid gap-3 sm:grid-cols-2">{FAMILY_SHAPES.map(s => <li key={s.id} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <h3 className="mb-1 text-xl font-bold"><span aria-hidden="true">{s.emoji} </span>{s.title}</h3>
        <p className="text-base leading-relaxed">{s.tip}</p>
      </li>)}</ul>

      <div className="mb-6 overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-white">
        <h3 className="bg-amber-100 p-3 text-xl font-bold">🗣️ במקום להגיד… אפשר להגיד</h3>
        <ul className="divide-y divide-[var(--border)]">{SAY_AVOID.map(r => <li key={r.avoid} className="grid gap-1 p-3 sm:grid-cols-2 sm:gap-4">
          <p className="text-base"><span className="font-bold text-rose-700">פחות: </span>{r.avoid}</p>
          <p className="text-base"><span className="font-bold text-green-800">יותר: </span>{r.say}</p>
        </li>)}</ul>
      </div>

      <div className="rounded-3xl border-2 border-[var(--border)] bg-[#f4f1ff] p-5">
        <h3 className="mb-1 text-2xl font-bold">🕯️ {LOSS_GUIDE.title}</h3>
        <p className="mb-3 text-lg">{LOSS_GUIDE.intro}</p>
        <ol className="list-decimal space-y-2 pr-6 text-lg leading-relaxed">{LOSS_GUIDE.steps.map(s => <li key={s}>{s}</li>)}</ol>
      </div>
    </section>

    <section className="mb-10" aria-labelledby="acts-h">
      <h2 id="acts-h" className="mb-3 text-2xl font-bold sm:text-3xl">🎨 שש פעילויות ליום המשפחה</h2>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="סינון לפי גיל">
        {GRADE_FILTERS.map(f => <button key={f.id} type="button" aria-pressed={grade === f.id} onClick={() => setGrade(f.id)} className={chip(grade === f.id)}>{f.label}</button>)}
      </div>
      <ul className="space-y-4">{shown.map(a => <ActivityCard key={a.id} a={a} i={ACTIVITIES.indexOf(a)} />)}</ul>
    </section>

    <section className="mb-10 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5" aria-labelledby="poem-h">
      <h2 id="poem-h" className="mb-3 text-2xl font-bold sm:text-3xl">📜 {POEM.title}</h2>
      <p className="mb-3 text-base">שיר מקורי להקראה בגן ובכיתה.</p>
      <div className="mb-4 text-lg leading-loose sm:text-xl">{POEM.lines.map((l, i) => l ? <p key={i}>{l}</p> : <p key={i} className="h-4" aria-hidden="true" />)}</div>
      <p className="text-base"><b>איך משתמשים:</b> {POEM.use}</p>
    </section>

    <section className="mb-10 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-5" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-1 text-2xl font-bold sm:text-3xl">🖨️ דפים להדפסה</h2>
      <p className="mb-4 text-lg">ארבעה דפים בגודל A4. בוחרים דף, ממלאים מה שרוצים (אפשר גם להשאיר ריק ולמלא בכתב יד) ומדפיסים או שומרים כ־PDF.</p>
      <div className="mb-4"><Choice label="בחירת דף" value={sheet} onChange={setSheet} options={SHEET_LIST.map(s => [s.id, s.label])} /></div>
      <div className="grid items-start gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {sheet === 'tree' && <Field label="שם הילד או הילדה (לא חובה)" value={name} onChange={setName} maxLength={24} placeholder="אפשר להשאיר ריק" />}
          {sheet === 'is' && <>
            <div className="space-y-2"><p className="text-center font-bold">משלימים את המשפט "משפחה זה…"</p>
              <div className="flex flex-wrap justify-center gap-2">{FAMILY_IS.map((t, i) => <button key={t} type="button" aria-pressed={!own.trim() && pick === i} onClick={() => { setPick(i); setOwn('') }} className={chip(!own.trim() && pick === i)}>{t}</button>)}</div>
            </div>
            <label className="block text-center font-bold">או כותבים משלכם
              <textarea value={own} maxLength={70} rows={2} onChange={e => setOwn(e.target.value)} placeholder="למשל: לחבק חזק ביום גשום" className="mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" />
            </label>
            <Field label="בשביל (לא חובה)" value={to} onChange={setTo} maxLength={22} placeholder="למי הכרטיס" />
            <Field label="מאת (לא חובה)" value={from} onChange={setFrom} maxLength={22} placeholder="שם הילד" />
          </>}
          {sheet === 'interview' && <p className="rounded-xl bg-white p-3 text-base">שש שאלות פתוחות ומקום לכתוב. הילד שואל והמרואיין עונה, ומי שעדיין לא כותב יכול להקליט בטלפון.</p>}
          {sheet === 'recipe' && <p className="rounded-xl bg-white p-3 text-base">שני כרטיסים בדף: אחד נשאר בבית והשני חוזר לכיתה לספר המתכונים. גוזרים לאורך הקו.</p>}
          <div className="flex flex-wrap justify-center gap-3">
            <button data-print-main type="button" onClick={() => setPrint('one')} className="min-h-[52px] rounded-2xl bg-amber-600 px-6 text-xl font-bold text-white">🖨️ הדפסת הדף הזה</button>
            <button type="button" onClick={() => setPrint('all')} className="min-h-[52px] rounded-2xl border-2 border-[var(--border)] bg-white px-6 text-lg font-bold">כל ארבעת הדפים</button>
          </div>
        </div>
        <button type="button" onClick={() => setPrint('one')} aria-label="הדפסת הדף שנבחר" className="mx-auto w-full max-w-sm rounded-2xl border-2 border-[var(--border)] bg-white p-2 sketch-shadow-sm">{nodes[sheet]}</button>
      </div>
    </section>

    <section className="mb-10" aria-labelledby="gift-h">
      <h2 id="gift-h" className="mb-2 text-2xl font-bold sm:text-3xl">🎁 מתנה קטנה שהילדים לוקחים הביתה</h2>
      <p className="mb-4 text-lg">מתנה שהילד מכין בעצמו ונותן למי שהוא בוחר, בלי להגביל להורים.</p>
      <ul className="grid gap-3 sm:grid-cols-2">{GIFT_IDEAS.map(g => <li key={g.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <h3 className="mb-1 text-xl font-bold"><span aria-hidden="true">{g.emoji} </span>{g.title}</h3>
        <p className="text-base leading-relaxed">{g.text}</p>
      </li>)}</ul>
    </section>

    {print && <PrintPreview title={print === 'all' ? 'יום המשפחה: ארבעה דפים' : toPrint[0].print} onClose={() => setPrint(null)}>
      {toPrint.map(s => <article key={s.id} className="buga-a4"><div className="print-art">{nodes[s.id]}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)}
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד בנושא: <Link className="font-bold underline" to="/family-names">שמות משפחה: פירוש ומקור</Link> · <Link className="font-bold underline" to="/learn/communities/find-your-roots">איך מגלים מאיזו עדה אנחנו</Link> · <Link className="font-bold underline" to="/classroom">כלים למורים</Link> · <Link className="font-bold underline" to="/holidays">כל החגים</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'יום המשפחה מצוין בישראל ב־ל׳ בשבט, ובגנים ובבתי הספר הוא הזדמנות לדבר על הבית ועל האנשים שאוהבים אותנו. במשך שנים הוא נחגג בעיקר דרך עץ משפחה ומתנה לאמא, ולא כל ילד מוצא את עצמו בזה. הדף הזה מציע דרך אחרת: משימות פתוחות שבהן הילד בוחר מי נמצא בעץ שלו.',
      'הדף מתאים לגננות ולמורים בגן ובכיתות א׳–ד׳, ומכיל הנחיות מעשיות למשפחות עם הורה אחד, שתי אימהות או שני אבות, סבא וסבתא שמגדלים, הורים גרושים, אומנה ואימוץ, וגם למקרה שהורה של ילד נפטר. יש בו שש פעילויות, שיר מקורי, ארבעה דפים להדפסה ורעיונות למתנה שהילדים לוקחים הביתה.',
    ]} faq={FAQ} related={[{ label: 'חגים', href: '/holidays' }, { label: 'שמות משפחה', href: '/family-names' }, { label: 'מורים וגננות', href: '/classroom' }, { label: 'עדות ישראל', href: '/learn/communities' }]} /></div>
  </div>
}
