const KEY = 'ugabuga-class-roster-v1'

export function cleanRosterNames(value) {
  const rows = Array.isArray(value) ? value : String(value || '').split(/\r?\n|,/)
  const seen = new Set()
  return rows.map(name => String(name).trim()).filter(name => {
    const key = name.toLocaleLowerCase('he-IL')
    if (!name || seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 100)
}

export function loadClassRoster() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    return { className: String(saved?.className || ''), names: cleanRosterNames(saved?.names) }
  } catch {
    return { className: '', names: [] }
  }
}

export function saveClassRoster(roster) {
  const next = { className: String(roster?.className || '').trim().slice(0, 80), names: cleanRosterNames(roster?.names) }
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('ugabuga:class-roster', { detail: next }))
  return next
}

export function clearClassRoster() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new CustomEvent('ugabuga:class-roster', { detail: { className: '', names: [] } }))
}
