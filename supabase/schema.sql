-- Ogrodek: kazdy kwiatek to rysunek (kreski wektorowe) + miejsce na lace.
-- Wklej w Supabase -> SQL Editor -> Run.

create table if not exists public.flowers (
  id uuid primary key default gen_random_uuid(),
  author text not null check (author in ('a', 'b')),
  strokes jsonb not null,
  x real not null,
  y real not null,
  created_at timestamptz not null default now()
);

alter table public.flowers enable row level security;

-- Apka jest prywatna i chodzi na kluczu anon, wiec polityki sa otwarte.
-- Kto zna URL projektu i klucz anon, moze czytac i sadzic kwiatki.
-- Na prezent dla dwoch osob to wystarcza; jesli kiedys ma byc twardziej,
-- trzeba wlaczyc Supabase Auth i oprzec polityki na auth.uid().
drop policy if exists "ogrodek czyta" on public.flowers;
create policy "ogrodek czyta" on public.flowers
  for select using (true);

drop policy if exists "ogrodek sadzi" on public.flowers;
create policy "ogrodek sadzi" on public.flowers
  for insert with check (true);

-- realtime: druga osoba widzi nowy kwiatek od razu
alter publication supabase_realtime add table public.flowers;
