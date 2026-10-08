"""Verifies src/data/languages/vocab.js and generates the Hebrew-letter pronunciations.

For every word:
  1. Meaning: the word must appear in the Unicode CLDR annotation (written by native speakers)
     of its picture, in that language. Numbers: CLDR's official spell-out rules (cldr-rbnf).
     A few greetings without a picture name fall back to the Hunspell dictionary (reported).
  2. Pronunciation (say.generated.js) is computed, never typed:
       fr / es / ru  - from the eSpeak NG phonetic transcription (IPA -> Hebrew letters + niqqud)
       ar            - from the vocalized Arabic spelling (harakat), letter by letter
       am            - from the Ge'ez script, which writes every syllable exactly
     Arabic vowels are cross-checked against eSpeak's own dictionary where it knows the word.

Setup (once):  npm i --prefix $LV cldr-annotations-full cldr-rbnf dictionary-fr dictionary-es dictionary-ru
               pip install espeakng-loader phonemizer spylls
Run:           node scripts/lang-verify/extract-vocab.mjs > vocab.json
               LV=$LV python3 scripts/lang-verify/vocab.py vocab.json [--write]
--write regenerates src/data/languages/say.generated.js; without it the script fails if the
committed file differs from what the sources produce.
"""
import json, os, re, sys, unicodedata

LV = os.environ['LV']
NM = os.path.join(LV, 'node_modules')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'src', 'data', 'languages', 'say.generated.js')

import espeakng_loader
from phonemizer.backend.espeak.wrapper import EspeakWrapper
EspeakWrapper.set_library(espeakng_loader.get_library_path())
os.environ['ESPEAK_DATA_PATH'] = espeakng_loader.get_data_path()
from phonemizer.backend import EspeakBackend
_es = {}
def ipa(words, voice, stress=False):
    key = (voice, stress)
    if key not in _es:
        _es[key] = EspeakBackend(voice, with_stress=stress, preserve_punctuation=False)
    return _es[key].phonemize(words, strip=True)

HARAKAT = re.compile('[ً-ْٰ]')
def norm(lang, s):
    s = unicodedata.normalize('NFC', s).lower().replace('’', "'").replace('ё', 'е')
    if lang == 'ar':
        s = HARAKAT.sub('', s)
        s = re.sub('[أإآٱ]', 'ا', s).replace('ى', 'ي')
    return s.strip()

def cldr(lang):
    out = {}
    # Spanish: our pronunciation is Latin-American, so Latin-American names count too.
    for loc in ([lang, 'es-419'] if lang == 'es' else [lang]):
        p = os.path.join(NM, 'cldr-annotations-full', 'annotations', loc, 'annotations.json')
        for k, v in json.load(open(p))['annotations']['annotations'].items():
            out.setdefault(k.replace('️', ''), []).extend(v.get('tts', []) + v.get('default', []))
    return out

def rbnf(lang):
    R = json.load(open(os.path.join(NM, 'cldr-rbnf', 'rbnf', lang + '.json')))['rbnf']['rbnf']['SpelloutRules']
    out = {}
    for name in ('%spellout-numbering', '%spellout-cardinal-masculine', '%spellout-cardinal'):
        for n, v in R.get(name, []):
            if n.isdigit() and 1 <= int(n) <= 10 and not v.startswith('='):
                out.setdefault(int(n), set()).add(re.sub(r'\[.*?\]|;', '', v).strip())
    return out

# Extra pictures whose names may also confirm a word (same meaning, different emoji).
ALSO = {'sea': ['🐟'], 'water': ['🌊'], 'hand': ['👋', '🙏']}

def variants(lang, w):
    v = {w}
    if lang == 'ru' and len(w) > 4:
        stem = w[:-2]
        v |= {stem + e for e in ('ый', 'ий', 'ой', 'ое', 'ая', 'ее', 'яя', 'ые')}
    if lang == 'es' and w[-1:] in 'oa':
        v |= {w[:-1] + 'o', w[:-1] + 'a', w + 's'}
    if lang == 'ar':
        if w.endswith('ة'): v.add(w[:-1])          # تفاحة / تفاح (one / collective)
        v.add(w + 'ة')
        m = re.fullmatch('ا(.)(.)(.)', w)          # color adjectives: أحمر -> حمراء
        if m: v.add(''.join(m.groups()) + 'اء')
    return v

def in_names(lang, word, names):
    forms = variants(lang, norm(lang, word))
    for n in names:
        n = norm(lang, n)
        toks = set(re.findall(r"[\w']+", n))
        if lang == 'ar':
            toks |= {t[2:] for t in toks if t.startswith('ال') and len(t) > 3}   # الكعك -> كعك
        for f in forms:
            if f == n or f in toks or (' ' in f and f in n):
                return True
    return False

from spylls.hunspell import Dictionary
_dict = {}
def in_dictionary(lang, word):
    if lang not in _dict:
        name = {'fr': 'dictionary-fr', 'es': 'dictionary-es', 'ru': 'dictionary-ru'}.get(lang)
        _dict[lang] = Dictionary.from_files(os.path.join(NM, name, 'index')) if name else None
    d = _dict[lang]
    return bool(d) and all(d.lookup(t) for t in re.findall(r"[\w’']+", word))

# ---------- Hebrew letters ----------
FINAL = {'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ'}
SHVA, PATAH, QAMATS, SEGOL, TSERE, HIRIQ, HOLAM, QUBUTS, DAGESH = 'ְ', 'ַ', 'ָ', 'ֶ', 'ֵ', 'ִ', 'ֹ', 'ֻ', 'ּ'
GERESH = '׳'

def finish(units):
    """units: list of (consonant_letters, vowel_suffix) -> Hebrew word with final forms."""
    out = ''
    for i, (c, v) in enumerate(units):
        last = i == len(units) - 1
        if last and not v and c.endswith(DAGESH) and len(c) > 1:
            c = c[:-1] if c[-2] not in 'בכפ' else c       # no doubling mark at the very end
        if last and not v and c and c[-1] in FINAL and not c.endswith(GERESH):
            c = c[:-1] + FINAL[c[-1]]
        if last and v in (PATAH, SEGOL, QAMATS):
            v += 'ה'                                       # open final vowel: דֶה, סַבַּקַה
        out += c + v
    out = out.replace('יְי', 'י').replace('י' + SHVA + 'י', 'י')
    return out

# vowel -> (niqqud on previous consonant, extra letters)
V = {'a': (PATAH, ''), 'ɑ': (PATAH, ''), 'ʌ': (PATAH, ''), 'ɐ': (PATAH, ''), 'æ': (PATAH, ''),
     'e': (SEGOL, ''), 'ɛ': (SEGOL, ''), 'ø': (SEGOL, ''), 'œ': (SEGOL, ''), 'ə': (SEGOL, ''),
     'i': (HIRIQ, 'י'), 'ɪ': (HIRIQ, 'י'), 'y': (HIRIQ, 'י'), 'ɨ': (SHVA, ''),
     'o': ('', 'וֹ'), 'ɔ': ('', 'וֹ'), 'ɵ': ('', 'וֹ'), 'u': ('', 'וּ'), 'ʊ': ('', 'וּ')}
NASAL = {'ɑ̃': (QAMATS, 'אן'), 'ɔ̃': ('', 'וֹן'), 'ɛ̃': (SEGOL, 'ן'), 'œ̃': (SEGOL, 'ן')}
C = [('tʃ', 'צ' + GERESH), ('dʒ', 'ג' + GERESH), ('ts', 'צ'), ('ʃ', 'שׁ'), ('ɕ', 'שׁ'), ('ʒ', 'ז' + GERESH), ('ʑ', 'ז'),
     ('b', 'בּ'), ('β', 'ב'), ('v', 'ו'), ('w', 'ו'), ('p', 'פּ'), ('f', 'פ'), ('k', 'ק'), ('ɡ', 'ג'), ('g', 'ג'), ('ɣ', 'ג'),
     ('t', 'ט'), ('d', 'ד'), ('ð', 'ד'), ('θ', 'ת' + GERESH), ('s', 'ס'), ('z', 'ז'), ('x', 'ח'), ('χ', 'ח'), ('h', 'ה'),
     ('ʁ', 'ר'), ('r', 'ר'), ('ɾ', 'ר'), ('l', 'ל'), ('ɭ', 'ל'), ('m', 'מ'), ('n', 'נ'), ('ŋ', 'נ'), ('ɲ', 'נְי'),
     ('ʎ', 'י'), ('ʝ', 'י'), ('j', 'י'), ('ʔ', '')]

def ipa_to_hebrew(p, lang):
    p = unicodedata.normalize('NFD', p)
    p = re.sub('[ˈˌː"`\\-]', '', p).replace('ɡ', 'g').replace('jj', 'j')
    if lang == 'es':
        p = p.replace('β', 'b')              # Spanish b/v are both heard as b
    words = []
    for w in p.split():
        units, i = [], 0
        palatal = False
        while i < len(w):
            ch = w[i]
            nas = w[i:i + 2]
            if nas in NASAL or (ch in 'aɑɔɛœ' and w[i + 1:i + 2] == '̃'):
                key = unicodedata.normalize('NFC', w[i:i + 2]) if False else w[i] + '̃'
                mark, extra = NASAL.get(key, (SEGOL, 'ן'))
                if not units or units[-1][1]:
                    units.append(('א', ''))
                c, _ = units[-1]; units[-1] = (c, mark + extra); i += 2; continue
            if ch == 'ʲ':
                palatal = not (units and units[-1][0].rstrip(SHVA) in ('צ' + GERESH, 'שׁ', 'ז' + GERESH, 'י', 'צ'))
                i += 1; continue
            if lang == 'fr' and ch in 'wy' and w[i + 1:i + 2] in (('a', 'ɑ') if ch == 'w' else tuple(V)):
                if not units or units[-1][1]:
                    units.append(('א', ''))
                c, _ = units[-1]
                units[-1] = ('ו' if c == 'וו' else c, 'וּ'); units.append(('א', '')); i += 1; continue
            if ch in V:
                mark, extra = V[ch]
                if lang == 'ru' and ch == 'ʌ' and palatal:
                    mark, extra = HIRIQ, 'י'; palatal = False
                if lang == 'fr' and ch == 'y':
                    mark, extra = '', 'וּ'          # French u: closest Hebrew sound
                # Russian я/ю/ё after a soft consonant: insert y (пять = פְּיַאט)
                if palatal and lang == 'ru' and ch in 'aɑuʊoɵ' and units and not units[-1][1]:
                    units[-1] = (units[-1][0] + SHVA if not units[-1][1] else units[-1][0], units[-1][1])
                    units.append(('י', ''))
                palatal = False
                if not units or units[-1][1]:
                    units.append(('א', ''))
                c, _ = units[-1]
                glide_ends = w[i + 2:i + 3] not in V
                if ch in 'eɛ' and w[i + 1:i + 2] in ('ɪ', 'j') and glide_ends:  # ei / ej
                    units[-1] = (c, TSERE + 'י'); i += 2; continue
                if ch in 'aɑ' and w[i + 1:i + 2] in ('ɪ', 'j', 'i') and glide_ends:
                    units[-1] = (c, PATAH + 'י'); i += 2; continue
                if ch in 'aɑ' and w[i + 1:i + 2] in ('ʊ', 'u'):
                    units[-1] = (c, QAMATS + 'אוּ'); i += 2; continue
                if c in ('ו', 'וו') and extra and extra[0] == 'ו':
                    units[-1] = ('ו', extra)
                else:
                    units[-1] = (c, mark + extra)
                i += 1; continue
            for k, heb in C:
                if w.startswith(k, i):
                    palatal = False
                    if heb == 'ו' and units:   # medial consonant w/v is written וו
                        heb = 'וו'
                    if heb:
                        if units and not units[-1][1] and units[-1][0] not in ('',):
                            units[-1] = (units[-1][0] + SHVA, '​')  # closed syllable
                        units.append((heb, ''))
                    i += len(k); break
            else:
                i += 1
        units = [(c, '' if v == '​' else v) for c, v in units]
        # shva marks only inside the word, not on the last letter
        word = finish(units).replace('\u200b', '')
        word = re.sub('ן(?=.)', 'נ' + SHVA, word)        # nasal n inside the word
        words.append(word)
    return ' '.join(words)

# ---------- Arabic: vocalized spelling -> Hebrew letters ----------
AR = {'ب': 'בּ', 'ت': 'ת', 'ث': 'ת' + GERESH, 'ج': 'ג' + GERESH, 'ح': 'ח', 'خ': 'ח' + GERESH, 'د': 'ד', 'ذ': 'ד' + GERESH,
      'ر': 'ר', 'ز': 'ז', 'س': 'ס', 'ش': 'שׁ', 'ص': 'צ', 'ض': 'צ' + GERESH, 'ط': 'ט', 'ظ': 'ט' + GERESH, 'ع': 'ע',
      'غ': 'ע' + GERESH, 'ف': 'פ', 'ق': 'ק', 'ك': 'כּ', 'ل': 'ל', 'م': 'מ', 'ن': 'נ', 'ه': 'ה', 'و': 'ו', 'ي': 'י',
      'ء': 'א', 'أ': 'א', 'إ': 'א', 'ؤ': 'א', 'ئ': 'א', 'ا': 'א', 'ة': 'ה', 'ى': 'א'}
FATHA, DAMMA, KASRA, SUKUN, SHADDA, TAN_F = 'َ', 'ُ', 'ِ', 'ْ', 'ّ', 'ً'

def arabic_to_hebrew(text):
    words = []
    for w in text.split():
        # split into (letter, marks)
        seq, i = [], 0
        while i < len(w):
            ch, marks = w[i], ''
            i += 1
            while i < len(w) and 'ً' <= w[i] <= 'ْ':
                marks += w[i]; i += 1
            seq.append([ch, marks])
        if len(seq) > 2 and seq[0][0] == 'ا' and seq[1][0] == 'ل' and words:   # ال after a word: wasl
            seq = seq[1:]
            if SHADDA in seq[1][1]:     # sun letter: the l is not heard
                seq = seq[1:]
            seq[0] = [seq[0][0], seq[0][1] or FATHA] if seq[0][0] != 'ل' else seq[0]
        units = []
        for j, (ch, marks) in enumerate(seq):
            nxt = seq[j + 1] if j + 1 < len(seq) else None
            prev_mark = units[-1][1] if units else None
            if ch == 'ا' and units and (FATHA in seq[j - 1][1] or TAN_F in seq[j - 1][1] or TAN_F in marks):   # long a / tanween carrier
                c, v = units[-1]
                units[-1] = (c, PATAH + 'א')
                if TAN_F in marks or TAN_F in seq[j - 1][1]:
                    units[-1] = (c, PATAH + 'ן')
                continue
            if ch == 'و' and units and DAMMA in seq[j - 1][1] and not marks:
                c, v = units[-1]; units[-1] = (c, 'וּ'); continue
            if ch == 'ي' and units and KASRA in seq[j - 1][1] and (not marks or marks == SHADDA):
                c, v = units[-1]; units[-1] = (c, HIRIQ + 'י'); continue
            if ch == 'ء' and units and units[-1][1].endswith('א') and not nxt:
                continue                                  # final hamza after long a: not written
            if ch == 'ة':
                c, v = units[-1]; units[-1] = (c, PATAH + 'ה'); continue   # pausal -a
            heb = AR.get(ch, '')
            vowel = ''
            if FATHA in marks: vowel = PATAH
            elif KASRA in marks: vowel = HIRIQ
            elif DAMMA in marks: vowel = QUBUTS
            elif SUKUN in marks: vowel = SHVA
            if TAN_F in marks: vowel = PATAH + 'ן'
            if SHADDA in marks and heb and DAGESH not in heb:
                heb += DAGESH
            if ch in 'وي' and SUKUN in marks and units:    # diphthong aw / ay
                vowel = ''
            units.append((heb, vowel))
        # drop shva on the last letter
        if units and units[-1][1] == SHVA:
            units[-1] = (units[-1][0], '')
        words.append(finish(units))
    return ' '.join(words)

# ---------- Amharic: Ge'ez script -> Hebrew letters ----------
AM_C = {'H': 'ה', 'L': 'ל', 'HH': 'ה', 'M': 'מ', 'SZ': 'ס', 'R': 'ר', 'S': 'ס', 'SH': 'שׁ', 'Q': 'ק', 'QH': 'ק',
        'B': 'בּ', 'V': 'ו', 'T': 'ט', 'C': 'צ' + GERESH, 'X': 'ה', 'N': 'נ', 'NY': 'נְי', 'GLOTTAL': 'א', 'K': 'ק',
        'KX': 'ה', 'W': 'ו', 'PHARYNGEAL': 'א', 'Z': 'ז', 'ZH': 'ז' + GERESH, 'Y': 'י', 'D': 'ד', 'DD': 'ד',
        'J': 'ג' + GERESH, 'G': 'ג', 'GG': 'ג', 'TH': 'ט', 'CH': 'צ' + GERESH, 'PH': 'פּ', 'TS': 'צ', 'TZ': 'צ',
        'F': 'פ', 'P': 'פּ'}
AM_V = {'A': SEGOL, 'U': 'וּ', 'I': HIRIQ + 'י', 'AA': PATAH, 'EE': TSERE + 'י', 'E': SHVA, 'O': 'וֹ',
        'WA': SHVA + 'וֶ', 'WAA': SHVA + 'וַ', 'WE': SHVA + 'וּ', 'WI': SHVA + 'וִי', 'WEE': SHVA + 'וֵי'}

def amharic_to_hebrew(text):
    words = []
    for w in text.split():
        units = []
        for ch in w:
            name = unicodedata.name(ch).replace('ETHIOPIC SYLLABLE ', '')
            if name.startswith(('GLOTTAL ', 'PHARYNGEAL ')):
                cons, vow = name.split(' ')
                vow = {'A': 'AA', 'E': 'E'}.get(vow, vow)   # አ is "a"; እ is the bare carrier
                units.append(['א', AM_V[vow] if vow != 'E' else HIRIQ])
                continue
            for vow in ('WAA', 'WEE', 'WA', 'WE', 'WI', 'AA', 'EE', 'A', 'E', 'I', 'O', 'U'):
                if name.endswith(vow) and name[:-len(vow)] in AM_C:
                    cons = name[:-len(vow)]; break
            else:
                raise ValueError('unknown Ethiopic syllable ' + name)
            if vow == 'E' and cons == 'W' and ch != w[-1]:
                vow = 'U'                                   # ውሻ = wusha
            if vow == 'A' and cons in ('H', 'HH', 'X', 'KX'):
                vow = 'AA'                                  # after h-sounds the 1st order is "a"
            units.append([AM_C[cons], AM_V[vow]])
        # The 6th order has no vowel; Amharic inserts a short "i" to break clusters.
        SONOR = ('ר', 'ל', 'מ', 'נ', 'ו', 'י')
        n = len(units)
        for j in range(n):
            if units[j][1] != SHVA:
                continue
            nxt_bare = j + 1 < n and units[j + 1][1] == SHVA
            final_pair = j + 2 == n and nxt_bare
            glide = units[j][0] in ('י', 'ו') and j > 0
            if j == 0 or (nxt_bare and not final_pair and not glide) or (final_pair and units[j + 1][0] in SONOR and not glide):
                units[j][1] = HIRIQ
        if units and units[-1][1] == SHVA:
            units[-1][1] = ''
        words.append(finish([tuple(u) for u in units]))
    return ' '.join(words)

# ---------- run ----------
VOICE = {'fr': 'fr-fr', 'es': 'es-419', 'ru': 'ru'}
# Where eSpeak is known to be wrong, the corrected IPA and the reason (printed in the report).
IPA_FIX = {('ru', 'sun'): ('sˈontsə', 'eSpeak הוגה את ה-л ב-солнце, אבל היא שקטה (сонце)')}

def main(path, write):
    d = json.load(open(path))
    topics, words = d['TOPICS'], d['WORDS']
    item = {k: (he, emoji) for t in topics for k, he, emoji in t['items']}
    problems, notes, say = [], [], {}
    for lang, entries in words.items():
        names, nums = cldr(lang), rbnf(lang)
        say[lang] = {}
        rows = []
        for key, val in entries.items():
            if key not in item:
                problems.append(f'{lang}/{key}: מפתח לא קיים בנושאים'); continue
            w = val['w'] if isinstance(val, dict) else val
            word, voc = (w[0], w[1]) if isinstance(w, list) else (w, w)
            he, emoji = item[key]
            # 1. meaning
            if key.isdigit():
                ok = norm(lang, word) in {norm(lang, x) for x in nums.get(int(key), set())}
                src = 'CLDR מספרים'
            else:
                pics = [emoji] + ALSO.get(key, [])
                ok = any(in_names(lang, word, names.get(p.replace('️', ''), [])) for p in pics)
                src = 'CLDR שם התמונה'
                if not ok and in_dictionary(lang, word) and key in ('hello', 'goodbye'):
                    ok, src = True, 'מילון Hunspell'
                    notes.append(f'{lang}/{key} "{word}": אין שם תמונה ב-Unicode; אומת במילון בלבד')
            if not ok:
                cand = ' / '.join(names.get(emoji.replace('️', ''), [])[:10]) if not key.isdigit() else ' / '.join(sorted(nums.get(int(key), [])))
                problems.append(f'{lang}/{key} "{word}" ({he} {emoji}) לא נמצא במקור. במקור: {cand}')
            if lang == 'ar' and norm('ar', voc) != norm('ar', word):
                problems.append(f'ar/{key}: הצורה המנוקדת "{voc}" לא תואמת למילה "{word}"')
            rows.append((key, word, voc))
        # 2. pronunciation
        if lang in VOICE:
            ps = ipa([r[1] for r in rows], VOICE[lang])
            for (key, word, _), p in zip(rows, ps):
                if (lang, key) in IPA_FIX:
                    p, why = IPA_FIX[(lang, key)]
                    notes.append(f'{lang}/{key} "{word}": תיקון ידני להגייה — {why}')
                say[lang][key] = ipa_to_hebrew(p, lang)
        elif lang == 'ar':
            plain = ipa([r[1] for r in rows], 'ar')
            vocal = ipa([r[2] for r in rows], 'ar')
            checked = 0
            for (key, word, voc), p0, p1 in zip(rows, plain, vocal):
                say['ar'][key] = arabic_to_hebrew(voc)
                strip = lambda s: re.sub('[ˈˌː.̩-ͯ]', '', s)
                # eSpeak guessed vowels for the bare word: they must agree with our harakat
                if re.search('[aiu]', p0) and len(re.findall('[aiu]', p0)) >= len(re.findall('[َُِ]', voc)) - 0:
                    if strip(p0).replace('t̪', 't').replace('s̪', 's') == strip(p1).replace('t̪', 't').replace('s̪', 's'):
                        checked += 1
                    else:
                        notes.append(f'ar/{key} "{voc}": eSpeak בלי ניקוד קורא /{p0}/, עם הניקוד שלנו /{p1}/')
            notes.append(f'ar: {checked} מתוך {len(rows)} מילים — הניקוד זהה לניחוש העצמאי של eSpeak')
        elif lang == 'am':
            for key, word, _ in rows:
                say['am'][key] = amharic_to_hebrew(word)
    gen = '// Generated by scripts/lang-verify/vocab.py — do not edit by hand.\n' \
          '// Hebrew-letter pronunciation computed from eSpeak NG (fr, es, ru), the vocalized\n' \
          '// spelling (ar) and the Ge\'ez script (am).\n' \
          'export const SAY = ' + json.dumps(say, ensure_ascii=False, indent=1) + '\n'
    current = open(OUT).read() if os.path.exists(OUT) else ''
    if write:
        open(OUT, 'w').write(gen)
    elif current != gen:
        problems.append('say.generated.js לא מעודכן — הריצו עם --write')
    total = sum(len(v) for v in words.values())
    print(f'# אימות שפות — {total} מילים\n')
    print(f'## בעיות ({len(problems)})'); [print('- ' + x) for x in problems]
    print(f'\n## הערות ({len(notes)})'); [print('- ' + x) for x in notes]
    return 1 if problems else 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1], '--write' in sys.argv))
