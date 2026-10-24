// What a guest sees on an RSVP page, in the organizer's chosen language (the guest can switch).
// Hebrew is the source; organizer screens stay Hebrew.
export const RSVP_LANGS = [
  { id: 'he', label: 'עברית', dir: 'rtl', locale: 'he-IL' },
  { id: 'ar', label: 'العربية', dir: 'rtl', locale: 'ar' },
  { id: 'ru', label: 'Русский', dir: 'ltr', locale: 'ru-RU' },
  { id: 'en', label: 'English', dir: 'ltr', locale: 'en-GB' },
]
export const langInfo = id => RSVP_LANGS.find(l => l.id === id) || RSVP_LANGS[0]

const T = {
  invited: { he: 'אתם מוזמנים!', ar: 'أنتم مدعوون!', ru: 'Приглашаем вас!', en: "You're invited!" },
  answerUntil: { he: 'נשמח לאישור עד {d}', ar: 'نرجو الرد حتى {d}', ru: 'Пожалуйста, ответьте до {d}', en: 'Please reply by {d}' },
  maps: { he: 'ניווט ב-Google Maps', ar: 'الوصول عبر Google Maps', ru: 'Маршрут в Google Maps', en: 'Directions in Google Maps' },
  waze: { he: 'ניווט ב-Waze', ar: 'الوصول عبر Waze', ru: 'Маршрут в Waze', en: 'Directions in Waze' },
  calendar: { he: 'הוספה ליומן', ar: 'إضافة إلى التقويم', ru: 'Добавить в календарь', en: 'Add to calendar' },
  parking: { he: 'חנייה והגעה', ar: 'الوصول والموقف', ru: 'Как добраться и парковка', en: 'Getting there & parking' },
  glad: { he: 'נשמח לראות אתכם!', ar: 'يسعدنا حضوركم!', ru: 'Будем рады вас видеть!', en: "We'd love to see you!" },
  details: { he: 'כמה פרטים קטנים, כדי שנוכל להתכונן.', ar: 'بعض التفاصيل الصغيرة لنستعد جيدًا.', ru: 'Пара деталей, чтобы мы могли подготовиться.', en: 'A few details so we can get ready.' },
  childName: { he: 'שם הילד/ה', ar: 'اسم الطفل/ة', ru: 'Имя ребёнка', en: "Child's name" },
  yourName: { he: 'השם שלכם', ar: 'اسمكم', ru: 'Ваше имя', en: 'Your name' },
  phChild: { he: 'למשל: יואב', ar: 'مثلًا: يوسف', ru: 'Например: Миша', en: 'e.g. Noah' },
  phName: { he: 'למשל: משפחת לוי', ar: 'مثلًا: عائلة خوري', ru: 'Например: семья Ивановых', en: 'e.g. the Levy family' },
  yes: { he: 'מגיעים', ar: 'سنحضر', ru: 'Придём', en: 'Coming' },
  maybe: { he: 'אולי', ar: 'ربما', ru: 'Может быть', en: 'Maybe' },
  no: { he: 'לא מגיעים', ar: 'لن نحضر', ru: 'Не придём', en: "Can't come" },
  kids: { he: 'ילדים', ar: 'أطفال', ru: 'Дети', en: 'Children' },
  adults: { he: 'מבוגרים', ar: 'بالغون', ru: 'Взрослые', en: 'Adults' },
  adultsStay: { he: 'מבוגרים שנשארים', ar: 'بالغون يبقون', ru: 'Взрослые, которые останутся', en: 'Adults staying' },
  allergies: { he: 'אלרגיות או רגישויות במזון', ar: 'حساسية أو قيود غذائية', ru: 'Аллергии или ограничения в еде', en: 'Food allergies or needs' },
  optional: { he: '(לא חובה)', ar: '(اختياري)', ru: '(необязательно)', en: '(optional)' },
  phAllergies: { he: 'למשל: בוטנים, צמחוני', ar: 'مثلًا: فول سوداني، نباتي', ru: 'Например: арахис, вегетарианец', en: 'e.g. peanuts, vegetarian' },
  pickup: { he: 'מי אוסף בסוף?', ar: 'من سيأخذ الطفل في النهاية؟', ru: 'Кто заберёт ребёнка?', en: 'Who picks up at the end?' },
  phPickup: { he: 'למשל: אמא, ב-19:00', ar: 'مثلًا: الأم، الساعة 19:00', ru: 'Например: мама, в 19:00', en: 'e.g. Mom, at 7pm' },
  note: { he: 'הערה למארגנים', ar: 'ملاحظة للمنظمين', ru: 'Комментарий организаторам', en: 'Note to the hosts' },
  phNoteNo: { he: 'למשל: מצטערים, נהיה בחו״ל', ar: 'مثلًا: آسفون، سنكون مسافرين', ru: 'Например: жаль, мы будем в отъезде', en: "e.g. Sorry, we'll be away" },
  phNoteYes: { he: 'למשל: נגיע קצת באיחור', ar: 'مثلًا: سنتأخر قليلًا', ru: 'Например: немного опоздаем', en: "e.g. We'll be a bit late" },
  send: { he: 'שליחת אישור', ar: 'إرسال الرد', ru: 'Отправить ответ', en: 'Send reply' },
  update: { he: 'עדכון התשובה', ar: 'تحديث الرد', ru: 'Обновить ответ', en: 'Update reply' },
  sending: { he: 'שולחים…', ar: 'جارٍ الإرسال…', ru: 'Отправляем…', en: 'Sending…' },
  privacy: { he: 'רק המארגנים רואים את התשובה. אפשר לשנות אותה מהמכשיר הזה בכל רגע.', ar: 'المنظمون فقط يرون ردكم. يمكن تغييره من هذا الجهاز في أي وقت.', ru: 'Ответ видят только организаторы. Его можно изменить с этого устройства в любой момент.', en: 'Only the hosts see your reply. You can change it from this device at any time.' },
  thanksYes: { he: 'איזה כיף, נתראה באירוע!', ar: 'رائع، نراكم في المناسبة!', ru: 'Отлично, до встречи!', en: 'Great, see you there!' },
  thanksMaybe: { he: 'רשמנו שאולי תגיעו', ar: 'سجّلنا أنكم ربما تحضرون', ru: 'Записали: может быть', en: "We've noted maybe" },
  thanksNo: { he: 'התשובה נשמרה, תודה שעדכנתם', ar: 'تم حفظ الرد، شكرًا لإبلاغنا', ru: 'Ответ сохранён, спасибо', en: 'Reply saved, thanks for letting us know' },
  change: { he: 'שינוי התשובה', ar: 'تغيير الرد', ru: 'Изменить ответ', en: 'Change reply' },
  saved: { he: '✓ התשובה נשמרה. תודה!', ar: '✓ تم حفظ الرد. شكرًا!', ru: '✓ Ответ сохранён. Спасибо!', en: '✓ Reply saved. Thank you!' },
  fee: { he: 'דמי השתתפות: {p} ₪', ar: 'رسوم المشاركة: {p} ₪', ru: 'Взнос: {p} ₪', en: 'Contribution: ₪{p}' },
  feeAny: { he: 'דמי השתתפות: {p}', ar: 'رسوم المشاركة: {p}', ru: 'Взнос: {p}', en: 'Contribution: {p}' },
  pay: { he: 'לתשלום', ar: 'للدفع', ru: 'Оплатить', en: 'Pay' },
  table: { he: 'השולחן שלכם: {n}', ar: 'طاولتكم: {n}', ru: 'Ваш стол: {n}', en: 'Your table: {n}' },
  people: { he: '{n} משתתפים', ar: '{n} مشاركين', ru: 'участников: {n}', en: '{n} people' },
  errName: { he: 'כתבו שם (של הילד/ה או של המשפחה).', ar: 'اكتبوا الاسم (للطفل أو للعائلة).', ru: 'Напишите имя (ребёнка или семьи).', en: 'Please write a name (the child or the family).' },
  errStatus: { he: 'בחרו: מגיעים, לא מגיעים או אולי.', ar: 'اختاروا: سنحضر، لن نحضر أو ربما.', ru: 'Выберите: придём, не придём или может быть.', en: "Choose: coming, can't come or maybe." },
  errCount: { he: 'מספר המשתתפים צריך להיות בין 0 ל-20.', ar: 'عدد المشاركين بين 0 و20.', ru: 'Количество — от 0 до 20.', en: 'The number must be between 0 and 20.' },
  errNone: { he: 'כמה מגיעים? סמנו לפחות משתתף אחד.', ar: 'كم شخصًا سيحضر؟ اختاروا مشاركًا واحدًا على الأقل.', ru: 'Сколько придёт? Отметьте хотя бы одного.', en: 'How many are coming? Mark at least one.' },
  errLink: { he: 'אי אפשר לכתוב קישורים בתשובה.', ar: 'لا يمكن كتابة روابط في الرد.', ru: 'Ссылки в ответе писать нельзя.', en: "Links can't be included in the reply." },
}
// validateRsvpAnswer() reports Hebrew text; this finds the matching message in another language.
const ERRORS = ['errName', 'errStatus', 'errCount', 'errNone', 'errLink']
export const translateError = (lang, text) => { const k = ERRORS.find(key => T[key].he === text); return k ? t(lang, k) : text }

export function t(lang, key, vars = {}) {
  const row = T[key]
  if (!row) return key
  return String(row[lang] || row.he).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
}
export const RSVP_STRINGS = T

// "יום שבת 24.10" in Hebrew, and the matching local form in the other languages.
export function formatDateIn(lang, iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  if (!m) return ''
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12))
  return new Intl.DateTimeFormat(langInfo(lang).locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d)
}
