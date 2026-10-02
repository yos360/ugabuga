import { useState } from 'react'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { Link } from 'react-router-dom'
import { FAQ_TOPICS } from '../data/faqTopics'

const QA = [
  {q:'האם השימוש באתר חינם?', a:'כן, לגמרי. כל המשחקים, הכלים, ודפי ההדפסה חינם ותמיד יהיו.'},
  {q:'צריך להירשם כדי להשתמש?', a:'לא. אין הרשמה, אין התחברות. פותחים ומשתמשים.'},
  {q:'איך מוצאים משחק שמתאים לי?', a:'תשתמשו בסינון לפי גיל, זמן, ציוד, או מטרה בדף "כל המשחקים", או פשוט חפשו בתיבת החיפוש.'},
  {q:'האם הדפים להדפסה עובדים בכל מדפסת?', a:'כן, כל הדפים מותאמים ל-A4 רגיל ועובדים בכל מדפסת ביתית.'},
  {q:'איך אני מציע משחק חדש?', a:'שלחו לנו מייל או וואטסאפ — נשמח לשמוע!'},
  {q:'האם אפשר להשתמש באתר למטרות מסחריות?', a:'האתר מיועד לשימוש אישי וחינוכי. לשאלות על שימוש מסחרי, צרו קשר.'},
]

export default function FAQ() {
  const [open, setOpen] = useState(null)
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 buga-fade-in">
      <SEO title="שאלות נפוצות" description="תשובות לשאלות נפוצות על עוגה בוגה — משחקים, הדפסות, ושימוש באתר." path="/faq" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שאלות נפוצות' }]} />
      <h1 className="text-4xl text-center mb-8">❓ שאלות נפוצות</h1>
      <div className="space-y-3">
        {QA.map((item, i) => (
          <div key={i} className="wobbly-md border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow-sm overflow-hidden">
            <button onClick={() => setOpen(open===i?null:i)} aria-expanded={open===i} aria-controls={'faq-panel-'+i} className="w-full text-right p-4 font-display text-lg font-bold flex justify-between items-center cursor-pointer">
              {item.q}<span aria-hidden="true">{open===i?'−':'+'}</span>
            </button>
            {open===i && <div id={'faq-panel-'+i} className="px-4 pb-4 font-hand text-lg buga-slide-down">{item.a}</div>}
          </div>
        ))}
      </div>
      <h2 className="text-2xl mt-10 mb-3">שאלות לפי נושא</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {Object.entries(FAQ_TOPICS).map(([k, t]) => <Link key={k} to={'/faq/' + k} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] p-4 font-bold">{t.emoji} {t.title}</Link>)}
      </div>
    </div>
  )
}
