import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'

// Labeled fields beside the invitation — the same state as the inline fields on the card.
const FIELDS = [
  ['name', 'שם החוגג/ת', 'text', 'למשל: נועה'],
  ['age', 'גיל', 'text', 'למשל: 7'],
  ['date', 'תאריך', 'text', 'למשל: שישי 14.11'],
  ['time', 'שעה', 'text', 'למשל: 10:00–12:00'],
  ['place', 'כתובת', 'text', 'רחוב, עיר / שם הגן'],
  ['phone', 'טלפון לאישור הגעה', 'tel', '050-0000000'],
]

const THEMES = [
  {id:'balloons', name:'בלונים', emoji:'🎈', bg:'#ffe0ec'},
  {id:'space', name:'חלל', emoji:'🚀', bg:'#e0f7fa'},
  {id:'dino', name:'דינוזאור', emoji:'🦖', bg:'#e8f5e9'},
  {id:'princess', name:'נסיכה', emoji:'👑', bg:'#f5e0ff'},
  {id:'football', name:'כדורגל', emoji:'⚽', bg:'#e8f5e9'},
  {id:'gaming', name:'גיימינג', emoji:'🎮', bg:'#e8d5f5'},
]

// What to put in an invitation, theme pages and FAQ — static copy under the generator.
const WHAT_TO_WRITE = [
  ['שם וגיל', 'שם החוגג או החוגגת, והגיל שחוגגים. ילדים אוהבים לראות את המספר גדול ובולט.'],
  ['תאריך עם יום בשבוע', '"שישי, 14.11" ולא רק "14.11". כשיש גם יום בשבוע, פחות הורים מתבלבלים.'],
  ['שעת התחלה וגם שעת סיום', 'כך ההורים יודעים מתי לחזור לאסוף, ואתם יודעים כמה זמן יש לתכנן.'],
  ['כתובת מדויקת', 'רחוב, מספר, קומה, או שם הגן או הפארק, ועוד פרט שעוזר למצוא את המקום, כמו "ליד המגלשה הגדולה".'],
  ['טלפון לאישור הגעה', 'עם תאריך אחרון לאישור, כדי לדעת כמה אורחים להכין ומה להזמין.'],
  ['הערות חשובות', 'מה להביא (בגד ים, בגדים שמותר ללכלך), בקשה לעדכן על אלרגיות, או "בלי מתנות, רק אתם".'],
]
const THEME_LINKS = [
  ['🚀', 'מסיבת חלל', '/ideas/themes/space-birthday'],
  ['🦖', 'מסיבת דינוזאורים', '/ideas/dinosaur-birthday'],
  ['👑', 'מסיבת נסיכות', '/ideas/themes/princess-birthday'],
  ['⚽', 'מסיבת כדורגל', '/ideas/themes/football-birthday'],
  ['🎮', 'מסיבת גיימינג', '/ideas/themes/gaming-birthday'],
]
const FAQ = [
  { q: 'כמה זמן מראש שולחים הזמנה ליום הולדת?', a: 'בדרך כלל שבוע עד שבועיים לפני המסיבה. למסיבה של כל הכיתה או בתקופת חגים כדאי לשלוח קצת יותר מוקדם, ויום או יומיים לפני לשלוח תזכורת קצרה באותה קבוצה.' },
  { q: 'מה נשלח כשלוחצים "שתפו בוואטסאפ"?', a: 'נפתח וואטסאפ עם הודעת טקסט מוכנה: שם החוגג, תאריך, שעה, מקום וטלפון לאישור הגעה. בוחרים איש קשר או קבוצה ושולחים. כדי לשלוח גם את העיצוב, שומרים את ההזמנה כ־PDF בכפתור ההדפסה ומצרפים את הקובץ.' },
  { q: 'הפרטים שאני ממלא נשמרים באתר?', a: 'לא. הפרטים נשארים רק בדפדפן שלכם בזמן שהדף פתוח, ולא נשלחים לשום מקום. אם מרעננים את הדף, צריך למלא אותם מחדש.' },
  { q: 'אפשר להדפיס את ההזמנה?', a: 'כן. "הדפסה / שמירה כ־PDF" מכין דף A4 בעיצוב שבחרתם, עם כל הפרטים שמילאתם. אפשר להדפיס עותק לכל ילד או לתלות אחד על לוח המודעות בגן.' },
]
function InvitationGuide() {
  return (
    <section className="mx-auto mt-12 max-w-3xl">
      <h2 className="mb-2 text-3xl font-bold">מה כדאי לכתוב בהזמנה ליום הולדת?</h2>
      <p className="mb-5 text-lg leading-relaxed">הזמנה טובה עונה מראש על כל השאלות שההורים ישאלו בקבוצה. אלה הפרטים שכדאי שיהיו בה:</p>
      <div className="grid gap-3 sm:grid-cols-2">{WHAT_TO_WRITE.map(([t, d]) => <div key={t} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4"><h3 className="text-lg font-bold mb-1">{t}</h3><p className="text-[var(--foreground)]/80">{d}</p></div>)}</div>
      <h2 className="mb-2 mt-10 text-3xl font-bold">בחרתם עיצוב? יש גם רעיונות למסיבה</h2>
      <p className="mb-4 text-lg leading-relaxed">לכל עיצוב הזמנה יש מסיבה שמתאימה לו: משחקים, קישוטים ועוגה באותו נושא. כך ההזמנה פותחת את החגיגה עוד לפני שהאורחים מגיעים.</p>
      <div className="mb-10 flex flex-wrap gap-2">{THEME_LINKS.map(([e, t, to]) => <Link key={to} to={to} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{e} {t}</Link>)}</div>
      <SeoBody faq={FAQ} related={[{ label: 'מדריך הזמנות ליום הולדת', href: '/guides/birthday-invitation-guide' }, { label: 'מחשבון מסיבה', href: '/calculator' }, { label: 'ברכות ליום הולדת', href: '/greeting' }, { label: 'שלטים ליום הולדת להדפסה', href: '/printables/birthday-signs' }, { label: 'איך מתכננים יום הולדת', href: '/guides/how-to-plan-birthday' }]} />
    </section>
  )
}

export default function Invitation() {
  const [theme, setTheme] = useState(THEMES[0])
  const [data, setData] = useState({ name:'', age:'', date:'', time:'', place:'', phone:'', notes:'' })
  const [printing, setPrinting] = useState(false)

  const update = (k,v) => setData(d => ({...d, [k]:v}))
  // Times/phones are LTR runs inside a Hebrew message: isolate them (LRI…PDI) so "17:00–19:00" isn't flipped.
  const ltr = v => `\u2066${v}\u2069`
  const share = () => {
    const text = `🎉 הוזמנתם למסיבת יום הולדת של ${data.name||'___'} ${data.age?`(גיל ${data.age})`:''}!\n📅 ${data.date||'___'} בשעה ${data.time?ltr(data.time):'___'}\n📍 ${data.place||'___'}${data.phone?`\n📞 אישור הגעה: ${ltr(data.phone)}`:''}\n${data.notes||''}`
    window.open('https://wa.me/?text='+encodeURIComponent(text), '_blank')
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8 buga-fade-in">
      <SEO title="מחולל הזמנות ליום הולדת — הזמנה מעוצבת לוואטסאפ" description="הזמנה ליום הולדת בדקה: בוחרים עיצוב (בלונים, חלל, דינוזאור, נסיכה, כדורגל או גיימינג), ממלאים תאריך, שעה ומקום ושולחים בוואטסאפ. חינם, בלי הרשמה." path="/invitation" structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'מחולל הזמנות' }]} />
      <h1 className="text-center text-3xl sm:text-5xl mb-3">📨 מחולל הזמנות</h1>
      <p className="mb-6 text-center text-sm text-[var(--muted-foreground)] sm:text-lg">הזמנה להדפסה ולשליחה בוואטסאפ — בוחרים עיצוב, ממלאים פרטים ורואים את ההזמנה מתעדכנת מיד</p>

      <div className="grid grid-cols-3 gap-2 mb-6 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
        {THEMES.map(t => (
          <button key={t.id} onClick={() => setTheme(t)} className={`wobbly-sm min-h-12 border-2 border-[var(--border)] px-2 py-2 text-sm font-bold cursor-pointer sm:px-5 sm:text-base ${theme.id===t.id?'bg-[var(--postit)] shadow-[0_3px_0_var(--border)]':'bg-white'}`}>{t.emoji} {t.name}</button>
        ))}
      </div>

      {/* Live invitation preview - editable */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] lg:items-start">
      <div className="wobbly order-1 border-[3px] border-[var(--border)] p-4 text-center sketch-shadow-rich sm:p-8" style={{ backgroundColor: theme.bg }}>
        <img src={`/images/invitation-theme-${theme.id}.webp`} alt={`הזמנה בעיצוב ${theme.name}`} width="512" height="512" className="mx-auto mb-4 h-40 w-40 rounded-2xl border-2 border-white/80 object-cover shadow-md sm:h-56 sm:w-56" />
        <p className="font-hand text-lg mb-2">הוזמנתם למסיבת יום הולדת של</p>
        <input id="inv-name" aria-label="שם החוגג/ת" value={data.name} onChange={e=>update('name',e.target.value)} placeholder="שם החוגג/ת" className="bg-transparent text-center font-display text-3xl font-bold border-b-2 border-dashed border-[var(--border)] w-full mb-2 px-3 py-2 focus:outline-none" />
        <input id="inv-age" aria-label="גיל" value={data.age} onChange={e=>update('age',e.target.value)} placeholder="גיל" className="bg-transparent text-center font-hand text-xl border-b-2 border-dashed border-[var(--border)] mb-4 px-3 py-2 focus:outline-none" />
        <div className="grid grid-cols-2 gap-3 text-right">
          <div><label htmlFor="inv-date" className="text-sm font-bold">📅 תאריך</label><input id="inv-date" dir="auto" value={data.date} onChange={e=>update('date',e.target.value)} className="wobbly-sm w-full text-right border-2 border-[var(--border)] bg-white px-3 py-2" /></div>
          <div><label htmlFor="inv-time" className="text-sm font-bold">🕐 שעה</label><input id="inv-time" dir="ltr" value={data.time} onChange={e=>update('time',e.target.value)} className="wobbly-sm w-full text-right border-2 border-[var(--border)] bg-white px-3 py-2" /></div>
        </div>
        <div className="mt-3 text-right"><label htmlFor="inv-place" className="text-sm font-bold">📍 מקום</label><input id="inv-place" value={data.place} onChange={e=>update('place',e.target.value)} className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-3 py-2" /></div>
        <div className="mt-3 text-right"><label htmlFor="inv-phone" className="text-sm font-bold">📞 אישור הגעה</label><input id="inv-phone" type="tel" dir="ltr" value={data.phone} onChange={e=>update('phone',e.target.value)} placeholder="050-0000000" className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-3 py-2 text-right" /></div>
        <div className="mt-3 text-right"><label htmlFor="inv-notes" className="text-sm font-bold">📝 הערות</label><input id="inv-notes" value={data.notes} onChange={e=>update('notes',e.target.value)} placeholder="אישור הגעה, ללא מתנות..." className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-3 py-2" /></div>
      </div>
      <aside className="order-2 rounded-3xl border-2 border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-3 text-xl font-bold">📝 פרטי ההזמנה</h2>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">כל שינוי שתקלידו מופיע מיד בהזמנה.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {FIELDS.map(([k, label, type, ph]) => <div key={k} className={k === 'place' ? 'sm:col-span-2 lg:col-span-1 xl:col-span-2' : ''}>
            <label htmlFor={`form-${k}`} className="block text-sm font-bold">{label}</label>
            <input id={`form-${k}`} type={type} inputMode={k === 'age' ? 'numeric' : undefined} dir={type === 'tel' || k === 'time' ? 'ltr' : k === 'date' ? 'auto' : undefined} value={data[k]} onChange={e => update(k, e.target.value)} placeholder={ph} className="mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 text-right" />
          </div>)}
        </div>
        <div className="mt-4 rounded-2xl bg-[var(--postit)] p-4 text-sm leading-7">💡 מלאו שם, תאריך וכתובת — ואז שתפו בוואטסאפ או הדפיסו.</div>
      </aside>
      </div>

      <button onClick={share} className="wobbly-md sketch-press w-full min-h-[56px] border-[3px] border-[var(--border)] bg-[#128C4A] text-white font-display text-xl font-bold cursor-pointer">📱 שתפו בוואטסאפ</button>
      <button data-print-main onClick={() => setPrinting(true)} className="wobbly-md sketch-press mt-3 w-full min-h-[52px] border-[3px] border-[var(--border)] bg-white font-display text-lg font-bold cursor-pointer">🖨️ הדפסה / שמירה כ-PDF</button>
      {printing && <PrintPreview title="הזמנה ליום הולדת" onClose={() => setPrinting(false)}><article className="buga-a4 invite-print" style={{ backgroundColor: theme.bg }}>
        <p style={{ fontSize: 22, margin: 0 }}>הוזמנתם למסיבת יום הולדת של</p>
        <h2 style={{ fontSize: 48, margin: '6px 0' }}>{data.name || '_________'}</h2>
        {data.age && <p style={{ fontSize: 26, margin: 0 }}>חוגגים {data.age}! {theme.emoji}</p>}
        <div className="print-art"><img src={`/images/invitation-theme-${theme.id}.webp`} alt="" /></div>
        <p style={{ fontSize: 22, margin: '6px 0' }}>📅 <bdi>{data.date || '________'}</bdi> · 🕐 <bdi dir="ltr">{data.time || '_____'}</bdi></p>
        <p style={{ fontSize: 22, margin: '6px 0' }}>📍 {data.place || '______________'}</p>
        {data.phone && <p style={{ fontSize: 20, margin: '6px 0' }}>📞 אישור הגעה: <bdi dir="ltr">{data.phone}</bdi></p>}
        {data.notes && <p style={{ fontSize: 18, margin: '6px 0' }}>{data.notes}</p>}
        <footer>עוגה בוגה · ugabuga.co.il</footer>
      </article></PrintPreview>}
      <InvitationGuide />
    </div>
  )
}
