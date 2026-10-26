import { SUITS, isRed, rankLabel } from '../../logic/cards'
import { CardBack, CardFace, SuitGlyph } from './CardFace'
export function Slot({ w, x, y, label, suit, dropKey, onClick, active }) {
  return <div className={`cd-slot${active ? ' is-active' : ''}${suit != null ? ' is-found' : ''}`} style={{ width: w, height: w * 1.4, transform: `translate(${x}px, ${y}px)`, fontSize: w * .34 }}
    data-drop={dropKey} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
    aria-label={onClick ? 'מחזור החפיסה' : undefined}
    onKeyDown={onClick ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}>{suit != null ? <SuitGlyph suit={suit} className="sol-slot-suit" /> : label}</div>
}

// Solitaire owns its presentation so Spider keeps its existing card contract and styles.
export function Card({ card, w, x, y, z = 0, dragged, hint, selected, dropKey, onPointer = {} }) {
  const { onKeyActivate, ...pointerProps } = onPointer
  const playable = !!(onPointer.onPointerDown || onPointer.onClick)
  const small = w < 60
  const style = { width: w, height: w * 1.4, transform: `translate(${x + (dragged?.dx || 0)}px, ${y + (dragged?.dy || 0)}px)`, zIndex: dragged ? 500 + z : z, fontSize: w * .23 }
  const index = <><b>{rankLabel(card.rank)}</b><SuitGlyph suit={card.suit} /></>
  return <div className={`cd sol-card${small ? ' is-sm' : ''}${isRed(card) ? ' is-red' : ''}${!card.up ? ' is-back' : ''}${dragged ? ' is-drag' : ''}${hint ? ' is-hint' : ''}${selected ? ' is-sel' : ''}`}
    style={style} data-drop={dropKey} {...pointerProps} role={playable ? 'button' : 'img'} tabIndex={playable ? 0 : undefined}
    onKeyDown={playable ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPointer.onClick?.(); onKeyActivate?.() } } : undefined}
    aria-label={card.up ? `${rankLabel(card.rank)}${SUITS[card.suit]}` : playable ? 'שליפת קלף מהחפיסה' : 'קלף הפוך'}>
    {card.up ? <><span className="sol-index">{index}</span>
      <CardFace card={card} small={small} />
      {!small && <span className="sol-index sol-index-br" aria-hidden="true">{index}</span>}
    </> : <CardBack />}
  </div>
}
