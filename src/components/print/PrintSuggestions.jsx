import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { recommendPrintables } from '../../data/printablesCatalog'
import { trackPrintEvent } from '../../utils/printEvents'
import './print-suggest.css'

// "Already printing? Maybe also…" — two small links shown after the print dialog opened or a PDF was
// saved, never before. A small card at the bottom on phones and in the corner on larger screens. It opens as a
// popover so it sits above an open print preview without blocking it, and it is hidden from the printed page.
export default function PrintSuggestions({ detail, onFinish }) {
  const dialog = useRef(null)
  const items = useMemo(() => recommendPrintables(detail.path, { search: detail.search || '', limit: 2 }), [detail])
  const done = useRef(false)
  const [host] = useState(() => document.querySelector('dialog.buga-print-dialog[open]'))
  const close = (reason, target) => {
    if (done.current) return
    done.current = true
    if (reason === 'clicked') trackPrintEvent('print_recommendation_clicked', { source_path: detail.path, target_path: target })
    else trackPrintEvent('print_recommendation_dismissed', { source_path: detail.path })
    if (!host) try { dialog.current?.hidePopover() } catch { /* unmounted by onFinish */ }
    onFinish({ shown: true, dismissed: reason !== 'clicked' })
  }
  useEffect(() => {
    if (!items.length) { onFinish({ shown: false }); return }
    const el = dialog.current
    // Never a modal: its invisible backdrop swallowed the next click, so the print preview's own
    // buttons seemed dead. Inside an open preview the card is rendered in it (anything outside a modal
    // is inert); elsewhere a manual popover keeps it on top while the page stays clickable.
    // (Browsers without popovers ignore the attribute and simply show the card.)
    if (!host) try { el?.showPopover() } catch { /* no popover support: already visible */ }
    trackPrintEvent('print_recommendation_shown', { source_path: detail.path, items: items.map(item => item.id).join(',') })
    const onKey = event => { if (event.key === 'Escape') close('dismissed') }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // Shown once per print; `close` and `onFinish` are stable for this sheet's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (!items.length) return null
  const card = <div ref={dialog} popover={host ? undefined : 'manual'} role="dialog" className="buga-suggest no-print" dir="rtl" aria-labelledby="buga-suggest-title">
    <div className="buga-suggest-box">
      <div className="buga-suggest-head">
        <h2 id="buga-suggest-title">כבר מדפיסים? 😊 אולי גם:</h2>
        <button type="button" className="buga-suggest-x" onClick={() => close('dismissed')} aria-label="לא תודה">✕</button>
      </div>
      <ul className="buga-suggest-list">{items.map(item => <li key={item.id}>
        <Link to={item.path} onClick={() => close('clicked', item.path)} title={item.desc}>
          <span aria-hidden="true">{item.emoji}</span><b>{item.title}</b><span className="buga-suggest-go">להדפסה ←</span>
        </Link>
      </li>)}</ul>
      <button type="button" className="buga-suggest-no" onClick={() => close('dismissed')}>לא תודה</button>
    </div>
  </div>
  return host ? createPortal(card, host) : card
}
