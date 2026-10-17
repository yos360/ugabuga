import { SUITS, isRed, rankLabel } from '../../logic/cards'
import CourtArt from './CourtArt'
export function Slot({ w, x, y, label, dropKey, onClick, active }) {
  return <div className={`cd-slot${active ? ' is-active' : ''}`} style={{ width: w, height: w * 1.4, transform: `translate(${x}px, ${y}px)`, fontSize: w * .34 }}
    data-drop={dropKey} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
    aria-label={onClick ? 'מחזור החפיסה' : undefined}
    onKeyDown={onClick ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}>{label}</div>
}

// Solitaire owns its presentation so Spider keeps its existing card contract and styles.
export function Card({ card, w, x, y, z = 0, dragged, hint, selected, dropKey, onPointer = {} }) {
  const { onKeyActivate, ...pointerProps } = onPointer
  const playable = !!(onPointer.onPointerDown || onPointer.onClick)
  const style = { width: w, height: w * 1.4, transform: `translate(${x + (dragged?.dx || 0)}px, ${y + (dragged?.dy || 0)}px)`, zIndex: dragged ? 500 + z : z, fontSize: w * .23 }
  return <div className={`cd sol-card${w < 60 ? ' is-sm' : ''}${isRed(card) ? ' is-red' : ''}${!card.up ? ' is-back' : ''}${dragged ? ' is-drag' : ''}${hint ? ' is-hint' : ''}${selected ? ' is-sel' : ''}`}
    style={style} data-drop={dropKey} {...pointerProps} role={playable ? 'button' : 'img'} tabIndex={playable ? 0 : undefined}
    onKeyDown={playable ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPointer.onClick?.(); onKeyActivate?.() } } : undefined}
    aria-label={card.up ? `${rankLabel(card.rank)}${SUITS[card.suit]}` : playable ? 'שליפת קלף מהחפיסה' : 'קלף הפוך'}>
    {card.up ? <><span className="cd-corner">{rankLabel(card.rank)}<br />{SUITS[card.suit]}</span>
      {card.rank > 10 ? <CourtArt rank={card.rank} /> : <span className="sol-pip" aria-hidden="true">{SUITS[card.suit]}</span>}
      <span className="cd-corner cd-br" aria-hidden="true">{rankLabel(card.rank)}<br />{SUITS[card.suit]}</span>
    </> : <span className="sol-back-mark" aria-hidden="true">♠</span>}
  </div>
}
