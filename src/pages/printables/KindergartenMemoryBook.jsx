import { useState } from 'react'
import PrintableShell, { Choice, Field, Sheet, T } from '../../components/printables/PrintableShell'

const THEMES = {
  rainbow: { label: '🌈 קשת וצבעים', ink: '#5b3bbf', soft: '#f2eaff', accent: '#ff9f43', mint: '#d8f6e6' },
  jungle: { label: '🦒 ספארי עדין', ink: '#336d4b', soft: '#e4f5d4', accent: '#ffb04d', mint: '#fff1ca' },
  space: { label: '🚀 חלל וחלומות', ink: '#31589b', soft: '#e5ecff', accent: '#ff7b72', mint: '#dff7fa' },
}
const PHOTO_LABELS = ['תמונת כריכה', 'אני בגן', 'רגע אהוב 1', 'רגע אהוב 2', 'רגע אהוב 3', 'רגע אהוב 4', 'חברים בגן', 'סיום השנה']

function Star({ x, y, s = 3, fill }) {
  return <path d={`M${x} ${y - s}l${s * .65} ${s * 1.95} ${s * 2.05} 0-1.66 ${s * 1.18} ${s * .64} ${s * 1.95}-1.68-1.2-1.67 1.2.64-1.95-1.67-1.18 ${s * 2.05} 0Z`} fill={fill} />
}
function Doodle({ theme, x, y, scale = 1 }) {
  const p = THEMES[theme]
  if (theme === 'jungle') return <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={p.ink} strokeWidth="1.4"><circle cx="0" cy="0" r="11" fill={p.accent} opacity=".35" /><path d="M-8 5q8 9 16 0M-7 -4l-5-8 9 4M7 -4l5-8-9 4M-5 0h3M2 0h3M-2 4q2 2 4 0" /><path d="M-15 14q15-8 30 0" /></g>
  if (theme === 'space') return <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={p.ink} strokeWidth="1.4"><path d="M0-16c9 10 10 21 0 27C-10 5-9-6 0-16Z" fill={p.accent} opacity=".4" /><path d="M0-16c9 10 10 21 0 27C-10 5-9-6 0-16ZM-10 7l-7 6 11-2M10 7l7 6-11-2M0 11v8M-4-2h8" /><circle cx="-14" cy="-12" r="1.7" fill={p.ink} /><circle cx="14" cy="-6" r="1.7" fill={p.ink} /></g>
  return <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={p.ink} strokeWidth="1.4"><path d="M-16 8Q-16-8 0-8T16 8Q16 21 0 27Q-16 21-16 8Z" fill={p.accent} opacity=".32" /><path d="M-16 8Q-16-8 0-8T16 8Q16 21 0 27Q-16 21-16 8ZM-8 4l8-10 8 10M-6 11h.1M6 11h.1M-4 17q4 4 8 0" /><Star x="-18" y="-9" s="3" fill={p.ink} /><Star x="20" y="3" s="2.5" fill={p.ink} /></g>
}
function Photo({ src, x, y, w, h, label, index, theme, round = 5 }) {
  const p = THEMES[theme], id = `garden-photo-${index}`
  return <g>
    <defs><clipPath id={id}><rect x={x} y={y} width={w} height={h} rx={round} /></clipPath></defs>
    <rect x={x} y={y} width={w} height={h} rx={round} fill="#fff" stroke={p.ink} strokeWidth="1.2" />
    {src
      ? <image href={src} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id})`} />
      : <><rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx={Math.max(1, round - 2)} fill={p.soft} /><path d={`M${x + 8} ${y + h - 10}l${w * .2}-${h * .25} ${w * .18} ${h * .15} ${w * .2}-${h * .35} ${w * .2} ${h * .45}H${x + w - 8}V${y + h - 7}H${x + 8}Z`} fill={p.mint} /><circle cx={x + w * .72} cy={y + h * .25} r={Math.min(w, h) * .09} fill={p.accent} opacity=".55" /><T x={x + w / 2} y={y + h / 2 + 2} size="4.1" weight={800} fill={p.ink}>📷 {label}</T></>}
    <rect x={x} y={y} width={w} height={h} rx={round} fill="none" stroke={p.ink} strokeWidth="1.2" />
  </g>
}
function Lines({ x, y, w, rows, color }) {
  return <g stroke={color} strokeWidth=".45" opacity=".7">{Array.from({ length: rows }, (_, i) => <line key={i} x1={x} x2={x + w} y1={y + i * 8} y2={y + i * 8} />)}</g>
}
function Header({ theme, title, subtitle }) {
  const p = THEMES[theme]
  return <g><path d="M0 0H200V28Q166 38 132 27Q98 17 67 28Q32 39 0 26Z" fill={p.soft} /><Doodle theme={theme} x={18} y={10} scale=".72" /><Doodle theme={theme} x={182} y={10} scale=".72" /><T x="100" y="11" size="7.2" weight={900} fill={p.ink}>{title}</T>{subtitle && <T x="100" y="20" size="3.5" weight={700} fill={p.ink}>{subtitle}</T>}</g>
}
function Cover({ name, garden, year, theme, photos }) {
  const p = THEMES[theme]
  return <Sheet label="כריכת יומן הגן שלי"><rect width="200" height="270" fill="#fffdf8" /><path d="M0 0H200V73Q164 88 130 69Q98 53 65 73Q31 92 0 70Z" fill={p.soft} /><path d="M0 247Q31 227 63 247Q98 267 135 246Q167 228 200 247V270H0Z" fill={p.mint} /><Doodle theme={theme} x="21" y="24" scale="1.1" /><Doodle theme={theme} x="179" y="24" scale="1.1" /><Star x="69" y="18" s="3" fill={p.accent} /><Star x="132" y="17" s="3" fill={p.accent} />
    <T x="100" y="49" size="11" weight={900} fill={p.ink}>יומן הגן שלי</T><T x="100" y="62" size="4.5" weight={800} fill={p.ink}>{garden || 'הזיכרונות שלי מהגן'}</T>
    <Photo src={photos[0]} x="40" y="83" w="120" h="111" label="תמונת כריכה" index="cover" theme={theme} round="12" />
    <rect x="30" y="204" width="140" height="29" rx="8" fill="#fff" stroke={p.ink} strokeWidth="1" /><T x="100" y="216" size="4.3" fill={p.ink}>היומן של</T><T x="100" y="228" size="8" weight={900} fill={p.ink}>{name || 'השם שלי'}</T>
    <T x="100" y="258" size="4.2" weight={800} fill={p.ink}>{year || 'שנת הגן שלי'}</T><T x="100" y="266" size="2.7" fill={p.ink}>עוגה בוגה · ugabuga.co.il</T></Sheet>
}
function AboutMe({ name, theme, photos }) {
  const p = THEMES[theme]
  return <Sheet label="הכירו אותי"><rect width="200" height="270" fill="#fffdf8" /><Header theme={theme} title="הכירו אותי" subtitle={name ? `אני ${name}` : 'אני מיוחד/ת בדיוק כמו שאני'} /><Photo src={photos[1]} x="16" y="46" w="70" h="74" label="אני בגן" index="me" theme={theme} />
    <rect x="101" y="46" width="83" height="74" rx="7" fill={p.soft} stroke={p.ink} strokeWidth="1" /><T x="142.5" y="58" size="4.4" weight={900} fill={p.ink}>זה אני!</T><circle cx="142.5" cy="83" r="17" fill="#fff" stroke={p.ink} strokeWidth=".9" strokeDasharray="2 1.5" /><T x="142.5" y="87" size="3.5" fill={p.ink}>ציירו אותי</T><T x="142.5" y="108" size="3.1" fill={p.ink}>או הדביקו תמונה</T>
    {['המאכל שאני הכי אוהב/ת', 'המשחק שאני הכי אוהב/ת', 'הדבר שאני מצטיין/ת בו'].map((label, i) => <g key={label}><rect x="16" y={135 + i * 33} width="168" height="25" rx="6" fill={i % 2 ? '#fff' : p.mint} stroke={p.ink} strokeWidth=".7" /><T x="175" y={145 + i * 33} size="3.9" weight={800} anchor="end" fill={p.ink}>{label}</T><line x1="22" x2="150" y1={154 + i * 33} y2={154 + i * 33} stroke={p.ink} strokeWidth=".55" /></g>)}
    <Doodle theme={theme} x="28" y="245" scale=".65" /><Doodle theme={theme} x="172" y="245" scale=".65" /><T x="100" y="259" size="4.3" weight={800} fill={p.ink}>אני לומד/ת, משחק/ת וגדל/ה כל יום</T><T x="100" y="267" size="2.7" fill={p.ink}>עוגה בוגה · ugabuga.co.il</T></Sheet>
}
function Moments({ theme, photos }) {
  const p = THEMES[theme]
  return <Sheet label="הרגעים הכי יפים מהגן"><rect width="200" height="270" fill="#fffdf8" /><Header theme={theme} title="הרגעים הכי יפים שלי" subtitle="4 תמונות, 4 זיכרונות קטנים"} />
    {[[16,47],[107,47],[16,150],[107,150]].map(([x,y], i) => <g key={i}><Photo src={photos[i + 2]} x={x} y={y} w="77" h="70" label={`רגע ${i + 1}`} index={`moment-${i}`} theme={theme} /><T x={x + 38.5} y={y + 79} size="3.7" weight={800} fill={p.ink}>מה קרה כאן?</T><line x1={x + 5} x2={x + 72} y1={y + 86} y2={y + 86} stroke={p.ink} strokeWidth=".55" /><line x1={x + 5} x2={x + 72} y1={y + 93} y2={y + 93} stroke={p.ink} strokeWidth=".55" /></g>)}
    <path d="M12 260q25-13 48 0t48 0 48 0 44 0" fill="none" stroke={p.accent} strokeWidth="2" /><T x="100" y="267" size="2.7" fill={p.ink}>עוגה בוגה · ugabuga.co.il</T></Sheet>
}
function Friends({ name, theme, photos }) {
  const p = THEMES[theme]
  return <Sheet label="החברים והחוויות שלי בגן"><rect width="200" height="270" fill="#fffdf8" /><Header theme={theme} title="החברים והחוויות שלי" subtitle="כי בגן הכי כיף ביחד"} /><Photo src={photos[6]} x="40" y="45" w="120" h="75" label="חברים בגן" index="friends" theme={theme} round="10" />
    <rect x="16" y="137" width="168" height="40" rx="8" fill={p.soft} stroke={p.ink} strokeWidth=".8" /><T x="175" y="149" anchor="end" size="4.2" weight={900} fill={p.ink}>עם מי אני אוהב/ת לשחק?</T><Lines x="25" y="160" w="145" rows="2" color={p.ink} />
    <rect x="16" y="187" width="168" height="48" rx="8" fill={p.mint} stroke={p.ink} strokeWidth=".8" /><T x="175" y="199" anchor="end" size="4.2" weight={900} fill={p.ink}>הפעילות שהכי אהבתי בגן</T><Lines x="25" y="211" w="145" rows="2" color={p.ink} />
    <T x="100" y="253" size="5" weight={900} fill={p.ink}>{name ? `${name}, איזה כיף שהיה לך בגן!` : 'איזה כיף שהיה לי בגן!'}</T><T x="100" y="267" size="2.7" fill={p.ink}>עוגה בוגה · ugabuga.co.il</T></Sheet>
}
function Finale({ name, year, theme, photos }) {
  const p = THEMES[theme]
  return <Sheet label="בסוף השנה"><rect width="200" height="270" fill="#fffdf8" /><Header theme={theme} title="בסוף השנה" subtitle={year || 'כמה גדלתי השנה'} /><Photo src={photos[7]} x="56" y="43" w="88" h="72" label="סיום השנה" index="finale" theme={theme} round="11" />
    <rect x="16" y="130" width="168" height="33" rx="7" fill={p.soft} stroke={p.ink} strokeWidth=".8" /><T x="175" y="142" anchor="end" size="4.3" weight={900} fill={p.ink}>משהו חדש שלמדתי</T><Lines x="26" y="153" w="143" rows="1" color={p.ink} />
    <rect x="16" y="173" width="168" height="33" rx="7" fill={p.mint} stroke={p.ink} strokeWidth=".8" /><T x="175" y="185" anchor="end" size="4.3" weight={900} fill={p.ink}>רגע שהייתי גאה בו</T><Lines x="26" y="196" w="143" rows="1" color={p.ink} />
    <rect x="16" y="216" width="168" height="29" rx="7" fill="#fff" stroke={p.ink} strokeWidth=".8" /><T x="175" y="228" anchor="end" size="4.3" weight={900} fill={p.ink}>אני מאחל/ת לעצמי לשנה הבאה...</T><line x1="26" x2="169" y1="238" y2="238" stroke={p.ink} strokeWidth=".55" />
    <Doodle theme={theme} x="26" y="255" scale=".54" /><Doodle theme={theme} x="174" y="255" scale=".54" /><T x="100" y="267" size="2.7" fill={p.ink}>עוגה בוגה · ugabuga.co.il</T></Sheet>
}
function PhotoUpload({ label, onChange }) {
  return <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-3 py-2 text-right font-bold text-sky-900 hover:bg-sky-50"><span aria-hidden="true">📷</span><span className="flex-1">{label}</span><input className="sr-only" type="file" accept="image/*" onChange={onChange} /></label>
}

export default function KindergartenMemoryBook() {
  const [theme, setTheme] = useState('rainbow')
  const [name, setName] = useState('')
  const [garden, setGarden] = useState('')
  const [year, setYear] = useState('תשפ״ז')
  const [photos, setPhotos] = useState(Array(8).fill(''))
  const choosePhoto = index => event => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotos(current => current.map((value, i) => i === index ? String(reader.result || '') : value))
    reader.readAsDataURL(file)
  }
  const pages = [
    { key: 'cover', svg: <Cover name={name.trim()} garden={garden.trim()} year={year.trim()} theme={theme} photos={photos} /> },
    { key: 'about', svg: <AboutMe name={name.trim()} theme={theme} photos={photos} /> },
    { key: 'moments', svg: <Moments theme={theme} photos={photos} /> },
    { key: 'friends', svg: <Friends name={name.trim()} theme={theme} photos={photos} /> },
    { key: 'finale', svg: <Finale name={name.trim()} year={year.trim()} theme={theme} photos={photos} /> },
  ]
  return <PrintableShell path="/printables/kindergarten-memory-book" emoji="📔" h1="יומן גן אישי עם תמונות" seoTitle="יומן גן אישי להדפסה בחינם — תמונות, זיכרונות ופעילויות" description="יוצרים יומן גן אישי ומעוצב להדפסה: כריכה עם שם ותמונה, דפי זיכרונות, חברים, ציורים וסיכום שנה. עד 8 תמונות נשארות בדפדפן בלבד."
    sub="5 דפים צבעוניים ומעוצבים — מוסיפים תמונות, מדפיסים ושומרים למזכרת"
    crumbs={[{ label: 'יצירה מנייר', href: '/printables?topic=paper' }]}
    controls={<>
      <Choice label="סגנון העיצוב" value={theme} onChange={setTheme} options={Object.entries(THEMES).map(([value, themeData]) => [value, themeData.label])} />
      <div className="grid gap-3 sm:grid-cols-3"><Field label="שם הילד או הילדה" value={name} onChange={setName} placeholder="למשל: אופק" maxLength={24} /><Field label="שם הגן — רשות" value={garden} onChange={setGarden} placeholder="גן חמנייה" maxLength={32} /><Field label="שנת הגן" value={year} onChange={setYear} placeholder="תשפ״ז" maxLength={18} /></div>
      <div><p className="mb-2 text-center font-bold">מוסיפים עד 8 תמונות</p><div className="grid gap-2 sm:grid-cols-2">{PHOTO_LABELS.map((label, index) => <PhotoUpload key={label} label={label} onChange={choosePhoto(index)} />)}</div></div>
      <p className="rounded-xl bg-white/70 p-3 text-center font-bold">🔒 התמונות נשארות רק בדפדפן במכשיר שלכם. הן אינן עולות לאתר ואינן נשמרות.</p>
    </>}
    pages={pages} previewAll
    paragraphs={['יומן הגן האישי הוא מזכרת שלמה מהשנה: כריכה עם תמונה ושם, דף “הכירו אותי”, ארבעה רגעים מצולמים, חוויות עם חברים ודף סיום שנה. השאירו מסגרות ריקות כדי להדביק תמונות מודפסות, או הוסיפו תמונות ישר מהטלפון לפני ההדפסה.', 'העיצוב בנוי כמו אלבום קטן ולא כמו טופס: יש שלושה סגנונות, צבעים עדינים, מסגרות מאוירות ומקום לציור וכתב יד. אפשר ליצור חוברת קצרה, להדפיס, לחורר ולכרוך בסרט. כדי להוסיף עוד תמונות, החליפו את ארבע תמונות “הרגעים” והדפיסו שוב את הדף.']}
    faq={[{ q: 'כמה תמונות אפשר להוסיף?', a: 'במהדורה אחת אפשר להוסיף עד 8 תמונות: כריכה, תמונה אישית, ארבעה רגעים, חברים וסיום השנה. אפשר להחליף תמונות ולהדפיס שוב את דף הרגעים כדי להמשיך את האלבום.' }, { q: 'האם התמונות נשמרות באתר?', a: 'לא. התמונות נקראות רק בדפדפן כדי להציג אותן בהדפסה. הן לא נשלחות לשרת ולא נשמרות באתר; סגירת הדף מוחקת אותן מהתצוגה.' }, { q: 'האם מתאים גם למשפחות?', a: 'כן. אפשר לכתוב שם גן או להשאיר ריק, וליצור מזכרת של שנה בגן, בבית או בקייטנה.' }]}
    related={[{ href: '/printables/bookmarks', label: 'סימניות אישיות עם תמונה' }, { href: '/printables/name-labels', label: 'מדבקות שם לספרים ולמחברות' }, { href: '/printables/home-charts', label: 'לוחות אישיים לילדים' }]}
    extra={<p className="text-sm">טיפ: הדפיסו דו־צדדי על נייר עבה או כרכו בסרט צבעוני לחוברת מזכרת.</p>}
  />
}
