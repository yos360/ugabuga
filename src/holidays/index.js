// Every holiday area registers itself: each ./*.jsx config file exports one object
// with a `slug` (e.g. PURIM_H). Pages without their own route are served by
// /holidays/:slug and /holidays/:slug/:kind (HolidayRoute).
const modules = import.meta.glob('./*.jsx', { eager: true })

export const HOLIDAY_CONFIGS = Object.fromEntries(
  Object.values(modules).flatMap(m => Object.values(m)).filter(v => v && typeof v === 'object' && v.slug && v.base).map(h => [h.slug, h])
)
