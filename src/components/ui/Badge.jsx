export default function Badge({ children, color = 'default', className = '' }) {
  const colors = {
    default: 'bg-[var(--paper)] text-[var(--ink)] border-[var(--ink)]',
    red: 'bg-[var(--red)] text-white border-[var(--red)]',
    green: 'bg-[var(--green)] text-white border-[var(--green)]',
    blue: 'bg-[var(--blue)] text-white border-[var(--blue)]',
    yellow: 'bg-[var(--yellow)] text-[var(--ink)] border-[var(--ink)]',
  }
  return (
    <span className={`inline-block px-3 py-1 text-sm font-medium border wobbly-sm ${colors[color] || colors.default} ${className}`}>
      {children}
    </span>
  )
}
