import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { recommendPrintables } from '../../data/printablesCatalog'
import { trackPrintEvent } from '../../utils/printEvents'
import './print-suggest.css'

// "Already printing? Maybe also…" — two small links shown after the print dialog opened or a PDF was
// saved, never before. A small card at the bottom on phones and in the corner on larger screens. It opens as a modal
// <dialog> so it sits above an open print preview, and it is hidden from the printed page.
export default function PrintSuggestions({ detail, onFinish }) {
  const dialog = useRef(null)
  const items = useMemo(() => recommendPrintables(detail.path, { search: detail.search || '', limit: 2 }), [detail])
  const done = useRef(false)
  const close = (reason, target) => {
    if (done.current) return
    done.current = true
    if (reason === 'clicked') trackPrintEvent('print_recommendation_clicked', { source_path: detail.path, target_path: target })
    else trackPrintEvent('print_recommendation_dismissed', { source_path: detail.path })
    try { dialog.current?.close() } catch { /* already closed */ }
    onFinish({ shown: true, dismissed: reason !== 'clicked' })
  }
  useEffect(() => {
    if (!items.length) { onFinish({ shown: false }); return }
    const el = dialog.current
    try { el?.showModal() } catch { el?.setAttribute('open', '') }
    trackPrintEvent('print_recommendation_shown', { source_path: detail.path, items: items.map(item => item.id).join(',') })
    const onCancel = event => { event.preventDefault(); close('dismissed') }
    el?.addEventListener('cancel', onCancel)
    return () => el?.removeEventListener('cancel', onCancel)
    // Shown once per print; `close` and `onFinish` are stable for this sheet's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (!items.length) return null
  return <dialog ref={dialog} className="buga-suggest no-print" dir="rtl" aria-labelledby="buga-suggest-title" onClick={event => { if (event.target === dialog.current) close('dismissed') }}>
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
  </dialog>
}
