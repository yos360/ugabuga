import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { BIRKON_DESIGNS, designById, wrapText, dedicationSamples } from '../../data/birkonDesigns'
import { crumbs, SpokeNav, GenderChips, Chip, inputCls } from './shared'

const PATH = '/bar-mitzvah/birkon'

const FAQ = [
  { q: 'מה זה ברכון לבר מצווה ולבת מצווה?', a: 'ברכון הוא חוברת קטנה עם ברכת המזון וברכות נוספות שמניחים על שולחנות האורחים בסעודה. בבר ובבת מצווה רבים מוסיפים לה כריכה אישית עם שם החוגג/ת, התאריך והקדשה — וככה הברכון הופך גם למזכרת שהאורחים לוקחים הביתה.' },
  { q: 'האם הכלי מדפיס גם את ברכת המזון?', a: 'לא. הכלי מכין כריכה והקדשה בלבד. את נוסח ברכת המזון עצמו מדפיסים בברכון מוכן, בנוסח שמקובל בבית הכנסת או במשפחה (אשכנז, ספרד, עדות המזרח ועוד), ומחברים אליו את הכריכה. כך הנוסח נשאר מדויק ומנוקד כמו שצריך.' },
  { q: 'באיזה גודל להדפיס, A5 או A6?', a: 'A5 (14.8 על 21 ס״מ) הוא גודל של ברכון רגיל עם כמה עמודים. A6 (בערך 10.5 על 14.8 ס״מ) הוא ברכון כיס קטן. בדף A4 נכנס כריכה אחת בגודל A5, או ארבע כריכות בגודל קרוב ל־A6 (כ־8.5 על 12 ס״מ, קצת קטן מ־A6 אמיתי כדי שייכנס בשוליים). בחלון ההדפסה בוחרים גודל אמיתי (100%), לא "התאמה לדף".' },
  { q: 'איך מדפיסים חזית ואחורה?', a: 'ההדפסה יוצאת בשני דפים: דף חזית ודף גב. אפשר להדפיס דו־צדדית, או להדפיס את דף החזית, להחזיר את הדף למדפסת ולהדפיס עליו את דף הגב. אפשר גם להדפיס כל אחד בנפרד ולהדביק גב אל גב. כדאי לנסות קודם על דף אחד.' },
  { q: 'אפשר להדפיס בבית או בבית דפוס?', a: 'שתי האפשרויות מתאימות. בבית — על נייר כרטיס או נייר עבה (200–250 גרם) כדי שהכריכה תחזיק. בבית דפוס אפשר לשמור את התצוגה כ־PDF מחלון ההדפסה ולהביא אותה, ולבקש חיתוך וכריכה. בחוברת מרובת עמודים כדאי לשאול את בית הדפוס על הדבקה או הידוק.' },
]

const RELATED = [
  { label: 'כל המדריך לבר ולבת מצווה', href: '/bar-mitzvah' },
  { label: 'מזכרות לבר ובת מצווה', href: '/bar-mitzvah/souvenir' },
  { label: 'מחולל הזמנות', href: '/invitation' },
  { label: 'ספקים לבר ובת מצווה', href: '/suppliers/category/mitzvah' },
]

const APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  'name': 'מעצב כריכה לברכון לבר ובת מצווה',
  'url': 'https://ugabuga.co.il' + PATH,
  'applicationCategory': 'DesignApplication',
  'operatingSystem': 'Web',
  'inLanguage': 'he',
  'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'ILS' },
}

// Four-point sparkle centred at (x, y)
const sparkle = (x, y, r) => `M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.28}L${x + r} ${y}L${x + r * 0.28} ${y + r * 0.28}L${x} ${y + r}L${x - r * 0.28} ${y + r * 0.28}L${x - r} ${y}L${x - r * 0.28} ${y - r * 0.28}Z`

function Flower({ x, y, r, c, centre = '#f6c344' }) {
  const a = [0, 72, 144, 216, 288]
  return (
    <g>
      {a.map(deg => <circle key={deg} cx={x + Math.cos((deg * Math.PI) / 180) * r} cy={y + Math.sin((deg * Math.PI) / 180) * r} r={r * 0.75} fill={c} />)}
      <circle cx={x} cy={y} r={r * 0.6} fill={centre} />
    </g>
  )
}

// The artwork behind the text, drawn on a 148 x 210 canvas (A5 proportions; A6 has the same ratio).
function Art({ d, back }) {
  const { bg, accent, soft } = d
  const k = back ? 0.6 : 1
  switch (d.id) {
    case 'stars': {
      const pts = [[18, 20, 7], [52, 12, 4], [96, 22, 5], [130, 14, 8], [28, 52, 3], [120, 48, 4], [12, 176, 5], [44, 192, 8], [100, 186, 4], [132, 170, 7], [76, 198, 3], [136, 196, 3]]
      return <g>{pts.map(([x, y, r]) => <path key={x + '-' + y} d={sparkle(x, y, r * (back ? 0.8 : 1))} fill={(x + y) % 2 ? accent : soft} />)}<circle cx="74" cy="104" r="86" fill="none" stroke={soft} strokeWidth="0.6" opacity="0.6" /></g>
    }
    case 'waves':
      return <g>{[0, 1, 2, 3].map(i => {
        const y = 176 + i * 9 * k
        return <path key={i} d={`M0 ${y}Q18 ${y - 10} 37 ${y}T74 ${y}T111 ${y}T148 ${y}V210H0Z`} fill={i % 2 ? soft : accent} opacity={0.55 + i * 0.15} />
      })}<path d={`M0 28Q18 18 37 28T74 28T111 28T148 28V0H0Z`} fill={soft} opacity="0.7" /><path d="M0 18Q18 8 37 18T74 18T111 18T148 18V0H0Z" fill={accent} opacity="0.8" /></g>
    case 'flowers':
      return <g>
        <ellipse cx="30" cy="30" rx="14" ry="5" fill={soft} transform="rotate(35 30 30)" /><ellipse cx="14" cy="42" rx="12" ry="4.5" fill={soft} transform="rotate(-20 14 42)" />
        <Flower x={22} y={22} r={8} c={accent} /><Flower x={120} y={186} r={9} c={accent} /><Flower x={134} y={30} r={6} c="#f4a6c0" centre="#fff" /><Flower x={14} y={182} r={6} c="#f4a6c0" centre="#fff" />
        <ellipse cx="118" cy="198" rx="14" ry="5" fill={soft} transform="rotate(30 118 198)" /><ellipse cx="136" cy="176" rx="12" ry="4.5" fill={soft} transform="rotate(-30 136 176)" />
      </g>
    case 'geometric': {
      const n = 8, w = 148 / n
      return <g>{Array.from({ length: n }, (_, i) => <g key={i}>
        <path d={`M${i * w} 0L${i * w + w} 0L${i * w + w / 2} ${14 * k + 6}Z`} fill={i % 2 ? accent : soft} />
        <path d={`M${i * w} 210L${i * w + w} 210L${i * w + w / 2} ${210 - 14 * k - 6}Z`} fill={i % 2 ? soft : accent} />
      </g>)}<rect x="6" y="6" width="136" height="198" fill="none" stroke={accent} strokeWidth="0.7" opacity="0.5" /></g>
    }
    case 'jerusalem': {
      const n = 4, w = 148 / n
      return <g>{Array.from({ length: n }, (_, i) => {
        const x = i * w + 3, aw = w - 6, top = 182 - 8 * k
        return <path key={i} d={`M${x} 210V${top + aw / 2}A${aw / 2} ${aw / 2} 0 0 1 ${x + aw} ${top + aw / 2}V210Z`} fill={i % 2 ? soft : accent} opacity="0.85" />
      })}<rect x="0" y="0" width="148" height="12" fill={accent} opacity="0.8" />{Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 12.34 + 2} y="12" width="8" height="5" fill={accent} opacity="0.8" />)}</g>
    }
    case 'rainbow': {
      const cols = ['#e8505b', '#f6944a', '#f6c344', '#5bb774', '#4aa3df', '#8b6fd1']
      return <g>{cols.map((c, i) => { const r = 62 - i * 7; return <path key={c} d={`M${74 - r} 52A${r} ${r} 0 0 1 ${74 + r} 52`} fill="none" stroke={c} strokeWidth="6.4" /> })}
        <circle cx="22" cy="190" r={back ? 5 : 8} fill={soft} /><circle cx="128" cy="196" r={back ? 4 : 6} fill="#4aa3df" /><circle cx="110" cy="178" r={back ? 3 : 4} fill="#e8505b" /></g>
    }
    default:
      return <rect width="148" height="210" fill={bg} />
  }
}

const nameSize = len => (len <= 8 ? 20 : len <= 12 ? 16 : len <= 18 ? 13 : 10.5)

function Cover({ d, back, name, boy, date, dedication, from, sample }) {
  const ink = d.ink
  const nameLines = wrapText(name || (sample ? (boy ? 'שם הבר מצווה' : 'שם הבת מצווה') : ''), 16).slice(0, 2)
  const ns = nameSize(Math.max(...nameLines.map(l => l.length), 1))
  const ded = wrapText(dedication, 26).slice(0, 8)
  return (
    <svg viewBox="0 0 148 210" role="img" aria-label={back ? 'גב הכריכה' : 'חזית הכריכה'} style={{ direction: 'rtl', fontFamily: 'Heebo, Rubik, Arial, sans-serif', width: '100%', height: '100%', display: 'block' }}>
      <rect width="148" height="210" fill={d.bg} />
      <Art d={d} back={back} />
      <rect x="13" y={back ? 40 : 46} width="122" height={back ? 124 : 116} rx="9" fill={d.bg} fillOpacity="0.9" stroke={d.accent} strokeWidth="0.8" />
      {!back && <g textAnchor="middle" fill={ink}>
        <text x="74" y="78" fontSize="25" fontWeight="800" fill={d.accent}>ברכון</text>
        <text x="74" y="94" fontSize="8.5">{boy ? 'לכבוד בר המצווה' : 'לכבוד בת המצווה'}</text>
        <line x1="50" y1="101" x2="98" y2="101" stroke={d.accent} strokeWidth="0.8" />
        {nameLines.map((l, i) => <text key={i} x="74" y={124 + i * ns * 1.25} fontSize={ns} fontWeight="800">{l}</text>)}
        {date && <text x="74" y="154" fontSize="8.5">{date}</text>}
      </g>}
      {back && <g textAnchor="middle" fill={ink}>
        <text x="74" y="62" fontSize="11" fontWeight="800" fill={d.accent}>הקדשה</text>
        <line x1="56" y1="68" x2="92" y2="68" stroke={d.accent} strokeWidth="0.8" />
        {ded.map((l, i) => <text key={i} x="74" y={86 + i * 11.5} fontSize="8">{l}</text>)}
        {!dedication && sample && <text x="74" y="100" fontSize="7.5" opacity="0.6">כאן תופיע ההקדשה</text>}
        {from && <text x="74" y="156" fontSize="8.5" fontWeight="700">{from}</text>}
      </g>}
    </svg>
  )
}

const SIZES = [['a5', 'A5 · כריכה אחת בדף (14.8×21 ס״מ)'], ['a6', 'כיס · ארבע כריכות בדף (קרוב ל־A6)']]

function Sheet({ size, back, ...p }) {
  const cover = <Cover {...p} back={back} />
  const label = back ? 'גב' : 'חזית'
  if (size === 'a5') {
    return (
      <div className="buga-a4">
        <div className="bk-a5" style={{ width: '70.5%', aspectRatio: '148/210', outline: '1px dashed #999' }}>{cover}</div>
        <footer>{label} · A5 · ugabuga.co.il</footer>
      </div>
    )
  }
  return (
    <div className="buga-a4">
      <div style={{ width: '94%', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {[0, 1, 2, 3].map(i => <div key={i} style={{ aspectRatio: '105/148', outline: '1px dashed #999' }}><Cover {...p} back={back} /></div>)}
      </div>
      <footer>{label} · גזרו לאורך הקו המקווקו · ugabuga.co.il</footer>
    </div>
  )
}

export default function BirkonMaker() {
  const [design, setDesign] = useState('stars')
  const [gender, setGender] = useState('boy')
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [dedication, setDedication] = useState('')
  const [from, setFrom] = useState('')
  const [size, setSize] = useState('a5')
  const [print, setPrint] = useState(false)
  const boy = gender === 'boy'
  const d = designById(design)
  const props = { d, name: name.trim(), boy, date: date.trim(), dedication: dedication.trim(), from: from.trim() }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
      <style>{'@media print{.bk-a5{width:148mm!important;height:210mm!important;aspect-ratio:auto!important}}'}</style>
      <SEO title="עיצוב ברכון לבר מצווה ולבת מצווה — כריכה אישית להדפסה" description="מעצבים כריכה לברכון לבר מצווה או לבת מצווה: בוחרים עיצוב, כותבים שם, תאריך והקדשה, ומדפיסים חזית וגב בגודל A5 או A6. חינם, בלי הרשמה." path={PATH} structuredData={[faqSchema(FAQ), APP_SCHEMA]} />
      <Breadcrumbs items={crumbs('ברכון')} />
      <h1 className="mb-2 text-center text-4xl"><span aria-hidden="true">📖 </span>עיצוב ברכון לבר מצווה ולבת מצווה</h1>
      <p className="mx-auto mb-8 max-w-3xl text-center text-lg text-[var(--muted-foreground)]">בוחרים אחד משישה עיצובים, מוסיפים שם, תאריך והקדשה, ומדפיסים כריכה אישית לברכון — חזית וגב, בגודל A5 או A6. הכריכה וההקדשה כאן; את נוסח ברכת המזון מדפיסים בברכון מוכן, בנוסח שמקובל אצלכם.</p>

      <section className="ln-box mb-10" aria-labelledby="make">
        <h2 id="make" className="m-0 mb-3 text-2xl font-bold">🎨 מעצבים את הכריכה</h2>

        <p className="m-0 mb-2 font-bold">1. בוחרים עיצוב</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6" role="group" aria-label="עיצוב הכריכה">
          {BIRKON_DESIGNS.map(x => (
            <button key={x.id} type="button" aria-pressed={design === x.id} onClick={() => setDesign(x.id)} className={`rounded-xl border-2 p-1 text-center ${design === x.id ? 'border-[var(--border)] bg-[var(--yellow,#ffd23f)]' : 'border-[var(--border)] bg-white'}`}>
              <span className="block" style={{ aspectRatio: '148/210' }}><Cover {...props} d={x} sample name="" /></span>
              <span className="mt-1 block text-sm font-bold">{x.name}</span>
            </button>
          ))}
        </div>

        <p className="m-0 mt-5 mb-2 font-bold">2. כותבים את הפרטים</p>
        <GenderChips gender={gender} setGender={setGender} />
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block font-bold">שם החוגג/ת<input value={name} onChange={e => setName(e.target.value)} maxLength={30} className={inputCls} autoComplete="off" /></label>
          <label className="block font-bold">תאריך (לא חובה)<input value={date} onChange={e => setDate(e.target.value)} maxLength={30} placeholder="למשל: ט״ו בשבט תשפ״ז" className={inputCls} /></label>
        </div>
        <label className="mt-3 block font-bold">הקדשה בגב הכריכה (עד כ־200 תווים)
          <textarea value={dedication} onChange={e => setDedication(e.target.value)} maxLength={200} rows={3} className={inputCls} />
        </label>
        <div className="mt-2 flex flex-wrap gap-2" aria-label="הקדשות מוכנות להתחלה">
          {dedicationSamples(boy).map((s, i) => <Chip key={i} on={dedication === s} onClick={() => setDedication(s)}>דוגמה {i + 1}</Chip>)}
        </div>
        <label className="mt-3 block max-w-sm font-bold">חתימה (לא חובה)<input value={from} onChange={e => setFrom(e.target.value)} maxLength={40} placeholder="למשל: אמא, אבא ואחים" className={inputCls} /></label>
        <p className="m-0 mt-2 text-sm text-[var(--muted-foreground)]">הכל נשאר בדפדפן שלכם. שום דבר לא נשלח ולא נשמר.</p>

        <p className="m-0 mt-5 mb-2 font-bold">3. כך זה ייראה</p>
        <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
          <div><div style={{ aspectRatio: '148/210' }} className="overflow-hidden rounded-lg border border-[var(--border)]"><Cover {...props} sample /></div><p className="m-0 mt-1 text-center text-sm font-bold">חזית</p></div>
          <div><div style={{ aspectRatio: '148/210' }} className="overflow-hidden rounded-lg border border-[var(--border)]"><Cover {...props} back sample /></div><p className="m-0 mt-1 text-center text-sm font-bold">גב</p></div>
        </div>

        <p className="m-0 mt-5 mb-2 font-bold">4. בוחרים גודל</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="גודל">
          {SIZES.map(([k, label]) => <Chip key={k} on={size === k} onClick={() => setSize(k)}>{label}</Chip>)}
        </div>
        <button type="button" className="ln-btn mt-5" onClick={() => setPrint(true)}>🖨️ תצוגה והדפסה</button>
      </section>

      {print && <PrintPreview title={`כריכת ברכון${props.name ? ' — ' + props.name : ''}`} onClose={() => setPrint(false)}>
        <Sheet size={size} {...props} />
        <Sheet size={size} {...props} back />
      </PrintPreview>}

      <section className="mx-auto mb-10 max-w-3xl" aria-labelledby="how">
        <h2 id="how" className="mb-3 text-3xl">איך מכינים ברכון שלם?</h2>
        <ol className="m-0 grid list-none gap-3 p-0 text-lg leading-relaxed">
          <li className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><strong>מדפיסים את הכריכה.</strong> עדיף נייר כרטיס או נייר עבה. בחלון ההדפסה בוחרים גודל אמיתי (100%) ולא התאמה לדף.</li>
          <li className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><strong>משיגים ברכונים מוכנים או דפי ברכת המזון.</strong> נוסח ברכת המזון מודפס בברכון רגיל בנוסח שמקובל בבית הכנסת או במשפחה, עם ניקוד ובנוסח מדויק. הכלי כאן לא מדפיס אותו.</li>
          <li className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4"><strong>מחברים.</strong> מניחים את הכריכה על הברכון ומדביקים, מהדקים בסיכות או מביאים לבית דפוס להדבקה. בברכון קיים אפשר פשוט להדביק את הכריכה על הכריכה המקורית.</li>
        </ol>
        <p className="mt-4">אירוע בכותל? קראו את <Link to="/bar-mitzvah/kotel" className="font-bold underline">המדריך לבר מצווה בכותל</Link>. מחפשים מזכרות נוספות? יש <Link to="/bar-mitzvah/souvenir" className="font-bold underline">כרטיסי ברכה וקפסולת זמן</Link>.</p>
      </section>

      <SeoBody
        paragraphs={[
          'ברכון עם כריכה אישית הוא מזכרת פשוטה ויפה: האורחים משתמשים בו בסעודה ולוקחים אותו הביתה, והשם והתאריך של החוגג/ת מלווים אותם. הכלי כאן מכין את הכריכה — חזית עם הכותרת, השם והתאריך, וגב עם הקדשה אישית — ב־6 עיצובים מקוריים שאפשר לשנות בלחיצה.',
          'לבר מצווה אפשר לבחור את הכוכבים או הקשתות, לבת מצווה את הפרחים או הקשת, ואפשר פשוט לבחור את מה שמתאים לצבעי האירוע. אחרי שהדפסתם, כדאי להראות את הכריכה לבית הדפוס או לחבר שמכין את הברכונים כדי לוודא שהגודל מתאים לברכון שבחרתם.',
        ]}
        faq={FAQ}
        related={RELATED}
      />
      <SpokeNav current={PATH} />
    </div>
  )
}
