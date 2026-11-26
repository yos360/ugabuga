-- "ספק מייסד": the first suppliers, listed free now, promised a permanent discount once paid plans start.
-- Safe to run again.
alter table public.suppliers add column if not exists founder boolean not null default false;

-- Public shape (no user_id, no internal flags) + founder badge.
create or replace function public.sup_public(s public.suppliers) returns jsonb language sql stable
set search_path = public as $$
  select jsonb_build_object('id', s.id, 'slug', s.slug, 'plan', s.plan, 'template', s.template,
    'name', s.name, 'tagline', s.tagline, 'about', s.about, 'category', s.category, 'area', s.area, 'tags', to_jsonb(s.tags),
    'logo_url', s.logo_url, 'cover_url', s.cover_url, 'whatsapp', s.whatsapp, 'phone', s.phone,
    'instagram', s.instagram, 'facebook', s.facebook, 'tiktok', s.tiktok, 'youtube', s.youtube, 'website', s.website,
    'gallery', s.gallery, 'videos', s.videos, 'services', s.services, 'founder', s.founder);
$$;

-- First founding supplier: PROFETA Photography (Hadera and the Sharon), added at the owner's request.
insert into public.suppliers (slug, status, plan, name, tagline, about, category, area, tags, logo_url, whatsapp, phone, instagram, facebook, website, founder)
values (
  'profeta-photography', 'approved', 'card', 'פרופטה צילום',
  'הרגעים שלכם, כמו שהרגשתם אותם · צלם אירועים בחדרה ובשרון',
  'תמיר פרופטה, צלם אירועים בחדרה, בשרון ובסביבה. צילום טבעי ולא מבוים של הרגעים האמיתיים: בר ובת מצווה, בריתות, עליות לתורה, חינות וחתונות בוטיק. יחס אישי, ציוד מקצועי ועריכה של כל תמונה. אפשר גם וידאו ומגנטים לאירוע.',
  'photo', 'שרון', array['בר ובת מצווה', 'בריתות', 'מגנטים לאירועים', 'וידאו'],
  'https://profetaphotographer.com/logo.svg', '0502151011', '0502151011',
  'https://www.instagram.com/profeta_photographer/', 'https://www.facebook.com/share/1DSjCW2x2v/', 'https://profetaphotographer.com', true
)
on conflict (slug) do nothing;
update public.suppliers set founder = true where slug = 'profeta-photography' and not founder;
