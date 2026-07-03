-- 007_rls.sql
-- Enables Row Level Security (RLS) on all tables and creates policies based on RBAC rules.

-- Helper function to get current user's club_id (checks JWT metadata first, then database fallback)
CREATE OR REPLACE FUNCTION public.get_auth_club_id()
RETURNS uuid AS $$
DECLARE
  v_club_id uuid;
BEGIN
  -- 1. Try to get from JWT metadata (Clerk custom claims)
  BEGIN
    v_club_id := (auth.jwt() -> 'metadata' ->> 'club_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_club_id := NULL;
  END;
  
  IF v_club_id IS NOT NULL THEN
    RETURN v_club_id;
  END IF;

  -- 2. Fallback: Query database based on auth.uid() (Supabase Auth)
  SELECT club_id INTO v_club_id
  FROM public.member_profiles
  WHERE auth_id = auth.uid()::text OR id::text = auth.uid()::text
  LIMIT 1;

  RETURN v_club_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user has any of the specified roles
CREATE OR REPLACE FUNCTION public.auth_has_role(VARIADIC p_roles text[])
RETURNS boolean AS $$
DECLARE
  v_user_role text;
  v_roles text[];
  v_member_id uuid;
BEGIN
  -- 1. Try to get role from JWT metadata (Clerk custom claims)
  BEGIN
    v_user_role := auth.jwt() -> 'metadata' ->> 'role';
  EXCEPTION WHEN OTHERS THEN
    v_user_role := NULL;
  END;

  IF v_user_role IS NOT NULL AND v_user_role = ANY(p_roles) THEN
    RETURN true;
  END IF;

  -- 2. Fallback: Query database based on auth.uid() (Supabase Auth)
  SELECT id INTO v_member_id
  FROM public.member_profiles
  WHERE auth_id = auth.uid()::text OR id::text = auth.uid()::text
  LIMIT 1;

  IF v_member_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.member_roles
      WHERE member_id = v_member_id 
        AND role = ANY(p_roles)
        AND deleted_at IS NULL
    );
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all 18 tables
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orientations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dovs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_website_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_jobs ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if any
DROP POLICY IF EXISTS "Public read districts" ON public.districts;
DROP POLICY IF EXISTS "Admin write districts" ON public.districts;
DROP POLICY IF EXISTS "Public read clubs" ON public.clubs;
DROP POLICY IF EXISTS "Admin write clubs" ON public.clubs;
DROP POLICY IF EXISTS "Members read profiles" ON public.member_profiles;
DROP POLICY IF EXISTS "Self edit profiles" ON public.member_profiles;
DROP POLICY IF EXISTS "Admin write profiles" ON public.member_profiles;

-- =========================================================================
-- districts Policies
-- =========================================================================
CREATE POLICY "Public read districts" ON public.districts 
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Admin write districts" ON public.districts 
  FOR ALL TO authenticated 
  USING (public.auth_has_role('District Admin', 'Super Admin'));

-- =========================================================================
-- clubs Policies
-- =========================================================================
CREATE POLICY "Public read clubs" ON public.clubs 
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Admin write clubs" ON public.clubs 
  FOR ALL TO authenticated 
  USING (public.auth_has_role('District Admin', 'Super Admin'))
  WITH CHECK (public.auth_has_role('District Admin', 'Super Admin'));

-- =========================================================================
-- member_profiles Policies
-- =========================================================================
CREATE POLICY "Members read profiles" ON public.member_profiles 
  FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "Self edit profiles" ON public.member_profiles 
  FOR UPDATE TO authenticated 
  USING (auth_id = auth.uid()::text OR id::text = auth.uid()::text)
  WITH CHECK (auth_id = auth.uid()::text OR id::text = auth.uid()::text);

CREATE POLICY "Admin write profiles" ON public.member_profiles 
  FOR ALL TO authenticated 
  USING (public.auth_has_role('District Admin', 'Super Admin'));

-- =========================================================================
-- member_roles Policies
-- =========================================================================
CREATE POLICY "Members read roles" ON public.member_roles 
  FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "Admin write roles" ON public.member_roles 
  FOR ALL TO authenticated 
  USING (public.auth_has_role('District Admin', 'Super Admin'));

-- =========================================================================
-- activities Policies
-- =========================================================================
CREATE POLICY "Public read published activities" ON public.activities 
  FOR SELECT USING (status = 'PUBLISHED' AND deleted_at IS NULL);

CREATE POLICY "Club members read draft activities" ON public.activities 
  FOR SELECT TO authenticated 
  USING (club_id = public.get_auth_club_id() AND deleted_at IS NULL);

CREATE POLICY "Club admin write activities" ON public.activities 
  FOR ALL TO authenticated 
  USING (
    (club_id = public.get_auth_club_id() AND public.auth_has_role('President', 'Secretary', 'Vice President', 'Board of Directors'))
    OR public.auth_has_role('District Admin', 'Super Admin')
  );

-- =========================================================================
-- registrations Policies
-- =========================================================================
CREATE POLICY "Members view registrations" ON public.registrations 
  FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "Members register themselves" ON public.registrations 
  FOR INSERT TO authenticated 
  WITH CHECK (
    member_id IN (SELECT id FROM public.member_profiles WHERE auth_id = auth.uid()::text OR id::text = auth.uid()::text)
  );

CREATE POLICY "Club admin manage registrations" ON public.registrations 
  FOR ALL TO authenticated 
  USING (
    activity_id IN (SELECT id FROM public.activities WHERE club_id = public.get_auth_club_id())
    OR public.auth_has_role('District Admin', 'Super Admin')
  );

-- =========================================================================
-- meetings Policies
-- =========================================================================
CREATE POLICY "Club members read meetings" ON public.meetings 
  FOR SELECT TO authenticated 
  USING (
    club_id = public.get_auth_club_id() 
    OR public.auth_has_role('District Admin', 'Super Admin', 'Reporting Team')
  );

CREATE POLICY "Club admin manage meetings" ON public.meetings 
  FOR ALL TO authenticated 
  USING (
    (club_id = public.get_auth_club_id() AND public.auth_has_role('President', 'Secretary'))
    OR public.auth_has_role('District Admin', 'Super Admin')
  );

-- =========================================================================
-- orientations, installations, dovs Policies
-- =========================================================================
CREATE POLICY "Club members read orientations" ON public.orientations 
  FOR SELECT TO authenticated 
  USING (
    club_id = public.get_auth_club_id() 
    OR public.auth_has_role('District Admin', 'Super Admin', 'Reporting Team')
  );

CREATE POLICY "Club admin manage orientations" ON public.orientations 
  FOR ALL TO authenticated 
  USING (
    (club_id = public.get_auth_club_id() AND public.auth_has_role('President', 'Secretary'))
    OR public.auth_has_role('District Admin', 'Super Admin')
  );

CREATE POLICY "Club members read installations" ON public.installations 
  FOR SELECT TO authenticated 
  USING (
    club_id = public.get_auth_club_id() 
    OR public.auth_has_role('District Admin', 'Super Admin', 'Reporting Team')
  );

CREATE POLICY "Club admin manage installations" ON public.installations 
  FOR ALL TO authenticated 
  USING (
    (club_id = public.get_auth_club_id() AND public.auth_has_role('President', 'Secretary'))
    OR public.auth_has_role('District Admin', 'Super Admin')
  );

CREATE POLICY "Club members read dovs" ON public.dovs 
  FOR SELECT TO authenticated 
  USING (
    club_id = public.get_auth_club_id() 
    OR public.auth_has_role('District Admin', 'Super Admin', 'Reporting Team')
  );

CREATE POLICY "Club admin manage dovs" ON public.dovs 
  FOR ALL TO authenticated 
  USING (
    (club_id = public.get_auth_club_id() AND public.auth_has_role('President', 'Secretary'))
    OR public.auth_has_role('District Admin', 'Super Admin')
  );

-- =========================================================================
-- point_ledgers Policies
-- =========================================================================
CREATE POLICY "Members view point ledgers" ON public.point_ledgers 
  FOR SELECT TO authenticated USING (deleted_at IS NULL);

CREATE POLICY "Admin manage point ledgers" ON public.point_ledgers 
  FOR ALL TO authenticated 
  USING (public.auth_has_role('District Admin', 'Super Admin'));

-- =========================================================================
-- notifications Policies
-- =========================================================================
CREATE POLICY "Self read write notifications" ON public.notifications 
  FOR ALL TO authenticated 
  USING (
    recipient_id IN (SELECT id FROM public.member_profiles WHERE auth_id = auth.uid()::text OR id::text = auth.uid()::text)
  );

-- =========================================================================
-- showcase_features, club_website_configs Policies
-- =========================================================================
CREATE POLICY "Public read showcase features" ON public.showcase_features 
  FOR SELECT USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Admin manage showcase features" ON public.showcase_features 
  FOR ALL TO authenticated 
  USING (public.auth_has_role('District Admin', 'Super Admin'));

CREATE POLICY "Public read configs" ON public.club_website_configs 
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Club admin manage configs" ON public.club_website_configs 
  FOR ALL TO authenticated 
  USING (
    (club_id = public.get_auth_club_id() AND public.auth_has_role('President', 'Secretary'))
    OR public.auth_has_role('District Admin', 'Super Admin')
  );
