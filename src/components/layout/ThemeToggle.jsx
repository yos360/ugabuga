import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'

// index.html picks the theme before the first paint: dark automatically from dusk to sunrise (like Waze),
// unless the visitor chose here — "dark" is remembered, "light" holds for 12 hours and then night mode
// returns. The look itself is a single CSS rule in index.css (html[data-theme="dark"]).
const read = () => (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark')

export default function ThemeToggle({ className = 'site-icon-button', withLabel = false }) {
  const [dark, setDark] = useState(read)
  const toggle = () => {
    const next = !dark
    if (next) document.documentElement.dataset.theme = 'dark'
    else delete document.documentElement.dataset.theme
    delete document.documentElement.dataset.themeAuto
    try { localStorage.setItem('buga-theme', next ? 'dark' : 'light'); localStorage.setItem('buga-theme-at', String(Date.now())) } catch { /* private mode */ }
    setDark(next)
  }
  const label = dark ? 'מצב בהיר' : 'מצב כהה'
  return <button type="button" className={className} onClick={toggle} aria-pressed={dark} aria-label={label} title={label}>
    {dark ? <Sun size={22} strokeWidth={1.7} /> : <Moon size={22} strokeWidth={1.7} />}{withLabel && <span> {label}</span>}
  </button>
}
