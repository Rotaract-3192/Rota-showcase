-- 008_storage.sql
-- Sets up Supabase storage buckets and configures Row Level Security (RLS) policies for uploads/downloads.

-- 1. Create public_assets bucket (for logos, avatars, showcase highlights)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public_assets',
  'public_assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Create secure_documents bucket (for MoM documents, orientations reports, DOV notes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'secure_documents',
  'secure_documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Clean up existing storage policies if any
DROP POLICY IF EXISTS "Public read access for public_assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access for public_assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access for secure_documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated read access for secure_documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete their own files" ON storage.objects;

-- 3. Storage Objects Policies
-- Allow public SELECT access to public_assets
CREATE POLICY "Public read access for public_assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'public_assets');

-- Allow authenticated users to INSERT (upload) into public_assets
CREATE POLICY "Authenticated upload access for public_assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public_assets');

-- Allow authenticated users to SELECT (read) secure_documents
CREATE POLICY "Authenticated read access for secure_documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'secure_documents');

-- Allow authenticated users to INSERT (upload) into secure_documents
CREATE POLICY "Authenticated upload access for secure_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'secure_documents');

-- Allow owners to delete their own uploaded files
CREATE POLICY "Owners can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (owner = auth.uid());
