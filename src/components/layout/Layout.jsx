import { useEffect, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import RecentActivity from './RecentActivity'

export default function Layout({ children }) {
  // Only mount RecentActivity AFTER hydration. The old `!window.__PRERENDER__`
  // check evaluated to false during Playwright prerender (widget omitted from
  // the snapshot) but to true in the browser (widget wanted on first render) —
  // that mismatch made React 19 bail out of hydration on every page, killing
  // every onClick handler in the tree. `mounted` is false on the very first
  // client render (matching the snapshot), then flips to true after useEffect
  // runs, so the widget mounts cleanly with no mismatch.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="site-beta-notice" role="status">
        <span>🛠️ האתר עדיין בהרצה ומשתפר כל הזמן.</span>
        <span>נשמח לשמוע על רעיונות, שיפורים או תקלות.</span>
        <a href="mailto:hello@ugabuga.co.il">שלחו לנו משוב</a>
      </div>
      {mounted && <RecentActivity />}
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
