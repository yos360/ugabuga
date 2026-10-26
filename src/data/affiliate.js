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
  { id: 'travel', title: '🧳 מה עוד עוזר בדרך', placements: ['/travel', '/family/car-games'], products: [
    { name: 'לוח ציור מגנטי עם עט', url: 'https://s.click.aliexpress.com/e/_c3MPpyw3', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sded981a0ba3e4726ba366ee9146b476bf.jpg' },
    { name: 'ספר מדבקות לשימוש חוזר', url: 'https://s.click.aliexpress.com/e/_c37KxNT1', image: 'https://ae-pic-a1.aliexpress-media.com/kf/See85f973b7ed435f914c6516b6a5eb4ba.jpg' },
    { name: 'חוברת ציור במים — בלי לכלוך', url: 'https://s.click.aliexpress.com/e/_c3TA05yL', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sae098156010845d296df5d89dc859ac8f.png' },
    { name: 'אוזניות לילדים עם הגבלת עוצמה', url: 'https://s.click.aliexpress.com/e/_c2yEPg2j', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sbdb976696ef04deba649556e4f4e85256.png' },
  ] },
  { id: 'party', title: '🎈 למסיבה', placements: ['/birthday', '/invitation', '/games/birthday', '/ideas', '/cakes', '/rsvp'], products: [
    { name: 'סט 40 בלונים כחולים וקונפטי', url: 'https://s.click.aliexpress.com/e/_c3sqbrk7', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sd3a702a8e3b54c69a81453944f4b9507G.jpg' },
    { name: 'בלוני אותיות ליום הולדת', url: 'https://s.click.aliexpress.com/e/_c3AZp4gR', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sad48fa2e036043e68b85cef67649c678P.jpg' },
    { name: 'כובעי מסיבה וחצוצרות', url: 'https://s.click.aliexpress.com/e/_c3CcQ1d9', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S2b8491fea2984e6eabfdf4df7e84db63M.jpg' },
    { name: 'שקיות הפתעה לציור עם טושים', url: 'https://s.click.aliexpress.com/e/_c3DdofBt', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Seb68d18a76b34e5d96efa2d66aaf4471D.jpeg' },
  ] },
  { id: 'crafts', title: '🖍️ ליצירה ולצביעה', placements: ['/printables/coloring', '/crafts', '/origami', '/printables/symmetry'], products: [
    { name: 'טושי צבעי מים דו־צדדיים', url: 'https://s.click.aliexpress.com/e/_c4K5c0fV', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sbda302f244b84105b3fa4e37c6d0061fR.png' },
    { name: 'צבעים שלא מלכלכים את הידיים', url: 'https://s.click.aliexpress.com/e/_c3PAphWB', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S215960e2a2494346823cb56abcb1ea0ak.jpg' },
    { name: 'סט חימר קל מתייבש באוויר', url: 'https://s.click.aliexpress.com/e/_c43FvgGr', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S6fcc3ffc61a7444fafa35881eea2bf88q.jpg' },
    { name: 'מדבקות תלת־ממד לילדים', url: 'https://s.click.aliexpress.com/e/_c4rnA8vt', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Haadbb5c8fa4a46ec82dc5457c0096e6bi.jpg' },
  ] },
  { id: 'speech', title: '🗣️ לתרגול בבית', placements: ['/speech'], products: [
    { name: 'כרטיסיות מדברות', url: 'https://s.click.aliexpress.com/e/_c3Oug8AT', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sc3b30353cfd146359da76d22f48ef0e9a.jpg' },
    { name: 'שעון חול צבעוני', url: 'https://s.click.aliexpress.com/e/_c38PpM5D', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sda6158d13f964f9ca72974e5434e5762a.jpg' },
    { name: 'לוח חושי — משחק התאמה', url: 'https://s.click.aliexpress.com/e/_c4ehw9Y3', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S2cbeb8ea6f064f1ab9bb814f21f2085bz.jpg' },
  ] },
  { id: 'teacher', title: '🍎 לגננת ולמורה', placements: ['/classroom', '/teachers', '/printables/teacher-templates', '/printables/classroom-signs'], products: [
    { name: 'גליל מדבקות עידוד', url: 'https://s.click.aliexpress.com/e/_c36Z89IR', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Scf91aa54c3ec4df4901b1ccaa7dfc928F.jpg' },
    { name: 'מכונת למינציה A4/A3', url: 'https://s.click.aliexpress.com/e/_c3TFMIP9', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sd53664d43e784fa5aa4e13b170cdb153g.jpg' },
    { name: 'מספריים בטיחותיים לילדים', url: 'https://s.click.aliexpress.com/e/_c3AelH43', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S0f415d490b76404d8910161d1bccc5b5n.jpg' },
  ] },
  { id: 'hanukkah', title: '🕎 לחנוכה', placements: ['/holidays/hanukkah', '/printables/coloring/hanukkiah', '/printables/coloring/dreidel', '/printables/coloring/sufganiyah'], products: [
    { name: '10 סביבוני עץ', url: 'https://s.click.aliexpress.com/e/_c3wLToGB', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S9fa8a8d6e868497b8c7df0dc24db2d57l.jpg' },
    { name: 'שרשרת אורות מגן דוד', url: 'https://s.click.aliexpress.com/e/_c3HZlKJH', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S52a621a26dc6453c93daaa7f3161a3c53.jpg' },
  ] },
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
