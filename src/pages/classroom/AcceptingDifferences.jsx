import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { PATH, BANDS, STORY_TITLE, STORY, STORY_QUESTIONS, ACTIVITIES, CONVERSATION, LANGUAGE_TIPS, FAQ } from '../../data/acceptingDifferences'

// /classroom/accepting-differences: original read-aloud story, six activities by age,
// conversation questions per age band, and three printables (card, worksheet, certificate).

const PRINTS = {
  card: 'כרטיס ״מה מיוחד בי״',
  common: 'דף ״מה משותף לנו״',
  cert: 'תעודת ״חבר/ה שמקבל/ת את כולם״',
}

const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
const line = { borderBottom: '1.5px solid #888', width: '100%', height: '9mm', marginBottom: '2mm' }
const box = { border: '2px solid #7548b3', borderRadius: 14, padding: '4mm', width: '100%', marginBottom: '4mm', boxSizing: 'border-box' }
const lab = { fontSize: 17, fontWeight: 700, margin: '0 0 2mm' }

function CardSheet() {
  return <article className="buga-a4" style={page}>
    <h2>🪪 מה מיוחד בי</h2>
    <p style={{ fontSize: 14, margin: '0 0 4mm', textAlign: 'center' }}>כל אחד ואחת מיוחדים בדרך משלהם. ממלאים, מציירים ומציגים למי שרוצים.</p>
    <div style={box}><p style={lab}>השם שלי:</p><div style={line} /></div>
    <div style={box}><p style={lab}>אני טוב/ה ב…</p><div style={line} /><div style={line} /></div>
    <div style={box}><p style={lab}>אני אוהב/ת…</p><div style={line} /><div style={line} /></div>
    <div style={box}><p style={lab}>מה עוזר לי כשקשה לי?</p><div style={line} /></div>
    <div style={{ ...box, flex: 1, minHeight: '55mm' }}><p style={lab}>ככה אני נראה/ית כשאני מאושר/ת (ציור):</p></div>
    <footer>ugabuga.co.il{PATH} · מה מיוחד בי</footer>
  </article>
}

function CommonSheet() {
  return <article className="buga-a4" style={page}>
    <h2>🔗 מה משותף לנו</h2>
    <p style={{ fontSize: 14, margin: '0 0 3mm', textAlign: 'center' }}>מחפשים בזוג שלושה דברים משותפים. אי אפשר לראות אותם מבחוץ, צריך לשאול!</p>
    <div style={{ display: 'flex', gap: '4mm', width: '100%', marginBottom: '4mm' }}>
      <div style={{ ...box, flex: 1, marginBottom: 0 }}><p style={lab}>שם:</p><div style={line} /></div>
      <div style={{ ...box, flex: 1, marginBottom: 0 }}><p style={lab}>שם:</p><div style={line} /></div>
    </div>
    {[1, 2, 3].map(n => <div key={n} style={box}>
      <p style={lab}>דבר משותף מספר {n}:</p><div style={line} />
    </div>)}
    <div style={{ ...box, borderColor: '#2f9e6e' }}>
      <p style={lab}>דבר אחד שהוא/היא אוהבים ואני לא:</p><div style={line} />
      <p style={{ ...lab, marginTop: '2mm' }}>למדתי על חבר/ה:</p><div style={line} />
    </div>
    <div style={{ ...box, flex: 1, minHeight: '35mm' }}><p style={lab}>ציור משותף לשנינו:</p></div>
    <footer>ugabuga.co.il{PATH} · מה משותף לנו</footer>
  </article>
}

function CertSheet({ name }) {
  const who = name.trim()
  return <article className="buga-a4" style={{ ...page, justifyContent: 'center', border: '8px double #7548b3', boxSizing: 'border-box' }}>
    <p style={{ fontSize: 60, margin: 0 }} aria-hidden="true">🌈</p>
    <h2 style={{ fontSize: 34, margin: '4mm 0' }}>תעודת הוקרה</h2>
    <p style={{ fontSize: 22, margin: '2mm 0' }}>מוענקת בגאווה ל</p>
    <p style={{ fontSize: 40, fontWeight: 800, margin: '4mm 0', minWidth: '60%', textAlign: 'center', borderBottom: who ? 'none' : '2px solid #444', minHeight: '16mm' }}>{who || ' '}</p>
    <p style={{ fontSize: 28, fontWeight: 700, margin: '6mm 0', color: '#7548b3' }}>חבר/ה שמקבל/ת את כולם</p>
    <p style={{ fontSize: 18, lineHeight: 1.7, maxWidth: '75%', textAlign: 'center' }}>על שהזמנת ילדים למשחק, הקשבת למי שחושב אחרת, ושינית את המשחק כדי שכולם יוכלו להשתתף.</p>
    <p style={{ fontSize: 18, marginTop: '14mm' }}>תאריך: ____________ &nbsp;&nbsp;&nbsp; חתימה: ______________</p>
    <footer>ugabuga.co.il{PATH}</footer>
  </article>
}

export default function AcceptingDifferences() {
  const [bandId, setBandId] = useState('all')
  const [print, setPrint] = useState(null)
  const [name, setName] = useState('')
  const chip = on => `min-h-[44px] rounded-full border-2 px-4 text-lg font-bold ${on ? 'border-slate-800 bg-indigo-200' : 'border-[var(--border)] bg-white'}`
  const acts = bandId === 'all' ? ACTIVITIES : ACTIVITIES.filter(a => a.ages.includes(bandId))
  const bandLabel = id => BANDS.find(b => b.id === id).label
  const convBands = bandId === 'all' ? BANDS : BANDS.filter(b => b.id === bandId)

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="קבלת השונות בגן ובכיתה — סיפור, פעילויות ודפי הדפסה"
      description="קבלת השונות בגן ובכיתה: סיפור מקורי להקראה, שש פעילויות לפי גיל (גן עד כיתה ו׳), שאלות לשיחה, כרטיס ״מה מיוחד בי״, דף ״מה משותף לנו״ ותעודה להדפסה. בחינם."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'קבלת השונות' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🌈 קבלת השונות בגן ובכיתה</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">סיפור מקורי להקראה, שש פעילויות קצרות לפי גיל, שאלות לשיחה ודפים להדפסה. מתאים לימי פעילות על חינוך מכיל ושילוב, ולכל יום אחר בשנה.</p>

    <nav className="mb-6 flex flex-wrap justify-center gap-2" aria-label="בחירת גיל">
      <button type="button" aria-pressed={bandId === 'all'} onClick={() => setBandId('all')} className={chip(bandId === 'all')}>הכול</button>
      {BANDS.map(b => <button key={b.id} type="button" aria-pressed={b.id === bandId} onClick={() => setBandId(b.id)} className={chip(b.id === bandId)}>{b.label}</button>)}
    </nav>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-indigo-50 p-5" aria-labelledby="story-h">
      <h2 id="story-h" className="text-3xl font-black">📖 סיפור להקראה: {STORY_TITLE}</h2>
      <p className="mt-1 text-[var(--muted-foreground)]">סיפור מקורי, בערך שלוש דקות הקראה. מתאים מגיל 4–5 ועד כיתה ב׳, ולגדולים כפתיחה לשיחה.</p>
      <div className="mt-4 grid gap-3 text-lg leading-relaxed">{STORY.map((p, i) => <p key={i}>{p}</p>)}</div>
      <h3 className="mt-5 text-xl font-bold">שאלות אחרי הסיפור</h3>
      <ul className="mt-1 list-disc pr-5 leading-relaxed">{STORY_QUESTIONS.map(q => <li key={q}>{q}</li>)}</ul>
    </section>

    <section className="mb-8" aria-labelledby="acts-h">
      <h2 id="acts-h" className="mb-3 text-3xl font-black">🎯 שש פעילויות אחרי הסיפור</h2>
      <ol className="grid gap-4 sm:grid-cols-2">
        {acts.map(a => <li key={a.id} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <h3 className="text-xl font-black"><span aria-hidden="true">{a.emoji}</span> {a.title}</h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">גילאים: {a.ages.map(bandLabel).join(' · ')} · זמן: {a.time}</p>
          <p className="mt-2 font-bold">צריך</p>
          <ul className="list-disc pr-5 leading-relaxed">{a.materials.map(m => <li key={m}>{m}</li>)}</ul>
          <p className="mt-2 font-bold">שלבים</p>
          <ol className="list-decimal pr-5 leading-relaxed">{a.steps.map(s => <li key={s}>{s}</li>)}</ol>
          <p className="mt-2 rounded-xl bg-amber-50 p-2 text-[15px]"><b>טיפ:</b> {a.tip}</p>
        </li>)}
      </ol>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5" aria-labelledby="talk-h">
      <h2 id="talk-h" className="mb-3 text-3xl font-black">💬 שיחה בכיתה: שאלות לפי גיל</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {convBands.map(b => <div key={b.id} className="rounded-2xl bg-indigo-50 p-4">
          <h3 className="text-xl font-bold">{b.label}</h3>
          <ul className="mt-1 list-disc pr-5 leading-relaxed">{CONVERSATION[b.id].map(q => <li key={q}>{q}</li>)}</ul>
        </div>)}
      </div>
      <p className="mt-3 leading-relaxed">כמה כללי אצבע לשיחה: מקשיבים עד הסוף, לא מכריחים ילד לספר על עצמו, ולא מציגים אף ילד כדוגמה. כשעולה משהו אישי, ממשיכים את השיחה בנפרד.</p>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-emerald-50 p-5" aria-labelledby="lang-h">
      <h2 id="lang-h" className="mb-3 text-2xl font-black">🗣️ איך מדברים: ניסוחים מכבדים</h2>
      <p className="mb-3 leading-relaxed">השפה שלנו מלמדת את הילדים איך לחשוב. כדאי לתאר מה הילד עושה וצריך, בלי רחמים ובלי הגדרה לפי מוגבלות בלבד.</p>
      <ul className="grid gap-2">
        {LANGUAGE_TIPS.map(t => <li key={t.good} className="grid gap-1 rounded-2xl bg-white p-3 sm:grid-cols-2">
          <p><b>✔️ עדיף:</b> {t.good}</p>
          <p><b>✖️ פחות:</b> {t.bad}</p>
        </li>)}
      </ul>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-2 text-3xl font-black">🖨️ דפים להדפסה</h2>
      <p className="mb-3">שלושה דפי A4: כרטיס אישי, דף עבודה לזוגות ותעודה. אפשר לכתוב שם בתעודה לפני ההדפסה.</p>
      <label className="mb-3 block font-bold" htmlFor="cert-name">שם לתעודה (לא חובה)
        <input id="cert-name" value={name} maxLength={30} onChange={e => setName(e.target.value)} placeholder="לדוגמה: נועה"
          className="mt-1 block min-h-[44px] w-full max-w-sm rounded-xl border-2 border-[var(--border)] bg-white px-3 text-lg font-normal" />
      </label>
      <div className="flex flex-wrap gap-2">
        {Object.entries(PRINTS).map(([k, t]) => <button key={k} type="button" onClick={() => setPrint(k)} className="ln-btn alt">🖨️ {t}</button>)}
      </div>
    </section>

    {print && <PrintPreview title={PRINTS[print]} onClose={() => setPrint(null)}>
      {print === 'card' && <CardSheet />}
      {print === 'common' && <CommonSheet />}
      {print === 'cert' && <CertSheet name={name} />}
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד על חברות ורגשות: <Link className="font-bold underline" to="/stories/new-kid-in-kindergarten">הילדה החדשה בגן</Link> · <Link className="font-bold underline" to="/stories/two-towers-and-a-bridge">שני מגדלים וגשר אחד</Link> · <Link className="font-bold underline" to="/printables/emotion-cards">כרטיסיות רגשות</Link> · <Link className="font-bold underline" to="/speech/language/social">שפה חברתית</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'קבלת השונות היא לא נושא לשבוע אחד בשנה אלא דרך לבנות כיתה וגן שבהם כל ילד מרגיש שייך. ילדים שמים לב להבדלים כבר בגיל צעיר, ומה שחשוב הוא איך מדברים עליהם: בסקרנות ובכבוד, ולא בהתעלמות או ברחמים. הדף מציע סיפור מקורי להקראה שבו הקבוצה משנה את המשחק ולא את הילד, ושש פעילויות קצרות שממשיכות אותו.',
      'כל פעילות מסומנת בטווח גילאים, זמן וחומרים, ובה שלבים ברורים: כרטיס ״מה מיוחד בי״, חיפוש דברים משותפים בזוגות, משחק תפקידים על הצטרפות למשחק, ציור משותף, בניית גשר בקבוצה ומעגל מחמאות. יש גם שאלות לשיחה לגן, לכיתות א׳–ב׳, ג׳–ד׳ ו־ה׳–ו׳, טבלת ניסוחים מכבדים, ושלושה דפים להדפסה: כרטיס אישי, דף עבודה לזוגות ותעודה.',
    ]} faq={FAQ} related={[{ label: 'לכיתה: כל הכלים למורה', href: '/classroom' }, { label: 'כרטיסיות רגשות להדפסה', href: '/printables/emotion-cards' }, { label: 'שפה חברתית לילדים', href: '/speech/language/social' }, { label: 'הילדה החדשה בגן: סיפור', href: '/stories/new-kid-in-kindergarten' }]} /></div>
  </div>
}
