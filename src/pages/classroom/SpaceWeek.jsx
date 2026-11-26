import '../../learn/learn.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { PATH, BANDS, DAYS, SCHOOL_IDEAS, FAQ, PLANETS, scaleCm } from '../../data/spaceWeek'

// /classroom/space-week: a Space Week kit for kindergarten and every elementary band —
// lesson outline, on-screen quiz, printable worksheet with answers and a craft per band,
// plus a five-day plan that links to the existing space lessons, escape room and printables.

function Quiz({ band }) {
  const [picked, setPicked] = useState({})
  const done = Object.keys(picked).length
  const right = band.quiz.filter(x => picked[x.id] === x.answer).length
  return <div>
    <ol className="grid gap-4">
      {band.quiz.map((x, i) => {
        const p = picked[x.id]
        return <li key={x.id} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <p className="text-lg font-bold">{i + 1}. {x.text}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {x.options.map((o, j) => {
              const state = p === undefined ? '' : j === x.answer ? 'border-emerald-600 bg-emerald-50' : j === p ? 'border-rose-500 bg-rose-50' : 'opacity-60'
              return <button key={o} type="button" disabled={p !== undefined} onClick={() => setPicked(s => ({ ...s, [x.id]: j }))}
                className={`min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-4 text-lg ${state}`}>{o}</button>
            })}
          </div>
          {p !== undefined && <p className={`mt-2 rounded-xl p-2 ${p === x.answer ? 'bg-emerald-50' : 'bg-amber-50'}`} role="status">
            <b>{p === x.answer ? '✔️ נכון!' : `התשובה: ${x.options[x.answer]}.`}</b> {x.explain}
          </p>}
        </li>
      })}
    </ol>
    {done === band.quiz.length && <div className="mt-4 rounded-2xl bg-amber-100 p-4 text-center text-xl font-black" role="status">
      🚀 {right} מתוך {band.quiz.length} נכונות!{' '}
      <button type="button" onClick={() => setPicked({})} className="mr-2 underline">עוד פעם</button>
    </div>}
  </div>
}

const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
const row = { border: '1px solid #ccc', borderRadius: 8, padding: '2.5mm 3mm', width: '100%', marginBottom: '2.5mm', fontSize: 16, lineHeight: 1.6 }

function PrintSheets({ band }) {
  const sh = band.sheet
  const gan = band.id === 'gan'
  return <>
    <article className="buga-a4" style={page}>
      <h2>🚀 שבוע החלל · דף עבודה · {band.label}</h2>
      <p style={{ fontSize: 13, margin: '0 0 6px', textAlign: 'center' }}>שם: ____________ · {gan ? 'המבוגר מקריא, הילד מסמן' : 'קוראים בעיון ועונים'}</p>
      <h3 style={{ width: '100%', margin: '2mm 0' }}>{gan ? 'נכון 👍 או לא נכון 👎? סמנו בעיגול' : 'נכון או לא נכון? כתבו נ או ל'}</h3>
      {sh.tf.map((t, i) => <div key={i} style={{ ...row, display: 'flex', justifyContent: 'space-between' }}>
        <span>{i + 1}. {t.s}</span><span>{gan ? '👍   👎' : '______'}</span>
      </div>)}
      {sh.count && <>
        <h3 style={{ width: '100%', margin: '3mm 0 2mm' }}>ספרו את הכוכבים וכתבו כמה</h3>
        {sh.count.map((n, i) => <div key={i} style={{ ...row, display: 'flex', justifyContent: 'space-between', fontSize: 26 }}>
          <span>{'⭐'.repeat(n)}</span><span style={{ fontSize: 18 }}>כמה? ____</span>
        </div>)}
      </>}
      {sh.fill && <>
        <h3 style={{ width: '100%', margin: '3mm 0 2mm' }}>השלימו את המשפטים</h3>
        <p style={{ width: '100%', fontSize: 14, margin: '0 0 2mm' }}>מחסן מילים: {sh.bank.join(' · ')}</p>
        {sh.fill.map((f, i) => <div key={i} style={row}>{i + 1}. {f.s}</div>)}
      </>}
      {sh.scale && <>
        <h3 style={{ width: '100%', margin: '3mm 0 2mm' }}>מודל בקנה מידה: 1 יחידה אסטרונומית = 10 ס״מ</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead><tr>{['כוכב הלכת', 'מרחק מהשמש (יחידות)', 'במודל (ס״מ)'].map(h => <th key={h} style={{ border: '1px solid #999', padding: 3 }}>{h}</th>)}</tr></thead>
          <tbody>{PLANETS.map(p => <tr key={p.name}><td style={{ border: '1px solid #999', padding: 3 }}>{p.name}</td><td style={{ border: '1px solid #999', padding: 3, textAlign: 'center' }}>{p.au}</td><td style={{ border: '1px solid #999', padding: 3 }} /></tr>)}</tbody>
        </table>
      </>}
      <h3 style={{ width: '100%', margin: '3mm 0 2mm' }}>✏️ {sh.task}</h3>
      <div style={{ width: '100%', flex: 1, minHeight: '45mm', border: '2px dashed #bbb', borderRadius: 10 }} />
      <footer>ugabuga.co.il{PATH} · ערכת שבוע החלל</footer>
    </article>
    <article className="buga-a4" style={page}>
      <h2>✅ תשובות · {band.label}</h2>
      <ol style={{ fontSize: 15, lineHeight: 1.8, width: '100%', paddingInlineStart: 24 }}>
        {sh.tf.map((t, i) => <li key={i}>{t.s} — <b>{t.a ? 'נכון' : 'לא נכון'}</b></li>)}
      </ol>
      {sh.count && <p style={{ width: '100%', fontSize: 15 }}>ספירת כוכבים: <b>{sh.count.join(', ')}</b></p>}
      {sh.fill && <ol style={{ fontSize: 15, lineHeight: 1.8, width: '100%', paddingInlineStart: 24 }}>
        {sh.fill.map((f, i) => { const [a, b] = f.s.split('________'); return <li key={i}>{a}<b><u>{f.a}</u></b>{b}</li> })}
      </ol>}
      {sh.scale && <p style={{ width: '100%', fontSize: 15, lineHeight: 1.8 }}>מודל בקנה מידה (ס״מ): {PLANETS.map(p => `${p.name} ${scaleCm(p.au)}`).join(' · ')}</p>}
      <footer>ugabuga.co.il{PATH} · דף תשובות</footer>
    </article>
  </>
}

export default function SpaceWeek() {
  const [bandId, setBandId] = useState('g12')
  const [print, setPrint] = useState(false)
  const band = BANDS.find(b => b.id === bandId)
  const chip = on => `min-h-[48px] rounded-full border-2 px-5 text-lg font-bold ${on ? 'border-slate-800 bg-indigo-200' : 'border-[var(--border)] bg-white'}`

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="שבוע החלל — ערכת פעילויות לגן ולבית הספר, לפי שכבה"
      description="ערכה לשבוע החלל הישראלי: לכל שכבה (גן, א׳–ב׳, ג׳–ד׳, ה׳–ו׳) מערך שיעור קצר, חידון על המסך, דף עבודה להדפסה עם תשובות ויצירה, תוכנית לחמישה ימים ופינת אילן רמון. בחינם."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'שבוע החלל' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🚀 שבוע החלל: ערכה לגן ולבית הספר</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">שבוע החלל הישראלי מתקיים בכל שנה בסוף ינואר, לזכרו של אילן רמון. כאן יש הכול לשבוע אחד: לכל שכבה מערך קצר, חידון על המסך, דף עבודה עם תשובות ויצירה — ותוכנית לחמישה ימים.</p>

    <nav className="mb-6 flex flex-wrap justify-center gap-2" aria-label="בחירת שכבה">
      {BANDS.map(b => <button key={b.id} type="button" aria-pressed={b.id === bandId} onClick={() => setBandId(b.id)} className={chip(b.id === bandId)}>{b.emoji} {b.label}</button>)}
    </nav>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-indigo-50 p-5" aria-labelledby="lesson-h">
      <h2 id="lesson-h" className="text-3xl font-black">{band.emoji} מערך שיעור ל{band.label} · {band.minutes} דקות</h2>
      <p className="mt-2 text-lg"><b>המטרה:</b> {band.goal}</p>
      <ol className="mt-4 grid gap-3 sm:grid-cols-2">
        {band.lesson.map((s, i) => <li key={s.title} className="rounded-2xl bg-white p-4">
          <p className="text-lg font-bold">{i + 1}. {s.title} <span className="text-sm font-normal text-[var(--muted-foreground)]">({s.min} דק׳)</span></p>
          <p className="mt-1 leading-relaxed">{s.text}</p>
        </li>)}
      </ol>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href="#quiz" className="ln-btn go">🧠 לחידון</a>
        <button type="button" onClick={() => setPrint(true)} className="ln-btn alt">🖨️ דף עבודה ל{band.label}</button>
        <a href="#craft" className="ln-btn alt">✂️ ליצירה</a>
      </div>
    </section>

    <section id="quiz" className="mb-8 scroll-mt-24" aria-labelledby="quiz-h">
      <h2 id="quiz-h" className="mb-3 text-3xl font-black">🧠 חידון החלל ל{band.label}</h2>
      <p className="mb-3 leading-relaxed">מתאים למקרן: קוראים את השאלה, הכיתה מצביעה, ולוחצים על התשובה. אחרי כל תשובה מופיע הסבר קצר.</p>
      <Quiz key={band.id} band={band} />
    </section>

    <section id="craft" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5" aria-labelledby="craft-h">
      <h2 id="craft-h" className="text-3xl font-black">{band.craft.emoji} יצירה: {band.craft.title}</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_2fr]">
        <div><h3 className="text-xl font-bold">צריך</h3><ul className="mt-1 list-disc pr-5 leading-relaxed">{band.craft.materials.map(m => <li key={m}>{m}</li>)}</ul></div>
        <div><h3 className="text-xl font-bold">שלבים</h3><ol className="mt-1 list-decimal pr-5 leading-relaxed">{band.craft.steps.map(s => <li key={s}>{s}</li>)}</ol></div>
      </div>
    </section>

    <section className="mb-8" aria-labelledby="more-h">
      <h2 id="more-h" className="mb-3 text-2xl font-black">📚 עוד באתר ל{band.label}</h2>
      <div className="grid gap-3 sm:grid-cols-3">{band.links.map(l => <Link key={l.href} to={l.href} className="ln-box card-lift text-right text-lg font-bold">{l.label} ←</Link>)}</div>
    </section>

    <section className="mb-8" aria-labelledby="week-h">
      <h2 id="week-h" className="mb-3 text-3xl font-black">🗓️ תוכנית לשבוע: יום אחרי יום</h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {DAYS.map(d => <li key={d.day} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <p className="text-3xl" aria-hidden="true">{d.emoji}</p>
          <p className="font-black">יום {d.day}: {d.title}</p>
          <p className="mt-1 text-[15px] leading-relaxed">{d.text}</p>
          <Link to={d.href} className="mt-2 inline-block font-bold text-blue-700 underline">{d.link}</Link>
        </li>)}
      </ol>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-5" aria-labelledby="school-h">
      <h2 id="school-h" className="mb-3 text-2xl font-black">🏫 רעיונות לכל בית הספר</h2>
      <ul className="grid gap-3 sm:grid-cols-2">{SCHOOL_IDEAS.map(([e, t, d]) => <li key={t} className="rounded-2xl bg-white p-4"><p className="text-xl font-bold"><span aria-hidden="true">{e}</span> {t}</p><p className="mt-1">{d}</p></li>)}</ul>
    </section>

    <section className="mb-8" aria-labelledby="ramon-h">
      <h2 id="ramon-h" className="mb-2 text-2xl font-black">🇮🇱 למה דווקא בסוף ינואר?</h2>
      <p className="text-lg leading-relaxed">אילן רמון, טייס קרב בחיל האוויר, היה הישראלי הראשון בחלל. הוא שוגר במעבורת החלל קולומביה ב־16 בינואר 2003, ונהרג עם כל אנשי הצוות כשהמעבורת התפרקה בדרכה חזרה, ב־1 בפברואר 2003. שבוע החלל הישראלי מתקיים לזכרו ובהשראתו, ומעודד ילדים ובני נוער להתעניין במדע ובחלל. <Link to="/learn/space/concepts/ilan-ramon" className="font-bold underline">עוד על אילן רמון</Link></p>
    </section>

    {print && <PrintPreview title={`שבוע החלל — דף עבודה ל${band.label}`} onClose={() => setPrint(false)}><PrintSheets band={band} /></PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד חלל: <Link className="font-bold underline" to="/learn/space">כל שיעורי החלל</Link> · <Link className="font-bold underline" to="/trivia/space">טריוויה על החלל</Link> · <Link className="font-bold underline" to="/printables/coloring/space">דפי צביעה</Link> · <Link className="font-bold underline" to="/jokes/space">בדיחות חלל</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'שבוע החלל הוא אחד השבועות האהובים בגנים ובבתי הספר: ילדים שואלים על השמש, על הירח ועל אסטרונאוטים, והמורים והגננות מחפשים פעילות שמתאימה לגיל. הערכה מסדרת את השבוע לפי ארבע שכבות — גן, כיתות א׳–ב׳, ג׳–ד׳ ו־ה׳–ו׳ — ולכל שכבה יש מערך שיעור קצר עם זמנים, חידון של שש שאלות עם הסבר לכל תשובה, דף עבודה להדפסה עם דף תשובות, ויצירה מחומרים פשוטים.',
      'הקטנים מתחילים מהשמש, מהירח ומרקטה מגליל נייר. בכיתות א׳–ב׳ לומדים את שמונת כוכבי הלכת ובונים מובייל, בכיתות ג׳–ד׳ מגלים בניסוי של פנס וכדור למה יש יום ולילה ולמה הירח משנה צורה, ובכיתות ה׳–ו׳ בונים את מערכת השמש בקנה מידה במסדרון ולומדים על ישראל בחלל — אילן רמון, החללית בראשית ואיתן סטיבה. התוכנית לחמישה ימים מחברת הכול לשיעורי החלל המלאים באתר, לחדר הבריחה בתחנת החלל ולדפי הצביעה.',
    ]} faq={FAQ} related={[{ label: 'החלל לילדים — כל השיעורים', href: '/learn/space' }, { label: 'חדר בריחה: תחנת החלל', href: '/tools/escape-rooms/space-station' }, { label: 'לכיתה — כל הכלים למורה', href: '/classroom' }, { label: 'מסיבת יום הולדת בנושא חלל', href: '/ideas/themes/space-birthday' }]} /></div>
  </div>
}
