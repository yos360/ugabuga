import '../../learn/learn.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import {
  PATH, RAMADAN_START, EID_START, GREETINGS, FACTS, EID, DECOR, QUIZ, MIXED_CLASS, TIPS, FAQ,
} from '../../data/ramadan'

// /holidays/ramadan: neutral, respectful explainer for children, families and teachers about Ramadan and
// Eid al-Fitr, with an on-screen lantern decorator, countdown, quiz and printables. Nothing is stored or sent.

const arStyle = { fontFamily: "'Noto Naskh Arabic', 'Amiri', 'Traditional Arabic', Arial, sans-serif" }
const MS_DAY = 86400000

function daysUntil(t) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((new Date(t.y, t.m, t.d) - today) / MS_DAY)
}

// ---- Lantern (fanous) SVG, used on screen, in the coloring page and printable ----
function Star({ x, y, r, fill }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 ? r * 0.45 : r
    return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`
  }).join(' ')
  return <polygon points={pts} fill={fill} />
}

function Fanous({ body, cap, pattern, glow }) {
  const mark = '#fff8dc'
  const marks = []
  if (pattern === 'stars') [[100, 118], [70, 150], [130, 150], [100, 182], [100, 150]].forEach(([x, y], i) => marks.push(<Star key={i} x={x} y={y} r={i === 4 ? 11 : 8} fill={mark} />))
  if (pattern === 'dots') for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) marks.push(<circle key={`${r}${c}`} cx={70 + c * 20} cy={120 + r * 22} r="5" fill={mark} />)
  if (pattern === 'stripes') for (let i = 0; i < 5; i++) marks.push(<rect key={i} x="52" y={116 + i * 17} width="96" height="8" rx="4" fill={mark} />)
  if (pattern === 'moons') [[100, 125], [75, 165], [125, 165]].forEach(([x, y], i) => marks.push(<path key={i} d={`M${x + 8} ${y - 12} A14 14 0 1 0 ${x + 8} ${y + 12} A10 10 0 1 1 ${x + 8} ${y - 12}Z`} fill={mark} />))
  return <svg viewBox="0 0 200 270" role="img" aria-label="פנס רמדאן מקושט" style={{ width: '100%', height: '100%' }}>
    <path d="M100 8 q-14 0 -14 14 M100 8 q14 0 14 14" fill="none" stroke="#444" strokeWidth="4" strokeLinecap="round" />
    <circle cx="100" cy="8" r="5" fill="none" stroke="#444" strokeWidth="3" />
    {glow && <ellipse cx="100" cy="150" rx="90" ry="100" fill="#fde68a" opacity="0.5" />}
    <path d="M70 40 L100 22 L130 40 L138 62 H62 Z" fill={cap} stroke="#333" strokeWidth="3" strokeLinejoin="round" />
    <rect x="56" y="62" width="88" height="14" rx="4" fill={cap} stroke="#333" strokeWidth="3" />
    <path d="M56 76 Q30 150 56 226 H144 Q170 150 144 76 Z" fill={body} stroke="#333" strokeWidth="3" strokeLinejoin="round" />
    <path d="M56 76 Q30 150 56 226 M144 76 Q170 150 144 226" fill="none" stroke="#333" strokeWidth="3" />
    <rect x="52" y="226" width="96" height="14" rx="4" fill={cap} stroke="#333" strokeWidth="3" />
    <path d="M70 240 L82 262 H118 L130 240 Z" fill={cap} stroke="#333" strokeWidth="3" strokeLinejoin="round" />
    {marks}
  </svg>
}

function FanousStudio({ onPrint }) {
  const [body, setBody] = useState(DECOR.bodies[0][0])
  const [cap, setCap] = useState(DECOR.caps[0][0])
  const [pattern, setPattern] = useState('stars')
  const [glow, setGlow] = useState(true)
  const bodyName = DECOR.bodies.find(b => b[0] === body)[1]
  const patName = DECOR.patterns.find(p => p[0] === pattern)[1]
  return <div className="grid gap-6 md:grid-cols-2">
    <div className="mx-auto h-72 w-56 rounded-3xl bg-slate-900 p-3" role="status" aria-live="polite">
      <Fanous body={body} cap={cap} pattern={pattern} glow={glow} />
      <span className="sr-only">פנס בצבע {bodyName} עם דוגמת {patName}</span>
    </div>
    <div>
      <p className="mb-1 text-lg font-bold">צבע הפנס</p>
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="צבע גוף הפנס">{DECOR.bodies.map(([c, n]) => <button key={c} type="button" aria-label={n} aria-pressed={body === c}
        onClick={() => setBody(c)} className={`h-12 w-12 rounded-full border-4 ${body === c ? 'border-slate-900' : 'border-white'} shadow`} style={{ background: c }} />)}</div>
      <p className="mb-1 text-lg font-bold">צבע הכיפה והבסיס</p>
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="צבע כיפה ובסיס">{DECOR.caps.map(([c, n]) => <button key={c} type="button" aria-label={n} aria-pressed={cap === c}
        onClick={() => setCap(c)} className={`h-12 w-12 rounded-full border-4 ${cap === c ? 'border-slate-900' : 'border-white'} shadow`} style={{ background: c }} />)}</div>
      <p className="mb-1 text-lg font-bold">דוגמה</p>
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="דוגמה על הפנס">{DECOR.patterns.map(([id, n]) => <button key={id} type="button" aria-pressed={pattern === id}
        onClick={() => setPattern(id)} className={`min-h-[44px] rounded-2xl border-2 px-4 text-lg font-bold ${pattern === id ? 'border-slate-900 bg-yellow-200' : 'border-[var(--border)] bg-white'}`}>{n}</button>)}</div>
      <label className="mb-4 flex min-h-[44px] items-center gap-2 text-lg"><input type="checkbox" className="h-5 w-5" checked={glow} onChange={e => setGlow(e.target.checked)} /> זוהר מסביב</label>
      <div><button type="button" className="ln-btn go" onClick={() => onPrint({ body, cap, pattern, glow })}>🖨️ מדפיסים את הפנס שלי</button></div>
    </div>
  </div>
}

function Countdown() {
  const [days] = useState(() => daysUntil(RAMADAN_START))
  const [eid] = useState(() => daysUntil(EID_START))
  let text
  if (days > 0) text = `עוד בערך ${days} ימים לתחילת רמדאן 2027`
  else if (days === 0) text = 'רמדאן אמור להתחיל בערך היום'
  else if (eid > 0) text = `רמדאן כבר התחיל (או הסתיים). עד עיד אל־פיטר בערך ${eid} ימים`
  else text = 'המועד הצפוי של רמדאן 2027 כבר חלף. בקרוב נעדכן לשנה הבאה'
  return <div className="rounded-3xl bg-indigo-900 p-5 text-center text-white">
    <p className="text-lg">🌙 הספירה לאחור</p>
    <p className="my-2 text-3xl font-black" role="status" aria-live="polite">{text}</p>
    <p className="text-base opacity-90">רמדאן 2027 צפוי להתחיל בערך ב־8 בפברואר, ועיד אל־פיטר בערך ב־9–10 במרץ. התאריך תלוי בראיית הירח, ולכן יתכן הפרש של יום.</p>
  </div>
}

function Quiz() {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  const done = i >= QUIZ.length
  if (done) return <div className="text-center" role="status" aria-live="polite">
    <p className="text-3xl font-black">🎉 סיימתם! {score} מתוך {QUIZ.length}</p>
    <p className="mt-2 text-lg">{score >= 5 ? 'מדהים, אתם כבר מומחים לרמדאן!' : 'כל הכבוד על הלמידה! אפשר לקרוא שוב ולנסות פעם נוספת.'}</p>
    <button type="button" className="ln-btn go mt-4" onClick={() => { setI(0); setPick(null); setScore(0) }}>עוד פעם</button>
  </div>
  const q = QUIZ[i]
  return <div>
    <p className="mb-2 text-base text-[var(--muted-foreground)]">שאלה {i + 1} מתוך {QUIZ.length}</p>
    <h3 className="mb-3 text-2xl font-black">{q.q}</h3>
    <div className="grid gap-2" role="group" aria-label="תשובות">{q.a.map((t, k) => <button key={t} type="button" disabled={pick !== null}
      onClick={() => { setPick(k); if (k === q.ok) setScore(s => s + 1) }}
      className={`min-h-[52px] rounded-2xl border-2 p-3 text-right text-lg font-bold ${pick === null ? 'border-[var(--border)] bg-white' : k === q.ok ? 'border-emerald-600 bg-emerald-100' : k === pick ? 'border-rose-500 bg-rose-100' : 'border-[var(--border)] bg-white opacity-70'}`}>{t}</button>)}</div>
    <div role="status" aria-live="polite">{pick !== null && <p className="mt-3 rounded-2xl bg-white p-3 text-lg">{pick === q.ok ? '✅ נכון! ' : '🤔 כמעט. '}{q.why}</p>}</div>
    {pick !== null && <button type="button" className="ln-btn go mt-3" onClick={() => { setI(i + 1); setPick(null) }}>{i + 1 === QUIZ.length ? 'לתוצאה' : 'לשאלה הבאה'}</button>}
  </div>
}

// ---- printable sheets ----
const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
const foot = txt => <footer>ugabuga.co.il{PATH} · {txt}</footer>

function FanousSheet({ opts }) {
  return <article className="buga-a4" style={page}>
    <h2>🏮 הפנס של רמדאן שלי</h2>
    <p style={{ fontSize: 14, margin: 0, textAlign: 'center' }}>שם: ______________ · אפשר לצבוע או לגזור ולתלות</p>
    <div style={{ flex: 1, width: '70%', minHeight: 0, background: '#0f172a', borderRadius: 20, padding: 12, margin: '6px 0' }}><Fanous {...opts} /></div>
    <p style={{ fontSize: 14, textAlign: 'center' }}>רמדאן כרים · <span lang="ar" dir="rtl" style={arStyle}>رمضان كريم</span></p>
    {foot('פנס מקושט')}
  </article>
}

function CutoutSheet() {
  // Net of a cylinder lantern: slits are cut (solid), folds are dashed. Units are mm on an A4-ish viewBox.
  const slits = []
  for (let i = 1; i <= 8; i++) {
    const x = 10 + i * 17
    slits.push(i % 2 ? <line key={i} x1={x} y1="55" x2={x} y2="115" stroke="#000" strokeWidth="0.8" /> : <line key={i} x1={x} y1="85" x2={x} y2="145" stroke="#000" strokeWidth="0.8" />)
  }
  return <article className="buga-a4" style={page}>
    <h2>✂️ פנס לגזירה ולקיפול</h2>
    <svg viewBox="0 0 190 200" style={{ width: '100%', flex: 1, minHeight: 0 }} aria-hidden="true">
      <rect x="10" y="55" width="170" height="90" fill="#fff7d6" stroke="#000" strokeWidth="0.8" />
      {slits}
      <line x1="10" y1="55" x2="180" y2="55" stroke="#c0392b" strokeWidth="0.7" strokeDasharray="3 2" />
      <line x1="10" y1="145" x2="180" y2="145" stroke="#c0392b" strokeWidth="0.7" strokeDasharray="3 2" />
      <rect x="168" y="55" width="12" height="90" fill="#fde68a" stroke="#000" strokeWidth="0.8" />
      <text x="174" y="104" fontSize="5" textAnchor="middle" transform="rotate(-90 174 100)">פס הדבקה</text>
      <path d="M45 55 Q95 0 145 55" fill="none" stroke="#000" strokeWidth="0.8" />
      <path d="M50 55 Q95 12 140 55" fill="none" stroke="#000" strokeWidth="0.8" />
      <text x="95" y="30" fontSize="5" textAnchor="middle">ידית</text>
      <text x="95" y="102" fontSize="7" textAnchor="middle" fill="#a16207" fontWeight="700">מקשטים כאן</text>
      <path d="M95 120 l3 7 7.5 .5 -6 5 2 7.5 -6.5 -4 -6.5 4 2 -7.5 -6 -5 7.5 -.5Z" fill="none" stroke="#a16207" strokeWidth="0.6" />
    </svg>
    <ol style={{ fontSize: 13, lineHeight: 1.5, margin: '4px 18px 0', paddingInlineStart: 18, width: '100%' }}>
      <li>מקשטים את המלבן בצבעים ובכוכבים. אפשר להדפיס על נייר צבעוני.</li>
      <li>גוזרים לאורך הקו המלא: את המלבן ואת הקווים האנכיים בלבד (בין הקווים האדומים המקווקווים).</li>
      <li>מקפלים בקו האדום המקווקו ומגלגלים לצילינדר. מדביקים בפס ההדבקה.</li>
      <li>מדביקים ידית מפס נייר, ושמים בפנים נר לד. לא משתמשים בנר אמיתי.</li>
    </ol>
    {foot('פנס לגזירה')}
  </article>
}

function ColoringSheet() {
  const s = { fill: 'none', stroke: '#222', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' }
  const stars = [[40, 50, 18], [300, 40, 14], [330, 150, 20], [30, 190, 14], [170, 30, 12], [330, 300, 14]]
  return <article className="buga-a4" style={page}>
    <h2>🌙 דף צביעה: ירח, פנס וכוכבים</h2>
    <svg viewBox="0 0 360 400" style={{ width: '100%', flex: 1, minHeight: 0 }} aria-hidden="true">
      <path d="M200 70 A110 110 0 1 0 280 250 A85 85 0 1 1 200 70 Z" {...s} />
      {stars.map(([x, y, r], i) => <polygon key={i} {...s} points={Array.from({ length: 10 }, (_, k) => { const a = (Math.PI / 5) * k - Math.PI / 2; const rr = k % 2 ? r * 0.45 : r; return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}` }).join(' ')} />)}
      <g transform="translate(140 120) scale(0.8)">
        <path d="M100 8 q-14 0 -14 14 M100 8 q14 0 14 14" {...s} />
        <path d="M70 40 L100 22 L130 40 L138 62 H62 Z" {...s} />
        <rect x="56" y="62" width="88" height="14" rx="4" {...s} />
        <path d="M56 76 Q30 150 56 226 H144 Q170 150 144 76 Z" {...s} />
        <path d="M80 100 L100 90 L120 100 M80 140 H120 M85 180 L100 195 L115 180" {...s} />
        <rect x="52" y="226" width="96" height="14" rx="4" {...s} />
        <path d="M70 240 L82 262 H118 L130 240 Z" {...s} />
      </g>
    </svg>
    <p style={{ fontSize: 14 }} lang="ar" dir="rtl"><span style={arStyle}>رمضان كريم</span></p>
    {foot('דף צביעה')}
  </article>
}

function CardSheet() {
  const half = { flex: 1, width: '100%', border: '2px dashed #666', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 10 }
  return <article className="buga-a4" style={page}>
    <h2>💌 כרטיס ברכה לעיד</h2>
    <p style={{ fontSize: 12, margin: '0 0 4px' }}>גוזרים, מקפלים לשניים: החצי העליון הוא החזית והתחתון הוא הפנים</p>
    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
      <div style={{ ...half, background: '#eef2ff' }}>
        <div style={{ fontSize: 40 }}>🌙✨🏮</div>
        <div lang="ar" dir="rtl" style={{ ...arStyle, fontSize: 64, fontWeight: 700, lineHeight: 1.3 }}>عيد مبارك</div>
        <div style={{ fontSize: 26, fontWeight: 800 }}>עיד מובארכ · חג שמח!</div>
      </div>
      <div style={{ ...half, background: '#fffbeb' }}>
        <div lang="ar" dir="rtl" style={{ ...arStyle, fontSize: 30 }}>كل عام وأنتم بخير</div>
        <div style={{ fontSize: 18, marginTop: 4 }}>כל עאם ואנתום בח׳יר · שתהיו בטוב בכל שנה</div>
        <div style={{ fontSize: 17, marginTop: 18, width: '85%', textAlign: 'right' }}>ל: _______________________</div>
        <div style={{ fontSize: 17, marginTop: 14, width: '85%', textAlign: 'right' }}>מאת: _____________________</div>
        <div style={{ fontSize: 28, marginTop: 14 }}>⭐🌙⭐</div>
      </div>
    </div>
    {foot('כרטיס ברכה')}
  </article>
}

const SHEETS = [
  { id: 'cutout', emoji: '✂️', label: 'פנס לגזירה ולקיפול', C: CutoutSheet },
  { id: 'coloring', emoji: '🖍️', label: 'דף צביעה: ירח, פנס וכוכבים', C: ColoringSheet },
  { id: 'card', emoji: '💌', label: 'כרטיס ברכה לעיד בערבית ובעברית', C: CardSheet },
]

export default function Ramadan() {
  const [print, setPrint] = useState(null)
  const sheet = SHEETS.find(s => s.id === print)

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="רמדאן ועיד אל־פיטר לילדים: הסבר, יצירות ודפי צביעה"
      description="הסבר מכבד לילדים על רמדאן ועיד אל־פיטר: צום, איפטאר, פאנוס וברכות בערבית. עיצוב פנס על המסך, ספירה לאחור, חידון ודפים להדפסה."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, { label: 'רמדאן ועיד אל־פיטר' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🌙 רמדאן ועיד אל־פיטר לילדים: הסבר, יצירות ודפי צביעה</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">הסבר פשוט ומכבד לילדים, להורים ולמורים על חודש רמדאן וחג עיד אל־פיטר: מה עושים, מה אוכלים ואיך מברכים. עם עיצוב פנס על המסך, ספירה לאחור, חידון קצר וארבעה דפים להדפסה.</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2" aria-label="ניווט בעמוד">
      {[['about', 'מה זה רמדאן'], ['eid', 'עיד אל־פיטר'], ['greet', 'ברכות'], ['play', 'פנס, ספירה וחידון'], ['print', 'דפים להדפסה'], ['class', 'בכיתה'], ['tips', 'טיפים']].map(([h, t]) => <a key={h} href={`#${h}`} className="ln-btn alt">{t}</a>)}
    </nav>

    <section id="about" className="mb-8 scroll-mt-24" aria-labelledby="about-h">
      <h2 id="about-h" className="mb-3 text-3xl font-black">🌙 מה זה רמדאן?</h2>
      <p className="mb-4 text-lg leading-relaxed">רמדאן הוא חודש מיוחד בלוח השנה המוסלמי. מוסלמים בעולם כולו, ובהם משפחות רבות בישראל, מציינים אותו בצום, בתפילה, בנתינה ובמפגשים משפחתיים. בדף הזה תמצאו מידע כללי ומכבד. הוא אינו פסיקה דתית, ומנהגים משתנים בין משפחות וקהילות.</p>
      <ul className="grid gap-3 sm:grid-cols-2">{FACTS.map(([e, t, d]) => <li key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <p className="text-xl font-bold"><span aria-hidden="true">{e}</span> {t}</p><p className="mt-1 leading-relaxed">{d}</p></li>)}
      </ul>
      <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-lg leading-relaxed">📅 <b>מתי?</b> רמדאן 2027 צפוי להתחיל בערך ב־8 בפברואר 2027. התאריך המדויק נקבע לפי ראיית הירח החדש, ולכן הוא עשוי לזוז ביום.</p>
    </section>

    <section id="eid" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-emerald-50 p-5" aria-labelledby="eid-h">
      <h2 id="eid-h" className="mb-3 text-3xl font-black">🎉 עיד אל־פיטר: חג שבירת הצום</h2>
      <p className="mb-4 text-lg leading-relaxed">בסיום הרמדאן חוגגים את עיד אל־פיטר, בערך ב־9–10 במרץ 2027, והוא נמשך כמה ימים. זה חג של שמחה, מתנות וביקורים.</p>
      <ul className="grid gap-3 sm:grid-cols-2">{EID.map(([e, t, d]) => <li key={t} className="rounded-2xl bg-white p-4">
        <p className="text-xl font-bold"><span aria-hidden="true">{e}</span> {t}</p><p className="mt-1 leading-relaxed">{d}</p></li>)}
      </ul>
    </section>

    <section id="greet" className="mb-8 scroll-mt-24" aria-labelledby="greet-h">
      <h2 id="greet-h" className="mb-3 text-3xl font-black">👋 ברכות בערבית</h2>
      <p className="mb-4 text-lg">שלוש ברכות שקל ללמוד: בערבית, בתעתיק עברי ובמשמעות.</p>
      <ul className="grid gap-3 md:grid-cols-3">{GREETINGS.map(g => <li key={g.tr} className="rounded-3xl border-2 border-[var(--border)] bg-white p-5 text-center">
        <p lang="ar" dir="rtl" className="text-4xl font-bold leading-snug" style={arStyle}>{g.ar}</p>
        <p className="mt-2 text-xl font-black">{g.tr}</p>
        <p className="mt-1 leading-relaxed">{g.he}</p></li>)}
      </ul>
    </section>

    <section id="play" className="mb-8 scroll-mt-24" aria-labelledby="play-h">
      <h2 id="play-h" className="sr-only">פעילויות על המסך</h2>
      <div className="mb-6 rounded-3xl border-2 border-[var(--border)] bg-yellow-50 p-5">
        <h3 className="mb-3 text-3xl font-black">🏮 מקשטים פנס רמדאן</h3>
        <p className="mb-4 text-lg">בוחרים צבעים ודוגמה, ואפשר להדפיס את הפנס כדי לצבוע או לתלות.</p>
        <FanousStudio onPrint={o => setPrint({ id: 'mine', o })} />
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">🔒 שום דבר לא נשמר ולא נשלח. הבחירות נשארות רק על המסך שלכם.</p>
      </div>
      <div className="mb-6"><Countdown /></div>
      <div className="rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5">
        <h3 className="mb-3 text-3xl font-black">🧠 חידון קצר: כמה אתם יודעים?</h3>
        <Quiz />
      </div>
    </section>

    <section id="print" className="mb-8 scroll-mt-24" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-3 text-3xl font-black">🖨️ דפים להדפסה</h2>
      <p className="mb-4 text-lg leading-relaxed">דפי A4 מוכנים להדפסה. הפנס לגזירה כדאי להדפיס על נייר צבעוני או עבה, והכרטיס מתקפל לשניים. הפנס המקושט שלכם נמצא בהדפסה מהחלק שמעליו.</p>
      <div className="grid gap-3 sm:grid-cols-2">{SHEETS.map(s => <button key={s.id} type="button" onClick={() => setPrint({ id: s.id })}
        className="ln-box card-lift min-h-[64px] text-right text-xl font-bold"><span aria-hidden="true">{s.emoji}</span> {s.label} · הדפסה ←</button>)}
      </div>
    </section>

    <section id="class" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-violet-50 p-5" aria-labelledby="class-h">
      <h2 id="class-h" className="mb-3 text-3xl font-black">🤝 בכיתה מעורבת ובבית ספר יהודי</h2>
      <p className="mb-3 text-lg leading-relaxed">ללמוד על חג של השכנים זה כבוד, סקרנות והיכרות. כמה רעיונות ללמידה מכבדת:</p>
      <ul className="list-disc space-y-2 pr-5 text-lg leading-relaxed">{MIXED_CLASS.map(t => <li key={t}>{t}</li>)}</ul>
    </section>

    <section id="tips" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-white p-5" aria-labelledby="tips-h">
      <h2 id="tips-h" className="mb-3 text-3xl font-black">💡 טיפים להורים ולמורים</h2>
      <ul className="list-disc space-y-2 pr-5 text-lg leading-relaxed">{TIPS.map(t => <li key={t}>{t}</li>)}</ul>
    </section>

    {print && (print.id === 'mine'
      ? <PrintPreview title="רמדאן: הפנס שלי" onClose={() => setPrint(null)}><FanousSheet opts={print.o} /></PrintPreview>
      : sheet && <PrintPreview title={`רמדאן — ${sheet.label}`} onClose={() => setPrint(null)}><sheet.C /></PrintPreview>)}

    <p className="mt-8 text-center text-lg">עוד חגים: <Link className="font-bold underline" to="/holidays/arab-holidays">חגי המוסלמים, הנוצרים והדרוזים</Link> · <Link className="font-bold underline" to="/holidays">כל החגים</Link> · <Link className="font-bold underline" to="/printables/coloring">דפי צביעה</Link> · <Link className="font-bold underline" to="/classroom/accepting-differences">קבלת השונה בכיתה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'רמדאן הוא החודש התשיעי בלוח ההיג׳רי, ועבור מוסלמים רבים הוא זמן של צום משעות הבוקר ועד השקיעה, תפילה, נתינה ומפגשים משפחתיים. בסיומו חוגגים את עיד אל־פיטר עם בגדים חדשים, כעכ ומעמול וביקורים אצל הסבים והשכנים. הדף הזה מסביר את החג בפשטות ובכבוד, לילדים, להורים ולמורים בכיתות ערביות, יהודיות ומעורבות.',
      'בדף תמצאו עיצוב פנס רמדאן על המסך, ספירה לאחור למועד הצפוי (בערך 8 בפברואר 2027, בהתאם לראיית הירח), חידון בן שש שאלות, שלוש ברכות בערבית עם תעתיק עברי, ודפי הדפסה: פנס לגזירה ולקיפול, דף צביעה של ירח, פנס וכוכבים וכרטיס ברכה לעיד בערבית ובעברית. שום מידע לא נשמר ולא נשלח.',
    ]} faq={FAQ} related={[{ label: 'חגי המוסלמים, הנוצרים והדרוזים', href: '/holidays/arab-holidays' }, { label: 'כל החגים', href: '/holidays' }, { label: 'קבלת השונה בכיתה', href: '/classroom/accepting-differences' }]} /></div>
  </div>
}
