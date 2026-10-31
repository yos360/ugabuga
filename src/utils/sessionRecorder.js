// Anonymous, sampled session recording (rrweb) so the owner can replay how visitors use pages and games.
// Loaded after the page settles (main.jsx); rrweb itself is fetched only for a sampled visit.
// Privacy: every form field is masked, and whatever the visitor typed is also masked wherever it shows up
// on the page (a name on a worksheet, an invitation). Pages with other people's names are never recorded.
import { rpcUrl, rpcInit } from './qrVariants.js'
import { packEvents } from './recordingCodec.js'

export const SAMPLE_RATE = 0.05
const FLUSH_MS = 10000
const MAX_CHUNKS = 120 // about 20 minutes
const MAX_CHUNK_TEXT = 400000
const STATE_KEY = 'buga-rec'
export const PRIVATE_PATHS = /^\/(?:en\/)?(?:admin|live|play|r|hw|q|l|t|g|w|meet|parent-meetings|family-help|party-album|__test|teachers\/homework|classroom\/quiz)(?:\/|$)/

export const recordablePath = path => !PRIVATE_PATHS.test(path)
export const chunkPath = path => (/^\/[a-zA-Z0-9/_%.-]*$/.test(path) && path.length <= 300 ? path : '/')

// Decided once per tab. `force` (?rec=1) lets the owner test it on their own device.
export function recordingDecision({ path, random, ownerDevice, webdriver, privacySignal, force }) {
  if (webdriver || !recordablePath(path)) return false
  if (force) return true
  if (ownerDevice || privacySignal) return false
  return random < SAMPLE_RATE
}

// Replace every value the visitor typed (2+ characters) with stars, in any text on the page.
export function maskTyped(text, typed) {
  let out = text
  for (const value of typed) if (out.includes(value)) out = out.split(value).join('*'.repeat(value.length))
  return out
}

const storage = {
  get() { try { return JSON.parse(sessionStorage.getItem(STATE_KEY) || 'null') } catch { return 'off' } },
  set(state) { try { sessionStorage.setItem(STATE_KEY, JSON.stringify(state)) } catch { /* storage blocked */ } },
}

function ownerDevice() {
  try { return localStorage.getItem('buga-owner-device') === '1' || !!localStorage.getItem('ugabuga-owner-auth') } catch { return false }
}

export async function startSessionRecording() {
  if (typeof CompressionStream === 'undefined' || !crypto.randomUUID) return
  const force = new URLSearchParams(location.search).get('rec') === '1'
  let state = storage.get()
  if (state === 'off' && !force) return
  if (!state || state === 'off') {
    const on = recordingDecision({ path: location.pathname, random: Math.random(), ownerDevice: ownerDevice(), force,
      webdriver: navigator.webdriver, privacySignal: navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' })
    state = on ? { id: crypto.randomUUID(), chunk: 0 } : 'off'
    storage.set(state)
    if (!on) return
  }
  if (state.chunk >= MAX_CHUNKS || !recordablePath(location.pathname)) return

  const { record } = await import('@rrweb/record')
  const typed = new Set()
  const noteTyped = e => {
    const value = e.target?.value
    if (typeof value === 'string') for (const part of value.trim().split(/\s+/)) if (part.length >= 2) typed.add(part)
  }
  addEventListener('input', noteTyped, true)

  let buffer = [], queue = Promise.resolve(), stopped = false, stop = null
  const send = async (events, keepalive) => {
    if (!events.length || state.chunk >= MAX_CHUNKS) return
    const text = await packEvents(events)
    if (text.length > MAX_CHUNK_TEXT) {
      if (events.length < 2) return finish() // one event too large to store: give up on this visit
      const half = Math.ceil(events.length / 2)
      await send(events.slice(0, half), keepalive)
      return send(events.slice(half), keepalive)
    }
    const chunk = state.chunk++
    storage.set(state)
    const body = { p_session: state.id, p_chunk: chunk, p_path: chunkPath(location.pathname), p_width: innerWidth, p_events: text }
    const res = await fetch(rpcUrl('record_session_chunk'), rpcInit(body, keepalive && text.length < 60000)).catch(() => null)
    // The server says no when its daily or storage cap is reached: stop quietly.
    if (res && res.ok && (await res.json().catch(() => true)) === false) finish()
    if (state.chunk >= MAX_CHUNKS) finish()
  }
  const flush = keepalive => {
    const events = buffer
    buffer = []
    queue = queue.then(() => send(events, keepalive)).catch(() => {})
    return queue
  }
  let timer
  function finish() {
    if (stopped) return
    stopped = true
    stop?.()
    clearInterval(timer)
    removeEventListener('input', noteTyped, true)
  }

  stop = record({
    emit(event) {
      if (stopped) return
      if (!recordablePath(location.pathname)) { buffer = []; return finish() }
      buffer.push(event)
    },
    maskAllInputs: true,
    maskTextSelector: '*',
    maskTextFn: text => maskTyped(text, typed),
    recordCanvas: false,
    collectFonts: false,
    inlineImages: false,
    slimDOMOptions: 'all',
    sampling: { mousemove: 100, scroll: 200, media: 800, input: 'last' },
  })
  timer = setInterval(() => flush(false), FLUSH_MS)
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(true) })
  addEventListener('pagehide', () => flush(true))
}
