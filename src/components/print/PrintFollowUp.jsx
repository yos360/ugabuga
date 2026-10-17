import { lazy, Suspense, useEffect, useState } from 'react'
import { mayOffer, PRINT_DONE_EVENT, readOfferMemory, writeOfferMemory } from '../../utils/printEvents'

// Mounted once in the layout. It stays a few lines until something is printed: only then is the
// suggestions sheet (and the printables catalog behind it) loaded.
const PrintSuggestions = lazy(() => import('./PrintSuggestions'))

export default function PrintFollowUp() {
  const [detail, setDetail] = useState(null)
  useEffect(() => {
    const onPrint = event => {
      const next = event.detail || {}
      if (!next.path || !mayOffer(next.path)) return
      setDetail(current => current || next)
    }
    window.addEventListener(PRINT_DONE_EVENT, onPrint)
    return () => window.removeEventListener(PRINT_DONE_EVENT, onPrint)
  }, [])
  if (!detail) return null
  const finish = ({ shown, dismissed }) => {
    const memory = readOfferMemory()
    if (shown) writeOfferMemory({ ...memory, dismissed: memory.dismissed || dismissed, count: (memory.count || 0) + 1, paths: [...new Set([...(memory.paths || []), detail.path])] })
    setDetail(null)
  }
  return <Suspense fallback={null}><PrintSuggestions detail={detail} onFinish={finish} /></Suspense>
}
