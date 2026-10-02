import { Component } from 'react'
import { useLocation } from 'react-router-dom'

// If one page crashes, show a friendly message inside the normal layout instead of a blank site.
// Keyed by path, so moving to another page starts fresh.
class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error) { console.error('Page crashed:', error) }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center" dir="rtl">
        <p className="text-6xl mb-3" aria-hidden="true">🙈</p>
        <h1 className="text-3xl mb-3">אופס, משהו השתבש בעמוד הזה</h1>
        <p className="mb-6 text-lg">נסו לטעון את העמוד מחדש. אם זה חוזר, ספרו לנו ונתקן.</p>
        <button type="button" onClick={() => window.location.reload()} className="rounded-2xl bg-pink-600 px-6 py-3 text-lg font-bold text-white">🔄 טעינה מחדש</button>
        <p className="mt-4"><a href="/" className="underline">לעמוד הבית</a></p>
      </div>
    )
  }
}

export default function PageErrorBoundary({ children }) {
  const { pathname } = useLocation()
  return <Boundary key={pathname}>{children}</Boundary>
}
