import SEO from '../components/ui/SEO'
import WobblyCard from '../components/ui/WobblyCard'
import Breadcrumbs from '../components/ui/Breadcrumbs'

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO title="אודות" description="עוגה בוגה — מאגר המשחקים הגדול בישראל בעברית. חינם, למורים, להורים, ולכל מי שצריך רעיון." path="/about" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אודות' }]} />
      <h1 className="text-4xl font-hand font-bold text-center mb-8">🎂 אודות עוגה בוגה</h1>
      <WobblyCard hover={false} padding="p-8">
        <div className="space-y-6 leading-relaxed text-lg">
          <p>עוגה בוגה (UGABUGA) הוא מאגר המשחקים והפעילויות הגדול בישראל בעברית.</p>
          <p>בנינו את עוגה בוגה כי נמאס לנו לחפש בגוגל "משחקים ליום הולדת" ולקבל 10 אתרים עם אותם 5 רעיונות.</p>
          <p>רצינו מקום אחד שבו מורה תמצא משחק ב-10 שניות, הורה יתכנן מסיבה בלי 15 אתרים, וגננת תפתח את הטלפון ותתחיל לשחק — בלי מאמר של 2,000 מילה.</p>
          <h2 className="text-2xl font-hand font-bold mt-8">כמה זה עולה?</h2>
          <p className="text-2xl font-bold">חינם. הכל. תמיד.</p>
          <h2 className="text-2xl font-hand font-bold mt-8">רוצים לדבר?</h2>
          <p>📧 hellohugabuga@gmail.com</p>
        </div>
      </WobblyCard>
    </div>
  )
}
