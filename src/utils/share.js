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

export function shareOnWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  countShare()
}
