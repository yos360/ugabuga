import HolidayShell from '../holidays/HolidayShell'
import { HANUKKAH_H } from '../../holidays/hanukkah'

// Hanukkah pages that aren't generic (hub, dreidel) still use this wrapper.
export const HANUKKAH_PAGES = HANUKKAH_H.pages
export default function HanukkahShell({ crumb, children }) {
  return <HolidayShell h={HANUKKAH_H} crumb={crumb}>{children}</HolidayShell>
}
