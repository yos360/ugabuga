# SEO build verification

`npm run build` builds Vite and then pre-renders every canonical sitemap URL.
Playwright installs Chromium if missing on Linux; Windows uses installed Edge.
All requests outside the local build are blocked, and the live activity widget
is disabled during capture. The existing offline game catalogue is used.

The build fails for missing/multiple H1 headings, descriptions or canonical
tags, a canonical pointing to another URL, duplicate titles, or noindex pages.
Only validated snapshots are written to `dist`. They retain the app scripts
so forms, games and navigation work normally after JavaScript starts.

Route HTML is emitted as `route.html` to preserve extensionless, non-trailing
slash URLs on Cloudflare Pages. Unknown routes still use the native SPA
fallback and the existing client-side noindex error page. Do not reintroduce
a catch-all `/* /index.html 200` rule: it previously broke JavaScript delivery.

The www-to-apex 301 is a zone redirect rule (not a Pages `_redirects` rule).
It preserves the original path and query string.

After deploy, check initial response HTML and hydrated DOM independently,
then test www redirects, legacy aliases, and interaction on a mobile viewport.
Search Console index coverage and field Core Web Vitals require separate
account access; successful build validation is not proof of Google indexing.
