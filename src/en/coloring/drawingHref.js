import { findEnColoringDrawing } from './drawingCatalog.js'
import { HOLIDAY_DRAWINGS, drawingPath } from '../holidayColoringData.js'

// The English page of any drawing in the shared collection: its own /en/coloring-pages/<subject>/<n> page,
// or, for the drawings already published among the holiday drawings, that holiday page.
export function enDrawingLink(slug, n) {
  const own = findEnColoringDrawing(slug, n)
  if (own) return { href: own.path, name: own.name }
  const holiday = HOLIDAY_DRAWINGS.find(d => d.subject === slug && d.sourceNumber === Number(n))
  return holiday ? { href: drawingPath(holiday), name: holiday.name } : null
}
