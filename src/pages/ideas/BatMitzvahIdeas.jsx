import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import WobblyCard from '../../components/ui/WobblyCard'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import {
  BAT_MITZVAH_PATH, INTRO, FORMATS, PROJECTS, THEMES, SPEECH_TIPS, BUDGET_TIPS, TIMELINE, FAQ, RELATED,
} from '../../data/batMitzvahIdeas'

const TOC = [
  ['formats', 'סוגי חגיגה'], ['project', 'פרויקט בת מצווה'], ['themes', 'נושאי עיצוב'],
  ['speech', 'ברכות ונאום'], ['budget', 'תקציב'], ['timeline', 'לוח זמנים'],
]

const H2 = ({ id, children }) => <h2 id={id} className="mb-4 scroll-mt-24 text-3xl">{children}</h2>

export default function BatMitzvahIdeas() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="רעיונות לבת מצווה — חגיגה, פרויקט, עיצוב ולוח זמנים" description="רעיונות לבת מצווה: מסיבה, טיול משפחתי, ערב נשים או יום כיף עם החברות, פרויקט בת מצווה, נושאי עיצוב, נאום, תקציב וצ׳ק ליסט מחצי שנה לפני." path={BAT_MITZVAH_PATH} structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'השראה', href: '/ideas' }, { label: 'רעיונות לבת מצווה' }]} />

      <div className="mb-8 text-center">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--border)] bg-[var(--postit)] text-5xl sketch-shadow-sm" aria-hidden="true">👑</span>
        <h1 className="mt-5 text-4xl sm:text-5xl">רעיונות לבת מצווה</h1>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Badge color="yellow">למשפחות לקראת בת מצווה</Badge>
          <Badge color="blue">לכל תקציב</Badge>
        </div>
      </div>

      <div className="mx-auto mb-6 max-w-3xl space-y-4">
        {INTRO.map(p => <p key={p.slice(0, 20)} className="text-lg leading-relaxed text-[var(--foreground)]/85">{p}</p>)}
      </div>

      <div className="mx-auto mb-10 max-w-3xl rounded-2xl border-2 border-[var(--border)] bg-[var(--postit)] p-4 text-center">
        <p className="m-0 font-bold">מתי בדיוק בת המצווה? 🗓️</p>
        <p className="m-0 mt-1">בת המצווה נקבעת לפי התאריך העברי. ב<Link to="/tools/hebrew-birthday" className="font-bold underline">מחשבון יום ההולדת העברי</Link> אפשר לראות באיזה תאריך לועזי היא חלה ואיזו שבת קרובה אליה.</p>
      </div>

      <nav aria-label="תוכן העמוד" className="mb-10 flex flex-wrap justify-center gap-2">
        {TOC.map(([id, label]) => <a key={id} href={`#${id}`} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{label}</a>)}
      </nav>

      <section className="mb-12">
        <H2 id="formats">סוגי חגיגה — מה מתאים לבת שלכם?</H2>
        <div className="grid gap-5">
          {FORMATS.map((f, i) => (
            <WobblyCard key={f.id} hover={false} className={i % 2 ? 'rotate-[0.3deg]' : '-rotate-[0.3deg]'}>
              <h3 className="mb-2 text-2xl"><span aria-hidden="true">{f.emoji} </span>{f.title}</h3>
              <p className="text-lg leading-relaxed text-[var(--foreground)]/85">{f.body}</p>
              <p className="mt-2"><strong>מתאים במיוחד:</strong> {f.good}</p>
              <p className="mt-1 text-[var(--foreground)]/80"><strong>טיפ:</strong> {f.tip}</p>
            </WobblyCard>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <H2 id="project">פרויקט בת מצווה</H2>
        <p className="mb-5 text-lg leading-relaxed text-[var(--foreground)]/85">פרויקט נותן לבת המצווה משמעות שנשארת גם אחרי החגיגה. הכי חשוב: שהבת תבחר אותו בעצמה ושהוא יתאים למה שמעניין אותה.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {PROJECTS.map(p => (
            <div key={p.title} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4">
              <h3 className="mb-1 text-xl font-bold"><span aria-hidden="true">{p.emoji} </span>{p.title}</h3>
              <p className="leading-relaxed text-[var(--foreground)]/85">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <H2 id="themes">נושאי עיצוב</H2>
        <div className="grid gap-3 sm:grid-cols-2">
          {THEMES.map(t => (
            <div key={t.title} className="flex gap-3 rounded-2xl border-2 border-dashed border-[var(--border)] p-3">
              <span className="text-3xl" aria-hidden="true">{t.emoji}</span>
              <div><h3 className="m-0 text-lg font-bold">{t.title}</h3><p className="m-0 leading-relaxed text-[var(--foreground)]/85">{t.body}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <H2 id="speech">ברכות ונאום</H2>
        <WobblyCard hover={false}>
          <ul className="grid gap-3 text-lg leading-relaxed">
            {SPEECH_TIPS.map(t => <li key={t}>• {t}</li>)}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/greetings/bat-mitzvah" className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-3 py-2 font-bold">👑 ברכות לבת מצווה להעתקה</Link>
            <Link to="/greeting" className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">✍️ מחולל ברכות אישיות</Link>
          </div>
        </WobblyCard>
      </section>

      <section className="mb-12">
        <H2 id="budget">איך לא לחרוג מהתקציב</H2>
        <div className="wobbly relative border-2 border-[var(--border)] bg-[var(--postit)] p-6 sketch-shadow">
          <ul className="grid gap-3 font-hand text-lg">
            {BUDGET_TIPS.map(t => <li key={t}>• {t}</li>)}
          </ul>
          <p className="mt-4">רוצים מספרים? ב<Link to="/calculator/birthday-cost" className="font-bold underline">מחשבון עלות המסיבה</Link> אפשר להעריך את העלות לפי מספר האורחים.</p>
        </div>
      </section>

      <section className="mb-12">
        <H2 id="timeline">צ׳ק ליסט: מחצי שנה לפני ועד היום עצמו</H2>
        <ol className="relative space-y-5 border-r-4 border-dashed border-[var(--border)] pr-5">
          {TIMELINE.map(step => (
            <li key={step.when}>
              <h3 className="mb-2 text-xl font-bold text-[var(--pen)]">{step.when}</h3>
              <ul className="grid gap-1">
                {step.items.map(it => <li key={it} className="flex gap-2"><span aria-hidden="true">☐</span><span>{it}</span></li>)}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <SeoBody faq={FAQ} related={RELATED} />
    </div>
  )
}
