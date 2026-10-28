# חיבור קבוע של Google Search Console (פעם אחת, מהדפדפן, עובד ב־Windows)

אחרי ההגדרה הזאת האתר מושך כל בוקר לבד את נתוני גוגל: מיקום ממוצע, חיפושים, קליקים והופעות, וחיפושים
שבהם האתר במקום 5–15 (הכי קל לעלות בהם). בלי כרום, בלי Windsor ובלי שהמחשב דלוק.
הקוד: `scripts/search-console.mjs`, ההרצה: `.github/workflows/search-console.yml`.
החשבון שנוצר כאן יכול רק **לקרוא** נתונים. הוא לא יכול לשנות כלום ב־Search Console.

## 1. יוצרים "חשבון שירות" בגוגל (5 דקות)
1. נכנסים ל־https://console.cloud.google.com עם חשבון הגוגל שלך.
2. למעלה: **Select a project ← New Project**. שם: `ugabuga-search` ← **Create**. מוודאים שהפרויקט נבחר.
3. נכנסים ל־https://console.cloud.google.com/apis/library/searchconsole.googleapis.com ← **Enable**.
4. נכנסים ל־https://console.cloud.google.com/iam-admin/serviceaccounts ← **Create service account**.
   שם: `ugabuga-reader` ← **Create and continue** ← **Done** (בלי לבחור תפקיד).
5. לוחצים על החשבון שנוצר ← לשונית **Keys** ← **Add key ← Create new key ← JSON ← Create**.
   יורד קובץ `.json` למחשב. **לא שולחים אותו לאף אחד ולא מדביקים אותו בצ׳אט.**
6. מעתיקים את כתובת המייל של החשבון (נראית כמו `ugabuga-reader@ugabuga-search.iam.gserviceaccount.com`).

## 2. נותנים לו הרשאת קריאה ב־Search Console
1. https://search.google.com/search-console ← בוחרים את הנכס של ugabuga.co.il.
2. **Settings (הגדרות) ← Users and permissions (משתמשים והרשאות) ← Add user (הוספת משתמש)**.
3. מדביקים את המייל מסעיף 1.6, הרשאה: **Restricted (מוגבלת)** ← **Add**.

## 3. שומרים את המפתח ב־GitHub (סוד, לא נראה לאף אחד)
1. https://github.com/yos360/ugabuga/settings/secrets/actions ← **New repository secret**.
2. Name: `GSC_SERVICE_ACCOUNT`
3. Secret: פותחים את קובץ ה־`.json` שירד ב־Notepad (קליק ימני ← Open with ← Notepad), **Ctrl+A, Ctrl+C**, ומדביקים כאן.
4. **Add secret**. אפשר למחוק את הקובץ מהמחשב.

## 4. בדיקה
https://github.com/yos360/ugabuga/actions/workflows/search-console.yml ← **Run workflow**.
אחרי דקה הריצה ירוקה, ובסיכום שלה מופיעים הנתונים. מכאן זה רץ לבד כל בוקר.
