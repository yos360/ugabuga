export default function WobblyCard({ children, className = '', hover = true, shadow = true, onClick, padding = 'p-6' }) {
  return (
    <div onClick={onClick} className={`bg-[var(--paper)] border-2 border-[var(--ink)] wobbly ${shadow ? 'shadow-hard' : ''} ${hover ? 'card-hover cursor-pointer' : ''} ${padding} ${className}`}>
      {children}
    </div>
  )
}
