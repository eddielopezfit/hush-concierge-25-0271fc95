-- Replace the broad read policy with a narrow allow-list of specific files.
-- Anonymous list() calls will return zero rows since no policy matches the bare prefix scan.
-- Direct CDN reads of these exact filenames continue to work.
DROP POLICY IF EXISTS "site-assets public read individual files" ON storage.objects;

CREATE POLICY "site-assets read whitelisted homepage media"
ON storage.objects
FOR SELECT
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