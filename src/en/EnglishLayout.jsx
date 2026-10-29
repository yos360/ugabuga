import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Menu, X } from 'lucide-react'
import SEO from '../components/ui/SEO'
import ScrollToTop from '../components/layout/ScrollToTop'
import ReturnNavigation from '../components/layout/ReturnNavigation'
import { recordNotFound } from '../components/layout/RecentActivity'
import BackLink from '../components/ui/BackLink'
import { ENGLISH_SECTIONS, hebrewCounterpart } from './englishLinks'
import './english.css'
export default function EnglishLayout({ children }) {
  const {pathname} = useLocation()
  const [open,setOpen] = useState(false)
  const toggle = useRef(null), panel = useRef(null)
  useEffect(()=>setOpen(false),[pathname])
  useEffect(()=>{
    if(!open)return undefined
    panel.current?.querySelector('a')?.focus()
    const escape=e=>{if(e.key==='Escape'){setOpen(false);toggle.current?.focus()}}
    const outside=e=>{if(!panel.current?.contains(e.target)&&!toggle.current?.contains(e.target))setOpen(false)}
    document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside)
    return()=>{document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside)}
  },[open])
  // Same private owner analytics as the Hebrew pages (RecentActivity there): page opens, time on page
  // and the human check. Paths only — never typed text, guest answers or the "#k=" organizer token.
  useEffect(()=>{
    if(typeof window==='undefined'||window.__PRERENDER__)return undefined
    let stop=null,gone=false
    import('../utils/liveActivity').then(m=>{if(!gone)stop=m.connectActivity(()=>{})}).catch(()=>{})
    return()=>{gone=true;if(stop)stop()}
  },[])
  useEffect(()=>{
    if(typeof window==='undefined'||window.__PRERENDER__)return
    import('../utils/liveActivity').then(m=>{m.logEvent('open',pathname);m.trackTime(pathname)}).catch(()=>{})
  },[pathname])
  // An English guest link (/en/r/<code>) switches to the same invitation on the Hebrew site.
  const guest = /^\/en\/r\/([a-z0-9]+)\/?$/i.exec(pathname)
  const he = guest ? `/r/${guest[1]}` : hebrewCounterpart(pathname) || '/'
  const nav = ENGLISH_SECTIONS.map(s=><Link key={s.path} to={s.path} aria-current={pathname===s.path?'page':undefined}>{s.label}</Link>)
  return <div className="english-site" lang="en" dir="ltr">
    <Helmet htmlAttributes={{ lang: 'en', dir: 'ltr' }} />
    <ScrollToTop />
    <a className="en-skip" href="#site-content">Skip to content</a>
    <header className="site-header en-site-header no-print">
      <div className="en-header-top"><Link to="/en/games" className="site-kids-pill en-play-link">🎮 Let’s play</Link><Link to="/en" className="en-brand" aria-label="Ugabuga home"><span className="en-brand-cake" aria-hidden="true">🎂</span><span><b>UGA<span>BUGA</span></b><small>PLAY · PRINT · LEARN · CELEBRATE</small></span></Link><div className="en-header-actions"><Link to={he} lang="he" hrefLang="he" className="site-language-link">עברית</Link><button ref={toggle} type="button" className="en-menu-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} aria-controls="en-mobile-menu" onClick={()=>setOpen(v=>!v)}>{open?<X />:<Menu />}</button></div></div>
      <nav className="en-desktop-nav" aria-label="Main navigation">{nav}</nav>
      {open&&<nav ref={panel} id="en-mobile-menu" className="en-mobile-nav" aria-label="Mobile navigation">{nav}</nav>}
    </header>
    <main id="site-content" tabIndex={-1}><ReturnNavigation lang="en" />{children}</main>
    <footer className="en-footer"><p><strong>UGABUGA</strong> · A little bit of everything. A whole lot of fun.</p><nav aria-label="Footer navigation"><Link to="/en">Home</Link>{nav}<Link to={he} lang="he">עברית</Link></nav><p>Games, printable activities and happy moments together.</p><p><a href="mailto:hellohugabuga@gmail.com">Contact us</a> · <Link to="/privacy">Privacy policy (Hebrew)</Link></p></footer>
  </div>
}
export function EnglishNotFound() {
  const { pathname } = useLocation()
  useEffect(() => { recordNotFound(pathname) }, [pathname])
  return <div className="en-page"><SEO lang="en" title="Page not found" description="This English page is not available. Return to the Ugabuga English home." noindex /><h1>We could not find that page</h1><p>The address may be incomplete, or this activity may not be available in English yet.</p><BackLink to="/en" lang="en">Back to English home</BackLink></div>
}
