UPDATE storage.buckets SET public = true WHERE id = 'site-assets';
DROP POLICY IF EXISTS "site_assets_public_read" ON storage.objects;