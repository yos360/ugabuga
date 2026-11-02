// THE FILM (9:16) — "אנסין עם מילון בלחיצה": the unseen section + dictionary in the site own look (paper + dot grid,
// ink-outlined cards with an offset shadow, Heebo), real characters only (no caveman). Pure function of t.
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

  // wrap a Hebrew line into at most `max` lines that fit width w
  function wrap(ctx, str, size, w, weight = 500, max = 2) {
    const words = str.split(' '), lines = []; let cur = '';
    for (const wd of words) { const tryS = cur ? cur + ' ' + wd : wd; if (measure(ctx, tryS, size, weight) > w && cur) { lines.push(cur); cur = wd; } else cur = tryS; }
    if (cur) lines.push(cur); return lines.slice(0, max);
  }


  // ---------- small helpers for this film ----------
  const isHe = (s) => (/[א-ת]/.test(s) ? 'rtl' : 'ltr');
  // an item card: emoji badge on the right, title + one line (RTL)
  function itemCard(ctx, x, y, w, h, [e, title, line], { color = C.blue, seed = 1, big = false } = {}) {
    card(ctx, x, y, w, h, { seed, r: 30, shadow: 9, lw: 4 });
    const bs = big ? 120 : 84, bx = x + w - 26 - bs / 2, by = y + 26 + bs / 2;
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(bx + 4, by + 5, bs / 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color + '33'; ctx.beginPath(); ctx.arc(bx, by, bs / 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.stroke();
    he(ctx, e, bx, by + bs * 0.18, { size: bs * 0.5, w: 400 });
    const tx = bx - bs / 2 - 14;
    he(ctx, title, tx, by + 14, { size: big ? 46 : 40, w: 900, align: 'right', maxW: tx - x - 16 });
    wrap(ctx, line, 31, w - 52, 500, 3).forEach((ln, i) => he(ctx, ln, x + w - 26, y + 26 + bs + 46 + i * 40, { size: 31, w: 500, color: C.muted, align: 'right' }));
  }
  const GX = SAFE.x, GW = SAFE.w, GAP = 24, CW = (GW - GAP) / 2;
  // 2-column grid slot k (RTL: the first card is on the right)
  const slot = (k, y0, h, gap = 20) => [GX + (k % 2 === 0 ? CW + GAP : 0), y0 + Math.floor(k / 2) * (h + gap)];
  function gridShot(ctx, t, step, cards, items, { y0 = 470, h = 292, tilt = 0.012 } = {}) {
    bg(ctx); header(ctx, t, step);
    items.forEach((it, k) => {
      const [x, y] = slot(k, y0, h);
      popAt(ctx, t, cards[k].t, x + CW / 2, y + h / 2, (c) => itemCard(c, -CW / 2, -h / 2, CW, h, it, { color: step.color, seed: 300 + step.n * 10 + k }), { rot: (k % 2 ? 1 : -1) * tilt, dur: 0.26, over: 2 });
    });
  }

  const LRI = '⁦', PDI = '⁩';
  const XL = W / 2 - GW / 2;
  // ---------- LTR passage layout: returns word boxes so taps can point at real words ----------
  function layoutLTR(ctx, text, size, maxW, x0, y0, lh, w = 500) {
    const sp = measure(ctx, ' ', size, w), out = []; let x = 0, y = y0;
    for (const tok of text.split(' ')) {
      const ww = measure(ctx, tok, size, w);
      if (x > 0 && x + ww > maxW) { x = 0; y += lh; }
      const core = tok.replace(/[.,!?]+$/, '');
      out.push({ tok, core, x: x0 + x, y, w: ww, cw: measure(ctx, core, size, w) });
      x += ww + sp;
    }
    return out;
  }
  function chip(ctx, cx, cy, s, { size = 34, bg = '#fff', fg = C.ink, sel = false, seed = 5, padX = 22, dir = 'rtl', w = 800 } = {}) {
    return pill(ctx, cx, cy, s, { size, w, bg: sel ? C.ink : bg, fg: sel ? '#fff' : fg, padX, h: size * 1.9, seed, shadow: sel ? 5 : 3, dir });
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    he(ctx, 'תלמידים והורים: מילה לא מובנת באנסין?', W / 2, 330, { size: 50, w: 800, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2), maxW: SAFE.w });
    popAt(ctx, t, ev.q1, W / 2, 570, (c) => he(c, 'נוגעים', 0, 0, { size: 200, w: 900 }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 790, (c) => he(c, 'ומבינים', 0, 0, { size: 200, w: 900, color: C.red }), { rot: 0.025 });
    popAt(ctx, t, ev.title, W / 2, 960, (c) => pill(c, 0, 0, 'אנסין עם מילון בלחיצה', { size: 64, w: 900, bg: C.blue, fg: '#fff', padX: 44, seed: 12 }), { rot: -0.03, dur: 0.35 });
    const ws = S.hookPills.map((p) => measure(ctx, `${p.e} ${p.s}`, 38, 800) + 52 + 14);
    let cx = W / 2 + ws.reduce((a, b) => a + b, 0) / 2;
    S.hookPills.forEach((p, k) => {
      const x = cx - ws[k] / 2; cx -= ws[k];
      popAt(ctx, t, p.t, x, 1085, (c) => pill(c, 0, 0, `${p.e} ${p.s}`, { size: 38, w: 800, bg: '#fff', seed: 20 + p.i, shadow: 6, padX: 26 }), { rot: [-0.03, 0.02, -0.02][p.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1210); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'בחינם · בלי הרשמה', { size: 60, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
    const gp = ease.outBack(clamp((t - ev.q2) / 0.45), 1.5);
    if (gp > 0) img(ctx, IMG.girl, 780, 1640 + (1 - gp) * 520 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 340, { rot: 0.03 });
    popAt(ctx, t, ev.q2 + 0.3, 330, 1430, (c) => he(c, '📖', 0, 0, { size: 150, w: 400 }), { rot: -0.05 });
  }

  // ================= 1. PICK AN UNSEEN =================
  function shotLevels(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const D = S.DATA.levels, CHh = 290;
    D.cards.forEach((cd, k) => {
      const y = 470 + k * (CHh + 30), col = k ? C.red : C.blue;
      popAt(ctx, t, S.levelCards[k].t, W / 2, y + CHh / 2, (c) => {
        card(c, -GW / 2, -CHh / 2, GW, CHh, { seed: 600 + k, r: 34, fill: k ? '#fff5f7' : '#eef5ff' });
        const bx = GW / 2 - 90, by = -CHh / 2 + 100;
        c.fillStyle = C.ink; c.beginPath(); c.arc(bx + 4, by + 5, 62, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(bx, by, 62, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke();
        he(c, cd.e, bx, by + 24, { size: 70, w: 400 });
        he(c, cd.title, bx - 86, by - 4, { size: 58, w: 900, align: 'right', color: C.ink, maxW: GW - 260 });
        he(c, cd.line, bx - 86, by + 52, { size: 42, w: 900, align: 'right', color: col });
      }, { rot: (k ? 1 : -1) * 0.01, dur: 0.3 });
      cd.chips.forEach((s, j) => {
        const ch = S.levelChips[k * 2 + j];
        const cw = measure(ctx, s, 34, 800) + 44, cxr = GX + GW - 34 - (j === 0 ? cw / 2 : measure(ctx, cd.chips[0], 34, 800) + 44 + 14 + cw / 2);
        popAt(ctx, t, ch.t, cxr, y + CHh - 56, (c) => pill(c, 0, 0, s, { size: 34, w: 800, bg: '#fff', padX: 22, h: 62, seed: 610 + k * 2 + j, shadow: 4 }), { rot: (j ? 1 : -1) * 0.02, dur: 0.22 });
      });
    });
    // what a level looks like (site facts for grade 7 in English)
    const FY = 470 + 2 * (CHh + 30) + 20, FH = 250;
    popAt(ctx, t, S.levelFacts.t, W / 2, FY + FH / 2, (c) => {
      card(c, -GW / 2, -FH / 2, GW, FH, { seed: 620, r: 34, fill: '#fff' });
      he(c, 'כיתה ז׳ באנגלית, למשל', GW / 2 - 34, -FH / 2 + 70, { size: 44, w: 900, align: 'right', color: C.muted });
      const fs = [`📏 ${LRI}120–190${PDI} מילים`, `❓ ${LRI}7–9${PDI} שאלות`, '⏱️ כ־25 דקות'];
      let cxr = GW / 2 - 34;
      fs.forEach((s, j) => {
        const wdt = measure(c, s, 36, 800) + 40;
        pill(c, cxr - wdt / 2, 40, s, { size: 36, w: 800, bg: ['#e8f1ff', '#fff4bb', '#e3f6ea'][j], padX: 20, h: 70, seed: 630 + j, shadow: 4 });
        cxr -= wdt + 12;
      });
    }, { rot: 0.008, dur: 0.3 });
    popAt(ctx, t, S.endPills.levels.t, W / 2, 1478, (c) => pill(c, 0, 0, D.pill, { size: 44, w: 900, bg: C.yellow, seed: 640, padX: 38 }), { rot: -0.02 });
  }

  // ================= 2. TAP A WORD =================
  function popup(ctx, x, y, w, he_, say = true) {
    const s = measure(ctx, he_, 46, 900), ww = measure(ctx, w, 46, 900) , tw = 70 + ww + 60 + s + 50, h = 96;
    const left = Math.min(Math.max(x - tw / 2, XL + 10), XL + GW - tw - 10);
    card(ctx, left, y, tw, h, { seed: 650, r: 26, shadow: 7, lw: 4, fill: '#fff' });
    const r = left + tw - 28;
    ctx.fillStyle = '#e8f1ff'; ctx.beginPath(); ctx.arc(r - 25, y + h / 2, 28, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
    he(ctx, '🔊', r - 25, y + h / 2 + 13, { size: 34, w: 400 });
    he(ctx, w, r - 70, y + h / 2 + 16, { size: 46, w: 900, align: 'right', dir: 'ltr', color: C.blue });
    he(ctx, '=', r - 70 - ww - 30, y + h / 2 + 16, { size: 46, w: 800, color: C.muted, dir: 'ltr' });
    he(ctx, he_, r - 70 - ww - 60, y + h / 2 + 16, { size: 46, w: 900, align: 'right', color: C.ink });
  }
  function shotTap(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const D = S.DATA.tap, E = S.tapEv, CY = 470, CH = 600;
    popAt(ctx, t, E.text, W / 2, CY + CH / 2, (c) => card(c, -GW / 2, -CH / 2, GW, CH, { seed: 660, r: 34, fill: '#fff' }), { rot: -0.006, dur: 0.3, over: 1.6 });
    if (t < E.text) return;
    const a = UI.fadeIn(t, E.text + 0.15, 0.25);
    ctx.save(); ctx.globalAlpha *= a;
    he(ctx, D.title, XL + 34, CY + 80, { size: 56, w: 900, align: 'left', dir: 'ltr', color: C.ink });
    const words = layoutLTR(ctx, D.text, 41, GW - 68, XL + 34, CY + 160, 66);
    const tapped = (wd) => words.find((w) => w.core.toLowerCase() === wd);
    D.taps.forEach((tp, k) => {
      const wd = tapped(tp.w), tt = k ? E.tap2 : E.tap1;
      if (t >= tt && (k === 1 || t < E.tap2)) { ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.roundRect(wd.x - 8, wd.y - 44, wd.cw + 16, 62, 12); ctx.fill(); }
    });
    words.forEach((wd) => he(ctx, wd.tok, wd.x, wd.y, { size: 41, w: 500, align: 'left', dir: 'ltr', color: C.ink }));
    // glossary word: dashed underline
    const gw = tapped('afraid');
    ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(gw.x, gw.y + 10); ctx.lineTo(gw.x + gw.cw, gw.y + 10); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    // finger + pop-up
    D.taps.forEach((tp, k) => {
      const wd = tapped(tp.w), tt = k ? E.tap2 : E.tap1;
      const fp = clamp((t - (tt - 0.35)) / 0.3);
      if (fp > 0 && t < tt + 0.5) {
        const dy = lerp(70, 8, ease.outCubic(fp)) + 10 * pulse(t, tt, 14);
        ctx.save(); ctx.translate(wd.x + wd.cw / 2 + 26, wd.y + 36 + dy); ctx.globalAlpha = clamp(fp * 2) * (1 - clamp((t - tt - 0.25) / 0.25)); he(ctx, '👆', 0, 0, { size: 82, w: 400 }); ctx.restore();
      }
      const show = k ? t >= tt : (t >= tt && t < E.tap2);
      if (show) popAt(ctx, t, tt, wd.x + wd.cw / 2, wd.y + 36 + 48, (c) => popup(c, 0, -48, tp.w, tp.he), { dur: 0.22, over: 1.8 });
    });
    he(ctx, D.note, W / 2, CY + CH + 56, { size: 34, w: 600, color: C.muted, alpha: UI.fadeIn(t, E.tap2 + 0.5, 0.3), maxW: SAFE.w });
    popAt(ctx, t, S.endPills.tap.t, W / 2, 1290, (c) => pill(c, 0, 0, D.pill, { size: 46, w: 900, bg: '#fff', seed: 670, padX: 40 }), { rot: -0.02 });
    popAt(ctx, t, E.pill2, W / 2, 1420, (c) => pill(c, 0, 0, D.pill2, { size: 44, w: 900, bg: C.yellow, seed: 671, padX: 38 }), { rot: 0.02 });
  }

  // ================= 3. THE DICTIONARY =================
  function shotDict(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const D = S.DATA.dict, E = S.dictEv;
    // language chips (one row, scaled to fit)
    const labs = D.langs.map(([e, s]) => `${e} ${s}`);
    let size = 32; while (labs.reduce((a, s) => a + measure(ctx, s, size, 800) + 36 + 10, 0) > GW && size > 22) size -= 1;
    popAt(ctx, t, E.langs, W / 2, 530, (c) => {
      let cxr = GW / 2;
      labs.forEach((s, k) => { const wdt = measure(c, s, size, 800) + 36; chip(c, cxr - wdt / 2, 0, s, { size, sel: k === 0, padX: 18, seed: 680 + k }); cxr -= wdt + 10; });
    }, { dur: 0.3, over: 1.5 });
    popAt(ctx, t, E.dirs, W / 2, 625, (c) => {
      const w0 = measure(c, D.dirs[0], 34, 800) + 48;
      chip(c, GW / 2 - w0 / 2, 0, D.dirs[0], { size: 34, sel: true, seed: 690 });
      const w1 = measure(c, D.dirs[1], 34, 800) + 48;
      chip(c, GW / 2 - w0 - 12 - w1 / 2, 0, D.dirs[1], { size: 34, seed: 691 });
    }, { dur: 0.3, over: 1.5 });
    const FY = 700, FH = 140;
    popAt(ctx, t, E.form, W / 2, FY + FH / 2, (c) => {
      card(c, -GW / 2, -FH / 2, GW, FH, { seed: 700, r: 30, fill: '#f6f2ff' });
      card(c, -GW / 2 + 215, -FH / 2 + 24, GW - 215 - 28, FH - 48, { seed: 701, r: 20, shadow: 0, lw: 3.5, fill: '#fff' });
      const typed = S.typeKeys.filter((k) => t >= k.t).length;
      const txt = D.word.slice(0, typed);
      he(c, txt, -GW / 2 + 215 + 30, 18, { size: 50, w: 600, align: 'left', dir: 'ltr' });
      if (typed < 5 && Math.floor(t * 4) % 2 === 0 || typed === 0) { const cw = measure(c, txt, 50, 600); c.fillStyle = C.blue; c.fillRect(-GW / 2 + 215 + 32 + cw, -26, 4, 52); }
      const pr = pulse(t, E.press, 10);
      c.save(); c.translate(-GW / 2 + 28 + 80, 0); c.scale(1 - 0.06 * pr, 1 - 0.06 * pr);
      card(c, -80, -FH / 2 + 24, 160, FH - 48, { seed: 702, r: 20, shadow: 4, lw: 3.5, fill: C.blue });
      he(c, 'תרגום', 0, 14, { size: 38, w: 900, color: '#fff' });
      c.restore();
    }, { rot: -0.006, dur: 0.3 });
    const RY = 890, RH = 270;
    popAt(ctx, t, E.result, W / 2, RY + RH / 2, (c) => {
      card(c, -GW / 2, -RH / 2, GW, RH, { seed: 710, r: 34, fill: '#fff' });
      c.fillStyle = '#e8f1ff'; c.beginPath(); c.arc(GW / 2 - 70, -RH / 2 + 80, 40, 0, Math.PI * 2); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 3.5; c.stroke();
      he(c, '🔊', GW / 2 - 70, -RH / 2 + 80 + 15, { size: 42, w: 400 });
      he(c, D.word, GW / 2 - 130, -RH / 2 + 98, { size: 72, w: 900, align: 'right', dir: 'ltr', color: C.blue });
      he(c, D.mean, GW / 2 - 34, 40, { size: 84, w: 900, align: 'right', color: C.ink });
      he(c, D.src, GW / 2 - 34, RH / 2 - 30, { size: 32, w: 700, align: 'right', color: C.green });
    }, { rot: 0.008, dur: 0.3 });
    he(ctx, 'מילים נפוצות באנגלית לפי אות', GX + GW, 1255, { size: 36, w: 800, align: 'right', color: C.muted, alpha: UI.fadeIn(t, S.dictLetters[0].t, 0.25) });
    S.dictLetters.forEach((l, i) => {
      const cwd = 96, x = GX + GW - 48 - i * (cwd + 14);
      popAt(ctx, t, l.t, x, 1345, (c) => chip(c, 0, 0, D.letters[i], { size: 44, w: 900, padX: 30, seed: 720 + i, dir: 'ltr' }), { rot: (i % 2 ? 1 : -1) * 0.04, dur: 0.2 });
    });
    popAt(ctx, t, S.endPills.dict.t, W / 2, 1478, (c) => pill(c, 0, 0, D.pill, { size: 46, w: 900, bg: C.yellow, seed: 730, padX: 40 }), { rot: 0.02 });
  }

  // ================= 4. QUESTIONS =================
  function shotQuiz(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const D = S.DATA.quiz, E = S.quizEv;
    popAt(ctx, t, E.modes, W / 2, 520, (c) => {
      const w0 = measure(c, D.modes[0], 32, 800) + 44, w1 = measure(c, D.modes[1], 32, 800) + 44;
      const tot = w0 + w1 + 14;
      chip(c, tot / 2 - w0 / 2, 0, D.modes[0], { size: 32, sel: true, padX: 22, seed: 740 });
      chip(c, -tot / 2 + w1 / 2, 0, D.modes[1], { size: 32, padX: 22, seed: 741 });
    }, { dur: 0.3, over: 1.5 });
    const QY = 580, QH = 600;
    popAt(ctx, t, E.q, W / 2, QY + QH / 2, (c) => {
      card(c, -GW / 2, -QH / 2, GW, QH, { seed: 750, r: 34, fill: '#fffaf0' });
      wrap(c, D.q, 38, GW - 68, 800, 2).forEach((ln, i) => he(c, ln, -GW / 2 + 34, -QH / 2 + 78 + i * 52, { size: 38, w: 800, align: 'left', dir: 'ltr' }));
    }, { rot: -0.006, dur: 0.3 });
    D.opts.forEach((o, i) => {
      const y = QY + 170 + i * 108, picked = i === D.right && t >= E.pick;
      popAt(ctx, t, E.opts[i], W / 2, y + 48, (c) => {
        card(c, -GW / 2 + 22, -46, GW - 44, 92, { seed: 760 + i, r: 24, shadow: 5, lw: 3.5, fill: picked ? '#dff5e7' : '#fff', stroke: picked ? C.green : C.ink });
        c.fillStyle = picked ? C.green : '#eef0f6'; c.beginPath(); c.arc(-GW / 2 + 22 + 52, 0, 28, 0, Math.PI * 2); c.fill();
        he(c, 'abcd'[i], -GW / 2 + 22 + 52, 12, { size: 34, w: 900, dir: 'ltr', color: picked ? '#fff' : C.muted });
        he(c, o, -GW / 2 + 22 + 100, 12, { size: 34, w: 600, align: 'left', dir: 'ltr', maxW: GW - 220 });
        if (picked) checkMark(c, GW / 2 - 22 - 44, 0, 28, clamp((t - E.pick) / 0.4));
      }, { rot: (i % 2 ? 1 : -1) * 0.004, dur: 0.22, over: 1.8 });
    });
    const EY = QY + QH + 26, EH = 230;
    popAt(ctx, t, E.explain, W / 2, EY + EH / 2, (c) => {
      card(c, -GW / 2, -EH / 2, GW, EH, { seed: 770, r: 30, fill: '#e9f8ee', stroke: C.green });
      he(c, '✓ נכון!', GW / 2 - 30, -EH / 2 + 62, { size: 48, w: 900, align: 'right', color: C.green });
      wrap(c, D.explain, 34, GW - 60, 600, 3).forEach((ln, i) => he(c, ln, GW / 2 - 30, -EH / 2 + 118 + i * 44, { size: 34, w: 600, align: 'right', color: C.ink }));
    }, { rot: 0.006, dur: 0.3 });
    popAt(ctx, t, S.endPills.quiz.t, W / 2, 1500, (c) => pill(c, 0, 0, D.pill, { size: 42, w: 900, bg: C.yellow, seed: 780, padX: 38 }), { rot: -0.02 });
  }

  // ================= 5. EXAM PREP =================
  function shotMore(ctx, t) {
    gridShot(ctx, t, S.steps[4], S.moreCards, S.DATA.more.cards);
    popAt(ctx, t, S.endPills.more.t, W / 2, 1478, (c) => pill(c, 0, 0, S.DATA.more.pill, { size: 44, w: 900, bg: C.yellow, seed: 790, padX: 38 }), { rot: 0.02 });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 600); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
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
    he(ctx, 'אנסין באנגלית ובעברית, עם מילון בלחיצה', W / 2, 1000, { size: 46, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'בחינם · בלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190, padX: 44 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1240, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'ראשי ← לומדים ← אנסין 📖', W / 2, 1375, { size: 38, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 80, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotLevels },
    { t0: T(4), fn: shotTap },
    { t0: T(6), fn: shotDict },
    { t0: T(8), fn: shotQuiz },
    { t0: T(10), fn: shotMore },
    { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.girl = await L('img/home-schoolgirl.png');
      IMG.boy = await L('img/home-detective-boy.png');
      IMG.logo = await L('img/logo.svg');
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
