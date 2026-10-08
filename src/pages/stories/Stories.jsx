import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import {
  BEDTIME_STORIES, STORY_AGES, STORY_THEMES, MAX_NAME, cleanName, renderStory, storyWords, readingMinutes,
  ageLabel, themeOf, relatedStories,
} from '../../data/bedtimeStories'
import '../../learn/learn.css'
import './stories.css'

const HUB = { label: 'סיפורים לפני השינה', href: '/stories' }
const SAVED_KEY = 'ugabuga-story-hero' // per-viewer convenience only: the child's name + gender
const SITE = 'https://ugabuga.co.il'

function loadSavedHero() {
  try { const v = JSON.parse(localStorage.getItem(SAVED_KEY) || 'null'); return v && typeof v === 'object' ? { name: cleanName(v.name), g: v.g === 'f' ? 'f' : v.g === 'm' ? 'm' : '' } : null } catch { return null }
}
function saveHero(hero) {
  try { if (hero?.name || hero?.g) localStorage.setItem(SAVED_KEY, JSON.stringify({ name: cleanName(hero.name), g: hero.g })); else localStorage.removeItem(SAVED_KEY) } catch { /* storage blocked */ }
}

const Chip = ({ on, onClick, children, ...rest }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick} {...rest}>{children}</button>

function Badges({ s, minutes }) {
  const t = themeOf(s.theme)
  return <div className="st-badges">
    <span className="st-badge age">👶 {ageLabel(s.age)}</span>
    <span className="st-badge time">⏱️ {minutes} דק׳ קריאה</span>
    <span className="st-badge theme">{t.emoji} {t.label}</span>
  </div>
}

function StoryCard({ s, custom }) {
  const r = renderStory(s, custom)
  return <Link to={`/stories/${s.slug}`} className="wobbly card-lift border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow p-4 text-right">
    <div className="st-card">
      <div className="text-4xl" aria-hidden="true">{s.emoji}</div>
      <h3 className="text-xl font-bold leading-snug">{r.title}</h3>
      <p className="m-0 text-[var(--muted-foreground)]">{r.summary}</p>
      <div className="mt-auto pt-2"><Badges s={s} minutes={readingMinutes(storyWords(s, custom))} /></div>
    </div>
  </Link>
}

// ── /stories ───────────────────────────────
const HUB_FAQ = [
  { q: 'אילו סיפורים מתאימים לפני השינה?', a: 'סיפורים קצרים, רגועים ועם סוף שקט. כל הסיפורים כאן נכתבו במיוחד לרגע שלפני השינה: בלי מתח גדול ובלי דמויות מפחידות, עם קצב שמאט לקראת הסוף ומשפט אחרון של לילה טוב.' },
  { q: 'אפשר שהילד יהיה הגיבור של הסיפור?', a: 'כן. כותבים את שם הילד או הילדה ובוחרים בן או בת — והסיפור משתנה בהתאם, כולל כל הפעלים וכינויי הגוף. בחלק מהסיפורים אפשר לתת שם גם לחבר, לאח או לחיית המחמד. השם נשמר רק בדפדפן שלכם.' },
  { q: 'כמה זמן לוקח לקרוא סיפור?', a: 'כל סיפור הוא בין 350 ל־600 מילים, כלומר כ־4 דקות של הקראה רגועה. ליד כל סיפור מופיע זמן הקריאה המשוער.' },
  { q: 'אפשר להדפיס את הסיפורים?', a: 'כן. בכל סיפור יש כפתור הדפסה שמכין דף נקי ומסודר, בלי פרסומות ובלי תפריטים — כולל השם שבחרתם. אפשר גם לשמור כ־PDF.' },
  { q: 'לאיזה גיל מתאימים הסיפורים?', a: 'יש סיפורים לגילאי 3–5 (קצרים ופשוטים, עם חזרות), לגילאי 5–7 ולגילאי 7–9 (עלילה קצת יותר עשירה). אפשר לסנן לפי גיל ולפי נושא.' },
]

export function StoriesHub() {
  const [age, setAge] = useState('')
  const [theme, setTheme] = useState('')
  const [hero, setHero] = useState(() => loadSavedHero() || { name: '', g: '' })
  const setHeroSave = h => { setHero(h); saveHero(h) }
  const custom = hero.name || hero.g ? { hero: { name: hero.name, g: hero.g } } : undefined
  const list = BEDTIME_STORIES.filter(s => (!age || s.age === age) && (!theme || s.theme === theme))
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="סיפורים לפני השינה לילדים — 30 סיפורים קצרים, גם עם שם הילד" description="ספריית סיפורים לפני השינה לילדים: 30 סיפורים מקוריים וקצרים בעברית לגילאי 3–9, לפי גיל ונושא. סיפור אישי עם שם הילד, זמן קריאה, מסר קטן והדפסה נקייה. חינם." path="/stories" structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: HUB.label }]} />
    <header className="text-center">
      <span className="inline-flex rounded-full bg-indigo-100 px-4 py-2 font-bold text-[#1d2233]">{BEDTIME_STORIES.length} סיפורים מקוריים · חינם</span>
      <h1 className="mt-3 text-4xl sm:text-5xl"><span aria-hidden="true">🌙 </span>סיפורים לפני השינה לילדים</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">סיפורים קצרים, חמים ורגועים לקריאה לפני השינה — על חברות, חיות, משפחה, פחדים קטנים ודמיון גדול. כל סיפור נגמר בשקט, בדיוק כשהעיניים נעצמות.</p>
    </header>

    <section className="ln-box st-panel mx-auto mt-6 max-w-3xl space-y-3 text-center" aria-labelledby="hub-name">
      <h2 id="hub-name" className="text-2xl font-black">✨ סיפור אישי עם שם הילד</h2>
      <p className="m-0">כתבו את השם ובחרו בן או בת — וכל הסיפורים יסופרו עם הילד שלכם בתפקיד הראשי.</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <input className="st-input" value={hero.name} maxLength={MAX_NAME} placeholder="שם הילד/ה" aria-label="שם הילד/ה" onChange={e => setHeroSave({ ...hero, name: e.target.value })} />
        <Chip on={hero.g === 'm'} onClick={() => setHeroSave({ ...hero, g: 'm' })}>👦 בן</Chip>
        <Chip on={hero.g === 'f'} onClick={() => setHeroSave({ ...hero, g: 'f' })}>👧 בת</Chip>
        {(hero.name || hero.g) && <button type="button" className="ln-chip" onClick={() => setHeroSave({ name: '', g: '' })}>↺ איפוס</button>}
      </div>
      <small className="block text-[var(--muted-foreground)]">השם נשמר רק בדפדפן שלכם ולא נשלח לשום מקום.</small>
    </section>

    <section className="no-print mt-6 space-y-3" aria-label="סינון סיפורים">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="גיל">
        <Chip on={!age} onClick={() => setAge('')}>כל הגילים</Chip>
        {STORY_AGES.map(a => <Chip key={a.id} on={age === a.id} onClick={() => setAge(a.id)}>{a.label}</Chip>)}
      </div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="נושא">
        <Chip on={!theme} onClick={() => setTheme('')}>כל הנושאים</Chip>
        {STORY_THEMES.map(t => <Chip key={t.id} on={theme === t.id} onClick={() => setTheme(t.id)}><span aria-hidden="true">{t.emoji}</span> {t.label}</Chip>)}
      </div>
    </section>

    <h2 className="mt-8 mb-4 text-center text-2xl font-black">{list.length === BEDTIME_STORIES.length ? 'כל הסיפורים' : `${list.length} סיפורים`}</h2>
    {list.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(s => <StoryCard key={s.slug} s={s} custom={custom} />)}</div>
      : <p className="text-center">אין עדיין סיפור שמתאים לשני הסינונים יחד. <button type="button" className="underline font-bold" onClick={() => { setAge(''); setTheme('') }}>הצגת כל הסיפורים</button></p>}

    <div className="ln-box mt-10 text-center">
      <h2 className="text-2xl font-black">🪄 רוצים סיפור קצר עם השם ועם חיה שבוחרים?</h2>
      <p className="mt-2">במחולל <Link to="/family/bedtime-story" className="font-bold underline">סיפור לפני השינה עם השם של הילד</Link> בוחרים חבר מחיות — כלבלב, ארנבון או דרקון קטן — ומקבלים סיפור קצר ומרגיע.</p>
    </div>

    <div className="mt-10"><SeoBody paragraphs={[
      'סיפור לפני השינה הוא אחד הרגעים הכי שקטים וקרובים ביום: האור כבר נמוך, השמיכה חמימה, וההורה והילד יחד, בלי מסכים. בספרייה הזאת יש 30 סיפורים לילדים שנכתבו במיוחד לרגע הזה — קצרים מספיק כדי להיגמר לפני שהעיניים נעצמות, ורגועים מספיק כדי לא להעיר אותן מחדש.',
      'כל סיפור מתאים לטווח גילים מסוים: לגילאי 3–5 יש סיפורים פשוטים עם חזרות וקצב איטי, לגילאי 5–7 עלילה קצת יותר מפותחת, ולגילאי 7–9 סיפורים עם רגש ומחשבה, שאפשר לדבר עליהם אחרי הקריאה. בסוף כל סיפור יש "מסר" קצר — רעיון אחד לשיחה, בלי הטפה.',
      'הנושאים מגוונים: חברות ושיתוף, חיות וטבע, משפחה, פחד מהחושך ומרעמים, דמיון, וגם חגים ועונות — סוכות, חנוכה והגשם הראשון. וכל סיפור יכול להפוך לסיפור אישי: כותבים את שם הילד, בוחרים בן או בת, והסיפור מתאים את עצמו.',
    ]} faq={HUB_FAQ} related={[{ label: 'סיפור לפני השינה עם השם של הילד', href: '/family/bedtime-story' }, { label: 'בבית עם הילדים', href: '/family' }, { label: 'הבנת הנקרא', href: '/learn/reading' }, { label: 'דפי צביעה', href: '/printables/coloring' }]} /></div>
  </div>
}

// ── /stories/:slug ───────────────────────────────
const PARAM = { hero: ['hero', 'hg'], friend: ['friend', 'fg'], pet: ['pet', 'pg'] }

export function StoryPage() {
  const { slug } = useParams()
  const story = BEDTIME_STORIES.find(s => s.slug === slug)
  const [params] = useSearchParams()
  if (!story) return <NotFound />
  // Remount per story and per share link, so the panel starts fresh from the link or the saved name.
  return <Story key={`${slug}?${params.toString()}`} story={story} params={params} />
}

// Start from the share link (?hero=…&hg=f…) if there is one, otherwise from the child's name saved in this browser.
function initialCast(story, params) {
  const next = {}
  let fromLink = false
  for (const k of Object.keys(story.chars)) {
    const [pn, pg] = PARAM[k] || [k, k + 'g']
    const name = cleanName(params.get(pn)), g = params.get(pg)
    if (name || g) { fromLink = true; next[k] = { name, g: g === 'f' ? 'f' : g === 'm' ? 'm' : '' } }
  }
  if (!fromLink) { const h = loadSavedHero(); if (h) next.hero = h }
  return next
}

function Story({ story, params }) {
  const [custom, setCustom] = useState(() => initialCast(story, params))
  const [big, setBig] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [copied, setCopied] = useState('')
  const r = useMemo(() => renderStory(story, custom), [story, custom])

  const set = (k, patch) => {
    const next = { ...custom, [k]: { name: '', g: '', ...custom[k], ...patch } }
    setCustom(next)
    if (k === 'hero') saveHero(next.hero)
  }
  const reset = () => { setCustom({}); saveHero(null) }
  const words = storyWords(story)
  const minutes = readingMinutes(words)
  const defaults = renderStory(story)
  const heroName = cleanName(custom.hero?.name)
  const personalized = Object.values(custom).some(c => c?.name || c?.g)
  const shareUrl = () => {
    const q = new URLSearchParams()
    for (const k of Object.keys(story.chars)) { const [pn, pg] = PARAM[k] || [k, k + 'g']; const c = custom[k]; if (c?.name) q.set(pn, cleanName(c.name)); if (c?.g && story.chars[k].gendered) q.set(pg, c.g) }
    const s = q.toString()
    return `${SITE}/stories/${story.slug}${s ? '?' + s : ''}`
  }
  const copyLink = async () => {
    const url = shareUrl()
    try { await navigator.clipboard.writeText(url); setCopied('הקישור הועתק — אפשר לשלוח לסבא, לסבתא או לגננת.') } catch { setCopied(url) }
  }
  const related = relatedStories(story)
  const t = themeOf(story.theme)
  const faq = [
    { q: `לאיזה גיל מתאים הסיפור "${defaults.title}"?`, a: `הסיפור נכתב ל${ageLabel(story.age)}, אבל ילדים קטנים או גדולים יותר ייהנו ממנו גם. הוא באורך של ${words} מילים — כ־${minutes} דקות של הקראה רגועה.` },
    { q: 'איך הופכים את הסיפור לסיפור אישי עם שם הילד?', a: 'בתיבה "הסיפור שלכם" כותבים את השם ובוחרים בן או בת. הסיפור מתעדכן מיד — כולל הפעלים וכינויי הגוף — וגם הגרסה המודפסת יוצאת עם השם. השמות לא נשלחים לשום מקום.' },
    { q: 'מה המסר של הסיפור?', a: story.moral },
  ]
  const schema = [faqSchema(faq), {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'name': defaults.title,
    'headline': defaults.title,
    'description': defaults.summary,
    'genre': 'סיפור לפני השינה',
    'about': t.label,
    'inLanguage': 'he',
    'typicalAgeRange': story.age,
    'wordCount': words,
    'timeRequired': `PT${minutes}M`,
    'isAccessibleForFree': true,
    'url': `${SITE}/stories/${story.slug}`,
    'author': { '@type': 'Organization', 'name': 'UGABUGA' },
    'publisher': { '@type': 'Organization', 'name': 'UGABUGA', 'logo': { '@type': 'ImageObject', 'url': `${SITE}/og-image.png` } },
    'isPartOf': { '@type': 'CollectionPage', 'name': 'סיפורים לפני השינה לילדים', 'url': `${SITE}/stories` },
  }]
  const printTitle = heroName ? `סיפור לפני השינה של ${heroName}` : 'סיפור לפני השינה'

  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`${defaults.title} — סיפור לפני השינה ל${ageLabel(story.age)}`} description={`${defaults.summary} סיפור קצר לפני השינה (${minutes} דק׳), עם מסר קטן, הדפסה — ואפשר גם עם שם הילד.`} path={`/stories/${story.slug}`} type="article" structuredData={schema} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, HUB, { label: defaults.title }]} />
    <header className="text-center">
      <div className="text-5xl" aria-hidden="true">{story.emoji}</div>
      <h1 className="mt-2 text-4xl sm:text-5xl">{r.title}</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">{r.summary}</p>
      <div className="mt-3 flex justify-center"><Badges s={story} minutes={minutes} /></div>
    </header>

    <section className="ln-box st-panel no-print mt-6 space-y-3" aria-labelledby="your-story">
      <h2 id="your-story" className="text-2xl font-black text-center">✨ הסיפור שלכם</h2>
      <p className="m-0 text-center">כתבו שם ובחרו {Object.values(story.chars).some(c => c.gendered && !c.animal) ? 'בן או בת' : 'זכר או נקבה'} — הסיפור ישתנה מיד.</p>
      {Object.entries(story.chars).map(([k, c]) => {
        const g = custom[k]?.g || c.g
        const [m, f] = c.animal ? ['זכר', 'נקבה'] : ['👦 בן', '👧 בת']
        return <div key={k} className="flex flex-wrap items-center justify-center gap-2">
          <label htmlFor={`name-${k}`}>שם {c.role}:</label>
          <input id={`name-${k}`} className="st-input" value={custom[k]?.name || ''} maxLength={MAX_NAME} placeholder={c.name} onChange={e => set(k, { name: e.target.value })} />
          {c.gendered && <span className="flex gap-2" role="group" aria-label={`מין — ${c.role}`}><Chip on={g === 'm'} onClick={() => set(k, { g: 'm' })}>{m}</Chip><Chip on={g === 'f'} onClick={() => set(k, { g: 'f' })}>{f}</Chip></span>}
        </div>
      })}
      <div className="flex flex-wrap justify-center gap-2">
        {personalized && <button type="button" className="ln-chip" onClick={reset}>↺ חזרה לשמות המקוריים</button>}
        {personalized && <button type="button" className="ln-chip" onClick={copyLink}>🔗 קישור לסיפור עם השמות</button>}
      </div>
      {copied && <p className="m-0 text-center text-sm break-all" role="status">{copied}</p>}
      <small className="block text-center text-[var(--muted-foreground)]">השמות נשמרים רק בדפדפן שלכם ולא נשלחים לשום מקום.</small>
    </section>

    <div className="no-print mt-5 flex flex-wrap justify-center gap-2">
      <button type="button" className="ln-btn" onClick={() => setPrinting(true)}>🖨️ הדפסת הסיפור</button>
      <Chip on={big} onClick={() => setBig(!big)}>🔍 אותיות גדולות</Chip>
    </div>

    <article className="st-night mt-5" aria-labelledby="story-title">
      <h2 id="story-title" className="mb-4 text-center text-3xl font-black">{story.emoji} {r.title}</h2>
      <div className={`st-text ${big ? 'is-big' : ''}`}>{r.body.map((p, i) => <p key={i}>{p}</p>)}</div>
      <p className="mt-2 text-center text-2xl" aria-hidden="true">✨ 🌙 ✨</p>
    </article>

    <aside className="st-moral mt-5"><h2 className="text-xl font-black">💡 המסר</h2><p className="m-0 text-lg">{r.moral}</p></aside>

    {printing && <PrintPreview title={heroName ? `${r.title} — ${printTitle}` : r.title} onClose={() => setPrinting(false)}>
      <article className="buga-flow st-print" dir="rtl">
        <p className="st-print-sub">{printTitle} · {ageLabel(story.age)}</p>
        <h2>{r.title}</h2>
        {r.body.map((p, i) => <p key={i}>{p}</p>)}
        <p style={{ textAlign: 'center' }}>~ לילה טוב ~</p>
        <p className="st-print-moral"><b>המסר:</b> {r.moral}</p>
      </article>
    </PrintPreview>}

    <section className="no-print mt-10">
      <h2 className="mb-4 text-center text-2xl font-black">עוד סיפורים לפני השינה</h2>
      <div className="grid gap-4 sm:grid-cols-3">{related.map(s => <StoryCard key={s.slug} s={s} custom={custom.hero ? { hero: custom.hero } : undefined} />)}</div>
      <p className="mt-4 text-center"><Link to="/stories" className="font-bold underline">לכל {BEDTIME_STORIES.length} הסיפורים ←</Link></p>
    </section>

    <div className="mt-10"><SeoBody paragraphs={[
      `"${defaults.title}" הוא סיפור מקורי לפני השינה ל${ageLabel(story.age)}, בנושא ${t.label}. ${defaults.summary}`,
      'הסיפור כתוב בעברית פשוטה וחמה, בקצב שמאט לקראת הסוף, כך שהוא מתאים להקראה בקול רגוע במיטה. אפשר להפוך אותו לסיפור אישי עם שם הילד, להגדיל את האותיות לקריאה עצמית, או להדפיס דף נקי עם השם שבחרתם.',
    ]} faq={faq} related={[HUB, { label: 'סיפור לפני השינה עם השם של הילד', href: '/family/bedtime-story' }, { label: 'בבית עם הילדים', href: '/family' }]} /></div>
  </div>
}
