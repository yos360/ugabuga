// Real captures of ugabuga.co.il/classroom/report-card-comments (src/pages/classroom/ReportCardComments.jsx,
// src/data/reportCardComments.js). Viewport 1280×1100, DSF 2. Every shot is a viewport shot (org [0,0]).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1100;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem', permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await c.newPage();
  const boxes = {};
  // hide the site header and floating widgets, keep the sticky aside ("ההערכה שלי")
  const hide = () => p.evaluate(() => {
    if (document.activeElement && document.activeElement.tagName !== 'INPUT') document.activeElement.blur();
    if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}'; document.head.appendChild(st); }
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = tw.nextNode());) if (/\d–\d/.test(n.nodeValue) && !n.nodeValue.includes('⁦')) n.nodeValue = n.nodeValue.replace(/(\d+–\d+)/g, '⁦$1⁩');
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && e.getAttribute('aria-labelledby') !== 'mine-h') e.style.visibility = 'hidden'; }
  });
  const vbox = async (loc) => { if (!(await loc.count())) return null; return loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }); };
  const scrollTo = async (loc, off) => { await loc.first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o), off); await p.waitForTimeout(500); };
  const aside = p.locator('aside[aria-labelledby="mine-h"]');
  const grab = async () => ({
    aside: await vbox(aside), asideText: await vbox(aside.locator('p').first()), count: await vbox(aside.locator('p.text-sm').first()),
    copy: await vbox(aside.getByRole('button', { name: /העתקת|הועתק/ })), clear: await vbox(aside.getByRole('button', { name: /לתלמיד הבא/ })),
  });
  const shot = async (k, extra = {}) => { await hide(); await p.waitForTimeout(300); boxes[k] = { ...(await grab()), ...extra }; await p.screenshot({ path: `shots/${k}.png` }); };
  await p.goto('https://ugabuga.co.il/classroom/report-card-comments', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500); await hide();

  const h1 = p.locator('h1');
  const settings = p.locator('div.bg-amber-50').filter({ has: p.locator('legend') });
  const chips = p.locator('[role="group"][aria-label="סוג המשפטים"]');
  const sBox = async () => ({
    h1: await vbox(h1), settings: await vbox(settings), chips: await vbox(chips),
    boy: await vbox(settings.getByRole('button', { name: /תלמיד$/ })), girl: await vbox(settings.getByRole('button', { name: /תלמידה/ })),
    tf: await vbox(settings.getByRole('button', { name: 'מורה (את)' })), tm: await vbox(settings.getByRole('button', { name: 'מורה (אתה)' })),
    name: await vbox(settings.locator('label')), input: await vbox(settings.locator('input')),
  });
  // 1. hero + settings (default: boy, teacher "את")
  await scrollTo(h1, 20);
  await shot('top', await sBox());
  await settings.getByRole('button', { name: /תלמידה/ }).click();
  await settings.locator('input').fill('נועה'); await p.waitForTimeout(400);
  await shot('topGirl', await sBox());

  const lis = async (gid) => Promise.all([0, 1, 2, 3, 4, 5].map((i) => vbox(p.locator(`section[aria-labelledby="h-${gid}"] li`).nth(i))));
  const pickIn = async (gid, i) => { await p.locator(`section[aria-labelledby="h-${gid}"] li button`).nth(i).click(); await p.waitForTimeout(300); };
  // 2. the opener sentences; pick two
  const openH = p.locator('#h-open');
  await scrollTo(openH, 20);
  await shot('open0', { h: await vbox(openH), lis: await lis('open') });
  await pickIn('open', 0);
  await shot('open1', { h: await vbox(openH), lis: await lis('open') });
  await pickIn('open', 3);
  await shot('open2', { h: await vbox(openH), lis: await lis('open') });

  // 3. filter by topic: learning, then social
  const chipBox = async () => Promise.all((await chips.locator('button').all()).map((x) => vbox(x)));
  const chipShot = async (k, gid) => shot(k, { chips: await vbox(chips), chipList: await chipBox(), lis: gid ? await lis(gid) : null });
  await scrollTo(chips, 20);
  await chipShot('chipsAll', null);
  await chips.getByRole('button', { name: /הישגים ולמידה/ }).click(); await p.waitForTimeout(400); await scrollTo(chips, 20);
  await chipShot('learn0', 'learning');
  await pickIn('learning', 2);
  await chipShot('learn1', 'learning');
  await chips.getByRole('button', { name: /חברות ויחסים/ }).click(); await p.waitForTimeout(400); await scrollTo(chips, 20);
  await pickIn('social', 0);
  await chipShot('social1', 'social');

  // 4. filter by group: goals, then close
  await chips.getByRole('button', { name: /יעדים להמשך/ }).click(); await p.waitForTimeout(400);
  await scrollTo(chips, 20);
  await shot('goals0', { chips: await vbox(chips), chipList: await chipBox(), lis: await lis('goals') });
  await pickIn('goals', 1);
  await shot('goals1', { chips: await vbox(chips), chipList: await chipBox(), lis: await lis('goals') });
  await chips.getByRole('button', { name: /סיום ואיחול/ }).click(); await p.waitForTimeout(400);
  await scrollTo(chips, 20);
  await pickIn('close', 0);
  await shot('close1', { chips: await vbox(chips), chipList: await chipBox(), lis: await lis('close') });
  console.log('aside:', (await aside.innerText()).replace(/\n/g, ' | '));

  // 5. copy, then clear for the next student
  await aside.getByRole('button', { name: /העתקת/ }).click(); await p.waitForTimeout(250);
  await shot('copied');
  console.log('clipboard:', await p.evaluate(() => navigator.clipboard.readText()));
  await p.waitForTimeout(2000);
  await aside.getByRole('button', { name: /לתלמיד הבא/ }).click(); await p.waitForTimeout(300);
  await shot('cleared');

  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
