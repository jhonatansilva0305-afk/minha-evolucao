-- MINHA EVOLUÇÃO: executar UMA VEZ no SQL Editor do seu projeto Supabase.
-- A tabela é privada, com Row Level Security (RLS) por usuário.
-- Não usar a chave service_role no navegador.
create table if not exists public.evolution_records (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('dose','measure','photo','workout','routine','prefs')),
  occurred_on date not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists evolution_records_owner_idx on public.evolution_records(user_id, occurred_on desc);
alter table public.evolution_records enable row level security;

-- Evita duplicar políticas ao rodar novamente.
drop policy if exists evolution_read_own on public.evolution_records;
drop policy if exists evolution_insert_own on public.evolution_records;
drop policy if exists evolution_update_own on public.evolution_records;
drop policy if exists evolution_delete_own on public.evolution_records;
create policy evolution_read_own on public.evolution_records for select to authenticated using ((select auth.uid()) = user_id);
create policy evolution_insert_own on public.evolution_records for insert to authenticated with check ((select auth.uid()) = user_id);
create policy evolution_update_own on public.evolution_records for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy evolution_delete_own on public.evolution_records for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.evolution_records to authenticated;

-- Bucket PRIVADO para fotografias. Se existir, não altera o atributo public.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evolution_photos','evolution_photos',false,10485760,array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit=10485760, allowed_mime_types = array['image/jpeg'];

drop policy if exists evolution_photo_read on storage.objects;
drop policy if exists evolution_photo_insert on storage.objects;
drop policy if exists evolution_photo_update on storage.objects;
drop policy if exists evolution_photo_delete on storage.objects;
create policy evolution_photo_read on storage.objects for select to authenticated
 using (bucket_id='evolution_photos' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy evolution_photo_insert on storage.objects for insert to authenticated
 with check (bucket_id='evolution_photos' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy evolution_photo_update on storage.objects for update to authenticated
 using (bucket_id='evolution_photos' and (storage.foldername(name))[1] = (select auth.uid()::text))
 with check (bucket_id='evolution_photos' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy evolution_photo_delete on storage.objects for delete to authenticated
 using (bucket_id='evolution_photos' and (storage.foldername(name))[1] = (select auth.uid()::text));
