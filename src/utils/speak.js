// Reads a word or letter aloud with the device's own voice. Silent when the
// device has no speech support — every game using it also works without sound.
export function speak(text, lang = 'he-IL') {
  try {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang; u.rate = 0.8
    window.speechSynthesis.speak(u)
  } catch { /* no speech on this device */ }
}
