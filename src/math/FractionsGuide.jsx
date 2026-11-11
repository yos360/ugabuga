import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { STEPS, HOME_IDEAS, FAQ, MORE_LINKS, WALL_ROWS, compareFractions, simplify } from '../data/fractionsGuide'
import '../learn/learn.css'
import './math.css'

// /math/fractions — a hub for teachers and parents: the fraction topics of grades 4–5 in teaching
// order (idea, teaching tip, common mistake, link to practice), a fraction wall and a comparison tool.
const PATH = '/math/fractions'
const ROW_COLORS = ['#fde68a', '#fca5a5', '#93c5fd', '#86efac', '#f9a8d4', '#c4b5fd', '#fdba74', '#67e8f9', '#bef264']

// Fractions are written left to right, as in Israeli textbooks.
const Ltr = ({ children, className = '' }) => <bdi dir="ltr" className={`inline-block ${className}`}>{children}</bdi>
// Text from the data file: the parts between backticks are exercises and are shown left to right.
const Rich = ({ text }) => text.split('`').map((part, i) => (i % 2 ? <Ltr key={i}>{part}</Ltr> : part))

function FractionWall({ hi }) {
  const W = 600, H = 34, X = 4
  return <svg viewBox={`0 0 ${W + 8} ${WALL_ROWS.length * H + 8}`} className="w-full" role="img" aria-label="קיר שברים: שלם, חצאים, שלישים, רבעים, חמישיות, שישיות, שמיניות, עשיריות ושתים־עשרה">
    {WALL_ROWS.map((d, r) => Array.from({ length: d }, (_, i) => {
      const w = W / d, x = X + (W - (i + 1) * w), y = 4 + r * H // right to left, like reading Hebrew
      const lit = hi && hi.d === d && i < hi.n
      return <g key={`${d}-${i}`}>
        <rect x={x} y={y} width={w} height={H - 4} rx="3" fill={lit ? '#1d4ed8' : ROW_COLORS[r]} stroke="#1f2937" strokeWidth="1.2" />
        <text x={x + w / 2} y={y + H / 2 + 2} textAnchor="middle" fontSize={d >= 10 ? 11 : 14} fontWeight="700" fill={lit ? '#fff' : '#1f2937'} direction="ltr">{d === 1 ? '1' : `1/${d}`}</text>
      </g>
    }))}
  </svg>
}

function Bar({ n, d, color }) {
  const W = 300
  return <svg viewBox={`0 0 ${W + 4} 40`} className="w-full" role="img" aria-label={`${n} מתוך ${d} חלקים צבועים`}>
    {Array.from({ length: d }, (_, i) => <rect key={i} x={2 + W - (i + 1) * (W / d)} y="2" width={W / d} height="36" fill={i < n ? color : '#fff'} stroke="#1f2937" strokeWidth="1.5" />)}
  </svg>
}

function FracPick({ label, n, d, setN, setD }) {
  return <fieldset className="flex flex-wrap items-center gap-2">
    <legend className="sr-only">{label}</legend>
    <span className="font-black">{label}:</span>
    <label className="flex items-center gap-1">מונה
      <select value={n} onChange={e => setN(+e.target.value)} className="rounded-lg border-2 border-[var(--border)] bg-white px-2 py-1">
        {Array.from({ length: d }, (_, i) => i + 1).map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    </label>
    <label className="flex items-center gap-1">מכנה
      <select value={d} onChange={e => { const v = +e.target.value; setD(v); if (n > v) setN(v) }} className="rounded-lg border-2 border-[var(--border)] bg-white px-2 py-1">
        {[2, 3, 4, 5, 6, 8, 9, 10, 12].map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    </label>
  </fieldset>
}

function Comparer({ onPick }) {
  const [a, setA] = useState(2), [b, setB] = useState(3), [c, setC] = useState(3), [d, setD] = useState(5)
  const r = compareFractions(a, b, c, d)
  const word = r.sign === '>' ? 'גדול מ' : r.sign === '<' ? 'קטן מ' : 'שווה ל'
  const [sa, sb] = simplify(a, b), [sc, sd] = simplify(c, d)
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-x-8 gap-y-2">
      <FracPick label="שבר ראשון" n={a} d={b} setN={v => { setA(v); onPick({ n: v, d: b }) }} setD={v => { setB(v); onPick(null) }} />
      <FracPick label="שבר שני" n={c} d={d} setN={v => { setC(v); onPick({ n: v, d }) }} setD={v => { setD(v); onPick(null) }} />
    </div>
    <div className="grid gap-1"><span className="font-bold"><Ltr>{a}/{b}</Ltr></span><Bar n={a} d={b} color="#60a5fa" /></div>
    <div className="grid gap-1"><span className="font-bold"><Ltr>{c}/{d}</Ltr></span><Bar n={c} d={d} color="#f472b6" /></div>
    <p className="rounded-xl bg-[var(--card)] p-3 text-lg" aria-live="polite">
      <b><Ltr>{a}/{b}</Ltr> {word}־<Ltr>{c}/{d}</Ltr></b>
      {b !== d && <> — במכנה המשותף <Ltr>{r.L}</Ltr>: <Ltr>{a}/{b} = {r.x}/{r.L}</Ltr> ו־<Ltr>{c}/{d} = {r.y}/{r.L}</Ltr>, ומשווים את המונים.</>}
      {(sa !== a || sc !== c) && <span className="block text-base text-[var(--muted-foreground)]">אחרי צמצום: {sa !== a && <Ltr>{a}/{b} = {sb === 1 ? sa : `${sa}/${sb}`}</Ltr>}{sa !== a && sc !== c && ' · '}{sc !== c && <Ltr>{c}/{d} = {sd === 1 ? sc : `${sc}/${sd}`}</Ltr>}</span>}
    </p>
  </div>
}

function StepCard({ s, n }) {
  return <li id={s.id} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 sketch-shadow-sm scroll-mt-24">
    <h3 className="text-xl font-black"><span aria-hidden="true">{s.emoji} </span>{n}. {s.title} <small className="text-sm font-bold text-[var(--muted-foreground)]">· כיתה {s.grade === 4 ? 'ד׳' : 'ה׳'}</small></h3>
    <p className="mt-2 leading-relaxed"><Rich text={s.idea} /></p>
    <p className="mt-2 rounded-xl bg-sky-50 px-3 py-2 font-bold">דוגמה: <Rich text={s.example} /></p>
    <p className="mt-2 leading-relaxed"><b>💡 איך מלמדים:</b> <Rich text={s.tip} /></p>
    <p className="mt-2 leading-relaxed"><b>⚠️ הטעות הנפוצה:</b> <Rich text={s.mistake} /></p>
    {s.note && <p className="mt-2 text-sm text-[var(--muted-foreground)]">{s.note}</p>}
    <p className="mt-3"><Link to={s.topic} className="ln-btn go">להסבר, לתרגול ולדף להדפסה ←</Link></p>
  </li>
}

export default function FractionsGuide() {
  const [hi, setHi] = useState(null)
  const g4 = STEPS.filter(s => s.grade === 4), g5 = STEPS.filter(s => s.grade === 5)
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="שברים לכיתות ד׳–ה׳ — איך מלמדים שברים, שלב אחר שלב"
      description="מדריך שברים למורה ולהורה: כל נושאי השברים של כיתות ד׳–ה׳ לפי סדר הלימוד — הסבר קצר, טיפ להוראה, הטעות הנפוצה וקישור לתרגול ולדפי עבודה. עם קיר שברים וכלי להשוואת שברים."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מתמטיקה', href: '/math' }, { label: 'שברים לכיתות ד׳–ה׳' }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">🍕</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">שברים לכיתות ד׳–ה׳: איך מלמדים, שלב אחר שלב</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">כל נושאי השברים והמספרים העשרוניים של היסודי, לפי הסדר שבו לומדים אותם. בכל שלב: מה הרעיון, איך מסבירים, איפה ילדים טועים — וקישור לתרגול אונליין ולדף עבודה להדפסה.</p>
    </header>

    <nav className="ln-box mt-6" aria-labelledby="toc-h">
      <h2 id="toc-h" className="text-xl font-black">השלבים בקצרה</h2>
      <ol className="mt-2 grid gap-1 sm:grid-cols-2">
        {STEPS.map((s, i) => <li key={s.id}><a href={`#${s.id}`} className="underline">{i + 1}. {s.title}</a> <small className="text-[var(--muted-foreground)]">(כיתה {s.grade === 4 ? 'ד׳' : 'ה׳'})</small></li>)}
      </ol>
    </nav>

    <section className="mt-8" aria-labelledby="g4-h">
      <h2 id="g4-h" className="mb-3 text-3xl font-black">כיתה ד׳: השבר הפשוט</h2>
      <p className="mb-4 leading-relaxed">בכיתה ד׳ פוגשים את השבר לראשונה כנושא מסודר. המטרה העיקרית היא הבנה: מה שבר מייצג, ולמה שני שברים שונים יכולים להיות שווים. החישובים מגיעים אחרי זה.</p>
      <ol className="grid gap-4">{g4.map(s => <StepCard key={s.id} s={s} n={STEPS.indexOf(s) + 1} />)}</ol>
    </section>

    <section className="mt-10" aria-labelledby="wall-h">
      <h2 id="wall-h" className="text-3xl font-black">🧱 קיר השברים</h2>
      <p className="mt-2 leading-relaxed">כל שורה היא אותו שלם, מחולק לחלקים שווים. מהקיר רואים מיד ש־<Ltr>1/8</Ltr> קטן מ־<Ltr>1/4</Ltr>, ששני רבעים מכסים בדיוק חצי, ושלוש שישיות שוות לחצי. כשבוחרים מונה בכלי ההשוואה, החלק שלו נצבע בכחול על הקיר.</p>
      <div className="mt-3 rounded-2xl border-2 border-[var(--border)] bg-white p-2"><FractionWall hi={hi} /></div>
    </section>

    <section className="ln-box mt-8" aria-labelledby="cmp-h">
      <h2 id="cmp-h" className="text-2xl font-black">⚖️ השוואת שברים — בודקים בציור</h2>
      <p className="mb-3">בוחרים שני שברים ורואים אותם זה מעל זה, יחד עם ההסבר דרך מכנה משותף.</p>
      <Comparer onPick={p => setHi(p && WALL_ROWS.includes(p.d) ? p : null)} />
    </section>

    <section className="mt-10" aria-labelledby="g5-h">
      <h2 id="g5-h" className="mb-3 text-3xl font-black">כיתה ה׳: מכנים שונים ומספרים עשרוניים</h2>
      <p className="mb-4 leading-relaxed">בכיתה ה׳ השברים תופסים כמעט חצי מהשנה. עוברים לחישובים עם מכנים שונים, ולצידם מתחילים את המספרים העשרוניים. משרד החינוך מתיר ללמד קודם שבר פשוט, קודם שבר עשרוני או את שניהם במקביל, ולכן הסדר בכיתה שלכם יכול להיות שונה.</p>
      <ol className="grid gap-4">{g5.map(s => <StepCard key={s.id} s={s} n={STEPS.indexOf(s) + 1} />)}</ol>
    </section>

    <section className="mt-10" aria-labelledby="home-h">
      <h2 id="home-h" className="text-3xl font-black">🏠 שברים בבית: 6 רעיונות להורים</h2>
      <p className="mt-2 leading-relaxed">ילדים מבינים שברים הרבה יותר טוב כשהם פוגשים אותם בחיים. כמה דקות ביום ליד השולחן או במטבח שוות יותר מעוד דף עבודה.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {HOME_IDEAS.map(h => <li key={h.title} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><b className="text-lg"><span aria-hidden="true">{h.emoji} </span>{h.title}</b><p className="mt-1"><Rich text={h.text} /></p></li>)}
      </ul>
    </section>

    <section className="ln-box mt-10" aria-labelledby="more-h">
      <h2 id="more-h" className="text-2xl font-black">📚 עוד תרגול בשברים</h2>
      <div className="mt-3 flex flex-wrap gap-2">{MORE_LINKS.map(l => <Link key={l.href} to={l.href} className="ln-chip">{l.label}</Link>)}</div>
    </section>

    <div className="mt-10"><SeoBody paragraphs={[
      'שברים הם אחד הנושאים שהכי הרבה ילדים מתקשים בהם ביסודי, וגם אחד החשובים: הם הבסיס לאחוזים, ליחס, למספרים עשרוניים ובהמשך גם לאלגברה. הקושי מגיע בדרך כלל מכך שהשבר "שובר" את מה שהילד יודע על מספרים שלמים — פתאום 8 קטן מ־4 כשהוא במכנה, וחיבור לא מחבר את כל המספרים.',
      'לכן הדף הזה בנוי לפי סדר הלימוד, ולא לפי סוגי תרגילים. מתחילים במשמעות (שבר כחלק משלם ושבר מכמות), ממשיכים לשקילות ולהשוואה, ורק אז מחשבים. כל שלב נשען על הקודם: ילד שמתקשה בחיבור שברים עם מכנים שונים צריך לעיתים קרובות לחזור דווקא להרחבה ולצמצום.',
      'בכל שלב יש קישור לדף נושא באזור המתמטיקה של האתר, ובו הסבר מלא, דוגמה פתורה, תרגול אונליין עם בדיקה מיידית בשלוש רמות, ודף עבודה להדפסה עם דף תשובות. מורות יכולות להדפיס דף חדש בכל לחיצה, והורים יכולים לתת לילד לתרגל על המסך ולראות הסבר לכל טעות.',
    ]} faq={FAQ} related={[{ label: 'דפי עבודה בשברים', href: '/printables/fractions-worksheets' }, { label: 'מחשבון שברים', href: '/tools/fraction-calculator' }, { label: 'מתמטיקה לפי כיתה', href: '/math' }]} /></div>
  </div>
}
