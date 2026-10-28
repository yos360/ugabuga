import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { NO_SPONSOR } from '../../data/sponsors'
import { CHANNEL_GO } from '../../data/brand'

// A slim invitation to the WhatsApp channel at the top of the page — only for visitors who came back on
// another day (the visit-day counter liveActivity keeps on this device), never on a first visit or in the
// kids zone. Closing it hides it for 30 days. Hidden in print and in classroom projection.
const HIDE_KEY = 'buga-channel-bar-hidden'
const returning = () => { try { return Number(JSON.parse(localStorage.getItem('buga-visit-days') || 'null')?.n) >= 2 } catch { return false } }
const hidden = () => { try { return Number(localStorage.getItem(HIDE_KEY) || 0) > Date.now() } catch { return false } }
const skip = path => ['/whatsapp', '/request'].includes(path) || NO_SPONSOR.some(p => path === p || path.startsWith(`${p}/`))

export default function ChannelBar() {
  const { pathname } = useLocation()
  const [show, setShow] = useState(() => returning() && !hidden())
  if (!show || skip(pathname)) return null
  const close = () => { try { localStorage.setItem(HIDE_KEY, String(Date.now() + 30 * 864e5)) } catch { /* ignore */ } setShow(false) }
  return <div className="no-print no-present flex items-center justify-center gap-2 bg-[#e7f8ee] px-3 py-1.5 text-sm text-emerald-950" dir="rtl">
    <a href={CHANNEL_GO} target="_blank" rel="noopener" className="flex min-h-[40px] items-center gap-1">📲 דף חדש כל יום בוואטסאפ, בחינם — <b className="underline">הצטרפו לערוץ</b></a>
    <button type="button" onClick={close} aria-label="סגירת ההזמנה לערוץ" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg hover:bg-emerald-100">×</button>
  </div>
}
