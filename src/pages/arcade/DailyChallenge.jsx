import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { arcadeGame } from '../../arcade/registry'
import ArcadeStage from '../../arcade/ArcadeStage'
import { enterFullscreen } from '../../arcade/stage'
import { dailyFor, msToNext, readResults, streak, dailyShareText, DAILY_GAMES } from '../../arcade/daily'
import { shareOnWhatsApp } from '../../utils/share'
import { WhatsAppIcon } from '../../components/layout/WhatsAppShare'
import '../../arcade/arcade.css'

const pad = n => String(n).padStart(2, '0')
const clock = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}` }

// /online-games/today — one online game a day, the same puzzle for everyone.
export default function DailyChallenge() {
  const [now, setNow] = useState(() => Date.now())
  const daily = useMemo(() => dailyFor(now), [now])
  const game = arcadeGame(daily.slug)
  const [left, setLeft] = useState(() => msToNext(now))
  const { hash } = useLocation()
  const navigate = useNavigate()
  const pushed = useRef(false)
  const playing = hash === '#play'

  // countdown; at midnight the next challenge appears by itself
  useEffect(() => {
    const t = setInterval(() => {
      const ms = msToNext()
      setLeft(ms)
      if (dailyFor().day !== daily.day) setNow(Date.now())
    }, 1000)
    return () => clearInterval(t)
  }, [daily.day])

  useEffect(() => { if (!playing) pushed.current = false }, [playing])
  // re-read saved results whenever the game closes (or the day changes)
  const results = useMemo(() => (playing ? {} : readResults()), [playing, daily.day]) // eslint-disable-line react-hooks/exhaustive-deps
  const open = () => { enterFullscreen(); pushed.current = true; navigate({ hash: '#play' }) }
  const close = useCallback(() => {
    if (pushed.current) navigate(-1)
    else navigate({ hash: '' }, { replace: true })
  }, [navigate])

  const mine = results[daily.day]
  const days = streak(results, daily.day)
  const week = Array.from({ length: 7 }, (_, k) => {
    const d = daily.day - 6 + k
    const g = arcadeGame(DAILY_GAMES[((d % DAILY_GAMES.length) + DAILY_GAMES.length) % DAILY_GAMES.length].slug)
    return { d, emoji: g?.emoji, done: !!results[d], won: results[d]?.won, today: d === daily.day }
  })

  return (
    <div className="arc-page dl-page" dir="rtl" style={{ '--game-color': game?.color }}>
      <SEO title="אתגר היום – משחק אונליין חדש בכל יום, אותו אתגר לכולם" path="/online-games/today"
        description="אתגר היום של עוגה בוגה: בכל יום משחק אונליין אחר — סודוקו, צוללות, זיכרון, שולה מוקשים ועוד — ואותו אתגר בדיוק לכל מי שמשחק. משחקים, משווים תוצאות ומשתפים בוואטסאפ. מתחלף בחצות, בחינם." />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקי אונליין', href: '/online-games' }, { label: 'אתגר היום' }]} />
      <header className="arc-hero">
        <h1>🌟 אתגר היום</h1>
        <p>בכל יום משחק אחר — ואותו אתגר בדיוק לכל מי שמשחק היום. משחקים, משווים עם החברים ומשתפים. מחר? אתגר חדש!</p>
      </header>

      {game && (
        <section className="arc-play-hero dl-hero">
          <div className="arc-play-art" aria-hidden="true">{game.emoji}</div>
          <div>
            <p className="dl-date">📅 {daily.label}</p>
            <h2 className="dl-game">{game.name}</h2>
            <p>{daily.goal}</p>
            {mine
              ? <p className="dl-mine">{mine.won ? '✅' : '🔁'} {mine.text}</p>
              : null}
            <div className="dl-actions">
              <button type="button" className="arc-play-btn" onClick={open}>{mine ? '🔄 לשחק שוב' : '▶ לאתגר של היום'}</button>
              <button type="button" className="dl-share-btn" onClick={() => shareOnWhatsApp(dailyShareText(daily, mine ? { ...mine, streak: days } : null))}>
                <WhatsAppIcon size={20} /> {mine ? 'שתפו את התוצאה' : 'שלחו לחברים'}
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="arc-info">
        <section className="arc-box">
          <h2>🔥 השבוע שלכם</h2>
          <ol className="dl-week" aria-label="7 הימים האחרונים">
            {week.map(w => (
              <li key={w.d} className={`${w.done ? 'is-done' : ''}${w.today ? ' is-today' : ''}`} title={w.today ? 'היום' : undefined}>
                <span aria-hidden="true">{w.emoji}</span>
                <b>{w.done ? (w.won ? '✅' : '🔁') : w.today ? '⭐' : '·'}</b>
              </li>
            ))}
          </ol>
          <p style={{ margin: '10px 0 0', fontWeight: 700 }}>{days ? `🔥 ${days} ${days === 1 ? 'יום' : 'ימים'} ברצף — אל תשברו את הרצף!` : 'שחקו היום כדי להתחיל רצף 🔥'}</p>
          <p className="dl-next">⏳ האתגר הבא בעוד <b dir="ltr">{clock(left)}</b></p>
        </section>
        <section className="arc-box">
          <h2>איך זה עובד?</h2>
          <ul>
            <li>בכל יום בחצות (שעון ישראל) מתחלף המשחק והאתגר.</li>
            <li>כולם מקבלים בדיוק אותו לוח, אותה חבילת קלפים ואותו צי — כך אפשר להשוות.</li>
            <li>מותר לנסות כמה פעמים; התוצאה נשמרת אצלכם בדפדפן.</li>
            <li>סיימתם? שתפו בוואטסאפ ותראו מי עשה יותר טוב.</li>
          </ul>
        </section>
      </div>
      <p style={{ textAlign: 'center' }}><Link to="/online-games" className="underline font-bold">לכל משחקי האונליין ←</Link></p>
      {playing && game && <ArcadeStage game={game} daily={daily} onClose={close} />}
    </div>
  )
}
