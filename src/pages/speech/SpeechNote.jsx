// The short professional note shown on every /speech page (same text everywhere).
export const SPEECH_NOTE = 'התכנים כאן נועדו לתרגול ולהעשרה ואינם מחליפים הערכה או טיפול של קלינאי/ת תקשורת מוסמך/ת. אם יש דאגה לגבי הדיבור או השפה של הילד/ה — כדאי לפנות לקלינאי/ת תקשורת, וגם לבדוק שמיעה.'

export default function SpeechNote({ className = '' }) {
  return <aside role="note" aria-label="הערה מקצועית" dir="rtl"
    className={`mx-auto my-6 max-w-3xl rounded-2xl border border-dashed border-[var(--border)] bg-[var(--postit)] p-4 text-center leading-relaxed ${className}`}>
    <span aria-hidden="true">ℹ️ </span>{SPEECH_NOTE}
  </aside>
}
