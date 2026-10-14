import { ALPHABET_PAGES } from './alphabetData.js'
export const ENGLISH_SECTIONS = [{path:'/en/hebrew-alphabet', label:'Hebrew alphabet', title:'Learn the Hebrew alphabet', description:'Meet the letters, hear their names, sing and print a practice page.'}]
export const ENGLISH_PAGES = [{ path: '/en', title: 'Hebrew learning and Jewish family activities', counterpart: '/' }, ...ALPHABET_PAGES]
export const englishCounterpart = hePath => ENGLISH_PAGES.find(p => p.counterpart === hePath)?.path
export const isEnglishPath = path => path === '/en' || path.startsWith('/en/')
