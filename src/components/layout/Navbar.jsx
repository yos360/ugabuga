import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X, ChevronDown, ArrowLeft } from 'lucide-react'

import { MENU_DOMAINS, CLASSROOM_MENU, KIDS_ZONE, SITE_MAP_LINK, activeDomainFor } from '../../data/siteMenu'
import { englishCounterpart } from '../../en/englishLinks'
import { SITE_SLOGAN } from '../../data/brand'

function ItemLink({ item, onClick }) {
  return <Link to={item.to} onClick={onClick} className={item.highlight ? 'is-highlight' : undefined}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>
}

// Desktop mega panel for one domain (or the smaller classroom panel).
function MegaPanel({ domain, onNavigate }) {
  const groups = domain.groups || [{ title: null, items: domain.items }]
  return (
    <div id={`site-panel-${domain.id}`} className={`site-mega${domain.groups ? '' : ' is-compact'}`}>
      <div className="site-mega-groups">
        {groups.map(group => <section key={group.title || 'items'} className={group.items.some(i => i.highlight) ? 'is-banner' : group.items.length > 14 ? 'is-wide' : undefined}>
          {group.title && (group.to
            ? <Link to={group.to} className="site-mega-heading" onClick={onNavigate}><span aria-hidden="true">{group.icon}</span> {group.title}</Link>
            : <p className="site-mega-heading"><span aria-hidden="true">{group.icon}</span> {group.title}</p>)}
          <ul>{group.items.map(item => <li key={item.to}><ItemLink item={item} onClick={onNavigate} /></li>)}</ul>
        </section>)}
      </div>
      <div className="site-mega-footer">
        <Link to={domain.to} onClick={onNavigate}>{domain.landingLabel} <ArrowLeft size={16} /></Link>
        {domain.groups && <Link to={SITE_MAP_LINK.to} onClick={onNavigate} className="is-muted">{SITE_MAP_LINK.label}</Link>}
      </div>
    </div>
  )
}

// A domain in the desktop bar: the name links to its landing page, the chevron
// opens the panel (mouse users also get it on hover).
function DomainItem({ domain, open, setOpen, active, className = '' }) {
  const toggleRef = useRef(null)
  const timer = useRef(null)
  const isOpen = open === domain.id
  const schedule = (fn, ms) => { clearTimeout(timer.current); timer.current = setTimeout(fn, ms) }
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <li className={`site-domain ${className}`}
      onPointerEnter={e => { if (e.pointerType === 'mouse') schedule(() => setOpen(domain.id), 120) }}
      onPointerLeave={e => { if (e.pointerType === 'mouse') schedule(() => setOpen(o => (o === domain.id ? null : o)), 220) }}
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(o => (o === domain.id ? null : o)) }}
      onKeyDown={e => { if (e.key === 'Escape' && isOpen) { e.stopPropagation(); setOpen(null); toggleRef.current?.focus() } }}>
      <Link to={domain.to} className={`site-domain-link${active ? ' is-active' : ''}`} aria-current={active ? 'true' : undefined}>
        <span aria-hidden="true">{domain.icon}</span> {domain.label}
      </Link>
      <button ref={toggleRef} type="button" className="site-domain-toggle" aria-expanded={isOpen} aria-controls={`site-panel-${domain.id}`}
        aria-label={`תפריט ${domain.label}`} onClick={() => { clearTimeout(timer.current); setOpen(o => (o === domain.id ? null : domain.id)) }}>
        <ChevronDown size={15} className={isOpen ? 'is-open' : ''} />
      </button>
      {isOpen && <MegaPanel domain={domain} onNavigate={() => setOpen(null)} />}
    </li>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [open, setOpen] = useState(null) // id of the open desktop panel
  const [mobileSection, setMobileSection] = useState(null)
  const { pathname, search } = useLocation()
  const mobileButtonRef = useRef(null)
  const mobilePanelRef = useRef(null)
  const active = activeDomainFor(pathname)

  useEffect(() => {
    setOpen(null)
    setMobileOpen(false)
  }, [pathname, search])

  // Opening the phone menu moves focus into it (the current domain is expanded on open).
  useEffect(() => {
    if (mobileOpen) mobilePanelRef.current?.querySelector('a, button')?.focus()
  }, [mobileOpen])

  useEffect(() => {
    if (!open && !mobileOpen) return undefined
    const dismissOutside = event => {
      if (open && !event.target.closest?.('.site-domain')) setOpen(null)
      if (mobileOpen && mobilePanelRef.current && !mobilePanelRef.current.contains(event.target) && !mobileButtonRef.current?.contains(event.target)) setMobileOpen(false)
    }
    const escape = event => {
      if (event.key !== 'Escape') return
      if (open) setOpen(null)
      if (mobileOpen) { setMobileOpen(false); mobileButtonRef.current?.focus() }
    }
    document.addEventListener('pointerdown', dismissOutside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside)
      document.removeEventListener('keydown', escape)
    }
  }, [open, mobileOpen])

  const closeMobile = () => setMobileOpen(false)
  const kidsActive = pathname === KIDS_ZONE.to

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
        <div className="site-header-side site-header-start">
          <Link to={KIDS_ZONE.to} className={`site-kids-pill${kidsActive ? ' is-active' : ''}`} aria-current={kidsActive ? 'page' : undefined}>
            <span aria-hidden="true">{KIDS_ZONE.icon}</span> אזור ילדים
          </Link>
        </div>

        <Link to="/" className="site-brand" aria-label="עוגה בוגה — דף הבית">
          <span className="site-brand-art" aria-hidden="true"><img src="/images/site-logo.webp" alt="" width="250" height="80" /></span>
          {/* The home page already says it in its headline. */}
          {pathname !== '/' && <span className="site-brand-slogan" aria-label={SITE_SLOGAN}><span>האתר שיש בו הכל</span><span>מעוגה ועד בוגה</span></span>}
        </Link>

        <div className="site-header-side site-header-end">
          <Link to={englishCounterpart(pathname) || '/en'} lang="en" hrefLang="en" className="site-language-link" aria-label="English — האתר באנגלית">English</Link>
          <ul className="site-classroom">
            <DomainItem domain={CLASSROOM_MENU} open={open} setOpen={setOpen} active={active === 'classroom'} className="is-classroom" />
          </ul>
          <Link to="/search" className="site-icon-button" aria-label="חיפוש באתר"><Search size={24} strokeWidth={1.7} /></Link>
        </div>

        <Link to="/search" className="site-icon-button site-mobile-search" aria-label="חיפוש באתר"><Search size={22} /></Link>
        {!kidsActive && <Link to={KIDS_ZONE.to} className="site-mobile-kids-pill" aria-label="אזור ילדים — לשחק לבד"><span aria-hidden="true">{KIDS_ZONE.icon}</span> ילדים</Link>}
        <button ref={mobileButtonRef} className="site-icon-button site-mobile-toggle" type="button" aria-expanded={mobileOpen} aria-controls="site-mobile-menu"
          aria-label={mobileOpen ? 'סגירת תפריט' : 'פתיחת תפריט'} onClick={() => { if (!mobileOpen) setMobileSection(active); setMobileOpen(o => !o) }}>{mobileOpen ? <X size={25} /> : <Menu size={25} />}</button>
      </div>

      <div className="site-mobile-language"><Link to={englishCounterpart(pathname) || '/en'} lang="en" hrefLang="en" aria-label="English — האתר באנגלית">English <span aria-hidden="true">↗</span></Link></div>

      <nav className="site-domains" aria-label="ניווט ראשי">
        <ul>
          {MENU_DOMAINS.map(domain => <DomainItem key={domain.id} domain={domain} open={open} setOpen={setOpen} active={active === domain.id} />)}
        </ul>
      </nav>

      {mobileOpen && (
        <nav ref={mobilePanelRef} id="site-mobile-menu" className="site-mobile-menu" aria-label="תפריט נייד">
          <Link to={KIDS_ZONE.to} className="site-mobile-kids" onClick={closeMobile}><span aria-hidden="true">{KIDS_ZONE.icon}</span> אזור ילדים — לשחק לבד</Link>
          <ul className="site-mobile-sections">
            {[...MENU_DOMAINS, CLASSROOM_MENU].map(domain => {
              const expanded = mobileSection === domain.id
              // The kids zone already leads the phone menu, so its group isn't repeated here.
              const groups = (domain.groups || [{ title: null, items: domain.items }]).filter(g => !g.items.some(i => i.highlight))
              return <li key={domain.id} className={domain.id === 'classroom' ? 'is-classroom' : undefined}>
                <button type="button" className={`site-mobile-section-toggle${active === domain.id ? ' is-active' : ''}`} aria-expanded={expanded} aria-controls={`site-mobile-${domain.id}`}
                  onClick={() => setMobileSection(s => (s === domain.id ? null : domain.id))}>
                  <span><span aria-hidden="true">{domain.icon}</span> {domain.label}</span>
                  <ChevronDown size={20} className={expanded ? 'is-open' : ''} aria-hidden="true" />
                </button>
                {expanded && <div id={`site-mobile-${domain.id}`} className="site-mobile-section">
                  <Link to={domain.to} className="site-mobile-landing" onClick={closeMobile}>{domain.landingLabel} <ArrowLeft size={16} aria-hidden="true" /></Link>
                  {groups.map(group => <section key={group.title || 'items'}>
                    {group.title && <h3>{group.to ? <Link to={group.to} onClick={closeMobile}><span aria-hidden="true">{group.icon}</span> {group.title}</Link> : <><span aria-hidden="true">{group.icon}</span> {group.title}</>}</h3>}
                    <ul>{group.items.map(item => <li key={item.to}><ItemLink item={item} onClick={closeMobile} /></li>)}</ul>
                  </section>)}
                </div>}
              </li>
            })}
          </ul>
          <div className="site-mobile-main-links">
            <Link to="/" onClick={closeMobile}>דף הבית</Link>
            <Link to={SITE_MAP_LINK.to} onClick={closeMobile}>{SITE_MAP_LINK.label}</Link>
            <Link to="/about" onClick={closeMobile}>אודות</Link>
          </div>
        </nav>
      )}
    </header>
  )
}
