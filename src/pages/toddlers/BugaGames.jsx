import { useEffect, useRef, useState } from 'react'
import { speak, stopSpeaking } from '../../utils/speak'
import buga from './buga-play.webp'
import './buga-games.css'

// Short learning games for ages 2–4 with Buga. No reading needed, no losing: a wrong tap only
// gets a gentle "that's X — where is Y?". Every few stars Buga suggests a movement break.
// The picture is bundled (not /public) so the travel cache keeps it for flight mode.

const shuffle = list => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
const pickOther = (list, not, n) => shuffle(list.filter(x => x !== not)).slice(0, n)

let audio = null
function chime(notes) {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)()
    const t = audio.currentTime
    notes.forEach((f, i) => {
      const o = audio.createOscillator(), g = audio.createGain(), at = t + i * 0.1
      o.type = 'sine'; o.frequency.value = f
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.18, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.3)
      o.connect(g).connect(audio.destination); o.start(at); o.stop(at + 0.32)
    })
  } catch { /* no sound on this device */ }
}
const YAY = [523, 659, 784], POP = [880], SOFT = [392]

const COLORS = [
  { name: 'אדום', hex: '#e11d48', food: '🍎', fruit: 'תפוח אדום' },
  { name: 'צהוב', hex: '#facc15', food: '🍌', fruit: 'בננה צהובה' },
  { name: 'ירוק', hex: '#16a34a', food: '🥒', fruit: 'מלפפון ירוק' },
  { name: 'כחול', hex: '#2563eb', food: '🫐', fruit: 'אוכמניות כחולות' },
  { name: 'כתום', hex: '#f97316', food: '🍊', fruit: 'תפוז כתום' },
  { name: 'סגול', hex: '#9333ea', food: '🍇', fruit: 'ענבים סגולים' },
]
const ANIMALS = [
  { name: 'פרה', emoji: '🐄', sound: 'מוּ', f: true },
  { name: 'כלב', emoji: '🐕', sound: 'הַב הַב' },
  { name: 'חתול', emoji: '🐈', sound: 'מְיָאוּ' },
  { name: 'ברווז', emoji: '🦆', sound: 'גָּה גָּה' },
  { name: 'כבשה', emoji: '🐑', sound: 'מֶה', f: true },
  { name: 'סוס', emoji: '🐎', sound: 'אִיהָהָה' },
  { name: 'תרנגול', emoji: '🐓', sound: 'קוּקוּרִיקוּ' },
  { name: 'אריה', emoji: '🦁', sound: 'רָאאאר' },
]
const NUMBERS = ['אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש']
const COUNT_THINGS = ['🎈', '⭐', '🐟', '🌸', '🚗']

export const BUGA_GAMES = [
  { id: 'peekaboo', emoji: '☁️', title: 'איפה בוגה?', learn: 'קשב וקביעות האובייקט' },
  { id: 'colors', emoji: '🍎', title: 'מאכילים את בוגה', learn: 'צבעים ופירות' },
  { id: 'count', emoji: '🎈', title: 'סופרים עם בוגה', learn: 'מספרים 1–5' },
  { id: 'animals', emoji: '🐄', title: 'החיות של בוגה', learn: 'חיות וקולות' },
]

function Buga({ mood, size = 150 }) {
  return <img src={buga} alt="" aria-hidden="true" width={size} height={size} className={`bg-buga ${mood || ''}`} draggable="false" />
}

// ── איפה בוגה? Clouds hide Buga; tap them away. More clouds as the child finds him.
function Peekaboo({ win, say }) {
  const [round, setRound] = useState(0)
  const count = Math.min(2 + Math.floor(round / 2), 4)
  const [spot, setSpot] = useState(() => Math.floor(Math.random() * 2))
  const [open, setOpen] = useState([])
  const found = open.includes(spot)
  useEffect(() => { say('איפה בוגה? לחצו על העננים') }, [round, say])
  const tap = i => {
    if (open.includes(i) || found) return
    setOpen(o => [...o, i])
    if (i === spot) { win('קוּקוּ! מצאתם את בוגה!'); setTimeout(() => { const next = round + 1, n = Math.min(2 + Math.floor(next / 2), 4); setSpot(Math.floor(Math.random() * n)); setOpen([]); setRound(next) }, 2000) }
    else { chime(POP); say('לא כאן. אולי מאחורי ענן אחר?') }
  }
  return <div className="bg-sky">
    {Array.from({ length: count }, (_, i) => <button key={`${round}-${i}`} className={`bg-cloud ${open.includes(i) ? 'gone' : ''}`} onClick={() => tap(i)} aria-label={`ענן ${i + 1}`}>
      {i === spot && <span className="bg-hidden"><Buga mood={found ? 'hop' : ''} size={110} /></span>}
      {open.includes(i) && i !== spot && <span className="bg-empty" aria-hidden="true">🌈</span>}
      <span className="bg-puff" aria-hidden="true">☁️</span>
    </button>)}
  </div>
}

// ── מאכילים את בוגה: Buga asks for a colour; three fruits to choose from.
function Colors({ win, say, mood, setMood }) {
  const deal = () => { const target = COLORS[Math.floor(Math.random() * COLORS.length)]; return { target, options: shuffle([target, ...pickOther(COLORS, target, 2)]), eaten: null } }
  const [r, setR] = useState(deal)
  useEffect(() => { say(`בוגה רוצה משהו ${r.target.name}`) }, [r.target, say])
  const tap = c => {
    if (r.eaten) return
    if (c === r.target) { setR(x => ({ ...x, eaten: c })); win(`יאמי! ${c.fruit}`); setTimeout(() => setR(deal()), 2200) }
    else { setMood('shake'); chime(SOFT); say(`זה ${c.name}. איפה ${r.target.name}?`) }
  }
  return <div className="bg-stage">
    <div className="bg-ask"><Buga mood={r.eaten ? 'chew' : mood} /><span className="bg-bubble"><span className="bg-blob" style={{ background: r.target.hex }} />{r.target.name}</span></div>
    <div className="bg-choices">{r.options.map(c => <button key={c.name} className={r.eaten === c ? 'eat' : ''} onClick={() => tap(c)} aria-label={c.fruit}><span aria-hidden="true">{c.food}</span></button>)}</div>
  </div>
}

// ── סופרים עם בוגה: tap each thing, Buga counts aloud; 1–3 first, then up to 5.
function Count({ win, say }) {
  const [round, setRound] = useState(0)
  const deal = n => ({ n, thing: COUNT_THINGS[Math.floor(Math.random() * COUNT_THINGS.length)], done: [] })
  const [r, setR] = useState(() => deal(1 + Math.floor(Math.random() * 3)))
  useEffect(() => { say('בואו נספור יחד! לחצו על כל אחד') }, [round, say])
  const tap = i => {
    if (r.done.includes(i)) return
    const done = [...r.done, i]
    setR(x => ({ ...x, done }))
    chime([440 + done.length * 70])
    if (done.length === r.n) {
      win(`${NUMBERS[r.n - 1]}! ספרנו עד ${NUMBERS[r.n - 1]}!`)
      setTimeout(() => { const next = round + 1; setRound(next); setR(deal(1 + Math.floor(Math.random() * (next < 4 ? 3 : 5)))) }, 2400)
    } else say(NUMBERS[done.length - 1])
  }
  const all = r.done.length === r.n
  return <div className="bg-stage">
    <div className="bg-ask"><Buga mood={all ? 'hop' : ''} size={120} /><span className="bg-number" aria-live="polite">{r.done.length || ''}</span></div>
    <div className="bg-things">{Array.from({ length: r.n }, (_, i) => <button key={`${round}-${i}`} className={r.done.includes(i) ? 'counted' : ''} onClick={() => tap(i)} aria-label={`פריט ${i + 1}`}>
      <span aria-hidden="true">{r.thing}</span>{r.done.includes(i) && <b>{r.done.indexOf(i) + 1}</b>}
    </button>)}</div>
  </div>
}

// ── החיות של בוגה: "where is the cow?" — three animals; the right one makes its sound.
function Animals({ win, say, mood, setMood }) {
  const deal = () => { const target = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]; return { target, options: shuffle([target, ...pickOther(ANIMALS, target, 2)]), ok: false } }
  const [r, setR] = useState(deal)
  useEffect(() => { say(`איפה ה${r.target.name}?`) }, [r.target, say])
  const tap = a => {
    if (r.ok) return
    if (a === r.target) { setR(x => ({ ...x, ok: true })); win(`${a.sound}! ה${a.name} ${a.f ? 'אומרת' : 'אומר'} ${a.sound}`); setTimeout(() => setR(deal()), 2600) }
    else { setMood('shake'); chime(SOFT); say(`זה ${a.name}. איפה ה${r.target.name}?`) }
  }
  return <div className="bg-stage">
    <div className="bg-ask"><Buga mood={r.ok ? 'hop' : mood} size={120} /><span className="bg-bubble">איפה ה{r.target.name}?</span></div>
    <div className="bg-choices">{r.options.map(a => <button key={a.name} className={r.ok && a === r.target ? 'eat' : ''} onClick={() => tap(a)} aria-label={a.name}><span aria-hidden="true">{a.emoji}</span>{r.ok && a === r.target && <small>{a.sound}</small>}</button>)}</div>
  </div>
}

const GAMES = { peekaboo: Peekaboo, colors: Colors, count: Count, animals: Animals }
const BREAKS = ['קופצים כמו בוגה — שלוש קפיצות!', 'מותחים ידיים גבוה גבוה, עד השמיים', 'מוחאים כפיים חמש פעמים', 'מסתובבים לאט במקום', 'עושים פרצוף מצחיק לאמא או לאבא']

export default function BugaGames() {
  const [game, setGame] = useState(null)
  const [stars, setStars] = useState(0)
  const [sound, setSound] = useState(true)
  const [mood, setMood] = useState('')
  const [msg, setMsg] = useState('')
  const [rest, setRest] = useState(null)
  const soundRef = useRef(sound)
  soundRef.current = sound
  const [say] = useState(() => text => { setMsg(text); if (soundRef.current) speak(text, 'he-IL', { user: false }) })
  useEffect(() => { if (mood !== 'shake') return undefined; const t = setTimeout(() => setMood(''), 600); return () => clearTimeout(t) }, [mood])
  useEffect(() => () => stopSpeaking(), [])

  const win = text => {
    chime(YAY); say(text)
    setStars(s => { const n = s + 1; if (n % 8 === 0) setTimeout(() => setRest(BREAKS[(n / 8 - 1) % BREAKS.length]), 2300); return n })
  }
  const G = GAMES[game]

  return <div className="bg-wrap" dir="rtl">
    <div className="bg-bar">
      {game ? <button onClick={() => { stopSpeaking(); setGame(null); setMsg('') }}>← כל המשחקים</button> : <span />}
      <span className="bg-stars" aria-label={`${stars} כוכבים`}>⭐ {stars}</span>
      <button onClick={() => { setSound(s => !s); stopSpeaking() }} aria-pressed={!sound}>{sound ? '🔊 קול' : '🔇 בלי קול'}</button>
    </div>
    {rest ? <div className="bg-rest">
      <Buga mood="hop" size={160} />
      <h3>הפסקת תנועה עם בוגה</h3>
      <p className="bg-rest-do">{rest}</p>
      <button className="bg-go" onClick={() => setRest(null)}>עשינו! ממשיכים ←</button>
    </div> : G ? <>
      <G key={game} win={win} say={say} mood={mood} setMood={setMood} />
      <p className="bg-msg" aria-live="polite">{msg}</p>
    </> : <>
      <div className="bg-hello"><Buga size={140} /><p>היי! אני בוגה. במה נשחק?</p></div>
      <div className="bg-menu">{BUGA_GAMES.map(g => <button key={g.id} onClick={() => { setGame(g.id); setMsg('') }}>
        <span aria-hidden="true">{g.emoji}</span><b>{g.title}</b><small>{g.learn}</small>
      </button>)}</div>
    </>}
  </div>
}
