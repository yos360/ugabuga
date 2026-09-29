import HolidayQuiz from './HolidayQuiz'
import HolidayPrintables from './HolidayPrintables'
import HolidayIdeas from './HolidayIdeas'
import { HOLIDAY_CONFIGS } from '../../holidays'

// One lazy entry for the shared holiday pages: <HolidayRoute slug="hanukkah" kind="quiz" />.
export default function HolidayRoute({ slug, kind }) {
  const h = HOLIDAY_CONFIGS[slug]
  if (kind === 'quiz') return <HolidayQuiz key={slug + kind} h={h} />
  if (kind === 'what-to-do') return <HolidayIdeas key={slug + kind} h={h} />
  return <HolidayPrintables key={slug + kind} h={h} kind={kind} />
}
