import { useEffect, useRef, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { planSpin } from '../../utils/wheel'

// גלגל מזל: a real spinning wheel. Slices are the lines the user typed; the pointer is at the top.
const SAMPLE = ['נועה', 'איתי', 'מאיה', 'יונתן', 'תמר', 'דניאל']
const COLORS = ['#ff6f7b', '#ffd23f', '#23c89f', '#28a4ef', '#a775ed', '#ff9f43', '#f78fb3', '#7bd389']
const SPIN_MS = 4200

const FAQ = [
  { q: 'איך עובד גלגל המזל?', a: 'כותבים בתיבה את האפשרויות — שורה לכל שם, פרס או משימה — והן מופיעות על הגלגל. לוחצים "סובבו את הגלגל", והגלגל נעצר על אחת האפשרויות באקראי. לכל אפשרות יש בדיוק אותו סיכוי.' },
  { q: 'אפשר להגריל בלי שאותו שם ייצא פעמיים?', a: 'כן. מסמנים "בלי חזרות", ומי שכבר יצא יורד מהגלגל בסיבוב הבא. כשכולם הוגרלו, לוחצים "מתחילים מחדש" וכל השמות חוזרים.' },
  { q: 'למה משתמשים בגלגל מזל בכיתה?', a: 'לבחירת תלמיד שיענה, לקביעת סדר תורות, לחלוקת תפקידים או להגרלת פרס קטן בסוף השבוע. הגלגל מסתובב מול כולם על הלוח החכם, כך שאף אחד לא חושד שהבחירה לא הוגנת.' },
  { q: 'הרשימה נשמרת?', a: 'לא — הכול קורה בדפדפן שלכם ושום שם לא נשלח לשום מקום. אם מרעננים את הדף, חוזרת רשימת הדוגמה.' },
]

function polar(angle, r) {
  const a = (angle - 90) * Math.PI / 180 // 0° = top, clockwise
  return [r * Math.cos(a), r * Math.sin(a)]
}

function Wheel({ items, rotation, spinning }) {
  const n = items.length
  const size = 360 / Math.max(n, 1)
  const fontSize = n > 16 ? 6 : n > 10 ? 7.5 : 9
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <svg viewBox="-110 -110 220 220" className="h-full w-full" role="img" aria-label={`גלגל מזל עם ${n} אפשרויות`}>
        <g style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.7, 0.12, 1)` : 'none' }}>
          {n === 1
            ? <circle r="100" fill={COLORS[0]} stroke="#1d2233" strokeWidth="2" />
            : items.map((label, i) => {
              const [x1, y1] = polar(i * size, 100), [x2, y2] = polar((i + 1) * size, 100)
              return <path key={i} d={`M0 0L${x1} ${y1}A100 100 0 ${size > 180 ? 1 : 0} 1 ${x2} ${y2}Z`} fill={COLORS[i % COLORS.length]} stroke="#1d2233" strokeWidth="1.5" />
            })}
          {items.map((label, i) => {
            const mid = (i + 0.5) * size
            const text = label.length > 12 ? label.slice(0, 11) + '…' : label
            return <text key={i} transform={`rotate(${mid - 90}) translate(58 0)${mid > 180 ? ' rotate(180)' : ''}`} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fontWeight="800" fill="#1d2233" style={{ fontFamily: 'inherit' }}>{text}</text>
          })}
          <circle r="14" fill="#fff" stroke="#1d2233" strokeWidth="3" />
        </g>
        <path d="M-9 -112L9 -112L0 -92Z" fill="#1d2233" />
      </svg>
    </div>
  )
}

export default function RandomPicker() {
  const [text, setText] = useState(SAMPLE.join('\n'))
  const [noRepeat, setNoRepeat] = useState(false)
  const [picked, setPicked] = useState([])
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [spinList, setSpinList] = useState(null) // the slices the wheel shows during / right after a spin
  const [winner, setWinner] = useState(null)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const items = text.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 40)
  const available = noRepeat ? items.filter(x => !picked.includes(x)) : items
  const shown = spinList || available

  const edit = (value) => { setText(value); setSpinList(null); setWinner(null) }
  const spin = () => {
    if (spinning || available.length === 0) return
    const list = available
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const plan = planSpin(list.length, rotation)
    setSpinList(list); setWinner(null); setSpinning(true); setRotation(plan.rotation)
    timer.current = setTimeout(() => {
      setSpinning(false)
      setWinner(list[plan.index])
      setPicked(p => [...p, list[plan.index]])
    }, reduce ? 300 : SPIN_MS)
  }
  const restart = () => { setPicked([]); setWinner(null); setSpinList(null) }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in">
      <SEO title="גלגל מזל אונליין — גלגל שמות להגרלה בחינם" description="גלגל מזל אונליין בחינם: כותבים שמות, פרסים או משימות, מסובבים את הגלגל ומקבלים תוצאה אקראית והוגנת. עם אפשרות בלי חזרות — לכיתה, למסיבה ולהגרלות." path="/tools/random-picker" structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'גלגל מזל' }]} />
      <h1 className="text-4xl text-center mb-3">🎡 גלגל מזל — גלגל שמות להגרלה</h1>
      <p className="mx-auto mb-6 max-w-xl text-center text-lg leading-relaxed text-[var(--muted-foreground)]">גלגל מזל אונליין: כותבים את האפשרויות, מסובבים, והגלגל בוחר באקראי — מי עונה, מי מתחיל, איזה פרס או איזו משימה. בחינם ובלי הרשמה.</p>

      <div className="grid items-start gap-6 md:grid-cols-[1fr_260px]">
        <div>
          <Wheel items={shown} rotation={rotation} spinning={spinning} />
          <div aria-live="polite" className="min-h-[72px]">
            {winner && !spinning && (
              <div className="wobbly mx-auto mt-4 max-w-md border-[3px] border-[var(--border)] bg-[var(--postit)] p-4 text-center sketch-shadow-rich buga-pop">
                <p className="font-display text-3xl font-bold">🎉 {winner}!</p>
              </div>
            )}
          </div>
          <button type="button" onClick={spin} disabled={spinning || available.length === 0}
            className="wobbly-md sketch-press mt-2 w-full min-h-[56px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold cursor-pointer disabled:opacity-50">
            {spinning ? '🎡 מסתובב...' : available.length === 0 ? (items.length ? 'כולם הוגרלו! 🎉' : 'כתבו אפשרויות בתיבה') : '🎡 סובבו את הגלגל'}
          </button>
        </div>

        <div>
          <label htmlFor="wheel-items" className="mb-1 block font-bold">האפשרויות על הגלגל (שורה לכל אחת)</label>
          <textarea id="wheel-items" value={text} onChange={e => edit(e.target.value)} rows={8} disabled={spinning}
            className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-3 py-2 text-lg leading-relaxed" placeholder={'נועה\nאיתי\nמאיה'} />
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{items.length} אפשרויות{items.length >= 40 ? ' (עד 40)' : ''}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => edit('')} disabled={spinning} className="wobbly-sm sketch-press min-h-[44px] border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1 font-bold">🧹 ניקוי</button>
            <button type="button" onClick={() => edit(SAMPLE.join('\n'))} disabled={spinning} className="wobbly-sm sketch-press min-h-[44px] border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1 font-bold">↩ דוגמה</button>
          </div>
          <label className="mt-4 flex items-center gap-2 font-hand text-lg cursor-pointer">
            <input type="checkbox" checked={noRepeat} onChange={e => { setNoRepeat(e.target.checked); setSpinList(null) }} disabled={spinning} className="w-5 h-5" />
            🔄 בלי חזרות (מי שיצא יורד מהגלגל)
          </label>
          {picked.length > 0 && (
            <div className="wobbly mt-4 border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-3">
              <h2 className="font-display text-lg font-bold mb-1">הגרלות אחרונות</h2>
              <ol className="list-decimal pr-5">{picked.map((p, i) => <li key={i} className="font-hand text-base">{p}</li>)}</ol>
              <button type="button" onClick={restart} disabled={spinning} className="mt-2 min-h-[40px] font-bold underline">🔄 מתחילים מחדש</button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <SeoBody
          paragraphs={[
            'גלגל מזל הוא הדרך הכי הוגנת והכי כיפית להחליט: כל האפשרויות מופיעות על הגלגל, כולם רואים אותו מסתובב, והתוצאה אקראית לגמרי. בכיתה הוא עוזר לבחור מי עונה או מי מקריא; במסיבת יום הולדת הוא מגריל פרסים, משימות ומי משחק ראשון; ובבית הוא מכריע מי שוטף כלים הערב.',
            'רעיון למסיבה: כותבים על הגלגל משימות מצחיקות ("לרקוד 10 שניות", "לחקות חיה", "לספר בדיחה"), וכל ילד מסובב בתורו. בכיתה כדאי לסמן "בלי חזרות" — כך כל תלמיד יוצא פעם אחת עד שכולם השתתפו.',
          ]}
          faq={FAQ}
          related={[{ label: 'מחלק קבוצות', href: '/tools/team-generator' }, { label: 'מספר אקראי', href: '/tools/random-number' }, { label: 'אמת או חובה', href: '/tools/truth-or-buga' }, { label: 'כל הכלים', href: '/tools' }]}
        />
      </div>
    </div>
  )
}
