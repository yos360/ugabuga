import { SUITS, isRed, rankLabel } from '../logic/cards'

// One playing card. Face-down cards show the back pattern.
export function Card({ card, w, x, y, z, dragged, hint, selected, dropKey, onPointer }) {
  const interactive = !!(onPointer?.onPointerDown || onPointer?.onClick)
  const Tag = interactive ? 'button' : 'div'
  const h = w * 1.4
  const style = { width: w, height: h, transform: `translate(${x}px, ${y}px)`, zIndex: z, fontSize: w * 0.26 }
  if (dragged) { style.transform = `translate(${x + dragged.dx}px, ${y + dragged.dy}px)`; style.zIndex = 500 + z }
  const cls = `cd${w < 60 ? ' is-sm' : ''}${card.up ? (isRed(card) ? ' is-red' : '') : ' is-back'}${dragged ? ' is-drag' : ''}${hint ? ' is-hint' : ''}${selected ? ' is-sel' : ''}`
  return (
    <Tag type={interactive ? 'button' : undefined} className={cls} style={style} data-drop={dropKey} {...onPointer}
      aria-label={card.up ? `${rankLabel(card.rank)}${SUITS[card.suit]}` : 'קלף הפוך'} role={interactive ? undefined : 'img'}>
      {!card.up && <span className="sp-back-mark" aria-hidden="true">BUGA</span>}
      {card.up && <>
        <span className="cd-corner">{rankLabel(card.rank)}<br />{SUITS[card.suit]}</span>
        <span className="cd-center">{card.rank > 10 ? rankLabel(card.rank) : SUITS[card.suit]}</span>
        <span className="cd-corner cd-br" aria-hidden="true">{rankLabel(card.rank)}<br />{SUITS[card.suit]}</span>
      </>}
    </Tag>
  )
}

// An empty spot (pile base / foundation / stock).
export function Slot({ w, x, y, label, dropKey, onClick, active }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag type={onClick ? 'button' : undefined} className={`cd-slot${active ? ' is-active' : ''}`} style={{ width: w, height: w * 1.4, transform: `translate(${x}px, ${y}px)`, fontSize: w * 0.34 }}
      data-drop={dropKey} onClick={onClick} aria-label={onClick ? 'מחזור החפיסה' : undefined}>{label}</Tag>
  )
}
