import { useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Cube3D from '../../components/cube/Cube3D'
import CubeDemo from '../../components/cube/CubeDemo'
import { solved, apply, invert, scramble, isSolved } from '../../utils/cube'

// Beginner's (layer-by-layer) method. Every algorithm and every claim below is
// verified in tests/cube-algorithms.test.mjs, and every demo runs on the same model.
const RIGHT = "U R U' R' U' F' U F", LEFT = "U' L' U L U F U' F'"
const FRU = "F R U R' U' F'", EDGES = "R U R' U R U2 R' U", CORNERS = "U R U' L' U R' U' L", TWIST = "R' D' R D"
const TWIST_DEMO = `${TWIST} ${TWIST} U ${TWIST} ${TWIST} ${TWIST} ${TWIST} U'`

const NOTATION = [
  ['R', 'הצד הימני', 'מסובבים את הצד הימני כלפי מעלה'],
  ['L', 'הצד השמאלי', 'מסובבים את הצד השמאלי כלפי מטה'],
  ['U', 'השכבה העליונה', 'מסובבים את השכבה העליונה שמאלה'],
  ['D', 'השכבה התחתונה', 'מסובבים את השכבה התחתונה ימינה'],
  ['F', 'הפאה הקדמית', 'מסובבים את הפאה שמולכם עם כיוון השעון'],
  ['B', 'הפאה האחורית', 'מסובבים את הפאה האחורית (מהצד שלה — עם כיוון השעון)'],
]

const STEPS = [
  {
    n: 1, title: 'הצלב הלבן', alg: null,
    text: ['מחזיקים את הקובייה כך שהמרכז הלבן למטה (לאורך כל הפתרון הלבן נשאר למטה והצהוב למעלה).', 'מוצאים בשכבה העליונה צלע (חלק עם 2 צבעים) שיש בה לבן. מסובבים את השכבה העליונה עד שהצבע השני של הצלע נמצא מעל המרכז בצבע שלו — ואז מסובבים את הפאה הזאת פעמיים (למשל F2), והצלע יורדת למקומה.', 'אם הלבן של הצלע פונה הצידה או שהיא תקועה באמצע — מוציאים אותה לשכבה העליונה בסיבוב אחד של הצד שלה, ומנסים שוב. חוזרים עד שיש צלב לבן למטה, וכל צלע מתאימה גם למרכז שבצד שלה.'],
    demo: { setup: 'F2', alg: 'F2', title: 'צלע לבנה למעלה → F2' },
  },
  {
    n: 2, title: 'הפינות הלבנות', alg: "R U R' U'",
    text: ['מוצאים בשכבה העליונה פינה (חלק עם 3 צבעים) שיש בה לבן. מסובבים את השכבה העליונה עד שהפינה נמצאת בדיוק מעל המקום שלה — בין שני המרכזים בצבעים שלה.', 'מחזיקים את הקובייה כך שהפינה בצד ימין־קדימה־למעלה, וחוזרים על R U R\' U\' שוב ושוב — פעם, 3 או 5 פעמים — עד שהפינה יורדת למקומה והלבן שלה למטה. שאר השכבה הלבנה לא נהרסת בזמן הזה.', 'אם פינה לבנה נמצאת למטה אבל במקום הלא נכון או הפוכה — מחזיקים אותה ימין־קדימה־למטה ועושים R U R\' U\' פעם אחת; היא עולה למעלה, וממשיכים כרגיל.'],
    demo: { setup: "U R U' R' U R U' R' U R U' R'", alg: "R U R' U' R U R' U' R U R' U'", title: '3 פעמים R U R\' U\'' },
  },
  {
    n: 3, title: 'השכבה האמצעית', alg: RIGHT, alg2: LEFT,
    text: ['מוצאים בשכבה העליונה צלע בלי צהוב. מסובבים את השכבה העליונה עד שהצבע הקדמי שלה מתאים למרכז הקדמי (נוצרת צורת T).', 'אם הצבע העליון של הצלע מתאים למרכז הימני — עושים את האלגוריתם "ימינה". אם הוא מתאים למרכז השמאלי — את האלגוריתם "שמאלה".', 'צלע שתקועה בשכבה האמצעית במקום הלא נכון או הפוכה: מחזיקים אותה קדימה־ימין ועושים את "ימינה" פעם אחת — היא יוצאת למעלה, ואז מכניסים אותה כרגיל.'],
    demos: [{ setup: invert(RIGHT), alg: RIGHT, title: 'ימינה' }, { setup: invert(LEFT), alg: LEFT, title: 'שמאלה' }],
  },
  {
    n: 4, title: 'הצלב הצהוב', alg: FRU,
    text: ['מסתכלים על הפאה הצהובה למעלה. יש 3 מצבים: נקודה (רק המרכז צהוב), צורת L, או קו.', 'L: מחזיקים אותו כך שהזרועות שלו פונות אחורה ושמאלה. קו: מחזיקים אותו לרוחב (משמאל לימין). נקודה: מחזיקים איך שרוצים.', 'עושים F R U R\' U\' F\' וחוזרים על הבדיקה. נקודה הופכת ל־L, ‏L הופך לקו, וקו הופך לצלב. מה שקורה לפינות בשלב הזה לא משנה.'],
    demo: { setup: invert(FRU), alg: FRU, title: FRU },
  },
  {
    n: 5, title: 'לסדר את הצלעות הצהובות', alg: EDGES,
    text: ['מסובבים את השכבה העליונה עד שלפחות 2 צלעות מתאימות למרכזים שבצד שלהן.', 'אם שתי הצלעות הנכונות צמודות — מחזיקים את הקובייה כך שהן מאחור ומימין, ועושים את האלגוריתם: הוא מחליף בין הצלע הקדמית לשמאלית, ומשאיר את האחורית והימנית במקום.', 'אם שתי הצלעות הנכונות מול זו — עושים את האלגוריתם פעם אחת מכל כיוון, ואז יהיו שתיים צמודות. חוזרים על השלב עד שכל 4 הצלעות מתאימות.'],
    demo: { setup: invert(EDGES), alg: EDGES, title: 'החלפת הצלע הקדמית והשמאלית' },
  },
  {
    n: 6, title: 'לשים את הפינות הצהובות במקום', alg: CORNERS,
    text: ['פינה "במקום" = שלושת הצבעים שלה מתאימים לשלושת המרכזים סביבה — גם אם היא עדיין מסובבת.', 'מוצאים פינה אחת שבמקום, מחזיקים אותה ימין־קדימה־למעלה ועושים U R U\' L\' U R\' U\' L. הפינה הזאת נשארת, ושלוש האחרות מתחלפות ביניהן במעגל. חוזרים עד שכל 4 הפינות במקום.', 'אם אף פינה לא במקום — עושים את האלגוריתם פעם אחת מכל כיוון, ואז תהיה לפחות אחת.'],
    demo: { setup: invert(CORNERS), alg: CORNERS, title: 'הפינה הקדמית־ימנית נשארת, 3 מתחלפות' },
  },
  {
    n: 7, title: 'לסובב את הפינות — וסיימנו', alg: TWIST,
    text: ['מחזיקים את הקובייה עם הצהוב למעלה, ופינה שלא מסודרת בימין־קדימה־למעלה.', 'חוזרים על R\' D\' R D עד שהצהוב של הפינה הזאת פונה למעלה (פעמיים או 4 פעמים). השכבות למטה ייראו מבולגנות — זה בסדר גמור, אל תעצרו!', 'עכשיו מסובבים רק את השכבה העליונה (U), בלי להזיז את הקובייה, עד שפינה לא מסודרת נוספת מגיעה לימין־קדימה־למעלה — וחוזרים על R\' D\' R D. אחרי הפינה האחרונה הכול חוזר למקום; מסובבים את השכבה העליונה עד שהקובייה פתורה. 🎉'],
    demo: { setup: invert(TWIST_DEMO), alg: TWIST_DEMO, title: 'שתי פינות: ×2, U, ×4, U\'' },
  },
]

const FAQ = [
  { q: 'איך פותרים קובייה הונגרית למתחילים?', a: 'בשיטת השכבות: צלב לבן, פינות לבנות, שכבה אמצעית, צלב צהוב, צלעות צהובות, מיקום הפינות הצהובות וסיבוב שלהן. בסך הכול 7 שלבים ו־6 אלגוריתמים קצרים — כולם בעמוד הזה עם הדגמה.' },
  { q: 'האלגוריתמים כאן באמת עובדים?', a: 'כן, וזה נבדק: כל אלגוריתם הורץ על סימולטור ממוחשב של הקובייה, כולל 400 קוביות אקראיות שנפתרו לפי שלבים 4–7 בדיוק כפי שהם כתובים כאן. גם ההדגמות בעמוד רצות על אותו סימולטור.' },
  { q: 'מה המשמעות של R, U ו־R\'?', a: 'כל אות היא פאה: R ימין, L שמאל, U למעלה, D למטה, F קדימה, B אחורה. אות לבד = רבע סיבוב עם כיוון השעון (כשמסתכלים ישר על אותה פאה). גרש (R\') = נגד כיוון השעון. הספרה 2 (U2) = חצי סיבוב.' },
  { q: 'כמה זמן לוקח ללמוד לפתור קובייה הונגרית?', a: 'רוב הילדים מגיל 8–9 ומבוגרים מצליחים לפתור את הקובייה הראשונה אחרי שעה־שעתיים של תרגול עם המדריך, ותוך כמה ימים כבר פותרים בלי להסתכל.' },
  { q: 'הקובייה שלי בצבעים אחרים — זה משנה?', a: 'לא. בוחרים צבע אחד שיהיה למטה (במדריך — לבן) ואת הצבע שמולו למעלה. אם בקובייה שלכם הצבעים מסודרים אחרת, פשוט מחליפים את שמות הצבעים — האלגוריתמים זהים.' },
]

const MOVE_BTNS = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'B', "B'"]

function Practice() {
  const [hist, setHist] = useState([])
  const [back, setBack] = useState(false)
  const state = useMemo(() => apply(solved(), hist.join(' ')), [hist])
  const done = hist.length > 0 && isSolved(state)
  return <section className="rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow" aria-labelledby="practice">
    <h2 id="practice" className="text-2xl font-bold mb-1">🧩 קובייה לתרגול</h2>
    <p className="mb-3 text-[var(--muted-foreground)]">לוחצים על מהלך ורואים מה הוא עושה. אפשר לערבב ולנסות לפתור לפי המדריך.</p>
    <div className="grid gap-4 md:grid-cols-[220px_1fr] items-center">
      <div className="mx-auto w-full max-w-[220px]"><Cube3D state={state} back={back} label="קובייה לתרגול" /></div>
      <div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 mb-3" dir="ltr">
          {MOVE_BTNS.map(m => <button key={m} type="button" onClick={() => setHist(h => [...h, m])} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white font-mono text-lg font-bold active:scale-95">{m}</button>)}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setHist(scramble(20).split(' '))} className="min-h-[44px] rounded-xl bg-pink-600 px-4 font-bold text-white">🎲 ערבוב</button>
          <button type="button" onClick={() => setHist(h => h.slice(0, -1))} disabled={!hist.length} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white px-3 font-bold disabled:opacity-40">↶ ביטול מהלך</button>
          <button type="button" onClick={() => setHist([])} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white px-3 font-bold">↺ קובייה פתורה</button>
          <button type="button" onClick={() => setBack(b => !b)} aria-pressed={back} className="min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-3 font-bold">🔄 {back ? 'צד קדמי' : 'הצד האחורי'}</button>
        </div>
        <p className="mt-2 min-h-[24px] font-bold text-green-700" aria-live="polite">{done ? '🎉 הקובייה פתורה!' : hist.length ? `${hist.length} מהלכים` : ''}</p>
      </div>
    </div>
  </section>
}

// Algorithms inside Hebrew sentences are isolated left-to-right, or the moves read backwards.
const ALG_IN_TEXT = /([RLUDFB](?:'|2)?(?: [RLUDFB](?:'|2)?)+|\b[RLUDFB](?:'|2)(?![A-Za-z]))/g
function Rich({ text }) {
  return text.split(ALG_IN_TEXT).map((part, i) => i % 2 ? <bdi key={i} dir="ltr" className="font-mono font-bold whitespace-nowrap">{part}</bdi> : part)
}

function AlgChip({ alg }) {
  return <code dir="ltr" className="inline-block rounded-lg border-2 border-slate-800 bg-yellow-100 px-2 py-1 font-mono text-lg font-bold">{alg}</code>
}

export default function RubiksCube() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="פתרון קובייה הונגרית למתחילים — שלב אחר שלב, עם הדגמה" description="איך פותרים קובייה הונגרית: מדריך למתחילים ב־7 שלבים עם אלגוריתמים שנבדקו במחשב, הדגמה חיה לכל שלב וקובייה לתרגול. בעברית, בחינם." path="/rubiks-cube" structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'פתרון קובייה הונגרית' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-3">🧊 פתרון קובייה הונגרית למתחילים</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-5">7 שלבים · 6 אלגוריתמים קצרים · הדגמה חיה לכל שלב</p>

      <div className="mx-auto mb-8 max-w-3xl rounded-2xl border-2 border-green-700 bg-green-50 p-4 text-center">
        <p className="font-bold text-green-800">✓ פתרון מוכח</p>
        <p className="text-green-900">כל אלגוריתם בעמוד נבדק על סימולטור ממוחשב של הקובייה: 94 בדיקות, כולל 400 קוביות אקראיות שנפתרו לפי השלבים האחרונים בדיוק כפי שהם כתובים כאן. גם ההדגמות מריצות את האלגוריתם באמת — לחצו ▶ ותראו.</p>
      </div>

      <section className="mb-10" aria-labelledby="notation">
        <h2 id="notation" className="text-3xl font-bold mb-2">איך קוראים אלגוריתם?</h2>
        <p className="mb-4">כל אות היא פאה של הקובייה. אות לבד = רבע סיבוב עם כיוון השעון, כשמסתכלים ישר על אותה פאה. אות עם גרש (למשל <AlgChip alg="R'" />) = נגד כיוון השעון. ספרה 2 (למשל <AlgChip alg="U2" />) = חצי סיבוב.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {NOTATION.map(([m, name, how]) => <div key={m} className="flex items-center gap-3 rounded-xl border-2 border-[var(--border)] bg-white p-3">
            <AlgChip alg={m} /><div><p className="font-bold">{name}</p><p className="text-sm text-[var(--muted-foreground)]">{how}</p></div>
          </div>)}
        </div>
      </section>

      {STEPS.map(st => <section key={st.n} className="mb-10 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-sm" aria-labelledby={`step${st.n}`}>
        <div className="grid gap-5 md:grid-cols-[1fr_260px] items-start">
          <div>
            <h2 id={`step${st.n}`} className="text-2xl sm:text-3xl font-bold mb-3"><span className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-300 border-2 border-slate-800">{st.n}</span>{st.title}</h2>
            {st.alg && <p className="mb-3 flex flex-wrap items-center gap-2"><span className="font-bold">{st.alg2 ? 'ימינה:' : 'האלגוריתם:'}</span><AlgChip alg={st.alg} />{st.alg2 && <><span className="font-bold">שמאלה:</span><AlgChip alg={st.alg2} /></>}</p>}
            {st.text.map((t, i) => <p key={i} className="mb-2 leading-relaxed"><Rich text={t} /></p>)}
          </div>
          <div className="space-y-3">
            {(st.demos || [st.demo]).map(d => <CubeDemo key={d.title} {...d} />)}
          </div>
        </div>
      </section>)}

      <div className="mb-10"><Practice /></div>

      <SeoBody
        paragraphs={[
          'הקובייה ההונגרית (קוביית רוביק) נראית בלתי אפשרית, אבל שיטת השכבות הופכת אותה לפשוטה: פותרים את הקובייה שכבה אחרי שכבה, מלמטה למעלה, ובכל שלב משתמשים באלגוריתם קצר אחד. זו השיטה שכמעט כולם מתחילים בה — ילדים ומבוגרים.',
          'טיפ: אל תנסו לזכור את כל המדריך בבת אחת. למדו שלב אחד, תרגלו אותו כמה פעמים על הקובייה, ורק אז עברו לשלב הבא. ההדגמות בעמוד מראות בדיוק איך הקובייה נראית לפני כל אלגוריתם ואחריו.',
          'קצת היסטוריה: את הקובייה המציא ב־1974 ארנו רוביק, מרצה לעיצוב ואדריכלות מבודפשט. לכן בישראל קוראים לה "קובייה הונגרית". יש לה יותר מ־43 קווינטיליון מצבים אפשריים, ובכל זאת הוכח במחשב שאפשר לפתור כל ערבוב ב־20 מהלכים או פחות. בשיטת המתחילים שכאן צריך הרבה יותר מהלכים, אבל לא צריך לזכור יותר משישה אלגוריתמים קצרים.',
        ]}
        faq={FAQ}
        related={[{ label: 'משחקי לוח נגד המחשב', href: '/board-games' }, { label: 'חידות היגיון', href: '/riddles/logic' }, { label: 'פאזל הזזה', href: '/online-games/sliding-puzzle' }, { label: 'סודוקו אונליין', href: '/online-games/sudoku' }, { label: 'קובייה וירטואלית', href: '/tools/dice' }]}
      />
    </div>
  )
}
