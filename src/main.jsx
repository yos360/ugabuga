import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Tells the self-heal script in index.html that the app code loaded and is running.
window.__UGA_BOOTED__ = true

const rootElement = document.getElementById('root')
// The initial HTML is complete for crawlers. On startup Helmet takes ownership
// so static tags cannot remain alongside metadata for a different route.
document.head.querySelectorAll('title, meta[name="description"], meta[name="robots"], link[rel="canonical"], link[rel="alternate"][hreflang], meta[property^="og:"], meta[name^="twitter:"]').forEach(tag => tag.remove())
rootElement.dataset.appBuild = '2026-09-21-seo-prerender'
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Once the page has settled: the cookie-consent bar (first visit only), and the sampled anonymous
// session recording for the owner's replays, which runs only after the visitor agreed.
const record = () => void import('./utils/sessionRecorder.js').then(m => m.startSessionRecording()).catch(() => {})
const afterLoad = () => (window.requestIdleCallback || setTimeout)(() => {
  void import('./utils/consentBanner.js').then(({ getConsent, showConsentBanner }) => {
    if (getConsent() === 'yes') return record()
    addEventListener('buga:consent', e => { if (e.detail === 'yes') record() }, { once: true })
    if (!window.__PRERENDER__ && !navigator.webdriver) showConsentBanner()
  }).catch(() => {})
})
if (document.readyState === 'complete') afterLoad()
else addEventListener('load', afterLoad, { once: true })
