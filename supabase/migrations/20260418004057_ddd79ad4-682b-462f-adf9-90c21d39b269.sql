-- Revert bucket to public so CDN URLs in HeroSection and StepInsideSection continue to work
UPDATE storage.buckets
SET public = true
WHERE id = 'site-assets';