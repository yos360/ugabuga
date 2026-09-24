import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import WobblyCard from '../../components/ui/WobblyCard'
import { PARTY_KITS } from '../../data/ideaArticlesExpanded'

export default function ThemePage() {
  const { slug } = useParams()
  const theme = PARTY_KITS[slug]
  if (!theme) {
    const themes = Object.entries(PARTY_KITS).slice(0, 8)
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center buga-fade-in">
        <SEO title="רעיונות לפי נושא" description="בחרו נושא פעיל למסיבה, יום הולדת או פעילות." path="/ideas" noindex />
        <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'השראה', href: '/ideas' }, { label: 'נושאים' }]} />
        <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-8 sketch-shadow-rich">
          <h1 className="text-4xl mb-3">🎭 הנושא הזה לא נמצא</h1>
          <p className="mx-auto max-w-xl text-lg text-[var(--foreground)]/75 mb-6">יכול להיות שזה קישור ישן. בחרו נושא קיים או חזרו לעולם ההשראה.</p>
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            <Link to="/ideas" className="wobbly-sm border-2 border-[var(--border)] bg-[var(--accent)] px-5 py-3 font-display text-xl font-bold text-white">כל הרעיונות</Link>
            <Link to="/ideas/themes" className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-5 py-3 font-display text-xl font-bold">כל הנושאים</Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {themes.map(([key, item]) => (
              <Link key={key} to={'/ideas/themes/'+key} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-hand text-lg underline decoration-dashed hover:bg-[var(--postit)]">{item.emoji} {item.name}</Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in">
      <SEO title={theme.name} description={theme.desc} path={'/ideas/themes/'+slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'השראה', href: '/ideas' }, { label: theme.name }]} />

      <div className="text-center mb-8">
        <span className="inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--border)] bg-[var(--postit)] text-6xl sketch-shadow-sm">{theme.emoji}</span>
        <h1 className="mt-5 text-4xl sm:text-5xl">{theme.name}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-xl text-[var(--muted-foreground)]">{theme.desc}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Badge>גיל {theme.age}</Badge>
          <Badge color="yellow">תקציב {theme.budget}</Badge>
          {theme.colors.map(color => <Badge key={color} color="blue">{color}</Badge>)}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {theme.sections.map((section, index) => (
          <WobblyCard key={section.title} hover={false} className={index % 2 ? 'rotate-[0.4deg]' : '-rotate-[0.4deg]'}>
            <h2 className="text-2xl mb-4">{section.title}</h2>
            <ul className="grid gap-3 text-lg leading-relaxed">
              {section.items.map(item => <li key={item}>• {item}</li>)}
            </ul>
          </WobblyCard>
        ))}
      </div>

      <div className="wobbly relative mt-8 border-2 border-[var(--border)] bg-[var(--postit)] p-6 text-center sketch-shadow pin">
        <h2 className="text-2xl mb-2">רוצים להפוך את זה למסיבה מלאה?</h2>
        <p className="mx-auto mb-5 max-w-2xl text-lg text-[var(--foreground)]/80">בחרו משחקים מהמאגר, הוסיפו דפים להדפסה, וסגרו לו״ז קצר. הערכה הזו בנויה להיות נקודת פתיחה שאפשר להתאים לגיל, מקום ותקציב.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/games" className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[var(--accent)] px-5 py-2 font-display text-lg font-bold text-[var(--accent-foreground)]">משחקים מתאימים</Link>
          <Link to="/printables" className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-white px-5 py-2 font-display text-lg font-bold">הדפסות למסיבה</Link>
        </div>
      </div>
    </div>
  )
}
