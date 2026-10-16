insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'inaude-album',
  'inaude-album',
  true,
  104857600,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Visitors can view Inaude album files" on storage.objects;
create policy "Visitors can view Inaude album files"
on storage.objects for select
to anon
using (bucket_id = 'inaude-album');

drop policy if exists "Guests can upload to Inaude album" on storage.objects;
create policy "Guests can upload to Inaude album"
on storage.objects for insert
to anon
with check (bucket_id = 'inaude-album');
