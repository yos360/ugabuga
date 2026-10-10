import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import RecentActivity from './RecentActivity'
import PrintQrFallback from './PrintQrFallback'
import WhatsAppShare from './WhatsAppShare'
import NoVoiceNotice from './NoVoiceNotice'

export default function Layout({ children }) {
  // Only mount RecentActivity AFTER hydration. The old `!window.__PRERENDER__`
  // check evaluated to false during Playwright prerender (widget omitted from
  // the snapshot) but to true in the browser (widget wanted on first render) —
  // that mismatch made React 19 bail out of hydration on every page, killing
  // every onClick handler in the tree. `mounted` is false on the very first
  // client render (matching the snapshot), then flips to true after useEffect
  // runs, so the widget mounts cleanly with no mismatch.
  const { pathname } = useLocation()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  // On printable pages, Ctrl/Cmd+P opens the site's own print preview and prints from it — the raw page
  // (thumbnails, buttons, settings) is not what anyone wants on paper.
  useEffect(() => {
    const onKey = e => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.key.toLowerCase() !== 'p' || document.querySelector('dialog[open]')) return
      const main = document.querySelector('[data-print-main]:not(:disabled)')
      if (!main) return
      e.preventDefault()
      main.click()
      setTimeout(() => document.querySelector('.buga-print-toolbar button:last-of-type')?.click(), 400)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  // The owner's mini widget is meant for a tiny window: no header, footer or floating buttons.
  if (pathname === '/admin/mini') return <main id="site-content">{children}</main>
  return (
    <>
      <ScrollToTop />
      <Navbar />
      {mounted && <RecentActivity />}
      {mounted && <PrintQrFallback />}
      {mounted && <WhatsAppShare />}
      {mounted && <NoVoiceNotice />}
      <p className="print-hint">🖨️ להדפסה של הדפים עצמם חזרו לעמוד באתר ולחצו על כפתור ההדפסה — כך כל דף יוצא נקי על A4 מלא.</p>
      <main id="site-content" tabIndex={-1} className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
