import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import HanukkahGradeChooser from '../../components/hanukkah/HanukkahGradeChooser'
import { gradeSet, PrintItem } from '../../components/hanukkah/HanukkahGradeSheets'
import { hanukkahGrade } from '../../data/hanukkahGrades'
import { hanukkahGradePath } from '../../data/hanukkahGradeList'
import { hanukkahProblems, MATH_LEVEL } from '../../data/hanukkahGradeMath'
import { HANUKKAH } from '../../data/hanukkah'
import NotFound from '../NotFound'

const COLORS = ['bg-blue-50', 'bg-yellow-50', 'bg-pink-50', 'bg-green-50']

function Problems({ grade }) {
  const [seed, setSeed] = useState(1)
  const list = useMemo(() => hanukkahProblems(MATH_LEVEL[grade.slug], seed, 4), [grade.slug, seed])
  return <section className="mb-10" aria-labelledby="hg-math">
    <h2 id="hg-math" className="text-2xl font-bold">🧮 בעיות מילוליות של חנוכה {grade.forLabel}</h2>
    <p className="mt-1 text-[var(--muted-foreground)]">ארבע דוגמאות מתוך הדף. לחצו על שאלה כדי לראות את התשובה, או קבלו בעיות חדשות.</p>
    <ol className="mt-3 grid gap-3 sm:grid-cols-2">
      {list.map((p, i) => <li key={`${seed}-${i}`} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <details><summary className="cursor-pointer leading-relaxed"><b className="ml-1">{i + 1}.</b>{p.q}</summary><p className="mt-2 font-bold text-emerald-800">תשובה: {p.answer}</p></details>
      </li>)}
    </ol>
    <button type="button" onClick={() => setSeed(s => s + 1)} className="mt-3 min-h-[44px] rounded-2xl border-2 border-slate-800 bg-white px-5 font-bold">🎲 בעיות אחרות</button>
  </section>
}

function Reading({ grade }) {
  const r = grade.reading, young = grade.slug === 'kindergarten'
  return <section className="mb-10 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5" aria-labelledby="hg-read">
    <h2 id="hg-read" className="text-2xl font-bold">{r.emoji} {young ? 'סיפור להקראה' : 'קטע קריאה'}: {r.title}</h2>
    <p className="text-sm text-[var(--muted-foreground)]">{r.kind} · {grade.label}</p>
    <div className={`mt-3 space-y-3 leading-relaxed ${young ? 'text-xl' : 'text-lg'}`}>{r.text.map((p, i) => <p key={i}>{p}</p>)}</div>
    <h3 className="mt-4 text-xl font-bold">{young ? 'שאלות לשיחה במפגש' : 'שאלות על הקטע'}</h3>
    <ol className="mt-2 list-decimal space-y-2 pr-6">
      {r.q.map(([q, opts, c]) => <li key={q}><details><summary className="cursor-pointer font-bold">{q}</summary><p>{opts.join(' · ')}</p><p className="font-bold text-emerald-800">התשובה: {opts[c]}</p></details></li>)}
      {r.open.map(([q, a]) => <li key={q}><details><summary className="cursor-pointer font-bold">{q}</summary><p className="text-emerald-800">{young ? '' : 'תשובה אפשרית: '}{a}</p></details></li>)}
    </ol>
  </section>
}

export default function HanukkahGrade() {
  const { gradeSlug } = useParams()
  const grade = hanukkahGrade(gradeSlug)
  const [seed, setSeed] = useState(1)
  const [print, setPrint] = useState(null)
  const items = useMemo(() => grade ? gradeSet(grade, seed) : [], [grade, seed])
  if (!grade) return <NotFound />
  const all = print === 'all'
  const chosen = all ? items : items.filter(it => it.id === print || it.id === `${print}-answers`)
  const set = (list, s) => list.map(it => <PrintItem key={`${s}-${it.id}`} item={it} />)
  const generated = grade.sheets.some(id => ['problems', 'count-candles', 'donut-math'].includes(id))
  return (
    <HanukkahShell crumb={grade.label}>
      <SEO title={grade.seoTitle} description={grade.seoDesc} path={hanukkahGradePath(grade.slug)} structuredData={faqSchema(grade.faq)} />
      <div className="mb-6 rounded-3xl border-2 border-slate-800 bg-gradient-to-b from-blue-700 to-indigo-900 p-6 text-center text-white sketch-shadow">
        <p className="mb-1 text-5xl" aria-hidden="true">🕎 {grade.emoji}</p>
        <h1 className="mb-2 text-4xl text-white sm:text-5xl">{grade.h1}</h1>
        <p className="font-hand text-lg text-blue-100">{grade.sub}</p>
        <p className="mt-1 text-sm text-blue-100">חנוכה {HANUKKAH.year}: נר ראשון ביום שישי 4.12 בערב</p>
        <button data-print-main type="button" onClick={() => setPrint('all')} className="mt-4 min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">🖨️ הדפיסו את כל הסט</button>
        <p className="mt-1 text-sm text-blue-100">{items.filter(it => !it.id.endsWith('-answers')).length} דפי עבודה ופעילות, עם דפי תשובות</p>
      </div>

      <div className="mb-8 max-w-3xl space-y-3 text-lg leading-relaxed">{grade.intro.map(p => <p key={p}>{p}</p>)}</div>

      <section className="mb-10" aria-labelledby="hg-set">
        <h2 id="hg-set" className="mb-1 text-2xl font-bold">🖨️ מה יש בסט {grade.forLabel}</h2>
        <p className="mb-3 text-[var(--muted-foreground)]">לחצו על דף כדי להדפיס רק אותו{generated ? '. הבעיות והמספרים מתחלפים בכל סט — בחלון ההדפסה אפשר לבחור "לכל הכיתה" ולקבל דף שונה לכל ילד.' : '.'}</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.filter(it => !it.id.endsWith('-answers')).map(it => <button key={it.id} type="button" onClick={() => setPrint(it.id)} aria-label={`הדפיסו: ${it.name}`}
            className="rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
            {it.svg ? <div className="aspect-[600/820]"><it.C /></div>
              : <div className="flex aspect-[600/820] flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="text-5xl" aria-hidden="true">{it.emoji}</span><span className="block w-full space-y-1.5" aria-hidden="true">{[90, 75, 85, 60, 80].map((w, i) => <span key={i} className="mx-auto block h-1.5 rounded bg-slate-300" style={{ width: `${w}%` }} />)}</span></div>}
            <p className="mt-1 font-bold">{it.name}</p>
          </button>)}
        </div>
      </section>

      {MATH_LEVEL[grade.slug] && <Problems grade={grade} />}
      <Reading grade={grade} />

      <section className="mb-10" aria-labelledby="hg-act">
        <h2 id="hg-act" className="text-2xl font-bold">✂️ פעילויות ויצירה {grade.forLabel}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">{grade.activities.map((a, i) => <div key={a.t} className={`rounded-2xl border-2 border-[var(--border)] ${COLORS[i % COLORS.length]} p-4`}><h3 className="text-lg font-bold">{a.t}</h3><p className="mt-1 leading-relaxed">{a.d}</p></div>)}</div>
      </section>

      <section className="mb-10" aria-labelledby="hg-more">
        <h2 id="hg-more" className="text-2xl font-bold">🕯️ עוד לחנוכה {grade.forLabel}</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{grade.links.map(l => <li key={l.href}><Link to={l.href} className="flex min-h-[48px] items-center rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-2 font-bold underline decoration-dashed">{l.label} ←</Link></li>)}</ul>
      </section>

      <HanukkahGradeChooser current={grade.slug} title="חנוכה לכיתות אחרות" />

      <SeoBody faq={grade.faq} related={[{ label: 'חנוכה לילדים', href: '/holidays/hanukkah' }, { label: 'מה עושים בחנוכה', href: '/holidays/hanukkah/what-to-do' }, { label: 'דפי צביעה לחנוכה', href: '/holidays/hanukkah/coloring' }]} />

      {print && <PrintPreview title={`${all ? 'דפי עבודה לחנוכה' : (items.find(it => it.id === print)?.name || 'חנוכה')} ${grade.forLabel}`} onClose={() => setPrint(null)}
        onRefresh={generated ? () => setSeed(s => s + 1) : undefined}
        variant={generated ? i => set(all ? gradeSet(grade, seed + i * 101) : gradeSet(grade, seed + i * 101).filter(it => it.id === print || it.id === `${print}-answers`), seed + i * 101) : undefined}>
        {set(chosen, seed)}
      </PrintPreview>}
    </HanukkahShell>
  )
}
