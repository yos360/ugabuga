import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import Piece from '../../chess/Pieces'
import { ChessCards } from '../../chess/ChessLinks'
import '../../chess/chess.css'

// /chess/printable-board — an A4 chess board, cut-out pieces the same size as its squares,
// and a one-page "how the pieces move" cheat sheet, printed through PrintPreview.

const FILES = 'abcdefgh'
const BACK = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']

function Board({ color }) {
  const cells = []
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) cells.push(<span key={`${r}${c}`} className={(r + c) % 2 ? 'd' : 'l'} />)
  const files = <div className="files">{[...FILES].map(f => <span key={f}>{f}</span>)}</div>
  const ranks = <div className="ranks">{[8, 7, 6, 5, 4, 3, 2, 1].map(n => <span key={n}>{n}</span>)}</div>
  return (
    <div className="cz-print-frame" dir="ltr">
      {files}
      {ranks}
      <div className={`cz-print-board${color ? ' is-color' : ''}`}>{cells}</div>
      {ranks}
      {files}
    </div>
  )
}

function Cutouts() {
  const rows = [
    BACK.map(t => ['w', t]), Array(8).fill(['w', 'p']),
    Array(8).fill(['b', 'p']), BACK.map(t => ['b', t]),
    [['w', 'q'], ['w', 'q'], ['w', 'r'], ['w', 'n'], ['b', 'q'], ['b', 'q'], ['b', 'r'], ['b', 'n']],
  ]
  return <div className="cz-cutouts" dir="ltr">{rows.flat().map(([c, t], i) => <span key={i}><Piece type={t} color={c} /></span>)}</div>
}

// the starting position, drawn from white's side (rank 8 on top)
function SetupDiagram() {
  const row = r => (r === 0 ? BACK.map(t => ['b', t]) : r === 1 ? Array(8).fill(['b', 'p']) : r === 6 ? Array(8).fill(['w', 'p']) : r === 7 ? BACK.map(t => ['w', t]) : Array(8).fill(null))
  const cells = []
  for (let r = 0; r < 8; r++) row(r).forEach((p, c) => cells.push(<span key={`${r}${c}`} className={(r + c) % 2 ? 'd' : 'l'}>{p && <Piece type={p[1]} color={p[0]} />}</span>))
  return <div className="cz-print-board cz-setup" dir="ltr">{cells}</div>
}

const CHEAT = [
  ['k', 'מלך', 'משבצת אחת לכל כיוון. אסור לו להיכנס למשבצת מותקפת.'],
  ['q', 'מלכה', 'כמה משבצות שרוצה – ישר או באלכסון.'],
  ['r', 'צריח', 'כמה משבצות שרוצה – רק בקווים ישרים.'],
  ['b', 'רץ', 'כמה משבצות שרוצה – רק באלכסון.'],
  ['n', 'פרש', 'צורת ר: שתיים ישר ואחת הצידה. קופץ מעל כלים.'],
  ['p', 'רגלי', 'אחת קדימה (בפעם הראשונה – עד שתיים). אוכל באלכסון.'],
]

function Sheets({ color, sheets }) {
  const out = []
  if (sheets.board) out.push(
    <article key="board" className="buga-a4 cz-sheet">
      <h2>לוח שחמט</h2>
      <p className="art-caption">משבצת בהירה בפינה הימנית הקרובה לכל שחקן · הלבנים מתחילים</p>
      <Board color={color} />
      <footer>עוגה בוגה · לוח שחמט להדפסה · ugabuga.co.il</footer>
    </article>
  )
  if (sheets.pieces) out.push(
    <article key="pieces" className="buga-a4 cz-sheet">
      <h2>כלי שחמט לגזירה</h2>
      <p className="art-caption">גוזרים לאורך הקווים המקווקווים. כל כלי בגודל משבצת בלוח. השורה התחתונה – כלים נוספים להכתרה.</p>
      <Cutouts />
      <p className="art-caption" style={{ marginTop: 10 }}>טיפ: מדביקים את הכלים על קרטון או על פקקים של בקבוקים – ככה הם עומדים יציב ולא עפים.</p>
      <footer>עוגה בוגה · כלי שחמט להדפסה · ugabuga.co.il</footer>
    </article>
  )
  if (sheets.cheat) out.push(
    <article key="cheat" className="buga-a4 cz-sheet">
      <h2>דף עזר: איך זז כל כלי</h2>
      <div className="cz-print-cheat">{CHEAT.map(([t, n, s]) => <div key={t}><Piece type={t} color="w" /><b>{n}</b><br />{s}</div>)}</div>
      <SetupDiagram />
      <p className="art-caption" style={{ marginTop: 12, textAlign: 'right' }}><b>סידור:</b> בשורה הראשונה מימין לשמאל מנקודת המבט של הלבנים: צריח, פרש, רץ, מלך, מלכה, רץ, פרש, צריח – המלכה על משבצת בצבע שלה. בשורה השנייה שמונה רגלים.</p>
      <p className="art-caption" style={{ textAlign: 'right' }}><b>שח</b> – המלך מותקף וחייב להינצל. <b>מט</b> – אין לו דרך להינצל: ניצחון. <b>פט</b> – אין מהלך חוקי אבל אין שח: תיקו.</p>
      <p className="art-caption" style={{ textAlign: 'right' }}><b>מהלכים מיוחדים:</b> הצרחה (המלך זז שתיים לכיוון הצריח והצריח קופץ מעליו), הכתרה (רגלי בסוף הלוח הופך לכלי אחר), הכאה דרך הילוכו.</p>
      <footer>עוגה בוגה · שחמט לילדים · ugabuga.co.il</footer>
    </article>
  )
  return out
}

const FAQ = [
  { q: 'באיזה גודל יוצא לוח השחמט המודפס?', a: 'הלוח ממלא דף A4: כל משבצת בערך 2 על 2 ס״מ, והכלים לגזירה בדיוק בגודל של משבצת.' },
  { q: 'אפשר להדפיס במדפסת שחור-לבן?', a: 'כן. בגרסה החסכונית המשבצות הכהות אפורות, והכלים מצוירים בקווים ברורים. אם יש מדפסת צבעונית אפשר לבחור לוח בצבעי עץ.' },
  { q: 'איך עושים שהכלים יעמדו?', a: 'מדביקים כל כלי על ריבוע קרטון או על פקק של בקבוק. אפשר גם להדפיס את דף הכלים על בריסטול.' },
]

export default function ChessPrintablePage() {
  const [printing, setPrinting] = useState(null)
  const [color, setColor] = useState(false)
  return (
    <div className="cz-page" dir="rtl">
      <SEO title="לוח שחמט להדפסה – לוח, כלים לגזירה ודף עזר" description="לוח שחמט להדפסה בחינם בגודל A4, כלי שחמט לגזירה בגודל המשבצות (כולל מלכות נוספות להכתרה) ודף עזר שמסביר איך זז כל כלי. בצבע או בשחור-לבן." path="/chess/printable-board" structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שחמט אונליין', href: '/chess' }, { label: 'לוח שחמט להדפסה' }]} />
      <header className="cz-head">
        <h1>🖨️ לוח שחמט להדפסה</h1>
        <p>לוח שחמט להדפסה עם כלים לגזירה: מדפיסים שני דפים, גוזרים, ויש לכם משחק שחמט שלם – לטיול, לכיתה או לחופשה בלי מסכים. יש גם דף עזר שמזכיר איך זז כל כלי.</p>
      </header>

      <div className="cz-actions" style={{ marginBottom: 16 }}>
        <button type="button" data-print-main className="cz-btn is-primary" onClick={() => setPrinting({ board: true, pieces: true, cheat: true })}>🖨️ הדפסת הכול (3 דפים)</button>
        <button type="button" className="cz-btn" onClick={() => setPrinting({ board: true })}>רק הלוח</button>
        <button type="button" className="cz-btn" onClick={() => setPrinting({ pieces: true })}>רק הכלים</button>
        <button type="button" className="cz-btn" onClick={() => setPrinting({ cheat: true })}>רק דף העזר</button>
      </div>
      <div className="cz-seg" role="group" aria-label="צבע הלוח" style={{ maxWidth: 460, margin: '0 auto 18px' }}>
        <button type="button" aria-pressed={!color} onClick={() => setColor(false)}>⚫ שחור-לבן (חוסך דיו)</button>
        <button type="button" aria-pressed={color} onClick={() => setColor(true)}>🎨 צבעי עץ</button>
      </div>

      <section className="cz-sheet-preview">
        <figure><Board color={color} /><figcaption>דף 1: לוח שחמט 8×8 עם אותיות ומספרים</figcaption></figure>
        <figure><Cutouts /><figcaption>דף 2: 32 כלים לגזירה + 8 כלים נוספים להכתרה</figcaption></figure>
      </section>

      <section className="cz-box" style={{ marginTop: 22 }}>
        <h2>איך מכינים</h2>
        <ol style={{ lineHeight: 1.8, fontSize: 17, margin: 0, paddingInlineStart: 22 }}>
          <li>מדפיסים ב-A4 לאורך, בגודל אמיתי (100%) – בלי "התאמה לדף".</li>
          <li>גוזרים את הכלים לאורך הקווים המקווקווים. ילדים קטנים יכולים לצבוע קודם את הכלים השחורים בעיפרון.</li>
          <li>מסדרים: משבצת בהירה בפינה הימנית הקרובה, המלכה על משבצת בצבע שלה. לא זוכרים? יש <Link to="/chess/how-to-play" className="underline font-bold">הסבר על כלי השחמט</Link>.</li>
          <li>משחקים! רוצים לשחק גם אונליין? <Link to="/chess" className="underline font-bold">שחמט נגד המחשב</Link>.</li>
        </ol>
      </section>

      <section className="cz-box">
        <h2>עוד שחמט</h2>
        <ChessCards except="/chess/printable-board" />
      </section>

      <SeoBody
        paragraphs={[
          'לוח שחמט מודפס הוא פתרון מצוין כשאין לוח בבית, כשנוסעים, או כשמורה רוצה שכל זוג בכיתה ישחק בו-זמנית. הלוח והכלים מצוירים אצלנו במיוחד, בקווים עבים וברורים שנראים טוב גם במדפסת ביתית פשוטה.',
          'בשורה האחרונה של דף הכלים יש כלים נוספים – שתי מלכות, צריח ופרש לכל צבע – כדי שאפשר יהיה להכתיר רגלי בלי לחפש מטבע שיחליף את המלכה.',
        ]}
        faq={FAQ}
        related={[
          { label: 'חוקי השחמט להדפסה', href: '/board-games/chess?tab=rules' },
          { label: 'חידות שחמט', href: '/chess/puzzles' },
          { label: 'דפים להדפסה', href: '/printables' },
        ]}
      />

      {printing && <PrintPreview title="לוח שחמט להדפסה" onClose={() => setPrinting(null)}><Sheets color={color} sheets={printing} /></PrintPreview>}
    </div>
  )
}
