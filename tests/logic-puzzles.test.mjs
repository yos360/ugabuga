// Logic grid puzzles (תשבצי היגיון): every generated puzzle has exactly one solution, no clue can be
// dropped, the same seed gives the same puzzle, the step solver reaches the answer, and the
// Hebrew sentences agree in gender.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const E = await import('../src/logicgrid/engine.js')
const { THEMES, LEVELS, LEVEL_IDS, clueText } = await import('../src/logicgrid/themes.js')

function perms(n) {
  if (n === 1) return [[0]]
  const out = []
  for (const p of perms(n - 1)) for (let i = 0; i <= p.length; i++) out.push([...p.slice(0, i), n - 1, ...p.slice(i)])
  return out
}
// brute force: every assignment of every category, check every clue
function bruteCount(puz, clues = puz.clues, limit = Infinity) {
  const P = perms(puz.n), sol = [[...Array(puz.n).keys()]]
  let count = 0
  const rec = c => {
    if (count >= limit) return
    if (c === puz.K) { if (clues.every(cl => E.clueHolds(puz, sol, cl))) count++; return }
    for (const p of P) { sol[c] = p; rec(c + 1) }
  }
  rec(1)
  return count
}

const SEEDS = { kids: [1, 2, 3, 4, 5, 6], easy: [11, 12, 13, 14, 15], medium: [21, 22, 23, 24], hard: [31, 32] }

test('every puzzle has exactly one solution (brute force) and it is the stored one', () => {
  for (const lv of LEVEL_IDS) for (const seed of SEEDS[lv]) {
    const p = E.generatePuzzle(seed, lv)
    assert.equal(p.K, LEVELS[lv].K); assert.equal(p.n, LEVELS[lv].n)
    if (lv !== 'hard') assert.equal(bruteCount(p), 1, `${lv} seed ${seed}`)
    else assert.equal(E.countSolutions(p, undefined, 3), 1, `${lv} seed ${seed}`)
    assert.ok(p.clues.every(c => E.clueHolds(p, p.sol, c)), 'stored solution satisfies every clue')
  }
})

test('no clue is redundant: dropping any one leaves more than one solution', () => {
  for (const lv of LEVEL_IDS) for (const seed of SEEDS[lv].slice(0, 3)) {
    const p = E.generatePuzzle(seed, lv)
    p.clues.forEach((c, i) => {
      const rest = p.clues.filter((_, j) => j !== i)
      const n = lv === 'hard' ? E.countSolutions({ ...p, clues: rest }, undefined, 2) : bruteCount(p, rest, 2)
      assert.ok(n > 1, `${lv} seed ${seed}: clue ${i + 1} "${c.text}" is redundant`)
    })
  }
})

test('the fast solution counter agrees with brute force on random clue sets', () => {
  for (const seed of [41, 42, 43, 44, 45, 46, 47, 48]) {
    const p = E.generatePuzzle(seed, seed % 2 ? 'easy' : 'kids')
    // all subsets of the first clues (fewer clues → several solutions)
    for (let mask = 0; mask < 1 << Math.min(p.clues.length, 4); mask++) {
      const clues = p.clues.filter((_, i) => mask & (1 << i))
      assert.equal(Math.min(E.countSolutions({ ...p, clues }, undefined, 1000), 1000), Math.min(bruteCount(p, clues), 1000))
    }
  }
})

test('same seed → same puzzle; different seeds → different puzzles', () => {
  for (const lv of LEVEL_IDS) {
    const a = E.generatePuzzle(777, lv), b = E.generatePuzzle(777, lv), c = E.generatePuzzle(778, lv)
    assert.deepEqual(a.clues.map(x => x.text), b.clues.map(x => x.text))
    assert.deepEqual(a.sol, b.sol)
    assert.notDeepEqual(a.clues.map(x => x.text), c.clues.map(x => x.text))
  }
  // a fixed theme is honoured
  for (const t of THEMES) assert.equal(E.generatePuzzle(5, 'easy', t.id).theme.id, t.id)
})

test('the step-by-step solver reaches the stored solution, and every step has Hebrew text', () => {
  for (const lv of LEVEL_IDS) for (const seed of SEEDS[lv].slice(0, 2)) {
    const p = E.generatePuzzle(seed, lv)
    const { solved, st, steps } = E.solveSteps(p, { trial: LEVELS[lv].trial })
    assert.ok(solved, `${lv} ${seed}`)
    assert.deepEqual([...st], [...E.solutionGrid(p)])
    for (const s of steps) { const t = E.stepText(p, s); assert.match(t, /[א-ת]/); assert.doesNotMatch(t, /undefined|NaN| {2}/) }
  }
})

test('hints are sound from any correct partial grid', () => {
  const p = E.generatePuzzle(99, 'medium'), sol = E.solutionGrid(p)
  const st = E.emptyState(p)
  for (let i = 0; i < st.length; i += 3) st[i] = sol[i] // a partly filled, correct grid
  const s = E.nextStep(p, st)
  assert.ok(s && !s.contra)
  for (const [x, y, v] of s.cells) assert.equal(sol[E.cellIndex(p, x, y)], v)
})

test('all clue texts are clean sentences', () => {
  for (const t of THEMES) for (const lv of LEVEL_IDS) {
    const p = E.generatePuzzle(500 + lv.length, lv, t.id)
    for (const c of p.clues) {
      assert.match(c.text, /^[^ ].*\.$/, c.text)
      assert.doesNotMatch(c.text, /undefined|NaN| {2}|\[object/, c.text)
    }
  }
})

// ---- Hebrew fixtures: one sentence per clue type and gender --------------------------------
const kid = (shell, name) => [0, shell.cats[0].items.findIndex(x => x.label === name)]
const item = (shell, c, label) => [c, shell.cats[c].items.findIndex(x => x.label === label)]
const say = (shell, type, refs, variant = 0) => clueText(shell, { type, refs, variant })

test('Hebrew: positive / negative clues agree with the name\'s gender', () => {
  const s = E.shellFor('pets')
  assert.equal(say(s, 'same', [kid(s, 'דנה'), item(s, 1, 'כלב')]), 'דנה מגדלת את הכלב.')
  assert.equal(say(s, 'same', [kid(s, 'יואב'), item(s, 1, 'כלב')]), 'יואב מגדל את הכלב.')
  assert.equal(say(s, 'diff', [kid(s, 'נועה'), item(s, 2, '8')]), 'נועה לא בת 8.')
  assert.equal(say(s, 'diff', [kid(s, 'נועם'), item(s, 2, '8')]), 'נועם לא בן 8.')
  // the name becomes the subject even when it is the second ref
  assert.equal(say(s, 'same', [item(s, 3, 'שוקו'), kid(s, 'מאיה')]), 'מאיה קראה לחיה שלה "שוקו".')
  assert.equal(say(s, 'same', [item(s, 3, 'שוקו'), kid(s, 'אורי')]), 'אורי קרא לחיה שלו "שוקו".')
  // no name: gender-neutral "מי ש…" (masculine generic)
  assert.equal(say(s, 'same', [item(s, 1, 'דג זהב'), item(s, 2, '7')]), 'מי שמגדל את דג הזהב בן 7.')
  assert.equal(say(s, 'diff', [item(s, 2, '9'), item(s, 1, 'תוכי')]), 'מי שבגיל 9 לא מגדל את התוכי.')
  const m = E.shellFor('meals')
  assert.equal(say(m, 'same', [kid(m, 'תמר'), item(m, 3, 'חלב')]), 'תמר שתתה חלב.')
  assert.equal(say(m, 'same', [kid(m, 'עומר'), item(m, 3, 'חלב')]), 'עומר שתה חלב.')
  const h = E.shellFor('houses')
  assert.equal(say(h, 'diff', [kid(h, 'משפחת כהן'), item(h, 3, 'זית')]), 'משפחת כהן לא מגדלת בחצר עץ זית.')
  assert.equal(say(h, 'same', [item(h, 1, 'כחול'), item(h, 3, 'זית')]), 'המשפחה שגרה בבית הכחול מגדלת בחצר עץ זית.')
  assert.equal(say(h, 'same', [item(h, 3, 'זית'), item(h, 1, 'כחול')]), 'המשפחה שמגדלת בחצר עץ זית גרה בבית הכחול.')
})

test('Hebrew: either/or clues', () => {
  const s = E.shellFor('sports')
  assert.equal(say(s, 'either', [kid(s, 'שירה'), item(s, 1, 'טניס'), item(s, 3, 'לבנה')]), 'שירה מתאמנת בטניס, או שהיא לובשת חולצה לבנה (אבל לא גם וגם).')
  assert.equal(say(s, 'either', [kid(s, 'גיא'), item(s, 1, 'טניס'), item(s, 1, 'ג׳ודו')]), 'גיא מתאמן בטניס, או שהוא מתאמן בג׳ודו.')
  assert.equal(say(s, 'either', [item(s, 2, '17:00'), item(s, 1, 'שחייה'), item(s, 3, 'כחולה')]), 'מי שמתאמן בשעה 17:00 מתאמן בשחייה, או שהוא לובש חולצה כחולה (אבל לא גם וגם).')
  const h = E.shellFor('houses')
  assert.equal(say(h, 'either', [item(h, 1, 'ירוק'), item(h, 2, '4'), item(h, 2, '6')]), 'המשפחה שגרה בבית הירוק גרה בבית מספר 4, או שהיא גרה בבית מספר 6.')
})

test('Hebrew: ordering clues (before/after, exactly next, neighbours) with gender and plural agreement', () => {
  const s = E.shellFor('pets')
  assert.equal(say(s, 'less', [kid(s, 'דנה'), kid(s, 'יואב')]), 'דנה צעירה מיואב.')
  assert.equal(say(s, 'less', [kid(s, 'יואב'), kid(s, 'דנה')]), 'יואב צעיר מדנה.')
  assert.equal(say(s, 'less', [kid(s, 'יואב'), kid(s, 'דנה')], 1), 'דנה מבוגרת מיואב.')
  assert.equal(say(s, 'next', [item(s, 1, 'כלב'), kid(s, 'מאיה')]), 'מאיה גדולה ממי שמגדל את הכלב בשנה אחת בדיוק.')
  const b = E.shellFor('birthdays')
  assert.equal(say(b, 'adj', [kid(b, 'דנה'), kid(b, 'נועה')]), 'דנה ונועה חוגגות ימי הולדת בחודשים סמוכים.')
  assert.equal(say(b, 'adj', [kid(b, 'דנה'), kid(b, 'יואב')]), 'דנה ויואב חוגגים ימי הולדת בחודשים סמוכים.')
  assert.equal(say(b, 'adj', [item(b, 1, 'פאזל'), kid(b, 'דנה')]), 'דנה ומי שקיבל פאזל חוגגים ימי הולדת בחודשים סמוכים.')
  assert.equal(say(b, 'less', [kid(b, 'רוני'), item(b, 3, 'גזר')]), 'רוני חוגגת יום הולדת לפני מי שביקש עוגת גזר.')
  assert.equal(say(b, 'next', [kid(b, 'רוני'), kid(b, 'אלון')]), 'אלון חוגג יום הולדת חודש אחד בדיוק אחרי רוני.')
  const h = E.shellFor('houses')
  assert.equal(say(h, 'adj', [kid(h, 'משפחת כהן'), kid(h, 'משפחת לוי')]), 'משפחת כהן ומשפחת לוי גרות בבתים צמודים.')
  assert.equal(say(h, 'next', [kid(h, 'משפחת כהן'), item(h, 1, 'אדום')]), 'מספר הבית של המשפחה שגרה בבית האדום גדול ב־2 בדיוק ממספר הבית של משפחת כהן.')
  const t = E.shellFor('trip')
  assert.equal(say(t, 'less', [kid(t, 'יעל'), kid(t, 'איתי')]), 'יעל ישבה לפני איתי, קרוב יותר לנהג.')
  assert.equal(say(t, 'less', [kid(t, 'יעל'), kid(t, 'איתי')], 1), 'איתי ישב מאחורי יעל.')
  const sp = E.shellFor('sports')
  assert.equal(say(sp, 'less', [kid(sp, 'הילה'), kid(sp, 'רועי')]), 'הילה מתאמנת מוקדם יותר מרועי.')
  assert.equal(say(sp, 'next', [kid(sp, 'רועי'), kid(sp, 'הילה')]), 'הילה מתחילה להתאמן שעה אחת בדיוק אחרי רועי.')
})

test('Hebrew: every theme has distinct masculine and feminine verbs where Hebrew needs them', () => {
  for (const t of THEMES) {
    if (t.who.g === 'f') continue // families: always feminine
    for (const c of t.cats) for (const x of c.items) {
      const m = c.pred(x, 'm'), f = c.pred(x, 'f')
      assert.notEqual(m, f, `${t.id}/${c.id}: "${m}" should change for a girl`)
    }
  }
})

test('daily seed changes every day', () => {
  assert.notEqual(E.dailySeed(20000), E.dailySeed(20001))
})
