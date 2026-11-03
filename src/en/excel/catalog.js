// English pages of this area: pure data (path, title, counterpart or unpairedReason, emoji, description).
// Read by englishRoutes.js, the sitemap scripts and the English hubs.
import { LESSONS_EN } from './lessonsEn.js'

export const EXCEL_HOME = {
  path: '/en/excel',
  title: 'Free Excel course for beginners: practice in a live sheet',
  description: 'A free Excel course in plain English, straight to practice: 10 lessons with a live spreadsheet that checks every task. Formulas, SUM, AVERAGE, IF, fill, $, sorting, charts. No Excel needed.',
  emoji: '📗',
  counterpart: '/excel',
}

export const lessonTitleEn = (lesson, i) => `${lesson.title}: Lesson ${i + 1} of the free Excel course`
export const lessonDescriptionEn = lesson => `${lesson.seo}. Hands-on practice in a live sheet inside the page, with instant checking. Free, and no Excel needed.`

export const EXCEL_PAGES = [
  EXCEL_HOME,
  ...LESSONS_EN.map((l, i) => ({
    path: `/en/excel/${l.slug}`,
    title: lessonTitleEn(l, i),
    description: lessonDescriptionEn(l),
    emoji: l.emoji,
    counterpart: `/excel/${l.slug}`,
  })),
]
