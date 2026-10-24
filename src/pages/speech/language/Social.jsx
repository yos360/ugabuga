import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import QuickAnswer from '../../../components/ui/QuickAnswer'
import { Sheet } from '../../../components/printables/PrintableShell'
import { speak, stopSpeaking } from '../../../utils/speak'
import SpeechNote from '../SpeechNote'
import { SheetsPreview, TextBox } from '../speechSheets'
import { CutLines, EMOJI, Guide, LanguageNav, Li, Pills, SheetHeader, Txt, rng } from '../languageShared'
import { Face, FaceG } from './Faces'
import { shuffleWith } from '../../../data/speech/categories'
import {
  EMOTIONS, emotionById, feelWord, feelBoth, G, FEEL_SCENES, SECTIONS, POLITE, SAY_SCENES, THINK_SCENES,
  STARTER_GROUPS, DEFAULT_STARTERS, STORY_PARTS, STORY_EXAMPLE,
} from '../../../data/speech/social'

// /speech/language/social — social (pragmatic) language: feelings from faces and situations, requests
// and polite words, starting and keeping a conversation, and perspective ("what is he thinking?").
// Every option comes with a kind explanation; there is no score and no "wrong". Printables: emotions
// bingo, face cards, feeling-situation cards, "what can you say?" cards, thought-bubble cards, a
// personal "my conversation starters" card and a personal-story template.

const PATH = '/speech/language/social'
const UPDATED = '2026-10-24'
const say = text => speak(text.replace(/[„”]/g, ''), 'he-IL', { rate: 0.85 })
const SENSORY = '/printables/sensory-communication-cards'

const btn = 'min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 font-bold'

// ── On-screen scene ─────────────────────────────────────────────────────────

function SceneBox({ item, thought }) {
  return <div className={`relative flex min-h-[150px] items-end justify-center gap-3 rounded-2xl border-2 border-slate-800 bg-gradient-to-b from-sky-50 to-white px-4 pb-4 ${thought === undefined ? 'pt-6' : 'pt-28'}`} aria-hidden="true">
    {thought !== undefined && <div className="absolute right-3 top-3 max-w-[60%] rounded-[1.5rem] border-2 border-slate-700 bg-white px-3 py-2 text-base font-bold leading-snug shadow-sm">
      {thought || <span className="text-2xl">💭 ?</span>}
      <span className="absolute -bottom-3 left-6 h-3 w-3 rounded-full border-2 border-slate-700 bg-white" />
      <span className="absolute -bottom-6 left-3 h-2 w-2 rounded-full border-2 border-slate-700 bg-white" />
    </div>}
    <span className="text-6xl leading-none">{G.kid(item.g)}</span>
    {item.scene.map((e, i) => <span key={i} className="text-5xl leading-none">{e}</span>)}
  </div>
}

const Feedback = ({ msg, tone }) => <p aria-live="polite" className={`mt-3 min-h-[3rem] rounded-xl px-3 py-2 font-bold leading-relaxed ${msg ? (tone === 'good' ? 'bg-emerald-50 text-emerald-900' : tone === 'also' ? 'bg-sky-50 text-sky-900' : 'bg-amber-50 text-amber-900') : ''}`}>{msg}</p>

// ── Feelings: from situations and from faces ───────────────────────────────

function FeelPlay() {
  const [mode, setMode] = useState('scene')
  const [i, setI] = useState(0)
  const [tried, setTried] = useState([])
  const [done, setDone] = useState(null)
  const [msg, setMsg] = useState({ t: '', tone: '' })
  const faceOrder = useMemo(() => shuffleWith(EMOTIONS.map(e => e.id), rng(7)), [])
  const list = mode === 'scene' ? FEEL_SCENES : faceOrder
  const k = i % list.length
  const reset = () => { setTried([]); setDone(null); setMsg({ t: '', tone: '' }) }
  const next = () => { setI(i + 1); reset() }
  useEffect(() => () => stopSpeaking(), [])

  if (mode === 'face') {
    const id = faceOrder[k]
    const others = EMOTIONS.map(e => e.id).filter(x => x !== id)
    const choices = shuffleWith([id, ...shuffleWith(others, rng(k * 13 + 5)).slice(0, 2)], rng(k * 7 + 1))
    const pick = c => {
      if (done) return
      if (c === id) {
        const t = `${feelBoth(id)}. רמזים בפנים: ${emotionById[id].cue}. פנים הן רק רמז אחד — הכי בטוח לשאול: „איך את/ה מרגיש/ה?”`
        setDone(c); setMsg({ t, tone: 'good' }); say(`${feelBoth(id)}. ${emotionById[id].cue}.`)
      } else { setTried(x => [...x, c]); setMsg({ t: `${feelBoth(c)}? אפשר להסתכל שוב על הגבות, העיניים והפה.`, tone: 'try' }) }
    }
    return <div className="space-y-4">
      <Pills label="איך משחקים" value={mode} onChange={v => { setMode(v); setI(0); reset() }} tone="soft" options={[['scene', '📖 מה קרה — ואיך הוא מרגיש?'], ['face', '🙂 מה הפנים מראות?']]} />
      <div className="mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm">
        <p className="text-sm font-bold text-[var(--muted-foreground)]">פנים {k + 1} מתוך {faceOrder.length}</p>
        <Face id={id} size={160} label="פנים — איזה רגש הן מראות?" className="mx-auto my-2" />
        <h3 className="text-2xl font-black">איזה רגש הפנים מראות?</h3>
        <div className="mt-3 grid gap-2">
          {choices.map(c => <button key={c} type="button" onClick={() => pick(c)}
            className={`min-h-[52px] rounded-2xl border-2 px-3 text-xl font-bold ${done === c ? 'border-emerald-500 bg-emerald-50' : tried.includes(c) ? 'border-slate-300 bg-slate-50 opacity-60' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/50'}`}>{feelBoth(c)}</button>)}
        </div>
        <Feedback msg={msg.t} tone={msg.tone} />
        <button type="button" onClick={next} className={`min-h-[48px] rounded-xl px-6 font-bold ${done ? 'bg-emerald-600 text-white' : 'border-2 border-[var(--border)] bg-white text-sm'}`}>{done ? 'לפנים הבאות ←' : 'דילוג ←'}</button>
      </div>
    </div>
  }

  const s = FEEL_SCENES[k]
  const distract = shuffleWith(EMOTIONS.map(e => e.id).filter(x => x !== s.feel && !s.also.includes(x)), rng(k * 31 + 3)).slice(0, 1)
  const choices = shuffleWith([s.feel, s.also[0], ...distract], rng(k * 17 + 2))
  const question = `איך ${s.name} ${G.feels(s.g)}?`
  const pick = c => {
    if (done) return
    const w = feelWord(c, s.g)
    if (c === s.feel) { const t = `${s.name} כנראה ${G.feels(s.g)} ${w} — ${s.why}`; setDone(c); setMsg({ t, tone: 'good' }); say(t) }
    else if (s.also.includes(c)) { const t = `גם זה יכול להיות! ${s.name} ${G.can(s.g)} להרגיש ${w}. הרבה ילדים היו מרגישים גם ${feelWord(s.feel, s.g)} — ${s.why}`; setDone(c); setMsg({ t, tone: 'also' }); say(t) }
    else { setTried(x => [...x, c]); const t = `${w}? בואו נקרא שוב מה קרה. מה עוד ${s.name} ${G.can(s.g)} להרגיש?`; setMsg({ t, tone: 'try' }); say(t) }
  }
  return <div className="space-y-4">
    <Pills label="איך משחקים" value={mode} onChange={v => { setMode(v); setI(0); reset() }} tone="soft" options={[['scene', '📖 מה קרה — ואיך הוא מרגיש?'], ['face', '🙂 מה הפנים מראות?']]} />
    <div className="grid items-start gap-4 md:grid-cols-2">
      <div>
        <SceneBox item={s} />
        <p className="mt-3 text-center text-xl font-bold leading-relaxed">{s.text}</p>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm">
        <p className="text-sm font-bold text-[var(--muted-foreground)]">מצב {k + 1} מתוך {FEEL_SCENES.length}</p>
        <h3 className="mt-1 text-2xl font-black">{question} <span className="text-[var(--muted-foreground)]">ולמה?</span></h3>
        <button type="button" onClick={() => say(`${s.text} ${question}`)} className={`mt-2 ${btn}`}>🔊 הקראה</button>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {choices.map(c => <button key={c} type="button" onClick={() => pick(c)} aria-label={feelWord(c, s.g)}
            className={`flex flex-col items-center rounded-2xl border-2 p-2 font-bold ${done === c ? 'border-emerald-500 bg-emerald-50' : tried.includes(c) ? 'border-slate-300 bg-slate-50 opacity-60' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/50'}`}>
            <Face id={c} size={72} label={false} /><span className="mt-1 text-lg">{feelWord(c, s.g)}</span></button>)}
        </div>
        <Feedback msg={msg.t} tone={msg.tone} />
        <button type="button" onClick={next} className={`min-h-[48px] rounded-xl px-6 font-bold ${done ? 'bg-emerald-600 text-white' : 'border-2 border-[var(--border)] bg-white text-sm'}`}>{done ? 'למצב הבא ←' : 'דילוג ←'}</button>
      </div>
    </div>
  </div>
}

// ── "What can you say?" and "What is he thinking?" ─────────────────────────

const optLabel = o => o.act ? `(${o.t})` : o.t

function ScenarioPlay({ list, think = false }) {
  const [i, setI] = useState(0)
  const [seen, setSeen] = useState([])
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState({ t: '', tone: '' })
  const k = i % list.length
  const s = list[k]
  const order = useMemo(() => shuffleWith(s.opts.map((_, j) => j), rng(k * 29 + s.id.length)), [s, k])
  const reset = () => { setSeen([]); setDone(false); setMsg({ t: '', tone: '' }) }
  useEffect(() => () => stopSpeaking(), [])
  const choose = j => {
    const o = s.opts[j]
    setSeen(x => x.includes(j) ? x : [...x, j])
    setMsg({ t: o.note, tone: o.fit ? 'good' : 'try' })
    say(o.act ? o.note : `${o.t} ${o.note}`)
    if (o.fit) setDone(true)
  }
  const fitText = think ? (done ? s.opts.find((o, j) => o.fit && seen.includes(j))?.t : '') : undefined
  return <div className="grid items-start gap-4 md:grid-cols-2">
    <div>
      <SceneBox item={s} thought={fitText} />
      <p className="mt-3 text-center text-xl font-bold leading-relaxed">{s.text}</p>
    </div>
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm">
      <p className="text-sm font-bold text-[var(--muted-foreground)]">מצב {k + 1} מתוך {list.length}</p>
      <h3 className="mt-1 text-2xl font-black">{s.q}</h3>
      <button type="button" onClick={() => say(`${s.text} ${s.q}`)} className={`mt-2 ${btn}`}>🔊 הקראה</button>
      <div className="mt-3 grid gap-2">
        {order.map(j => {
          const o = s.opts[j], was = seen.includes(j)
          const st = was ? (o.fit ? 'border-emerald-500 bg-emerald-50' : 'border-amber-400 bg-amber-50') : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/50'
          return <button key={j} type="button" onClick={() => choose(j)} className={`min-h-[56px] rounded-2xl border-2 px-3 text-lg font-bold ${o.act ? 'italic' : ''} ${st}`}>
            {!o.act && <span aria-hidden="true">{think ? '💭 ' : '💬 '}</span>}{optLabel(o)}</button>
        })}
      </div>
      <Feedback msg={msg.t} tone={msg.tone} />
      <p className="mb-2 text-sm text-[var(--muted-foreground)]">{done ? 'אפשר ללחוץ גם על האפשרויות האחרות ולדבר עליהן.' : 'יש לפעמים יותר מתשובה טובה אחת.'}</p>
      <button type="button" onClick={() => { setI(i + 1); reset() }} className={`min-h-[48px] rounded-xl px-6 font-bold ${done ? 'bg-emerald-600 text-white' : 'border-2 border-[var(--border)] bg-white text-sm'}`}>{done ? 'למצב הבא ←' : 'דילוג ←'}</button>
    </div>
  </div>
}

function Play() {
  const [sec, setSec] = useState('feel')
  const askList = useMemo(() => SAY_SCENES.filter(s => s.sec === 'ask'), [])
  const talkList = useMemo(() => SAY_SCENES.filter(s => s.sec === 'talk'), [])
  const current = SECTIONS.find(s => s.id === sec)
  return <div className="space-y-4">
    <div role="group" aria-label="נושא" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {SECTIONS.map(s => <button key={s.id} type="button" aria-pressed={sec === s.id} onClick={() => setSec(s.id)}
        className={`min-h-[56px] rounded-2xl border-2 px-3 font-bold ${sec === s.id ? 'border-violet-500 bg-violet-600 text-white' : 'border-[var(--border)] bg-white'}`}>
        <span aria-hidden="true">{s.e} </span>{s.title}</button>)}
    </div>
    <p className="text-center text-[var(--muted-foreground)]">{current.long}</p>
    {sec === 'feel' && <FeelPlay />}
    {sec === 'ask' && <>
      <div className="flex flex-wrap justify-center gap-2">
        {POLITE.map(p => <button key={p.t} type="button" onClick={() => say(p.t)} title={p.when} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-[var(--postit)] px-3 font-bold">
          <span aria-hidden="true">{p.e} </span>{p.t}</button>)}
      </div>
      <ScenarioPlay key="ask" list={askList} />
    </>}
    {sec === 'talk' && <ScenarioPlay key="talk" list={talkList} />}
    {sec === 'think' && <ScenarioPlay key="think" list={THINK_SCENES} think />}
  </div>
}

// ── Printables ──────────────────────────────────────────────────────────────

const wordFor = (id, gender) => gender === 'b' ? feelBoth(id) : feelWord(id, gender)
const SceneEmojis = ({ item, cx, cy, size, kid = true }) => {
  const list = kid ? [G.kid(item.g), ...item.scene] : item.scene
  const gap = size * 1.15, x0 = cx + ((list.length - 1) * gap) / 2
  return <g>{list.map((e, i) => <text key={i} x={x0 - i * gap} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={size} fontFamily={EMOJI}>{e}</text>)}</g>
}
const grid = (n, cols, { x0 = 5, y0 = 22, w = 190, h = 242, rows }) => {
  const r = rows || Math.ceil(n / cols), cw = w / cols, ch = h / r
  return Array.from({ length: n }, (_, i) => ({ x: x0 + w - ((i % cols) + 1) * cw, y: y0 + Math.floor(i / cols) * ch, w: cw, h: ch }))
}
const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n))

function faceCardsSheet({ color, gender }) {
  const cells = grid(8, 2, { rows: 4 })
  return {
    key: 'faces',
    svg: <Sheet label="כרטיסי רגשות — פנים ומילה">
      <SheetHeader title="כרטיסי רגשות" note="✂ גוזרים · מראים כרטיס ושואלים: „מתי הרגשת ככה?” · אפשר להדפיס פעמיים למשחק זיכרון" />
      <CutLines cells={cells} />
      {EMOTIONS.map((e, i) => {
        const c = cells[i]
        return <g key={e.id}>
          <rect x={c.x + 2} y={c.y + 2} width={c.w - 4} height={c.h - 4} rx={3} fill="#fff" stroke={color ? e.color[0] : '#111'} strokeWidth=".7" />
          <FaceG id={e.id} x={c.x + c.w - 2 - 50} y={c.y + 6} size={48} color={color} />
          <TextBox x={c.x + 6} y={c.y + 8} w={c.w - 62} h={c.h - 16} text={wordFor(e.id, gender)} max={10} maxLines={2} />
        </g>
      })}
    </Sheet>,
  }
}

function bingoSheets({ color, gender, seed }) {
  const rand = rng(seed)
  const boards = Array.from({ length: 6 }, () => {
    const ids = shuffleWith(EMOTIONS.map(e => e.id), rand)
    return [...ids.slice(0, 4), 'free', ...ids.slice(4)]
  })
  const cell = 38, bw = cell * 3, x0 = 100 - bw / 2
  const board = (ids, y, n) => <g key={n}>
    <Txt x={x0 + bw} y={y + 8} size={5.2} weight={900} anchor="start">בינגו רגשות · לוח {n}</Txt>
    <Txt x={x0} y={y + 8} size={3.6} anchor="end" fill="#374151">שם: ______________</Txt>
    <rect x={x0} y={y + 12} width={bw} height={bw} fill="none" stroke="#111" strokeWidth=".9" />
    {ids.map((id, i) => {
      const cx = x0 + bw - ((i % 3) + 1) * cell, cy = y + 12 + Math.floor(i / 3) * cell
      return <g key={i}>
        <rect x={cx} y={cy} width={cell} height={cell} fill="none" stroke="#111" strokeWidth=".4" />
        {id === 'free'
          ? <><text x={cx + cell / 2} y={cy + cell * 0.4} textAnchor="middle" dominantBaseline="central" fontSize={13} fontFamily={EMOJI}>⭐</text>
            <Txt x={cx + cell / 2} y={cy + cell * 0.82} size={3.6} weight={800}>משבצת חופשית</Txt></>
          : <><FaceG id={id} x={cx + cell / 2 - 13.5} y={cy + 2} size={27} color={color} />
            <Txt x={cx + cell / 2} y={cy + cell - 3.5} size={wordFor(id, gender).length > 9 ? 3.6 : 4.4} weight={800}>{wordFor(id, gender)}</Txt></>}
      </g>
    })}
  </g>
  const boardPages = chunk(boards, 2).map((list, p) => ({
    key: `bingo-${p}`,
    svg: <Sheet label="בינגו רגשות — לוחות">
      {list.map((ids, i) => board(ids, 6 + i * 131, p * 2 + i + 1))}
      <Txt x={100} y={266} size={3.2} fill="#4b5563">כל לוח בסדר אחר · מכסים את הרגש שנקרא, או רגש שמתאים למצב שהוקרא</Txt>
    </Sheet>,
  }))
  const callCells = grid(8, 4, { rows: 2, h: 100 })
  const sitCells = grid(FEEL_SCENES.length, 2, { y0: 130, h: 136, rows: 7 })
  const calls = {
    key: 'bingo-calls',
    svg: <Sheet label="בינגו רגשות — כרטיסי קריאה">
      <SheetHeader title="בינגו רגשות — כרטיסי קריאה" note="✂ גוזרים ושולפים: למתחילים — כרטיס פנים; למתקדמים — כרטיס מצב, וכל אחד מכסה רגש שמתאים לו (אפשר יותר מאחד!)" />
      <CutLines cells={callCells} />
      {EMOTIONS.map((e, i) => {
        const c = callCells[i]
        return <g key={e.id}>
          <FaceG id={e.id} x={c.x + c.w / 2 - 17} y={c.y + 5} size={34} color={color} />
          <Txt x={c.x + c.w / 2} y={c.y + c.h - 7} size={4.6} weight={800}>{wordFor(e.id, gender)}</Txt>
        </g>
      })}
      <Txt x={100} y={127} size={3.6} weight={800} fill="#374151">כרטיסי מצב — „איך הוא מרגיש?”</Txt>
      <CutLines cells={sitCells} />
      {FEEL_SCENES.map((s, i) => {
        const c = sitCells[i]
        return <g key={s.id}>
          <SceneEmojis item={{ ...s, scene: s.scene.slice(0, 1) }} cx={c.x + c.w - 9} cy={c.y + c.h / 2} size={6} kid={false} />
          <TextBox x={c.x + 2} y={c.y + 1} w={c.w - 17} h={c.h - 2} text={s.text} max={4.2} weight={600} maxLines={3} />
        </g>
      })}
    </Sheet>,
  }
  return [...boardPages, calls]
}

function feelSceneSheets({ color }) {
  return chunk(FEEL_SCENES, 6).map((list, p) => {
    const cells = grid(list.length, 2, { rows: 3 })
    return {
      key: `feel-${p}`,
      svg: <Sheet label="כרטיסי מצב — איך הוא מרגיש ולמה">
        <SheetHeader title="איך הוא מרגיש — ולמה?" note="✂ קוראים יחד, מקיפים את הרגש (אפשר יותר מאחד) ומספרים למה" />
        <CutLines cells={cells} />
        {list.map((s, i) => {
          const c = cells[i], k = p * 6 + i
          const distract = shuffleWith(EMOTIONS.map(e => e.id).filter(x => x !== s.feel && !s.also.includes(x)), rng(k * 31 + 3)).slice(0, 1)
          const ids = shuffleWith([s.feel, s.also[0], ...distract], rng(k * 17 + 2))
          return <g key={s.id}>
            <rect x={c.x + 2} y={c.y + 2} width={c.w - 4} height={c.h - 4} rx={3} fill="#fff" stroke="#111" strokeWidth=".6" />
            <SceneEmojis item={s} cx={c.x + c.w / 2} cy={c.y + 12} size={10} />
            <TextBox x={c.x + 5} y={c.y + 19} w={c.w - 10} h={17} text={s.text} max={4.4} weight={600} maxLines={3} />
            <Txt x={c.x + c.w / 2} y={c.y + 41} size={4.4} weight={900}>{`איך ${s.name} ${G.feels(s.g)}? למה?`}</Txt>
            {ids.map((id, j) => {
              const fx = c.x + c.w - 6 - (j + 1) * ((c.w - 12) / 3) + ((c.w - 12) / 3 - 22) / 2
              return <g key={id}>
                <FaceG id={id} x={fx} y={c.y + 44} size={22} color={color} />
                <Txt x={fx + 11} y={c.y + 71} size={3.6} weight={700}>{feelWord(id, s.g)}</Txt>
              </g>
            })}
          </g>
        })}
      </Sheet>,
    }
  })
}

function saySheets({ which }) {
  const list = SAY_SCENES.filter(s => which === 'all' || s.sec === which)
  return chunk(list, 4).map((part, p) => {
    const cells = grid(part.length, 1, { rows: 4 })
    return {
      key: `say-${p}`,
      svg: <Sheet label="כרטיסי מצב — מה אפשר להגיד?">
        <SheetHeader title="מה אפשר להגיד?" note="✂ קוראים, בוחרים — ומדברים על כל אפשרות: מה הצד השני ירגיש? יש לפעמים יותר מתשובה טובה אחת" />
        <CutLines cells={cells} />
        {part.map((s, i) => {
          const c = cells[i]
          return <g key={s.id}>
            <rect x={c.x + 2} y={c.y + 2} width={c.w - 4} height={c.h - 4} rx={3} fill="#fff" stroke="#111" strokeWidth=".6" />
            <SceneEmojis item={s} cx={c.x + c.w - 22} cy={c.y + c.h / 2 - 4} size={9} />
            <TextBox x={c.x + 6} y={c.y + 4} w={c.w - 50} h={15} text={s.text} max={5.2} weight={700} maxLines={2} />
            <Txt x={c.x + c.w - 46} y={c.y + 25} size={4.8} weight={900} anchor="start">{s.q}</Txt>
            {s.opts.map((o, j) => <g key={j}>
              <circle cx={c.x + c.w - 49} cy={c.y + 32.4 + j * 8.6} r={3.4} fill="none" stroke="#111" strokeWidth=".5" />
              <Txt x={c.x + c.w - 49} y={c.y + 33.9 + j * 8.6} size={3.8} weight={800}>{['א', 'ב', 'ג'][j]}</Txt>
              <Txt x={c.x + c.w - 55} y={c.y + 34.1 + j * 8.6} size={4.5} weight={o.act ? 400 : 700} fill={o.act ? '#374151' : '#111'} anchor="start">{o.act ? `(${o.t})` : o.t}</Txt>
            </g>)}
          </g>
        })}
      </Sheet>,
    }
  })
}

function thinkSheets() {
  return chunk(THINK_SCENES, 4).map((part, p) => {
    const cells = grid(part.length, 2, { rows: 2 })
    return {
      key: `think-${p}`,
      svg: <Sheet label="בועות מחשבה — מה הוא חושב?">
        <SheetHeader title="מה הוא חושב?" note="✂ קוראים יחד ומציירים או כותבים בבועה מה הדמות חושבת" />
        <CutLines cells={cells} />
        {part.map((s, i) => {
          const c = cells[i]
          const bx = c.x + c.w / 2 + 2, by = c.y + 30
          return <g key={s.id}>
            <rect x={c.x + 2} y={c.y + 2} width={c.w - 4} height={c.h - 4} rx={3} fill="#fff" stroke="#111" strokeWidth=".6" />
            <ellipse cx={bx} cy={by} rx={38} ry={22} fill="#fff" stroke="#111" strokeWidth=".7" />
            <circle cx={c.x + c.w - 30} cy={c.y + 58} r={3} fill="#fff" stroke="#111" strokeWidth=".6" />
            <circle cx={c.x + c.w - 25} cy={c.y + 64} r={1.8} fill="#fff" stroke="#111" strokeWidth=".6" />
            <text x={c.x + c.w - 16} y={c.y + 70} textAnchor="middle" dominantBaseline="central" fontSize={13} fontFamily={EMOJI}>{G.kid(s.g)}</text>
            <SceneEmojis item={s} cx={c.x + 26} cy={c.y + 70} size={8} kid={false} />
            <TextBox x={c.x + 5} y={c.y + 80} w={c.w - 10} h={30} text={s.text} max={4.2} weight={600} maxLines={4} />
            <Txt x={c.x + c.w / 2} y={c.y + c.h - 6} size={4.4} weight={900}>{s.q}</Txt>
          </g>
        })}
      </Sheet>,
    }
  })
}

function startersSheet({ name, starters, topics, color }) {
  const card = (y) => {
    const h = 125, list = starters.slice(0, 8)
    const cells = grid(list.length, 2, { x0: 12, y0: y + 24, w: 176, h: 64, rows: 4 })
    return <g>
      <rect x={6} y={y} width={188} height={h} rx={5} fill={color ? '#f5f3ff' : '#fff'} stroke="#111" strokeWidth=".8" />
      <Txt x={100} y={y + 11} size={7} weight={900}>💬 פותחי השיחה שלי</Txt>
      <Txt x={100} y={y + 19} size={4} fill="#374151">{name ? `של ${name}` : 'שם: __________________'}</Txt>
      {list.map((t, i) => {
        const c = cells[i]
        return <g key={i}>
          <rect x={c.x + 1.5} y={c.y + 1.5} width={c.w - 3} height={c.h - 3} rx={6} fill="#fff" stroke={color ? '#7c3aed' : '#111'} strokeWidth=".5" />
          <TextBox x={c.x + 4} y={c.y + 2} w={c.w - 8} h={c.h - 4} text={t} max={5} weight={700} maxLines={2} />
        </g>
      })}
      <Txt x={182} y={y + 97} size={4.4} weight={800} anchor="start">דברים שאני אוהב/ת לדבר עליהם:</Txt>
      {[0, 1].map(r => <g key={r}>
        <line x1={18} x2={182} y1={y + 107 + r * 9} y2={y + 107 + r * 9} stroke="#9ca3af" strokeWidth=".4" />
        {r === 0 && topics && <Txt x={180} y={y + 106} size={4.6} weight={600} anchor="start">{topics}</Txt>}
      </g>)}
    </g>
  }
  return {
    key: 'starters',
    svg: <Sheet label="פותחי השיחה שלי">
      {card(6)}
      <line x1={0} x2={200} y1={135} y2={135} stroke="#9ca3af" strokeWidth=".35" strokeDasharray="2 1.4" />
      <Txt x={100} y={137.8} size={2.6} fill="#9ca3af">✂</Txt>
      {card(140)}
    </Sheet>,
  }
}

function storySheet() {
  const top = 34, h = 37.5
  return {
    key: 'story',
    svg: <Sheet label="תבנית לסיפור אישי">
      <Txt x={100} y={11} size={6.6} weight={900}>הסיפור שלי: ______________________</Txt>
      <Txt x={100} y={18} size={3.3} fill="#4b5563">כותבים יחד עם הילד/ה, בגוף ראשון, במשפטים שמתארים — ומציירים או מדביקים תמונה בכל חלק</Txt>
      <Txt x={195} y={27} size={3.8} anchor="start">כתבנו יחד: _______________ ו־_______________ · תאריך: ___________</Txt>
      {STORY_PARTS.map((part, i) => {
        const y = top + i * h
        return <g key={i}>
          <rect x={5} y={y} width={190} height={h - 3} rx={3} fill="#fff" stroke="#111" strokeWidth=".6" />
          <rect x={8} y={y + 3} width={48} height={h - 9} rx={2} fill="#fff" stroke="#9ca3af" strokeWidth=".4" strokeDasharray="1.6 1.2" />
          <Txt x={32} y={y + h / 2} size={2.8} fill="#9ca3af">ציור או תמונה</Txt>
          <Txt x={191} y={y + 7} size={4} weight={900} anchor="start">{`${i + 1}. ${part.title}`}</Txt>
          <Txt x={60} y={y + 7} size={2.8} fill="#6b7280" anchor="end">{part.hint}</Txt>
          <Txt x={191} y={y + 15.5} size={4.4} weight={500} anchor="start" fill="#374151">{part.starter}</Txt>
          {[0, 1, 2].map(r => <line key={r} x1={62} x2={190} y1={y + 16.5 + r * 7} y2={y + 16.5 + r * 7} stroke="#9ca3af" strokeWidth=".35" />)}
        </g>
      })}
      <Txt x={100} y={266} size={3} fill="#4b5563">קוראים את הסיפור ברגע רגוע, כמה פעמים לפני המצב — ומעדכנים אותו כשמשהו משתנה</Txt>
    </Sheet>,
  }
}

const PRINTS = [
  ['bingo', '🎯 בינגו רגשות'], ['faces', '🙂 כרטיסי פנים'], ['feel', '📖 איך הוא מרגיש?'], ['say', '💬 מה אפשר להגיד?'],
  ['think', '💭 בועות מחשבה'], ['starters', '🗂️ פותחי השיחה שלי'], ['story', '📝 תבנית לסיפור אישי'],
]

function StartersPicker({ name, setName, starters, setStarters, topics, setTopics }) {
  const [custom, setCustom] = useState('')
  const toggle = t => setStarters(s => s.includes(t) ? s.filter(x => x !== t) : s.length >= 8 ? s : [...s, t])
  const add = () => { const t = custom.trim(); if (t && !starters.includes(t) && starters.length < 8) setStarters(s => [...s, t]); setCustom('') }
  return <div className="mb-4 space-y-3 rounded-2xl bg-[var(--postit)]/40 p-4">
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block font-bold">שם הילד/ה (לא חובה)
        <input value={name} onChange={e => setName(e.target.value.slice(0, 20))} className="mt-1 block min-h-[44px] w-full rounded-xl border-2 border-[var(--border)] bg-white px-3" />
      </label>
      <label className="block font-bold">נושאים שאני אוהב/ת (לא חובה)
        <input value={topics} onChange={e => setTopics(e.target.value.slice(0, 40))} placeholder="למשל: רכבות, חתולים, כדורגל" className="mt-1 block min-h-[44px] w-full rounded-xl border-2 border-[var(--border)] bg-white px-3" />
      </label>
    </div>
    <p className="font-bold">בוחרים עד 8 משפטים ({starters.length}/8):</p>
    {STARTER_GROUPS.map(g => <div key={g.id} role="group" aria-label={g.title} className="flex flex-wrap items-center gap-2">
      <span className="w-full text-sm font-bold text-[var(--muted-foreground)] sm:w-auto">{g.title}:</span>
      {g.items.map(t => <button key={t} type="button" aria-pressed={starters.includes(t)} onClick={() => toggle(t)}
        className={`min-h-[40px] rounded-full border-2 px-3 text-sm font-bold ${starters.includes(t) ? 'border-violet-500 bg-violet-600 text-white' : 'border-[var(--border)] bg-white'}`}>{t}</button>)}
    </div>)}
    <div className="flex flex-wrap gap-2">
      <input value={custom} onChange={e => setCustom(e.target.value.slice(0, 32))} onKeyDown={e => { if (e.key === 'Enter') add() }} aria-label="משפט משלכם"
        placeholder="משפט משלכם…" className="min-h-[44px] flex-1 rounded-xl border-2 border-[var(--border)] bg-white px-3" />
      <button type="button" onClick={add} className={btn}>➕ הוספה</button>
    </div>
  </div>
}

function Printables() {
  const [type, setType] = useState('bingo')
  const [color, setColor] = useState(true)
  const [gender, setGender] = useState('b')
  const [which, setWhich] = useState('all')
  const [seed, setSeed] = useState(1)
  const [name, setName] = useState('')
  const [topics, setTopics] = useState('')
  const [starters, setStarters] = useState(DEFAULT_STARTERS)
  const pages = useMemo(() => {
    if (type === 'bingo') return bingoSheets({ color, gender, seed })
    if (type === 'faces') return [faceCardsSheet({ color, gender })]
    if (type === 'feel') return feelSceneSheets({ color })
    if (type === 'say') return saySheets({ which })
    if (type === 'think') return thinkSheets()
    if (type === 'starters') return [startersSheet({ name: name.trim(), starters, topics: topics.trim(), color })]
    return [storySheet()]
  }, [type, color, gender, which, seed, name, starters, topics])
  const hasFaces = ['bingo', 'faces', 'feel'].includes(type)
  return <section id="print" aria-labelledby="social-print" className="mb-10 scroll-mt-24 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
    <h2 id="social-print" className="mb-2 text-center text-2xl font-bold">🖨️ דפים להדפסה</h2>
    <p className="mb-4 text-center text-[var(--muted-foreground)]">A4, עם קווי גזירה. הפנים ברורות גם בשחור־לבן.</p>
    <div className="mb-3"><Pills label="מה להדפיס" value={type} onChange={setType} options={PRINTS} tone="soft" /></div>
    <div className="mb-4 flex flex-wrap justify-center gap-3">
      {(hasFaces || type === 'starters') && <Pills label="צבע" value={color} onChange={setColor} tone="soft" options={[[true, '🎨 צבע'], [false, '⚫ שחור־לבן']]} />}
      {(type === 'bingo' || type === 'faces') && <Pills label="נוסח המילים" value={gender} onChange={setGender} tone="soft" options={[['b', 'שמח / שמחה'], ['m', 'לבן'], ['f', 'לבת']]} />}
      {type === 'say' && <Pills label="אילו מצבים" value={which} onChange={setWhich} tone="soft" options={[['all', 'הכול'], ['ask', '🙏 בקשות ונימוס'], ['talk', '💬 שיחה ותורות']]} />}
    </div>
    {type === 'starters' && <StartersPicker {...{ name, setName, starters, setStarters, topics, setTopics }} />}
    {type === 'story' && <p className="mb-4 text-center text-sm text-[var(--muted-foreground)]">לפני שכותבים — כדאי לקרוא את <a href="#story" className="font-bold underline">ההנחיות לכתיבת סיפור אישי</a> למטה.</p>}
    <SheetsPreview pages={pages} title={PRINTS.find(p => p[0] === type)[1].replace(/^\S+\s/, '')} onRefresh={type === 'bingo' ? () => setSeed(s => s + 1) : undefined} />
  </section>
}

// ── Page ─────────────────────────────────────────────────────────────────────

const faq = [
  { q: 'מה זה שפה חברתית (פרגמטית)?', a: 'שפה חברתית היא השימוש בשפה עם אנשים אחרים: לבקש, להודות, לפתוח שיחה, לחכות לתור, להישאר בנושא, להבין מה אחר מרגיש או חושב, ולהתאים את הדברים למי שמולנו. אלה מיומנויות שנבנות לאט — בעיקר מתוך משחק ושיחה אמיתית.' },
  { q: 'איך מלמדים ילד לזהות רגשות?', a: 'מתחילים ברגשות בסיסיים (שמח, עצוב, כועס, מפחד), ומחברים כל רגש למצב: „הבלון עף — מאיה עצובה”. מדברים על רמזים — מה קרה, מה הפנים מראות, מה הקול אומר — ובעיקר נותנים שם לרגשות של הילד/ה עצמו/ה ברגע אמת: „נראה לי שאתה מתוסכל, המגדל נפל”. כדאי לזכור שפנים הן רק רמז אחד, ושכל אחד מבטא רגשות קצת אחרת.' },
  { q: 'מה זה סיפור חברתי?', a: 'סיפור קצר ואישי שמתאר מצב מסוים — מה קורה, מה אחרים חושבים ומרגישים, ומה הילד/ה יכול/ה לנסות — במשפטים חיוביים ומתארים, בדרך כלל בגוף ראשון. את הגישה פיתחה המחנכת האמריקאית קרול גריי בתחילת שנות ה־90. כאן יש תבנית פשוטה בהשראת העקרונות, וכדאי לכתוב את הסיפור יחד עם הקלינאית או הגננת.' },
  { q: 'האם יש כאן תשובה נכונה אחת?', a: 'לא תמיד. במצבים חברתיים יש בדרך כלל כמה דרכים טובות. כל אפשרות בעמוד מקבלת הסבר: מה היא עושה לשיחה ומה הצד השני ירגיש. אין ציון, ואין „טעות” — יש הזדמנות לדבר.' },
  { q: 'האם העמוד מתאים לילדים על הספקטרום האוטיסטי?', a: 'כן, וגם לכל ילד. המטרה היא תקשורת והרגשה טובה — לא לשנות את מי שהילד/ה. לא דורשים קשר עין, לא דורשים לדבר דווקא במילים (גם הצבעה, כרטיס או לוח תקשורת הם תקשורת), ומכבדים תחומי עניין עמוקים. מומלץ להתאים את המצבים לחיים של הילד/ה, ביחד עם הצוות המטפל.' },
  { q: 'איך משחקים בבינגו רגשות?', a: 'כל משתתף מקבל לוח. המבוגר שולף כרטיס פנים (למתחילים) או כרטיס מצב (למתקדמים), ומי שיש לו את הרגש מכסה אותו. בכרטיסי המצב אפשר לכסות כל רגש שמתאים — ולהסביר למה. מי שמשלים שורה אומר „בינגו!” ומספר על פעם שהרגיש אחד הרגשות בשורה.' },
  { q: 'החומרים מחליפים טיפול?', a: 'לא. הם נועדו לתרגול ולהעשרה. אם יש קושי בתקשורת החברתית, בהבנה או בדיבור — כדאי לפנות לקלינאי/ת תקשורת להערכה.' },
]

const related = [
  { label: 'שפה — כל העמודים', href: '/speech/language' },
  { label: 'שאלות מי, מה, איפה, למה', href: '/speech/language/wh-questions' },
  { label: 'סיפור ברצף', href: '/speech/language/sequencing' },
  { label: 'לוחות תקשורת תת״ח', href: '/speech/aac' },
  { label: 'כרטיסיות ויסות, רגשות וסדר יום', href: SENSORY },
  { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
]

export default function Social() {
  const scenarios = FEEL_SCENES.length + SAY_SCENES.length + THINK_SCENES.length
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO path={PATH}
      title="שפה חברתית לילדים — רגשות, בקשות ושיחה | משחק ודפי עבודה לגן"
      description="שפה חברתית לגן: זיהוי רגשות לילדים מפנים וממצבים, בקשות ומילות נימוס, פתיחת שיחה ותורות, „מה הוא חושב?”. משחק עם שמע, בינגו רגשות, כרטיסי מצב, כישורים חברתיים לגן דפי עבודה ותבנית לסיפור חברתי — חינם."
      structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'שפה', href: '/speech/language' }, { label: 'שפה חברתית' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">🤝 </span>שפה חברתית: תורות, בקשות, רגשות ושיחה</h1>
    <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">8 רגשות בפנים מצוירות ו־{scenarios} מצבים מהגן ומהבית · עם שמע, הסברים חיוביים ודפים להדפסה</p>
    <div className="mx-auto max-w-4xl">
      <QuickAnswer q="איך מתרגלים שפה חברתית עם ילדים?"
        a="משחקים במצבים מוכרים: „איך הוא מרגיש — ולמה?”, „מה אפשר להגיד?” ו„מה הוא חושב?”. לכל מצב יש כמה אפשרויות, ומדברים על כל אחת: מה היא עושה לשיחה ומה הצד השני ירגיש. אחר כך מתרגלים בחיים — במשחק, בארוחה ובגן. כאן יש משחק עם שמע, בינגו רגשות, כרטיסי מצב, כרטיס „פותחי השיחה שלי” ותבנית לסיפור חברתי."
        rows={[['נושאים', 'רגשות · בקשות ונימוס · שיחה ותורות · מה הוא חושב'], ['גיל', 'גן (בערך 3–6), כיתות א׳–ב׳ וחינוך מיוחד'], ['להדפסה', 'בינגו רגשות, כרטיסי פנים ומצבים, בועות מחשבה, פותחי שיחה, תבנית לסיפור'], ['מחיר', 'חינם, בלי הרשמה']]}
        updated={UPDATED} />
      <SpeechNote />
      <LanguageNav current="social" />
    </div>

    <section aria-labelledby="social-play" className="mb-10">
      <h2 id="social-play" className="mb-3 text-center text-2xl font-bold">משחק מצבים</h2>
      <Play />
      <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">אין ציון ואין שעון. ההסבר שהילד/ה נותן/ת חשוב יותר מהבחירה.</p>
    </section>

    <div className="mx-auto max-w-4xl">
      <section aria-labelledby="social-faces" className="mb-10">
        <h2 id="social-faces" className="mb-3 text-center text-2xl font-bold">שמונה רגשות — ומה רואים בפנים</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {EMOTIONS.map(e => <button key={e.id} type="button" onClick={() => say(feelBoth(e.id))} className="rounded-2xl border border-[var(--border)] bg-white p-3 text-center shadow-sm hover:bg-[var(--postit)]/40">
            <Face id={e.id} size={84} label={false} className="mx-auto" />
            <p className="mt-1 text-lg font-black">{feelBoth(e.id)}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{e.cue}</p>
          </button>)}
        </div>
        <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">פנים הן רק רמז אחד: יש מי שמחייך כשהוא נבוך, ויש מי שפניו נשארות רגועות גם כשהוא מתרגש. הכי בטוח — לשאול.</p>
      </section>

      <Printables />

      <div className="mx-auto max-w-3xl space-y-5">
        <Guide title="להורים: איך מתרגלים שפה חברתית בבית">
          <ul className="space-y-1.5">
            <Li><b>נותנים שם לרגשות ברגע אמת.</b> „נראה לי שאת מתוסכלת — הפאזל לא מסתדר.” כך הילד/ה לומד/ת מילה לתחושה שהוא/היא מרגיש/ה עכשיו.</Li>
            <Li><b>מדגימים בעצמכם.</b> „אני צריכה עזרה עם השקיות”, „סליחה, לא שמעתי — אפשר שוב?” ילדים לומדים ממה שהם שומעים.</Li>
            <Li><b>משחקים בתורות.</b> משחקי קופסה, גלגול כדור, בנייה משותפת — „עכשיו תורי, עכשיו תורך”.</Li>
            <Li><b>שואלים „מה הוא חושב?” בספרים.</b> עוצרים בסיפור ושואלים מה הדמות יודעת, מרגישה או מתכננת.</Li>
            <Li><b>לא מכריחים „תגיד סליחה”.</b> עדיף לתאר מה קרה ולהציע: „טל נפל. אפשר לשאול אותו אם הוא בסדר.”</Li>
          </ul>
        </Guide>
        <Guide title="לקלינאיות ולצוותי חינוך: איך להשתמש בעמוד">
          <ul className="space-y-1.5">
            <Li>במצבים יש כמה אפשרויות טובות. אחרי הבחירה כדאי ללחוץ גם על האחרות ולשאול: „מה יעל תרגיש אם עידו יגיד ככה?”</Li>
            <Li>אפשרויות שמוצגות בסוגריים הן <b>פעולות</b> (מצביעים, מחבקים, מושיטים) — וגם הן תקשורת. ילדים שמשתמשים בתת״ח יכולים „לענות” בלוח או בכרטיס.</Li>
            <Li>„מה הוא חושב?” כולל מצב של אמונה שגויה (הכדור שעבר מקום) — מתאים לילדים גדולים יותר, ואפשר לשחק אותו גם עם חפצים אמיתיים.</Li>
            <Li>כרטיסי המצב מתאימים לקבוצה קטנה: כל ילד שולף כרטיס, ושאר הקבוצה מציעה מה אפשר להגיד או להרגיש.</Li>
            <Li>כרטיסי בקשת עזרה, ויסות והרגעה, ולוח רגשות לביטוי עצמי נמצאים ב<Link to={SENSORY} className="font-bold underline">כרטיסיות הוויסות והתקשורת</Link>, ולוחות מילות ליבה — ב<Link to="/speech/aac" className="font-bold underline">לוחות התקשורת (תת״ח)</Link>.</Li>
          </ul>
        </Guide>
        <Guide title="גישה מכבדת: תקשורת ונוחות, לא „תיקון”">
          <p>ילדים מתקשרים בדרכים שונות — במילים, בתנועות, בכרטיסים ובלוחות. ילדים על הספקטרום האוטיסטי, ילדים עם קשיי שפה וילדים ביישנים לא צריכים „להשתנות”; המטרה היא שיוכלו לבקש את מה שהם צריכים, להבין טוב יותר מה קורה סביבם, ולהרגיש בנוח עם אנשים אחרים.</p>
          <ul className="space-y-1.5">
            <Li>לא דורשים קשר עין. הקשבה יכולה להיראות אחרת אצל כל ילד.</Li>
            <Li>תחום עניין עמוק (רכבות, דינוזאורים, מפות) הוא גשר לשיחה — לא בעיה.</Li>
            <Li>גם המבוגרים והילדים האחרים לומדים: לחכות לתשובה, לקבל הצבעה או כרטיס כתשובה, ולשאול במקום לנחש.</Li>
          </ul>
        </Guide>
        <Guide id="story" title="איך כותבים סיפור חברתי אישי">
          <p>סיפור חברתי הוא סיפור קצר שמתאר מצב שהילד/ה פוגש/ת — הליכה לרופא, יום הולדת בגן, רעש במפגש — כדי שיהיה צפוי ומובן יותר. את הגישה פיתחה <b>קרול גריי (Carol Gray)</b>, מחנכת מארצות הברית, בתחילת שנות ה־90. השם באנגלית רשום כסימן מסחרי שלה; התבנית כאן היא כלי פשוט בהשראת העקרונות, לא התוכנית הרשמית.</p>
          <ul className="space-y-1.5">
            <Li><b>כותבים יחד</b> — עם הילד/ה, ורצוי עם הקלינאית או הגננת שמכירות את המצב.</Li>
            <Li><b>גוף ראשון ומשפטים מתארים:</b> „בבוקר אני הולך לגן”, „הילדים שרים במפגש”. רוב המשפטים מתארים — רק מעטים מציעים מה לעשות.</Li>
            <Li><b>חיובי ומדויק:</b> „אני יכולה לנסות…” ולא „אסור לי…” או „אני חייבת…”. לא מבטיחים מה שלא בטוח יקרה.</Li>
            <Li><b>קצר ואישי:</b> שישה־שמונה משפטים, עם ציורים או תמונות מהמקום האמיתי.</Li>
            <Li><b>קוראים ברגע רגוע,</b> כמה פעמים לפני המצב — לא כתגובה או כעונש אחריו.</Li>
          </ul>
          <div className="mt-3 rounded-xl bg-[var(--postit)]/50 p-4">
            <p className="mb-1 font-black">דוגמה: {STORY_EXAMPLE.title}</p>
            {STORY_EXAMPLE.lines.map((l, i) => <p key={i}>{l}</p>)}
          </div>
          <p>את התבנית להדפסה תמצאו ב<a href="#print" className="font-bold underline">דפים להדפסה</a> ← „תבנית לסיפור אישי”.</p>
        </Guide>
      </div>

      <div className="mt-12">
        <SeoBody paragraphs={[
          'שפה חברתית (או שפה פרגמטית) היא היכולת להשתמש בשפה עם אנשים: לבקש ולהודות, לפתוח שיחה ולסיים אותה, לחכות לתור, להישאר בנושא, ולהבין מה אדם אחר מרגיש, יודע או חושב. אלה כישורים חברתיים שילדים צריכים בגן ובבית הספר — במשחק, במפגש ובחברות.',
          'בעמוד יש משחק מצבים בארבעה נושאים: זיהוי רגשות לילדים מתוך פנים מצוירות ומתוך מצבים („איך הוא מרגיש — ולמה?”), בקשות ומילות נימוס (בבקשה, תודה, סליחה, אפשר…?, אני צריך/ה עזרה), שיחה ותורות, ו„מה הוא חושב?” עם בועות מחשבה. לכל אפשרות יש הסבר חיובי, בלי ציון ובלי „טעות”.',
          'לגננות, לקלינאיות ולהורים יש כאן גם כישורים חברתיים לגן — דפי עבודה וכרטיסים להדפסה: בינגו רגשות עם כרטיסי פנים ומצבים, כרטיסי „מה אפשר להגיד?”, בועות מחשבה לציור, כרטיס אישי „פותחי השיחה שלי” ותבנית לכתיבת סיפור חברתי אישי.',
        ]} faq={faq} related={related} />
      </div>
    </div>
  </div>
}
