import { FILL, ROLE_MODELS, WHO_DID } from '../data/roleModels'
import { A4, AnswerKey, Certificate, Cover, Head, SvgPage, W, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "דמויות מופת ישראליות" — for first and second grade: 12 people (src/data/roleModels.js, facts checked
// against two sources), two per page with a question each, then matching, "who did it?", completing
// sentences, a page about the child's own dream, answers and a certificate. A symbol per field, no portraits.
const PAGES = bookletBySlug('role-models').pages
const FONT = 'Heebo, Arial, sans-serif'
const INK = '#111'

function PeoplePage({ n, people }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>🌟 דמויות מופת</h2>
    <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>שם: ______________ · עמוד {n} בחוברת · קוראים יחד ועונים על השאלה</p>
    {people.map(x => <section key={x.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '2px solid #111', borderRadius: 18, padding: '10px 16px', margin: '6px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 54, lineHeight: 1 }} aria-hidden="true">{x.symbol}</span>
        <div><h3 style={{ margin: 0, fontSize: '21pt' }}>{x.name}</h3><span style={{ fontSize: '12pt' }}>{x.field}</span></div>
      </div>
      <p style={{ fontSize: '16.5pt', lineHeight: 1.8, margin: '10px 0' }}>{x.text}</p>
      <p style={{ fontSize: '13.5pt', margin: 'auto 0 4px' }}><b>שאלה:</b> {x.q}</p>
      <p style={{ fontSize: '13.5pt', margin: 0 }}>תשובה: ________________________________</p>
      <p style={{ fontSize: '13.5pt', margin: '10px 0 0' }}><b>לחשוב:</b> מה אפשר ללמוד מהדמות הזאת? ______________________</p>
    </section>)}
  </A4>
}

// Names on the right, symbols on the left — draw a line.
function MatchSymbols({ n, people, seed }) {
  const left = rngFor(seed, n).shuffle(people), step = 105, top = 150
  return <SvgPage label="מתאימים סמל לדמות">
    <Head n={n} title="מתאימים סמל לדמות" instruction="מותחים קו מכל שם לסמל של התחום שלו" />
    {people.map((x, i) => { const y = top + i * step + step / 2; return <g key={x.id} fontFamily={FONT}>
      <text x={560} y={y + 9} fontSize="26" fontWeight="800" textAnchor="start" direction="rtl">{x.short}</text>
      <circle cx={360} cy={y} r="6" fill={INK} />
    </g> })}
    {left.map((x, i) => { const y = top + i * step + step / 2; return <g key={x.id}>
      <circle cx={210} cy={y} r="6" fill={INK} />
      <text x={110} y={y + 22} fontSize="58" textAnchor="middle">{x.symbol}</text>
    </g> })}
  </SvgPage>
}

function WhoDidPage({ n, seed }) {
  const rowH = 108, top = 140
  return <SvgPage label="מי עשה את זה?">
    <Head n={n} title="מי עשה את זה?" instruction="קוראים ומקיפים את השם הנכון" />
    {WHO_DID.map(([deed, ...names], i) => { const y = top + i * rowH, opts = rngFor(seed, 60 + i).shuffle(names); return <g key={i} fontFamily={FONT} direction="rtl">
      <text x={570} y={y + 34} fontSize="21" fontWeight="700" textAnchor="start">{i + 1}. מי {deed}?</text>
      {opts.map((o, j) => <text key={o} x={470 - j * 170} y={y + 78} fontSize="21" textAnchor="middle">{o}</text>)}
      {i < WHO_DID.length - 1 && <path d={`M30 ${y + rowH - 6} H570`} stroke="#ddd" strokeDasharray="5 6" />}
    </g> })}
  </SvgPage>
}

function FillPage({ n, seed }) {
  const bank = rngFor(seed, n).shuffle(FILL.map(f => f[1]))
  return <SvgPage label="משלימים את המשפט">
    <Head n={n} title="משלימים את המשפט" instruction="בוחרים שם ממחסן המילים וכותבים אותו בקו" />
    <rect x={40} y={135} width={520} height={86} rx="14" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="6 5" />
    <text x={W / 2} y={160} fontSize="15" textAnchor="middle" fontFamily={FONT}>מחסן מילים</text>
    {bank.map((w, i) => <text key={w} x={505 - (i % 3) * 170} y={188 + Math.floor(i / 3) * 26} fontSize="19" fontWeight="700" textAnchor="middle" fontFamily={FONT} direction="rtl">{w}</text>)}
    {FILL.map(([s], i) => <text key={i} x={565} y={290 + i * 88} fontSize="21" textAnchor="start" fontFamily={FONT} direction="rtl">{i + 1}. ____________ {s}</text>)}
  </SvgPage>
}

function MyDreamPage({ n }) {
  return <A4 style={{ alignItems: 'stretch' }}>
    <h2>✨ גם לי יש חלום</h2>
    <p style={{ textAlign: 'center', margin: '0 0 12px', fontSize: 14 }}>שם: ______________ · עמוד {n} בחוברת</p>
    <div style={{ fontSize: '15pt', lineHeight: 2.6, padding: '0 8mm' }}>
      <p>הדמות שהכי אהבתי בחוברת: ______________________</p>
      <p>אהבתי אותה כי ________________________________</p>
      <p>כשאהיה גדול/ה אני רוצה ______________________</p>
    </div>
    <p style={{ textAlign: 'center', fontSize: '14pt', margin: '8px 0' }}>ציירו את עצמכם מגשימים את החלום:</p>
    <div style={{ flex: 1, border: '3px dashed #111', borderRadius: 20, margin: '0 6mm 4mm' }} />
  </A4>
}

export default function RoleModelsBooklet({ seed }) {
  const pairs = Array.from({ length: 6 }, (_, i) => ROLE_MODELS.slice(i * 2, i * 2 + 2))
  const whoDid = WHO_DID.map(([deed, answer]) => `מי ${deed}? — ${answer}`)
  return <>
    <Cover emoji="🌟📜🚀🎵" title="דמויות מופת ישראליות" subtitle="12 אנשים שעשו דברים גדולים — חוברת לכיתות א׳–ב׳" pages={PAGES}
      note="כל דמות מופיעה עם טקסט קצר ושאלה. כדאי לקרוא יחד, לשוחח על מה שהדמות עשתה ועל מה שאפשר ללמוד ממנה — התמדה, אומץ, סקרנות ואהבה לשפה ולארץ. העובדות נבדקו מול שני מקורות לפחות." />
    {pairs.map((people, i) => <PeoplePage key={i} n={i + 2} people={people} />)}
    <MatchSymbols n={8} seed={seed} people={ROLE_MODELS.slice(0, 6)} />
    <MatchSymbols n={9} seed={seed} people={ROLE_MODELS.slice(6)} />
    <WhoDidPage n={10} seed={seed} />
    <FillPage n={11} seed={seed} />
    <MyDreamPage n={12} />
    <AnswerKey n={13} sections={[
      { title: 'עמודים 2–7 — השאלות על הדמויות', answers: ROLE_MODELS.map(x => `${x.short}: ${x.a}`) },
      { title: 'עמודים 8–9 — סמל לכל דמות', answers: ROLE_MODELS.map(x => `${x.short} — ${x.symbol} ${x.field}`) },
      { title: 'עמוד 10 — מי עשה את זה?', answers: whoDid },
      { title: 'עמוד 11 — משלימים את המשפט', answers: FILL.map(([s, w]) => `${w} ${s}`) },
    ]} />
    <Certificate booklet="חוברת דמויות המופת" done="הכרתי 12 דמויות מופת ישראליות, עניתי על שאלות וכתבתי על החלום שלי." cheer="גם אני יכול/ה לעשות דברים גדולים! 🌟" />
  </>
}
