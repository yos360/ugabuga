// Tutorial: birthday invitation studio (/invitation). Labels are the real ones from src/components/invitations/InvitationStudio.jsx
// and src/utils/invitationDesign.js. Requests to the database are blocked so the demo never writes anything (sample names only).
import { clickOn, scrollTo, ring, unring } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'invitation',
  path: '/invitation',
  fullUrl: 'ugabuga.co.il/invitation',
  card: { title: 'איך מעצבים הזמנה<br>ליום הולדת בעוגה בוגה', sub: 'בוחרים סגנון, ממלאים פרטים ושולחים בוואטסאפ' },
  endLine: 'הזמנה ליום הולדת בדקה — עיצוב מוכן, תצוגה חיה ושליחה בוואטסאפ',
  endWhere: 'באתר: יום הולדת ← הזמנה ליום הולדת',
  zoom: 1.3,
  async setup(ctx) { await ctx.route(/supabase\.co/, r => r.abort()) },
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    const dbg = async n => { if (process.env.DEBUG) await page.screenshot({ path: `/tmp/inv-${n}.png` }) }
    const goTo = async (loc, off = 160, ms = 900) => scrollTo(page, await loc.evaluate((el, off) => scrollY + el.getBoundingClientRect().top - off, off), ms)
    const themes = page.locator('.inv-themes')
    const f = t => page.getByLabel(t).first()
    // hide the site's floating share button / promo toast so only the tool and the caption are on screen
    await page.evaluate(() => { const hide = () => document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root')) return; const s = getComputedStyle(el); if (s.position === 'fixed' && !el.contains(document.getElementById('tut-root'))) el.style.setProperty('display', 'none', 'important') }); hide(); setInterval(hide, 500) })
    const settle = () => wait(900) // the preview re-renders ~120 ms after each change

    await goTo(themes, 90); await wait(300); h.mark(); await h.caption(page, 1, 'פותחים את עמוד ההזמנה — 12 סגנונות, בלי הרשמה'); await wait(3500); await dbg(1)
    h.mark(); await h.caption(page, 2, 'בוחרים סגנון שמתאים למסיבה — למשל "ספארי דינוזאורים"')
    await clickOn(page, page.getByRole('button', { name: /ספארי דינוזאורים/ }), { pad: 8 }); await settle(); await wait(1800); await dbg(2)
    await goTo(page.locator('.inv-fields'), 170, 800)
    h.mark(); await h.caption(page, 3, `ממלאים שם, גיל, תאריך, שעה ומקום — והתצוגה מתעדכנת מיד`)
    const name = page.getByPlaceholder('למשל: נועה'); await clickOn(page, name); await name.pressSequentially('נועה', { delay: 160 }); await wait(500)
    const age = page.getByPlaceholder('למשל: 7', { exact: true }); await clickOn(page, age); await age.pressSequentially('7', { delay: 160 }); await wait(500)
    const date = page.getByPlaceholder('למשל: שישי, 14.11'); await clickOn(page, date); await date.pressSequentially('שישי, 20.11', { delay: 110 }); await wait(500)
    const time = page.getByPlaceholder('למשל: 17:00–19:00'); await clickOn(page, time); await time.pressSequentially('16:30–18:30', { delay: 100 }); await wait(500)
    const place = page.getByPlaceholder('למשל: גן השעשועים ברחוב הרצל'); await clickOn(page, place); await place.pressSequentially('פארק הירקון', { delay: 110 }); await settle(); await wait(2200); await dbg(3)
    await goTo(page.locator('.inv-design-box'), 130, 900)
    h.mark(); await h.caption(page, 4, 'בסטודיו לעיצוב מחליפים פלטת צבעים ופונט')
    await clickOn(page, page.locator('.inv-palette-row button', { hasText: 'שמיים' }), { pad: 8 }); await settle(); await wait(1800)
    const font = page.getByLabel('סגנון הפונט'); await ring(page, font, 8); await font.selectOption('Fredoka'); await settle(); await wait(2200); await unring(page); await dbg(4)
    h.mark(); await h.caption(page, 5, 'רוצים הזמנה לסטטוס או לסטורי? מעבירים לפורמט ' + N('9:16'))
    await goTo(page.locator('.inv-formats'), 120, 900)
    await clickOn(page, page.getByRole('button', { name: /סטטוס \/ סטורי/ }), { pad: 8 }); await settle(); await wait(2500); await dbg(5)
    await clickOn(page, page.getByRole('button', { name: /הודעה בוואטסאפ/ }), { pad: 8 }); await settle(); await wait(1200)
    h.mark(); await h.caption(page, 6, 'שומרים את התמונה ושולחים בוואטסאפ — או שולחים את הפרטים כטקסט')
    const actions = page.locator('.inv-export-actions'); await goTo(actions, 560, 900); await wait(500)
    const save = page.getByRole('button', { name: 'שמירת תמונה לוואטסאפ' })
    await clickOn(page, save, { pad: 8 }); await wait(2000)
    await ring(page, page.getByRole('button', { name: 'שליחת הפרטים כטקסט בוואטסאפ' }), 8); await wait(2800); await unring(page); await dbg(6)
    h.mark(); await h.caption(page, 7, 'צריך אישורי הגעה? מוסיפים להזמנה קישור לאישור הגעה')
    const det = page.locator('details.inv-rsvp'); await goTo(det, 330, 900); await wait(400)
    await clickOn(page, det.locator('summary'), { pad: 8 }); await wait(2800); await dbg(7)
    await page.evaluate(() => document.getElementById('tut-cap').classList.remove('on')); await scrollTo(page, 330, 700); await wait(500)
  },
}
