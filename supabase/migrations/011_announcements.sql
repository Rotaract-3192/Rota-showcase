-- 011_announcements.sql
-- Creates the announcements table and enables RLS with audience-specific policies.

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sender VARCHAR(255) NOT NULL,
    target_audience VARCHAR(50) NOT NULL, -- 'All Clubs', 'Presidents Only', 'Secretaries Only'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Updated_at trigger
DROP TRIGGER IF EXISTS set_announcements_updated_at ON public.announcements;
CREATE TRIGGER set_announcements_updated_at BEFORE UPDATE ON public.announcements 
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- SELECT Policy: Allow authenticated users to read announcements matching their role
CREATE POLICY "Read announcements by audience" ON public.announcements
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND (
      target_audience = 'All Clubs'
      OR (target_audience = 'Presidents Only' AND public.auth_has_role('President', 'District Admin', 'Super Admin'))
      OR (target_audience = 'Secretaries Only' AND public.auth_has_role('Secretary', 'District Admin', 'Super Admin'))
      OR public.auth_has_role('District Admin', 'Super Admin')
    )
  );

-- WRITE Policy: Only Admins can create/modify announcements
CREATE POLICY "Admins manage announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (public.auth_has_role('District Admin', 'Super Admin'))
  WITH CHECK (public.auth_has_role('District Admin', 'Super Admin'));
