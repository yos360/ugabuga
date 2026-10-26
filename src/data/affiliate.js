// AliExpress affiliate picks ("קישורי שותפים"), shown by <AffiliatePicks /> on topic pages.
//
// Products are grouped by topic; each topic lists the path prefixes where its picks appear.
// A topic with no products renders nothing, so the box only shows up once real affiliate links
// (from AliExpress Portals) are filled in. Clicks are counted like sponsor clicks, under the id
// `ali-<topic>` (owner report → "לחיצות על באנרים", Google Analytics → `affiliate_click`).
//
// Product: { name (Hebrew, short), url (https affiliate link), image (https product photo) }.
// No prices: AliExpress prices change all the time.
import { NO_SPONSOR, matchesPlacement } from './sponsors.js'

export const AFFILIATE_LABEL = 'קישורי שותפים'
export const AFFILIATE_NOTE = 'אם תקנו דרך הקישורים, נקבל עמלה קטנה — בלי תוספת למחיר. זה עוזר לנו להשאיר את האתר בחינם.'

export const AFFILIATE_TOPICS = [
  { id: 'travel', title: '🧳 מה עוד עוזר בדרך', placements: ['/travel', '/family/car-games'], products: [
    { name: 'לוח ציור מגנטי עם עט', url: 'https://s.click.aliexpress.com/e/_c3MPpyw3', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sded981a0ba3e4726ba366ee9146b476bf.jpg' },
    { name: 'ספר מדבקות לשימוש חוזר', url: 'https://s.click.aliexpress.com/e/_c37KxNT1', image: 'https://ae-pic-a1.aliexpress-media.com/kf/See85f973b7ed435f914c6516b6a5eb4ba.jpg' },
    { name: 'חוברת ציור במים — בלי לכלוך', url: 'https://s.click.aliexpress.com/e/_c3TA05yL', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sae098156010845d296df5d89dc859ac8f.png' },
    { name: 'אוזניות לילדים עם הגבלת עוצמה', url: 'https://s.click.aliexpress.com/e/_c2yEPg2j', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sbdb976696ef04deba649556e4f4e85256.png' },
  ] },
  { id: 'party', title: '🎈 למסיבה', placements: ['/birthday', '/invitation', '/invitations', '/birthday-invitation', '/games/birthday', '/ideas', '/rsvp', '/party-album', '/birthday-cost', '/party-calculator'], products: [
    { name: 'סט בלוני יום הולדת עגולים 18 אינץ׳', url: 'https://s.click.aliexpress.com/e/_c32Qx1CT', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sdaa759c281c44671affc2364064ed428p.jpg' },
    { name: 'סט 40 בלונים כחולים וקונפטי', url: 'https://s.click.aliexpress.com/e/_c3sqbrk7', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sd3a702a8e3b54c69a81453944f4b9507G.jpg' },
    { name: 'בלוני אותיות ליום הולדת', url: 'https://s.click.aliexpress.com/e/_c3AZp4gR', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sad48fa2e036043e68b85cef67649c678P.jpg' },
    { name: 'כובעי מסיבה וחצוצרות', url: 'https://s.click.aliexpress.com/e/_c3CcQ1d9', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S2b8491fea2984e6eabfdf4df7e84db63M.jpg' },
    { name: 'שקיות הפתעה לציור עם טושים', url: 'https://s.click.aliexpress.com/e/_c3DdofBt', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Seb68d18a76b34e5d96efa2d66aaf4471D.jpeg' },
  ] },
  { id: 'crafts', title: '🖍️ ליצירה ולצביעה', placements: ['/printables/coloring', '/crafts', '/origami', '/printables/symmetry', '/create', '/drawing-prompt', '/printables/color-by-number', '/printables/color-by-letter', '/printables/color-by-answer', '/printables/mandalas', '/printables/name-coloring'], products: [
    { name: 'ערכת אוריגמי עם חוברת הדרכה', url: 'https://s.click.aliexpress.com/e/_c4E7FVVz', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sa2cb5fa9b62a4e60920bcf1ff5f09030s.jpg' },
    { name: 'ערכת מטוסי נייר לילדים', url: 'https://s.click.aliexpress.com/e/_c3ih6drv', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S6d506d6b38b6484ea1cc965923df0c13r.jpg' },
    { name: 'טושי צבעי מים דו־צדדיים', url: 'https://s.click.aliexpress.com/e/_c4K5c0fV', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sbda302f244b84105b3fa4e37c6d0061fR.png' },
    { name: 'צבעים שלא מלכלכים את הידיים', url: 'https://s.click.aliexpress.com/e/_c3PAphWB', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S215960e2a2494346823cb56abcb1ea0ak.jpg' },
    { name: 'סט חימר קל מתייבש באוויר', url: 'https://s.click.aliexpress.com/e/_c43FvgGr', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S6fcc3ffc61a7444fafa35881eea2bf88q.jpg' },
    { name: 'מדבקות תלת־ממד לילדים', url: 'https://s.click.aliexpress.com/e/_c4rnA8vt', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Haadbb5c8fa4a46ec82dc5457c0096e6bi.jpg' },
  ] },
  { id: 'speech', title: '🗣️ לתרגול בבית', placements: ['/speech'], products: [
    { name: 'כרטיסיות מדברות', url: 'https://s.click.aliexpress.com/e/_c3Oug8AT', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sc3b30353cfd146359da76d22f48ef0e9a.jpg' },
    { name: 'שעון חול צבעוני', url: 'https://s.click.aliexpress.com/e/_c38PpM5D', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sda6158d13f964f9ca72974e5434e5762a.jpg' },
    { name: 'לוח חושי — משחק התאמה', url: 'https://s.click.aliexpress.com/e/_c4ehw9Y3', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S2cbeb8ea6f064f1ab9bb814f21f2085bz.jpg' },
  ] },
  { id: 'school', title: '✏️ לבית הספר ולכיתה א׳', placements: ['/letters', '/abc', '/words', '/english', '/typing', '/classroom/first-grade', '/learn/reading', '/crossword', '/word-search', '/word-search-maker', '/dictionary', '/printables/hebrew-letters', '/printables/english-letters', '/printables/letter-flashcards', '/printables/kindergarten-worksheets', '/printables/lined-paper', '/printables/reading-writing-words', '/printables/letter-strip', '/printables/english-lines'], products: [
    { name: 'תפסני עיפרון לאחיזה נכונה', url: 'https://s.click.aliexpress.com/e/_c44ggtdV', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sff8c936a46e2498b80ecf17abd33a810j.jpg' },
    { name: 'קלמר גדול עם שתי קומות', url: 'https://s.click.aliexpress.com/e/_c2u22w6L', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S0773f9a1c1e14ee4ae21b24ba583d924f.jpg' },
    { name: 'עטים מחיקים עם מילויים', url: 'https://s.click.aliexpress.com/e/_c2vBhR1z', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S08d2e83587b1420b9b1e0aa42aca4049k.jpg' },
  ] },
  { id: 'math', title: '🔢 לתרגול חשבון', placements: ['/math', '/learn/times-tables', '/sudoku', '/printables/math-worksheets', '/printables/multiplication-strips', '/printables/fractions-worksheets', '/printables/clock-worksheets', '/printables/math-paths', '/printables/math-order-puzzles'], products: [
    { name: 'חשבונייה מעץ', url: 'https://s.click.aliexpress.com/e/_c4PQWWzp', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sdfbc9aedace84c1b86e982a2d5fcfd8fN.png' },
    { name: 'מקלות ספירה בקופסה', url: 'https://s.click.aliexpress.com/e/_c3sXdD3v', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S4d572063bcaf464d82da24e74ff9d883n.jpg' },
    { name: 'משחק לוח הכפל', url: 'https://s.click.aliexpress.com/e/_c4MBXalt', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S9dc24b734ad544fa9f92663d87a479acB.jpg' },
    { name: 'צפרדע שיווי משקל — משחק חשבון', url: 'https://s.click.aliexpress.com/e/_c4n2ra35', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S0099745754d34b04af030b99466072fay.jpg' },
  ] },
  { id: 'music', title: '🎹 לנגינה בבית', placements: ['/music', '/printables/music-paper', '/birthday-songs'], products: [
    { name: 'אורגנית לילדים עם מיקרופון', url: 'https://s.click.aliexpress.com/e/_c4sqlrfD', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sb12e6dd518634abab69f3d0b3b328a441.jpg' },
    { name: 'קלימבה — פסנתר אגודלים', url: 'https://s.click.aliexpress.com/e/_c4KEKF2X', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S31dbcf13c47c49a08fda9793852b0980C.jpg' },
    { name: 'סט כלי נגינה לפעוטות', url: 'https://s.click.aliexpress.com/e/_c2QRF6dD', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sfe809ef66869455ea0caa746b0f4d684V.png' },
    { name: 'סט רעשנים מוזיקלי לתינוקות', url: 'https://s.click.aliexpress.com/e/_c4Bc2S3l', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S5c9510e5299b42b39a67ff7fa5ad06d7n.jpg' },
  ] },
  { id: 'boardgames', title: '♟️ משחקי קופסה לבית', placements: ['/board-games', '/chess', '/card-games', '/dice-games', '/printables/dominoes', '/printables/memory-game', '/family'], products: [
    { name: 'סט שחמט מעץ מתקפל ומגנטי', url: 'https://s.click.aliexpress.com/e/_c363qPlN', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S7b1b65c0b4f54f049a69380327e594e7i.jpg' },
    { name: 'שחמט, דמקה ושש־בש — סט 3 ב-1', url: 'https://s.click.aliexpress.com/e/_c3pcf1k7', image: 'https://ae-pic-a1.aliexpress-media.com/kf/H705be8b1e00e4684a516bd4bb4852d91J.jpg' },
    { name: 'רכבת דומינו אוטומטית', url: 'https://s.click.aliexpress.com/e/_c4rcJgR5', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S1a322c095dab40578dedbad29e6a61e4V.jpg' },
    { name: '120 אבני דומינו צבעוניות', url: 'https://s.click.aliexpress.com/e/_c3p5W3N9', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S32625177ee1e4082938afa8a95dbfb13r.jpg' },
  ] },
  { id: 'bedtime', title: '🌙 לשעת סיפור ושינה', placements: ['/stories', '/movies-for-kids'], products: [
    { name: 'מקרן כוכבים לחדר ילדים', url: 'https://s.click.aliexpress.com/e/_c2v8OkPN', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S4d8086c670d248dfaec308eea23414fee.jpg' },
    { name: 'מנורת לילה רכה מסיליקון', url: 'https://s.click.aliexpress.com/e/_c3sEB2yB', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S3b763535fdc84957a3edaf67786e4268J.png' },
    { name: 'מנורת לילה אקסולוטל מחליפת צבעים', url: 'https://s.click.aliexpress.com/e/_c3a5p2hp', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sdfd34521b5c44a939f4a761ffb7309a6v.jpg' },
  ] },
  { id: 'purim', title: '🎭 לפורים ולהתחפשות', placements: ['/purim', '/printables/coloring/purim-masks'], products: [
    { name: 'פלטת צבעי פנים לילדים', url: 'https://s.click.aliexpress.com/e/_c4UBWfuj', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S993d180dc03f4d3ea25956285acfa818W.jpg' },
    { name: 'צבע פנים מקצועי על בסיס מים', url: 'https://s.click.aliexpress.com/e/_c3XVZcl1', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S0c788a07d5ca42c7b0f979f9fbd767a2a.jpg' },
    { name: 'גלימת גיבור־על דו־צדדית עם מסכה', url: 'https://s.click.aliexpress.com/e/_c43g0Fbv', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S3bbe812bcbba4d8f8e1da57ed7ef04f5S.jpg' },
  ] },
  { id: 'toddlers', title: '🧸 לפעוטות', placements: ['/toddlers', '/baby-names', '/printables/fine-motor'], products: [
    { name: 'כוסות השחלה בקשת צבעים', url: 'https://s.click.aliexpress.com/e/_c3To3stD', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sf2d9492f80ce44b6b4547449b78509aff.jpg' },
    { name: 'קוביית עיסוק מונטסורי', url: 'https://s.click.aliexpress.com/e/_c30vSqhD', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sccd37e3bab7b4604943ff46f780157fbk.jpg' },
    { name: 'מראת רצפה לתינוק — זמן בטן', url: 'https://s.click.aliexpress.com/e/_c3Qc9OCX', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S06150684f6f848cbbc901a77641e2c99k.jpg' },
  ] },
  { id: 'baking', title: '🧁 לאפייה עם ילדים', placements: ['/cakes', '/recipes', '/food'], products: [
    { name: 'סט קישוט עוגות 80 חלקים עם צלחת מסתובבת', url: 'https://s.click.aliexpress.com/e/_c35YUhrZ', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sd63ccba4f35e4d2a8fce369a1f83743aV.jpg' },
    { name: 'סט 12 קורצני עוגיות מנירוסטה', url: 'https://s.click.aliexpress.com/e/_c4SPkCv1', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S454c6c46964c4b5d90963bdee044c996e.png' },
    { name: 'סינר שף לילדים', url: 'https://s.click.aliexpress.com/e/_c3W9hlML', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sf32fa2f0369f4261ba2fac42c9e47e2aL.jpg' },
    { name: 'סט טופרים Happy Birthday לעוגה', url: 'https://s.click.aliexpress.com/e/_c4L6xvRp', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S7983011399924426b88c81c7f61b1032D.jpg' },
  ] },
  { id: 'adventure', title: '🗺️ לציד אוצר ומשחקי בריחה', placements: ['/treasure-hunt', '/scavenger-hunt', '/escape-room', '/escape-rooms', '/secret-friend'], products: [
    { name: 'זוג מכשירי קשר לילדים', url: 'https://s.click.aliexpress.com/e/_c309Kxub', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S154c28ab622b46068f5928359824c556O.jpg' },
    { name: 'עטי דיו נעלם עם פנס UV', url: 'https://s.click.aliexpress.com/e/_c4Puo2Oj', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S75ae324ce095491f88b01947572263eau.jpg' },
    { name: 'מטבעות זהב של פיראטים', url: 'https://s.click.aliexpress.com/e/_c4aoYYgR', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S91b43f0d8acd4560bf9fa53c0ae64e20t.jpg' },
    { name: 'תיבת אוצר מעץ', url: 'https://s.click.aliexpress.com/e/_c43T3XG3', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S75664f98fe5d4067af460069699ea017t.jpg' },
  ] },
  { id: 'mitzvah', title: '✡️ לבר ולבת מצווה', placements: ['/bar-mitzvah', '/bat-mitzvah'], products: [
    { name: 'שרשרת מגן דוד', url: 'https://s.click.aliexpress.com/e/_c3AWQwT9', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S21c3eaddf3d542098368615d880498e1i.jpg' },
    { name: 'אלבום ברכות ותמונות לאירוע', url: 'https://s.click.aliexpress.com/e/_c3zMHQ7d', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sb31c580bbcd94af882559243ae78ccb6i.jpg' },
    { name: 'סט בלוני Happy Birthday עגולים', url: 'https://s.click.aliexpress.com/e/_c32Qx1CT', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sdaa759c281c44671affc2364064ed428p.jpg' },
  ] },
  { id: 'tubishvat', title: '🌳 לטו בשבט ושתילה', placements: ['/tu-bishvat'], products: [
    { name: 'עציצי שתילה שקופים לילדים', url: 'https://s.click.aliexpress.com/e/_c3knqxuT', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S21a9454003cc4eabb3a6610b2f6daef8X.jpg' },
    { name: 'סט כלי גינון קטנים', url: 'https://s.click.aliexpress.com/e/_c31EarEX', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sc5af9a83737640eab97f3689e2a1b21av.jpg' },
    { name: 'בונסאי מלאכותי בעציץ', url: 'https://s.click.aliexpress.com/e/_c3PUSwCJ', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S2dd262d196de4accb238b3a7214aa11bw.jpg' },
  ] },
  { id: 'chores', title: '🏠 לתורנויות ולסדר בבית', placements: ['/printables/chore-chart', '/printables/home-charts'], products: [
    { name: 'לוח מטלות יומי לילדים', url: 'https://s.click.aliexpress.com/e/_c33JGtp9', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S5fee1fa4d76c403cae3df310e18130adl.jpg' },
    { name: 'לוח מגנטי מחיק למקרר', url: 'https://s.click.aliexpress.com/e/_c3GeCQVp', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S689fa8b7c78b414aa8517d6c36298f78c.jpg' },
    { name: '60 כרטיסי סדר יום ויזואליים', url: 'https://s.click.aliexpress.com/e/_c2JLEjPh', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S2eb2a34438d841099ee14802de54ae20B.jpg' },
    { name: 'גליל מדבקות עידוד', url: 'https://s.click.aliexpress.com/e/_c4eO9SJ5', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Scf91aa54c3ec4df4901b1ccaa7dfc928F.jpg' },
  ] },
  { id: 'logic', title: '🧩 למשחקי חשיבה', placements: ['/logic-puzzles', '/rubiks-cube'], products: [
    { name: 'סט 8 חידות מתכת', url: 'https://s.click.aliexpress.com/e/_c34D5oYB', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sc0cc52c0924e4d198dfe495df22bee27R.jpg' },
    { name: 'קובייה הונגרית מהירה 3x3', url: 'https://s.click.aliexpress.com/e/_c2zYQcbV', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S928804116a824a9ab82e88d92f340b32c.jpg' },
    { name: 'טנגרם עץ תלת־ממדי', url: 'https://s.click.aliexpress.com/e/_c2ulyOSx', image: 'https://ae-pic-a1.aliexpress-media.com/kf/H0c41d0378c4c45e18cd3ecc025fdadb9b.jpg' },
  ] },
  { id: 'quiz', title: '🏆 לערב חידון', placements: ['/quiz', '/trivia', '/riddles', '/trick-questions', '/eretz-ir'], products: [
    { name: 'סט 4 לחצני תשובה לחידון', url: 'https://s.click.aliexpress.com/e/_c4DRjOUr', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S87497956c6774432b9f53997b77a8b129.jpg' },
    { name: 'שעון חול צבעוני', url: 'https://s.click.aliexpress.com/e/_c4OMl0Vt', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sda6158d13f964f9ca72974e5434e5762a.jpg' },
    { name: 'לוח מגנטי מחיק לניקוד', url: 'https://s.click.aliexpress.com/e/_c3GeCQVp', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S689fa8b7c78b414aa8517d6c36298f78c.jpg' },
  ] },
  { id: 'shabbat', title: '🕯️ לשולחן שבת', placements: ['/shabbat-activities', '/shabbat-times', '/parasha'], products: [
    { name: 'סט 3 פמוטי מתכת', url: 'https://s.click.aliexpress.com/e/_c3afoVwn', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S68cfd56752044e54a879ffd98f6470adD.jpg' },
    { name: 'פמוטי זכוכית עגולים', url: 'https://s.click.aliexpress.com/e/_c4buzpc7', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S6fbbf1cab0cd4e5f9fec837bc2cf86cao.jpg' },
    { name: 'שחמט, דמקה ושש־בש לסוף שבוע', url: 'https://s.click.aliexpress.com/e/_c3pcf1k7', image: 'https://ae-pic-a1.aliexpress-media.com/kf/H705be8b1e00e4684a516bd4bb4852d91J.jpg' },
  ] },
  { id: 'teacher', title: '🍎 לגננת ולמורה', placements: ['/classroom', '/teachers', '/printables/teacher-templates', '/printables/classroom-signs'], products: [
    { name: 'טיימר ויזואלי לכיתה', url: 'https://s.click.aliexpress.com/e/_c3KeIGcf', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S23f8c7debca24e4ebccc7d7feae993b1Z.jpg' },
    { name: 'גליל מדבקות עידוד', url: 'https://s.click.aliexpress.com/e/_c36Z89IR', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Scf91aa54c3ec4df4901b1ccaa7dfc928F.jpg' },
    { name: 'מכונת למינציה A4/A3', url: 'https://s.click.aliexpress.com/e/_c3TFMIP9', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sd53664d43e784fa5aa4e13b170cdb153g.jpg' },
    { name: 'מספריים בטיחותיים לילדים', url: 'https://s.click.aliexpress.com/e/_c3AelH43', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S0f415d490b76404d8910161d1bccc5b5n.jpg' },
  ] },
  { id: 'teacher-gift', title: '🎁 מתנה לגננת ולמורה', placements: ['/gifts/teacher-end-of-year', '/gifts/gananet', '/greetings/kindergarten-teacher', '/greetings/teacher-f', '/ideas/end-of-year-party', '/thank-you-wall', '/vaad', '/parent-meetings'], products: [
    { name: 'ספל בהתאמה אישית עם תמונה', url: 'https://s.click.aliexpress.com/e/_c2vg4efV', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sc979c573d4374e2b9f27094fcb4223a3S.png' },
    { name: 'צמיד עדין לנשים', url: 'https://s.click.aliexpress.com/e/_c4OdJftz', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S12a540e4cae04da98e75d9bc66016fc44.jpg' },
    { name: 'סט נרות ריחניים בצנצנות', url: 'https://s.click.aliexpress.com/e/_c3lCqJeP', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Secd4618da8ec4b4c8d311acb262d2187L.jpg' },
    { name: 'בונסאי מלאכותי בעציץ', url: 'https://s.click.aliexpress.com/e/_c3PUSwCJ', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S2dd262d196de4accb238b3a7214aa11bw.jpg' },
    { name: 'פלנר שבועי A5', url: 'https://s.click.aliexpress.com/e/_c3Nv7E7H', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sfd4c4f055a434cc4be96cf0d374c2e911.jpg' },
    { name: 'עט מתכת מהודר בקופסת מתנה', url: 'https://s.click.aliexpress.com/e/_c32FP3Ef', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S263e2fc693db41f286fbc1d64e474b73x.jpg' },
    { name: 'תיק בד עם רקמת פרחים', url: 'https://s.click.aliexpress.com/e/_c417jzN9', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S51f49a72173845f896e526fe8c81d008s.png' },
    { name: 'מחזיק מפתחות עם תמונה', url: 'https://s.click.aliexpress.com/e/_c3N0F3g7', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sb64bd16444c4494aa136255ca18c90dal.jpg' },
    { name: 'מסגרת תמונה מגנטית מעץ', url: 'https://s.click.aliexpress.com/e/_c40nJXHH', image: 'https://ae-pic-a1.aliexpress-media.com/kf/Sdee1b7e1b8844327861d6c711846f9c23.jpg' },
    { name: 'מדבקות תודה לעטיפת מתנות', url: 'https://s.click.aliexpress.com/e/_c3SriLdN', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S53f6110a64314b4e9377d8d468a4f143J.jpg' },
  ] },
  { id: 'hanukkah', title: '🕎 לחנוכה', placements: ['/hanukkah', '/sevivon', '/holidays/hanukkah', '/printables/coloring/hanukkiah', '/printables/coloring/dreidel', '/printables/coloring/sufganiyah'], products: [
    { name: '10 סביבוני עץ', url: 'https://s.click.aliexpress.com/e/_c3wLToGB', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S9fa8a8d6e868497b8c7df0dc24db2d57l.jpg' },
    { name: 'חנוכייה מעוצבת', url: 'https://s.click.aliexpress.com/e/_c4DKuvcF', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S08f9ef1aa01f49b6bec7d3007b17fdb9s.jpg' },
    { name: 'באנר Happy Hanukkah', url: 'https://s.click.aliexpress.com/e/_c3gGXUf9', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S2463ed9db94c42f0b55203878625b138d.jpg' },
    { name: 'שרשרת אורות מגן דוד', url: 'https://s.click.aliexpress.com/e/_c3HZlKJH', image: 'https://ae-pic-a1.aliexpress-media.com/kf/S52a621a26dc6453c93daaa7f3161a3c53.jpg' },
  ] },
]

// Never on pages a child uses alone (the kids zone and the games), nor wherever sponsors are off.
// The buying guides (/recommended) show their topic's picks in their own grid, so no extra box there.
export const NO_AFFILIATE = [...NO_SPONSOR, '/games', '/online-games', '/brain-games', '/recommended']

const valid = p => p && p.name && /^https:\/\//.test(p.url || '') && /^https:\/\//.test(p.image || '')

// All valid products of a topic (by id) — the buying guide's own grid. [] when none.
export function affiliateProducts(id, topics = AFFILIATE_TOPICS) {
  return (topics.find(t => t.id === id)?.products || []).filter(valid)
}

// Small stable hash of the path, so each page shows its own slice of the topic's pool.
const pathSeed = p => { let h = 0; for (const c of p) h = (h * 31 + c.charCodeAt(0)) % 9973; return h }

// The topic (with at least one valid product) for a page, or null. Topics with more than four
// products rotate by path: different pages of the same topic show different picks (stable per page).
export function affiliateForPath(path, topics = AFFILIATE_TOPICS) {
  if (NO_AFFILIATE.some(p => matchesPlacement(p, path))) return null
  const t = topics.find(x => x.placements.some(p => matchesPlacement(p, path)))
  const products = (t?.products || []).filter(valid)
  if (!products.length) return null
  const start = pathSeed(path) % products.length
  const picked = products.length <= 4 ? products : Array.from({ length: 4 }, (_, i) => products[(start + i) % products.length])
  return { ...t, products: picked }
}
