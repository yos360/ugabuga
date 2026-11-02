// Emoji panel with Hebrew search, categories and recently used — used by /tools/emoji and /tools/keyboard.
import { useMemo, useState } from 'react'
import { EMOJI_CATS, searchEmoji, readRecent, pushRecent } from './emojiData'

export default function EmojiPicker({ onPick }) {
  const [recent, setRecent] = useState(readRecent)
  const [cat, setCat] = useState(() => (readRecent().length ? 'recent' : EMOJI_CATS[0].id))
  const [q, setQ] = useState('')
  const found = useMemo(() => searchEmoji(q), [q])
  const items = q.trim() ? found
    : cat === 'recent' ? recent.map(e => ({ e, name: 'אחרונים' }))
      : EMOJI_CATS.find(c => c.id === cat).items
  const pick = e => { setRecent(pushRecent(e)); onPick(e) }

  return <div className="emj">
    <label className="sr-only" htmlFor="emj-q">חיפוש אימוג׳י</label>
    <input id="emj-q" className="emj-search" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="🔎 חיפוש בעברית: לב, חתול, יום הולדת, מזל טוב…" autoComplete="off" />
    <div className="emj-tabs" role="tablist" aria-label="קטגוריות">
      {recent.length > 0 && <button type="button" role="tab" aria-selected={!q && cat === 'recent'} onClick={() => { setCat('recent'); setQ('') }} title="אחרונים">🕘<span>אחרונים</span></button>}
      {EMOJI_CATS.map(c => <button key={c.id} type="button" role="tab" aria-selected={!q && cat === c.id} onClick={() => { setCat(c.id); setQ('') }} title={c.label}>{c.icon}<span>{c.label}</span></button>)}
    </div>
    {q.trim() && !found.length && <p className="emj-empty">לא מצאנו. נסו מילה אחרת, למשל „שמח” או „אוכל”.</p>}
    <div className="emj-grid" role="tabpanel">
      {items.map(it => <button key={it.e} type="button" className="emj-btn" title={it.name} aria-label={it.name} onMouseDown={e => e.preventDefault()} onClick={() => pick(it.e)}>{it.e}</button>)}
    </div>
  </div>
}
