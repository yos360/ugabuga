export default function Badge({ children, color = 'default', className = '' }) {
  const colors = {
    default: 'bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]',
    red: 'bg-[var(--accent)] text-white border-[var(--accent)]',
    green: 'bg-[#4caf50] text-white border-[#4caf50]',
    blue: 'bg-[var(--pen)] text-white border-[var(--pen)]',
    yellow: 'bg-[var(--postit)] text-[var(--foreground)] border-[var(--border)]',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium border wobbly-sm ${colors[color] || colors.default} ${className}`}>
      {children}
    </span>
  )
}
