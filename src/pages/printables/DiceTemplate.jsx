import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import DiceFamilyLinks from '../tools/dice/DiceFamilyLinks'

const PIPS = { 1: [[50, 50]], 2: [[27, 27], [73, 73]], 3: [[27, 27], [50, 50], [73, 73]], 4: [[27, 27], [73, 27], [27, 73], [73, 73]], 5: [[27, 27], [73, 27], [50, 50], [27, 73], [73, 73]], 6: [[27, 25], [73, 25], [27, 50], [73, 50], [27, 75], [73, 75]] }
const FAQ = [
  { q: 'איך מקפלים קוביה מנייר?', a: 'גוזרים לאורך הקו החיצוני, מקפלים בכל הקווים הפנימיים, ומדביקים את הלשוניות האפורות מבפנים. עדיף להדפיס על בריסטול או נייר עבה.' },
  { q: 'איך מסודרים המספרים בקוביה אמיתית?', a: 'בקוביה רגילה סכום כל שתי פאות נגדיות הוא 7: 1 מול 6, 2 מול 5 ו-3 מול 4. השבלונה כאן בנויה בדיוק כך.' },
  { q: 'אפשר לכתוב מילים במקום נקודות?', a: 'כן. בוחרים "ריקה" או "מילים שלי" וכותבים 6 מילים, מספרים או משימות — למשל קוביית תרגילים או קוביית משימות למסיבה.' },
]

// Cross net: faces placed so opposite faces sum to 7.
// Row0: [_, 5, _, _]; Row1: [4, 1, 3, 6]; Row2: [_, 2, _, _]
const LAYOUT = [[1, 0, 5], [0, 1, 4], [1, 1, 1], [2, 1, 3], [3, 1, 6], [1, 2, 2]]

export default function DiceTemplate() {
  const [mode, setMode] = useState('dots')
  const [words, setWords] = useState(['', '', '', '', '', ''])
  const [printing, setPrinting] = useState(false)
  const S = 50
  const face = (n, x, y) => {
    const X = x * S, Y = y * S
    return (
      <g key={n}>
        <rect x={X} y={Y} width={S} height={S} fill="#fff" stroke="#111" strokeWidth="0.6" />
        {mode === 'dots' && PIPS[n].map(([px, py], i) => <circle key={i} cx={X + (px / 100) * S} cy={Y + (py / 100) * S} r={4.2} fill="#111" />)}
        {mode === 'numbers' && <text x={X + S / 2} y={Y + S / 2 + 8} textAnchor="middle" fontSize="24" fontWeight="bold">{n}</text>}
        {mode === 'words' && <text x={X + S / 2} y={Y + S / 2 + 4} textAnchor="middle" fontSize="9" direction="rtl">{words[n - 1]}</text>}
      </g>
    )
  }
  // glue tabs on the outside edges that need them
  const tabs = [[0, 1, 'top'], [0, 1, 'bottom'], [2, 1, 'top'], [2, 1, 'bottom'], [3, 1, 'top'], [3, 1, 'bottom'], [3, 1, 'right']]
  const tab = ([x, y, side], i) => {
    const X = x * S, Y = y * S, d = 9
    const pts = side === 'top' ? `${X},${Y} ${X + d},${Y - d} ${X + S - d},${Y - d} ${X + S},${Y}` : side === 'bottom' ? `${X},${Y + S} ${X + d},${Y + S + d} ${X + S - d},${Y + S + d} ${X + S},${Y + S}` : `${X + S},${Y} ${X + S + d},${Y + d} ${X + S + d},${Y + S - d} ${X + S},${Y + S}`
    return <polygon key={i} points={pts} fill="#ddd" stroke="#111" strokeWidth="0.5" strokeDasharray="2 2" />
  }
  const sheet = (
    <svg viewBox="-12 -12 224 174" className="w-full h-auto" role="img" aria-label="שבלונה של קוביה לגזירה וקיפול">
      {tabs.map(tab)}
      {LAYOUT.map(([x, y, n]) => face(n, x, y))}
    </svg>
  )
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in">
      <SEO title="קוביה להדפסה — שבלונה לגזירה וקיפול" description="שבלונת קוביה להדפסה: עם נקודות, עם מספרים או ריקה עם מילים משלכם. מדפיסים, גוזרים, מקפלים ומדביקים — קוביה אמיתית מנייר ב-5 דקות." path="/printables/dice-template" structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'קוביה להדפסה' }]} />
      <h1 className="text-4xl text-center mb-2">✂️ קוביה להדפסה</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">שבלונה לגזירה וקיפול — עם נקודות, מספרים או מילים שלכם</p>
      <div className="flex flex-wrap justify-center gap-2 mb-5">
        {[['dots', 'נקודות'], ['numbers', 'מספרים'], ['words', 'מילים שלי / ריקה']].map(([m, l]) => <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold ${mode === m ? 'bg-[var(--postit)]' : 'bg-[var(--card)]'}`}>{l}</button>)}
      </div>
      {mode === 'words' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
          {words.map((w, i) => <input key={i} aria-label={`פאה ${i + 1}`} maxLength={10} value={w} placeholder={`פאה ${i + 1}`} onChange={e => setWords(ws => ws.map((x, j) => (j === i ? e.target.value : x)))} className="border-2 border-[var(--border)] bg-white px-3 py-2 wobbly-sm" />)}
        </div>
      )}
      <div className="bg-white border-2 border-[var(--border)] p-4 mb-5">{sheet}</div>
      <div className="text-center mb-8"><button onClick={() => setPrinting(true)} className="rounded-xl bg-red-500 px-6 py-3 font-bold text-white">🖨️ הדפיסו</button></div>
      {printing && <PrintPreview title="קוביה להדפסה" onClose={() => setPrinting(false)}><div className="buga-a4 p-6">{sheet}<p style={{ textAlign: 'center', fontSize: 12 }}>גוזרים לאורך הקו החיצוני · מקפלים בכל קו פנימי · מדביקים את הלשוניות האפורות מבפנים</p></div></PrintPreview>}
      <DiceFamilyLinks current="/printables/dice-template" />
      <div className="mt-10">
        <SeoBody paragraphs={['קוביה מנייר היא פרויקט יצירה קצר ושימושי: מדפיסים, גוזרים ומקפלים, ומקבלים קוביה אמיתית למשחקי לוח. הכי טוב להדפיס על בריסטול או נייר עבה (160 גרם ומעלה).', 'במצב "מילים שלי" אפשר ליצור קוביות מיוחדות: קוביית תרגילים לכיתה, קוביית משימות למסיבה, קוביית פעולות ("קפצו", "מחאו כפיים") לגן, או קוביית אוכל ("מה אוכלים הערב?").']} faq={FAQ} related={[{ label: 'קוביה וירטואלית', href: '/tools/dice' }, { label: 'משחקי קוביות', href: '/dice-games' }, { label: 'סולמות ונחשים להדפסה', href: '/printables/board-game' }]} />
      </div>
    </div>
  )
}
