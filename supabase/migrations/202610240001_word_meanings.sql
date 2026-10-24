-- Cache for the word-meaning Edge Function (dictionary + unseen texts). Only the function (service role)
-- reads and writes it; visitors never touch the table directly.
create table if not exists public.word_meanings (
  key text primary key,
  lang text not null check (lang in ('en','es','fr','ru','ar','he>he','he>en','he>es','he>fr','he>ru','he>ar')),
  word text not null check (char_length(word) between 1 and 40),
  sentence text check (sentence is null or char_length(sentence) <= 300),
  meaning text not null check (char_length(meaning) <= 60),
  other jsonb not null default '[]'::jsonb,
  lemma text,
  created_at timestamptz not null default now()
);
alter table public.word_meanings enable row level security;
revoke all on table public.word_meanings from anon, authenticated;
