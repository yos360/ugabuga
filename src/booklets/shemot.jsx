import WORKBOOK from '../data/parasha/workbook-exodus'
import { A4, Certificate, Cover, WordSearchPage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "חוברת עבודה לספר שמות" — the eleven parashot of Exodus from the site's own parasha workbook data
// (src/data/parasha/workbook-exodus.js): the order of the parashot, sequencing, matching characters and
// concepts, true/false, multiple choice, completing verses, the ten plagues in order, a word search and drawing.
// Every answer is derived from the data below, so the answer key cannot drift from the exercises.
const PAGES = bookletBySlug('shemot').pages
const LETTERS = ['א', 'ב', 'ג', 'ד']

// Parasha slug -> Hebrew name, in reading order, plus one line about what happens in it.
export const PARASHOT = [
  ['shemot', 'שמות', 'השעבוד במצרים, לידת משה והסנה הבוער'],
  ['vaera', 'וארא', 'מכות מצרים מתחילות'],
  ['bo', 'בא', 'שלוש המכות האחרונות ויציאת מצרים'],
  ['beshalach', 'בשלח', 'קריעת ים סוף ושירת הים'],
  ['yitro', 'יתרו', 'עצת יתרו ועשרת הדיברות'],
  ['mishpatim', 'משפטים', 'חוקים ומשפטים ו״נעשה ונשמע״'],
  ['terumah', 'תרומה', 'תרומות לבניית המשכן'],
  ['tetzaveh', 'תצווה', 'בגדי הכוהנים ושמן למנורה'],
  ['ki-tisa', 'כי תשא', 'עגל הזהב ולוחות שניים'],
  ['vayakhel', 'ויקהל', 'העם מביא תרומות ובונים את המשכן'],
  ['pekudei', 'פקודי', 'חשבון המשכן והקמתו'],
]
const nameOf = slug => PARASHOT.find(p => p[0] === slug)[1]

// Page 3: which parasha comes next.
export const NEXT = [['shemot', 'vaera'], ['bo', 'beshalach'], ['yitro', 'mishpatim'], ['terumah', 'tetzaveh'], ['ki-tisa', 'vayakhel'], ['vayakhel', 'pekudei']]

// Pages 4, 5, 14: put the events in order (the data lists them in the right order).
export const SEQUENCES = [{ n: 4, slug: 'shemot' }, { n: 5, slug: 'beshalach' }, { n: 14, slug: 'ki-tisa' }]

// Page 6: [parasha, character] — the description comes from the workbook.
export const WHO = [['shemot', 'בת פרעה'], ['shemot', 'שפרה ופועה'], ['beshalach', 'מרים'], ['yitro', 'יתרו'], ['ki-tisa', 'בצלאל'], ['beshalach', 'עמלק']]
// Page 9: [parasha, concept].
export const WHAT = [['shemot', 'מיילדת'], ['bo', 'מצה'], ['beshalach', 'קריעת ים סוף'], ['yitro', 'עשרת הדיברות'], ['terumah', 'מנורה'], ['shemot', 'שעבוד']]
// Page 7: [parasha, index in its true/false list] — six true and six false statements.
export const TRUE_FALSE = [['shemot', 0], ['shemot', 1], ['bo', 0], ['bo', 1], ['beshalach', 1], ['beshalach', 3], ['yitro', 2], ['yitro', 5], ['terumah', 1], ['terumah', 2], ['ki-tisa', 5], ['ki-tisa', 4]]
// Page 8: [parasha, index in its easy-question list].
export const QUESTIONS = [['shemot', 0], ['shemot', 1], ['bo', 3], ['beshalach', 0], ['yitro', 3], ['mishpatim', 3], ['terumah', 2], ['pekudei', 3]]
// Page 10: [parasha, the word taken out of the verse].
export const VERSES = [['shemot', 'בער'], ['bo', 'לבנך'], ['beshalach', 'ימלך'], ['yitro', 'אביך'], ['mishpatim', 'נעשה'], ['terumah', 'מקדש'], ['vayakhel', 'נדיב']]
// Page 11: the ten plagues, in the order they came (Exodus 7–12).
export const PLAGUES = ['דם', 'צפרדע', 'כינים', 'ערוב', 'דבר', 'שחין', 'ברד', 'ארבה', 'חושך', 'מכת בכורות']
export const SEARCH_WORDS = ['משה', 'אהרן', 'מרים', 'פרעה', 'יתרו', 'בצלאל', 'יהושע', 'מצה', 'משכן', 'סיני']
// Page 13: parashot whose drawing prompt is used.
export const DRAW = ['shemot', 'beshalach', 'yitro', 'terumah']

// A permutation of 0..len-1 that is never the identity, fixed by the seed.
function scramble(len, seed, salt) {
  for (let k = 0; ; k++) {
    const s = rngFor(seed, salt + k * 7).shuffle(Array.from({ length: len }, (_, i) => i))
    if (s.some((v, i) => v !== i)) return s
  }
}

const Sheet = ({ n, title, instruction, children }) => <A4 style={{ alignItems: 'stretch' }}>
  <h2>{title}</h2>
  <p style={{ textAlign: 'center', margin: '0 0 1mm', fontSize: '11pt' }}>שם: ______________ · עמוד {n} בחוברת</p>
  <p style={{ textAlign: 'center', margin: '0 0 3mm', fontSize: '12pt', fontWeight: 700 }}>{instruction}</p>
  {children}
  <div style={{ flex: 'none', height: '7mm' }} />
</A4>
const Rows = ({ count, children }) => <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateRows: `repeat(${count}, 1fr)` }}>{children}</div>
const Row = ({ last, children, style }) => <div style={{ display: 'flex', alignItems: 'center', gap: '4mm', borderBottom: last ? 0 : '0.3mm dashed #bbb', minHeight: 0, ...style }}>{children}</div>
const Box = ({ size = 11 }) => <span style={{ display: 'inline-block', verticalAlign: 'middle', flex: 'none', width: `${size}mm`, height: `${size}mm`, border: '0.6mm solid #111', borderRadius: '2mm', background: 'white' }} />
const Circle = ({ children }) => <span style={{ flex: 'none', border: '0.5mm solid #111', borderRadius: '6mm', padding: '1.5mm 5mm', fontSize: '12.5pt', fontWeight: 700, background: 'white' }}>{children}</span>

const events = slug => WORKBOOK[slug].events
const seqOrder = (slug, seed, n) => scramble(events(slug).length, seed, n * 13)

function ParashotList({ n }) {
  return <Sheet n={n} title="📜 12 הפרשות של ספר בראשית" instruction="ספר בראשית הוא הספר הראשון בחמשת חומשי התורה. קוראים את הסדר ומסמנים V ליד כל פרשה שקראנו">
    <Rows count={PARASHOT.length}>
      {PARASHOT.map(([slug, name, about], i) => <Row key={slug} last={i === PARASHOT.length - 1}>
        <span style={{ flex: 'none', width: '9mm', height: '9mm', borderRadius: '50%', border: '0.5mm solid #111', display: 'grid', placeItems: 'center', fontSize: '12pt', fontWeight: 800 }}>{i + 1}</span>
        <b style={{ flex: 'none', width: '30mm', fontSize: '15pt' }}>{name}</b>
        <span style={{ flex: 1, fontSize: '12.5pt' }}>{about}</span>
        <span style={{ flex: 'none', fontSize: '11pt' }}>קראנו <Box size={7} /></span>
      </Row>)}
    </Rows>
  </Sheet>
}

function NextPage({ n }) {
  return <Sheet n={n} title="➡️ מה הפרשה הבאה?" instruction="כותבים את שם הפרשה שבאה אחרי. אפשר להסתכל בעמוד 2">
    <Rows count={NEXT.length + 1}>
      {NEXT.map(([a], i) => <Row key={a}>
        <span style={{ fontSize: '15pt' }}>{i + 1}. אחרי פרשת <b>{nameOf(a)}</b> באה פרשת</span>
        <span style={{ flex: 1, borderBottom: '0.5mm solid #111', height: '9mm' }} />
      </Row>)}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ border: '0.6mm dashed #111', borderRadius: '4mm', padding: '3mm 6mm', textAlign: 'center', fontSize: '12.5pt', lineHeight: 1.7 }}>
          <b>מאגר שמות:</b><br />{[...NEXT.map(p => p[1])].sort().map(nameOf).join('  ·  ')}
        </div>
      </div>
    </Rows>
  </Sheet>
}

function SeqPage({ n, slug, seed }) {
  const ev = events(slug), order = seqOrder(slug, seed, n)
  return <Sheet n={n} title={`🔢 מסדרים את הסיפור: פרשת ${nameOf(slug)}`} instruction="כותבים בריבוע מספר מ־1 עד 6 לפי הסדר שבו קרו האירועים">
    <div style={{ flex: 3, minHeight: 0, display: 'grid', gridTemplateRows: `repeat(${ev.length}, 1fr)` }}>
      {order.map((k, i) => <Row key={k} last={i === ev.length - 1}>
        <Box size={12} /><span style={{ fontSize: '14pt', lineHeight: 1.35 }}>{ev[k]}</span>
      </Row>)}
    </div>
    <div style={{ flex: 2, minHeight: 0, marginTop: '4mm', border: '0.7mm solid #111', borderRadius: '4mm', padding: '3mm', fontSize: '12pt' }}>
      <b>מציירים את האירוע שהכי אהבתי:</b>
    </div>
  </Sheet>
}

// Shared by the characters page and the concepts page: names on the right with a box, descriptions in a
// shuffled order on the left, each with a letter. The child writes the letter of the description in the box.
function LetterMatch({ n, title, instruction, pairs, seed }) {
  const order = scramble(pairs.length, seed, n * 17)
  return <Sheet n={n} title={title} instruction={instruction}>
    <Rows count={pairs.length}>
      {pairs.map(([name], i) => <Row key={name} last={i === pairs.length - 1} style={{ gap: '3mm' }}>
        <span style={{ flex: 'none', width: '56mm', display: 'flex', alignItems: 'center', gap: '3mm' }}>
          <b style={{ flex: 1, fontSize: '14pt' }}>{i + 1}. {name}</b><Box size={10} />
        </span>
        <span style={{ flex: 1, fontSize: '13pt', lineHeight: 1.35, borderInlineStart: '0.4mm solid #bbb', paddingInlineStart: '4mm' }}>
          <b>{LETTERS_6[i]}.</b> {pairs[order[i]][1]}
        </span>
      </Row>)}
    </Rows>
  </Sheet>
}
const LETTERS_6 = ['א', 'ב', 'ג', 'ד', 'ה', 'ו']
const letterAnswers = (pairs, seed, n) => { const order = scramble(pairs.length, seed, n * 17); return pairs.map(([name], i) => `${name} — ${LETTERS_6[order.indexOf(i)]}`) }

const characterPairs = () => WHO.map(([slug, name]) => [name, WORKBOOK[slug].characters.find(c => c[0] === name)[1]])
const conceptPairs = () => WHAT.map(([slug, name]) => [name, WORKBOOK[slug].concepts.find(c => c[0] === name)[1]])

const statements = seed => scramble(TRUE_FALSE.length, seed, 71).map(k => { const [slug, i] = TRUE_FALSE[k]; return { text: WORKBOOK[slug].truefalse[i][0], answer: WORKBOOK[slug].truefalse[i][1] } })

function TrueFalsePage({ n, seed }) {
  const items = statements(seed)
  return <Sheet n={n} title="✔️ נכון או לא נכון?" instruction="קוראים כל משפט ומקיפים: נכון או לא נכון">
    <Rows count={items.length}>
      {items.map((it, i) => <Row key={it.text} last={i === items.length - 1} style={{ gap: '3mm' }}>
        <span style={{ flex: 'none', width: '7mm', fontSize: '11pt', color: '#555' }}>{i + 1}.</span>
        <span style={{ flex: 1, fontSize: '13pt', lineHeight: 1.3 }}>{it.text}</span>
        <Circle>נכון</Circle><Circle>לא נכון</Circle>
      </Row>)}
    </Rows>
  </Sheet>
}

const questions = seed => QUESTIONS.map(([slug, idx], i) => {
  const [q, right, wrong] = WORKBOOK[slug].easy[idx], opts = rngFor(seed, 40 + i).shuffle([right, ...wrong])
  return { q, opts, answer: LETTERS[opts.indexOf(right)], right }
})

function QuestionsPage({ n, seed }) {
  const items = questions(seed)
  return <Sheet n={n} title="❓ שאלות על הפרשות" instruction="מקיפים את התשובה הנכונה">
    <Rows count={items.length}>
      {items.map((it, i) => <Row key={it.q} last={i === items.length - 1} style={{ flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', gap: '2mm' }}>
        <b style={{ fontSize: '13.5pt' }}>{i + 1}. {it.q}</b>
        <span style={{ display: 'flex', gap: '8mm', fontSize: '13pt' }}>{it.opts.map((o, j) => <span key={o}>{LETTERS[j]}. {o}</span>)}</span>
      </Row>)}
    </Rows>
  </Sheet>
}

const blanked = (text, word) => { if (!text.includes(word)) throw new Error(`verse lacks ${word}`); return text.replace(word, '__________') }

function VersesPage({ n, seed }) {
  const bank = rngFor(seed, 52).shuffle(VERSES.map(v => v[1]))
  return <Sheet n={n} title="📖 משלימים את הפסוק" instruction="כותבים בחסר את המילה שמתאימה מתוך המאגר">
    <Rows count={VERSES.length + 1}>
      {VERSES.map(([slug, word], i) => { const v = WORKBOOK[slug].verse; return <Row key={slug} style={{ flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', gap: '1mm' }}>
        <span style={{ fontSize: '14pt', lineHeight: 1.4 }}>{i + 1}. {blanked(v.text, word)}</span>
        <span style={{ fontSize: '10pt', color: '#555' }}>({v.ref})</span>
      </Row> })}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ border: '0.6mm dashed #111', borderRadius: '4mm', padding: '3mm 6mm', fontSize: '14pt', fontWeight: 700 }}>{bank.join('   ·   ')}</div>
      </div>
    </Rows>
  </Sheet>
}

const plagueOrder = seed => scramble(PLAGUES.length, seed, 111)

function PlaguesPage({ n, seed }) {
  const order = plagueOrder(seed)
  return <Sheet n={n} title="🐸 עשר המכות" instruction="כותבים בריבוע מספר מ־1 עד 10 לפי הסדר שבו באו המכות על מצרים">
    <Rows count={5}>
      {[0, 1, 2, 3, 4].map(r => <Row key={r} last={r === 4} style={{ justifyContent: 'space-around' }}>
        {[0, 1].map(c => { const name = PLAGUES[order[r * 2 + c]]; return <span key={name} style={{ display: 'flex', alignItems: 'center', gap: '3mm', width: '45%' }}>
          <Box size={11} /><b style={{ fontSize: '15pt' }}>{name}</b>
        </span> })}
      </Row>)}
    </Rows>
  </Sheet>
}

function DrawPage({ n }) {
  return <Sheet n={n} title="🎨 מציירים את הסיפור" instruction="בוחרים רגע מכל פרשה ומציירים אותו במסגרת">
    <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '4mm' }}>
      {DRAW.map(slug => <div key={slug} style={{ border: '0.7mm solid #111', borderRadius: '4mm', padding: '3mm', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <b style={{ fontSize: '12.5pt' }}>פרשת {nameOf(slug)}</b>
        <span style={{ fontSize: '10.5pt', lineHeight: 1.3 }}>{WORKBOOK[slug].draw}</span>
      </div>)}
    </div>
  </Sheet>
}


function Key({ n, seed }) {
  const trueFalse = statements(seed), qs = questions(seed)
  const sections = [
    ['עמוד 3 — מה הפרשה הבאה?', NEXT.map(([, b], i) => `${i + 1}) ${nameOf(b)}`).join('   ')],
    ...SEQUENCES.map(({ n: pn, slug }) => [`עמוד ${pn} — סדר האירועים (${nameOf(slug)})`, `המספרים מלמעלה למטה: ${seqOrder(slug, seed, pn).map(k => k + 1).join(', ')}`]),
    ['עמוד 6 — מי זה?', letterAnswers(characterPairs(), seed, 6).join('   ')],
    ['עמוד 7 — נכון או לא נכון', trueFalse.map((t, i) => `${i + 1}) ${t.answer ? 'נכון' : 'לא נכון'}`).join('   ')],
    ['עמוד 8 — שאלות', qs.map((q, i) => `${i + 1}) ${q.answer} (${q.right})`).join('   ')],
    ['עמוד 9 — מה זה?', letterAnswers(conceptPairs(), seed, 9).join('   ')],
    ['עמוד 10 — משלימים את הפסוק', VERSES.map(([, w], i) => `${i + 1}) ${w}`).join('   ')],
    ['עמוד 11 — עשר המכות (המספר ליד כל מכה)', PLAGUES.map((p, i) => `${p} — ${i + 1}`).join('   ')],
  ]
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✅ דף תשובות להורים</h2>
    <p style={{ textAlign: 'center', margin: '0 0 3mm', fontSize: '11pt' }}>עמוד {n} בחוברת · בתפזורת, מילים נכתבות מימין לשמאל או מלמעלה למטה</p>
    <div style={{ fontSize: '12pt', lineHeight: 1.6 }}>
      {sections.map(([t, a]) => <section key={t} style={{ marginBottom: '3.5mm', breakInside: 'avoid' }}><b>{t}</b><div>{a}</div></section>)}
    </div>
  </A4>
}

export default function ShemotBooklet({ seed }) {
  return <>
    <Cover emoji="🌊🔥📜" title="חוברת עבודה לספר שמות" subtitle="16 עמודים: 11 פרשות, עשר המכות, סידור סיפורים, חידות ותפזורת" pages={PAGES}
      note="מתאימה לכיתות ב׳–ד׳ ולכל ילד שקורא את פרשת השבוע. כדאי לקרוא קודם את הפרשה בעמוד הפרשה באתר, ואז לפתור עמוד או שניים. כל התשובות בעמוד 15." />
    <ParashotList n={2} />
    <NextPage n={3} />
    <SeqPage n={4} slug="shemot" seed={seed} />
    <SeqPage n={5} slug="beshalach" seed={seed} />
    <LetterMatch n={6} title="🧑 מי זה?" instruction="כותבים בריבוע את האות של התיאור המתאים לכל דמות" pairs={characterPairs()} seed={seed} />
    <TrueFalsePage n={7} seed={seed} />
    <QuestionsPage n={8} seed={seed} />
    <LetterMatch n={9} title="💡 מה זה?" instruction="כותבים בריבוע את האות של ההסבר המתאים לכל מושג" pairs={conceptPairs()} seed={seed} />
    <VersesPage n={10} seed={seed} />
    <PlaguesPage n={11} seed={seed} />
    <WordSearchPage n={12} seed={seed} he size={10} title="תפזורת שמות" instruction="מוצאים את השמות: הם כתובים מימין לשמאל או מלמעלה למטה" words={SEARCH_WORDS.map(word => ({ word }))} />
    <DrawPage n={13} />
    <SeqPage n={14} slug="ki-tisa" seed={seed} />
    <Key n={15} seed={seed} />
    <Certificate booklet="חוברת העבודה לספר שמות" done="הכרתי את 11 הפרשות, סידרתי את עשר המכות, פתרתי חידות ומצאתי שמות בתפזורת." cheer="כל הכבוד, קורא/ת תורה מצטיין/ת!" />
  </>
}
