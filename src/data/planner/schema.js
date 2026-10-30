// The teachers' timetable planner (/planner): per subject and grade, the year's units in the official
// Ministry of Education order (docs/curriculum/*.md). Each subject file exports SEQUENCES:
//
// { subject: 'math'|'tanakh'|'english', grade: 1..12, hoursPerWeek, official: true|false,
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
//       // link types: 'math-topic' (slug from src/math/topics/gradeN.js), 'tanakh-topic' (slug from
//       // src/learn/subjects/data/tanakh*.js), 'parasha' (slug from src/data/parasha/*.js), 'grammar'
//       // (src/data/englishGrammar), 'vocab' ('grade-N/unit-slug' from src/data/englishVocab.js),
//       // 'reading' (src/data/englishReading.js), 'unseen' (slug from src/data/unseen/index.js),
//       // 'booklet' (slug from src/booklets/registry.js). Only slugs that exist.
//   }],
// }
export const PLANNER_SUBJECTS = {
  math: { title: 'מתמטיקה', emoji: '🧮' },
  tanakh: { title: 'תנ״ך', emoji: '📖' },
  english: { title: 'אנגלית', emoji: '🔤' },
}
export const LINK_TYPES = ['math-topic', 'tanakh-topic', 'parasha', 'grammar', 'vocab', 'reading', 'unseen', 'booklet']
