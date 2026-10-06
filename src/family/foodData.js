// School-lunch ("ארוחת עשר") ideas. Every combination here is one Israeli parents really make —
// written by hand, not generated. Fields:
//   kind: 'dairy' | 'parve' | 'meat'   (kashrut-style grouping, also useful for "no dairy")
//   al: allergens — 'gluten' 'dairy' 'egg' 'fish' 'sesame' 'peanut' 'nuts' 'soy'
//   cold: true when it should travel with an ice pack (soft cheese, tuna, egg, meat in hot weather)
//   picky: plain and familiar — good for kids who "only eat white bread with…"
//   bread: the usual base; 'any' means works on any bread
//   shop: shopping-list items (the bread is added separately)
const s = (id, name, kind, bread, shop, al, extra = {}) => ({ id, name, kind, bread, shop, al, vegan: false, picky: false, sweet: false, cold: false, ...extra })

export const BREADS = {
  white: 'לחם לבן', whole: 'לחם מלא', pita: 'פיתה', roll: 'לחמנייה', tortilla: 'טורטייה', bagel: 'בייגל', challah: 'חלה', crackers: 'קרקרים', ricecake: 'פריכיות אורז', any: 'כל לחם',
}

export const SANDWICHES = [
  // ── dairy ──
  s('white-cheese', 'גבינה לבנה', 'dairy', 'any', ['גבינה לבנה 5%'], ['gluten', 'dairy'], { picky: true, cold: true }),
  s('white-cheese-cucumber', 'גבינה לבנה ומלפפון', 'dairy', 'whole', ['גבינה לבנה 5%', 'מלפפון'], ['gluten', 'dairy'], { cold: true }),
  s('cream-cheese-tomato', 'גבינת שמנת ועגבנייה', 'dairy', 'whole', ['גבינת שמנת', 'עגבנייה'], ['gluten', 'dairy'], { cold: true }),
  s('yellow-cheese', 'גבינה צהובה', 'dairy', 'any', ['גבינה צהובה פרוסה'], ['gluten', 'dairy'], { picky: true }),
  s('yellow-cheese-cucumber', 'גבינה צהובה ומלפפון', 'dairy', 'whole', ['גבינה צהובה פרוסה', 'מלפפון'], ['gluten', 'dairy']),
  s('yellow-cheese-pita-oregano', 'פיתה עם גבינה צהובה ואורגנו', 'dairy', 'pita', ['גבינה צהובה פרוסה', 'אורגנו'], ['gluten', 'dairy'], { tip: 'אפשר לחמם בבוקר בטוסטר — גם קר זה טעים.' }),
  s('cottage-corn', 'קוטג׳ ותירס', 'dairy', 'roll', ['קוטג׳', 'תירס בקופסה'], ['gluten', 'dairy'], { cold: true }),
  s('labaneh-zaatar', 'לבנה וזעתר', 'dairy', 'pita', ['לבנה', 'זעתר'], ['gluten', 'dairy', 'sesame'], { cold: true }),
  s('labaneh-olives', 'לבנה וזיתים', 'dairy', 'whole', ['לבנה', 'זיתים מגולענים'], ['gluten', 'dairy'], { cold: true }),
  s('bulgarian-tomato', 'גבינה בולגרית ועגבנייה', 'dairy', 'whole', ['גבינה בולגרית', 'עגבנייה'], ['gluten', 'dairy'], { cold: true }),
  s('feta-cucumber-wrap', 'טורטייה עם בולגרית, מלפפון ופטרוזיליה', 'dairy', 'tortilla', ['גבינה בולגרית', 'מלפפון', 'פטרוזיליה'], ['gluten', 'dairy'], { cold: true }),
  s('cheese-toast', 'טוסט גבינה צהובה', 'dairy', 'white', ['גבינה צהובה פרוסה'], ['gluten', 'dairy'], { picky: true, tip: 'עוטפים בנייר אלומיניום כשהוא עוד חם — נשאר רך עד ההפסקה.' }),
  s('cream-cheese-jam', 'גבינת שמנת וריבה', 'dairy', 'challah', ['גבינת שמנת', 'ריבת תות'], ['gluten', 'dairy'], { sweet: true, cold: true }),
  s('cottage-honey', 'קוטג׳ ודבש', 'dairy', 'whole', ['קוטג׳', 'דבש'], ['gluten', 'dairy'], { sweet: true, cold: true }),
  s('cream-cheese-avocado', 'גבינת שמנת ואבוקדו', 'dairy', 'whole', ['גבינת שמנת', 'אבוקדו', 'לימון'], ['gluten', 'dairy'], { cold: true, tip: 'כמה טיפות לימון על האבוקדו — והוא לא משחיר.' }),
  s('bagel-cream-cheese', 'בייגל עם גבינת שמנת', 'dairy', 'bagel', ['גבינת שמנת'], ['gluten', 'dairy', 'sesame'], { picky: true, cold: true }),
  s('rice-cakes-cheese', 'פריכיות עם גבינה לבנה ועגבניות שרי', 'dairy', 'ricecake', ['גבינה לבנה 5%', 'עגבניות שרי'], ['dairy'], { cold: true, gf: true }),
  s('omelet-cheese', 'חביתה וגבינה צהובה', 'dairy', 'roll', ['ביצים', 'גבינה צהובה פרוסה'], ['gluten', 'dairy', 'egg'], { cold: true }),
  // ── parve: eggs, tuna, spreads, veg ──
  s('omelet', 'חביתה', 'parve', 'any', ['ביצים'], ['gluten', 'egg'], { picky: true, cold: true }),
  s('omelet-tomato', 'חביתה ועגבנייה', 'parve', 'whole', ['ביצים', 'עגבנייה'], ['gluten', 'egg'], { cold: true }),
  s('egg-salad', 'סלט ביצים', 'parve', 'roll', ['ביצים', 'מיונז'], ['gluten', 'egg'], { cold: true }),
  s('boiled-egg-pita', 'פיתה עם ביצה קשה ומלפפון', 'parve', 'pita', ['ביצים', 'מלפפון'], ['gluten', 'egg'], { cold: true }),
  s('tuna', 'טונה', 'parve', 'any', ['טונה בשמן או במים'], ['gluten', 'fish'], { cold: true }),
  s('tuna-corn', 'טונה ותירס', 'parve', 'roll', ['טונה בשמן או במים', 'תירס בקופסה'], ['gluten', 'fish'], { cold: true }),
  s('tuna-cucumber-wrap', 'טורטייה עם טונה ומלפפון', 'parve', 'tortilla', ['טונה בשמן או במים', 'מלפפון'], ['gluten', 'fish'], { cold: true }),
  s('hummus', 'חומוס', 'parve', 'pita', ['חומוס'], ['gluten', 'sesame'], { vegan: true, cold: true }),
  s('hummus-cucumber', 'חומוס ומלפפון', 'parve', 'pita', ['חומוס', 'מלפפון'], ['gluten', 'sesame'], { vegan: true, cold: true }),
  s('hummus-egg', 'חומוס וביצה קשה', 'parve', 'pita', ['חומוס', 'ביצים'], ['gluten', 'sesame', 'egg'], { cold: true }),
  s('tahini-cucumber', 'טחינה ומלפפון', 'parve', 'pita', ['טחינה גולמית', 'לימון', 'מלפפון'], ['gluten', 'sesame'], { vegan: true }),
  s('avocado', 'אבוקדו', 'parve', 'whole', ['אבוקדו', 'לימון'], ['gluten'], { vegan: true, tip: 'מועכים עם מעט לימון ומלח — האבוקדו נשאר ירוק.' }),
  s('avocado-tomato', 'אבוקדו ועגבנייה', 'parve', 'whole', ['אבוקדו', 'עגבנייה', 'לימון'], ['gluten'], { vegan: true }),
  s('avocado-egg', 'אבוקדו וביצה קשה', 'parve', 'whole', ['אבוקדו', 'ביצים'], ['gluten', 'egg'], { cold: true }),
  s('matbucha', 'מטבוחה', 'parve', 'challah', ['מטבוחה'], ['gluten'], { vegan: true }),
  s('eggplant-salad', 'סלט חצילים בטחינה', 'parve', 'pita', ['סלט חצילים בטחינה'], ['gluten', 'sesame'], { vegan: true, cold: true }),
  s('chocolate-spread', 'ממרח שוקולד', 'parve', 'challah', ['ממרח שוקולד ללא אגוזים'], ['gluten'], { sweet: true, picky: true, tip: 'בהרבה בתי ספר אסור ממרח עם אגוזי לוז — בודקים שכתוב "ללא אגוזים". שימו לב: יש ממרחי שוקולד חלביים.' }),
  s('date-spread-tahini', 'סילאן וטחינה', 'parve', 'whole', ['סילאן', 'טחינה גולמית'], ['gluten', 'sesame'], { sweet: true, vegan: true }),
  s('jam', 'ריבה', 'parve', 'challah', ['ריבת תות'], ['gluten'], { sweet: true, vegan: true, picky: true }),
  s('banana-honey', 'בננה ודבש', 'parve', 'whole', ['בננה', 'דבש'], ['gluten'], { sweet: true, tip: 'פורסים את הבננה ממש לפני היציאה.' }),
  s('peanut-butter-banana', 'חמאת בוטנים ובננה', 'parve', 'whole', ['חמאת בוטנים', 'בננה'], ['gluten', 'peanut'], { vegan: true, sweet: true, tip: 'רק לבית — ברוב הגנים ובתי הספר אסור להביא בוטנים.' }),
  s('rice-cakes-hummus', 'פריכיות עם חומוס', 'parve', 'ricecake', ['חומוס'], ['sesame'], { vegan: true, gf: true, cold: true }),
  s('rice-cakes-avocado', 'פריכיות עם אבוקדו', 'parve', 'ricecake', ['אבוקדו', 'לימון'], [], { vegan: true, gf: true }),
  s('veggie-wrap', 'טורטייה עם ירקות וחומוס', 'parve', 'tortilla', ['חומוס', 'גזר', 'מלפפון', 'חסה'], ['gluten', 'sesame'], { vegan: true, cold: true }),
  s('schnitzel-tofu', 'שניצל תירס/סויה', 'parve', 'roll', ['שניצל צמחי'], ['gluten', 'soy'], { vegan: true, picky: true, tip: 'בודקים על האריזה — יש שניצלים צמחיים עם ביצה.' }),
  // ── meat ──
  s('schnitzel', 'שניצל', 'meat', 'roll', ['שניצל עוף'], ['gluten', 'egg'], { picky: true, cold: true, tip: 'שניצל משאריות של ארוחת הערב. מוסיפים קטשופ או חומוס.' }),
  s('schnitzel-hummus', 'שניצל, חומוס וחסה', 'meat', 'pita', ['שניצל עוף', 'חומוס', 'חסה'], ['gluten', 'egg', 'sesame'], { cold: true }),
  s('turkey', 'פסטרמה הודו', 'meat', 'any', ['פסטרמה הודו'], ['gluten'], { picky: true, cold: true }),
  s('turkey-cucumber', 'פסטרמה ומלפפון חמוץ', 'meat', 'roll', ['פסטרמה הודו', 'מלפפון חמוץ'], ['gluten'], { cold: true }),
  s('turkey-wrap', 'טורטייה עם פסטרמה וחסה', 'meat', 'tortilla', ['פסטרמה הודו', 'חסה', 'עגבנייה'], ['gluten'], { cold: true }),
  s('chicken-breast', 'חזה עוף צלוי ועגבנייה', 'meat', 'whole', ['חזה עוף צלוי', 'עגבנייה'], ['gluten'], { cold: true, tip: 'חזה עוף משאריות — פורסים דק.' }),
  s('meatball-pita', 'פיתה עם קציצות', 'meat', 'pita', ['קציצות'], ['gluten', 'egg'], { cold: true, tip: 'מקציצות של ארוחת הערב — מחממים בבוקר ושמים בפיתה.' }),
]

// Vegetables and fruit that travel well in a lunch box, and small extras.
export const SIDES = {
  veg: ['מלפפון חתוך לאצבעות', 'עגבניות שרי', 'גזר חתוך למקלות', 'פלחי פלפל אדום', 'אפונה בתרמיל', 'קולרבי חתוך'],
  fruit: ['תפוח (חתוך עם טיפת לימון)', 'בננה', 'ענבים (חצויים לקטנים)', 'קלמנטינה', 'אגס', 'פלחי מלון בקופסה', 'תמרים', 'אפרסק'],
  extra: ['צימוקים', 'בייגלה', 'פריכייה', 'קרקר מלא', 'יוגורט בקופסה (עם שקית קירור)', 'גרנולה ללא אגוזים'],
}

export const ALLERGENS = { peanut: 'בוטנים', nuts: 'אגוזים', sesame: 'שומשום', egg: 'ביצה', fish: 'דג', dairy: 'חלב', gluten: 'גלוטן', soy: 'סויה' }
export const KINDS = { dairy: 'חלבי', parve: 'פרווה', meat: 'בשרי' }
