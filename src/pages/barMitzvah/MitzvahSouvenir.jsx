import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { crumbs, SpokeNav, GenderChips, Chip, inputCls } from './shared'

const PATH = '/bar-mitzvah/souvenir'

const FAQ = [
  { q: 'מה נותנים כמזכרת לאורחים בבת מצווה?', a: 'משהו קטן שמשתמשים בו או שמחזיק מעמד: עציץ תבלינים עם תגית, צנצנת ממתקים עם השם והתאריך, מגנט מעמדת הצילום או עוגייה מעוצבת. מזכרת אישית וזולה עדיפה על מזכרת יקרה שנשכחת במגירה.' },
  { q: 'מה מזכרת טובה לבת המצווה עצמה?', a: 'מזכרת שאוספת אנשים ורגעים: אלבום ברכות שהאורחים כתבו, קפסולת זמן שנפתחת בגיל 18, מכתב מההורים או תכשיט קטן עם התאריך העברי. כרטיסי הברכה וקפסולת הזמן בעמוד הזה מוכנים להדפסה, עם השם של בת המצווה.' },
  { q: 'איך אוספים ברכות מהאורחים?', a: 'מדפיסים כרטיסי ברכה, מניחים אותם על השולחנות או בעמדה ליד הכניסה עם עטים וקופסה מקושטת. אחרי האירוע מכניסים את הכרטיסים לאלבום או לקלסר — וזה הופך לאחת המזכרות היקרות ביותר.' },
  { q: 'מתי פותחים קפסולת זמן?', a: 'הכי נפוץ בגיל 18, כשמסיימים תיכון. יש שבוחרים בגיל 20 או 21. ממלאים את הדף, מוסיפים תמונה וחפץ קטן, סוגרים במעטפה או בקופסה וכותבים עליה את תאריך הפתיחה.' },
]

const RELATED = [
  { label: 'רעיונות לבת מצווה', href: '/ideas/bat-mitzvah-ideas' },
  { label: 'ברכות לבת מצווה', href: '/greetings/bat-mitzvah' },
  { label: 'אביזרי צילום להדפסה', href: '/printables/photo-props' },
]

const FOR_GUESTS = [
  ['🌿', 'עציץ תבלינים קטן', 'נענע, בזיליקום או רוזמרין בעציץ עם תגית: "תודה שצמחתם איתי".'],
  ['🍯', 'צנצנת ממתקים או דבש', 'עם מדבקה שיש עליה השם והתאריך העברי. דבש מתאים במיוחד סביב ראש השנה.'],
  ['📸', 'מגנט מעמדת הצילום', 'צלם עם מדפסת, או עמדת צילום עם אביזרים מודפסים — וכל אורח לוקח את התמונה שלו.'],
  ['🍪', 'עוגייה מעוצבת', 'עם האות הראשונה של שם החוגג/ת או עם המספר 12 או 13.'],
  ['🕯️', 'נר ריחני קטן', 'עם תגית קצרה: "שתמיד יהיה לכם אור".'],
  ['🎵', 'פלייליסט החגיגה', 'כרטיס עם קוד QR לפלייליסט של המסיבה — מזכרת שלא תופסת מקום.'],
]

const FOR_CELEBRANT = [
  ['💌', 'אלבום ברכות מהאורחים', 'כרטיסי ברכה שהאורחים ממלאים בחגיגה, ואחר כך נכנסים לאלבום.'],
  ['⏳', 'קפסולת זמן', 'דף שבני המצווה ממלאים עכשיו ופותחים בגיל 18 — עם תמונה וחפץ קטן.'],
  ['✉️', 'מכתב מהמשפחה', 'הורים, אחים וסבים כותבים מה הם אוהבים ומה הם מאחלים. הדף בהמשך עוזר להתחיל.'],
  ['💍', 'תכשיט או שעון עם חריטה', 'עם התאריך העברי של בת או בר המצווה.'],
  ['🌳', 'עץ אצבעות', 'ציור של עץ שהאורחים מוסיפים לו עלים בטביעת אצבע, ונתלה אחר כך בחדר.'],
  ['📖', 'ספר עם הקדשות', 'ספר אהוב — או חומש לבר המצווה — שבני המשפחה כותבים בו הקדשות.'],
]

const gl = (boy, m, f) => boy ? m : f

function Lines({ n, gap = 34 }) {
  return <div style={{ width: '100%' }}>{Array.from({ length: n }, (_, i) => <div key={i} style={{ borderBottom: '1.5px solid #999', height: gap }} />)}</div>
}

function BlessingCards({ name, boy, date }) {
  const card = (
    <div style={{ border: '2px dashed #555', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box', height: '100%' }}>
      <div style={{ fontSize: 26 }}>✨</div>
      <div style={{ fontSize: 21, fontWeight: 900, textAlign: 'center' }}>ברכה ל{name || '____________'}</div>
      <div style={{ fontSize: 14, textAlign: 'center', marginBottom: 6 }}>לכבוד {gl(boy, 'בר המצווה', 'בת המצווה')}{date ? ` · ${date}` : ''}</div>
      <Lines n={6} gap={30} />
      <div style={{ alignSelf: 'stretch', marginTop: 10, fontSize: 15 }}>באהבה, ____________________</div>
    </div>
  )
  return (
    <div className="buga-a4">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 14, width: '100%', flex: 1 }}>
        {card}{card}{card}{card}
      </div>
      <footer>גזרו לאורך הקו המקווקו · ugabuga.co.il</footer>
    </div>
  )
}

function TimeCapsule({ name, boy, age, openAt }) {
  const prompts = [
    gl(boy, `היום אני בן ${age}, ואני…`, `היום אני בת ${age}, ואני…`),
    'החברים הכי טובים שלי:',
    gl(boy, 'מה אני הכי אוהב לעשות:', 'מה אני הכי אוהבת לעשות:'),
    gl(boy, 'השיר שאני שומע עכשיו כל הזמן:', 'השיר שאני שומעת עכשיו כל הזמן:'),
    'משהו שקשה לי עכשיו:',
    'משהו שאני גאה בו:',
    `מה אני מקווה שיהיה לי בגיל ${openAt}:`,
    `שאלה לעצמי בגיל ${openAt}:`,
  ]
  return (
    <div className="buga-a4" style={{ alignItems: 'stretch' }}>
      <h2>⏳ קפסולת זמן{name ? ` — ${name}` : ''}</h2>
      <p style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 15 }}>נכתב ב־____________ · <b>לפתוח בגיל {openAt}</b></p>
      {prompts.map(p => <div key={p} style={{ marginTop: 6 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{p}</div><Lines n={2} gap={26} /></div>)}
      <p style={{ marginTop: 10, fontSize: 15 }}>חתימה: ____________ &nbsp; 📎 צרפו תמונה מהיום וחפץ קטן</p>
    </div>
  )
}

function FamilyLetter({ name, boy }) {
  const you = gl(boy, 'אתה', 'את')
  const prompts = [
    gl(boy, 'כשנולדת, הדבר הראשון שחשבנו עליך היה…', 'כשנולדת, הדבר הראשון שחשבנו עלייך היה…'),
    'מה שאנחנו הכי אוהבים בך:',
    'זיכרון מצחיק שלא נשכח:',
    gl(boy, `ראינו ${you} גדל כש…`, `ראינו ${you} גדלה כש…`),
    'מה אנחנו מאחלים לך:',
  ]
  return (
    <div className="buga-a4" style={{ alignItems: 'stretch' }}>
      <h2>✉️ מכתב מהמשפחה ל{name || '____________'}</h2>
      <p style={{ textAlign: 'center', margin: '0 0 6px', fontSize: 15 }}>לכבוד {gl(boy, 'בר המצווה שלך', 'בת המצווה שלך')}</p>
      {prompts.map(p => <div key={p} style={{ marginTop: 8 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{p}</div><Lines n={3} gap={26} /></div>)}
      <p style={{ marginTop: 12, fontSize: 15 }}>באהבה גדולה, ______________________________</p>
    </div>
  )
}

const ITEMS = [['cards', '💌 כרטיסי ברכה לאורחים (4 בדף)'], ['capsule', '⏳ קפסולת זמן'], ['letter', '✉️ מכתב מהמשפחה']]

export default function MitzvahSouvenir() {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('girl')
  const [date, setDate] = useState('')
  const [openAt, setOpenAt] = useState(18)
  const [pick, setPick] = useState({ cards: true, capsule: true, letter: false })
  const [pages, setPages] = useState(3)
  const [print, setPrint] = useState(false)
  const boy = gender === 'boy'
  const age = boy ? 13 : 12
  const props = { name: name.trim(), boy, date: date.trim(), age, openAt }
  const any = Object.values(pick).some(Boolean)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="מזכרת לבת מצווה ולבר מצווה — רעיונות וכרטיסי ברכה להדפסה" description="מזכרת לבת מצווה ולבר מצווה: רעיונות למזכרות לאורחים ולחוגגת, וכרטיסי ברכה להדפסה עם השם, קפסולת זמן לפתיחה בגיל 18 ומכתב מהמשפחה. חינם." path={PATH} structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={crumbs('מזכרות')} />
      <h1 className="mb-2 text-center text-4xl"><span aria-hidden="true">💌 </span>מזכרת לבת מצווה ולבר מצווה</h1>
      <p className="mx-auto mb-8 max-w-3xl text-center text-lg text-[var(--muted-foreground)]">מחפשים מזכרת לבת מצווה או לבר מצווה? כאן יש רעיונות למזכרות לאורחים ולחוגגים עצמם, ודפים אישיים להדפסה: כרטיסי ברכה שהאורחים ממלאים, קפסולת זמן ומכתב מהמשפחה.</p>

      <section className="ln-box mb-12" aria-labelledby="make">
        <h2 id="make" className="m-0 mb-3 text-2xl font-bold">🖨️ מזכרות אישיות להדפסה</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block font-bold">שם החוגג/ת<input value={name} onChange={e => setName(e.target.value)} maxLength={30} className={inputCls} autoComplete="off" /></label>
          <label className="block font-bold">תאריך (לא חובה)<input value={date} onChange={e => setDate(e.target.value)} maxLength={30} placeholder="למשל: ט״ו בשבט תשפ״ז" className={inputCls} /></label>
        </div>
        <div className="mt-3"><GenderChips gender={gender} setGender={setGender} /></div>
        <p className="m-0 mt-4 mb-2 font-bold">מה להדפיס?</p>
        <div className="flex flex-wrap gap-2">
          {ITEMS.map(([k, label]) => <Chip key={k} on={pick[k]} onClick={() => setPick(p => ({ ...p, [k]: !p[k] }))}>{label}</Chip>)}
        </div>
        {pick.cards && <label className="mt-3 flex flex-wrap items-center gap-2 font-bold">דפי כרטיסים:
          <select value={pages} onChange={e => setPages(+e.target.value)} className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2">{[1, 2, 3, 5, 10].map(n => <option key={n} value={n}>{n} ({n * 4} כרטיסים)</option>)}</select>
        </label>}
        {pick.capsule && <div className="mt-3"><p className="m-0 mb-2 font-bold">פותחים את קפסולת הזמן בגיל:</p><div className="flex flex-wrap gap-2">{[18, 20, 21].map(n => <Chip key={n} on={openAt === n} onClick={() => setOpenAt(n)}>{n}</Chip>)}</div></div>}
        <button type="button" className="ln-btn mt-5" disabled={!any} onClick={() => setPrint(true)}>🖨️ תצוגה והדפסה</button>
      </section>

      {print && <PrintPreview title={`מזכרות ל${props.name || gl(boy, 'בר המצווה', 'בת המצווה')}`} onClose={() => setPrint(false)}>
        {pick.cards && Array.from({ length: pages }, (_, i) => <BlessingCards key={'c' + i} {...props} />)}
        {pick.capsule && <TimeCapsule {...props} />}
        {pick.letter && <FamilyLetter {...props} />}
      </PrintPreview>}

      <section className="mb-10" aria-labelledby="guests">
        <h2 id="guests" className="mb-4 text-3xl">רעיונות למזכרת לאורחים</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {FOR_GUESTS.map(([e, t, d]) => <div key={t} className="flex gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-3"><span className="text-3xl" aria-hidden="true">{e}</span><div><h3 className="m-0 text-lg font-bold">{t}</h3><p className="m-0 leading-relaxed text-[var(--foreground)]/85">{d}</p></div></div>)}
        </div>
      </section>

      <section className="mb-10" aria-labelledby="keep">
        <h2 id="keep" className="mb-4 text-3xl">מזכרת לבת המצווה או לבר המצווה עצמם</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {FOR_CELEBRANT.map(([e, t, d]) => <div key={t} className="flex gap-3 rounded-2xl border-2 border-dashed border-[var(--border)] p-3"><span className="text-3xl" aria-hidden="true">{e}</span><div><h3 className="m-0 text-lg font-bold">{t}</h3><p className="m-0 leading-relaxed text-[var(--foreground)]/85">{d}</p></div></div>)}
        </div>
        <p className="mt-4">רוצים מילים מוכנות לתגיות? יש <Link to="/greetings/bat-mitzvah" className="font-bold underline">ברכות לבת מצווה</Link> ו<Link to="/greetings/bar-mitzvah" className="font-bold underline">ברכות לבר מצווה</Link> להעתקה.</p>
      </section>

      <SeoBody
        paragraphs={[
          'מזכרת טובה לבת מצווה היא מזכרת עם סיפור. כרטיסי הברכה מודפסים עם השם של בת המצווה או בר המצווה, ארבעה בכל דף, עם קו גזירה. מניחים אותם על השולחנות עם עטים, ובסוף הערב אוספים לקופסה — הם יספרו בעוד שנים מי היה שם ומה אמרו.',
          'קפסולת הזמן מתאימה לגיל 12–13 במיוחד: זה גיל של שינויים, ומרגש לקרוא בגיל 18 מה חשבתם אז. ממלאים בשקט, בלי שההורים קוראים, מצרפים תמונה וסוגרים. המכתב מהמשפחה הוא המקבילה של ההורים — אפשר לתת אותו בבוקר של בר המצווה או בת המצווה, או לקרוא ממנו בנאום.',
        ]}
        faq={FAQ}
        related={RELATED}
      />
      <SpokeNav current={PATH} />
    </div>
  )
}
