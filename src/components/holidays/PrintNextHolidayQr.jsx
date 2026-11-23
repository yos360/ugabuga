import { useEffect, useState } from 'react'
import { qrDataUri } from '../../utils/qrDataUri'

// Print-only footer on printed holiday sheets: "scan for a reminder before the next holiday".
// Hidden on screen (and in the print preview), shown by @media print. Sits at the bottom-right of the sheet;
// the site's own QR stamp (PrintPreview) keeps the bottom-left, so the two never overlap.
export const NEXT_HOLIDAY_URL = 'https://ugabuga.co.il/holidays?utm_source=print&utm_medium=qr&utm_campaign=next-holiday'

export default function PrintNextHolidayQr() {
  const [src, setSrc] = useState('')
  useEffect(() => { let alive = true; qrDataUri(NEXT_HOLIDAY_URL).then(s => { if (alive) setSrc(s) }); return () => { alive = false } }, [])
  if (!src) return null
  return (
    <div className="absolute bottom-[4mm] right-[4mm] hidden items-center gap-[2mm] print:flex" dir="rtl" aria-hidden="true">
      <img src={src} alt="" className="!h-[18mm] !w-[18mm] shrink-0" />
      <span className="max-w-[48mm] text-[9pt] font-bold leading-tight text-[#222]">📅 סרקו לתזכורת לפני החג הבא<span className="block text-[8pt] font-normal text-[#555]">ugabuga.co.il/holidays</span></span>
    </div>
  )
}
