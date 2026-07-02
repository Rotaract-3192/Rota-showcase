-- supabase/policies/01_organization.sql
-- Policies for districts, clubs, and club_website_configs

-- Helper to check if user is a District/Super Admin
-- (Assumes Clerk ID is passed as auth.uid() string)
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM member_roles mr
    JOIN member_profiles mp ON mr.member_id = mp.id
    WHERE mp.auth_id = auth.uid()::text
    AND mr.role IN ('Super Admin', 'District Admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ==========================================
-- Table: districts
-- ==========================================
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- SELECT: Everyone (including public) can read district info
CREATE POLICY "Public can read districts" ON districts FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE: Only Admins
CREATE POLICY "Admins can insert districts" ON districts FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update districts" ON districts FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete districts" ON districts FOR DELETE USING (is_admin());

-- ==========================================
-- Table: clubs
-- ==========================================
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- SELECT: Everyone (including public) can read active clubs
CREATE POLICY "Public can read active clubs" ON clubs FOR SELECT USING (deleted_at IS NULL);

-- INSERT: Only Admins
CREATE POLICY "Admins can create clubs" ON clubs FOR INSERT WITH CHECK (is_admin());

-- UPDATE: Admins OR Club Presidents/Secretaries
CREATE POLICY "Admins and Club Leaders can update clubs" ON clubs FOR UPDATE USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM member_profiles mp
    JOIN member_roles mr ON mp.id = mr.member_id
    WHERE mp.auth_id = auth.uid()::text
    AND mp.club_id = clubs.id
    AND mr.role IN ('President', 'Secretary', 'Vice President')
  )
);

-- DELETE: Only Admins
CREATE POLICY "Admins can delete clubs" ON clubs FOR DELETE USING (is_admin());

-- ==========================================
-- Table: club_website_configs
-- ==========================================
ALTER TABLE club_website_configs ENABLE ROW LEVEL SECURITY;

-- SELECT: Public can read
CREATE POLICY "Public can read club configs" ON club_website_configs FOR SELECT USING (true);

-- INSERT/UPDATE: Admins OR Club Leaders
CREATE POLICY "Club Leaders can manage website configs" ON club_website_configs FOR ALL USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM member_profiles mp
    JOIN member_roles mr ON mp.id = mr.member_id
    WHERE mp.auth_id = auth.uid()::text
    AND mp.club_id = club_website_configs.club_id
    AND mr.role IN ('President', 'Secretary', 'Vice President', 'Publication Team')
  )
);
