import { HOLIDAY_PAGES } from './holidayData.js'
import { HOLIDAY_COLORING_PAGES } from './holidayColoringData.js'
import { ALPHABET_PAGES } from './alphabetData.js'
import { ACTIVITY_SECTIONS, EN_ACTIVITY_PAGES } from './activityCatalog.js'
export const ENGLISH_SECTIONS = [{path:'/en/live', label:'Buga Live', title:'Play a live quiz together', description:'Create questions and let up to 100 players answer from their phones.', emoji:'⚡'}, ...ACTIVITY_SECTIONS, {path:'/en/hebrew-alphabet', label:'Hebrew alphabet', title:'Learn the Hebrew alphabet', description:'Meet the letters, hear their names, sing and print a practice page.'}, {path:'/en/jewish-holidays', label:'Jewish holidays', title:'Jewish holidays for families', description:'Explore traditions, calendar dates, blessings and holiday coloring pages.'}]
export const ENGLISH_PAGES = [{ path: '/en', title: 'Free games, coloring pages and activities for kids', counterpart: '/' }, { path: '/en/live', title: 'Buga Live - free live classroom quiz', counterpart: '/live' }, ...ALPHABET_PAGES, ...HOLIDAY_PAGES, ...HOLIDAY_COLORING_PAGES, ...EN_ACTIVITY_PAGES]
export const englishCounterpart = hePath => ENGLISH_PAGES.find(p => p.counterpart === hePath)?.path
export const isEnglishPath = path => path === '/en' || path.startsWith('/en/')
