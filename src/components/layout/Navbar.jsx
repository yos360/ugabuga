import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X, ChevronDown, ArrowLeft } from 'lucide-react'

import { MENU_GROUPS, MENU_ACTIVE_PREFIXES, SECTION } from '../../data/siteMenu'

function HeaderLink({ to, children }) {
  const { pathname } = useLocation()
  const active = to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)
  return <Link to={to} className={`site-nav-link${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined}>{children}</Link>
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const { pathname, search } = useLocation()
  const toolsRef = useRef(null)
  const toolsButtonRef = useRef(null)
  const mobileButtonRef = useRef(null)
  const mobilePanelRef = useRef(null)
  const toolsActive = MENU_ACTIVE_PREFIXES.some(path => pathname.startsWith(path))

  useEffect(() => {
    setToolsOpen(false)
    setMobileOpen(false)
  }, [pathname, search])

  useEffect(() => {
    if (!toolsOpen && !mobileOpen) return undefined
    const dismissOutside = event => {
      if (toolsOpen && toolsRef.current && !toolsRef.current.contains(event.target)) setToolsOpen(false)
      if (mobileOpen && mobilePanelRef.current && !mobilePanelRef.current.contains(event.target) && !mobileButtonRef.current?.contains(event.target)) setMobileOpen(false)
    }
    const escape = event => {
      if (event.key !== 'Escape') return
      if (toolsOpen) { setToolsOpen(false); toolsButtonRef.current?.focus() }
      if (mobileOpen) { setMobileOpen(false); mobileButtonRef.current?.focus() }
    }
    document.addEventListener('pointerdown', dismissOutside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside)
      document.removeEventListener('keydown', escape)
    }
  }, [toolsOpen, mobileOpen])

  return (
    <header className="site-header no-print">
      <a className="site-skip-link" href="#site-content" onClick={event => {
        const main = document.querySelector('main')
        if (main) {
          event.preventDefault()
          main.setAttribute('tabindex', '-1')
          main.focus()
          main.scrollIntoView({ block: 'start' })
        }
      }}>דילוג לתוכן</a>
      <div className="site-header-inner">
        <nav className="site-nav-primary" aria-label="ניווט ראשי">
          <Link to="/games" className="site-icon-button" aria-label="חיפוש משחקים"><Search size={24} strokeWidth={1.7} /></Link>
          <HeaderLink to="/games">{SECTION.games}</HeaderLink>
          <HeaderLink to="/birthday">{SECTION.birthday}</HeaderLink>
          <HeaderLink to="/classroom">{SECTION.classroom}</HeaderLink>
        </nav>

        <Link to="/" className="site-brand" aria-label="עוגה בוגה — דף הבית">
          <span className="site-brand-art" aria-hidden="true" />
        </Link>

        <nav className="site-nav-secondary" aria-label="עוד בעוגה בוגה">
          <HeaderLink to="/create">{SECTION.create}</HeaderLink>
          <HeaderLink to="/ideas">{SECTION.ideas}</HeaderLink>
          <HeaderLink to="/suppliers">{SECTION.suppliers}</HeaderLink>
          <div className="site-tools" ref={toolsRef} onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) setToolsOpen(false)
          }}>
            <button ref={toolsButtonRef} type="button" className={`site-tools-toggle${toolsActive ? ' is-active' : ''}`}
              aria-expanded={toolsOpen} aria-controls="site-tools-menu" onClick={() => setToolsOpen(open => !open)}>
              כל הכלים <ChevronDown size={15} className={toolsOpen ? 'is-open' : ''} />
            </button>
            {toolsOpen && (
              <div id="site-tools-menu" className="site-tools-menu">
                <div className="site-tools-groups">
                  {MENU_GROUPS.map(group => <section key={group.title}>
                    <Link to={group.to} className="site-tools-heading" onClick={() => setToolsOpen(false)}>{group.title}</Link>
                    <ul>{group.items.map(item => <li key={item.to}><Link to={item.to} onClick={() => setToolsOpen(false)}><span aria-hidden="true">{item.icon}</span>{item.label}</Link></li>)}</ul>
                  </section>)}
                </div>
                <Link className="site-tools-all" to="/tools">לכל הכלים <ArrowLeft size={16} /></Link>
              </div>
            )}
          </div>
        </nav>

        <Link to="/games" className="site-icon-button site-mobile-search" aria-label="חיפוש משחקים"><Search size={22} /></Link>
        <button ref={mobileButtonRef} className="site-icon-button site-mobile-toggle" type="button" aria-expanded={mobileOpen} aria-controls="site-mobile-menu"
          aria-label={mobileOpen ? 'סגירת תפריט' : 'פתיחת תפריט'} onClick={() => setMobileOpen(open => !open)}>{mobileOpen ? <X size={25} /> : <Menu size={25} />}</button>
      </div>

      {mobileOpen && (
        <nav ref={mobilePanelRef} id="site-mobile-menu" className="site-mobile-menu" aria-label="תפריט נייד">
          <div className="site-mobile-main-links">
            {[['/', 'דף הבית'], ['/games', SECTION.games], ['/birthday', SECTION.birthday], ['/classroom', SECTION.classroom], ['/create', SECTION.create], ['/ideas', SECTION.ideas], ['/suppliers', SECTION.suppliers], ['/about', 'אודות']].map(([to, label]) => <HeaderLink key={to} to={to}>{label}</HeaderLink>)}
          </div>
          {MENU_GROUPS.map(group => <section key={group.title}>
            <h2><Link to={group.to} onClick={() => setMobileOpen(false)}>{group.title}</Link></h2>
            <ul>{group.items.map(item => <li key={item.to}><Link to={item.to} onClick={() => setMobileOpen(false)}><span aria-hidden="true">{item.icon}</span>{item.label}</Link></li>)}</ul>
          </section>)}
        </nav>
      )}
    </header>
  )
}
