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

-- Notatka do kwiatka (dodane pozniej - bezpieczne przy ponownym uruchomieniu).
alter table public.flowers add column if not exists note text not null default '';

-- ---------------------------------------------------------------------------
-- List: jeden wiersz (id = 1), tresc + adres zdjecia.
-- ---------------------------------------------------------------------------

create table if not exists public.letter (
  id smallint primary key check (id = 1),
  body text not null default '',
  photo text,
  updated_at timestamptz not null default now()
);

alter table public.letter enable row level security;

drop policy if exists "list czyta" on public.letter;
create policy "list czyta" on public.letter for select using (true);

drop policy if exists "list pisze" on public.letter;
create policy "list pisze" on public.letter for insert with check (id = 1);

drop policy if exists "list poprawia" on public.letter;
create policy "list poprawia" on public.letter for update using (id = 1) with check (id = 1);

alter publication supabase_realtime add table public.letter;

-- Zdjecie ladujemy do publicznego bucketa "letter".
insert into storage.buckets (id, name, public)
values ('letter', 'letter', true)
on conflict (id) do nothing;

drop policy if exists "zdjecia czyta" on storage.objects;
create policy "zdjecia czyta" on storage.objects
  for select using (bucket_id = 'letter');

drop policy if exists "zdjecia wgrywa" on storage.objects;
create policy "zdjecia wgrywa" on storage.objects
  for insert with check (bucket_id = 'letter');

drop policy if exists "zdjecia nadpisuje" on storage.objects;
create policy "zdjecia nadpisuje" on storage.objects
  for update using (bucket_id = 'letter') with check (bucket_id = 'letter');

-- Usuwanie kwiatkow (dodane pozniej).
drop policy if exists "ogrodek plewi" on public.flowers;
create policy "ogrodek plewi" on public.flowers for delete using (true);
