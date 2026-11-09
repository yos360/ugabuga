// THE FILM (16:9 tutorial) — "עיצוב חולצות": real captures of /tools/shirt-designer on the left (whole screen, or the
// section + the shirt it draws), step header + tip on the right. Paper + dot grid, ink cards, Heebo; real characters only.
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

  // ---------- real captures (viewport shots 1375×1125), boxes measured in the DOM (shots/boxes.json) ----------
  const BOX = {
    nav: [68, 184, 1240, 122], maslul: [1006, 184, 245, 56],
    animals: [1057, 93, 111, 56], lion: [1187, 164, 98, 100], shield: [945, 484, 175, 56],
    title: [645, 134, 640, 61], slogan: [686, 444, 189, 38], fontHand: [994, 587, 120, 55],
    black: [1175, 144, 50, 50], one0: [645, 461, 640, 36], one: [645, 365, 640, 36],
    names: [645, 200, 640, 242], png: [68, 929, 525, 65], svg: [68, 1009, 525, 61],
  };
  const FULL = [0, 0, 1375, 1125];
  const REG = { text: [612, 15, 708, 665], colors: [612, 15, 708, 520], names: [612, 80, 708, 380] };
  const CTRL = [560, 70, 700, 940], SHIRT = [70, 120, 460, 840];
  let R = FULL, SC = 1, VX = 0, VY = 0, VW = 0, VH = 0;
  function useRegion(reg, box = [DX, DY, DW, DH]) {
    R = reg; SC = Math.min((box[2] - 24) / reg[2], (box[3] - 24) / reg[3]);
    VW = reg[2] * SC; VH = reg[3] * SC; VX = box[0] + (box[2] - VW) / 2; VY = box[1] + (box[3] - VH) / 2;
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
  const pick = (t, list) => { let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k].t) i = k; return i; };
  function stateView(ctx, t, list, suffix = '') {
    const i = pick(t, list);
    const a = i ? clamp((t - list[i].t) / 0.25) : 1;
    if (i && a < 1) view(ctx, IMG[list[i - 1].k + suffix]);
    view(ctx, IMG[list[i].k + suffix], a);
  }
  function ring(ctx, t, t0, b, { color = C.red, pad = 8, until = 1e9, r = 22 } = {}) {
    const a = UI.fadeIn(t, t0, 0.2) * (1 - UI.fadeIn(t, until, 0.15)); if (a <= 0) return;
    const x = sx(b[0]) - pad, y = sy(b[1]) - pad, w = b[2] * SC + pad * 2, h = b[3] * SC + pad * 2;
    ctx.save(); ctx.beginPath(); ctx.roundRect(VX, VY, VW, VH, 20); ctx.clip(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 7 + 2.5 * Math.sin((t - t0) * 7);
    ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(r, h / 2 + pad)); ctx.stroke(); ctx.restore();
  }
  const tapAt = (ctx, t, t0, b, color = 'rgba(207,47,86,0.8)') => UI.tap(ctx, sx(b[0] + b[2] / 2), sy(b[1] + b[3] / 2), t, t0, { color, size: 100 });
  const siteCard = (ctx) => card(ctx, VX - 12, VY - 12, VW + 24, VH + 24, { seed: 400, r: 30 });
  // split screen: the section on the right of the demo area, the shirt it draws on the left (on its own card)
  function shirtCard(ctx, t, list, t0) {
    const im = IMG[list[0].k + '_s']; if (!im) return;
    const p = ease.outBack(clamp((t - t0) / 0.4), 1.4);
    const h = 540, w = im.width * h / im.height, cx = 290, cy = 540 + (1 - p) * 700;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.025);
    card(ctx, -w / 2 - 14, -h / 2 - 14, w + 28, h + 28, { seed: 410, r: 26 });
    const i = pick(t, list), a = i ? clamp((t - list[i].t) / 0.25) : 1;
    const draw = (k, al) => { const m = IMG[k + '_s']; if (!m || al <= 0) return; ctx.save(); ctx.globalAlpha *= al; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 14); ctx.clip(); ctx.drawImage(m, -w / 2, -h / 2, w, h); ctx.restore(); };
    if (i && a < 1) draw(list[i - 1].k, 1);
    draw(list[i].k, a);
    ctx.restore();
    he(ctx, 'כך זה נראה על החולצה', cx, 885, { size: 34, w: 800, color: C.muted, alpha: clamp((t - t0 - 0.3) / 0.3) });
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const sp = ease.outBack(clamp((t - ev.q1 - 0.15) / 0.55), 1.4);
    if (sp > 0 && IMG.c2_s) {
      const im = IMG.c2_s, h = 780, w = im.width * h / im.height;
      ctx.save(); ctx.translate(400, 545 + (1 - sp) * 700 - hop(t, 6)); ctx.rotate(-0.045);
      card(ctx, -w / 2 - 16, -h / 2 - 16, w + 32, h + 32, { seed: 40, r: 24 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 12); ctx.clip(); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
      ctx.restore();
    }
    const X = 1270;
    he(ctx, 'צריכים חולצה לסוף מסלול או לסיום קורס?', X + 40, 250, { size: 66, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: 940 });
    popAt(ctx, t, ev.q2, X, 410, (c) => he(c, 'מעצבים אותה לבד!', 0, 0, { size: 104, w: 900, color: C.red, maxW: 1060 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 590, (c) => pill(c, 0, 0, 'עיצוב חולצות 👕', { size: 62, w: 900, bg: C.blue, fg: '#fff', padX: 52, seed: 12 }), { rot: -0.02, dur: 0.35 });
    S.CHIPS.forEach(([e, lbl], i) => {
      const t0 = T(1, 1 + i * 0.35), x = X + 405 - i * 270;
      popAt(ctx, t, t0, x, 790, (c) => {
        card(c, -122, -70, 244, 140, { fill: [C.yellow, '#ffe3ea', C.lilac, '#e3f6ea'][i], r: 26, seed: 20 + i, shadow: 8, lw: 4 });
        he(c, e, 0, -6, { size: 54, w: 800 });
        he(c, lbl, 0, 48, { size: 34, w: 900, maxW: 214 });
      }, { rot: [-0.04, 0.03, -0.02, 0.04][i] });
    });
    const fp = clamp((t - ev.free) / 0.18);
    if (fp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(fp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(X, 960); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(fp * 2);
      pill(ctx, 0, 0, 'בחינם, בלי הרשמה', { size: 52, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
  }

  // ================= 1. OCCASION =================
  function shotOccasion(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    useRegion(FULL); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 'a0' }, { t: ev.tapMaslul + 0.12, k: 'a1' }]);
    ring(ctx, t, ev.ringNav, BOX.nav, { color: C.blue, until: ev.tapMaslul });
    tapAt(ctx, t, ev.tapMaslul, BOX.maslul, 'rgba(34,107,215,0.8)');
    ring(ctx, t, ev.tapMaslul + 0.15, BOX.maslul, { color: C.blue, pad: 6 });
    tip(ctx, t, ev.tipOcc, '9 אירועים', 'סוף מסלול, סיום קורס, מסע כומתה, הורים גאים, י״ב, כיתה ו׳, גן, תנועת נוער ומכינה', { seed: 301, color: '#e0f0ff' });
    character(ctx, t, T(4, 1), IMG.boy, { h: 250 });
  }
  // ================= 2. DRAWING + LAYOUT =================
  function shotArt(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    useRegion(FULL); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 'b0' }, { t: ev.tapAnimals + 0.12, k: 'b1' }, { t: ev.tapLion + 0.12, k: 'b2' }, { t: ev.tapShield + 0.12, k: 'b3' }]);
    tapAt(ctx, t, ev.tapAnimals, BOX.animals, 'rgba(35,135,77,0.8)');
    ring(ctx, t, ev.tapAnimals + 0.15, BOX.animals, { color: C.green, pad: 6, until: ev.tapLion });
    tapAt(ctx, t, ev.tapLion, BOX.lion, 'rgba(35,135,77,0.8)');
    ring(ctx, t, ev.tapLion + 0.15, BOX.lion, { color: C.green, pad: 6, until: ev.tapShield });
    tapAt(ctx, t, ev.tapShield, BOX.shield, 'rgba(35,135,77,0.8)');
    ring(ctx, t, ev.tapShield + 0.15, BOX.shield, { color: C.green, pad: 6 });
    tip(ctx, t, ev.tipArt, '4 פריסות', 'סמל עגול, מגן עם סרט, כותרת גדולה וגב עם שמות', { seed: 302, color: '#e3f6ea' });
    character(ctx, t, T(7, 1), IMG.girl, { h: 230, flip: true });
  }
  // ================= 3. TEXT + FONT =================
  function shotText(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const list = [{ t: 0, k: 'c0' }, { t: ev.tapSlogan + 0.12, k: 'c1' }, { t: ev.tapFont + 0.12, k: 'c2' }];
    useRegion(REG.text, CTRL); siteCard(ctx);
    stateView(ctx, t, list);
    ring(ctx, t, ev.ringTitle, BOX.title, { color: C.orange, pad: 6, until: ev.tapSlogan });
    tapAt(ctx, t, ev.tapSlogan, BOX.slogan, 'rgba(224,138,0,0.85)');
    ring(ctx, t, ev.tapSlogan + 0.15, BOX.slogan, { color: C.orange, pad: 6, until: ev.tapFont });
    tapAt(ctx, t, ev.tapFont, BOX.fontHand, 'rgba(224,138,0,0.85)');
    ring(ctx, t, ev.tapFont + 0.15, BOX.fontHand, { color: C.orange, pad: 6 });
    shirtCard(ctx, t, list, S.steps[2].t + 0.2);
    tip(ctx, t, ev.tipText, 'משפטים מוכנים', 'או כותבים משפט משלכם. ארבעה גופנים: רגיל, עגול, כתב יד וסת״ם', { seed: 303, color: C.yellow });
    character(ctx, t, T(10, 1), IMG.bday, { h: 240 });
  }
  // ================= 4. COLOURS =================
  function shotColors(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const list = [{ t: 0, k: 'd0' }, { t: ev.tapBlack + 0.12, k: 'd1' }, { t: ev.tapOne + 0.12, k: 'd2' }];
    useRegion(REG.colors, CTRL); siteCard(ctx);
    stateView(ctx, t, list);
    tapAt(ctx, t, ev.tapBlack, BOX.black);
    ring(ctx, t, ev.tapBlack + 0.15, BOX.black, { color: C.red, pad: 6, until: ev.tapOne });
    ring(ctx, t, ev.tapBlack + 0.9, BOX.one0, { color: C.red, pad: 6, until: ev.tapOne + 0.12 });
    tapAt(ctx, t, ev.tapOne, [BOX.one0[0] + BOX.one0[2] - 40, BOX.one0[1], 40, 36]);
    ring(ctx, t, ev.tapOne + 0.15, BOX.one, { color: C.red, pad: 6 });
    shirtCard(ctx, t, list, S.steps[3].t + 0.2);
    tip(ctx, t, ev.tipColor, 'צבע אחד בלבד', 'בהדפסת משי כל צבע עולה בנפרד, אז צבע אחד יוצא זול יותר', { seed: 304, color: '#ffe3ea' });
    character(ctx, t, T(13, 1), IMG.school, { h: 240, flip: true });
  }
  // ================= 5. NAMES + DOWNLOAD =================
  function shotNames(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    if (t < ev.full) {
      useRegion(REG.names, CTRL); siteCard(ctx);
      view(ctx, IMG.e0);
      ring(ctx, t, ev.ringNames, BOX.names, { color: C.purple, pad: 6 });
      shirtCard(ctx, t, [{ t: 0, k: 'e0' }], S.steps[4].t + 0.2);
    } else {
      useRegion(FULL); siteCard(ctx);
      view(ctx, IMG.e1, clamp((t - ev.full) / 0.25));
      ring(ctx, t, ev.full + 0.3, BOX.png, { color: C.purple, pad: 8 });
      tapAt(ctx, t, ev.tapPng, BOX.png, 'rgba(138,79,216,0.8)');
      ring(ctx, t, ev.tipDl + 0.4, BOX.svg, { color: C.purple, pad: 8 });
    }
    tip(ctx, t, ev.tipDl, 'PNG שקוף, בערך A3', 'קובץ ⁦3000×4000⁩ בלי רקע לבית הדפוס. להדפסת משי יש גם SVG', { seed: 305, color: C.lilac });
    character(ctx, t, T(16, 1), IMG.printer, { h: 230 });
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
    he(ctx, 'עיצוב חולצות מחזור וסיום קורס', X, 230, { size: 80, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: 1120 });
    popAt(ctx, t, L[1].t, X, 360, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 500, (c) => pill(c, 0, 0, 'ugabuga.co.il/tools/shirt-designer', { size: 44, w: 600, bg: C.blue, fg: '#fff', padX: 38, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 650, (c) => pill(c, 0, 0, 'נסו עכשיו 👕', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '🎖️ לאיזה אירוע אתם מכינים חולצה? כתבו בתגובות', X, 800, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1160 });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotOccasion }, { t0: T(5), fn: shotArt }, { t0: T(8), fn: shotText },
    { t0: T(11), fn: shotColors }, { t0: T(14), fn: shotNames }, { t0: T(17), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png'); IMG.boy = await L('img/home-detective-boy.png'); IMG.bday = await L('img/birthday-girl.png');
      IMG.school = await L('img/home-schoolgirl.png'); IMG.printer = await L('img/home-printer.png');
      IMG.mascot = await L('img/mascot.png'); IMG.logo = await L('img/logo.svg');
      for (const k of ['a0', 'a1', 'b0', 'b1', 'b2', 'b3', 'c0', 'c1', 'c2', 'd0', 'd1', 'd2', 'e0', 'e1']) IMG[k] = await L(`img/${k}.png`);
      for (const k of ['c0', 'c1', 'c2', 'd0', 'd1', 'd2', 'e0']) IMG[k + '_s'] = await L(`img/${k}_s.png`);
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
