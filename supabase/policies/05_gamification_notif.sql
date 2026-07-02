-- supabase/policies/05_gamification_notif.sql
-- Policies for point_ledgers and notifications

-- ==========================================
-- Table: point_ledgers
-- ==========================================
ALTER TABLE point_ledgers ENABLE ROW LEVEL SECURITY;

-- SELECT: Public can view points (needed for public leaderboard)
CREATE POLICY "Public view points" ON point_ledgers FOR SELECT USING (deleted_at IS NULL);

-- INSERT/UPDATE/DELETE: System API or Admins ONLY. 
-- Regular users NEVER manipulate points directly.
CREATE POLICY "Admins manage points" ON point_ledgers FOR ALL USING (is_admin());

-- Note: leaderboard_rankings is a Materialized View and does not support standard RLS.
-- Access is controlled at the API layer.

-- ==========================================
-- Table: notifications
-- ==========================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can ONLY see their own notifications
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM member_profiles mp 
    WHERE mp.auth_id = auth.uid()::text AND mp.id = notifications.recipient_id
  )
);

-- UPDATE: Users can mark their own as read
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM member_profiles mp 
    WHERE mp.auth_id = auth.uid()::text AND mp.id = notifications.recipient_id
  )
);

-- INSERT/DELETE: System or Admins only
CREATE POLICY "System generates notifications" ON notifications FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "System deletes notifications" ON notifications FOR DELETE USING (is_admin());
