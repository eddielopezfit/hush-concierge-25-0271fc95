-- 1. Make the bucket private (blocks anon LIST endpoint)
UPDATE storage.buckets SET public = false WHERE id = 'site-assets';

-- 2. Allow anonymous SELECT on individual objects so direct URLs still resolve
DROP POLICY IF EXISTS "site_assets_public_read" ON storage.objects;
CREATE POLICY "site_assets_public_read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'site-assets');