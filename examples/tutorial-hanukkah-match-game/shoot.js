// Real captures of ugabuga.co.il/holidays/hanukkah/match-game (src/pages/holidays/HanukkahMatchGame.jsx, src/data/hanukkahMatchGame.js).
// Full-page screenshots at DSF 2 -> img/<state>.png; printed sheets -> img/sheet-<k>.png; boxes (page CSS) -> boxes.js.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
const VW = 1280, VH = 1100;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  await c.route(/supabase\.co\//, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  const p = await c.newPage();
  await p.goto(process.env.SHOOT_URL || 'https://ugabuga.co.il/holidays/hanukkah/match-game', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const hide = () => p.evaluate(() => {
    if (document.activeElement) document.activeElement.blur();
    if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}'; document.head.appendChild(st); }
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.closest('dialog')) e.style.visibility = 'hidden'; }
  });
  const box = async (loc) => { if (!(await loc.count())) return null; return loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height].map(Math.round); }); };
  const boxes = {};
  const btn = (t) => p.locator('button', { hasText: t });
  const play = p.locator('section[aria-labelledby="play-h"]');
  // the two round cards and every symbol button on them
  const cardsInfo = () => play.evaluate((sec) => {
    const R = (e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height].map(Math.round); };
    const cards = [...sec.querySelectorAll('div')].filter((d) => d.style.borderRadius === '50%');
    return cards.map((cd) => ({ box: R(cd), syms: [...cd.querySelectorAll('button')].map((bt) => ({ w: bt.getAttribute('aria-label'), box: R(bt) })) }));
  });
  const grab = async () => ({
    decks: await box(p.locator('nav[aria-label="בחירת חפיסה"]')), small: await box(btn('חפיסה קטנה לגן')), big: await box(btn('חפיסה גדולה')),
    desc: await box(p.locator('p', { hasText: 'קלפים,' }).first()),
    modes: await box(p.locator('nav[aria-label="מה מופיע על הקלפים"]')), pics: await box(btn('🖼️ תמונות')), both: await box(btn('🔤 תמונה ומילה')), words: await box(btn('📖 מילים בלבד')),
    play: await box(play), playHead: await box(play.locator('p').first()), status: await box(play.locator('p[role=status]')),
    done: await box(play.locator('div[role=status]')), again: await box(play.locator('button', { hasText: 'עוד סבב' })),
    print: await box(btn('הדפסת הקלפים')), cards: await cardsInfo(),
  });
  const shot = async (k) => { await hide(); await p.waitForTimeout(300); boxes[k] = await grab(); await p.screenshot({ path: `img/${k}.png`, fullPage: true }); console.log(k, JSON.stringify({ ...boxes[k], cards: boxes[k].cards.map((x) => x.syms.map((s) => s.w).join(',')) })); };
  const pair = (info) => { const a = info[0].syms.map((s) => s.w), bb = info[1].syms.map((s) => s.w); const m = a.find((w) => bb.includes(w)); return { m, wrong: a.find((w) => w !== m) }; };
  const tapSym = (w) => play.locator(`button[aria-label="${w}"]`).first().click();

  await shot('start');
  console.log('desc small:', await p.locator('p', { hasText: 'קלפים,' }).first().innerText());
  await btn('חפיסה גדולה').click(); await p.waitForTimeout(400); await shot('big');
  console.log('desc big:', await p.locator('p', { hasText: 'קלפים,' }).first().innerText());
  await btn('📖 מילים בלבד').click(); await p.waitForTimeout(400); await shot('words');
  await btn('🔤 תמונה ומילה').click(); await btn('חפיסה קטנה לגן').click(); await p.waitForTimeout(400); await shot('play');
  // hold the "right" mark on screen long enough to capture it
  await p.evaluate(() => { const o = window.setTimeout; window.__o = o; window.setTimeout = (f, ms, ...a) => o(f, ms === 800 ? 8000 : ms, ...a); });
  const pr = pair(boxes.play.cards); boxes.picked = pr; console.log('pair', pr);
  await tapSym(pr.wrong); await p.waitForTimeout(300); await shot('wrong');
  console.log('wrong msg:', await play.locator('p[role=status]').innerText());
  await tapSym(pr.m); await p.waitForTimeout(300); await shot('right');
  console.log('right msg:', await play.locator('p[role=status]').innerText(), '|', await play.locator('p').first().innerText());
  await p.evaluate(() => { window.setTimeout = window.__o; });
  await p.waitForTimeout(8500);
  // finish the round at a child's pace (~2.3 s a pair), then the finish screen
  for (let i = 0; i < 14 && !(await play.locator('div[role=status]').count()); i++) {
    await p.waitForTimeout(1400);
    const info = await cardsInfo(); if (info.length < 2) break;
    await tapSym(pair(info).m); await p.waitForTimeout(950);
  }
  await p.waitForTimeout(300); await shot('done');
  console.log('done:', await play.locator('div[role=status]').innerText());
  console.log('print btn:', await btn('הדפסת הקלפים').innerText());
  await btn('הדפסת הקלפים').click(); await p.waitForTimeout(1500);
  await hide();
  const dlg = p.locator('dialog.buga-print-dialog');
  const vp = (l) => l.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); });
  boxes.dialog = { toolbar: await vp(dlg.locator('.buga-print-toolbar')), pdf: await vp(dlg.locator('[data-save-pdf]')), printBtn: await vp(dlg.getByRole('button', { name: '🖨️ הדפסה' })) };
  console.log('dialog', JSON.stringify(boxes.dialog));
  await p.screenshot({ path: 'img/dialog.png' });
  const arts = dlg.locator('.buga-preview-pages article.buga-a4');
  console.log('articles', await arts.count());
  await arts.nth(0).screenshot({ path: 'img/sheet-cards.png' });
  await arts.last().screenshot({ path: 'img/sheet-rules.png' });
  boxes.sheetCards = await vp(arts.nth(0)); boxes.sheetRules = await vp(arts.last());
  fs.writeFileSync('boxes.js', 'globalThis.BOXES = ' + JSON.stringify(boxes) + ';\n');
  await b.close();
})();
