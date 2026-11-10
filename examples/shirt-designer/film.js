// THE FILM (9:16) — "איזו חולצה הכי יפה? 1, 2 או 3": the shirt designer in the site's own look. Pure function of t.
// The shirts are real captures of the live page's mockup (shoot.js → shots/*.png).
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const RIGHT = SAFE.x + SAFE.w; // 940

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', line: '#dde2ed', card: '#ffffff' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));

  // ---------- Hebrew text (Chrome RTL shaping, the site's font) ----------
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
  function card(ctx, x, y, w, h, { fill = C.card, r = 34, seed = 1, shadow = 12, lw = 4.5, stroke = C.ink, shadowColor = C.ink } = {}) {
    if (shadow) { ctx.fillStyle = shadowColor; ctx.beginPath(); ctx.roundRect(x + shadow * 0.8, y + shadow, w, h, r); ctx.fill(); }
    G.rrect(ctx, x, y, w, h, r, { fill, lw, seed, stroke, amp: 1 });
  }
  function pill(ctx, cx, cy, s, { size = 44, w = 800, bg = C.yellow, fg = C.ink, padX = 34, h, seed = 3, shadow = 7, dir = 'rtl', fam, maxW } = {}) {
    let sz = size;
    if (maxW) { const mw = measure(ctx, s, sz, w, fam) + padX * 2; if (mw > maxW) sz *= (maxW - padX * 2) / (mw - padX * 2); }
    const ww = measure(ctx, s, sz, w, fam) + padX * 2, hh = h || size * 1.75;
    card(ctx, cx - ww / 2, cy - hh / 2, ww, hh, { fill: bg, r: hh / 2, seed, shadow, lw: 4 });
    he(ctx, s, cx, cy + sz * 0.36, { size: sz, w, color: fg, dir, fam });
    return ww;
  }
  function popAt(ctx, t, t0, cx, cy, fn, { dur = 0.3, over = 2.2, rot = 0 } = {}) {
    const p = UI.pop(t, t0, dur, over);
    if (p <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(p, p); fn(ctx); ctx.restore();
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
      g.addColorStop(0, C.lilac); g.addColorStop(0.55, C.blush); g.addColorStop(1, C.yellow);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.06)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }

  // ---------- the step header: number badge + title + subtitle (RTL) ----------
  function header(ctx, t, f) {
    popAt(ctx, t, f.t, RIGHT - 52, 318, (c) => {
      c.fillStyle = C.ink; c.beginPath(); c.arc(5, 7, 52, 0, Math.PI * 2); c.fill();
      c.fillStyle = f.color; c.beginPath(); c.arc(0, 0, 52, 0, Math.PI * 2); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
      he(c, String(f.n), 0, 22, { size: 64, w: 900, color: '#fff', dir: 'ltr' });
    });
    const a = UI.fadeIn(t, f.t + 0.06, 0.2), dx = (1 - ease.outCubic(UI.fadeIn(t, f.t + 0.06, 0.35))) * -40;
    he(ctx, f.title, RIGHT - 126 + dx, 345, { size: 72, w: 900, align: 'right', alpha: a, maxW: SAFE.w - 130 });
    he(ctx, f.sub, RIGHT, 428, { size: 40, w: 500, color: C.muted, align: 'right', alpha: UI.fadeIn(t, f.t + 0.2, 0.25), maxW: SAFE.w });
    const u = ease.outCubic(UI.fadeIn(t, f.t + 0.15, 0.4));
    if (u > 0) {
      const x1 = RIGHT - 126, len = Math.min(measure(ctx, f.title, 72, 900), SAFE.w - 130) * u;
      G.line(ctx, [[x1, 366], [x1 - len, 370]], { color: f.color, lw: 9, seed: f.n * 3, amp: 1.2 });
    }
  }

  // a chip (rounded pill) at center x,y
  function chip(ctx, cx, cy, w, h, s, { on = false, color = C.yellow, size = 32, seed = 1, fg } = {}) {
    G.rrect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2, { fill: on ? color : '#fff', lw: on ? 4.5 : 3, seed, stroke: on ? C.ink : '#c9cfdd' });
    he(ctx, s, cx, cy + size * 0.36, { size, w: 800, color: fg || C.ink, maxW: w - 30 });
  }

  // the mascot (the owner's logo character)
  function mascot(ctx, cx, cy, d, t, t0) {
    popAt(ctx, t, t0, cx, cy, (c) => {
      c.rotate(Math.sin((t - t0) * 3) * 0.04);
      c.save(); c.shadowColor = 'rgba(20,22,45,.35)'; c.shadowBlur = 24; c.shadowOffsetY = 12;
      if (IMG.logo) c.drawImage(IMG.logo, -d / 2, -d / 2, d, d);
      c.restore();
    }, { dur: 0.45, over: 1.8 });
  }

  // ---------- the real shirt captures ----------
  const CROP = 900; // the capture is 840×926; the bottom strip holds a floating site button
  function shirtW(h) { const im = IMG.course; return im ? im.width * h / CROP : h * 0.93; }
  function shirt(ctx, k, cx, cy, h, alpha = 1) {
    const im = IMG[k]; if (!im || alpha <= 0) return;
    const w = im.width * h / CROP;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.drawImage(im, 0, 0, im.width, CROP, cx - w / 2, cy - h / 2, w, h); ctx.restore();
  }
  // a card with the shirt; `list` = [{k, t}] states in time order, cross-fade + a small bump on each change
  function shirtCard(ctx, t, list, cx, cy, h, t0, { seed = 300, rot = -0.015 } = {}) {
    let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k].t) i = k;
    const w = shirtW(h), a = i ? clamp((t - list[i].t) / 0.2) : 1;
    const bump = i ? 1 + 0.05 * Math.sin(Math.PI * clamp((t - list[i].t) / 0.3)) : 1;
    popAt(ctx, t, t0, cx, cy, (c) => {
      c.scale(bump, bump);
      card(c, -w / 2 - 22, -h / 2 - 22, w + 44, h + 44, { fill: C.paper, seed, r: 30, shadow: 12 });
      if (i && a < 1) shirt(c, list[i - 1].k, 0, 0, h, 1);
      shirt(c, list[i].k, 0, 0, h, a);
    }, { dur: 0.35, over: 1.5, rot });
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 250, (c) => pill(c, 0, 0, '👕 חולצות מחזור', { size: 52, w: 900, bg: C.blue, fg: '#fff', padX: 50, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 470, (c) => he(c, 'איזו חולצה', 0, 0, { size: 150, w: 900, maxW: SAFE.w }), { rot: -0.025 });
    popAt(ctx, t, ev.q2, W / 2, 650, (c) => he(c, 'הכי יפה?', 0, 0, { size: 170, w: 900, color: C.red, maxW: SAFE.w }), { rot: 0.02 });
    const cols = [C.blue, C.red, C.green];
    S.hookOpts.forEach((o) => {
      const x = 840 - o.i * 300, h = 280, w = shirtW(h);
      popAt(ctx, t, o.t, x, 910, (c) => {
        card(c, -w / 2 - 12, -h / 2 - 14, w + 24, h + 28, { fill: C.paper, seed: 20 + o.i, shadow: 10, r: 28 });
        shirt(c, o.k, 0, 0, h);
        c.fillStyle = C.ink; c.beginPath(); c.arc(4, h / 2 + 62, 46, 0, Math.PI * 2); c.fill();
        c.fillStyle = cols[o.i]; c.beginPath(); c.arc(0, h / 2 + 56, 46, 0, Math.PI * 2); c.fill();
        c.strokeStyle = C.ink; c.lineWidth = 4.5; c.stroke();
        he(c, o.s, 0, h / 2 + 80, { size: 64, w: 900, color: '#fff', dir: 'ltr' });
      }, { rot: [-0.03, 0.02, -0.02][o.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(735, 1370); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'בחרו מספר 🤔', { size: 60, w: 900, bg: C.yellow, padX: 38 });
      ctx.restore();
    }
    mascot(ctx, 290, 1560 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 450, t, ev.q2);
  }

  // ================= 1. OCCASION =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    let on = 1; for (const tp of S.OCC_TAPS) if (t >= tp.t) on = tp.i;
    S.AUD.forEach((a) => {
      const col = a.i % 3, row = Math.floor(a.i / 3), x = 795 - col * 295, y = 510 + row * 92;
      popAt(ctx, t, a.t, x, y, (c) => chip(c, 0, 0, 280, 76, a.label, { on: on === a.i && t >= S.AUD[8].t, size: 30, seed: 40 + a.i }), { dur: 0.22, over: 1.6 });
    });
    for (const tp of S.OCC_TAPS) { const col = tp.i % 3, row = Math.floor(tp.i / 3); UI.tap(ctx, 795 - col * 295 + 20, 520 + row * 92, t, tp.t, { color: 'rgba(34,107,215,0.8)', size: 110 }); }
    shirtCard(ctx, t, [{ k: 'course', t: 0 }, ...S.OCC_TAPS], W / 2, 1120, 540, S.steps[0].t + 0.25, { seed: 301 });
    popAt(ctx, t, S.pills[0], W / 2, 1520, (c) => pill(c, 0, 0, '9 אירועים, ולכל אחד עיצוב מוכן', { size: 46, w: 900, bg: C.yellow, seed: 66, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 2. DRAWING =================
  // the animals grid capture (1024×338): lion = top-right cell, eagle = 5th cell from the right
  const GRID = { x: W / 2 - 430, y: 650, w: 860 };
  const CELL = { lion: [868, 2, 154, 154], eagle: [176, 2, 154, 154] };
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const catOn = t >= S.ART_TAPS[0].t;
    S.TOPICS.forEach((o) => {
      const x = o.i % 2 ? 285 : 715, y = 505 + Math.floor(o.i / 2) * 82;
      popAt(ctx, t, o.t, x, y, (c) => chip(c, 0, 0, 400, 70, o.label, { on: catOn ? o.i === 1 : o.i === 0, size: 32, seed: 50 + o.i }), { dur: 0.25, over: 1.6 });
    });
    UI.tap(ctx, 285 + 30, 515, t, S.ART_TAPS[0].t, { color: 'rgba(207,47,86,0.8)', size: 110 });
    const im = IMG.grid;
    if (im) {
      const sc = GRID.w / im.width, gh = im.height * sc;
      popAt(ctx, t, S.ART_TAPS[0].t + 0.1, W / 2, GRID.y + gh / 2, (c) => {
        card(c, -GRID.w / 2 - 16, -gh / 2 - 16, GRID.w + 32, gh + 32, { fill: '#fff', seed: 60, r: 26, shadow: 10 });
        c.drawImage(im, -GRID.w / 2, -gh / 2, GRID.w, gh);
        const sel = t >= S.ART_TAPS[2].t ? CELL.eagle : t >= S.ART_TAPS[1].t ? CELL.lion : null;
        if (sel) { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#fff4bb'; c.beginPath(); c.roundRect(-GRID.w / 2 + sel[0] * sc, -gh / 2 + sel[1] * sc, sel[2] * sc, sel[3] * sc, 16); c.fill(); c.restore();
          c.strokeStyle = C.red; c.lineWidth = 6; c.beginPath(); c.roundRect(-GRID.w / 2 + sel[0] * sc - 4, -gh / 2 + sel[1] * sc - 4, sel[2] * sc + 8, sel[3] * sc + 8, 18); c.stroke(); }
      }, { dur: 0.3, over: 1.4 });
      for (const k of ['lion', 'eagle']) { const tp = S.ART_TAPS.find((x) => x.k === k), cc = CELL[k]; UI.tap(ctx, GRID.x + (cc[0] + cc[2] / 2) * sc, GRID.y + (cc[1] + cc[3] / 2) * sc, t, tp.t, { color: 'rgba(207,47,86,0.8)', size: 110 }); }
    }
    shirtCard(ctx, t, [{ k: 'course', t: 0 }, ...S.ART_TAPS.slice(1)], W / 2, 1235, 430, S.steps[1].t + 0.25, { seed: 302, rot: 0.012 });
    popAt(ctx, t, S.pills[1], W / 2, 1560, (c) => pill(c, 0, 0, 'טנק, אריה, נשר, כובע סיום, בלונים…', { size: 44, w: 900, bg: C.yellow, seed: 67, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 3. TEXT, LAYOUT, FONT =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const lay = t >= S.TEXT_TAPS[0].t ? 1 : 0;
    S.MODES.forEach((o) => {
      const x = o.i % 2 ? 285 : 715, y = 505 + Math.floor(o.i / 2) * 82;
      popAt(ctx, t, o.t, x, y, (c) => chip(c, 0, 0, 400, 70, o.label, { on: lay === o.i && t >= S.MODES[3].t, size: 32, seed: 70 + o.i }), { dur: 0.25, over: 1.6 });
    });
    UI.tap(ctx, 285 + 30, 515, t, S.TEXT_TAPS[0].t, { color: 'rgba(138,79,216,0.8)', size: 110 });
    // the title input, typed letter by letter
    popAt(ctx, t, S.MODES[3].t + 0.2, W / 2, 720, (c) => {
      he(c, 'כותרת (שם הפלוגה, הצוות, המחזור)', SAFE.w / 2, -58, { size: 30, w: 800, align: 'right', color: C.muted });
      G.rrect(c, -SAFE.w / 2, -38, SAFE.w, 84, 18, { fill: '#fff', lw: 4, seed: 79, stroke: t >= S.TYPE.t0 && t < S.TEXT_TAPS[2].t ? C.purple : '#c9cfdd' });
      const full = [...S.TYPE.text], n = Math.round(clamp((t - S.TYPE.t0) / (S.TYPE.t1 - S.TYPE.t0)) * full.length);
      const s = t < S.TYPE.t0 ? 'צוות טנק 3' : full.slice(0, n).join('');
      he(c, s, SAFE.w / 2 - 30, 18, { size: 44, w: 700, align: 'right' });
      if (t >= S.TYPE.t0 && t < S.TEXT_TAPS[2].t && Math.floor(t * 3) % 2 === 0) { const mw = measure(c, s, 44, 700); c.fillStyle = C.purple; c.fillRect(SAFE.w / 2 - 36 - mw, -20, 4, 50); }
    }, { dur: 0.25, over: 1.3 });
    // left: the shirt; right: ready slogan + font chips
    shirtCard(ctx, t, [{ k: 'eagle', t: 0 }, ...S.TEXT_TAPS], 285, 1080, 430, S.steps[2].t + 0.3, { seed: 303 });
    const RX = 735;
    he(ctx, 'משפט מוכן', RX + 190, 860, { size: 32, w: 800, align: 'right', color: C.muted, alpha: UI.fadeIn(t, S.steps[2].t + 0.6, 0.25) });
    popAt(ctx, t, S.steps[2].t + 0.7, RX, 920, (c) => chip(c, 0, 0, 390, 70, 'פעם אחים, תמיד אחים', { on: t >= S.TEXT_TAPS[2].t, size: 30, seed: 88 }), { dur: 0.25, over: 1.5 });
    UI.tap(ctx, RX + 30, 930, t, S.TEXT_TAPS[2].t, { color: 'rgba(138,79,216,0.8)', size: 110 });
    he(ctx, 'גופן', RX + 190, 1030, { size: 32, w: 800, align: 'right', color: C.muted, alpha: UI.fadeIn(t, S.steps[2].t + 0.8, 0.25) });
    S.FONTS.forEach((f, i) => {
      const x = RX + (i % 2 ? -100 : 100), y = 1090 + Math.floor(i / 2) * 84;
      popAt(ctx, t, S.steps[2].t + 0.9 + i * 0.08, x, y, (c) => chip(c, 0, 0, 185, 70, f, { on: t >= S.TEXT_TAPS[3].t ? i === 2 : i === 0, size: 34, seed: 90 + i }), { dur: 0.25, over: 1.6 });
    });
    UI.tap(ctx, RX + 100 + 20, 1100 + 84, t, S.TEXT_TAPS[3].t, { color: 'rgba(138,79,216,0.8)', size: 110 });
    popAt(ctx, t, S.pills[2], W / 2, 1450, (c) => pill(c, 0, 0, 'רואים את זה על החולצה מיד', { size: 46, w: 900, bg: C.lilac, seed: 68, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= 4. COLOURS =================
  const swXY = (i) => [870 - (i % 6) * 150, 515 + Math.floor(i / 6) * 108];
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    let sel = 3; // the default "סיום קורס" shirt (#1f2937) is not in the swatches; none selected until a tap
    sel = -1; for (const tp of S.COLOR_TAPS) if (t >= tp.t && tp.sw >= 0) sel = tp.sw;
    S.sheetItems.forEach((s) => {
      const [x, y] = swXY(s.i);
      popAt(ctx, t, s.t, x, y, (c) => {
        if (sel === s.i) { c.strokeStyle = C.ink; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 56, 0, Math.PI * 2); c.stroke(); }
        c.fillStyle = s.c; c.beginPath(); c.arc(0, 0, 44, 0, Math.PI * 2); c.fill();
        c.strokeStyle = sel === s.i ? C.ink : '#c9cfdd'; c.lineWidth = sel === s.i ? 4.5 : 3; c.stroke();
      }, { dur: 0.22, over: 1.8 });
    });
    for (const tp of S.COLOR_TAPS) if (tp.sw >= 0) { const [x, y] = swXY(tp.sw); UI.tap(ctx, x + 10, y + 10, t, tp.t, { color: 'rgba(224,138,0,0.85)', size: 110 }); }
    shirtCard(ctx, t, [{ k: 'hand', t: 0 }, ...S.COLOR_TAPS], W / 2, 1010, 430, S.steps[3].t + 0.25, { seed: 304, rot: 0.012 });
    // the one-colour checkbox
    const oneT = S.COLOR_TAPS[2].t, on = t >= oneT;
    popAt(ctx, t, S.steps[3].t + 0.9, W / 2, 1335, (c) => {
      G.rrect(c, -SAFE.w / 2, -50, SAFE.w, 100, 24, { fill: on ? '#fff8e6' : '#fff', lw: 4, seed: 120, stroke: on ? C.orange : '#c9cfdd' });
      G.rrect(c, SAFE.w / 2 - 82, -24, 48, 48, 10, { fill: on ? C.orange : '#fff', lw: 4, seed: 121, stroke: C.ink });
      if (on) { c.strokeStyle = '#fff'; c.lineWidth = 7; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(SAFE.w / 2 - 70, 0); c.lineTo(SAFE.w / 2 - 60, 12); c.lineTo(SAFE.w / 2 - 44, -12); c.stroke(); }
      he(c, 'צבע אחד בלבד (זול יותר בהדפסת משי)', SAFE.w / 2 - 105, 13, { size: 36, w: 800, align: 'right', maxW: SAFE.w - 140 });
    }, { dur: 0.25, over: 1.3 });
    UI.tap(ctx, RIGHT - 58, 1345, t, oneT, { color: 'rgba(224,138,0,0.85)', size: 110 });
    popAt(ctx, t, S.pills[3], W / 2, 1480, (c) => pill(c, 0, 0, 'בהדפסת משי כל צבע עולה בנפרד', { size: 44, w: 900, bg: C.yellow, seed: 69, maxW: SAFE.w }), { rot: 0.02 });
  }

  // ================= 5. NAMES + DOWNLOAD =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    shirtCard(ctx, t, [{ k: 'names16', t: 0 }], W / 2, 735, 450, S.NAMES_T, { seed: 305 });
    popAt(ctx, t, S.extras[0].t, W / 2, 1060, (c) => pill(c, 0, 0, 'עד 90 שמות, מסתדרים לבד בעמודות', { size: 44, w: 900, bg: C.lilac, seed: 70, maxW: SAFE.w }), { rot: -0.015 });
    const press = t >= S.DL ? 1 - 0.08 * pulse(t, S.DL, 10) : 1;
    popAt(ctx, t, S.NAMES_T + 0.6, W / 2, 1195, (c) => {
      c.scale(press, press);
      card(c, -SAFE.w / 2, -55, SAFE.w, 110, { fill: '#ef4444', r: 24, seed: 130, shadow: 8, lw: 4 });
      he(c, '⬇️ הורדת PNG שקוף לבית הדפוס', 0, 16, { size: 46, w: 900, color: '#fff', maxW: SAFE.w - 60 });
    }, { dur: 0.25, over: 1.4 });
    UI.tap(ctx, W / 2 + 80, 1205, t, S.DL, { color: 'rgba(20,22,45,0.7)', size: 120 });
    confetti(ctx, t, S.DL + 0.05, W / 2, 1190, { n: 50, seed: 6, spread: 800 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1335, (c) => pill(c, 0, 0, 'PNG שקוף ⁦3000×4000⁩ או SVG', { size: 44, w: 900, bg: '#fff', seed: 71, maxW: SAFE.w }), { rot: 0.015 });
    popAt(ctx, t, S.extras[2].t, W / 2, 1460, (c) => pill(c, 0, 0, 'משלמים רק לבית הדפוס על החולצות', { size: 44, w: 900, bg: C.yellow, seed: 72, maxW: SAFE.w }), { rot: -0.02 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 600); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 570, 450, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 905 + (1 - wp) * 24, { size: 150, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'מעצבים חולצת מחזור או סיום קורס', W / 2, 1000, { size: 54, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1225, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בעמוד כלים: עיצוב חולצות 👕', W / 2, 1350, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1465, (c) => pill(c, 0, 0, '⁦1, 2⁩ או 3? כתבו בתגובות ✍️', { size: 52, w: 900, bg: C.red, fg: '#fff', padX: 48, seed: 192, maxW: SAFE.w }), { rot: 0.025, dur: 0.35 });
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 80, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotAud },
    { t0: T(4), fn: shotTopics },
    { t0: T(6), fn: shotModes },
    { t0: T(8), fn: shotPlay },
    { t0: T(10), fn: shotPrint },
    { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.logo = (await L('img/mascot.png')) || (await L('img/logo.svg'));
      for (const k of ['course', 'maslul', 'six', 'gan', 'yb', 'parents', 'beret', 'lion', 'eagle', 'shield', 'title', 'slogan', 'hand', 'bordeaux', 'black', 'one', 'names16']) IMG[k] = await L(`shots/${k}.png`);
      IMG.grid = await L('shots/grid_animals.png');
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
