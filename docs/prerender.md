# Prerender concurrency

`npm run build` prerenders with up to **6 reused browser tabs** per pass.
Set `PRERENDER_CONCURRENCY` in the build environment to an integer from 1 to 32
to tune memory/CPU use. `1` is useful for a serial comparison; start with 6 and
reduce it if the build machine runs out of memory. Both the static-page and
best-effort game-page passes use this setting. Invalid values fail immediately.

The output paths, page readiness checks, SEO checks, portal cleanup and asset URL
normalization are unchanged. Static snapshots are written in sitemap order.
Individual static-page failures are collected while other pages continue; the
final summary lists failures and the build exits unsuccessfully if any occurred.
Game-page failures remain best effort and do not fail the build.

Compare build times on the same machine and sitemap. Increasing concurrency
does not guarantee proportional speedups on CPU- or memory-constrained runners.
