import { useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useState } from 'react'

const svgMap = {
  'coloring': {
    title: 'דפי צביעה ליום הולדת',
    desc: 'דפי צביעה מצוירים ביד בסגנון UGABUGA — עוגה, מסיבה, בלונים, כתר, גיבור-על, דינוזאור, חלל, חיות. להדפסה וצביעה.',
    files: [
      { name: 'עוגת יום הולדת', file: 'coloring-01-birthday-cake.svg' },
      { name: 'מסיבה', file: 'coloring-02-party-scene.svg' },
      { name: 'בלונים', file: 'coloring-03-balloons.svg' },
      { name: 'כתר', file: 'coloring-04-crown.svg' },
      { name: 'גיבור-על', file: 'coloring-05-superhero.svg' },
      { name: 'דינוזאור חוגג', file: 'coloring-06-dino-party.svg' },
      { name: 'חלל', file: 'coloring-07-space.svg' },
      { name: 'חיות חוגגות', file: 'coloring-08-animals-party.svg' },
    ]
  },
  'birthday-signs': {
    title: 'שלטי יום הולדת',
    desc: 'שלטים גדולים להדפסה על A4 מלא — פה העוגה, פה השתייה, פה המתנות, ברוכים הבאים ועוד.',
    files: [
      { name: 'יום הולדת שמח', file: 'sign-01-happy-birthday.svg' },
      { name: 'יום הולדת שמח ל...', file: 'sign-02-happy-birthday-name.svg' },
      { name: 'ברוכים הבאים', file: 'sign-03-welcome.svg' },
      { name: 'פה העוגה', file: 'sign-04-cake-here.svg' },
      { name: 'פה השתייה', file: 'sign-05-drinks-here.svg' },
      { name: 'פה המתנות', file: 'sign-06-gifts-here.svg' },
      { name: 'פה הבלונים', file: 'sign-07-balloons-here.svg' },
      { name: 'פה מצטלמים', file: 'sign-08-photo-here.svg' },
    ]
  },
  'hebrew-letters': {
    title: 'אותיות עברית בנקודות',
    desc: 'כל האותיות א-ת בנקודות לחיבור — עם איורים ושורות תרגול. מושלם לגן ולכיתה א.',
    files: 'אבגדהוזחטיכלמנסעפצקרשת'.split('').map((l, i) => ({
      name: 'אות ' + l,
      file: `hebrew-${String(i + 1).padStart(2, '0')}-${l}.svg`
    }))
  },
  'abc-letters': {
    title: 'ABC אנגלית בנקודות',
    desc: 'A-Z בנקודות — אותיות גדולות וקטנות עם איורים לכל אות.',
    files: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => ({
      name: 'Letter ' + l,
      file: `abc-${l.toLowerCase()}.svg`
    }))
  },
  'numbers': {
    title: 'מספרים בנקודות',
    desc: 'מספרים 0-10 בנקודות גדולות — עם שם בעברית, איור כמותי ושורות תרגול.',
    files: Array.from({ length: 11 }, (_, i) => ({
      name: 'מספר ' + i,
      file: `number-${String(i).padStart(2, '0')}.svg`
    }))
  },
  'mazes': {
    title: 'מבוכים',
    desc: '3 רמות קושי — קל, בינוני, קשה. עם סיפור, אייקונים ודף פתרון.',
    files: [
      { name: 'קל ⭐', file: 'maze-easy.svg' },
      { name: 'בינוני ⭐⭐', file: 'maze-medium.svg' },
      { name: 'קשה ⭐⭐⭐', file: 'maze-hard.svg' },
    ]
  },
  'certificates': {
    title: 'תעודות',
    desc: 'תעודות מעוצבות להדפסה — גיבור מסיבה, הצטיינות, משתתף, אלוף משחקים, יום הולדת, כיתה.',
    files: [
      { name: 'גיבור/ת המסיבה', file: 'certificate-01-party-hero.svg' },
      { name: 'הצטיינות', file: 'certificate-02-excellence.svg' },
      { name: 'משתתף/ת', file: 'certificate-03-participation.svg' },
      { name: 'אלוף/ת המשחקים', file: 'certificate-04-game-champion.svg' },
      { name: 'יום הולדת', file: 'certificate-05-birthday.svg' },
      { name: 'הכיתה', file: 'certificate-06-classroom.svg' },
    ]
  },
  'symmetry': {
    title: 'ציור סימטרי',
    desc: 'השלימו את החצי — 6 תמונות עם חצי מצויר. הילד משלים את הצד השני.',
    files: [
      { name: 'פרפר', file: 'symmetry-01-butterfly.svg' },
      { name: 'פנים', file: 'symmetry-02-face.svg' },
      { name: 'עץ', file: 'symmetry-03-tree.svg' },
      { name: 'פרח', file: 'symmetry-04-flower.svg' },
      { name: 'טיל', file: 'symmetry-05-rocket.svg' },
      { name: 'סירה', file: 'symmetry-06-boat.svg' },
    ]
  },
  'name-tags': {
    title: 'תגי שם למסיבה', desc: '8 תגים בדף אחד — לגזירה ושימוש.',
    files: [{ name: 'תגי שם', file: 'name-tags.svg' }]
  },
  'thank-you': {
    title: 'כרטיסי תודה', desc: '4 כרטיסים מתקפלים בדף אחד.',
    files: [{ name: 'כרטיסי תודה', file: 'thank-you-cards.svg' }]
  },
  'photo-props': {
    title: 'אביזרי צילום', desc: 'כתר, שפם, משקפיים ועוד — לגזירה והדבקה על מקלות.',
    files: [{ name: 'אביזרי צילום', file: 'photo-props.svg' }]
  },
  'board-game': {
    title: 'סולמות ונחשים BUGA', desc: 'לוח משחק 100 משבצות להדפסה.',
    files: [{ name: 'סולמות ונחשים', file: 'snakes-and-ladders.svg' }]
  },
  'sudoku': {
    title: 'סודוקו לילדים', desc: 'סודוקו 4×4 ו-6×6 עם פתרונות.',
    files: [
      { name: 'סודוקו', file: 'sudoku.svg' },
      { name: 'פתרונות', file: 'sudoku-solutions.svg' },
    ]
  },
}

export default function PrintableCategory() {
  const { slug } = useParams()
  const cat = svgMap[slug]
  const [selected, setSelected] = useState(null)

  if (!cat) return <div className="text-center py-20"><h1 className="text-4xl">404 — קטגוריה לא נמצאה</h1></div>

  const printItem = (file) => {
    const w = window.open('/svg/' + file, '_blank')
    w.onload = () => { w.print() }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title={cat.title + ' להדפסה'} description={cat.desc} path={'/printables/' + slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'הדפסות', href: '/printables' }, { label: cat.title }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-3">{cat.title}</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">{cat.desc}</p>

      {/* Preview modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white wobbly p-4 max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl font-bold">{selected.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => printItem(selected.file)} className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-[var(--accent)] text-white px-4 py-2 font-bold cursor-pointer">🖨️ הדפיסו</button>
                <button onClick={() => setSelected(null)} className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-[var(--card)] px-4 py-2 font-bold cursor-pointer">✕</button>
              </div>
            </div>
            <img src={'/svg/' + selected.file} alt={selected.name} className="w-full" />
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {cat.files.map((item, i) => (
          <div key={item.file}
            className={`wobbly group relative border-2 border-[var(--border)] bg-white p-3 sketch-shadow transition-all duration-150 hover:-translate-y-1 cursor-pointer ${i % 2 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`}
            onClick={() => setSelected(item)}>
            <div className="aspect-[3/4] bg-[var(--background)] border border-dashed border-[var(--muted)] flex items-center justify-center overflow-hidden mb-2">
              <img src={'/svg/' + item.file} alt={item.name} className="w-full h-full object-contain p-2" loading="lazy" />
            </div>
            <p className="text-center font-display text-sm font-bold truncate">{item.name}</p>
          </div>
        ))}
      </div>

      {/* Print all */}
      <div className="text-center mt-8">
        <button onClick={() => cat.files.forEach(f => printItem(f.file))}
          className="wobbly-md sketch-press min-h-[48px] border-[3px] border-[var(--border)] bg-[var(--accent)] px-8 py-3 font-display text-lg font-bold text-[var(--accent-foreground)] cursor-pointer">
          🖨️ הדפיסו הכל ({cat.files.length} דפים)
        </button>
      </div>
    </div>
  )
}
