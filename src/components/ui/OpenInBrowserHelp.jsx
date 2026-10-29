import { useState } from 'react'
import { isAndroid, isIos, chromeIntentUrl } from '../../utils/pdfLink'

// Shown instead of a PDF download link inside in-app browsers (WhatsApp, Facebook, Instagram…) that
// cannot save files. Always links to the real page, never to a blob: URL.
export default function OpenInBrowserHelp({ en = false }) {
  const [copied, setCopied] = useState(false)
  const ua = navigator.userAgent || ''
  const page = location.origin + location.pathname + location.search
  const intent = isAndroid(ua) ? chromeIntentUrl(page) : null
  async function copy() {
    try { await navigator.clipboard.writeText(page); setCopied(true) } catch {
      const t = document.createElement('textarea'); t.value = page; document.body.appendChild(t); t.select()
      try { document.execCommand('copy'); setCopied(true) } catch { /* ignore */ }
      t.remove()
    }
  }
  return (
    <div className="buga-print-tip" role="status" dir={en ? 'ltr' : 'rtl'}>
      <strong>{en ? 'To save a PDF, open this page in Chrome or Safari' : 'כדי לשמור PDF צריך לפתוח את הדף בכרום או בספארי'}</strong>
      {' '}{en ? '(the Print button still works here).' : '(כפתור ההדפסה ממשיך לעבוד גם כאן).'}
      {intent && <> <a href={intent} className="buga-print-btn">{en ? 'Open in Chrome' : 'פתיחה בכרום'}</a></>}
      {isIos(ua) && <span> {en ? 'Tap ⋯ → Open in Safari.' : 'לוחצים ⋯ ← פתיחה בספארי.'}</span>}
      {!intent && <span> {en ? 'Open the browser menu and choose "Open in browser".' : 'אפשר גם בתפריט ⋮ ← "פתיחה בדפדפן".'}</span>}
      {' '}<button type="button" onClick={copy}>{copied ? (en ? 'Copied ✓' : 'הועתק ✓') : (en ? 'Copy page link' : 'העתקת קישור לדף')}</button>
    </div>
  )
}
