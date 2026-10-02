import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import DiceRoller from './dice/DiceRoller'
import DiceFamilyLinks from './dice/DiceFamilyLinks'
import { DICE_GAMES } from '../../data/diceGames'

export default function DiceTool() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="קוביה וירטואלית אונליין — הטלת קוביה בלחיצה, חינם" description="קוביה דיגיטלית למשחקי קופסה: מטילים 1 עד 5 קוביות בלחיצה, עם סכום אוטומטי. בלי הורדה ובלי הרשמה — עובד בטלפון ובמחשב. הקוביה אבדה? יש לכם אחת כאן." path="/tools/dice" structuredData={faqSchema(DICE_FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'קוביה' }]} />
      <h1 className="text-4xl text-center mb-2">🎲 קוביה וירטואלית אונליין</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">להטיל קוביה בלחיצה — 1 עד 5 קוביות, בחינם</p>
      <DiceRoller counts={[1, 2, 3, 4, 5]} />
      <p className="hidden [@media(hover:hover)]:block text-center font-hand text-sm text-[var(--muted-foreground)] mt-4">💡 הזיזו את העכבר מעל הקוביה — היא תסתובב!</p>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-center mb-4">🏆 משחקים שאפשר לשחק עכשיו עם הקוביה</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {DICE_GAMES.map(g => (
            <Link key={g.slug} to={'/dice-games/' + g.slug} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] p-3 block">
              <strong className="text-lg">{g.emoji} {g.title}</strong>
              <span className="block text-sm text-[var(--muted-foreground)]">{g.dice} {g.dice === 1 ? 'קוביה' : 'קוביות'} · גיל {g.ages} · {g.time}</span>
            </Link>
          ))}
        </div>
      </section>

      <DiceFamilyLinks current="/tools/dice" />

      <div className="mt-10">
        <SeoBody
          paragraphs={[
            'הקוביה הווירטואלית מחליפה קוביה רגילה בכל משחק קופסה: סולמות ונחשים, מונופול, לודו, שש־בש או כל משחק שהקוביה שלו הלכה לאיבוד. לוחצים על "הטילו!" ומקבלים תוצאה אקראית בין 1 ל־6, בדיוק כמו קוביה אמיתית.',
            'אפשר להטיל עד חמש קוביות יחד, והסכום מחושב אוטומטית. הקוביה הדיגיטלית עובדת בטלפון, בטאבלט ובמחשב, בלי להוריד אפליקציה ובלי הרשמה — שומרים את העמוד ומשתמשים בו בכל משחק.',
          ]}
          faq={DICE_FAQ}
          related={[{ label: 'משחקי לוח אונליין', href: '/board-games' }, { label: 'סולמות ונחשים להדפסה', href: '/printables/board-game' }, { label: 'משחקי קוביות', href: '/dice-games' }, { label: 'קוביות לשש בש', href: '/tools/dice/backgammon' }, { label: 'קוביה להדפסה', href: '/printables/dice-template' }]}
        />
      </div>
    </div>
  )
}

const DICE_FAQ = [
  { q: 'האם הקוביה הווירטואלית באמת אקראית?', a: 'כן. כל הטלה בוחרת מספר בין 1 ל־6 באופן אקראי, וכל מספר מופיע באותה הסתברות — כמו בקוביה אמיתית והוגנת.' },
  { q: 'איך מטילים קוביה אונליין?', a: 'בוחרים כמה קוביות רוצים (1 עד 5) ולוחצים על "הטילו!". התוצאה והסכום מופיעים מיד, ורשימת ההטלות האחרונות נשמרת מתחת.' },
  { q: 'צריך להוריד אפליקציה?', a: 'לא. הקוביה הדיגיטלית עובדת ישר מהדפדפן, בטלפון ובמחשב, בחינם ובלי הרשמה.' },
]

