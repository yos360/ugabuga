import { Link } from 'react-router-dom'
import './recipes.css'

export function ShabbatRecipeLinks() {
  return <aside className="recipe-links" dir="rtl" aria-label="מתכונים לשבת">
    <h2 className="text-xl font-bold">מתכונים לשבת</h2>
    <Link to="/recipes/shabbat/classic-challah">חלה לשבת</Link>
    <Link to="/recipes/shabbat/orange-cake">עוגת שישי</Link>
    <Link to="/recipes/shabbat">כל המתכונים וכרטיסי ההדפסה</Link>
  </aside>
}
