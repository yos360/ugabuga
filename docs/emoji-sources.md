# Emoji data and attribution

The library uses native device fonts, never vendor emoji artwork. The JSON is fetched only when the library mounts; it is not imported into the application bundle.

## Pinned inputs

- Unicode Emoji **17.0**, official [emoji-test.txt](https://www.unicode.org/Public/17.0.0/emoji/emoji-test.txt): 3,944 fully-qualified sequences and nine components. Unqualified/minimally-qualified spellings are not duplicated.
- Unicode CLDR **48.2.0**, npm `cldr-annotations-full` and `cldr-annotations-derived-full`: `annotations/he/annotations.json` and `annotationsDerived/he/annotations.json`. Names and keywords are copied from Hebrew annotations, including generated skin-tone/ZWJ names.
- [CLDR annotation charts](https://www.unicode.org/cldr/charts/48/annotations/index.html).
- License: **Unicode License V3**, included verbatim in `public/data/UNICODE-LICENSE.txt`. JSON source checksums identify the exact three input files.

CLDR's sole non-Hebrew Hebrew-locale tts is `dvd` (📀). Its displayed name appends the first Hebrew keyword from the same annotation (`אופטי`), without inventing a translation. The original tts is retained for every entry. All other display names are the exact Hebrew tts.

## Compatibility choice (October 2026)

Emoji 17.0 is the stable device baseline selected for this task. [Apple iOS 26.4](https://support.apple.com/en-gb/123075) adds eight emoji; [Android 17's Unicode data](https://android.googlesource.com/platform/external/unicode/+/refs/tags/android-vts-17.0_r1/emoji-test.txt) contains Emoji 17.0. The moving Unicode `latest` endpoint already serves 18.0 data, so it must not be used for this generator. Individual apps, operating systems and fonts can lag behind: unsupported glyphs may appear as boxes or regional-indicator letters. No image fallback is bundled.

## Regenerate

Download the pinned emoji-test file and unpack both npm packages at version 48.2.0. Then run from the repository root:

```sh
node scripts/generate-emoji-data.mjs /path/emoji-test.txt /path/annotations/he/annotations.json /path/annotationsDerived/he/annotations.json
```

The generator rejects a different emoji version or incomplete coverage. Category placement is editorial (the emotion subgroup becomes hearts); Unicode sequence content and CLDR names are preserved. Skin-tone filtering selects existing sequences and never constructs unsupported combinations. “All tones” exposes mixed-tone sequences as well. Hebrew search ignores niqqud and geresh/gershayim.

Situation greetings and explanatory prose are original Ugabuga content. They are separate from the Unicode licensed dataset. Recently copied items stay in this browser's localStorage (maximum 16); blocked storage does not prevent copying. Only successful copies enter history.
