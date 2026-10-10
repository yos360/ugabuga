import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chess } from 'chess.js'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import ChessBoard from '../../chess/ChessBoard'
import Piece from '../../chess/Pieces'
import { ChessCards } from '../../chess/ChessLinks'
import '../../chess/chess.css'

// /chess/how-to-play — every chess piece with a small practice board (the same side keeps
// moving, so a child can try the piece again and again), special moves and tips for kids.
// The full rules text lives on /board-games/chess; this page links there instead of repeating it.

// After a move, give the turn back to the same side so the piece can keep exploring.
function keepTurn(fen, color) {
  const parts = fen.split(' ')
  parts[1] = color
  parts[3] = '-'
  try { return new Chess(parts.join(' ')).fen() } catch { return null }
}

function PracticeBoard({ fen, note }) {
  const color = fen.split(' ')[1]
  const [pos, setPos] = useState(fen)
  const [last, setLast] = useState(null)
  const [msg, setMsg] = useState(note)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const onMove = m => {
    const g = new Chess(pos)
    let mv
    try { mv = g.move(m) } catch { return }
    setLast(mv)
    if (g.inCheck()) {
      // the other king is attacked: show it, then start over (the same side can't move twice here)
      setPos(g.fen())
      setMsg('⚠️ שח למלך השחור! ככה נראה שח. מתחילים שוב…')
      clearTimeout(timer.current)
      timer.current = setTimeout(() => { setPos(fen); setLast(null); setMsg(note) }, 2200)
      return
    }
    const next = keepTurn(g.fen(), color)
    if (!next) { setPos(fen); return }
    setPos(next)
    setMsg(mv.captured ? '😋 אכלתם! נסו עוד מהלך.' : mv.promotion ? '👑 הרגלי הפך לכלי חדש!' : mv.flags.includes('k') || mv.flags.includes('q') ? '🏰 הצרחה! המלך מוגן והצריח נכנס למשחק.' : mv.flags.includes('e') ? '✨ הכאה דרך הילוכו!' : 'יפה! אפשר להמשיך לזוז.')
  }
  return (
    <div>
      <ChessBoard fen={pos} orientation="w" movable={color} onMove={onMove} lastMove={last} small label="לוח תרגול" />
      <p className="cz-mini-note" role="status">{msg}</p>
      <div className="cz-actions" style={{ marginTop: 6 }}><button type="button" className="cz-btn" onClick={() => { clearTimeout(timer.current); setPos(fen); setLast(null); setMsg(note) }}>🔁 מההתחלה</button></div>
    </div>
  )
}

const PIECES = [
  { id: 'king', type: 'k', name: 'המלך', value: 'לא סופרים אותו – בלעדיו מפסידים', fen: '7k/8/5p2/8/3K4/8/8/8 w - - 0 1', note: 'לחצו על המלך ונסו להגיע לרגלי השחור.', text: [
    'המלך זז משבצת אחת בלבד – לכל כיוון: קדימה, אחורה, לצדדים ובאלכסון.',
    'הוא הכלי הכי חשוב: כשהמלך מותקף ואין לו דרך להינצל – המשחק נגמר. לכן אסור לו לזוז למשבצת שכלי של היריב תוקף, והלוח פשוט לא יראה לכם משבצות כאלה.',
    'בתחילת המשחק המלך מסתתר מאחורי הרגלים. בסוף המשחק, כשנשארו מעט כלים, הוא יוצא החוצה והופך ללוחם חזק.',
  ] },
  { id: 'queen', type: 'q', name: 'המלכה', value: '9 נקודות', fen: '7k/1p6/8/5p2/3Q4/8/8/K7 w - - 0 1', note: 'המלכה יכולה להגיע רחוק. אכלו את שני הרגלים!', text: [
    'המלכה זזה כמה משבצות שרוצה בקו ישר או באלכסון – כמו צריח ורץ ביחד. היא לא יכולה לקפוץ מעל כלים.',
    'זה הכלי החזק ביותר, ולכן כדאי לשמור עליו. טעות נפוצה של מתחילים: להוציא את המלכה מוקדם מדי, ואז היריב רודף אחריה עם כלים קטנים.',
  ] },
  { id: 'rook', type: 'r', name: 'הצריח', value: '5 נקודות', fen: 'k7/8/3p4/8/3R2p1/8/8/7K w - - 0 1', note: 'הצריח הולך רק בקווים ישרים. אכלו רגלי!', text: [
    'הצריח זז בקווים ישרים – למעלה, למטה, ימינה ושמאלה – כמה משבצות שרוצה, עד שמשהו עוצר אותו.',
    'צריחים אוהבים טורים פתוחים, בלי רגלים בדרך. שני צריחים שעובדים יחד יכולים לתת מט גם בלי עזרה מהמלכה.',
  ] },
  { id: 'bishop', type: 'b', name: 'הרץ', value: '3 נקודות', fen: '7k/8/1p6/8/3B4/8/5p2/K7 w - - 0 1', note: 'הרץ זז רק באלכסון. שימו לב: הוא נשאר תמיד על אותו צבע.', text: [
    'הרץ זז באלכסון, כמה משבצות שרוצה. לכל שחקן יש שני רצים: אחד שמסתובב על המשבצות הבהירות ואחד על הכהות – והם אף פעם לא מחליפים צבע.',
    'רץ אוהב אלכסונים ארוכים ופתוחים. שני רצים יחד שולטים על כל הלוח.',
  ] },
  { id: 'knight', type: 'n', name: 'הפרש', value: '3 נקודות', fen: '7k/8/2p5/3P4/2PNP3/8/8/K7 w - - 0 1', note: 'הפרש מוקף ברגלים – ובכל זאת הוא יכול לקפוץ החוצה!', text: [
    'הפרש זז בצורת האות ר (או L באנגלית): שתי משבצות בקו ישר, ואז אחת הצידה. ככה הוא תמיד נוחת על משבצת בצבע ההפוך מזה שהתחיל בו.',
    'הוא היחיד שקופץ מעל כלים – שלו ושל היריב. טריק לזכור: הפרש תמיד נוחת על משבצת שהמלכה לא יכולה להגיע אליה במהלך אחד מאותו מקום.',
    'פרש במרכז הלוח שולט על 8 משבצות; פרש בפינה – רק על 2. לכן מכניסים פרשים למרכז.',
  ] },
  { id: 'pawn', type: 'p', name: 'הרגלי', value: 'נקודה אחת', fen: '7k/8/8/8/3p4/4p3/3P1P2/K7 w - - 0 1', note: 'נסו לזוז קדימה – ואז לאכול באלכסון.', text: [
    'הרגלי זז משבצת אחת קדימה, ובמהלך הראשון שלו מותר לו לזוז שתי משבצות. הוא אף פעם לא זז אחורה.',
    'הרגלי הוא היחיד שאוכל בדרך שונה מזו שהוא הולך: הוא הולך ישר, אבל אוכל משבצת אחת באלכסון קדימה. אם יש כלי ממש מולו – הוא תקוע.',
    'הוא קטן אבל חשוב: רגלי שמגיע לסוף הלוח הופך לכל כלי שתבחרו (חוץ ממלך).',
  ] },
]

const SPECIAL = [
  { id: 'castling', title: '🏰 הצרחה', fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1', note: 'לחצו על המלך הלבן והזיזו אותו שתי משבצות ימינה או שמאלה.', text: 'פעם אחת במשחק המלך יכול לזוז שתי משבצות לכיוון צריח, והצריח קופץ לצד השני שלו. זה מהלך אחד שמכניס את המלך למחבוא ומוציא את הצריח לקרב. מותר רק אם המלך והצריח עוד לא זזו, אין כלים ביניהם, והמלך לא בשח ולא עובר דרך משבצת מותקפת.' },
  { id: 'promotion', title: '👑 הכתרה', fen: '7k/3P4/8/8/8/8/8/K7 w - - 0 1', note: 'הזיזו את הרגלי לשורה האחרונה ובחרו כלי.', text: 'רגלי שמגיע לשורה האחרונה הופך מיד לכלי אחר: מלכה, צריח, רץ או פרש. כמעט תמיד בוחרים מלכה – ולכן אפשר שיהיו כמה מלכות על הלוח!' },
  { id: 'en-passant', title: '✨ הכאה דרך הילוכו', fen: 'k7/8/8/3pP3/8/8/8/7K w - d6 0 1', note: 'הרגלי השחור הרגע קפץ שתי משבצות. אכלו אותו באלכסון!', text: 'כשרגלי של היריב קופץ שתי משבצות ונעצר ממש ליד הרגלי שלכם, מותר לאכול אותו כאילו זז רק משבצת אחת. זה מותר רק מיד במהלך הבא – אחר כך ההזדמנות נעלמת.' },
]

const TIPS = [
  'מתחילים מהמרכז: הזיזו רגלי אמצעי שתי משבצות, ואחר כך הוציאו פרשים ורצים.',
  'לפני כל מהלך שואלים שתי שאלות: מה היריב מאיים לעשות? והאם הכלי שאני מזיז יהיה מוגן?',
  'לא מזיזים את אותו כלי פעמיים בפתיחה בלי סיבה טובה – עדיף להוציא עוד כלי.',
  'מצרחים מוקדם, כדי שהמלך יהיה בטוח.',
  'סופרים נקודות לפני שאוכלים: לתת צריח (5) בשביל פרש (3) זה הפסד.',
  'כשיש לכם יתרון – מחליפים כלים. כשאתם בפיגור – משתדלים להימנע מהחלפות.',
  'זהירות מפט! כשהיריב כמעט בלי כלים, תשאירו למלך שלו לפחות מהלך אחד עד שאתם נותנים מט.',
  'מפסידים? זה חלק מהלמידה. כל אלוף שחמט הפסיד אלפי משחקים בדרך.',
]

const FAQ = [
  { q: 'כמה כלי שחמט יש לכל שחקן?', a: '16: מלך אחד, מלכה אחת, שני צריחים, שני רצים, שני פרשים ושמונה רגלים. בסך הכול יש על הלוח 32 כלים בתחילת המשחק.' },
  { q: 'איזה כלי הכי חזק בשחמט?', a: 'המלכה – היא שווה 9 נקודות כי היא זזה גם בקווים ישרים וגם באלכסון. המלך הוא הכלי החשוב ביותר, אבל לא החזק ביותר.' },
  { q: 'איך זוכרים איך זז הפרש?', a: 'חושבים על האות ר או L: שתיים ישר ואחת הצידה. דרך נוספת: הפרש תמיד נוחת על משבצת בצבע הפוך מהמשבצת שעליה עמד.' },
  { q: 'האם רגלי יכול לזוז אחורה?', a: 'לא. רגלי זז רק קדימה. זו הסיבה שצריך לחשוב טוב לפני שמזיזים רגלים – אי אפשר לבטל את זה.' },
]

export default function ChessHowToPage() {
  return (
    <div className="cz-page" dir="rtl">
      <SEO title="איך משחקים שחמט – כלי השחמט ואיך זז כל כלי" description="איך משחקים שחמט: הסבר פשוט לילדים על כלי השחמט – מלך, מלכה, צריח, רץ, פרש ורגלי – עם לוח קטן לתרגול ליד כל כלי, מהלכים מיוחדים וטיפים למתחילים." path="/chess/how-to-play" structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שחמט אונליין', href: '/chess' }, { label: 'איך משחקים שחמט' }]} />
      <header className="cz-head">
        <h1>📘 איך משחקים שחמט</h1>
        <p>איך משחקים שחמט? לומדים כלי אחד בכל פעם. ליד כל אחד מכלי השחמט יש לוח קטן: לוחצים על הכלי, רואים לאן מותר לו לזוז, ומנסים בעצמכם – כמה פעמים שרוצים.</p>
      </header>

      <ul className="cz-toc" aria-label="כלי השחמט">
        {PIECES.map(p => <li key={p.id}><a href={`#${p.id}`}><Piece type={p.type} color="w" />{p.name}</a></li>)}
        <li><a href="#special">⭐ מהלכים מיוחדים</a></li>
        <li><a href="#tips">💡 טיפים</a></li>
      </ul>

      <section className="cz-box">
        <h2>המטרה והלוח</h2>
        <div className="cz-piece-sec">
          <div>
            <p>שחמט משחקים שניים, על לוח של 8 על 8 משבצות. כל שחקן מקבל 16 כלים – לבנים או שחורים – והלבנים תמיד מתחילים. בכל תור מזיזים כלי אחד.</p>
            <p>המטרה: לתת <b>מט</b> – לתקוף את המלך של היריב כך שאין לו דרך להינצל. כשהמלך מותקף אבל יכול לברוח, לחסום או לאכול את התוקף, זה רק <b>שח</b>.</p>
            <p>כך מסדרים: המשבצת בפינה הימנית הקרובה אליכם בהירה. בשורה הראשונה – צריח, פרש, רץ, מלכה, מלך, רץ, פרש, צריח, כשהמלכה עומדת על משבצת בצבע שלה. בשורה השנייה – שמונה רגלים. את החוקים המלאים, כולל תיקו ופט, אפשר לקרוא ולהדפיס בעמוד <Link to="/board-games/chess?tab=rules" className="underline font-bold">חוקי השחמט</Link>.</p>
          </div>
          <div>
            <ChessBoard fen={new Chess().fen()} movable={null} small label="סידור הכלים בתחילת המשחק" />
            <p className="cz-mini-note">סידור הכלים בתחילת המשחק</p>
          </div>
        </div>
      </section>

      {PIECES.map(p => (
        <section key={p.id} id={p.id} className="cz-box">
          <div className="cz-piece-sec">
            <div>
              <h2><Piece type={p.type} color="w" /> {p.name} <span className="cz-value">{p.value}</span></h2>
              {p.text.map(t => <p key={t}>{t}</p>)}
            </div>
            <PracticeBoard fen={p.fen} note={p.note} />
          </div>
        </section>
      ))}

      <section className="cz-box">
        <h2>כמה שווה כל כלי?</h2>
        <p style={{ lineHeight: 1.7 }}>שחקני שחמט סופרים נקודות כדי להחליט אם כדאי לאכול או להחליף. זו לא חוקה – רק עזרה לחשוב:</p>
        <table className="cz-values">
          <thead><tr><th>כלי</th><th>שם</th><th>שווי</th><th>כמה יש לכל שחקן</th></tr></thead>
          <tbody>
            {[['p', 'רגלי', '1', '8'], ['n', 'פרש', '3', '2'], ['b', 'רץ', '3', '2'], ['r', 'צריח', '5', '2'], ['q', 'מלכה', '9', '1'], ['k', 'מלך', '—', '1']].map(([t, n, v, c]) => (
              <tr key={t}><td><Piece type={t} color="w" /></td><td>{n}</td><td>{v}</td><td>{c}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <h2 id="special" style={{ fontSize: 26, margin: '8px 0 12px' }}>⭐ מהלכים מיוחדים</h2>
      {SPECIAL.map(s => (
        <section key={s.id} className="cz-box">
          <div className="cz-piece-sec">
            <div><h2>{s.title}</h2><p>{s.text}</p></div>
            <PracticeBoard fen={s.fen} note={s.note} />
          </div>
        </section>
      ))}

      <section id="tips" className="cz-box">
        <h2>💡 טיפים לילדים שמתחילים לשחק</h2>
        <ol style={{ lineHeight: 1.8, fontSize: 17, margin: 0, paddingInlineStart: 22 }}>{TIPS.map(t => <li key={t}>{t}</li>)}</ol>
        <p style={{ marginTop: 12, lineHeight: 1.7 }}>מכירים את הכלים? עכשיו נסו <Link to="/chess" className="underline font-bold">משחק נגד המחשב ברמת מתחיל</Link>, או עברו על <Link to="/board-games/chess?tab=learn" className="underline font-bold">10 שיעורי השחמט</Link> שבהם כל שלב הוא משימה קטנה.</p>
      </section>

      <section className="cz-box">
        <h2>ממשיכים מכאן</h2>
        <ChessCards except="/chess/how-to-play" />
      </section>

      <SeoBody
        paragraphs={[
          'הדרך הכי קלה ללמד ילד שחמט היא לא להסביר את כל החוקים בבת אחת. מתחילים מכלי אחד, משחקים איתו כמה דקות על לוח כמעט ריק, ורק אז מוסיפים את הבא. רוב הילדים קולטים את תנועת הכלים כבר בגיל 5–6, ואת הרעיון של שח ומט קצת אחר כך.',
          'משחק מוכר לתרגול: כל אחד מקבל רק רגלים, והמטרה היא להביא רגלי ראשון לצד השני. אחר כך מוסיפים לכל צד פרש, וכך הלאה – עד שמשחקים עם כל הכלים.',
        ]}
        faq={FAQ}
        related={[
          { label: 'לוח שחמט להדפסה', href: '/chess/printable-board' },
          { label: 'חידות שחמט', href: '/chess/puzzles' },
          { label: 'שחמט אונליין', href: '/chess' },
        ]}
      />
    </div>
  )
}
