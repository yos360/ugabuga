import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { recordPrintPreview } from './RecentActivity'
import '../ui/print-preview.css'

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
  useEffect(() => {
    let alive = true
    const url = `${window.location.origin}${pathname}?utm_source=qr&utm_medium=print`
    import('qrcode')
      .then(({ default: QRCode }) => QRCode.toString(url, { type: 'svg', margin: 0, color: { dark: '#181828', light: '#ffffff00' } }))
      .then(s => { if (alive) setSvg(s) })
      .catch(() => {})
    return () => { alive = false }
  }, [pathname])
  useEffect(() => {
    // Count direct prints too (PrintPreview already records its own).
    const onBeforePrint = () => { if (!document.getElementById('buga-print-output')) recordPrintPreview() }
    window.addEventListener('beforeprint', onBeforePrint)
    return () => window.removeEventListener('beforeprint', onBeforePrint)
  }, [])
  if (!svg) return null
  return createPortal(
    <div className="buga-print-fallback" aria-hidden="true">
      <div className="buga-qr" dangerouslySetInnerHTML={{ __html: `${svg}<span class="buga-qr-label">סרקו לעוד<br/>ugabuga.co.il<span class="buga-qr-credit">נוצר ללא עלות בעוגה בוגה</span></span>` }} />
    </div>,
    document.body,
  )
}
