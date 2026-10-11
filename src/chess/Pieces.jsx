// Our own simple chess piece drawings (45×45 viewBox), used on the boards and the printable sheets.
const BASE = <path d="M10 35.5h25a1.5 1.5 0 0 1 1.5 1.5v2.5a1.5 1.5 0 0 1-1.5 1.5H10a1.5 1.5 0 0 1-1.5-1.5V37a1.5 1.5 0 0 1 1.5-1.5z" />

const SHAPES = {
  p: <>
    <circle cx="22.5" cy="13" r="5.5" />
    <path d="M17.5 19.5h10l-1.6 3.4c4.4 3.2 6.9 7.6 7.6 12.6H11.5c.7-5 3.2-9.4 7.6-12.6z" />
    {BASE}
  </>,
  r: <>
    <path d="M11 7.5h5v3.5h3.5V7.5h6V11H29V7.5h5v7l-3 3H14l-3-3z" />
    <path d="M15 17.5h15l1.2 15.5H13.8z" />
    <path d="M12 33h21v2.5H12z" />
    {BASE}
    <path className="pc-line" d="M14.5 17.5h16M14 30h17" />
  </>,
  b: <>
    <circle cx="22.5" cy="6.5" r="2.6" />
    <path d="M22.5 9.2c-5.6 4.3-8.4 9.2-7.8 13.6.5 3.8 3.6 6 7.8 6s7.3-2.2 7.8-6c.6-4.4-2.2-9.3-7.8-13.6z" />
    <path d="M15.5 28.8h14l-.8 3.2h-12.4z" />
    <path d="M12.5 35.5c1.2-2.4 5-3.5 10-3.5s8.8 1.1 10 3.5z" />
    {BASE}
    <path className="pc-line" d="M25.5 13.5l-5 6.5M20 17h5" />
  </>,
  n: <>
    <path d="M13.5 35.5h20c.3-8.6-.6-16.4-3.6-21.6-2-3.6-5.2-6.1-8.9-7.1l-1.2-2.9-2 3.4c-3.9 1.7-6.8 5.4-8.6 10.2l-1.6 4.6c.7 1.9 2.6 2.4 4 1.3l2.8-2.6c1.9-.1 3.8-.9 5-2.1-.5 4.5-3.3 7.5-5.6 10.6-.9 1.4-.9 3.3-.3 6.2z" />
    {BASE}
    <circle className="pc-eye" cx="18.5" cy="12.5" r="1.4" />
    <path className="pc-line" d="M27 12.5c1.9 3.2 2.8 7.6 3 12" />
  </>,
  q: <>
    <path d="M12.5 31L9.3 13.5l6.6 8.3-.4-12.3 5 11.3 2-13 2 13 5-11.3-.4 12.3 6.6-8.3L32.5 31z" />
    <circle cx="9.3" cy="12" r="2.2" /><circle cx="15.5" cy="8.3" r="2.2" /><circle cx="22.5" cy="6.3" r="2.2" /><circle cx="29.5" cy="8.3" r="2.2" /><circle cx="35.7" cy="12" r="2.2" />
    <path d="M12.5 31h20l1 4.5h-22z" />
    {BASE}
    <path className="pc-line" d="M12.8 31h19.4" />
  </>,
  k: <>
    <path d="M21 3h3v3h3v3h-3v4h-3V9h-3V6h3z" />
    <path d="M13 32.5c-3.6-5.4-4.8-11.2-1.4-14.2 3.1-2.7 7.2-1.6 10.9 2.2 3.7-3.8 7.8-4.9 10.9-2.2 3.4 3-.2 8.8-1.4 14.2z" />
    <path d="M22.5 13.5c-1.6 1.7-2.4 3.7-2.2 6.3l2.2 3 2.2-3c.2-2.6-.6-4.6-2.2-6.3z" />
    <path d="M12.5 32.5h20l1 3h-22z" />
    {BASE}
    <path className="pc-line" d="M13 32.5h19M22.5 21v11" />
  </>,
}

export const PIECE_NAMES = { k: 'מלך', q: 'מלכה', r: 'צריח', b: 'רץ', n: 'פרש', p: 'רגלי' }

export default function Piece({ type, color, className = '', title }) {
  return (
    <svg viewBox="0 0 45 45" className={`pc pc-${color} ${className}`} role={title ? 'img' : undefined} aria-hidden={title ? undefined : 'true'} focusable="false">
      {title && <title>{title}</title>}
      <g className="pc-body">{SHAPES[type]}</g>
    </svg>
  )
}
