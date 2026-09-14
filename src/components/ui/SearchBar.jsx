import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar({ placeholder = 'חפשו משחק, פעילות, או רעיון...', onSearch, className = '' }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) onSearch(query)
      else navigate('/games?q=' + encodeURIComponent(query))
    }
  }
  return (
    <form onSubmit={handleSubmit} className={'flex gap-2 w-full max-w-2xl mx-auto ' + className}>
      <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={placeholder}
        className="flex-1 px-5 py-3 text-lg border-2 border-[var(--ink)] wobbly bg-white text-right focus:outline-none focus:ring-2 focus:ring-[var(--red)]" />
      <button type="submit" className="wobbly-btn border-2 border-[var(--ink)] shadow-hard-sm btn-press px-6 py-3 font-bold bg-[var(--red)] text-white">
        🔍
      </button>
    </form>
  )
}
