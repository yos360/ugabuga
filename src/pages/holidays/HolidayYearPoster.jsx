import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { SCHOOL_YEAR_5787, dateLabel } from '../../data/holidayDates'
import { qrDataUri } from '../../utils/qrDataUri'

const PATH = '/holidays/year-poster'
const TITLE = 'לוח החגים של הכיתה — תשפ״ז'
const TINTS = ['#f59e0b', '#ec4899', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444']
const qrUrl = h => `https://ugabuga.co.il${h.path}?utm_source=print&utm_medium=qr&utm_campaign=year-poster`
// First part of the dates sentence (before " · "), which holds the main day(s).
const shortDates = h => h.datesText.split(' · ')[0]

function Qr({ h }) {
  const [src, setSrc] = useState('')
  useEffect(() => { let alive = true; qrDataUri(qrUrl(h)).then(s => { if (alive) setSrc(s) }); return () => { alive = false } }, [h])
  return src ? <img src={src} alt="" className="!h-[15mm] !w-[15mm] shrink-0" /> : <span className="inline-block h-[15mm] w-[15mm] shrink-0" />
}

// One A4 sheet: two columns of holidays, ink-friendly (white page, coloured edge bars and light outlines only).
function Poster() {
  return (
    <div className="flex h-full w-full flex-col" dir="rtl">
      <div className="mb-[3mm] text-center">
        <div className="text-[22pt] font-black leading-tight text-[#2b1d4d]">🗓️ {TITLE}</div>
        <div className="text-[10pt] text-[#555]">סורקים את הקוד ליד כל חג ומקבלים דפי עבודה, שירים ופעילויות · ugabuga.co.il</div>
      </div>
      <div className="grid flex-1 grid-cols-2 content-start gap-x-[3mm] gap-y-[2.5mm]">
        {SCHOOL_YEAR_5787.map((h, i) => (
          <div key={h.slug + h.start} className="flex items-center gap-[2mm] rounded-[3mm] border border-[#ccc] bg-white py-[1.5mm] pe-[2mm] ps-[3mm]" style={{ borderInlineStartWidth: '2.5mm', borderInlineStartColor: TINTS[i % TINTS.length] }}>
            <span className="text-[24pt] leading-none" aria-hidden="true">{h.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[13pt] font-black leading-tight text-[#2b1d4d]">{h.name}</div>
              <div className="text-[8.5pt] font-bold leading-snug text-[#c2185b]">{dateLabel(h.start)}</div>
              <div className="text-[7.5pt] leading-snug text-[#555]">{shortDates(h)}</div>
            </div>
            <Qr h={h} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HolidayYearPoster() {
  const [print, setPrint] = useState(false)
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="לוח החגים של הכיתה תשפ״ז להדפסה" description="לוח חגים שנתי לתלייה בכיתה, תשפ״ז: כל החגים לפי הסדר עם תאריכים וקוד QR לחומרים של כל חג. דף A4 אחד, בחינם." path={PATH} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, { label: 'לוח החגים השנתי' }]} />
      <h1 className="mb-2 text-center text-4xl sm:text-5xl">🗓️ {TITLE}</h1>
      <p className="mb-5 text-center font-hand text-lg text-[var(--muted-foreground)]">דף A4 אחד לתלייה בכיתה: כל חגי השנה לפי הסדר, ולכל חג קוד QR לחומרים</p>
      <div className="mb-6 text-center">
        <button data-print-main type="button" onClick={() => setPrint(true)} className="min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">🖨️ הדפסת הלוח</button>
      </div>
      <ol className="mb-8 grid gap-3 sm:grid-cols-2">
        {SCHOOL_YEAR_5787.map((h, i) => (
          <li key={h.slug + h.start}>
            <Link to={h.path} className="flex items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-3 hover:bg-[var(--muted)]" style={{ borderInlineStartWidth: 10, borderInlineStartColor: TINTS[i % TINTS.length] }}>
              <span className="text-4xl" aria-hidden="true">{h.emoji}</span>
              <span className="flex-1"><b className="block text-xl">{h.name}</b><span className="block text-sm font-bold text-pink-700">{dateLabel(h.start)}</span><span className="block text-sm text-[var(--muted-foreground)]">{shortDates(h)}</span></span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="text-center"><Link to="/holidays/countdown" className="font-bold underline decoration-dashed">⏳ ספירה לאחור לחג הקרוב, תמונה לסטטוס ←</Link></p>
      {print && <PrintPreview title={TITLE} onClose={() => setPrint(false)} copies={false}><article className="buga-a4"><div className="print-art !items-start"><Poster /></div></article></PrintPreview>}
    </div>
  )
}
