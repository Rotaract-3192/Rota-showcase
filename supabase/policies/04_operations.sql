-- supabase/policies/04_operations.sql
-- Policies for internal club operations (meetings, orientations, installations, dovs)

-- Generic helper for Club Admin check
CREATE OR REPLACE FUNCTION is_club_admin(target_club_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM member_profiles mp
    JOIN member_roles mr ON mp.id = mr.member_id
    WHERE mp.auth_id = auth.uid()::text
    AND mp.club_id = target_club_id
    AND mr.role IN ('President', 'Secretary', 'Vice President')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ==========================================
-- Table: meetings
-- ==========================================
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- SELECT: Club Members and Admins
CREATE POLICY "Members can view club meetings" ON meetings FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM member_profiles mp WHERE mp.auth_id = auth.uid()::text AND mp.club_id = meetings.club_id
  )
);

-- ALL OTHER: Club Admins only
CREATE POLICY "Club Admins manage meetings" ON meetings FOR ALL USING (
  is_admin() OR is_club_admin(meetings.club_id)
);

-- ==========================================
-- Table: orientations
-- ==========================================
ALTER TABLE orientations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view orientations" ON orientations FOR SELECT USING (
  is_admin() OR EXISTS (SELECT 1 FROM member_profiles mp WHERE mp.auth_id = auth.uid()::text AND mp.club_id = orientations.club_id)
);
CREATE POLICY "Club Admins manage orientations" ON orientations FOR ALL USING (
  is_admin() OR is_club_admin(orientations.club_id)
);

-- ==========================================
-- Table: installations
-- ==========================================
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view installations" ON installations FOR SELECT USING (
  is_admin() OR EXISTS (SELECT 1 FROM member_profiles mp WHERE mp.auth_id = auth.uid()::text AND mp.club_id = installations.club_id)
);
CREATE POLICY "Club Admins manage installations" ON installations FOR ALL USING (
  is_admin() OR is_club_admin(installations.club_id)
);

-- ==========================================
-- Table: dovs
-- ==========================================
ALTER TABLE dovs ENABLE ROW LEVEL SECURITY;

-- SELECT: Club Members and District Team
CREATE POLICY "Members view DOVs" ON dovs FOR SELECT USING (
  is_admin() OR EXISTS (SELECT 1 FROM member_profiles mp WHERE mp.auth_id = auth.uid()::text AND mp.club_id = dovs.club_id)
);

-- INSERT/UPDATE/DELETE: Only District Team (Officials evaluating the club)
CREATE POLICY "District Team manages DOVs" ON dovs FOR ALL USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM member_profiles mp
    JOIN member_roles mr ON mp.id = mr.member_id
    WHERE mp.auth_id = auth.uid()::text AND mr.role = 'District Team'
  )
);
