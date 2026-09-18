import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useState } from 'react'

const HEBREW_LETTERS = [
  ['alef','א'],['bet','ב'],['gimel','ג'],['dalet','ד'],['he','ה'],['vav','ו'],['zayin','ז'],
  ['chet','ח'],['tet','ט'],['yod','י'],['kaf','כ'],['lamed','ל'],['mem','מ'],['nun','נ'],
  ['samech','ס'],['ayin','ע'],['pe','פ'],['tsadi','צ'],['qof','ק'],['resh','ר'],['shin','ש'],['tav','ת'],
]
const LETTER_ART = ['🍎','🏠','🐫','🚪','🌸','🌿','⭐','🧵','🍯','✋','🎨','🦁','💧','🐟','🌞','👁️','🦋','🌈','🎵','🚀','☀️','🍊']
function HebrewLetterPreview({letter,index}) { return <div className="hebrew-letter-preview" aria-label={`אות ${letter}`}><div className="hebrew-letter-art">{LETTER_ART[index]}</div><div className="hebrew-letter-glyph">{letter}</div><div className="hebrew-dotted-line">{letter} · {letter} · {letter} · {letter}</div></div> }

const svgMap = {
  'coloring': {
    title: 'דפי צביעה ליום הולדת',
    desc: 'דפי צביעה מצוירים ביד בסגנון UGABUGA — עוגה, מסיבה, בלונים, כתר, גיבור-על, דינוזאור, חלל, חיות.',
    files: [
      { name: 'עוגת יום הולדת', file: 'coloring-01-birthday-cake.svg' },
      { name: 'מסיבה', file: 'coloring-02-party.svg' },
      { name: 'בלונים', file: 'coloring-03-balloons.svg' },
      { name: 'כתר', file: 'coloring-04-crown.svg' },
      { name: 'גיבור-על', file: 'coloring-05-superhero.svg' },
      { name: 'דינוזאור חוגג', file: 'coloring-06-dino.svg' },
      { name: 'חלל', file: 'coloring-07-space.svg' },
      { name: 'חיות חוגגות', file: 'coloring-08-animals.svg' },
    ]
  },
  'birthday-signs': {
    title: 'שלטי יום הולדת',
    desc: 'שלטים גדולים להדפסה על A4 מלא.',
    files: Array.from({length:8},(_,i)=>({ name: `שלט ${i+1}`, file: `sign-0${i+1}.svg` }))
  },
  'hebrew-letters': {
    title: 'אותיות עברית בנקודות',
    desc: 'כל האותיות א-ת בנקודות לחיבור — עם איורים ושורות תרגול.',
    files: HEBREW_LETTERS.map(([en,he],i) => ({ name: 'אות '+he, file: `letter-he-${String(i+1).padStart(2,'0')}-${en}.svg` }))
  },
  'abc-letters': {
    title: 'ABC אנגלית בנקודות',
    desc: 'A-Z בנקודות — אותיות גדולות וקטנות עם איורים.',
    files: 'abcdefghijklmnopqrstuvwxyz'.split('').map((l,i) => ({ name: 'Letter '+l.toUpperCase(), file: `letter-en-${String(i+1).padStart(2,'0')}-${l}.svg` }))
  },
  'numbers': {
    title: 'מספרים בנקודות',
    desc: 'מספרים 0-10 בנקודות גדולות עם ספירה ואיורים.',
    files: Array.from({length:11},(_,i) => ({ name: 'מספר '+i, file: `number-${String(i).padStart(2,'0')}.svg` }))
  },
  'mazes': {
    title: 'מבוכים',
    desc: '3 רמות קושי — קל, בינוני, קשה.',
    files: [
      { name: 'קל ⭐', file: 'maze-easy.svg' },
      { name: 'בינוני ⭐⭐', file: 'maze-medium.svg' },
      { name: 'קשה ⭐⭐⭐', file: 'maze-hard.svg' },
    ]
  },
  'certificates': {
    title: 'תעודות',
    desc: 'תעודות מעוצבות להדפסה.',
    files: [
      { name: 'גיבור/ת המסיבה', file: 'certificate-party-hero.svg' },
      { name: 'הצטיינות', file: 'certificate-excellence.svg' },
      { name: 'משתתף/ת', file: 'certificate-participant.svg' },
      { name: 'אלוף/ת המשחקים', file: 'certificate-games-champ.svg' },
      { name: 'יום הולדת', file: 'certificate-birthday.svg' },
      { name: 'הכיתה', file: 'certificate-class.svg' },
    ]
  },
  'symmetry': {
    title: 'ציור סימטרי',
    desc: 'השלימו את החצי — 6 תמונות.',
    files: [
      { name: 'פרפר', file: 'symmetry-01-butterfly.svg' },
      { name: 'בית', file: 'symmetry-02-house.svg' },
      { name: 'עץ', file: 'symmetry-03-tree.svg' },
      { name: 'פרח', file: 'symmetry-04-flower.svg' },
      { name: 'טיל', file: 'symmetry-05-rocket.svg' },
      { name: 'סירה', file: 'symmetry-06-boat.svg' },
    ]
  },
  'name-tags': { title: 'תגי שם למסיבה', desc: '8 תגים בדף אחד.', files: [{ name: 'תגי שם', file: 'name-tags.svg' }] },
  'thank-you': { title: 'כרטיסי תודה', desc: '4 כרטיסים מתקפלים.', files: [{ name: 'כרטיסי תודה', file: 'thank-you-cards.svg' }] },
  'photo-props': { title: 'אביזרי צילום', desc: 'לגזירה והדבקה על מקלות.', files: [{ name: 'אביזרי צילום', file: 'photo-props.svg' }] },
  'board-game': { title: 'סולמות ונחשים BUGA', desc: 'לוח משחק 100 משבצות.', files: [{ name: 'סולמות ונחשים', file: 'snakes-and-ladders.svg' }] },
  'sudoku': {
    title: 'סודוקו לילדים', desc: 'עם פתרונות.',
    files: [{ name: 'סודוקו', file: 'sudoku.svg' }, { name: 'פתרונות', file: 'sudoku-solutions.svg' }]
  },
}

export default function PrintableCategory() {
  const { slug } = useParams()
  const cat = svgMap[slug]
  const [selected, setSelected] = useState(null)

  if (!cat) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center buga-fade-in">
        <SEO title="דפים להדפסה" description="בחרו קטגוריית דפים להדפסה פעילה." path="/printables" />
        <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'הדפסות', href: '/printables' }, { label: 'בחירת קטגוריה' }]} />
        <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-8 sketch-shadow-rich">
          <h1 className="text-4xl mb-3">🖨️ קטגוריית ההדפסה לא נמצאה</h1>
          <p className="mx-auto max-w-xl text-lg text-[var(--foreground)]/75 mb-6">בחרו קטגוריה קיימת ונחזיר אתכם לדפים שעובדים.</p>
          <div className="mb-6 flex justify-center">
            <Link to="/printables" className="wobbly-sm border-2 border-[var(--border)] bg-[var(--accent)] px-5 py-3 font-display text-xl font-bold text-white">כל הדפים להדפסה</Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(svgMap).map(([key, item]) => (
              <Link key={key} to={'/printables/'+key} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-hand text-lg underline decoration-dashed hover:bg-[var(--postit)]">{item.title}</Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const printItem = (file) => {
    const w = window.open('/svg/' + file, '_blank')
    if (w) w.onload = () => w.print()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title={cat.title + ' להדפסה'} description={cat.desc} path={'/printables/' + slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'הדפסות', href: '/printables' }, { label: cat.title }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-3">{cat.title}</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">{cat.desc}</p>

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

      <div className={`grid gap-5 grid-cols-2 sm:grid-cols-3 ${slug === 'board-game' ? 'lg:grid-cols-2 max-w-5xl mx-auto' : 'lg:grid-cols-4'}`}>
        {cat.files.map((item, i) => (
          <div key={item.file}
            className={`wobbly group relative border-2 border-[var(--border)] bg-white p-3 sketch-shadow transition-all duration-150 hover:-translate-y-1 cursor-pointer ${i % 2 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`}
            onClick={() => setSelected(item)}>
            <div className={`${slug === 'board-game' ? 'aspect-[4/3]' : 'aspect-[3/4]'} bg-[var(--background)] border border-dashed border-[var(--muted)] flex items-center justify-center overflow-hidden mb-2`}>
              {slug === 'hebrew-letters' ? <HebrewLetterPreview letter={HEBREW_LETTERS[i][1]} index={i} /> : <img src={'/svg/' + item.file} alt={item.name} className={`w-full h-full object-contain ${slug === 'board-game' ? 'p-0' : 'p-2'}`} loading="lazy" />}
            </div>
            <p className="text-center font-display text-sm font-bold truncate">{item.name}</p>
          </div>
        ))}
      </div>

      <style>{`.hebrew-letter-preview{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:linear-gradient(145deg,#fff,#fff7fb);color:#172033}.hebrew-letter-art{font-size:48px;line-height:1}.hebrew-letter-glyph{font-size:78px;line-height:1;font-weight:900;color:#ec3d73;text-shadow:2px 2px 0 #ffd5e2}.hebrew-dotted-line{font-size:12px;letter-spacing:3px;color:#8790a3;border-top:2px dotted #cbd2df;padding-top:5px}`}</style>
      <div className="text-center mt-8">
        <button onClick={() => cat.files.forEach(f => printItem(f.file))}
          className="wobbly-md sketch-press min-h-[48px] border-[3px] border-[var(--border)] bg-[var(--accent)] px-8 py-3 font-display text-lg font-bold text-[var(--accent-foreground)] cursor-pointer">
          🖨️ הדפיסו הכל ({cat.files.length} דפים)
        </button>
      </div>
    </div>
  )
}
