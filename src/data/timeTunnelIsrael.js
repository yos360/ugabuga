// Israeli / Jewish "on this day" entries for /time-tunnel/MM-DD. Original wording; every entry was
// confirmed by two independent sources (srcs) on the exact day, month and year. Anything uncertain is left out.
// kind: 'event' | 'born' | 'died'. Dates not listed here simply show no Israel section.
const e = (year, emoji, kind, text, ...srcs) => ({ year, emoji, kind, text, srcs })

export const TT_ISRAEL = {
  '10-29': [e(1956, '🪖', 'event', 'צה"ל יצא למבצע קדש בסיני, ובערב הוצנחו צנחנים סמוך למעבר המיתלה.', 'https://www.jewishvirtuallibrary.org/israel-announces-military-operation-in-sinai-october-1956', 'https://archives.mod.gov.il/sites/English/Exhibitions/Pages/Operation-Kadesh.aspx')],
  '10-30': [e(1957, '🎻', 'born', 'נולד שלמה מינץ, כנר ישראלי שהופיע עם תזמורות גדולות ברחבי העולם.', 'https://www.prestoclassical.co.uk/classical/artists/2256--shlomo-mintz', 'https://americanisraelite.com/?p=104824')],
  '10-31': [
    e(1917, '🐎', 'event', 'חיילים בריטים ואוסטרלים כבשו את באר שבע מידי העות\'מאנים, בהסתערות פרשים מפורסמת.', 'https://www.thejc.com/news/israel/on-this-day-battle-of-beersheba-1.37739', 'https://www.jewishvirtuallibrary.org/october-in-jewish-history'),
    e(1924, '📖', 'born', 'נולד הרב יהודה עמיטל, ראש ישיבת הר עציון ומייסד ישיבות ההסדר.', 'https://www.jewishvirtuallibrary.org/yehuda-amital', 'https://americanisraelite.com/today-in-israeli-history-october-31-november-6/'),
  ],
  '11-02': [e(1917, '📜', 'event', 'שר החוץ הבריטי בלפור שלח מכתב ללורד רוטשילד ובו תמיכה בהקמת בית לאומי לעם היהודי בארץ ישראל.', 'https://www.nli.org.il/en/discover/israel/zionism/zionism-history/balfour-declaration', 'https://www.rothschildarchive.org/family/family_interests/walter_rothschild_and_the_balfour_declaration')],
  '11-03': [e(1878, '🌾', 'event', 'קבוצת יהודים הקימה את פתח תקווה, המושבה החקלאית הראשונה בארץ.', 'https://www.worldjewishcongress.org/en/news/this-week-in-jewish-history--petah-tikvah-founded', 'https://thejewishnews.com/2018/11/03/petah-tikvah-is-founded/')],
  '11-04': [e(1995, '🕊️', 'died', 'ראש הממשלה יצחק רבין נרצח בתל אביב בסיום עצרת לתמיכה בשלום. היום מציינים אותו בכל שנה.', 'https://www.history.com/this-day-in-history/november-4/yitzhak-rabin-assassinated', 'https://www.jewishvirtuallibrary.org/november-in-jewish-history')],
  '11-07': [e(1944, '🌟', 'died', 'חנה סנש, לוחמת ומשוררת שהצטנחה לאירופה כדי לעזור ליהודים, הוצאה להורג בבודפשט.', 'https://yadvashem.org/from-our-collections/hannah-szenes.html', 'https://encyclopedia.ushmm.org/content/en/gallery/hannah-szenes')],
  '11-09': [
    e(1938, '🕯️', 'event', 'בליל הפוגרומים "ליל הבדולח" הותקפו בתי כנסת, חנויות ובתים של יהודים ברחבי גרמניה.', 'https://yadvashem.org/education/newsletter/14.html', 'https://www.israelnationalnews.com/news/316525'),
    e(1952, '🧪', 'died', 'נפטר חיים ויצמן, מדען שהיה הנשיא הראשון של מדינת ישראל, בביתו ברחובות.', 'https://www.britannica.com/biography/Chaim-Weizmann', 'https://www.jewishvirtuallibrary.org/chaim-weizmann'),
  ],
  '11-10': [
    e(1975, '🏛️', 'event', 'עצרת האו"ם הגדירה את הציונות כגזענות. ישראל דחתה את ההחלטה, והיא בוטלה כעבור שנים.', 'https://israeled.org/zionism-racism-unga-resolution-3379/', 'https://www.jewishvirtuallibrary.org/un-general-assembly-resolution-3379-november-1975'),
    e(2004, '🎵', 'event', 'הכנסת קבעה בחוק את "התקווה" כהמנון הלאומי של מדינת ישראל.', 'https://www.jewishvirtuallibrary.org/israeli-national-anthem-hatikvah', 'https://stljewishlight.org/jewish-history/this-week-in-israeli-history-nov-10-16'),
  ],
  '11-12': [e(2000, '🕊️', 'died', 'הלכה לעולמה לאה רבין, אשת ראש הממשלה יצחק רבין ופעילה למען שלום.', 'https://www.encyclopedia.com/women/encyclopedias-almanacs-transcripts-and-maps/rabin-leah-1928-2000', 'https://clintonwhitehouse4.archives.gov/textonly/library/hot_releases/November_12_2000.html')],
  '11-13': [e(1893, '🎨', 'born', 'נולד ראובן רובין, צייר ישראלי שצייר נופי ארץ ישראל ואנשיה.', 'https://en.wikipedia.org/wiki/Reuven_Rubin', 'https://stljewishlight.org/jewish-history/this-week-in-israeli-history-nov-10-16')],
  '11-15': [
    e(1942, '🎹', 'born', 'נולד דניאל ברנבוים בבואנוס איירס, פסנתרן ומנצח מפורסם בעולם.', 'https://cso.org/about/performers/visiting-artists/conductors/daniel-barenboim', 'https://interlude.hk/on-this-day-15-november-daniel-barenboim-was-born/'),
    e(1948, '✈️', 'event', 'חברת התעופה אל על נרשמה רשמית כחברה, והפכה לחברת התעופה הלאומית של ישראל.', 'https://www.jewishvirtuallibrary.org/el-al-timeline-highlights', 'https://www.israelairlinemuseum.org/el-al-key-dates/'),
  ],
  '11-16': [e(1924, '🎖️', 'born', 'נולד חיים בר-לב בווינה, שהיה לימים הרמטכ"ל השישי של צה"ל.', 'https://en.wikipedia.org/wiki/Haim_Bar-Lev', 'https://www.jta.org/archive/haim-bar-lev-dead-at-69-was-general-and-ambassador')],
  '11-18': [e(1951, '🎹', 'born', 'נולד יוני רכטר בתל אביב, מלחין ונגן קלידים וחבר להקת כוורת.', 'https://israeled.org/rock-star-yoni-rechter-is-born', 'https://en.wikipedia.org/wiki/Yoni_Rechter')],
  '11-19': [
    e(1957, '🎤', 'born', 'נולדה עפרה חזה בתל אביב, זמרת ישראלית אהובה שזכתה להצלחה גם בעולם.', 'https://israeled.org/singer-ofra-haza-is-born', 'https://www.britannica.com/biography/Ofra-Haza'),
    e(1977, '🤝', 'event', 'נשיא מצרים אנואר סאדאת נחת בישראל לביקור היסטורי, שהוביל להסכם שלום בין שתי המדינות.', 'https://israeled.org/sadats-historic-visit-jerusalem', 'https://www.ebsco.com/research-starters/history/sadat-becomes-first-arab-leader-visit-israel'),
  ],
  '11-20': [e(1977, '🕊️', 'event', 'נשיא מצרים אנואר סאדאת נאם בכנסת בירושלים וקרא לשלום בין ישראל למצרים.', 'https://embassies.gov.il/eu/NewsAndEvents/Pages/40-Years-to-President-Sadat\'s-historic-speech.aspx', 'https://jpost.com/arab-israeli-conflict/egypt-president-anwar-sadat-addresses-the-knesset-november-20-1977-649723')],
  '11-22': [e(1967, '📜', 'event', 'מועצת הביטחון של האו"ם אימצה פה אחד את החלטה 242, שעסקה בנסיגה ישראלית ובשלום באזור.', 'https://www.un.org/unispal/document/auto-insert-184858', 'https://www.ebsco.com/research-starters/military-history-and-science/united-nations-security-council-adopts-resolution')],
  '11-23': [e(1926, '🕵️', 'born', 'נולד רפי איתן בקיבוץ עין חרוד, איש מודיעין שהיה בין מובילי לכידת אדולף אייכמן.', 'https://en.wikipedia.org/wiki/Rafi_Eitan', 'https://www.irishtimes.com/news/world/middle-east/spymaster-behind-the-capture-of-adolf-eichmann-dies-aged-92-1.3837010')],
  '11-24': [e(1884, '🏛️', 'born', 'נולד יצחק בן־צבי בפולטבה, מראשי הציונות שהיה לימים הנשיא השני של מדינת ישראל.', 'https://www.britannica.com/biography/Itzhak-Ben-Zvi', 'https://njop.org/the-second-president/')],
  '11-25': [e(1940, '🚢', 'event', 'הספינה פטריה, שעליה פליטים יהודים שהבריטים רצו לגרש, טבעה בנמל חיפה. השורדים הורשו להישאר בארץ.', 'https://www.jta.org/?p=408660', 'https://jewishmag.com/46mag/patria/patria.htm')],
  '11-26': [
    e(1949, '🎤', 'born', 'נולד שלמה ארצי באלוני אבא, זמר ויוצר ישראלי שכתב ושר שירים רבים שכולם מכירים.', 'https://jewishvirtuallibrary.org/jsource/biography/artzi.html', 'https://jewage.org/wiki/en/Article:Shlomo_Artzi_-_biography'),
    e(2013, '🎶', 'died', 'הלך לעולמו אריק איינשטיין, מגדולי הזמרים והיוצרים בישראל, בן 74.', 'https://jewishvirtuallibrary.org/jsource/biography/arikeinsteinbio.html', 'https://jweekly.com/?p=113579'),
  ],
  '11-27': [
    e(1874, '🔬', 'born', 'נולד חיים ויצמן בכפר מוטול, מדען כימאי ומנהיג ציוני שהיה לימים הנשיא הראשון של מדינת ישראל.', 'https://www.britannica.com/biography/Chaim-Weizmann', 'https://encyclopedia.com/religion/encyclopedias-almanacs-transcripts-and-maps/weizmann-chaim'),
    e(2007, '🤝', 'event', 'בוועידת אנאפוליס בארצות הברית נפגשו ראש הממשלה אולמרט ונשיא הרשות הפלסטינית עבאס והסכימו להתחיל במשא ומתן.', 'https://embassies.gov.il/MFA/AboutIsrael/history/Pages/The Annapolis Conference 27-Nov-2007.aspx', 'https://georgewbush-whitehouse.archives.gov/news/releases/2007/11/20071127.html'),
  ],
  '11-29': [e(1947, '🗳️', 'event', 'עצרת האו"ם אישרה ברוב של 33 מול 13 את תוכנית החלוקה, שהציעה מדינה יהודית ומדינה ערבית בארץ.', 'https://embassies.gov.il/MFA/PressRoom/Pages/Partition-Plan-64-years.aspx', 'https://www.britannica.com/topic/United-Nations-Resolution-181')],
}
