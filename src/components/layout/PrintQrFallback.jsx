import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { recordPrintPreview } from './RecentActivity'
import { announcePrint } from '../../utils/printEvents'
import '../ui/print-preview.css'
import { pickQrVariant, qrUrl } from '../../data/printMessages'
import { recordQrVariant } from '../../utils/qrVariants'
import { recordExperiment } from '../../utils/experiments'

// Pages that print with a plain window.print() (or Ctrl+P) don't go through
// PrintPreview, so they never got the QR stamp. This badge lives on every page,
// hidden on screen and shown only in print, at the top-left corner of the
// first printed page (see print-preview.css). When PrintPreview is open, the
// existing `body:has(#buga-print-output)>*:not(#buga-print-output)` print rule
// hides this badge, so pages printed through PrintPreview keep their own stamp.
// The QR is generated ahead of time (per route), because a beforeprint handler
// can't wait for async work before the browser snapshots the page.
export default function PrintQrFallback() {
  const { pathname } = useLocation()
  const [svg, setSvg] = useState('')
  // One rotating message per page visit (see printMessages.js); English pages keep the plain badge.
  const [variant, setVariant] = useState(null)
  useEffect(() => {
    let alive = true
    const v = pathname.startsWith('/en') ? null : pickQrVariant()
    setVariant(v)
    const url = v ? qrUrl(window.location.origin, pathname, v) : `${window.location.origin}${pathname}?utm_source=qr&utm_medium=print`
    import('qrcode')
      .then(({ default: QRCode }) => QRCode.toString(url, { type: 'svg', margin: 0, color: { dark: '#181828', light: '#ffffff00' } }))
      .then(s => { if (alive) setSvg(s) })
      .catch(() => {})
    return () => { alive = false }
  }, [pathname])
  useEffect(() => {
    // Count direct prints too (PrintPreview already records its own).
    const onBeforePrint = () => { if (!document.getElementById('buga-print-output')) { recordPrintPreview(); recordExperiment('print'); const v = document.querySelector('.buga-print-fallback')?.dataset.variant; if (v) recordQrVariant(v, 'printed', window.location.pathname) } }
    // Direct prints get the same "what else to print" suggestion as PrintPreview, after the dialog closes.
    const onAfterPrint = () => { if (!document.getElementById('buga-print-output')) announcePrint('print') }
    window.addEventListener('beforeprint', onBeforePrint)
    window.addEventListener('afterprint', onAfterPrint)
    return () => { window.removeEventListener('beforeprint', onBeforePrint); window.removeEventListener('afterprint', onAfterPrint) }
  }, [])
  if (!svg) return null
  return createPortal(
    <div className="buga-print-fallback" aria-hidden="true" data-variant={variant?.id || undefined}>
      <div className="buga-qr" dangerouslySetInnerHTML={{ __html: variant ? `${svg}<span class="buga-qr-label">${variant.title}<span class="buga-qr-credit">${variant.line}</span></span>` : `${svg}<span class="buga-qr-label">🎂 עוגה בוגה — עוד דפי עבודה,<br/>צביעה ומשחקים בחינם<span class="buga-qr-credit">חפשו „עוגה בוגה” · ugabuga.co.il</span></span>` }} />
    </div>,
    document.body,
  )
}
