-- supabase/policies/02_identity.sql
-- Policies for member_profiles and member_roles

-- ==========================================
-- Table: member_profiles
-- ==========================================
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: 
-- 1. User can read their own profile.
-- 2. Admins can read all.
-- 3. Club Leaders can read profiles in their club.
CREATE POLICY "Users can view relevant profiles" ON member_profiles FOR SELECT USING (
  auth_id = auth.uid()::text 
  OR is_admin() 
  OR EXISTS (
    SELECT 1 FROM member_profiles my_profile
    JOIN member_roles mr ON my_profile.id = mr.member_id
    WHERE my_profile.auth_id = auth.uid()::text
    AND my_profile.club_id = member_profiles.club_id
    AND mr.role IN ('President', 'Secretary', 'Vice President', 'District Team')
  )
);

-- INSERT: Triggered by secure webhook from Clerk bypassing RLS, or Admin.
CREATE POLICY "Admins can insert profiles" ON member_profiles FOR INSERT WITH CHECK (is_admin());

-- UPDATE: Users can update their own non-sensitive fields. Admins can update all.
CREATE POLICY "Users can update own profile" ON member_profiles FOR UPDATE USING (
  auth_id = auth.uid()::text OR is_admin()
);

-- DELETE: Only Admins can soft-delete or anonymize
CREATE POLICY "Admins can delete profiles" ON member_profiles FOR DELETE USING (is_admin());

-- ==========================================
-- Table: member_roles
-- ==========================================
ALTER TABLE member_roles ENABLE ROW LEVEL SECURITY;

-- SELECT: Public can view roles (e.g. identifying the President on a club page)
CREATE POLICY "Public can view roles" ON member_roles FOR SELECT USING (deleted_at IS NULL);

-- INSERT/UPDATE/DELETE: Only Admins OR District Team
CREATE POLICY "District and Admins manage roles" ON member_roles FOR ALL USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM member_profiles mp
    JOIN member_roles mr ON mp.id = mr.member_id
    WHERE mp.auth_id = auth.uid()::text
    AND mr.role = 'District Team'
  )
);
