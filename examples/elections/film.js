// THE FILM (9:16) — class elections on UGABUGA, in the site's own look: warm paper and a dot grid,
// ink-outlined cards with an offset shadow, Heebo type, the elections page's lilac-pink-yellow hero,
// and the real characters (no caveman). Every frame is a pure function of t, inside G.SAFE.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { T, BEAT, BAR, ev, clock } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const RIGHT = SAFE.x + SAFE.w; // 940

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#686d87', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', cyan: '#00bfe8', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', lilacShadow: '#dcd0f7', line: '#dde2ed', card: '#ffffff', box: '#d9a76a', boxDark: '#b9824a' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));

  // ---------- Hebrew text (Chrome RTL shaping, the site's font) ----------
  const fontOf = (size, w, fam = 'Heebo') => `${w} ${size}px "${fam}", "Noto Color Emoji", sans-serif`;
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
  function checkMark(ctx, x, y, r, p, color = C.green) {
    if (p <= 0) return;
    ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r * (0.7 + 0.3 * ease.outBack(clamp(p * 2), 2)), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.26; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const q = clamp(p * 1.6);
    ctx.beginPath(); ctx.moveTo(x - r * 0.45, y + r * 0.02);
    if (q < 0.4) ctx.lineTo(x - r * 0.45 + r * 0.3 * q / 0.4, y + r * 0.02 + r * 0.32 * q / 0.4);
    else { ctx.lineTo(x - r * 0.15, y + r * 0.34); ctx.lineTo(x - r * 0.15 + r * 0.6 * (q - 0.4) / 0.6, y + r * 0.34 - r * 0.7 * (q - 0.4) / 0.6); }
    ctx.stroke(); ctx.restore();
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
  // the elections page hero: lilac → pink → yellow
  function heroBg(ctx) {
    ctx.drawImage(Studio.cache('hero', (x) => {
      const g = x.createLinearGradient(W, 0, 0, H);
      g.addColorStop(0, C.lilac); g.addColorStop(0.55, C.blush); g.addColorStop(1, C.yellow);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(20,22,45,0.06)';
      for (let yy = 30; yy < H; yy += 44) for (let xx = 30; xx < W; xx += 44) { x.beginPath(); x.arc(xx, yy, 2.6, 0, Math.PI * 2); x.fill(); }
    }, { variants: 1 }), 0, 0, W, H);
  }

  // the site's tilted "הקלפי שלנו" sign (.ce-box)
  function boxSign(ctx, cx, cy, s = 1) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.07); ctx.scale(s, s);
    card(ctx, -150, -125, 300, 250, { fill: C.card, r: 30, seed: 7, shadow: 12, lw: 5, stroke: C.red, shadowColor: C.lilacShadow });
    he(ctx, '✓ הקול שלי', 0, -60, { size: 36, w: 800, color: C.red });
    he(ctx, 'הקלפי', 0, 20, { size: 64, w: 900 });
    he(ctx, 'שלנו', 0, 88, { size: 64, w: 900 });
    ctx.restore();
  }
  // a cardboard ballot box; the slot is at (cx, slotY). front face spans [cy, cy + h]
  function ballotBox(ctx, cx, cy, { w = 440, h = 330, depth = 80, t = 0, bump = 0 } = {}) {
    const x0 = cx - w / 2, x1 = cx + w / 2, sk = 46;
    ctx.save(); ctx.translate(0, bump * 6);
    // shadow
    ctx.fillStyle = 'rgba(20,22,45,0.12)'; ctx.beginPath(); ctx.ellipse(cx + 20, cy + h + 10, w * 0.62, 26, 0, 0, Math.PI * 2); ctx.fill();
    // side
    G.poly(ctx, [[x1, cy], [x1 + sk, cy - depth], [x1 + sk, cy + h - depth], [x1, cy + h]], { fill: C.boxDark, lw: 4.5, seed: 11, stroke: C.ink });
    // top with the slot
    G.poly(ctx, [[x0, cy], [x0 + sk, cy - depth], [x1 + sk, cy - depth], [x1, cy]], { fill: '#e8bf88', lw: 4.5, seed: 12, stroke: C.ink });
    const sx = cx + sk / 2, sy = cy - depth / 2;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(sx - 120, sy - 9, 240, 18, 9); ctx.fill();
    // front
    G.rrect(ctx, x0, cy, w, h, 8, { fill: C.box, lw: 4.5, seed: 13, stroke: C.ink, hatch: { color: 'rgba(90,50,20,0.10)', gap: 12 } });
    // the sign taped to the front
    ctx.save(); ctx.translate(cx, cy + h / 2 + 6); ctx.rotate(-0.04);
    card(ctx, -150, -95, 300, 190, { fill: C.card, r: 24, seed: 14, shadow: 8, lw: 4.5, stroke: C.red, shadowColor: C.lilacShadow });
    he(ctx, '✓ הקול שלי', 0, -38, { size: 32, w: 800, color: C.red });
    he(ctx, 'הקלפי שלנו', 0, 42, { size: 58, w: 900 });
    ctx.restore();
    ctx.restore();
    return { sx, sy };
  }
  // a printed ballot, exactly like the site's print kit
  function ballot(ctx, name, w = 230, h = 150, { title = 'בחירות לוועד כיתה' } = {}) {
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-w / 2 + 6, -h / 2 + 7, w, h, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 8); ctx.fill();
    ctx.save(); ctx.setLineDash([9, 7]); ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 6); ctx.stroke(); ctx.restore();
    he(ctx, title, 0, -h / 2 + 38 * h / 150, { size: 19 * h / 150, w: 600, color: C.muted });
    he(ctx, name, 0, 18 * h / 150, { size: 56 * h / 150, w: 900 });
    he(ctx, 'עוגה בוגה · בחירות בכיתה', 0, h / 2 - 22 * h / 150, { size: 16 * h / 150, w: 600, color: C.muted });
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

  // ================= HOOK =================
  const HOOK_TYPES = ['ועד כיתה', 'ועד בית הספר', 'ועד הורים'];
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.hook1, W / 2, 440, (c) => he(c, 'בחירות', 0, 0, { size: 200, w: 900 }), { rot: -0.03 });
    popAt(ctx, t, ev.hook2, W / 2, 630, (c) => he(c, 'בכיתה?', 0, 0, { size: 200, w: 900, color: C.red }), { rot: 0.02 });
    // the three committees, one per 16th with the marimba run
    HOOK_TYPES.forEach((s, i) => {
      const x = [775, 490, 205][i];
      popAt(ctx, t, ev.line + i * BEAT / 4, x, 770, (c) => pill(c, 0, 0, s, { size: 38, w: 800, bg: ['#fff', '#fff', '#fff'][i], seed: 20 + i, shadow: 6, padX: 26 }), { rot: [-0.03, 0.02, -0.02][i] });
    });
    // the stamp
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 920); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'בחינם בעוגה בוגה!', { size: 60, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
    // the site's ballot-box sign drops in
    if (t >= ev.box) {
      const j = clamp((t - ev.box) / 0.4), y = lerp(-300, 1220, ease.outBack(j, 1.3)) - (j >= 1 ? hop(t, 12) : 0);
      boxSign(ctx, 700, y, 1.05);
    }
    // the detective boy pops up bottom-left
    const bp = ease.outBack(clamp((t - ev.hook2) / 0.45), 1.5);
    if (bp > 0) img(ctx, IMG.boy, 230, 1530 + (1 - bp) * 520 - (t > ev.hook2 + 0.45 ? hop(t, 16) : 0), 470, { rot: -0.04 });
  }

  // ================= 1. ELECTION TYPES =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const tapped = t >= ev.pickMode;
    S.modes.forEach((md) => {
      const y = 560 + md.i * 150;
      const sel = tapped && md.i === 0;
      const press = sel ? 1 - 0.05 * pulse(t, ev.pickMode, 10) : 1;
      popAt(ctx, t, md.t, W / 2, y, (c) => {
        c.scale(press, press);
        card(c, -SAFE.w / 2, -62, SAFE.w, 124, { fill: sel ? C.blush : C.card, r: 24, seed: 30 + md.i, shadow: sel ? 9 : 6, lw: sel ? 5 : 3.5, stroke: sel ? C.red : C.ink });
        he(c, md.e, SAFE.w / 2 - 62, 20, { size: 58, w: 400 });
        he(c, md.label, SAFE.w / 2 - 120, 17, { size: 50, w: 800, align: 'right' });
        if (sel) checkMark(c, -SAFE.w / 2 + 70, 0, 36, clamp((t - ev.pickMode) / 0.3), C.red);
      });
      if (md.i === 0) UI.tap(ctx, W / 2 + 120, y, t, ev.pickMode, { color: 'rgba(207,47,86,0.85)', size: 150 });
    });
    const kp = UI.pop(t, T(3, 3), 0.3, 2);
    if (kp > 0) { ctx.save(); ctx.translate(W / 2, 1365); ctx.scale(kp, kp); pill(ctx, 0, 0, '🎒 בוחרים: בחירות לוועד כיתה', { size: 40, w: 800, bg: C.yellow, seed: 39 }); ctx.restore(); }
  }

  // ================= 2. CANDIDATES =================
  function shotNames(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const X = SAFE.x, Wc = SAFE.w, Y = 490;
    card(ctx, X, Y, Wc, 640, { seed: 41 });
    he(ctx, '🎒 סבב 1', RIGHT - 50, Y + 75, { size: 34, w: 800, color: C.red, align: 'right' });
    he(ctx, 'בחירות לוועד כיתה', RIGHT - 50, Y + 145, { size: 58, w: 900, align: 'right' });
    he(ctx, 'המועמדים, שם בכל שורה', RIGHT - 50, Y + 225, { size: 36, w: 800, align: 'right' });
    // the textarea
    const ty = Y + 255;
    G.rrect(ctx, X + 50, ty, Wc - 100, 300, 18, { fill: '#fbfcff', lw: 3, seed: 42, stroke: '#b9c0d4' });
    let curLine = 0;
    S.candidates.forEach((nm, line) => {
      const n = S.typed(t, line);
      if (n > 0) curLine = line;
      const shown = [...nm].slice(0, n).join('');
      he(ctx, shown, RIGHT - 80, ty + 78 + line * 82, { size: 54, w: 700, align: 'right' });
      // cursor after the last typed letter
      if (line === curLine && n > 0 && t < T(5)) {
        const cx = RIGHT - 80 - measure(ctx, shown, 54, 700) - 8;
        if (Math.floor(t * 4) % 2 === 0 || n < nm.length) { ctx.fillStyle = C.ink; ctx.fillRect(cx - 4, ty + 34 + line * 82, 5, 56); }
      }
    });
    if (S.typed(t, 0) === 0) { ctx.fillStyle = C.ink; if (Math.floor(t * 4) % 2 === 0) ctx.fillRect(RIGHT - 84, ty + 34, 5, 56); }
    he(ctx, `${S.candidates.filter((_, i) => S.typed(t, i) === [...S.candidates[i]].length).length} מועמדים`, X + 80, ty + 280, { size: 30, w: 700, color: C.muted, align: 'left' });
    // candidate chips pop in bar 5
    S.nameChips.forEach((c) => {
      const x = [780, 500, 220][c.i];
      popAt(ctx, t, c.t, x, 1250, (cc) => {
        card(cc, -125, -82, 250, 164, { fill: [C.blush, C.lilac, '#fff8de'][c.i], r: 26, seed: 50 + c.i, shadow: 8 });
        cc.fillStyle = [C.red, C.purple, C.orange][c.i]; cc.beginPath(); cc.arc(0, -28, 30, 0, Math.PI * 2); cc.fill();
        he(cc, c.nm[0], 0, -16, { size: 36, w: 900, color: '#fff' });
        he(cc, c.nm, 0, 48, { size: 46, w: 900 });
      }, { rot: [0.03, -0.02, 0.025][c.i] });
    });
    // continue button
    const bp = UI.fadeIn(t, T(5, 2.5), 0.2);
    if (bp > 0) {
      const press = t >= ev.toPrint ? 1 - 0.08 * pulse(t, ev.toPrint, 10) : 1;
      ctx.save(); ctx.globalAlpha = bp; ctx.translate(W / 2, 1440); ctx.scale(press, press);
      pill(ctx, 0, 0, t >= ev.toPrint ? 'נשמר ✓' : 'שמירה והמשך ←', { size: 44, w: 900, bg: t >= ev.toPrint ? C.green : C.red, fg: '#fff', padX: 56, seed: 58 });
      ctx.restore();
      UI.tap(ctx, W / 2 + 90, 1440, t, ev.toPrint, { color: 'rgba(20,22,45,0.7)', size: 110 });
    }
  }

  // ================= 3. PRINT =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const px = W / 2, pb = 1520, ph = 420;
    let push = 0; for (const p of S.ballots.concat(S.extras)) push = Math.max(push, pulse(t, p.t, 9));
    const outY = pb - ph + 70;
    const fly = (t0, sx, sy, sr, draw) => {
      const a = t - t0;
      if (a < -BEAT * 0.5) return;
      let x, y, r, s;
      if (a < 0) { const u = (a + BEAT * 0.5) / (BEAT * 0.5); x = px; y = outY + 110 - u * 110; r = 0; s = 0.7; }
      else { const u = ease.outBack(clamp(a / 0.42), 1.4); x = lerp(px, sx, u); y = lerp(outY, sy, u) - Math.sin(Math.PI * clamp(a / 0.42)) * 140; r = lerp(0, sr, u); s = lerp(0.7, 1, clamp(u)); }
      ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s); draw(ctx); ctx.restore();
    };
    // four ballots in a row, right to left
    const slots = [[815, 590, 0.06], [600, 600, -0.05], [385, 590, 0.05], [170, 600, -0.06]];
    S.ballots.forEach((b) => { const [sx, sy, sr] = slots[b.i]; fly(b.t, sx, sy, sr, (c) => ballot(c, b.nm, 200, 140)); });
    // the box sign and the tally sheet
    fly(S.extras[0].t, 690, 850, -0.04, (c) => {
      c.scale(0.8, 0.8);
      card(c, -150, -125, 300, 250, { fill: C.card, r: 30, seed: 7, shadow: 12, lw: 5, stroke: C.red, shadowColor: C.lilacShadow });
      he(c, 'שלט לקלפי', 0, -62, { size: 32, w: 800, color: C.red });
      he(c, 'הקלפי', 0, 20, { size: 64, w: 900 }); he(c, 'שלנו', 0, 88, { size: 64, w: 900 });
    });
    fly(S.extras[1].t, 315, 850, 0.04, (c) => {
      c.scale(0.8, 0.8);
      card(c, -160, -130, 320, 260, { fill: C.card, r: 12, seed: 8, shadow: 10, lw: 4 });
      he(c, 'דף ספירה', 0, -80, { size: 40, w: 900 });
      S.candidates.forEach((nm, i) => {
        const y = -25 + i * 52;
        c.strokeStyle = '#c3cbe0'; c.lineWidth = 3; c.beginPath(); c.moveTo(-135, y + 18); c.lineTo(135, y + 18); c.stroke();
        he(c, nm, 125, y + 8, { size: 30, w: 700, align: 'right' });
        c.strokeStyle = C.ink; c.lineWidth = 3.5;
        for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-40 - k * 14, y - 16); c.lineTo(-40 - k * 14, y + 10); c.stroke(); }
      });
      he(c, 'פתקים ריקים: ___', 0, 128, { size: 22, w: 600, color: C.muted });
    });
    img(ctx, IMG.printer, px, pb + push * 6, ph * (1 - 0.03 * push));
    popAt(ctx, t, S.readyPill, W / 2, 1050, (c) => pill(c, 0, 0, '🖨️ הקלפי והפתקים מוכנים', { size: 42, w: 900, bg: C.yellow, seed: 95 }), { rot: -0.03 });
  }

  // ================= 4. VOTE =================
  function shotVote(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    // the ballot screen
    const X = SAFE.x, Wc = SAFE.w, Y = 480;
    card(ctx, X, Y, Wc, 260, { seed: 61, shadow: 9 });
    he(ctx, 'קלפי פתוחה · סבב 1', RIGHT - 45, Y + 62, { size: 32, w: 800, color: C.red, align: 'right' });
    const picked = t >= ev.pick;
    const btnX = [790, 500, 210];
    S.candidates.forEach((nm, i) => {
      const sel = picked && i === 0;
      const press = sel ? 1 - 0.06 * pulse(t, ev.pick, 10) : 1;
      ctx.save(); ctx.translate(btnX[i], Y + 165); ctx.scale(press, press);
      G.rrect(ctx, -130, -55, 260, 110, 20, { fill: sel ? C.blush : '#fff', lw: sel ? 5 : 3.5, seed: 62 + i, stroke: sel ? C.red : C.line });
      he(ctx, (sel ? '◉ ' : '◯ ') + nm, 0, 17, { size: 46, w: 800, color: sel ? C.red : C.ink });
      ctx.restore();
    });
    UI.tap(ctx, btnX[0], Y + 165, t, ev.pick, { color: 'rgba(207,47,86,0.85)', size: 120 });
    // the box
    const land = [ev.drop + 0.36].concat(S.slips.map((s) => s.t));
    let bump = 0; for (const lt of land) bump = Math.max(bump, pulse(t, lt, 12));
    const { sx, sy } = ballotBox(ctx, 620, 1120, { t, bump });
    // the girl's ballot: from her button into the slot
    const a0 = t - ev.drop;
    if (a0 >= 0 && a0 < 0.36) {
      const u = a0 / 0.36, x = lerp(btnX[0], sx, ease.inOutSine ? ease.inOutSine(u) : u), y = lerp(Y + 165, sy, u) - Math.sin(Math.PI * u) * 180;
      ctx.save(); ctx.translate(x, y); ctx.rotate(lerp(0, Math.PI / 2, u)); ctx.scale(lerp(0.75, 0.45, u), lerp(0.75, 0.45, u)); ballot(ctx, 'נועה', 230, 150); ctx.restore();
    }
    // the rest of the class: slips fall into the slot on 8ths
    for (const s of S.slips) {
      const a = t - (s.t - 0.32);
      if (a < 0 || a >= 0.32) continue;
      const u = a / 0.32, x0 = lerp(260, 980, s.x0), x = lerp(x0, sx, u), y = lerp(780, sy, u * u);
      ctx.save(); ctx.translate(x, y); ctx.rotate(s.rot * (1 - u) + Math.PI / 2 * u); ctx.scale(0.42, 0.42); ballot(ctx, s.nm, 230, 150); ctx.restore();
    }
    // the slot swallows: redraw the slot's front lip over falling slips
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(sx - 120, sy - 2, 240, 11, 5); ctx.fill();
    // counter
    const n = S.ballotCount(t);
    if (t >= ev.drop + 0.36) {
      const np = pulse(t, land.filter((lt) => t >= lt).slice(-1)[0] || 0, 10);
      ctx.save(); ctx.translate(W / 2, 865); ctx.scale(1 + 0.07 * np, 1 + 0.07 * np);
      pill(ctx, 0, 0, `🗳️ ${n} פתקים בקלפי`, { size: 46, w: 900, bg: C.yellow, seed: 66 });
      ctx.restore();
    }
    // the girl votes, bottom-left
    const gp = ease.outBack(clamp((t - T(8)) / 0.45), 1.5);
    if (gp > 0) img(ctx, IMG.girl, 150, 1530 + (1 - gp) * 520 - hop(t, 10), 470, { rot: 0.03 });
  }

  // ================= 5. COUNT =================
  const BAR_COL = [C.red, C.purple, C.orange];
  function shotCount(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const X = SAFE.x, Wc = SAFE.w, Y = 480;
    card(ctx, X, Y, Wc, 640, { seed: 71 });
    he(ctx, 'הקלפי סגורה · סבב 1', RIGHT - 50, Y + 70, { size: 32, w: 800, color: C.red, align: 'right' });
    he(ctx, 'כל קול נספר', RIGHT - 50, Y + 140, { size: 60, w: 900, align: 'right' });
    he(ctx, `${S.TOTAL} פתקים · ${S.TOTAL} תקפים · 0 ריקים`, RIGHT - 50, Y + 200, { size: 34, w: 500, color: C.muted, align: 'right' });
    const g = ease.inOutCubic ? ease.inOutCubic(clamp((t - T(10, 0.25)) / (BEAT * 3.5))) : clamp((t - T(10, 0.25)) / (BEAT * 3.5));
    const won = t >= ev.reveal;
    S.results.forEach((r) => {
      const y = Y + 290 + r.i * 120;
      const v = Math.round(r.v * g), pct = Math.round(r.pct * g);
      const win = won && r.i === 0;
      if (win) { ctx.save(); ctx.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin((t - ev.reveal) * 5)); G.rrect(ctx, X + 26, y - 58, Wc - 52, 112, 20, { fill: '#e3f6ea', lw: 3, seed: 79, stroke: C.green }); ctx.restore(); }
      he(ctx, (win ? '🏆 ' : '') + r.nm, RIGHT - 55, y - 4, { size: 46, w: 900, align: 'right' });
      he(ctx, `${v} קולות · ${pct}%`, X + 55, y - 4, { size: 34, w: 600, color: C.muted, align: 'left', dir: 'rtl' });
      const bw = Wc - 110;
      ctx.fillStyle = '#f1eaff'; ctx.beginPath(); ctx.roundRect(X + 55, y + 18, bw, 22, 11); ctx.fill();
      const fw = bw * (r.v / S.TOTAL) * g;
      if (fw > 1) { ctx.fillStyle = BAR_COL[r.i]; ctx.beginPath(); ctx.roundRect(X + 55 + bw - fw, y + 18, fw, 22, 11); ctx.fill(); }
    });
    // the winner
    popAt(ctx, t, ev.reveal, W / 2, 1235, (c) => pill(c, 0, 0, 'נועה נבחרה לוועד הכיתה! 🎉', { size: 50, w: 900, bg: C.green, fg: '#fff', padX: 46, seed: 80 }), { rot: -0.03, dur: 0.35 });
    confetti(ctx, t, ev.reveal, W / 2, 1000, { n: 80, seed: 4, spread: 1000 });
    // the lesson on the site: the minority still matters
    popAt(ctx, t, ev.note, W / 2, 1385, (c) => {
      card(c, -SAFE.w / 2 + 20, -55, SAFE.w - 40, 110, { fill: C.yellow, r: 22, seed: 82, shadow: 6, lw: 3.5 });
      he(c, 'וגם מי שלא נבחר ממשיך להשפיע 💛', 0, 15, { size: 40, w: 800, maxW: SAFE.w - 100 });
    });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 600); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#ff7691'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    popAt(ctx, t, ev.logo, W / 2, 580, (c) => {
      const s = 320;
      c.rotate(Math.sin((t - ev.logo) * 3) * 0.03);
      c.fillStyle = C.ink; c.beginPath(); c.roundRect(-s / 2 + 12, -s / 2 + 14, s, s, 80); c.fill();
      c.save(); c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.clip(); if (IMG.logo) c.drawImage(IMG.logo, -s / 2, -s / 2, s, s); c.restore();
      c.strokeStyle = C.ink; c.lineWidth = 6; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.stroke();
    }, { dur: 0.45, over: 1.8 });
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 905 + (1 - wp) * 24, { size: 150, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'בחירות בכיתה, מוכנות בכמה דקות', W / 2, 1000, { size: 50, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25) });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'הבחירות האלה בחינם', { size: 50, w: 900, bg: C.yellow, seed: 120 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1240, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 121 }));
    he(ctx, 'כולל פעילות של 45 דקות על דמוקרטיה', W / 2, 1375, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25) });
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 80, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotModes },
    { t0: T(4), fn: shotNames },
    { t0: T(6), fn: shotPrint },
    { t0: T(8), fn: shotVote },
    { t0: T(10), fn: shotCount },
    { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.printer = await L('img/home-printer.png');
      IMG.girl = await L('img/home-schoolgirl.png');
      IMG.boy = await L('img/home-detective-boy.png');
      IMG.logo = await L('img/logo.svg');
    },
    draw(ctx, t) {
      let i = 0;
      for (let k = 0; k < SECTIONS.length; k++) if (t >= SECTIONS[k].t0) i = k;
      const sec = SECTIONS[i], u = i > 0 ? clamp((t - sec.t0) / SLIDE) : 1;
      if (u < 1) {
        // RTL: the old scene leaves to the right, the new one arrives from the left
        const e = 1 - Math.pow(1 - u, 4);
        ctx.save(); ctx.translate(e * W, 0); SECTIONS[i - 1].fn(ctx, sec.t0 - 0.001); ctx.restore();
        ctx.save(); ctx.translate((e - 1) * W, 0); sec.fn(ctx, t); ctx.restore();
        const f = S.steps[i - 1] || { color: C.red };
        ctx.fillStyle = f.color; ctx.fillRect(e * W - 18, 0, 36, H);
        const fl = 0.55 * (1 - clamp((t - sec.t0) / 0.1)); if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
      } else sec.fn(ctx, t);
    },
    post: { paper: 0.2, vignette: 0.08, grain: 0.02 },
    fadeOut: 0.9,
  });
})();
