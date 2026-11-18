// Candidate (rejected 2026-11-18, editor 8/7/7/7/8): matchstick equation 6 + 15 = 9 -> 6 - 15 = -9 (7-segment digits).
const fs = require('fs');
const L = 140, Y0 = 210; // segment length, top y
const stick = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-60" y="-2" width="118" height="10" rx="3" fill="#000" opacity=".15"/><rect x="-62" y="-5" width="114" height="10" rx="3" fill="#f0c27a" stroke="#9a6526" stroke-width="2"/><ellipse cx="50" cy="0" rx="14" ry="9.5" fill="#d8262f" stroke="#7d1016" stroke-width="2"/><ellipse cx="46" cy="-3" rx="4" ry="2.5" fill="#fff" opacity=".55"/></g>`;
const SEG = { 1: 'bc', 5: 'acdfg', 6: 'acdefg', 9: 'abcdfg' };
function digit(cx, d) { // cx = horizontal centre of the digit box
  const l = cx - L / 2, r = cx + L / 2, out = [];
  for (const s of SEG[d]) {
    if (s === 'a') out.push(stick(cx, Y0, 0));
    if (s === 'g') out.push(stick(cx, Y0 + L, 0));
    if (s === 'd') out.push(stick(cx, Y0 + 2 * L, 0));
    if (s === 'f') out.push(stick(l, Y0 + L / 2, -90));
    if (s === 'b') out.push(stick(r, Y0 + L / 2, -90));
    if (s === 'e') out.push(stick(l, Y0 + 1.5 * L, -90));
    if (s === 'c') out.push(stick(r, Y0 + 1.5 * L, -90));
  }
  return out.join('');
}
const plus = cx => stick(cx, Y0 + L, 0) + stick(cx, Y0 + L, -90);
const eq = cx => stick(cx, Y0 + L - 30, 0) + stick(cx, Y0 + L + 30, 0);
// layout (x centres). "1" is drawn by its right sticks only, so its box sits further left.
const parts = [digit(110, 6), plus(330), digit(400, 1), digit(620, 5), eq(840), digit(1060, 9)];
const W = 1180;
fs.writeFileSync(__dirname + '/candidate-matches-6-15.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 700" width="${W}" height="700"><rect width="${W}" height="700" fill="#fffaf0"/>${parts.join('')}</svg>`);
