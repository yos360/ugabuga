// THE FILM (16:9 tutorial) — "שיעורי עזר בבית": real captures of the page on the left, step header + tip on the right.
// with an offset shadow, Heebo; real characters only (no caveman). Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, ev, clock } = S; S.S = S.S || {};
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H;

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', line: '#dde2ed', card: '#ffffff', key: '#f6f7fb', wa: '#25d366' };
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
  const mix = (hex, k) => { // hex colour mixed with white, k = share of the colour
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return `rgb(${Math.round(255 + (r - 255) * k)},${Math.round(255 + (g - 255) * k)},${Math.round(255 + (b - 255) * k)})`;
  };

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
      g.addColorStop(0, C.lilac); g.addColorStop(0.55, C.blush); g.addColorStop(1, C.yellow);
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
  // a tip card in the right panel, under the subtitle
  function tip(ctx, t, t0, title, note, { y = 520, color = C.yellow, seed = 300 } = {}) {
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

  // ---------- real captures of ugabuga.co.il/tutoring and one plan, boxes measured in the DOM (shots/boxes.json) ----------
  const BOX = { g5: [495, 644, 100, 61], math: [563, 882, 131, 61], frac: [165, 1175, 430, 99], read: [902, 882, 133, 61], compr: [165, 958, 430, 99], picked: [165, 1071, 870, 36], month: [845, 1284, 90, 61], d4: [825, 1401, 100, 61], m15: [793, 1518, 116, 61], base: [887, 1635, 148, 61], go: [469, 1821, 261, 68], session: [140, 699, 920, 742], sheet: [643, 1101, 162, 61], hard: [559, 1357, 159, 61], third: [140, 1726, 920, 76], print: [732, 601, 256, 68], send: [211, 601, 254, 68] };
  let IW = 1200; const VX = DX + 12, VY = DY + 12, VW = DW - 24, VH = DH - 24; let SC = VW / IW;
  const sx = (x) => VX + x * SC, sy = (y, pan) => VY + (y - pan) * SC;
  function view(ctx, im, pan, alpha = 1) {
    if (!im || alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.beginPath(); ctx.roundRect(VX, VY, VW, VH, 20); ctx.clip();
    ctx.drawImage(im, VX, VY - pan * SC, im.width * SC, im.height * SC);
    ctx.restore();
  }
  // image states over time, each with its own scroll: cross-fade 0.25 s
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
  const panEase = (t, t0, y0, y1, d = 0.7) => lerp(y0, y1, ease.inOutCubic ? ease.inOutCubic(clamp((t - t0) / d)) : ease.outCubic(clamp((t - t0) / d)));

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const X = 1240;
    he(ctx, 'קשה לילד בלימודים?', X, 250, { size: 84, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2) });
    popAt(ctx, t, ev.q2, X, 410, (c) => he(c, 'איך עוזרים בבית?', 0, 0, { size: 112, w: 900, color: C.red, maxW: 1120 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 590, (c) => pill(c, 0, 0, 'שיעורי עזר בבית 🤝', { size: 66, w: 900, bg: C.blue, fg: '#fff', padX: 52, seed: 12 }), { rot: -0.02, dur: 0.35 });
    S.CHIPS.forEach(([e, lbl], i) => {
      const t0 = T(1, 1 + i * 0.35), x = X + 435 - i * 290;
      popAt(ctx, t, t0, x, 790, (c) => {
        card(c, -130, -70, 260, 140, { fill: [C.lilac, '#e3f6ea', C.yellow, '#ffe3ea'][i], r: 26, seed: 20 + i, shadow: 8, lw: 4 });
        he(c, e, 0, -6, { size: 54, w: 800 });
        he(c, lbl, 0, 48, { size: 36, w: 900, maxW: 230 });
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
    if (bp > 0) img(ctx, IMG.girl, 340, 1050 + (1 - bp) * 600 - hop(t, 14), 760, { rot: -0.03 });
  }

  // ================= 1. GRADE =================
  function shotGrade(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]); siteCard(ctx);
    const pan = 300;
    stateView(ctx, t, [{ t: 0, k: 'h0' }, { t: ev.tapGrade + 0.15, k: 'h1' }], pan);
    ring(ctx, t, T(2, 1), BOX.g5, pan, { color: C.blue });
    tapAt(ctx, t, ev.tapGrade, BOX.g5, pan, 'rgba(34,107,215,0.8)');
    tip(ctx, t, ev.tipGrade, 'מכיתה א׳ עד כיתה ח׳', 'קריאה, כתיבה ולשון, חשבון ואנגלית', { y: 530, seed: 301 });
    character(ctx, t, T(3, 0), IMG.boy, { h: 250 });
  }
  // ================= 2. WHAT IS HARD =================
  function shotSkills(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]); siteCard(ctx);
    const pan = 720;
    stateView(ctx, t, [{ t: 0, k: 'h1' }, { t: ev.tapMath + 0.15, k: 'h2' }, { t: ev.tapFrac + 0.15, k: 'h3' }, { t: ev.tapRead + 0.15, k: 'h4' }, { t: ev.tapCompr + 0.15, k: 'h5' }], pan);
    ring(ctx, t, T(4, 1), BOX.math, pan, { color: C.red, until: ev.tapMath + 0.3 });
    tapAt(ctx, t, ev.tapMath, BOX.math, pan);
    ring(ctx, t, ev.tapMath + 0.4, BOX.frac, pan, { color: C.red, until: ev.tapRead - 0.5 });
    tapAt(ctx, t, ev.tapFrac, BOX.frac, pan);
    ring(ctx, t, ev.tapRead - 0.4, BOX.read, pan, { color: C.red, until: ev.tapRead + 0.3 });
    tapAt(ctx, t, ev.tapRead, BOX.read, pan);
    ring(ctx, t, ev.tapRead + 0.4, BOX.compr, pan, { color: C.red, until: ev.tapCompr + 0.3 });
    tapAt(ctx, t, ev.tapCompr, BOX.compr, pan);
    ring(ctx, t, ev.tapCompr + 0.5, BOX.picked, pan, { color: C.green, pad: 6 });
    tip(ctx, t, ev.tipSkills, 'עד 3 נושאים', 'כדאי להתחיל מהקושי שהכי מפריע עכשיו', { y: 530, seed: 302, color: '#ffe3ea' });
    character(ctx, t, T(5, 1), IMG.girl, { h: 230 });
  }
  // ================= 3. HOW MUCH TIME =================
  function shotTime(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]); siteCard(ctx);
    const pan = 1040;
    stateView(ctx, t, [{ t: 0, k: 'h5' }, { t: ev.tapMonth + 0.15, k: 'h6' }], pan);
    ring(ctx, t, T(7, 1), BOX.month, pan, { color: C.purple, until: ev.ringDays });
    tapAt(ctx, t, ev.tapMonth, BOX.month, pan, 'rgba(138,79,216,0.8)');
    ring(ctx, t, ev.ringDays, BOX.d4, pan, { color: C.purple, until: ev.tapGo - 0.5 });
    ring(ctx, t, ev.ringMin, BOX.m15, pan, { color: C.purple, until: ev.tapGo - 0.5 });
    ring(ctx, t, ev.ringBase, BOX.base, pan, { color: C.purple, until: ev.tapGo - 0.5 });
    ring(ctx, t, ev.tapGo - 0.5, BOX.go, pan, { color: C.green });
    tapAt(ctx, t, ev.tapGo, BOX.go, pan, 'rgba(35,135,77,0.8)');
    tip(ctx, t, ev.tipTime, 'קשה לשבת הרבה זמן?', 'מסמנים, ונוספת הפסקת תנועה בכל מפגש', { y: 530, seed: 303, color: '#f4edff' });
    character(ctx, t, T(8, 1), IMG.printer, { h: 230 });
  }
  // ================= 4. THE PLAN =================
  function shotPlan(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]); siteCard(ctx);
    const pan = panEase(t, ev.panPlan, 200, 520, 0.8);
    view(ctx, IMG.p0, pan);
    ring(ctx, t, ev.panPlan + 0.9, BOX.session, pan, { color: C.green, pad: 4, until: ev.tapSheet - 0.4 });
    ring(ctx, t, ev.tapSheet - 0.4, BOX.sheet, pan, { color: C.green });
    tapAt(ctx, t, ev.tapSheet, BOX.sheet, pan, 'rgba(35,135,77,0.8)');
    tip(ctx, t, ev.tipPlan, '16 מפגשים ב־4 שבועות', 'חימום, לומדים יחד, מתרגלים ומסיימים. הכול ב־15 דקות', { y: 530, seed: 304, color: '#e3f6ea' });
    character(ctx, t, T(11, 1), IMG.boy, { h: 230, flip: true });
  }
  // ================= 5. HOW WAS IT =================
  function shotHow(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]); siteCard(ctx);
    const pan = t < ev.panList ? 640 : panEase(t, ev.panList, 640, 1230, 0.7);
    stateView(ctx, t, [{ t: 0, k: 'p0' }, { t: ev.tapHard + 0.15, k: 'p1' }], pan);
    ring(ctx, t, T(13, 1.5), BOX.hard, pan, { color: C.orange, until: ev.tapHard + 0.3 });
    tapAt(ctx, t, ev.tapHard, BOX.hard, pan, 'rgba(224,138,0,0.8)');
    ring(ctx, t, ev.panList + 0.8, BOX.third, pan, { color: C.orange, pad: 4 });
    tip(ctx, t, ev.tipHow, 'היה קשה? נשארים בשלב', 'ביום שלישי חוזרים ל"חצי, שליש ורבע" במקום להתקדם', { y: 530, seed: 305, color: '#fff4bb' });
    character(ctx, t, T(14, 1), IMG.girl, { h: 230, flip: true });
  }
  // ================= 6. PRINT AND SEND =================
  function shotSend(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[5]); siteCard(ctx);
    const pan = 340, list = [{ t: 0, k: 'p1' }, { t: ev.tapPrint + 0.15, k: 'd0', pan: 0 }];
    stateView(ctx, t, list, pan);
    ring(ctx, t, T(16, 0.75), BOX.send, pan, { color: C.cyan, until: ev.tapPrint });
    ring(ctx, t, T(16, 1.5), BOX.print, pan, { color: C.red, until: ev.tapPrint + 0.15 });
    tapAt(ctx, t, ev.tapPrint, BOX.print, pan);
    tip(ctx, t, ev.tipSend, 'הכול נשאר אצלכם', 'בלי פרטים על הילד. ההתקדמות נשמרת בדפדפן', { y: 530, seed: 306, color: '#e0f7fc' });
    character(ctx, t, T(16, 1), IMG.mascot, { h: 250, rot: -0.03 });
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
    const L = S.endLines, X = 620;
    he(ctx, 'שיעורי עזר בבית', X, 230, { size: 84, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25) });
    popAt(ctx, t, L[1].t, X, 360, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 500, (c) => pill(c, 0, 0, 'ugabuga.co.il/tutoring', { size: 62, w: 600, bg: C.blue, fg: '#fff', padX: 48, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 650, (c) => pill(c, 0, 0, 'נסו עכשיו 🤝', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '✍️ במה הייתם מתחילים? כתבו בתגובות', X, 800, { size: 44, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1080 });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotGrade }, { t0: T(4), fn: shotSkills }, { t0: T(7), fn: shotTime },
    { t0: T(10), fn: shotPlan }, { t0: T(13), fn: shotHow }, { t0: T(16), fn: shotSend }, { t0: T(18), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png'); IMG.boy = await L('img/home-detective-boy.png');
      IMG.printer = await L('img/home-printer.png'); IMG.mascot = await L('img/mascot.png'); IMG.logo = await L('img/logo.svg');
      for (const k of ['h0', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p0', 'p1', 'd0']) IMG[k] = await L(`img/${k}.png`);
      IW = IMG.h0.width; SC = VW / IW;
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
