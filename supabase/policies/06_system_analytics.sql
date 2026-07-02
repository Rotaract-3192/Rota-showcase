-- supabase/policies/06_system_analytics.sql
-- Policies for audit_logs, analytics_events, cron_jobs, ai_jobs

-- ==========================================
-- Table: analytics_events
-- ==========================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- SELECT: Only Admins / Reporting Team
CREATE POLICY "Reporting Team views analytics" ON analytics_events FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM member_profiles mp
    JOIN member_roles mr ON mp.id = mr.member_id
    WHERE mp.auth_id = auth.uid()::text AND mr.role = 'Reporting Team'
  )
);

-- INSERT: Anyone can log an event (Frontend telemetry)
CREATE POLICY "Anyone can log analytics" ON analytics_events FOR INSERT WITH CHECK (true);

-- UPDATE/DELETE: Blocked for everyone to preserve telemetry integrity
-- Handled implicitly by omitting UPDATE/DELETE policies

-- ==========================================
-- Table: audit_logs
-- ==========================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: Only Admins
CREATE POLICY "Admins view audit logs" ON audit_logs FOR SELECT USING (is_admin());

-- INSERT: System trigger bypassing RLS, or Admin
CREATE POLICY "Admins insert audit logs" ON audit_logs FOR INSERT WITH CHECK (is_admin());

-- UPDATE/DELETE: Strictly blocked to ensure audit trail immutability

-- ==========================================
-- Table: cron_jobs
-- ==========================================
ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;
-- Completely locked down to Super Admin
CREATE POLICY "Super Admin manages cron" ON cron_jobs FOR ALL USING (is_admin());

-- ==========================================
-- Table: ai_jobs
-- ==========================================
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;
-- Mostly internal system operations, but Admins can debug
CREATE POLICY "Super Admin manages ai_jobs" ON ai_jobs FOR ALL USING (is_admin());
