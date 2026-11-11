// THE FILM (16:9 tutorial) — "סולמות ונחשים של כפל וחילוק": real captures of the live page on the left,
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
      g.addColorStop(0, '#e3f6ea'); g.addColorStop(0.55, '#e3efff'); g.addColorStop(1, C.yellow);
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

  // ---------- real captures ----------
  // panel clips c*.png: CSS origin (292,848) at DSF 2; pr.png: the viewport at DSF 2 (CSS origin 0,0).
  const BOX = {
    levels: [426, 872, 548, 47], lEasy: [803, 872, 171, 47], lFull: [617, 872, 178, 47], lHard: [426, 872, 183, 47],
    mFilled: [707, 931, 235, 47], mBlank: [459, 931, 240, 47], cYes: [757, 990, 73, 47], cNo: [570, 990, 179, 47],
    fresh: [612, 1049, 176, 47], print: [316, 174, 220, 52], sheet: [626, 148, 392, 529],
  };
  const SRC = { panel: { org: [292, 848], dsf: 2 }, view: { org: [0, 0], dsf: 2 } };
  const REG = { panel: [312, 858, 776, 250], mode: [440, 920, 520, 128], fresh: [590, 1038, 220, 69], print: [290, 100, 760, 600] };
  let R = REG.panel, O = SRC.panel, SC = 1, VX = 0, VY = 0, VW = 0, VH = 0;
  function useRegion(reg, src, box = [DX, DY, DW, DH]) {
    R = reg; O = src; SC = Math.min((box[2] - 24) / reg[2], (box[3] - 24) / reg[3]);
    VW = reg[2] * SC; VH = reg[3] * SC; VX = box[0] + (box[2] - VW) / 2; VY = box[1] + (box[3] - VH) / 2;
  }
  const sx = (x) => VX + (x - R[0]) * SC, sy = (y) => VY + (y - R[1]) * SC;
  function view(ctx, im, alpha = 1) {
    if (!im || alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.beginPath(); ctx.roundRect(VX, VY, VW, VH, 20); ctx.clip();
    ctx.fillStyle = C.paper; ctx.fillRect(VX, VY, VW, VH);
    const k = SC / O.dsf;
    ctx.drawImage(im, VX - (R[0] - O.org[0]) * SC, VY - (R[1] - O.org[1]) * SC, im.width * k, im.height * k);
    ctx.restore();
  }
  const pick = (t, list) => { let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k].t) i = k; return i; };
  function stateView(ctx, t, list) {
    const i = pick(t, list);
    const a = i ? clamp((t - list[i].t) / 0.25) : 1;
    if (i && a < 1) view(ctx, IMG[list[i - 1].k]);
    view(ctx, IMG[list[i].k], a);
  }
  function ring(ctx, t, t0, b, { color = C.red, pad = 8, until = 1e9, r = 22 } = {}) {
    const a = UI.fadeIn(t, t0, 0.2) * (1 - UI.fadeIn(t, until, 0.15)); if (a <= 0) return;
    const x = sx(b[0]) - pad, y = sy(b[1]) - pad, w = b[2] * SC + pad * 2, h = b[3] * SC + pad * 2;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 7 + 2.5 * Math.sin((t - t0) * 7);
    ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(r, h / 2 + pad)); ctx.stroke(); ctx.restore();
  }
  const tapAt = (ctx, t, t0, b, color = 'rgba(207,47,86,0.8)') => UI.tap(ctx, sx(b[0] + b[2] / 2), sy(b[1] + b[3] / 2), t, t0, { color, size: 100 });
  const siteCard = (ctx) => card(ctx, VX - 12, VY - 12, VW + 24, VH + 24, { seed: 400, r: 30 });

  // A part of a sheet image (2000×2700 px = 200×270 mm) inside an ink card.
  function sheetPart(ctx, im, cx, cy, w, src, { rot = 0, seed = 40, alpha = 1 } = {}) {
    if (!im || alpha <= 0) return null;
    const [x0, y0, sw, sh] = src, k = w / sw, h = sh * k;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy); ctx.rotate(rot);
    card(ctx, -w / 2 - 14, -h / 2 - 14, w + 28, h + 28, { seed, r: 18 });
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip();
    ctx.drawImage(im, x0, y0, sw, sh, -w / 2, -h / 2, w, h);
    ctx.restore(); ctx.restore();
    return { x: cx - w / 2, y: cy - h / 2, k, x0, y0 };
  }
  const FULL = [0, 0, 2000, 2700];
  const a4 = (ctx, im, cx, cy, h, o = {}) => sheetPart(ctx, im, cx, cy, h * 2000 / 2700, FULL, o);

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const sp = ease.outBack(clamp((t - ev.q1 - 0.15) / 0.55), 1.4);
    if (sp > 0) a4(ctx, IMG.full1, 430, 560 + (1 - sp) * 900 - hop(t, 6), 860, { rot: -0.04, seed: 40 });
    const s2 = ease.outBack(clamp((t - ev.q2) / 0.5), 1.4);
    if (s2 > 0) a4(ctx, IMG.answers, 760, 600 + (1 - s2) * -900, 600, { rot: 0.06, seed: 41 });
    const X = 1420;
    he(ctx, 'רוצים לתרגל את לוח הכפל בכיף?', X, 250, { size: 58, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: 860 });
    popAt(ctx, t, ev.q2, X, 400, (c) => he(c, 'משחק לוח עם תרגילים!', 0, 0, { size: 84, w: 900, color: C.red, maxW: 860 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 570, (c) => pill(c, 0, 0, 'סולמות ונחשים של כפל וחילוק 🐍', { size: 44, w: 900, bg: C.blue, fg: '#fff', padX: 40, seed: 12 }), { rot: -0.02, dur: 0.35 });
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

  // ================= 1. LEVEL =================
  function shotLevel(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    useRegion(REG.panel, SRC.panel, [DX, 110, DW, 460]); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 'cFull' }, { t: ev.tapEasy + 0.12, k: 'cEasy' }, { t: ev.tapHard + 0.12, k: 'cHard' }, { t: ev.tapFull + 0.12, k: 'cFull' }]);
    ring(ctx, t, ev.ringLevels, BOX.levels, { color: C.red, pad: 10, until: ev.tapEasy - 0.1 });
    tapAt(ctx, t, ev.tapEasy, BOX.lEasy); tapAt(ctx, t, ev.tapHard, BOX.lHard); tapAt(ctx, t, ev.tapFull, BOX.lFull);
    // below: what each level drills (LEVELS in snakesLaddersMath.js)
    const LV = [['tapEasy', 'קל', 'כפל עד 5', 'כיתה ג׳', C.yellow], ['tapFull', 'כל לוח הכפל', 'כל המספרים עד 10', 'כיתות ג׳–ד׳', '#e3f6ea'], ['tapHard', 'מאתגר', 'רק 6, 7, 8 ו־9', 'כיתה ד׳', '#ffe3ea']];
    LV.forEach(([e, a, b, g], i) => {
      const x = LC + 390 - i * 390, on = t >= ev[e] && (e !== 'tapFull' || t >= ev.tapFull);
      popAt(ctx, t, ev.ringLevels + 0.2 + i * 0.15, x, 790, (c) => {
        card(c, -175, -150, 350, 300, { fill: LV[i][4], r: 28, seed: 30 + i, shadow: on ? 12 : 7, lw: on ? 5 : 3.5 });
        he(c, a, 0, -62, { size: 50, w: 900, maxW: 310 });
        he(c, b, 0, 10, { size: 36, w: 600, maxW: 310 });
        pill(c, 0, 90, g, { size: 32, w: 800, bg: '#fff', padX: 24, seed: 33 + i, shadow: 4 });
      }, { rot: [-0.02, 0.015, -0.015][i] });
    });
    tip(ctx, t, ev.tipLevel, '🎯 מתאים גם לכיתות אחרות', 'הרמה הקלה — כבר מסוף כיתה ב׳. המאתגרת — לחזרה בכיתות ה׳–ו׳', { seed: 301, color: '#ffe3ea' });
    character(ctx, t, T(4, 1), IMG.girl);
  }
  // ================= 2. MODE =================
  function shotMode(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    useRegion(REG.mode, SRC.panel, [DX + 150, 70, DW - 300, 280]); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 'cFull' }, { t: ev.tapBlank + 0.12, k: 'cBlank' }, { t: ev.tapBW + 0.12, k: 'cBW' }]);
    ring(ctx, t, ev.ringFilled, BOX.mFilled, { color: C.blue, pad: 6, until: ev.tapBlank });
    tapAt(ctx, t, ev.tapBlank, BOX.mBlank, 'rgba(34,107,215,0.8)'); ring(ctx, t, ev.tapBlank + 0.1, BOX.mBlank, { color: C.blue, pad: 6, until: ev.tapBW });
    tapAt(ctx, t, ev.tapBW, BOX.cNo, 'rgba(34,107,215,0.8)'); ring(ctx, t, ev.tapBW + 0.1, BOX.cNo, { color: C.blue, pad: 6 });
    const list = [{ t: 0, k: 'full1' }, { t: ev.tapBlank + 0.12, k: 'blank' }, { t: ev.tapBW + 0.12, k: 'blankbw' }];
    const i = pick(t, list), a = i ? clamp((t - list[i].t) / 0.25) : 1;
    const src = [80, 245, 1840, 1065];
    if (i && a < 1) sheetPart(ctx, IMG[list[i - 1].k], LC, 720, 1060, src, { seed: 50 });
    sheetPart(ctx, IMG[list[i].k], LC, 720, 1060, src, { seed: 50, alpha: i ? a : 1 });
    tip(ctx, t, ev.tipMode, '✏️ כותבים כל תרגיל שרוצים', 'כפל, חילוק, חיבור — ואפילו מילים באנגלית', { seed: 302, color: '#e0f0ff' });
    character(ctx, t, T(7, 1), IMG.boy, { flip: true });
  }
  // ================= 3. FRESH =================
  function shotFresh(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    useRegion(REG.fresh, SRC.panel, [LC - 300, 60, 600, 200]); siteCard(ctx); view(ctx, IMG.cFresh);
    tapAt(ctx, t, ev.tapFresh1, BOX.fresh, 'rgba(224,138,0,0.85)'); tapAt(ctx, t, ev.tapFresh2, BOX.fresh, 'rgba(224,138,0,0.85)');
    ring(ctx, t, ev.tapFresh1 - 0.4, BOX.fresh, { color: C.orange, pad: 6 });
    const list = [{ t: 0, k: 'full1' }, { t: ev.tapFresh1 + 0.12, k: 'full2' }, { t: ev.tapFresh2 + 0.12, k: 'full3' }];
    const i = pick(t, list), cur = list[i];
    const bump = i ? 1 - 0.04 * Math.sin(Math.PI * clamp((t - cur.t) / 0.25)) : 1;
    ctx.save(); ctx.translate(LC, 670); ctx.scale(bump, bump);
    sheetPart(ctx, IMG[cur.k], 0, 0, 1000, [80, 245, 1840, 1330], { seed: 60 + i });
    ctx.restore();
    popAt(ctx, t, i ? cur.t : S.steps[2].t + 0.3, LC + 470, 160, (c) => pill(c, 0, 0, `לוח ${i + 1}`, { size: 44, w: 900, bg: C.yellow, seed: 70 + i, padX: 30 }), { rot: -0.05 });
    tip(ctx, t, ev.tipFresh, '👥 לוח אחר לכל קבוצה בכיתה', 'משחקים בקבוצות של ⁦3–4⁩ ילדים, לוח אחד לכל קבוצה', { seed: 303, color: C.yellow });
    character(ctx, t, T(10, 1), IMG.bday, { flip: true });
  }
  // ================= 4. PRINT =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    useRegion(REG.print, SRC.view); siteCard(ctx); view(ctx, IMG.pr);
    ring(ctx, t, ev.ringPrint, BOX.print, { color: C.green, pad: 8 });
    tapAt(ctx, t, ev.tapPrint, BOX.print, 'rgba(35,135,77,0.8)');
    const p = ease.outBack(clamp((t - ev.cards) / 0.5), 1.3);
    if (p > 0) {
      ctx.save(); ctx.fillStyle = `rgba(255,254,250,${0.75 * clamp((t - ev.cards) / 0.25)})`; ctx.fillRect(DX - 20, DY - 20, DW + 40, DH + 40); ctx.restore();
      a4(ctx, IMG.full1, LC + 300, 560 + (1 - p) * 700, 800, { rot: 0.02, seed: 81 });
      a4(ctx, IMG.answers, LC - 300, 560 + (1 - p) * 800, 800, { rot: -0.025, seed: 82 });
      popAt(ctx, t, ev.cards + 0.3, LC + 300, 1010, (c) => pill(c, 0, 0, 'דף 1: הלוח', { size: 38, w: 900, bg: C.yellow, seed: 83, padX: 28 }));
      popAt(ctx, t, ev.cards + 0.5, LC - 300, 1010, (c) => pill(c, 0, 0, 'דף 2: כרטיס התשובות', { size: 38, w: 900, bg: '#e3f6ea', seed: 84, padX: 28 }));
    }
    tip(ctx, t, ev.tipPrint, '⚖️ כרטיס התשובות — לשופט', 'מקפלים כך שהשחקנים לא רואים, ומגלים את התשובה רק אחרי שענו', { seed: 304, color: '#e3f6ea' });
    character(ctx, t, T(13, 2), IMG.printer);
  }
  // ================= 5. PLAY =================
  // board full1 (seed 1, "כל לוח הכפל"): ladder 4 → 14 is 6 × 7, snake 16 → 6 is 60 ÷ 10 (shots/answers.png)
  const CROP = [440, 1735, 900, 375];
  const at = (g, mmX, mmY) => [g.x + (mmX * 10 - g.x0) * g.k, g.y + (mmY * 10 - g.y0) * g.k];
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const g = sheetPart(ctx, IMG.full1, LC, 330, 1150, CROP, { seed: 90 });
    const rr = (t0, until, mm, color) => {
      const a = UI.fadeIn(t, t0, 0.2) * (1 - UI.fadeIn(t, until, 0.15)); if (a <= 0) return;
      const [x, y] = at(g, mm[0], mm[1]), [x2, y2] = at(g, mm[0] + mm[2], mm[1] + mm[3]);
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 7 + 2.5 * Math.sin((t - t0) * 7);
      ctx.beginPath(); ctx.roundRect(x - 8, y - 8, x2 - x + 16, y2 - y + 16, 18); ctx.stroke(); ctx.restore();
    };
    // badges: square 4 → x 64..82, y 192..210 mm; square 16 → x 82..100, y 174..192 mm (cellXY in the page)
    rr(ev.ladder, ev.snake, [65, 202.8, 16, 6.4], '#b45309');
    rr(ev.snake, 1e9, [83, 184.8, 16, 6.4], C.green);
    // a red token: on 4, climbs the ladder to 14 when the answer is right
    const p = ease.inOutCubic(clamp((t - ev.ladderOk - 0.2) / 0.9));
    if (t >= ev.ladder - 0.2 && t < ev.snake) {
      const [ax, ay] = at(g, 73, 198.5), [bx, by] = at(g, 127, 180.5);
      const x = lerp(ax, bx, p), y = lerp(ay, by, p) - Math.sin(Math.PI * p) * 20;
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x + 4, y + 5, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
    }
    if (t >= ev.snake) {
      const [x, y] = at(g, 97.5, 177.5);
      const s = UI.pop(t, ev.snake, 0.3, 2);
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(4, 5, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
      ctx.restore();
    }
    // the two cases, word for word from the rules box
    const row = (t0, tOk, y, eq, label, ok, bgc, seed) => {
      popAt(ctx, t, t0, LC + 380, y, (c) => pill(c, 0, 0, label, { size: 42, w: 900, bg: bgc, seed, padX: 30 }), { rot: -0.02 });
      popAt(ctx, t, t0 + 0.2, LC + 20, y, (c) => pill(c, 0, 0, eq, { size: 50, w: 800, bg: '#fff', seed: seed + 1, padX: 30, dir: 'ltr' }));
      he(ctx, ok, LC - 210, y + 15, { size: 40, w: 800, color: C.green, align: 'right', alpha: UI.fadeIn(t, tOk, 0.2), maxW: 360 });
    };
    row(ev.ladder, ev.ladderOk, 720, '6 × 7 = 42', '🪜 סולם: כפל', '✅ נכון — מטפסים!', '#ffedd5', 91);
    row(ev.snake, ev.snakeOk, 880, '60 ÷ 10 = 6', '🐍 נחש: חילוק', '✅ נכון — הנחש מפספס', '#dcfce7', 93);
    tip(ctx, t, ev.tipPlay, '😬 טעיתם?', 'בסולם נשארים במקום, ובנחש מחליקים עד הזנב', { seed: 305, color: C.lilac, y: 590 });
    character(ctx, t, T(15, 2), IMG.boy, { h: 210 });
    popAt(ctx, t, ev.win, LC, 1000, (c) => pill(c, 0, 0, '🏁 מנצח מי שמגיע ראשון בדיוק ל־100', { size: 42, w: 900, bg: C.yellow, seed: 95, padX: 36 }), { rot: -0.015 });
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
    he(ctx, 'סולמות ונחשים של כפל וחילוק', X, 230, { size: 80, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: 1140 });
    popAt(ctx, t, L[1].t, X, 360, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 500, (c) => pill(c, 0, 0, 'ugabuga.co.il/board-games/snakes-and-ladders/multiplication', { size: 30, w: 600, bg: C.blue, fg: '#fff', padX: 34, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 650, (c) => pill(c, 0, 0, 'נסו עכשיו 🎲', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '💬 באיזה תרגיל כפל הילדים שלכם נתקעים? כתבו בתגובות', X, 800, { size: 38, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1160 });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotLevel }, { t0: T(5), fn: shotMode }, { t0: T(8), fn: shotFresh },
    { t0: T(11), fn: shotPrint }, { t0: T(14), fn: shotPlay }, { t0: T(17), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png'); IMG.boy = await L('img/home-detective-boy.png'); IMG.bday = await L('img/birthday-girl.png');
      IMG.printer = await L('img/home-printer.png');
      IMG.mascot = await L('img/mascot.png'); IMG.logo = await L('img/logo.svg');
      for (const k of ['cFull', 'cEasy', 'cHard', 'cFresh', 'cBlank', 'cBW', 'full1', 'full2', 'full3', 'blank', 'blankbw', 'answers', 'pr']) IMG[k] = await L(`img/${k}.png`);
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
