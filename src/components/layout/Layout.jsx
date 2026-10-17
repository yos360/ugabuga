import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import EnglishLayout from '../../en/EnglishLayout'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import RecentActivity from './RecentActivity'
import PrintQrFallback from './PrintQrFallback'
import PrintFollowUp from '../print/PrintFollowUp'
import WhatsAppShare from './WhatsAppShare'
import NoVoiceNotice from './NoVoiceNotice'
import PrintPreviewFigure from './PrintPreviewFigure'
import SiteChatWidget from '../chat/SiteChatWidget'

// Lazy: its situation table (greetings, combos) should not ride in the main bundle.
const EmojiRelated = lazy(() => import('../../emoji/EmojiRelated'))
import PresentMode from './PresentMode'
import { usePresentMode } from '../../utils/presentMode'
import { creatorTool, installCreationCapture } from '../../utils/creations'

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
  const { on: presenting } = usePresentMode()
  useEffect(() => {
    setMounted(true)
    installCreationCapture()
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
  // A live game is a focused, full-screen experience on phones and projectors.
  // Keep the site navigation, newsletter and footer outside the host/player session.
  if (/^\/(?:play\/[^/]+|live\/[^/]+\/host|en\/play\/[^/]+|en\/live\/[^/]+\/host)\/?$/.test(pathname)) {
    return <><ScrollToTop /><main id="site-content" tabIndex={-1}>{children}</main></>
  }
  if (pathname === '/en' || pathname.startsWith('/en/')) return <EnglishLayout>{children}</EnglishLayout>
  // The owner's mini widget is meant for a tiny window: no header, footer or floating buttons.
  // Widgets embedded on other sites (/embed/timer…): just the widget. The gallery is /embed itself.
  if (pathname === '/admin/mini' || pathname.startsWith('/embed/')) return <main id="site-content">{children}</main>
  return (
    <>
      {/* Classroom projection: only the page itself (see utils/presentMode.js). */}
      {mounted && <PresentMode />}
      {!presenting && <ScrollToTop />}
      {!presenting && <Navbar />}
      {mounted && !presenting && <RecentActivity />}
      {mounted && <PrintQrFallback />}
      {mounted && <PrintFollowUp />}
      {/* /kids is for a child browsing alone: no share button there. */}
      {mounted && !presenting && !/^\/kids\/?$/.test(pathname) && <WhatsAppShare />}
      {mounted && <NoVoiceNotice />}
      {mounted && !presenting && !/^\/(admin|embed|kids|play)(\/|$)/.test(pathname) && !/^\/live\/[^/]+\/host/.test(pathname) && <SiteChatWidget />}
      <main id="site-content" tabIndex={-1} className="min-h-screen">{children}</main>
      {/* Personal tools send what was created to the owner's report: say so where it happens. */}
      {mounted && creatorTool(pathname) && <p className="no-print no-present mx-auto max-w-3xl px-4 pb-6 text-center text-xs text-[var(--muted-foreground)]">✍️ מה שיוצרים כאן נשמר אצלנו (בלי מספרי טלפון וכתובות) כדי לשפר את הכלים, ונמחק אחרי 90 יום. <a href="/privacy" className="underline">מדיניות הפרטיות</a></p>}
      {!presenting && <Suspense fallback={null}><EmojiRelated pathname={pathname} /></Suspense>}
      <PrintPreviewFigure pathname={pathname} />
      {!presenting && <Footer />}
    </>
  )
}
