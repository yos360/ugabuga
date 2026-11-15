// Real captures of ugabuga.co.il/classroom/warm-up (src/pages/classroom/WarmUp.jsx, src/classroom/warmUp.js).
// The page clock is pinned (Playwright clock) so "החימום של היום" and the timer are deterministic.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1100;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL' });
  const p = await c.newPage();
  await p.clock.install({ time: new Date('2026-11-15T09:00:00+02:00') });
  const hide = () => p.evaluate(() => { if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important}'; document.head.appendChild(st); } const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) if (/^\d+ [+−×÷] \d+ = \?$/.test(n.nodeValue)) n.nodeValue = '⁦' + n.nodeValue + '⁩'; for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.visibility = 'hidden'; } });
  const vbox = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  const boxes = {};
  const scrollTo = async (loc, off) => { await loc.evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o), off); await p.clock.runFor(500); };
  const shot = async (k) => { await hide(); return p.screenshot({ path: `shots/${k}.png` }); };
  const btn = (re, root = p) => root.getByRole('button', { name: re });
  await p.goto('https://ugabuga.co.il/classroom/warm-up', { waitUntil: 'domcontentloaded' });
  await p.clock.runFor(4000); await p.waitForLoadState('networkidle'); await p.clock.runFor(2000); await hide();
  const set = p.locator('section[aria-label="הגדרות החימום"]');
  const stage = p.locator('section[aria-label="מסך החימום"]');
  await scrollTo(p.locator('h1'), 20); await hide();
  const grab = async () => ({ set: await vbox(set), stage: await vbox(stage),
    themes: await vbox(set.locator('[aria-label="נושא"]')), lengths: await vbox(set.locator('[aria-label="אורך"]')),
    today: await vbox(set.locator('p').last()), fresh: await vbox(btn(/^סדרה חדשה$/, set)),
    full: await vbox(btn(/מסך מלא/, stage)), sound: await vbox(stage.locator('button[aria-pressed]')) });
  const themeBtn = (re) => set.locator('[aria-label="נושא"] button', { hasText: re });
  const lenBtn = (n) => set.locator('[aria-label="אורך"] button', { hasText: `${n} דקות` });
  console.log('theme pressed:', await set.locator('[aria-label="נושא"] button[aria-pressed="true"]').innerText());
  boxes.top = { ...(await grab()), h1: await vbox(p.locator('h1')), sport: await vbox(themeBtn('ספורטיבי')), han: await vbox(themeBtn('חנוכה')), math: await vbox(themeBtn('חשבון')), calm: await vbox(themeBtn('נרגעים')), eng: await vbox(themeBtn('Simon')), purim: await vbox(themeBtn('פורים')),
    l2: await vbox(lenBtn(2)), l3: await vbox(lenBtn(3)), l5: await vbox(lenBtn(5)), start: await vbox(btn(/מתחילים/, stage)), list: await vbox(stage.locator('ol')) };
  console.log('preview:', (await stage.innerText()).replace(/\n/g, ' | '));
  await shot('top');
  // 5 minutes
  await lenBtn(5).click(); await p.clock.runFor(400);
  boxes.five = { ...(await grab()), l5: await vbox(lenBtn(5)), start: await vbox(btn(/מתחילים/, stage)), list: await vbox(stage.locator('ol')) };
  console.log('five:', (await stage.innerText()).replace(/\n/g, ' | '));
  await shot('five');
  await lenBtn(3).click(); await p.clock.runFor(400);
  // start (hanukkah, 3 min)
  await scrollTo(stage, 20); await hide();
  boxes.preview = { ...(await grab()), start: await vbox(btn(/מתחילים/, stage)), list: await vbox(stage.locator('ol')) };
  await shot('preview');
  await btn(/מתחילים/, stage).click(); await p.clock.runFor(300);
  const exBoxes = async () => ({ ...(await grab()), prev: await vbox(btn(/הקודם/, stage)), pause: await vbox(btn(/עצירה|המשך/, stage)), next: await vbox(btn(/הבא/, stage)), h2: await vbox(stage.locator('h2')), timer: await vbox(stage.locator('p.tabular-nums')), reset: await vbox(btn(/חזרה להתחלה/, stage)) });
  await scrollTo(stage, 20); await hide();
  boxes.ex1a = await exBoxes(); console.log('ex1a:', (await stage.innerText()).replace(/\n/g, ' | ')); await shot('ex1a');
  await p.clock.runFor(12000);
  boxes.ex1b = await exBoxes(); console.log('ex1b:', (await stage.innerText()).replace(/\n/g, ' | ')); await shot('ex1b');
  await btn(/הבא/, stage).click(); await p.clock.runFor(4300);
  boxes.ex2 = await exBoxes(); console.log('ex2:', (await stage.innerText()).replace(/\n/g, ' | ')); await shot('ex2');
  await btn(/עצירה/, stage).click(); await p.clock.runFor(300);
  boxes.ex2p = await exBoxes(); console.log('ex2p:', (await stage.innerText()).replace(/\n/g, ' | ')); await shot('ex2p');
  await btn(/המשך/, stage).click(); await p.clock.runFor(300);
  // jump to the last exercise and let it run out → finished screen
  for (let i = 0; i < 6; i++) { const n = btn(/הבא/, stage); if (await n.isDisabled()) break; await n.click(); await p.clock.runFor(200); }
  await p.clock.runFor(8000);
  boxes.last = await exBoxes(); console.log('last:', (await stage.innerText()).replace(/\n/g, ' | ')); await shot('last');
  await p.clock.runFor(25000);
  await scrollTo(stage, 20); await hide();
  boxes.done = { ...(await grab()), again: await vbox(btn(/שוב/, stage)), h2: await vbox(stage.locator('h2')) };
  console.log('done:', (await stage.innerText()).replace(/\n/g, ' | ')); await shot('done');
  // math in motion
  await scrollTo(p.locator('h1'), 20); await hide();
  await themeBtn('חשבון').click(); await p.clock.runFor(400);
  boxes.mathSet = { ...(await grab()), bands: await vbox(set.locator('[aria-label="רמה"]')), math: await vbox(themeBtn('חשבון')), start: await vbox(btn(/מתחילים/, stage)), list: await vbox(stage.locator('ol')) };
  console.log('math:', (await stage.innerText()).replace(/\n/g, ' | ')); await shot('mathSet');
  await btn(/מתחילים/, stage).click(); await p.clock.runFor(300);
  await scrollTo(stage, 20); await hide();
  await p.clock.runFor(5000);
  boxes.mathQ = await exBoxes(); console.log('mathQ:', (await stage.innerText()).replace(/\n/g, ' | ')); await shot('mathQ');
  await p.clock.runFor(12000);
  boxes.mathA = { ...(await exBoxes()), ans: await vbox(stage.locator('p[aria-live]')) }; console.log('mathA:', (await stage.innerText()).replace(/\n/g, ' | ')); await shot('mathA');
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
