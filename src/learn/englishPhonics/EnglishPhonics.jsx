import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { speak } from '../../utils/speak'
import {
  PHONICS_PATH, LETTERS, VOWELS, CVC, DIGRAPHS, SIGHT_WORDS, SENTENCES, STAGES, FAQ, PARENT_TIPS,
  vowelOf, practiceFor, worksheetFor,
} from '../../data/englishPhonics'
import '../learn.css'

// /learn/english-phonics — learning to read English from zero for grades 2–5, with Hebrew
// instructions: six stages (letter sounds → short vowels → blending → letter teams → sight words →
// first sentences), each with an on-screen practice and a printable worksheet with answers.

const say = text => { void speak(text, 'en-US', { rate: 0.75 }) }
const En = ({ children, className = '' }) => <bdi dir="ltr" lang="en" className={className}>{children}</bdi>
function Ear({ text, label }) {
  return <button type="button" onClick={() => say(text)} className="rounded-full border-2 border-[var(--border)] bg-white px-2 text-lg leading-8 hover:bg-sky-50" aria-label={label || `השמיעו: ${text}`}>🔊</button>
}

function Practice({ stageId }) {
  const [seed, setSeed] = useState(1)
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  const list = practiceFor(stageId, seed, 10)
  const done = i >= list.length
  const restart = () => { setSeed(s => s + 1); setI(0); setPick(null); setScore(0) }
  if (done) return <div className="text-center" aria-live="polite">
    <p className="text-2xl font-black">{score >= 9 ? '🏆' : score >= 7 ? '🌟' : '💪'} {score} מתוך {list.length}</p>
    <p className="mt-1">{score >= 9 ? 'מצוין! אפשר לעבור לשלב הבא.' : score >= 7 ? 'יפה מאוד. עוד סבב אחד, ואז ממשיכים.' : 'כדאי לחזור על השלב עוד כמה ימים. זה בסדר גמור.'}</p>
    <button type="button" onClick={restart} className="ln-btn go mt-3">🔄 סבב חדש</button>
  </div>
  const q = list[i], answered = pick !== null, right = answered && pick === q.answer
  const choose = k => { if (answered) return; setPick(k); if (k === q.answer) setScore(s => s + 1) }
  return <div>
    <p className="text-sm text-[var(--muted-foreground)]">שאלה {i + 1} מתוך {list.length} · נכונות: {score}</p>
    <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-center">
      {q.prompt.emoji && <span className="text-6xl" aria-hidden="true">{q.prompt.emoji}</span>}
      {q.prompt.big && <En className="text-3xl font-black tracking-wide sm:text-4xl">{q.prompt.big}</En>}
      {q.prompt.say && <Ear text={q.prompt.say} label="השמיעו באנגלית" />}
    </div>
    <p className="mt-2 text-center text-lg font-bold">{q.prompt.he}</p>
    <div className="mt-3 flex flex-wrap justify-center gap-2" role="group" aria-label="תשובות">
      {q.options.map((o, k) => <button key={o.t} type="button" onClick={() => choose(k)} disabled={answered}
        className={`min-w-[64px] rounded-xl border-2 px-4 py-2 text-2xl font-black ${answered && k === q.answer ? 'border-green-700 bg-green-600 text-white' : answered && k === pick ? 'border-red-700 bg-red-600 text-white' : 'border-[var(--border)] bg-white hover:bg-sky-50'}`}>
        {o.emoji ? <span aria-label={o.t}>{o.emoji}</span> : <En>{o.t}</En>}
      </button>)}
    </div>
    <div aria-live="polite" className="mt-3 text-center">
      {answered && <p className={`rounded-xl p-3 ${right ? 'bg-green-50' : 'bg-amber-50'}`}><b>{right ? '✔️ נכון!' : 'כמעט.'}</b> <span dir="auto">{q.explain}</span></p>}
      {answered && <button type="button" onClick={() => { setI(x => x + 1); setPick(null); }} className="ln-btn go mt-3">הבא ←</button>}
    </div>
  </div>
}

const card = 'rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center'

function StageBody({ id }) {
  if (id === 'letters') return <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
    {LETTERS.map(x => <li key={x.l} className={card}>
      <En className="text-3xl font-black">{x.l.toUpperCase()} {x.l}</En>
      <div className="text-3xl" aria-hidden="true">{x.emoji}</div>
      <div className="flex items-center justify-center gap-1"><En className="font-bold">{x.word}</En><Ear text={x.word} /></div>
      <small className="block text-[var(--muted-foreground)]">צליל: {x.he}</small>
    </li>)}
  </ul>
  if (id === 'vowels') return <div className="grid gap-3 sm:grid-cols-5">
    {VOWELS.map(v => <div key={v.v} className={card}>
      <En className="text-4xl font-black text-rose-700">{v.v}</En>
      <div className="font-bold">{v.he}</div>
      <ul className="mt-2 grid gap-1">{CVC.filter(w => vowelOf(w) === v.v).map(w => <li key={w.word} className="flex items-center justify-center gap-1">
        <span aria-hidden="true">{w.emoji}</span><En className="font-bold">{w.word[0]}<span className="text-rose-700">{w.word[1]}</span>{w.word[2]}</En><Ear text={w.word} />
      </li>)}</ul>
    </div>)}
  </div>
  if (id === 'blend') return <div className="rounded-2xl bg-sky-50 p-4 text-center">
    <p className="font-bold">כך מחברים: אומרים כל צליל, ואז מחליקים אותם יחד.</p>
    <div className="mt-3 flex flex-wrap justify-center gap-4">
      {['cat', 'dog', 'sun'].map(w => <div key={w} className={card}>
        <En className="text-3xl font-black tracking-widest">{w.split('').join(' ')}</En>
        <div className="text-xl" aria-hidden="true">⬇️</div>
        <En className="text-3xl font-black">{w}</En> <Ear text={w} />
        <div className="text-3xl" aria-hidden="true">{CVC.find(x => x.word === w).emoji}</div>
      </div>)}
    </div>
    <p className="mt-3 text-sm">טיפ: התחילו ממילים עם צלילים שאפשר "למתוח" (sss…uuu…nnn), ורק אחר כך מילים עם צלילים קצרים כמו b, d, t.</p>
  </div>
  if (id === 'teams') return <div className="grid gap-3 sm:grid-cols-3">
    {DIGRAPHS.map(d => <div key={d.dg} className={card}>
      <En className="text-4xl font-black text-violet-700">{d.dg}</En>
      <div className="font-bold">{d.he}</div>
      <ul className="mt-2 grid gap-1">{d.words.map(w => <li key={w.word} className="flex items-center justify-center gap-1">
        <span aria-hidden="true">{w.emoji}</span><En className="font-bold">{w.word}</En><Ear text={w.word} /><small className="text-[var(--muted-foreground)]">{w.he}</small>
      </li>)}</ul>
    </div>)}
  </div>
  if (id === 'sight') return <>
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {SIGHT_WORDS.map(s => <li key={s.w} className={`${card} ${s.tricky ? 'border-amber-400' : ''}`}>
        <div className="flex items-center justify-center gap-1"><En className="text-2xl font-black">{s.w}</En><Ear text={s.w} /></div>
        <div className="text-sm font-bold">{s.he}</div>
        <En className="block text-xs text-[var(--muted-foreground)]">{s.ex}</En>
      </li>)}
    </ul>
    <p className="mt-2 text-sm">מסגרת כתומה = מילה "מכשילה" שלא נקראת לפי הכללים. אותה לומדים במבט.</p>
  </>
  if (id === 'sentences') return <ul className="grid gap-2 sm:grid-cols-2">
    {SENTENCES.map(s => <li key={s.en} className="flex items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-3">
      <span className="text-3xl" aria-hidden="true">{s.pics[0]}</span>
      <span className="flex-1"><En className="block text-lg font-black">{s.en}</En><small className="text-[var(--muted-foreground)]">{s.he}</small></span>
      <Ear text={s.en} />
    </li>)}
  </ul>
  return null
}

// ---------- print ----------
const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
const enBig = { direction: 'ltr', fontFamily: 'Arial, sans-serif', fontWeight: 900 }
const box = { border: '1px solid #ccc', borderRadius: 10, padding: '3mm', textAlign: 'center' }

function SheetBody({ stage, ws }) {
  const id = stage.id
  if (id === 'letters') return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4mm', width: '100%' }}>
    {ws.items.map((x, k) => <div key={k} style={box}><div style={{ fontSize: 48 }}>{x.emoji}</div><div style={{ fontSize: 13 }}>{k + 1}. {x.he}</div><div style={{ ...enBig, fontSize: 28, marginTop: 4 }}>___ ___ ___</div></div>)}
  </div>
  if (id === 'vowels' || id === 'teams') return <>
    <p style={{ ...enBig, fontSize: 24, textAlign: 'center', margin: '0 0 6px', letterSpacing: 8 }}>{ws.bank.join('  ')}</p>
    <div style={{ display: 'grid', gridTemplateColumns: id === 'vowels' ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)', gap: '4mm', width: '100%' }}>
      {ws.items.map((x, k) => <div key={k} style={box}><div style={{ fontSize: 42 }}>{x.emoji}</div><div style={{ ...enBig, fontSize: 26 }}>{x.gap}</div><div style={{ fontSize: 11 }}>{k + 1}</div></div>)}
    </div>
  </>
  if (id === 'blend') return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4mm', width: '100%' }}>
    {ws.items.map((x, k) => <div key={k} style={{ ...box, display: 'flex', alignItems: 'center', gap: '4mm' }}><span style={{ fontSize: 13 }}>{k + 1}.</span><span style={{ fontSize: 44 }}>{x.emoji}</span><span style={{ ...enBig, fontSize: 24, display: 'flex', gap: '5mm' }}>{x.options.map(o => <span key={o}>{o}</span>)}</span></div>)}
  </div>
  if (id === 'sight') return <>
    <p style={{ fontSize: 13, margin: '0 0 4px' }}>א. קראו בקול כל מילה, וסמנו ✔ בכל פעם שהצלחתם (שלוש פעמים).</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2mm', width: '100%' }}>
      {ws.read.map(w => <div key={w} style={{ ...box, padding: '1.5mm' }}><div style={{ ...enBig, fontSize: 20 }}>{w}</div><div style={{ fontSize: 14, letterSpacing: 4 }}>☐☐☐</div></div>)}
    </div>
    <p style={{ fontSize: 13, margin: '8px 0 4px' }}>ב. מתחו קו מהמילה באנגלית לפירוש שלה בעברית.</p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 30mm', width: '80%', margin: '0 auto' }}>
      {ws.left.map((w, k) => [<div key={`l${k}`} style={{ ...enBig, fontSize: 22, padding: '2mm 0' }}>{w} ●</div>, <div key={`r${k}`} style={{ fontSize: 17, padding: '2mm 0' }}>● {ws.right[k]}</div>])}
    </div>
  </>
  if (id === 'sentences') return <>
    <div style={{ display: 'grid', gap: '3mm', width: '100%' }}>
      {ws.items.map((x, k) => <div key={k} style={{ ...box, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2mm 4mm' }}>
        <span style={{ display: 'flex', gap: '8mm', fontSize: 30 }}>{x.pics.map(p => <span key={p}>{p}</span>)}</span>
        <span style={{ ...enBig, fontSize: 21 }}>{k + 1}. {x.en}</span>
      </div>)}
    </div>
    <p style={{ fontSize: 13, margin: '8px 0 2px' }}>העתיקו משפט אחד שאהבתם:</p>
    <div style={{ borderBottom: '1px solid #999', height: '10mm', width: '100%' }} /><div style={{ borderBottom: '1px solid #999', height: '10mm', width: '100%' }} />
  </>
  return null
}

const TASK = {
  letters: 'כתבו את האות הראשונה של כל מילה. אפשר להגיד את המילה באנגלית בקול.',
  vowels: 'השלימו את התנועה החסרה: a, e, i, o או u. אמרו את המילה בקול.',
  blend: 'קראו את שלוש המילים, והקיפו את המילה שמתאימה לתמונה.',
  teams: 'השלימו את צמד האותיות החסר מתוך המחסן.',
  sight: 'מילים נפוצות — קוראים, מסמנים ומתאימים.',
  sentences: 'קראו כל משפט, והקיפו את התמונה המתאימה.',
}

function PrintSheets({ stage, set }) {
  const ws = worksheetFor(stage.id, set)
  return <>
    <article className="buga-a4" style={page}>
      <h2>{stage.emoji} שלב {stage.n}: {stage.title} <span dir="ltr">({stage.en})</span></h2>
      <p style={{ fontSize: 13, margin: '0 0 6px', textAlign: 'center' }}>שם: ____________ · {TASK[stage.id]}</p>
      <SheetBody stage={stage} ws={ws} />
      <footer>ugabuga.co.il/learn/english-phonics · לומדים לקרוא באנגלית מאפס</footer>
    </article>
    <article className="buga-a4" style={page}>
      <h2>✅ תשובות — שלב {stage.n}: {stage.title}</h2>
      <ol style={{ columns: 2, fontSize: 16, width: '100%', direction: 'rtl', paddingInlineStart: '8mm' }}>
        {ws.items.map((x, k) => <li key={k} style={{ marginBottom: 6 }}><span dir="ltr" style={{ fontWeight: 900 }}>{x.answer}</span>{x.word && x.word !== x.answer && <span dir="ltr"> ({x.word})</span>}{x.en && <span dir="ltr"> — {x.en}</span>}</li>)}
      </ol>
      <footer>ugabuga.co.il/learn/english-phonics · דף תשובות</footer>
    </article>
  </>
}

export default function EnglishPhonics() {
  const [printStage, setPrintStage] = useState(null)
  const [set, setSet] = useState(0)
  const course = {
    '@context': 'https://schema.org', '@type': 'Course', name: 'לומדים לקרוא באנגלית מאפס — פוניקס', inLanguage: 'he',
    description: 'מסלול של שישה שלבים ללימוד קריאה באנגלית לכיתות ב׳–ה׳, עם הסברים בעברית, תרגול ודפי עבודה.',
    provider: { '@type': 'Organization', name: 'עוגה בוגה', url: 'https://ugabuga.co.il' },
    isAccessibleForFree: true, educationalLevel: 'כיתות ב׳–ה׳',
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT15M' },
  }
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="לומדים לקרוא באנגלית מאפס — פוניקס לילדים, תרגול ודפי עבודה"
      description="לימוד קריאה באנגלית לכיתות ב׳–ה׳ בשישה שלבים: צלילי האותיות, תנועות קצרות, חיבור צלילים למילים (CVC), צמדי אותיות, מילים נפוצות ומשפטים ראשונים. הסברים בעברית, תרגול עם שמע ודפי עבודה להדפסה — חינם."
      path={PHONICS_PATH} structuredData={[course, faqSchema(FAQ)]} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, { label: 'אנגלית לפי כיתה', href: '/learn/english' }, { label: 'קריאה באנגלית מאפס' }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">🔡</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">לומדים לקרוא באנגלית מאפס (פוניקס)</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">שישה שלבים קצרים, מהצליל הראשון ועד משפט שלם. כל ההסברים בעברית, בכל שלב יש תרגול על המסך עם שמע ודף עבודה להדפסה עם תשובות. לכיתות ב׳–ה׳, ולכל מי שמתחיל מההתחלה.</p>
    </header>

    <nav className="mt-6 grid gap-2 sm:grid-cols-3" aria-label="שלבי המסלול">
      {STAGES.map(s => <a key={s.id} href={`#${s.id}`} className="ln-box card-lift flex items-center gap-3 text-right">
        <span className="text-3xl" aria-hidden="true">{s.emoji}</span>
        <span><small className="text-[var(--muted-foreground)]">שלב {s.n}</small><br /><b className="text-lg">{s.title}</b> <En className="text-sm text-[var(--muted-foreground)]">{s.en}</En></span>
      </a>)}
    </nav>

    <section className="ln-box mt-8" aria-labelledby="how-h">
      <h2 id="how-h" className="text-2xl font-black">איך משתמשים במסלול?</h2>
      <ol className="mt-2 list-decimal space-y-1 pr-6 leading-relaxed">
        <li>מתחילים בשלב 1, גם אם הילד כבר מכיר את שמות האותיות: הצלילים הם מה שמאפשר לקרוא.</li>
        <li>בכל שלב קוראים את ההסבר יחד, מקשיבים למילים (🔊) ועושים סבב תרגול של 10 שאלות.</li>
        <li>מדפיסים את דף העבודה של השלב לחזרה בבית או בכיתה. דף התשובות מגיע אחריו.</li>
        <li>עוברים לשלב הבא כשהתרגול עובר עם 9 או 10 נכונות. רוב הילדים צריכים שבוע עד שלושה בכל שלב.</li>
      </ol>
    </section>

    {STAGES.map(s => <section key={s.id} id={s.id} className="mt-12 scroll-mt-24" aria-labelledby={`${s.id}-h`}>
      <h2 id={`${s.id}-h`} className="text-3xl font-black"><span aria-hidden="true">{s.emoji} </span>שלב {s.n}: {s.title} <En className="text-xl text-[var(--muted-foreground)]">{s.en}</En></h2>
      <p className="mt-2 text-lg leading-relaxed"><b>המטרה:</b> {s.goal}</p>
      <p className="mt-1 leading-relaxed"><b>איך מתרגלים:</b> {s.how}</p>
      <div className="mt-4"><StageBody id={s.id} /></div>
      <div className="mt-5 rounded-2xl border-2 border-sky-300 bg-[var(--card)] p-4">
        <h3 className="mb-2 text-xl font-black">🎯 תרגול — שלב {s.n}</h3>
        <Practice stageId={s.id} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPrintStage(s)} className="ln-btn alt">🖨️ דף עבודה לשלב {s.n} + תשובות</button>
        {s.n < STAGES.length && <a href={`#${STAGES[s.n].id}`} className="ln-btn alt">לשלב {s.n + 1} ←</a>}
      </div>
    </section>)}

    <section className="mt-12" aria-labelledby="tips-h">
      <h2 id="tips-h" className="text-3xl font-black">💡 טיפים להורים ולמורים</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {PARENT_TIPS.map(t => <li key={t.title} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><b className="text-lg"><span aria-hidden="true">{t.emoji} </span>{t.title}</b><p className="mt-1 leading-relaxed">{t.text}</p></li>)}
      </ul>
    </section>

    <section className="ln-box mt-10" aria-labelledby="next-h">
      <h2 id="next-h" className="text-2xl font-black">📚 סיימתם את ששת השלבים? ממשיכים כאן</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to="/learn/english-reading" className="ln-chip">📖 סיפורים באנגלית עם מילון</Link>
        <Link to="/abc" className="ln-chip">🔤 האלפבית באנגלית A–Z</Link>
        <Link to="/printables/abc-letters" className="ln-chip">✏️ אותיות באנגלית לכתיבה</Link>
        <Link to="/learn/dictation/english" className="ln-chip">✍️ הכתבה באנגלית</Link>
        <Link to="/english" className="ln-chip">🇬🇧 מילים באנגלית לפי נושא</Link>
        <Link to="/learn/english" className="ln-chip">🎒 אנגלית לפי כיתה</Link>
      </div>
    </section>

    {printStage && <PrintPreview title={`פוניקס — שלב ${printStage.n}`} onClose={() => setPrintStage(null)}>
      <div className="no-print mb-2 text-center"><button type="button" onClick={() => setSet(x => x + 1)} className="ln-btn alt">🔄 דף אחר (סט {set % 9 + 1})</button></div>
      <PrintSheets stage={printStage} set={set} />
    </PrintPreview>}

    <div className="mt-10"><SeoBody paragraphs={[
      'ילדים ישראלים פוגשים קריאה באנגלית בדרך כלל בכיתה ג׳, אחרי שכבר למדו לקרוא עברית. זה יתרון — הם כבר יודעים שאותיות מייצגות צלילים — אבל יש גם קשיים חדשים: כיוון קריאה משמאל לימין, תנועות שנכתבות בתוך המילה במקום ניקוד, וצלילים שאין בעברית, כמו th ו־w.',
      'המסלול בדף בנוי בשיטת הפוניקס: קודם הצליל של כל אות, אחר כך חמש התנועות הקצרות, ואז חיבור צלילים למילים קצרות של שלוש אותיות (cat, dog, sun). בשלב הבא לומדים צמדי אותיות שנותנים צליל אחד, את המילים הנפוצות שלא נקראות לפי הכללים, ובסוף קוראים משפטים שלמים שבנויים רק ממה שכבר נלמד.',
      'כל הדוגמאות, המשפטים ודפי העבודה נכתבו במיוחד לאתר. ההסברים לצלילים בעברית הם קירוב שעוזר להתחיל: כדאי להקשיב להגייה באנגלית (כפתור 🔊) ולחקות אותה, במיוחד בצלילים a, r, th ו־w.',
    ]} faq={FAQ} related={[{ label: 'קריאה באנגלית עם מילון', href: '/learn/english-reading' }, { label: 'אנגלית לפי כיתה', href: '/learn/english' }, { label: 'האלפבית באנגלית', href: '/abc' }, { label: 'דקדוק באנגלית', href: '/learn/english-grammar' }]} /></div>
  </div>
}
