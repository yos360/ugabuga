// Tutorial: Buga Live quiz (/live). Labels are the real ones from src/pages/live/*.jsx.
// The game runs on a Supabase database that must not receive demo data, so its RPC/REST calls are answered by a tiny
// in-memory stand-in (setup below; same response shapes as supabase/migrations/202610160001_buga_live.sql). The other
// "phones" are example names that join and answer inside the stand-in. UI, questions, labels and logic are the real site.
import { clickOn, scrollTo, ring, unring } from '../overlay.mjs'

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }
const BOTS = ['יואב', 'מאיה', 'איתי', 'שירה', 'דניאל']
const err = m => { const e = new Error(m); e.pg = m; return e }

let G = null // the one game
const ctl = {
  correct: () => G.questions[G.qi].correct,
  botsJoin(gap = 700) { BOTS.forEach((n, i) => setTimeout(() => { if (G && !G.players.some(p => p.name === n)) G.players.push({ id: 'b' + i, token: 'bot' + i, name: n, score: 0, bot: true }) }, gap * (i + 1))) },
}

function backend() {
  const secs = () => G.secs
  const lead = limit => [...G.players].sort((a, b) => b.score - a.score).slice(0, limit).map((p, i) => ({ name: p.name, score: p.score, rank: i + 1 }))
  const answersNow = () => G.answers[G.qi] || (G.answers[G.qi] = {})
  const counts = () => { const q = G.questions[G.qi], c = q.options.map(() => 0); Object.values(answersNow()).forEach(a => { c[a.option]++ }); return c }
  const publish = () => {
    const q = G.questions[G.qi] || {}, { correct, ...pub } = q
    const base = { title: G.title, player_count: G.players.length, total: G.questions.length }
    if (G.phase === 'lobby') G.payload = base
    else if (G.phase === 'question') G.payload = { ...base, question: pub, index: G.qi + 1, seconds: secs() }
    else if (G.phase === 'reveal') G.payload = { ...base, question: pub, correct, counts: counts(), index: G.qi + 1, leaderboard: lead(10) }
    else G.payload = { ...base, leaderboard: lead(100) }
    G.rev++
  }
  const give = (p, option, delayFrac) => { // score like a live game: faster = more points
    const q = G.questions[G.qi], ok = option === q.correct, points = ok ? Math.round(1000 - 400 * delayFrac) : 0
    answersNow()[p.id] = { option, correct: ok, points }; p.score += points
  }
  const autoAnswers = (includeNoa) => { // the other phones answer as soon as a question opens
    const q = G.questions[G.qi]
    G.players.forEach((p, i) => {
      if (answersNow()[p.id]) return
      if (!p.bot && !includeNoa) return
      const right = p.bot ? ((G.qi * 3 + i * 2) % 5 !== 0) : (G.qi % 4 !== 2)
      give(p, right ? q.correct : (q.correct + 1 + i) % q.options.length, 0.1 + 0.12 * i)
    })
  }
  const open = idx => { G.qi = idx; G.phase = 'question'; G.ends = new Date(Date.now() + secs() * 1000).toISOString(); G.answers[idx] = {}; autoAnswers(idx > 0); publish() }
  const rpc = {
    live_quiz_create: a => { G = { code: 'K7M2QX', token: a.p_owner_token, title: a.p_title, questions: a.p_questions, secs: a.p_seconds, phase: 'lobby', qi: -1, ends: null, players: [], answers: {}, rev: 1 }; publish(); return { code: G.code } },
    live_quiz_join: a => { if (G.phase !== 'lobby') throw err('game_started'); const p = { id: 'p1', token: a.p_player_token, name: a.p_nickname, score: 0 }; G.players.unshift(p); publish(); return { name: p.name, score: 0, phase: G.phase } },
    live_quiz_host_state: a => {
      if (!G || a.p_owner_token !== G.token) throw err('not_owner')
      const here = G.qi >= 0 ? answersNow() : {}
      return { code: G.code, title: G.title, settings: { seconds: G.secs }, questions: G.questions, phase: G.phase, question_index: G.qi, started_at: null, ends_at: G.ends,
        players: G.players.map(p => ({ id: p.id, name: p.name, score: p.score, streak: 0, answered: !!here[p.id] })), answer_count: Object.keys(here).length,
        counts: G.qi >= 0 ? counts() : [], leaderboard: lead(100), expires_at: '2027-03-01T00:00:00Z' }
    },
    live_quiz_player_state: a => {
      const p = G.players.find(x => x.token === a.p_player_token); if (!p) return null
      const ans = G.qi >= 0 ? answersNow()[p.id] : null
      return { name: p.name, score: p.score, streak: 0, rank: [...G.players].sort((x, y) => y.score - x.score).indexOf(p) + 1, answered: !!ans, option: ans ? ans.option : null, correct: ans ? ans.correct : null, points: ans ? ans.points : null }
    },
    live_quiz_answer: a => { const p = G.players.find(x => x.token === a.p_player_token); give(p, a.p_option_index, 0.2); return { accepted: true } },
    live_quiz_host_action: a => {
      if (a.p_owner_token !== G.token) throw err('not_owner')
      if (a.p_action === 'start') { if (G.phase !== 'lobby') throw err('bad_phase'); G.players.filter(p => p.bot).forEach(p => { p.score = 0 }); open(0) }
      else if (a.p_action === 'next') { if (G.phase !== 'reveal') throw err('bad_phase'); open(G.qi + 1) }
      else if (a.p_action === 'reveal' || a.p_action === 'timeout') { if (G.phase !== 'question') throw err('bad_phase'); if (a.p_action === 'timeout' && new Date(G.ends) > Date.now()) throw err('question_open'); G.phase = 'reveal'; G.ends = null; publish() }
      else if (a.p_action === 'finish') { G.phase = 'finished'; G.ends = null; publish() }
      else throw err('bad_action')
      return G.payload
    },
  }
  return async route => {
    const req = route.request(), url = new URL(req.url())
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    const json = (status, body) => route.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(body) })
    if (url.pathname.includes('/rpc/')) {
      const fn = url.pathname.split('/').pop()
      if (!rpc[fn]) return json(404, { code: 'PGRST202', message: 'Could not find the function' })
      try { return json(200, rpc[fn](req.postDataJSON() || {})) } catch (e) { return json(400, { code: 'P0001', message: e.pg || String(e) }) }
    }
    if (url.pathname.endsWith('/live_quiz_public_states')) {
      if (!G) return json(406, { code: 'PGRST116', message: 'no rows' })
      return json(200, { code: G.code, phase: G.phase, question_index: G.qi, ends_at: G.ends, payload: G.payload, revision: G.rev })
    }
    return route.fulfill({ status: 404, headers: CORS, body: '' })
  }
}

export default {
  slug: 'live-quiz',
  path: '/live',
  fullUrl: 'ugabuga.co.il/live',
  card: { title: 'איך עושים חידון חי לכיתה<br>עם בוגה לייב', sub: 'אתם על המסך, כולם עונים מהטלפון — בלי חשבון' },
  endLine: 'בוגה לייב — חידון חי לכל הכיתה, עם QR ולוח מובילים',
  endWhere: 'באתר: משחקים ← בוגה לייב',
  zoom: 1.25,
  async setup(ctx) {
    await ctx.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true }) })
    await ctx.addInitScript(() => { addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = '.live-stage{padding-bottom:210px!important}.live-player-screen{padding-bottom:200px!important}'; document.head.appendChild(st) }) })
    await ctx.route('**/efhgyispuwxcplvzipcy.supabase.co/rest/v1/**', backend())
  },
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const dbg = async n => { if (process.env.DEBUG) await page.screenshot({ path: `/tmp/live-${n}.png` }) }
    const play = async code => { await h.goto('/play/' + code); await page.addStyleTag({ content: '#root{zoom:1.45!important}' }) }
    const top = () => scrollTo(page, 0, 500)
    const goTo = async (loc, off = 160) => scrollTo(page, await loc.evaluate((el, off) => scrollY + el.getBoundingClientRect().top - off, off), 900)

    h.mark(); await h.caption(page, 1, 'פותחים את בוגה לייב — בלי חשבון — ובוחרים נושא ורמה'); await wait(2500)
    const topics = page.locator('.live-topic-grid').first(); await goTo(topics, 300); await wait(600)
    await clickOn(page, page.getByRole('button', { name: /חיות וטבע/ }).first(), { pad: 8 }); await wait(1300)
    await clickOn(page, page.getByRole('button', { name: /קל/ }).first(), { pad: 8 }); await wait(2000); await dbg(2)

    h.mark(); await h.caption(page, 2, 'לוחצים "פותחים חדר" ומקבלים קוד משחק ו־QR')
    await clickOn(page, page.locator('.live-go'), { pad: 10 })
    await page.locator('.live-lobby').waitFor(); await wait(300); await top(); await wait(3500); await dbg(3)
    const code = (await page.locator('.live-lobby h1').innerText()).trim()

    h.mark(); await h.caption(page, 3, 'המשתתפים נכנסים מהטלפון עם הקוד ובוחרים כינוי')
    await play(code); await h.caption(page, 3, 'המשתתפים נכנסים מהטלפון עם הקוד ובוחרים כינוי'); await wait(1800)
    const nick = page.getByPlaceholder('שם או כינוי'); await clickOn(page, nick); await nick.pressSequentially('נועה', { delay: 190 }); await wait(900)
    await clickOn(page, page.getByRole('button', { name: 'כניסה למשחק' })); await page.getByText('אתם בפנים!').waitFor(); await wait(2200); await dbg(4)
    ctl.botsJoin(); await h.goto('/live/' + code + '/host'); await h.caption(page, 3, 'המשתתפים נכנסים מהטלפון עם הקוד ובוחרים כינוי')
    await wait(4200); await dbg(41)

    h.mark(); await h.caption(page, 4, 'כולם ברשימה? לוחצים "מתחילים את המשחק"')
    await wait(1500); await clickOn(page, page.locator('.live-start-button'), { pad: 10 })
    await page.locator('.live-question-stage').waitFor(); await wait(4500); await dbg(5)

    h.mark(); await h.caption(page, 5, 'מהטלפון עונים על השאלה — כשכולם ענו, התשובה נחשפת')
    await play(code); await h.caption(page, 5, 'מהטלפון עונים על השאלה — כשכולם ענו, התשובה נחשפת'); await wait(2200)
    const opts = page.locator('.live-player-options .live-answer')
    // click the right answer (the stand-in knows it)
    const idx = ctl.correct(); await clickOn(page, opts.nth(idx), { pad: 8 }); await page.getByText('התשובה נקלטה').waitFor(); await wait(2500); await dbg(6)
    await h.goto('/live/' + code + '/host'); await h.caption(page, 5, 'מהטלפון עונים על השאלה — כשכולם ענו, התשובה נחשפת')
    await page.locator('.live-reveal-stage').waitFor(); await wait(4500); await dbg(61)

    h.mark(); await h.caption(page, 6, 'ממשיכים שאלה אחרי שאלה, והמקומות מתעדכנים בלוח המובילים')
    for (let guard = 0; guard < 8; guard++) {
      const btn = page.locator('.live-reveal-stage .live-start-button')
      await btn.waitFor(); if (process.env.DEBUG) console.log('btn', guard, await btn.innerText(), await page.locator('.live-stage-meta').first().innerText().catch(() => '')); const last = (await btn.innerText()).includes('לתוצאות')
      await scrollTo(page, 99999, 500); await wait(200)
      const bb = await btn.boundingBox(); await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 10 }); await wait(250); await page.mouse.down(); await wait(60); await page.mouse.up()
      if (last) break
      await page.locator('.live-reveal-stage').waitFor(); await wait(1700)
    }
    await page.locator('.live-finish-stage').waitFor(); await wait(300); await top(); await wait(3000); await dbg(7)

    h.mark(); await h.caption(page, 7, 'בסוף רואים מי ניצח ומקבלים סיכום למנחה — ואפשר לשחק עוד סיבוב')
    await goTo(page.locator('.live-summary'), 200); await wait(2500)
    await goTo(page.locator('.live-replay-panel'), 160); await wait(3500); await dbg(8)
  },
}
