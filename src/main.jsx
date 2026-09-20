import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const rootElement = document.getElementById('root')
rootElement.dataset.appBuild = '2026-09-20-asset-routing-fix'
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
