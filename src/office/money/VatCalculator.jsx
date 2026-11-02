// /tools/vat — Israeli VAT calculator (18% since 1.1.2025). One field, two directions, exact to the agora.
import { useEffect, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { VAT_RATE, VAT_PRESETS, parseAmount, addVat, extractVat, vatFactor, formatShekel, round } from './moneyLogic'
import { copyText } from './copy'
import './money.css'

const PREFS_KEY = 'ugabuga-vat-prefs'
function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null')
    // Only the direction is remembered; the rate always opens at the current legal 18% so an old 0%/17% never sticks silently.
    if (p && (p.mode === 'add' || p.mode === 'extract')) return { mode: p.mode, rate: VAT_RATE }
  } catch { /* blocked storage */ }
  return { mode: 'add', rate: VAT_RATE }
}

const FAQ = [
  { q: 'מה שיעור המע״מ בישראל היום?', a: 'מ־1 בינואר 2025 שיעור המע״מ בישראל הוא 18%. עד סוף 2024 הוא היה 17%. המחשבון מוגדר ל־18%, ואפשר לבחור שיעור אחר אם צריך לחשב חשבונית ישנה.' },
  { q: 'איך מוסיפים מע״מ למחיר?', a: 'מכפילים את המחיר שלפני מע״מ ב־1.18. לדוגמה, 250 ₪ לפני מע״מ הם 295 ₪ כולל מע״מ, ומתוכם 45 ₪ מע״מ.' },
  { q: 'איך מורידים מע״מ ממחיר שכבר כולל מע״מ?', a: 'מחלקים ב־1.18. טעות נפוצה היא להוריד 18% מהמחיר הכולל: 118 פחות 18% הם 96.76, אבל המחיר האמיתי לפני מע״מ הוא 100. המע״מ הוא 18% מהמחיר שלפני מע״מ, ולא מהמחיר הסופי.' },
  { q: 'כמה מע״מ יש בתוך מחיר כולל?', a: 'בשיעור 18%, המע״מ הוא 18/118 מהמחיר הכולל, כלומר כ־15.25% ממנו. ב־1,180 ₪ כולל מע״מ יש בדיוק 180 ₪ מע״מ.' },
  { q: 'למה לפעמים יש הפרש של אגורה?', a: 'המע״מ מעוגל לאגורה שלמה. המחשבון מעגל את המחיר לפני מע״מ לאגורות ומחשב את המע״מ כהפרש, כך ששני החלקים תמיד מסתכמים בדיוק במחיר הכולל. בחשבוניות של עסקים שונים העיגול יכול להיעשות מעט אחרת.' },
  { q: 'האם באילת משלמים מע״מ?', a: 'אילת היא אזור סחר חופשי, ועסקאות רבות בתוכה פטורות ממע״מ, אבל לא כולן. לכן אפשר לבחור במחשבון 0% כשהעסקה פטורה. לשאלות על מקרה מסוים כדאי לפנות לרואה חשבון או לרשות המסים.' },
]

function Row({ label, value, strong, onCopy, copied }) {
  return <div className={`mv-row${strong ? ' is-main' : ''}`}>
    <span className="mv-row-label">{label}</span>
    <span className="mv-row-value" dir="ltr"><bdi>{formatShekel(value)} ₪</bdi></span>
    <button type="button" className="mc-btn mv-copy" onClick={onCopy} aria-label={`העתקת ${label}`}>{copied ? '✓' : '📋'}</button>
  </div>
}

export default function VatCalculator() {
  const [prefs] = useState(loadPrefs)
  const [mode, setMode] = useState(prefs.mode)
  const [rate, setRate] = useState(prefs.rate)
  const [custom, setCustom] = useState(VAT_PRESETS.some(p => p.rate === prefs.rate) ? '' : String(prefs.rate))
  const [amount, setAmount] = useState('100')
  const [copied, setCopied] = useState('')
  useEffect(() => { try { localStorage.setItem(PREFS_KEY, JSON.stringify({ mode })) } catch { /* private mode */ } }, [mode])

  const n = parseAmount(amount)
  const main = n === null ? null : mode === 'add' ? addVat(n, rate) : extractVat(n, rate)
  const other = n === null ? null : mode === 'add' ? extractVat(n, rate) : addVat(n, rate)
  const factor = vatFactor(rate)
  const fx = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 4 }).format(factor)
  const copy = async (v, what) => { if (await copyText(String(round(v, 2).toFixed(2)))) { setCopied(what); setTimeout(() => setCopied(c => c === what ? '' : c), 1500) } }
  const pickCustom = v => {
    setCustom(v)
    const r = parseAmount(v)
    if (r !== null && r >= 0 && r <= 100) setRate(r)
  }
  const cr = parseAmount(custom)
  const customBad = custom !== '' && (cr === null || cr < 0 || cr > 100)

  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מחשבון מע״מ 18% — הוספת מע״מ והורדת מע״מ מהמחיר" description="מחשבון מעמ 18 חינם: ממחיר לפני מע״מ למחיר כולל מע״מ ולהפך, עם סכום המע״מ מדויק לאגורה, נוסחה ברורה וכפתורי העתקה. כולל אפשרות 0% לאילת." path="/tools/vat" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מחשבון מע״מ' }]} />
    <h1 className="text-3xl sm:text-4xl text-center mb-3">מחשבון מע״מ {VAT_RATE}%</h1>
    <p className="text-center mb-6">מקלידים מחיר, בוחרים אם הוא לפני מע״מ או כבר כולל, ומקבלים הכול מיד, מדויק לאגורה.</p>

    <section className="mc-card mv-card" aria-label="מחשבון מע״מ">
      <div className="mv-toggle" role="radiogroup" aria-label="מה הסכום שהקלדתם?">
        <button type="button" role="radio" aria-checked={mode === 'add'} onClick={() => setMode('add')}><b>➕ להוסיף מע״מ</b><small>יש לי מחיר לפני מע״מ</small></button>
        <button type="button" role="radio" aria-checked={mode === 'extract'} onClick={() => setMode('extract')}><b>➖ להוריד מע״מ</b><small>יש לי מחיר כולל מע״מ</small></button>
      </div>

      <label className="mc-amount">
        <span className="mc-label">{mode === 'add' ? 'מחיר לפני מע״מ' : 'מחיר כולל מע״מ'}</span>
        <span className="mc-amount-box" dir="ltr">
          <span className="mc-sym" aria-hidden="true">₪</span>
          <input type="text" inputMode="decimal" autoComplete="off" value={amount} onChange={e => setAmount(e.target.value)} onFocus={e => e.target.select()} />
        </span>
        {n === null && amount.trim() !== '' && <span className="mc-hint">הקלידו מספר, למשל 1250 או 99.90</span>}
      </label>

      <div className="mv-results" aria-live="polite">
        {!main ? <p className="mc-result-empty">{n === null ? 'הקלידו סכום כדי לראות את החישוב.' : 'הסכום גדול מדי לחישוב.'}</p> : <>
          <Row label="לפני מע״מ" value={main.net} strong={mode === 'extract'} onCopy={() => copy(main.net, 'net')} copied={copied === 'net'} />
          <Row label={`מע״מ (${rate}%)`} value={main.vat} onCopy={() => copy(main.vat, 'vat')} copied={copied === 'vat'} />
          <Row label="כולל מע״מ" value={main.gross} strong={mode === 'add'} onCopy={() => copy(main.gross, 'gross')} copied={copied === 'gross'} />
          <p className="mv-formula" dir="ltr"><bdi>{mode === 'add' ? `${formatShekel(main.net)} × ${fx} = ${formatShekel(main.gross)}` : `${formatShekel(main.gross)} ÷ ${fx} = ${formatShekel(main.net)}`}</bdi></p>
          <p className="mv-how">{mode === 'add' ? `איך חישבנו: מחיר לפני מע״מ כפול ${fx}. המע״מ הוא ${rate}% מהמחיר שלפני מע״מ.` : `איך חישבנו: מחיר כולל מע״מ חלקי ${fx}. לא מורידים ${rate}% מהמחיר הכולל, כי המע״מ מחושב מהמחיר שלפני מע״מ.`}</p>
        </>}
      </div>

      {other && rate > 0 && <button type="button" className="mv-other" onClick={() => setMode(m => m === 'add' ? 'extract' : 'add')}>
        {mode === 'add'
          ? <>ואם <bdi dir="ltr">{formatShekel(other.gross)} ₪</bdi> כבר כולל מע״מ? לפני מע״מ: <b><bdi dir="ltr">{formatShekel(other.net)} ₪</bdi></b> ←</>
          : <>ואם <bdi dir="ltr">{formatShekel(other.net)} ₪</bdi> הוא לפני מע״מ? כולל מע״מ: <b><bdi dir="ltr">{formatShekel(other.gross)} ₪</bdi></b> ←</>}
      </button>}

      <fieldset className="mv-rate">
        <legend className="mc-label">שיעור מע״מ</legend>
        <div className="mc-chips">
          {VAT_PRESETS.map(p => <button key={p.rate} type="button" className="mc-chip" aria-pressed={rate === p.rate && custom === ''} onClick={() => { setRate(p.rate); setCustom('') }} title={p.hint}>
            {p.label} <small>{p.hint}</small>
          </button>)}
          <label className="mv-custom">אחר:
            <input type="text" inputMode="decimal" dir="ltr" value={custom} placeholder="%" onChange={e => pickCustom(e.target.value)} aria-invalid={customBad} aria-label="שיעור מע״מ אחר באחוזים" />
          </label>
        </div>
        {customBad && <p className="mc-hint">שיעור צריך להיות בין 0 ל־100.</p>}
      </fieldset>
    </section>

    <aside className="mc-note">המחשבון מיועד לחישוב מהיר ואינו ייעוץ מס. בחשבוניות רשמיות קובעים הכללים של רשות המסים.</aside>

    <div className="mt-10 no-present"><h2 className="text-2xl mb-4">איך מחשבים מע״מ — בלי טעויות</h2>
      <SeoBody paragraphs={[
        'מע״מ הוא מס שמתווסף למחיר של רוב המוצרים והשירותים בישראל. מאז ינואר 2025 השיעור הוא 18%. כשעסק כותב "המחיר לא כולל מע״מ", צריך להכפיל ב־1.18 כדי לדעת כמה תשלמו בפועל. מחיר של 1,000 ₪ לפני מע״מ הופך ל־1,180 ₪.',
        'הכיוון ההפוך מבלבל יותר. אם שילמתם 590 ₪ כולל מע״מ ורוצים לדעת מה המחיר הנקי, מחלקים ב־1.18 ומקבלים 500 ₪, והמע״מ הוא 90 ₪. אם פשוט מורידים 18% מ־590 מקבלים 483.80, וזו טעות של יותר מ־16 שקלים.',
        'המחשבון הזה, שאפשר לחפש גם כ"מחשבון מעמ", מראה את שלושת המספרים יחד: לפני מע״מ, סכום המע״מ ומחיר כולל. כל מספר אפשר להעתיק בלחיצה ולהדביק בחשבונית, בגיליון או בהודעה.',
      ]} faq={FAQ} related={[{ href: '/tools/percent-calculator', label: 'מחשבון אחוזים והנחות' }, { href: '/tools/currency', label: 'המרת מטבע' }, { href: '/tools', label: 'כל הכלים' }]} />
    </div>
  </div>
}
