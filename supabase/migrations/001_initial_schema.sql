-- 001_initial_schema.sql
-- Creates all base tables and updated_at triggers.
-- Foreign keys, indexes, enums, and constraints are deferred to subsequent migrations.

-- Ensure pgcrypto is available for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Trigger function for updated_at tracking
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. districts
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    number VARCHAR(50) NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_districts_updated_at ON districts;
CREATE TRIGGER set_districts_updated_at BEFORE UPDATE ON districts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. clubs
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    founded_date DATE,
    charter_date DATE,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_clubs_updated_at ON clubs;
CREATE TRIGGER set_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. member_profiles
CREATE TABLE IF NOT EXISTS member_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id VARCHAR(255) NOT NULL,
    club_id UUID,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    blood_group VARCHAR(10),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_member_profiles_updated_at ON member_profiles;
CREATE TRIGGER set_member_profiles_updated_at BEFORE UPDATE ON member_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. member_roles
CREATE TABLE IF NOT EXISTS member_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    club_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_member_roles_updated_at ON member_roles;
CREATE TRIGGER set_member_roles_updated_at BEFORE UPDATE ON member_roles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. activities
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Will be mapped to Enum in 004
    description TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    venue VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_activities_updated_at ON activities;
CREATE TRIGGER set_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6. registrations
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL,
    member_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_registrations_updated_at ON registrations;
CREATE TRIGGER set_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. meetings
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL,
    date DATE NOT NULL,
    minutes_text TEXT,
    attendees_count INT DEFAULT 0,
    audio_url TEXT,
    transcript_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_meetings_updated_at ON meetings;
CREATE TRIGGER set_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 8. orientations
CREATE TABLE IF NOT EXISTS orientations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL,
    date DATE NOT NULL,
    speaker_name VARCHAR(255),
    new_members_inducted INT DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_orientations_updated_at ON orientations;
CREATE TRIGGER set_orientations_updated_at BEFORE UPDATE ON orientations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 9. installations
CREATE TABLE IF NOT EXISTS installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL,
    date DATE NOT NULL,
    venue VARCHAR(255),
    incoming_president_id UUID NOT NULL,
    chief_guest VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_installations_updated_at ON installations;
CREATE TRIGGER set_installations_updated_at BEFORE UPDATE ON installations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 10. dovs
CREATE TABLE IF NOT EXISTS dovs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL,
    visiting_official_id UUID NOT NULL,
    date DATE NOT NULL,
    evaluation_score INT,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_dovs_updated_at ON dovs;
CREATE TRIGGER set_dovs_updated_at BEFORE UPDATE ON dovs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 11. point_ledgers
CREATE TABLE IF NOT EXISTS point_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL,
    member_id UUID NOT NULL,
    points INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_point_ledgers_updated_at ON point_ledgers;
CREATE TRIGGER set_point_ledgers_updated_at BEFORE UPDATE ON point_ledgers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 12. notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_notifications_updated_at ON notifications;
CREATE TRIGGER set_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 13. analytics_events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(100) NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_analytics_events_updated_at ON analytics_events;
CREATE TRIGGER set_analytics_events_updated_at BEFORE UPDATE ON analytics_events FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 14. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_audit_logs_updated_at ON audit_logs;
CREATE TRIGGER set_audit_logs_updated_at BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 15. showcase_features
CREATE TABLE IF NOT EXISTS showcase_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    highlight_image_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_showcase_features_updated_at ON showcase_features;
CREATE TRIGGER set_showcase_features_updated_at BEFORE UPDATE ON showcase_features FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 16. club_website_configs
CREATE TABLE IF NOT EXISTS club_website_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL,
    theme_color VARCHAR(20) DEFAULT '#000000',
    hero_text TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_club_website_configs_updated_at ON club_website_configs;
CREATE TRIGGER set_club_website_configs_updated_at BEFORE UPDATE ON club_website_configs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 17. ai_jobs
CREATE TABLE IF NOT EXISTS ai_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    result_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_ai_jobs_updated_at ON ai_jobs;
CREATE TRIGGER set_ai_jobs_updated_at BEFORE UPDATE ON ai_jobs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 18. cron_jobs
CREATE TABLE IF NOT EXISTS cron_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_name VARCHAR(100) NOT NULL,
    schedule VARCHAR(100) NOT NULL,
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
DROP TRIGGER IF EXISTS set_cron_jobs_updated_at ON cron_jobs;
CREATE TRIGGER set_cron_jobs_updated_at BEFORE UPDATE ON cron_jobs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Ensure deleted_at exists for view creation fallback
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE point_ledgers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Materialized View: leaderboard_rankings
DROP MATERIALIZED VIEW IF EXISTS leaderboard_rankings;
CREATE MATERIALIZED VIEW leaderboard_rankings AS
SELECT 
    c.id AS club_id, 
    c.name AS club_name, 
    COALESCE(SUM(p.points), 0) AS total_points
FROM 
    clubs c
LEFT JOIN 
    point_ledgers p ON c.id::text = p.club_id::text AND p.deleted_at IS NULL
WHERE 
    c.deleted_at IS NULL
GROUP BY 
    c.id, c.name;
