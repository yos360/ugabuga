// Pure helpers for the QR treasure hunt: each station's QR carries only that
// station's clue (plus its position), so codes stay small and players cannot
// read the other clues by editing the link.

export const MAX_STOPS = 8
export const MAX_TITLE = 80
export const MAX_CLUE = 160
// Byte-mode capacity of the largest QR (version 40) at error correction level M
export const QR_MAX_BYTES = 2331
// Above this the code gets dense and harder to scan from a small printout
export const QR_COMFORT_BYTES = 900

export const clean = value => String(value || '').replace(/\s+/g, ' ').trim()

export const encodePayload = value => {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const decodePayload = value => {
  try {
    const raw = String(value || '').replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(raw + '='.repeat((4 - raw.length % 4) % 4))
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0))))
  } catch { return null }
}

export const normalizeHunt = (title, clues) => ({
  title: clean(title).slice(0, MAX_TITLE) || 'ציד אוצרות',
  clues: clues.map(clean).filter(Boolean).slice(0, MAX_STOPS).map(clue => clue.slice(0, MAX_CLUE)),
})

// One token per station: { v: 2, t: title, i: index, n: total, c: clue }
export const stationTokens = (title, clues) => {
  const hunt = normalizeHunt(title, clues)
  return hunt.clues.map((clue, index) => encodePayload({ v: 2, t: hunt.title, i: index, n: hunt.clues.length, c: clue }))
}

export const stationUrl = (origin, token) => `${origin}/treasure-hunt/qr/play?s=${token}`

export const stationUrls = (origin, title, clues) => stationTokens(title, clues).map(token => stationUrl(origin, token))

export const qrBytes = text => new TextEncoder().encode(String(text)).length

export const qrSizeStatus = bytes => bytes > QR_MAX_BYTES ? 'too-big' : bytes > QR_COMFORT_BYTES ? 'dense' : 'ok'

// Reads either the new per-station link (?s=) or the old whole-hunt link (?hunt=&step=)
export const readStation = params => {
  const get = key => typeof params?.get === 'function' ? params.get(key) : params?.[key]
  const token = get('s')
  if (token) {
    const data = decodePayload(token)
    const index = Number(data?.i), total = Number(data?.n)
    if (!data || data.v !== 2 || typeof data.c !== 'string' || !Number.isInteger(index) || !Number.isInteger(total) || index < 0 || index >= total) return null
    return { title: String(data.t || 'ציד אוצרות'), clue: data.c, index, total }
  }
  const hunt = decodePayload(get('hunt'))
  const step = Math.max(0, Math.floor(Number(get('step')) || 0))
  if (!hunt || !Array.isArray(hunt.stops) || !hunt.stops[step]) return null
  return { title: String(hunt.title || 'ציד אוצרות'), clue: String(hunt.stops[step].clue || ''), index: step, total: hunt.stops.length }
}
