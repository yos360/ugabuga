// THE FILM (16:9 tutorial) — "מחולל דפי עבודה": real captures of the page on the left, step header + tip on the right.
// Paper + dot grid, ink-outlined cards with an offset shadow, Heebo; real characters only (no caveman). Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, ev, clock } = S; S.S = S.S || {};
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H;

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', line: '#dde2ed', card: '#ffffff' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));

  // layout: demo card on the left, the step panel on the right (RTL: it is read first)
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
      g.addColorStop(0, '#e0f0ff'); g.addColorStop(0.55, C.lilac); g.addColorStop(1, C.yellow);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.06)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }

  // ---------- the step panel (right): badge + title + subtitle, then a tip card and a character ----------
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

  // ---------- real captures of ugabuga.co.il/tools/worksheet-maker, boxes measured in the DOM (shots/boxes.json) ----------
  const BOX = {
    title: [141, 650, 918, 59], ta: [141, 770, 918, 275], tasks: [141, 1124, 918, 120], match: [499, 1189, 202, 55],
    need: [141, 1254, 918, 25], count1: [141, 1423, 918, 25], copy: [634, 1124, 134, 55], count3: [141, 1388, 918, 25],
    key: [141, 1310, 918, 59], keyYes: [611, 1310, 61, 59], missing: [760, 1861, 280, 371], answers: [465, 2247, 280, 371],
    print: [120, 1525, 275, 65],
  };
  let IW = 1200; const VX = DX + 12, VY = DY + 12, VW = DW - 24, VH = DH - 24; let SC = VW / IW;
  const sx = (x) => VX + x * SC, sy = (y, pan) => VY + (y - pan) * SC;
  function view(ctx, im, pan, alpha = 1) {
    if (!im || alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.beginPath(); ctx.roundRect(VX, VY, VW, VH, 20); ctx.clip();
    ctx.drawImage(im, VX, VY - pan * SC, im.width * SC, im.height * SC);
    ctx.restore();
  }
  function stateView(ctx, t, list, pan = 0) {
    let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k].t) i = k;
    const cur = list[i], a = i ? clamp((t - cur.t) / 0.25) : 1, pOf = (e) => (e.pan === undefined ? pan : e.pan);
    if (i && a < 1) view(ctx, IMG[list[i - 1].k], pOf(list[i - 1]));
    view(ctx, IMG[cur.k], pOf(cur), a);
  }
  function ring(ctx, t, t0, b, pan, { color = C.red, pad = 8, until = 1e9 } = {}) {
    const a = UI.fadeIn(t, t0, 0.2) * (1 - UI.fadeIn(t, until, 0.15)); if (a <= 0) return;
    const x = sx(b[0]) - pad, y = sy(b[1], pan) - pad, w = b[2] * SC + pad * 2, h = b[3] * SC + pad * 2;
    ctx.save(); ctx.beginPath(); ctx.roundRect(VX, VY, VW, VH, 20); ctx.clip(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 7 + 2.5 * Math.sin((t - t0) * 7);
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 26); ctx.stroke(); ctx.restore();
  }
  const tapAt = (ctx, t, t0, b, pan, color = 'rgba(207,47,86,0.8)') => UI.tap(ctx, sx(b[0] + b[2] / 2), sy(b[1] + b[3] / 2, pan), t, t0, { color, size: 110 });
  const siteCard = (ctx) => card(ctx, DX, DY, DW, DH, { seed: 400, r: 30 });
  // draw one box of another capture over the current view
  function patch(ctx, im, b, pan) {
    if (!im) return;
    ctx.drawImage(im, b[0], b[1], b[2], b[3], sx(b[0]), sy(b[1], pan), b[2] * SC, b[3] * SC);
  }
  // a typing reveal: the new text box is wiped in from the right (RTL) over d seconds
  function typeIn(ctx, t, t0, b, pan, im, d = 0.5) {
    const u = clamp((t - t0) / d); if (u <= 0 || u >= 1 || !im) return;
    const x = sx(b[0]), y = sy(b[1], pan), w = b[2] * SC, h = b[3] * SC, cut = x + w * (1 - u);
    ctx.save(); ctx.beginPath(); ctx.rect(x + 6, y + 6, cut - x - 6, h - 12); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(x + 6, y + 6, w, h - 12); ctx.restore();
    if (Math.floor((t - t0) * 6) % 2 === 0) { ctx.fillStyle = C.ink; ctx.fillRect(cut - 3, y + 14, 4, Math.min(44, h - 28)); }
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const X = 1240;
    he(ctx, 'צריכים דף עבודה למילים של השבוע?', X, 250, { size: 76, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: 1150 });
    popAt(ctx, t, ev.q2, X, 410, (c) => he(c, 'מקלידים מילים — ומדפיסים', 0, 0, { size: 100, w: 900, color: C.red, maxW: 1120 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 590, (c) => pill(c, 0, 0, 'מחולל דפי עבודה 📝', { size: 66, w: 900, bg: C.blue, fg: '#fff', padX: 52, seed: 12 }), { rot: -0.02, dur: 0.35 });
    S.CHIPS.forEach(([e, lbl], i) => {
      const t0 = T(1, 1 + i * 0.35), x = X + 435 - i * 290;
      popAt(ctx, t, t0, x, 790, (c) => {
        card(c, -130, -70, 260, 140, { fill: [C.lilac, '#e3f6ea', C.yellow, '#ffe3ea'][i], r: 26, seed: 20 + i, shadow: 8, lw: 4 });
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
    if (bp > 0) img(ctx, IMG.girl, 330, 1050 + (1 - bp) * 600 - hop(t, 14), 760, { rot: -0.03 });
  }

  // ================= 1. WORDS =================
  function shotWords(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]); siteCard(ctx);
    const pan = 600;
    stateView(ctx, t, [{ t: 0, k: 's0' }, { t: ev.typeWords, k: 's1' }], pan);
    if (t >= ev.typeTitle && t < ev.typeWords + 0.25) patch(ctx, IMG.s1, BOX.title, pan);
    typeIn(ctx, t, ev.typeTitle + 0.05, BOX.title, pan, IMG.s1, 0.5);
    typeIn(ctx, t, ev.typeWords + 0.05, BOX.ta, pan, IMG.s1, 1.0);
    ring(ctx, t, ev.ringTitle, BOX.title, pan, { color: C.blue, until: ev.typeWords - 0.2 });
    ring(ctx, t, ev.typeWords, BOX.ta, pan, { color: C.blue, until: ev.ringCount1 });
    ring(ctx, t, ev.ringCount1, BOX.count1, pan, { color: C.blue, pad: 6 });
    tip(ctx, t, ev.tipWords, 'המילים של השבוע', 'או מילים מסיפור שקראתם בכיתה, או את שמות הילדים בגן', { seed: 301 });
    character(ctx, t, T(3, 0), IMG.boy, { h: 250 });
  }
  // ================= 2. EMOJI =================
  function shotEmoji(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]); siteCard(ctx);
    const pan = 600;
    stateView(ctx, t, [{ t: 0, k: 's1' }, { t: ev.typeEmoji, k: 's2' }], pan);
    typeIn(ctx, t, ev.typeEmoji + 0.05, BOX.ta, pan, IMG.s2, 0.9);
    ring(ctx, t, ev.ringNeed, BOX.need, pan, { color: C.red, pad: 6, until: ev.typeEmoji });
    ring(ctx, t, ev.typeEmoji, BOX.ta, pan, { color: C.green, until: ev.ringMatch });
    ring(ctx, t, ev.ringMatch, BOX.match, pan, { color: C.green });
    tip(ctx, t, ev.tipEmoji, 'גשם 🌧️  ·  ענן ☁️', 'עם אימוג׳י ליד שתי מילים לפחות נפתחת משימת "מילה ותמונה"', { seed: 302, color: '#e3f6ea' });
    character(ctx, t, T(6, 1), IMG.girl, { h: 230 });
  }
  // ================= 3. TASKS =================
  function shotTasks(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]); siteCard(ctx);
    const pan = 600;
    stateView(ctx, t, [{ t: 0, k: 's2' }, { t: ev.tapCopy + 0.15, k: 's3' }], pan);
    ring(ctx, t, ev.ringTasks, BOX.tasks, pan, { color: C.red, until: ev.tapCopy - 0.4 });
    ring(ctx, t, ev.tapCopy - 0.4, BOX.copy, pan, { color: C.red, until: ev.ringCount3 });
    tapAt(ctx, t, ev.tapCopy, BOX.copy, pan);
    ring(ctx, t, ev.ringCount3, BOX.count3, pan, { color: C.red, pad: 6 });
    tip(ctx, t, ev.tipTasks, '6 דפי A4', '5 מילים, 5 משימות ודף תשובות — הכול בהדפסה אחת', { seed: 303, color: '#ffe3ea' });
    character(ctx, t, T(9, 1), IMG.boy, { h: 230, flip: true });
  }
  // ================= 4. ANSWER KEY =================
  function shotKey(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]); siteCard(ctx);
    const p1 = 1300, p2 = 1700;
    stateView(ctx, t, [{ t: 0, k: 's4', pan: p1 }, { t: ev.panAns, k: 's4', pan: p2 }]);
    const pan = t >= ev.panAns ? p2 : p1;
    ring(ctx, t, ev.ringKey, BOX.keyYes, p1, { color: C.orange, until: ev.ringMissing });
    if (t < ev.panAns) ring(ctx, t, ev.ringMissing, BOX.missing, p1, { color: C.orange, pad: 6 });
    ring(ctx, t, ev.ringAns, BOX.answers, pan, { color: C.orange, pad: 6 });
    tip(ctx, t, ev.tipKey, 'דף תשובות: כן או בלי', 'עם התשובות לאות החסרה ולאותיות המבולבלות', { seed: 304, color: C.yellow });
    character(ctx, t, T(12, 1), IMG.girl, { h: 230, flip: true });
  }
  // ================= 5. PRINT =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]); siteCard(ctx);
    const pan = 1300;
    stateView(ctx, t, [{ t: 0, k: 's4' }, { t: ev.tapPrint + 0.15, k: 'p0', pan: 0 }], pan);
    ring(ctx, t, ev.ringPrint, BOX.print, pan, { color: C.purple, until: ev.tapPrint + 0.15 });
    tapAt(ctx, t, ev.tapPrint, BOX.print, pan, 'rgba(138,79,216,0.8)');
    tip(ctx, t, ev.tipPrint, '"הדפסה" או "הורדה כ־PDF"', 'שום דבר לא נשלח לשרת: הדף נבנה בדפדפן שלכם', { seed: 305, color: C.lilac });
    character(ctx, t, T(15, 1), IMG.printer, { h: 230 });
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
    he(ctx, 'מחולל דפי עבודה', X, 230, { size: 84, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25) });
    popAt(ctx, t, L[1].t, X, 360, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 500, (c) => pill(c, 0, 0, 'ugabuga.co.il/tools/worksheet-maker', { size: 44, w: 600, bg: C.blue, fg: '#fff', padX: 36, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 650, (c) => pill(c, 0, 0, 'נסו עכשיו 📝', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '✍️ אילו מילים הייתם מכניסים לדף? כתבו בתגובות', X, 800, { size: 42, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1120 });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotWords }, { t0: T(5), fn: shotEmoji }, { t0: T(8), fn: shotTasks },
    { t0: T(11), fn: shotKey }, { t0: T(14), fn: shotPrint }, { t0: T(17), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png'); IMG.boy = await L('img/home-detective-boy.png');
      IMG.printer = await L('img/home-printer.png'); IMG.mascot = await L('img/mascot.png'); IMG.logo = await L('img/logo.svg');
      for (const k of ['s0', 's1', 's2', 's3', 's4', 'p0', 'p1']) IMG[k] = await L(`img/${k}.png`);
      IW = IMG.s0.width; SC = VW / IW;
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
