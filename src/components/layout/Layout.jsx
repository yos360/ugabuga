import { useEffect, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import RecentActivity from './RecentActivity'
import PrintQrFallback from './PrintQrFallback'

const FEEDBACK_KEY = 'buga-feedback-dismissed'

function readDismissed() {
  try { return localStorage.getItem(FEEDBACK_KEY) === '1' } catch { return false }
}

export default function Layout({ children }) {
  // Only mount RecentActivity AFTER hydration. The old `!window.__PRERENDER__`
  // check evaluated to false during Playwright prerender (widget omitted from
  // the snapshot) but to true in the browser (widget wanted on first render) —
  // that mismatch made React 19 bail out of hydration on every page, killing
  // every onClick handler in the tree. `mounted` is false on the very first
  // client render (matching the snapshot), then flips to true after useEffect
  // runs, so the widget mounts cleanly with no mismatch.
  const [mounted, setMounted] = useState(false)
  const [feedbackDismissed, setFeedbackDismissed] = useState(false)
  useEffect(() => {
    setMounted(true)
    setFeedbackDismissed(readDismissed())
  }, [])
  const dismissFeedback = () => {
    setFeedbackDismissed(true)
    try { localStorage.setItem(FEEDBACK_KEY, '1') } catch { /* storage unavailable */ }
  }
  return (
    <>
      <ScrollToTop />
      <Navbar />
      {!feedbackDismissed && (
        <div className="site-beta-notice" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'nowrap', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>💛 יש לכם רעיון למשחק או משוב? <a href="mailto:hello@ugabuga.co.il">שלחו לנו משוב</a></span>
          <button type="button" onClick={dismissFeedback} aria-label="סגירת הודעת המשוב" style={{ flex: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '6px 10px' }}>✕</button>
        </div>
      )}
      {mounted && <RecentActivity />}
      {mounted && <PrintQrFallback />}
      <main id="site-content" tabIndex={-1} className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
