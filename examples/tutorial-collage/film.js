// THE FILM (16:9 tutorial) — "קולאז׳ תמונות": real captures of the live page on the left,
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
    const i = pick(t, list), a = i ? clamp((t - list[i].t) / 0.25) : 1;
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

  // page CSS boxes (shoot.js -> shots/boxes.json); captures: hub from y 256, studio shots from y 442
  const OH = [0, 256], OS = [0, 442];
  const B = {
    pHeart: [889, 391, 106, 45], pNumber: [752, 391, 130, 45], pName: [630, 391, 113, 45], pText: [455, 391, 168, 45],
    upBtn: [1000, 606, 246, 52], count: [1014, 533, 65, 21], lock: [677, 534, 402, 20],
    mosaic: [860, 850, 40, 40], numIn: [34, 1069, 304, 52], sliders: [34, 1205, 304, 170],
    styles: [34, 763, 304, 180], s1: [189, 825, 149, 56], s2: [189, 887, 149, 56], more: [34, 952, 304, 41],
    sizeSel: [44, 1640, 284, 43], transp: [44, 1691, 284, 20], jpg: [34, 1803, 304, 52],
    canvas: [380, 745, 877, 620],
  };
  const R_HUB = [200, 262, 880, 186], R_UP = [380, 442, 900, 798], R_M = [16, 690, 1254, 730], R_D = [20, 1362, 336, 560];

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const sp = ease.outBack(clamp((t - ev.q1 - 0.15) / 0.55), 1.4);
    if (sp > 0) cropAt(ctx, IMG.n1, OS, B.canvas, 470, 100 + (1 - sp) * 900 - hop(t, 6), 0.78, { rot: -0.035, seed: 40 });
    const s2 = ease.outBack(clamp((t - ev.q2) / 0.5), 1.4);
    if (s2 > 0) cropAt(ctx, IMG.s2, OS, B.canvas, 640, 640 + (1 - s2) * -900, 0.55, { rot: 0.04, seed: 41 });
    const X = 1450;
    he(ctx, 'יום הולדת 40? בר מצווה?', X, 250, { size: 58, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: 760 });
    popAt(ctx, t, ev.q2, X, 400, (c) => he(c, 'קולאז׳ בצורת מספר מהתמונות שלכם!', 0, 0, { size: 84, w: 900, color: C.red, maxW: 800 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 570, (c) => pill(c, 0, 0, 'מעלים תמונות, והצורה מתמלאת לבד 🧩', { size: 42, w: 900, bg: C.blue, fg: '#fff', padX: 36, seed: 12 }), { rot: -0.02, dur: 0.35 });
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
      pill(ctx, 0, 0, 'חינם, בלי סימן מים', { size: 52, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
  }

  // ================= 1. THE SHAPE =================
  function shotShape(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const g = cropAt(ctx, IMG.hub, OH, R_HUB, LC, 360, 1.3, { seed: 50 });
    const cols = [C.red, C.green, C.blue, C.purple];
    ['pHeart', 'pNumber', 'pName', 'pText'].forEach((k, i) => ring(ctx, t, ev['p' + i], g.map(B[k]), { color: cols[i], pad: 6, until: k === 'pNumber' ? 1e9 : ev.tapNum }));
    tapR(ctx, t, ev.tapNum, g.map(B.pNumber), 'rgba(35,135,77,0.8)');
    popAt(ctx, t, ev.p0 - 0.3, LC, 770, (c) => pill(c, 0, 0, 'לכל צורה יש דף משלה', { size: 40, w: 900, bg: C.yellow, seed: 52, padX: 30 }), { rot: -0.02 });
    tip(ctx, t, ev.tipShape, '🔢 קולאז׳ מספר', 'למשל 40 ליום הולדת עגול, או 13 לבר מצווה', { seed: 301, color: '#e3f6ea' });
    character(ctx, t, T(4, 0), IMG.bday);
  }
  // ================= 2. UPLOAD =================
  function shotUp(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const g = states(ctx, t, [{ t: 0, k: 'n0' }, { t: ev.upDone, k: 'n1' }], OS, R_UP, LC, 100, 1.17, { seed: 60 });
    ring(ctx, t, ev.ringUp, g.map(B.upBtn), { color: C.red, pad: 6, until: ev.upDone - 0.1 });
    tapR(ctx, t, ev.tapUp, g.map(B.upBtn));
    ring(ctx, t, ev.ringCount, g.map(B.count), { color: C.blue, pad: 6, until: ev.tipUp + 0.2 });
    ring(ctx, t, ev.tipUp, g.map(B.lock), { color: C.green, pad: 6 });
    tip(ctx, t, ev.tipUp, '🔒 נשארות אצלכם', 'התמונות לא עולות לשום שרת', { seed: 302, color: '#e3efff', y: 470 });
    tip(ctx, t, ev.tipOrder, '📅 לפי תאריך הצילום', 'כל ריבוע מקבל תמונה לפי הסדר. חסרות תמונות? הן חוזרות', { seed: 303, color: C.yellow, y: 700 });
  }
  // ================= 3. THE NUMBER =================
  function shotNum(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const st = [{ t: 0, k: 'n1' }, { t: ev.tapMosaic + 0.2, k: 'm0' }, { t: ev.k1, k: 'm1' }, { t: ev.k2, k: 'm2' }];
    const g = states(ctx, t, st, OS, R_M, LC, 200, 0.917, { seed: 70 });
    tapR(ctx, t, ev.tapMosaic, g.map(B.mosaic), 'rgba(35,135,77,0.8)');
    ring(ctx, t, ev.ringIn, g.map(B.numIn), { color: C.green, pad: 6, until: ev.tipMore });
    for (const k of ['k1', 'k2']) { const r = g.map(B.numIn); UI.tap(ctx, r[0] + 80, r[1] + r[3] / 2, t, ev[k], { color: 'rgba(35,135,77,0.7)', size: 70 }); }
    ring(ctx, t, ev.tipMore, g.map(B.sliders), { color: C.orange, pad: 6 });
    popAt(ctx, t, ev.k2 + 0.3, LC + 250, 128, (c) => pill(c, 0, 0, '40 → 13', { size: 40, w: 900, bg: C.yellow, seed: 72, padX: 26, dir: 'ltr' }), { rot: 0.03 });
    tip(ctx, t, ev.tipNum, '✍️ עד 12 תווים', 'מספר, או שם בעברית או באנגלית', { seed: 304, color: '#e3f6ea', y: 470 });
    tip(ctx, t, ev.tipMore, '🎛️ עוד כוונונים', 'כמה ריבועים, רווח בין התמונות ופינות מעוגלות', { seed: 305, color: '#ffedd5', y: 700 });
  }
  // ================= 4. STYLE =================
  function shotStyle(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const st = [{ t: 0, k: 's0' }, { t: ev.tapS1 + 0.15, k: 's1' }, { t: ev.tapS2 + 0.15, k: 's2' }];
    const g = states(ctx, t, st, OS, R_M, LC, 200, 0.917, { seed: 80 });
    ring(ctx, t, ev.ringStyles, g.map(B.styles), { color: C.orange, pad: 8, until: ev.tapS1 - 0.1 });
    tapR(ctx, t, ev.tapS1, g.map(B.s1), 'rgba(224,138,0,0.85)');
    tapR(ctx, t, ev.tapS2, g.map(B.s2), 'rgba(224,138,0,0.85)');
    ring(ctx, t, ev.tipStyle, g.map(B.more), { color: C.purple, pad: 6 });
    tip(ctx, t, ev.tipStyle, '🎨 עוד 18 סגנונות', 'בכפתור "עוד 18 סגנונות". טקסט ואימוג׳י מוסיפים מהסרגל למעלה', { seed: 306, color: C.lilac });
    character(ctx, t, T(13, 1), IMG.girl);
  }
  // ================= 5. SIZE + DOWNLOAD =================
  function shotDl(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    cropAt(ctx, IMG.s2, OS, B.canvas, 390, 330, 0.6, { rot: -0.03, seed: 91 });
    const g = cropAt(ctx, IMG.d0, OS, R_D, 1000, 140, 1.48, { seed: 90 });
    ring(ctx, t, ev.ringSize, g.map(B.sizeSel), { color: C.purple, pad: 6, until: ev.ringJpg });
    ring(ctx, t, ev.ringTransp, g.map(B.transp), { color: C.blue, pad: 6, until: ev.ringJpg });
    ring(ctx, t, ev.ringJpg, g.map(B.jpg), { color: C.red, pad: 6 });
    tapR(ctx, t, ev.tapJpg, g.map(B.jpg));
    tip(ctx, t, ev.ringSize + 0.2, '📐 A4, A3 או פוסטר', 'וגם ריבוע לרשתות או סטורי לטלפון', { seed: 307, color: C.lilac, y: 470 });
    tip(ctx, t, ev.tipDl, '⬇️ JPG או PNG שקוף', 'בלי סימן מים. ⁦300 DPI⁩ להדפסה', { seed: 308, color: '#ffe3ea', y: 700 });
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
    he(ctx, 'קולאז׳ תמונות: מספר, לב ושם', X, 230, { size: 84, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: 1140 });
    popAt(ctx, t, L[1].t, X, 370, (c) => pill(c, 0, 0, 'חינם, בלי סימן מים', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 510, (c) => pill(c, 0, 0, 'ugabuga.co.il/tools/collage', { size: 44, w: 600, bg: C.blue, fg: '#fff', padX: 36, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 660, (c) => pill(c, 0, 0, 'נסו עכשיו 🧩', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '💬 איזה מספר או שם הייתם מכינים מהתמונות שלכם?', X, 810, { size: 46, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1100 });
    he(ctx, 'כתבו בתגובות', X, 880, { size: 44, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[4].t + 0.1, 0.25) });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotShape }, { t0: T(5), fn: shotUp }, { t0: T(8), fn: shotNum },
    { t0: T(11), fn: shotStyle }, { t0: T(14), fn: shotDl }, { t0: T(17), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png'); IMG.bday = await L('img/birthday-girl.png');
      IMG.mascot = await L('img/mascot.png'); IMG.logo = await L('img/logo.svg');
      for (const k of ['hub', 'n0', 'n1', 'm0', 'm1', 'm2', 's0', 's1', 's2', 'd0']) IMG[k] = await L(`img/${k}.png`);
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
