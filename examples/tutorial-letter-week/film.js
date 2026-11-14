// THE FILM (16:9 tutorial) — "אות השבוע לגן": real captures of the live page on the left,
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

  // ---------- real captures (DSF 2: 2 image px per CSS px) ----------
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
  // a whole kit sheet (SVG viewBox 200×270, captured at DSF 4); map() takes viewBox rects
  function sheet(ctx, im, cx, top, h, { rot = 0, seed = 500, alpha = 1 } = {}) {
    const w = h * 200 / 270, x = cx - w / 2, u = h / 270;
    const g = { x, y: top, w, h, map: (b) => [x + b[0] * u, top + b[1] * u, b[2] * u, b[3] * u] };
    if (!im || alpha <= 0) return g;
    ctx.save(); ctx.globalAlpha *= alpha;
    if (rot) { ctx.translate(cx, top + h / 2); ctx.rotate(rot); ctx.translate(-cx, -top - h / 2); }
    card(ctx, x - 10, top - 10, w + 20, h + 20, { seed, r: 18, shadow: 10 });
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, top, w, h, 10); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(x, top, w, h); ctx.drawImage(im, x, top, w, h); ctx.fillRect(x + 184 * u, top, 16 * u, 14 * u); ctx.restore();
    ctx.restore();
    return g;
  }
  function ring(ctx, t, t0, r, { color = C.red, pad = 8, until = 1e9, rad = 18 } = {}) {
    const a = UI.fadeIn(t, t0, 0.2) * (1 - UI.fadeIn(t, until, 0.15)); if (a <= 0 || !r) return;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 7 + 2.5 * Math.sin((t - t0) * 7);
    ctx.beginPath(); ctx.roundRect(r[0] - pad, r[1] - pad, r[2] + pad * 2, r[3] + pad * 2, Math.min(rad, r[3] / 2 + pad)); ctx.stroke(); ctx.restore();
  }
  const tapR = (ctx, t, t0, r, color = 'rgba(207,47,86,0.8)') => r && UI.tap(ctx, r[0] + r[2] / 2, r[1] + r[3] / 2, t, t0, { color, size: 100 });
  const rise = (t, t0, d = 0.5) => ease.outBack(clamp((t - t0) / d), 1.4);

  // page CSS boxes (shoot.js -> shots/boxes.json)
  const OT = [0, 264], OV = [0, 0], OPLAN = [0, 1038];
  const B = { mem: [938, 651, 134, 95], grid: [208, 437, 864, 416], panel: [256, 401, 220, 144], printBtn: [256, 441, 220, 52], pdf: [209, 60, 154, 47], prn: [961, 119, 110, 47] };
  const R_HUB = [180, 270, 920, 600], R_KIT = [200, 270, 880, 745], R_PR = [190, 45, 900, 955], R_PLAN = [240, 1038, 800, 455];
  // viewBox rects on the sheets (LetterWeek.jsx)
  const V = {
    words: [6, 150, 188, 94],
    trace: [12, 60, 176, 92], colour: [70, 196, 60, 62],
    own: [0, 1, 4, 5, 6].map((i) => [12 + (i % 3) * 61, 50 + Math.floor(i / 3) * 70, 56, 64]),
    key: [16, 259, 168, 8],
    note: [8, 8, 184, 124], cut: [60, 262, 80, 10],
  };

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const sp = rise(t, ev.q1 + 0.15, 0.55);
    if (sp > 0) sheet(ctx, IMG.sheet0, 300, 130 + (1 - sp) * 1000 - hop(t, 6), 760, { rot: -0.05, seed: 40 });
    const s2 = rise(t, ev.q2, 0.5);
    if (s2 > 0) sheet(ctx, IMG.sheet2, 740, 200 + (1 - s2) * -1100, 720, { rot: 0.04, seed: 41 });
    const X = 1450;
    he(ctx, 'איך מלמדים אות חדשה בגן?', X, 250, { size: 58, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: 760 });
    popAt(ctx, t, ev.q2, X, 400, (c) => he(c, 'אות השבוע לגן', 0, 0, { size: 104, w: 900, color: C.red, maxW: 800 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 570, (c) => pill(c, 0, 0, 'ערכה לגננת לכל אות ✏️', { size: 44, w: 900, bg: C.blue, fg: '#fff', padX: 36, seed: 12 }), { rot: -0.02, dur: 0.35 });
    S.CHIPS.forEach(([e, lbl], i) => {
      const t0 = T(1, 1 + i * 0.35), x = X + 330 - i * 220;
      popAt(ctx, t, t0, x, 770, (c) => {
        card(c, -102, -70, 204, 140, { fill: [C.yellow, '#e3f6ea', '#ffe3ea', C.lilac][i], r: 26, seed: 20 + i, shadow: 8, lw: 4 });
        he(c, e, 0, -6, { size: 54, w: 800 });
        he(c, lbl, 0, 48, { size: 30, w: 900, maxW: 180 });
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
    const a = clamp((t - ev.tapMem - 0.2) / 0.3);
    if (a < 1) {
      const g = cropAt(ctx, IMG.hub, OT, R_HUB, LC, 170, 1.25, { seed: 50, alpha: 1 - a });
      ring(ctx, t, ev.ringGrid, g.map(B.grid), { color: C.blue, pad: 10, until: ev.tapMem - 0.4 });
      ring(ctx, t, ev.tapMem - 0.3, g.map(B.mem), { color: C.red, pad: 6 });
      tapR(ctx, t, ev.tapMem, g.map(B.mem));
    }
    if (a > 0) cropAt(ctx, IMG.kitTop, OT, R_KIT, LC, 140, 1.15, { seed: 51, alpha: a });
    tip(ctx, t, ev.tipCount, '📚 22 אותיות', 'לכל אות — ערכה משלה', { seed: 301, color: '#e3efff', y: 470 });
    tip(ctx, t, ev.tipMem, '✈️ למשל: מ׳', 'ארבעה דפים מוכנים|ותוכנית לשבוע שלם', { seed: 302, color: '#ffe3ea', y: 700 });
  }
  // ================= 2. POSTER + TRACING =================
  function shotPoster(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const p1 = rise(t, ev.showPoster - 0.6, 0.5);
    const g1 = sheet(ctx, IMG.sheet0, LC + 300, 140 + (1 - p1) * 1000, 780, { seed: 60, rot: 0.015, alpha: p1 > 0 ? 1 : 0 });
    ring(ctx, t, ev.tipPoster + 0.2, g1.map(V.words), { color: C.red, pad: 6, until: ev.showTrace });
    const p2 = rise(t, ev.showTrace, 0.5);
    const g2 = sheet(ctx, IMG.sheet1, LC - 300, 140 + (1 - p2) * 1000, 780, { seed: 61, rot: -0.015, alpha: p2 > 0 ? 1 : 0 });
    ring(ctx, t, ev.tipTrace, g2.map(V.trace), { color: C.blue, pad: 6, until: ev.tipTrace + 1.2 });
    ring(ctx, t, ev.tipTrace + 1.2, g2.map(V.colour), { color: C.blue, pad: 8 });
    tip(ctx, t, ev.tipPoster, '🖼️ פוסטר לקיר', 'האות, השם שלה וארבע|מילים עם ציורים', { seed: 303, color: '#ffe3ea', y: 470 });
    tip(ctx, t, ev.tipTrace, '✏️ עוברים על הקווים', 'ובסוף צובעים את האות', { seed: 304, color: '#e3efff', y: 720 });
  }
  // ================= 3. HUNT =================
  function shotHunt(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const g = sheet(ctx, IMG.sheet2, LC, 90, 900, { seed: 70 });
    V.own.forEach((r, i) => ring(ctx, t, ev.ringOwn + i * 0.18, g.map(r), { color: C.green, pad: 4, until: ev.ringKey - 0.1 }));
    ring(ctx, t, ev.ringKey, g.map(V.key), { color: C.orange, pad: 8 });
    tip(ctx, t, ev.tipHunt, '🎯 5 ציורים מתחילים ב־מ׳', 'צובעים רק את המסגרות שלהם', { seed: 305, color: '#e3f6ea', y: 470 });
    tip(ctx, t, ev.tipKey, '👩‍🏫 התשובות לגננת', 'בשורה קטנה בתחתית הדף', { seed: 306, color: C.yellow, y: 740 });
  }
  // ================= 4. NOTE + PLAN =================
  function shotNote(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const a = clamp((t - ev.swapPlan) / 0.3);
    if (a < 1) {
      const g = sheet(ctx, IMG.sheet3, LC, 90, 900, { seed: 80, alpha: 1 - a });
      ring(ctx, t, ev.tipNote, g.map(V.note), { color: C.orange, pad: 4, until: ev.tipNote + 1.0 });
      ring(ctx, t, ev.tipNote + 1.0, g.map(V.cut), { color: C.red, pad: 8, until: ev.swapPlan });
    }
    if (a > 0) cropAt(ctx, IMG.plan, OPLAN, R_PLAN, LC, 200, 1.4, { seed: 81, alpha: a });
    tip(ctx, t, ev.tipNote, '✂️ גוזרים לשני פתקים', 'ההורים שולחים חפץ|שמתחיל באות', { seed: 307, color: '#ffedd5', y: 470 });
    tip(ctx, t, ev.tipPlan, '📅 מיום א׳ עד יום ה׳', 'מכירים, כותבים באוויר,|מחפשים, מביאים וחוגגים', { seed: 308, color: C.yellow, y: 720 });
  }
  // ================= 5. PRINT =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const a = clamp((t - ev.tapPrint - 0.2) / 0.3);
    if (a < 1) {
      const g = cropAt(ctx, IMG.kitTop, OT, R_KIT, LC, 140, 1.15, { seed: 90, alpha: 1 - a });
      ring(ctx, t, ev.ringPanel, g.map(B.panel), { color: C.purple, pad: 10, until: ev.tapPrint - 0.1 });
      tapR(ctx, t, ev.tapPrint, g.map(B.printBtn));
    }
    if (a > 0) {
      const g = cropAt(ctx, IMG.print, OV, R_PR, LC, 70, 0.98, { seed: 91, alpha: a });
      ring(ctx, t, ev.tipPrint, g.map(B.prn), { color: C.purple, pad: 6, until: ev.ringPdf - 0.1 });
      ring(ctx, t, ev.ringPdf, g.map(B.pdf), { color: C.red, pad: 6 });
    }
    tip(ctx, t, ev.tipPrint, '🖨️ 4 דפי A4', 'בהדפסה אחת, וגם|בוחרים כמה עותקים', { seed: 309, color: C.lilac, y: 470 });
    tip(ctx, t, ev.tipPdf, '⬇️ או הורדה כ־PDF', 'שומרים ומדפיסים שוב|כמה שרוצים', { seed: 310, color: '#ffe3ea', y: 720 });
    confetti(ctx, t, ev.tipPdf, LC, 300, { n: 50, seed: 4, spread: 700 });
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
    he(ctx, 'אות השבוע לגן ✏️', X, 230, { size: 90, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: 1140 });
    popAt(ctx, t, L[1].t, X, 370, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 510, (c) => pill(c, 0, 0, 'ugabuga.co.il/letters/week', { size: 44, w: 600, bg: C.blue, fg: '#fff', padX: 34, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 660, (c) => pill(c, 0, 0, 'נסו עכשיו ✏️', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '💬 באיזו אות תתחילו השבוע?', X, 810, { size: 46, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1100 });
    he(ctx, 'כתבו לנו בתגובות', X, 880, { size: 44, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[4].t + 0.1, 0.25) });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotPick }, { t0: T(5), fn: shotPoster }, { t0: T(8), fn: shotHunt },
    { t0: T(11), fn: shotNote }, { t0: T(14), fn: shotPrint }, { t0: T(17), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.mascot = await L('img/mascot.png'); IMG.logo = await L('img/logo.svg');
      for (const k of ['hub', 'kitTop', 'plan', 'print', 'sheet0', 'sheet1', 'sheet2', 'sheet3']) IMG[k] = await L(`img/${k}.png`);
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
