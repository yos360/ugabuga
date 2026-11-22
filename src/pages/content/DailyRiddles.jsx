import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import WobblyButton from '../../components/ui/WobblyButton'
import SeoBody from '../../components/ui/SeoBody'
import { DAILY_RIDDLES, dailyRiddlePath, riddleText } from '../../data/dailyRiddles'
import { Chip, Header } from './contentUi'

// "החידה היומית": the list (/riddles/daily) and one page per riddle (/riddles/<id>, served by RiddlePage).
const heDate = d => new Date(d + 'T12:00:00').toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
const CRUMBS = [{ label: 'ראשי', href: '/' }, { label: 'חידות', href: '/tools/riddles' }]

// From 22.11.2026 every daily riddle (with options) is also a question in בוגה לייב's "חידות" topic
// (owner's request: so people go and play it). This button opens that game.
export function LivePlayCta({ r }) {
  if (!r.options) return null
  return <Link to="/live?topic=riddles&difficulty=hard" className="mx-auto mt-4 block max-w-md rounded-2xl border-2 border-slate-800 bg-[#d13c78] px-5 py-3 text-center text-lg font-bold text-white shadow-[0_4px_0_#1e293b]">
    🔴 כל החידות האלה — שחקו עכשיו בבוגה לייב
    <small className="block text-sm font-normal">חידון חי מול חברים, הכיתה או המשפחה. בחינם ובלי הרשמה</small>
  </Link>
}

// The riddle drawn like in the video: a row of boxes, equation lines, a drawing or a few lines of text
export function Board({ r }) {
  if (r.kind === 'image') {
    return (
      <div className="space-y-3 text-center">
        <img src={r.image} alt={r.lines.join(' ')} width="900" height="700" loading="lazy" className="mx-auto h-auto w-full max-w-xl rounded-xl border-2 border-slate-800" />
        {r.lines.map((l, i) => <p key={i} className="text-xl font-bold">{l}</p>)}
      </div>
    )
  }
  if (r.kind === 'seq') {
    return (
      <div dir={r.dir} className="flex flex-wrap justify-center gap-2">
        {r.items.map((x, i) => <span key={i} className={`flex h-16 w-14 items-center justify-center rounded-xl border-2 border-slate-800 text-2xl font-bold ${x === '?' ? 'bg-[var(--postit)]' : 'bg-white'}`}>{x}</span>)}
      </div>
    )
  }
  if (r.kind === 'eq') {
    return <div className="mx-auto max-w-md space-y-2">{r.lines.map((l, i) => <p key={i} dir={/[֐-׿]/.test(l) ? 'rtl' : 'ltr'} className={`rounded-xl border-2 border-slate-800 px-4 py-3 text-center text-2xl font-bold ${i === r.lines.length - 1 ? 'bg-[var(--postit)]' : 'bg-white'}`}>{l}</p>)}</div>
  }
  return <div className="space-y-1 text-center text-2xl font-bold leading-relaxed">{r.lines.map((l, i) => <p key={i}>{l}</p>)}</div>
}

// The Hebrew keyboard as on a phone, physical left-to-right. Used by riddles with r.keyboard: on reveal the
// lit keys light up one by one in the riddle's order, then the answer key pops.
const KB_ROWS = ['קראטוןםפ', 'שדגכעיחלךף', 'זסבהנמצתץ']
function KeyboardReveal({ kb }) {
  const [step, setStep] = useState(0)
  const total = kb.lit.length + 1
  useEffect(() => {
    if (step >= total) return undefined
    const t = setTimeout(() => setStep(s => s + 1), step === 0 ? 300 : 450)
    return () => clearTimeout(t)
  }, [step, total])
  return (
    <div dir="ltr" className="mx-auto mb-4 max-w-md space-y-1.5 rounded-2xl border-2 border-slate-800 bg-slate-100 p-2" role="img" aria-label={`מקלדת עברית: ${kb.lit.join(', ')} ואחריהן ${kb.answer}`}>
      {KB_ROWS.map((row, ri) => (
        <div key={row} className={`flex justify-center gap-1 rounded-xl py-1 ${ri === 1 ? 'bg-yellow-100' : ''}`}>
          {[...row].map(ch => {
            const li = kb.lit.indexOf(ch), isAns = ch === kb.answer
            const on = (li >= 0 && step > li) || (isAns && step >= total)
            return (
              <span key={ch} className={`flex h-10 w-8 items-center justify-center rounded-lg border text-lg font-bold transition-all duration-300 ${on ? (isAns ? 'scale-125 border-green-700 bg-green-500 text-white shadow-lg' : 'border-slate-800 bg-[var(--postit)]') : 'border-slate-300 bg-white text-slate-600'}`}>{ch}</span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function DailyRiddleView({ r }) {
  const [open, setOpen] = useState(false)
  const [hint, setHint] = useState(false)
  const i = DAILY_RIDDLES.indexOf(r), prev = DAILY_RIDDLES[i + 1], next = DAILY_RIDDLES[i - 1]
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={`החידה היומית #${r.n}: ${r.title} — עם פתרון`} description={`${riddleText(r)} — חידה של ${r.type} עם טריק. יש לכם 10 שניות! הפתרון וההסבר בלחיצה.`} path={dailyRiddlePath(r)} />
      <Breadcrumbs items={[...CRUMBS, { label: 'החידה היומית', href: '/riddles/daily' }, { label: `#${r.n}` }]} />
      <Header emoji="🧠" title={`החידה היומית #${r.n}: ${r.title}`} intro={`${heDate(r.date)} · ${r.type}`} />
      <WobblyCard hover={false} padding="p-6">
        <Board r={r} />
        <p className="mt-5 text-center text-lg font-bold text-[var(--muted-foreground)]">{r.ask}</p>
        <p className="mt-1 text-center">⏱️ יש לכם 10 שניות לפתור!</p>
        {r.hint && !open && (
          <p className="mt-3 text-center">
            {hint ? <span className="text-lg font-bold">💡 {r.hint}</span> : <button type="button" onClick={() => setHint(true)} className="underline">💡 צריכים רמז?</button>}
          </p>
        )}
      </WobblyCard>
      <div className="mt-5 text-center">
        {open
          ? <div className="wobbly border-2 border-[var(--border)] bg-green-50 p-5 text-right">{r.keyboard && <KeyboardReveal kb={r.keyboard} />}<p className="text-2xl font-bold text-green-800">✅ {r.answer}</p><p className="mt-2 text-lg leading-relaxed">{r.why}</p></div>
          : <WobblyButton onClick={() => setOpen(true)}>👀 הצגת הפתרון</WobblyButton>}
      </div>
      <LivePlayCta r={r} />
      <p className="mt-8 text-center text-lg">🗓️ חידה חדשה כל יום ב־14:00 — חזרו מחר!</p>
      <nav className="mt-4 flex flex-wrap justify-center gap-2" aria-label="עוד חידות יומיות">
        {prev && <Chip to={dailyRiddlePath(prev)}>→ החידה הקודמת (#{prev.n})</Chip>}
        {next && <Chip to={dailyRiddlePath(next)}>החידה הבאה (#{next.n}) ←</Chip>}
        <Chip to="/riddles/daily" hl>כל החידות היומיות</Chip>
        <Chip to="/riddles/topics">חידות לפי נושא</Chip>
        <Chip to="/riddles/one-word">🤯 מילה אחת, פתגם שלם</Chip>
      </nav>
    </div>
  )
}

export function DailyRiddlesHub() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="החידה היומית — חידה קשה וטריקית חדשה כל יום, עם פתרון" description={`${DAILY_RIDDLES.length} חידות יומיות עם טריק: סדרות מספרים, לוח שנה, היגיון ומשחקי מילים. חידה חדשה כל יום ב־14:00, והפתרון בלחיצה.`} path="/riddles/daily" />
      <Breadcrumbs items={[...CRUMBS, { label: 'החידה היומית' }]} />
      <Header emoji="🧠" title="החידה היומית" intro="כל יום ב־14:00 חידה חדשה עם טריק — אפשר לפתור בעשר שניות, אם מבינים אותו." />
      <div className="space-y-3">
        {DAILY_RIDDLES.map(r => (
          <Link key={r.id} to={dailyRiddlePath(r)} className="block">
            <WobblyCard hover padding="p-4">
              <p className="text-sm text-[var(--muted-foreground)]">#{r.n} · {heDate(r.date)} · {r.type}</p>
              <h2 className="font-hand font-bold text-xl">{r.emoji} {r.title}</h2>
              <p className="mt-1 line-clamp-2">{riddleText(r)}</p>
            </WobblyCard>
          </Link>
        ))}
      </div>
      <div className="mt-10">
        <SeoBody paragraphs={[
          'החידה היומית של עוגה בוגה היא חידה אחת קצרה וטריקית בכל יום: סדרת מספרים, חידת לוח שנה, היגיון, משחק מילים או שאלה מכשילה. היא לא קשה מאוד — אבל יש בה טריק, ומי שמוצא אותו פותר בעשר שניות.',
          'בכל דף חידה הפתרון מוסתר עד שלוחצים, יחד עם הסבר קצר. אפשר לפתור לבד, עם הילדים או להציג בכיתה ולתת לכולם לנחש.',
        ]} related={[{ href: '/riddles/adults', label: 'חידות למבוגרים' }, { href: '/tools/riddles', label: 'מאגר החידות' }, { href: '/riddles/topics', label: 'חידות לפי נושא' }, { href: '/trick-questions', label: 'שאלות מכשילות' }]} />
      </div>
    </div>
  )
}
