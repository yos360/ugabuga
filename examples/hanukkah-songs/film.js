// THE FILM (9:16) — "איזה שיר חנוכה מסתתר כאן?": the Hanukkah songs page in the site own look (paper + dot grid,
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


  const BOX = (ctx, x, y, w, h, o) => card(ctx, x, y, w, h, o);
  // a chip (rounded pill) at center x,y with given fill
  function chip(ctx, cx, cy, w, h, s, { on = false, color = C.blue, size = 34, seed = 1 } = {}) {
    G.rrect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2, { fill: on ? color : '#fff', lw: on ? 4.5 : 3, seed, stroke: on ? C.ink : C.line });
    he(ctx, s, cx, cy + size * 0.36, { size, w: 800, color: on ? '#fff' : C.ink, maxW: w - 24 });
  }

  // the mascot (the owner's logo character); falls back to the old logo
  function mascot(ctx, cx, cy, d, t, t0) {
    popAt(ctx, t, t0, cx, cy, (c) => {
      c.rotate(Math.sin((t - t0) * 3) * 0.04);
      c.save(); c.shadowColor = 'rgba(20,22,45,.35)'; c.shadowBlur = 24; c.shadowOffsetY = 12;
      if (IMG.logo) c.drawImage(IMG.logo, -d / 2, -d / 2, d, d);
      c.restore();
    }, { dur: 0.45, over: 1.8 });
  }



  // ---- helpers of this reel ----
  // an answer row of the "guess the song" game: ink-outlined card, state = '' | 'right'
  function optRow(c, x, y, w, h, label, { state = '', size = 42, seed = 1, num = 0 } = {}) {
    const fill = state === 'right' ? '#bbf7d0' : '#fff';
    card(c, x - w / 2, y - h / 2, w, h, { fill, r: Math.min(30, h / 2.8), seed, shadow: 7, lw: state === 'right' ? 6 : 4.5, stroke: state === 'right' ? C.green : C.ink });
    const tx = num ? x + w / 2 - 112 : x + w / 2 - 34;
    he(c, label, tx, y + size * 0.36, { size, w: 800, color: C.ink, align: 'right', maxW: w - (num ? 150 : 70) });
    if (num) { c.fillStyle = C.red; c.beginPath(); c.arc(x + w / 2 - 56, y, h * 0.3, 0, Math.PI * 2); c.fill(); he(c, String(num), x + w / 2 - 56, y + h * 0.3 * 0.62, { size: h * 0.42, w: 900, color: '#fff', dir: 'ltr' }); }
  }

  // ================= HOOK =================
  function shotHook(ctx, t) {
    heroBg(ctx);
    popAt(ctx, t, ev.title, W / 2, 270, (c) => pill(c, 0, 0, '🎵 שירי חנוכה לילדים', { size: 40, w: 800, bg: C.purple, fg: '#fff', padX: 40, seed: 12 }), { rot: -0.03, dur: 0.3 });
    popAt(ctx, t, ev.q1, W / 2, 430, (c) => he(c, 'איזה שיר חנוכה', 0, 0, { size: 104, w: 900, maxW: SAFE.w }), { rot: -0.03 });
    popAt(ctx, t, ev.q1 + BEAT * 0.5, W / 2, 565, (c) => he(c, 'מסתתר כאן? 🤔', 0, 0, { size: 112, w: 900, color: C.red, maxW: SAFE.w }), { rot: 0.02 });
    popAt(ctx, t, ev.q2, W / 2, 790, (c) => {
      card(c, -440, -125, 880, 250, { fill: '#fff', r: 40, seed: 14, shadow: 12, lw: 5 });
      he(c, S.HOOK_CLUE, 0, 48, { size: 124, w: 400 });
    }, { rot: -0.015, dur: 0.3 });
    S.hookOpts.forEach((o) => {
      popAt(ctx, t, o.t, W / 2, 1040 + o.i * 128, (c) => optRow(c, 0, 0, 880, 112, S.HOOK_OPTS[o.i], { size: 46, seed: 20 + o.i, num: o.i + 1 }), { rot: [-0.008, 0.008, -0.006, 0.008][o.i], dur: 0.25, over: 1.6 });
    });
    const sp = clamp((t - ev.free) / 0.18);
    if (sp > 0) {
      const sc = lerp(1.9, 1, ease.outCubic(sp)) - 0.06 * pulse(t, ev.free + 0.18, 12);
      ctx.save(); ctx.translate(655, 1630); ctx.rotate(-0.04); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp * 2);
      pill(ctx, 0, 0, 'כתבו מספר בתגובות 👇', { size: 54, w: 900, bg: C.yellow, padX: 36 });
      ctx.restore();
    }
    mascot(ctx, 185, 1680 - (t > ev.q2 + 0.45 ? hop(t, 12) : 0), 270, t, ev.q2);
  }

  // ================= 1. CHOOSE BY AGE =================
  function shotAud(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[0]);
    const A = S.AUD;
    S.AGES.forEach((lb, i) => {
      const on = i === S.AUD_PICK && t >= ev.pick;
      popAt(ctx, t, A[i].t, W / 2, 590 + i * 125, (c) => { const pr = on ? 1 + 0.04 * pulse(t, ev.pick, 10) : 1; c.scale(pr, pr); chip(c, 0, 0, 800, 104, lb, { on, color: C.blue, size: 46, seed: 30 + i }); }, { dur: 0.25, over: 1.6, rot: [0.008, -0.008, 0.006][i] });
    });
    UI.tap(ctx, W / 2 + 120, 715, t, ev.pick, { color: 'rgba(34,107,215,0.8)', size: 120 });
    popAt(ctx, t, A[3].t, W / 2, 1130, (c) => {
      card(c, -420, -190, 840, 380, { fill: '#fff', r: 30, seed: 33, shadow: 10, lw: 4.5 });
      he(c, '🏺', 340, -40, { size: 110, w: 400 });
      he(c, 'כד קטן', 250, -62, { size: 70, w: 900, align: 'right', maxW: 500 });
      he(c, 'מילים: אהרן אשמן · לחן: יואל ולבה', 250, 0, { size: 34, w: 600, align: 'right', color: C.muted, maxW: 560 });
      chip(c, 170, 78, 330, 60, '🧸 לגן ולפעוטות', { size: 32, seed: 34 });
      he(c, '▶️ חיפוש ביוטיוב', 370, 160, { size: 38, w: 800, align: 'right', color: C.blue });
    }, { dur: 0.25, over: 1.4, rot: 0.006 });
    popAt(ctx, t, S.pills[0], W / 2, 1420, (c) => pill(c, 0, 0, 'מ״סביבון סוב סוב סוב״ ועד ״מעוז צור״', { size: 42, w: 900, bg: C.yellow, seed: 66 }), { rot: -0.02 });
    popAt(ctx, t, S.pills[1], W / 2, 1540, (c) => pill(c, 0, 0, 'להורים, לגננות ולמורים 💛', { size: 44, w: 900, bg: C.lilac, seed: 67 }), { rot: 0.02 });
  }

  // ================= 2. BLESSINGS + MAOZ TZUR =================
  function shotTopics(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[1]);
    const BL = [['להדליק נר חנוכה', 'בכל ערב', C.blue], ['שעשה ניסים לאבותינו', 'בכל ערב', C.blue], ['שהחיינו', 'רק בערב הראשון', C.red]];
    BL.forEach(([lb, when, col], i) => {
      popAt(ctx, t, S.TOPICS[i].t, W / 2, 575 + i * 120, (c) => {
        card(c, -420, -48, 840, 96, { fill: '#fff', r: 28, seed: 40 + i, shadow: 7, lw: 4 });
        he(c, 'ברכה: ' + lb, 385, 14, { size: 40, w: 800, align: 'right', maxW: 520 });
        G.rrect(c, -392, -30, 232, 60, 30, { fill: col, lw: 3.5, seed: 44 + i, stroke: C.ink });
        he(c, when, -276, 11, { size: 30, w: 800, color: '#fff', maxW: 210 });
      }, { dur: 0.22, over: 1.5, rot: [0.008, -0.008, 0.008][i] });
    });
    popAt(ctx, t, ev.reasonCard, W / 2, 1110, (c) => {
      card(c, -420, -170, 840, 340, { fill: '#fffdf7', r: 28, seed: 50, shadow: 9, lw: 4.5 });
      he(c, 'מעוז צור — הבית הראשון', 390, -108, { size: 34, w: 700, color: C.muted, align: 'right' });
      he(c, 'מָעוֹז צוּר יְשׁוּעָתִי, לְךָ נָאֶה לְשַׁבֵּחַ,', 0, -20, { size: 42, w: 700, maxW: 780 });
      he(c, 'תִּכּוֹן בֵּית תְּפִלָּתִי, וְשָׁם תּוֹדָה נְזַבֵּחַ.', 0, 52, { size: 42, w: 700, maxW: 780 });
      he(c, 'לְעֵת תָּכִין מַטְבֵּחַ מִצָּר הַמְנַבֵּחַ…', 0, 124, { size: 42, w: 700, color: C.muted, maxW: 780 });
    }, { dur: 0.3, over: 1.4, rot: -0.008 });
    popAt(ctx, t, ev.reasonCard + 0.35, W / 2, 1375, (c) => { const pr = t >= ev.topic ? 1 + 0.05 * pulse(t, ev.topic, 10) : 1; c.scale(pr, pr); pill(c, 0, 0, '🖨️ הדפסת דף ההדלקה', { size: 52, w: 900, bg: C.red, fg: '#fff', padX: 60, seed: 52 }); }, { rot: 0.012 });
    UI.tap(ctx, W / 2 + 60, 1390, t, ev.topic, { color: 'rgba(207,47,86,0.8)', size: 120 });
    popAt(ctx, t, S.pills[2], W / 2, 1500, (c) => pill(c, 0, 0, 'הבית החמישי — בית החנוכה 🕎', { size: 42, w: 900, bg: C.yellow, seed: 66 }), { rot: -0.02 });
    popAt(ctx, t, S.pills[3], W / 2, 1605, (c) => pill(c, 0, 0, 'ברכה שלישית — רק בערב הראשון', { size: 40, w: 900, bg: C.lilac, seed: 67 }), { rot: 0.02 });
  }

  // the game board: count of 15, clue, hint, four answers (rightIdx lights up green when tR > 0)
  function board(c, { count, score, clue, hint, options, rightIdx, tR, chipP, msg, msgAlpha }) {
    card(c, -440, -430, 880, 790, { fill: '#fff9d9', r: 36, seed: 70, shadow: 11, lw: 4.5 });
    he(c, 'חידה ⁦' + count + '⁩ מתוך ⁦15⁩ · נקודות: ⁦' + score + '⁩', 410, -372, { size: 30, w: 800, align: 'right' });
    he(c, clue, 0, -250, { size: 116, w: 400 });
    he(c, '💡 רמז: ' + hint, 0, -150, { size: 36, w: 700, maxW: 800 });
    options.forEach((txt, i) => {
      const right = i === rightIdx && tR > 0, sc = right ? 1 + 0.05 * Math.sin(Math.PI * clamp(tR)) : 1;
      c.save(); c.translate(0, -78 + i * 96); c.scale(sc, sc); optRow(c, 0, 0, 800, 84, txt, { state: right ? 'right' : '', size: 40, seed: 72 + i }); c.restore();
    });
    if (chipP > 0) { c.save(); c.globalAlpha *= clamp(chipP * 2); chip(c, 0, 300, 400, 66, '👀 גלו את התשובה', { size: 36, seed: 76, color: C.purple }); c.restore(); }
    he(c, msg, 0, 318, { size: 44, w: 800, alpha: msgAlpha, maxW: 800 });
  }

  // ================= 3. GUESS THE SONG (reveal) =================
  function shotModes(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[2]);
    const M0 = S.MODES, tR = clamp((t - ev.mode) / 0.4);
    popAt(ctx, t, M0[0].t, W / 2, 910, (c) => board(c, {
      count: 1, score: 0, clue: '🙋 🕎 🏠', hint: 'מישהו מספר בגאווה מה יש לו בבית',
      options: ['נר לי', 'חנוכייה לי יש', 'חנוכה, חנוכה, חג יפה כל כך', 'מעוז צור'], rightIdx: 1, tR,
      chipP: tR > 0 ? 0 : clamp((t - M0[1].t) / 0.25), msg: tR > 0 ? 'התשובה: חנוכייה לי יש' : '', msgAlpha: clamp(tR * 2),
    }), { dur: 0.3, over: 1.35, rot: -0.008 });
    UI.tap(ctx, W / 2 + 40, 1210, t, ev.mode, { color: 'rgba(138,79,216,0.8)', size: 120 });
    popAt(ctx, t, M0[2].t, W / 2, 1425, (c) => pill(c, 0, 0, 'חידת אימוג׳י — ואפשר גם לבקש רמז', { size: 42, w: 900, bg: C.yellow, seed: 67 }), { rot: -0.02 });
    popAt(ctx, t, M0[3].t, W / 2, 1540, (c) => pill(c, 0, 0, '15 חידות בכל סיבוב 🎲', { size: 42, w: 900, bg: C.lilac, seed: 68 }), { rot: 0.02 });
  }

  // ================= 4. PICK AN ANSWER =================
  function shotPlay(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[3]);
    const rightP = clamp((t - ev.ans) / 0.4);
    popAt(ctx, t, S.ROWS[0].t, W / 2, 910, (c) => board(c, {
      count: 2, score: rightP > 0 ? 1 : 0, clue: '🪨 🛡️ 🙏 🎶', hint: 'סלע חזק ומגן — פיוט עתיק',
      options: ['מעוז צור', 'מי ידליק', 'אנו נושאים לפידים', 'לביבות'], rightIdx: 0, tR: rightP,
      chipP: 0, msg: rightP > 0 ? '✅ נכון! התשובה: מעוז צור' : '', msgAlpha: clamp(rightP * 2),
    }), { dur: 0.3, over: 1.35, rot: -0.008 });
    UI.tap(ctx, W / 2 + 160, 840, t, ev.go, { color: 'rgba(224,138,0,0.8)', size: 110 });
    confetti(ctx, t, ev.ans, W / 2, 1000, { n: 55, seed: 6, spread: 800 });
    popAt(ctx, t, S.pills[4], W / 2, 1425, (c) => pill(c, 0, 0, 'מי שמנחש — מתחיל לשיר! 🎤', { size: 44, w: 900, bg: C.yellow, seed: 85 }), { rot: -0.02 });
    popAt(ctx, t, S.pills[5], W / 2, 1540, (c) => pill(c, 0, 0, 'מושלם למעגל בגן ולמסיבה בכיתה 👥', { size: 40, w: 900, bg: C.lilac, seed: 88 }), { rot: 0.02 });
  }

  // ================= 5. PARTY LIST =================
  function shotPrint(ctx, t) {
    bg(ctx); header(ctx, t, S.steps[4]);
    const I = S.sheetItems;
    popAt(ctx, t, I[0].t, W / 2, 595, (c) => {
      card(c, -420, -52, 840, 104, { fill: '#fff', r: 28, seed: 95, shadow: 8, lw: 4 });
      he(c, 'שם הגן או הכיתה:', 385, 14, { size: 38, w: 800, align: 'right' });
      G.rrect(c, -392, -34, 440, 68, 18, { fill: '#f5f6fb', lw: 3, seed: 96, stroke: C.line });
      he(c, 'גן רימון', 20, 14, { size: 40, w: 700, align: 'right', maxW: 400 });
    }, { dur: 0.28, over: 1.4, rot: 0.006 });
    popAt(ctx, t, I[1].t, W / 2, 740, (c) => {
      chip(c, 215, 0, 400, 84, '🧸 שירים לגן (⁦12⁩)', { on: true, color: C.blue, size: 38, seed: 97 });
      chip(c, -215, 0, 400, 84, '🎵 כל השירים (⁦15⁩)', { size: 38, seed: 98 });
    }, { dur: 0.25, over: 1.5, rot: -0.006 });
    popAt(ctx, t, I[2].t, W / 2, 1065, (c) => {
      card(c, -390, -215, 780, 430, { fill: '#fff', r: 24, seed: 100, shadow: 11, lw: 4.5 });
      he(c, '🕎 מסיבת חנוכה · גן רימון', 0, -160, { size: 30, w: 700, color: C.muted, maxW: 700 });
      he(c, 'שירי חנוכה למסיבה', 0, -92, { size: 56, w: 900, maxW: 700 });
      he(c, 'סמנו ✓ ליד כל שיר ששרנו', 0, -40, { size: 32, w: 600, color: C.muted, maxW: 700 });
      [['סביבון סוב סוב סוב', 'מילים: לוין קיפניס · לחן: לחן עממי'], ['באנו חושך לגרש', 'מילים: שרה לוי־תנאי · לחן: עמנואל עמירן'], ['כד קטן', 'מילים: אהרן אשמן · לחן: יואל ולבה']].forEach(([tt, cr], i) => {
        const y = 24 + i * 68;
        c.fillStyle = C.line; c.fillRect(-350, y + 36, 700, 2);
        he(c, '☐', 350, y + 12, { size: 40, w: 700, align: 'right', dir: 'ltr' });
        he(c, (i + 1) + '. ' + tt, 295, y + 12, { size: 36, w: 800, align: 'right', maxW: 290 });
        he(c, cr, -350, y + 10, { size: 22, w: 500, color: C.muted, align: 'left', maxW: 300 });
      });
    }, { dur: 0.32, over: 1.3, rot: -0.008 });
    if (t > I[3].t) checkMark(ctx, W / 2 + 350, 1065 + 24 + 4, 24 * ease.outBack(clamp((t - I[3].t) / 0.25), 1.6), clamp((t - I[3].t) / 0.35));
    popAt(ctx, t, ev.printBtn, W / 2, 1385, (c) => pill(c, 0, 0, '🖨️ הדפסת הרשימה', { size: 64, w: 900, bg: C.green, fg: '#fff', padX: 70, seed: 112 }), { rot: -0.04, dur: 0.35 });
    confetti(ctx, t, ev.printBtn, W / 2, 1375, { n: 70, seed: 8, spread: 900 });
    popAt(ctx, t, S.extras[0].t, W / 2, 1505, (c) => pill(c, 0, 0, 'כל השירים ושמות היוצרים בדף אחד', { size: 40, w: 900, bg: C.yellow, seed: 67 }), { rot: 0.02 });
    popAt(ctx, t, S.extras[1].t, W / 2, 1610, (c) => pill(c, 0, 0, 'לתלות ליד הפסנתר 🎹', { size: 40, w: 900, bg: C.lilac, seed: 68 }), { rot: -0.02 });
  }

  // the four numbered options again, small, under the question
  function endOpts(ctx, t, t0) {
    S.HOOK_OPTS.forEach((lb, i) => {
      const x = 755 - (i % 2) * 435, y = 1325 + Math.floor(i / 2) * 135;
      popAt(ctx, t, t0 + i * 0.06, x, y, (c) => {
        card(c, -205, -55, 410, 110, { fill: '#fff', r: 26, seed: 150 + i, shadow: 6, lw: 4 });
        const ls = wrap(c, lb, 34, 270, 800, 2);
        ls.forEach((ln, k) => he(c, ln, 125, 12 + (k - (ls.length - 1) / 2) * 42, { size: 34, w: 800, align: 'right', maxW: 270 }));
        c.fillStyle = C.red; c.beginPath(); c.arc(168, 0, 27, 0, Math.PI * 2); c.fill();
        he(c, String(i + 1), 168, 13, { size: 36, w: 900, color: '#fff', dir: 'ltr' });
      }, { dur: 0.22, over: 1.5 });
    });
  }

  // ================= END =================
  function shotEnd(ctx, t) {
    heroBg(ctx);
    ctx.save(); ctx.translate(W / 2, 440); ctx.rotate((t - ev.logo) * 0.3); ctx.globalAlpha = 0.16 * UI.fadeIn(t, ev.logo, 0.3);
    for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? '#ffbf3f' : '#7cc3ff'; const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 900, Math.sin(a0) * 900); ctx.lineTo(Math.cos(a1) * 900, Math.sin(a1) * 900); ctx.fill(); }
    ctx.restore();
    mascot(ctx, W / 2, 430, 330, t, ev.logo);
    const wp = UI.fadeIn(t, ev.logo + 0.15, 0.25);
    he(ctx, 'עוגה בוגה', W / 2, 710 + (1 - wp) * 24, { size: 130, w: 900, alpha: wp });
    const L = S.endLines;
    he(ctx, 'שירי חנוכה לילדים ולכל המשפחה', W / 2, 790, { size: 50, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[0].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[1].t, W / 2, 870, (c) => pill(c, 0, 0, 'חינם, בלי הרשמה', { size: 44, w: 900, bg: C.yellow, seed: 190 }), { rot: -0.03 });
    popAt(ctx, t, L[2].t, W / 2, 970, (c) => pill(c, 0, 0, 'ugabuga.co.il', { size: 62, w: 600, bg: C.blue, fg: '#fff', padX: 50, dir: 'ltr', fam: 'Fredoka', seed: 191 }));
    he(ctx, 'חפשו באתר: שירי חנוכה 🔎', W / 2, 1065, { size: 38, w: 800, color: C.ink, alpha: UI.fadeIn(t, L[3].t, 0.25), maxW: SAFE.w });
    popAt(ctx, t, L[4].t, W / 2, 1170, (c) => pill(c, 0, 0, '✍️ איזה שיר זה? 🌑 ➡️ 🚪 💡', { size: 50, w: 900, bg: C.red, fg: '#fff', padX: 40, seed: 192 }), { rot: 0.025, dur: 0.35 });
    endOpts(ctx, t, L[4].t + 0.25);
    popAt(ctx, t, L[4].t + 0.7, W / 2, 1625, (c) => pill(c, 0, 0, 'כתבו מספר בתגובות 👇', { size: 46, w: 900, bg: C.yellow, padX: 40, seed: 193 }), { rot: -0.02, dur: 0.35 });
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
      IMG.boy = await L('img/home-detective-boy.png');
      IMG.girl = await L('img/home-schoolgirl.png');
      IMG.logo = (await L('img/mascot.png')) || (await L('img/logo.svg'));
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
