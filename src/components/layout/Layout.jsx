import { lazy, Suspense, useEffect, useState } from 'react'
import SponsorBanner from '../ui/SponsorBanner'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import ReturnNavigation from './ReturnNavigation'
const EnglishLayout = lazy(() => import('../../en/EnglishLayout'))
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import RecentActivity from './RecentActivity'
import PrintQrFallback from './PrintQrFallback'
import PrintFollowUp from '../print/PrintFollowUp'
import WhatsAppShare from './WhatsAppShare'
import NoVoiceNotice from './NoVoiceNotice'
import PrintPreviewFigure from './PrintPreviewFigure'
const SiteChatWidget = lazy(() => import('../chat/SiteChatWidget'))

// Lazy: its situation table (greetings, combos) should not ride in the main bundle.
const EmojiRelated = lazy(() => import('../../emoji/EmojiRelated'))
import PresentMode from './PresentMode'
import { usePresentMode } from '../../utils/presentMode'
import { creatorTool, installCreationCapture } from '../../utils/creations'
import { KidsLockGate } from './KidsLock'
import ReportContent, { isUgcPath } from './ReportContent'

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
  // The chat widget loads on the home page; anywhere else it loads the first time a page asks to open
  // it ("send us a request" buttons), and gets that request once it's ready.
  const [chatWanted, setChatWanted] = useState(false)
  useEffect(() => {
    const want = event => { if (!document.querySelector('.site-chat')) window.__bugaChatPending = event.detail || {}; setChatWanted(true) }
    window.addEventListener('buga-chat-open', want)
    return () => window.removeEventListener('buga-chat-open', want)
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
  if (pathname === '/en' || pathname.startsWith('/en/')) return <Suspense fallback={<main id="site-content" lang="en" dir="ltr" role="status">Loading…</main>}><EnglishLayout>{children}</EnglishLayout></Suspense>
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
      {mounted && !presenting && (pathname === '/' || chatWanted) && <Suspense fallback={null}><SiteChatWidget /></Suspense>}
      <main id="site-content" tabIndex={-1} className="min-h-screen">{!presenting && <ReturnNavigation />}{mounted ? <KidsLockGate>{children}</KidsLockGate> : children}</main>
      {mounted && !presenting && isUgcPath(pathname) && <ReportContent />}
      {/* Personal tools send what was created to the owner's report: say so where it happens. */}
      {mounted && creatorTool(pathname) && <p className="no-print no-present mx-auto max-w-3xl px-4 pb-6 text-center text-xs text-[var(--muted-foreground)]">✍️ מה שיוצרים כאן נשמר אצלנו (בלי מספרי טלפון וכתובות) כדי לשפר את הכלים, ונמחק אחרי 90 יום. <a href="/privacy" className="underline">מדיניות הפרטיות</a></p>}
      {!presenting && <Suspense fallback={null}><EmojiRelated pathname={pathname} /></Suspense>}
      <PrintPreviewFigure pathname={pathname} />
      {/* Sponsored card on matching topic pages (the home page places its own between sections). */}
      {mounted && !presenting && pathname !== '/' && <div className="px-4"><SponsorBanner /></div>}
      {!presenting && <Footer />}
    </>
  )
}
