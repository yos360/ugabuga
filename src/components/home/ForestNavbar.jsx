import { Link, useNavigate } from 'react-router-dom'
import { Gamepad2, Printer, Cake, GraduationCap, Heart, Menu, Search } from 'lucide-react'
import { MENU_DOMAINS, CLASSROOM_MENU } from '../../data/siteMenu'

const doors = [
  ['/classroom', 'כיתה וחינוך', GraduationCap],
  ['/birthday', 'ימי הולדת', Cake],
  ['/printables', 'דפי עבודה', Printer],
  ['/games', 'משחקים', Gamepad2],
]

export default function ForestNavbar() {
  const navigate = useNavigate()
  return <header className="forest-navbar no-print">
    <a className="site-skip-link" href="#site-content">דילוג לתוכן</a>
    <details className="forest-menu" onKeyDown={event => {
      if (event.key === 'Escape') {
        event.currentTarget.open = false
        event.currentTarget.querySelector('summary').focus()
      }
    }}>
      <summary aria-label="כל עולמות האתר"><Menu size={25} /><span>כל האתר</span></summary>
      <nav className="forest-menu-panel" aria-label="כל עולמות האתר">
        {[...MENU_DOMAINS, CLASSROOM_MENU].map(domain => <section key={domain.id}>
          <h2><Link to={domain.to}>{domain.label}</Link></h2>
          {(domain.groups || [{ items: domain.items }]).map((group, i) => <div key={i}>
            {group.title && <h3>{group.title}</h3>}
            {group.items.map(item => <Link key={item.to} to={item.to}>{item.label}</Link>)}
          </div>)}
        </section>)}
        <Link to="/en" lang="en">English</Link>
      </nav>
    </details>
    <span className="forest-free"><Heart fill="currentColor" size={23} />הכל בחינם!</span>
    <nav className="forest-main-links" aria-label="ניווט ראשי">{doors.map(([to, title, Icon]) => <Link key={to} to={to}><Icon size={26} strokeWidth={2.4} /><span>{title}</span></Link>)}</nav>
    <form className="forest-nav-search" role="search" onSubmit={event => {
      event.preventDefault()
      const query = new FormData(event.currentTarget).get('q').trim()
      navigate('/search' + (query ? '?q=' + encodeURIComponent(query) : ''))
    }}>
      <input name="q" type="search" aria-label="חיפוש משחק או דף עבודה" placeholder="חפשו משחק, דף עבודה ועוד..." />
      <button type="submit" aria-label="חיפוש"><Search size={23} /></button>
    </form>
  </header>
}
