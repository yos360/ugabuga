import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { advanceNavigationHistory, createNavigationHistory, internalNavigationHref } from '../../utils/navigationHistory'

const NavigationContext = createContext(null)
const STORE = 'buga-return-routes'
const readSources = () => {
  try { return JSON.parse(sessionStorage.getItem(STORE) || '{}') || {} } catch { return {} }
}
const restoreSource = key => readSources()[key]

export function NavigationHistoryProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const type = useNavigationType()
  const [ready, setReady] = useState(false)
  const [history, setHistory] = useState(() => {
    const state = typeof window === 'undefined' ? null : window.history.state
    return createNavigationHistory(location, Number.isSafeInteger(state?.idx) ? state.idx : 0, state?.bugaReturn || restoreSource(location.key))
  })
  useEffect(() => {
    // Content also contains ordinary anchors. Keep internal page links in the same router history.
    const followInternalLink = event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = event.target.closest?.('a[href]')
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self') || link.relList.contains('external') || link.hasAttribute('data-full-page')) return
      const href = internalNavigationHref(link.getAttribute('href'), window.location.href)
      if (!href) return
      event.preventDefault()
      navigate(href)
    }
    document.addEventListener('click', followInternalLink)
    return () => document.removeEventListener('click', followInternalLink)
  }, [navigate])
  useLayoutEffect(() => {
    const state = window.history.state
    const index = Number.isSafeInteger(state?.idx) ? state.idx : 0
    setHistory(previous => advanceNavigationHistory(previous, location, type, index, state?.bugaReturn || restoreSource(location.key)))
    setReady(true)
  }, [location, type])
  useLayoutEffect(() => {
    if (!ready || history.current.key !== location.key) return
    try {
      // Preserve the router's state. Each entry keeps its own source across reloads and POP.
      window.history.replaceState({ ...window.history.state, bugaReturn: history.current.from }, '')
    } catch { /* Navigation still works when history state cannot be updated. */ }
    try {
      const sources = readSources()
      const source = history.current.from
      // Shared/private route capabilities stay in history memory, never in the saved map.
      if (source && !/^\/(?:r|l|t|q|w|g|play|live|admin|account)(?:\/|$)/.test(source.pathname)) sources[location.key] = source
      else delete sources[location.key]
      const keys = Object.keys(sources)
      for (const key of keys.slice(0, Math.max(0, keys.length - 60))) delete sources[key]
      sessionStorage.setItem(STORE, JSON.stringify(sources))
    } catch { /* Private browsing may disable session storage. */ }
  }, [history, location.key, ready])
  const current = ready && history.current.key === location.key ? history.current : null
  return <NavigationContext.Provider value={current}>{children}</NavigationContext.Provider>
}

export const useBackNavigation = () => useContext(NavigationContext)
