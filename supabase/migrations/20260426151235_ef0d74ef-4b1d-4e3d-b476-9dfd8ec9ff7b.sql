update storage.buckets
set public = true
where id = 'site-assets';

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can view site assets'
  ) then
    create policy "Public can view site assets"
    on storage.objects
    for select
    to public
    using (bucket_id = 'site-assets');
  end if;
end $$;