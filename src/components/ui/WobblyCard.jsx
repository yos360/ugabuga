export default function WobblyCard({ children, className = '', hover = true, shadow = true, onClick, padding = 'p-6', tag = 'div' }) {
  const Tag = tag
  return (
    <Tag onClick={onClick}
      className={`bg-[var(--card)] border-2 border-[var(--border)] wobbly ${shadow ? 'sketch-shadow' : ''} ${hover ? 'sketch-press cursor-pointer' : ''} ${padding} ${className}`}>
      {children}
    </Tag>
  )
}
