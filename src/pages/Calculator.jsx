import { useState } from 'react'
import SEO from '../components/ui/SEO'
import WobblyCard from '../components/ui/WobblyCard'
import WobblyButton from '../components/ui/WobblyButton'
import Breadcrumbs from '../components/ui/Breadcrumbs'

export default function Calculator() {
  const [guests, setGuests] = useState(15)
  const [age, setAge] = useState('6-9')
  const [budget, setBudget] = useState('medium')
  const [result, setResult] = useState(null)

  const calculate = () => {
    const pizzaPerKid = age === '3-5' ? 0.2 : age === '6-9' ? 0.3 : 0.35
    const pizzas = Math.ceil(guests * pizzaPerKid)
    const drinks15 = Math.ceil(guests * 0.4)
    const snackBags = guests
    const cake = guests <= 15 ? 1 : guests <= 25 ? 1.5 : 2
    const cups = Math.ceil(guests * 1.5)
    const plates = Math.ceil(guests * 1.2)
    const favors = guests

    const costs = {
      low: { pizza: pizzas * 45, drinks: drinks15 * 10, snacks: snackBags * 3, cake: 70, cups: cups * 0.5, plates: plates * 0.5, favors: favors * 8 },
      medium: { pizza: pizzas * 55, drinks: drinks15 * 12, snacks: snackBags * 5, cake: 120, cups: cups * 1, plates: plates * 1, favors: favors * 15 },
      high: { pizza: pizzas * 65, drinks: drinks15 * 15, snacks: snackBags * 8, cake: 350, cups: cups * 1.5, plates: plates * 1.5, favors: favors * 25 },
    }

    const c = costs[budget]
    const total = Object.values(c).reduce((a, b) => a + b, 0)

    setResult({ pizzas, drinks15, snackBags, cake, cups, plates, favors, costs: c, total })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO title="מחשבון מסיבה" description="כמה פיצות להזמין? כמה שתייה? חשבו כמויות ועלויות למסיבת יום הולדת." path="/calculator" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'מחשבון מסיבה' }]} />
      <h1 className="text-4xl font-hand font-bold text-center mb-8">🧮 מחשבון מסיבה</h1>

      <WobblyCard hover={false} padding="p-6" className="mb-6">
        <div className="space-y-6">
          <div>
            <label className="block font-bold mb-2">👥 מספר ילדים: {guests}</label>
            <input type="range" min="5" max="40" value={guests} onChange={e => setGuests(+e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="block font-bold mb-2">🎂 קבוצת גיל</label>
            <div className="flex gap-2">
              {[['3-5','3-5'],['6-9','6-9'],['10-13','10-13']].map(([v,l]) => (
                <button key={v} onClick={() => setAge(v)}
                  className={`px-4 py-2 border-2 border-[var(--ink)] wobbly-sm font-medium ${age === v ? 'bg-[var(--yellow)]' : 'bg-white'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-bold mb-2">💰 רמת תקציב</label>
            <div className="flex gap-2">
              {[['low','חסכוני'],['medium','רגיל'],['high','מושקע']].map(([v,l]) => (
                <button key={v} onClick={() => setBudget(v)}
                  className={`px-4 py-2 border-2 border-[var(--ink)] wobbly-sm font-medium ${budget === v ? 'bg-[var(--yellow)]' : 'bg-white'}`}>{l}</button>
              ))}
            </div>
          </div>
          <WobblyButton onClick={calculate} className="w-full">🎂 חשבו!</WobblyButton>
        </div>
      </WobblyCard>

      {result && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-hand font-bold text-center">📋 התוצאות</h2>
          {[
            ['🍕 פיצות', result.pizzas + ' משפחתיות', result.costs.pizza],
            ['🥤 שתייה', result.drinks15 + ' בקבוקים (1.5 ליטר)', result.costs.drinks],
            ['🍿 חטיפים', result.snackBags + ' שקיות', result.costs.snacks],
            ['🎂 עוגה', result.cake > 1 ? 'עוגה גדולה' : 'עוגה רגילה', result.costs.cake],
            ['🥤 כוסות', result.cups, result.costs.cups],
            ['🍽️ צלחות', result.plates, result.costs.plates],
            ['🎁 שקיות הפתעה', result.favors, result.costs.favors],
          ].map(([item, qty, cost]) => (
            <WobblyCard key={item} hover={false} padding="p-4" className="flex justify-between items-center">
              <div><span className="font-bold">{item}</span> — {qty}</div>
              <div className="font-bold">~{Math.round(cost)} ₪</div>
            </WobblyCard>
          ))}
          <WobblyCard hover={false} padding="p-4" className="bg-[var(--yellow)] text-center">
            <span className="text-2xl font-bold">סה"כ: ~{Math.round(result.total)} ₪</span>
            <p className="text-sm text-[var(--ink)]/70 mt-1">* מחירים משוערים</p>
          </WobblyCard>
        </div>
      )}
    </div>
  )
}
