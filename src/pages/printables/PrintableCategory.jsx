import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { useEffect, useState } from 'react'
import HebrewTracing from '../../components/ui/HebrewTracing'

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
    desc: 'שלטי יום הולדת להדפסה חינם: שלטים גדולים בעברית על A4 מלא — מזל טוב, ברוכים הבאים, שם ומספר — בצבע או לצביעה.',
    files: Array.from({length:8},(_,i)=>({ name: `שלט ${i+1}`, file: `sign-0${i+1}.svg` }))
  },
  'hebrew-letters': {
    title: 'אותיות עברית בנקודות',
    desc: 'כל האותיות א–ת בשחור־לבן, בנקודות או בקווים מקווקווים למעבר בעיפרון, עם שורות לתרגול עצמאי.',
    files: HEBREW_LETTERS.map(([en,he],i) => ({ name: 'אות '+he, file: `letter-he-${String(i+1).padStart(2,'0')}-${en}.svg` }))
  },
  'abc-letters': {
    title: 'אותיות באנגלית למעבר בעיפרון',
    desc: 'אותיות ABC באנגלית להדפסה: A–Z, אות גדולה ואות קטנה בקווים מקווקווים למעבר בעיפרון, על שורות כתיבה באנגלית — לגן ולכיתה א׳, חינם.',
    files: 'abcdefghijklmnopqrstuvwxyz'.split('').map((l,i) => ({ name: 'Letter '+l.toUpperCase(), file: `letter-en-${String(i+1).padStart(2,'0')}-${l}.svg` }))
  },
  'numbers': {
    title: 'מספרים בנקודות',
    desc: 'מספרים בנקודות להדפסה: 0-10 בנקודות גדולות לחיבור, עם ספירה ואיורים — דפי תרגול כתיבת מספרים לגן ולכיתה א׳, חינם.',
    files: Array.from({length:11},(_,i) => ({ name: 'מספר '+i, file: `number-${String(i).padStart(2,'0')}.svg` }))
  },
  'mazes': {
    title: 'מבוכים',
    desc: 'מבוכים להדפסה לילדים ב-3 רמות קושי — קל, בינוני וקשה — עם סיפור קצר ופתרון. פעילות שקטה לבית, לכיתה ולמסיבה, חינם.',
    files: [
      { name: 'קל ⭐', file: 'maze-easy.svg' },
      { name: 'בינוני ⭐⭐', file: 'maze-medium.svg' },
      { name: 'קשה ⭐⭐⭐', file: 'maze-hard.svg' },
    ]
  },
  'certificates': {
    title: 'תעודות',
    desc: 'תעודות להדפסה חינם: תעודת הצטיינות, גיבור מסיבה, אלוף משחקים ומשתתף — מעוצבות בעברית עם מקום לשם, למורים, למדריכים ולהורים.',
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
    desc: 'ציור סימטרי להדפסה: 6 תמונות להשלמת החצי החסר — פרפר, פנים, בית, עץ, פרח וטיל. תרגול ריכוז וקואורדינציה לגן ולכיתה, חינם.',
    files: [
      { name: 'פרפר', file: 'symmetry-01-butterfly.svg' },
      { name: 'בית', file: 'symmetry-02-house.svg' },
      { name: 'עץ', file: 'symmetry-03-tree.svg' },
      { name: 'פרח', file: 'symmetry-04-flower.svg' },
      { name: 'טיל', file: 'symmetry-05-rocket.svg' },
      { name: 'סירה', file: 'symmetry-06-boat.svg' },
    ]
  },
  'name-tags': { title: 'תגי שם למסיבה', desc: 'תגי שם למסיבה להדפסה: 8 תגים מעוצבים בדף A4 אחד לגזירה — ליום הולדת, לכיתה, לקייטנה ולאירוע. ממלאים שם ומדביקים.', files: [{ name: 'תגי שם', file: 'name-tags.svg' }] },
  'thank-you': { title: 'כרטיסי תודה', desc: 'כרטיסי תודה להדפסה: 4 כרטיסים מתקפלים בדף — לחלוקה אחרי יום הולדת, למורים ולמדריכים. מעוצבים בעברית עם מקום להקדשה, חינם.', files: [{ name: 'כרטיסי תודה', file: 'thank-you-cards.svg' }] },
  'photo-props': { title: 'אביזרי צילום', desc: 'לגזירה והדבקה על מקלות.', files: [{ name: 'אביזרי צילום', file: 'photo-props.svg' }] },
  'board-game': { title: 'סולמות ונחשים BUGA', desc: 'סולמות ונחשים להדפסה: לוח משחק מלא של 100 משבצות בסגנון UGABUGA — מדפיסים, מוסיפים קובייה ומשחקים. משחק קופסה חינמי למשפחה ולכיתה.', files: [{ name: 'סולמות ונחשים', file: 'snakes-and-ladders.svg' }] },
  'sudoku': {
    title: 'סודוקו לילדים', desc: 'סודוקו לילדים להדפסה: לוחות 4×4 ו-6×6 עם פתרונות — חידות היגיון קלות למתחילים, לגיל הרך ולבית הספר. פעילות שקטה, חינם.',
    files: [{ name: 'סודוקו', file: 'sudoku.svg' }, { name: 'פתרונות', file: 'sudoku-solutions.svg' }]
  },
}

export default function PrintableCategory() {
  const { slug } = useParams()
  const cat = svgMap[slug]
  const [selected, setSelected] = useState(null)
  useEffect(() => { const onKey = e => e.key === 'Escape' && setSelected(null); window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [])

  if (!cat) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center buga-fade-in">
        <SEO title="דפים להדפסה" description="בחרו קטגוריית דפים להדפסה פעילה." path="/printables" noindex />
        <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'בחירת קטגוריה' }]} />
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

  if (slug === 'hebrew-letters') return <div className="mx-auto max-w-6xl px-4 py-8"><SEO title="אותיות עברית לתרגול כתיבה" description={cat.desc} path="/printables/hebrew-letters"/><Breadcrumbs items={[{label:'ראשי',href:'/'},{label:'דפים להדפסה',href:'/printables'},{label:cat.title}]}/><h1 className="mb-3 text-center text-4xl">אותיות עברית למעבר בעיפרון</h1><p className="mb-7 text-center">{cat.desc}</p><HebrewTracing/></div>
  if (slug === 'abc-letters') return <div className="mx-auto max-w-6xl px-4 py-8"><SEO title="אותיות באנגלית לתרגול כתיבה — ABC למעבר בעיפרון" description={cat.desc} path="/printables/abc-letters"/><Breadcrumbs items={[{label:'ראשי',href:'/'},{label:'דפים להדפסה',href:'/printables'},{label:cat.title}]}/><h1 className="mb-3 text-center text-4xl">אותיות באנגלית למעבר בעיפרון</h1><p className="mb-7 text-center">{cat.desc}</p><HebrewTracing lang="en"/></div>

  const printAll = () => setSelected(cat.files)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title={cat.title + ' להדפסה'} description={cat.desc} path={'/printables/' + slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: cat.title }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-3">{cat.title}</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">{cat.desc}</p>

      {selected && <PrintPreview title={Array.isArray(selected)?cat.title:selected.name} onClose={()=>setSelected(null)}>{(Array.isArray(selected)?selected:[selected]).map(item=><article className="buga-a4" key={item.file}><div className="print-art"><img src={'/svg/'+item.file} alt={item.name}/></div></article>)}</PrintPreview>}

      <div className={`grid gap-5 grid-cols-2 sm:grid-cols-3 ${slug === 'board-game' ? 'lg:grid-cols-2 max-w-5xl mx-auto' : 'lg:grid-cols-4'}`}>
        {cat.files.map((item, i) => (
          <button type="button" aria-label={`פתחו והדפיסו: ${item.name}`} key={item.file}
            className={`wobbly group relative border-2 border-[var(--border)] bg-white p-3 sketch-shadow transition-all duration-150 hover:-translate-y-1 cursor-pointer ${i % 2 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`}
            onClick={() => setSelected(item)}>
            <div className={`${slug === 'board-game' ? 'aspect-[4/3]' : 'aspect-[3/4]'} bg-[var(--background)] border border-dashed border-[var(--muted)] flex items-center justify-center overflow-hidden mb-2`}>
              {slug === 'hebrew-letters' ? <HebrewLetterPreview letter={HEBREW_LETTERS[i][1]} index={i} /> : <img src={'/svg/' + item.file} alt={item.name} className={`w-full h-full object-contain ${slug === 'board-game' ? 'p-0' : 'p-2'}`} loading="lazy" />}
            </div>
            <p className="text-center font-display text-sm font-bold truncate">{item.name}</p>
          </button>
        ))}
      </div>

      <style>{`.hebrew-letter-preview{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:linear-gradient(145deg,#fff,#fff7fb);color:#172033}.hebrew-letter-art{font-size:48px;line-height:1}.hebrew-letter-glyph{font-size:78px;line-height:1;font-weight:900;color:#ec3d73;text-shadow:2px 2px 0 #ffd5e2}.hebrew-dotted-line{font-size:12px;letter-spacing:3px;color:#8790a3;border-top:2px dotted #cbd2df;padding-top:5px}`}</style>
      <div className="text-center mt-8">
        <button onClick={printAll}
          className="wobbly-md sketch-press min-h-[48px] border-[3px] border-[var(--border)] bg-[var(--accent)] px-8 py-3 font-display text-lg font-bold text-[var(--accent-foreground)] cursor-pointer">
          🖨️ הדפיסו הכל ({cat.files.length} דפים)
        </button>
      </div>
    </div>
  )
}
