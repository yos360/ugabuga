// Helpers for building search snippets from page copy.

// Meta description = a keyword-first lead + the page's own text, cut at a word
// boundary so the whole thing stays within `max` characters (Google shows ~155).
export function metaWithLead(lead, text = '', max = 155) {
  const room = max - lead.length
  if (room <= 0) return lead.trim()
  const clean = String(text).replace(/\s+/g, ' ').trim()
  if (clean.length <= room) return lead + clean
  const cut = clean.lastIndexOf(' ', room - 1)
  const body = clean.slice(0, cut > 0 ? cut : room - 1).replace(/[\s,;:—–-]+$/, '')
  return lead + body + '…'
}
