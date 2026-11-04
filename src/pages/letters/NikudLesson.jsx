import { useState } from 'react'
import { speak } from '../../utils/speak'
import { VOWELS } from '../../booklets/nikudData'

// All the vowel points as one guided lesson on /letters/nikud: five steps, one per sound
// (vowels that sound the same are taught together), each with tap-to-hear syllables, picture words
// and a quick reading check. Choices are picked by step and try number, not at random, so the
// prerendered page and the hydrated one match.
const V = Object.fromEntries(VOWELS.map(v => [v.key, v]))
const LETTERS = ['מ', 'ל', 'ש', 'ר', 'נ', 'ד']
const STEPS = [
  { keys: ['kamatz', 'patach'], sound: 'אַ', color: '#ffd94d', tip: 'שני סימנים, צליל אחד. פַּתָּח הוא קו קטן מתחת לאות, וקָמָץ הוא קו עם רגל קטנה באמצע.' },
  { keys: ['tzere', 'segol'], sound: 'אֶ', color: '#9fe3c4', tip: 'צֵירֶה הוא שתי נקודות זו לצד זו, וסֶגּוֹל הוא שלוש נקודות במשולש. שניהם נשמעים "אֶ".' },
  { keys: ['chirik'], sound: 'אִי', color: '#ffb3c7', tip: 'חִירִיק הוא נקודה אחת מתחת לאות. הרבה פעמים באה אחריו האות י׳: מִי, דִּי.' },
  { keys: ['cholam'], sound: 'אוֹ', color: '#b8d8ff', tip: 'חוֹלָם הוא נקודה למעלה. לרוב היא יושבת על האות ו׳: מוֹ, לוֹ, שׁוֹ.' },
  { keys: ['shuruk', 'kubutz'], sound: 'אוּ', color: '#d9c8ff', tip: 'שׁוּרוּק הוא ו׳ עם נקודה בבטן, וקֻבּוּץ הוא שלוש נקודות באלכסון מתחת לאות. שניהם נשמעים "אוּ".' },
]
const syl = (letter, key) => key === 'cholam' ? letter + 'וֹ' : key === 'shuruk' ? letter + 'וּ' : letter + V[key].mark
// The picture check: a word from this step's vowels, its picture and two pictures from other steps.
function check(k, tries) {
  const words = STEPS[k].keys.flatMap(key => V[key].words.slice(3)) // the first three are shown with their pictures above
  const [word, pic] = words[tries % words.length]
  const others = STEPS.filter((_, i) => i !== k).map((s, i) => V[s.keys[0]].words[(tries + i + k * 2) % 6][1])
  const wrong = [others[tries % others.length], others[(tries + 1) % others.length]]
  const opts = [pic, ...wrong]
  const r = (k + tries) % 3
  return { word, pic, opts: [...opts.slice(r), ...opts.slice(0, r)] }
}

export default function NikudLesson() {
  const [open, setOpen] = useState(false)
  const [k, setK] = useState(0)
  const [tries, setTries] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  if (!open) return <div className="my-6 text-center">
    <button type="button" onClick={() => setOpen(true)} className="min-h-[56px] rounded-3xl bg-violet-600 px-7 text-xl font-black text-white shadow-[0_5px_0_#5b21b6] hover:bg-violet-700">🎓 שיעור ניקוד אינטראקטיבי — כל התנועות, צעד אחרי צעד</button>
    <p className="mt-2 text-sm text-[var(--muted-foreground)]">קמץ ופתח, צירה וסגול, חיריק, חולם, שורוק וקובוץ — שומעים, קוראים ובודקים.</p>
  </div>
  const done = k >= STEPS.length
  const step = STEPS[k]
  const q = !done && check(k, tries)
  const answer = e => { if (pick) return; setPick(e); if (e === q.pic) setScore(n => n + 1) }
  const next = () => { setPick(null); setTries(0); setK(n => n + 1) }
  const again = () => { setPick(null); setTries(n => n + 1) }
  return <section className="mb-8 rounded-[28px] border-2 border-violet-300 bg-violet-50 p-5" aria-label="שיעור ניקוד אינטראקטיבי">
    <div className="flex items-center justify-between gap-2">
      <b className="text-lg">🎓 שיעור ניקוד · {done ? 'סיימתם!' : `שלב ${k + 1} מתוך ${STEPS.length}`}</b>
      <button type="button" onClick={() => setOpen(false)} className="rounded-full px-3 text-sm underline">סגירה</button>
    </div>
    <div className="mt-2 h-3 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuemin={0} aria-valuemax={STEPS.length} aria-valuenow={k}>
      <div className="h-full bg-violet-500 w-full origin-left rtl:origin-right transition-transform duration-500" style={{ transform: `scaleX(${k / STEPS.length})` }} />
    </div>
    {!done ? <div key={k} className="buga-fade-in mt-4">
      <h2 className="text-2xl font-black">{step.keys.map(key => V[key].name).join(' ו')} — נשמע <button type="button" onClick={() => speak(step.sound)} className="rounded-xl px-2" style={{ background: step.color }}>{step.sound} 🔊</button></h2>
      <p className="mt-1 text-lg">{step.tip}</p>
      {step.keys.map(key => <div key={key} className="mt-3">
        <p className="m-0 font-bold">{V[key].name}: לוחצים על הברה ושומעים</p>
        <div className="mt-1 grid grid-cols-6 gap-2">{LETTERS.map(l => <button key={l} type="button" onClick={() => speak(syl(l, key))}
          className="min-h-[60px] rounded-xl border-2 border-slate-300 bg-white text-4xl font-bold hover:bg-[var(--postit)]">{syl(l, key)}</button>)}</div>
      </div>)}
      <div className="mt-3 flex flex-wrap gap-2">{step.keys.flatMap(key => V[key].words.slice(0, 3)).map(([w, e]) => <button key={w} type="button" onClick={() => speak(w)}
        className="min-h-[48px] rounded-2xl border-2 border-slate-200 bg-white px-3 text-2xl font-bold"><span aria-hidden="true">{e} </span>{w}</button>)}</div>
      <div className="mt-5 rounded-2xl bg-white p-4 text-center">
        <p className="m-0 font-black">🤔 בודקים: קוראים את המילה ובוחרים את התמונה</p>
        <p className="m-0 mt-2 text-6xl font-bold">{q.word}</p>
        <div className="mt-3 flex justify-center gap-3">{q.opts.map(e => <button key={e} type="button" onClick={() => answer(e)} disabled={!!pick} aria-label={e}
          className={`min-h-[64px] min-w-[72px] rounded-2xl border-[3px] text-5xl ${pick && e === q.pic ? 'border-emerald-500 bg-emerald-50' : pick === e ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'}`}>{e}</button>)}</div>
        {pick && <p className="mt-3 mb-0 font-bold" role="status">{pick === q.pic ? '✅ נכון! ' : '❌ כמעט. '}<button type="button" onClick={() => speak(q.word)} className="underline">שומעים את "{q.word}" 🔊</button></p>}
        {pick && <button type="button" onClick={again} className="mt-2 text-sm underline">🔁 עוד מילה</button>}
      </div>
      <div className="mt-4 text-left"><button type="button" disabled={!pick} onClick={next} className="min-h-[48px] rounded-2xl bg-violet-600 px-6 font-black text-white disabled:opacity-40">{k === STEPS.length - 1 ? 'לסיכום ←' : 'לצליל הבא ←'}</button></div>
    </div> : <div className="buga-fade-in mt-4 text-center">
      <p className="text-5xl" aria-hidden="true">{score >= STEPS.length ? '🏆' : '⭐'}</p>
      <p className="mt-2 text-2xl font-black">קראתם נכון {score} מתוך {STEPS.length} מילים</p>
      <div className="mx-auto mt-3 flex max-w-xl flex-wrap justify-center gap-2">{STEPS.map(s => <span key={s.sound} className="rounded-full px-3 py-1 font-bold" style={{ background: s.color }}>{s.keys.map(key => V[key].mark === 'וּ' ? 'וּ' : 'ב' + V[key].mark).join(' ')} = {s.sound}</span>)}</div>
      <button type="button" onClick={() => { setK(0); setScore(0); setPick(null) }} className="ln-chip mt-4">🔁 שוב מההתחלה</button>
    </div>}
  </section>
}
