import { useState } from 'react'
import { recordHelpful } from './RecentActivity'

// "האם זה עזר?" — one tap, no text. The answer is counted per page (no visitor id) and remembered in this
// browser so the question isn't asked again on the same page. Hidden when printing and in classroom mode.
const KEY = 'buga-helpful'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {} } catch { return {} } }

export default function PageFeedback({ pathname }) {
  const [vote, setVote] = useState(() => read()[pathname] || null)
  const choose = v => {
    setVote(v)
    try {
      const all = { ...read(), [pathname]: v }
      localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(Object.entries(all).slice(-100))))
    } catch { /* ignore */ }
    recordHelpful(v, pathname)
  }
  return <div className="no-print no-present pf-wrap" dir="rtl">
    <div className="pf" role="group" aria-label="האם זה עזר?">
      {vote
        ? <span className="pf-thanks" role="status">תודה! 💛 זה עוזר לנו לשפר</span>
        : <>
          <span>האם זה עזר?</span>
          <button type="button" onClick={() => choose('yes')} aria-label="כן, זה עזר">👍</button>
          <button type="button" onClick={() => choose('no')} aria-label="לא עזר">👎</button>
        </>}
    </div>
    <style>{`.pf-wrap{padding:6px 16px 18px;text-align:center}.pf{display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;padding:8px 16px;border:2px dashed var(--border);border-radius:999px;background:var(--card);color:var(--ink);font-size:15px;min-height:56px}
.pf button{width:48px;height:48px;border:2px solid var(--border);border-radius:50%;background:#fff;font-size:22px;line-height:1;cursor:pointer;transition:transform .12s,background .12s}.pf button:hover,.pf button:focus-visible{background:var(--postit);transform:scale(1.08)}.pf-thanks{font-weight:700}
@media print{.pf-wrap{display:none!important}}`}</style>
  </div>
}
