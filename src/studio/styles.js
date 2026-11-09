// Style presets for the photo studio: 6 per event (wedding, bar/bat mitzvah, birthday), from the
// 2026-11 research (docs in the shared notes). Each style = colours, a font pair, decorations and how
// photos are framed. Decorations are small paths in a 100×100 box, drawn with Path2D.

export const FONTS = [
  ['Heebo', 'נקי'], ['Assistant', 'עדין'], ['Rubik', 'עגול-חזק'], ['Frank Ruhl Libre', 'קלאסי'], ['David Libre', 'ספרותי'],
  ['Bellefair', 'אלגנטי'], ['Suez One', 'כותרת'], ['Secular One', 'בולט'], ['Karantina', 'מגזין'], ['Varela Round', 'רך'],
  ['Amatic SC', 'כתב יד'], ['KtavYad', 'כתב יד 2'], ['Fredoka', 'ילדותי'], ['Stam', 'סת״ם'],
]

// mode: fill | stroke (lw = stroke width in box units)
export const DECOR = {
  heart: { d: 'M50 88C20 66 4 48 4 30 4 16 15 6 28 6c10 0 18 6 22 14 4-8 12-14 22-14 13 0 24 10 24 24 0 18-16 36-46 58z', mode: 'fill', label: 'לב' },
  star: { d: 'M50 4l13 30 33 3-25 21 8 32-29-17-29 17 8-32L4 37l33-3z', mode: 'fill', label: 'כוכב' },
  davidStar: { d: 'M50 6L90 74H10zM50 94L10 26H90z', mode: 'stroke', lw: 6, label: 'מגן דוד' },
  sparkle: { d: 'M50 2C54 38 62 46 98 50 62 54 54 62 50 98 46 62 38 54 2 50 38 46 46 38 50 2z', mode: 'fill', label: 'נצנוץ' },
  corner: { d: 'M6 94V40Q6 6 40 6H94M18 94V44Q18 18 44 18H94M30 30m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0', mode: 'stroke', lw: 2.4, label: 'פינה מעוטרת' },
  branch: { d: 'M8 92Q40 60 92 8M30 70q-14-4-18-16 14 0 18 16zM30 70q4-14 16-18 0 14-16 18zM50 50q-14-4-18-16 14 0 18 16zM50 50q4-14 16-18 0 14-16 18zM70 30q-14-4-18-16 14 0 18 16zM70 30q4-14 16-18 0 14-16 18z', mode: 'stroke', lw: 2.6, label: 'ענף זית' },
  leaf: { d: 'M10 90C10 40 40 10 90 10 90 60 60 90 10 90zM10 90L70 30', mode: 'stroke', lw: 3, label: 'עלה' },
  balloon: { d: 'M50 6C30 6 18 22 18 40c0 20 16 34 32 38-3 3-4 6-1 7 3 1 4-4 4-7 16-4 29-18 29-38C82 22 70 6 50 6zM51 85q-6 6 2 12', mode: 'fill', label: 'בלון' },
  cloud: { d: 'M24 78C10 78 4 68 4 60s8-17 18-17c2-14 13-24 27-24 13 0 23 8 27 20 11 0 20 9 20 20S87 78 76 78z', mode: 'fill', label: 'ענן' },
  moon: { d: 'M62 6A44 44 0 1 0 94 70 36 36 0 1 1 62 6z', mode: 'fill', label: 'ירח' },
  sun: { d: 'M50 30a20 20 0 1 0 0.1 0zM50 2v14M50 84v14M2 50h14M84 50h14M16 16l10 10M74 74l10 10M84 16L74 26M26 74L16 84', mode: 'stroke', lw: 5, label: 'שמש' },
  arch: { d: 'M10 96V50a40 40 0 0 1 80 0v46M22 96V52a28 28 0 0 1 56 0v44M34 96V54a16 16 0 0 1 32 0v42', mode: 'stroke', lw: 5, label: 'קשת' },
  confetti: { d: 'M10 12h8v8h-8zM40 6l6 4-4 6-6-4zM74 14a4 4 0 1 0 .1 0zM20 44l8 2-2 8-8-2zM60 40h6v10h-6zM86 50a5 5 0 1 0 .1 0zM12 80a4 4 0 1 0 .1 0zM44 72l7 3-3 7-7-3zM78 84h9v6h-9z', mode: 'fill', label: 'קונפטי' },
  stripes: { d: 'M0 30h100v6H0zM0 42h100v14H0zM0 62h100v6H0z', mode: 'fill', label: 'פסי טלית' },
  ball: { d: 'M50 4a46 46 0 1 0 .1 0zM50 30l19 14-7 22H38l-7-22z', mode: 'stroke', lw: 4, label: 'כדור' },
  rocket: { d: 'M50 4C70 20 74 46 66 72H34C26 46 30 20 50 4zM50 30a8 8 0 1 0 .1 0zM34 60L18 80l16-4zM66 60l16 20-16-4zM42 74l8 22 8-22z', mode: 'fill', label: 'טיל' },
  crown: { d: 'M8 80L14 30 34 52 50 18 66 52 86 30 92 80z', mode: 'fill', label: 'כתר' },
  frame: { d: 'M4 4h92v92H4zM10 10h80v80H10z', mode: 'stroke', lw: 1.6, label: 'מסגרת כפולה' },
  tape: { d: 'M0 30l100-6v30L0 60z', mode: 'fill', label: 'סלוטייפ' },
  hamsa: { d: 'M30 92Q14 84 14 60V30q0-6 6-6t6 6v20h2V14q0-6 6-6t6 6v34h2V10q0-6 6-6t6 6v38h2V14q0-6 6-6t6 6v36h2V30q0-6 6-6t6 6v30q0 24-16 32zM50 58a8 6 0 1 0 .1 0z', mode: 'fill', label: 'חמסה' },
}

// place: where the style puts its decorations on a page — corners | top | bottom | sides | scatter
const S = (id, name, c, fonts, decor, photo, extra = {}) => ({ id, name, bg: c[0], surface: c[1], primary: c[2], accent: c[3], text: c[4] || c[3], title: fonts[0], body: fonts[1], decor, photo, ...extra })

export const STYLES = {
  wedding: [
    S('w-gold', 'קלאסי לבן-זהב', ['#ffffff', '#f7f3ec', '#c9a961', '#2b2b2b'], ['Frank Ruhl Libre', 'Assistant'], [{ kind: 'corner', place: 'corners', color: 'primary' }], { radius: 0, border: 0, gap: 6 }),
    S('w-olive', 'עלי זית ומרווה', ['#f4f1ea', '#ffffff', '#588157', '#344e41'], ['Bellefair', 'Heebo'], [{ kind: 'branch', place: 'corners', color: 'primary' }], { radius: 2, border: 0, gap: 8 }),
    S('w-mat', 'פיין-ארט עם פספרטו', ['#efeae2', '#ffffff', '#8c7b6b', '#3a3330'], ['David Libre', 'Assistant'], [{ kind: 'frame', place: 'none' }], { radius: 0, border: 5, borderColor: '#ffffff', shadow: true, gap: 14 }),
    S('w-terra', 'טרקוטה ושקיעה', ['#fbf3ea', '#ffffff', '#b5603e', '#4a2c21'], ['Suez One', 'Rubik'], [{ kind: 'arch', place: 'bottom', color: 'accentSoft' }], { radius: 3, border: 0, gap: 6 }),
    S('w-jewel', 'לילה וזהב', ['#0f1b2d', '#1f4e5f', '#d4af37', '#f5efe0'], ['David Libre', 'Heebo'], [{ kind: 'sparkle', place: 'scatter', color: 'primary' }], { radius: 0, border: 1.2, borderColor: '#d4af37', gap: 7 }),
    S('w-diary', 'יומן מצויר ביד', ['#fffdf7', '#f2d7d5', '#7a9e9f', '#333333'], ['Amatic SC', 'Varela Round'], [{ kind: 'heart', place: 'scatter', color: 'surface' }, { kind: 'tape', place: 'tape', color: 'tape' }], { radius: 0, border: 3, borderColor: '#ffffff', shadow: true, tilt: true, gap: 10 }),
  ],
  'bar-mitzvah': [
    S('b-tallit', 'טלית כחול-לבן', ['#ffffff', '#eaf1f8', '#1e3a6e', '#1e3a6e'], ['Frank Ruhl Libre', 'Heebo'], [{ kind: 'stripes', place: 'top', color: 'primary' }, { kind: 'davidStar', place: 'corners', color: 'primary' }], { radius: 0, border: 0, gap: 6 }),
    S('b-jerusalem', 'ירושלים של זהב', ['#f6efe3', '#d9c3a0', '#b08d57', '#5a4630'], ['Suez One', 'Assistant'], [{ kind: 'arch', place: 'bottom', color: 'surface' }], { radius: 2, border: 2, borderColor: '#ffffff', gap: 8 }),
    S('b-sport', 'ספורט ואנרגיה', ['#0b132b', '#1c2541', '#ffbe0b', '#ffffff'], ['Secular One', 'Rubik'], [{ kind: 'ball', place: 'corners', color: 'primary' }], { radius: 4, border: 0, gap: 5 }),
    S('b-mono', 'מגזין שחור-לבן', ['#ffffff', '#f2f2f2', '#e63946', '#111111'], ['Karantina', 'Heebo'], [], { radius: 0, border: 0, gap: 4, filter: 'bw' }),
    S('b-heritage', 'מסורת ועור', ['#f3ede4', '#c2a878', '#6b4f3a', '#2e211a'], ['David Libre', 'Assistant'], [{ kind: 'frame', place: 'page', color: 'primary' }], { radius: 0, border: 2, borderColor: '#c2a878', gap: 8 }),
    S('b-roots', 'מסע שורשים', ['#f2efe6', '#ffffff', '#d17a47', '#2f3e46'], ['Bellefair', 'Varela Round'], [{ kind: 'sun', place: 'corners', color: 'primary' }], { radius: 3, border: 3, borderColor: '#ffffff', shadow: true, gap: 8 }),
  ],
  'bat-mitzvah': [
    S('t-pink', 'ורוד-שחור-כסף', ['#ffffff', '#ffe0ec', '#ff4f8b', '#111111'], ['Secular One', 'Rubik'], [{ kind: 'confetti', place: 'scatter', color: 'primary' }], { radius: 4, border: 0, gap: 6 }),
    S('t-boho', 'בוהו פרחוני', ['#fbf5ee', '#e8c4b8', '#c08497', '#6d597a'], ['Bellefair', 'Assistant'], [{ kind: 'arch', place: 'bottom', color: 'surface' }, { kind: 'leaf', place: 'corners', color: 'primary' }], { radius: 3, border: 0, gap: 8 }),
    S('t-pastel', 'פסטל חלומי', ['#fff7fb', '#f9d5e5', '#9ccbe0', '#5b4a6b'], ['Varela Round', 'Varela Round'], [{ kind: 'cloud', place: 'scatter', color: 'surface' }, { kind: 'star', place: 'scatter', color: 'accentSoft' }], { radius: 12, border: 0, gap: 8 }),
    S('t-orange', 'כתום מודרני', ['#ffffff', '#ffe3cc', '#ff7a1a', '#1f1f1f'], ['Karantina', 'Heebo'], [], { radius: 0, border: 0, gap: 5 }),
    S('t-rose', 'רוז-גולד', ['#fff9f5', '#f3dcd2', '#b76e79', '#3d2c2e'], ['Frank Ruhl Libre', 'Assistant'], [{ kind: 'sparkle', place: 'scatter', color: 'primary' }, { kind: 'corner', place: 'corners', color: 'primary' }], { radius: 2, border: 0, gap: 7 }),
    S('t-scrap', 'סקרפבוק חברות', ['#fffdf5', '#ffd166', '#ef476f', '#264653'], ['Amatic SC', 'Varela Round'], [{ kind: 'heart', place: 'scatter', color: 'primary' }, { kind: 'tape', place: 'tape', color: 'tape' }], { radius: 0, border: 3, borderColor: '#ffffff', shadow: true, tilt: true, gap: 10 }),
  ],
  birthday: [
    S('d-rainbow', 'קשת בענן', ['#ffffff', '#fff3c4', '#ff595e', '#1982c4'], ['Varela Round', 'Rubik'], [{ kind: 'balloon', place: 'corners', color: 'rainbow' }], { radius: 6, border: 0, gap: 6 }),
    S('d-jungle', 'ג׳ונגל', ['#f6f1e1', '#dcebc8', '#7fb069', '#4e3d2a'], ['Secular One', 'Rubik'], [{ kind: 'leaf', place: 'corners', color: 'primary' }], { radius: 6, border: 3, borderColor: '#ffffff', gap: 7 }),
    S('d-space', 'חלל וכוכבים', ['#0b0c2a', '#2e3a8c', '#ffd23f', '#ffffff'], ['Suez One', 'Varela Round'], [{ kind: 'star', place: 'scatter', color: 'primary' }, { kind: 'rocket', place: 'corners', color: 'accent2' }], { radius: 50, border: 1.5, borderColor: '#ffd23f', gap: 8 }),
    S('d-baby', 'פסטל לתינוקות', ['#ffffff', '#f8e1e7', '#9fc9d6', '#5a6b7a'], ['Varela Round', 'Assistant'], [{ kind: 'cloud', place: 'scatter', color: 'surface' }, { kind: 'heart', place: 'scatter', color: 'accentSoft' }], { radius: 8, border: 0, gap: 8 }),
    S('d-party', 'קונפטי מסיבה', ['#ffffff', '#ffe5f1', '#ff006e', '#3a86ff'], ['Karantina', 'Rubik'], [{ kind: 'confetti', place: 'scatter', color: 'rainbow' }], { radius: 0, border: 3, borderColor: '#ffffff', shadow: true, tilt: true, gap: 9 }),
    S('d-blocks', 'קוביות צבעוניות', ['#ffffff', '#ffd500', '#e3000b', '#006cb7'], ['Secular One', 'Heebo'], [{ kind: 'crown', place: 'corners', color: 'rainbow' }], { radius: 3, border: 2.5, borderColor: '#ffd500', gap: 5 }),
  ],
}
export const EVENTS = [
  { id: 'wedding', label: 'חתונה', emoji: '💍', title: 'שירה ויונתן', sub: 'מתחתנים · ט״ו באב תשפ״ז' },
  { id: 'bar-mitzvah', label: 'בר מצווה', emoji: '📜', title: 'איתי בר מצווה', sub: 'פרשת לך לך · תשפ״ז' },
  { id: 'bat-mitzvah', label: 'בת מצווה', emoji: '🎀', title: 'נועה בת 12', sub: 'בת מצווה · תשפ״ז' },
  { id: 'birthday', label: 'יום הולדת', emoji: '🎂', title: 'מזל טוב!', sub: 'יום הולדת 7' },
]
export const styleById = id => Object.values(STYLES).flat().find(s => s.id === id) || STYLES.wedding[0]
const RAINBOW = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93']
export function decorColor(style, key, i = 0) {
  if (key === 'rainbow') return RAINBOW[i % RAINBOW.length]
  if (key === 'tape') return 'rgba(255,240,180,0.85)'
  if (key === 'accentSoft') return style.accent + '55'
  if (key === 'accent2') return style.text
  return style[key] || style.primary
}

// Print sizes Israeli labs offer (spread = two pages side by side), in mm. From photoroom/myalbum specs.
export const ALBUM_SIZES = [
  { id: '30x30', label: '30×30 (כפולה 30×60)', w: 600, h: 300 },
  { id: '30.5x30.5', label: '30.5×30.5 (כפולה 30.5×61)', w: 610, h: 305 },
  { id: '25x25', label: '25×25 (כפולה 25×50)', w: 500, h: 250 },
  { id: '22x22', label: '22×22 (כפולה 22×44)', w: 440, h: 220 },
  { id: '30x40', label: '30×40 לרוחב (כפולה 30×80)', w: 800, h: 300 },
  { id: '22x30', label: '22×30 לאורך (כפולה 44×30)', w: 440, h: 300 },
  { id: '20x30', label: '20×30 לאורך (כפולה 40×30)', w: 400, h: 300 },
]
export const COLLAGE_SIZES = [
  { id: 'sq', label: 'ריבוע לרשתות', w: 300, h: 300 },
  { id: 'a4', label: 'A4 לאורך', w: 210, h: 297 },
  { id: 'a4l', label: 'A4 לרוחב', w: 297, h: 210 },
  { id: 'a3', label: 'A3 לאורך', w: 297, h: 420 },
  { id: 'poster', label: 'פוסטר 50×70', w: 500, h: 700 },
  { id: 'posterl', label: 'פוסטר 70×50 לרוחב', w: 700, h: 500 },
  { id: 'story', label: 'סטורי לטלפון', w: 180, h: 320 },
]
