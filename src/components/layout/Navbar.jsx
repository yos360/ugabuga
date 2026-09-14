import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const toolLinks = [
  { to: '/calculator', label: '🧮 מחשבון מסיבה' },
  { to: '/greeting', label: '💌 מחולל ברכות' },
  { to: '/invitation', label: '📨 מחולל הזמנות' },
  { to: '/tools/team-generator', label: '🎲 מחלק קבוצות' },
  { to: '/tools/random-picker', label: '🎡 גלגל שמות' },
  { to: '/tools/countdown-timer', label: '⏱️ טיימר' },
  { to: '/tools/truth-or-dare', label: '🎭 אמת או חובה' },
  { to: '/tools/dice', label: '🎲 קוביה' },
  { to: '/tools/coin-flip', label: '🪙 מטבע' },
  { to: '/tools/scoreboard', label: '📊 לוח ניקוד' },
  { to: '/tools/spin-the-bottle', label: '🍾 סובב בקבוק' },
  { to: '/tools/drawing-prompt', label: '🎨 מה לצייר?' },
  { to: '/tools/joke', label: '😂 בדיחה' },
]

const navLinks = [
  { to: '/games', label: 'משחקים' },
  { to: '/ideas', label: 'רעיונות' },
  { to: '/gifts', label: 'מתנות' },
  { to: '/printables', label: 'הדפסות' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const location = useLocation()
  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <nav className="bg-[var(--paper)] border-b-2 border-[var(--ink)] sticky top-0 z-50 no-print">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold font-hand">
          <span className="text-3xl">🎂</span>
          <span>עוגה בוגה</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${isActive(link.to) ? 'bg-[var(--yellow)] font-bold' : 'hover:bg-[var(--muted)]/30'}`}>
              {link.label}
            </Link>
          ))}

          {/* Tools dropdown */}
          <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
            <button className={`px-4 py-2 font-medium rounded-lg transition-colors ${isActive('/tools') || isActive('/calculator') || isActive('/greeting') || isActive('/invitation') ? 'bg-[var(--yellow)] font-bold' : 'hover:bg-[var(--muted)]/30'}`}>
              כלים ▾
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-0 mt-1 bg-[var(--paper)] border-2 border-[var(--ink)] wobbly shadow-hard p-2 min-w-[200px] grid grid-cols-2 gap-1 z-50">
                {toolLinks.map(link => (
                  <Link key={link.to} to={link.to} onClick={() => setToolsOpen(false)}
                    className="px-3 py-2 text-sm hover:bg-[var(--yellow)] rounded transition-colors whitespace-nowrap">
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-2xl p-2">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-4 animate-fade-in">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 text-lg font-medium rounded-lg mb-1 ${isActive(link.to) ? 'bg-[var(--yellow)]' : 'hover:bg-[var(--muted)]/30'}`}>
              {link.label}
            </Link>
          ))}
          <div className="border-t border-[var(--muted)] mt-2 pt-2">
            <p className="px-4 py-2 text-sm text-[var(--muted)] font-bold">כלים</p>
            {toolLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 text-base hover:bg-[var(--muted)]/30 rounded">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
