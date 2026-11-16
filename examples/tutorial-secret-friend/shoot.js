// Real captures of ugabuga.co.il/secret-friend (src/pages/tools/group/SecretFriend.jsx, src/utils/groupTools.js).
// The page UI is the live site's own; the Supabase RPC answers (secret_create / secret_organizer / secret_whoami /
// secret_reveal) are mocked with route.fulfill, so nothing is written to the database.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1100;
const TITLE = 'מתנות לחנוכה — כיתה ג׳2';
const NAMES = ['נועה', 'יואב', 'מאיה', 'אורי', 'תמר', 'דניאל', 'שירה', 'איתי'];
const BUDGET = 'עד 30 ש״ח', NOTE = 'ביום חמישי בכיתה';
const org = (opened = []) => ({ code: 'k7m2qa', mode: 'hanukkah', title: TITLE, note: NOTE, budget: BUDGET, shown_all: false,
  people: NAMES.map((name, idx) => ({ idx, name, token: 'tok' + idx + '-4f9a2c7e', opened: opened.includes(idx) })) });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const boxes = {};
  const mk = async (handler) => {
    const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
    await c.route(/supabase\.co\/rest\/v1\/rpc\/(secret_\w+)/, async (route) => {
      const fn = /rpc\/(secret_\w+)/.exec(route.request().url())[1];
      let args = {}; try { args = JSON.parse(route.request().postData() || '{}'); } catch { /* */ }
      const out = handler(fn, args);
      console.log('rpc', fn, JSON.stringify(args).slice(0, 160));
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
    });
    const p = await c.newPage();
    await p.clock.install({ time: new Date('2026-12-01T19:00:00+02:00') });
    return { c, p };
  };
  const helpers = (p) => {
    const hide = () => p.evaluate(() => {
      if (document.activeElement) document.activeElement.blur(); { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) if (/(^|[^⁦])3–60/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace('3–60', '⁦3–60⁩'); } const ta = document.querySelector('textarea'); if (ta) { ta.style.height = (ta.scrollHeight + 4) + 'px'; ta.scrollTop = 0; }
      if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}'; document.head.appendChild(st); }
      for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.querySelector('.buga-a4') && !e.closest('.buga-a4') && !/✓/.test(e.innerText || '')) e.style.visibility = 'hidden'; }
    });
    const vbox = (loc) => loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }).catch(() => null);
    const scrollTo = async (loc, off) => { await loc.first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o), off); await p.clock.runFor(500); };
    const shot = async (k) => { await hide(); await p.waitForTimeout(200); return p.screenshot({ path: `shots/${k}.png` }); };
    const btn = (re) => p.getByRole('button', { name: re });
    return { hide, vbox, scrollTo, shot, btn };
  };

  // ---------- 1. organizer ----------
  {
    let opened = [];
    const { c, p } = await mk((fn) => {
      if (fn === 'secret_create' || fn === 'secret_organizer') return org(opened);
      return null;
    });
    const { hide, vbox, scrollTo, shot, btn } = helpers(p);
    await p.goto('https://ugabuga.co.il/secret-friend', { waitUntil: 'domcontentloaded' });
    await p.clock.runFor(4000); await p.waitForLoadState('networkidle'); await p.clock.runFor(1500);
    const form = p.locator('section').filter({ has: p.locator('textarea') }).first();
    const grab = async () => ({ form: await vbox(form), modes: await vbox(p.locator('[role=group][aria-label="סוג ההגרלה"]')),
      mGamad: await vbox(btn(/גמד וענק/).first()), mPurim: await vbox(btn(/משלוח מנות/)), mHan: await vbox(btn(/מתנות לחנוכה/)),
      title: await vbox(form.locator('input').first()), names: await vbox(form.locator('textarea')), count: await vbox(form.locator('textarea ~ span').last()),
      excl: await vbox(form.locator('div.border-dashed').filter({ hasText: 'מי לא יגרילו' })), chip: await vbox(form.locator('.border-dashed li').first()),
      budget: await vbox(form.locator('input').nth(1)), note: await vbox(form.locator('input').nth(2)),
      draw: await vbox(btn(/הגרלה עם קישור אישי/)), slips: await vbox(btn(/פתקים מוגרלים/)), hat: await vbox(btn(/פתקי שמות לשליפה/)),
      aside: await vbox(p.locator('aside').filter({ hasText: 'איך זה עובד' })), h1: await vbox(p.locator('h1')) });
    await scrollTo(p.locator('h1'), 20);
    boxes.blank = await grab(); await shot('blank');
    await btn(/מתנות לחנוכה/).click(); await p.clock.runFor(300);
    console.log('title after mode:', await form.locator('input').first().inputValue());
    boxes.mode = await grab(); await shot('mode');
    await form.locator('input').first().fill(TITLE); await p.clock.runFor(200);
    boxes.titled = await grab(); await shot('titled');
    await scrollTo(form.locator('[role=group]'), 20);
    await form.locator('textarea').fill(NAMES.join('\n')); await p.clock.runFor(300);
    await hide(); await p.clock.runFor(100);
    boxes.names = await grab(); await shot('names');
    const sel = form.locator('.border-dashed select');
    await sel.nth(0).selectOption('יואב'); await sel.nth(1).selectOption('מאיה'); await p.clock.runFor(200);
    await form.locator('.border-dashed').getByRole('button', { name: 'הוספה' }).click(); await p.clock.runFor(200);
    await form.locator('input').nth(1).fill(BUDGET); await form.locator('input').nth(2).fill(NOTE); await p.clock.runFor(200);
    await hide(); await scrollTo(form.locator('textarea'), 20);
    boxes.excl = await grab(); await shot('excl');
    console.log('form:', (await form.innerText()).replace(/\n/g, ' | '));
    // printable slips
    await btn(/פתקים מוגרלים/).click(); await p.clock.runFor(1500);
    const a4 = p.locator('.buga-a4').first();
    await a4.scrollIntoViewIfNeeded().catch(() => {});
    await p.clock.runFor(500);
    console.log('slips:', (await a4.innerText()).slice(0, 400).replace(/\n/g, ' | '));
    boxes.slips = { a4: await vbox(a4), slip: await vbox(p.locator('.gt-slip').first()), slip2: await vbox(p.locator('.gt-slip').nth(1)) };
    await shot('slips');
    await a4.screenshot({ path: 'shots/slipsA4.png' }).catch((e) => console.log('a4 shot', String(e)));
    await p.keyboard.press('Escape'); await p.clock.runFor(400);
    if (await p.locator('.buga-a4').count()) { await p.getByRole('button', { name: /סגירה|סגור|✕|×/ }).first().click().catch(() => {}); await p.clock.runFor(400); }
    console.log('a4 left:', await p.locator('.buga-a4').count());
    // online draw
    await btn(/הגרלה עם קישור אישי/).click(); await p.clock.runFor(1500); await p.waitForLoadState('networkidle'); await p.clock.runFor(800);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.clock.runFor(800);
    const sec = p.locator('section').filter({ hasText: 'ההגרלה בוצעה' }).first();
    await scrollTo(sec, 20);
    const grabO = async () => ({ sec: await vbox(sec), info: await vbox(sec.locator('p.bg-sky-50')), badge: await vbox(sec.locator('span.rounded-full').first()), list: await vbox(sec.locator('ul')),
      row1: await vbox(sec.locator('li').nth(0)), send1: await vbox(sec.locator('li').nth(0).getByRole('button').first()), link1: await vbox(sec.locator('li').nth(0).getByRole('button').nth(1)),
      group: await vbox(p.locator('aside section').first()), groupBtn: await vbox(btn(/הודעה לקבוצה/)), aside: await vbox(p.locator('aside').last()) });
    console.log('org:', (await p.locator('main').innerText()).slice(0, 700).replace(/\n/g, ' | '));
    boxes.org = await grabO(); await shot('org');
    opened = [0, 2, 4, 5];
    await p.clock.runFor(21000); await p.waitForLoadState('networkidle'); await p.clock.runFor(500);
    await scrollTo(sec, 20);
    boxes.org2 = await grabO(); await shot('org2');
    console.log('org2 badge:', await sec.locator('span.rounded-full').first().innerText());
    await c.close();
  }

  // ---------- 2. a participant's personal link ----------
  {
    const { c, p } = await mk((fn) => {
      if (fn === 'secret_whoami') return { mode: 'hanukkah', title: TITLE, note: NOTE, budget: BUDGET, name: 'נועה', opened: false, shown_all: false };
      if (fn === 'secret_reveal') return { target: 'אורי' };
      return null;
    });
    const { vbox, scrollTo, shot, btn } = helpers(p);
    await p.goto('https://ugabuga.co.il/g/k7m2qa#p=tok0-4f9a2c7e', { waitUntil: 'domcontentloaded' });
    await p.clock.runFor(4000); await p.waitForLoadState('networkidle'); await p.clock.runFor(1500);
    const card = p.locator('section').filter({ hasText: 'שלום' }).first();
    await scrollTo(card, 30);
    console.log('pv:', (await card.innerText()).replace(/\n/g, ' | '));
    boxes.pv = { card: await vbox(card), h1: await vbox(card.locator('h1')), reveal: await vbox(btn(/גלו את מי הגרלתם/)) };
    await shot('pv');
    await btn(/גלו את מי הגרלתם/).click(); await p.clock.runFor(1200); await p.waitForLoadState('networkidle'); await p.clock.runFor(600);
    await scrollTo(card, 30);
    console.log('pvOpen:', (await card.innerText()).replace(/\n/g, ' | '));
    boxes.pvOpen = { card: await vbox(card), target: await vbox(card.locator('.gt-reveal p').nth(1)), task: await vbox(card.locator('.gt-reveal p').nth(2)), budget: await vbox(card.locator('.gt-reveal p').nth(3)), secret: await vbox(card.locator('.gt-reveal p').nth(4)) };
    await shot('pvOpen');
    await c.close();
  }
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
