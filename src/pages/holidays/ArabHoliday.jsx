import '../../learn/learn.css'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { PATH, GROUPS, HOLIDAYS, bySlug } from '../../data/arabHolidays'

// /holidays/arab-holidays/:slug: one detail page per holiday (Muslim, Christian, Druze).
// Cultural and religious explanations only, in a neutral tone. Nothing here is stored or sent anywhere.

function starPoints(cx, cy, R, r, n = 5) {
  const pts = []
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 === 0 ? R : r
    const a = (Math.PI / n) * i - Math.PI / 2
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

// ---- coloring line art (simple outlines, drawn here) ----
const S = { fill: 'none', stroke: '#222', strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' }

function Art({ kind, size = '100%' }) {
  let body = null
  if (kind === 'crescent') {
    body = <>
      <path d="M125 25 A75 75 0 1 0 125 175 A58 58 0 1 1 125 25 Z" {...S} />
      <polygon points={starPoints(140, 100, 24, 10)} {...S} />
      <polygon points={starPoints(60, 40, 9, 4)} {...S} />
      <polygon points={starPoints(170, 40, 8, 3.5)} {...S} />
      <polygon points={starPoints(170, 165, 8, 3.5)} {...S} />
    </>
  } else if (kind === 'star') {
    body = <>
      <polygon points={starPoints(100, 100, 70, 30, 8)} {...S} />
      <circle cx="100" cy="100" r="16" {...S} />
      <polygon points={starPoints(30, 30, 12, 5)} {...S} />
      <polygon points={starPoints(172, 36, 10, 4)} {...S} />
      <polygon points={starPoints(176, 168, 12, 5)} {...S} />
      <path d="M20 170 A22 22 0 1 0 38 148 A16 16 0 1 1 20 170 Z" {...S} />
    </>
  } else if (kind === 'lantern') {
    body = <>
      <circle cx="100" cy="18" r="9" {...S} />
      <path d="M100 27 V42" {...S} />
      <path d="M70 52 Q100 36 130 52 L124 62 H76 Z" {...S} />
      <path d="M76 62 Q58 110 76 150 H124 Q142 110 124 62" {...S} />
      <path d="M100 62 V150" {...S} />
      <path d="M88 62 Q76 106 88 150 M112 62 Q124 106 112 150" {...S} />
      <path d="M70 150 H130 L122 166 H78 Z" {...S} />
      <path d="M100 166 V180" {...S} />
      <polygon points={starPoints(100, 106, 10, 4)} {...S} />
    </>
  } else if (kind === 'sheep') {
    body = <>
      {[[60, 90], [85, 72], [115, 72], [140, 90], [145, 118], [118, 130], [86, 130], [60, 118]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="22" fill="#fff" stroke="#222" strokeWidth="3" />)}
      <rect x="62" y="84" width="82" height="42" fill="#fff" />
      <ellipse cx="168" cy="96" rx="20" ry="24" {...S} />
      <ellipse cx="156" cy="80" rx="8" ry="12" {...S} transform="rotate(-25 156 80)" />
      <circle cx="174" cy="92" r="3" fill="#222" />
      <path d="M170 108 Q176 112 182 108" {...S} />
      <path d="M72 138 V176 M96 140 V178 M126 140 V178 M146 134 V174" {...S} />
      <path d="M54 126 Q40 118 44 102" {...S} />
    </>
  } else if (kind === 'tree') {
    body = <>
      <polygon points={starPoints(100, 22, 14, 6)} {...S} />
      <path d="M100 34 L66 84 H134 Z" {...S} />
      <path d="M100 62 L52 126 H148 Z" {...S} />
      <path d="M100 96 L38 170 H162 Z" {...S} />
      <rect x="88" y="170" width="24" height="22" {...S} />
      <circle cx="90" cy="78" r="5" {...S} /><circle cx="108" cy="104" r="5" {...S} /><circle cx="76" cy="118" r="5" {...S} />
      <circle cx="120" cy="140" r="5" {...S} /><circle cx="62" cy="152" r="5" {...S} /><circle cx="96" cy="152" r="5" {...S} />
    </>
  } else if (kind === 'egg') {
    body = <>
      <path d="M100 18 C150 18 170 100 170 128 C170 166 138 188 100 188 C62 188 30 166 30 128 C30 100 50 18 100 18 Z" {...S} />
      <path d="M44 100 L62 84 L80 100 L98 84 L116 100 L134 84 L152 100 L166 90" {...S} />
      <path d="M32 134 Q100 160 168 134" {...S} />
      <circle cx="62" cy="152" r="6" {...S} /><circle cx="100" cy="168" r="6" {...S} /><circle cx="138" cy="152" r="6" {...S} />
      <polygon points={starPoints(100, 56, 14, 6)} {...S} />
    </>
  } else {
    // olive branch
    const leaves = [[60, 140, -40], [60, 120, 40], [86, 112, -40], [88, 92, 40], [112, 84, -40], [116, 64, 40], [138, 58, -40], [140, 38, 30]]
    body = <>
      <path d="M40 176 Q90 120 150 28" {...S} />
      {leaves.map(([x, y, a]) => <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="9" ry="22" {...S} transform={`rotate(${a} ${x} ${y})`} />)}
      <ellipse cx="108" cy="124" rx="8" ry="11" {...S} /><ellipse cx="132" cy="96" rx="8" ry="11" {...S} /><ellipse cx="78" cy="154" rx="8" ry="11" {...S} />
      <path d="M108 113 V104 M132 85 V76 M78 143 V134" {...S} />
    </>
  }
  return <svg viewBox="0 0 200 200" style={{ width: size, height: size }} aria-hidden="true">{body}</svg>
}

// ---- printable sheets ----
const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
const foot = (h, txt) => <footer>ugabuga.co.il{PATH}/{h.slug} · {txt}</footer>

function ColoringSheet({ h }) {
  return <article className="buga-a4" style={page}>
    <h2>{h.emoji} צובעים: {h.name}</h2>
    <p style={{ fontSize: 14, margin: '0 0 4px', width: '100%' }}>שם: ______________ · בערבית: <span lang="ar" dir="rtl" style={{ fontWeight: 800 }}>{h.ar}</span></p>
    <div style={{ flex: 1, width: '100%', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ height: '100%', maxHeight: '215mm', aspectRatio: '1 / 1' }}><Art kind={h.art} /></div>
    </div>
    <p style={{ fontSize: 13, margin: '4px 0 0', textAlign: 'center' }}>צובעים בכל הצבעים שאוהבים, וכותבים למטה משפט על החג: ____________________________</p>
    {foot(h, 'דף צביעה')}
  </article>
}

function CardSheet({ h }) {
  const g = h.greeting
  const one = i => <div key={i} style={{ flex: 1, minHeight: 0, width: '100%', border: '3px dashed #555', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 14, padding: '8px 18px', background: '#fffdf2' }}>
    <div style={{ width: '32%', height: '100%', display: 'flex', alignItems: 'center' }}><Art kind={h.art} /></div>
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div lang="ar" dir="rtl" style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.25 }}>{g.ar}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{g.translit}</div>
      <div style={{ fontSize: 17, marginTop: 2 }}>{g.he}</div>
      <div style={{ fontSize: 14, marginTop: 12 }}>מאת: ____________________</div>
    </div>
  </div>
  return <article className="buga-a4" style={page}>
    <h2>{h.emoji} כרטיס ברכה: {h.short}</h2>
    <p style={{ fontSize: 13, margin: '0 0 4px' }}>גוזרים לאורך הקו המקווקו, צובעים את הציור ומוסרים לחבר</p>
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>{[0, 1].map(one)}</div>
    {foot(h, 'כרטיס ברכה')}
  </article>
}

const SHEETS = [
  { id: 'color', emoji: '🖍️', label: 'דף צביעה', C: ColoringSheet },
  { id: 'card', emoji: '💌', label: 'כרטיס ברכה בערבית ובעברית', C: CardSheet },
]

export default function ArabHoliday() {
  const { slug } = useParams()
  const h = bySlug(slug)
  const [print, setPrint] = useState(null)
  const [heard, setHeard] = useState(false)

  if (!h) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-center" dir="rtl">
      <SEO title="חג לא נמצא" description="העמוד שחיפשתם לא נמצא. אפשר לחזור לכל החגים." path={`${PATH}/${slug || ''}`} />
      <h1 className="mb-4 text-4xl">🤔 לא מצאנו את החג הזה</h1>
      <p className="text-lg"><Link className="font-bold underline" to={PATH}>חזרה לחגי המוסלמים, הנוצרים והדרוזים</Link></p>
    </div>
  }

  const group = GROUPS.find(g => g.id === h.group)
  const sheet = SHEETS.find(s => s.id === print)
  const siblings = HOLIDAYS.filter(x => x.group === h.group && x.slug !== h.slug)
  const path = `${PATH}/${h.slug}`
  const greetings = [h.greeting, h.greeting2].filter(Boolean)

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title={h.title} description={h.desc} path={path} structuredData={faqSchema(h.faq.map(([q, a]) => ({ q, a })))} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, { label: 'חגי המוסלמים, הנוצרים והדרוזים', href: PATH }, { label: h.short }]} />
    <h1 className="mb-1 text-center text-4xl sm:text-5xl">{h.emoji} {h.title}</h1>
    <p className="mb-2 text-center text-3xl font-black" lang="ar" dir="rtl">{h.ar}</p>
    <p className="mb-2 text-center text-xl font-bold">נהגה: {h.translit}</p>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">{h.tagline} הסבר פשוט וכללי, מתאים לילדים, להורים ולצוותי חינוך, עם מנהגים, ברכה בערבית, רעיונות לכיתה ודפים להדפסה.</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2" aria-label="ניווט בעמוד">
      {[['what', 'מה זה'], ['how', 'איך חוגגים'], ['greet', 'ברכה בערבית'], ['when', 'מתי'], ['class', 'רעיונות לכיתה'], ['print', 'דפים להדפסה'], ['faq', 'שאלות']].map(([a, t]) => <a key={a} href={`#${a}`} className="ln-btn alt">{t}</a>)}
    </nav>

    <section id="what" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] p-5" style={{ background: group.color }} aria-labelledby="what-h">
      <h2 id="what-h" className="mb-3 text-3xl font-black">{group.emoji} מה זה {h.short}?</h2>
      <div className="space-y-3 text-lg leading-relaxed">{h.meaning.map(m => <p key={m}>{m}</p>)}</div>
    </section>

    <section id="how" className="mb-8 scroll-mt-24" aria-labelledby="how-h">
      <h2 id="how-h" className="mb-3 text-3xl font-black">🏠 איך משפחות חוגגות</h2>
      <p className="mb-3 text-lg leading-relaxed">כל משפחה חוגגת בדרכה, ואלה מנהגים נפוצים. נהוג וגם רבים נוהגים, ולא כולם באותה צורה.</p>
      <ul className="grid gap-3 sm:grid-cols-2">{h.celebrate.map(([e, t, d]) => <li key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <p className="text-xl font-bold"><span aria-hidden="true">{e}</span> {t}</p><p className="mt-1 leading-relaxed">{d}</p></li>)}
      </ul>
    </section>

    <section id="greet" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-yellow-50 p-5" aria-labelledby="greet-h">
      <h2 id="greet-h" className="mb-3 text-3xl font-black">💬 איך מברכים בערבית</h2>
      <div className="grid gap-3 sm:grid-cols-2">{greetings.map(g => <div key={g.ar} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-center">
        <p className="text-4xl font-black" lang="ar" dir="rtl">{g.ar}</p>
        <p className="mt-1 text-2xl font-bold">{g.translit}</p>
        <p className="mt-1 text-lg">{g.he}</p>
      </div>)}</div>
      <div className="mt-4 text-center">
        <button type="button" className="ln-btn go" onClick={() => setHeard(v => !v)} aria-pressed={heard}>{heard ? 'מסתירים את התרגול' : 'מתרגלים ביחד'}</button>
        <p className="mt-3 min-h-[3rem] text-xl font-bold" role="status" aria-live="polite">{heard ? `אומרים בקול: ״${h.greeting.translit}״ ואז מחייכים ומחכים לחבר לענות. כל הכבוד!` : ''}</p>
      </div>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">🔒 שום דבר לא נשמר ולא נשלח. התרגול נשאר רק על המסך שלכם.</p>
    </section>

    <section id="when" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5" aria-labelledby="when-h">
      <h2 id="when-h" className="mb-3 text-3xl font-black">📅 מתי החג הבא?</h2>
      <p className="text-2xl font-black">{h.dateText}</p>
      {h.moon
        ? <p className="mt-2 text-lg leading-relaxed">🌙 התאריך הוא בערך, כי הלוח ההג׳רי נקבע לפי הירח. שנה בו קצרה בכ־11 ימים משנה לועזית, ולכן החג מקדים בכ־11 ימים בכל שנה, והתאריך בפועל נקבע לפי ראיית הירח ועשוי להשתנות ביום.</p>
        : h.group === 'christian'
          ? <p className="mt-2 text-lg leading-relaxed">⛪ יש לוחות שונים: ברוב הכנסיות הקתוליות והפרוטסטנטיות החג חל בתאריך אחד, ובכנסיות האורתודוקסיות בתאריך אחר. שווה לשאול את החבר מתי הוא חוגג.</p>
          : <p className="mt-2 text-lg leading-relaxed">📌 זה חג עם תאריך קבוע בלוח הלועזי, ולכן הוא לא נע כמו החגים המוסלמיים.</p>}
    </section>

    <section id="class" className="mb-8 scroll-mt-24" aria-labelledby="class-h">
      <h2 id="class-h" className="mb-3 text-3xl font-black">🎒 מה אפשר לעשות בכיתה</h2>
      <ul className="grid gap-3 sm:grid-cols-2">{h.classIdeas.map((c, i) => <li key={c} className="flex gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-200 text-lg font-black" aria-hidden="true">{i + 1}</span><span className="leading-relaxed">{c}</span></li>)}
      </ul>
      <p className="mt-3 rounded-2xl bg-emerald-50 p-4 leading-relaxed">💛 תמיד בכבוד: מזמינים ילדים לשתף ולא מחייבים. לא מניחים שכל ילד מהעדה חוגג באותו אופן, ולא מייצגים עדה שלמה.</p>
    </section>

    <section id="print" className="mb-8 scroll-mt-24" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-3 text-3xl font-black">🖨️ דפים להדפסה</h2>
      <div className="grid gap-3 sm:grid-cols-2">{SHEETS.map(s => <button key={s.id} type="button" onClick={() => setPrint(s.id)}
        className="ln-box card-lift min-h-[64px] text-right text-xl font-bold"><span aria-hidden="true">{s.emoji}</span> {s.label} · הדפסה ←</button>)}
      </div>
    </section>

    {sheet && <PrintPreview title={`${h.short} — ${sheet.label}`} onClose={() => setPrint(null)}><sheet.C h={h} /></PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד חגים: {siblings.map(s => <span key={s.slug}><Link className="font-bold underline" to={`${PATH}/${s.slug}`}>{s.short}</Link> · </span>)}<Link className="font-bold underline" to="/holidays/ramadan">רמדאן ועיד אל-פיטר</Link> · <Link className="font-bold underline" to={PATH}>כל החגים</Link> · <Link className="font-bold underline" to="/holidays">חגים ומועדים</Link></p>
    <div id="faq" className="mt-10 scroll-mt-24"><SeoBody paragraphs={[
      `${h.meaning[0]} ${h.meaning[1] || ''}`.trim(),
      `בעמוד הזה תמצאו הסבר פשוט על ${h.short} לילדים: מה החג מציין, איך משפחות נוהגות לחגוג, איך מברכים בערבית (״${h.greeting.translit}״), ומתי בערך החג הבא. בנוסף יש רעיונות לכיתה בכבוד ודפי הדפסה: דף צביעה וכרטיס ברכה בערבית ובעברית. שום מידע לא נשמר ולא נשלח.`,
    ]} faq={h.faq.map(([q, a]) => ({ q, a }))} related={[{ label: 'חגי המוסלמים, הנוצרים והדרוזים', href: PATH }, { label: 'חגים ומועדים', href: '/holidays' }, { label: 'רמדאן ועיד אל-פיטר', href: '/holidays/ramadan' }]} /></div>
  </div>
}
