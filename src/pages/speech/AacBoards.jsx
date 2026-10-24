import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import QuickAnswer from '../../components/ui/QuickAnswer'
import PrintPreview from '../../components/ui/PrintPreview'
import { Sheet } from '../../components/printables/PrintableShell'
import { hasVoice, speak, stopSpeaking } from '../../utils/speak'
import SpeechNote from './SpeechNote'
import { PICTOGRAMS } from './aacPictograms'
import {
  CATEGORIES, categoryById, ITEMS, itemById, CORE_GRID, CORE_COLUMNS, CORE_ROWS, TOPICS, topicById, topicGrid,
  wordOf, spokenOf, CHOICE_QUESTION, SOURCES,
} from '../../data/speech/aac'

// /speech/aac — AAC (תקשורת תומכת וחליפית, תת״ח) boards in Hebrew: a core-vocabulary board and
// topic boards, an on-screen speaking board (tap symbols → sentence strip → read aloud), and A4
// printables (core board A4 / A3 in two halves, topic boards, single cards, first–then and choice
// boards). Regulation, feelings and schedule cards live on /printables/sensory-communication-cards.

const PATH = '/speech/aac'
const UPDATED = '2026-10-24'
const FONT = 'Heebo, Arial, sans-serif'
const EMOJI = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
const SENSORY = '/printables/sensory-communication-cards'
const GENDERS = [['b', 'כללי (צריך/ה)'], ['m', 'ילד (צריך)'], ['f', 'ילדה (צריכה)']]
const MAX_STRIP = 12

// ── Pictures ─────────────────────────────────────────────────────────────────

function Pic({ e, className = 'text-4xl', px = 44 }) {
  if (e.startsWith('svg:')) return <svg viewBox="0 0 100 100" width={px} height={px} aria-hidden="true" className="shrink-0">{PICTOGRAMS[e.slice(4)]}</svg>
  return <span aria-hidden="true" className={`leading-none ${className}`}>{e}</span>
}

function SheetPic({ e, cx, cy, size, gray }) {
  const filter = gray ? 'url(#aac-gray)' : undefined
  if (e.startsWith('svg:')) return <g filter={filter} transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 100})`}>{PICTOGRAMS[e.slice(4)]}</g>
  return <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.86} fontFamily={EMOJI} filter={filter}>{e}</text>
}

// ── Printables ───────────────────────────────────────────────────────────────

const Gray = () => <defs><filter id="aac-gray"><feColorMatrix type="saturate" values="0" /></filter></defs>

function Txt({ x, y, size, weight = 400, fill = '#111', anchor = 'middle', children }) {
  return <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} direction="rtl" fontFamily={FONT}>{children}</text>
}

const labelSize = (text, w, max) => Math.min(max, (w * 0.86) / (Math.max(2, text.length) * 0.58))

// One symbol cell: coloured frame by category (or black outline), picture, word underneath.
function Cell({ x, y, w, h, item, o, pad = 1.1, max }) {
  const cat = categoryById[item.c], word = wordOf(item, o.gender)
  const iw = w - 2 * pad, ih = h - 2 * pad, m = Math.min(iw, ih)
  const size = labelSize(word, iw, max || m * 0.2)
  return <g>
    <rect x={x + pad} y={y + pad} width={iw} height={ih} rx={Math.min(3, m * 0.08)} fill={o.color ? cat.color[1] : '#fff'} stroke={o.color ? cat.color[0] : '#111'} strokeWidth={o.color ? 0.9 : 0.6} />
    <SheetPic e={item.e} cx={x + w / 2} cy={y + pad + ih * 0.4} size={Math.min(iw * 0.7, ih * 0.58)} gray={!o.color} />
    <Txt x={x + w / 2} y={y + pad + ih * 0.9} size={size} weight={800}>{word}</Txt>
  </g>
}

function Header({ title, note }) {
  return <>
    <Txt x={100} y={10} size={6.4} weight={900}>{title}</Txt>
    {note && <Txt x={100} y={15.6} size={3.2} fill="#4b5563">{note}</Txt>}
  </>
}

function Legend({ y, o }) {
  if (!o.color) return <Txt x={100} y={y + 3} size={2.9} fill="#4b5563">בשחור־לבן אפשר לצבוע את המסגרות לפי הקוד: אנשים צהוב · פעולות ירוק · תיאורים כחול · שאלות סגול · חברתי ורוד</Txt>
  const cats = CATEGORIES.filter(c => c.id !== 'nouns'), w = 190 / cats.length
  return <g>{cats.map((c, i) => {
    const x = 195 - (i + 1) * w
    return <g key={c.id}>
      <rect x={x + 1} y={y} width={w - 2} height={5} rx={1.2} fill={c.color[1]} stroke={c.color[0]} strokeWidth=".5" />
      <Txt x={x + w / 2} y={y + 3.6} size={2.7} weight={700}>{c.label}</Txt>
    </g>
  })}</g>
}

function CutLines({ cells }) {
  const seen = new Set(), lines = []
  const add = (...l) => { const k = l.map(v => v.toFixed(2)).join(); if (!seen.has(k)) { seen.add(k); lines.push(l) } }
  for (const c of cells) { add(c.x, c.y, c.x + c.w, c.y); add(c.x, c.y + c.h, c.x + c.w, c.y + c.h); add(c.x, c.y, c.x, c.y + c.h); add(c.x + c.w, c.y, c.x + c.w, c.y + c.h) }
  return <g stroke="#9ca3af" strokeWidth=".35" strokeDasharray="2 1.4">{lines.map((l, i) => <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />)}</g>
}

// Core board on one A4: 6 × 8, legend at the bottom.
function corePage(o) {
  const GX = 5, GY = 19, cw = 190 / 6, ch = 239 / CORE_ROWS
  const cells = CORE_GRID.flatMap((row, r) => row.map((id, c) => ({ item: itemById[id], x: GX + 190 - (c + 1) * cw, y: GY + r * ch, w: cw, h: ch })))
  return {
    key: 'core',
    svg: <Sheet label="לוח מילות ליבה">
      <Gray />
      <Txt x={100} y={10} size={6.6} weight={900}>לוח מילות ליבה</Txt>
      <Txt x={195} y={16} size={3.4} anchor="start" fill="#374151">הלוח של: ________________</Txt>
      <Txt x={5} y={16} size={3} anchor="end" fill="#4b5563">מצביעים, אומרים בקול ומחכים</Txt>
      {cells.map(c => <Cell key={c.item.id} {...c} o={o} max={4.6} />)}
      <Legend y={260} o={o} />
    </Sheet>,
  }
}

// The same board at A3 size, in two A4 halves (rows 1–4 and 5–8), each drawn sideways so the cells
// grow by √2. Trim along the dashed line and tape the halves together.
function a3Pages(o) {
  const LW = 262, cw = 256 / 6, ch = 44
  return [0, 1].map(part => {
    const top = part === 0 ? 14 : 2
    const rows = CORE_GRID.slice(part * 4, part * 4 + 4)
    const cells = rows.flatMap((row, r) => row.map((id, c) => ({ item: itemById[id], x: 3 + 256 - (c + 1) * cw, y: top + r * ch, w: cw, h: ch })))
    const cutY = part === 0 ? top + 4 * ch : top
    return {
      key: `a3-${part}`,
      svg: <Sheet label={`לוח מילות ליבה בגודל A3 — חלק ${part + 1} מתוך 2`}>
        <Gray />
        <g transform="translate(197 4) rotate(90)">
          {part === 0
            ? <><Txt x={LW / 2} y={8} size={6.4} weight={900}>לוח מילות ליבה · A3 — חלק 1 מתוך 2 (למעלה)</Txt>
              <Txt x={LW - 2} y={8} size={3.2} anchor="start" fill="#374151">הלוח של: ____________</Txt></>
            : <Txt x={LW / 2} y={top + 4 * ch + 7} size={3.4} fill="#4b5563">חלק 2 מתוך 2 (למטה) · גוזרים בקו המקווקו העליון ומצמידים מתחת לחלק 1, כך שהעמודות ממשיכות</Txt>}
          {cells.map(c => <Cell key={c.item.id} {...c} o={o} max={6.2} />)}
          <line x1={0} x2={LW} y1={cutY} y2={cutY} stroke="#6b7280" strokeWidth=".45" strokeDasharray="2.4 1.6" />
        </g>
      </Sheet>,
    }
  })
}

// A topic board: 4 × 4, core words in the top row.
function topicPage(t, o) {
  const GX = 5, GY = 20, cw = 190 / 4, ch = 240 / 4
  const cells = topicGrid(t).flatMap((row, r) => row.map((id, c) => ({ item: itemById[id], x: GX + 190 - (c + 1) * cw, y: GY + r * ch, w: cw, h: ch })))
  return {
    key: `topic-${t.id}`,
    svg: <Sheet label={`לוח נושא: ${t.title}`}>
      <Gray />
      <Header title={`לוח תקשורת: ${t.title}`} note="השורה העליונה — מילות ליבה שנשארות בכל לוח. מצביעים ואומרים בקול." />
      {cells.map(c => <Cell key={c.item.id + c.y} {...c} o={o} max={7} />)}
      <line x1={GX} x2={GX + 190} y1={GY + ch} y2={GY + ch} stroke="#111" strokeWidth=".9" />
    </Sheet>,
  }
}

// Single cards to cut out, from one board.
function cardPages(items, o, title) {
  const [cols, rows] = o.cardSize === 'large' ? [3, 4] : [4, 5]
  const GX = 5, GY = 20, cw = 190 / cols, ch = 244 / rows, per = cols * rows
  const count = Math.ceil(items.length / per)
  return Array.from({ length: count }, (_, s) => {
    const cells = items.slice(s * per, s * per + per).map((item, i) => ({ item, x: GX + 190 - ((i % cols) + 1) * cw, y: GY + Math.floor(i / cols) * ch, w: cw, h: ch }))
    return {
      key: `cards-${s}`,
      svg: <Sheet label={`${title} — דף ${s + 1}`}>
        <Gray />
        <Header title={count > 1 ? `${title} (${s + 1}/${count})` : title} note="✂ גוזרים לאורך הקווים המקווקווים · כדאי לצפות בלמינציה ולהדביק סקוטש (ולקרו) מאחור" />
        <CutLines cells={cells} />
        {cells.map(c => <Cell key={c.item.id} {...c} o={o} pad={2.4} max={o.cardSize === 'large' ? 8 : 6.4} />)}
      </Sheet>,
    }
  })
}

// First–then board with the two chosen symbols already on it.
function firstThenPage(o, firstId, thenId) {
  const panel = (y, head, id) => {
    const item = itemById[id]
    return <g>
      <rect x={30} y={y} width={140} height={104} rx={5} fill="#fff" stroke="#111" strokeWidth=".9" />
      <rect x={30} y={y} width={140} height={15} rx={5} fill={o.color ? '#e0e7ff' : '#f3f4f6'} stroke="#111" strokeWidth=".9" />
      <Txt x={100} y={y + 11} size={8} weight={900}>{head}</Txt>
      {item
        ? <Cell x={62} y={y + 20} w={76} h={80} item={item} o={o} max={9} />
        : <><rect x={62} y={y + 21} width={76} height={78} rx={3} fill="none" stroke="#9ca3af" strokeWidth=".5" strokeDasharray="2 1.4" /><Txt x={100} y={y + 62} size={3.6} fill="#9ca3af">מדביקים כאן כרטיס</Txt></>}
    </g>
  }
  return {
    key: 'first-then',
    svg: <Sheet label="לוח קודם ואחר כך">
      <Gray />
      <Header title="קודם — אחר כך" note="מראים את הלוח לפני המעבר, אומרים בקול: ״קודם… ואחר כך…״, ומורידים את הכרטיס כשסיימנו" />
      {panel(22, 'קודם', firstId)}
      <path d="M100 129 L100 142 M93 135 L100 142 L107 135" stroke="#111" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {panel(147, 'אחר כך', thenId)}
      <Txt x={100} y={262} size={3} fill="#4b5563">רוצים לוח ריק לכרטיסי סדר יום? יש גם לוח ״קודם–אחר כך״ ורצועת סדר יום בעמוד כרטיסי הוויסות והתקשורת באתר.</Txt>
    </Sheet>,
  }
}

// Choice board: 2 or 4 options, and a sentence strip "אני רוצה ___" at the bottom.
function choicePage(o, ids) {
  const items = ids.map(id => itemById[id]).filter(Boolean)
  const n = items.length
  const [cols, rows] = n <= 2 ? [2, 1] : [2, 2]
  const GX = 10, GY = 24, W = 180, H = 190, cw = W / cols, ch = H / rows
  const cells = items.map((item, i) => ({ item, x: GX + W - ((i % cols) + 1) * cw, y: GY + Math.floor(i / cols) * ch, w: cw, h: n <= 2 ? 150 : ch }))
  const strip = ['i', 'want'].map(id => itemById[id])
  return {
    key: 'choice',
    svg: <Sheet label="לוח בחירה">
      <Gray />
      <Header title={CHOICE_QUESTION[o.gender]} note={`לוח בחירה בין ${n} אפשרויות · מציעים רק דברים שאפשר באמת לתת`} />
      {cells.map(c => <Cell key={c.item.id + c.x + c.y} {...c} o={o} pad={3} max={12} />)}
      <rect x={20} y={222} width={160} height={36} rx={4} fill="none" stroke="#111" strokeWidth=".6" />
      {strip.map((item, i) => <Cell key={item.id} x={180 - (i + 1) * 34 - 2} y={224} w={34} h={32} item={item} o={o} max={5} />)}
      <rect x={24} y={226} width={84} height={28} rx={3} fill="none" stroke="#9ca3af" strokeWidth=".5" strokeDasharray="2 1.4" />
      <Txt x={66} y={242} size={3.4} fill="#9ca3af">כאן מניחים את מה שבחרו</Txt>
    </Sheet>,
  }
}

const sheetsOf = list => list.map(p => <article className="buga-a4" key={p.key}><div className="print-art">{p.svg}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)

// ── On-screen speaking board ─────────────────────────────────────────────────

function Symbol({ item, gender, onTap, compact }) {
  const cat = categoryById[item.c], word = wordOf(item, gender)
  return <button type="button" onClick={() => onTap(item)} aria-label={word}
    style={{ background: cat.color[1], borderColor: cat.color[0] }}
    className={`flex aspect-square w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border-2 p-0.5 text-center shadow-sm transition active:scale-95 sm:gap-1 sm:p-1 ${compact ? '' : 'sm:aspect-[4/3.6]'}`}>
    <Pic e={item.e} className={compact ? 'text-2xl sm:text-4xl' : 'text-4xl sm:text-5xl'} px={compact ? 30 : 46} />
    <span className={`block w-full truncate font-bold leading-tight text-slate-900 ${compact ? 'text-[11px] sm:text-sm' : 'text-sm sm:text-base'}`}>{word}</span>
  </button>
}

function SpeakingBoard({ gender, setGender }) {
  const [board, setBoard] = useState('core')
  const [strip, setStrip] = useState([])
  const [speakEach, setSpeakEach] = useState(true)
  const [voiceOk, setVoiceOk] = useState(true)
  const [full, setFull] = useState(false)
  const wrap = useRef(null)
  useEffect(() => { let on = true; hasVoice('he-IL').then(ok => { if (on) setVoiceOk(ok) }); return () => { on = false } }, [])
  useEffect(() => {
    const onFs = () => setFull(document.fullscreenElement === wrap.current)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])
  useEffect(() => () => stopSpeaking(), [])

  const rows = board === 'core' ? CORE_GRID : topicGrid(topicById[board])
  const cols = rows[0].length
  const items = strip.map(k => itemById[k.id])
  const sentence = items.map(i => wordOf(i, gender)).join(' ')
  const spoken = items.map(i => spokenOf(i, gender)).join(' ')

  const tap = item => {
    setStrip(s => s.length >= MAX_STRIP ? s : [...s, { id: item.id, key: `${item.id}-${Date.now()}-${s.length}` }])
    if (speakEach) speak(wordOf(item, gender === 'b' ? 'm' : gender), 'he-IL', { rate: 0.85, say: spokenOf(item, gender) })
  }
  const readAll = () => { if (items.length) speak(sentence, 'he-IL', { rate: 0.8, say: spoken }) }
  const toggleFull = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await wrap.current?.requestFullscreen?.()
    } catch { /* not supported — the board works the same without it */ }
  }

  return <div ref={wrap} className={`rounded-2xl border border-[var(--border)] bg-white p-2 shadow-sm sm:p-4 ${full ? 'overflow-auto' : ''}`} dir="rtl">
    <div className="mb-3 flex flex-wrap justify-center gap-1.5" role="tablist" aria-label="איזה לוח">
      {[['core', '⭐', 'מילות ליבה'], ...TOPICS.map(t => [t.id, t.emoji, t.title])].map(([id, e, l]) =>
        <button key={id} type="button" role="tab" aria-selected={board === id} onClick={() => setBoard(id)}
          className={`min-h-[44px] rounded-full border-2 px-3 text-sm font-bold sm:text-base ${board === id ? 'border-violet-500 bg-violet-600 text-white' : 'border-[var(--border)] bg-white'}`}><span aria-hidden="true">{e} </span>{l}</button>)}
    </div>

    {/* sentence strip */}
    <div className="sticky top-0 z-10 mb-3 rounded-2xl border-2 border-slate-800 bg-[var(--postit)] p-2">
      <div className="flex min-h-[72px] items-center gap-1.5 overflow-x-auto" aria-live="polite" aria-label="פס המשפט">
        {items.length
          ? items.map((item, i) => <span key={strip[i].key} className="flex min-w-[56px] flex-col items-center rounded-lg border bg-white px-1 py-0.5" style={{ borderColor: categoryById[item.c].color[0] }}>
            <Pic e={item.e} className="text-2xl" px={28} /><span className="text-xs font-bold">{wordOf(item, gender)}</span>
          </span>)
          : <span className="px-2 text-[var(--muted-foreground)]">לוחצים על תמונות — והמשפט נבנה כאן</span>}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={readAll} disabled={!items.length} className="min-h-[48px] rounded-xl bg-violet-600 px-5 text-lg font-bold text-white disabled:opacity-50">🔊 הקראה</button>
        <button type="button" onClick={() => setStrip(s => s.slice(0, -1))} disabled={!items.length} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-4 font-bold disabled:opacity-50" aria-label="מחיקת המילה האחרונה">⌫ מחיקה</button>
        <button type="button" onClick={() => setStrip([])} disabled={!items.length} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-4 font-bold disabled:opacity-50">🧹 ניקוי</button>
      </div>
    </div>

    <div className="grid gap-1 sm:gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {rows.flatMap((row, r) => row.map((id, c) => <Symbol key={`${r}-${c}`} item={itemById[id]} gender={gender} onTap={tap} compact={cols > 4} />))}
    </div>

    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
      <div role="group" aria-label="נוסח הפעלים והתארים" className="flex flex-wrap justify-center gap-1.5">
        {GENDERS.map(([g, l]) => <button key={g} type="button" aria-pressed={gender === g} onClick={() => setGender(g)}
          className={`min-h-[44px] rounded-full border-2 px-3 font-bold ${gender === g ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
      </div>
      <button type="button" aria-pressed={speakEach} onClick={() => setSpeakEach(v => !v)} className={`min-h-[44px] rounded-full border-2 px-3 font-bold ${speakEach ? 'border-violet-400 bg-violet-50' : 'border-[var(--border)] bg-white'}`}>{speakEach ? '🔈 כל מילה נשמעת' : '🔇 רק הקראת המשפט'}</button>
      <button type="button" onClick={toggleFull} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-3 font-bold">{full ? '↙️ יציאה ממסך מלא' : '⛶ מסך מלא'}</button>
    </div>
    {!voiceOk && <p className="mt-2 text-center text-sm text-[var(--muted-foreground)]">לא נמצא במכשיר הזה קול בעברית. הלוח עובד גם בלי קול: מצביעים, והמבוגר אומר את המשפט בקול.</p>}
    {gender === 'b' && <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">בנוסח הכללי הכרטיס מציג את שתי הצורות, והקול אומר את הצורה הכללית בדקדוק (צריך, אוהב). אפשר לבחור ילד או ילדה.</p>}
  </div>
}

// ── Page ─────────────────────────────────────────────────────────────────────

const faq = [
  { q: 'מה זה תקשורת תומכת וחליפית (תת״ח)?', a: 'תת״ח (באנגלית AAC) היא כל דרך לתקשר שמוסיפה על הדיבור או מחליפה אותו: הצבעה על תמונות בלוח תקשורת, כרטיסים, סימנים בידיים, מחברת תקשורת, או מכשיר ואפליקציה שמשמיעים קול. היא מיועדת לילדים ולמבוגרים שהדיבור שלהם לא מספיק כדי להגיד את כל מה שהם רוצים — באופן זמני או לאורך זמן.' },
  { q: 'האם לוח תקשורת יעכב את הדיבור של הילד?', a: 'לא. זה החשש הנפוץ ביותר, והמחקר לא תומך בו. לפי ASHA (האיגוד האמריקאי לשמיעה, שפה ודיבור) וסקירות מחקר, תת״ח לא פוגעת בהתפתחות הדיבור, ובחלק מהמחקרים הדיבור אף גדל אחרי שהתחילו להשתמש בה. הילד מקבל דרך להצליח לתקשר עכשיו — וזה מוריד תסכול ונותן לשפה מקום לגדול.' },
  { q: 'מה הן מילות ליבה, ולמה דווקא הן?', a: 'מילות ליבה הן מילים קצרות שחוזרות שוב ושוב בכל נושא ובכל מקום: רוצה, עוד, לא, די, אני, זה, לפתוח, איפה. עם כמה עשרות מילים כאלה אפשר לבקש, לסרב, לשאול, להגיב ולתאר — בגן, בבית ובחצר. מילים כמו "בננה" או "מגלשה" (מילות נושא) חשובות גם הן, אבל מתאימות לפעילות מסוימת, ולכן הן בלוחות הנושא.' },
  { q: 'למה למילים יש צבעים שונים?', a: 'זה קוד צבעים מקובל בלוחות תקשורת, שנקרא "מפתח פיצג׳רלד המותאם": אנשים בצהוב, פעולות בירוק, תיאורים בכחול, שמות של דברים בכתום, מילים חברתיות בוורוד ושאלות בסגול. זו מוסכמה ולא חובה, ויש לה כמה גרסאות. אם לילד כבר יש מערכת עם צבעים אחרים — כדאי להמשיך איתה.' },
  { q: 'צריך "להיות מוכנים" לתת״ח? יש גיל מינימלי?', a: 'לא צריך להוכיח מוכנות. ASHA מציינת שאין דרישות מוקדמות לשימוש בתת״ח, ואפשר להתחיל גם עם פעוטות. מה שכן חשוב הוא לבחור את הלוח, הגודל ומספר התמונות יחד עם קלינאית התקשורת, לפי הראייה, התנועה וההבנה של הילד.' },
  { q: 'איך מדגימים על הלוח?', a: 'מדברים ומצביעים יחד: כשאומרים "רוצה עוד?" — נוגעים ב"רוצה" וב"עוד". זה נקרא הדגמה בעזרת הלוח (aided language stimulation או modeling). ילדים לומדים שפה כשהם רואים ושומעים אותה הרבה לפני שהם משתמשים בה, ולכן מדגימים בלי לבקש מהילד "תראה לי" או "תגיד".' },
  { q: 'מה עושה הבחירה ילד, ילדה או כללי?', a: 'בעברית חלק מהמילים משתנות לפי מי שמדבר: צריך/צריכה, אוהב/אוהבת, עייף/עייפה, שמח/שמחה. בוחרים "ילד" או "ילדה" כדי שהלוח ידבר בשפה של הילד או הילדה, או "כללי" ללוח משותף לכל הגן (צריך/ה). הבחירה משפיעה גם על הקול וגם על הדפים להדפסה.' },
  { q: 'איך מדפיסים לוח בגודל A3?', a: 'בוחרים "לוח ליבה A3" ומקבלים שני דפי A4. בכל דף ארבע שורות של הלוח, מסובבות לרוחב ובגודל גדול יותר. גוזרים את השוליים בקו המקווקו ומצמידים את שני החלקים זה לזה — יחד הם לוח בגודל A3. אם יש מדפסת A3, אפשר גם להדפיס את לוח ה-A4 בהגדלה.' },
  { q: 'אפשר להשתמש בלוח הזה במקום לוח אישי או מכשיר?', a: 'הלוח כאן מתאים להתחלה, לגן, לבית ולהדגמה, אבל הוא לא מחליף התאמה אישית. ילד שזקוק לתת״ח לאורך זמן צריך הערכה של קלינאית תקשורת, ולעיתים גם צוות תת״ח, שיתאימו לו את אוצר המילים, הגודל, הסידור והאמצעי — לוח, מחברת או מכשיר עם קול.' },
  { q: 'התמונות לקוחות ממאגר סמלים?', a: 'לא. כל התמונות הן אימוג׳י או ציורים פשוטים שציירנו במיוחד לעמוד, כך שאפשר להדפיס ולהשתמש בחופשיות בבית, בגן ובקליניקה. אם הילד כבר מכיר סמלים ממערכת אחרת, עדיף להמשיך עם הסמלים המוכרים לו.' },
  { q: 'זה חינם?', a: 'כן. הלוח המדבר, כל הלוחות והכרטיסים להדפסה חינמיים ובלי הרשמה. הלוח לא מקליט ולא שומר שום דבר.' },
]

const related = [
  { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
  { label: 'כרטיסי ויסות, רגשות וסדר יום להדפסה', href: SENSORY },
  { label: 'התפתחות שפה לפי גיל', href: '/speech/parents/language-milestones' },
  { label: 'מחולל כרטיסיות היגוי', href: '/speech/card-maker' },
  { label: 'סדר יום בגן — תבנית להדפסה', href: '/printables/teacher-templates/daily-routine' },
  { label: 'לוחות לבית — מטלות ושגרה', href: '/printables/home-charts' },
  { label: 'פעילויות לפעוטות', href: '/toddlers' },
]

const Guide = ({ title, id, children }) => <section aria-labelledby={id} className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
  <h2 id={id} className="mb-3 text-2xl font-bold">{title}</h2>
  <div className="space-y-2 leading-relaxed text-[var(--foreground)]/85">{children}</div>
</section>
const Li = ({ children }) => <li className="mr-5 list-disc">{children}</li>

const PRINT_TYPES = [
  ['core', '⭐ לוח ליבה A4'], ['a3', '🗺️ לוח ליבה A3 (2 דפים)'], ['topics', '🗂️ לוחות נושא'],
  ['cards', '✂️ כרטיסים בודדים'], ['firstthen', '➡️ קודם — אחר כך'], ['choice', '🤔 לוח בחירה'],
]
const POOL = [...ITEMS].sort((a, b) => CATEGORIES.findIndex(c => c.id === a.c) - CATEGORIES.findIndex(c => c.id === b.c))

function SymbolSelect({ label, value, onChange, gender, allowEmpty }) {
  return <label className="flex flex-col items-center gap-1 text-sm font-bold">
    {label}
    <select value={value} onChange={e => onChange(e.target.value)} className="min-h-[44px] w-44 rounded-xl border-2 border-[var(--border)] bg-white px-2 font-normal">
      {allowEmpty && <option value="">— ריק (מדביקים כרטיס) —</option>}
      {CATEGORIES.map(c => <optgroup key={c.id} label={c.label}>
        {POOL.filter(i => i.c === c.id).map(i => <option key={i.id} value={i.id}>{i.e.startsWith('svg:') ? '' : `${i.e} `}{wordOf(i, gender)}</option>)}
      </optgroup>)}
    </select>
  </label>
}

const Pill = ({ on, onClick, children }) => <button type="button" aria-pressed={on} onClick={onClick}
  className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white text-slate-600'}`}>{children}</button>

export default function AacBoards() {
  const [gender, setGender] = useState('b')
  const [types, setTypes] = useState(['core', 'topics', 'firstthen', 'choice'])
  const [topics, setTopics] = useState(TOPICS.map(t => t.id))
  const [cardsFrom, setCardsFrom] = useState('core')
  const [cardSize, setCardSize] = useState('small')
  const [color, setColor] = useState(true)
  const [first, setFirst] = useState('wash')
  const [then, setThen] = useState('eat')
  const [choiceN, setChoiceN] = useState(2)
  const [choices, setChoices] = useState(['bubbles', 'ball', 'book', 'puzzle'])
  const [printing, setPrinting] = useState(false)

  const pages = useMemo(() => {
    const opt = { gender, color, cardSize }
    const cardItems = cardsFrom === 'core' ? CORE_COLUMNS.flat().map(id => itemById[id]) : (t => [...t.core, ...t.items].map(id => itemById[id]))(topicById[cardsFrom])
    const cardTitle = cardsFrom === 'core' ? 'כרטיסי מילות ליבה' : `כרטיסים: ${topicById[cardsFrom].title}`
    const t = types.length ? types : ['core']
    return [
      ...(t.includes('core') ? [corePage(opt)] : []),
      ...(t.includes('a3') ? a3Pages(opt) : []),
      ...(t.includes('topics') ? TOPICS.filter(x => topics.includes(x.id)).map(x => topicPage(x, opt)) : []),
      ...(t.includes('cards') ? cardPages(cardItems, opt, cardTitle) : []),
      ...(t.includes('firstthen') ? [firstThenPage(opt, first, then)] : []),
      ...(t.includes('choice') ? [choicePage(opt, choices.slice(0, choiceN))] : []),
    ]
  }, [gender, color, cardSize, cardsFrom, types, topics, first, then, choices, choiceN])

  const toggle = (list, set, id, keepOne) => set(list.includes(id) ? (keepOne && list.length === 1 ? list : list.filter(x => x !== id)) : [...list, id])
  const previews = pages.filter((p, i) => pages.findIndex(q => q.key.split('-')[0] === p.key.split('-')[0]) === i)
  const coreCount = CORE_COLUMNS.flat().length

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO path={PATH}
        title="לוח תקשורת להדפסה — תקשורת תומכת וחליפית (תת״ח) עם מילות ליבה"
        description="לוחות תקשורת תומכת וחליפית (תת״ח) בעברית: לוח אוצר מילים ליבה, לוחות נושא (אוכל, משחק, רגשות, גן, בית, אמבטיה), לוח מדבר במסך ולוחות להדפסה — A4, A3, כרטיסים, קודם–אחר כך ולוח בחירה. חינם."
        structuredData={faqSchema(faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'לוחות תקשורת תת״ח' }]} />
      <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">💬 </span>לוחות תקשורת תומכת וחליפית (תת״ח) — להדפסה ולמסך</h1>
      <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">לוח מילות ליבה, לוחות נושא ולוח מדבר — בעברית, עם נוסח לילד, לילדה או כללי</p>

      <QuickAnswer q="איפה מוצאים לוח תקשורת תת״ח להדפסה בעברית?"
        a={`כאן: לוח אוצר מילים ליבה עם ${coreCount} מילים (אני, רוצה, עוד, לא, די, עזרה, לפתוח, איפה…) מסודר לפי חלקי דיבר וצבעים, שישה לוחות נושא, ולוח מדבר במסך שבונה משפט ומקריא אותו. להדפסה: לוח A4, לוח A3 בשני חלקים, כרטיסים בודדים, לוח "קודם–אחר כך" ולוח בחירה. את הבחירה וההתאמה לילד עושים יחד עם קלינאית התקשורת.`}
        rows={[['לוח ליבה', `${coreCount} מילים, 6 עמודות לפי חלקי דיבר`], ['לוחות נושא', TOPICS.map(t => t.title).join(', ')], ['במסך', 'לוח מדבר עם פס משפט והקראה'], ['להדפסה', 'A4, A3, כרטיסים, קודם–אחר כך, לוח בחירה · צבע או שחור־לבן'], ['מחיר', 'חינם, בלי הרשמה']]}
        updated={UPDATED} />

      <SpeechNote />

      <section aria-labelledby="aac-board" className="mb-10">
        <h2 id="aac-board" className="mb-1 text-center text-3xl font-bold">🔊 לוח מדבר — לוחצים ובונים משפט</h2>
        <p className="mb-4 text-center text-[var(--muted-foreground)]">כל מילה נשארת תמיד באותו מקום — גם במסך וגם בדף המודפס — כדי שהיד תלמד איפה היא.</p>
        <SpeakingBoard gender={gender} setGender={setGender} />
      </section>

      <section aria-labelledby="aac-colors" className="mb-10 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <h2 id="aac-colors" className="mb-2 text-2xl font-bold">קוד הצבעים בלוח</h2>
        <p className="mb-3 leading-relaxed text-[var(--foreground)]/85">הצבעים לפי מוסכמה נפוצה בלוחות תקשורת — "מפתח פיצג׳רלד המותאם" (modified Fitzgerald key). זו לא חובה ויש לה גרסאות שונות; אם הילד כבר רגיל לקוד אחר, ממשיכים איתו. בלוח הליבה העמודות מסודרות מימין לשמאל כמו משפט בעברית: מי ← עושה מה ← איך ← שאלה, מקום וזמן ← מילים חברתיות.</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {CATEGORIES.map(c => <li key={c.id} className="flex items-center gap-3 rounded-xl border-2 px-3 py-2" style={{ background: c.color[1], borderColor: c.color[0] }}>
            <span className="w-14 shrink-0 font-black" style={{ color: c.color[0] }}>{c.name}</span>
            <span><b>{c.label}</b> — {c.desc}</span>
          </li>)}
        </ul>
      </section>

      <section aria-labelledby="aac-print" className="mb-10 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
        <h2 id="aac-print" className="mb-2 text-center text-3xl font-bold">🖨️ לוחות וכרטיסים להדפסה</h2>
        <p className="mb-4 text-center text-[var(--muted-foreground)]">בוחרים מה להדפיס. הנוסח (ילד / ילדה / כללי) נלקח מהבחירה בלוח המדבר.</p>
        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="מה להדפיס">
            {PRINT_TYPES.map(([id, l]) => <Pill key={id} on={types.includes(id)} onClick={() => toggle(types, setTypes, id)}>{l}</Pill>)}
          </div>
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="נוסח">
            {GENDERS.map(([g, l]) => <Pill key={g} on={gender === g} onClick={() => setGender(g)}>{l}</Pill>)}
          </div>
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="צבע">
            <Pill on={color} onClick={() => setColor(true)}>🎨 צבעוני</Pill>
            <Pill on={!color} onClick={() => setColor(false)}>⚫ שחור־לבן</Pill>
          </div>
          {types.includes('topics') && <div className="rounded-xl bg-slate-50 p-3">
            <p className="mb-2 text-center font-bold">לוחות נושא</p>
            <div className="flex flex-wrap justify-center gap-2">{TOPICS.map(t => <Pill key={t.id} on={topics.includes(t.id)} onClick={() => toggle(topics, setTopics, t.id, true)}><span aria-hidden="true">{t.emoji} </span>{t.title}</Pill>)}</div>
          </div>}
          {types.includes('cards') && <div className="rounded-xl bg-slate-50 p-3">
            <p className="mb-2 text-center font-bold">כרטיסים בודדים — מאיזה לוח?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[['core', '⭐ מילות ליבה'], ...TOPICS.map(t => [t.id, `${t.emoji} ${t.title}`])].map(([id, l]) => <Pill key={id} on={cardsFrom === id} onClick={() => setCardsFrom(id)}>{l}</Pill>)}
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Pill on={cardSize === 'small'} onClick={() => setCardSize('small')}>קטנים · 20 בדף</Pill>
              <Pill on={cardSize === 'large'} onClick={() => setCardSize('large')}>גדולים · 12 בדף</Pill>
            </div>
          </div>}
          {types.includes('firstthen') && <div className="rounded-xl bg-slate-50 p-3">
            <p className="mb-2 text-center font-bold">לוח קודם — אחר כך</p>
            <div className="flex flex-wrap justify-center gap-4">
              <SymbolSelect label="קודם" value={first} onChange={setFirst} gender={gender} allowEmpty />
              <SymbolSelect label="אחר כך" value={then} onChange={setThen} gender={gender} allowEmpty />
            </div>
          </div>}
          {types.includes('choice') && <div className="rounded-xl bg-slate-50 p-3">
            <p className="mb-2 text-center font-bold">לוח בחירה</p>
            <div className="mb-2 flex flex-wrap justify-center gap-2">
              <Pill on={choiceN === 2} onClick={() => setChoiceN(2)}>2 אפשרויות</Pill>
              <Pill on={choiceN === 4} onClick={() => setChoiceN(4)}>4 אפשרויות</Pill>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {choices.slice(0, choiceN).map((id, i) => <SymbolSelect key={i} label={`אפשרות ${i + 1}`} value={id} gender={gender}
                onChange={v => setChoices(list => list.map((x, k) => k === i ? v : x))} />)}
            </div>
          </div>}
        </div>

        {pages.length > 0 && <>
          <div className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3" aria-label="תצוגה מקדימה">
            {previews.map(p => <div key={p.key} className="border border-[var(--border)] bg-white p-1.5 shadow-sm">{p.svg}</div>)}
          </div>
          <div className="mt-5 text-center">
            <button type="button" data-print-main onClick={() => setPrinting(true)} className="min-h-[52px] rounded-xl bg-red-500 px-8 py-3 text-lg font-bold text-white">🖨️ הדפסה או PDF · {pages.length} {pages.length === 1 ? 'דף' : 'דפים'}</button>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">A4. כדאי לצפות בלמינציה או להכניס לשמרדף, ולהשאיר את הלוח תמיד בהישג יד.</p>
          </div>
        </>}
        <p className="mt-5 rounded-xl bg-[var(--postit)] p-3 text-center leading-relaxed">
          <span aria-hidden="true">🧩 </span>מחפשים כרטיסי ויסות והרגעה, לוח "אני צריך / אני מרגיש", סדר יום עם רצועה או כרטיסי בקשת עזרה? הם בעמוד <Link to={SENSORY} className="font-bold underline">כרטיסיות ויסות, תקשורת וסדר יום</Link> — משלימים את הלוחות כאן.
        </p>
      </section>
      {printing && <PrintPreview title="לוחות תקשורת תת״ח" onClose={() => setPrinting(false)}>{sheetsOf(pages)}</PrintPreview>}

      <div className="mx-auto max-w-3xl space-y-5">
        <Guide id="aac-what" title="מה זה תקשורת תומכת וחליפית (תת״ח)?">
          <p>תת״ח היא כל דרך לתקשר שמוסיפה על הדיבור ("תומכת") או באה במקומו ("חליפית"): הבעות פנים וסימנים בידיים, הצבעה על תמונות בלוח תקשורת, כרטיסים, מחברת תקשורת, ומכשירים או אפליקציות שמשמיעים קול. רוב האנשים שמשתמשים בתת״ח משלבים כמה דרכים.</p>
          <p>תת״ח מתאימה לילדים שעוד לא מדברים, לילדים שהדיבור שלהם לא מובן לסביבה, ולילדים שמדברים אבל מתקשים להוציא מילים ברגעים של לחץ או התרגשות — למשל ילדים עם אוטיזם, עם תסמונות גנטיות, עם שיתוק מוחין, עם אפרקסיה של הדיבור, או ילדים שהדיבור שלהם מתעכב. לוח פשוט מנייר הוא דרך טובה להתחיל: הוא זול, לא נגמרת לו הסוללה, ואפשר לקחת אותו לכל מקום.</p>
        </Guide>

        <Guide id="aac-myths" title="מיתוסים ועובדות על תת״ח">
          <ul className="space-y-2">
            <Li><b>"אם ניתן לו לוח, הוא יפסיק לנסות לדבר."</b> לא כך. לפי ASHA ולפי סקירות מחקר (למשל Millar, Light ו-Schlosser, 2006), תת״ח לא פוגעת בהתפתחות הדיבור, ובחלק מהמחקרים הדיבור אף גדל. כשילד מצליח להעביר מסר, יש לו פחות תסכול ויותר סיבות לתקשר.</Li>
            <Li><b>"צריך לחכות עד שיהיה מוכן."</b> אין רשימת תנאים מוקדמים. גם פעוטות וגם ילדים שעוד לא מצביעים בדיוק יכולים להתחיל — הלוח וההדגמה הם חלק מהלמידה, לא פרס בסופה.</Li>
            <Li><b>"זה רק בשביל ילדים שלא ידברו אף פעם."</b> תת״ח משמשת גם כגשר זמני, וגם כגיבוי לילדים שמדברים חלקית. ממשיכים לעבוד על הדיבור במקביל.</Li>
            <Li><b>"מספיקות לו תמונות של אוכל וצעצועים."</b> עם שמות של דברים אפשר בעיקר לבקש. מילות ליבה — לא, עוד, די, איפה, לפתוח, אני — מאפשרות גם לסרב, לשאול, להגיב ולספר.</Li>
          </ul>
        </Guide>

        <Guide id="aac-model" title="איך מדגימים על הלוח (aided language stimulation)">
          <p>ילדים לומדים לדבר אחרי שנים שבהן שמעו אנשים מדברים סביבם. ילד שמתקשר בלוח צריך לראות אנשים "מדברים" בלוח שלו — זו ההדגמה, שנקראת גם aided language stimulation או modeling.</p>
          <ul className="space-y-1.5">
            <Li><b>מדברים ונוגעים יחד:</b> אומרים משפט רגיל ונוגעים בלוח במילות המפתח שבו: "<b>רוצה עוד</b> מים?", "<b>איפה</b> הכדור? <b>שם</b>!".</Li>
            <Li><b>מדגימים קצת יותר ממה שהילד עושה:</b> אם הוא מצביע על מילה אחת, מדגימים שתיים ("עוד ← <b>רוצה עוד</b>").</Li>
            <Li><b>לא בוחנים:</b> לא מבקשים "תראה לי איפה עוגייה" ולא מחכים שיצביע לפני שמקבל. מדגימים, מחכים בסבלנות, ומגיבים לכל ניסיון.</Li>
            <Li><b>מכבדים כל מסר:</b> גם "לא" ו"די" הם תקשורת אמיתית. כשהלוח באמת עובד, הילד רוצה להשתמש בו.</Li>
            <Li><b>הלוח תמיד בהישג יד:</b> בארוחה, במשחק, בחצר ובאמבטיה (בשמרדף). לוח שנמצא במגירה לא מלמד כלום.</Li>
            <Li>מתחילים עם כמה מילים שימושיות בפעילות אהובה, ומוסיפים בהדרגה. לא צריך ללמד את כל הלוח בבת אחת.</Li>
          </ul>
        </Guide>

        <Guide id="aac-slp" title="תמיד יחד עם קלינאית התקשורת">
          <p>הלוחות כאן הם נקודת התחלה כללית. ההחלטה איזה אמצעי תת״ח מתאים לילד, כמה תמונות יהיו בלוח, באיזה גודל ובאיזה סידור — היא חלק מהערכה של קלינאית תקשורת, ולפעמים גם של מרפאה בעיסוק או של צוות תת״ח. כדאי להראות לקלינאית את הלוח לפני שמתחילים, לשאול אילו מילים להוסיף או להוריד, ולהשתמש באותו לוח בבית ובגן.</p>
          <p>אם הילד כבר משתמש בלוח, במחברת או במכשיר עם סמלים אחרים — עדיף להמשיך עם המערכת המוכרת לו, ולהשתמש בדפים כאן רק בתיאום.</p>
        </Guide>

        <Guide id="aac-howto" title="איך משתמשים בעמוד">
          <ul className="space-y-1.5">
            <Li><b>לוח מדבר:</b> בוחרים לוח (ליבה או נושא), לוחצים על תמונות, והמשפט נבנה בפס העליון. "הקראה" משמיעה את כל המשפט בקול של המכשיר. במסך מלא הלוח נוח לטאבלט.</Li>
            <Li><b>להדפסה:</b> לוח ליבה על דף אחד, או בגודל A3 בשני חלקים; לוחות נושא לכל פעילות; כרטיסים בודדים לגזירה; לוח "קודם–אחר כך" עם שתי התמונות שבחרתם; ולוח בחירה בין 2 או 4 אפשרויות עם פס "אני רוצה".</Li>
            <Li><b>שחור־לבן:</b> התמונות מודפסות באפור, ואפשר לצבוע את המסגרות לפי קוד הצבעים.</Li>
            <Li>את כרטיסי הוויסות, הרגשות וסדר היום תמצאו ב<Link to={SENSORY} className="font-bold underline">עמוד כרטיסיות הוויסות והתקשורת</Link>.</Li>
          </ul>
        </Guide>

        <section aria-labelledby="aac-sources" className="rounded-2xl border border-[var(--border)] bg-white p-5 text-sm shadow-sm">
          <h2 id="aac-sources" className="mb-2 text-xl font-bold">מקורות</h2>
          <ul className="space-y-1">
            {SOURCES.map(s => <li key={s.title} className="mr-5 list-disc">{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.title}</a> : s.title}</li>)}
          </ul>
        </section>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <SeoBody paragraphs={[
          'לוח תקשורת להדפסה הוא אחד הכלים הפשוטים והשימושיים ביותר בתקשורת תומכת חליפית. בעמוד הזה יש לוח אוצר מילים ליבה בעברית — המילים הקטנות שחוזרות בכל שיחה, כמו אני, רוצה, עוד, לא, די, עזרה, לפתוח, איפה ועכשיו — מסודר לפי חלקי דיבר ובקוד צבעים מקובל, ולצידו שישה לוחות נושא לפעילויות של היום־יום.',
          'כל התמונות מקוריות — אימוג׳י וציורים פשוטים שציירנו — ולכן אפשר להדפיס בחופשיות לבית, לגן, לכיתה ולקליניקה. בעברית יש מילים שמשתנות לפי מין הדובר, ולכן אפשר לבחור לוח לילד, לילדה או לוח כללי לכל הקבוצה.',
          'הלוח המדבר מאפשר לנסות את אותו לוח במסך: לוחצים על תמונות, בונים משפט ושומעים אותו. הוא לא מקליט ולא שומר מידע. תת״ח מותאמת אישית — לוח, מחברת או מכשיר — נבחרת תמיד יחד עם קלינאית תקשורת.',
        ]} faq={faq} related={related} />
      </div>
    </div>
  )
}
