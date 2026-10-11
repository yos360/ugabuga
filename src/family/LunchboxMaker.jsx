import { useEffect, useMemo, useState } from 'react'
import PrintPreview from '../components/ui/PrintPreview'
import { shareOnWhatsApp, SITE } from '../utils/share'
import { COUNTS, MAX_NAME, MAX_NOTE, SHEET_W, SHEET_H, sheetCells, fitText, fillNotes, cleanDraft, encodeDraft, decodeDraft } from './lunchboxNotes'

// Custom lunchbox-note maker (lives on /printables/lunchbox-notes). Everything the parent types
// stays in the browser: a draft in localStorage, and an optional #d=… hash link for WhatsApp.
const DRAFT_KEY = 'buga-lunchbox-draft'
const DEFAULTS = { name: '', sign: '', texts: Array(12).fill(''), count: 12, fill: true, source: 'mix', mixOrder: false, palette: 'rainbow', frame: 'dashed', emoji: 'mix', size: 'm', seed: 1 }

const PALETTES = {
  rainbow: { label: '🌈 צבעוני', fills: ['#ffe8ee', '#fff6cf', '#e3f1ff', '#e6f8e4'], ink: '#1d2233', accent: ['#ff8fab', '#ffd23f', '#6cb8ff', '#7dd87a'] },
  pink: { label: '🌸 ורוד', fills: ['#ffe4ef', '#ffeef5', '#fbe3ff'], ink: '#5a1d3c', accent: ['#ff6fa5', '#d36cff', '#ff9ec4'] },
  ocean: { label: '🌊 כחול', fills: ['#e1f2ff', '#e6fbff', '#e8ecff'], ink: '#0f2f55', accent: ['#3b8bea', '#21b3c9', '#6f7cf0'] },
  sunny: { label: '🌞 שמש', fills: ['#fff3c4', '#ffe6cc', '#fff9e0'], ink: '#4a3000', accent: ['#ffb000', '#ff7a3d', '#ffd23f'] },
  ink: { label: '🖍️ לבן לצביעה', fills: ['#ffffff'], ink: '#111111', accent: ['#888888'] },
}
const FRAMES = { dashed: '✂️ קו גזירה', double: '🖼️ מסגרת כפולה', dots: '⚪ נקודות', round: '⬭ עגול' }
const EMOJIS = ['mix', '💛', '⭐', '🌈', '🦄', '🦖', '⚽', '🌸', '🚀', '🐱', '🍎', 'none']
const MIX_EMOJI = ['💛', '⭐', '🌈', '🦄', '🦖', '⚽', '🌸', '🚀', '🐱', '🍎', '😊', '🎈']
const SIZES = { s: ['קטן', 0.8], m: ['בינוני', 1], l: ['גדול', 1.2] }
const SOURCES = { mix: '🎲 הכול מעורבב', love: '💛 מילים חמות', jokes: '😂 בדיחות', goals: '⭐ משימה ליום' }

function readDraft() {
  if (typeof window === 'undefined') return DEFAULTS
  const m = /[#&]d=([\w-]+)/.exec(window.location.hash || '')
  if (m) { const d = decodeDraft(m[1]); if (d) return cleanDraft(d, DEFAULTS) }
  try { const s = localStorage.getItem(DRAFT_KEY); if (s) return cleanDraft(JSON.parse(s), DEFAULTS) } catch { /* private mode / bad JSON */ }
  return DEFAULTS
}

function Chip({ on, onClick, children, label }) {
  return <button type="button" className="fam-chip" aria-pressed={on} onClick={onClick} aria-label={label}>{children}</button>
}

function NotesSheet({ d }) {
  const notes = useMemo(() => fillNotes(d.texts, d), [d])
  // Visible cut guides through the gaps between notes, with scissors at the top edge.
  const guides = useMemo(() => {
    const { cells: cs, cols, rows } = sheetCells(d.count)
    const xs = Array.from({ length: cols - 1 }, (_, i) => (cs[i].x + cs[i + 1].x + cs[i + 1].w) / 2)
    const ys = Array.from({ length: rows - 1 }, (_, i) => (cs[i * cols].y + cs[i * cols].h + cs[(i + 1) * cols].y) / 2)
    return { xs, ys }
  }, [d.count])
  const { cells, cw, ch } = sheetCells(d.count)
  const pal = PALETTES[d.palette] || PALETTES.rainbow
  const scale = Math.min(cw, ch) / 62 * SIZES[d.size][1]
  const body = 7 * scale
  const r = d.frame === 'round' ? Math.min(cw, ch) * 0.18 : 5
  return <svg viewBox={`0 0 ${SHEET_W} ${SHEET_H}`} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`דף ${d.count} פתקים לקופסת האוכל${d.name ? ` ל${d.name}` : ''}`} fontFamily="Heebo, Arial, sans-serif">
    <rect width={SHEET_W} height={SHEET_H} fill="#fff" />
    <g stroke="#c3c6cf" strokeWidth={0.3} strokeDasharray="1.5 1.5">
      {guides.xs.map(x => <line key={`x${x}`} x1={x} x2={x} y1={0} y2={SHEET_H} />)}
      {guides.ys.map(y => <line key={`y${y}`} x1={0} x2={SHEET_W} y1={y} y2={y} />)}
    </g>
    {guides.xs.map(x => <text key={`s${x}`} x={x} y={3.2} fontSize={3.6} textAnchor="middle" fill="#888">✂</text>)}
    {cells.map((c, i) => {
      const note = notes[i] || { text: '' }
      const fill = pal.fills[i % pal.fills.length], accent = pal.accent[i % pal.accent.length]
      const emoji = d.emoji === 'none' ? '' : d.emoji === 'mix' ? MIX_EMOJI[(i + d.seed) % MIX_EMOJI.length] : d.emoji
      const pad = cw * 0.08
      const top = c.y + (d.name ? ch * 0.24 : ch * 0.14), bottom = c.y + ch - (d.sign ? ch * 0.2 : ch * 0.12)
      const fit = note.text ? fitText(note.text, cw - pad * 2, bottom - top, body) : null
      const cx = c.x + cw / 2
      return <g key={i}>
        <rect x={c.x} y={c.y} width={cw} height={ch} rx={r} fill={fill} stroke={d.frame === 'dots' ? accent : '#8a8f9c'} strokeWidth={d.frame === 'dots' ? 1.4 : 0.5} strokeDasharray={d.frame === 'dots' ? '0.1 2.6' : d.frame === 'dashed' ? '2.2 1.6' : undefined} strokeLinecap="round" />
        {d.frame === 'double' && <rect x={c.x + 2.2} y={c.y + 2.2} width={cw - 4.4} height={ch - 4.4} rx={Math.max(1, r - 2)} fill="none" stroke={accent} strokeWidth={0.9} />}
        {emoji && <text x={c.x + 4.5 * scale} y={c.y + 9 * scale} fontSize={7 * scale} textAnchor="middle">{emoji}</text>}
        {d.name && <text x={cx} y={c.y + ch * 0.15} fontSize={Math.min(6.2 * scale, body)} fontWeight={800} textAnchor="middle" direction="rtl" fill={pal.ink} opacity={0.8}>{d.name},</text>}
        {fit && fit.lines.map((l, j) => <text key={j} x={cx} y={(top + bottom) / 2 - ((fit.lines.length - 1) * fit.size * 1.25) / 2 + j * fit.size * 1.25 + fit.size * 0.35} fontSize={fit.size} fontWeight={700} textAnchor="middle" direction="rtl" fill={pal.ink}>{l}</text>)}
        {!note.text && [0, 1, 2].map(j => <line key={j} x1={c.x + pad} x2={c.x + cw - pad} y1={top + (bottom - top) * (0.3 + j * 0.28)} y2={top + (bottom - top) * (0.3 + j * 0.28)} stroke="#b9bdc8" strokeWidth={0.35} />)}
        {d.sign ? <text x={cx} y={c.y + ch - ch * 0.08} fontSize={Math.min(5.2 * scale, body)} fontWeight={700} textAnchor="middle" direction="rtl" fill={pal.ink} opacity={0.75}>{`${d.sign} ♥`}</text>
          : <circle cx={cx} cy={c.y + ch - ch * 0.07} r={1.6 * scale} fill={accent} />}
      </g>
    })}
  </svg>
}

export default function LunchboxMaker() {
  const [d, setD] = useState(readDraft)
  const [printing, setPrinting] = useState(false)
  const [copied, setCopied] = useState('')
  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)) } catch { /* storage blocked */ } }, [d])
  // A shared #d= link was loaded into the draft — drop it from the address bar so later edits win on reload.
  useEffect(() => { if (/[#&]d=/.test(window.location.hash)) { try { history.replaceState(history.state, '', window.location.pathname + window.location.search) } catch { /* ignore */ } } }, [])
  const set = (k, v) => setD(x => ({ ...x, [k]: v }))
  const setText = (i, v) => setD(x => { const texts = [...x.texts]; texts[i] = v.slice(0, MAX_NOTE); return { ...x, texts } })
  const reshuffle = () => setD(x => ({ ...x, seed: (x.seed % 9973) + 1 + Math.floor(Math.random() * 500) }))
  const randomSheet = () => setD(x => ({ ...x, texts: Array(12).fill(''), fill: true, seed: (x.seed % 9973) + 1 + Math.floor(Math.random() * 500) }))
  const clear = () => setD(x => ({ ...x, texts: Array(12).fill('') }))
  const ownCount = d.texts.slice(0, d.count).filter(t => t.trim()).length
  const shareUrl = () => `${SITE}/printables/lunchbox-notes?utm_source=whatsapp&utm_medium=share&utm_campaign=lunchbox-custom#d=${encodeDraft(d)}`
  const sendDesign = () => shareOnWhatsApp(`💌 הכנתי פתקים לקופסת האוכל${d.name ? ` של ${d.name}` : ''} — אפשר לפתוח, לשנות ולהדפיס:\n${shareUrl()}`)
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareUrl()); setCopied('הקישור הועתק ✓') } catch { setCopied('לא הצלחנו להעתיק — נסו את כפתור הוואטסאפ') } }
  const sheet = <NotesSheet d={d} />

  return <section className="fam-card lbm mt-10" aria-labelledby="lbm-title">
    <h2 id="lbm-title" className="text-2xl sm:text-3xl font-black text-center"><span aria-hidden="true">✏️ </span>פתקים בעיצוב אישי</h2>
    <p className="text-center text-[var(--muted-foreground)] mb-4">כותבים את המילים שלכם, בוחרים צבעים ומסגרת — ואפשר להשלים את השאר בפתקים מוכנים. מה שכותבים נשאר רק בדפדפן שלכם.</p>

    <div className="lbm-grid">
      <div className="lbm-controls">
        <div className="lbm-row">
          <label className="lbm-field"><span>שם הילד/ה (לא חובה)</span><input className="fam-input" value={d.name} maxLength={MAX_NAME} onChange={e => set('name', e.target.value)} placeholder="למשל: נועה" /></label>
          <label className="lbm-field"><span>חתימה (לא חובה)</span><input className="fam-input" value={d.sign} maxLength={MAX_NAME} onChange={e => set('sign', e.target.value)} placeholder="למשל: אמא ואבא" /></label>
        </div>

        <fieldset className="lbm-set"><legend>כמה פתקים בדף?</legend>
          <div className="lbm-chips">{COUNTS.map(n => <Chip key={n} on={d.count === n} onClick={() => set('count', n)}>{n}</Chip>)}</div></fieldset>

        <fieldset className="lbm-set"><legend>הפתקים שלכם <small>({ownCount}/{d.count} כתובים)</small></legend>
          <div className="lbm-notes">{Array.from({ length: d.count }, (_, i) => <label key={i} className="lbm-field"><span>פתק {i + 1}</span>
            <input className="fam-input" value={d.texts[i] || ''} maxLength={MAX_NOTE} onChange={e => setText(i, e.target.value)} placeholder={d.fill ? 'ריק = פתק מוכן' : 'ריק = שורות לכתיבה ביד'} /></label>)}</div>
          <div className="lbm-chips mt-2">
            <button type="button" className="fam-roll small" onClick={randomSheet}>🎲 דף מוכן מעורבב</button>
            <button type="button" className="fam-chip" onClick={reshuffle} disabled={!d.fill && !d.mixOrder}>🔀 ערבוב מחדש</button>
            {ownCount > 0 && <button type="button" className="fam-chip" onClick={clear}>🧹 ניקוי הטקסטים</button>}
          </div>
        </fieldset>

        <fieldset className="lbm-set"><legend>מה עם פתקים ריקים?</legend>
          <label className="lbm-check"><input type="checkbox" checked={d.fill} onChange={e => set('fill', e.target.checked)} /> להשלים בפתקים מוכנים</label>
          {d.fill && <div className="lbm-chips" role="group" aria-label="מאיפה הפתקים המוכנים">{Object.entries(SOURCES).map(([k, l]) => <Chip key={k} on={d.source === k} onClick={() => set('source', k)}>{l}</Chip>)}</div>}
          <label className="lbm-check"><input type="checkbox" checked={d.mixOrder} onChange={e => set('mixOrder', e.target.checked)} /> לערבב את הסדר (הפתקים שלי בין המוכנים)</label>
        </fieldset>

        <fieldset className="lbm-set"><legend>צבעים</legend>
          <div className="lbm-chips">{Object.entries(PALETTES).map(([k, p]) => <Chip key={k} on={d.palette === k} onClick={() => set('palette', k)}>{p.label}</Chip>)}</div></fieldset>
        <fieldset className="lbm-set"><legend>מסגרת</legend>
          <div className="lbm-chips">{Object.entries(FRAMES).map(([k, l]) => <Chip key={k} on={d.frame === k} onClick={() => set('frame', k)}>{l}</Chip>)}</div></fieldset>
        <fieldset className="lbm-set"><legend>אימוג׳י בפינה</legend>
          <div className="lbm-chips">{EMOJIS.map(e => <Chip key={e} on={d.emoji === e} onClick={() => set('emoji', e)} label={e === 'mix' ? 'אימוג׳י מעורבבים' : e === 'none' ? 'בלי אימוג׳י' : undefined}>{e === 'mix' ? '🎲 מעורב' : e === 'none' ? 'בלי' : e}</Chip>)}</div></fieldset>
        <fieldset className="lbm-set"><legend>גודל הכתב</legend>
          <div className="lbm-chips">{Object.entries(SIZES).map(([k, [l]]) => <Chip key={k} on={d.size === k} onClick={() => set('size', k)}>{l}</Chip>)}</div>
          <small className="text-[var(--muted-foreground)]">פתק ארוך מוקטן אוטומטית כדי שייכנס.</small></fieldset>
      </div>

      <div className="lbm-preview">
        <div className="border-2 border-[var(--border)] bg-white p-2" aria-live="polite">{sheet}</div>
        <div className="lbm-chips mt-3 justify-center">
          <button type="button" className="fam-roll" onClick={() => setPrinting(true)}>🖨️ הדפסה או PDF</button>
        </div>
        <div className="lbm-chips mt-2 justify-center">
          <button type="button" className="fam-chip" onClick={sendDesign}>💬 לשלוח את העיצוב בוואטסאפ</button>
          <button type="button" className="fam-chip" onClick={copyLink}>🔗 העתקת קישור</button>
        </div>
        {copied && <p role="status" className="text-center text-sm mt-1">{copied}</p>}
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-2">הקישור כולל את הטקסטים שכתבתם — שלחו אותו רק למי שאתם רוצים.</p>
      </div>
    </div>
    {printing && <PrintPreview title={`פתקים לקופסת האוכל${d.name ? ` — ${d.name}` : ''}`} onClose={() => setPrinting(false)}><article className="buga-a4"><div className="print-art">{sheet}</div></article></PrintPreview>}
  </section>
}
