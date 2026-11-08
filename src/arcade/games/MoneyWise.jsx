import { useState } from 'react'
import { useProgress } from '../hooks'
import { Hud, ToolButton, EndCard, Segmented } from '../ui'
import { sfx } from '../sfx'
import { GOALS, WEEKS, ALLOWANCE, JOY_TARGET, newGame, scenarioOf, goalOf, canAfford, choose, toSaving, save, leakOf, outcome } from '../logic/moneyWise'
import './money-wise.css'

const freshSeed = () => 1 + Math.floor(Math.random() * 0x7ffffff)
const fmt = n => `${n} ₪`

export default function MoneyWise({ onReport, onShare }) {
  const [progress, saveProgress] = useProgress('money-wise', { goal: 'skate', best: 0, games: 0 })
  const [g, setG] = useState(() => newGame(freshSeed(), progress.goal))
  const [amount, setAmount] = useState(0)
  const [started, setStarted] = useState(false)
  const goal = goalOf(g)
  const sc = g.phase === 'event' || g.phase === 'feedback' ? scenarioOf(g) : null
  const pct = Math.min(100, Math.round(((g.saved + (g.phase === 'end' ? g.wallet : 0)) / goal.price) * 100))

  const restart = id => { const goalId = id || g.goalId; setG(newGame(freshSeed(), goalId)); setAmount(0); setStarted(false) }
  const pickGoal = id => { saveProgress({ goal: id }); restart(id) }
  const pick = i => { sfx('place'); setG(choose(g, i)) }
  const toSave = () => { setAmount(Math.min(g.wallet, Math.ceil(g.wallet / 2 / 5) * 5)); setG(toSaving(g)) }
  const commit = () => {
    const next = save(g, amount)
    sfx('tick')
    setG(next)
    setAmount(0)
    if (next.phase === 'end') {
      const o = outcome(next)
      saveProgress(p => ({ best: Math.max(p.best || 0, o.stars), games: (p.games || 0) + 1 }))
      if (o.stars) onReport?.({ text: `💰 סיימתי את קצבה חכמה עם ${o.stars} כוכבים וקניתי ${goal.name}!` })
    }
  }

  if (!started) {
    return (
      <div className="arc-game mw-game">
        <div className="mw-card">
          <h2>💰 קצבה חכמה</h2>
          <p>10 שבועות. בכל שבוע מקבלים <b>{fmt(ALLOWANCE)}</b> דמי כיס ועומדים בפני החלטה אמיתית. החליטו מה לקנות, מה לחסוך ומה לעשות — ושימרו גם על מצב רוח טוב!</p>
          <Segmented label="מה חוסכים בשבילו" value={g.goalId} onChange={pickGoal} options={GOALS.map(x => [x.id, `${x.emoji} ${x.name} · ${fmt(x.price)}`])} />
          <ul className="mw-rules">
            <li>🎯 המטרה: להגיע בסוף ל־{fmt(goal.price)} בקופה (חיסכון + כיס) — כוכב אחד.</li>
            <li>😊 שני כוכבים: גם מצב רוח של {JOY_TARGET} ומעלה.</li>
            <li>🛟 שלושה כוכבים: ועוד כרית ביטחון של 30 ₪ מעל המחיר.</li>
            <li>⚠️ כסף שנשאר בכיס "מתנדף": חצי ממנו הולך על חטיפים קטנים. מה שבקופה — נשמר.</li>
          </ul>
          <button type="button" className="arc-btn arc-btn-main" onClick={() => setStarted(true)}>מתחילים!</button>
          {progress.best ? <p className="mw-best">השיא שלכם: {'★'.repeat(progress.best)}{'☆'.repeat(3 - progress.best)}</p> : null}
        </div>
      </div>
    )
  }

  const o = g.phase === 'end' ? outcome(g) : null
  return (
    <div className="arc-game mw-game">
      <Hud stats={[['שבוע', `${Math.min(g.week, WEEKS)}/${WEEKS}`], ['כיס', fmt(g.wallet)], ['קופה', fmt(g.saved)], ['😊', g.joy]]}>
        <ToolButton onClick={() => restart()} label="משחק חדש">🔄</ToolButton>
      </Hud>
      <div className="mw-goal" aria-label={`התקדמות למטרה: ${pct} אחוז`}>
        <span>{goal.emoji} {goal.name} · {fmt(goal.price)}</span>
        <div className="mw-bar"><i style={{ width: `${pct}%` }} /></div>
      </div>
      <div className="mw-card" aria-live="polite">
        {sc && <>
          <h2><span aria-hidden="true">{sc.emoji}</span> {sc.title}</h2>
          <p>{sc.text}</p>
          {g.phase === 'event' && (
            <div className="mw-opts">
              {sc.options.map((op, i) => {
                const ok = canAfford(g, op)
                return <button key={op.t} type="button" className="mw-opt" disabled={!ok} onClick={() => pick(i)}>{op.t}{!ok && <small> · אין מספיק כסף</small>}</button>
              })}
            </div>
          )}
          {g.phase === 'feedback' && (
            <div className="mw-feedback">
              <p className="mw-picked">בחרתם: <b>{sc.options[g.last.index].t}</b></p>
              <p className="mw-why">💡 {g.last.why}</p>
              {g.last.dipped > 0 && <p className="mw-warn">לא הספיק הכסף בכיס, אז {fmt(g.last.dipped)} ירדו מהקופה. לכן כדאי כרית ביטחון!</p>}
              {g.last.joy !== 0 && <p className="mw-joy">{g.last.joy > 0 ? `😊 +${g.last.joy}` : `😕 ${g.last.joy}`} מצב רוח</p>}
              <button type="button" className="arc-btn arc-btn-main" onClick={toSave}>המשך לחיסכון ←</button>
            </div>
          )}
        </>}
        {g.phase === 'save' && (
          <div className="mw-save">
            <h2>🏺 כמה להכניס לקופה?</h2>
            <p>בכיס יש {fmt(g.wallet)}. כל מה שלא תכניסו לקופה — חצי ממנו ({fmt(leakOf(g.wallet - amount))}) יתנדף על חטיפים.</p>
            <label className="mw-range">הכנסה לקופה: <b>{fmt(amount)}</b>
              <input type="range" min="0" max={g.wallet} step="1" value={amount} onChange={e => setAmount(Number(e.target.value))} />
            </label>
            <div className="mw-quick">
              <button type="button" onClick={() => setAmount(0)}>כלום</button>
              <button type="button" onClick={() => setAmount(Math.floor(g.wallet / 2))}>חצי</button>
              <button type="button" onClick={() => setAmount(g.wallet)}>הכול</button>
            </div>
            <button type="button" className="arc-btn arc-btn-main" onClick={commit}>{g.week >= WEEKS ? 'מסיימים את המשחק' : 'לשבוע הבא ←'}</button>
          </div>
        )}
      </div>
      {g.note && g.phase === 'event' && <p className="mw-note">בשבוע שעבר: {fmt(g.note.put)} לקופה{g.note.leak ? `, ${fmt(g.note.leak)} התנדפו על חטיפים` : ''}. קיבלתם עוד {fmt(ALLOWANCE)}.</p>}
      {o && (
        <EndCard
          title={o.stars === 3 ? '🎉 מצוין! חסכתם חכם' : o.reached ? '🌟 הגעתם למטרה' : '😬 לא הגעתם למטרה'}
          stars={o.stars}
          text={`${o.reached ? `קניתם ${goal.name}! ` : `חסרו לכם ${fmt(o.short)} בשביל ${goal.name}. `}${o.happy ? (o.reached ? 'וגם שמרתם על מצב רוח טוב.' : 'אבל שמרתם על מצב רוח טוב.') : `מצב הרוח (${g.joy}) נמוך מהיעד ${JOY_TARGET} — גם הנאה היא חלק מהתקציב.`}${o.reached && !o.cushion ? ' כדי לקבל עוד כוכב — השאירו כרית ביטחון של 30 ₪ מעל המחיר.' : ''}`}
          primary="🔄 משחק חדש" onPrimary={() => restart()}
          secondary="📱 שתפו" onSecondary={() => onShare?.(`💰 סיימתי את קצבה חכמה ב־${o.stars} כוכבים! מי חוסך יותר חכם?`)}
        />
      )}
    </div>
  )
}
