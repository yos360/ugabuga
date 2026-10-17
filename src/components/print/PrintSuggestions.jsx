import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { recommendPrintables } from '../../data/printablesCatalog'
import { trackPrintEvent } from '../../utils/printEvents'
import './print-suggest.css'

// "Already printing? You might also like…" — shown after the print dialog opened or a PDF was saved,
// never before. A bottom sheet on phones, a small card on larger screens. It opens as a modal
// <dialog> so it sits above an open print preview, and it is hidden from the printed page.
export default function PrintSuggestions({ detail, onFinish }) {
  const dialog = useRef(null)
  const items = useMemo(() => recommendPrintables(detail.path, { search: detail.search || '', limit: 3 }), [detail])
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
        <div><h2 id="buga-suggest-title">כבר מדפיסים? 😊</h2><p>אולי תרצו להוסיף גם:</p></div>
        <button type="button" className="buga-suggest-x" onClick={() => close('dismissed')} aria-label="סגירה">✕</button>
      </div>
      <ul className="buga-suggest-list">{items.map(item => <li key={item.id}>
        <span className="buga-suggest-emoji" aria-hidden="true">{item.emoji}</span>
        <span className="buga-suggest-text"><b>{item.title}</b>{item.desc && <span>{item.desc}</span>}</span>
        <Link to={item.path} className="buga-suggest-go" onClick={() => close('clicked', item.path)}>פתחו והדפיסו</Link>
      </li>)}</ul>
      <button type="button" className="buga-suggest-no" onClick={() => close('dismissed')}>לא תודה</button>
    </div>
  </dialog>
}
