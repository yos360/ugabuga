import { tables } from './hintText.js'
import { useState } from 'react'
import { range } from '../../logic/brain/core.js'
import { traceLaser } from '../../logic/brain/deduction.js'

const COLORS = ['#ba294c', '#2759bb', '#227548', '#a75106', '#7949ab', '#007b85']
// The seven matchstick places of a digit: [left, top, horizontal] in % of the digit box.
// Bit order: top, top-right, bottom-right, bottom, bottom-left, top-left, middle.
const STICKS = [[50, 4, true], [88, 27, false], [88, 73, false], [50, 96, true], [12, 73, false], [12, 27, false], [50, 50, true]]
function Matches({ p, state, act, disabled, en }) {
  const [from, setFrom] = useState(null)
  const choose = cell => {
    const occupied = !!(state.mask & (1 << cell))
    if (p.mode === 'remove') { if (occupied) act({ from: cell }); return }
    if (occupied) setFrom(from === cell ? null : cell)
    else if (from !== null) { act({ from, to: cell }); setFrom(null) }
  }
  const left = p.budget - state.used
  return <>
    <p className="brain-goal">{en ? <>{p.mode === 'remove' ? 'Remove' : 'Move'} <b>{left}</b> {left === 1 ? 'match' : 'matches'} to make the equation correct</> : <>{p.mode === 'remove' ? 'הסירו' : 'הזיזו'} <b>{left}</b> {left === 1 ? 'גפרור' : 'גפרורים'} כדי שהתרגיל יהיה נכון</>}</p>
    <div className={`brain-equation ${from !== null ? 'moving' : ''}`} dir="ltr">{range(3).map(i => <span key={i} className="brain-eq-part">
      <span className="brain-mdigit">{STICKS.map(([x, y, h], seg) => {
        const cell = i * 7 + seg, lit = !!(state.mask & (1 << cell))
        return <button type="button" key={cell} disabled={disabled || (!lit && (p.mode === 'remove' || from === null))}
          className={`stick ${h ? 'h' : 'v'} ${lit ? 'lit' : 'empty'} ${from === cell ? 'selected' : ''}`} style={{ left: `calc(${x}% - ${h ? '31%' : '22px'})`, top: `calc(${y}% - ${h ? '22px' : '20%'})` }}
          onClick={() => choose(cell)} aria-label={en ? `${lit ? 'Match' : 'Place'} number ${cell + 1}` : `${lit ? 'גפרור' : 'מקום'} מספר ${cell + 1}`} aria-pressed={from === cell} />
      })}</span>
      {i < 2 && <b className="brain-op">{i === 0 ? p.operator : '='}</b>}
    </span>)}</div>
    <p className="brain-howto">{en ? (p.mode === 'remove' ? 'Tap a match to remove it.' : from === null ? 'Tap a match, then tap an empty (dashed) place, in any digit.' : 'Now tap an empty place. Tapping the match again cancels.') : p.mode === 'remove' ? 'לחצו על גפרור כדי להסיר אותו.' : from === null ? 'לחצו על גפרור, ואז על מקום ריק (מקווקו) — בכל ספרה.' : 'עכשיו לחצו על מקום ריק. לחיצה נוספת על הגפרור מבטלת.'}</p>
  </>
}
function Water({ p, state, act, disabled, en }) {
  const [source, setSource] = useState(null)
  return <><p>{en ? <>The goal: exactly <strong>{p.target} liters</strong> in one of the jugs. A pour stops when the source is empty or the target is full.</> : <>המטרה: בדיוק <strong>{p.target} ליטרים</strong> באחד הכלים. מוזגים עד שהמקור מתרוקן או שהיעד מלא.</>}</p><div className="brain-jugs">{p.capacities.map((capacity, i) => <section key={i}>
    <button type="button" className={`brain-jug ${source === i ? 'selected' : ''}`} disabled={disabled} aria-label={en ? `Jug ${i + 1}: ${state[i]} of ${capacity} liters` : `כלי ${i + 1}: ${state[i]} מתוך ${capacity} ליטרים`} aria-pressed={source === i} onClick={() => { if (source === null || source === i) setSource(source === i ? null : i); else { act({ from: source, to: i }); setSource(null) } }}>
      <span className="brain-water" style={{ height: `${state[i] / capacity * 100}%` }} /><strong>{state[i]} / {capacity}</strong><small>{en ? 'Jug' : 'כלי'} {i + 1}</small>
    </button>
    {p.tap && <div className="brain-tools"><button type="button" disabled={disabled || state[i] === capacity} onClick={() => act({ fill: i })}>{en ? 'Fill' : 'מילוי'} {i + 1}</button><button type="button" disabled={disabled || !state[i]} onClick={() => act({ empty: i })}>{en ? 'Empty' : 'ריקון'} {i + 1}</button></div>}
  </section>)}</div><p>{en ? (source === null ? 'To pour: choose a source jug, then a target jug.' : `Jug ${source + 1} selected. Now choose where to pour.`) : source === null ? 'למזיגה: בחרו כלי מקור ואז כלי יעד.' : `כלי ${source + 1} נבחר. עכשיו בחרו לאן למזוג.`}</p></>
}
function River({ p, state, act, disabled, en }) {
  const { FRIENDS } = tables(en ? 'en' : 'he')
  const [riders, setRiders] = useState([]), boat = (state >> p.n) & 1
  return <><p>{en ? `Get everyone to the other bank. An adult always rows the boat; there is room for ${p.capacity} more passengers. The adult may go back alone.` : `העבירו את כולם לגדה השנייה. מבוגר חותר תמיד בסירה; יש מקום לעוד ${p.capacity} נוסעים. מותר למבוגר לחזור לבדו.`}</p>
    <details open><summary>{en ? 'Who cannot stay together without the adult?' : 'מי לא יכול להישאר יחד ללא המבוגר?'}</summary><ul>{p.conflicts.map(([a, b]) => <li key={`${a}-${b}`}>{en ? `${FRIENDS[a]} and ${FRIENDS[b]}` : `${FRIENDS[a]} ו־${FRIENDS[b]}`}</li>)}</ul></details>
    <div className="brain-banks" data-boat={boat}>{[0, 1].map(side => <section key={side} className={boat === side ? 'has-boat' : ''}><h3>{side ? (en ? '🏁 The other bank' : '🏁 הגדה השנייה') : (en ? '🏕️ Starting bank' : '🏕️ גדת ההתחלה')}</h3>{range(p.n).filter(i => ((state >> i) & 1) === side).map(i => <button type="button" key={i} disabled={disabled || boat !== side} aria-pressed={riders.includes(i)} onClick={() => setRiders(previous => previous.includes(i) ? previous.filter(x => x !== i) : [...previous, i].sort())}>{FRIENDS[i]}</button>)}</section>)}</div>
    <button type="button" className="brain-primary" disabled={disabled} onClick={() => { act({ riders }); setRiders([]) }}>{en ? `Cross the river · ${riders.length} ${riders.length === 1 ? 'passenger' : 'passengers'}` : `חציית הנהר · ${riders.length} נוסעים`}</button>
  </>
}
function Answer({ p, act, disabled, en }) {
  const { NAMES, PEOPLE } = tables(en ? 'en' : 'he')
  const [value, setValue] = useState('')
  const submit = event => { event.preventDefault(); if (value.trim()) act({ answer: p.kind === 'code' ? value.trim() : Number(value) }) }
  if (p.kind === 'wires') return <><p>{en ? <>The wires are in a secret order, in places 1-{p.n}. Which wire is in place <strong>{p.position + 1}</strong>? The buttons below are answer options, not the secret order.</> : <>החוטים מסודרים בסדר סודי, במקומות 1–{p.n}. איזה חוט נמצא במקום <strong>{p.position + 1}</strong>? הכפתורים למטה הם אפשרויות תשובה, לא הסדר הסודי.</>}</p><ul className="brain-clues">{p.clues.map((c, i) => <li key={i}>{en ? (c.type === 'before' ? `${NAMES[c.a]} comes before ${NAMES[c.b]}.` : c.type === 'adjacent' ? `${NAMES[c.a]} is right next to ${NAMES[c.b]}.` : `${NAMES[c.a]} is not in place ${c.position + 1}.`) : c.type === 'before' ? `${NAMES[c.a]} נמצא לפני ${NAMES[c.b]}.` : c.type === 'adjacent' ? `${NAMES[c.a]} צמוד ל־${NAMES[c.b]}.` : `${NAMES[c.a]} לא נמצא במקום ${c.position + 1}.`}</li>)}</ul><div className="brain-choices">{range(p.n).map(i => <button type="button" key={i} disabled={disabled} style={{ borderColor: COLORS[i] }} onClick={() => act({ answer: i })}>✂ {NAMES[i]}</button>)}</div></>
  if (p.kind === 'scales') return <><p>{en ? 'One ball is heavier. All the others weigh the same. Which ball is the heavy one?' : 'כדור אחד כבד יותר. כל האחרים שווים. מי הכדור הכבד?'}</p><ul className="brain-clues">{p.weighings.map((w, i) => <li key={i}>{en ? <>Balls {w.left.map(x => x + 1).join(', ')} against balls {w.right.map(x => x + 1).join(', ')}: <strong>{w.result === 0 ? 'balanced' : w.result > 0 ? 'the first group is heavier' : 'the second group is heavier'}</strong>.</> : <>כדורים {w.left.map(x => x + 1).join(', ')} לעומת כדורים {w.right.map(x => x + 1).join(', ')}: <strong>{w.result === 0 ? 'משקל שווה' : w.result > 0 ? 'הקבוצה הראשונה כבדה יותר' : 'הקבוצה השנייה כבדה יותר'}</strong>.</>}</li>)}</ul><div className="brain-choices">{range(p.n).map(i => <button type="button" key={i} disabled={disabled} onClick={() => act({ answer: i })}>{en ? 'Ball' : 'כדור'} {i + 1}</button>)}</div></>
  if (p.kind === 'liars') return <><p>{en ? <>One of the friends hid a star. Exactly <strong>{p.truths}</strong> of the statements are true. Who hid it?</> : <>אחד החברים החביא כוכב. בדיוק <strong>{p.truths}</strong> מהמשפטים נכונים. מי החביא אותו?</>}</p><ul className="brain-clues">{p.statements.map((s, i) => <li key={i}>{en ? `${PEOPLE[i]} says: "${PEOPLE[s.target]} ${s.not ? 'did not hide' : 'hid'} the star".` : `${PEOPLE[i]} אומר/ת: ״${PEOPLE[s.target]} ${s.not ? 'לא החביא/ה' : 'החביא/ה'} את הכוכב״.`}</li>)}</ul><div className="brain-choices">{range(p.n).map(i => <button type="button" key={i} disabled={disabled} onClick={() => act({ answer: i })}>{PEOPLE[i]}</button>)}</div></>
  return <>
    {p.kind === 'code' ? <><p>{en ? 'Find a code of 3 different digits from 0-5. The clues give an exact number of digits; "in another place" does not include digits that are already in the right place.' : 'מצאו קוד של 3 ספרות שונות מתוך 0–5. הרמזים מציינים מספר מדויק של ספרות; ״מקום אחר״ לא כולל ספרות שכבר במקום הנכון.'}</p><ul className="brain-clues">{p.clues.map((c, i) => <li key={i}><b dir="ltr">{c.guess.join(' ')}</b> — {en ? `${c.exact} in the right place, ${c.misplaced} in another place.` : `${c.exact} במקום הנכון, ${c.misplaced} במקום אחר.`}</li>)}</ul></> : <><p>{en ? <>Every row, column and diagonal must add up to <strong>{p.sum}</strong>. What is the missing number?</> : <>כל שורה, טור ואלכסון צריכים להסתכם ב־<strong>{p.sum}</strong>. מה המספר החסר?</>}</p><div className="brain-grid brain-magic" style={{ '--cols': 3 }} dir="ltr">{p.grid.map((v, i) => <span key={i}>{v ?? '?'}</span>)}</div></>}
    <form onSubmit={submit} className="brain-answer"><label htmlFor="brain-answer">{p.kind === 'code' ? (en ? 'Your code' : 'הקוד שלכם') : (en ? 'The missing number' : 'המספר החסר')}</label><input id="brain-answer" value={value} onChange={e => setValue(e.target.value)} inputMode="numeric" autoComplete="off" maxLength={p.kind === 'code' ? 3 : 5} disabled={disabled} dir="ltr" /><button type="submit" disabled={disabled || !value.trim()}>{en ? 'Check answer' : 'בדיקת תשובה'}</button></form>
  </>
}
export default function PuzzleBoard({ p, state, act, disabled, lang = 'he' }) {
  const en = lang === 'en'
  if (p.kind === 'matches') return <Matches {...{ p, state, act, disabled, en }} />
  if (p.kind === 'water') return <Water {...{ p, state, act, disabled, en }} />
  if (p.kind === 'river') return <River {...{ p, state, act, disabled, en }} />
  if (p.kind === 'lights') return <><p className="brain-goal">{en ? 'Turn off all the lights 💡' : 'כבו את כל הנורות 💡'}</p><p className="brain-howto">{en ? 'Each press toggles the light and its four neighbors.' : 'כל לחיצה מחליפה את הנורה ואת ארבע השכנות שלה.'}</p><div className="brain-grid brain-lights" dir="ltr" style={{ '--cols': p.size }}>{state.map((v, cell) => <button type="button" key={cell} className={v ? 'brain-light on' : 'brain-light'} disabled={disabled} aria-pressed={!!v} aria-label={en ? `Light ${cell + 1}, ${v ? 'on' : 'off'}` : `נורה ${cell + 1}, ${v ? 'דלוקה' : 'כבויה'}`} onClick={() => act({ cell })}><span aria-hidden="true">{v ? '💡' : ''}</span></button>)}</div></>
  if (p.kind === 'frogs') return <><p>{en ? 'Swap sides: green frogs move right and purple frogs move left, by square number. Step into an empty square, or jump over a frog of the other color.' : 'החליפו צדדים: ירוקות נעות ימינה וסגולות שמאלה לפי מספרי המשבצות. צעד למשבצת ריקה, או קפיצה מעל צפרדע בצבע האחר.'}</p><div className="brain-frogs" dir="ltr">{state.map((v, from) => <button type="button" key={from} disabled={disabled || !v} onClick={() => act({ from })} aria-label={en ? `Square ${from + 1}: ${v === 1 ? 'green, moving right' : v === -1 ? 'purple, moving left' : 'empty'}` : `משבצת ${from + 1}: ${v === 1 ? 'ירוקה ימינה' : v === -1 ? 'סגולה שמאלה' : 'ריקה'}`} className={v === 1 ? 'green' : v === -1 ? 'purple' : ''}><small>{from + 1}</small>{v === 1 ? '🐸→' : v === -1 ? '←🐸' : '○'}</button>)}</div></>
  if (p.kind === 'laser') {
    const beam = traceLaser(p, state)
    return <><p>{en ? `Turn a mirror by tapping it to guide the light to the target. The beam enters from the left in row ${p.entry + 1}; the target is ${p.target.row < 0 ? 'above' : 'below'} column ${p.target.col + 1}.` : `סובבו מראה בלחיצה כדי להוביל את האור ליעד. הקרן נכנסת משמאל בשורה ${p.entry + 1}; היעד ${p.target.row < 0 ? 'מעל' : 'מתחת'} לעמודה ${p.target.col + 1}.`}</p><div className="brain-grid brain-laser" dir="ltr" style={{ '--cols': p.size }}>{state.map((v, cell) => <button type="button" key={cell} disabled={disabled || !v} className={beam.path.includes(cell) ? 'beam' : ''} onClick={() => act({ cell })} aria-label={en ? `Cell ${cell + 1}${v ? ', rotates a mirror' : ''}` : `תא ${cell + 1}${v ? ', סיבוב מראה' : ''}`}>{v === 1 ? '╱' : v === 2 ? '╲' : cell === p.entry * p.size ? '→' : '·'}</button>)}</div><p>{en ? `🎯 Target: column ${p.target.col + 1}, ${p.target.row < 0 ? 'top' : 'bottom'}` : `🎯 יעד: עמודה ${p.target.col + 1}, ${p.target.row < 0 ? 'למעלה' : 'למטה'}`}</p></>
  }
  return <Answer {...{ p, act, disabled, en }} />
}