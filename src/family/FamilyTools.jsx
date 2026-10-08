import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import { Sheet, T } from '../components/printables/PrintableShell'
import { ROUTINE_TASKS, ACTIVITIES, CAR_GAMES, BINGO_WORDS, MOVES, STORIES, STORY_ANIMALS } from './familyData'
import './family.css'
import '../learn/learn.css'

export const FAMILY_CRUMB = { label: 'בבית עם הילדים', href: '/family' }
const rnd = n => Math.floor(Math.random() * n)
const pick = a => a[rnd(a.length)]
const shuffle = a => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = rnd(i + 1);[x[i], x[j]] = [x[j], x[i]] } return x }
const Chip = ({ on, onClick, children, ...rest }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick} {...rest}>{children}</button>
const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
function Head({ emoji, h1, sub, crumb }) {
  return <>
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, ...(crumb ? [FAMILY_CRUMB, { label: crumb }] : [{ label: FAMILY_CRUMB.label }])]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{emoji} </span>{h1}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">{sub}</p>
  </>
}
const A4 = ({ children }) => <article className="buga-a4"><div className="print-art">{children}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>
function beep(freq = 880, ms = 180) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return
    const ctx = beep.ctx || (beep.ctx = new AC()); const o = ctx.createOscillator(), gn = ctx.createGain()
    o.frequency.value = freq; gn.gain.setValueAtTime(0.0001, ctx.currentTime); gn.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000)
    o.connect(gn).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + ms / 1000 + 0.05)
  } catch { /* no audio */ }
}
function wrapWords(text, max) { const out = []; let cur = ''; for (const w of text.split(' ')) { if (cur && (cur + ' ' + w).length > max) { out.push(cur); cur = w } else cur = cur ? cur + ' ' + w : w } if (cur) out.push(cur); return out }
const mmss = s => { const a = Math.abs(Math.round(s)); return `${s < 0 ? '-' : ''}${Math.floor(a / 60)}:${String(a % 60).padStart(2, '0')}` }

// ── /family ───────────────────────────────
export const FAMILY_SECTIONS = [
  ['/family/what-to-do', '🎲', 'מה עושים היום?', 'רעיון לפעילות לפי מקום, זמן וגיל — בלחיצה'],
  ['/family/morning-routine', '⏰', 'שגרת בוקר עם טיימר', 'משימה אחרי משימה, ויוצאים בזמן — וגם לוח להדפסה'],
  ['/family/bedtime-story', '🌙', 'סיפור לפני השינה עם השם של הילד', 'הילד הוא הגיבור — 6 סיפורים רגועים'],
  ['/stories', '📚', 'ספריית סיפורים לפני השינה', '30 סיפורים מקוריים לפי גיל ונושא — גם עם שם הילד'],
  ['/family/car-games', '🚗', 'משחקים לנסיעה', '14 משחקים בלי כלום ביד — ובינגו נסיעה להדפסה'],
  ['/family/move', '🤸', 'אתגר תנועה', 'קפיצות צפרדע והליכת סרטן — עם טיימר'],
  ['/family/pocket-money', '🐷', 'דמי כיס וחיסכון', 'מחשבון יעד חיסכון, שלוש קופות ודף מעקב'],
]
export function FamilyHub() {
  return <Page>
    <SEO title="בבית עם הילדים — מה עושים היום, שגרת בוקר, סיפור לפני השינה ועוד" description="כלים קטנים להורים: מחולל 'מה עושים היום?', טיימר שגרת בוקר, סיפור לפני השינה עם שם הילד, משחקים לנסיעה, אתגר תנועה ומחשבון דמי כיס. חינם ובעברית." path="/family" />
    <Head emoji="🏡" h1="בבית עם הילדים" sub="כלים קטנים שעושים את היום קצת יותר קל — מהבוקר ועד הסיפור" />
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{FAMILY_SECTIONS.map(([to, e, t, d]) => <Link key={to} to={to} className="wobbly card-lift border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow p-5 text-right"><div className="text-4xl mb-2" aria-hidden="true">{e}</div><h2 className="text-2xl font-bold">{t}</h2><p className="text-[var(--muted-foreground)]">{d}</p></Link>)}</div>
    <div className="mt-12"><SeoBody paragraphs={['יש רגעים קבועים ביום שבהם הורים צריכים קצת עזרה: הבוקר הלחוץ לפני הגן, אחר הצהריים שבו "משעמם לי", הנסיעה הארוכה לסבתא, והסיפור לפני השינה. כאן יש כלי קטן לכל אחד מהרגעים האלה.', 'הכול עובד בטלפון בלי הרשמה ובלי אפליקציה, ורוב הכלים אפשר גם להדפיס — לוח שגרה למקרר, בינגו לנסיעה ודף מעקב לחיסכון.']} related={[{ label: 'לוחות לבית להדפסה', href: '/printables/home-charts' }, { label: 'אוכל לילדים', href: '/food' }, { label: 'לומדים בבית', href: '/learn' }]} /></div>
  </Page>
}

// ── /family/what-to-do ───────────────────────────────
const WHO_OK = { solo: ['solo', 'any'], parent: ['parent', 'any', 'solo'], group: ['group', 'any'] }
export function WhatToDo() {
  const [where, setWhere] = useState('any')
  const [time, setTime] = useState(60)
  const [who, setWho] = useState('parent')
  const [age, setAge] = useState(6)
  const [clean, setClean] = useState(false)
  const [shown, setShown] = useState(null)
  const list = useMemo(() => ACTIVITIES.filter(a => (where === 'any' || a.where === 'any' || a.where === where) && a.time <= time && WHO_OK[who].includes(a.who) && age >= a.age[0] && age <= a.age[1] && (!clean || a.mess === 0)), [where, time, who, age, clean])
  const roll = () => setShown(list.length ? { a: pick(list.filter(x => x !== shown?.a).length ? list.filter(x => x !== shown?.a) : list), k: Date.now() } : null)
  const Card = ({ a }) => <div className="fam-card"><div className="flex items-start gap-3"><span className="text-4xl" aria-hidden="true">{a.e}</span><div><b className="text-lg">{a.t}</b><p className="m-0">{a.d}</p>
    <small className="text-[var(--muted-foreground)]">{a.where === 'out' ? 'בחוץ' : a.where === 'in' ? 'בבית' : 'בבית או בחוץ'} · {a.time === 10 ? 'כ-10 דקות' : a.time === 30 ? 'כחצי שעה' : 'שעה ומעלה'}{a.mess === 2 ? ' · מלכלך קצת' : ''}</small>
    {a.to && <div><Link to={a.to} className="font-bold underline">לפתוח באתר ←</Link></div>}</div></div></div>
  return <Page>
    <SEO title="מה עושים היום עם הילדים? מחולל רעיונות לפעילות בבית ובחוץ" description={`${ACTIVITIES.length} רעיונות לפעילות עם ילדים: בבית או בחוץ, 10 דקות או שעה, לבד או עם חברים. בוחרים גיל ולוחצים — ומקבלים רעיון. גם "בלי בלגן".`} path="/family/what-to-do" />
    <Head emoji="🎲" h1="מה עושים היום?" sub="אמרו לנו איפה, כמה זמן ועם מי — ואנחנו נציע" crumb="מה עושים היום?" />
    <div className="ln-box space-y-3">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="איפה">{[['any', '🏡🌳 לא משנה'], ['in', '🏡 בבית'], ['out', '🌳 בחוץ']].map(([k, l]) => <Chip key={k} on={where === k} onClick={() => setWhere(k)}>{l}</Chip>)}</div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="זמן">{[[10, '⏱️ 10 דקות'], [30, 'חצי שעה'], [60, 'שעה ומעלה']].map(([k, l]) => <Chip key={k} on={time === k} onClick={() => setTime(k)}>{l}</Chip>)}</div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="עם מי">{[['solo', '🧒 לבד'], ['parent', '👨‍👧 עם הורה'], ['group', '👫 כמה ילדים']].map(([k, l]) => <Chip key={k} on={who === k} onClick={() => setWho(k)}>{l}</Chip>)}</div>
      <div className="flex flex-wrap items-center justify-center gap-3"><label className="font-bold">גיל: {age}<input type="range" min="2" max="14" value={age} onChange={e => setAge(+e.target.value)} className="mx-2 align-middle" /></label><Chip on={clean} onClick={() => setClean(!clean)}>🧼 בלי בלגן</Chip></div>
      <div className="text-center"><button type="button" className="fam-roll" onClick={roll}>🎲 {shown ? 'רעיון אחר' : 'מה עושים?'}</button></div>
      {shown && <div key={shown.k} className="fam-pop"><Card a={shown.a} /></div>}
      {!list.length && <p className="text-center font-bold">אין רעיון שמתאים לכל הבחירות — נסו לשנות אחת.</p>}
    </div>
    <h2 className="mt-10 mb-3 text-2xl font-black">כל הרעיונות שמתאימים ({list.length})</h2>
    <div className="grid gap-3 sm:grid-cols-2">{list.map(a => <Card key={a.t} a={a} />)}</div>
    <div className="mt-12"><SeoBody paragraphs={['"משעמם לי" הוא לא תמיד בעיה — לפעמים הוא הרגע שלפני רעיון טוב. אבל כשאין כוח לחשוב, טוב שיש רשימה. המחולל בוחר פעילות אחת שמתאימה למקום, לזמן, לגיל ולמספר הילדים.', 'יש כאן פעילויות שקטות (צביעה, פאזל, כתיבת ספר קטן), פעילויות תנועה (מסלול מכשולים, ריקוד פסלים), מטבח ומדע, ויציאות החוצה. סמנו "בלי בלגן" כשאין כוח לנקות אחר כך.']} faq={[{ q: 'מה עושים עם ילד משועמם בבית?', a: 'מציעים שתיים-שלוש אפשרויות ונותנים לו לבחור — בחירה מגבירה את המוטיבציה. פעילויות פתוחות כמו מבצר כריות, ספר קטן או עיר מקרטון מחזיקות הכי הרבה זמן.' }]} related={[{ label: 'משחקים לנסיעה', href: '/family/car-games' }, { label: 'אתגר תנועה', href: '/family/move' }, { label: 'דפי צביעה', href: '/printables/coloring' }]} /></div>
  </Page>
}

// ── /family/morning-routine ───────────────────────────────
function RoutinePrint({ kind, tasks, name }) {
  const days = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳']
  return <article className="buga-flow fam-print" dir="rtl"><h2>{kind === 'morning' ? 'שגרת הבוקר שלי' : 'שגרת הערב שלי'}{name ? ` — ${name}` : ''}</h2>
    <table><thead><tr><th>מה עושים</th><th>דקות</th>{days.map(d => <th key={d} style={{ textAlign: 'center' }}>{d}</th>)}</tr></thead>
      <tbody>{tasks.map((t, i) => <tr key={t[0]}><td style={{ fontSize: '14pt', fontWeight: 700, height: '12mm' }}>{i + 1}. {t[2]}</td><td style={{ textAlign: 'center' }}>{t[3]}</td>{days.map(d => <td key={d} style={{ textAlign: 'center', fontSize: '16pt' }}>◯</td>)}</tr>)}</tbody></table>
    <p>כל משימה שסיימתי — צובע/ת את העיגול. שבוע מלא = כל הכבוד!</p></article>
}
export function MorningRoutine() {
  const [kind, setKind] = useState('morning')
  const [sel, setSel] = useState({ morning: ['wake', 'toilet', 'dress', 'breakfast', 'teeth', 'shoes', 'bag'], evening: ['tidy', 'bath', 'pajamas', 'bag-pack', 'teeth', 'story'] })
  const [mins, setMins] = useState({})
  const [leave, setLeave] = useState('07:45')
  const [name, setName] = useState('')
  const [run, setRun] = useState(null) // {i, t0, done:[]}
  const [now, setNow] = useState(Date.now())
  const [printing, setPrinting] = useState(false)
  const all = ROUTINE_TASKS[kind]
  const tasks = all.filter(t => sel[kind].includes(t[0])).map(t => [t[0], t[1], t[2], mins[kind + t[0]] ?? t[3]])
  const total = tasks.reduce((s, t) => s + t[3], 0)
  const startAt = (() => { const [h, m] = leave.split(':').map(Number); if (Number.isNaN(h)) return ''; const d = (h * 60 + m - total + 1440) % 1440; return `${String(Math.floor(d / 60)).padStart(2, '0')}:${String(d % 60).padStart(2, '0')}` })()
  const toggle = id => setSel(s => ({ ...s, [kind]: s[kind].includes(id) ? s[kind].filter(x => x !== id) : all.map(t => t[0]).filter(x => x === id || s[kind].includes(x)) }))
  const bump = (id, d) => setMins(m => { const cur = m[kind + id] ?? all.find(t => t[0] === id)[3]; return { ...m, [kind + id]: Math.max(1, Math.min(30, cur + d)) } })
  const warned = useRef(-1)
  useEffect(() => { if (!run || run.over) return; const id = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(id) }, [run])
  const cur = run && !run.over ? tasks[run.i] : null
  const left = cur ? cur[3] * 60 - (now - run.t0) / 1000 : 0
  useEffect(() => { if (cur && left <= 0 && warned.current !== run.i) { warned.current = run.i; beep(660, 250); setTimeout(() => beep(520, 300), 280) } }, [cur, left, run])
  const doneTask = () => { beep(990, 120); const i = run.i + 1; if (i >= tasks.length) setRun({ ...run, over: true }); else setRun({ ...run, i, t0: Date.now() }) }
  return <Page>
    <SEO title="שגרת בוקר לילדים עם טיימר — וגם לוח שגרה להדפסה" description="טיימר שגרת בוקר וערב לילדים: בוחרים משימות (להתלבש, לאכול, לצחצח שיניים), קובעים דקות לכל אחת, ורואים מתי צריך להתחיל כדי לצאת בזמן. וגם לוח שגרה שבועי להדפסה." path="/family/morning-routine" />
    <Head emoji="⏰" h1="שגרת בוקר עם טיימר" sub="משימה אחת בכל פעם על המסך — והבוקר זורם בלי לצעוק" crumb="שגרת בוקר" />
    {!run && <div className="ln-box space-y-4">
      <div className="flex flex-wrap justify-center gap-2"><Chip on={kind === 'morning'} onClick={() => setKind('morning')}>☀️ בוקר</Chip><Chip on={kind === 'evening'} onClick={() => setKind('evening')}>🌙 ערב</Chip></div>
      <div className="grid gap-2 sm:grid-cols-2">{all.map(t => { const on = sel[kind].includes(t[0]); const m = mins[kind + t[0]] ?? t[3]; return <div key={t[0]} className={`fam-day ${on ? '' : 'opacity-50'}`}>
        <button type="button" className="ln-chip flex-1 !justify-start text-right" aria-pressed={on} onClick={() => toggle(t[0])}>{on ? '✓' : '+'} <span aria-hidden="true">{t[1]}</span> {t[2]}</button>
        {on && <span className="flex items-center gap-1 ms-auto"><button type="button" className="ln-chip !min-h-[36px] !px-3" onClick={() => bump(t[0], -1)} aria-label={`פחות זמן ל${t[2]}`}>−</button><b className="w-12 text-center">{m} דק׳</b><button type="button" className="ln-chip !min-h-[36px] !px-3" onClick={() => bump(t[0], 1)} aria-label={`יותר זמן ל${t[2]}`}>+</button></span>}</div> })}</div>
      <p className="text-center text-lg font-bold">סה״כ {total} דקות{kind === 'morning' && <> · יוצאים ב-<input type="time" value={leave} onChange={e => setLeave(e.target.value)} className="fam-input mx-1" aria-label="שעת יציאה" /> ← מתחילים ב-<span dir="ltr">{startAt}</span></>}</p>
      <div className="flex flex-wrap justify-center gap-3"><button type="button" className="ln-btn go" disabled={!tasks.length} onClick={() => { warned.current = -1; setRun({ i: 0, t0: Date.now(), start: Date.now() }); setNow(Date.now()) }}>▶ מתחילים</button>
        <input value={name} maxLength={14} onChange={e => setName(e.target.value)} placeholder="שם לדף (לא חובה)" className="fam-input" aria-label="שם לדף ההדפסה" /><button type="button" className="ln-btn alt" disabled={!tasks.length} onClick={() => setPrinting(true)}>🖨️ לוח שבועי להדפסה</button></div>
    </div>}
    {cur && <div className="ln-box text-center">
      <p className="font-bold">משימה {run.i + 1} מתוך {tasks.length}</p>
      <div className="ln-bar my-2"><i style={{ width: `${(run.i / tasks.length) * 100}%` }} /></div>
      <div className="text-[96px] leading-none" aria-hidden="true">{cur[1]}</div>
      <div className="ln-big !text-5xl">{cur[2]}</div>
      <div className={`text-6xl font-black ${left < 0 ? 'text-red-600' : left < 30 ? 'text-orange-500' : ''}`} dir="ltr" aria-live="off">{mmss(left)}</div>
      {left < 0 && <p className="font-bold">הזמן נגמר — אבל עוד אפשר לסיים! 💪</p>}
      <button type="button" className="ln-btn go mt-4 !text-2xl !min-h-[70px] !px-10" onClick={doneTask}>✓ סיימתי!</button>
      {tasks[run.i + 1] && <p className="mt-3 text-[var(--muted-foreground)]">הבא: {tasks[run.i + 1][1]} {tasks[run.i + 1][2]}</p>}
      <button type="button" className="mt-3 underline" onClick={() => setRun(null)}>עצירה</button>
    </div>}
    {run?.over && <div className="ln-box text-center space-y-3"><div className="text-7xl" aria-hidden="true">🎉</div><h2 className="text-3xl font-black">{kind === 'morning' ? 'מוכנים ליציאה!' : 'מוכנים לשינה. לילה טוב!'}</h2><p>לקח {Math.max(1, Math.round((Date.now() - run.start) / 60000))} דקות</p><button type="button" className="ln-btn alt" onClick={() => setRun(null)}>חזרה</button></div>}
    {printing && <PrintPreview title={kind === 'morning' ? 'שגרת בוקר' : 'שגרת ערב'} onClose={() => setPrinting(false)}><RoutinePrint kind={kind} tasks={tasks} name={name} /></PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['בבוקר, ילדים מתקשים לזכור רשימה ארוכה ולהעריך זמן. כשעל המסך מופיעה רק משימה אחת — עם ציור גדול ושעון שסופר אחורה — הם יודעים בדיוק מה עכשיו, וההורה לא צריך לחזור על "נו, תתלבש" עשר פעמים.', 'בוחרים את המשימות שמתאימות לבית שלכם, קובעים כמה דקות לכל אחת, וכותבים מתי צריך לצאת — והמחשבון אומר מתי להתחיל. כשנגמר הזמן של משימה נשמע צליל קטן, אבל אין לחץ: ממשיכים עד שמסיימים ולוחצים "סיימתי".', 'אפשר גם להדפיס לוח שגרה שבועי ולתלות על המקרר: כל משימה שבוצעה — צובעים עיגול.']} faq={[{ q: 'כמה זמן צריך לשגרת בוקר עם ילדים?', a: 'לרוב 30–45 דקות מהקימה ועד היציאה, תלוי בגיל ובארוחת הבוקר. כדאי להוסיף 5–10 דקות ביטחון לבלת״מים — נעל שנעלמה או בקבוק שנשפך.' }, { q: 'איך גורמים לילד להתארגן לבד בבוקר?', a: 'קבועים, תמונות ומעט מילים. מכינים בערב בגדים ותיק, משאירים את אותו סדר כל יום, ומחזקים כשהוא מצליח. לוח עם עיגולים לצביעה עוזר לראות התקדמות.' }]} related={[{ label: 'טבלת מטלות', href: '/printables/chore-chart' }, { label: 'לוח צחצוח שיניים', href: '/printables/toothbrushing-chart' }, { label: 'ארוחת עשר', href: '/food/school-lunch' }]} /></div>
  </Page>
}

// ── /family/bedtime-story ───────────────────────────────
export function BedtimeStory() {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('m')
  const [animal, setAnimal] = useState('bunny')
  const [storyId, setStoryId] = useState(STORIES[0].id)
  const [big, setBig] = useState(false)
  const [printing, setPrinting] = useState(false)
  const n = name.trim() || (gender === 'm' ? 'יואב' : 'נועה')
  const g = (m, f) => (gender === 'm' ? m : f)
  const a = STORY_ANIMALS.find(x => x[0] === animal)
  const story = STORIES.find(s => s.id === storyId)
  const paras = story.body(n, g, a)
  const other = () => setStoryId(pick(STORIES.filter(s => s.id !== storyId)).id)
  return <Page>
    <SEO title="סיפור לפני השינה עם השם של הילד — סיפורים קצרים ומרגיעים" description="סיפור לפני השינה שבו הילד או הילדה הם הגיבורים: כותבים שם, בוחרים בן או בת וחבר מחיות — ומקבלים סיפור קצר ומרגיע. 6 סיפורים מקוריים, אפשר גם להדפיס." path="/family/bedtime-story" />
    <Head emoji="🌙" h1="סיפור לפני השינה" sub="כותבים את השם — והילד הופך לגיבור של הסיפור" crumb="סיפור לפני השינה" />
    <div className="ln-box space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-2"><input value={name} maxLength={14} onChange={e => setName(e.target.value)} placeholder="שם הילד/ה" className="fam-input" aria-label="שם הילד/ה" /><Chip on={gender === 'm'} onClick={() => setGender('m')}>👦 בן</Chip><Chip on={gender === 'f'} onClick={() => setGender('f')}>👧 בת</Chip></div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="חבר לסיפור">{STORY_ANIMALS.map(([id, l]) => <Chip key={id} on={animal === id} onClick={() => setAnimal(id)}>{l}</Chip>)}</div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="סיפור">{STORIES.map(s => <Chip key={s.id} on={storyId === s.id} onClick={() => setStoryId(s.id)}><span aria-hidden="true">{s.emoji}</span> {s.title(n)}</Chip>)}</div>
    </div>
    <article className="mt-6 rounded-[22px] border-2 border-[var(--border)] p-6 sm:p-8" style={{ background: '#1f2547', color: '#f4f1e6' }}>
      <h2 className="text-3xl font-black text-center mb-4" style={{ color: '#ffd23f' }}>{story.emoji} {story.title(n)}</h2>
      <div className={`ln-text ${big ? 'is-big' : ''}`}>{paras.map((p, i) => <p key={i}>{p}</p>)}</div>
      <p className="text-center text-2xl mt-4" aria-hidden="true">✨ 🌙 ✨</p>
    </article>
    <p className="mt-6 text-center text-lg">רוצים עוד? ב<Link to="/stories" className="font-bold underline">ספריית הסיפורים לפני השינה</Link> יש 30 סיפורים ארוכים יותר לפי גיל ונושא — וגם בהם אפשר לכתוב את שם הילד.</p>
    <div className="mt-4 flex flex-wrap justify-center gap-2"><button type="button" className="ln-btn" onClick={other}>📖 סיפור אחר</button><Chip on={big} onClick={() => setBig(!big)}>🔍 אותיות גדולות</Chip><button type="button" className="ln-btn alt" onClick={() => setPrinting(true)}>🖨️ הדפסה</button></div>
    {printing && <PrintPreview title={story.title(n)} onClose={() => setPrinting(false)}><article className="buga-flow fam-print" dir="rtl"><h2>{story.title(n)}</h2>{paras.map((p, i) => <p key={i} style={{ fontSize: '15pt', lineHeight: 1.8 }}>{p}</p>)}<p style={{ textAlign: 'center' }}>~ לילה טוב ~</p></article></PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['ילדים אוהבים לשמוע את השם שלהם בסיפור — פתאום הם לא רק מקשיבים, הם בתוך ההרפתקה. כאן כותבים את שם הילד או הילדה, בוחרים חבר מחיות (כלבלב, ארנבון, דרקון קטן ועוד), והסיפור מתאים את עצמו, כולל לשון זכר או נקבה.', 'כל הסיפורים נכתבו במיוחד לאתר, והם קצרים ורגועים בכוונה: בלי מתח גדול, עם קצב שמאט לקראת הסוף — כדי שיתאימו לרגע שלפני השינה. קריאה של כל סיפור לוקחת כשלוש דקות.']} faq={[{ q: 'איך בוחרים סיפור לפני השינה?', a: 'קצר, רגוע וחוזר על עצמו. ילדים קטנים אוהבים לשמוע את אותו סיפור שוב ושוב — זה מרגיע. כדאי להימנע מסיפורים מפחידים או מותחים מדי לפני השינה.' }, { q: 'הילד מפחד מהחושך — יש סיפור מתאים?', a: 'כן: "החושך שבפינה" מספר על ילד או ילדה שמגלים שהצל המפחיד הוא בסך הכול מעיל על כיסא, ולומדים לנשום עמוק ולבדוק.' }]} related={[{ label: 'ספריית סיפורים לפני השינה', href: '/stories' }, { label: 'שגרת ערב עם טיימר', href: '/family/morning-routine' }, { label: 'הבנת הנקרא', href: '/learn/reading' }]} /></div>
  </Page>
}

// ── /family/car-games ───────────────────────────────
function BingoCard({ words, y0, idx }) {
  const cell = 44, x0 = 12
  return <g>
    <T x={100} y={y0 + 8} size={7} weight={900}>בינגו נסיעה {idx}</T><T x={100} y={y0 + 15} size={4}>שם: ________________</T>
    {words.map((w, i) => { const r = Math.floor(i / 4), c = i % 4, x = x0 + (3 - c) * cell, y = y0 + 19 + r * 25.5; const parts = wrapWords(w, 9)
      return <g key={i}><rect x={x} y={y} width={cell} height={25.5} fill={i === 5 ? '#fff6d1' : '#fff'} stroke="#444" strokeWidth=".4" />
        {parts.length > 1 ? parts.map((p, j) => <T key={j} x={x + cell / 2} y={y + 14.5 + (j - (parts.length - 1) / 2) * 7} size={6} weight={700}>{p}</T>) : <T x={x + cell / 2} y={y + 15} size={6.4} weight={700}>{w}</T>}</g> })}
  </g>
}
export function CarGames() {
  const [age, setAge] = useState(0)
  const [shown, setShown] = useState(null)
  const [kids, setKids] = useState(2)
  const [cards, setCards] = useState(null)
  const list = CAR_GAMES.filter(g => !age || g.age <= age)
  const makeCards = () => setCards(Array.from({ length: kids }, () => shuffle(BINGO_WORDS).slice(0, 16)))
  const pages = []
  if (cards) for (let i = 0; i < cards.length; i += 2) pages.push(<A4 key={i}><Sheet label="בינגו נסיעה"><BingoCard words={cards[i]} y0={4} idx={i + 1} />{cards[i + 1] && <BingoCard words={cards[i + 1]} y0={136} idx={i + 2} />}</Sheet></A4>)
  return <Page>
    <SEO title="משחקים לנסיעה עם ילדים — 14 משחקים בלי כלום ביד ובינגו נסיעה להדפסה" description="משחקים לנסיעה ארוכה באוטו עם ילדים: אני רואה משהו, שרשרת מילים, 20 שאלות, ארץ עיר בעל פה ועוד — בלי מסכים ובלי ציוד. וגם בינגו נסיעה להדפסה, לוח שונה לכל ילד." path="/family/car-games" structuredData={faqSchema([{ q: 'מה משחקים בנסיעה ארוכה עם ילדים?', a: 'משחקים שלא צריך בשבילם כלום: אני רואה משהו, שרשרת מילים, 20 שאלות, סיפור שרשרת וספירת מכוניות לפי צבע. לנסיעות ארוכות כדאי להדפיס מראש בינגו נסיעה — לוח שונה לכל ילד.' }])} />
    <Head emoji="🚗" h1="משחקים לנסיעה" sub="בלי מסכים, בלי ציוד — רק מה שרואים מהחלון ומה שיש בראש" crumb="משחקים לנסיעה" />
    <div className="ln-box space-y-3 text-center">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="גיל הקטן ביותר">{[[0, 'כל הגילים'], [3, 'מגיל 3'], [5, 'מגיל 5'], [7, 'מגיל 7']].map(([k, l]) => <Chip key={k} on={age === k} onClick={() => setAge(k)}>{l}</Chip>)}</div>
      <button type="button" className="fam-roll" onClick={() => setShown({ g: pick(list), k: Date.now() })}>🎲 {shown ? 'משחק אחר' : 'במה נשחק?'}</button>
      {shown && <div key={shown.k} className="fam-card fam-pop text-right"><b className="text-xl">{shown.g.e} {shown.g.t}</b><p className="m-0">{shown.g.how}</p></div>}
    </div>
    <div className="mt-8 space-y-3">{list.map(g => <section key={g.slug} id={g.slug} className="fam-card"><h2 className="text-xl font-black">{g.e} {g.t} <small className="font-normal text-[var(--muted-foreground)]">· מגיל {g.age}{g.gear ? ` · צריך: ${g.gear}` : ''}</small></h2><p className="m-0">{g.how}</p>{g.to && <Link to={g.to} className="font-bold underline">שאלות מוכנות ←</Link>}</section>)}</div>
    <div className="ln-box mt-8 text-center space-y-3"><h2 className="text-2xl font-black">🎯 בינגו נסיעה להדפסה</h2><p>לוח שונה לכל ילד, 16 דברים שרואים בדרך. שני לוחות בדף.</p>
      <div className="flex flex-wrap items-center justify-center gap-2"><span className="font-bold">כמה ילדים?</span>{[1, 2, 3, 4, 5, 6].map(k => <Chip key={k} on={kids === k} onClick={() => setKids(k)}>{k}</Chip>)}</div>
      <button type="button" className="ln-btn" onClick={makeCards}>🖨️ להדפיס לוחות בינגו</button></div>
    {cards && <PrintPreview title="בינגו נסיעה" onClose={() => setCards(null)} onRefresh={makeCards}>{pages}</PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['נסיעה ארוכה עם ילדים לא חייבת להיות שעה של "עוד כמה זמן?". המשחקים כאן לא צריכים טלפון, דף או עט — רק עיניים, קול ודמיון. רובם מתאימים גם לנהג, כי אפשר לשחק בהם בלי להסתכל אחורה.', 'יש משחקים לקטנים (אני רואה משהו, נחשו את החיה, ציד מכוניות לפי צבע) ולגדולים (שרשרת מילים, 20 שאלות, משחק לוחיות הרישוי). לנסיעות ארוכות במיוחד — מדפיסים בינגו נסיעה מראש, ומקבלים לוח שונה לכל ילד.']} related={[{ label: 'שאלות "מה הייתם מעדיפים"', href: '/questions' }, { label: 'חידות לילדים', href: '/tools/riddles' }, { label: 'מה עושים היום?', href: '/family/what-to-do' }]} /></div>
  </Page>
}

// ── /family/move ───────────────────────────────
export function MoveChallenge() {
  const [count, setCount] = useState(8)
  const [secs, setSecs] = useState(30)
  const [run, setRun] = useState(null) // {list, i, t0, rest}
  const [now, setNow] = useState(Date.now())
  const [one, setOne] = useState(null)
  const [printing, setPrinting] = useState(false)
  useEffect(() => { if (!run || run.over) return; const id = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(id) }, [run])
  const phaseLen = run ? (run.rest ? 4 : secs) : 0
  const left = run && !run.over ? phaseLen - (now - run.t0) / 1000 : 0
  useEffect(() => {
    if (!run || run.over || left > 0) return
    if (run.rest) { beep(880, 200); setRun({ ...run, rest: false, t0: Date.now() }) }
    else if (run.i + 1 >= run.list.length) { beep(1046, 400); setRun({ ...run, over: true }) }
    else { beep(660, 150); setRun({ ...run, i: run.i + 1, rest: true, t0: Date.now() }) }
  }, [left, run])
  const start = () => { setRun({ list: shuffle(MOVES).slice(0, count), i: 0, rest: true, t0: Date.now() }); setNow(Date.now()) }
  const m = run && !run.over ? run.list[run.i] : null
  return <Page>
    <SEO title="אתגר תנועה לילדים — תרגילים מצחיקים עם טיימר, בבית" description="אתגר תנועה לילדים בסלון: קפיצות צפרדע, הליכת סרטן, עמידת פלמינגו ועוד 30 תרגילים בלי ציוד. בוחרים כמה תרגילים וכמה זמן — והטיימר מוביל. גם כרטיסי תנועה להדפסה." path="/family/move" />
    <Head emoji="🤸" h1="אתגר תנועה" sub="קופצים, זוחלים וצוחקים — עם טיימר שמחליף תרגיל לבד" crumb="אתגר תנועה" />
    {!run && <div className="ln-box space-y-4 text-center">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="כמה תרגילים">{[5, 8, 12].map(k => <Chip key={k} on={count === k} onClick={() => setCount(k)}>{k} תרגילים</Chip>)}</div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="שניות לתרגיל">{[20, 30, 45].map(k => <Chip key={k} on={secs === k} onClick={() => setSecs(k)}>{k} שניות</Chip>)}</div>
      <p>בסך הכול כ-{Math.round((count * (secs + 4)) / 60)} דקות של תנועה</p>
      <div className="flex flex-wrap justify-center gap-3"><button type="button" className="ln-btn go" onClick={start}>▶ יוצאים לדרך</button><button type="button" className="ln-btn alt" onClick={() => setOne(pick(MOVES))}>🎲 תרגיל אחד</button><button type="button" className="ln-btn alt" onClick={() => setPrinting(true)}>🖨️ כרטיסים להדפסה</button></div>
      {one && <div className="fam-card fam-pop text-center"><div className="text-6xl" aria-hidden="true">{one[0]}</div><b className="text-2xl">{one[1]}</b></div>}
    </div>}
    {m && <div className="ln-box text-center">
      <p className="font-bold">{run.rest ? 'מתכוננים...' : `תרגיל ${run.i + 1} מתוך ${run.list.length}`}</p>
      <div className="text-[110px] leading-none" aria-hidden="true">{m[0]}</div>
      <div className="ln-big !text-4xl sm:!text-5xl">{m[1]}</div>
      <div className={`text-7xl font-black ${run.rest ? 'text-orange-500' : ''}`} dir="ltr">{Math.ceil(Math.max(0, left))}</div>
      <div className="mt-4 flex justify-center gap-3"><button type="button" className="ln-btn alt" onClick={() => setRun({ ...run, t0: Date.now() - phaseLen * 1000 })}>⏭️ דילוג</button><button type="button" className="ln-btn alt" onClick={() => setRun(null)}>עצירה</button></div>
    </div>}
    {run?.over && <div className="ln-box text-center space-y-3"><div className="text-7xl" aria-hidden="true">🏆</div><h2 className="text-3xl font-black">כל הכבוד! סיימתם {run.list.length} תרגילים</h2><p>עכשיו כוס מים ונשימה עמוקה.</p><button type="button" className="ln-btn go" onClick={start}>🔁 עוד סבב</button></div>}
    {printing && <PrintPreview title="כרטיסי תנועה" onClose={() => setPrinting(false)}>{[0, 12, 24].map(st => <A4 key={st}><Sheet label="כרטיסי תנועה">{MOVES.slice(st, st + 12).map((mv, i) => { const c = i % 3, r = Math.floor(i / 3), x = 134 - c * 62, y = 6 + r * 66; const [head, tail] = mv[1].split(' — '); const lines = wrapWords(head, 16); const fs = lines.length > 2 ? 5.2 : 6; return <g key={i}><rect x={x} y={y} width={58} height={62} rx="5" fill="#fff" stroke="#888" strokeWidth=".4" strokeDasharray="2 1.5" /><circle cx={x + 29} cy={y + 15} r="8" fill="#ffd23f" /><T x={x + 29} y={y + 18} size={8} weight={900}>{st + i + 1}</T>{lines.map((w, j) => <T key={j} x={x + 29} y={y + 33 + j * fs * 1.2} size={fs} weight={800}>{w}</T>)}{tail && <T x={x + 29} y={y + 35 + lines.length * fs * 1.2 + 2} size={5.4} fill="#7548b3" weight={700}>{tail}</T>}</g> })}</Sheet></A4>)}</PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['ימים של גשם, חום כבד או סתם יותר מדי מסכים — ילדים צריכים לזוז. אתגר התנועה בוחר תרגילים מצחיקים בהשראת חיות: קפיצות צפרדע, הליכת סרטן, עמידת פלמינגו וזחילת נחש. כל התרגילים בלי ציוד ומתאימים לסלון.', 'בוחרים כמה תרגילים וכמה שניות לכל אחד, והטיימר מוביל לבד — עם ארבע שניות של "מתכוננים" בין תרגיל לתרגיל. אפשר גם להדפיס כרטיסים, לערבב אותם בכובע ולשלוף.', 'כדאי לפנות מקום פנוי מרהיטים עם פינות חדות, ולשחק בגרביים נגד החלקה או יחפים.']} related={[{ label: 'מה עושים היום?', href: '/family/what-to-do' }, { label: 'משחקי קוביות', href: '/dice-games' }]} /></div>
  </Page>
}

// ── /family/pocket-money ───────────────────────────────
function SavingsSheet({ goal, price, coins }) {
  const per = Math.ceil(price / coins)
  const cols = coins <= 12 ? 4 : coins <= 20 ? 5 : 6, gap = coins <= 12 ? 40 : coins <= 20 ? 34 : 28, r = gap * 0.4, x0 = 100 + ((cols - 1) * gap) / 2, top = 70
  return <Sheet label="דף מעקב חיסכון">
    <T x={100} y={18} size={12} weight={900}>החיסכון שלי</T>
    <T x={100} y={32} size={7.5}>{goal ? `אני חוסך/ת בשביל: ${goal}` : 'אני חוסך/ת בשביל: ____________________'}</T>
    <T x={100} y={43} size={6.5}>{price ? `המחיר: ${price} ₪ · כל עיגול = ${per} ₪` : 'המחיר: ______ ₪'}</T>
    {Array.from({ length: coins }, (_, i) => { const row = Math.floor(i / cols), c = i % cols; const x = x0 - c * gap, y = top + row * gap
      return <g key={i}><circle cx={x} cy={y} r={r} fill="#fff" stroke="#c9a227" strokeWidth="1.2" /><circle cx={x} cy={y} r={r - 2.5} fill="none" stroke="#e8d27a" strokeWidth=".5" /><T x={x} y={y + r * 0.25} size={r * 0.62} weight={800} fill="#b08a1a" direction="ltr">{per * (i + 1) > price ? price : per * (i + 1)}</T></g> })}
    <T x={100} y={top + Math.ceil(coins / cols) * gap} size={6}>צובעים עיגול בכל פעם ששמים כסף בקופה — עד שמגיעים!</T>
  </Sheet>
}
export function PocketMoney() {
  const [price, setPrice] = useState(200)
  const [have, setHave] = useState(0)
  const [weekly, setWeekly] = useState(20)
  const [goal, setGoal] = useState('')
  const [split, setSplit] = useState([50, 40, 10])
  const [printing, setPrinting] = useState(null)
  const need = Math.max(0, price - have)
  const weeks = weekly > 0 ? Math.ceil(need / weekly) : null
  const date = weeks != null ? new Date(Date.now() + weeks * 7 * 864e5).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const setPart = (i, v) => setSplit(s => { const n = [...s]; n[i] = Math.max(0, Math.min(100, v)); const rest = 100 - n[i]; const o = [0, 1, 2].filter(k => k !== i); const sum = s[o[0]] + s[o[1]] || 1; n[o[0]] = Math.round((s[o[0]] / sum) * rest); n[o[1]] = rest - n[o[0]]; return n })
  const jars = [['🛍️', 'לבזבז', '#ffe0b3'], ['🐷', 'לחסוך', '#d6f5d1'], ['💝', 'לתת', '#ffd6e7']]
  const coins = Math.min(30, Math.max(6, weeks || 12))
  const num = (v, set, label) => <label className="block font-bold">{label}<input type="number" min="0" inputMode="numeric" value={v} onChange={e => set(Math.max(0, Number(e.target.value) || 0))} className="fam-input mt-1 w-full text-center text-xl" /></label>
  return <Page>
    <SEO title="דמי כיס לילדים — מחשבון חיסכון, שלוש קופות ודף מעקב להדפסה" description="כלים לדמי כיס: מחשבון 'כמה שבועות עד שאקנה?', חלוקה לשלוש קופות (לבזבז, לחסוך, לתת), ודף מעקב חיסכון להדפסה שבו צובעים מטבע בכל הפקדה. בלי לקבוע לכם סכום." path="/family/pocket-money" />
    <Head emoji="🐷" h1="דמי כיס וחיסכון" sub="מחשבים כמה זמן עד החלום — ומחלקים לשלוש קופות" crumb="דמי כיס" />
    <div className="ln-box space-y-4">
      <h2 className="text-2xl font-black text-center">🎯 כמה זמן עד שאקנה?</h2>
      <label className="block font-bold text-center">מה רוצים לקנות?<input value={goal} maxLength={24} onChange={e => setGoal(e.target.value)} placeholder="למשל: לגו, כדורגל, אופניים" className="fam-input mt-1 w-full text-center" /></label>
      <div className="grid gap-3 sm:grid-cols-3">{num(price, setPrice, 'מחיר (₪)')}{num(have, setHave, 'כבר יש לי (₪)')}{num(weekly, setWeekly, 'חוסך/ת כל שבוע (₪)')}</div>
      <div className="text-center text-2xl font-black">{need === 0 ? '🎉 יש מספיק כסף — אפשר לקנות!' : weeks != null ? <>עוד <span className="text-4xl">{weeks}</span> שבועות{weeks > 0 && <div className="text-base font-bold">בערך ב-{date}</div>}</> : 'כמה חוסכים כל שבוע?'}</div>
      {price > 0 && <div className="ln-bar"><i style={{ width: `${Math.min(100, (have / price) * 100)}%`, background: '#2e9e2b' }} /></div>}
      <div className="text-center"><button type="button" className="ln-btn alt" onClick={() => setPrinting('save')}>🖨️ דף מעקב חיסכון</button></div>
    </div>
    <div className="ln-box mt-6 space-y-3">
      <h2 className="text-2xl font-black text-center">🫙 שלוש קופות</h2>
      <p className="text-center">מכל סכום שמקבלים — חלק לבזבז עכשיו, חלק לחסוך וחלק לתת למישהו אחר. החלוקה שלכם, הנה דוגמה:</p>
      <div className="grid gap-3 sm:grid-cols-3">{jars.map(([e, l, c], i) => <div key={l} className="rounded-2xl border-2 border-[var(--border)] p-3 text-center" style={{ background: c }}><div className="text-4xl" aria-hidden="true">{e}</div><b className="text-xl">{l}</b>
        <input type="range" min="0" max="100" value={split[i]} onChange={e => setPart(i, +e.target.value)} className="w-full" aria-label={`אחוז ל${l}`} /><div className="text-lg font-bold">{split[i]}% = {Math.round((weekly * split[i]) / 100 * 10) / 10} ₪ בשבוע</div></div>)}</div>
    </div>
    {printing && <PrintPreview title="החיסכון שלי" onClose={() => setPrinting(null)}><A4><SavingsSheet goal={goal} price={price} coins={coins} /></A4></PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={['דמי כיס הם אחת הדרכים הטובות ללמד ילדים על כסף: מה זה לחכות, להשוות מחירים ולבחור. אין סכום "נכון" — כל משפחה מחליטה לפי היכולת שלה, הגיל של הילד ומה הוא אמור לממן בעצמו. חשוב יותר שהסכום יהיה קבוע ושיינתן ביום קבוע.', 'המחשבון עוזר לילד לראות שהחלום שלו אפשרי: כמה שבועות עוד צריך לחסוך, ובאיזה תאריך בערך יגיע. את דף המעקב מדפיסים ותולים ליד הקופה — וצובעים עיגול בכל הפקדה.', 'שיטת שלוש הקופות (לבזבז, לחסוך, לתת) מלמדת שכסף הוא לא רק לקניות עכשיו. את החלוקה קובעים יחד עם הילד.']} faq={[{ q: 'מאיזה גיל נותנים דמי כיס?', a: 'הרבה הורים מתחילים בגיל 5–7, כשהילד מבין שמטבעות קונים דברים ויכול לספור. אין גיל מחייב — העיקר שהילד מבין מה עושים עם הכסף.' }, { q: 'כמה דמי כיס לתת?', a: 'אין סכום מומלץ אחד. כדאי לחשוב מה הילד אמור לממן בעצמו (ממתקים? יציאות עם חברים?), לבדוק מה מקובל בסביבה, ולהתחיל בסכום קטן שאפשר להעלות עם הגיל.' }, { q: 'לקשר דמי כיס לעבודות בבית?', a: 'יש בזה דעות שונות. יש משפחות שמפרידות: מטלות בית הן חלק מהחיים המשותפים, ודמי הכיס ניתנים בכל מקרה; ויש שנותנות תוספת על עבודות מיוחדות. שתי הדרכים לגיטימיות — העיקר עקביות.' }]} related={[{ label: 'טבלת מטלות', href: '/printables/chore-chart' }, { label: 'לוח מדבקות', href: '/printables/reward-chart' }]} /></div>
  </Page>
}
