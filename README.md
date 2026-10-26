# עוגה בוגה — daily reel runbook

This branch (`reels-daily`) holds everything needed to make the daily עוגה בוגה promo reel and post it to
YouTube, Instagram, Facebook and TikTok. It is an orphan branch: it never touches the site (`main`).

The owner (Yossi) asked for: **one new reel every day at 8:00, each on a different topic from the site,
uploaded to the four networks, exactly in the style of the previous reels.** Talk to him in Hebrew only.

## 0. Setup (fresh container)

```bash
git clone --depth 1 -b reels-daily https://github.com/yos360/ugabuga /home/claude/reels-kit
git clone --depth 1 https://github.com/yos360/ugabuga /root/ugabuga        # the site source = the facts
export CHROME_PATH=/home/claude/reels-kit/tools/chrome NO_PROXY=127.0.0.1,localhost
```
Node, ffmpeg and Chromium are preinstalled. Load the `animation-studio` skill if you need its docs; the
engine itself is vendored in `template/engine` (do not reinstall Playwright/Chromium).

## 1. Pick today's topic

- Read `TOPICS.md`. Never repeat a topic. Prefer (in order): an upcoming Jewish/Israeli holiday or school
  event this week → a section added recently on `main` (`git -C /root/ugabuga log --oneline -40`) → the ideas list.
- **Every fact in the reel comes from the site source** (`/root/ugabuga/src/...`): real labels, real options,
  real numbers, real copy. Read the page component and its data file. To see a page, build and preview:
  `cd /root/ugabuga && npm ci && npx vite build && npx vite preview --port 4173` then screenshot with
  Playwright (mobile 430×932). Do not invent features, prices, counts or quotes.

## 2. Make the reel (copy the template)

```bash
cp -r /home/claude/reels-kit/template /home/claude/reel-$(date +%F) && cd /home/claude/reel-$(date +%F)
```
Rewrite `score.js` (timeline + data), `film.js` (scenes) and `song.js` (music events). `examples/` has the
score/film/song of every earlier reel — reuse their scene ideas, never their topic.

The style that must stay the same (look at `examples/travel` and `examples/elections2`):
- 9:16, 1080×1920, ~28–32 s, 30 fps; 7 sections: hook (2 bars) → 5 numbered steps (2 bars each) → end card.
- Site look: paper `#fffefa` with a dot grid, ink `#14162d`, accents red `#cf2f56`, blue `#226bd7`,
  yellow `#fff4bb`, green `#23874d`, purple `#8a4fd8`, orange `#e08a00`; ink-outlined cards with an offset
  shadow; Heebo (Hebrew) + Fredoka (the URL pill); lilac→pink→yellow hero gradient on the hook and end card.
- Step header: coloured number badge + big title + grey subtitle, right-aligned (RTL). RTL slide transition.
- Real site characters only (`img/`): detective boy, schoolgirl, birthday girl, printer, logo.
  **Never the caveman (`buga-4`).** Characters from `/root/ugabuga/public/images/*.webp` only if transparent.
- End card: logo, "עוגה בוגה", one line about the topic, a yellow "free" pill, the blue `ugabuga.co.il` pill,
  a grey line pointing to where it is on the site.
- Music: synthesized in `song.js`, every hit tied to a score event; master with `LUFS=-14`.
- Hebrew text: use the `he()` helper. Strings with no Hebrew letters → `dir: 'ltr'`. Number ranges inside
  Hebrew (e.g. `1–3 שעות`, `גיל 6–7`) must be wrapped in `⁦…⁩` or they render reversed.

Render and check:
```bash
LUFS=-14 node song.js
node engine/render.js stills 1.5 3.8 6 8 10 12 14 16 18 20 22 25 27   # look at EVERY still
node engine/render.js video && node engine/render.js mux
node engine/render.js check && node engine/render.js verify          # fix any ✗ in score.js
```
Look at the stills yourself (contact sheet) and fix overlaps, clipped text, reversed numbers, empty areas.
A lag of ≤3 frames on a pop animation is acceptable; anything more, fix.

Deliverables (must live under `/home/claude` and be < 10 MB for the browser upload):
```bash
ffmpeg -y -ss 3.9 -i out/<name>.mp4 -frames:v 1 -q:v 2 /home/claude/reel-cover.jpg   # a frame where the hook is complete
ffmpeg -y -i out/<name>.mp4 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart /home/claude/reel-upload.mp4
```

## 3. Captions (Hebrew)

- Main caption (Instagram/Facebook/TikTok/YouTube description): hook line with emoji, one line "בעוגה בוגה יש…",
  3–5 emoji bullet lines with real features, "הכול בחינם, בלי הרשמה 💛", the link
  (`https://ugabuga.co.il/<path>`; on Instagram write "הקישור בביו"), then 4–6 Hebrew hashtags starting with `#עוגה_בוגה`.
- YouTube title ≤ 100 chars ending with `#shorts`.
- TikTok: one paragraph + hashtags typed one by one, each followed by a space.

## 4. Upload (Claude in Chrome, the owner's real browser)

Use `find` to get the `<input type=file>` ref and `file_upload` (never click file pickers).
Never type passwords. If any site asks to log in, skip that network and tell the owner.

**YouTube** — `https://studio.youtube.com/channel/UCFXZd5zbGFzkMgMHoMdKkwQ/videos/upload?d=ud`
upload → title (ctrl+a, type) → description → thumbnail: the image upload input often does not apply, so use
"בחירה מהסרטון" and pick the hook frame → audience **"כן, הסרטון נוצר במיוחד לילדים"** → category **השכלה**
(check it did not land on Comedy) → הבא ×3 → **גלוי לכולם** → פרסום. Note the shorts URL.

**Instagram** (account `ugabuga.co.il`) — `https://www.instagram.com/` → יצירה → פוסט → file input →
crop icon (bottom-RIGHT of the preview) → **מקור** (not the default square) → הבא → תמונת נושא:
"בחירה מהמחשב" (file input) with the cover → הבא → caption → type a space to close the hashtag popup →
leave "share to Facebook" OFF → שיתוף → wait for "סרטון Reels שלך שותף".

**Facebook** — must be the **עוגה בוגה** profile (`https://www.facebook.com/profile.php?id=61585005411647`).
Chrome is often logged in as the owner's personal account / "אלוף המצגות" page. Check the avatar/name first.
If switching to עוגה בוגה asks for a password → do NOT continue; skip Facebook and tell the owner.
Upload at `https://www.facebook.com/reels/create` (or "Reels" on the profile) with the caption and cover.

**TikTok** (account עוגהבוגה, `@hellorwsvm8`) — `https://www.tiktok.com/tiktokstudio/upload?from=upload&lang=he-IL`
file input → description (ctrl+a, Delete, type) → "לערוך את הקאבר" → "להעלות תמונת קאבר" file input →
שמירה → "מי יכול לראות" = כולם → לפרסם. It shows "בבדיקה / רק אני" for a few minutes, that is normal.

## 5. Finish

1. Append today's line to `TOPICS.md` (✓ / ✗ per network) and push:
   `git -C /home/claude/reels-kit commit -am "Reel <date>: <topic>" && git -C /home/claude/reels-kit push origin reels-daily`
2. Copy the finished project's `score.js film.js song.js` into `examples/<short-name>/` in the same commit.
3. Tell the owner **in Hebrew**: the topic, the reel file (send it), the YouTube link, which networks are
   up, and anything that needs him (e.g. a Facebook password). Short.
