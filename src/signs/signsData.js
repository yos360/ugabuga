// Meanings verified against the Ministry of Transport table (September 2022).
// Names are short labels from the official meanings, not a separate official naming scheme.
export const SIGN_SOURCE = "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf"
export const SIGN_CATEGORIES = [
  { id: 'warning', name: 'אזהרה והתראה', hint: 'משולש עם מסגרת אדומה מזהיר בדרך כלל על מה שמחכה בהמשך.' },
  { id: 'mandatory', name: 'הוריה', hint: 'עיגול כחול מורה בדרך כלל על כיוון נסיעה או על משתמשי הדרך המיועדים לשביל.' },
  { id: 'priority', name: 'זכות קדימה', hint: 'לתמרורי זכות קדימה צורות שונות: משולש הפוך, מתומן וגם עיגול וריבוע.' },
  { id: 'prohibition', name: 'איסורים והגבלות', hint: 'מסגרת אדומה בעיגול מסמנת בדרך כלל איסור או הגבלה. בודקים גם את הסמל שבתוכה.' },
  { id: 'information', name: 'מודיעין והדרכה', hint: 'שלטים מרובעים ומלבניים מוסרים מידע על הדרך. הצורה לבדה אינה מספיקה לזיהוי.' },
]
export const TRAFFIC_SIGNS = [
  {
    "number": "101",
    "sourcePage": 7,
    "name": "כביש משובש",
    "meaning": "הכביש שלפניכם אינו חלק וייתכנו בו מהמורות.",
    "where": "בקטע דרך שפניו משובשים.",
    "driver": "האטו בהדרגה ושמרו על שליטה ברכב.",
    "cyclist": "האטו במיוחד כדי שהגלגלים לא ייתקעו בשיבוש.",
    "pedestrian": "הישארו במסלול הליכה בטוח והיזהרו ממעידות.",
    "similar": [
      "144"
    ],
    "question": {
      "prompt": "במה שונה התמרור מפסי האטה?",
      "options": [
        "הוא מזהיר על שיבושים בכביש, ולא דווקא על פס האטה בנוי.",
        "הוא מציין חניה מותרת.",
        "הוא מחייב לפנות ימינה."
      ],
      "answer": 0,
      "explanation": "הוא מזהיר על שיבושים בכביש, ולא דווקא על פס האטה בנוי. הכביש שלפניכם אינו חלק וייתכנו בו מהמורות."
    },
    "category": "warning",
    "image": "/signs/101.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=7",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=7"
    }
  },
  {
    "number": "102",
    "sourcePage": 7,
    "name": "עקומה חדה ימינה",
    "meaning": "בהמשך הדרך יש עקומה חדה לצד ימין.",
    "where": "לפני עיקול ימני שהנהג צריך להתכונן אליו.",
    "driver": "התאימו את המהירות לפני העקומה והישארו בנתיב.",
    "cyclist": "האטו לפני העיקול והימנעו מתנועה חדה.",
    "pedestrian": "אל תחצו במקום שבו העיקול מסתיר את התנועה.",
    "similar": [
      "103"
    ],
    "question": {
      "prompt": "האם זהו צו לפנות בצומת?",
      "options": [
        "לא. זו אזהרה על צורת הדרך המתעקלת ימינה.",
        "כן, חייבים לפנות בצומת הבא.",
        "מותר לנסוע רק שמאלה."
      ],
      "answer": 0,
      "explanation": "לא. זו אזהרה על צורת הדרך המתעקלת ימינה. בהמשך הדרך יש עקומה חדה לצד ימין."
    },
    "category": "warning",
    "image": "/signs/102.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=7",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=7"
    }
  },
  {
    "number": "103",
    "sourcePage": 7,
    "name": "עקומה חדה שמאלה",
    "meaning": "בהמשך הדרך יש עקומה חדה לצד שמאל.",
    "where": "לפני עיקול שמאלי בכביש.",
    "driver": "האטו לפני העקומה ושמרו על הנתיב שלכם.",
    "cyclist": "התכוננו לעיקול בלי לחתוך לנתיב הנגדי.",
    "pedestrian": "בחרו מקום חצייה שבו אפשר לראות היטב את הדרך.",
    "similar": [
      "102"
    ],
    "question": {
      "prompt": "לאיזה צד מתעקל הכביש?",
      "options": [
        "שמאלה, לפי צורת הקו השחור.",
        "ימינה, בכל מקרה.",
        "התמרור מסמן דרך ללא מוצא."
      ],
      "answer": 0,
      "explanation": "שמאלה, לפי צורת הקו השחור. בהמשך הדרך יש עקומה חדה לצד שמאל."
    },
    "category": "warning",
    "image": "/signs/103.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=7",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=7"
    }
  },
  {
    "number": "109",
    "sourcePage": 8,
    "name": "הכביש הולך וצר",
    "meaning": "רוחב הכביש קטן בהמשך הדרך.",
    "where": "לפני היצרות בכביש או מעבר צר.",
    "driver": "האטו ובדקו שיש מרווח בטוח; התמרור אינו מעניק זכות קדימה.",
    "cyclist": "היזהרו מהמרווח המצטמצם והימנעו מהידחקות לצד רכב.",
    "pedestrian": "אל תיכנסו לכביש הצר; המשיכו במסלול המיועד להליכה.",
    "similar": [
      "307",
      "308"
    ],
    "question": {
      "prompt": "האם התמרור קובע למי זכות קדימה?",
      "options": [
        "לא. הוא מזהיר שהכביש נעשה צר; זכות הקדימה נקבעת בנפרד.",
        "כן, תמיד לכם.",
        "כן, תמיד לרכב הגדול."
      ],
      "answer": 0,
      "explanation": "לא. הוא מזהיר שהכביש נעשה צר; זכות הקדימה נקבעת בנפרד. רוחב הכביש קטן בהמשך הדרך."
    },
    "category": "warning",
    "image": "/signs/109.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=8",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=8"
    }
  },
  {
    "number": "114",
    "sourcePage": 8,
    "name": "צומת הצטלבות",
    "meaning": "לפניכם צומת שבו דרכים מצטלבות.",
    "where": "לפני צומת בעל זרועות מצטלבות.",
    "driver": "האטו, חפשו תנועה מכל הכיוונים וצייתו להסדרי זכות הקדימה.",
    "cyclist": "התקרבו בזהירות ובדקו את התנועה החוצה.",
    "pedestrian": "השתמשו במעבר חצייה מתאים ובדקו כל זרוע בנפרד.",
    "similar": [
      "117"
    ],
    "question": {
      "prompt": "האם צורת הצלב נותנת לכם זכות קדימה?",
      "options": [
        "לא. זו אזהרה על צומת ולא קביעה של זכות הקדימה.",
        "כן, תמיד יש לכם זכות קדימה.",
        "כן, אם נוסעים ישר."
      ],
      "answer": 0,
      "explanation": "לא. זו אזהרה על צומת ולא קביעה של זכות הקדימה. לפניכם צומת שבו דרכים מצטלבות."
    },
    "category": "warning",
    "image": "/signs/114.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=8",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=8"
    }
  },
  {
    "number": "117",
    "sourcePage": 9,
    "name": "צומת קמץ",
    "meaning": "הדרך שלפניכם נפגשת בצומת בצורת האות T.",
    "where": "לפני מפגש שבו הדרך אינה ממשיכה ישר.",
    "driver": "האטו ובדקו את כיווני הנסיעה המותרים ואת זכות הקדימה.",
    "cyclist": "התכוננו למפגש עם התנועה בדרך החוצה.",
    "pedestrian": "בחרו מקום חצייה עם שדה ראייה לשני צדי הצומת.",
    "similar": [
      "114"
    ],
    "question": {
      "prompt": "מה מסמלת צורת האות T?",
      "options": [
        "מפגש עם דרך חוצה, בלי המשך ישר של הדרך.",
        "כביש משובש.",
        "חניה למשאיות."
      ],
      "answer": 0,
      "explanation": "מפגש עם דרך חוצה, בלי המשך ישר של הדרך. הדרך שלפניכם נפגשת בצומת בצורת האות T."
    },
    "category": "warning",
    "image": "/signs/117.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=9",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=9"
    }
  },
  {
    "number": "121",
    "sourcePage": 9,
    "name": "מעגל תנועה",
    "meaning": "בהמשך הדרך נמצא מעגל תנועה.",
    "where": "בדרך המתקרבת למעגל תנועה.",
    "driver": "האטו והתכוננו להסדרי הכניסה למעגל.",
    "cyclist": "התקרבו לאט ובדקו את התמרורים בכניסה.",
    "pedestrian": "חצו רק במקום מתאים מסביב למעגל, ולא דרך האי המרכזי.",
    "similar": [
      "303"
    ],
    "question": {
      "prompt": "מה ההבדל בינו לבין 303?",
      "options": [
        "121 מזהיר מראש על המעגל; 303 מסדיר את התנועה בו.",
        "שניהם אוסרים כל כניסה למעגל.",
        "121 הוא תמרור חניה."
      ],
      "answer": 0,
      "explanation": "121 מזהיר מראש על המעגל; 303 מסדיר את התנועה בו. בהמשך הדרך נמצא מעגל תנועה."
    },
    "category": "warning",
    "image": "/signs/121.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=9",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=9"
    }
  },
  {
    "number": "122",
    "sourcePage": 9,
    "name": "רמזור",
    "meaning": "רמזור נמצא בהמשך הדרך.",
    "where": "לפני מקום מרומזר, במיוחד כשהוא אינו נראה ממרחק.",
    "driver": "התכוננו לעצירה והביטו ברמזור בפועל.",
    "cyclist": "התאימו מהירות וצייתו לרמזור החל עליכם.",
    "pedestrian": "השתמשו ברמזור הולכי הרגל אם ישנו במקום החצייה.",
    "similar": [
      "150"
    ],
    "question": {
      "prompt": "האם האור הירוק שבציור מתיר נסיעה?",
      "options": [
        "לא. זהו ציור אזהרה; צריך לציית לאור ברמזור האמיתי.",
        "כן, התמרור מתיר נסיעה תמיד.",
        "כן, כל עוד אין רכב ממול."
      ],
      "answer": 0,
      "explanation": "לא. זהו ציור אזהרה; צריך לציית לאור ברמזור האמיתי. רמזור נמצא בהמשך הדרך."
    },
    "category": "warning",
    "image": "/signs/122.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=9",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=9"
    }
  },
  {
    "number": "135",
    "sourcePage": 11,
    "name": "מעבר חצייה להולכי רגל בקרבת מקום",
    "meaning": "לפניכם נמצא מעבר חצייה, שעדיין ייתכן שאינו נראה היטב.",
    "where": "לפני מעבר חצייה בהמשך הדרך.",
    "driver": "האטו וחפשו הולכי רגל המתקרבים למעבר.",
    "cyclist": "התכוננו להולכי רגל ולמתן זכות קדימה כנדרש.",
    "pedestrian": "אתרו את מעבר החצייה עצמו לפני שחוצים.",
    "similar": [
      "306",
      "136"
    ],
    "question": {
      "prompt": "האם חוצים בדיוק מתחת לתמרור הזה?",
      "options": [
        "לא בהכרח. הוא מזהיר מראש על מעבר שנמצא בהמשך.",
        "כן, בכל מקום שבו הוא מוצב.",
        "הוא אוסר על הולכי רגל לחצות."
      ],
      "answer": 0,
      "explanation": "לא בהכרח. הוא מזהיר מראש על מעבר שנמצא בהמשך. לפניכם נמצא מעבר חצייה, שעדיין ייתכן שאינו נראה היטב."
    },
    "category": "warning",
    "image": "/signs/135.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=11",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=11"
    }
  },
  {
    "number": "136",
    "sourcePage": 11,
    "name": "הולכי רגל בקרבת מקום",
    "meaning": "צפויה נוכחות של הולכי רגל בדרך שלפניכם.",
    "where": "בקטעים שבהם הולכי רגל עשויים להימצא בקרבת הכביש.",
    "driver": "האטו והיו מוכנים לתנועה בלתי צפויה של הולכי רגל.",
    "cyclist": "שמרו מרחק מהולכי הרגל והתאימו את המהירות.",
    "pedestrian": "המשיכו במדרכה או בשביל ואל תראו באזהרה אישור לחצות.",
    "similar": [
      "135",
      "226"
    ],
    "question": {
      "prompt": "האם זהו סימון לשביל הליכה בלבד?",
      "options": [
        "לא. המשולש מזהיר מפני הולכי רגל בקרבת הדרך.",
        "כן, כלי רכב חייבים לעלות למדרכה.",
        "כן, מותר לחצות בלי לבדוק."
      ],
      "answer": 0,
      "explanation": "לא. המשולש מזהיר מפני הולכי רגל בקרבת הדרך. צפויה נוכחות של הולכי רגל בדרך שלפניכם."
    },
    "category": "warning",
    "image": "/signs/136.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=11",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=11"
    }
  },
  {
    "number": "137",
    "sourcePage": 12,
    "name": "תנועת אופניים בקרבת מקום",
    "meaning": "צפויה תנועת אופניים בדרך שלפניכם.",
    "where": "ליד מקום שבו מסלול רכיבה מתקרב לכביש או חוצה אותו.",
    "driver": "האטו וחפשו רוכבים לפני המשך הנסיעה.",
    "cyclist": "בדקו את התנועה; האזהרה אינה מעניקה לכם זכות קדימה.",
    "pedestrian": "שימו לב לרוכבים ואל תחסמו מסלול רכיבה.",
    "similar": [
      "227",
      "412"
    ],
    "question": {
      "prompt": "האם המשולש מחייב לרכוב בשביל מסוים?",
      "options": [
        "לא. הוא מזהיר על תנועת אופניים בקרבת מקום.",
        "כן, זהו שביל לאופניים בלבד.",
        "הוא אוסר כל רכיבה."
      ],
      "answer": 0,
      "explanation": "לא. הוא מזהיר על תנועת אופניים בקרבת מקום. צפויה תנועת אופניים בדרך שלפניכם."
    },
    "category": "warning",
    "image": "/signs/137.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=12",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=12"
    }
  },
  {
    "number": "144",
    "sourcePage": 13,
    "name": "פסי האטה",
    "meaning": "בהמשך הדרך נמצאים פסי האטה.",
    "where": "לפני פסי האטה המותקנים בכביש.",
    "driver": "הפחיתו מהירות לפני הפס ועברו עליו באופן מבוקר.",
    "cyclist": "האטו לפני העלייה על הפס ושמרו על יציבות.",
    "pedestrian": "אל תבלבלו בין פס האטה למעבר חצייה מסומן.",
    "similar": [
      "101"
    ],
    "question": {
      "prompt": "האם פס האטה הוא בהכרח מעבר חצייה?",
      "options": [
        "לא. התמרור מזהיר מפסי האטה, לא ממעבר חצייה.",
        "כן, תמיד אפשר לחצות עליו.",
        "הוא מסמן חניה ליד מדרכה."
      ],
      "answer": 0,
      "explanation": "לא. התמרור מזהיר מפסי האטה, לא ממעבר חצייה. בהמשך הדרך נמצאים פסי האטה."
    },
    "category": "warning",
    "image": "/signs/144.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=13",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=13"
    }
  },
  {
    "number": "145",
    "sourcePage": 13,
    "name": "תנועה דו־סטרית",
    "meaning": "בדרך שלפניכם יש תנועה בשני הכיוונים.",
    "where": "לפני קטע שבו נוסעים גם כלי רכב מהכיוון הנגדי.",
    "driver": "הישארו בצד ובנתיב המיועדים לכם וצפו לרכב ממול.",
    "cyclist": "אל תניחו שכל רוחב הכביש פנוי לכיוון שלכם.",
    "pedestrian": "בדקו את שני כיווני התנועה לפני חצייה במקום מותר.",
    "similar": [
      "618",
      "307"
    ],
    "question": {
      "prompt": "מה צריך לצפות לראות בהמשך?",
      "options": [
        "גם כלי רכב הנוסעים בכיוון הנגדי.",
        "רק כלי רכב באותו כיוון.",
        "רק הולכי רגל."
      ],
      "answer": 0,
      "explanation": "גם כלי רכב הנוסעים בכיוון הנגדי. בדרך שלפניכם יש תנועה בשני הכיוונים."
    },
    "category": "warning",
    "image": "/signs/145.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=13",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=13"
    }
  },
  {
    "number": "150",
    "sourcePage": 14,
    "name": "מקום מסוכן שלגביו לא נקבע תמרור מיוחד",
    "meaning": "לפניכם סכנה שאין עבורה תמרור אזהרה ייעודי.",
    "where": "לפני מפגע שמצריך תשומת לב מיוחדת.",
    "driver": "האטו, בדקו מה הסכנה ושימו לב לשלט נלווה אם קיים.",
    "cyclist": "התאימו את הרכיבה למפגע ולשדה הראייה.",
    "pedestrian": "בדקו את סביבת ההליכה ושמרו מרחק מהמפגע.",
    "similar": [
      "101",
      "122"
    ],
    "question": {
      "prompt": "מה מספר לנו סימן הקריאה?",
      "options": [
        "יש סכנה מיוחדת שצריך לבדוק ולהיערך אליה.",
        "מותר להאיץ.",
        "הדרך מיועדת לחניה."
      ],
      "answer": 0,
      "explanation": "יש סכנה מיוחדת שצריך לבדוק ולהיערך אליה. לפניכם סכנה שאין עבורה תמרור אזהרה ייעודי."
    },
    "category": "warning",
    "image": "/signs/150.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=14",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=14"
    }
  },
  {
    "number": "203",
    "sourcePage": 16,
    "name": "סע ישר",
    "meaning": "בתנועה שלפניכם נוסעים בכיוון החץ; בדוגמה החץ ישר. פניית פרסה אסורה.",
    "where": "בצומת או מעל נתיב שבו נקבע כיוון נסיעה.",
    "driver": "המשיכו בכיוון החץ ובנתיב המתאים; רמזור עדיין מחייב.",
    "cyclist": "צייתו לכיוון המסומן כאשר אתם נוסעים בנתיב שעליו הוא חל.",
    "pedestrian": "התמרור פונה לכלי הרכב ואינו אישור לחצייה.",
    "similar": [
      "618",
      "204"
    ],
    "question": {
      "prompt": "האם מותר לבצע פרסה בגלל החץ הישר?",
      "options": [
        "לא. בתמרור 203 פניית פרסה אסורה.",
        "כן, אם הכביש ריק.",
        "כן, תמיד ימינה."
      ],
      "answer": 0,
      "explanation": "לא. בתמרור 203 פניית פרסה אסורה. בתנועה שלפניכם נוסעים בכיוון החץ; בדוגמה החץ ישר. פניית פרסה אסורה."
    },
    "category": "mandatory",
    "image": "/signs/203.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=16",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=16"
    }
  },
  {
    "number": "204",
    "sourcePage": 17,
    "name": "סע ימינה — פנה לפני התמרור",
    "meaning": "נוסעים ימינה ופונים לפני מקום הצבת התמרור.",
    "where": "במקום שבו התנועה מופנית ימינה לפני התמרור.",
    "driver": "פנו ימינה לפני התמרור ובדקו את הרמזור ואת החוצים.",
    "cyclist": "בצעו את הפנייה המותרת בזהירות ובהתאם לנתיב.",
    "pedestrian": "שימו לב לכלי רכב הפונים ימינה כשאתם חוצים.",
    "similar": [
      "205",
      "214"
    ],
    "question": {
      "prompt": "היכן מתבצעת הפנייה?",
      "options": [
        "לפני התמרור, ימינה.",
        "אחרי התמרור, שמאלה.",
        "התמרור רק מזהיר על עיקול."
      ],
      "answer": 0,
      "explanation": "לפני התמרור, ימינה. נוסעים ימינה ופונים לפני מקום הצבת התמרור."
    },
    "category": "mandatory",
    "image": "/signs/204.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=17",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=17"
    }
  },
  {
    "number": "205",
    "sourcePage": 17,
    "name": "סע שמאלה — פנה לפני התמרור",
    "meaning": "נוסעים שמאלה ופונים לפני מקום הצבת התמרור.",
    "where": "במקום שבו התנועה מופנית שמאלה לפני התמרור.",
    "driver": "פנו שמאלה לפני התמרור תוך בדיקת שאר הסדרי התנועה.",
    "cyclist": "היערכו לפנייה בנתיב המתאים ובדקו כלי רכב חוצים.",
    "pedestrian": "שימו לב לכלי רכב הפונים שמאלה.",
    "similar": [
      "204",
      "215"
    ],
    "question": {
      "prompt": "איזו תנועה מורה החץ?",
      "options": [
        "פנייה שמאלה לפני התמרור.",
        "פנייה ימינה בלבד.",
        "נסיעה ישר בלבד."
      ],
      "answer": 0,
      "explanation": "פנייה שמאלה לפני התמרור. נוסעים שמאלה ופונים לפני מקום הצבת התמרור."
    },
    "category": "mandatory",
    "image": "/signs/205.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=17",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=17"
    }
  },
  {
    "number": "213",
    "sourcePage": 19,
    "name": "עבור את המקום המסומן מימין או משמאל",
    "meaning": "אפשר לעבור משני צדי המקום המסומן, בהתאם למסלול הבטוח והמותר.",
    "where": "על אי תנועה או מכשול שהמעבר מותר משני צדדיו.",
    "driver": "בחרו מעבר מותר מימין או משמאל ושמרו על הנתיב.",
    "cyclist": "עברו בצד מותר בלי להידחק בין המכשול לרכב.",
    "pedestrian": "המשיכו במסלול ההליכה ולא בין זרמי התנועה.",
    "similar": [
      "214",
      "215"
    ],
    "question": {
      "prompt": "באילו צדדים מותר לעבור?",
      "options": [
        "מימין או משמאל למקום המסומן.",
        "רק דרך מרכז המכשול.",
        "רק מימין בכל מקרה."
      ],
      "answer": 0,
      "explanation": "מימין או משמאל למקום המסומן. אפשר לעבור משני צדי המקום המסומן, בהתאם למסלול הבטוח והמותר."
    },
    "category": "mandatory",
    "image": "/signs/213.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=19",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=19"
    }
  },
  {
    "number": "214",
    "sourcePage": 20,
    "name": "עבור את המקום המסומן מצדו הימני",
    "meaning": "עוברים מימין לאי התנועה או למקום המסומן.",
    "where": "על מכשול או אי שהמעבר לידו מוסדר.",
    "driver": "עברו מימין למקום המסומן, בלי לעלות עליו.",
    "cyclist": "שמרו מרווח בטוח ועברו בצד ימין המסומן.",
    "pedestrian": "אל תשתמשו בחץ כהוראה לחצות את הכביש.",
    "similar": [
      "215",
      "213"
    ],
    "question": {
      "prompt": "מה מורה החץ האלכסוני?",
      "options": [
        "לעבור מצד ימין של המקום המסומן.",
        "לפנות שמאלה בצומת הבא.",
        "לעבור מכל צד שרוצים."
      ],
      "answer": 0,
      "explanation": "לעבור מצד ימין של המקום המסומן. עוברים מימין לאי התנועה או למקום המסומן."
    },
    "category": "mandatory",
    "image": "/signs/214.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=20",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=20"
    }
  },
  {
    "number": "215",
    "sourcePage": 20,
    "name": "עבור את המקום המסומן מצדו השמאלי",
    "meaning": "עוברים משמאל לאי התנועה או למקום המסומן.",
    "where": "על אי או מכשול שהמעבר לצדו השמאלי.",
    "driver": "עברו משמאל למקום המסומן ובנתיב המותר.",
    "cyclist": "בדקו מרווח ועברו משמאל בהתאם לחץ.",
    "pedestrian": "המשיכו במסלול המיועד להולכי רגל.",
    "similar": [
      "214",
      "213"
    ],
    "question": {
      "prompt": "מה ההבדל בינו לבין 214?",
      "options": [
        "כאן המעבר משמאל; בתמרור 214 המעבר מימין.",
        "אין הבדל בכיוון.",
        "כאן מותר לעצור על האי."
      ],
      "answer": 0,
      "explanation": "כאן המעבר משמאל; בתמרור 214 המעבר מימין. עוברים משמאל לאי התנועה או למקום המסומן."
    },
    "category": "mandatory",
    "image": "/signs/215.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=20",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=20"
    }
  },
  {
    "number": "226",
    "sourcePage": 21,
    "name": "שביל להולכי רגל בלבד",
    "meaning": "השביל מיועד להולכי רגל בלבד.",
    "where": "בכניסה לשביל הליכה ייעודי.",
    "driver": "אל תיכנסו ברכב לשביל ההליכה.",
    "cyclist": "אל תרכבו בשביל המיועד להולכי רגל בלבד.",
    "pedestrian": "השתמשו בשביל ושימו לב למשתמשים האחרים בו.",
    "similar": [
      "227",
      "413"
    ],
    "question": {
      "prompt": "האם זהו שביל רכיבה?",
      "options": [
        "לא. הוא מיועד להולכי רגל בלבד.",
        "כן, רק לרוכבים מהירים.",
        "כן, לכל כלי רכב קטן."
      ],
      "answer": 0,
      "explanation": "לא. הוא מיועד להולכי רגל בלבד. השביל מיועד להולכי רגל בלבד."
    },
    "category": "mandatory",
    "image": "/signs/226.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=21",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=21"
    }
  },
  {
    "number": "227",
    "sourcePage": 21,
    "name": "שביל לתנועת אופניים",
    "meaning": "השביל מיועד לתנועת אופניים כהגדרתם בהודעת התעבורה.",
    "where": "בכניסה לשביל אופניים מסומן.",
    "driver": "אל תשתמשו בשביל האופניים כנתיב לרכב.",
    "cyclist": "רכבו במסלול המיועד ובהתאם לכיוון ולסימון במקום.",
    "pedestrian": "העדיפו את שביל ההליכה ואל תעמדו במסלול הרכיבה.",
    "similar": [
      "137",
      "412"
    ],
    "question": {
      "prompt": "מה ההבדל בינו לבין 137?",
      "options": [
        "העיגול מורה על שביל אופניים; המשולש מזהיר על רוכבים בקרבת מקום.",
        "שניהם אוסרים רכיבה.",
        "227 מסמן חניית אופניים בלבד."
      ],
      "answer": 0,
      "explanation": "העיגול מורה על שביל אופניים; המשולש מזהיר על רוכבים בקרבת מקום. השביל מיועד לתנועת אופניים כהגדרתם בהודעת התעבורה."
    },
    "category": "mandatory",
    "image": "/signs/227.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=21",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=21"
    }
  },
  {
    "number": "301",
    "sourcePage": 25,
    "name": "תן זכות קדימה",
    "meaning": "נותנים זכות קדימה לתנועה בדרך החוצה, לרבות מסילה.",
    "where": "לפני מפגש עם דרך חוצה.",
    "driver": "האטו ותנו זכות קדימה; עצרו אם הדבר נדרש כדי לאפשר מעבר.",
    "cyclist": "תנו זכות קדימה לתנועה החוצה גם ברכיבה.",
    "pedestrian": "אל תניחו שנהג הבחין בכם; בדקו את התנועה לפני החצייה.",
    "similar": [
      "302"
    ],
    "question": {
      "prompt": "האם נדרשת תמיד עצירה מלאה?",
      "options": [
        "לא תמיד; נדרשת זכות קדימה ועוצרים כשצריך. בתמרור עצור חובת העצירה נפרדת.",
        "כן, משמעותו זהה בדיוק לעצור.",
        "לא, לעולם אסור לעצור."
      ],
      "answer": 0,
      "explanation": "לא תמיד; נדרשת זכות קדימה ועוצרים כשצריך. בתמרור עצור חובת העצירה נפרדת. נותנים זכות קדימה לתנועה בדרך החוצה, לרבות מסילה."
    },
    "category": "priority",
    "image": "/signs/301.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=25",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=25"
    }
  },
  {
    "number": "302",
    "sourcePage": 25,
    "name": "עצור! תן זכות קדימה",
    "meaning": "חייבים לעצור ולתת זכות קדימה לתנועה בדרך החוצה, לרבות מסילה.",
    "where": "בכניסה לצומת שבה נדרשת עצירה.",
    "driver": "עצרו עצירה מלאה, בדקו את הדרך ותנו זכות קדימה לפני ההמשך.",
    "cyclist": "עצרו גם כשאין רכב קרוב; המשיכו רק לאחר בדיקה.",
    "pedestrian": "המתינו וודאו שהרכב עצר ושהחצייה בטוחה.",
    "similar": [
      "301"
    ],
    "question": {
      "prompt": "הדרך נראית ריקה. האם עדיין צריך לעצור?",
      "options": [
        "כן. תמרור עצור מחייב עצירה גם לפני מתן זכות הקדימה.",
        "לא, אם מאטים מעט.",
        "רק אם מגיע אוטובוס."
      ],
      "answer": 0,
      "explanation": "כן. תמרור עצור מחייב עצירה גם לפני מתן זכות הקדימה. חייבים לעצור ולתת זכות קדימה לתנועה בדרך החוצה, לרבות מסילה."
    },
    "category": "priority",
    "image": "/signs/302.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=25",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=25"
    }
  },
  {
    "number": "303",
    "sourcePage": 25,
    "name": "מעגל תנועה — תן זכות קדימה",
    "meaning": "נותנים זכות קדימה לתנועה החוצה את דרככם במעגל או במסילה, ועוברים את המעגל מימין.",
    "where": "בכניסה למעגל תנועה.",
    "driver": "תנו זכות קדימה לתנועה החוצה במעגל והיכנסו רק כשבטוח.",
    "cyclist": "התכוננו לתת זכות קדימה לפני הכניסה למעגל.",
    "pedestrian": "השתמשו במעברים מסביב למעגל ושימו לב גם לרכב היוצא.",
    "similar": [
      "121",
      "301"
    ],
    "question": {
      "prompt": "למי נותנים זכות קדימה בכניסה?",
      "options": [
        "לתנועה החוצה את דרככם במעגל או במסילה.",
        "רק לכלי רכב הנכנסים מאחור.",
        "אף אחד אינו צריך לתת זכות קדימה."
      ],
      "answer": 0,
      "explanation": "לתנועה החוצה את דרככם במעגל או במסילה. נותנים זכות קדימה לתנועה החוצה את דרככם במעגל או במסילה, ועוברים את המעגל מימין."
    },
    "category": "priority",
    "image": "/signs/303.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=25",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=25"
    }
  },
  {
    "number": "306",
    "sourcePage": 26,
    "name": "תן זכות קדימה להולכי הרגל החוצים",
    "meaning": "במקום מעבר החצייה המסומן יש לתת זכות קדימה להולכי הרגל החוצים.",
    "where": "במעבר חצייה המסומן על הכביש.",
    "driver": "התקרבו בזהירות ואפשרו להולכי הרגל לחצות בבטחה.",
    "cyclist": "תנו זכות קדימה לחוצים כאשר אתם מגיעים למעבר ברכיבה.",
    "pedestrian": "בדקו שהדרך בטוחה ושהנהגים הבחינו בכם לפני החצייה.",
    "similar": [
      "135",
      "136"
    ],
    "question": {
      "prompt": "מה ההבדל בין 306 ל־135?",
      "options": [
        "306 נמצא במעבר ומורה לתת זכות קדימה; 135 מזהיר על מעבר בהמשך.",
        "306 אוסר חצייה.",
        "135 הוא חניה להולכי רגל."
      ],
      "answer": 0,
      "explanation": "306 נמצא במעבר ומורה לתת זכות קדימה; 135 מזהיר על מעבר בהמשך. במקום מעבר החצייה המסומן יש לתת זכות קדימה להולכי הרגל החוצים."
    },
    "category": "priority",
    "image": "/signs/306.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=26",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=26"
    }
  },
  {
    "number": "307",
    "sourcePage": 26,
    "name": "תן זכות קדימה בקטע דרך צרה",
    "meaning": "נותנים זכות קדימה לתנועה מהכיוון הנגדי לאורך הקטע הצר.",
    "where": "לפני מעבר שבו אין די רוחב למעבר בטוח בו־זמני.",
    "driver": "המתינו לתנועה ממול לפני הכניסה לקטע הצר.",
    "cyclist": "אל תיכנסו לקטע הצר באופן שיפריע לתנועה שלה זכות הקדימה.",
    "pedestrian": "הימנעו מהליכה בתוך הקטע המיועד לתנועת כלי רכב.",
    "similar": [
      "308",
      "109"
    ],
    "question": {
      "prompt": "מי צריך להמתין כשמגיע רכב ממול?",
      "options": [
        "מי שמולו מוצב תמרור 307 צריך לתת זכות קדימה.",
        "תמיד הרכב הקטן יותר.",
        "תמיד הרכב ממול."
      ],
      "answer": 0,
      "explanation": "מי שמולו מוצב תמרור 307 צריך לתת זכות קדימה. נותנים זכות קדימה לתנועה מהכיוון הנגדי לאורך הקטע הצר."
    },
    "category": "priority",
    "image": "/signs/307.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=26",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=26"
    }
  },
  {
    "number": "308",
    "sourcePage": 26,
    "name": "לך זכות קדימה בקטע דרך צרה",
    "meaning": "בקטע הצר יש לכם זכות קדימה ביחס לתנועה מהכיוון הנגדי.",
    "where": "בצד אחד של מעבר צר שהוסדרה בו זכות קדימה.",
    "driver": "המשיכו רק אם המעבר פנוי ובטוח; זכות קדימה אינה מבטלת זהירות.",
    "cyclist": "ודאו שהתנועה ממול מאפשרת מעבר לפני הכניסה.",
    "pedestrian": "אל תסיקו מזכות הקדימה של הרכב שמותר לחצות בלי בדיקה.",
    "similar": [
      "307",
      "618"
    ],
    "question": {
      "prompt": "האם מותר להיכנס אם המעבר חסום?",
      "options": [
        "לא. גם כשיש זכות קדימה צריך לוודא שהמעבר בטוח ופנוי.",
        "כן, זכות קדימה מאפשרת להתנגש.",
        "כן, אם צופרים תחילה."
      ],
      "answer": 0,
      "explanation": "לא. גם כשיש זכות קדימה צריך לוודא שהמעבר בטוח ופנוי. בקטע הצר יש לכם זכות קדימה ביחס לתנועה מהכיוון הנגדי."
    },
    "category": "priority",
    "image": "/signs/308.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=26",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=26"
    }
  },
  {
    "number": "401",
    "sourcePage": 28,
    "name": "כביש סגור בשני הכיוונים בפני כל רכב",
    "meaning": "הכביש סגור לתנועת כל רכב בשני הכיוונים. מעל רמזור התמרור אוסר נסיעה ישר.",
    "where": "בכניסה לכביש הסגור לתנועת כלי רכב.",
    "driver": "אל תיכנסו לכביש הסגור; חפשו מסלול מותר.",
    "cyclist": "גם אופניים הם כלי רכב: אל תרכבו לתוך הכביש הסגור.",
    "pedestrian": "התמרור אוסר תנועת רכב, אך עדיין בדקו את תנאי ההליכה במקום.",
    "similar": [
      "402"
    ],
    "question": {
      "prompt": "האם האיסור חל גם על אופניים?",
      "options": [
        "כן. התמרור מתייחס לכל רכב.",
        "לא, רק על מכוניות אדומות.",
        "לא, רק על משאיות."
      ],
      "answer": 0,
      "explanation": "כן. התמרור מתייחס לכל רכב. הכביש סגור לתנועת כל רכב בשני הכיוונים. מעל רמזור התמרור אוסר נסיעה ישר."
    },
    "category": "prohibition",
    "image": "/signs/401.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=28",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=28"
    }
  },
  {
    "number": "402",
    "sourcePage": 28,
    "name": "אסורה הכניסה לכל רכב",
    "meaning": "אסור לכל רכב להיכנס לכביש מהצד שבו מוצב התמרור.",
    "where": "בכניסה אסורה, למשל בקצה הנגדי של כביש חד־סטרי.",
    "driver": "אל תיכנסו מעבר לתמרור, גם כשהכביש נראה פנוי.",
    "cyclist": "אל תרכבו דרך הכניסה האסורה.",
    "pedestrian": "בדקו את תנאי ההליכה; התמרור אינו מעבר חצייה.",
    "similar": [
      "401",
      "618"
    ],
    "question": {
      "prompt": "האם מותר להיכנס כשהכביש ריק?",
      "options": [
        "לא. האיסור אינו תלוי בכך שרואים רכב.",
        "כן, אם ממהרים.",
        "כן, רק ברכיבה מהירה."
      ],
      "answer": 0,
      "explanation": "לא. האיסור אינו תלוי בכך שרואים רכב. אסור לכל רכב להיכנס לכביש מהצד שבו מוצב התמרור."
    },
    "category": "prohibition",
    "image": "/signs/402.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=28",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=28"
    }
  },
  {
    "number": "412",
    "sourcePage": 29,
    "name": "אסורה הכניסה לאופניים",
    "meaning": "אסור להיכנס בדרך באופניים כהגדרתם בהודעת התעבורה.",
    "where": "במקום שבו נאסרה כניסת אופניים.",
    "driver": "שימו לב שהאיסור מתייחס לאופניים ואינו קובע את כללי הרכב האחרים.",
    "cyclist": "בחרו מסלול רכיבה אחר המותר לאופניים.",
    "pedestrian": "הסמל אינו איסור כניסה להולכי רגל; בדקו את המסלול המיועד לכם.",
    "similar": [
      "227",
      "137"
    ],
    "question": {
      "prompt": "מה ההבדל בינו לבין 227?",
      "options": [
        "המסגרת האדומה אוסרת כניסת אופניים; העיגול הכחול מסמן שביל אופניים.",
        "שניהם מחייבים לרכוב מהר.",
        "שניהם מתירים רכיבה בכל כביש."
      ],
      "answer": 0,
      "explanation": "המסגרת האדומה אוסרת כניסת אופניים; העיגול הכחול מסמן שביל אופניים. אסור להיכנס בדרך באופניים כהגדרתם בהודעת התעבורה."
    },
    "category": "prohibition",
    "image": "/signs/412.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=29",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=29"
    }
  },
  {
    "number": "413",
    "sourcePage": 30,
    "name": "אסורה הכניסה להולכי רגל",
    "meaning": "אין להיכנס לדרך ברגל במקום שבו הוצב התמרור.",
    "where": "בכניסה לקטע שאינו מיועד להליכה.",
    "driver": "צייתו להסדרי הנסיעה ואל תראו בשלט הבטחה שאין אדם בדרך.",
    "cyclist": "בדקו את הסדר הרכיבה בנפרד; זהו איסור על הולכי רגל.",
    "pedestrian": "בחרו מסלול הליכה חלופי ואל תיכנסו לקטע האסור.",
    "similar": [
      "226",
      "136"
    ],
    "question": {
      "prompt": "היכן ממשיכים ללכת?",
      "options": [
        "במסלול חלופי שמותר להולכי רגל.",
        "בכביש, כל עוד רצים מהר.",
        "תמיד מעבר לתמרור האדום."
      ],
      "answer": 0,
      "explanation": "במסלול חלופי שמותר להולכי רגל. אין להיכנס לדרך ברגל במקום שבו הוצב התמרור."
    },
    "category": "prohibition",
    "image": "/signs/413.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=30",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=30"
    }
  },
  {
    "number": "426",
    "sourcePage": 32,
    "name": "מהירות מיוחדת",
    "meaning": "אסור לנסוע במהירות העולה על המספר שבתמרור בקמ״ש. בדוגמה: 40.",
    "where": "בתחילת קטע שבו נקבעה הגבלת מהירות מיוחדת.",
    "driver": "אל תעברו את המהירות הרשומה; בתנאים מסוכנים נוסעים גם לאט ממנה.",
    "cyclist": "התאימו מהירות לתנאים ולכל הגבלה החלה עליכם.",
    "pedestrian": "אל תניחו שכל רכב נוסע בדיוק במהירות שבשלט.",
    "similar": [
      "203",
      "432"
    ],
    "question": {
      "prompt": "האם המספר הוא מהירות שחייבים להגיע אליה?",
      "options": [
        "לא. זו מהירות מרבית, וייתכן שצריך לנסוע לאט יותר.",
        "כן, חובה להגיע בדיוק ל־40.",
        "זהו מספר הכביש."
      ],
      "answer": 0,
      "explanation": "לא. זו מהירות מרבית, וייתכן שצריך לנסוע לאט יותר. אסור לנסוע במהירות העולה על המספר שבתמרור בקמ״ש. בדוגמה: 40."
    },
    "category": "prohibition",
    "image": "/signs/426.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=32",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=32"
    }
  },
  {
    "number": "432",
    "sourcePage": 33,
    "name": "אסורה חניית רכב",
    "meaning": "החניה אסורה בצד הדרך שבו הוצב התמרור, בתחום תוקפו.",
    "where": "לאורך צד דרך שבו נאסרה חניה.",
    "driver": "אל תחנו בתחום האיסור; בדקו גם שלטים נלווים.",
    "cyclist": "אל תשתמשו באזור האסור לחניית כלי רכב באופן שמפריע לתנועה.",
    "pedestrian": "אל תראו בשטח הפנוי מקום בטוח לעמוד על הכביש.",
    "similar": [
      "433"
    ],
    "question": {
      "prompt": "במה הוא שונה מ־433?",
      "options": [
        "432 אוסר חניה; 433 אוסר גם עצירה, בכפוף לחריג שבדין.",
        "432 מחייב לחנות.",
        "אין שום הבדל ביניהם."
      ],
      "answer": 0,
      "explanation": "432 אוסר חניה; 433 אוסר גם עצירה, בכפוף לחריג שבדין. החניה אסורה בצד הדרך שבו הוצב התמרור, בתחום תוקפו."
    },
    "category": "prohibition",
    "image": "/signs/432.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=33",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=33"
    }
  },
  {
    "number": "433",
    "sourcePage": 33,
    "name": "אסורה כל עצירה וחניה",
    "meaning": "אין לעצור או לחנות בצד הדרך שבו הוצב התמרור, אלא אם העצירה דרושה למילוי הוראות דין.",
    "where": "בצד דרך שבו גם עצירה קצרה נאסרה.",
    "driver": "אל תעצרו להורדת נוסע בתחום האיסור; עצירה המחויבת בדין עדיין נדרשת.",
    "cyclist": "אל תעצרו לתכנון המסלול בתוך תחום האיסור.",
    "pedestrian": "קבעו מקום איסוף אחר שמותר ובטוח לעצור בו.",
    "similar": [
      "432"
    ],
    "question": {
      "prompt": "האם מותר לעצור רק לרגע להוריד נוסע?",
      "options": [
        "לא. התמרור אוסר גם עצירה, ולא רק חניה.",
        "כן, אם מפעילים אורות מצוקה.",
        "כן, תמיד לדקה אחת."
      ],
      "answer": 0,
      "explanation": "לא. התמרור אוסר גם עצירה, ולא רק חניה. אין לעצור או לחנות בצד הדרך שבו הוצב התמרור, אלא אם העצירה דרושה למילוי הוראות דין."
    },
    "category": "prohibition",
    "image": "/signs/433.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=33",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=33"
    }
  },
  {
    "number": "618",
    "sourcePage": 50,
    "name": "כביש חד־סטרי",
    "meaning": "נכנסים לקטע כביש שבו התנועה מותרת רק בכיוון החץ.",
    "where": "בכניסה לכביש חד־סטרי.",
    "driver": "סעו בכיוון החץ וצייתו להסדרי הפנייה בצומת.",
    "cyclist": "רכבו בכיוון המותר והיזהרו מרכבים היוצאים מחניות.",
    "pedestrian": "גם בכביש חד־סטרי בדקו את הסביבה לפני חצייה.",
    "similar": [
      "203",
      "145"
    ],
    "question": {
      "prompt": "מה ההבדל בין הריבוע הכחול לעיגול 203?",
      "options": [
        "הריבוע מציין כביש חד־סטרי; העיגול מורה על כיוון הנסיעה בתנועה שלפניכם.",
        "הריבוע מחייב חניה.",
        "אין לריבוע משמעות לגבי התנועה."
      ],
      "answer": 0,
      "explanation": "הריבוע מציין כביש חד־סטרי; העיגול מורה על כיוון הנסיעה בתנועה שלפניכם. נכנסים לקטע כביש שבו התנועה מותרת רק בכיוון החץ."
    },
    "category": "information",
    "image": "/signs/618.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=50",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=50"
    }
  },
  {
    "number": "623",
    "sourcePage": 51,
    "name": "כביש ללא מוצא",
    "meaning": "הכביש שלפניכם אינו מאפשר המשך נסיעה דרכו אל כביש אחר.",
    "where": "בכניסה לרחוב ללא מוצא.",
    "driver": "תכננו את ההמשך בלי להניח שיש יציאה בקצה הרחוב.",
    "cyclist": "אל תניחו שקיים מעבר המשך לרכיבה בלי לבדוק בשטח.",
    "pedestrian": "התמרור מתאר את הכביש; קיומו של מעבר רגלי דורש בדיקה נפרדת.",
    "similar": [
      "402",
      "618"
    ],
    "question": {
      "prompt": "האם התמרור אוסר כניסה לרחוב?",
      "options": [
        "לא. הוא מודיע שהכביש ללא מוצא, ולא אוסר כניסה כשלעצמו.",
        "כן, הכניסה אסורה לכל רכב.",
        "כן, מותר להיכנס רק בהליכה."
      ],
      "answer": 0,
      "explanation": "לא. הוא מודיע שהכביש ללא מוצא, ולא אוסר כניסה כשלעצמו. הכביש שלפניכם אינו מאפשר המשך נסיעה דרכו אל כביש אחר."
    },
    "category": "information",
    "image": "/signs/623.svg",
    "source": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=51",
    "artwork": {
      "creator": "עוגה בוגה — איור SVG מקורי",
      "license": "CC0-1.0",
      "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
      "reference": "https://www.gov.il/BlobFolder/policy/tamrurim_7924_01_18/he/1694327856_%D7%9C%D7%95%D7%AA_%D7%9D_%D7%9E%D7%A9%D7%95%D7%9C%D7%91_0922.pdf#page=51"
    }
  }
]
export const findSign = number => TRAFFIC_SIGNS.find(sign => sign.number === number)
export const signPath = sign => `/signs/${sign.number}`
export const signTitle = sign => `תמרור ${sign.number}: ${sign.name}`
export const signDescription = sign => `תמרור ${sign.number} — ${sign.name}: הסבר, התנהגות בדרך, תמרורים דומים ושאלת תרגול עם תשובה.`
export function filterSigns(query = '', category = 'all') {
  const term = query.trim().replace(/[־–—]/g, '-').toLowerCase()
  return TRAFFIC_SIGNS.filter(s => (category === 'all' || s.category === category) && `${s.number} ${s.name} ${s.meaning}`.replace(/[־–—]/g, '-').toLowerCase().includes(term))
}
