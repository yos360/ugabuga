// Real captures of ugabuga.co.il /math/word-problems (src/math/WordProblemsGuide.jsx, data/wordProblemsByGrade.js).
// Viewport 1280×1100, DSF 2, viewport shots (org [0,0]). Demo grade: grade-3.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const fs = require('fs');
fs.rmSync('shots', { recursive: true, force: true }); fs.mkdirSync('shots', { recursive: true });
const VW = 1280, VH = 1100, BASE = process.env.BASE || 'https://ugabuga.co.il';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  const p = await c.newPage();
  const boxes = {};
  const hide = () => p.evaluate(() => {
    if (document.activeElement && document.activeElement.tagName !== 'INPUT') document.activeElement.blur();
    let st = document.getElementById('nt');
    if (!st) { st = document.createElement('style'); st.id = 'nt'; document.head.appendChild(st); }
    st.textContent = '*{transition:none!important;animation:none!important;caret-color:transparent!important}';
    for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'fixed' || s.position === 'sticky') && !e.closest('dialog')) e.style.visibility = 'hidden'; }
  });
  const vbox = async (loc) => { if (!(await loc.count())) return null; return loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }); };
  const scrollTo = async (loc, off) => { await loc.first().evaluate((e, o) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - o), off); await p.waitForTimeout(600); };
  const shot = async (k, extra = {}) => { await hide(); await p.waitForTimeout(400); const o = {}; for (const [n, l] of Object.entries(extra)) o[n] = await vbox(l); boxes[k] = o; await p.screenshot({ path: `shots/${k}.png` }); };
  const settle = async () => { await p.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(1200); };

  // hub
  await p.goto(`${BASE}/math/word-problems`); await settle(); await hide();
  await scrollTo(p.locator('h1'), 120);
  const nav = p.locator('nav[aria-label="בחירת כיתה"]');
  await shot('hub', { h1: p.locator('h1'), nav, g3: nav.locator('a[href="/math/word-problems/grade-3"]') });
  const gs = p.locator('section[aria-label="הכיתות"]');
  await scrollTo(gs, 300);
  await shot('grades', { sec: gs, g2: gs.locator('a').nth(0), g3: gs.locator('a').nth(1), g4: gs.locator('a').nth(2) });
  console.log('grades', (await gs.innerText()).replace(/\n+/g, ' | '));

  // grade 3
  await p.goto(`${BASE}/math/word-problems/grade-3`); await settle(); await hide();
  await scrollTo(p.locator('h1'), 120);
  await shot('g3top', { h1: p.locator('h1'), intro: p.locator('header p'), nav: p.locator('nav[aria-label="בחירת כיתה"]'), prac: p.locator('a[href="#practice"]'), all: p.locator('a[href="#all"]'), print: p.getByRole('button', { name: '🖨️ דף עבודה להדפסה' }) });
  const mh = p.locator('#method-h');
  await scrollTo(mh, 200);
  const cards = p.locator('section[aria-labelledby="method-h"] li');
  await shot('method', { mh, c1: cards.nth(0), c2: cards.nth(1), c3: cards.nth(2), c4: cards.nth(3) });
  const ex = p.locator('section[aria-labelledby="ex-h"]');
  await scrollTo(ex, 200);
  await shot('example', { ex, h: p.locator('#ex-h'), q: ex.locator('p').first(), sol: ex.locator('ol'), s3: ex.locator('ol li').nth(2), s4: ex.locator('ol li').nth(3) });
  console.log('example', (await ex.innerText()).replace(/\n+/g, ' | '));

  // practice
  const pr = p.locator('#practice');
  await scrollTo(pr, 120);
  const inp = p.locator('#wp-ans');
  await shot('prac0', { h: p.locator('#prac-h'), levels: p.locator('[aria-label="בחירת רמה"]'), q: pr.locator('p.text-xl'), inp, chk: pr.getByRole('button', { name: '✔️ בדיקה' }) });
  console.log('q', await pr.locator('p.text-xl').innerText(), '| meta', await pr.locator('p.text-sm').first().innerText());
  await inp.fill('574'); await p.waitForTimeout(300);
  await shot('prac1', { inp, chk: pr.getByRole('button', { name: '✔️ בדיקה' }) });
  await pr.getByRole('button', { name: '✔️ בדיקה' }).click(); await p.waitForTimeout(600);
  const fb = pr.locator('[aria-live="polite"] > div');
  await shot('prac2', { fb, ok: fb.locator('p').first(), next: pr.getByRole('button', { name: /לשאלה הבאה/ }) });
  console.log('fb', (await fb.innerText()).replace(/\n+/g, ' | '));

  // all problems: open a solution
  const all = p.locator('#all');
  await scrollTo(all, 120);
  await shot('all', { h: p.locator('#all-h'), sum: all.locator('summary').first(), l1: all.locator('h3').first() });

  // print preview
  await scrollTo(p.locator('h1'), 120);
  await p.getByRole('button', { name: '🖨️ דף עבודה להדפסה' }).click(); await p.waitForTimeout(1800);
  const dlg = p.locator('dialog.buga-print-dialog');
  await shot('preview', { bar: dlg.locator('.buga-print-toolbar'), pdf: dlg.locator('button[data-save-pdf]'), prn: dlg.getByRole('button', { name: /🖨️ הדפסה/ }), page: dlg.locator('.buga-preview-pages .buga-a4').first(), page3: dlg.locator('.buga-preview-pages .buga-a4').nth(2) });
  console.log('toolbar', (await dlg.locator('.buga-print-toolbar').innerText()).replace(/\n+/g, ' | '));
  const pages = dlg.locator('.buga-preview-pages .buga-a4');
  console.log('pages', await pages.count());
  await pages.nth(0).screenshot({ path: 'shots/sheet1.png' });
  await pages.nth(2).screenshot({ path: 'shots/sheet3.png' });

  fs.writeFileSync('shots/boxes.json', JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
