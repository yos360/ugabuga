// Store only route paths and history indexes; queries, fragments and form data stay out.
export function validReturnSource(source, index) {
  return source && typeof source.pathname === 'string' && /^\/(?!\/)/.test(source.pathname)
    && !/[?#\\\r\n]/.test(source.pathname) && Number.isSafeInteger(source.index)
    && source.index >= 0 && source.index < index ? { pathname: source.pathname, index: source.index } : null
}

export function createNavigationHistory(location, index = 0, restored = null) {
  const entry = { key: location.key, pathname: location.pathname, index, from: validReturnSource(restored, index) }
  return { current: entry, entries: { [entry.key]: entry } }
}

export function advanceNavigationHistory(history, location, type, index, restored = null) {
  const previous = history.current
  if (previous.key === location.key) return history
  const entries = { ...history.entries }
  let from = validReturnSource(restored, index)
  if (type === 'PUSH') {
    // Settings and full-screen overlays may add entries without leaving the page.
    from = previous.pathname === location.pathname ? previous.from : { pathname: previous.pathname, index: previous.index }
    for (const [key, entry] of Object.entries(entries)) if (entry.index >= index) delete entries[key]
  } else if (type === 'REPLACE') {
    from = previous.from
    delete entries[previous.key]
  } else if (entries[location.key]) {
    from = entries[location.key].from
  }
  const current = { key: location.key, pathname: location.pathname, index, from: validReturnSource(from, index) }
  entries[current.key] = current
  const keys = Object.keys(entries)
  for (const key of keys.slice(0, Math.max(0, keys.length - 60))) delete entries[key]
  return { current, entries }
}

export function internalNavigationHref(href, currentHref) {
  if (!href) return null
  try {
    const current = new URL(currentHref)
    const url = new URL(href, current)
    if (!/^https?:$/.test(url.protocol) || url.origin !== current.origin || /\.[a-z0-9]+$/i.test(url.pathname) || /^\/(?:api|assets|functions|rest)(?:\/|$)/.test(url.pathname)) return null
    return url.pathname + url.search + url.hash
  } catch { return null }
}
