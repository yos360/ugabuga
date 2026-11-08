// THE FILM (16:9 tutorial) — "בלש לוח הכפל": real captures of /learn/multiplication-table/game on the
// left, step header + tip on the right. Paper + dot grid, ink cards, Heebo; real characters only (no caveman). Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, ev, clock } = S; S.S = S.S || {};
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
      g.addColorStop(0, '#ffe3ef'); g.addColorStop(0.55, C.lilac); g.addColorStop(1, C.yellow);
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
    he(ctx, f.title, PX1 - 130 + dx, 176, { size: 70, w: 900, align: 'right', alpha: a, maxW: PW - 130 });
    const u = ease.outCubic(UI.fadeIn(t, f.t + 0.15, 0.4));
    if (u > 0) {
      const x1 = PX1 - 130, len = Math.min(measure(ctx, f.title, 70, 900), PW - 130) * u;
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
      he(c, title, PW / 2 - 34, 14, { size: 42, w: 900, align: 'right', maxW: PW - 68 });
      lines.forEach((ln, k) => he(c, ln, PW / 2 - 34, 64 + k * 42, { size: 32, w: 500, color: C.ink, align: 'right' }));
    }, { rot: -0.015 });
  }
  function character(ctx, t, t0, im, { h = 300, rot = 0.03, flip = false } = {}) {
    const p = ease.outBack(clamp((t - t0) / 0.45), 1.5);
    if (p > 0) img(ctx, im, PC + 60, 1060 + (1 - p) * 400 - hop(t, 10), h, { rot, flip });
  }

  // ---------- real captures (full-page shots), boxes measured in the DOM (shots/boxes.json) ----------
  const BOX = {
    modes: [85, 638, 1030, 184], mLight: [780, 638, 335, 184], mHunt: [433, 638, 335, 184], mTwins: [85, 638, 335, 184],
    chips: [260, 841, 680, 61], chipHide: [260, 841, 258, 61], go: [420, 922, 360, 68],
    lit: [479, 1622, 79, 79], rowHead: [153, 1622, 79, 79], colHead: [479, 924, 79, 43], qbox: [60, 634, 1080, 272],
    inputs: [388, 705, 298, 93], check: [520, 813, 160, 68], fbL: [85, 810, 1030, 139],
    hcell: [560, 1032, 79, 79], qboxH: [60, 634, 1080, 172], rowHeadH: [153, 1032, 79, 79], colHeadH: [560, 823, 79, 43],
    qboxT: [60, 634, 1080, 172], tw: [[642, 950, 79, 79], [479, 1032, 79, 79], [397, 1113, 79, 79], [316, 1277, 79, 79]],
  };
  const REG = { setup: [40, 418, 1120, 597], game: [40, 548, 1120, 1345] };
  let R = REG.setup, SC = 1, VX = 0, VY = 0, VW = 0, VH = 0;
  function useRegion(reg) {
    R = reg; SC = Math.min((DW - 24) / reg[2], (DH - 24) / reg[3]);
    VW = reg[2] * SC; VH = reg[3] * SC; VX = DX + (DW - VW) / 2; VY = DY + (DH - VH) / 2;
  }
  const sx = (x) => VX + (x - R[0]) * SC, sy = (y) => VY + (y - R[1]) * SC;
  function view(ctx, im, alpha = 1) {
    if (!im || alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.beginPath(); ctx.roundRect(VX, VY, VW, VH, 20); ctx.clip();
    ctx.fillStyle = '#fff'; ctx.fillRect(VX, VY, VW, VH);
    ctx.drawImage(im, VX - R[0] * SC, VY - R[1] * SC, im.width * SC, im.height * SC);
    ctx.restore();
  }
  function stateView(ctx, t, list) {
    let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k].t) i = k;
    const a = i ? clamp((t - list[i].t) / 0.25) : 1;
    if (i && a < 1) view(ctx, IMG[list[i - 1].k]);
    view(ctx, IMG[list[i].k], a);
  }
  function ring(ctx, t, t0, b, { color = C.red, pad = 8, until = 1e9, r = 22 } = {}) {
    const a = UI.fadeIn(t, t0, 0.2) * (1 - UI.fadeIn(t, until, 0.15)); if (a <= 0) return;
    const x = sx(b[0]) - pad, y = sy(b[1]) - pad, w = b[2] * SC + pad * 2, h = b[3] * SC + pad * 2;
    ctx.save(); ctx.beginPath(); ctx.roundRect(VX, VY, VW, VH, 20); ctx.clip(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 7 + 2.5 * Math.sin((t - t0) * 7);
    ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(r, h / 2 + pad)); ctx.stroke(); ctx.restore();
  }
  const tapAt = (ctx, t, t0, b, color = 'rgba(207,47,86,0.8)') => UI.tap(ctx, sx(b[0] + b[2] / 2), sy(b[1] + b[3] / 2), t, t0, { color, size: 100 });
  const siteCard = (ctx) => card(ctx, VX - 12, VY - 12, VW + 24, VH + 24, { seed: 400, r: 30 });

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const X = 1240;
    he(ctx, 'הילדים יודעים לדקלם את לוח הכפל?', X, 250, { size: 76, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: 1150 });
    popAt(ctx, t, ev.q2, X, 410, (c) => he(c, 'ויודעים גם לקרוא את הטבלה?', 0, 0, { size: 96, w: 900, color: C.red, maxW: 1120 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 590, (c) => pill(c, 0, 0, 'בלש לוח הכפל 🔍', { size: 66, w: 900, bg: C.blue, fg: '#fff', padX: 52, seed: 12 }), { rot: -0.02, dur: 0.35 });
    S.CHIPS.forEach(([e, lbl], i) => {
      const t0 = T(1, 1 + i * 0.35), x = X + 435 - i * 290;
      popAt(ctx, t, t0, x, 790, (c) => {
        card(c, -130, -70, 260, 140, { fill: [C.yellow, '#ffe3ea', C.lilac, '#e3f6ea'][i], r: 26, seed: 20 + i, shadow: 8, lw: 4 });
        he(c, e, 0, -6, { size: 54, w: 800 });
        he(c, lbl, 0, 48, { size: 34, w: 900, maxW: 230 });
      }, { rot: [-0.04, 0.03, -0.02, 0.04][i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(X, 960); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'בחינם, בלי הרשמה', { size: 52, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
    const bp = ease.outBack(clamp((t - ev.q1 - 0.1) / 0.5), 1.5);
    if (bp > 0) img(ctx, IMG.boy, 330, 1050 + (1 - bp) * 600 - hop(t, 14), 760, { rot: -0.03 });
  }

  // ================= 1. MODES =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]); useRegion(REG.setup); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 's0' }]);
    ring(ctx, t, ev.ringModes, BOX.modes, { color: C.blue, until: ev.ringLight });
    ring(ctx, t, ev.ringLight, BOX.mLight, { color: C.blue, pad: 6 });
    tapAt(ctx, t, ev.tapLight, BOX.mLight, 'rgba(34,107,215,0.8)');
    tip(ctx, t, ev.tipModes, 'לא רק לשנן', 'קוראים את הטבלה כמו בלשים: איזה תרגיל מסתתר בכל משבצת', { seed: 301, color: '#e0f0ff' });
    character(ctx, t, T(4, 0), IMG.girl, { h: 250 });
  }
  // ================= 2. START =================
  function shotStart(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]); useRegion(REG.setup); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 's0' }]);
    ring(ctx, t, ev.ringSize, BOX.chips, { color: C.green, until: ev.ringHide });
    ring(ctx, t, ev.ringHide, BOX.chipHide, { color: C.green, pad: 6, until: ev.ringGo });
    ring(ctx, t, ev.ringGo, BOX.go, { color: C.green, pad: 8 });
    tapAt(ctx, t, ev.tapGo, BOX.go, 'rgba(35,135,77,0.8)');
    tip(ctx, t, ev.tipRound, '10 משימות בכל סיבוב', 'בסוף מקבלים עד 3 כוכבים, והשיא נשמר במכשיר', { seed: 302, color: '#e3f6ea' });
    character(ctx, t, T(7, 1), IMG.boy, { h: 230, flip: true });
  }
  // ================= 3. LIGHT =================
  function shotLight(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]); useRegion(REG.game); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 'L0' }, { t: ev.typed, k: 'L1' }, { t: ev.tapCheck + 0.12, k: 'L2' }]);
    ring(ctx, t, ev.ringLit, BOX.lit, { color: C.orange, pad: 8, until: ev.typed });
    ring(ctx, t, ev.ringHeads, BOX.rowHead, { color: C.orange, pad: 6, until: ev.typed });
    ring(ctx, t, ev.ringHeads + 0.2, BOX.colHead, { color: C.orange, pad: 6, until: ev.typed });
    ring(ctx, t, ev.typed, BOX.inputs, { color: C.orange, pad: 8, until: ev.tapCheck });
    tapAt(ctx, t, ev.tapCheck, BOX.check, 'rgba(224,138,0,0.8)');
    ring(ctx, t, ev.tapCheck + 0.2, BOX.fbL, { color: C.green, pad: 6 });
    tip(ctx, t, ev.tipLight, 'עוקבים אחרי השורה והעמודה', 'בשורה 9 ובעמודה 4 מסתתר 36', { seed: 303, color: C.yellow });
    character(ctx, t, T(10, 1), IMG.bday, { h: 240 });
  }
  // ================= 4. HUNT =================
  function shotHunt(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]); useRegion(REG.game); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 'H0' }, { t: ev.tapCell + 0.12, k: 'H1' }]);
    ring(ctx, t, ev.ringQ, BOX.qboxH, { color: C.red, pad: 6, until: ev.ringHeadsH });
    ring(ctx, t, ev.ringHeadsH, BOX.rowHeadH, { color: C.red, pad: 6, until: ev.tapCell });
    ring(ctx, t, ev.ringHeadsH + 0.2, BOX.colHeadH, { color: C.red, pad: 6, until: ev.tapCell });
    tapAt(ctx, t, ev.tapCell, BOX.hcell);
    tip(ctx, t, ev.tipHunt, 'התשובות בטבלה מוסתרות', 'מוצאים את השורה של 3 ואת העמודה של 5, ונוגעים איפה שהן נפגשות', { seed: 304, color: '#ffe3ea' });
    character(ctx, t, T(13, 1), IMG.girl, { h: 230, flip: true });
  }
  // ================= 5. TWINS =================
  function shotTwins(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]); useRegion(REG.game); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 'T0' }, { t: ev.tw2 + 0.12, k: 'T1' }, { t: ev.tw4 + 0.12, k: 'T2' }]);
    ring(ctx, t, ev.ringQT, BOX.qboxT, { color: C.purple, pad: 6, until: ev.tw1 });
    [ev.tw1, ev.tw2, ev.tw3, ev.tw4].forEach((t0, i) => {
      tapAt(ctx, t, t0, BOX.tw[i], 'rgba(138,79,216,0.8)');
      if (i === 0 || i === 2) ring(ctx, t, t0 + 0.1, BOX.tw[i], { color: C.purple, pad: 6, until: [ev.tw2, ev.tw2, ev.tw4, ev.tw4][i] + 0.12 });
    });
    tip(ctx, t, ev.tipTwins, '12 מסתתר ב־4 משבצות', '⁦2×6, 3×4⁩ וגם ההפוכים. מותר לטעות עד 3 פעמים', { seed: 305, color: C.lilac });
    character(ctx, t, T(15, 1), IMG.boy, { h: 230 });
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
    he(ctx, 'בלש לוח הכפל', X, 230, { size: 84, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25) });
    popAt(ctx, t, L[1].t, X, 360, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 500, (c) => pill(c, 0, 0, 'ugabuga.co.il/learn/multiplication-table/game', { size: 40, w: 600, bg: C.blue, fg: '#fff', padX: 36, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 650, (c) => pill(c, 0, 0, 'נסו עכשיו 🔍', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '✖️ איזה תרגיל בלוח הכפל הכי קשה לילדים? כתבו בתגובות', X, 800, { size: 42, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1120 });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotModes }, { t0: T(5), fn: shotStart }, { t0: T(8), fn: shotLight },
    { t0: T(11), fn: shotHunt }, { t0: T(14), fn: shotTwins }, { t0: T(17), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png'); IMG.boy = await L('img/home-detective-boy.png'); IMG.bday = await L('img/birthday-girl.png');
      IMG.mascot = await L('img/mascot.png'); IMG.logo = await L('img/logo.svg');
      for (const k of ['s0', 'L0', 'L1', 'L2', 'H0', 'H1', 'T0', 'T1', 'T2']) IMG[k] = await L(`img/${k}.png`);
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


