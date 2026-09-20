import { useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'

const PAGES = [
  ['birthday','עוגת יום הולדת','cake'],['birthday','מסיבת בלונים','balloons'],['birthday','כתר ומתנות','crown'],['birthday','קאפקייקים שמחים','cupcake'],['birthday','מסיבת קונפטי','party'],
  ['animals','חתול בחלון','cat'],['animals','כלבלב בפארק','dog'],['animals','אריה אמיץ','lion'],['animals','פיל וחברים','elephant'],['animals','דינוזאור חוגג','dino'],
  ['space','טיל בדרך לירח','rocket'],['space','כוכבים וכוכבי לכת','planet'],['space','חייזר חמוד','alien'],['space','אסטרונאוט קטן','astronaut'],['space','תחנת חלל','space'],
  ['fantasy','חד־קרן וקשת','unicorn'],['fantasy','נסיכה בטירה','castle'],['fantasy','דרקון קטן','dragon'],['fantasy','שרביט קסמים','wand'],['fantasy','יער פיות','fairy'],
  ['vehicles','מכונית מרוץ','car'],['vehicles','כבאית בדרך','firetruck'],['vehicles','טרקטור בחווה','tractor'],['vehicles','רכבת צבעונית','train'],['vehicles','מטוס בעננים','plane'],
  ['sports','כדורגל ושער','football'],['sports','כדורסל וסל','basketball'],['sports','גביע אלופים','trophy'],['sports','יום ספורט','sports'],
  ['birthday','שולחן יום הולדת','party'],['birthday','הזמנה צבעונית','crown'],['birthday','מתנות עטופות','crown'],['birthday','ריקוד במסיבה','sports'],['birthday','פינת צילום','party'],
  ['animals','שועל ביער','lion'],['animals','קוף מצחיק','dog'],['animals','פרפר על פרח','fairy'],['animals','צב בגינה','dog'],['animals','ינשוף בלילה','alien'],
  ['space','לוויין במסלול','space'],['space','ירח עם כוכבים','planet'],['space','רכב ירח','car'],['space','שביל החלב','rocket'],['space','רובוט בחלל','astronaut'],
  ['fantasy','ארמון קסום','castle'],['fantasy','בת ים','fairy'],['fantasy','גמד בגינה','dog'],['fantasy','קשת בענן','unicorn'],['fantasy','ספר לחשים','wand'],
  ['vehicles','אופניים בעיר','car'],['vehicles','מסוק בשמיים','plane'],['vehicles','סירה בים','train'],['vehicles','אופנוע מרוץ','car'],['vehicles','טנדר בחווה','tractor'],
  ['sports','שחייה בבריכה','sports'],['sports','טניס במגרש','sports'],['sports','מדליה ראשונה','trophy'],['sports','ריצה בפארק','sports'],['sports','אופניים במסלול','car'],
  ['school','תיק בית הספר','school'],['school','ילדים בכיתה','school'],['school','ספרייה קטנה','school'],['school','שיעור אמנות','wand'],['school','הפסקה בחצר','sports'],['school','אוטובוס לבית הספר','car'],['school','מחברת ועט','school'],['school','לוח הכיתה','school'],['school','טקס סיום','trophy'],
]

const CATEGORY = { all:'🌈 הכל', birthday:'🎂 יום הולדת', animals:'🐾 חיות', space:'🚀 חלל', fantasy:'🦄 פנטזיה', vehicles:'🚗 כלי רכב', sports:'⚽ ספורט', school:'🏫 בית ספר' }

function LineArt({ kind }) {
  if (kind === 'cake') return <img src="/coloring/birthday-cake-lineart.png" alt="עוגת יום הולדת לצביעה" className="h-full w-full object-contain bg-white" />
  const common = { fill: 'white', stroke: '#172033', strokeWidth: '6', strokeLinejoin: 'round', strokeLinecap: 'round' }
  const decorations = <><circle {...common} cx="80" cy="80" r="14"/><path {...common} d="M90 220l18-18 18 18-18 18zM490 92l16-25 16 25-16 25zM500 340l20 20m0-20l-20 20M84 420l-20 20m0-20l20 20"/><path {...common} d="M45 285c28-22 52-22 80 0M470 260c18-18 38-18 56 0"/></>
  const draw = {
    cake: <><path {...common} d="M150 330h300l-24-115H174z"/><path {...common} d="M140 220c26-45 74 10 102-22 31 35 67-20 105 2 37-24 62 18 103 4v37H140z"/><path {...common} d="M185 330v-55m70 55v-55m70 55v-55m70 55v-55"/><path {...common} d="M220 198v-78m90 78v-78m90 78v-78"/><path {...common} d="M210 120q10-30 20 0q-10 24-20 0m80 0q10-30 20 0q-10 24-20 0m80 0q10-30 20 0q-10 24-20 0"/></>,
    balloons: <><ellipse {...common} cx="220" cy="220" rx="62" ry="85"/><ellipse {...common} cx="335" cy="190" rx="62" ry="85"/><ellipse {...common} cx="420" cy="260" rx="50" ry="72"/><path {...common} d="M220 305q22 80 50 125m65-155q-8 84-55 150m140-93q-9 64-35 98"/></>,
    crown: <><path {...common} d="M145 330h310l-24-170-84 76-46-112-49 112-85-76z"/><path {...common} d="M145 330h310v52H145z"/><circle {...common} cx="205" cy="355" r="13"/><circle {...common} cx="300" cy="355" r="13"/><circle {...common} cx="395" cy="355" r="13"/></>,
    cupcake: <><path {...common} d="M180 290h240l-28 130H208z"/><path {...common} d="M178 290q-12-68 53-70-15-61 50-66 15-62 69-17 68-10 73 57 49 10 29 96z"/><path {...common} d="M220 314v85m55-85v85m55-85v85m55-85v85"/></>,
    party: <><path {...common} d="M170 390l100-250 125 210z"/><path {...common} d="M270 140l26 38-48 2z"/><path {...common} d="M205 330l122-40m-92-53l105 77"/><circle {...common} cx="420" cy="165" r="40"/><path {...common} d="M420 205v132"/></>,
    cat: <><path {...common} d="M180 405V220l50-65 70 50 72-50 48 65v185z"/><ellipse {...common} cx="300" cy="310" rx="110" ry="105"/><circle {...common} cx="260" cy="295" r="12"/><circle {...common} cx="340" cy="295" r="12"/><path {...common} d="M300 320l-12 12h24zM230 330l-78-14m78 35l-80 12m238-33l78-14m-78 35l80 12"/></>,
    dog: <><ellipse {...common} cx="300" cy="300" rx="130" ry="115"/><path {...common} d="M190 245q-78-75-45-140 70 14 95 96m165 44q78-75 45-140-70 14-95 96"/><circle {...common} cx="260" cy="280" r="12"/><circle {...common} cx="340" cy="280" r="12"/><ellipse {...common} cx="300" cy="335" rx="25" ry="18"/><path {...common} d="M275 362q25 28 50 0"/></>,
    lion: <><circle {...common} cx="300" cy="280" r="142"/><circle {...common} cx="300" cy="280" r="96"/><circle {...common} cx="265" cy="260" r="10"/><circle {...common} cx="335" cy="260" r="10"/><path {...common} d="M300 286l-16 18h32zM266 335q34 30 68 0"/></>,
    elephant: <><path {...common} d="M180 365V220q0-98 112-98 130 0 130 118v130h-70v-82h-74v77z"/><circle {...common} cx="255" cy="225" r="55"/><circle {...common} cx="360" cy="225" r="55"/><path {...common} d="M292 290v122q0 44 45 44 38 0 38-39v-40"/><circle {...common} cx="270" cy="222" r="8"/><circle {...common} cx="330" cy="222" r="8"/></>,
    dino: <><path {...common} d="M130 360q5-165 135-175 70-150 185-62 90 70 20 160l-25 115h-67l-12-72-92 2-16 70h-75l10-86z"/><path {...common} d="M220 184l-25-50 50 25 20-53 25 59 42-40 4 60"/><circle {...common} cx="360" cy="205" r="10"/><path {...common} d="M385 242h50m-25-20v40"/></>,
    rocket: <><path {...common} d="M300 90q130 115 0 300Q170 205 300 90z"/><circle {...common} cx="300" cy="205" r="42"/><path {...common} d="M205 335l-66 34 55-84m157 50l66 34-55-84m-83 105l-34 75 55-34 55 34-34-75"/></>,
    planet: <><circle {...common} cx="300" cy="270" r="120"/><path {...common} d="M120 290q175-115 360-10-170 120-360 10z"/><circle {...common} cx="270" cy="230" r="20"/><circle {...common} cx="345" cy="300" r="28"/></>,
    alien: <><path {...common} d="M300 110q130 60 112 186-18 110-112 136-94-26-112-136Q170 170 300 110z"/><ellipse {...common} cx="260" cy="270" rx="34" ry="48"/><ellipse {...common} cx="340" cy="270" rx="34" ry="48"/><path {...common} d="M260 350q40 32 80 0"/></>,
    astronaut: <><circle {...common} cx="300" cy="200" r="94"/><circle {...common} cx="300" cy="200" r="62"/><path {...common} d="M205 300h190l35 145H170z"/><path {...common} d="M220 350h160m-155 45h150"/><path {...common} d="M170 330l-70 56m330-56l70 56"/></>,
    space: <><path {...common} d="M140 315q160-115 320 0v95H140z"/><path {...common} d="M180 315q20-145 120-145t120 145"/><circle {...common} cx="255" cy="270" r="28"/><circle {...common} cx="345" cy="270" r="28"/><path {...common} d="M230 410v55m140-55v55"/></>,
    unicorn: <><path {...common} d="M170 385V245q0-98 112-100 110-5 148 108v130z"/><path {...common} d="M300 145l38-100 20 120"/><path {...common} d="M210 210q-60-62-88 28 38 35 88 3"/><circle {...common} cx="330" cy="245" r="10"/><path {...common} d="M350 294q-36 25-70 0"/><path {...common} d="M195 340q-70 10-105 60m105-30q-70-5-105 32"/></>,
    castle: <><path {...common} d="M150 420V200h70v65h55v-65h70v65h55v-65h70v220z"/><path {...common} d="M150 200v-72l35 35 35-35v72m125 0v-72l35 35 35-35v72"/><path {...common} d="M270 420v-85h60v85"/><path {...common} d="M195 300h25m130 0h25"/></>,
    dragon: <><path {...common} d="M145 370q20-160 146-157 35-100 150-75 44 13 20 100 90 70 15 158z"/><path {...common} d="M245 230l-48-73 92 35m57 20l35-80 14 95"/><circle {...common} cx="385" cy="255" r="9"/><path {...common} d="M410 300h55m-28-22v44"/><path {...common} d="M240 320l-60 60m90-35l-50 55"/></>,
    wand: <><path {...common} d="M180 420L400 160"/><path {...common} d="M400 95l20 40 45 8-32 32 8 45-41-21-41 21 8-45-32-32 45-8z"/><path {...common} d="M170 145l14 27 30 5-22 21 5 30-27-15-27 15 5-30-22-21 30-5z"/></>,
    fairy: <><circle {...common} cx="300" cy="185" r="42"/><path {...common} d="M255 240q45-35 90 0l40 150H215z"/><path {...common} d="M250 265q-125-75-105 30 78 48 110 12m95-42q125-75 105 30-78 48-110 12"/><path {...common} d="M285 390l-35 70m65-70l35 70"/></>,
    car: <><path {...common} d="M125 350v-80l75-80h190l70 80v80z"/><circle {...common} cx="205" cy="350" r="45"/><circle {...common} cx="390" cy="350" r="45"/><path {...common} d="M220 270l35-55h90l35 55z"/><path {...common} d="M140 295h55m195 0h55"/></>,
    firetruck: <><path {...common} d="M125 360V235h230v125z"/><path {...common} d="M355 280h90l35 50v30h-125zM175 235v-75h55v75m20 0v-75h55v75"/><circle {...common} cx="200" cy="360" r="40"/><circle {...common} cx="395" cy="360" r="40"/><path {...common} d="M135 210h265"/></>,
    tractor: <><path {...common} d="M170 365V250h155v115z"/><path {...common} d="M325 300h105l42 65H325zM205 250v-85h80v85"/><circle {...common} cx="220" cy="365" r="48"/><circle {...common} cx="400" cy="365" r="30"/></>,
    train: <><path {...common} d="M155 170h290v210H155z"/><path {...common} d="M155 270h290M220 170v100m80-100v100m80-100v100"/><circle {...common} cx="220" cy="400" r="32"/><circle {...common} cx="380" cy="400" r="32"/><path {...common} d="M180 450h240"/></>,
    plane: <><path {...common} d="M300 95l60 185 105 65-18 32-130-40-17 110h-35l-17-110-130 40-18-32 105-65z"/></>,
    football: <><circle {...common} cx="300" cy="260" r="140"/><path {...common} d="M300 175l45 32-16 53h-58l-16-53zM200 205l70 2m60 0l70-2m-174 120l45-65m96 0l45 65m-112-65v90"/></>,
    basketball: <><circle {...common} cx="300" cy="270" r="140"/><path {...common} d="M160 270h280M300 130v280M205 165q95 105 0 210m190-210q-95 105 0 210"/></>,
    trophy: <><path {...common} d="M205 130h190v105q0 105-95 105t-95-105z"/><path {...common} d="M205 155h-72q0 100 85 100m177-100h72q0 100-85 100M270 340v65m60-65v65m-105 0h150"/></>,
    sports: <><path {...common} d="M160 375q50-165 140-165t140 165"/><circle {...common} cx="300" cy="145" r="48"/><path {...common} d="M230 265l-85 55m225-55l85 55m-180 50l-55 70m110-70l55 70"/></>,
    school: <><path {...common} d="M145 405V215l155-110 155 110v190z"/><path {...common} d="M145 215h310M260 405v-95h80v95m-115-125h45m60 0h45"/><path {...common} d="M180 150h240"/></>,
  }[kind] || null
  return <svg viewBox="0 0 600 520" className="h-full w-full bg-white" role="img" aria-label="איור לצביעה">{decorations}{draw}</svg>
}

export default function ColoringPages() {
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState(null)
  const pages = useMemo(() => category === 'all' ? PAGES : PAGES.filter(([cat]) => cat === category), [category])
  const print = (page) => setSelected(page)
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
    <SEO title="דפי צביעה להדפסה בחינם" description="דפי צביעה לפי נושאים: יום הולדת, חיות, חלל, פנטזיה, כלי רכב וספורט." path="/printables/coloring" />
    <Breadcrumbs items={[{label:'ראשי',href:'/'},{label:'דפים להדפסה',href:'/printables'},{label:'דפי צביעה'}]} />
    <header className="text-center"><span className="inline-flex rounded-full bg-pink-100 px-4 py-2 font-bold">{PAGES.length} דפי צביעה לבחירה</span><h1 className="mt-3 text-4xl sm:text-5xl">🎨 דפי צביעה להדפסה בחינם</h1><p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">דפים גדולים, נקיים וברורים לצביעה. בוחרים נושא, פותחים דף ומדפיסים.</p></header>
    <div className="no-print my-7 flex flex-wrap justify-center gap-2">{Object.entries(CATEGORY).map(([id,label]) => <button key={id} onClick={() => setCategory(id)} className={`rounded-2xl border-2 px-4 py-2 font-bold ${category===id?'border-pink-500 bg-pink-100':'border-slate-300 bg-white'}`}>{label} <span className="text-xs text-slate-500">({id==='all'?PAGES.length:PAGES.filter(([cat])=>cat===id).length})</span></button>)}</div>
    {selected && <PrintPreview title={selected[1]} onClose={()=>setSelected(null)}><article className="buga-a4"><h2>{selected[1]}</h2><div className="print-art"><LineArt kind={selected[2]} /></div><footer>עוגה בוגה · ugabuga.co.il</footer></article></PrintPreview>}
    <section className="no-print grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">{pages.map((page,index) => <article key={page[1]} className="group rounded-3xl border-2 border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><button className="block w-full text-right" onClick={() => setSelected(page)}><div className="aspect-[4/3] overflow-hidden rounded-2xl border bg-slate-50"><LineArt kind={page[2]} /></div><h2 className="mt-3 truncate text-center text-lg font-bold">{page[1]}</h2><p className="mt-1 text-center text-sm text-slate-500">{CATEGORY[page[0]]}</p></button><button onClick={() => print(page)} className="mt-3 w-full rounded-xl bg-pink-500 px-3 py-2 font-bold text-white">🖨️ הדפסה</button></article>)}</section>
    <section className="no-print mt-10 rounded-3xl border-2 border-dashed border-pink-300 bg-pink-50 p-6 text-center"><h2 className="text-2xl font-bold">רוצים עמוד חדש?</h2><p className="mt-2 text-slate-600">כל קטגוריה כוללת כמה דפים שונים — בחרו נושא אחר כדי לראות עוד.</p></section>

  </div>
}
