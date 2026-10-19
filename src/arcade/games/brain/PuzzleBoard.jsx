import { NAMES, FRIENDS, PEOPLE } from './hintText.js'
import { useState } from 'react'
import { range } from '../../logic/brain/core.js'
import { traceLaser } from '../../logic/brain/deduction.js'

const COLORS = ['#ba294c', '#2759bb', '#227548', '#a75106', '#7949ab', '#007b85']
const SEGMENTS = [[1, 0], [2, 1], [2, 3], [1, 4], [0, 3], [0, 1], [1, 2]]
function Digit({ mask }) {
  return <svg width="34" height="58" viewBox="0 0 60 100" aria-hidden="true">{[[12, 5, 36, 6], [49, 13, 6, 32], [49, 55, 6, 32], [12, 89, 36, 6], [5, 55, 6, 32], [5, 13, 6, 32], [12, 47, 36, 6]].map(([x, y, width, height], i) => <rect key={i} {...{ x, y, width, height }} rx="3" fill={mask & (1 << i) ? '#934625' : '#e3d9ca'} />)}</svg>
}
function Matches({ p, state, act, disabled }) {
  const [digit, setDigit] = useState(0), [from, setFrom] = useState(null)
  const choose = cell => {
    const occupied = !!(state.mask & (1 << cell))
    if (p.mode === 'remove') { if (occupied) act({ from: cell }); return }
    if (occupied) setFrom(from === cell ? null : cell)
    else if (from !== null) { act({ from, to: cell }); setFrom(null) }
  }
  return <>
    <p>צריך {p.mode === 'remove' ? 'להסיר' : 'להזיז'} בדיוק {p.budget - state.used} גפרורים כדי לקבל תרגיל נכון. סימני החשבון קבועים.</p>
    <div className="brain-equation" dir="ltr" aria-label="בחרו ספרה לעריכת הגפרורים">{range(3).map(i => <span key={i}><button type="button" aria-pressed={digit === i} aria-label={`עריכת ספרה ${i + 1}`} onClick={() => setDigit(i)}><Digit mask={(state.mask >> (i * 7)) & 127} /></button>{i < 2 && <b>{i === 0 ? p.operator : '='}</b>}</span>)}</div>
    <p>{p.mode === 'remove' ? 'לחצו על הגפרור שתרצו להסיר.' : from === null ? 'בחרו גפרור, ואז מקום ריק. אפשר לעבור בין הספרות.' : `גפרור ${from + 1} נבחר. בחרו מקום ריק או גפרור אחר.`}</p>
    <div className="brain-digit" dir="ltr">{SEGMENTS.map(([x, y], i) => {
      const cell = digit * 7 + i, lit = !!(state.mask & (1 << cell))
      return <button type="button" key={cell} disabled={disabled} className={`${lit ? 'lit' : ''} ${from === cell ? 'selected' : ''}`} style={{ gridColumn: x + 1, gridRow: y + 1 }} onClick={() => choose(cell)} aria-label={`${lit ? 'גפרור' : 'מקום'} מספר ${cell + 1}`} aria-pressed={from === cell}><small>{cell + 1}</small><span aria-hidden="true">{[0, 3, 6].includes(i) ? '━' : '┃'}</span></button>
    })}</div>
  </>
}
function Water({ p, state, act, disabled }) {
  const [source, setSource] = useState(null)
  return <><p>המטרה: בדיוק <strong>{p.target} ליטרים</strong> באחד הכלים. מוזגים עד שהמקור מתרוקן או שהיעד מלא.</p><div className="brain-jugs">{p.capacities.map((capacity, i) => <section key={i}>
    <button type="button" className={`brain-jug ${source === i ? 'selected' : ''}`} disabled={disabled} aria-label={`כלי ${i + 1}: ${state[i]} מתוך ${capacity} ליטרים`} aria-pressed={source === i} onClick={() => { if (source === null || source === i) setSource(source === i ? null : i); else { act({ from: source, to: i }); setSource(null) } }}>
      <span className="brain-water" style={{ height: `${state[i] / capacity * 100}%` }} /><strong>{state[i]} / {capacity}</strong><small>כלי {i + 1}</small>
    </button>
    {p.tap && <div className="brain-tools"><button type="button" disabled={disabled || state[i] === capacity} onClick={() => act({ fill: i })}>מילוי {i + 1}</button><button type="button" disabled={disabled || !state[i]} onClick={() => act({ empty: i })}>ריקון {i + 1}</button></div>}
  </section>)}</div><p>{source === null ? 'למזיגה: בחרו כלי מקור ואז כלי יעד.' : `כלי ${source + 1} נבחר. עכשיו בחרו לאן למזוג.`}</p></>
}
function River({ p, state, act, disabled }) {
  const [riders, setRiders] = useState([]), boat = (state >> p.n) & 1
  return <><p>העבירו את כולם לגדה השנייה. מבוגר חותר תמיד בסירה; יש מקום לעוד {p.capacity} נוסעים. מותר למבוגר לחזור לבדו.</p>
    <details open><summary>מי לא יכול להישאר יחד ללא המבוגר?</summary><ul>{p.conflicts.map(([a, b]) => <li key={`${a}-${b}`}>{FRIENDS[a]} ו־{FRIENDS[b]}</li>)}</ul></details>
    <div className="brain-banks">{[0, 1].map(side => <section key={side}><h3>{side ? 'הגדה השנייה' : 'גדת ההתחלה'} {boat === side && '🚣'}</h3>{range(p.n).filter(i => ((state >> i) & 1) === side).map(i => <button type="button" key={i} disabled={disabled || boat !== side} aria-pressed={riders.includes(i)} onClick={() => setRiders(previous => previous.includes(i) ? previous.filter(x => x !== i) : [...previous, i].sort())}>{FRIENDS[i]}</button>)}</section>)}</div>
    <button type="button" className="brain-primary" disabled={disabled} onClick={() => { act({ riders }); setRiders([]) }}>חציית הנהר · {riders.length} נוסעים</button>
  </>
}
function Answer({ p, act, disabled }) {
  const [value, setValue] = useState('')
  const submit = event => { event.preventDefault(); if (value.trim()) act({ answer: p.kind === 'code' ? value.trim() : Number(value) }) }
  if (p.kind === 'wires') return <><p>החוטים מסודרים בסדר סודי, במקומות 1–{p.n}. איזה חוט נמצא במקום <strong>{p.position + 1}</strong>? הכפתורים למטה הם אפשרויות תשובה, לא הסדר הסודי.</p><ul className="brain-clues">{p.clues.map((c, i) => <li key={i}>{c.type === 'before' ? `${NAMES[c.a]} נמצא לפני ${NAMES[c.b]}.` : c.type === 'adjacent' ? `${NAMES[c.a]} צמוד ל־${NAMES[c.b]}.` : `${NAMES[c.a]} לא נמצא במקום ${c.position + 1}.`}</li>)}</ul><div className="brain-choices">{range(p.n).map(i => <button type="button" key={i} disabled={disabled} style={{ borderColor: COLORS[i] }} onClick={() => act({ answer: i })}>✂ {NAMES[i]}</button>)}</div></>
  if (p.kind === 'scales') return <><p>כדור אחד כבד יותר. כל האחרים שווים. מי הכדור הכבד?</p><ul className="brain-clues">{p.weighings.map((w, i) => <li key={i}>כדורים {w.left.map(x => x + 1).join(', ')} לעומת כדורים {w.right.map(x => x + 1).join(', ')}: <strong>{w.result === 0 ? 'משקל שווה' : w.result > 0 ? 'הקבוצה הראשונה כבדה יותר' : 'הקבוצה השנייה כבדה יותר'}</strong>.</li>)}</ul><div className="brain-choices">{range(p.n).map(i => <button type="button" key={i} disabled={disabled} onClick={() => act({ answer: i })}>כדור {i + 1}</button>)}</div></>
  if (p.kind === 'liars') return <><p>אחד החברים החביא כוכב. בדיוק <strong>{p.truths}</strong> מהמשפטים נכונים. מי החביא אותו?</p><ul className="brain-clues">{p.statements.map((s, i) => <li key={i}>{PEOPLE[i]} אומר/ת: ״{PEOPLE[s.target]} {s.not ? 'לא החביא/ה' : 'החביא/ה'} את הכוכב״.</li>)}</ul><div className="brain-choices">{range(p.n).map(i => <button type="button" key={i} disabled={disabled} onClick={() => act({ answer: i })}>{PEOPLE[i]}</button>)}</div></>
  return <>
    {p.kind === 'code' ? <><p>מצאו קוד של 3 ספרות שונות מתוך 0–5. הרמזים מציינים מספר מדויק של ספרות; ״מקום אחר״ לא כולל ספרות שכבר במקום הנכון.</p><ul className="brain-clues">{p.clues.map((c, i) => <li key={i}><b dir="ltr">{c.guess.join(' ')}</b> — {c.exact} במקום הנכון, {c.misplaced} במקום אחר.</li>)}</ul></> : <><p>כל שורה, טור ואלכסון צריכים להסתכם ב־<strong>{p.sum}</strong>. מה המספר החסר?</p><div className="brain-grid brain-magic" style={{ '--cols': 3 }} dir="ltr">{p.grid.map((v, i) => <span key={i}>{v ?? '?'}</span>)}</div></>}
    <form onSubmit={submit} className="brain-answer"><label htmlFor="brain-answer">{p.kind === 'code' ? 'הקוד שלכם' : 'המספר החסר'}</label><input id="brain-answer" value={value} onChange={e => setValue(e.target.value)} inputMode="numeric" autoComplete="off" maxLength={p.kind === 'code' ? 3 : 5} disabled={disabled} dir="ltr" /><button type="submit" disabled={disabled || !value.trim()}>בדיקת תשובה</button></form>
  </>
}
export default function PuzzleBoard({ p, state, act, disabled }) {
  if (p.kind === 'matches') return <Matches {...{ p, state, act, disabled }} />
  if (p.kind === 'water') return <Water {...{ p, state, act, disabled }} />
  if (p.kind === 'river') return <River {...{ p, state, act, disabled }} />
  if (p.kind === 'lights') return <><p>כבו את כל הנורות. כל לחיצה מחליפה את הנורה ואת ארבע השכנות הישירות שלה.</p><div className="brain-grid" dir="ltr" style={{ '--cols': p.size }}>{state.map((v, cell) => <button type="button" key={cell} className={v ? 'brain-light on' : 'brain-light'} disabled={disabled} aria-pressed={!!v} aria-label={`נורה ${cell + 1}, ${v ? 'דלוקה' : 'כבויה'}`} onClick={() => act({ cell })}>{v ? '☀' : '·'}</button>)}</div></>
  if (p.kind === 'frogs') return <><p>החליפו צדדים: ירוקות נעות ימינה וסגולות שמאלה לפי מספרי המשבצות. צעד למשבצת ריקה, או קפיצה מעל צפרדע בצבע האחר.</p><div className="brain-frogs" dir="ltr">{state.map((v, from) => <button type="button" key={from} disabled={disabled || !v} onClick={() => act({ from })} aria-label={`משבצת ${from + 1}: ${v === 1 ? 'ירוקה ימינה' : v === -1 ? 'סגולה שמאלה' : 'ריקה'}`} className={v === 1 ? 'green' : v === -1 ? 'purple' : ''}><small>{from + 1}</small>{v === 1 ? '🐸→' : v === -1 ? '←🐸' : '○'}</button>)}</div></>
  if (p.kind === 'laser') {
    const beam = traceLaser(p, state)
    return <><p>סובבו מראה בלחיצה כדי להוביל את האור ליעד. הקרן נכנסת משמאל בשורה {p.entry + 1}; היעד {p.target.row < 0 ? 'מעל' : 'מתחת'} לעמודה {p.target.col + 1}.</p><div className="brain-grid brain-laser" dir="ltr" style={{ '--cols': p.size }}>{state.map((v, cell) => <button type="button" key={cell} disabled={disabled || !v} className={beam.path.includes(cell) ? 'beam' : ''} onClick={() => act({ cell })} aria-label={`תא ${cell + 1}${v ? ', סיבוב מראה' : ''}`}>{v === 1 ? '╱' : v === 2 ? '╲' : cell === p.entry * p.size ? '→' : '·'}</button>)}</div><p>🎯 יעד: עמודה {p.target.col + 1}, {p.target.row < 0 ? 'למעלה' : 'למטה'}</p></>
  }
  return <Answer {...{ p, act, disabled }} />
}
