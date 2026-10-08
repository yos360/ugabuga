import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import ClassicDice from './dice/ClassicDice'
import DiceFamilyLinks from './dice/DiceFamilyLinks'
import { DICE_GAMES } from '../../data/diceGames'

export default function DiceTool() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in">
      <SEO title="קוביה דיגיטלית אונליין — קובייה וירטואלית בלחיצה, חינם" description="קוביה אונליין למשחקי קופסה: מטילים 1 עד 5 קוביות בלחיצה, עם סכום אוטומטי. בלי הורדה ובלי הרשמה — עובד בטלפון ובמחשב. הקובייה אבדה? יש לכם אחת כאן." path="/tools/dice" structuredData={faqSchema(DICE_FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'קובייה' }]} />
      <h1 className="text-4xl text-center mb-2">🎲 קוביה דיגיטלית אונליין</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">קובייה וירטואלית: להטיל קובייה בלחיצה — 1 עד 5 קוביות, בחינם</p>
      <ClassicDice />

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-center mb-4">🏆 משחקים שאפשר לשחק עכשיו עם הקובייה</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {DICE_GAMES.map(g => (
            <Link key={g.slug} to={'/dice-games/' + g.slug} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] p-3 block">
              <strong className="text-lg">{g.emoji} {g.title}</strong>
              <span className="block text-sm text-[var(--muted-foreground)]">{g.dice} {g.dice === 1 ? 'קובייה' : 'קוביות'} · גיל {g.ages} · {g.time}</span>
            </Link>
          ))}
        </div>
      </section>

      <DiceFamilyLinks current="/tools/dice" />

      <div className="mt-10">
        <SeoBody
          paragraphs={[
            'הקובייה הווירטואלית מחליפה קובייה רגילה בכל משחק קופסה: סולמות ונחשים, מונופול, לודו, שש־בש או כל משחק שהקובייה שלו הלכה לאיבוד. לוחצים על "הטילו!" ומקבלים תוצאה אקראית בין 1 ל־6, בדיוק כמו קובייה אמיתית.',
            'אפשר להטיל עד חמש קוביות יחד, והסכום מחושב אוטומטית. הקובייה הדיגיטלית עובדת בטלפון, בטאבלט ובמחשב, בלי להוריד אפליקציה ובלי הרשמה — שומרים את העמוד ומשתמשים בו בכל משחק.',
          ]}
          faq={DICE_FAQ}
          related={[{ label: 'משחקי לוח אונליין', href: '/board-games' }, { label: 'סולמות ונחשים להדפסה', href: '/printables/board-game' }, { label: 'משחקי קוביות', href: '/dice-games' }, { label: 'קוביות לשש בש', href: '/tools/dice/backgammon' }, { label: 'קובייה להדפסה', href: '/printables/dice-template' }]}
        />
      </div>
    </div>
  )
}

const DICE_FAQ = [
  { q: 'האם הקובייה הווירטואלית באמת אקראית?', a: 'כן. כל הטלה בוחרת מספר בין 1 ל־6 באופן אקראי, וכל מספר מופיע באותה הסתברות — כמו בקובייה אמיתית והוגנת.' },
  { q: 'איך מטילים קובייה אונליין?', a: 'בוחרים כמה קוביות רוצים (1 עד 5) ולוחצים על "הטילו!". התוצאה והסכום מופיעים מיד, ורשימת ההטלות האחרונות נשמרת מתחת.' },
  { q: 'צריך להוריד אפליקציה?', a: 'לא. הקובייה הדיגיטלית עובדת ישר מהדפדפן, בטלפון ובמחשב, בחינם ובלי הרשמה.' },
]

