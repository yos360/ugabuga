export default function WobblyButton({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) {
  const base = 'wobbly-md inline-flex min-h-[44px] items-center justify-center border-[3px] border-[var(--border)] px-5 py-2 font-display text-lg font-bold sketch-press'
  const variants = {
    primary: 'bg-[var(--accent)] text-[var(--accent-foreground)]',
    secondary: 'bg-[var(--postit)] text-[var(--foreground)]',
    green: 'bg-[#4caf50] text-white',
    blue: 'bg-[var(--pen)] text-[var(--pen-foreground)]',
    outline: 'bg-[var(--card)] text-[var(--foreground)]',
    dark: 'bg-[var(--ink)] text-[var(--background)]',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  )
}
