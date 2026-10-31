// The site's own YouTube videos (channel UCFXZd5zbGFzkMgMHoMdKkwQ), newest first.
// Each video shows on the page(s) of the tool it demonstrates (`paths`, exact match) and on /videos.
//   kind: 'short' (vertical promo reel, 9:16) | 'tutorial' (longer how-to, 16:9)
//   desc: one or two sentences for the card and the VideoObject structured data.
// Imported by the layout for the path lookup, so keep entries short.
export const VIDEO_CATEGORIES = [
  { id: 'party', label: 'מסיבות ואירועים', emoji: '🎉' },
  { id: 'classroom', label: 'לכיתה ולגן', emoji: '🏫' },
  { id: 'holidays', label: 'חגים', emoji: '🕯️' },
  { id: 'learning', label: 'לומדים', emoji: '📚' },
  { id: 'travel', label: 'בדרכים', emoji: '🚗' },
  { id: 'tools', label: 'כלים ושירותים', emoji: '🛠️' },
]

export const VIDEOS = [
  { id: '3R4R1nnYNSs', kind: 'tutorial', title: 'איך משחקים במשחק לוח הכפל — מדריך קצר', paths: ['/learn/multiplication-game'], category: 'learning', date: '2026-10-31',
    desc: 'מדריך קצר למשחק לוח הכפל: מסלול שלבים מהלוח של 1 עד הלוח של 10, משוב מיידי על כל תשובה, כוכבים ודף תרגול להדפסה עם תשובות.' },
  { id: 'u3HvcewrSVc', kind: 'tutorial', title: 'איך מעצבים הזמנה ליום הולדת בוואטסאפ — מדריך קצר', paths: ['/invitation'], category: 'party', date: '2026-10-30',
    desc: 'מדריך קצר להזמנה ליום הולדת: בוחרים אחד מ־12 סגנונות, ממלאים שם, גיל, תאריך ומקום, משנים צבעים ופונט, שומרים כתמונה לוואטסאפ או לסטטוס ומוסיפים קישור לאישור הגעה.' },
  { id: '_UCm6JYhOyI', kind: 'tutorial', title: 'איך אוספים אישורי הגעה ליום הולדת בוואטסאפ — מדריך קצר', paths: ['/rsvp'], category: 'party', date: '2026-10-30',
    desc: 'מדריך קצר לדף אישור ההגעה: כותבים שם, תאריך ומקום, שולחים קישור אחד בוואטסאפ ורואים מי מגיע, כמה ילדים ומבוגרים, אלרגיות ומי עוד לא ענה.' },
  { id: 'DpbSovICUFA', kind: 'tutorial', title: 'איך מטילים קובייה אונליין — מדריך קצר', paths: ['/tools/dice'], category: 'tools', date: '2026-10-30',
    desc: 'מדריך קצר לקובייה הווירטואלית: 1 עד 5 קוביות, סכום אוטומטי והיסטוריית הטלות — לסולמות ונחשים, מונופול, שש־בש וכל משחק שהקובייה שלו הלכה לאיבוד.' },
  { id: '-4RMMZdPBVc', kind: 'short', title: 'אירוע בלי כאב ראש: אישורי הגעה, מי מביא מה וגמד וענק', paths: ['/rsvp', '/tools/bring-list', '/secret-friend'], category: 'party', date: '2026-10-29',
    desc: 'שלושה כלים חינמיים שחוסכים את הבלגן של כל אירוע: טופס אישורי הגעה, רשימת "מי מביא מה" והגרלת גמד וענק — שולחים קישור בוואטסאפ וזהו.' },
  { id: '1YnuhkZy1Nk', kind: 'short', title: 'העוגה נעלמה! חדר בריחה מודפס לילדים', paths: ['/tools/escape-rooms'], category: 'party', date: '2026-10-27',
    desc: 'חדר בריחה שמדפיסים בבית: מסתירים את הרמזים, והילדים פותרים חידות עד שמוצאים את העוגה — משחק מוכן ליום הולדת, לחופש או לכיתה.' },
  { id: '6HazN0BZLJY', kind: 'short', title: 'כמה עוד נשאר?! נוסעים עם בוגה', paths: ['/travel'], category: 'travel', date: '2026-10-26',
    desc: 'משחקים ופעילויות לנסיעה — ברכב, ברכבת ובטיסה, גם בלי אינטרנט — כדי שהשאלה "כמה עוד נשאר?" תגיע הרבה יותר מאוחר.' },
  { id: 'Cqs_y7Pqie0', kind: 'short', title: 'הפעם מצביעים בוגה! בחירות בכיתה', paths: ['/tools/class-elections'], category: 'classroom', date: '2026-10-25',
    desc: 'עורכים בחירות בכיתה, כמו בגדול — דרך כיפית ללמד את הילדים מה זו דמוקרטיה.' },
  { id: 'DyVuSAMV4xQ', kind: 'short', title: 'חסר לכם דף עבודה? מבקשים ואנחנו מכינים', paths: ['/request'], category: 'tools', date: '2026-10-24',
    desc: 'לא מצאתם את הדף שחיפשתם? כותבים לנו מה צריך — ואנחנו מכינים אותו ומעלים לאתר, בחינם.' },
  { id: 'MernkShUmoc', kind: 'short', title: 'חידון חי לכל הכיתה — בוגה לייב', paths: ['/live'], category: 'classroom', date: '2026-10-22',
    desc: 'חידון בזמן אמת לכל הכיתה: מקרינים את השאלות על הלוח, והמשתתפים עונים מהטלפון.' },
  { id: 'xUxa-ogDuCo', kind: 'short', title: 'יום הולדת בקרוב? ההזמנה מוכנה בדקה', paths: ['/invitation'], category: 'party', date: '2026-10-21',
    desc: 'מכינים הזמנה ליום הולדת בדקה: בוחרים עיצוב, ממלאים פרטים ושולחים בוואטסאפ או מדפיסים.' },
  { id: 'ZRI6gufvh-c', kind: 'short', title: 'מתכוננים לכיתה א׳ עם פעילות אנגלית', paths: ['/classroom/first-grade'], category: 'learning', date: '2026-10-20',
    desc: 'פעילויות קצרות שמכינות את הילדים לכיתה א׳ — כולל צעדים ראשונים באנגלית, בדרך של משחק.' },
]

// Link text for the tool pages on the /videos cards.
export const VIDEO_PAGE_LABELS = {
  '/rsvp': 'אישורי הגעה', '/tools/bring-list': 'מי מביא מה', '/secret-friend': 'גמד וענק',
  '/tools/escape-rooms': 'חדרי בריחה', '/travel': 'נוסעים עם בוגה', '/tools/class-elections': 'בחירות בכיתה',
  '/request': 'מבקשים דף', '/live': 'בוגה לייב', '/invitation': 'מחולל הזמנות', '/classroom/first-grade': 'הכנה לכיתה א׳',
  '/tools/dice': 'קובייה וירטואלית', '/learn/multiplication-game': 'משחק לוח הכפל',
}

const SITE = 'https://ugabuga.co.il'
const norm = p => (p || '/').replace(/\/+$/, '') || '/'

/** Videos that demonstrate the page at `pathname` (exact match, trailing slash ignored). */
export function videosForPath(pathname) {
  const p = norm(pathname)
  if (p === '/') return []
  return VIDEOS.filter(v => v.paths.includes(p))
}

export const videoThumb = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
export const videoEmbed = id => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`
export const videoWatchUrl = v => v.kind === 'short' ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`

/** Pages a video sitemap entry belongs to: its tool pages and /videos. */
export function videoSitemapPages() {
  const pages = { '/videos': VIDEOS }
  for (const v of VIDEOS) for (const p of v.paths) (pages[p] ||= []).push(v)
  return pages
}

const xmlEsc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** <video:video> block for the sitemap (https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps). */
export function videoSitemapTag(v) {
  return '<video:video>'
    + `<video:thumbnail_loc>${videoThumb(v.id)}</video:thumbnail_loc>`
    + `<video:title>${xmlEsc(v.title)}</video:title>`
    + `<video:description>${xmlEsc(v.desc || v.title)}</video:description>`
    + `<video:player_loc>https://www.youtube.com/embed/${v.id}</video:player_loc>`
    + `<video:publication_date>${v.date}T12:00:00+02:00</video:publication_date>`
    + '<video:family_friendly>yes</video:family_friendly>'
    + '</video:video>'
}

/** schema.org VideoObject for one video. */
export function videoSchema(v, withContext = true) {
  return {
    ...(withContext ? { '@context': 'https://schema.org' } : {}),
    '@type': 'VideoObject',
    'name': v.title,
    'description': v.desc || v.title,
    'thumbnailUrl': [videoThumb(v.id)],
    'uploadDate': `${v.date}T12:00:00+02:00`,
    'embedUrl': `https://www.youtube-nocookie.com/embed/${v.id}`,
    'contentUrl': videoWatchUrl(v),
    'inLanguage': 'he',
    'publisher': { '@type': 'Organization', 'name': 'עוגה בוגה', 'url': SITE },
  }
}
