import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import RecentActivity from './RecentActivity'

export default function Layout({ children }) {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="site-beta-notice" role="status">
        <span>🛠️ האתר עדיין בהרצה ומשתפר כל הזמן.</span>
        <span>נשמח לשמוע על רעיונות, שיפורים או תקלות.</span>
        <a href="mailto:hello@ugabuga.co.il">שלחו לנו משוב</a>
      </div>
      {!window.__PRERENDER__ && <RecentActivity />}
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
