import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { sharePage, shareAudience } from '../../utils/share'
import './whatsapp-share.css'

// Floating "share on WhatsApp" button on every public page. It shares the page
// title + a clean link (utm-tagged, so visits that come back are counted as WhatsApp).
const HIDDEN = /^\/(admin|account|auth|login|q|l)(\/|$)|bring-list/

export function WhatsAppIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M16 3C8.8 3 3 8.6 3 15.6c0 2.5.8 4.9 2.1 6.9L3.6 29l6.8-1.7c1.7.9 3.6 1.4 5.6 1.4 7.2 0 13-5.6 13-12.6S23.2 3 16 3Zm0 23.3c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-4 1 1-3.8-.3-.4a10.3 10.3 0 0 1-1.7-5.9C5.5 10 10.2 5.4 16 5.4s10.5 4.6 10.5 10.3S21.8 26.3 16 26.3Zm5.8-7.7c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-1.9-.9-3.1-1.7-4.4-3.8-.3-.6.3-.5 1-1.8.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.8 5 2.2.9 3 1 4.1.8.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  )
}

// A small invitation bubble appears once per visit, on pages people tend to pass on (teachers,
// printables, parents), after they've had time to use the page. Closing it hides it for the visit.
const BUBBLE_KEY = 'buga-share-bubble'
function bubbleSeen() { try { return sessionStorage.getItem(BUBBLE_KEY) === '1' } catch { return true } }
function markBubble() { try { sessionStorage.setItem(BUBBLE_KEY, '1') } catch { /* ignore */ } }

export default function WhatsAppShare() {
  const { pathname } = useLocation()
  const audience = shareAudience(pathname)
  const [bubble, setBubble] = useState(false)
  useEffect(() => {
    setBubble(false)
    if (HIDDEN.test(pathname) || audience.key === 'all' || bubbleSeen()) return
    const t = setTimeout(() => { if (!bubbleSeen() && !document.querySelector('dialog[open]')) { setBubble(true); markBubble() } }, 25000)
    return () => clearTimeout(t)
  }, [pathname, audience.key])
  if (HIDDEN.test(pathname)) return null
  const share = () => { setBubble(false); sharePage(pathname, 'floating') }
  return <>
    {bubble && <div className="wa-bubble no-print" role="status" dir="rtl">
      <button type="button" className="wa-bubble-text" onClick={share}>{audience.invite}</button>
      <button type="button" className="wa-bubble-x" onClick={() => setBubble(false)} aria-label="סגירה">×</button>
    </div>}
    <button type="button" onClick={share} className="wa-fab no-print" aria-label={`שתפו את העמוד בוואטסאפ — ${audience.button}`} title={audience.invite}>
      <WhatsAppIcon />
      <span className="wa-fab-text">שתפו</span>
    </button>
  </>
}
