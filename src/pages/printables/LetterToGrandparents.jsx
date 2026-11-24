import { useState } from 'react'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'

// "מכתב לסבא ולסבתא": a printable letter by age (gan: drawing + an adult writes; grades 1–2: sentence starters;
// grades 3–6: a guided letter), a choice of recipient, a decorative border, and an optional envelope net
// (a diamond envelope that holds an A4 letter folded in half twice = 105 x 74 mm).
const PATH = '/printables/letter-to-grandparents'

const RECIPIENTS = {
  grandpa: { label: 'סבא', dear: 'סבא יקר', pl: false },
  grandma: { label: 'סבתא', dear: 'סבתא יקרה', pl: false },
  both: { label: 'סבא וסבתא', dear: 'סבא וסבתא יקרים', pl: true },
}
const BORDERS = { hearts: '💛', stars: '⭐', flowers: '🌼', frame: '', none: '' }

function recipientInfo(rec, custom) {
  if (rec === 'custom') {
    const n = custom.trim() || '__________'
    return { name: n, dear: `${n} היקר/ה`, pl: false, to: n }
  }
  const r = RECIPIENTS[rec]
  return { name: r.label, dear: r.dear, pl: r.pl, to: r.label }
}

function Border({ kind, color }) {
  if (kind === 'none') return null
  if (kind === 'frame' || !color) {
    return <g fill="none">
      <rect x={6} y={6} width={188} height={258} rx={6} stroke="#334155" strokeWidth=".7" strokeDasharray={kind === 'frame' ? undefined : '2 2'} />
      {kind === 'frame' && <rect x={9} y={9} width={182} height={252} rx={4} stroke="#334155" strokeWidth=".3" />}
    </g>
  }
  const em = BORDERS[kind]
  const top = Array.from({ length: 14 }, (_, i) => 13 + i * 13.8)
  const side = Array.from({ length: 18 }, (_, i) => 13 + i * 14.1)
  return <g fontSize={6} textAnchor="middle">
    {top.map(x => <text key={`t${x}`} x={x} y={12}>{em}</text>)}
    {top.map(x => <text key={`b${x}`} x={x} y={262}>{em}</text>)}
    {side.slice(1, -1).map(y => <text key={`l${y}`} x={10} y={y + 3}>{em}</text>)}
    {side.slice(1, -1).map(y => <text key={`r${y}`} x={190} y={y + 3}>{em}</text>)}
  </g>
}

function Lines({ x1 = 18, x2 = 182, y, n, gap = 11, guide = false }) {
  return <g>{Array.from({ length: n }, (_, i) => {
    const yy = y + i * gap
    return <g key={i}>
      {guide && <line x1={x1} x2={x2} y1={yy - gap / 2} y2={yy - gap / 2} stroke="#cbd5e1" strokeWidth=".25" strokeDasharray="1.5 1.5" />}
      <line x1={x1} x2={x2} y1={yy} y2={yy} stroke="#64748b" strokeWidth=".35" />
    </g>
  })}</g>
}

function Header({ dear, color, date }) {
  return <g>
    <T x={100} y={25} size={10} weight={800} fill={color ? '#b45309' : '#111'}>{dear}</T>
    {date && <T x={20} y={20} size={3.8} fill="#64748b" anchor="end">תאריך: ____ / ____ / ______</T>}
  </g>
}

function Signature({ name, y, color }) {
  return <T x={100} y={y} size={8} weight={700} fill={color ? '#b45309' : '#111'}>{name ? `באהבה גדולה, ${name}` : 'באהבה גדולה, ______________'}</T>
}

function GanPage({ info, name, color }) {
  const you = info.pl ? 'אתכם' : 'אותך'
  return <g>
    <Header dear={info.dear} color={color} />
    <rect x={20} y={36} width={160} height={108} rx={5} fill={color ? '#fffbeb' : '#fff'} stroke="#94a3b8" strokeWidth=".5" strokeDasharray="3 2" />
    <T x={100} y={46} size={4.2} fill="#94a3b8">כאן מציירים ציור בשבילכם — אפשר גם להדביק תמונה</T>
    <T x={100} y={166} size={7.5} weight={800}>אני אוהב/ת {you} כי…</T>
    <Lines y={182} n={3} gap={13} guide />
    <T x={100} y={222} size={3.8} fill="#64748b">(המבוגר כותב מה שהילד אומר)</T>
    <Signature name={name} y={246} color={color} />
  </g>
}

function EarlyPage({ info, name, color }) {
  const you = info.pl ? 'אתכם' : 'אותך'
  const starters = [
    'מה שלומך? אני מרגיש/ה…',
    'בבית שלי השבוע…',
    'מה שאני הכי אוהב/ת לעשות זה…',
    'אני מתגעגע/ת ואני רוצה לעשות איתך…',
    `אני אוהב/ת ${you} כי…`,
  ]
  return <g>
    <Header dear={info.dear} color={color} date />
    {starters.map((s, i) => {
      const y = 44 + i * 40
      return <g key={s}>
        <circle cx={186} cy={y - 2} r={3.2} fill={color ? ['#fde68a', '#bfdbfe', '#fbcfe8', '#bbf7d0', '#ddd6fe'][i] : '#fff'} stroke="#64748b" strokeWidth=".35" />
        <T x={180} y={y} size={5.6} weight={700} anchor="start">{s}</T>
        <Lines y={y + 14} n={2} gap={12} guide />
      </g>
    })}
    <Signature name={name} y={252} color={color} />
  </g>
}

function GuidedPage({ info, name, color }) {
  const secs = [
    { t: 'פתיחה', hint: 'שלום, מה שלומך? כותבים משפט חם בהתחלה', n: 2, c: '#fde68a' },
    { t: 'חדשות ממני', hint: 'מה קרה לי לאחרונה? בבית הספר, עם חברים, בתחביבים', n: 6, c: '#bfdbfe' },
    { t: info.pl ? 'שאלה בשבילכם' : 'שאלה בשבילך', hint: 'שואלים משהו על החיים שלהם: ילדות, עבודה, מתכון, זיכרון', n: 3, c: '#fbcfe8' },
    { t: 'סיום', hint: 'מתי נתראה? מה אני מצפה לו? ברכה לסיום', n: 2, c: '#bbf7d0' },
  ]
  let y = 40
  return <g>
    <Header dear={info.dear} color={color} date />
    {secs.map(s => {
      const top = y
      y += 11 + s.n * 10.5 + 5
      return <g key={s.t}>
        <rect x={142} y={top - 5} width={44} height={7.5} rx={3.5} fill={color ? s.c : '#fff'} stroke="#64748b" strokeWidth=".35" />
        <T x={164} y={top} size={4.6} weight={800}>{s.t}</T>
        <T x={138} y={top} size={3.3} fill="#64748b" anchor="start">{s.hint}</T>
        <Lines y={top + 10} n={s.n} gap={10.5} />
      </g>
    })}
    <Signature name={name} y={252} color={color} />
  </g>
}

// The envelope net. Body W x H (front: address), four flaps. A letter folded twice (105 x 74 mm) fits with margin.
function EnvelopePage({ info, name, color }) {
  const bx = 40, by = 62, W = 120, H = 85, sw = 24, tf = 48, bf = 36
  const cut = { fill: color ? '#fff7ed' : '#fff', stroke: '#111', strokeWidth: '.5' }
  const fold = { stroke: '#64748b', strokeWidth: '.4', strokeDasharray: '2.5 2' }
  const pts = a => a.map(p => p.join(',')).join(' ')
  return <g>
    <T x={100} y={14} size={8} weight={800}>מעטפה לגזור ולקפל</T>
    <T x={100} y={22} size={3.8} fill="#64748b">קו רציף — גוזרים · קו מקווקו — מקפלים</T>
    <polygon points={pts([[bx, by], [bx - sw, by + 14], [bx - sw, by + H - 14], [bx, by + H]])} {...cut} />
    <polygon points={pts([[bx + W, by], [bx + W + sw, by + 14], [bx + W + sw, by + H - 14], [bx + W, by + H]])} {...cut} />
    <polygon points={pts([[bx, by + H], [bx + W, by + H], [bx + W - 16, by + H + bf], [bx + 16, by + H + bf]])} {...cut} />
    <polygon points={pts([[bx, by], [bx + W, by], [bx + W / 2, by - tf]])} {...cut} />
    <rect x={bx} y={by} width={W} height={H} {...cut} />
    <line x1={bx} y1={by} x2={bx + W} y2={by} {...fold} />
    <line x1={bx} y1={by + H} x2={bx + W} y2={by + H} {...fold} />
    <line x1={bx} y1={by} x2={bx} y2={by + H} {...fold} />
    <line x1={bx + W} y1={by} x2={bx + W} y2={by + H} {...fold} />
    <rect x={bx + W - 22} y={by + 6} width={16} height={19} fill="none" stroke="#94a3b8" strokeWidth=".4" strokeDasharray="1.5 1.5" />
    <T x={bx + W - 14} y={by + 17} size={3.2} fill="#94a3b8">בול</T>
    <T x={bx + W / 2 + 8} y={by + 38} size={7} weight={800} fill={color ? '#b45309' : '#111'}>אל: {info.to}</T>
    <Lines x1={bx + 12} x2={bx + W - 32} y={by + 52} n={3} gap={9} />
    <T x={bx + W / 2} y={by - 14} size={9}>{color ? '💌' : '♡'}</T>
    <T x={bx + W / 2} y={by + H + 18} size={3.6} fill="#64748b">מורחים דבק כאן</T>
    <T x={bx - sw / 2 - 1} y={by + H / 2} size={3.4} fill="#64748b" transform={`rotate(-90 ${bx - sw / 2 - 1} ${by + H / 2})`}>דבק</T>
    <T x={bx + W + sw / 2 + 1} y={by + H / 2} size={3.4} fill="#64748b" transform={`rotate(90 ${bx + W + sw / 2 + 1} ${by + H / 2})`}>דבק</T>
    {[
      '1. גוזרים את כל הצורה לאורך הקו הרציף.',
      '2. מקפלים את ארבעת הדשים פנימה לאורך הקווים המקווקווים.',
      '3. מורחים דבק על שני הדשים הצדדיים ומדביקים עליהם את הדש התחתון.',
      '4. מכניסים את המכתב המקופל פעמיים, ומדביקים את הדש העליון.',
      `5. כותבים בחזית את הכתובת של ${info.to}${name ? ` ושולחים בשם ${name}` : ''}.`,
    ].map((s, i) => <T key={i} x={186} y={204 + i * 9} size={4.2} anchor="start">{s}</T>)}
    <T x={100} y={258} size={3.4} fill="#94a3b8">איך מקפלים את המכתב: דף A4 מקפלים לחצי, ועוד פעם לחצי — עוגה בוגה</T>
  </g>
}

export default function LetterToGrandparents() {
  const [age, setAge] = useState('early')
  const [rec, setRec] = useState('both')
  const [custom, setCustom] = useState('')
  const [name, setName] = useState('')
  const [border, setBorder] = useState('hearts')
  const [color, setColor] = useState('yes')
  const [env, setEnv] = useState('no')
  const c = color === 'yes'
  const info = recipientInfo(rec, custom)
  const props = { info, name: name.trim(), color: c }
  const Page = age === 'gan' ? GanPage : age === 'early' ? EarlyPage : GuidedPage
  const pages = [{ key: 'letter', svg: <Sheet label={`מכתב ל${info.name}`}><Border kind={border} color={c} /><Page {...props} /></Sheet> }]
  if (env === 'yes') pages.push({ key: 'envelope', svg: <Sheet label="מעטפה לגזור ולקפל"><EnvelopePage {...props} /></Sheet> })
  return <PrintableShell path={PATH} emoji="💌" h1="מכתב לסבא ולסבתא להדפסה"
    seoTitle="מכתב לסבא ולסבתא להדפסה — לגן, כיתות א׳–ב׳ וג׳–ו׳, עם מעטפה (PDF חינם)"
    description="מכתב לסבא ולסבתא להדפסה בחינם: תבנית לגן עם ציור ו״אני אוהב אתכם כי…״, תבנית עם פתיחות למשפטים לכיתות א׳–ב׳, ומכתב מודרך לכיתות ג׳–ו׳. בוחרים למי, מוסיפים שם וגבול, ואפשר להדפיס גם מעטפה לגזור ולקפל."
    sub="כותבים, מציירים, שולחים — ובטוח שישמחו. תבנית לפי גיל, ומעטפה לגזור ולקפל"
    crumbs={[{ label: 'סבא וסבתא', href: '/adults/grandparents' }]}
    controls={<div className="space-y-3">
      <p className="m-0 text-center font-bold">גיל הכותב</p>
      <Choice label="גיל" value={age} onChange={setAge} options={[['gan', 'גן — ציור, מבוגר כותב'], ['early', 'כיתות א׳–ב׳ — פתיחות למשפטים'], ['late', 'כיתות ג׳–ו׳ — מכתב מודרך']]} />
      <p className="m-0 text-center font-bold">למי המכתב?</p>
      <Choice label="נמען" value={rec} onChange={setRec} options={[['both', 'סבא וסבתא'], ['grandpa', 'סבא'], ['grandma', 'סבתא'], ['custom', 'שם אחר']]} />
      {rec === 'custom' && <Field label="שם הנמען" value={custom} onChange={setCustom} placeholder="למשל: סבתא רבה, סבא יוסי" maxLength={20} />}
      <Field label="שם הילד או הילדה (אפשר להשאיר ריק)" value={name} onChange={setName} placeholder="השם שלכם" maxLength={20} />
      <Choice label="גבול" value={border} onChange={setBorder} options={[['hearts', 'לבבות'], ['stars', 'כוכבים'], ['flowers', 'פרחים'], ['frame', 'מסגרת'], ['none', 'בלי גבול']]} />
      <Choice label="צבע" value={color} onChange={setColor} options={[['yes', 'צבעוני'], ['no', 'חוסך דיו']]} />
      <Choice label="מעטפה" value={env} onChange={setEnv} options={[['no', 'המכתב בלבד'], ['yes', 'עם מעטפה לגזור ולקפל']]} />
    </div>}
    pages={pages} printTitle="מכתב לסבא ולסבתא"
    paragraphs={[
      'מכתב מילדים לסבא ולסבתא הוא מתנה קטנה שנשמרת שנים. בעידן של הודעות מהירות, דף שנכתב ביד, עם ציור ושגיאת כתיב חמודה, שווה יותר מכל סמיילי. הדף כאן מוכן להדפסה, בשלוש גרסאות לפי גיל, כדי שכל ילד יוכל לכתוב בעצמו בלי להסתבך בדף ריק.',
      'לילדי הגן יש דף עם מקום גדול לציור ושלוש שורות להשלמת המשפט ״אני אוהב/ת אתכם כי…״. הילד אומר והמבוגר כותב, בדיוק במילים של הילד. בכיתות א׳–ב׳ יש חמש פתיחות למשפטים, כל אחת עם שתי שורות כתיבה, כך שגם מי שרק התחיל לכתוב יודע איך להתחיל. בכיתות ג׳–ו׳ המכתב מודרך: פתיחה, חדשות ממני, שאלה בשבילכם וסיום, עם רמז קצר לכל חלק.',
      'אפשר לבחור למי המכתב: סבא, סבתא, שניהם יחד, או כל שם אחר, למשל סבתא רבה או סבא יוסי. הנמען מופיע בראש הדף, בפנייה ובמעטפה. מוסיפים את שם הילד, בוחרים גבול מקושט, ואם רוצים לחסוך דיו אפשר להדפיס בקו פשוט.',
      'כדי לשלוח בדואר מדפיסים את המעטפה: צורה אחת שגוזרים ומקפלים. היא בנויה כגוף מלבני עם ארבעה דשים, והמכתב מקופל פעמיים (דף A4 לחצי ועוד פעם לחצי) נכנס בה בנוחות. כותבים את הכתובת בחזית, מדביקים בול, והמכתב בדרך.',
      'מה עוד אפשר לעשות? לצלם את המכתב ולשלוח בוואטסאפ לסבא וסבתא שגרים רחוק, כדי שיקבלו אותו כבר היום, ולשלוח את המקור בדואר. לצרף תמונה של הילד, או ציור קטן נוסף. לכתוב לפני חגים, ליום הולדת, או סתם כי התגעגעתם. ולבקש תשובה: סבא וסבתא אוהבים לכתוב בחזרה, וכך נוצרת חליפת מכתבים ביניכם.',
    ]}
    faq={[
      { q: 'איך עוזרים לילד שלא יודע מה לכתוב?', a: 'מתחילים מהפתיחות לכתיבה: ״השבוע עשיתי…״, ״אני אוהב/ת אתכם כי…״. אפשר לשאול את הילד שאלה בקול ולתת לו לענות, ואז לכתוב את התשובה כמו שהיא. אל תתקנו יותר מדי: חשוב שהמכתב יישמע כמו הילד.' },
      { q: 'מה עושים עם ילד בגן שעדיין לא כותב?', a: 'הילד מצייר, אומר את המשפט והמבוגר כותב אותו. אפשר לתת לילד לחתום בעצמו, גם אם זה רק האות הראשונה של שמו או ציור קטן.' },
      { q: 'איך מקפלים את המעטפה?', a: 'גוזרים לפי הקו הרציף, מקפלים את ארבעת הדשים פנימה, מורחים דבק על הדשים הצדדיים וסוגרים עליהם את הדש התחתון. בסוף מכניסים את המכתב ומדביקים את הדש העליון. המעטפה מתאימה לדף A4 שמקופל פעמיים.' },
      { q: 'אפשר לשלוח את המעטפה בדואר?', a: 'כן. כותבים בחזית את הכתובת המלאה ושם הנמען, מדביקים בול במקום המסומן ושולחים. כדי שתהיה חזקה יותר מדפיסים על נייר עבה יותר, אם המדפסת מאפשרת.' },
      { q: 'מתי כדאי לשלוח מכתב לסבא וסבתא?', a: 'בכל זמן: לפני חג, ביום ההולדת שלהם, אחרי ביקור, או בלי סיבה. אפשר גם לשלוח תמונה של המכתב בוואטסאפ לפני שהמקור מגיע בדואר.' },
      { q: 'איך חוסכים דיו?', a: 'בוחרים ״חוסך דיו״ למעלה: הצבעים מתחלפים בקו פשוט והרקעים נעלמים. אפשר גם לבחור ״בלי גבול״.' },
    ]}
    related={[{ label: 'פעילויות עם סבא וסבתא', href: '/adults/grandparents' }, { label: 'ראיון עם סבא וסבתא', href: '/adults/grandparents/interview' }, { label: 'דפים להדפסה', href: '/printables' }]}
  />
}
