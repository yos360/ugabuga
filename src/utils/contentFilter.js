// Inappropriate-text filter for everything visitors write that other people see (walls, RSVP, live-game
// nicknames, quizzes, lists…). The server enforces the same rules (gt_bad_text / gt_no_links in
// supabase/migrations/202610220001_content_filter.sql) — keep the two lists in sync; tests/content-filter
// checks this file. Kept deliberately to clear cases (sexual terms, strong profanity, slurs, threats),
// so ordinary words and mild expressions are never blocked.

// Hebrew stems are written after normalization: no nikud, final letters as regular letters, and
// repeated letters collapsed (מזדיין → מזדינ), final letters written as regular ones (כושים → כושימ). STEM matches with any suffix; WORD only as a whole word.
const HE_STEM = ['זונה', 'זונות', 'שרמוט', 'זיונ', 'לזינ', 'מזדינ', 'תזדינ', 'הזדינ', 'כוסאמא', 'כוסאמק', 'כוסעמק', 'כוס אמא', 'כוס אמק', 'כוס עמק', 'פורנ', 'חרמנ', 'ציצימ', 'מניאק', 'קוקסינל', 'ערבוש', 'שמוק', 'אהרוג אות']
const HE_WORD = ['סקס', 'סקסי', 'סקסית', 'חרא', 'כושי', 'כושימ', 'מפגר', 'מפגרת', 'מפגרימ', 'תמות', 'תמותי']
const EN_STEM = ['fuck', 'fuk', 'fck', 'shit', 'sh1t', 'bitch', 'cunt', 'porn', 'nigg', 'faggot', 'retard', 'asshole', 'whore', 'slut', 'pussy']
const EN_WORD = ['sex', 'sexy', 'dick', 'dicks', 'fag', 'fags', 'bastard']

const FINALS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
export function normalizeForFilter(s) {
  return String(s || '').toLowerCase()
    .replace(/[֑-ׇ​-‏‪-‮]/g, '') // nikud, cantillation, invisible marks
    .replace(/[ךםןףץ]/g, c => FINALS[c])
    .replace(/[.\-_*'"׳״|~`^+]+/g, '') // ס.ק.ס, f_u_c_k
    .replace(/([א-ת])\1+/g, '$1') // שרמוטההה, זוווונה
    .replace(/\s+/g, ' ')
}
const B = '[^א-תa-z0-9]'
const PRE = '[והבלמשכ]{0,2}'
const BAD = new RegExp(`(^|${B})(${PRE}(${HE_STEM.join('|')})|${PRE}(${HE_WORD.join('|')})(?=$|${B})|(${EN_STEM.join('|')})|(${EN_WORD.join('|')})(?=$|${B}))`)
export const isInappropriate = s => BAD.test(normalizeForFilter(s))

// Links and contact handles: web addresses (also with spaces around the dot), "נקודה קום"/"dot com",
// e-mail addresses, @usernames and the social networks/messengers a stranger could be reached on.
const TLD = 'com|co\\.il|co|net|org|io|xyz|info|gg|site|me|ly|app|link|ru|tk|top|shop|online|club|tv|live|biz'
const SOCIAL = 'טיקטוק|טיק טוק|tiktok|tik tok|אינסטגרמ|אינסטגרם|אינסטה|instagram|insta|פייסבוק|facebook|יוטיוב|יו טיוב|youtube|youtu|סנאפ|snapchat|snap|טלגרמ|טלגרם|telegram|דיסקורד|discord|וואטסאפ|ווטסאפ|whatsapp|טוויטר|twitter|threads|רובלוקס|roblox'
const LINK = new RegExp(`(https?://|www\\.|[a-z0-9-]+\\s*\\.\\s*(${TLD})($|[^a-z])|נקודה\\s*קום|דוט\\s*קום|dot\\s*com|[a-z0-9._-]+@[a-z0-9-]+|(^|\\s)@[a-z0-9._]{3,}|(^|[^a-z])(${SOCIAL})(?![a-z]))`, 'i')
export const hasLink = s => LINK.test(String(s || ''))
// Phone numbers — blocked only where children write (walls, game nicknames), not on a parent's invitation.
const PHONE = /(\+?972|0)[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{4}|\d{3}[\s-]?\d{3}[\s-]?\d{4}/
export const hasPhone = s => PHONE.test(String(s || ''))

// The message a form shows for a blocked text (same codes the server raises).
export const FILTER_MESSAGES = {
  inappropriate: 'הטקסט כולל מילים שלא מתאימות לאתר לילדים. נסחו אחרת, בבקשה.',
  no_links: 'אי אפשר להוסיף קישורים, כתובות או שמות משתמש ברשתות חברתיות. כתבו טקסט בלבד.',
  no_contact: 'אי אפשר לכתוב מספר טלפון. כתבו טקסט בלבד.',
}
export const filterProblem = s => (hasLink(s) ? 'no_links' : isInappropriate(s) ? 'inappropriate' : '')
// The exact patterns the SQL migration uses (tests/content-filter.test.mjs checks they match).
export const SQL_PATTERNS = { bad: BAD.source, link: LINK.source, phone: PHONE.source }
