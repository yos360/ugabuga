import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import SpeakButton from '../../components/ui/SpeakButton'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import {
  HOLIDAY_BLESSINGS, SEASONS, SOURCES, BLESSINGS_BASE, blessingsHref, holidayBlessingsBySlug,
  heRef, sefariaUrl, speakText, BOOKS, parseRef,
} from '../../data/holidayBlessings'
import '../../learn/learn.css'
import './holidayBlessings.css'

// /holidays/blessings — the hub; /holidays/blessings/:slug — one holiday's blessings, siddur and readings.
const KIND = { torah: { label: 'תורה', cls: 'torah' }, maftir: { label: 'מפטיר', cls: 'maftir' }, haftarah: { label: 'הפטרה', cls: 'haftarah' }, megillah: { label: 'מגילה', cls: 'megillah' } }
const lines = t => t.split('\n').map((l, i) => <p key={i}>{l}</p>)
const External = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="hb-ext">{children}<span aria-hidden="true"> ↗</span><span className="sr-only"> (נפתח בחלון חדש)</span></a>

const HUB_FAQ = [
  { q: 'לפי איזה מנהג כתובות הקריאות?', a: 'הקריאות בתורה ובנביאים כתובות לפי המנהג בארץ ישראל, שבה חוגגים יום טוב אחד. ההפטרות הן לפי מנהג אשכנז, כפי שהוא מופיע בלוח Hebcal; כשיש הבדל ידוע בין העדות — כתבנו אותו.' },
  { q: 'למה לפעמים כתוב "בנוסח עדות המזרח…"?', a: 'לכל קהילה יש נוסח תפילה משלה: אשכנז, ספרד ועדות המזרח. רוב הברכות זהות, אבל יש הבדלים קטנים במילים. הבאנו את הנוסח הנפוץ בסידורים בישראל, ובהערה קצרה ציינו את ההבדל.' },
  { q: 'האם כל הטקסטים נבדקו?', a: 'כן. כל ברכה נבדקה מול כמה סידורים (קורן, אשכנז, ספרד ועדות המזרח), וכל קריאה — מול לוח הקריאות לארץ ישראל, השולחן ערוך והרמב״ם, ומול נוסח הפסוקים עצמו. מה שלא הצלחנו לאמת — לא נכנס.' },
  { q: 'איך קוראים את הקטע המלא?', a: 'ליד כל קריאה יש קישור לספריא, שם אפשר לקרוא את הפסוקים המלאים עם ניקוד.' },
]

function BlessingCard({ b }) {
  return <li className="hb-bless">
    <div className="hb-bless-head">
      <h3>{b.title}</h3>
      {!b.plain && <SpeakButton text={speakText(b.text)} lang="he-IL" label={`השמעה: ${b.title}`} />}
    </div>
    <span className="hb-when">🕰️ {b.when}</span>
    <div className={b.plain ? 'hb-plain' : 'hb-text'}>{lines(b.text)}</div>
    {b.note && <p className="hb-note"><b>הערה:</b> {b.note}</p>}
    {b.why && <p className="hb-why">💡 <b>למה?</b> {b.why}</p>}
  </li>
}

function SiddurItem({ s }) {
  return <li className="hb-siddur">
    <h3>{s.name}</h3>
    <p>{s.desc}</p>
    {s.text && <details className="hb-details">
      <summary>📖 הנוסח המלא</summary>
      <div className="hb-text">{lines(s.text)}</div>
      {s.note && <p className="hb-note"><b>הערה:</b> {s.note}</p>}
    </details>}
    {s.link && <Link to={s.link.to} className="hb-more">{s.link.label} ←</Link>}
  </li>
}

function ReadingCard({ r }) {
  const k = KIND[r.kind]
  return <li className="hb-reading">
    <span className={`hb-kind ${k.cls}`}>{k.label}</span>
    <h3>{r.title}</h3>
    <p className="hb-refs">{r.whole
      ? <External href={sefariaUrl(r.refs[0])}>{BOOKS[parseRef(r.refs[0]).book]} — כל המגילה</External>
      : r.refs.map((ref, i) => <span key={ref}>{i > 0 && <span aria-hidden="true"> · </span>}<External href={sefariaUrl(ref)}>{heRef(ref)}</External></span>)}</p>
    <p className="hb-about"><b>על מה מספר הקטע?</b> {r.about}</p>
    {r.note && <p className="hb-note">{r.note}</p>}
  </li>
}

function PrintSheet({ h, onClose }) {
  return <PrintPreview title={`דף ברכות — ${h.name}`} onClose={onClose}>
    <article className="buga-flow hb-print" dir="rtl">
      <h2>{h.emoji} דף ברכות ל{h.name}</h2>
      <p className="hb-print-sub">{h.when}</p>
      {h.intro && <p className="hb-print-intro">{h.intro}</p>}
      {h.about?.length > 0 && <>
        <h3>מה מציינים ואיך חוגגים</h3>
        <ul>{h.about.map(s => <li key={s.name}><b>{s.name}</b> — {s.desc}</li>)}</ul>
      </>}
      {h.blessings.length > 0 && <>
        <h3>ברכות</h3>
        {h.blessings.map(b => <div key={b.id} className="hb-print-bless">
          <p className="hb-print-title"><b>{b.title}</b> — {b.when}</p>
          <div className="hb-print-text">{lines(b.text)}</div>
          {b.note && <p className="hb-print-note">{b.note}</p>}
        </div>)}
      </>}
      {h.siddur.length > 0 && <>
        <h3>מה אומרים בסידור</h3>
        <ul>{h.siddur.map(s => <li key={s.name}><b>{s.name}</b> — {s.desc}</li>)}</ul>
      </>}
      {h.tanakh.length > 0 && <>
        <h3>מה קוראים בתנ״ך</h3>
        <ul>{h.tanakh.map(r => <li key={r.title + r.refs[0]}><b>{r.title}:</b> {r.whole ? 'כל המגילה' : r.refs.map(heRef).join('; ')}</li>)}</ul>
      </>}
      {h.safety?.length > 0 && <>
        <h3>🧯 בטיחות</h3>
        <ul>{h.safety.map(s => <li key={s}>{s}</li>)}</ul>
      </>}
      {h.verse && <p className="hb-print-verse">״{h.verse.text}״ ({heRef(h.verse.ref)})</p>}
    </article>
  </PrintPreview>
}

function HolidayPage({ h }) {
  const [printing, setPrinting] = useState(false)
  const i = HOLIDAY_BLESSINGS.indexOf(h)
  const prev = HOLIDAY_BLESSINGS[i - 1], next = HOLIDAY_BLESSINGS[i + 1]
  const title = h.seoTitle || `ברכות ל${h.name}: מה אומרים בבית ומה קוראים בבית הכנסת`
  const desc = `${h.name} — ${[h.blessings.length && 'הברכות המלאות עם ניקוד והשמעה', h.siddur.length && 'מה אומרים בסידור', h.tanakh.length && 'מה קוראים בתורה ובהפטרה (לפי המנהג בארץ ישראל)'].filter(Boolean).join(', ')}, ודף ברכות להדפסה. נבדק מול כמה מקורות.`
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={title} description={desc} path={blessingsHref(h.slug)} structuredData={faqSchema(h.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, { label: 'ברכות וקריאות לחגים', href: BLESSINGS_BASE }, { label: h.name }]} />

    <header className="hb-hero">
      <p className="text-5xl m-0" aria-hidden="true">{h.emoji}</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">ברכות וקריאות ל{h.name}</h1>
      <p className="hb-hero-when">📅 {h.when}</p>
      <p className="mx-auto mt-2 max-w-2xl text-lg">{h.intro}</p>
    </header>

    <nav className="hb-jump no-print mt-5" aria-label="קפיצה בעמוד">
      {h.blessings.length > 0 && <a className="ln-chip" href="#blessings">🙏 ברכות</a>}
      {h.siddur.length > 0 && <a className="ln-chip" href="#siddur">📖 בסידור</a>}
      {h.tanakh.length > 0 && <a className="ln-chip" href="#tanakh">📜 בתנ״ך</a>}
      <button type="button" className="ln-chip" onClick={() => setPrinting(true)}>🖨️ דף ברכות להדפסה</button>
      {h.hub && <Link className="ln-chip" to={h.hub}>{h.emoji} עוד ל{h.name}</Link>}
    </nav>

    {h.blessings.length > 0 && <section id="blessings" className="hb-section scroll-mt-24" aria-labelledby="bless-title">
      <h2 id="bless-title">🙏 ברכות — מה אומרים בבית</h2>
      <p className="hb-sub">כל ברכה עם ניקוד מלא, מתי אומרים אותה, וכפתור 🔊 להשמעה (בהשמעה שם ה׳ נקרא ״השם״).</p>
      <ol className="hb-list">{h.blessings.map(b => <BlessingCard key={b.id} b={b} />)}</ol>
    </section>}

    {h.siddur.length > 0 && <section id="siddur" className="hb-section scroll-mt-24" aria-labelledby="siddur-title">
      <h2 id="siddur-title">📖 מה אומרים בסידור</h2>
      <p className="hb-sub">התפילות המיוחדות של {h.name} — בקצרה, כדי לדעת מה קורה בבית הכנסת.</p>
      <ul className="hb-list">{h.siddur.map(s => <SiddurItem key={s.name} s={s} />)}</ul>
      {h.textsNote && <p className="hb-note mt-3">{h.textsNote}</p>}
    </section>}

    {h.about?.length > 0 && <section id="about" className="hb-section scroll-mt-24" aria-labelledby="about-title">
      <h2 id="about-title">🎉 מה מציינים ואיך חוגגים</h2>
      <ul className="hb-list">{h.about.map(s => <SiddurItem key={s.name} s={s} />)}</ul>
    </section>}

    {h.safety?.length > 0 && <section id="safety" className="hb-section scroll-mt-24" aria-labelledby="safety-title">
      <h2 id="safety-title">🧯 בטיחות</h2>
      <ul className="hb-list">{h.safety.map(t => <li key={t}>{t}</li>)}</ul>
    </section>}

    {h.tanakh.length > 0 && <section id="tanakh" className="hb-section scroll-mt-24" aria-labelledby="tanakh-title">
      <h2 id="tanakh-title">📜 מה קוראים בתנ״ך</h2>
      <p className="hb-sub">הקריאות לפי המנהג בארץ ישראל. הקישורים פותחים את הפסוקים המלאים בספריא.</p>
      <ul className="hb-readings">{h.tanakh.map(r => <ReadingCard key={r.title + r.refs[0]} r={r} />)}</ul>
    </section>}

    {h.verse && <figure className="hb-verse">
      <blockquote>״{h.verse.text}״</blockquote>
      <figcaption>{h.verse.partial ? 'מתוך ' : ''}<External href={sefariaUrl(h.verse.ref)}>{heRef(h.verse.ref)}</External></figcaption>
    </figure>}

    <div className="no-print mt-6 flex flex-wrap justify-center gap-2">
      <button type="button" className="ln-btn" onClick={() => setPrinting(true)}>🖨️ הדפסת דף הברכות ל{h.name}</button>
    </div>
    {printing && <PrintSheet h={h} onClose={() => setPrinting(false)} />}

    <nav className="hb-prevnext no-print" aria-label="חגים נוספים">
      {prev ? <Link to={blessingsHref(prev.slug)}>→ {prev.emoji} {prev.name}</Link> : <span />}
      <Link to={BLESSINGS_BASE}>כל החגים</Link>
      {next ? <Link to={blessingsHref(next.slug)}>{next.emoji} {next.name} ←</Link> : <span />}
    </nav>

    <div className="mt-8"><SeoBody faq={h.faq} related={[
      ...(h.hub ? [{ label: `${h.name} לילדים`, href: h.hub }] : []),
      { label: 'ברכות וקריאות לכל החגים', href: BLESSINGS_BASE },
      { label: 'כל החגים', href: '/holidays' },
    ]} /></div>

    <section className="hb-sources" aria-labelledby="src-title">
      <h2 id="src-title">📚 מקורות שנבדקו</h2>
      <ul>{h.sources.map(k => <li key={k}>{SOURCES[k].url ? <External href={SOURCES[k].url}>{SOURCES[k].label}</External> : SOURCES[k].label}</li>)}</ul>
      <p>הנוסחים המסורתיים הם נחלת הכלל. ההסברים לילדים נכתבו במיוחד לעוגה בוגה. אם מצאתם טעות — נשמח לשמוע.</p>
    </section>
  </div>
}

function Hub() {
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="ברכות וקריאות לחגים — מה אומרים בבית ומה קוראים בבית הכנסת" description="הברכות לכל חגי ישראל עם ניקוד והשמעה — נרות, קידוש, סוכה, לולב, חנוכה, מגילה, ליל הסדר וספירת העומר — וגם מה אומרים בסידור ומה קוראים בתורה ובהפטרה בארץ ישראל. עם דף ברכות להדפסה." path={BLESSINGS_BASE} structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חגים', href: '/holidays' }, { label: 'ברכות וקריאות לחגים' }]} />
    <header className="hb-hero">
      <p className="text-5xl m-0" aria-hidden="true">🙏📜</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">ברכות וקריאות לחגים</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg">מה מברכים בבית, מה אומרים בסידור ומה קוראים בתורה — לכל חג ומועד בשנה. עם ניקוד מלא, כפתור השמעה, הסבר קצר לילדים ודף ברכות להדפסה.</p>
    </header>

    {SEASONS.map(s => {
      const list = HOLIDAY_BLESSINGS.filter(h => h.season === s.id)
      if (!list.length) return null
      return <section key={s.id} className="mt-8" aria-labelledby={`season-${s.id}`}>
        <h2 id={`season-${s.id}`} className="mb-3 text-2xl font-black">{s.emoji} {s.label}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(h => <Link key={h.slug} to={blessingsHref(h.slug)} className="wobbly flex flex-col border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow transition-transform hover:-translate-y-1">
          <span className="text-4xl mb-1" aria-hidden="true">{h.emoji}</span>
          <h3 className="text-2xl font-bold">{h.name}</h3>
          <p className="flex-1 text-[var(--muted-foreground)]">{[h.blessings.length && `${h.blessings.length} ברכות`, h.siddur.length && 'סידור', h.tanakh.length && 'קריאות בתנ״ך'].filter(Boolean).join(' · ')}</p>
          <span className="mt-2 font-bold underline decoration-dashed">כניסה ←</span>
        </Link>)}</div>
      </section>
    })}

    <div className="mt-10"><SeoBody paragraphs={[
      'בכל חג יש רגעים שבהם כל המשפחה עוצרת לברכה: הדלקת הנרות, הקידוש, הישיבה בסוכה, נרות החנוכה, קריאת המגילה וליל הסדר. ריכזנו כאן את כל הברכות האלה בניקוד מלא, עם הסבר מתי אומרים כל אחת — כדי שגם הילדים יוכלו לברך בעצמם.',
      'לכל חג יש גם דף "מה קורה בבית הכנסת": אילו תפילות מיוחדות אומרים, ומה קוראים בתורה, במפטיר, בהפטרה ובמגילה — לפי המנהג בארץ ישראל — עם משפט קצר לילדים על מה מספר כל קטע וקישור לפסוקים המלאים.',
    ]} faq={HUB_FAQ} related={[{ label: 'כל החגים', href: '/holidays' }, { label: 'שירי חנוכה וברכות ההדלקה', href: '/holidays/hanukkah/songs' }, { label: 'משחקים לשבת', href: '/games/shabbat' }]} /></div>
  </div>
}

export default function HolidayBlessings({ slug: fixed }) {
  const params = useParams()
  const slug = fixed || params.slug
  if (!slug) return <Hub />
  const h = holidayBlessingsBySlug(slug)
  if (!h) return <NotFound />
  return <HolidayPage key={slug} h={h} />
}
