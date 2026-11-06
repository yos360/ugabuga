// THE FILM (16:9): an unseen passage as karaoke. The word being read wears a yellow marker that slides along the line,
// hard words get their Hebrew below as the reader reaches them, then two questions and the way to the site.
(function () {
  const U = globalThis.U, G = globalThis.G, UI = globalThis.UI, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { ev, words, pages, gloss, questions, readEnd, endStart, D, A } = S;
  const { clamp, lerp } = U;
  const W = G.W, H = G.H;

  const C = { paper: '#fffefa', ink: '#14162d', muted: '#70758f', red: '#cf2f56', blue: '#226bd7', green: '#23874d', yellow: '#fff4bb', marker: '#ffd23f', orange: '#e08a00', purple: '#8a4fd8', lilac: '#f4edff', blush: '#fff1f5', card: '#ffffff', line: '#e9e6f5' };
  UI.setTheme({ accent: C.red, accent2: C.blue, ok: C.green, ink: C.ink, muted: C.muted, app: C.paper });
  const IMG = {};
    const LANG_URL = `ugabuga.co.il/unseen/english/${D.slug}`;
  const fontOf = (size, w, fam = 'Heebo') => `${w} ${size}px "${fam}", "Noto Color Emoji", sans-serif`;
  function measure(ctx, s, size, w = 800, fam, dir = 'rtl') { ctx.save(); ctx.font = fontOf(size, w, fam); ctx.direction = dir; const mm = ctx.measureText(s).width; ctx.restore(); return mm; }
  function tx(ctx, s, x, y, { size = 60, w = 800, color = C.ink, align = 'center', alpha = 1, maxW, dir = 'rtl', fam } = {}) {
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(alpha);
    let sz = size;
    if (maxW) { const mw = measure(ctx, s, sz, w, fam, dir); if (mw > maxW) sz *= maxW / mw; }
    ctx.font = fontOf(sz, w, fam); ctx.direction = dir; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.restore();
  }
  const en = (ctx, s, x, y, o = {}) => tx(ctx, s, x, y, { dir: 'ltr', ...o });
  function card(ctx, x, y, w, h, { fill = C.card, r = 30, seed = 1, shadow = 10, lw = 4.5, stroke = C.ink } = {}) {
    if (shadow) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(x + shadow * 0.8, y + shadow, w, h, r); ctx.fill(); }
    G.rrect(ctx, x, y, w, h, r, { fill, lw, seed, stroke, amp: 1 });
  }
  function pill(ctx, cx, cy, s, { size = 40, w = 800, bg = C.yellow, fg = C.ink, padX = 30, seed = 3, shadow = 6, dir = 'rtl', fam } = {}) {
    const ww = measure(ctx, s, size, w, fam, dir) + padX * 2, hh = size * 1.75;
    card(ctx, cx - ww / 2, cy - hh / 2, ww, hh, { fill: bg, r: hh / 2, seed, shadow, lw: 4 });
    tx(ctx, s, cx, cy + size * 0.36, { size, w, color: fg, dir, fam });
    return ww;
  }
  function popAt(ctx, t, t0, cx, cy, fn, { dur = 0.3, over = 2 } = {}) {
    const p = UI.pop(t, t0, dur, over);
    if (p <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(p, p); fn(ctx); ctx.restore();
  }
  function dots(x, a) {
    x.fillStyle = `rgba(20,22,45,${a})`;
    for (let yy = 26; yy < H; yy += 42) for (let xx = 26; xx < W; xx += 42) { x.beginPath(); x.arc(xx, yy, 2.4, 0, Math.PI * 2); x.fill(); }
  }
  const bg = (ctx) => ctx.drawImage(Studio.cache('bg', (x) => { x.fillStyle = C.paper; x.fillRect(0, 0, W, H); dots(x, 0.07); }, { variants: 1 }), 0, 0, W, H);
  const heroBg = (ctx) => ctx.drawImage(Studio.cache('hero', (x) => {
    const g = x.createLinearGradient(W, 0, 0, H);
    g.addColorStop(0, C.lilac); g.addColorStop(0.55, C.blush); g.addColorStop(1, C.yellow);
    x.fillStyle = g; x.fillRect(0, 0, W, H); dots(x, 0.05);
  }, { variants: 1 }), 0, 0, W, H);
  function mascot(ctx, cx, cy, d, t, t0 = -1) {
    popAt(ctx, t, t0, cx, cy, (c) => {
      c.rotate(Math.sin(t * 2.4) * 0.03);
      c.save(); c.shadowColor = 'rgba(20,22,45,.3)'; c.shadowBlur = 20; c.shadowOffsetY = 10;
      if (IMG.logo) c.drawImage(IMG.logo, -d / 2, -d / 2, d, d);
      c.restore();
    }, { dur: 0.45 });
  }
  function wrapEn(ctx, s, size, w, maxW) {
    const lines = []; let cur = '';
    for (const p of s.split(' ')) { const n = cur ? `${cur} ${p}` : p; if (measure(ctx, n, size, w, undefined, 'ltr') > maxW && cur) { lines.push(cur); cur = p; } else cur = n; }
    if (cur) lines.push(cur);
    return lines;
  }

  // ---------- reading
  const FS = 66, LH = 112, LEFT = 120, RIGHT = W - 120, TOP = 280;
  const layouts = new Map();
  function layoutOf(ctx, pg) {
    if (layouts.has(pg.p)) return layouts.get(pg.p);
    const space = measure(ctx, ' ', FS, 600, undefined, 'ltr'), cells = {};
    let x = LEFT, line = 0, para = words[pg.idx[0]].p;
    for (const i of pg.idx) {
      const w = words[i], ww = measure(ctx, w.w, FS, 600, undefined, 'ltr');
      if (w.p !== para) { para = w.p; if (x > LEFT) { line++; x = LEFT; } }
      if (x + ww > RIGHT && x > LEFT) { line++; x = LEFT; }
      cells[i] = { x, ww, line };
      x += ww + space * 1.15;
    }
    // Buga sits from y=835: a page of six lines or more closes up so its last line stays clear of him.
    const L = { cells, lines: line + 1, lh: line ? Math.min(LH, (770 - TOP) / line) : LH };
    layouts.set(pg.p, L);
    return L;
  }
  function header(ctx, t) {
    en(ctx, D.title, 110, 118, { size: 52, w: 700, fam: 'Fredoka', align: 'left', color: C.blue });
    tx(ctx, `אנסין באנגלית · ${D.levelName}`, W - 110, 116, { size: 42, w: 800, align: 'right', color: C.ink });
    const u = clamp((t - A) / (readEnd - A));
    ctx.fillStyle = C.line; ctx.beginPath(); ctx.roundRect(110, 150, W - 220, 12, 6); ctx.fill();
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.roundRect(110, 150, Math.max(12, (W - 220) * u), 12, 6); ctx.fill();
  }
  function shotRead(ctx, t) {
    bg(ctx); header(ctx, t);
    let pi = 0;
    for (let k = 0; k < pages.length; k++) if (t >= pages[k].t0) pi = k;
    const pg = pages[pi], L = layoutOf(ctx, pg), fade = clamp((t - pg.t0) / 0.2);
    let act = -1;
    for (const i of pg.idx) if (t >= words[i].t0) act = i;
    const yOf = (line) => TOP + line * L.lh;
    ctx.save(); ctx.globalAlpha = fade;
    // the marker slides from the last word to this one, unless the line changed
    if (act >= 0) {
      const c = L.cells[act], p = L.cells[act - 1], u = clamp((t - words[act].t0) / 0.06), e = 1 - Math.pow(1 - u, 2);
      const same = p && p.line === c.line;
      const x = same ? lerp(p.x, c.x, e) : c.x, ww = same ? lerp(p.ww, c.ww, e) : c.ww;
      ctx.fillStyle = C.marker; ctx.beginPath(); ctx.roundRect(x - 12, yOf(c.line) - FS * 0.98, ww + 24, FS * 1.38, 14); ctx.fill();
    }
    for (const i of pg.idx) {
      const c = L.cells[i], w = words[i], done = i <= act;
      en(ctx, w.w, c.x, yOf(c.line), { size: FS, w: w.hard ? 800 : 600, align: 'left', color: done ? (w.hard ? C.blue : C.ink) : (w.hard ? '#7fa6e0' : C.muted) });
      if (w.hard) { ctx.fillStyle = done ? C.blue : '#7fa6e0'; ctx.fillRect(c.x, yOf(c.line) + 12, c.ww, 4); }
    }
    ctx.restore();
    // bottom band: the Hebrew of the hard word
    const g = gloss.filter((x) => t >= x.t0 && t < x.t1).pop();
    if (g) {
      popAt(ctx, t, g.t0, W / 2, 945, (c) => {
        const a = measure(c, g.en, 58, 800, undefined, 'ltr'), b = measure(c, g.he, 58, 900), eq = 90, ww = a + b + eq + 110;
        card(c, -ww / 2, -62, ww, 124, { fill: C.yellow, r: 34, seed: 500 + g.i });
        en(c, g.en, -ww / 2 + 50, 21, { size: 58, w: 800, align: 'left', color: C.blue });
        tx(c, '=', -ww / 2 + 50 + a + eq / 2, 19, { size: 58, w: 800, dir: 'ltr' });
        tx(c, g.he, ww / 2 - 50, 21, { size: 58, w: 900, align: 'right', color: C.red });
      }, { dur: 0.25 });
    }
    mascot(ctx, 160, 935, 200, t);
    tx(ctx, 'ugabuga.co.il', W - 110, 1010, { size: 34, w: 500, fam: 'Fredoka', align: 'right', dir: 'ltr', color: C.muted });
  }

  // ---------- title and questions
  function shotTitle(ctx, t) {
    heroBg(ctx);
    mascot(ctx, 1450, 560, 660, t, 0.1);
    popAt(ctx, t, ev.title, 660, 300, (c) => pill(c, 0, 0, `אנסין באנגלית · ${D.levelName}`, { size: 52, bg: C.blue, fg: '#fff', w: 900, seed: 11 }));
    // Buga's circle starts at x=1120: a long title goes on two lines instead of running behind it.
    popAt(ctx, t, ev.sub, 660, 500, (c) => {
      const fit = 880, title = { w: 700, fam: 'Fredoka', maxW: fit };
      if (measure(c, D.title, 118, 700, 'Fredoka', 'ltr') <= fit) return en(c, D.title, 0, 50, { size: 118, ...title });
      const words = D.title.split(' ');
      let cut = 1, best = Infinity;
      for (let i = 1; i < words.length; i++) {
        const gap = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
        if (gap < best) { best = gap; cut = i; }
      }
      en(c, words.slice(0, cut).join(' '), 0, -10, { size: 104, ...title });
      en(c, words.slice(cut).join(' '), 0, 106, { size: 104, ...title });
    });
    popAt(ctx, t, ev.ask, 660, 720, (c) => pill(c, 0, 0, 'קוראים יחד, מילה אחר מילה', { size: 54, w: 800, bg: C.yellow, seed: 12 }));
  }
  const LET = ['a', 'b', 'c', 'd'];
  function shotQ(q) {
    return (ctx, t) => {
      bg(ctx);
      tx(ctx, `שאלה ⁦${q.i + 1}⁩ מתוך ⁦${questions.length}⁩`, W - 110, 120, { size: 46, w: 900, align: 'right', color: C.red });
      let qs = 62, lines = wrapEn(ctx, q.q, qs, 700, W - 460);
      while (lines.length > 3 && qs > 40) { qs -= 4; lines = wrapEn(ctx, q.q, qs, 700, W - 460); }
      const qh = qs * 1.32;
      lines.forEach((l, i) => en(ctx, l, 110, 240 + i * qh, { size: qs, w: 700, align: 'left' }));
      const top = Math.max(400, 260 + lines.length * qh), cw = (W - 260) / 2, ch = 170, up = t >= q.up && !q.open;
      q.options.forEach((o, i) => {
        const x = 110 + (i % 2) * (cw + 40), y = top + Math.floor(i / 2) * (ch + 34), good = up && i === q.answer;
        popAt(ctx, t, q.t0 + 0.2 + i * 0.1, x + cw / 2, y + ch / 2, (c) => {
          c.globalAlpha = up && !good ? 0.45 : 1;
          card(c, -cw / 2, -ch / 2, cw, ch, { fill: good ? '#dff5e6' : C.card, seed: 600 + i, r: 26, shadow: up && !good ? 0 : 7 });
          en(c, `${LET[i]}.`, -cw / 2 + 30, 16, { size: 46, w: 800, align: 'left', color: C.blue });
          let os = 42, ls = wrapEn(c, o, os, 600, cw - 130);
          while (ls.length > 3 && os > 28) { os -= 3; ls = wrapEn(c, o, os, 600, cw - 130); }
          ls.forEach((l, k) => en(c, l, -cw / 2 + 96, 15 + (k - (ls.length - 1) / 2) * os * 1.33, { size: os, w: 600, align: 'left' }));
        }, { dur: 0.25 });
      });
      const cur = q.ticks.filter((k) => t >= k.t).pop();
      if (cur && t < q.up) {
        const cx = W - 190, cy = 300, r = 88, frac = clamp(1 - (t - q.ticks[0].t) / q.ticks.length), hot = cur.n <= 3;
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx + 6, cy + 8, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = hot ? C.red : C.blue; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, r - 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); ctx.stroke();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        tx(ctx, String(cur.n), cx, cy + 32, { size: 88, w: 900, dir: 'ltr', color: hot ? C.red : C.ink });
      }
      if (q.open && t >= q.up) popAt(ctx, t, q.up, W / 2, 985, (c) => pill(c, 0, 0, '✍️ מה התשובה שלכם? כתבו בתגובות', { size: 50, w: 900, bg: C.red, fg: '#fff', seed: 640 }));
    };
  }
  function shotEnd(ctx, t) {
    heroBg(ctx);
    mascot(ctx, 1570, 540, 520, t, ev.end);
    popAt(ctx, t, ev.end + 0.1, 680, 215, (c) => { card(c, -560, -105, 1120, 210, { fill: C.card, seed: 701 }); tx(c, 'המבחן המלא והתשובות באתר', 0, -22, { size: 54, w: 800, maxW: 1040 }); tx(c, LANG_URL, 0, 58, { size: 42, w: 600, fam: 'Fredoka', dir: 'ltr', color: C.blue, maxW: 1040 }); });
    popAt(ctx, t, ev.site, 680, 450, (c) => { card(c, -560, -95, 1120, 190, { fill: C.red, seed: 703 }); tx(c, '🔔 כל יום קטע אנסין חדש', 0, -14, { size: 62, w: 900, color: '#fff', maxW: 1040 }); tx(c, 'כל יום לכיתה אחרת. הירשמו לערוץ', 0, 60, { size: 46, w: 700, color: '#fff', maxW: 1040 }); });
    popAt(ctx, t, ev.sub2, 680, 690, (c) => { card(c, -560, -95, 1120, 190, { fill: C.yellow, seed: 705 }); tx(c, 'מורים והורים, צריכים נושא מסוים?', 0, -14, { size: 54, w: 900, maxW: 1040 }); tx(c, 'כתבו לנו בתגובות ונכין', 0, 60, { size: 46, w: 700, color: C.blue, maxW: 1040 }); });
  }

  const SECTIONS = [
    { t0: 0, fn: shotTitle }, { t0: A - 0.3, fn: shotRead },
    ...questions.map((q) => ({ t0: q.t0, fn: shotQ(q) })),
    { t0: endStart, fn: shotEnd },
  ];
  const SLIDE = 0.28;
  Studio.film({
    async init() {
      await Studio.loadFont('Heebo', 'fonts/Heebo.ttf', '100 900');
      await Studio.loadFont('Fredoka', 'fonts/Fredoka.ttf', '300 700');
      IMG.logo = await Studio.loadImage('img/mascot.png').catch(() => null);
    },
    draw(ctx, t) {
      let i = 0;
      for (let k = 0; k < SECTIONS.length; k++) if (t >= SECTIONS[k].t0) i = k;
      const sec = SECTIONS[i], u = i > 0 ? clamp((t - sec.t0) / SLIDE) : 1;
      if (u < 1) {
        const e = 1 - Math.pow(1 - u, 4);
        ctx.save(); ctx.translate(-e * W, 0); SECTIONS[i - 1].fn(ctx, sec.t0 - 0.001); ctx.restore();
        ctx.save(); ctx.translate((1 - e) * W, 0); sec.fn(ctx, t); ctx.restore();
      } else sec.fn(ctx, t);
    },
    post: { paper: 0.15, vignette: 0.05, grain: 0.012 },
    fadeOut: 0.8,
  });
})();
