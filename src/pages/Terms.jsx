import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
export default function Terms() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 buga-fade-in">
      <SEO title="תנאי שימוש" description="תנאי שימוש באתר עוגה בוגה" path="/terms" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'תנאי שימוש' }]} />
      <h1 className="text-4xl mb-6">תנאי שימוש</h1>
      <div className="space-y-4 font-hand text-lg leading-relaxed">
        <p>עודכן: ספטמבר 2026</p>
        <p>השימוש באתר עוגה בוגה (ugabuga.co.il) מהווה הסכמה לתנאים אלה. האתר מספק תוכן חינם לשימוש אישי ולא מסחרי.</p>
        <p>המשחקים והפעילויות מיועדים להנחיה כללית. האחריות על ביצוע בטוח מוטלת על המפעיל.</p>
        <p>כל התוכן באתר הוא רכוש עוגה בוגה. אין להעתיק ללא אישור.</p>
        <p>לשאלות: hellohugabuga@gmail.com</p>
      </div>
    </div>
  )
}
