// Typical acquisition ranges of Hebrew consonants, for /speech/parents/sound-acquisition.
// Ranges follow the Israeli norms summarised by Ben-David (ד״ש ברשת 34, 2015) and the health-fund
// guides (Meuhedet, Maccabi), which agree on the order more than on exact ages. They are deliberately
// rounded: `from` is roughly when many children already say the sound in words, `to` is roughly when
// most children do, and `late` (when present) is how far some sources extend the range.
// A sound belongs here by PRONUNCIATION: ט and ת are both /t/, כּ and ק are /k/, כ and ח are /x/, שׂ is /s/.
// `page` links to the sound's practice page under /speech/sounds when one exists.

export const AXIS = { min: 1.5, max: 7 }

export const SOUND_GROUPS = [
  { id: 'early', title: 'הצלילים המוקדמים', range: 'עד גיל 3 בערך', color: '#0f766e', note: 'צלילים שנעשים בשפתיים או בקצה הלשון, ושרואים בקלות איך אומרים אותם.' },
  { id: 'middle', title: 'צלילים של אמצע הדרך', range: 'בערך בין 2.5 ל־4', color: '#1d4ed8', note: 'ל, ר וצלילים שנעשים בחלק האחורי של הפה.' },
  { id: 'late', title: 'השורקים — האחרונים להתייצב', range: 'בערך עד 5–6, ולפעמים עד 7', color: '#7c3aed', note: 'צלילים שדורשים מיקום מדויק מאוד של הלשון וזרימת אוויר צרה.' },
]

export const SOUNDS = [
  { id: 'm', letters: 'מ', ipa: 'm', group: 'early', from: 1.5, to: 3, example: { word: 'מים', emoji: '💧' } },
  { id: 'n', letters: 'נ', ipa: 'n', group: 'early', from: 1.5, to: 3, example: { word: 'נעל', emoji: '👟' } },
  { id: 'b', letters: 'בּ', ipa: 'b', group: 'early', from: 1.5, to: 3, example: { word: 'בננה', emoji: '🍌' } },
  { id: 'p', letters: 'פּ', ipa: 'p', group: 'early', from: 1.5, to: 3, example: { word: 'פיל', emoji: '🐘' } },
  { id: 'd', letters: 'ד', ipa: 'd', group: 'early', from: 2, to: 3, example: { word: 'דג', emoji: '🐟' } },
  { id: 't', letters: 'ת / ט', ipa: 't', group: 'early', from: 2, to: 3, example: { word: 'תפוח', emoji: '🍎' } },
  { id: 'l', letters: 'ל', ipa: 'l', group: 'middle', from: 2.5, to: 3, late: 3.5, page: '/speech/sounds/l', example: { word: 'לימון', emoji: '🍋' },
    swaps: [{ said: 'יימון', target: 'לימון', text: 'ל מוחלפת ב־י' }] },
  { id: 'k', letters: 'ק / כּ', ipa: 'k', group: 'middle', from: 3, to: 4, late: 4.5, page: '/speech/sounds/k', example: { word: 'כדור', emoji: '⚽' },
    swaps: [{ said: 'תף', target: 'כף', text: 'ק/כּ מוחלפת ב־ת (קדמה)' }] },
  { id: 'g', letters: 'ג', ipa: 'g', group: 'middle', from: 3, to: 4, late: 4.5, page: '/speech/sounds/g', example: { word: 'גמל', emoji: '🐫' },
    swaps: [{ said: 'דמל', target: 'גמל', text: 'ג מוחלפת ב־ד (קדמה)' }] },
  { id: 'ch', letters: 'ח / כ', ipa: 'χ', group: 'middle', from: 3, to: 4, page: '/speech/sounds/ch', example: { word: 'חתול', emoji: '🐈' } },
  { id: 'r', letters: 'ר', ipa: 'ʁ', group: 'middle', from: 3.5, to: 4, late: 4.5, page: '/speech/sounds/r', example: { word: 'רכבת', emoji: '🚆' },
    swaps: [{ said: 'לכבת', target: 'רכבת', text: 'ר מוחלפת ב־ל' }, { said: 'יכבת', target: 'רכבת', text: 'ר מוחלפת ב־י' }] },
  { id: 's', letters: 'ס / שׂ', ipa: 's', group: 'late', from: 4, to: 6, late: 7, page: '/speech/sounds/s', example: { word: 'סוס', emoji: '🐎' },
    swaps: [{ said: 'תבון', target: 'סבון', text: 'ס מוחלפת ב־ת (סתימה, בגילים הצעירים)' }] },
  { id: 'sh', letters: 'ש', ipa: 'ʃ', group: 'late', from: 4, to: 6, late: 7, page: '/speech/sounds/sh', example: { word: 'שמש', emoji: '☀️' },
    swaps: [{ said: 'סמס', target: 'שמש', text: 'ש מוחלפת ב־ס' }] },
  { id: 'ts', letters: 'צ', ipa: 'ts', group: 'late', from: 4, to: 6, late: 7, page: '/speech/sounds/ts', example: { word: 'צב', emoji: '🐢' },
    swaps: [{ said: 'תב', target: 'צב', text: 'צ מוחלפת ב־ת' }] },
  { id: 'z', letters: 'ז', ipa: 'z', group: 'late', from: 4, to: 6, late: 7, page: '/speech/sounds/z', example: { word: 'זברה', emoji: '🦓' },
    swaps: [{ said: 'דברה', target: 'זברה', text: 'ז מוחלפת ב־ד' }] },
]

// Common, age-typical simplifications (phonological processes) and roughly when they fade.
export const PROCESSES = [
  { name: 'השמטת הברה לא מוטעמת', example: '"טוס" במקום "מטוס", "נָנָה" במקום "בננה"', fades: 'בדרך כלל נעלמת עד גיל 3 בערך' },
  { name: 'צמצום צרור עיצורים', example: '"גידה" במקום "גלידה"', fades: 'הולך ופוחת עד גיל 4 בערך' },
  { name: 'קדמה', example: '"תף" במקום "כף", "דמל" במקום "גמל"', fades: 'בדרך כלל עד גיל 3.5–4 בערך' },
  { name: 'סתימה של שורקים', example: '"תבון" במקום "סבון", "תב" במקום "צב"', fades: 'בדרך כלל עד גיל 3–3.5 בערך' },
  { name: 'ש שנשמעת כמו ס', example: '"סמס" במקום "שמש"', fades: 'אצל רבים מהילדים עד גיל 5 בערך' },
  { name: 'ר שמוחלפת ב־ל או ב־י', example: '"לכבת" או "יכבת" במקום "רכבת"', fades: 'בדרך כלל עד גיל 4–4.5 בערך' },
]

export const soundById = id => SOUNDS.find(s => s.id === id)
export const groupById = id => SOUND_GROUPS.find(g => g.id === id)
