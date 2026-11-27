import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import NotFound from '../pages/NotFound'
import { MUSIC_CRUMB } from './MusicPages'
import { BABY_GROUPS, BABY_ORIGINAL, babySong, babySongsOf, babySongPath } from './babySongs'
import './music.css'

const SONGS_CRUMB = { label: 'שירים לפסנתר', href: '/music/songs' }
const LANG_NOTE = { en: 'השיר באנגלית — התרגום החופשי מתחתיו הוא שלנו', de: 'השיר בגרמנית — התרגום החופשי מתחתיו הוא שלנו' }
const dir = lang => (lang === 'he' ? 'rtl' : 'ltr')

const INDEX_COPY = {
  lullabies: {
    title: 'שירי ערש עם מילים — לשירה רגועה לפני השינה',
    desc: 'שירי ערש עם מילים מלאות: פסוקים וברכות מסורתיים, שירי ערש עממיים בני מאות שנים ושירי ערש מקוריים בעברית — עם הוראות שירה רגועה ודף מילים להדפסה.',
    h1: 'שירי ערש עם מילים',
    lead: 'שירים רכים לשירה לפני השינה, עם הוראות פשוטות איך לשיר ואיך לנדנד. כל שיר מגיע עם דף מילים להדפסה.',
    body: ['שירי ערש הם שירים איטיים, חוזרים ושקטים. מה שמרגיע ילד אינו המנגינה המדויקת אלא הקול המוכר, הקצב האיטי והחזרה. לכן אין צורך לשיר יפה: מספיק שיר קצר שחוזרים עליו כל ערב באותה צורה.', 'כאן יש שני סוגי שירים: שירים שנמצאים בנחלת הכלל (פסוקים ומסורות עממיות, שירים בני עשרות ומאות שנים) — ושירי ערש מקוריים של עוגה בוגה שאפשר להדפיס ולשיר בחופשיות. שירי ערש עבריים מודרניים רבים מוגנים בזכויות יוצרים ולכן איננו מדפיסים אותם כאן; אפשר לשיר אותם מהזיכרון, לשמוע אותם בשירות מוזיקה מורשה או לחפש אותם בספריית השירים של בית הספר.'],
    faq: [
      { q: 'מאיזה גיל שרים שירי ערש?', a: 'מהימים הראשונים. תינוקות מכירים את הקול של ההורים עוד מהרחם, ושיר ערש קבוע הוא חלק מעולה מהרגלי השינה.' },
      { q: 'איך שרים שיר ערש בצורה רגועה?', a: 'בקול נמוך ועדין, בקצב איטי, עם נשימה בין שורות. חוזרים על אותו שיר כל ערב, ומאטים בהדרגה עד שהילד נרדם. לא חייבים לשיר "נכון" — זמזום גם עובד.' },
      { q: 'האם מותר להדפיס את המילים?', a: 'כן. בכל שיר יש דף מילים להדפסה. השירים כאן הם טקסטים בנחלת הכלל או שירים מקוריים של האתר, ולכן מותר להדפיס ולהשתמש בהם בבית ובגן.' },
    ],
    related: [{ label: 'שירים לתינוקות ולפעוטות', href: '/music/songs/babies' }, { label: 'סיפורי לילה טוב', href: '/stories' }, { label: 'לומדים שירים בפסנתר', href: '/music/songs' }],
  },
  babies: {
    title: 'שירים לתינוקות ולפעוטות — שירי ידיים ותנועה, גיל 0–3',
    desc: 'שירים לתינוקות ולפעוטות עם הוראות תנועה פשוטות להורה: שירי אצבעות, מחיאות כפיים, קוקו וסוסים על הברכיים. מילים להדפסה, גיל מומלץ וטיפים לשירה רגועה.',
    h1: 'שירים לתינוקות ולפעוטות',
    lead: 'שירי ידיים, אצבעות ותנועה לגיל 0–3. לכל שיר יש מילים, גיל מומלץ, הוראות תנועה והדפסה.',
    body: ['שירים ראשונים לילדים הם בעיקר משחק בין שניים: קול, מבט ומגע. תינוקות לא מבינים את כל המילים, אבל הם אוהבים את הקצב, את הפנים של ההורה ואת הרגע שבו משהו חוזר — ולכן שירי אצבעות, מחיאות כפיים וקוקו פועלים כל כך טוב.', 'כל השירים כאן הם שירים עממיים שנמצאים בנחלת הכלל, או שירים קצרים שכתבנו במיוחד לאתר ומסומנים "שיר מקורי של עוגה בוגה". את השירים החדשים והמוכרים של יוצרי ילדים מודרניים איננו מדפיסים, כדי לכבד את זכויות היוצרים.'],
    faq: [
      { q: 'מאיזה גיל אפשר לשיר לתינוקות?', a: 'מהיום הראשון. בחודשים הראשונים שרים בעיקר לשם הקול והחיבוק; מגיל חצי שנה בערך מוסיפים תנועות ידיים ומשחקי אצבעות.' },
      { q: 'מה שירי ידיים נותנים?', a: 'הם מחברים בין קול, תנועה ומגע, מלמדים חזרה ותור, ועוזרים לתינוקות להכיר את הגוף שלהם. מעבר לכך — זה פשוט כיף יחד.' },
      { q: 'האם צריך לדעת לשיר?', a: 'ממש לא. ילדים אוהבים את הקול של ההורה, גם אם הוא לא מדויק. אפשר לדבר בקצב או לזמזם.' },
    ],
    related: [{ label: 'שירי ערש עם מילים', href: '/music/songs/lullabies' }, { label: 'לומדים שירים בפסנתר', href: '/music/songs' }, { label: 'משחקים לפעוטות', href: '/games' }],
  },
}

export function BabySongsIndex({ group }) {
  const g = BABY_GROUPS[group], c = INDEX_COPY[group], songs = babySongsOf(group)
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={c.title} description={c.desc} path={g.path} structuredData={faqSchema(c.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, MUSIC_CRUMB, SONGS_CRUMB, { label: g.crumb }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">{group === 'lullabies' ? '🌙 ' : '🍼 '}</span>{c.h1}</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">{c.lead}</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{songs.map(s => <Link key={s.slug} to={babySongPath(s)} className="music-card card-lift text-right">
      <div className="text-3xl" aria-hidden="true">{s.emoji}</div>
      <h2 className="text-xl font-bold">{s.title}</h2>
      <p className="text-sm text-[var(--muted-foreground)]">גיל: {s.age}{s.kind === 'original' ? ' · שיר מקורי שלנו' : ''}</p>
    </Link>)}</div>
    <div className="mt-6 text-center"><Link to={group === 'lullabies' ? '/music/songs/babies' : '/music/songs/lullabies'} className="music-chip">{group === 'lullabies' ? '🍼 שירים לתינוקות ולפעוטות ←' : '🌙 שירי ערש עם מילים ←'}</Link></div>
    <div className="mt-10"><SeoBody paragraphs={c.body} faq={c.faq} related={c.related} /></div>
  </div>
}

export function BabySongPage({ group }) {
  const { slug } = useParams()
  const s = babySong(group, slug)
  if (!s) return <NotFound />
  const g = BABY_GROUPS[group], songs = babySongsOf(group), next = songs[(songs.indexOf(s) + 1) % songs.length]
  const original = s.kind === 'original'
  const faq = [
    { q: `מאיזה גיל מתאים "${s.title}"?`, a: `גיל מומלץ: ${s.age}. הגיל הוא הצעה בלבד — מתאימים את הקצב והתנועות לילד.` },
    { q: 'האם מותר להדפיס את המילים?', a: original ? 'כן. זה שיר מקורי שנכתב לאתר, ומותר להדפיס ולשיר אותו בבית ובגן.' : 'כן. הטקסט נמצא בנחלת הכלל, ולכן מותר להדפיס אותו ולהשתמש בו בחופשיות.' },
  ]
  const sheet = <div className="lyrics-sheet mt-6 rounded-3xl border-2 border-dashed border-[var(--border)] bg-white p-6 text-center" lang={s.lang === 'he' ? 'he' : s.lang} dir={dir(s.lang)}>
    <h2 className="text-2xl font-black mb-1" dir="rtl">{s.title}</h2>
    <p className="text-sm text-[var(--muted-foreground)] mb-4" dir="rtl">{s.source}</p>
    {s.lyrics.map((st, i) => <p key={i} className="whitespace-pre-line text-xl leading-loose mb-4">{st}</p>)}
    {s.gist && <p className="mt-2 text-base text-[var(--muted-foreground)] whitespace-pre-line" dir="rtl">{LANG_NOTE[s.lang]}: {s.gist}</p>}
    <p className="mt-4 text-xs text-[var(--muted-foreground)]" dir="rtl">ugabuga.co.il · {g.label}</p>
  </div>
  return <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`${s.title} — מילים, תנועות והדפסה`} description={`${s.title}: מילים להדפסה, גיל מומלץ (${s.age}), הוראות תנועה ושירה רגועה להורה. ${original ? 'שיר מקורי של עוגה בוגה.' : 'טקסט בנחלת הכלל.'}`} path={babySongPath(s)} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, MUSIC_CRUMB, SONGS_CRUMB, { label: g.crumb, href: g.path }, { label: s.title }]} />
    <div className="no-print">
      <h1 className="text-4xl text-center mb-1"><span aria-hidden="true">{s.emoji} </span>{s.title}</h1>
      <p className="text-center text-[var(--muted-foreground)] mb-2">גיל: {s.age} · {original ? BABY_ORIGINAL : 'נחלת הכלל'}</p>
      {original && <p className="text-center text-sm text-[var(--muted-foreground)]">השיר נכתב במיוחד לאתר — מותר להדפיס ולשיר בחופשיות.</p>}
    </div>
    {sheet}
    <div className="no-print mt-4 text-center"><button type="button" className="music-chip" onClick={() => window.print()}>🖨️ הדפסת דף המילים</button></div>
    <div className="no-print">
      <section className="mt-8"><h2 className="text-2xl font-black mb-2">תנועות מוצעות</h2>
        <ul className="list-disc pr-6 space-y-1">{s.moves.map((m, i) => <li key={i}>{m}</li>)}</ul></section>
      <section className="mt-6"><h2 className="text-2xl font-black mb-2">איך שרים בצורה רגועה</h2><p className="leading-relaxed">{s.calm}</p></section>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">💡 {s.fact}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {s.pianoSlug && <Link className="music-chip" to={`/music/songs/${s.pianoSlug}`}>🎹 ללמוד את המנגינה בפסנתר ←</Link>}
        <Link className="music-chip" to={babySongPath(next)}>הבא: {next.title} ←</Link>
        <Link className="music-chip" to={g.path}>כל {g.crumb} ←</Link>
      </div>
      <div className="mt-10"><SeoBody paragraphs={[`"${s.title}" — ${s.source}. שרים לאט, בקול רך, וממשיכים לפי הקצב של הילד.`, 'ילד לא צריך שיר מושלם — הוא צריך קול מוכר, מגע ותשומת לב. אפשר לקצר או להאריך את השיר לפי מצב הרוח.']} faq={faq} related={[{ label: 'שירי ערש עם מילים', href: '/music/songs/lullabies' }, { label: 'שירים לתינוקות ולפעוטות', href: '/music/songs/babies' }, { label: 'לומדים שירים בפסנתר', href: '/music/songs' }]} /></div>
    </div>
  </div>
}
