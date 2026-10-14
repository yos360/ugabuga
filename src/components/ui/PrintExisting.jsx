import { useState } from 'react'
import PrintPreview from './PrintPreview'
import { printRules, snapshot, paginate } from '../../utils/existingPrint'
import './existing-print.css'

// Snapshot the current editor, including its field values/photos, without
// mounting a second editor or resetting its local state.
export default function PrintExisting({ selector, wrapper = '', title, children, ...buttonProps }) {
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function open() {
    setBusy(true); setError('')
    try {
      await document.fonts.ready
      const nodes = [...document.querySelectorAll(selector)].filter(n => !n.closest('dialog,#buga-print-output'))
      await Promise.allSettled(nodes.flatMap(n => [...n.querySelectorAll('img')]).map(img => img.decode()))
      const css = printRules(document.styleSheets)
      const pages = paginate(nodes.map(snapshot), wrapper, css)
      setPreview({ pages, css })
    } catch { setError('לא הצלחנו להכין את התצוגה. נסו שוב.') }
    finally { setBusy(false) }
  }
  return <><button {...buttonProps} type="button" data-print-main onClick={open} disabled={busy}>{children}</button>{error && <span role="alert">{error}</span>}
    {preview && <><style>{preview.css}</style><PrintPreview title={title || document.querySelector('h1')?.textContent || 'הדפסה'} onClose={() => setPreview(null)}>
      {preview.pages.map((html, i) => <article className="buga-a4 legacy-sheet" key={i}><div className="legacy-viewport"><div className="legacy-print" dangerouslySetInnerHTML={{ __html: html }} /></div></article>)}
    </PrintPreview></>}
  </>
}
