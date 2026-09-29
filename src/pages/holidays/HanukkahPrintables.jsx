import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import { HANUKKAH_ART } from '../../components/hanukkah/HanukkahArt'
import { HANUKKAH_SHEETS } from '../../components/hanukkah/HanukkahSheets'

const COPY = {
  coloring: {
    list: HANUKKAH_ART, crumb: 'דפי צביעה', path: '/holidays/hanukkah/coloring',
    title: 'דפי צביעה לחנוכה — להדפסה בחינם', h1: '🖍️ דפי צביעה לחנוכה',
    desc: 'דפי צביעה לחנוכה להדפסה בחינם: חנוכייה, סביבון, סופגניות, פך השמן, שמונה נרות ו"חנוכה שמח" — קווים עבים וברורים לגן ולבית הספר, דף A4 לכל ציור.',
    sub: '6 ציורים · קווים עבים · דף A4 לכל ציור',
    body: ['דפי הצביעה לחנוכה צוירו במיוחד לעוגה בוגה — קווים עבים ושטחים גדולים, כך שגם ילדי גן יכולים לצבוע בלי לצאת מהקווים. אפשר להדפיס ציור אחד או את כולם יחד.', 'רעיון לגן: להדפיס את החנוכייה לכל ילד, ובכל יום של החג לצבוע עוד נר — עד שבערב השמיני כל החנוכייה צבועה.'],
    faq: [{ q: 'כמה דפי צביעה לחנוכה יש כאן?', a: '6 ציורים: חנוכייה, סביבון, סופגניות, פך השמן, שמונה נרות ו"חנוכה שמח". כולם בחינם, בלי הרשמה.' }, { q: 'איך מדפיסים?', a: 'לוחצים על ציור כדי להדפיס אותו, או על "הדפיסו את כל הדפים". כל ציור ממלא דף A4.' }],
  },
  worksheets: {
    list: HANUKKAH_SHEETS, crumb: 'דפי עבודה', path: '/holidays/hanukkah/worksheets',
    title: 'דפי עבודה לחנוכה לגן ולכיתה א׳ — להדפסה', h1: '✏️ דפי עבודה לחנוכה',
    desc: 'דפי עבודה לחנוכה לגן ולכיתה א׳: ספירת נרות בחנוכייה, חשבון סופגניות, מעקב על מילים של חנוכה והתאמת אותיות הסביבון — להדפסה בחינם.',
    sub: 'ספירה · חשבון · כתיבה · התאמה — לגן ולכיתה א׳',
    body: ['דפי העבודה לחנוכה משלבים את החג עם מה שהילדים לומדים בגן ובכיתה א׳: ספירה עד 8, חיבור עד 10 עם ציורים, כתיבת מילים בכתב דפוס והיכרות עם אותיות הסביבון.', 'אפשר להדפיס דף אחד או את כל הדפים יחד, ולצרף אליהם את דפי הצביעה לחוברת חנוכה קטנה.'],
    faq: [{ q: 'לאיזה גיל מתאימים דפי העבודה?', a: 'לגן חובה ולכיתה א׳. דף הספירה ודף ההתאמה מתאימים גם לגן טרום־חובה עם עזרה.' }, { q: 'יש עוד דפי עבודה?', a: 'בעוגה בוגה יש גם דפי חשבון לכיתה א׳ שנוצרים מחדש בכל לחיצה, ודפי כתיבה לכל אות.' }],
  },
}

export default function HanukkahPrintables({ kind }) {
  const c = COPY[kind]
  const [print, setPrint] = useState(null)
  return (
    <HanukkahShell crumb={c.crumb}>
      <SEO title={c.title} description={c.desc} path={c.path} structuredData={faqSchema(c.faq)} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2">{c.h1}</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-5">{c.sub}</p>
      <div className="mb-6 text-center">
        <button type="button" onClick={() => setPrint(c.list)} className="min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">🖨️ הדפיסו את כל {c.list.length} הדפים</button>
      </div>
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {c.list.map(item => <button key={item.id} type="button" onClick={() => setPrint([item])} aria-label={`הדפיסו: ${item.name}`}
          className="rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
          <div className="aspect-[600/820]"><item.C /></div>
          <p className="mt-1 font-bold">{item.name}{item.age ? <span className="font-normal text-sm"> · {item.age}</span> : null}</p>
        </button>)}
      </div>
      <SeoBody paragraphs={c.body} faq={c.faq} related={[{ label: kind === 'coloring' ? 'דפי עבודה לחנוכה' : 'דפי צביעה לחנוכה', href: kind === 'coloring' ? '/holidays/hanukkah/worksheets' : '/holidays/hanukkah/coloring' }, { label: 'חידון חנוכה', href: '/holidays/hanukkah/quiz' }, { label: 'סביבון וירטואלי', href: '/holidays/hanukkah/sevivon' }]} />
      {print && <PrintPreview title={c.h1.slice(3)} onClose={() => setPrint(null)}>{print.map(item => <article className="buga-a4" key={item.id}><div className="print-art"><item.C /></div></article>)}</PrintPreview>}
    </HanukkahShell>
  )
}
