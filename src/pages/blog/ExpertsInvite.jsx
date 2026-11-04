import { Link } from 'react-router-dom'
import { EXPERTS_EMAIL } from '../../data/blogPosts'

// Shown under every guest article and on /experts: invites more people who teach something to send an article.
export default function ExpertsInvite({ full = false }) {
  const subject = encodeURIComponent('מאמר להמומחים של עוגה בוגה')
  return (
    <section id="write" className="mt-8 rounded-3xl border-2 border-violet-200 bg-violet-50 p-6" aria-labelledby="experts-invite">
      <h2 id="experts-invite" className="text-2xl font-hand font-bold">✍️ גם אתם מומחים במשהו? כתבו אצלנו</h2>
      <p className="mt-2 leading-relaxed">מלמדים סריגה, ציור, בישול, מוזיקה, שחמט, תכנות או כל דבר אחר שילדים והורים אוהבים? שלחו לנו מאמר, ואם הוא מתאים, נפרסם אותו במדור <Link to="/experts" className="font-bold underline">המומחים של עוגה בוגה</Link> עם שמכם וקישור לאתר שלכם.</p>
      {full && <ul className="mt-3 space-y-2 list-none pr-0">
        {['מאמר מקורי שלא פורסם במקום אחר, בעברית, 400–1,200 מילים.', 'מעשי ומתאים להורים, לסבים ולסבתות, למורות או לילדים: מה עושים, מאיזה גיל ואיך.', 'עד שני קישורים לאתר שלכם: אחד בתוך המאמר ואחד בשורה על הכותב.', 'בלי פרסום ישיר, בלי מבצעים ובלי תוכן שלא מתאים לילדים.', 'אנחנו עורכים, מקצרים ומתקנים לפי הצורך, ומפרסמים רק מה שמתאים לאתר.'].map(x => <li key={x} className="flex gap-3"><span className="mt-1">⭐</span><span>{x}</span></li>)}
      </ul>}
      <a href={`mailto:${EXPERTS_EMAIL}?subject=${subject}`} className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-700">📧 שלחו מאמר למייל: {EXPERTS_EMAIL}</a>
    </section>
  )
}
