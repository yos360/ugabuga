import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import Dreidel from '../../components/hanukkah/Dreidel'

const RULES = {
  'נ': { name: 'נ — נס', text: 'לא קורה כלום', emoji: '😐' },
  'ג': { name: 'ג — גדול', text: 'לוקחים את כל הקופה!', emoji: '🤩' },
  'ה': { name: 'ה — היה', text: 'לוקחים חצי מהקופה', emoji: '😊' },
  'פ': { name: 'פ — פה', text: 'שמים אחד בקופה', emoji: '😬' },
  'ש': { name: 'ש — שם', text: 'שמים אחד בקופה', emoji: '😬' },
}
const START = 10

const FAQ = [
  { q: 'מה כתוב על הסביבון?', a: 'בארץ ישראל: נ־ג־ה־פ, "נס גדול היה פה". בחוץ לארץ: נ־ג־ה־ש, "נס גדול היה שם". אפשר לבחור למעלה איזה סביבון רוצים.' },
  { q: 'מה החוקים של משחק הסביבון?', a: 'כל שחקן מקבל אותו מספר אסימונים (סוכריות, אגוזים או מטבעות) ושם אחד בקופה. בתורו מסובב את הסביבון: נ׳ — כלום, ג׳ — לוקח את כל הקופה, ה׳ — לוקח חצי, פ׳ או ש׳ — שם אחד בקופה. כשהקופה מתרוקנת כולם שמים שוב אחד. מי שנגמרו לו האסימונים יוצא, והאחרון שנשאר מנצח.' },
  { q: 'הסביבון הווירטואלי באמת אקראי?', a: 'כן. לכל אחת מ־4 האותיות יש סיכוי שווה בדיוק — רבע — בכל סיבוב.' },
  { q: 'כמה שחקנים יכולים לשחק?', a: 'בין 2 ל־6. אפשר גם לסובב בלי ניקוד — רק כדי לראות על איזו אות נופלים.' },
]

export default function Sevivon() {
  const [israel, setIsraelLetters] = useState(true)
  const letters = ['נ', 'ג', 'ה', israel ? 'פ' : 'ש']
  const [letter, setLetter] = useState('נ')
  const [spinning, setSpinning] = useState(false)
  const [spins, setSpins] = useState(0)
  const [names, setNames] = useState(['שחקן 1', 'שחקן 2'])
  const [game, setGame] = useState(null) // { coins: [], pot, turn, log: [] }

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    const result = letters[Math.floor(Math.random() * 4)]
    setTimeout(() => {
      setLetter(result); setSpinning(false); setSpins(n => n + 1)
      if (game) setGame(g => play(g, result))
    }, 1400)
  }

  function start() {
    const coins = names.map(() => START - 1)
    setGame({ coins, pot: names.length, turn: 0, log: [`כל שחקן שם אסימון אחד בקופה. בקופה: ${names.length}`], winner: null })
  }

  function play(g, l) {
    let { coins, pot, turn, log } = { ...g, coins: [...g.coins], log: [...g.log] }
    const who = names[turn]
    if (l === 'ג') { coins[turn] += pot; log.unshift(`${who}: ג׳ — לקח/ה את כל הקופה (${pot}) 🎉`); pot = 0 }
    else if (l === 'ה') { const half = Math.ceil(pot / 2); coins[turn] += half; pot -= half; log.unshift(`${who}: ה׳ — לקח/ה חצי (${half})`) }
    else if (l === 'פ' || l === 'ש') { if (coins[turn] > 0) { coins[turn] -= 1; pot += 1 } log.unshift(`${who}: ${l}׳ — שם/ה אחד בקופה`) }
    else log.unshift(`${who}: נ׳ — לא קרה כלום`)
    if (pot === 0) {
      coins = coins.map(c => { if (c > 0) { pot += 1; return c - 1 } return c })
      log.unshift(`הקופה התרוקנה — כל מי שנשארו לו אסימונים שם/ה אחד. בקופה: ${pot}`)
    }
    const alive = coins.map((c, i) => c > 0 ? i : -1).filter(i => i >= 0)
    const winner = alive.length <= 1 ? names[alive[0] ?? turn] : null
    let next = turn
    for (let k = 1; k <= names.length; k++) { const c = (turn + k) % names.length; if (coins[c] > 0) { next = c; break } }
    return { coins, pot, turn: next, log: log.slice(0, 8), winner }
  }

  const rule = RULES[letter]

  return (
    <HanukkahShell crumb="סביבון וירטואלי">
      <SEO title="סביבון וירטואלי — לסובב סביבון אונליין ולשחק" description="סביבון וירטואלי לחנוכה: מסובבים בלחיצה ומשחקים עם כל המשפחה — ניקוד אוטומטי ל־2 עד 6 שחקנים, סביבון נ־ג־ה־פ או נ־ג־ה־ש, והחוקים המלאים. חינם." path="/holidays/hanukkah/sevivon" structuredData={faqSchema(FAQ)} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2">סביבון וירטואלי</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-5">לוחצים, הסביבון מסתובב — ומגלים על איזו אות נפל</p>

      <div className="flex justify-center gap-2 mb-4" role="radiogroup" aria-label="סוג הסביבון">
        {[[true, 'נס גדול היה פה'], [false, 'נס גדול היה שם']].map(([v, l]) => <button key={l} type="button" role="radio" aria-checked={israel === v} onClick={() => { setIsraelLetters(v); if (letter === 'פ' || letter === 'ש') setLetter(v ? 'פ' : 'ש') }}
          className={`min-h-[44px] rounded-xl border-2 px-3 font-bold ${israel === v ? 'border-slate-800 bg-yellow-200' : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
      </div>

      <div className="grid gap-6 md:grid-cols-2 items-start mb-10">
        <div className="rounded-3xl border-2 border-[var(--border)] bg-blue-50 p-5 text-center sketch-shadow">
          <div className="flex justify-center" style={!spinning ? { animation: 'buga-dreidel-land 500ms ease-out' } : undefined} key={spinning ? 's' : 'l' + spins}>
            <Dreidel letter={letter} spinning={spinning} size={180} />
          </div>
          <p className="mt-2 min-h-[64px] text-2xl font-bold" aria-live="polite">{spinning ? 'מסתובב…' : <>{rule.emoji} {rule.name}<br /><span className="text-lg font-normal">{rule.text}</span></>}</p>
          <button type="button" onClick={spin} disabled={spinning || !!game?.winner} className="mt-3 min-h-[56px] rounded-2xl bg-blue-600 px-10 text-xl font-bold text-white disabled:opacity-50">סובבו!</button>
        </div>

        <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow-sm">
          {!game ? <>
            <h2 className="text-2xl font-bold mb-2">🏆 משחק עם ניקוד</h2>
            <p className="mb-3 text-[var(--muted-foreground)]">כל שחקן מתחיל עם {START} אסימונים. הסביבון סופר בשבילכם.</p>
            {names.map((n, i) => <div key={i} className="mb-2 flex gap-2">
              <input value={n} onChange={e => setNames(ns => ns.map((x, k) => k === i ? e.target.value.slice(0, 14) : x))} aria-label={`שם שחקן ${i + 1}`} className="min-h-[44px] flex-1 rounded-xl border-2 border-[var(--border)] px-3" />
              {names.length > 2 && <button type="button" onClick={() => setNames(ns => ns.filter((_, k) => k !== i))} aria-label="הסרת שחקן" className="min-h-[44px] rounded-xl border-2 border-[var(--border)] px-3">✕</button>}
            </div>)}
            <div className="flex flex-wrap gap-2">
              {names.length < 6 && <button type="button" onClick={() => setNames(ns => [...ns, `שחקן ${ns.length + 1}`])} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white px-4 font-bold">➕ שחקן</button>}
              <button type="button" onClick={start} className="min-h-[44px] rounded-xl bg-pink-600 px-5 font-bold text-white">▶ מתחילים</button>
            </div>
          </> : <>
            <div className="mb-3 flex items-center justify-between"><h2 className="text-2xl font-bold">🏆 המשחק</h2><span className="rounded-full bg-yellow-200 px-3 py-1 font-bold">🍬 בקופה: {game.pot}</span></div>
            {game.winner ? <p className="mb-3 rounded-xl bg-green-100 p-3 text-center text-xl font-bold">🎉 {game.winner} ניצח/ה!</p> : <p className="mb-3 font-bold">תור: {names[game.turn]} — סובבו!</p>}
            <ul className="mb-3 space-y-1">{names.map((n, i) => <li key={i} className={`flex justify-between rounded-lg px-3 py-1.5 ${i === game.turn && !game.winner ? 'bg-blue-100 font-bold' : ''} ${game.coins[i] <= 0 ? 'opacity-40 line-through' : ''}`}><span>{n}</span><span>{Math.max(0, game.coins[i])} 🍬</span></li>)}</ul>
            <ol className="mb-3 space-y-0.5 text-sm text-[var(--muted-foreground)]">{game.log.map((l, i) => <li key={i}>{l}</li>)}</ol>
            <button type="button" onClick={() => setGame(null)} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white px-4 font-bold">↺ משחק חדש</button>
          </>}
        </div>
      </div>

      <section className="mb-10 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5">
        <h2 className="text-2xl font-bold mb-3">📜 חוקי משחק הסביבון</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {letters.map(l => <p key={l} className="rounded-xl bg-white p-3"><b className="text-2xl ml-2">{l}</b> {RULES[l].text}</p>)}
        </div>
        <p className="mt-3">כשהקופה מתרוקנת — כל מי שנשארו לו אסימונים שם אחד. מי שנגמרו לו האסימונים יוצא מהמשחק, והאחרון שנשאר מנצח.</p>
      </section>

      <SeoBody
        paragraphs={[
          'הסביבון הוא המשחק הכי מזוהה עם חנוכה. בסביבון הווירטואלי אפשר לשחק גם כשהסביבון האמיתי נעלם מתחת לספה: לוחצים "סובבו", והתוצאה אקראית לגמרי — לכל אות סיכוי שווה.',
          'רוצים משחק אמיתי? מכניסים את שמות השחקנים והסביבון סופר את האסימונים, מעדכן את הקופה ומודיע מי ניצח. מתאים לערב חנוכה בבית, לגן ולכיתה על המקרן.',
        ]}
        faq={FAQ}
        related={[{ label: 'חידון חנוכה לילדים', href: '/holidays/hanukkah/quiz' }, { label: 'דפי צביעה לחנוכה', href: '/holidays/hanukkah/coloring' }, { label: 'קובייה וירטואלית', href: '/tools/dice' }]}
      />
    </HanukkahShell>
  )
}
