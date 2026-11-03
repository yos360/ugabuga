import { Component } from 'react'
import { useLocation } from 'react-router-dom'
import { recordPageError } from './RecentActivity'

// A deploy removes the previous build's chunks, so a page opened (or crawled) before it can fail to load
// its code. One reload fetches the new build; the session flag stops a reload loop.
const isChunkError = error => /dynamically imported module|importing a module script|ChunkLoad|Loading chunk|Loading CSS chunk/i.test(String(error?.message || error))
function reloadOnce() {
  try {
    const key = `chunk-reload:${window.location.pathname}`
    if (sessionStorage.getItem(key)) return false
    sessionStorage.setItem(key, '1')
  } catch { return false }
  window.location.reload()
  return true
}

// If one page crashes, show a friendly message inside the normal layout instead of a blank site.
// Keyed by path, so moving to another page starts fresh. The message is not an <h1>, so a search
// engine that renders a crashed page never takes it as the page's title.
class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error) {
    if (isChunkError(error) && reloadOnce()) return
    console.error('Page crashed:', error); recordPageError(error)
  }
  render() {
    if (!this.state.failed) return this.props.children
    if (this.props.en) return <div className="en-page"><h1>Something went wrong</h1><p>Please reload this page and try again.</p><button onClick={() => window.location.reload()}>Reload page</button><p><a href="/en">English home</a></p></div>
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center" dir="rtl">
        <p className="text-6xl mb-3" aria-hidden="true">🙈</p>
        <p className="text-3xl mb-3 font-bold" role="alert">אופס, משהו השתבש בעמוד הזה</p>
        <p className="mb-6 text-lg">נסו לטעון את העמוד מחדש. אם זה חוזר, ספרו לנו ונתקן.</p>
        <button type="button" onClick={() => window.location.reload()} className="rounded-2xl bg-pink-600 px-6 py-3 text-lg font-bold text-white">🔄 טעינה מחדש</button>
        <p className="mt-4"><a href="/" className="underline">לעמוד הבית</a></p>
      </div>
    )
  }
}

export default function PageErrorBoundary({ children }) {
  const { pathname } = useLocation()
  return <Boundary key={pathname} en={pathname === '/en' || pathname.startsWith('/en/')}>{children}</Boundary>
}
