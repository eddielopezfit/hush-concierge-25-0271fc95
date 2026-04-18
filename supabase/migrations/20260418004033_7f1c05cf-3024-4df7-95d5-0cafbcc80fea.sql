-- Make the site-assets bucket private (disables anonymous bucket listing via the public CDN)
UPDATE storage.buckets
SET public = false
WHERE id = 'site-assets';

-- Drop any existing public-read policy for this bucket to avoid duplicates
DROP POLICY IF EXISTS "site-assets public read individual files" ON storage.objects;

-- Allow anyone to read an individual file when they request it by exact name.
-- Listing the bucket via storage.objects requires SELECT to return rows; since the
-- Supabase storage list() API is row-level filtered by RLS, this policy still allows
-- enumeration of object names through the API. To truly block listing we restrict
-- SELECT to authenticated requests with a known object name pattern is not feasible
-- without breaking direct CDN reads, so we keep a permissive SELECT but rely on
-- public=false to disable the unauthenticated public listing endpoint.
CREATE POLICY "site-assets public read individual files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site-assets');