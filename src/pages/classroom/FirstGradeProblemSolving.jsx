import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { ProblemPicture, SocialCardsSheet, SortIcon, SortSheet, WordProblemsSheet } from '../../components/classroom/ProblemSolvingArt'
import { SOCIAL_CARDS, WORD_PROBLEMS, SORTS, VOCAB_TIPS, answerOf, choicesOf } from '../../data/firstGradeProblemSolving'

// /classroom/first-grade/problem-solving — first-grade readiness through problem solving: social problem
// cards, picture word-problems up to 10, sorting by colour / shape / use, and parents' vocabulary tips.
// Everything works on screen and prints (PrintPreview, A4).
const PATH = '/classroom/first-grade/problem-solving'
const NAV = [['#social', '🤝 כרטיסי מצבים'], ['#word-problems', '🔢 שאלות סיפור'], ['#sorting', '🧺 מיון'], ['#parents', '💬 טיפים להורים']]
const FAQ = [
  { q: 'למה פתרון בעיות חשוב לקראת כיתה א׳?', a: 'בכיתה א׳ הילד פוגש הרבה מצבים חדשים: תור, משחק בהפסקה, משימה שלא הבין. ילד שתרגל לעצור, לחשוב על כמה אפשרויות ולבחור אחת — מרגיש בדרך כלל בטוח יותר להתמודד לבד, ויודע גם מתי לבקש עזרה.' },
  { q: 'איך משתמשים בכרטיסי המצבים?', a: 'קוראים את המצב בקול ושואלים "מה אפשר לעשות?". מקבלים כל רעיון סביר, ורק אחר כך פותחים את הרעיונות בכרטיס ומשווים. אפשר גם לשחק את המצב בתפקידים — עם בובות או בין אחים.' },
  { q: 'השאלות בחשבון קשות מדי לילד שלי. מה עושים?', a: 'מתחילים בשאלות הספירה (1–2) ורק אחר כך עוברים לחיבור. אפשר להניח חפצים אמיתיים על השולחן, לספור באצבע על הציור ולקרוא את הסיפור בשביל הילד. המטרה היא להבין את הסיפור, לא לענות מהר.' },
  { q: 'אפשר להדפיס את הדפים?', a: 'כן. בכל חלק יש כפתור הדפסה: כרטיסי המצבים לגזירה, דף שאלות סיפור עם דף תשובות להורים, ושלושה דפי מיון שבהם מותחים קו מכל ציור לקופסה המתאימה. אפשר גם לשמור כ-PDF.' },
  { q: 'לאיזה גיל זה מתאים?', a: 'לילדים בגן חובה ובתחילת כיתה א׳, בערך בגילאי 5–7. ילדים צעירים יותר ייהנו מהמיון ומשאלות הספירה, בליווי מבוגר.' },
]
const BODY = [
  'מוכנות לכיתה א׳ היא לא רק אותיות ומספרים. ילדים שמגיעים לכיתה עם הרגל לעצור ולחשוב "מה אפשר לעשות?" מתמודדים בקלות רבה יותר עם ריב על צעצוע, עם משימה שלא הבינו או עם שאלה בחשבון. בעמוד הזה ריכזנו פעילויות קצרות שמתרגלות בדיוק את זה — על המסך או בדף מודפס.',
  'כרטיסי המצבים מתרגלים פתרון בעיות חברתי: לכל מצב יש שלושה רעיונות טובים ושאלה לשיחה. שאלות הסיפור בציורים מתרגלות הבנה של סיפור חשבוני פשוט — סופרים ומחברים עד 10. דפי המיון מתרגלים חשיבה לפי כלל: צבע, צורה, ומה עושים עם הדבר.',
  'כדאי לתרגל 10–15 דקות בכל פעם, בלי לחץ, ולעצור כשעוד נהנים. ההכנה הכי טובה לכיתה א׳ היא שיחה טובה, משחק משותף והרבה עידוד.',
]
const RELATED = [{ label: 'הכנה לכיתה א׳ — חוברת ומשחקים', href: '/classroom/first-grade' }, { label: 'כרטיסיות רגשות להדפסה', href: '/printables/emotion-cards' }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }, { label: 'משחקים לכיתה א׳', href: '/games/kita-a' }, { label: 'סודוקו לילדים', href: '/sudoku/kids' }, { label: 'סיפורים לפני השינה', href: '/stories' }]

const Card = ({ id, title, intro, children, className = 'bg-white' }) => <section id={id} aria-labelledby={`${id}-h`} className={`mb-8 scroll-mt-20 rounded-3xl border-2 border-[var(--border)] ${className} p-4 sm:p-6 sketch-shadow`}>
  <h2 id={`${id}-h`} className="mb-2 text-3xl font-black">{title}</h2>
  {intro && <p className="mb-4 text-lg">{intro}</p>}
  {children}
</section>
const PrintButton = ({ onClick, children }) => <button type="button" onClick={onClick} className="min-h-[48px] rounded-2xl bg-slate-900 px-5 font-bold text-white">🖨️ {children}</button>

function SocialCards() {
  const [open, setOpen] = useState({})
  return <div className="grid gap-4 sm:grid-cols-2">{SOCIAL_CARDS.map(c => <article key={c.id} className="rounded-2xl border-2 border-slate-200 bg-white p-4">
    <p className="text-4xl" aria-hidden="true">{c.emoji}</p>
    <h3 className="mt-1 text-xl font-black">{c.title}</h3>
    <p className="mt-1 text-slate-600">מה אפשר לעשות? חושבים יחד, ואז מסתכלים ברעיונות.</p>
    <button type="button" aria-expanded={!!open[c.id]} onClick={() => setOpen(o => ({ ...o, [c.id]: !o[c.id] }))} className="mt-3 min-h-[44px] rounded-xl bg-amber-400 px-4 font-bold">{open[c.id] ? 'הסתרת הרעיונות' : '💡 רעיונות טובים'}</button>
    {open[c.id] && <div className="mt-3 rounded-xl bg-amber-50 p-3">
      <ul className="space-y-1 text-lg">{c.ideas.map(t => <li key={t}>✅ {t}</li>)}</ul>
      <p className="mt-2 font-bold">🗨️ {c.ask}</p>
    </div>}
  </article>)}</div>
}

function WordProblems() {
  const [picks, setPicks] = useState({})
  const done = Object.keys(picks).length, right = WORD_PROBLEMS.filter(p => picks[p.id] === answerOf(p)).length
  return <>
    <div className="grid gap-4 md:grid-cols-2">{WORD_PROBLEMS.map((p, i) => {
      const picked = picks[p.id], ok = picked === answerOf(p)
      return <article key={p.id} className="rounded-2xl border-2 border-slate-200 bg-white p-4">
        <p className="text-lg font-bold">{i + 1}. {p.text}</p>
        <div className="my-3 flex justify-center"><ProblemPicture p={p} /></div>
        <div className="grid grid-cols-3 gap-2" dir="ltr">{choicesOf(p, i).map(n => <button key={n} type="button" disabled={ok} onClick={() => setPicks(x => ({ ...x, [p.id]: n }))} className={`min-h-[52px] rounded-xl border-2 text-2xl font-black ${picked === n ? (ok ? 'border-green-600 bg-green-100' : 'border-red-500 bg-red-50') : 'border-slate-300 bg-white'}`}>{n}</button>)}</div>
        {picked !== undefined && <p className="mt-2 font-bold" aria-live="polite">{ok ? `✅ נכון! ${p.b ? `${p.a} ועוד ${p.b} זה ${answerOf(p)}` : `יש ${answerOf(p)}`}` : '🤔 כמעט — נסו לספור שוב עם האצבע'}</p>}
      </article>
    })}</div>
    {done > 0 && <p className="mt-4 text-center text-xl font-bold" role="status">{right} מתוך {WORD_PROBLEMS.length} נכונות {right === WORD_PROBLEMS.length ? '🌟' : ''} <button type="button" onClick={() => setPicks({})} className="mr-2 text-base underline">מתחילים מחדש</button></p>}
  </>
}

function Sorting({ sort }) {
  const [placed, setPlaced] = useState({}), [sel, setSel] = useState(null), [msg, setMsg] = useState('')
  const left = sort.items.filter(it => !placed[it.id])
  const drop = bin => {
    const item = sort.items.find(it => it.id === sel)
    if (!item) { setMsg('קודם בוחרים ציור, ואז לוחצים על הקופסה.'); return }
    if (item.bin === bin.id) { setPlaced(p => ({ ...p, [item.id]: bin.id })); setSel(null); setMsg(`✅ נכון! ${item.name} — ${bin.label}`) }
    else setMsg(`🤔 ${item.name} לא שייך ל"${bin.label}". נסו קופסה אחרת.`)
  }
  return <>
    <p className="mb-2 text-lg font-bold">{sort.ask} לוחצים על ציור, ואז על הקופסה המתאימה.</p>
    <div className="mb-4 flex min-h-[90px] flex-wrap justify-center gap-2 rounded-2xl bg-white p-3">
      {left.length ? left.map(it => <button key={it.id} type="button" aria-pressed={sel === it.id} aria-label={it.name} onClick={() => { setSel(it.id); setMsg('') }} className={`size-[76px] rounded-2xl border-2 ${sel === it.id ? 'border-violet-600 bg-violet-100 ring-2 ring-violet-400' : 'border-slate-200 bg-white'}`}>
        <svg viewBox="-32 -32 64 64" className="size-full" aria-hidden="true"><SortIcon item={it} /></svg>
      </button>) : <p className="self-center text-2xl font-black">🎉 כל הכבוד! הכול ממוין.</p>}
    </div>
    <p className="mb-3 min-h-[28px] text-center text-lg font-bold" aria-live="polite">{msg}</p>
    <div className="grid grid-cols-3 gap-2 sm:gap-4">{sort.bins.map(bin => <button key={bin.id} type="button" onClick={() => drop(bin)} className="flex min-h-[150px] flex-col items-center rounded-2xl border-4 border-dashed border-slate-400 bg-white p-2 hover:border-violet-500">
      <span className="flex items-center gap-1 text-lg font-black">{bin.fill ? <span className="inline-block size-6 rounded-full border-2 border-slate-800" style={{ background: bin.fill }} /> : bin.emoji ? <span aria-hidden="true">{bin.emoji}</span> : <svg viewBox="-26 -26 52 52" className="size-7" aria-hidden="true"><SortIcon item={bin} /></svg>}{bin.label}</span>
      <span className="mt-2 flex flex-wrap justify-center gap-1">{sort.items.filter(it => placed[it.id] === bin.id).map(it => <svg key={it.id} viewBox="-32 -32 64 64" className="size-9" aria-label={it.name}><SortIcon item={it} /></svg>)}</span>
    </button>)}</div>
    {left.length < sort.items.length && <p className="mt-3 text-center"><button type="button" onClick={() => { setPlaced({}); setSel(null); setMsg('') }} className="underline">מתחילים מחדש</button></p>}
  </>
}

export default function FirstGradeProblemSolving() {
  const [sortId, setSortId] = useState('color'), [print, setPrint] = useState(null)
  const sort = SORTS.find(s => s.id === sortId)
  return <main className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="מוכנות לכיתה א׳ — פתרון בעיות: דפי עבודה ופעילויות" description="הכנה לכיתה א׳ דרך פתרון בעיות: כרטיסי מצבים חברתיים לשיחה, שאלות סיפור בציורים עד 10, דפי מיון לפי צבע, צורה ושימוש, וטיפים להורים להעשרת אוצר המילים. אונליין ולהדפסה, בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }, { label: 'פתרון בעיות' }]} />
    <header className="mb-6 rounded-3xl border-2 border-slate-200 bg-gradient-to-l from-amber-50 via-white to-sky-50 p-5 text-center sm:p-8">
      <p className="text-5xl" aria-hidden="true">🧠🎒</p>
      <h1 className="mt-2 text-4xl font-black sm:text-5xl">מוכנות לכיתה א׳ — פתרון בעיות</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-700">פעילויות קצרות לקראת כיתה א׳: מה עושים כששני ילדים רוצים את אותו צעצוע, שאלות סיפור בציורים, ומיון לפי צבע, צורה ושימוש. משחקים על המסך או מדפיסים דפי עבודה.</p>
    </header>
    <nav aria-label="בעמוד הזה" className="mb-8 flex flex-wrap justify-center gap-2">{NAV.map(([h, l]) => <a key={h} href={h} className="rounded-full border-2 border-slate-800 bg-white px-4 py-2 font-bold">{l}</a>)}</nav>

    <Card id="social" title="🤝 כרטיסי מצבים: מה אפשר לעשות?" intro="עשרה מצבים מהגן ומבית הספר. קוראים את המצב, נותנים לילד להציע פתרון, ואז פותחים את הרעיונות ומדברים: מה הכי מתאים? למה?" className="bg-amber-50">
      <SocialCards />
      <div className="mt-4"><PrintButton onClick={() => setPrint('social')}>הדפסת כרטיסי המצבים לגזירה</PrintButton></div>
    </Card>

    <Card id="word-problems" title="🔢 שאלות סיפור בציורים — עד 10" intro="קוראים את הסיפור לילד, סופרים יחד את הציורים ובוחרים תשובה. שתי השאלות הראשונות הן ספירה בלבד, והשאר חיבור קטן." className="bg-sky-50">
      <WordProblems />
      <div className="mt-4"><PrintButton onClick={() => setPrint('problems')}>הדפסת דף שאלות + תשובות</PrintButton></div>
    </Card>

    <Card id="sorting" title="🧺 דפי מיון: צבע, צורה ושימוש" intro="מיון מלמד לחפש כלל: מה דומה ומה שונה. בוחרים סוג מיון ומשחקים — או מדפיסים ומותחים קו מכל ציור לקופסה." className="bg-green-50">
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label="סוג מיון">{SORTS.map(s => <button key={s.id} type="button" role="radio" aria-checked={sortId === s.id} onClick={() => setSortId(s.id)} className={`min-h-[48px] rounded-xl border-2 px-4 text-lg font-bold ${sortId === s.id ? 'border-slate-800 bg-yellow-200' : 'border-[var(--border)] bg-white'}`}>{s.emoji} {s.title}</button>)}</div>
      <Sorting key={sort.id} sort={sort} />
      <div className="mt-5 flex flex-wrap gap-2"><PrintButton onClick={() => setPrint('sort-one')}>הדפסת {sort.title}</PrintButton><button type="button" onClick={() => setPrint('sort-all')} className="min-h-[48px] rounded-2xl border-2 border-slate-800 bg-white px-5 font-bold">🖨️ כל 3 דפי המיון</button></div>
    </Card>

    <Card id="parents" title="💬 להורים: מעשירים את אוצר המילים בשיחה יומיומית" intro="אוצר מילים עשיר עוזר לילד להסביר מה הוא צריך, להבין הוראות ולפתור בעיות במילים. לא צריך שיעורים — מספיק לשלב את זה בשיחה הרגילה:" className="bg-violet-50">
      <div className="grid gap-3 sm:grid-cols-2">{VOCAB_TIPS.map(t => <div key={t.title} className="rounded-2xl bg-white p-4"><h3 className="text-xl font-black"><span aria-hidden="true">{t.emoji} </span>{t.title}</h3><p className="mt-1">{t.text}</p></div>)}</div>
      <p className="mt-4 text-slate-700">כל ילד מתפתח בקצב שלו. אם משהו בדיבור או בהבנה מטריד אתכם, כדאי לשתף את הגננת או להתייעץ עם איש מקצוע.</p>
    </Card>

    <p className="mb-8 text-center text-lg">עוד הכנה לכיתה א׳: <Link to="/classroom/first-grade" className="font-bold underline">חוברת הכנה, משחקי אותיות וחשבון ←</Link></p>

    {print && <PrintPreview title="מוכנות לכיתה א׳ — פתרון בעיות" onClose={() => setPrint(null)}>
      {print === 'social' && <SocialCardsSheet />}
      {print === 'problems' && <><WordProblemsSheet /><WordProblemsSheet answers /></>}
      {(print === 'sort-one' ? [sort] : print === 'sort-all' ? SORTS : []).map(s => <article key={s.id} className="buga-a4"><div className="print-art"><SortSheet sort={s} /></div></article>)}
    </PrintPreview>}

    <SeoBody paragraphs={BODY} faq={FAQ} related={RELATED} />
  </main>
}
