// Shared data for the first-grade letter pages (/letters/nikud, /letters/cursive, /letters/final)
// and for scripts/audio/siteItems.mjs, which lists their texts for recording.
export const KAMATZ = 'ָ', PATACH = 'ַ'
export const SYL_LETTERS = [...'אבגדהוזחטיכלמנסעפצקרשת']
// a letter with kamatz / patach (with dagesh in ב כ פ, and shin dot), the way first graders read it
export const syl = (l, mark) => l + ('בכפ'.includes(l) ? 'ּ' : '') + (l === 'ש' ? 'ׁ' : '') + mark
export const NIKUD_WORDS = [['דָּג', '🐟'], ['יָם', '🌊'], ['יָד', '✋'], ['כַּף', '🥄'], ['פַּח', '🗑️'], ['דַּף', '📄'], ['גָּמָל', '🐫'], ['חָלָב', '🥛'], ['בָּנָנָה', '🍌'], ['סַבָּא', '👴'], ['אַבָּא', '👨'], ['נָחָשׁ', '🐍'], ['שַׁבָּת', '🕯️'], ['פָּרָה', '🐄'], ['תָּמָר', '🌴'], ['מַפָּה', '🗺️'], ['חַלָּה', '🍞'], ['שַׁעַר', '🚪'], ['גַּן', '🛝'], ['חַג', '🎉']]
export const FINAL_NAMES = { 'ך': 'כָּף סוֹפִית', 'ם': 'מֵם סוֹפִית', 'ן': 'נוּן סוֹפִית', 'ף': 'פֵּא סוֹפִית', 'ץ': 'צָדִי סוֹפִית' }
