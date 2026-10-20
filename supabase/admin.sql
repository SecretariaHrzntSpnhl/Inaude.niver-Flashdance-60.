create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table if not exists private.album_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

revoke all on table private.album_admins from public, anon, authenticated;

create or replace function private.is_album_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.album_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_album_admin() from public, anon;
grant execute on function private.is_album_admin() to authenticated;

create or replace function public.is_album_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_album_admin();
$$;

revoke all on function public.is_album_admin() from public, anon;
grant execute on function public.is_album_admin() to authenticated;

drop policy if exists "Album admins can list Inaude album files" on storage.objects;
create policy "Album admins can list Inaude album files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'inaude-album'
  and (select private.is_album_admin())
);

drop policy if exists "Album admins can delete Inaude album files" on storage.objects;
create policy "Album admins can delete Inaude album files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'inaude-album'
  and (select private.is_album_admin())
);
