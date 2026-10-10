import { createElement, useMemo } from 'react'
import { allDiagrams, arrowGeometry } from './engine'
import { renderDiagram } from './render'

const h = (tag, attrs, ...kids) => createElement(tag, attrs, ...kids)

export function Diagram({ dg, color, label }) {
  return renderDiagram(h, dg, { color, label })
}

export function useDiagrams(model) {
  return useMemo(() => allDiagrams(model), [model])
}

// The finished model (last step) as a thumbnail.
export function ModelThumb({ model }) {
  const dgs = useDiagrams(model)
  return <Diagram dg={dgs[dgs.length - 1]} color={model.color} label={model.title} />
}

// Small symbols for the "how to read the diagrams" legend.
const arrow = (kind, p, q) => ({ t: 'arrow', kind, p, q, bend: 1, ...arrowGeometry(p, q, 1, 1) })
const LEGEND = [
  { label: 'קיפול עמק — מקפלים כלפיכם', items: [{ t: 'fold', kind: 'valley', p: [6, 20], q: [94, 20] }] },
  { label: 'קיפול הר — מקפלים אחורה', items: [{ t: 'fold', kind: 'mountain', p: [6, 20], q: [94, 20] }] },
  { label: 'קפל קיים (קו שכבר קיפלנו ופתחנו)', items: [{ t: 'face', pts: [[10, 4], [90, 4], [90, 36], [10, 36]], c: false, cr: [[[50, 4], [50, 36]]] }] },
  { label: 'חץ: לאן מקפלים', items: [arrow('valley', [12, 30], [88, 30])] },
  { label: 'חץ חלול: מקפלים מאחור', items: [arrow('mountain', [12, 30], [88, 30])] },
  { label: 'מקפלים ופותחים בחזרה', items: [arrow('unfold', [12, 30], [88, 30])] },
  { label: 'הופכים את הדף', items: [{ t: 'symbol', kind: 'turn' }], vb: [-8, -6, 60, 52] },
  { label: 'מסובבים את הדף', items: [{ t: 'symbol', kind: 'rotate', deg: 90 }], vb: [-8, -6, 60, 52] },
]

export function FoldLegend() {
  return (
    <ul className="ori-legend">
      {LEGEND.map(l => {
        const vb = l.vb || [0, 0, 100, 40]
        const dg = { viewBox: vb.join(' '), vb, unit: vb === l.vb ? 1.6 : 1, items: l.items }
        return <li key={l.label}><span className="ori-legend-svg">{renderDiagram(h, dg, { color: '#fdba74', label: l.label })}</span><span>{l.label}</span></li>
      })}
    </ul>
  )
}
