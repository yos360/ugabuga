export default function WobblyButton({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) {
  const variants = {
    primary: 'bg-[var(--red)] text-white hover:brightness-110',
    secondary: 'bg-[var(--yellow)] text-[var(--ink)] hover:brightness-95',
    green: 'bg-[var(--green)] text-white hover:brightness-110',
    blue: 'bg-[var(--blue)] text-white hover:brightness-110',
    outline: 'bg-transparent text-[var(--ink)] border-dashed hover:bg-[var(--muted)]/30',
    dark: 'bg-[var(--ink)] text-white hover:brightness-125',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`wobbly-btn border-2 border-[var(--ink)] shadow-hard-sm btn-press px-6 py-3 font-bold text-lg transition-all ${variants[variant] || variants.primary} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  )
}
