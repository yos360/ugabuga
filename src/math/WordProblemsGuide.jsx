import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import NotFound from '../pages/NotFound'
import { GRADES, METHOD, MISTAKES, FAQ, LEVEL_LABELS, gradeBySlug } from '../data/wordProblemsByGrade'
import '../learn/learn.css'
import './math.css'

// /math/word-problems and /math/word-problems/grade-2|3|4 — word problems by grade: the four solving
// steps, 12 graded problems per grade with full worked solutions, on-screen practice and a printable sheet.
const HUB = '/math/word-problems'
const fmt = n => n.toLocaleString('en-US')
const Expr = ({ s }) => <bdi dir="ltr" className="whitespace-nowrap font-bold">{s}</bdi>

function Solution({ q }) {
  return <ol className="mt-2 space-y-1 text-[15px] leading-relaxed">
    <li><b>1. מה שואלים?</b> {q.ask}</li>
    <li><b>2. מה נתון?</b> {q.given.join(' · ')}</li>
    <li><b>3. איזו פעולה?</b> {q.op}: {q.steps.map((s, i) => <span key={i}>{i > 0 && ' ← '}<Expr s={`${s.e} = ${fmt(s.r)}`} /></span>)}</li>
    <li><b>4. בדיקה ותשובה:</b> <Expr s={q.check} /> ✓ · <b>{q.sentence}</b></li>
  </ol>
}

function Practice({ g }) {
  const [level, setLevel] = useState(0)
  const list = g.problems.filter(q => !level || q.level === level)
  const [i, setI] = useState(0)
  const [val, setVal] = useState('')
  const [res, setRes] = useState(null)
  const [score, setScore] = useState(0)
  const done = i >= list.length, q = list[Math.min(i, list.length - 1)]
  const restart = lv => { setLevel(lv); setI(0); setVal(''); setRes(null); setScore(0) }
  const check = () => { if (res || val === '') return; const ok = Number(val) === q.answer; setRes(ok ? 'ok' : 'bad'); if (ok) setScore(s => s + 1) }
  const next = () => { setI(x => x + 1); setVal(''); setRes(null) }
  return <div>
    <div className="flex flex-wrap gap-2" role="group" aria-label="בחירת רמה">
      {[0, 1, 2, 3].map(l => <button key={l} type="button" onClick={() => restart(l)} aria-pressed={l === level}
        className={`rounded-xl border-2 px-3 py-2 font-bold ${l === level ? 'border-blue-700 bg-blue-700 text-white' : 'border-[var(--border)] bg-white'}`}>{l ? `${LEVEL_LABELS[l].split(' · ')[0]} · ${g.levelNames[l]}` : 'כל 12 השאלות'}</button>)}
    </div>
    {done ? <div className="mt-5 rounded-2xl bg-green-50 p-5 text-center" aria-live="polite">
      <p className="text-3xl font-black">{score === list.length ? '🏆' : score >= list.length * 0.7 ? '🎉' : '💪'} {score} מתוך {list.length}</p>
      <p className="mt-2">{score === list.length ? 'מושלם! אפשר לנסות את הכיתה הבאה.' : 'כדאי לקרוא שוב את הפתרונות של השאלות שהיו קשות ולנסות שוב.'}</p>
      <button type="button" onClick={() => restart(level)} className="ln-btn go mt-4">🔄 עוד פעם</button>
    </div> : <div className="mt-5">
      <p className="text-sm text-[var(--muted-foreground)]">שאלה {i + 1} מתוך {list.length} · {LEVEL_LABELS[q.level]} · נכונות: {score}</p>
      <p className="mt-2 text-xl leading-relaxed">{q.text} <b>{q.ask}</b></p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="font-bold" htmlFor="wp-ans">התשובה:</label>
        <input id="wp-ans" inputMode="numeric" value={val} disabled={!!res} onChange={e => setVal(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          onKeyDown={e => { if (e.key === 'Enter') { if (res) next(); else check() } }}
          className="w-28 rounded-lg border-2 border-[var(--border)] bg-white px-2 py-1 text-center text-2xl font-black" />
        <span className="font-bold">{q.unit}</span>
        {!res ? <button type="button" onClick={check} className="ln-btn go">✔️ בדיקה</button>
          : <button type="button" onClick={next} className="ln-btn go">{i === list.length - 1 ? 'לתוצאה ←' : 'לשאלה הבאה ←'}</button>}
      </div>
      <div aria-live="polite" className="mt-3">
        {res && <div className={`rounded-xl p-3 ${res === 'ok' ? 'bg-green-50' : 'bg-amber-50'}`}>
          <p className="font-bold">{res === 'ok' ? '✔️ נכון!' : `התשובה הנכונה: ${fmt(q.answer)} ${q.unit}`}</p>
          <Solution q={q} />
        </div>}
      </div>
    </div>}
  </div>
}

function PrintSheets({ g }) {
  const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
  const box = { border: '1px solid #ccc', borderRadius: 8, padding: '3mm', width: '100%', marginBottom: '3mm', fontSize: 15, lineHeight: 1.6 }
  const halves = [g.problems.slice(0, 6), g.problems.slice(6)]
  return <>
    {halves.map((qs, h) => <article key={h} className="buga-a4" style={page}>
      <h2>📖 שאלות מילוליות · {g.label} {h ? '(המשך)' : ''}</h2>
      {!h && <p style={{ fontSize: 13, margin: '0 0 6px', textAlign: 'center' }}>שם: ____________ · בכל שאלה: מה שואלים? מה נתון? איזו פעולה? בודקים ועונים במשפט.</p>}
      {qs.map(q => <div key={q.id} style={box}>
        <b>{g.problems.indexOf(q) + 1}.</b> {q.text} <b>{q.ask}</b>
        <div style={{ marginTop: '2mm', minHeight: q.level === 3 ? '24mm' : '16mm', borderBottom: '1px dashed #bbb' }}><small style={{ color: '#666' }}>תרגיל:</small></div>
        <div style={{ marginTop: '2mm' }}><small style={{ color: '#666' }}>תשובה במשפט:</small> ________________________________</div>
      </div>)}
      <footer>ugabuga.co.il{HUB}/{g.slug} · שאלות מילוליות ל{g.label}</footer>
    </article>)}
    <article className="buga-a4" style={page}>
      <h2>✅ תשובות · {g.label}</h2>
      <ol style={{ fontSize: 14, lineHeight: 1.7, width: '100%', paddingInlineStart: 24 }}>
        {g.problems.map(q => <li key={q.id} style={{ marginBottom: 4 }}>
          <bdi dir="ltr">{q.steps.map(s => `${s.e} = ${fmt(s.r)}`).join('   →   ')}</bdi> · <b>{q.sentence}</b>
        </li>)}
      </ol>
      <footer>ugabuga.co.il{HUB}/{g.slug} · דף תשובות</footer>
    </article>
  </>
}

function MethodCards() {
  return <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {METHOD.map((m, i) => <li key={m.title} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4">
      <div className="text-3xl" aria-hidden="true">{m.emoji}</div>
      <b className="mt-1 block text-lg">{i + 1}. {m.title}</b>
      <p className="mt-1 leading-relaxed">{m.text}</p>
    </li>)}
  </ol>
}

const GradeLinks = ({ current }) => <nav className="flex flex-wrap justify-center gap-2" aria-label="בחירת כיתה">
  {GRADES.map(x => <Link key={x.slug} to={`${HUB}/${x.slug}`} aria-current={x.slug === current ? 'page' : undefined}
    className={`rounded-xl border-2 px-4 py-2 text-lg font-black ${x.slug === current ? 'border-blue-700 bg-blue-700 text-white' : 'border-[var(--border)] bg-white'}`}>{x.emoji} {x.label}</Link>)}
</nav>

const MORE = [
  { label: 'בעיות מילוליות — מורה פרטי', href: '/tutoring/word-problems' },
  { label: 'חוברת שאלות מילוליות בעשרת הראשונה', href: '/booklets/word-problems-special-ed' },
  { label: 'חוברת שאלות מילוליות לכיתה ה׳', href: '/booklets/word-problems-grade5-special-ed' },
  { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' },
  { label: 'מתמטיקה לפי כיתה', href: '/math' },
]

function Hub() {
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="שאלות מילוליות בחשבון לכיתות ב׳, ג׳ ו־ד׳ — עם פתרון מלא"
      description="שאלות מילוליות בחשבון לפי כיתה: 4 שלבי פתרון, 12 שאלות מדורגות לכל כיתה עם פתרון צעד אחר צעד, תרגול על המסך ודף עבודה להדפסה עם תשובות — חינם."
      path={HUB} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מתמטיקה', href: '/math' }, { label: 'שאלות מילוליות' }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">📖</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">שאלות מילוליות בחשבון לפי כיתה</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">ארבעה שלבים שעובדים בכל בעיה, ולכל כיתה 12 שאלות מדורגות עם פתרון מלא, תרגול על המסך ודף עבודה להדפסה.</p>
    </header>
    <div className="mt-6"><GradeLinks /></div>
    <section className="mt-10" aria-labelledby="method-h">
      <h2 id="method-h" className="text-3xl font-black">ארבעת השלבים לפתרון שאלה מילולית</h2>
      <MethodCards />
    </section>
    <section className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="הכיתות">
      {GRADES.map(x => <Link key={x.slug} to={`${HUB}/${x.slug}`} className="wobbly card-lift border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow p-4 text-right">
        <div className="text-4xl" aria-hidden="true">{x.emoji}</div>
        <h2 className="mt-1 text-2xl font-black">שאלות מילוליות ל{x.label}</h2>
        <p className="mt-1 text-sm leading-relaxed">{Object.values(x.levelNames).join(' · ')}</p>
      </Link>)}
    </section>
    <section className="mt-10" aria-labelledby="mist-h">
      <h2 id="mist-h" className="text-2xl font-black">⚠️ הטעויות הנפוצות</h2>
      <ul className="mt-3 grid gap-3">{MISTAKES.map(m => <li key={m.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4"><b>{m.title}.</b> {m.text}</li>)}</ul>
    </section>
    <div className="mt-10"><SeoBody paragraphs={[
      'שאלות מילוליות הן החלק בחשבון שבו ילדים נתקעים הכי הרבה, גם כשהם יודעים לחשב היטב. הקושי הוא לא בחישוב אלא בהבנת הסיפור: מה קרה, מה כבר ידוע ומה מחפשים. לכן הדף מתחיל בארבעה שלבים קבועים שחוזרים בכל בעיה, מכיתה ב׳ ועד סוף היסודי.',
      'לכל כיתה יש 12 שאלות בשלוש רמות: שאלות של שלב אחד, שאלות כפל וחילוק, ושאלות של שני שלבים. לכל שאלה יש פתרון מלא לפי ארבעת השלבים, עם תרגיל הבדיקה ומשפט התשובה. אפשר לתרגל על המסך עם בדיקה מיידית, או להדפיס דף עבודה עם מקום לתרגיל ולתשובה ודף תשובות נפרד.',
    ]} faq={FAQ} related={MORE} /></div>
  </div>
}

export default function WordProblemsGuide() {
  const { gradeSlug } = useParams()
  const [print, setPrint] = useState(false)
  if (!gradeSlug) return <Hub />
  const g = gradeBySlug(gradeSlug)
  if (!g) return <NotFound />
  const path = `${HUB}/${g.slug}`
  const example = g.problems.find(q => q.level === 3)
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`שאלות מילוליות ל${g.label} — 12 שאלות עם פתרון ודף עבודה`}
      description={`שאלות מילוליות בחשבון ל${g.label}: ${Object.values(g.levelNames).join(', ')}. 12 שאלות מדורגות עם פתרון מלא צעד אחר צעד, תרגול על המסך ודף עבודה להדפסה עם תשובות.`}
      path={path} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מתמטיקה', href: '/math' }, { label: 'שאלות מילוליות', href: HUB }, { label: g.label }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">{g.emoji}</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">שאלות מילוליות ל{g.label}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{g.intro}</p>
    </header>
    <div className="mt-5"><GradeLinks current={g.slug} /></div>
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <a href="#practice" className="ln-btn go">✏️ לתרגול</a>
      <a href="#all" className="ln-btn alt">📋 כל השאלות והפתרונות</a>
      <button type="button" onClick={() => setPrint(true)} className="ln-btn alt">🖨️ דף עבודה להדפסה</button>
    </div>

    <section className="mt-10" aria-labelledby="method-h">
      <h2 id="method-h" className="text-3xl font-black">ארבעה שלבים לכל שאלה</h2>
      <MethodCards />
    </section>

    <section className="ln-box mt-10" aria-labelledby="ex-h">
      <h2 id="ex-h" className="text-2xl font-black">🔍 דוגמה פתורה: שאלה של שני שלבים</h2>
      <p className="mt-2 text-lg leading-relaxed">{example.text} <b>{example.ask}</b></p>
      <Solution q={example} />
    </section>

    <section id="practice" className="mt-10 scroll-mt-24" aria-labelledby="prac-h">
      <h2 id="prac-h" className="text-3xl font-black">✏️ תרגול: עונים ובודקים</h2>
      <p className="mb-4 mt-2 leading-relaxed">כותבים רק את המספר. אחרי כל תשובה מופיע הפתרון המלא לפי ארבעת השלבים. אפשר לתרגל את כל השאלות או רמה אחת.</p>
      <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><Practice key={g.slug} g={g} /></div>
    </section>

    <section id="all" className="mt-10 scroll-mt-24" aria-labelledby="all-h">
      <h2 id="all-h" className="text-3xl font-black">📋 כל 12 השאלות עם פתרון</h2>
      {[1, 2, 3].map(l => <div key={l} className="mt-5">
        <h3 className="text-xl font-black">{LEVEL_LABELS[l].split(' · ')[0]}: {g.levelNames[l]}</h3>
        <ol className="mt-2 grid gap-3">{g.problems.filter(q => q.level === l).map(q => <li key={q.id} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <p className="leading-relaxed"><b>{g.problems.indexOf(q) + 1}.</b> {q.text} <b>{q.ask}</b></p>
          <details className="mt-2"><summary className="cursor-pointer font-bold text-blue-700">הצגת הפתרון</summary><Solution q={q} /></details>
        </li>)}</ol>
      </div>)}
    </section>

    <section className="ln-box mt-10" aria-labelledby="print-h">
      <h2 id="print-h" className="text-2xl font-black">🖨️ דף עבודה: שאלות מילוליות ל{g.label}</h2>
      <p className="mt-2 leading-relaxed">שני עמודים עם 12 השאלות, מקום לתרגיל ולמשפט התשובה, ועמוד תשובות עם כל שלבי החישוב.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPrint(true)} className="ln-btn go">🖨️ לתצוגה ולהדפסה</button>
        <Link to={g.topicHref} className="ln-btn alt">🎲 עוד שאלות חדשות בכל פעם</Link>
      </div>
    </section>

    <section className="mt-10" aria-labelledby="mist-h">
      <h2 id="mist-h" className="text-2xl font-black">⚠️ הטעויות הנפוצות</h2>
      <ul className="mt-3 grid gap-3">{MISTAKES.map(m => <li key={m.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4"><b>{m.title}.</b> {m.text}</li>)}</ul>
    </section>

    {print && <PrintPreview title={`שאלות מילוליות ל${g.label} — דף עבודה`} onClose={() => setPrint(false)}><PrintSheets g={g} /></PrintPreview>}

    <div className="mt-10"><SeoBody paragraphs={[
      `${g.intro} בדף הזה יש 12 שאלות מקוריות ל${g.label}, מסודרות בשלוש רמות: ${Object.values(g.levelNames).join(', ')}.`,
      'לכל שאלה יש פתרון מלא לפי ארבעה שלבים קבועים — מה שואלים, מה נתון, איזו פעולה, ובדיקה עם משפט תשובה — כדי שהילד ילמד דרך חשיבה ולא רק תשובה. בתרגול על המסך כותבים את התשובה ומקבלים מיד את הפתרון, ודף העבודה להדפסה כולל מקום לתרגיל, למשפט התשובה ודף תשובות נפרד.',
    ]} faq={FAQ} related={[{ label: 'שאלות מילוליות — כל הכיתות', href: HUB }, { label: `מתמטיקה ל${g.label}`, href: `/math/${g.slug}` }, ...MORE]} /></div>
  </div>
}
