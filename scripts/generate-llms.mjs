// Writes public/llms.txt — a short, curated map of the site for AI assistants and answer engines
// (ChatGPT, Perplexity, Claude, Gemini…), following the llms.txt convention: what the site is,
// who it is for, and the main pages, grouped like the site menu (src/data/siteMenu.js).
import { writeFile } from 'node:fs/promises'
import { ENGLISH_SECTIONS } from '../src/en/englishRoutes.js'
import { MENU_DOMAINS, CLASSROOM_MENU } from '../src/data/siteMenu.js'

const SITE = 'https://ugabuga.co.il'
const abs = to => SITE + (to.startsWith('/') ? to : '/' + to)
const line = item => `- [${item.label.replace(/[[\]]/g, '')}](${abs(item.to)})`

const out = [
  '# עוגה בוגה (UGABUGA)',
  '',
  '> אתר ישראלי בעברית, חינמי ובלי הרשמה, עם משחקים, דפים להדפסה ולמידה לילדים בגילי 3–12: משחקים לימי הולדת, לכיתה ולגן, דפי צביעה ודפי עבודה להדפסה, תרגול חשבון, קריאה ואנגלית לפי כיתה, הכנה לכיתה א׳, חגים, וכלים להורים, לגננות ולמורות.',
  '',
  'Ugabuga (עוגה בוגה, also written "אוגה בוגה") is a free Hebrew website for children aged 3–12, their parents and teachers: free classroom tools for Israeli teachers (a live class quiz game, online multiple-choice tests, BugaPedia — a children\'s encyclopedia that answers questions, puzzle and word-search makers), party and classroom games, free printable coloring pages and worksheets (A4, PDF), grade-by-grade math, reading-comprehension and English practice, first-grade readiness, Jewish/Israeli holiday activities and family tools. Everything is free, with no sign-up. Content is written for Israeli families and schools (Israeli curriculum, Hebrew, right-to-left).',
  '',
  '- כל התוכן חינם ולא דורש הרשמה; דפי ההדפסה יוצאים נקיים על A4 וניתן לשמור אותם כ־PDF.',
  '- קהל: הורים, ילדים, גננות, מורות ומדריכים בישראל.',
  `- מפת האתר המלאה: ${SITE}/sitemap.xml · כל העמודים במקום אחד: ${SITE}/tools`,
  `- אודות: ${SITE}/about · פרטיות: ${SITE}/privacy · יצירת קשר: hellohugabuga@gmail.com`,
  '',
]
// Teachers are a large share of the visitors AI assistants send (mostly to /classroom), so their
// tools come first, each with what a teacher would ask for.
const TEACHER_PAGES = [
  ['/classroom', 'מתחם לכיתה — כל הכלים למורות ולגננות במקום אחד, בחינם ובלי הרשמה'],
  ['/live', 'בוגה לייב — חידון חי לכיתה: המורה מציגה שאלות על הלוח והתלמידים עונים מהטלפון (כמו קהוט, בעברית ובחינם)'],
  ['/classroom/quiz', 'מבחן אמריקאי אונליין — בונים מבחן, שולחים קישור לתלמידים ורואים ציונים'],
  ['/bugapedia', 'בוגה־פדיה — אנציקלופדיה לילדים: שואלים שאלה ומקבלים תשובה קצרה ומדויקת בעברית, לפי מקצוע'],
  ['/tools/crossword-maker', 'מחולל תשבצים ותפזורות — מכינים דף משימה מהמילים של השיעור ומדפיסים'],
  ['/tools/word-search-maker', 'מחולל תפזורת מילים — תפזורת מותאמת לשיעור, להדפסה'],
  ['/classroom/first-grade', 'הכנה לכיתה א׳ — משחקים וחוברת הכנה להדפסה'],
  ['/learn/reading', 'הבנת הנקרא לפי כיתה (ב׳–ו׳) — קטעים עם שאלות, הקראה בקול ודפים להדפסה'],
  ['/printables/math-worksheets', 'דפי עבודה בחשבון — מחולל דפים לכיתה א׳–ב׳, עם דף תשובות לבדיקה'],
  ['/games/classroom', 'משחקים לכיתה — משחקי פתיחה, הפסקה וחזרה על החומר, עם הוראות'],
  ['/parent-meetings', 'הרשמה לאספות הורים — ההורים בוחרים שעה בקישור אחד'],
  ['/secret-friend', 'גמד וענק — הגרלת שמות לכיתה'],
]
const described = ([to, d]) => `- [${d.split(' — ')[0]}](${abs(to)}): ${d.split(' — ').slice(1).join(' — ')}`
out.push('## למורות ולגננות — כלים חינמיים לכיתה', '', ...TEACHER_PAGES.map(described), '')

// The pages people come for most — each with one line on what it answers.
const KEY_PAGES = [
  ['/printables/coloring', 'דפי צביעה להדפסה בחינם — מאות ציורים לפי נושא (חיות, רכבים, חגים, נסיכות…)'],
  ['/classroom/first-grade', 'הכנה לכיתה א׳ — משחקים וחוברת הכנה להדפסה (אותיות, קריאה, חשבון, שעון)'],
  ['/letters', 'לימוד אותיות בעברית — עמוד לכל אות, משחק, כרטיסיות ודפי תרגול'],
  ['/letters/song', 'שיר האותיות — שרים את האלף בית עם מנגינה, ודף מילים להדפסה'],
  ['/letters/cursive', 'אותיות בכתב יד — טבלת דפוס וכתב, מדפוס לכתב ודפי תרגול'],
  ['/math', 'חשבון לפי כיתה (א׳–י״ב) — תרגול, מבחנים ודפי עבודה עם תשובות'],
  ['/printables/math-worksheets', 'דפי עבודה בחשבון לכיתה א׳–ב׳ — חיבור וחיסור עד 10 ועד 20'],
  ['/learn/reading', 'הבנת הנקרא לפי כיתה (ב׳–ו׳) — קטעים עם שאלות ותשובות'],
  ['/learn/multiplication-table', 'לוח הכפל — תרגול, משחק ודפים להדפסה'],
  ['/abc', 'אותיות באנגלית לילדים — A–Z עם מילים, משחק ושיר ה־ABC'],
  ['/games', 'משחקים לילדים — ליום הולדת, לכיתה, לגן ולצהרון, עם הוראות'],
  ['/birthday', 'יום הולדת לילדים — משחקים, הזמנות, רעיונות ועוגות לפי גיל'],
]
out.push('## עמודים מרכזיים', '', ...KEY_PAGES.map(described), '')

for (const d of MENU_DOMAINS) {
  out.push(`## ${d.label}`, '', `- [${d.landingLabel || d.label}](${abs(d.to)})`)
  for (const g of d.groups) {
    const items = g.items.filter(i => i.to && !i.shortcut)
    if (!items.length) continue
    out.push('', `### ${g.title}`, ...items.map(line))
  }
  out.push('')
}
// Interactive homework is left out until its database part is switched on.
const classroom = CLASSROOM_MENU.items.filter(i => i.to && !i.shortcut && i.to !== '/teachers')
if (classroom.length) out.push(`## ${CLASSROOM_MENU.label} (למורות ולגננות)`, '', `- [${CLASSROOM_MENU.label}](${abs(CLASSROOM_MENU.to)})`, ...classroom.map(line), '')

out.push('## English', '', '- [Ugabuga in English](https://ugabuga.co.il/en): Hebrew learning and Jewish family activities for English-speaking families.', ...ENGLISH_SECTIONS.map(s => `- [${s.title}](${abs(s.path)}): ${s.description}`), '')

const text = out.join('\n').replace(/\n{3,}/g, '\n\n')
await writeFile(new URL('../public/llms.txt', import.meta.url), text)
console.log(`generate-llms: wrote ${text.split('\n').filter(l => l.startsWith('- [')).length} links to public/llms.txt`)
