// Logic grid puzzles (תשבצי היגיון) — themes and every Hebrew sentence the puzzles use.
// Each theme has an "anchor" category (names, gender known) and 3 more categories; one of them is
// ordered (ages, hours, months…) so ordering clues ("before / after / neighbours") are possible.
// A non-name item is referred to as "מי ש…" (masculine generic, which in Hebrew means "whoever",
// boy or girl) or, for families, "המשפחה ש…" (feminine), so a clue never gives the gender away.

export const g2 = (g, m, f) => (g === 'f' ? f : m)
const pl = (a, b, m, f) => (a === 'f' && b === 'f' ? f : m)

const BOYS = ['יואב', 'נועם', 'איתי', 'אורי', 'עומר', 'דניאל', 'אריאל', 'אלון', 'רועי', 'גיא']
const GIRLS = ['דנה', 'נועה', 'מאיה', 'שירה', 'תמר', 'יעל', 'הילה', 'ליה', 'רוני', 'אביגיל']
const KIDS = [...BOYS.map(n => ({ label: n, g: 'm' })), ...GIRLS.map(n => ({ label: n, g: 'f' }))]
const KID_WHO = { prefix: 'מי ש', g: 'm', pron: 'הוא', two: 'שני ילדים שונים', each: 'כל ילד וילדה' }

const it = (label, extra = {}) => ({ label, ...extra })

// ordered category helper: items in their natural order; puzzles use a consecutive run
const ordered = (def, values) => ({ ...def, ordered: true, items: values.map(v => it(String(v), { v })) })

export const THEMES = [
  {
    id: 'pets', title: 'ילדים וחיות מחמד', emoji: '🐶',
    story: 'כמה ילדים מהשכונה מגדלים חיות מחמד. כל ילד מגדל חיה אחרת, בגיל אחר, וכל אחד נתן לחיה שלו שם אחר.',
    anchor: { label: 'ילד', items: KIDS }, who: KID_WHO,
    cats: [
      { id: 'pet', label: 'חיה', items: [it('כלב', { obj: 'את הכלב' }), it('חתול', { obj: 'את החתול' }), it('תוכי', { obj: 'את התוכי' }), it('ארנב', { obj: 'את הארנב' }), it('אוגר', { obj: 'את האוגר' }), it('צב', { obj: 'את הצב' }), it('דג זהב', { obj: 'את דג הזהב' })],
        pred: (x, g) => `${g2(g, 'מגדל', 'מגדלת')} ${x.obj}` },
      ordered({ id: 'age', label: 'גיל',
        pred: (x, g) => `${g2(g, 'בן', 'בת')} ${x.v}`, who: x => `מי שבגיל ${x.v}`,
        less: (X, Y, v) => v ? `${Y.s} ${g2(Y.g, 'מבוגר', 'מבוגרת')} מ${X.s}` : `${X.s} ${g2(X.g, 'צעיר', 'צעירה')} מ${Y.s}`,
        next: (X, Y) => `${Y.s} ${g2(Y.g, 'גדול', 'גדולה')} מ${X.s} בשנה אחת בדיוק`,
        adj: (X, Y) => `ההפרש בין הגיל של ${X.s} לגיל של ${Y.s} הוא שנה אחת בדיוק`,
      }, [6, 7, 8, 9, 10, 11, 12]),
      { id: 'petname', label: 'שם החיה', items: ['שוקו', 'במבה', 'פיצי', 'לולו', 'טופי', 'צ׳יקו'].map(n => it(n)),
        pred: (x, g) => `${g2(g, 'קרא', 'קראה')} לחיה ${g2(g, 'שלו', 'שלה')} "${x.label}"` },
    ],
  },
  {
    id: 'houses', title: 'בתים וצבעים', emoji: '🏠',
    story: 'ברחוב קטן יש כמה בתים, כולם באותו צד של הרחוב. בכל בית גרה משפחה אחרת, וכל בית צבוע בצבע אחר.',
    note: 'מספרי הבתים עולים ב־2 (2, 4, 6…). "בתים צמודים" הם בתים שמספריהם עוקבים, למשל 4 ו־6.',
    anchor: { label: 'משפחה', items: ['כהן', 'לוי', 'מזרחי', 'פרץ', 'ביטון', 'אברהם', 'פרידמן', 'שפירא'].map(n => it(`משפחת ${n}`, { short: n, g: 'f' })) },
    who: { prefix: 'המשפחה ש', g: 'f', pron: 'היא', two: 'שתי משפחות שונות', each: 'כל משפחה' },
    cats: [
      { id: 'color', label: 'צבע הבית', items: ['אדום', 'כחול', 'צהוב', 'ירוק', 'לבן', 'ורוד', 'כתום'].map(c => it(c)),
        pred: (x, g) => `${g2(g, 'גר', 'גרה')} בבית ה${x.label}` },
      ordered({ id: 'number', label: 'מספר הבית',
        pred: (x, g) => `${g2(g, 'גר', 'גרה')} בבית מספר ${x.v}`,
        less: (X, Y, v) => v ? `מספר הבית של ${Y.s} גדול ממספר הבית של ${X.s}` : `מספר הבית של ${X.s} קטן ממספר הבית של ${Y.s}`,
        next: (X, Y) => `מספר הבית של ${Y.s} גדול ב־2 בדיוק ממספר הבית של ${X.s}`,
        adj: (X, Y) => `${X.s} ו${Y.s} ${pl(X.g, Y.g, 'גרים', 'גרות')} בבתים צמודים`,
      }, [2, 4, 6, 8, 10, 12, 14]),
      { id: 'tree', label: 'עץ בחצר', items: ['לימון', 'תפוז', 'תאנה', 'רימון', 'זית', 'אבוקדו'].map(f => it(f)),
        pred: (x, g) => `${g2(g, 'מגדל', 'מגדלת')} בחצר עץ ${x.label}` },
    ],
  },
  {
    id: 'sports', title: 'ספורט וחוגים', emoji: '⚽',
    story: 'כמה חברים מתאמנים כל אחד בענף ספורט אחר. כל אחד מתאמן בשעה אחרת ולובש חולצה בצבע אחר.',
    anchor: { label: 'ילד', items: KIDS }, who: KID_WHO,
    cats: [
      { id: 'sport', label: 'ספורט', items: ['כדורגל', 'כדורסל', 'שחייה', 'טניס', 'ג׳ודו', 'כדורעף', 'התעמלות'].map(s => it(s)),
        pred: (x, g) => `${g2(g, 'מתאמן', 'מתאמנת')} ב${x.label}` },
      ordered({ id: 'hour', label: 'שעה',
        pred: (x, g) => `${g2(g, 'מתאמן', 'מתאמנת')} בשעה ${x.label}`,
        less: (X, Y, v) => v ? `${Y.s} ${g2(Y.g, 'מתאמן', 'מתאמנת')} מאוחר יותר מ${X.s}` : `${X.s} ${g2(X.g, 'מתאמן', 'מתאמנת')} מוקדם יותר מ${Y.s}`,
        next: (X, Y) => `${Y.s} ${g2(Y.g, 'מתחיל', 'מתחילה')} להתאמן שעה אחת בדיוק אחרי ${X.s}`,
        adj: (X, Y) => `בין האימון של ${X.s} לאימון של ${Y.s} יש הפרש של שעה אחת בדיוק`,
      }, ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']),
      { id: 'shirt', label: 'חולצה', items: ['אדומה', 'כחולה', 'צהובה', 'ירוקה', 'לבנה', 'שחורה', 'כתומה'].map(c => it(c)),
        pred: (x, g) => `${g2(g, 'לובש', 'לובשת')} חולצה ${x.label}` },
    ],
  },
  {
    id: 'birthdays', title: 'ימי הולדת ומתנות', emoji: '🎁',
    story: 'כמה חברים מהכיתה חוגגים השנה יום הולדת, כל אחד בחודש אחר. כל אחד קיבל מתנה אחרת וביקש עוגה בטעם אחר.',
    note: 'כל ימי ההולדת באותה שנה, לפי סדר החודשים מינואר עד דצמבר.',
    anchor: { label: 'ילד', items: KIDS }, who: KID_WHO,
    cats: [
      { id: 'gift', label: 'מתנה', items: [it('ספר'), it('כדור'), it('פאזל'), it('משחק קופסה'), it('אופניים'), it('ערכת יצירה'), it('גיטרה')],
        pred: (x, g) => `${g2(g, 'קיבל', 'קיבלה')} ${x.label}` },
      ordered({ id: 'month', label: 'חודש',
        pred: (x, g) => `${g2(g, 'חוגג', 'חוגגת')} יום הולדת ב${x.label}`,
        less: (X, Y, v) => v ? `${Y.s} ${g2(Y.g, 'חוגג', 'חוגגת')} יום הולדת אחרי ${X.s}` : `${X.s} ${g2(X.g, 'חוגג', 'חוגגת')} יום הולדת לפני ${Y.s}`,
        next: (X, Y) => `${Y.s} ${g2(Y.g, 'חוגג', 'חוגגת')} יום הולדת חודש אחד בדיוק אחרי ${X.s}`,
        adj: (X, Y) => `${X.s} ו${Y.s} ${pl(X.g, Y.g, 'חוגגים', 'חוגגות')} ימי הולדת בחודשים סמוכים`,
      }, ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']),
      { id: 'cake', label: 'עוגה', items: ['שוקולד', 'גבינה', 'תותים', 'גזר', 'וניל', 'לימון'].map(f => it(f)),
        pred: (x, g) => `${g2(g, 'ביקש', 'ביקשה')} עוגת ${x.label}` },
    ],
  },
  {
    id: 'meals', title: 'ארוחת צהריים', emoji: '🍝',
    story: 'כמה ילדים הגיעו לארוחת צהריים אצל סבתא, כל אחד בשעה אחרת. כל אחד אכל מנה אחרת ושתה משקה אחר.',
    anchor: { label: 'ילד', items: KIDS }, who: KID_WHO,
    cats: [
      { id: 'dish', label: 'מנה', items: ['שניצל', 'פסטה', 'פיצה', 'חביתה', 'מרק', 'קציצות', 'פלאפל'].map(d => it(d)),
        pred: (x, g) => `${g2(g, 'אכל', 'אכלה')} ${x.label}` },
      ordered({ id: 'time', label: 'שעת הגעה',
        pred: (x, g) => `${g2(g, 'הגיע', 'הגיעה')} לארוחה ב־${x.label}`,
        less: (X, Y, v) => v ? `${Y.s} ${g2(Y.g, 'הגיע', 'הגיעה')} לארוחה אחרי ${X.s}` : `${X.s} ${g2(X.g, 'הגיע', 'הגיעה')} לארוחה לפני ${Y.s}`,
        next: (X, Y) => `${Y.s} ${g2(Y.g, 'הגיע', 'הגיעה')} לארוחה רבע שעה בדיוק אחרי ${X.s}`,
        adj: (X, Y) => `${X.s} ו${Y.s} הגיעו לארוחה בהפרש של רבע שעה בדיוק`,
      }, ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30']),
      { id: 'drink', label: 'משקה', items: ['מיץ תפוזים', 'לימונדה', 'חלב', 'מים', 'שוקו', 'תה'].map(d => it(d)),
        pred: (x, g) => `${g2(g, 'שתה', 'שתתה')} ${x.label}` },
    ],
  },
  {
    id: 'trip', title: 'טיול שנתי', emoji: '🎒',
    story: 'בטיול השנתי כל ילד ישב בספסל אחר באוטובוס, הביא כריך אחר ובחר תחנה אהובה אחרת.',
    note: 'הספסלים ממוספרים מקדימת האוטובוס (ספסל 1) לאחור.',
    anchor: { label: 'ילד', items: KIDS }, who: KID_WHO,
    cats: [
      { id: 'sandwich', label: 'כריך', items: ['גבינה', 'חומוס', 'טונה', 'ביצה', 'שוקולד', 'אבוקדו'].map(s => it(s)),
        pred: (x, g) => `${g2(g, 'הביא', 'הביאה')} כריך ${x.label}` },
      ordered({ id: 'bench', label: 'ספסל',
        pred: (x, g) => `${g2(g, 'ישב', 'ישבה')} בספסל ${x.v}`, who: x => `מי שישב בספסל ${x.v}`,
        less: (X, Y, v) => v ? `${Y.s} ${g2(Y.g, 'ישב', 'ישבה')} מאחורי ${X.s}` : `${X.s} ${g2(X.g, 'ישב', 'ישבה')} לפני ${Y.s}, קרוב יותר לנהג`,
        next: (X, Y) => `${Y.s} ${g2(Y.g, 'ישב', 'ישבה')} בספסל שמיד מאחורי ${X.s}`,
        adj: (X, Y) => `${X.s} ו${Y.s} ${pl(X.g, Y.g, 'ישבו', 'ישבו')} בספסלים סמוכים`,
      }, [1, 2, 3, 4, 5, 6, 7]),
      { id: 'stop', label: 'תחנה אהובה', items: [it('מערה', { obj: 'במערה' }), it('מעיין', { obj: 'במעיין' }), it('תצפית', { obj: 'בתצפית' }), it('חוף', { obj: 'בחוף' }), it('יער', { obj: 'ביער' }), it('מוזיאון', { obj: 'במוזיאון' })],
        pred: (x, g) => `${g2(g, 'נהנה', 'נהנתה')} הכי הרבה ${x.obj}` },
    ],
  },
]

export const LEVELS = {
  kids: { id: 'kids', label: 'לילדים', size: '3×3', K: 3, n: 3, age: 'מגיל 7', weights: { same: 2, diff: 4, either: 0, less: 2, next: 0, adj: 0 }, trial: false },
  easy: { id: 'easy', label: 'קל', size: '3×4', K: 3, n: 4, age: 'מגיל 9', weights: { same: 2, diff: 4, either: 2, less: 2, next: 1, adj: 0 }, trial: false },
  medium: { id: 'medium', label: 'בינוני', size: '4×4', K: 4, n: 4, age: 'מגיל 11', weights: { same: 1, diff: 4, either: 2, less: 2, next: 1, adj: 1 }, trial: false },
  hard: { id: 'hard', label: 'קשה', size: '4×5', K: 4, n: 5, age: 'נוער ומבוגרים', weights: { same: 1, diff: 4, either: 3, less: 2, next: 1, adj: 2 }, trial: true },
}
export const LEVEL_IDS = ['kids', 'easy', 'medium', 'hard']
export const levelLine = puz => `${LEVELS[puz.level].label} · ${LEVELS[puz.level].size} · ${puz.clues.length} רמזים`

// ---- Phrases --------------------------------------------------------------------------------
// A puzzle carries `cats`: [anchor, ...]; every item knows its category. ref = [category, item].
export function refPhrase(puz, [c, a]) {
  const item = puz.cats[c].items[a]
  if (c === 0) return { s: item.label, g: item.g || 'm', name: true }
  const cat = puz.cats[c], who = puz.theme.who
  return { s: cat.who ? cat.who(item) : who.prefix + cat.pred(item, who.g), g: who.g, name: false }
}
const predOf = (puz, [c, a], g) => puz.cats[c].pred(puz.cats[c].items[a], g)
const negOf = (puz, [c, a], g) => { const cat = puz.cats[c], x = cat.items[a]; return cat.neg ? cat.neg(x, g) : `לא ${cat.pred(x, g)}` }
const pronOf = (puz, X) => (X.name ? g2(X.g, 'הוא', 'היא') : puz.theme.who.pron)

// "x is y" / "x is not y" as a clause (no full stop). A name, when present, is always the subject.
export function statement(puz, x, y, yes) {
  if (y[0] === 0) [x, y] = [y, x]
  const X = refPhrase(puz, x)
  return `${X.s} ${yes ? predOf(puz, y, X.g) : negOf(puz, y, X.g)}`
}

export function clueText(puz, clue) {
  const [x, y, z] = clue.refs
  switch (clue.type) {
    case 'same': return `${statement(puz, x, y, true)}.`
    case 'diff': return `${statement(puz, x, y, false)}.`
    case 'either': {
      const X = refPhrase(puz, x)
      const tail = y[0] !== z[0] ? ' (אבל לא גם וגם)' : ''
      return `${X.s} ${predOf(puz, y, X.g)}, או ש${pronOf(puz, X)} ${predOf(puz, z, X.g)}${tail}.`
    }
    default: {
      const O = puz.cats[puz.ord]
      // "neighbours" is symmetric: put the name first when there is one
      if (clue.type === 'adj' && y[0] === 0 && x[0] !== 0) return `${O.adj(refPhrase(puz, y), refPhrase(puz, x))}.`
      return `${O[clue.type](refPhrase(puz, x), refPhrase(puz, y), clue.variant || 0)}.`
    }
  }
}
