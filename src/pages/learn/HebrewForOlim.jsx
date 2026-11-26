import '../../learn/learn.css'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { speak, hasVoice } from '../../utils/speak'
import {
  PATH, KID_LANGS, TOPICS, topicCards, pictureCards, phraseCards, deskLines,
  PARENT_WELCOME, WELCOME_STEPS, FIRST_WEEK, TEACHER_TIPS, PARENT_TIPS, CONSULT, FAQ,
} from '../../data/hebrewForOlim'

// /learn/hebrew-for-olim: first Hebrew words and survival phrases for a child who just made aliyah.
// Pick the child's language and a topic, hear the Hebrew word, play a picture-matching game and
// print phrase cards, a desk name card and a picture dictionary. Nothing chosen here is stored or sent.

function useHebrewVoice() {
  const [ok, setOk] = useState(true)
  useEffect(() => {
    let live = true
    hasVoice('he-IL').then(v => { if (live) setOk(v) })
    return () => { live = false }
  }, [])
  return ok
}

const sayHebrew = c => speak(c.he, 'he-IL', { rate: 0.8 })
const langOf = id => KID_LANGS.find(l => l.id === id)

function WordCard({ c, lang, voice }) {
  const L = langOf(lang)
  return <li className="flex flex-col items-center rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center shadow-sm">
    <span className="text-5xl" aria-hidden="true">{c.emoji}</span>
    <span className="mt-1 text-3xl font-black leading-snug">{c.nk}</span>
    <span className="text-[15px] text-[var(--muted-foreground)]" lang="en" dir="ltr">{c.tr}</span>
    <span className="mt-2 rounded-xl bg-sky-50 px-3 py-1 text-xl font-bold" lang={L.code} dir={L.dir}>{c.tx}</span>
    <button type="button" onClick={() => sayHebrew(c)} className="ln-btn alt mt-2 min-h-[44px]"
      aria-label={`השמע בעברית: ${c.he}`}>🔊 {voice ? 'שמעו' : 'שמעו (אין קול)'}</button>
  </li>
}

const shuffle = arr => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

// One round: a Hebrew word, four different emoji (one is right).
function makeRound(pool) {
  const answer = pool[Math.floor(Math.random() * pool.length)]
  const others = shuffle(pool.filter(p => p.emoji !== answer.emoji)).slice(0, 3)
  return { answer, options: shuffle([answer, ...others]) }
}

function MatchGame({ pool }) {
  const [round, setRound] = useState(() => makeRound(pool))
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const done = picked !== null
  const win = done && picked === round.answer.emoji

  function choose(e) {
    if (done) return
    setPicked(e)
    setScore(s => ({ right: s.right + (e === round.answer.emoji ? 1 : 0), total: s.total + 1 }))
  }
  function next() { setRound(makeRound(pool)); setPicked(null) }

  return <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5 text-center">
    <p className="text-lg">איזו תמונה מתאימה למילה?</p>
    <button type="button" onClick={() => sayHebrew(round.answer)} className="my-2 inline-flex min-h-[56px] items-center gap-2 rounded-2xl border-2 border-slate-800 bg-amber-50 px-6 py-2 text-4xl font-black"
      aria-label={`השמע בעברית: ${round.answer.he}`}>{round.answer.nk} <span className="text-2xl" aria-hidden="true">🔊</span></button>
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="בחירת תמונה">
      {round.options.map(o => {
        const right = done && o.emoji === round.answer.emoji
        const wrong = done && o.emoji === picked && !right
        return <button key={o.emoji} type="button" onClick={() => choose(o.emoji)} disabled={done && !right && !wrong}
          aria-label={`תמונה: ${o.he}`}
          className={`min-h-[96px] rounded-2xl border-4 text-6xl motion-reduce:transition-none ${right ? 'border-emerald-500 bg-emerald-50' : wrong ? 'border-rose-400 bg-rose-50' : 'border-[var(--border)] bg-white'}`}>
          <span aria-hidden="true">{o.emoji}</span></button>
      })}
    </div>
    <p className="mt-3 min-h-[2rem] text-xl font-bold" role="status" aria-live="polite">
      {done ? (win ? `כל הכבוד! ${round.answer.nk}` : `כמעט! ${round.answer.nk} זה ${round.answer.emoji}`) : ''}
    </p>
    <p className="text-[var(--muted-foreground)]">נכון: {score.right} מתוך {score.total}</p>
    {done && <button type="button" className="ln-btn go mt-3" onClick={next}>עוד מילה</button>}
  </div>
}

function Explorer({ lang, setLang, topic, setTopic }) {
  const voice = useHebrewVoice()
  const cards = topicCards(lang, topic)
  const t = TOPICS.find(x => x.id === topic)
  const pool = t.pics ? cards : pictureCards(lang)
  const uniquePool = pool.filter((c, i) => pool.findIndex(p => p.emoji === c.emoji) === i)
  const L = langOf(lang)

  return <div>
    <h3 className="mb-2 text-xl font-black">1. באיזו שפה הילד מדבר בבית?</h3>
    <div className="flex flex-wrap gap-2" role="group" aria-label="שפת הילד">
      {KID_LANGS.map(l => <button key={l.id} type="button" aria-pressed={l.id === lang} onClick={() => setLang(l.id)}
        className={`min-h-[48px] rounded-2xl border-2 px-4 text-lg font-bold ${l.id === lang ? 'border-slate-800 bg-amber-100 ring-2 ring-slate-800' : 'border-[var(--border)] bg-white'}`}>
        <span aria-hidden="true">{l.emoji}</span> {l.name}</button>)}
    </div>
    <h3 className="mb-2 mt-5 text-xl font-black">2. על מה רוצים ללמוד?</h3>
    <div className="flex flex-wrap gap-2" role="group" aria-label="נושא">
      {TOPICS.map(x => <button key={x.id} type="button" aria-pressed={x.id === topic} onClick={() => setTopic(x.id)}
        className={`min-h-[48px] rounded-2xl border-2 px-4 text-lg font-bold ${x.id === topic ? 'border-slate-800 bg-sky-100 ring-2 ring-slate-800' : 'border-[var(--border)] bg-white'}`}>
        <span aria-hidden="true">{x.emoji}</span> {x.title}</button>)}
    </div>

    {!voice && <p className="mt-4 rounded-2xl bg-amber-50 p-3">🔇 במכשיר הזה אין קול בעברית, ולכן כפתורי ההשמעה לא ישמיעו. ההגייה כתובה באותיות לטיניות מתחת לכל מילה. בהגדרות המכשיר אפשר להוסיף קול: הקראת טקסט.</p>}

    <h3 className="mb-2 mt-5 text-xl font-black">3. כרטיסי מילים: {t.title} ({L.name})</h3>
    <p className="mb-3 text-[var(--muted-foreground)]">לוחצים על ״שמעו״ כדי לשמוע את המילה בעברית. הילד חוזר אחריה בקול.</p>
    {cards.length === 0
      ? <p className="rounded-2xl bg-amber-50 p-3">עדיין אין לנו מילים מאומתות בנושא הזה בשפה הזו.</p>
      : <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-live="polite">{cards.map(c => <WordCard key={`${lang}-${topic}-${c.key}`} c={c} lang={lang} voice={voice} />)}</ul>}
    {L.id === 'ar' && <p className="mt-3 text-sm text-[var(--muted-foreground)]">המילים בערבית ספרותית (הכתובה). בערבית המדוברת חלק מהמילים נשמעות אחרת.</p>}

    <h3 className="mb-2 mt-8 text-xl font-black">🎯 משחק התאמה: איזו תמונה זו?</h3>
    {uniquePool.length >= 4
      ? <MatchGame key={`${lang}-${topic}`} pool={uniquePool} />
      : <p className="rounded-2xl bg-amber-50 p-3">המשחק מתאים לנושאים עם תמונות. בחרו נושא אחר.</p>}
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">🔒 שום דבר לא נשמר ולא נשלח. הבחירות נשארות רק על המסך שלכם.</p>
  </div>
}

// ---- printable sheets (A4 pages inside PrintPreview) ----
const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
const foot = txt => <footer>ugabuga.co.il{PATH} · {txt}</footer>

function PhraseCardsSheet({ lang }) {
  const L = langOf(lang)
  const cards = phraseCards(lang)
  return <article className="buga-a4" style={page}>
    <h2>🆘 כרטיסי משפטים לכיתה · עברית + {L.name}</h2>
    <p style={{ fontSize: 12, margin: '0 0 4px', textAlign: 'center' }}>גוזרים לאורך הקו המקווקו, מצפים בלמינציה ושמים על השולחן של הילד</p>
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 5 }}>
      {cards.map(c => <div key={c.key} style={{ border: '2px dashed #555', borderRadius: 12, padding: 5, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ fontSize: 30 }}>{c.emoji}</div>
        <div style={{ fontSize: 19, fontWeight: 900, lineHeight: 1.2 }}>{c.nk}</div>
        <div lang="en" dir="ltr" style={{ fontSize: 11, color: '#555' }}>{c.tr}</div>
        <div lang={L.code} dir={L.dir} style={{ fontSize: 15, fontWeight: 700, marginTop: 2, background: '#e0f2fe', borderRadius: 8, padding: '1px 4px' }}>{c.tx}</div>
      </div>)}
    </div>
    {foot(`כרטיסי משפטים (${L.name})`)}
  </article>
}

function NameCardSheet({ lang }) {
  const L = langOf(lang)
  const d = deskLines(lang)
  const one = k => <div key={k} style={{ border: '2px dashed #555', borderRadius: 16, padding: '10px 16px', textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
    <div style={{ fontSize: 40 }}>👋</div>
    <div style={{ fontSize: 30, fontWeight: 900 }}>שלום, קוראים לי ______________</div>
    <div style={{ fontSize: 26, fontWeight: 800 }}>אני מדבר/ת ______________</div>
    {d.hello && d.name && d.speak && <div lang={L.code} dir={L.dir} style={{ fontSize: 17, background: '#e0f2fe', borderRadius: 10, padding: '4px 8px' }}>
      {d.hello.tx} · {d.name.tx} ______ · {d.speak.tx} ______</div>}
    <div style={{ fontSize: 13, color: '#555' }}>ציירו כאן את עצמכם או את הדגל שלכם: ⬜⬜⬜⬜⬜⬜</div>
    <div style={{ height: 60, border: '1.5px dashed #aaa', borderRadius: 10 }} />
  </div>
  return <article className="buga-a4" style={page}>
    <h2>🏷️ כרטיס שולחן: שלום, קוראים לי…</h2>
    <p style={{ fontSize: 12, margin: '0 0 4px', textAlign: 'center' }}>כותבים שם ושפה, גוזרים ומקפלים לשניים. שני כרטיסים בדף.</p>
    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>{[1, 2].map(one)}</div>
    {foot(`כרטיס שולחן (${L.name})`)}
  </article>
}

function DictionarySheet({ lang, topic }) {
  const L = langOf(lang)
  const t = TOPICS.find(x => x.id === topic)
  const cards = topicCards(lang, topic)
  return <article className="buga-a4" style={page}>
    <h2>{t.emoji} מילון תמונות ראשון: {t.title} · עברית + {L.name}</h2>
    <p style={{ fontSize: 13, margin: '0 0 4px', width: '100%' }}>שם: ______________ · כותבים בכתב יד מתחת לכל מילה ומציירים אם רוצים.</p>
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '1fr', gap: 5 }}>
      {cards.map(c => <div key={c.key} style={{ border: '1.5px solid #555', borderRadius: 10, padding: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ fontSize: 28 }}>{c.emoji}</div>
        <div style={{ fontSize: 17, fontWeight: 900 }}>{c.nk}</div>
        <div lang="en" dir="ltr" style={{ fontSize: 10, color: '#555' }}>{c.tr}</div>
        <div lang={L.code} dir={L.dir} style={{ fontSize: 13, fontWeight: 700 }}>{c.tx}</div>
        <div style={{ borderBottom: '1px solid #999', height: 14 }} />
      </div>)}
    </div>
    {foot(`מילון תמונות: ${t.title} (${L.name})`)}
  </article>
}

export default function HebrewForOlim() {
  const [lang, setLang] = useState('ru')
  const [topic, setTopic] = useState('needs')
  const [print, setPrint] = useState(null) // { kind, topic? }
  const L = langOf(lang)
  const dictTopics = TOPICS.filter(t => t.pics)

  const printTitle = print && (print.kind === 'phrases' ? 'כרטיסי משפטים' : print.kind === 'name' ? 'כרטיס שולחן' : 'מילון תמונות')

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="עברית לילדים עולים: מילים ראשונות בגן ובבית הספר"
      description="איך מקבלים ילד עולה בגן ובכיתה: כרטיסי מילים בעברית עם השמעה ברוסית, אנגלית, צרפתית, אמהרית וערבית, משפטי הישרדות, משחק והדפסות. בחינם."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'ללמוד', href: '/learn' }, { label: 'עברית לילדים עולים' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">👋 עברית לילדים עולים: מילים ראשונות בגן ובבית הספר</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">ילד שעלה לישראל נכנס לגן או לכיתה בלי מילים, ולכולם קשה. בעמוד הזה: איך מקבלים אותו, מה עושים בשבוע הראשון, כרטיסי מילים עם השמעה בעברית ובשפת הבית (רוסית, אנגלית, צרפתית, אמהרית וערבית), משפטי הישרדות, משחק התאמה ודפים להדפסה.</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2" aria-label="ניווט בעמוד">
      {[['welcome', 'קבלת פנים'], ['words', 'מילים ומשחק'], ['print', 'דפים להדפסה'], ['parents', 'להורים'], ['help', 'מתי לפנות לעזרה']].map(([h, t]) => <a key={h} href={`#${h}`} className="ln-btn alt">{t}</a>)}
    </nav>

    <section id="welcome" className="mb-8 scroll-mt-24" aria-labelledby="welcome-h">
      <h2 id="welcome-h" className="mb-3 text-3xl font-black">👋 איך מקבלים ילד עולה בכיתה או בגן</h2>
      <p className="mb-4 text-lg leading-relaxed">מה שהילד צריך יותר מכול ביום הראשון הוא להרגיש שרואים אותו ושהוא בטוח. עברית באה אחר כך, מהר יותר, כשיש ביטחון וחברים. כמה צעדים פשוטים לגננת ולמורה:</p>
      <ul className="grid gap-3 sm:grid-cols-2">{WELCOME_STEPS.map(([e, t, d]) => <li key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <p className="text-xl font-bold"><span aria-hidden="true">{e}</span> {t}</p><p className="mt-1 leading-relaxed">{d}</p></li>)}
      </ul>
      <div className="mt-6 rounded-3xl border-2 border-[var(--border)] bg-emerald-50 p-5">
        <h3 className="text-2xl font-black">📅 השבוע הראשון: רשימה קצרה למורה</h3>
        <ol className="mt-2 list-decimal space-y-2 pr-6 text-lg leading-relaxed">{FIRST_WEEK.map(x => <li key={x}>{x}</li>)}</ol>
      </div>
      <div className="mt-4 rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-2xl font-black">🍎 עוד טיפים לגננות ולמורים</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 text-lg leading-relaxed">{TEACHER_TIPS.map(x => <li key={x}>{x}</li>)}</ul>
      </div>
    </section>

    <section id="words" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-yellow-50 p-5" aria-labelledby="words-h">
      <h2 id="words-h" className="mb-3 text-3xl font-black">🔊 מילים ראשונות בעברית</h2>
      <p className="mb-4 text-lg leading-relaxed">בוחרים את שפת הילד ואת הנושא, ורואים כל מילה בעברית (עם ניקוד, כשיש), הגייה באותיות לטיניות והמילה בשפת הבית. הנושא הראשון, משפטי הישרדות, הוא הכי חשוב להתחלה.</p>
      <Explorer lang={lang} setLang={setLang} topic={topic} setTopic={setTopic} />
    </section>

    <section id="print" className="mb-8 scroll-mt-24" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-3 text-3xl font-black">🖨️ דפים להדפסה ({L.name})</h2>
      <p className="mb-4 text-lg leading-relaxed">הדפים מוכנים לפי השפה שנבחרה למעלה. כדי להחליף שפה, בוחרים אותה שוב בחלק של המילים וחוזרים לכאן.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => setPrint({ kind: 'phrases' })} className="ln-box card-lift min-h-[64px] text-right text-xl font-bold"><span aria-hidden="true">🆘</span> כרטיסי משפטים לכיתה · הדפסה ←</button>
        <button type="button" onClick={() => setPrint({ kind: 'name' })} className="ln-box card-lift min-h-[64px] text-right text-xl font-bold"><span aria-hidden="true">🏷️</span> כרטיס שולחן: שלום, קוראים לי… · הדפסה ←</button>
      </div>
      <h3 className="mt-6 text-2xl font-black">📖 מילון תמונות ראשון לפי נושא</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{dictTopics.map(t => <button key={t.id} type="button" onClick={() => setPrint({ kind: 'dict', topic: t.id })}
        className="ln-box card-lift min-h-[56px] text-right text-lg font-bold"><span aria-hidden="true">{t.emoji}</span> {t.title} · הדפסה ←</button>)}
      </div>
    </section>

    <section id="parents" className="mb-8 scroll-mt-24" aria-labelledby="parents-h">
      <h2 id="parents-h" className="mb-3 text-3xl font-black">👨‍👩‍👧 להורים: ברוכים הבאים</h2>
      <p className="mb-4 text-lg leading-relaxed">גננות ומורים יכולים להראות או להדפיס את המסר הקצר הזה להורים שעוד לא קוראים עברית. כל פסקה כתובה בשפת ההורים.</p>
      <div className="grid gap-4 md:grid-cols-2">{PARENT_WELCOME.map(p => <div key={p.id} className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-xl font-black" lang={p.lang} dir={p.dir}>{p.title}</h3>
        <p className="mt-2 leading-relaxed" lang={p.lang} dir={p.dir}>{p.text}</p></div>)}
      </div>
      <p className="mt-3 text-[var(--muted-foreground)]">להורים דוברי אמהרית: אפשר לבחור באמהרית בכרטיסי המילים ולהדפיס כרטיסים עם משפטים באמהרית.</p>
      <div className="mt-5 rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-2xl font-black">💛 טיפים להורים</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 text-lg leading-relaxed">{PARENT_TIPS.map(x => <li key={x}>{x}</li>)}</ul>
      </div>
    </section>

    <section id="help" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-rose-50 p-5" aria-labelledby="help-h">
      <h2 id="help-h" className="mb-3 text-3xl font-black">🤝 מתי כדאי לפנות לעזרה</h2>
      <p className="mb-3 text-lg leading-relaxed">התאקלמות בארץ חדשה לוקחת זמן, והרבה ילדים עוברים אותה בלי קושי מיוחד. כדאי לשוחח עם יועצת בית הספר או הגן, עם רופא/ת הילדים או עם פסיכולוג/ית ילדים אם:</p>
      <ul className="list-disc space-y-2 pr-5 text-lg leading-relaxed">{CONSULT.map(c => <li key={c}>{c}</li>)}</ul>
      <p className="mt-3 leading-relaxed">העמוד הוא כלי חינוכי כללי. הוא לא מאבחן ולא מחליף הערכה של איש מקצוע. אם יש חשש לסכנה מיידית, פנו מיד לשירותי החירום (מד״א 101).</p>
    </section>

    {print && <PrintPreview title={`עברית לעולים — ${printTitle}`} onClose={() => setPrint(null)}>
      {print.kind === 'phrases' ? <PhraseCardsSheet lang={lang} /> : print.kind === 'name' ? <NameCardSheet lang={lang} /> : <DictionarySheet lang={lang} topic={print.topic} />}
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד: <Link className="font-bold underline" to="/languages">שפות לילדים: מילים ראשונות בחמש שפות</Link> · <Link className="font-bold underline" to="/classroom/accepting-differences">קבלת השונה בכיתה</Link> · <Link className="font-bold underline" to="/printables/emotion-cards">כרטיסיות רגשות</Link> · <Link className="font-bold underline" to="/classroom">כל הכלים למורה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'ילד שעלה לישראל פוגש בבת אחת שפה חדשה, חברים חדשים ושגרה שלא מוכרת לו. מה שעוזר לו יותר מכול הוא תחושת ביטחון, חבר אחד לפחות ומילים ראשונות שאפשר לבקש בעזרתן את מה שצריך: לשתות, ללכת לשירותים, לומר שכואב או שלא הבנתי. הגננת והמורה יכולות להקל עליו מאוד גם בלי לדעת את שפתו.',
      'בדף הזה כרטיסי מילים בעברית עם השמעה והגייה באותיות לטיניות, ולצדן המילה ברוסית, אנגלית, צרפתית, אמהרית או ערבית, בנושאים של כיתה, ציוד, גוף, אוכל, משפחה, צבעים ומספרים. אפשר לשחק במשחק התאמה, ולהדפיס כרטיסי משפטי הישרדות, כרטיס שולחן עם השם והשפה, ומילון תמונות לכל נושא. שום מידע לא נשמר ולא נשלח.',
    ]} faq={FAQ} related={[{ label: 'שפות לילדים: חמש שפות', href: '/languages' }, { label: 'קבלת השונה בכיתה', href: '/classroom/accepting-differences' }, { label: 'כרטיסיות רגשות להדפסה', href: '/printables/emotion-cards' }, { label: 'לכיתה: כל הכלים למורה', href: '/classroom' }]} /></div>
  </div>
}
