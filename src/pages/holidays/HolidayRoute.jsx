import HolidayQuiz from './HolidayQuiz'
import HolidayPrintables from './HolidayPrintables'
import HolidayList from './HolidayList'
import HolidayHub from './HolidayHub'
import { useParams } from 'react-router-dom'
import NotFound from '../NotFound'
import { HOLIDAY_CONFIGS } from '../../holidays'

// One lazy entry for the shared holiday pages: <HolidayRoute slug="purim" kind="quiz" />.
// kind: 'hub' | 'quiz' | 'coloring' | 'worksheets' | any key of h.lists (e.g. 'what-to-do', 'costumes').
export default function HolidayRoute(props) {
  const params = useParams()
  const slug = props.slug || params.slug, kind = props.kind || params.kind || 'hub'
  const h = HOLIDAY_CONFIGS[slug]
  if (!h) return <NotFound />
  const key = slug + kind
  if (kind === 'hub') return <HolidayHub key={key} h={h} />
  if (kind === 'quiz') return <HolidayQuiz key={key} h={h} />
  if (h.printables?.[kind]) return <HolidayPrintables key={key} h={h} kind={kind} />
  if (h.lists?.[kind]) return <HolidayList key={key} h={h} listKey={kind} />
  return <NotFound />
}
