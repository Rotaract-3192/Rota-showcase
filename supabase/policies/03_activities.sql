-- supabase/policies/03_activities.sql
-- Policies for activities, registrations, and showcase_features

-- ==========================================
-- Table: activities
-- ==========================================
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- SELECT: Public can see PUBLISHED activities. Authenticated members can see DRAFTs of their own club.
CREATE POLICY "Public can read published activities" ON activities FOR SELECT USING (
  status = 'PUBLISHED' OR is_admin() OR EXISTS (
    SELECT 1 FROM member_profiles mp
    WHERE mp.auth_id = auth.uid()::text AND mp.club_id = activities.club_id
  )
);

-- INSERT/UPDATE/DELETE: Club Leaders and Admins
CREATE POLICY "Club Leaders manage activities" ON activities FOR ALL USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM member_profiles mp
    JOIN member_roles mr ON mp.id = mr.member_id
    WHERE mp.auth_id = auth.uid()::text
    AND mp.club_id = activities.club_id
    AND mr.role IN ('President', 'Secretary', 'Vice President', 'Board of Directors')
  )
);

-- ==========================================
-- Table: registrations
-- ==========================================
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see their own registrations. Admins and Club Leaders can see all for their event.
CREATE POLICY "Users view own registrations" ON registrations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM member_profiles mp 
    WHERE mp.auth_id = auth.uid()::text AND mp.id = registrations.member_id
  ) OR is_admin() OR EXISTS (
    SELECT 1 FROM member_profiles my_profile
    JOIN activities act ON act.club_id = my_profile.club_id
    JOIN member_roles mr ON my_profile.id = mr.member_id
    WHERE my_profile.auth_id = auth.uid()::text
    AND act.id = registrations.activity_id
    AND mr.role IN ('President', 'Secretary', 'Vice President')
  )
);

-- INSERT: Users can register themselves
CREATE POLICY "Users can insert own registrations" ON registrations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM member_profiles mp 
    WHERE mp.auth_id = auth.uid()::text AND mp.id = registrations.member_id
  )
);

-- UPDATE/DELETE: Users can cancel own. Admins can manage all.
CREATE POLICY "Users can manage own registrations" ON registrations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM member_profiles mp 
    WHERE mp.auth_id = auth.uid()::text AND mp.id = registrations.member_id
  ) OR is_admin()
);

-- ==========================================
-- Table: showcase_features
-- ==========================================
ALTER TABLE showcase_features ENABLE ROW LEVEL SECURITY;

-- SELECT: Public
CREATE POLICY "Public view showcase" ON showcase_features FOR SELECT USING (is_active = TRUE);

-- ALL OTHER: District Admin and Publication Team
CREATE POLICY "Pub Team manages showcase" ON showcase_features FOR ALL USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM member_profiles mp
    JOIN member_roles mr ON mp.id = mr.member_id
    WHERE mp.auth_id = auth.uid()::text AND mr.role = 'Publication Team'
  )
);
