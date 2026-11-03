// "2-5, 9" → Set {2,3,4,5,9}, within 1..total. Empty text → null (all pages); text that can't be read → false.
export function parsePageRange(text, total) {
  const s = String(text || '').trim()
  if (!s) return null
  const pages = new Set()
  for (const part of s.split(/[,،\s]+/).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:[-–](\d+))?$/)
    if (!m) return false
    let from = Number(m[1]), to = Number(m[2] ?? m[1])
    if (from > to) [from, to] = [to, from]
    for (let n = Math.max(1, from); n <= Math.min(total, to); n++) pages.add(n)
  }
  return pages.size ? pages : false
}

// What a booklet page is, from its title in the registry: the answer key, the certificate, or a regular page.
export const pageKind = title => /תשובות|פתרונות/.test(title) ? 'key' : /תעודת/.test(title) ? 'certificate' : 'page'
