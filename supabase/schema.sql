-- Ogrodek: jedna tabela, reszta liczona z niej po stronie klienta.
-- Wklej w Supabase -> SQL Editor -> Run.

create table if not exists public.waterings (
  id bigint generated always as identity primary key,
  person text not null check (person in ('a', 'b')),
  day date not null,
  created_at timestamptz not null default now(),
  unique (person, day)   -- jedna osoba podlewa raz dziennie
);

alter table public.waterings enable row level security;

-- Apka jest prywatna i chodzi na kluczu anon, wiec polityki sa otwarte.
-- Kto zna URL projektu i klucz anon, moze czytac i dopisywac podlania.
-- Na prezent dla dwoch osob w zupelnosci wystarcza; jesli kiedys ma to byc
-- twardsze, trzeba wlaczyc Supabase Auth i oprzec polityki na auth.uid().
drop policy if exists "ogrodek czyta" on public.waterings;
create policy "ogrodek czyta" on public.waterings
  for select using (true);

drop policy if exists "ogrodek podlewa" on public.waterings;
create policy "ogrodek podlewa" on public.waterings
  for insert with check (true);

-- realtime: druga osoba widzi podlanie od razu
alter publication supabase_realtime add table public.waterings;
