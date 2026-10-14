import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { VAT_RATE, parseNumber, formatNumber as f, percentOf, whatPercent, percentChange, afterDiscount, beforeDiscount, addVat, removeVat } from '../../utils/percent'

const FAQ = [
  { q: 'איך מחשבים אחוז מתוך מספר?', a: 'מחלקים את האחוז ב־100 ומכפילים במספר. לדוגמה, 20% מתוך 150 הם 30.' },
  { q: 'למה אי אפשר לחשב שינוי באחוזים מאפס?', a: 'הנוסחה מחלקת בערך ההתחלתי. חלוקה באפס אינה מוגדרת, ולכן המחשבון מציג הסבר במקום תוצאה מטעה.' },
  { q: 'איך מוצאים מחיר לפני הנחה?', a: 'מחלקים את המחיר ששולם ב־1 פחות שיעור ההנחה. אחרי הנחה של 100% אי אפשר לשחזר את המחיר המקורי.' },
  { q: 'איך מזינים פסיקים ומספרים שליליים?', a: 'אפשר להזין 12.5 או 12,5, וגם 1,234.50. פסיק עם שלוש ספרות אחריו, כמו 1,234, נחשב מפריד אלפים; לעשרוני השתמשו בנקודה. בשינוי מערך שלילי משתמשים בערך המוחלט של הבסיס.' },
]
const CALCULATORS = [
  { id: 'of', title: 'כמה זה X אחוז מ־Y?', labels: ['אחוז (X)', 'מספר (Y)'], initial: ['20', '150'], calculate: percentOf, explain: (x, y, r) => `${f(x)} ÷ 100 × ${f(y)} = ${f(r)}` },
  { id: 'ratio', title: 'X הוא כמה אחוזים מ־Y?', labels: ['חלק (X)', 'שלם (Y)'], initial: ['30', '150'], calculate: whatPercent, explain: (x, y, r) => `${f(x)} ÷ ${f(y)} × 100 = ${f(r)}%`, error: 'אי אפשר לחלק בשלם ששווה לאפס.' },
  { id: 'change', title: 'שינוי באחוזים מ־A ל־B', labels: ['ערך התחלתי (A)', 'ערך סופי (B)'], initial: ['100', '120'], calculate: percentChange, explain: (x, y, r) => `(${f(y)} − ${f(x)}) ÷ |${f(x)}| × 100 = ${f(r)}%`, error: 'שינוי באחוזים מערך התחלתי אפס אינו מוגדר.', note: 'תוצאה חיובית מציינת עלייה ושלילית ירידה. הבסיס הוא הערך המוחלט של A.' },
  { id: 'discount', title: 'מחשבון הנחה — מחיר אחרי הנחה', labels: ['מחיר מקורי', 'הנחה באחוזים'], initial: ['200', '25'], calculate: afterDiscount, explain: (x, y, r) => `${f(x)} × (1 − ${f(y)} ÷ 100) = ${f(r)}`, extra: (x, _y, r) => `חסכתם ${f(x - r)}`, error: 'המחיר צריך להיות אפס ומעלה, וההנחה בין 0% ל־100%.' },
  { id: 'before', title: 'מחיר לפני הנחה', labels: ['מחיר אחרי הנחה', 'הנחה באחוזים'], initial: ['150', '25'], calculate: beforeDiscount, explain: (x, y, r) => `${f(x)} ÷ (1 − ${f(y)} ÷ 100) = ${f(r)}`, error: 'המחיר צריך להיות אפס ומעלה, וההנחה בין 0% לפחות מ־100%.' },
  { id: 'add-vat', title: `הוספת ${VAT_RATE}% מע״מ`, labels: ['מחיר ללא מע״מ'], initial: ['100'], calculate: addVat, explain: (x, _y, r) => `${f(x)} × (1 + ${VAT_RATE} ÷ 100) = ${f(r)}` },
  { id: 'remove-vat', title: `הסרת ${VAT_RATE}% מע״מ`, labels: ['מחיר כולל מע״מ'], initial: ['118'], calculate: removeVat, explain: (x, _y, r) => `${f(x)} ÷ (1 + ${VAT_RATE} ÷ 100) = ${f(r)}` },
]

function Calculator({ config: c }) {
  const [values, setValues] = useState(c.initial)
  const nums = values.map(parseNumber)
  const valid = nums.every(n => n !== null)
  const result = valid ? c.calculate(...nums) : null
  return <section className="min-w-0 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-5" aria-labelledby={`${c.id}-title`}>
    <h2 id={`${c.id}-title`} className="text-2xl mb-4">{c.title}</h2>
    <div className="grid gap-3 sm:grid-cols-2">{c.labels.map((label, i) => <label key={label} className="block font-bold">{label}<input type="text" inputMode="decimal" dir="ltr" value={values[i]} onChange={e => setValues(old => old.map((v, j) => j === i ? e.target.value : v))} className="mt-1 w-full min-w-0 rounded-xl border-2 border-[var(--border)] bg-white text-[#182139] px-3 py-3" /></label>)}</div>
    <div aria-live="polite" className="mt-4 rounded-xl bg-[var(--postit)] p-3">
      {result === null ? <p>{!valid ? 'הזינו מספר תקין בכל שדה.' : c.error || 'המספר גדול מדי לחישוב. נסו ערך קטן יותר.'}</p> : <><p className="font-bold text-2xl">תוצאה: <bdi>{f(result)}{['ratio', 'change'].includes(c.id) ? '%' : ''}</bdi></p><p dir="ltr" className="mt-2 text-center break-words">{c.explain(nums[0], nums[1], result)}</p>{c.extra && <p className="mt-2 font-bold">{c.extra(nums[0], nums[1], result)}</p>}</>}
    </div>
    {c.note && <p className="mt-2 text-sm">{c.note}</p>}
  </section>
}

export default function PercentCalculator() {
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="מחשבון אחוזים — כמה זה X אחוז מ-Y, הנחה ושינוי באחוזים" description="חישוב אחוזים עם דרך פתרון: אחוז מתוך מספר, שינוי באחוזים, מחשבון הנחה, מחיר לפני הנחה והוספה או הסרה של מע״מ. חינם ופשוט גם לתלמידים." path="/tools/percent-calculator" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מחשבון אחוזים' }]} />
    <h1 className="text-3xl sm:text-4xl text-center mb-3">מחשבון אחוזים — הנחה ושינוי באחוזים</h1>
    <p className="text-center mb-6">בוחרים חישוב, מזינים מספרים ורואים גם את הדרך. התוצאות מוצגות עד שתי ספרות אחרי הנקודה.</p>
    <div className="grid gap-5 md:grid-cols-2">{CALCULATORS.map(c => <Calculator key={c.id} config={c} />)}</div>
    <div className="mt-10 no-present"><h2 className="text-2xl mb-4">איך מחשבים אחוזים? לכיתות ה׳–ז׳</h2>
      <SeoBody paragraphs={[
        'אחוז הוא חלק אחד מתוך מאה. לכן 50% הם חצי ו־25% הם רבע. דוגמה ראשונה: בכיתה יש 30 תלמידים, ו־20% מהם בחוג ציור. מחשבים 20 ÷ 100 × 30 ומקבלים 6 תלמידים.',
        'דוגמה שנייה: משחק שעולה 80 שקלים נמכר בהנחה של 25%. רבע מ־80 הוא 20, ולכן המחיר החדש הוא 60 שקלים. כדי לחזור למחיר המקורי מחלקים 60 ב־0.75; לא מוסיפים 25% למחיר המוזל.',
        'דוגמה שלישית: מספר הספרים עלה מ־40 ל־50. התוספת היא 10 ספרים, ומחלקים אותה במספר המקורי: 10 ÷ 40 × 100 = 25%. חשוב לבחור את הבסיס הנכון לפני שמחשבים.',
      ]} faq={FAQ} related={[{ href: '/math/grade-6/percent', label: 'תרגול אחוזים לכיתה ו׳' }, { href: '/math/grade-7/percent', label: 'אחוזים לכיתה ז׳' }, { href: '/math', label: 'כל תרגולי החשבון' }]} />
    </div>
  </div>
}
