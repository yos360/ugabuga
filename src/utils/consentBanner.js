// Cookie consent (Israeli Privacy Protection Law, amendment 13). Until the visitor agrees, Google Analytics
// runs in consent mode without cookies (index.html sets the default) and session recording never starts.
// The choice is kept in localStorage as 'yes' / 'no'. Plain DOM so it never weighs on the entry bundle.
export const CONSENT_KEY = 'buga-consent'

export function getConsent() {
  try { return localStorage.getItem(CONSENT_KEY) } catch { return null }
}

export function setConsent(value) {
  try { localStorage.setItem(CONSENT_KEY, value) } catch { /* private mode: asked again next visit */ }
  if (value === 'yes') window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
  dispatchEvent(new CustomEvent('buga:consent', { detail: value }))
}

const CSS = `.buga-consent{position:fixed;inset-inline:12px;bottom:12px;z-index:60;max-width:560px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:12px 14px;border:2px solid #1d2233;border-radius:18px;background:#fff;color:#1d2233;box-shadow:0 8px 28px rgba(0,0,0,.18);font-size:15px;line-height:1.45;direction:rtl}
.buga-consent p{margin:0;flex:1 1 260px}.buga-consent a{color:inherit;font-weight:700;text-decoration:underline}
.buga-consent button{min-height:40px;border-radius:12px;padding:0 14px;font:inherit;font-weight:800;cursor:pointer;border:2px solid #1d2233}
.buga-consent .yes{background:#7a5af8;color:#fff;border-color:#7a5af8}.buga-consent .no{background:#fff;color:#1d2233}
@media print{.buga-consent{display:none}}`

export function showConsentBanner() {
  if (getConsent() || document.querySelector('.buga-consent')) return
  const style = document.createElement('style')
  style.textContent = CSS
  const box = document.createElement('div')
  box.className = 'buga-consent no-print'
  box.setAttribute('role', 'region')
  box.setAttribute('aria-label', 'הסכמה לעוגיות')
  box.innerHTML = '<p>🍪 אנחנו משתמשים בעוגיות סטטיסטיקה אנונימיות כדי להבין מה עובד באתר ולשפר אותו. לא אוספים פרטים אישיים ולא מציגים פרסומות מותאמות. <a href="/privacy">מדיניות הפרטיות</a></p>'
    + '<button type="button" class="yes">מאשר</button><button type="button" class="no">רק הכרחי</button>'
  const close = value => () => { setConsent(value); box.remove(); style.remove() }
  box.querySelector('.yes').addEventListener('click', close('yes'))
  box.querySelector('.no').addEventListener('click', close('no'))
  document.head.appendChild(style)
  document.body.appendChild(box)
}
