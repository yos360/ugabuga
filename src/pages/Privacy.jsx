import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
export default function Privacy() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 buga-fade-in">
      <SEO title="מדיניות פרטיות" description="מדיניות הפרטיות של אתר עוגה בוגה: איזה מידע נאסף, איך משתמשים בעוגיות ובכלי אנליטיקה, ומה הזכויות שלכם כמשתמשים." path="/privacy" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מדיניות פרטיות' }]} />
      <h1 className="text-4xl mb-6">מדיניות פרטיות</h1>
      <div className="space-y-4 font-hand text-lg leading-relaxed">
        <p>עודכן: ספטמבר 2026</p>
        <p>האתר משתמש ב-Google Analytics לאיסוף מידע סטטיסטי אנונימי. לא נמכר ולא משותף מידע אישי עם צדדים שלישיים.</p>
        <p>מחולל ברכות והזמנות מעבדים מידע בצד הלקוח בלבד — לא נשמר בשרתים שלנו.</p>
        <p>באנר הפעילות משתמש ב־Supabase Realtime להצגת מספר משוער של דפדפנים מחוברים ופתיחת פעילויות וחלונות הדפסה. מועברים רק קודי פעילות קבועים ומזהה אקראי זמני, לא שמות או תוכן שהקלדתם. המזהה נשמר בדפדפן עד 24 שעות כדי למנוע ספירה כפולה של לשוניות. הרכיב אינו שומר היסטוריית פעולות במסד הנתונים. מידע טכני על החיבור עשוי להופיע ביומני ספק השירות.</p>
        <p>לשאלות: hellohugabuga@gmail.com</p>
      </div>
    </div>
  )
}
