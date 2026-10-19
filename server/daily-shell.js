import { dailyFor, DAILY_GAMES, msToNext } from '../src/arcade/dailySchedule.js'

export function dailyText(time = Date.now()) {
  const daily = dailyFor(time)
  const seconds = Math.max(0, Math.floor(msToNext(time) / 1000))
  const clock = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(n => String(n).padStart(2, '0')).join(':')
  const week = Array.from({ length: 7 }, (_, i) => DAILY_GAMES[((daily.day - 6 + i) % DAILY_GAMES.length + DAILY_GAMES.length) % DAILY_GAMES.length].emoji)
  return { daily, clock, week }
}

// Use the very same Israeli-date schedule as the client. Static HTML stays
// correct after midnight even when no deployment took place that day.
export function dailyShell(response, path, time = Date.now()) {
  const { daily, clock, week } = dailyText(time)
  const replace = text => ({ element(el) { el.setInnerContent(text) } })
  let rewriter = new HTMLRewriter()
  if (path === '/online-games') {
    rewriter = rewriter
      .on('a[href="/online-games/today"] .dl-banner-art', replace(daily.emoji))
      .on('a[href="/online-games/today"] b', replace(`🌟 אתגר היום: ${daily.name}`))
      .on('a[href="/online-games/today"] small', replace(`${daily.goal} · אותו אתגר לכולם, מתחלף כל יום`))
  } else {
    rewriter = rewriter
      .on('.dl-date', replace(`📅 ${daily.label}`))
      .on('.dl-game', replace(daily.name))
      .on('.dl-goal', replace(daily.goal))
      .on('.dl-hero .arc-play-art', replace(daily.emoji))
      .on('.dl-next b', replace(clock))
    for (let i = 0; i < week.length; i++) rewriter = rewriter.on(`.dl-week li:nth-child(${i + 1}) span`, replace(week[i]))
  }
  const headers = new Headers(response.headers)
  headers.set('Cache-Control', 'no-store')
  headers.delete('ETag')
  headers.delete('Last-Modified')
  headers.delete('Content-Length')
  return rewriter.transform(new Response(response.body, { status: response.status, headers }))
}
