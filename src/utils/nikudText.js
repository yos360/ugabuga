// Adds nikud to Hebrew strings through the site's /api/nakdan proxy (Dicta's free Nakdan), taking the
// engine's first choice for every word. Strings are sent in batches joined by newlines (Dicta keeps
// newlines as separators), and results are cached for the visit.
const cache = new Map()
const SEP = '\n'
const MAX = 2800

async function batch(list) {
  const res = await fetch('/api/nakdan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: list.join(SEP) }) })
  const data = await res.json()
  if (!res.ok || !Array.isArray(data.words)) throw new Error('nakdan')
  const out = data.words.map(w => (w.o?.length ? w.o[0] : w.t)).join('').split(SEP)
  if (out.length !== list.length) throw new Error('nakdan')
  list.forEach((s, i) => cache.set(s, out[i]))
}

// Map of original → vocalized for every string given (already-vocalized cache hits are free).
export async function vocalizeAll(strings) {
  const todo = [...new Set(strings.filter(s => s && /[א-ת]/.test(s) && !cache.has(s) && !s.includes(SEP)))]
  let cur = [], len = 0
  for (const s of todo) {
    if (len + s.length + 1 > MAX && cur.length) { await batch(cur); cur = []; len = 0 }
    cur.push(s); len += s.length + 1
  }
  if (cur.length) await batch(cur)
  return new Map(strings.map(s => [s, cache.get(s) || s]))
}
