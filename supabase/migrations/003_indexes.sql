-- 003_indexes.sql
-- Creates B-Tree and partial indexes for high-performance querying and soft-deletion filtering.
-- Note: Redundant indexes on unique constraint columns (e.g., auth_id, slug, email) are omitted here 
-- as they will be automatically generated in 005_constraints.sql.

-- 1. districts
CREATE INDEX IF NOT EXISTS idx_districts_deleted_at ON districts(id) WHERE deleted_at IS NULL;

-- 2. clubs
CREATE INDEX IF NOT EXISTS idx_clubs_district_id ON clubs(district_id);
CREATE INDEX IF NOT EXISTS idx_clubs_status ON clubs(status);
CREATE INDEX IF NOT EXISTS idx_clubs_deleted_at ON clubs(id) WHERE deleted_at IS NULL;

-- 3. member_profiles
CREATE INDEX IF NOT EXISTS idx_member_profiles_club_id ON member_profiles(club_id);
CREATE INDEX IF NOT EXISTS idx_member_profiles_deleted_at ON member_profiles(id) WHERE deleted_at IS NULL;

-- 4. member_roles
CREATE INDEX IF NOT EXISTS idx_member_roles_member_id ON member_roles(member_id);
CREATE INDEX IF NOT EXISTS idx_member_roles_club_id ON member_roles(club_id);

-- 5. activities
CREATE INDEX IF NOT EXISTS idx_activities_club_id ON activities(club_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_time ON activities(start_time);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_deleted_at ON activities(id) WHERE deleted_at IS NULL;

-- 6. registrations
CREATE INDEX IF NOT EXISTS idx_registrations_member_id ON registrations(member_id);

-- 7. meetings
CREATE INDEX IF NOT EXISTS idx_meetings_club_id ON meetings(club_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);

-- 8. orientations
CREATE INDEX IF NOT EXISTS idx_orientations_club_id ON orientations(club_id);

-- 9. installations
CREATE INDEX IF NOT EXISTS idx_installations_club_id ON installations(club_id);

-- 10. dovs
CREATE INDEX IF NOT EXISTS idx_dovs_club_id ON dovs(club_id);
CREATE INDEX IF NOT EXISTS idx_dovs_visiting_official_id ON dovs(visiting_official_id);

-- 11. point_ledgers
CREATE INDEX IF NOT EXISTS idx_point_ledgers_club_id ON point_ledgers(club_id);
CREATE INDEX IF NOT EXISTS idx_point_ledgers_member_id ON point_ledgers(member_id);

-- 12. notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON notifications(recipient_id) WHERE is_read = FALSE;

-- 13. analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);

-- 14. audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- 15. showcase_features
CREATE INDEX IF NOT EXISTS idx_showcase_features_activity_id ON showcase_features(activity_id);

-- 17. ai_jobs
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_resource ON ai_jobs(resource_type, resource_id);

-- Materialized View Index (Creates index for view generated in 001)
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_rankings_club_id ON leaderboard_rankings(club_id);
