// THE FILM (16:9 tutorial) — "בוחן לוח הכפל": real captures of the live page on the left,
// step header + tips on the right.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H;

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', line: '#dde2ed', card: '#ffffff' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));

  const DX = 70, DW = 1190;
  const PX0 = 1320, PX1 = 1862, PW = PX1 - PX0, PC = (PX0 + PX1) / 2;
  const LC = DX + DW / 2;

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
    if (str.includes('|')) return str.split('|').flatMap((p) => wrap(ctx, p, size, w, weight, max)).slice(0, max);
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
      g.addColorStop(0, '#ffe3ea'); g.addColorStop(0.55, '#e3efff'); g.addColorStop(1, C.yellow);
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
    he(ctx, f.title, PX1 - 130 + dx, 176, { size: 60, w: 900, align: 'right', alpha: a, maxW: PW - 130 });
    const u = ease.outCubic(UI.fadeIn(t, f.t + 0.15, 0.4));
    if (u > 0) {
      const x1 = PX1 - 130, len = Math.min(measure(ctx, f.title, 60, 900), PW - 130) * u;
      G.line(ctx, [[x1, 200], [x1 - len, 204]], { color: f.color, lw: 9, seed: f.n * 3, amp: 1.2 });
    }
    const sa = UI.fadeIn(t, f.t + 0.2, 0.25);
    wrap(ctx, f.sub, 40, PW, 500).forEach((ln, k) => he(ctx, ln, PX1, 290 + k * 54, { size: 40, w: 500, color: C.muted, align: 'right', alpha: sa }));
  }
  function tip(ctx, t, t0, title, note, { y = 600, color = C.yellow, seed = 300 } = {}) {
    popAt(ctx, t, t0, PC, y, (c) => {
      const lines = note ? wrap(c, note, 32, PW - 70, 500, 3) : [];
      const h = 96 + lines.length * 42;
      card(c, -PW / 2, -48, PW, h, { fill: color, r: 26, seed, shadow: 8, lw: 3.5 });
      he(c, title, PW / 2 - 34, 14, { size: 40, w: 900, align: 'right', maxW: PW - 68 });
      lines.forEach((ln, k) => he(c, ln, PW / 2 - 34, 64 + k * 42, { size: 32, w: 500, color: C.ink, align: 'right' }));
    }, { rot: -0.015 });
  }
  function character(ctx, t, t0, im, { h = 230, rot = 0.03, flip = false } = {}) {
    const p = ease.outBack(clamp((t - t0) / 0.45), 1.5);
    if (p > 0) img(ctx, im, PC + 60, 1060 + (1 - p) * 400 - hop(t, 10), h, { rot, flip });
  }

  // ---------- real captures (DSF 2: 2 image px per CSS px) ----------
  // draw the page CSS rect r of a capture whose top-left is org (page CSS), at scale k; returns a page->screen map
  function cropAt(ctx, im, org, r, cx, top, k, { rot = 0, seed = 400, alpha = 1, frame = true } = {}) {
    const w = r[2] * k, h = r[3] * k, x = cx - w / 2;
    const g = { x, y: top, w, h, k, map: (b) => b && [x + (b[0] - r[0]) * k, top + (b[1] - r[1]) * k, b[2] * k, b[3] * k] };
    if (!im || alpha <= 0) return g;
    const sx = (r[0] - org[0]) * 2, sy = (r[1] - org[1]) * 2, sw = r[2] * 2, sh = r[3] * 2;
    ctx.save(); ctx.globalAlpha *= alpha;
    if (rot) { ctx.translate(cx, top + h / 2); ctx.rotate(rot); ctx.translate(-cx, -top - h / 2); }
    if (frame) card(ctx, x - 12, top - 12, w + 24, h + 24, { seed, r: 26 });
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, top, w, h, 16); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(x, top, w, h); ctx.drawImage(im, sx, sy, sw, sh, x, top, w, h); ctx.restore();
    ctx.restore();
    return g;
  }
  const pick = (t, list) => { let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k].t) i = k; return i; };
  function states(ctx, t, list, org, r, cx, top, k, o = {}) {
    const i = pick(t, list), a = i ? clamp((t - list[i].t) / (o.fade || 0.25)) : 1;
    const base = i && a < 1 ? i - 1 : i;
    let g = cropAt(ctx, IMG[list[base].k], org, r, cx, top, k, o);
    if (i && a < 1) g = cropAt(ctx, IMG[list[i].k], org, r, cx, top, k, { ...o, alpha: a, frame: false });
    return g;
  }
  function ring(ctx, t, t0, r, { color = C.red, pad = 8, until = 1e9, rad = 18 } = {}) {
    const a = UI.fadeIn(t, t0, 0.2) * (1 - UI.fadeIn(t, until, 0.15)); if (a <= 0 || !r) return;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 7 + 2.5 * Math.sin((t - t0) * 7);
    ctx.beginPath(); ctx.roundRect(r[0] - pad, r[1] - pad, r[2] + pad * 2, r[3] + pad * 2, Math.min(rad, r[3] / 2 + pad)); ctx.stroke(); ctx.restore();
  }
  const tapR = (ctx, t, t0, r, color = 'rgba(207,47,86,0.8)') => r && UI.tap(ctx, r[0] + r[2] / 2, r[1] + r[3] / 2, t, t0, { color, size: 100 });

  // viewport CSS boxes (shoot.js -> shots/boxes.json); every capture is a 1280×1100 viewport, org [0,0]
  const O = [0, 0];
  const BX = { chips: [208, 125, 864, 49], chip6: [553, 125, 42, 49], chip10: [443, 125, 52, 49], grid: [228, 210, 824, 271],
    check: [763, 497, 117, 55], fresh: [597, 497, 154, 55],
    c: { grid: [228, 210, 824, 331], red1: [728, 280, 157, 90], red2: [395, 380, 157, 90], score: [228, 553, 824, 32], fresh: [597, 601, 154, 55], check: [763, 601, 117, 55], print: [400, 601, 185, 55] },
    pdf: [917, 120, 154, 47], prn: [797, 120, 110, 47] };
  const R_TOP = [198, 10, 884, 480], R_GRID = [198, 190, 884, 380], R_CHK = [198, 190, 884, 480], R_BTN = [198, 546, 884, 124], R_BAR = [785, 110, 295, 74], R_SHEET = [218, 356, 844, 330], R_ANS = [218, 196, 844, 330];

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const sp = ease.outBack(clamp((t - ev.q1 - 0.15) / 0.55), 1.4);
    if (sp > 0) cropAt(ctx, IMG.checked, O, [218, 200, 844, 400], 560, 110 + (1 - sp) * 900 - hop(t, 6), 1.15, { rot: -0.035, seed: 40 });
    const s2 = ease.outBack(clamp((t - ev.q2) / 0.5), 1.4);
    if (s2 > 0) cropAt(ctx, IMG.answers, O, [260, 225, 780, 260], 560, 630 + (1 - s2) * -900, 1.0, { rot: 0.03, seed: 41 });
    const X = 1450;
    he(ctx, 'יודעים את לוח הכפל בעל פה?', X, 250, { size: 56, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: 760 });
    popAt(ctx, t, ev.q2, X, 400, (c) => he(c, 'בוחן לוח הכפל', 0, 0, { size: 100, w: 900, color: C.red, maxW: 800 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 570, (c) => pill(c, 0, 0, '20 תרגילים מעורבבים בכל בוחן', { size: 40, w: 900, bg: C.blue, fg: '#fff', padX: 36, seed: 12 }), { rot: -0.02, dur: 0.35 });
    S.CHIPS.forEach(([e, lbl], i) => {
      const t0 = T(1, 1 + i * 0.35), x = X + 330 - i * 220;
      popAt(ctx, t, t0, x, 770, (c) => {
        card(c, -102, -70, 204, 140, { fill: [C.yellow, '#e3f6ea', '#ffe3ea', C.lilac][i], r: 26, seed: 20 + i, shadow: 8, lw: 4 });
        he(c, e, 0, -6, { size: 54, w: 800, dir: 'ltr' });
        he(c, lbl, 0, 48, { size: 28, w: 900, maxW: 184 });
      }, { rot: [-0.04, 0.03, -0.02, 0.04][i] });
    });
    const fp = clamp((t - ev.free) / 0.18);
    if (fp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(fp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(X, 950); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(fp * 2);
      pill(ctx, 0, 0, 'חינם, בלי הרשמה', { size: 52, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
  }
  // ================= 1. PICK =================
  function shotPick(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const g = cropAt(ctx, IMG.start, O, R_TOP, LC, 250, 1.3, { seed: 50 });
    ring(ctx, t, ev.ringChips, g.map(BX.chips), { color: C.red, pad: 6, until: ev.ringSix });
    ring(ctx, t, ev.ringSix, g.map(BX.chip6), { color: C.red, pad: 6 });
    tip(ctx, t, ev.tipSix, '6️⃣ לוחות 1 עד 6', 'מתאים לכיתות ג׳–ד׳', { seed: 301, color: '#ffe3ea', y: 470 });
    tip(ctx, t, ev.tipTen, '🔟 רוצים אתגר?', 'בוחרים עד 8 או עד 10', { seed: 302, color: '#e3efff', y: 720 });
  }
  // ================= 2. ANSWER =================
  function shotAnswer(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const g = states(ctx, t, [{ t: 0, k: 'start' }, { t: ev.type1, k: 'typing' }, { t: ev.type2, k: 'filled' }], O, R_GRID, LC, 330, 1.3, { seed: 60, fade: 0.15 });
    ring(ctx, t, ev.ringGrid, g.map(BX.grid), { color: C.blue, pad: 8, until: ev.type1 });
    tip(ctx, t, ev.tipMix, '🔀 בערבוביה, כמו בכיתה', 'כך רואים אם הילד באמת זוכר,|ולא רק מדקלם את הלוח', { seed: 303, color: C.yellow, y: 500 });
    tip(ctx, t, ev.tipPhone, '📱 גם בטלפון', 'נפתחת מקלדת של מספרים', { seed: 304, color: '#e3efff', y: 790 });
  }
  // ================= 3. CHECK =================
  function shotCheck(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const a = clamp((t - ev.swap) / 0.3);
    if (a < 1) {
      const g = cropAt(ctx, IMG.filled, O, R_CHK, LC, 280, 1.25, { seed: 70, alpha: 1 - a });
      ring(ctx, t, ev.ringCheck, g.map(BX.check), { color: C.green, pad: 8, until: ev.swap });
      tapR(ctx, t, ev.tapCheck, g.map(BX.check), 'rgba(35,135,77,0.8)');
    }
    if (a > 0) {
      const g = cropAt(ctx, IMG.checked, O, R_CHK, LC, 280, 1.25, { seed: 70, alpha: a, frame: a >= 1 });
      ring(ctx, t, ev.ringRed, g.map(BX.c.red1), { color: C.red, pad: 6 });
      ring(ctx, t, ev.ringRed + 0.3, g.map(BX.c.red2), { color: C.red, pad: 6 });
      ring(ctx, t, ev.ringScore, g.map(BX.c.score), { color: C.green, pad: 6 });
    }
    tip(ctx, t, ev.ringScore, '🎯 הציון מופיע מיד', '"18 מתוך 20 — כמעט!"', { seed: 305, color: '#e3f6ea', y: 500 });
    tip(ctx, t, ev.tipNote, '💡 טיפ', 'רושמים את הטעויות של הילד,|ומתרגלים כל טעות|בעמוד של הלוח שלה', { seed: 306, color: C.yellow, y: 780 });
  }
  // ================= 4. NEW QUIZ =================
  function shotFresh(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const a = clamp((t - ev.swapFresh) / 0.3);
    {
      const g = cropAt(ctx, IMG.checked, O, R_BTN, LC, 240, 1.3, { seed: 80 });
      ring(ctx, t, ev.ringFresh, g.map(BX.c.fresh), { color: C.orange, pad: 8 });
      tapR(ctx, t, ev.tapFresh, g.map(BX.c.fresh), 'rgba(224,138,0,0.85)');
    }
    if (a > 0) cropAt(ctx, IMG.fresh, O, R_GRID, LC, 500 + (1 - ease.outCubic(a)) * 60, 1.2, { seed: 81, alpha: a });
    tip(ctx, t, ev.tipFresh, '🔁 מתרגלים שוב ושוב', 'אחרי שבוע נותנים בוחן חדש|ורואים את השיפור', { seed: 307, color: '#ffedd5', y: 500 });
    tip(ctx, t, ev.tipTeach, '👩‍🏫 למורים', '"לכל הכיתה" מדפיס|דף שונה לכל ילד', { seed: 308, color: C.lilac, y: 780 });
  }
  // ================= 5. PRINT =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const p = clamp((t - ev.swapPr) / 0.3);
    if (p < 1) {
      const g0 = cropAt(ctx, IMG.checked, O, R_BTN, LC, 300, 1.3, { seed: 88, alpha: 1 - p });
      ring(ctx, t, ev.ringPrint, g0.map(BX.c.print), { color: C.purple, pad: 8, until: ev.swapPr });
      tapR(ctx, t, ev.tapPrint, g0.map(BX.c.print), 'rgba(138,79,216,0.85)');
    }
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha *= p;
    const g = cropAt(ctx, IMG.print, O, R_BAR, LC, 200, 1.5, { seed: 89 });
    const a = clamp((t - ev.swapAns) / 0.3);
    if (a < 1) cropAt(ctx, IMG.print, O, R_SHEET, LC, 380, 1.25, { seed: 90, alpha: 1 - a });
    if (a > 0) cropAt(ctx, IMG.answers, O, R_ANS, LC, 380, 1.25, { seed: 90, alpha: a, frame: a >= 1 });
    ring(ctx, t, ev.ringPdf, g.map(BX.pdf), { color: C.purple, pad: 6 });
    ring(ctx, t, ev.ringPdf + 0.3, g.map(BX.prn), { color: C.purple, pad: 6 });
    ctx.restore();
    tip(ctx, t, ev.tipPages, '📄 דף ראשון: הבוחן', 'עם מקום לשם, לתאריך ולציון', { seed: 309, color: C.yellow, y: 470 });
    tip(ctx, t, ev.tipAns, '✅ דף שני: התשובות', 'בודקים מהר, בלי לחשב', { seed: 310, color: '#e3f6ea', y: 720 });
    character(ctx, t, T(16, 1), IMG.printer, { h: 190 });
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
    he(ctx, 'בוחן לוח הכפל ✖️', X, 230, { size: 96, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: 1140 });
    popAt(ctx, t, L[1].t, X, 370, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 510, (c) => pill(c, 0, 0, 'ugabuga.co.il/learn/multiplication-table/quiz', { size: 36, w: 600, bg: C.blue, fg: '#fff', padX: 30, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 660, (c) => pill(c, 0, 0, 'נסו עכשיו ✏️', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '💬 איזה תרגיל הכי קשה לילד שלכם?', X, 810, { size: 46, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1100 });
    he(ctx, 'כתבו בתגובות', X, 880, { size: 44, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[4].t + 0.1, 0.25) });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotPick }, { t0: T(5), fn: shotAnswer }, { t0: T(8), fn: shotCheck },
    { t0: T(11), fn: shotFresh }, { t0: T(14), fn: shotPrint }, { t0: T(17), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.printer = await L('img/home-printer.png');
      IMG.mascot = await L('img/mascot.png'); IMG.logo = await L('img/logo.svg');
      for (const k of ['start', 'typing', 'filled', 'checked', 'fresh', 'print', 'answers']) IMG[k] = await L(`img/${k}.png`);
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
