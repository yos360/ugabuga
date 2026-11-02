// CV templates for /tools/resume: one config per template, one shared renderer (CvDocument.jsx).
// Everything visual is a CSS class built from these fields (see resume.css):
//   layout  single | side-right | side-left | split        (columns; side = narrow column, RTL right = start)
//   header  plain | center | band | line | split | boxed | initials | side | main
//   side    fill | tint | gray | line                       (sidebar look, two-column layouts only)
//   heads   line | bar | pill | under | caps | box | dot | serif   (section headings)
//   font    heebo | serif | assistant | rubik
//   density normal | compact | airy
//   photo   none | circle | square | rounded
//   skills  list | chips | inline
import { SECTIONS, OPTIONAL_SECTIONS, hasContent } from './resumeLogic.js'

const SIDE = ['languages', 'skills', 'hobbies']
const T = (id, name, tag, o) => ({ id, name, tag, layout: 'single', header: 'plain', side: 'tint', heads: 'line', font: 'heebo', density: 'normal', photo: 'none', skills: 'list', timeline: false, frame: false, sideSections: SIDE, order: null, accent: '#1f3a5f', ...o })

export const TEMPLATES = [
  T('classic', 'קלאסי', 'רגיל', { header: 'center', heads: 'line', font: 'serif', accent: '#1f3a5f' }),
  T('band', 'פס צבע', 'מודרני', { header: 'band', heads: 'bar', accent: '#0f766e' }),
  T('minimal', 'מינימלי', 'רגיל', { header: 'plain', heads: 'caps', font: 'assistant', density: 'airy', accent: '#111827' }),
  T('photo-right', 'עם תמונה', 'עם תמונה', { layout: 'side-right', header: 'side', side: 'fill', photo: 'circle', heads: 'bar', accent: '#1f3a5f' }),
  T('light-column', 'עמודה בהירה', 'מודרני', { layout: 'side-left', header: 'main', side: 'tint', heads: 'under', accent: '#4338ca' }),
  T('timeline', 'ציר זמן', 'מודרני', { header: 'line', heads: 'dot', timeline: true, accent: '#0f766e' }),
  T('compact', 'צפוף — הכול בעמוד', 'רגיל', { header: 'split', heads: 'under', density: 'compact', skills: 'inline', accent: '#334155' }),
  T('executive', 'מנהלים', 'רגיל', { header: 'boxed', heads: 'caps', font: 'serif', accent: '#111827' }),
  T('student', 'סטודנטים', 'בלי ניסיון', { header: 'band', heads: 'pill', skills: 'chips', order: ['summary', 'education', 'experience', 'skills', 'languages', 'military', 'volunteer', 'hobbies'], accent: '#4338ca' }),
  T('first-job', 'עבודה ראשונה', 'בלי ניסיון', { header: 'center', heads: 'pill', font: 'rubik', skills: 'chips', order: ['summary', 'education', 'volunteer', 'skills', 'experience', 'military', 'languages', 'hobbies'], accent: '#15803d' }),
  T('after-army', 'אחרי צבא', 'בלי ניסיון', { header: 'line', heads: 'bar', order: ['summary', 'military', 'experience', 'education', 'skills', 'languages', 'volunteer', 'hobbies'], accent: '#3f6212' }),
  T('academic', 'אקדמי', 'רגיל', { header: 'plain', heads: 'serif', font: 'serif', order: ['summary', 'education', 'experience', 'military', 'languages', 'skills', 'volunteer', 'hobbies'], accent: '#7c2d12' }),
  T('creative', 'יצירתי', 'עם תמונה', { layout: 'side-left', header: 'side', side: 'fill', photo: 'rounded', heads: 'pill', font: 'rubik', skills: 'chips', accent: '#9d174d' }),
  T('tech', 'הייטק', 'מודרני', { layout: 'side-right', header: 'main', side: 'gray', heads: 'dot', font: 'assistant', skills: 'chips', accent: '#4338ca' }),
  T('elegant', 'אלגנטי', 'רגיל', { header: 'center', heads: 'serif', font: 'serif', accent: '#9d174d' }),
  T('split-head', 'כותרת מפוצלת', 'מודרני', { header: 'split', heads: 'bar', accent: '#b45309' }),
  T('initials', 'ראשי תיבות', 'מודרני', { header: 'initials', heads: 'line', font: 'assistant', accent: '#0f766e' }),
  T('two-columns', 'שתי עמודות', 'מודרני', { layout: 'split', header: 'band', side: 'line', heads: 'under', sideSections: ['education', 'languages', 'skills', 'volunteer', 'hobbies'], accent: '#1f3a5f' }),
  T('photo-top', 'תמונה בכותרת', 'עם תמונה', { header: 'band', photo: 'square', heads: 'caps', accent: '#334155' }),
  T('thin-line', 'קו דק', 'רגיל', { layout: 'side-right', header: 'main', side: 'line', heads: 'caps', font: 'assistant', accent: '#111827' }),
  T('teacher', 'חינוך והוראה', 'עם תמונה', { layout: 'side-left', header: 'main', side: 'tint', photo: 'circle', heads: 'box', font: 'rubik', accent: '#b45309' }),
  T('service', 'שירות ומכירות', 'מודרני', { header: 'band', heads: 'bar', density: 'compact', skills: 'chips', accent: '#0f766e' }),
  T('frame', 'מסגרת', 'רגיל', { header: 'center', heads: 'box', frame: true, accent: '#1f3a5f' }),
  T('photo-left', 'תמונה משמאל', 'עם תמונה', { layout: 'side-left', header: 'side', side: 'gray', photo: 'circle', heads: 'line', font: 'assistant', accent: '#15803d' }),
  T('clean-timeline', 'ציר זמן עם עמודה', 'מודרני', { layout: 'side-right', header: 'band', side: 'tint', heads: 'dot', timeline: true, accent: '#7c2d12' }),
  T('newspaper', 'עיתון', 'רגיל', { header: 'boxed', heads: 'serif', font: 'serif', density: 'compact', skills: 'inline', accent: '#111827' }),
]

export const TEMPLATE_IDS = TEMPLATES.map(t => t.id)
export const TEMPLATE_TAGS = ['הכול', ...new Set(TEMPLATES.map(t => t.tag))]
export const templateById = id => TEMPLATES.find(t => t.id === id) || TEMPLATES[0]

// What goes where: classes for the page, and the sections of each column, in order.
// In edit mode the required sections show even when empty (with grey hints); optional ones only once filled.
export function buildLayout(cv, tpl, { edit = false, compact = false, accent = '' } = {}) {
  const order = cv.order || tpl.order || SECTIONS
  const show = s => (edit ? !OPTIONAL_SECTIONS.includes(s) || hasContent(cv, s) : hasContent(cv, s))
  const twoCol = tpl.layout !== 'single'
  const sideSet = twoCol ? tpl.sideSections : []
  const contactInSide = twoCol && tpl.layout !== 'split'
  const side = [
    ...(contactInSide && (edit || hasContent(cv, 'contact')) ? ['contact'] : []),
    ...order.filter(s => sideSet.includes(s) && show(s)),
  ]
  const main = order.filter(s => !sideSet.includes(s) && show(s))
  const density = compact ? 'compact' : tpl.density
  const cls = [
    'rs-cv', `L-${tpl.layout}`, `H-${tpl.header}`, `K-${tpl.heads}`, `F-${tpl.font}`, `D-${density}`,
    twoCol ? `S-${tpl.side}` : '', tpl.timeline ? 'tl' : '', tpl.frame ? 'frame' : '',
  ].filter(Boolean)
  return {
    cls,
    accent: accent || tpl.accent,
    twoCol,
    headerInSide: twoCol && tpl.header === 'side',
    headerInMain: twoCol && tpl.header === 'main',
    contactInHead: !contactInSide,
    photo: tpl.photo !== 'none' && !!cv.personal.photo ? tpl.photo : '',
    photoSlot: tpl.photo !== 'none',
    skills: tpl.skills,
    main,
    side,
  }
}
