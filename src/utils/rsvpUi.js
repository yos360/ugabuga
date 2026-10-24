// Organizer-side (and page) text of the RSVP tool, in Hebrew (/rsvp, /r/<code>) and English
// (/en/rsvp, /en/r/<code>). Guest-form text lives in rsvpI18n.js (four languages).
// Both languages must have exactly the same keys (tests/rsvp-english.test.mjs).
import { formatDate, peopleLabel, countLabel, rsvpInviteText, rsvpReminderText } from './groupTools.js'
import { formatDateIn } from './rsvpI18n.js'

// Participation fee currencies (stored in the event's extras; Hebrew events have none = shekels).
export const CURRENCIES = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'ILS']
const EURO = /^(?:IE|DE|FR|ES|IT|NL|BE|AT|PT|FI|GR|LU|SK|SI|EE|LV|LT|MT|CY|HR)$/
export function guessCurrency(locale = (typeof navigator !== 'undefined' && navigator.language) || '') {
  const [langPart, region = ''] = String(locale).split(/[-_]/)
  if (langPart === 'he' || region === 'IL') return 'ILS'
  if (region === 'GB') return 'GBP'
  if (region === 'CA') return 'CAD'
  if (region === 'AU') return 'AUD'
  return EURO.test(region) ? 'EUR' : 'USD'
}
// "50 ₪" in Hebrew (as before), "$50" / "£12.50" / "₪50" in English.
export function money(lang, amount, currency) {
  const n = Number(amount) || 0
  const cur = CURRENCIES.includes(currency) ? currency : 'ILS'
  if (lang === 'he' && cur === 'ILS') return `${n.toLocaleString('he-IL')} ₪`
  const digits = Number.isInteger(n) ? 0 : 2
  try { return new Intl.NumberFormat(lang === 'he' ? 'he-IL' : 'en-US', { style: 'currency', currency: cur, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n) } catch { return `${n} ${cur}` }
}
// Payment links the database accepts (see gt_filter_row in 202610220001_content_filter.sql).
export const PAY_LINK = /^https:\/\/([a-z0-9-]+\.)*(paypal\.me|paypal\.com|payboxapp\.com|payboxapp\.page\.link|bitpay\.co\.il|venmo\.com|revolut\.me|revolut\.com|cash\.app|monzo\.me|wise\.com|buy\.stripe\.com|square\.link|checkout\.square\.site|pay\.google\.com|ko-fi\.com|buymeacoffee\.com)(\/|$)/i

// "Noah, Ava and Liam"
export const enList = items => items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
const enCount = (n, one, many) => Number(n) === 1 ? `1 ${one}` : `${Number(n) || 0} ${many}`
const enPeople = (kids, adults) => [Number(kids) > 0 && enCount(kids, 'child', 'children'), Number(adults) > 0 && enCount(adults, 'adult', 'adults')].filter(Boolean).join(' + ')
const enDate = iso => formatDateIn('en', iso)

const he = {
  base: '',
  defaultTitle: 'יום ההולדת של ___',
  date: iso => formatDate(iso),
  people: (kids, adults) => peopleLabel(kids, adults),
  inviteText: (ev, link) => rsvpInviteText(ev, link),
  reminderText: (ev, missing, link) => rsvpReminderText(ev, missing, link),
  error: null, // groupErrorText (Hebrew) is the default
  // event form
  kindGroup: 'סוג האירוע',
  kinds: { kids: '🎈 מסיבת ילדים', general: '🥂 אירוע אחר' },
  eventName: 'שם האירוע', eventNamePh: 'למשל: יום ההולדת של נועה',
  dateLabel: 'תאריך', timeLabel: 'שעה', timePh: '17:00–19:00',
  place: 'מקום', placePh: 'כתובת, שם הגן או הפארק',
  deadline: 'לאשר עד', optional: '(לא חובה)',
  guestNote: 'הערה לאורחים', guestNotePh: 'למשל: להביא בגד ים, בלי מתנות',
  invitees: 'רשימת מוזמנים', inviteesHint: '(לא חובה — שם בכל שורה, כדי לראות מי עוד לא ענה)', inviteesPh: 'נועה\nיואב\nאורי',
  inviteeCount: (n, max) => `${n} מוזמנים${n >= max ? ` (עד ${max})` : ''}`,
  pinLabel: '🔑 קוד מארגן — 4 ספרות שתזכרו', pinAria: 'קוד מארגן',
  pinHelp: 'כדי לראות את התשובות מכל טלפון: פותחים את הקישור ששלחתם לאורחים, לוחצים „אני המארגן/ת” ומקלידים את הקוד.',
  privacyNote: 'שמות פרטיים בלבד. הדף נמחק אוטומטית חודשיים אחרי האירוע.',
  wait: 'רגע…',
  // extras
  extrasTitle: '⚙️ אפשרויות נוספות',
  guestLang: '🌍 שפת הטופס לאורחים', guestLangHint: '(כל אורח יכול גם להחליף בעצמו)',
  parking: '🅿️ חנייה והגעה', parkingHint: '(מופיע לאורחים ליד כפתורי Waze ו-Google Maps)', parkingPh: 'למשל: חניה חינם ברחוב הסמוך, כניסה מהשער האחורי',
  fee: '💳 דמי השתתפות', feePh: '₪', currency: null, currencyAria: 'מטבע',
  payLink: 'קישור לתשלום', payHint: '(ביט, פייבוקס או PayPal)', payLinkBad: 'קישור התשלום צריך להיות של ביט, פייבוקס או PayPal — אחרת הוא לא יוצג לאורחים.',
  tables: '🪑 מספר שולחנות', showTable: 'להציג לכל אורח את השולחן שלו',
  feeNote: 'דמי השתתפות: האתר לא גובה כסף — רק מציג לאורחים את הסכום והקישור, ובדף הניהול מסמנים מי שילם.',
  // guest (legacy page) and answer form
  pickFromList: 'בחירה מהרשימה', answerGroup: 'תשובה',
  status: { yes: 'מגיעים', maybe: 'אולי', no: 'לא מגיעים' },
  replyBy: d => `נשמח לתשובה עד ${d}`,
  yesSoFar: n => `🎉 כבר ${n} אישרו הגעה`,
  rsvpHeading: 'אישור הגעה', sentThanks: '✓ התשובה נשלחה. תודה!',
  guestDone: { yes: 'נתראה שם!', maybe: 'רשמנו "אולי"', no: 'חבל, נתגעגע!' },
  changeReply: '✏️ שינוי התשובה', addCalendar: '🗓️ הוספה ליומן',
  // organizer code
  pinWrong: 'הקוד לא נכון. נסו שוב.', imHost: '🔑 אני המארגן/ת', hostLogin: '🔑 כניסה למארגנים',
  hostLoginHelp: 'הקלידו את קוד המארגן (4 ספרות) שבחרתם כשיצרתם את האירוע.', enter: 'כניסה',
  pinSaved: '✓ קוד המארגן נשמר', hasPin: '🔑 יש קוד מארגן: פותחים את הקישור מכל טלפון ולוחצים „אני המארגן/ת”.', changePin: 'שינוי הקוד',
  newPin: 'קוד מארגן חדש', choosePin: 'בחרו קוד מארגן (4 ספרות)',
  pinHelp2: 'כדי לראות את התשובות גם מטלפון אחר: פותחים את הקישור, לוחצים „אני המארגן/ת” ומקלידים את הקוד.', save: 'שמירה',
  // host view
  updated: '✓ הפרטים עודכנו',
  csvName: title => `אישורי הגעה - ${title}.csv`,
  csvHeaders: ['שם', 'תשובה', 'ילדים', 'מבוגרים', 'אלרגיות', 'מי אוסף', 'הערה'],
  editTitle: 'עריכת פרטי האירוע', cancel: 'ביטול', editDetails: '✏️ עריכת פרטים',
  summaryAria: 'סיכום',
  statPeople: 'אנשים מגיעים', statYes: 'מגיעים', statKids: 'ילדים', statAdults: 'מבוגרים', statMaybeV2: 'תשובות אולי', statMaybe: 'אולי',
  statNoV2: 'תשובות לא', statNo: 'לא מגיעים', statMissing: 'טרם ענו',
  summaryLine: (yes, total, answered, invited) => `${yes} תשובות „מגיעים” · ${total} תשובות בסך הכול${invited > 0 ? ` · ${answered} מתוך ${invited} שמות ברשימת המוזמנים ענו` : ''}`,
  maybeMore: label => `ועוד „אולי”: ${label || 'בלי מספר'}`,
  allergiesTitle: '⚠️ אלרגיות ורגישויות',
  paidMain: (paid, coming, collected) => `💳 שילמו ${paid} מתוך ${coming} · נאסף ${collected}`,
  paidPer: price => `(לפי ${price} לכל תשובה)`,
  replies: n => `התשובות (${n})`,
  refresh: 'רענון', print: '🖨️ הדפסה', excel: '⬇️ אקסל',
  searchLabel: 'חיפוש לפי שם', searchPh: 'שם הילד או המשפחה', filterAria: 'סינון תשובות',
  filters: { all: 'כל התשובות', yes: 'מגיעים', maybe: 'אולי', no: 'לא מגיעים', allergies: 'אלרגיות ורגישויות' },
  showing: (n, total) => `מוצגות ${n} מתוך ${total} תשובות. ההדפסה והייצוא כוללים את הרשימה המוצגת.`,
  noMatch: 'אין תשובות שמתאימות לחיפוש.', showAll: 'הצגת הכול',
  noReplies: 'עוד אין תשובות. שלחו את הקישור לקבוצה 👇 — התשובות יופיעו כאן מעצמן.',
  deleteReplyAria: name => `מחיקת התשובה של ${name}`,
  paid: '✓ שילם/ה', notPaid: '💳 לא שילם/ה', tableOf: name => `שולחן של ${name}`, noTable: '🪑 בלי שולחן', tableN: n => `שולחן ${n}`,
  sendTitle: 'שולחים לאורחים', sendWa: '📱 שליחה בוואטסאפ', copyLink: '🔗 העתקת קישור', linkCopied: 'הקישור הועתק ✓ הדביקו אותו בוואטסאפ', linkLabel: 'הקישור:',
  qr: null, qrDownload: null,
  invitation: code => ({ to: `/invitation?rsvp=${code}`, label: '📨 הזמנה מעוצבת עם הקישור' }),
  bringList: { to: '/tools/bring-list?for=birthday', label: '🧺 רשימת מי מביא מה' },
  reminderTitle: '⏰ תזכורת למי שלא ענה', allAnswered: 'כל המוזמנים ענו 🎉',
  addListHint: 'רוצים לראות בדיוק מי לא ענה? הוסיפו רשימת מוזמנים ב„עריכת פרטים”.',
  reminderWa: '💬 העתקת תזכורת לוואטסאפ', reminderCopy: '📋 העתקת נוסח התזכורת', reminderCopied: 'התזכורת הועתקה',
  guestPreview: '👀 איך זה נראה לאורחים',
  organizerCopied: 'קישור הניהול הועתק ✓ שמרו אותו לעצמכם בלבד',
  organizerTools: { ask: 'פותחים מטלפון אחר או מתוך וואטסאפ?', copy: '🔑 העתקת קישור ניהול', keep: '— שמרו אותו לעצמכם בלבד.', remove: '🗑️ מחיקת האירוע' },
  deleteEvent: { title: 'למחוק את האירוע?', text: 'כל התשובות יימחקו, והקישור יפסיק לעבוד לכולם. אי אפשר לשחזר.', yes: 'כן, למחוק' },
  deleteReply: { title: name => `למחוק את התשובה של ${name}?`, text: 'מתאים לתשובה כפולה או שגויה. מי שענה יוכל לענות שוב.', yes: 'מחיקה' },
  seatingPrintTitle: title => `סידורי הושבה — ${title}`,
  printTitle: title => `אישורי הגעה — ${title}`,
  printHead: (enhanced, t) => enhanced ? `סיכום האירוע — אנשים מגיעים: ${t.people}` : `מגיעים: ${t.yes}`,
  printRest: (t, missing) => ` (${countLabel(t.kids, 'ילד אחד', 'ילדים')}, ${countLabel(t.adults, 'מבוגר אחד', 'מבוגרים')}) · אולי: ${t.maybe} · לא מגיעים: ${t.no}${missing != null ? ` · טרם ענו: ${missing}` : ''}`,
  printList: (label, search, n) => `הרשימה המודפסת: ${label}${search ? ` · חיפוש: ${search}` : ''} · ${n} תשובות`,
  missingPrint: 'טרם ענו:', listJoin: ', ',
  // seating
  seatingTitle: '🪑 סידורי הושבה', entranceList: '🖨️ רשימה לכניסה',
  seatingHelp: show => `בוחרים שולחן לכל תשובה ברשימה למעלה. ${show ? 'כל אורח רואה את השולחן שלו כשהוא פותח את הקישור.' : 'האורחים לא רואים את השולחנות.'}`,
  seats: n => `· ${n} מקומות`, empty: 'ריק', unseated: n => `עוד בלי שולחן (${n}):`, seatHeaders: ['שם', 'שולחן', 'מקומות'],
  // page
  deleted: '🗑️ האירוע נמחק', newEvent: 'יצירת אירוע חדש', newRsvp: 'יצירת אישור הגעה חדש', loading: 'טוענים…',
  createBtn: '✅ יצירת קישור לאישור הגעה', detailsTitle: 'פרטי האירוע', myEvents: 'האירועים שלי:',
  created: '✓ האירוע נוצר! עכשיו שולחים את הקישור', hostIn: '✓ נכנסת לניהול האירוע',
  eventTitle: title => `אישור הגעה — ${title}`,
  crumbs: { home: 'ראשי', tools: 'כלים', vaad: 'ועד הורים', rsvp: 'אישור הגעה' },
  // invitation preview and create screen (RsvpExperience)
  themeLegend: 'העיצוב של ההזמנה',
  themes: { party: 'חגיגה צבעונית', garden: 'חגיגה בטבע', sky: 'כחול וחלומות', elegant: 'חגיגי וקלאסי' },
  previewNote: 'כך האורחים יראו את ההזמנה', ourEvent: 'האירוע שלנו',
  createTitle: 'בואו נכין את ההזמנה שלכם', infoTitle: 'מהרגע ששולחים — הכול מסודר',
  infoList: ['✓ אורחים עונים בלי הרשמה', '✓ סיכום ילדים ומבוגרים שמגיעים', '✓ חיפוש, סינון, אלרגיות ותזכורות', '✓ הורדה לאקסל והדפסת הרשימה'],
  infoFoot: 'בחינם. קישור ניהול אישי למארגנים.', myEventsTitle: 'האירועים שלי',
  typeLinksTitle: 'אישור הגעה לפי סוג אירוע', tipsTitle: name => `טיפים: ${name}`,
}

const en = {
  base: '/en',
  defaultTitle: "___'s birthday party",
  date: enDate,
  people: enPeople,
  inviteText: (ev, link) => {
    const when = [enDate(ev.date), ev.time && `at ${ev.time}`].filter(Boolean).join(' ')
    return [`🎉 ${ev.title}`, when && `📅 ${when}`, ev.place && `📍 ${ev.place}`, `✅ Please RSVP${ev.deadline ? ` by ${enDate(ev.deadline)}` : ''} — it takes one tap:`, link].filter(Boolean).join('\n')
  },
  reminderText: (ev, missing, link) => [
    missing.length ? `⏰ A quick reminder about ${ev.title}: we haven’t heard from ${enList(missing)} yet.` : `⏰ A quick reminder about ${ev.title}: if you haven’t replied yet, now’s the time 🙂`,
    ev.deadline ? `Please reply by ${enDate(ev.deadline)} — it only takes a tap 🙏` : 'Please reply with one tap, so we know how much to prepare 🙏', link].join('\n'),
  error: code => ({
    not_installed: 'This tool is still being set up and will be ready very soon. Please try again later 🙏',
    not_found: 'We couldn’t find this page. The link may be incomplete or deleted, or the event was a long time ago.',
    not_owner: 'Only the person who created this page can change it from this device.',
    no_pin: 'No host code was set for this event. Open it on the phone you created it on.',
    pin_locked: 'Too many attempts. Open the event on the phone you created it on and set a new code.',
    bad_pin: 'The host code is 4 digits.',
    rate_limited: 'Too many actions in a short time. Wait a few minutes and try again.',
    event_full: 'This event has reached the maximum number of replies.',
    name_required: 'Please write a name.',
    bad_status: "Choose: coming, can't come or maybe.",
    bad_number: 'The number of people isn’t valid.',
    bad_token: 'Something went wrong on this device. Refresh the page and try again.',
    no_links: 'Links, web addresses and social media handles can’t be added. Please write text only.',
    inappropriate: 'The text includes words that aren’t suitable for a family site. Please rephrase.',
    no_contact: 'Phone numbers can’t be added. Please write text only.',
    bad_pay_link: 'Please use a payment link from PayPal, Venmo, Revolut, Cash App, Monzo, Wise, Stripe or Square.',
  }[code] || 'Something went wrong with the connection. Please try again in a moment.'),
  kindGroup: 'Event type',
  kinds: { kids: '🎈 Kids’ party', general: '🥂 Other event' },
  eventName: 'Event name', eventNamePh: 'e.g. Noah’s 7th birthday',
  dateLabel: 'Date', timeLabel: 'Time', timePh: '4:00–6:00 pm',
  place: 'Place', placePh: 'Address, venue or park',
  deadline: 'Reply by', optional: '(optional)',
  guestNote: 'Note for guests', guestNotePh: 'e.g. Bring a swimsuit. No gifts, please.',
  invitees: 'Guest list', inviteesHint: '(optional — one name per line, so you can see who hasn’t replied)', inviteesPh: 'Noah\nAva\nLiam',
  inviteeCount: (n, max) => `${n} ${n === 1 ? 'guest' : 'guests'}${n >= max ? ` (up to ${max})` : ''}`,
  pinLabel: '🔑 Host code (4 digits)', pinAria: 'Host code',
  pinHelp: 'To see the replies on any phone, open the link you sent your guests, tap “I’m the host” and enter this code.',
  privacyNote: 'First names only. The page is deleted automatically two months after the event.',
  wait: 'One moment…',
  extrasTitle: '⚙️ More options',
  guestLang: '🌍 Language for guests', guestLangHint: '(each guest can also switch it)',
  parking: '🅿️ Parking & directions', parkingHint: '(shown to guests next to the Waze and Google Maps buttons)', parkingPh: 'e.g. Free parking on the next street; use the back gate',
  fee: '💳 Contribution', feePh: 'Amount', currency: 'Currency', currencyAria: 'Currency',
  payLink: 'Payment link', payHint: '(PayPal, Venmo, Revolut, Cash App and more)', payLinkBad: 'This link isn’t from a payment service we support (PayPal, Venmo, Revolut, Cash App, Monzo, Wise, Stripe, Square), so it won’t be shown to guests.',
  tables: '🪑 Tables', showTable: 'Show each guest their table',
  feeNote: 'About contributions: we never handle money. Guests just see the amount and your link, and you tick off who has paid.',
  pickFromList: 'Choose from the list', answerGroup: 'Reply',
  status: { yes: 'Coming', maybe: 'Maybe', no: "Can't come" },
  replyBy: d => `Please reply by ${d}`,
  yesSoFar: n => `🎉 ${n} have said yes so far`,
  rsvpHeading: 'RSVP', sentThanks: '✓ Reply sent. Thank you!',
  guestDone: { yes: 'See you there!', maybe: 'We’ve noted “maybe”', no: 'Sorry you can’t make it!' },
  changeReply: '✏️ Change reply', addCalendar: '🗓️ Add to calendar',
  pinWrong: 'That code isn’t right. Please try again.', imHost: '🔑 I’m the host', hostLogin: '🔑 Host sign-in',
  hostLoginHelp: 'Enter the 4-digit host code you chose when you created the event.', enter: 'Continue',
  pinSaved: '✓ Host code saved', hasPin: '🔑 Host code is set: open the link on any phone and tap “I’m the host”.', changePin: 'Change code',
  newPin: 'New host code', choosePin: 'Choose a 4-digit host code',
  pinHelp2: 'To see the replies on another phone too, open the link, tap “I’m the host” and enter the code.', save: 'Save',
  updated: '✓ Details updated',
  csvName: title => `RSVPs - ${title}.csv`,
  csvHeaders: ['Name', 'Reply', 'Children', 'Adults', 'Allergies', 'Pickup', 'Note'],
  editTitle: 'Edit event details', cancel: 'Cancel', editDetails: '✏️ Edit details',
  summaryAria: 'Summary',
  statPeople: 'People coming', statYes: 'Coming', statKids: 'Children', statAdults: 'Adults', statMaybeV2: '“Maybe” replies', statMaybe: 'Maybe',
  statNoV2: '“No” replies', statNo: "Can't come", statMissing: 'No reply yet',
  summaryLine: (yes, total, answered, invited) => `${yes} “coming” ${yes === 1 ? 'reply' : 'replies'} · ${total} ${total === 1 ? 'reply' : 'replies'} in total${invited > 0 ? ` · ${answered} of the ${invited} names on your guest list have replied` : ''}`,
  maybeMore: label => `Plus “maybe”: ${label || 'no number given'}`,
  allergiesTitle: '⚠️ Allergies & dietary needs',
  paidMain: (paid, coming, collected) => `💳 ${paid} of ${coming} paid · ${collected} collected`,
  paidPer: price => `(${price} per reply)`,
  replies: n => `Replies (${n})`,
  refresh: 'Refresh', print: '🖨️ Print', excel: '⬇️ Excel / CSV',
  searchLabel: 'Search by name', searchPh: 'Child’s or family name', filterAria: 'Filter replies',
  filters: { all: 'All replies', yes: 'Coming', maybe: 'Maybe', no: "Can't come", allergies: 'Allergies & dietary needs' },
  showing: (n, total) => `Showing ${n} of ${total} ${total === 1 ? 'reply' : 'replies'}. Printing and export use the list shown.`,
  noMatch: 'No replies match your search.', showAll: 'Show all',
  noReplies: 'No replies yet. Send the link to your guests — their replies will appear here automatically.',
  deleteReplyAria: name => `Delete ${name}’s reply`,
  paid: '✓ Paid', notPaid: '💳 Not paid', tableOf: name => `Table for ${name}`, noTable: '🪑 No table', tableN: n => `Table ${n}`,
  sendTitle: 'Send to your guests', sendWa: '📱 Send on WhatsApp', copyLink: '🔗 Copy link', linkCopied: 'Link copied ✓ Paste it into a message or group chat', linkLabel: 'Link:',
  qr: '📷 QR code for printed invitations', qrDownload: '⬇️ Download QR code',
  invitation: code => ({ to: `/en/birthday?rsvp=${code}`, label: '💌 Printable invitation with the link' }),
  bringList: null,
  reminderTitle: '⏰ Remind anyone who hasn’t replied', allAnswered: 'Everyone on your list has replied 🎉',
  addListHint: 'Want to see exactly who hasn’t replied? Add a guest list under “Edit details”.',
  reminderWa: '💬 Send a reminder on WhatsApp', reminderCopy: '📋 Copy the reminder text', reminderCopied: 'Reminder copied',
  guestPreview: '👀 See what guests see',
  organizerCopied: 'Host link copied ✓ Keep it to yourself',
  organizerTools: { ask: 'Opening it on another phone or from a chat app?', copy: '🔑 Copy the host link', keep: '— keep it to yourself.', remove: '🗑️ Delete this event' },
  deleteEvent: { title: 'Delete this event?', text: 'All replies will be deleted and the link will stop working for everyone. This can’t be undone.', yes: 'Yes, delete' },
  deleteReply: { title: name => `Delete ${name}’s reply?`, text: 'Useful for a duplicate or mistaken reply. They will be able to reply again.', yes: 'Delete' },
  seatingPrintTitle: title => `Seating plan — ${title}`,
  printTitle: title => `RSVPs — ${title}`,
  printHead: (enhanced, t) => enhanced ? `Event summary — people coming: ${t.people}` : `Coming: ${t.yes}`,
  printRest: (t, missing) => ` (${enCount(t.kids, 'child', 'children')}, ${enCount(t.adults, 'adult', 'adults')}) · Maybe: ${t.maybe} · Can’t come: ${t.no}${missing != null ? ` · No reply yet: ${missing}` : ''}`,
  printList: (label, search, n) => `Printed list: ${label}${search ? ` · Search: ${search}` : ''} · ${n} ${n === 1 ? 'reply' : 'replies'}`,
  missingPrint: 'No reply yet:', listJoin: ', ',
  seatingTitle: '🪑 Seating', entranceList: '🖨️ Entrance list',
  seatingHelp: show => `Pick a table for each reply in the list above. ${show ? 'Each guest sees their table when they open the link.' : 'Guests don’t see the tables.'}`,
  seats: n => `· ${n} ${n === 1 ? 'seat' : 'seats'}`, empty: 'Empty', unseated: n => `Still without a table (${n}):`, seatHeaders: ['Name', 'Table', 'Seats'],
  deleted: '🗑️ The event was deleted', newEvent: 'Create a new event', newRsvp: 'Create a new RSVP', loading: 'Loading…',
  createBtn: '✅ Create my RSVP link', detailsTitle: 'Event details', myEvents: 'My events:',
  created: '✓ Your event is ready! Now send the link', hostIn: '✓ You’re in the host view',
  eventTitle: title => `RSVP — ${title}`,
  crumbs: { home: 'Home', tools: null, vaad: null, rsvp: 'RSVP' },
  themeLegend: 'Invitation design',
  themes: { party: 'Colorful party', garden: 'Garden party', sky: 'Blue skies', elegant: 'Classic & elegant' },
  previewNote: 'This is what your guests will see', ourEvent: 'Our event',
  createTitle: 'Let’s make your invitation', infoTitle: 'Once it’s sent, everything’s in one place',
  infoList: ['✓ Guests reply without signing up', '✓ A count of the children and adults coming', '✓ Search, filters, allergies and reminders', '✓ Download to Excel and print the list'],
  infoFoot: 'Free. A private host link just for you.', myEventsTitle: 'My events',
  typeLinksTitle: 'RSVP pages by event type', tipsTitle: name => `Tips: ${name}`,
}

export const RSVP_UI = { he, en }
export const rsvpUi = lang => RSVP_UI[lang] || he
