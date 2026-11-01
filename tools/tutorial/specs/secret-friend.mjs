// Tutorial: secret friend draw (/secret-friend). Labels are the real ones from src/pages/tools/group/SecretFriend.jsx.
// The draw runs on a Supabase database that must not receive demo data, so its RPC calls are answered by a tiny
// in-memory stand-in (setup below, it draws a real random cycle that respects the exclusions). UI, labels and logic are the real site.
import { clickOn, scrollTo, ring, unring } from '../overlay.mjs'

const CODE = 'gam7xk'
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }

function backend() {
  let d = null
  const tok = i => `p${i}abcdefghjkmnq${i}`
  const view = () => ({ code: CODE, mode: d.mode, title: d.title, note: d.note, budget: d.budget, shown_all: false, expires_at: '2027-03-01T00:00:00Z',
    people: d.names.map((name, idx) => ({ idx, name, token: tok(idx), opened: d.opened.has(idx) })) })
  const draw = (n, ex) => {
    const bad = (a, b) => ex.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
    for (let t = 0; t < 2000; t++) {
      const o = [...Array(n).keys()].sort(() => Math.random() - 0.5), tg = []
      o.forEach((p, k) => { tg[p] = o[(k + 1) % n] })
      if (tg.every((x, i) => !bad(i, x))) return tg
    }
    return [...Array(n).keys()].map(i => (i + 1) % n)
  }
  const idxOf = t => Number(String(t).charAt(1))
  const rpc = {
    secret_create: a => { d = { title: a.p_title, mode: a.p_mode, note: a.p_note, budget: a.p_budget, names: a.p_names, opened: new Set(), targets: draw(a.p_names.length, a.p_exclusions || []) }; return view() },
    secret_organizer: () => view(),
    secret_whoami: a => ({ mode: d.mode, title: d.title, note: d.note, budget: d.budget, name: d.names[idxOf(a.p_token)], opened: d.opened.has(idxOf(a.p_token)), shown_all: false }),
    secret_reveal: a => { const i = idxOf(a.p_token); d.opened.add(i); return { name: d.names[i], target: d.names[d.targets[i]] } },
  }
  return async route => {
    const req = route.request()
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    const fn = new URL(req.url()).pathname.split('/').pop()
    if (!rpc[fn]) return route.fulfill({ status: 404, headers: CORS, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST202', message: 'Could not find the function' }) })
    route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(rpc[fn](req.postDataJSON() || {})) })
  }
}

export default {
  slug: 'secret-friend',
  path: '/secret-friend',
  fullUrl: 'ugabuga.co.il/secret-friend',
  card: { title: 'איך עושים הגרלת גמד וענק<br>עם קישור אישי בעוגה בוגה', sub: 'מגרילים בלחיצה, וכל משתתף רואה רק את מי הוא הגריל' },
  endLine: 'גמד וענק — קישור אישי לכל משתתף, בלי פתקים',
  endWhere: 'באתר: כלים ← גמד וענק',
  zoom: 1.25,
  async setup(ctx) { await ctx.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true }) }); await ctx.route('**/rest/v1/rpc/*', backend()) },
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const dbg = async n => { if (process.env.DEBUG) await page.screenshot({ path: `/tmp/sf-${n}.png` }) }
    const goTo = async (loc, off = 160) => scrollTo(page, await loc.evaluate((el, off) => scrollY + el.getBoundingClientRect().top - off, off), 900)
    const modes = page.getByRole('group', { name: 'סוג ההגרלה' })
    await goTo(modes, 230); h.mark(); await h.caption(page, 1, 'בוחרים סוג הגרלה: גמד וענק, משלוח מנות או מתנות לחנוכה'); await wait(1200)
    await ring(page, modes, 8); await wait(2200); await unring(page)
    await clickOn(page, page.getByRole('button', { name: /גמד וענק/ }).first(), { pad: 8 }); await wait(1500); await dbg(1)

    h.mark(); await h.caption(page, 2, 'נותנים שם להגרלה וכותבים את המשתתפים — שם בכל שורה')
    const title = page.getByPlaceholder('למשל: גמד וענק — כיתה ג׳2'); await goTo(title, 330)
    await clickOn(page, title); await title.press('Control+a'); await title.pressSequentially('גמד וענק — כיתה ב׳ 2', { delay: 110 }); await wait(900)
    const names = page.locator('textarea').first(); await goTo(names, 330)
    await clickOn(page, names); await names.pressSequentially('נועה\nיואב\nאורי\nמיכל\nדנה\nרוני', { delay: 100 }); await wait(2000); await dbg(2)

    h.mark(); await h.caption(page, 3, 'אחים או בני זוג? בוחרים מי לא יגרילו זה את זה')
    const first = page.getByLabel('שם ראשון'); await goTo(first, 300)
    await clickOn(page, first); await first.selectOption('נועה'); await wait(900)
    const second = page.getByLabel('שם שני'); await clickOn(page, second); await second.selectOption('יואב'); await wait(900)
    await clickOn(page, page.getByRole('button', { name: 'הוספה', exact: true })); await wait(2300); await dbg(3)

    h.mark(); await h.caption(page, 4, 'מוסיפים תקציב ומתי מגלים — לא חובה')
    const budget = page.getByPlaceholder('עד 30 ש״ח'); await goTo(budget, 520)
    await clickOn(page, budget); await budget.pressSequentially('עד 20 ש״ח', { delay: 120 }); await wait(500)
    const note = page.getByPlaceholder('ביום חמישי בכיתה'); await clickOn(page, note); await note.pressSequentially('ביום חמישי בכיתה', { delay: 100 }); await wait(1800); await dbg(4)

    h.mark(); await h.caption(page, 5, 'לוחצים "הגרלה עם קישור אישי לכל אחד"')
    const create = page.getByRole('button', { name: /הגרלה עם קישור אישי/ }); await goTo(create, 620)
    await clickOn(page, create, { pad: 12 }); await wait(3000); await dbg(5)

    h.mark(); await h.caption(page, 6, 'ההגרלה בוצעה — לכל משתתף קישור אישי, ואתם לא רואים מי הגריל את מי')
    await scrollTo(page, 0, 600); await wait(2800)
    const link = page.getByRole('button', { name: 'העתקת הקישור של נועה' }); await goTo(link, 400)
    await clickOn(page, link); await wait(2500); await dbg(6)
    const sendBtn = page.getByRole('button', { name: /שליחה/ }).nth(1); await ring(page, sendBtn, 10); await wait(2200); await unring(page)

    // a participant opens her personal link on her own phone (owner rights are hidden meanwhile so the owner warning does not show)
    const keep = await page.evaluate(() => { const v = localStorage.getItem('ugabuga-secret-owned'); localStorage.removeItem('ugabuga-secret-owned'); return v })
    await h.goto(`/g/${CODE}#p=p0abcdefghjkmnq0`); await wait(1500)
    h.mark(); await h.caption(page, 7, 'כל משתתף פותח את הקישור שלו ולוחץ "גלו את מי הגרלתם"')
    const reveal = page.getByRole('button', { name: /גלו את מי הגרלתם/ }); await goTo(reveal, 380); await wait(1500)
    await clickOn(page, reveal, { pad: 10 }); await wait(3800); await dbg(7)
    await page.evaluate(v => { localStorage.setItem('ugabuga-secret-owned', v) }, keep)

    await h.goto(`/g/${CODE}?back=1`); await wait(1800)
    h.mark(); await h.caption(page, 8, 'חוזרים לדף המארגן — רואים מי כבר גילה')
    await scrollTo(page, 0, 500); await wait(3500); await dbg(8)
    await page.evaluate(() => document.getElementById('tut-cap').classList.remove('on')); await wait(900)
  },
}
