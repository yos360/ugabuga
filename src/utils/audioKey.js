// File name of a pre-recorded clip for a text: FNV-1a hash of the exact (NFC) text passed to speak().
// Shared by the browser (utils/speak.js) and the recording script (scripts/audio).
export function audioKey(text) {
  let h = 0x811c9dc5
  for (const ch of String(text).normalize('NFC')) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0 }
  return h.toString(16).padStart(8, '0')
}
