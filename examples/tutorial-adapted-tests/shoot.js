// Real captures of ugabuga.co.il/learn/adapted-tests (src/learn/subjects/AdaptedHub.jsx, AdaptedExam.jsx, AdaptedExtras.jsx).
// Full-page screenshots at DSF 2; boxes are page CSS coords (org [0,0]) -> shots/boxes.json.
// No Hebrew voice in headless Chrome, so the "no Hebrew voice" note is hidden (phones/Chrome have the voice).
// The hub gets subjects.css injected: mirrors the site fix (AdaptedHub.jsx now imports subjects.css).
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1100;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  await c.route(/supabase\.co\//, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  const p = await c.newPage();
  const hide = () => p.evaluate(() => {
    if (document.activeElement) document.activeElement.blur();
    if (!document.getElementById('nt')) { const st = document.createElement('style'); st.id = 'nt'; st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}.ad-note{display:none!important}'; document.head.appendChild(st); }
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.closest('dialog')) e.style.visibility = 'hidden'; }
  });
  const box = async (loc) => { if (!(await loc.count())) return null; return loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height].map(Math.round); }); };
  const vb = async (l) => (await l.count()) ? l.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }) : null;
  const boxes = {};
  const Q = {
    h1: 'h1', features: 'ul.ad-list', grid: 'ul.sj-grid', mathCard: 'ul.sj-grid >> li >> nth=0', readCard: 'ul.sj-grid >> li >> nth=1',
    g3: 'a.ln-chip:has-text("כיתה ג׳")', otherH2: 'h2:has-text("שאר המקצועות")', otherGrid: 'ul.sj-grid >> nth=1',
    intro: '.ad-intro', settings: '.ad-settings', start: '.ad-start', printBtn: 'button:has-text("להדפסה באותיות גדולות")', regular: 'button:has-text("למבחן הרגיל")',
    top: '.ad-top', card: '.ad-card', q: '.ad-q', expr: '.ad-expr', read: '.ad-read', opts: '.ad-opts', opt0: '.ad-row >> nth=0', opt1: '.ad-row >> nth=1', opt2: '.ad-row >> nth=2',
    say0: '.ad-say >> nth=0', say2: '.ad-say >> nth=2', score1: '.ad-score >> nth=0', score2: '.ad-score >> nth=1', mathChips: 'ul.sj-grid >> li >> nth=0 >> div.mt-2', readChips: 'ul.sj-grid >> li >> nth=1 >> div.mt-2', say1: '.ad-say >> nth=1', fb: '.ad-fb', next: 'button:has-text("לשאלה הבאה")', done: '.ad-done', stars: '.ad-stars', again: 'button:has-text("עוד מבחן מותאם")', lessons: 'a:has-text("לשיעורים של הכיתה")',
  };
  const grab = async () => { const o = {}; for (const [k, s] of Object.entries(Q)) { const v = await box(p.locator(s)); if (v) o[k] = v; } return o; };
  const shot = async (k) => { await hide(); await p.waitForTimeout(300); boxes[k] = await grab(); await p.screenshot({ path: `shots/${k}.png`, fullPage: true }); console.log(k, JSON.stringify(boxes[k])); };
  const info = () => p.evaluate(() => ({ q: document.querySelector('.ad-q')?.innerText, expr: document.querySelector('.ad-expr')?.innerText, opts: [...document.querySelectorAll('.ad-opt')].map((e) => e.innerText), fb: document.querySelector('.ad-fb')?.innerText }));

  await p.goto('https://ugabuga.co.il/learn/adapted-tests', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  await p.addStyleTag({ content: fs.readFileSync('C:/Users/pc/Documents/ugabuga/src/learn/subjects/subjects.css', 'utf8') + '.sj-grid .sj-card{height:auto}' });
  await shot('hub');
  await p.goto('https://ugabuga.co.il/learn/adapted-tests/math/grade-3', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await shot('intro');
  // print preview from the intro screen
  await p.locator('button:has-text("להדפסה באותיות גדולות")').click(); await p.waitForTimeout(1500);
  await hide();
  const dlg = p.locator('dialog.buga-print-dialog');
  await p.screenshot({ path: 'shots/print.png' });
  boxes.print = { toolbar: await vb(dlg.locator('.buga-print-toolbar')), pdf: await vb(dlg.locator('[data-save-pdf]')), printBtn: await vb(dlg.getByRole('button', { name: '🖨️ הדפסה' })), page: await vb(dlg.locator('article').first()) };
  console.log('print', JSON.stringify(boxes.print));
  await dlg.getByRole('button', { name: 'סגירת תצוגת ההדפסה' }).click(); await p.waitForTimeout(500);
  const solve = () => p.evaluate(() => {
    const ex = (document.querySelector('.ad-expr')?.innerText || '').replace(/[⁦⁩]/g, '').replace(/=\s*\?/, '').replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').trim();
    if (!/^[\d\s+*/().-]+$/.test(ex)) return -1;
    const v = Function('return (' + ex + ')')();
    return [...document.querySelectorAll('.ad-opt')].findIndex((e) => e.innerText.replace(/^.\.\s*/, '').trim() === String(v));
  });
  for (let tries = 0; tries < 8; tries++) {
    await p.locator('.ad-start').click(); await p.waitForTimeout(800);
    if ((await solve()) >= 0) break;
    await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  }
  console.log('Q1', JSON.stringify(await info()));
  await shot('q1');
  const ans = await solve();
  await p.locator('.ad-opt').nth(ans === 0 ? 1 : 0).click(); await p.waitForTimeout(400);
  console.log('after wrong', JSON.stringify(await info()));
  await shot('wrong');
  await p.locator('.ad-opt').nth(ans).click(); await p.waitForTimeout(400);
  console.log('after right', JSON.stringify(await info()));
  await shot('right');
  for (let k = 1; k < 10; k++) {
    await p.locator('button:has-text("לשאלה הבאה"), button:has-text("לסיום")').first().click(); await p.waitForTimeout(500);
    console.log('Q' + (k + 1), JSON.stringify(await info()));
    const s2 = await solve();
    if (s2 >= 0) { await p.locator('.ad-opt').nth(s2).click(); await p.waitForTimeout(250); continue; }
    for (let j = 0; j < 3; j++) {
      if (await p.locator('.ad-opt.is-right').count()) break;
      const o = p.locator('.ad-opt').nth(j); if (await o.isDisabled()) continue;
      await o.click(); await p.waitForTimeout(250);
    }
  }
  await p.locator('button:has-text("לסיום")').click(); await p.waitForTimeout(600);
  await shot('done');
  console.log('DONE', (await p.locator('.ad-done').innerText()).replace(/\n/g, ' | '));
  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  await b.close();
})();
