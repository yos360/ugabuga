import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

// Quadratic equation ax² + bx + c = 0, solved step by step with the formula — the way it's written in
// class. Exact fractions when the discriminant is a perfect square, √ form otherwise.
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a))
const round = n => Math.round(n * 1000) / 1000
const num = n => (Number.isInteger(n) ? String(n) : String(round(n)))
const LTR = ({ children }) => <span dir="ltr" className="inline-block font-mono">{children}</span>
function frac(p, q) { // p/q reduced, for integers
  if (!Number.isInteger(p) || !Number.isInteger(q)) return num(p / q)
  const g = gcd(p, q) || 1, s = q < 0 ? -1 : 1
  const P = (s * p) / g, Q = (s * q) / g
  return Q === 1 ? String(P) : `${P}/${Q}`
}
const term = (k, x, first) => { if (!k) return ''; const sign = k < 0 ? '− ' : first ? '' : '+ '; const v = Math.abs(k); return `${sign}${v === 1 && x ? '' : num(v)}${x} ` }

export function solve(a, b, c) {
  const D = b * b - 4 * a * c
  const steps = [`a = ${num(a)}, b = ${num(b)}, c = ${num(c)}`, `Δ = b² − 4ac = (${num(b)})² − 4·(${num(a)})·(${num(c)}) = ${num(D)}`]
  if (D < 0) return { D, roots: [], steps: [...steps, 'Δ < 0 — אין פתרונות ממשיים (לפרבולה אין נקודות חיתוך עם ציר x).'] }
  const s = Math.sqrt(D), exact = Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(s)
  const r1 = (-b + s) / (2 * a), r2 = (-b - s) / (2 * a)
  if (D === 0) return { D, roots: [r1], exactRoots: exact ? [frac(-b, 2 * a)] : null, steps: [...steps, `Δ = 0 — פתרון אחד: x = −b / 2a = ${exact ? frac(-b, 2 * a) : num(r1)}`] }
  const shown = exact ? [frac(-b + s, 2 * a), frac(-b - s, 2 * a)] : [num(r1), num(r2)]
  return { D, roots: [r1, r2], exactRoots: exact ? shown : null, steps: [...steps, `x₁,₂ = (−b ± √Δ) / 2a = (${num(-b)} ± ${Number.isInteger(s) ? s : `√${num(D)}`}) / ${num(2 * a)}`, `x₁ = ${shown[0]},  x₂ = ${shown[1]}`] }
}

export default function QuadraticSolver() {
  const [a, setA] = useState('1'), [b, setB] = useState('-5'), [c, setC] = useState('6')
  const A = Number(a), B = Number(b), C = Number(c)
  const valid = [a, b, c].every(v => v.trim() !== '' && Number.isFinite(Number(v))) && A !== 0
  const r = valid ? solve(A, B, C) : null
  const vx = valid ? -B / (2 * A) : 0, vy = valid ? A * vx * vx + B * vx + C : 0
  const field = (v, set, l) => <label className="flex items-center gap-1 text-xl font-bold"><input value={v} onChange={e => set(e.target.value.replace(/[^\d.\-]/g, ''))} inputMode="decimal" aria-label={`המקדם ${l}`} className="w-20 rounded-xl border-2 border-slate-300 px-2 py-2 text-center text-2xl" dir="ltr" />{l}</label>
  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <SEO title="מחשבון משוואה ריבועית — פתרון עם דרך, שלב אחרי שלב" description="מחשבון משוואה ריבועית בחינם: מכניסים a, b, c ומקבלים את הפתרונות עם הדרך המלאה — דיסקרימיננטה, נוסחת השורשים, קודקוד הפרבולה ופירוק לגורמים." path="/tools/quadratic-equation" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'משוואה ריבועית' }]} />
    <h1 className="text-center text-3xl font-black sm:text-5xl">📐 מחשבון משוואה ריבועית</h1>
    <p className="mx-auto mb-5 mt-2 max-w-xl text-center text-lg text-slate-600">מכניסים את המקדמים של <LTR>ax² + bx + c = 0</LTR> ומקבלים פתרון עם כל הדרך.</p>
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4" dir="ltr">
      {field(a, setA, 'x²')}<span className="text-2xl">+</span>{field(b, setB, 'x')}<span className="text-2xl">+</span>{field(c, setC, '')}<span className="text-2xl font-bold">= 0</span>
    </div>
    {!valid && <p role="alert" className="mt-3 text-center font-bold text-red-700">{A === 0 && a.trim() !== '' ? 'כש־a = 0 זו לא משוואה ריבועית אלא משוואה ממעלה ראשונה.' : 'מלאו מספרים בשלושת המקדמים.'}</p>}
    {r && <section className="mt-5 rounded-2xl border-[3px] border-violet-300 bg-violet-50/50 p-5">
      <p className="text-center text-xl"><LTR>{term(A, 'x²', true)}{term(B, 'x')}{term(C, '')}= 0</LTR></p>
      <h2 className="mt-3 text-2xl font-black">{r.roots.length === 0 ? 'אין פתרון ממשי' : r.roots.length === 1 ? 'פתרון אחד' : 'שני פתרונות'}</h2>
      {r.roots.length > 0 && <p className="mt-1 text-3xl font-black text-violet-800"><LTR>{(r.exactRoots || r.roots.map(num)).map((x, i) => `x${r.roots.length > 1 ? (i ? '₂' : '₁') : ''} = ${x}`).join('   ')}</LTR></p>}
      <h3 className="mt-4 text-xl font-bold">הדרך</h3>
      <ol className="mt-1 list-decimal space-y-1 pr-6 text-lg">{r.steps.map(s => <li key={s}><LTR>{s}</LTR></li>)}</ol>
      <h3 className="mt-4 text-xl font-bold">ועוד על הפרבולה</h3>
      <ul className="mt-1 list-disc space-y-1 pr-6 text-lg">
        <li>קודקוד: <LTR>({num(vx)}, {num(vy)})</LTR> — {A > 0 ? 'נקודת מינימום (הפרבולה פתוחה למעלה)' : 'נקודת מקסימום (הפרבולה פתוחה למטה)'}</li>
        <li>חיתוך עם ציר y: <LTR>(0, {num(C)})</LTR></li>
        {r.exactRoots && r.roots.length === 2 && Number.isInteger(r.roots[0]) && Number.isInteger(r.roots[1]) && <li>פירוק לגורמים: <LTR>{A === 1 ? '' : A === -1 ? '−' : num(A)}(x {r.roots[0] < 0 ? '+' : '−'} {num(Math.abs(r.roots[0]))})(x {r.roots[1] < 0 ? '+' : '−'} {num(Math.abs(r.roots[1]))}) = 0</LTR></li>}
      </ul>
    </section>}
    <div className="mt-10"><SeoBody paragraphs={[
      'משוואה ריבועית היא משוואה מהצורה ax² + bx + c = 0, כש־a שונה מאפס. פותרים אותה בנוסחת השורשים: x = (−b ± √Δ) / 2a, כאשר Δ = b² − 4ac נקראת הדיסקרימיננטה (או ״הדלתא״). הסימן שלה קובע כמה פתרונות יש: חיובית — שני פתרונות, אפס — פתרון אחד, שלילית — אין פתרון ממשי.',
      'המחשבון מראה את כל השלבים כמו שכותבים במחברת: מזהים את a, b ו־c, מחשבים את Δ, מציבים בנוסחה ומקבלים את x₁ ו־x₂. כשהתשובה יוצאת שבר או מספר שלם הוא מציג אותה בדיוק, ובנוסף מחשב את קודקוד הפרבולה ומפרק לגורמים כשאפשר. כדאי לנסות קודם לבד ולהשתמש במחשבון כדי לבדוק.',
    ]} faq={FAQ} related={[{ label: 'מחשבון שברים', href: '/tools/fraction-calculator' }, { label: 'מחשבון אחוזים', href: '/tools/percent-calculator' }, { label: 'מחשבון', href: '/calculator' }]} /></div>
  </div>
}

const FAQ = [
  { q: 'מה זו נוסחת השורשים?', a: 'x = (−b ± √(b² − 4ac)) / 2a. מציבים את a, b ו־c מהמשוואה ax² + bx + c = 0 ומקבלים עד שני פתרונות.' },
  { q: 'מה זה דלתא (דיסקרימיננטה)?', a: 'Δ = b² − 4ac. אם היא חיובית יש שני פתרונות, אם היא 0 יש פתרון אחד, ואם היא שלילית אין פתרון ממשי.' },
  { q: 'מה עושים כשאין b או אין c?', a: 'מכניסים 0 במקדם החסר. למשל x² − 9 = 0 זה a = 1, b = 0, c = −9, והפתרונות הם 3 ו־(−3).' },
  { q: 'איך מוצאים את קודקוד הפרבולה?', a: 'שיעור ה־x של הקודקוד הוא −b/2a. מציבים אותו בפונקציה ומקבלים את שיעור ה־y.' },
]
