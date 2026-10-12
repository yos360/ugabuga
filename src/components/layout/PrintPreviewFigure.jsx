import PREVIEWS from '../../data/printPreviews'

export const previewSrc = path => `/previews/${path.slice(1).replace(/\//g, '--')}.jpg`
export const previewFor = path => {
  const p = (path || '/').replace(/\/+$/, '') || '/'
  return PREVIEWS[p] ? { src: previewSrc(p), alt: PREVIEWS[p] } : null
}

// A real image of the page's printable sheet (made by scripts/print-previews.mjs), so search engines
// — Google Images above all — can see what the page prints. The sheets themselves are drawn in the
// browser and are invisible to them.
export default function PrintPreviewFigure({ pathname }) {
  const p = previewFor(pathname)
  if (!p) return null
  return <figure className="no-print mx-auto my-8 flex max-w-4xl items-center gap-4 px-4" dir="rtl">
    <img src={p.src} alt={p.alt} width="120" height="164" loading="lazy" decoding="async"
      className="h-auto w-[120px] shrink-0 rounded-lg border-2 border-[var(--border)] bg-white object-contain" />
    <figcaption className="text-sm text-[var(--muted-foreground)]">📄 כך נראה הדף המודפס: <b className="text-[var(--ink)]">{p.alt}</b></figcaption>
  </figure>
}
