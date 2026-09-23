import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Tells the self-heal script in index.html that the app code loaded and is running.
window.__UGA_BOOTED__ = true

const rootElement = document.getElementById('root')
// The initial HTML is complete for crawlers. On startup Helmet takes ownership
// so static tags cannot remain alongside metadata for a different route.
document.head.querySelectorAll('title, meta[name="description"], meta[name="robots"], link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"]').forEach(tag => tag.remove())
rootElement.dataset.appBuild = '2026-09-21-seo-prerender'
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
