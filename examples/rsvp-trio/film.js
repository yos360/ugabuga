// THE FILM (9:16) — "אירוע בלי כאב ראש": RSVP, who-brings-what and גמד וענק in the site own look (paper + dot grid,
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


  // ---------- UI pieces in the site look ----------
  const GREEN_WA = '#25D366';
  const heDir = (s) => (/[א-ת]/.test(s) ? 'rtl' : 'ltr');
  function chipRow(ctx, labels, y, sel, seedBase, { size = 34, color = C.blue } = {}) {
    let x = RIGHT - 40;
    labels.forEach((s, k) => {
      const ww = measure(ctx, s, size, 800) + 52, on = sel === k;
      G.rrect(ctx, x - ww, y - 36, ww, 72, 36, { fill: on ? color : '#fff', lw: on ? 4.5 : 3, seed: seedBase + k, stroke: on ? C.ink : C.line });
      he(ctx, s, x - ww / 2, y + 12, { size, w: 800, color: on ? '#fff' : C.ink, dir: heDir(s) });
      x -= ww + 16;
    });
  }
  // a text field: label above (right), box below; `value` typed, or a grey placeholder
  function field(ctx, label, x, y, w, value, ph, { h = 84, dir = 'rtl', focus = false, seed = 1 } = {}) {
    he(ctx, label, x + w, y, { size: 32, w: 800, align: 'right' });
    G.rrect(ctx, x, y + 18, w, h, 16, { fill: '#fbfcff', lw: focus ? 4.5 : 3, seed, stroke: focus ? C.blue : '#b9c0d4' });
    if (value) he(ctx, value, dir === 'rtl' ? x + w - 24 : x + 24, y + 18 + h / 2 + 15, { size: 42, w: 700, align: dir === 'rtl' ? 'right' : 'left', dir, maxW: w - 48 });
    else if (ph) he(ctx, ph, dir === 'rtl' ? x + w - 24 : x + 24, y + 18 + h / 2 + 13, { size: 36, w: 500, color: '#9aa1b8', align: dir === 'rtl' ? 'right' : 'left', dir: heDir(ph), maxW: w - 48 });
  }
  function bigBtn(ctx, cx, cy, s, t, t0, { bg: bgc = C.red, fg = '#fff', size = 46, padX = 50, seed = 7, h } = {}) {
    const press = t >= t0 ? 1 - 0.08 * pulse(t, t0, 10) : 1;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(press, press);
    pill(ctx, 0, 0, s, { size, w: 900, bg: bgc, fg, padX, seed, h });
    ctx.restore();
  }
  const tag = (ctx, s, x, y, color, seed) => { const ww = pill(ctx, x, y, s, { size: 28, w: 800, bg: color, padX: 22, shadow: 3, seed, h: 52 }); return ww; };

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    he(ctx, 'מארגנים אירוע?', W / 2, 300, { size: 52, w: 700, color: C.muted, alpha: UI.fadeIn(t, ev.q1, 0.2) });
    popAt(ctx, t, ev.q1, W / 2, 470, (c) => he(c, 'אירוע בלי', 0, 0, { size: 150, w: 900, maxW: 860 }), { rot: -0.03 });
    popAt(ctx, t, ev.q2, W / 2, 625, (c) => he(c, 'כאב ראש!', 0, 0, { size: 150, w: 900, color: C.red, maxW: 860 }), { rot: 0.025 });
    popAt(ctx, t, ev.title, W / 2, 790, (c) => pill(c, 0, 0, 'שלושה כלים בחינם', { size: 70, w: 900, bg: C.blue, fg: '#fff', padX: 48, seed: 12 }), { rot: -0.03, dur: 0.35 });
    S.hookPills.forEach((p) => {
      popAt(ctx, t, p.t, W / 2, 925 + p.i * 108, (c) => pill(c, 0, 0, `${p.e} ${p.s}`, { size: 46, w: 800, bg: '#fff', seed: 20 + p.i, shadow: 6, padX: 36 }), { rot: [-0.025, 0.02, -0.02][p.i] });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(W / 2, 1290); ctx.rotate(-0.04); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'בקלות, מהטלפון', { size: 58, w: 900, bg: C.yellow, padX: 44 });
      ctx.restore();
    }
    const bp = ease.outBack(clamp((t - ev.q2) / 0.45), 1.5);
    if (bp > 0) img(ctx, IMG.bday, 300, 1760 + (1 - bp) * 520 - (t > ev.q2 + 0.45 ? hop(t, 14) : 0), 400, { rot: -0.04 });
  }

  // ================= 1. RSVP: CREATE + SEND =================
  function shotRsvp1(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const X = SAFE.x, Wc = SAFE.w, Y = 480;
    const out = ease.outCubic(clamp((t - ev.create) / 0.25));
    if (out < 1) {
      ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(0, -out * 120);
      card(ctx, X, Y, Wc, 790, { seed: 31 });
      const sel = t >= ev.kind ? 1 : 0;
      chipRow(ctx, S.KINDS, Y + 70, sel, 40, { size: 32 });
      const typed = S.typedName(t);
      field(ctx, 'שם האירוע', X + 36, Y + 160, Wc - 72, typed, 'למשל: יום ההולדת של נועה', { focus: t >= S.nameTicks[0] && t < ev.create, seed: 45 });
      field(ctx, 'שעה', X + 36, Y + 310, 390, '', '17:00–⁦19:00', { dir: 'ltr', seed: 46 });
      field(ctx, 'תאריך', X + 36 + 430, Y + 310, Wc - 72 - 430, '', '', { seed: 47 });
      he(ctx, '📅', X + 36 + 430 + 60, Y + 310 + 18 + 56, { size: 44, w: 400 });
      field(ctx, 'מקום', X + 36, Y + 460, Wc - 72, '', 'כתובת, שם הגן או הפארק', { seed: 48 });
      bigBtn(ctx, W / 2, Y + 690, '✅ יצירת קישור לאישור הגעה', t, ev.create, { size: 42, padX: 44, seed: 58 });
      UI.tap(ctx, X + Wc - 400, Y + 70, t, ev.kind, { color: 'rgba(34,107,215,0.8)', size: 110 });
      UI.tap(ctx, W / 2 + 80, Y + 690, t, ev.create, { color: 'rgba(20,22,45,0.7)', size: 120 });
      ctx.restore();
    }
    popAt(ctx, t, ev.sendcard, W / 2, Y + 360, (c) => {
      card(c, -Wc / 2, -360, Wc, 720, { seed: 61, fill: '#f3fbf6' });
      he(c, '✓ האירוע נוצר! עכשיו שולחים את הקישור', 0, -270, { size: 38, w: 800, color: C.green, maxW: Wc - 60 });
      he(c, 'שולחים לאורחים', 0, -190, { size: 54, w: 900 });
      const press = t >= ev.wa ? 1 - 0.07 * pulse(t, ev.wa, 10) : 1;
      c.save(); c.translate(0, -60); c.scale(press, press);
      pill(c, 0, 0, '📱 שליחה בוואטסאפ', { size: 50, w: 900, bg: GREEN_WA, fg: '#fff', padX: 70, seed: 62, h: 104 }); c.restore();
      pill(c, 0, 90, '🔗 העתקת קישור', { size: 40, w: 800, bg: '#fff', padX: 70, seed: 63, h: 84, shadow: 5 });
      he(c, 'הקישור:', 120, 215, { size: 32, w: 700, color: C.muted, align: 'center' });
      he(c, 'ugabuga.co.il/r/k7m2qx', -150, 215, { size: 34, w: 800, dir: 'ltr', fam: 'Fredoka' });
      UI.tap(c, 80, -60, t - (ev.sendcard - ev.sendcard), ev.wa - ev.sendcard, { color: 'rgba(20,22,45,0.7)', size: 130 });
    }, { dur: 0.35, over: 1.6 });
    popAt(ctx, t, T(3, 2.5), W / 2, 1400, (c) => pill(c, 0, 0, 'בלי הרשמה ובלי אפליקציה', { size: 44, w: 900, bg: C.yellow, seed: 66 }), { rot: -0.03 });
  }

  // ================= 2. RSVP: ANSWERS + HOST SUMMARY =================
  const STAT_STYLE = { yes: ['🎉', 'מגיעים', '#e3f6ea', C.green], maybe: ['🤔', 'אולי', '#fff4d6', C.orange], no: ['😢', 'לא מגיעים', '#eef0f6', C.muted] };
  function shotRsvp2(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const X = SAFE.x, Wc = SAFE.w;
    // guest card
    const Y1 = 480;
    card(ctx, X, Y1, Wc, 460, { seed: 71, shadow: 10 });
    tag(ctx, '📱 האורח עונה', X + Wc - 150, Y1 + 8, '#e8f4ff', 72);
    const sent = t >= ev.send;
    field(ctx, 'השם שלכם', X + 36, Y1 + 70, Wc - 72, 'משפחת לוי', '', { h: 72, seed: 73 });
    const picked = t >= ev.answer ? 'yes' : '';
    Object.entries(STAT_STYLE).forEach(([k, st], i) => {
      const bw = (Wc - 72 - 32) / 3, bx = X + Wc - 36 - bw - i * (bw + 16), by = Y1 + 205, on = picked === k;
      const press = on ? 1 - 0.06 * pulse(t, ev.answer, 10) : 1;
      ctx.save(); ctx.translate(bx + bw / 2, by + 60); ctx.scale(press, press);
      G.rrect(ctx, -bw / 2, -60, bw, 120, 22, { fill: on ? C.ink : '#fff', lw: 3.5, seed: 74 + i, stroke: on ? C.ink : C.line });
      he(ctx, st[0], 0, -6, { size: 46, w: 400 }); he(ctx, st[1], 0, 42, { size: 30, w: 800, color: on ? '#fff' : C.ink, maxW: bw - 16 });
      ctx.restore();
    });
    UI.tap(ctx, X + Wc - 36 - (Wc - 72 - 32) / 6, Y1 + 265, t, ev.answer, { color: 'rgba(35,135,77,0.8)', size: 110 });
    bigBtn(ctx, W / 2, Y1 + 396, sent ? '✓ התשובה נשלחה. תודה!' : 'שליחת אישור', t, ev.send, { bg: sent ? C.green : C.red, size: 36, padX: 44, h: 64, seed: 79 });
    UI.tap(ctx, W / 2 + 60, Y1 + 396, t, ev.send, { color: 'rgba(20,22,45,0.7)', size: 100 });

    // host card
    const Y2 = 1000, tot = S.totals(t);
    card(ctx, X, Y2, Wc, 470, { seed: 81, shadow: 10 });
    tag(ctx, '👀 אתם רואים', X + Wc - 150, Y2 + 8, '#e3f6ea', 82);
    const cells = [['אנשים מגיעים', tot.people, '#e3f6ea'], ['מבוגרים', tot.adults, '#fff'], ['ילדים', tot.kids, '#fff'], ['תשובות אולי', tot.maybe, '#fff4d6']];
    const cw = (Wc - 72 - 3 * 12) / 4;
    cells.forEach(([lab, n, fill], i) => {
      const cx = X + Wc - 36 - cw / 2 - i * (cw + 12), pk = S.REPLIES.reduce((a, r) => Math.max(a, t >= r.t ? pulse(t, r.t, 10) : 0), 0);
      ctx.save(); ctx.translate(cx, Y2 + 130); ctx.scale(1 + 0.05 * pk * (i === 0 || (i === 3) ? 1 : 0.6), 1 + 0.05 * pk);
      G.rrect(ctx, -cw / 2, -62, cw, 124, 18, { fill, lw: 3, seed: 83 + i, stroke: C.line });
      he(ctx, String(n), 0, 14, { size: 64, w: 900, dir: 'ltr' }); he(ctx, lab, 0, 48, { size: 24, w: 700, color: C.muted, maxW: cw - 10 });
      ctx.restore();
    });
    S.REPLIES.forEach((r, i) => {
      const y = Y2 + 270 + i * 88, st = STAT_STYLE[r.status];
      popAt(ctx, t, r.t, W / 2, y, (c) => {
        G.rrect(c, -Wc / 2 + 30, -38, Wc - 60, 76, 18, { fill: st[2], lw: 3, seed: 90 + i, stroke: st[3] });
        he(c, `${st[0]} ${r.name}`, Wc / 2 - 56, 14, { size: 38, w: 800, align: 'right', maxW: 300 });
        he(c, st[1], 20, 12, { size: 30, w: 800, color: st[3] });
        if (r.status === 'yes') he(c, `מבוגרים ${r.adults}${r.kids ? ` · ילדים ${r.kids}` : ''}`, -Wc / 2 + 56, 12, { size: 28, w: 600, color: C.muted, align: 'left', maxW: 250 });
      }, { dur: 0.28, over: 1.8 });
    });
    popAt(ctx, t, ev.remind, W / 2, 1520, (c) => pill(c, 0, 0, '⏰ תזכורת למי שלא ענה', { size: 42, w: 900, bg: C.yellow, seed: 96 }), { rot: -0.03 });
  }

  // ================= 3. BRING LIST: CREATE + SHARE =================
  const itemRow = (ctx, x, y, w, text, { fill = '#f6f8fc', stroke = C.line, btn = 'מי מביא?', seed = 1 } = {}) => {
    G.rrect(ctx, x, y, w, 80, 20, { fill, lw: 3.5, seed, stroke });
    G.rrect(ctx, x + w - 24 - 520, y + 8, 520, 64, 12, { fill: '#fff', lw: 2.5, seed: seed + 100, stroke: '#cfd5e6' });
    he(ctx, text, x + w - 44, y + 52, { size: 38, w: 800, align: 'right' });
    if (btn) { G.rrect(ctx, x + 70, y + 10, 190, 60, 14, { fill: '#fff', lw: 3.5, seed: seed + 200, stroke: C.ink }); he(ctx, btn, x + 165, y + 52, { size: 30, w: 800 }); }
    he(ctx, '✕', x + 34, y + 52, { size: 30, w: 600, color: '#a9afc2', dir: 'ltr' });
  };
  function shotBring1(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const X = SAFE.x, Wc = SAFE.w, Y = 480;
    card(ctx, X, Y, Wc, 930, { seed: 101 });
    field(ctx, 'שם הרשימה', X + 30, Y + 54, Wc - 60, 'האירוע שלנו', '', { h: 70, seed: 102 });
    S.starterItems.forEach((it) => {
      popAt(ctx, t, it.t, W / 2, Y + 200 + it.i * 90 + 40, (c) => itemRow(c, -Wc / 2 + 30, -40, Wc - 60, it.text, { seed: 110 + it.i }), { dur: 0.22, over: 1.6 });
    });
    popAt(ctx, t, ev.sharePop, W / 2, 1500, (c) => {
      const press = t >= ev.share ? 1 - 0.07 * pulse(t, ev.share, 10) : 1;
      c.scale(press, press); pill(c, 0, 0, '📱 שליחה בוואטסאפ', { size: 48, w: 900, bg: GREEN_WA, fg: '#fff', padX: 64, seed: 130, h: 96 });
    }, { dur: 0.3 });
    UI.tap(ctx, W / 2 + 70, 1500, t, ev.share, { color: 'rgba(20,22,45,0.7)', size: 120 });
  }

  // ================= 4. BRING LIST: CLAIM =================
  function shotBring2(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const X = SAFE.x, Wc = SAFE.w, Y = 480;
    card(ctx, X, Y, Wc, 960, { seed: 141 });
    const n = S.taken(t), total = S.CLAIM_ITEMS.length;
    const cp = n ? pulse(t, S.claims.filter((c) => t >= c.t).slice(-1)[0].t, 10) : 0;
    ctx.save(); ctx.translate(X + Wc - 150, Y + 48); ctx.scale(1 + 0.08 * cp, 1 + 0.08 * cp);
    pill(ctx, 0, 0, `${n}/${total} נתפסו`, { size: 36, w: 900, bg: '#d9f2e3', fg: '#16653a', padX: 28, shadow: 4, seed: 142, h: 62 }); ctx.restore();
    S.CLAIM_ITEMS.forEach((text, i) => {
      const y = Y + 100 + i * 168, c = S.claims.find((q) => q.item === i);
      const done = c && t >= c.t, asking = c && c.ask !== undefined && t >= c.ask && !done;
      const fill = done ? '#e8f7ee' : '#f6f8fc', stroke = done ? '#a5d8b8' : C.line;
      G.rrect(ctx, X + 30, y, Wc - 60, 150, 24, { fill, lw: 3.5, seed: 150 + i, stroke });
      he(ctx, text, X + Wc - 62, y + 62, { size: 48, w: 900, align: 'right' });
      if (!done && !asking) {
        const press = c && t >= c.t - 0.3 ? 1 - 0.06 * pulse(t, c.t - 0.3, 10) : 1;
        ctx.save(); ctx.translate(X + 190, y + 55); ctx.scale(press, press);
        G.rrect(ctx, -140, -34, 280, 68, 16, { fill: '#fff', lw: 4, seed: 160 + i, stroke: C.ink }); he(ctx, '🙋 אני מביא/ה', 0, 12, { size: 31, w: 800 }); ctx.restore();
      }
      if (asking) {
        const typed = c.name.slice(0, Math.round(clamp((t - c.type[0]) / (c.type[1] - c.type[0])) * c.name.length));
        G.rrect(ctx, X + 60, y + 78, 520, 58, 12, { fill: '#fff', lw: 4, seed: 170, stroke: C.ink });
        he(ctx, typed || 'השם שלך', X + 560, y + 120, { size: 34, w: typed ? 800 : 500, color: typed ? C.ink : '#9aa1b8', align: 'right' });
        G.rrect(ctx, X + 600, y + 78, 200, 58, 12, { fill: '#169c4f', lw: 3.5, seed: 171, stroke: '#169c4f' }); he(ctx, '✓ אישור', X + 700, y + 120, { size: 32, w: 900, color: '#fff' });
      }
      if (done) {
        const a = clamp((t - c.t) / 0.25);
        he(ctx, `✅ ${c.name} מביא/ה את זה`, X + Wc - 62, y + 118, { size: 32, w: 800, color: '#16653a', align: 'right', alpha: a });
        confetti(ctx, t, c.t, X + 190, y + 60, { n: 14, seed: 20 + i, spread: 380 });
      }
    });
    S.claims.forEach((c) => {
      const y = Y + 100 + c.item * 168;
      if (c.ask !== undefined) UI.tap(ctx, X + 190, y + 55, t, c.ask, { color: 'rgba(207,47,86,0.8)', size: 110 });
      UI.tap(ctx, c.ask !== undefined ? X + 700 : X + 190, c.ask !== undefined ? y + 107 : y + 55, t, c.t - (c.ask !== undefined ? 0 : 0.3), { color: 'rgba(35,135,77,0.8)', size: 110 });
    });
    popAt(ctx, t, ev.final, W / 2, 1520, (c) => pill(c, 0, 0, 'בלי כפילויות, בלי הרשמה', { size: 44, w: 900, bg: C.yellow, seed: 180 }), { rot: -0.03 });
  }

  // ================= 5. גמד וענק =================
  function shotSecret(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const X = SAFE.x, Wc = SAFE.w, Y = 480;
    const out = ease.outCubic(clamp((t - ev.draw) / 0.25));
    if (out < 1) {
      ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(0, -out * 100);
      card(ctx, X, Y, Wc, 820, { seed: 191 });
      chipRow(ctx, S.MODES.slice(0, 1), Y + 64, t >= ev.mode ? 0 : -1, 192, { size: 32, color: C.purple });
      he(ctx, 'המשתתפים', X + Wc - 36, Y + 160, { size: 34, w: 800, align: 'right' });
      G.rrect(ctx, X + 36, Y + 180, Wc - 72, 380, 18, { fill: '#fbfcff', lw: 3, seed: 193, stroke: '#b9c0d4' });
      S.nameLines.forEach((nl) => { if (t >= nl.t) he(ctx, nl.name, X + Wc - 64, Y + 252 + nl.i * 84, { size: 46, w: 700, align: 'right' }); });
      he(ctx, `${S.nameLines.filter((q) => t >= q.t).length} משתתפים`, X + 64, Y + 520, { size: 28, w: 600, color: C.muted, align: 'left' });
      bigBtn(ctx, W / 2, Y + 690, '🎲 הגרלה עם קישור אישי לכל אחד', t, ev.draw, { bg: C.purple, size: 38, padX: 40, seed: 195 });
      UI.tap(ctx, X + Wc - 190, Y + 64, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 110 });
      UI.tap(ctx, W / 2 + 70, Y + 690, t, ev.draw, { color: 'rgba(20,22,45,0.7)', size: 120 });
      ctx.restore();
    }
    if (t >= ev.draw) {
      const pa = ease.outCubic(clamp((t - ev.draw - 0.1) / 0.3));
      ctx.save(); ctx.globalAlpha = pa; ctx.translate(0, (1 - pa) * 60);
      card(ctx, X, Y, Wc, 470, { seed: 201, fill: '#faf6ff' });
      he(ctx, 'ההגרלה בוצעה. אתם לא רואים מי הגריל את מי.', X + Wc - 40, Y + 66, { size: 33, w: 800, align: 'right', maxW: Wc - 80 });
      ctx.restore();
      S.resultRows.forEach((r) => {
        popAt(ctx, t, r.t, W / 2, Y + 160 + r.i * 80, (c) => {
          G.rrect(c, -Wc / 2 + 30, -34, Wc - 60, 68, 16, { fill: '#fff', lw: 3, seed: 210 + r.i, stroke: C.line });
          he(c, r.name, Wc / 2 - 60, 14, { size: 38, w: 800, align: 'right' });
          G.rrect(c, -Wc / 2 + 50, -24, 170, 48, 12, { fill: GREEN_WA, lw: 2.5, seed: 220 + r.i, stroke: GREEN_WA }); he(c, '📱 שליחה', -Wc / 2 + 135, 10, { size: 26, w: 800, color: '#fff' });
          G.rrect(c, -Wc / 2 + 236, -24, 70, 48, 12, { fill: '#fff', lw: 2.5, seed: 230 + r.i, stroke: C.ink }); he(c, '🔗', -Wc / 2 + 271, 11, { size: 28, w: 400 });
        }, { dur: 0.22, over: 1.6 });
      });
      // the guest's phone: personal link → reveal
      popAt(ctx, t, ev.reveal, W / 2, 1230, (c) => {
        card(c, -Wc / 2, -190, Wc, 380, { seed: 241, fill: '#fff' });
        tag(c, '📱 מה יואב רואה', Wc / 2 - 150, -190, '#e8f4ff', 242);
        if (t < ev.revealed) {
          he(c, 'שלום יואב!', 0, -60, { size: 58, w: 900 });
          he(c, 'ההגרלה מחכה לך. רק את/ה רואים את התוצאה.', 0, 4, { size: 30, w: 500, color: C.muted, maxW: Wc - 60 });
          const press = t >= ev.revealTap ? 1 - 0.07 * pulse(t, ev.revealTap, 10) : 1;
          c.save(); c.translate(0, 98); c.scale(press, press); pill(c, 0, 0, '🎁 גלו את מי הגרלתם', { size: 44, w: 900, bg: C.red, fg: '#fff', padX: 56, seed: 243 }); c.restore();
        } else {
          he(c, '🧙 אתם הגמד/ה של', 0, -70, { size: 46, w: 800 });
          he(c, 'מיכל', 0, 70, { size: 130, w: 900, color: C.purple });
        }
      }, { dur: 0.3, over: 1.6 });
      UI.tap(ctx, W / 2 + 70, 1328, t, ev.revealTap, { color: 'rgba(20,22,45,0.7)', size: 120 });
      confetti(ctx, t, ev.revealed, W / 2, 1230, { n: 70, seed: 11, spread: 1000 });
      popAt(ctx, t, ev.noSelf, W / 2, 1500, (c) => pill(c, 0, 0, 'אף אחד לא מגריל את עצמו', { size: 42, w: 900, bg: C.yellow, seed: 250 }), { rot: -0.03 });
    }
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 560); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    popAt(ctx, t, ev.logo, W / 2, 540, (c) => {
      const s = 320;
      c.rotate(Math.sin((t - ev.logo) * 3) * 0.03);
      c.fillStyle = C.ink; c.beginPath(); c.roundRect(-s / 2 + 12, -s / 2 + 14, s, s, 80); c.fill();
      c.save(); c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.clip(); if (IMG.logo) c.drawImage(IMG.logo, -s / 2, -s / 2, s, s); c.restore();
      c.strokeStyle = C.ink; c.lineWidth = 6; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 80); c.stroke();
    }, { dur: 0.45, over: 1.8 });
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 865 + (1 - wp) * 24, { size: 150, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'אישורי הגעה, מי מביא מה', W / 2, 975, { size: 56, w: 800, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    he(ctx, 'וגמד וענק', W / 2, 1050, { size: 56, w: 800, alpha: UI.fadeIn(t, L[0].t + 0.1, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 1170, (c) => pill(c, 0, 0, 'בחינם ובקלות', { size: 56, w: 900, bg: C.yellow, padX: 56, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 1305, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 64, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, '/rsvp  ·  /bring-list  ·  /secret-friend', W / 2, 1430, { size: 36, w: 600, color: C.muted, alpha: UI.fadeIn(t, L[3].t, 0.25), dir: 'ltr', fam: 'Fredoka' });
    confetti(ctx, t, ev.logo, W / 2, 560, { n: 80, seed: 9, spread: 1000 });
  }

  // ---------- the cut list ----------
  const SECTIONS = [
    { t0: 0, fn: shotHook },
    { t0: T(2), fn: shotRsvp1 },
    { t0: T(4), fn: shotRsvp2 },
    { t0: T(6), fn: shotBring1 },
    { t0: T(8), fn: shotBring2 },
    { t0: T(10), fn: shotSecret },
    { t0: T(12), fn: shotEnd },
  ];
  const SLIDE = 0.24;
  Studio.film({
    async init() {
      const L = (n) => Studio.loadImage(n).catch((e) => { console.error(String(e)); return null; });
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.bday = await L('img/birthday-girl.png');
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
