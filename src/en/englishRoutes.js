import { TRAVEL_PAGES } from './travel/catalog.js'
import { HOLIDAY_PAGES } from './holidayData.js'
import { HOLIDAY_COLORING_PAGES } from './holidayColoringData.js'
import { ALPHABET_PAGES } from './alphabetData.js'
import { ACTIVITY_SECTIONS, EN_ACTIVITY_PAGES } from './activityCatalog.js'
import { HANUKKAH_GUIDE_PAGES } from './hanukkahGuides.js'
import { RSVP_TYPES_EN } from '../utils/rsvpTypesEn.js'
import { TOOLS_PAGES } from './tools/catalog.js'
import { EXCEL_PAGES } from './excel/catalog.js'
import { WORKSHEETS_PAGES } from './worksheets/catalog.js'
import { ARCADE_PAGES } from './arcade/catalog.js'
import { READING_PAGES } from './reading/catalog.js'
// The newer English areas (each in src/en/<area>/), rendered through EnglishExtra.jsx.
export const EXTRA_PAGES = [...TOOLS_PAGES, ...EXCEL_PAGES, ...WORKSHEETS_PAGES, ...ARCADE_PAGES, ...READING_PAGES]
const EXTRA_SECTIONS = [
  { path: '/en/online-games', label: 'Online games', title: 'Play online', description: 'Puzzles, card games, solitaire, sudoku, chess and more, right in the browser.', emoji: '🕹️' },
  { path: '/en/worksheets', label: 'Worksheets', title: 'Printable worksheets', description: 'Math practice, clocks, fractions, mazes, dot-to-dot and paper templates.', emoji: '✏️' },
  { path: '/en/reading', label: 'Reading & ABC', title: 'Reading and the ABC', description: 'Short stories with read-aloud, letter tracing and picture word games.', emoji: '📖' },
  { path: '/en/tools', label: 'Tools', title: 'Free online tools', description: 'A school calculator, a Hebrew keyboard, a PDF studio, a QR code maker and touch typing.', emoji: '🧰' },
  { path: '/en/excel', label: 'Excel course', title: 'Free Excel course', description: 'Ten hands-on lessons with a live spreadsheet in the page.', emoji: '📊' },
]
export const ENGLISH_SECTIONS = [...EXTRA_SECTIONS, {path:'/en/travel',label:'Travel with Buga',title:'Travel with Buga',description:'Print, play, listen and save for airplane mode.',emoji:'✈️'}, {path:'/en/live', label:'Buga Live', title:'Play a live quiz together', description:'Create questions and let up to 100 players answer from their phones.', emoji:'⚡'}, ...ACTIVITY_SECTIONS, {path:'/en/hebrew-alphabet', label:'Hebrew alphabet', title:'Learn the Hebrew alphabet', description:'Meet the letters, hear their names, sing and print a practice page.'}, {path:'/en/jewish-holidays', label:'Jewish holidays', title:'Jewish holidays for families', description:'Explore traditions, calendar dates, blessings and holiday coloring pages.'}, {path:'/en/rsvp', label:'RSVP', title:'Free online RSVP', description:'Send one link and see who is coming, how many children and adults, and any allergies.', emoji:'✅'}]
// /en/rsvp and one page per event type, each paired with its Hebrew page. Guest links (/en/r/<code>) are private and never listed.
const RSVP_PAGES = [{ path: '/en/rsvp', title: 'Free online RSVP for parties and events', counterpart: '/rsvp' }, ...RSVP_TYPES_EN.map(t => ({ path: `/en/rsvp/${t.slug}`, title: t.seo, counterpart: `/rsvp/${t.slug}` }))]
export const ENGLISH_PAGES = [...TRAVEL_PAGES, { path: '/en', title: 'Free games, coloring pages and activities for kids', counterpart: '/' }, { path: '/en/live', title: 'Buga Live - free live classroom quiz', counterpart: '/live' }, ...ALPHABET_PAGES, ...HOLIDAY_PAGES, ...HANUKKAH_GUIDE_PAGES, ...HOLIDAY_COLORING_PAGES, ...EN_ACTIVITY_PAGES, ...RSVP_PAGES, ...EXTRA_PAGES]
export const englishCounterpart = hePath => ENGLISH_PAGES.find(p => p.counterpart === hePath)?.path
export const isEnglishPath = path => path === '/en' || path.startsWith('/en/')
