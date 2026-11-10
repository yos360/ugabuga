// THE FILM (16:9 tutorial) — "שעון מסך מלא": real captures of /tools/flip-clock on the left,
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

  // ---------- real captures (viewport shots 1750×1250), boxes measured in the DOM (shots/boxes.json) ----------
  const BOX = {
    stage: [335, 187, 1080, 425], full: [1085, 637, 174, 65], sound: [918, 642, 158, 56], sec: [774, 642, 134, 56], date: [628, 642, 136, 56],
    h12: [491, 642, 127, 56], h12b: [483, 642, 127, 56], o1sec: [766, 642, 134, 56], o1h12: [483, 642, 127, 56], o2date: [620, 642, 136, 56], o3date: [620, 535, 136, 56], themes: [335, 717, 1080, 56], dateLine: [680, 474, 390, 73],
    night: [786, 717, 162, 56], retro: [613, 717, 163, 56], pink: [497, 717, 106, 56], white: [958, 717, 100, 56],
    secs: [1075, 252, 280, 190], bar: [725, 1175, 300, 55], digits: [95, 385, 1560, 308], dateFull: [558, 746, 634, 118],
  };
  const REG = { ctl: [300, 15, 1150, 790], full: [0, 0, 1750, 1250] };
  let R = REG.ctl, SC = 1, VX = 0, VY = 0, VW = 0, VH = 0;
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
  function stateView(ctx, t, list) {
    const i = pick(t, list);
    const a = i ? clamp((t - list[i].t) / 0.25) : 1;
    if (i && a < 1) view(ctx, IMG[list[i - 1].k]);
    view(ctx, IMG[list[i].k], a);
  }
  // a flip second: [falling, rising, settled] frames, no crossfade (the page itself animates the cards)
  function flipView(ctx, t, list) {
    const e = list[pick(t, list)], dt = t - e.t;
    const k = e.k.length === 1 ? e.k[0] : dt < 0.12 ? e.k[0] : dt < 0.28 ? e.k[1] : e.k[2];
    view(ctx, IMG[k]);
  }
  function ring(ctx, t, t0, b, { color = C.red, pad = 8, until = 1e9, r = 22 } = {}) {
    const a = UI.fadeIn(t, t0, 0.2) * (1 - UI.fadeIn(t, until, 0.15)); if (a <= 0) return;
    const x = sx(b[0]) - pad, y = sy(b[1]) - pad, w = b[2] * SC + pad * 2, h = b[3] * SC + pad * 2;
    ctx.save(); ctx.beginPath(); ctx.roundRect(VX, VY, VW, VH, 20); ctx.clip(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 7 + 2.5 * Math.sin((t - t0) * 7);
    ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(r, h / 2 + pad)); ctx.stroke(); ctx.restore();
  }
  const tapAt = (ctx, t, t0, b, color = 'rgba(207,47,86,0.8)') => UI.tap(ctx, sx(b[0] + b[2] / 2), sy(b[1] + b[3] / 2), t, t0, { color, size: 100 });
  const siteCard = (ctx) => card(ctx, VX - 12, VY - 12, VW + 24, VH + 24, { seed: 400, r: 30 });
  function cropCard(ctx, im, src, cx, cy, h, { rot = 0, seed = 40 } = {}) {
    if (!im) return;
    const w = src[2] * h / src[3];
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    card(ctx, -w / 2 - 16, -h / 2 - 16, w + 32, h + 32, { seed, r: 24 });
    ctx.save(); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 12); ctx.clip();
    ctx.drawImage(im, src[0], src[1], src[2], src[3], -w / 2, -h / 2, w, h); ctx.restore();
    ctx.restore();
  }
  // "קליק" sound waves next to a box
  function waves(ctx, t, t0, b, color) {
    const a = UI.fadeIn(t, t0, 0.2); if (a <= 0) return;
    const x = sx(b[0] + b[2]) + 4, y = sy(b[1] + b[3] / 2);
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const ph = ((t - t0) * 1.6 + i / 3) % 1;
      ctx.globalAlpha = a * (1 - ph); ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(x, y, 20 + ph * 50, -Math.PI * 0.28, Math.PI * 0.28); ctx.stroke();
    }
    ctx.restore();
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    const sp = ease.outBack(clamp((t - ev.q1 - 0.15) / 0.55), 1.4);
    if (sp > 0) {
      const k = t < T(1, 0.5) ? 'f1' : t < T(1, 2.5) ? 'f2' : 'f3';
      cropCard(ctx, IMG[k], [60, 300, 1630, 620], 520, 640 + (1 - sp) * 700 - hop(t, 6), 360, { rot: -0.035, seed: 40 });
      const s2 = ease.outBack(clamp((t - ev.q2) / 0.5), 1.4);
      if (s2 > 0) cropCard(ctx, IMG.t2, [335, 187, 1080, 425], 400, 240 + (1 - s2) * -500, 210, { rot: 0.05, seed: 41 });
    }
    const X = 1400;
    he(ctx, 'רוצים שעון גדול שרואים מכל החדר?', X, 250, { size: 60, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: 860 });
    popAt(ctx, t, ev.q2, X, 400, (c) => he(c, 'ספרות מתהפכות על כל המסך!', 0, 0, { size: 82, w: 900, color: C.red, maxW: 840 }), { rot: -0.02 });
    popAt(ctx, t, ev.title, X, 570, (c) => pill(c, 0, 0, 'שעון מסך מלא 🕰️', { size: 62, w: 900, bg: C.blue, fg: '#fff', padX: 52, seed: 12 }), { rot: -0.02, dur: 0.35 });
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
      pill(ctx, 0, 0, 'בחינם, בלי התקנה', { size: 52, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
  }

  // ================= 1. FULL SCREEN =================
  function shotFull(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const sw = ev.tapFull + 0.2;
    if (t < sw) {
      useRegion(REG.ctl); siteCard(ctx); view(ctx, IMG.a0);
      ring(ctx, t, ev.ringFull, BOX.full, { color: C.red, pad: 6 });
      tapAt(ctx, t, ev.tapFull, BOX.full);
    } else {
      const z = ease.outCubic(clamp((t - sw) / 0.35));
      useRegion(REG.full);
      ctx.save(); const cx = DX + DW / 2, cy = DY + DH / 2, s = lerp(0.8, 1, z); ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
      siteCard(ctx);
      flipView(ctx, t, [{ t: 0, k: ['f0'] }, { t: S.ticks[0], k: ['f1a', 'f1b', 'f1'] }, { t: S.ticks[1], k: ['f2a', 'f2b', 'f2'] }, { t: S.ticks[2], k: ['f3a', 'f3b', 'f3'] }]);
      ring(ctx, t, ev.tapFull + 0.9, BOX.digits, { color: C.red, pad: 10, until: ev.tipFull });
      ctx.restore();
    }
    tip(ctx, t, ev.tipFull, '⏱️ ספרה מתהפכת בכל שנייה', 'שעה, דקות ושניות — ומתחת התאריך הלועזי והעברי', { seed: 301, color: '#ffe3ea' });
    character(ctx, t, T(4, 1), IMG.girl, { h: 250 });
  }
  // ================= 2. SOUND =================
  function shotSound(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    useRegion(REG.ctl); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 'a0' }, { t: ev.tapSound + 0.12, k: 's1' }]);
    ring(ctx, t, ev.ringSound, BOX.sound, { color: C.blue, pad: 6 });
    tapAt(ctx, t, ev.tapSound, BOX.sound, 'rgba(34,107,215,0.8)');
    waves(ctx, t, ev.tapSound + 0.2, BOX.secs, C.blue);
    ring(ctx, t, ev.tapSound + 0.25, BOX.secs, { color: C.blue, pad: 8 });
    tip(ctx, t, ev.tipSound, '🔇 ברירת המחדל: בלי צליל', 'מפעילים ומכבים בלחיצה, בכל רגע — גם מתוך המסך המלא', { seed: 302, color: '#e0f0ff' });
    character(ctx, t, T(7, 1), IMG.boy, { h: 240, flip: true });
  }
  // ================= 3. COLOURS =================
  function shotColour(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    useRegion(REG.ctl); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 's1' }, { t: ev.tapNight + 0.12, k: 't1' }, { t: ev.tapRetro + 0.12, k: 't2' }, { t: ev.tapPink + 0.12, k: 't3' }, { t: ev.tapWhite + 0.12, k: 't4' }]);
    const col = 'rgba(224,138,0,0.85)';
    tapAt(ctx, t, ev.tapNight, BOX.night, col); ring(ctx, t, ev.tapNight + 0.1, BOX.night, { color: C.orange, pad: 5, until: ev.tapRetro });
    tapAt(ctx, t, ev.tapRetro, BOX.retro, col); ring(ctx, t, ev.tapRetro + 0.1, BOX.retro, { color: C.orange, pad: 5, until: ev.tapPink });
    tapAt(ctx, t, ev.tapPink, BOX.pink, col); ring(ctx, t, ev.tapPink + 0.1, BOX.pink, { color: C.orange, pad: 5, until: ev.tapWhite });
    tapAt(ctx, t, ev.tapWhite, BOX.white, col); ring(ctx, t, ev.tapWhite + 0.1, BOX.white, { color: C.orange, pad: 5 });
    tip(ctx, t, ev.tipColour, '🎨 חמישה צבעים', 'שחור קלאסי, לבן, כחול לילה, רטרו כתום וורוד', { seed: 303, color: C.yellow });
    character(ctx, t, T(10, 2), IMG.bday, { h: 230, flip: true });
  }
  // ================= 4. OPTIONS =================
  function shotOpts(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    useRegion(REG.ctl); siteCard(ctx);
    stateView(ctx, t, [{ t: 0, k: 'o0' }, { t: ev.tapSec + 0.12, k: 'o1' }, { t: ev.tapH12 + 0.12, k: 'o2' }, { t: ev.tapDate + 0.12, k: 'o3' }]);
    const col = 'rgba(35,135,77,0.8)';
    tapAt(ctx, t, ev.tapSec, BOX.sec, col); ring(ctx, t, ev.tapSec + 0.1, BOX.o1sec, { color: C.green, pad: 5, until: ev.tapH12 });
    tapAt(ctx, t, ev.tapH12, BOX.o1h12, col); ring(ctx, t, ev.tapH12 + 0.1, BOX.h12b, { color: C.green, pad: 5, until: ev.tapDate });
    tapAt(ctx, t, ev.tapDate, BOX.o2date, col); ring(ctx, t, ev.tapDate + 0.1, BOX.o3date, { color: C.green, pad: 5 });
    tip(ctx, t, ev.tipOpts, '📅 תאריך לועזי ועברי', 'רוצים שעון נקי? מסתירים את השניות ואת התאריך', { seed: 304, color: '#e3f6ea' });
    character(ctx, t, T(13, 2), IMG.school, { h: 240 });
  }
  // ================= 5. CLEAN FULL SCREEN =================
  function shotClean(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    useRegion(REG.full); siteCard(ctx);
    const gone = ev.barGone;
    if (t < gone) view(ctx, IMG.f1);
    else if (t < S.ticks[3]) { view(ctx, IMG.f1); view(ctx, IMG.f4, clamp((t - gone) / 0.4)); }
    else flipView(ctx, t, [{ t: S.ticks[3], k: ['f5', 'f6', 'f7'] }]);
    ring(ctx, t, ev.ringBar, BOX.bar, { color: C.purple, pad: 8, until: gone });
    tip(ctx, t, ev.tipClean, '💡 המסך נשאר דולק', 'בדפדפנים שתומכים בזה. יוצאים ב־Esc או בכפתור "יציאה"', { seed: 305, color: C.lilac });
    character(ctx, t, T(16, 1), IMG.girl, { h: 230, flip: true });
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
    he(ctx, 'שעון מסך מלא', X, 230, { size: 90, w: 900, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: 1120 });
    popAt(ctx, t, L[1].t, X, 360, (c) => pill(c, 0, 0, 'חינם, בלי התקנה', { size: 54, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, X, 500, (c) => pill(c, 0, 0, 'ugabuga.co.il/tools/flip-clock', { size: 44, w: 600, bg: C.blue, fg: '#fff', padX: 40, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    popAt(ctx, t, L[3].t, X, 650, (c) => pill(c, 0, 0, 'נסו עכשיו 🕰️', { size: 60, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 192 }), { rot: 0.02 });
    he(ctx, '⏰ איפה הייתם שמים שעון גדול? כתבו בתגובות', X, 800, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[4].t, 0.25), maxW: 1160 });
    const mp = ease.outBack(clamp((t - L[1].t) / 0.5), 1.5);
    if (mp > 0) img(ctx, IMG.mascot, LX, 1080 + (1 - mp) * 400 - hop(t, 10), 300, { rot: 0.03 });
    confetti(ctx, t, ev.logo, LX, 360, { n: 80, seed: 9, spread: 1000 });
  }
  const SECTIONS = [
    { t0: 0, fn: shotHook }, { t0: T(2), fn: shotFull }, { t0: T(5), fn: shotSound }, { t0: T(8), fn: shotColour },
    { t0: T(11), fn: shotOpts }, { t0: T(14), fn: shotClean }, { t0: T(17), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png'); IMG.boy = await L('img/home-detective-boy.png'); IMG.bday = await L('img/birthday-girl.png');
      IMG.school = await L('img/home-schoolgirl.png');
      IMG.mascot = await L('img/mascot.png'); IMG.logo = await L('img/logo.svg');
      for (const k of ['a0', 's1', 't1', 't2', 't3', 't4', 'o0', 'o1', 'o2', 'o3', 'f0', 'f1a', 'f1b', 'f1', 'f2a', 'f2b', 'f2', 'f3a', 'f3b', 'f3', 'f4', 'f5', 'f6', 'f7']) IMG[k] = await L(`img/${k}.png`);
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
