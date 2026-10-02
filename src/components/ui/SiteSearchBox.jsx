import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import { useGames } from '../../hooks/useGames'
import { KINDS, gameItem, suggest } from '../../data/searchIndex'

// The full static catalog pulls in many content-data modules — load it only
// once the visitor touches the search box, and share one promise per app.
let staticItemsCache = null
const loadStaticItems = () => (staticItemsCache ||= import('../../data/searchStatic').then(m => m.STATIC_ITEMS).catch(() => { staticItemsCache = null; return [] }))

// Search input with live autocomplete: word completions taken from what exists on the site,
// plus direct links to the best matching games, tools, printables and pages.
// onSearch(text) runs a full search; picking a direct hit navigates straight to it.
export default function SiteSearchBox({ value, onChange, onSearch, className = '', placeholder, autoFocus, buttonFirst = false, iconSize = 24 }) {
  const navigate = useNavigate()
  // The games list (~290 KB json) is only fetched once the visitor actually
  // interacts with the search box — never on plain page load.
  const [wanted, setWanted] = useState(Boolean(autoFocus || value))
  const want = () => setWanted(true)
  const { games, loading } = useGames({ enabled: wanted })
  const [staticItems, setStaticItems] = useState([])
  useEffect(() => {
    if (!wanted) return
    let alive = true
    loadStaticItems().then(list => { if (alive) setStaticItems(list) })
    return () => { alive = false }
  }, [wanted])
  const items = useMemo(() => [...staticItems, ...games.map(gameItem)], [staticItems, games])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const wrap = useRef(null)
  const listId = useId()

  const { words, hits } = useMemo(() => suggest(items, value), [items, value])
  const options = [...words.map(w => ({ type: 'word', text: w })), ...hits.map(h => ({ type: 'hit', item: h }))]
  useEffect(() => setActive(-1), [value])
  useEffect(() => {
    const close = e => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  const pick = o => {
    setOpen(false)
    if (o.type === 'hit') navigate(o.item.to)
    else { onChange(o.text); onSearch(o.text) }
  }
  const submit = e => { e.preventDefault(); setOpen(false); onSearch(value.trim()) }
  const onKeyDown = e => {
    if (!open || !options.length) { if (e.key === 'ArrowDown') setOpen(true); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => (i + 1) % options.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => (i <= 0 ? options.length : i) - 1) }
    else if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); pick(options[active]) }
  }
  const stillLoading = wanted && (loading || staticItems.length === 0) && value.trim().length > 0
  const show = open && (options.length > 0 || stillLoading)

  const button = <button type="submit" aria-label="חיפוש"><SearchIcon size={iconSize} /></button>
  return (
    <div className="ssb-wrap" ref={wrap}>
      <form role="search" onSubmit={submit} className={className}>
        {buttonFirst && button}
        <input type="search" value={value} placeholder={placeholder} aria-label="חיפוש בכל האתר" autoFocus={autoFocus} autoComplete="off"
          role="combobox" aria-expanded={show} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={show && active >= 0 ? `${listId}-${active}` : undefined}
          onChange={e => { want(); onChange(e.target.value); setOpen(true) }} onFocus={() => { want(); setOpen(true) }} onKeyDown={onKeyDown} />
        {!buttonFirst && button}
      </form>
      {show && (
        <ul className="ssb-list" id={listId} role="listbox" dir="rtl">
          {options.length === 0 && stillLoading && <li className="ssb-opt" aria-disabled="true">טוען...</li>}
          {options.map((o, i) => (
            <li key={o.type + (o.text || o.item.to)} id={`${listId}-${i}`} role="option" aria-selected={i === active}
              className={`ssb-opt ssb-${o.type}${i === active ? ' is-active' : ''}${o.type === 'hit' && i === words.length ? ' ssb-first-hit' : ''}`}
              onPointerDown={e => e.preventDefault()} onClick={() => pick(o)} onMouseEnter={() => setActive(i)}>
              {o.type === 'word'
                ? <><SearchIcon size={16} aria-hidden="true" /><span>{o.text}</span></>
                : <><span className="ssb-emoji" aria-hidden="true">{o.item.emoji}</span><span className="ssb-title">{o.item.title}</span><small>{KINDS[o.item.kind]?.label}</small></>}
            </li>
          ))}
        </ul>
      )}
      <style>{`.ssb-wrap{position:relative}.ssb-list{position:absolute;z-index:60;top:calc(100% + 6px);right:0;left:0;margin:0 auto;max-width:794px;list-style:none;padding:6px;background:#fff;border:2px solid #1d2233;border-radius:16px;box-shadow:0 12px 30px #1d223326;max-height:min(420px,60vh);overflow:auto;text-align:right}
.ssb-opt{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;cursor:pointer;font-size:17px}.ssb-opt.is-active{background:#fff3c4}.ssb-word{color:#1d2233;font-weight:600}.ssb-word svg{color:#8a8da3;flex:none}
.ssb-first-hit{border-top:1px solid #e3e5ee;margin-top:4px;padding-top:11px}.ssb-emoji{font-size:20px;flex:none}.ssb-title{flex:1;min-width:0;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ssb-opt small{flex:none;color:#6b7280;font-size:13px}`}</style>
    </div>
  )
}
