import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { PUZZLE_PACKS, EMOJI_GROUPS } from '../../data/emojiStudio'

const STORE = 'buga-emoji-game'
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || null } catch { return null } }
const persist = g => { try { localStorage.setItem(STORE, JSON.stringify(g)) } catch { /* private mode */ } }
// Share link: the whole game rides in the URL hash (nothing is stored on a server).
const encodeGame = g => btoa(unescape(encodeURIComponent(JSON.stringify({ t: g.title, i: g.items.map(x => [x.emojis, x.answer, x.hint1 || '', x.hint2 || '']) })))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const decodeGame = s => {
  try {
    const j = JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))))
    return { title: String(j.t || 'משחק אימוג׳ים').slice(0, 60), items: (j.i || []).slice(0, 60).map(([emojis, answer, hint1, hint2]) => ({ emojis: String(emojis).slice(0, 60), answer: String(answer).slice(0, 80), hint1: String(hint1 || '').slice(0, 120), hint2: String(hint2 || '').slice(0, 120) })).filter(x => x.emojis && x.answer) }
  } catch { return null }
}
const fromPack = p => p.items.map(([emojis, answer, hint1, hint2]) => ({ emojis, answer, hint1, hint2, pack: p.name }))

// ─── The game on the big screen ──────────────────────────────────────────────
function Player({ items: source, title, onClose }) {
  const [phase, setPhase] = useState('setup') // setup | play | end
  const [teams, setTeams] = useState([{ name: 'קבוצה א׳', score: 0 }, { name: 'קבוצה ב׳', score: 0 }])
  const [items, setItems] = useState(() => shuffle(source))
  const [i, setI] = useState(0)
  const [hints, setHints] = useState(0)
  const [revealed, setRevealed] = useState(false)
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' } }, [onClose])
  const cur = items[i]
  const avail = cur ? [cur.hint1, cur.hint2].filter(Boolean) : []
  const points = 3 - hints
  const next = () => { if (i + 1 >= items.length) setPhase('end'); else { setI(i + 1); setHints(0); setRevealed(false) } }
  const award = t => { setTeams(ts => ts.map((x, n) => n === t ? { ...x, score: x.score + points } : x)); next() }
  const restart = () => { setItems(shuffle(source)); setI(0); setHints(0); setRevealed(false); setTeams(ts => ts.map(t => ({ ...t, score: 0 }))); setPhase('play') }
  const best = Math.max(...teams.map(t => t.score))

  return createPortal(<div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-[#fff4bb] via-[#ffe7ef] to-[#e6f0ff]" role="dialog" aria-modal="true" aria-label={title} dir="rtl">
    <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <b className="truncate text-lg">{title}</b>
        <button onClick={onClose} className="rounded-full bg-white px-4 py-2 font-bold shadow-sm">✕ יציאה</button>
      </div>

      {phase === 'setup' && <div className="my-auto rounded-[32px] bg-white p-6 text-center shadow-lg">
        <div className="text-6xl">😀🎬🎵</div>
        <h2 className="mt-3 text-3xl font-black">מי משחק?</h2>
        <p className="mt-1 text-slate-600">{source.length} חידות · ניחוש מהאימוג׳ים = 3 נקודות, אחרי רמז = פחות</p>
        <div className="mx-auto mt-5 max-w-sm space-y-2">{teams.map((t, n) => <div key={n} className="flex gap-2">
          <input value={t.name} onChange={e => setTeams(ts => ts.map((x, m) => m === n ? { ...x, name: e.target.value } : x))} aria-label={`שם קבוצה ${n + 1}`} className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3 py-2.5 text-lg font-bold" />
          {teams.length > 1 && <button onClick={() => setTeams(ts => ts.filter((_, m) => m !== n))} aria-label="הסרת קבוצה" className="rounded-xl px-3 text-slate-400">✕</button>}
        </div>)}</div>
        {teams.length < 4 && <button onClick={() => setTeams(ts => [...ts, { name: `קבוצה ${'אבגד'[ts.length]}׳`, score: 0 }])} className="mt-2 text-sm font-bold underline">＋ עוד קבוצה</button>}
        <button onClick={() => setPhase('play')} className="mt-6 w-full max-w-sm rounded-2xl bg-[var(--ink)] py-4 text-xl font-black text-white">▶️ מתחילים!</button>
      </div>}

      {phase === 'play' && cur && <>
        <div className="mt-3 flex flex-wrap justify-center gap-2">{teams.map((t, n) => <span key={n} className="rounded-full bg-white px-3 py-1.5 font-bold shadow-sm">{t.name}: {t.score}</span>)}</div>
        <div className="my-auto py-6 text-center">
          <p className="text-sm font-bold text-slate-600">חידה {i + 1} מתוך {items.length}{cur.pack ? ` · ${cur.pack}` : ''}</p>
          <div className="mx-auto mt-4 rounded-[36px] bg-white px-4 py-8 shadow-xl sm:py-12">
            <div className="break-words text-[64px] leading-tight tracking-wider sm:text-[96px]" aria-label="החידה">{cur.emojis}</div>
          </div>
          {!revealed && <p className="mt-4 inline-block rounded-full bg-[var(--ink)] px-4 py-1.5 font-bold text-white">שווה {points} {points === 1 ? 'נקודה' : 'נקודות'}</p>}
          {avail.slice(0, hints).map((h, n) => <p key={n} className="mx-auto mt-3 max-w-md rounded-2xl bg-white/80 px-4 py-2 text-lg">💡 {h}</p>)}
          {revealed
            ? <div className="mt-5"><p className="text-sm font-bold text-slate-600">התשובה:</p><p className="text-4xl font-black">{cur.answer}</p>
                <p className="mt-5 font-bold">מי ניחש? (+{points})</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">{teams.map((t, n) => <button key={n} onClick={() => award(n)} className="min-h-[52px] rounded-2xl bg-emerald-600 px-5 text-lg font-bold text-white">{t.name}</button>)}
                  <button onClick={next} className="min-h-[52px] rounded-2xl border-2 border-slate-300 bg-white px-5 font-bold">אף אחד</button></div></div>
            : <div className="mt-5 flex flex-wrap justify-center gap-3">
                {hints < avail.length && <button onClick={() => setHints(h => h + 1)} className="min-h-[52px] rounded-2xl border-2 border-[var(--ink)] bg-white px-5 text-lg font-bold">💡 רמז ({avail.length - hints})</button>}
                <button onClick={() => setRevealed(true)} className="min-h-[52px] rounded-2xl bg-[var(--ink)] px-6 text-lg font-bold text-white">👀 חשיפת התשובה</button>
              </div>}
        </div>
      </>}

      {phase === 'end' && <div className="my-auto rounded-[32px] bg-white p-6 text-center shadow-lg">
        <div className="text-6xl">🏆</div>
        <h2 className="mt-2 text-3xl font-black">{teams.length > 1 ? `ניצחה: ${teams.filter(t => t.score === best).map(t => t.name).join(' ו')}` : `סיימתם עם ${best} נקודות!`}</h2>
        <div className="mx-auto mt-4 max-w-xs space-y-2">{[...teams].sort((a, b) => b.score - a.score).map(t => <div key={t.name} className="flex justify-between rounded-xl bg-slate-50 px-4 py-2 text-lg"><b>{t.name}</b><span>{t.score}</span></div>)}</div>
        <div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={restart} className="rounded-2xl bg-[var(--ink)] px-6 py-3 font-bold text-white">🔄 עוד סיבוב</button><button onClick={onClose} className="rounded-2xl border-2 border-slate-300 px-6 py-3 font-bold">סיום</button></div>
      </div>}
    </div>
  </div>, document.body)
}

// ─── Emoji keyboard ──────────────────────────────────────────────────────────
function EmojiKeyboard({ onPick }) {
  const [group, setGroup] = useState(EMOJI_GROUPS[0].id)
  const [q, setQ] = useState('')
  const all = useMemo(() => EMOJI_GROUPS.flatMap(g => g.items), [])
  const shown = q.trim() ? all.filter(([em, w]) => w.includes(q.trim()) || em === q.trim()).slice(0, 60) : EMOJI_GROUPS.find(g => g.id === group).items
  return <div className="rounded-3xl border-2 border-slate-200 bg-white p-3">
    <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 חיפוש אימוג׳י: כלב, גשם, כתר…" aria-label="חיפוש אימוג׳י" className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-[17px] focus:border-slate-800 focus:outline-none" />
    {!q.trim() && <div className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1">{EMOJI_GROUPS.map(g => <button key={g.id} type="button" onClick={() => setGroup(g.id)} aria-pressed={group === g.id}
      className={`shrink-0 whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-sm font-bold ${group === g.id ? 'border-[var(--ink)] bg-[var(--postit)]' : 'border-slate-200 bg-white'}`}>{g.name}</button>)}</div>}
    <div className="mt-2 grid max-h-64 grid-cols-7 gap-1 overflow-y-auto sm:grid-cols-10">
      {shown.map(([em, w], n) => <button key={em + n} type="button" onClick={() => onPick(em)} aria-label={w || em} title={w} className="grid h-11 place-items-center rounded-xl text-[28px] hover:bg-slate-100 active:scale-90">{em}</button>)}
      {!shown.length && <p className="col-span-full p-3 text-center text-sm text-slate-500">לא מצאנו. אפשר גם להקליד אימוג׳י מהמקלדת של הטלפון.</p>}
    </div>
  </div>
}

// ─── Builder ─────────────────────────────────────────────────────────────────
const blank = { emojis: '', answer: '', hint1: '', hint2: '' }
function Builder({ game, setGame, onPlay }) {
  const [d, setD] = useState(blank), [editing, setEditing] = useState(null), [msg, setMsg] = useState('')
  const field = useRef()
  const flash = t => { setMsg(t); setTimeout(() => setMsg(''), 2500) }
  const set = (k, v) => setD(x => ({ ...x, [k]: v }))
  const backspace = () => set('emojis', (typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter('he', { granularity: 'grapheme' }).segment(d.emojis)].map(s => s.segment) : Array.from(d.emojis)).slice(0, -1).join(''))
  const save = e => {
    e.preventDefault()
    if (!d.emojis.trim() || !d.answer.trim()) return
    const item = { emojis: d.emojis.trim(), answer: d.answer.trim(), hint1: d.hint1.trim(), hint2: d.hint2.trim() }
    const items = editing != null ? game.items.map((x, n) => n === editing ? item : x) : [...game.items, item]
    setGame({ ...game, items }); setD(blank); setEditing(null); flash(editing != null ? '✓ החידה עודכנה' : `✓ נוספה חידה ${items.length}`)
  }
  const link = game.items.length ? `${location.origin}/tools/emoji-studio#g=${encodeGame(game)}` : ''
  const share = () => window.open(`https://wa.me/?text=${encodeURIComponent(`😀 ${game.title || 'משחק אימוג׳ים'} — נחשו מה מסתתר מאחורי האימוג׳ים!\n${link}`)}`, '_blank', 'noopener')
  const copy = async () => { try { await navigator.clipboard.writeText(link); flash('✓ הקישור הועתק') } catch { flash(link) } }

  return <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <form onSubmit={save} className="min-w-0 space-y-3 rounded-[28px] border-2 border-[var(--border)] bg-[var(--postit)] p-4 sm:p-5">
      <h2 className="text-2xl font-black">{editing != null ? `✏️ עריכת חידה ${editing + 1}` : '✏️ חידה חדשה'}</h2>
      <div className="flex items-center gap-2 rounded-2xl border-2 border-[var(--ink)] bg-white p-2">
        <input ref={field} value={d.emojis} onChange={e => set('emojis', e.target.value)} placeholder="לחצו על אימוג׳ים למטה 👇" aria-label="האימוג׳ים של החידה" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-4xl tracking-wider placeholder:text-base placeholder:tracking-normal focus:outline-none" />
        {d.emojis && <button type="button" onClick={backspace} aria-label="מחיקת האימוג׳י האחרון" className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-xl">⌫</button>}
      </div>
      <EmojiKeyboard onPick={em => set('emojis', d.emojis + em)} />
      <input value={d.answer} onChange={e => set('answer', e.target.value)} maxLength={80} required placeholder="התשובה (למשל: מלך האריות)" aria-label="התשובה" className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-3 text-lg font-bold focus:border-slate-800 focus:outline-none" />
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={d.hint1} onChange={e => set('hint1', e.target.value)} maxLength={120} placeholder="רמז 1 (לא חובה)" aria-label="רמז 1" className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 focus:border-slate-800 focus:outline-none" />
        <input value={d.hint2} onChange={e => set('hint2', e.target.value)} maxLength={120} placeholder="רמז 2 (לא חובה)" aria-label="רמז 2" className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 focus:border-slate-800 focus:outline-none" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button disabled={!d.emojis.trim() || !d.answer.trim()} className="min-h-[52px] flex-1 rounded-2xl bg-[var(--ink)] px-5 text-lg font-bold text-white disabled:opacity-50">{editing != null ? '✓ שמירת השינוי' : '➕ הוספה למשחק'}</button>
        {editing != null && <button type="button" onClick={() => { setEditing(null); setD(blank) }} className="min-h-[52px] rounded-2xl border-2 border-slate-300 bg-white px-4 font-bold">ביטול</button>}
      </div>
      {msg && <p role="status" className="font-bold text-emerald-700">{msg}</p>}
    </form>

    <section className="min-w-0 space-y-3">
      <div className="rounded-[28px] border-2 border-[var(--border)] bg-white p-4 sm:p-5">
        <label className="block font-bold">שם המשחק<input value={game.title} onChange={e => setGame({ ...game, title: e.target.value })} maxLength={60} className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-lg focus:border-slate-800 focus:outline-none" /></label>
        <h2 className="mt-4 text-xl font-black">החידות שלי ({game.items.length})</h2>
        {game.items.length ? <ol className="mt-2 divide-y divide-slate-100">{game.items.map((x, n) => <li key={n} className="flex items-center gap-2 py-2">
          <span className="w-6 shrink-0 text-sm text-slate-400">{n + 1}.</span>
          <span className="shrink-0 text-2xl">{x.emojis}</span>
          <span className="min-w-0 flex-1 truncate font-bold">{x.answer}</span>
          <button onClick={() => { setD({ ...blank, ...x }); setEditing(n); field.current?.scrollIntoView({ block: 'center' }) }} aria-label={`עריכת ${x.answer}`} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100">✏️</button>
          <button onClick={() => setGame({ ...game, items: game.items.filter((_, m) => m !== n) })} aria-label={`מחיקת ${x.answer}`} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:text-rose-600">✕</button>
        </li>)}</ol> : <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-center text-slate-600">עוד אין חידות. בנו את הראשונה משמאל — או התחילו מ„עוד חידות מוכנות” למטה.</p>}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <button onClick={onPlay} disabled={!game.items.length} className="min-h-[56px] rounded-2xl bg-[#4caf50] px-4 text-lg font-bold text-white disabled:opacity-50 sm:col-span-3">▶️ משחקים במשחק שלי</button>
        <button onClick={share} disabled={!game.items.length} className="min-h-[48px] rounded-2xl bg-[#25D366] px-4 font-bold text-white disabled:opacity-50 sm:col-span-2">📱 שליחה בוואטסאפ</button>
        <button onClick={copy} disabled={!game.items.length} className="min-h-[48px] rounded-2xl border-2 border-slate-800 bg-white px-4 font-bold disabled:opacity-50">🔗 העתקת קישור</button>
      </div>
      <details className="rounded-2xl bg-white p-4">
        <summary className="cursor-pointer font-bold">📚 עוד חידות מוכנות להוספה</summary>
        <div className="mt-3 flex flex-wrap gap-2">{PUZZLE_PACKS.map(p => <button key={p.id} onClick={() => { setGame({ ...game, items: [...game.items, ...fromPack(p).map(({ pack, ...x }) => x)] }); flash(`✓ נוספו ${p.items.length} חידות`) }} className="rounded-full border-2 border-slate-200 px-3 py-1.5 text-sm font-bold">＋ {p.emoji} {p.name}</button>)}</div>
      </details>
    </section>
  </div>
}

export default function EmojiStudio() {
  const [tab, setTab] = useState('ready')
  const [packs, setPacks] = useState([PUZZLE_PACKS[0].id])
  const [game, setGameState] = useState(() => load() || { title: 'המשחק שלי', items: [] })
  const [shared, setShared] = useState(null)
  const [playing, setPlaying] = useState(null)
  const setGame = g => { setGameState(g); persist(g) }
  useEffect(() => {
    const m = location.hash.match(/g=([\w-]+)/)
    if (m) { const g = decodeGame(m[1]); if (g?.items.length) { setShared(g); setTab('shared') } }
  }, [])
  const readyItems = PUZZLE_PACKS.filter(p => packs.includes(p.id)).flatMap(fromPack)
  const tabs = [['ready', '🎮 משחק מוכן'], ['build', '✏️ יוצרים משחק'], ...(shared ? [['shared', '📨 המשחק ששלחו לך']] : [])]

  return <div className="mx-auto max-w-6xl px-4 py-8">
    <SEO title="אימוג׳י סטודיו — משחק ניחוש שירים וסרטים באימוג׳ים" description="משחק אימוג׳ים לקבוצות: מנחשים שירים, סרטים, אגדות וניבים לפי אימוג׳ים, עם רמזים וניקוד. או בונים משחק משלכם עם מקלדת אימוג׳ים ושולחים בוואטסאפ." path="/tools/emoji-studio" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'אימוג׳י סטודיו' }]} />
    <header className="mb-6 text-center">
      <div className="text-5xl">😀🎬🎵</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">אימוג׳י סטודיו</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">מנחשים שיר, סרט או ניב לפי אימוג׳ים — על המסך הגדול, בקבוצות ועם ניקוד. או בונים משחק משלכם ושולחים לכולם.</p>
    </header>
    <div className="mb-6 flex flex-wrap justify-center gap-2">{tabs.map(([id, l]) => <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id}
      className={`min-h-[48px] rounded-2xl border-2 px-5 text-lg font-bold ${tab === id ? 'border-[var(--ink)] bg-[var(--ink)] text-white' : 'border-slate-200 bg-white'}`}>{l}</button>)}</div>

    {tab === 'ready' && <div className="mx-auto max-w-3xl rounded-[28px] border-2 border-[var(--border)] bg-white p-5 sm:p-7">
      <h2 className="text-2xl font-black">בוחרים נושאים</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{PUZZLE_PACKS.map(p => { const on = packs.includes(p.id); return <button key={p.id} onClick={() => setPacks(x => on ? x.filter(y => y !== p.id) : [...x, p.id])} aria-pressed={on}
        className={`rounded-2xl border-2 p-3 text-start ${on ? 'border-[var(--ink)] bg-[var(--postit)] shadow-[3px_3px_0_#14162d]' : 'border-slate-200 bg-white'}`}>
        <span className="text-3xl">{p.emoji}</span><b className="mt-1 block">{p.name}</b><span className="text-sm text-slate-500">{p.items.length} חידות · למשל {p.items[0][0]}</span></button> })}</div>
      <button onClick={() => setPlaying({ items: readyItems, title: 'אימוג׳י סטודיו' })} disabled={!readyItems.length} className="mt-5 w-full rounded-2xl bg-[#4caf50] py-4 text-xl font-black text-white disabled:opacity-50">▶️ מתחילים לשחק ({readyItems.length} חידות)</button>
      <p className="mt-3 text-center text-sm text-slate-600">💡 הכי כיף על מסך גדול או טלוויזיה. מנחה אחד מחזיק את המסך, כולם מנחשים בקול.</p>
    </div>}

    {tab === 'build' && <Builder game={game} setGame={setGame} onPlay={() => setPlaying({ items: game.items, title: game.title || 'המשחק שלי' })} />}

    {tab === 'shared' && shared && <div className="mx-auto max-w-2xl rounded-[28px] border-2 border-[var(--border)] bg-[var(--postit)] p-6 text-center">
      <p className="font-bold text-slate-600">שלחו לך משחק 🎁</p>
      <h2 className="mt-1 text-3xl font-black">{shared.title}</h2>
      <p className="mt-1">{shared.items.length} חידות אימוג׳ים — התשובות מוסתרות עד החשיפה</p>
      <button onClick={() => setPlaying({ items: shared.items, title: shared.title })} className="mt-5 w-full rounded-2xl bg-[#4caf50] py-4 text-xl font-black text-white">▶️ מתחילים לשחק</button>
      <button onClick={() => { setGame({ title: shared.title, items: shared.items }); setTab('build') }} className="mt-3 text-sm font-bold underline">עריכה ושמירה כמשחק שלי</button>
    </div>}

    {playing && <Player key={playing.title + playing.items.length} items={playing.items} title={playing.title} onClose={() => setPlaying(null)} />}
  </div>
}
