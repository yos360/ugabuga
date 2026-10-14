# Original Israeli & Jewish icons

This is part 2 of `codex-task-emoji-library.md`, layered on the Hebrew emoji library. `/emoji/israeli` adds one page; the existing 22 occasion pages reuse relevant artwork without creating per-icon routes.

## Authorship and license

48 vector illustrations were hand-authored as SVG paths and geometric primitives for Ugabuga / Codex. There are no traced emoji, vendor images, logos, branded packaging, external fonts or real people. Each icon and its outline counterpart include creator and **CC0-1.0** metadata. The same information is recorded per icon in `src/emoji/israeliIconData.js`, with the CC0 public-domain dedication in `public/icons/israeli/LICENSE.txt`.

The editable source geometry is `scripts/generate-israeli-icons.mjs`. Run `node scripts/generate-israeli-icons.mjs` to regenerate the 96 SVG files, metadata and license notice. The outline version preserves geometry, replaces fills with white and strokes with dark gray, and leaves the surrounding canvas transparent.

## Export, sharing and print

- Local SVGs render to a transparent 512×512 canvas. PNG and WebP MIME types are checked; browsers that silently substitute PNG for WebP show an error instead of downloading a mislabeled file.
- Downloads are created locally; no conversion service or upload is involved. Temporary object URLs are revoked.
- Sharing appears only when the browser reports file-sharing support. A preparation tap builds the PNG; a separate share tap preserves the browser's user-activation requirement, including mobile Safari. A cancelled native share is not an error. Actual app destinations are controlled by the device.
- All 48 icons print on three A4 sheets (16 per sheet) in color or outline mode through the existing `PrintPreview` flow, including PDF support and the site's QR footer.

The icons are image assets, not new Unicode characters or an automatically installed sticker pack. The page explains PNG attachment and manual sticker creation. WhatsApp Web/desktop controls vary by version; users without the desktop creation control are directed to Web.

References checked October 2026: [WhatsApp custom stickers help](https://faq.whatsapp.com/1056840314992666/) and [official WhatsApp sticker repository](https://github.com/WhatsApp/stickers). The files use the documented 512×512 size; browser QA also verifies every PNG/WebP export is below 100 KB.

## Validation

`tests/israeli-icons.test.mjs` verifies all metadata, source files, outline colors, licensing, holiday coverage and route registration. Browser checks cover all 192 outputs (48 icons × color/outline × PNG/WebP), alpha transparency, dimensions, nonempty artwork, file downloads, 390px layout, holiday integration, print dialogs and a simulated file-sharing API. OS share sheets and delivery inside an actual WhatsApp account are not automated.
