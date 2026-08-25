-- ---------------------------------------------------------------------------
-- Ogródek — schemat bazy.
--
-- Wklej CAŁOŚĆ w Supabase → SQL Editor → Run.
-- Skrypt można puszczać wielokrotnie: nie kasuje danych i nie wywala się,
-- gdy tabele już istnieją.
--
-- Uwaga o bezpieczeństwie: apka jest prywatna i chodzi na kluczu anon, więc
-- polityki są otwarte. Kto zna URL projektu i klucz anon, może czytać i pisać.
-- Na prezent dla dwóch osób to wystarcza; gdyby kiedyś miało być twardziej,
-- trzeba włączyć Supabase Auth i oprzeć polityki na auth.uid().
-- ---------------------------------------------------------------------------


-- --- Ogródek: kwiatek = rysunek (kreski wektorowe) + miejsce na łące --------

create table if not exists public.flowers (
  id uuid primary key default gen_random_uuid(),
  author text not null check (author in ('a', 'b')),
  strokes jsonb not null,
  note text not null default '',
  x real not null,
  y real not null,
  created_at timestamptz not null default now()
);

-- kolumna dodana po pierwszej wersji apki
alter table public.flowers add column if not exists note text not null default '';

alter table public.flowers enable row level security;

drop policy if exists "ogrodek czyta" on public.flowers;
create policy "ogrodek czyta" on public.flowers for select using (true);

drop policy if exists "ogrodek sadzi" on public.flowers;
create policy "ogrodek sadzi" on public.flowers for insert with check (true);

drop policy if exists "ogrodek plewi" on public.flowers;
create policy "ogrodek plewi" on public.flowers for delete using (true);


-- --- List: jeden wiersz (id = 1), treść + adres zdjęcia ---------------------

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

-- upsert to insert + update, więc obie polityki są potrzebne
drop policy if exists "list poprawia" on public.letter;
create policy "list poprawia" on public.letter for update using (id = 1) with check (id = 1);


-- --- Realtime: druga osoba widzi zmiany od razu -----------------------------
-- "alter publication ... add table" wywala się, gdy tabela już tam jest,
-- więc najpierw sprawdzamy.

do $$
declare
  t text;
begin
  foreach t in array array['flowers', 'letter'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;


-- --- Zdjęcie do listu: publiczny bucket "letter" ----------------------------

insert into storage.buckets (id, name, public)
values ('letter', 'letter', true)
on conflict (id) do update set public = true;

drop policy if exists "zdjecia czyta" on storage.objects;
create policy "zdjecia czyta" on storage.objects
  for select using (bucket_id = 'letter');

drop policy if exists "zdjecia wgrywa" on storage.objects;
create policy "zdjecia wgrywa" on storage.objects
  for insert with check (bucket_id = 'letter');

drop policy if exists "zdjecia nadpisuje" on storage.objects;
create policy "zdjecia nadpisuje" on storage.objects
  for update using (bucket_id = 'letter') with check (bucket_id = 'letter');
