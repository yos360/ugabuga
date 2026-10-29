import { Link } from 'react-router-dom'

// "Organizing a Hanukkah party?" — the event tools, linked from the Hanukkah hub and the party ideas page.
// The bring-list tool has no templates, so the foods are suggestions in text only.
export default function HanukkahOrganize({ className = '' }) {
  return <section className={`rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5 ${className}`} aria-labelledby="hk-organize">
    <h2 id="hk-organize" className="text-2xl font-bold">🎉 מארגנים מסיבת חנוכה?</h2>
    <p className="mt-1 text-[var(--muted-foreground)]">שלוש דקות והכול מסודר — בחינם, בלי הרשמה, ושולחים בוואטסאפ.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      <Link to="/rsvp/class-party" className="rounded-2xl border-2 border-slate-800 bg-white p-4 transition hover:-translate-y-0.5">
        <span className="text-3xl" aria-hidden="true">✅</span>
        <b className="mt-1 block text-lg">אישורי הגעה למסיבה</b>
        <span className="text-sm">מסיבת חנוכה של כיתה או גן: רואים מי מגיע ומי מביא ילדים.</span>
      </Link>
      <Link to="/tools/bring-list" className="rounded-2xl border-2 border-slate-800 bg-white p-4 transition hover:-translate-y-0.5">
        <span className="text-3xl" aria-hidden="true">🧺</span>
        <b className="mt-1 block text-lg">מי מביא מה?</b>
        <span className="text-sm">רשימה משותפת. רעיונות לפריטים: סופגניות, לביבות, נרות, גפרורים, סביבונים וגלגלי שוקולד.</span>
      </Link>
      <Link to="/secret-friend?mode=hanukkah" className="rounded-2xl border-2 border-slate-800 bg-white p-4 transition hover:-translate-y-0.5">
        <span className="text-3xl" aria-hidden="true">🎁</span>
        <b className="mt-1 block text-lg">הגרלת מתנות לחנוכה</b>
        <span className="text-sm">כל אחד מקבל בסוד שם אחד, ומכין לו מתנה קטנה.</span>
      </Link>
    </div>
  </section>
}
