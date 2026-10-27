// "קוראים רק מה שלמדנו" — first-grade reading practice built from the letters and vowel sounds a child
// already knows. Words and sentences are written with full nikud; which letters and sounds each one needs
// is worked out from the text itself (analyze), so a word can never be filed under the wrong letters.
// ו with holam (וֹ) or with a dot (וּ) counts as a vowel sign, not as the letter ו — that is how first
// grade teaches them. Final letters count as their base letter, and a silent shva at the end of a word
// (מֶלֶךְ) doesn't make the word need the shva sound.

export const LETTERS = [...'אבגדהוזחטיכלמנסעפצקרשת']
export const SOUNDS = [
  { id: 'a', label: 'אַ', name: 'קָמָץ וּפַתָּח' },
  { id: 'e', label: 'אֶ', name: 'סֶגּוֹל וְצֵירֵה' },
  { id: 'i', label: 'אִ', name: 'חִירִיק' },
  { id: 'o', label: 'אוֹ', name: 'חוֹלָם' },
  { id: 'u', label: 'אוּ', name: 'שׁוּרוּק וְקֻבּוּץ' },
  { id: 'shva', label: 'אְ', name: 'שְׁוָא' },
]
const FINAL = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
const MARK = { 'ָ': 'a', 'ַ': 'a', 'ֲ': 'a', 'ֶ': 'e', 'ֵ': 'e', 'ֱ': 'e', 'ִ': 'i', 'ֹ': 'o', 'ֺ': 'o', 'ֳ': 'o', 'ֻ': 'u', 'ְ': 'shva' }
const DAGESH = 'ּ'
const isLetter = ch => /[א-ת]/.test(ch)

// Letters and sounds a word or sentence needs.
export function analyze(text) {
  const letters = new Set(), sounds = new Set(), chars = [...text]
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    if (!isLetter(ch)) continue
    const marks = []
    while (i + 1 < chars.length && /[֑-ׇ]/.test(chars[i + 1])) marks.push(chars[++i])
    if (ch === 'ו' && marks.includes('ֹ') && marks.length === 1) { sounds.add('o'); continue }
    if (ch === 'ו' && marks.length === 1 && marks[0] === DAGESH) { sounds.add('u'); continue }
    letters.add(FINAL[ch] || ch)
    const last = !(i + 1 < chars.length && isLetter(chars[i + 1])) // a shva at the end of a word (ךְ) is silent
    for (const m of marks) if (MARK[m] && !(MARK[m] === 'shva' && last)) sounds.add(MARK[m])
  }
  return { letters: [...letters], sounds: [...sounds] }
}
export const readable = (text, letters, sounds) => { const a = analyze(text); return a.letters.every(l => letters.includes(l)) && a.sounds.every(s => sounds.includes(s)) }

export const WORDS = [
  // אַ
  'אַבָּא', 'סַבָּא', 'דָּג', 'יָם', 'גַּן', 'גָּמָל', 'סַל', 'פַּח', 'חַם', 'קַר', 'שָׁם', 'זָז', 'נָח', 'טַל', 'כַּף', 'דַּף', 'בָּא', 'בָּאָה',
  'גָּדַל', 'כָּתַב', 'אָכַל', 'שָׁתָה', 'קָם', 'רָץ', 'חָלָב', 'בָּנָנָה', 'מַפָּה', 'תָּמָר', 'דָּנָה', 'מַתָּנָה', 'שַׁבָּת', 'עַגָּלָה', 'גַּל',
  'חַג', 'פָּרָה', 'כָּל', 'מָה', 'לָמָּה', 'הַר', 'נָהָר', 'צָב', 'זָנָב', 'כָּנָף', 'אָדָם', 'יָד', 'בַּת', 'אַתָּה', 'רָאָה', 'שָׁר', 'שָׁרָה',
  'קָרָא', 'טָעַם', 'גָּר', 'דָּבָר', 'חַלָּה', 'מַלְכָּה', 'שָׂפָה', 'לַחַץ', 'פַּס', 'נָמָל', 'עָנָן', 'סָבְתָא', 'בַּקְבּוּק',
  // אֶ
  'כֶּלֶב', 'יֶלֶד', 'סֵפֶר', 'שֶׁמֶשׁ', 'בֵּן', 'עֵץ', 'אֵם', 'דֶּלֶת', 'גֶּשֶׁם', 'רֶגֶל', 'לֶחֶם', 'מֶלֶךְ', 'כֶּסֶף', 'פֶּרַח', 'חֶדֶר',
  'בֶּגֶד', 'שֵׁן', 'אֵשׁ', 'קֵן', 'נֵר', 'תֵּה', 'פֶּה', 'זֶה', 'גֶּזֶר', 'שֶׁלֶג', 'אֶבֶן', 'דֶּרֶךְ', 'כֶּתֶר', 'מְעִיל', 'הֵם',
  // אִ
  'אִמָּא', 'אִישׁ', 'שִׁיר', 'עִיר', 'פִּיל', 'קִיר', 'סִיר', 'תִּיק', 'בִּיצָה', 'מִטָּה', 'כִּתָּה', 'טָעִים', 'גִּיל', 'דָּנִי', 'חִיּוּךְ',
  'נִמְלָה', 'מִכְתָּב', 'תִּירָס', 'עִפָּרוֹן', 'אִילָן', 'גְּבִינָה', 'יְלָדִים', 'שָׁמַיִם', 'מַיִם', 'בַּיִת', 'עֵינַיִם',
  // אוֹ
  'שָׁלוֹם', 'אוֹר', 'קוֹל', 'טוֹב', 'יוֹם', 'חוֹל', 'בּוֹר', 'דּוֹד', 'גּוֹזָל', 'צִפּוֹר', 'כּוֹבַע', 'מָקוֹם', 'לֹא', 'אָרוֹן', 'חֲלוֹם',
  'עוֹף', 'נוֹף', 'דֹּב', 'גָּדוֹל', 'קָטֹן', 'חֹרֶף', 'בֹּקֶר', 'אֹהֶל', 'סוֹף', 'שָׁעוֹן', 'מָגֵן', 'רֹאשׁ', 'אוֹטוֹ', 'כּוֹכָב',
  // אוּ
  'סוּס', 'שׁוּק', 'קוּם', 'רוּץ', 'חוּם', 'תּוּת', 'גּוּף', 'לוּחַ', 'חָתוּל', 'סִפּוּר', 'תַּפּוּחַ', 'כַּדּוּר', 'צוּר', 'פּוּךְ',
  'תְּמוּנָה', 'סֻכָּה', 'דֻּבְדְּבָן', 'שֻׁלְחָן', 'מְנוּחָה', 'אֲרוּחָה', 'גּוּר',
  // שְׁוָא
  'פַּרְפַּר', 'בְּרָכָה', 'אַרְנָב', 'מַחְבֶּרֶת', 'אֶצְבַּע', 'יַלְדָּה', 'שְׁתֵּי', 'כְּתֹם', 'סְבָבוֹן', 'מְכוֹנִית',
]

export const SENTENCES = [
  'אַבָּא בָּא.', 'דָּנָה בָּאָה.', 'סַבָּא כָּתַב.', 'תָּמָר שָׁתָה.', 'גָּמָל אָכַל.', 'דָּג בַּיָּם.', 'מָה בַּסַּל?', 'חַם בַּגַּן.', 'שַׁבָּת בָּאָה.',
  'סַבָּא שָׁר.', 'צָב בַּגַּן.', 'אַתָּה בָּא?', 'דָּנָה רָאֲתָה גָּמָל.', 'הַגַּל גָּדַל.', 'תָּמָר אָכְלָה בָּנָנָה.',
  'הַיֶּלֶד רָץ.', 'יֶלֶד אָכַל לֶחֶם.', 'הַכֶּלֶב בַּגַּן.', 'גֶּשֶׁם בָּא.', 'הַשֶּׁמֶשׁ חַמָּה.', 'דָּנָה קָרְאָה סֵפֶר.', 'זֶה הַבֵּן שֶׁל אַבָּא.',
  'אִמָּא בָּאָה.', 'אִמָּא שָׁרָה שִׁיר.', 'הַתִּיק בַּכִּתָּה.', 'דָּנִי אָכַל בִּיצָה.', 'הַפִּיל גָּדוֹל.',
  'שָׁלוֹם אַבָּא!', 'יוֹם טוֹב!', 'הַצִּפּוֹר שָׁרָה.', 'לֹא קַר.', 'הַדֹּב קָטֹן.', 'בֹּקֶר טוֹב, דָּנָה!',
  'הַסּוּס רָץ.', 'הֶחָתוּל אָכַל.', 'הַתַּפּוּחַ טָעִים.', 'אִמָּא קָנְתָה תּוּת.', 'הַכַּדּוּר בַּגַּן.',
  'הַיְּלָדִים בַּגַּן.', 'יַלְדָּה כָּתְבָה מִכְתָּב.', 'פַּרְפַּר בַּגַּן.', 'אַרְנָב אָכַל גֶּזֶר.',
]

// Syllable for the grid: letter + sound (בּ כּ פּ with a dot, as first grade reads them).
const SIGN = { a: 'ָ', e: 'ֶ', i: 'ִ', shva: 'ְ' }
export function syllable(letter, sound) {
  const base = 'בכפ'.includes(letter) ? letter + DAGESH : letter === 'ש' ? 'שׁ' : letter
  if (sound === 'o') return base + 'ֹ'
  if (sound === 'u') return base + 'וּ'
  return base + SIGN[sound]
}
