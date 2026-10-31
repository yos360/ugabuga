// Session-recording chunks travel and rest as gzip + base64 text (about a tenth of the raw rrweb JSON).

async function pipe(bytes, transform) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(transform)).arrayBuffer())
}

export async function packEvents(events) {
  const bytes = await pipe(new TextEncoder().encode(JSON.stringify(events)), new CompressionStream('gzip'))
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

export async function unpackEvents(text) {
  const binary = atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return JSON.parse(new TextDecoder().decode(await pipe(bytes, new DecompressionStream('gzip'))))
}

// All chunks of one visit, back in time order (a chunk that fails to decode is skipped, not fatal).
export async function unpackSession(chunks) {
  const parts = await Promise.all(chunks.map(chunk => unpackEvents(chunk).catch(() => [])))
  return parts.flat().sort((a, b) => a.timestamp - b.timestamp)
}
