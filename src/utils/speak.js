// Reads a word or letter aloud. Texts we recorded in advance (public/audio/<lang>/<audioKey>.mp3,
// listed in public/audio/<lang>/index.json) play from the file, so they sound the same on every
// device; anything else falls back to the device's own voice. Silent when neither exists — every
// game using it also works without sound, and a wrong-language voice would mispronounce the word.
import { audioKey } from './audioKey'

// Higher-quality voices browsers ship under these names (Chrome "Google",
// Edge "Online (Natural)", Apple "Enhanced/Premium", Android "Neural").
const GOOD_VOICE = /natural|neural|online|enhanced|premium|google|siri/i

let voicesReady = null

function loadVoices() {
  const synth = window.speechSynthesis
  const now = synth.getVoices()
  if (now.length) return Promise.resolve(now)
  if (!voicesReady) {
    // Some browsers (Chrome, Safari) fill the voice list only after a moment.
    voicesReady = new Promise(resolve => {
      const done = () => { synth.removeEventListener?.('voiceschanged', done); resolve(synth.getVoices()) }
      synth.addEventListener?.('voiceschanged', done)
      setTimeout(done, 1200)
    })
  }
  return voicesReady
}

export function pickVoice(voices, lang) {
  const base = lang.slice(0, 2).toLowerCase()
  // Hebrew voices sometimes report the legacy "iw" code.
  const codes = base === 'he' ? ['he', 'iw'] : [base]
  const matching = voices.filter(v => codes.includes((v.lang || '').slice(0, 2).toLowerCase()))
  if (!matching.length) return null
  const score = v => (GOOD_VOICE.test(v.name) ? 4 : 0)
    + ((v.lang || '').toLowerCase().replace('_', '-') === lang.toLowerCase() ? 2 : 0)
    + (v.localService ? 1 : 0)
  return [...matching].sort((a, b) => score(b) - score(a))[0]
}

export function canSpeak() {
  try { return typeof window !== 'undefined' && 'speechSynthesis' in window } catch { return false }
}

// Resolves true when the text was handed to a matching voice.
// A press on a speaker button that can't play anything announces it (Layout shows a short
// notice) instead of leaving a button that silently does nothing. Automatic read-aloud passes
// `user: false` and stays silent.
function noVoice(lang, user) {
  if (user) try { window.dispatchEvent(new CustomEvent('buga:no-voice', { detail: { lang } })) } catch { /* ignore */ }
  return false
}

const recorded = {}
// Set of recorded clip keys for a language, loaded once ('he-IL' → /audio/he/index.json).
function recordedFor(lang) {
  const l = lang.slice(0, 2).toLowerCase()
  if (!recorded[l]) recorded[l] = fetch(`/audio/${l}/index.json`).then(r => (r.ok ? r.json() : [])).then(a => new Set(a)).catch(() => new Set())
  return recorded[l]
}
let current = null
export function stopSpeaking() {
  try { current?.pause() } catch { /* ignore */ }
  current = null
  try { window.speechSynthesis?.cancel() } catch { /* ignore */ }
}
async function playRecorded(text, lang) {
  const key = audioKey(text)
  if (!(await recordedFor(lang)).has(key)) return false
  stopSpeaking()
  const a = new Audio(`/audio/${lang.slice(0, 2).toLowerCase()}/${key}.mp3`)
  current = a
  try { await a.play(); return true } catch { return false }
}

export async function speak(text, lang = 'he-IL', { rate = 0.85, user = true } = {}) {
  try {
    if (!text) return false
    if (typeof window !== 'undefined' && await playRecorded(String(text), lang)) return true
    if (!canSpeak()) return noVoice(lang, user)
    const voice = pickVoice(await loadVoices(), lang)
    const synth = window.speechSynthesis
    stopSpeaking()
    const u = new SpeechSynthesisUtterance(String(text))
    u.lang = lang
    u.rate = rate
    if (voice) u.voice = voice
    // No voice list at all (some Androids report none yet still speak by
    // lang); a list without our language means we would only mispronounce.
    else if (synth.getVoices().length) return noVoice(lang, user)
    else {
      // Speaking by language alone (no voice list yet): if nothing actually starts, say so.
      let started = false
      u.onstart = () => { started = true }
      setTimeout(() => { if (!started && !synth.speaking) noVoice(lang, user) }, 1500)
    }
    synth.speak(u)
    return true
  } catch { return false }
}

// Whether this device has a voice for the language (resolves after the voice list loads).
// Kept in step with speak(): true exactly when speak() would hand the text to the engine.
export async function hasVoice(lang) {
  try {
    if (typeof window !== 'undefined' && (await recordedFor(lang)).size) return true
    if (!canSpeak()) return false
    const voices = await loadVoices()
    // An empty list means "unknown" (some Androids list nothing yet speak by lang) — speak()
    // still tries then, so don't claim there is no voice. A list without the language: no.
    if (!voices.length) return true
    return !!pickVoice(voices, lang)
  } catch { return false }
}

// The voice speak() would use for the language, or null (resolves after the voice list loads).
export async function voiceFor(lang) {
  try { return canSpeak() ? pickVoice(await loadVoices(), lang) : null } catch { return null }
}
