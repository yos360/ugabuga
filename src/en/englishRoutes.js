export const ENGLISH_SECTIONS = []
export const ENGLISH_PAGES = [{ path: '/en', title: 'Hebrew learning and Jewish family activities', counterpart: '/' }]
export const englishCounterpart = hePath => ENGLISH_PAGES.find(p => p.counterpart === hePath)?.path
export const isEnglishPath = path => path === '/en' || path.startsWith('/en/')
