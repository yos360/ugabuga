// Page groups for the per-group sitemaps (scripts/generate-sitemap.mjs, tests/sitemap-groups.test.mjs).
import { NOINDEX_PATHS } from './noindex-paths.mjs'
export const HELD_BACK = [
  /^\/learn\/[^/]+\/concepts\/[^/]+$/, // ~2,100 one-term glossary pages
  /^\/printables\/name-coloring\/[^/]+$/, // the 262 baby names again, as colouring sheets
  /^\/time-tunnel\/[^/]+$/, // "what happened on this day", one page per date
  { test: path => NOINDEX_PATHS.has(path) }, // thin pages Google declined, now noindex (scripts/noindex-paths.mjs)
]
export const GROUPS = [
  ['learn', /^\/learn(\/|$)/],
  ['printables', /^\/(printables|booklets|coloring)(\/|$)/],
  ['names', /^\/(baby-names|family-names)(\/|$)/],
  ['games', /^\/(games|online-games|arcade|board-games|card-games|dice-games)(\/|$)/],
  ['shabbat-holidays', /^\/(shabbat-times|holidays|parasha|hebrew-calendar|shabbat-activities)(\/|$)/],
  ['english', /^\/(en|unseen)(\/|$)/],
  ['suppliers', /^\/suppliers(\/|$)/],
  ['pages', /^/],
]
