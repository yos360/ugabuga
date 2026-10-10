import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { generatePuzzle, dailySeed } from '../../logicgrid/engine'
import { THEMES, LEVELS, LEVEL_IDS, levelLine } from '../../logicgrid/themes'
import { israelDayNumber } from '../../utils/israelDate'
import LogicBoard, { AnswerTable, SolutionSteps, PuzzleSheet } from './LogicBoard'

// /logic-puzzles (hub) + /easy /hard /kids /print /solutions — logic grid puzzles (תשבצי היגיון)
// generated in the browser: exactly one solution, no unneeded clue, hints that explain the next step.

const HUB = '/logic-puzzles'
const newSeed = () => Math.floor(Math.random() * 1e9) + 1
const crumbs = label => [{ label: 'ראשי', href: '/' }, { label: 'תשבצי היגיון', href: HUB }, { label }]
const Page = ({ children }) => <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const Hero = ({ badge, emoji, h1, children }) => <header className="text-center">
  {badge && <span className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-bold sm:text-base">{badge}</span>}
  <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">{emoji} </span>{h1}</h1>
  <p className="mx-auto mt-3 max-w-3xl text-lg leading-relaxed text-slate-600">{children}</p>
</header>

// Level / theme picker + board. A fixed first seed keeps the first puzzle stable for crawlers.
function Player({ levels, firstSeed }) {
  const [level, setLevel] = useState(levels[0])
  const [theme, setTheme] = useState('')
  const [seed, setSeed] = useState(firstSeed)
  const puz = useMemo(() => generatePuzzle(seed, level, theme || null), [seed, level, theme])
  return <div className="mt-6">
    <div className="no-print mb-4 flex flex-wrap items-center justify-center gap-2">
      {levels.length > 1 && levels.map(l => <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={`min-h-[48px] rounded-2xl border-2 px-4 font-bold ${level === l ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white'}`}>{LEVELS[l].label} <small className="font-normal">{LEVELS[l].size}</small></button>)}
      <label className="flex min-h-[48px] items-center gap-2 font-bold">נושא:
        <select value={theme} onChange={e => setTheme(e.target.value)} className="min-h-[44px] rounded-xl border-2 border-slate-200 bg-white px-2">
          <option value="">הפתעה</option>{THEMES.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.title}</option>)}
        </select></label>
    </div>
    <LogicBoard key={`${seed}-${level}-${theme}`} puz={puz} onNew={() => setSeed(newSeed())} />
  </div>
}

const MoreLinks = ({ skip }) => <nav aria-label="עוד תשבצי היגיון" className="mt-8 grid gap-3 sm:grid-cols-3">
  {[[HUB, '🧠', 'כל תשבצי ההיגיון', 'התשבץ היומי וכל הרמות'], ['/logic-puzzles/kids', '🧒', 'תשבץ היגיון לילדים', '3 ילדים, 3 קטגוריות'], ['/logic-puzzles/easy', '🙂', 'תשבצי היגיון קלים', 'טבלאות 3×4'], ['/logic-puzzles/hard', '🔥', 'תשבצי היגיון קשים', '4×4 ו־4×5'], ['/logic-puzzles/print', '🖨️', 'תשבצי היגיון להדפסה', 'עם דפי פתרון'], ['/logic-puzzles/solutions', '🔎', 'איך פותרים תשבץ היגיון', 'שיטה ודוגמה מלאה']]
    .filter(([to]) => to !== skip).map(([to, e, t, d]) => <Link key={to} to={to} className="rounded-2xl border-2 border-slate-200 bg-white p-4 hover:border-violet-400"><b className="text-lg"><span aria-hidden="true">{e} </span>{t}</b><small className="block text-slate-600">{d}</small></Link>)}
</nav>

const RELATED = [{ label: 'חידות היגיון', href: '/riddles/logic' }, { label: 'בעיות היגיון למחוננים', href: '/learn/gifted-test/logic-problems' }, { label: 'סודוקו אונליין', href: '/online-games/sudoku' }]

// ---- Hub ---------------------------------------------------------------------------------------
const HUB_FAQ = [
  { q: 'מה זה תשבץ היגיון?', a: 'תשבץ היגיון (נקרא גם "חידת איינשטיין" או "חידת זברה") הוא חידה שבה כמה דמויות, ולכל אחת פרט אחד מכל קטגוריה — חיה, גיל, צבע וכדומה. בעזרת הרמזים ממלאים טבלה של ✓ ו־✗ עד שמגלים מי מה.' },
  { q: 'האם לכל תשבץ יש פתרון אחד בלבד?', a: 'כן. המחשב בודק כל תשבץ לפני שהוא מוצג: יש לו בדיוק פתרון אחד, ואין בו רמז מיותר — אם מוחקים רמז כלשהו, כבר אי אפשר לדעת את התשובה בוודאות. כל תשבץ אפשר לפתור בהיגיון בלבד, בלי לנחש.' },
  { q: 'מה עושה הכפתור "רמז"?', a: 'הוא לא מגלה סתם תשובה — הוא מסביר במילים את הצעד ההגיוני הבא ומסמן את התא בטבלה. אם יש סימון שגוי, הרמז קודם כול מצביע עליו.' },
  { q: 'מה זה התשבץ היומי?', a: 'כל יום מופיע כאן תשבץ היגיון חדש ברמה בינונית — אותו תשבץ לכל מי שנכנס באותו יום, כך שאפשר לפתור יחד עם חברים או בכיתה ולהשוות.' },
  { q: 'לאיזה גיל זה מתאים?', a: 'תשבץ ההיגיון לילדים (3×3) מתאים בערך מכיתה ב׳, הקל מכיתות ג׳–ד׳, הבינוני מכיתה ה׳, והקשה (4×5) מאתגר גם מבוגרים.' },
]

export function LogicHub() {
  const [now] = useState(() => Date.now())
  const day = israelDayNumber(now)
  const label = new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(now))
  const daily = useMemo(() => generatePuzzle(dailySeed(day), 'medium', THEMES[((day % THEMES.length) + THEMES.length) % THEMES.length].id), [day])
  return <Page>
    <SEO title="תשבצי היגיון אונליין — לפתור בחינם, עם רמזים ופתרונות" description="תשבצי היגיון בעברית: פותרים על לוח אינטראקטיבי עם ✓ ו־✗, רמז שמסביר את הצעד הבא ופתרון מלא. תשבץ יומי, 4 רמות קושי, לילדים ולמבוגרים, וגם להדפסה." path={HUB} structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'תשבצי היגיון' }]} />
    <Hero badge="תשבץ חדש כל יום · 4 רמות · חינם" emoji="🧠" h1="תשבצי היגיון">
      תשבצי היגיון הם חידות "מי מה?": כמה ילדים, משפחות או חברים, ולכל אחד פרט אחר בכל קטגוריה. כאן פותרים תשבצי היגיון אונליין על טבלה אמיתית — מסמנים ✓ ו־✗, מסמנים רמזים שכבר השתמשתם בהם, ומבקשים רמז שמסביר במילים את הצעד הבא.
    </Hero>
    <div className="mt-8"><LogicBoard key={day} puz={daily} title={`תשבץ ההיגיון היומי — ${label}`} /></div>
    <section className="mt-10">
      <h2 className="text-2xl font-black">בחרו רמה</h2>
      <p className="mt-1 text-slate-600">התחילו מ<Link to="/logic-puzzles/kids" className="font-bold underline">תשבץ היגיון לילדים</Link> עם 3 ילדים בלבד, עברו ל<Link to="/logic-puzzles/easy" className="font-bold underline">תשבצי היגיון קלים</Link>, ומשם ל<Link to="/logic-puzzles/hard" className="font-bold underline">תשבצי היגיון קשים</Link> עם 4 קטגוריות. למורים ולנסיעות יש <Link to="/logic-puzzles/print" className="font-bold underline">תשבצי היגיון להדפסה</Link>, ומי שנתקע ימצא <Link to="/logic-puzzles/solutions" className="font-bold underline">הסבר איך פותרים</Link> עם דוגמה מלאה.</p>
      <MoreLinks skip={HUB} />
    </section>
    <div className="mt-10"><SeoBody paragraphs={[
      'איך משחקים? קוראים את הסיפור ואת הרמזים. בכל טבלה קטנה מצטלבות שתי קטגוריות — למשל ילדים וחיות. כשרמז אומר שמשהו לא נכון, מסמנים ✗. כשמגלים התאמה, מסמנים ✓, ושאר השורה והעמודה מתמלאות ב־✗ — כי לכל ילד יש רק חיה אחת. הטבלאות משלימות זו את זו: אם דנה מגדלת את הכלב, ומי שמגדל את הכלב בן 8 — אז דנה בת 8.',
      'יש ארבע רמות: לילדים (3 ילדים, 3 קטגוריות), קל (4 פריטים), בינוני (4 קטגוריות של 4) וקשה (4 קטגוריות של 5). הנושאים מתחלפים: חיות מחמד, בתים וצבעים, ספורט, ימי הולדת ומתנות, ארוחות וטיול שנתי. כל התשבצים נכתבו ונבנים כאן, בעברית, עם רמזים מסוגים שונים: "כן", "לא", "או… או…", "לפני / אחרי" ו"צמודים".',
      'תשבצי היגיון מפתחים חשיבה מסודרת, סבלנות וקריאה מדויקת — כל מילה ברמז חשובה. הם מתאימים לפעילות שקטה בבית, לשיעור חשיבה בכיתה, להכנה למבחן המחוננים ולמבוגרים שאוהבים חידות.',
    ]} faq={HUB_FAQ} related={RELATED} /></div>
  </Page>
}

// ---- Level spokes ------------------------------------------------------------------------------
const SPOKES = {
  kids: {
    path: '/logic-puzzles/kids', levels: ['kids'], emoji: '🧒', crumb: 'לילדים', h1: 'תשבץ היגיון לילדים', badge: '3 ילדים · 3 קטגוריות · עם רמזים',
    title: 'תשבץ היגיון לילדים — חידות "מי מה?" קלות, לפתור אונליין', desc: 'תשבץ היגיון לילדים: 3 ילדים, 3 קטגוריות ו־4–5 רמזים פשוטים. טבלת ✓ ו־✗, רמז שמסביר מה לעשות ותשבץ חדש בכל לחיצה. מתאים מכיתה ב׳.',
    intro: 'תשבץ היגיון לילדים הוא הדרך הכי טובה להתחיל: רק שלושה ילדים, שתי שאלות לכל אחד ("איזו חיה?" "בן כמה?"), וכמה רמזים קצרים. מסמנים ✗ על מה שלא יכול להיות, ✓ על מה שבטוח — ומגלים מי מה.',
    body: ['איך מתחילים? קוראים את הרמז הראשון בקול. אם כתוב "דנה לא מגדלת את הכלב", שמים ✗ בשורה של דנה ובעמודה של הכלב. כשנשאר בשורה רק תא אחד ריק — שם ה־✓. ילדים צעירים יכולים לפתור עם הורה: אחד קורא רמז, השני מסמן.', 'כל תשבץ לילדים נבנה כך שיש לו פתרון אחד בלבד, וכל רמז נחוץ. אם נתקעים, הכפתור "רמז" מסביר במשפט פשוט מה אפשר להסיק עכשיו — ומסמן את התא בצהוב.', 'מוכנים לשלב הבא? נסו את התשבצים הקלים עם ארבעה ילדים, או הדפיסו כמה תשבצים לילדים לנסיעה.'],
    faq: [{ q: 'מאיזה גיל אפשר לפתור תשבץ היגיון?', a: 'ילדים שקוראים משפט שלם — בערך מכיתה ב׳ — יכולים לפתור את תשבצי הילדים לבד. ילדי גן וכיתה א׳ נהנים לפתור יחד עם מבוגר שקורא את הרמזים.' }, { q: 'הילד נתקע. מה עושים?', a: 'לוחצים על "רמז": התא הבא מסומן בצהוב, ויש הסבר קצר למה. אפשר גם ללחוץ "בדיקה" כדי לראות אם יש טעות.' }, { q: 'אפשר להדפיס?', a: 'כן — בעמוד תשבצי ההיגיון להדפסה יש תשבצים לילדים עם דף פתרון.' }],
    related: [{ label: 'תשבצי היגיון קלים', href: '/logic-puzzles/easy' }, { label: 'חידות היגיון', href: '/riddles/logic' }, { label: 'מבוכים להדפסה', href: '/printables/mazes' }],
  },
  easy: {
    path: '/logic-puzzles/easy', levels: ['easy'], emoji: '🙂', crumb: 'קלים', h1: 'תשבצי היגיון קלים', badge: '3 קטגוריות · 4 פריטים · תשבץ חדש בכל לחיצה',
    title: 'תשבצי היגיון קלים — לפתור אונליין עם רמזים', desc: 'תשבצי היגיון קלים בעברית: טבלאות 3×4, רמזים של כן/לא, או/או ולפני/אחרי. פותרים אונליין, מקבלים רמז שמסביר את הצעד הבא ורואים פתרון מלא.',
    intro: 'תשבצי היגיון קלים הם השלב שאחרי תשבצי הילדים: ארבע דמויות ושלוש קטגוריות, ורמזים מגוונים יותר — "או… או…", "לפני", "מיד אחרי". מתאים לפותרים מתחילים בכל גיל.',
    body: ['טיפ לתשבץ קל: התחילו מרמזים שאומרים משהו במפורש ("יעל שתתה חלב"), אחריהם רמזי "לא", ורק בסוף רמזי הסדר. רמז כמו "נועם צעיר מדנה" אומר שנועם לא הכי מבוגר ודנה לא הכי צעירה — שני ✗ מיד.', 'הנושאים משתנים בכל תשבץ: חיות מחמד, ימי הולדת, ארוחות, ספורט, בתים ברחוב וטיול שנתי. אפשר לבחור נושא מהרשימה או לתת לנו להפתיע.'],
    faq: [{ q: 'מה ההבדל בין קל לקשה?', a: 'בתשבץ קל יש 3 קטגוריות של 4 פריטים (3 טבלאות קטנות). בקשה יש 4 קטגוריות של 5 — שש טבלאות, יותר רמזים, ולפעמים צריך לנסות הנחה ולראות שהיא מובילה לסתירה.' }, { q: 'האם צריך לנחש?', a: 'לא. לכל תשבץ יש פתרון אחד, ובתשבץ קל אפשר להגיע אליו בהסקה ישירה בלבד.' }, { q: 'איך יודעים שפתרתי נכון?', a: 'כשכל ה־✓ בטבלאות של השמות נכונים מופיעה הודעת "כל הכבוד", ואפשר גם ללחוץ "בדיקה" בכל רגע.' }],
    related: [{ label: 'תשבצי היגיון קשים', href: '/logic-puzzles/hard' }, { label: 'איך פותרים', href: '/logic-puzzles/solutions' }, { label: 'בעיות היגיון למחוננים', href: '/learn/gifted-test/logic-problems' }],
  },
  hard: {
    path: '/logic-puzzles/hard', levels: ['hard', 'medium'], emoji: '🔥', crumb: 'קשים', h1: 'תשבצי היגיון קשים', badge: '4 קטגוריות · 4×4 ו־4×5 · למבוגרים ולנוער',
    title: 'תשבצי היגיון קשים — 4 קטגוריות, לפתור אונליין', desc: 'תשבצי היגיון קשים בעברית: 4 קטגוריות של 5 (או 4), שש טבלאות, רמזי או/או, צמודים ו"מיד אחרי". כל תשבץ עם פתרון אחד, רמז מוסבר ופתרון מלא.',
    intro: 'תשבצי היגיון קשים הם האתגר האמיתי: ארבע קטגוריות, חמישה פריטים בכל אחת ושש טבלאות שמתחברות זו לזו. הרמזים קצרים, אבל כל אחד מהם נחוץ — אין כאן רמז מיותר.',
    body: ['בתשבץ קשה רוב העבודה היא בחיבור בין הטבלאות: ברגע שיש ✓ בין שני פריטים, כל מה שידוע על אחד מהם נכון גם לשני. רמזים כמו "גרים בבתים צמודים" או "ההפרש ביניהם שנה אחת" מצמצמים כל אחד לשתי אפשרויות.', 'לפעמים צריך צעד מתקדם: מניחים שתא מסוים הוא ✓, ממשיכים להסיק — ומגיעים לסתירה. אז ברור שהתא הוא ✗. גם צעד כזה מופיע בהסבר של כפתור הרמז.', 'רוצים משהו קצת יותר רגוע? יש כאן גם רמה בינונית (4×4).'],
    faq: [{ q: 'כמה זמן לוקח לפתור תשבץ קשה?', a: 'בין 10 ל־30 דקות לרוב הפותרים. הכי חשוב לעבוד בסדר: קודם רמזים ישירים, אחר כך חיבורים בין טבלאות, ורק בסוף רמזי הסדר.' }, { q: 'האם התשבצים הקשים פתירים בלי ניחוש?', a: 'כן. כל תשבץ נבדק על ידי פותר ממוחשב שעובד בהיגיון, צעד אחר צעד, ובתשבץ קשה נדרשות לכל היותר שתי הנחות שמובילות לסתירה.' }, { q: 'מה זה "אבל לא גם וגם"?', a: 'ברמז "או… או…" בדיוק אחד משני החלקים נכון. למשל: "נועה אכלה פיצה, או שהיא הגיעה ב־12:30 (אבל לא גם וגם)" — לכן מי שאכל פיצה לא הגיע ב־12:30.' }],
    related: [{ label: 'פתרון תשבץ היגיון', href: '/logic-puzzles/solutions' }, { label: 'סודוקו אונליין', href: '/online-games/sudoku' }, { label: 'בעיות היגיון למחוננים', href: '/learn/gifted-test/logic-problems' }],
  },
}

export function LogicLevelPage({ variant }) {
  const s = SPOKES[variant]
  return <Page>
    <SEO title={s.title} description={s.desc} path={s.path} structuredData={faqSchema(s.faq)} />
    <Breadcrumbs items={crumbs(s.crumb)} />
    <Hero badge={s.badge} emoji={s.emoji} h1={s.h1}>{s.intro}</Hero>
    <Player levels={s.levels} firstSeed={{ kids: 7001, easy: 7002, hard: 7003 }[variant]} />
    <MoreLinks skip={s.path} />
    <div className="mt-10"><SeoBody paragraphs={s.body} faq={s.faq} related={[{ label: 'תשבצי היגיון', href: HUB }, ...s.related]} /></div>
  </Page>
}

// ---- Print -------------------------------------------------------------------------------------
const PRINT_FAQ = [
  { q: 'מה מקבלים בדף ההדפסה?', a: 'בכל דף: הסיפור, הרמזים, הטבלאות לסימון ✓ ו־✗ וטבלת תשובות. מסמנים "להדפיס גם פתרונות" ואחרי כל תשבץ יודפס דף פתרון עם הטבלאות המלאות.' },
  { q: 'אפשר להדפיס תשבץ שעוד לא היה?', a: 'כן. הכפתור "תשבץ חדש" בונה תשבץ חדש ברמה שבחרתם — עם פתרון אחד בדיוק — ואפשר להדפיס כמה שרוצים.' },
  { q: 'איזו רמה להדפיס לכיתה?', a: 'לכיתות ב׳–ג׳ — לילדים (3×3). לכיתות ד׳–ה׳ — קל. מכיתה ו׳ — בינוני, ולחטיבה ולמבוגרים — קשה.' },
  { q: 'אפשר לשמור כ־PDF?', a: 'כן, בחלון התצוגה לפני ההדפסה יש כפתור "הורדה כ־PDF".' },
]
const READY = 6
const readySeed = (level, k) => 9100 + LEVEL_IDS.indexOf(level) * 100 + k * 13

export function LogicPrintPage() {
  const [level, setLevel] = useState('easy')
  const [extra, setExtra] = useState([])
  const [printing, setPrinting] = useState(null)
  const [withSolutions, setWithSolutions] = useState(true)
  const ready = useMemo(() => Array.from({ length: READY }, (_, k) => generatePuzzle(readySeed(level, k), level, THEMES[k % THEMES.length].id)), [level])
  const fresh = useMemo(() => extra.map(seed => generatePuzzle(seed, level)), [extra, level])
  const all = [...fresh, ...ready]
  const pick = l => { setLevel(l); setExtra([]) }
  const name = p => `תשבץ היגיון: ${p.theme.title}`
  return <Page>
    <SEO title="תשבצי היגיון להדפסה — עם דפי פתרון, 4 רמות" description="תשבצי היגיון להדפסה בחינם: דף לכל תשבץ עם רמזים, טבלאות וטבלת תשובות, ודף פתרון לכל אחד. 4 רמות — מתשבץ לילדים ועד 4×5 — ותשבץ חדש בכל לחיצה." path="/logic-puzzles/print" structuredData={faqSchema(PRINT_FAQ)} />
    <Breadcrumbs items={crumbs('להדפסה')} />
    <Hero badge="דף פתרון לכל תשבץ · A4 · PDF" emoji="🖨️" h1="תשבצי היגיון להדפסה">
      תשבצי היגיון להדפסה, מוכנים לכיתה, לבית ולנסיעה: בוחרים רמה, מדפיסים, ופותרים עם עיפרון. לכל תשבץ יש פתרון אחד בלבד — ודף פתרון למורה או להורה.
    </Hero>
    <nav aria-label="רמת קושי" className="no-print mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">{LEVEL_IDS.map(l =>
      <button key={l} type="button" aria-pressed={level === l} onClick={() => pick(l)} className={`min-h-[64px] rounded-2xl border-2 p-2 font-bold ${level === l ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white'}`}>
        {LEVELS[l].label} <span className="font-normal">{LEVELS[l].size}</span><small className="block font-normal">{LEVELS[l].age}</small>
      </button>)}</nav>
    <div className="no-print mt-5 flex flex-wrap items-center justify-center gap-3">
      <button type="button" onClick={() => setPrinting(all)} className="min-h-[52px] rounded-xl bg-red-500 px-6 py-3 text-lg font-bold text-white">🖨️ הדפסת כל {all.length} התשבצים</button>
      <button type="button" onClick={() => setExtra(e => [newSeed(), ...e])} className="min-h-[52px] rounded-xl bg-violet-600 px-6 py-3 text-lg font-bold text-white">✨ תשבץ חדש</button>
      <label className="flex min-h-[44px] items-center gap-2 font-bold"><input type="checkbox" checked={withSolutions} onChange={e => setWithSolutions(e.target.checked)} className="h-5 w-5" />להדפיס גם פתרונות</label>
    </div>
    <section className="no-print mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{all.map((p, i) =>
      <article key={`${level}-${p.seed}`} className="flex flex-col rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black"><span aria-hidden="true">{p.theme.emoji} </span>{p.theme.title}{i < fresh.length ? ' ✨' : ''}</h2>
        <p className="text-sm text-violet-700">{levelLine(p)}</p>
        <ol className="mt-2 flex-1 list-decimal ps-5 text-sm text-slate-700">{p.clues.slice(0, 3).map((c, k) => <li key={k}>{c.text}</li>)}{p.clues.length > 3 && <li className="list-none text-slate-400">…ועוד {p.clues.length - 3} רמזים</li>}</ol>
        <button type="button" onClick={() => setPrinting([p])} className="mt-3 min-h-[44px] rounded-xl bg-violet-100 px-3 py-2 font-bold">🖨️ הדפסה</button>
      </article>)}</section>
    {printing && <PrintPreview title={printing.length === 1 ? name(printing[0]) : `תשבצי היגיון — ${LEVELS[level].label}`} onClose={() => setPrinting(null)}>
      {printing.flatMap((p, i) => [<PuzzleSheet key={`p${i}`} puz={p} title={name(p)} />, ...(withSolutions ? [<PuzzleSheet key={`s${i}`} puz={p} title={name(p)} solution />] : [])])}
    </PrintPreview>}
    <MoreLinks skip="/logic-puzzles/print" />
    <div className="mt-10"><SeoBody paragraphs={[
      'כל דף הדפסה כולל את הסיפור, הרמזים ממוספרים, את כל הטבלאות לסימון וטבלת תשובות למילוי בסוף. בתשבצים לילדים ובקלים הטבלאות גדולות יותר, כדי שיהיה נוח לכתוב בהן.',
      'למורים: אפשר להדפיס את אותו תשבץ לכל הכיתה ולפתור יחד על הלוח, או לתת לכל קבוצה רמה אחרת. דפי הפתרון מודפסים אחרי כל תשבץ, כך שקל להפריד אותם מראש.',
      'מעדיפים מסך? את אותם תשבצים אפשר לפתור אונליין, עם כפתור רמז שמסביר את הצעד הבא.',
    ]} faq={PRINT_FAQ} related={[{ label: 'תשבצי היגיון', href: HUB }, { label: 'מבוכים להדפסה', href: '/printables/mazes' }, { label: 'סודוקו להדפסה', href: '/printables/sudoku' }, { label: 'חידות היגיון', href: '/riddles/logic' }]} /></div>
  </Page>
}

// ---- How to solve ------------------------------------------------------------------------------
const SOLVE_FAQ = [
  { q: 'איפה רואים את הפתרון של תשבץ?', a: 'בכל תשבץ באתר יש כפתור "פתרון": הוא ממלא את הטבלאות, מציג את טבלת התשובות ומסביר שלב אחר שלב איך מגיעים אליהן. בתשבצים להדפסה יש דף פתרון לכל תשבץ.' },
  { q: 'מה עושים כשנתקעים באמצע?', a: 'עוברים שוב על הרמזים — במיוחד על רמזי "לפני/אחרי" ו"או/או", שאפשר להפיק מהם יותר מסימון אחד. אחר כך מחפשים ✓ בטבלה אחת ומעבירים את המידע לטבלאות האחרות. ואם עדיין תקועים — כפתור "רמז" מסביר את הצעד הבא.' },
  { q: 'מותר לנחש?', a: 'עדיף שלא. בתשבצים קשים יש צעד מתקדם שנראה כמו ניחוש — "נניח ש… ונראה מה קורה" — אבל הוא הוכחה: אם ההנחה מובילה לסתירה, היא לא נכונה.' },
  { q: 'למה כל רמז חשוב?', a: 'כי בתשבצים כאן אין רמזים מיותרים: המחשב מוחק כל רמז שאפשר לוותר עליו. אם סיימתם ונשאר רמז שלא השתמשתם בו — כדאי לבדוק שוב.' },
]
const TECHNIQUES = [
  ['1. רמזים ישירים', 'רמז כמו "דנה מגדלת את החתול" הוא ✓ מיידי, ו"יואב לא בן 8" הוא ✗ מיידי. מתחילים מהם.'],
  ['2. ✓ אחד בכל שורה ובכל עמודה', 'לכל ילד יש בדיוק חיה אחת. ברגע שיש ✓, כל השורה והעמודה מקבלות ✗. וכשבשורה נשאר תא ריק אחד — הוא ה־✓.'],
  ['3. חיבור בין טבלאות', 'אם דנה מגדלת את החתול, כל מה שידוע על החתול נכון גם לדנה: אם מי שמגדל את החתול לא בן 9 — גם דנה לא בת 9.'],
  ['4. רמזי סדר', '"נועם צעיר ממאיה" אומר שנועם לא הכי מבוגר ומאיה לא הכי צעירה. "מיד אחרי" ו"צמודים" מצמצמים עוד יותר. וגם: נועם ומאיה הם שני ילדים שונים.'],
  ['5. או… או…', '"שירה אכלה פיצה, או שהיא הגיעה ב־12:30 (אבל לא גם וגם)" — כשמתברר שאחד החלקים לא נכון, השני בטוח נכון.'],
  ['6. הנחה וסתירה', 'בתשבצים קשים: מניחים ✓ בתא מסוים וממשיכים להסיק. אם מגיעים למצב בלתי אפשרי (למשל שורה בלי אף תא פנוי), התא הוא ✗.'],
]

export function LogicSolutionsPage() {
  const example = useMemo(() => generatePuzzle(4242, 'easy', 'pets'), [])
  return <Page>
    <SEO title="פתרון תשבץ היגיון — איך פותרים, שלב אחר שלב" description="פתרון תשבץ היגיון: השיטה המלאה — ✓ ו־✗, חיבור בין טבלאות, רמזי סדר ו״או/או״ — ודוגמה פתורה שלב אחר שלב. ולכל תשבץ באתר יש כפתור פתרון עם הסבר." path="/logic-puzzles/solutions" structuredData={faqSchema(SOLVE_FAQ)} />
    <Breadcrumbs items={crumbs('איך פותרים')} />
    <Hero badge="שיטה + דוגמה פתורה" emoji="🔎" h1="פתרון תשבץ היגיון — שלב אחר שלב">
      מחפשים פתרון תשבץ היגיון? כאן תמצאו את השיטה שבעזרתה פותרים כל תשבץ היגיון, דוגמה מלאה שפתורה צעד אחר צעד — ואת הדרך לראות פתרון מוסבר לכל תשבץ באתר.
    </Hero>
    <section className="mx-auto mt-8 max-w-3xl">
      <h2 className="text-2xl font-black">השיטה: שש דרכי הסקה</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{TECHNIQUES.map(([t, d]) => <div key={t} className="rounded-2xl border-2 border-slate-200 bg-white p-4"><h3 className="font-black">{t}</h3><p className="mt-1 leading-relaxed text-slate-700">{d}</p></div>)}</div>
    </section>
    <section className="mt-10">
      <h2 className="text-center text-2xl font-black">דוגמה: נסו קודם לבד</h2>
      <p className="mx-auto mt-1 max-w-2xl text-center text-slate-600">זה תשבץ קל עם {example.clues.length} רמזים. פתרו אותו על הלוח — ואז השוו לפתרון המלא שמתחת.</p>
      <div className="mt-4"><LogicBoard puz={example} /></div>
    </section>
    <section className="mx-auto mt-10 max-w-3xl rounded-3xl bg-white p-5">
      <h2 className="text-2xl font-black">הפתרון המלא, צעד אחר צעד</h2>
      <p className="mt-1 text-slate-600">כך פותרים את הדוגמה. השלבים שבהם רק מסמנים ✗ בשאר השורה אחרי ✓ לא נכתבו — את זה הלוח עושה לבד.</p>
      <div className="mt-4"><SolutionSteps puz={example} /></div>
      <h3 className="mt-6 text-xl font-black">התשובה</h3>
      <div className="mt-2 overflow-x-auto"><AnswerTable puz={example} /></div>
    </section>
    <MoreLinks skip="/logic-puzzles/solutions" />
    <div className="mt-10"><SeoBody paragraphs={[
      'הסוד בפתרון תשבץ היגיון הוא סדר. עוברים על כל הרמזים פעם אחת ומסמנים את מה שהם אומרים במפורש. אחר כך משתמשים בכלל החשוב ביותר — ✓ אחד בכל שורה ובכל עמודה — ומחברים בין הטבלאות. רק אז חוזרים לרמזי הסדר ול"או/או", שבדרך כלל פותחים את התשבץ עד הסוף.',
      'בכל תשבץ באתר, הכפתור "רמז" לא מגלה סתם תא — הוא כותב איזה רמז או איזה כלל מוביל לצעד הבא. כך לומדים את השיטה תוך כדי משחק. והכפתור "פתרון" מציג את כל הדרך, כמו בדוגמה שלמעלה.',
    ]} faq={SOLVE_FAQ} related={[{ label: 'תשבצי היגיון', href: HUB }, { label: 'תשבצי היגיון קלים', href: '/logic-puzzles/easy' }, { label: 'חידות היגיון', href: '/riddles/logic' }]} /></div>
  </Page>
}
