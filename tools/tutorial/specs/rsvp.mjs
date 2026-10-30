// Tutorial: birthday RSVP (/rsvp). Labels are the real ones from src/utils/rsvpUi.js (Hebrew site).
// The page talks to a Supabase database that is not reachable from the build container (and must not receive demo events),
// so its RPC calls are answered by a tiny in-memory stand-in (setup below). The UI, labels and logic are the real site.
import { clickOn, typeSlow, scrollTo, ring, unring } from '../overlay.mjs'
const N = n => `⁦${n}⁩`
const CODE = 'noa7yl'
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }

function backend() {
  let ev = null, responses = [], mine = {}, nextId = 1
  const view = host => ({ ...ev, yes_count: responses.filter(r => r.status === 'yes').length, ...(host ? { responses } : {}) })
  const rpc = {
    rsvp_experience_version: () => 2,
    rsvp_create_v2: a => { ev = { code: CODE, ui_version: 2, ...a.p, invitees: a.p.invitees || [] }; return view(false) },
    rsvp_set_pin: () => true, rsvp_has_pin: () => true, rsvp_extras_set: () => ({}),
    rsvp_extras_get: () => ({ extras: {}, marks: {} }),
    rsvp_host_v2: () => view(true),
    rsvp_get_v2: a => ({ ...view(false), mine: mine[a.p_device_token] || null }),
    rsvp_answer: a => {
      const r = { id: nextId++, ...a.p }; responses.push(r); mine[a.p_device_token] = r
      // the other invitees answer a little later
      responses.push({ id: nextId++, name: 'יובל', status: 'yes', kids: 1, adults: 1, allergies: 'בוטנים', pickup: '', note: '' },
        { id: nextId++, name: 'מאיה', status: 'maybe', kids: 1, adults: 0, allergies: '', pickup: '', note: 'נעדכן מחר' })
      return r
    },
  }
  return async route => {
    const req = route.request()
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    const fn = new URL(req.url()).pathname.split('/').pop()
    const body = req.postDataJSON() || {}
    if (!rpc[fn]) return route.fulfill({ status: 404, headers: CORS, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST202', message: 'Could not find the function' }) })
    const a = fn === 'rsvp_create_v2' ? body : fn === 'rsvp_answer' ? { p: body.p, p_device_token: body.p_device_token } : body
    route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify(rpc[fn](a)) })
  }
}

export default {
  slug: 'rsvp',
  path: '/rsvp',
  fullUrl: 'ugabuga.co.il/rsvp',
  card: { title: 'איך אוספים אישורי הגעה<br>ליום הולדת בעוגה בוגה', sub: 'יוצרים קישור, שולחים בוואטסאפ ורואים מי מגיע' },
  endLine: 'אישורי הגעה ליום הולדת — קישור אחד, תשובות בלחיצה, סיכום מסודר',
  endWhere: 'באתר: כלים ← אישור הגעה',
  zoom: 1.2,
  async setup(ctx) { await ctx.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true }) }); await ctx.route('**/rest/v1/rpc/*', backend()) },
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const dbg = async n => { if (process.env.DEBUG) await page.screenshot({ path: `/tmp/rs-${n}.png` }) }
    const at = (sel, off = 140) => scrollTo(page, page.evaluate(([sel, off]) => scrollY + document.querySelector(sel).getBoundingClientRect().top - off, [sel, off]), 800)
    const goTo = async (loc, off = 160) => scrollTo(page, await loc.evaluate((el, off) => scrollY + el.getBoundingClientRect().top - off, off), 900)
    const title = page.getByPlaceholder('למשל: יום ההולדת של נועה')
    await goTo(title, 240); h.mark(); await h.caption(page, 1, 'פותחים את הכלי ומתחילים להכין הזמנה — בלי הרשמה'); await wait(2500); await dbg(1)
    h.mark(); await h.caption(page, 2, 'כותבים שם לאירוע, תאריך, שעה ומקום')
    await clickOn(page, title); await title.press('Control+a'); await title.pressSequentially('יום ההולדת של נועה', { delay: 130 }); await wait(800)
    await clickOn(page, page.locator('input[type=date]').first()); await page.locator('input[type=date]').first().fill('2026-11-20'); await wait(800)
    const time = page.getByPlaceholder('17:00–19:00'); await clickOn(page, time); await time.pressSequentially('16:30–18:30', { delay: 110 }); await wait(500)
    const place = page.getByPlaceholder('כתובת, שם הגן או הפארק'); await clickOn(page, place); await place.pressSequentially('פארק הירקון', { delay: 110 }); await wait(1500); await dbg(2)
    h.mark(); await h.caption(page, 3, 'מוסיפים רשימת מוזמנים (שם בכל שורה) וקוד מארגן בן 4 ספרות')
    const list = page.getByLabel('רשימת מוזמנים'); await goTo(list, 300)
    await clickOn(page, list); await list.pressSequentially('יובל\nמאיה\nאיתי\nדנה\nרוני', { delay: 90 }); await wait(1200)
    const pin = page.getByLabel('קוד מארגן').first(); await goTo(pin, 520); await clickOn(page, pin); await pin.pressSequentially('2468', { delay: 200 }); await wait(1800); await dbg(3)
    h.mark(); await h.caption(page, 4, 'לוחצים על "יצירת קישור לאישור הגעה"')
    const create = page.getByRole('button', { name: /יצירת קישור לאישור הגעה/ }); await goTo(create, 700)
    await clickOn(page, create, { pad: 12 }); await wait(2500); await dbg(4)
    h.mark(); await h.caption(page, 5, 'מקבלים קישור אחד — שולחים אותו בוואטסאפ לכל המוזמנים')
    await scrollTo(page, 0, 600); await wait(600)
    await ring(page, page.getByRole('button', { name: '📱 שליחה בוואטסאפ' }), 10); await wait(2500); await unring(page); await dbg(5)
    await clickOn(page, page.getByRole('button', { name: '🔗 העתקת קישור' })); await wait(2500); await dbg(6)
    // a guest opens the link on their own phone
    await h.goto(`/r/${CODE}?guest=1`); await wait(1500); await dbg(7)
    h.mark(); await h.caption(page, 6, 'כל אורח פותח את הקישור, כותב שם ובוחר "מגיעים"')
    const gname = page.getByPlaceholder('למשל: יואב'); await goTo(gname, 330)
    await clickOn(page, gname); await gname.pressSequentially('איתי', { delay: 160 }); await wait(700)
    await clickOn(page, page.getByRole('button', { name: 'מגיעים', exact: true }), { pad: 8 }); await wait(1800); await dbg(9)
    const send = page.getByRole('button', { name: 'שליחת אישור' }); await goTo(send, 600); await wait(1200); await dbg(10)
    await clickOn(page, send, { pad: 10 }); await wait(800); await scrollTo(page, 0, 700); await wait(300); await goTo(page.getByText('איזה כיף, נתראה באירוע!').first(), 330); await wait(2800); await dbg(11)
    // back to the organizer's page
    await h.goto(`/r/${CODE}`); await wait(1500)
    h.mark(); await h.caption(page, 7, 'חוזרים לדף המארגן — רואים כמה מגיעים, אלרגיות ומי עוד לא ענה')
    await goTo(page.getByText('אנשים מגיעים').first(), 330); await wait(3800); await dbg(12)
    await goTo(page.getByRole('heading', { name: /^התשובות/ }), 260); await wait(3800); await dbg(13)
    await scrollTo(page, 0, 800); await wait(500)
    const rem = page.getByRole('button', { name: /העתקת תזכורת לוואטסאפ/ }); await goTo(rem, 330); await ring(page, rem, 10); await wait(3000); await unring(page); await dbg(14)
    await page.evaluate(() => document.getElementById('tut-cap').classList.remove('on')); await scrollTo(page, 120, 500); await wait(500) // clean frame for shot.png (thumbnail)
  },
}
