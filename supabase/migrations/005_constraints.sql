-- 005_constraints.sql
-- Adds explicit UNIQUE and CHECK constraints to maintain data integrity.
-- These unique constraints automatically generate a unique B-Tree index.

-- districts
ALTER TABLE districts DROP CONSTRAINT IF EXISTS unq_districts_number;
ALTER TABLE districts ADD CONSTRAINT unq_districts_number UNIQUE (number);

-- clubs
ALTER TABLE clubs DROP CONSTRAINT IF EXISTS unq_clubs_slug;
ALTER TABLE clubs ADD CONSTRAINT unq_clubs_slug UNIQUE (slug);

-- member_profiles
ALTER TABLE member_profiles DROP CONSTRAINT IF EXISTS unq_member_profiles_auth_id;
ALTER TABLE member_profiles DROP CONSTRAINT IF EXISTS unq_member_profiles_email;
ALTER TABLE member_profiles ADD CONSTRAINT unq_member_profiles_auth_id UNIQUE (auth_id);
ALTER TABLE member_profiles ADD CONSTRAINT unq_member_profiles_email UNIQUE (email);

-- activities
ALTER TABLE activities DROP CONSTRAINT IF EXISTS unq_activities_slug;
ALTER TABLE activities DROP CONSTRAINT IF EXISTS chk_activities_dates;
ALTER TABLE activities ADD CONSTRAINT unq_activities_slug UNIQUE (slug);
ALTER TABLE activities ADD CONSTRAINT chk_activities_dates CHECK (end_time >= start_time);

-- registrations
-- A member can only register once per activity
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS unq_registrations_activity_member;
ALTER TABLE registrations ADD CONSTRAINT unq_registrations_activity_member UNIQUE (activity_id, member_id);

-- club_website_configs
-- Ensure exactly one website config per club
ALTER TABLE club_website_configs DROP CONSTRAINT IF EXISTS unq_club_website_configs_club_id;
ALTER TABLE club_website_configs ADD CONSTRAINT unq_club_website_configs_club_id UNIQUE (club_id);

-- meetings
-- Prevent negative attendees
ALTER TABLE meetings DROP CONSTRAINT IF EXISTS chk_meetings_attendees;
ALTER TABLE meetings ADD CONSTRAINT chk_meetings_attendees CHECK (attendees_count >= 0);

-- point_ledgers
-- Points can be negative (penalties), but we ensure the reason is provided explicitly
ALTER TABLE point_ledgers DROP CONSTRAINT IF EXISTS chk_point_ledgers_reason_length;
ALTER TABLE point_ledgers ADD CONSTRAINT chk_point_ledgers_reason_length CHECK (char_length(trim(reason)) > 0);
