// Real captures of ugabuga.co.il/rsvp (src/pages/tools/group/Rsvp.jsx, RsvpExperience.jsx, utils/rsvpUi.js, rsvpI18n.js).
// The page UI is the live site's own; every Supabase call is answered here (route.fulfill), so nothing is written to the database.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1100;
const CODE = 'b7k2mq';
const TITLE = 'יום ההולדת של נועה';
const PLACE = 'גן השעשועים ברחוב הדקל';
const NOTE = 'להביא בגד ספורט 🤸';
const NAMES = ['יואב', 'מאיה', 'אורי', 'תמר', 'דניאל', 'שירה', 'איתי', 'ליה'];
const EVENT = { code: CODE, kind: 'kids', title: TITLE, date: '2026-12-17', time: '17:00–19:00', place: PLACE, deadline: '2026-12-12', note: NOTE, invitees: NAMES, theme: 'party', ui_version: 2, yes_count: 0 };
const R = (id, name, status, kids, adults, allergies = '', pickup = '', note = '') => ({ id, name, status, kids, adults, allergies, pickup, note });
const RESPONSES = [
  R(1, 'יואב', 'yes', 1, 0, 'בוטנים', 'אמא, ב-19:00'), R(2, 'מאיה', 'yes', 2, 1), R(3, 'אורי', 'yes', 1, 0),
  R(4, 'תמר', 'maybe', 1, 0, '', '', 'נגיע קצת באיחור'), R(5, 'דניאל', 'yes', 1, 1, 'צמחוני'), R(6, 'שירה', 'no', 0, 0, '', '', 'מצטערים, נהיה בחו״ל'),
];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const boxes = {};
  const mk = async (handler) => {
    const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
    await c.route(/supabase\.co\//, async (route) => {
      const url = route.request().url();
      const m = /rpc\/(\w+)/.exec(url);
      if (!m) return route.fulfill({ status: 201, contentType: 'application/json', body: '[]' });
      let args = {}; try { args = JSON.parse(route.request().postData() || '{}'); } catch { /* */ }
      const out = handler(m[1], args);
      console.log('rpc', m[1], JSON.stringify(args).slice(0, 140));
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out === undefined ? null : out) });
    });
    const p = await c.newPage();
    await p.clock.install({ time: new Date('2026-12-01T20:00:00+02:00') });
    return { c, p };
  };
  const helpers = (p) => {
    const hide = () => p.evaluate(() => {
      if (document.activeElement) document.activeElement.blur();
      if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important} section[aria-label="חבילת אירוע"]{display:none!important}'; document.head.appendChild(st); }
      for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.closest('aside') && !e.querySelector('.buga-a4') && !e.closest('.buga-a4')) e.style.visibility = 'hidden'; }
      for (const ta of document.querySelectorAll('textarea')) { ta.style.height = (ta.scrollHeight + 4) + 'px'; ta.scrollTop = 0; }
    });
    const vbox = async (loc) => { if (!(await loc.count())) return null; return loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }); };
    const scrollTo = async (loc, off) => { await loc.first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o), off); await p.clock.runFor(500); };
    const shot = async (k) => { await hide(); await p.waitForTimeout(250); return p.screenshot({ path: `shots/${k}.png` }); };
    const btn = (re) => p.getByRole('button', { name: re });
    const field = (label) => p.locator('label').filter({ hasText: label }).first();
    return { hide, vbox, scrollTo, shot, btn, field };
  };

  // ---------- 1. organizer: create ----------
  {
    let responses = [];
    const created = () => ({ ...EVENT, responses, yes_count: responses.filter((r) => r.status === 'yes').length });
    const { c, p } = await mk((fn) => {
      if (fn === 'rsvp_experience_version') return 2;
      if (fn === 'rsvp_create_v2' || fn === 'rsvp_host_v2') return created();
      if (fn === 'rsvp_extras_get') return { extras: {}, marks: {} };
      if (fn === 'rsvp_has_pin') return true;
      return null;
    });
    const { hide, vbox, scrollTo, shot, btn, field } = helpers(p);
    await p.goto('https://ugabuga.co.il/rsvp', { waitUntil: 'domcontentloaded' });
    await p.clock.runFor(4000); await p.waitForLoadState('networkidle'); await p.clock.runFor(1500);
    const form = p.locator('section').filter({ has: p.locator('form') }).first();
    const aside = p.locator('.rsvp-create-aside');
    const grab = async () => ({ form: await vbox(form), themes: await vbox(p.locator('.rsvp-theme-picker')), kinds: await vbox(p.locator('[role=group][aria-label="סוג האירוע"]')),
      title: await vbox(field('שם האירוע')), date: await vbox(field('תאריך').locator('..')), place: await vbox(field('מקום')), deadline: await vbox(field('לאשר עד')), note: await vbox(field('הערה לאורחים')),
      invitees: await vbox(field('רשימת מוזמנים')), pin: await vbox(p.locator('.bg-amber-50').filter({ has: p.locator('input[inputmode=numeric]') })), create: await vbox(btn(/יצירת קישור לאישור הגעה/)),
      preview: await vbox(p.locator('.rsvp-invitation')), info: await vbox(p.locator('.rsvp-info-box').first()), aside: await vbox(aside) });
    await scrollTo(form, 20);
    console.log('form top:', (await form.innerText()).slice(0, 300).replace(/\n/g, ' | '));
    await hide(); await p.waitForTimeout(150); boxes.blank = await grab(); await shot('blank');
    await field('שם האירוע').locator('input').click(); await p.clock.runFor(100); await p.keyboard.type('נועה');
    await field('תאריך').locator('input').first().fill('2026-12-17');
    await field('שעה').locator('input').fill('17:00–19:00');
    await field('מקום').locator('input').fill(PLACE);
    await field('לאשר עד').locator('input').fill('2026-12-12');
    await field('הערה לאורחים').locator('textarea').fill(NOTE);
    await p.clock.runFor(300);
    await scrollTo(form, 20);
    await hide(); await p.waitForTimeout(150); boxes.filled = await grab(); await shot('filled');
    console.log('preview:', (await p.locator('.rsvp-invitation').innerText()).replace(/\n/g, ' | '));
    await field('רשימת מוזמנים').locator('textarea').fill(NAMES.join('\n'));
    await p.locator('input[aria-label="קוד מארגן"]').fill('2580');
    await p.clock.runFor(300);
    await scrollTo(field('הערה לאורחים'), 20);
    await hide(); await p.waitForTimeout(150); boxes.filled2 = await grab(); await shot('filled2');
    console.log('count:', await field('רשימת מוזמנים').innerText());
    await btn(/יצירת קישור לאישור הגעה/).click(); await p.clock.runFor(1500); await p.waitForLoadState('networkidle'); await p.clock.runFor(1500);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.clock.runFor(600);
    const hostGrab = async () => {
      const sendBox = p.locator('aside section').filter({ hasText: 'שולחים לאורחים' });
      const stats = p.locator('section[aria-label="סיכום"]');
      const remind = p.locator('aside section').filter({ hasText: 'תזכורת למי שלא ענה' });
      const replies = p.locator('section').filter({ has: p.locator('h2', { hasText: /^התשובות/ }) }).last();
      return { send: await vbox(sendBox), wa: await vbox(btn(/שליחה בוואטסאפ/)), copy: await vbox(btn(/העתקת קישור/)), link: await vbox(sendBox.locator('p').first()), invite: await vbox(sendBox.locator('a').first()), bring: await vbox(sendBox.locator('a').nth(1)),
        card: await vbox(p.locator('.rsvp-invitation')), actions: await vbox(p.locator('.rsvp-event-actions')),
        stats: await vbox(stats), statPeople: await vbox(stats.locator('.grid > div').nth(0)), statKids: await vbox(stats.locator('.grid > div').nth(1)), statMissing: await vbox(stats.locator('.grid > div').nth(5)), statLine: await vbox(stats.locator('p').first()), allergy: await vbox(stats.locator('.bg-rose-50.p-3')),
        replies: await vbox(replies), printBtn: await vbox(btn(/🖨️ הדפסה/)), excelBtn: await vbox(btn(/אקסל/)), filters: await vbox(p.locator('.rsvp-filter-bar')), row1: await vbox(replies.locator('li').first()),
        remind: await vbox(remind), missing: await vbox(remind.locator('p').first()), remindBtn: await vbox(btn(/העתקת תזכורת לוואטסאפ/)), guestLink: await vbox(remind.locator('a').first()),
        bday: await vbox(p.locator('section[aria-labelledby="bcr-title"]')), personal: await vbox(p.locator('section[aria-labelledby="personal-reminders"]')), aside: await vbox(p.locator('aside').filter({ hasText: 'שולחים לאורחים' })) };
    };
    console.log('host0:', (await p.locator('main').innerText()).slice(0, 900).replace(/\n/g, ' | '));
    await hide(); await p.waitForTimeout(150); boxes.host0 = await hostGrab(); await shot('host0');
    // replies arrive (poll every 15s)
    responses = RESPONSES;
    await p.clock.runFor(16000); await p.waitForLoadState('networkidle'); await p.clock.runFor(800);
    const stats = p.locator('section[aria-label="סיכום"]');
    await scrollTo(stats, 20);
    console.log('stats:', (await stats.innerText()).replace(/\n/g, ' | '));
    await hide(); await p.waitForTimeout(150); boxes.host1 = await hostGrab(); await shot('host1');
    await scrollTo(p.locator('aside section').filter({ hasText: 'תזכורת למי שלא ענה' }), 20);
    console.log('remind:', (await p.locator('aside').last().innerText()).slice(0, 900).replace(/\n/g, ' | '));
    await hide(); await p.waitForTimeout(150); boxes.host2 = await hostGrab(); await shot('host2');
    await c.close();
  }

  // ---------- 2. a guest ----------
  {
    let mine = null;
    const { c, p } = await mk((fn, args) => {
      if (fn === 'rsvp_get_v2') return { ...EVENT, yes_count: 3, mine };
      if (fn === 'rsvp_extras_get') return { extras: {}, marks: {} };
      if (fn === 'rsvp_answer') { mine = { id: 9, ...args.p }; return mine; }
      return null;
    });
    const { hide, vbox, scrollTo, shot, btn, field } = helpers(p);
    await p.goto(`https://ugabuga.co.il/r/${CODE}?wa`, { waitUntil: 'domcontentloaded' });
    await p.clock.runFor(4000); await p.waitForLoadState('networkidle'); await p.clock.runFor(1500);
    const card = p.locator('.rsvp-invitation');
    const form = p.locator('section').filter({ has: p.locator('form') }).first();
    const g = async () => ({ card: await vbox(card), actions: await vbox(p.locator('.rsvp-event-actions')), lang: await vbox(p.locator('.rsvp-lang')), form: await vbox(form),
      name: await vbox(field('שם הילד/ה')), chips: await vbox(p.locator('[aria-label="בחירה מהרשימה"]')), chipYoav: await vbox(btn(/^יואב$/)),
      status: await vbox(p.locator('[role=group][aria-label="תשובה"]')), yes: await vbox(p.locator('[role=group][aria-label="תשובה"] button').first()),
      kids: await vbox(p.locator('form .rounded-xl.border-2.border-slate-200.bg-white').filter({ hasText: 'ילדים' }).first()), allergies: await vbox(field('אלרגיות')), pickup: await vbox(field('מי אוסף')),
      send: await vbox(btn(/שליחת אישור/)), done: await vbox(p.locator('[role=status]').filter({ hasText: 'נתראה' })) });
    await scrollTo(card, 20);
    console.log('guest:', (await p.locator('main').innerText()).slice(0, 700).replace(/\n/g, ' | '));
    await hide(); await p.waitForTimeout(150); boxes.guest = await g(); await shot('guest');
    await btn(/^יואב$/).click(); await p.clock.runFor(200);
    await p.locator('[role=group][aria-label="תשובה"] button').first().click(); await p.clock.runFor(300);
    await field('אלרגיות').locator('input').fill('בוטנים');
    await field('מי אוסף').locator('input').fill('אמא, ב-19:00');
    await p.clock.runFor(300);
    await scrollTo(form, 20);
    await hide(); await p.waitForTimeout(150); boxes.guestFilled = await g(); await shot('guestFilled');
    await btn(/שליחת אישור/).click(); await p.clock.runFor(1500); await p.waitForLoadState('networkidle'); await p.clock.runFor(600);
    await scrollTo(card, 20);
    console.log('done:', (await p.locator('main').innerText()).slice(0, 500).replace(/\n/g, ' | '));
    await hide(); await p.waitForTimeout(150); boxes.guestDone = await g(); await shot('guestDone');
    await c.close();
  }
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
