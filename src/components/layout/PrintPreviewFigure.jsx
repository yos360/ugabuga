import { useEffect, useState } from 'react'
import PATHS from '../../data/printPreviewPaths'

export const previewSrc = path => `/previews/${path.slice(1).replace(/\//g, '--')}.jpg`
const clean = path => (path || '/').replace(/\/+$/, '') || '/'
// Only the list of pages stays in the main bundle (SEO uses it for og:image); the alt texts load on demand.
export const previewFor = path => {
  const p = clean(path)
  return PATHS.has(p) ? { src: previewSrc(p) } : null
}

// A real image of the page's printable sheet (made by scripts/print-previews.mjs), so search engines
// — Google Images above all — can see what the page prints. The sheets themselves are drawn in the
// browser and are invisible to them.
export default function PrintPreviewFigure({ pathname }) {
  const p = clean(pathname)
  const [alts, setAlts] = useState(null)
  const has = PATHS.has(p)
  useEffect(() => { if (has && !alts) import('../../data/printPreviews').then(m => setAlts(m.default)).catch(() => {}) }, [has, alts])
  if (!has || !alts?.[p]) return null
  return <figure className="no-print mx-auto my-8 flex max-w-4xl items-center gap-4 px-4" dir="rtl">
    <img src={previewSrc(p)} alt={alts[p]} width="120" height="164" loading="lazy" decoding="async"
      className="h-auto w-[120px] shrink-0 rounded-lg border-2 border-[var(--border)] bg-white object-contain" />
    <figcaption className="text-sm text-[var(--muted-foreground)]">📄 כך נראה הדף המודפס: <b className="text-[var(--ink)]">{alts[p]}</b></figcaption>
  </figure>
}
