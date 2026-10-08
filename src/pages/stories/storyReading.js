// Paragraph text → sentences. Story text and highlighting both use this, so indices line up.
export function splitSentences(text) {
  return String(text).split(/(?<=[.!?…:][״"”']?)\s+/).filter(Boolean)
}

export const VOICES = {
  cute: { label: '🐻 קול חמוד', pitch: 1.35, rate: 0.9 },
  calm: { label: '🌙 קול רגוע', pitch: 1, rate: 0.82 },
}
