import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { CIPHERS, MISSIONS, SHIFT_KEYS, decode, encode, keyTable, sameMessage } from '../../data/secretCodes'
import { SECRET_SHEETS } from './SecretCodeSheets'

// /tools/secret-codes: five kid-friendly ciphers explained, an on-screen tool that encodes and
// decodes a message, a short mission to crack, and A4 "decode the message" sheets from kindergarten
// to grade 6 with a cut-out cipher wheel. Nothing typed here leaves the device.
const PATH = '/tools/secret-codes'
const SAMPLE = 'נפגשים בהפסקה ליד העץ'

const GUIDE = [
  { id: 'shift', emoji: '➡️', name: 'האות הבאה', age: 'מכיתה ב׳', how: 'כל אות מתחלפת באות שאחריה בא״ב: א הופכת ל־ב, ב הופכת ל־ג, וה־ת חוזרת להיות א. מי שרוצה צופן קשה יותר מזיז שתיים, שלוש או יותר אותיות.', fact: 'יוליוס קיסר הזיז כל אות שלושה מקומות, ולכן קוראים לצופן הזה גם "צופן קיסר".', example: ['בוגה', () => encode('shift', 'בוגה', 1)] },
  { id: 'number', emoji: '🔢', name: 'מספר במקום אות', age: 'מכיתה א׳', how: 'כותבים מספר במקום כל אות, לפי הסדר בא״ב: א היא 1, ב היא 2, וה־ת היא 22. בין מילה למילה שמים קו אלכסוני.', fact: 'הצופן הראשון שכדאי ללמד, כי הילדים מתרגלים בו גם את סדר הא״ב וגם מספרים.', example: ['בוגה', () => encode('number', 'בוגה')] },
  { id: 'atbash', emoji: '🔁', name: 'א״ת ב״ש', age: 'מכיתה ד׳', how: 'מקפלים את הא״ב לשניים: האות הראשונה מתחלפת באחרונה, השנייה בזו שלפני האחרונה, וכן הלאה. א מתחלפת ב־ת, ב מתחלפת ב־ש, ומכאן השם.', fact: 'זה צופן עתיק: לפי המפרשים, המילה "ששך" בספר ירמיהו היא בעצם "בבל" בא״ת ב״ש.', example: ['בוגה', () => encode('atbash', 'בוגה')] },
  { id: 'mirror', emoji: '🪞', name: 'כתב מראה', age: 'מכיתה ג׳', how: 'כותבים הודעה רגילה על דף דק, הופכים את הדף ומעתיקים אותה מהצד השני מול החלון. עכשיו אפשר לקרוא אותה רק במראה.', fact: <>כך כתב <Link className="font-bold underline" to="/learn/arts/concepts/leonardo-da-vinci">לאונרדו דה וינצ׳י</Link> במחברות שלו.</>, example: ['בוגה', null] },
]

const LEMON = [
  'סוחטים חצי לימון לקערית ומוסיפים כמה טיפות מים.',
  'טובלים מכחול דק או מקל צמר גפן, וכותבים הודעה על דף לבן.',
  'מחכים שהדף יתייבש. הכתב נעלם.',
  'כדי לקרוא, מבוגר מחמם את הדף: במגהץ חם בלי אדים, או במייבש שיער קרוב לדף. בחום המיץ משחים והכתב מופיע.',
]

const IDEAS = [
  ['🗺️', 'ציד אוצרות', 'מצפינים את הרמזים, וכל קבוצה מקבלת את המפתח רק אחרי שפתרה משימה.', '/tools/scavenger-hunt-maker', 'למחולל הציד'],
  ['🔐', 'חדר בריחה', 'הקוד שפותח את הקופסה מסתתר בהודעה מוצפנת. יש כאן עשרות חדרים מוכנים.', '/tools/escape-rooms', 'לחדרי הבריחה'],
  ['🏫', 'פתיחת שיעור', 'כותבים על הלוח את הנושא של השיעור בצופן, והכיתה מפענחת לפני שמתחילים.', '/classroom', 'לאזור הכיתה'],
  ['💌', 'פתק בתיק', 'הודעה קטנה בצופן בקופסת האוכל, עם המפתח בצד השני.', '/printables/lunchbox-notes', 'לפתקים להדפסה'],
]

const FAQ = [
  { q: 'מה זה כתב סתרים?', a: 'כתב סתרים הוא דרך לכתוב הודעה כך שרק מי שמכיר את הסוד יוכל לקרוא אותה. בצופן מחליפים כל אות באות אחרת, במספר או בצורה, ובדיו סמויה מסתירים את הכתב עצמו עד שמחממים את הדף.' },
  { q: 'איך עובד צופן א״ת ב״ש?', a: 'מחליפים את האות הראשונה בא״ב באחרונה, את השנייה בזו שלפני האחרונה, וכן הלאה: א מתחלפת ב־ת, ב ב־ש, ג ב־ר. מפענחים באותה דרך בדיוק, כי כל זוג אותיות מתחלף הלוך וחזור.' },
  { q: 'איזה צופן מתאים לאיזה גיל?', a: 'בגן: צופן צורות, שבו כל צורה היא אות אחת. בכיתות א–ב: מספר במקום אות. בכיתות ג–ד: האות הבאה וכתב מראה. בכיתות ה–ו: א״ת ב״ש וגלגל צפנים עם מפתח משתנה.' },
  { q: 'איך מכינים דיו סמויה מלימון?', a: 'מערבבים מיץ לימון עם כמה טיפות מים, כותבים במכחול דק ומחכים שהדף יתייבש. כדי לקרוא, מבוגר מחמם את הדף במגהץ בלי אדים או במייבש שיער, והכתב מופיע בחום.' },
  { q: 'מה עושים עם האותיות הסופיות?', a: 'בצופן הן נחשבות לאותיות רגילות: ם כמו מ, ן כמו נ, וכן הלאה. כשמפענחים בכלי שבעמוד, האותיות הסופיות חוזרות לסוף המילים.' },
  { q: 'אפשר להשתמש בדפים בכיתה?', a: 'כן, בחינם. יש דף לגן ודפים לכיתות א–ב, ג–ד וה–ו, גלגל צפנים לגזירה ודף פתרונות נפרד למורה.' },
]

const chip = on => `min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-slate-800 bg-amber-200' : 'border-[var(--border)] bg-white'}`

function Mirrored({ children }) {
  return <span className="inline-block" style={{ transform: 'scaleX(-1)' }}>{children}</span>
}

function KeyTable({ cipher, shiftBy }) {
  return <ul className="flex flex-wrap gap-1" aria-label="טבלת האותיות של הצופן">
    {keyTable(cipher, shiftBy).map(k => <li key={k.letter} className="w-10 rounded-lg border-2 border-[var(--border)] bg-white text-center leading-tight">
      <span className="block font-bold">{k.letter}</span>
      <span className="block text-[var(--muted-foreground)]">{k.code}</span>
    </li>)}
  </ul>
}

function CodeTool() {
  const [cipher, setCipher] = useState('shift'), [shiftBy, setShiftBy] = useState(1), [text, setText] = useState(SAMPLE)
  const [mode, setMode] = useState('encode'), [copied, setCopied] = useState(false)
  const mirror = cipher === 'mirror'
  const result = text.trim() ? (mode === 'encode' ? encode : decode)(cipher, text, shiftBy) : ''
  const pick = next => {
    if (next !== mode) { setText(result); setMode(next) }
    setCopied(false)
  }
  // A code only makes sense in the cipher it was written in, so a new cipher starts from the plain text.
  const chooseCipher = id => {
    if (mode === 'decode') { setText(result); setMode('encode') }
    setCipher(id)
    setCopied(false)
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(result); setCopied(true) } catch { setCopied(false) }
  }

  return <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow-sm" aria-labelledby="tool-h">
    <h2 id="tool-h" className="mb-3 text-2xl font-bold">🔒 מצפינים ומפענחים הודעה</h2>
    <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="בחירת צופן">
      {CIPHERS.map(c => <button key={c.id} type="button" aria-pressed={cipher === c.id} onClick={() => chooseCipher(c.id)} className={chip(cipher === c.id)}>{c.emoji} {c.name}</button>)}
    </div>
    {cipher === 'shift' && <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="כמה אותיות מזיזים">
      <span className="font-bold">כמה אותיות מזיזים?</span>
      {SHIFT_KEYS.map(k => <button key={k} type="button" aria-pressed={shiftBy === k} onClick={() => setShiftBy(k)} className={chip(shiftBy === k)}>{k}</button>)}
    </div>}
    {!mirror && <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="כיוון">
      <button type="button" aria-pressed={mode === 'encode'} onClick={() => pick('encode')} className={chip(mode === 'encode')}>🔒 להצפין</button>
      <button type="button" aria-pressed={mode === 'decode'} onClick={() => pick('decode')} className={chip(mode === 'decode')}>🔓 לפענח</button>
    </div>}
    <label className="mb-3 block">
      <span className="mb-1 block font-bold">{mode === 'encode' || mirror ? 'כותבים כאן את ההודעה' : 'מדביקים כאן את ההודעה המוצפנת'}</span>
      <textarea value={text} onChange={e => { setText(e.target.value); setCopied(false) }} rows={3} maxLength={300} className="w-full rounded-xl border-2 border-[var(--border)] p-3 text-lg" />
    </label>
    <div className="mb-3 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-4" aria-live="polite">
      <p className="mb-1 font-bold">{mode === 'encode' || mirror ? 'ההודעה הסודית:' : 'מה כתוב בהודעה:'}</p>
      <p className="min-h-[2rem] break-words text-2xl font-bold" dir="rtl">{mirror ? <Mirrored>{result}</Mirrored> : result}</p>
    </div>
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {!mirror && <button type="button" onClick={copy} disabled={!result} className="min-h-[44px] rounded-full bg-slate-900 px-5 font-bold text-white disabled:opacity-50">{copied ? '✓ הועתק' : '📋 העתקת התוצאה'}</button>}
      {mirror && <p>את כתב המראה מעתיקים ביד לנייר, ומציצים במראה כדי לבדוק.</p>}
      <p className="text-sm text-[var(--muted-foreground)]">🔏 מה שכותבים כאן נשאר במכשיר שלכם. שום דבר לא נשלח ולא נשמר.</p>
    </div>
    {!mirror && <details>
      <summary className="min-h-[44px] cursor-pointer font-bold">טבלת הצופן: למעלה האות, למטה הקוד</summary>
      <div className="mt-2"><KeyTable cipher={cipher} shiftBy={shiftBy} /></div>
    </details>}
  </section>
}

function Mission() {
  const [index, setIndex] = useState(0), [guess, setGuess] = useState(''), [wrong, setWrong] = useState(false), [hint, setHint] = useState(false)
  const done = index >= MISSIONS.length
  const m = MISSIONS[index]
  const next = () => { setIndex(i => i + 1); setGuess(''); setWrong(false); setHint(false) }
  const check = e => {
    e.preventDefault()
    if (sameMessage(guess, m.answer)) next()
    else setWrong(true)
  }

  return <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5" aria-labelledby="mission-h">
    <h2 id="mission-h" className="mb-3 text-2xl font-bold">🕵️ משימה: מפצחים חמש הודעות</h2>
    {done ? <div className="text-center" role="status">
      <p className="mb-3 text-2xl font-bold">🏆 פיצחתם את כל ההודעות!</p>
      <p className="mb-3">עכשיו תורכם: הצפינו הודעה משלכם ותנו לחבר או לאחות לפצח אותה.</p>
      <button type="button" onClick={() => setIndex(0)} className={chip(false)}>🔄 משחקים שוב</button>
    </div> : <form onSubmit={check}>
      <p className="mb-2 font-bold">הודעה {index + 1} מתוך {MISSIONS.length} · {CIPHERS.find(c => c.id === m.cipher).name}{m.key > 1 ? ` (${m.key} אותיות)` : ''}</p>
      <p className="mb-3 rounded-xl bg-white p-3 text-2xl font-bold" dir="rtl">{m.cipher === 'mirror' ? <Mirrored>{m.answer}</Mirrored> : encode(m.cipher, m.answer, m.key)}</p>
      <label className="mb-3 block">
        <span className="mb-1 block font-bold">מה כתוב בהודעה?</span>
        <input value={guess} onChange={e => { setGuess(e.target.value); setWrong(false) }} autoComplete="off" className="w-full rounded-xl border-2 border-[var(--border)] p-3 text-lg" />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="min-h-[44px] rounded-full bg-slate-900 px-5 font-bold text-white">בדיקה</button>
        <button type="button" onClick={() => setHint(true)} className={chip(false)}>💡 רמז</button>
      </div>
      {wrong && <p className="mt-3 font-bold text-rose-700" role="alert">עוד לא. נסו שוב, או בקשו רמז.</p>}
      {hint && <div className="mt-3">
        <p className="mb-2">{m.hint}</p>
        {m.cipher !== 'mirror' && <KeyTable cipher={m.cipher} shiftBy={m.key} />}
      </div>}
    </form>}
  </section>
}

export default function SecretCodes() {
  const [print, setPrint] = useState(null)

  return <div className="mx-auto max-w-5xl px-4 py-8">
    <SEO title="כתב סתרים וצפנים לילדים — כלי הצפנה ודפים להדפסה" description="כתב סתרים לילדים: צופן א״ת ב״ש, מספר במקום אות, האות הבאה, כתב מראה ודיו סמויה מלימון. כלי שמצפין ומפענח הודעה, ודפי פענוח להדפסה לגן ולכיתות א–ו, בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'כתב סתרים וצפנים' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🕵️ כתב סתרים וצפנים לילדים</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">חמישה צפנים פשוטים עם הסבר, כלי שמצפין ומפענח הודעה על המסך, ודפי "פענחו את ההודעה" להדפסה מהגן ועד כיתה ו׳.</p>

    <CodeTool />
    <Mission />

    <section className="mb-8" aria-labelledby="guide-h">
      <h2 id="guide-h" className="mb-3 text-center text-2xl font-bold">🗝️ חמשת הצפנים ואיך הם עובדים</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {GUIDE.map(g => <article key={g.id} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <h3 className="text-xl font-bold">{g.emoji} {g.name}</h3>
          <p className="mb-2 text-sm font-bold text-[var(--muted-foreground)]">מתאים {g.age}</p>
          <p className="mb-2">{g.how}</p>
          <p className="mb-2 rounded-lg bg-amber-50 p-2">
            בוגה בצופן: <strong dir="rtl">{g.example[1] ? g.example[1]() : <Mirrored>{g.example[0]}</Mirrored>}</strong>
          </p>
          <p className="text-[var(--muted-foreground)]">{g.fact}</p>
        </article>)}
        <article id="lemon" className="rounded-2xl border-2 border-[var(--border)] bg-yellow-50 p-4 sm:col-span-2">
          <h3 className="text-xl font-bold">🍋 דיו סמויה מלימון</h3>
          <p className="mb-2 text-sm font-bold text-[var(--muted-foreground)]">מתאים מגיל 5, עם מבוגר לידם</p>
          <ol className="mb-2 list-decimal space-y-1 pr-6">{LEMON.map(s => <li key={s}>{s}</li>)}</ol>
          <p className="font-bold">🦺 את החימום עושה רק מבוגר, ולא משאירים מגהץ חם ליד ילדים.</p>
        </article>
      </div>
    </section>

    <section className="mb-8" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-2 text-center text-2xl font-bold">🖨️ דפי "פענחו את ההודעה" להדפסה</h2>
      <p className="mb-3 text-center">לוחצים על דף כדי להדפיס אותו, או מדפיסים את כולם יחד. הפתרונות בדף נפרד.</p>
      <div className="mb-4 flex justify-center">
        <button data-print-main type="button" onClick={() => setPrint(SECRET_SHEETS)} className="min-h-[44px] rounded-full bg-rose-600 px-5 font-bold text-white">🖨️ הדפסת כל הדפים</button>
      </div>
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECRET_SHEETS.map(p => <button key={p.id} type="button" onClick={() => setPrint([p])} aria-label={`הדפסה: ${p.name}`}
          className="mx-auto w-full max-w-sm rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
          <div className="aspect-[600/820]"><p.C /></div>
          <p className="mt-1 font-bold">{p.name}</p>
        </button>)}
      </div>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5">
      <h2 className="mb-3 text-2xl font-bold">💡 איפה משתמשים בצפנים?</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {IDEAS.map(([e, t, d, to, cta]) => <li key={t} className="rounded-xl border-2 border-[var(--border)] p-3">
          <p className="text-lg font-bold">{e} {t}</p>
          <p className="mb-1">{d}</p>
          <Link className="font-bold underline" to={to}>{cta}</Link>
        </li>)}
      </ul>
    </section>

    {print && <PrintPreview title="כתב סתרים וצפנים" onClose={() => setPrint(null)}>
      {print.map(p => <article className="buga-a4" key={p.id}><div className="print-art"><p.C /></div></article>)}
    </PrintPreview>}

    <div className="mt-10"><SeoBody paragraphs={[
      'כתב סתרים הוא אחד הדברים שילדים נדלקים עליהם מיד: יש הודעה שרק הם יודעים לקרוא, וזה מרגיש כמו סוכן אמיתי. בדרך הם מתרגלים את סדר הא״ב, קריאה, מספרים וחשיבה לוגית, בלי שזה מרגיש כמו שיעור.',
      'בעמוד הזה יש חמישה צפנים לפי גיל: מספר במקום אות למתחילים, האות הבאה, כתב מראה, דיו סמויה מלימון, והצופן העתיק א״ת ב״ש שמופיע כבר בתנ״ך. הכלי למעלה מצפין ומפענח כל הודעה בעברית, ושום דבר ממה שכותבים בו לא נשלח לשום מקום.',
      'לכיתה ולבית יש שישה דפים להדפסה: צופן צורות לגן, דפי פענוח לכיתות א–ב, ג–ד וה–ו, גלגל צפנים לגזירה שמאפשר להחליף מפתח בכל פעם, ודף פתרונות למורה ולהורה.',
    ]} faq={FAQ} related={[{ label: 'חדרי בריחה להדפסה', href: '/tools/escape-rooms' }, { label: 'חפש את המטמון', href: '/tools/scavenger-hunt-maker' }, { label: 'חידות לילדים', href: '/tools/riddles' }]} /></div>
  </div>
}
