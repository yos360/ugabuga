import { Link } from 'react-router-dom'

function FooterLink({ to, children }) {
  return <li><Link to={to} className="flex min-h-[44px] w-full items-center py-1.5 hover:underline underline-offset-4">{children}</Link></li>
}

function FooterColumn({ title, children }) {
  return <div><h2 className="text-xl">{title}</h2><ul className="mt-2 text-lg">{children}</ul></div>
}

export default function Footer() {
  return (
    <footer className="site-footer mt-16 border-t border-[var(--border)] no-print">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FooterColumn title="משחקים">
            <FooterLink to="/games/all">כל המשחקים</FooterLink>
            <FooterLink to="/games/kita-a">לפי כיתה</FooterLink>
            <FooterLink to="/games/no-equipment">בלי ציוד</FooterLink>
            <FooterLink to="/games/5-minutes">5 דקות</FooterLink>
            <FooterLink to="/games/birthday">יום הולדת</FooterLink>
            <FooterLink to="/games/icebreaker">שובר קרח</FooterLink>
            <FooterLink to="/games/movement">תנועה</FooterLink>
            <FooterLink to="/games/quiet">שקטים</FooterLink>
            <FooterLink to="/game-of-the-day">משחק היום</FooterLink>
          </FooterColumn>
          <FooterColumn title="השראה">
            <FooterLink to="/ideas">עולם ההשראה</FooterLink>
            <FooterLink to="/ideas/themes">לפי נושא</FooterLink>
            <FooterLink to="/ideas/at-home">יום הולדת בבית</FooterLink>
            <FooterLink to="/ideas/what-to-do-at-home">מה לעשות בבית</FooterLink>
            <FooterLink to="/ideas/what-to-do-rainy-day">יום גשום</FooterLink>
            <FooterLink to="/ideas/what-to-do-summer">חופש הגדול</FooterLink>
            <FooterLink to="/ideas/first-birthday">יום הולדת שנה</FooterLink>
            <FooterLink to="/ideas/age/30">יום הולדת 30</FooterLink>
            <FooterLink to="/ideas/bachelorette-party">מסיבת רווקות</FooterLink>
          </FooterColumn>
          <FooterColumn title="כלים">
            <FooterLink to="/calculator">מחשבון מסיבה</FooterLink>
            <FooterLink to="/greeting">מחולל ברכות</FooterLink>
            <FooterLink to="/invitation">מחולל הזמנות</FooterLink>
            <FooterLink to="/tools/team-generator">מחלק קבוצות</FooterLink>
            <FooterLink to="/tools/random-picker">גלגל שמות</FooterLink>
            <FooterLink to="/tools/countdown-timer">טיימר למסיבה</FooterLink>
            <FooterLink to="/tools/truth-or-buga">אמת או בוגה</FooterLink>
            <FooterLink to="/tools/dice">קוביה וירטואלית</FooterLink>
            <FooterLink to="/tools/coin-flip">הטלת מטבע</FooterLink>
            <FooterLink to="/tools/scoreboard">לוח ניקוד</FooterLink>
            <FooterLink to="/tools/spin-the-bottle">סובב את הבקבוק</FooterLink>
            <FooterLink to="/tools/drawing-prompt">מה לצייר?</FooterLink>
            <FooterLink to="/tools/joke">בדיחה של BUGA</FooterLink>
            <FooterLink to="/printables">דפים להדפסה</FooterLink>
            <FooterLink to="/gifts">מתנות</FooterLink>
          </FooterColumn>
          <FooterColumn title="אודות">
            <FooterLink to="/about">אודות עוגה בוגה</FooterLink>
            <FooterLink to="/faq">שאלות נפוצות</FooterLink>
            <FooterLink to="/guides">כל המדריכים</FooterLink>
            <FooterLink to="/guides/how-to-plan-birthday">איך מתכננים יום הולדת</FooterLink>
            <FooterLink to="/blog">טיפים ורעיונות</FooterLink>
            <FooterLink to="/compare/home-vs-venue">בית או אולם</FooterLink>
            <FooterLink to="/ideas/what-to-do-weekend">פעילות לסוף שבוע</FooterLink>
            <FooterLink to="/terms">תנאי שימוש</FooterLink>
            <FooterLink to="/privacy">מדיניות פרטיות</FooterLink>
          </FooterColumn>
        </div>
        <div className="mt-8 border-t border-[var(--border)] pt-6 text-base">
          <a href="mailto:hellohugabuga@gmail.com" className="flex min-h-[44px] items-center underline decoration-dashed" dir="ltr">📧 hellohugabuga@gmail.com</a>
          <p className="mt-2">רעיון למשחק? תיקון? שאלה? כתבו לנו בוואטסאפ: <a href="https://wa.me/972507772930" target="_blank" rel="noopener noreferrer" className="underline decoration-dashed">050-7772930</a></p>
          <p className="mt-2">ספקים שמעוניינים להצטרף — נא לפנות בוואטסאפ: <a href="https://wa.me/972507772930" target="_blank" rel="noopener noreferrer" className="underline decoration-dashed">050-7772930</a></p>
          <p className="mt-4 text-[var(--muted-foreground)]">עוגה בוגה 🎂 מאגר משחקים ופעילויות בעברית — כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  )
}
