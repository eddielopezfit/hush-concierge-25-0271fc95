UPDATE storage.buckets
SET public = false
WHERE id = 'site-assets';

DROP POLICY IF EXISTS "Public read site-assets" ON storage.objects;
DROP POLICY IF EXISTS "site_assets_public_read" ON storage.objects;
DROP POLICY IF EXISTS "site-assets read whitelisted homepage media" ON storage.objects;
DROP POLICY IF EXISTS "site-assets public read individual files" ON storage.objects;

CREATE POLICY "site-assets read whitelisted homepage media"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'site-assets'
  AND name IN (
    'Hush_Hero_v2_Desktop.mp4',
    'Hush_Hero_v2_Desktop_Poster.jpg',
    'Hush_Hero_v2_Mobile.mp4',
    'Hush_Hero_v2_Mobile_Poster.jpg',
    'Hush_Step_Inside_Desktop_v2.mp4',
    'Hush_Step_Inside_Mobile.mp4',
    'Hush_Step_Inside_Poster_v3.webp'
  )
);