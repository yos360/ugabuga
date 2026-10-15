import { allergenLabels, formatIngredient, KOSHER_LABEL, totalMinutes } from '../../data/cakes'
import './recipes.css'

function Card({ c, factor, half }) {
  return <section className={`recipe-print-card${half ? ' half' : ''}`} dir="rtl">
    <h2>{c.title}</h2>
    <p>{c.servings * factor} יחידות/מנות · {c.pan} · {c.ovenC ? `${c.ovenC}°C` : c.heat || 'ללא חימום'} · {totalMinutes(c)} דקות כולל המתנה · {KOSHER_LABEL[c.kosher]}</p>
    {factor !== 1 && <p>כמות ×{factor} · התאימו תבניות, זמן האפייה אינו מוכפל. לחצי ביצה: טורפים ומודדים חצי לפי משקל.</p>}
    <div className="recipe-print-columns">
      <div><h3>מצרכים</h3>{c.ingredients.map((g, n) => <ul key={n}>{g.items.map((item, j) => <li key={j}>☐ {formatIngredient(item, factor)}</li>)}</ul>)}</div>
      <div><h3>הכנה</h3><ol>{c.steps.flatMap(g => g.items).map((step, n) => <li key={n}>{step}</li>)}</ol></div>
    </div>
    <p className="recipe-print-allergens">אלרגנים: {allergenLabels(c).join(' · ') || 'לפי תוויות המצרכים'} · גיל {c.age} בליווי מבוגר. חום, סכין ומכשירי חשמל — מבוגר בלבד.</p>
  </section>
}

export default function RecipeCardSheets({ c, factor = 1, size = 'a4' }) {
  return <article className="buga-a4 recipe-print-sheet" dir="rtl">
    <Card c={c} factor={factor} half={size === 'half'} />
    {size === 'half' && <><div className="recipe-cut">קו גזירה · שני כרטיסי מתכון זהים</div><Card c={c} factor={factor} half /></>}
    <footer>עוגה בוגה · ugabuga.co.il</footer>
  </article>
}
