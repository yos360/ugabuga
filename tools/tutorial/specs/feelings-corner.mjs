// Tutorial: feelings corner (/classroom/feelings-corner). Labels are the real ones from src/pages/classroom/FeelingsCorner.jsx.
import { clickOn, scrollTo } from '../overlay.mjs'
const N = n => `⁦${n}⁩`

export default {
  slug: 'feelings-corner',
  path: '/classroom/feelings-corner',
  fullUrl: 'ugabuga.co.il/classroom/feelings-corner',
  card: { title: 'איך מקימים פינת רגשות<br>בגן ובכיתה בעוגה בוגה', sub: 'מד רגשות על המסך, נשימה מונפשת ודפים להדפסה' },
  endLine: 'פינת רגשות ופינת שקט — מד רגשות, נשימת ' + N('4') + '־' + N('4') + ' ודפים להדפסה',
  endWhere: 'באתר: לכיתה ← פינת רגשות',
  zoom: 1.2,
  async steps(page, h) {
    const wait = ms => page.waitForTimeout(ms)
    await page.evaluate(() => window.__hide = setInterval(() => {
      document.querySelectorAll('body *').forEach(el => { if (el.closest('#tut-root,[role=dialog]')) return; const c = getComputedStyle(el); if (c.position === 'fixed' && el.id !== 'tut-root') el.style.setProperty('display', 'none', 'important') })
    }, 300))
    const toId = async (id, off = 110) => scrollTo(page, await page.evaluate(([id, off]) => document.getElementById(id).getBoundingClientRect().top + scrollY - off, [id, off]), 1200)
    const btn = name => page.getByRole('button', { name })

    h.mark(); await h.caption(page, 1, 'קודם מקימים את הפינה — פינה שקטה עם כמה דברים פשוטים')
    await wait(1500); await toId('setup', 90); await wait(4500)

    h.mark(); await h.caption(page, 2, 'כללי הפינה, ואיך ילד משתמש בה צעד אחרי צעד')
    await scrollTo(page, await page.evaluate(() => document.querySelector('#setup h3').getBoundingClientRect().top + scrollY - 140), 1200); await wait(5000)

    h.mark(); await h.caption(page, 3, 'מד הרגשות: לוחצים על הפרצוף שהכי דומה למה שמרגישים')
    await toId('checkin', 90); await wait(1500)
    await clickOn(page, btn(/שמח\/ה/), { pad: 8 }); await wait(2800)
    await clickOn(page, btn('בוחרים רגש אחר'), { pad: 8 }); await wait(1200)

    h.mark(); await h.caption(page, 4, 'כועסים? מקבלים משפט מרגיע ורעיון — ואפשר לנשום ביחד')
    await clickOn(page, btn(/כועס\/ת/), { pad: 8 }); await wait(3000)
    await scrollTo(page, await page.evaluate(() => document.querySelector('#checkin [role=status]').getBoundingClientRect().top + scrollY - 160), 900); await wait(1200)

    h.mark(); await h.caption(page, 5, 'נשימת ' + N('4') + '־' + N('4') + ': הכדור גדל ואז קטן, והילדים נושמים איתו')
    await clickOn(page, btn('מתחילים'), { pad: 10 }); await wait(10500)
    await clickOn(page, btn('עוצרים'), { pad: 10 }); await wait(1800)

    h.mark(); await h.caption(page, 6, 'ויש גם דפים להדפסה: מד רגשות לקיר, צ׳ק־אין, יומן וכרטיסי הרגעה')
    await toId('print', 90); await wait(2500)
    await page.evaluate(() => clearInterval(window.__hide))
    await clickOn(page, btn(/מד רגשות לקיר/), { pad: 10 }); await wait(800)
    await page.evaluate(() => { document.querySelectorAll('dialog').forEach(d => d.style.removeProperty('display')); document.documentElement.appendChild(document.getElementById('tut-root')); const st = document.createElement('style'); st.textContent = '.buga-print-dialog{max-height:850px!important;margin-top:24px!important}'; document.head.appendChild(st) }); await wait(6500)
    await page.keyboard.press('Escape'); await wait(1500)
  },
}
