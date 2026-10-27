import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { POSITIONS, SOUND_LETTERS, pickSoundQuestions } from '../../data/soundPosition'
import { emojiFile } from '../../data/englishWords'
import { makeRng, newSeed } from '../../motor/rng'
import { speak } from '../../utils/speak'
import { liveSound } from '../live/liveSounds'

// The online side of /printables/sound-position: 10 rounds of letter + picture, hear the word, tap
// start / middle / end. After each answer the pointed word appears with the letter marked in it.
const ROUNDS = 10
const art = emoji => `/print-art/words/${emojiFile(emoji)}.svg`
const FINAL = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
// The word split into letters with their marks, so the asked letter can be coloured.
const clusters = word => [...word].reduce((a, ch) => { if (/[֑-ׇ]/.test(ch) && a.length) a[a.length - 1] += ch; else a.push(ch); return a }, [])

function Word({ q }) {
  return <span className="text-4xl font-bold" dir="rtl">{clusters(q.word).map((c, i) => <span key={i} className={(FINAL[c[0]] || c[0]) === q.letter ? 'text-rose-600' : ''}>{c}</span>)}</span>
}

export default function SoundPositionGame({ letters, positions, printLink = false }) {
  const [seed, setSeed] = useState(() => newSeed())
  const qs = useMemo(() => pickSoundQuestions(makeRng(seed), { count: ROUNDS, letters, positions }), [seed, letters, positions])
  const [i, setI] = useState(0), [pick, setPick] = useState(null), [score, setScore] = useState(0)
  const restart = () => { setSeed(newSeed()); setI(0); setPick(null); setScore(0) }
  const q = qs[i], done = i >= qs.length
  const answer = id => {
    if (pick) return
    setPick(id)
    const right = id === q.pos
    if (right) setScore(s => s + 1)
    liveSound(right ? 'right' : 'wrong')
  }
  const next = () => { setPick(null); setI(n => n + 1) }

  if (!qs.length) return null
  return <section aria-label="משחק אונליין: איפה שומעים את הצליל" className="mx-auto mb-8 max-w-xl rounded-3xl border-2 border-violet-300 bg-violet-50 p-4 text-center sm:p-6" dir="rtl">
    <h2 className="text-2xl font-black">🎮 משחקים אונליין</h2>
    {done ? <div className="py-6">
      <p className="text-5xl" aria-hidden="true">{score >= 8 ? '🏆' : score >= 5 ? '⭐' : '💪'}</p>
      <p className="mt-2 text-2xl font-bold">{score} מתוך {qs.length}</p>
      <p className="mt-1 text-lg">{score >= 8 ? 'אוזן מצוינת!' : score >= 5 ? 'יפה מאוד! עוד סיבוב?' : 'מתאמנים עוד קצת — אומרים את המילה לאט.'}</p>
      <button type="button" onClick={restart} className="mt-4 min-h-[48px] rounded-2xl bg-violet-700 px-6 text-lg font-bold text-white hover:bg-violet-800">🔄 עוד סיבוב</button>
    </div> : <>
      <p className="mt-1 text-sm text-slate-600">שאלה {i + 1} מתוך {qs.length} · ⭐ {score}</p>
      <div className="mx-auto mt-3 max-w-xs overflow-hidden rounded-2xl border-2 border-slate-400 bg-white">
        <div className="bg-amber-100 py-1 text-6xl font-black leading-tight">{q.show}</div>
        <img src={art(q.emoji)} alt="" className="mx-auto my-3 h-36 w-36" />
        <button type="button" onClick={() => speak(q.word)} className="mb-3 min-h-[44px] rounded-xl border-2 border-slate-300 px-4 font-bold hover:bg-slate-50">🔊 לשמוע את המילה</button>
      </div>
      <p className="mt-3 text-lg font-bold">איפה שומעים את <span className="text-2xl">{q.show}</span>?</p>
      <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${positions.length}, minmax(0, 1fr))` }}>
        {POSITIONS.filter(p => positions.includes(p.id)).map(p => {
          const state = !pick ? 'border-slate-400 bg-white hover:bg-violet-100' : p.id === q.pos ? 'border-emerald-600 bg-emerald-200 text-emerald-900' : p.id === pick ? 'border-rose-500 bg-rose-100 text-rose-900' : 'border-slate-300 bg-white text-slate-400'
          return <button key={p.id} type="button" onClick={() => answer(p.id)} aria-disabled={!!pick} aria-pressed={pick === p.id}
            className={`min-h-[56px] rounded-2xl border-2 text-xl font-bold ${state}`}>{p.label}{pick && p.id === q.pos ? ' ✓' : ''}</button>
        })}
      </div>
      {pick && <div className="mt-4" aria-live="polite">
        <p className="text-lg font-bold">{pick === q.pos ? '🎉 נכון!' : 'כמעט!'} שומעים את {q.show} {POSITIONS.find(p => p.id === q.pos).label}:</p>
        <p className="mt-2"><Word q={q} /></p>
        <button type="button" onClick={next} autoFocus className="mt-4 min-h-[48px] rounded-2xl bg-violet-700 px-6 text-lg font-bold text-white hover:bg-violet-800">{i + 1 < qs.length ? 'הבא ←' : 'לסיכום ←'}</button>
      </div>}
    </>}
    <p className="mt-4 text-sm text-slate-600">המשבצת הימנית היא ההתחלה · {printLink ? <Link to="/printables/sound-position" className="font-bold underline">רוצים דפים להדפסה? ←</Link> : 'אפשר גם להדפיס דפים למטה ⬇️'}</p>
  </section>
}

// /online-games/sound-position — the same game on its own page, for players who came for a game.
const ALL = ['start', 'middle', 'end'], EDGES = ['start', 'end']
const FAQ = [
  { q: 'לאיזה גיל מתאים המשחק?', a: 'לגן חובה ולכיתה א׳. לקטנים כדאי להתחיל ב"רק התחלה וסוף", ולהוסיף את האמצע כשזה כבר קל להם.' },
  { q: 'איך יודעים איפה הצליל?', a: 'אומרים את שם התמונה לאט ומותחים את הצלילים: "גגגגֶ־זֶר". אפשר ללחוץ על 🔊 ולשמוע את המילה. אחרי כל תשובה מופיעה המילה המנוקדת, והאות שחיפשנו צבועה בה.' },
  { q: 'יש גם דפים להדפסה?', a: 'כן — אותן שאלות בדפי עבודה להדפסה, 12 כרטיסים בדף ודף תשובות.' },
]
export function SoundPositionOnline() {
  const [level, setLevel] = useState('all')
  return <div className="mx-auto max-w-4xl px-3 py-8 sm:px-4" dir="rtl">
    <SEO title="איפה שומעים את הצליל — משחק אונליין: בהתחלה, באמצע או בסוף" description="משחק אונליין בחינם במודעות פונולוגית: אות ותמונה, שומעים את המילה ובוחרים — הצליל בהתחלה, באמצע או בסוף? 10 שאלות בסיבוב, עם הקראה וצליל לתשובה נכונה. לגן חובה ולכיתה א׳." path="/online-games/sound-position" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים אונליין', href: '/online-games' }, { label: 'איפה שומעים את הצליל?' }]} />
    <h1 className="text-center text-3xl font-black sm:text-5xl">👂 איפה שומעים את הצליל?</h1>
    <p className="mx-auto mb-4 mt-2 max-w-2xl text-center text-lg text-slate-600">רואים אות ותמונה, אומרים את המילה בקול — ובוחרים: בהתחלה, באמצע או בסוף.</p>
    <div role="group" aria-label="רמה" className="mb-4 flex flex-wrap justify-center gap-2">
      {[['all', 'התחלה, אמצע וסוף'], ['edges', 'רק התחלה וסוף (קל יותר)']].map(([v, l]) => <button key={v} type="button" aria-pressed={level === v} onClick={() => setLevel(v)}
        className={`min-h-11 rounded-xl border-2 px-3 font-bold ${level === v ? 'border-violet-600 bg-violet-100' : 'border-slate-300 bg-white text-slate-500'}`}>{l}</button>)}
    </div>
    <SoundPositionGame key={level} letters={SOUND_LETTERS} positions={level === 'edges' ? EDGES : ALL} printLink />
    <div className="mt-10"><SeoBody paragraphs={[
      'לפני שקוראים, צריך לשמוע. ילד שיודע לומר איפה במילה מסתתר צליל — בהתחלה, באמצע או בסוף — מוכן לחבר אותיות למילים. במשחק הזה מתרגלים את זה עם תמונות: אות למעלה, תמונה, ושלושה כפתורים.',
      'אחרי כל תשובה מופיעה המילה המנוקדת והאות שחיפשנו צבועה בה, כך שגם טעות מלמדת. כל המילים נבדקו: לא שואלים על אות שלא שומעים, ולא על מילה שיש בה שתי אותיות עם אותו צליל.',
    ]} faq={FAQ} related={[{ label: 'איפה שומעים את הצליל — דפים להדפסה', href: '/printables/sound-position' }, { label: 'קוראים רק מה שלמדנו', href: '/letters/reading-practice' }, { label: 'משחק זיכרון אותיות', href: '/online-games/memory-letters' }]} /></div>
  </div>
}
