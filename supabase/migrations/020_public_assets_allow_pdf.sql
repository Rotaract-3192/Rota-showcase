-- 020_public_assets_allow_pdf.sql
-- Club bulletins (PDF newsletters) are uploaded to public_assets via /api/upload.
-- The bucket previously only allowed images up to 5MB, so every PDF upload was rejected by Storage.

UPDATE storage.buckets
SET
  file_size_limit = 10485760, -- 10MB, matches MAX_BYTES in /api/upload
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf'
  ]
WHERE id = 'public_assets';
