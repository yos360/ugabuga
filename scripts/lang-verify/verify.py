"""Checks the site's language-learning words against independent sources.

Sources (all offline, all maintained by others):
  * Unicode CLDR emoji annotations (npm cldr-annotations-full) - native-speaker names
    for each emoji in every language: does the picture match the word, and does our
    Hebrew meaning match what Hebrew speakers call that picture?
  * Hunspell dictionaries (npm dictionary-en / dictionary-he) - spelling.
  * eSpeak NG (pip espeakng-loader + phonemizer) - phonetic transcription of the
    word, compared with our Hebrew-letter pronunciation guide (consonant skeleton).

Setup (once):  npm i --prefix $LV cldr-annotations-full dictionary-en dictionary-he
               pip install espeakng-loader phonemizer spylls
Run:           node scripts/lang-verify/extract.mjs > words.json
               LV=$LV python3 scripts/lang-verify/verify.py words.json > report.md
"""
import json, os, re, sys, unicodedata
from collections import defaultdict

LV = os.environ['LV']
NM = os.path.join(LV, 'node_modules')

# ---------- sources ----------
def cldr(lang):
    path = os.path.join(NM, 'cldr-annotations-full', 'annotations', lang, 'annotations.json')
    ann = json.load(open(path))['annotations']['annotations']
    return {k.replace('️', ''): v.get('default', []) + v.get('tts', []) for k, v in ann.items()}

from spylls.hunspell import Dictionary
def hunspell(name):
    return Dictionary.from_files(os.path.join(NM, name, 'index'))

import espeakng_loader
from phonemizer.backend.espeak.wrapper import EspeakWrapper
EspeakWrapper.set_library(espeakng_loader.get_library_path())
os.environ['ESPEAK_DATA_PATH'] = espeakng_loader.get_data_path()
from phonemizer.backend import EspeakBackend
ESPEAK = {}
def ipa(word, lang):
    if lang not in ESPEAK:
        ESPEAK[lang] = EspeakBackend(lang, preserve_punctuation=False, with_stress=False)
    return ESPEAK[lang].phonemize([word], strip=True)[0]

# ---------- helpers ----------
NIQQUD = re.compile('[֑-ׇ]')
def bare(s):
    return NIQQUD.sub('', s or '').replace('״', '"').replace('׳', "'").strip()

def en_forms(w):
    w = w.lower()
    forms = {w}
    for suf in ('s', 'es'):
        if w.endswith(suf): forms.add(w[: -len(suf)])
    if w.endswith('ies'): forms.add(w[:-3] + 'y')
    forms |= {w + 's', w + 'es'}
    return forms

def mentions(names, forms, whole_words=True):
    for n in names:
        n = n.lower()
        toks = set(re.findall(r"[\w'״׳\"-]+", n))
        for f in forms:
            if f == n or f in toks or (not whole_words and f in n):
                return True
            if ' ' in f and f in n:
                return True
    return False

# Hebrew transliteration -> consonant classes
def he_skeleton(say):
    s = unicodedata.normalize('NFC', say)
    out, i = [], 0
    chars = list(s)
    def nxt(j):
        return chars[j] if j < len(chars) else ''
    while i < len(chars):
        c = chars[i]
        marks = ''
        j = i + 1
        while j < len(chars) and ('֑' <= chars[j] <= 'ׇ' or chars[j] in "׳'"):
            marks += chars[j]; j += 1
        dagesh = 'ּ' in marks
        geresh = "׳" in marks or "'" in marks
        vowel_marks = set(marks) - {'ּ', '׳', "'", 'ְ'}
        first = not out and i == 0
        if c == 'ב': out.append('b' if dagesh else ('b|v' if first else 'v'))
        elif c == 'ג': out.append('J' if geresh else 'g')
        elif c == 'ד': out.append('TH' if geresh else 'd')
        elif c == 'ה':
            if j < len(chars) and chars[j].isalpha() or vowel_marks: out.append('h')
        elif c == 'ו':
            if 'ֹ' in marks or (dagesh and not vowel_marks):  # holam / shuruk = vowel
                pass
            elif nxt(j) == 'ו':  # double vav = consonant w/v
                out.append('v'); j += 1
                while j < len(chars) and '֑' <= chars[j] <= 'ׇ': j += 1
            elif vowel_marks or first:
                out.append('v')
        elif c == 'ז': out.append('ZH' if geresh else 'z')
        elif c == 'ח': out.append('x')
        elif c in 'טת': out.append('TH' if geresh else 't')
        elif c == 'י':
            if (vowel_marks or first) and not (out and out[-1] == 'y'): out.append('y')
        elif c in 'כך': out.append('k' if dagesh or c == 'ך' and False else 'k|x')
        elif c == 'ק': out.append('k')
        elif c == 'ל': out.append('l')
        elif c in 'םמ': out.append('m')
        elif c in 'ןנ': out.append('n')
        elif c == 'ס': out.append('s')
        elif c in 'פף': out.append('p' if dagesh else 'f')
        elif c in 'צץ': out.append('CH' if geresh else 'ts')
        elif c == 'ר': out.append('r')
        elif c == 'ש': out.append('s' if 'ׂ' in marks else 'sh')
        i = j
    return out

def ipa_skeleton(p):
    p = p.replace('ː', '').replace('ˈ', '').replace('ˌ', '').replace('ɡ', 'g')
    rules = [('dʒ', 'J'), ('tʃ', 'CH'), ('ts', 'ts'), ('ʃ', 'sh'), ('ʒ', 'ZH'), ('θ', 'TH'), ('ð', 'TH'),
             ('ŋ', 'n'), ('ɾ', 't|d'), ('ɹ', 'r'), ('ɚ', 'r'), ('ɝ', 'r'), ('r', 'r'), ('w', 'v'), ('v', 'v'),
             ('j', 'y'), ('b', 'b'), ('d', 'd'), ('f', 'f'), ('g', 'g'), ('h', 'h'), ('k', 'k'), ('l', 'l'),
             ('m', 'm'), ('n', 'n'), ('p', 'p'), ('s', 's'), ('t', 't'), ('x', 'x'), ('z', 'z')]
    out, i = [], 0
    while i < len(p):
        for k, v in rules:
            if p.startswith(k, i):
                out.append(v); i += len(k); break
        else:
            i += 1
    # 'ŋg' written נג / 'ŋk' written נק: ŋ already n
    return out

def ok(a, b):
    sa, sb = set(a.split('|')), set(b.split('|'))
    if 't|d' in (a, b): sa |= {'t', 'd'}; sb |= {'t', 'd'}
    return bool(sa & sb)

def skel_match(hs, ps):
    # tolerate an optional 'y'/'v' glide and an optional 'g' after n (sing = סִינְג), 'h' dropped
    def norm(seq):
        return [x for x in seq if x not in ('y', 'h')]
    a, b = norm(hs), norm(ps)
    if len(a) != len(b):
        if len(a) == len(b) + 1 and 'g' in a:
            k = a.index('g'); a = a[:k] + a[k+1:]
        else:
            return False
    return all(ok(x, y) for x, y in zip(a, b))

def pron_match(hs, ps):
    # eSpeak's English voice is non-rhotic (bird = /bɜːd/), our guide is American (בֶּרְד):
    # an r we write where eSpeak has none is fine.
    if skel_match(hs, ps):
        return True
    return 'r' not in ps and skel_match([x for x in hs if x != 'r'], ps)

# Reviewed by hand: the picture or spelling is a deliberate, correct choice.
ACCEPTED = {
    'silly': 'פרצוף מטופש — מתאים', 'sorry': 'פרצוף עצוב מבטא התנצלות', 'excuse me': 'יד מורמת לפנות למישהו',
    'goodbye': 'דלת — יוצאים', 'good night': 'ירח = לילה', "you're welcome": 'חיוך', 'I love you': 'פרצוף מאוהב',
    'January': 'תמונה סמלית לחודש', 'February': 'תמונה סמלית לחודש', 'March': 'תמונה סמלית לחודש',
    'April': 'תמונה סמלית לחודש', 'May': 'תמונה סמלית לחודש', 'June': 'תמונה סמלית לחודש', 'July': 'תמונה סמלית לחודש',
    'August': 'תמונה סמלית לחודש', 'September': 'תמונה סמלית לחודש', 'October': 'תמונה סמלית לחודש',
    'November': 'תמונה סמלית לחודש', 'December': 'חנוכה בדצמבר',
    'card': 'מעטפה עם לב = כרטיס ברכה', 'mom': 'אישה', 'dad': 'גבר', 'brother': 'ילד', 'sister': 'ילדה',
    'storm': 'ענן ברקים = סופה/סערה', 'iguana': 'לטאה — הקרוב ביותר שיש', 'quill': 'נוצה', 'queen bee': 'דבורה',
    'yolk': 'ביצת עין — רואים את החלמון', 'zoo': 'ג׳ירפה מגן החיות', 'excited': 'נלהב = נרגש', 'bored': 'Unicode מסמן גם bored',
    'clock': 'שעון', 'friends': 'שני אנשים מחזיקים ידיים', 'cookie': 'עוגיה/עוגייה — שני כתיבים תקינים',
    'grandpa': 'איש מבוגר', 'hot': 'מזיע מחום', 'eagle': 'עיט — השם הזואולוגי הנכון; בדיבור גם נשר',
    'insect': 'חיפושית = חרק', 'ice skate': 'נעל החלקה', 'mushroom': 'פטריה/פטרייה — שני כתיבים תקינים',
    'nut': 'בוטן — כתוב בתרגום', 'uniform': 'מדי קראטה', 'box': 'קופסה/חבילה', 'thank you': 'ידיים מתפללות = תודה',
    'good morning': 'זריחה', 'party hat': 'פרצוף עם כובע מסיבה', 'sofa': 'sofa = couch',
    'alligator': 'אין אימוג׳י נפרד לאליגטור', 'juggler': 'אדם עושה ג׳גלינג', 'quarter': 'מטבע',
    'utensils': 'סכו״ם', 'vegetables': 'ברוקולי = ירק', 'grandma': 'ה-d לא נשמעת בדיבור', 'excuse me': 'בפועל excuse נהגה עם z',
    'scissors': 'בפועל /ˈsɪzərz/ — eSpeak טועה', 'pants': 'ts = צ/טס', 'yacht': 'יאכטה — כתיב מקובל',
}

# ---------- run ----------
def main(path):
    rows = json.load(open(path))
    en_names, he_names = cldr('en'), cldr('he')
    en_dict, he_dict = hunspell('dictionary-en'), hunspell('dictionary-he')
    issues = defaultdict(list)
    vowel_style = defaultdict(set)
    for r in rows:
        if r.get('kind') == 'letter-name' or r.get('number'):
            continue
        word, he, say, emoji = r['word'], r['he'], r['say'], r['emoji']
        where = f"{r['source']}: **{word}** → {he}" + (f" ({say})" if say else '')
        # spelling
        for tok in re.findall(r"[A-Za-z']+", word):
            if not en_dict.lookup(tok) and not en_dict.lookup(tok.capitalize()):
                issues['איות אנגלית'].append(f"{where} — '{tok}' לא במילון")
        for tok in re.findall(r"[א-ת\"׳']+", bare(he)):
            t = tok.strip("'\"")
            if word not in ACCEPTED and t not in ('אמא', 'אבא') and len(t) > 1 and not he_dict.lookup(t) and not he_dict.lookup(t.replace('יי', 'י')):
                issues['איות עברית (לבדיקה)'].append(f"{where} — '{t}' לא במילון")
        # picture / meaning vs CLDR
        if emoji:
            e = emoji.replace('️', '')
            en_n, he_n = en_names.get(e), he_names.get(e)
            if en_n is None:
                issues['אימוג׳י לא מוכר'].append(where)
            else:
                en_ok = mentions(en_n, en_forms(word))
                he_forms = {bare(he)} | set(bare(he).split())
                he_ok = mentions([bare(x) for x in he_n], he_forms, whole_words=False) or \
                        any(bare(x) in bare(he) for x in he_n if len(bare(x)) > 2)
                tag = f"{where} {emoji} — Unicode באנגלית: {', '.join(en_n[:5])} | בעברית: {', '.join(he_n[:5])}"
                if word in ACCEPTED:
                    pass
                elif not en_ok and not he_ok:
                    issues['תמונה לא תואמת (גם אנגלית וגם עברית)'].append(tag)
                elif not en_ok:
                    issues['תמונה: השם באנגלית לא מופיע ב-Unicode'].append(tag)
                elif not he_ok:
                    issues['תרגום: שונה מהשם שדוברי עברית נותנים לתמונה'].append(tag)
        # pronunciation guide vs eSpeak
        if say:
            p = ipa(word, 'en-us')
            if not pron_match(he_skeleton(say), ipa_skeleton(p)) and word not in ACCEPTED and word.lower() not in ('grandpa',):
                issues['הגייה: העיצורים לא תואמים ל-eSpeak'].append(
                    f"{where} — eSpeak: /{p}/ | שלנו: {'-'.join(he_skeleton(say))} מול {'-'.join(ipa_skeleton(p))}")
            if 'oʊ' in p:
                vowel_style['oʊ'].add('וֹאוּ' if 'וֹאוּ' in say or 'וֹאוּ' in unicodedata.normalize('NFC', say) else 'וֹ')
    print(f'# דוח אימות מילים — {len(rows)} שורות\n')
    for k, v in issues.items():
        print(f'## {k} ({len(v)})\n')
        for x in v: print(f'- {x}')
        print()
    for k, v in vowel_style.items():
        if len(v) > 1: print(f'## עקביות תעתיק: /{k}/ נכתב בכמה צורות: {v}\n')
    if not issues: print('לא נמצאו בעיות.')

if __name__ == '__main__':
    main(sys.argv[1])
