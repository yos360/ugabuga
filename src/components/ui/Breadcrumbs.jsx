import { Link } from 'react-router-dom'

export default function Breadcrumbs({ items }) {
  return (
    <nav className="text-sm text-[var(--muted)] mb-4 no-print" aria-label="breadcrumb">
      <ol className="flex flex-wrap gap-1 items-center">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span className="mx-1">{'›'}</span>}
            {item.href ? (
              <Link to={item.href} className="hover:text-[var(--ink)] hover:underline">{item.label}</Link>
            ) : (
              <span className="text-[var(--ink)] font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
