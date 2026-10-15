import { Link } from 'react-router-dom'

export default function ShabbatActivityLink() {
  return <aside className="rounded-2xl border-2 border-[var(--border)] bg-[var(--postit)] p-4 my-6" dir="rtl"><h2 className="text-xl font-bold">הכנה לשבת: חבילת משחקים להדפסה</h2><p className="my-2">חידון פרשת השבוע, ארץ עיר בעל־פה, חידות ומי אני — חמישה דפים שמדפיסים וגוזרים לפני שבת.</p><Link to="/shabbat-activities/pack" className="inline-flex min-h-[44px] items-center underline font-bold">לחבילת השבת המוכנה ←</Link><span className="mx-3">·</span><Link to="/shabbat-activities" className="inline-flex min-h-[44px] items-center underline font-bold">לכל הפעילויות</Link></aside>
}
