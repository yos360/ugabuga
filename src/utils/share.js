// WhatsApp sharing used across the site. Every share is counted in the private
// owner report (/admin/activity) as action "share" on the page it came from.
export const SITE = 'https://ugabuga.co.il'

export function shareLink(path, campaign = 'site', source = 'whatsapp') {
  const clean = String(path || '/').split(/[?#]/)[0] || '/'
  return `${SITE}${clean}?utm_source=${source}&utm_medium=share&utm_campaign=${encodeURIComponent(campaign)}`
}

// `channel`: whatsapp / facebook / native (the phone's share sheet) / copy / email. It records a
// click — Facebook and WhatsApp never report whether a post was actually published. 'native_done'
// is the one completed share a site can know: the share sheet resolved after the visitor sent it.
export function countShare(channel = null) {
  import('./liveActivity').then(m => {
    if (channel !== 'native_done') m.recordActivity('share', m.activityForPath(location.pathname))
    m.logEvent('share', location.pathname, null, channel)
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
    window.open = function (url, ...rest) { if (isShareUrl(url)) countShare('whatsapp'); return open.call(window, url, ...rest) }
  } catch { /* ignore */ }
  document.addEventListener('click', e => {
    const a = e.target instanceof Element ? e.target.closest('a[href]') : null
    if (a && e.isTrusted && isShareUrl(a.getAttribute('href'))) countShare('whatsapp')
  }, true)
  try {
    if (navigator.share) {
      const share = navigator.share.bind(navigator)
      navigator.share = data => { countShare('native'); const done = share(data); void Promise.resolve(done).then(() => countShare('native_done'), () => {}); return done }
    }
  } catch { /* ignore */ }
}
installShareCounter()

// Who a page is most useful to — decides the invitation to share and the WhatsApp message.
const TEACHER = /^\/(classroom|learn|discover)(\/|$)|^\/games\/(kindergarten|kita-a|classroom|icebreaker)|^\/printables\/(math|hebrew-letters|abc-letters|letter-flashcards|numbers|lined-paper|grid-paper|graph-paper|dot-paper|english-lines|clock|fraction|allergy-signs|classroom-signs|name-tags|certificates|class-schedule|word-tracing|count-and-write|complete-pattern|cut-and-order|dot-to-dot)/
const PRINTABLE = /^\/printables(\/|$)|^\/(abc|animals)(\/|$)/
const PARENT = /^\/(food|family|music|birthday|ideas|gifts|calculator|invitation|greeting|treasure-hunt)(\/|$)/
export function shareAudience(pathname = '/') {
  const p = String(pathname)
  if (TEACHER.test(p)) return { key: 'teachers', invite: 'עזר לך? שתפו עם עוד מורות וגננות 💛', button: 'שליחה למורות ולגננות', intro: 'מצאתי בעוגה בוגה משהו מעולה לכיתה ולגן — בחינם. שווה להעביר לצוות 👇' }
  if (PRINTABLE.test(p)) return { key: 'printables', invite: 'מכירים עוד הורים, מורות או גננות שזה יעזור להם? שתפו 💛', button: 'שליחה בוואטסאפ', intro: 'דפים להדפסה בחינם בעוגה בוגה — שווה לשלוח להורים ולצוות 👇' }
  if (PARENT.test(p)) return { key: 'parents', invite: 'מכירים עוד הורים שזה יעזור להם? שתפו 💛', button: 'שליחה להורים', intro: 'מצאתי בעוגה בוגה משהו שימושי להורים — בחינם 👇' }
  return { key: 'all', invite: 'אהבתם? שתפו עם חברים 💛', button: 'שליחה בוואטסאפ', intro: 'מצאתי בעוגה בוגה — שווה להציץ 👇' }
}
export const pageTitle = () => (document.title || 'עוגה בוגה').replace(/\s*\|\s*(UGABUGA|עוגה בוגה)\s*$/, '')
export function sharePage(pathname, campaign) {
  const title = pageTitle()
  shareOnWhatsApp(`${title}\n${shareAudience(pathname).intro}\n${shareLink(pathname, campaign)}`)
}

// Facebook's share dialog for a page (Facebook reads the page's own title, description and image).
// Counted as a click: Facebook doesn't tell the site whether the post was published.
export function shareOnFacebook(pathname = location.pathname, campaign = 'site') {
  countShare('facebook')
  try { window.gtag?.('event', 'facebook_share_click', { page_path: pathname, share_channel: 'facebook', method: 'sharer' }) } catch { /* ignore */ }
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink(pathname, campaign, 'facebook'))}`, '_blank', 'noopener,noreferrer')
}

export function shareOnWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer') // counted by installShareCounter
}
