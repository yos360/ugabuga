// THE FILM (16:9 tutorial) — RSVP / אישורי הגעה (/rsvp): real captures of the live page on the left (Supabase mocked),
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
  const BX = {
    themes: [613, 86, 556, 151], title: [613, 325, 556, 86], date: [613, 426, 556, 86], place: [613, 528, 556, 86],
    pvTitle: [110, 160, 438, 80], pvWhen: [110, 264, 438, 72],
    invitees: [613, 161, 556, 318], count: [1096, 486, 76, 28], pin: [613, 600, 556, 119], create: [613, 771, 556, 52],
    card: [465, 305, 714, 478], actions: [465, 840, 714, 49], wa: [101, 345, 298, 52], link: [101, 466, 298, 36], invite: [101, 514, 298, 49],
    chipYoav: [847, 795, 60, 40], chips: [373, 795, 534, 88], yesA: [734, 899, 173, 72],
    yes: [734, 228, 173, 72], kids: [373, 316, 534, 60], allergies: [373, 452, 534, 86], pickup: [373, 546, 534, 86], send: [373, 750, 534, 52],
    statPeople: [1067, 41, 112, 104], statKids: [946, 41, 112, 104], statAdults: [825, 41, 112, 104], statMissing: [465, 41, 112, 104], allergy: [465, 179, 714, 145],
    missing: [101, 69, 298, 29], remindBtn: [101, 110, 298, 49],
  };
  const RF = [592, 20, 598, 700], RPV = [90, 20, 478, 544], RN = [592, 150, 598, 690];
  const RC = [455, 295, 734, 605], RS = [70, 274, 360, 377];
  const RG = [342, 505, 596, 555], RGF = [342, 110, 596, 710];
  const RST = [434, 10, 776, 330], RRM = [80, 20, 340, 146];

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const sp = ease.outBack(clamp((t - ev.q1 - 0.15) / 0.55), 1.4);
    if (sp > 0) cropAt(ctx, IMG.guest, O, [352, 20, 576, 478], 480, 150 + (1 - sp) * 900 - hop(t, 6), 1.5, { rot: -0.035, seed: 40 });
    const X = 1400;
    he(ctx, 'מי מגיע ליום ההולדת?', X, 250, { size: 56, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: 860 });
    popAt(ctx, t, ev.q2, X, 400, (c) => he(c, 'אישורי הגעה', 0, 0, { size: 116, w: 900, color: C.red, maxW: 880 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 570, (c) => pill(c, 0, 0, 'קישור אחד בוואטסאפ, וכולם עונים בלחיצה', { size: 32, w: 900, bg: C.blue, fg: '#fff', padX: 40, seed: 12 }), { rot: -0.02, dur: 0.35 });
    S.CHIPS.forEach(([e, lbl], i) => {
      const t0 = T(1, 1 + i * 0.35), x = X + 270 - i * 270;
      popAt(ctx, t, t0, x, 770, (c) => {
        card(c, -122, -72, 244, 144, { fill: ['#e3f6ea', C.yellow, '#eef0f5'][i], r: 26, seed: 20 + i, shadow: 8, lw: 4 });
        he(c, e, 0, -6, { size: 56, w: 800, dir: 'ltr' });
        he(c, lbl, 0, 50, { size: 34, w: 900, maxW: 220 });
      }, { rot: [-0.04, 0.03, -0.02][i] });
    });
    const fp = clamp((t - ev.free) / 0.18);
    if (fp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(fp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(X, 950); ctx.rotate(-0.03); ctx.scale(sc, sc); ctx.globalAlpha = clamp(fp * 2);
      pill(ctx, 0, 0, 'חינם, בלי הרשמה', { size: 52, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
  }
  // ================= 1. DETAILS =================
  function shotPick(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const p = clamp((t - ev.tipSix) / 0.25);
    const g = states(ctx, t, [{ t: 0, k: 'blank' }, { t: ev.ringSix + 0.7, k: 'filled' }], O, RF, LC, 50, 1.42, { seed: 50, fade: 0.25, alpha: 1 - p });
    const gp = cropAt(ctx, IMG.filled, O, RPV, LC, 70, 1.75, { seed: 51, alpha: p, rot: -0.01 });
    if (p < 1) {
      ring(ctx, t, ev.ringChips, g.map(BX.themes), { color: C.red, pad: 6, until: ev.ringSix + 0.7 });
      ring(ctx, t, ev.ringSix + 0.8, g.map([613, 325, 556, 391]), { color: C.red, pad: 6 });
    }
    ring(ctx, t, ev.tipSix + 0.35, gp.map(BX.pvTitle), { color: C.red, pad: 6, until: ev.tipTen });
    ring(ctx, t, ev.tipTen, gp.map(BX.pvWhen), { color: C.red, pad: 6 });
    tip(ctx, t, ev.ringChips + 0.3, '🎨 ארבעה עיצובים להזמנה', 'למסיבת ילדים או לכל אירוע', { seed: 301, color: '#ffe3ea', y: 480 });
    tip(ctx, t, ev.tipSix, '👀 ההזמנה מתעדכנת תוך כדי', 'כך האורחים יראו אותה', { seed: 302, color: '#e3efff', y: 760 });
  }
  // ================= 2. INVITEES + PIN =================
  function shotAnswer(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const g = cropAt(ctx, IMG.filled2, O, RN, LC, 62, 1.38, { seed: 60 });
    ring(ctx, t, ev.ringGrid, g.map(BX.invitees), { color: C.blue, pad: 6, until: ev.type1 });
    ring(ctx, t, ev.type1, g.map(BX.count), { color: C.blue, pad: 6, until: ev.type2 });
    ring(ctx, t, ev.type2, g.map(BX.pin), { color: C.blue, pad: 6, until: ev.tipPhone });
    ring(ctx, t, ev.tipPhone, g.map(BX.create), { color: C.green, pad: 6 });
    tapR(ctx, t, ev.tipPhone + 0.9, g.map(BX.create), 'rgba(35,135,77,0.8)');
    tip(ctx, t, ev.tipMix, '📋 שם בכל שורה', 'כדי לראות מי עוד לא ענה', { seed: 303, color: C.yellow, y: 480 });
    tip(ctx, t, ev.type2 + 0.2, '🔑 קוד מארגן של 4 ספרות', 'כדי לראות את התשובות|מכל טלפון', { seed: 304, color: '#ffedd5', y: 760 });
  }
  // ================= 3. SEND =================
  function shotCheck(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const p = clamp((t - ev.swap) / 0.25);
    const g = cropAt(ctx, IMG.host0, O, RC, LC, 110, 1.3, { seed: 70, alpha: 1 - p });
    const gs = cropAt(ctx, IMG.host0, O, RS, LC, 70, 2.45, { seed: 71, alpha: p });
    if (p < 1) ring(ctx, t, ev.ringCheck, g.map(BX.card), { color: C.green, pad: 6 });
    ring(ctx, t, ev.swap + 0.2, gs.map(BX.wa), { color: C.green, pad: 6, until: ev.ringScore });
    if (t > ev.swap && t < ev.ringScore + 0.3) tapR(ctx, t, ev.ringRed, gs.map(BX.wa), 'rgba(35,135,77,0.8)');
    ring(ctx, t, ev.ringScore, gs.map(BX.link), { color: C.green, pad: 6, until: ev.tipNote });
    ring(ctx, t, ev.tipNote, gs.map(BX.invite), { color: C.red, pad: 6 });
    tip(ctx, t, ev.ringCheck + 0.4, '✓ ההזמנה מוכנה', 'עם כפתורי ניווט|והוספה ליומן', { seed: 305, color: '#e3f6ea', y: 480 });
    tip(ctx, t, ev.tipNote, '💌 רוצים הזמנה מעוצבת?', 'יש כפתור להזמנה עם הקישור', { seed: 306, color: C.yellow, y: 770 });
  }
  // ================= 4. GUEST =================
  function shotFresh(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const p = clamp((t - ev.swapFresh) / 0.25);
    const g = cropAt(ctx, IMG.guest, O, RG, LC, 90, 1.6, { seed: 80, alpha: 1 - p });
    const gf = cropAt(ctx, IMG.guestFilled, O, RGF, LC, 60, 1.35, { seed: 81, alpha: p });
    if (p < 1) {
      ring(ctx, t, ev.ringFresh, g.map(BX.chips), { color: C.orange, pad: 6, until: ev.tapFresh });
      tapR(ctx, t, ev.tapFresh, g.map(BX.chipYoav), 'rgba(224,138,0,0.85)');
      ring(ctx, t, ev.tapFresh + 0.4, g.map(BX.yesA), { color: C.orange, pad: 6 });
    }
    ring(ctx, t, ev.swapFresh + 0.3, gf.map(BX.kids), { color: C.orange, pad: 6, until: ev.tipTeach });
    ring(ctx, t, ev.tipTeach, gf.map([373, 452, 534, 180]), { color: C.orange, pad: 6, until: ev.tipTeach + 1.6 });
    ring(ctx, t, ev.tipTeach + 1.6, gf.map(BX.send), { color: C.green, pad: 6 });
    tip(ctx, t, ev.tipFresh - 0.9, '👆 בוחרים שם מהרשימה', 'בלי הרשמה ובלי אפליקציה', { seed: 307, color: '#ffedd5', y: 480 });
    tip(ctx, t, ev.tipTeach, '⚠️ גם אלרגיות', 'ומי אוסף את הילד בסוף', { seed: 308, color: C.lilac, y: 770 });
  }
  // ================= 5. SUMMARY + REMINDER =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const g = cropAt(ctx, IMG.host1, O, RST, LC, 90, 1.3, { seed: 88 });
    const p = 1;
    const gr = cropAt(ctx, IMG.host2, O, RRM, LC, 640, 1.7, { seed: 90, alpha: p });
    ring(ctx, t, ev.ringPrint, g.map(BX.statPeople), { color: C.purple, pad: 5, until: ev.tapPrint });
    ring(ctx, t, ev.tapPrint, g.map([825, 41, 233, 104]), { color: C.purple, pad: 5, until: ev.tapPrint + 0.9 });
    ring(ctx, t, ev.tapPrint + 0.9, g.map([475, 189, 694, 125]), { color: C.red, pad: 0, until: ev.tipPages });
    ring(ctx, t, ev.tipPages, g.map(BX.statMissing), { color: C.red, pad: 5, until: ev.ringPdf });
    ring(ctx, t, ev.ringPdf, gr.map(BX.remindBtn), { color: C.purple, pad: 6 });
    tip(ctx, t, ev.tipPages, '⏰ מי עוד לא ענה?', 'תזכורת מוכנה לוואטסאפ|עם השמות', { seed: 309, color: C.yellow, y: 480 });
    tip(ctx, t, ev.tipAns, '🖨️ הדפסה ואקסל', 'ותזכורת ביומן|ליום ההולדת הבא', { seed: 310, color: '#e3f6ea', y: 770 });
    character(ctx, t, T(16, 1), IMG.girl, { h: 140 });
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
    he(ctx, 'אישורי הגעה', X, 230, { size: 110, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: 1140 });
    popAt(ctx, t, L[1].t, X, 370, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 510, (c) => pill(c, 0, 0, 'ugabuga.co.il/rsvp', { size: 46, w: 600, bg: C.blue, fg: '#fff', padX: 40, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 660, (c) => pill(c, 0, 0, 'נסו עכשיו 🎈', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '💬 לאיזה אירוע הייתם שולחים?', X, 810, { size: 54, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1100 });
    he(ctx, 'יום הולדת, מסיבת כיתה או ערב משפחתי? כתבו בתגובות', X, 885, { size: 44, maxW: 1100, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[4].t + 0.1, 0.25) });
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
      IMG.girl = await L('img/birthday-girl.png');
      IMG.mascot = await L('img/mascot.png'); IMG.logo = await L('img/logo.svg');
      for (const k of ['blank', 'filled', 'filled2', 'host0', 'host1', 'host2', 'guest', 'guestFilled', 'guestDone']) IMG[k] = await L(`img/${k}.png`);
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
