// WhatsApp sharing used across the site. Every share is counted in the private
// owner report (/admin/activity) as action "share" on the page it came from.
export const SITE = 'https://ugabuga.co.il'

export function shareLink(path, campaign = 'site') {
  const clean = String(path || '/').split(/[?#]/)[0] || '/'
  return `${SITE}${clean}?utm_source=whatsapp&utm_medium=share&utm_campaign=${encodeURIComponent(campaign)}`
}

export function countShare() {
  import('./liveActivity').then(m => {
    m.recordActivity('share', m.activityForPath(location.pathname))
    m.logEvent('share')
  }).catch(() => {})
}

// A share = opening WhatsApp with ready text (wa.me/?text=…, no phone number) or the
// phone's own share sheet. Messages to a fixed number (contact us, a supplier) aren't shares.
export const isShareUrl = url => /^(https?:\/\/)?(wa\.me\/\?|api\.whatsapp\.com\/send\/?\?(?!.*phone=\d)|whatsapp:\/\/send\?(?!.*phone=\d))/i.test(String(url || '').trim())

// Pages share in many ways (window.open, plain <a href>, navigator.share). Counting
// them here, once for the whole site, means no share button can be missed.
function installShareCounter() {
  if (typeof window === 'undefined' || window.__bugaShareCounter) return
  window.__bugaShareCounter = true
  try {
    const open = window.open
    window.open = function (url, ...rest) { if (isShareUrl(url)) countShare(); return open.call(window, url, ...rest) }
  } catch { /* ignore */ }
  document.addEventListener('click', e => {
    const a = e.target instanceof Element ? e.target.closest('a[href]') : null
    if (a && e.isTrusted && isShareUrl(a.getAttribute('href'))) countShare()
  }, true)
  try {
    if (navigator.share) {
      const share = navigator.share.bind(navigator)
      navigator.share = data => { countShare(); return share(data) }
    }
  } catch { /* ignore */ }
}
installShareCounter()

export function shareOnWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer') // counted by installShareCounter
}
