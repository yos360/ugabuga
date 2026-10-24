import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import QuickAnswer from '../../../components/ui/QuickAnswer'
import { Sheet } from '../../../components/printables/PrintableShell'
import { hasVoice, speak, stopSpeaking } from '../../../utils/speak'
import SpeechNote from '../SpeechNote'
import { SheetsPreview, TextBox } from '../speechSheets'
import { CutLines, Guide, LanguageNav, Li, Pills, SheetHeader, Txt } from '../languageShared'
import { SOURCES } from '../../../data/speech/parentSources'
import { COLOR, PRINT, ROOM_ZONES, RoomArt, SceneArt } from './PrepositionsArt'
import {
  CARD_SCENES, CONCEPTS, LEVELS, SCENES, TALK_PROMPTS, THINGS, ZONES, levelById, placeRound, placeText,
  sceneById, seeded, sheetPlan, shuffle, whereRound, zoneById,
} from '../../../data/speech/prepositions'

// /speech/language/prepositions — spatial concepts (על, מתחת, בתוך, ליד, לפני, מאחורי, בין…):
// "where is the cat?" (hear a sentence, tap the matching picture), "put the …" (tap the right spot
// in a room), pictures to describe, the concepts by level with movement ideas, and printables
// (concept cards, cut-and-paste sheets with adult instructions, bingo). No scoring: the feedback
// says where the cat / the toy is — which models the word — and never counts mistakes.

const PATH = '/speech/language/prepositions'
const UPDATED = '2026-10-24'
const EMOJI = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
const PRAISE = ['נכון!', 'יופי של הקשבה!', 'בדיוק!', 'כל הכבוד!']

function useVoice() {
  const [ok, setOk] = useState(true)
  const [slow, setSlow] = useState(false)
  useEffect(() => { let on = true; hasVoice('he-IL').then(v => { if (on) setOk(v) }); return () => { on = false; stopSpeaking() } }, [])
  const say = useCallback((text, user = true) => speak(text.replace(/[„”]/g, ''), 'he-IL', { rate: slow ? 0.68 : 0.85, user }), [slow])
  return { ok, slow, setSlow, say }
}

function Scene({ id, c = COLOR, className = '' }) {
  return <svg viewBox="0 0 200 150" className={`block h-auto w-full ${className}`} aria-hidden="true"><SceneArt id={id} c={c} /></svg>
}

function LevelPills({ level, onChange }) {
  const l = levelById[level]
  return <div className="space-y-1.5">
    <Pills label="שלב" value={level} onChange={onChange} options={LEVELS.map(x => [x.id, x.label])} />
    <p className="text-center text-sm text-[var(--muted-foreground)]"><b>{l.name}</b> — {l.desc}</p>
  </div>
}

function SlowToggle({ v }) {
  return <button type="button" aria-pressed={v.slow} onClick={() => v.setSlow(s => !s)}
    className={`min-h-[44px] rounded-full border-2 px-4 text-sm font-bold ${v.slow ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white'}`}>🐢 לאט יותר</button>
}

// ── "Where is the cat?" ─────────────────────────────────────────────────────────────────────
function WhereGame() {
  const v = useVoice()
  const [level, setLevel] = useState(1)
  const [round, setRound] = useState(() => whereRound(1))
  const [tried, setTried] = useState([])
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')
  const [peek, setPeek] = useState(false)
  const [n, setN] = useState(0)
  const target = sceneById[round.target]
  const question = `באיזו תמונה ${target.s}?`
  const next = (lv = level) => {
    const r = whereRound(lv, Math.random, round.target)
    setRound(r); setTried([]); setDone(false); setMsg(''); setPeek(false)
    v.say(`באיזו תמונה ${sceneById[r.target].s}?`)
  }
  const choose = id => {
    if (done) return
    if (id === round.target) {
      const text = `${PRAISE[n % PRAISE.length]} ${target.s}.`
      setDone(true); setN(k => k + 1); setMsg(`🎉 ${text}`); v.say(text)
    } else {
      setTried(t => [...t, id])
      const text = `בתמונה הזאת ${sceneById[id].s}. ובאיזו תמונה ${target.s}?`
      setMsg(text); v.say(text)
    }
  }
  const cols = round.ids.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
  return <div className="space-y-4">
    <LevelPills level={level} onChange={lv => { setLevel(lv); next(lv) }} />
    <div className="rounded-2xl border border-[var(--border)] bg-white p-3 text-center shadow-sm sm:p-5">
      <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => v.say(question)} className="flex min-h-[56px] items-center gap-2 rounded-full bg-violet-600 px-7 text-xl font-bold text-white shadow">🔊 איפה החתול?</button>
        <SlowToggle v={v} />
      </div>
      {!v.ok && <p className="mb-2 text-sm text-[var(--muted-foreground)]">לא נמצא במכשיר קול בעברית — המבוגר יכול להקריא את השאלה (בכפתור הצהוב).</p>}
      <button type="button" onClick={() => setPeek(p => !p)} aria-expanded={peek}
        className="mb-3 min-h-[40px] rounded-full border-2 border-[var(--border)] bg-[var(--postit)] px-4 text-sm font-bold">{peek ? '🙈 הסתרת השאלה' : '👀 למבוגר: מה לשאול?'}</button>
      {peek && <p className="mx-auto mb-3 max-w-xl rounded-xl bg-violet-50 p-3 text-lg font-bold text-violet-900" aria-live="polite">„{question}”</p>}
      <div className={`mx-auto grid max-w-3xl gap-3 ${cols}`}>
        {round.ids.map((id, i) => {
          const state = done && id === round.target ? 'border-emerald-500 ring-4 ring-emerald-200' : tried.includes(id) ? 'border-slate-300 opacity-60' : 'border-[var(--border)] hover:border-violet-400'
          return <button key={id} type="button" onClick={() => choose(id)} aria-label={`תמונה ${i + 1}: ${sceneById[id].s}`}
            className={`overflow-hidden rounded-2xl border-4 bg-white transition ${state}`}><Scene id={id} /></button>
        })}
      </div>
      <p className="mx-auto mt-3 min-h-[2rem] max-w-xl text-lg font-bold" aria-live="polite">{msg}</p>
      {done && <p className="mx-auto mb-2 max-w-xl text-sm text-[var(--muted-foreground)]">ועכשיו תורכם: מצביעים על תמונה אחרת ושואלים „איפה החתול כאן?” — הילד/ה עונה במשפט.</p>}
      <button type="button" onClick={() => next()} className={`min-h-[48px] rounded-xl px-6 font-bold ${done ? 'bg-emerald-600 text-white' : 'border-2 border-[var(--border)] bg-white text-sm'}`}>{done ? 'לשאלה הבאה ←' : 'שאלה אחרת'}</button>
    </div>
  </div>
}

// ── "Put the …" ──────────────────────────────────────────────────────────────────────────
function PlaceGame() {
  const v = useVoice()
  const [level, setLevel] = useState(1)
  const [mode, setMode] = useState('listen')
  const [round, setRound] = useState(() => placeRound(1))
  const [zone, setZone] = useState(null)
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')
  const [peek, setPeek] = useState(false)
  const [told, setTold] = useState(false)
  const text = placeText(round.thing, round.fact)
  const next = (lv = level, m = mode) => {
    const r = m === 'free' ? { fact: round.fact, thing: shuffle(THINGS.filter(t => t.id !== round.thing.id))[0] } : placeRound(lv, Math.random, round.fact.id)
    setRound(r); setZone(null); setDone(false); setMsg(''); setPeek(false); setTold(false)
    if (m === 'listen') v.say(placeText(r.thing, r.fact))
  }
  const tap = z => {
    setZone(z); setTold(false)
    if (mode === 'free') { setMsg(''); return }
    if (done) return
    if (round.fact.zones.includes(z)) {
      const t = `נכון! ${round.thing.name} ${round.fact.text}.`
      setDone(true); setMsg(`🎉 ${t}`); v.say(t)
    } else {
      const t = `${round.thing.name} עכשיו ${zoneById[z].where}. ביקשתי: ${round.fact.text}. ננסה שוב?`
      setMsg(t); v.say(t)
    }
  }
  const model = zone ? `${round.thing.name} ${zoneById[zone].where}` : ''
  return <div className="space-y-4">
    <Pills label="איך משחקים" value={mode} onChange={m => { setMode(m); next(level, m) }} tone="soft"
      options={[['listen', '👂 מקשיבים ושמים'], ['free', '🗣️ שמים ומספרים']]} />
    {mode === 'listen' && <LevelPills level={level} onChange={lv => { setLevel(lv); next(lv) }} />}
    <div className="rounded-2xl border border-[var(--border)] bg-white p-3 text-center shadow-sm sm:p-5">
      {mode === 'listen'
        ? <>
          <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={() => v.say(text)} className="flex min-h-[56px] items-center gap-2 rounded-full bg-violet-600 px-7 text-xl font-bold text-white shadow">🔊 הקשיבו להוראה</button>
            <SlowToggle v={v} />
          </div>
          <button type="button" onClick={() => setPeek(p => !p)} aria-expanded={peek}
            className="mb-3 min-h-[40px] rounded-full border-2 border-[var(--border)] bg-[var(--postit)] px-4 text-sm font-bold">{peek ? '🙈 הסתרת ההוראה' : '👀 למבוגר: מה להקריא?'}</button>
          {peek && <p className="mx-auto mb-3 max-w-xl rounded-xl bg-violet-50 p-3 text-lg font-bold text-violet-900" aria-live="polite">„{text}”</p>}
        </>
        : <p className="mb-3 text-lg font-bold">בוחרים מקום ל{round.thing.name.slice(1)} בחדר, ומספרים במילים: איפה {round.thing.name}?</p>}
      <div className="mb-2 flex items-center justify-center gap-2 text-lg font-bold"><span>מה שמים:</span><span className="text-4xl" aria-hidden="true" style={{ fontFamily: EMOJI }}>{round.thing.e}</span>{(mode === 'free' || peek) && <span>{round.thing.name}</span>}</div>
      <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-[var(--border)]">
        <svg viewBox="0 0 400 220" className="block h-auto w-full touch-manipulation select-none" role="group" aria-label="חדר עם מדף, כיסא, שולחן וקופסה פתוחה">
          <RoomArt placed={zone ? [{ zone, e: round.thing.e }] : []} />
          {ZONES.map(z => { const [x, y, w, h] = ROOM_ZONES[z.id].hit; return <rect key={z.id} x={x} y={y} width={w} height={h} rx="4" role="button" tabIndex={0} aria-label={`לשים כאן: ${z.where}`}
            className="cursor-pointer fill-transparent outline-none hover:fill-violet-400/10 focus-visible:stroke-violet-600" strokeWidth="2"
            onClick={() => tap(z.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(z.id) } }} /> })}
        </svg>
      </div>
      <p className="mx-auto mt-3 min-h-[2rem] max-w-xl text-lg font-bold" aria-live="polite">{msg}</p>
      {mode === 'free' && zone && <div className="mb-2">
        <button type="button" onClick={() => { setTold(true); v.say(model) }} className="min-h-[48px] rounded-xl bg-violet-600 px-6 font-bold text-white">💬 איך אומרים? (אחרי שהילד/ה סיפר/ה)</button>
        {told && <p className="mt-2 text-xl font-bold text-violet-900" aria-live="polite">„{model}”</p>}
      </div>}
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => next()} className={`min-h-[48px] rounded-xl px-6 font-bold ${done ? 'bg-emerald-600 text-white' : 'border-2 border-[var(--border)] bg-white text-sm'}`}>{done ? 'להוראה הבאה ←' : mode === 'free' ? 'משהו אחר לשים' : 'הוראה אחרת'}</button>
        {zone && !done && <button type="button" onClick={() => { setZone(null); setMsg(''); setTold(false) }} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-4 text-sm font-bold">🧹 מתחילים מחדש</button>}
      </div>
    </div>
  </div>
}

// ── Pictures to describe ──────────────────────────────────────────────────────────────────
function TalkCards() {
  const v = useVoice()
  const [order, setOrder] = useState(() => shuffle(CARD_SCENES.map(s => s.id)))
  const [i, setI] = useState(0)
  const [shown, setShown] = useState(false)
  const id = order[i % order.length]
  const go = d => { setI(k => (k + d + order.length) % order.length); setShown(false) }
  return <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm sm:p-6">
    <h3 className="mb-1 text-2xl font-bold">ספרו לי: איפה החתול?</h3>
    <p className="mb-3 text-[var(--muted-foreground)]">הילד/ה מספר/ת במילים שלו/ה. המבוגר חוזר על מה שנאמר ומוסיף מילה — בלי „תגיד נכון”.</p>
    <div className="mx-auto max-w-md overflow-hidden rounded-2xl border-2 border-slate-800"><Scene id={id} /></div>
    <div className="mt-3">
      <button type="button" onClick={() => { setShown(true); v.say(sceneById[id].s) }} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-[var(--postit)] px-5 font-bold">💬 משפט לדוגמה למבוגר</button>
      <p className="mt-2 min-h-[2.25rem] text-2xl font-black" aria-live="polite">{shown ? `„${sceneById[id].s}”` : ''}</p>
      {shown && <p className="mx-auto max-w-md text-sm text-[var(--muted-foreground)]">להרחבה: „ומה החתול עושה שם?”, „איפה עוד הוא יכול להתחבא?”</p>}
    </div>
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <button type="button" onClick={() => go(-1)} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-5 font-bold">→ הקודם</button>
      <button type="button" onClick={() => { setOrder(shuffle(CARD_SCENES.map(s => s.id))); setI(0); setShown(false) }} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-5 font-bold">🔀 ערבוב</button>
      <button type="button" onClick={() => go(1)} className="min-h-[48px] rounded-xl bg-violet-600 px-6 font-bold text-white">הבא ←</button>
    </div>
    <div className="mx-auto mt-6 max-w-2xl text-right">
      <h4 className="mb-2 text-lg font-bold">שאלות לשיחה, בלי תמונות:</h4>
      <ul className="grid gap-2 sm:grid-cols-2">
        {TALK_PROMPTS.map(p => <li key={p.q} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2"><span aria-hidden="true" className="text-2xl">{p.e}</span>{p.q}</li>)}
      </ul>
    </div>
  </div>
}

// ── Printables ───────────────────────────────────────────────────────────────────────────
const GrayDefs = () => <defs><filter id="prep-gray"><feColorMatrix type="saturate" values="0" /></filter></defs>

// Cards with a picture and (optionally) the sentence; 12 on a page.
function sceneCards(list, { text = true, color = true, title, keyBase, note }) {
  const c = color ? COLOR : PRINT
  const per = 12, cols = 3, cw = 190 / cols, ch = 243 / 4
  const pages = Array.from({ length: Math.ceil(list.length / per) }, (_, p) => list.slice(p * per, p * per + per))
  return pages.map((items, p) => {
    const cells = items.map((s, i) => ({ s, x: 5 + 190 - ((i % cols) + 1) * cw, y: 21 + Math.floor(i / cols) * ch, w: cw, h: ch }))
    return {
      key: `${keyBase}-${p}`,
      svg: <Sheet label={`${title} — דף ${p + 1}`}>
        <SheetHeader title={pages.length > 1 ? `${title} (${p + 1}/${pages.length})` : title} note={note} />
        <CutLines cells={cells} />
        {cells.map(({ s, x, y, w, h }) => {
          const iw = w - 6, ih = text ? h - 17 : h - 6
          const sw = Math.min(iw, ih * 4 / 3), sh = sw * 3 / 4
          return <g key={s.id}>
            <rect x={x + 3 + (iw - sw) / 2} y={y + 3} width={sw} height={sh} fill="none" stroke="#111" strokeWidth=".4" />
            <svg x={x + 3 + (iw - sw) / 2} y={y + 3} width={sw} height={sh} viewBox="0 0 200 150"><SceneArt id={s.id} c={c} /></svg>
            {text && <TextBox x={x + 3} y={y + h - 13.5} w={w - 6} h={11} text={s.s} max={4.4} maxLines={2} />}
          </g>
        })}
      </Sheet>,
    }
  })
}

// Cut and paste: the room (outline), six things to cut, and the adult's instructions in a strip.
function cutPasteSheet(level, seed, color) {
  const plan = sheetPlan(level, seed)
  const lv = levelById[level]
  const cw = 30, chh = 28, x0 = 100 + (plan.length * cw) / 2
  const cells = plan.map((p, i) => ({ ...p, x: x0 - (i + 1) * cw, y: 140, w: cw, h: chh }))
  return {
    key: `paste-${level}-${seed}`,
    svg: <Sheet label={`גוזרים ומדביקים — ${lv.label}`}>
      <GrayDefs />
      <SheetHeader title={`גוזרים ומדביקים במקום הנכון · ${lv.label}`} note={`${lv.name} · צריך: מספריים ודבק`} />
      <Txt x={195} y={22.5} size={3.4} anchor="start">שם: ____________________</Txt>
      <rect x={5} y={25} width={190} height={104.5} fill="#fff" stroke="#111" strokeWidth=".5" />
      <svg x={5} y={25} width={190} height={104.5} viewBox="0 0 400 220"><RoomArt c={PRINT} /></svg>
      <Txt x={100} y={136} size={3.4} weight={700} fill="#374151">✂ גוזרים את התמונות ומדביקים בחדר — לפי מה שהמבוגר אומר</Txt>
      <CutLines cells={cells} />
      {cells.map(c => <g key={c.thing.id}>
        <text x={c.x + c.w / 2} y={c.y + 12} fontSize={15} textAnchor="middle" dominantBaseline="central" fontFamily={EMOJI} filter={color ? undefined : 'url(#prep-gray)'}>{c.thing.e}</text>
        <Txt x={c.x + c.w / 2} y={c.y + 25} size={3}>{c.thing.name.slice(1)}</Txt>
      </g>)}
      <line x1={6} y1={180} x2={194} y2={180} stroke="#9ca3af" strokeWidth=".4" strokeDasharray="2 1.4" />
      <Txt x={100} y={178.4} size={2.8} fill="#6b7280">✂ אפשר לגזור או לקפל כאן — החלק שלמטה למבוגר</Txt>
      <Txt x={192} y={188} size={3.8} weight={800} anchor="start">למבוגר: מקריאים הוראה אחת בכל פעם — בלי להצביע</Txt>
      <Txt x={192} y={193.5} size={3} fill="#4b5563" anchor="start">אם צריך, חוזרים פעם אחת באותן מילים. אפשר קודם לשחק עם חפצים אמיתיים, ורק אחר כך בדף.</Txt>
      {plan.map((p, i) => <Txt key={i} x={192} y={202 + i * 6.4} size={3.9} anchor="start"><tspan fontWeight={800}>{i + 1}. </tspan>{placeText(p.thing, p.fact, 'הדביקו')}</Txt>)}
      <rect x={8} y={243} width={184} height={17} rx={3} fill="#f9fafb" stroke="#d1d5db" strokeWidth=".4" />
      <Txt x={188} y={250} size={3.3} weight={700} anchor="start">ואחרי ההדבקה — תורו של הילד/ה לספר: „איפה הדובי?”, „מה יש על השולחן?”</Txt>
      <Txt x={188} y={256} size={3} fill="#4b5563" anchor="start">אם הוא/היא אומר/ת „שם” או מצביע/ה — מוסיפים את המילה: „כן, הדובי מתחת לכיסא!”</Txt>
    </Sheet>,
  }
}

// Bingo: picture boards (no words) and calling cards with the sentence.
const BINGO_SCENES = CARD_SCENES.filter(s => !['out-box', 'right-box', 'left-box'].includes(s.id))
function bingoSheets(seed, color) {
  const c = color ? COLOR : PRINT
  const rand = seeded(`bingo-${seed}`)
  const boards = Array.from({ length: 6 }, () => shuffle(BINGO_SCENES, rand).slice(0, 9))
  const cw = 56, chh = 37, bw = cw * 3, x0 = 100 - bw / 2
  const board = (list, y, n) => <g key={n}>
    <Txt x={x0 + bw} y={y + 8} size={5.2} weight={900} anchor="start">בינגו מילות יחס · לוח {n}</Txt>
    <Txt x={x0} y={y + 8} size={3.6} anchor="end" fill="#374151">שם: ______________</Txt>
    <rect x={x0} y={y + 12} width={bw} height={chh * 3} fill="none" stroke="#111" strokeWidth=".9" />
    {list.map((s, i) => {
      const x = x0 + bw - ((i % 3) + 1) * cw, yy = y + 12 + Math.floor(i / 3) * chh
      const sh = chh - 3, sw = sh * 4 / 3
      return <g key={s.id}>
        <rect x={x} y={yy} width={cw} height={chh} fill="none" stroke="#111" strokeWidth=".4" />
        <svg x={x + (cw - sw) / 2} y={yy + 1.5} width={sw} height={sh} viewBox="0 0 200 150"><SceneArt id={s.id} c={c} /></svg>
      </g>
    })}
  </g>
  const boardPages = [0, 1, 2].map(p => ({
    key: `bingo-${p}`,
    svg: <Sheet label="בינגו מילות יחס — לוחות">
      {board(boards[p * 2], 6, p * 2 + 1)}
      {board(boards[p * 2 + 1], 134, p * 2 + 2)}
      <Txt x={100} y={264} size={3.1} fill="#4b5563">הקורא/ת שולף/ת כרטיס ומקריא/ה: „החתול מתחת לכיסא”. מי שמוצא/ת את התמונה — מכסה ואומר/ת את המשפט בעצמו/ה.</Txt>
    </Sheet>,
  }))
  return [...boardPages, ...sceneCards(BINGO_SCENES, { text: true, color, title: 'בינגו מילות יחס — כרטיסי הקריאה', keyBase: 'bingo-calls', note: '✂ גוזרים, מערבבים ושולפים כרטיס בכל תור · אפשר לתת לילדים להיות הקוראים' })]
}

const PRINTS = [['cards', '🃏 כרטיסי מושגים'], ['paste', '✂️ גזור והדבק'], ['bingo', '🎲 בינגו מילות יחס']]

function Printables() {
  const [type, setType] = useState('cards')
  const [text, setText] = useState(true)
  const [color, setColor] = useState(true)
  const [level, setLevel] = useState(1)
  const [seed, setSeed] = useState(1)
  const pages = useMemo(() => {
    if (type === 'cards') return sceneCards(CARD_SCENES, { text, color, title: text ? 'כרטיסי מושגים: איפה החתול?' : 'ספרו: איפה החתול?', keyBase: 'cards',
      note: text ? '✂ גוזרים לאורך הקווים · מתאים למשחק „הראו לי…”, לזיכרון ולמיון לפי מילה' : '✂ גוזרים, שולפים כרטיס, והילד/ה מספר/ת איפה החתול' })
    if (type === 'paste') return [cutPasteSheet(level, seed, color)]
    return bingoSheets(seed, color)
  }, [type, text, color, level, seed])
  const title = PRINTS.find(p => p[0] === type)[1].replace(/^\S+\s/, '')
  return <section aria-labelledby="prep-print" className="mb-10 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
    <h2 id="prep-print" className="mb-2 text-center text-2xl font-bold">🖨️ דפי עבודה להדפסה: על, מתחת, בתוך, ליד</h2>
    <p className="mb-4 text-center text-[var(--muted-foreground)]">A4, עם קווי גזירה. עובד גם בשחור־לבן.</p>
    <div className="mb-3"><Pills label="מה להדפיס" value={type} onChange={setType} options={PRINTS} tone="soft" /></div>
    <div className="mb-4 space-y-2">
      {type === 'cards' && <Pills label="טקסט בכרטיס" value={text} onChange={setText} tone="soft" options={[[true, '🔤 תמונה + משפט'], [false, '🖼️ תמונה בלבד (לתיאור)']]} />}
      {type === 'paste' && <Pills label="שלב" value={level} onChange={setLevel} tone="soft" options={LEVELS.map(l => [l.id, `${l.label} · ${l.name}`])} />}
      <Pills label="צבע" value={color} onChange={setColor} tone="soft" options={[[true, '🎨 צבעוני'], [false, '⚫ שחור־לבן']]} />
    </div>
    <SheetsPreview pages={pages} title={title} onRefresh={type === 'cards' ? undefined : () => setSeed(s => s + 1)} />
    {type === 'paste' && <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">ב„🔀 לוחות חדשים” מקבלים הוראות אחרות — טוב לכמה ילדים בקבוצה. במקום להדביק אפשר גם לצייר.</p>}
  </section>
}

// ── Concepts by level ───────────────────────────────────────────────────────────────────
function ConceptList() {
  const v = useVoice()
  return <section aria-labelledby="prep-concepts" className="mb-10">
    <h2 id="prep-concepts" className="mb-2 text-2xl font-bold">המושגים לפי הסדר: מה מלמדים קודם?</h2>
    <p className="mb-4 leading-relaxed text-[var(--foreground)]/80">הסדר כאן מבוסס על מחקר שמצא סדר רכישה דומה בכמה שפות: קודם בתוך, על ומתחת, אחר כך ליד, ורק אחר כך בין, לפני ומאחורי. ימין ושמאל מגיעים הרבה אחר כך. לכל מושג יש רעיון לתנועה ורעיון עם חפצים — כדאי להתחיל בהם, ורק אחר כך לעבור לתמונות. לחיצה על 🔊 משמיעה את המשפט.</p>
    {LEVELS.map(l => <div key={l.id} className="mb-6">
      <h3 className="mb-2 text-xl font-bold">{l.label}: {l.name}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {CONCEPTS.filter(c => c.level === l.id).map(c => {
          const s = sceneById[c.scene]
          return <div key={c.id} className="flex gap-3 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm">
            <div className="w-28 shrink-0 self-start overflow-hidden rounded-xl border border-[var(--border)] sm:w-32"><Scene id={c.scene} /></div>
            <div className="min-w-0">
              <h4 className="text-xl font-black">{c.word}</h4>
              <button type="button" onClick={() => v.say(s.s)} className="mb-1 flex min-h-[36px] items-center gap-1 rounded-full text-right font-bold hover:bg-[var(--postit)]" aria-label={`השמעה: ${s.s}`}>🔊 {s.s}</button>
              <p className="text-sm leading-relaxed"><b>בתנועה:</b> {c.move}</p>
              <p className="text-sm leading-relaxed"><b>עם חפצים:</b> {c.objects}</p>
            </div>
          </div>
        })}
      </div>
    </div>)}
  </section>
}

// ── Page ─────────────────────────────────────────────────────────────────────────────────
const ACTIVITIES = [['where', '🐱 איפה החתול?'], ['place', '🧸 שימו את…'], ['talk', '🗣️ ספרו לי']]

const faq = [
  { q: 'מה הן מילות יחס ומושגים מרחביים?', a: 'אלה המילים שמתארות איפה נמצא משהו ביחס לדבר אחר: על, מתחת, בתוך, מחוץ, ליד, מעל, לפני, מאחורי, בין, למעלה, למטה, קרוב, רחוק, ימין ושמאל. הן מופיעות כמעט בכל הוראה ביום־יום („שימו את הנעליים מתחת למיטה”), ולכן הבנה שלהן חשובה להבנת שפה ולמעקב אחרי הוראות בגן.' },
  { q: 'באיזה גיל ילדים מבינים "על", "מתחת" ו"בתוך"?', a: 'לפי אבני הדרך של ASHA (האיגוד האמריקאי לשמיעה, שפה ודיבור), ילדים רבים מבינים מילים כמו בתוך, על ומתחת בין גיל שנתיים לשלוש. מושגים כמו בין, לפני ומאחורי מתפתחים מאוחר יותר בשנות הגן, וימין ושמאל — הרבה אחר כך. יש שונות גדולה בין ילדים, ולכן כאן מתקדמים לפי הילד/ה ולא לפי גיל. אם יש דאגה — כדאי להתייעץ עם קלינאי/ת תקשורת.' },
  { q: 'איך מלמדים מושגים מרחביים לילדים?', a: 'מתחילים בגוף ובתנועה (להיכנס לתוך קופסה, לזחול מתחת לשולחן), ממשיכים לחפצים אמיתיים (לשים את הדובי על הכיסא), ורק אחר כך עוברים לתמונות ולדפי עבודה. מלמדים מושג אחד בכל פעם, ומשווים לזוג שלו (על / מתחת, בתוך / מחוץ) — כך הילד/ה שם/ה לב להבדל.' },
  { q: 'הילד אומר "שם" או "אחרי הקופסה" — לתקן אותו?', a: 'לא צריך לבקש ממנו לחזור. עדיף לחזור על מה שאמר בצורה הנכונה ולהוסיף מילה: „כן! החתול מאחורי הקופסה”. זו הרחבה (expansion) — הילד שומע את המילה בדיוק ברגע שהיא חשובה לו, בלי להרגיש שטעה.' },
  { q: 'למה ימין ושמאל נמצאים בשלב נפרד?', a: 'כי אלה מושגים קשים במיוחד: הם תלויים בנקודת המבט, וגם מבוגרים מתבלבלים בהם לפעמים. מתחילים מהגוף של הילד/ה (צמיד על יד ימין), ממשיכים לחפצים שלפניו/ה, ורק בסוף עוברים לתמונה. במשחקים ובדפים כאן, ימין ושמאל הם מנקודת המבט של מי שמסתכל על התמונה.' },
  { q: 'האם המשחקים נותנים ציון?', a: 'לא. אין ניקוד, אין ספירת טעויות ואין הקלטה. כשבוחרים תמונה אחרת, המשחק פשוט אומר איפה החתול באותה תמונה — וכך הוא מדגים את המילה — ומזמין לנסות שוב.' },
  { q: 'איך משתמשים בדף "גזור והדבק"?', a: 'הילד/ה גוזר/ת את שש התמונות הקטנות, והמבוגר מקריא הוראה אחת בכל פעם מהפס שבתחתית הדף („הדביקו את הכדור מתחת לשולחן”). את הפס אפשר לגזור או לקפל, כדי שההוראה תישאר תרגיל הקשבה. כל לחיצה על „לוחות חדשים” נותנת הוראות אחרות.' },
  { q: 'זה מתאים לחינוך המיוחד?', a: 'כן. אפשר להתחיל מבחירה בין שתי תמונות בלבד (שלב 1), להשתמש בכרטיסים כחומר מוחשי, ולשחק „שימו את…” עם חפצים אמיתיים במקביל למסך. ילדים שמשתמשים בתקשורת תומכת חליפית יכולים להצביע על התמונה במקום לומר.' },
]

const related = [
  { label: 'שפה — כל העמודים', href: '/speech/language' },
  { label: 'הוראות בשלבים — תרגול הקשבה', href: '/speech/language/directions' },
  { label: 'שאלות מי, מה, איפה', href: '/speech/language/wh-questions' },
  { label: 'קטגוריות ושיום', href: '/speech/language/categories' },
  { label: 'התפתחות שפה לפי גיל', href: '/speech/parents/language-milestones' },
  { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
  { label: 'הפכים לילדים', href: '/words/opposites' },
]

export default function Prepositions() {
  const [act, setAct] = useState('where')
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO path={PATH}
      title="מילות יחס לילדים: על, מתחת, בתוך, ליד — מושגים מרחביים לגן"
      description="מילות יחס ומושגים מרחביים לגן: משחק „איפה החתול?” עם שמע, „שימו את…” במקום הנכון ותמונות לתיאור, ודפי עבודה על מתחת בתוך ליד להדפסה — כרטיסים, גזור והדבק ובינגו. חינם."
      structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'שפה', href: '/speech/language' }, { label: 'מילות יחס ומושגים מרחביים' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">📦 </span>מילות יחס לילדים: על, מתחת, בתוך, ליד</h1>
    <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">מושגים מרחביים לגן · {CONCEPTS.length} מושגים ב־4 שלבים · {SCENES.filter(s => !s.extra).length} תמונות עם שמע · משחקים ודפי עבודה להדפסה</p>

    <QuickAnswer q="איך מלמדים ילדים מילות יחס כמו על, מתחת ובתוך?"
      a="מתחילים בגוף ובחפצים אמיתיים — נכנסים לתוך קופסה, שמים את הדובי מתחת לשולחן — ורק אחר כך עוברים לתמונות. מלמדים מושג אחד בכל פעם לצד הזוג שלו (על / מתחת), ומרחיבים את מה שהילד/ה אומר/ת („כן, החתול בתוך הקופסה!”). כאן יש משחק הקשבה „איפה החתול?”, משחק „שימו את…”, תמונות לתיאור ודפים להדפסה."
      rows={[['שלבים', 'בתוך, על, מתחת, למעלה/למטה → ליד, מחוץ, מעל, קרוב/רחוק → לפני, מאחורי, בין → ימין/שמאל'], ['משחקים', '„איפה החתול?” · „שימו את…” · „ספרו לי”'], ['להדפסה', 'כרטיסי מושגים, גזור והדבק עם הוראות למבוגר, בינגו מילות יחס'], ['מחיר', 'חינם, בלי הרשמה, בלי הקלטה ובלי ציון']]}
      updated={UPDATED} />
    <SpeechNote />
    <LanguageNav current="prepositions" />

    <section aria-labelledby="prep-play" className="mb-10">
      <h2 id="prep-play" className="mb-3 text-center text-2xl font-bold">משחקים ביחד</h2>
      <div className="mb-4 flex flex-wrap justify-center gap-2" role="tablist" aria-label="פעילות">
        {ACTIVITIES.map(([id, l]) => <button key={id} type="button" role="tab" aria-selected={act === id} onClick={() => setAct(id)}
          className={`min-h-[48px] rounded-xl border-2 px-4 font-bold ${act === id ? 'border-violet-500 bg-violet-600 text-white' : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
      </div>
      {act === 'where' && <WhereGame />}
      {act === 'place' && <PlaceGame />}
      {act === 'talk' && <TalkCards />}
      <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">אין ציון ואין שעון. כדאי לשחק קודם עם חפצים אמיתיים — והמסך הוא עוד דרך לתרגל, לא הראשונה.</p>
    </section>

    <ConceptList />

    <Printables />

    <div className="mx-auto max-w-3xl space-y-5">
      <Guide title="להורים ולגננות: קודם תנועה וחפצים, אחר כך תמונות">
        <ul className="space-y-1.5">
          <Li><b>הגוף קודם:</b> „בואו ניכנס לתוך החישוק”, „מי זוחל מתחת לשולחן?”. כשהגוף עושה — המילה נקלטת.</Li>
          <Li><b>אחר כך חפצים אמיתיים:</b> קופסה, כוס ודובי מספיקים. מחביאים, מוצאים, ומתארים בקול: „הדובי מתחת לכוס!”.</Li>
          <Li><b>רק בסוף תמונות:</b> תמונה היא ייצוג של מקום — קשה יותר מהמקום עצמו. לכן המשחקים והדפים כאן באים אחרי התנועה.</Li>
          <Li><b>מדברים, לא בוחנים:</b> במקום „איפה הכדור?” שוב ושוב, מספרים בקול מה קורה: „אני שמה את הכדור בתוך הסל. עכשיו הוא בתוך הסל”.</Li>
          <Li><b>מרחיבים:</b> הילד/ה אומר/ת „כדור שם” — עונים „כן, הכדור מתחת לכיסא!”. בלי לבקש לחזור.</Li>
          <Li>חמש דקות של משחק עדיפות על חצי שעה של „תרגול”. עוצרים כשזה עוד כיף.</Li>
        </ul>
      </Guide>
      <Guide title="לקלינאיות תקשורת: איך לדרג">
        <ul className="space-y-1.5">
          <Li><b>מושג אחד, עם ניגוד:</b> מכניסים מושג חדש לצד מושג מוכר (על מול מתחת, בתוך מול מחוץ) — במשחק „איפה החתול?” כל שאלה מציגה רק תמונות שאין ביניהן תשובה כפולה.</Li>
          <Li><b>מהבנה להבעה:</b> קודם „הראו לי” (בחירה בין תמונות), אחר כך „שימו את…” (ביצוע), ובסוף „ספרו לי” — תיאור במילים, עם משפט לדוגמה שהמבוגר חושף רק אחרי ניסיון.</Li>
          <Li><b>„על” ו„מעל”:</b> „על” נוגע, „מעל” לא נוגע. כדאי להדגים עם יד: על השולחן — ומעל השולחן.</Li>
          <Li><b>לפני / מאחורי:</b> במשחק ובדפים „לפני” הוא מקום („החתול לפני הקופסה” — קרוב יותר אלינו). „לפני” של זמן נמצא בעמוד <Link className="font-bold underline" to="/speech/language/directions">הוראות בשלבים</Link>.</Li>
          <Li><b>שימו לב לעברית:</b> „מתחת ל־” מתחבר למילה הבאה („מתחת לשולחן”), „ליד” ו„על יד” נכונים שניהם, ולמקום אומרים „מאחורי” ולא „אחרי”.</Li>
          <Li><b>ימין ושמאל</b> — שלב נפרד, שמתחיל בגוף של הילד/ה. בתמונות כאן הם מנקודת המבט של מי שמסתכל.</Li>
        </ul>
      </Guide>
      <Guide title="מתי כדאי להתייעץ?">
        <p>אם ילד/ה בגיל הגן מתקשה גם במושגים הראשונים (בתוך, על, מתחת) כשמשחקים עם חפצים אמיתיים, או מתקשה באופן כללי להבין הוראות ושאלות — כדאי לפנות לקלינאי/ת תקשורת ולבדוק גם שמיעה. טווחי גיל כלליים יש בעמוד <Link className="font-bold underline" to="/speech/parents/language-milestones">התפתחות שפה לפי גיל</Link>.</p>
      </Guide>
    </div>

    <section aria-labelledby="prep-sources" className="mx-auto mt-10 max-w-3xl">
      <h2 id="prep-sources" className="text-xl font-bold">מקורות</h2>
      <ol className="mt-2 list-decimal space-y-1 pr-6 text-[15px] leading-relaxed">
        <li><a href={SOURCES.asha.url} target="_blank" rel="noopener noreferrer" className="underline">{SOURCES.asha.title}</a> — הבנת מילים כמו בתוך, על ומתחת בין גיל 2 ל־3.</li>
        <li>Johnston, J. R., &amp; Slobin, D. I. (1979). The development of locative expressions in English, Italian, Serbo-Croatian and Turkish. Journal of Child Language, 6(3) — סדר הרכישה של מילות המקום.</li>
      </ol>
    </section>

    <div className="mt-12">
      <SeoBody paragraphs={[
        'מילות יחס לילדים — על, מתחת, בתוך, ליד, לפני, מאחורי ובין — הן חלק מהשפה היומיומית של כל גן: „שימו את התיק מתחת לכיסא”, „מי יושב ליד נועה?”, „הכדור נפל מאחורי הארון”. ילד שמבין את המושגים המרחביים האלה יכול לבצע הוראות, למצוא דברים ולספר איפה משהו נמצא.',
        'מושגים מרחביים לגן מלמדים בהדרגה: קודם בגוף ובתנועה, אחר כך עם חפצים אמיתיים, ורק בסוף בתמונות ובדפי עבודה. בעמוד הזה המושגים מסודרים בארבעה שלבים, עם רעיון לתנועה ולחפצים לכל מושג, משחק הקשבה „איפה החתול?”, משחק „שימו את…” בחדר מצויר, ותמונות לתיאור במילים.',
        'לגננות, לקלינאיות ולהורים יש כאן גם דפי עבודה על מתחת בתוך ליד להדפסה: כרטיסי מושגים עם משפט או בלי, דף „גזור והדבק” עם הוראות למבוגר בכל שלב, ובינגו מילות יחס עם כרטיסי קריאה. הכול בחינם, בלי הרשמה, בלי הקלטה ובלי ציון.',
      ]} faq={faq} related={related} />
    </div>
  </div>
}
