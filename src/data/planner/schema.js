// The teachers' timetable planner (/planner): per subject and grade, the year's units in the official
// Ministry of Education order (docs/curriculum/*.md). Each subject file exports SEQUENCES:
//
// { subject: <a key of PLANNER_SUBJECTS>, grade: 1..12, hoursPerWeek, official: true|false,
//   source: { title, url },               // the ministry document this order comes from
//   note?: 'one sentence when the order is recommended, not official',
//   units: [{
//     id: 'kebab-case, unique within the sequence',
//     title: 'Hebrew unit title',
//     hours: <number of lessons (45 min) the unit takes>,
//     goals: ['what pupils know/can do at the end', ...],     // 2–4
//     concepts: ['key terms', ...],                           // 0–8
//     steps: [{ title, goal, activity, practice, links: [{ type, slug }] }, ...]
//       // 1..hours ordered sub-steps; lesson i of the unit uses steps[floor(i * steps.length / hours)].
//       // title: what this lesson teaches; goal: one sentence; activity: how to explain/demonstrate it
//       // (2–3 sentences); practice: what pupils do (1–2 sentences).
//   }],
//   calendar?: [{ from: 'YYYY-MM-DD', to: 'YYYY-MM-DD', title, goals, steps }],
//     // homeroom (שעת חינוך) only: dated units (holidays, memorial days, the start and end of the year).
//     // A period whose date falls in a window gets that unit; other weeks follow `units` in order.
// }
//
// Link types and their slugs (only slugs that exist):
//   'math-topic'    slug from src/math/topics/gradeN.js (same grade)
//   'tanakh-topic'  slug from src/learn/subjects/data/tanakh*.js
//   'lesson'        '<subject key>/<slug>' — any school-subject lesson (src/learn/subjects/subjects.js
//                   keys: lashon, science, history, geography, civics, …; slugs from their data files)
//   'parasha'       slug from src/data/parasha/*.js
//   'grammar' 'vocab' ('grade-N/unit') 'reading' 'unseen' — English (src/data/english*.js, unseen/index.js)
//   'heb-reading'   slug from src/learn/readingGrades.js (Hebrew reading comprehension passages)
//   'booklet'       slug from src/booklets/registry.js
//   'page'          a site path starting with '/' (holiday pages, printables…) — must be a real route
export const PLANNER_SUBJECTS = {
  math: { title: 'מתמטיקה', emoji: '🧮' },
  lashon: { title: 'לשון', emoji: '✍️' },
  english: { title: 'אנגלית', emoji: '🔤' },
  tanakh: { title: 'תנ״ך', emoji: '📖' },
  science: { title: 'מדע וטכנולוגיה', emoji: '🔬' },
  geography: { title: 'מולדת וגאוגרפיה', emoji: '🗺️' },
  history: { title: 'היסטוריה', emoji: '🏺' },
  civics: { title: 'אזרחות', emoji: '🏛️' },
  homeroom: { title: 'שעת חינוך', emoji: '🤝' },
}
export const LINK_TYPES = ['math-topic', 'tanakh-topic', 'lesson', 'parasha', 'grammar', 'vocab', 'reading', 'unseen', 'heb-reading', 'booklet', 'page']
