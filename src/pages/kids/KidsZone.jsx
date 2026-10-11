import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import { speak } from '../../utils/speak'
import { KIDS_TILES } from '../../data/kidsZone'
import './kids-zone.css'

// /kids — a page a child (about 4–9) can browse alone: big picture tiles, very little text, a 🔊 on
// each tile that reads its name aloud. Only on-screen activities from this site: no printing, no
// forms, no share buttons, no supplier or outside links (Layout also hides the WhatsApp button here).
const SAY_TITLE = 'מה בא לך לעשות?'

function SayButton({ text, className = '' }) {
  return <button type="button" className={`kz-say ${className}`} aria-label={`להשמיע: ${text}`} onClick={() => speak(text)}>
    <span aria-hidden="true">🔊</span>
  </button>
}

export default function KidsZone() {
  return <div className="kz" dir="rtl">
    <SEO
      title="אזור ילדים — משחקים, צביעה וסיפורים לילדים"
      description="אזור ילדים בעוגה בוגה: משחקים על המסך, צביעה אונליין, סיפורים מוקלטים, אותיות, מספרים ופסנתר — אריחים גדולים עם קול, לילדים בני 4–9 שגולשים לבד. בלי פרסומות ובלי קישורים החוצה."
      path="/kids"
    />
    <header className="kz-head">
      <h1><span aria-hidden="true">🧸 </span>אזור ילדים</h1>
      <p className="kz-sub">{SAY_TITLE} <SayButton text={SAY_TITLE} className="is-small" /></p>
    </header>
    <ul className="kz-grid">
      {KIDS_TILES.map(t => <li key={t.to} className="kz-tile" style={{ '--kz-bg': t.bg }}>
        <Link to={t.to} className="kz-link">
          <span className="kz-emoji" aria-hidden="true">{t.emoji}</span>
          <span className="kz-label">{t.label}</span>
        </Link>
        <SayButton text={t.label} />
      </li>)}
    </ul>
    <aside className="kz-parents" aria-label="להורים">
      <p><b>להורים:</b> כאן יש רק פעילויות על המסך מתוך האתר — משחקים, צביעה, סיפורים מוקלטים, אותיות, מספרים ופסנתר. האריחים לא מובילים לפרסומות או לאתרים אחרים, ואין בעמוד טפסים או כפתורי שיתוף.</p>
    </aside>
  </div>
}
