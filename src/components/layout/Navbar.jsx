import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const TOOLS_MENU = [
  { to: '/calculator', label: '🧮 מחשבון מסיבה' },
  { to: '/greeting', label: '💌 מחולל ברכות' },
  { to: '/invitation', label: '📨 מחולל הזמנות' },
  { to: '/tools/team-generator', label: '🎲 מחלק קבוצות' },
  { to: '/tools/random-picker', label: '🎡 גלגל שמות' },
  { to: '/tools/countdown-timer', label: '⏱️ טיימר' },
  { to: '/tools/truth-or-dare', label: '🎭 אמת או חובה' },
  { to: '/tools/dice', label: '🎲 קוביה' },
  { to: '/tools/coin-flip', label: '🪙 הטלת מטבע' },
  { to: '/tools/scoreboard', label: '📊 לוח ניקוד' },
  { to: '/tools/spin-the-bottle', label: '🍾 סובב את הבקבוק' },
  { to: '/tools/drawing-prompt', label: '🎨 מה לצייר?' },
  { to: '/tools/joke', label: '😂 בדיחה של BUGA' },
  { to: '/tools/riddles', label: '🧩 חידות' },
  { to: '/printables', label: '🖨️ דפים להדפסה' },
  { to: '/games/all', label: '📚 כל המשחקים א׳-ת׳' },
  { to: '/blog', label: '📝 טיפים ורעיונות' },
  { to: '/faq', label: '❓ שאלות נפוצות' },
]

const MOBILE_LINKS = [
  { to: '/games', label: '🎮 משחקים' },
  { to: '/ideas', label: '🎭 רעיונות' },
  { to: '/guides', label: '📖 מדריכים' },
  { to: '/gifts', label: '🎁 מתנות' },
  ...TOOLS_MENU,
]

function HeaderLink({ to, children }) {
  const { pathname } = useLocation()
  const active = pathname.startsWith(to)
  return (
    <Link to={to} className={`wobbly-sm inline-flex min-h-[44px] items-center border-2 border-[var(--border)] px-3 py-1 font-display text-lg transition-transform duration-100 hover:-rotate-1 hover:sketch-shadow-sm ${active ? 'nav-active bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--card)]'}`}>
      {children}
    </Link>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const { pathname } = useLocation()
  const rootRef = useRef(null)

  const toolsActive = pathname.startsWith('/tools') || pathname.startsWith('/calculator') || pathname.startsWith('/greeting') || pathname.startsWith('/invitation') || pathname.startsWith('/printables')

  useEffect(() => setToolsOpen(false), [pathname])
  useEffect(() => {
    if (!toolsOpen) return
    const close = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setToolsOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') setToolsOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [toolsOpen])

  return (
    <header className="border-b-2 border-[var(--border)] bg-[var(--background)]/90 sticky top-0 z-50 no-print">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="wobbly-sm buga-bounce inline-flex h-10 w-10 items-center justify-center border-2 border-[var(--border)] bg-[var(--postit)] text-xl sketch-shadow-sm">🎂</span>
          <span className="font-display text-3xl font-bold">עוגה בוגה</span>
        </Link>

        <button type="button" className="wobbly-sm flex h-11 w-11 items-center justify-center border-2 border-[var(--border)] bg-[var(--card)] text-2xl md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>

        <nav className="hidden items-center gap-2 md:flex">
          <HeaderLink to="/games">משחקים</HeaderLink>
          <HeaderLink to="/ideas">רעיונות</HeaderLink>

          <div ref={rootRef} className="relative">
            <button type="button" onClick={() => setToolsOpen(!toolsOpen)}
              className={`wobbly-sm inline-flex min-h-[44px] cursor-pointer items-center border-2 border-[var(--border)] px-3 py-1 font-display text-lg transition-transform duration-100 hover:-rotate-1 hover:sketch-shadow-sm ${toolsActive ? 'nav-active bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--card)]'}`}>
              כלים {toolsOpen ? '▴' : '▾'}
            </button>
            {toolsOpen && (
              <ul className="wobbly absolute end-0 z-50 mt-2 max-h-[60vh] w-64 overflow-y-auto border-2 border-[var(--border)] bg-[var(--card)] p-2 font-hand text-lg sketch-shadow">
                {TOOLS_MENU.map(item => (
                  <li key={item.to}>
                    <Link to={item.to} onClick={() => setToolsOpen(false)}
                      className="flex min-h-[40px] w-full items-center rounded px-2 py-1 underline decoration-dashed hover:bg-[var(--muted)]">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <HeaderLink to="/guides">מדריכים</HeaderLink>
        </nav>

        {mobileOpen && (
          <nav className="wobbly-sm w-full border-2 border-[var(--border)] bg-[var(--card)] p-3 md:hidden buga-slide-down">
            <ul className="grid gap-1 font-hand text-xl">
              {MOBILE_LINKS.map(item => (
                <li key={item.to}>
                  <Link to={item.to} onClick={() => setMobileOpen(false)}
                    className="flex min-h-[44px] items-center border-b border-dashed border-[var(--border)] px-2 py-2">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}
