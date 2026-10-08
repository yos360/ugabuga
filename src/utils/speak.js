// Reads a word or letter aloud with the device's own voice. Silent when the
// device has no voice for the language — every game using it also works
// without sound, and a wrong-language voice would mispronounce the word.

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
export async function speak(text, lang = 'he-IL', { rate = 0.85 } = {}) {
  try {
    if (!canSpeak() || !text) return false
    const voice = pickVoice(await loadVoices(), lang)
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(String(text))
    u.lang = lang
    u.rate = rate
    if (voice) u.voice = voice
    // No voice list at all (some Androids report none yet still speak by
    // lang); a list without our language means we would only mispronounce.
    else if (synth.getVoices().length) return false
    synth.speak(u)
    return true
  } catch { return false }
}

// Whether this device has a voice for the language (resolves after the voice list loads).
// Kept in step with speak(): true exactly when speak() would hand the text to the engine.
export async function hasVoice(lang) {
  try {
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
