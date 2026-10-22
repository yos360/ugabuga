// Same-origin proxy to Dicta's free public Nakdan (automatic Hebrew vocalization). The browser can't
// call it directly: its CORS preflight fails. Nothing is stored; only the text is forwarded.
const DICTA = 'https://nakdan-2-0.loadbalancer.dicta.org.il/api'
const MAX = 3000
const answer = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })

export async function onRequest({ request }) {
  if (request.method !== 'POST') return answer({ error: 'method' }, 405)
  let text = ''
  try { text = String((await request.json()).text || '') } catch { return answer({ error: 'bad_request' }, 400) }
  text = text.slice(0, MAX)
  if (!/[א-ת]/.test(text)) return answer({ words: [] })
  try {
    const res = await fetch(DICTA, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'nakdan', genre: 'modern', data: text, addmorph: false, keepqq: false }), signal: AbortSignal.timeout(20000) })
    if (!res.ok) return answer({ error: 'upstream' }, 502)
    const data = await res.json()
    if (!Array.isArray(data)) return answer({ error: 'upstream' }, 502)
    // Keep only what the page needs: the word, whether it's a separator, and its vocalized options.
    return answer({ words: data.map(w => w.sep ? { t: w.word } : { t: w.word, o: (w.options || []).slice(0, 8).map(o => String(o).replace(/\|/g, '')), s: w.fconfident === false && (w.options || []).length > 1 }) })
  } catch { return answer({ error: 'upstream' }, 502) }
}
