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
            <FooterLink to="/games">כל המשחקים</FooterLink>
            <FooterLink to="/games/kindergarten">משחקים לגן</FooterLink>
            <FooterLink to="/games/kita-a">משחקים לכיתה א׳</FooterLink>
            <FooterLink to="/games/no-equipment">בלי ציוד</FooterLink>
            <FooterLink to="/games/5-minutes">5 דקות</FooterLink>
            <FooterLink to="/games/icebreaker">שובר קרח</FooterLink>
            <FooterLink to="/games/movement">תנועה</FooterLink>
            <FooterLink to="/games/quiet">שקטים</FooterLink>
            <FooterLink to="/game-of-the-day">משחק היום</FooterLink>
          </FooterColumn>
          <FooterColumn title="יום הולדת">
            <FooterLink to="/birthday">כל מה שצריך ליום הולדת</FooterLink>
            <FooterLink to="/calculator">מחשבון מסיבה</FooterLink>
            <FooterLink to="/invitation">מחולל הזמנות</FooterLink>
            <FooterLink to="/greeting">מחולל ברכות</FooterLink>
            <FooterLink to="/games/birthday">משחקים ליום הולדת</FooterLink>
            <FooterLink to="/ideas">רעיונות והשראה</FooterLink>
            <FooterLink to="/ideas/at-home">יום הולדת בבית</FooterLink>
            <FooterLink to="/gifts">רעיונות למתנות</FooterLink>
            <FooterLink to="/suppliers">ספקים לימי הולדת</FooterLink>
          </FooterColumn>
          <FooterColumn title="לכיתה ויוצרים">
            <FooterLink to="/classroom">כל הכלים לכיתה</FooterLink>
            <FooterLink to="/classroom/quiz">מבחן אמריקאי אונליין</FooterLink>
            <FooterLink to="/classroom/first-grade">הכנה לכיתה א׳</FooterLink>
            <FooterLink to="/printables/roots-project">עבודת שורשים</FooterLink>
            <FooterLink to="/create">יוצרים — כל המחוללים</FooterLink>
            <FooterLink to="/printables">דפים להדפסה</FooterLink>
            <FooterLink to="/printables/coloring">דפי צביעה</FooterLink>
            <FooterLink to="/tools/crossword-maker">מחולל תשבצים</FooterLink>
            <FooterLink to="/tools">כל הכלים</FooterLink>
          </FooterColumn>
          <FooterColumn title="אודות">
            <FooterLink to="/about">אודות עוגה בוגה</FooterLink>
            <FooterLink to="/faq">שאלות נפוצות</FooterLink>
            <FooterLink to="/guides">כל המדריכים</FooterLink>
            <FooterLink to="/guides/how-to-plan-birthday">איך מתכננים יום הולדת</FooterLink>
                        <FooterLink to="/compare/home-vs-venue">בית או אולם</FooterLink>
            <FooterLink to="/ideas/what-to-do-weekend">פעילות לסוף שבוע</FooterLink>
            <FooterLink to="/terms">תנאי שימוש</FooterLink>
            <FooterLink to="/privacy">מדיניות פרטיות</FooterLink>
          </FooterColumn>
        </div>
        <div className="mt-8 border-t border-[var(--border)] pt-6 text-base">
          <a href="mailto:hellohugabuga@gmail.com" className="flex min-h-[44px] items-center underline decoration-dashed" dir="ltr">📧 hellohugabuga@gmail.com</a>
          <p className="mt-2">רעיון למשחק? תיקון? שאלה? כתבו לנו בוואטסאפ: <a href="https://wa.me/972507772930" target="_blank" rel="noopener noreferrer" className="underline decoration-dashed">050-7772930</a></p>
          <p className="mt-2">🎪 נותנים שירות לימי הולדת? <Link to="/suppliers/me" className="underline decoration-dashed">הצטרפו למאגר הספקים בחינם</Link></p>
          <p className="mt-4 text-[var(--muted-foreground)]">עוגה בוגה 🎂 מאגר משחקים ופעילויות בעברית — כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  )
}
