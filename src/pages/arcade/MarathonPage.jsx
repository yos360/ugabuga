import { lazy, Suspense, useCallback, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { arcadeGame } from '../../arcade/registry'
import { MARATHON_STAGES, MARATHON_LENGTH, SKIP_PENALTY, clock } from '../../arcade/marathon'
import { enterFullscreen } from '../../arcade/stage'
import { useProgress } from '../../arcade/hooks'
import '../../arcade/arcade.css'

const MarathonStage = lazy(() => import('../../arcade/MarathonStage'))

// /online-games/marathon — 8 games in a row, each stage a quick goal, against the clock.
export default function MarathonPage() {
  const [progress] = useProgress('marathon', { best: 0, runs: 0 })
  const { hash } = useLocation()
  const navigate = useNavigate()
  const pushed = useRef(false)
  const playing = hash === '#play'
  useEffect(() => { if (!playing) pushed.current = false }, [playing])
  const open = () => { enterFullscreen(); pushed.current = true; navigate({ hash: '#play' }) }
  const close = useCallback(() => { if (pushed.current) navigate(-1); else navigate({ hash: '' }, { replace: true }) }, [navigate])

  return (
    <div className="arc-page" dir="rtl" style={{ '--game-color': '#ffd23f' }}>
      <SEO title="מרתון משחקים – 8 משחקי אונליין ברצף נגד השעון, בחינם" path="/online-games/marathon"
        description="מרתון המשחקים של עוגה בוגה: 8 שלבים ברצף, כל שלב ממשחק אחר — נחש, סודוקו, זיכרון, 2048, בלוקים, חפרפרות ועוד. משימה קצרה בכל שלב, שעון אחד לכל המרתון, ושיתוף התוצאה בוואטסאפ. בחינם, בלי הרשמה." />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקי אונליין', href: '/online-games' }, { label: 'מרתון משחקים' }]} />
      <header className="arc-hero">
        <h1>🏃 מרתון משחקים</h1>
        <p>{MARATHON_LENGTH} שלבים ברצף — וכל שלב ממשחק אחר! משימה קצרה בכל שלב, שעון אחד לכל המרתון. כמה מהר תסיימו?</p>
      </header>
      <section className="arc-play-hero">
        <div className="arc-play-art" aria-hidden="true">🏃</div>
        <div>
          <p>כל מרתון מגריל {MARATHON_LENGTH} משחקים מתוך {MARATHON_STAGES.length}. נכשלתם בשלב? מנסים שוב (השעון ממשיך) או מדלגים בתוספת {SKIP_PENALTY} שניות.</p>
          <button type="button" className="arc-play-btn" onClick={open}>▶ מתחילים מרתון</button>
          <div className="arc-meta">
            <span>🏆 השיא שלכם: {progress.best ? clock(progress.best) : '—'}</span><span>🎯 מרתונים: {progress.runs}</span>
          </div>
        </div>
      </section>
      <section className="arc-box" style={{ maxWidth: 860, margin: '0 auto 26px' }}>
        <h2>השלבים האפשריים</h2>
        <ul className="mr-pool">
          {MARATHON_STAGES.map(s => { const g = arcadeGame(s.slug); return <li key={s.slug}><span aria-hidden="true">{g?.emoji}</span> <b>{g?.name}</b> — {s.goal}</li> })}
        </ul>
      </section>
      <p style={{ textAlign: 'center' }}><Link to="/online-games" className="underline font-bold">לכל משחקי האונליין ←</Link></p>
      {playing && <Suspense fallback={null}><MarathonStage onClose={close} /></Suspense>}
    </div>
  )
}
