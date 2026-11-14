// Phone captures: tap an answer for real (locked screen), then the reveal. Same mocks as shoot.js.
const { chromium } = require('C:/Users/pc/Documents/ugabuga/node_modules/playwright');
const CODE = 'HN8K2Q', PTOKEN = 'demotokenplayer00000000000000', TITLE = 'חנוכה · בינוני';
const Q0 = { q: 'מי היה המנהיג המפורסם של המכבים?', options: ['יהודה המכבי', 'דוד המלך', 'משה רבנו', 'יהושע בן נון'] };
let pub, me;
const ends = (s) => new Date(Date.now() + s * 1000).toISOString();
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const c = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, locale: 'he-IL', isMobile: true, hasTouch: true });
  await c.route(/supabase\.co\/(rest|realtime)\//, async (route) => {
    const url = route.request().url(), json = (o) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
    if (url.includes('live_quiz_player_state')) return json(me());
    if (url.includes('live_quiz_public_states')) return json(pub());
    if (url.includes('/rpc/')) return json(null);
    return route.abort();
  });
  await c.addInitScript(([code, t]) => { try { localStorage.setItem('buga-live-player', JSON.stringify({ [code]: { token: t, name: 'נועה' } })); localStorage.setItem('buga-live-sound', '0'); } catch {} }, [CODE, PTOKEN]);
  const p = await c.newPage();
  const hide = () => p.evaluate(() => { for (const e of document.querySelectorAll('.live-connection,.live-error')) e.style.display = 'none'; });
  const qp = { title: TITLE, index: 1, total: 6, question: Q0, seconds: 20 };
  const base = { code: CODE, question_index: 0, revision: 1 };
  pub = () => ({ ...base, phase: 'question', ends_at: ends(14), payload: qp });
  me = () => ({ name: 'נועה', score: 0, answered: false, rank: 1 });
  const t0 = Date.now();
  pub = (() => { const e = ends(16); return () => ({ ...base, phase: 'question', ends_at: e, payload: qp }); })();
  await p.goto(`https://ugabuga.co.il/play/${CODE}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(2500); await hide();
  me = () => ({ name: 'נועה', score: 0, answered: true, option: 0, rank: 1 });
  await p.locator('.live-player-options button').first().click(); await p.waitForTimeout(900); await hide();
  await p.screenshot({ path: 'shots/phLocked.png' });
  pub = () => ({ ...base, phase: 'reveal', ends_at: null, payload: { ...qp, correct: 0 } });
  me = () => ({ name: 'נועה', score: 960, answered: true, option: 0, correct: true, points: 960, rank: 1 });
  for (let i = 0; i < 6; i++) {
    await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await p.waitForTimeout(900);
    if (await p.locator('.player-right').count()) break;
  }
  await hide(); await p.screenshot({ path: 'shots/phRight.png' });
  console.log('right:', await p.locator('.player-right').count(), Date.now() - t0);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
