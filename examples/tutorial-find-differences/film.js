// THE FILM (16:9 tutorial) — "מצאו את ההבדלים": real captures of the game and the printable on the left,
// step header + tip on the right. Paper + dot grid, ink cards, Heebo; real characters only.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H;

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', line: '#dde2ed', card: '#ffffff' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));

  const DX = 70, DY = 70, DW = 1190, DH = 940;
  const PX0 = 1320, PX1 = 1862, PW = PX1 - PX0, PC = (PX0 + PX1) / 2;

  // ---------- text ----------
  const fontOf = (size, w, fam = 'Heebo') => `${w} ${size}px "${fam}", "Noto Color Emoji", "Segoe UI Emoji", sans-serif`;
  function measure(ctx, s, size, w = 800, fam) { ctx.save(); ctx.font = fontOf(size, w, fam); ctx.direction = 'rtl'; const m = ctx.measureText(s).width; ctx.restore(); return m; }
  function he(ctx, s, x, y, { size = 60, w = 800, color = C.ink, align = 'center', alpha = 1, maxW, dir = 'rtl', fam } = {}) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha *= clamp(alpha);
    let sz = size;
    if (maxW) { const mw = measure(ctx, s, sz, w, fam); if (mw > maxW) sz *= maxW / mw; }
    ctx.font = fontOf(sz, w, fam); ctx.direction = dir; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color; ctx.fillText(s, x, y);
    ctx.restore();
  }
  function wrap(ctx, str, size, w, weight = 500, max = 3) {
    const words = str.split(' '), lines = []; let cur = '';
    for (const wd of words) { const tryS = cur ? cur + ' ' + wd : wd; if (measure(ctx, tryS, size, weight) > w && cur) { lines.push(cur); cur = wd; } else cur = tryS; }
    if (cur) lines.push(cur); return lines.slice(0, max);
  }
  function card(ctx, x, y, w, h, { fill = C.card, r = 30, seed = 1, shadow = 12, lw = 4.5, stroke = C.ink, shadowColor = C.ink } = {}) {
    if (shadow) { ctx.fillStyle = shadowColor; ctx.beginPath(); ctx.roundRect(x + shadow * 0.8, y + shadow, w, h, r); ctx.fill(); }
    G.rrect(ctx, x, y, w, h, r, { fill, lw, seed, stroke, amp: 1 });
  }
  function pill(ctx, cx, cy, s, { size = 44, w = 800, bg = C.yellow, fg = C.ink, padX = 34, h, seed = 3, shadow = 7, dir = 'rtl', fam } = {}) {
    const ww = measure(ctx, s, size, w, fam) + padX * 2, hh = h || size * 1.75;
    card(ctx, cx - ww / 2, cy - hh / 2, ww, hh, { fill: bg, r: hh / 2, seed, shadow, lw: 4 });
    he(ctx, s, cx, cy + size * 0.36, { size, w, color: fg, dir, fam });
    return ww;
  }
  function popAt(ctx, t, t0, cx, cy, fn, { dur = 0.3, over = 2.2, rot = 0 } = {}) {
    const p = UI.pop(t, t0, dur, over);
    if (p <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(p, p); fn(ctx); ctx.restore();
  }
  function img(ctx, im, cx, bottom, h, { flip = false, rot = 0, alpha = 1 } = {}) {
    if (!im) return;
    const w = im.width * h / im.height;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, bottom); ctx.rotate(rot); if (flip) ctx.scale(-1, 1);
    ctx.drawImage(im, -w / 2, -h, w, h); ctx.restore();
  }
  function confetti(ctx, t, t0, cx, cy, { n = 60, spread = 900, seed = 1 } = {}) {
    const a = t - t0;
    if (a < 0 || a > 2.2) return;
    const cols = [C.red, C.blue, C.green, '#f2b705', C.purple, C.cyan, C.orange];
    for (let i = 0; i < n; i++) {
      const r = (k) => U.hash(seed * 1000 + i * 7 + k);
      const ang = -Math.PI / 2 + (r(1) - 0.5) * 2.6, sp = spread * (0.45 + r(2) * 0.6);
      const x = cx + Math.cos(ang) * sp * a, y = cy + Math.sin(ang) * sp * a + 900 * a * a;
      ctx.save(); ctx.globalAlpha = clamp(1.6 - a); ctx.translate(x, y); ctx.rotate(a * (4 + r(3) * 8)); ctx.scale(1, Math.abs(Math.cos(a * 7 + i)));
      ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-11, -6, 22, 12); ctx.restore();
    }
  }

  // ---------- backgrounds ----------
  function bg(ctx) {
    ctx.drawImage(Studio.cache('bg', (x) => {
      x.fillStyle = C.paper; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.09)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }
  function heroBg(ctx) {
    ctx.drawImage(Studio.cache('hero', (x) => {
      const g = x.createLinearGradient(W, 0, 0, H);
      g.addColorStop(0, '#e3efff'); g.addColorStop(0.55, C.lilac); g.addColorStop(1, C.yellow);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.06)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }

  // ---------- the step panel (right) ----------
  function header(ctx, t, f) {
    popAt(ctx, t, f.t, PX1 - 54, 150, (c) => {
      c.fillStyle = C.ink; c.beginPath(); c.arc(5, 7, 54, 0, Math.PI * 2); c.fill();
      c.fillStyle = f.color; c.beginPath(); c.arc(0, 0, 54, 0, Math.PI * 2); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
      he(c, String(f.n), 0, 23, { size: 66, w: 900, color: '#fff', dir: 'ltr' });
    });
    const a = UI.fadeIn(t, f.t + 0.06, 0.2), dx = (1 - ease.outCubic(UI.fadeIn(t, f.t + 0.06, 0.35))) * -40;
    he(ctx, f.title, PX1 - 130 + dx, 176, { size: 64, w: 900, align: 'right', alpha: a, maxW: PW - 130 });
    const u = ease.outCubic(UI.fadeIn(t, f.t + 0.15, 0.4));
    if (u > 0) {
      const x1 = PX1 - 130, len = Math.min(measure(ctx, f.title, 64, 900), PW - 130) * u;
      G.line(ctx, [[x1, 200], [x1 - len, 204]], { color: f.color, lw: 9, seed: f.n * 3, amp: 1.2 });
    }
    const sa = UI.fadeIn(t, f.t + 0.2, 0.25);
    wrap(ctx, f.sub, 40, PW, 500).forEach((ln, k) => he(ctx, ln, PX1, 290 + k * 54, { size: 40, w: 500, color: C.muted, align: 'right', alpha: sa }));
  }
  function tip(ctx, t, t0, title, note, { y = 560, color = C.yellow, seed = 300 } = {}) {
    popAt(ctx, t, t0, PC, y, (c) => {
      const lines = note ? wrap(c, note, 32, PW - 70, 500, 3) : [];
      const h = 96 + lines.length * 42;
      card(c, -PW / 2, -48, PW, h, { fill: color, r: 26, seed, shadow: 8, lw: 3.5 });
      he(c, title, PW / 2 - 34, 14, { size: 40, w: 900, align: 'right', maxW: PW - 68 });
      lines.forEach((ln, k) => he(c, ln, PW / 2 - 34, 64 + k * 42, { size: 32, w: 500, color: C.ink, align: 'right' }));
    }, { rot: -0.015 });
  }
  function character(ctx, t, t0, im, { h = 300, rot = 0.03, flip = false } = {}) {
    const p = ease.outBack(clamp((t - t0) / 0.45), 1.5);
    if (p > 0) img(ctx, im, PC + 60, 1060 + (1 - p) * 400 - hop(t, 10), h, { rot, flip });
  }

  // ---------- real captures ----------
  // Game shots: the 1400×900 viewport at DSF 2 (CSS origin 0,0). Printable: p*.png = controls clip (CSS origin 110,375),
  // s*.png = the sheet element (CSS origin 320,666, 760×1189). Boxes are CSS px (shots/boxes.json).
  const GB = {
    levels: [490, 248, 420, 322], lv1: [490, 248, 99, 58], lv2: [597, 248, 99, 58],
    found: [875, 77, 69, 33], timer: [800, 77, 64, 33], hint: [434, 72, 48, 44],
    pig: [1317, 314], giraffe: [228, 322], rabbit: [908, 474],
    stars: [620, 380, 160, 58],
    a34: [757, 508, 99, 47], a56: [651, 508, 99, 47], a78: [544, 508, 99, 47], swap: [682, 579, 223, 55], print: [495, 579, 175, 55],
  };
  function mk(reg, org, dsf, box) {
    const sc = Math.min((box[2] - 24) / reg[2], (box[3] - 24) / reg[3]);
    const vw = reg[2] * sc, vh = reg[3] * sc;
    return { reg, org, dsf, sc, vw, vh, vx: box[0] + (box[2] - vw) / 2, vy: box[1] + (box[3] - vh) / 2 };
  }
  const mx = (M, x) => M.vx + (x - M.reg[0]) * M.sc, my = (M, y) => M.vy + (y - M.reg[1]) * M.sc;
  function view(ctx, im, M, alpha = 1) {
    if (!im || alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.beginPath(); ctx.roundRect(M.vx, M.vy, M.vw, M.vh, 20); ctx.clip();
    ctx.fillStyle = C.paper; ctx.fillRect(M.vx, M.vy, M.vw, M.vh);
    const k = M.sc / M.dsf;
    ctx.drawImage(im, M.vx - (M.reg[0] - M.org[0]) * M.sc, M.vy - (M.reg[1] - M.org[1]) * M.sc, im.width * k, im.height * k);
    ctx.restore();
  }
  const pick = (t, list) => { let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k].t) i = k; return i; };
  function stateView(ctx, t, M, list) {
    const i = pick(t, list);
    const a = i ? clamp((t - list[i].t) / 0.25) : 1;
    if (i && a < 1) view(ctx, IMG[list[i - 1].k], M);
    view(ctx, IMG[list[i].k], M, a);
  }
  function ring(ctx, t, t0, M, b, { color = C.red, pad = 8, until = 1e9, r = 22 } = {}) {
    const a = UI.fadeIn(t, t0, 0.2) * (1 - UI.fadeIn(t, until, 0.15)); if (a <= 0) return;
    const x = mx(M, b[0]) - pad, y = my(M, b[1]) - pad, w = b[2] * M.sc + pad * 2, h = b[3] * M.sc + pad * 2;
    ctx.save(); ctx.beginPath(); ctx.roundRect(M.vx, M.vy, M.vw, M.vh, 20); ctx.clip(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 7 + 2.5 * Math.sin((t - t0) * 7);
    ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(r, h / 2 + pad)); ctx.stroke(); ctx.restore();
  }
  const tapAt = (ctx, t, t0, M, b, color = 'rgba(207,47,86,0.8)') => UI.tap(ctx, mx(M, b[0] + (b[2] || 0) / 2), my(M, b[1] + (b[3] || 0) / 2), t, t0, { color, size: 100 });
  const siteCard = (ctx, M, seed = 400) => card(ctx, M.vx - 12, M.vy - 12, M.vw + 24, M.vh + 24, { seed, r: 30 });
  const GAME = () => mk([8, 236, 1384, 660], [0, 0], 2, [DX, DY + 190, DW, DH - 190]);
  const HUD = () => mk([372, 64, 656, 60], [0, 0], 2, [DX + 40, DY + 10, DW - 80, 150]);
  const WON = () => mk([330, 190, 740, 500], [0, 0], 2, [DX, DY + 190, DW, DH - 190]);
  function gameViews(ctx, t, list) { const H2 = HUD(), M = GAME(); siteCard(ctx, H2, 405); stateView(ctx, t, H2, list); siteCard(ctx, M); stateView(ctx, t, M, list); return { M, H2 }; }
  const MENU = () => mk([450, 130, 500, 450], [0, 0], 2, [DX, DY, DW, DH]);
  // a crop of an image (device px) drawn as an ink card
  function crop(ctx, im, sx0, sy0, sw, sh, cx, cy, w, { rot = 0, seed = 40 } = {}) {
    if (!im) return;
    const h = w * sh / sw;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    card(ctx, -w / 2 - 12, -h / 2 - 12, w + 24, h + 24, { seed, r: 22 });
    ctx.save(); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 12); ctx.clip();
    ctx.drawImage(im, sx0, sy0, sw, sh, -w / 2, -h / 2, w, h); ctx.restore(); ctx.restore();
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const sp = ease.outBack(clamp((t - ev.q1 - 0.15) / 0.55), 1.4);
    if (sp > 0) crop(ctx, IMG.g0, 36, 499, 2728, 948, 470, 380 + (1 - sp) * -800 - hop(t, 5), 820, { rot: -0.03, seed: 40 });
    const s2 = ease.outBack(clamp((t - ev.q2) / 0.5), 1.4);
    if (s2 > 0) crop(ctx, IMG.s0, 0, 0, 1520, 2378, 290, 800 + (1 - s2) * 700, 300, { rot: -0.06, seed: 41 });
    const bp = ease.outBack(clamp((t - ev.title) / 0.45), 1.5);
    if (bp > 0) img(ctx, IMG.boy, 720, 1080 + (1 - bp) * 400 - hop(t, 10), 400, { rot: 0.03 });
    const X = 1420;
    he(ctx, 'מחפשים משחק שקט שמחדד את העין?', X, 230, { size: 56, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: 860 });
    popAt(ctx, t, ev.q2, X, 380, (c) => he(c, 'מצאו את ההבדלים!', 0, 0, { size: 96, w: 900, color: C.red, maxW: 840 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 540, (c) => pill(c, 0, 0, '🔍 משחק אונליין + דפים להדפסה', { size: 44, w: 900, bg: C.blue, fg: '#fff', padX: 44, seed: 12 }), { rot: -0.02, dur: 0.35 });
    S.CHIPS.forEach(([e, lbl], i) => {
      const t0 = T(1, 0.8 + i * 0.3), x = X + 330 - i * 220;
      popAt(ctx, t, t0, x, 740, (c) => {
        card(c, -102, -70, 204, 140, { fill: [C.yellow, '#e3f6ea', '#ffe3ea', C.lilac][i], r: 26, seed: 20 + i, shadow: 8, lw: 4 });
        he(c, e, 0, -6, { size: 54, w: 800 });
        he(c, lbl, 0, 48, { size: 32, w: 900, maxW: 180 });
      }, { rot: [-0.04, 0.03, -0.02, 0.04][i] });
    });
    const fp = clamp((t - ev.free) / 0.18);
    if (fp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(fp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(X, 930); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(fp * 2);
      pill(ctx, 0, 0, 'חינם, בלי הרשמה', { size: 52, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
  }
  // ================= 1. LEVELS =================
  function shotLevels(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const M = MENU(); siteCard(ctx, M); view(ctx, IMG.m0, M);
    ring(ctx, t, ev.ringLevels, M, GB.levels, { color: C.red, pad: 10, until: ev.tapLv1 - 0.2 });
    tapAt(ctx, t, ev.tapLv1, M, GB.lv1);
    ring(ctx, t, ev.tapLv1, M, GB.lv1, { color: C.red, pad: 6 });
    tip(ctx, t, ev.tipLevels, '🐾 הנושאים מתחלפים', 'חיות, יום הולדת, חלל, ים, כלי רכב ועוד — והתמונות הולכות ומתמלאות', { seed: 301, color: '#ffe3ea' });
    character(ctx, t, T(4, 0), IMG.girl, { h: 230 });
  }
  // ================= 2. TAP =================
  function shotTap(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const { M, H2 } = gameViews(ctx, t, [{ t: 0, k: 'g0' }, { t: ev.tapPig + 0.1, k: 'g1' }]);
    tapAt(ctx, t, ev.tapPig, M, GB.pig, 'rgba(34,107,215,0.8)');
    ring(ctx, t, ev.ringFound, H2, GB.found, { color: C.blue, pad: 8 });
    tip(ctx, t, ev.tipTap, '⭕ מצאתם? עיגול אדום', 'ההבדל מסומן בשתי התמונות, והמונה למעלה מתקדם', { seed: 302, color: '#e0f0ff' });
    character(ctx, t, T(7, 1), IMG.boy, { h: 230, flip: true });
  }
  // ================= 3. HINT =================
  function shotHint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const { M, H2 } = gameViews(ctx, t, [{ t: 0, k: 'g1b' }, { t: ev.tapHint + 0.1, k: 'g2' }, { t: ev.tapGiraffe + 0.1, k: 'g3' }, { t: ev.tapRabbit + 0.1, k: 'g4' }]);
    ring(ctx, t, ev.ringHint, H2, GB.hint, { color: C.orange, pad: 8, until: ev.tapGiraffe });
    tapAt(ctx, t, ev.tapHint, H2, GB.hint, 'rgba(224,138,0,0.85)');
    tapAt(ctx, t, ev.tapGiraffe, M, GB.giraffe, 'rgba(224,138,0,0.85)');
    tapAt(ctx, t, ev.tapRabbit, M, GB.rabbit, 'rgba(224,138,0,0.85)');
    tip(ctx, t, ev.tipHint, '💡 העיגול הכתום מראה איפה לחפש', 'מה יכול להשתנות? פריט שחסר, פריט אחר, פריט גדול או קטן יותר, או פריט שנוסף', { seed: 303, color: C.yellow });
  }
  // ================= 4. STARS =================
  function shotStars(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    if (t < ev.menu) {
      if (t < ev.won + 0.25) gameViews(ctx, t, [{ t: 0, k: 'g4' }]);
      if (t >= ev.won) { const M = WON(); const a = clamp((t - ev.won) / 0.25); ctx.save(); ctx.globalAlpha = a; siteCard(ctx, M); view(ctx, IMG.w0, M); ctx.restore(); ring(ctx, t, ev.won + 0.3, M, GB.stars, { color: C.green, pad: 8 }); }
    } else {
      const M = MENU(); siteCard(ctx, M);
      view(ctx, IMG.m1, M, clamp((t - ev.menu) / 0.25) + 0.001);
      ring(ctx, t, ev.menu + 0.1, M, GB.lv1, { color: C.green, pad: 6 });
      ring(ctx, t, ev.ringLv2, M, GB.lv2, { color: C.green, pad: 6 });
    }
    tip(ctx, t, ev.tipStars, '⭐ איך מקבלים 3 כוכבים?', 'מהר, בלי רמזים ובלי הרבה טעויות. עם רמז אחד מקבלים שניים', { seed: 304, color: '#e3f6ea' });
    character(ctx, t, T(12, 0), IMG.bday, { h: 230 });
  }
  // ================= 5. PRINT =================
  // sheet element shots 1520×2378 (DSF 2); the key sits at CSS (606,972,110,111) inside the sheet.
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const list = [{ t: 0, k: 's0' }, { t: ev.tapAge + 0.1, k: 's1' }, { t: ev.tapSwap + 0.1, k: 's2' }];
    const i = pick(t, list), bump = i ? 1 - 0.03 * Math.sin(Math.PI * clamp((t - list[i].t) / 0.25)) : 1;
    const SH = 900, SW = SH * 1520 / 2378, SX = DX + 20 + SW / 2, SY = DY + DH / 2;
    ctx.save(); ctx.translate(SX, SY); ctx.scale(bump, bump);
    crop(ctx, IMG[list[i].k], 0, 0, 1520, 2378, 0, 0, SW, { seed: 44 });
    ctx.restore();
    const RX = SX + SW / 2 + 50;
    const M = mk([470, 492, 470, 156], [110, 375], 2, [RX, DY + 60, 1275 - RX, 300]);
    siteCard(ctx, M, 410);
    stateView(ctx, t, M, [{ t: 0, k: 'p0' }, { t: ev.tapAge + 0.1, k: 'p1' }, { t: ev.tapSwap + 0.1, k: 'p2' }]);
    ring(ctx, t, ev.ringAges, M, [GB.a78[0], GB.a78[1], GB.a34[0] + GB.a34[2] - GB.a78[0], GB.a34[3]], { color: C.purple, pad: 6, until: ev.tapAge });
    tapAt(ctx, t, ev.tapAge, M, GB.a34, 'rgba(138,79,216,0.85)');
    tapAt(ctx, t, ev.tapSwap, M, GB.swap, 'rgba(138,79,216,0.85)');
    ring(ctx, t, ev.ringPrint, M, GB.print, { color: C.red, pad: 6 });
    tapAt(ctx, t, ev.tapPrint, M, GB.print);
    // the key, enlarged
    const kp = UI.pop(t, ev.key, 0.35, 2);
    if (kp > 0) {
      const kx = (RX + 1275) / 2, ky = 640;
      const a = UI.fadeIn(t, ev.key, 0.25);
      ctx.save(); ctx.globalAlpha = a;
      G.line(ctx, [[SX - SW / 2 + (606 + 55) / 760 * SW, SY - SH / 2 + (972 + 55) / 1189 * SH], [kx - 150, ky + 60]], { color: C.purple, lw: 6, seed: 7, amp: 2 });
      ctx.restore();
      ctx.save(); ctx.translate(kx, ky); ctx.scale(kp, kp);
      crop(ctx, IMG.s2, 606 * 2, 972 * 2, 110 * 2, 111 * 2, 0, 0, 280, { rot: 0.03, seed: 46 });
      ctx.restore();
      he(ctx, '✅ פתרון קטן והפוך בתחתית הדף', kx, ky + 220, { size: 38, w: 900, alpha: UI.fadeIn(t, ev.key + 0.1, 0.2), maxW: 1275 - RX - 20 });
    }
    tip(ctx, t, ev.tipAges, '👧 מספר ההבדלים לפי הגיל', 'בגיל ⁦3–4⁩ יש 3 הבדלים, בגיל ⁦5–6⁩ יש 5, ובגיל ⁦7–8⁩ יש 7', { seed: 305, color: C.lilac, y: 600 });
  }
  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    const LX = 1460;
    ctx.save(); ctx.translate(LX, 360); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 1100, Math.sin(a0) * 1100); ctx.lineTo(Math.cos(a1) * 1100, Math.sin(a1) * 1100); ctx.fill(); }
    ctx.restore();
    popAt(ctx, t, ev.logo, LX, 360, (c) => {
      const s = 300;
      c.rotate(Math.sin((t - ev.logo) * 3) * 0.03);
      c.fillStyle = C.ink; c.beginPath(); c.roundRect(-s / 2 + 12, -s / 2 + 14, s, s, 76); c.fill();
      c.save(); c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 76); c.clip(); if (IMG.logo) c.drawImage(IMG.logo, -s / 2, -s / 2, s, s); c.restore();
      c.strokeStyle = C.ink; c.lineWidth = 6; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 76); c.stroke();
    }, { dur: 0.45, over: 1.8 });
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', LX, 660 + (1 - wp) * 24, { size: 130, w: 900, alpha: wp });
    const L = S.endLines, X = 640;
    he(ctx, 'מצאו את ההבדלים 🔍', X, 230, { size: 90, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: 1120 });
    popAt(ctx, t, L[1].t, X, 360, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 500, (c) => pill(c, 0, 0, 'ugabuga.co.il/online-games/find-differences', { size: 38, w: 600, bg: C.blue, fg: '#fff', padX: 36, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 650, (c) => pill(c, 0, 0, 'נסו עכשיו 🔎', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, 'במה תשתמשו — במשחק או בדפים? כתבו לנו בתגובות', X, 800, { size: 38, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1160 });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotLevels }, { t0: T(5), fn: shotTap }, { t0: T(8), fn: shotHint },
    { t0: T(11), fn: shotStars }, { t0: T(13), fn: shotPrint }, { t0: T(17), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png'); IMG.boy = await L('img/home-detective-boy.png'); IMG.bday = await L('img/birthday-girl.png');
      IMG.mascot = await L('img/mascot.png'); IMG.logo = await L('img/logo.svg');
      for (const k of ['m0', 'm1', 'g0', 'g1', 'g1b', 'g2', 'g3', 'g4', 'w0', 'p0', 'p1', 'p2', 's0', 's1', 's2']) IMG[k] = await L(`img/${k}.png`);
    },
    draw(ctx, t) {
      let i = 0;
      for (let k = 0; k < SECTIONS.length; k++) if (t >= SECTIONS[k].t0) i = k;
      const sec = SECTIONS[i], u = i > 0 ? clamp((t - sec.t0) / SLIDE) : 1;
      if (u < 1) {
        const e = 1 - Math.pow(1 - u, 4);
        ctx.save(); ctx.translate(e * W, 0); SECTIONS[i - 1].fn(ctx, sec.t0 - 0.001); ctx.restore();
        ctx.save(); ctx.translate((e - 1) * W, 0); sec.fn(ctx, t); ctx.restore();
        const f = S.steps[i - 1] || { color: C.blue };
        ctx.fillStyle = f.color; ctx.fillRect(e * W - 18, 0, 36, H);
        const fl = 0.55 * (1 - clamp((t - sec.t0) / 0.1)); if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
      } else sec.fn(ctx, t);
    },
    post: { paper: 0.2, vignette: 0.08, grain: 0.02 },
    fadeOut: 0.9,
  });
})();
