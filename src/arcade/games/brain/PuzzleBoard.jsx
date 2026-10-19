import { NAMES, FRIENDS, PEOPLE } from './hintText.js'
import { useState } from 'react'
import { range } from '../../logic/brain/core.js'
import { traceLaser } from '../../logic/brain/deduction.js'

const COLORS = ['#ba294c', '#2759bb', '#227548', '#a75106', '#7949ab', '#007b85']
const SEGMENTS = [[1, 0], [2, 1], [2, 3], [1, 4], [0, 3], [0, 1], [1, 2]]
function Digit({ mask }) {
  return <svg className="brain-digit-preview" viewBox="0 0 60 100" aria-hidden="true">{[[14, 7, 46, 7], [49, 14, 49, 44], [49, 56, 49, 86], [14, 92, 46, 92], [8, 56, 8, 86], [8, 14, 8, 44], [14, 50, 46, 50]].map(([x1, y1, x2, y2], i) => <g key={i} className={mask & (1 << i) ? 'is-on' : ''}><line {...{ x1, y1, x2, y2 }} /><circle cx={x2} cy={y2} r="5" /></g>)}</svg>
}
const Mission = ({ icon, title, children }) => <div className="brain-mission"><span className="brain-mission-icon" aria-hidden="true">{icon}</span><div><small>המשימה שלכם</small><h3>{title}</h3>{children}</div></div>
function Matches({ p, state, act, disabled }) {
  const [digit, setDigit] = useState(0), [from, setFrom] = useState(null)
  const choose = cell => {
    const occupied = !!(state.mask & (1 << cell))
    if (p.mode === 'remove') { if (occupied) act({ from: cell }); return }
    if (occupied) setFrom(from === cell ? null : cell)
    else if (from !== null) { act({ from, to: cell }); setFrom(null) }
  }
  const left = p.budget - state.used
  return <>
    <section className={`brain-match-workbench ${from !== null ? 'is-carrying' : ''}`}>
      <div className="brain-match-toolbar"><span>🔥 {p.mode === 'remove' ? 'הסירו' : 'הזיזו'} {left} {left === 1 ? 'גפרור' : 'גפרורים'} כדי לתקן את התרגיל</span><b>{left} מהלכים נותרו</b></div>
      <p className="brain-match-pick">לחצו על אחת הספרות כדי לערוך אותה</p>
      <div className="brain-equation" dir="ltr" aria-label="בחרו ספרה לעריכת הגפרורים">{range(3).map(i => <span key={i}><button type="button" className={digit === i ? 'active' : ''} aria-pressed={digit === i} aria-label={`עריכת ספרה ${i + 1}`} onClick={() => setDigit(i)}><Digit mask={(state.mask >> (i * 7)) & 127} /><small>{digit === i ? 'נבחרה' : 'עריכה'}</small></button>{i < 2 && <b>{i === 0 ? p.operator : '='}</b>}</span>)}</div>
      <div className="brain-match-step" aria-live="polite"><strong>{from === null ? '1' : '2'}</strong><span>{p.mode === 'remove' ? 'לחצו על גפרור דולק כדי להסיר אותו' : from === null ? 'לחצו על גפרור דולק כדי להרים אותו' : 'הגפרור ביד — לחצו על מקום זוהר כדי להניח אותו'}</span></div>
      <div className="brain-digit-wrap">
        <span className="brain-digit-label">הספרה שבחרתם</span>
        <div className="brain-digit" dir="ltr">{SEGMENTS.map(([x, y], i) => {
          const cell = digit * 7 + i, lit = !!(state.mask & (1 << cell))
          return <button type="button" key={cell} disabled={disabled} className={`${lit ? 'lit' : 'target'} ${from === cell ? 'selected' : ''} ${[0, 3, 6].includes(i) ? 'horizontal' : 'vertical'}`} style={{ gridColumn: x + 1, gridRow: y + 1 }} onClick={() => choose(cell)} aria-label={`${lit ? 'גפרור' : 'מקום'} מספר ${cell + 1}`} aria-pressed={from === cell}><span aria-hidden="true" />{from === cell && <em aria-hidden="true">מרימים</em>}</button>
        })}</div>
      </div>
      <p className="brain-match-tip">💡 אפשר לעבור בין הספרות גם אחרי שהרמתם גפרור</p>
    </section>
  </>
}
function Water({ p, state, act, disabled }) {
  const [source, setSource] = useState(null)
  return <><Mission icon="💧" title={`מדדו בדיוק ${p.target} ליטרים`}><p>הכמות יכולה להישאר בכל אחד מהכדים.</p></Mission><div className="brain-jugs">{p.capacities.map((capacity, i) => <section key={i}>
    <button type="button" className={`brain-jug ${source === i ? 'selected' : ''}`} disabled={disabled} aria-label={`כלי ${i + 1}: ${state[i]} מתוך ${capacity} ליטרים`} aria-pressed={source === i} onClick={() => { if (source === null || source === i) setSource(source === i ? null : i); else { act({ from: source, to: i }); setSource(null) } }}>
      <span className="brain-jug-handle" aria-hidden="true"/><span className="brain-jug-marks" aria-hidden="true"/><span className="brain-water" style={{ height: `${state[i] / capacity * 100}%` }} /><strong>{state[i]} ל׳</strong><small>קיבולת {capacity} ל׳</small>{source === i && <em>מוזגים מכאן</em>}
    </button>
    {p.tap && <div className="brain-tools"><button type="button" disabled={disabled || state[i] === capacity} onClick={() => act({ fill: i })}>מילוי {i + 1}</button><button type="button" disabled={disabled || !state[i]} onClick={() => act({ empty: i })}>ריקון {i + 1}</button></div>}
  </section>)}</div><p className="brain-now"><span>עכשיו:</span> {source === null ? 'בחרו כד, או לחצו על מילוי וריקון' : `כד ${source + 1} נבחר — לחצו על הכד שאליו תרצו למזוג`}</p></>
}
function River({ p, state, act, disabled }) {
  const [riders, setRiders] = useState([]), boat = (state >> p.n) & 1
  return <><Mission icon="🚣" title="העבירו את כולם לגדה השנייה"><p>המבוגר חותר, ובסירה יש מקום לעוד {p.capacity} נוסעים.</p></Mission>
    <details open><summary>מי לא יכול להישאר יחד ללא המבוגר?</summary><ul>{p.conflicts.map(([a, b]) => <li key={`${a}-${b}`}>{FRIENDS[a]} ו־{FRIENDS[b]}</li>)}</ul></details>
    <div className="brain-river-scene"><div className="brain-bank start"><h3>גדת ההתחלה</h3>{range(p.n).filter(i => ((state >> i) & 1) === 0).map(i => <button type="button" key={i} disabled={disabled || boat !== 0} aria-label={FRIENDS[i]} aria-pressed={riders.includes(i)} onClick={() => setRiders(previous => previous.includes(i) ? previous.filter(x => x !== i) : [...previous, i].sort())}><span aria-hidden="true">🧒</span>{FRIENDS[i]}</button>)}</div><div className="brain-river"><span className={`brain-boat side-${boat}`}>🚣</span><i/><i/><i/></div><div className="brain-bank finish"><h3>הגדה השנייה</h3>{range(p.n).filter(i => ((state >> i) & 1) === 1).map(i => <button type="button" key={i} disabled={disabled || boat !== 1} aria-label={FRIENDS[i]} aria-pressed={riders.includes(i)} onClick={() => setRiders(previous => previous.includes(i) ? previous.filter(x => x !== i) : [...previous, i].sort())}><span aria-hidden="true">🧒</span>{FRIENDS[i]}</button>)}</div></div>
    <p className="brain-now"><span>עכשיו:</span> בחרו עד {p.capacity} נוסעים מהגדה שבה נמצאת הסירה</p><button type="button" className="brain-primary brain-cross" aria-label={`חציית הנהר · ${riders.length} נוסעים`} disabled={disabled || riders.length > p.capacity} onClick={() => { act({ riders }); setRiders([]) }}>🚣 חוצים עם {riders.length ? riders.map(i => FRIENDS[i]).join(' ו־') : 'המבוגר בלבד'}</button>
  </>
}
function Answer({ p, act, disabled }) {
  const [value, setValue] = useState('')
  const submit = event => { event.preventDefault(); if (value.trim()) act({ answer: p.kind === 'code' ? value.trim() : Number(value) }) }
  if (p.kind === 'wires') return <><Mission icon="💣" title="נטרלו את הפצצה הדמיונית"><p>החוט הנכון נמצא במקום {p.position + 1} בסדר הנסתר. הרמזים מובילים לתשובה יחידה.</p></Mission><div className="brain-bomb" aria-label="לוח נטרול הפצצה"><i className="screw s1"/><i className="screw s2"/><i className="screw s3"/><i className="screw s4"/><header><span>⚠ מערכת דרוכה</span><time aria-label="שעון משימה דקורטיבי"><i/>01<b>:</b>30</time><strong>יעד: חוט במקום {p.position + 1}</strong><small>שעון המתח אינו פוסל את החידה</small></header><section><h4>לוח הרמזים</h4><ul className="brain-clues">{p.clues.map((c, i) => <li key={i}><span>{i + 1}</span>{c.type === 'before' ? `${NAMES[c.a]} נמצא לפני ${NAMES[c.b]}.` : c.type === 'adjacent' ? `${NAMES[c.a]} צמוד ל־${NAMES[c.b]}.` : `${NAMES[c.a]} לא נמצא במקום ${c.position + 1}.`}</li>)}</ul></section><p className="brain-now"><span>לבחירה:</span> עקבו אחרי החוטים ולחצו על החוט הנכון</p><div className="brain-wires">{range(p.n).map(i => <button type="button" key={i} disabled={disabled} aria-label={`✂ ${NAMES[i]}`} style={{ '--wire': COLORS[i], '--bend': `${i % 2 ? 8 : -8}px` }} onClick={() => act({ answer: i })}><span className="brain-wire-port" aria-hidden="true">{i + 1}</span><i/><b>{NAMES[i]}</b><small>✂ לחיתוך</small></button>)}</div><footer><span>🔋</span><i/><i/><i/><b>LOGIC UNIT</b></footer></div></>
  if (p.kind === 'scales') return <><Mission icon="⚖️" title="מצאו את הכדור הכבד"><p>כל הכדורים האחרים שוקלים בדיוק אותו דבר.</p></Mission><div className="brain-weighings">{p.weighings.map((w, i) => <div key={i} className={`brain-scale result-${Math.sign(w.result)}`}><div><span>{w.left.map(x => `●${x + 1}`).join(' ')}</span></div><b>⚖️</b><div><span>{w.right.map(x => `●${x + 1}`).join(' ')}</span></div><small>{w.result === 0 ? 'שווה' : w.result > 0 ? 'צד ימין בתצוגה כבד' : 'צד שמאל בתצוגה כבד'}</small></div>)}</div><div className="brain-choices balls">{range(p.n).map(i => <button type="button" key={i} disabled={disabled} aria-label={`כדור ${i + 1}`} onClick={() => act({ answer: i })}><span aria-hidden="true">●</span> כדור {i + 1}</button>)}</div></>
  if (p.kind === 'liars') return <><Mission icon="🕵️" title="מי החביא את הכוכב?"><p>בדיוק {p.truths} מהמשפטים נכונים.</p></Mission><div className="brain-people">{p.statements.map((s, i) => <article key={i}><span>🙂</span><b>{PEOPLE[i]}</b><p>״{PEOPLE[s.target]} {s.not ? 'לא החביא/ה' : 'החביא/ה'} את הכוכב״</p></article>)}</div><div className="brain-choices">{range(p.n).map(i => <button type="button" key={i} disabled={disabled} aria-label={PEOPLE[i]} onClick={() => act({ answer: i })}>⭐ {PEOPLE[i]}</button>)}</div></>
  return <>
    {p.kind === 'code' ? <><Mission icon="🔐" title="פצחו קוד בן 3 ספרות"><p>כל ספרה שונה, ומשתמשים רק בספרות 0–5.</p></Mission><div className="brain-code-clues">{p.clues.map((c, i) => <div key={i}><b dir="ltr">{c.guess.map(n => <span key={n}>{n}</span>)}</b><p><em>{c.exact}</em> במקום הנכון <i>•</i> <em>{c.misplaced}</em> במקום אחר</p></div>)}</div></> : <><Mission icon="🔢" title={`השלימו סכום ${p.sum}`}><p>כל שורה, טור ואלכסון צריכים להגיע לאותו סכום.</p></Mission><div className="brain-grid brain-magic" style={{ '--cols': 3 }} dir="ltr">{p.grid.map((v, i) => <span key={i} className={v == null ? 'missing' : ''}>{v ?? '?'}</span>)}</div></>}
    <form onSubmit={submit} className="brain-answer"><label htmlFor="brain-answer">{p.kind === 'code' ? 'הקוד שלכם' : 'המספר החסר'}</label><input id="brain-answer" value={value} onChange={e => setValue(e.target.value)} inputMode="numeric" autoComplete="off" maxLength={p.kind === 'code' ? 3 : 5} disabled={disabled} dir="ltr" /><button type="submit" disabled={disabled || !value.trim()}>בדיקת תשובה</button></form>
  </>
}
export default function PuzzleBoard({ p, state, act, disabled }) {
  if (p.kind === 'matches') return <Matches {...{ p, state, act, disabled }} />
  if (p.kind === 'water') return <Water {...{ p, state, act, disabled }} />
  if (p.kind === 'river') return <River {...{ p, state, act, disabled }} />
  if (p.kind === 'lights') return <><Mission icon="💡" title="כבו את כל הנורות"><p>לחיצה משנה את הנורה ואת השכנות הישירות שלה. האלכסונים לא משתנים.</p></Mission><p className="brain-now"><span>נסו:</span> לחצו על נורה וראו אילו נורות סביבה מתחלפות</p><div className="brain-grid brain-lights" dir="ltr" style={{ '--cols': p.size }}>{state.map((v, cell) => <button type="button" key={cell} className={v ? 'brain-light on' : 'brain-light'} disabled={disabled} aria-pressed={!!v} aria-label={`נורה ${cell + 1}, ${v ? 'דלוקה' : 'כבויה'}`} onClick={() => act({ cell })}><span aria-hidden="true">💡</span></button>)}</div></>
  if (p.kind === 'frogs') return <><Mission icon="🐸" title="החליפו בין שתי קבוצות הצפרדעים"><p>ירוקות נעות ימינה וסגולות שמאלה. אפשר לצעוד או לקפוץ מעל צבע אחר.</p></Mission><div className="brain-frogs" dir="ltr">{state.map((v, from) => <button type="button" key={from} disabled={disabled || !v} onClick={() => act({ from })} aria-label={`משבצת ${from + 1}: ${v === 1 ? 'ירוקה ימינה' : v === -1 ? 'סגולה שמאלה' : 'ריקה'}`} className={v === 1 ? 'green' : v === -1 ? 'purple' : ''}><small>{from + 1}</small>{v === 1 ? '🐸→' : v === -1 ? '←🐸' : '○'}</button>)}</div></>
  if (p.kind === 'laser') {
    const beam = traceLaser(p, state)
    return <><Mission icon="🪞" title="הובילו את קרן האור אל המטרה"><p>לחצו על מראה כדי לסובב אותה. הקרן מתחילה משמאל בשורה {p.entry + 1}.</p></Mission><div className="brain-grid brain-laser" dir="ltr" style={{ '--cols': p.size }}>{state.map((v, cell) => <button type="button" key={cell} disabled={disabled || !v} className={beam.path.includes(cell) ? 'beam' : ''} onClick={() => act({ cell })} aria-label={`תא ${cell + 1}${v ? ', סיבוב מראה' : ''}`}>{v === 1 ? '╱' : v === 2 ? '╲' : cell === p.entry * p.size ? '➜' : ''}</button>)}</div><p className="brain-target">🎯 המטרה נמצאת בעמודה {p.target.col + 1}, {p.target.row < 0 ? 'למעלה' : 'למטה'}</p></>
  }
  return <Answer {...{ p, act, disabled }} />
}
