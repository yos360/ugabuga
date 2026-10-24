import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import QuickAnswer from '../../components/ui/QuickAnswer'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import '../../learn/learn.css'
import './clock-change.css'

import { nextChange } from '../../utils/clockChange'
const HE_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const fmt = d => `יום ${HE_DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ב${['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'][d.getUTCMonth()]} ${d.getUTCFullYear()}`

function Clock({ h, m = 0, tone = 'blue', label }) {
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6
  return <figure className={`cc-clock is-${tone}`}>
    <svg viewBox="0 0 100 100" role="img" aria-label={label || `השעה ${h}:${String(m).padStart(2, '0')}`}>
      <circle cx="50" cy="50" r="46" className="face" />
      {Array.from({ length: 12 }, (_, i) => <text key={i} x={50 + 36 * Math.sin((i + 1) * Math.PI / 6)} y={54 + -36 * Math.cos((i + 1) * Math.PI / 6)} textAnchor="middle">{i + 1}</text>)}
      <line x1="50" y1="50" x2={50 + 22 * Math.sin(ha * Math.PI / 180)} y2={50 - 22 * Math.cos(ha * Math.PI / 180)} className="hour" />
      <line x1="50" y1="50" x2={50 + 32 * Math.sin(ma * Math.PI / 180)} y2={50 - 32 * Math.cos(ma * Math.PI / 180)} className="min" />
      <circle cx="50" cy="50" r="3" />
    </svg>
    {label && <figcaption>{label}</figcaption>}
  </figure>
}

const SLIDES = [
  { title: 'שעון קיץ ושעון חורף', body: <><p className="cc-big">למה מזיזים את השעון פעמיים בשנה?</p><div className="cc-row"><span className="cc-emoji" aria-hidden="true">☀️</span><Clock h={7} label="בואו נלמד יחד!" /></div></> },
  { title: 'בקיץ ובחורף יש שעות אור שונות', body: <div className="cc-two">
    <div className="cc-card is-sun"><b>☀️ בקיץ</b><p>הימים ארוכים. השמש זורחת מוקדם ושוקעת מאוחר — יש הרבה שעות אור.</p></div>
    <div className="cc-card is-cold"><b>🧣 בחורף</b><p>הימים קצרים. השמש זורחת מאוחר יותר ושוקעת מוקדם — יש פחות שעות אור.</p></div></div> },
  { title: 'מזיזים את השעון — לא את השמש!', body: <><p className="cc-big">השמש ממשיכה לזרוח ולשקוע כרגיל.</p><p>אנחנו רק משנים את המספר שהשעון מראה, כדי שיותר משעות האור ייפלו על השעות שבהן אנחנו ערים — בבית הספר, בעבודה ובמשחק אחר הצהריים.</p></> },
  { title: 'שעון קיץ — מקדימים שעה', body: <><div className="cc-row"><Clock h={2} label="לפני: 02:00" tone="blue" /><span className="cc-arrow" aria-hidden="true">←</span><Clock h={3} label="אחרי: 03:00" tone="red" /></div><p>באביב מזיזים את השעון <b>שעה אחת קדימה</b>. באותו לילה ישנים שעה פחות — אבל בערב נשאר אור עד מאוחר.</p></> },
  { title: 'שעון חורף — מאחרים שעה', body: <><div className="cc-row"><Clock h={2} label="לפני: 02:00" tone="red" /><span className="cc-arrow" aria-hidden="true">←</span><Clock h={1} label="אחרי: 01:00" tone="blue" /></div><p>בסתיו מחזירים את השעון <b>שעה אחת אחורה</b>. באותו לילה מקבלים שעת שינה נוספת 😴 — ובבוקר כבר אור כשקמים.</p></> },
  { title: 'מתי זה קורה בישראל?', body: <><ul className="cc-list"><li>🌸 <b>שעון קיץ</b> מתחיל ביום שישי שלפני יום ראשון האחרון של מרץ, בשתיים בלילה.</li><li>🍂 <b>שעון חורף</b> מתחיל ביום ראשון האחרון של אוקטובר, בשתיים בלילה.</li></ul><p className="text-sm">כך קובע החוק בישראל מאז 2013. במדינות אחרות התאריכים שונים, ויש מדינות שלא מזיזות את השעון בכלל.</p></> },
  { title: 'מי מזיז את השעונים?', body: <div className="cc-two">
    <div className="cc-card"><b>📱 לבד</b><p>טלפונים, מחשבים ושעונים חכמים משתנים מעצמם באמצע הלילה.</p></div>
    <div className="cc-card"><b>🕰️ אנחנו</b><p>שעון קיר, שעון ברכב, שעון במיקרוגל ושעון יד רגיל — צריך להזיז ביד.</p></div></div> },
  { title: 'איך מתכוננים לשינוי?', body: <ol className="cc-steps"><li>הולכים לישון בזמן 🛏️</li><li>מכינים את התיק בערב 🎒</li><li>מזיזים את השעונים בבית — יחד עם ההורים ⏰</li><li>בימים הראשונים הגוף מתרגל — זה בסדר להרגיש קצת עייפים 🥱</li></ol> },
  { title: 'הידעתם?', body: <ul className="cc-list"><li>💡 במלחמת העולם הראשונה כמה מדינות התחילו להזיז את השעון, כדי לחסוך בפחם ובחשמל לתאורה.</li><li>🌍 ברוב מדינות העולם בכלל לא מזיזים את השעון — למשל ביפן, בסין ובהודו.</li><li>🌙 קרוב לקו המשווה אורך היום כמעט לא משתנה במשך השנה, ולכן שם אין צורך בשעון קיץ.</li></ul> },
]
const QUIZ = [
  ['בשעון חורף מזיזים את השעון…', ['שעה אחת קדימה', 'שעה אחת אחורה', 'שעתיים קדימה', 'לא מזיזים'], 1],
  ['כשעוברים לשעון קיץ, באותו לילה…', ['ישנים שעה יותר', 'ישנים שעה פחות', 'לא ישנים בכלל', 'אין שינוי בשינה'], 1],
  ['כשמזיזים את השעון, השמש…', ['זורחת שעה מוקדם יותר', 'נשארת אותו דבר — רק המספר בשעון משתנה', 'מפסיקה לזרוח', 'זורחת פעמיים'], 1],
  ['איזה שעון צריך להזיז ביד?', ['הטלפון', 'המחשב', 'שעון הקיר', 'השעון החכם'], 2],
  ['מתי מתחיל שעון חורף בישראל?', ['ביום ראשון האחרון של אוקטובר', 'בראש השנה', 'ב־1 בינואר', 'ביום הראשון של החורף'], 0],
]
const FAQ = [
  { q: 'מתי עוברים לשעון חורף בישראל?', a: 'ביום ראשון האחרון של אוקטובר, בשתיים בלילה: השעון חוזר לאחת. כך קובע החוק בישראל מאז 2013.' },
  { q: 'מתי עוברים לשעון קיץ בישראל?', a: 'ביום שישי שלפני יום ראשון האחרון של מרץ, בשתיים בלילה: השעון מתקדם לשלוש.' },
  { q: 'בשעון חורף ישנים יותר או פחות?', a: 'יותר: בלילה של המעבר לשעון חורף השעון חוזר שעה אחורה, ולכן יש שעה נוספת. במעבר לשעון קיץ — להפך.' },
  { q: 'איך מסבירים לילדים שעון קיץ ושעון חורף?', a: 'מסבירים שהשמש לא משתנה — רק המספר בשעון. בקיץ יש יותר שעות אור, ומזיזים את השעון כדי ליהנות מאור בערב. המצגת בעמוד הזה עוברת על זה שלב אחרי שלב, עם שעונים ושאלות.' },
]

function Quiz() {
  const [picks, setPicks] = useState({})
  const done = Object.keys(picks).length === QUIZ.length, score = QUIZ.filter(([, , c], i) => picks[i] === c).length
  return <section className="mt-10">
    <h2 className="mb-3 text-3xl font-black">🧠 בודקים את עצמנו</h2>
    <ol className="space-y-3">{QUIZ.map(([q, opts, c], i) => <li key={q} className="ln-q"><b>{i + 1}. {q}</b>
      {opts.map((o, j) => <button key={o} type="button" className={`ln-opt ${picks[i] !== undefined && j === c ? 'is-right' : ''} ${picks[i] === j && j !== c ? 'is-wrong' : ''}`} disabled={picks[i] !== undefined} onClick={() => setPicks(p => ({ ...p, [i]: j }))}>{o}</button>)}</li>)}</ol>
    {done && <p className="mt-4 text-center text-2xl font-black" role="status">{score} מתוך {QUIZ.length} {score === QUIZ.length ? '🌟' : '👏'}</p>}
  </section>
}

export default function ClockChange() {
  const [i, setI] = useState(0)
  const [next, setNext] = useState(null)
  useEffect(() => { setNext(nextChange()) }, [])
  const go = d => setI(x => Math.min(SLIDES.length - 1, Math.max(0, x + d)))
  useEffect(() => {
    const onKey = e => { if (e.target.closest?.('input,textarea')) return; if (e.key === 'ArrowLeft') go(1); if (e.key === 'ArrowRight') go(-1) }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [])
  const full = () => { const el = document.querySelector('.cc-deck'); if (document.fullscreenElement) void document.exitFullscreen(); else void el?.requestFullscreen?.() }
  const S = SLIDES[i]
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="שעון קיץ ושעון חורף לילדים — מצגת, הסבר וחידון" description="למה מזיזים את השעון? מצגת לילדים על שעון קיץ ושעון חורף: מה קורה לשעות האור, מתי מזיזים בישראל, מי מזיז את השעונים ואיך מתכוננים — עם שעונים מצוירים וחידון." path="/learn/clock-change" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, { label: 'שעון קיץ ושעון חורף' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">⏰ </span>שעון קיץ ושעון חורף לילדים</h1>
    <p className="mb-5 text-center font-hand text-lg text-[var(--muted-foreground)]">מצגת קצרה להורים ולמורים — מסבירים, מראים ושואלים</p>
    {next && <p className="cc-next" role="status">{next.kind === 'winter' ? '🍂 המעבר הבא לשעון חורף' : '🌸 המעבר הבא לשעון קיץ'}: <b>{fmt(next.date)}</b>, בשתיים בלילה — השעון {next.kind === 'winter' ? 'חוזר לאחת' : 'מתקדם לשלוש'}.</p>}
    <section className="cc-deck" aria-roledescription="מצגת" aria-label="שעון קיץ ושעון חורף">
      <div className="cc-slide" key={i} aria-live="polite">
        <h2 className="cc-title">{S.title}</h2>
        <div className="cc-body">{S.body}</div>
        <span className="cc-num">{i + 1}/{SLIDES.length}</span>
      </div>
      <div className="cc-nav">
        <button type="button" className="ln-btn alt" onClick={() => go(-1)} disabled={i === 0} aria-label="השקופית הקודמת">→ הקודם</button>
        <div className="cc-dots">{SLIDES.map((s, k) => <button key={s.title} type="button" aria-label={`שקופית ${k + 1}`} aria-current={k === i} onClick={() => setI(k)} />)}</div>
        <button type="button" className="ln-btn go" onClick={() => go(1)} disabled={i === SLIDES.length - 1} aria-label="השקופית הבאה">הבא ←</button>
      </div>
      <p className="mt-2 text-center"><button type="button" className="ln-chip" onClick={full}>🖥️ מסך מלא (ללוח בכיתה)</button></p>
    </section>
    <Quiz />
    <QuickAnswer q="מה זה שעון חורף?" a="שעון חורף הוא השעה הרגילה. בסתיו מחזירים את השעון שעה אחת אחורה — בישראל ביום ראשון האחרון של אוקטובר, בשתיים בלילה — ובאביב מקדימים אותו שוב לשעון קיץ. השמש לא משתנה, רק המספר בשעון." />
    <div className="mt-8"><SeoBody paragraphs={[
      'פעמיים בשנה ילדים שואלים: למה פתאום השעה אחרת? התשובה פשוטה — מזיזים את השעון כדי להתאים את השעות שבהן אנחנו ערים לשעות שבהן יש אור. בקיץ הימים ארוכים, וכשמקדימים את השעון שעה אחת, האור נשאר עד מאוחר בערב. בחורף מחזירים את השעון, כדי שבבוקר לא יהיה חושך כשהולכים לבית הספר.',
      'המצגת בעמוד הזה מתאימה לגן ולכיתות היסודי: אפשר לעבור עליה בבית עם הילדים, או להקרין אותה על הלוח בכיתה במסך מלא. בסוף יש חידון קצר לבדיקה עצמית.',
    ]} faq={FAQ} related={[{ href: '/learn/geography', label: 'גאוגרפיה — אזורי זמן' }, { href: '/tools/world-clock', label: 'שעון עולמי' }, { href: '/learn', label: 'לומדים' }]} /></div>
    <p className="mt-4"><Link to="/learn" className="underline">← עוד שיעורים</Link></p>
  </div>
}
