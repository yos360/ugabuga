import { useState } from 'react'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import DiceFamilyLinks from './DiceFamilyLinks'

const SIDES = [4, 6, 8, 10, 12, 20, 100]
const rnd = n => 1 + Math.floor(Math.random() * n)

// Parses notation like "2d6+3", "d20", "4d8 - 1", "1d6+1d4+2". Returns null if invalid.
export function parseNotation(text) {
  const src = text.replace(/\s+/g, '').toLowerCase().replace(/ד/g, 'd')
  if (!src || !/^[+-]?(\d*d\d+|\d+)([+-](\d*d\d+|\d+))*$/.test(src)) return null
  const terms = src.match(/[+-]?(\d*d\d+|\d+)/g)
  const out = []
  for (const t of terms) {
    const sign = t[0] === '-' ? -1 : 1
    const body = t.replace(/^[+-]/, '')
    if (body.includes('d')) {
      const [c, s] = body.split('d')
      const count = c === '' ? 1 : Number(c), sides = Number(s)
      if (count < 1 || count > 100 || sides < 2 || sides > 1000) return null
      out.push({ sign, count, sides })
    } else out.push({ sign, flat: Number(body) })
  }
  return out
}

function rollNotation(terms) {
  let total = 0
  const parts = terms.map(t => {
    if (t.flat !== undefined) { total += t.sign * t.flat; return `${t.sign < 0 ? '−' : '+'}${t.flat}` }
    const rolls = Array.from({ length: t.count }, () => rnd(t.sides))
    const sum = rolls.reduce((a, b) => a + b, 0)
    total += t.sign * sum
    return `${t.sign < 0 ? '−' : '+'}${t.count}d${t.sides} [${rolls.join(', ')}]`
  })
  return { total, detail: parts.join(' ').replace(/^\+/, '') }
}

const FAQ = [
  { q: 'מה המשמעות של 2d6+3?', a: 'מטילים שתי קוביות של 6 פאות, מחברים את התוצאות ומוסיפים 3. האות d מסמנת קוביה, המספר לפניה הוא כמות הקוביות והמספר אחריה הוא מספר הפאות.' },
  { q: 'מה זה הטלה עם יתרון (Advantage) או חיסרון (Disadvantage)?', a: 'מטילים שתי קוביות d20. ביתרון לוקחים את התוצאה הגבוהה, בחיסרון — את הנמוכה.' },
  { q: 'איך מגרילים תכונות לדמות?', a: 'השיטה הנפוצה: מטילים 4d6, מורידים את הקוביה הנמוכה ומחברים את שלוש הגבוהות — וחוזרים על זה שש פעמים, פעם לכל תכונה. הכפתור "הגרלת תכונות" עושה בדיוק את זה.' },
]

export default function DndDice() {
  const [log, setLog] = useState([])
  const [notation, setNotation] = useState('2d6+3')
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const push = entry => setLog(l => [entry, ...l].slice(0, 12))

  const quick = s => { const r = rnd(s); push({ title: `d${s}`, total: r, detail: s === 20 ? (r === 20 ? 'קריטי! 20 טבעי 🎉' : r === 1 ? '1 טבעי — כישלון חרוץ 💀' : '') : '' }) }
  const d20Mode = adv => {
    const a = rnd(20), b = rnd(20), r = adv ? Math.max(a, b) : Math.min(a, b)
    push({ title: adv ? 'd20 ביתרון' : 'd20 בחיסרון', total: r, detail: `[${a}, ${b}]${r === 20 ? ' · קריטי! 🎉' : r === 1 ? ' · 1 טבעי 💀' : ''}` })
  }
  const custom = () => {
    const t = parseNotation(notation)
    if (!t) return setError('כתבו הטלה בפורמט כמו 2d6+3, d20 או 1d8+1d4-1')
    setError('')
    const { total, detail } = rollNotation(t)
    push({ title: notation.replace(/\s+/g, ''), total, detail })
  }
  const rollStats = () => {
    const sets = Array.from({ length: 6 }, () => {
      const r = [rnd(6), rnd(6), rnd(6), rnd(6)]
      const sorted = [...r].sort((a, b) => a - b)
      return { rolls: r, dropped: sorted[0], value: sorted[1] + sorted[2] + sorted[3] }
    })
    setStats(sets)
  }
  const btn = 'wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] px-3 py-3 font-display text-lg font-bold'

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 buga-fade-in">
      <SEO title="קוביות D&D אונליין — d20, יתרון, 2d6+3 והגרלת תכונות" description="קוביות למשחקי תפקידים ו-D&D: d4 עד d100, הטלה ביתרון וחיסרון, כתיבת הטלה חופשית כמו 2d6+3, זיהוי קריטי והגרלת תכונות לדמות (4d6 בלי הנמוכה). חינם." path="/tools/dice/dnd" structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קוביה', href: '/tools/dice' }, { label: 'קוביות D&D' }]} />
      <h1 className="text-4xl text-center mb-2">🐉 קוביות D&D ומשחקי תפקידים</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">כל הקוביות של השולחן — בלחיצה אחת, בטלפון או במחשב</p>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4">{SIDES.map(s => <button key={s} className={btn} onClick={() => quick(s)}>d{s}</button>)}</div>
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button className={btn + ' bg-green-50'} onClick={() => d20Mode(true)}>⬆️ d20 ביתרון</button>
        <button className={btn + ' bg-red-50'} onClick={() => d20Mode(false)}>⬇️ d20 בחיסרון</button>
      </div>

      <div className="flex gap-2 mb-2">
        <input dir="ltr" aria-label="הטלה חופשית" value={notation} onChange={e => setNotation(e.target.value)} onKeyDown={e => e.key === 'Enter' && custom()} className="flex-1 border-2 border-[var(--border)] bg-white px-3 py-2 text-lg wobbly-sm" placeholder="2d6+3" />
        <button onClick={custom} className="wobbly-md border-[3px] border-[var(--border)] bg-[var(--accent)] px-6 font-display text-lg font-bold text-[var(--accent-foreground)]">🎲 הטילו</button>
      </div>
      {error && <p role="alert" className="text-red-700 font-bold mb-2">{error}</p>}
      <p className="text-sm text-[var(--muted-foreground)] mb-6">דוגמאות: <code dir="ltr">d20+5</code> · <code dir="ltr">8d6</code> · <code dir="ltr">1d8+1d6+2</code></p>

      {log.length > 0 && (
        <div aria-live="polite" className="wobbly border-[3px] border-[var(--border)] bg-[var(--postit)] p-5 mb-4 text-center">
          <div className="text-lg font-bold" dir="ltr">{log[0].title}</div>
          <div className="text-7xl font-display font-bold">{log[0].total}</div>
          {log[0].detail && <div className="mt-1" dir="auto">{log[0].detail}</div>}
        </div>
      )}
      {log.length > 1 && <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4 mb-6"><h2 className="font-display text-lg font-bold mb-2">הטלות קודמות</h2>{log.slice(1).map((e, i) => <p key={i} className="font-hand" dir="auto"><span dir="ltr">{e.title}</span> = <b>{e.total}</b> {e.detail && <span className="text-sm">{e.detail}</span>}</p>)}</div>}

      <section className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-2xl font-bold mb-2">🧙 הגרלת תכונות לדמות</h2>
        <p className="mb-3">6 הטלות של 4d6 — בכל אחת הקוביה הנמוכה יורדת.</p>
        <button onClick={rollStats} className={btn}>🎲 הגרילו תכונות</button>
        {stats && (
          <div className="mt-4">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">{stats.map((s, i) => <div key={i} className="text-center border-2 border-[var(--border)] bg-white p-2 wobbly-sm"><div className="text-3xl font-bold">{s.value}</div><div className="text-xs" dir="ltr">{s.rolls.join(' ')}</div><div className="text-xs text-[var(--muted-foreground)]">ירד {s.dropped}</div></div>)}</div>
            <p className="mt-2 text-sm">סה״כ: {stats.reduce((a, s) => a + s.value, 0)}</p>
          </div>
        )}
      </section>

      <DiceFamilyLinks current="/tools/dice/dnd" />
      <div className="mt-10">
        <SeoBody paragraphs={['במשחקי תפקידים כמו D&D משתמשים בסט של שבע קוביות: d4, d6, d8, d10, d12, d20 ו-d100. כאן יש את כולן, וגם הטלה חופשית בכתיב המקובל — למשל 2d6+3 — שמראה כל קוביה בנפרד ואת הסכום.', 'הטלת d20 מזהה אוטומטית 20 טבעי (קריטי) ו-1 טבעי, ויש כפתורים מוכנים להטלה ביתרון ובחיסרון. להכנת דמות חדשה — "הגרלת תכונות" מטילה 4d6 שש פעמים ומורידה בכל פעם את הקוביה הנמוכה.']} faq={FAQ} related={[{ label: 'קוביות D4 עד D20', href: '/tools/dice/polyhedral' }, { label: 'לוח ניקוד', href: '/tools/scoreboard' }, { label: 'משחקי קוביות', href: '/dice-games' }]} />
      </div>
    </div>
  )
}
