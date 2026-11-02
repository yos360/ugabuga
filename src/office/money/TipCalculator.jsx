// /tools/tip-calculator — how much tip to leave, and how much each diner pays when the check is split.
import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { parseAmount, formatShekel } from './moneyLogic'
import { TIP_PRESETS, computeTip } from './tipLogic'
import { copyText } from './copy'
import './money.css'

const FAQ = [
  { q: 'כמה טיפ נהוג להשאיר במסעדה בישראל?', a: 'בישראל נהוג להשאיר 10%–15% מהחשבון, ו־15% ומעלה כשהשירות היה מצוין. בבתי קפה ובמקומות עם שירות עצמי הטיפ קטן יותר או לא נהוג בכלל.' },
  { q: 'מחשבים טיפ מהחשבון כולל מע״מ?', a: 'כן. בישראל המחירים בתפריט כבר כוללים מע״מ, ולכן מחשבים את הטיפ מהסכום שמופיע בחשבון.' },
  { q: 'אפשר לשלם טיפ באשראי?', a: 'ברוב המסעדות אפשר להוסיף את הטיפ לתשלום באשראי. כדאי לשאול את המלצר. המחשבון נותן את הסכום הכולל שאפשר לבקש לחייב.' },
  { q: 'איך מתחלקים בחשבון בין כמה אנשים?', a: 'בוחרים כמה סועדים יש, והמחשבון מחלק את החשבון יחד עם הטיפ שווה בשווה. אפשר לסמן עיגול כלפי מעלה לשקל שלם, כדי שכל אחד ישים סכום נוח.' },
  { q: 'האם הטיפ כבר כלול בחשבון?', a: 'לפעמים. יש מקומות, בעיקר לקבוצות גדולות, שמוסיפים "דמי שירות" לחשבון. אם כתוב שהשירות כלול, אין צורך להוסיף טיפ נוסף.' },
]

function Row({ label, value, strong, onCopy, copied }) {
  return <div className={`mv-row${strong ? ' is-main' : ''}`}>
    <span className="mv-row-label">{label}</span>
    <span className="mv-row-value" dir="ltr"><bdi>{formatShekel(value)} ₪</bdi></span>
    <button type="button" className="mc-btn mv-copy" onClick={onCopy} aria-label={`העתקת ${label}`}>{copied ? '✓' : '📋'}</button>
  </div>
}

export default function TipCalculator() {
  const [amount, setAmount] = useState('240')
  const [pct, setPct] = useState(12)
  const [custom, setCustom] = useState('')
  const [people, setPeople] = useState(1)
  const [roundUp, setRoundUp] = useState(false)
  const [copied, setCopied] = useState('')

  const bill = parseAmount(amount)
  const r = bill === null ? null : computeTip(bill, pct, people, roundUp)
  const copy = async (v, what) => { if (await copyText(v.toFixed(2))) { setCopied(what); setTimeout(() => setCopied(c => c === what ? '' : c), 1500) } }
  const pickCustom = v => {
    setCustom(v)
    const n = parseAmount(v)
    if (n !== null && n >= 0 && n <= 100) setPct(n)
  }
  const cn = parseAmount(custom)
  const customBad = custom !== '' && (cn === null || cn < 0 || cn > 100)

  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מחשבון טיפים — כמה טיפ להשאיר וחלוקת חשבון במסעדה" description="מחשבון טיפ חינם: מקלידים את החשבון, בוחרים 10%, 12%, 15% או אחוז אחר, ומקבלים את הטיפ, הסכום הכולל וכמה משלם כל אחד כשמתחלקים. עם עיגול לשקל שלם." path="/tools/tip-calculator" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מחשבון טיפים' }]} />
    <h1 className="text-3xl sm:text-4xl text-center mb-3">מחשבון טיפים</h1>
    <p className="text-center mb-6">מקלידים את החשבון, בוחרים כמה טיפ וכמה אתם, ומקבלים כמה כל אחד משלם.</p>

    <section className="mc-card mv-card" aria-label="מחשבון טיפים">
      <label className="mc-amount">
        <span className="mc-label">סכום החשבון</span>
        <span className="mc-amount-box" dir="ltr">
          <span className="mc-sym" aria-hidden="true">₪</span>
          <input type="text" inputMode="decimal" autoComplete="off" value={amount} onChange={e => setAmount(e.target.value)} onFocus={e => e.target.select()} />
        </span>
        {bill === null && amount.trim() !== '' && <span className="mc-hint">הקלידו מספר, למשל 240 או 186.50</span>}
      </label>

      <fieldset className="mv-rate">
        <legend className="mc-label">כמה טיפ?</legend>
        <div className="mc-chips">
          {TIP_PRESETS.map(p => <button key={p} type="button" className="mc-chip" aria-pressed={pct === p && custom === ''} onClick={() => { setPct(p); setCustom('') }}>{p}%</button>)}
          <label className="mv-custom">אחר:
            <input type="text" inputMode="decimal" dir="ltr" value={custom} placeholder="%" onChange={e => pickCustom(e.target.value)} aria-invalid={customBad} aria-label="אחוז טיפ אחר" />
          </label>
        </div>
        {customBad && <p className="mc-hint">אחוז צריך להיות בין 0 ל־100.</p>}
      </fieldset>

      <fieldset className="mv-rate">
        <legend className="mc-label">כמה אתם?</legend>
        <div className="mc-chips">
          <button type="button" className="mc-chip" onClick={() => setPeople(p => Math.max(1, p - 1))} aria-label="סועד אחד פחות">−</button>
          <b className="px-3 text-xl" aria-live="polite">{people} {people === 1 ? 'סועד' : 'סועדים'}</b>
          <button type="button" className="mc-chip" onClick={() => setPeople(p => Math.min(100, p + 1))} aria-label="סועד אחד יותר">+</button>
          <label className="mv-custom"><input type="checkbox" checked={roundUp} onChange={e => setRoundUp(e.target.checked)} /> לעגל לשקל שלם</label>
        </div>
      </fieldset>

      <div className="mv-results" aria-live="polite">
        {!r ? <p className="mc-result-empty">הקלידו סכום כדי לראות את החישוב.</p> : <>
          <Row label={`טיפ (${r.pct}%)`} value={r.tip} onCopy={() => copy(r.tip, 'tip')} copied={copied === 'tip'} />
          <Row label="סה״כ לתשלום" value={r.total} strong={r.people === 1} onCopy={() => copy(r.total, 'total')} copied={copied === 'total'} />
          {r.people > 1 && <Row label="כל אחד משלם" value={r.share} strong onCopy={() => copy(r.share, 'share')} copied={copied === 'share'} />}
          <p className="mv-how">איך חישבנו: {formatShekel(r.bill)} ₪ ועוד {pct}% טיפ{r.people > 1 ? `, מחולק ל־${r.people}` : ''}{roundUp ? ', ומעוגל כלפי מעלה לשקל שלם' : ''}.</p>
        </>}
      </div>
    </section>

    <div className="mt-10 no-present"><h2 className="text-2xl mb-4">כמה טיפ להשאיר — המדריך הקצר</h2>
      <SeoBody paragraphs={[
        'בישראל הטיפ במסעדה הוא בדרך כלל 10% עד 15% מהחשבון. 12% הוא סכום מקובל לשירות טוב, ו־15% או יותר כשהשירות היה מעולה. המחשבון מחשב את הטיפ מהסכום שבחשבון, שכבר כולל מע״מ.',
        'כשיוצאים בקבוצה, החלק הקשה הוא החלוקה. בוחרים כמה סועדים אתם, והמחשבון מחלק את החשבון יחד עם הטיפ שווה בשווה. סימון "לעגל לשקל שלם" מעגל את החלק של כל אחד כלפי מעלה, וההפרש הקטן הולך לטיפ.',
        'אפשר להעתיק כל סכום בלחיצה, למשל כדי לשלוח בקבוצה כמה כל אחד צריך להעביר.',
      ]} faq={FAQ} related={[{ href: '/tools/percent-calculator', label: 'מחשבון אחוזים והנחות' }, { href: '/tools/vat', label: 'מחשבון מע״מ 18%' }, { href: '/tools/currency', label: 'המרת מטבע' }, { href: '/tools', label: 'כל הכלים' }]} />
    </div>
  </div>
}
