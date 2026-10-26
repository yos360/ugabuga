// AliExpress affiliate picks ("קישורי שותפים"), shown by <AffiliatePicks /> on topic pages.
//
// Products are grouped by topic; each topic lists the path prefixes where its picks appear.
// A topic with no products renders nothing, so the box only shows up once real affiliate links
// (from AliExpress Portals) are filled in. Clicks are counted like sponsor clicks, under the id
// `ali-<topic>` (owner report → "לחיצות על באנרים", Google Analytics → `affiliate_click`).
//
// Product: { name (Hebrew, short), url (https affiliate link), image (https product photo) }.
// No prices: AliExpress prices change all the time.
import { NO_SPONSOR, matchesPlacement } from './sponsors.js'

export const AFFILIATE_LABEL = 'קישורי שותפים'
export const AFFILIATE_NOTE = 'אם תקנו דרך הקישורים, נקבל עמלה קטנה — בלי תוספת למחיר. זה עוזר לנו להשאיר את האתר בחינם.'

export const AFFILIATE_TOPICS = [
  { id: 'travel', title: '🧳 מה עוד עוזר בדרך', placements: ['/travel', '/family/car-games'], products: [] },
  { id: 'party', title: '🎈 למסיבה', placements: ['/birthday', '/invitation', '/games/birthday', '/ideas', '/cakes', '/rsvp'], products: [] },
  { id: 'crafts', title: '🖍️ ליצירה ולצביעה', placements: ['/printables/coloring', '/crafts', '/origami', '/printables/symmetry'], products: [] },
  { id: 'speech', title: '🗣️ לתרגול בבית', placements: ['/speech'], products: [] },
  { id: 'teacher', title: '🍎 לגננת ולמורה', placements: ['/classroom', '/teachers', '/printables/teacher-templates', '/printables/classroom-signs'], products: [] },
  { id: 'hanukkah', title: '🕎 לחנוכה', placements: ['/holidays/hanukkah', '/printables/coloring/hanukkiah', '/printables/coloring/dreidel', '/printables/coloring/sufganiyah'], products: [] },
]

// Never on pages a child uses alone (the kids zone and the games), nor wherever sponsors are off.
// The buying guides (/recommended) show their topic's picks in their own grid, so no extra box there.
export const NO_AFFILIATE = [...NO_SPONSOR, '/games', '/online-games', '/brain-games', '/recommended']

const valid = p => p && p.name && /^https:\/\//.test(p.url || '') && /^https:\/\//.test(p.image || '')

// All valid products of a topic (by id) — the buying guide's own grid. [] when none.
export function affiliateProducts(id, topics = AFFILIATE_TOPICS) {
  return (topics.find(t => t.id === id)?.products || []).filter(valid)
}

// The topic (with at least one valid product) for a page, or null.
export function affiliateForPath(path, topics = AFFILIATE_TOPICS) {
  if (NO_AFFILIATE.some(p => matchesPlacement(p, path))) return null
  const t = topics.find(x => x.placements.some(p => matchesPlacement(p, path)))
  const products = (t?.products || []).filter(valid)
  return products.length ? { ...t, products: products.slice(0, 4) } : null
}
