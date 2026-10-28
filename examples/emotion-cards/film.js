// THE FILM (9:16) — "כרטיסיות רגשות": the site emotion-cards page in the site own look (paper + dot grid,
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

  // ---------- emotion-card props ----------
  const COLORS = ['#fde68a', '#bfdbfe', '#fecaca', '#bbf7d0', '#e9d5ff', '#fed7aa']; // the site's card colours
  const LEN = (x) => x.replace(/[֑-ׇ]/g, '').length;
  const label = (x, gender, nikud) => { const a = nikud ? x.mn : x.m, b = nikud ? x.fn : x.f; return gender === 'm' ? a : gender === 'f' ? b : a === b ? a : `${a} / ${b}`; };
  // one emotion card: colour fill, dashed outline like the printed sheet, emoji, label, optional question
  function emoCard(ctx, x, w, h, { gender = 'both', nikud = false, color = true, ci = 0, q = null, seed = 1, emoji = 138, name = 54 } = {}) {
    card(ctx, -w / 2, -h / 2, w, h, { fill: color ? COLORS[ci % COLORS.length] : '#fff', r: 32, seed, shadow: 10, lw: 4 });
    const lab = label(x, gender, nikud);
    const qh = q ? 70 : 0;
    he(ctx, x.emoji, 0, -h / 2 + h * 0.4 - qh * 0.2 + 30, { size: emoji, w: 400 });
    he(ctx, lab, 0, h / 2 - 34 - qh, { size: name, w: 900, maxW: w - 40 });
    return qh;
  }
  function chipRow(ctx, labels, y, sel, seedBase, onColor = C.blue) {
    let x = RIGHT - 40;
    labels.forEach((s, k) => {
      const ww = measure(ctx, s, 34, 800) + 52, on = sel === k;
      G.rrect(ctx, x - ww, y - 36, ww, 72, 36, { fill: on ? onColor : '#fff', lw: on ? 4.5 : 3, seed: seedBase + k, stroke: on ? C.ink : C.line });
      he(ctx, s, x - ww / 2, y + 12, { size: 34, w: 800, color: on ? '#fff' : C.ink });
      x -= ww + 16;
    });
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    he(ctx, 'שאלה אחת קטנה לכל בוקר…', W / 2, 300, { size: 44, w: 700, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2) });
    popAt(ctx, t, ev.q1, W / 2, 470, (c) => he(c, 'איך אני', 0, 0, { size: 160, w: 900 }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT, W / 2, 635, (c) => he(c, 'מרגיש/ה היום?', 0, 0, { size: 128, w: 900, color: C.red, maxW: 860 }), { rot: 0.025 });
    popAt(ctx, t, ev.title, W / 2, 800, (c) => pill(c, 0, 0, 'כרטיסיות רגשות 😊', { size: 76, w: 900, bg: C.blue, fg: '#fff', padX: 48, seed: 12 }), { rot: -0.03, dur: 0.35 });
    S.hookPills.forEach((p) => {
      const x = [775, 540, 305][p.i];
      popAt(ctx, t, p.t, x, 925, (c) => pill(c, 0, 0, `${p.e} ${p.s}`, { size: 44, w: 800, bg: '#fff', seed: 20 + p.i, shadow: 6, padX: 28 }), { rot: [-0.03, 0.02, -0.02][p.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1050); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'להדפסה בחינם!', { size: 60, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
    // the characters pop up at the bottom, a big face between them
    const bp = ease.outBack(clamp((t - ev.q2) / 0.45), 1.5);
    if (bp > 0) img(ctx, IMG.boy, 200, 1530 + (1 - bp) * 520 - (t > ev.q2 + 0.45 ? hop(t, 16) : 0), 440, { rot: -0.04 });
    const gp = ease.outBack(clamp((t - ev.q2 - 0.15) / 0.45), 1.5);
    if (gp > 0) img(ctx, IMG.girl, 880, 1530 + (1 - gp) * 520 - (t > ev.q2 + 0.6 ? hop(t, 14) : 0), 440, { rot: 0.04 });
    const fp = ease.outBack(clamp((t - ev.q2 - 0.3) / 0.4), 1.8);
    if (fp > 0) { const faces = ['😄', '😢', '😠', '🤩']; const fi = Math.floor((t - ev.q2) / (BEAT)) % 4; ctx.save(); ctx.translate(W / 2, 1380 - hop(t, 12)); ctx.scale(fp, fp); he(ctx, faces[fi], 0, 60, { size: 210, w: 400 }); ctx.restore(); }
  }

  // ================= 1. THE GRID: six cards =================
  function shotGrid(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    S.gridCards.forEach((g) => {
      const col = g.i % 2, row = Math.floor(g.i / 2);
      const cx = RIGHT - 210 - col * 440, cy = 660 + row * 285;
      popAt(ctx, t, g.t, cx, cy, (c) => emoCard(c, S.EM[g.k], 410, 262, { ci: g.i, seed: 30 + g.i, emoji: 105, name: 50 }), { rot: [0.02, -0.02, -0.025, 0.02, 0.015, -0.02][g.i] });
    });
    popAt(ctx, t, S.ev.pill, W / 2, 1450, (c) => pill(c, 0, 0, '🖨️ 6 כרטיסיות בדף A4', { size: 48, w: 900, bg: C.yellow, seed: 66 }), { rot: -0.03 });
    popAt(ctx, t, S.ev.more, W / 2, 1550, (c) => he(c, 'ועוד 18 רגשות: גאה, מתוסכל, אמיץ…', 0, 0, { size: 38, w: 800, color: C.muted, maxW: 860 }));
  }

  // ================= 2. A QUESTION ON EVERY CARD =================
  function shotAsk(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    let k = 0; S.asks.forEach((a, i) => { if (t >= a.t) k = i; });
    const a = S.asks[k], x = S.EM[a.k];
    const p = clamp((t - a.t) / 0.35);
    // the old card slides out left, the new one pops in
    ctx.save(); ctx.translate(W / 2, 920);
    const sc = 0.88 + 0.12 * ease.outBack(p, 1.6); ctx.scale(sc, sc); ctx.rotate([-0.02, 0.02, -0.015][k] * (1 - 0.3 * p));
    card(ctx, -400, -330, 800, 660, { fill: COLORS[[2, 0, 5][k]], r: 40, seed: 200 + k, shadow: 14, lw: 5 });
    he(ctx, x.emoji, 0, -50, { size: 250, w: 400 });
    he(ctx, label(x, 'both', false), 0, 150, { size: 84, w: 900, maxW: 740 });
    ctx.restore();
    // the question bubble
    const qp = UI.pop(t, a.t + BEAT / 2, 0.3, 1.8);
    if (qp > 0) {
      ctx.save(); ctx.translate(W / 2, 1385); ctx.scale(qp, qp);
      card(ctx, -420, -80, 840, 170, { fill: '#fff', r: 40, seed: 210 + k, shadow: 9, lw: 4 });
      he(ctx, '💬 ' + x.q, 0, 20, { size: 54, w: 800, maxW: 780 });
      ctx.restore();
    }
    // dots show which of the three
    S.asks.forEach((q, i) => { ctx.fillStyle = i === k ? C.red : C.line; ctx.beginPath(); ctx.arc(W / 2 + (1 - i) * 44, 1000 + 340 + 150 + 20, 12, 0, Math.PI * 2); ctx.fill(); });
    popAt(ctx, t, S.ev.nopanic, W / 2, 1580, (c) => pill(c, 0, 0, 'אין תשובה נכונה, כל רגש בסדר 💛', { size: 40, w: 800, bg: C.yellow, seed: 215 }), { rot: -0.02 });
    const bp = ease.outBack(clamp((t - T(4, 0.2)) / 0.45), 1.5);
  }

  // ================= 3. BOYS / GIRLS / BOTH =================
  function shotGender(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    let sel = 0; S.genderTaps.forEach((p) => { if (t >= p.t) sel = p.k; });
    he(ctx, 'לשון', RIGHT, 520, { size: 34, w: 800, align: 'right', color: C.muted });
    chipRow(ctx, S.GENDERS, 595, sel, 100, C.purple);
    S.genderTaps.forEach((p) => {
      const ww = measure(ctx, S.GENDERS[p.k], 34, 800) + 52; let x = RIGHT - 40; for (let j = 0; j < p.k; j++) x -= measure(ctx, S.GENDERS[j], 34, 800) + 52 + 16;
      UI.tap(ctx, x - ww / 2, 595, t, p.t, { color: 'rgba(138,79,216,0.8)', size: 110 });
    });
    const gender = ['both', 'm', 'f'][sel], last = Math.max(...S.genderTaps.filter((p) => t >= p.t).map((p) => p.t), 0);
    const x = S.EM.excited;
    ctx.save(); ctx.translate(W / 2, 1050); const kick = 1 + 0.04 * pulse(t, last, 10); ctx.scale(kick, kick);
    card(ctx, -380, -300, 760, 600, { fill: COLORS[1], r: 40, seed: 230, shadow: 14, lw: 5 });
    he(ctx, x.emoji, 0, -50, { size: 230, w: 400 });
    he(ctx, label(x, gender, false), 0, 150, { size: gender === 'both' ? 70 : 96, w: 900, maxW: 700 });
    ctx.restore();
    popAt(ctx, t, T(7, 3), W / 2, 1480, (c) => pill(c, 0, 0, 'מתאים לילד ולילדה', { size: 46, w: 900, bg: C.yellow, seed: 235 }), { rot: -0.03 });
  }

  // ================= 4. NIKUD + COLOUR =================
  function shotLook(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    let nik = 0, col = 0; S.looks.forEach((p) => { if (t >= p.t) { if (p.row === 0) nik = p.k; else col = p.k; } });
    he(ctx, 'ניקוד', RIGHT, 520, { size: 34, w: 800, align: 'right', color: C.muted });
    chipRow(ctx, ['בלי ניקוד', 'עם ניקוד'], 595, nik, 300, C.orange);
    he(ctx, 'צבע', RIGHT, 700, { size: 34, w: 800, align: 'right', color: C.muted });
    chipRow(ctx, ['🎨 צבעוני', '⚫ שחור־לבן'], 775, col, 310, C.orange);
    S.looks.forEach((p) => {
      const L = p.row === 0 ? ['בלי ניקוד', 'עם ניקוד'] : ['🎨 צבעוני', '⚫ שחור־לבן'];
      const ww = measure(ctx, L[p.k], 34, 800) + 52; let x = RIGHT - 40; for (let j = 0; j < p.k; j++) x -= measure(ctx, L[j], 34, 800) + 52 + 16;
      UI.tap(ctx, x - ww / 2, p.row ? 775 : 595, t, p.t, { color: 'rgba(224,138,0,0.8)', size: 110 });
    });
    const last = Math.max(...S.looks.filter((p) => t >= p.t).map((p) => p.t), 0);
    ctx.save(); ctx.translate(W / 2, 1180); const kick = 1 + 0.04 * pulse(t, last, 10); ctx.scale(kick, kick);
    emoCard(ctx, S.EM.ashamed, 800, 480, { gender: 'both', nikud: nik === 1, color: col === 0, ci: 4, seed: 320, emoji: 170, name: nik ? 52 : 70 });
    ctx.restore();
    popAt(ctx, t, T(9, 3), W / 2, 1520, (c) => pill(c, 0, 0, 'שחור־לבן חוסך דיו 🖨️', { size: 42, w: 800, bg: C.yellow, seed: 330 }), { rot: -0.03 });
  }

  // ================= 5. THE WALL BOARD =================
  function shotBoard(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const cols = 4, cw = 205, ch = 138, gx = 15, gy = 12, x0 = RIGHT - cw / 2, y0 = 540;
    he(ctx, 'איך אני מרגיש/ה היום?', W / 2, 505, { size: 44, w: 900, alpha: UI.fadeIn(t, S.S.board[0] + 0.1, 0.25), maxW: 860 });
    S.cells.forEach((c) => {
      const col = c.i % cols, row = Math.floor(c.i / cols);
      const cx = x0 - col * (cw + gx), cy = y0 + 20 + ch / 2 + row * (ch + gy);
      popAt(ctx, t, c.t, cx, cy, (cc) => {
        G.rrect(cc, -cw / 2, -ch / 2, cw, ch, 22, { fill: COLORS[c.i % COLORS.length], lw: 3.5, seed: 400 + c.i, stroke: C.ink });
        he(cc, c.e, 0, 6, { size: 66, w: 400 });
        he(cc, c.s, 0, ch / 2 - 20, { size: 32, w: 800, maxW: cw - 20 });
      }, { dur: 0.22, over: 1.8 });
    });
    popAt(ctx, t, S.ev.boardDone, W / 2, 1560, (c) => pill(c, 0, 0, '📌 דף אחד לקיר, לגן או לכיתה', { size: 44, w: 900, bg: C.yellow, seed: 440 }), { rot: -0.03 });
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
    he(ctx, 'כרטיסיות רגשות עם שאלה לשיחה', W / 2, 1000, { size: 50, w: 700, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: 880 });
    popAt(ctx, t, L[1].t, W / 2, 1105, (c) => pill(c, 0, 0, 'להדפסה, בחינם ובלי הרשמה', { size: 46, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1240, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'בדפי הדפסה: כרטיסיות רגשות 😊', W / 2, 1375, { size: 40, w: 700, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: 880 });
    confetti(ctx, t, ev.logo, W / 2, 600, { n: 80, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotGrid },
    { t0: T(4), fn: shotAsk },
    { t0: T(6), fn: shotGender },
    { t0: T(8), fn: shotLook },
    { t0: T(10), fn: shotBoard },
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
