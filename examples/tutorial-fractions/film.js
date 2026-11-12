// THE FILM (16:9 tutorial) — "שברים לכיתות ד׳–ה׳": real captures of the live page on the left,
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

  // ---------- real captures (DSF 2: 2 image px per CSS px) ----------
  // place an element capture: centre x, top y, width → mapping from page CSS coords to the screen
  function shotAt(ctx, im, cx, top, w, org, { alpha = 1, seed = 400, frame = true, rot = 0 } = {}) {
    if (!im) return null;
    const h = w * im.height / im.width, x = cx - w / 2, k = w / (im.width / 2);
    const g = { x, y: top, w, h, k, org, map: (b) => [x + (b[0] - org[0]) * k, top + (b[1] - org[1]) * k, b[2] * k, b[3] * k] };
    if (alpha <= 0) return g;
    ctx.save(); ctx.globalAlpha *= alpha;
    if (rot) { ctx.translate(cx, top + h / 2); ctx.rotate(rot); ctx.translate(-cx, -top - h / 2); }
    if (frame) card(ctx, x - 12, top - 12, w + 24, h + 24, { seed, r: 26 });
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, top, w, h, 16); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(x, top, w, h); ctx.drawImage(im, x, top, w, h); ctx.restore();
    ctx.restore();
    return g;
  }
  // cross-fade between capture states (same size)
  const pick = (t, list) => { let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k].t) i = k; return i; };
  function states(ctx, t, list, cx, top, w, org, o = {}) {
    const i = pick(t, list), a = i ? clamp((t - list[i].t) / 0.25) : 1;
    const base = i && a < 1 ? i - 1 : i;
    let g = shotAt(ctx, IMG[list[base].k], cx, top, w, org, o);
    if (i && a < 1) g = shotAt(ctx, IMG[list[i].k], cx, top, w, org, { ...o, alpha: a, frame: false });
    return g;
  }
  function ring(ctx, t, t0, r, { color = C.red, pad = 8, until = 1e9, rad = 18 } = {}) {
    const a = UI.fadeIn(t, t0, 0.2) * (1 - UI.fadeIn(t, until, 0.15)); if (a <= 0 || !r) return;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 7 + 2.5 * Math.sin((t - t0) * 7);
    ctx.beginPath(); ctx.roundRect(r[0] - pad, r[1] - pad, r[2] + pad * 2, r[3] + pad * 2, Math.min(rad, r[3] / 2 + pad)); ctx.stroke(); ctx.restore();
  }
  const tapR = (ctx, t, t0, r, color = 'rgba(207,47,86,0.8)') => r && UI.tap(ctx, r[0] + r[2] / 2, r[1] + r[3] / 2, t, t0, { color, size: 100 });
  // page CSS boxes (shoot.js → shots/boxes.json)
  const B = {
    toc: [118, 543], tocCompare: [420, 627, 132, 29],
    card: [118, 2015], cEx: [136, 2129, 828, 45], cTip: [136, 2182, 828, 55], cMistake: [136, 2245, 828, 55], cLink: [664, 2301, 301, 51],
    cmp: [118, 3361], selA: [670, 3451, 60, 39], selAn: [778, 3451, 50, 39], selB: [365, 3451, 60, 39], selBn: [473, 3451, 50, 39], verdict: [128, 3820, 840, 40],
    wall: [128, 2883],
    tpr: [118, 2105], tLevels: [225, 2130, 649, 49], tModes: [300, 2191, 500, 49],
  };

  // a bar of d equal parts with n coloured, drawn right to left (like the page)
  function bar(ctx, x, y, w, h, n, d, color) {
    for (let i = 0; i < d; i++) {
      const pw = w / d, px = x + w - (i + 1) * pw;
      ctx.fillStyle = i < n ? color : '#fff'; ctx.fillRect(px, y, pw, h);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(px, y, pw, h);
    }
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const sp = ease.outBack(clamp((t - ev.q1 - 0.15) / 0.55), 1.4);
    if (sp > 0) shotAt(ctx, IMG.wall0, 520, 120 + (1 - sp) * 900 - hop(t, 6), 860, B.wall, { rot: -0.04, seed: 40 });
    const s2 = ease.outBack(clamp((t - ev.q2) / 0.5), 1.4);
    if (s2 > 0) shotAt(ctx, IMG.card, 560, 610 + (1 - s2) * -900, 820, B.card, { rot: 0.035, seed: 41 });
    const X = 1420;
    he(ctx, 'הילדים מתבלבלים בשברים?', X, 250, { size: 58, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: 860 });
    popAt(ctx, t, ev.q2, X, 400, (c) => he(c, 'מדריך שלב אחר שלב!', 0, 0, { size: 84, w: 900, color: C.red, maxW: 860 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 570, (c) => pill(c, 0, 0, 'שברים לכיתות ד׳–ה׳ 🍕', { size: 48, w: 900, bg: C.blue, fg: '#fff', padX: 44, seed: 12 }), { rot: -0.02, dur: 0.35 });
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
      pill(ctx, 0, 0, 'למורים ולהורים · חינם', { size: 52, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
  }

  // ================= 1. THE STEPS LIST =================
  function shotToc(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const g = shotAt(ctx, IMG.toc, LC, 110, 1150, B.toc);
    ring(ctx, t, ev.tapStep - 0.3, g.map(B.tocCompare), { color: C.red, pad: 8 });
    tapR(ctx, t, ev.tapStep, g.map(B.tocCompare));
    popAt(ctx, t, ev.g4, LC + 290, 680, (c) => {
      card(c, -260, -110, 520, 220, { fill: C.yellow, r: 30, seed: 31, shadow: 10, lw: 4.5 });
      he(c, 'כיתה ד׳', 0, -18, { size: 64, w: 900 });
      he(c, 'שלבים ⁦1–5⁩: השבר הפשוט', 0, 58, { size: 36, w: 600, maxW: 470 });
    }, { rot: -0.02 });
    popAt(ctx, t, ev.g5, LC - 290, 680, (c) => {
      card(c, -260, -110, 520, 220, { fill: '#e3f6ea', r: 30, seed: 32, shadow: 10, lw: 4.5 });
      he(c, 'כיתה ה׳', 0, -18, { size: 64, w: 900 });
      he(c, 'שלבים ⁦6–11⁩: מכנים שונים ועשרוניים', 0, 58, { size: 36, w: 600, maxW: 470 });
    }, { rot: 0.02 });
    popAt(ctx, t, ev.tapStep + 0.2, LC, 930, (c) => pill(c, 0, 0, 'לחיצה על שלב קופצת אליו בדף', { size: 40, w: 800, bg: '#fff', seed: 33, padX: 34 }), { rot: -0.01 });
    tip(ctx, t, ev.tipToc, '📌 עוברים לפי הסדר', 'כל שלב נשען על הקודם: קודם מבינים, ורק אחר כך מחשבים', { seed: 301, color: '#ffe3ea' });
    character(ctx, t, T(4, 1), IMG.girl);
  }
  // ================= 2. THE STEP CARD =================
  function shotCard(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const g = shotAt(ctx, IMG.card, LC, 100, 1150, B.card);
    ring(ctx, t, ev.ringEx, g.map(B.cEx), { color: C.blue, pad: 6, until: ev.ringTip });
    ring(ctx, t, ev.ringTip, g.map(B.cTip), { color: C.green, pad: 6, until: ev.ringMistake });
    ring(ctx, t, ev.ringMistake, g.map(B.cMistake), { color: C.red, pad: 6 });
    // below: the common mistake, drawn — 1/4 vs 1/8 of the same whole
    const p = UI.fadeIn(t, ev.ringMistake + 0.15, 0.3);
    if (p > 0) {
      ctx.save(); ctx.globalAlpha = p;
      const y0 = 640, bw = 820, bx = LC - bw / 2 - 90;
      card(ctx, bx - 40, y0 - 40, bw + 290, 370, { fill: '#fff', r: 28, seed: 35, shadow: 10 });
      bar(ctx, bx, y0, bw, 100, 1, 4, '#60a5fa'); bar(ctx, bx, y0 + 150, bw, 100, 1, 8, '#f472b6');
      he(ctx, '1/4', bx + bw + 120, y0 + 68, { size: 60, w: 900, dir: 'ltr' });
      he(ctx, '1/8', bx + bw + 120, y0 + 218, { size: 60, w: 900, dir: 'ltr' });
      ctx.restore();
      popAt(ctx, t, ev.tipCard + 0.4, LC, y0 + 330, (c) => pill(c, 0, 0, '⁦1/8⁩ קטן מ־⁦1/4⁩ — החלקים קטנים יותר', { size: 40, w: 900, bg: C.yellow, seed: 36, padX: 34 }), { rot: -0.015 });
    }
    tip(ctx, t, ev.tipCard, '⚠️ הטעות הנפוצה ביותר', '"⁦1/8⁩ גדול מ־⁦1/4⁩, כי 8 גדול מ־4"', { seed: 302, color: '#ffe3ea' });
    character(ctx, t, T(7, 1), IMG.boy, { flip: true });
  }
  // ================= 3. PRACTICE + PRINT =================
  function shotPractice(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const sw = clamp((t - ev.topic) / 0.3);
    if (sw < 1) {
      ctx.save(); ctx.globalAlpha = 1 - sw;
      const g = shotAt(ctx, IMG.card, LC, 280, 1150, B.card);
      ring(ctx, t, ev.ringLink, g.map(B.cLink), { color: C.green, pad: 8 });
      tapR(ctx, t, ev.tapLink, g.map(B.cLink), 'rgba(35,135,77,0.8)');
      ctx.restore();
    }
    if (sw > 0) {
      ctx.save(); ctx.globalAlpha = sw;
      shotAt(ctx, IMG.th1, LC, 90 + (1 - sw) * 40, 1000, [0, 0], { seed: 44 });
      const g = shotAt(ctx, IMG.tpr, LC, 330 + (1 - sw) * 40, 1100, B.tpr, { seed: 45 });
      ctx.restore();
      ring(ctx, t, ev.ringLevels, g.map(B.tLevels), { color: C.orange, pad: 8, until: ev.ringModes });
      ring(ctx, t, ev.ringModes, g.map(B.tModes), { color: C.green, pad: 8 });
    }
    tip(ctx, t, ev.tipPractice, '🖨️ דף עבודה עם דף תשובות', '20 תרגילים, ודף חדש בכל לחיצה', { seed: 303, color: '#e3f6ea' });
    character(ctx, t, T(10, 1), IMG.printer);
  }
  // ================= 4. COMPARE + WALL =================
  function shotCompare(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const st = [{ t: 0, k: 'cmp0' }, { t: ev.tapA + 0.47, k: 'cmp1' }, { t: ev.tapB + 0.47, k: 'cmp2' }];
    const g = states(ctx, t, st, LC, 70, 790, B.cmp, { seed: 50 });
    tapR(ctx, t, ev.tapA, g.map(B.selA), 'rgba(224,138,0,0.85)'); tapR(ctx, t, ev.tapA + 0.35, g.map(B.selAn), 'rgba(224,138,0,0.85)');
    tapR(ctx, t, ev.tapB, g.map(B.selB), 'rgba(224,138,0,0.85)'); tapR(ctx, t, ev.tapB + 0.35, g.map(B.selBn), 'rgba(224,138,0,0.85)');
    ring(ctx, t, ev.result, g.map(B.verdict), { color: C.orange, pad: 4 });
    const wst = [{ t: 0, k: 'wall0' }, { t: ev.tapA + 0.47, k: 'wall1' }, { t: ev.tapB + 0.47, k: 'wall2' }];
    states(ctx, t, wst, LC, 600, 790, B.wall, { seed: 51 });
    popAt(ctx, t, S.steps[3].t + 0.4, LC - 470, 640, (c) => pill(c, 0, 0, '🧱 קיר השברים', { size: 34, w: 900, bg: C.yellow, seed: 52, padX: 22 }), { rot: 0.05 });
    tip(ctx, t, ev.tipCmp, '⚖️ ⁦3/4⁩ קטן מ־⁦5/6⁩', 'במכנה 12: ⁦9/12⁩ מול ⁦10/12⁩', { seed: 304, color: C.yellow, y: 470 });
    tip(ctx, t, ev.tipCmp + 0.6, '🟦 הקיר נצבע בכחול', 'לפי המונה שבוחרים', { seed: 306, color: '#e3efff', y: 680 });
    character(ctx, t, T(13, 2), IMG.bday, { flip: true });
  }
  // ================= 5. HOME =================
  function shotHome(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    S.HOME.forEach(([e, lbl], i) => {
      const col = i % 3, row = Math.floor(i / 3), x = LC + 380 - col * 380, y = 300 + row * 400;
      const t0 = ev.home0 + i * S.BEAT * 0.6, on = i === 0 && t >= ev.tipHome;
      popAt(ctx, t, t0, x, y, (c) => {
        card(c, -170, -165, 340, 330, { fill: ['#fff4bb', '#e3efff', '#e3f6ea', '#ffe3ea', C.lilac, '#ffedd5'][i], r: 30, seed: 60 + i, shadow: on ? 14 : 8, lw: on ? 6 : 4 });
        he(c, e, 0, 10, { size: 120, w: 800 });
        he(c, lbl, 0, 115, { size: 40, w: 900, maxW: 300 });
      }, { rot: [-0.03, 0.02, -0.015, 0.025, -0.02, 0.03][i] });
    });
    tip(ctx, t, ev.tipHome, '🍫 חפיסה של 12 קוביות', 'חצי, שליש, רבע ושישית — כולם מספר שלם של קוביות. שואלים: "כמה קוביות הן שני שלישים?"', { seed: 305, color: C.lilac });
    character(ctx, t, T(15, 2), IMG.girl, { h: 210 });
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
    he(ctx, 'שברים לכיתות ד׳–ה׳', X, 230, { size: 92, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: 1140 });
    popAt(ctx, t, L[1].t, X, 370, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 510, (c) => pill(c, 0, 0, 'ugabuga.co.il/math/fractions', { size: 46, w: 600, bg: C.blue, fg: '#fff', padX: 40, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 660, (c) => pill(c, 0, 0, 'נסו עכשיו 🍕', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '💬 איזה נושא בשברים הכי קשה לילדים שלכם?', X, 810, { size: 48, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1100 });
    he(ctx, 'כתבו בתגובות', X, 880, { size: 44, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[4].t + 0.1, 0.25) });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotToc }, { t0: T(5), fn: shotCard }, { t0: T(8), fn: shotPractice },
    { t0: T(11), fn: shotCompare }, { t0: T(14), fn: shotHome }, { t0: T(17), fn: shotEnd },
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
      for (const k of ['toc', 'card', 'cmp0', 'cmp1', 'cmp2', 'wall0', 'wall1', 'wall2', 'tpr', 'th1']) IMG[k] = await L(`img/${k}.png`);
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
